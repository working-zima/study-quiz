import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { CircuitSwitchingDiagram, circuitSwitchingScenarios } from './CircuitSwitchingDiagram'
import { PacketSwitchingDiagram } from './PacketSwitchingDiagram'

const topicId = 'protocols-encapsulation'
const anchorConceptId = `${topicId}.circuit-switching`
const labels = {
  'host-a': '호스트 A',
  'equipment-1': '네트워크 장비',
  'host-c': '호스트 C',
  'equipment-3': '네트워크 장비',
  'equipment-2': '네트워크 장비',
  'host-b': '호스트 B',
}
const noteLabels = {
  'circuit-only': '두 호스트만 씀',
  'circuit-unused': '쓰이지 않고 남음',
  'c-blocked': '끼어들 수 없음',
}
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

const nodeIds = Object.keys(labels)
const linkIds = ['host-a-equipment-1', 'host-c-equipment-1', 'equipment-1-equipment-2', 'equipment-1-equipment-3', 'equipment-2-host-b', 'equipment-3-host-b']
// 호스트 A와 B가 잡아 둔 회선이 지나는 링크.
const circuitLinks = ['host-a-equipment-1', 'equipment-1-equipment-2', 'equipment-2-host-b']

const tallLinks: Record<string, string> = {
  'host-a-equipment-1': 'M72 32 H100',
  'host-c-equipment-1': 'M208 32 H180',
  'equipment-1-equipment-2': 'M160 48 V128 H184',
  'equipment-1-equipment-3': 'M120 48 V128 H96',
  'equipment-2-host-b': 'M224 144 V208 H180',
  'equipment-3-host-b': 'M56 144 V208 H100',
}
const wideLinks: Record<string, string> = {
  'host-a-equipment-1': 'M64 24 H112 V48',
  'host-c-equipment-1': 'M64 104 H112 V80',
  'equipment-1-equipment-2': 'M168 64 H256',
  'equipment-1-equipment-3': 'M144 80 V136 H256',
  'equipment-2-host-b': 'M336 64 H376',
  'equipment-3-host-b': 'M336 136 H404 V80',
}
// 화살표는 데이터가 지나는 회선 링크 위에 겹쳐 그린다.
const arrowLink: Record<string, string> = {
  'send-1': 'host-a-equipment-1',
  'send-2': 'equipment-1-equipment-2',
  'send-3': 'equipment-2-host-b',
}
const tallArrows = Object.fromEntries(Object.entries(arrowLink).map(([id, link]) => [id, tallLinks[link]]))
const wideArrows = Object.fromEntries(Object.entries(arrowLink).map(([id, link]) => [id, wideLinks[link]]))
const linkEnds: Record<string, [string, string]> = {
  'host-a-equipment-1': ['host-a', 'equipment-1'],
  'host-c-equipment-1': ['host-c', 'equipment-1'],
  'equipment-1-equipment-2': ['equipment-1', 'equipment-2'],
  'equipment-1-equipment-3': ['equipment-1', 'equipment-3'],
  'equipment-2-host-b': ['equipment-2', 'host-b'],
  'equipment-3-host-b': ['equipment-3', 'host-b'],
}
const ends: Record<string, [string, string]> = {
  ...linkEnds,
  ...Object.fromEntries(Object.entries(arrowLink).map(([id, link]) => [id, linkEnds[link]])),
}
// 패킷 교환 도식에서 같은 자리에 선 노드와 링크.
const packetNode: Record<string, string> = {
  'host-a': 'host-a', 'equipment-1': 'switch-1', 'host-c': 'host-c', 'equipment-3': 'switch-3', 'equipment-2': 'switch-2', 'host-b': 'host-b',
}
const packetLink = (id: string) => id.replace(/equipment-/gu, 'switch-')

const tallNotes: NotePlaces = {
  'circuit-only': { x: 168, y: 92, anchor: 'start' },
  'circuit-unused': { x: 168, y: 92, anchor: 'start' },
  'c-blocked': { x: 240, y: 62, anchor: 'middle' },
}
const wideNotes: NotePlaces = {
  'circuit-only': { x: 212, y: 58, anchor: 'middle' },
  'circuit-unused': { x: 212, y: 58, anchor: 'middle' },
  'c-blocked': { x: 8, y: 134, anchor: 'start' },
}

const circuitNodes = ['host-a', 'equipment-1', 'equipment-2', 'host-b', ...circuitLinks]
const question = '잡아 둔 회선에 다른 호스트가 끼어들 수 있을까?'
const idleCaption = '회선 교환 네트워크에서는 호스트 A와 B가 데이터를 주고받기 전에 먼저 연결을 세워, 가운데의 네트워크 장비들을 거쳐 이어지는 회선을 정해 둔다. 장치의 자리는 패킷 교환 네트워크 도식과 같다. 버튼을 고르면 잡아 둔 회선을 호스트 C가 쓸 수 있는지 볼 수 있다.'
const legend = '상자는 호스트와 네트워크 장비, 가는 선은 장치와 장치를 잇는 연결, 화살표는 데이터가 가는 방향이다.'
const expectedScenarios = [
  {
    id: 'in-use', label: '보내는 중',
    nodes: circuitNodes,
    paths: ['send-1', 'send-2', 'send-3'],
    notes: ['circuit-only', 'c-blocked'],
    caption: '호스트 A가 잡아 둔 회선으로 호스트 B에 데이터를 보낸다. 이 회선은 통신하는 동안 두 호스트만 쓰므로, 호스트 C는 보낼 데이터가 있어도 도중에 끼어들어 함께 쓸 수 없다. 대신 회선을 다른 호스트와 나눠 쓰지 않으니 전송률, 곧 1초에 보낼 수 있는 데이터 양을 보장받을 수 있다.',
  },
  {
    id: 'idle', label: '잠시 쉬는 중',
    nodes: circuitNodes,
    paths: [],
    notes: ['circuit-unused', 'c-blocked'],
    caption: '호스트 A와 B가 잠시 아무것도 주고받지 않는 동안에도, 잡아 둔 회선은 여전히 두 호스트만 쓸 수 있어 호스트 C가 쓰지 못한다. 그래서 회선이 쓰이지 않고 남는 시간이 생기고, 회선 이용률이 떨어진다.',
  },
]

function diagram() {
  return screen.getByRole('img', { name: '호스트 A와 호스트 B가 네트워크 장비를 거쳐 회선을 잡아 둔 회선 교환 네트워크와, 그 회선에 이어진 호스트 C' })
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

// 글자가 차지하는 상자. 높이는 글자 크기 9를 기준선 위로 잡는다.
function textBox(text: Element): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9)
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id: text.getAttribute('data-note')!, x: left, y: y - 9, width, height: 9 }
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
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

// 선분과 상자 사이의 가장 짧은 거리.
function distance(segment: Segment, box: SvgBox) {
  const dx = Math.max(Math.min(segment.x1, segment.x2) - (box.x + box.width), box.x - Math.max(segment.x1, segment.x2), 0)
  const dy = Math.max(Math.min(segment.y1, segment.y2) - (box.y + box.height), box.y - Math.max(segment.y1, segment.y2), 0)
  return Math.hypot(dx, dy)
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

// 곁말이 붙은 노드 — 노드 아래 변에서 10~16 아래에 있고, 가운데가 노드 폭 안에 있다.
function nodeBesideNote(note: Element) {
  const box = textBox(note)
  const middleX = box.x + box.width / 2
  return nodeIds.filter((id) => {
    const node = nodeBox(id)
    const below = box.y + box.height - (node.y + node.height)
    return below >= 10 && below <= 16 && middleX > node.x && middleX < node.x + node.width
  })
}

// 곁말에서 8 안쪽으로 지나는 통신 링크 — 곁말이 가리키는 링크다.
function linksBesideNote(note: Element) {
  const box = textBox(note)
  return Array.from(diagram().querySelectorAll('[data-link]'))
    .filter((link) => segments(link.getAttribute('d')!).some((segment) => distance(segment, box) <= 8))
    .map((link) => link.getAttribute('data-link')!)
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

// 아래 단언들은 배치에 묶이지 않는다. 세로형과 가로형이 같은 기대값으로 통과해야 한다.
async function expectScenario(
  scenario: typeof expectedScenarios[number],
  arrows: Record<string, string>,
  places: NotePlaces,
  width: number,
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

  const lineSegments = Array.from(diagram().querySelectorAll('[data-link], [data-path]')).flatMap((line) => segments(line.getAttribute('d')!))
  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  const shownNotes = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shownNotes.map((note) => note.getAttribute('data-note')).sort()).toEqual([...scenario.notes].sort())
  for (const note of shownNotes) {
    const id = note.getAttribute('data-note')! as NoteId
    expect(note.textContent).toBe(noteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', places[id].anchor)
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note.closest('[opacity]')).toBeNull()
    const box = textBox(note)
    expect(box.x, id).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, id).toBeLessThanOrEqual(width)
    for (const node of nodeBoxes) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const segment of lineSegments) expect(crossesInside(segment, box), `${id} ↔ 선`).toBe(false)
  }
  for (let i = 0; i < shownNotes.length; i += 1) {
    for (let j = i + 1; j < shownNotes.length; j += 1) {
      expect(overlaps(textBox(shownNotes[i]), textBox(shownNotes[j])), '곁말끼리').toBe(false)
    }
  }
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 노드 라벨이 자기 상자 안에 들어간다. 그룹 박스는 없다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
  expect(diagram().querySelector('[data-group]')).toBeNull()

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(label, 10) + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
  }
}

// 링크 여섯은 늘 보이고 회색이며 화살표가 없다. 노드는 모두 회색이고 도식 전용 두 색·초록·빨강·주황은 쓰지 않는다.
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

// 화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다. 화살표는 자기가 지나는 회선 링크와 같은 선이다.
async function expectArrowEnds(links: Record<string, string>) {
  await selectScenario('보내는 중')
  for (const path of diagram().querySelectorAll('[data-path]')) {
    const id = path.getAttribute('data-path')!
    expectLine(path, id)
    expect(path.getAttribute('d'), id).toBe(links[arrowLink[id]])
  }
}

// 두 시나리오 모두 선명한 링크가 호스트 A에서 호스트 B까지 끊기지 않고 이어진 회선 하나다. 호스트 C와 그 링크는 흐리고,
// 호스트 C에서 시작하거나 끝나는 화살표가 없다. 끼어들 수 없음은 호스트 C 바로 아래에, 회선 곁말은 회선 링크 곁에 붙는다.
// 보내는 중에는 화살표가 회선을 따라 A에서 B로 가고, 잠시 쉬는 중에는 화살표가 없다. 두 시나리오의 화살표와 곁말이 다르다.
async function expectPoint() {
  const seen: { paths: string[], notes: string[] }[] = []
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    const bright = Array.from(diagram().querySelectorAll('[data-link][opacity="1"]'), (link) => link.getAttribute('data-link')!)
    expect(bright, label).toEqual(circuitLinks)
    let at = 'host-a'
    for (const id of bright) {
      expect(linkEnds[id][0], `${label} ${id}`).toBe(at)
      at = linkEnds[id][1]
    }
    expect(at, label).toBe('host-b')

    expect(diagram().querySelector('[data-node="host-c"]'), label).toHaveAttribute('opacity', '0.25')
    expect(diagram().querySelector('[data-link="host-c-equipment-1"]'), label).toHaveAttribute('opacity', '0.25')
    for (const path of diagram().querySelectorAll('[data-path]')) {
      const { start, end } = lineEnds(path)
      expect(nodeAt(start), label).not.toBe('host-c')
      expect(nodeAt(end), label).not.toBe('host-c')
    }

    const blocked = diagram().querySelector('[data-note="c-blocked"]')!
    expect(nodeBesideNote(blocked), label).toEqual(['host-c'])
    const circuitNote = diagram().querySelector('[data-note^="circuit-"]')!
    expect(linksBesideNote(circuitNote), label).toEqual(['equipment-1-equipment-2'])

    seen.push({ paths: shownIds('[data-path]', 'data-path'), notes: shownIds('[data-note]', 'data-note').sort() })
  }

  await selectScenario('보내는 중')
  const hops = Array.from(diagram().querySelectorAll('[data-path]'), (path) => [nodeAt(lineEnds(path).start), nodeAt(lineEnds(path).end)])
  expect(hops).toEqual([['host-a', 'equipment-1'], ['equipment-1', 'equipment-2'], ['equipment-2', 'host-b']])
  expect(seen[0].paths).not.toEqual(seen[1].paths)
  expect(seen[0].notes).not.toEqual(seen[1].notes)
  expect(seen[1].paths).toEqual([])
}

// 패킷 교환 도식과 같은 자리에 같은 폭의 노드를 두고, 링크도 같은 선이다.
function expectSameLayoutAsPacketSwitching() {
  render(<><CircuitSwitchingDiagram /><PacketSwitchingDiagram /></>)
  const circuit = screen.getByRole('figure', { name: '회선 교환 네트워크에서 잡아 둔 회선 도식' })
  const packet = screen.getByRole('figure', { name: '패킷 교환 네트워크에서 패킷이 건너가는 길 도식' })
  const box = (figure: HTMLElement, id: string) => readBox(figure.querySelector(`[data-node="${id}"] rect`)!)

  expect(circuit.querySelector('svg')!.getAttribute('viewBox')).toBe(packet.querySelector('svg')!.getAttribute('viewBox'))
  for (const id of nodeIds) {
    expect({ ...box(circuit, id), id: '' }, id).toEqual({ ...box(packet, packetNode[id]), id: '' })
  }
  for (const id of linkIds) {
    expect(circuit.querySelector(`[data-link="${id}"]`)!.getAttribute('d'), id)
      .toBe(packet.querySelector(`[data-link="${packetLink(id)}"]`)!.getAttribute('d'))
  }
}

describe('CircuitSwitchingDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<CircuitSwitchingDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 여섯과 링크 여섯이 모두 선명하고 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<CircuitSwitchingDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 회선의 노드·링크만 선명하고 지정한 화살표·곁말이 보인다', async (scenario) => {
    const { container } = render(<CircuitSwitchingDiagram />)
    await expectScenario(scenario, tallArrows, tallNotes, 280, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<CircuitSwitchingDiagram />)
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

  it('노드 여섯이 280×248 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<CircuitSwitchingDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 248')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 248])
  })

  it('링크는 늘 보이는 회색 선이고 양 끝이 두 노드의 변에 닿으며 노드는 모두 회색이다', () => {
    render(<CircuitSwitchingDiagram />)
    expectLinks(tallLinks)
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않으며 회선 링크 위에 겹친다', async () => {
    render(<CircuitSwitchingDiagram />)
    await expectArrowEnds(tallLinks)
  })

  it('잡아 둔 회선은 A에서 B까지 이어지고, 호스트 C는 두 시나리오 모두 흐리며 C에서 나가는 화살표가 없다', async () => {
    render(<CircuitSwitchingDiagram />)
    await expectPoint()
  })

  it('패킷 교환 도식과 같은 자리에 노드와 링크를 둔다', () => {
    expectSameLayoutAsPacketSwitching()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    render(<><CircuitSwitchingDiagram /><CircuitSwitchingDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: '회선 교환 네트워크에서 잡아 둔 회선 도식' })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '보내는 중' })) })
      expect(figure.querySelectorAll('[data-path]')).toHaveLength(3)
      for (const path of figure.querySelectorAll('[data-path]')) {
        expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
      }
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<CircuitSwitchingDiagram />)
    const text = visualsByTopicId[topicId].diagrams['circuit-switching']
    const ids = circuitSwitchingScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toBeUndefined()
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([anchorConceptId])
    expect(text.label).toBe('회선 교환 네트워크에서 잡아 둔 회선 도식')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = circuitSwitchingScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 회선 교환 네트워크 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: '회선 교환 네트워크에서 잡아 둔 회선 도식' })

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

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×160 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<CircuitSwitchingDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 160')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·링크 id 집합과 화살표 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<CircuitSwitchingDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 248')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallLinkIds = shownIds('[data-link]', 'data-link').sort()
      await selectScenario('보내는 중')
      const tallPathIds = shownIds('[data-path]', 'data-path').sort()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 160')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinkIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(shownIds('[data-path]', 'data-path').sort()).toEqual(tallPathIds)
    })

    it('모든 rect가 440×160 viewBox 안에 있고 노드 라벨이 자기 상자 안에 들어간다', () => {
      render(<CircuitSwitchingDiagram />)
      expectFits([0, 0, 440, 160])
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보이고 곁말은 노드·선과 겹치지 않는다', async (scenario) => {
      const { container } = render(<CircuitSwitchingDiagram />)
      await expectScenario(scenario, wideArrows, wideNotes, 440, container)
    })

    it('링크는 늘 보이는 회색 선이고 양 끝이 두 노드의 변에 닿으며 노드는 모두 회색이다', () => {
      render(<CircuitSwitchingDiagram />)
      expectLinks(wideLinks)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않으며 회선 링크 위에 겹친다', async () => {
      render(<CircuitSwitchingDiagram />)
      await expectArrowEnds(wideLinks)
    })

    it('잡아 둔 회선은 A에서 B까지 이어지고, 호스트 C는 두 시나리오 모두 흐리며 C에서 나가는 화살표가 없다', async () => {
      render(<CircuitSwitchingDiagram />)
      await expectPoint()
    })

    it('패킷 교환 도식과 같은 자리에 노드와 링크를 둔다', () => {
      expectSameLayoutAsPacketSwitching()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<CircuitSwitchingDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 248')
      await selectScenario('잠시 쉬는 중')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '잠시 쉬는 중' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
      expect(diagram().querySelector('[data-note="c-blocked"]')).toHaveAttribute('x', String(wideNotes['c-blocked'].x))
      expect(diagram().querySelector('[data-note="circuit-unused"]')).toHaveAttribute('y', String(wideNotes['circuit-unused'].y))
    })
  })
})
