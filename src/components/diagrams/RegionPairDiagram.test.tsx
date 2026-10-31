import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { RegionPairDiagram, regionPairScenarios } from './RegionPairDiagram'

const topicId = 'azure-regions-zones'
const anchorConceptId = `${topicId}.region-pairs`
const labels = {
  'region-a': '지역 A',
  'region-b': '지역 B',
}
const groupLabels = {
  'geography': '지리',
}
const noteLabels = {
  'a-down-note': '지역 전체 중단',
  'b-takeover-note': '일을 이어받음',
  'a-update-note': '업데이트 중',
  'b-running-note': '계속 동작',
}
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

// 두 지역이 짝이라는 연결선. 늘 보이고 화살표가 아니다.
const tallLinks = { 'pair': 'M48 64 V136' }
const wideLinks = { 'pair': 'M128 40 H312' }
type Links = typeof tallLinks

// 지역 A에서 지역 B로 일이 넘어가는 장애 조치. 시나리오에서만 보이는 화살표다.
const tallPaths = { 'failover': 'M96 64 V136' }
const widePaths = { 'failover': 'M128 56 H312' }
type Paths = typeof tallPaths

const tallNotes: NotePlaces = {
  'a-down-note': { x: 132, y: 51, anchor: 'start' },
  'b-takeover-note': { x: 132, y: 155, anchor: 'start' },
  'a-update-note': { x: 132, y: 51, anchor: 'start' },
  'b-running-note': { x: 132, y: 155, anchor: 'start' },
}
const wideNotes: NotePlaces = {
  'a-down-note': { x: 76, y: 82, anchor: 'middle' },
  'b-takeover-note': { x: 364, y: 82, anchor: 'middle' },
  'a-update-note': { x: 76, y: 82, anchor: 'middle' },
  'b-running-note': { x: 364, y: 82, anchor: 'middle' },
}

const allNodes = Object.keys(labels)
const question = '짝을 이룬 두 지역은 재해가 날 때와 업데이트할 때 어떻게 쓰일까?'
const idleCaption = '같은 지리 안의 지역 A와 지역 B가 지역 쌍을 이룬다. 버튼을 고르면 지역 A 전체가 멈출 때와 계획된 업데이트를 할 때 두 지역이 어떻게 되는지 볼 수 있다.'
const legend = '큰 박스는 지리다. 두 지역을 잇는 가는 선은 둘이 짝이라는 뜻이고, 화살표는 고객이 구성해 둔 장애 조치로 일이 넘어가는 방향이다. 흐리게 그린 노드는 멈춘 것이다.'
const figureName = '지역 쌍을 이룬 두 지역이 지역 전체의 재해와 계획된 업데이트 때 어떻게 되는지 보는 도식'
const svgName = '지리 하나 안에 지역 A와 지역 B가 있고, 두 지역이 짝이라는 것을 선으로 이었다'
const expectedScenarios = [
  {
    id: 'disaster', label: '지역 A 전체 중단',
    nodes: ['region-b'],
    paths: ['failover'],
    notes: ['a-down-note', 'b-takeover-note'],
    caption: '큰 재해로 지역 A 전체가 멈췄다. 회사 A가 지역 B에도 리소스와 데이터를 복제해 두고 장애 조치를 구성했다면 지역 B가 일을 이어받는다. 지역 B가 지역 A의 짝이라는 것만으로는 일이 저절로 넘어가지 않는다.',
    sources: ['azure-regions-zones.region-pairs'],
  },
  {
    id: 'update', label: '계획된 업데이트',
    nodes: ['region-a', 'region-b'],
    paths: [],
    notes: ['a-update-note', 'b-running-note'],
    caption: 'Microsoft는 계획된 업데이트를 짝의 두 지역에 한꺼번에 하지 않고 한 지역씩 한다. 지역 A를 업데이트하는 동안 지역 B는 계속 동작하므로, 드물게 업데이트에 문제가 있어도 두 지역이 함께 영향을 받지 않는다.',
    sources: ['azure-regions-zones.region-pairs'],
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

function inside(box: SvgBox, group: string) {
  const frame = groupBox(group)
  return boxesOutsideViewBox([box], [frame.x, frame.y, frame.width, frame.height]).length === 0
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
  return { id: text.getAttribute('data-note') ?? text.getAttribute('data-group-label')!, x: left, y: y - 9, width, height: 9 }
}

// 반각 글자는 화면에서 더 넓다. 가운데 정렬은 양쪽으로, 왼쪽 정렬은 오른쪽으로 1.15배만큼 넓혀 잡는다.
function wideTextBox(text: Element): SvgBox {
  const box = textBox(text)
  const width = box.width * 1.15
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'middle' ? box.x - (width - box.width) / 2 : anchor === 'end' ? box.x - (width - box.width) : box.x
  return { ...box, x: left, width }
}

// 그룹 라벨이 차지하는 자리. 반각 글자 여유(1.15배)까지 잡는다.
function groupLabelArea(id: string): SvgBox {
  const group = groupBox(id)
  return { id, x: group.x + 10, y: group.y + 5, width: estimateTextWidth(groupLabels[id as keyof typeof groupLabels], 9) * 1.15, height: 9 }
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

// 직교 경로를 선분 목록으로 편다. M/H/V만 나온다.
function segments(d: string) {
  const result: { x1: number, y1: number, x2: number, y2: number }[] = []
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

type Segment = ReturnType<typeof segments>[number]

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

// 두 선분이 닿는가. 직교 선분이라 둘레 상자로 본다.
function segmentsTouch(a: Segment, b: Segment) {
  return touches(a, {
    id: 'segment',
    x: Math.min(b.x1, b.x2), y: Math.min(b.y1, b.y2),
    width: Math.abs(b.x2 - b.x1), height: Math.abs(b.y2 - b.y1),
  })
}

function onEdge(x: number, y: number, box: SvgBox) {
  const insideX = x >= box.x && x <= box.x + box.width
  const insideY = y >= box.y && y <= box.y + box.height
  return ((x === box.x || x === box.x + box.width) && insideY) || ((y === box.y || y === box.y + box.height) && insideX)
}

function opacityOf(id: string) {
  return diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')
}

// 짝을 잇는 연결선은 시나리오와 상관없이 같은 모양으로 늘 보이고, 흐려지지 않으며, 화살표 마커가 없다.
function expectLinks(links: Links) {
  expect(shownIds('[data-link]', 'data-link')).toEqual(Object.keys(links))
  for (const [id, d] of Object.entries(links)) {
    const link = diagram().querySelector(`[data-link="${id}"]`)!
    expect(link).toHaveAttribute('d', d)
    expect(link).toHaveClass('stroke-muted')
    expect(link).toHaveAttribute('stroke-width', '1.5')
    expect(link).not.toHaveAttribute('marker-end')
    expect(link.closest('[opacity]')).toBeNull()
  }
}

// 보이는 화살표 경로가 시나리오의 것과 같고, 자기 도식의 마커를 가리킨다.
function expectPaths(ids: string[], paths: Paths) {
  const shown = Array.from(diagram().querySelectorAll('[data-path]'))
  expect(shown.map((path) => path.getAttribute('data-path'))).toEqual(ids)
  for (const path of shown) {
    expect(path).toHaveAttribute('d', paths[path.getAttribute('data-path')! as keyof Paths])
    expect(path).toHaveClass('stroke-title')
    expect(path).toHaveAttribute('stroke-width', '2')
    expect(path).toHaveAttribute('marker-end', `url(#${diagram().querySelector('marker')!.id})`)
  }
}

// 연결선은 두 지역 노드의 마주 보는 변을 잇고, 장애 조치 경로는 지역 A의 변에서 나가 지역 B의 변에서 끝난다.
// 두 선은 서로 닿지 않고, 어느 선도 노드 안·그룹 라벨 자리를 지나지 않는다.
function expectLines(links: Links, paths: Paths) {
  for (const [id, d] of [...Object.entries(links), ...Object.entries(paths)]) {
    const list = segments(d)
    expect(onEdge(list[0].x1, list[0].y1, nodeBox('region-a')), `${id} 시작은 지역 A의 변`).toBe(true)
    expect(onEdge(list[list.length - 1].x2, list[list.length - 1].y2, nodeBox('region-b')), `${id} 끝은 지역 B의 변`).toBe(true)
    for (const segment of list) {
      for (const node of allNodes) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
      for (const group of Object.keys(groupLabels)) expect(touches(segment, groupLabelArea(group)), `${id} ↔ ${group} 라벨`).toBe(false)
    }
  }
  for (const pair of segments(links.pair)) {
    for (const failover of segments(paths.failover)) expect(segmentsTouch(pair, failover), '연결선 ↔ 장애 조치').toBe(false)
  }
}

// 아래 단언들은 배치에 묶이지 않는다. 세로형과 가로형이 같은 기대값으로 통과해야 한다.
async function expectScenario(
  scenario: typeof expectedScenarios[number],
  places: NotePlaces,
  links: Links,
  paths: Paths,
  width: number,
  container: HTMLElement,
) {
  await selectScenario(scenario.label)

  for (const node of diagram().querySelectorAll('[data-node]')) {
    expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
  }
  for (const group of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(group.closest('[opacity]')).toBeNull()
  expectLinks(links)
  expectPaths(scenario.paths, paths)

  const lineSegments = [...Object.values(links), ...Object.values(paths)].flatMap(segments)
  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  const groupLabelBoxes = Object.keys(groupLabels).map(groupLabelArea)
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
    const box = wideTextBox(note)
    expect(box.x, id).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, id).toBeLessThanOrEqual(width)
    expect(inside(box, 'geography'), `${id} ⊂ 지리`).toBe(true)
    for (const label of groupLabelBoxes) expect(overlaps(box, label), `${id} ↔ ${label.id}`).toBe(false)
    for (const node of nodeBoxes) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const segment of lineSegments) expect(touches(segment, box), `${id} ↔ 선`).toBe(false)
  }
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 상자 안에, 그룹 라벨은 1.15배로 잡아도 자기 박스 오른쪽 끝 안에 들어간다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(3)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(label, 10) * 1.15 + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
  }

  for (const [id, wording] of Object.entries(groupLabels)) {
    const box = groupBox(id)
    const groupLabel = diagram().querySelector(`[data-group-label="${id}"]`)!
    expect(groupLabel.textContent).toBe(wording)
    expect(groupLabel).toHaveAttribute('font-size', '9')
    expect(groupLabel).toHaveClass('fill-muted')
    const x = Number(groupLabel.getAttribute('x'))
    expect(x, wording).toBe(box.x + 10)
    expect(Number(groupLabel.getAttribute('y')), wording).toBe(box.y + 14)
    expect(x + estimateTextWidth(wording, 9) * 1.15, wording).toBeLessThanOrEqual(box.x + box.width)
  }
}

// 두 지역은 지리 안에 겹치지 않게 들고, 지리의 라벨 자리보다 아래에 있다. 노드는 모두 회색이다.
function expectMembershipAndColors() {
  for (const id of allNodes) {
    expect(inside(nodeBox(id), 'geography'), id).toBe(true)
    expect(nodeBox(id).y, id).toBeGreaterThan(groupLabelArea('geography').y + 9)
    expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  }
  expect(overlaps(nodeBox('region-a'), nodeBox('region-b'))).toBe(false)
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 요점: 지역 A가 멈추면 지역 A만 흐려지고, 장애 조치 화살표가 지역 A에서 나가 지역 B에서 끝난다.
// 업데이트에는 장애 조치 화살표가 없고 두 지역이 모두 선명하다. 짝을 잇는 선은 어느 때나 보인다.
async function expectPoint(links: Links, paths: Paths) {
  expectLinks(links)

  await selectScenario('지역 A 전체 중단')
  expect(opacityOf('region-a')).toBe('0.25')
  expect(opacityOf('region-b')).toBe('1')
  expect(shownIds('[data-path]', 'data-path')).toEqual(['failover'])
  const failover = segments(paths.failover)
  expect(onEdge(failover[0].x1, failover[0].y1, nodeBox('region-a'))).toBe(true)
  expect(onEdge(failover[failover.length - 1].x2, failover[failover.length - 1].y2, nodeBox('region-b'))).toBe(true)
  const disasterNotes = shownIds('[data-note]', 'data-note').sort()
  expectLinks(links)

  await selectScenario('계획된 업데이트')
  expect(opacityOf('region-a')).toBe('1')
  expect(opacityOf('region-b')).toBe('1')
  expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
  expect(shownIds('[data-note]', 'data-note').sort()).not.toEqual(disasterNotes)
  expectLinks(links)
}

describe('RegionPairDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<RegionPairDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 두 지역이 모두 선명하고 짝을 잇는 선만 보이며 장애 조치 화살표와 곁말은 없고 선택 안내가 나온다', () => {
    const { container } = render(<RegionPairDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual([...allNodes].sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expectLinks(tallLinks)
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(shownIds('[data-note]', 'data-note')).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('짝을 잇는 선과 장애 조치 경로는 두 지역의 변을 잇고 서로 닿지 않는다', () => {
    render(<RegionPairDiagram />)
    expectLines(tallLinks, tallPaths)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·경로·곁말만 보이고 나머지 노드는 흐려지며 짝을 잇는 선은 그대로다', async (scenario) => {
    const { container } = render(<RegionPairDiagram />)
    await expectScenario(scenario, tallNotes, tallLinks, tallPaths, 280, container)
  })

  it('시나리오를 바꾸면 이전 경로·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<RegionPairDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
      expectLinks(tallLinks)
    }
    await selectScenario('전체')

    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(shownIds('[data-note]', 'data-note')).toEqual([])
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expectLinks(tallLinks)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
    for (const { label } of expectedScenarios) expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'false')
  })

  it('그룹 하나와 노드 둘이 280×184 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<RegionPairDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 184')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 184])
  })

  it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 0..280 안에 있다', async (label) => {
    render(<RegionPairDiagram />)
    await selectScenario(label)

    expect(diagram().querySelectorAll('[data-group]')).toHaveLength(1)
    for (const text of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(text.closest('[opacity]')).toBeNull()
    for (const text of diagram().querySelectorAll('[data-group-label], [data-note]')) {
      expect(text).toHaveAttribute('font-size', '9')
      const box = wideTextBox(text)
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(280)
    }
  })

  it('두 지역은 지리 안에 겹치지 않게 있고 모두 회색이다', () => {
    render(<RegionPairDiagram />)
    expectMembershipAndColors()
  })

  it('지역 A가 멈추면 장애 조치 화살표가 지역 A에서 지역 B로 가고, 업데이트에는 화살표 없이 두 지역이 선명하다', async () => {
    render(<RegionPairDiagram />)
    await expectPoint(tallLinks, tallPaths)
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 경로가 자기 마커를 가리킨다', async () => {
    render(<><RegionPairDiagram /><RegionPairDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })

    expect(figures).toHaveLength(2)
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '지역 A 전체 중단' })) })
      expect(figure.querySelectorAll('[data-path]')).toHaveLength(1)
      expect(figure.querySelector('[data-path]')).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
      expect(figure.querySelectorAll('[data-link]')).toHaveLength(1)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<RegionPairDiagram />)
    const text = visualsByTopicId[topicId].diagrams['region-pairs']
    const ids = regionPairScenarios.map(({ id }) => id).sort()
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
      const scenario = regionPairScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 지역 쌍 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    function ids(selector: string, attribute: string) {
      return shownIds(selector, attribute).sort()
    }

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×100 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<RegionPairDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 100')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expectLinks(wideLinks)
    })

    it('노드·그룹·연결선·경로 id 집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<RegionPairDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 184')
      await selectScenario('지역 A 전체 중단')
      const tallNodes = ids('[data-node]', 'data-node')
      const tallGroups = ids('[data-group]', 'data-group')
      const tallLinkIds = ids('[data-link]', 'data-link')
      const tallPathIds = ids('[data-path]', 'data-path')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 100')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(tallNodes).toEqual([...allNodes].sort())
      expect(ids('[data-group]', 'data-group')).toEqual(tallGroups)
      expect(tallGroups).toEqual(Object.keys(groupLabels).sort())
      expect(ids('[data-link]', 'data-link')).toEqual(tallLinkIds)
      expect(ids('[data-path]', 'data-path')).toEqual(tallPathIds)
      expect(tallPathIds).toEqual(['failover'])
    })

    it('모든 rect가 440×100 viewBox 안에 있고 노드 라벨·그룹 라벨이 자기 상자 안에 들어간다', () => {
      render(<RegionPairDiagram />)
      expectFits([0, 0, 440, 100])
    })

    it('짝을 잇는 선과 장애 조치 경로는 두 지역의 변을 잇고 서로 닿지 않는다', () => {
      render(<RegionPairDiagram />)
      expectLines(wideLinks, widePaths)
    })

    it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 0..440 안에 있다', async (label) => {
      render(<RegionPairDiagram />)
      await selectScenario(label)

      expect(diagram().querySelectorAll('[data-group]')).toHaveLength(1)
      for (const text of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(text.closest('[opacity]')).toBeNull()
      for (const text of diagram().querySelectorAll('[data-group-label], [data-note]')) {
        expect(text).toHaveAttribute('font-size', '9')
        const box = wideTextBox(text)
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width).toBeLessThanOrEqual(440)
      }
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·경로·곁말·캡션을 보이고 곁말은 노드·그룹 라벨·선과 겹치지 않는다', async (scenario) => {
      const { container } = render(<RegionPairDiagram />)
      await expectScenario(scenario, wideNotes, wideLinks, widePaths, 440, container)
    })

    it('두 지역은 지리 안에 겹치지 않게 있고 모두 회색이다', () => {
      render(<RegionPairDiagram />)
      expectMembershipAndColors()
    })

    it('지역 A가 멈추면 장애 조치 화살표가 지역 A에서 지역 B로 가고, 업데이트에는 화살표 없이 두 지역이 선명하다', async () => {
      render(<RegionPairDiagram />)
      await expectPoint(wideLinks, widePaths)
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<RegionPairDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 184')
      await selectScenario('지역 A 전체 중단')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '지역 A 전체 중단' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expectLinks(wideLinks)
      expectPaths(['failover'], widePaths)
      for (const note of diagram().querySelectorAll('[data-note]')) {
        expect(note).toHaveAttribute('x', String(wideNotes[note.getAttribute('data-note')! as NoteId].x))
      }
    })
  })
})
