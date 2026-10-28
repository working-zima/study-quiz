import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { VlanSplitDiagram, vlanSplitScenarios } from './VlanSplitDiagram'

const topicId = 'hub-switch-vlan'
const anchorConceptId = `${topicId}.vlan`
const labels = {
  switch: '스위치',
  'host-a': '호스트 A',
  'host-b': '호스트 B',
  'host-c': '호스트 C',
  'host-d': '호스트 D',
}
const groupLabels = { 'vlan-1': 'VLAN 1', 'vlan-2': 'VLAN 2' }
const deptLabels = { dev: '개발부', admin: '총무부' }
const noteLabels = {
  'one-domain': '브로드캐스트 도메인 1개',
  'two-domains': '브로드캐스트 도메인 2개',
}
type NoteId = keyof typeof noteLabels
type DeptId = keyof typeof deptLabels
type GroupId = keyof typeof groupLabels

const nodeIds = Object.keys(labels)
const hostIds = ['host-a', 'host-b', 'host-c', 'host-d']
const linkIds = ['cable-a', 'cable-b', 'cable-c', 'cable-d']
const deptIds = Object.keys(deptLabels) as DeptId[]

const tallLinks: Record<string, string> = {
  'cable-a': 'M38 96 V56',
  'cable-b': 'M106 96 V56',
  'cable-c': 'M174 96 V56',
  'cable-d': 'M242 96 V56',
}
const wideLinks: Record<string, string> = {
  'cable-a': 'M58 96 V56',
  'cable-b': 'M166 96 V56',
  'cable-c': 'M274 96 V56',
  'cable-d': 'M382 96 V56',
}
const tallArrows: Record<string, string> = {
  'from-a': 'M38 56 V96',
  'to-b': 'M106 96 V56',
  'to-c': 'M174 96 V56',
  'to-d': 'M242 96 V56',
}
const wideArrows: Record<string, string> = {
  'from-a': 'M58 56 V96',
  'to-b': 'M166 96 V56',
  'to-c': 'M274 96 V56',
  'to-d': 'M382 96 V56',
}
// 케이블과 화살표마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'cable-a': ['switch', 'host-a'],
  'cable-b': ['switch', 'host-b'],
  'cable-c': ['switch', 'host-c'],
  'cable-d': ['switch', 'host-d'],
  'from-a': ['host-a', 'switch'],
  'to-b': ['switch', 'host-b'],
  'to-c': ['switch', 'host-c'],
  'to-d': ['switch', 'host-d'],
}

type Point = { x: number, y: number }
type Box = { x: number, y: number, width: number, height: number }
const tallNotes: Record<NoteId, Point> = {
  'one-domain': { x: 140, y: 148 },
  'two-domains': { x: 140, y: 148 },
}
const wideNotes: Record<NoteId, Point> = {
  'one-domain': { x: 220, y: 148 },
  'two-domains': { x: 220, y: 148 },
}
const tallDepts: Record<DeptId, Point> = {
  dev: { x: 72, y: 72 },
  admin: { x: 208, y: 72 },
}
const wideDepts: Record<DeptId, Point> = {
  dev: { x: 112, y: 72 },
  admin: { x: 328, y: 72 },
}
const tallGroups: Record<GroupId, Box & { label: Point }> = {
  'vlan-1': { x: 4, y: 4, width: 134, height: 76, label: { x: 14, y: 18 } },
  'vlan-2': { x: 142, y: 4, width: 134, height: 76, label: { x: 152, y: 18 } },
}
const wideGroups: Record<GroupId, Box & { label: Point }> = {
  'vlan-1': { x: 8, y: 4, width: 206, height: 76, label: { x: 18, y: 18 } },
  'vlan-2': { x: 226, y: 4, width: 206, height: 76, label: { x: 236, y: 18 } },
}

const question = '스위치 하나를 부서별 LAN 둘로 나눌 수 있을까?'
const idleCaption = '개발부의 호스트 A·B와 총무부의 호스트 C·D가 스위치 한 대의 포트 1~4에 이어져 있다. 버튼을 고르면 개발부의 A가 보낸 브로드캐스트 프레임이 VLAN으로 나누기 전과 나눈 뒤에 어디까지 가는지 볼 수 있다.'
const legend = '가는 선은 케이블, 화살표는 브로드캐스트 프레임이 가는 길이다. 얇은 선 박스 하나가 VLAN 하나다.'
const figureName = 'VLAN으로 브로드캐스트 도메인을 나누는 도식'
const expectedScenarios = [
  {
    id: 'no-vlan', label: '나누기 전',
    nodes: ['switch', ...hostIds, ...linkIds],
    paths: ['from-a', 'to-b', 'to-c', 'to-d'],
    notes: ['one-domain'] as NoteId[],
    groups: [] as GroupId[],
    caption: 'VLAN으로 나누지 않으면 네 호스트가 브로드캐스트 도메인 하나에 있다. 스위치가 A의 브로드캐스트 프레임을 포트 2·3·4로 플러딩하므로, 개발부의 공지가 총무부의 C와 D에게까지 간다.',
  },
  {
    id: 'vlan', label: 'VLAN으로 나누면',
    nodes: ['switch', 'host-a', 'host-b', 'cable-a', 'cable-b'],
    paths: ['from-a', 'to-b'],
    notes: ['two-domains'] as NoteId[],
    groups: ['vlan-1', 'vlan-2'] as GroupId[],
    caption: 'A·B를 VLAN 1에, C·D를 VLAN 2에 넣으면 스위치는 A의 브로드캐스트 프레임을 VLAN 1에 든 포트 2로만 내보낸다. 공지는 B만 받고, 브로드캐스트 도메인이 VLAN마다 하나씩 둘로 나뉜다.',
  },
]

function diagram() {
  return screen.getByRole('img', { name: '개발부의 호스트 A·B와 총무부의 호스트 C·D가 스위치 한 대에 이어져 있고, 호스트 A가 보낸 브로드캐스트 프레임이 VLAN으로 나누기 전과 뒤에 어디까지 가는지 보이는 모습' })
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
  const id = text.getAttribute('data-note') ?? text.getAttribute('data-dept') ?? text.getAttribute('data-group-label')!
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
function nodeAt(point: Point) {
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

// 글이 viewBox 안에 있고, 노드·선과 겹치거나 닿지 않으며, 보이는 그룹 박스의 변에 걸치지 않는다.
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
  for (const group of diagram().querySelectorAll('[data-group]')) {
    expect(contains(readBox(group), box) || !overlaps(readBox(group), box), `${box.id} ↔ ${group.getAttribute('data-group')}`).toBe(true)
  }
}

// 부서 곁말은 늘 보이고 흐려지지 않는다.
function expectDepts(places: Record<DeptId, Point>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-dept]'))
  expect(shown.map((dept) => dept.getAttribute('data-dept'))).toEqual(deptIds)
  for (const dept of shown) {
    const id = dept.getAttribute('data-dept')! as DeptId
    expect(dept.textContent).toBe(deptLabels[id])
    expect(dept).toHaveAttribute('x', String(places[id].x))
    expect(dept).toHaveAttribute('y', String(places[id].y))
    expect(dept).toHaveAttribute('text-anchor', 'middle')
    expect(dept).toHaveAttribute('font-size', '9')
    expect(dept).toHaveClass('fill-muted')
    expect(dept.closest('[opacity]')).toBeNull()
    expectClearText(dept, width, height)
  }
}

// 보이는 곁말이 지정한 id·글·자리이고, 다른 글과 겹치지 않는다.
function expectNotes(ids: NoteId[], places: Record<NoteId, Point>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note'))).toEqual(ids)
  const others = Array.from(diagram().querySelectorAll('[data-dept], [data-group-label]'), textBox)
  for (const note of shown) {
    const id = note.getAttribute('data-note')! as NoteId
    expect(note.textContent).toBe(noteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', 'middle')
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note.closest('[opacity]')).toBeNull()
    expectClearText(note, width, height)
    for (const other of others) expect(overlaps(textBox(note), other), `${id} ↔ ${other.id}`).toBe(false)
  }
}

// 보이는 VLAN 박스가 지정한 id·자리이고, 흐려지지 않으며 서로 겹치지 않는다. 라벨은 자기 박스 왼쪽 위 안에 있고 어떤 선도 라벨을 지나지 않는다.
function expectGroups(ids: GroupId[], places: Record<GroupId, Box & { label: Point }>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-group]'))
  expect(shown.map((group) => group.getAttribute('data-group'))).toEqual(ids)
  expect(shownIds('[data-group-label]', 'data-group-label')).toEqual(ids)
  const boxes = shown.map(readBox)
  expect(boxesOutsideViewBox(boxes, [0, 0, width, height])).toEqual([])
  for (const group of shown) {
    const id = group.getAttribute('data-group')! as GroupId
    const { label, ...box } = places[id]
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
    expect(text.closest('[opacity]')).toBeNull()
    expect(contains(readBox(group), textBox(text)), `${id} 라벨이 박스 안`).toBe(true)
    expectClearText(text, width, height)
  }
  for (let i = 0; i < boxes.length; i += 1) {
    for (let j = i + 1; j < boxes.length; j += 1) expect(overlaps(boxes[i], boxes[j]), `${boxes[i].id} ↔ ${boxes[j].id}`).toBe(false)
  }
}

// 아래 단언들은 배치에 묶이지 않는다. 세로형과 가로형이 같은 기대값으로 통과해야 한다.
async function expectScenario(
  scenario: typeof expectedScenarios[number],
  layout: { arrows: Record<string, string>, notes: Record<NoteId, Point>, depts: Record<DeptId, Point>, groups: Record<GroupId, Box & { label: Point }> },
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
    expect(path).toHaveAttribute('d', layout.arrows[path.getAttribute('data-path')!])
    expect(path).toHaveAttribute('stroke-width', '2')
    expect(path).toHaveAttribute('marker-end', `url(#${diagram().querySelector('marker')!.id})`)
    expect(path).toHaveClass('stroke-title')
    expect(path.closest('[opacity]')).toBeNull()
  }
  expectGroups(scenario.groups, layout.groups, width, height)
  expectDepts(layout.depts, width, height)
  expectNotes(scenario.notes, layout.notes, width, height)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 노드 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])

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

// 케이블 넷은 늘 보이고 회색이며 스위치와 호스트를 잇는다. 노드는 모두 회색이고 도식 전용 두 색·초록·빨강·주황은 쓰지 않는다.
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

async function expectArrowEnds() {
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    for (const path of diagram().querySelectorAll('[data-path]')) expectLine(path, path.getAttribute('data-path')!)
  }
}

function hops() {
  return Array.from(diagram().querySelectorAll('[data-path]'), (path) => [nodeAt(lineEnds(path).start)!, nodeAt(lineEnds(path).end)!])
}

function countIn(note: NoteId) {
  return Number(/(\d+)개/u.exec(diagram().querySelector(`[data-note="${note}"]`)!.textContent!)![1])
}

// 요점: 나누기 전에는 A의 브로드캐스트가 A를 뺀 세 호스트 모두에게 간다. VLAN으로 나누면 같은 VLAN 박스 안의 호스트에게만 가고,
// 두 VLAN 박스는 겹치지 않고 저마다 같은 부서의 호스트만 담는다. 개수 곁말은 브로드캐스트 도메인 수와 같고, 그 말들은 개념 본문에 있다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const dev = textBox(diagram().querySelector('[data-dept="dev"]')!)
  const admin = textBox(diagram().querySelector('[data-dept="admin"]')!)
  const center = (id: string) => nodeBox(id).x + nodeBox(id).width / 2
  expect(dev.x).toBeGreaterThan(center('host-a'))
  expect(dev.x + dev.width).toBeLessThan(center('host-b'))
  expect(admin.x).toBeGreaterThan(center('host-c'))
  expect(admin.x + admin.width).toBeLessThan(center('host-d'))

  await selectScenario('나누기 전')
  expect(hops().filter(([, to]) => to === 'switch')).toEqual([['host-a', 'switch']])
  expect(hops().filter(([from]) => from === 'switch').map(([, to]) => to).sort()).toEqual(['host-b', 'host-c', 'host-d'])
  expect(countIn('one-domain')).toBe(1)

  await selectScenario('VLAN으로 나누면')
  const inGroup = (group: GroupId) => nodeIds.filter((id) => contains(groupBox(group), nodeBox(id)))
  expect(inGroup('vlan-1')).toEqual(['host-a', 'host-b'])
  expect(inGroup('vlan-2')).toEqual(['host-c', 'host-d'])
  expect(contains(groupBox('vlan-1'), dev)).toBe(true)
  expect(contains(groupBox('vlan-2'), admin)).toBe(true)
  expect(hops().filter(([, to]) => to === 'switch')).toEqual([['host-a', 'switch']])
  const outbound = hops().filter(([from]) => from === 'switch').map(([, to]) => to)
  expect(outbound).toEqual(['host-b'])
  for (const host of outbound) expect(inGroup('vlan-1')).toContain(host)
  for (const host of inGroup('vlan-2')) expect(diagram().querySelector(`[data-node="${host}"]`), host).toHaveAttribute('opacity', '0.25')
  expect(countIn('two-domains')).toBe(diagram().querySelectorAll('[data-group]').length)

  expect(body).toContain('총무부의 C와 D도 그 공지를 받는다')
  expect(body).toContain('개발부의 A·B를 VLAN 1에, 총무부의 C·D를 VLAN 2에 넣으면')
  expect(body).toContain('A가 보낸 브로드캐스트 프레임은 VLAN 1에 든 포트 2로만 플러딩되어 B만 받고')
  expect(body).toContain('VLAN 하나가 브로드캐스트 도메인 하나가 되므로')
}

async function expectUniqueMarkers() {
  render(<><VlanSplitDiagram /><VlanSplitDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '나누기 전' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(4)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('VlanSplitDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<VlanSplitDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드·케이블·부서 곁말이 모두 선명하고 화살표·박스·개수 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<VlanSplitDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
    expect(shownIds('[data-dept]', 'data-dept')).toEqual(deptIds)
    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note], [data-group], [data-group-label]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·박스·곁말만 보인다', async (scenario) => {
    const { container } = render(<VlanSplitDiagram />)
    await expectScenario(scenario, { arrows: tallArrows, notes: tallNotes, depts: tallDepts, groups: tallGroups }, 280, 156, container)
  })

  it('시나리오를 바꾸면 이전 화살표·박스·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<VlanSplitDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
      expect(shownIds('[data-group]', 'data-group')).toEqual(scenario.groups)
      expect(shownIds('[data-note]', 'data-note')).toEqual(scenario.notes)
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note], [data-group], [data-group-label]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드가 280×156 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<VlanSplitDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 156')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 156])
  })

  it('케이블은 늘 보이고 회색이며, 부서 곁말은 자기 부서 호스트 사이에 늘 보인다', () => {
    render(<VlanSplitDiagram />)
    expectLinks(tallLinks)
    expectDepts(tallDepts, 280, 156)
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<VlanSplitDiagram />)
    await expectArrowEnds()
  })

  it('VLAN으로 나누면 개발부 A의 브로드캐스트가 같은 VLAN의 B에게만 간다', async () => {
    render(<VlanSplitDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<VlanSplitDiagram />)
    const text = visualsByTopicId[topicId].diagrams['vlan-split']
    const ids = vlanSplitScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual({ ...deptLabels, ...noteLabels })
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([anchorConceptId])
    expect(text.label).toBe(figureName)
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = vlanSplitScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 VLAN 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×156 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<VlanSplitDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 156')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·케이블·부서 곁말 id 집합과 화살표·박스 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<VlanSplitDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 156')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallLinkIds = shownIds('[data-link]', 'data-link').sort()
      const tallDeptIds = shownIds('[data-dept]', 'data-dept').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')
      const tallGroupIds = await collectIds('[data-group]', 'data-group')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 156')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinkIds)
      expect(shownIds('[data-dept]', 'data-dept').sort()).toEqual(tallDeptIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(tallGroupIds).toEqual(Object.keys(tallGroups).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
      expect(await collectIds('[data-group]', 'data-group')).toEqual(tallGroupIds)
    })

    it('모든 rect가 440×156 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<VlanSplitDiagram />)
      expectFits([0, 0, 440, 156])
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·박스·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<VlanSplitDiagram />)
      await expectScenario(scenario, { arrows: wideArrows, notes: wideNotes, depts: wideDepts, groups: wideGroups }, 440, 156, container)
    })

    it('케이블은 늘 보이고 회색이며, 부서 곁말은 자기 부서 호스트 사이에 늘 보인다', () => {
      render(<VlanSplitDiagram />)
      expectLinks(wideLinks)
      expectDepts(wideDepts, 440, 156)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<VlanSplitDiagram />)
      await expectArrowEnds()
    })

    it('VLAN으로 나누면 개발부 A의 브로드캐스트가 같은 VLAN의 B에게만 간다', async () => {
      render(<VlanSplitDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<VlanSplitDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 156')
      await selectScenario('VLAN으로 나누면')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: 'VLAN으로 나누면' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['from-a', 'to-b'])
      for (const path of paths) expect(path).toHaveAttribute('d', wideArrows[path.getAttribute('data-path')!])
      expect(diagram().querySelector('[data-group-label="vlan-2"]')).toHaveAttribute('x', String(wideGroups['vlan-2'].label.x))
    })
  })
})
