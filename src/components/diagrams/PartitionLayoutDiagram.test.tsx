import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { PartitionLayoutDiagram, partitionLayoutScenarios } from './PartitionLayoutDiagram'

const topicId = 'linux-filesystem'
const anchorConceptId = `${topicId}.partition`
const labels = {
  fdisk: 'fdisk',
  fsck: 'fsck',
  table: '파티션 테이블',
  part1: '파티션 1',
  part2: '파티션 2',
}
const groupLabels = { disk: '둘째 디스크' }
const noteLabels = {
  'table-note': '디스크 앞쪽',
  'size1-note': '400GB',
  'size2-note': '600GB',
  'check-note': '파일 시스템 점검',
}
type NoteId = keyof typeof noteLabels

const nodeIds = Object.keys(labels)
// 둘째 디스크 테두리 안에 빈틈없이 이어 놓은 칸.
const cells = ['table', 'part1', 'part2']

const tallArrows: Record<string, string> = {
  'to-table': 'M80 40 V78',
  'to-part1': 'M152 40 V78',
}
const wideArrows: Record<string, string> = {
  'to-table': 'M88 40 V78',
  'to-part1': 'M220 40 V78',
}
// 화살표마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'to-table': ['fdisk', 'table'],
  'to-part1': ['fsck', 'part1'],
}

type Group = { x: number, y: number, width: number, height: number, labelX: number, labelY: number }
const tallGroup: Group = { x: 8, y: 56, width: 264, height: 78, labelX: 16, labelY: 70 }
const wideGroup: Group = { x: 8, y: 56, width: 424, height: 78, labelX: 16, labelY: 70 }

type Note = { x: number, y: number, anchor: 'start' | 'middle' | 'end' }
const tallNotes: Record<NoteId, Note> = {
  'table-note': { x: 66, y: 126, anchor: 'middle' },
  'size1-note': { x: 152, y: 126, anchor: 'middle' },
  'size2-note': { x: 224, y: 126, anchor: 'middle' },
  'check-note': { x: 152, y: 126, anchor: 'middle' },
}
const wideNotes: Record<NoteId, Note> = {
  'table-note': { x: 84, y: 126, anchor: 'middle' },
  'size1-note': { x: 220, y: 126, anchor: 'middle' },
  'size2-note': { x: 356, y: 126, anchor: 'middle' },
  'check-note': { x: 220, y: 126, anchor: 'middle' },
}

const question = '디스크를 나누면 무엇이 생길까?'
const idleCaption = '예로 든 둘째 디스크를 파티션 둘로 나눈 모습이다. 디스크 앞쪽에 파티션 테이블이 있고 그 뒤로 파티션 1과 파티션 2가 이어진다. 버튼을 고르면 fdisk와 fsck가 각각 무엇을 다루는지 볼 수 있다.'
const legend = '맨 앞 칸이 디스크의 앞쪽이고, 칸의 너비는 실제 크기와 상관없다. 화살표는 명령이 다루는 대상을 가리킨다.'
const figureName = '디스크를 파티션 둘로 나눈 모습에서, fdisk는 디스크 앞쪽의 파티션 테이블을 다루고 fsck는 파티션 안의 파일 시스템을 점검한다는 것을 견줘 보이는 도식'
const svgName = 'fdisk와 fsck 아래에 둘째 디스크가 있고, 디스크 안에 파티션 테이블, 파티션 1, 파티션 2가 차례로 이어져 있다'
const expectedScenarios = [
  {
    id: 'table', label: '파티션 테이블',
    nodes: ['fdisk', 'table'],
    paths: ['to-table'],
    notes: ['table-note'] as NoteId[],
    caption: 'fdisk는 디스크 앞쪽의 파티션 테이블을 만들고 고친다. 디스크를 나눈다는 것은 이 표에 파티션마다 디스크의 어디서 시작해 얼마만큼 차지하는지를 적는 일이다.',
    sources: [anchorConceptId],
  },
  {
    id: 'areas', label: '나뉜 구역',
    nodes: ['part1', 'part2'],
    paths: [] as string[],
    notes: ['size1-note', 'size2-note'] as NoteId[],
    caption: '파티션 테이블에 적힌 대로 나뉜 파티션 1과 파티션 2는 저마다 따로 된 디스크처럼 쓸 수 있다. 400GB와 600GB는 예로 든 크기다.',
    sources: [anchorConceptId],
  },
  {
    id: 'check', label: '점검',
    nodes: ['fsck', 'part1'],
    paths: ['to-part1'],
    notes: ['check-note'] as NoteId[],
    caption: '파티션 안에 만든 파일 시스템을 점검하고 필요하면 고치는 명령은 fsck다. fdisk는 파티션 테이블을 다룰 뿐 파일 시스템을 점검하지 않는다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 142]
const wideBox: [number, number, number, number] = [0, 0, 440, 142]

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
  return readBox(diagram().querySelector('[data-group="disk"]')!)
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

// 글자 크기 9인 글이 차지하는 상자. 반각 글자가 화면에서 더 넓게 그려지는 것을 생각해 폭을 1.15배로 잡는다.
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

// 점이 변 위에 놓인 노드. 칸끼리 맞닿은 변 위의 점은 두 칸에 걸치므로, 명령 노드를 먼저 찾는다.
function nodeAt(point: { x: number, y: number }) {
  return nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))
}

// 화살표의 양 끝이 지정한 두 노드의 변에 닿고, 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다.
function expectLine(line: Element, id: string, pair: [string, string]) {
  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  const label = textBox(diagram().querySelector('[data-group-label="disk"]')!, 'label')
  for (const segment of segments(line.getAttribute('d')!)) {
    for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
    expect(touches(segment, label), `${id} ↔ 둘째 디스크 라벨`).toBe(false)
  }
  const { start, end } = lineEnds(line)
  expect(nodeAt(start), `${id} 시작`).toBe(pair[0])
  expect(nodeAt(end), `${id} 끝`).toBe(pair[1])
}

// 보이는 곁말이 지정한 id·글·자리이고, viewBox와 둘레 테두리 안에서 노드·화살표·다른 곁말과 겹치지 않는다.
function expectNotes(ids: NoteId[], places: Record<NoteId, Note>, viewBox: [number, number, number, number]) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note')).sort()).toEqual([...ids].sort())
  const boxes = shown.map((note) => textBox(note, note.getAttribute('data-note')!))
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
    expect(boxesOutsideViewBox([box], viewBox), id).toEqual([])
    expect(contains(groupBox(), box), id).toBe(true)
    for (const node of nodeIds.map(nodeBox)) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const path of diagram().querySelectorAll('[data-path]')) {
      for (const segment of segments(path.getAttribute('d')!)) expect(touches(segment, box), `${id} ↔ 화살표`).toBe(false)
    }
    for (const other of boxes.filter((item) => item.id !== id)) expect(overlaps(box, other), `${id} ↔ ${other.id}`).toBe(false)
  }
}

async function expectScenario(
  scenario: typeof expectedScenarios[number],
  arrows: Record<string, string>,
  places: Record<NoteId, Note>,
  viewBox: [number, number, number, number],
  container: HTMLElement,
) {
  await selectScenario(scenario.label)

  for (const element of diagram().querySelectorAll('[data-node]')) {
    const id = element.getAttribute('data-node')!
    expect(element, id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  expect(diagram().querySelector('[data-group="disk"]')!.closest('[opacity]')).toBeNull()
  expect(diagram().querySelector('[data-group-label="disk"]')!.closest('[opacity]')).toBeNull()

  const shownPaths = Array.from(diagram().querySelectorAll('[data-path]'))
  expect(shownPaths.map((path) => path.getAttribute('data-path'))).toEqual(scenario.paths)
  for (const path of shownPaths) {
    const id = path.getAttribute('data-path')!
    expect(path).toHaveAttribute('d', arrows[id])
    expect(path).toHaveAttribute('stroke-width', '2')
    expect(path).toHaveAttribute('marker-end', `url(#${diagram().querySelector('marker')!.id})`)
    expect(path).toHaveClass('stroke-title')
    expect(path.closest('[opacity]')).toBeNull()
    expectLine(path, id, ends[id])
  }
  expectNotes(scenario.notes, places, viewBox)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다.
// 둘레 테두리는 세 칸만 담고, 그룹 라벨은 테두리 안에서 노드와 겹치지 않는다. 노드는 모두 회색이다.
function expectFits(viewBox: [number, number, number, number], group: Group) {
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
    expect(estimateTextWidth(label, 10) * 1.15 + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
  }
  for (let i = 0; i < nodeIds.length; i += 1) {
    for (let j = i + 1; j < nodeIds.length; j += 1) {
      expect(overlaps(nodeBox(nodeIds[i]), nodeBox(nodeIds[j])), `${nodeIds[i]} ↔ ${nodeIds[j]}`).toBe(false)
    }
  }

  const rect = diagram().querySelector('[data-group="disk"]')!
  expect(rect).toHaveAttribute('x', String(group.x))
  expect(rect).toHaveAttribute('y', String(group.y))
  expect(rect).toHaveAttribute('width', String(group.width))
  expect(rect).toHaveAttribute('height', String(group.height))
  for (const id of nodeIds) expect(contains(groupBox(), nodeBox(id)), id).toBe(cells.includes(id))
  for (const id of nodeIds.filter((item) => !cells.includes(item))) expect(overlaps(groupBox(), nodeBox(id)), id).toBe(false)

  const labelText = diagram().querySelector('[data-group-label="disk"]')!
  expect(labelText.textContent).toBe(groupLabels.disk)
  expect(labelText).toHaveAttribute('x', String(group.labelX))
  expect(labelText).toHaveAttribute('y', String(group.labelY))
  expect(labelText).toHaveAttribute('font-size', '9')
  const label = textBox(labelText, 'label')
  expect(contains(groupBox(), label)).toBe(true)
  for (const id of nodeIds) expect(overlaps(label, nodeBox(id)), id).toBe(false)
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

// 요점: 세 칸은 한 줄에 빈틈없이 이어져 있고 파티션 테이블이 맨 앞이다. 「파티션 테이블」에서 보이는 화살표는
// fdisk에서 파티션 테이블로 가는 것 하나다. 「점검」에서 보이는 화살표는 fsck에서 시작해 파티션 테이블이 아닌 칸에서 끝나고, fdisk는 흐리다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')

  const [table, part1, part2] = cells.map(nodeBox)
  expect(part1.y).toBe(table.y)
  expect(part2.y).toBe(table.y)
  expect(table.x + table.width).toBe(part1.x)
  expect(part1.x + part1.width).toBe(part2.x)

  await selectScenario('파티션 테이블')
  const tablePaths = Array.from(diagram().querySelectorAll('[data-path]'))
  expect(tablePaths).toHaveLength(1)
  expect(nodeAt(lineEnds(tablePaths[0]).start)).toBe('fdisk')
  expect(nodeAt(lineEnds(tablePaths[0]).end)).toBe('table')

  await selectScenario('점검')
  const checkPaths = Array.from(diagram().querySelectorAll('[data-path]'))
  expect(checkPaths).toHaveLength(1)
  expect(nodeAt(lineEnds(checkPaths[0]).start)).toBe('fsck')
  expect(nodeAt(lineEnds(checkPaths[0]).end)).not.toBe('table')
  expect(diagram().querySelector('[data-node="fdisk"]')).toHaveAttribute('opacity', '0.25')

  expect(body).toContain('`fdisk`는 이 파티션 테이블을 만들고 고치는 명령이다')
  expect(body).toContain('`fsck`는 파티션 안에 만든 파일 시스템을 점검하고')
  expect(body).toContain('파일 시스템에 문제가 없는지 점검할 때 쓰는 명령은 `fdisk`가 아니라 `fsck`다')
  expect(body).toContain('앞쪽 400GB를 파티션 1로, 나머지 600GB를 파티션 2로')
}

async function expectUniqueMarkers() {
  render(<><PartitionLayoutDiagram /><PartitionLayoutDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '점검' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(1)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('PartitionLayoutDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<PartitionLayoutDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<PartitionLayoutDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note], [data-link]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드와 화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<PartitionLayoutDiagram />)
    await expectScenario(scenario, tallArrows, tallNotes, tallBox, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<PartitionLayoutDiagram />)
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

  it('세 시나리오의 선명한 노드·화살표·곁말이 서로 다르다', () => {
    const keys = expectedScenarios.map(({ nodes, paths, notes }) => JSON.stringify([[...nodes].sort(), paths, [...notes].sort()]))
    expect(new Set(keys).size).toBe(expectedScenarios.length)
  })

  it('노드와 둘레 테두리가 280×142 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<PartitionLayoutDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 142')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox, tallGroup)
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
    render(<PartitionLayoutDiagram />)
    await expectArrowEnds()
  })

  it('fdisk는 파티션 테이블을, fsck는 파티션 안을 가리킨다', async () => {
    render(<PartitionLayoutDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<PartitionLayoutDiagram />)
    const text = visualsByTopicId[topicId].diagrams['partition-layout']
    const ids = partitionLayoutScenarios.map(({ id }) => id).sort()
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
      const scenario = partitionLayoutScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 파티션 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×142 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<PartitionLayoutDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 142')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·그룹 id 집합과 화살표·곁말 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<PartitionLayoutDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 142')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroups = shownIds('[data-group]', 'data-group').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')
      const tallNoteIds = await collectIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 142')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroups)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallGroups).toEqual(['disk'])
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(tallNoteIds).toEqual(Object.keys(noteLabels).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
      expect(await collectIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
    })

    it('노드와 둘레 테두리가 440×142 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<PartitionLayoutDiagram />)
      expectFits(wideBox, wideGroup)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<PartitionLayoutDiagram />)
      await expectScenario(scenario, wideArrows, wideNotes, wideBox, container)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
      render(<PartitionLayoutDiagram />)
      await expectArrowEnds()
    })

    it('fdisk는 파티션 테이블을, fsck는 파티션 안을 가리킨다', async () => {
      render(<PartitionLayoutDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<PartitionLayoutDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 142')
      await selectScenario('점검')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '점검' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['to-part1'])
      expect(paths[0]).toHaveAttribute('d', wideArrows['to-part1'])
      expect(shownIds('[data-note]', 'data-note')).toEqual(['check-note'])
    })
  })
})
