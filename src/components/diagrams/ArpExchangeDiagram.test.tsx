import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ArpExchangeDiagram, arpExchangeScenarios } from './ArpExchangeDiagram'

const topicId = 'arp'
const anchorConceptId = `${topicId}.arp-request-reply`
const labels = {
  'switch': '스위치',
  'host-a': '호스트 A',
  'host-b': '호스트 B',
  'host-c': '호스트 C',
  'host-d': '호스트 D',
}
const hostNoteLabels = {
  'ip-a': '192.0.2.1',
  'ip-b': '192.0.2.2',
  'ip-c': '192.0.2.3',
  'ip-d': '192.0.2.4',
}
const noteLabels = {
  'request-ip': 'ARP 요청 · 찾는 IP 주소 192.0.2.2',
  'request-mac': '목적지 MAC 주소 FF-FF-FF-FF-FF-FF',
  'check-b': '자기 IP 주소',
  'check-c': '답하지 않음',
  'check-d': '답하지 않음',
  'reply-mac': 'ARP 응답 · MAC 주소 00-00-5E-00-53-02',
  'reply-dst': '목적지 MAC 주소 00-00-5E-00-53-01',
}
type NoteId = keyof typeof noteLabels
type HostNoteId = keyof typeof hostNoteLabels

const nodeIds = Object.keys(labels)
const linkIds = ['cable-a', 'cable-b', 'cable-c', 'cable-d']
// IP 주소 곁말마다 그 주소를 쓰는 호스트.
const hostOf: Record<HostNoteId, string> = {
  'ip-a': 'host-a',
  'ip-b': 'host-b',
  'ip-c': 'host-c',
  'ip-d': 'host-d',
}
// 확인 곁말마다 그 곁말이 붙는 호스트.
const checkOf: Record<string, string> = {
  'check-b': 'host-b',
  'check-c': 'host-c',
  'check-d': 'host-d',
}

const tallLinks: Record<string, string> = {
  'cable-a': 'M38 40 V72',
  'cable-b': 'M106 40 V72',
  'cable-c': 'M174 40 V72',
  'cable-d': 'M242 40 V72',
}
const wideLinks: Record<string, string> = {
  'cable-a': 'M58 40 V64',
  'cable-b': 'M166 40 V64',
  'cable-c': 'M274 40 V64',
  'cable-d': 'M382 40 V64',
}
const tallArrows: Record<string, string> = {
  'req-from-a': 'M38 72 V40',
  'req-to-b': 'M106 40 V72',
  'req-to-c': 'M174 40 V72',
  'req-to-d': 'M242 40 V72',
  'rep-from-b': 'M106 72 V40',
  'rep-to-a': 'M38 40 V72',
}
const wideArrows: Record<string, string> = {
  'req-from-a': 'M58 64 V40',
  'req-to-b': 'M166 40 V64',
  'req-to-c': 'M274 40 V64',
  'req-to-d': 'M382 40 V64',
  'rep-from-b': 'M166 64 V40',
  'rep-to-a': 'M58 40 V64',
}
// 화살표마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'req-from-a': ['host-a', 'switch'],
  'req-to-b': ['switch', 'host-b'],
  'req-to-c': ['switch', 'host-c'],
  'req-to-d': ['switch', 'host-d'],
  'rep-from-b': ['host-b', 'switch'],
  'rep-to-a': ['switch', 'host-a'],
}

type Note = { x: number, y: number, anchor: 'start' | 'middle' | 'end' }
const tallNotes: Record<NoteId, Note> = {
  'request-ip': { x: 140, y: 140, anchor: 'middle' },
  'request-mac': { x: 140, y: 156, anchor: 'middle' },
  'check-b': { x: 106, y: 134, anchor: 'middle' },
  'check-c': { x: 174, y: 134, anchor: 'middle' },
  'check-d': { x: 242, y: 134, anchor: 'middle' },
  'reply-mac': { x: 140, y: 140, anchor: 'middle' },
  'reply-dst': { x: 140, y: 156, anchor: 'middle' },
}
const wideNotes: Record<NoteId, Note> = {
  'request-ip': { x: 220, y: 132, anchor: 'middle' },
  'request-mac': { x: 220, y: 146, anchor: 'middle' },
  'check-b': { x: 166, y: 128, anchor: 'middle' },
  'check-c': { x: 274, y: 128, anchor: 'middle' },
  'check-d': { x: 382, y: 128, anchor: 'middle' },
  'reply-mac': { x: 220, y: 132, anchor: 'middle' },
  'reply-dst': { x: 220, y: 146, anchor: 'middle' },
}
const tallHostNotes: Record<HostNoteId, Note> = {
  'ip-a': { x: 38, y: 118, anchor: 'middle' },
  'ip-b': { x: 106, y: 118, anchor: 'middle' },
  'ip-c': { x: 174, y: 118, anchor: 'middle' },
  'ip-d': { x: 242, y: 118, anchor: 'middle' },
}
const wideHostNotes: Record<HostNoteId, Note> = {
  'ip-a': { x: 58, y: 112, anchor: 'middle' },
  'ip-b': { x: 166, y: 112, anchor: 'middle' },
  'ip-c': { x: 274, y: 112, anchor: 'middle' },
  'ip-d': { x: 382, y: 112, anchor: 'middle' },
}

const question = 'ARP 요청과 응답은 누구에게 갈까?'
const idleCaption = '호스트 A~D가 스위치 하나에 이어진 같은 LAN이다. 호스트 A가 IP 주소 192.0.2.2를 쓰는 장치의 MAC 주소를 알아내려 한다. 버튼을 고르면 요청과 응답이 어디로 가는지 차례로 볼 수 있다.'
const legend = '가는 선은 케이블이고, 화살표는 ARP 메시지를 실은 프레임이 가는 길이다. 호스트 아래 숫자는 그 호스트의 IP 주소다.'
const figureName = '스위치 하나에 이은 호스트 A~D 가운데 호스트 A가 호스트 B의 MAC 주소를 찾을 때, ARP 요청과 ARP 응답이 누구에게 가는지 보이는 도식'
const expectedScenarios = [
  {
    id: 'request', label: 'ARP 요청',
    nodes: ['switch', 'host-a', 'host-b', 'host-c', 'host-d', ...linkIds],
    paths: ['req-from-a', 'req-to-b', 'req-to-c', 'req-to-d'],
    notes: ['request-ip', 'request-mac'] as NoteId[],
    caption: '호스트 A가 찾는 IP 주소 192.0.2.2를 담은 ARP 요청을 브로드캐스트한다. 목적지 MAC 주소가 FF-FF-FF-FF-FF-FF라 스위치는 이 요청을 B·C·D 모두에게 넘긴다.',
    sources: [anchorConceptId],
  },
  {
    id: 'check', label: '자기 것인지 확인',
    nodes: ['host-b', 'host-c', 'host-d'],
    paths: [] as string[],
    notes: ['check-b', 'check-c', 'check-d'] as NoteId[],
    caption: '요청을 받은 B·C·D는 저마다 찾는 IP 주소가 자기 IP 주소인지 본다. C와 D는 자기 주소가 아니라 답하지 않고, 자기 주소인 B는 답하기 전에 A의 IP 주소와 MAC 주소의 짝을 자기 ARP 캐시에 적어 둔다.',
    sources: [anchorConceptId],
  },
  {
    id: 'reply', label: 'ARP 응답',
    nodes: ['switch', 'host-a', 'host-b', 'cable-a', 'cable-b'],
    paths: ['rep-from-b', 'rep-to-a'],
    notes: ['reply-mac', 'reply-dst'] as NoteId[],
    caption: 'B만 자기 MAC 주소 00-00-5E-00-53-02를 담은 ARP 응답을 A의 MAC 주소 00-00-5E-00-53-01로 보낸다. 받을 장치를 A 하나로 정한 유니캐스트이고, 스위치는 이 응답을 A에게만 넘긴다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 168]
const wideBox: [number, number, number, number] = [0, 0, 440, 156]

function diagram() {
  return screen.getByRole('img', { name: '스위치 하나에 호스트 A·B·C·D가 이어져 있고, 호스트마다 IP 주소 192.0.2.1·192.0.2.2·192.0.2.3·192.0.2.4가 적혀 있다' })
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

// 글이 viewBox 안에 있고 노드·선과 겹치지 않는다.
function expectTextClear(text: Element, id: string, width: number, height: number) {
  const box = textBox(text, id)
  expect(box.x, id).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width, id).toBeLessThanOrEqual(width)
  expect(box.y, id).toBeGreaterThanOrEqual(0)
  expect(box.y + box.height, id).toBeLessThanOrEqual(height)
  for (const node of nodeIds.map(nodeBox)) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
  for (const line of diagram().querySelectorAll('[data-link], [data-path]')) {
    for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), `${id} ↔ 선`).toBe(false)
  }
}

// IP 주소 곁말은 늘 보이고, 자기 호스트 바로 아래 가운데에 놓여 그 호스트와 같은 흐림을 따른다.
function expectHostNotes(places: Record<HostNoteId, Note>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-host-note]'))
  expect(shown.map((note) => note.getAttribute('data-host-note')).sort()).toEqual(Object.keys(hostNoteLabels).sort())
  for (const note of shown) {
    const id = note.getAttribute('data-host-note')! as HostNoteId
    const host = nodeBox(hostOf[id])
    expect(note.textContent).toBe(hostNoteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', places[id].anchor)
    expect(places[id].x).toBe(host.x + host.width / 2)
    expect(places[id].y - 9).toBeGreaterThan(host.y + host.height)
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note).toHaveAttribute('opacity', diagram().querySelector(`[data-node="${hostOf[id]}"]`)!.getAttribute('opacity')!)
    expectTextClear(note, id, width, height)
  }
}

// 보이는 곁말이 지정한 id·글·자리이고, viewBox 안에서 노드·선·IP 주소 곁말·다른 곁말과 겹치지 않는다.
function expectNotes(ids: NoteId[], places: Record<NoteId, Note>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note')).sort()).toEqual([...ids].sort())
  const hostNotes = Array.from(diagram().querySelectorAll('[data-host-note]'), (note) => textBox(note, note.getAttribute('data-host-note')!))
  const boxes = shown.map((note) => textBox(note, note.getAttribute('data-note')!))
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
    for (const hostNote of hostNotes) expect(overlaps(textBox(note, id), hostNote), `${id} ↔ ${hostNote.id}`).toBe(false)
    for (const other of boxes.filter((box) => box.id !== id)) expect(overlaps(textBox(note, id), other), `${id} ↔ ${other.id}`).toBe(false)
  }
}

// 케이블 넷은 늘 보이고 스위치와 자기 호스트를 잇는다.
function expectLinks(links: Record<string, string>, scenarioNodes: string[] | null) {
  expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
  for (const link of diagram().querySelectorAll('[data-link]')) {
    const id = link.getAttribute('data-link')!
    expect(link).toHaveAttribute('d', links[id])
    expect(link).toHaveClass('stroke-muted')
    expect(link).toHaveAttribute('opacity', scenarioNodes && !scenarioNodes.includes(id) ? '0.25' : '1')
    expectLine(link, id, ['switch', `host-${id.slice(-1)}`])
  }
}

async function expectScenario(
  scenario: typeof expectedScenarios[number],
  links: Record<string, string>,
  arrows: Record<string, string>,
  places: Record<NoteId, Note>,
  hostPlaces: Record<HostNoteId, Note>,
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
  expectHostNotes(hostPlaces, width, height)
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

function hops() {
  return Array.from(diagram().querySelectorAll('[data-path]'), (path) => [nodeAt(lineEnds(path).start)!, nodeAt(lineEnds(path).end)!])
}

function noteText(id: string) {
  return diagram().querySelector(`[data-note="${id}"]`)!.textContent!
}

// 요점: 요청은 A에서 나가 스위치를 거쳐 B·C·D 셋 모두에 닿는다. 확인 단계에서 C·D는 「답하지 않음」이고 B만 다르다.
// 응답은 B에서 나가 스위치를 거쳐 A에서만 끝난다. 곁말의 주소는 본문의 예시 주소와 같다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')

  await selectScenario('ARP 요청')
  const request = hops()
  expect(request.filter(([from]) => from === 'host-a')).toEqual([['host-a', 'switch']])
  expect(request.filter(([from]) => from === 'switch').map(([, to]) => to).sort()).toEqual(['host-b', 'host-c', 'host-d'])
  expect(request.some(([, to]) => to === 'host-a')).toBe(false)
  expect(noteText('request-ip')).toBe(`ARP 요청 · 찾는 IP 주소 ${hostNoteLabels['ip-b']}`)
  expect(noteText('request-mac')).toContain('FF-FF-FF-FF-FF-FF')

  await selectScenario('자기 것인지 확인')
  expect(hops()).toEqual([])
  expect(noteText('check-c')).toBe('답하지 않음')
  expect(noteText('check-d')).toBe('답하지 않음')
  expect(noteText('check-b')).not.toBe('답하지 않음')
  for (const [id, host] of Object.entries(checkOf)) {
    const box = nodeBox(host)
    expect(Number(diagram().querySelector(`[data-note="${id}"]`)!.getAttribute('x')), id).toBe(box.x + box.width / 2)
  }
  expect(diagram().querySelector('[data-node="host-a"]')).toHaveAttribute('opacity', '0.25')

  await selectScenario('ARP 응답')
  const reply = hops()
  expect(reply).toEqual([['host-b', 'switch'], ['switch', 'host-a']])
  expect(reply.flat().some((id) => id === 'host-c' || id === 'host-d')).toBe(false)
  for (const id of ['host-c', 'host-d']) expect(diagram().querySelector(`[data-node="${id}"]`)).toHaveAttribute('opacity', '0.25')

  const macA = noteText('reply-dst').replace('목적지 MAC 주소 ', '')
  const macB = noteText('reply-mac').replace('ARP 응답 · MAC 주소 ', '')
  expect(body).toContain(`A~D의 IP 주소는 차례로 \`${hostNoteLabels['ip-a']}\`, \`${hostNoteLabels['ip-b']}\`, \`${hostNoteLabels['ip-c']}\`, \`${hostNoteLabels['ip-d']}\`이고`)
  expect(body).toContain(`A의 MAC 주소는 \`${macA}\`, B의 MAC 주소는 \`${macB}\`다`)
  expect(body).toContain('스위치는 이 요청을 B·C·D에게 모두 넘긴다')
  expect(body).toContain('C와 D는 자기 주소가 아니므로 답하지 않는다')
  expect(body).toContain(`자기 주소인 B만 자기 MAC 주소 \`${macB}\`를 담은 ARP 응답을 A의 MAC 주소 \`${macA}\`로 보낸다`)
  expect(body).toContain('이 응답을 A에게만 넘긴다')
  expect(body).toContain('`FF-FF-FF-FF-FF-FF`')
}

async function expectUniqueMarkers() {
  render(<><ArpExchangeDiagram /><ArpExchangeDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'ARP 요청' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(4)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('ArpExchangeDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<ArpExchangeDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 케이블이 모두 선명하고 화살표·곁말 없이 IP 주소와 선택 안내가 나온다', () => {
    const { container } = render(<ArpExchangeDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node], [data-host-note]')) expect(element).toHaveAttribute('opacity', '1')
    expectLinks(tallLinks, null)
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expectHostNotes(tallHostNotes, 280, 168)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<ArpExchangeDiagram />)
    await expectScenario(scenario, tallLinks, tallArrows, tallNotes, tallHostNotes, 280, 168, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<ArpExchangeDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node], [data-link], [data-host-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드가 280×168 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<ArpExchangeDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 168')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<ArpExchangeDiagram />)
    await expectArrowEnds()
  })

  it('요청은 A에서 B·C·D 모두에 닿고, C·D는 답하지 않으며, 응답은 B에서 A로만 간다', async () => {
    render(<ArpExchangeDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<ArpExchangeDiagram />)
    const text = visualsByTopicId[topicId].diagrams['arp-exchange']
    const ids = arpExchangeScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toBeUndefined()
    expect(text.notes).toEqual({ ...hostNoteLabels, ...noteLabels })
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([anchorConceptId])
    expect(text.label).toBe(figureName)
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = arpExchangeScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 ARP 요청과 응답 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×156 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커·케이블·IP 주소를 유지한다', () => {
      render(<ArpExchangeDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 156')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
      expectLinks(wideLinks, null)
      expectHostNotes(wideHostNotes, 440, 156)
    })

    it('노드·케이블 id 집합과 화살표·곁말 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<ArpExchangeDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 168')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallLinkIds = shownIds('[data-link]', 'data-link').sort()
      const tallHostNoteIds = shownIds('[data-host-note]', 'data-host-note').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')
      const tallNoteIds = await collectIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 156')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinkIds)
      expect(shownIds('[data-host-note]', 'data-host-note').sort()).toEqual(tallHostNoteIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(tallNoteIds).toEqual(Object.keys(noteLabels).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
      expect(await collectIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
    })

    it('모든 rect가 440×156 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<ArpExchangeDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<ArpExchangeDiagram />)
      await expectScenario(scenario, wideLinks, wideArrows, wideNotes, wideHostNotes, 440, 156, container)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<ArpExchangeDiagram />)
      await expectArrowEnds()
    })

    it('요청은 A에서 B·C·D 모두에 닿고, C·D는 답하지 않으며, 응답은 B에서 A로만 간다', async () => {
      render(<ArpExchangeDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<ArpExchangeDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 168')
      await selectScenario('ARP 응답')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: 'ARP 응답' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['rep-from-b', 'rep-to-a'])
      for (const path of paths) expect(path).toHaveAttribute('d', wideArrows[path.getAttribute('data-path')!])
      expect(diagram().querySelector('[data-note="reply-dst"]')).toHaveAttribute('x', String(wideNotes['reply-dst'].x))
    })
  })
})
