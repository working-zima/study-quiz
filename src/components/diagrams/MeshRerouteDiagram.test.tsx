import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { MeshRerouteDiagram, meshRerouteScenarios } from './MeshRerouteDiagram'

const topicId = 'wireless-lan'
const anchorConceptId = `${topicId}.wireless-mesh`
const labels = {
  mesh01: 'MESH01',
  mesh02: 'MESH02',
  mesh03: 'MESH03',
  mesh04: 'MESH04',
}
const noteLabels = {
  off: '꺼짐',
  'via-02': 'MESH02를 거쳐 간다',
  'via-03': 'MESH03을 거쳐 간다',
}
type NoteId = keyof typeof noteLabels

const nodeIds = Object.keys(labels)
const linkIds = ['link-01-02', 'link-01-03', 'link-02-04', 'link-03-04']
const linkEnds: Record<string, [string, string]> = {
  'link-01-02': ['mesh01', 'mesh02'],
  'link-01-03': ['mesh01', 'mesh03'],
  'link-02-04': ['mesh02', 'mesh04'],
  'link-03-04': ['mesh03', 'mesh04'],
}

const tallLinks: Record<string, string> = {
  'link-01-02': 'M104 32 H48 V104',
  'link-01-03': 'M176 32 H232 V104',
  'link-02-04': 'M48 136 V208 H104',
  'link-03-04': 'M232 136 V208 H176',
}
const wideLinks: Record<string, string> = {
  'link-01-02': 'M60 72 V32 H184',
  'link-01-03': 'M60 104 V144 H184',
  'link-02-04': 'M256 32 H380 V72',
  'link-03-04': 'M256 144 H380 V104',
}
const tallArrows: Record<string, string> = {
  'hop-01-02': 'M104 32 H48 V104',
  'hop-02-04': 'M48 136 V208 H104',
  'hop-01-03': 'M176 32 H232 V104',
  'hop-03-04': 'M232 136 V208 H176',
}
const wideArrows: Record<string, string> = {
  'hop-01-02': 'M60 72 V32 H184',
  'hop-02-04': 'M256 32 H380 V72',
  'hop-01-03': 'M60 104 V144 H184',
  'hop-03-04': 'M256 144 H380 V104',
}
// 화살표마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'hop-01-02': ['mesh01', 'mesh02'],
  'hop-02-04': ['mesh02', 'mesh04'],
  'hop-01-03': ['mesh01', 'mesh03'],
  'hop-03-04': ['mesh03', 'mesh04'],
}

type Note = { x: number, y: number, anchor: 'start' | 'middle' | 'end' }
const tallNotes: Record<NoteId, Note> = {
  off: { x: 16, y: 98, anchor: 'start' },
  'via-02': { x: 140, y: 80, anchor: 'middle' },
  'via-03': { x: 140, y: 168, anchor: 'middle' },
}
const wideNotes: Record<NoteId, Note> = {
  off: { x: 220, y: 11, anchor: 'middle' },
  'via-02': { x: 220, y: 78, anchor: 'middle' },
  'via-03': { x: 220, y: 106, anchor: 'middle' },
}

const question = '메시 노드 하나가 꺼지면 프레임은 어디로 갈까?'
const idleCaption = 'MESH01~MESH04는 예로 붙인 메시 노드의 이름이다. MESH01과 MESH04는 서로 전파가 닿지 않아, 그 사이의 MESH02나 MESH03을 거쳐야 한다. 버튼을 고르면 MESH01이 MESH04에게 보낸 프레임이 평소와 MESH02가 꺼졌을 때 어느 노드를 거쳐 가는지 볼 수 있다.'
const legend = '가는 선은 이웃한 두 노드를 잇는 링크이고, 화살표는 MESH01이 보낸 프레임이 한 홉씩 건너가는 길이다.'
const figureName = '메시 노드 MESH01~MESH04를 이웃끼리 링크로 이어 두고, MESH01이 MESH04에게 보낸 프레임이 평소에는 MESH02를, MESH02가 꺼진 뒤에는 MESH03을 거쳐 가는 길을 보이는 도식'
const svgName = '서로 떨어진 MESH01과 MESH04 사이의 두 갈래에 MESH02와 MESH03을 두고, 이웃한 노드끼리 링크로 이은 그림'
const expectedScenarios = [
  {
    id: 'normal', label: '평소',
    nodes: ['mesh01', 'mesh02', 'mesh03', 'mesh04', 'link-01-02', 'link-01-03', 'link-02-04', 'link-03-04'],
    paths: ['hop-01-02', 'hop-02-04'],
    notes: ['via-02'] as NoteId[],
    caption: '경로 선택으로 MESH02를 거치는 경로를 골랐다. MESH01이 보낸 프레임은 MESH02로 한 홉, MESH02에서 MESH04로 또 한 홉을 건너 MESH04에 닿는다.',
    sources: [anchorConceptId],
  },
  {
    id: 'reroute', label: '노드가 꺼졌을 때',
    nodes: ['mesh01', 'mesh03', 'mesh04', 'link-01-03', 'link-03-04'],
    paths: ['hop-01-03', 'hop-03-04'],
    notes: ['off', 'via-03'] as NoteId[],
    caption: 'MESH02의 전원이 꺼져 MESH01과 MESH02 사이의 링크가 끊겼다. MESH01은 이를 알아채고 MESH03을 거치는 경로를 골라, 프레임은 두 홉을 건너 여전히 MESH04에 닿는다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 240]
const wideBox: [number, number, number, number] = [0, 0, 440, 176]

function diagram() {
  return screen.getByRole('img', { name: svgName })
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
function expectLine(line: Element, id: string, pair: [string, string]) {
  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  for (const segment of segments(line.getAttribute('d')!)) {
    for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
  }
  const { start, end } = lineEnds(line)
  expect([nodeAt(start), nodeAt(end)].sort(), id).toEqual([...pair].sort())
}

// 보이는 곁말이 지정한 id·글·자리이고, viewBox 안에서 노드·선·다른 곁말과 겹치지 않는다. 곁말은 흐려지지 않는다.
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
    for (const line of diagram().querySelectorAll('[data-link], [data-path]')) {
      for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), `${id} ↔ 선`).toBe(false)
    }
    for (const other of boxes.filter((item) => item.id !== id)) expect(overlaps(box, other), `${id} ↔ ${other.id}`).toBe(false)
  }
}

// 링크 넷은 늘 보이고 이웃한 두 노드를 잇는다.
function expectLinks(links: Record<string, string>, scenarioNodes: string[] | null) {
  expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
  for (const link of diagram().querySelectorAll('[data-link]')) {
    const id = link.getAttribute('data-link')!
    expect(link).toHaveAttribute('d', links[id])
    expect(link).toHaveClass('stroke-muted')
    expect(link).toHaveAttribute('opacity', scenarioNodes && !scenarioNodes.includes(id) ? '0.25' : '1')
    expectLine(link, id, linkEnds[id])
  }
}

async function expectScenario(
  scenario: typeof expectedScenarios[number],
  links: Record<string, string>,
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
  expectLinks(links, scenario.nodes)

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
    expect(estimateTextWidth(label, 10) * 1.15 + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
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
    for (const path of diagram().querySelectorAll('[data-path]')) {
      const id = path.getAttribute('data-path')!
      expectLine(path, id, ends[id])
      const { start, end } = lineEnds(path)
      expect(nodeAt(start), `${id} 시작`).toBe(ends[id][0])
      expect(nodeAt(end), `${id} 끝`).toBe(ends[id][1])
    }
  }
}

// 화살표마다 [출발 노드, 도착 노드].
function arrowHops() {
  return Array.from(diagram().querySelectorAll('[data-path]'), (path) => {
    const { start, end } = lineEnds(path)
    return [nodeAt(start), nodeAt(end)]
  })
}

function arrowTouches(id: string) {
  return Array.from(diagram().querySelectorAll('[data-path]')).some((path) =>
    segments(path.getAttribute('d')!).some((segment) => touches(segment, nodeBox(id))))
}

// 요점: 두 시나리오 모두 화살표가 MESH01에서 시작해 MESH04에서 끝나고, 한 화살표의 도착 노드가 다음 화살표의 출발 노드다.
// 평소에는 MESH02를, 노드가 꺼졌을 때는 MESH03을 거친다. 노드가 꺼졌을 때 MESH02는 흐리고 「꺼짐」이 보이며,
// MESH02에 닿는 링크도 흐려지고 어느 화살표도 MESH02에 닿지 않는다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')

  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    const hops = arrowHops()
    expect(hops[0][0], label).toBe('mesh01')
    expect(hops[hops.length - 1][1], label).toBe('mesh04')
    for (let i = 1; i < hops.length; i += 1) expect(hops[i][0], label).toBe(hops[i - 1][1])
  }

  await selectScenario('평소')
  expect(arrowHops()).toEqual([['mesh01', 'mesh02'], ['mesh02', 'mesh04']])
  expect(diagram().querySelector('[data-note="off"]')).toBeNull()

  await selectScenario('노드가 꺼졌을 때')
  expect(arrowHops()).toEqual([['mesh01', 'mesh03'], ['mesh03', 'mesh04']])
  expect(diagram().querySelector('[data-node="mesh02"]')).toHaveAttribute('opacity', '0.25')
  expect(diagram().querySelector('[data-note="off"]')!.textContent).toBe('꺼짐')
  expect(arrowTouches('mesh02')).toBe(false)
  for (const id of ['link-01-02', 'link-02-04']) expect(diagram().querySelector(`[data-link="${id}"]`), id).toHaveAttribute('opacity', '0.25')

  expect(body).toContain('`MESH01`은 `MESH02`·`MESH03`과 링크로 이어져 있고, `MESH04`도 `MESH02`·`MESH03`과 이어져 있지만')
  expect(body).toContain('`MESH01`에서 `MESH02`로 한 홉, `MESH02`에서 `MESH04`로 또 한 홉을 건너')
  expect(body).toContain('`MESH02`의 전원이 꺼지면 `MESH01`과 `MESH02` 사이의 링크가 끊긴다')
  expect(body).toContain('이번에는 `MESH03`을 거치는 경로를 고른다')
  expect(body).toContain('`MESH03`에서 `MESH04`로 두 홉을 건너 여전히 `MESH04`에 닿는다')
}

async function expectUniqueMarkers() {
  render(<><MeshRerouteDiagram /><MeshRerouteDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '노드가 꺼졌을 때' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(2)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('MeshRerouteDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<MeshRerouteDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 링크가 모두 선명하고 화살표·곁말 없이 선택 안내만 나온다', () => {
    const { container } = render(<MeshRerouteDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expectLinks(tallLinks, null)
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expectNotes([], tallNotes, 280, 240)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·링크·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<MeshRerouteDiagram />)
    await expectScenario(scenario, tallLinks, tallArrows, tallNotes, 280, 240, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<MeshRerouteDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(shownIds('[data-note]', 'data-note')).toEqual([])
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드가 280×240 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<MeshRerouteDiagram />)

    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 240')
    expect(diagram().parentElement).toHaveAttribute('class', '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    expectFits(tallBox)
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<MeshRerouteDiagram />)
    await expectArrowEnds()
  })

  it('두 시나리오 모두 MESH01에서 MESH04로 이어지고, 노드가 꺼졌을 때는 MESH02에 닿지 않고 MESH03을 거친다', async () => {
    render(<MeshRerouteDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<MeshRerouteDiagram />)
    const text = visualsByTopicId[topicId].diagrams['mesh-reroute']
    const ids = meshRerouteScenarios.map(({ id }) => id)
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id))
    expect(ids).toEqual(text.scenarios.map(({ id }) => id))
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toBeUndefined()
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([anchorConceptId])
    expect(text.label).toBe(figureName)
    expect(text.svgLabel).toBe(svgName)
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = meshRerouteScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 무선 메시 네트워크 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×176 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커와 링크를 유지한다', () => {
      render(<MeshRerouteDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 176')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
      expectLinks(wideLinks, null)
      expectNotes([], wideNotes, 440, 176)
    })

    it('노드·링크 id 집합과 화살표·곁말 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<MeshRerouteDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 240')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallLinkIds = shownIds('[data-link]', 'data-link').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')
      const tallNoteIds = await collectIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 176')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinkIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(tallNoteIds).toEqual(Object.keys(noteLabels).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
      expect(await collectIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
    })

    it('모든 rect가 440×176 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<MeshRerouteDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<MeshRerouteDiagram />)
      await expectScenario(scenario, wideLinks, wideArrows, wideNotes, 440, 176, container)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<MeshRerouteDiagram />)
      await expectArrowEnds()
    })

    it('두 시나리오 모두 MESH01에서 MESH04로 이어지고, 노드가 꺼졌을 때는 MESH02에 닿지 않고 MESH03을 거친다', async () => {
      render(<MeshRerouteDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<MeshRerouteDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 240')
      await selectScenario('노드가 꺼졌을 때')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '노드가 꺼졌을 때' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['hop-01-03', 'hop-03-04'])
      expect(paths[1]).toHaveAttribute('d', wideArrows['hop-03-04'])
      expect(diagram().querySelector('[data-note="via-03"]')).toHaveAttribute('x', String(wideNotes['via-03'].x))
    })
  })
})
