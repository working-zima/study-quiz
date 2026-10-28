import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ProtocolMatchDiagram, protocolMatchScenarios } from './ProtocolMatchDiagram'

const topicId = 'protocols-encapsulation'
const anchorConceptId = `${topicId}.protocol`
const labels = {
  'host-a': '호스트 A',
  'host-b': '호스트 B',
  'udp-header': 'UDP 헤더',
  'udp-data': '데이터',
  'tcp-header': 'TCP 헤더',
  'tcp-data': '데이터',
}
const noteLabels = {
  request: '요청',
  response: '응답',
  'a-http': 'HTTP',
  'b-http': 'HTTP',
  'a-ftp': 'FTP',
  'b-ftp': 'FTP',
  'udp-items': '항목 넷뿐',
  'tcp-items': '항목 열 개 넘음',
}
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number }>

const nodeIds = Object.keys(labels)
const hostIds = ['host-a', 'host-b']
// 헤더 칸마다 바로 뒤에 붙는 데이터 칸.
const dataOf: Record<string, string> = { 'udp-header': 'udp-data', 'tcp-header': 'tcp-data' }
// 호스트 아래에 붙는 프로토콜 곁말.
const protocolNotes: Record<string, [NoteId, NoteId]> = { web: ['a-http', 'b-http'], file: ['a-ftp', 'b-ftp'] }
// 항목 수 곁말이 붙는 헤더 칸.
const itemsOf: Record<string, string> = { 'udp-items': 'udp-header', 'tcp-items': 'tcp-header' }

const tallPaths: Record<string, string> = {
  'a-to-b': 'M112 24 H168',
  'b-to-a': 'M168 40 H112',
}
const widePaths: Record<string, string> = {
  'a-to-b': 'M160 24 H280',
  'b-to-a': 'M280 40 H160',
}
// 화살표마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'a-to-b': ['host-a', 'host-b'],
  'b-to-a': ['host-b', 'host-a'],
}

const tallNotes: NotePlaces = {
  request: { x: 140, y: 12 },
  response: { x: 140, y: 60 },
  'a-http': { x: 64, y: 64 },
  'b-http': { x: 216, y: 64 },
  'a-ftp': { x: 64, y: 64 },
  'b-ftp': { x: 216, y: 64 },
  'udp-items': { x: 48, y: 132 },
  'tcp-items': { x: 80, y: 188 },
}
const wideNotes: NotePlaces = {
  request: { x: 220, y: 12 },
  response: { x: 220, y: 60 },
  'a-http': { x: 100, y: 64 },
  'b-http': { x: 340, y: 64 },
  'a-ftp': { x: 100, y: 64 },
  'b-ftp': { x: 340, y: 64 },
  'udp-items': { x: 72, y: 132 },
  'tcp-items': { x: 272, y: 132 },
}

const question = '주고받는 두 호스트는 어떤 규칙을 따를까?'
const idleCaption = '프로토콜은 통신하는 양쪽이 정보를 어떻게 주고받을지 미리 합의해 둔 규칙이다. 위는 정보를 주고받는 두 호스트이고, 아래는 두 프로토콜이 데이터 앞에 붙이는 헤더다. 버튼을 고르면 양쪽이 어떤 프로토콜을 쓰는지, 프로토콜이 다르면 헤더가 어떻게 달라지는지 볼 수 있다.'
const legend = '상자는 호스트, 화살표는 정보가 오가는 방향, 호스트 아래 글자는 그 호스트가 따르는 프로토콜이다. 아래 이어 붙은 칸은 헤더와 데이터이고, 헤더 칸의 길이는 항목이 많고 적음만 견준 것이다.'
const expectedScenarios = [
  {
    id: 'web', label: '웹 페이지',
    nodes: ['host-a', 'host-b'],
    paths: ['a-to-b', 'b-to-a'],
    notes: ['request', 'response', 'a-http', 'b-http'],
    caption: '호스트 A의 웹 브라우저가 HTTP로 웹 페이지를 요청하면, 호스트 B의 웹 서버도 HTTP로 응답한다. 받는 쪽은 보내는 쪽이 어떤 규칙으로 데이터를 만들었는지 알아야 그 데이터를 제대로 읽을 수 있으므로, 통신은 같은 프로토콜을 쓰는 쪽끼리 이루어진다.',
  },
  {
    id: 'file', label: '파일',
    nodes: ['host-a', 'host-b'],
    paths: ['a-to-b', 'b-to-a'],
    notes: ['a-ftp', 'b-ftp'],
    caption: '파일을 주고받을 때는 HTTP 대신 FTP를 쓰고, 이때도 양쪽이 같은 FTP를 따른다. 웹 페이지에는 HTTP, 파일에는 FTP처럼 하려는 일마다 쓰는 프로토콜이 따로 있다.',
  },
  {
    id: 'header', label: '헤더 비교',
    nodes: ['udp-header', 'udp-data', 'tcp-header', 'tcp-data'],
    paths: [],
    notes: ['udp-items', 'tcp-items'],
    caption: 'TCP와 UDP는 둘 다 호스트 사이에서 데이터를 나르는 프로토콜이지만, UDP 헤더에는 항목이 넷뿐이고 TCP 헤더에는 열 개가 넘는 항목이 들어간다. 헤더에 어떤 항목을 담을지는 프로토콜이 정하기 때문이다. 보내는 쪽은 그 규칙대로 헤더를 채우고 받는 쪽은 같은 규칙대로 읽으므로, 프로토콜이 다르면 헤더에 담기는 내용도 달라진다.',
  },
]

function diagram() {
  return screen.getByRole('img', { name: '정보를 주고받는 호스트 A와 호스트 B, 그리고 UDP 헤더와 TCP 헤더를 각각 데이터 앞에 붙인 칸 둘' })
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

// 곁말이 가리키는 상자 바로 아래에 있는가 — 가운데가 상자의 가로 범위 안이고 글자 윗변이 상자 아래 변보다 아래다.
function sitsUnder(note: Element, box: SvgBox) {
  const x = Number(note.getAttribute('x'))
  return x > box.x && x < box.x + box.width && textBox(note).y >= box.y + box.height
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

  const shownPaths = Array.from(diagram().querySelectorAll('[data-path]'))
  expect(shownPaths.map((path) => path.getAttribute('data-path'))).toEqual(scenario.paths)
  for (const path of shownPaths) {
    expect(path).toHaveAttribute('d', paths[path.getAttribute('data-path')!])
    expect(path).toHaveAttribute('stroke-width', '2')
    expect(path).toHaveAttribute('marker-end', `url(#${diagram().querySelector('marker')!.id})`)
    expect(path).toHaveClass('stroke-title')
    expect(path.closest('[opacity]')).toBeNull()
  }

  const nodeBoxes = nodeIds.map(nodeBox)
  const shownNotes = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shownNotes.map((note) => note.getAttribute('data-note')).sort()).toEqual([...scenario.notes].sort())
  for (const note of shownNotes) {
    const id = note.getAttribute('data-note')! as NoteId
    expect(note.textContent).toBe(noteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', 'middle')
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    const box = textBox(note)
    expect(box.x, id).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, id).toBeLessThanOrEqual(width)
    expect(box.y, id).toBeGreaterThanOrEqual(0)
    for (const node of nodeBoxes) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const path of shownPaths) {
      for (const segment of segments(path.getAttribute('d')!)) expect(touches(segment, box), `${id} ↔ ${path.getAttribute('data-path')}`).toBe(false)
    }
  }
  const noteBoxes = shownNotes.map(textBox)
  for (let i = 0; i < noteBoxes.length; i++) {
    for (let j = i + 1; j < noteBoxes.length; j++) expect(overlaps(noteBoxes[i], noteBoxes[j]), `${noteBoxes[i].id} ↔ ${noteBoxes[j].id}`).toBe(false)
  }

  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고 라벨이 상자 안에 들어간다. 노드는 모두 회색이다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(node.querySelector('rect')).toHaveClass('stroke-disabled')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(label, 10) + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
  }

  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) expect(overlaps(boxes[i], boxes[j]), `${boxes[i].id} ↔ ${boxes[j].id}`).toBe(false)
  }
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 화살표 양 끝은 두 호스트의 변에 닿고, 어떤 선분도 노드 안을 지나지 않는다.
async function expectPathEnds() {
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    const nodeBoxes = nodeIds.map(nodeBox)
    for (const path of diagram().querySelectorAll('[data-path]')) {
      const id = path.getAttribute('data-path')!
      for (const segment of segments(path.getAttribute('d')!)) {
        for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
      }
      const { start, end } = lineEnds(path)
      expect(nodeAt(start), `${id} 시작`).toBe(ends[id][0])
      expect(nodeAt(end), `${id} 끝`).toBe(ends[id][1])
    }
  }
}

// 웹 페이지·파일: 두 호스트 아래 곁말이 같은 프로토콜이고, 두 시나리오의 프로토콜은 서로 다르다.
// 헤더 비교: 두 헤더 칸이 각자 데이터 칸 바로 앞에 붙어 있고, TCP 헤더 칸이 UDP 헤더 칸보다 넓다. 항목 수 곁말은 자기 헤더 칸 바로 아래에 있다.
async function expectKeyPoints() {
  const protocolOf: Record<string, string> = {}
  for (const id of ['web', 'file']) {
    const scenario = expectedScenarios.find((expected) => expected.id === id)!
    await selectScenario(scenario.label)
    const [aNote, bNote] = protocolNotes[id].map((note) => diagram().querySelector(`[data-note="${note}"]`)!)
    expect(sitsUnder(aNote, nodeBox('host-a')), `${id} A`).toBe(true)
    expect(sitsUnder(bNote, nodeBox('host-b')), `${id} B`).toBe(true)
    expect(aNote.textContent).toBe(bNote.textContent)
    protocolOf[id] = aNote.textContent!
  }
  expect(protocolOf.web).toBe('HTTP')
  expect(protocolOf.file).toBe('FTP')

  await selectScenario('헤더 비교')
  for (const [header, data] of Object.entries(dataOf)) {
    const headerBox = nodeBox(header)
    const dataBox = nodeBox(data)
    expect(headerBox.x + headerBox.width, header).toBe(dataBox.x)
    expect(headerBox.y, header).toBe(dataBox.y)
  }
  expect(nodeBox('tcp-header').width).toBeGreaterThan(nodeBox('udp-header').width)
  for (const [note, header] of Object.entries(itemsOf)) {
    expect(sitsUnder(diagram().querySelector(`[data-note="${note}"]`)!, nodeBox(header)), note).toBe(true)
  }
  // 헤더 칸끼리는 모서리 없이 이어 붙이고, 호스트만 모서리를 둥글린다.
  for (const id of nodeIds) {
    expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveAttribute('rx', hostIds.includes(id) ? '4' : '0')
  }
}

async function expectUniqueMarkers() {
  render(<><ProtocolMatchDiagram /><ProtocolMatchDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: '통신하는 양쪽이 따르는 프로토콜과 프로토콜마다 다른 헤더 도식' })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '웹 페이지' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(2)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('ProtocolMatchDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<ProtocolMatchDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 여섯이 모두 선명하고 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<ProtocolMatchDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보이고 나머지 노드는 흐려진다', async (scenario) => {
    const { container } = render(<ProtocolMatchDiagram />)
    await expectScenario(scenario, tallPaths, tallNotes, 280, container)
  })

  it('세 시나리오는 선명한 노드·화살표·곁말의 조합이 서로 다르다', () => {
    const signatures = expectedScenarios.map(({ nodes, paths, notes }) => JSON.stringify([nodes, paths, [...notes].sort()]))
    expect(new Set(signatures).size).toBe(expectedScenarios.length)
  })

  it('시나리오를 바꾸면 이전 화살표와 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<ProtocolMatchDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
    }
    await selectScenario('전체')

    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드가 280×200 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<ProtocolMatchDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 200')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 200])
  })

  it('화살표 양 끝은 두 호스트의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<ProtocolMatchDiagram />)
    await expectPathEnds()
  })

  it('양쪽 호스트의 프로토콜이 같고, TCP 헤더 칸이 UDP 헤더 칸보다 넓다', async () => {
    render(<ProtocolMatchDiagram />)
    await expectKeyPoints()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<ProtocolMatchDiagram />)
    const text = visualsByTopicId[topicId].diagrams['protocol-match']
    const ids = protocolMatchScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.notes).toEqual(noteLabels)
    expect(text.groups).toBeUndefined()
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([anchorConceptId])
    expect(text.label).toBe('통신하는 양쪽이 따르는 프로토콜과 프로토콜마다 다른 헤더 도식')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = protocolMatchScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 프로토콜 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: '통신하는 양쪽이 따르는 프로토콜과 프로토콜마다 다른 헤더 도식' })

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

    it('440×144 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<ProtocolMatchDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 144')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드 id 집합과 화살표 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<ProtocolMatchDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 200')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallPathIds = await collectPathIds()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 144')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallPaths).sort())
      expect(await collectPathIds()).toEqual(tallPathIds)
    })

    it('모든 rect가 440×144 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<ProtocolMatchDiagram />)
      expectFits([0, 0, 440, 144])
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<ProtocolMatchDiagram />)
      await expectScenario(scenario, widePaths, wideNotes, 440, container)
    })

    it('화살표 양 끝은 두 호스트의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<ProtocolMatchDiagram />)
      await expectPathEnds()
    })

    it('양쪽 호스트의 프로토콜이 같고, TCP 헤더 칸이 UDP 헤더 칸보다 넓다', async () => {
      render(<ProtocolMatchDiagram />)
      await expectKeyPoints()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<ProtocolMatchDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 200')
      await selectScenario('헤더 비교')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '헤더 비교' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      for (const note of diagram().querySelectorAll('[data-note]')) {
        const id = note.getAttribute('data-note')! as NoteId
        expect(note).toHaveAttribute('x', String(wideNotes[id].x))
        expect(note).toHaveAttribute('y', String(wideNotes[id].y))
      }
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual(['tcp-items', 'udp-items'])
    })
  })
})
