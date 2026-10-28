import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { VlanMembershipDiagram, vlanMembershipScenarios } from './VlanMembershipDiagram'

const topicId = 'hub-switch-vlan'
const anchorConceptId = `${topicId}.vlan-membership`
const labels = {
  'host-a': '호스트 A',
  'port-1': '포트 1',
  'port-2': '포트 2',
  'port-3': '포트 3',
  'port-4': '포트 4',
  'row-port-1': '포트 1 · VLAN 1',
  'row-port-2': '포트 2 · VLAN 1',
  'row-port-3': '포트 3 · VLAN 2',
  'row-port-4': '포트 4 · VLAN 2',
  'row-mac-a': '00-00-5E-00-53-01 · VLAN 1',
}
const groupLabels = {
  switch: '스위치',
  'port-table': '포트 기반 VLAN의 표',
  'mac-table': 'MAC 주소 기반 VLAN의 표',
}
const fixedNoteLabels = { 'mac-a': '00-00-5E-00-53-01', moved: '포트 1에서 옮겨 꽂음' }
const noteLabels = { 'in-vlan-2': 'VLAN 2가 됨', 'in-vlan-1': 'VLAN 1 그대로' }
type NodeId = keyof typeof labels
type GroupId = keyof typeof groupLabels
type FixedNoteId = keyof typeof fixedNoteLabels
type NoteId = keyof typeof noteLabels

const nodeIds = Object.keys(labels) as NodeId[]
const groupIds = Object.keys(groupLabels) as GroupId[]
const fixedNoteIds = Object.keys(fixedNoteLabels) as FixedNoteId[]
const portIds = ['port-1', 'port-2', 'port-3', 'port-4']
const linkIds = ['cable-a']

type Point = { x: number, y: number }
type Box = { x: number, y: number, width: number, height: number }
type Layout = {
  viewBox: [number, number, number, number]
  links: Record<string, string>
  arrows: Record<string, string>
  groups: Record<GroupId, Box & { label: Point }>
  fixedNotes: Record<FixedNoteId, Point & { anchor: string }>
  notes: Record<NoteId, Point>
}

const tall: Layout = {
  viewBox: [0, 0, 280, 316],
  links: { 'cable-a': 'M174 96 V56' },
  arrows: { 'from-a': 'M174 56 V96' },
  groups: {
    switch: { x: 4, y: 72, width: 272, height: 64, label: { x: 14, y: 86 } },
    'port-table': { x: 4, y: 148, width: 272, height: 92, label: { x: 14, y: 162 } },
    'mac-table': { x: 4, y: 248, width: 272, height: 60, label: { x: 14, y: 262 } },
  },
  fixedNotes: {
    'mac-a': { x: 174, y: 16, anchor: 'middle' },
    moved: { x: 140, y: 44, anchor: 'end' },
  },
  notes: { 'in-vlan-2': { x: 208, y: 44 }, 'in-vlan-1': { x: 208, y: 44 } },
}
const wide: Layout = {
  viewBox: [0, 0, 440, 248],
  links: { 'cable-a': 'M270 96 V56' },
  arrows: { 'from-a': 'M270 56 V96' },
  groups: {
    switch: { x: 8, y: 72, width: 424, height: 64, label: { x: 18, y: 86 } },
    'port-table': { x: 8, y: 148, width: 216, height: 92, label: { x: 18, y: 162 } },
    'mac-table': { x: 232, y: 148, width: 200, height: 92, label: { x: 242, y: 162 } },
  },
  fixedNotes: {
    'mac-a': { x: 270, y: 16, anchor: 'middle' },
    moved: { x: 220, y: 44, anchor: 'end' },
  },
  notes: { 'in-vlan-2': { x: 320, y: 44 }, 'in-vlan-1': { x: 320, y: 44 } },
}

// 줄이 어느 표에 드는가.
const rowTable: Record<string, GroupId> = {
  'row-port-1': 'port-table', 'row-port-2': 'port-table', 'row-port-3': 'port-table', 'row-port-4': 'port-table',
  'row-mac-a': 'mac-table',
}

const question = '장치를 다른 포트에 꽂으면 VLAN이 바뀔까?'
const idleCaption = 'MAC 주소가 00-00-5E-00-53-01인 호스트 A가 포트 1에 꽂혀 VLAN 1에 들어 있다가, 비어 있던 포트 3으로 옮겨 꽂혔다. 아래의 두 표는 두 방식이 VLAN을 정할 때 보는 표다. 버튼을 고르면 스위치가 포트로 VLAN을 정할 때와 MAC 주소로 정할 때 A가 어느 VLAN에 드는지 볼 수 있다.'
const legend = '가는 선은 케이블, 화살표는 A가 보낸 프레임이 들어오는 길이다. 두 표 박스는 두 방식의 표이고 한 칸이 항목 하나다. 스위치는 둘 가운데 한 방식을 쓰고, 흐린 칸은 그 방식에서 보지 않는 항목이다.'
const figureName = '포트 기반 VLAN과 MAC 주소 기반 VLAN을 견주는 도식'
const svgName = 'MAC 주소가 00-00-5E-00-53-01인 호스트 A를 스위치의 포트 1에서 포트 3으로 옮겨 꽂았을 때, 스위치가 VLAN을 정하는 방식에 따라 A가 어느 VLAN에 드는지 보이는 모습'
const expectedScenarios = [
  {
    id: 'port-based', label: '포트 기반',
    nodes: ['host-a', 'port-3', 'cable-a', 'row-port-3'],
    paths: ['from-a'],
    notes: ['in-vlan-2'] as NoteId[],
    caption: '스위치가 포트마다 VLAN을 정해 두었다. 포트 3은 VLAN 2이므로 옮겨 꽂은 A가 보낸 프레임은 VLAN 2의 프레임으로 다뤄지고, A는 VLAN 2가 된다. 어떤 장치든 그 포트에 꽂으면 그 포트의 VLAN에 든다.',
  },
  {
    id: 'mac-based', label: 'MAC 주소 기반',
    nodes: ['host-a', 'port-3', 'cable-a', 'row-mac-a'],
    paths: ['from-a'],
    notes: ['in-vlan-1'] as NoteId[],
    caption: '스위치가 MAC 주소마다 VLAN을 정해 두었다. 표에서 00-00-5E-00-53-01은 VLAN 1이므로, A는 포트 3에 꽂아도 VLAN 1 그대로다. 장치가 어느 포트에 꽂혔는지는 따지지 않는다.',
  },
]

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

// 글자가 차지하는 상자. 높이는 글자 크기 9를 기준선 위로 잡는다.
function textBox(text: Element): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9)
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  const id = text.getAttribute('data-note') ?? text.getAttribute('data-group-label')!
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

function onEdge(x: number, y: number, box: SvgBox) {
  const insideX = x >= box.x && x <= box.x + box.width
  const insideY = y >= box.y && y <= box.y + box.height
  return ((x === box.x || x === box.x + box.width) && insideY) || ((y === box.y || y === box.y + box.height) && insideX)
}

function lineEnds(element: Element) {
  const list = segments(element.getAttribute('d')!)
  return { start: { x: list[0].x1, y: list[0].y1 }, end: { x: list[list.length - 1].x2, y: list[list.length - 1].y2 } }
}

function nodeAt(point: Point) {
  return nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))
}

// 케이블과 화살표는 호스트 A와 포트 3을 잇고, 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다.
function expectLine(line: Element, from: string, to: string) {
  const id = line.getAttribute('data-link') ?? line.getAttribute('data-path')!
  for (const segment of segments(line.getAttribute('d')!)) {
    for (const node of nodeIds.map(nodeBox)) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const label of diagram().querySelectorAll('[data-group-label]')) expect(touches(segment, textBox(label)), `${id} ↔ 라벨`).toBe(false)
  }
  const { start, end } = lineEnds(line)
  expect(nodeAt(start), `${id} 시작`).toBe(from)
  expect(nodeAt(end), `${id} 끝`).toBe(to)
}

// 글이 viewBox 안에 있고, 노드·선과 겹치거나 닿지 않으며, 그룹 박스의 변에 걸치지 않는다.
function expectClearText(text: Element, layout: Layout) {
  const box = textBox(text)
  const [, , width, height] = layout.viewBox
  expect(box.x, box.id).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width, box.id).toBeLessThanOrEqual(width)
  expect(box.y, box.id).toBeGreaterThanOrEqual(0)
  expect(box.y + box.height, box.id).toBeLessThanOrEqual(height)
  for (const node of nodeIds.map(nodeBox)) expect(overlaps(box, node), `${box.id} ↔ ${node.id}`).toBe(false)
  for (const line of diagram().querySelectorAll('[data-link], [data-path]')) {
    for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
  }
  for (const group of diagram().querySelectorAll('[data-group]')) {
    expect(contains(readBox(group), box) || !overlaps(readBox(group), box), `${box.id} ↔ ${group.getAttribute('data-group')}`).toBe(true)
  }
}

// 늘 보이는 곁말(A의 MAC 주소, 옮겨 꽂음)은 흐려지지 않는다.
function expectFixedNotes(layout: Layout) {
  const shown = fixedNoteIds.map((id) => diagram().querySelector(`[data-note="${id}"]`)!)
  for (const [index, note] of shown.entries()) {
    const id = fixedNoteIds[index]
    expect(note, id).not.toBeNull()
    expect(note.textContent).toBe(fixedNoteLabels[id])
    expect(note).toHaveAttribute('x', String(layout.fixedNotes[id].x))
    expect(note).toHaveAttribute('y', String(layout.fixedNotes[id].y))
    expect(note).toHaveAttribute('text-anchor', layout.fixedNotes[id].anchor)
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note.closest('[opacity]')).toBeNull()
    expectClearText(note, layout)
  }
}

function scenarioNoteIds() {
  return shownIds('[data-note]', 'data-note').filter((id) => !fixedNoteIds.includes(id as FixedNoteId))
}

// 그룹 박스는 늘 셋이고 흐려지지 않으며 서로 겹치지 않는다. 라벨은 자기 박스 왼쪽 위 안에 있다.
function expectGroups(layout: Layout) {
  const shown = Array.from(diagram().querySelectorAll('[data-group]'))
  expect(shown.map((group) => group.getAttribute('data-group'))).toEqual(groupIds)
  expect(shownIds('[data-group-label]', 'data-group-label')).toEqual(groupIds)
  const boxes = shown.map(readBox)
  expect(boxesOutsideViewBox(boxes, layout.viewBox)).toEqual([])
  for (const group of shown) {
    const id = group.getAttribute('data-group')! as GroupId
    const { label, ...box } = layout.groups[id]
    expect(readBox(group)).toEqual({ id, ...box })
    expect(group).toHaveClass('fill-none', 'stroke-disabled')
    expect(group.closest('[opacity]')).toBeNull()
    for (const node of nodeIds.map(nodeBox)) expect(contains(readBox(group), node) || !overlaps(readBox(group), node), `${id} ↔ ${node.id}`).toBe(true)
    const text = diagram().querySelector(`[data-group-label="${id}"]`)!
    expect(text.textContent).toBe(groupLabels[id])
    expect(text).toHaveAttribute('x', String(label.x))
    expect(text).toHaveAttribute('y', String(label.y))
    expect(text).toHaveAttribute('font-size', '9')
    expect(text).toHaveClass('fill-muted')
    expect(contains(readBox(group), textBox(text)), `${id} 라벨이 박스 안`).toBe(true)
    expectClearText(text, layout)
  }
  for (let i = 0; i < boxes.length; i += 1) {
    for (let j = i + 1; j < boxes.length; j += 1) expect(overlaps(boxes[i], boxes[j]), `${boxes[i].id} ↔ ${boxes[j].id}`).toBe(false)
  }
  // 포트는 스위치 박스 안에, 줄은 자기 표 박스 안에 있고 호스트 A는 어느 박스에도 들지 않는다.
  for (const id of portIds) expect(contains(groupBox('switch'), nodeBox(id)), id).toBe(true)
  for (const [row, table] of Object.entries(rowTable)) expect(contains(groupBox(table), nodeBox(row)), row).toBe(true)
  for (const group of groupIds) expect(overlaps(groupBox(group), nodeBox('host-a')), group).toBe(false)
}

async function expectScenario(scenario: typeof expectedScenarios[number], layout: Layout, container: HTMLElement) {
  await selectScenario(scenario.label)

  for (const element of diagram().querySelectorAll('[data-node], [data-link]')) {
    const id = element.getAttribute('data-node') ?? element.getAttribute('data-link')!
    expect(element, id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  const shownPaths = Array.from(diagram().querySelectorAll('[data-path]'))
  expect(shownPaths.map((path) => path.getAttribute('data-path'))).toEqual(scenario.paths)
  for (const path of shownPaths) {
    expect(path).toHaveAttribute('d', layout.arrows[path.getAttribute('data-path')!])
    expect(path).toHaveAttribute('stroke-width', '2')
    expect(path).toHaveAttribute('marker-end', `url(#${diagram().querySelector('marker')!.id})`)
    expect(path).toHaveClass('stroke-title')
    expect(path.closest('[opacity]')).toBeNull()
    expectLine(path, 'host-a', 'port-3')
  }
  expect(scenarioNoteIds()).toEqual(scenario.notes)
  for (const id of scenario.notes) {
    const note = diagram().querySelector(`[data-note="${id}"]`)!
    expect(note.textContent).toBe(noteLabels[id])
    expect(note).toHaveAttribute('x', String(layout.notes[id].x))
    expect(note).toHaveAttribute('y', String(layout.notes[id].y))
    expect(note).toHaveAttribute('text-anchor', 'start')
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note.closest('[opacity]')).toBeNull()
    expectClearText(note, layout)
    for (const other of diagram().querySelectorAll('[data-group-label]')) expect(overlaps(textBox(note), textBox(other))).toBe(false)
    for (const other of fixedNoteIds) expect(overlaps(textBox(note), textBox(diagram().querySelector(`[data-note="${other}"]`)!))).toBe(false)
  }
  expectGroups(layout)
  expectFixedNotes(layout)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 노드 rect와 그룹 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다.
function expectFits(layout: Layout) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
  expect(boxesOutsideViewBox(boxes, layout.viewBox)).toEqual([])
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

// 케이블은 늘 보이고 회색이며 호스트 A와 포트 3을 잇는다. 노드는 모두 회색이고 도식 전용 두 색·초록·빨강·주황은 쓰지 않는다.
function expectLinks(layout: Layout) {
  const shown = Array.from(diagram().querySelectorAll('[data-link]'))
  expect(shown.map((link) => link.getAttribute('data-link'))).toEqual(linkIds)
  for (const link of shown) {
    expect(link).toHaveAttribute('d', layout.links[link.getAttribute('data-link')!])
    expect(link).toHaveClass('fill-none', 'stroke-muted')
    expect(link).toHaveAttribute('stroke-width', '1.5')
    expect(link).not.toHaveAttribute('marker-end')
    expectLine(link, 'port-3', 'host-a')
  }
  for (const id of nodeIds) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

function vlanOf(text: string) {
  return Number(/VLAN (\d)/u.exec(text)![1])
}

function clearRows() {
  return Object.keys(rowTable).filter((row) => diagram().querySelector(`[data-node="${row}"]`)!.getAttribute('opacity') === '1')
}

// 요점: 두 방식 모두 A가 꽂힌 포트(화살표 끝)는 포트 3으로 같다. 그런데 A의 VLAN 곁말은 다르다 — 포트 기반은 포트 표의 포트 3 칸을 따라 VLAN 2,
// MAC 주소 기반은 MAC 표의 A 주소 칸을 따라 옮기기 전과 같은 VLAN 1이다. 시나리오마다 선명한 칸이 든 표가 다르다. 그 말들은 개념 본문에 있다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const macNote = diagram().querySelector('[data-note="mac-a"]')!
  const center = nodeBox('host-a').x + nodeBox('host-a').width / 2
  expect(Number(macNote.getAttribute('x'))).toBe(center)
  expect(Number(macNote.getAttribute('y'))).toBeLessThan(nodeBox('host-a').y)

  const result: Record<string, { port: string, vlan: number, table: GroupId }> = {}
  for (const { label, id } of expectedScenarios) {
    await selectScenario(label)
    const path = diagram().querySelector('[data-path]')!
    const port = nodeAt(lineEnds(path).end)!
    const rows = clearRows()
    expect(rows).toHaveLength(1)
    const row = labels[rows[0] as NodeId]
    const vlan = vlanOf(diagram().querySelector('[data-note^="in-vlan"]')!.textContent!)
    expect(vlanOf(row), `${id} 칸과 곁말의 VLAN`).toBe(vlan)
    result[id] = { port, vlan, table: rowTable[rows[0]] }
    if (id === 'port-based') expect(row.startsWith(`${labels[port as NodeId]} · `)).toBe(true)
    if (id === 'mac-based') expect(row.startsWith(`${macNote.textContent} · `)).toBe(true)
  }
  expect(result['port-based'].port).toBe('port-3')
  expect(result['mac-based'].port).toBe('port-3')
  expect(result['port-based'].vlan).not.toBe(result['mac-based'].vlan)
  expect(result['mac-based'].vlan).toBe(1)
  expect(result['port-based'].table).not.toBe(result['mac-based'].table)

  expect(body).toContain('포트 1에 꽂혀 VLAN 1에 들어 있던 A를 비어 있던 포트 3으로 옮겨 꽂았다고 하자')
  expect(body).toContain('포트 1·2를 VLAN 1에, 포트 3·4를 VLAN 2에 정해 두었다면')
  expect(body).toContain('A는 포트 3의 VLAN인 VLAN 2가 된다')
  expect(body).toContain('표에 00-00-5E-00-53-01을 VLAN 1로 적어 두었다면, A는 포트 3에 꽂아도 VLAN 1 그대로다')
}

async function expectUniqueMarkers() {
  render(<><VlanMembershipDiagram /><VlanMembershipDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '포트 기반' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(1)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('VlanMembershipDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<VlanMembershipDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드·케이블·두 표·늘 보이는 곁말이 모두 선명하고 화살표와 VLAN 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<VlanMembershipDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
    expect(shownIds('[data-group]', 'data-group')).toEqual(groupIds)
    expect(shownIds('[data-note]', 'data-note')).toEqual(fixedNoteIds)
    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 선명하다', async (scenario) => {
    const { container } = render(<VlanMembershipDiagram />)
    await expectScenario(scenario, tall, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<VlanMembershipDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
      expect(scenarioNoteIds()).toEqual(scenario.notes)
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(shownIds('[data-note]', 'data-note')).toEqual(fixedNoteIds)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드가 280×316 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<VlanMembershipDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 316')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tall)
  })

  it('케이블·그룹 박스·늘 보이는 곁말이 제자리에 있고 회색이다', () => {
    render(<VlanMembershipDiagram />)
    expectLinks(tall)
    expectGroups(tall)
    expectFixedNotes(tall)
  })

  it('A는 포트 1에서 포트 3으로 옮겨 꽂혔는데, 포트 기반이면 VLAN 2가 되고 MAC 주소 기반이면 VLAN 1 그대로다', async () => {
    render(<VlanMembershipDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<VlanMembershipDiagram />)
    const text = visualsByTopicId[topicId].diagrams['vlan-membership']
    const ids = vlanMembershipScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual({ ...fixedNoteLabels, ...noteLabels })
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([anchorConceptId])
    expect(text.label).toBe(figureName)
    expect(text.svgLabel).toBe(svgName)
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = vlanMembershipScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
          const event = Object.assign(new Event('change'), { matches: nextMatches, media: mediaQuery.media })
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

    it('440×248 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<VlanMembershipDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 248')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·케이블·그룹·곁말 id 집합과 화살표 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<VlanMembershipDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 316')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallLinkIds = shownIds('[data-link]', 'data-link').sort()
      const tallGroupIds = shownIds('[data-group]', 'data-group').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')
      const tallNoteIds = await collectIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 248')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinkIds)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroupIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tall.arrows).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
      expect(await collectIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
    })

    it('모든 rect가 440×248 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<VlanMembershipDiagram />)
      expectFits(wide)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<VlanMembershipDiagram />)
      await expectScenario(scenario, wide, container)
    })

    it('케이블·그룹 박스·늘 보이는 곁말이 제자리에 있고 회색이다', () => {
      render(<VlanMembershipDiagram />)
      expectLinks(wide)
      expectGroups(wide)
      expectFixedNotes(wide)
    })

    it('A는 포트 1에서 포트 3으로 옮겨 꽂혔는데, 포트 기반이면 VLAN 2가 되고 MAC 주소 기반이면 VLAN 1 그대로다', async () => {
      render(<VlanMembershipDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<VlanMembershipDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 316')
      await selectScenario('MAC 주소 기반')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: 'MAC 주소 기반' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(diagram().querySelector('[data-path]')).toHaveAttribute('d', wide.arrows['from-a'])
      expect(diagram().querySelector('[data-note="in-vlan-1"]')).toHaveAttribute('x', String(wide.notes['in-vlan-1'].x))
      expect(diagram().querySelector('[data-node="row-mac-a"]')).toHaveAttribute('opacity', '1')
    })
  })
})
