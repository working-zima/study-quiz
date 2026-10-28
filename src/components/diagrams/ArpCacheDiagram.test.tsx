import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ArpCacheDiagram, arpCacheScenarios } from './ArpCacheDiagram'

const topicId = 'arp'
const anchorConceptId = `${topicId}.arp-cache`
const labels = {
  'host-a': '호스트 A',
  'host-b': '호스트 B',
  'host-d': '호스트 D',
  'row-b-ip': '192.0.2.2',
  'row-b-mac': '00-00-5E-00-53-02',
  'row-c-ip': '192.0.2.3',
  'row-c-mac': '00-00-5E-00-53-03',
}
const groupLabels = { cache: '호스트 A의 ARP 캐시' }
const noteLabels = {
  'hit-note': 'ARP 요청 없이 바로 보냄',
  'request-note': 'ARP 요청 · 찾는 IP 주소 192.0.2.4',
  'add-note': '표에 더함 · 192.0.2.4 · 00-00-5E-00-53-04',
  'expire-note': '시간이 지나 지워짐',
}
type NoteId = keyof typeof noteLabels

const nodeIds = Object.keys(labels)
const rowIds = ['row-b-ip', 'row-b-mac', 'row-c-ip', 'row-c-mac']

const tallArrows: Record<string, string> = {
  'send-b': 'M90 24 H190',
  'request-b': 'M90 24 H190',
  'request-d': 'M50 40 V72 H190',
}
const wideArrows: Record<string, string> = {
  'send-b': 'M114 24 H326',
  'request-b': 'M114 24 H326',
  'request-d': 'M64 40 V72 H326',
}
const ends: Record<string, [string, string]> = {
  'send-b': ['host-a', 'host-b'],
  'request-b': ['host-a', 'host-b'],
  'request-d': ['host-a', 'host-d'],
}

type Note = { x: number, y: number, anchor: 'start' | 'middle' | 'end' }
const tallNotes: Record<NoteId, Note> = {
  'hit-note': { x: 140, y: 52, anchor: 'middle' },
  'request-note': { x: 56, y: 98, anchor: 'start' },
  'add-note': { x: 140, y: 222, anchor: 'middle' },
  'expire-note': { x: 140, y: 222, anchor: 'middle' },
}
const wideNotes: Record<NoteId, Note> = {
  'hit-note': { x: 220, y: 52, anchor: 'middle' },
  'request-note': { x: 70, y: 98, anchor: 'start' },
  'add-note': { x: 220, y: 222, anchor: 'middle' },
  'expire-note': { x: 220, y: 222, anchor: 'middle' },
}
const tallGroup = { x: 10, y: 104, width: 260, height: 100 }
const wideGroup = { x: 14, y: 104, width: 412, height: 100 }

const question = 'ARP 캐시가 있으면 무엇이 달라질까?'
const idleCaption = '호스트 A의 ARP 캐시에는 호스트 B와 호스트 C의 짝이 적혀 있다. 버튼을 고르면 짝이 있는 B에게 보낼 때, 짝이 없는 D에게 보낼 때, 시간이 지난 뒤가 어떻게 다른지 볼 수 있다.'
const legend = '아래 상자는 호스트 A의 ARP 캐시이고, 한 줄에 IP 주소와 그 주소를 쓰는 장치의 MAC 주소가 짝지어 있다. 화살표는 호스트 A가 보내는 프레임이 가는 길이다.'
const figureName = '호스트 A가 ARP 캐시에 짝이 있는 상대와 없는 상대에게 보낼 때, 그리고 시간이 지나 줄이 지워질 때를 견주는 도식'
const svgName = '호스트 A·B·D와 호스트 A의 ARP 캐시. 캐시에는 192.0.2.2와 00-00-5E-00-53-02, 192.0.2.3과 00-00-5E-00-53-03의 두 줄이 있다'
const expectedScenarios = [
  {
    id: 'hit', label: '캐시에 있음',
    nodes: ['host-a', 'host-b', 'row-b-ip', 'row-b-mac'],
    paths: ['send-b'],
    notes: ['hit-note'] as NoteId[],
    caption: '호스트 A가 B에게 보내려고 먼저 ARP 캐시를 보니 192.0.2.2의 짝이 있다. 거기 적힌 MAC 주소 00-00-5E-00-53-02를 목적지 MAC 주소 칸에 넣어 ARP 요청 없이 바로 프레임을 보낸다.',
    sources: [anchorConceptId],
  },
  {
    id: 'miss', label: '캐시에 없음',
    nodes: ['host-a', 'host-b', 'host-d', ...rowIds],
    paths: ['request-b', 'request-d'],
    notes: ['request-note', 'add-note'] as NoteId[],
    caption: '호스트 D(192.0.2.4)의 짝은 캐시에 없다. A는 ARP 요청을 브로드캐스트하고, D가 답한 MAC 주소 00-00-5E-00-53-04를 캐시에 더한 뒤 프레임을 보낸다.',
    sources: [anchorConceptId],
  },
  {
    id: 'expire', label: '시간이 지남',
    nodes: ['host-a', 'host-b', 'host-d', 'row-b-ip', 'row-b-mac'],
    paths: [] as string[],
    notes: ['expire-note'] as NoteId[],
    caption: '정해진 시간이 지나면 C의 줄이 지워진다. 얼마 뒤에 지울지는 운영체제마다 다르고, 줄이 지워진 뒤 A가 C에게 보내려면 처음처럼 ARP 요청부터 다시 보낸다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 232]
const wideBox: [number, number, number, number] = [0, 0, 440, 232]

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
  return nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))
}

function groupLabel() {
  return diagram().querySelector('[data-group-label="cache"]')!
}

// 글이 viewBox 안에 있고 노드·선·그룹 라벨과 겹치지 않는다.
function expectTextClear(text: Element, id: string, width: number, height: number) {
  const box = textBox(text, id)
  expect(box.x, id).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width, id).toBeLessThanOrEqual(width)
  expect(box.y, id).toBeGreaterThanOrEqual(0)
  expect(box.y + box.height, id).toBeLessThanOrEqual(height)
  for (const node of nodeIds.map(nodeBox)) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
  for (const line of diagram().querySelectorAll('[data-path]')) {
    for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), `${id} ↔ 선`).toBe(false)
  }
}

function expectNotes(ids: NoteId[], places: Record<NoteId, Note>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note')).sort()).toEqual([...ids].sort())
  for (const note of shown) {
    const id = note.getAttribute('data-note')! as NoteId
    expect(note.textContent).toBe(noteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', places[id].anchor)
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note.closest('[opacity]')).toBeNull()
    expectTextClear(note, id, width, height)
    expect(overlaps(textBox(note, id), textBox(groupLabel(), 'cache')), `${id} ↔ 그룹 라벨`).toBe(false)
    expect(overlaps(textBox(note, id), readBox(diagram().querySelector('[data-group="cache"]')!)), `${id} ↔ 캐시 상자`).toBe(false)
  }
}

// 캐시 상자와 그 라벨은 늘 보이고 흐려지지 않는다. 캐시의 줄 넷은 상자 안에 있고, 두 줄은 IP 주소 칸과 MAC 주소 칸이 맞붙어 있다.
function expectGroup(group: typeof tallGroup) {
  const rect = diagram().querySelector('[data-group="cache"]')!
  expect(readBox(rect)).toEqual({ id: 'cache', ...group })
  expect(rect.closest('[opacity]')).toBeNull()
  expect(groupLabel().textContent).toBe(groupLabels.cache)
  expect(groupLabel()).toHaveAttribute('font-size', '9')
  expect(groupLabel().closest('[opacity]')).toBeNull()
  const label = textBox(groupLabel(), 'cache')
  expect(label.x).toBeGreaterThanOrEqual(group.x)
  expect(label.x + label.width).toBeLessThanOrEqual(group.x + group.width)
  expect(label.y).toBeGreaterThanOrEqual(group.y)
  for (const id of nodeIds) {
    const box = nodeBox(id)
    const inside = box.x >= group.x && box.x + box.width <= group.x + group.width && box.y >= group.y && box.y + box.height <= group.y + group.height
    expect(inside, id).toBe(rowIds.includes(id))
    expect(overlaps(label, box), `그룹 라벨 ↔ ${id}`).toBe(false)
  }
  for (const row of ['b', 'c']) {
    const ip = nodeBox(`row-${row}-ip`)
    const mac = nodeBox(`row-${row}-mac`)
    expect(ip.y).toBe(mac.y)
    expect(ip.x + ip.width).toBe(mac.x)
  }
  expect(nodeBox('row-c-ip').y).toBeGreaterThan(nodeBox('row-b-ip').y)
}

async function expectScenario(
  scenario: typeof expectedScenarios[number],
  arrows: Record<string, string>,
  places: Record<NoteId, Note>,
  group: typeof tallGroup,
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
  expectNotes(scenario.notes, places, width, height)
  expectGroup(group)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length + 1)
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

// 화살표 양 끝은 두 노드의 변에 닿고, 어떤 선분도 노드 안과 그룹 라벨 영역을 지나지 않는다.
async function expectArrowEnds() {
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
    for (const path of diagram().querySelectorAll('[data-path]')) {
      const id = path.getAttribute('data-path')!
      for (const segment of segments(path.getAttribute('d')!)) {
        for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
        expect(touches(segment, textBox(groupLabel(), 'cache')), `${id} ↔ 그룹 라벨`).toBe(false)
      }
      const { start, end } = lineEnds(path)
      expect(nodeAt(start), `${id} 시작`).toBe(ends[id][0])
      expect(nodeAt(end), `${id} 끝`).toBe(ends[id][1])
    }
  }
}

// 요점: 캐시에 짝이 있으면 ARP 요청 없이 바로 보내고, 없으면 ARP 요청을 브로드캐스트하며 답을 표에 더한다.
// 시간이 지나면 지워지는 줄(C)만 흐려진다. 곁말의 주소는 본문의 예시 주소와 같다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')

  await selectScenario('캐시에 있음')
  expect(shownIds('[data-path]', 'data-path').some((id) => id.startsWith('request'))).toBe(false)
  expect(shownIds('[data-note]', 'data-note').some((id) => noteLabels[id as NoteId].includes('ARP 요청 ·'))).toBe(false)
  expect(diagram().querySelector('[data-node="row-b-mac"]')).toHaveAttribute('opacity', '1')
  expect(diagram().querySelector('[data-node="row-c-mac"]')).toHaveAttribute('opacity', '0.25')

  await selectScenario('캐시에 없음')
  expect(shownIds('[data-path]', 'data-path').filter((id) => id.startsWith('request')).sort()).toEqual(['request-b', 'request-d'])
  expect(diagram().querySelector('[data-note="request-note"]')!.textContent).toContain('ARP 요청')
  expect(diagram().querySelector('[data-note="add-note"]')!.textContent).toContain('192.0.2.4')
  for (const id of rowIds) expect(diagram().querySelector(`[data-node="${id}"]`)).toHaveAttribute('opacity', '1')

  await selectScenario('시간이 지남')
  const faded = shownIds('[data-node]', 'data-node').filter((id) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '0.25')
  expect(faded.sort()).toEqual(['row-c-ip', 'row-c-mac'])
  expect(shownIds('[data-path]', 'data-path')).toEqual([])
  const expire = textBox(diagram().querySelector('[data-note="expire-note"]')!, 'expire-note')
  expect(expire.y).toBeGreaterThan(nodeBox('row-c-ip').y + 32)

  expect(body).toContain('호스트 B의 IP 주소 `192.0.2.2`와 MAC 주소 `00-00-5E-00-53-02`')
  expect(body).toContain('호스트 C의 IP 주소 `192.0.2.3`과 MAC 주소 `00-00-5E-00-53-03`')
  expect(body).toContain('A가 B에게 보낼 때는 표에서 B의 짝을 찾아 ARP 요청 없이 바로 보낸다')
  expect(body).toContain('ARP 요청을 브로드캐스트하고, D가 답한 MAC 주소 `00-00-5E-00-53-04`를 표에 더한 뒤 보낸다')
  expect(body).toContain('시간이 지나 C의 줄이 지워지면')
  expect(body).toContain('호스트 D(`192.0.2.4`)')
}

async function expectUniqueMarkers() {
  render(<><ArpCacheDiagram /><ArpCacheDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '캐시에 없음' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(2)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('ArpCacheDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<ArpCacheDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표·곁말 없이 캐시 상자와 선택 안내가 나온다', () => {
    const { container } = render(<ArpCacheDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expectGroup(tallGroup)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<ArpCacheDiagram />)
    await expectScenario(scenario, tallArrows, tallNotes, tallGroup, 280, 232, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<ArpCacheDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드와 캐시 상자가 280×232 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<ArpCacheDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 232')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
    render(<ArpCacheDiagram />)
    await expectArrowEnds()
  })

  it('캐시에 있으면 ARP 요청이 없고, 없으면 ARP 요청과 더한 줄이 보이며, 시간이 지나면 C의 줄만 흐려진다', async () => {
    render(<ArpCacheDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<ArpCacheDiagram />)
    const text = visualsByTopicId[topicId].diagrams['arp-cache']
    const ids = arpCacheScenarios.map(({ id }) => id).sort()
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
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = arpCacheScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 ARP 캐시 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×232 viewBox를 w-full 래퍼 하나로 그리고 캐시 상자를 유지한다', () => {
      render(<ArpCacheDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 232')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
      expectGroup(wideGroup)
    })

    it('노드·그룹 id 집합과 화살표·곁말 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<ArpCacheDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 232')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroups = shownIds('[data-group]', 'data-group').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')
      const tallNoteIds = await collectIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 232')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroups)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(tallNoteIds).toEqual(Object.keys(noteLabels).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
      expect(await collectIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
    })

    it('모든 rect가 440×232 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<ArpCacheDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<ArpCacheDiagram />)
      await expectScenario(scenario, wideArrows, wideNotes, wideGroup, 440, 232, container)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
      render(<ArpCacheDiagram />)
      await expectArrowEnds()
    })

    it('캐시에 있으면 ARP 요청이 없고, 없으면 ARP 요청과 더한 줄이 보이며, 시간이 지나면 C의 줄만 흐려진다', async () => {
      render(<ArpCacheDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<ArpCacheDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 232')
      await selectScenario('캐시에 없음')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '캐시에 없음' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['request-b', 'request-d'])
      for (const path of paths) expect(path).toHaveAttribute('d', wideArrows[path.getAttribute('data-path')!])
      expect(diagram().querySelector('[data-note="add-note"]')).toHaveAttribute('x', String(wideNotes['add-note'].x))
    })
  })
})
