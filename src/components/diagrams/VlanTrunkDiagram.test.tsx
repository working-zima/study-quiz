import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { VlanTrunkDiagram, vlanTrunkScenarios } from './VlanTrunkDiagram'

const topicId = 'hub-switch-vlan'
const anchorConceptId = `${topicId}.vlan-tagging`
const labels = {
  'host-a': '호스트 A',
  'host-c': '호스트 C',
  'switch-1': '스위치 1',
  'switch-2': '스위치 2',
  'host-b': '호스트 B',
  'host-d': '호스트 D',
  destination: '목적지 MAC 주소',
  source: '출발지 MAC 주소',
  tag: 'VLAN 태그',
  'type-length': '이더타입/길이',
  data: '데이터',
  fcs: 'FCS',
}
const groupLabels = {
  'vlan-1-sw1': 'VLAN 1',
  'vlan-2-sw1': 'VLAN 2',
  'vlan-1-sw2': 'VLAN 1',
  'vlan-2-sw2': 'VLAN 2',
  frame: '트렁크로 오가는 프레임',
}
const noteLabels = { 'trunk-name': '트렁크 링크', 'tag-vlan-1': 'VLAN 1', 'tag-vlan-2': 'VLAN 2' }
type NodeId = keyof typeof labels
type GroupId = keyof typeof groupLabels
type NoteId = keyof typeof noteLabels

const nodeIds = Object.keys(labels) as NodeId[]
const groupIds = Object.keys(groupLabels) as GroupId[]
const hostIds = ['host-a', 'host-c', 'host-b', 'host-d']
const frameCells = ['destination', 'source', 'tag', 'type-length', 'data', 'fcs']
const linkIds = ['cable-a', 'cable-c', 'trunk-link', 'cable-b', 'cable-d']
// 케이블·링크와 화살표마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'cable-a': ['switch-1', 'host-a'],
  'cable-c': ['switch-1', 'host-c'],
  'trunk-link': ['switch-1', 'switch-2'],
  'cable-b': ['switch-2', 'host-b'],
  'cable-d': ['switch-2', 'host-d'],
  'from-a': ['host-a', 'switch-1'],
  'from-c': ['host-c', 'switch-1'],
  trunk: ['switch-1', 'switch-2'],
  'to-b': ['switch-2', 'host-b'],
  'to-d': ['switch-2', 'host-d'],
}

type Point = { x: number, y: number }
type Box = { x: number, y: number, width: number, height: number }
type Layout = {
  viewBox: [number, number, number, number]
  links: Record<string, string>
  arrows: Record<string, string>
  groups: Record<GroupId, Box & { label: Point }>
  notes: Record<NoteId, Point & { anchor: string }>
  axis: 'y' | 'x'
}

const tall: Layout = {
  viewBox: [0, 0, 280, 284],
  links: {
    'cable-a': 'M36 84 V56',
    'cable-c': 'M104 84 V56',
    'trunk-link': 'M70 116 V164',
    'cable-b': 'M36 196 V224',
    'cable-d': 'M104 196 V224',
  },
  arrows: {
    'from-a': 'M36 56 V84',
    'from-c': 'M104 56 V84',
    trunk: 'M70 116 V164',
    'to-b': 'M36 196 V224',
    'to-d': 'M104 196 V224',
  },
  groups: {
    'vlan-1-sw1': { x: 4, y: 4, width: 64, height: 60, label: { x: 10, y: 17 } },
    'vlan-2-sw1': { x: 72, y: 4, width: 64, height: 60, label: { x: 78, y: 17 } },
    'vlan-1-sw2': { x: 4, y: 216, width: 64, height: 60, label: { x: 10, y: 270 } },
    'vlan-2-sw2': { x: 72, y: 216, width: 64, height: 60, label: { x: 78, y: 270 } },
    frame: { x: 140, y: 52, width: 136, height: 224, label: { x: 146, y: 66 } },
  },
  notes: {
    'trunk-name': { x: 76, y: 144, anchor: 'start' },
    // 태그 칸 오른쪽(238)과 프레임 박스 오른쪽(276) 사이 가운데. 320px Chrome 실측 폭(약 33)으로도 양쪽에 틈이 남는다.
    'tag-vlan-1': { x: 257, y: 160, anchor: 'middle' },
    'tag-vlan-2': { x: 257, y: 160, anchor: 'middle' },
  },
  axis: 'y',
}
const wide: Layout = {
  viewBox: [0, 0, 440, 228],
  links: {
    'cable-a': 'M124 66 H112 V40 H88',
    'cable-c': 'M124 82 H112 V108 H88',
    'trunk-link': 'M196 74 H244',
    'cable-b': 'M316 66 H328 V40 H348',
    'cable-d': 'M316 82 H328 V108 H348',
  },
  arrows: {
    'from-a': 'M88 40 H112 V66 H124',
    'from-c': 'M88 108 H112 V82 H124',
    trunk: 'M196 74 H244',
    'to-b': 'M316 66 H328 V40 H348',
    'to-d': 'M316 82 H328 V108 H348',
  },
  groups: {
    'vlan-1-sw1': { x: 8, y: 4, width: 96, height: 60, label: { x: 14, y: 17 } },
    'vlan-2-sw1': { x: 8, y: 72, width: 96, height: 60, label: { x: 14, y: 85 } },
    'vlan-1-sw2': { x: 336, y: 4, width: 96, height: 60, label: { x: 342, y: 17 } },
    'vlan-2-sw2': { x: 336, y: 72, width: 96, height: 60, label: { x: 342, y: 85 } },
    frame: { x: 8, y: 148, width: 424, height: 72, label: { x: 14, y: 162 } },
  },
  notes: {
    'trunk-name': { x: 220, y: 50, anchor: 'middle' },
    'tag-vlan-1': { x: 231, y: 214, anchor: 'middle' },
    'tag-vlan-2': { x: 231, y: 214, anchor: 'middle' },
  },
  axis: 'x',
}

const question = '스위치 사이 링크 하나로 VLAN 여럿을 어떻게 나를까?'
const idleCaption = '스위치 1에는 개발부의 호스트 A(VLAN 1)와 총무부의 호스트 C(VLAN 2)가, 스위치 2에는 개발부의 호스트 B(VLAN 1)와 총무부의 호스트 D(VLAN 2)가 이어져 있고, 두 스위치는 트렁크 링크 하나로 이어져 있다. 버튼을 고르면 VLAN마다 프레임이 어디로 가는지와, 트렁크를 지나는 프레임의 태그에 무엇이 적히는지 볼 수 있다.'
const legend = '가는 선은 케이블과 링크, 화살표는 프레임이 가는 길이다. 「VLAN 1」·「VLAN 2」 박스는 그 안의 호스트가 든 VLAN이다. 「트렁크로 오가는 프레임」 박스는 태그를 끼운 프레임에 든 것을 앞에서부터 차례로 보이고, 칸 크기는 바이트 수와 상관없다.'
const figureName = 'VLAN 태그를 끼워 트렁크로 프레임을 나르는 도식'
const svgName = '개발부의 호스트 A·B와 총무부의 호스트 C·D가 두 스위치에 나뉘어 있고, 두 스위치를 잇는 트렁크 링크로 VLAN 태그를 끼운 프레임이 오가는 모습'
const expectedScenarios = [
  {
    id: 'vlan-1', label: 'VLAN 1 프레임',
    nodes: ['host-a', 'switch-1', 'switch-2', 'host-b', 'cable-a', 'trunk-link', 'cable-b', ...frameCells],
    paths: ['from-a', 'trunk', 'to-b'],
    notes: ['tag-vlan-1'] as NoteId[],
    caption: '개발부의 A가 보낸 프레임은 스위치 1에서 VLAN 1의 프레임으로 다뤄진다. 스위치 1은 트렁크로 내보낼 때 VLAN 1을 적은 태그를 끼우고, 스위치 2는 그 태그를 읽어 VLAN 1에 든 포트로만 내보내 층이 다른 B에게 닿게 한다.',
  },
  {
    id: 'vlan-2', label: 'VLAN 2 프레임',
    nodes: ['host-c', 'switch-1', 'switch-2', 'host-d', 'cable-c', 'trunk-link', 'cable-d', ...frameCells],
    paths: ['from-c', 'trunk', 'to-d'],
    notes: ['tag-vlan-2'] as NoteId[],
    caption: '총무부의 C가 보낸 프레임도 같은 트렁크 링크를 지나지만, 태그에는 VLAN 2가 적힌다. 스위치 2는 이 태그를 보고 VLAN 2에 든 포트로만 내보내므로, 프레임은 D에게 닿고 B에게는 가지 않는다.',
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

// 선의 양 끝이 지정한 두 노드의 변에 닿고, 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다.
function expectLine(line: Element, id: string) {
  for (const segment of segments(line.getAttribute('d')!)) {
    for (const node of nodeIds.map(nodeBox)) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const label of diagram().querySelectorAll('[data-group-label]')) expect(touches(segment, textBox(label)), `${id} ↔ 라벨`).toBe(false)
  }
  const { start, end } = lineEnds(line)
  expect(nodeAt(start), `${id} 시작`).toBe(ends[id][0])
  expect(nodeAt(end), `${id} 끝`).toBe(ends[id][1])
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

// 보이는 곁말이 지정한 id·글·자리이고, 그룹 라벨과 겹치지 않는다. 트렁크 링크 곁말은 늘 보인다.
function expectNotes(ids: NoteId[], layout: Layout) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note'))).toEqual(ids)
  for (const note of shown) {
    const id = note.getAttribute('data-note')! as NoteId
    expect(note.textContent).toBe(noteLabels[id])
    expect(note).toHaveAttribute('x', String(layout.notes[id].x))
    expect(note).toHaveAttribute('y', String(layout.notes[id].y))
    expect(note).toHaveAttribute('text-anchor', layout.notes[id].anchor)
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note.closest('[opacity]')).toBeNull()
    expectClearText(note, layout)
    for (const label of diagram().querySelectorAll('[data-group-label]')) expect(overlaps(textBox(note), textBox(label)), `${id} ↔ 라벨`).toBe(false)
  }
}

// 그룹 박스는 늘 다섯이고 흐려지지 않으며 서로 겹치지 않는다. 라벨은 자기 박스 안에 있다.
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
    expectLine(path, path.getAttribute('data-path')!)
  }
  expectGroups(layout)
  expectNotes(['trunk-name', ...scenario.notes], layout)
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

// 케이블과 트렁크 링크는 늘 보이고 회색이다. 노드는 모두 회색이고 도식 전용 두 색·초록·빨강·주황은 쓰지 않는다.
function expectLinks(layout: Layout) {
  const shown = Array.from(diagram().querySelectorAll('[data-link]'))
  expect(shown.map((link) => link.getAttribute('data-link'))).toEqual(linkIds)
  for (const link of shown) {
    const id = link.getAttribute('data-link')!
    expect(link).toHaveAttribute('d', layout.links[id])
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

// 호스트가 든 VLAN 박스. 스위치는 어느 VLAN 박스에도 들지 않는다.
function vlanGroupOf(id: string) {
  return groupIds.filter((group) => group !== 'frame' && contains(groupBox(group), nodeBox(id)))
}

// 요점: 두 시나리오가 같은 트렁크 링크(같은 경로)를 지나고, 트렁크를 지나는 프레임의 태그 곁말이 서로 다르다.
// 프레임이 떠나는 호스트와 닿는 호스트는 두 스위치에 나뉘어 있지만 같은 이름의 VLAN 박스에 들고, 그 이름이 태그 곁말이다.
// 프레임 칸은 본문이 적은 차례대로 빈틈없이 이어지고, 태그는 출발지 MAC 주소 바로 뒤에 낀다.
async function expectPoint(layout: Layout) {
  const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
  const body = concept.paragraphs.join('\n')

  const boxes = frameCells.map(nodeBox)
  for (let i = 1; i < boxes.length; i += 1) {
    if (layout.axis === 'y') {
      expect(boxes[i].x).toBe(boxes[0].x)
      expect(boxes[i].width).toBe(boxes[0].width)
      expect(boxes[i].y).toBe(boxes[i - 1].y + boxes[i - 1].height)
    } else {
      expect(boxes[i].y).toBe(boxes[0].y)
      expect(boxes[i].x).toBe(boxes[i - 1].x + boxes[i - 1].width)
    }
  }
  for (const cell of frameCells) expect(contains(groupBox('frame'), nodeBox(cell)), cell).toBe(true)
  expect(body).toContain(`${frameCells.map((cell) => labels[cell as NodeId]).join(', ')} 차례가 되고`)
  expect(frameCells.indexOf('tag')).toBe(frameCells.indexOf('source') + 1)
  expect(body).toContain('태그는 출발지 MAC 주소 바로 뒤, 이더타입/길이 바로 앞에 낀다')

  for (const host of hostIds) expect(vlanGroupOf(host), host).toHaveLength(1)
  for (const id of ['switch-1', 'switch-2']) expect(vlanGroupOf(id), id).toEqual([])

  const trunkPaths: string[] = []
  const tags: string[] = []
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    const paths = Array.from(diagram().querySelectorAll('[data-path]'))
    const hops = paths.map((path) => [nodeAt(lineEnds(path).start)!, nodeAt(lineEnds(path).end)!])
    expect(hops[1]).toEqual(['switch-1', 'switch-2'])
    expect(hops[0][1]).toBe('switch-1')
    expect(hops[2][0]).toBe('switch-2')
    trunkPaths.push(paths[1].getAttribute('d')!)
    const tag = diagram().querySelector('[data-note^="tag-"]')!
    tags.push(tag.textContent!)
    const start = vlanGroupOf(hops[0][0])[0]
    const end = vlanGroupOf(hops[2][1])[0]
    expect(start).not.toBe(end)
    expect(groupLabels[start]).toBe(tag.textContent)
    expect(groupLabels[end]).toBe(tag.textContent)
    // 태그 곁말은 태그 칸 곁에 있고, 다른 VLAN 박스의 호스트는 흐리다.
    const tagBox = nodeBox('tag')
    const note = textBox(tag)
    if (layout.axis === 'y') {
      expect(note.x).toBeGreaterThanOrEqual(tagBox.x + tagBox.width)
      expect(note.y).toBeGreaterThanOrEqual(tagBox.y)
      expect(note.y + note.height).toBeLessThanOrEqual(tagBox.y + tagBox.height)
    } else {
      expect(note.y).toBeGreaterThanOrEqual(tagBox.y + tagBox.height)
      expect(note.x).toBeGreaterThanOrEqual(tagBox.x)
      expect(note.x + note.width).toBeLessThanOrEqual(tagBox.x + tagBox.width)
    }
    for (const host of hostIds.filter((id) => groupLabels[vlanGroupOf(id)[0]] !== tag.textContent)) {
      expect(diagram().querySelector(`[data-node="${host}"]`), host).toHaveAttribute('opacity', '0.25')
    }
  }
  expect(new Set(trunkPaths).size).toBe(1)
  expect(new Set(tags).size).toBe(2)

  expect(body).toContain('스위치 2는 링크로 받은 프레임의 태그에서 VLAN ID를 읽어 그 프레임의 VLAN을 안다')
  expect(body).toContain('트렁크 링크(trunk link)')
  expect(body).toContain('트렁크로 내보낼 때 VLAN 1을 적은 태그를 끼운다')
}

async function expectUniqueMarkers() {
  render(<><VlanTrunkDiagram /><VlanTrunkDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'VLAN 1 프레임' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(3)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('VlanTrunkDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<VlanTrunkDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드·케이블·트렁크 링크·박스가 모두 선명하고 화살표와 태그 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<VlanTrunkDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
    expect(shownIds('[data-group]', 'data-group')).toEqual(groupIds)
    expect(shownIds('[data-note]', 'data-note')).toEqual(['trunk-name'])
    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 선명하다', async (scenario) => {
    const { container } = render(<VlanTrunkDiagram />)
    await expectScenario(scenario, tall, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<VlanTrunkDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
      expect(shownIds('[data-note]', 'data-note')).toEqual(['trunk-name', ...scenario.notes])
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(shownIds('[data-note]', 'data-note')).toEqual(['trunk-name'])
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드가 280×284 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<VlanTrunkDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 284')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tall)
  })

  it('케이블·트렁크 링크·박스·트렁크 링크 곁말이 제자리에 있고 회색이다', () => {
    render(<VlanTrunkDiagram />)
    expectLinks(tall)
    expectGroups(tall)
    expectNotes(['trunk-name'], tall)
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<VlanTrunkDiagram />)
    await expectArrowEnds()
  })

  it('두 VLAN의 프레임이 같은 트렁크를 지나고, 태그에 적힌 VLAN이 같은 VLAN 박스의 호스트로 프레임을 보낸다', async () => {
    render(<VlanTrunkDiagram />)
    await expectPoint(tall)
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<VlanTrunkDiagram />)
    const text = visualsByTopicId[topicId].diagrams['vlan-trunk']
    const ids = vlanTrunkScenarios.map(({ id }) => id).sort()
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
    expect(text.svgLabel).toBe(svgName)
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = vlanTrunkScenarios.find(({ id }) => id === expected.id)!
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
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.join('').replace(/\*\*|`/gu, ''))
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

    it('440×228 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<VlanTrunkDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 228')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·케이블·박스 id 집합과 화살표·곁말 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<VlanTrunkDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 284')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallLinkIds = shownIds('[data-link]', 'data-link').sort()
      const tallGroupIds = shownIds('[data-group]', 'data-group').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')
      const tallNoteIds = await collectIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 228')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinkIds)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroupIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tall.arrows).sort())
      expect(tallNoteIds).toEqual(Object.keys(noteLabels).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
      expect(await collectIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
    })

    it('모든 rect가 440×228 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<VlanTrunkDiagram />)
      expectFits(wide)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<VlanTrunkDiagram />)
      await expectScenario(scenario, wide, container)
    })

    it('케이블·트렁크 링크·박스·트렁크 링크 곁말이 제자리에 있고 회색이다', () => {
      render(<VlanTrunkDiagram />)
      expectLinks(wide)
      expectGroups(wide)
      expectNotes(['trunk-name'], wide)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<VlanTrunkDiagram />)
      await expectArrowEnds()
    })

    it('두 VLAN의 프레임이 같은 트렁크를 지나고, 태그에 적힌 VLAN이 같은 VLAN 박스의 호스트로 프레임을 보낸다', async () => {
      render(<VlanTrunkDiagram />)
      await expectPoint(wide)
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<VlanTrunkDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 284')
      await selectScenario('VLAN 2 프레임')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: 'VLAN 2 프레임' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['from-c', 'trunk', 'to-d'])
      for (const path of paths) expect(path).toHaveAttribute('d', wide.arrows[path.getAttribute('data-path')!])
      expect(diagram().querySelector('[data-note="tag-vlan-2"]')).toHaveAttribute('x', String(wide.notes['tag-vlan-2'].x))
    })
  })
})
