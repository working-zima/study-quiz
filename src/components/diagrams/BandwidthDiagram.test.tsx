import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { BandwidthDiagram, bandwidthScenarios } from './BandwidthDiagram'
import { ExpectedSpeedDiagram } from './ExpectedSpeedDiagram'
import { ThroughputDiagram } from './ThroughputDiagram'

const topicId = 'network-basics'
const anchorConceptId = `${topicId}.bandwidth`
const labels = { speed: '전송 속도', throughput: '처리율' }
const groupLabels = { bandwidth: '대역폭' }
const noteLabels = { capacity: '넘을 수 없는 최대치', actual: '실제로 전송된 양' }
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)

// 전송 속도를 가리키는 세로 표시선. 늘 보이고 화살표가 없다.
const tallLinks: Record<string, string> = { 'speed-line': 'M200 40 V112' }
const wideLinks: Record<string, string> = { 'speed-line': 'M320 40 V112' }

const tallNotes: NotePlaces = {
  capacity: { x: 272, y: 128, anchor: 'end' },
  actual: { x: 80, y: 128, anchor: 'middle' },
}
const wideNotes: NotePlaces = {
  capacity: { x: 432, y: 128, anchor: 'end' },
  actual: { x: 118, y: 128, anchor: 'middle' },
}

const svgName = '대역폭을 나타내는 바깥 막대 안에 처리율을 나타내는 채운 막대가 있고, 전송 속도를 가리키는 세로 표시선이 막대를 지나는 네트워크 연결 하나'
const figureName = '대역폭과 실제로 전송된 양을 견주는 도식'
const question = '네트워크는 데이터를 최대 얼마까지 보내고 받을 수 있을까?'
const idleCaption = '대역폭은 네트워크가 보내고 받을 수 있는 데이터 양의 최대치다. 버튼을 고르면 그 최대치와 실제로 전송된 양이 막대의 어디에 있는지 견줄 수 있다.'
const legend = '바깥 막대는 대역폭, 그 안을 왼쪽부터 채운 막대는 처리율, 세로 표시선은 전송 속도다. 눈금이 없어 길이로는 어느 쪽이 큰지만 볼 수 있다.'
const expectedScenarios = [
  {
    id: 'capacity', label: '대역폭',
    nodes: [] as string[],
    notes: ['capacity'],
    caption: '대역폭은 네트워크가 받아 낼 수 있는 트래픽의 용량, 곧 보내고 받을 수 있는 데이터 양의 최대치다. 지금 실제로 얼마가 오가는지와 상관없이, 그 네트워크가 갖춘 능력을 말한다.',
    sources: [anchorConceptId],
  },
  {
    id: 'actual', label: '실제로 전송된 양',
    nodes: ['throughput'],
    notes: ['actual'],
    caption: '대역폭이 크면 같은 시간에 더 많은 데이터를 보내고 받을 수 있지만, 늘 그만큼 전송되는 것은 아니다. 정해 둔 시간 동안 실제로 전송된 양은 처리율이라 따로 재고, 처리율은 대역폭이라는 상한을 넘지 못한다.',
    sources: [anchorConceptId],
  },
]

function diagram() {
  return screen.getByRole('img', { name: svgName })
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

function groupLabelArea(id: string): SvgBox {
  const box = groupBox(id)
  return { id, x: box.x + 10, y: box.y + 7, width: estimateTextWidth(groupLabels[id as keyof typeof groupLabels], 9), height: 9 }
}

function frameOf(box: SvgBox) {
  return [box.x, box.y, box.width, box.height] as [number, number, number, number]
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

// 상자가 그룹 박스 안에 다 들어 있는가.
function inside(box: SvgBox, group: string) {
  return boxesOutsideViewBox([box], frameOf(groupBox(group))).length === 0
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

function opacityOf(selector: string) {
  return diagram().querySelector(selector)!.getAttribute('opacity')
}

// 아래 단언들은 배치에 묶이지 않는다. 세로형과 가로형이 같은 기대값으로 통과해야 한다.
async function expectScenario(
  scenario: typeof expectedScenarios[number],
  places: NotePlaces,
  width: number,
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
  expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)

  const lineSegments = Array.from(diagram().querySelectorAll('[data-link]')).flatMap((line) => segments(line.getAttribute('d')!))
  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  const shownNotes = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shownNotes.map((note) => note.getAttribute('data-note'))).toEqual(scenario.notes)
  for (const note of shownNotes) {
    const id = note.getAttribute('data-note')! as NoteId
    expect(note.textContent).toBe(noteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', places[id].anchor)
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note.closest('[opacity]')).toBeNull()
    const box = textBox(note)
    expect(box.x, id).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, id).toBeLessThanOrEqual(width)
    for (const node of nodeBoxes) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const group of groupIds) expect(overlaps(box, groupLabelArea(group)), `${id} ↔ ${group} 라벨`).toBe(false)
    for (const segment of lineSegments) expect(touches(segment, box), `${id} ↔ 선`).toBe(false)
  }
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 상자 안에, 그룹 라벨은 자기 박스 오른쪽 끝 안에 들어간다.
function expectFits(viewBox: [number, number, number, number]) {
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
    expect(Number(groupLabel.getAttribute('x')), wording).toBe(box.x + 10)
    expect(Number(groupLabel.getAttribute('y')), wording).toBe(box.y + 14)
    expect(box.x + 10 + estimateTextWidth(wording, 9), wording).toBeLessThanOrEqual(box.x + box.width)
    for (const node of nodeIds) expect(overlaps(groupLabelArea(id), nodeBox(node)), `${wording} ↔ ${node}`).toBe(false)
  }
}

// 채운 막대(처리율)는 바깥 막대(대역폭) 안에 있고 전송 속도 꼬리표는 그 밖 위에 있다.
// 노드는 모두 회색이고 도식 전용 두 색·초록·빨강·주황은 쓰지 않는다. 표시선은 화살표가 없는 회색 선이다.
function expectStructure(links: Record<string, string>) {
  expect(inside(nodeBox('throughput'), 'bandwidth')).toBe(true)
  expect(overlaps(nodeBox('speed'), groupBox('bandwidth'))).toBe(false)
  for (const id of nodeIds) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  expect(diagram().querySelector('[data-node="throughput"] rect')).toHaveClass('fill-disabled')
  expect(diagram().querySelector('[data-node="speed"] rect')).toHaveClass('fill-panel')
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()

  const shown = Array.from(diagram().querySelectorAll('[data-link]'))
  expect(shown.map((link) => link.getAttribute('data-link'))).toEqual(Object.keys(links))
  for (const link of shown) {
    expect(link).toHaveAttribute('d', links[link.getAttribute('data-link')!])
    expect(link).toHaveClass('fill-none', 'stroke-muted')
    expect(link).toHaveAttribute('stroke-width', '1.5')
    expect(link).not.toHaveAttribute('marker-end')
  }
  expect(diagram().querySelector('marker')).toBeNull()
}

// 표시선은 전송 속도 꼬리표의 아래 변에서 바깥 막대의 아래 변까지 내려가고, 노드 안과 그룹 라벨을 지나지 않는다.
function expectLineEnds() {
  const line = diagram().querySelector('[data-link="speed-line"]')!
  const list = segments(line.getAttribute('d')!)
  const start = { x: list[0].x1, y: list[0].y1 }
  const end = { x: list[list.length - 1].x2, y: list[list.length - 1].y2 }
  const speed = nodeBox('speed')
  const bar = groupBox('bandwidth')

  expect(onEdge(start.x, start.y, speed) && start.y === speed.y + speed.height).toBe(true)
  expect(onEdge(end.x, end.y, bar) && end.y === bar.y + bar.height).toBe(true)
  for (const segment of list) {
    for (const id of nodeIds) expect(crossesInside(segment, nodeBox(id)), id).toBe(false)
    expect(touches(segment, groupLabelArea('bandwidth')), '대역폭 라벨').toBe(false)
  }
}

// 대역폭을 고르면 바깥 막대만 남고(그룹 박스는 흐려지지 않는다) 채운 막대·꼬리표·표시선이 모두 흐려진다.
// 실제로 전송된 양을 고르면 채운 막대가 선명하다. 채운 막대는 바깥 막대 안에 있고, 최대치 곁말은 바깥 막대 끝에 맞춘다.
async function expectPoint() {
  const fill = nodeBox('throughput')
  const bar = groupBox('bandwidth')
  expect(inside(fill, 'bandwidth')).toBe(true)
  expect(fill.x + fill.width).toBeLessThan(bar.x + bar.width)

  const lit: string[][] = []
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    lit.push(Array.from(diagram().querySelectorAll('[data-node], [data-link]'))
      .filter((element) => element.getAttribute('opacity') === '1')
      .map((element) => element.getAttribute('data-node') ?? element.getAttribute('data-link')!))
  }
  expect(lit).toEqual([[], ['throughput']])

  await selectScenario('대역폭')
  expect(diagram().querySelector('[data-group="bandwidth"]')!.closest('[opacity]')).toBeNull()
  const capacity = diagram().querySelector('[data-note="capacity"]')!
  expect(Number(capacity.getAttribute('x'))).toBe(bar.x + bar.width)
  expect(capacity).toHaveAttribute('text-anchor', 'end')
  expect(textBox(capacity).y).toBeGreaterThan(bar.y + bar.height)
}

// 세 도식(전송 속도·처리율·대역폭)은 같은 그림 언어를 쓴다. 바깥 막대·채운 막대·꼬리표·표시선의 id·좌표·라벨이 같다.
function barGeometry() {
  return {
    nodes: Array.from(diagram().querySelectorAll('[data-node]'), (node) => ({ ...readBox(node.querySelector('rect')!), label: node.textContent })),
    groups: Array.from(diagram().querySelectorAll('[data-group]'), (group) => ({ ...readBox(group), label: diagram().querySelector(`[data-group-label="${group.getAttribute('data-group')}"]`)!.textContent })),
    links: Array.from(diagram().querySelectorAll('[data-link]'), (link) => ({ id: link.getAttribute('data-link'), d: link.getAttribute('d') })),
    viewBox: diagram().getAttribute('viewBox'),
  }
}

function expectSameBars() {
  const seen = [ExpectedSpeedDiagram, ThroughputDiagram, BandwidthDiagram].map((Diagram) => {
    const { unmount } = render(<Diagram />)
    const geometry = barGeometry()
    unmount()
    return geometry
  })
  expect(seen[0].nodes.map(({ id }) => id)).toEqual(nodeIds)
  expect(seen[0].groups.map(({ id }) => id)).toEqual(groupIds)
  expect(seen[1]).toEqual(seen[0])
  expect(seen[2]).toEqual(seen[0])
}

describe('BandwidthDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<BandwidthDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 막대·꼬리표·표시선이 모두 선명하고 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<BandwidthDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    expect(shownIds('[data-group]', 'data-group')).toEqual(groupIds)
    expect(shownIds('[data-link]', 'data-link')).toEqual(Object.keys(tallLinks))
    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    for (const group of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(group.closest('[opacity]')).toBeNull()
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 요소와 곁말만 선명하고 바깥 막대는 그대로다', async (scenario) => {
    const { container } = render(<BandwidthDiagram />)
    await expectScenario(scenario, tallNotes, 280, container)
  })

  it('시나리오를 바꾸면 이전 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<BandwidthDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-note]', 'data-note')).toEqual(scenario.notes)
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드와 바깥 막대가 280×136 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<BandwidthDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 136')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 136])
  })

  it('채운 막대는 바깥 막대 안에, 꼬리표는 그 밖에 있고 표시선은 화살표 없는 회색 선이다', () => {
    render(<BandwidthDiagram />)
    expectStructure(tallLinks)
  })

  it('표시선은 꼬리표 아래 변에서 바깥 막대 아래 변까지 내려가고 노드 안과 그룹 라벨을 지나지 않는다', () => {
    render(<BandwidthDiagram />)
    expectLineEnds()
  })

  it('두 시나리오의 선명한 요소가 다르고 채운 막대는 바깥 막대 안에 있다', async () => {
    render(<BandwidthDiagram />)
    await expectPoint()
  })

  it('전송 속도·처리율·대역폭 도식이 같은 막대·꼬리표·표시선을 같은 좌표와 라벨로 그린다', () => {
    expectSameBars()
  })

  it('두 번 렌더해도 도식마다 자기 시나리오를 따로 고르고 화살표 마커가 없다', async () => {
    render(<><BandwidthDiagram /><BandwidthDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })

    await act(async () => { await userEvent.click(within(figures[0]).getByRole('button', { name: '대역폭' })) })

    expect(figures[0].querySelectorAll('[data-note]')).toHaveLength(1)
    expect(figures[1].querySelectorAll('[data-note]')).toHaveLength(0)
    for (const figure of figures) expect(figure.querySelector('marker')).toBeNull()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<BandwidthDiagram />)
    const text = visualsByTopicId[topicId].diagrams['bandwidth-cap']
    const ids = bandwidthScenarios.map(({ id }) => id).sort()
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
    expect(text.svgLabel).toBe(svgName)
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = bandwidthScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 대역폭 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×136 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 두지 않는다', () => {
      render(<BandwidthDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 136')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).toBeNull()
    })

    it('노드·그룹·표시선 id 집합이 세로형과 같다', () => {
      const { change } = mockMatchMedia(false)
      render(<BandwidthDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 136')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroups = shownIds('[data-group]', 'data-group').sort()
      const tallLinkIds = shownIds('[data-link]', 'data-link').sort()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 136')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroups)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinkIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallGroups).toEqual([...groupIds].sort())
      expect(tallLinkIds).toEqual(Object.keys(tallLinks).sort())
    })

    it('모든 rect가 440×136 viewBox 안에 있고 라벨과 그룹 라벨이 자기 상자 안에 들어간다', () => {
      render(<BandwidthDiagram />)
      expectFits([0, 0, 440, 136])
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 요소·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<BandwidthDiagram />)
      await expectScenario(scenario, wideNotes, 440, container)
    })

    it('채운 막대는 바깥 막대 안에, 꼬리표는 그 밖에 있고 표시선은 화살표 없는 회색 선이다', () => {
      render(<BandwidthDiagram />)
      expectStructure(wideLinks)
    })

    it('표시선은 꼬리표 아래 변에서 바깥 막대 아래 변까지 내려가고 노드 안과 그룹 라벨을 지나지 않는다', () => {
      render(<BandwidthDiagram />)
      expectLineEnds()
    })

    it('두 시나리오의 선명한 요소가 다르고 채운 막대는 바깥 막대 안에 있다', async () => {
      render(<BandwidthDiagram />)
      await expectPoint()
    })

    it('전송 속도·처리율·대역폭 도식이 같은 막대·꼬리표·표시선을 같은 좌표와 라벨로 그린다', () => {
      expectSameBars()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<BandwidthDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 136')
      await selectScenario('실제로 전송된 양')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '실제로 전송된 양' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownIds('[data-note]', 'data-note')).toEqual(['actual'])
      expect(diagram().querySelector('[data-note="actual"]')).toHaveAttribute('x', String(wideNotes.actual.x))
      expect(opacityOf('[data-node="throughput"]')).toBe('1')
      expect(opacityOf('[data-node="speed"]')).toBe('0.25')
    })
  })
})
