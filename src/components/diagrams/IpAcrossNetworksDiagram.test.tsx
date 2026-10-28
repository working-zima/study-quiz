import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { IpAcrossNetworksDiagram, ipAcrossNetworksScenarios } from './IpAcrossNetworksDiagram'

const topicId = 'ip-protocol'
const anchorConceptId = `${topicId}.ip`
const labels = {
  'host-a': '호스트 A',
  'router-1': '라우터 1',
  'router-2': '라우터 2',
  'host-b': '호스트 B',
}
const groupLabels = { 'lan-1': 'LAN 1', 'lan-2': 'LAN 2' }
const noteLabels = {
  'lan-note': 'MAC 주소로 라우터 1까지',
  'e2e-note': 'IP 주소로 호스트 B까지',
}
type NoteId = keyof typeof noteLabels

const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const linkIds = ['cable-a', 'router-link', 'cable-b']

const tallLinks: Record<string, string> = {
  'cable-a': 'M112 56 H168',
  'router-link': 'M216 72 V152',
  'cable-b': 'M168 168 H112',
}
const wideLinks: Record<string, string> = {
  'cable-a': 'M80 48 H100',
  'router-link': 'M164 48 H276',
  'cable-b': 'M340 48 H360',
}
const tallArrows: Record<string, string> = {
  'hop-1': 'M112 56 H168',
  'hop-2': 'M216 72 V152',
  'hop-3': 'M168 168 H112',
}
const wideArrows: Record<string, string> = {
  'hop-1': 'M80 48 H100',
  'hop-2': 'M164 48 H276',
  'hop-3': 'M340 48 H360',
}
// 연결과 화살표마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'cable-a': ['host-a', 'router-1'],
  'router-link': ['router-1', 'router-2'],
  'cable-b': ['router-2', 'host-b'],
  'hop-1': ['host-a', 'router-1'],
  'hop-2': ['router-1', 'router-2'],
  'hop-3': ['router-2', 'host-b'],
}

type Note = { x: number, y: number, anchor: 'start' | 'middle' }
const tallNotes: Record<NoteId, Note> = {
  'lan-note': { x: 16, y: 108, anchor: 'start' },
  'e2e-note': { x: 16, y: 108, anchor: 'start' },
}
const wideNotes: Record<NoteId, Note> = {
  'lan-note': { x: 16, y: 96, anchor: 'start' },
  'e2e-note': { x: 220, y: 96, anchor: 'middle' },
}
type Box = { x: number, y: number, width: number, height: number }
const tallGroups: Record<string, Box> = {
  'lan-1': { x: 4, y: 8, width: 272, height: 80 },
  'lan-2': { x: 4, y: 120, width: 272, height: 80 },
}
const wideGroups: Record<string, Box> = {
  'lan-1': { x: 4, y: 8, width: 172, height: 72 },
  'lan-2': { x: 264, y: 8, width: 172, height: 72 },
}
// 노드마다 들어 있어야 하는 LAN 박스.
const membership: Record<string, string> = {
  'host-a': 'lan-1',
  'router-1': 'lan-1',
  'router-2': 'lan-2',
  'host-b': 'lan-2',
}

const question = '패킷은 다른 네트워크까지 어떻게 갈까?'
const idleCaption = '호스트 A가 있는 LAN 1과 호스트 B가 있는 LAN 2를 라우터 1과 라우터 2가 잇는다. 버튼을 고르면 호스트 A가 호스트 B에게 보낸 IP 패킷이 MAC 주소로는 어디까지 가는지, 목적지까지는 무엇을 보고 가는지 볼 수 있다.'
const legend = '가는 선은 장치 사이의 연결, 화살표는 IP 패킷이 가는 길이다. 얇은 선 박스 하나가 LAN 하나다.'
const figureName = 'IP 패킷이 여러 네트워크를 거쳐 가는 길을 보이는 도식'
const expectedScenarios = [
  {
    id: 'lan', label: 'LAN 안 전달',
    nodes: ['host-a', 'router-1', 'cable-a'],
    paths: ['hop-1'],
    notes: ['lan-note'] as NoteId[],
    caption: '호스트 B는 다른 네트워크에 있으므로, 호스트 A는 같은 LAN에 있는 라우터 1의 MAC 주소를 프레임에 적어 패킷을 라우터 1에게 넘긴다. MAC 주소로 가는 것은 같은 LAN 안의 다음 장치까지다.',
    sources: [anchorConceptId],
  },
  {
    id: 'end-to-end', label: '목적지까지',
    nodes: ['host-a', 'router-1', 'router-2', 'host-b', ...linkIds],
    paths: ['hop-1', 'hop-2', 'hop-3'],
    notes: ['e2e-note'] as NoteId[],
    caption: '패킷에는 호스트 B의 IP 주소가 적혀 있다. 라우터 1과 라우터 2가 그 주소를 보고 패킷을 차례로 다음 네트워크로 넘겨, 패킷은 여러 네트워크를 거쳐 호스트 B에 닿는다. 구간마다 프레임은 새로 만들어지지만 목적지 IP 주소는 그대로다.',
    sources: [anchorConceptId],
  },
]

function diagram() {
  return screen.getByRole('img', { name: '호스트 A와 라우터 1이 있는 LAN 1, 라우터 2와 호스트 B가 있는 LAN 2를 두 라우터가 잇고, 호스트 A가 호스트 B에게 보낸 IP 패킷이 가는 길을 보이는 모습' })
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

// 보이는 곁말이 지정한 id·글·자리이고, viewBox 안에서 노드·선·그룹 라벨과 겹치지 않으며 그룹 박스의 변에 걸치지 않는다.
function expectNotes(ids: NoteId[], places: Record<NoteId, Note>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note')).sort()).toEqual([...ids].sort())
  const groups = groupIds.map(groupBox)
  for (const note of shown) {
    const id = note.getAttribute('data-note')! as NoteId
    const box = textBox(note, id)
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
    for (const label of groupLabelBoxes()) expect(overlaps(box, label), `${id} ↔ 라벨 ${label.id}`).toBe(false)
    for (const line of diagram().querySelectorAll('[data-link], [data-path]')) {
      for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), `${id} ↔ 선`).toBe(false)
    }
    for (const group of groups) expect(contains(group, box) || !overlaps(group, box), `${id} ↔ ${group.id}`).toBe(true)
  }
}

// 그룹 박스 둘은 늘 보이고 흐려지지 않으며, 라벨은 자기 박스 안 왼쪽 위에 있다. 노드는 자기 LAN 박스 안에 통째로 든다.
function expectGroups(places: Record<string, Box>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-group]'))
  expect(shown.map((group) => group.getAttribute('data-group'))).toEqual(groupIds)
  expect(boxesOutsideViewBox(shown.map(readBox), [0, 0, width, height])).toEqual([])
  expect(overlaps(groupBox('lan-1'), groupBox('lan-2'))).toBe(false)
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
  for (const [node, group] of Object.entries(membership)) {
    expect(contains(groupBox(group), nodeBox(node)), `${node} ∈ ${group}`).toBe(true)
    for (const other of groupIds.filter((id) => id !== group)) expect(overlaps(groupBox(other), nodeBox(node)), `${node} ∉ ${other}`).toBe(false)
  }
}

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
  expectGroups(groups, width, height)
  expectNotes(scenario.notes, places, width, height)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다.
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
    expect(box.height).toBe(32)
    expect(estimateTextWidth(label, 10) + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
  }
  for (let i = 0; i < nodeIds.length; i += 1) {
    for (let j = i + 1; j < nodeIds.length; j += 1) {
      expect(overlaps(nodeBox(nodeIds[i]), nodeBox(nodeIds[j])), `${nodeIds[i]} ↔ ${nodeIds[j]}`).toBe(false)
    }
  }
}

// 연결은 늘 보이고 회색이며 두 노드를 잇는다. 노드는 모두 회색이고 도식 전용 두 색·초록·빨강·주황은 쓰지 않는다.
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

function brightNodes() {
  return nodeIds.filter((id) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
}

// 요점: LAN 안 전달은 호스트 A에서 같은 LAN의 라우터 1에서 끝나 LAN 2로 넘어가지 않는다.
// 목적지까지는 호스트 A에서 시작해 두 라우터를 차례로 거쳐 호스트 B에서 끝난다. 두 시나리오의 선명한 노드가 다르다. 그 말들은 개념 본문에 있다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')

  await selectScenario('LAN 안 전달')
  const lanHops = hops()
  expect(lanHops).toEqual([['host-a', 'router-1']])
  expect(lanHops.flat().every((id) => membership[id] === 'lan-1')).toBe(true)
  const lanBright = brightNodes()

  await selectScenario('목적지까지')
  const endHops = hops()
  expect(endHops[0][0]).toBe('host-a')
  expect(endHops[endHops.length - 1][1]).toBe('host-b')
  for (let i = 1; i < endHops.length; i += 1) expect(endHops[i][0], '화살표가 이어진다').toBe(endHops[i - 1][1])
  expect(endHops.map(([, to]) => to)).toEqual(['router-1', 'router-2', 'host-b'])
  expect(brightNodes()).not.toEqual(lanBright)

  expect(body).toContain('그 패킷을 같은 LAN 안의 다음 장치에게 넘길 때 그 장치의 MAC 주소를 쓴다')
  expect(body).toContain('목적지가 같은 LAN에 있으면 다음 장치는 목적지이고, 없으면 그 LAN의 라우터다')
  expect(body).toContain('패킷에 적힌 목적지 IP 주소는 끝까지 그대로다')
  expect(body).toContain('라우터는 받은 IP 패킷의 목적지 주소를 보고')
}

async function expectUniqueMarkers() {
  render(<><IpAcrossNetworksDiagram /><IpAcrossNetworksDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '목적지까지' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(3)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('IpAcrossNetworksDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<IpAcrossNetworksDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 연결이 모두 선명하고 화살표·곁말 없이 박스와 선택 안내가 나온다', () => {
    const { container } = render(<IpAcrossNetworksDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
    expect(shownIds('[data-group]', 'data-group')).toEqual(groupIds)
    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<IpAcrossNetworksDiagram />)
    await expectScenario(scenario, tallArrows, tallNotes, tallGroups, 280, 208, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<IpAcrossNetworksDiagram />)
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

  it('노드와 박스가 280×208 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<IpAcrossNetworksDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 208')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 208])
    expectGroups(tallGroups, 280, 208)
  })

  it('연결은 늘 보이고 회색이며 두 노드의 변에서 시작하고 끝난다', () => {
    render(<IpAcrossNetworksDiagram />)
    expectLinks(tallLinks)
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
    render(<IpAcrossNetworksDiagram />)
    await expectArrowEnds()
  })

  it('LAN 안 전달은 라우터 1에서 끝나고, 목적지까지는 두 라우터를 거쳐 호스트 B에서 끝난다', async () => {
    render(<IpAcrossNetworksDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<IpAcrossNetworksDiagram />)
    const text = visualsByTopicId[topicId].diagrams['ip-across-networks']
    const ids = ipAcrossNetworksScenarios.map(({ id }) => id).sort()
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
      const scenario = ipAcrossNetworksScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 IP 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×104 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<IpAcrossNetworksDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 104')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·연결·박스 id 집합과 화살표 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<IpAcrossNetworksDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 208')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallLinkIds = shownIds('[data-link]', 'data-link').sort()
      const tallGroupIds = shownIds('[data-group]', 'data-group').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 104')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinkIds)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroupIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
    })

    it('모든 rect가 440×104 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<IpAcrossNetworksDiagram />)
      expectFits([0, 0, 440, 104])
      expectGroups(wideGroups, 440, 104)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<IpAcrossNetworksDiagram />)
      await expectScenario(scenario, wideArrows, wideNotes, wideGroups, 440, 104, container)
    })

    it('연결은 늘 보이고 회색이며 두 노드의 변에서 시작하고 끝난다', () => {
      render(<IpAcrossNetworksDiagram />)
      expectLinks(wideLinks)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
      render(<IpAcrossNetworksDiagram />)
      await expectArrowEnds()
    })

    it('LAN 안 전달은 라우터 1에서 끝나고, 목적지까지는 두 라우터를 거쳐 호스트 B에서 끝난다', async () => {
      render(<IpAcrossNetworksDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<IpAcrossNetworksDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 208')
      await selectScenario('목적지까지')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '목적지까지' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['hop-1', 'hop-2', 'hop-3'])
      for (const path of paths) expect(path).toHaveAttribute('d', wideArrows[path.getAttribute('data-path')!])
      expect(diagram().querySelector('[data-note="e2e-note"]')).toHaveAttribute('x', String(wideNotes['e2e-note'].x))
    })
  })
})
