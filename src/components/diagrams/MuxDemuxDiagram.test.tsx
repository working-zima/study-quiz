import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { MuxDemuxDiagram, muxDemuxScenarios } from './MuxDemuxDiagram'

const topicId = 'transmission-media'
const anchorConceptId = `${topicId}.multiplexing`
const labels: Record<string, string> = {
  'in-a': '입력 A',
  'in-b': '입력 B',
  'in-c': '입력 C',
  'mux': '다중화기',
  'fdm-1': '구간 1',
  'fdm-2': '구간 2',
  'fdm-3': '구간 3',
  'tdm-a': '슬롯 A',
  'tdm-b': '슬롯 B',
  'tdm-c': '슬롯 C',
  'wdm-1': 'λ1',
  'wdm-2': 'λ2',
  'wdm-3': 'λ3',
  'demux': '역다중화기',
  'out-a': '출력 A',
  'out-b': '출력 B',
  'out-c': '출력 C',
}
const groupLabels: Record<string, string> = {
  'line': '회선 하나',
}
// 회선 하나 박스에는 방식마다의 칸 줄 셋만 있고, 입력·다중화기·역다중화기·출력은 박스 밖에 있다.
const cells: Record<string, string[]> = {
  fdm: ['fdm-1', 'fdm-2', 'fdm-3'],
  tdm: ['tdm-a', 'tdm-b', 'tdm-c'],
  wdm: ['wdm-1', 'wdm-2', 'wdm-3'],
}
const members: Record<string, string[]> = {
  'line': Object.values(cells).flat(),
}
const noteLabels: Record<string, string> = {
  'fdm-note': '신호마다 주파수 구간을 따로 준다',
  'tdm-note': '신호마다 타임 슬롯을 차례로 준다',
  'wdm-note': '신호마다 다른 파장의 빛을 준다',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
const chainIds = ['in-a', 'in-b', 'in-c', 'mux', 'demux', 'out-a', 'out-b', 'out-c']
// 늘 보이는 화살표는 입력 셋에서 다중화기로, 다중화기에서 회선 하나를 지나 역다중화기로, 역다중화기에서 출력 셋으로 가는 길이다.
const linkEnds: Record<string, [string, string]> = {
  'in-a-mux': ['in-a', 'mux'],
  'in-b-mux': ['in-b', 'mux'],
  'in-c-mux': ['in-c', 'mux'],
  'mux-demux': ['mux', 'demux'],
  'demux-out-a': ['demux', 'out-a'],
  'demux-out-b': ['demux', 'out-b'],
  'demux-out-c': ['demux', 'out-c'],
}
const tallPaths: Record<string, string> = {
  'in-a-mux': 'M52 40 V72',
  'in-b-mux': 'M140 40 V52 H76 V72',
  'in-c-mux': 'M228 40 V60 H84 V72',
  'mux-demux': 'M52 104 V268',
  'demux-out-a': 'M52 300 V332',
  'demux-out-b': 'M76 300 V320 H140 V332',
  'demux-out-c': 'M84 300 V312 H228 V332',
}
const widePaths: Record<string, string> = {
  'in-a-mux': 'M52 112 H72 V136',
  'in-b-mux': 'M52 152 H62',
  'in-c-mux': 'M52 192 H80 V168',
  'mux-demux': 'M126 152 H302',
  'demux-out-a': 'M358 136 V112 H384',
  'demux-out-b': 'M374 152 H384',
  'demux-out-c': 'M366 168 V192 H384',
}

const question = '여러 신호가 회선 하나를 어떻게 함께 쓸까?'
const figureName = '입력 A·B·C의 신호를 다중화기가 회선 하나로 함께 보내고 역다중화기가 출력 A·B·C로 다시 나누는 모습과, 주파수·시간·파장 가운데 무엇으로 회선을 나눠 쓰는지 보이는 도식'
const svgName = '입력 A·B·C를 다중화기에, 다중화기를 회선 하나 박스를 지나 역다중화기에, 역다중화기를 출력 A·B·C에 잇고, 회선 하나 박스 안에 주파수 구간·타임 슬롯·파장의 칸 줄 셋을 둔 그림'
const idleCaption = '다중화기는 입력 A·B·C의 신호를 합쳐 회선 하나로 보내고, 역다중화기는 그것을 다시 나눠 출력 A·B·C로 보낸다. 버튼으로 주파수 분할·시분할·파장 분할을 고르면 회선을 무엇으로 나눠 쓰는지 볼 수 있다.'
const legend = '화살표는 신호가 입력에서 다중화기·회선·역다중화기를 지나 출력으로 가는 길이다. 회선 하나 박스 안의 칸 줄 셋은 방식마다 회선을 나눈 몫이다.'
const expectedScenarios = [
  {
    id: 'fdm', label: '주파수 분할',
    nodes: [...chainIds, ...cells.fdm],
    paths: [] as string[],
    notes: ['fdm-note'],
    caption: '주파수 분할 다중화는 회선으로 보낼 수 있는 주파수 범위를 구간으로 나눠 입력 A·B·C에 구간 1·2·3을 하나씩 준다. 세 신호는 같은 때에 회선을 지나고, 역다중화기는 주파수 구간으로 신호를 가른다.',
  },
  {
    id: 'tdm', label: '시분할',
    nodes: [...chainIds, ...cells.tdm],
    paths: [] as string[],
    notes: ['tdm-note'],
    caption: '시분할 다중화는 시간을 타임 슬롯으로 나눠 A·B·C 차례로 칸을 채우고 이 차례를 되풀이한다. 한 칸 동안에는 한 신호만 회선을 지나고, 역다중화기는 칸이 어느 신호의 것인지로 신호를 가른다.',
  },
  {
    id: 'wdm', label: '파장 분할',
    nodes: [...chainIds, ...cells.wdm],
    paths: [] as string[],
    notes: ['wdm-note'],
    caption: '파장 분할 다중화는 광섬유 한 가닥에 파장이 서로 다른 빛 λ1·λ2·λ3을 함께 싣고 입력 A·B·C를 하나씩 맡긴다. 역다중화기는 섞여 온 빛을 파장마다 갈라 출력 A·B·C로 보낸다.',
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 216] : [0, 0, 280, 372]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<MuxDemuxDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고, 늘 보이는 신호 길만 있고 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<MuxDemuxDiagram />)
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

  it.each(expectedScenarios)('$label: 고른 칸 줄과 곁말만 선명하고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<MuxDemuxDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownLinks()).toEqual(Object.keys(linkEnds))
    expect(shownPaths()).toEqual(scenario.paths)
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
    render(<MuxDemuxDiagram />)
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
    // 곁말은 회선 하나 박스 밖의 빈자리에 들어가고, 노드와는 위아래 4 이상 띄우며 선에 닿지 않는다.
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
    render(<MuxDemuxDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(linkEnds)))
    for (const [id, d] of Object.entries(paths)) {
      const { start, end } = lineEnds(d)
      expect(onEdge(start, nodeBox(linkEnds[id][0])), `${id} 시작`).toBe(true)
      expect(onEdge(end, nodeBox(linkEnds[id][1])), `${id} 끝`).toBe(true)
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

  // 요점: 세 방식의 선명한 칸 줄이 서로 겹치지 않고, 칸 줄은 모두 회선 하나 박스 안에 서로 다른 자리에 있다.
  // 어느 방식이든 입력 A에서 출력 A까지 보이는 화살표를 따라가면 다중화기 → 회선 하나 박스 → 역다중화기를 지난다.
  it('세 방식은 회선을 나누는 칸이 다르고, 신호의 길은 같다', async () => {
    render(<MuxDemuxDiagram />)
    for (const [method, ids] of Object.entries(cells)) {
      for (const id of ids) expect(contains(groupBox('line'), nodeBox(id)), `${method} ${id}`).toBe(true)
    }
    const sharpCells: Record<string, string[]> = {}
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      sharpCells[scenario.id] = sharpNodes().filter((id) => members.line.includes(id))
      expect(sharpCells[scenario.id]).toEqual(cells[scenario.id])

      const route = ['in-a']
      while (route[route.length - 1] !== 'out-a') {
        const from = route[route.length - 1]
        const next = shownLinks()
          .map((id) => ({ id, ends: lineEnds(paths[id]) }))
          .find(({ id, ends }) => endpointNode(ends.start) === from && (id === 'demux-out-a' || !id.startsWith('demux-out')))
        route.push(endpointNode(next!.ends.end)!)
      }
      expect(route, scenario.id).toEqual(['in-a', 'mux', 'demux', 'out-a'])
      expect(segments(paths['mux-demux']).some((segment) => touches(segment, groupBox('line'))), scenario.id).toBe(true)
    }
    const methods = Object.keys(sharpCells)
    for (const a of methods) for (const b of methods.filter((other) => other !== a)) {
      expect(sharpCells[a].filter((id) => sharpCells[b].includes(id)), `${a} ↔ ${b}`).toEqual([])
    }

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const phrase of ['입력 A·B·C', '주파수 구간 1·2·3', '슬롯 A·B·C', 'λ1·λ2·λ3', '출력 A', '다중화기', '역다중화기', '회선 하나']) {
      expect(body, phrase).toContain(phrase)
    }
  })
}

describe('MuxDemuxDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<MuxDemuxDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 372')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('시분할')
      const tallNotes = shownNotes()
      const tallSharp = sharpNodes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 216')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '시분할' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownNotes()).toEqual(tallNotes)
      expect(sharpNodes()).toEqual(tallSharp)
      for (const link of svg().querySelectorAll('[data-link]')) expect(link).toHaveAttribute('d', widePaths[link.getAttribute('data-link')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', () => {
    render(<><MuxDemuxDiagram /><MuxDemuxDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      for (const path of figure.querySelectorAll('[data-link]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<MuxDemuxDiagram />)
    const text = visualsByTopicId[topicId].diagrams['mux-demux']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(muxDemuxScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = muxDemuxScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 다중화 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
