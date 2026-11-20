import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { WlanTransmissionDiagram, wlanTransmissionScenarios } from './WlanTransmissionDiagram'

const topicId = 'wireless-lan'
const anchorConceptId = `${topicId}.wlan-transmission`
const labels: Record<string, string> = {
  'std11b': '802.11b',
  'std11ag': '802.11a·g',
  'fhss': 'FHSS',
  'dsss': 'DSSS',
  'ofdm': 'OFDM',
  'std1997': '802.11-1997',
  'ir': '적외선',
}
const groupLabels: Record<string, string> = {
  'spread': '대역 확산',
}
const noteLabels: Record<string, string> = {
  'spread-note': '넓은 범위에 펼친다',
  'ofdm-note': '부반송파에 나눠 싣는다',
  'infrared-note': '전파 대신 빛',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
const methodIds = ['fhss', 'dsss', 'ofdm', 'ir']
// 대역 확산 박스 안에는 FHSS와 DSSS만 있다.
const insideSpreadIds = ['fhss', 'dsss']
// 화살표는 802.11의 처음 판·개정에서 그것이 쓰는 전송 방식으로 간다.
const pathEnds: Record<string, [string, string]> = {
  '11b-dsss': ['std11b', 'dsss'],
  '11ag-ofdm': ['std11ag', 'ofdm'],
  '1997-fhss': ['std1997', 'fhss'],
  '1997-dsss': ['std1997', 'dsss'],
  '1997-ir': ['std1997', 'ir'],
}
const tallPaths: Record<string, string> = {
  '11b-dsss': 'M140 48 V120',
  '11ag-ofdm': 'M236 48 V120',
  '1997-fhss': 'M96 216 H52 V152',
  '1997-dsss': 'M140 200 V152',
  '1997-ir': 'M192 216 H208',
}
const widePaths: Record<string, string> = {
  '11b-dsss': 'M160 48 V104',
  '11ag-ofdm': 'M280 48 V104',
  '1997-fhss': 'M112 208 H64 V136',
  '1997-dsss': 'M160 192 V136',
  '1997-ir': 'M208 208 H384 V136',
}

const question = '무선 LAN은 신호를 어떤 방법으로 실어 보낼까?'
const figureName = '802.11의 처음 판(802.11-1997)과 개정(802.11b·802.11a·g)을 그것이 쓰는 전송 방식(FHSS·DSSS·OFDM·적외선)과 잇고, FHSS와 DSSS를 대역 확산으로 묶어 보이는 도식'
const svgName = '맨 위 줄에 802.11b와 802.11a·g를, 가운데 줄에 대역 확산 박스로 묶은 FHSS·DSSS와 OFDM을, 맨 아래 줄에 802.11-1997과 적외선을 둔 그림'
const idleCaption = '802.11-1997은 무선 LAN 표준 802.11의 처음 판이고 802.11b·802.11a·g는 그 뒤의 개정이며, FHSS·DSSS·OFDM·적외선은 그것들이 정한 전송 방식이다. 버튼으로 방식을 고르면 그 방식이 신호를 어떻게 싣는지와 어느 판·개정이 쓰는지 볼 수 있다.'
const legend = '「대역 확산」 박스는 FHSS와 DSSS를 묶는 이름이다. 화살표는 802.11의 처음 판·개정에서 그것이 쓰는 전송 방식으로 간다.'
const expectedScenarios = [
  {
    id: 'spread', label: '대역 확산',
    nodes: ['std11b', 'fhss', 'dsss', 'std1997'],
    paths: ['11b-dsss', '1997-fhss', '1997-dsss'],
    notes: ['spread-note'],
    caption: 'FHSS는 2.4GHz 대역의 좁은 채널들을 정해진 순서에 따라 옮겨 다니며 보내고, DSSS는 채널 하나에 머물며 신호를 넓은 폭에 퍼뜨려 보낸다. 둘 다 802.11-1997에 있었고, 802.11b는 DSSS를 넓힌 고속 DSSS를 쓴다.',
  },
  {
    id: 'ofdm', label: 'OFDM',
    nodes: ['std11ag', 'ofdm'],
    paths: ['11ag-ofdm'],
    notes: ['ofdm-note'],
    caption: 'OFDM은 채널 하나를 좁은 주파수인 부반송파 여럿으로 나누고, 데이터를 그 부반송파에 나눠 싣는다. 5GHz 대역을 쓰는 802.11a가 들여왔고, 2.4GHz 대역을 쓰는 802.11g도 쓴다.',
  },
  {
    id: 'infrared', label: '적외선',
    nodes: ['std1997', 'ir'],
    paths: ['1997-ir'],
    notes: ['infrared-note'],
    caption: '적외선 방식은 전파 대신 눈에 보이지 않는 빛인 적외선으로 신호를 보낸다. 802.11-1997의 세 방식 가운데 하나이고, 닿는 거리가 10m 안팎이며 건물 안에서만 쓴다.',
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 240] : [0, 0, 280, 256]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<WlanTransmissionDiagram />)
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
    const { container } = render(<WlanTransmissionDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<WlanTransmissionDiagram />)
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
    render(<WlanTransmissionDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      expect(contains(groupBox('spread'), nodeBox(id)), `${id} ⊂ spread`).toBe(insideSpreadIds.includes(id))
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    for (const id of nodeIds.filter((nodeId) => !insideSpreadIds.includes(nodeId))) {
      expect(overlaps(groupBox('spread'), nodeBox(id)), `${id}는 대역 확산 박스 밖`).toBe(false)
    }
    for (const id of groupIds) {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
    }
    // 곁말은 viewBox 안에 들어가고, 노드·그룹 라벨·다른 곁말·선과 겹치지 않는다.
    const noteBoxes: SvgBox[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of scenario.notes) noteBoxes.push(textBox(note(id), id))
    }
    expect([...noteBoxes.map(({ id }) => id)].sort()).toEqual([...noteIds].sort())
    expect(boxesOutsideViewBox(noteBoxes, viewBox)).toEqual([])
    for (const box of noteBoxes) {
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
      for (const group of groupIds) expect(overlaps(box, groupLabelBox(group)), `${box.id} ↔ ${group} 라벨`).toBe(false)
      for (const other of noteBoxes.filter(({ id }) => id !== box.id)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
      for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 판·개정 노드의 변에서 시작해 방식 노드의 변에서 끝나고, 노드 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<WlanTransmissionDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(pathEnds)))
    for (const [id, d] of Object.entries(paths)) {
      const [from, to] = pathEnds[id]
      const { start, end } = lineEnds(d)
      expect(onEdge(start, nodeBox(from)), `${id} 시작`).toBe(true)
      expect(onEdge(end, nodeBox(to)), `${id} 끝`).toBe(true)
      expect(methodIds, `${id}는 방식 노드로 간다`).toContain(to)
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
    }
  })

  // 요점: 시나리오마다 선명한 방식 노드가 서로 겹치지 않는다 — 대역 확산은 FHSS·DSSS, OFDM은 OFDM, 적외선은 적외선.
  // 대역 확산을 고르면 선명한 방식 노드가 모두 대역 확산 박스 안에 있고, 나머지 두 시나리오의 방식 노드는 박스 밖에 있다.
  it('시나리오마다 선명한 방식 노드가 겹치지 않고, 대역 확산의 두 방식만 대역 확산 박스 안에 있다', async () => {
    render(<WlanTransmissionDiagram />)
    const brightMethods: Record<string, string[]> = {}
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      brightMethods[scenario.id] = methodIds.filter((id) => opacity(id) === '1')
    }
    expect(brightMethods).toEqual({ spread: ['fhss', 'dsss'], ofdm: ['ofdm'], infrared: ['ir'] })
    const all = Object.values(brightMethods).flat()
    expect(new Set(all).size).toBe(all.length)
    expect(new Set(all)).toEqual(new Set(methodIds))
    for (const id of brightMethods.spread) expect(contains(groupBox('spread'), nodeBox(id)), id).toBe(true)
    for (const id of [...brightMethods.ofdm, ...brightMethods.infrared]) expect(overlaps(groupBox('spread'), nodeBox(id)), id).toBe(false)

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const name of ['802.11-1997', '802.11b', '802.11a', '802.11g', 'FHSS', 'DSSS', 'OFDM', '적외선', '대역 확산', '넓은 범위에 펼친다', '부반송파에 나눠 싣는다', '전파 대신', '2.4GHz', '5GHz', '10m 안팎']) {
      expect(body, name).toContain(name)
    }
  })
}

describe('WlanTransmissionDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<WlanTransmissionDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 256')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('대역 확산')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 240')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '대역 확산' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><WlanTransmissionDiagram /><WlanTransmissionDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '대역 확산' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<WlanTransmissionDiagram />)
    const text = visualsByTopicId[topicId].diagrams['wlan-transmission']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(wlanTransmissionScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = wlanTransmissionScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 무선 LAN의 전송 방식 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
