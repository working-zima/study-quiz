import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { CollisionDomainDiagram, collisionDomainScenarios } from './CollisionDomainDiagram'

const topicId = 'hub-switch-vlan'
const anchorConceptId = `${topicId}.collision-domain`
const labels = {
  hub: '허브',
  'host-a': '호스트 A',
  'host-b': '호스트 B',
  'host-c': '호스트 C',
  'host-d': '호스트 D',
  switch: '스위치',
  'sw-host-a': '호스트 A',
  'sw-host-b': '호스트 B',
  'sw-host-c': '호스트 C',
  'sw-host-d': '호스트 D',
}
const noteLabels = {
  'hub-count': '충돌 도메인 1개',
  'switch-count': '충돌 도메인 4개',
}
type NoteId = keyof typeof noteLabels

const nodeIds = Object.keys(labels)
const hubSceneIds = ['hub', 'host-a', 'host-b', 'host-c', 'host-d']
const switchSceneIds = ['switch', 'sw-host-a', 'sw-host-b', 'sw-host-c', 'sw-host-d']
const hubHostIds = ['host-a', 'host-b', 'host-c', 'host-d']
const switchHostIds = ['sw-host-a', 'sw-host-b', 'sw-host-c', 'sw-host-d']
const hubLinkIds = ['hub-cable-a', 'hub-cable-b', 'hub-cable-c', 'hub-cable-d']
const switchLinkIds = ['sw-cable-a', 'sw-cable-b', 'sw-cable-c', 'sw-cable-d']
const linkIds = [...hubLinkIds, ...switchLinkIds]

const tallLinks: Record<string, string> = {
  'hub-cable-a': 'M38 44 V76',
  'hub-cable-b': 'M106 44 V76',
  'hub-cable-c': 'M174 44 V76',
  'hub-cable-d': 'M242 44 V76',
  'sw-cable-a': 'M38 176 V204',
  'sw-cable-b': 'M106 176 V204',
  'sw-cable-c': 'M174 176 V204',
  'sw-cable-d': 'M242 176 V204',
}
const wideLinks: Record<string, string> = {
  'hub-cable-a': 'M58 44 V72',
  'hub-cable-b': 'M166 44 V72',
  'hub-cable-c': 'M274 44 V72',
  'hub-cable-d': 'M382 44 V72',
  'sw-cable-a': 'M58 172 V196',
  'sw-cable-b': 'M166 172 V196',
  'sw-cable-c': 'M274 172 V196',
  'sw-cable-d': 'M382 172 V196',
}
// 케이블마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'hub-cable-a': ['hub', 'host-a'],
  'hub-cable-b': ['hub', 'host-b'],
  'hub-cable-c': ['hub', 'host-c'],
  'hub-cable-d': ['hub', 'host-d'],
  'sw-cable-a': ['switch', 'sw-host-a'],
  'sw-cable-b': ['switch', 'sw-host-b'],
  'sw-cable-c': ['switch', 'sw-host-c'],
  'sw-cable-d': ['switch', 'sw-host-d'],
}

const tallGroups: Record<string, SvgBox> = {
  'hub-domain': { id: 'hub-domain', x: 4, y: 4, width: 272, height: 112 },
  'sw-domain-a': { id: 'sw-domain-a', x: 6, y: 180, width: 64, height: 62 },
  'sw-domain-b': { id: 'sw-domain-b', x: 74, y: 180, width: 64, height: 62 },
  'sw-domain-c': { id: 'sw-domain-c', x: 142, y: 180, width: 64, height: 62 },
  'sw-domain-d': { id: 'sw-domain-d', x: 210, y: 180, width: 64, height: 62 },
}
const wideGroups: Record<string, SvgBox> = {
  'hub-domain': { id: 'hub-domain', x: 6, y: 4, width: 428, height: 108 },
  'sw-domain-a': { id: 'sw-domain-a', x: 8, y: 176, width: 100, height: 58 },
  'sw-domain-b': { id: 'sw-domain-b', x: 116, y: 176, width: 100, height: 58 },
  'sw-domain-c': { id: 'sw-domain-c', x: 224, y: 176, width: 100, height: 58 },
  'sw-domain-d': { id: 'sw-domain-d', x: 332, y: 176, width: 100, height: 58 },
}

type Note = { x: number, y: number, anchor: 'start' | 'middle' }
const tallNotes: Record<NoteId, Note> = {
  'hub-count': { x: 140, y: 132, anchor: 'middle' },
  'switch-count': { x: 140, y: 258, anchor: 'middle' },
}
const wideNotes: Record<NoteId, Note> = {
  'hub-count': { x: 220, y: 128, anchor: 'middle' },
  'switch-count': { x: 220, y: 250, anchor: 'middle' },
}

const question = '충돌은 어디까지 번질까?'
const idleCaption = '위에는 호스트 A~D를 허브에, 아래에는 같은 호스트 A~D를 스위치에 하나씩 이었다. 두 그림은 케이블로 이은 모양이 같다. 버튼을 고르면 두 장비에서 서로 충돌할 수 있는 범위, 곧 충돌 도메인이 어떻게 나뉘는지 볼 수 있다.'
const legend = '얇은 선 박스는 충돌 도메인, 가는 선은 케이블이다. 스위치 아래의 케이블 넷은 저마다 스위치의 포트 하나에 꽂혀 있다.'
const expectedScenarios = [
  {
    id: 'hub', label: '허브에 이었을 때',
    nodes: [...hubSceneIds, ...hubLinkIds],
    groups: ['hub-domain'],
    notes: ['hub-count'] as NoteId[],
    caption: '허브는 한 포트로 들어온 신호를 다른 모든 포트로 내보내므로, 어느 두 호스트가 거의 같은 때 보내도 두 신호가 허브를 거쳐 만나 충돌한다. 그래서 허브에 이은 호스트 넷 전체가 충돌 도메인 하나다.',
  },
  {
    id: 'switch', label: '스위치에 이었을 때',
    nodes: [...switchSceneIds, ...switchLinkIds],
    groups: ['sw-domain-a', 'sw-domain-b', 'sw-domain-c', 'sw-domain-d'],
    notes: ['switch-count'] as NoteId[],
    caption: '스위치는 포트마다 이은 케이블을 따로따로의 LAN으로 두므로, 한 포트의 신호가 다른 포트의 케이블로 그대로 흘러가지 않는다. 그래서 충돌 도메인이 포트마다 하나씩, 모두 넷으로 나뉜다. 포트에 호스트 하나를 바로 이어 전이중으로 통신하면 그 안에서도 충돌이 생기지 않는다.',
  },
]

function diagram() {
  return screen.getByRole('img', { name: '같은 호스트 A~D를 위에서는 허브에, 아래에서는 스위치에 하나씩 이었을 때 충돌 도메인이 어떻게 나뉘는지 보이는 모습' })
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

function groupBoxes() {
  return Array.from(diagram().querySelectorAll('[data-group]'), readBox)
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

// 보이는 곁말이 지정한 id·글·자리이고, viewBox 안에서 노드·선·그룹 박스와 겹치거나 닿지 않는다.
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
    for (const group of groupBoxes()) expect(overlaps(box, group), `${id} ↔ ${group.id}`).toBe(false)
    for (const line of diagram().querySelectorAll('[data-link]')) {
      for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), `${id} ↔ 선`).toBe(false)
    }
  }
}

// 아래 단언들은 배치에 묶이지 않는다. 세로형과 가로형이 같은 기대값으로 통과해야 한다.
async function expectScenario(
  scenario: typeof expectedScenarios[number],
  groups: Record<string, SvgBox>,
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
  const shownGroups = Array.from(diagram().querySelectorAll('[data-group]'))
  expect(shownGroups.map((group) => group.getAttribute('data-group'))).toEqual(scenario.groups)
  for (const group of shownGroups) {
    const id = group.getAttribute('data-group')!
    expect(readBox(group), id).toEqual(groups[id])
    expect(group).toHaveClass('fill-none', 'stroke-disabled')
    expect(group).toHaveAttribute('stroke-width', '1')
    expect(group).not.toHaveAttribute('opacity')
    expect(group.closest('[opacity]')).toBeNull()
  }
  expect(diagram().querySelectorAll('[data-path], marker')).toHaveLength(0)
  expectNotes(scenario.notes, places, width, height)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 노드와 보이는 그룹 박스가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어간다. 노드끼리 겹치지 않는다.
async function expectFits(viewBox: [number, number, number, number]) {
  const nodes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  expect(nodes).toHaveLength(nodeIds.length)
  expect(boxesOutsideViewBox(nodes, viewBox)).toEqual([])

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
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    expect(diagram().querySelectorAll('rect')).toHaveLength(nodeIds.length + groupBoxes().length)
    expect(boxesOutsideViewBox(groupBoxes(), viewBox), label).toEqual([])
    // 그룹 박스는 노드를 통째로 두르거나 아예 비켜 간다. 노드를 반쯤 자르지 않는다.
    for (const group of groupBoxes()) {
      for (const id of nodeIds) {
        const node = nodeBox(id)
        expect(contains(group, node) || !overlaps(group, node), `${group.id} ↔ ${id}`).toBe(true)
      }
    }
  }
}

// 케이블 여덟은 늘 보이고 회색이며 장비와 호스트를 잇는다. 노드는 모두 회색이고 도식 전용 두 색·초록·빨강·주황은 쓰지 않는다.
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

// 요점: 허브에 이었을 때는 충돌 도메인 하나가 허브와 호스트 넷을 모두 두른다. 스위치에 이었을 때는
// 넷이고 저마다 호스트 하나와 그 케이블만 두르며 스위치는 두르지 않는다. 그룹끼리 겹치지 않고, 곁말의 개수가 그룹 수와 같다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')

  await selectScenario('허브에 이었을 때')
  const hubGroups = groupBoxes()
  expect(hubGroups).toHaveLength(1)
  for (const id of hubSceneIds) expect(contains(hubGroups[0], nodeBox(id)), id).toBe(true)
  for (const id of switchSceneIds) expect(overlaps(hubGroups[0], nodeBox(id)), id).toBe(false)
  expect(diagram().querySelector('[data-note]')!.textContent).toBe(`충돌 도메인 ${hubGroups.length}개`)

  await selectScenario('스위치에 이었을 때')
  const switchGroups = groupBoxes()
  expect(switchGroups).toHaveLength(4)
  for (const group of switchGroups) {
    const inside = nodeIds.filter((id) => contains(group, nodeBox(id)))
    expect(inside, group.id).toHaveLength(1)
    expect(switchHostIds, group.id).toContain(inside[0])
    expect(overlaps(group, nodeBox('switch')), group.id).toBe(false)
    const cable = diagram().querySelector(`[data-link="sw-cable-${inside[0].slice(-1)}"]`)!
    const { end } = lineEnds(cable)
    expect(contains(group, { id: 'end', x: end.x, y: end.y, width: 0, height: 0 }), `${group.id} 케이블`).toBe(true)
  }
  expect(new Set(switchGroups.map((group) => nodeIds.find((id) => contains(group, nodeBox(id))))).size).toBe(4)
  for (let i = 0; i < switchGroups.length; i += 1) {
    for (let j = i + 1; j < switchGroups.length; j += 1) {
      expect(overlaps(switchGroups[i], switchGroups[j]), `${switchGroups[i].id} ↔ ${switchGroups[j].id}`).toBe(false)
    }
  }
  expect(diagram().querySelector('[data-note]')!.textContent).toBe(`충돌 도메인 ${switchGroups.length}개`)
  for (const id of hubHostIds) expect(diagram().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', '0.25')

  expect(body).toContain('허브에 이은 호스트 전체가 충돌 도메인 하나')
  expect(body).toContain('스위치는 충돌 도메인을 포트마다 나눈다')
  expect(body).toContain('모두 넷으로 나뉜다')
  expect(body).toContain('자격시험은 충돌 도메인이 작을수록 좋다고 본다')
}

describe('CollisionDomainDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<CollisionDomainDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 열·케이블 여덟이 모두 선명하고 충돌 도메인 박스와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<CollisionDomainDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-group], [data-note], [data-path]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·케이블·충돌 도메인 박스·곁말만 보인다', async (scenario) => {
    const { container } = render(<CollisionDomainDiagram />)
    await expectScenario(scenario, tallGroups, tallNotes, 280, 264, container)
  })

  it('시나리오를 바꾸면 이전 박스와 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<CollisionDomainDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-group]', 'data-group')).toEqual(scenario.groups)
      expect(shownIds('[data-note]', 'data-note')).toEqual(scenario.notes)
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-group], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드와 박스가 280×264 viewBox 안에 있고 모바일 너비 보정을 유지한다', async () => {
    render(<CollisionDomainDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 264')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    await expectFits([0, 0, 280, 264])
  })

  it('케이블은 늘 보이고 회색이며 양 끝이 장비와 호스트의 변에 닿는다', () => {
    render(<CollisionDomainDiagram />)
    expectLinks(tallLinks)
  })

  it('허브에 이으면 충돌 도메인이 하나, 스위치에 이으면 포트마다 하나씩 넷이다', async () => {
    render(<CollisionDomainDiagram />)
    await expectPoint()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<CollisionDomainDiagram />)
    const text = visualsByTopicId[topicId].diagrams['collision-domain']
    const ids = collisionDomainScenarios.map(({ id }) => id).sort()
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
    expect(text.label).toBe('충돌 도메인을 견주는 도식')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = collisionDomainScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual([])
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) {
      expect(conceptIds).toContain(source)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 충돌 도메인 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: '충돌 도메인을 견주는 도식' })

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

    async function collectGroupIds() {
      const found = new Set<string>()
      for (const { label } of expectedScenarios) {
        await selectScenario(label)
        for (const id of shownIds('[data-group]', 'data-group')) found.add(id)
      }
      return [...found].sort()
    }

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×256 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<CollisionDomainDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 256')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·케이블 id 집합과 시나리오에서 보이는 박스 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<CollisionDomainDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 264')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallLinkIds = shownIds('[data-link]', 'data-link').sort()
      const tallGroupIds = await collectGroupIds()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 256')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinkIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallGroupIds).toEqual(Object.keys(tallGroups).sort())
      expect(await collectGroupIds()).toEqual(tallGroupIds)
    })

    it('노드와 박스가 440×256 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', async () => {
      render(<CollisionDomainDiagram />)
      await expectFits([0, 0, 440, 256])
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·박스·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<CollisionDomainDiagram />)
      await expectScenario(scenario, wideGroups, wideNotes, 440, 256, container)
    })

    it('케이블은 늘 보이고 회색이며 양 끝이 장비와 호스트의 변에 닿는다', () => {
      render(<CollisionDomainDiagram />)
      expectLinks(wideLinks)
    })

    it('허브에 이으면 충돌 도메인이 하나, 스위치에 이으면 포트마다 하나씩 넷이다', async () => {
      render(<CollisionDomainDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<CollisionDomainDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 264')
      await selectScenario('스위치에 이었을 때')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '스위치에 이었을 때' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(groupBoxes()).toEqual(['sw-domain-a', 'sw-domain-b', 'sw-domain-c', 'sw-domain-d'].map((id) => wideGroups[id]))
      expect(diagram().querySelector('[data-note="switch-count"]')).toHaveAttribute('x', String(wideNotes['switch-count'].x))
    })
  })
})
