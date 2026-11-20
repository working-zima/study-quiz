import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { L4SwitchNatDiagram, l4SwitchNatScenarios } from './L4SwitchNatDiagram'

const topicId = 'network-devices'
const anchorConceptId = `${topicId}.l4-switch`
const labels: Record<string, string> = {
  'client': '클라이언트',
  'switch': 'L4 스위치',
  'web01': 'WEB01 192.0.2.11',
  'web02': 'WEB02 192.0.2.12',
  'req-front': '목적지: 192.0.2.100:80',
  'res-front': '출발지: 192.0.2.100:80',
  'req-back': '목적지: 192.0.2.11:80',
  'res-back': '출발지: 192.0.2.11:80',
}
const groupLabels: Record<string, string> = {
  'front': '클라이언트와 L4 스위치 사이',
  'back': 'L4 스위치와 WEB01 사이',
}
const noteLabels: Record<string, string> = {
  'request-note': '목적지를 WEB01의 주소로 바꾼다',
  'response-note': '출발지를 가상 주소로 되돌린다',
}
const exampleNoteLabels: Record<string, string> = {
  'address-note': '가상 주소 192.0.2.100',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
// 앞 구간 박스는 클라이언트와 스위치 사이의 칸 둘, 뒤 구간 박스는 스위치와 WEB01 사이의 칸 둘을 담는다. 장치는 박스 밖에 있다.
const members: Record<string, string[]> = {
  'front': ['req-front', 'res-front'],
  'back': ['req-back', 'res-back'],
}
// 화살표는 패킷을 보낸 쪽의 변에서 나가 받은 쪽의 변에서 끝난다. 요청과 응답은 따로 나란한 화살표다.
const pathEnds: Record<string, [string, string]> = {
  'req-client-switch': ['client', 'switch'],
  'req-switch-web01': ['switch', 'web01'],
  'res-web01-switch': ['web01', 'switch'],
  'res-switch-client': ['switch', 'client'],
}
const tallPaths: Record<string, string> = {
  'req-client-switch': 'M40 40 V110',
  'req-switch-web01': 'M40 142 V252',
  'res-web01-switch': 'M72 252 V142',
  'res-switch-client': 'M72 110 V40',
}
const widePaths: Record<string, string> = {
  'req-client-switch': 'M112 66 H172',
  'req-switch-web01': 'M268 66 H312',
  'res-web01-switch': 'M312 78 H268',
  'res-switch-client': 'M172 78 H112',
}

const question = 'L4 스위치는 요청의 무엇을 바꿔 서버로 보낼까?'
const figureName = 'L4 스위치가 가상 주소 192.0.2.100으로 온 요청의 목적지를 WEB01의 주소 192.0.2.11로 바꿔 넘기고, WEB01의 응답은 출발지를 192.0.2.100으로 되돌려 클라이언트에 보내는 모습을 보이는 도식'
const svgName = '클라이언트와 L4 스위치, 웹 서버 WEB01·WEB02를 차례로 두고, 스위치 앞뒤 구간마다 패킷에 적힌 주소와 포트 번호를 적은 그림'
const idleCaption = '클라이언트는 L4 스위치의 가상 주소 192.0.2.100으로 요청을 보내고, 스위치 뒤에는 웹 서버 WEB01과 WEB02가 있다. 버튼을 고르면 요청과 응답이 스위치를 지날 때 패킷에 적힌 주소가 어떻게 바뀌는지 볼 수 있다.'
const legend = '화살표는 패킷이 가는 쪽이다. 칸에는 그 구간을 지나는 패킷에 적힌 주소와 포트 번호를 주소:포트 꼴로 적었다. 192.0.2.100은 서버 묶음을 대표하는 가상 주소이고, 주소는 문서의 예로 쓰라고 남겨 둔 주소다. WEB01·WEB02는 예로 붙인 이름표다.'
const expectedScenarios = [
  {
    id: 'request', label: '요청',
    nodes: ['client', 'switch', 'web01', 'req-front', 'req-back'],
    paths: ['req-client-switch', 'req-switch-web01'],
    notes: ['request-note'],
    caption: '클라이언트가 192.0.2.100:80으로 보낸 요청을 L4 스위치가 받아 WEB01을 고르고, 패킷의 목적지를 192.0.2.11:80으로 바꿔 WEB01에 넘긴다. 포트 번호 80은 그대로다.',
  },
  {
    id: 'response', label: '응답',
    nodes: ['client', 'switch', 'web01', 'res-back', 'res-front'],
    paths: ['res-web01-switch', 'res-switch-client'],
    notes: ['response-note'],
    caption: 'WEB01이 출발지가 192.0.2.11:80인 응답을 보내면, L4 스위치가 출발지를 192.0.2.100:80으로 되돌려 클라이언트에 보낸다. 클라이언트가 보기에는 처음부터 192.0.2.100과 주고받은 것이다.',
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
const exampleNote = (id: string) => svg().querySelector(`[data-example-note="${id}"]`)!
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

// 「칸 이름: 값」 노드에서 값만 떼어 낸다. 예: '목적지: 192.0.2.11:80' → { field: '목적지', address: '192.0.2.11', port: '80' }
function headerValue(id: string) {
  const [field, value] = label(id).split(': ')
  const [address, port] = value.split(':')
  return { field, address, port }
}

function layoutTests(wide: boolean) {
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 220] : [0, 0, 280, 304]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<L4SwitchNatDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표와 시나리오 곁말 없이 선택 안내가 나오며, 가상 주소 곁말은 늘 L4 스위치에 붙어 있다', () => {
    const { container } = render(<L4SwitchNatDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(exampleNote('address-note').textContent).toBe(exampleNoteLabels['address-note'])
    expect(exampleNote('address-note').closest('[data-node]')).toHaveAttribute('data-node', 'switch')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<L4SwitchNatDiagram />)
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
    expect(exampleNote('address-note').textContent).toBe(exampleNoteLabels['address-note'])
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·그룹 라벨·곁말이 자리에 들어간다`, async () => {
    render(<L4SwitchNatDiagram />)
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
    for (const group of groupIds) for (const other of groupIds.filter((otherId) => otherId !== group)) expect(overlaps(groupBox(group), groupBox(other)), `${group} ↔ ${other}`).toBe(false)
    // 곁말은 viewBox 안, 그룹 박스 밖에 들어가고, 노드·그룹 라벨·선과 겹치지 않는다. 같이 보이는 곁말끼리도 겹치지 않는다.
    expect(exampleNote('address-note')).toHaveAttribute('font-size', '9')
    const exampleBox = textBox(exampleNote('address-note'), 'address-note')
    const seen: string[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const visible = [exampleBox, ...scenario.notes.map((id) => textBox(note(id), id))]
      seen.push(...scenario.notes)
      expect(boxesOutsideViewBox(visible, viewBox)).toEqual([])
      for (const box of visible) {
        for (const group of groupIds) expect(overlaps(box, groupBox(group)), `${box.id}는 ${group} 박스 밖`).toBe(false)
        for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(overlaps(box, groupLabelBox(group)), `${box.id} ↔ ${group} 라벨`).toBe(false)
        for (const other of visible.filter(({ id }) => id !== box.id)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
        for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
      }
    }
    expect([...seen].sort()).toEqual([...noteIds].sort())
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 보낸 쪽의 변에서 시작해 받은 쪽의 변에서 끝나고, 노드 안이나 그룹 박스·그룹 라벨을 지나지 않는다', () => {
    render(<L4SwitchNatDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(pathEnds)))
    for (const [id, d] of Object.entries(paths)) {
      const { start, end } = lineEnds(d)
      expect(onEdge(start, nodeBox(pathEnds[id][0])), `${id} 시작`).toBe(true)
      expect(onEdge(end, nodeBox(pathEnds[id][1])), `${id} 끝`).toBe(true)
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) {
          expect(touches(segment, groupBox(group)), `${id} ↔ ${group} 박스`).toBe(false)
          expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
        }
      }
    }
  })

  // 요점: 요청에서는 스위치 앞 칸과 뒤 칸이 같은 「목적지」 칸인데 주소가 가상 주소에서 WEB01의 주소로 바뀌고 포트 번호는 같다.
  // 응답에서는 화살표의 끝점이 요청과 뒤바뀌어(WEB01 → 스위치 → 클라이언트) 가고, 「출발지」 칸의 주소가 WEB01의 주소에서 가상 주소로 되돌아간다.
  it('스위치는 요청의 목적지 주소를 고른 서버의 주소로 바꾸고, 응답의 출발지 주소를 가상 주소로 되돌린다', async () => {
    render(<L4SwitchNatDiagram />)
    const startNode = (pathId: string) => nodeIds.find((id) => onEdge(lineEnds(paths[pathId]).start, nodeBox(id)))
    const endNode = (pathId: string) => nodeIds.find((id) => onEdge(lineEnds(paths[pathId]).end, nodeBox(id)))

    await select('요청')
    const requestHops = shownPaths().map((id) => [startNode(id), endNode(id)])
    expect(requestHops).toEqual([['client', 'switch'], ['switch', 'web01']])
    const front = headerValue('req-front')
    const back = headerValue('req-back')
    expect([front.field, back.field]).toEqual(['목적지', '목적지'])
    expect(front.address).toBe('192.0.2.100')
    expect(back.address).toBe('192.0.2.11')
    expect(front.address).not.toBe(back.address)
    expect(front.port).toBe(back.port)
    expect(labels.web01).toContain(back.address)
    expect(contains(groupBox('front'), nodeBox('req-front'))).toBe(true)
    expect(contains(groupBox('back'), nodeBox('req-back'))).toBe(true)
    expect(opacity('web02')).toBe('0.25')

    await select('응답')
    const responseHops = shownPaths().map((id) => [startNode(id), endNode(id)])
    expect(responseHops).toEqual([['web01', 'switch'], ['switch', 'client']])
    expect(responseHops.map(([from, to]) => [to, from]).reverse()).toEqual(requestHops)
    const resBack = headerValue('res-back')
    const resFront = headerValue('res-front')
    expect([resBack.field, resFront.field]).toEqual(['출발지', '출발지'])
    expect(resBack.address).toBe(back.address)
    expect(resFront.address).toBe(front.address)
    expect(resFront.port).toBe(resBack.port)
    for (const id of ['req-front', 'req-back']) expect(opacity(id), id).toBe('0.25')

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const name of ['가상 주소가 `192.0.2.100`인 L4 스위치', '`WEB01`(`192.0.2.11`)', '`WEB02`(`192.0.2.12`)', '`192.0.2.100:80`에서 `192.0.2.11:80`으로 바꿔', '출발지가 `192.0.2.11:80`인 응답', '출발지가 `192.0.2.100:80`으로 바뀌어', '포트 번호 `80`은 그대로 둔다']) {
      expect(body, name).toContain(name)
    }
  })
}

describe('L4SwitchNatDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<L4SwitchNatDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 304')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('응답')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 220')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '응답' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><L4SwitchNatDiagram /><L4SwitchNatDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '요청' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<L4SwitchNatDiagram />)
    const text = visualsByTopicId[topicId].diagrams['l4-switch-nat']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(l4SwitchNatScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual({ ...exampleNoteLabels, ...noteLabels })
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
      const scenario = l4SwitchNatScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 L4 스위치 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
