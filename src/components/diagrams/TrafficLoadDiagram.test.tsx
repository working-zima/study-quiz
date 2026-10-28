import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { TrafficLoadDiagram, trafficLoadScenarios } from './TrafficLoadDiagram'

const topicId = 'network-basics'
const anchorConceptId = `${topicId}.traffic`
const labels = {
  'user-1': '사용자 1',
  'user-2': '사용자 2',
  'user-3': '사용자 3',
  'user-4': '사용자 4',
  'server-1': '서버 1',
  'server-2': '서버 2',
  'server-3': '서버 3',
}
const groupLabels = { site: '웹 사이트' }
const noteLabels = { overload: '과부하' }
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const userIds = nodeIds.filter((id) => id.startsWith('user-'))
const serverIds = nodeIds.filter((id) => id.startsWith('server-'))

const tallPaths: Record<string, string> = {
  'concentrated-1': 'M36 48 V112 H116 V160',
  'concentrated-2': 'M104 48 V96 H132 V160',
  'concentrated-3': 'M172 48 V96 H148 V160',
  'concentrated-4': 'M240 48 V112 H164 V160',
  'distributed-1': 'M36 48 V104 H72 V160',
  'distributed-2': 'M104 48 V104 H124 V160',
  'distributed-3': 'M172 48 V104 H156 V160',
  'distributed-4': 'M240 48 V104 H208 V160',
}
const widePaths: Record<string, string> = {
  'concentrated-1': 'M72 24 H176 V72 H296',
  'concentrated-2': 'M72 64 H160 V80 H296',
  'concentrated-3': 'M72 104 H160 V88 H296',
  'concentrated-4': 'M72 144 H176 V96 H296',
  'distributed-1': 'M72 24 H176 V36 H296',
  'distributed-2': 'M72 64 H160 V76 H296',
  'distributed-3': 'M72 104 H160 V92 H296',
  'distributed-4': 'M72 144 H176 V132 H296',
}
// 화살표마다 요청을 보내는 사용자와 받는 서버.
const ends: Record<string, [string, string]> = {
  'concentrated-1': ['user-1', 'server-2'],
  'concentrated-2': ['user-2', 'server-2'],
  'concentrated-3': ['user-3', 'server-2'],
  'concentrated-4': ['user-4', 'server-2'],
  'distributed-1': ['user-1', 'server-1'],
  'distributed-2': ['user-2', 'server-2'],
  'distributed-3': ['user-3', 'server-2'],
  'distributed-4': ['user-4', 'server-3'],
}

const tallNotes: NotePlaces = { overload: { x: 140, y: 204, anchor: 'middle' } }
const wideNotes: NotePlaces = { overload: { x: 368, y: 87, anchor: 'start' } }

const question = '요청이 한꺼번에 몰리면 어떻게 될까?'
const idleCaption = '트래픽은 네트워크 안을 오가는 정보의 양이다. 많은 사람이 같은 웹 사이트에 한꺼번에 접속하면 그 사이트로 트래픽이 몰린다. 버튼을 고르면 그 요청을 서버 한 대가 모두 받을 때와 여러 대가 나눠 받을 때를 견줄 수 있다.'
const legend = '큰 박스는 서버 셋을 둔 웹 사이트이고, 화살표는 사용자가 보낸 요청이 가는 방향이다.'
const expectedScenarios = [
  {
    id: 'concentrated', label: '한 서버에 몰릴 때',
    nodes: ['user-1', 'user-2', 'user-3', 'user-4', 'server-2'],
    paths: ['concentrated-1', 'concentrated-2', 'concentrated-3', 'concentrated-4'],
    notes: ['overload'],
    caption: '사용자 넷의 요청을 서버 한 대가 모두 받으면, 그 서버로 트래픽이 지나치게 몰린다. 서버가 들어오는 패킷을 감당하지 못해 과부하가 걸리고, 처리가 늦어지며, 심하면 패킷을 잃기도 한다.',
    sources: [anchorConceptId],
  },
  {
    id: 'distributed', label: '나눠 받을 때',
    nodes: ['user-1', 'user-2', 'user-3', 'user-4', 'server-1', 'server-2', 'server-3'],
    paths: ['distributed-1', 'distributed-2', 'distributed-3', 'distributed-4'],
    notes: [],
    caption: '같은 요청을 서버 여러 대가 나눠 받게 하면, 몰린 트래픽이 여러 곳으로 나뉘어 한 서버가 다 떠맡지 않는다. 이렇게 하는 것을 「트래픽을 분산한다」고 말한다.',
    sources: [anchorConceptId],
  },
]

function diagram() {
  return screen.getByRole('img', { name: '사용자 넷이 서버 셋을 둔 웹 사이트로 요청을 보내는 네트워크' })
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

// 두 상자 사이의 가장 짧은 거리.
function gap(a: SvgBox, b: SvgBox) {
  const dx = Math.max(a.x - (b.x + b.width), b.x - (a.x + a.width), 0)
  const dy = Math.max(a.y - (b.y + b.height), b.y - (a.y + a.height), 0)
  return Math.hypot(dx, dy)
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

// 두 선분이 만나는가. 끝점에서 닿는 것도 센다.
function meets(a: Segment, b: Segment) {
  return touches(a, segmentBox(b))
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

// 아래 단언들은 배치에 묶이지 않는다. 세로형과 가로형이 같은 기대값으로 통과해야 한다.
async function expectScenario(
  scenario: typeof expectedScenarios[number],
  paths: Record<string, string>,
  places: NotePlaces,
  width: number,
  container: HTMLElement,
) {
  await selectScenario(scenario.label)

  for (const node of diagram().querySelectorAll('[data-node]')) {
    expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
  }
  for (const group of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(group.closest('[opacity]')).toBeNull()

  const shownPaths = Array.from(diagram().querySelectorAll('[data-path]'))
  expect(shownPaths.map((path) => path.getAttribute('data-path'))).toEqual(scenario.paths)
  for (const path of shownPaths) {
    expect(path).toHaveAttribute('d', paths[path.getAttribute('data-path')!])
    expect(path).toHaveAttribute('stroke-width', '2')
    expect(path).toHaveAttribute('marker-end', `url(#${diagram().querySelector('marker')!.id})`)
    expect(path).toHaveClass('stroke-title')
    expect(path.closest('[opacity]')).toBeNull()
  }

  const lineSegments = shownPaths.flatMap((line) => segments(line.getAttribute('d')!))
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

// 서버 셋은 웹 사이트 박스 안에, 사용자 넷은 그 밖에 있다. 노드는 모두 회색이고 과부하도 색으로 칠하지 않는다.
function expectMembership() {
  for (const id of serverIds) expect(inside(nodeBox(id), 'site'), id).toBe(true)
  for (const id of userIds) expect(overlaps(nodeBox(id), groupBox('site')), id).toBe(false)
  for (const id of nodeIds) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 화살표 양 끝은 사용자와 서버의 변에 닿고, 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다. 같은 시나리오의 화살표끼리는 만나지 않는다.
async function expectPathEnds() {
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
    const shown = Array.from(diagram().querySelectorAll('[data-path]'))
    for (const path of shown) {
      const id = path.getAttribute('data-path')!
      for (const segment of segments(path.getAttribute('d')!)) {
        for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelArea(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
      const { start, end } = lineEnds(path)
      expect(nodeAt(start), `${id} 시작`).toBe(ends[id][0])
      expect(nodeAt(end), `${id} 끝`).toBe(ends[id][1])
    }
    for (let i = 0; i < shown.length; i += 1) {
      for (let j = i + 1; j < shown.length; j += 1) {
        const a = segments(shown[i].getAttribute('d')!)
        const b = segments(shown[j].getAttribute('d')!)
        const names = `${shown[i].getAttribute('data-path')} ↔ ${shown[j].getAttribute('data-path')}`
        expect(a.some((first) => b.some((second) => meets(first, second))), names).toBe(false)
      }
    }
  }
}

// 몰릴 때: 사용자 넷의 화살표가 모두 같은 서버에서 끝나고, 과부하 곁말은 그 서버 바로 곁(8 안쪽)에 있다.
// 나눠 받을 때: 화살표가 끝나는 서버가 둘 이상이고, 서버 셋이 모두 요청을 받는다.
async function expectLoad() {
  await selectScenario('한 서버에 몰릴 때')
  const crowded = Array.from(diagram().querySelectorAll('[data-path]'), (path) => nodeAt(lineEnds(path).end))
  expect(crowded).toHaveLength(userIds.length)
  expect(new Set(crowded)).toEqual(new Set(['server-2']))
  const note = textBox(diagram().querySelector('[data-note="overload"]')!)
  expect(gap(note, nodeBox('server-2'))).toBeLessThanOrEqual(8)
  for (const id of serverIds.filter((server) => server !== 'server-2')) expect(gap(note, nodeBox(id)), id).toBeGreaterThan(8)
  expect(inside(note, 'site')).toBe(true)

  await selectScenario('나눠 받을 때')
  const shared = Array.from(diagram().querySelectorAll('[data-path]'), (path) => nodeAt(lineEnds(path).end))
  expect(shared).toHaveLength(userIds.length)
  expect(new Set(shared).size).toBeGreaterThanOrEqual(2)
  expect(new Set(shared)).toEqual(new Set(serverIds))
  expect(Array.from(diagram().querySelectorAll('[data-path]'), (path) => nodeAt(lineEnds(path).start))).toEqual(userIds)
}

async function expectUniqueMarkers() {
  render(<><TrafficLoadDiagram /><TrafficLoadDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: '트래픽이 한 서버에 몰릴 때와 나뉠 때 도식' })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '한 서버에 몰릴 때' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(4)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('TrafficLoadDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<TrafficLoadDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 사용자 넷과 서버 셋이 모두 선명하고 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<TrafficLoadDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    expect(shownIds('[data-group]', 'data-group')).toEqual(groupIds)
    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    for (const group of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(group.closest('[opacity]')).toBeNull()
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 선명하고 웹 사이트 박스는 그대로다', async (scenario) => {
    const { container } = render(<TrafficLoadDiagram />)
    await expectScenario(scenario, tallPaths, tallNotes, 280, container)
  })

  it('시나리오를 바꾸면 이전 화살표가 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<TrafficLoadDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
    }
    await selectScenario('전체')

    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드와 웹 사이트 박스가 280×216 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<TrafficLoadDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 216')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 216])
  })

  it('서버는 웹 사이트 안에, 사용자는 그 밖에 있고 노드는 모두 회색이다', () => {
    render(<TrafficLoadDiagram />)
    expectMembership()
  })

  it('화살표 양 끝은 사용자와 서버의 변에 닿고, 노드 안과 그룹 라벨을 지나지 않으며 서로 만나지 않는다', async () => {
    render(<TrafficLoadDiagram />)
    await expectPathEnds()
  })

  it('몰릴 때는 모든 요청이 한 서버에서 끝나고, 나눠 받을 때는 서버 여럿에서 끝난다', async () => {
    render(<TrafficLoadDiagram />)
    await expectLoad()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<TrafficLoadDiagram />)
    const text = visualsByTopicId[topicId].diagrams['traffic-load']
    const ids = trafficLoadScenarios.map(({ id }) => id).sort()
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
    expect(text.label).toBe('트래픽이 한 서버에 몰릴 때와 나뉠 때 도식')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = trafficLoadScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 트래픽 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: '트래픽이 한 서버에 몰릴 때와 나뉠 때 도식' })

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

    it('440×168 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<TrafficLoadDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 168')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<TrafficLoadDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 216')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroups = shownIds('[data-group]', 'data-group').sort()
      const tallPathIds = await collectPathIds()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 168')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroups)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallGroups).toEqual([...groupIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallPaths).sort())
      expect(await collectPathIds()).toEqual(tallPathIds)
    })

    it('모든 rect가 440×168 viewBox 안에 있고 라벨과 그룹 라벨이 자기 상자 안에 들어간다', () => {
      render(<TrafficLoadDiagram />)
      expectFits([0, 0, 440, 168])
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<TrafficLoadDiagram />)
      await expectScenario(scenario, widePaths, wideNotes, 440, container)
    })

    it('서버는 웹 사이트 안에, 사용자는 그 밖에 있고 노드는 모두 회색이다', () => {
      render(<TrafficLoadDiagram />)
      expectMembership()
    })

    it('화살표 양 끝은 사용자와 서버의 변에 닿고, 노드 안과 그룹 라벨을 지나지 않으며 서로 만나지 않는다', async () => {
      render(<TrafficLoadDiagram />)
      await expectPathEnds()
    })

    it('몰릴 때는 모든 요청이 한 서버에서 끝나고, 나눠 받을 때는 서버 여럿에서 끝난다', async () => {
      render(<TrafficLoadDiagram />)
      await expectLoad()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<TrafficLoadDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 216')
      await selectScenario('한 서버에 몰릴 때')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '한 서버에 몰릴 때' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['concentrated-1', 'concentrated-2', 'concentrated-3', 'concentrated-4'])
      for (const path of paths) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(diagram().querySelector('[data-note="overload"]')).toHaveAttribute('x', '368')
    })
  })
})
