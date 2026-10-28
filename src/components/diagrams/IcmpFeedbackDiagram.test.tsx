import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { IcmpFeedbackDiagram, icmpFeedbackScenarios } from './IcmpFeedbackDiagram'

const topicId = 'icmp'
const anchorConceptId = `${topicId}.icmp`
const labels = {
  'source': '출발지 호스트',
  'router': '라우터',
  'dest': '목적지 호스트',
}
const noteLabels = {
  'drop-note': '패킷을 버림',
  'error-note': 'ICMP 오류 메시지',
  'unreachable-note': '목적지에 닿지 못함',
  'request-note': '요청',
  'reply-note': '응답',
}
type NoteId = keyof typeof noteLabels

const nodeIds = Object.keys(labels)

const tallArrows: Record<string, string> = {
  'packet': 'M48 40 V104',
  'error': 'M96 104 V40',
  'request-1': 'M48 40 V104',
  'request-2': 'M48 136 V200',
  'reply-1': 'M96 200 V136',
  'reply-2': 'M96 104 V40',
}
const wideArrows: Record<string, string> = {
  'packet': 'M112 40 H172',
  'error': 'M172 56 H112',
  'request-1': 'M112 40 H172',
  'request-2': 'M268 40 H328',
  'reply-1': 'M328 56 H268',
  'reply-2': 'M172 56 H112',
}
// 화살표마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'packet': ['source', 'router'],
  'error': ['router', 'source'],
  'request-1': ['source', 'router'],
  'request-2': ['router', 'dest'],
  'reply-1': ['dest', 'router'],
  'reply-2': ['router', 'source'],
}

type Note = { x: number, y: number, anchor: 'start' | 'middle' | 'end' }
const tallNotes: Record<NoteId, Note> = {
  'drop-note': { x: 140, y: 124, anchor: 'start' },
  'error-note': { x: 104, y: 76, anchor: 'start' },
  'unreachable-note': { x: 140, y: 220, anchor: 'start' },
  'request-note': { x: 40, y: 76, anchor: 'end' },
  'reply-note': { x: 104, y: 76, anchor: 'start' },
}
const wideNotes: Record<NoteId, Note> = {
  'drop-note': { x: 220, y: 20, anchor: 'middle' },
  'error-note': { x: 142, y: 84, anchor: 'middle' },
  'unreachable-note': { x: 376, y: 20, anchor: 'middle' },
  'request-note': { x: 142, y: 28, anchor: 'middle' },
  'reply-note': { x: 142, y: 84, anchor: 'middle' },
}

const question = 'ICMP는 문제가 생기면 누구에게 알릴까?'
const idleCaption = '출발지 호스트가 보낸 패킷은 라우터를 거쳐 목적지 호스트로 간다. 버튼을 고르면 오류 보고 메시지가 누구에게 가는지, 질의 메시지가 어떻게 오가는지 볼 수 있다.'
const legend = '화살표는 패킷이나 ICMP 메시지가 가는 길이다. 목적지 쪽으로 가는 길과 출발지 쪽으로 돌아오는 길을 나란히 그렸다.'
const figureName = 'ICMP 메시지의 두 갈래를 보이는 도식'
const expectedScenarios = [
  {
    id: 'error', label: '오류 보고',
    nodes: ['source', 'router'],
    paths: ['packet', 'error'],
    notes: ['drop-note', 'error-note', 'unreachable-note'] as NoteId[],
    caption: '라우터가 패킷을 목적지 쪽으로 넘길 길을 찾지 못해 그 패킷을 버리고, 출발지 호스트에 ICMP 오류 메시지를 보낸다. 라우터는 버린 패킷을 다시 보내지 않는다.',
    sources: [anchorConceptId],
  },
  {
    id: 'query', label: '질의',
    nodes: ['source', 'router', 'dest'],
    paths: ['request-1', 'request-2', 'reply-1', 'reply-2'],
    notes: ['request-note', 'reply-note'] as NoteId[],
    caption: '출발지 호스트가 보낸 요청이 라우터를 거쳐 목적지 호스트에 닿고, 목적지 호스트가 응답을 돌려보낸다. 에코 요청과 에코 응답처럼, 질의 메시지는 네트워크의 상태를 알아보는 데 쓴다.',
    sources: [anchorConceptId],
  },
]

function diagram() {
  return screen.getByRole('img', { name: '출발지 호스트와 목적지 호스트 사이에 라우터가 있고, 패킷과 ICMP 메시지가 오가는 길을 보이는 모습' })
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

// 보이는 곁말이 지정한 id·글·자리이고, viewBox 안에서 노드·선과 겹치지 않는다.
function expectNotes(ids: NoteId[], places: Record<NoteId, Note>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note')).sort()).toEqual([...ids].sort())
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
    expect(box.x, id).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, id).toBeLessThanOrEqual(width)
    expect(box.y, id).toBeGreaterThanOrEqual(0)
    expect(box.y + box.height, id).toBeLessThanOrEqual(height)
    for (const node of nodeIds.map(nodeBox)) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const line of diagram().querySelectorAll('[data-path]')) {
      for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), `${id} ↔ 선`).toBe(false)
    }
  }
}

async function expectScenario(
  scenario: typeof expectedScenarios[number],
  arrows: Record<string, string>,
  places: Record<NoteId, Note>,
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

function nearestNode(note: Element) {
  const box = textBox(note, '')
  const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  const distance = (id: string) => {
    const node = nodeBox(id)
    return Math.hypot(node.x + node.width / 2 - center.x, node.y + node.height / 2 - center.y)
  }
  return [...nodeIds].sort((a, b) => distance(a) - distance(b))[0]
}

// 요점: 오류 보고는 출발지에서 라우터까지 간 패킷이 거기서 멈추고, ICMP 메시지가 라우터에서 출발지로 돌아온다.
// 목적지에 닿는 화살표도, 패킷을 다시 보내는 화살표도 없다. 질의는 요청이 목적지까지 가고 응답이 출발지로 돌아온다. 그 말들은 개념 본문에 있다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')

  await selectScenario('오류 보고')
  const errorHops = hops()
  expect(errorHops).toEqual([['source', 'router'], ['router', 'source']])
  expect(errorHops.flat()).not.toContain('dest')
  expect(errorHops.filter(([from]) => from === 'source')).toHaveLength(1)
  expect(nearestNode(diagram().querySelector('[data-note="drop-note"]')!)).toBe('router')
  expect(nearestNode(diagram().querySelector('[data-note="unreachable-note"]')!)).toBe('dest')
  expect(diagram().querySelector('[data-node="dest"]')).toHaveAttribute('opacity', '0.25')
  const errorBright = brightNodes()

  await selectScenario('질의')
  const queryHops = hops()
  expect(queryHops[0][0]).toBe('source')
  expect(queryHops[queryHops.length - 1][1]).toBe('source')
  for (let i = 1; i < queryHops.length; i += 1) expect(queryHops[i][0], '화살표가 이어진다').toBe(queryHops[i - 1][1])
  expect(queryHops.map(([, to]) => to)).toEqual(['router', 'dest', 'router', 'source'])
  expect(brightNodes()).not.toEqual(errorBright)

  expect(body).toContain('그 패킷을 버리고, 출발지 호스트에 목적지에 닿을 수 없다는 ICMP 오류 메시지를 보낸다')
  expect(body).toContain('한쪽이 요청을 보내면 받은 쪽이 응답을 돌려주는 짝으로 오가며, 네트워크의 상태를 알아보는 데 쓴다')
  expect(body).toContain('사라진 패킷을 다시 보내거나 망가진 패킷을 고치지 않고')
}

async function expectUniqueMarkers() {
  render(<><IcmpFeedbackDiagram /><IcmpFeedbackDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '질의' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(4)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('IcmpFeedbackDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<IcmpFeedbackDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<IcmpFeedbackDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<IcmpFeedbackDiagram />)
    await expectScenario(scenario, tallArrows, tallNotes, 280, 240, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<IcmpFeedbackDiagram />)
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

  it('노드가 280×240 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<IcmpFeedbackDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 240')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 240])
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<IcmpFeedbackDiagram />)
    await expectArrowEnds()
  })

  it('오류 보고는 라우터에서 출발지로 돌아오고, 질의는 목적지까지 갔다가 출발지로 돌아온다', async () => {
    render(<IcmpFeedbackDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<IcmpFeedbackDiagram />)
    const text = visualsByTopicId[topicId].diagrams['icmp-feedback']
    const ids = icmpFeedbackScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
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
      const scenario = icmpFeedbackScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 ICMP 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×96 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<IcmpFeedbackDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 96')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드 id 집합과 화살표 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<IcmpFeedbackDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 240')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 96')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
    })

    it('모든 rect가 440×96 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<IcmpFeedbackDiagram />)
      expectFits([0, 0, 440, 96])
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<IcmpFeedbackDiagram />)
      await expectScenario(scenario, wideArrows, wideNotes, 440, 96, container)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<IcmpFeedbackDiagram />)
      await expectArrowEnds()
    })

    it('오류 보고는 라우터에서 출발지로 돌아오고, 질의는 목적지까지 갔다가 출발지로 돌아온다', async () => {
      render(<IcmpFeedbackDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<IcmpFeedbackDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 240')
      await selectScenario('오류 보고')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '오류 보고' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['packet', 'error'])
      for (const path of paths) expect(path).toHaveAttribute('d', wideArrows[path.getAttribute('data-path')!])
      expect(diagram().querySelector('[data-note="error-note"]')).toHaveAttribute('x', String(wideNotes['error-note'].x))
    })
  })
})
