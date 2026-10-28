import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { PacketLossDiagram, packetLossScenarios } from './PacketLossDiagram'

const topicId = 'network-basics'
const anchorConceptId = `${topicId}.packet-loss`
const cellNumbers = ['1', '2', '3', '4', '5', '6', '7']
const sentIds = cellNumbers.map((number) => `sent-${number}`)
const backIds = cellNumbers.map((number) => `back-${number}`)
const labels: Record<string, string> = {
  sender: '보내는 호스트',
  receiver: '상대 호스트',
  ...Object.fromEntries(sentIds.map((id, index) => [id, cellNumbers[index]])),
  ...Object.fromEntries(backIds.map((id, index) => [id, cellNumbers[index]])),
}
const groupLabels = { sent: '보낸 메시지', back: '돌아온 응답' }
const noteLabels = { 'loss-zero': '손실 0%', 'loss-full': '손실 100%' }
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)

const tallPaths: Record<string, string> = {
  request: 'M104 28 H176',
  reply: 'M176 36 H104',
}
const widePaths: Record<string, string> = {
  request: 'M128 28 H312',
  reply: 'M312 36 H128',
}
// 화살표마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  request: ['sender', 'receiver'],
  reply: ['receiver', 'sender'],
}

const tallNotes: NotePlaces = {
  'loss-zero': { x: 266, y: 158, anchor: 'end' },
  'loss-full': { x: 266, y: 158, anchor: 'end' },
}
const wideNotes: NotePlaces = {
  'loss-zero': { x: 426, y: 78, anchor: 'end' },
  'loss-full': { x: 426, y: 78, anchor: 'end' },
}

const question = '보낸 메시지 가운데 몇 개에 응답이 돌아왔을까?'
const idleCaption = 'ping은 상대 호스트에게 응답을 요청하는 메시지를 보내고, 응답이 돌아오는지 보는 명령이다. 결과를 고르면 보낸 메시지와 돌아온 응답의 수를 견줘, 잃은 수를 보낸 수에 견준 백분율인 패킷 손실을 볼 수 있다.'
const legend = '칸 하나가 메시지나 응답 하나다. 「보낸 메시지」 박스와 「돌아온 응답」 박스의 칸 수를 견주고, 화살표는 메시지와 응답이 가는 방향이다.'
const expectedScenarios = [
  {
    id: 'all-back', label: '7개 보내 7개 돌아옴',
    nodes: ['sender', 'receiver', ...sentIds, ...backIds],
    paths: ['request', 'reply'],
    notes: ['loss-zero'],
    sent: 7, back: 7,
    caption: '보내는 호스트가 메시지 7개를 보냈고, 응답 7개가 모두 돌아왔다. 잃은 것이 하나도 없으므로 패킷 손실은 0%다.',
    sources: [anchorConceptId],
  },
  {
    id: 'none-back', label: '3개 보내 0개 돌아옴',
    nodes: ['sender', 'receiver', 'sent-1', 'sent-2', 'sent-3'],
    paths: ['request'],
    notes: ['loss-full'],
    sent: 3, back: 0,
    caption: '메시지 3개를 보냈는데 응답이 하나도 돌아오지 않았다. 보낸 3개를 모두 잃은 셈이라 패킷 손실은 100%다.',
    sources: [anchorConceptId],
  },
]

function diagram() {
  return screen.getByRole('img', { name: '보내는 호스트가 상대 호스트에게 메시지를 보내고, 보낸 메시지와 돌아온 응답을 칸으로 센 ping 결과' })
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

function lineEnds(element: Element) {
  const list = segments(element.getAttribute('d')!)
  return { start: { x: list[0].x1, y: list[0].y1 }, end: { x: list[list.length - 1].x2, y: list[list.length - 1].y2 } }
}

// 점이 변 위에 놓인 노드.
function nodeAt(point: { x: number, y: number }) {
  return nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))
}

// 선명한 칸 수.
function litCount(ids: string[]) {
  return ids.filter((id) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1').length
}

// 아래 단언들은 배치에 묶이지 않는다. 세로형과 가로형이 같은 기대값으로 통과해야 한다.
async function expectScenario(
  scenario: typeof expectedScenarios[number],
  paths: Record<string, string>,
  places: NotePlaces,
  width: number,
  container: HTMLElement,
) {
  await selectScenario(scenario.label)

  for (const node of diagram().querySelectorAll('[data-node]')) {
    expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
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

  const lineSegments = shownPaths.flatMap((line) => segments(line.getAttribute('d')!))
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
    for (const segment of lineSegments) expect(crossesInside(segment, box), `${id} ↔ 선`).toBe(false)
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
    expect(box.x + 10 + estimateTextWidth(wording, 9), wording).toBeLessThanOrEqual(viewBox[2])
    for (const node of nodeIds) expect(overlaps(groupLabelArea(id), nodeBox(node)), `${wording} ↔ ${node}`).toBe(false)
  }
}

// 보낸 칸은 「보낸 메시지」 박스에, 돌아온 칸은 「돌아온 응답」 박스에만 있고 두 호스트는 어느 박스에도 걸치지 않는다.
// 칸은 번호 순서대로 한 줄로 놓인다. 노드는 모두 회색이고 도식 전용 두 색·초록·빨강·주황은 쓰지 않는다.
function expectMembership() {
  for (const id of sentIds) expect(groupIds.filter((group) => inside(nodeBox(id), group)), id).toEqual(['sent'])
  for (const id of backIds) expect(groupIds.filter((group) => inside(nodeBox(id), group)), id).toEqual(['back'])
  for (const id of ['sender', 'receiver']) expect(groupIds.filter((group) => overlaps(nodeBox(id), groupBox(group))), id).toEqual([])
  for (const row of [sentIds, backIds]) {
    const boxes = row.map(nodeBox)
    expect(new Set(boxes.map(({ y }) => y)).size).toBe(1)
    for (let i = 1; i < boxes.length; i += 1) expect(boxes[i].x, row[i]).toBeGreaterThan(boxes[i - 1].x + boxes[i - 1].width)
  }
  for (const id of nodeIds) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 화살표 양 끝은 두 호스트의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨 영역을 지나지 않는다.
async function expectPathEnds() {
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
    for (const path of diagram().querySelectorAll('[data-path]')) {
      const id = path.getAttribute('data-path')!
      for (const segment of segments(path.getAttribute('d')!)) {
        for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelArea(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
      const { start, end } = lineEnds(path)
      expect(nodeAt(start), `${id} 시작`).toBe(ends[id][0])
      expect(nodeAt(end), `${id} 끝`).toBe(ends[id][1])
    }
  }
}

// 결과마다 선명한 보낸 칸·돌아온 칸의 수가 본문의 ping 예와 같고, 곁말의 백분율이 (보낸 − 돌아온) ÷ 보낸과 맞는다.
// 응답이 하나도 돌아오지 않으면 돌아오는 화살표도 없다.
async function expectCounts() {
  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    expect(litCount(sentIds), scenario.label).toBe(scenario.sent)
    expect(litCount(backIds), scenario.label).toBe(scenario.back)
    const note = diagram().querySelector('[data-note]')!
    const percent = Number(note.textContent!.match(/^손실 (\d+)%$/u)![1])
    expect(percent, scenario.label).toBe(((scenario.sent - scenario.back) / scenario.sent) * 100)
    expect(inside(textBox(note), 'back'), scenario.label).toBe(true)
    expect(shownIds('[data-path]', 'data-path').includes('reply'), scenario.label).toBe(scenario.back > 0)
  }
}

async function expectUniqueMarkers() {
  render(<><PacketLossDiagram /><PacketLossDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: 'ping 결과로 패킷 손실을 읽는 도식' })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '7개 보내 7개 돌아옴' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(2)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('PacketLossDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<PacketLossDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 호스트 둘과 칸 열넷이 모두 선명하고 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<PacketLossDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    expect(shownIds('[data-group]', 'data-group')).toEqual(groupIds)
    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    for (const group of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(group.closest('[opacity]')).toBeNull()
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 호스트·칸·화살표·곁말만 선명하고 두 박스는 그대로다', async (scenario) => {
    const { container } = render(<PacketLossDiagram />)
    await expectScenario(scenario, tallPaths, tallNotes, 280, container)
  })

  it('시나리오를 바꾸면 이전 화살표가 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<PacketLossDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
    }
    await selectScenario('전체')

    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드와 두 박스가 280×216 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<PacketLossDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 216')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 216])
  })

  it('보낸 칸과 돌아온 칸이 각자의 박스에 한 줄로 있고 호스트는 박스 밖에 있으며 노드는 모두 회색이다', () => {
    render(<PacketLossDiagram />)
    expectMembership()
  })

  it('화살표 양 끝은 두 호스트의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
    render(<PacketLossDiagram />)
    await expectPathEnds()
  })

  it('선명한 칸 수가 본문의 ping 예와 같고 곁말의 백분율이 잃은 수를 보낸 수에 견준 값이다', async () => {
    render(<PacketLossDiagram />)
    await expectCounts()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<PacketLossDiagram />)
    const text = visualsByTopicId[topicId].diagrams['ping-loss']
    const ids = packetLossScenarios.map(({ id }) => id).sort()
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
    expect(text.label).toBe('ping 결과로 패킷 손실을 읽는 도식')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = packetLossScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 패킷 손실 개념 본문 바로 뒤에 도식을, 그 뒤에 성능 지표 비교표를 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: 'ping 결과로 패킷 손실을 읽는 도식' })
    const table = screen.getByRole('figure', { name: '네트워크 성능을 나타내는 지표' })

    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(figure.nextElementSibling).toBe(table)
    expect(figure.closest('article')!.lastElementChild).toBe(table)
    expect(screen.getAllByRole('figure')).toEqual([figure, table])
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
      return [...found].sort()
    }

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×136 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<PacketLossDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 136')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<PacketLossDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 216')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroups = shownIds('[data-group]', 'data-group').sort()
      const tallPathIds = await collectPathIds()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 136')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroups)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallGroups).toEqual([...groupIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallPaths).sort())
      expect(await collectPathIds()).toEqual(tallPathIds)
    })

    it('모든 rect가 440×136 viewBox 안에 있고 라벨과 그룹 라벨이 자기 상자 안에 들어간다', () => {
      render(<PacketLossDiagram />)
      expectFits([0, 0, 440, 136])
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 호스트·칸·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<PacketLossDiagram />)
      await expectScenario(scenario, widePaths, wideNotes, 440, container)
    })

    it('보낸 칸과 돌아온 칸이 각자의 박스에 한 줄로 있고 호스트는 박스 밖에 있으며 노드는 모두 회색이다', () => {
      render(<PacketLossDiagram />)
      expectMembership()
    })

    it('화살표 양 끝은 두 호스트의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
      render(<PacketLossDiagram />)
      await expectPathEnds()
    })

    it('선명한 칸 수가 본문의 ping 예와 같고 곁말의 백분율이 잃은 수를 보낸 수에 견준 값이다', async () => {
      render(<PacketLossDiagram />)
      await expectCounts()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<PacketLossDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 216')
      await selectScenario('3개 보내 0개 돌아옴')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '3개 보내 0개 돌아옴' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['request'])
      for (const path of paths) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(litCount(sentIds)).toBe(3)
      expect(litCount(backIds)).toBe(0)
    })
  })
})
