import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ServiceLifecycleDiagram, serviceLifecycleScenarios } from './ServiceLifecycleDiagram'

const topicId = 'azure-sla-lifecycle'
const anchorConceptId = `${topicId}.general-availability`
const previewConceptId = `${topicId}.preview`
const labels = {
  'private-preview': '비공개 미리 보기',
  'public-preview': '공개 미리 보기',
  'ga': '일반 공급(GA)',
}
// 단계의 차례. 세로형은 위에서 아래로, 가로형은 왼쪽에서 오른쪽으로 이 차례로 놓인다.
const stageOrder = ['private-preview', 'public-preview', 'ga'] as const
const noteLabels = {
  'private-who': '초대받은 일부 고객',
  'private-sla': '보통 SLA 없음',
  'public-who': '구독이 있는 모든 고객',
  'public-sla': '보통 SLA 없음',
  'ga-who': '모든 고객',
  'ga-sla': 'SLA 보장',
}
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

// 연결선은 늘 그려진다. 앞 단계의 변에서 나가 다음 단계의 변에서 화살표로 끝난다.
const linkEnds = {
  'private-to-public': ['private-preview', 'public-preview'],
  'public-to-ga': ['public-preview', 'ga'],
} as const
type LinkId = keyof typeof linkEnds
const tallLinks: Record<LinkId, string> = {
  'private-to-public': 'M72 40 V72',
  'public-to-ga': 'M72 104 V136',
}
const wideLinks: Record<LinkId, string> = {
  'private-to-public': 'M128 24 H164',
  'public-to-ga': 'M276 24 H312',
}

const tallNotes: NotePlaces = {
  'private-who': { x: 140, y: 21, anchor: 'start' },
  'private-sla': { x: 140, y: 35, anchor: 'start' },
  'public-who': { x: 140, y: 85, anchor: 'start' },
  'public-sla': { x: 140, y: 99, anchor: 'start' },
  'ga-who': { x: 140, y: 149, anchor: 'start' },
  'ga-sla': { x: 140, y: 163, anchor: 'start' },
}
const wideNotes: NotePlaces = {
  'private-who': { x: 72, y: 54, anchor: 'middle' },
  'private-sla': { x: 72, y: 68, anchor: 'middle' },
  'public-who': { x: 220, y: 54, anchor: 'middle' },
  'public-sla': { x: 220, y: 68, anchor: 'middle' },
  'ga-who': { x: 368, y: 54, anchor: 'middle' },
  'ga-sla': { x: 368, y: 68, anchor: 'middle' },
}

const allNodes = Object.keys(labels)
const question = '새 Azure 기능은 어떤 단계를 거쳐 운영에 쓸 수 있게 될까?'
const idleCaption = '새 기능이 비공개 미리 보기와 공개 미리 보기를 거쳐 일반 공급(GA)에 이르는 차례를 화살표로 이은 모습이다. 버튼으로 단계를 고르면 그 단계에서 누가 쓸 수 있고 SLA가 있는지 볼 수 있다.'
const legend = '화살표는 단계가 넘어가는 차례다. 고른 단계에 붙은 글은 그 단계에서 누가 쓸 수 있는지와 SLA가 있는지를 말한다. 흐린 상자는 고르지 않은 단계다.'
const figureName = '새 Azure 기능이 비공개 미리 보기와 공개 미리 보기를 거쳐 일반 공급에 이르는 차례를 보이는 도식'
const svgName = '비공개 미리 보기에서 공개 미리 보기로, 공개 미리 보기에서 일반 공급(GA)으로 화살표가 이어진 모습'
const expectedScenarios = [
  {
    id: 'private', label: '비공개 미리 보기',
    nodes: ['private-preview'],
    notes: ['private-who', 'private-sla'],
    caption: '비공개 미리 보기는 Microsoft가 초대한 일부 고객만 쓴다. 회사 안에서 시험·평가하고 의견을 주는 데에만 쓰고, 보통 SLA가 없으며 운영 환경에는 쓸 수 없다.',
    sources: [previewConceptId],
  },
  {
    id: 'public', label: '공개 미리 보기',
    nodes: ['public-preview'],
    notes: ['public-who', 'public-sla'],
    caption: '공개 미리 보기는 Azure 구독이 있는 모든 고객이 초대 없이 써 볼 수 있다. 그래도 보통 SLA가 없고, Microsoft는 따로 밝힌 경우가 아니면 운영 환경에 쓰기를 권하지 않는다.',
    sources: [previewConceptId],
  },
  {
    id: 'ga', label: '일반 공급(GA)',
    nodes: ['ga'],
    notes: ['ga-who', 'ga-sla'],
    caption: '일반 공급은 기능을 정식으로 내놓은 단계다. 모든 고객이 쓸 수 있고 SLA와 운영 지원 약속이 보장되어, Microsoft가 운영 환경에 쓰기를 권한다.',
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

// 선분이 상자에 닿는가. 변에 닿는 것도 센다.
function touches(segment: ReturnType<typeof segments>[number], box: SvgBox) {
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

function link(id: LinkId) {
  return diagram().querySelector(`[data-link="${id}"]`)!
}

// 연결선 둘은 늘 그려지고, 모양은 배치의 것이며, 화살표로 끝나고, 흐려지지 않는다.
function expectLinks(d: Record<LinkId, string>) {
  expect(shownIds('[data-link]', 'data-link').sort()).toEqual(Object.keys(linkEnds).sort())
  for (const id of Object.keys(linkEnds) as LinkId[]) {
    expect(link(id), id).toHaveAttribute('d', d[id])
    expect(link(id), id).toHaveClass('fill-none', 'stroke-title')
    expect(link(id).getAttribute('marker-end'), id).toMatch(/^url\(#.+\)$/u)
    expect(link(id), id).not.toHaveAttribute('opacity')
  }
  expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
}

// 연결선은 앞 단계의 변에서 시작해 다음 단계의 변에서 끝나고, 어떤 노드 상자 안도 지나지 않는다.
function expectLinksJoinNodes() {
  for (const [id, [from, to]] of Object.entries(linkEnds) as [LinkId, readonly [string, string]][]) {
    const list = segments(link(id).getAttribute('d')!)
    expect(onEdge(list[0].x1, list[0].y1, nodeBox(from)), `${id} 시작은 ${from}의 변`).toBe(true)
    expect(onEdge(list[list.length - 1].x2, list[list.length - 1].y2, nodeBox(to)), `${id} 끝은 ${to}의 변`).toBe(true)
    for (const segment of list) {
      for (const node of allNodes) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
    }
  }
}

// 아래 단언들은 배치에 묶이지 않는다. 세로형과 가로형이 같은 기대값으로 통과해야 한다.
async function expectScenario(
  scenario: typeof expectedScenarios[number],
  places: NotePlaces,
  d: Record<LinkId, string>,
  width: number,
  container: HTMLElement,
) {
  await selectScenario(scenario.label)

  for (const node of diagram().querySelectorAll('[data-node]')) {
    expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
  }
  expectLinks(d)

  const linkSegments = (Object.keys(linkEnds) as LinkId[]).flatMap((id) => segments(link(id).getAttribute('d')!))
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
    // 반각 글자는 화면에서 더 넓다 — 1.15배로 잡아도 viewBox 안이어야 한다.
    const wideLeft = places[id].anchor === 'middle' ? places[id].x - (box.width * 1.15) / 2 : box.x
    expect(wideLeft, id).toBeGreaterThanOrEqual(0)
    expect(wideLeft + box.width * 1.15, id).toBeLessThanOrEqual(width)
    for (const node of nodeBoxes) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const segment of linkSegments) expect(touches(segment, box), `${id} ↔ 연결선`).toBe(false)
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

// 모든 rect가 viewBox 안에 있고, 노드 라벨은 1.15배로 잡아도 상자 안에 들어간다. 그룹 박스는 없다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(3)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
  expect(diagram().querySelectorAll('[data-group], [data-group-label]')).toHaveLength(0)

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(label, 10) * 1.15 + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
  }
  for (const id of allNodes) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 요점: 단계마다 그 단계 하나만 선명하다. 두 미리 보기에서만 SLA가 없다는 곁말이 보이고, 일반 공급에서는 SLA가 보장된다는 곁말이 보인다.
async function expectPoint() {
  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    const bright = shownIds('[data-node]', 'data-node').filter((id) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
    expect(bright).toEqual([stageOrder[expectedScenarios.indexOf(scenario)]])
    const texts = Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.textContent)
    if (scenario.id === 'ga') {
      expect(texts).toContain('SLA 보장')
      expect(texts.some((text) => text!.includes('없음'))).toBe(false)
    } else {
      expect(texts).toContain('보통 SLA 없음')
      expect(texts).not.toContain('SLA 보장')
    }
  }
}

// 노드가 단계 차례대로 놓이고, 연결선이 그 차례로 이어진다(첫 선의 끝 노드가 둘째 선의 시작 노드다).
function expectOrder(axis: 'x' | 'y') {
  const positions = stageOrder.map((id) => nodeBox(id)[axis])
  expect(positions[0]).toBeLessThan(positions[1])
  expect(positions[1]).toBeLessThan(positions[2])
  expect(linkEnds['private-to-public'][1]).toBe(linkEnds['public-to-ga'][0])
  expect(linkEnds['private-to-public'][0]).toBe(stageOrder[0])
  expect(linkEnds['public-to-ga'][1]).toBe(stageOrder[2])
  const first = segments(link('private-to-public').getAttribute('d')!)
  const second = segments(link('public-to-ga').getAttribute('d')!)
  expect(onEdge(first[first.length - 1].x2, first[first.length - 1].y2, nodeBox('public-preview'))).toBe(true)
  expect(onEdge(second[0].x1, second[0].y1, nodeBox('public-preview'))).toBe(true)
}

describe('ServiceLifecycleDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<ServiceLifecycleDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 셋이 모두 선명하고 연결선 둘이 보이며 곁말은 없다', () => {
    const { container } = render(<ServiceLifecycleDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual([...allNodes].sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expectLinks(tallLinks)
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('연결선은 앞 단계의 변에서 다음 단계의 변까지 가고 노드 안을 지나지 않는다', () => {
    render(<ServiceLifecycleDiagram />)
    expectLinksJoinNodes()
  })

  it('세로형은 단계를 위에서 아래로 차례대로 놓고 연결선이 그 차례로 이어진다', () => {
    render(<ServiceLifecycleDiagram />)
    expectOrder('y')
  })

  it.each(expectedScenarios)('$label: 그 단계 노드와 곁말만 보이고 나머지 노드는 흐려지며 연결선은 남는다', async (scenario) => {
    const { container } = render(<ServiceLifecycleDiagram />)
    await expectScenario(scenario, tallNotes, tallLinks, 280, container)
  })

  it('시나리오를 바꾸면 이전 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<ServiceLifecycleDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
      expect(diagram().querySelectorAll('[data-link]')).toHaveLength(2)
    }
    await selectScenario('전체')

    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
    for (const { label } of expectedScenarios) expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'false')
  })

  it('노드 셋이 280×176 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<ServiceLifecycleDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 176')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 176])
  })

  it('단계마다 그 단계 하나만 선명하고, 두 미리 보기에서만 SLA가 없다는 곁말이 보인다', async () => {
    render(<ServiceLifecycleDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', () => {
    render(<><ServiceLifecycleDiagram /><ServiceLifecycleDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    const markerIds = figures.map((figure) => figure.querySelector('marker')!.id)

    expect(figures).toHaveLength(2)
    expect(new Set(markerIds).size).toBe(2)
    for (const [index, figure] of figures.entries()) {
      expect(figure.querySelectorAll('marker')).toHaveLength(1)
      for (const line of figure.querySelectorAll('[data-link]')) expect(line).toHaveAttribute('marker-end', `url(#${markerIds[index]})`)
    }
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<ServiceLifecycleDiagram />)
    const text = visualsByTopicId[topicId].diagrams['service-lifecycle']
    const ids = serviceLifecycleScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toBeUndefined()
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([previewConceptId, anchorConceptId])
    expect(text.label).toBe(figureName)
    expect(text.svgLabel).toBe(svgName)
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = serviceLifecycleScenarios.find(({ id }) => id === expected.id)!
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

  it('곁말과 단계 이름의 사실은 앵커 개념 본문에 있다', () => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join(' ')

    for (const value of ['비공개 미리 보기', '공개 미리 보기', '일반 공급', '초대받은 일부 고객', '구독이 있는 모든 고객', '모든 고객', '보통 SLA가 없다', 'SLA가 보장된다']) {
      expect(body, value).toContain(value)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 일반 공급 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    function ids(selector: string, attribute: string) {
      return shownIds(selector, attribute).sort()
    }

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×80 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<ServiceLifecycleDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 80')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expectLinks(wideLinks)
    })

    it('노드·연결선 id 집합이 세로형과 같다', () => {
      const { change } = mockMatchMedia(false)
      render(<ServiceLifecycleDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 176')
      const tallNodes = ids('[data-node]', 'data-node')
      const tallLinkIds = ids('[data-link]', 'data-link')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 80')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(tallNodes).toEqual([...allNodes].sort())
      expect(ids('[data-link]', 'data-link')).toEqual(tallLinkIds)
      expect(diagram().querySelectorAll('[data-group]')).toHaveLength(0)
    })

    it('모든 rect가 440×80 viewBox 안에 있고 노드 라벨이 자기 상자 안에 들어간다', () => {
      render(<ServiceLifecycleDiagram />)
      expectFits([0, 0, 440, 80])
    })

    it('연결선은 앞 단계의 변에서 다음 단계의 변까지 가고 노드 안을 지나지 않는다', () => {
      render(<ServiceLifecycleDiagram />)
      expectLinksJoinNodes()
    })

    it('가로형은 단계를 왼쪽에서 오른쪽으로 차례대로 놓고 연결선이 그 차례로 이어진다', () => {
      render(<ServiceLifecycleDiagram />)
      expectOrder('x')
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·곁말·캡션을 보이고 곁말은 노드·연결선과 겹치지 않는다', async (scenario) => {
      const { container } = render(<ServiceLifecycleDiagram />)
      await expectScenario(scenario, wideNotes, wideLinks, 440, container)
    })

    it('단계마다 그 단계 하나만 선명하고, 두 미리 보기에서만 SLA가 없다는 곁말이 보인다', async () => {
      render(<ServiceLifecycleDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<ServiceLifecycleDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 176')
      await selectScenario('공개 미리 보기')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '공개 미리 보기' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expectLinks(wideLinks)
      for (const note of diagram().querySelectorAll('[data-note]')) {
        expect(note).toHaveAttribute('x', String(wideNotes[note.getAttribute('data-note')! as NoteId].x))
      }
    })
  })
})
