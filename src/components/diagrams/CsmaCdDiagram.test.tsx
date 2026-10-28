import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { CsmaCdDiagram, csmaCdScenarios } from './CsmaCdDiagram'

const topicId = 'hub-switch-vlan'
const anchorConceptId = `${topicId}.csma-cd`
const labels = {
  hub: '허브',
  'host-a': '호스트 A',
  'host-b': '호스트 B',
  'host-c': '호스트 C',
  'host-d': '호스트 D',
}
const noteLabels = {
  'listen-a': '매체를 들어 봄',
  collision: '충돌',
  'jam-a': '잼 신호 보냄',
  'jam-b': '잼 신호 보냄',
  'wait-a': '짧게 기다림',
  'wait-b': '길게 기다림',
}
type NoteId = keyof typeof noteLabels

const nodeIds = Object.keys(labels)
const linkIds = ['cable-a', 'cable-b', 'cable-c', 'cable-d']

const tallLinks: Record<string, string> = {
  'cable-a': 'M38 56 V112',
  'cable-b': 'M106 56 V112',
  'cable-c': 'M174 56 V112',
  'cable-d': 'M242 56 V112',
}
const wideLinks: Record<string, string> = {
  'cable-a': 'M58 56 V96',
  'cable-b': 'M166 56 V96',
  'cable-c': 'M274 56 V96',
  'cable-d': 'M382 56 V96',
}
const tallArrows: Record<string, string> = {
  'from-a': 'M38 112 V56',
  'from-b': 'M106 112 V56',
}
const wideArrows: Record<string, string> = {
  'from-a': 'M58 96 V56',
  'from-b': 'M166 96 V56',
}
// 링크와 화살표마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'cable-a': ['hub', 'host-a'],
  'cable-b': ['hub', 'host-b'],
  'cable-c': ['hub', 'host-c'],
  'cable-d': ['hub', 'host-d'],
  'from-a': ['host-a', 'hub'],
  'from-b': ['host-b', 'hub'],
}

type Note = { x: number, y: number, anchor: 'start' | 'middle' }
const tallNotes: Record<NoteId, Note> = {
  'listen-a': { x: 38, y: 158, anchor: 'middle' },
  collision: { x: 72, y: 76, anchor: 'middle' },
  'jam-a': { x: 38, y: 158, anchor: 'middle' },
  'jam-b': { x: 106, y: 158, anchor: 'middle' },
  'wait-a': { x: 38, y: 158, anchor: 'middle' },
  'wait-b': { x: 106, y: 158, anchor: 'middle' },
}
const wideNotes: Record<NoteId, Note> = {
  'listen-a': { x: 58, y: 142, anchor: 'middle' },
  collision: { x: 112, y: 80, anchor: 'middle' },
  'jam-a': { x: 58, y: 142, anchor: 'middle' },
  'jam-b': { x: 166, y: 142, anchor: 'middle' },
  'wait-a': { x: 58, y: 142, anchor: 'middle' },
  'wait-b': { x: 166, y: 142, anchor: 'middle' },
}
// 호스트 아래에 붙는 곁말과 그 호스트.
const hostOfNote: Partial<Record<NoteId, string>> = {
  'listen-a': 'host-a', 'jam-a': 'host-a', 'jam-b': 'host-b', 'wait-a': 'host-a', 'wait-b': 'host-b',
}

const question = '둘이 같은 때 보내면 어떻게 될까?'
const idleCaption = '호스트 A~D가 허브에 이어져 반이중으로 매체 하나를 함께 쓴다. CSMA/CD는 보내기 전에 매체를 들어 보고, 충돌하면 잼 신호를 보낸 뒤 무작위로 기다렸다가 다시 보내는 규칙이다. 버튼을 차례로 고르면 A와 B가 보낼 때 무슨 일이 일어나는지 단계별로 볼 수 있다.'
const legend = '가는 선은 케이블, 화살표는 신호가 가는 길이다.'
const expectedScenarios = [
  {
    id: 'sense', label: '1. 듣기',
    nodes: ['hub', 'host-a', 'cable-a'],
    paths: [] as string[],
    notes: ['listen-a'] as NoteId[],
    caption: '보낼 프레임이 생긴 호스트 A는 먼저 매체를 들어 보고 다른 장치의 신호가 지나가는지 살핀다. 신호가 지나가고 있으면 그 신호가 끝나고 프레임 사이 간격만큼 더 기다렸다가 보내고, 신호가 없으면 보내기 시작한다.',
  },
  {
    id: 'collide', label: '2. 충돌',
    nodes: ['hub', 'host-a', 'host-b', 'cable-a', 'cable-b'],
    paths: ['from-a', 'from-b'],
    notes: ['collision', 'jam-a', 'jam-b'] as NoteId[],
    caption: 'A와 B가 둘 다 매체가 비었다고 보고 거의 같은 때 보내기 시작하면, 두 신호가 허브를 거친 매체 위에서 겹쳐 충돌이 난다. 충돌을 알아챈 A와 B는 곧바로 멈추지 않고 잼 신호를 조금 더 보내 상대도 충돌을 알아채게 한 뒤 전송을 멈춘다.',
  },
  {
    id: 'backoff', label: '3. 기다렸다 다시',
    nodes: ['hub', 'host-a', 'host-b', 'cable-a', 'cable-b'],
    paths: ['from-a'],
    notes: ['wait-a', 'wait-b'] as NoteId[],
    caption: 'A와 B는 저마다 무작위로 고른 시간만큼 기다렸다가 다시 보낸다. 이 그림에서는 A가 고른 시간이 짧아 A가 먼저 다시 보내고, 기다림을 마친 B는 A의 신호를 듣고 미룬다. 기다릴 시간이 그때그때 무작위라 프레임이 언제 보내질지 미리 알 수 없다.',
  },
]

function diagram() {
  return screen.getByRole('img', { name: '허브에 이은 호스트 A~D 가운데 A와 B가 매체를 들어 보고, 거의 같은 때 보내 충돌한 뒤, 저마다 기다렸다가 다시 보내는 모습' })
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

// 글자가 차지하는 상자. 높이는 글자 크기 9를 기준선 위로 잡는다.
function textBox(text: Element): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9)
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id: text.getAttribute('data-note')!, x: left, y: y - 9, width, height: 9 }
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

// 보이는 곁말이 지정한 id·글·자리이고, viewBox 안에서 노드·선·다른 곁말과 겹치거나 닿지 않는다.
function expectNotes(ids: NoteId[], places: Record<NoteId, Note>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note')).sort()).toEqual([...ids].sort())
  for (const note of shown) {
    const id = note.getAttribute('data-note')! as NoteId
    const box = textBox(note)
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
    for (const line of diagram().querySelectorAll('[data-link], [data-path]')) {
      for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), `${id} ↔ 선`).toBe(false)
    }
  }
  for (let i = 0; i < shown.length; i += 1) {
    for (let j = i + 1; j < shown.length; j += 1) {
      expect(overlaps(textBox(shown[i]), textBox(shown[j])), '곁말끼리').toBe(false)
    }
  }
}

// 아래 단언들은 배치에 묶이지 않는다. 세로형과 가로형이 같은 기대값으로 통과해야 한다.
async function expectScenario(
  scenario: typeof expectedScenarios[number],
  arrows: Record<string, string>,
  places: Record<NoteId, Note>,
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
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어간다. 그룹 박스는 없다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
  expect(diagram().querySelectorAll('[data-group]')).toHaveLength(0)

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

// 케이블 넷은 늘 보이고 회색이며 허브와 호스트를 잇는다. 노드는 모두 회색이고 도식 전용 두 색·초록·빨강·주황은 쓰지 않는다.
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

// 요점: 세 단계의 「보이는 화살표 + 곁말」이 서로 다르다. 듣기에는 화살표가 없고, 충돌에서만 화살표 둘이
// 함께 허브로 들어가며 「충돌」은 그 두 화살표 사이 허브 바로 아래에 있다. 기다렸다 다시 보낼 때는 화살표가 하나뿐이고,
// A와 B 곁의 기다림 곁말이 서로 다르다. 그 말들은 개념 본문에 있다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const seen: string[] = []
  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    const paths = shownIds('[data-path]', 'data-path')
    const notes = Array.from(diagram().querySelectorAll('[data-note]'), (note) => `${note.getAttribute('data-note')}:${note.textContent}`).sort()
    const signature = JSON.stringify({ paths: [...paths].sort(), notes })
    expect(seen, scenario.label).not.toContain(signature)
    seen.push(signature)

    const hops = Array.from(diagram().querySelectorAll('[data-path]'), (path) => [nodeAt(lineEnds(path).start)!, nodeAt(lineEnds(path).end)!])
    for (const [, to] of hops) expect(to, scenario.label).toBe('hub')
    if (scenario.id === 'collide') expect(hops.length, scenario.label).toBeGreaterThanOrEqual(2)
    else expect(hops.length, scenario.label).toBeLessThan(2)

    for (const note of diagram().querySelectorAll('[data-note]')) {
      const id = note.getAttribute('data-note')! as NoteId
      const host = hostOfNote[id]
      if (!host) continue
      const box = nodeBox(host)
      expect(Number(note.getAttribute('x')), id).toBe(box.x + box.width / 2)
      expect(Number(note.getAttribute('y')) - 9, id).toBeGreaterThanOrEqual(box.y + box.height)
    }
  }

  await selectScenario('2. 충돌')
  const [first, second] = Array.from(diagram().querySelectorAll('[data-path]'), (path) => lineEnds(path).end.x).sort((a, b) => a - b)
  const collision = textBox(diagram().querySelector('[data-note="collision"]')!)
  const hub = nodeBox('hub')
  expect(collision.x).toBeGreaterThan(first)
  expect(collision.x + collision.width).toBeLessThan(second)
  expect(collision.y).toBeGreaterThan(hub.y + hub.height)

  await selectScenario('3. 기다렸다 다시')
  const waitA = diagram().querySelector('[data-note="wait-a"]')!.textContent
  const waitB = diagram().querySelector('[data-note="wait-b"]')!.textContent
  expect(waitA).not.toBe(waitB)
  expect(waitA).not.toMatch(/\d/u)
  expect(waitB).not.toMatch(/\d/u)

  expect(body).toContain('매체를 들어 보고')
  expect(body).toContain('잼(jam) 신호')
  expect(body).toContain('짧게 기다린 쪽이 먼저 다시 보내고')
  expect(body).toContain('길게 기다린 쪽은')
  expect(body).toContain('미리 정확히 알 수 없다')
}

async function expectUniqueMarkers() {
  render(<><CsmaCdDiagram /><CsmaCdDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: 'CSMA/CD가 충돌에 대처하는 도식' })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '2. 충돌' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(2)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('CsmaCdDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<CsmaCdDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 다섯·케이블 넷이 모두 선명하고 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<CsmaCdDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·케이블·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<CsmaCdDiagram />)
    await expectScenario(scenario, tallArrows, tallNotes, 280, 168, container)
  })

  it('시나리오를 바꾸면 이전 화살표와 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<CsmaCdDiagram />)
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

  it('노드가 280×168 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<CsmaCdDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 168')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 168])
  })

  it('케이블은 늘 보이고 회색이며 허브와 호스트를 잇는다', () => {
    render(<CsmaCdDiagram />)
    expectLinks(tallLinks)
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<CsmaCdDiagram />)
    await expectArrowEnds()
  })

  it('듣기·충돌·기다렸다 다시의 세 단계가 화살표와 곁말로 서로 갈린다', async () => {
    render(<CsmaCdDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<CsmaCdDiagram />)
    const text = visualsByTopicId[topicId].diagrams['csma-cd']
    const ids = csmaCdScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toBeUndefined()
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([anchorConceptId])
    expect(text.label).toBe('CSMA/CD가 충돌에 대처하는 도식')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = csmaCdScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 CSMA/CD 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: 'CSMA/CD가 충돌에 대처하는 도식' })

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

    it('440×152 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<CsmaCdDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 152')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·케이블 id 집합과 화살표 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<CsmaCdDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 168')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallLinkIds = shownIds('[data-link]', 'data-link').sort()
      const tallPathIds = await collectPathIds()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 152')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinkIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(await collectPathIds()).toEqual(tallPathIds)
    })

    it('모든 rect가 440×152 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<CsmaCdDiagram />)
      expectFits([0, 0, 440, 152])
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<CsmaCdDiagram />)
      await expectScenario(scenario, wideArrows, wideNotes, 440, 152, container)
    })

    it('케이블은 늘 보이고 회색이며 허브와 호스트를 잇는다', () => {
      render(<CsmaCdDiagram />)
      expectLinks(wideLinks)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<CsmaCdDiagram />)
      await expectArrowEnds()
    })

    it('듣기·충돌·기다렸다 다시의 세 단계가 화살표와 곁말로 서로 갈린다', async () => {
      render(<CsmaCdDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<CsmaCdDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 168')
      await selectScenario('3. 기다렸다 다시')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '3. 기다렸다 다시' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['from-a'])
      for (const path of paths) expect(path).toHaveAttribute('d', wideArrows[path.getAttribute('data-path')!])
      expect(diagram().querySelector('[data-note="wait-b"]')).toHaveAttribute('x', String(wideNotes['wait-b'].x))
    })
  })
})
