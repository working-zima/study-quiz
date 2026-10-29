import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { DefaultRouteDiagram, defaultRouteScenarios } from './DefaultRouteDiagram'

const topicId = 'routing'
const anchorConceptId = `${topicId}.default-route`
const labels = {
  'pkt-a': '목적지 192.0.2.4',
  'pkt-b': '목적지 198.51.100.7',
  'r1-dest': '192.0.2.0/24',
  'r1-gw': '바로 이어짐',
  'r1-if': 'eth0',
  'r2-dest': '0.0.0.0/0',
  'r2-gw': '203.0.113.2',
  'r2-if': 'eth1',
  'host-net': '네트워크 192.0.2.0',
  'router-2': '라우터 2',
}
const noteLabels = {
  'col-dest': '목적지 주소',
  'col-gw': '게이트웨이',
  'col-if': '인터페이스',
  'specific-why': '두 행에 모두 맞고 접두사가 더 긴 첫째 행',
  'specific-out': 'eth0으로 목적지 호스트에게 바로 넘긴다',
  'default-why': '첫째 행에 맞지 않아 디폴트 라우트만 맞는다',
  'default-out': 'eth1로 라우터 2에게 넘긴다',
}
type NoteId = keyof typeof noteLabels

const nodeIds = Object.keys(labels)
const row1 = ['r1-dest', 'r1-gw', 'r1-if']
const row2 = ['r2-dest', 'r2-gw', 'r2-if']
// 늘 보이는 곁말 — 열 이름.
const alwaysNotes: NoteId[] = ['col-dest', 'col-gw', 'col-if']

const tallArrows: Record<string, string> = {
  'to-host': 'M24 88 H12 V196 H24',
  'to-router-2': 'M192 136 V180',
}
const wideArrows: Record<string, string> = {
  'to-host': 'M264 80 H296',
  'to-router-2': 'M264 112 H296',
}
// 화살표마다 출발하는 행의 칸과 도착 노드.
const ends: Record<string, [string[], string]> = {
  'to-host': [row1, 'host-net'],
  'to-router-2': [row2, 'router-2'],
}

type Note = { x: number, y: number, anchor: 'start' | 'middle' | 'end' }
const tallNotes: Record<NoteId, Note> = {
  'col-dest': { x: 72, y: 64, anchor: 'middle' },
  'col-gw': { x: 168, y: 64, anchor: 'middle' },
  'col-if': { x: 240, y: 64, anchor: 'middle' },
  'specific-why': { x: 8, y: 236, anchor: 'start' },
  'specific-out': { x: 8, y: 252, anchor: 'start' },
  'default-why': { x: 8, y: 236, anchor: 'start' },
  'default-out': { x: 8, y: 252, anchor: 'start' },
}
const wideNotes: Record<NoteId, Note> = {
  'col-dest': { x: 72, y: 56, anchor: 'middle' },
  'col-gw': { x: 168, y: 56, anchor: 'middle' },
  'col-if': { x: 240, y: 56, anchor: 'middle' },
  'specific-why': { x: 24, y: 168, anchor: 'start' },
  'specific-out': { x: 24, y: 184, anchor: 'start' },
  'default-why': { x: 24, y: 168, anchor: 'start' },
  'default-out': { x: 24, y: 184, anchor: 'start' },
}

const question = '표에 맞는 행이 없으면 패킷은 어디로 갈까?'
const idleCaption = '라우터 1의 라우팅 테이블에 바로 이어진 네트워크로 가는 192.0.2.0/24 행과 디폴트 라우트 0.0.0.0/0 행이 있다. 버튼을 고르면 목적지가 192.0.2.4인 패킷과 198.51.100.7인 패킷이 저마다 어느 행을 따라 어디로 가는지 볼 수 있다.'
const legend = '위 상자 둘은 라우터 1이 받은 패킷이고, 가운데 칸들은 라우터 1의 라우팅 테이블이다. 화살표는 고른 행에 적힌 대로 패킷이 나가는 곳이다.'
const figureName = '라우터 1의 라우팅 테이블에 192.0.2.0/24 행과 디폴트 라우트 0.0.0.0/0 행이 있을 때, 목적지가 192.0.2.4인 패킷과 198.51.100.7인 패킷이 저마다 어느 행을 따라 어디로 가는지 보이는 도식'
const expectedScenarios = [
  {
    id: 'specific', label: '맞는 행이 있을 때',
    nodes: ['pkt-a', 'r1-dest', 'r1-gw', 'r1-if', 'host-net'],
    paths: ['to-host'],
    notes: ['specific-why', 'specific-out'] as NoteId[],
    caption: '목적지 192.0.2.4는 디폴트 라우트에도 맞지만, 앞 24비트가 같은 첫째 행 192.0.2.0/24의 접두사가 더 길다. 그래서 첫째 행대로 eth0을 거쳐 바로 이어진 네트워크 192.0.2.0의 목적지 호스트에게 넘어간다.',
    sources: [anchorConceptId],
  },
  {
    id: 'default', label: '맞는 행이 없을 때',
    nodes: ['pkt-b', 'r2-dest', 'r2-gw', 'r2-if', 'router-2'],
    paths: ['to-router-2'],
    notes: ['default-why', 'default-out'] as NoteId[],
    caption: '목적지 198.51.100.7은 앞 세 수가 192.0.2와 달라 첫째 행에 맞지 않는다. 맞는 행이 모든 주소에 맞는 디폴트 라우트뿐이라, 그 행의 게이트웨이 203.0.113.2, 곧 라우터 2에게 eth1로 넘긴다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 264]
const wideBox: [number, number, number, number] = [0, 0, 440, 196]

function diagram() {
  return screen.getByRole('img', { name: '목적지가 다른 두 패킷, 라우터 1의 라우팅 테이블 두 행, 네트워크 192.0.2.0과 라우터 2' })
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

// 점이 변 위에 놓인 노드를 모두 돌려준다.
function nodesAt(point: { x: number, y: number }) {
  return nodeIds.filter((id) => onEdge(point.x, point.y, nodeBox(id)))
}

// 보이는 곁말이 지정한 id·글·자리이고, viewBox 안에서 노드·선·다른 곁말과 겹치지 않는다.
function expectNotes(ids: NoteId[], places: Record<NoteId, Note>, width: number, height: number) {
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
    expect(box.x, id).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, id).toBeLessThanOrEqual(width)
    expect(box.y, id).toBeGreaterThanOrEqual(0)
    expect(box.y + box.height, id).toBeLessThanOrEqual(height)
    for (const node of nodeIds.map(nodeBox)) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const line of diagram().querySelectorAll('[data-path]')) {
      for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), `${id} ↔ 선`).toBe(false)
    }
    for (const other of boxes.filter((item) => item.id !== id)) expect(overlaps(box, other), `${id} ↔ ${other.id}`).toBe(false)
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
  expectNotes([...alwaysNotes, ...scenario.notes], places, width, height)
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
    // 반각 글자가 많은 라벨이라 화면에서 넓어지는 만큼도 들어가야 한다.
    expect(estimateTextWidth(label, 10) * 1.15 + 12, `${id} ${label} ×1.15`).toBeLessThanOrEqual(box.width)
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
    const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
    for (const path of diagram().querySelectorAll('[data-path]')) {
      const id = path.getAttribute('data-path')!
      for (const segment of segments(path.getAttribute('d')!)) {
        for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
      }
      const { start, end } = lineEnds(path)
      const from = nodesAt(start)
      expect(from, `${id} 시작`).toHaveLength(1)
      expect(ends[id][0], `${id} 시작`).toContain(from[0])
      expect(nodesAt(end), `${id} 끝`).toEqual([ends[id][1]])
    }
  }
}

// 요점: 「맞는 행이 있을 때」는 디폴트 라우트 행의 칸이 모두 흐리고 바로 이어진 네트워크로 간다. 「맞는 행이 없을 때」는 /24 행의 칸이 모두 흐리고,
// 보이는 화살표가 라우터 2에서 끝난다. 접두사 길이 0인 행은 어떤 주소에도 맞고, 192.0.2.4는 /24 행에도 맞지만 198.51.100.7은 맞지 않는다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const opacity = (id: string) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')
  const toBits = (address: string) => address.split('.').map((part) => Number(part).toString(2).padStart(8, '0')).join('')
  const matches = (destination: string, row: string) => {
    const [address, length] = row.split('/')
    return toBits(address).slice(0, Number(length)) === toBits(destination).slice(0, Number(length))
  }

  await selectScenario('맞는 행이 있을 때')
  for (const id of row2) expect(opacity(id), id).toBe('0.25')
  for (const id of row1) expect(opacity(id), id).toBe('1')
  let paths = Array.from(diagram().querySelectorAll('[data-path]'))
  expect(paths).toHaveLength(1)
  expect(nodesAt(lineEnds(paths[0]).end)).toEqual(['host-net'])

  await selectScenario('맞는 행이 없을 때')
  for (const id of row1) expect(opacity(id), id).toBe('0.25')
  for (const id of row2) expect(opacity(id), id).toBe('1')
  paths = Array.from(diagram().querySelectorAll('[data-path]'))
  expect(paths).toHaveLength(1)
  expect(nodesAt(lineEnds(paths[0]).end)).toEqual(['router-2'])

  const packetA = labels['pkt-a'].split(' ')[1]
  const packetB = labels['pkt-b'].split(' ')[1]
  expect(matches(packetA, labels['r2-dest'])).toBe(true)
  expect(matches(packetB, labels['r2-dest'])).toBe(true)
  expect(matches(packetA, labels['r1-dest'])).toBe(true)
  expect(matches(packetB, labels['r1-dest'])).toBe(false)
  expect(labels['r2-dest'].split('/')[1]).toBe('0')

  expect(body).toContain('목적지가 `192.0.2.4`인 패킷은 두 행에 모두 맞지만, 접두사가 24인 첫째 행이 0인 디폴트 라우트보다 길어 첫째 행대로 `eth0`을 거쳐 목적지 호스트에게 바로 넘어간다')
  expect(body).toContain('맞는 행이 디폴트 라우트뿐이므로 라우터 1은 이 패킷을 `eth1`로 라우터 2에게 넘긴다')
  expect(body).toContain('둘째 행은 디폴트 라우트 `0.0.0.0/0`이고, 게이트웨이가 `203.0.113.2`, 인터페이스가 `eth1`이다')
}

async function expectUniqueMarkers() {
  render(<><DefaultRouteDiagram /><DefaultRouteDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '맞는 행이 없을 때' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(1)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('DefaultRouteDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<DefaultRouteDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표 없이 열 이름과 선택 안내만 나온다', () => {
    const { container } = render(<DefaultRouteDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expectNotes(alwaysNotes, tallNotes, 280, 264)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<DefaultRouteDiagram />)
    await expectScenario(scenario, tallArrows, tallNotes, 280, 264, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<DefaultRouteDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...alwaysNotes, ...scenario.notes].sort())
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...alwaysNotes].sort())
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드가 280×264 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<DefaultRouteDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 264')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  it('화살표는 고른 행의 칸에서 나가 도착 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<DefaultRouteDiagram />)
    await expectArrowEnds()
  })

  it('맞는 행이 디폴트 라우트뿐일 때만 라우터 2로 보낸다', async () => {
    render(<DefaultRouteDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<DefaultRouteDiagram />)
    const text = visualsByTopicId[topicId].diagrams['default-route']
    const ids = defaultRouteScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toBeUndefined()
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([anchorConceptId, `${topicId}.longest-prefix-match`])
    expect(text.label).toBe(figureName)
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = defaultRouteScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 디폴트 라우트 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×196 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<DefaultRouteDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 196')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
      expectNotes(alwaysNotes, wideNotes, 440, 196)
    })

    it('노드 id 집합과 화살표·곁말 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<DefaultRouteDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 264')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')
      const tallNoteIds = await collectIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 196')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(tallNoteIds).toEqual(Object.keys(noteLabels).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
      expect(await collectIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
    })

    it('모든 rect가 440×196 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<DefaultRouteDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<DefaultRouteDiagram />)
      await expectScenario(scenario, wideArrows, wideNotes, 440, 196, container)
    })

    it('화살표는 고른 행의 칸에서 나가 도착 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<DefaultRouteDiagram />)
      await expectArrowEnds()
    })

    it('맞는 행이 디폴트 라우트뿐일 때만 라우터 2로 보낸다', async () => {
      render(<DefaultRouteDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<DefaultRouteDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 264')
      await selectScenario('맞는 행이 없을 때')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '맞는 행이 없을 때' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['to-router-2'])
      expect(paths[0]).toHaveAttribute('d', wideArrows['to-router-2'])
      expect(diagram().querySelector('[data-note="default-why"]')).toHaveAttribute('x', String(wideNotes['default-why'].x))
    })
  })
})
