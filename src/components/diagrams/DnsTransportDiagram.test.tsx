import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { DnsTransportDiagram, dnsTransportScenarios } from './DnsTransportDiagram'

const topicId = 'dns'
const anchorConceptId = `${topicId}.dns-transport`
const labels: Record<string, string> = {
  client: '클라이언트',
  server: '로컬 DNS 서버',
  query: 'UDP 53으로 질의',
  answer: 'UDP로 응답',
  truncated: 'UDP로 잘린 응답',
  'tcp-query': 'TCP 53으로 질의',
  'tcp-answer': 'TCP로 응답',
}
const groupLabels: Record<string, string> = {
  'client-side': '192.0.2.10',
  'server-side': '192.0.2.53',
}
const noteLabels: Record<string, string> = {
  'answer-note': '연결을 맺지 않는다',
  'truncated-note': '잘렸다는 표시가 켜져 있다',
  'tcp-query-note': '연결을 맺고 다시 묻는다',
  'tcp-answer-note': '잘리지 않고 온다',
}
const noteScenarios: Record<string, string> = {
  'answer-note': 'udp',
  'truncated-note': 'truncated',
  'tcp-query-note': 'truncated',
  'tcp-answer-note': 'truncated',
}
// 곁말은 자기 메시지 노드 바로 아래에 놓인다.
const noteNode: Record<string, string> = {
  'answer-note': 'answer',
  'truncated-note': 'truncated',
  'tcp-query-note': 'tcp-query',
  'tcp-answer-note': 'tcp-answer',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const messageIds = ['query', 'answer', 'truncated', 'tcp-query', 'tcp-answer']
const queryIds = ['query', 'tcp-query']
const answerIds = ['answer', 'truncated', 'tcp-answer']

const tallPaths: Record<string, string> = {
  'query-out': 'M72 80 H84',
  'query-in': 'M196 80 H208',
  'answer-out': 'M208 128 H196',
  'answer-in': 'M84 128 H72',
  'truncated-out': 'M208 192 H196',
  'truncated-in': 'M84 192 H72',
  'tcp-query-out': 'M72 256 H84',
  'tcp-query-in': 'M196 256 H208',
  'tcp-answer-out': 'M208 320 H196',
  'tcp-answer-in': 'M84 320 H72',
}
const widePaths: Record<string, string> = {
  'query-out': 'M96 80 H140',
  'query-in': 'M300 80 H344',
  'answer-out': 'M344 128 H300',
  'answer-in': 'M140 128 H96',
  'truncated-out': 'M344 192 H300',
  'truncated-in': 'M140 192 H96',
  'tcp-query-out': 'M96 256 H140',
  'tcp-query-in': 'M300 256 H344',
  'tcp-answer-out': 'M344 320 H300',
  'tcp-answer-in': 'M140 320 H96',
}
// 화살표마다 시작과 끝이 닿는 상자. 기둥(그룹 박스)이나 메시지 노드다.
// 질의는 클라이언트 기둥에서 서버 기둥으로, 응답은 서버 기둥에서 클라이언트 기둥으로 간다.
const ends: Record<string, [string, string]> = {
  'query-out': ['client-side', 'query'],
  'query-in': ['query', 'server-side'],
  'answer-out': ['server-side', 'answer'],
  'answer-in': ['answer', 'client-side'],
  'truncated-out': ['server-side', 'truncated'],
  'truncated-in': ['truncated', 'client-side'],
  'tcp-query-out': ['client-side', 'tcp-query'],
  'tcp-query-in': ['tcp-query', 'server-side'],
  'tcp-answer-out': ['server-side', 'tcp-answer'],
  'tcp-answer-in': ['tcp-answer', 'client-side'],
}

const question = 'DNS는 언제 UDP를 쓰고 언제 TCP를 쓸까?'
const figureName = '클라이언트가 로컬 DNS 서버에 이름을 물을 때 보통은 UDP로 묻고 답하지만, 응답이 잘리면 같은 질의를 TCP로 다시 묻는 차례를 보이는 도식'
const svgName = '왼쪽 클라이언트와 오른쪽 로컬 DNS 서버 두 기둥 사이에 UDP 53으로 질의, UDP로 응답, UDP로 잘린 응답, TCP 53으로 질의, TCP로 응답을 위에서 아래로 놓은 그림'
const idleCaption = '클라이언트 192.0.2.10이 로컬 DNS 서버 192.0.2.53에 www.example.com의 IP 주소를 묻는 동안 오가는 메시지를 차례대로 위에서 아래로 놓았다. 두 주소는 예로 붙인 것이다. 버튼을 고르면 보통의 질의와, 응답이 커서 잘렸을 때를 볼 수 있다.'
const legend = '위의 두 노드는 클라이언트와 로컬 DNS 서버이고, 그 아래 박스에는 저마다의 IP 주소를 붙였다. 가운데 노드 하나가 메시지 하나이고, 화살표는 메시지가 가는 방향이다.'
const expectedScenarios = [
  {
    id: 'udp', label: '보통 질의',
    nodes: ['client', 'server', 'query', 'answer'],
    paths: ['query-out', 'query-in', 'answer-out', 'answer-in'],
    caption: '보통의 질의는 UDP로 보낸다. 클라이언트가 로컬 DNS 서버의 UDP 53번 포트로 질의 하나를 보내면 응답 하나가 돌아오고, 그 앞에 연결을 맺느라 기다리는 단계가 없다.',
  },
  {
    id: 'truncated', label: '큰 응답',
    nodes: ['client', 'server', 'query', 'truncated', 'tcp-query', 'tcp-answer'],
    paths: ['query-out', 'query-in', 'truncated-out', 'truncated-in', 'tcp-query-out', 'tcp-query-in', 'tcp-answer-out', 'tcp-answer-in'],
    caption: '응답이 UDP로 보내기에 커서 잘렸다는 표시가 켜진 채 오면, 클라이언트는 그 응답을 쓰지 않는다. 로컬 DNS 서버의 TCP 53번 포트로 연결을 맺고 같은 질의를 다시 보내, 잘리지 않은 응답을 받는다.',
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
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (item) => item.getAttribute('data-note')!)
const opacityOf = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function contains(outer: SvgBox, inner: SvgBox) {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height
}

// 글자 크기 9인 글자가 차지하는 상자. 반각 글자가 화면에서 더 넓게 그려지는 것을 생각해 폭을 1.15배로 잡는다.
function textBox(text: Element, id: string): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9) * 1.15
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id, x: left, y: y - 9, width, height: 9 }
}

type Segment = { x1: number, y1: number, x2: number, y2: number }

// 직교 경로를 선분 목록으로 편다. M/H/V만 나온다.
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

// 선분이 상자 안쪽을 지나는가. 변에 닿기만 하는 것은 세지 않는다.
function crossesInside(segment: Segment, box: SvgBox) {
  const left = Math.min(segment.x1, segment.x2)
  const right = Math.max(segment.x1, segment.x2)
  const top = Math.min(segment.y1, segment.y2)
  const bottom = Math.max(segment.y1, segment.y2)
  if (top === bottom) return top > box.y && top < box.y + box.height && Math.min(right, box.x + box.width) > Math.max(left, box.x)
  return left > box.x && left < box.x + box.width && Math.min(bottom, box.y + box.height) > Math.max(top, box.y)
}

// 선분이 상자에 닿는가. 변에 닿는 것도 센다.
function touches(segment: Segment, box: SvgBox) {
  const left = Math.min(segment.x1, segment.x2)
  const right = Math.max(segment.x1, segment.x2)
  const top = Math.min(segment.y1, segment.y2)
  const bottom = Math.max(segment.y1, segment.y2)
  return left <= box.x + box.width && right >= box.x && top <= box.y + box.height && bottom >= box.y
}

function onEdge(x: number, y: number, box: SvgBox) {
  const insideX = x >= box.x && x <= box.x + box.width
  const insideY = y >= box.y && y <= box.y + box.height
  return ((x === box.x || x === box.x + box.width) && insideY) || ((y === box.y || y === box.y + box.height) && insideX)
}

function lineEnds(d: string) {
  const list = segments(d)
  return { start: { x: list[0].x1, y: list[0].y1 }, end: { x: list[list.length - 1].x2, y: list[list.length - 1].y2 } }
}

// 끝점이 닿는 상자. 메시지 노드를 먼저 보고, 없으면 기둥을 본다.
const endAt = (point: { x: number, y: number }) => nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))
  ?? groupIds.find((id) => onEdge(point.x, point.y, groupBox(id)))
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 372] : [0, 0, 280, 372]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<DnsTransportDiagram />)
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
    const { container } = render(<DnsTransportDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<DnsTransportDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownNotes()).toEqual(Object.keys(noteScenarios).filter((id) => noteScenarios[id] === scenario.id))
    for (const id of shownNotes()) expect(note(id)!.textContent).toBe(noteLabels[id])
    expect(shownPaths()).toEqual(scenario.paths)
    for (const path of svg().querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('d', paths[path.getAttribute('data-path')!])
      expect(path).toHaveAttribute('stroke-width', '2')
      expect(path).toHaveClass('stroke-title')
      expect(path).toHaveAttribute('marker-end', `url(#${svg().querySelector('marker')!.id})`)
      expect(path.closest('[opacity]')).toBeNull()
    }
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말·그룹 라벨이 자리에 들어간다`, async () => {
    render(<DnsTransportDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    expect(overlaps(groupBox('client-side'), groupBox('server-side'))).toBe(false)
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
      // 메시지 노드와 머리 노드는 두 기둥에 들지 않는다.
      for (const group of groupIds) expect(overlaps(nodeBox(id), groupBox(group)), `${id} ↔ ${group}`).toBe(false)
    }
    const groupTexts = groupIds.map((id) => {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      return box
    })
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const noteTexts = shownNotes().map((id) => {
        const element = note(id)!
        expect(element).toHaveAttribute('font-size', '9')
        expect(element).toHaveClass('fill-muted')
        const box = textBox(element, id)
        for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(overlaps(box, groupBox(group)), `${id} ↔ ${group}`).toBe(false)
        // 곁말은 자기 메시지 노드 바로 아래 줄에 놓인다.
        const own = nodeBox(noteNode[id])
        expect(box.y, id).toBeGreaterThanOrEqual(own.y + own.height)
        expect(box.y - (own.y + own.height), id).toBeLessThanOrEqual(12)
        return box
      })
      for (const box of [...noteTexts, ...groupTexts]) {
        expect(box.x, box.id).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width, box.id).toBeLessThanOrEqual(viewBox[2])
        expect(box.y, box.id).toBeGreaterThanOrEqual(0)
        expect(box.y + box.height, box.id).toBeLessThanOrEqual(viewBox[3])
        for (const d of Object.values(paths)) {
          for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
        }
      }
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표의 양 끝은 메시지 노드나 기둥의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<DnsTransportDiagram />)
    for (const [id, d] of Object.entries(paths)) {
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
      const { start, end } = lineEnds(d)
      expect(endAt(start), `${id} 시작`).toBe(ends[id][0])
      expect(endAt(end), `${id} 끝`).toBe(ends[id][1])
    }
  })

  // 요점: 보통 질의에서는 TCP 메시지가 흐리고 그 화살표가 없다. 응답이 잘리면 잘린 응답 다음에 TCP로 다시 묻는다.
  // 질의는 클라이언트 쪽에서 서버 쪽으로, 응답은 서버 쪽에서 클라이언트 쪽으로 가고, 질의에 적힌 포트는 모두 53이다.
  it('보통 질의에서는 TCP 메시지가 흐리고, 큰 응답에서는 잘린 응답 다음에 TCP 53으로 다시 묻는다', async () => {
    render(<DnsTransportDiagram />)
    // 메시지는 질의 → 응답 → 잘린 응답 → TCP 질의 → TCP 응답 차례로 위에서 아래로 놓인다.
    const ys = messageIds.map((id) => nodeBox(id).y)
    expect([...ys].sort((a, b) => a - b)).toEqual(ys)
    expect(new Set(ys).size).toBe(messageIds.length)
    expect(nodeBox('tcp-query').y).toBeGreaterThan(nodeBox('truncated').y)
    expect(nodeBox('answer').y).not.toBe(nodeBox('truncated').y)
    // 머리 노드는 자기 기둥 위에 있다 — 클라이언트는 왼쪽, 로컬 DNS 서버는 오른쪽.
    expect(nodeBox('client').x).toBeLessThan(nodeBox('server').x)
    expect(groupBox('client-side').x).toBeLessThan(groupBox('server-side').x)
    // 질의 화살표는 클라이언트 기둥에서 나와 서버 기둥으로, 응답 화살표는 서버 기둥에서 나와 클라이언트 기둥으로 간다.
    for (const id of queryIds) {
      expect(endAt(lineEnds(paths[`${id}-out`]).start), id).toBe('client-side')
      expect(endAt(lineEnds(paths[`${id}-in`]).end), id).toBe('server-side')
    }
    for (const id of answerIds) {
      expect(endAt(lineEnds(paths[`${id}-out`]).start), id).toBe('server-side')
      expect(endAt(lineEnds(paths[`${id}-in`]).end), id).toBe('client-side')
    }
    // 질의에 적힌 포트 번호는 모두 53이고, 메시지 라벨에 다른 번호는 없다.
    for (const id of queryIds) expect(label(id)).toMatch(/ 53으로 /u)
    for (const id of messageIds) expect(label(id).match(/\d+/gu) ?? [], id).toEqual(queryIds.includes(id) ? ['53'] : [])
    expect(label('query')).toContain('UDP')
    expect(label('tcp-query')).toContain('TCP')

    await select('보통 질의')
    for (const id of ['truncated', 'tcp-query', 'tcp-answer']) expect(opacityOf(id), id).toBe('0.25')
    expect(shownPaths().filter((id) => id.startsWith('tcp') || id.startsWith('truncated'))).toEqual([])

    await select('큰 응답')
    expect(opacityOf('answer')).toBe('0.25')
    for (const id of ['truncated', 'tcp-query', 'tcp-answer']) expect(opacityOf(id), id).toBe('1')
    expect(shownPaths()).toEqual(expect.arrayContaining(['truncated-out', 'truncated-in', 'tcp-query-out', 'tcp-query-in']))
    expect(shownPaths()).not.toContain('answer-out')

    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join('\n')
    expect(body).toContain('클라이언트 `192.0.2.10`이 로컬 DNS 서버 `192.0.2.53`에')
    expect(body).toContain('로컬 DNS 서버의 UDP `53`번 포트로 보내고')
    expect(body).toContain('응답이 잘렸다는 것을 알린다')
    expect(body).toContain('그 응답을 쓰지 않고, 같은 질의를 TCP로 다시 보낸다')
    expect(body).toContain('TCP `53`번 포트로 연결을 맺는다')
    expect(body).toContain('이번에는 응답이 잘리지 않고 온다')
  })
}

describe('DnsTransportDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<DnsTransportDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 372')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('큰 응답')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 372')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '큰 응답' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><DnsTransportDiagram /><DnsTransportDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '큰 응답' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<DnsTransportDiagram />)
    const text = visualsByTopicId[topicId].diagrams['dns-transport']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(dnsTransportScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = dnsTransportScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 DNS가 쓰는 UDP와 TCP 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(within(figure).queryByRole('heading')).toBeNull()
  })
})
