import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { SubnettingDiagram, subnettingScenarios } from './SubnettingDiagram'

const topicId = 'ip-addressing'
const anchorConceptId = `${topicId}.subnetting`
const labels = {
  net: '192.0.2.0/24',
  s0: '192.0.2.0/26',
  s64: '192.0.2.64/26',
  s128: '192.0.2.128/26',
  s192: '192.0.2.192/26',
}
const noteLabels = {
  'bits-0': '넷째 옥텟 00000000',
  'bits-64': '넷째 옥텟 01000000',
  'bits-128': '넷째 옥텟 10000000',
  'bits-192': '넷째 옥텟 11000000',
  'range-net': '네트워크 주소 192.0.2.64',
  'range-first': '호스트에 붙일 첫 주소 192.0.2.65',
  'range-last': '호스트에 붙일 끝 주소 192.0.2.126',
  'range-broadcast': '브로드캐스트 주소 192.0.2.127',
}
type NoteId = keyof typeof noteLabels

const nodeIds = Object.keys(labels)
const subnetIds = ['s0', 's64', 's128', 's192']
// 2진수 곁말마다 그 곁말이 붙는 서브넷.
const bitsOf: Record<string, string> = { 'bits-0': 's0', 'bits-64': 's64', 'bits-128': 's128', 'bits-192': 's192' }

const tallArrows: Record<string, string> = {
  'to-0': 'M40 40 V72 H64',
  'to-64': 'M32 40 V116 H64',
  'to-128': 'M24 40 V160 H64',
  'to-192': 'M16 40 V204 H64',
}
const wideArrows: Record<string, string> = {
  'to-0': 'M104 84 H124 V24 H144',
  'to-64': 'M104 92 H132 V72 H144',
  'to-128': 'M104 100 H132 V120 H144',
  'to-192': 'M104 108 H124 V168 H144',
}
// 화살표마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'to-0': ['net', 's0'],
  'to-64': ['net', 's64'],
  'to-128': ['net', 's128'],
  'to-192': ['net', 's192'],
}

type Note = { x: number, y: number, anchor: 'start' | 'middle' | 'end' }
const tallNotes: Record<NoteId, Note> = {
  'bits-0': { x: 176, y: 75, anchor: 'start' },
  'bits-64': { x: 176, y: 119, anchor: 'start' },
  'bits-128': { x: 176, y: 163, anchor: 'start' },
  'bits-192': { x: 176, y: 207, anchor: 'start' },
  'range-net': { x: 8, y: 242, anchor: 'start' },
  'range-first': { x: 8, y: 256, anchor: 'start' },
  'range-last': { x: 8, y: 270, anchor: 'start' },
  'range-broadcast': { x: 8, y: 284, anchor: 'start' },
}
const wideNotes: Record<NoteId, Note> = {
  'bits-0': { x: 256, y: 27, anchor: 'start' },
  'bits-64': { x: 256, y: 75, anchor: 'start' },
  'bits-128': { x: 256, y: 123, anchor: 'start' },
  'bits-192': { x: 256, y: 171, anchor: 'start' },
  'range-net': { x: 256, y: 57, anchor: 'start' },
  'range-first': { x: 256, y: 70, anchor: 'start' },
  'range-last': { x: 256, y: 83, anchor: 'start' },
  'range-broadcast': { x: 256, y: 96, anchor: 'start' },
}

const question = '네트워크 하나를 넷으로 나누면 주소가 어떻게 갈릴까?'
const idleCaption = '192.0.2.0/24는 앞 24비트가 네트워크 부분이고 넷째 옥텟 8비트가 호스트 부분인 네트워크다. 이 네트워크를 접두사 길이가 /26인 서브넷 넷으로 나눴다. 버튼을 고르면 어떻게 나뉘는지와, 서브넷 하나 안의 주소를 볼 수 있다.'
const legend = '맨 왼쪽 상자가 나누기 전의 네트워크이고, 그 오른쪽 상자 넷이 나눈 서브넷이다. 화살표는 나누기 전 네트워크에서 각 서브넷으로 이어진다.'
const figureName = '네트워크 하나를 서브넷 넷으로 나누고, 그 가운데 서브넷 하나의 주소 범위를 보이는 도식'
const svgName = '192.0.2.0/24 네트워크를 넷째 옥텟의 앞 2비트로 나눈 서브넷 192.0.2.0/26, 192.0.2.64/26, 192.0.2.128/26, 192.0.2.192/26과, 192.0.2.64/26의 네트워크 주소 192.0.2.64, 호스트에 붙일 첫 주소 192.0.2.65와 끝 주소 192.0.2.126, 브로드캐스트 주소 192.0.2.127'
const expectedScenarios = [
  {
    id: 'split', label: '넷으로 나누기',
    nodes: ['net', ...subnetIds],
    paths: ['to-0', 'to-64', 'to-128', 'to-192'],
    notes: ['bits-0', 'bits-64', 'bits-128', 'bits-192'] as NoteId[],
    caption: '넷째 옥텟의 앞 2비트를 네트워크 쪽으로 넘기면 2² = 4개의 서브넷이 생기고, 남은 6비트로 서브넷마다 주소가 2⁶ = 64개씩 든다. 앞 2비트가 00, 01, 10, 11인 서브넷의 첫 주소는 넷째 옥텟이 0, 64, 128, 192다.',
    sources: [anchorConceptId],
  },
  {
    id: 'range', label: '서브넷 하나의 범위',
    nodes: ['s64'],
    paths: [] as string[],
    notes: ['range-net', 'range-first', 'range-last', 'range-broadcast'] as NoteId[],
    caption: '192.0.2.64/26에서 호스트 부분 6비트가 모두 0인 192.0.2.64는 네트워크 주소이고, 모두 1인 192.0.2.127은 브로드캐스트 주소다. 그 사이 192.0.2.65부터 192.0.2.126까지 62개를 호스트에 붙인다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 290]
const wideBox: [number, number, number, number] = [0, 0, 440, 192]

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

function label(id: string) {
  return diagram().querySelector(`[data-node="${id}"] text`)!.textContent!
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

// 두 선분이 한 점 이상 겹치거나 엇갈리는가.
function meets(a: Segment, b: Segment) {
  const box = (s: Segment) => ({ id: '', x: Math.min(s.x1, s.x2), y: Math.min(s.y1, s.y2), width: Math.abs(s.x2 - s.x1), height: Math.abs(s.y2 - s.y1) })
  return touches(a, box(b))
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

// 글이 viewBox 안에 있고 노드·선과 겹치지 않는다.
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

// 보이는 곁말이 지정한 id·글·자리이고, viewBox 안에서 노드·선·서로와 겹치지 않는다.
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
  }
  const boxes = shown.map((note) => textBox(note, note.getAttribute('data-note')!))
  for (let i = 0; i < boxes.length; i += 1) {
    for (const other of boxes.slice(i + 1)) expect(overlaps(boxes[i], other), `${boxes[i].id} ↔ ${other.id}`).toBe(false)
  }
}

async function expectScenario(
  scenario: typeof expectedScenarios[number],
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

  for (const [id, text] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(text)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(node.querySelector('rect')).toHaveClass('stroke-disabled')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(text, 10) * 1.15 + 12, `${id} ${text}`).toBeLessThanOrEqual(box.width)
  }
  for (let i = 0; i < nodeIds.length; i += 1) {
    for (let j = i + 1; j < nodeIds.length; j += 1) {
      expect(overlaps(nodeBox(nodeIds[i]), nodeBox(nodeIds[j])), `${nodeIds[i]} ↔ ${nodeIds[j]}`).toBe(false)
    }
  }
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 화살표 양 끝은 두 노드의 변에 닿고 노드 안을 지나지 않으며, 같은 시나리오의 화살표끼리는 만나지 않는다.
async function expectArrowEnds() {
  for (const { label: scenarioLabel } of expectedScenarios) {
    await selectScenario(scenarioLabel)
    const lines = Array.from(diagram().querySelectorAll('[data-path]'))
    for (const path of lines) expectLine(path, path.getAttribute('data-path')!)
    for (let i = 0; i < lines.length; i += 1) {
      for (const other of lines.slice(i + 1)) {
        for (const a of segments(lines[i].getAttribute('d')!)) {
          for (const b of segments(other.getAttribute('d')!)) {
            expect(meets(a, b), `${lines[i].getAttribute('data-path')} ↔ ${other.getAttribute('data-path')}`).toBe(false)
          }
        }
      }
    }
  }
}

function hops() {
  return Array.from(diagram().querySelectorAll('[data-path]'), (path) => [nodeAt(lineEnds(path).start)!, nodeAt(lineEnds(path).end)!])
}

function brightNodes() {
  return nodeIds.filter((id) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
}

const lastOctet = (address: string) => Number(address.split('/')[0].split('.')[3])
const prefixLength = (address: string) => Number(address.split('/')[1])
const noteAddress = (id: NoteId) => noteLabels[id].split(' ').pop()!

// 요점: 나누기에서는 원래 네트워크에서 서브넷 넷으로 화살표가 가고, 서브넷의 넷째 옥텟은 0·64·128·192로 2⁶ = 64씩 커지며
// 각 2진수 곁말의 앞 2비트가 서브넷 번호 00·01·10·11이다. 범위에서는 192.0.2.64/26 하나만 선명하고, 곁말의 네 주소가
// 호스트 부분 6비트를 모두 0·모두 1로 둔 값과 그 사이 첫·끝 주소다. 주소와 셈은 개념 본문에 있다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const hostBits = 32 - prefixLength(label('s0'))

  expect(prefixLength(label('net'))).toBe(24)
  for (const id of subnetIds) expect(prefixLength(label(id)), id).toBe(26)
  expect(subnetIds.map((id) => lastOctet(label(id)))).toEqual([0, 64, 128, 192])
  expect(2 ** (26 - 24)).toBe(subnetIds.length)
  for (let i = 1; i < subnetIds.length; i += 1) {
    expect(lastOctet(label(subnetIds[i])) - lastOctet(label(subnetIds[i - 1]))).toBe(2 ** hostBits)
  }

  await selectScenario('넷으로 나누기')
  expect(hops()).toEqual(subnetIds.map((id) => ['net', id]))
  expect(brightNodes()).toEqual(nodeIds)
  for (const [noteId, subnet] of Object.entries(bitsOf)) {
    const bits = noteAddress(noteId as NoteId)
    expect(bits).toMatch(/^[01]{2}0{6}$/u)
    expect(parseInt(bits, 2), noteId).toBe(lastOctet(label(subnet)))
  }
  expect(Object.keys(bitsOf).map((id) => noteAddress(id as NoteId).slice(0, 2))).toEqual(['00', '01', '10', '11'])
  const splitBright = brightNodes()

  await selectScenario('서브넷 하나의 범위')
  expect(hops()).toEqual([])
  expect(brightNodes()).toEqual(['s64'])
  expect(brightNodes()).not.toEqual(splitBright)
  const start = lastOctet(label('s64'))
  const ends64 = (['range-net', 'range-first', 'range-last', 'range-broadcast'] as NoteId[]).map((id) => noteAddress(id))
  for (const address of ends64) expect(address.startsWith('192.0.2.'), address).toBe(true)
  expect(ends64.map((address) => Number(address.split('.')[3]))).toEqual([start, start + 1, start + 2 ** hostBits - 2, start + 2 ** hostBits - 1])
  expect(Number(ends64[3].split('.')[3]) + 1).toBe(lastOctet(label('s128')))
  const shownTexts = Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.textContent!)
  for (const address of ['192.0.2.65', '192.0.2.126', '192.0.2.127']) expect(shownTexts.some((text) => text.endsWith(address)), address).toBe(true)

  expect(body).toContain('넷째 옥텟의 앞 2비트를 넘기면 접두사 길이는 24 + 2 = 26')
  expect(body).toContain('`00`, `01`, `10`, `11`의 2² = 4가지라 서브넷이 넷 생기고, 남은 호스트 부분 6비트로 서브넷마다 주소가 2⁶ = 64개씩 든다')
  expect(body).toContain('`00000000`은 0, `01000000`은 64, `10000000`은 128, `11000000`은 192다')
  expect(body).toContain('네 서브넷은 `192.0.2.0/26`, `192.0.2.64/26`, `192.0.2.128/26`, `192.0.2.192/26`이다')
  expect(body).toContain('네트워크 주소는 `192.0.2.64`다')
  expect(body).toContain('브로드캐스트 주소는 `192.0.2.127`이다')
  expect(body).toContain('호스트에 붙일 첫 주소는 `192.0.2.65`, 끝 주소는 `192.0.2.126`이고, 개수는 2⁶ − 2 = 62개다')
}

async function expectUniqueMarkers() {
  render(<><SubnettingDiagram /><SubnettingDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '넷으로 나누기' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(4)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('SubnettingDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<SubnettingDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<SubnettingDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<SubnettingDiagram />)
    await expectScenario(scenario, tallArrows, tallNotes, 280, 290, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<SubnettingDiagram />)
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

  it('노드가 280×290 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<SubnettingDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 290')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나거나 다른 화살표와 만나지 않는다', async () => {
    render(<SubnettingDiagram />)
    await expectArrowEnds()
  })

  it('넷으로 나누면 서브넷 넷이 64씩 떨어지고, 서브넷 하나의 네 주소는 호스트 부분을 모두 0·모두 1로 둔 값과 그 사이다', async () => {
    render(<SubnettingDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<SubnettingDiagram />)
    const text = visualsByTopicId[topicId].diagrams.subnetting
    const ids = subnettingScenarios.map(({ id }) => id).sort()
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
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label: scenarioLabel }) => scenarioLabel)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = subnettingScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 서브네팅 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
      for (const { label: scenarioLabel } of expectedScenarios) {
        await selectScenario(scenarioLabel)
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

    it('440×192 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<SubnettingDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 192')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드 id 집합과 화살표·곁말 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<SubnettingDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 290')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')
      const tallNoteIds = await collectIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 192')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(tallNoteIds).toEqual(Object.keys(noteLabels).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
      expect(await collectIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
    })

    it('모든 rect가 440×192 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<SubnettingDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<SubnettingDiagram />)
      await expectScenario(scenario, wideArrows, wideNotes, 440, 192, container)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나거나 다른 화살표와 만나지 않는다', async () => {
      render(<SubnettingDiagram />)
      await expectArrowEnds()
    })

    it('넷으로 나누면 서브넷 넷이 64씩 떨어지고, 서브넷 하나의 네 주소는 호스트 부분을 모두 0·모두 1로 둔 값과 그 사이다', async () => {
      render(<SubnettingDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<SubnettingDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 290')
      await selectScenario('넷으로 나누기')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '넷으로 나누기' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['to-0', 'to-64', 'to-128', 'to-192'])
      for (const path of paths) expect(path).toHaveAttribute('d', wideArrows[path.getAttribute('data-path')!])
      expect(diagram().querySelector('[data-note="bits-64"]')).toHaveAttribute('x', String(wideNotes['bits-64'].x))
    })
  })
})
