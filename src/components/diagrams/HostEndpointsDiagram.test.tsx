import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { HostEndpointsDiagram, hostEndpointsScenarios } from './HostEndpointsDiagram'

const topicId = 'network-basics'
const anchorConceptId = `${topicId}.host`
const labels = {
  laptop: '노트북',
  'home-router': '공유기',
  router: '라우터',
  server: '서버',
}
const noteLabels = {
  start: '처음 만들어 보냄',
  end: '마지막에 받아 씀',
  address: '받는 곳: 서버의 주소',
}
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

const nodeIds = Object.keys(labels)
const linkIds = ['laptop-home-router', 'home-router-router', 'router-server']
const hopIds = ['hop-1', 'hop-2', 'hop-3']

const tallPaths: Record<string, string> = {
  'laptop-home-router': 'M80 48 V80',
  'home-router-router': 'M80 112 V144',
  'router-server': 'M80 176 V208',
  'hop-1': 'M80 48 V80',
  'hop-2': 'M80 112 V144',
  'hop-3': 'M80 176 V208',
}
const widePaths: Record<string, string> = {
  'laptop-home-router': 'M72 40 H128',
  'home-router-router': 'M192 40 H248',
  'router-server': 'M312 40 H368',
  'hop-1': 'M72 40 H128',
  'hop-2': 'M192 40 H248',
  'hop-3': 'M312 40 H368',
}
// 링크와 화살표마다 잇는 두 노드. 화살표는 앞이 출발, 뒤가 도착이다.
const ends: Record<string, [string, string]> = {
  'laptop-home-router': ['laptop', 'home-router'],
  'home-router-router': ['home-router', 'router'],
  'router-server': ['router', 'server'],
  'hop-1': ['laptop', 'home-router'],
  'hop-2': ['home-router', 'router'],
  'hop-3': ['router', 'server'],
}

const tallNotes: NotePlaces = {
  start: { x: 140, y: 35, anchor: 'start' },
  end: { x: 140, y: 227, anchor: 'start' },
  address: { x: 92, y: 67, anchor: 'start' },
}
const wideNotes: NotePlaces = {
  start: { x: 40, y: 70, anchor: 'middle' },
  end: { x: 400, y: 70, anchor: 'middle' },
  address: { x: 100, y: 16, anchor: 'middle' },
}

const question = '메시지는 어디서 시작해 어디서 끝날까?'
const idleCaption = '메시지를 처음 보내는 쪽과 마지막에 받는 쪽을 골라 보면, 통신의 양 끝에 있는 노드가 호스트라는 것을 볼 수 있다.'
const legend = '상자는 노드, 상자를 잇는 선은 통신 링크, 화살표는 메시지가 건너가는 방향이다.'
const expectedScenarios = [
  {
    id: 'start', label: '처음 보내는 쪽',
    nodes: ['laptop'],
    paths: [] as string[],
    notes: ['start'],
    caption: '노트북이 웹 페이지를 보내 달라는 메시지를 처음 만들어 보낸다. 이렇게 통신이 출발하는 끝자리의 노드가 호스트다.',
  },
  {
    id: 'end', label: '마지막에 받는 쪽',
    nodes: ['server'],
    paths: [] as string[],
    notes: ['end'],
    caption: '서버는 그 메시지를 마지막에 받아 쓰는 끝자리의 노드라 역시 호스트다. 가운데의 공유기와 라우터는 메시지를 넘겨주기만 하는 중간 노드라 호스트가 아니다.',
  },
  {
    id: 'address', label: '주소로 가리키기',
    nodes: ['laptop', 'home-router', 'router', 'server', 'laptop-home-router', 'home-router-router', 'router-server'],
    paths: ['hop-1', 'hop-2', 'hop-3'],
    notes: ['address'],
    caption: '네트워크에는 호스트가 아주 많아서, 노트북은 받을 호스트인 서버의 주소로 메시지가 갈 위치를 가리킨다. 메시지는 공유기와 라우터를 차례로 거쳐 그 주소의 서버에 닿는다.',
  },
]

function diagram() {
  return screen.getByRole('img', { name: '노트북에서 공유기와 라우터를 거쳐 서버까지 이어진 네트워크' })
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

function lineEnds(element: Element) {
  const list = segments(element.getAttribute('d')!)
  return { start: { x: list[0].x1, y: list[0].y1 }, end: { x: list[list.length - 1].x2, y: list[list.length - 1].y2 } }
}

// 점이 변 위에 놓인 노드.
function nodeAt(point: { x: number, y: number }) {
  return nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))
}

// 곁말이 붙은 노드 — 노드 오른쪽 8~16 자리에서 노드 높이 안에 있거나, 노드 아래 변에서 10~16 아래에서 노드 폭 안에 있다.
function nodeBesideNote(note: Element) {
  const box = textBox(note)
  const middleX = box.x + box.width / 2
  const middleY = box.y + box.height / 2
  return nodeIds.filter((id) => {
    const node = nodeBox(id)
    const right = box.x - (node.x + node.width)
    const below = box.y + box.height - (node.y + node.height)
    return (right >= 8 && right <= 16 && middleY > node.y && middleY < node.y + node.height)
      || (below >= 10 && below <= 16 && middleX > node.x && middleX < node.x + node.width)
  })
}

// 곁말이 곁에 붙은 선분 하나 — 세로 선분이면 그 오른쪽 8~16에서 선분 높이 안, 가로 선분이면 그 위에서 선분 폭 안.
function besideSegment(note: Element, d: string) {
  const box = textBox(note)
  const [line] = segments(d)
  if (line.x1 === line.x2) {
    const middleY = box.y + box.height / 2
    const gap = box.x - line.x1
    return gap >= 8 && gap <= 16 && middleY > Math.min(line.y1, line.y2) && middleY < Math.max(line.y1, line.y2)
  }
  const middleX = box.x + box.width / 2
  return box.y + box.height < line.y1 && middleX > Math.min(line.x1, line.x2) && middleX < Math.max(line.x1, line.x2)
}

// 노드에 닿는 통신 링크의 수. 끝자리 노드는 하나, 가운데 노드는 둘이다.
function linkCount(node: string) {
  return Array.from(diagram().querySelectorAll('[data-link]'))
    .filter((link) => Object.values(lineEnds(link)).some((point) => nodeAt(point) === node)).length
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

  for (const element of diagram().querySelectorAll('[data-node], [data-link]')) {
    const id = element.getAttribute('data-node') ?? element.getAttribute('data-link')!
    expect(element, id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
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

  const lineSegments = Array.from(diagram().querySelectorAll('[data-path], [data-link]')).flatMap((line) => segments(line.getAttribute('d')!))
  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  const shownNotes = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shownNotes.map((note) => note.getAttribute('data-note')).sort()).toEqual([...scenario.notes].sort())
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
    for (const segment of lineSegments) expect(crossesInside(segment, box), `${id} ↔ 선`).toBe(false)
  }
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 노드 라벨이 자기 상자 안에 들어간다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(4)
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

// 통신 링크는 늘 보이고, 화살표 없이 노드 둘을 잇는다. 노드는 모두 회색이고 도식 전용 두 색·초록·빨강·주황은 쓰지 않는다.
function expectLinksAndColors(paths: Record<string, string>) {
  const links = Array.from(diagram().querySelectorAll('[data-link]'))
  expect(links.map((link) => link.getAttribute('data-link'))).toEqual(linkIds)
  for (const link of links) {
    const id = link.getAttribute('data-link')!
    expect(link).toHaveAttribute('d', paths[id])
    expect(link).toHaveClass('stroke-muted')
    expect(link).not.toHaveAttribute('marker-end')
  }
  for (const id of nodeIds) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 링크와 화살표의 양 끝은 두 노드의 변에 닿고, 어떤 선분도 노드 안을 지나지 않는다.
async function expectLineEnds() {
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
    for (const line of diagram().querySelectorAll('[data-path], [data-link]')) {
      const id = line.getAttribute('data-path') ?? line.getAttribute('data-link')!
      for (const segment of segments(line.getAttribute('d')!)) {
        for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
      }
      const { start, end } = lineEnds(line)
      expect(nodeAt(start), `${id} 시작`).toBe(ends[id][0])
      expect(nodeAt(end), `${id} 끝`).toBe(ends[id][1])
    }
  }
}

// 처음 보내는 쪽·마지막에 받는 쪽: 곁말이 링크 하나에만 닿는 끝자리 노드에 붙고, 가운데 두 노드는 호스트가 아니라 흐리다.
// 주소로 가리키기: 화살표가 노트북에서 시작해 가운데 노드를 차례로 거쳐 서버에서 끝나고, 주소 곁말은 첫 화살표 곁에 붙는다.
async function expectEndpoints() {
  for (const [label, noteId, host] of [['처음 보내는 쪽', 'start', 'laptop'], ['마지막에 받는 쪽', 'end', 'server']] as const) {
    await selectScenario(label)
    expect(nodeBesideNote(diagram().querySelector(`[data-note="${noteId}"]`)!), label).toEqual([host])
    expect(linkCount(host), host).toBe(1)
    for (const middle of ['home-router', 'router']) {
      expect(diagram().querySelector(`[data-node="${middle}"]`), `${label} ${middle}`).toHaveAttribute('opacity', '0.25')
      expect(linkCount(middle), middle).toBe(2)
    }
  }

  await selectScenario('주소로 가리키기')
  const hops = Array.from(diagram().querySelectorAll('[data-path]'))
  const stops = hops.map((hop) => [nodeAt(lineEnds(hop).start), nodeAt(lineEnds(hop).end)])
  expect(stops).toEqual([['laptop', 'home-router'], ['home-router', 'router'], ['router', 'server']])
  expect(besideSegment(diagram().querySelector('[data-note="address"]')!, hops[0].getAttribute('d')!)).toBe(true)
}

async function expectUniqueMarkers() {
  render(<><HostEndpointsDiagram /><HostEndpointsDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: '메시지가 시작하고 끝나는 호스트 도식' })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '주소로 가리키기' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(3)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('HostEndpointsDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<HostEndpointsDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 넷과 통신 링크 셋이 모두 선명하고 화살표·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<HostEndpointsDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·링크·화살표·곁말만 선명하고 나머지는 흐려진다', async (scenario) => {
    const { container } = render(<HostEndpointsDiagram />)
    await expectScenario(scenario, tallNotes, tallPaths, 280, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<HostEndpointsDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
      expect(shownIds('[data-note]', 'data-note')).toEqual(scenario.notes)
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드 넷이 280×256 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<HostEndpointsDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 256')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 256])
  })

  it('통신 링크는 늘 화살표 없이 보이고 노드는 모두 회색이다', () => {
    render(<HostEndpointsDiagram />)
    expectLinksAndColors(tallPaths)
  })

  it('링크와 화살표의 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<HostEndpointsDiagram />)
    await expectLineEnds()
  })

  it('처음과 마지막의 곁말은 끝자리 노드에 붙고 가운데 노드는 흐리며, 주소로 가리킨 메시지는 노트북에서 서버까지 간다', async () => {
    render(<HostEndpointsDiagram />)
    await expectEndpoints()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<HostEndpointsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['host-endpoints']
    const ids = hostEndpointsScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toBeUndefined()
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([anchorConceptId, `${topicId}.computer-network`])
    expect(text.label).toBe('메시지가 시작하고 끝나는 호스트 도식')
    expect(text.svgLabel).toBe('노트북에서 공유기와 라우터를 거쳐 서버까지 이어진 네트워크')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = hostEndpointsScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 호스트 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: '메시지가 시작하고 끝나는 호스트 도식' })

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

    async function collectLineIds() {
      const found = new Set(shownIds('[data-link]', 'data-link'))
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

    it('440×80 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<HostEndpointsDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 80')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드 id 집합과 링크·화살표 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<HostEndpointsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 256')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallLines = await collectLineIds()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 80')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallLines).toEqual(Object.keys(tallPaths).sort())
      expect(await collectLineIds()).toEqual(tallLines)
    })

    it('모든 rect가 440×80 viewBox 안에 있고 노드 라벨이 자기 상자 안에 들어간다', () => {
      render(<HostEndpointsDiagram />)
      expectFits([0, 0, 440, 80])
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·링크·화살표·곁말·캡션을 보이고 곁말은 노드·선과 겹치지 않는다', async (scenario) => {
      const { container } = render(<HostEndpointsDiagram />)
      await expectScenario(scenario, wideNotes, widePaths, 440, container)
    })

    it('통신 링크는 늘 화살표 없이 보이고 노드는 모두 회색이다', () => {
      render(<HostEndpointsDiagram />)
      expectLinksAndColors(widePaths)
    })

    it('링크와 화살표의 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<HostEndpointsDiagram />)
      await expectLineEnds()
    })

    it('처음과 마지막의 곁말은 끝자리 노드에 붙고 가운데 노드는 흐리며, 주소로 가리킨 메시지는 노트북에서 서버까지 간다', async () => {
      render(<HostEndpointsDiagram />)
      await expectEndpoints()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<HostEndpointsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 256')
      await selectScenario('주소로 가리키기')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '주소로 가리키기' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(hopIds)
      for (const path of paths) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(diagram().querySelector('[data-note="address"]')).toHaveAttribute('y', String(wideNotes.address.y))
    })
  })
})
