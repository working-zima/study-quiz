import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { NeighborDiscoveryDiagram, neighborDiscoveryScenarios } from './NeighborDiscoveryDiagram'

const topicId = 'arp'
const anchorConceptId = `${topicId}.neighbor-discovery`
const labels = {
  'host-a': '호스트 A',
  'host-b': '호스트 B',
  'host-c': '호스트 C',
  'host-d': '호스트 D',
}
const groupLabels = { link: '같은 링크', multicast: '요청 노드 멀티캐스트 그룹' }
const hostNoteLabels = {
  'ipv6-a': '2001:db8::1',
  'ipv6-b': '2001:db8::2',
  'ipv6-c': '2001:db8::3',
  'ipv6-d': '2001:db8::4',
}
const noteLabels = {
  'solicit-name': '이웃 요청',
  'solicit-target': '찾는 주소 2001:db8::2',
  'solicit-cast': '멀티캐스트로 보냄',
  'advertise-name': '이웃 광고',
  'advertise-mac': 'MAC 주소 00-00-5E-00-53-02',
  'advertise-cast': '유니캐스트로 보냄',
}
type NoteId = keyof typeof noteLabels
type HostNoteId = keyof typeof hostNoteLabels
type GroupId = keyof typeof groupLabels

const nodeIds = Object.keys(labels)
// IPv6 주소 곁말마다 그 주소를 쓰는 호스트.
const hostOf: Record<HostNoteId, string> = {
  'ipv6-a': 'host-a',
  'ipv6-b': 'host-b',
  'ipv6-c': 'host-c',
  'ipv6-d': 'host-d',
}

const tallGroups: Record<GroupId, SvgBox> = {
  link: { id: 'link', x: 8, y: 8, width: 264, height: 238 },
  multicast: { id: 'multicast', x: 120, y: 32, width: 148, height: 84 },
}
const wideGroups: Record<GroupId, SvgBox> = {
  link: { id: 'link', x: 8, y: 8, width: 424, height: 164 },
  multicast: { id: 'multicast', x: 168, y: 28, width: 152, height: 84 },
}
const tallArrows: Record<string, string> = {
  'solicit': 'M92 76 H158',
  'advertise': 'M158 76 H92',
}
const wideArrows: Record<string, string> = {
  'solicit': 'M112 72 H204',
  'advertise': 'M204 72 H112',
}
// 화살표마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'solicit': ['host-a', 'host-b'],
  'advertise': ['host-b', 'host-a'],
}

type Note = { x: number, y: number }
const tallNotes: Record<NoteId, Note> = {
  'solicit-name': { x: 82, y: 144 },
  'solicit-target': { x: 82, y: 160 },
  'solicit-cast': { x: 82, y: 176 },
  'advertise-name': { x: 82, y: 144 },
  'advertise-mac': { x: 82, y: 160 },
  'advertise-cast': { x: 82, y: 176 },
}
const wideNotes: Record<NoteId, Note> = {
  'solicit-name': { x: 140, y: 132 },
  'solicit-target': { x: 140, y: 146 },
  'solicit-cast': { x: 140, y: 160 },
  'advertise-name': { x: 140, y: 132 },
  'advertise-mac': { x: 140, y: 146 },
  'advertise-cast': { x: 140, y: 160 },
}
const tallHostNotes: Record<HostNoteId, Note> = {
  'ipv6-a': { x: 56, y: 104 },
  'ipv6-b': { x: 194, y: 108 },
  'ipv6-c': { x: 194, y: 178 },
  'ipv6-d': { x: 194, y: 238 },
}
const wideHostNotes: Record<HostNoteId, Note> = {
  'ipv6-a': { x: 72, y: 104 },
  'ipv6-b': { x: 244, y: 104 },
  'ipv6-c': { x: 384, y: 76 },
  'ipv6-d': { x: 384, y: 140 },
}

const question = 'IPv6는 ARP 대신 무엇으로 이웃을 찾을까?'
const idleCaption = 'IPv6를 쓰는 호스트 A~D가 같은 링크에 있다. 호스트 A가 IPv6 주소 2001:db8::2를 쓰는 이웃의 MAC 주소를 알아내려 한다. 버튼을 고르면 이웃 요청과 이웃 광고가 누구에게 가는지 볼 수 있다.'
const legend = '바깥 상자는 같은 링크이고, 안쪽 상자는 2001:db8::2에 맞춘 요청 노드 멀티캐스트 주소의 그룹이다. 호스트 아래 글은 그 호스트의 IPv6 주소이고, 화살표는 메시지가 가는 길이다.'
const figureName = '같은 링크의 호스트 A~D 가운데 호스트 A가 IPv6 주소 2001:db8::2를 쓰는 호스트 B의 MAC 주소를 찾을 때, 이웃 요청과 이웃 광고가 누구에게 가는지 보이는 도식'
const svgName = '같은 링크에 호스트 A·B·C·D가 있고, 호스트 B만 요청 노드 멀티캐스트 그룹 안에 있다. 호스트마다 IPv6 주소 2001:db8::1·2001:db8::2·2001:db8::3·2001:db8::4가 적혀 있다'
const expectedScenarios = [
  {
    id: 'solicit', label: '이웃 요청',
    nodes: ['host-a', 'host-b'],
    paths: ['solicit'],
    notes: ['solicit-name', 'solicit-target', 'solicit-cast'] as NoteId[],
    caption: '호스트 A가 찾는 주소 2001:db8::2와 자기 MAC 주소를 담은 이웃 요청을 그 주소의 요청 노드 멀티캐스트 주소로 보낸다. 브로드캐스트가 아니어서 이 그룹에 든 B에게만 가고, 그룹에 들지 않은 C와 D는 이 요청을 받아 처리하지 않는다.',
    sources: [anchorConceptId],
  },
  {
    id: 'advertise', label: '이웃 광고',
    nodes: ['host-a', 'host-b'],
    paths: ['advertise'],
    notes: ['advertise-name', 'advertise-mac', 'advertise-cast'] as NoteId[],
    caption: 'B가 자기 MAC 주소 00-00-5E-00-53-02를 담은 이웃 광고를 A에게만 유니캐스트로 보낸다. 요청에 A의 MAC 주소가 들어 있었으므로 B는 따로 묻지 않고 A에게 답할 수 있다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 256]
const wideBox: [number, number, number, number] = [0, 0, 440, 180]

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

function groupBox(id: GroupId) {
  return readBox(diagram().querySelector(`[data-group="${id}"]`)!)
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

function groupLabelBoxes() {
  return Array.from(diagram().querySelectorAll('[data-group-label]'), (label) => textBox(label, label.getAttribute('data-group-label')!))
}

// 선의 양 끝이 지정한 두 노드의 변에 닿고, 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다.
function expectLine(line: Element, id: string, pair: [string, string]) {
  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  for (const segment of segments(line.getAttribute('d')!)) {
    for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const label of groupLabelBoxes()) expect(touches(segment, label), `${id} ↔ ${label.id} 라벨`).toBe(false)
  }
  const { start, end } = lineEnds(line)
  expect(nodeAt(start), `${id} 시작`).toBe(pair[0])
  expect(nodeAt(end), `${id} 끝`).toBe(pair[1])
}

// 글이 viewBox와 링크 상자 안에 있고 노드·선·그룹 라벨과 겹치지 않는다.
function expectTextClear(text: Element, id: string, width: number, height: number) {
  const box = textBox(text, id)
  expect(box.x, id).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width, id).toBeLessThanOrEqual(width)
  expect(box.y, id).toBeGreaterThanOrEqual(0)
  expect(box.y + box.height, id).toBeLessThanOrEqual(height)
  expect(contains(groupBox('link'), box), `${id} ⊂ 링크`).toBe(true)
  for (const node of nodeIds.map(nodeBox)) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
  for (const label of groupLabelBoxes()) expect(overlaps(box, label), `${id} ↔ ${label.id} 라벨`).toBe(false)
  for (const line of diagram().querySelectorAll('[data-path]')) {
    for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), `${id} ↔ 선`).toBe(false)
  }
}

// 그룹 상자 둘은 늘 보이고 흐려지지 않는다. 라벨은 자기 상자 안 왼쪽 위에 있다. 멀티캐스트 그룹은 링크 안에 있고
// 호스트 B만 그 안에 든다. 호스트는 모두 링크 안에 있다.
function expectGroups(groups: Record<GroupId, SvgBox>) {
  expect(shownIds('[data-group]', 'data-group')).toEqual(['link', 'multicast'])
  for (const rect of diagram().querySelectorAll('[data-group]')) {
    const id = rect.getAttribute('data-group')! as GroupId
    expect(readBox(rect)).toEqual(groups[id])
    expect(rect.closest('[opacity]')).toBeNull()
    const label = diagram().querySelector(`[data-group-label="${id}"]`)!
    expect(label.textContent).toBe(groupLabels[id])
    expect(label).toHaveAttribute('font-size', '9')
    expect(label.closest('[opacity]')).toBeNull()
    expect(contains(groups[id], textBox(label, id)), `${id} 라벨`).toBe(true)
    for (const node of nodeIds) expect(overlaps(textBox(label, id), nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
  }
  expect(contains(groups.link, groups.multicast)).toBe(true)
  expect(overlaps(textBox(diagram().querySelector('[data-group-label="link"]')!, 'link'), groups.multicast)).toBe(false)
  for (const node of nodeIds) {
    expect(contains(groups.link, nodeBox(node)), `${node} ⊂ 링크`).toBe(true)
    expect(contains(groups.multicast, nodeBox(node)), `${node} ⊂ 멀티캐스트`).toBe(node === 'host-b')
    if (node !== 'host-b') expect(overlaps(groups.multicast, nodeBox(node)), `${node} ↔ 멀티캐스트`).toBe(false)
  }
}

// IPv6 주소 곁말은 늘 보이고, 자기 호스트 바로 아래 가운데에 놓여 그 호스트와 같은 흐림을 따른다.
// 호스트 B의 주소는 멀티캐스트 그룹 안, 나머지는 그룹 밖에 있다.
function expectHostNotes(places: Record<HostNoteId, Note>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-host-note]'))
  expect(shown.map((note) => note.getAttribute('data-host-note')).sort()).toEqual(Object.keys(hostNoteLabels).sort())
  for (const note of shown) {
    const id = note.getAttribute('data-host-note')! as HostNoteId
    const host = nodeBox(hostOf[id])
    expect(note.textContent).toBe(hostNoteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', 'middle')
    expect(places[id].x).toBe(host.x + host.width / 2)
    expect(places[id].y - 9).toBeGreaterThan(host.y + host.height)
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note).toHaveAttribute('opacity', diagram().querySelector(`[data-node="${hostOf[id]}"]`)!.getAttribute('opacity')!)
    expect(contains(groupBox('multicast'), textBox(note, id)), `${id} ⊂ 멀티캐스트`).toBe(id === 'ipv6-b')
    if (id !== 'ipv6-b') expect(overlaps(groupBox('multicast'), textBox(note, id)), `${id} ↔ 멀티캐스트`).toBe(false)
    expectTextClear(note, id, width, height)
  }
}

// 보이는 곁말이 지정한 id·글·자리이고, 멀티캐스트 그룹 밖에서 노드·선·IPv6 주소 곁말·다른 곁말과 겹치지 않는다.
function expectNotes(ids: NoteId[], places: Record<NoteId, Note>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note')).sort()).toEqual([...ids].sort())
  const hostNotes = Array.from(diagram().querySelectorAll('[data-host-note]'), (note) => textBox(note, note.getAttribute('data-host-note')!))
  const boxes = shown.map((note) => textBox(note, note.getAttribute('data-note')!))
  for (const note of shown) {
    const id = note.getAttribute('data-note')! as NoteId
    expect(note.textContent).toBe(noteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', 'middle')
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note.closest('[opacity]')).toBeNull()
    expectTextClear(note, id, width, height)
    expect(overlaps(textBox(note, id), groupBox('multicast')), `${id} ↔ 멀티캐스트`).toBe(false)
    for (const hostNote of hostNotes) expect(overlaps(textBox(note, id), hostNote), `${id} ↔ ${hostNote.id}`).toBe(false)
    for (const other of boxes.filter((box) => box.id !== id)) expect(overlaps(textBox(note, id), other), `${id} ↔ ${other.id}`).toBe(false)
  }
}

async function expectScenario(
  scenario: typeof expectedScenarios[number],
  arrows: Record<string, string>,
  places: Record<NoteId, Note>,
  hostPlaces: Record<HostNoteId, Note>,
  groups: Record<GroupId, SvgBox>,
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
  expectGroups(groups)
  expectNotes(scenario.notes, places, width, height)
  expectHostNotes(hostPlaces, width, height)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다. 노드는 모두 회색이다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length + 2)
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

function hops() {
  return Array.from(diagram().querySelectorAll('[data-path]'), (path) => [nodeAt(lineEnds(path).start)!, nodeAt(lineEnds(path).end)!])
}

function noteText(id: string) {
  return diagram().querySelector(`[data-note="${id}"]`)!.textContent!
}

// 요점: 이웃 요청은 모든 호스트가 아니라 멀티캐스트 그룹에 든 B에게만 닿고, 그룹 밖의 C·D에는 화살표가 닿지 않는다.
// 이웃 광고는 B에서 A로 가는 화살표 하나뿐이다. 「ARP」라는 노드는 없다. 곁말의 주소는 본문의 예시 주소와 같다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  for (const id of nodeIds) expect(diagram().querySelector(`[data-node="${id}"] text`)!.textContent).not.toContain('ARP')

  await selectScenario('이웃 요청')
  const solicit = hops()
  expect(solicit).toEqual([['host-a', 'host-b']])
  const end = lineEnds(diagram().querySelector('[data-path]')!).end
  expect(end.x >= groupBox('multicast').x && end.x <= groupBox('multicast').x + groupBox('multicast').width).toBe(true)
  for (const id of ['host-c', 'host-d']) {
    expect(diagram().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', '0.25')
    for (const segment of segments(diagram().querySelector('[data-path]')!.getAttribute('d')!)) expect(touches(segment, nodeBox(id)), id).toBe(false)
  }
  expect(noteText('solicit-target')).toBe(`찾는 주소 ${hostNoteLabels['ipv6-b']}`)
  expect(noteText('solicit-cast')).toContain('멀티캐스트')

  await selectScenario('이웃 광고')
  expect(hops()).toEqual([['host-b', 'host-a']])
  for (const id of ['host-c', 'host-d']) expect(diagram().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', '0.25')
  expect(noteText('advertise-cast')).toContain('유니캐스트')

  const macB = noteText('advertise-mac').replace('MAC 주소 ', '')
  expect(body).toContain(`IPv6 주소 \`${hostNoteLabels['ipv6-a']}\`, \`${hostNoteLabels['ipv6-b']}\`, \`${hostNoteLabels['ipv6-c']}\`, \`${hostNoteLabels['ipv6-d']}\`를 쓴다고 하자`)
  expect(body).toContain(`B의 MAC 주소는 \`${macB}\`다`)
  expect(body).toContain('이 그룹에는 B만 들어 있고, 그룹에 들지 않은 C와 D는 이 요청을 받아 처리하지 않는다')
  expect(body).toContain(`B는 자기 MAC 주소 \`${macB}\`를 담은 이웃 광고를 A에게만 유니캐스트로 보낸다`)
  expect(body).toContain('이웃 요청은 브로드캐스트로 보내지 않는다')
  expect(body).toContain('요청 노드 멀티캐스트 주소(solicited-node multicast address)의 그룹에 들어간다')
}

async function expectUniqueMarkers() {
  render(<><NeighborDiscoveryDiagram /><NeighborDiscoveryDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '이웃 요청' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(1)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('NeighborDiscoveryDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<NeighborDiscoveryDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표·곁말 없이 그룹·IPv6 주소와 선택 안내가 나온다', () => {
    const { container } = render(<NeighborDiscoveryDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node], [data-host-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expectGroups(tallGroups)
    expectHostNotes(tallHostNotes, 280, 256)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<NeighborDiscoveryDiagram />)
    await expectScenario(scenario, tallArrows, tallNotes, tallHostNotes, tallGroups, 280, 256, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<NeighborDiscoveryDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node], [data-host-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드가 280×256 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<NeighborDiscoveryDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 256')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
    render(<NeighborDiscoveryDiagram />)
    await expectArrowEnds()
  })

  it('이웃 요청은 멀티캐스트 그룹의 B에게만 닿고, 이웃 광고는 B에서 A로만 간다', async () => {
    render(<NeighborDiscoveryDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<NeighborDiscoveryDiagram />)
    const text = visualsByTopicId[topicId].diagrams['neighbor-discovery']
    const ids = neighborDiscoveryScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual({ ...hostNoteLabels, ...noteLabels })
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([anchorConceptId])
    expect(text.label).toBe(figureName)
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = neighborDiscoveryScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 IPv6의 이웃 탐색 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×180 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커·그룹·IPv6 주소를 유지한다', () => {
      render(<NeighborDiscoveryDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 180')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
      expectGroups(wideGroups)
      expectHostNotes(wideHostNotes, 440, 180)
    })

    it('노드·그룹·주소 곁말 id 집합과 화살표·곁말 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<NeighborDiscoveryDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 256')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroupIds = shownIds('[data-group]', 'data-group').sort()
      const tallHostNoteIds = shownIds('[data-host-note]', 'data-host-note').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')
      const tallNoteIds = await collectIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 180')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroupIds)
      expect(shownIds('[data-host-note]', 'data-host-note').sort()).toEqual(tallHostNoteIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(tallNoteIds).toEqual(Object.keys(noteLabels).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
      expect(await collectIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
    })

    it('모든 rect가 440×180 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<NeighborDiscoveryDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<NeighborDiscoveryDiagram />)
      await expectScenario(scenario, wideArrows, wideNotes, wideHostNotes, wideGroups, 440, 180, container)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
      render(<NeighborDiscoveryDiagram />)
      await expectArrowEnds()
    })

    it('이웃 요청은 멀티캐스트 그룹의 B에게만 닿고, 이웃 광고는 B에서 A로만 간다', async () => {
      render(<NeighborDiscoveryDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<NeighborDiscoveryDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 256')
      await selectScenario('이웃 광고')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '이웃 광고' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['advertise'])
      expect(paths[0]).toHaveAttribute('d', wideArrows.advertise)
      expect(diagram().querySelector('[data-note="advertise-mac"]')).toHaveAttribute('x', String(wideNotes['advertise-mac'].x))
    })
  })
})
