import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { LayerJourneyDiagram, layerJourneyScenarios } from './LayerJourneyDiagram'

const topicId = 'protocols-encapsulation'
const anchorConceptId = `${topicId}.reference-model`
const labels = {
  'sender-1': '맨 위 계층',
  'sender-2': '위에서 둘째 계층',
  'sender-3': '위에서 셋째 계층',
  'sender-4': '맨 아래 계층',
  medium: '매체',
  'receiver-1': '맨 위 계층',
  'receiver-2': '위에서 둘째 계층',
  'receiver-3': '위에서 셋째 계층',
  'receiver-4': '맨 아래 계층',
}
const groupLabels = {
  sender: '보내는 호스트',
  receiver: '받는 호스트',
}
const noteLabels = { 'medium-kind': '케이블이나 무선' }

const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const senderLayers = ['sender-1', 'sender-2', 'sender-3', 'sender-4']
const receiverLayers = ['receiver-1', 'receiver-2', 'receiver-3', 'receiver-4']
const linkIds = ['medium-out', 'medium-in']

const tallPaths: Record<string, string> = {
  'medium-out': 'M70 204 V256 H108',
  'medium-in': 'M172 256 H210 V204',
  'send-1': 'M70 60 V76',
  'send-2': 'M70 108 V124',
  'send-3': 'M70 156 V172',
  'send-4': 'M70 204 V256 H108',
  'receive-1': 'M172 256 H210 V204',
  'receive-2': 'M210 172 V156',
  'receive-3': 'M210 124 V108',
  'receive-4': 'M210 76 V60',
}
const widePaths: Record<string, string> = {
  'medium-out': 'M156 188 H188',
  'medium-in': 'M252 188 H284',
  'send-1': 'M88 60 V76',
  'send-2': 'M88 108 V124',
  'send-3': 'M88 156 V172',
  'send-4': 'M156 188 H188',
  'receive-1': 'M252 188 H284',
  'receive-2': 'M352 172 V156',
  'receive-3': 'M352 124 V108',
  'receive-4': 'M352 76 V60',
}
const tallNote = { x: 140, y: 286 }
const wideNote = { x: 220, y: 218 }

// 화살표마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'send-1': ['sender-1', 'sender-2'],
  'send-2': ['sender-2', 'sender-3'],
  'send-3': ['sender-3', 'sender-4'],
  'send-4': ['sender-4', 'medium'],
  'receive-1': ['medium', 'receiver-4'],
  'receive-2': ['receiver-4', 'receiver-3'],
  'receive-3': ['receiver-3', 'receiver-2'],
  'receive-4': ['receiver-2', 'receiver-1'],
  'medium-out': ['sender-4', 'medium'],
  'medium-in': ['medium', 'receiver-4'],
}

const question = '보낸 정보는 계층을 어떤 순서로 지날까?'
const idleCaption = '네트워크 참조 모델은 정보를 보내고 받는 과정을 몇 개의 계층으로 나누고, 계층마다 맡을 일을 정해 둔다. 이 그림은 계층을 넷으로 나눈 경우다. 맨 위 계층은 웹 브라우저 같은 응용 프로그램과 정보를 주고받고, 맨 아래 계층은 유선이나 무선 매체로 정보를 실어 나른다. 버튼을 고르면 보낼 때와 받을 때 계층을 어느 방향으로 지나는지 볼 수 있다.'
const legend = '큰 박스는 호스트 하나이고, 그 안의 상자가 아래에서 위로 쌓인 계층이다. 가운데 매체 상자로 이어진 가는 선은 두 호스트를 잇는 통로, 화살표는 정보가 지나는 방향이다.'
const expectedScenarios = [
  {
    id: 'send', label: '보낼 때',
    nodes: [...senderLayers, 'medium', 'medium-out'],
    paths: ['send-1', 'send-2', 'send-3', 'send-4'],
    caption: '보내는 호스트에서는 정보가 맨 위 계층에서 출발해 한 계층씩 아래로 내려가며 처리된다. 각 계층은 정해진 자기 일만 하고 나머지는 다른 계층에 맡긴다. 맨 아래 계층에 이르면 정보는 신호가 되어 케이블이나 무선 같은 매체로 나간다.',
  },
  {
    id: 'receive', label: '받을 때',
    nodes: ['medium', ...receiverLayers, 'medium-in'],
    paths: ['receive-1', 'receive-2', 'receive-3', 'receive-4'],
    caption: '받는 호스트에서는 방향이 반대다. 매체로 들어온 신호가 맨 아래 계층에서 출발해 한 계층씩 위로 올라가며 처리되고, 맨 위 계층에 이르면 웹 브라우저 같은 응용 프로그램에 닿는다.',
  },
]

function diagram() {
  return screen.getByRole('img', { name: '네 계층으로 나뉜 보내는 호스트와 받는 호스트가 맨 아래 계층에서 매체로 이어진 모습' })
}

async function selectScenario(label: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) })
}

function readBox(rect: Element): SvgBox {
  return {
    id: rect.getAttribute('data-group') ?? rect.parentElement?.getAttribute('data-node') ?? '',
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

function nodeBox(id: string) {
  return readBox(diagram().querySelector(`[data-node="${id}"] rect`)!)
}

function groupBox(id: string) {
  return readBox(diagram().querySelector(`[data-group="${id}"]`)!)
}

function frameOf(box: SvgBox) {
  return [box.x, box.y, box.width, box.height] as [number, number, number, number]
}

function shownIds(selector: string, attribute: string) {
  return Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)!)
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

// 상자가 그룹 박스 안에 다 들어 있는가.
function inside(box: SvgBox, group: string) {
  return boxesOutsideViewBox([box], frameOf(groupBox(group))).length === 0
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

// 선분을 폭이나 높이가 0인 상자로 본다.
function segmentBox(segment: Segment): SvgBox {
  return {
    id: '',
    x: Math.min(segment.x1, segment.x2), y: Math.min(segment.y1, segment.y2),
    width: Math.abs(segment.x2 - segment.x1), height: Math.abs(segment.y2 - segment.y1),
  }
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

function groupLabelArea(group: string): SvgBox {
  const box = groupBox(group)
  return { id: group, x: box.x + 10, y: box.y + 7, width: estimateTextWidth(groupLabels[group as keyof typeof groupLabels], 9), height: 9 }
}

// 아래 단언들은 배치에 묶이지 않는다. 세로형과 가로형이 같은 기대값으로 통과해야 한다.
async function expectScenario(
  scenario: typeof expectedScenarios[number],
  paths: Record<string, string>,
  container: HTMLElement,
) {
  await selectScenario(scenario.label)

  for (const node of diagram().querySelectorAll('[data-node]')) {
    expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
  }
  for (const link of diagram().querySelectorAll('[data-link]')) {
    expect(link).toHaveAttribute('opacity', scenario.nodes.includes(link.getAttribute('data-link')!) ? '1' : '0.25')
  }
  for (const group of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(group.closest('[opacity]')).toBeNull()

  const shownPaths = Array.from(diagram().querySelectorAll('[data-path]'))
  expect(shownPaths.map((path) => path.getAttribute('data-path'))).toEqual(scenario.paths)
  for (const path of shownPaths) {
    expect(path).toHaveAttribute('d', paths[path.getAttribute('data-path')!])
    expect(path).toHaveAttribute('stroke-width', '2')
    expect(path).toHaveAttribute('marker-end', `url(#${diagram().querySelector('marker')!.id})`)
    expect(path).toHaveClass('stroke-title')
    expect(path.closest('[opacity]')).toBeNull()
  }
  expect(shownIds('[data-note]', 'data-note')).toEqual(['medium-kind'])
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 상자 안에, 그룹 라벨은 자기 박스 오른쪽 끝 안에, 매체 곁말은 viewBox 안에 들어간다.
function expectFits(viewBox: [number, number, number, number], note: { x: number, y: number }) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(label, 10) + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
  }

  for (const [id, wording] of Object.entries(groupLabels)) {
    const box = groupBox(id)
    const groupLabel = diagram().querySelector(`[data-group-label="${id}"]`)!
    expect(groupLabel.textContent).toBe(wording)
    expect(groupLabel).toHaveAttribute('font-size', '9')
    expect(groupLabel).toHaveClass('fill-muted')
    const x = Number(groupLabel.getAttribute('x'))
    expect(x, wording).toBe(box.x + 10)
    expect(Number(groupLabel.getAttribute('y')), wording).toBe(box.y + 14)
    expect(x + estimateTextWidth(wording, 9), wording).toBeLessThanOrEqual(box.x + box.width)
    for (const node of nodeIds) expect(overlaps(groupLabelArea(id), nodeBox(node)), `${wording} ↔ ${node}`).toBe(false)
  }

  const kind = diagram().querySelector('[data-note="medium-kind"]')!
  expect(kind.textContent).toBe(noteLabels['medium-kind'])
  expect(kind).toHaveAttribute('x', String(note.x))
  expect(kind).toHaveAttribute('y', String(note.y))
  expect(kind).toHaveAttribute('text-anchor', 'middle')
  expect(kind).toHaveAttribute('font-size', '9')
  expect(kind).toHaveClass('fill-muted')
  const kindBox = textBox(kind)
  expect(boxesOutsideViewBox([kindBox], viewBox)).toEqual([])
  for (const node of nodeIds) expect(overlaps(kindBox, nodeBox(node)), node).toBe(false)
  for (const group of groupIds) expect(overlaps(kindBox, groupBox(group)), group).toBe(false)
  // 곁말은 매체 상자 바로 아래 가운데에 있다.
  const medium = nodeBox('medium')
  expect(note.x).toBe(medium.x + medium.width / 2)
  expect(kindBox.y).toBeGreaterThanOrEqual(medium.y + medium.height)
}

// 화살표와 연결선의 양 끝은 두 노드의 변에 닿고, 어떤 선분도 노드 안과 그룹 라벨 영역과 곁말을 지나지 않는다.
async function expectPathEnds() {
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    const nodeBoxes = nodeIds.map(nodeBox)
    const kindBox = textBox(diagram().querySelector('[data-note="medium-kind"]')!)
    for (const path of diagram().querySelectorAll('[data-path], [data-link]')) {
      const id = path.getAttribute('data-path') ?? path.getAttribute('data-link')!
      for (const segment of segments(path.getAttribute('d')!)) {
        for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelArea(group)), `${id} ↔ ${group}`).toBe(false)
        expect(touches(segment, kindBox), `${id} ↔ 곁말`).toBe(false)
      }
      const { start, end } = lineEnds(path)
      expect(nodeAt(start), `${id} 시작`).toBe(ends[id][0])
      expect(nodeAt(end), `${id} 끝`).toBe(ends[id][1])
    }
  }
}

// 계층은 자기 호스트 박스 안에만 있고, 매체는 두 박스 밖에 있다. 두 스택의 계층이 같은 높이에 짝을 이루고, 맨 위 계층부터 아래로 쌓인다.
// 늘 보이는 연결선은 화살표 없는 회색 선이고, 노드는 모두 회색이며 도식 전용 두 색·초록·빨강·주황은 쓰지 않는다.
function expectStructure() {
  for (const layer of senderLayers) expect(groupIds.filter((group) => inside(nodeBox(layer), group)), layer).toEqual(['sender'])
  for (const layer of receiverLayers) expect(groupIds.filter((group) => inside(nodeBox(layer), group)), layer).toEqual(['receiver'])
  for (const group of groupIds) expect(overlaps(nodeBox('medium'), groupBox(group)), group).toBe(false)

  senderLayers.forEach((layer, index) => {
    expect(nodeBox(layer).y, layer).toBe(nodeBox(receiverLayers[index]).y)
    if (index > 0) expect(nodeBox(layer).y, layer).toBeGreaterThan(nodeBox(senderLayers[index - 1]).y)
  })

  expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
  for (const link of diagram().querySelectorAll('[data-link]')) {
    expect(link).toHaveClass('stroke-muted')
    expect(link).toHaveAttribute('stroke-width', '1.5')
    expect(link).not.toHaveAttribute('marker-end')
  }
  for (const id of nodeIds) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 보낼 때: 화살표가 맨 위 계층부터 한 계층씩 내려가 매체에 닿고, 세로 선분은 모두 아래로 간다.
// 받을 때: 화살표가 매체에서 맨 아래 계층으로 들어와 한 계층씩 올라가고, 세로 선분은 모두 위로 간다.
// 계층 사이를 오가는 화살표는 자기 호스트 박스를 벗어나지 않는다.
async function expectDirections(paths: Record<string, string>) {
  await selectScenario('보낼 때')
  const sendHops = Array.from(diagram().querySelectorAll('[data-path]'), (path) => [nodeAt(lineEnds(path).start), nodeAt(lineEnds(path).end)])
  expect(sendHops).toEqual([['sender-1', 'sender-2'], ['sender-2', 'sender-3'], ['sender-3', 'sender-4'], ['sender-4', 'medium']])
  for (const id of ['send-1', 'send-2', 'send-3', 'send-4']) {
    for (const segment of segments(paths[id])) {
      if (segment.x1 === segment.x2) expect(segment.y2, id).toBeGreaterThan(segment.y1)
    }
  }
  for (const id of ['send-1', 'send-2', 'send-3']) {
    for (const segment of segments(paths[id])) expect(inside(segmentBox(segment), 'sender'), id).toBe(true)
  }

  await selectScenario('받을 때')
  const receiveHops = Array.from(diagram().querySelectorAll('[data-path]'), (path) => [nodeAt(lineEnds(path).start), nodeAt(lineEnds(path).end)])
  expect(receiveHops).toEqual([['medium', 'receiver-4'], ['receiver-4', 'receiver-3'], ['receiver-3', 'receiver-2'], ['receiver-2', 'receiver-1']])
  for (const id of ['receive-1', 'receive-2', 'receive-3', 'receive-4']) {
    for (const segment of segments(paths[id])) {
      if (segment.x1 === segment.x2) expect(segment.y2, id).toBeLessThan(segment.y1)
    }
  }
  for (const id of ['receive-2', 'receive-3', 'receive-4']) {
    for (const segment of segments(paths[id])) expect(inside(segmentBox(segment), 'receiver'), id).toBe(true)
  }

  // 매체로 나가고 들어오는 화살표는 늘 보이는 연결선 위에 겹친다.
  expect(paths['send-4']).toBe(paths['medium-out'])
  expect(paths['receive-1']).toBe(paths['medium-in'])
}

async function expectUniqueMarkers() {
  render(<><LayerJourneyDiagram /><LayerJourneyDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: '보낼 때와 받을 때 계층을 지나는 방향 도식' })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '받을 때' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(4)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('LayerJourneyDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<LayerJourneyDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 아홉·연결선 둘·호스트 박스 둘이 모두 선명하고 화살표 없이 선택 안내가 나온다', () => {
    const { container } = render(<LayerJourneyDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    expect(shownIds('[data-group]', 'data-group')).toEqual(groupIds)
    for (const node of diagram().querySelectorAll('[data-node], [data-link]')) expect(node).toHaveAttribute('opacity', '1')
    for (const group of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(group.closest('[opacity]')).toBeNull()
    expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(shownIds('[data-note]', 'data-note')).toEqual(['medium-kind'])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·연결선·화살표만 선명하고 나머지는 흐려지며 호스트 박스는 그대로다', async (scenario) => {
    const { container } = render(<LayerJourneyDiagram />)
    await expectScenario(scenario, tallPaths, container)
  })

  it('시나리오를 바꾸면 이전 화살표가 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<LayerJourneyDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
    }
    await selectScenario('전체')

    for (const node of diagram().querySelectorAll('[data-node], [data-link]')) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드와 호스트 박스가 280×296 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<LayerJourneyDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 296')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 296], tallNote)
  })

  it('계층은 자기 호스트 박스 안에 같은 높이로 짝지어 쌓이고 매체는 두 박스 밖에 있다', () => {
    render(<LayerJourneyDiagram />)
    expectStructure()
  })

  it('화살표와 연결선의 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
    render(<LayerJourneyDiagram />)
    await expectPathEnds()
  })

  it('보낼 때는 맨 위 계층에서 아래로 내려가 매체로 나가고, 받을 때는 매체에서 맨 아래 계층으로 들어와 위로 올라간다', async () => {
    render(<LayerJourneyDiagram />)
    await expectDirections(tallPaths)
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<LayerJourneyDiagram />)
    const text = visualsByTopicId[topicId].diagrams['layer-journey']
    const ids = layerJourneyScenarios.map(({ id }) => id).sort()
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
    expect(text.label).toBe('보낼 때와 받을 때 계층을 지나는 방향 도식')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = layerJourneyScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 네트워크 참조 모델 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: '보낼 때와 받을 때 계층을 지나는 방향 도식' })

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

    async function collectPathIds() {
      const found = new Set<string>()
      for (const { label } of expectedScenarios) {
        await selectScenario(label)
        for (const id of shownIds('[data-path]', 'data-path')) found.add(id)
      }
      for (const id of shownIds('[data-link]', 'data-link')) found.add(id)
      return [...found].sort()
    }

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×224 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<LayerJourneyDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 224')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·그룹 id 집합과 화살표·연결선 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<LayerJourneyDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 296')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroups = shownIds('[data-group]', 'data-group').sort()
      const tallPathIds = await collectPathIds()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 224')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroups)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallGroups).toEqual([...groupIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallPaths).sort())
      expect(await collectPathIds()).toEqual(tallPathIds)
    })

    it('모든 rect가 440×224 viewBox 안에 있고 라벨과 그룹 라벨이 자기 상자 안에 들어간다', () => {
      render(<LayerJourneyDiagram />)
      expectFits([0, 0, 440, 224], wideNote)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·연결선·화살표·캡션을 보인다', async (scenario) => {
      const { container } = render(<LayerJourneyDiagram />)
      await expectScenario(scenario, widePaths, container)
    })

    it('계층은 자기 호스트 박스 안에 같은 높이로 짝지어 쌓이고 매체는 두 박스 밖에 있다', () => {
      render(<LayerJourneyDiagram />)
      expectStructure()
    })

    it('화살표와 연결선의 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
      render(<LayerJourneyDiagram />)
      await expectPathEnds()
    })

    it('보낼 때는 맨 위 계층에서 아래로 내려가 매체로 나가고, 받을 때는 매체에서 맨 아래 계층으로 들어와 위로 올라간다', async () => {
      render(<LayerJourneyDiagram />)
      await expectDirections(widePaths)
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<LayerJourneyDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 296')
      await selectScenario('받을 때')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '받을 때' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['receive-1', 'receive-2', 'receive-3', 'receive-4'])
      for (const path of paths) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
    })
  })
})
