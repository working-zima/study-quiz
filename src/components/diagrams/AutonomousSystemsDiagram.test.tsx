import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { AutonomousSystemsDiagram, autonomousSystemsScenarios } from './AutonomousSystemsDiagram'

const topicId = 'routing'
const anchorConceptId = `${topicId}.as`
const labels = {
  'router-1': '라우터 1',
  'router-2': '라우터 2',
  'router-3': '라우터 3',
  'router-4': '라우터 4',
}
const groupLabels = { 'as-1': 'AS 1', 'as-2': 'AS 2' }
const noteLabels = {
  'igp-as-1': 'IGP로 주고받는다',
  'igp-as-2': 'IGP로 주고받는다',
  egp: 'EGP로 주고받는다',
}
type NoteId = keyof typeof noteLabels

const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
// 라우터가 든 AS.
const groupOf: Record<string, string> = { 'router-1': 'as-1', 'router-2': 'as-1', 'router-3': 'as-2', 'router-4': 'as-2' }
// AS 안의 곁말은 그 AS 상자 안에, AS 사이의 곁말은 두 상자 밖에 둔다.
const noteGroup: Record<NoteId, string | null> = { 'igp-as-1': 'as-1', 'igp-as-2': 'as-2', egp: null }

const linkIds = ['link-1-2', 'link-2-3', 'link-3-4']
const linkEnds: Record<string, [string, string]> = {
  'link-1-2': ['router-1', 'router-2'],
  'link-2-3': ['router-2', 'router-3'],
  'link-3-4': ['router-3', 'router-4'],
}

const tallLinks: Record<string, string> = {
  'link-1-2': 'M72 64 V112',
  'link-2-3': 'M112 128 H168',
  'link-3-4': 'M208 112 V64',
}
const wideLinks: Record<string, string> = {
  'link-1-2': 'M92 52 H124',
  'link-2-3': 'M196 52 H244',
  'link-3-4': 'M316 52 H348',
}
const tallArrows: Record<string, string> = {
  'igp-1-2': 'M64 64 V112',
  'igp-2-1': 'M80 112 V64',
  'igp-3-4': 'M200 112 V64',
  'igp-4-3': 'M216 64 V112',
  'egp-2-3': 'M112 122 H168',
  'egp-3-2': 'M168 134 H112',
}
const wideArrows: Record<string, string> = {
  'igp-1-2': 'M92 46 H124',
  'igp-2-1': 'M124 58 H92',
  'igp-3-4': 'M316 46 H348',
  'igp-4-3': 'M348 58 H316',
  'egp-2-3': 'M196 46 H244',
  'egp-3-2': 'M244 58 H196',
}
// 화살표마다 출발 노드와 도착 노드. 경로 정보는 두 라우터 사이를 양쪽으로 오간다.
const ends: Record<string, [string, string]> = {
  'igp-1-2': ['router-1', 'router-2'],
  'igp-2-1': ['router-2', 'router-1'],
  'igp-3-4': ['router-3', 'router-4'],
  'igp-4-3': ['router-4', 'router-3'],
  'egp-2-3': ['router-2', 'router-3'],
  'egp-3-2': ['router-3', 'router-2'],
}

type Note = { x: number, y: number, anchor: 'start' | 'middle' | 'end' }
const tallNotes: Record<NoteId, Note> = {
  'igp-as-1': { x: 72, y: 156, anchor: 'middle' },
  'igp-as-2': { x: 208, y: 156, anchor: 'middle' },
  egp: { x: 140, y: 178, anchor: 'middle' },
}
const wideNotes: Record<NoteId, Note> = {
  'igp-as-1': { x: 108, y: 92, anchor: 'middle' },
  'igp-as-2': { x: 332, y: 92, anchor: 'middle' },
  egp: { x: 220, y: 120, anchor: 'middle' },
}

const question = 'AS 안과 AS 사이에서는 무엇으로 경로를 주고받을까?'
const idleCaption = 'AS 1에는 라우터 1과 라우터 2가, AS 2에는 라우터 3과 라우터 4가 있고, 두 AS가 맞닿는 곳에서 라우터 2와 라우터 3이 이어져 있다. 버튼을 고르면 AS 안과 AS 사이에서 각각 무엇으로 경로 정보를 주고받는지 볼 수 있다.'
const legend = '큰 상자 하나가 AS 하나다. 가는 선은 라우터를 잇는 연결이고, 화살표는 경로 정보가 오가는 방향이다.'
const figureName = 'AS 1과 AS 2의 라우터들이 자기 AS 안에서는 IGP로, 두 AS가 맞닿는 곳에서는 EGP로 경로 정보를 주고받는 것을 보이는 도식'
const svgName = 'AS 1 안의 라우터 1과 라우터 2, AS 2 안의 라우터 3과 라우터 4. 두 AS가 맞닿는 곳에서 라우터 2와 라우터 3이 이어져 있다'
const expectedScenarios = [
  {
    id: 'igp', label: 'AS 안',
    nodes: ['router-1', 'router-2', 'router-3', 'router-4', 'link-1-2', 'link-3-4'],
    paths: ['igp-1-2', 'igp-2-1', 'igp-3-4', 'igp-4-3'],
    notes: ['igp-as-1', 'igp-as-2'] as NoteId[],
    caption: '라우터 1과 라우터 2는 AS 1 안에서, 라우터 3과 라우터 4는 AS 2 안에서 저마다 IGP로 경로 정보를 주고받는다. RIP와 OSPF가 IGP에 든다.',
    sources: [anchorConceptId],
  },
  {
    id: 'egp', label: 'AS 사이',
    nodes: ['router-2', 'router-3', 'link-2-3'],
    paths: ['egp-2-3', 'egp-3-2'],
    notes: ['egp'] as NoteId[],
    caption: '두 AS가 맞닿는 곳의 라우터 2와 라우터 3은 EGP로 경로 정보를 주고받는다. 라우터 2는 AS 1 안의 네트워크로 가는 경로를 AS 2에, 라우터 3은 AS 2 안의 네트워크로 가는 경로를 AS 1에 알린다. 지금 AS 사이에서 널리 쓰는 것은 BGP다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 184]
const wideBox: [number, number, number, number] = [0, 0, 440, 128]

function diagram() {
  return screen.getByRole('img', { name: svgName })
}

async function selectScenario(label: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) })
}

function readBox(rect: Element, id = rect.parentElement?.getAttribute('data-node') ?? ''): SvgBox {
  return {
    id,
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

function nodeBox(id: string) {
  return readBox(diagram().querySelector(`[data-node="${id}"] rect`)!)
}

function groupBox(id: string) {
  return readBox(diagram().querySelector(`[data-group="${id}"]`)!, id)
}

function shownIds(selector: string, attribute: string) {
  return Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)!)
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function contains(outer: SvgBox, inner: SvgBox) {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height
}

function containsPoint(box: SvgBox, point: { x: number, y: number }) {
  return point.x >= box.x && point.x <= box.x + box.width && point.y >= box.y && point.y <= box.y + box.height
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

function groupLabelBox(id: string) {
  return textBox(diagram().querySelector(`[data-group-label="${id}"]`)!, `${id}-label`)
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

// 선의 양 끝이 지정한 두 노드의 변에 닿고, 어떤 선분도 노드 안이나 그룹 라벨을 지나지 않는다.
function expectLine(line: Element, id: string, pair: [string, string]) {
  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), (rect) => readBox(rect))
  for (const segment of segments(line.getAttribute('d')!)) {
    for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
  }
  const { start, end } = lineEnds(line)
  expect([nodeAt(start), nodeAt(end)].sort(), id).toEqual([...pair].sort())
}

// 보이는 곁말이 지정한 id·글·자리이고, viewBox 안에서 노드·선·그룹 라벨·다른 곁말과 겹치지 않는다. 곁말은 흐려지지 않는다.
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
    for (const group of groupIds) {
      expect(contains(groupBox(group), box), `${id} ⊂ ${group}`).toBe(noteGroup[id] === group)
      expect(overlaps(box, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
    }
    for (const node of nodeIds.map(nodeBox)) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const line of diagram().querySelectorAll('[data-link], [data-path]')) {
      for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), `${id} ↔ 선`).toBe(false)
    }
    for (const other of boxes.filter((item) => item.id !== id)) expect(overlaps(box, other), `${id} ↔ ${other.id}`).toBe(false)
  }
}

// 연결 셋은 늘 보이고 이웃한 두 라우터를 잇는다.
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

// 그룹 박스는 어느 상태에서도 흐려지지 않는다.
function expectGroups() {
  expect(shownIds('[data-group]', 'data-group')).toEqual(groupIds)
  for (const id of groupIds) {
    const group = diagram().querySelector(`[data-group="${id}"]`)!
    expect(group.closest('[opacity]'), id).toBeNull()
    expect(group.parentElement).toHaveClass('stroke-disabled')
    expect(diagram().querySelector(`[data-group-label="${id}"]`)!.textContent).toBe(groupLabels[id as keyof typeof groupLabels])
    expect(diagram().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
    expect(contains(groupBox(id), groupLabelBox(id)), `${id} 라벨`).toBe(true)
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
  expectGroups()

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

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다. 라우터는 자기 AS 상자 안에 있다. 노드는 모두 회색이다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), (rect) => readBox(rect, rect.getAttribute('data-group') ?? rect.parentElement?.getAttribute('data-node') ?? ''))
  expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
  expect(overlaps(groupBox('as-1'), groupBox('as-2'))).toBe(false)

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(node.querySelector('rect')).toHaveClass('stroke-disabled')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(label, 10) + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
    for (const group of groupIds) expect(contains(groupBox(group), box), `${id} ⊂ ${group}`).toBe(groupOf[id] === group)
    for (const group of groupIds) expect(overlaps(box, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
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
    const shown = Array.from(diagram().querySelectorAll('[data-path]'))
    for (const path of shown) {
      const id = path.getAttribute('data-path')!
      expectLine(path, id, ends[id])
      const { start, end } = lineEnds(path)
      expect(nodeAt(start), `${id} 시작`).toBe(ends[id][0])
      expect(nodeAt(end), `${id} 끝`).toBe(ends[id][1])
    }
    // 같은 시나리오의 화살표끼리는 만나지 않는다.
    for (let i = 0; i < shown.length; i += 1) {
      for (const other of shown.slice(i + 1)) {
        for (const a of segments(shown[i].getAttribute('d')!)) {
          for (const b of segments(other.getAttribute('d')!)) {
            const box = { id: '', x: Math.min(b.x1, b.x2), y: Math.min(b.y1, b.y2), width: Math.abs(b.x2 - b.x1), height: Math.abs(b.y2 - b.y1) }
            expect(touches(a, box), `${shown[i].getAttribute('data-path')} ↔ ${other.getAttribute('data-path')}`).toBe(false)
          }
        }
      }
    }
  }
}

// 경로의 꺾이는 점들이 든 AS 상자.
function groupsOfPoints(path: Element) {
  const points = segments(path.getAttribute('d')!).flatMap(({ x1, y1, x2, y2 }) => [{ x: x1, y: y1 }, { x: x2, y: y2 }])
  return points.map((point) => groupIds.filter((group) => containsPoint(groupBox(group), point)))
}

// 요점: 「AS 안」의 화살표는 모두 한 AS 상자 안에 머물러 AS의 경계를 넘지 않는다. 「AS 사이」의 화살표는 라우터 2와 라우터 3을 잇고,
// 한쪽 끝은 AS 1 상자에, 다른 끝은 AS 2 상자에 있다. 그룹 박스는 두 시나리오 모두 흐려지지 않는다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')

  await selectScenario('AS 안')
  for (const path of diagram().querySelectorAll('[data-path]')) {
    const inside = groupsOfPoints(path)
    expect(inside.every((groups) => groups.length === 1), path.getAttribute('data-path')!).toBe(true)
    expect(new Set(inside.map(([group]) => group)).size, path.getAttribute('data-path')!).toBe(1)
    const { start, end } = lineEnds(path)
    expect(groupOf[nodeAt(start)!]).toBe(groupOf[nodeAt(end)!])
  }
  expect(new Set(Array.from(diagram().querySelectorAll('[data-path]'), (path) => groupsOfPoints(path)[0][0]))).toEqual(new Set(groupIds))
  for (const id of groupIds) expect(diagram().querySelector(`[data-group="${id}"]`)!.closest('[opacity]')).toBeNull()

  await selectScenario('AS 사이')
  const crossing = Array.from(diagram().querySelectorAll('[data-path]'))
  expect(crossing.length).toBeGreaterThan(0)
  for (const path of crossing) {
    const { start, end } = lineEnds(path)
    expect([nodeAt(start), nodeAt(end)].sort()).toEqual(['router-2', 'router-3'])
    const inside = groupsOfPoints(path)
    expect(inside[0]).toHaveLength(1)
    expect(inside[inside.length - 1]).toHaveLength(1)
    expect(inside[0][0]).not.toBe(inside[inside.length - 1][0])
  }
  for (const id of groupIds) expect(diagram().querySelector(`[data-group="${id}"]`)!.closest('[opacity]')).toBeNull()

  expect(body).toContain('라우터 1과 라우터 2는 AS 1 안에서, 라우터 3과 라우터 4는 AS 2 안에서 저마다 IGP로 경로 정보를 주고받는다')
  expect(body).toContain('라우터 2와 라우터 3은 EGP로 경로 정보를 주고받아')
  expect(body).toContain('지금 AS 사이에서 널리 쓰는 것은 BGP(Border Gateway Protocol)다')
  expect(body).toContain('RIP(Routing Information Protocol)와 OSPF(Open Shortest Path First)가 IGP에 든다')
}

async function expectUniqueMarkers() {
  render(<><AutonomousSystemsDiagram /><AutonomousSystemsDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'AS 안' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(4)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('AutonomousSystemsDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<AutonomousSystemsDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 연결이 모두 선명하고 화살표·곁말 없이 AS 상자와 선택 안내가 나온다', () => {
    const { container } = render(<AutonomousSystemsDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expectLinks(tallLinks, null)
    expectGroups()
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<AutonomousSystemsDiagram />)
    await expectScenario(scenario, tallLinks, tallArrows, tallNotes, 280, 184, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<AutonomousSystemsDiagram />)
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

  it('노드와 AS 상자가 280×184 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<AutonomousSystemsDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 184')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나거나 다른 화살표와 만나지 않는다', async () => {
    render(<AutonomousSystemsDiagram />)
    await expectArrowEnds()
  })

  it('AS 안의 화살표는 한 AS 상자를 벗어나지 않고, AS 사이의 화살표는 두 AS 상자에 걸친다', async () => {
    render(<AutonomousSystemsDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<AutonomousSystemsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['autonomous-systems']
    const ids = autonomousSystemsScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
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
      const scenario = autonomousSystemsScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 AS 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×128 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커와 연결을 유지한다', () => {
      render(<AutonomousSystemsDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 128')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
      expectLinks(wideLinks, null)
      expectGroups()
    })

    it('노드·그룹·연결 id 집합과 화살표·곁말 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<AutonomousSystemsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 184')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroups = shownIds('[data-group]', 'data-group').sort()
      const tallLinkIds = shownIds('[data-link]', 'data-link').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')
      const tallNoteIds = await collectIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 128')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroups)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinkIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallGroups).toEqual([...groupIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(tallNoteIds).toEqual(Object.keys(noteLabels).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
      expect(await collectIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
    })

    it('모든 rect가 440×128 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<AutonomousSystemsDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<AutonomousSystemsDiagram />)
      await expectScenario(scenario, wideLinks, wideArrows, wideNotes, 440, 128, container)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나거나 다른 화살표와 만나지 않는다', async () => {
      render(<AutonomousSystemsDiagram />)
      await expectArrowEnds()
    })

    it('AS 안의 화살표는 한 AS 상자를 벗어나지 않고, AS 사이의 화살표는 두 AS 상자에 걸친다', async () => {
      render(<AutonomousSystemsDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<AutonomousSystemsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 184')
      await selectScenario('AS 사이')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: 'AS 사이' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['egp-2-3', 'egp-3-2'])
      expect(paths[0]).toHaveAttribute('d', wideArrows['egp-2-3'])
      expect(diagram().querySelector('[data-note="egp"]')).toHaveAttribute('x', String(wideNotes.egp.x))
    })
  })
})
