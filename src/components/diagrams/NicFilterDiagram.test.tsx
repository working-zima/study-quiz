import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { NicFilterDiagram, nicFilterScenarios } from './NicFilterDiagram'

const topicId = 'ethernet'
const anchorConceptId = `${topicId}.nic`
const labels = {
  upper: '위 계층',
  nic: 'NIC',
  cable: '케이블',
}
const groupLabels = {
  computer: '내 컴퓨터',
}
const noteLabels = {
  'dest-mine': '목적지: 이 NIC의 MAC 주소',
  'dest-other': '목적지: 다른 장치의 MAC 주소',
  'dest-broadcast': '목적지: 브로드캐스트 주소',
  discard: '버림',
}
type NoteId = keyof typeof noteLabels

const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
// NIC와 위 계층은 내 컴퓨터 박스 안에, 케이블은 박스 밖에 있다.
const homeOf: Record<string, string | undefined> = { upper: 'computer', nic: 'computer', cable: undefined }
const linkIds = ['cable-nic', 'nic-upper']

const tallLinks: Record<string, string> = {
  'cable-nic': 'M104 176 V128',
  'nic-upper': 'M104 96 V64',
}
const wideLinks: Record<string, string> = {
  'cable-nic': 'M104 56 H184',
  'nic-upper': 'M280 56 H320',
}
const tallArrows: Record<string, string> = {
  arrive: 'M104 176 V128',
  deliver: 'M104 96 V64',
}
const wideArrows: Record<string, string> = {
  arrive: 'M104 56 H184',
  deliver: 'M280 56 H320',
}
// 링크와 화살표마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'cable-nic': ['cable', 'nic'],
  'nic-upper': ['nic', 'upper'],
  arrive: ['cable', 'nic'],
  deliver: ['nic', 'upper'],
}

type Note = { x: number, y: number, anchor: 'start' | 'middle' }
const destTall: Note = { x: 112, y: 156, anchor: 'start' }
const destWide: Note = { x: 8, y: 92, anchor: 'start' }
const tallNotes: Record<NoteId, Note> = {
  'dest-mine': destTall,
  'dest-other': destTall,
  'dest-broadcast': destTall,
  discard: { x: 168, y: 115, anchor: 'start' },
}
const wideNotes: Record<NoteId, Note> = {
  'dest-mine': destWide,
  'dest-other': destWide,
  'dest-broadcast': destWide,
  discard: { x: 232, y: 88, anchor: 'middle' },
}

const question = 'NIC는 들어온 프레임을 모두 컴퓨터에 넘길까?'
const idleCaption = 'NIC는 케이블로 들어온 프레임을 모두 컴퓨터에 넘기지 않는다. 프레임에 적힌 목적지 주소를 보고, 이 컴퓨터가 받을 프레임이면 컴퓨터의 위 계층으로 넘기고 아니면 버린다. 버튼을 고르면 목적지 주소에 따라 NIC가 프레임을 어떻게 다루는지 볼 수 있다.'
const legend = '내 컴퓨터 박스 안의 NIC가 케이블로 들어온 프레임을 먼저 받는다. 가는 선은 연결, 화살표는 프레임이 가는 길이다.'
const expectedScenarios = [
  {
    id: 'mine', label: '내 주소로 온 프레임',
    nodes: ['cable', 'nic', 'upper', 'cable-nic', 'nic-upper'],
    paths: ['arrive', 'deliver'],
    notes: ['dest-mine'] as NoteId[],
    caption: '케이블로 들어온 프레임의 목적지 주소가 이 NIC의 MAC 주소다. 이 컴퓨터가 받을 프레임이므로 NIC는 프레임을 받아들여, 그 안의 데이터를 컴퓨터의 위 계층으로 넘긴다.',
  },
  {
    id: 'other', label: '다른 장치 앞으로 온 프레임',
    nodes: ['cable', 'nic', 'cable-nic'],
    paths: ['arrive'],
    notes: ['dest-other', 'discard'] as NoteId[],
    caption: '목적지 주소가 같은 LAN에 있는 다른 장치의 MAC 주소다. 이 컴퓨터가 받을 프레임이 아니므로 NIC는 프레임을 위 계층으로 넘기지 않고 버린다. 따로 설정을 바꿔 모든 프레임을 받아들이게 하지 않은 NIC는 이렇게 고른다.',
  },
  {
    id: 'broadcast', label: '브로드캐스트 프레임',
    nodes: ['cable', 'nic', 'upper', 'cable-nic', 'nic-upper'],
    paths: ['arrive', 'deliver'],
    notes: ['dest-broadcast'] as NoteId[],
    caption: '목적지 주소가 브로드캐스트 주소, 곧 그 LAN에 이어진 장치 모두를 한꺼번에 가리키는 주소다. 모든 장치가 받을 프레임이므로 이 NIC도 프레임을 받아들여, 그 안의 데이터를 컴퓨터의 위 계층으로 넘긴다.',
  },
]

function diagram() {
  return screen.getByRole('img', { name: '케이블로 들어온 프레임을 내 컴퓨터의 NIC가 받아 위 계층으로 넘기거나 버리는 모습' })
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

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

// 상자가 그룹 박스 안에 다 들어 있는가.
function inside(box: SvgBox, group: string) {
  return boxesOutsideViewBox([box], frameOf(groupBox(group))).length === 0
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

// 보이는 곁말이 지정한 id·글·자리이고, 노드·그룹 라벨·선·다른 곁말과 겹치지 않으며 viewBox 안에 있다.
function expectNotes(ids: NoteId[], places: Record<NoteId, Note>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note')).sort()).toEqual([...ids].sort())
  const nodes = nodeIds.map(nodeBox)
  const lines = Array.from(diagram().querySelectorAll('[data-link], [data-path]'))
  for (const note of shown) {
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
    expect(box.y, id).toBeGreaterThanOrEqual(0)
    expect(box.y + box.height, id).toBeLessThanOrEqual(height)
    for (const node of nodes) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const group of groupIds) expect(overlaps(box, groupLabelArea(group)), `${id} ↔ ${group} 라벨`).toBe(false)
    for (const line of lines) {
      for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), `${id} ↔ 선`).toBe(false)
    }
  }
  for (let i = 0; i < shown.length; i += 1) {
    for (let j = i + 1; j < shown.length; j += 1) {
      expect(overlaps(textBox(shown[i]), textBox(shown[j])), '곁말끼리').toBe(false)
    }
  }
}

// 아래 단언들은 배치에 묶이지 않는다. 세로형과 가로형이 같은 기대값으로 통과해야 한다.
async function expectScenario(
  scenario: typeof expectedScenarios[number],
  arrows: Record<string, string>,
  places: Record<NoteId, Note>,
  width: number,
  height: number,
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
  expectNotes(scenario.notes, places, width, height)
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

// NIC와 위 계층은 내 컴퓨터 박스 안에, 케이블은 박스 밖에 있다. 연결선은 늘 보이고 회색이다.
// 노드는 모두 회색이고 도식 전용 두 색·초록·빨강·주황은 쓰지 않는다.
function expectMembershipAndLinks(links: Record<string, string>) {
  for (const [node, group] of Object.entries(homeOf)) {
    expect(groupIds.filter((id) => inside(nodeBox(node), id)), node).toEqual(group ? [group] : [])
    if (!group) for (const id of groupIds) expect(overlaps(nodeBox(node), groupBox(id)), `${node} ↔ ${id}`).toBe(false)
  }

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

// 시나리오마다 목적지 곁말이 가리키는 경우를 개념 본문이 쓴 말.
const bodyWording: Record<string, string> = {
  mine: '목적지 주소가 자기 MAC 주소인 프레임',
  other: '다른 장치 앞으로 온 프레임',
  broadcast: '브로드캐스트 주소인 프레임',
}

// 요점: 프레임은 어느 시나리오에서나 박스 밖 케이블에서 들어와 박스 안의 NIC에 닿는다.
// 내 주소로 온 프레임과 브로드캐스트 프레임만 NIC에서 위 계층으로 가는 화살표가 보이고, 다른 장치 앞으로 온 프레임에서는
// 그 화살표가 없고 위 계층이 흐려지며 NIC 곁에 「버림」이 보인다. 세 시나리오의 목적지 곁말은 서로 다르고, 그 글은 개념 본문에 있다.
async function expectPoint() {
  const destinations: string[] = []
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    const hops = Array.from(diagram().querySelectorAll('[data-path]'), (path) => [nodeAt(lineEnds(path).start)!, nodeAt(lineEnds(path).end)!])
    expect(hops[0], scenario.label).toEqual(['cable', 'nic'])
    expect(homeOf[hops[0][0]], scenario.label).toBeUndefined()
    expect(homeOf[hops[0][1]], scenario.label).toBe('computer')
    const delivered = hops.some(([from, to]) => from === 'nic' && to === 'upper')
    expect(delivered, scenario.label).toBe(scenario.id !== 'other')
    expect(diagram().querySelector('[data-node="upper"]'), scenario.label).toHaveAttribute('opacity', scenario.id === 'other' ? '0.25' : '1')
    expect(diagram().querySelector('[data-note="discard"]') !== null, scenario.label).toBe(scenario.id === 'other')
    const destination = Array.from(diagram().querySelectorAll('[data-note^="dest-"]'), (note) => note.textContent!)
    expect(destination, scenario.label).toHaveLength(1)
    destinations.push(destination[0])
    expect(body, destination[0]).toContain(bodyWording[scenario.id])
  }
  expect(new Set(destinations).size).toBe(expectedScenarios.length)
  expect(body).toContain('버린다')
  expect(body).toContain('위 계층')
}

async function expectUniqueMarkers() {
  render(<><NicFilterDiagram /><NicFilterDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: 'NIC가 프레임을 고르는 도식' })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '내 주소로 온 프레임' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(2)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('NicFilterDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<NicFilterDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 셋·연결선 둘·박스가 모두 선명하고 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<NicFilterDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
    expect(shownIds('[data-group]', 'data-group')).toEqual(groupIds)
    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    for (const group of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(group.closest('[opacity]')).toBeNull()
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·연결선·화살표·곁말만 보이고 박스는 그대로다', async (scenario) => {
    const { container } = render(<NicFilterDiagram />)
    await expectScenario(scenario, tallArrows, tallNotes, 280, 216, container)
  })

  it('시나리오를 바꾸면 이전 화살표와 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<NicFilterDiagram />)
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

  it('노드와 박스가 280×216 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<NicFilterDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 216')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 216])
  })

  it('NIC와 위 계층은 내 컴퓨터 안에, 케이블은 밖에 있고 연결선은 늘 보이며 노드는 모두 회색이다', () => {
    render(<NicFilterDiagram />)
    expectMembershipAndLinks(tallLinks)
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
    render(<NicFilterDiagram />)
    await expectArrowEnds()
  })

  it('받을 프레임만 NIC에서 위 계층으로 가고, 다른 장치 앞으로 온 프레임은 NIC에서 버려진다', async () => {
    render(<NicFilterDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<NicFilterDiagram />)
    const text = visualsByTopicId[topicId].diagrams['nic-filter']
    const ids = nicFilterScenarios.map(({ id }) => id).sort()
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
    expect(text.label).toBe('NIC가 프레임을 고르는 도식')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = nicFilterScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 NIC 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: 'NIC가 프레임을 고르는 도식' })

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

    it('440×108 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<NicFilterDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 108')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·그룹·연결선 id 집합과 화살표 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<NicFilterDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 216')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroups = shownIds('[data-group]', 'data-group').sort()
      const tallLinkIds = shownIds('[data-link]', 'data-link').sort()
      const tallPathIds = await collectPathIds()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 108')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroups)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinkIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallGroups).toEqual([...groupIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(await collectPathIds()).toEqual(tallPathIds)
    })

    it('모든 rect가 440×108 viewBox 안에 있고 라벨과 그룹 라벨이 자기 상자 안에 들어간다', () => {
      render(<NicFilterDiagram />)
      expectFits([0, 0, 440, 108])
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<NicFilterDiagram />)
      await expectScenario(scenario, wideArrows, wideNotes, 440, 108, container)
    })

    it('NIC와 위 계층은 내 컴퓨터 안에, 케이블은 밖에 있고 연결선은 늘 보이며 노드는 모두 회색이다', () => {
      render(<NicFilterDiagram />)
      expectMembershipAndLinks(wideLinks)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
      render(<NicFilterDiagram />)
      await expectArrowEnds()
    })

    it('받을 프레임만 NIC에서 위 계층으로 가고, 다른 장치 앞으로 온 프레임은 NIC에서 버려진다', async () => {
      render(<NicFilterDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<NicFilterDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 216')
      await selectScenario('다른 장치 앞으로 온 프레임')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '다른 장치 앞으로 온 프레임' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['arrive'])
      for (const path of paths) expect(path).toHaveAttribute('d', wideArrows[path.getAttribute('data-path')!])
      expect(diagram().querySelector('[data-note="discard"]')).toHaveAttribute('x', String(wideNotes.discard.x))
      expect(diagram().querySelector('[data-node="upper"]')).toHaveAttribute('opacity', '0.25')
    })
  })
})
