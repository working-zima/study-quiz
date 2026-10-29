import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { LinkStateDiagram, linkStateScenarios } from './LinkStateDiagram'

const topicId = 'routing'
const anchorConceptId = `${topicId}.ospf`
const labels = {
  'router-1': '라우터 1',
  'router-2': '라우터 2',
  'router-3': '라우터 3',
  'router-4': '라우터 4',
}
const noteLabels = {
  'cost-1-2': '비용 1',
  'cost-1-3': '비용 1',
  'cost-2-4': '비용 1',
  'cost-3-4': '비용 1',
  'cost-1-4': '비용 3',
  'same-map': '넷 모두 같은 지도를 갖는다',
  'via-2-sum': '라우터 2를 거치면 1 + 1 = 2',
  'via-3-sum': '라우터 3을 거쳐도 1 + 1 = 2',
}
type NoteId = keyof typeof noteLabels

// 링크마다의 비용은 시나리오와 상관없이 늘 보인다.
const alwaysNotes: NoteId[] = ['cost-1-2', 'cost-1-3', 'cost-2-4', 'cost-3-4', 'cost-1-4']

const nodeIds = Object.keys(labels)
const linkIds = ['link-1-2', 'link-1-3', 'link-2-4', 'link-3-4', 'link-1-4']
const linkEnds: Record<string, [string, string]> = {
  'link-1-2': ['router-1', 'router-2'],
  'link-1-3': ['router-1', 'router-3'],
  'link-2-4': ['router-2', 'router-4'],
  'link-3-4': ['router-3', 'router-4'],
  'link-1-4': ['router-1', 'router-4'],
}
// 링크마다 그 비용을 적은 곁말.
const costNoteOf: Record<string, NoteId> = {
  'link-1-2': 'cost-1-2',
  'link-1-3': 'cost-1-3',
  'link-2-4': 'cost-2-4',
  'link-3-4': 'cost-3-4',
  'link-1-4': 'cost-1-4',
}

const tallLinks: Record<string, string> = {
  'link-1-2': 'M108 24 H48 V104',
  'link-1-3': 'M172 24 H232 V104',
  'link-2-4': 'M48 136 V216 H108',
  'link-3-4': 'M232 136 V216 H172',
  'link-1-4': 'M140 40 V200',
}
const wideLinks: Record<string, string> = {
  'link-1-2': 'M48 72 V24 H188',
  'link-1-3': 'M48 104 V152 H188',
  'link-2-4': 'M252 24 H392 V72',
  'link-3-4': 'M252 152 H392 V104',
  'link-1-4': 'M80 88 H360',
}
const tallArrows: Record<string, string> = {
  'flood-1-2': 'M108 24 H48 V104',
  'flood-1-3': 'M172 24 H232 V104',
  'flood-1-4': 'M140 40 V200',
  'go-1-2': 'M108 24 H48 V104',
  'go-2-4': 'M48 136 V216 H108',
  'go-1-3': 'M172 24 H232 V104',
  'go-3-4': 'M232 136 V216 H172',
}
const wideArrows: Record<string, string> = {
  'flood-1-2': 'M48 72 V24 H188',
  'flood-1-3': 'M48 104 V152 H188',
  'flood-1-4': 'M80 88 H360',
  'go-1-2': 'M48 72 V24 H188',
  'go-2-4': 'M252 24 H392 V72',
  'go-1-3': 'M48 104 V152 H188',
  'go-3-4': 'M252 152 H392 V104',
}
// 화살표마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'flood-1-2': ['router-1', 'router-2'],
  'flood-1-3': ['router-1', 'router-3'],
  'flood-1-4': ['router-1', 'router-4'],
  'go-1-2': ['router-1', 'router-2'],
  'go-2-4': ['router-2', 'router-4'],
  'go-1-3': ['router-1', 'router-3'],
  'go-3-4': ['router-3', 'router-4'],
}

type Note = { x: number, y: number, anchor: 'start' | 'middle' | 'end' }
const tallNotes: Record<NoteId, Note> = {
  'cost-1-2': { x: 54, y: 72, anchor: 'start' },
  'cost-1-3': { x: 226, y: 72, anchor: 'end' },
  'cost-2-4': { x: 54, y: 176, anchor: 'start' },
  'cost-3-4': { x: 226, y: 176, anchor: 'end' },
  'cost-1-4': { x: 146, y: 124, anchor: 'start' },
  'same-map': { x: 140, y: 248, anchor: 'middle' },
  'via-2-sum': { x: 140, y: 248, anchor: 'middle' },
  'via-3-sum': { x: 140, y: 248, anchor: 'middle' },
}
const wideNotes: Record<NoteId, Note> = {
  'cost-1-2': { x: 118, y: 18, anchor: 'middle' },
  'cost-1-3': { x: 118, y: 168, anchor: 'middle' },
  'cost-2-4': { x: 322, y: 18, anchor: 'middle' },
  'cost-3-4': { x: 322, y: 168, anchor: 'middle' },
  'cost-1-4': { x: 220, y: 82, anchor: 'middle' },
  'same-map': { x: 220, y: 196, anchor: 'middle' },
  'via-2-sum': { x: 220, y: 196, anchor: 'middle' },
  'via-3-sum': { x: 220, y: 196, anchor: 'middle' },
}

const question = 'OSPF 라우터는 가장 작은 비용의 길을 어떻게 찾을까?'
const idleCaption = '라우터 1부터 라우터 4까지 네 라우터가 링크로 이어져 있고, 링크마다 비용이 적혀 있다(비용 값은 예다). 버튼을 고르면 링크 상태를 퍼뜨리는 모습과 라우터 1이 라우터 4로 가는 길을 고르는 모습을 볼 수 있다.'
const legend = '가는 선은 라우터를 잇는 링크이고, 「비용」 곁말은 그 링크의 비용이다. 화살표는 링크 상태를 알리는 방향이나 패킷이 가는 길이다.'
const figureName = '링크마다 비용이 정해진 네 라우터에서 OSPF 라우터가 링크 상태를 퍼뜨려 같은 지도를 갖고, 비용의 합이 가장 작은 길과 비용이 같은 두 길을 쓰는 모습을 보이는 도식'
const svgName = '라우터 1과 라우터 4가 비용 3인 링크로 바로 이어져 있고, 라우터 2와 라우터 3을 거치는 길은 링크마다 비용이 1이다'
const expectedScenarios = [
  {
    id: 'flood', label: '링크 상태 퍼뜨리기',
    nodes: ['router-1', 'router-2', 'router-3', 'router-4', 'link-1-2', 'link-1-3', 'link-1-4'],
    paths: ['flood-1-2', 'flood-1-3', 'flood-1-4'],
    notes: ['same-map'] as NoteId[],
    caption: '라우터 1은 자기에게 이어진 링크 셋과 그 비용을 다른 라우터들에게 알린다. 라우터마다 이렇게 자기 링크 상태를 모두에게 퍼뜨리므로, 네 라우터는 같은 지도를 갖는다.',
    sources: [anchorConceptId],
  },
  {
    id: 'shortest', label: '가장 작은 비용',
    nodes: ['router-1', 'router-2', 'router-4', 'link-1-2', 'link-2-4'],
    paths: ['go-1-2', 'go-2-4'],
    notes: ['via-2-sum'] as NoteId[],
    caption: '라우터 1에서 라우터 4로 바로 가면 링크 하나만 지나지만 비용이 3이다. 라우터 2를 거치면 1 + 1 = 2라 비용이 더 작으므로, 라우터 1은 바로 잇는 링크 대신 이 길을 쓴다.',
    sources: [anchorConceptId],
  },
  {
    id: 'equal-cost', label: '같은 비용의 길',
    nodes: ['router-1', 'router-2', 'router-3', 'router-4', 'link-1-2', 'link-2-4', 'link-1-3', 'link-3-4'],
    paths: ['go-1-2', 'go-2-4', 'go-1-3', 'go-3-4'],
    notes: ['via-3-sum'] as NoteId[],
    caption: '라우터 3을 거치는 길도 1 + 1 = 2로, 라우터 2를 거치는 길과 비용이 같다. OSPF는 비용이 같은 두 길을 모두 찾아 함께 쓰고, 라우터 4로 가는 트래픽을 두 길에 나눠 보낸다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 256]
const wideBox: [number, number, number, number] = [0, 0, 440, 204]

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
  expect(shown.map((note) => note.getAttribute('data-note')).sort()).toEqual([...alwaysNotes, ...ids].sort())
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

// 연결 여섯은 늘 보이고 이웃한 두 장치를 잇는다.
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

// 링크의 비용을 그 링크의 비용 곁말에서 읽는다(「비용 3」 → 3).
function costOf(link: string) {
  return Number(/비용 (\d+)/u.exec(diagram().querySelector(`[data-note="${costNoteOf[link]}"]`)!.textContent!)![1])
}

// 화살표 하나가 그리는 길과 같은 링크.
function linkUnder(pathId: string) {
  const d = diagram().querySelector(`[data-path="${pathId}"]`)!.getAttribute('d')
  return linkIds.find((link) => diagram().querySelector(`[data-link="${link}"]`)!.getAttribute('d') === d)!
}

// 요점: 링크 상태 퍼뜨리기에서는 화살표가 모두 라우터 1에서 나가 나머지 세 라우터에 하나씩 닿는다.
// 가장 작은 비용에서는 화살표가 라우터 2를 거쳐 라우터 4로 가고, 그 길의 비용 합이 바로 잇는 링크의 비용보다 작으며 바로 잇는 링크에는 화살표가 없다.
// 같은 비용의 길에서는 라우터 2를 거치는 길과 라우터 3을 거치는 길에 모두 화살표가 있고, 두 길의 비용 합이 같으며 곁말의 합과도 같다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const pathCost = (paths: string[]) => paths.reduce((sum, path) => sum + costOf(linkUnder(path)), 0)

  await selectScenario('링크 상태 퍼뜨리기')
  expect(arrowHops().map(([from]) => from)).toEqual(['router-1', 'router-1', 'router-1'])
  expect(arrowHops().map(([, to]) => to).sort()).toEqual(['router-2', 'router-3', 'router-4'])

  await selectScenario('가장 작은 비용')
  expect(arrowHops()).toEqual([['router-1', 'router-2'], ['router-2', 'router-4']])
  expect(arrowTouches('router-3')).toBe(false)
  const viaTwo = pathCost(['go-1-2', 'go-2-4'])
  expect(viaTwo).toBe(2)
  expect(viaTwo).toBeLessThan(costOf('link-1-4'))
  expect(Array.from(diagram().querySelectorAll('[data-path]'), (path) => path.getAttribute('d'))).not.toContain(diagram().querySelector('[data-link="link-1-4"]')!.getAttribute('d'))
  expect(diagram().querySelector('[data-note="via-2-sum"]')!.textContent!.endsWith(`= ${viaTwo}`)).toBe(true)

  await selectScenario('같은 비용의 길')
  expect(arrowHops()).toEqual([['router-1', 'router-2'], ['router-2', 'router-4'], ['router-1', 'router-3'], ['router-3', 'router-4']])
  const viaThree = pathCost(['go-1-3', 'go-3-4'])
  expect(viaThree).toBe(pathCost(['go-1-2', 'go-2-4']))
  expect(viaThree).toBeLessThan(costOf('link-1-4'))
  expect(diagram().querySelector('[data-note="via-3-sum"]')!.textContent!.endsWith(`= ${viaThree}`)).toBe(true)

  expect(body).toContain('링크 비용이 라우터 1과 라우터 2 사이 1, 라우터 2와 라우터 4 사이 1, 라우터 1과 라우터 3 사이 1, 라우터 3과 라우터 4 사이 1, 라우터 1과 라우터 4를 바로 잇는 링크 3이라고 하자')
  expect(body).toContain('라우터 1에서 라우터 4로 바로 가면 링크 하나만 지나지만 비용이 3이다')
  expect(body).toContain('라우터 2를 거치면 1 + 1 = 2이고, 라우터 3을 거쳐도 1 + 1 = 2다')
  expect(body).toContain('비용이 2로 같은 두 길, 곧 라우터 2를 거치는 길과 라우터 3을 거치는 길을 함께 쓴다')
  expect(body).toContain('자기 링크 상태를 AS 안의 모든 라우터에게 퍼뜨린다')
  expect(body).toContain('같은 링크 상태 데이터베이스를 갖는다')
}

async function expectUniqueMarkers() {
  render(<><LinkStateDiagram /><LinkStateDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '같은 비용의 길' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(4)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('LinkStateDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<LinkStateDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 연결이 모두 선명하고 화살표 없이 늘 보이는 곁말과 선택 안내만 나온다', () => {
    const { container } = render(<LinkStateDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expectLinks(tallLinks, null)
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expectNotes([], tallNotes, 280, 256)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<LinkStateDiagram />)
    await expectScenario(scenario, tallLinks, tallArrows, tallNotes, 280, 256, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<LinkStateDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...alwaysNotes, ...scenario.notes].sort())
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(shownIds('[data-note]', 'data-note')).toEqual(alwaysNotes)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드가 280×256 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<LinkStateDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 256')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<LinkStateDiagram />)
    await expectArrowEnds()
  })

  it('라우터 1이 링크 상태를 모두에게 알리고, 비용 3인 바로 잇는 링크 대신 비용 2인 길을 쓰며, 비용이 같은 두 길을 함께 쓴다', async () => {
    render(<LinkStateDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<LinkStateDiagram />)
    const text = visualsByTopicId[topicId].diagrams['link-state']
    const ids = linkStateScenarios.map(({ id }) => id).sort()
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
    expect(text.label).toBe(figureName)
    expect(text.svgLabel).toBe(svgName)
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = linkStateScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 OSPF 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×204 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커와 연결을 유지한다', () => {
      render(<LinkStateDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 204')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
      expectLinks(wideLinks, null)
      expectNotes([], wideNotes, 440, 204)
    })

    it('노드·연결 id 집합과 화살표·곁말 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<LinkStateDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 256')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallLinkIds = shownIds('[data-link]', 'data-link').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')
      const tallNoteIds = await collectIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 204')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinkIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(tallNoteIds).toEqual(Object.keys(noteLabels).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
      expect(await collectIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
    })

    it('모든 rect가 440×204 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<LinkStateDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<LinkStateDiagram />)
      await expectScenario(scenario, wideLinks, wideArrows, wideNotes, 440, 204, container)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<LinkStateDiagram />)
      await expectArrowEnds()
    })

    it('라우터 1이 링크 상태를 모두에게 알리고, 비용 3인 바로 잇는 링크 대신 비용 2인 길을 쓰며, 비용이 같은 두 길을 함께 쓴다', async () => {
      render(<LinkStateDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<LinkStateDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 256')
      await selectScenario('같은 비용의 길')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '같은 비용의 길' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['go-1-2', 'go-2-4', 'go-1-3', 'go-3-4'])
      expect(paths[1]).toHaveAttribute('d', wideArrows['go-2-4'])
      expect(diagram().querySelector('[data-note="via-3-sum"]')).toHaveAttribute('x', String(wideNotes['via-3-sum'].x))
    })
  })
})
