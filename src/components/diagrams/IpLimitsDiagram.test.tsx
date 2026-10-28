import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { IpLimitsDiagram, ipLimitsScenarios } from './IpLimitsDiagram'

const topicId = 'icmp'
const anchorConceptId = `${topicId}.ip-limits`
const labels = {
  'host-a': '호스트 A',
  'packet-1': '패킷 1',
  'packet-2': '패킷 2',
  'packet-3': '패킷 3',
  'host-b': '호스트 B',
}
const noteLabels = {
  'lost-note': '가는 길에 사라짐',
  'order-note': '닿은 차례 패킷 3, 패킷 1',
  'connect-note': '연결을 맺지 않음',
}
type NoteId = keyof typeof noteLabels

const nodeIds = Object.keys(labels)
const packetIds = ['packet-1', 'packet-2', 'packet-3']

const tallArrows: Record<string, string> = {
  'send-1': 'M52 40 V96',
  'send-2': 'M140 40 V96',
  'send-3': 'M228 40 V96',
  'arrive-1': 'M52 128 V184',
  'arrive-3': 'M228 128 V184',
}
const wideArrows: Record<string, string> = {
  'send-1': 'M112 72 H136 V24 H160',
  'send-2': 'M112 80 H160',
  'send-3': 'M112 88 H136 V136 H160',
  'arrive-1': 'M240 24 H288 V72 H336',
  'arrive-3': 'M240 136 H288 V88 H336',
}
// 화살표마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'send-1': ['host-a', 'packet-1'],
  'send-2': ['host-a', 'packet-2'],
  'send-3': ['host-a', 'packet-3'],
  'arrive-1': ['packet-1', 'host-b'],
  'arrive-3': ['packet-3', 'host-b'],
}

type Note = { x: number, y: number, anchor: 'start' | 'middle' | 'end' }
const tallNotes: Record<NoteId, Note> = {
  'lost-note': { x: 140, y: 152, anchor: 'middle' },
  'order-note': { x: 140, y: 236, anchor: 'middle' },
  'connect-note': { x: 140, y: 152, anchor: 'middle' },
}
const wideNotes: Record<NoteId, Note> = {
  'lost-note': { x: 200, y: 110, anchor: 'middle' },
  'order-note': { x: 432, y: 52, anchor: 'end' },
  'connect-note': { x: 288, y: 84, anchor: 'middle' },
}

const question = 'IP는 무엇을 보장하지 않을까?'
const idleCaption = '호스트 A가 다른 네트워크에 있는 호스트 B에게 패킷 1, 패킷 2, 패킷 3을 차례로 보낸다. 버튼을 고르면 패킷이 어떻게 닿을 수 있는지, IP가 보내기 전에 무엇을 하지 않는지 볼 수 있다.'
const legend = '상자 하나가 패킷 하나이고, 화살표는 패킷이 가는 길이다.'
const figureName = 'IP의 비신뢰성과 비연결형을 보이는 도식'
const expectedScenarios = [
  {
    id: 'unreliable', label: '비신뢰성',
    nodes: ['packet-1', 'packet-2', 'packet-3', 'host-b'],
    paths: ['arrive-1', 'arrive-3'],
    notes: ['lost-note', 'order-note'] as NoteId[],
    caption: '패킷 2는 가는 길에 사라지고, 패킷 3이 패킷 1보다 먼저 닿았다. IP는 패킷을 받았는지 확인하지 않으므로 패킷 2를 다시 보내지 않고, 닿은 차례를 바로잡지도 않는다.',
    sources: [anchorConceptId],
  },
  {
    id: 'connectionless', label: '비연결형',
    nodes: ['host-a', 'packet-1', 'packet-2', 'packet-3'],
    paths: ['send-1', 'send-2', 'send-3'],
    notes: ['connect-note'] as NoteId[],
    caption: '호스트 A는 보내기 전에 호스트 B와 연결을 맺지 않는다. IP는 패킷 하나하나를 다른 패킷과 관계없는 덩어리로 다루어, 세 패킷을 저마다 따로 보낸다.',
    sources: [anchorConceptId],
  },
]

function diagram() {
  return screen.getByRole('img', { name: '호스트 A가 패킷 1, 패킷 2, 패킷 3을 저마다 따로 호스트 B 쪽으로 보내는 모습' })
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

// 요점: 비신뢰성에서는 패킷 2에서 호스트 B로 가는 화살표가 없고(사라짐), 닿은 차례가 보낸 차례(1, 2, 3)와 다르다.
// 비연결형에서는 호스트 A에서 패킷마다 화살표가 따로 나가고, 호스트 A와 호스트 B를 잇는 화살표(연결)가 없다. 그 말들은 개념 본문에 있다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')

  await selectScenario('비신뢰성')
  const lossHops = hops()
  expect(lossHops.every(([, to]) => to === 'host-b')).toBe(true)
  expect(lossHops.map(([from]) => from)).toEqual(['packet-1', 'packet-3'])
  expect(lossHops.some(([from]) => from === 'packet-2')).toBe(false)
  expect(nearestNode(diagram().querySelector('[data-note="lost-note"]')!)).toBe('packet-2')
  expect(nearestNode(diagram().querySelector('[data-note="order-note"]')!)).toBe('host-b')
  const arrived = Array.from(diagram().querySelector('[data-note="order-note"]')!.textContent!.matchAll(/패킷 (\d)/gu), ([, n]) => Number(n))
  expect(arrived).toEqual([3, 1])
  expect(arrived).not.toEqual([...arrived].sort((a, b) => a - b))
  expect(arrived).not.toContain(2)
  const lossBright = brightNodes()

  await selectScenario('비연결형')
  const sendHops = hops()
  expect(sendHops.every(([from]) => from === 'host-a')).toBe(true)
  expect(sendHops.map(([, to]) => to)).toEqual(packetIds)
  expect(sendHops.some(([from, to]) => [from, to].includes('host-a') && [from, to].includes('host-b'))).toBe(false)
  expect(diagram().querySelector('[data-node="host-b"]')).toHaveAttribute('opacity', '0.25')
  expect(brightNodes()).not.toEqual(lossBright)

  expect(body).toContain('패킷 2가 사라지고 패킷 3이 패킷 1보다 먼저 닿을 수도 있다')
  expect(body).toContain('IP는 패킷 2를 다시 보내지 않고, 패킷 1과 패킷 3의 차례를 바로잡지도 않는다')
  expect(body).toContain('보내기 전에 호스트 B와 연결을 맺지 않고, 세 패킷을 저마다 따로 보낸다')
  expect(body).toContain('IP는 받는 쪽에게 패킷을 받았는지 확인하지 않고, 사라진 패킷을 다시 보내지도 않는다')
}

async function expectUniqueMarkers() {
  render(<><IpLimitsDiagram /><IpLimitsDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '비연결형' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(3)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('IpLimitsDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<IpLimitsDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<IpLimitsDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<IpLimitsDiagram />)
    await expectScenario(scenario, tallArrows, tallNotes, 280, 244, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<IpLimitsDiagram />)
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

  it('노드가 280×244 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<IpLimitsDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 244')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 244])
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<IpLimitsDiagram />)
    await expectArrowEnds()
  })

  it('비신뢰성은 패킷 2가 닿지 않고 차례가 바뀌며, 비연결형은 연결 없이 패킷마다 따로 나간다', async () => {
    render(<IpLimitsDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<IpLimitsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['ip-limits']
    const ids = ipLimitsScenarios.map(({ id }) => id).sort()
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
      const scenario = ipLimitsScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 비신뢰성·비연결형 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×160 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<IpLimitsDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 160')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드 id 집합과 화살표 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<IpLimitsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 244')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 160')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(['arrive-1', 'arrive-3', 'send-1', 'send-2', 'send-3'])
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
    })

    it('모든 rect가 440×160 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<IpLimitsDiagram />)
      expectFits([0, 0, 440, 160])
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<IpLimitsDiagram />)
      await expectScenario(scenario, wideArrows, wideNotes, 440, 160, container)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<IpLimitsDiagram />)
      await expectArrowEnds()
    })

    it('비신뢰성은 패킷 2가 닿지 않고 차례가 바뀌며, 비연결형은 연결 없이 패킷마다 따로 나간다', async () => {
      render(<IpLimitsDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<IpLimitsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 244')
      await selectScenario('비신뢰성')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '비신뢰성' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['arrive-1', 'arrive-3'])
      for (const path of paths) expect(path).toHaveAttribute('d', wideArrows[path.getAttribute('data-path')!])
      expect(diagram().querySelector('[data-note="order-note"]')).toHaveAttribute('x', String(wideNotes['order-note'].x))
    })
  })
})
