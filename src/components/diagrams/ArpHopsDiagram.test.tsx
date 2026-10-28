import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ArpHopsDiagram, arpHopsScenarios } from './ArpHopsDiagram'

const topicId = 'arp'
const anchorConceptId = `${topicId}.arp-across-routers`
const labels = {
  'host-a': '호스트 A',
  'router-1': '라우터 1',
  'router-2': '라우터 2',
  'host-e': '호스트 E',
}
const noteLabels = {
  'ask-1': 'ARP로 묻는 IP 주소 192.0.2.254',
  'src-mac-1': '출발지 MAC 주소 00-00-5E-00-53-01',
  'dst-mac-1': '목적지 MAC 주소 00-00-5E-00-53-10',
  'ask-2': 'ARP로 묻는 IP 주소 203.0.113.2',
  'src-mac-2': '출발지 MAC 주소 00-00-5E-00-53-11',
  'dst-mac-2': '목적지 MAC 주소 00-00-5E-00-53-12',
  'ask-3': 'ARP로 묻는 IP 주소 198.51.100.1',
  'src-mac-3': '출발지 MAC 주소 00-00-5E-00-53-13',
  'dst-mac-3': '목적지 MAC 주소 00-00-5E-00-53-05',
  'src-ip': '출발지 IP 주소 192.0.2.1',
  'dst-ip': '목적지 IP 주소 198.51.100.1',
}
type NoteId = keyof typeof noteLabels

const nodeIds = Object.keys(labels)
const linkIds = ['link-1', 'link-2', 'link-3']
// 연결마다 잇는 두 노드.
const linkEnds: Record<string, [string, string]> = {
  'link-1': ['host-a', 'router-1'],
  'link-2': ['router-1', 'router-2'],
  'link-3': ['router-2', 'host-e'],
}

const tallLinks: Record<string, string> = {
  'link-1': 'M48 40 V72',
  'link-2': 'M48 104 V136',
  'link-3': 'M48 168 V200',
}
const wideLinks: Record<string, string> = {
  'link-1': 'M94 24 H125',
  'link-2': 'M205 24 H236',
  'link-3': 'M316 24 H346',
}
const tallArrows: Record<string, string> = {
  'hop-1': 'M48 40 V72',
  'hop-2': 'M48 104 V136',
  'hop-3': 'M48 168 V200',
}
const wideArrows: Record<string, string> = {
  'hop-1': 'M94 24 H125',
  'hop-2': 'M205 24 H236',
  'hop-3': 'M316 24 H346',
}
// 화살표마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'hop-1': ['host-a', 'router-1'],
  'hop-2': ['router-1', 'router-2'],
  'hop-3': ['router-2', 'host-e'],
}

type Note = { x: number, y: number, anchor: 'start' | 'middle' | 'end' }
const tallNotes: Record<NoteId, Note> = {
  'ask-1': { x: 94, y: 84, anchor: 'start' },
  'src-mac-1': { x: 94, y: 104, anchor: 'start' },
  'dst-mac-1': { x: 94, y: 120, anchor: 'start' },
  'ask-2': { x: 94, y: 84, anchor: 'start' },
  'src-mac-2': { x: 94, y: 104, anchor: 'start' },
  'dst-mac-2': { x: 94, y: 120, anchor: 'start' },
  'ask-3': { x: 94, y: 84, anchor: 'start' },
  'src-mac-3': { x: 94, y: 104, anchor: 'start' },
  'dst-mac-3': { x: 94, y: 120, anchor: 'start' },
  'src-ip': { x: 94, y: 144, anchor: 'start' },
  'dst-ip': { x: 94, y: 160, anchor: 'start' },
}
const wideNotes: Record<NoteId, Note> = {
  'ask-1': { x: 14, y: 60, anchor: 'start' },
  'src-mac-1': { x: 14, y: 76, anchor: 'start' },
  'dst-mac-1': { x: 14, y: 92, anchor: 'start' },
  'ask-2': { x: 14, y: 60, anchor: 'start' },
  'src-mac-2': { x: 14, y: 76, anchor: 'start' },
  'dst-mac-2': { x: 14, y: 92, anchor: 'start' },
  'ask-3': { x: 14, y: 60, anchor: 'start' },
  'src-mac-3': { x: 14, y: 76, anchor: 'start' },
  'dst-mac-3': { x: 14, y: 92, anchor: 'start' },
  'src-ip': { x: 240, y: 76, anchor: 'start' },
  'dst-ip': { x: 240, y: 92, anchor: 'start' },
}

const question = '라우터를 지날 때 바뀌는 주소는 무엇일까?'
const idleCaption = '호스트 A(192.0.2.1)가 라우터 둘 너머 다른 네트워크의 호스트 E(198.51.100.1)에게 데이터를 보낸다. 버튼을 고르면 구간마다 ARP로 무엇을 묻고, 프레임과 IP 패킷에 어떤 주소가 적히는지 볼 수 있다.'
const legend = '가는 선은 장치를 잇는 연결이고, 화살표는 그 구간의 프레임이 가는 길이다. 그림 곁의 글은 그 구간에서 ARP로 묻는 IP 주소, 프레임의 MAC 주소, 그 프레임에 담긴 IP 패킷의 IP 주소다.'
const figureName = '호스트 A가 라우터 1과 라우터 2를 거쳐 다른 네트워크의 호스트 E에게 보낼 때, 구간마다 ARP로 묻는 IP 주소와 프레임의 MAC 주소, IP 패킷의 IP 주소를 견주는 도식'
const expectedScenarios = [
  {
    id: 'hop-1', label: '첫 구간',
    nodes: ['host-a', 'router-1', 'link-1'],
    paths: ['hop-1'],
    notes: ['ask-1', 'src-mac-1', 'dst-mac-1', 'src-ip', 'dst-ip'] as NoteId[],
    caption: '호스트 A는 E가 다른 네트워크에 있어 기본 게이트웨이인 라우터 1로 보낸다. E가 아니라 라우터 1의 IP 주소 192.0.2.254를 ARP로 물어 MAC 주소 00-00-5E-00-53-10을 알아내고, 그 주소를 목적지 MAC 주소로 적는다.',
    sources: [anchorConceptId],
  },
  {
    id: 'hop-2', label: '가운데 구간',
    nodes: ['router-1', 'router-2', 'link-2'],
    paths: ['hop-2'],
    notes: ['ask-2', 'src-mac-2', 'dst-mac-2', 'src-ip', 'dst-ip'] as NoteId[],
    caption: '라우터 1은 받은 프레임을 떼어 내고 목적지 IP 주소를 본 뒤 라우터 2(203.0.113.2)로 넘기기로 한다. 이 구간에서 다시 ARP로 라우터 2의 MAC 주소를 알아내 새 프레임에 담는다.',
    sources: [anchorConceptId],
  },
  {
    id: 'hop-3', label: '마지막 구간',
    nodes: ['router-2', 'host-e', 'link-3'],
    paths: ['hop-3'],
    notes: ['ask-3', 'src-mac-3', 'dst-mac-3', 'src-ip', 'dst-ip'] as NoteId[],
    caption: '라우터 2는 E가 자기와 이어진 네트워크에 있어 E의 MAC 주소 00-00-5E-00-53-05를 ARP로 알아내 넘긴다. 세 구간 내내 IP 패킷의 출발지·목적지 IP 주소는 그대로다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 240]
const wideBox: [number, number, number, number] = [0, 0, 440, 104]

function diagram() {
  return screen.getByRole('img', { name: '호스트 A, 라우터 1, 라우터 2, 호스트 E가 차례로 이어져 있다' })
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
    for (const line of diagram().querySelectorAll('[data-link], [data-path]')) {
      for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), `${id} ↔ 선`).toBe(false)
    }
    for (const other of boxes.filter((item) => item.id !== id)) expect(overlaps(box, other), `${id} ↔ ${other.id}`).toBe(false)
  }
}

// 연결 셋은 늘 보이고 이웃한 두 장치를 잇는다.
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

function noteText(id: string) {
  return diagram().querySelector(`[data-note="${id}"]`)!.textContent!
}

// 요점: 세 구간의 IP 곁말(출발지·목적지)은 모두 같고, MAC 곁말은 구간마다 다르다. 구간마다 보이는 화살표는 그 구간 하나다.
// 첫 구간에서 ARP로 묻는 것은 목적지 E가 아니라 라우터 1의 IP 주소이고, E의 IP 주소를 묻는 것은 마지막 구간뿐이다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const ips: string[] = []
  const macs: string[] = []
  const asked: string[] = []

  for (const [index, scenario] of expectedScenarios.entries()) {
    await selectScenario(scenario.label)
    const paths = shownIds('[data-path]', 'data-path')
    expect(paths).toEqual([`hop-${index + 1}`])
    const { start, end } = lineEnds(diagram().querySelector('[data-path]')!)
    expect([nodeAt(start), nodeAt(end)]).toEqual(ends[paths[0]])
    ips.push(`${noteText('src-ip')} | ${noteText('dst-ip')}`)
    macs.push(`${noteText(`src-mac-${index + 1}`)} | ${noteText(`dst-mac-${index + 1}`)}`)
    asked.push(noteText(`ask-${index + 1}`).replace('ARP로 묻는 IP 주소 ', ''))
  }

  expect(new Set(ips).size).toBe(1)
  expect(new Set(macs).size).toBe(3)
  const destination = noteText('dst-ip').replace('목적지 IP 주소 ', '')
  expect(asked[0]).not.toBe(destination)
  expect(asked[1]).not.toBe(destination)
  expect(asked[2]).toBe(destination)

  expect(body).toContain('IP 패킷에 적힌 출발지 IP 주소 `192.0.2.1`과 목적지 IP 주소 `198.51.100.1`은 모든 구간에서 그대로다')
  expect(body).toContain('E가 아니라 `192.0.2.254`의 MAC 주소를 ARP로 물어 `00-00-5E-00-53-10`을 알아낸다')
  expect(body).toContain('프레임의 출발지 MAC 주소는 `00-00-5E-00-53-01`, 목적지 MAC 주소는 `00-00-5E-00-53-10`이다')
  expect(body).toContain('라우터 2(`203.0.113.2`)로 정하고 그 MAC 주소 `00-00-5E-00-53-12`를 ARP로 알아내')
  expect(body).toContain('이 구간의 출발지 MAC 주소는 `00-00-5E-00-53-11`이다')
  expect(body).toContain('E의 MAC 주소 `00-00-5E-00-53-05`를 ARP로 알아내, 출발지 MAC 주소 `00-00-5E-00-53-13`으로 프레임을 보낸다')
}

async function expectUniqueMarkers() {
  render(<><ArpHopsDiagram /><ArpHopsDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '가운데 구간' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(1)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('ArpHopsDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<ArpHopsDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 연결이 모두 선명하고 화살표·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<ArpHopsDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expectLinks(tallLinks, null)
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<ArpHopsDiagram />)
    await expectScenario(scenario, tallLinks, tallArrows, tallNotes, 280, 240, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<ArpHopsDiagram />)
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

  it('노드가 280×240 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<ArpHopsDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 240')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<ArpHopsDiagram />)
    await expectArrowEnds()
  })

  it('구간마다 화살표는 그 구간 하나이고, IP 곁말은 모두 같으며 MAC 곁말은 구간마다 다르다', async () => {
    render(<ArpHopsDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<ArpHopsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['arp-hops']
    const ids = arpHopsScenarios.map(({ id }) => id).sort()
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
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = arpHopsScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 다른 네트워크로 보낼 때의 ARP 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×104 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커와 연결을 유지한다', () => {
      render(<ArpHopsDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 104')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
      expectLinks(wideLinks, null)
    })

    it('노드·연결 id 집합과 화살표·곁말 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<ArpHopsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 240')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallLinkIds = shownIds('[data-link]', 'data-link').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')
      const tallNoteIds = await collectIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 104')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinkIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(tallNoteIds).toEqual(Object.keys(noteLabels).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
      expect(await collectIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
    })

    it('모든 rect가 440×104 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<ArpHopsDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<ArpHopsDiagram />)
      await expectScenario(scenario, wideLinks, wideArrows, wideNotes, 440, 104, container)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<ArpHopsDiagram />)
      await expectArrowEnds()
    })

    it('구간마다 화살표는 그 구간 하나이고, IP 곁말은 모두 같으며 MAC 곁말은 구간마다 다르다', async () => {
      render(<ArpHopsDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<ArpHopsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 240')
      await selectScenario('마지막 구간')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '마지막 구간' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['hop-3'])
      expect(paths[0]).toHaveAttribute('d', wideArrows['hop-3'])
      expect(diagram().querySelector('[data-note="dst-ip"]')).toHaveAttribute('x', String(wideNotes['dst-ip'].x))
    })
  })
})
