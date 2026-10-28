import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { FragmentationDiagram, fragmentationScenarios } from './FragmentationDiagram'

const topicId = 'ip-protocol'
const anchorConceptId = `${topicId}.fragmentation`
const labels = {
  'source-host': '출발지 호스트',
  packet: 'IP 패킷 4020바이트',
  router: '라우터',
  'frag-1': '조각 1 · 1500바이트',
  'frag-2': '조각 2 · 1500바이트',
  'frag-3': '조각 3 · 1060바이트',
  'dest-host': '목적지 호스트',
  merged: 'IP 패킷 4020바이트',
}
const noteLabels = {
  'split-note': '라우터가 조각 셋으로 나눔',
  'pass-note': '라우터는 합치지 않음',
  'merge-note': '목적지 호스트에서 합침',
}
const mtuLabel = 'MTU 1500바이트'
type NoteId = keyof typeof noteLabels

const nodeIds = Object.keys(labels)
const fragmentIds = ['frag-1', 'frag-2', 'frag-3']
const linkIds = ['link-1', 'link-2']

const tallLinks: Record<string, string> = {
  'link-1': 'M40 40 V104',
  'link-2': 'M40 136 V280',
}
const wideLinks: Record<string, string> = {
  'link-1': 'M112 72 H168',
  'link-2': 'M272 72 H328',
}
const tallArrows: Record<string, string> = {
  whole: 'M40 40 V104',
  pieces: 'M40 136 V280',
}
const wideArrows: Record<string, string> = {
  whole: 'M112 72 H168',
  pieces: 'M272 72 H328',
}
// 링크와 화살표마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'link-1': ['source-host', 'router'],
  'link-2': ['router', 'dest-host'],
  whole: ['source-host', 'router'],
  pieces: ['router', 'dest-host'],
}

type Note = { x: number, y: number, anchor: 'start' | 'middle' }
const tallNotes: Record<NoteId, Note> = {
  'split-note': { x: 140, y: 124, anchor: 'start' },
  'pass-note': { x: 140, y: 124, anchor: 'start' },
  'merge-note': { x: 208, y: 328, anchor: 'middle' },
}
const wideNotes: Record<NoteId, Note> = {
  'split-note': { x: 220, y: 32, anchor: 'middle' },
  'pass-note': { x: 220, y: 32, anchor: 'middle' },
  'merge-note': { x: 380, y: 102, anchor: 'middle' },
}
const tallMtu: Note = { x: 48, y: 212, anchor: 'start' }
const wideMtu: Note = { x: 300, y: 52, anchor: 'middle' }

const question = '큰 패킷은 어디서 나뉘고 어디서 합쳐질까?'
const idleCaption = '출발지 호스트가 헤더 20바이트와 데이터 4000바이트로 된 4020바이트짜리 IP 패킷을 보낸다. 출발지에서 라우터까지는 패킷을 통째로 실을 수 있지만, 라우터 다음 링크는 MTU가 1500바이트다. 버튼을 고르면 이 IPv4 패킷이 어디서 나뉘고 어디서 다시 합쳐지는지 볼 수 있다.'
const legend = '가는 선은 링크, 화살표는 패킷과 조각이 가는 길이다. 호스트·라우터 곁의 상자는 그곳에 있는 패킷과 조각이다.'
const figureName = '큰 IP 패킷이 나뉘고 다시 합쳐지는 곳을 보이는 도식'
const expectedScenarios = [
  {
    id: 'split', label: '나누기',
    nodes: ['source-host', 'packet', 'router', ...fragmentIds, ...linkIds],
    paths: ['whole', 'pieces'],
    notes: ['split-note'] as NoteId[],
    caption: 'IPv4에서는 라우터가 다음 링크의 MTU 1500바이트에 맞춰 패킷을 조각 셋으로 나눈다. 조각마다 헤더 20바이트가 붙어, 데이터 1480바이트·1480바이트·1040바이트를 담은 1500바이트·1500바이트·1060바이트 조각이 된다.',
    sources: [anchorConceptId],
  },
  {
    id: 'reassemble', label: '합치기',
    nodes: [...fragmentIds, 'dest-host', 'merged', 'link-2'],
    paths: ['pieces'],
    notes: ['pass-note', 'merge-note'] as NoteId[],
    caption: '라우터는 조각을 합치지 않고 하나하나 그대로 넘긴다. 조각들이 목적지 호스트에 모두 닿으면, 목적지 호스트가 조각들을 합쳐 원래의 4020바이트 패킷으로 되돌린다.',
    sources: [anchorConceptId],
  },
]

function diagram() {
  return screen.getByRole('img', { name: '출발지 호스트가 보낸 4020바이트 IP 패킷이 라우터를 지나 MTU가 1500바이트인 링크로 목적지 호스트까지 가며, 조각 셋으로 나뉘고 다시 합쳐지는 모습' })
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

// MTU 곁말은 늘 보이고 둘째 링크와 같은 흐림을 따른다.
function expectMtu(place: Note, width: number, height: number) {
  const mtu = diagram().querySelector('[data-link-note="mtu"]')!
  expect(mtu.textContent).toBe(mtuLabel)
  expect(mtu).toHaveAttribute('x', String(place.x))
  expect(mtu).toHaveAttribute('y', String(place.y))
  expect(mtu).toHaveAttribute('text-anchor', place.anchor)
  expect(mtu).toHaveAttribute('font-size', '9')
  expect(mtu).toHaveClass('fill-muted')
  expect(mtu).toHaveAttribute('opacity', diagram().querySelector('[data-link="link-2"]')!.getAttribute('opacity')!)
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

function center(box: SvgBox) {
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

function distance(a: { x: number, y: number }, b: { x: number, y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function brightNodes() {
  return nodeIds.filter((id) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
}

// 요점: 나누기에서 조각은 모두 라우터 뒤(목적지 쪽)에 있고 원래 패킷은 라우터 앞(출발지 쪽)에 있다.
// 합치기에서 다시 합친 패킷은 라우터가 아니라 목적지 호스트 곁에 있고, 라우터는 흐려지며 「합치지 않음」 곁말이 라우터 곁에 붙는다.
// 세로형은 위에서 아래로(y), 가로형은 왼쪽에서 오른쪽으로(x) 흐른다. 그 말들은 개념 본문에 있다.
async function expectPoint(axis: 'x' | 'y') {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const size = axis === 'x' ? 'width' : 'height'
  const router = () => nodeBox('router')

  await selectScenario('나누기')
  expect(hops()).toEqual([['source-host', 'router'], ['router', 'dest-host']])
  for (const id of fragmentIds) {
    expect(diagram().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', '1')
    expect(center(nodeBox(id))[axis], `${id}는 라우터 뒤`).toBeGreaterThan(router()[axis] + router()[size])
    expect(center(nodeBox(id))[axis], `${id}는 목적지 앞`).toBeLessThan(center(nodeBox('dest-host'))[axis])
  }
  expect(nodeBox('packet')[axis] + nodeBox('packet')[size], '원래 패킷은 라우터 앞').toBeLessThanOrEqual(router()[axis])
  const split = textBox(diagram().querySelector('[data-note="split-note"]')!, 'split-note')
  expect(distance(center(split), center(router()))).toBeLessThan(distance(center(split), center(nodeBox('dest-host'))))
  const splitBright = brightNodes()
  expect(splitBright).toContain('router')
  expect(splitBright).not.toContain('merged')

  await selectScenario('합치기')
  expect(hops()).toEqual([['router', 'dest-host']])
  expect(diagram().querySelector('[data-node="router"]')).toHaveAttribute('opacity', '0.25')
  expect(diagram().querySelector('[data-node="merged"]')).toHaveAttribute('opacity', '1')
  const merged = center(nodeBox('merged'))
  expect(distance(merged, center(nodeBox('dest-host')))).toBeLessThan(distance(merged, center(router())))
  expect(merged[axis], '합친 패킷은 라우터 뒤').toBeGreaterThan(router()[axis] + router()[size])
  const merge = textBox(diagram().querySelector('[data-note="merge-note"]')!, 'merge-note')
  expect(distance(center(merge), center(nodeBox('dest-host')))).toBeLessThan(distance(center(merge), center(router())))
  const pass = textBox(diagram().querySelector('[data-note="pass-note"]')!, 'pass-note')
  expect(distance(center(pass), center(router()))).toBeLessThan(distance(center(pass), center(nodeBox('dest-host'))))
  expect(brightNodes()).not.toEqual(splitBright)

  expect(body).toContain('경로 중간의 라우터도 패킷을 나눌 수 있다')
  expect(body).toContain('경로 중간의 라우터는 조각을 받아도 합치지 않고')
  expect(body).toContain('나뉜 조각은 목적지 호스트에 모두 닿은 뒤에 원래 패킷으로 합쳐진다')
  expect(body).toContain('헤더까지 친 조각의 크기는 1500바이트, 1500바이트, 1060바이트가 된다')
  expect(body).toContain('4020바이트짜리 IP 패킷')
  expect(body).toContain('라우터 다음 링크는 MTU가 1500바이트인 이더넷이다')
}

async function expectUniqueMarkers() {
  render(<><FragmentationDiagram /><FragmentationDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '나누기' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(2)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('FragmentationDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<FragmentationDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 링크가 모두 선명하고 화살표·곁말 없이 MTU와 선택 안내가 나온다', () => {
    const { container } = render(<FragmentationDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
    for (const element of diagram().querySelectorAll('[data-node], [data-link], [data-link-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expectMtu(tallMtu, 280, 336)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<FragmentationDiagram />)
    await expectScenario(scenario, tallArrows, tallNotes, tallMtu, 280, 336, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<FragmentationDiagram />)
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

  it('노드가 280×336 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<FragmentationDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 336')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 336])
  })

  it('링크는 늘 보이고 회색이며 두 노드의 변에서 시작하고 끝난다', () => {
    render(<FragmentationDiagram />)
    expectLinks(tallLinks)
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<FragmentationDiagram />)
    await expectArrowEnds()
  })

  it('조각은 라우터 뒤에서 생기고, 다시 합친 패킷은 라우터가 아니라 목적지 호스트 곁에 있다', async () => {
    render(<FragmentationDiagram />)
    await expectPoint('y')
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<FragmentationDiagram />)
    const text = visualsByTopicId[topicId].diagrams.fragmentation
    const ids = fragmentationScenarios.map(({ id }) => id).sort()
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
      const scenario = fragmentationScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 단편화 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×232 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<FragmentationDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 232')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
      expectMtu(wideMtu, 440, 232)
    })

    it('노드·링크 id 집합과 화살표·곁말 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<FragmentationDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 336')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallLinkIds = shownIds('[data-link]', 'data-link').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')
      const tallNoteIds = await collectIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 232')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinkIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(tallNoteIds).toEqual(Object.keys(noteLabels).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
      expect(await collectIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
    })

    it('모든 rect가 440×232 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<FragmentationDiagram />)
      expectFits([0, 0, 440, 232])
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<FragmentationDiagram />)
      await expectScenario(scenario, wideArrows, wideNotes, wideMtu, 440, 232, container)
    })

    it('링크는 늘 보이고 회색이며 두 노드의 변에서 시작하고 끝난다', () => {
      render(<FragmentationDiagram />)
      expectLinks(wideLinks)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<FragmentationDiagram />)
      await expectArrowEnds()
    })

    it('조각은 라우터 뒤에서 생기고, 다시 합친 패킷은 라우터가 아니라 목적지 호스트 곁에 있다', async () => {
      render(<FragmentationDiagram />)
      await expectPoint('x')
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<FragmentationDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 336')
      await selectScenario('합치기')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '합치기' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['pieces'])
      for (const path of paths) expect(path).toHaveAttribute('d', wideArrows[path.getAttribute('data-path')!])
      expect(diagram().querySelector('[data-note="merge-note"]')).toHaveAttribute('x', String(wideNotes['merge-note'].x))
    })
  })
})
