import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { MtuLimitDiagram, mtuLimitScenarios } from './MtuLimitDiagram'

const topicId = 'ip-protocol'
const anchorConceptId = `${topicId}.mtu`
const labels = {
  'packet-ok': 'IP 패킷 1500바이트',
  'packet-big': 'IP 패킷 4020바이트',
  host: '출발지 호스트',
  router: '라우터',
}
const noteLabels = {
  'pass-note': '그대로 지나감',
  'split-note': '나누어야 지나갈 수 있음',
}
const mtuLabel = 'MTU 1500바이트'
type NoteId = keyof typeof noteLabels

const nodeIds = Object.keys(labels)
const linkIds = ['link']

const tallLinks: Record<string, string> = {
  link: 'M140 96 V176',
}
const wideLinks: Record<string, string> = {
  link: 'M272 60 H360',
}
const tallArrows: Record<string, string> = {
  'load-ok': 'M76 40 V64',
  'load-big': 'M204 40 V64',
  pass: 'M140 96 V176',
}
const wideArrows: Record<string, string> = {
  'load-ok': 'M128 32 H144 V60 H160',
  'load-big': 'M128 88 H144 V60 H160',
  pass: 'M272 60 H360',
}
// 링크와 화살표마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  link: ['host', 'router'],
  'load-ok': ['packet-ok', 'host'],
  'load-big': ['packet-big', 'host'],
  pass: ['host', 'router'],
}

type Note = { x: number, y: number, anchor: 'start' | 'middle' | 'end' }
const tallNotes: Record<NoteId, Note> = {
  'pass-note': { x: 132, y: 140, anchor: 'end' },
  'split-note': { x: 132, y: 140, anchor: 'end' },
}
const wideNotes: Record<NoteId, Note> = {
  'pass-note': { x: 316, y: 96, anchor: 'middle' },
  'split-note': { x: 316, y: 96, anchor: 'middle' },
}
const tallMtu: Note = { x: 148, y: 140, anchor: 'start' }
const wideMtu: Note = { x: 316, y: 52, anchor: 'middle' }

const question = '이 패킷은 그대로 지나갈 수 있을까?'
const idleCaption = '출발지 호스트와 라우터 사이의 링크는 MTU가 1500바이트다. 출발지 호스트가 보내려는 IP 패킷은 헤더까지 쳐서 1500바이트짜리와 4020바이트짜리 둘이다. 버튼을 고르면 각 패킷이 이 링크를 그대로 지나갈 수 있는지 볼 수 있다.'
const legend = '가는 선은 링크, 화살표는 패킷이 가는 길이다. 출발지 호스트 곁의 상자는 출발지 호스트가 보내려는 패킷이다.'
const figureName = 'IP 패킷의 크기를 링크의 MTU와 견주는 도식'
const expectedScenarios = [
  {
    id: 'fits', label: 'MTU 이하',
    nodes: ['packet-ok', 'host', 'router', 'link'],
    paths: ['load-ok', 'pass'],
    notes: ['pass-note'] as NoteId[],
    caption: '1500바이트 패킷은 링크의 MTU 1500바이트를 넘지 않는다. MTU 이하인 패킷은 나누지 않고 그대로 프레임에 담겨 이 링크를 지나 라우터에 닿는다.',
    sources: [anchorConceptId],
  },
  {
    id: 'too-big', label: 'MTU 초과',
    nodes: ['packet-big', 'host', 'link'],
    paths: ['load-big'],
    notes: ['split-note'] as NoteId[],
    caption: '4020바이트 패킷은 MTU 1500바이트보다 커서 그대로는 이 링크를 지나갈 수 없다. 출발지 호스트가 MTU에 맞는 조각으로 나누어야 보낼 수 있고, IPv4에서 DF가 달려 나눌 수 없는 패킷은 버려진다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 216]
const wideBox: [number, number, number, number] = [0, 0, 440, 120]

function diagram() {
  return screen.getByRole('img', { name: '출발지 호스트가 1500바이트와 4020바이트인 IP 패킷을 MTU가 1500바이트인 링크로 라우터에게 보내려는 모습' })
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

// 점이 변 위에 놓인 노드.
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
  for (const line of diagram().querySelectorAll('[data-link], [data-path]')) {
    for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), `${id} ↔ 선`).toBe(false)
  }
}

// MTU 곁말은 늘 보이고 링크와 같은 흐림을 따른다.
function expectMtu(place: Note, width: number, height: number) {
  const mtu = diagram().querySelector('[data-link-note="mtu"]')!
  expect(mtu.textContent).toBe(mtuLabel)
  expect(mtu).toHaveAttribute('x', String(place.x))
  expect(mtu).toHaveAttribute('y', String(place.y))
  expect(mtu).toHaveAttribute('text-anchor', place.anchor)
  expect(mtu).toHaveAttribute('font-size', '9')
  expect(mtu).toHaveClass('fill-muted')
  expect(mtu).toHaveAttribute('opacity', diagram().querySelector('[data-link="link"]')!.getAttribute('opacity')!)
  expectTextClear(mtu, 'mtu', width, height)
}

// 보이는 곁말이 지정한 id·글·자리이고, viewBox 안에서 노드·선·MTU 곁말과 겹치지 않는다.
function expectNotes(ids: NoteId[], places: Record<NoteId, Note>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note')).sort()).toEqual([...ids].sort())
  const mtu = textBox(diagram().querySelector('[data-link-note="mtu"]')!, 'mtu')
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
    expect(overlaps(textBox(note, id), mtu), `${id} ↔ mtu`).toBe(false)
  }
}

async function expectScenario(
  scenario: typeof expectedScenarios[number],
  arrows: Record<string, string>,
  places: Record<NoteId, Note>,
  mtu: Note,
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
  expectNotes(scenario.notes, places, width, height)
  expectMtu(mtu, width, height)
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
  expect(diagram().querySelectorAll('rect')).toHaveLength(nodeIds.length)

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

// 링크는 늘 보이고 회색이며 두 노드를 잇는다. 노드는 모두 회색이고 도식 전용 두 색·초록·빨강·주황은 쓰지 않는다.
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

// 요점: MTU 이하인 패킷은 링크를 지나 라우터에 닿고 나눈다는 곁말이 없다.
// MTU보다 큰 패킷은 나누어야 한다는 곁말이 보이고, 출발지 호스트에서 라우터로 그대로 가는 화살표가 없으며 라우터가 흐려진다.
// 두 패킷의 크기와 그 결과는 개념 본문에 있다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')

  await selectScenario('MTU 이하')
  expect(hops()).toEqual([['packet-ok', 'host'], ['host', 'router']])
  expect(diagram().querySelector('[data-note="split-note"]')).toBeNull()
  expect(diagram().querySelector('[data-node="router"]')).toHaveAttribute('opacity', '1')
  expect(diagram().querySelector('[data-node="packet-big"]')).toHaveAttribute('opacity', '0.25')
  const fitsBright = brightNodes()

  await selectScenario('MTU 초과')
  expect(diagram().querySelector('[data-note="split-note"]')).not.toBeNull()
  expect(hops()).toEqual([['packet-big', 'host']])
  expect(hops().some(([from, to]) => from === 'host' && to === 'router')).toBe(false)
  expect(diagram().querySelector('[data-node="router"]')).toHaveAttribute('opacity', '0.25')
  expect(diagram().querySelector('[data-node="packet-ok"]')).toHaveAttribute('opacity', '0.25')
  expect(brightNodes()).not.toEqual(fitsBright)

  expect(body).toContain('헤더까지 친 크기가 1500바이트인 패킷은 MTU를 넘지 않으므로 그대로 지나가지만')
  expect(body).toContain('4020바이트인 패킷은 그대로는 지나갈 수 없다')
  expect(body).toContain('출발지 호스트가 MTU 1500바이트인 이더넷 링크로 라우터에게 IP 패킷을 보낸다고 하자')
  expect(body).toContain('DF가 달려 나눌 수 없는 패킷은 버린다')
}

async function expectUniqueMarkers() {
  render(<><MtuLimitDiagram /><MtuLimitDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'MTU 이하' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(2)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('MtuLimitDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<MtuLimitDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 링크가 모두 선명하고 화살표·곁말 없이 MTU와 선택 안내가 나온다', () => {
    const { container } = render(<MtuLimitDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
    for (const element of diagram().querySelectorAll('[data-node], [data-link], [data-link-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expectMtu(tallMtu, 280, 216)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<MtuLimitDiagram />)
    await expectScenario(scenario, tallArrows, tallNotes, tallMtu, 280, 216, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<MtuLimitDiagram />)
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

  it('노드가 280×216 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<MtuLimitDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 216')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  it('링크는 늘 보이고 회색이며 두 노드의 변에서 시작하고 끝난다', () => {
    render(<MtuLimitDiagram />)
    expectLinks(tallLinks)
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<MtuLimitDiagram />)
    await expectArrowEnds()
  })

  it('MTU 이하인 패킷만 링크를 지나 라우터에 닿고, 큰 패킷에는 나누어야 한다는 곁말이 붙는다', async () => {
    render(<MtuLimitDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<MtuLimitDiagram />)
    const text = visualsByTopicId[topicId].diagrams['mtu-limit']
    const ids = mtuLimitScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toBeUndefined()
    expect(text.notes).toEqual({ mtu: mtuLabel, ...noteLabels })
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([anchorConceptId])
    expect(text.label).toBe(figureName)
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = mtuLimitScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 MTU 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×120 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<MtuLimitDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 120')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
      expectMtu(wideMtu, 440, 120)
    })

    it('노드·링크 id 집합과 화살표·곁말 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<MtuLimitDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 216')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallLinkIds = shownIds('[data-link]', 'data-link').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')
      const tallNoteIds = await collectIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 120')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinkIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(tallNoteIds).toEqual(Object.keys(noteLabels).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
      expect(await collectIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
    })

    it('모든 rect가 440×120 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<MtuLimitDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<MtuLimitDiagram />)
      await expectScenario(scenario, wideArrows, wideNotes, wideMtu, 440, 120, container)
    })

    it('링크는 늘 보이고 회색이며 두 노드의 변에서 시작하고 끝난다', () => {
      render(<MtuLimitDiagram />)
      expectLinks(wideLinks)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<MtuLimitDiagram />)
      await expectArrowEnds()
    })

    it('MTU 이하인 패킷만 링크를 지나 라우터에 닿고, 큰 패킷에는 나누어야 한다는 곁말이 붙는다', async () => {
      render(<MtuLimitDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<MtuLimitDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 216')
      await selectScenario('MTU 초과')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: 'MTU 초과' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['load-big'])
      for (const path of paths) expect(path).toHaveAttribute('d', wideArrows[path.getAttribute('data-path')!])
      expect(diagram().querySelector('[data-note="split-note"]')).toHaveAttribute('x', String(wideNotes['split-note'].x))
    })
  })
})
