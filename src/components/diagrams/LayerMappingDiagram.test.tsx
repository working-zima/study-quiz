import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { LayerMappingDiagram, layerMappingScenarios } from './LayerMappingDiagram'

const topicId = 'protocols-encapsulation'
const anchorConceptId = `${topicId}.tcp-ip-model`
const figureLabel = 'OSI 모델의 일곱 계층과 TCP/IP 모델의 네 계층을 짝지은 도식'
const labels = {
  'osi-application': '응용 계층',
  'osi-presentation': '표현 계층',
  'osi-session': '세션 계층',
  'osi-transport': '전송 계층',
  'osi-network': '네트워크 계층',
  'osi-data-link': '데이터 링크 계층',
  'osi-physical': '물리 계층',
  'tcpip-application': '응용 계층',
  'tcpip-transport': '전송 계층',
  'tcpip-internet': '인터넷 계층',
  'tcpip-network-access': '네트워크 액세스 계층',
}
const groupLabels = {
  osi: 'OSI 모델',
  tcpip: 'TCP/IP 모델',
}
const noteLabels = { 'session-note': '세션 계층은 강의의 정리' }

const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
// 두 기둥 모두 맨 위가 응용 계층이다.
const osiLayers = ['osi-application', 'osi-presentation', 'osi-session', 'osi-transport', 'osi-network', 'osi-data-link', 'osi-physical']
const tcpipLayers = ['tcpip-application', 'tcpip-transport', 'tcpip-internet', 'tcpip-network-access']
const linkIds = ['map-application', 'map-presentation', 'map-session', 'map-transport', 'map-network', 'map-data-link', 'map-physical']

const tallPaths: Record<string, string> = {
  'map-application': 'M108 48 H132 V80 H156',
  'map-presentation': 'M108 88 H156',
  'map-session': 'M108 128 H132 V96 H156',
  'map-transport': 'M108 168 H156',
  'map-network': 'M108 208 H156',
  'map-data-link': 'M108 248 H132 V264 H156',
  'map-physical': 'M108 288 H132 V276 H156',
}
const widePaths: Record<string, string> = {
  'map-application': 'M148 48 H220 V76 H292',
  'map-presentation': 'M148 84 H292',
  'map-session': 'M148 120 H220 V92 H292',
  'map-transport': 'M148 156 H292',
  'map-network': 'M148 192 H292',
  'map-data-link': 'M148 228 H220 V240 H292',
  'map-physical': 'M148 264 H220 V252 H292',
}
const tallNote = { x: 160, y: 131, anchor: 'start' }
const wideNote = { x: 220, y: 136, anchor: 'middle' }

// 연결선마다 이은 OSI 계층과 TCP/IP 계층.
const ends: Record<string, [string, string]> = {
  'map-application': ['osi-application', 'tcpip-application'],
  'map-presentation': ['osi-presentation', 'tcpip-application'],
  'map-session': ['osi-session', 'tcpip-application'],
  'map-transport': ['osi-transport', 'tcpip-transport'],
  'map-network': ['osi-network', 'tcpip-internet'],
  'map-data-link': ['osi-data-link', 'tcpip-network-access'],
  'map-physical': ['osi-physical', 'tcpip-network-access'],
}

const question = 'OSI의 일곱 계층은 TCP/IP의 네 계층과 어떻게 짝지어질까?'
const idleCaption = '인터넷에서 쓰는 TCP/IP 모델은 계층이 넷이고 OSI 모델은 일곱이라, 두 모델의 계층은 일대일로 꼭 맞아떨어지지는 않는다. 선은 두 모델에서 하는 일이 비슷한 자리끼리 짝지은 것이다. TCP/IP 모델의 계층을 고르면 OSI 모델의 어느 계층과 짝지어지는지 볼 수 있다.'
const legend = '왼쪽 박스는 OSI 모델, 오른쪽 박스는 TCP/IP 모델이고, 두 박스 모두 맨 위가 응용 계층이다. 선은 하는 일이 비슷한 계층끼리 이은 것이고, 점선은 강의가 정리한 짝이라 표준 문서가 정한 대응이 아니다.'
const expectedScenarios = [
  {
    id: 'application', label: '응용 계층',
    tcpip: 'tcpip-application',
    osi: ['osi-application', 'osi-presentation', 'osi-session'],
    links: ['map-application', 'map-presentation', 'map-session'],
    notes: ['session-note'],
    caption: 'TCP/IP 모델의 응용 계층 자리에는 OSI 모델의 응용·표현·세션 계층을 놓는다. 다만 표준 문서는 TCP/IP의 응용 계층이 OSI 모델의 표현 계층과 응용 계층이 하던 일을 합친 것이라고만 할 뿐, 세션 계층은 말하지 않는다. TCP/IP 모델에는 처음부터 세션 계층에 해당하는 계층이 없었고, 세션 계층까지 이 자리에 둔 것은 강의의 정리다.',
    sources: [anchorConceptId],
  },
  {
    id: 'transport', label: '전송 계층',
    tcpip: 'tcpip-transport',
    osi: ['osi-transport'],
    links: ['map-transport'],
    notes: [],
    caption: 'TCP/IP 모델의 전송 계층은 OSI 모델의 전송 계층에 해당한다. 다만 OSI 모델은 신뢰성 있는 전달을 이 계층의 몫으로 정의하지만, TCP/IP 모델의 전송 계층에는 신뢰성을 더하는 TCP와 함께 신뢰성을 더하지 않는 UDP도 있다.',
    sources: [anchorConceptId, `${topicId}.osi-model`],
  },
  {
    id: 'internet', label: '인터넷 계층',
    tcpip: 'tcpip-internet',
    osi: ['osi-network'],
    links: ['map-network'],
    notes: [],
    caption: 'TCP/IP 모델의 인터넷 계층은 OSI 모델의 네트워크 계층에 해당한다. 이 계층에서 IP는 IP 주소로 목적지를 가리고, 두 호스트가 서로 다른 네트워크에 있어도 그 사이의 네트워크들을 거쳐 출발지 호스트에서 목적지 호스트까지 데이터를 나른다.',
    sources: [anchorConceptId],
  },
  {
    id: 'network-access', label: '네트워크 액세스 계층',
    tcpip: 'tcpip-network-access',
    osi: ['osi-data-link', 'osi-physical'],
    links: ['map-data-link', 'map-physical'],
    notes: [],
    caption: 'TCP/IP 모델의 네트워크 액세스 계층은 OSI 모델의 물리 계층과 데이터 링크 계층이 나눠 맡던 일을 함께 맡는다. 호스트가 자기가 직접 이어진 네트워크 안에서 통신할 때 쓰는 이더넷 같은 프로토콜이 이 계층에 속한다.',
    sources: [anchorConceptId],
  },
].map((scenario) => ({ ...scenario, nodes: [scenario.tcpip, ...scenario.osi, ...scenario.links] }))

function diagram() {
  return screen.getByRole('img', { name: '왼쪽에 OSI 모델의 일곱 계층, 오른쪽에 TCP/IP 모델의 네 계층을 위에서부터 쌓고 하는 일이 비슷한 계층끼리 선으로 이은 모습' })
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
async function expectScenario(scenario: typeof expectedScenarios[number], container: HTMLElement) {
  await selectScenario(scenario.label)

  for (const node of diagram().querySelectorAll('[data-node]')) {
    expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
  }
  for (const link of diagram().querySelectorAll('[data-link]')) {
    expect(link).toHaveAttribute('opacity', scenario.nodes.includes(link.getAttribute('data-link')!) ? '1' : '0.25')
  }
  for (const group of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(group.closest('[opacity]')).toBeNull()
  expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
  expect(shownIds('[data-note]', 'data-note')).toEqual(scenario.notes)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 상자 안에, 그룹 라벨은 자기 박스 오른쪽 끝 안에 들어간다.
// 세션 곁말은 viewBox와 TCP/IP 박스 안에 있고 노드·그룹 라벨에 겹치지 않는다.
async function expectFits(viewBox: [number, number, number, number], note: typeof tallNote) {
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

  await selectScenario('응용 계층')
  const sessionNote = diagram().querySelector('[data-note="session-note"]')!
  expect(sessionNote.textContent).toBe(noteLabels['session-note'])
  expect(sessionNote).toHaveAttribute('x', String(note.x))
  expect(sessionNote).toHaveAttribute('y', String(note.y))
  expect(sessionNote).toHaveAttribute('text-anchor', note.anchor)
  expect(sessionNote).toHaveAttribute('font-size', '9')
  expect(sessionNote).toHaveClass('fill-muted')
  const noteBox = textBox(sessionNote)
  expect(boxesOutsideViewBox([noteBox], viewBox)).toEqual([])
  for (const node of nodeIds) expect(overlaps(noteBox, nodeBox(node)), node).toBe(false)
  for (const group of groupIds) expect(overlaps(noteBox, groupLabelArea(group)), group).toBe(false)
  // 곁말은 박스 테두리를 가로지르지 않는다. 한 박스 안에 다 들거나 두 박스 밖에 있다.
  const holders = groupIds.filter((group) => inside(noteBox, group))
  const crossed = groupIds.filter((group) => overlaps(noteBox, groupBox(group)) && !inside(noteBox, group))
  expect(crossed).toEqual([])
  expect(holders.length).toBeLessThanOrEqual(1)
  // 곁말은 세션 계층과 같은 높이에 걸친다.
  const session = nodeBox('osi-session')
  expect(noteBox.y).toBeGreaterThanOrEqual(session.y)
  expect(noteBox.y + noteBox.height).toBeLessThanOrEqual(session.y + session.height + 8)
}

// 연결선의 양 끝은 짝지은 두 계층의 변에 닿고, 어떤 선분도 노드 안과 그룹 라벨 영역과 세션 곁말을 지나지 않는다.
async function expectLinkEnds(paths: Record<string, string>) {
  await selectScenario('응용 계층')
  const nodeBoxes = nodeIds.map(nodeBox)
  const noteBox = textBox(diagram().querySelector('[data-note="session-note"]')!)
  for (const link of diagram().querySelectorAll('[data-link]')) {
    const id = link.getAttribute('data-link')!
    expect(link).toHaveAttribute('d', paths[id])
    for (const segment of segments(link.getAttribute('d')!)) {
      for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
      for (const group of groupIds) expect(touches(segment, groupLabelArea(group)), `${id} ↔ ${group}`).toBe(false)
      expect(touches(segment, noteBox), `${id} ↔ 곁말`).toBe(false)
    }
    const { start, end } = lineEnds(link)
    expect(nodeAt(start), `${id} 시작`).toBe(ends[id][0])
    expect(nodeAt(end), `${id} 끝`).toBe(ends[id][1])
  }
}

// OSI 계층은 OSI 박스에만, TCP/IP 계층은 TCP/IP 박스에만 있고, 두 기둥 모두 맨 위 응용 계층부터 아래로 쌓인다.
// 연결선은 화살표 없는 회색 선이고 세션 계층을 잇는 선만 점선이다. 노드는 모두 회색이며 도식 전용 두 색·초록·빨강·주황은 쓰지 않는다.
function expectStructure() {
  for (const layer of osiLayers) expect(groupIds.filter((group) => inside(nodeBox(layer), group)), layer).toEqual(['osi'])
  for (const layer of tcpipLayers) expect(groupIds.filter((group) => inside(nodeBox(layer), group)), layer).toEqual(['tcpip'])
  for (const column of [osiLayers, tcpipLayers]) {
    column.forEach((layer, index) => {
      if (index > 0) expect(nodeBox(layer).y, layer).toBeGreaterThan(nodeBox(column[index - 1]).y + 32 - 1)
    })
  }

  expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
  for (const link of diagram().querySelectorAll('[data-link]')) {
    expect(link).toHaveClass('stroke-muted')
    expect(link).toHaveAttribute('stroke-width', '1.5')
    expect(link).not.toHaveAttribute('marker-end')
    if (link.getAttribute('data-link') === 'map-session') expect(link).toHaveAttribute('stroke-dasharray', '4 3')
    else expect(link).not.toHaveAttribute('stroke-dasharray')
  }
  for (const id of nodeIds) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 시나리오마다 선명한 OSI 계층이 표와 같고, 네 시나리오의 OSI 계층을 합치면 일곱이 빠짐없이 한 번씩 나온다.
// 선명한 연결선은 그 시나리오의 TCP/IP 계층과 선명한 OSI 계층만 잇는다.
async function expectMapping() {
  const seen: string[] = []
  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    const shownOsi = osiLayers.filter((id) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
    const shownTcpip = tcpipLayers.filter((id) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
    expect(shownOsi, scenario.label).toEqual(scenario.osi)
    expect(shownTcpip, scenario.label).toEqual([scenario.tcpip])
    const shownLinks = linkIds.filter((id) => diagram().querySelector(`[data-link="${id}"]`)!.getAttribute('opacity') === '1')
    for (const id of shownLinks) {
      const { start, end } = lineEnds(diagram().querySelector(`[data-link="${id}"]`)!)
      expect(shownOsi, id).toContain(nodeAt(start))
      expect(nodeAt(end), id).toBe(scenario.tcpip)
    }
    expect(shownLinks.map((id) => ends[id][0]).sort(), scenario.label).toEqual([...scenario.osi].sort())
    seen.push(...shownOsi)
  }
  expect([...seen].sort()).toEqual([...osiLayers].sort())
  expect(new Set(seen).size).toBe(seen.length)
}

async function expectIndependentRenders() {
  render(<><LayerMappingDiagram /><LayerMappingDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureLabel })
  await act(async () => { await userEvent.click(within(figures[0]).getByRole('button', { name: '전송 계층' })) })
  await act(async () => { await userEvent.click(within(figures[1]).getByRole('button', { name: '인터넷 계층' })) })
  expect(figures[0].querySelector('[data-node="tcpip-transport"]')).toHaveAttribute('opacity', '1')
  expect(figures[0].querySelector('[data-node="tcpip-internet"]')).toHaveAttribute('opacity', '0.25')
  expect(figures[1].querySelector('[data-node="tcpip-internet"]')).toHaveAttribute('opacity', '1')
  expect(figures[1].querySelector('[data-node="tcpip-transport"]')).toHaveAttribute('opacity', '0.25')
  for (const figure of figures) expect(figure.querySelector('marker')).toBeNull()
}

describe('LayerMappingDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<LayerMappingDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 계층 열하나·연결선 일곱·모델 박스 둘이 모두 선명하고 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<LayerMappingDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    expect(shownIds('[data-group]', 'data-group')).toEqual(groupIds)
    for (const node of diagram().querySelectorAll('[data-node], [data-link]')) expect(node).toHaveAttribute('opacity', '1')
    for (const group of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(group.closest('[opacity]')).toBeNull()
    expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
    expect(diagram().querySelectorAll('[data-path], marker')).toHaveLength(0)
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 짝지은 계층과 연결선만 선명하고 나머지는 흐려지며 모델 박스는 그대로다', async (scenario) => {
    const { container } = render(<LayerMappingDiagram />)
    await expectScenario(scenario, container)
  })

  it('시나리오를 바꾸면 이전 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<LayerMappingDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-note]', 'data-note')).toEqual(scenario.notes)
    }
    await selectScenario('전체')

    for (const node of diagram().querySelectorAll('[data-node], [data-link]')) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드와 모델 박스가 280×320 viewBox 안에 있고 모바일 너비 보정을 유지한다', async () => {
    render(<LayerMappingDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 320')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    await expectFits([0, 0, 280, 320], tallNote)
  })

  it('계층은 자기 모델 박스 안에 맨 위 응용 계층부터 쌓이고 세션 계층을 잇는 선만 점선이다', () => {
    render(<LayerMappingDiagram />)
    expectStructure()
  })

  it('연결선의 양 끝은 짝지은 두 계층의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨과 곁말을 지나지 않는다', async () => {
    render(<LayerMappingDiagram />)
    await expectLinkEnds(tallPaths)
  })

  it('시나리오마다 OSI 계층이 표대로 선명하고, 넷을 합치면 일곱 계층이 빠짐없이 한 번씩 나온다', async () => {
    render(<LayerMappingDiagram />)
    await expectMapping()
  })

  it('두 번 렌더해도 도식마다 자기 시나리오를 따로 고르고 화살표 마커가 없다', async () => {
    await expectIndependentRenders()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<LayerMappingDiagram />)
    const text = visualsByTopicId[topicId].diagrams['layer-mapping']
    const ids = layerMappingScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.label).toBe(figureLabel)
    expect(text.sources).toEqual([anchorConceptId, `${topicId}.osi-model`])
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = layerMappingScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: expected.sources })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual([])
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) {
      expect(conceptIds).toContain(source)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 TCP/IP 모델 개념 본문 바로 뒤에 도식을, 그 뒤에 계층 대응표를 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureLabel })
    const table = screen.getByRole('figure', { name: visualsByTopicId[topicId].tables['reference-models'].label })

    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(screen.getAllByRole('figure')).toEqual([figure, table])
    expect(table.previousElementSibling).toBe(figure)
    expect(figure.closest('article')!.lastElementChild).toBe(table)
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

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×296 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<LayerMappingDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 296')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·그룹·연결선 id 집합이 세로형과 같다', () => {
      const { change } = mockMatchMedia(false)
      render(<LayerMappingDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 320')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroups = shownIds('[data-group]', 'data-group').sort()
      const tallLinks = shownIds('[data-link]', 'data-link').sort()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 296')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroups)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinks)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallGroups).toEqual([...groupIds].sort())
      expect(tallLinks).toEqual([...linkIds].sort())
    })

    it('모든 rect가 440×296 viewBox 안에 있고 라벨과 그룹 라벨과 곁말이 자기 자리에 들어간다', async () => {
      render(<LayerMappingDiagram />)
      await expectFits([0, 0, 440, 296], wideNote)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 계층·연결선·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<LayerMappingDiagram />)
      await expectScenario(scenario, container)
    })

    it('계층은 자기 모델 박스 안에 맨 위 응용 계층부터 쌓이고 세션 계층을 잇는 선만 점선이다', () => {
      render(<LayerMappingDiagram />)
      expectStructure()
    })

    it('연결선의 양 끝은 짝지은 두 계층의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨과 곁말을 지나지 않는다', async () => {
      render(<LayerMappingDiagram />)
      await expectLinkEnds(widePaths)
    })

    it('시나리오마다 OSI 계층이 표대로 선명하고, 넷을 합치면 일곱 계층이 빠짐없이 한 번씩 나온다', async () => {
      render(<LayerMappingDiagram />)
      await expectMapping()
    })

    it('두 번 렌더해도 도식마다 자기 시나리오를 따로 고르고 화살표 마커가 없다', async () => {
      await expectIndependentRenders()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<LayerMappingDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 320')
      await selectScenario('응용 계층')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '응용 계층' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownIds('[data-note]', 'data-note')).toEqual(['session-note'])
      expect(diagram().querySelector('[data-note="session-note"]')).toHaveAttribute('x', String(wideNote.x))
      for (const link of diagram().querySelectorAll('[data-link]')) expect(link).toHaveAttribute('d', widePaths[link.getAttribute('data-link')!])
    })
  })
})
