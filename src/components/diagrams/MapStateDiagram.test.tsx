import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { MapStateDiagram, mapStateScenarios } from './MapStateDiagram'

const topicId = 'api-gateway-step-functions'
const anchorConceptId = `${topicId}.step-functions-map-state`
const headConceptId = `${topicId}.step-functions`
const labels = {
  list: '목록', loop: '목록을 도는 반복문', map: 'Map 상태',
  'loop-fn-1': '함수', 'loop-fn-2': '함수', 'loop-fn-3': '함수',
  'map-fn-1': '함수', 'map-fn-2': '함수', 'map-fn-3': '함수',
}
const managedNodes = ['map', 'loop-fn-1', 'loop-fn-2', 'loop-fn-3', 'map-fn-1', 'map-fn-2', 'map-fn-3']
const groupLabels = { 'one-function': 'Lambda 함수 하나', machine: '상태 머신' }
const notes = {
  'time-limit': { label: '항목이 늘면 15분 제한', x: 70, y: 200, anchor: 'middle' },
  'per-item': { label: '항목마다 한 번씩', x: 210, y: 200, anchor: 'middle' },
}
const expectedPaths: Record<string, string> = {
  'list-loop': 'M100 40 V80',
  'list-map': 'M198 24 H230 V80',
  'loop-fn-1': 'M30 112 V152',
  'loop-fn-2': 'M70 112 V152',
  'loop-fn-3': 'M110 112 V152',
  'map-fn-1': 'M170 112 V152',
  'map-fn-2': 'M210 112 V152',
  'map-fn-3': 'M250 112 V152',
}
const question = '함수를 고치지 않고 15분 제한을 벗어나려면?'
const idleCaption = '방식을 고르면 목록의 반복을 누가 맡는지 볼 수 있다.'
const legend = '파랑: Lambda 함수와 Map 상태 · 회색: 처리할 목록과 함수 안의 반복문. 함수 셋은 여러 번 부른다는 표시다.'
const expectedScenarios = [
  {
    id: 'loop', label: '함수 안 반복문',
    nodes: ['list', 'loop', 'loop-fn-1', 'loop-fn-2', 'loop-fn-3'],
    paths: ['list-loop', 'loop-fn-1', 'loop-fn-2', 'loop-fn-3'], notes: ['time-limit'],
    caption: '함수 하나가 목록을 돌며 다른 함수를 부르는 구조는 항목 수가 늘면 15분 제한에 걸린다.',
    sources: [anchorConceptId],
  },
  {
    id: 'map', label: 'Map 상태',
    nodes: ['list', 'map', 'map-fn-1', 'map-fn-2', 'map-fn-3'],
    paths: ['list-map', 'map-fn-1', 'map-fn-2', 'map-fn-3'], notes: ['per-item'],
    caption: '반복을 상태 머신이 맡아 항목마다 함수를 한 번씩 부른다. 기존 함수 코드는 고치지 않는다.',
    sources: [anchorConceptId],
  },
]

function diagram() {
  return screen.getByRole('img', { name: '함수 안 반복문과 Map 상태의 항목별 호출' })
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

describe('MapStateDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<MapStateDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 아홉이 모두 선명하고 경로·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<MapStateDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual(Object.keys(labels).sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·경로·곁말만 보이고 나머지 노드는 흐려진다', async (scenario) => {
    const { container } = render(<MapStateDiagram />)
    await selectScenario(scenario.label)

    for (const node of diagram().querySelectorAll('[data-node]')) {
      expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
    }
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

  it('함수 안 반복문에서는 Map 쪽 넷이, Map 상태에서는 반복문 쪽 넷이 흐리고 목록은 둘 다 선명하다', async () => {
    render(<MapStateDiagram />)
    const dimmed: Record<string, string[]> = {
      '함수 안 반복문': ['map', 'map-fn-1', 'map-fn-2', 'map-fn-3'],
      'Map 상태': ['loop', 'loop-fn-1', 'loop-fn-2', 'loop-fn-3'],
    }
    for (const [label, ids] of Object.entries(dimmed)) {
      await selectScenario(label)
      for (const id of ids) {
        expect(diagram().querySelector(`[data-node="${id}"]`), `${label}: ${id}`).toHaveAttribute('opacity', '0.25')
      }
      expect(diagram().querySelector('[data-node="list"]'), label).toHaveAttribute('opacity', '1')
    }
  })

  it('목록에서 나가는 경로는 각자 자기 시나리오에서만 보인다', async () => {
    render(<MapStateDiagram />)
    const visibleIn: Record<string, string[]> = {
      'list-loop': ['loop'],
      'list-map': ['map'],
    }
    for (const scenario of expectedScenarios) {
      await selectScenario(scenario.label)
      for (const [pathId, scenarioIds] of Object.entries(visibleIn)) {
        expect(diagram().querySelector(`[data-path="${pathId}"]`) !== null, `${scenario.id}: ${pathId}`).toBe(scenarioIds.includes(scenario.id))
      }
    }
  })

  it('Map 상태로 가는 경로는 그룹 라벨 오른쪽으로 내려가 Map 상태 위 변에 닿는다', async () => {
    render(<MapStateDiagram />)
    await selectScenario('Map 상태')
    const groupLabel = diagram().querySelector('[data-group-label="machine"]')!
    const labelRight = Number(groupLabel.getAttribute('x')) + estimateTextWidth(groupLabel.textContent!, 9)
    const map = readBox(diagram().querySelector('[data-node="map"] rect')!)
    const [, x, y] = diagram().querySelector('[data-path="list-map"]')!.getAttribute('d')!.match(/H(\d+) V(\d+)$/u)!.map(Number)

    expect(x).toBeGreaterThan(labelRight)
    expect(x).toBeGreaterThan(map.x)
    expect(x).toBeLessThan(map.x + map.width)
    expect(y).toBe(map.y)
  })

  it('시나리오를 바꾸면 이전 경로·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<MapStateDiagram />)
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

  it('관문 5·7: 그룹 둘과 노드 아홉이 280×212 viewBox 안에 있고 반복문과 Map 상태가 각자 그룹 안에 있다', () => {
    render(<MapStateDiagram />)
    const [x, y, width, height] = diagram().getAttribute('viewBox')!.split(' ').map(Number)
    const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
    const frameOf = (id: string) => {
      const group = boxes.find((box) => box.id === id)!
      return [group.x, group.y, group.width, group.height] as [number, number, number, number]
    }
    const pick = (ids: string[]) => boxes.filter((box) => ids.includes(box.id))

    expect([x, y, width, height]).toEqual([0, 0, 280, 212])
    expect(boxes).toHaveLength(11)
    expect(boxesOutsideViewBox(boxes, [x, y, width, height])).toEqual([])
    expect(boxesOutsideViewBox(pick(['loop']), frameOf('one-function'))).toEqual([])
    expect(boxesOutsideViewBox(pick(['map']), frameOf('machine'))).toEqual([])
    for (const outsider of pick(['list', ...managedNodes.filter((id) => id !== 'map')])) {
      expect(boxesOutsideViewBox([outsider], frameOf('one-function')), outsider.id).toHaveLength(1)
      expect(boxesOutsideViewBox([outsider], frameOf('machine')), outsider.id).toHaveLength(1)
    }
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
  })

  it('관문 6: 노드 라벨은 크기 10이고 높이 32 상자 안에 여백 12를 남기며 청록을 쓰지 않는다', () => {
    render(<MapStateDiagram />)
    for (const [id, label] of Object.entries(labels)) {
      const node = diagram().querySelector(`[data-node="${id}"]`)!
      const text = node.querySelector('text')!
      const rect = node.querySelector('rect')!
      const box = readBox(rect)
      expect(text.textContent).toBe(label)
      expect(text).toHaveAttribute('font-size', '10')
      expect(box.height).toBe(32)
      expect(estimateTextWidth(label, 10) + 12, label).toBeLessThanOrEqual(box.width)
      expect(rect).toHaveClass(managedNodes.includes(id) ? 'stroke-diagram-managed' : 'stroke-disabled')
    }
    expect(diagram().querySelector('.stroke-diagram-resource, .fill-diagram-resource')).toBeNull()
  })

  it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 가로 범위 안에 있다', async (label) => {
    render(<MapStateDiagram />)
    await selectScenario(label)
    expect(diagram().querySelectorAll('[data-group]')).toHaveLength(2)
    expect(diagram().querySelectorAll('[data-group-label]')).toHaveLength(2)
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
      const anchor = text.getAttribute('text-anchor')
      const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
      expect(left, text.textContent!).toBeGreaterThanOrEqual(0)
      expect(left + width, text.textContent!).toBeLessThanOrEqual(280)
    }
    for (const note of diagram().querySelectorAll('[data-note]')) {
      const expected = notes[note.getAttribute('data-note')! as keyof typeof notes]
      expect(note.textContent).toBe(expected.label)
      expect(note).toHaveAttribute('x', String(expected.x))
      expect(note).toHaveAttribute('y', String(expected.y))
      expect(note).toHaveAttribute('text-anchor', expected.anchor)
      expect(note.closest('[opacity]')).toBeNull()
    }
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구·근거를 JSON에서 읽는다', () => {
    render(<MapStateDiagram />)
    const text = visualsByTopicId[topicId].diagrams['map-state']
    const ids = mapStateScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(['loop', 'map'])
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual(Object.fromEntries(Object.entries(notes).map(([id, note]) => [id, note.label])))
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([headConceptId, anchorConceptId])
    expect(text.label).toBe('Map 상태 도식')
    expect(text.svgLabel).toBe('함수 안 반복문과 Map 상태의 항목별 호출')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = mapStateScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: expected.sources })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(wording.caption.length).toBeLessThanOrEqual(57)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) {
      expect(conceptIds).toContain(source)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 Map 상태 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: 'Map 상태 도식' })

    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(within(figure).queryByRole('heading')).toBeNull()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 경로가 자기 마커를 가리킨다', async () => {
    render(<><MapStateDiagram /><MapStateDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: 'Map 상태 도식' })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'Map 상태' })) })
      expect(figure.querySelectorAll('[data-path]')).toHaveLength(4)
      for (const path of figure.querySelectorAll('[data-path]')) {
        expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
      }
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  describe('가로형 (768px 이상)', () => {
    const wideNotes = {
      'time-limit': { x: 166, y: 152, anchor: 'middle' },
      'per-item': { x: 350, y: 152, anchor: 'middle' },
    }
    const widePaths: Record<string, string> = {
      'list-loop': 'M64 48 H92',
      'list-map': 'M36 64 V84 H258 V48 H276',
      'loop-fn-1': 'M114 64 V104',
      'loop-fn-2': 'M166 64 V104',
      'loop-fn-3': 'M218 64 V104',
      'map-fn-1': 'M298 64 V104',
      'map-fn-2': 'M350 64 V104',
      'map-fn-3': 'M402 64 V104',
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

    // 경계에 닿는 것까지 겹침으로 센다.
    function touches(a: SvgBox, b: SvgBox) {
      return a.x <= b.x + b.width && b.x <= a.x + a.width && a.y <= b.y + b.height && b.y <= a.y + a.height
    }

    function overlaps(a: SvgBox, b: SvgBox) {
      return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
    }

    function nodeBox(id: string) {
      return readBox(diagram().querySelector(`[data-node="${id}"] rect`)!)
    }

    function groupBox(id: string) {
      return readBox(diagram().querySelector(`[data-group="${id}"]`)!)
    }

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×160 viewBox를 w-full 래퍼 하나로 그리고 SVG 속성과 화살표를 유지한다', () => {
      render(<MapStateDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 160')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·그룹 id 집합과 시나리오로 나타나는 경로 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<MapStateDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 212')
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

    it('그룹 둘과 노드 아홉의 모든 rect가 440×160 viewBox 안에 있다', () => {
      render(<MapStateDiagram />)
      const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)

      expect(boxes).toHaveLength(11)
      expect(boxesOutsideViewBox(boxes, [0, 0, 440, 160])).toEqual([])
    })

    it('노드 라벨은 크기 10과 여백 12로, 그룹 라벨은 크기 9로 자기 박스 오른쪽 끝 안에 들어간다', () => {
      render(<MapStateDiagram />)

      for (const [id, label] of Object.entries(labels)) {
        const node = diagram().querySelector(`[data-node="${id}"]`)!
        const rect = node.querySelector('rect')!
        const box = readBox(rect)
        expect(node.querySelector('text')!.textContent).toBe(label)
        expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
        expect(box.height).toBe(32)
        expect(estimateTextWidth(label, 10) + 12, label).toBeLessThanOrEqual(box.width)
        expect(rect).toHaveClass(managedNodes.includes(id) ? 'stroke-diagram-managed' : 'stroke-disabled')
      }
      expect(diagram().querySelector('.stroke-diagram-resource, .fill-diagram-resource')).toBeNull()

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

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·경로·곁말·캡션을 보이고 곁말은 viewBox 안에서 노드·그룹 라벨과 겹치지 않는다', async (scenario) => {
      const { container } = render(<MapStateDiagram />)
      await selectScenario(scenario.label)

      for (const node of diagram().querySelectorAll('[data-node]')) {
        expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
      }
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
      const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
      const groupLabelBoxes = Array.from(diagram().querySelectorAll('[data-group-label]'), textBox)
      const shownNotes = Array.from(diagram().querySelectorAll('[data-note]'))
      expect(shownNotes.map((note) => note.getAttribute('data-note'))).toEqual(scenario.notes)
      for (const note of shownNotes) {
        const id = note.getAttribute('data-note')! as keyof typeof wideNotes
        expect(note.textContent).toBe(notes[id].label)
        expect(note).toHaveAttribute('x', String(wideNotes[id].x))
        expect(note).toHaveAttribute('y', String(wideNotes[id].y))
        expect(note).toHaveAttribute('text-anchor', wideNotes[id].anchor)
        expect(note).toHaveAttribute('font-size', '9')
        expect(note).toHaveClass('fill-muted')
        expect(note.closest('[opacity]')).toBeNull()
        const box = textBox(note)
        expect(boxesOutsideViewBox([box], [0, 0, 440, 160]), id).toEqual([])
        for (const label of groupLabelBoxes) expect(overlaps(box, label), `${id} ↔ ${label.id}`).toBe(false)
        for (const node of nodeBoxes) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
      }
      expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
      expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
      expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
    })

    it('Map 상태로 가는 경로는 반복문 그룹과 그 라벨을 지나지 않고 Map 상태 왼쪽 변에 닿는다', async () => {
      render(<MapStateDiagram />)
      await selectScenario('Map 상태')
      const loopGroup = groupBox('one-function')
      const loopLabel = textBox(diagram().querySelector('[data-group-label="one-function"]')!)
      const map = nodeBox('map')
      const list = segments(diagram().querySelector('[data-path="list-map"]')!.getAttribute('d')!)

      for (const { x1, y1, x2, y2 } of list) {
        const line = { id: `(${x1},${y1})-(${x2},${y2})`, x: Math.min(x1, x2), y: Math.min(y1, y2), width: Math.abs(x2 - x1), height: Math.abs(y2 - y1) }
        expect(touches(line, loopGroup), `${line.id} ↔ 반복문 그룹`).toBe(false)
        expect(touches(line, loopLabel), `${line.id} ↔ 반복문 그룹 라벨`).toBe(false)
      }
      const last = list[list.length - 1]
      expect(last.y2).toBe(last.y1)
      expect(last.x2).toBeGreaterThan(last.x1)
      expect(last.x2).toBe(map.x)
      expect(last.y2).toBeGreaterThan(map.y)
      expect(last.y2).toBeLessThan(map.y + map.height)
    })

    it('반복문과 Map 상태가 각자 그룹 안에 있고 목록과 함수 여섯은 두 그룹 밖이며 함수는 그룹 아래다', () => {
      render(<MapStateDiagram />)
      const frameOf = (id: string) => {
        const group = groupBox(id)
        return [group.x, group.y, group.width, group.height] as [number, number, number, number]
      }
      const functions = managedNodes.filter((id) => id !== 'map')

      expect(boxesOutsideViewBox([nodeBox('loop')], frameOf('one-function'))).toEqual([])
      expect(boxesOutsideViewBox([nodeBox('map')], frameOf('machine'))).toEqual([])
      for (const id of ['list', ...functions]) {
        expect(boxesOutsideViewBox([nodeBox(id)], frameOf('one-function')), id).toHaveLength(1)
        expect(boxesOutsideViewBox([nodeBox(id)], frameOf('machine')), id).toHaveLength(1)
      }
      const groupsBottom = Math.max(...Object.keys(groupLabels).map((id) => groupBox(id).y + groupBox(id).height))
      for (const id of functions) expect(nodeBox(id).y, id).toBeGreaterThan(groupsBottom)
    })

    it('경로 양 끝이 출발 노드와 도착 노드의 변에 닿는다', async () => {
      render(<MapStateDiagram />)
      const ends: Record<string, [string, string, string]> = {
        'list-loop': ['함수 안 반복문', 'list', 'loop'],
        'loop-fn-1': ['함수 안 반복문', 'loop', 'loop-fn-1'],
        'loop-fn-2': ['함수 안 반복문', 'loop', 'loop-fn-2'],
        'loop-fn-3': ['함수 안 반복문', 'loop', 'loop-fn-3'],
        'list-map': ['Map 상태', 'list', 'map'],
        'map-fn-1': ['Map 상태', 'map', 'map-fn-1'],
        'map-fn-2': ['Map 상태', 'map', 'map-fn-2'],
        'map-fn-3': ['Map 상태', 'map', 'map-fn-3'],
      }
      const onEdge = (x: number, y: number, id: string) => {
        const { x: left, y: top, width, height } = nodeBox(id)
        const withinX = x >= left && x <= left + width
        const withinY = y >= top && y <= top + height
        return ((x === left || x === left + width) && withinY) || ((y === top || y === top + height) && withinX)
      }

      for (const [pathId, [label, from, to]] of Object.entries(ends)) {
        await selectScenario(label)
        const list = segments(diagram().querySelector(`[data-path="${pathId}"]`)!.getAttribute('d')!)
        expect(onEdge(list[0].x1, list[0].y1, from), `${pathId} 시작`).toBe(true)
        expect(onEdge(list[list.length - 1].x2, list[list.length - 1].y2, to), `${pathId} 끝`).toBe(true)
      }
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<MapStateDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 212')
      await selectScenario('Map 상태')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: 'Map 상태' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['list-map', 'map-fn-1', 'map-fn-2', 'map-fn-3'])
      for (const path of paths) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note'))).toEqual(['per-item'])
    })
  })
})
