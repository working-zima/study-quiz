import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ColumnarFormatDiagram, columnarScenarios } from './ColumnarFormatDiagram'

const topicId = 'emr-glue-athena'
const anchorConceptId = `${topicId}.parquet-columnar-format`
const athenaPricingConceptId = `${topicId}.athena-encrypted-and-pay-per-query`
const labels = {
  query: '열 B만 쓰는 쿼리',
  'row-1': '행 1의 A·B·C',
  'row-2': '행 2의 A·B·C',
  'row-3': '행 3의 A·B·C',
  'col-a': '열 A의 값',
  'col-b': '열 B의 값',
  'col-c': '열 C의 값',
}
const groupLabels = { 'row-based': '행 기준', columnar: '열 기준 (Parquet)' }
type GroupId = keyof typeof groupLabels
const noteLabels = {
  scattered: '열 B가 세 행에 흩어짐',
  'only-b': '열 B만 읽음',
}
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

const tallPaths: Record<string, string> = {
  'query-col-b': 'M140 40 V136 H152',
}
const widePaths: Record<string, string> = {
  'query-col-b': 'M120 88 H144',
}
// 노드에서 노드로 가는 경로의 출발과 도착.
const ends: Record<string, [string, string]> = {
  'query-col-b': ['query', 'col-b'],
}

const tallNotes: NotePlaces = {
  scattered: { x: 70, y: 216, anchor: 'middle' },
  'only-b': { x: 210, y: 216, anchor: 'middle' },
}
const wideNotes: NotePlaces = {
  scattered: { x: 364, y: 168, anchor: 'middle' },
  'only-b': { x: 208, y: 168, anchor: 'middle' },
}

const allNodes = Object.keys(labels)
const rowBlocks = ['row-1', 'row-2', 'row-3']
const columnBlocks = ['col-a', 'col-b', 'col-c']
const managedNodes = [...rowBlocks, ...columnBlocks]
const question = '열 기준으로 담으면 쿼리가 읽는 곳이 어떻게 달라질까?'
const idleCaption = '저장 방식을 고르면 열 B의 값이 어디에 담기는지 볼 수 있다.'
const legend = '파랑: 저장된 데이터 블록 · 회색: 쿼리. 열 A·B·C와 행 1·2·3은 같은 표의 열과 행이다.'
const expectedScenarios = [
  {
    id: 'row-based', label: '행 기준',
    nodes: ['query', 'row-1', 'row-2', 'row-3'],
    paths: [] as string[],
    notes: ['scattered'],
    caption: '행 기준으로 담으면 같은 열의 값이 행마다 흩어진다. 열 B의 값이 세 블록에 다 들어 있다.',
    sources: [anchorConceptId],
  },
  {
    id: 'columnar', label: 'Parquet',
    nodes: ['query', 'col-b'],
    paths: ['query-col-b'],
    notes: ['only-b'],
    caption: 'Parquet는 같은 열을 한데 담아 필요한 열만 읽는다. Athena라면 요금이 붙는 스캔량이 준다.',
    sources: [anchorConceptId, athenaPricingConceptId],
  },
]

function diagram() {
  return screen.getByRole('img', { name: '행 기준과 열 기준(Parquet)으로 담은 같은 데이터' })
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
  return { id: text.getAttribute('data-note') ?? text.getAttribute('data-group-label')!, x: left, y: y - 9, width, height: 9 }
}

// 그룹 라벨이 차지하는 상자. 가로는 x + 10부터 라벨 폭만큼, 세로는 y + 6 ~ y + 15다.
function groupLabelBox(id: GroupId): SvgBox {
  const group = groupBox(id)
  return { id, x: group.x + 10, y: group.y + 6, width: estimateTextWidth(groupLabels[id], 9), height: 9 }
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

// 선분이 상자 안쪽을 지나는가. 변에 닿기만 하는 것은 세지 않는다.
function crossesInside(segment: ReturnType<typeof segments>[number], box: SvgBox) {
  const left = Math.min(segment.x1, segment.x2)
  const right = Math.max(segment.x1, segment.x2)
  const top = Math.min(segment.y1, segment.y2)
  const bottom = Math.max(segment.y1, segment.y2)
  if (top === bottom) return top > box.y && top < box.y + box.height && Math.min(right, box.x + box.width) > Math.max(left, box.x)
  return left > box.x && left < box.x + box.width && Math.min(bottom, box.y + box.height) > Math.max(top, box.y)
}

// 선분이 상자에 닿는가. 변에 닿는 것도 센다.
function touches(segment: ReturnType<typeof segments>[number], box: SvgBox) {
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

function pathEnds(id: string) {
  const list = segments(diagram().querySelector(`[data-path="${id}"]`)!.getAttribute('d')!)
  const first = list[0]
  const last = list[list.length - 1]
  return { start: { x: first.x1, y: first.y1 }, end: { x: last.x2, y: last.y2 } }
}

// 아래 단언들은 배치에 묶이지 않는다. 세로형과 가로형이 같은 기대값으로 통과해야 한다.
async function expectScenario(
  scenario: typeof expectedScenarios[number],
  places: NotePlaces,
  paths: Record<string, string>,
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

  const pathSegments = shownPaths.flatMap((path) => segments(path.getAttribute('d')!))
  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  const groupLabelBoxes = Array.from(diagram().querySelectorAll('[data-group-label]'), textBox)
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
    for (const label of groupLabelBoxes) expect(overlaps(box, label), `${id} ↔ ${label.id}`).toBe(false)
    for (const node of nodeBoxes) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const segment of pathSegments) expect(crossesInside(segment, box), `${id} ↔ 경로`).toBe(false)
  }
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 행 기준 장면에는 화살표가 없고, 쿼리 화살표는 Parquet 장면에만 있다.
async function expectArrowOnlyInColumnar() {
  await selectScenario('행 기준')
  expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
  await selectScenario('Parquet')
  expect(shownIds('[data-path]', 'data-path')).toEqual(['query-col-b'])
}

// 쿼리 화살표는 쿼리 상자의 변에서 나와 열 B의 값 상자의 왼쪽 변에서 끝난다.
async function expectArrowEndsOnColumnB() {
  await selectScenario('Parquet')
  const { start, end } = pathEnds('query-col-b')
  const columnB = nodeBox('col-b')

  expect(onEdge(start.x, start.y, nodeBox('query')), 'query-col-b 시작').toBe(true)
  expect(end.x, 'query-col-b 끝 x').toBe(columnB.x)
  expect(end.y, 'query-col-b 끝 y').toBeGreaterThanOrEqual(columnB.y)
  expect(end.y, 'query-col-b 끝 y').toBeLessThanOrEqual(columnB.y + columnB.height)
}

// 장면마다 흐려지는 블록: Parquet에서는 열 B 밖의 블록이, 행 기준에서는 열 블록 셋이 흐려진다.
async function expectDimmedBlocks() {
  await selectScenario('Parquet')
  for (const id of ['col-a', 'col-c', ...rowBlocks]) expect(diagram().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', '0.25')
  for (const id of ['query', 'col-b']) expect(diagram().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', '1')

  await selectScenario('행 기준')
  for (const id of columnBlocks) expect(diagram().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', '0.25')
  for (const id of ['query', ...rowBlocks]) expect(diagram().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', '1')
}

function expectMembershipAndColors() {
  for (const id of allNodes) {
    expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass(managedNodes.includes(id) ? 'stroke-diagram-managed' : 'stroke-disabled')
  }
  expect(diagram().querySelector('.stroke-diagram-resource')).toBeNull()
  const rowBased = groupBox('row-based')
  const columnar = groupBox('columnar')
  expect(overlaps(rowBased, columnar)).toBe(false)
  expect(boxesOutsideViewBox(rowBlocks.map(nodeBox), frameOf(rowBased))).toEqual([])
  expect(boxesOutsideViewBox(columnBlocks.map(nodeBox), frameOf(columnar))).toEqual([])
  expect(overlaps(nodeBox('query'), rowBased), 'query ↔ 행 기준').toBe(false)
  expect(overlaps(nodeBox('query'), columnar), 'query ↔ 열 기준').toBe(false)
}

// 노드끼리 잇는 경로는 두 노드의 변에 닿고, 어떤 선분도 노드 안을 지나지 않는다.
async function expectPathEnds() {
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
    for (const path of diagram().querySelectorAll('[data-path]')) {
      const id = path.getAttribute('data-path')!
      for (const segment of segments(path.getAttribute('d')!)) {
        for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
      }
      const [from, to] = ends[id]
      const { start, end } = pathEnds(id)
      expect(onEdge(start.x, start.y, nodeBox(from)), `${id} 시작`).toBe(true)
      expect(onEdge(end.x, end.y, nodeBox(to)), `${id} 끝`).toBe(true)
    }
  }
}

// 어느 경로 선분도 그룹 라벨이 차지하는 상자에 닿지 않는다.
async function expectPathsClearGroupLabels() {
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    const labelBoxes = (Object.keys(groupLabels) as GroupId[]).map(groupLabelBox)
    for (const path of diagram().querySelectorAll('[data-path]')) {
      for (const segment of segments(path.getAttribute('d')!)) {
        for (const box of labelBoxes) expect(touches(segment, box), `${path.getAttribute('data-path')} ↔ ${box.id}`).toBe(false)
      }
    }
  }
}

async function expectUniqueMarkers() {
  render(<><ColumnarFormatDiagram /><ColumnarFormatDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: '열 지향 형식 도식' })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'Parquet' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(1)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

// 관문 5·6: 모든 rect가 viewBox 안에 있고, 라벨은 상자 안에, 그룹 라벨은 자기 박스 오른쪽 끝 안에 들어간다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(9)
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
    const x = Number(groupLabel.getAttribute('x'))
    expect(x, wording).toBe(box.x + 10)
    expect(Number(groupLabel.getAttribute('y')), wording).toBe(box.y + 14)
    expect(x + estimateTextWidth(wording, 9), wording).toBeLessThanOrEqual(box.x + box.width)
    expect(x + estimateTextWidth(wording, 9), wording).toBeLessThanOrEqual(viewBox[2])
  }
}

describe('ColumnarFormatDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<ColumnarFormatDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 일곱이 모두 선명하고 경로·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<ColumnarFormatDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual([...allNodes].sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·경로·곁말만 보이고 나머지 노드는 흐려진다', async (scenario) => {
    const { container } = render(<ColumnarFormatDiagram />)
    await expectScenario(scenario, tallNotes, tallPaths, 280, container)
  })

  it('장면을 바꾸면 이전 경로·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<ColumnarFormatDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
    }
    await selectScenario('전체')

    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
    for (const { label } of expectedScenarios) expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'false')
  })

  it('관문 5·7: 그룹 둘과 노드 일곱이 280×224 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<ColumnarFormatDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 224')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 224])
  })

  it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 0..280 안에 있다', async (label) => {
    render(<ColumnarFormatDiagram />)
    await selectScenario(label)

    expect(diagram().querySelectorAll('[data-group]')).toHaveLength(2)
    for (const text of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(text.closest('[opacity]')).toBeNull()
    for (const text of diagram().querySelectorAll('[data-group-label], [data-note]')) {
      expect(text).toHaveAttribute('font-size', '9')
      const box = textBox(text)
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(280)
    }
  })

  it('행 기준 장면에는 화살표가 없고 쿼리 화살표는 Parquet 장면에만 있다', async () => {
    render(<ColumnarFormatDiagram />)
    await expectArrowOnlyInColumnar()
  })

  it('쿼리 화살표는 열 B의 값 상자의 왼쪽 변에서 끝난다', async () => {
    render(<ColumnarFormatDiagram />)
    await expectArrowEndsOnColumnB()
  })

  it('Parquet에서는 열 B 밖의 블록이, 행 기준에서는 열 블록 셋이 흐려진다', async () => {
    render(<ColumnarFormatDiagram />)
    await expectDimmedBlocks()
  })

  it('행 블록 셋은 행 기준 박스 안, 열 블록 셋은 열 기준 박스 안, 쿼리는 두 박스 밖에 있다', () => {
    render(<ColumnarFormatDiagram />)
    expectMembershipAndColors()
  })

  it('노드끼리 잇는 경로는 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<ColumnarFormatDiagram />)
    await expectPathEnds()
  })

  it('어느 경로 선분도 그룹 라벨 상자에 닿지 않는다', async () => {
    render(<ColumnarFormatDiagram />)
    await expectPathsClearGroupLabels()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 경로가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<ColumnarFormatDiagram />)
    const text = visualsByTopicId[topicId].diagrams.columnar
    const ids = columnarScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([anchorConceptId, athenaPricingConceptId])
    expect(text.label).toBe('열 지향 형식 도식')
    expect(text.svgLabel).toBe('행 기준과 열 기준(Parquet)으로 담은 같은 데이터')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = columnarScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: expected.sources })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
      expect([...wording.caption].length).toBeLessThanOrEqual(57)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) {
      expect(conceptIds).toContain(source)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 Apache Parquet 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: '열 지향 형식 도식' })

    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*/gu, ''))
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

    it('440×176 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<ColumnarFormatDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 176')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·그룹 id 집합과 시나리오로 나타나는 경로 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<ColumnarFormatDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 224')
      const tallNodes = ids('[data-node]', 'data-node')
      const tallGroups = ids('[data-group]', 'data-group')
      const tallPathIds = await collectPathIds()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 176')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(tallNodes).toEqual([...allNodes].sort())
      expect(ids('[data-group]', 'data-group')).toEqual(tallGroups)
      expect(tallGroups).toEqual(Object.keys(groupLabels).sort())
      expect(tallPathIds).toEqual(Object.keys(tallPaths).sort())
      expect(await collectPathIds()).toEqual(tallPathIds)
    })

    it('모든 rect가 440×176 viewBox 안에 있고 노드 라벨·그룹 라벨이 자기 상자 안에 들어간다', () => {
      render(<ColumnarFormatDiagram />)
      expectFits([0, 0, 440, 176])
    })

    it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 0..440 안에 있다', async (label) => {
      render(<ColumnarFormatDiagram />)
      await selectScenario(label)

      expect(diagram().querySelectorAll('[data-group]')).toHaveLength(2)
      for (const text of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(text.closest('[opacity]')).toBeNull()
      for (const text of diagram().querySelectorAll('[data-group-label], [data-note]')) {
        expect(text).toHaveAttribute('font-size', '9')
        const box = textBox(text)
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width).toBeLessThanOrEqual(440)
      }
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·경로·곁말·캡션을 보이고 곁말은 노드·그룹 라벨·경로와 겹치지 않는다', async (scenario) => {
      const { container } = render(<ColumnarFormatDiagram />)
      await expectScenario(scenario, wideNotes, widePaths, 440, container)
    })

    it('행 기준 장면에는 화살표가 없고 쿼리 화살표는 Parquet 장면에만 있다', async () => {
      render(<ColumnarFormatDiagram />)
      await expectArrowOnlyInColumnar()
    })

    it('쿼리 화살표는 열 B의 값 상자의 왼쪽 변에서 끝난다', async () => {
      render(<ColumnarFormatDiagram />)
      await expectArrowEndsOnColumnB()
    })

    it('Parquet에서는 열 B 밖의 블록이, 행 기준에서는 열 블록 셋이 흐려진다', async () => {
      render(<ColumnarFormatDiagram />)
      await expectDimmedBlocks()
    })

    it('행 블록 셋은 행 기준 박스 안, 열 블록 셋은 열 기준 박스 안, 쿼리는 두 박스 밖에 있다', () => {
      render(<ColumnarFormatDiagram />)
      expectMembershipAndColors()
    })

    it('노드끼리 잇는 경로는 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<ColumnarFormatDiagram />)
      await expectPathEnds()
    })

    it('어느 경로 선분도 그룹 라벨 상자에 닿지 않는다', async () => {
      render(<ColumnarFormatDiagram />)
      await expectPathsClearGroupLabels()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 경로가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<ColumnarFormatDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 224')
      await selectScenario('Parquet')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: 'Parquet' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['query-col-b'])
      for (const path of paths) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      for (const note of diagram().querySelectorAll('[data-note]')) {
        expect(note).toHaveAttribute('x', String(wideNotes[note.getAttribute('data-note')! as NoteId].x))
      }
    })
  })
})
