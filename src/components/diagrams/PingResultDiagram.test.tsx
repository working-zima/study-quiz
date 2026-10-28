import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { PingResultDiagram, pingResultScenarios } from './PingResultDiagram'

const topicId = 'icmp'
const anchorConceptId = `${topicId}.ping`
const labels = {
  'host-a-1': '호스트 A',
  'host-b-1': '호스트 B',
  'host-a-2': '호스트 A',
  'host-b-2': '호스트 B',
  'host-a-3': '호스트 A',
  'host-b-3': '호스트 B',
  'host-a-4': '호스트 A',
  'host-b-4': '호스트 B',
  'sent': '보낸 요청 4개',
  'received': '받은 응답 3개',
  'loss': '손실률 25%',
  'min': '최소 10ms',
  'avg': '평균 12ms',
  'max': '최대 14ms',
}
const groupLabels = { summary: '결과 요약' }
const noteLabels = {
  'rtt-1': '10ms · TTL 62',
  'rtt-2': '14ms · TTL 62',
  'lost-3': '응답 없음',
  'rtt-4': '12ms · TTL 62',
}
type NoteId = keyof typeof noteLabels

const nodeIds = Object.keys(labels)
const rowIds = nodeIds.filter((id) => id.startsWith('host-'))
const summaryIds = ['sent', 'received', 'loss', 'min', 'avg', 'max']

const tallGroup: SvgBox = { id: 'summary', x: 8, y: 200, width: 264, height: 104 }
const wideGroup: SvgBox = { id: 'summary', x: 248, y: 8, width: 184, height: 152 }
const tallArrows: Record<string, string> = {
  'request-1': 'M64 16 H216',
  'reply-1': 'M216 32 H64',
  'request-2': 'M64 64 H216',
  'reply-2': 'M216 80 H64',
  'request-3': 'M64 112 H216',
  'request-4': 'M64 160 H216',
  'reply-4': 'M216 176 H64',
}
const wideArrows: Record<string, string> = {
  'request-1': 'M72 16 H176',
  'reply-1': 'M176 32 H72',
  'request-2': 'M72 56 H176',
  'reply-2': 'M176 72 H72',
  'request-3': 'M72 96 H176',
  'request-4': 'M72 136 H176',
  'reply-4': 'M176 152 H72',
}
// 화살표마다 출발 노드와 도착 노드. 요청은 그 줄의 A에서 B로, 응답은 B에서 A로 간다. 요청 3에는 응답이 없다.
const ends: Record<string, [string, string]> = {
  'request-1': ['host-a-1', 'host-b-1'],
  'reply-1': ['host-b-1', 'host-a-1'],
  'request-2': ['host-a-2', 'host-b-2'],
  'reply-2': ['host-b-2', 'host-a-2'],
  'request-3': ['host-a-3', 'host-b-3'],
  'request-4': ['host-a-4', 'host-b-4'],
  'reply-4': ['host-b-4', 'host-a-4'],
}

type Note = { x: number, y: number }
const tallNotes: Record<NoteId, Note> = {
  'rtt-1': { x: 140, y: 28 },
  'rtt-2': { x: 140, y: 76 },
  'lost-3': { x: 140, y: 124 },
  'rtt-4': { x: 140, y: 172 },
}
const wideNotes: Record<NoteId, Note> = {
  'rtt-1': { x: 124, y: 28 },
  'rtt-2': { x: 124, y: 68 },
  'lost-3': { x: 124, y: 108 },
  'rtt-4': { x: 124, y: 148 },
}
// 곁말마다 그 곁말이 놓이는 줄의 두 호스트.
const rowOf: Record<NoteId, [string, string]> = {
  'rtt-1': ['host-a-1', 'host-b-1'],
  'rtt-2': ['host-a-2', 'host-b-2'],
  'lost-3': ['host-a-3', 'host-b-3'],
  'rtt-4': ['host-a-4', 'host-b-4'],
}

const question = 'ping 결과에서 무엇을 읽을까?'
const idleCaption = '호스트 A가 다른 네트워크에 있는 호스트 B에게 ping으로 에코 요청 4개를 보냈다. 버튼을 고르면 응답 줄, 손실, 왕복 시간을 차례로 읽을 수 있다.'
const legend = '줄마다 같은 두 호스트를 다시 그렸고, 위에서부터 요청 1~4의 왕복이다. 줄의 위쪽 화살표는 에코 요청, 아래쪽 화살표는 에코 응답이다. 요청 3에는 돌아온 응답이 없다.'
const figureName = '호스트 A가 호스트 B에게 ping으로 에코 요청 4개를 보내 응답 3개를 받았을 때, 결과의 응답 줄과 요약을 읽는 도식'
const svgName = '위에서부터 요청 1~4의 왕복을 호스트 A와 호스트 B 사이에 한 줄씩 그렸고, 아래 결과 요약 상자에 보낸 요청 4개·받은 응답 3개·손실률 25%·최소 10ms·평균 12ms·최대 14ms가 적혀 있다'
const expectedScenarios = [
  {
    id: 'replies', label: '응답 줄',
    nodes: ['host-a-1', 'host-b-1', 'host-a-2', 'host-b-2', 'host-a-4', 'host-b-4'],
    paths: ['request-1', 'reply-1', 'request-2', 'reply-2', 'request-4', 'reply-4'],
    notes: ['rtt-1', 'rtt-2', 'rtt-4'] as NoteId[],
    caption: '돌아온 응답마다 한 줄이 적힌다. 요청 1·2·4의 응답 줄에는 왕복 시간 10ms·14ms·12ms와 TTL 62가 있다. TTL 62는 시간이 아니라 응답 패킷의 TTL 칸에 남아 있던 값이다.',
    sources: [anchorConceptId],
  },
  {
    id: 'loss', label: '손실',
    nodes: [...rowIds, 'sent', 'received', 'loss'],
    paths: ['request-1', 'reply-1', 'request-2', 'reply-2', 'request-3', 'request-4', 'reply-4'],
    notes: ['lost-3'] as NoteId[],
    caption: '요청 4개를 보냈는데 요청 3의 응답은 돌아오지 않아, 받은 응답은 3개다. 손실률은 (4 − 3) ÷ 4 = 25%다.',
    sources: [anchorConceptId],
  },
  {
    id: 'rtt', label: '왕복 시간',
    nodes: ['min', 'avg', 'max'],
    paths: [] as string[],
    notes: ['rtt-1', 'rtt-2', 'rtt-4'] as NoteId[],
    caption: '돌아온 응답 셋의 왕복 시간 10ms·14ms·12ms로 최소 10ms, 평균 12ms, 최대 14ms를 낸다. 응답이 없는 요청 3은 이 계산에 들지 않는다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 312]
const wideBox: [number, number, number, number] = [0, 0, 440, 168]

function diagram() {
  return screen.getByRole('img', { name: svgName })
}

async function selectScenario(label: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) })
}

function readBox(rect: Element): SvgBox {
  return {
    id: rect.parentElement?.getAttribute('data-node') ?? rect.getAttribute('data-group') ?? '',
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

function nodeBox(id: string) {
  return readBox(diagram().querySelector(`[data-node="${id}"] rect`)!)
}

function groupBox() {
  return readBox(diagram().querySelector('[data-group="summary"]')!)
}

function shownIds(selector: string, attribute: string) {
  return Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)!)
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function contains(outer: SvgBox, inner: SvgBox) {
  return inner.x >= outer.x && inner.x + inner.width <= outer.x + outer.width && inner.y >= outer.y && inner.y + inner.height <= outer.y + outer.height
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

function lineEnds(element: Element) {
  const list = segments(element.getAttribute('d')!)
  return { start: { x: list[0].x1, y: list[0].y1 }, end: { x: list[list.length - 1].x2, y: list[list.length - 1].y2 } }
}

// 점이 변 위에 놓인 노드.
function nodeAt(point: { x: number, y: number }) {
  return nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))
}

function groupLabelBox() {
  return textBox(diagram().querySelector('[data-group-label="summary"]')!, 'summary')
}

// 선의 양 끝이 지정한 두 노드의 변에 닿고, 어떤 선분도 노드 안과 그룹 상자·라벨을 지나지 않는다.
function expectLine(line: Element, id: string, pair: [string, string]) {
  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  for (const segment of segments(line.getAttribute('d')!)) {
    for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
    expect(touches(segment, groupLabelBox()), `${id} ↔ 요약 라벨`).toBe(false)
    expect(touches(segment, groupBox()), `${id} ↔ 요약 상자`).toBe(false)
  }
  const { start, end } = lineEnds(line)
  expect(nodeAt(start), `${id} 시작`).toBe(pair[0])
  expect(nodeAt(end), `${id} 끝`).toBe(pair[1])
}

// 요약 상자는 늘 보이고 흐려지지 않는다. 라벨은 상자 안 왼쪽 위에 있고, 요약 노드 여섯만 상자 안에 든다.
function expectGroup(group: SvgBox) {
  expect(shownIds('[data-group]', 'data-group')).toEqual(['summary'])
  const rect = diagram().querySelector('[data-group="summary"]')!
  expect(readBox(rect)).toEqual(group)
  expect(rect.closest('[opacity]')).toBeNull()
  const label = diagram().querySelector('[data-group-label="summary"]')!
  expect(label.textContent).toBe(groupLabels.summary)
  expect(label).toHaveAttribute('font-size', '9')
  expect(label.closest('[opacity]')).toBeNull()
  expect(contains(group, groupLabelBox()), '요약 라벨').toBe(true)
  for (const id of nodeIds) {
    expect(overlaps(groupLabelBox(), nodeBox(id)), `요약 라벨 ↔ ${id}`).toBe(false)
    expect(contains(group, nodeBox(id)), `${id} ⊂ 요약`).toBe(summaryIds.includes(id))
    if (!summaryIds.includes(id)) expect(overlaps(group, nodeBox(id)), `${id} ↔ 요약`).toBe(false)
  }
}

// 보이는 곁말이 지정한 id·글·자리이고, 자기 줄의 두 호스트 사이에서 그 줄의 두 화살표 사이에 놓이며
// 노드·선·요약 상자와 겹치지 않는다.
function expectNotes(ids: NoteId[], places: Record<NoteId, Note>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note')).sort()).toEqual([...ids].sort())
  for (const note of shown) {
    const id = note.getAttribute('data-note')! as NoteId
    const box = textBox(note, id)
    const [a, b] = rowOf[id].map(nodeBox)
    expect(note.textContent).toBe(noteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', 'middle')
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note.closest('[opacity]')).toBeNull()
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(width)
    expect(box.y).toBeGreaterThanOrEqual(0)
    expect(box.y + box.height).toBeLessThanOrEqual(height)
    expect(box.x, `${id} 왼쪽`).toBeGreaterThan(a.x + a.width)
    expect(box.x + box.width, `${id} 오른쪽`).toBeLessThan(b.x)
    expect(box.y, `${id} 위`).toBeGreaterThan(a.y)
    expect(box.y + box.height, `${id} 아래`).toBeLessThan(a.y + a.height)
    for (const node of nodeIds.map(nodeBox)) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    expect(overlaps(box, groupBox()), `${id} ↔ 요약`).toBe(false)
    for (const line of diagram().querySelectorAll('[data-path]')) {
      for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), `${id} ↔ 선`).toBe(false)
    }
  }
}

async function expectScenario(
  scenario: typeof expectedScenarios[number],
  arrows: Record<string, string>,
  places: Record<NoteId, Note>,
  group: SvgBox,
  width: number,
  height: number,
  container: HTMLElement,
) {
  await selectScenario(scenario.label)

  for (const element of diagram().querySelectorAll('[data-node]')) {
    const id = element.getAttribute('data-node')!
    expect(element, id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  const shownPaths = Array.from(diagram().querySelectorAll('[data-path]'))
  expect(shownPaths.map((path) => path.getAttribute('data-path'))).toEqual(scenario.paths)
  for (const path of shownPaths) {
    expect(path).toHaveAttribute('d', arrows[path.getAttribute('data-path')!])
    expect(path).toHaveAttribute('stroke-width', '2')
    expect(path).toHaveAttribute('marker-end', `url(#${diagram().querySelector('marker')!.id})`)
    expect(path).toHaveClass('stroke-title')
    expect(path.closest('[opacity]')).toBeNull()
  }
  expectGroup(group)
  expectNotes(scenario.notes, places, width, height)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다. 노드는 모두 회색이다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length + 1)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(node.querySelector('rect')).toHaveClass('stroke-disabled')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(label, 10) + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
  }
  for (let i = 0; i < nodeIds.length; i += 1) {
    for (let j = i + 1; j < nodeIds.length; j += 1) {
      expect(overlaps(nodeBox(nodeIds[i]), nodeBox(nodeIds[j])), `${nodeIds[i]} ↔ ${nodeIds[j]}`).toBe(false)
    }
  }
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

async function expectArrowEnds() {
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    for (const path of diagram().querySelectorAll('[data-path]')) {
      const id = path.getAttribute('data-path')!
      expectLine(path, id, ends[id])
    }
  }
}

function number(text: string) {
  return Number(text.match(/\d+/u)![0])
}

// 요점: 요약의 손실률은 (보낸 수 − 받은 수) ÷ 보낸 수이고, 보낸 수는 요청 화살표 수, 받은 수는 응답 화살표 수와 같다.
// 요약의 최소·평균·최대는 응답 줄에 적힌 왕복 시간 셋에서 계산한 값과 같다. 응답 줄의 TTL 곁말은 시간 단위가 아니다.
// 요청 3의 줄에는 응답 화살표가 어느 시나리오에도 없다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const label = (id: string) => diagram().querySelector(`[data-node="${id}"] text`)!.textContent!

  await selectScenario('손실')
  const requests = shownIds('[data-path]', 'data-path').filter((id) => id.startsWith('request-'))
  const replies = shownIds('[data-path]', 'data-path').filter((id) => id.startsWith('reply-'))
  const sent = number(label('sent'))
  const received = number(label('received'))
  expect(sent).toBe(requests.length)
  expect(received).toBe(replies.length)
  expect(number(label('loss'))).toBe(((sent - received) / sent) * 100)
  expect(replies).not.toContain('reply-3')
  expect(diagram().querySelector('[data-note="lost-3"]')).not.toBeNull()

  await selectScenario('응답 줄')
  const times = Array.from(diagram().querySelectorAll('[data-note]'), (note) => number(note.textContent!))
  expect(times).toHaveLength(received)
  for (const note of diagram().querySelectorAll('[data-note]')) {
    expect(note.textContent).toMatch(/^\d+ms · TTL \d+$/u)
    expect(note.textContent!.split('TTL')[1]).not.toMatch(/ms|초/u)
  }

  await selectScenario('왕복 시간')
  expect(number(label('min'))).toBe(Math.min(...times))
  expect(number(label('avg'))).toBe(times.reduce((sum, time) => sum + time, 0) / times.length)
  expect(number(label('max'))).toBe(Math.max(...times))
  for (const id of ['min', 'avg', 'max']) expect(label(id)).toMatch(/ms$/u)

  for (const { label: scenario } of expectedScenarios) {
    await selectScenario(scenario)
    expect(shownIds('[data-path]', 'data-path')).not.toContain('reply-3')
  }

  expect(body).toContain('`ping -c 4 198.51.100.1`')
  expect(body).toContain('요청 1, 2, 4의 응답은 돌아오고 요청 3의 응답은 돌아오지 않았다')
  expect(body).toContain('돌아온 응답의 왕복 시간은 차례로 10ms, 14ms, 12ms이고, 세 응답 모두 TTL 62가 적혀 있다')
  expect(body).toContain('보낸 요청은 4개, 받은 응답은 3개이고 손실률은 (4 − 3) ÷ 4 = 25%다')
  expect(body).toContain('왕복 시간은 최소 10ms, 평균 12ms, 최대 14ms다')
  expect(body).toContain('줄에 적힌 TTL은 시간이 아니다')
}

async function expectUniqueMarkers() {
  render(<><PingResultDiagram /><PingResultDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '응답 줄' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(6)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('PingResultDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<PingResultDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표·곁말 없이 요약 상자와 선택 안내가 나온다', () => {
    const { container } = render(<PingResultDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expectGroup(tallGroup)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<PingResultDiagram />)
    await expectScenario(scenario, tallArrows, tallNotes, tallGroup, 280, 312, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<PingResultDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드가 280×312 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<PingResultDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 312')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 요약 상자를 지나지 않는다', async () => {
    render(<PingResultDiagram />)
    await expectArrowEnds()
  })

  it('손실률과 왕복 시간의 최소·평균·최대가 그림의 요청·응답과 응답 줄의 값에서 계산한 값과 같다', async () => {
    render(<PingResultDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<PingResultDiagram />)
    const text = visualsByTopicId[topicId].diagrams['ping-result']
    const ids = pingResultScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([anchorConceptId])
    expect(text.label).toBe(figureName)
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = pingResultScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: expected.sources })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) {
      expect(conceptIds).toContain(source)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 ping 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })

    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(within(figure).queryByRole('heading')).toBeNull()
  })

  describe('가로형 (768px 이상)', () => {
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

    async function collectIds(selector: string, attribute: string) {
      const found = new Set<string>()
      for (const { label } of expectedScenarios) {
        await selectScenario(label)
        for (const id of shownIds(selector, attribute)) found.add(id)
      }
      return [...found].sort()
    }

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×168 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커·요약 상자를 유지한다', () => {
      render(<PingResultDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 168')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
      expectGroup(wideGroup)
    })

    it('노드·그룹 id 집합과 화살표·곁말 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<PingResultDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 312')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroupIds = shownIds('[data-group]', 'data-group').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')
      const tallNoteIds = await collectIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 168')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroupIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(tallNoteIds).toEqual(Object.keys(noteLabels).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
      expect(await collectIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
    })

    it('모든 rect가 440×168 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<PingResultDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<PingResultDiagram />)
      await expectScenario(scenario, wideArrows, wideNotes, wideGroup, 440, 168, container)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 요약 상자를 지나지 않는다', async () => {
      render(<PingResultDiagram />)
      await expectArrowEnds()
    })

    it('손실률과 왕복 시간의 최소·평균·최대가 그림의 요청·응답과 응답 줄의 값에서 계산한 값과 같다', async () => {
      render(<PingResultDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<PingResultDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 312')
      await selectScenario('손실')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '손실' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(diagram().querySelector('[data-path="request-3"]')).toHaveAttribute('d', wideArrows['request-3'])
      expect(diagram().querySelector('[data-note="lost-3"]')).toHaveAttribute('x', String(wideNotes['lost-3'].x))
    })
  })
})
