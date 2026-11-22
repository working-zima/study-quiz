import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { CoaxLayersDiagram, coaxLayersScenarios } from './CoaxLayersDiagram'

const topicId = 'transmission-media'
const anchorConceptId = `${topicId}.coaxial-cable`
const labels: Record<string, string> = {
  'core': '중심 도체',
  'insulator': '절연체',
  'outer': '바깥 도체',
  'jacket': '피복',
  'noise': '바깥 잡음',
}
const groupLabels: Record<string, string> = {
  'cable': '동축 케이블',
}
// 케이블의 네 겹은 동축 케이블 박스 안에, 바깥 잡음은 박스 밖에 있다.
const members: Record<string, string[]> = {
  'cable': ['core', 'insulator', 'outer', 'jacket'],
}
const layers = ['core', 'insulator', 'outer', 'jacket']
const noteLabels: Record<string, string> = {
  'core-note': '쌍의 한쪽',
  'insulator-note': '두 도체 사이',
  'outer-note': '쌍의 다른 쪽',
  'shield-note': '차폐 노릇',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
// 화살표는 바깥 잡음이 와 닿는 곳이다. 바깥 잡음 노드의 변에서 나가 바깥 도체 노드의 변에서 끝난다.
const pathEnds: Record<string, [string, string]> = {
  'noise-outer': ['noise', 'outer'],
}
const tallPaths: Record<string, string> = {
  'noise-outer': 'M188 164 H180 V124 H168',
}
const widePaths: Record<string, string> = {
  'noise-outer': 'M394 60 V80 H220 V60',
}

const question = '동축 케이블은 안에서 밖으로 무엇이 감싸고 있을까?'
const figureName = '동축 케이블의 네 겹을 가운데에서 바깥쪽 차례로 중심 도체·절연체·바깥 도체·피복으로 놓고, 신호를 나르는 도체 쌍과 바깥 잡음을 줄이는 바깥 도체를 보이는 도식'
const svgName = '동축 케이블 박스 안에 중심 도체·절연체·바깥 도체·피복을 가운데에서 바깥쪽 차례로 놓고, 박스 밖에 바깥 잡음을 둔 그림'
const idleCaption = '동축 케이블은 가운데의 중심 도체를 절연체, 바깥 도체, 피복이 차례로 감싼다. 버튼으로 신호를 나르는 도체 쌍이나, 바깥 잡음을 줄이는 바깥 도체를 고를 수 있다.'
const legend = '칸은 케이블의 가운데에서 바깥쪽으로 겹이 놓인 차례이고, 실제 굵기를 재어 그린 것이 아니다. 화살표는 바깥에서 오는 잡음이 와 닿는 곳을 가리킨다.'
const expectedScenarios = [
  {
    id: 'pair', label: '신호를 나르는 쌍',
    nodes: ['core', 'insulator', 'outer'],
    paths: [] as string[],
    notes: ['core-note', 'insulator-note', 'outer-note'],
    caption: '동축 케이블은 중심 도체와, 그것을 같은 중심축으로 빙 둘러싼 바깥 도체를 한 쌍으로 써서 전기 신호를 나른다. 두 도체 사이는 전기가 통하지 않는 절연체가 채운다.',
  },
  {
    id: 'shield', label: '바깥 잡음 줄이기',
    nodes: ['core', 'outer', 'noise'],
    paths: ['noise-outer'],
    notes: ['shield-note'],
    caption: '바깥 도체는 신호를 나르면서 차폐 노릇도 한다. 중심 도체를 빙 둘러싼 이 금속 층 덕분에, 바깥에서 오는 잡음이 안쪽 중심 도체의 신호에 섞여 드는 것이 줄어든다.',
  },
]

const svg = () => screen.getByRole('img', { name: svgName })
const select = async (label: string) => { await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) }) }

function readBox(rect: Element, id = ''): SvgBox {
  return {
    id,
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

const nodeBox = (id: string) => readBox(svg().querySelector(`[data-node="${id}"] rect`)!, id)
const groupBox = (id: string) => readBox(svg().querySelector(`[data-group="${id}"]`)!, id)
const label = (id: string) => svg().querySelector(`[data-node="${id}"] text`)!.textContent!
const groupLabel = (id: string) => svg().querySelector(`[data-group-label="${id}"]`)!.textContent!
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note')!)
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)!
const opacity = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function contains(outer: SvgBox, inner: SvgBox) {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height
}

// 곁말·그룹 라벨(9)의 가로 범위. 반각 문자가 섞일 수 있으므로 어림값의 1.15배로 잡는다.
function textBox(text: Element, id: string): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9) * 1.15
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id, x: left, y: y - 9, width, height: 9 }
}

const groupLabelBox = (id: string) => textBox(svg().querySelector(`[data-group-label="${id}"]`)!, `${id}-label`)

type Segment = { x1: number, y1: number, x2: number, y2: number }

function segments(d: string) {
  const result: Segment[] = []
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

function crossesInside(segment: Segment, box: SvgBox) {
  const left = Math.min(segment.x1, segment.x2)
  const right = Math.max(segment.x1, segment.x2)
  const top = Math.min(segment.y1, segment.y2)
  const bottom = Math.max(segment.y1, segment.y2)
  if (top === bottom) return top > box.y && top < box.y + box.height && Math.min(right, box.x + box.width) > Math.max(left, box.x)
  return left > box.x && left < box.x + box.width && Math.min(bottom, box.y + box.height) > Math.max(top, box.y)
}

function touches(segment: Segment, box: SvgBox) {
  const left = Math.min(segment.x1, segment.x2)
  const right = Math.max(segment.x1, segment.x2)
  const top = Math.min(segment.y1, segment.y2)
  const bottom = Math.max(segment.y1, segment.y2)
  return left <= box.x + box.width && right >= box.x && top <= box.y + box.height && bottom >= box.y
}

function lineEnds(d: string) {
  const list = segments(d)
  return { start: { x: list[0].x1, y: list[0].y1 }, end: { x: list[list.length - 1].x2, y: list[list.length - 1].y2 } }
}

// 점이 상자의 네 변 가운데 하나 위에 있는가.
function onEdge(point: { x: number, y: number }, box: SvgBox) {
  const withinX = point.x >= box.x && point.x <= box.x + box.width
  const withinY = point.y >= box.y && point.y <= box.y + box.height
  return ((point.x === box.x || point.x === box.x + box.width) && withinY) || ((point.y === box.y || point.y === box.y + box.height) && withinX)
}

// 보이는 화살표가 어느 노드의 변에서 시작하고 어느 노드의 변에서 끝나는지 그림에서 읽는다.
function endpointNode(point: { x: number, y: number }) {
  return nodeIds.find((id) => onEdge(point, nodeBox(id)))
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
  return (nextMatches: boolean) => {
    mediaQuery.matches = nextMatches
    act(() => listeners.forEach((listener) => listener(Object.assign(new Event('change'), { matches: nextMatches, media: mediaQuery.media }) as MediaQueryListEvent)))
  }
}

function layoutTests(wide: boolean) {
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 108] : [0, 0, 280, 196]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<CoaxLayersDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<CoaxLayersDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<CoaxLayersDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownPaths()).toEqual(scenario.paths)
    for (const path of svg().querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('d', paths[path.getAttribute('data-path')!])
      expect(path).toHaveAttribute('stroke-width', '2')
      expect(path).toHaveClass('stroke-title')
      expect(path).toHaveAttribute('marker-end', `url(#${svg().querySelector('marker')!.id})`)
      expect(path.closest('[opacity]')).toBeNull()
    }
    expect(shownNotes()).toEqual(scenario.notes)
    for (const id of scenario.notes) {
      expect(note(id).textContent).toBe(noteLabels[id])
      expect(note(id)).toHaveAttribute('font-size', '9')
    }
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·그룹 라벨·곁말이 자리에 들어간다`, async () => {
    render(<CoaxLayersDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const group of groupIds) {
        const inside = members[group].includes(id)
        expect(contains(groupBox(group), nodeBox(id)), `${id} ⊂ ${group}`).toBe(inside)
        if (!inside) expect(overlaps(groupBox(group), nodeBox(id)), `${id}는 ${group} 박스 밖`).toBe(false)
      }
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    for (const id of groupIds) {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
    }
    // 곁말은 빈자리에 들어가고 박스의 테두리에 걸치지 않는다. 노드와는 위아래 4 이상 띄우고, 그룹 라벨·다른 곁말·선과 겹치지 않는다.
    const noteBoxes: SvgBox[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of scenario.notes) noteBoxes.push(textBox(note(id), id))
    }
    expect([...noteBoxes.map(({ id }) => id)].sort()).toEqual([...noteIds].sort())
    expect(boxesOutsideViewBox(noteBoxes, viewBox)).toEqual([])
    for (const box of noteBoxes) {
      for (const group of groupIds) {
        const straddles = overlaps(box, groupBox(group)) && !contains(groupBox(group), box)
        expect(straddles, `${box.id}가 ${group} 테두리에 걸침`).toBe(false)
        expect(overlaps(box, groupLabelBox(group)), `${box.id} ↔ ${group} 라벨`).toBe(false)
      }
      for (const node of nodeIds) {
        const nodeArea = nodeBox(node)
        expect(overlaps(box, { ...nodeArea, y: nodeArea.y - 4, height: nodeArea.height + 8 }), `${box.id} ↔ ${node}`).toBe(false)
      }
      for (const other of noteBoxes.filter(({ id }) => id !== box.id)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
      for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 바깥 잡음 노드의 변에서 시작해 바깥 도체 노드의 변에서 끝나고, 노드 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<CoaxLayersDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(pathEnds)))
    for (const [id, d] of Object.entries(paths)) {
      const { start, end } = lineEnds(d)
      expect(onEdge(start, nodeBox(pathEnds[id][0])), `${id} 시작`).toBe(true)
      expect(onEdge(end, nodeBox(pathEnds[id][1])), `${id} 끝`).toBe(true)
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
    }
  })

  // 요점: 네 겹이 중심 도체 → 절연체 → 바깥 도체 → 피복의 차례로 한 방향에 놓이고(세로형은 위에서 아래로, 가로형은 왼쪽에서 오른쪽으로),
  // 「바깥 잡음 줄이기」에서 보이는 화살표는 케이블 박스 밖의 바깥 잡음에서 나와 바깥 도체에서 끝난다. 「신호를 나르는 쌍」에서는 두 도체와 그 사이의 절연체만 선명하다.
  it('네 겹이 가운데에서 바깥쪽 차례로 놓이고, 바깥 잡음의 화살표는 바깥 도체에서 끝난다', async () => {
    render(<CoaxLayersDiagram />)
    const boxes = layers.map(nodeBox)
    for (let index = 1; index < boxes.length; index += 1) {
      const [before, after] = [boxes[index - 1], boxes[index]]
      if (wide) {
        expect(after.y, `${after.id}는 ${before.id}와 같은 줄`).toBe(before.y)
        expect(after.x, `${after.id}는 ${before.id}의 오른쪽`).toBeGreaterThanOrEqual(before.x + before.width)
      } else {
        expect(after.x, `${after.id}는 ${before.id}와 같은 열`).toBe(before.x)
        expect(after.y, `${after.id}는 ${before.id}의 아래`).toBeGreaterThanOrEqual(before.y + before.height)
      }
    }

    await select('신호를 나르는 쌍')
    expect(layers.filter((id) => opacity(id) === '1')).toEqual(['core', 'insulator', 'outer'])
    expect(opacity('noise')).toBe('0.25')
    expect(shownPaths()).toEqual([])

    await select('바깥 잡음 줄이기')
    const [only] = shownPaths()
    expect(shownPaths()).toHaveLength(1)
    const { start, end } = lineEnds(paths[only])
    expect(endpointNode(start)).toBe('noise')
    expect(endpointNode(end)).toBe('outer')
    expect(overlaps(groupBox('cable'), nodeBox('noise'))).toBe(false)
    expect(opacity('insulator')).toBe('0.25')
    expect(opacity('jacket')).toBe('0.25')

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const phrase of ['중심 도체', '절연체', '바깥 도체', '피복', '한 쌍', '차폐 노릇', '바깥에서 오는 잡음']) {
      expect(body, phrase).toContain(phrase)
    }
  })
}

describe('CoaxLayersDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<CoaxLayersDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 196')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('바깥 잡음 줄이기')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 108')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '바깥 잡음 줄이기' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><CoaxLayersDiagram /><CoaxLayersDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '바깥 잡음 줄이기' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<CoaxLayersDiagram />)
    const text = visualsByTopicId[topicId].diagrams['coax-layers']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(coaxLayersScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.label).toBe(figureName)
    expect(text.svgLabel).toBe(svgName)
    expect(text.sources).toEqual([anchorConceptId])
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map((scenario) => scenario.label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = coaxLayersScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 동축 케이블 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(within(figure).queryByRole('heading')).toBeNull()
  })
})
