import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ArpPurposeDiagram, arpPurposeScenarios } from './ArpPurposeDiagram'

const topicId = 'arp'
const anchorConceptId = `${topicId}.arp`
const labels = {
  'host-a': '호스트 A',
  'host-b': '호스트 B',
  'dst-mac': '목적지 MAC 주소',
  'src-mac': '출발지 MAC 주소',
  'packet': 'IP 패킷',
}
const groupLabels = { frame: '호스트 A가 보낼 프레임' }
const cellNoteLabels = {
  'src-value': '00-00-5E-00-53-01',
  'packet-value': '목적지 IP 주소 192.0.2.2',
}
const noteLabels = {
  'dst-unknown': '모름',
  'dst-known': '00-00-5E-00-53-02',
  'blocked': '프레임을 보낼 수 없음',
}
type NoteId = keyof typeof noteLabels
type CellNoteId = keyof typeof cellNoteLabels

const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
// 칸 값 곁말마다 그 값이 적히는 칸.
const cellOf: Record<CellNoteId, string> = {
  'src-value': 'src-mac',
  'packet-value': 'packet',
}
// 프레임의 세 칸은 프레임 상자 안에, 두 호스트는 밖에 있다.
const cellIds = ['dst-mac', 'src-mac', 'packet']

const tallArrows: Record<string, string> = { send: 'M80 24 H200' }
const wideArrows: Record<string, string> = { send: 'M88 24 H352' }
const ends: Record<string, [string, string]> = { send: ['host-a', 'host-b'] }

type Box = { x: number, y: number, width: number, height: number }
const tallGroups: Record<string, Box> = { frame: { x: 8, y: 56, width: 264, height: 128 } }
const wideGroups: Record<string, Box> = { frame: { x: 16, y: 56, width: 408, height: 88 } }

type Note = { x: number, y: number, anchor: 'start' | 'middle' | 'end' }
const tallNotes: Record<NoteId, Note> = {
  'dst-unknown': { x: 132, y: 100, anchor: 'start' },
  'dst-known': { x: 132, y: 100, anchor: 'start' },
  'blocked': { x: 140, y: 28, anchor: 'middle' },
}
const wideNotes: Record<NoteId, Note> = {
  'dst-unknown': { x: 92, y: 128, anchor: 'middle' },
  'dst-known': { x: 92, y: 128, anchor: 'middle' },
  'blocked': { x: 220, y: 28, anchor: 'middle' },
}
const tallCellNotes: Record<CellNoteId, Note> = {
  'src-value': { x: 132, y: 132, anchor: 'start' },
  'packet-value': { x: 132, y: 164, anchor: 'start' },
}
const wideCellNotes: Record<CellNoteId, Note> = {
  'src-value': { x: 220, y: 128, anchor: 'middle' },
  'packet-value': { x: 348, y: 128, anchor: 'middle' },
}

const question = 'IP 주소만 알 때 무엇이 더 필요할까?'
const idleCaption = '호스트 A가 같은 LAN의 호스트 B에게 보낼 프레임이다. A는 B의 IP 주소 192.0.2.2를 알고 있다. 버튼을 고르면 ARP 전과 뒤에 목적지 MAC 주소 칸이 어떻게 다른지 볼 수 있다.'
const legend = '아래 상자는 프레임의 칸 가운데 이 그림에 필요한 셋만 앞쪽부터 차례로 그린 것이고, 칸 곁의 글은 그 칸에 적히는 값이다. 화살표는 프레임이 가는 길이다.'
const figureName = '호스트 A가 호스트 B의 IP 주소만 알 때와 ARP로 MAC 주소를 알아낸 뒤, 보낼 프레임의 목적지 MAC 주소 칸을 견주는 도식'
const expectedScenarios = [
  {
    id: 'unknown', label: 'ARP 전',
    nodes: ['host-a', 'dst-mac', 'packet'],
    paths: [] as string[],
    notes: ['dst-unknown', 'blocked'] as NoteId[],
    caption: '호스트 A는 B의 IP 주소만 알고 MAC 주소는 모른다. 목적지 MAC 주소 칸을 채울 수 없어 프레임을 보낼 수 없고, IP 주소와 MAC 주소는 서로 관계가 없어 IP 주소에서 계산해 낼 수도 없다.',
    sources: [anchorConceptId],
  },
  {
    id: 'resolved', label: 'ARP 뒤',
    nodes: ['host-a', 'host-b', 'dst-mac', 'src-mac', 'packet'],
    paths: ['send'],
    notes: ['dst-known'] as NoteId[],
    caption: 'A가 ARP로 B의 MAC 주소 00-00-5E-00-53-02를 알아내 목적지 MAC 주소 칸에 넣고 프레임을 보낸다. IP 패킷에 적힌 목적지 IP 주소 192.0.2.2는 바뀌지 않는다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 192]
const wideBox: [number, number, number, number] = [0, 0, 440, 152]
const macPattern = /^[0-9A-F]{2}(?:-[0-9A-F]{2}){5}$/u

function diagram() {
  return screen.getByRole('img', { name: '호스트 A와 호스트 B, 그리고 호스트 A가 보낼 프레임의 목적지 MAC 주소·출발지 MAC 주소·IP 패킷 칸' })
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

function groupBox(id: string) {
  return readBox(diagram().querySelector(`[data-group="${id}"]`)!)
}

function shownIds(selector: string, attribute: string) {
  return Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)!)
}

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

function center(box: SvgBox) {
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

function distance(a: SvgBox, b: SvgBox) {
  return Math.hypot(center(a).x - center(b).x, center(a).y - center(b).y)
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

// 점이 변 위에 놓인 노드. 칸들은 맞붙어 있으므로 맞닿은 변에서는 앞에 적은 노드를 고른다.
function nodeAt(point: { x: number, y: number }) {
  return nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))
}

function groupLabelBoxes() {
  return Array.from(diagram().querySelectorAll('[data-group-label]'), (label) => textBox(label, label.getAttribute('data-group-label')!))
}

// 선의 양 끝이 지정한 두 노드의 변에 닿고, 어떤 선분도 노드 안과 그룹 라벨 영역을 지나지 않는다.
function expectLine(line: Element, id: string) {
  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  for (const segment of segments(line.getAttribute('d')!)) {
    for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const label of groupLabelBoxes()) expect(touches(segment, label), `${id} ↔ 라벨 ${label.id}`).toBe(false)
  }
  const { start, end } = lineEnds(line)
  expect(nodeAt(start), `${id} 시작`).toBe(ends[id][0])
  expect(nodeAt(end), `${id} 끝`).toBe(ends[id][1])
}

// 글이 viewBox 안에 있고 노드·선·그룹 라벨과 겹치지 않으며 그룹 박스의 변에 걸치지 않는다.
function expectTextClear(text: Element, id: string, width: number, height: number) {
  const box = textBox(text, id)
  expect(box.x, id).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width, id).toBeLessThanOrEqual(width)
  expect(box.y, id).toBeGreaterThanOrEqual(0)
  expect(box.y + box.height, id).toBeLessThanOrEqual(height)
  for (const node of nodeIds.map(nodeBox)) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
  for (const label of groupLabelBoxes()) expect(overlaps(box, label), `${id} ↔ 라벨 ${label.id}`).toBe(false)
  for (const line of diagram().querySelectorAll('[data-path]')) {
    for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), `${id} ↔ 선`).toBe(false)
  }
  for (const group of groupIds.map(groupBox)) expect(contains(group, box) || !overlaps(group, box), `${id} ↔ ${group.id}`).toBe(true)
}

// 칸 값 곁말은 늘 보이고, 자기 칸 곁에 놓이며 그 칸과 같은 흐림을 따른다.
function expectCellNotes(places: Record<CellNoteId, Note>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-cell-note]'))
  expect(shown.map((note) => note.getAttribute('data-cell-note')).sort()).toEqual(Object.keys(cellNoteLabels).sort())
  for (const note of shown) {
    const id = note.getAttribute('data-cell-note')! as CellNoteId
    expect(note.textContent).toBe(cellNoteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', places[id].anchor)
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note).toHaveAttribute('opacity', diagram().querySelector(`[data-node="${cellOf[id]}"]`)!.getAttribute('opacity')!)
    const nearest = cellIds.map(nodeBox).sort((a, b) => distance(a, textBox(note, id)) - distance(b, textBox(note, id)))[0]
    expect(nearest.id, `${id} 가장 가까운 칸`).toBe(cellOf[id])
    expectTextClear(note, id, width, height)
  }
}

// 보이는 곁말이 지정한 id·글·자리이고, viewBox 안에서 노드·선·칸 값과 겹치지 않는다.
function expectNotes(ids: NoteId[], places: Record<NoteId, Note>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note')).sort()).toEqual([...ids].sort())
  const cellNotes = Array.from(diagram().querySelectorAll('[data-cell-note]'), (note) => textBox(note, note.getAttribute('data-cell-note')!))
  for (const note of shown) {
    const id = note.getAttribute('data-note')! as NoteId
    expect(note.textContent).toBe(noteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', places[id].anchor)
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note.closest('[opacity]')).toBeNull()
    expectTextClear(note, id, width, height)
    for (const cellNote of cellNotes) expect(overlaps(textBox(note, id), cellNote), `${id} ↔ ${cellNote.id}`).toBe(false)
  }
}

// 그룹 박스는 늘 보이고 흐려지지 않으며, 라벨은 박스 안 왼쪽 위에 있다. 세 칸은 박스 안에, 두 호스트는 박스 밖에 있다.
function expectGroups(places: Record<string, Box>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-group]'))
  expect(shown.map((group) => group.getAttribute('data-group'))).toEqual(groupIds)
  expect(boxesOutsideViewBox(shown.map(readBox), [0, 0, width, height])).toEqual([])
  for (const group of shown) {
    const id = group.getAttribute('data-group')!
    expect(readBox(group)).toEqual({ id, ...places[id] })
    expect(group.closest('[opacity]')).toBeNull()
    const label = diagram().querySelector(`[data-group-label="${id}"]`)!
    expect(label.textContent).toBe(groupLabels[id as keyof typeof groupLabels])
    expect(label).toHaveAttribute('font-size', '9')
    expect(label.closest('[opacity]')).toBeNull()
    expect(contains(readBox(group), textBox(label, id)), `${id} 라벨`).toBe(true)
    for (const node of nodeIds.map(nodeBox)) expect(overlaps(textBox(label, id), node), `${id} 라벨 ↔ ${node.id}`).toBe(false)
  }
  for (const id of cellIds) expect(contains(groupBox('frame'), nodeBox(id)), `${id} ∈ frame`).toBe(true)
  for (const id of ['host-a', 'host-b']) expect(overlaps(groupBox('frame'), nodeBox(id)), `${id} ∉ frame`).toBe(false)
}

async function expectScenario(
  scenario: typeof expectedScenarios[number],
  arrows: Record<string, string>,
  places: Record<NoteId, Note>,
  cellPlaces: Record<CellNoteId, Note>,
  groups: Record<string, Box>,
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
  expectGroups(groups, width, height)
  expectNotes(scenario.notes, places, width, height)
  expectCellNotes(cellPlaces, width, height)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다. 노드는 모두 회색이다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
  expect(diagram().querySelectorAll('rect')).toHaveLength(nodeIds.length + groupIds.length)
  expect(boxesOutsideViewBox(groupLabelBoxes(), viewBox)).toEqual([])

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
    for (const path of diagram().querySelectorAll('[data-path]')) expectLine(path, path.getAttribute('data-path')!)
  }
}

function brightNodes() {
  return nodeIds.filter((id) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
}

// 세 칸이 프레임 상자 안에서 빈틈없이 맞붙은 한 띠다(세로형은 위에서 아래로, 가로형은 왼쪽에서 오른쪽으로).
function expectBand() {
  const [dst, src, packet] = cellIds.map(nodeBox)
  const vertical = dst.x === src.x
  if (vertical) {
    expect(dst.y + dst.height).toBe(src.y)
    expect(src.y + src.height).toBe(packet.y)
    expect(packet.x).toBe(dst.x)
  } else {
    expect(dst.x + dst.width).toBe(src.x)
    expect(src.x + src.width).toBe(packet.x)
    expect(dst.y).toBe(src.y)
    expect(packet.y).toBe(dst.y)
  }
}

function dstNote() {
  return diagram().querySelector('[data-note="dst-unknown"], [data-note="dst-known"]')!
}

// 요점: ARP 전에는 목적지 MAC 주소 칸의 값이 MAC 주소가 아니고 프레임이 나가지 않는다. ARP 뒤에는 그 칸의 값이
// 본문의 호스트 B MAC 주소이고 프레임이 호스트 A에서 호스트 B로 간다. 두 경우 모두 IP 패킷의 목적지 IP 주소는 같다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const packetNote = () => diagram().querySelector('[data-cell-note="packet-value"]')!.textContent
  expectBand()

  await selectScenario('ARP 전')
  const unknownPacket = packetNote()
  expect(dstNote().textContent).not.toMatch(macPattern)
  const nearestUnknown = cellIds.map(nodeBox).sort((a, b) => distance(a, textBox(dstNote(), 'dst')) - distance(b, textBox(dstNote(), 'dst')))[0]
  expect(nearestUnknown.id).toBe('dst-mac')
  expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
  expect(diagram().querySelector('[data-note="blocked"]')).not.toBeNull()
  expect(diagram().querySelector('[data-node="host-b"]')).toHaveAttribute('opacity', '0.25')
  const unknownBright = brightNodes()

  await selectScenario('ARP 뒤')
  const known = dstNote().textContent!
  expect(known).toMatch(macPattern)
  const nearestKnown = cellIds.map(nodeBox).sort((a, b) => distance(a, textBox(dstNote(), 'dst')) - distance(b, textBox(dstNote(), 'dst')))[0]
  expect(nearestKnown.id).toBe('dst-mac')
  expect(known).not.toBe(diagram().querySelector('[data-cell-note="src-value"]')!.textContent)
  expect(packetNote()).toBe(unknownPacket)
  expect(diagram().querySelector('[data-note="blocked"]')).toBeNull()
  const send = diagram().querySelector('[data-path="send"]')!
  expect(nodeAt(lineEnds(send).start)).toBe('host-a')
  expect(nodeAt(lineEnds(send).end)).toBe('host-b')
  expect(brightNodes()).not.toEqual(unknownBright)

  const ip = unknownPacket!.replace('목적지 IP 주소 ', '')
  const srcMac = diagram().querySelector('[data-cell-note="src-value"]')!.textContent
  expect(body).toContain(`A의 IP 주소는 \`192.0.2.1\`, MAC 주소는 \`${srcMac}\`이고, B의 IP 주소는 \`${ip}\`, MAC 주소는 \`${known}\`다`)
  expect(body).toContain('그래서 목적지 MAC 주소 칸을 채우지 못해 프레임을 보낼 수 없다')
  expect(body).toContain(`그 주소를 목적지 MAC 주소 칸에 넣어 프레임을 보낸다`)
  expect(body).toContain(`IP 패킷에 적힌 목적지 IP 주소 \`${ip}\`는 바뀌지 않는다`)
  expect(body).toContain('IP 주소와 MAC 주소는 길이도 값도 서로 관계가 없어서, IP 주소에서 MAC 주소를 계산해 낼 수 없다')
  expect(body).toContain('받을 장치의 MAC 주소를 적는 목적지 MAC 주소 칸과, 보낸 장치의 MAC 주소를 적는 출발지 MAC 주소 칸이 있다')
}

async function expectUniqueMarkers() {
  render(<><ArpPurposeDiagram /><ArpPurposeDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'ARP 뒤' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(1)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('ArpPurposeDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<ArpPurposeDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표·곁말 없이 칸 값과 선택 안내가 나온다', () => {
    const { container } = render(<ArpPurposeDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node], [data-cell-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expectGroups(tallGroups, 280, 192)
    expectCellNotes(tallCellNotes, 280, 192)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<ArpPurposeDiagram />)
    await expectScenario(scenario, tallArrows, tallNotes, tallCellNotes, tallGroups, 280, 192, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<ArpPurposeDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node], [data-cell-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드가 280×192 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<ArpPurposeDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 192')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
    render(<ArpPurposeDiagram />)
    await expectArrowEnds()
  })

  it('ARP 전에는 목적지 MAC 주소 칸이 비어 프레임이 나가지 않고, ARP 뒤에는 본문의 B MAC 주소가 들어가 프레임이 B로 간다', async () => {
    render(<ArpPurposeDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<ArpPurposeDiagram />)
    const text = visualsByTopicId[topicId].diagrams['arp-purpose']
    const ids = arpPurposeScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual({ ...cellNoteLabels, ...noteLabels })
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([anchorConceptId])
    expect(text.label).toBe(figureName)
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = arpPurposeScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 ARP 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×152 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커·그룹 박스·칸 값을 유지한다', () => {
      render(<ArpPurposeDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 152')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
      expectGroups(wideGroups, 440, 152)
      expectCellNotes(wideCellNotes, 440, 152)
    })

    it('노드·그룹 id 집합과 화살표·곁말 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<ArpPurposeDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 192')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroupIds = shownIds('[data-group]', 'data-group').sort()
      const tallCellNoteIds = shownIds('[data-cell-note]', 'data-cell-note').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')
      const tallNoteIds = await collectIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 152')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroupIds)
      expect(shownIds('[data-cell-note]', 'data-cell-note').sort()).toEqual(tallCellNoteIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(tallNoteIds).toEqual(Object.keys(noteLabels).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
      expect(await collectIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
    })

    it('모든 rect가 440×152 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<ArpPurposeDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<ArpPurposeDiagram />)
      await expectScenario(scenario, wideArrows, wideNotes, wideCellNotes, wideGroups, 440, 152, container)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
      render(<ArpPurposeDiagram />)
      await expectArrowEnds()
    })

    it('ARP 전에는 목적지 MAC 주소 칸이 비어 프레임이 나가지 않고, ARP 뒤에는 본문의 B MAC 주소가 들어가 프레임이 B로 간다', async () => {
      render(<ArpPurposeDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<ArpPurposeDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 192')
      await selectScenario('ARP 뒤')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: 'ARP 뒤' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['send'])
      for (const path of paths) expect(path).toHaveAttribute('d', wideArrows[path.getAttribute('data-path')!])
      expect(diagram().querySelector('[data-note="dst-known"]')).toHaveAttribute('x', String(wideNotes['dst-known'].x))
    })
  })
})
