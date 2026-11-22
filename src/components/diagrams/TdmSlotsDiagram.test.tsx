import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { TdmSlotsDiagram, tdmSlotsScenarios } from './TdmSlotsDiagram'

const topicId = 'transmission-media'
const anchorConceptId = `${topicId}.tdm`
const labels: Record<string, string> = {
  'in-a': 'A: 데이터 있음',
  'in-b': 'B: 데이터 없음',
  'in-c': 'C: 데이터 있음',
  'in-d': 'D: 데이터 없음',
  'mux': '다중화기',
  'sync-a': 'A의 데이터',
  'sync-b': 'B의 빈 칸',
  'sync-c': 'C의 데이터',
  'sync-d': 'D의 빈 칸',
  'async-a': '꼬리표 A + 데이터',
  'async-c': '꼬리표 C + 데이터',
}
const groupLabels: Record<string, string> = {
  'sync': '동기식',
  'async': '비동기식',
}
// 동기식 박스에는 칸 넷, 비동기식 박스에는 칸 둘이 있고, 입력과 다중화기는 두 박스 밖에 있다.
const members: Record<string, string[]> = {
  'sync': ['sync-a', 'sync-b', 'sync-c', 'sync-d'],
  'async': ['async-a', 'async-c'],
}
const noteLabels: Record<string, string> = {
  'sync-note': 'B와 D의 칸은 빈 채로 간다',
  'async-note': '보낼 데이터가 있는 A와 C에만 칸을 준다',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
const inputIds = ['in-a', 'in-b', 'in-c', 'in-d']
// 늘 보이는 화살표는 입력 넷에서 다중화기로 가는 길이고, 다중화기에서 칸의 열로 가는 화살표는 그 시나리오를 골랐을 때만 보인다.
const linkEnds: Record<string, [string, string]> = {
  'in-a-mux': ['in-a', 'mux'],
  'in-b-mux': ['in-b', 'mux'],
  'in-c-mux': ['in-c', 'mux'],
  'in-d-mux': ['in-d', 'mux'],
}
const pathEnds: Record<string, [string, string]> = {
  ...linkEnds,
  'mux-sync': ['mux', 'sync-a'],
  'mux-async': ['mux', 'async-a'],
}
const tallPaths: Record<string, string> = {
  'in-a-mux': 'M108 24 H132 V72 H168',
  'in-b-mux': 'M108 64 H124 V80 H168',
  'in-c-mux': 'M108 104 H124 V88 H168',
  'in-d-mux': 'M108 144 H132 V96 H168',
  'mux-sync': 'M192 100 V164 H72 V196',
  'mux-async': 'M224 100 V196',
}
const widePaths: Record<string, string> = {
  'in-a-mux': 'M108 24 H124 V72 H132',
  'in-b-mux': 'M108 64 H116 V80 H132',
  'in-c-mux': 'M108 104 H116 V88 H132',
  'in-d-mux': 'M108 144 H124 V96 H132',
  'mux-sync': 'M196 76 H208 V44 H220',
  'mux-async': 'M188 100 V176 H304 V44 H316',
}

const question = '보낼 데이터가 없는 입력의 칸은 어떻게 될까?'
const figureName = '입력 A·B·C·D 가운데 A와 C에 보낼 데이터가 있을 때, 동기식 시분할 다중화는 칸 넷을 채워 둘을 빈 칸으로 보내고 비동기식 시분할 다중화는 꼬리표를 붙인 칸 둘을 채우는 모습을 견주는 도식'
const svgName = '입력 A·B·C·D를 다중화기에 잇고, 다중화기가 채우는 동기식 칸 넷의 열과 비동기식 칸 둘의 열을 나란히 둔 그림'
const idleCaption = '입력 A·B·C·D 가운데 이번 바퀴에 보낼 데이터가 있는 것은 A와 C다. 버튼으로 동기식이나 비동기식을 고르면 다중화기가 회선의 칸을 어떻게 채우는지 볼 수 있다.'
const legend = '화살표는 입력의 데이터가 다중화기로 가고, 다중화기가 채운 칸들이 회선으로 나가는 길이다. 열마다 칸은 위에서 아래 차례로 회선을 지나간다.'
const expectedScenarios = [
  {
    id: 'sync', label: '동기식',
    nodes: [...inputIds, 'mux', ...members.sync],
    paths: ['mux-sync'],
    notes: ['sync-note'],
    caption: '동기식 시분할 다중화는 입력 A·B·C·D에 칸을 하나씩 늘 정해 준다. 이번 바퀴에 보낼 데이터가 없는 B와 D의 칸도 다른 입력이 쓰지 못한 채 빈 칸으로 회선을 지나가, 칸 넷 가운데 둘만 데이터를 나른다.',
  },
  {
    id: 'async', label: '비동기식',
    nodes: [...inputIds, 'mux', ...members.async],
    paths: ['mux-async'],
    notes: ['async-note'],
    caption: '비동기식 시분할 다중화는 칸을 미리 정해 두지 않고, 이번 바퀴에 보낼 데이터가 있는 A와 C의 데이터로 칸 둘을 채운다. 칸의 자리로는 누구의 것인지 알 수 없으므로 칸마다 어느 입력의 것인지 알리는 꼬리표를 붙인다.',
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
const shownLinks = () => Array.from(svg().querySelectorAll('[data-link]'), (link) => link.getAttribute('data-link')!)
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note')!)
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)!
const opacity = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')
const sharpNodes = () => nodeIds.filter((id) => opacity(id) === '1')

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

// 두 선분이 서로 가로지르거나(한쪽은 가로, 다른 쪽은 세로) 같은 직선 위에서 길이가 있는 구간을 함께 쓰는가. 끝점끼리 닿는 것은 뺀다.
function meets(a: Segment, b: Segment) {
  const shared = (a1: number, a2: number, b1: number, b2: number) => Math.min(Math.max(a1, a2), Math.max(b1, b2)) - Math.max(Math.min(a1, a2), Math.min(b1, b2)) > 0
  const between = (value: number, end1: number, end2: number) => value > Math.min(end1, end2) && value < Math.max(end1, end2)
  const aVertical = a.x1 === a.x2
  const bVertical = b.x1 === b.x2
  if (aVertical && bVertical) return a.x1 === b.x1 && shared(a.y1, a.y2, b.y1, b.y2)
  if (!aVertical && !bVertical) return a.y1 === b.y1 && shared(a.x1, a.x2, b.x1, b.x2)
  const [vertical, horizontal] = aVertical ? [a, b] : [b, a]
  return between(vertical.x1, horizontal.x1, horizontal.x2) && between(horizontal.y1, vertical.y1, vertical.y2)
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

// 보이는 화살표가 어느 노드의 변에서 끝나는지 그림에서 읽는다.
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 204] : [0, 0, 280, 360]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<TdmSlotsDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고, 입력에서 다중화기로 가는 화살표만 있고 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<TdmSlotsDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownLinks()).toEqual(Object.keys(linkEnds))
    for (const link of svg().querySelectorAll('[data-link]')) {
      expect(link).toHaveAttribute('d', paths[link.getAttribute('data-link')!])
      expect(link).toHaveClass('stroke-muted')
      expect(link).toHaveAttribute('stroke-width', '1.5')
      expect(link).toHaveAttribute('marker-end', `url(#${svg().querySelector('marker')!.id})`)
    }
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 칸의 열과 화살표·곁말만 선명하고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<TdmSlotsDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownLinks()).toEqual(Object.keys(linkEnds))
    expect(shownPaths()).toEqual(scenario.paths)
    for (const path of svg().querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('d', paths[path.getAttribute('data-path')!])
      expect(path).toHaveClass('stroke-title')
      expect(path).toHaveAttribute('stroke-width', '2')
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
    render(<TdmSlotsDiagram />)
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
    for (const a of groupIds) for (const b of groupIds.filter((other) => other !== a)) expect(overlaps(groupBox(a), groupBox(b)), `${a} ↔ ${b}`).toBe(false)
    // 곁말은 두 박스 밖의 빈자리에 들어가고, 노드와는 위아래 4 이상 띄우며 선에 닿지 않는다.
    const noteBoxes: SvgBox[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of scenario.notes) noteBoxes.push(textBox(note(id), id))
    }
    expect([...noteBoxes.map(({ id }) => id)].sort()).toEqual([...noteIds].sort())
    expect(boxesOutsideViewBox(noteBoxes, viewBox)).toEqual([])
    for (const box of noteBoxes) {
      for (const node of nodeIds) {
        const nodeArea = nodeBox(node)
        expect(overlaps(box, { ...nodeArea, y: nodeArea.y - 4, height: nodeArea.height + 8 }), `${box.id} ↔ ${node}`).toBe(false)
      }
      for (const group of groupIds) expect(overlaps(box, groupBox(group)), `${box.id} ↔ ${group}`).toBe(false)
      for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 앞 노드의 변에서 시작해 뒤 노드의 변에서 끝나고, 노드 안이나 그룹 라벨을 지나지 않으며 서로 만나지 않는다', () => {
    render(<TdmSlotsDiagram />)
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
    const ids = Object.keys(paths)
    for (const a of ids) for (const b of ids.filter((other) => other !== a)) {
      for (const sa of segments(paths[a])) for (const sb of segments(paths[b])) expect(meets(sa, sb), `${a} ↔ ${b}`).toBe(false)
    }
  })

  // 요점: 동기식은 입력 넷에 칸 넷을 주어 B와 D의 칸 둘이 빈 칸으로 가고, 비동기식은 보낼 데이터가 있는 A와 C의 칸 둘만 꼬리표를 붙여 채운다.
  // 두 시나리오의 선명한 칸은 서로 겹치지 않고, 다중화기에서 나가는 화살표는 고른 방식의 박스 안 칸에서 끝난다.
  it('동기식은 칸 넷 가운데 둘이 빈 칸이고, 비동기식은 꼬리표 붙은 칸 둘만 쓴다', async () => {
    render(<TdmSlotsDiagram />)
    const slotIds = [...members.sync, ...members.async]
    const sharpSlots: Record<string, string[]> = {}
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      sharpSlots[scenario.id] = sharpNodes().filter((id) => slotIds.includes(id))
      for (const id of sharpSlots[scenario.id]) expect(contains(groupBox(scenario.id), nodeBox(id)), `${scenario.id} ${id}`).toBe(true)
      const target = endpointNode(lineEnds(paths[shownPaths()[0]]).end)!
      expect(members[scenario.id], scenario.id).toContain(target)
    }
    expect(sharpSlots.sync).toHaveLength(4)
    expect(sharpSlots.sync.filter((id) => label(id).endsWith('빈 칸'))).toEqual(['sync-b', 'sync-d'])
    expect(sharpSlots.sync.filter((id) => !label(id).endsWith('빈 칸')).map(label)).toEqual(['A의 데이터', 'C의 데이터'])
    expect(sharpSlots.async).toHaveLength(2)
    expect(sharpSlots.async.map(label)).toEqual(['꼬리표 A + 데이터', '꼬리표 C + 데이터'])
    expect(sharpSlots.sync.filter((id) => sharpSlots.async.includes(id))).toEqual([])
    // 열마다 칸은 빈틈없이 위에서 아래로 이어진다.
    for (const column of Object.values(members)) {
      for (let index = 1; index < column.length; index += 1) {
        expect(nodeBox(column[index]).y, column[index]).toBe(nodeBox(column[index - 1]).y + 32)
        expect(nodeBox(column[index]).x, column[index]).toBe(nodeBox(column[index - 1]).x)
      }
    }

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const phrase of ['입력 A·B·C·D', 'A의 데이터', 'C의 데이터', '빈 칸', '꼬리표 A', '꼬리표 C', '다중화기', '동기식', '비동기식']) {
      expect(body, phrase).toContain(phrase)
    }
  })
}

describe('TdmSlotsDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<TdmSlotsDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 360')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('비동기식')
      const tallNotes = shownNotes()
      const tallSharp = sharpNodes()
      const tallShown = shownPaths()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 204')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '비동기식' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownNotes()).toEqual(tallNotes)
      expect(sharpNodes()).toEqual(tallSharp)
      expect(shownPaths()).toEqual(tallShown)
      for (const link of svg().querySelectorAll('[data-link]')) expect(link).toHaveAttribute('d', widePaths[link.getAttribute('data-link')!])
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', () => {
    render(<><TdmSlotsDiagram /><TdmSlotsDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      for (const path of figure.querySelectorAll('[data-link]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<TdmSlotsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['tdm-slots']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(tdmSlotsScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = tdmSlotsScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 시분할 다중화 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
