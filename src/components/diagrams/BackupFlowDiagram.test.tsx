import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { BackupFlowDiagram, backupFlowScenarios } from './BackupFlowDiagram'

const labels = {
  'org-policy': 'Organizations 백업 정책',
  ec2: 'EC2 인스턴스', ebs: 'EBS 볼륨', rds: 'RDS', dynamodb: 'DynamoDB', s3: 'S3',
  plan: '백업 계획', 'restore-test': '복원 테스트 계획', audit: 'Backup Audit Manager',
  'other-region': '다른 리전', 'other-account': '다른 계정',
}

const expectedScenarios = [
  { id: 'b1', label: '보존 기간', nodes: ['rds', 'dynamodb', 'plan'], paths: ['rds-plan', 'dynamodb-plan'], source: 'backup-long-term-retention' },
  { id: 'b2', label: '대상 지정', nodes: ['ec2', 'plan'], paths: ['ec2-plan'], source: 'backup-ec2-resource-assignment' },
  { id: 'b3', label: '조직 전체', nodes: ['org-policy', 'plan'], paths: ['org-policy-plan'], source: 'organizations-backup-policy' },
  { id: 'b4', label: '연속 백업', nodes: ['s3', 'plan'], paths: ['s3-plan'], source: 'backup-s3-continuous-backup' },
  { id: 'b5', label: '사본 위치', nodes: ['plan', 'other-region', 'other-account'], paths: ['plan-other-region', 'plan-other-account'], source: 'backup-cross-account-copy' },
  { id: 'b6', label: '복원 검증', nodes: ['plan', 'restore-test'], paths: ['plan-restore-test'], source: 'backup-restore-testing-plan' },
  { id: 'b7', label: '감사', nodes: ['plan', 'audit'], paths: ['plan-audit'], source: 'backup-audit-manager' },
]

function diagram() {
  return screen.getByRole('img', { name: 'AWS Backup 백업 흐름' })
}

async function selectScenario(label: string) {
  await act(async () => {
    await userEvent.click(screen.getByRole('button', { name: label }))
  })
}

function readBox(rect: Element) {
  return {
    id: rect.parentElement?.getAttribute('data-node') ?? rect.getAttribute('data-group') ?? '',
    x: Number(rect.getAttribute('x')),
    y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')),
    height: Number(rect.getAttribute('height')),
  }
}

describe('BackupFlowDiagram', () => {
  it('처음에는 11개 노드가 모두 선명하고 경로가 없다', () => {
    render(<BackupFlowDiagram />)

    const nodes = diagram().querySelectorAll('[data-node]')
    expect(nodes).toHaveLength(11)
    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual(Object.keys(labels).sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
  })

  it.each(expectedScenarios)('$label은 해당 노드와 방향의 경로만 보여주고 JSON 캡션을 읽는다', async (scenario) => {
    const { container } = render(<BackupFlowDiagram />)
    await selectScenario(scenario.label)

    for (const node of diagram().querySelectorAll('[data-node]')) {
      expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node') ?? '') ? '1' : '0.25')
    }
    for (const group of diagram().querySelectorAll('[data-group]')) {
      expect(group.closest('[opacity]')).toBeNull()
    }
    const paths = Array.from(diagram().querySelectorAll('[data-path]'))
    expect(paths.map((path) => path.getAttribute('data-path')).sort()).toEqual([...scenario.paths].sort())
    for (const path of paths) {
      expect(path).toHaveAttribute('stroke-width', '2')
      expect(path).toHaveAttribute('marker-end', `url(#${diagram().querySelector('marker')!.id})`)
      expect(path.getAttribute('d')).toMatch(/^M/)
      expect(path).toHaveClass('stroke-title')
    }
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    const wording = visualsByTopicId['backup-disaster-recovery'].diagrams['backup-flow'].scenarios.find(({ id }) => id === scenario.id)!
    expect(container.querySelector('figcaption')!.textContent).toBe(wording.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  })

  it('대상 지정에서는 EBS 볼륨을 흐리게 두고 EC2 인스턴스에서 경로를 시작한다', async () => {
    render(<BackupFlowDiagram />)
    await selectScenario('대상 지정')

    expect(diagram().querySelector('[data-node="ebs"]')).toHaveAttribute('opacity', '0.25')
    expect(diagram().querySelector('[data-node="ec2"]')).toHaveAttribute('opacity', '1')
    const ec2 = readBox(diagram().querySelector('[data-node="ec2"] rect')!)
    const start = diagram().querySelector('[data-path="ec2-plan"]')!.getAttribute('d')!.match(/^M(\d+) (\d+)/)!
    const [, x, y] = start.map(Number)
    expect(x === ec2.x || x === ec2.x + ec2.width || y === ec2.y || y === ec2.y + ec2.height).toBe(true)
    expect(x).toBeGreaterThanOrEqual(ec2.x)
    expect(x).toBeLessThanOrEqual(ec2.x + ec2.width)
    expect(y).toBeGreaterThanOrEqual(ec2.y)
    expect(y).toBeLessThanOrEqual(ec2.y + ec2.height)
  })

  it('전체로 돌아오면 강조와 경로를 지우고 안내 캡션을 복원한다', async () => {
    const { container } = render(<BackupFlowDiagram />)
    await selectScenario('사본 위치')
    await selectScenario('전체')

    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(visualsByTopicId['backup-disaster-recovery'].diagrams['backup-flow'].idleCaption)
  })

  it('모든 상자가 폭 280의 viewBox 안에 있고 SVG는 좌측 정렬·최대 380px이다', () => {
    render(<BackupFlowDiagram />)
    const viewBox = diagram().getAttribute('viewBox')!.split(' ').map(Number)
    const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)

    expect(viewBox.slice(0, 3)).toEqual([0, 0, 280])
    expect(boxes).toHaveLength(14)
    expect(boxesOutsideViewBox(boxes, [0, 0, 280, viewBox[3]])).toEqual([])
    expect(diagram().parentElement).toHaveClass('w-full', 'max-w-[380px]', '-mx-4', 'sm:mx-0', 'max-sm:w-[calc(100%+2rem)]')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
  })

  it('라벨 11개를 줄이지 않고 글자 크기 10과 여백 12로 노드 안에 넣는다', () => {
    render(<BackupFlowDiagram />)

    for (const [id, label] of Object.entries(labels)) {
      const node = diagram().querySelector(`[data-node="${id}"]`)!
      const text = node.querySelector('text')!
      const box = readBox(node.querySelector('rect')!)
      expect(text.textContent).toBe(label)
      expect(text).toHaveAttribute('font-size', '10')
      expect(estimateTextWidth(label, 10) + 12, label).toBeLessThanOrEqual(box.width)
    }
    for (const id of ['org-policy', 'audit']) {
      expect(readBox(diagram().querySelector(`[data-node="${id}"] rect`)!).width).toBe(240)
    }
  })

  it('자원·백업 기능·사본이 각 그룹 안에 있고 조직 정책은 그룹 밖 위에 있다', () => {
    render(<BackupFlowDiagram />)
    const groupBox = (id: string) => readBox(diagram().querySelector(`[data-group="${id}"]`)!)

    for (const [groupId, ids] of Object.entries({
      source: ['ec2', 'ebs', 'rds', 'dynamodb', 's3'],
      backup: ['plan', 'restore-test', 'audit'],
      copies: ['other-region', 'other-account'],
    })) {
      const group = groupBox(groupId)
      const boxes = ids.map((id) => readBox(diagram().querySelector(`[data-node="${id}"] rect`)!))
      expect(boxesOutsideViewBox(boxes, [group.x, group.y, group.width, group.height])).toEqual([])
    }
    const org = readBox(diagram().querySelector('[data-node="org-policy"] rect')!)
    expect(org.y + org.height).toBeLessThan(groupBox('source').y)
    expect(groupBox('source').y + groupBox('source').height).toBeLessThan(groupBox('backup').y)
    expect(groupBox('backup').y + groupBox('backup').height).toBeLessThan(groupBox('copies').y)
  })

  it('JSON과 시나리오 id 집합이 같고 일곱 판단의 근거를 명시한다', () => {
    const visuals = visualsByTopicId['backup-disaster-recovery']
    const text = visuals.diagrams['backup-flow']

    expect(visuals.glossary).toEqual([])
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual({ source: '원본 계정', backup: 'AWS Backup', copies: '사본' })
    const ids = backupFlowScenarios.map(({ id }) => id).sort()
    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.sources).toEqual(['backup-disaster-recovery.backup', 'backup-disaster-recovery.backup-long-term-retention'])
    for (const scenario of expectedScenarios) {
      expect(text.scenarios.find(({ id }) => id === scenario.id)?.sources).toEqual([`backup-disaster-recovery.${scenario.source}`])
    }
  })

  it('JSON 문구를 표시하고 파랑은 관리 기능에만 쓰며 볼트와 다른 강조색을 넣지 않는다', async () => {
    const { container } = render(<BackupFlowDiagram />)
    const text = visualsByTopicId['backup-disaster-recovery'].diagrams['backup-flow']

    expect(screen.getByRole('figure', { name: text.label })).toBeInTheDocument()
    expect(diagram()).toHaveAttribute('aria-label', text.svgLabel)
    expect(screen.getByText(text.legend!)).toBeInTheDocument()
    for (const label of Object.values(text.groups!)) expect(screen.getByText(label)).toBeInTheDocument()
    for (const node of diagram().querySelectorAll('[data-node]')) {
      const managed = ['org-policy', 'plan', 'restore-test', 'audit'].includes(node.getAttribute('data-node')!)
      expect(node.querySelector('rect')).toHaveClass(managed ? 'stroke-diagram-managed' : 'stroke-disabled')
    }
    expect(container.innerHTML).not.toMatch(/diagram-resource|(?:stroke|fill|text|bg)-red/)
    expect(container).not.toHaveTextContent('볼트')
    for (const scenario of expectedScenarios) {
      await selectScenario(scenario.label)
      expect(container).not.toHaveTextContent('볼트')
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 백업 블록 끝의 감사 개념 본문 뒤에만 도식을 붙인다', (headingLevel) => {
    const concepts = topics.find(({ id }) => id === 'backup-disaster-recovery')!.concepts.slice(0, 8)
    render(<ConceptList concepts={concepts} headingLevel={headingLevel} />)

    const figure = screen.getByRole('figure', { name: 'AWS Backup 백업 흐름 도식' })
    expect(figure.closest('article')).toHaveAttribute('id', 'backup-disaster-recovery.backup-audit-manager')
    expect(figure.previousElementSibling?.textContent).toBe(concepts[7].paragraphs.join(''))
    expect(screen.getAllByRole('img')).toHaveLength(1)
  })

  describe('가로형 (768px 이상)', () => {
    const stages = [
      { id: 'source', label: '원본 계정', nodes: ['ec2', 'ebs', 'rds', 'dynamodb', 's3'] },
      { id: 'backup', label: 'AWS Backup', nodes: ['audit', 'plan', 'restore-test'] },
      { id: 'copies', label: '사본', nodes: ['other-region', 'other-account'] },
    ]

    function mockMatchMedia(matches: boolean) {
      const listeners = new Set<(event: MediaQueryListEvent) => void>()
      const mediaQuery = {
        matches,
        media: WIDE_DIAGRAM_QUERY,
        addEventListener: vi.fn((type: string, listener: (event: MediaQueryListEvent) => void) => {
          if (type === 'change') listeners.add(listener)
        }),
        removeEventListener: vi.fn((type: string, listener: (event: MediaQueryListEvent) => void) => {
          if (type === 'change') listeners.delete(listener)
        }),
      }
      vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery))

      return {
        change(nextMatches: boolean) {
          mediaQuery.matches = nextMatches
          const event = Object.assign(new Event('change'), {
            matches: nextMatches,
            media: mediaQuery.media,
          })
          listeners.forEach((listener) => listener(event))
        },
      }
    }

    function ids(selector: string, attribute: string) {
      return Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)).sort()
    }

    async function collectPathIds() {
      const found = new Set<string>()
      for (const { label } of expectedScenarios) {
        await selectScenario(label)
        for (const path of diagram().querySelectorAll('[data-path]')) found.add(path.getAttribute('data-path')!)
      }
      return [...found].sort()
    }

    const nodeBox = (id: string) => readBox(diagram().querySelector(`[data-node="${id}"] rect`)!)
    const groupBox = (id: string) => readBox(diagram().querySelector(`[data-group="${id}"]`)!)

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×340 viewBox를 w-full 래퍼 하나로 그리고 SVG 속성과 화살표를 유지한다', () => {
      render(<BackupFlowDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 340')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·그룹 id 집합과 시나리오로 나타나는 경로 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<BackupFlowDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 556')
      const tallNodes = ids('[data-node]', 'data-node')
      const tallGroups = ids('[data-group]', 'data-group')
      const tallPaths = await collectPathIds()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 340')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(tallNodes).toEqual(Object.keys(labels).sort())
      expect(ids('[data-group]', 'data-group')).toEqual(tallGroups)
      expect(tallGroups).toEqual(['backup', 'copies', 'source'])
      expect(tallPaths).toHaveLength(9)
      expect(await collectPathIds()).toEqual(tallPaths)
    })

    it('노드 11개와 그룹 3개의 모든 rect가 440×340 viewBox 안에 있다', () => {
      render(<BackupFlowDiagram />)
      const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)

      expect(boxes).toHaveLength(14)
      expect(boxesOutsideViewBox(boxes, [0, 0, 440, 340])).toEqual([])
    })

    it('노드 라벨은 크기 10과 여백 12로, 그룹 라벨은 크기 9로 자기 박스 오른쪽 끝 안에 들어간다', () => {
      render(<BackupFlowDiagram />)

      for (const [id, label] of Object.entries(labels)) {
        const node = diagram().querySelector(`[data-node="${id}"]`)!
        const box = nodeBox(id)
        expect(node.querySelector('text')!.textContent).toBe(label)
        expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
        expect(box.height).toBe(32)
        expect(estimateTextWidth(label, 10) + 12, label).toBeLessThanOrEqual(box.width)
      }

      const groupLabels = Array.from(diagram().querySelectorAll('g.fill-muted > text'))
      expect(groupLabels).toHaveLength(3)
      for (const stage of stages) {
        const box = groupBox(stage.id)
        const groupLabel = groupLabels.find((element) => element.textContent === stage.label)!
        expect(groupLabel.closest('[font-size]')).toHaveAttribute('font-size', '9')
        const x = Number(groupLabel.getAttribute('x'))
        const y = Number(groupLabel.getAttribute('y'))
        expect(x, stage.label).toBeGreaterThan(box.x)
        expect(y, stage.label).toBeGreaterThan(box.y)
        expect(x + estimateTextWidth(stage.label, 9), stage.label).toBeLessThanOrEqual(box.x + box.width)
      }
    })

    it.each(expectedScenarios)('$label은 세로형과 같은 노드·경로·캡션을 보인다', async (scenario) => {
      const { container } = render(<BackupFlowDiagram />)
      await selectScenario(scenario.label)

      for (const node of diagram().querySelectorAll('[data-node]')) {
        expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node') ?? '') ? '1' : '0.25')
      }
      for (const group of diagram().querySelectorAll('[data-group]')) {
        expect(group.closest('[opacity]')).toBeNull()
      }
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path')).sort()).toEqual([...scenario.paths].sort())
      for (const path of paths) {
        expect(path.getAttribute('d')).toMatch(/^M\d+ \d+( [HV]\d+)+$/)
        expect(path).toHaveAttribute('stroke-width', '2')
        expect(path).toHaveAttribute('marker-end', `url(#${diagram().querySelector('marker')!.id})`)
        expect(path).toHaveClass('stroke-title')
      }
      expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
      const wording = visualsByTopicId['backup-disaster-recovery'].diagrams['backup-flow'].scenarios.find(({ id }) => id === scenario.id)!
      expect(container.querySelector('figcaption')!.textContent).toBe(wording.caption)
      expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')

      await selectScenario('전체')

      for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
      expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
      expect(container.querySelector('figcaption')!.textContent).toBe(visualsByTopicId['backup-disaster-recovery'].diagrams['backup-flow'].idleCaption)
    })

    it('자원·백업 기능·사본이 각 그룹 안에 있고 조직 정책은 그룹 밖 위에 있다', () => {
      render(<BackupFlowDiagram />)

      for (const stage of stages) {
        const group = groupBox(stage.id)
        expect(boxesOutsideViewBox(stage.nodes.map(nodeBox), [group.x, group.y, group.width, group.height]), stage.id).toEqual([])
      }
      const org = nodeBox('org-policy')
      expect(org.y + org.height).toBeLessThan(groupBox('source').y)
      expect(groupBox('source').y + groupBox('source').height).toBeLessThan(groupBox('backup').y)
      expect(groupBox('backup').y + groupBox('backup').height).toBeLessThan(groupBox('copies').y)
    })

    it('대상 지정에서는 EBS 볼륨을 흐리게 두고 EC2 인스턴스에서 경로를 시작한다', async () => {
      render(<BackupFlowDiagram />)
      await selectScenario('대상 지정')

      expect(diagram().querySelector('[data-node="ebs"]')).toHaveAttribute('opacity', '0.25')
      expect(diagram().querySelector('[data-node="ec2"]')).toHaveAttribute('opacity', '1')
      const ec2 = nodeBox('ec2')
      const start = diagram().querySelector('[data-path="ec2-plan"]')!.getAttribute('d')!.match(/^M(\d+) (\d+)/)!
      const [, x, y] = start.map(Number)
      expect(x === ec2.x || x === ec2.x + ec2.width || y === ec2.y || y === ec2.y + ec2.height).toBe(true)
      expect(x).toBeGreaterThanOrEqual(ec2.x)
      expect(x).toBeLessThanOrEqual(ec2.x + ec2.width)
      expect(y).toBeGreaterThanOrEqual(ec2.y)
      expect(y).toBeLessThanOrEqual(ec2.y + ec2.height)
    })

    it('세 단계가 위에서 아래로 겹치지 않게 쌓이고 단계 안의 노드는 같은 y에 가로로 선다', () => {
      render(<BackupFlowDiagram />)

      let previousBottom = 0
      for (const stage of stages) {
        const box = groupBox(stage.id)
        expect(box.y, stage.id).toBeGreaterThan(previousBottom)
        previousBottom = box.y + box.height
        const nodes = stage.nodes.map(nodeBox).sort((a, b) => a.x - b.x)
        expect(new Set(nodes.map((node) => node.y)).size, stage.id).toBe(1)
        for (let i = 1; i < nodes.length; i++) {
          expect(nodes[i - 1].x + nodes[i - 1].width, `${nodes[i - 1].id}·${nodes[i].id}`).toBeLessThan(nodes[i].x)
        }
      }
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<BackupFlowDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 556')
      await selectScenario('사본 위치')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '사본 위치' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(ids('[data-path]', 'data-path')).toEqual(['plan-other-account', 'plan-other-region'])
    })
  })
})
