import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { HubRepeatDiagram, hubRepeatScenarios } from './HubRepeatDiagram'

const topicId = 'hub-switch-vlan'
const anchorConceptId = `${topicId}.hub`
const labels = {
  hub: '허브',
  'host-a': '호스트 A',
  'host-b': '호스트 B',
  'host-c': '호스트 C',
  'host-d': '호스트 D',
}
const portLabels = {
  'port-1': '포트 1',
  'port-2': '포트 2',
  'port-3': '포트 3',
  'port-4': '포트 4',
}
const noteLabels = {
  receiver: '받을 장치',
  'discard-b': '버림',
  'discard-d': '버림',
}
type NoteId = keyof typeof noteLabels
type PortId = keyof typeof portLabels

const nodeIds = Object.keys(labels)
const hostIds = ['host-a', 'host-b', 'host-c', 'host-d']
const portIds = Object.keys(portLabels) as PortId[]
const linkIds = ['cable-a', 'cable-b', 'cable-c', 'cable-d']

const tallLinks: Record<string, string> = {
  'cable-a': 'M38 56 V112',
  'cable-b': 'M106 56 V112',
  'cable-c': 'M174 56 V112',
  'cable-d': 'M242 56 V112',
}
const wideLinks: Record<string, string> = {
  'cable-a': 'M58 56 V96',
  'cable-b': 'M166 56 V96',
  'cable-c': 'M274 56 V96',
  'cable-d': 'M382 56 V96',
}
const tallArrows: Record<string, string> = {
  'from-a': 'M38 112 V56',
  'from-d': 'M242 112 V56',
  'to-a': 'M38 56 V112',
  'to-b': 'M106 56 V112',
  'to-c': 'M174 56 V112',
  'to-d': 'M242 56 V112',
}
const wideArrows: Record<string, string> = {
  'from-a': 'M58 96 V56',
  'from-d': 'M382 96 V56',
  'to-a': 'M58 56 V96',
  'to-b': 'M166 56 V96',
  'to-c': 'M274 56 V96',
  'to-d': 'M382 56 V96',
}
// 링크와 화살표마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'cable-a': ['hub', 'host-a'],
  'cable-b': ['hub', 'host-b'],
  'cable-c': ['hub', 'host-c'],
  'cable-d': ['hub', 'host-d'],
  'from-a': ['host-a', 'hub'],
  'from-d': ['host-d', 'hub'],
  'to-a': ['hub', 'host-a'],
  'to-b': ['hub', 'host-b'],
  'to-c': ['hub', 'host-c'],
  'to-d': ['hub', 'host-d'],
}
// 포트 번호와 그 포트에 이은 호스트.
const hostOfPort: Record<PortId, string> = { 'port-1': 'host-a', 'port-2': 'host-b', 'port-3': 'host-c', 'port-4': 'host-d' }

type Note = { x: number, y: number, anchor: 'start' | 'middle' }
const tallPorts: Record<PortId, Note> = {
  'port-1': { x: 42, y: 72, anchor: 'start' },
  'port-2': { x: 110, y: 72, anchor: 'start' },
  'port-3': { x: 178, y: 72, anchor: 'start' },
  'port-4': { x: 246, y: 72, anchor: 'start' },
}
const widePorts: Record<PortId, Note> = {
  'port-1': { x: 62, y: 72, anchor: 'start' },
  'port-2': { x: 170, y: 72, anchor: 'start' },
  'port-3': { x: 278, y: 72, anchor: 'start' },
  'port-4': { x: 386, y: 72, anchor: 'start' },
}
const tallNotes: Record<NoteId, Note> = {
  receiver: { x: 174, y: 158, anchor: 'middle' },
  'discard-b': { x: 106, y: 158, anchor: 'middle' },
  'discard-d': { x: 242, y: 158, anchor: 'middle' },
}
const wideNotes: Record<NoteId, Note> = {
  receiver: { x: 274, y: 142, anchor: 'middle' },
  'discard-b': { x: 166, y: 142, anchor: 'middle' },
  'discard-d': { x: 382, y: 142, anchor: 'middle' },
}
// 곁말이 붙는 호스트.
const hostOfNote: Record<NoteId, string> = { receiver: 'host-c', 'discard-b': 'host-b', 'discard-d': 'host-d' }

const question = '허브는 받은 신호를 어디로 내보낼까?'
const idleCaption = '호스트 A~D가 허브의 포트 1~4에 하나씩 케이블로 이어져 있다. 허브는 목적지 MAC 주소를 보지 않으므로, 한 포트로 들어온 신호를 그 포트를 뺀 다른 모든 포트로 내보낸다. 버튼을 고르면 누가 보낼 때 신호가 어디로 가는지 볼 수 있다.'
const legend = '포트 1~4는 허브에서 케이블을 꽂는 자리다. 가는 선은 케이블, 화살표는 신호가 가는 길이다.'
const expectedScenarios = [
  {
    id: 'a-sends', label: 'A가 C에게 보낼 때', sender: 'host-a',
    nodes: [...nodeIds, ...linkIds],
    paths: ['from-a', 'to-b', 'to-c', 'to-d'],
    notes: ['receiver', 'discard-b', 'discard-d'] as NoteId[],
    caption: '호스트 A가 호스트 C에게 프레임을 보낸다. 허브는 목적지 MAC 주소를 보지 않으므로 포트 1로 들어온 신호를 포트 2·3·4로 모두 내보낸다. C의 NIC는 자기 앞으로 온 프레임이라 받아들이고, B와 D의 NIC는 자기 앞으로 온 프레임이 아니라 버린다.',
  },
  {
    id: 'd-sends', label: 'D가 보낼 때', sender: 'host-d',
    nodes: [...nodeIds, ...linkIds],
    paths: ['from-d', 'to-a', 'to-b', 'to-c'],
    notes: [] as NoteId[],
    caption: '이번에는 포트 4의 호스트 D가 보낸다. 신호가 어느 포트로 들어와도 허브가 하는 일은 같다. 들어온 포트 4를 뺀 포트 1·2·3으로 신호를 내보내 A·B·C 모두에게 보내고, 신호가 들어온 D 쪽으로는 되돌려 보내지 않는다.',
  },
]

function diagram() {
  return screen.getByRole('img', { name: '허브의 포트 1~4에 호스트 A~D가 하나씩 이어져 있고, 한 호스트가 보낸 신호를 허브가 다른 모든 호스트에게 내보내는 모습' })
}

async function selectScenario(label: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) })
}

function readBox(rect: Element): SvgBox {
  return {
    id: rect.parentElement?.getAttribute('data-node') ?? '',
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

function nodeBox(id: string) {
  return readBox(diagram().querySelector(`[data-node="${id}"] rect`)!)
}

function shownIds(selector: string, attribute: string) {
  return Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)!)
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

// 글자가 차지하는 상자. 높이는 글자 크기 9를 기준선 위로 잡는다.
function textBox(text: Element): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9)
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id: text.getAttribute('data-note') ?? text.getAttribute('data-port')!, x: left, y: y - 9, width, height: 9 }
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

// 선의 양 끝이 지정한 두 노드의 변에 닿고, 어떤 선분도 노드 안을 지나지 않는다.
function expectLine(line: Element, id: string) {
  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  for (const segment of segments(line.getAttribute('d')!)) {
    for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
  }
  const { start, end } = lineEnds(line)
  expect(nodeAt(start), `${id} 시작`).toBe(ends[id][0])
  expect(nodeAt(end), `${id} 끝`).toBe(ends[id][1])
}

// 글이 viewBox 안에 있고, 노드·선과 겹치거나 닿지 않는다.
function expectClearText(text: Element, width: number, height: number) {
  const box = textBox(text)
  expect(box.x, box.id).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width, box.id).toBeLessThanOrEqual(width)
  expect(box.y, box.id).toBeGreaterThanOrEqual(0)
  expect(box.y + box.height, box.id).toBeLessThanOrEqual(height)
  for (const node of nodeIds.map(nodeBox)) expect(overlaps(box, node), `${box.id} ↔ ${node.id}`).toBe(false)
  for (const line of diagram().querySelectorAll('[data-link], [data-path]')) {
    for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
  }
}

// 포트 이름표는 늘 보이고, 자기 호스트의 케이블 오른쪽에 붙는다.
function expectPorts(places: Record<PortId, Note>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-port]'))
  expect(shown.map((port) => port.getAttribute('data-port'))).toEqual(portIds)
  for (const port of shown) {
    const id = port.getAttribute('data-port')! as PortId
    expect(port.textContent).toBe(portLabels[id])
    expect(port).toHaveAttribute('x', String(places[id].x))
    expect(port).toHaveAttribute('y', String(places[id].y))
    expect(port).toHaveAttribute('text-anchor', places[id].anchor)
    expect(port).toHaveAttribute('font-size', '9')
    expect(port).toHaveClass('fill-muted')
    expect(port.closest('[opacity]')).toBeNull()
    expectClearText(port, width, height)
  }
}

// 보이는 곁말이 지정한 id·글·자리이고, 노드·선·포트 이름표·다른 곁말과 겹치지 않으며 viewBox 안에 있다.
function expectNotes(ids: NoteId[], places: Record<NoteId, Note>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note')).sort()).toEqual([...ids].sort())
  const ports = Array.from(diagram().querySelectorAll('[data-port]'), textBox)
  for (const note of shown) {
    const id = note.getAttribute('data-note')! as NoteId
    expect(note.textContent).toBe(noteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', places[id].anchor)
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note.closest('[opacity]')).toBeNull()
    expectClearText(note, width, height)
    for (const port of ports) expect(overlaps(textBox(note), port), `${id} ↔ ${port.id}`).toBe(false)
  }
  for (let i = 0; i < shown.length; i += 1) {
    for (let j = i + 1; j < shown.length; j += 1) {
      expect(overlaps(textBox(shown[i]), textBox(shown[j])), '곁말끼리').toBe(false)
    }
  }
}

// 아래 단언들은 배치에 묶이지 않는다. 세로형과 가로형이 같은 기대값으로 통과해야 한다.
async function expectScenario(
  scenario: typeof expectedScenarios[number],
  arrows: Record<string, string>,
  places: Record<NoteId, Note>,
  width: number,
  height: number,
  container: HTMLElement,
) {
  await selectScenario(scenario.label)

  for (const element of diagram().querySelectorAll('[data-node], [data-link]')) {
    const id = element.getAttribute('data-node') ?? element.getAttribute('data-link')!
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
  expectNotes(scenario.notes, places, width, height)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어간다. 그룹 박스는 없다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
  expect(diagram().querySelectorAll('[data-group]')).toHaveLength(0)

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(label, 10) + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
  }
  for (let i = 0; i < nodeIds.length; i += 1) {
    for (let j = i + 1; j < nodeIds.length; j += 1) {
      expect(overlaps(nodeBox(nodeIds[i]), nodeBox(nodeIds[j])), `${nodeIds[i]} ↔ ${nodeIds[j]}`).toBe(false)
    }
  }
}

// 케이블 넷은 늘 보이고 회색이며 허브와 호스트를 잇는다. 노드는 모두 회색이고 도식 전용 두 색·초록·빨강·주황은 쓰지 않는다.
function expectLinks(links: Record<string, string>) {
  const shown = Array.from(diagram().querySelectorAll('[data-link]'))
  expect(shown.map((link) => link.getAttribute('data-link'))).toEqual(linkIds)
  for (const link of shown) {
    const id = link.getAttribute('data-link')!
    expect(link).toHaveAttribute('d', links[id])
    expect(link).toHaveClass('fill-none', 'stroke-muted')
    expect(link).toHaveAttribute('stroke-width', '1.5')
    expect(link).not.toHaveAttribute('marker-end')
    expectLine(link, id)
  }
  for (const id of nodeIds) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 포트 이름표가 자기 호스트로 내려가는 케이블 바로 오른쪽에 있다 — 포트 n에 호스트가 하나씩 이어졌다는 것이 위치로 보인다.
function expectPortsBesideCables() {
  for (const port of portIds) {
    const host = hostOfPort[port]
    const cable = diagram().querySelector(`[data-link="cable-${host.slice(-1)}"]`)!
    const x = segments(cable.getAttribute('d')!)[0].x1
    const box = nodeBox(host)
    expect(x, port).toBe(box.x + box.width / 2)
    const label = textBox(diagram().querySelector(`[data-port="${port}"]`)!)
    expect(label.x, port).toBe(x + 4)
    const others = hostIds.filter((id) => id !== host).map((id) => nodeBox(id).x + nodeBox(id).width / 2)
    for (const other of others) expect(label.x + label.width < other || label.x > other, `${port} ↔ 다른 케이블`).toBe(true)
  }
}

async function expectArrowEnds() {
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    for (const path of diagram().querySelectorAll('[data-path]')) expectLine(path, path.getAttribute('data-path')!)
  }
}

// 요점: 어느 호스트가 보내든 화살표 하나가 보낸 호스트에서 허브로 들어가고, 허브에서 나가는 화살표는
// 보낸 호스트를 뺀 나머지 세 호스트에 하나씩 닿는다. 보낸 호스트로 되돌아가는 화살표는 없다.
// A가 C에게 보낼 때 「받을 장치」는 C 곁에, 「버림」은 B·D 곁에 있고, 그 사실은 개념 본문에 있다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    const hops = Array.from(diagram().querySelectorAll('[data-path]'), (path) => [nodeAt(lineEnds(path).start)!, nodeAt(lineEnds(path).end)!])
    const inbound = hops.filter(([, to]) => to === 'hub')
    const outbound = hops.filter(([from]) => from === 'hub').map(([, to]) => to).sort()
    expect(inbound, scenario.label).toEqual([[scenario.sender, 'hub']])
    expect(outbound, scenario.label).toEqual(hostIds.filter((id) => id !== scenario.sender).sort())
    expect(outbound, scenario.label).not.toContain(scenario.sender)
    expect(hops, scenario.label).toHaveLength(hostIds.length)
    for (const id of nodeIds) expect(diagram().querySelector(`[data-node="${id}"]`), `${scenario.label} ${id}`).toHaveAttribute('opacity', '1')
  }
  await selectScenario('A가 C에게 보낼 때')
  for (const note of diagram().querySelectorAll('[data-note]')) {
    const id = note.getAttribute('data-note')! as NoteId
    const host = nodeBox(hostOfNote[id])
    expect(Number(note.getAttribute('x')), id).toBe(host.x + host.width / 2)
    expect(Number(note.getAttribute('y')) - 9, id).toBeGreaterThanOrEqual(host.y + host.height)
  }
  expect(body).toContain('그 포트를 뺀 다른 모든 포트로 내보낸다')
  expect(body).toContain('포트 2·3·4로 내보내 B·C·D 모두에게 보낸다')
  expect(body).toContain('버린다')
  expect(body).toContain('받을 장치')
  expect(body).toContain('물리 계층 장비')
}

async function expectUniqueMarkers() {
  render(<><HubRepeatDiagram /><HubRepeatDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: '허브가 신호를 내보내는 도식' })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'A가 C에게 보낼 때' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(4)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('HubRepeatDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<HubRepeatDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 다섯·케이블 넷·포트 이름표 넷이 모두 선명하고 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<HubRepeatDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
    expect(shownIds('[data-port]', 'data-port')).toEqual(portIds)
    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·케이블·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<HubRepeatDiagram />)
    await expectScenario(scenario, tallArrows, tallNotes, 280, 168, container)
  })

  it('시나리오를 바꾸면 이전 화살표와 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<HubRepeatDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드가 280×168 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<HubRepeatDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 168')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 168])
  })

  it('케이블은 늘 보이고 회색이며, 포트 이름표는 자기 호스트의 케이블 곁에 늘 보인다', () => {
    render(<HubRepeatDiagram />)
    expectLinks(tallLinks)
    expectPorts(tallPorts, 280, 168)
    expectPortsBesideCables()
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<HubRepeatDiagram />)
    await expectArrowEnds()
  })

  it('어느 호스트가 보내든 허브는 보낸 호스트를 뺀 나머지 셋 모두에게 내보내고 보낸 호스트로는 되돌리지 않는다', async () => {
    render(<HubRepeatDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<HubRepeatDiagram />)
    const text = visualsByTopicId[topicId].diagrams['hub-repeat']
    const ids = hubRepeatScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toBeUndefined()
    expect(text.notes).toEqual({ ...portLabels, ...noteLabels })
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([anchorConceptId])
    expect(text.label).toBe('허브가 신호를 내보내는 도식')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = hubRepeatScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) {
      expect(conceptIds).toContain(source)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 허브 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: '허브가 신호를 내보내는 도식' })

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

    async function collectPathIds() {
      const found = new Set<string>()
      for (const { label } of expectedScenarios) {
        await selectScenario(label)
        for (const id of shownIds('[data-path]', 'data-path')) found.add(id)
      }
      return [...found].sort()
    }

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×152 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<HubRepeatDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 152')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·케이블·포트 이름표 id 집합과 화살표 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<HubRepeatDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 168')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallLinkIds = shownIds('[data-link]', 'data-link').sort()
      const tallPortIds = shownIds('[data-port]', 'data-port').sort()
      const tallPathIds = await collectPathIds()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 152')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinkIds)
      expect(shownIds('[data-port]', 'data-port').sort()).toEqual(tallPortIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(await collectPathIds()).toEqual(tallPathIds)
    })

    it('모든 rect가 440×152 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<HubRepeatDiagram />)
      expectFits([0, 0, 440, 152])
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<HubRepeatDiagram />)
      await expectScenario(scenario, wideArrows, wideNotes, 440, 152, container)
    })

    it('케이블은 늘 보이고 회색이며, 포트 이름표는 자기 호스트의 케이블 곁에 늘 보인다', () => {
      render(<HubRepeatDiagram />)
      expectLinks(wideLinks)
      expectPorts(widePorts, 440, 152)
      expectPortsBesideCables()
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<HubRepeatDiagram />)
      await expectArrowEnds()
    })

    it('어느 호스트가 보내든 허브는 보낸 호스트를 뺀 나머지 셋 모두에게 내보내고 보낸 호스트로는 되돌리지 않는다', async () => {
      render(<HubRepeatDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<HubRepeatDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 168')
      await selectScenario('D가 보낼 때')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: 'D가 보낼 때' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['from-d', 'to-a', 'to-b', 'to-c'])
      for (const path of paths) expect(path).toHaveAttribute('d', wideArrows[path.getAttribute('data-path')!])
      expect(diagram().querySelector('[data-port="port-4"]')).toHaveAttribute('x', String(widePorts['port-4'].x))
    })
  })
})
