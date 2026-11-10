import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { OpeningStatesDiagram, openingStatesScenarios } from './OpeningStatesDiagram'

const topicId = 'tcp-connection'
const anchorConceptId = `${topicId}.opening-states`
const labels: Record<string, string> = {
  'client-closed': 'CLOSED',
  'client-syn-sent': 'SYN-SENT',
  'client-established': 'ESTABLISHED',
  'server-listen': 'LISTEN',
  'server-syn-received': 'SYN-RECEIVED',
  'server-established': 'ESTABLISHED',
  'seg-syn': 'SYN',
  'seg-synack': 'SYN+ACK',
  'seg-ack': 'ACK',
}
const noteLabels: Record<string, string> = {
  'head-client': '클라이언트',
  'head-server': '서버',
  'wait-synack': 'SYN-SENT는 SYN+ACK를 기다린다',
  'wait-ack': 'SYN-RECEIVED는 ACK를 기다린다',
  'client-first': '클라이언트가 먼저 ESTABLISHED',
  'server-last': '서버는 ACK를 받아 ESTABLISHED',
}
// 줄 머리 곁말은 늘 보이고, 나머지 곁말은 자기 시나리오에서만 보인다.
const headNotes = ['head-client', 'head-server']
const noteScenario: Record<string, string> = {
  'wait-synack': 'syn-sent',
  'wait-ack': 'syn-received',
  'client-first': 'client-established',
  'server-last': 'server-established',
}
const nodeIds = Object.keys(labels)
const clientStates = ['client-closed', 'client-syn-sent', 'client-established']
const serverStates = ['server-listen', 'server-syn-received', 'server-established']
const segmentIds = ['seg-syn', 'seg-synack', 'seg-ack']
const headColumn: Record<string, string[]> = { 'head-client': clientStates, 'head-server': serverStates }

const tallPaths: Record<string, string> = {
  'syn-out': 'M98 86 H110',
  'syn-in': 'M170 86 H227 V118',
  'synack-out': 'M182 134 H170',
  'synack-in': 'M110 134 H53 V166',
  'ack-out': 'M98 182 H110',
  'ack-in': 'M170 182 H227 V214',
}
const widePaths: Record<string, string> = {
  'syn-out': 'M128 86 H164',
  'syn-in': 'M276 86 H368 V118',
  'synack-out': 'M312 134 H276',
  'synack-in': 'M164 134 H72 V166',
  'ack-out': 'M128 182 H164',
  'ack-in': 'M276 182 H368 V214',
}
// 경로마다 출발 노드와 도착 노드. 세그먼트를 보낸 쪽의 상태에서 나와 세그먼트를 거쳐, 받은 쪽이 옮겨 간 상태로 들어간다.
const ends: Record<string, [string, string]> = {
  'syn-out': ['client-syn-sent', 'seg-syn'],
  'syn-in': ['seg-syn', 'server-syn-received'],
  'synack-out': ['server-syn-received', 'seg-synack'],
  'synack-in': ['seg-synack', 'client-established'],
  'ack-out': ['client-established', 'seg-ack'],
  'ack-in': ['seg-ack', 'server-established'],
}

const question = '연결을 맺는 동안 두 쪽의 상태는 어떻게 바뀔까?'
const figureName = '3-way handshake로 연결을 맺는 동안 세그먼트가 오갈 때마다 클라이언트와 서버의 상태가 어떻게 바뀌는지 보이는 도식'
const svgName = '왼쪽 줄에 클라이언트의 CLOSED, SYN-SENT, ESTABLISHED, 오른쪽 줄에 서버의 LISTEN, SYN-RECEIVED, ESTABLISHED를 놓고, 그 사이에 SYN, SYN+ACK, ACK 세그먼트를 오가는 차례대로 위에서 아래로 놓은 그림'
const idleCaption = '연결을 맺기 전 클라이언트는 CLOSED, 서버는 LISTEN이다. 버튼을 고르면 세그먼트가 오갈 때마다 두 쪽의 상태가 어떻게 바뀌고, 그 상태에서 무엇을 기다리는지 볼 수 있다.'
const legend = '왼쪽 줄이 클라이언트, 오른쪽 줄이 서버의 상태이고, 아래로 갈수록 나중이다. 가운데 노드는 오가는 세그먼트이고, 화살표는 세그먼트를 보낸 쪽의 상태에서 나와 그 세그먼트를 받은 쪽이 옮겨 간 상태로 들어간다.'
const expectedScenarios = [
  {
    id: 'syn-sent', label: 'SYN을 보낸 뒤',
    nodes: ['client-syn-sent', 'seg-syn', 'server-listen'], paths: ['syn-out'],
    caption: '클라이언트가 SYN을 켠 세그먼트를 보내고 CLOSED에서 SYN-SENT가 된다. 클라이언트는 이제 서버의 SYN+ACK를 기다린다. 서버는 이 SYN이 닿기 전까지 LISTEN에서 기다린다.',
  },
  {
    id: 'syn-received', label: 'SYN을 받은 뒤',
    nodes: ['seg-syn', 'server-syn-received', 'seg-synack'], paths: ['syn-in', 'synack-out'],
    caption: 'LISTEN이던 서버가 SYN을 받아 SYN+ACK로 답하고 SYN-RECEIVED가 된다. 서버는 이제 자기 SYN에 대한 확인, 곧 클라이언트의 ACK를 기다린다.',
  },
  {
    id: 'client-established', label: '클라이언트 연결됨',
    nodes: ['seg-synack', 'seg-ack', 'client-established', 'server-syn-received'], paths: ['synack-in', 'ack-out'],
    caption: 'SYN+ACK를 받은 클라이언트가 ACK를 보내고 ESTABLISHED가 된다. 이 ACK가 서버에 닿을 때까지 서버는 아직 SYN-RECEIVED라서, 클라이언트가 서버보다 먼저 ESTABLISHED가 된다.',
  },
  {
    id: 'server-established', label: '서버 연결됨',
    nodes: ['seg-ack', 'server-established'], paths: ['ack-in'],
    caption: '클라이언트의 ACK를 받은 서버도 ESTABLISHED가 된다. 서버는 이 ACK를 받기만 하고 따로 보내는 세그먼트는 없다. 이로써 두 쪽 모두 ESTABLISHED다.',
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
const label = (id: string) => svg().querySelector(`[data-node="${id}"] text`)!.textContent!
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)
const isBright = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1'
const brightNodes = () => nodeIds.filter(isBright)
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (item) => item.getAttribute('data-note')!)

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
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

const endAt = (point: { x: number, y: number }) => nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 272] : [0, 0, 280, 272]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<OpeningStatesDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표 없이 줄 머리 곁말과 선택 안내만 나온다', () => {
    const { container } = render(<OpeningStatesDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual(headNotes)
    for (const id of headNotes) expect(note(id)!.textContent).toBe(noteLabels[id])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보이고 줄 머리 곁말은 흐려지지 않는다', async (scenario) => {
    const { container } = render(<OpeningStatesDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownNotes()).toEqual([...headNotes, ...Object.keys(noteScenario).filter((id) => noteScenario[id] === scenario.id)])
    for (const id of shownNotes()) {
      expect(note(id)!.textContent).toBe(noteLabels[id])
      expect(note(id)!.closest('[opacity]'), id).toBeNull()
    }
    expect(shownPaths()).toEqual(scenario.paths)
    for (const path of svg().querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('d', paths[path.getAttribute('data-path')!])
      expect(path).toHaveAttribute('stroke-width', '2')
      expect(path).toHaveClass('stroke-title')
      expect(path).toHaveAttribute('marker-end', `url(#${svg().querySelector('marker')!.id})`)
      expect(path.closest('[opacity]')).toBeNull()
    }
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말이 자리에 들어간다`, async () => {
    render(<OpeningStatesDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
    }
    for (let i = 0; i < nodeIds.length; i += 1) {
      for (const other of nodeIds.slice(i + 1)) expect(overlaps(nodeBox(nodeIds[i]), nodeBox(other)), `${nodeIds[i]} ↔ ${other}`).toBe(false)
    }
    // 클라이언트 줄·세그먼트 줄·서버 줄이 왼쪽에서 오른쪽으로 서고, 줄마다 노드가 위에서 아래로 차례대로 놓인다.
    for (const column of [clientStates, segmentIds, serverStates]) {
      for (const id of column) expect(nodeBox(id).x, id).toBe(nodeBox(column[0]).x)
      for (let i = 1; i < column.length; i += 1) expect(nodeBox(column[i]).y, column[i]).toBeGreaterThan(nodeBox(column[i - 1]).y + 32)
    }
    expect(nodeBox('client-closed').x + nodeBox('client-closed').width).toBeLessThan(nodeBox('seg-syn').x)
    expect(nodeBox('seg-syn').x + nodeBox('seg-syn').width).toBeLessThan(nodeBox('server-listen').x)
    // 줄 머리 곁말은 자기 줄 맨 위 노드 바로 위, 줄 가운데에 선다.
    for (const id of headNotes) {
      const element = note(id)!
      expect(element).toHaveAttribute('font-size', '9')
      expect(element).toHaveClass('fill-muted')
      const box = textBox(element, id)
      const top = nodeBox(headColumn[id][0])
      expect(box.y + box.height, id).toBeLessThanOrEqual(top.y)
      expect(box.x + box.width / 2, id).toBeCloseTo(top.x + top.width / 2)
    }
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const texts = shownNotes().map((id) => {
        const element = note(id)!
        expect(element).toHaveAttribute('font-size', '9')
        expect(element).toHaveClass('fill-muted')
        return textBox(element, id)
      })
      for (const box of texts) {
        expect(box.x, box.id).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width, box.id).toBeLessThanOrEqual(viewBox[2])
        expect(box.y, box.id).toBeGreaterThanOrEqual(0)
        expect(box.y + box.height, box.id).toBeLessThanOrEqual(viewBox[3])
        for (const id of nodeIds) expect(overlaps(box, nodeBox(id)), `${box.id} ↔ ${id}`).toBe(false)
        for (const d of Object.values(paths)) {
          for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
        }
      }
      // 시나리오 곁말은 모든 노드보다 아래에 선다.
      for (const box of texts.filter(({ id }) => !headNotes.includes(id))) {
        for (const id of nodeIds) expect(box.y, box.id).toBeGreaterThanOrEqual(nodeBox(id).y + 32)
      }
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표 양 끝은 노드의 변에 닿고 어떤 선분도 다른 노드 안을 지나거나 같은 시나리오의 다른 화살표와 만나지 않는다', async () => {
    render(<OpeningStatesDiagram />)
    for (const [id, d] of Object.entries(paths)) {
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
      }
      const { start, end } = lineEnds(d)
      expect(endAt(start), `${id} 시작`).toBe(ends[id][0])
      expect(endAt(end), `${id} 끝`).toBe(ends[id][1])
    }
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const lines = shownPaths()
      for (let i = 0; i < lines.length; i += 1) {
        for (const other of lines.slice(i + 1)) {
          for (const a of segments(paths[lines[i]])) {
            for (const b of segments(paths[other])) {
              const box = { id: '', x: Math.min(b.x1, b.x2), y: Math.min(b.y1, b.y2), width: Math.abs(b.x2 - b.x1), height: Math.abs(b.y2 - b.y1) }
              expect(touches(a, box), `${lines[i]} ↔ ${other}`).toBe(false)
            }
          }
        }
      }
    }
  })

  // 요점: 클라이언트는 SYN+ACK를 받고 ACK를 보내면서 ESTABLISHED가 되고, 그때 서버는 아직 SYN-RECEIVED다 — 클라이언트가 먼저 ESTABLISHED가 된다.
  // SYN을 받은 서버의 상태는 SYN-RECEIVED이고, 클라이언트 쪽에는 LISTEN이 없다. 세그먼트는 한쪽 줄의 상태에서 나와 다른 쪽 줄의 상태로 들어간다.
  it('클라이언트가 서버보다 먼저 ESTABLISHED가 되고, SYN을 받은 서버는 SYN-RECEIVED다', async () => {
    render(<OpeningStatesDiagram />)
    expect(clientStates.map(label)).not.toContain('LISTEN')
    expect(serverStates.map(label)).not.toContain('SYN-SENT')
    expect(clientStates.map(label)).toEqual(['CLOSED', 'SYN-SENT', 'ESTABLISHED'])
    expect(serverStates.map(label)).toEqual(['LISTEN', 'SYN-RECEIVED', 'ESTABLISHED'])
    // 세그먼트마다 들어오는 화살표는 한쪽 줄의 상태에서, 나가는 화살표는 다른 쪽 줄의 상태로 간다.
    const side = (id: string) => (clientStates.includes(id) ? 'client' : serverStates.includes(id) ? 'server' : 'segment')
    const senders = segmentIds.map((segment) => {
      const into = Object.keys(ends).find((id) => ends[id][1] === segment)!
      const out = Object.keys(ends).find((id) => ends[id][0] === segment)!
      expect(side(ends[into][0]), segment).not.toBe('segment')
      expect(side(ends[out][1]), segment).not.toBe('segment')
      expect(side(ends[into][0]), segment).not.toBe(side(ends[out][1]))
      return side(ends[into][0])
    })
    expect(senders).toEqual(['client', 'server', 'client'])

    await select('SYN을 받은 뒤')
    expect(brightNodes().filter((id) => serverStates.includes(id)).map(label)).toEqual(['SYN-RECEIVED'])

    await select('클라이언트 연결됨')
    expect(isBright('client-established')).toBe(true)
    expect(isBright('server-established')).toBe(false)
    expect(isBright('server-syn-received')).toBe(true)
    expect(label('client-established')).toBe('ESTABLISHED')
    expect(label('server-syn-received')).toBe('SYN-RECEIVED')

    await select('서버 연결됨')
    expect(isBright('server-established')).toBe(true)
    // 서버는 ACK를 받기만 한다 — 서버의 ESTABLISHED에서 나가는 화살표가 없다.
    expect(Object.values(ends).some(([start]) => start === 'server-established')).toBe(false)

    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join('\n')
    expect(body).toContain('첫째, 클라이언트 프로그램이 연결을 열면 클라이언트의 TCP가 SYN을 켠 세그먼트(순서 번호 `1000`)를 서버에 보내고 `CLOSED`에서 `SYN-SENT`가 된다.')
    expect(body).toContain('둘째, `LISTEN`이던 서버가 SYN을 받으면 SYN과 ACK를 함께 켠 SYN+ACK 세그먼트(순서 번호 `7000`, 확인 응답 번호 `1001`)로 답하고, 이 연결의 상태를 `SYN-RECEIVED`로 바꾼다.')
    expect(body).toContain('셋째, SYN+ACK를 받은 클라이언트는 ACK를 켠 세그먼트(확인 응답 번호 `7001`)를 보내고 `ESTABLISHED`가 된다.')
    expect(body).toContain('그래서 클라이언트가 서버보다 먼저 `ESTABLISHED`가 된다.')
    expect(body).toContain('넷째, 서버가 클라이언트의 ACK를 받으면 자기 SYN이 확인된 것이므로 서버도 `ESTABLISHED`가 된다.')
  })
}

describe('OpeningStatesDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<OpeningStatesDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 272')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      await select('클라이언트 연결됨')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 272')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(screen.getByRole('button', { name: '클라이언트 연결됨' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><OpeningStatesDiagram /><OpeningStatesDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'SYN을 받은 뒤' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<OpeningStatesDiagram />)
    const text = visualsByTopicId[topicId].diagrams['opening-states']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(openingStatesScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    expect(text.nodes).toEqual(labels)
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
      const scenario = openingStatesScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 연결을 맺는 동안의 상태 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(within(figure).queryByRole('heading')).toBeNull()
  })
})
