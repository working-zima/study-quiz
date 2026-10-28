import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { PacketSwitchingDiagram, packetSwitchingScenarios } from './PacketSwitchingDiagram'

const topicId = 'protocols-encapsulation'
const anchorConceptId = `${topicId}.packet-switching`
const labels = {
  'host-a': '호스트 A',
  'switch-1': '패킷 스위치',
  'host-c': '호스트 C',
  'switch-3': '패킷 스위치',
  'switch-2': '패킷 스위치',
  'host-b': '호스트 B',
}
const noteLabels = {
  'split-out': '나눠 보냄',
  'split-in': '다시 합침',
  'via-2': '패킷 1·3',
  'via-3': '패킷 2',
  shared: '함께 지나감',
}
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

const nodeIds = Object.keys(labels)
const linkIds = ['host-a-switch-1', 'host-c-switch-1', 'switch-1-switch-2', 'switch-1-switch-3', 'switch-2-host-b', 'switch-3-host-b']

const tallLinks: Record<string, string> = {
  'host-a-switch-1': 'M72 32 H100',
  'host-c-switch-1': 'M208 32 H180',
  'switch-1-switch-2': 'M160 48 V128 H184',
  'switch-1-switch-3': 'M120 48 V128 H96',
  'switch-2-host-b': 'M224 144 V208 H180',
  'switch-3-host-b': 'M56 144 V208 H100',
}
const wideLinks: Record<string, string> = {
  'host-a-switch-1': 'M64 24 H112 V48',
  'host-c-switch-1': 'M64 104 H112 V80',
  'switch-1-switch-2': 'M168 64 H256',
  'switch-1-switch-3': 'M144 80 V136 H256',
  'switch-2-host-b': 'M336 64 H376',
  'switch-3-host-b': 'M336 136 H404 V80',
}
// 화살표는 패킷이 지나는 통신 링크 위에 겹쳐 그린다.
const arrowLink: Record<string, string> = {
  'split-1': 'host-a-switch-1',
  'split-2': 'switch-1-switch-2',
  'split-3': 'switch-2-host-b',
  'split-4': 'switch-1-switch-3',
  'split-5': 'switch-3-host-b',
  'share-1': 'host-a-switch-1',
  'share-2': 'host-c-switch-1',
  'share-3': 'switch-1-switch-2',
  'share-4': 'switch-2-host-b',
}
const tallArrows = Object.fromEntries(Object.entries(arrowLink).map(([id, link]) => [id, tallLinks[link]]))
const wideArrows = Object.fromEntries(Object.entries(arrowLink).map(([id, link]) => [id, wideLinks[link]]))
// 링크와 화살표마다 출발 노드와 도착 노드.
const linkEnds: Record<string, [string, string]> = {
  'host-a-switch-1': ['host-a', 'switch-1'],
  'host-c-switch-1': ['host-c', 'switch-1'],
  'switch-1-switch-2': ['switch-1', 'switch-2'],
  'switch-1-switch-3': ['switch-1', 'switch-3'],
  'switch-2-host-b': ['switch-2', 'host-b'],
  'switch-3-host-b': ['switch-3', 'host-b'],
}
const ends: Record<string, [string, string]> = {
  ...linkEnds,
  ...Object.fromEntries(Object.entries(arrowLink).map(([id, link]) => [id, linkEnds[link]])),
}

const tallNotes: NotePlaces = {
  'split-out': { x: 40, y: 62, anchor: 'middle' },
  'split-in': { x: 140, y: 238, anchor: 'middle' },
  'via-2': { x: 168, y: 92, anchor: 'start' },
  'via-3': { x: 112, y: 92, anchor: 'end' },
  shared: { x: 168, y: 92, anchor: 'start' },
}
const wideNotes: NotePlaces = {
  'split-out': { x: 36, y: 54, anchor: 'middle' },
  'split-in': { x: 404, y: 40, anchor: 'middle' },
  'via-2': { x: 212, y: 58, anchor: 'middle' },
  'via-3': { x: 152, y: 112, anchor: 'start' },
  shared: { x: 212, y: 58, anchor: 'middle' },
}

const question = '큰 파일은 네트워크를 어떻게 건너갈까?'
const idleCaption = '패킷 교환 네트워크에서는 보낼 정보를 한 덩어리째 보내지 않고, 패킷이라는 작은 데이터 묶음 여러 개로 나눠 보낸다. 가운데의 패킷 스위치는 들어온 패킷을 받아 다음 장치로 넘겨준다. 버튼을 고르면 패킷이 어떤 길로 가는지 볼 수 있다.'
const legend = '상자는 호스트와 패킷 스위치, 가는 선은 장치와 장치를 잇는 통신 링크, 화살표는 패킷이 가는 방향이다.'
const expectedScenarios = [
  {
    id: 'split', label: '나눠 보내기',
    nodes: ['host-a', 'switch-1', 'switch-2', 'switch-3', 'host-b', 'host-a-switch-1', 'switch-1-switch-2', 'switch-2-host-b', 'switch-1-switch-3', 'switch-3-host-b'],
    paths: ['split-1', 'split-2', 'split-3', 'split-4', 'split-5'],
    notes: ['split-out', 'split-in', 'via-2', 'via-3'],
    caption: '호스트 A가 큰 파일을 패킷 여러 개로 나눠 내보낸다. 데이터그램 방식에서는 패킷 스위치가 패킷을 하나하나 따로 보고 넘겨줄 길을 정하므로, 같은 파일을 나눈 패킷이라도 패킷 1·3과 패킷 2처럼 서로 다른 길로 갈 수 있고 보낸 순서와 다른 순서로 도착하기도 한다. 호스트 B는 따로 도착한 패킷들을 모아 원래 파일로 합친다. 가상 회선 방식이라면 패킷들은 연결을 세울 때 정한 경로 하나를 따라간다.',
  },
  {
    id: 'share', label: '링크 나눠 쓰기',
    nodes: ['host-a', 'host-c', 'switch-1', 'switch-2', 'host-b', 'host-a-switch-1', 'host-c-switch-1', 'switch-1-switch-2', 'switch-2-host-b'],
    paths: ['share-1', 'share-2', 'share-3', 'share-4'],
    notes: ['shared'],
    caption: '호스트 A가 보낸 패킷과 호스트 C가 보낸 패킷이 섞여 같은 통신 링크를 함께 지나간다. 패킷 교환 네트워크는 두 호스트만 쓰는 회선을 잡아 두지 않으므로, 한 호스트가 링크를 혼자 차지하지 않고 여러 호스트의 패킷이 링크를 나눠 쓴다.',
  },
]

function diagram() {
  return screen.getByRole('img', { name: '호스트 A와 호스트 C가 패킷 스위치 셋을 거쳐 호스트 B와 이어진 패킷 교환 네트워크' })
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

// 두 선분이 같은 직선 위에서 길이를 갖고 겹치는가.
function sharesLine(a: Segment, b: Segment) {
  const span = (p: number, q: number, r: number, s: number) => Math.min(Math.max(p, q), Math.max(r, s)) - Math.max(Math.min(p, q), Math.min(r, s))
  if (a.y1 === a.y2 && b.y1 === b.y2) return a.y1 === b.y1 && span(a.x1, a.x2, b.x1, b.x2) > 0
  if (a.x1 === a.x2 && b.x1 === b.x2) return a.x1 === b.x1 && span(a.y1, a.y2, b.y1, b.y2) > 0
  return false
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

// 곁말이 붙은 노드 — 노드 아래 변에서 10~16 아래이거나 노드 위 변에서 6~16 위에 있고, 가운데가 노드 폭 안에 있다.
function nodeBesideNote(note: Element) {
  const box = textBox(note)
  const middleX = box.x + box.width / 2
  return nodeIds.filter((id) => {
    const node = nodeBox(id)
    const below = box.y + box.height - (node.y + node.height)
    const above = node.y - (box.y + box.height)
    return ((below >= 10 && below <= 16) || (above >= 6 && above <= 16)) && middleX > node.x && middleX < node.x + node.width
  })
}

// 곁말에서 8 안쪽으로 지나는 화살표 — 곁말이 가리키는 화살표다.
function pathsBesideNote(note: Element) {
  const box = textBox(note)
  return Array.from(diagram().querySelectorAll('[data-path]'))
    .filter((path) => segments(path.getAttribute('d')!).some((segment) => distance(segment, box) <= 8))
    .map((path) => path.getAttribute('data-path')!)
}

// 보이는 화살표를 이어 from에서 to까지 가는 길을 모두 찾는다. 길마다 거친 화살표 id 목록이다.
function routes(from: string, to: string) {
  const hops = Array.from(diagram().querySelectorAll('[data-path]'), (path) => ({
    id: path.getAttribute('data-path')!,
    from: nodeAt(lineEnds(path).start)!,
    to: nodeAt(lineEnds(path).end)!,
  }))
  const found: string[][] = []
  const walk = (at: string, taken: string[]) => {
    if (at === to) { found.push(taken); return }
    for (const hop of hops.filter((candidate) => candidate.from === at && !taken.includes(candidate.id))) walk(hop.to, [...taken, hop.id])
  }
  walk(from, [])
  return found
}

// 길이 거치는 장비 — 화살표마다 출발 노드를 모으고 맨 앞(보낸 호스트)을 뺀다.
function devicesOn(route: string[]) {
  return route.slice(1).map((id) => nodeAt(lineEnds(diagram().querySelector(`[data-path="${id}"]`)!).start))
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

// 통신 링크 여섯은 늘 보이고 회색이며 화살표가 없다. 노드는 모두 회색이고 도식 전용 두 색·초록·빨강·주황은 쓰지 않는다.
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

// 화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다. 화살표는 자기가 지나는 통신 링크와 같은 선이다.
async function expectArrowEnds(links: Record<string, string>) {
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    for (const path of diagram().querySelectorAll('[data-path]')) {
      const id = path.getAttribute('data-path')!
      expectLine(path, id)
      expect(path.getAttribute('d'), id).toBe(links[arrowLink[id]])
    }
  }
}

// 나눠 보내기: 호스트 A에서 호스트 B까지 가는 길이 둘이고 두 길이 거치는 장비가 다르다. 호스트 C에서는 아무 길도 나가지 않는다.
// 패킷 번호 곁말은 두 길이 갈라지는 첫 화살표 곁에 하나씩, 나눠 보냄은 호스트 A에, 다시 합침은 호스트 B에 붙는다.
// 링크 나눠 쓰기: 호스트 A에서 나온 길과 호스트 C에서 나온 길이 같은 화살표를 지나 호스트 B에 닿고, 함께 지나감은 그 화살표 곁에 붙는다.
async function expectPoint() {
  await selectScenario('나눠 보내기')
  const split = routes('host-a', 'host-b')
  expect(split).toEqual([['split-1', 'split-2', 'split-3'], ['split-1', 'split-4', 'split-5']])
  expect(split.map(devicesOn)).toEqual([['switch-1', 'switch-2'], ['switch-1', 'switch-3']])
  expect(new Set(split.flat())).toEqual(new Set(shownIds('[data-path]', 'data-path')))
  expect(routes('host-c', 'host-b')).toEqual([])
  const note = (id: string) => diagram().querySelector(`[data-note="${id}"]`)!
  expect(pathsBesideNote(note('via-2'))).toEqual(['split-2'])
  expect(pathsBesideNote(note('via-3'))).toEqual(['split-4'])
  expect(nodeBesideNote(note('split-out'))).toEqual(['host-a'])
  expect(nodeBesideNote(note('split-in'))).toEqual(['host-b'])

  await selectScenario('링크 나눠 쓰기')
  const fromA = routes('host-a', 'host-b')
  const fromC = routes('host-c', 'host-b')
  expect(fromA).toEqual([['share-1', 'share-3', 'share-4']])
  expect(fromC).toEqual([['share-2', 'share-3', 'share-4']])
  const shared = fromA[0].filter((id) => fromC[0].includes(id))
  expect(shared).toEqual(['share-3', 'share-4'])
  const segmentsOf = (route: string[]) => route.flatMap((id) => segments(diagram().querySelector(`[data-path="${id}"]`)!.getAttribute('d')!))
  expect(segmentsOf(fromA[0]).some((a) => segmentsOf(fromC[0]).some((b) => sharesLine(a, b)))).toBe(true)
  expect(new Set([...fromA[0], ...fromC[0]])).toEqual(new Set(shownIds('[data-path]', 'data-path')))
  expect(pathsBesideNote(note('shared')).length).toBeGreaterThan(0)
  for (const id of pathsBesideNote(note('shared'))) expect(shared, id).toContain(id)
  expect(routes('host-a', 'switch-3')).toEqual([])
}

async function expectUniqueMarkers() {
  render(<><PacketSwitchingDiagram /><PacketSwitchingDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: '패킷 교환 네트워크에서 패킷이 건너가는 길 도식' })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '나눠 보내기' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(5)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('PacketSwitchingDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<PacketSwitchingDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 여섯과 통신 링크 여섯이 모두 선명하고 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<PacketSwitchingDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·통신 링크·화살표·곁말만 선명하고 나머지는 흐려진다', async (scenario) => {
    const { container } = render(<PacketSwitchingDiagram />)
    await expectScenario(scenario, tallArrows, tallNotes, 280, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<PacketSwitchingDiagram />)
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
    render(<PacketSwitchingDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 248')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 248])
  })

  it('통신 링크는 늘 보이는 회색 선이고 양 끝이 두 노드의 변에 닿으며 노드는 모두 회색이다', () => {
    render(<PacketSwitchingDiagram />)
    expectLinks(tallLinks)
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않으며 통신 링크 위에 겹친다', async () => {
    render(<PacketSwitchingDiagram />)
    await expectArrowEnds(tallLinks)
  })

  it('나눠 보낸 패킷은 두 길로 갈라졌다가 호스트 B에서 합쳐지고, 두 호스트의 패킷은 같은 링크를 함께 지난다', async () => {
    render(<PacketSwitchingDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<PacketSwitchingDiagram />)
    const text = visualsByTopicId[topicId].diagrams['packet-switching']
    const ids = packetSwitchingScenarios.map(({ id }) => id).sort()
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
    expect(text.label).toBe('패킷 교환 네트워크에서 패킷이 건너가는 길 도식')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = packetSwitchingScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 패킷 교환 네트워크 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: '패킷 교환 네트워크에서 패킷이 건너가는 길 도식' })

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

    it('440×160 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<PacketSwitchingDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 160')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·통신 링크 id 집합과 화살표 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<PacketSwitchingDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 248')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallLinkIds = shownIds('[data-link]', 'data-link').sort()
      const tallPathIds = await collectPathIds()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 160')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinkIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(await collectPathIds()).toEqual(tallPathIds)
    })

    it('모든 rect가 440×160 viewBox 안에 있고 노드 라벨이 자기 상자 안에 들어간다', () => {
      render(<PacketSwitchingDiagram />)
      expectFits([0, 0, 440, 160])
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보이고 곁말은 노드·선과 겹치지 않는다', async (scenario) => {
      const { container } = render(<PacketSwitchingDiagram />)
      await expectScenario(scenario, wideArrows, wideNotes, 440, container)
    })

    it('통신 링크는 늘 보이는 회색 선이고 양 끝이 두 노드의 변에 닿으며 노드는 모두 회색이다', () => {
      render(<PacketSwitchingDiagram />)
      expectLinks(wideLinks)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않으며 통신 링크 위에 겹친다', async () => {
      render(<PacketSwitchingDiagram />)
      await expectArrowEnds(wideLinks)
    })

    it('나눠 보낸 패킷은 두 길로 갈라졌다가 호스트 B에서 합쳐지고, 두 호스트의 패킷은 같은 링크를 함께 지난다', async () => {
      render(<PacketSwitchingDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<PacketSwitchingDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 248')
      await selectScenario('링크 나눠 쓰기')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '링크 나눠 쓰기' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(expectedScenarios[1].paths)
      for (const path of paths) expect(path).toHaveAttribute('d', wideArrows[path.getAttribute('data-path')!])
      expect(diagram().querySelector('[data-note="shared"]')).toHaveAttribute('x', String(wideNotes.shared.x))
    })
  })
})
