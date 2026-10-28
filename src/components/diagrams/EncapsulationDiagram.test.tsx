import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { EncapsulationDiagram, encapsulationScenarios } from './EncapsulationDiagram'

const topicId = 'protocols-encapsulation'
const anchorConceptId = `${topicId}.encapsulation`
const layerIds = ['app', 'transport', 'internet', 'link'] as const
type LayerId = typeof layerIds[number]
const layerLabels: Record<LayerId, string> = {
  app: '응용 계층',
  transport: '전송 계층',
  internet: '인터넷 계층',
  link: '네트워크 액세스 계층',
}
// 계층마다 그 계층을 지난 데이터 단위의 칸. 왼쪽(앞)부터 적는다.
const rowCells: Record<LayerId, [string, string][]> = {
  app: [['app-http', 'HTTP 헤더'], ['app-data', '데이터']],
  transport: [['transport-tcp', 'TCP 헤더'], ['transport-http', 'HTTP 헤더'], ['transport-data', '데이터']],
  internet: [['internet-ip', 'IP 헤더'], ['internet-tcp', 'TCP 헤더'], ['internet-http', 'HTTP 헤더'], ['internet-data', '데이터']],
  link: [
    ['link-ethernet', '이더넷 헤더'], ['link-ip', 'IP 헤더'], ['link-tcp', 'TCP 헤더'],
    ['link-http', 'HTTP 헤더'], ['link-data', '데이터'], ['link-trailer', '트레일러'],
  ],
}
const labels: Record<string, string> = {
  ...layerLabels,
  ...Object.fromEntries(Object.values(rowCells).flat()),
}
const allNodes = Object.keys(labels)
const cellIds = Object.values(rowCells).flat().map(([id]) => id)
// 계층마다 새로 붙는(받을 때는 떼어 내는) 칸. 네트워크 액세스 계층은 헤더와 트레일러 둘이다.
const changedCells = ['app-http', 'transport-tcp', 'internet-ip', 'link-ethernet', 'link-trailer']

const unitNoteLabels = {
  'unit-app': '메시지',
  'unit-transport': '세그먼트',
  'unit-internet': '패킷',
  'unit-link': '프레임',
}
const unitNoteIds = Object.keys(unitNoteLabels)
const unitNoteLayer: Record<string, LayerId> = {
  'unit-app': 'app',
  'unit-transport': 'transport',
  'unit-internet': 'internet',
  'unit-link': 'link',
}
const tagSuffixes = ['app', 'transport', 'internet', 'link', 'trailer']
const attachIds = tagSuffixes.map((suffix) => `attach-${suffix}`)
const detachIds = tagSuffixes.map((suffix) => `detach-${suffix}`)
const noteLabels: Record<string, string> = {
  ...unitNoteLabels,
  ...Object.fromEntries(attachIds.map((id) => [id, '새로 붙음'])),
  ...Object.fromEntries(detachIds.map((id) => [id, '떼어 냄'])),
}
type NotePlaces = Record<string, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

const tallPaths: Record<string, string> = {
  'app-to-transport': 'M24 90 V110',
  'transport-to-internet': 'M24 192 V212',
  'internet-to-link': 'M24 294 V314',
  'link-to-internet': 'M24 314 V294',
  'internet-to-transport': 'M24 212 V192',
  'transport-to-app': 'M24 110 V90',
}
const widePaths: Record<string, string> = {
  'app-to-transport': 'M238 90 V110',
  'transport-to-internet': 'M182 192 V212',
  'internet-to-link': 'M132 294 V314',
  'link-to-internet': 'M132 314 V294',
  'internet-to-transport': 'M182 212 V192',
  'transport-to-app': 'M238 110 V90',
}
// 경로마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'app-to-transport': ['app-http', 'transport'],
  'transport-to-internet': ['transport-tcp', 'internet'],
  'internet-to-link': ['internet-ip', 'link'],
  'link-to-internet': ['link', 'internet-ip'],
  'internet-to-transport': ['internet', 'transport-tcp'],
  'transport-to-app': ['transport', 'app-http'],
}
// 보낼 때의 경로와 같은 자리를 거꾸로 가는 받을 때의 경로.
const reversedPairs: [string, string][] = [
  ['app-to-transport', 'transport-to-app'],
  ['transport-to-internet', 'internet-to-transport'],
  ['internet-to-link', 'link-to-internet'],
]

function tagPlaces(places: Record<string, { x: number, y: number, anchor: 'start' | 'middle' }>): NotePlaces {
  return Object.fromEntries(Object.entries(places).flatMap(([suffix, place]) => [
    [`attach-${suffix}`, place],
    [`detach-${suffix}`, place],
  ]))
}

const tallNotes: NotePlaces = {
  'unit-app': { x: 136, y: 28, anchor: 'start' },
  'unit-transport': { x: 136, y: 130, anchor: 'start' },
  'unit-internet': { x: 136, y: 232, anchor: 'start' },
  'unit-link': { x: 136, y: 334, anchor: 'start' },
  ...tagPlaces({
    app: { x: 43, y: 53, anchor: 'middle' },
    transport: { x: 40, y: 155, anchor: 'middle' },
    internet: { x: 37, y: 257, anchor: 'middle' },
    link: { x: 47, y: 359, anchor: 'middle' },
    trailer: { x: 122, y: 420, anchor: 'start' },
  }),
}
const wideNotes: NotePlaces = {
  'unit-app': { x: 350, y: 28, anchor: 'start' },
  'unit-transport': { x: 294, y: 130, anchor: 'start' },
  'unit-internet': { x: 244, y: 232, anchor: 'start' },
  'unit-link': { x: 174, y: 334, anchor: 'start' },
  ...tagPlaces({
    app: { x: 257, y: 53, anchor: 'middle' },
    transport: { x: 198, y: 155, anchor: 'middle' },
    internet: { x: 145, y: 257, anchor: 'middle' },
    link: { x: 85, y: 359, anchor: 'middle' },
    trailer: { x: 363, y: 359, anchor: 'middle' },
  }),
}

const question = '계층을 지날 때마다 데이터에는 무엇이 붙고 떨어질까?'
const figureLabel = '계층을 지날 때 헤더가 붙고 떨어지는 과정 도식'
const svgLabel = '웹 페이지를 TCP로 보낼 때 TCP/IP 모델의 네 계층과 계층마다의 데이터 단위'
const idleCaption = '웹 페이지를 TCP로 보내는 경우를 예로 들었고, 네트워크 액세스 계층은 이더넷을 쓴다. 보낼 때와 받을 때를 고르면 계층마다 어느 헤더가 붙고 떨어지는지 볼 수 있다.'
const legend = '계층 이름 아래에 이어 붙은 상자들이 그 계층의 데이터 단위 하나이고, 왼쪽이 앞이다.'
const expectedScenarios = [
  {
    id: 'send', label: '보낼 때',
    nodes: [...layerIds, ...changedCells],
    paths: ['app-to-transport', 'transport-to-internet', 'internet-to-link'],
    notes: attachIds,
    tag: '새로 붙음',
    caption: '보낼 때는 위에서 아래로 내려간다. 각 계층은 위 계층이 넘긴 것을 통째로 페이로드로 삼아 그 앞에 자기 헤더를 붙이고, 네트워크 액세스 계층은 뒤에 트레일러도 붙인다. 그래서 아래로 갈수록 헤더가 겹겹이 쌓인다.',
    sources: [`${topicId}.reference-model`, `${topicId}.encapsulation`],
  },
  {
    id: 'receive', label: '받을 때',
    nodes: [...layerIds, ...changedCells],
    paths: ['link-to-internet', 'internet-to-transport', 'transport-to-app'],
    notes: detachIds,
    tag: '떼어 냄',
    caption: '받을 때는 아래에서 위로 올라간다. 각 계층은 보내는 쪽의 같은 계층이 붙였던 헤더를 떼어 내고 나머지를 위 계층으로 넘기며, 네트워크 액세스 계층은 트레일러도 뗀다. 그래서 가장 나중에 붙은 바깥쪽 헤더부터 떨어져 나가고, 응용 계층까지 떼고 나면 응용 프로그램에 원래의 데이터가 닿는다.',
    sources: [`${topicId}.decapsulation`],
  },
]

function diagram() {
  return screen.getByRole('img', { name: svgLabel })
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

// 글자가 차지하는 상자. 높이는 글자 크기 9를 기준선 위로 잡는다.
function textBox(text: Element): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9)
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id: text.getAttribute('data-note')!, x: left, y: y - 9, width, height: 9 }
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

// 직교 경로를 선분 목록으로 편다. M/H/V만 나온다.
function segments(d: string) {
  const result: { x1: number, y1: number, x2: number, y2: number }[] = []
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
function crossesInside(segment: ReturnType<typeof segments>[number], box: SvgBox) {
  const left = Math.min(segment.x1, segment.x2)
  const right = Math.max(segment.x1, segment.x2)
  const top = Math.min(segment.y1, segment.y2)
  const bottom = Math.max(segment.y1, segment.y2)
  if (top === bottom) return top > box.y && top < box.y + box.height && Math.min(right, box.x + box.width) > Math.max(left, box.x)
  return left > box.x && left < box.x + box.width && Math.min(bottom, box.y + box.height) > Math.max(top, box.y)
}

function onEdge(x: number, y: number, box: SvgBox) {
  const insideX = x >= box.x && x <= box.x + box.width
  const insideY = y >= box.y && y <= box.y + box.height
  return ((x === box.x || x === box.x + box.width) && insideY) || ((y === box.y || y === box.y + box.height) && insideX)
}

function endsOf(d: string) {
  const list = segments(d)
  const first = list[0]
  const last = list[list.length - 1]
  return { start: { x: first.x1, y: first.y1 }, end: { x: last.x2, y: last.y2 } }
}

function pathEnds(id: string) {
  return endsOf(diagram().querySelector(`[data-path="${id}"]`)!.getAttribute('d')!)
}

// 곁말이 가리키는 칸 — 칸 바로 위 가운데(기준선이 칸 위 변에서 3~8 위)이거나, 같은 줄 바로 오른쪽(칸 오른쪽 변에서 4~12)이다.
function cellUnderTag(note: Element) {
  const x = Number(note.getAttribute('x'))
  const y = Number(note.getAttribute('y'))
  const anchor = note.getAttribute('text-anchor')
  return cellIds.filter((id) => {
    const box = nodeBox(id)
    if (anchor === 'middle') return x > box.x && x < box.x + box.width && box.y - y >= 3 && box.y - y <= 8
    const gap = x - (box.x + box.width)
    return anchor === 'start' && gap >= 4 && gap <= 12 && y > box.y && y < box.y + box.height
  })
}

// 한 계층의 칸을 읽는 순서(위 줄부터, 줄 안에서는 왼쪽부터)로 돌려준다.
function readingOrder(layer: LayerId) {
  return rowCells[layer].map(([id]) => nodeBox(id)).sort((a, b) => a.y - b.y || a.x - b.x)
}

// 아래 단언들은 배치에 묶이지 않는다. 세로형과 가로형이 같은 기대값으로 통과해야 한다.
async function expectScenario(
  scenario: typeof expectedScenarios[number],
  places: NotePlaces,
  paths: Record<string, string>,
  width: number,
  container: HTMLElement,
) {
  await selectScenario(scenario.label)

  for (const node of diagram().querySelectorAll('[data-node]')) {
    expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
  }

  const shownPaths = Array.from(diagram().querySelectorAll('[data-path]'))
  expect(shownPaths.map((path) => path.getAttribute('data-path'))).toEqual(scenario.paths)
  for (const path of shownPaths) {
    expect(path).toHaveAttribute('d', paths[path.getAttribute('data-path')!])
    expect(path).toHaveAttribute('stroke-width', '2')
    expect(path).toHaveAttribute('marker-end', `url(#${diagram().querySelector('marker')!.id})`)
    expect(path).toHaveClass('stroke-title')
    expect(path.closest('[opacity]')).toBeNull()
  }

  const pathSegments = shownPaths.flatMap((path) => segments(path.getAttribute('d')!))
  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  const shownNotes = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shownNotes.map((note) => note.getAttribute('data-note')).sort()).toEqual([...unitNoteIds, ...scenario.notes].sort())
  for (const note of shownNotes) {
    const id = note.getAttribute('data-note')!
    expect(note.textContent).toBe(noteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', places[id].anchor)
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    const box = textBox(note)
    expect(box.x, id).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, id).toBeLessThanOrEqual(width)
    for (const node of nodeBoxes) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const segment of pathSegments) expect(crossesInside(segment, box), `${id} ↔ 경로`).toBe(false)
  }
  for (let i = 0; i < shownNotes.length; i += 1) {
    for (let j = i + 1; j < shownNotes.length; j += 1) {
      expect(overlaps(textBox(shownNotes[i]), textBox(shownNotes[j])), '곁말끼리').toBe(false)
    }
  }
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 상자 안에 들어간다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(allNodes.length)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(label, 10) + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
  }
}

// 계층 이름 노드는 위에서부터 응용·전송·인터넷·네트워크 액세스 순이고, 각 계층의 칸들은 자기 이름 노드와 다음 계층 이름 노드 사이에 있다.
// 칸 수는 위에서 아래로 늘어나고, 아래 계층의 단위는 새 헤더 하나 뒤에 위 계층의 단위를 그대로 담는다(네트워크 액세스는 뒤에 트레일러도).
function expectLayerRows() {
  const counts = layerIds.map((layer) => rowCells[layer].length)
  expect(counts).toEqual([2, 3, 4, 6])
  for (let i = 1; i < counts.length; i += 1) expect(counts[i]).toBeGreaterThan(counts[i - 1])

  layerIds.forEach((layer, index) => {
    const name = nodeBox(layer)
    const cells = readingOrder(layer)
    expect(cells.map(({ id }) => labels[id]), layer).toEqual(rowCells[layer].map(([, label]) => label))
    for (const cell of cells) expect(cell.y, `${cell.id}는 ${layer} 아래`).toBeGreaterThan(name.y + name.height)
    const next = layerIds[index + 1]
    if (next) {
      const bottom = Math.max(...cells.map((cell) => cell.y + cell.height))
      expect(nodeBox(next).y, `${next}는 ${layer} 칸 아래`).toBeGreaterThan(bottom)
    }
    if (index > 0) {
      const upper = rowCells[layerIds[index - 1]].map(([, label]) => label)
      const own = cells.map(({ id }) => labels[id])
      expect(own.slice(1, 1 + upper.length), `${layer}의 페이로드`).toEqual(upper)
    }
  })

  // 한 줄에 놓인 칸들은 빈틈 없이 이어 붙는다.
  for (const layer of layerIds) {
    const lines = new Map<number, SvgBox[]>()
    for (const cell of readingOrder(layer)) lines.set(cell.y, [...(lines.get(cell.y) ?? []), cell])
    for (const line of lines.values()) {
      for (let i = 1; i < line.length; i += 1) expect(line[i].x, `${line[i].id} 앞에 붙는다`).toBe(line[i - 1].x + line[i - 1].width)
    }
  }
}

// 노드는 모두 회색이고 도식 전용 두 색·초록·빨강·주황은 쓰지 않는다. 그룹 박스는 없다.
function expectColors() {
  for (const id of allNodes) {
    expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  }
  expect(diagram().querySelectorAll('[data-group]')).toHaveLength(0)
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 보낼 때의 경로는 모두 아래로, 받을 때의 경로는 모두 위로 간다. 짝을 이룬 두 경로는 같은 자리에서 시작점과 끝점이 뒤바뀐다.
// 두 시나리오는 선명한 노드와 보이는 곁말을 합친 것이 서로 다르다.
async function expectDirections() {
  await selectScenario('보낼 때')
  const send = Object.fromEntries(shownIds('[data-path]', 'data-path').map((id) => [id, pathEnds(id)]))
  for (const [id, { start, end }] of Object.entries(send)) {
    expect(start.x, id).toBe(end.x)
    expect(end.y, id).toBeGreaterThan(start.y)
  }
  const sendShown = shownState()

  await selectScenario('받을 때')
  const receive = Object.fromEntries(shownIds('[data-path]', 'data-path').map((id) => [id, pathEnds(id)]))
  for (const [id, { start, end }] of Object.entries(receive)) {
    expect(start.x, id).toBe(end.x)
    expect(end.y, id).toBeLessThan(start.y)
  }
  for (const [down, up] of reversedPairs) {
    expect(receive[up].start, `${down} ↔ ${up}`).toEqual(send[down].end)
    expect(receive[up].end, `${down} ↔ ${up}`).toEqual(send[down].start)
  }
  expect(shownState()).not.toEqual(sendShown)
}

function shownState() {
  const bright = Array.from(diagram().querySelectorAll('[data-node][opacity="1"]'), (node) => node.getAttribute('data-node'))
  const notes = Array.from(diagram().querySelectorAll('[data-note]'), (note) => `${note.getAttribute('data-note')}:${note.textContent}`)
  return [...bright, ...notes].sort()
}

// 곁말은 바뀌는 칸을 가리킨다. 보낼 때는 「새로 붙음」, 받을 때는 「떼어 냄」이고, 가리키는 칸은 계층마다 맨 앞 헤더와 맨 뒤 트레일러다.
// 단위 이름은 늘 보이고 자기 계층 이름 노드 바로 오른쪽, 같은 줄에 있다.
async function expectTags() {
  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    const tags = Array.from(diagram().querySelectorAll('[data-note]')).filter((note) => !unitNoteIds.includes(note.getAttribute('data-note')!))
    expect(tags.map((tag) => tag.textContent), scenario.label).toEqual(tags.map(() => scenario.tag))
    const tagged = tags.flatMap(cellUnderTag)
    expect([...tagged].sort(), scenario.label).toEqual([...changedCells].sort())
    for (const layer of layerIds) expect(tagged, `${layer}의 맨 앞`).toContain(rowCells[layer][0][0])
    expect(tagged).toContain(rowCells.link[rowCells.link.length - 1][0])
  }

  for (const label of ['전체', ...expectedScenarios.map(({ label }) => label)]) {
    await selectScenario(label)
    for (const id of unitNoteIds) {
      const note = diagram().querySelector(`[data-note="${id}"]`)!
      const layer = nodeBox(unitNoteLayer[id])
      const gap = Number(note.getAttribute('x')) - (layer.x + layer.width)
      const y = Number(note.getAttribute('y'))
      expect(note.textContent).toBe(unitNoteLabels[id as keyof typeof unitNoteLabels])
      expect(gap, id).toBeGreaterThanOrEqual(4)
      expect(gap, id).toBeLessThanOrEqual(12)
      expect(y, id).toBeGreaterThan(layer.y)
      expect(y, id).toBeLessThan(layer.y + layer.height)
      expect(note, id).toHaveAttribute('opacity', diagram().querySelector(`[data-node="${unitNoteLayer[id]}"]`)!.getAttribute('opacity'))
    }
  }
}

// 경로 양 끝은 두 노드의 변에 닿고, 어떤 선분도 노드 안을 지나지 않는다.
async function expectPathEnds() {
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
    for (const path of diagram().querySelectorAll('[data-path]')) {
      const id = path.getAttribute('data-path')!
      for (const segment of segments(path.getAttribute('d')!)) {
        for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
      }
      const [from, to] = ends[id]
      const { start, end } = pathEnds(id)
      expect(onEdge(start.x, start.y, nodeBox(from)), `${id} 시작`).toBe(true)
      expect(onEdge(end.x, end.y, nodeBox(to)), `${id} 끝`).toBe(true)
    }
  }
}

async function expectUniqueMarkers() {
  render(<><EncapsulationDiagram /><EncapsulationDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureLabel })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '보낼 때' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(3)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('EncapsulationDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<EncapsulationDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 경로 없이 단위 이름만 보이며 선택 안내가 나온다', () => {
    const { container } = render(<EncapsulationDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual([...allNodes].sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...unitNoteIds].sort())
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·경로·곁말만 보이고 나머지 노드는 흐려진다', async (scenario) => {
    const { container } = render(<EncapsulationDiagram />)
    await expectScenario(scenario, tallNotes, tallPaths, 280, container)
  })

  it('시나리오를 바꾸면 이전 경로·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<EncapsulationDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...unitNoteIds, ...scenario.notes].sort())
    }
    await selectScenario('전체')
    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...unitNoteIds].sort())
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
    for (const { label } of expectedScenarios) expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'false')
  })

  it('보낼 때는 아래로, 받을 때는 위로 같은 자리를 거꾸로 가고 두 시나리오의 선명한 노드와 곁말이 다르다', async () => {
    render(<EncapsulationDiagram />)
    await expectDirections()
  })

  it('노드 19개가 280×440 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<EncapsulationDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 440')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 440])
  })

  it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 곁말은 크기 9로 0..280 안에 있다', async (label) => {
    render(<EncapsulationDiagram />)
    await selectScenario(label)

    for (const text of diagram().querySelectorAll('[data-note]')) {
      expect(text).toHaveAttribute('font-size', '9')
      const box = textBox(text)
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(280)
    }
  })

  it('계층 줄의 칸 수가 위에서 아래로 늘어나고 아래 단위가 위 단위를 그대로 담는다', () => {
    render(<EncapsulationDiagram />)
    expectLayerRows()
  })

  it('세로형은 계층마다 칸을 계층 이름 노드와 같은 왼쪽 끝에서 시작하고, 프레임은 두 줄로 나눈다', () => {
    render(<EncapsulationDiagram />)
    for (const layer of layerIds) {
      const cells = readingOrder(layer)
      expect(Math.min(...cells.map(({ x }) => x)), layer).toBe(nodeBox(layer).x)
      expect(new Set(cells.map(({ y }) => y)).size, layer).toBe(layer === 'link' ? 2 : 1)
    }
  })

  it('노드는 모두 회색이고 그룹 박스가 없다', () => {
    render(<EncapsulationDiagram />)
    expectColors()
  })

  it('곁말은 계층마다 바뀌는 칸을 가리키고 단위 이름은 계층 이름 노드 오른쪽에 늘 보인다', async () => {
    render(<EncapsulationDiagram />)
    await expectTags()
  })

  it('경로 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<EncapsulationDiagram />)
    await expectPathEnds()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 경로가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<EncapsulationDiagram />)
    const text = visualsByTopicId[topicId].diagrams.encapsulation
    const ids = encapsulationScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toBeUndefined()
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.label).toBe(figureLabel)
    expect(text.svgLabel).toBe(svgLabel)
    expect(text.sources).toEqual([
      `${topicId}.encapsulation`,
      `${topicId}.decapsulation`,
      `${topicId}.tcp-ip-model`,
      `${topicId}.pdu-names`,
    ])
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = encapsulationScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 캡슐화 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureLabel })

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

    function ids(selector: string, attribute: string) {
      return shownIds(selector, attribute).sort()
    }

    async function collectPathIds() {
      const found = new Set<string>()
      for (const { label } of expectedScenarios) {
        await selectScenario(label)
        for (const id of shownIds('[data-path]', 'data-path')) found.add(id)
      }
      return [...found].sort()
    }

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×404 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<EncapsulationDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 404')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드 id 집합과 시나리오로 나타나는 경로 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<EncapsulationDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 440')
      const tallNodes = ids('[data-node]', 'data-node')
      const tallPathIds = await collectPathIds()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 404')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(tallNodes).toEqual([...allNodes].sort())
      expect(diagram().querySelectorAll('[data-group]')).toHaveLength(0)
      expect(tallPathIds).toEqual(Object.keys(tallPaths).sort())
      expect(await collectPathIds()).toEqual(tallPathIds)
    })

    it('모든 rect가 440×404 viewBox 안에 있고 노드 라벨이 자기 상자 안에 들어간다', () => {
      render(<EncapsulationDiagram />)
      expectFits([0, 0, 440, 404])
    })

    it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 곁말은 크기 9로 0..440 안에 있다', async (label) => {
      render(<EncapsulationDiagram />)
      await selectScenario(label)

      for (const text of diagram().querySelectorAll('[data-note]')) {
        expect(text).toHaveAttribute('font-size', '9')
        const box = textBox(text)
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width).toBeLessThanOrEqual(440)
      }
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·경로·곁말·캡션을 보이고 곁말은 노드·경로와 겹치지 않는다', async (scenario) => {
      const { container } = render(<EncapsulationDiagram />)
      await expectScenario(scenario, wideNotes, widePaths, 440, container)
    })

    it('보낼 때는 아래로, 받을 때는 위로 같은 자리를 거꾸로 가고 두 시나리오의 선명한 노드와 곁말이 다르다', async () => {
      render(<EncapsulationDiagram />)
      await expectDirections()
    })

    it('계층 줄의 칸 수가 위에서 아래로 늘어나고 아래 단위가 위 단위를 그대로 담는다', () => {
      render(<EncapsulationDiagram />)
      expectLayerRows()
    })

    it('가로형은 위 계층의 칸이 아래 계층의 같은 칸 바로 위에 놓이고, 계층 이름 노드는 자기 줄의 맨 앞 칸에서 시작한다', () => {
      render(<EncapsulationDiagram />)
      layerIds.forEach((layer, index) => {
        const cells = readingOrder(layer)
        expect(new Set(cells.map(({ y }) => y)).size, layer).toBe(1)
        expect(nodeBox(layer).x, layer).toBe(cells[0].x)
        const next = layerIds[index + 1]
        if (!next) return
        const lower = readingOrder(next)
        cells.forEach((cell, position) => {
          const same = lower[position + 1]
          expect(labels[same.id], cell.id).toBe(labels[cell.id])
          expect([same.x, same.width], cell.id).toEqual([cell.x, cell.width])
        })
      })
    })

    it('노드는 모두 회색이고 그룹 박스가 없다', () => {
      render(<EncapsulationDiagram />)
      expectColors()
    })

    it('곁말은 계층마다 바뀌는 칸을 가리키고 단위 이름은 계층 이름 노드 오른쪽에 늘 보인다', async () => {
      render(<EncapsulationDiagram />)
      await expectTags()
    })

    it('경로 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<EncapsulationDiagram />)
      await expectPathEnds()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 경로가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<EncapsulationDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 440')
      await selectScenario('받을 때')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '받을 때' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['link-to-internet', 'internet-to-transport', 'transport-to-app'])
      for (const path of paths) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      for (const note of diagram().querySelectorAll('[data-note]')) {
        expect(note).toHaveAttribute('x', String(wideNotes[note.getAttribute('data-note')!].x))
      }
    })
  })
})
