import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ClientServerDiagram, clientServerScenarios } from './ClientServerDiagram'

const topicId = 'network-basics'
const anchorConceptId = `${topicId}.client-server`
const labels = {
  laptop: '노트북',
  equipment: '네트워크 장비',
  'web-server': '웹 사이트의 서버',
  'other-server': '다른 서버',
}
const noteLabels = {
  'laptop-client': '클라이언트',
  'request-web': '요청',
  'response-web': '응답',
  'web-server-role': '서버',
  'web-client-role': '클라이언트',
  'request-servers': '요청',
  'response-servers': '응답',
  'other-server-role': '서버',
}
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

const nodeIds = Object.keys(labels)

const tallPaths: Record<string, string> = {
  'web-request-1': 'M124 48 V112',
  'web-request-2': 'M100 144 V208',
  'web-response-1': 'M120 208 V144',
  'web-response-2': 'M156 112 V48',
  'servers-request-1': 'M120 208 V144',
  'servers-request-2': 'M164 144 V208',
  'servers-response-1': 'M180 208 V144',
  'servers-response-2': 'M100 144 V208',
}
const widePaths: Record<string, string> = {
  'web-request-1': 'M96 32 H160',
  'web-request-2': 'M256 32 H320',
  'web-response-1': 'M320 48 H256',
  'web-response-2': 'M160 48 H96',
  'servers-request-1': 'M320 48 H256',
  'servers-request-2': 'M192 56 V120',
  'servers-response-1': 'M224 120 V56',
  'servers-response-2': 'M256 32 H320',
}
// 화살표마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'web-request-1': ['laptop', 'equipment'],
  'web-request-2': ['equipment', 'web-server'],
  'web-response-1': ['web-server', 'equipment'],
  'web-response-2': ['equipment', 'laptop'],
  'servers-request-1': ['web-server', 'equipment'],
  'servers-request-2': ['equipment', 'other-server'],
  'servers-response-1': ['other-server', 'equipment'],
  'servers-response-2': ['equipment', 'web-server'],
}

const tallNotes: NotePlaces = {
  'laptop-client': { x: 200, y: 35, anchor: 'start' },
  'request-web': { x: 118, y: 84, anchor: 'end' },
  'response-web': { x: 162, y: 84, anchor: 'start' },
  'web-server-role': { x: 72, y: 254, anchor: 'middle' },
  'web-client-role': { x: 72, y: 254, anchor: 'middle' },
  'request-servers': { x: 158, y: 180, anchor: 'end' },
  'response-servers': { x: 186, y: 180, anchor: 'start' },
  'other-server-role': { x: 208, y: 254, anchor: 'middle' },
}
const wideNotes: NotePlaces = {
  'laptop-client': { x: 52, y: 70, anchor: 'middle' },
  'request-web': { x: 128, y: 26, anchor: 'middle' },
  'response-web': { x: 128, y: 62, anchor: 'middle' },
  'web-server-role': { x: 376, y: 70, anchor: 'middle' },
  'web-client-role': { x: 376, y: 70, anchor: 'middle' },
  'request-servers': { x: 186, y: 92, anchor: 'end' },
  'response-servers': { x: 230, y: 92, anchor: 'start' },
  'other-server-role': { x: 276, y: 139, anchor: 'start' },
}

const question = '누가 클라이언트이고 누가 서버일까?'
const idleCaption = '통신을 고르면 어느 호스트가 요청을 보내고 어느 호스트가 응답을 보내는지 볼 수 있다. 클라이언트와 서버는 둘 다 통신의 양 끝에 있는 호스트이고, 두 이름은 그 가운데 어느 쪽이 요청하고 어느 쪽이 응답하는지를 가른다.'
const legend = '상자는 노드, 화살표는 요청이나 응답이 건너가는 방향이다. 요청과 응답은 서로 반대 방향으로 간다.'
const expectedScenarios = [
  {
    id: 'web', label: '웹 페이지 열기',
    nodes: ['laptop', 'equipment', 'web-server'],
    paths: ['web-request-1', 'web-request-2', 'web-response-1', 'web-response-2'],
    notes: ['laptop-client', 'request-web', 'response-web', 'web-server-role'],
    caption: '노트북이 웹 사이트의 서버에 웹 페이지를 요청하고, 서버는 웹 페이지를 응답으로 돌려보낸다. 요청을 보내는 노트북이 클라이언트, 응답을 보내는 쪽이 서버다. 이 요청과 응답은 두 호스트 사이를 곧바로 오가지 않고 가운데의 네트워크 장비를 거쳐 오간다.',
  },
  {
    id: 'between-servers', label: '서버끼리',
    nodes: ['equipment', 'web-server', 'other-server'],
    paths: ['servers-request-1', 'servers-request-2', 'servers-response-1', 'servers-response-2'],
    notes: ['web-client-role', 'request-servers', 'response-servers', 'other-server-role'],
    caption: '웹 사이트의 서버도 다른 서버에 요청을 보낼 수 있다. 이 통신에서는 요청을 보내는 그 서버가 클라이언트이고, 응답을 보내는 다른 서버가 서버다. 클라이언트와 서버는 장치의 종류가 아니라 그 통신에서 맡은 역할의 이름이다.',
  },
]

function diagram() {
  return screen.getByRole('img', { name: '노트북과 웹 사이트의 서버와 다른 서버가 가운데의 네트워크 장비를 거쳐 이어진 네트워크' })
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

// 선분과 상자 사이의 가장 짧은 거리.
function distance(segment: Segment, box: SvgBox) {
  const dx = Math.max(Math.min(segment.x1, segment.x2) - (box.x + box.width), box.x - Math.max(segment.x1, segment.x2), 0)
  const dy = Math.max(Math.min(segment.y1, segment.y2) - (box.y + box.height), box.y - Math.max(segment.y1, segment.y2), 0)
  return Math.hypot(dx, dy)
}

// 두 선분이 같은 직선 위에서 길이를 갖고 겹치는가.
function sharesLine(a: Segment, b: Segment) {
  const span = (p: number, q: number, r: number, s: number) => Math.min(Math.max(p, q), Math.max(r, s)) - Math.max(Math.min(p, q), Math.min(r, s))
  if (a.y1 === a.y2 && b.y1 === b.y2) return a.y1 === b.y1 && span(a.x1, a.x2, b.x1, b.x2) > 0
  if (a.x1 === a.x2 && b.x1 === b.x2) return a.x1 === b.x1 && span(a.y1, a.y2, b.y1, b.y2) > 0
  return false
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

// 곁말이 붙은 노드 — 노드 오른쪽 8~16 자리에서 노드 높이 안에 있거나, 노드 아래 변에서 10~16 아래에서 노드 폭 안에 있다.
function nodeBesideNote(note: Element) {
  const box = textBox(note)
  const middleX = box.x + box.width / 2
  const middleY = box.y + box.height / 2
  return nodeIds.filter((id) => {
    const node = nodeBox(id)
    const right = box.x - (node.x + node.width)
    const below = box.y + box.height - (node.y + node.height)
    return (right >= 8 && right <= 16 && middleY > node.y && middleY < node.y + node.height)
      || (below >= 10 && below <= 16 && middleX > node.x && middleX < node.x + node.width)
  })
}

// 곁말에서 8 안쪽으로 지나는 화살표 — 곁말이 가리키는 화살표다.
function pathsBesideNote(note: Element) {
  const box = textBox(note)
  return Array.from(diagram().querySelectorAll('[data-path]'))
    .filter((path) => segments(path.getAttribute('d')!).some((segment) => distance(segment, box) <= 8))
    .map((path) => path.getAttribute('data-path')!)
}

// 요청이나 응답 화살표들이 이루는 사슬의 처음 노드와 마지막 노드. 앞 화살표가 끝난 노드에서 다음 화살표가 시작한다.
function chain(kind: 'request' | 'response') {
  const hops = Array.from(diagram().querySelectorAll('[data-path]')).filter((path) => path.getAttribute('data-path')!.includes(`-${kind}-`))
  const pairs = hops.map((hop) => [nodeAt(lineEnds(hop).start), nodeAt(lineEnds(hop).end)])
  for (let i = 1; i < pairs.length; i += 1) expect(pairs[i][0], `${kind} ${i}`).toBe(pairs[i - 1][1])
  return { from: pairs[0][0], via: pairs.slice(1).map(([start]) => start), to: pairs[pairs.length - 1][1] }
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
    for (const segment of pathSegments) expect(crossesInside(segment, box), `${id} ↔ 경로`).toBe(false)
  }
  for (let i = 0; i < shownNotes.length; i += 1) {
    for (let j = i + 1; j < shownNotes.length; j += 1) {
      expect(overlaps(textBox(shownNotes[i]), textBox(shownNotes[j])), '곁말끼리').toBe(false)
    }
  }
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 노드 라벨이 자기 상자 안에 들어간다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(4)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(label, 10) + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
  }
  for (const id of nodeIds) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 화살표 양 끝은 두 노드의 변에 닿고, 어떤 선분도 노드 안을 지나지 않는다. 한 시나리오 안의 화살표끼리는 같은 선 위에 겹치지 않는다.
async function expectPathEnds() {
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
    const shown = Array.from(diagram().querySelectorAll('[data-path]'))
    for (const path of shown) {
      const id = path.getAttribute('data-path')!
      for (const segment of segments(path.getAttribute('d')!)) {
        for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
      }
      const { start, end } = lineEnds(path)
      expect(nodeAt(start), `${id} 시작`).toBe(ends[id][0])
      expect(nodeAt(end), `${id} 끝`).toBe(ends[id][1])
    }
    for (let i = 0; i < shown.length; i += 1) {
      for (let j = i + 1; j < shown.length; j += 1) {
        for (const a of segments(shown[i].getAttribute('d')!)) {
          for (const b of segments(shown[j].getAttribute('d')!)) {
            expect(sharesLine(a, b), `${shown[i].getAttribute('data-path')} ↔ ${shown[j].getAttribute('data-path')}`).toBe(false)
          }
        }
      }
    }
  }
}

// 요청 사슬과 응답 사슬은 같은 두 호스트를 서로 반대로 잇고, 둘 다 가운데의 네트워크 장비를 거친다.
// 같은 노드(웹 사이트의 서버)가 웹 페이지를 열 때는 서버, 서버끼리 주고받을 때는 클라이언트 곁말을 갖는다.
// 요청·응답 곁말은 같은 이름의 화살표 곁에만 붙는다.
async function expectRoles() {
  for (const [label, client, server] of [
    ['웹 페이지 열기', 'laptop', 'web-server'],
    ['서버끼리', 'web-server', 'other-server'],
  ]) {
    await selectScenario(label)
    const request = chain('request')
    const response = chain('response')
    expect(request, label).toEqual({ from: client, via: ['equipment'], to: server })
    expect(response, label).toEqual({ from: request.to, via: ['equipment'], to: request.from })

    const notes = Array.from(diagram().querySelectorAll('[data-note]'))
    expect(notes.filter((note) => note.textContent === '클라이언트').map(nodeBesideNote), label).toEqual([[client]])
    expect(notes.filter((note) => note.textContent === '서버').map(nodeBesideNote), label).toEqual([[server]])
    for (const [word, kind] of [['요청', 'request'], ['응답', 'response']]) {
      const [note] = notes.filter((candidate) => candidate.textContent === word)
      const beside = pathsBesideNote(note)
      expect(beside, `${label} ${word}`).toHaveLength(1)
      expect(beside[0], `${label} ${word}`).toContain(`-${kind}-`)
    }
  }

  await selectScenario('웹 페이지 열기')
  const asServer = diagram().querySelector('[data-note="web-server-role"]')!
  await selectScenario('서버끼리')
  const asClient = diagram().querySelector('[data-note="web-client-role"]')!
  expect(nodeBesideNote(asClient)).toEqual(['web-server'])
  expect(asServer.getAttribute('x')).toBe(asClient.getAttribute('x'))
  expect(asServer.getAttribute('y')).toBe(asClient.getAttribute('y'))
}

async function expectUniqueMarkers() {
  render(<><ClientServerDiagram /><ClientServerDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: '요청과 응답으로 클라이언트와 서버를 가르는 도식' })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '웹 페이지 열기' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(4)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('ClientServerDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<ClientServerDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 넷이 모두 선명하고 화살표·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<ClientServerDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note], [data-link]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 선명하고 나머지는 흐려진다', async (scenario) => {
    const { container } = render(<ClientServerDiagram />)
    await expectScenario(scenario, tallNotes, tallPaths, 280, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<ClientServerDiagram />)
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

  it('노드 넷이 280×264 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<ClientServerDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 264')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 264])
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나거나 다른 화살표와 겹치지 않는다', async () => {
    render(<ClientServerDiagram />)
    await expectPathEnds()
  })

  it('요청과 응답은 같은 두 호스트를 반대로 잇고, 웹 사이트의 서버는 통신에 따라 서버와 클라이언트를 오간다', async () => {
    render(<ClientServerDiagram />)
    await expectRoles()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<ClientServerDiagram />)
    const text = visualsByTopicId[topicId].diagrams['client-server']
    const ids = clientServerScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toBeUndefined()
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([anchorConceptId, `${topicId}.computer-network`])
    expect(text.label).toBe('요청과 응답으로 클라이언트와 서버를 가르는 도식')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = clientServerScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 클라이언트와 서버 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: '요청과 응답으로 클라이언트와 서버를 가르는 도식' })

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
      render(<ClientServerDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 168')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드 id 집합과 화살표 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<ClientServerDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 264')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallPathIds = await collectPathIds()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 168')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallPaths).sort())
      expect(await collectPathIds()).toEqual(tallPathIds)
    })

    it('모든 rect가 440×168 viewBox 안에 있고 노드 라벨이 자기 상자 안에 들어간다', () => {
      render(<ClientServerDiagram />)
      expectFits([0, 0, 440, 168])
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보이고 곁말은 노드·경로와 겹치지 않는다', async (scenario) => {
      const { container } = render(<ClientServerDiagram />)
      await expectScenario(scenario, wideNotes, widePaths, 440, container)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나거나 다른 화살표와 겹치지 않는다', async () => {
      render(<ClientServerDiagram />)
      await expectPathEnds()
    })

    it('요청과 응답은 같은 두 호스트를 반대로 잇고, 웹 사이트의 서버는 통신에 따라 서버와 클라이언트를 오간다', async () => {
      render(<ClientServerDiagram />)
      await expectRoles()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<ClientServerDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 264')
      await selectScenario('서버끼리')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '서버끼리' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(expectedScenarios[1].paths)
      for (const path of paths) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(diagram().querySelector('[data-note="web-client-role"]')).toHaveAttribute('x', String(wideNotes['web-client-role'].x))
    })
  })
})
