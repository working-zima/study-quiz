import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ClosingStatesDiagram, closingStatesScenarios } from './ClosingStatesDiagram'

const topicId = 'tcp-connection'
const anchorConceptId = `${topicId}.closing-states`
const labels: Record<string, string> = {
  'client-established': 'ESTABLISHED',
  'client-fin-wait-1': 'FIN-WAIT-1',
  'client-fin-wait-2': 'FIN-WAIT-2',
  'client-time-wait': 'TIME-WAIT',
  'client-closed': 'CLOSED',
  'server-established': 'ESTABLISHED',
  'server-close-wait': 'CLOSE-WAIT',
  'server-last-ack': 'LAST-ACK',
  'server-closed': 'CLOSED',
  'seg-fin-1': 'FIN',
  'seg-ack-1': 'ACK',
  'seg-fin-2': 'FIN',
  'seg-ack-2': 'ACK',
  'sim-fin-wait-1': 'FIN-WAIT-1',
  'sim-closing': 'CLOSING',
  'sim-time-wait': 'TIME-WAIT',
}
const groupLabels: Record<string, string> = { simultaneous: '두 쪽이 거의 함께 끊을 때' }
const noteLabels: Record<string, string> = {
  'head-active': '먼저 끊는 쪽',
  'head-passive': '나중에 끊는 쪽',
  'wait-fin': 'FIN-WAIT-2는 상대의 FIN을 기다린다',
  'wait-program': 'CLOSE-WAIT는 자기 프로그램이 닫기를 기다린다',
  'wait-ack': 'CLOSING은 자기 FIN의 ACK를 기다린다',
}
// 줄 머리 곁말은 늘 보이고, 나머지 곁말은 자기 시나리오에서만 보인다.
const headNotes = ['head-active', 'head-passive']
const noteScenario: Record<string, string> = {
  'wait-fin': 'active',
  'wait-program': 'passive',
  'wait-ack': 'simultaneous',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const clientStates = ['client-established', 'client-fin-wait-1', 'client-fin-wait-2', 'client-time-wait', 'client-closed']
const serverStates = ['server-established', 'server-close-wait', 'server-last-ack', 'server-closed']
const segmentIds = ['seg-fin-1', 'seg-ack-1', 'seg-fin-2', 'seg-ack-2']
const simStates = ['sim-fin-wait-1', 'sim-closing', 'sim-time-wait']
const headColumn: Record<string, string[]> = { 'head-active': clientStates, 'head-passive': serverStates }
const columnPaths = ['fin1-out', 'fin1-in', 'ack1-out', 'ack1-in', 'fin2-out', 'fin2-in', 'ack2-out', 'ack2-in']

const tallPaths: Record<string, string> = {
  'fin1-out': 'M98 82 H110',
  'fin1-in': 'M170 82 H227 V110',
  'ack1-out': 'M182 126 H170',
  'ack1-in': 'M110 126 H53 V154',
  'fin2-out': 'M182 214 H170',
  'fin2-in': 'M110 214 H53 V242',
  'ack2-out': 'M98 258 H110',
  'ack2-in': 'M170 258 H227 V286',
  'sim-1': 'M92 414 H108',
  'sim-2': 'M172 414 H188',
}
const widePaths: Record<string, string> = {
  'fin1-out': 'M128 82 H164',
  'fin1-in': 'M276 82 H368 V110',
  'ack1-out': 'M312 126 H276',
  'ack1-in': 'M164 126 H72 V154',
  'fin2-out': 'M312 214 H276',
  'fin2-in': 'M164 214 H72 V242',
  'ack2-out': 'M128 258 H164',
  'ack2-in': 'M276 258 H368 V286',
  'sim-1': 'M160 414 H184',
  'sim-2': 'M256 414 H280',
}
// 경로마다 출발 노드와 도착 노드. 세그먼트를 보낸 쪽의 상태에서 나와 세그먼트를 거쳐, 받은 쪽이 옮겨 간 상태로 들어간다.
// 아래 박스의 두 화살표는 한쪽이 거치는 상태의 차례다.
const ends: Record<string, [string, string]> = {
  'fin1-out': ['client-fin-wait-1', 'seg-fin-1'],
  'fin1-in': ['seg-fin-1', 'server-close-wait'],
  'ack1-out': ['server-close-wait', 'seg-ack-1'],
  'ack1-in': ['seg-ack-1', 'client-fin-wait-2'],
  'fin2-out': ['server-last-ack', 'seg-fin-2'],
  'fin2-in': ['seg-fin-2', 'client-time-wait'],
  'ack2-out': ['client-time-wait', 'seg-ack-2'],
  'ack2-in': ['seg-ack-2', 'server-closed'],
  'sim-1': ['sim-fin-wait-1', 'sim-closing'],
  'sim-2': ['sim-closing', 'sim-time-wait'],
}

const question = '연결을 끊는 동안 두 쪽의 상태는 어떻게 바뀔까?'
const figureName = '연결을 끊는 동안 FIN과 ACK가 오갈 때마다 먼저 끊는 쪽과 나중에 끊는 쪽의 상태가 어떻게 바뀌는지, 두 쪽이 거의 함께 끊으면 어떤 상태를 거치는지 보이는 도식'
const svgName = '왼쪽 줄에 먼저 끊는 클라이언트의 ESTABLISHED, FIN-WAIT-1, FIN-WAIT-2, TIME-WAIT, CLOSED, 오른쪽 줄에 나중에 끊는 서버의 ESTABLISHED, CLOSE-WAIT, LAST-ACK, CLOSED를 놓고, 그 사이에 FIN, ACK, FIN, ACK 세그먼트를 오가는 차례대로 위에서 아래로 놓은 그림. 아래 박스에는 두 쪽이 거의 함께 끊을 때 한쪽이 거치는 FIN-WAIT-1, CLOSING, TIME-WAIT를 왼쪽에서 오른쪽으로 놓았다'
const idleCaption = '끊기 전 두 쪽은 모두 ESTABLISHED다. 버튼을 고르면 FIN과 ACK가 오갈 때마다 먼저 끊는 쪽과 나중에 끊는 쪽이 어떤 상태를 거치는지, 두 쪽이 거의 함께 끊으면 어떤 상태를 거치는지 볼 수 있다.'
const legend = '왼쪽 줄이 먼저 끊는 클라이언트, 오른쪽 줄이 나중에 끊는 서버의 상태이고, 아래로 갈수록 나중이다. 가운데 노드는 오가는 세그먼트이고, 화살표는 세그먼트를 보낸 쪽의 상태에서 나와 그 세그먼트를 받은 쪽이 옮겨 간 상태로 들어간다. 아래 박스의 화살표는 한쪽이 거치는 상태의 차례다.'
const expectedScenarios = [
  {
    id: 'active', label: '먼저 끊는 쪽',
    nodes: [...clientStates, ...segmentIds], paths: columnPaths,
    caption: '먼저 끊는 클라이언트는 FIN을 보내고 FIN-WAIT-1, 그 FIN의 ACK를 받고 FIN-WAIT-2가 된다. 서버의 FIN을 받아 ACK로 답하면 TIME-WAIT가 되고, 정해진 시간을 기다린 뒤에야 CLOSED가 된다.',
  },
  {
    id: 'passive', label: '나중에 끊는 쪽',
    nodes: [...serverStates, ...segmentIds], paths: columnPaths,
    caption: '나중에 끊는 서버는 클라이언트의 FIN을 받아 ACK로 답하고 CLOSE-WAIT가 된다. 서버 프로그램이 연결을 닫으면 FIN을 보내고 LAST-ACK가 되며, 그 FIN의 ACK를 받으면 TIME-WAIT 없이 곧바로 CLOSED가 된다.',
  },
  {
    id: 'simultaneous', label: '동시에 끊기',
    nodes: simStates, paths: ['sim-1', 'sim-2'],
    caption: '두 쪽이 거의 함께 FIN을 보내면 저마다 FIN-WAIT-1이 된다. 자기 FIN의 ACK보다 상대의 FIN이 먼저 닿으면 ACK로 답하고 CLOSING이 되고, 그 ACK를 받으면 TIME-WAIT가 된다. 이때는 두 쪽 모두 이 차례를 거친다.',
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
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)
const isBright = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1'
const brightNodes = () => nodeIds.filter(isBright)
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (item) => item.getAttribute('data-note')!)

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

const groupLabelBox = (id: string) => textBox(svg().querySelector(`[data-group-label="${id}"]`)!, `${id}-label`)

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 464] : [0, 0, 280, 464]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<ClosingStatesDiagram />)
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
    const { container } = render(<ClosingStatesDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual(headNotes)
    for (const id of headNotes) expect(note(id)!.textContent).toBe(noteLabels[id])
    for (const id of groupIds) expect(svg().querySelector(`[data-group-label="${id}"]`)!.textContent).toBe(groupLabels[id])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보이고 줄 머리 곁말과 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<ClosingStatesDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
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
    render(<ClosingStatesDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
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
    // 아래 박스는 동시 종료의 세 상태를 품고, 위의 세 줄과는 겹치지 않는다.
    const group = groupBox('simultaneous')
    for (const id of simStates) expect(contains(group, nodeBox(id)), id).toBe(true)
    for (const id of [...clientStates, ...serverStates, ...segmentIds]) expect(overlaps(group, nodeBox(id)), id).toBe(false)
    const groupLabel = groupLabelBox('simultaneous')
    expect(contains(group, groupLabel)).toBe(true)
    for (const id of nodeIds) expect(overlaps(groupLabel, nodeBox(id)), id).toBe(false)
    expect(svg().querySelector('[data-group-label="simultaneous"]')).toHaveAttribute('font-size', '9')
    // 클라이언트 줄·세그먼트 줄·서버 줄이 왼쪽에서 오른쪽으로 서고, 줄마다 노드가 위에서 아래로 차례대로 놓인다.
    for (const column of [clientStates, segmentIds, serverStates]) {
      for (const id of column) expect(nodeBox(id).x, id).toBe(nodeBox(column[0]).x)
      for (let i = 1; i < column.length; i += 1) expect(nodeBox(column[i]).y, column[i]).toBeGreaterThan(nodeBox(column[i - 1]).y + 32)
    }
    expect(nodeBox('client-closed').x + nodeBox('client-closed').width).toBeLessThan(nodeBox('seg-fin-1').x)
    expect(nodeBox('seg-fin-1').x + nodeBox('seg-fin-1').width).toBeLessThan(nodeBox('server-established').x)
    // 동시 종료의 세 상태는 한 줄에 왼쪽에서 오른쪽으로 놓인다.
    for (let i = 1; i < simStates.length; i += 1) {
      expect(nodeBox(simStates[i]).y, simStates[i]).toBe(nodeBox(simStates[0]).y)
      expect(nodeBox(simStates[i]).x, simStates[i]).toBeGreaterThan(nodeBox(simStates[i - 1]).x + nodeBox(simStates[i - 1]).width)
    }
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
      for (const box of [...texts, groupLabel]) {
        expect(box.x, box.id).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width, box.id).toBeLessThanOrEqual(viewBox[2])
        expect(box.y, box.id).toBeGreaterThanOrEqual(0)
        expect(box.y + box.height, box.id).toBeLessThanOrEqual(viewBox[3])
        for (const id of nodeIds) expect(overlaps(box, nodeBox(id)), `${box.id} ↔ ${id}`).toBe(false)
        for (const d of Object.values(paths)) {
          for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
        }
      }
      // 시나리오 곁말은 모든 노드와 아래 박스보다 아래에 선다.
      for (const box of texts.filter(({ id }) => !headNotes.includes(id))) {
        for (const id of nodeIds) expect(box.y, box.id).toBeGreaterThanOrEqual(nodeBox(id).y + 32)
        expect(box.y, box.id).toBeGreaterThanOrEqual(group.y + group.height)
      }
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표 양 끝은 노드의 변에 닿고 어떤 선분도 다른 노드 안을 지나거나 같은 시나리오의 다른 화살표와 만나지 않는다', async () => {
    render(<ClosingStatesDiagram />)
    for (const [id, d] of Object.entries(paths)) {
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        expect(touches(segment, groupLabelBox('simultaneous')), `${id} ↔ 그룹 라벨`).toBe(false)
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

  // 요점: 먼저 끊는 쪽만 TIME-WAIT를 거치고, 나중에 끊는 쪽은 LAST-ACK에서 곧바로 CLOSED가 된다.
  // 나중에 끊는 쪽에는 FIN-WAIT-1·FIN-WAIT-2가 없다. 두 쪽이 거의 함께 끊으면 FIN-WAIT-1 → CLOSING → TIME-WAIT를 거친다.
  it('먼저 끊는 쪽만 TIME-WAIT를 거치고, 동시에 끊으면 CLOSING을 지난다', async () => {
    render(<ClosingStatesDiagram />)
    expect(clientStates.map(label)).toEqual(['ESTABLISHED', 'FIN-WAIT-1', 'FIN-WAIT-2', 'TIME-WAIT', 'CLOSED'])
    expect(serverStates.map(label)).toEqual(['ESTABLISHED', 'CLOSE-WAIT', 'LAST-ACK', 'CLOSED'])
    expect(serverStates.map(label)).not.toContain('FIN-WAIT-1')
    expect(serverStates.map(label)).not.toContain('FIN-WAIT-2')
    expect(serverStates.map(label)).not.toContain('TIME-WAIT')
    expect(simStates.map(label)).toEqual(['FIN-WAIT-1', 'CLOSING', 'TIME-WAIT'])
    // 세그먼트마다 들어오는 화살표는 한쪽 줄의 상태에서, 나가는 화살표는 다른 쪽 줄의 상태로 간다.
    const side = (id: string) => (clientStates.includes(id) ? 'client' : serverStates.includes(id) ? 'server' : 'other')
    const senders = segmentIds.map((segment) => {
      const into = Object.keys(ends).find((id) => ends[id][1] === segment)!
      const out = Object.keys(ends).find((id) => ends[id][0] === segment)!
      expect(side(ends[into][0]), segment).not.toBe('other')
      expect(side(ends[out][1]), segment).not.toBe('other')
      expect(side(ends[into][0]), segment).not.toBe(side(ends[out][1]))
      return side(ends[into][0])
    })
    expect(senders).toEqual(['client', 'server', 'server', 'client'])
    expect(segmentIds.map(label)).toEqual(['FIN', 'ACK', 'FIN', 'ACK'])
    // 나중에 끊은 서버가 먼저 끊은 클라이언트보다 먼저 CLOSED가 된다(위에 놓인다).
    expect(nodeBox('server-closed').y).toBeLessThan(nodeBox('client-closed').y)
    // 클라이언트가 FIN-WAIT-2인 동안 서버는 CLOSE-WAIT다 — 두 노드가 서버의 FIN보다 위에 있다.
    expect(nodeBox('client-fin-wait-2').y).toBeLessThan(nodeBox('seg-fin-2').y)
    expect(nodeBox('server-close-wait').y).toBeLessThan(nodeBox('seg-fin-2').y)

    await select('먼저 끊는 쪽')
    expect(brightNodes().map(label)).toContain('TIME-WAIT')
    expect(isBright('client-time-wait')).toBe(true)

    await select('나중에 끊는 쪽')
    expect(brightNodes().map(label)).not.toContain('TIME-WAIT')
    expect(brightNodes().filter((id) => serverStates.includes(id)).map(label)).toEqual(['ESTABLISHED', 'CLOSE-WAIT', 'LAST-ACK', 'CLOSED'])

    await select('동시에 끊기')
    expect(brightNodes().map(label)).toEqual(['FIN-WAIT-1', 'CLOSING', 'TIME-WAIT'])
    expect(shownPaths().map((id) => ends[id])).toEqual([['sim-fin-wait-1', 'sim-closing'], ['sim-closing', 'sim-time-wait']])

    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join('\n')
    expect(body).toContain('클라이언트의 TCP가 FIN을 켠 세그먼트를 서버에 보내고 `ESTABLISHED`에서 `FIN-WAIT-1`이 된다.')
    expect(body).toContain('FIN을 받은 서버는 ACK를 켠 세그먼트로 그 FIN을 받았다고 확인하고 `ESTABLISHED`에서 `CLOSE-WAIT`가 된다.')
    expect(body).toContain('`FIN-WAIT-1`에서 `FIN-WAIT-2`가 되고, 이제 서버의 FIN을 기다린다.')
    expect(body).toContain('`CLOSE-WAIT`에서 `LAST-ACK`가 된다.')
    expect(body).toContain('`FIN-WAIT-2`에서 `TIME-WAIT`가 된다. 이 마지막 ACK를 받은 서버는 연결의 기록을 지우고 `LAST-ACK`에서 `CLOSED`가 된다.')
    expect(body).toContain('상대의 FIN에 ACK로 답하고 `CLOSING`이 되어, 아직 받지 못한 자기 FIN의 ACK를 기다린다.')
    expect(body).toContain('이때는 두 쪽 모두 `TIME-WAIT`를 지난다.')
  })
}

describe('ClosingStatesDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<ClosingStatesDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 464')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('나중에 끊는 쪽')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 464')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '나중에 끊는 쪽' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><ClosingStatesDiagram /><ClosingStatesDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '동시에 끊기' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<ClosingStatesDiagram />)
    const text = visualsByTopicId[topicId].diagrams['closing-states']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(closingStatesScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = closingStatesScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 연결을 끊는 동안의 상태 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
