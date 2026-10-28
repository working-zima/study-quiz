import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { SlaacDiagram, slaacScenarios } from './SlaacDiagram'

const topicId = 'ip-protocol'
const anchorConceptId = `${topicId}.slaac`
const labels = {
  router: '라우터',
  host: '호스트 A',
  prefix: '2001:db8:0:1',
  iid: '1234:5678:9abc:def0',
}
const cellNoteLabels = {
  'prefix-name': '접두사',
  'iid-name': '인터페이스 식별자',
}
const noteLabels = {
  advert: '라우터 알림 · 접두사 2001:db8:0:1',
  address: '주소 2001:db8:0:1:1234:5678:9abc:def0',
}
type NoteId = keyof typeof noteLabels
type CellNoteId = keyof typeof cellNoteLabels

const nodeIds = Object.keys(labels)
// 칸 이름 곁말마다 그 이름이 붙는 칸.
const cellOf: Record<CellNoteId, string> = {
  'prefix-name': 'prefix',
  'iid-name': 'iid',
}

const tallArrows: Record<string, string> = {
  advert: 'M80 24 H200',
  'make-iid': 'M248 40 V100',
}
const wideArrows: Record<string, string> = {
  advert: 'M120 24 H320',
  'make-iid': 'M328 40 V76',
}
// 화살표마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  advert: ['router', 'host'],
  'make-iid': ['host', 'iid'],
}

type Note = { x: number, y: number, anchor: 'start' | 'middle' | 'end' }
const tallNotes: Record<NoteId, Note> = {
  advert: { x: 140, y: 56, anchor: 'middle' },
  address: { x: 140, y: 152, anchor: 'middle' },
}
const wideNotes: Record<NoteId, Note> = {
  advert: { x: 220, y: 52, anchor: 'middle' },
  address: { x: 220, y: 124, anchor: 'middle' },
}
const tallCellNotes: Record<CellNoteId, Note> = {
  'prefix-name': { x: 74, y: 92, anchor: 'middle' },
  'iid-name': { x: 190, y: 92, anchor: 'middle' },
}
const wideCellNotes: Record<CellNoteId, Note> = {
  'prefix-name': { x: 154, y: 68, anchor: 'middle' },
  'iid-name': { x: 270, y: 68, anchor: 'middle' },
}

const question = '서버 없이 IPv6 주소를 어떻게 만들까?'
const idleCaption = '라우터와 호스트 A가 같은 네트워크에 있다. 아래 두 칸은 호스트 A가 쓸 IPv6 주소의 앞부분인 접두사와 뒷부분인 인터페이스 식별자다. 버튼을 고르면 각 부분을 누가 정하는지 볼 수 있다.'
const legend = '화살표는 라우터 알림이 가는 길과 호스트 A가 스스로 만드는 부분이다. 아래 띠는 호스트 A의 IPv6 주소를 앞부분과 뒷부분으로 나눈 것이다.'
const figureName = 'IPv6 호스트가 라우터가 알린 접두사로 자기 주소를 만드는 도식'
const expectedScenarios = [
  {
    id: 'advertise', label: '접두사 알림',
    nodes: ['router', 'host', 'prefix'],
    paths: ['advert'],
    notes: ['advert'] as NoteId[],
    caption: '라우터가 라우터 알림으로 이 네트워크의 접두사 2001:db8:0:1을 알린다. 호스트 A는 이 접두사를 그대로 자기 주소의 앞부분으로 쓴다.',
    sources: [anchorConceptId],
  },
  {
    id: 'combine', label: '주소 만들기',
    nodes: ['host', 'prefix', 'iid'],
    paths: ['make-iid'],
    notes: ['address'] as NoteId[],
    caption: '호스트 A가 뒷부분인 인터페이스 식별자 1234:5678:9abc:def0을 스스로 만들어 접두사 뒤에 붙인다. 이렇게 만든 주소는 쓰기 전에 겹치지 않는지 확인하고, 주소를 나눠 주는 서버는 어디에도 없다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 160]
const wideBox: [number, number, number, number] = [0, 0, 440, 132]

function diagram() {
  return screen.getByRole('img', { name: '라우터와 호스트 A, 그리고 호스트 A의 IPv6 주소를 이루는 접두사 2001:db8:0:1과 인터페이스 식별자 1234:5678:9abc:def0' })
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

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
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

// 점이 변 위에 놓인 노드. 두 칸은 맞붙어 있으므로 맞닿은 변에서는 앞에 적은 노드를 고른다.
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

// 글이 viewBox 안에 있고 노드·선과 겹치지 않는다.
function expectTextClear(text: Element, id: string, width: number, height: number) {
  const box = textBox(text, id)
  expect(box.x, id).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width, id).toBeLessThanOrEqual(width)
  expect(box.y, id).toBeGreaterThanOrEqual(0)
  expect(box.y + box.height, id).toBeLessThanOrEqual(height)
  for (const node of nodeIds.map(nodeBox)) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
  for (const line of diagram().querySelectorAll('[data-path]')) {
    for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), `${id} ↔ 선`).toBe(false)
  }
}

// 칸 이름 곁말은 늘 보이고, 자기 칸의 가운데 위에 놓이며 그 칸과 같은 흐림을 따른다.
function expectCellNotes(places: Record<CellNoteId, Note>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-cell-note]'))
  expect(shown.map((note) => note.getAttribute('data-cell-note')).sort()).toEqual(Object.keys(cellNoteLabels).sort())
  for (const note of shown) {
    const id = note.getAttribute('data-cell-note')! as CellNoteId
    const cell = nodeBox(cellOf[id])
    expect(note.textContent).toBe(cellNoteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', places[id].anchor)
    expect(places[id].x).toBe(cell.x + cell.width / 2)
    expect(places[id].y).toBeLessThan(cell.y)
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note).toHaveAttribute('opacity', diagram().querySelector(`[data-node="${cellOf[id]}"]`)!.getAttribute('opacity')!)
    expectTextClear(note, id, width, height)
  }
}

// 보이는 곁말이 지정한 id·글·자리이고, viewBox 안에서 노드·선·칸 이름과 겹치지 않는다.
function expectNotes(ids: NoteId[], places: Record<NoteId, Note>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note')).sort()).toEqual([...ids].sort())
  const cellNotes = Array.from(diagram().querySelectorAll('[data-cell-note]'), (note) => textBox(note, note.getAttribute('data-cell-note')!))
  for (const note of shown) {
    const id = note.getAttribute('data-note')! as NoteId
    expect(note.textContent).toBe(noteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', places[id].anchor)
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note.closest('[opacity]')).toBeNull()
    expectTextClear(note, id, width, height)
    for (const cellNote of cellNotes) expect(overlaps(textBox(note, id), cellNote), `${id} ↔ ${cellNote.id}`).toBe(false)
  }
}

async function expectScenario(
  scenario: typeof expectedScenarios[number],
  arrows: Record<string, string>,
  places: Record<NoteId, Note>,
  cellPlaces: Record<CellNoteId, Note>,
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
  expectNotes(scenario.notes, places, width, height)
  expectCellNotes(cellPlaces, width, height)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다. 노드는 모두 회색이다.
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
    for (const path of diagram().querySelectorAll('[data-path]')) expectLine(path, path.getAttribute('data-path')!)
  }
}

function hops() {
  return Array.from(diagram().querySelectorAll('[data-path]'), (path) => [nodeAt(lineEnds(path).start)!, nodeAt(lineEnds(path).end)!])
}

function brightNodes() {
  return nodeIds.filter((id) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
}

// 요점: 접두사 칸은 라우터가 알린 접두사와 같고, 두 칸은 맞붙은 한 띠다. 호스트 A가 만드는 것은 뒷부분 칸뿐이고,
// 두 칸을 이으면 본문의 예시 주소가 된다. 주소를 나눠 주는 서버는 그림에 없다. 접두사와 주소는 개념 본문에 있다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const prefix = diagram().querySelector('[data-node="prefix"] text')!.textContent!
  const iid = diagram().querySelector('[data-node="iid"] text')!.textContent!
  const prefixBox = nodeBox('prefix')
  const iidBox = nodeBox('iid')

  expect(prefixBox.x + prefixBox.width).toBe(iidBox.x)
  expect(prefixBox.y).toBe(iidBox.y)
  expect(Object.values(labels).some((label) => label.includes('서버'))).toBe(false)
  expect(nodeIds.some((id) => id.includes('server'))).toBe(false)
  expect(`${prefix}:${iid}`.split(':')).toHaveLength(8)

  await selectScenario('접두사 알림')
  expect(hops()).toEqual([['router', 'host']])
  expect(diagram().querySelector('[data-note="advert"]')!.textContent).toBe(`라우터 알림 · 접두사 ${prefix}`)
  expect(diagram().querySelector('[data-node="iid"]')).toHaveAttribute('opacity', '0.25')
  expect(diagram().querySelector('[data-node="prefix"]')).toHaveAttribute('opacity', '1')
  const advertiseBright = brightNodes()

  await selectScenario('주소 만들기')
  expect(hops()).toEqual([['host', 'iid']])
  expect(hops().some(([, to]) => to === 'prefix')).toBe(false)
  expect(diagram().querySelector('[data-note="address"]')!.textContent).toBe(`주소 ${prefix}:${iid}`)
  expect(diagram().querySelector('[data-node="router"]')).toHaveAttribute('opacity', '0.25')
  expect(brightNodes()).not.toEqual(advertiseBright)

  expect(body).toContain(`라우터가 접두사로 앞 네 묶음 \`${prefix}\`을 알렸고, 호스트 A가 뒷부분 네 묶음 \`${iid}\`을 만들었다고 하자`)
  expect(body).toContain(`둘을 이어 \`${prefix}:${iid}\`을 자기 IPv6 주소로 쓴다`)
  expect(body).toContain('라우터는 그 네트워크의 접두사를 알려 주고, 호스트는 인터페이스 식별자를 스스로 만들어 접두사 뒤에 붙인다')
  expect(body).toContain('호스트가 사람의 설정도 서버도 없이 스스로 자기 주소를 만드는 것이다')
  expect(body).toContain('만든 주소는 쓰기 전에 겹치는지 확인한다')
}

async function expectUniqueMarkers() {
  render(<><SlaacDiagram /><SlaacDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '접두사 알림' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(1)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}
describe('SlaacDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<SlaacDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표·곁말 없이 칸 이름과 선택 안내가 나온다', () => {
    const { container } = render(<SlaacDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node], [data-cell-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expectCellNotes(tallCellNotes, 280, 160)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<SlaacDiagram />)
    await expectScenario(scenario, tallArrows, tallNotes, tallCellNotes, 280, 160, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<SlaacDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node], [data-cell-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드가 280×160 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<SlaacDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 160')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<SlaacDiagram />)
    await expectArrowEnds()
  })

  it('접두사는 라우터가 알린 것이고 호스트 A는 뒷부분만 만들어, 두 칸을 이은 것이 본문의 예시 주소다', async () => {
    render(<SlaacDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<SlaacDiagram />)
    const text = visualsByTopicId[topicId].diagrams.slaac
    const ids = slaacScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toBeUndefined()
    expect(text.notes).toEqual({ ...cellNoteLabels, ...noteLabels })
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([anchorConceptId])
    expect(text.label).toBe(figureName)
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = slaacScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 주소 자동 설정 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×132 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커와 칸 이름을 유지한다', () => {
      render(<SlaacDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 132')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
      expectCellNotes(wideCellNotes, 440, 132)
    })

    it('노드 id 집합과 화살표·곁말 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<SlaacDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 160')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallCellNoteIds = shownIds('[data-cell-note]', 'data-cell-note').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')
      const tallNoteIds = await collectIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 132')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-cell-note]', 'data-cell-note').sort()).toEqual(tallCellNoteIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(tallNoteIds).toEqual(Object.keys(noteLabels).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
      expect(await collectIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
    })

    it('모든 rect가 440×132 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<SlaacDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<SlaacDiagram />)
      await expectScenario(scenario, wideArrows, wideNotes, wideCellNotes, 440, 132, container)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<SlaacDiagram />)
      await expectArrowEnds()
    })

    it('접두사는 라우터가 알린 것이고 호스트 A는 뒷부분만 만들어, 두 칸을 이은 것이 본문의 예시 주소다', async () => {
      render(<SlaacDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<SlaacDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 160')
      await selectScenario('주소 만들기')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '주소 만들기' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['make-iid'])
      for (const path of paths) expect(path).toHaveAttribute('d', wideArrows[path.getAttribute('data-path')!])
      expect(diagram().querySelector('[data-note="address"]')).toHaveAttribute('x', String(wideNotes.address.x))
    })
  })
})
