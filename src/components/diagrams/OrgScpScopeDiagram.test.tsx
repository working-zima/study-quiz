import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { OrgScpScopeDiagram, orgScpScopeScenarios } from './OrgScpScopeDiagram'

const topicId = 'organizations-cloudtrail-config'
const sourceConceptId = `${topicId}.scp-attachment-targets`
const ouConceptId = `${topicId}.organizational-unit`
const labels = {
  scp: 'SCP', management: '관리 계정',
  'account-a': '계정 A', 'account-b': '계정 B', 'account-c': '계정 C',
}
const groupLabels = { root: '조직 · 루트', 'ou-1': 'OU 1', 'ou-2': 'OU 2' }
const expectedPaths: Record<string, string> = {
  'scp-root': 'M140 40 V56',
  'scp-ou': 'M140 40 V120 H100 V128',
  'scp-account': 'M190 40 V48 H240 V150',
}
const question = 'SCP를 어디에 붙이면 어느 계정까지 걸릴까?'
const idleCaption = '붙이는 자리를 고르면 SCP가 걸리는 계정을 볼 수 있다.'
const legend = '파랑: SCP · 청록: 계정. 화살표는 SCP를 붙인 자리를 가리킨다. 바깥 박스는 조직의 루트, 안쪽 박스는 OU다.'
const expectedScenarios = [
  {
    id: 'root', label: '루트에 SCP',
    nodes: ['scp', 'account-a', 'account-b', 'account-c'],
    paths: ['scp-root'], notes: ['management-exempt'],
    caption: '루트에 붙이면 제한할 생각이 없던 계정까지 모든 멤버 계정에 걸린다. 관리 계정은 예외다.',
    sources: [sourceConceptId],
  },
  {
    id: 'ou', label: 'OU에 SCP',
    nodes: ['scp', 'account-a', 'account-b'],
    paths: ['scp-ou'], notes: [],
    caption: 'OU에 붙이면 안에 든 계정 전부에 한 번에 걸려, 계정마다 정책을 복사하지 않아도 된다.',
    sources: [ouConceptId, sourceConceptId],
  },
  {
    id: 'account', label: '계정 하나에 SCP',
    nodes: ['scp', 'account-c'],
    paths: ['scp-account'], notes: [],
    caption: '개별 멤버 계정에도 직접 붙일 수 있다. SCP는 붙인 자리 아래에만 적용된다.',
    sources: [sourceConceptId],
  },
]

function diagram() {
  return screen.getByRole('img', { name: 'SCP를 붙인 자리와 걸리는 계정' })
}

async function selectScenario(label: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) })
}

function readBox(rect: Element) {
  return {
    id: rect.getAttribute('data-group') ?? rect.parentElement?.getAttribute('data-node') ?? '',
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

describe('OrgScpScopeDiagram', () => {
  it('조직 주제의 시각 데이터를 로드하고 비교표와 약어 사전은 비워 둔다', () => {
    const visuals = visualsByTopicId[topicId]
    expect(visuals).toBeDefined()
    expect(Object.keys(visuals.diagrams)).toEqual(['scp-scope'])
    expect(visuals.tables).toEqual({})
    expect(visuals.glossary).toEqual([])
  })

  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<OrgScpScopeDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 다섯이 모두 선명하고 경로·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<OrgScpScopeDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual(Object.keys(labels).sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 적용 계정과 부착 경로·곁말을 보이고 관리 계정은 흐리다', async (scenario) => {
    const { container } = render(<OrgScpScopeDiagram />)
    await selectScenario(scenario.label)

    for (const node of diagram().querySelectorAll('[data-node]')) {
      expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
    }
    expect(diagram().querySelector('[data-node="management"]')).toHaveAttribute('opacity', '0.25')
    const paths = Array.from(diagram().querySelectorAll('[data-path]'))
    expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(scenario.paths)
    for (const path of paths) {
      expect(path).toHaveAttribute('d', expectedPaths[path.getAttribute('data-path')!])
      expect(path).toHaveAttribute('stroke-width', '2')
      expect(path).toHaveAttribute('marker-end', `url(#${diagram().querySelector('marker')!.id})`)
      expect(path).toHaveClass('stroke-title')
      expect(path.closest('[opacity]')).toBeNull()
    }
    expect(Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note'))).toEqual(scenario.notes)
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('붙이는 자리를 바꾸면 이전 경로·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<OrgScpScopeDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(Array.from(diagram().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path'))).toEqual(scenario.paths)
      expect(Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note'))).toEqual(scenario.notes)
    }
    await selectScenario('전체')

    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    for (const { label } of expectedScenarios) expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'false')
  })

  it('관문 5·7: 그룹 셋과 노드 다섯이 280×256 안에 있고 관리 계정과 OU는 조직 안에 있다', () => {
    render(<OrgScpScopeDiagram />)
    const [x, y, width, height] = diagram().getAttribute('viewBox')!.split(' ').map(Number)
    const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)

    expect([x, y, width, height]).toEqual([0, 0, 280, 256])
    expect(boxes).toHaveLength(8)
    expect(boxesOutsideViewBox(boxes, [x, y, width, height])).toEqual([])
    const members = { root: ['management', 'ou-1', 'ou-2'], 'ou-1': ['account-a', 'account-b'], 'ou-2': ['account-c'] }
    for (const [groupId, memberIds] of Object.entries(members)) {
      const group = boxes.find(({ id }) => id === groupId)!
      expect(boxesOutsideViewBox(boxes.filter(({ id }) => memberIds.includes(id)), [group.x, group.y, group.width, group.height])).toEqual([])
    }
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
  })

  it('관문 6: 노드 라벨은 크기 10이고 높이 32 상자 안에 여백 12를 남기며 계층별 색을 쓴다', () => {
    render(<OrgScpScopeDiagram />)
    for (const [id, label] of Object.entries(labels)) {
      const node = diagram().querySelector(`[data-node="${id}"]`)!
      const text = node.querySelector('text')!
      const rect = node.querySelector('rect')!
      const box = readBox(rect)
      expect(text.textContent).toBe(label)
      expect(text).toHaveAttribute('font-size', '10')
      expect(box.height).toBe(32)
      expect(estimateTextWidth(label, 10) + 12, label).toBeLessThanOrEqual(box.width)
      expect(rect).toHaveClass(id === 'scp' ? 'stroke-diagram-managed' : 'stroke-diagram-resource')
    }
  })

  it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 가로 범위 안에 있다', async (label) => {
    render(<OrgScpScopeDiagram />)
    await selectScenario(label)
    expect(diagram().querySelectorAll('[data-group]')).toHaveLength(3)
    expect(diagram().querySelectorAll('[data-group-label]')).toHaveLength(3)
    for (const [id, wording] of Object.entries(groupLabels)) {
      const group = diagram().querySelector(`[data-group="${id}"]`)!
      const groupLabel = diagram().querySelector(`[data-group-label="${id}"]`)!
      expect(group.closest('[opacity]')).toBeNull()
      expect(groupLabel.closest('[opacity]')).toBeNull()
      expect(groupLabel.textContent).toBe(wording)
      expect(groupLabel).toHaveAttribute('x', String(Number(group.getAttribute('x')) + 10))
      expect(groupLabel).toHaveAttribute('y', String(Number(group.getAttribute('y')) + 14))
    }
    for (const text of diagram().querySelectorAll('[data-group-label], [data-note]')) {
      expect(text).toHaveAttribute('font-size', '9')
      expect(text).toHaveClass('fill-muted')
      const x = Number(text.getAttribute('x'))
      const width = estimateTextWidth(text.textContent!, 9)
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x + width).toBeLessThanOrEqual(280)
    }
    for (const note of diagram().querySelectorAll('[data-note]')) {
      expect(note.textContent).toBe('SCP가 걸리지 않음')
      expect(note).toHaveAttribute('x', '150')
      expect(note).toHaveAttribute('y', '100')
      expect(note).toHaveAttribute('text-anchor', 'start')
      expect(note.closest('[opacity]')).toBeNull()
    }
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<OrgScpScopeDiagram />)
    const text = visualsByTopicId[topicId].diagrams['scp-scope']
    const ids = orgScpScopeScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(['account', 'ou', 'root'])
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual({ 'management-exempt': 'SCP가 걸리지 않음' })
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([ouConceptId, sourceConceptId, `${topicId}.organizations-consolidated-billing`])
    expect(text.label).toBe('조직과 SCP 적용 범위 도식')
    expect(text.svgLabel).toBe('SCP를 붙인 자리와 걸리는 계정')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = orgScpScopeScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: expected.sources })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) {
      expect(conceptIds).toContain(source)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 SCP 부착 대상 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === sourceConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: '조직과 SCP 적용 범위 도식' })

    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.join('').replace(/\*\*/g, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(within(figure).queryByRole('heading')).toBeNull()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 경로가 자기 마커를 가리킨다', async () => {
    render(<><OrgScpScopeDiagram /><OrgScpScopeDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: '조직과 SCP 적용 범위 도식' })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'OU에 SCP' })) })
      expect(figure.querySelectorAll('[data-path]')).toHaveLength(1)
      for (const path of figure.querySelectorAll('[data-path]')) {
        expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
      }
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  describe('가로형 (768px 이상)', () => {
    const widePaths: Record<string, string> = {
      'scp-root': 'M190 40 V56',
      'scp-ou': 'M220 40 V80',
      'scp-account': 'M278 24 H372 V102',
    }
    const wideNotes = {
      'management-exempt': { x: 16, y: 136, textAnchor: 'start' },
    }
    const members = { root: ['management', 'ou-1', 'ou-2'], 'ou-1': ['account-a', 'account-b'], 'ou-2': ['account-c'] }
    // 경로마다 출발 노드와 SCP를 붙인 자리. 루트와 OU 1은 박스의 위 변에서 끝난다.
    const ends: Record<string, [string, string]> = {
      'scp-root': ['scp', 'root'],
      'scp-ou': ['scp', 'ou-1'],
      'scp-account': ['scp', 'account-c'],
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

    async function collectPathIds() {
      const found = new Set<string>()
      for (const { label } of expectedScenarios) {
        await selectScenario(label)
        for (const path of diagram().querySelectorAll('[data-path]')) found.add(path.getAttribute('data-path')!)
      }
      return [...found].sort()
    }

    // 직교 경로를 선분 목록으로 편다. M/H/V만 나온다.
    function segments(d: string) {
      const result: { x1: number, y1: number, x2: number, y2: number }[] = []
      let x = 0
      let y = 0
      for (const [, command, first, second] of d.matchAll(/([MHV])(-?\d+)(?: (-?\d+))?/gu)) {
        if (command === 'M') { x = Number(first); y = Number(second); continue }
        const next = command === 'H' ? { x: Number(first), y } : { x, y: Number(first) }
        result.push({ x1: x, y1: y, x2: next.x, y2: next.y })
        x = next.x
        y = next.y
      }
      return result
    }

    // 글자가 차지하는 상자. 높이는 글자 크기 9를 기준선 위로 잡는다.
    function textBox(text: Element) {
      const x = Number(text.getAttribute('x'))
      const y = Number(text.getAttribute('y'))
      const width = estimateTextWidth(text.textContent!, 9)
      const anchor = text.getAttribute('text-anchor')
      const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
      return { id: text.getAttribute('data-note') ?? text.getAttribute('data-group-label')!, x: left, y: y - 9, width, height: 9 }
    }

    function overlaps(a: SvgBox, b: SvgBox) {
      return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
    }

    // 선분이 상자 안쪽을 지나는가. 변에 닿기만 하는 것은 세지 않는다.
    function crossesInside(segment: ReturnType<typeof segments>[number], box: SvgBox) {
      const left = Math.min(segment.x1, segment.x2)
      const right = Math.max(segment.x1, segment.x2)
      const top = Math.min(segment.y1, segment.y2)
      const bottom = Math.max(segment.y1, segment.y2)
      if (top === bottom) return top > box.y && top < box.y + box.height && Math.min(right, box.x + box.width) > Math.max(left, box.x)
      return left > box.x && left < box.x + box.width && Math.min(bottom, box.y + box.height) > Math.max(top, box.y)
    }

    function onEdge(x: number, y: number, box: SvgBox) {
      const insideX = x >= box.x && x <= box.x + box.width
      const insideY = y >= box.y && y <= box.y + box.height
      return ((x === box.x || x === box.x + box.width) && insideY) || ((y === box.y || y === box.y + box.height) && insideX)
    }

    function nodeBox(id: string) {
      return readBox(diagram().querySelector(`[data-node="${id}"] rect`)!)
    }

    function groupBox(id: string) {
      return readBox(diagram().querySelector(`[data-group="${id}"]`)!)
    }

    function boxOf(id: string) {
      return id in groupLabels ? groupBox(id) : nodeBox(id)
    }

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×160 viewBox를 w-full 래퍼 하나로 그리고 SVG 속성과 화살표를 유지한다', () => {
      render(<OrgScpScopeDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 160')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·그룹 id 집합과 시나리오로 나타나는 경로 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<OrgScpScopeDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 256')
      const tallNodes = ids('[data-node]', 'data-node')
      const tallGroups = ids('[data-group]', 'data-group')
      const tallPaths = await collectPathIds()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 160')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(tallNodes).toEqual(Object.keys(labels).sort())
      expect(ids('[data-group]', 'data-group')).toEqual(tallGroups)
      expect(tallGroups).toEqual(Object.keys(groupLabels).sort())
      expect(tallPaths).toEqual(Object.keys(expectedPaths).sort())
      expect(await collectPathIds()).toEqual(tallPaths)
    })

    it('그룹 셋과 노드 다섯의 모든 rect가 440×160 viewBox 안에 있다', () => {
      render(<OrgScpScopeDiagram />)
      const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)

      expect(boxes).toHaveLength(8)
      expect(boxesOutsideViewBox(boxes, [0, 0, 440, 160])).toEqual([])
    })

    it('노드 라벨은 크기 10과 여백 12로, 그룹 라벨은 크기 9로 자기 박스 오른쪽 끝 안에 들어간다', () => {
      render(<OrgScpScopeDiagram />)

      for (const [id, label] of Object.entries(labels)) {
        const node = diagram().querySelector(`[data-node="${id}"]`)!
        const rect = node.querySelector('rect')!
        const box = readBox(rect)
        expect(node.querySelector('text')!.textContent).toBe(label)
        expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
        expect(box.height).toBe(32)
        expect(estimateTextWidth(label, 10) + 12, label).toBeLessThanOrEqual(box.width)
        expect(rect).toHaveClass(id === 'scp' ? 'stroke-diagram-managed' : 'stroke-diagram-resource')
      }

      for (const [id, wording] of Object.entries(groupLabels)) {
        const box = groupBox(id)
        const groupLabel = diagram().querySelector(`[data-group-label="${id}"]`)!
        expect(groupLabel.textContent).toBe(wording)
        expect(groupLabel).toHaveAttribute('font-size', '9')
        const x = Number(groupLabel.getAttribute('x'))
        expect(x, wording).toBe(box.x + 10)
        expect(Number(groupLabel.getAttribute('y')), wording).toBe(box.y + 14)
        expect(x + estimateTextWidth(wording, 9), wording).toBeLessThanOrEqual(box.x + box.width)
      }
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·경로·곁말·캡션을 보이고 곁말은 루트 안에서 노드·그룹·경로와 겹치지 않는다', async (scenario) => {
      const { container } = render(<OrgScpScopeDiagram />)
      await selectScenario(scenario.label)

      for (const node of diagram().querySelectorAll('[data-node]')) {
        expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
      }
      expect(diagram().querySelector('[data-node="management"]')).toHaveAttribute('opacity', '0.25')
      for (const group of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(group.closest('[opacity]')).toBeNull()
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(scenario.paths)
      for (const path of paths) {
        expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
        expect(path).toHaveAttribute('stroke-width', '2')
        expect(path).toHaveAttribute('marker-end', `url(#${diagram().querySelector('marker')!.id})`)
        expect(path).toHaveClass('stroke-title')
        expect(path.closest('[opacity]')).toBeNull()
      }
      const pathSegments = paths.flatMap((path) => segments(path.getAttribute('d')!))
      const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
      const groupLabelBoxes = Array.from(diagram().querySelectorAll('[data-group-label]'), textBox)
      const root = groupBox('root')
      const shownNotes = Array.from(diagram().querySelectorAll('[data-note]'))
      expect(shownNotes.map((note) => note.getAttribute('data-note'))).toEqual(scenario.notes)
      for (const note of shownNotes) {
        const id = note.getAttribute('data-note')! as keyof typeof wideNotes
        expect(note.textContent).toBe('SCP가 걸리지 않음')
        expect(note).toHaveAttribute('x', String(wideNotes[id].x))
        expect(note).toHaveAttribute('y', String(wideNotes[id].y))
        expect(note).toHaveAttribute('text-anchor', wideNotes[id].textAnchor)
        expect(note).toHaveAttribute('font-size', '9')
        expect(note).toHaveClass('fill-muted')
        expect(note.closest('[opacity]')).toBeNull()
        const box = textBox(note)
        expect(boxesOutsideViewBox([box], [root.x, root.y, root.width, root.height]), id).toEqual([])
        for (const ou of ['ou-1', 'ou-2']) expect(overlaps(box, groupBox(ou)), `${id} ↔ ${ou}`).toBe(false)
        for (const label of groupLabelBoxes) expect(overlaps(box, label), `${id} ↔ ${label.id}`).toBe(false)
        for (const node of nodeBoxes) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
        for (const segment of pathSegments) expect(crossesInside(segment, box), `${id} ↔ 경로`).toBe(false)
      }
      expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
      expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
      expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
    })

    it('관리 계정과 OU는 조직 안에 있고 관리 계정 · OU 1 · OU 2가 왼쪽에서 오른쪽으로 겹치지 않는다', () => {
      render(<OrgScpScopeDiagram />)
      const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)

      for (const [groupId, memberIds] of Object.entries(members)) {
        const group = groupBox(groupId)
        expect(boxesOutsideViewBox(boxes.filter(({ id }) => memberIds.includes(id)), [group.x, group.y, group.width, group.height]), groupId).toEqual([])
      }
      const branches = [nodeBox('management'), groupBox('ou-1'), groupBox('ou-2')]
      for (const [index, branch] of branches.entries()) {
        for (const other of branches.slice(index + 1)) {
          expect(overlaps(branch, other), `${branch.id} ↔ ${other.id}`).toBe(false)
          expect(branch.x + branch.width, `${branch.id} → ${other.id}`).toBeLessThan(other.x)
        }
      }
      const scp = nodeBox('scp')
      expect(scp.y + scp.height).toBeLessThanOrEqual(groupBox('root').y)
    })

    it('경로 셋은 SCP의 변에서 나와 루트 · OU 1 · 계정 C의 위 변에서 끝나고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<OrgScpScopeDiagram />)

      for (const scenario of expectedScenarios) {
        await selectScenario(scenario.label)
        const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
        for (const path of diagram().querySelectorAll('[data-path]')) {
          const id = path.getAttribute('data-path')!
          const list = segments(path.getAttribute('d')!)
          const first = list[0]
          const last = list[list.length - 1]
          const [from, to] = ends[id]
          const target = boxOf(to)

          expect(onEdge(first.x1, first.y1, boxOf(from)), `${id} 시작`).toBe(true)
          expect(last.x1, `${id} 마지막 선분은 세로`).toBe(last.x2)
          expect(last.y1, `${id} 위에서 내려온다`).toBeLessThan(last.y2)
          expect(last.y2, `${id} 끝`).toBe(target.y)
          expect(last.x2, `${id} 끝`).toBeGreaterThan(target.x)
          expect(last.x2, `${id} 끝`).toBeLessThan(target.x + target.width)
          for (const segment of list) {
            for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
          }
        }
      }
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<OrgScpScopeDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 256')
      await selectScenario('루트에 SCP')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '루트에 SCP' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['scp-root'])
      for (const path of paths) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note'))).toEqual(['management-exempt'])
    })
  })
})
