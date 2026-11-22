import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { FogLayersDiagram, fogLayersScenarios } from './FogLayersDiagram'

const topicId = 'cloud-sdn'
const anchorConceptId = `${topicId}.fog-computing`
const labels: Record<string, string> = {
  'sensor01': 'SENSOR01',
  'sensor02': 'SENSOR02',
  'sensor03': 'SENSOR03',
  'fog01': 'FOG01',
  'cloud': '클라우드 데이터 센터',
}
const groupLabels: Record<string, string> = {
  'factory': '공장 안',
}
const noteLabels: Record<string, string> = {
  'cloud-only-note': '데이터를 모두 먼 데이터 센터까지 보낸다',
  'fog-note': 'FOG01이 먼저 분석하고 필요할 때 넘긴다',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
const sensors = ['sensor01', 'sensor02', 'sensor03']
// 「공장 안」 박스는 센서 셋과 포그 노드 FOG01을 담는다. 클라우드 데이터 센터는 박스 밖, 먼 곳에 있다.
const members: Record<string, string[]> = {
  'factory': ['sensor01', 'sensor02', 'sensor03', 'fog01'],
}
// 화살표는 데이터를 보내는 쪽의 변에서 나가 받는 쪽의 변에서 끝난다.
const pathEnds: Record<string, [string, string]> = {
  's1-cloud': ['sensor01', 'cloud'],
  's2-cloud': ['sensor02', 'cloud'],
  's3-cloud': ['sensor03', 'cloud'],
  's1-fog': ['sensor01', 'fog01'],
  's2-fog': ['sensor02', 'fog01'],
  's3-fog': ['sensor03', 'fog01'],
  'fog-cloud': ['fog01', 'cloud'],
}
const tallPaths: Record<string, string> = {
  's1-cloud': 'M70 176 V40',
  's2-cloud': 'M174 192 H185 V40',
  's3-cloud': 'M230 176 V40',
  's1-fog': 'M50 176 V152 H122 V128',
  's2-fog': 'M140 176 V128',
  's3-fog': 'M230 176 V152 H158 V128',
  'fog-cloud': 'M140 96 V40',
}
const widePaths: Record<string, string> = {
  's1-cloud': 'M112 40 H360 V88',
  's2-cloud': 'M68 120 V132 H340 V120',
  's3-cloud': 'M112 160 H400 V120',
  's1-fog': 'M112 48 H144 V96 H176',
  's2-fog': 'M112 104 H176',
  's3-fog': 'M112 160 H144 V112 H176',
  'fog-cloud': 'M248 104 H300',
}

const question = '센서의 데이터는 어디에서 먼저 처리될까?'
const figureName = '공장 안 센서 셋의 데이터를 클라우드 데이터 센터로 곧장 보낼 때와, 공장 안의 포그 노드 FOG01이 먼저 처리할 때를 견주는 도식'
const svgName = '「공장 안」 박스 안의 SENSOR01·SENSOR02·SENSOR03과 FOG01, 박스 밖의 클라우드 데이터 센터를 화살표로 이은 그림'
const idleCaption = '공장 안에 센서 SENSOR01~SENSOR03과 포그 노드 FOG01이 있고, 클라우드 데이터 센터는 공장 밖 먼 곳에 있다. 버튼으로 장면을 고르면 센서의 데이터가 어디로 가서 처리되는지 볼 수 있다.'
const legend = '화살표는 센서가 만든 데이터가 가는 쪽이다. SENSOR01~SENSOR03과 FOG01은 예로 붙인 이름이다.'
const expectedScenarios = [
  {
    id: 'cloud-only', label: '모두 멀리 보내기',
    nodes: ['sensor01', 'sensor02', 'sensor03', 'cloud'],
    paths: ['s1-cloud', 's2-cloud', 's3-cloud'],
    notes: ['cloud-only-note'],
    caption: '세 센서가 잰 값을 모두 멀리 있는 클라우드 데이터 센터로 곧장 보낸다. 분석과 응답이 먼 데이터 센터에서 이루어지므로, 값이 데이터 센터까지 갔다가 돌아오는 동안 응답이 늦어진다.',
  },
  {
    id: 'fog', label: '가까이에서 먼저',
    nodes: ['sensor01', 'sensor02', 'sensor03', 'fog01', 'cloud'],
    paths: ['s1-fog', 's2-fog', 's3-fog', 'fog-cloud'],
    notes: ['fog-note'],
    caption: '세 센서는 잰 값을 공장 안의 FOG01로 보낸다. FOG01이 그 자리에서 값을 분석해 정해 둔 범위를 벗어난 값은 곧바로 알리고, 클라우드에서 처리할 일이 있을 때 필요한 데이터를 클라우드 데이터 센터로 넘긴다.',
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

// 곁말·그룹 라벨(9)의 가로 범위. 반각 문자가 섞이므로 어림값의 1.15배로 잡는다.
function textBox(text: Element, id: string): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9) * 1.15
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id, x: left, y: y - 9, width, height: 9 }
}

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

// 두 선분이 같은 직선 위에 있고 길이가 있는 구간을 함께 쓰는가.
function collinearOverlap(a: Segment, b: Segment) {
  const shared = (a1: number, a2: number, b1: number, b2: number) => Math.min(Math.max(a1, a2), Math.max(b1, b2)) - Math.max(Math.min(a1, a2), Math.min(b1, b2)) > 0
  if (a.x1 === a.x2 && b.x1 === b.x2 && a.x1 === b.x1) return shared(a.y1, a.y2, b.y1, b.y2)
  if (a.y1 === a.y2 && b.y1 === b.y2 && a.y1 === b.y1) return shared(a.x1, a.x2, b.x1, b.x2)
  return false
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

// 선이 어느 노드의 변에서 시작하고 어느 노드의 변에서 끝나는지 그림에서 읽는다.
function endpointNode(point: { x: number, y: number }) {
  return nodeIds.find((id) => onEdge(point, nodeBox(id)))
}

const groupLabelBox = (id: string) => textBox(svg().querySelector(`[data-group-label="${id}"]`)!, `${id}-label`)

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 216] : [0, 0, 280, 252]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<FogLayersDiagram />)
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
    const { container } = render(<FogLayersDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<FogLayersDiagram />)
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
    render(<FogLayersDiagram />)
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
    // 곁말은 viewBox 안, 「공장 안」 박스 밖의 빈 줄에 들어가고, 노드·그룹 라벨·선과 겹치지 않는다. 노드와는 위아래 4 이상 띄운다.
    const seen: string[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const visible = scenario.notes.map((id) => textBox(note(id), id))
      seen.push(...scenario.notes)
      expect(boxesOutsideViewBox(visible, viewBox)).toEqual([])
      for (const box of visible) {
        for (const group of groupIds) expect(overlaps(box, groupBox(group)), `${box.id}는 ${group} 박스 밖`).toBe(false)
        for (const node of nodeIds) {
          const nodeArea = nodeBox(node)
          expect(overlaps(box, { ...nodeArea, y: nodeArea.y - 4, height: nodeArea.height + 8 }), `${box.id} ↔ ${node}`).toBe(false)
        }
        for (const group of groupIds) expect(overlaps(box, groupLabelBox(group)), `${box.id} ↔ ${group} 라벨`).toBe(false)
        for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
      }
    }
    expect([...seen].sort()).toEqual([...noteIds].sort())
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 보내는 쪽의 변에서 시작해 받는 쪽의 변에서 끝나고, 노드 안이나 그룹 라벨을 지나지 않으며 한 장면의 화살표끼리 겹치지 않는다', () => {
    render(<FogLayersDiagram />)
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
    for (const scenario of expectedScenarios) {
      for (const a of scenario.paths) for (const b of scenario.paths.filter((other) => other !== a)) {
        for (const sa of segments(paths[a])) for (const sb of segments(paths[b])) expect(collinearOverlap(sa, sb), `${a} ↔ ${b}`).toBe(false)
      }
    }
  })

  // 요점: 모두 멀리 보내기에서는 클라우드 데이터 센터로 들어가는 보이는 화살표가 셋이고 저마다 센서에서 나오며, FOG01은 흐리다.
  // 가까이에서 먼저에서는 클라우드로 들어가는 보이는 화살표가 하나뿐이고 그 시작이 FOG01이다 — 센서의 화살표는 모두 FOG01에서 끝난다.
  it('포그가 없으면 센서 셋이 저마다 클라우드로 보내고, 포그가 있으면 클라우드로 가는 화살표는 FOG01에서 나오는 하나뿐이다', async () => {
    render(<FogLayersDiagram />)
    const ends = (id: string) => [endpointNode(lineEnds(paths[id]).start), endpointNode(lineEnds(paths[id]).end)] as [string, string]

    await select('모두 멀리 보내기')
    const intoCloud = shownPaths().map(ends).filter(([, to]) => to === 'cloud')
    expect(intoCloud).toHaveLength(3)
    expect(intoCloud.map(([from]) => from).sort()).toEqual([...sensors].sort())
    expect(opacity('fog01')).toBe('0.25')

    await select('가까이에서 먼저')
    const intoCloudWithFog = shownPaths().map(ends).filter(([, to]) => to === 'cloud')
    expect(intoCloudWithFog).toEqual([['fog01', 'cloud']])
    const fromSensors = shownPaths().map(ends).filter(([from]) => sensors.includes(from))
    expect(fromSensors.map(([from]) => from).sort()).toEqual([...sensors].sort())
    for (const [from, to] of fromSensors) expect(to, from).toBe('fog01')
    expect(opacity('fog01')).toBe('1')

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const phrase of ['`SENSOR01`·`SENSOR02`·`SENSOR03`', '포그 노드 `FOG01`', '곧장 보내지 않고', '곧바로 알린다', '필요한 데이터를 클라우드 데이터 센터로 넘긴다', '예로 붙인 이름표']) {
      expect(body, phrase).toContain(phrase)
    }
  })
}

describe('FogLayersDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<FogLayersDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 252')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('가까이에서 먼저')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 216')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '가까이에서 먼저' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><FogLayersDiagram /><FogLayersDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '가까이에서 먼저' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<FogLayersDiagram />)
    const text = visualsByTopicId[topicId].diagrams['fog-layers']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(fogLayersScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = fogLayersScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 포그 컴퓨팅 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
