import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { Route53HybridDnsDiagram, route53HybridDnsScenarios, paths as hybridPaths } from './Route53HybridDnsDiagram'

const labels = {
  'onprem-dns': '사내 DNS 서버',
  'onprem-server': '사내 서버',
  outbound: '아웃바운드 엔드포인트',
  inbound: '인바운드 엔드포인트',
  'ec2-a': 'EC2',
  'ec2-b': 'EC2',
  phz: '프라이빗 호스팅 영역',
}
const nodeColors: Record<string, string> = {
  'onprem-dns': 'stroke-disabled',
  'onprem-server': 'stroke-disabled',
  outbound: 'stroke-diagram-managed',
  inbound: 'stroke-diagram-managed',
  'ec2-a': 'stroke-diagram-resource',
  'ec2-b': 'stroke-diagram-resource',
  phz: 'stroke-diagram-managed',
}
const groups = { onprem: '온프레미스', resolver: 'Route 53 Resolver', 'vpc-a': 'VPC A', 'vpc-b': 'VPC B' }
const groupColors: Record<string, string> = {
  onprem: 'stroke-disabled',
  resolver: 'stroke-diagram-managed',
  'vpc-a': 'stroke-diagram-resource',
  'vpc-b': 'stroke-diagram-resource',
}
const notes = {
  'corp-domain': 'db.corp.local',
  'aws-domain': 'app.internal.aws',
  rule: '전달 규칙',
  'rule-vpc-a': '규칙 연결',
  'rule-vpc-b': '규칙 연결',
  'vpc-only': '온프레미스에는 연결 불가',
}
const expectedScenarios = [
  {
    id: 'outbound', label: '아웃바운드', nodes: ['ec2-a', 'outbound', 'onprem-dns'],
    paths: ['ec2-a-outbound', 'outbound-onprem-dns'], notes: ['corp-domain', 'aws-domain', 'rule'],
    sources: ['route53.resolver', 'route53.route53-resolver-forward-rule'],
  },
  {
    id: 'inbound', label: '인바운드', nodes: ['onprem-server', 'inbound', 'phz'],
    paths: ['onprem-server-inbound', 'inbound-phz'], notes: ['corp-domain', 'aws-domain'],
    sources: ['route53.resolver', 'route53.private-hosted-zone-vpc-only'],
  },
  {
    id: 'forward-rule', label: '규칙 공유', nodes: ['ec2-a', 'ec2-b', 'outbound', 'onprem-dns'],
    paths: ['ec2-a-outbound', 'ec2-b-outbound', 'outbound-onprem-dns'], notes: ['corp-domain', 'aws-domain', 'rule', 'rule-vpc-a', 'rule-vpc-b'],
    sources: ['route53.route53-resolver-forward-rule'],
  },
  {
    id: 'phz', label: '프라이빗 호스팅 영역', nodes: ['phz', 'ec2-a', 'ec2-b'],
    paths: [], notes: ['corp-domain', 'aws-domain', 'vpc-only'],
    sources: ['route53.private-hosted-zone', 'route53.private-hosted-zone-vpc-only'],
  },
]

function diagram() {
  return screen.getByRole('img', { name: 'Route 53 Resolver 인바운드와 아웃바운드' })
}

async function selectScenario(label: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) })
}

function readBox(rect: Element) {
  return {
    id: rect.parentElement?.getAttribute('data-node') ?? rect.getAttribute('data-group') ?? '',
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

type Box = ReturnType<typeof readBox>
const overlaps = (a: Box, b: Box) =>
  Math.min(a.x + a.width, b.x + b.width) > Math.max(a.x, b.x)
  && Math.min(a.y + a.height, b.y + b.height) > Math.max(a.y, b.y)

// 직교 경로의 시작점과 끝점.
function endpoints(d: string) {
  const [, x0, y0] = d.match(/^M(\d+) (\d+)/)!.map(Number)
  let x = x0, y = y0
  for (const [, cmd, n] of d.matchAll(/([HV])(\d+)/g)) {
    if (cmd === 'H') x = Number(n); else y = Number(n)
  }
  return { start: { x: x0, y: y0 }, end: { x, y } }
}

describe('Route53HybridDnsDiagram', () => {
  it('처음에는 노드 일곱이 선명하고 경로 없이 예시 곁말 둘과 선택 안내가 나온다', () => {
    const { container } = render(<Route53HybridDnsDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual(Object.keys(labels).sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note')).sort())
      .toEqual(['aws-domain', 'corp-domain'])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(visualsByTopicId.route53.diagrams['hybrid-dns'].idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·경로·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<Route53HybridDnsDiagram />)
    await selectScenario(scenario.label)

    for (const node of diagram().querySelectorAll('[data-node]')) {
      expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
    }
    for (const group of diagram().querySelectorAll('[data-group]')) expect(group.closest('[opacity]')).toBeNull()
    const paths = Array.from(diagram().querySelectorAll('[data-path]'))
    expect(paths.map((path) => path.getAttribute('data-path')).sort()).toEqual([...scenario.paths].sort())
    for (const path of paths) {
      expect(path).toHaveAttribute('d', hybridPaths[path.getAttribute('data-path')!])
      expect(path).toHaveAttribute('stroke-width', '2')
      expect(path).toHaveAttribute('marker-end', `url(#${diagram().querySelector('marker')!.id})`)
      expect(path).toHaveClass('stroke-title')
    }
    const visibleNotes = Array.from(diagram().querySelectorAll('[data-note]'))
    expect(visibleNotes.map((note) => note.getAttribute('data-note')).sort()).toEqual([...scenario.notes].sort())
    const [minX, minY, width, height] = diagram().getAttribute('viewBox')!.split(' ').map(Number)
    for (const note of visibleNotes) {
      const id = note.getAttribute('data-note')! as keyof typeof notes
      expect(note.textContent).toBe(notes[id])
      expect(note).toHaveAttribute('font-size', '9')
      expect(note).toHaveClass('fill-muted')
      expect(note).toHaveAttribute('text-anchor', 'middle')
      const halfWidth = estimateTextWidth(note.textContent!, 9) / 2
      const x = Number(note.getAttribute('x')), y = Number(note.getAttribute('y'))
      expect(x - halfWidth).toBeGreaterThanOrEqual(minX)
      expect(x + halfWidth).toBeLessThanOrEqual(minX + width)
      expect(y - 9).toBeGreaterThanOrEqual(minY)
      expect(y).toBeLessThanOrEqual(minY + height)
    }
    const wording = visualsByTopicId.route53.diagrams['hybrid-dns'].scenarios.find(({ id }) => id === scenario.id)!
    expect(container.querySelector('figcaption')!.textContent).toBe(wording.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  })

  it('규칙 연결 곁말은 각 VPC 그룹 라벨 옆, 그룹 안에 있다', async () => {
    render(<Route53HybridDnsDiagram />)
    await selectScenario('규칙 공유')
    for (const [noteId, groupId] of [['rule-vpc-a', 'vpc-a'], ['rule-vpc-b', 'vpc-b']]) {
      const note = diagram().querySelector(`[data-note="${noteId}"]`)!
      const group = readBox(diagram().querySelector(`[data-group="${groupId}"]`)!)
      const groupLabel = diagram().querySelector(`[data-group-label="${groupId}"]`)!
      const halfWidth = estimateTextWidth(note.textContent!, 9) / 2
      const x = Number(note.getAttribute('x'))
      expect(note.getAttribute('y')).toBe(groupLabel.getAttribute('y'))
      expect(x - halfWidth).toBeGreaterThan(Number(groupLabel.getAttribute('x')) + estimateTextWidth(groupLabel.textContent!, 9))
      expect(x + halfWidth).toBeLessThan(group.x + group.width)
    }
  })

  it('시나리오를 바꾸면 이전 곁말이 사라지고 전체에서는 노드와 예시 곁말 둘만 남는다', async () => {
    render(<Route53HybridDnsDiagram />)
    for (const label of ['아웃바운드', '인바운드', '규칙 공유', '프라이빗 호스팅 영역']) await selectScenario(label)
    expect(Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note')).sort())
      .toEqual(['aws-domain', 'corp-domain', 'vpc-only'])
    await selectScenario('전체')

    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note')).sort())
      .toEqual(['aws-domain', 'corp-domain'])
  })

  it('물음형 제목이 시나리오 버튼보다 앞에 보인다', () => {
    render(<Route53HybridDnsDiagram />)
    const question = screen.getByText('VPC와 사내망은 서로의 이름을 어떻게 찾을까?')
    expect(visualsByTopicId.route53.diagrams['hybrid-dns'].question).toBe('VPC와 사내망은 서로의 이름을 어떻게 찾을까?')
    expect(question.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it.each(['전체', '아웃바운드', '인바운드', '규칙 공유', '프라이빗 호스팅 영역'])('%s: 예시 이름 둘이 보인다', async (label) => {
    render(<Route53HybridDnsDiagram />)
    await selectScenario(label)
    expect(diagram().querySelector('[data-note="corp-domain"]')!.textContent).toBe('db.corp.local')
    expect(diagram().querySelector('[data-note="aws-domain"]')!.textContent).toBe('app.internal.aws')
  })

  it.each([
    ['인바운드', '0.25', '1'],
    ['아웃바운드', '1', '0.25'],
  ])('%s: 예시 곁말은 붙은 노드의 opacity를 따른다', async (label, corp, aws) => {
    render(<Route53HybridDnsDiagram />)
    await selectScenario(label)
    const opacity = (id: string) => diagram().querySelector(id)!.getAttribute('opacity')
    expect(opacity('[data-note="corp-domain"]')).toBe(corp)
    expect(opacity('[data-node="onprem-dns"]')).toBe(corp)
    expect(opacity('[data-note="aws-domain"]')).toBe(aws)
    expect(opacity('[data-node="phz"]')).toBe(aws)
  })

  it('프라이빗 호스팅 영역 시나리오에서 vpc-only와 aws-domain 두 줄이 겹치지 않는다', async () => {
    render(<Route53HybridDnsDiagram />)
    await selectScenario('프라이빗 호스팅 영역')
    const y = (id: string) => Number(diagram().querySelector(`[data-note="${id}"]`)!.getAttribute('y'))
    expect(Math.abs(y('vpc-only') - y('aws-domain'))).toBeGreaterThanOrEqual(9)
  })

  it('노드는 자기 그룹 안에 있고 엔드포인트는 VPC와, 프라이빗 호스팅 영역은 어느 그룹과도 겹치지 않는다', () => {
    render(<Route53HybridDnsDiagram />)
    const group = (id: string) => readBox(diagram().querySelector(`[data-group="${id}"]`)!)
    const box = (id: string) => readBox(diagram().querySelector(`[data-node="${id}"] rect`)!)
    const inside = (nodeId: string, groupId: string) => {
      const g = group(groupId)
      expect(boxesOutsideViewBox([box(nodeId)], [g.x, g.y, g.width, g.height]), `${nodeId} ⊂ ${groupId}`).toEqual([])
    }

    inside('onprem-dns', 'onprem')
    inside('onprem-server', 'onprem')
    inside('outbound', 'resolver')
    inside('inbound', 'resolver')
    inside('ec2-a', 'vpc-a')
    inside('ec2-b', 'vpc-b')
    for (const endpoint of ['outbound', 'inbound']) {
      for (const vpc of ['vpc-a', 'vpc-b']) expect(overlaps(box(endpoint), group(vpc)), `${endpoint}·${vpc}`).toBe(false)
    }
    for (const id of Object.keys(groups)) expect(overlaps(box('phz'), group(id)), `phz·${id}`).toBe(false)
    expect(box('outbound').x).toBeLessThan(box('inbound').x)
    for (const [id, label] of Object.entries(groups)) {
      expect(diagram().querySelector(`[data-group="${id}"]`)).toHaveClass(groupColors[id])
      const groupLabel = diagram().querySelector(`[data-group-label="${id}"]`)!
      expect(groupLabel.textContent).toBe(label)
      expect(groupLabel).toHaveAttribute('font-size', '9')
      expect(groupLabel).toHaveClass('fill-muted')
      expect(groupLabel.closest('[opacity]')).toBeNull()
      const g = group(id)
      expect(Number(groupLabel.getAttribute('x'))).toBeGreaterThan(g.x)
      expect(Number(groupLabel.getAttribute('x')) + estimateTextWidth(label, 9)).toBeLessThan(g.x + g.width)
      expect(Number(groupLabel.getAttribute('y')) - 9).toBeGreaterThan(g.y)
    }
  })

  it('아웃바운드 경로는 위로, 인바운드 경로는 아래로 향한다', () => {
    for (const id of ['ec2-a-outbound', 'ec2-b-outbound', 'outbound-onprem-dns']) {
      const { start, end } = endpoints(hybridPaths[id])
      expect(end.y, id).toBeLessThan(start.y)
    }
    for (const id of ['onprem-server-inbound', 'inbound-phz']) {
      const { start, end } = endpoints(hybridPaths[id])
      expect(end.y, id).toBeGreaterThan(start.y)
    }
  })

  it('프라이빗 호스팅 영역과 VPC의 연결은 경로가 아니라 화살표 없는 정적 선이다', async () => {
    expect(Object.keys(hybridPaths).sort()).toEqual(
      ['ec2-a-outbound', 'ec2-b-outbound', 'inbound-phz', 'onprem-server-inbound', 'outbound-onprem-dns'],
    )
    render(<Route53HybridDnsDiagram />)
    const links = Array.from(diagram().querySelectorAll('[data-attachment]'))
    expect(links.map((link) => link.getAttribute('data-attachment')).sort()).toEqual(['phz-vpc-a', 'phz-vpc-b'])
    for (const link of links) {
      expect(link.tagName).toBe('line')
      expect(link).not.toHaveAttribute('marker-end')
      expect(link).toHaveClass('stroke-disabled')
      expect(link).toHaveAttribute('stroke-width', '1')
      expect(link).toHaveAttribute('opacity', '1')
    }
    await selectScenario('아웃바운드')
    for (const link of diagram().querySelectorAll('[data-attachment]')) expect(link).toHaveAttribute('opacity', '0.25')
    await selectScenario('프라이빗 호스팅 영역')
    for (const link of diagram().querySelectorAll('[data-attachment]')) expect(link).toHaveAttribute('opacity', '1')
  })

  it('관문 5·7: 그룹을 포함한 모든 상자가 폭 280의 viewBox 안에 있다', () => {
    render(<Route53HybridDnsDiagram />)
    const [x, y, width, height] = diagram().getAttribute('viewBox')!.split(' ').map(Number)
    const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)

    expect([x, y, width]).toEqual([0, 0, 280])
    expect(boxes).toHaveLength(11)
    expect(boxesOutsideViewBox(boxes, [x, y, width, height])).toEqual([])
    expect(diagram().parentElement).toHaveClass('w-full', 'max-w-[380px]', '-mx-4', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
  })

  it('관문 6: 크기 10 라벨에 여백 12를 확보하고 노드 높이·계층 색을 지킨다', () => {
    render(<Route53HybridDnsDiagram />)
    for (const [id, label] of Object.entries(labels)) {
      const node = diagram().querySelector(`[data-node="${id}"]`)!
      const rect = node.querySelector('rect')!
      const text = node.querySelector('text')!
      const box = readBox(rect)
      expect(text.textContent).toBe(label)
      expect(text).toHaveAttribute('font-size', '10')
      expect(box.height).toBe(32)
      expect(estimateTextWidth(label, 10) + 12, label).toBeLessThanOrEqual(box.width)
      expect(rect).toHaveClass(nodeColors[id])
    }
    for (const path of Object.values(hybridPaths)) expect(path).toMatch(/^M[\d\sHV]+$/)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구·근거·50자 안팎의 캡션을 JSON에서 읽는다', () => {
    render(<Route53HybridDnsDiagram />)
    const text = visualsByTopicId.route53.diagrams['hybrid-dns']
    const ids = route53HybridDnsScenarios.map(({ id }) => id).sort()

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groups)
    expect(text.notes).toEqual(notes)
    expect(text.sources).toEqual([
      'route53.resolver',
      'route53.route53-resolver-forward-rule',
      'route53.private-hosted-zone',
      'route53.private-hosted-zone-vpc-only',
    ])
    expect(text.label).toBe('하이브리드 DNS 방향 도식')
    expect(text.svgLabel).toBe('Route 53 Resolver 인바운드와 아웃바운드')
    expect(screen.getByText(text.legend!)).toBeInTheDocument()
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = route53HybridDnsScenarios.find(({ id }) => id === expected.id)!
      expect(wording.sources).toEqual(expected.sources)
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(wording.caption.length).toBeGreaterThanOrEqual(40)
      expect(wording.caption.length).toBeLessThanOrEqual(60)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 프라이빗 호스팅 영역 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === 'route53')!.concepts.find(({ id }) => id === 'route53.private-hosted-zone-vpc-only')!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: '하이브리드 DNS 방향 도식' })

    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.join(''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(within(figure).queryByRole('heading')).toBeNull()
  })

  it('두 번 렌더해도 각 도식의 경로가 서로 다른 화살표 마커를 쓴다', async () => {
    render(<><Route53HybridDnsDiagram /><Route53HybridDnsDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: '하이브리드 DNS 방향 도식' })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '아웃바운드' })) })
      for (const path of figure.querySelectorAll('[data-path]')) {
        expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
      }
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  describe('가로형 (768px 이상)', () => {
    const outboundPaths = ['ec2-a-outbound', 'ec2-b-outbound', 'outbound-onprem-dns']
    const inboundPaths = ['onprem-server-inbound', 'inbound-phz']
    const pathEnds: Record<string, [string, string]> = {
      'ec2-a-outbound': ['ec2-a', 'outbound'],
      'ec2-b-outbound': ['ec2-b', 'outbound'],
      'outbound-onprem-dns': ['outbound', 'onprem-dns'],
      'onprem-server-inbound': ['onprem-server', 'inbound'],
      'inbound-phz': ['inbound', 'phz'],
    }

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

    async function collectPaths() {
      const found = new Map<string, string>()
      for (const { label } of expectedScenarios) {
        await selectScenario(label)
        for (const path of diagram().querySelectorAll('[data-path]')) found.set(path.getAttribute('data-path')!, path.getAttribute('d')!)
      }
      return found
    }

    const nodeBox = (id: string) => readBox(diagram().querySelector(`[data-node="${id}"] rect`)!)
    const groupBox = (id: string) => readBox(diagram().querySelector(`[data-group="${id}"]`)!)

    // 가운데 정렬한 곁말 한 줄이 차지하는 상자. 글자 높이는 크기 9로 잡는다.
    function noteBox(note: Element) {
      const halfWidth = estimateTextWidth(note.textContent!, 9) / 2
      const x = Number(note.getAttribute('x')), y = Number(note.getAttribute('y'))
      return { id: note.getAttribute('data-note')!, x: x - halfWidth, y: y - 9, width: halfWidth * 2, height: 9 }
    }

    const onEdge = (point: { x: number, y: number }, box: Box) => (
      ((point.x === box.x || point.x === box.x + box.width) && point.y > box.y && point.y < box.y + box.height)
      || ((point.y === box.y || point.y === box.y + box.height) && point.x > box.x && point.x < box.x + box.width)
    )

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×192 viewBox를 w-full 래퍼 하나로 그리고 SVG 속성과 화살표를 유지한다', () => {
      render(<Route53HybridDnsDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 192')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·그룹 id 집합과 시나리오로 나타나는 경로 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<Route53HybridDnsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 352')
      const tallNodes = ids('[data-node]', 'data-node')
      const tallGroups = ids('[data-group]', 'data-group')
      const tallPaths = [...(await collectPaths()).keys()].sort()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 192')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(tallNodes).toEqual(Object.keys(labels).sort())
      expect(ids('[data-group]', 'data-group')).toEqual(tallGroups)
      expect(tallGroups).toEqual(Object.keys(groups).sort())
      expect(tallPaths).toEqual(Object.keys(hybridPaths).sort())
      expect(tallPaths).toHaveLength(5)
      expect([...(await collectPaths()).keys()].sort()).toEqual(tallPaths)
    })

    it('노드 일곱과 그룹 넷의 rect가 모두 440×192 viewBox 안에 있다', () => {
      render(<Route53HybridDnsDiagram />)
      const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)

      expect(boxes).toHaveLength(11)
      expect(boxesOutsideViewBox(boxes, [0, 0, 440, 192])).toEqual([])
    })

    it('노드 라벨은 크기 10과 여백 12로, 그룹 라벨은 크기 9로 자기 박스 오른쪽 끝 안에 들어가고 색은 세로형과 같다', () => {
      render(<Route53HybridDnsDiagram />)

      for (const [id, label] of Object.entries(labels)) {
        const node = diagram().querySelector(`[data-node="${id}"]`)!
        const box = nodeBox(id)
        expect(node.querySelector('text')!.textContent).toBe(label)
        expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
        expect(box.height).toBe(32)
        expect(estimateTextWidth(label, 10) + 12, label).toBeLessThanOrEqual(box.width)
        expect(node.querySelector('rect')).toHaveClass(nodeColors[id])
      }
      for (const [id, label] of Object.entries(groups)) {
        const box = groupBox(id)
        const groupLabel = diagram().querySelector(`[data-group-label="${id}"]`)!
        expect(diagram().querySelector(`[data-group="${id}"]`)).toHaveClass(groupColors[id])
        expect(diagram().querySelector(`[data-group="${id}"]`)).toHaveAttribute('rx', '6')
        expect(groupLabel.textContent).toBe(label)
        expect(groupLabel).toHaveAttribute('font-size', '9')
        expect(groupLabel).toHaveClass('fill-muted')
        const x = Number(groupLabel.getAttribute('x'))
        const y = Number(groupLabel.getAttribute('y'))
        expect(x, label).toBe(box.x + 8)
        expect(y, label).toBe(box.y + 14)
        expect(x + estimateTextWidth(label, 9), label).toBeLessThanOrEqual(box.x + box.width)
      }
    })

    it.each(expectedScenarios)('$label은 세로형과 같은 노드·경로·곁말·캡션을 보이고 곁말은 노드와 겹치지 않는다', async (scenario) => {
      const { container } = render(<Route53HybridDnsDiagram />)
      await selectScenario(scenario.label)

      for (const node of diagram().querySelectorAll('[data-node]')) {
        expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
      }
      for (const group of diagram().querySelectorAll('[data-group]')) expect(group.closest('[opacity]')).toBeNull()
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path')).sort()).toEqual([...scenario.paths].sort())
      for (const path of paths) {
        expect(path.getAttribute('d')).toMatch(/^M\d+ \d+( [HV]\d+)+$/)
        expect(path).toHaveAttribute('stroke-width', '2')
        expect(path).toHaveAttribute('marker-end', `url(#${diagram().querySelector('marker')!.id})`)
        expect(path).toHaveClass('stroke-title')
      }
      for (const link of diagram().querySelectorAll('[data-attachment]')) {
        expect(link).toHaveAttribute('opacity', scenario.nodes.includes('phz') ? '1' : '0.25')
      }
      const visibleNotes = Array.from(diagram().querySelectorAll('[data-note]'))
      expect(visibleNotes.map((note) => note.getAttribute('data-note')).sort()).toEqual([...scenario.notes].sort())
      const nodeBoxes = Object.keys(labels).map(nodeBox)
      for (const note of visibleNotes) {
        const id = note.getAttribute('data-note')! as keyof typeof notes
        expect(note.textContent).toBe(notes[id])
        expect(note).toHaveAttribute('font-size', '9')
        expect(note).toHaveClass('fill-muted')
        expect(note).toHaveAttribute('text-anchor', 'middle')
        expect(boxesOutsideViewBox([noteBox(note)], [0, 0, 440, 192]), id).toEqual([])
        for (const box of nodeBoxes) expect(overlaps(noteBox(note), box), `${id}·${box.id}`).toBe(false)
      }
      const wording = visualsByTopicId.route53.diagrams['hybrid-dns'].scenarios.find(({ id }) => id === scenario.id)!
      expect(container.querySelector('figcaption')!.textContent).toBe(wording.caption)
      expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
      expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')

      await selectScenario('전체')

      for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
      expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
      expect(ids('[data-note]', 'data-note')).toEqual(['aws-domain', 'corp-domain'])
    })

    // 세로형은 아웃바운드가 위로, 인바운드가 아래로 가지만 가로형은 온프레미스가 왼쪽이다.
    it('아웃바운드 경로는 온프레미스 쪽(왼쪽)으로, 인바운드 경로는 오른쪽으로 향하고 양 끝이 두 노드의 변에 닿는다', async () => {
      render(<Route53HybridDnsDiagram />)
      const paths = await collectPaths()

      for (const id of outboundPaths) {
        const { start, end } = endpoints(paths.get(id)!)
        expect(end.x, id).toBeLessThan(start.x)
      }
      for (const id of inboundPaths) {
        const { start, end } = endpoints(paths.get(id)!)
        expect(end.x, id).toBeGreaterThan(start.x)
      }
      for (const [id, [from, to]] of Object.entries(pathEnds)) {
        const { start, end } = endpoints(paths.get(id)!)
        expect(onEdge(start, nodeBox(from)), `${id} 시작`).toBe(true)
        expect(onEdge(end, nodeBox(to)), `${id} 끝`).toBe(true)
      }
    })

    // 세로형은 규칙 연결 곁말을 VPC 그룹 라벨 옆에 두지만, 가로형 VPC 박스는 좁아 자기 EC2 아래에 둔다.
    it('규칙 연결 곁말은 각 VPC 그룹 안, 자기 EC2 아래에 있다', async () => {
      render(<Route53HybridDnsDiagram />)
      await selectScenario('규칙 공유')

      for (const [noteId, groupId, ec2Id] of [['rule-vpc-a', 'vpc-a', 'ec2-a'], ['rule-vpc-b', 'vpc-b', 'ec2-b']]) {
        const note = noteBox(diagram().querySelector(`[data-note="${noteId}"]`)!)
        const group = groupBox(groupId)
        const ec2 = nodeBox(ec2Id)
        expect(note.x, noteId).toBeGreaterThan(group.x)
        expect(note.x + note.width, noteId).toBeLessThan(group.x + group.width)
        expect(note.y, noteId).toBeGreaterThan(ec2.y + ec2.height)
        expect(note.y + note.height, noteId).toBeLessThanOrEqual(group.y + group.height)
      }
    })

    it('노드는 자기 그룹 안에 있고 엔드포인트는 VPC와, 프라이빗 호스팅 영역은 어느 그룹과도 겹치지 않는다', () => {
      render(<Route53HybridDnsDiagram />)
      const inside = (nodeId: string, groupId: string) => {
        const g = groupBox(groupId)
        expect(boxesOutsideViewBox([nodeBox(nodeId)], [g.x, g.y, g.width, g.height]), `${nodeId} ⊂ ${groupId}`).toEqual([])
      }

      inside('onprem-dns', 'onprem')
      inside('onprem-server', 'onprem')
      inside('outbound', 'resolver')
      inside('inbound', 'resolver')
      inside('ec2-a', 'vpc-a')
      inside('ec2-b', 'vpc-b')
      for (const endpoint of ['outbound', 'inbound']) {
        for (const vpc of ['vpc-a', 'vpc-b']) expect(overlaps(nodeBox(endpoint), groupBox(vpc)), `${endpoint}·${vpc}`).toBe(false)
      }
      for (const id of Object.keys(groups)) expect(overlaps(nodeBox('phz'), groupBox(id)), `phz·${id}`).toBe(false)
      expect(nodeBox('outbound').y + nodeBox('outbound').height).toBeLessThan(nodeBox('inbound').y)
      for (const [link, vpc] of [['phz-vpc-a', 'vpc-a'], ['phz-vpc-b', 'vpc-b']]) {
        const line = diagram().querySelector(`[data-attachment="${link}"]`)!
        const g = groupBox(vpc)
        const phz = nodeBox('phz')
        const x = Number(line.getAttribute('x1'))
        expect(line.getAttribute('x2'), link).toBe(line.getAttribute('x1'))
        expect(x, link).toBeGreaterThan(Math.max(g.x, phz.x))
        expect(x, link).toBeLessThan(Math.min(g.x + g.width, phz.x + phz.width))
        expect(Number(line.getAttribute('y1')), link).toBe(g.y + g.height)
        expect(Number(line.getAttribute('y2')), link).toBe(phz.y)
        expect(line).not.toHaveAttribute('marker-end')
      }
    })

    it('프라이빗 호스팅 영역 시나리오에서 vpc-only와 aws-domain 두 줄이 겹치지 않는다', async () => {
      render(<Route53HybridDnsDiagram />)
      await selectScenario('프라이빗 호스팅 영역')
      const y = (id: string) => Number(diagram().querySelector(`[data-note="${id}"]`)!.getAttribute('y'))
      expect(Math.abs(y('vpc-only') - y('aws-domain'))).toBeGreaterThanOrEqual(9)
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<Route53HybridDnsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 352')
      await selectScenario('규칙 공유')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '규칙 공유' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(ids('[data-path]', 'data-path')).toEqual([...outboundPaths].sort())
      expect(ids('[data-note]', 'data-note')).toEqual(['aws-domain', 'corp-domain', 'rule', 'rule-vpc-a', 'rule-vpc-b'])
    })
  })
})
