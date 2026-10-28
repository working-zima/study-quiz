import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { IgmpGroupDiagram, igmpGroupScenarios } from './IgmpGroupDiagram'

const topicId = 'icmp'
const anchorConceptId = `${topicId}.igmp`
const labels = {
  'other': '다른 네트워크',
  'router': '멀티캐스트 라우터',
  'host-a': '호스트 A',
  'host-b': '호스트 B',
  'host-c': '호스트 C',
}
const groupLabels = { lan: '같은 네트워크' }
const noteLabels = {
  'query-name': '멤버십 질의 · IP TTL 1',
  'query-what': '구성원이 있는 그룹을 물음',
  'report-name': '멤버십 보고 · IP TTL 1',
  'report-what': '그룹에 들었다고 알림',
  'leave-name': '그룹 탈퇴 · IP TTL 1',
  'leave-what': '그룹을 떠난다고 알림',
}
type NoteId = keyof typeof noteLabels

const nodeIds = Object.keys(labels)
const insideIds = nodeIds.filter((id) => id !== 'other')

const tallGroup: SvgBox = { id: 'lan', x: 8, y: 56, width: 264, height: 192 }
const wideGroup: SvgBox = { id: 'lan', x: 128, y: 8, width: 304, height: 168 }
const tallLink = 'M140 88 V40'
const wideLink = 'M144 88 H112'
const tallArrows: Record<string, string> = {
  'query-a': 'M112 120 V144 H56 V168',
  'query-b': 'M140 120 V168',
  'query-c': 'M168 120 V144 H224 V168',
  'report': 'M140 168 V120',
  'leave': 'M140 168 V120',
}
const wideArrows: Record<string, string> = {
  'query-a': 'M248 80 H296 V40 H344',
  'query-b': 'M248 88 H344',
  'query-c': 'M248 96 H296 V136 H344',
  'report': 'M344 88 H248',
  'leave': 'M344 88 H248',
}
// 화살표마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'query-a': ['router', 'host-a'],
  'query-b': ['router', 'host-b'],
  'query-c': ['router', 'host-c'],
  'report': ['host-b', 'router'],
  'leave': ['host-b', 'router'],
}

type Note = { x: number, y: number }
const tallNotes: Record<NoteId, Note> = {
  'query-name': { x: 140, y: 222 },
  'query-what': { x: 140, y: 236 },
  'report-name': { x: 140, y: 222 },
  'report-what': { x: 140, y: 236 },
  'leave-name': { x: 140, y: 222 },
  'leave-what': { x: 140, y: 236 },
}
const wideNotes: Record<NoteId, Note> = {
  'query-name': { x: 196, y: 140 },
  'query-what': { x: 196, y: 154 },
  'report-name': { x: 196, y: 140 },
  'report-what': { x: 196, y: 154 },
  'leave-name': { x: 196, y: 140 },
  'leave-what': { x: 196, y: 154 },
}

const question = '멀티캐스트 라우터는 그룹 구성원을 어떻게 알까?'
const idleCaption = '같은 네트워크에 멀티캐스트 라우터와 호스트 A·B·C가 있고, 라우터는 다른 네트워크와도 이어져 있다. 버튼을 고르면 IGMP 메시지가 누구에게서 누구에게 가는지 볼 수 있다.'
const legend = '상자는 같은 네트워크다. 라우터와 다른 네트워크 사이의 선은 두 네트워크를 잇는 연결이고, 화살표는 IGMP 메시지가 가는 길이다.'
const figureName = '같은 네트워크의 멀티캐스트 라우터와 호스트 A·B·C가 IGMP의 멤버십 질의·멤버십 보고·그룹 탈퇴를 주고받는 길을 보이는 도식'
const svgName = '같은 네트워크 상자 안에 멀티캐스트 라우터와 호스트 A·B·C가 있고, 라우터는 상자 밖의 다른 네트워크와 이어져 있다'
const expectedScenarios = [
  {
    id: 'query', label: '질의',
    nodes: ['router', 'host-a', 'host-b', 'host-c'],
    paths: ['query-a', 'query-b', 'query-c'],
    notes: ['query-name', 'query-what'] as NoteId[],
    caption: '라우터가 같은 네트워크의 모든 호스트에게 멤버십 질의를 보내, 구성원이 있는 그룹이 무엇인지 묻는다. IP 헤더의 TTL을 1로 보내므로 이 질의는 다른 네트워크로 넘어가지 않는다.',
    sources: [anchorConceptId],
  },
  {
    id: 'report', label: '보고',
    nodes: ['router', 'host-b'],
    paths: ['report'],
    notes: ['report-name', 'report-what'] as NoteId[],
    caption: '그룹에 든 호스트 B가 그 그룹의 주소로 멤버십 보고를 보내고 라우터가 이를 받는다. 라우터는 이 네트워크에 그 그룹의 구성원이 있다는 것만 알아 둔다.',
    sources: [anchorConceptId],
  },
  {
    id: 'leave', label: '탈퇴',
    nodes: ['router', 'host-b'],
    paths: ['leave'],
    notes: ['leave-name', 'leave-what'] as NoteId[],
    caption: '그 그룹에 마지막으로 보고한 호스트 B가 그룹을 떠나며 그룹 탈퇴를 보낸다. IGMPv2부터 있는 메시지로, 그룹에 구성원이 남지 않았다는 것을 라우터가 빨리 알게 한다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 256]
const wideBox: [number, number, number, number] = [0, 0, 440, 184]

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

function groupBox() {
  return readBox(diagram().querySelector('[data-group="lan"]')!)
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

function groupLabelBox() {
  return textBox(diagram().querySelector('[data-group-label="lan"]')!, 'lan')
}

// 선의 양 끝이 지정한 두 노드의 변에 닿고, 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다.
function expectLine(line: Element, id: string, pair: [string, string]) {
  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  for (const segment of segments(line.getAttribute('d')!)) {
    for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
    expect(touches(segment, groupLabelBox()), `${id} ↔ 그룹 라벨`).toBe(false)
  }
  const { start, end } = lineEnds(line)
  expect(nodeAt(start), `${id} 시작`).toBe(pair[0])
  expect(nodeAt(end), `${id} 끝`).toBe(pair[1])
}

// 같은 네트워크 상자는 늘 보이고 흐려지지 않는다. 라벨은 상자 안 왼쪽 위에 있다.
// 라우터와 호스트 셋은 상자 안에, 다른 네트워크는 상자 밖에 있다. 라우터와 다른 네트워크를 잇는 선은 늘 보인다.
function expectGroup(group: SvgBox, link: string) {
  expect(shownIds('[data-group]', 'data-group')).toEqual(['lan'])
  const rect = diagram().querySelector('[data-group="lan"]')!
  expect(readBox(rect)).toEqual(group)
  expect(rect.closest('[opacity]')).toBeNull()
  const label = diagram().querySelector('[data-group-label="lan"]')!
  expect(label.textContent).toBe(groupLabels.lan)
  expect(label).toHaveAttribute('font-size', '9')
  expect(label.closest('[opacity]')).toBeNull()
  expect(contains(group, groupLabelBox()), '그룹 라벨').toBe(true)
  for (const id of nodeIds) {
    expect(overlaps(groupLabelBox(), nodeBox(id)), `그룹 라벨 ↔ ${id}`).toBe(false)
    expect(contains(group, nodeBox(id)), `${id} ⊂ 같은 네트워크`).toBe(insideIds.includes(id))
    if (!insideIds.includes(id)) expect(overlaps(group, nodeBox(id)), `${id} ↔ 같은 네트워크`).toBe(false)
  }
  const line = diagram().querySelector('[data-link="uplink"]')!
  expect(line).toHaveAttribute('d', link)
  expect(line).not.toHaveAttribute('marker-end')
  expect(line).toHaveClass('stroke-muted')
  expect(line.closest('[opacity]')).toBeNull()
  expectLine(line, 'uplink', ['router', 'other'])
}

// 보이는 곁말이 지정한 id·글·자리이고, 같은 네트워크 상자 안에서 노드·선·그룹 라벨·다른 곁말과 겹치지 않는다.
function expectNotes(ids: NoteId[], places: Record<NoteId, Note>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note')).sort()).toEqual([...ids].sort())
  const boxes = shown.map((note) => textBox(note, note.getAttribute('data-note')!))
  for (const note of shown) {
    const id = note.getAttribute('data-note')! as NoteId
    const box = textBox(note, id)
    expect(note.textContent).toBe(noteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', 'middle')
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note.closest('[opacity]')).toBeNull()
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(width)
    expect(box.y).toBeGreaterThanOrEqual(0)
    expect(box.y + box.height).toBeLessThanOrEqual(height)
    expect(contains(groupBox(), box), `${id} ⊂ 같은 네트워크`).toBe(true)
    expect(overlaps(box, groupLabelBox()), `${id} ↔ 그룹 라벨`).toBe(false)
    for (const node of nodeIds.map(nodeBox)) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const line of diagram().querySelectorAll('[data-path], [data-link]')) {
      for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), `${id} ↔ 선`).toBe(false)
    }
    for (const other of boxes.filter((item) => item.id !== id)) expect(overlaps(box, other), `${id} ↔ ${other.id}`).toBe(false)
  }
}

async function expectScenario(
  scenario: typeof expectedScenarios[number],
  arrows: Record<string, string>,
  places: Record<NoteId, Note>,
  group: SvgBox,
  link: string,
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
  expectGroup(group, link)
  expectNotes(scenario.notes, places, width, height)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다. 노드는 모두 회색이다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length + 1)
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

// 경로의 모든 꼭짓점.
function points(d: string) {
  return segments(d).flatMap((segment) => [{ x: segment.x1, y: segment.y1 }, { x: segment.x2, y: segment.y2 }])
}

// 요점: 어느 시나리오에서나 IGMP 메시지 화살표의 모든 점이 같은 네트워크 상자 안에 있고, 다른 네트워크에 닿는 화살표가 없다.
// 질의는 라우터에서 호스트 셋으로, 보고와 탈퇴는 호스트 B에서 라우터로 가는 화살표 하나뿐이다. 메시지 곁말은 모두 TTL 1을 적는다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')

  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    expect(diagram().querySelector('[data-node="other"]'), label).toHaveAttribute('opacity', '0.25')
    for (const path of diagram().querySelectorAll('[data-path]')) {
      for (const point of points(path.getAttribute('d')!)) {
        expect(point.x >= groupBox().x && point.x <= groupBox().x + groupBox().width, `${label} x`).toBe(true)
        expect(point.y >= groupBox().y && point.y <= groupBox().y + groupBox().height, `${label} y`).toBe(true)
      }
      for (const segment of segments(path.getAttribute('d')!)) expect(touches(segment, nodeBox('other')), label).toBe(false)
    }
    const name = Array.from(diagram().querySelectorAll('[data-note]')).find((note) => note.getAttribute('data-note')!.endsWith('-name'))!
    expect(name.textContent).toMatch(/IP TTL 1$/u)
  }

  await selectScenario('질의')
  expect(hops()).toEqual([['router', 'host-a'], ['router', 'host-b'], ['router', 'host-c']])
  await selectScenario('보고')
  expect(hops()).toEqual([['host-b', 'router']])
  await selectScenario('탈퇴')
  expect(hops()).toEqual([['host-b', 'router']])

  expect(body).toContain('**멤버십 질의**(Membership Query)는 라우터가 같은 네트워크의 모든 호스트에게 주기적으로 보내, 구성원이 있는 그룹이 무엇인지 묻는 메시지다')
  expect(body).toContain('**멤버십 보고**(Membership Report)는 호스트가 자기가 들어 있는 그룹을 알리는 메시지다')
  expect(body).toContain('**그룹 탈퇴**(Leave Group)는 그룹을 떠나는 호스트가 그 그룹에 마지막으로 보고한 호스트였다면 라우터들에게 보내는 메시지다')
  expect(body).toContain('모든 IGMP 메시지는 IP 헤더의 TTL을 1로 정해 보낸다')
  expect(body).toContain('IGMP 메시지는 보낸 네트워크 밖으로 나가지 않는다')
}

async function expectUniqueMarkers() {
  render(<><IgmpGroupDiagram /><IgmpGroupDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '질의' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(3)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('IgmpGroupDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<IgmpGroupDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표·곁말 없이 그룹·연결선과 선택 안내가 나온다', () => {
    const { container } = render(<IgmpGroupDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expectGroup(tallGroup, tallLink)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<IgmpGroupDiagram />)
    await expectScenario(scenario, tallArrows, tallNotes, tallGroup, tallLink, 280, 256, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<IgmpGroupDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드가 280×256 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<IgmpGroupDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 256')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
    render(<IgmpGroupDiagram />)
    await expectArrowEnds()
  })

  it('IGMP 메시지는 같은 네트워크 상자 밖으로 나가지 않고, 보고와 탈퇴는 호스트 B에서 라우터로만 간다', async () => {
    render(<IgmpGroupDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<IgmpGroupDiagram />)
    const text = visualsByTopicId[topicId].diagrams['igmp-group']
    const ids = igmpGroupScenarios.map(({ id }) => id).sort()
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
      const scenario = igmpGroupScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 IGMP 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×184 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커·그룹·연결선을 유지한다', () => {
      render(<IgmpGroupDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 184')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
      expectGroup(wideGroup, wideLink)
    })

    it('노드·그룹 id 집합과 화살표·곁말 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<IgmpGroupDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 256')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroupIds = shownIds('[data-group]', 'data-group').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')
      const tallNoteIds = await collectIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 184')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroupIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(tallNoteIds).toEqual(Object.keys(noteLabels).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
      expect(await collectIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
    })

    it('모든 rect가 440×184 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<IgmpGroupDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<IgmpGroupDiagram />)
      await expectScenario(scenario, wideArrows, wideNotes, wideGroup, wideLink, 440, 184, container)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
      render(<IgmpGroupDiagram />)
      await expectArrowEnds()
    })

    it('IGMP 메시지는 같은 네트워크 상자 밖으로 나가지 않고, 보고와 탈퇴는 호스트 B에서 라우터로만 간다', async () => {
      render(<IgmpGroupDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<IgmpGroupDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 256')
      await selectScenario('탈퇴')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '탈퇴' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['leave'])
      expect(paths[0]).toHaveAttribute('d', wideArrows.leave)
      expect(diagram().querySelector('[data-note="leave-name"]')).toHaveAttribute('x', String(wideNotes['leave-name'].x))
    })
  })
})
