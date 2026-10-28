import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { SwitchForwardDiagram, switchForwardScenarios } from './SwitchForwardDiagram'

const topicId = 'hub-switch-vlan'
const anchorConceptId = `${topicId}.switch`
const labels = {
  hub: '허브',
  'host-a': '호스트 A',
  'host-b': '호스트 B',
  'host-c': '호스트 C',
  'host-d': '호스트 D',
  switch: '스위치',
  'sw-host-a': '호스트 A',
  'sw-host-b': '호스트 B',
  'sw-host-c': '호스트 C',
  'sw-host-d': '호스트 D',
}
const portLabels = {
  'hub-port-1': '포트 1',
  'hub-port-2': '포트 2',
  'hub-port-3': '포트 3',
  'hub-port-4': '포트 4',
  'sw-port-1': '포트 1',
  'sw-port-2': '포트 2',
  'sw-port-3': '포트 3',
  'sw-port-4': '포트 4',
}
const noteLabels = {
  'hub-note': '목적지 MAC 주소를 보지 않고 다른 모든 포트로',
  'switch-note': '목적지 MAC 주소를 보고 포트 3으로만',
}
type NoteId = keyof typeof noteLabels
type PortId = keyof typeof portLabels

const nodeIds = Object.keys(labels)
const hubHostIds = ['host-a', 'host-b', 'host-c', 'host-d']
const switchHostIds = ['sw-host-a', 'sw-host-b', 'sw-host-c', 'sw-host-d']
const portIds = Object.keys(portLabels) as PortId[]
const hubLinkIds = ['hub-cable-a', 'hub-cable-b', 'hub-cable-c', 'hub-cable-d']
const switchLinkIds = ['sw-cable-a', 'sw-cable-b', 'sw-cable-c', 'sw-cable-d']
const linkIds = [...hubLinkIds, ...switchLinkIds]

const tallLinks: Record<string, string> = {
  'hub-cable-a': 'M38 40 V72',
  'hub-cable-b': 'M106 40 V72',
  'hub-cable-c': 'M174 40 V72',
  'hub-cable-d': 'M242 40 V72',
  'sw-cable-a': 'M38 168 V200',
  'sw-cable-b': 'M106 168 V200',
  'sw-cable-c': 'M174 168 V200',
  'sw-cable-d': 'M242 168 V200',
}
const wideLinks: Record<string, string> = {
  'hub-cable-a': 'M58 40 V64',
  'hub-cable-b': 'M166 40 V64',
  'hub-cable-c': 'M274 40 V64',
  'hub-cable-d': 'M382 40 V64',
  'sw-cable-a': 'M58 156 V180',
  'sw-cable-b': 'M166 156 V180',
  'sw-cable-c': 'M274 156 V180',
  'sw-cable-d': 'M382 156 V180',
}
const tallArrows: Record<string, string> = {
  'hub-from-a': 'M38 72 V40',
  'hub-to-b': 'M106 40 V72',
  'hub-to-c': 'M174 40 V72',
  'hub-to-d': 'M242 40 V72',
  'sw-from-a': 'M38 200 V168',
  'sw-to-c': 'M174 168 V200',
}
const wideArrows: Record<string, string> = {
  'hub-from-a': 'M58 64 V40',
  'hub-to-b': 'M166 40 V64',
  'hub-to-c': 'M274 40 V64',
  'hub-to-d': 'M382 40 V64',
  'sw-from-a': 'M58 180 V156',
  'sw-to-c': 'M274 156 V180',
}
// 케이블과 화살표마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'hub-cable-a': ['hub', 'host-a'],
  'hub-cable-b': ['hub', 'host-b'],
  'hub-cable-c': ['hub', 'host-c'],
  'hub-cable-d': ['hub', 'host-d'],
  'sw-cable-a': ['switch', 'sw-host-a'],
  'sw-cable-b': ['switch', 'sw-host-b'],
  'sw-cable-c': ['switch', 'sw-host-c'],
  'sw-cable-d': ['switch', 'sw-host-d'],
  'hub-from-a': ['host-a', 'hub'],
  'hub-to-b': ['hub', 'host-b'],
  'hub-to-c': ['hub', 'host-c'],
  'hub-to-d': ['hub', 'host-d'],
  'sw-from-a': ['sw-host-a', 'switch'],
  'sw-to-c': ['switch', 'sw-host-c'],
}
// 포트 이름표마다 그 포트에 꽂힌 케이블과 호스트.
const portPlace: Record<PortId, { link: string, host: string }> = {
  'hub-port-1': { link: 'hub-cable-a', host: 'host-a' },
  'hub-port-2': { link: 'hub-cable-b', host: 'host-b' },
  'hub-port-3': { link: 'hub-cable-c', host: 'host-c' },
  'hub-port-4': { link: 'hub-cable-d', host: 'host-d' },
  'sw-port-1': { link: 'sw-cable-a', host: 'sw-host-a' },
  'sw-port-2': { link: 'sw-cable-b', host: 'sw-host-b' },
  'sw-port-3': { link: 'sw-cable-c', host: 'sw-host-c' },
  'sw-port-4': { link: 'sw-cable-d', host: 'sw-host-d' },
}

type Note = { x: number, y: number, anchor: 'start' | 'middle' }
const tallPorts: Record<PortId, Note> = {
  'hub-port-1': { x: 42, y: 60, anchor: 'start' },
  'hub-port-2': { x: 110, y: 60, anchor: 'start' },
  'hub-port-3': { x: 178, y: 60, anchor: 'start' },
  'hub-port-4': { x: 246, y: 60, anchor: 'start' },
  'sw-port-1': { x: 42, y: 188, anchor: 'start' },
  'sw-port-2': { x: 110, y: 188, anchor: 'start' },
  'sw-port-3': { x: 178, y: 188, anchor: 'start' },
  'sw-port-4': { x: 246, y: 188, anchor: 'start' },
}
const widePorts: Record<PortId, Note> = {
  'hub-port-1': { x: 62, y: 56, anchor: 'start' },
  'hub-port-2': { x: 170, y: 56, anchor: 'start' },
  'hub-port-3': { x: 278, y: 56, anchor: 'start' },
  'hub-port-4': { x: 386, y: 56, anchor: 'start' },
  'sw-port-1': { x: 62, y: 172, anchor: 'start' },
  'sw-port-2': { x: 170, y: 172, anchor: 'start' },
  'sw-port-3': { x: 278, y: 172, anchor: 'start' },
  'sw-port-4': { x: 386, y: 172, anchor: 'start' },
}
const tallNotes: Record<NoteId, Note> = {
  'hub-note': { x: 140, y: 120, anchor: 'middle' },
  'switch-note': { x: 140, y: 248, anchor: 'middle' },
}
const wideNotes: Record<NoteId, Note> = {
  'hub-note': { x: 220, y: 112, anchor: 'middle' },
  'switch-note': { x: 220, y: 228, anchor: 'middle' },
}

const question = '스위치는 허브와 무엇이 다를까?'
const idleCaption = '위에는 호스트 A~D를 허브의 포트 1~4에, 아래에는 같은 호스트 A~D를 스위치의 포트 1~4에 하나씩 이었다. 두 장비 모두 여러 장치를 케이블로 한데 잇는다. 버튼을 고르면 호스트 A가 호스트 C에게 보낸 프레임을 두 장비가 각각 어느 포트로 내보내는지 볼 수 있다.'
const legend = '포트 1~4는 장비에서 케이블을 꽂는 자리다. 가는 선은 케이블, 화살표는 프레임이 가는 길이다.'
const expectedScenarios = [
  {
    id: 'hub', label: '허브라면', device: 'hub', sender: 'host-a', hosts: hubHostIds,
    receivers: ['host-b', 'host-c', 'host-d'],
    nodes: ['hub', ...hubHostIds, ...hubLinkIds],
    paths: ['hub-from-a', 'hub-to-b', 'hub-to-c', 'hub-to-d'],
    notes: ['hub-note'] as NoteId[],
    caption: '허브는 목적지 MAC 주소를 보지 않으므로, 포트 1로 들어온 호스트 A의 프레임을 포트 2·3·4로 모두 내보낸다. 받을 장치가 아닌 B와 D의 케이블에도 같은 프레임이 실리고, B와 D의 NIC가 그 프레임을 버려야 한다.',
  },
  {
    id: 'switch', label: '스위치라면', device: 'switch', sender: 'sw-host-a', hosts: switchHostIds,
    receivers: ['sw-host-c'],
    nodes: ['switch', 'sw-host-a', 'sw-host-c', 'sw-cable-a', 'sw-cable-c'],
    paths: ['sw-from-a', 'sw-to-c'],
    notes: ['switch-note'] as NoteId[],
    caption: '스위치는 목적지 MAC 주소를 보고, C가 이어진 포트 3으로만 프레임을 내보낸다. B와 D의 케이블로는 그 프레임이 지나가지 않는다. 이 그림은 C가 포트 3에 이어져 있다는 것을 스위치가 이미 알고 있을 때다.',
  },
]

function diagram() {
  return screen.getByRole('img', { name: '같은 호스트 A~D를 위에서는 허브에, 아래에서는 스위치에 포트 1~4로 하나씩 이었을 때, 호스트 A가 호스트 C에게 보낸 프레임이 어느 포트로 나가는지 보이는 모습' })
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

// 포트 이름표는 늘 보이고, 자기 케이블과 같은 흐림을 따른다.
function expectPorts(places: Record<PortId, Note>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-port]'))
  expect(shown.map((port) => port.getAttribute('data-port'))).toEqual(portIds)
  for (const port of shown) {
    const id = port.getAttribute('data-port')! as PortId
    const cable = diagram().querySelector(`[data-link="${portPlace[id].link}"]`)!
    expect(port.textContent).toBe(portLabels[id])
    expect(port).toHaveAttribute('x', String(places[id].x))
    expect(port).toHaveAttribute('y', String(places[id].y))
    expect(port).toHaveAttribute('text-anchor', places[id].anchor)
    expect(port).toHaveAttribute('font-size', '9')
    expect(port).toHaveClass('fill-muted')
    expect(port, id).toHaveAttribute('opacity', cable.getAttribute('opacity')!)
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
}

// 아래 단언들은 배치에 묶이지 않는다. 세로형과 가로형이 같은 기대값으로 통과해야 한다.
async function expectScenario(
  scenario: typeof expectedScenarios[number],
  arrows: Record<string, string>,
  places: Record<NoteId, Note>,
  ports: Record<PortId, Note>,
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
  expectPorts(ports, width, height)
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

// 케이블 여덟은 늘 보이고 회색이며 장비와 호스트를 잇는다. 노드는 모두 회색이고 도식 전용 두 색·초록·빨강·주황은 쓰지 않는다.
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

// 포트 이름표가 자기 호스트로 내려가는 케이블 바로 오른쪽에 있다.
function expectPortsBesideCables() {
  for (const port of portIds) {
    const { link, host } = portPlace[port]
    const cable = diagram().querySelector(`[data-link="${link}"]`)!
    const x = segments(cable.getAttribute('d')!)[0].x1
    const box = nodeBox(host)
    expect(x, port).toBe(box.x + box.width / 2)
    const label = textBox(diagram().querySelector(`[data-port="${port}"]`)!)
    expect(label.x, port).toBe(x + 4)
    const scene = port.startsWith('hub') ? hubHostIds : switchHostIds
    const others = scene.filter((id) => id !== host).map((id) => nodeBox(id).x + nodeBox(id).width / 2)
    for (const other of others) expect(label.x + label.width < other || label.x > other, `${port} ↔ 다른 케이블`).toBe(true)
  }
}

async function expectArrowEnds() {
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    for (const path of diagram().querySelectorAll('[data-path]')) expectLine(path, path.getAttribute('data-path')!)
  }
}

// 요점: 두 시나리오 모두 호스트 A가 보낸 프레임 하나가 장비로 들어간다. 허브는 A를 뺀 세 호스트 모두에게 내보내고,
// 스위치는 C 하나에게만 내보낸다 — 전달 경로가 허브에서 셋, 스위치에서 하나다. 곁말은 자기 장면 바로 아래에 있고, 그 말은 개념 본문에 있다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const senders = new Set<string>()
  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    const hops = Array.from(diagram().querySelectorAll('[data-path]'), (path) => [nodeAt(lineEnds(path).start)!, nodeAt(lineEnds(path).end)!])
    const inbound = hops.filter(([, to]) => to === scenario.device)
    const outbound = hops.filter(([from]) => from === scenario.device).map(([, to]) => to).sort()
    expect(inbound, scenario.label).toEqual([[scenario.sender, scenario.device]])
    expect(outbound, scenario.label).toEqual([...scenario.receivers].sort())
    expect(outbound, scenario.label).not.toContain(scenario.sender)
    senders.add(labels[scenario.sender as keyof typeof labels])
    for (const host of scenario.hosts) {
      const reached = outbound.includes(host) || host === scenario.sender
      expect(diagram().querySelector(`[data-node="${host}"]`), `${scenario.label} ${host}`).toHaveAttribute('opacity', reached ? '1' : '0.25')
    }
    const note = diagram().querySelector('[data-note]')!
    const lowest = Math.max(...scenario.hosts.map((id) => nodeBox(id).y + nodeBox(id).height))
    expect(textBox(note).y, scenario.label).toBeGreaterThanOrEqual(lowest)
    expect(body).toContain(note.textContent!)
  }
  expect(hopsCount(expectedScenarios[0])).toBe(3)
  expect(hopsCount(expectedScenarios[1])).toBe(1)
  expect([...senders]).toEqual(['호스트 A'])
  // 허브 장면의 곁말은 스위치 장면보다 위에 있다.
  await selectScenario('허브라면')
  const hubNote = textBox(diagram().querySelector('[data-note="hub-note"]')!)
  expect(hubNote.y + hubNote.height).toBeLessThan(nodeBox('switch').y)
  expect(body).toContain('스위치는 받은 프레임의 목적지 MAC 주소를 보고, 그 주소의 장치가 어느 포트에 이어져 있는지 알면 그 포트로만 프레임을 내보낸다')
  expect(body).toContain('포트 2의 B와 포트 4의 D에게는 그 프레임이 가지 않는다')
  expect(body).toContain('이미 알고 있다면')
}

function hopsCount(scenario: typeof expectedScenarios[number]) {
  return scenario.paths.filter((id) => ends[id][0] === scenario.device).length
}

async function expectUniqueMarkers() {
  render(<><SwitchForwardDiagram /><SwitchForwardDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: '허브와 스위치가 프레임을 내보내는 곳을 견주는 도식' })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '허브라면' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(4)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('SwitchForwardDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<SwitchForwardDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 열·케이블 여덟·포트 이름표 여덟이 모두 선명하고 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<SwitchForwardDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
    expect(shownIds('[data-port]', 'data-port')).toEqual(portIds)
    for (const element of diagram().querySelectorAll('[data-node], [data-link], [data-port]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·케이블·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<SwitchForwardDiagram />)
    await expectScenario(scenario, tallArrows, tallNotes, tallPorts, 280, 256, container)
  })

  it('시나리오를 바꾸면 이전 화살표와 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<SwitchForwardDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
      expect(shownIds('[data-note]', 'data-note')).toEqual(scenario.notes)
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node], [data-link], [data-port]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드가 280×256 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<SwitchForwardDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 256')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 256])
  })

  it('케이블은 늘 보이고 회색이며, 포트 이름표는 자기 호스트의 케이블 곁에 늘 보인다', () => {
    render(<SwitchForwardDiagram />)
    expectLinks(tallLinks)
    expectPorts(tallPorts, 280, 256)
    expectPortsBesideCables()
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<SwitchForwardDiagram />)
    await expectArrowEnds()
  })

  it('같은 호스트 A가 보낼 때 허브는 세 호스트에게, 스위치는 호스트 C 하나에게만 내보낸다', async () => {
    render(<SwitchForwardDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<SwitchForwardDiagram />)
    const text = visualsByTopicId[topicId].diagrams['switch-forward']
    const ids = switchForwardScenarios.map(({ id }) => id).sort()
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
    expect(text.label).toBe('허브와 스위치가 프레임을 내보내는 곳을 견주는 도식')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = switchForwardScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 스위치 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: '허브와 스위치가 프레임을 내보내는 곳을 견주는 도식' })

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

    it('440×236 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<SwitchForwardDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 236')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·케이블·포트 이름표 id 집합과 화살표 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<SwitchForwardDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 256')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallLinkIds = shownIds('[data-link]', 'data-link').sort()
      const tallPortIds = shownIds('[data-port]', 'data-port').sort()
      const tallPathIds = await collectPathIds()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 236')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinkIds)
      expect(shownIds('[data-port]', 'data-port').sort()).toEqual(tallPortIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(await collectPathIds()).toEqual(tallPathIds)
    })

    it('모든 rect가 440×236 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<SwitchForwardDiagram />)
      expectFits([0, 0, 440, 236])
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<SwitchForwardDiagram />)
      await expectScenario(scenario, wideArrows, wideNotes, widePorts, 440, 236, container)
    })

    it('케이블은 늘 보이고 회색이며, 포트 이름표는 자기 호스트의 케이블 곁에 늘 보인다', () => {
      render(<SwitchForwardDiagram />)
      expectLinks(wideLinks)
      expectPorts(widePorts, 440, 236)
      expectPortsBesideCables()
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<SwitchForwardDiagram />)
      await expectArrowEnds()
    })

    it('같은 호스트 A가 보낼 때 허브는 세 호스트에게, 스위치는 호스트 C 하나에게만 내보낸다', async () => {
      render(<SwitchForwardDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<SwitchForwardDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 256')
      await selectScenario('스위치라면')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '스위치라면' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['sw-from-a', 'sw-to-c'])
      for (const path of paths) expect(path).toHaveAttribute('d', wideArrows[path.getAttribute('data-path')!])
      expect(diagram().querySelector('[data-note="switch-note"]')).toHaveAttribute('x', String(wideNotes['switch-note'].x))
    })
  })
})
