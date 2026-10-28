import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { BroadcastDomainDiagram, broadcastDomainScenarios } from './BroadcastDomainDiagram'

const topicId = 'hub-switch-vlan'
const anchorConceptId = `${topicId}.broadcast-domain`
const labels = {
  switch: '스위치',
  'host-a': '호스트 A',
  'host-b': '호스트 B',
  'host-c': '호스트 C',
  'host-d': '호스트 D',
  'switch-1': '스위치 1',
  router: '라우터',
  'switch-2': '스위치 2',
  'r-host-a': '호스트 A',
  'r-host-b': '호스트 B',
  'r-host-c': '호스트 C',
  'r-host-d': '호스트 D',
}
const noteLabels = {
  'one-domain': '브로드캐스트 도메인 1개',
  'four-collision': '충돌 도메인 4개',
  stop: '넘기지 않음',
  'two-domains': '브로드캐스트 도메인 2개',
}
type NoteId = keyof typeof noteLabels

const nodeIds = Object.keys(labels)
const topNodeIds = ['switch', 'host-a', 'host-b', 'host-c', 'host-d']
const topLinkIds = ['cable-a', 'cable-b', 'cable-c', 'cable-d']
const bottomLinkIds = ['link-1', 'link-2', 'r-cable-a', 'r-cable-b', 'r-cable-c', 'r-cable-d']
const linkIds = [...topLinkIds, ...bottomLinkIds]

const tallLinks: Record<string, string> = {
  'cable-a': 'M38 40 V72',
  'cable-b': 'M106 40 V72',
  'cable-c': 'M174 40 V72',
  'cable-d': 'M242 40 V72',
  'link-1': 'M122 172 V196',
  'link-2': 'M158 172 V196',
  'r-cable-a': 'M38 228 V256',
  'r-cable-b': 'M106 228 V256',
  'r-cable-c': 'M174 228 V256',
  'r-cable-d': 'M242 228 V256',
}
const wideLinks: Record<string, string> = {
  'cable-a': 'M58 40 V64',
  'cable-b': 'M166 40 V64',
  'cable-c': 'M274 40 V64',
  'cable-d': 'M382 40 V64',
  'link-1': 'M190 148 H162',
  'link-2': 'M250 148 H278',
  'r-cable-a': 'M48 164 V196',
  'r-cable-b': 'M128 164 V196',
  'r-cable-c': 'M312 164 V196',
  'r-cable-d': 'M392 164 V196',
}
const tallArrows: Record<string, string> = {
  'from-a': 'M38 72 V40',
  'to-b': 'M106 40 V72',
  'to-c': 'M174 40 V72',
  'to-d': 'M242 40 V72',
  'r-from-a': 'M38 256 V228',
  'r-to-b': 'M106 228 V256',
  'r-to-router': 'M122 196 V172',
}
const wideArrows: Record<string, string> = {
  'from-a': 'M58 64 V40',
  'to-b': 'M166 40 V64',
  'to-c': 'M274 40 V64',
  'to-d': 'M382 40 V64',
  'r-from-a': 'M48 196 V164',
  'r-to-b': 'M128 164 V196',
  'r-to-router': 'M162 148 H190',
}
// 케이블·링크와 화살표마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'cable-a': ['switch', 'host-a'],
  'cable-b': ['switch', 'host-b'],
  'cable-c': ['switch', 'host-c'],
  'cable-d': ['switch', 'host-d'],
  'link-1': ['router', 'switch-1'],
  'link-2': ['router', 'switch-2'],
  'r-cable-a': ['switch-1', 'r-host-a'],
  'r-cable-b': ['switch-1', 'r-host-b'],
  'r-cable-c': ['switch-2', 'r-host-c'],
  'r-cable-d': ['switch-2', 'r-host-d'],
  'from-a': ['host-a', 'switch'],
  'to-b': ['switch', 'host-b'],
  'to-c': ['switch', 'host-c'],
  'to-d': ['switch', 'host-d'],
  'r-from-a': ['r-host-a', 'switch-1'],
  'r-to-b': ['switch-1', 'r-host-b'],
  'r-to-router': ['switch-1', 'router'],
}

type Note = { x: number, y: number, anchor: 'start' | 'middle' }
const tallNotes: Record<NoteId, Note> = {
  'one-domain': { x: 140, y: 124, anchor: 'middle' },
  'four-collision': { x: 140, y: 124, anchor: 'middle' },
  stop: { x: 176, y: 160, anchor: 'start' },
  'two-domains': { x: 140, y: 310, anchor: 'middle' },
}
const wideNotes: Record<NoteId, Note> = {
  'one-domain': { x: 220, y: 116, anchor: 'middle' },
  'four-collision': { x: 220, y: 116, anchor: 'middle' },
  stop: { x: 220, y: 182, anchor: 'middle' },
  'two-domains': { x: 220, y: 252, anchor: 'middle' },
}
type Box = { x: number, y: number, width: number, height: number }
const tallGroups: Record<string, Box> = {
  'bc-one': { x: 4, y: 2, width: 272, height: 108 },
  'cd-a': { x: 6, y: 46, width: 64, height: 62 },
  'cd-b': { x: 74, y: 46, width: 64, height: 62 },
  'cd-c': { x: 142, y: 46, width: 64, height: 62 },
  'cd-d': { x: 210, y: 46, width: 64, height: 62 },
  'domain-1': { x: 4, y: 188, width: 134, height: 106 },
  'domain-2': { x: 142, y: 188, width: 134, height: 106 },
}
const wideGroups: Record<string, Box> = {
  'bc-one': { x: 6, y: 2, width: 428, height: 100 },
  'cd-a': { x: 8, y: 44, width: 100, height: 56 },
  'cd-b': { x: 116, y: 44, width: 100, height: 56 },
  'cd-c': { x: 224, y: 44, width: 100, height: 56 },
  'cd-d': { x: 332, y: 44, width: 100, height: 56 },
  'domain-1': { x: 8, y: 126, width: 160, height: 108 },
  'domain-2': { x: 272, y: 126, width: 160, height: 108 },
}

const question = '브로드캐스트는 어디까지 퍼질까?'
const idleCaption = '위에는 호스트 A~D를 스위치 한 대의 포트에 하나씩 이었고, 아래에는 호스트 A·B를 이은 스위치 1과 호스트 C·D를 이은 스위치 2를 라우터로 이었다. 버튼을 고르면 호스트 A가 보낸 브로드캐스트 프레임이 어디까지 닿는지, 그리고 같은 스위치에서 충돌 도메인은 어떻게 나뉘는지 볼 수 있다.'
const legend = '가는 선은 케이블, 화살표는 브로드캐스트 프레임이 가는 길이다. 얇은 선 박스 하나가 도메인 하나다.'
const figureName = '브로드캐스트 프레임이 닿는 범위를 보이는 도식'
const expectedScenarios = [
  {
    id: 'switch', label: '스위치 안에서',
    nodes: [...topNodeIds, ...topLinkIds],
    paths: ['from-a', 'to-b', 'to-c', 'to-d'],
    notes: ['one-domain'] as NoteId[],
    groups: ['bc-one'],
    caption: '스위치는 호스트 A가 보낸 브로드캐스트 프레임을 들어온 포트를 뺀 모든 포트로 플러딩한다. 그래서 B·C·D가 모두 그 프레임을 받고, 한 스위치에 이은 호스트 전체가 브로드캐스트 도메인 하나를 이룬다.',
    sources: [anchorConceptId],
  },
  {
    id: 'collision', label: '충돌 도메인과 견주면',
    nodes: [...topNodeIds, ...topLinkIds],
    paths: [],
    notes: ['four-collision'] as NoteId[],
    groups: ['cd-a', 'cd-b', 'cd-c', 'cd-d'],
    caption: '같은 스위치에서 충돌 도메인은 포트마다 하나씩 넷으로 나뉜다. 한 포트의 신호가 다른 포트로 그대로 흘러가지 않기 때문이다. 하지만 브로드캐스트 프레임은 스위치가 모든 포트로 내보내므로, 브로드캐스트 도메인은 여전히 하나다.',
    sources: [anchorConceptId, `${topicId}.collision-domain`],
  },
  {
    id: 'router', label: '라우터에서',
    nodes: ['switch-1', 'router', 'r-host-a', 'r-host-b', 'link-1', 'r-cable-a', 'r-cable-b'],
    paths: ['r-from-a', 'r-to-b', 'r-to-router'],
    notes: ['stop', 'two-domains'] as NoteId[],
    groups: ['domain-1', 'domain-2'],
    caption: '스위치 1은 A의 브로드캐스트 프레임을 B와 라우터 쪽으로 플러딩한다. 라우터는 브로드캐스트로 받은 데이터를 다른 네트워크로 넘기지 않으므로, 그 프레임은 스위치 2 쪽의 C와 D에게 가지 않는다. 라우터 양쪽으로 브로드캐스트 도메인이 둘 생긴다.',
    sources: [anchorConceptId],
  },
]

function diagram() {
  return screen.getByRole('img', { name: '위에는 호스트 A~D를 스위치 한 대에 하나씩 이은 모습, 아래에는 호스트 A·B를 이은 스위치 1과 호스트 C·D를 이은 스위치 2를 라우터로 이은 모습이 있고, 호스트 A가 보낸 브로드캐스트 프레임이 어디까지 닿는지 보이는 모습' })
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
  return { id: text.getAttribute('data-note')!, x: left, y: y - 9, width, height: 9 }
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

// 보이는 곁말이 지정한 id·글·자리이고, viewBox 안에서 노드·선과 겹치지 않으며 그룹 박스의 변에 걸치지 않는다.
function expectNotes(ids: NoteId[], places: Record<NoteId, Note>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note')).sort()).toEqual([...ids].sort())
  const groups = Array.from(diagram().querySelectorAll('[data-group]'), readBox)
  for (const note of shown) {
    const id = note.getAttribute('data-note')! as NoteId
    const box = textBox(note)
    expect(note.textContent).toBe(noteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', places[id].anchor)
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note.closest('[opacity]')).toBeNull()
    expect(box.x, id).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, id).toBeLessThanOrEqual(width)
    expect(box.y, id).toBeGreaterThanOrEqual(0)
    expect(box.y + box.height, id).toBeLessThanOrEqual(height)
    for (const node of nodeIds.map(nodeBox)) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const line of diagram().querySelectorAll('[data-link], [data-path]')) {
      for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), `${id} ↔ 선`).toBe(false)
    }
    for (const group of groups) expect(contains(group, box) || !overlaps(group, box), `${id} ↔ ${group.id}`).toBe(true)
  }
}

// 보이는 그룹 박스가 지정한 id·자리이고, 흐려지지 않으며 서로 겹치지 않는다. 노드는 박스 안에 통째로 들거나 박스 밖에 있다.
function expectGroups(ids: string[], places: Record<string, Box>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-group]'))
  expect(shown.map((group) => group.getAttribute('data-group'))).toEqual(ids)
  const boxes = shown.map(readBox)
  expect(boxesOutsideViewBox(boxes, [0, 0, width, height])).toEqual([])
  for (const group of shown) {
    const id = group.getAttribute('data-group')!
    expect(readBox(group)).toEqual({ id, ...places[id] })
    expect(group).toHaveClass('fill-none', 'stroke-disabled')
    expect(group.closest('[opacity]')).toBeNull()
    for (const node of nodeIds.map(nodeBox)) expect(contains(readBox(group), node) || !overlaps(readBox(group), node), `${id} ↔ ${node.id}`).toBe(true)
  }
  for (let i = 0; i < boxes.length; i += 1) {
    for (let j = i + 1; j < boxes.length; j += 1) expect(overlaps(boxes[i], boxes[j]), `${boxes[i].id} ↔ ${boxes[j].id}`).toBe(false)
  }
  expect(diagram().querySelectorAll('[data-group-label]')).toHaveLength(0)
}

// 그룹 박스 하나에 통째로 든 노드들.
function nodesIn(groupId: string) {
  const group = readBox(diagram().querySelector(`[data-group="${groupId}"]`)!)
  return nodeIds.filter((id) => contains(group, nodeBox(id)))
}

// 아래 단언들은 배치에 묶이지 않는다. 세로형과 가로형이 같은 기대값으로 통과해야 한다.
async function expectScenario(
  scenario: typeof expectedScenarios[number],
  arrows: Record<string, string>,
  places: Record<NoteId, Note>,
  groups: Record<string, Box>,
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
  expectGroups(scenario.groups, groups, width, height)
  expectNotes(scenario.notes, places, width, height)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 노드 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
  expect(diagram().querySelectorAll('rect')).toHaveLength(nodeIds.length)

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

// 케이블·링크 열은 늘 보이고 회색이며 두 노드를 잇는다. 노드는 모두 회색이고 도식 전용 두 색·초록·빨강·주황은 쓰지 않는다.
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

// 곁말 글의 수가 보이는 박스 수와 같다.
function countIn(note: string) {
  return Number(/(\d+)개/u.exec(diagram().querySelector(`[data-note="${note}"]`)!.textContent!)![1])
}

// 요점: 스위치 안에서는 A의 브로드캐스트가 A를 뺀 같은 스위치의 모든 호스트에게 가고 박스 하나가 스위치와 호스트 전체를 두른다.
// 같은 스위치의 충돌 도메인은 호스트마다 하나씩 넷이다. 라우터에서는 프레임이 라우터까지만 가고 라우터 너머로 가는 길이 없으며,
// 박스 둘이 라우터 양쪽을 나눠 두르고 라우터는 어느 박스에도 들지 않는다. 그 말들은 개념 본문에 있다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')

  await selectScenario('스위치 안에서')
  expect(hops().filter(([, to]) => to === 'switch')).toEqual([['host-a', 'switch']])
  const outbound = hops().filter(([from]) => from === 'switch').map(([, to]) => to).sort()
  expect(outbound).toEqual(['host-b', 'host-c', 'host-d'])
  expect(nodesIn('bc-one')).toEqual(topNodeIds)
  expect(countIn('one-domain')).toBe(diagram().querySelectorAll('[data-group]').length)

  await selectScenario('충돌 도메인과 견주면')
  expect(hops()).toEqual([])
  const collisionGroups = shownIds('[data-group]', 'data-group')
  expect(collisionGroups.map(nodesIn)).toEqual([['host-a'], ['host-b'], ['host-c'], ['host-d']])
  expect(countIn('four-collision')).toBe(collisionGroups.length)

  await selectScenario('라우터에서')
  const routerHops = hops()
  expect(routerHops.filter(([, to]) => to === 'switch-1')).toEqual([['r-host-a', 'switch-1']])
  expect(routerHops.filter(([from]) => from === 'switch-1').map(([, to]) => to).sort()).toEqual(['r-host-b', 'router'])
  expect(routerHops.filter(([from]) => from === 'router')).toEqual([])
  expect(routerHops.some(([, to]) => ['switch-2', 'r-host-c', 'r-host-d'].includes(to))).toBe(false)
  for (const id of ['switch-2', 'r-host-c', 'r-host-d']) expect(diagram().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', '0.25')
  expect(nodesIn('domain-1')).toEqual(['switch-1', 'r-host-a', 'r-host-b'])
  expect(nodesIn('domain-2')).toEqual(['switch-2', 'r-host-c', 'r-host-d'])
  expect(countIn('two-domains')).toBe(diagram().querySelectorAll('[data-group]').length)
  const stop = textBox(diagram().querySelector('[data-note="stop"]')!)
  const router = nodeBox('router')
  const gapX = Math.max(0, stop.x - (router.x + router.width), router.x - (stop.x + stop.width))
  const gapY = Math.max(0, stop.y - (router.y + router.height), router.y - (stop.y + stop.height))
  expect(Math.max(gapX, gapY), '넘기지 않음은 라우터 바로 곁').toBeLessThanOrEqual(12)

  expect(body).toContain('스위치는 브로드캐스트 프레임을 들어온 포트를 뺀 모든 포트로 플러딩하므로, 한 스위치에 이은 장치 전체가 브로드캐스트 도메인 하나를 이룬다')
  expect(body).toContain('한 네트워크에서 브로드캐스트로 받은 데이터를 다른 네트워크로 넘기지 않는다')
  expect(body).toContain('라우터 양쪽으로 브로드캐스트 도메인이 둘 생긴다')
  expect(body).toContain('충돌 도메인은 포트마다 하나씩 넷이고, 브로드캐스트 도메인은 하나다')
}

async function expectUniqueMarkers() {
  render(<><BroadcastDomainDiagram /><BroadcastDomainDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '스위치 안에서' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(4)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('BroadcastDomainDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<BroadcastDomainDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 케이블·링크가 모두 선명하고 화살표·박스·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<BroadcastDomainDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note], [data-group]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·박스·곁말만 보인다', async (scenario) => {
    const { container } = render(<BroadcastDomainDiagram />)
    await expectScenario(scenario, tallArrows, tallNotes, tallGroups, 280, 316, container)
  })

  it('시나리오를 바꾸면 이전 화살표·박스·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<BroadcastDomainDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
      expect(shownIds('[data-group]', 'data-group')).toEqual(scenario.groups)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note], [data-group]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드가 280×316 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<BroadcastDomainDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 316')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 316])
  })

  it('케이블과 링크는 늘 보이고 회색이며 두 노드의 변에서 시작하고 끝난다', () => {
    render(<BroadcastDomainDiagram />)
    expectLinks(tallLinks)
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<BroadcastDomainDiagram />)
    await expectArrowEnds()
  })

  it('브로드캐스트는 스위치의 모든 호스트에게 가고 라우터에서 멈추며, 같은 스위치의 충돌 도메인은 넷이다', async () => {
    render(<BroadcastDomainDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<BroadcastDomainDiagram />)
    const text = visualsByTopicId[topicId].diagrams['broadcast-domain']
    const ids = broadcastDomainScenarios.map(({ id }) => id).sort()
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
    expect(text.label).toBe(figureName)
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = broadcastDomainScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 브로드캐스트 도메인 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×260 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<BroadcastDomainDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 260')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·케이블 id 집합과 화살표·박스 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<BroadcastDomainDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 316')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallLinkIds = shownIds('[data-link]', 'data-link').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')
      const tallGroupIds = await collectIds('[data-group]', 'data-group')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 260')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinkIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(tallGroupIds).toEqual(Object.keys(tallGroups).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
      expect(await collectIds('[data-group]', 'data-group')).toEqual(tallGroupIds)
    })

    it('모든 rect가 440×260 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<BroadcastDomainDiagram />)
      expectFits([0, 0, 440, 260])
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·박스·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<BroadcastDomainDiagram />)
      await expectScenario(scenario, wideArrows, wideNotes, wideGroups, 440, 260, container)
    })

    it('케이블과 링크는 늘 보이고 회색이며 두 노드의 변에서 시작하고 끝난다', () => {
      render(<BroadcastDomainDiagram />)
      expectLinks(wideLinks)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<BroadcastDomainDiagram />)
      await expectArrowEnds()
    })

    it('브로드캐스트는 스위치의 모든 호스트에게 가고 라우터에서 멈추며, 같은 스위치의 충돌 도메인은 넷이다', async () => {
      render(<BroadcastDomainDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<BroadcastDomainDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 316')
      await selectScenario('라우터에서')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '라우터에서' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['r-from-a', 'r-to-b', 'r-to-router'])
      for (const path of paths) expect(path).toHaveAttribute('d', wideArrows[path.getAttribute('data-path')!])
      expect(diagram().querySelector('[data-note="stop"]')).toHaveAttribute('x', String(wideNotes.stop.x))
      expect(readBox(diagram().querySelector('[data-group="domain-2"]')!)).toEqual({ id: 'domain-2', ...wideGroups['domain-2'] })
    })
  })
})
