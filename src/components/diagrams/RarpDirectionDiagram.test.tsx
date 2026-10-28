import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { RarpDirectionDiagram, rarpDirectionScenarios } from './RarpDirectionDiagram'

const topicId = 'arp'
const anchorConceptId = `${topicId}.rarp`
const labels = {
  'arp-ip': '상대의 IP 주소',
  'arp-mac': '상대의 MAC 주소',
  'rarp-ip': '자기 IP 주소',
  'rarp-mac': '자기 MAC 주소',
  'rarp-server': 'RARP 서버',
}
const groupLabels = { arp: 'ARP', rarp: 'RARP' }
const sideNoteLabels = {
  'arp-known': '아는 것',
  'arp-found': '알아내는 것',
  'rarp-found': '알아내는 것',
  'rarp-known': '아는 것',
}
type SideNoteId = keyof typeof sideNoteLabels
type GroupId = keyof typeof groupLabels

const nodeIds = Object.keys(labels)
// 곁말마다 그 곁말이 붙는 노드.
const sideOf: Record<SideNoteId, string> = {
  'arp-known': 'arp-ip',
  'arp-found': 'arp-mac',
  'rarp-found': 'rarp-ip',
  'rarp-known': 'rarp-mac',
}
// 노드마다 그 노드가 든 묶음.
const groupOf: Record<string, GroupId> = {
  'arp-ip': 'arp',
  'arp-mac': 'arp',
  'rarp-ip': 'rarp',
  'rarp-mac': 'rarp',
  'rarp-server': 'rarp',
}

const tallGroups: Record<GroupId, SvgBox> = {
  arp: { id: 'arp', x: 8, y: 8, width: 264, height: 76 },
  rarp: { id: 'rarp', x: 8, y: 100, width: 264, height: 132 },
}
const wideGroups: Record<GroupId, SvgBox> = {
  arp: { id: 'arp', x: 8, y: 8, width: 424, height: 72 },
  rarp: { id: 'rarp', x: 8, y: 96, width: 424, height: 72 },
}
const tallArrows: Record<string, string> = {
  'arp-find': 'M116 62 H164',
  'rarp-ask': 'M212 170 V200 H188',
  'rarp-answer': 'M92 200 H68 V170',
}
const wideArrows: Record<string, string> = {
  'arp-find': 'M136 56 H304',
  'rarp-ask': 'M304 144 H276',
  'rarp-answer': 'M164 144 H136',
}
// 화살표마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'arp-find': ['arp-ip', 'arp-mac'],
  'rarp-ask': ['rarp-mac', 'rarp-server'],
  'rarp-answer': ['rarp-server', 'rarp-ip'],
}

type Note = { x: number, y: number }
const tallSideNotes: Record<SideNoteId, Note> = {
  'arp-known': { x: 68, y: 40 },
  'arp-found': { x: 212, y: 40 },
  'rarp-found': { x: 68, y: 132 },
  'rarp-known': { x: 212, y: 132 },
}
const wideSideNotes: Record<SideNoteId, Note> = {
  'arp-known': { x: 80, y: 34 },
  'arp-found': { x: 360, y: 34 },
  'rarp-found': { x: 80, y: 122 },
  'rarp-known': { x: 360, y: 122 },
}

const question = 'ARP와 RARP는 무엇을 알아낼까?'
const idleCaption = 'ARP와 RARP는 둘 다 IP 주소와 MAC 주소의 짝을 알아내지만, 무엇을 알고 무엇을 알아내는지가 서로 반대다. 버튼을 고르면 각각의 방향을 볼 수 있다.'
const legend = '위 묶음은 ARP, 아래 묶음은 RARP다. 두 묶음 모두 IP 주소를 왼쪽, MAC 주소를 오른쪽에 두었고, 화살표는 아는 것에서 알아내는 것으로 가는 방향이다.'
const figureName = 'ARP와 RARP가 각각 무엇을 알고 무엇을 알아내는지 견주어 보이는 도식'
const svgName = '위 묶음 ARP에는 상대의 IP 주소와 상대의 MAC 주소가 있고, 아래 묶음 RARP에는 자기 IP 주소·자기 MAC 주소와 RARP 서버가 있다. 두 묶음 모두 IP 주소가 왼쪽, MAC 주소가 오른쪽이다'
const expectedScenarios = [
  {
    id: 'arp', label: 'ARP',
    nodes: ['arp-ip', 'arp-mac'],
    paths: ['arp-find'],
    caption: 'ARP는 상대의 IP 주소를 알고, 그 상대의 MAC 주소를 알아낸다. 화살표가 IP 주소에서 MAC 주소 쪽으로 가고, 찾는 IP 주소를 쓰는 장치가 직접 답한다.',
    sources: [anchorConceptId],
  },
  {
    id: 'rarp', label: 'RARP',
    nodes: ['rarp-ip', 'rarp-mac', 'rarp-server'],
    paths: ['rarp-ask', 'rarp-answer'],
    caption: 'RARP는 자기 MAC 주소를 알고, 자기 IP 주소를 알아낸다. 화살표가 ARP와 반대로 MAC 주소에서 IP 주소 쪽으로 간다. 자기 MAC 주소를 담아 요청을 보내면, MAC 주소와 IP 주소의 짝을 적은 표를 가진 RARP 서버가 IP 주소를 알려 준다.',
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
    id: rect.parentElement?.getAttribute('data-node') ?? rect.getAttribute('data-group') ?? '',
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

function contains(outer: SvgBox, inner: SvgBox) {
  return inner.x >= outer.x && inner.x + inner.width <= outer.x + outer.width && inner.y >= outer.y && inner.y + inner.height <= outer.y + outer.height
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

function groupLabelBoxes() {
  return Array.from(diagram().querySelectorAll('[data-group-label]'), (label) => textBox(label, label.getAttribute('data-group-label')!))
}

// 선의 양 끝이 지정한 두 노드의 변에 닿고, 어떤 선분도 노드 안과 묶음 라벨을 지나지 않는다.
function expectLine(line: Element, id: string, pair: [string, string]) {
  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  for (const segment of segments(line.getAttribute('d')!)) {
    for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const label of groupLabelBoxes()) expect(touches(segment, label), `${id} ↔ ${label.id} 라벨`).toBe(false)
  }
  const { start, end } = lineEnds(line)
  expect(nodeAt(start), `${id} 시작`).toBe(pair[0])
  expect(nodeAt(end), `${id} 끝`).toBe(pair[1])
}

// 묶음 상자 둘은 늘 보이고 흐려지지 않는다. 라벨은 자기 상자 안 왼쪽 위에 있고, 노드는 자기 묶음 안에 든다.
function expectGroups(groups: Record<GroupId, SvgBox>) {
  expect(shownIds('[data-group]', 'data-group')).toEqual(['arp', 'rarp'])
  for (const rect of diagram().querySelectorAll('[data-group]')) {
    const id = rect.getAttribute('data-group')! as GroupId
    expect(readBox(rect)).toEqual(groups[id])
    expect(rect.closest('[opacity]')).toBeNull()
    const label = diagram().querySelector(`[data-group-label="${id}"]`)!
    expect(label.textContent).toBe(groupLabels[id])
    expect(label).toHaveAttribute('font-size', '9')
    expect(label.closest('[opacity]')).toBeNull()
    expect(contains(groups[id], textBox(label, id)), `${id} 라벨`).toBe(true)
    for (const node of nodeIds) expect(overlaps(textBox(label, id), nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
  }
  for (const [node, group] of Object.entries(groupOf)) expect(contains(groups[group], nodeBox(node)), `${node} ⊂ ${group}`).toBe(true)
  expect(overlaps(groups.arp, groups.rarp)).toBe(false)
}

// 아는 것·알아내는 것 곁말은 늘 보이고, 자기 노드 바로 위 가운데에 놓여 그 노드와 같은 흐림을 따른다.
function expectSideNotes(places: Record<SideNoteId, Note>, groups: Record<GroupId, SvgBox>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-side-note]'))
  expect(shown.map((note) => note.getAttribute('data-side-note')).sort()).toEqual(Object.keys(sideNoteLabels).sort())
  for (const note of shown) {
    const id = note.getAttribute('data-side-note')! as SideNoteId
    const node = nodeBox(sideOf[id])
    const box = textBox(note, id)
    expect(note.textContent).toBe(sideNoteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', 'middle')
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(places[id].x).toBe(node.x + node.width / 2)
    expect(places[id].y).toBeLessThanOrEqual(node.y)
    expect(note).toHaveAttribute('opacity', diagram().querySelector(`[data-node="${sideOf[id]}"]`)!.getAttribute('opacity')!)
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(width)
    expect(box.y).toBeGreaterThanOrEqual(0)
    expect(box.y + box.height).toBeLessThanOrEqual(height)
    expect(contains(groups[groupOf[sideOf[id]]], box), `${id} ⊂ 묶음`).toBe(true)
    for (const other of nodeIds) expect(overlaps(box, nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    for (const label of groupLabelBoxes()) expect(overlaps(box, label), `${id} ↔ ${label.id} 라벨`).toBe(false)
    for (const line of diagram().querySelectorAll('[data-path]')) {
      for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), `${id} ↔ 선`).toBe(false)
    }
  }
}

async function expectScenario(
  scenario: typeof expectedScenarios[number],
  arrows: Record<string, string>,
  places: Record<SideNoteId, Note>,
  groups: Record<GroupId, SvgBox>,
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
  expectGroups(groups)
  expectSideNotes(places, groups, width, height)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다. 노드는 모두 회색이다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length + 2)
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
    }
  }
}

// 보이는 화살표를 이어 붙인 사슬의 첫 노드와 끝 노드. 화살표가 앞 화살표의 끝에서 이어진다.
function chain() {
  const hops = Array.from(diagram().querySelectorAll('[data-path]'), (path) => [nodeAt(lineEnds(path).start)!, nodeAt(lineEnds(path).end)!])
  for (let i = 1; i < hops.length; i += 1) expect(hops[i][0]).toBe(hops[i - 1][1])
  return { from: hops[0][0], to: hops[hops.length - 1][1], hops }
}

function nodeLabel(id: string) {
  return diagram().querySelector(`[data-node="${id}"] text`)!.textContent!
}

// 요점: 두 시나리오에서 화살표의 방향이 반대다. ARP는 IP 주소 노드에서 MAC 주소 노드로, RARP는 MAC 주소 노드에서
// (RARP 서버를 거쳐) IP 주소 노드로 간다. 두 묶음 모두 IP 주소가 왼쪽에 있으므로 화살표의 가로 방향도 반대다.
// 아는 것 곁말은 화살표가 나가는 노드에, 알아내는 것 곁말은 화살표가 들어오는 노드에 붙는다. 본문이 같은 사실을 말한다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')

  await selectScenario('ARP')
  const arp = chain()
  expect(nodeLabel(arp.from)).toContain('IP 주소')
  expect(nodeLabel(arp.to)).toContain('MAC 주소')
  expect(nodeBox(arp.from).x).toBeLessThan(nodeBox(arp.to).x)
  expect(diagram().querySelector('[data-node="rarp-server"]')).toHaveAttribute('opacity', '0.25')

  await selectScenario('RARP')
  const rarp = chain()
  expect(nodeLabel(rarp.from)).toContain('MAC 주소')
  expect(nodeLabel(rarp.to)).toContain('IP 주소')
  expect(nodeBox(rarp.from).x).toBeGreaterThan(nodeBox(rarp.to).x)
  expect(rarp.hops.flat()).toContain('rarp-server')
  for (const id of ['arp-ip', 'arp-mac']) expect(diagram().querySelector(`[data-node="${id}"]`)).toHaveAttribute('opacity', '0.25')

  expect(sideOf['arp-known']).toBe(arp.from)
  expect(sideOf['arp-found']).toBe(arp.to)
  expect(sideOf['rarp-known']).toBe(rarp.from)
  expect(sideOf['rarp-found']).toBe(rarp.to)
  expect(body).toContain('ARP는 상대의 IP 주소를 알고 그 상대의 MAC 주소를 묻고, 찾는 IP 주소를 쓰는 장치가 직접 답한다')
  expect(body).toContain('RARP는 자기 MAC 주소를 알고 자기 IP 주소를 묻고, 짝을 적어 둔 RARP 서버가 답한다')
  expect(body).toContain('RARP 서버는 MAC 주소와 IP 주소의 짝을 적은 표를 갖고 있다')
}

async function expectUniqueMarkers() {
  render(<><RarpDirectionDiagram /><RarpDirectionDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'RARP' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(2)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('RarpDirectionDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<RarpDirectionDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표 없이 묶음·곁말과 선택 안내가 나온다', () => {
    const { container } = render(<RarpDirectionDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node], [data-side-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expectGroups(tallGroups)
    expectSideNotes(tallSideNotes, tallGroups, 280, 240)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표만 선명하다', async (scenario) => {
    const { container } = render(<RarpDirectionDiagram />)
    await expectScenario(scenario, tallArrows, tallSideNotes, tallGroups, 280, 240, container)
  })

  it('시나리오를 바꾸면 이전 화살표가 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<RarpDirectionDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node], [data-side-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드가 280×240 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<RarpDirectionDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 240')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 묶음 라벨을 지나지 않는다', async () => {
    render(<RarpDirectionDiagram />)
    await expectArrowEnds()
  })

  it('ARP는 IP 주소에서 MAC 주소로, RARP는 MAC 주소에서 서버를 거쳐 IP 주소로 — 방향이 반대다', async () => {
    render(<RarpDirectionDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<RarpDirectionDiagram />)
    const text = visualsByTopicId[topicId].diagrams['rarp-direction']
    const ids = rarpDirectionScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual(sideNoteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([anchorConceptId])
    expect(text.label).toBe(figureName)
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = rarpDirectionScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 RARP 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×176 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커·묶음·곁말을 유지한다', () => {
      render(<RarpDirectionDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 176')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
      expectGroups(wideGroups)
      expectSideNotes(wideSideNotes, wideGroups, 440, 176)
    })

    it('노드·묶음·곁말 id 집합과 화살표 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<RarpDirectionDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 240')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroupIds = shownIds('[data-group]', 'data-group').sort()
      const tallSideNoteIds = shownIds('[data-side-note]', 'data-side-note').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 176')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroupIds)
      expect(shownIds('[data-side-note]', 'data-side-note').sort()).toEqual(tallSideNoteIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
    })

    it('모든 rect가 440×176 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<RarpDirectionDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·캡션을 보인다', async (scenario) => {
      const { container } = render(<RarpDirectionDiagram />)
      await expectScenario(scenario, wideArrows, wideSideNotes, wideGroups, 440, 176, container)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 묶음 라벨을 지나지 않는다', async () => {
      render(<RarpDirectionDiagram />)
      await expectArrowEnds()
    })

    it('ARP는 IP 주소에서 MAC 주소로, RARP는 MAC 주소에서 서버를 거쳐 IP 주소로 — 방향이 반대다', async () => {
      render(<RarpDirectionDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<RarpDirectionDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 240')
      await selectScenario('RARP')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: 'RARP' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['rarp-ask', 'rarp-answer'])
      for (const path of paths) expect(path).toHaveAttribute('d', wideArrows[path.getAttribute('data-path')!])
    })
  })
})
