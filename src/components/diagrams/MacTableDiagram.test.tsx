import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { MacTableDiagram, macTableScenarios } from './MacTableDiagram'

const topicId = 'hub-switch-vlan'
const anchorConceptId = `${topicId}.mac-address-table`
const labels = {
  switch: '스위치',
  'host-a': '호스트 A',
  'host-b': '호스트 B',
  'host-c': '호스트 C',
  'host-d': '호스트 D',
  'row-a': '포트 1 · 00-00-5E-00-53-01',
  'row-c': '포트 3 · 00-00-5E-00-53-03',
}
const portLabels = {
  'port-1': '포트 1',
  'port-2': '포트 2',
  'port-3': '포트 3',
  'port-4': '포트 4',
}
const noteLabels = {
  'new-a': '새로 적음',
  'new-c': '새로 적음',
  'aged-a': '300초가 지나 지움',
}
type NoteId = keyof typeof noteLabels
type PortId = keyof typeof portLabels

const nodeIds = Object.keys(labels)
const hostIds = ['host-a', 'host-b', 'host-c', 'host-d']
const rowIds = ['row-a', 'row-c']
const alwaysIds = ['switch', ...hostIds]
const portIds = Object.keys(portLabels) as PortId[]
const linkIds = ['cable-a', 'cable-b', 'cable-c', 'cable-d']

const tallLinks: Record<string, string> = {
  'cable-a': 'M38 144 V184',
  'cable-b': 'M106 144 V184',
  'cable-c': 'M174 144 V184',
  'cable-d': 'M242 144 V184',
}
const wideLinks: Record<string, string> = {
  'cable-a': 'M58 144 V176',
  'cable-b': 'M166 144 V176',
  'cable-c': 'M274 144 V176',
  'cable-d': 'M382 144 V176',
}
const tallArrows: Record<string, string> = {
  'from-a': 'M38 184 V144',
  'from-c': 'M174 184 V144',
}
const wideArrows: Record<string, string> = {
  'from-a': 'M58 176 V144',
  'from-c': 'M274 176 V144',
}
const ends: Record<string, [string, string]> = {
  'cable-a': ['switch', 'host-a'],
  'cable-b': ['switch', 'host-b'],
  'cable-c': ['switch', 'host-c'],
  'cable-d': ['switch', 'host-d'],
  'from-a': ['host-a', 'switch'],
  'from-c': ['host-c', 'switch'],
}
const portPlace: Record<PortId, { link: string, host: string, number: number }> = {
  'port-1': { link: 'cable-a', host: 'host-a', number: 1 },
  'port-2': { link: 'cable-b', host: 'host-b', number: 2 },
  'port-3': { link: 'cable-c', host: 'host-c', number: 3 },
  'port-4': { link: 'cable-d', host: 'host-d', number: 4 },
}
// 곁말마다 그 곁말이 가리키는 표의 줄.
const rowOfNote: Record<NoteId, string> = { 'new-a': 'row-a', 'new-c': 'row-c', 'aged-a': 'row-a' }

type Note = { x: number, y: number, anchor: 'start' | 'middle' }
const tallPorts: Record<PortId, Note> = {
  'port-1': { x: 42, y: 168, anchor: 'start' },
  'port-2': { x: 110, y: 168, anchor: 'start' },
  'port-3': { x: 178, y: 168, anchor: 'start' },
  'port-4': { x: 246, y: 168, anchor: 'start' },
}
const widePorts: Record<PortId, Note> = {
  'port-1': { x: 62, y: 164, anchor: 'start' },
  'port-2': { x: 170, y: 164, anchor: 'start' },
  'port-3': { x: 278, y: 164, anchor: 'start' },
  'port-4': { x: 386, y: 164, anchor: 'start' },
}
const tallNotes: Record<NoteId, Note> = {
  'new-a': { x: 188, y: 44, anchor: 'start' },
  'new-c': { x: 188, y: 76, anchor: 'start' },
  'aged-a': { x: 188, y: 44, anchor: 'start' },
}
const wideNotes: Record<NoteId, Note> = {
  'new-a': { x: 232, y: 44, anchor: 'start' },
  'new-c': { x: 232, y: 76, anchor: 'start' },
  'aged-a': { x: 232, y: 44, anchor: 'start' },
}
const tallGroup = { x: 6, y: 4, width: 268, height: 92 }
const wideGroup = { x: 14, y: 4, width: 412, height: 92 }

const question = '스위치는 누가 어느 포트에 있는지 어떻게 알까?'
const idleCaption = '호스트 A~D가 스위치의 포트 1~4에 하나씩 이어져 있고, 위의 MAC 주소 테이블은 아직 비어 있다. A의 MAC 주소는 00-00-5E-00-53-01, C의 MAC 주소는 00-00-5E-00-53-03이다. 버튼을 차례로 고르면 표에 항목이 적히고 지워지는 과정을 볼 수 있다.'
const legend = '위 박스는 스위치가 적어 두는 MAC 주소 테이블이고, 한 줄이 항목 하나다. 흐리게 남은 줄은 지운 항목이다. 가는 선은 케이블, 화살표는 프레임이 들어오는 길이다.'
const expectedScenarios = [
  {
    id: 'learn-a', label: 'A가 보낼 때', sender: 'host-a',
    rows: ['row-a'], liveRows: ['row-a'],
    nodes: ['switch', 'host-a', 'cable-a', 'row-a'],
    paths: ['from-a'],
    notes: ['new-a'] as NoteId[],
    caption: '호스트 A가 C에게 보낸 프레임이 포트 1로 들어온다. 스위치는 이 프레임의 출발지 MAC 주소 00-00-5E-00-53-01과 프레임이 들어온 포트 1을 짝지어 표에 새로 적는다. 보낸 장치가 포트 1 쪽에 있다는 것을 프레임이 알려 주기 때문이다.',
  },
  {
    id: 'learn-c', label: 'C가 답할 때', sender: 'host-c',
    rows: ['row-a', 'row-c'], liveRows: ['row-a', 'row-c'],
    nodes: ['switch', 'host-c', 'cable-c', 'row-a', 'row-c'],
    paths: ['from-c'],
    notes: ['new-c'] as NoteId[],
    caption: '호스트 C가 A에게 답한 프레임이 포트 3으로 들어온다. 스위치는 출발지 MAC 주소 00-00-5E-00-53-03과 포트 3을 새로 적는다. 이제 표에는 항목이 둘이고, 스위치는 A와 C가 각각 어느 포트에 이어져 있는지 안다.',
  },
  {
    id: 'aging', label: '시간이 지나면', sender: null,
    rows: ['row-a', 'row-c'], liveRows: ['row-c'],
    nodes: ['switch', 'row-c'],
    paths: [] as string[],
    notes: ['aged-a'] as NoteId[],
    caption: 'A가 그 뒤로 프레임을 한 번도 보내지 않은 채 300초가 지나면 스위치는 A의 항목을 지운다. 이를 에이징이라 한다. A보다 나중에 프레임을 보낸 C의 항목은 아직 남아 있다. 300초는 IEEE 802.1D가 권하는 기본값이고 관리자가 바꿀 수 있다.',
  },
]

function diagram() {
  return screen.getByRole('img', { name: '스위치의 포트 1~4에 호스트 A~D가 하나씩 이어져 있고, 스위치 위에 포트와 MAC 주소를 짝지어 적는 MAC 주소 테이블이 있는 모습' })
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

function shownNodeIds() {
  return shownIds('[data-node]', 'data-node')
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
  return { id: text.getAttribute('data-note') ?? text.getAttribute('data-port') ?? text.getAttribute('data-group-label')!, x: left, y: y - 9, width, height: 9 }
}

type Segment = { x1: number, y1: number, x2: number, y2: number }

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

function crossesInside(segment: Segment, box: SvgBox) {
  const left = Math.min(segment.x1, segment.x2)
  const right = Math.max(segment.x1, segment.x2)
  const top = Math.min(segment.y1, segment.y2)
  const bottom = Math.max(segment.y1, segment.y2)
  if (top === bottom) return top > box.y && top < box.y + box.height && Math.min(right, box.x + box.width) > Math.max(left, box.x)
  return left > box.x && left < box.x + box.width && Math.min(bottom, box.y + box.height) > Math.max(top, box.y)
}

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

function nodeAt(point: { x: number, y: number }) {
  return shownNodeIds().find((id) => onEdge(point.x, point.y, nodeBox(id)))
}

// 선의 양 끝이 지정한 두 노드의 변에 닿고, 어떤 선분도 노드 안과 그룹 라벨 영역을 지나지 않는다.
function expectLine(line: Element, id: string) {
  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  const labelBoxes = Array.from(diagram().querySelectorAll('[data-group-label]'), textBox)
  for (const segment of segments(line.getAttribute('d')!)) {
    for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const label of labelBoxes) expect(touches(segment, label), `${id} ↔ 그룹 라벨`).toBe(false)
  }
  const { start, end } = lineEnds(line)
  expect(nodeAt(start), `${id} 시작`).toBe(ends[id][0])
  expect(nodeAt(end), `${id} 끝`).toBe(ends[id][1])
}

// 글이 viewBox 안에 있고, 노드·선과 겹치거나 닿지 않는다.
function expectClearText(text: Element, width: number, height: number) {
  const box = textBox(text)
  expect(box.x, box.id).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width, box.id).toBeLessThanOrEqual(width)
  expect(box.y, box.id).toBeGreaterThanOrEqual(0)
  expect(box.y + box.height, box.id).toBeLessThanOrEqual(height)
  for (const node of shownNodeIds().map(nodeBox)) expect(overlaps(box, node), `${box.id} ↔ ${node.id}`).toBe(false)
  for (const line of diagram().querySelectorAll('[data-link], [data-path]')) {
    for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
  }
}

function expectPorts(places: Record<PortId, Note>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-port]'))
  expect(shown.map((port) => port.getAttribute('data-port'))).toEqual(portIds)
  for (const port of shown) {
    const id = port.getAttribute('data-port')! as PortId
    const cable = diagram().querySelector(`[data-link="${portPlace[id].link}"]`)!
    expect(port.textContent).toBe(portLabels[id])
    expect(port).toHaveAttribute('x', String(places[id].x))
    expect(port).toHaveAttribute('y', String(places[id].y))
    expect(port).toHaveAttribute('text-anchor', places[id].anchor)
    expect(port).toHaveAttribute('font-size', '9')
    expect(port).toHaveClass('fill-muted')
    expect(port, id).toHaveAttribute('opacity', cable.getAttribute('opacity')!)
    expectClearText(port, width, height)
  }
}

// 보이는 곁말이 지정한 id·글·자리이고, 노드·선·포트 이름표·그룹 라벨·다른 곁말과 겹치지 않으며 그룹 박스 안에 있다.
function expectNotes(ids: NoteId[], places: Record<NoteId, Note>, group: typeof tallGroup, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note')).sort()).toEqual([...ids].sort())
  const others = Array.from(diagram().querySelectorAll('[data-port], [data-group-label]'), textBox)
  for (const note of shown) {
    const id = note.getAttribute('data-note')! as NoteId
    expect(note.textContent).toBe(noteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', places[id].anchor)
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note.closest('[opacity]')).toBeNull()
    expectClearText(note, width, height)
    for (const other of others) expect(overlaps(textBox(note), other), `${id} ↔ ${other.id}`).toBe(false)
    expect(contains({ id: 'table', ...group }, textBox(note)), `${id} 표 박스 안`).toBe(true)
  }
}

async function expectScenario(
  scenario: typeof expectedScenarios[number],
  arrows: Record<string, string>,
  places: Record<NoteId, Note>,
  ports: Record<PortId, Note>,
  group: typeof tallGroup,
  width: number,
  height: number,
  container: HTMLElement,
) {
  await selectScenario(scenario.label)

  expect(shownNodeIds()).toEqual([...alwaysIds, ...scenario.rows])
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
  expectPorts(ports, width, height)
  expectNotes(scenario.notes, places, group, width, height)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 줄이 둘 다 보이는 시나리오에서 모든 rect가 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다.
// 표 박스는 줄 둘을 담고, 스위치와 호스트는 표 박스 밖에 있다.
async function expectFits(viewBox: [number, number, number, number], group: typeof tallGroup) {
  await selectScenario('C가 답할 때')
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length + 1)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])

  const table = diagram().querySelector('[data-group="table"]')!
  expect(readBox(table)).toEqual({ id: 'table', ...group })
  expect(table).toHaveClass('fill-none', 'stroke-disabled')
  expect(table.closest('[opacity]')).toBeNull()
  const label = diagram().querySelector('[data-group-label="table"]')!
  expect(label.textContent).toBe('MAC 주소 테이블')
  expect(label).toHaveAttribute('font-size', '9')
  expect(contains(readBox(table), textBox(label))).toBe(true)

  for (const [id, text] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(text)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(text, 10) + 12, `${id} ${text}`).toBeLessThanOrEqual(box.width)
    expect(contains(readBox(table), box), `${id} 표 박스`).toBe(rowIds.includes(id))
    if (rowIds.includes(id)) expect(overlaps(textBox(label), box), `${id} ↔ 그룹 라벨`).toBe(false)
  }
  for (let i = 0; i < nodeIds.length; i += 1) {
    for (let j = i + 1; j < nodeIds.length; j += 1) {
      expect(overlaps(nodeBox(nodeIds[i]), nodeBox(nodeIds[j])), `${nodeIds[i]} ↔ ${nodeIds[j]}`).toBe(false)
    }
  }
}

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
  for (const id of shownNodeIds()) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

function expectPortsBesideCables() {
  for (const port of portIds) {
    const { link, host } = portPlace[port]
    const cable = diagram().querySelector(`[data-link="${link}"]`)!
    const x = segments(cable.getAttribute('d')!)[0].x1
    const box = nodeBox(host)
    expect(x, port).toBe(box.x + box.width / 2)
    const label = textBox(diagram().querySelector(`[data-port="${port}"]`)!)
    expect(label.x, port).toBe(x + 4)
    const others = hostIds.filter((id) => id !== host).map((id) => nodeBox(id).x + nodeBox(id).width / 2)
    for (const other of others) expect(label.x + label.width < other || label.x > other, `${port} ↔ 다른 케이블`).toBe(true)
  }
}

async function expectArrowEnds() {
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    for (const path of diagram().querySelectorAll('[data-path]')) expectLine(path, path.getAttribute('data-path')!)
  }
}

// 요점: 표에 선명하게 남은 줄의 수가 A가 보낼 때 1, C가 답할 때 2, 시간이 지나면 1이고, 시간이 지나면 A의 줄이 흐려진다.
// 줄마다 적힌 포트 번호는 그 줄의 MAC 주소를 가진 호스트가 이어진 포트와 같다(주소는 개념 본문이 호스트 A~D에 매긴 그대로).
// 새로 적힌 줄은 방금 프레임을 보낸 호스트의 것이고, 그 화살표는 그 호스트에서 스위치로 들어간다. 곁말은 자기 줄 바로 오른쪽에 있다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const addresses = ['00-00-5E-00-53-01', '00-00-5E-00-53-02', '00-00-5E-00-53-03', '00-00-5E-00-53-04']
  expect(body).toContain(`호스트 A~D의 MAC 주소를 차례로 ${addresses.join(', ')}라 하자`)
  const hostOfAddress = Object.fromEntries(addresses.map((address, index) => [address, hostIds[index]]))
  const portOfHost = Object.fromEntries(Object.values(portPlace).map(({ host, number }) => [host, number]))

  const liveCounts: number[] = []
  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    const rows = Array.from(diagram().querySelectorAll('[data-node^="row-"]'))
    const live = rows.filter((row) => row.getAttribute('opacity') === '1').map((row) => row.getAttribute('data-node'))
    expect(live, scenario.label).toEqual(scenario.liveRows)
    liveCounts.push(live.length)
    for (const row of rows) {
      const [, port, address] = row.textContent!.match(/^포트 (\d) · (.+)$/u)!
      expect(Number(port), row.textContent!).toBe(portOfHost[hostOfAddress[address]])
      expect(body).toContain(`포트 ${port}과 ${address}`)
    }
    const hops = Array.from(diagram().querySelectorAll('[data-path]'), (path) => [nodeAt(lineEnds(path).start)!, nodeAt(lineEnds(path).end)!])
    expect(hops, scenario.label).toEqual(scenario.sender ? [[scenario.sender, 'switch']] : [])
    for (const note of diagram().querySelectorAll('[data-note]')) {
      const id = note.getAttribute('data-note')! as NoteId
      const row = nodeBox(rowOfNote[id])
      expect(Number(note.getAttribute('y')) - 4, id).toBe(row.y + row.height / 2)
      expect(textBox(note).x, id).toBeGreaterThan(row.x + row.width)
      if (scenario.sender) expect(hostOfAddress[labels[rowOfNote[id] as keyof typeof labels].split(' · ')[1]], id).toBe(scenario.sender)
    }
  }
  expect(liveCounts).toEqual([1, 2, 1])
  await selectScenario('시간이 지나면')
  expect(diagram().querySelector('[data-node="row-a"]')).toHaveAttribute('opacity', '0.25')
  expect(body).toContain('출발지 MAC 주소와 프레임이 들어온 포트를 짝지어 표에 적는다')
  expect(body).toContain('300초')
  expect(body).toContain('새로 적는다')
  expect(body).toContain('300초가 지나면 A의 항목은 지워지고')
}

async function expectUniqueMarkers() {
  render(<><MacTableDiagram /><MacTableDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: 'MAC 주소 테이블을 채우고 지우는 도식' })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'A가 보낼 때' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(1)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('MacTableDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<MacTableDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 표가 비어 있고 스위치·호스트·케이블·포트 이름표가 모두 선명하며 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<MacTableDiagram />)

    expect(shownNodeIds()).toEqual(alwaysIds)
    expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
    expect(shownIds('[data-port]', 'data-port')).toEqual(portIds)
    expect(shownIds('[data-group]', 'data-group')).toEqual(['table'])
    for (const element of diagram().querySelectorAll('[data-node], [data-link], [data-port]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 줄·노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<MacTableDiagram />)
    await expectScenario(scenario, tallArrows, tallNotes, tallPorts, tallGroup, 280, 224, container)
  })

  it('시나리오를 바꾸면 이전 줄·화살표·곁말이 바뀌고 전체를 누르면 빈 표로 돌아온다', async () => {
    const { container } = render(<MacTableDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownNodeIds()).toEqual([...alwaysIds, ...scenario.rows])
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
      expect(shownIds('[data-note]', 'data-note')).toEqual(scenario.notes)
    }
    await selectScenario('전체')

    expect(shownNodeIds()).toEqual(alwaysIds)
    for (const element of diagram().querySelectorAll('[data-node], [data-link], [data-port]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드와 표 박스가 280×224 viewBox 안에 있고 모바일 너비 보정을 유지한다', async () => {
    render(<MacTableDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 224')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    await expectFits([0, 0, 280, 224], tallGroup)
  })

  it('케이블은 늘 보이고 회색이며, 포트 이름표는 자기 호스트의 케이블 곁에 늘 보인다', () => {
    render(<MacTableDiagram />)
    expectLinks(tallLinks)
    expectPorts(tallPorts, 280, 224)
    expectPortsBesideCables()
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
    render(<MacTableDiagram />)
    await expectArrowEnds()
  })

  it('표의 줄은 보낸 호스트의 출발지 주소와 그 포트로 적히고, 시간이 지나면 A의 줄이 흐려진다', async () => {
    render(<MacTableDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<MacTableDiagram />)
    const text = visualsByTopicId[topicId].diagrams['mac-table']
    const ids = macTableScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual({ table: 'MAC 주소 테이블' })
    expect(text.notes).toEqual({ ...portLabels, ...noteLabels })
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([anchorConceptId])
    expect(text.label).toBe('MAC 주소 테이블을 채우고 지우는 도식')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = macTableScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 MAC 주소 테이블 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: 'MAC 주소 테이블을 채우고 지우는 도식' })

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

    it('440×216 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<MacTableDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 216')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·그룹·케이블·포트 이름표 id 집합과 화살표 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<MacTableDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 224')
      const tallNodes = await collectIds('[data-node]', 'data-node')
      const tallGroups = shownIds('[data-group]', 'data-group').sort()
      const tallLinkIds = shownIds('[data-link]', 'data-link').sort()
      const tallPortIds = shownIds('[data-port]', 'data-port').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 216')
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroups)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinkIds)
      expect(shownIds('[data-port]', 'data-port').sort()).toEqual(tallPortIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(await collectIds('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
    })

    it('노드와 표 박스가 440×216 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', async () => {
      render(<MacTableDiagram />)
      await expectFits([0, 0, 440, 216], wideGroup)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 줄·노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<MacTableDiagram />)
      await expectScenario(scenario, wideArrows, wideNotes, widePorts, wideGroup, 440, 216, container)
    })

    it('케이블은 늘 보이고 회색이며, 포트 이름표는 자기 호스트의 케이블 곁에 늘 보인다', () => {
      render(<MacTableDiagram />)
      expectLinks(wideLinks)
      expectPorts(widePorts, 440, 216)
      expectPortsBesideCables()
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
      render(<MacTableDiagram />)
      await expectArrowEnds()
    })

    it('표의 줄은 보낸 호스트의 출발지 주소와 그 포트로 적히고, 시간이 지나면 A의 줄이 흐려진다', async () => {
      render(<MacTableDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<MacTableDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 224')
      await selectScenario('시간이 지나면')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '시간이 지나면' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(diagram().querySelector('[data-node="row-a"]')).toHaveAttribute('opacity', '0.25')
      expect(diagram().querySelector('[data-note="aged-a"]')).toHaveAttribute('x', String(wideNotes['aged-a'].x))
    })
  })
})
