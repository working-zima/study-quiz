import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { LanWanDiagram, lanWanScenarios } from './LanWanDiagram'

const topicId = 'network-basics'
const anchorConceptId = `${topicId}.lan-wan`
const labels = {
  laptop: '노트북',
  phone: '휴대폰',
  'home-router': '공유기',
  wan: 'WAN',
  'far-router': '공유기',
  desktop: '데스크톱',
  server: '서버',
}
const groupLabels = {
  'lan-1': '집의 LAN',
  'lan-2': '다른 LAN',
}
const noteLabels = {
  near: '가까운 거리',
  far: '먼 거리',
  isp: 'ISP가 구축',
}
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
// 장치마다 든 LAN. WAN은 어느 LAN에도 들지 않는다.
const homeOf: Record<string, string> = {
  laptop: 'lan-1', phone: 'lan-1', 'home-router': 'lan-1', 'far-router': 'lan-2', desktop: 'lan-2', server: 'lan-2',
}
const linkIds = ['laptop-home-router', 'phone-home-router', 'home-router-wan', 'wan-far-router', 'far-router-desktop', 'far-router-server']

const tallLinks: Record<string, string> = {
  'laptop-home-router': 'M64 64 V88 H92',
  'phone-home-router': 'M216 64 V88 H188',
  'home-router-wan': 'M140 104 V136',
  'wan-far-router': 'M140 168 V216',
  'far-router-desktop': 'M92 232 H64 V264',
  'far-router-server': 'M188 232 H216 V264',
}
const wideLinks: Record<string, string> = {
  'laptop-home-router': 'M80 48 H122 V64',
  'phone-home-router': 'M80 112 H122 V96',
  'home-router-wan': 'M148 80 H188',
  'wan-far-router': 'M252 80 H292',
  'far-router-desktop': 'M318 64 V48 H360',
  'far-router-server': 'M318 96 V112 H360',
}
const tallArrows: Record<string, string> = {
  'lan-1': 'M64 64 V88 H92',
  'lan-2': 'M188 88 H216 V64',
  'wan-1': 'M64 64 V88 H92',
  'wan-2': 'M140 104 V136',
  'wan-3': 'M140 168 V216',
  'wan-4': 'M92 232 H64 V264',
}
const wideArrows: Record<string, string> = {
  'lan-1': 'M80 48 H122 V64',
  'lan-2': 'M122 96 V112 H80',
  'wan-1': 'M80 48 H122 V64',
  'wan-2': 'M148 80 H188',
  'wan-3': 'M252 80 H292',
  'wan-4': 'M318 64 V48 H360',
}
// 링크와 화살표마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'laptop-home-router': ['laptop', 'home-router'],
  'phone-home-router': ['phone', 'home-router'],
  'home-router-wan': ['home-router', 'wan'],
  'wan-far-router': ['wan', 'far-router'],
  'far-router-desktop': ['far-router', 'desktop'],
  'far-router-server': ['far-router', 'server'],
  'lan-1': ['laptop', 'home-router'],
  'lan-2': ['home-router', 'phone'],
  'wan-1': ['laptop', 'home-router'],
  'wan-2': ['home-router', 'wan'],
  'wan-3': ['wan', 'far-router'],
  'wan-4': ['far-router', 'desktop'],
}

const tallNotes: NotePlaces = {
  near: { x: 266, y: 22, anchor: 'end' },
  far: { x: 80, y: 156, anchor: 'end' },
  isp: { x: 200, y: 156, anchor: 'start' },
}
const wideNotes: NotePlaces = {
  near: { x: 146, y: 22, anchor: 'end' },
  far: { x: 220, y: 56, anchor: 'middle' },
  isp: { x: 220, y: 110, anchor: 'middle' },
}

const question = '멀리 떨어진 두 LAN은 어떻게 이어질까?'
const idleCaption = 'LAN과 WAN은 이어진 장치의 수가 아니라 거리로 나눠 부른다. 큰 박스 하나하나가 가까운 곳의 장치를 이은 LAN이고, 멀리 떨어진 두 LAN은 그 사이의 WAN을 거쳐 이어진다. 버튼을 고르면 메시지가 어디까지 가는지 볼 수 있다.'
const legend = '큰 박스는 LAN 하나이고, WAN 상자는 두 LAN을 잇는 넓은 네트워크다. 가는 선은 연결, 화살표는 메시지가 가는 방향이다.'
const expectedScenarios = [
  {
    id: 'lan', label: 'LAN',
    nodes: ['laptop', 'phone', 'home-router', 'laptop-home-router', 'phone-home-router'],
    paths: ['lan-1', 'lan-2'],
    notes: ['near'],
    caption: 'LAN은 가까운 거리에 있는 장치들을 이은 네트워크다. 집에서 공유기 하나에 노트북과 휴대폰이 이어진 것이 그 예이고, 노트북이 휴대폰으로 보낸 메시지는 공유기를 거쳐 이 LAN 안에서 오간다.',
    sources: [anchorConceptId, `${topicId}.computer-network`],
  },
  {
    id: 'wan', label: 'WAN',
    nodes: ['laptop', 'home-router', 'wan', 'far-router', 'desktop', 'laptop-home-router', 'home-router-wan', 'wan-far-router', 'far-router-desktop'],
    paths: ['wan-1', 'wan-2', 'wan-3', 'wan-4'],
    notes: ['far', 'isp'],
    caption: '집의 노트북이 멀리 있는 다른 LAN의 데스크톱으로 보낸 메시지는 공유기를 거쳐 나가, ISP와 맺은 연결로 WAN에 닿고 WAN을 지나 그 LAN에 들어간다. 이렇게 멀리 떨어진 곳까지 잇는 WAN은 KT·LG U+·SK 브로드밴드 같은 ISP가 구축한다.',
    sources: [anchorConceptId, `${topicId}.network-equipment`],
  },
]

function diagram() {
  return screen.getByRole('img', { name: '집의 LAN과 멀리 있는 다른 LAN을 WAN이 이은 네트워크' })
}

async function selectScenario(label: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) })
}

function readBox(rect: Element): SvgBox {
  return {
    id: rect.getAttribute('data-group') ?? rect.parentElement?.getAttribute('data-node') ?? '',
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

function groupLabelArea(id: string): SvgBox {
  const box = groupBox(id)
  return { id, x: box.x + 10, y: box.y + 7, width: estimateTextWidth(groupLabels[id as keyof typeof groupLabels], 9), height: 9 }
}

function frameOf(box: SvgBox) {
  return [box.x, box.y, box.width, box.height] as [number, number, number, number]
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

// 상자가 그룹 박스 안에 다 들어 있는가.
function inside(box: SvgBox, group: string) {
  return boxesOutsideViewBox([box], frameOf(groupBox(group))).length === 0
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

// 선분을 폭이나 높이가 0인 상자로 본다.
function segmentBox(segment: Segment): SvgBox {
  return {
    id: '',
    x: Math.min(segment.x1, segment.x2), y: Math.min(segment.y1, segment.y2),
    width: Math.abs(segment.x2 - segment.x1), height: Math.abs(segment.y2 - segment.y1),
  }
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

// 선의 양 끝이 지정한 두 노드의 변에 닿고, 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다.
function expectLine(line: Element, id: string) {
  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  for (const segment of segments(line.getAttribute('d')!)) {
    for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const group of groupIds) expect(touches(segment, groupLabelArea(group)), `${id} ↔ ${group} 라벨`).toBe(false)
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
  for (const group of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(group.closest('[opacity]')).toBeNull()

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
    for (const group of groupIds) expect(overlaps(box, groupLabelArea(group)), `${id} ↔ ${group} 라벨`).toBe(false)
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

// 모든 rect가 viewBox 안에 있고, 라벨은 상자 안에, 그룹 라벨은 자기 박스 오른쪽 끝 안에 들어간다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(label, 10) + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
  }

  for (const [id, wording] of Object.entries(groupLabels)) {
    const box = groupBox(id)
    const groupLabel = diagram().querySelector(`[data-group-label="${id}"]`)!
    expect(groupLabel.textContent).toBe(wording)
    expect(groupLabel).toHaveAttribute('font-size', '9')
    expect(groupLabel).toHaveClass('fill-muted')
    expect(Number(groupLabel.getAttribute('x')), wording).toBe(box.x + 10)
    expect(Number(groupLabel.getAttribute('y')), wording).toBe(box.y + 14)
    expect(box.x + 10 + estimateTextWidth(wording, 9), wording).toBeLessThanOrEqual(box.x + box.width)
    expect(box.x + 10 + estimateTextWidth(wording, 9), wording).toBeLessThanOrEqual(viewBox[2])
    for (const node of nodeIds) expect(overlaps(groupLabelArea(id), nodeBox(node)), `${wording} ↔ ${node}`).toBe(false)
  }
}

// 장치는 자기 LAN 박스 하나 안에만 있고, WAN은 두 LAN 박스 어디에도 걸치지 않는다. 연결선은 늘 보이고 회색이다.
// 노드는 모두 회색이고 도식 전용 두 색·초록·빨강·주황은 쓰지 않는다.
function expectMembershipAndLinks(links: Record<string, string>) {
  for (const [node, group] of Object.entries(homeOf)) {
    expect(groupIds.filter((id) => inside(nodeBox(node), id)), node).toEqual([group])
  }
  expect(groupIds.filter((id) => overlaps(nodeBox('wan'), groupBox(id)))).toEqual([])

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

// 화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨 영역을 지나지 않는다.
async function expectArrowEnds() {
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    for (const path of diagram().querySelectorAll('[data-path]')) expectLine(path, path.getAttribute('data-path')!)
  }
}

// LAN: 화살표가 집의 LAN 박스를 벗어나지 않는다. 가까운 거리 곁말도 그 박스 안에 있다.
// WAN: 화살표가 집의 LAN의 노트북에서 출발해 WAN을 지나 다른 LAN의 데스크톱에 닿는다.
async function expectReach() {
  await selectScenario('LAN')
  for (const path of diagram().querySelectorAll('[data-path]')) {
    for (const segment of segments(path.getAttribute('d')!)) expect(inside(segmentBox(segment), 'lan-1')).toBe(true)
  }
  expect(inside(textBox(diagram().querySelector('[data-note="near"]')!), 'lan-1')).toBe(true)

  await selectScenario('WAN')
  const hops = Array.from(diagram().querySelectorAll('[data-path]'), (path) => [nodeAt(lineEnds(path).start), nodeAt(lineEnds(path).end)])
  expect(hops).toEqual([['laptop', 'home-router'], ['home-router', 'wan'], ['wan', 'far-router'], ['far-router', 'desktop']])
  expect(homeOf[hops[0][0]!]).toBe('lan-1')
  expect(homeOf[hops[hops.length - 1][1]!]).toBe('lan-2')
  expect(hops.flat().filter((id) => id === 'wan')).toHaveLength(2)
}

async function expectUniqueMarkers() {
  render(<><LanWanDiagram /><LanWanDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: 'LAN과 WAN이 잇는 범위 도식' })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'WAN' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(4)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('LanWanDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<LanWanDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 일곱·연결선 여섯·LAN 박스 둘이 모두 선명하고 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<LanWanDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
    expect(shownIds('[data-group]', 'data-group')).toEqual(groupIds)
    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    for (const group of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(group.closest('[opacity]')).toBeNull()
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·연결선·화살표·곁말만 선명하고 LAN 박스는 그대로다', async (scenario) => {
    const { container } = render(<LanWanDiagram />)
    await expectScenario(scenario, tallArrows, tallNotes, 280, container)
  })

  it('시나리오를 바꾸면 이전 화살표가 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<LanWanDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드와 LAN 박스가 280×312 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<LanWanDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 312')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 312])
  })

  it('장치는 자기 LAN 안에, WAN은 두 LAN 밖에 있고 연결선은 늘 보이며 노드는 모두 회색이다', () => {
    render(<LanWanDiagram />)
    expectMembershipAndLinks(tallLinks)
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
    render(<LanWanDiagram />)
    await expectArrowEnds()
  })

  it('LAN의 화살표는 한 LAN 박스 안에만 있고, WAN의 화살표는 WAN을 지나 두 LAN을 잇는다', async () => {
    render(<LanWanDiagram />)
    await expectReach()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<LanWanDiagram />)
    const text = visualsByTopicId[topicId].diagrams['lan-wan']
    const ids = lanWanScenarios.map(({ id }) => id).sort()
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
    expect(text.label).toBe('LAN과 WAN이 잇는 범위 도식')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = lanWanScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 LAN과 WAN 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: 'LAN과 WAN이 잇는 범위 도식' })

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

    it('440×144 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<LanWanDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 144')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·그룹·연결선 id 집합과 화살표 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<LanWanDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 312')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroups = shownIds('[data-group]', 'data-group').sort()
      const tallLinkIds = shownIds('[data-link]', 'data-link').sort()
      const tallPathIds = await collectPathIds()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 144')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroups)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinkIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallGroups).toEqual([...groupIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(await collectPathIds()).toEqual(tallPathIds)
    })

    it('모든 rect가 440×144 viewBox 안에 있고 라벨과 그룹 라벨이 자기 상자 안에 들어간다', () => {
      render(<LanWanDiagram />)
      expectFits([0, 0, 440, 144])
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<LanWanDiagram />)
      await expectScenario(scenario, wideArrows, wideNotes, 440, container)
    })

    it('장치는 자기 LAN 안에, WAN은 두 LAN 밖에 있고 연결선은 늘 보이며 노드는 모두 회색이다', () => {
      render(<LanWanDiagram />)
      expectMembershipAndLinks(wideLinks)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
      render(<LanWanDiagram />)
      await expectArrowEnds()
    })

    it('LAN의 화살표는 한 LAN 박스 안에만 있고, WAN의 화살표는 WAN을 지나 두 LAN을 잇는다', async () => {
      render(<LanWanDiagram />)
      await expectReach()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<LanWanDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 312')
      await selectScenario('WAN')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: 'WAN' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['wan-1', 'wan-2', 'wan-3', 'wan-4'])
      for (const path of paths) expect(path).toHaveAttribute('d', wideArrows[path.getAttribute('data-path')!])
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual(['far', 'isp'])
    })
  })
})
