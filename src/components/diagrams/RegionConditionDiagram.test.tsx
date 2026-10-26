import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { RegionConditionDiagram, regionConditionScenarios } from './RegionConditionDiagram'

const topicId = 'iam-permissions'
const anchorConceptId = `${topicId}.iam-requested-region-condition`
const labels = {
  user: '사용자',
  policy: '정책 평가',
  'region-a': '리전 A · 승인됨',
  'region-b': '리전 B · 승인 안 됨',
  notify: '일어난 뒤 알림',
}
const noteLabels = {
  origin: '출발지를 본다',
  destination: '목적지를 본다',
  'a-allowed': '허용',
  'b-denied': '요청 시점에 거부',
  'b-reached': '막지 못함',
  happened: '이미 일어남',
}
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

const tallPaths: Record<string, string> = {
  'user-policy': 'M140 40 V80',
  'policy-a': 'M110 112 V144 H70 V176',
  'policy-b': 'M170 112 V144 H210 V176',
  'b-notify': 'M210 208 V248',
}
const widePaths: Record<string, string> = {
  'user-policy': 'M96 72 H136',
  'policy-a': 'M240 64 H256 V24 H284',
  'policy-b': 'M240 80 H256 V120 H284',
  'b-notify': 'M300 136 V168',
}
// 경로마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'user-policy': ['user', 'policy'],
  'policy-a': ['policy', 'region-a'],
  'policy-b': ['policy', 'region-b'],
  'b-notify': ['region-b', 'notify'],
}

const tallNotes: NotePlaces = {
  origin: { x: 206, y: 28, anchor: 'start' },
  destination: { x: 206, y: 100, anchor: 'start' },
  'a-allowed': { x: 70, y: 224, anchor: 'middle' },
  'b-denied': { x: 210, y: 224, anchor: 'middle' },
  'b-reached': { x: 210, y: 224, anchor: 'middle' },
  happened: { x: 144, y: 268, anchor: 'end' },
}
const wideNotes: NotePlaces = {
  origin: { x: 52, y: 108, anchor: 'middle' },
  destination: { x: 188, y: 108, anchor: 'middle' },
  'a-allowed': { x: 344, y: 56, anchor: 'middle' },
  'b-denied': { x: 352, y: 152, anchor: 'middle' },
  'b-reached': { x: 352, y: 152, anchor: 'middle' },
  happened: { x: 276, y: 188, anchor: 'end' },
}

const allNodes = Object.keys(labels)
const question = '승인된 리전 밖으로 가는 요청은 무엇이 막을까?'
const idleCaption = '구성을 고르면 조건이 요청의 어느 쪽을 보고, 승인되지 않은 리전으로 가는 요청이 어떻게 되는지 볼 수 있다.'
const legend = '파랑: 정책 평가와 리전, 알림 구성 · 회색: 요청을 보내는 사용자. 리전 A·B는 구별하는 이름이다.'
const expectedScenarios = [
  {
    id: 'requested-region', label: 'aws:RequestedRegion',
    nodes: ['user', 'policy', 'region-a', 'region-b'],
    paths: ['user-policy', 'policy-a'],
    notes: ['destination', 'a-allowed', 'b-denied'],
    caption: 'aws:RequestedRegion은 요청이 향한 리전을 본다. 목록 밖 리전이면 요청 시점에 막힌다.',
  },
  {
    id: 'source-ip', label: 'aws:SourceIp',
    nodes: ['user', 'policy', 'region-a', 'region-b'],
    paths: ['user-policy', 'policy-a', 'policy-b'],
    notes: ['origin', 'b-reached'],
    caption: 'aws:SourceIp는 요청이 출발한 곳을 본다. 목적지 리전은 전혀 제한하지 못한다.',
  },
  {
    id: 'after-fact', label: '일어난 뒤 알림',
    nodes: ['user', 'policy', 'region-b', 'notify'],
    paths: ['user-policy', 'policy-b', 'b-notify'],
    notes: ['happened'],
    caption: '규정에 어긋난 동작을 일어난 뒤에 알리는 구성은 실수로 일어나는 것 자체를 막지 못한다.',
  },
]

function diagram() {
  return screen.getByRole('img', { name: 'aws:RequestedRegion·aws:SourceIp·사후 알림' })
}

async function selectScenario(label: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) })
}

function scenarioNamed(id: string) {
  return expectedScenarios.find((scenario) => scenario.id === id)!
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

function pathEnds(id: string) {
  const list = segments(diagram().querySelector(`[data-path="${id}"]`)!.getAttribute('d')!)
  const first = list[0]
  const last = list[list.length - 1]
  return { start: { x: first.x1, y: first.y1 }, end: { x: last.x2, y: last.y2 } }
}

// 지금 보이는 경로 가운데 끝이 그 노드 상자의 변에 닿는 것.
function pathsEndingOn(nodeId: string) {
  const box = nodeBox(nodeId)
  return shownIds('[data-path]', 'data-path').filter((id) => {
    const { end } = pathEnds(id)
    return onEdge(end.x, end.y, box)
  })
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

// 모든 rect가 viewBox 안에 있고 라벨이 상자 안에 들어간다. 그룹 박스는 없다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(5)
  expect(diagram().querySelectorAll('[data-group], [data-group-label]')).toHaveLength(0)
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

// 사용자만 회색이고 정책 평가·리전·알림은 파랑이다. 청록·초록·빨강은 쓰지 않는다.
function expectColors() {
  for (const id of allNodes) {
    expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass(id === 'user' ? 'stroke-disabled' : 'stroke-diagram-managed')
  }
  expect(diagram().querySelector('.stroke-diagram-resource')).toBeNull()
  expect(diagram().querySelector('[class*="green"], [class*="red"]')).toBeNull()
}

// aws:RequestedRegion이면 승인 안 된 리전에 닿는 경로가 없이 거부가 보이고, aws:SourceIp면 그 리전까지 경로가 닿는다.
async function expectRegionBReach() {
  await selectScenario('aws:RequestedRegion')
  expect(pathsEndingOn('region-b')).toEqual([])
  expect(pathsEndingOn('region-a')).toEqual(['policy-a'])
  expect(shownIds('[data-note]', 'data-note')).toContain('b-denied')
  expect(diagram().querySelector('[data-note="b-denied"]')!.textContent).toBe('요청 시점에 거부')

  await selectScenario('aws:SourceIp')
  expect(pathsEndingOn('region-b')).toEqual(['policy-b'])
  expect(shownIds('[data-note]', 'data-note')).toContain('b-reached')
  expect(shownIds('[data-note]', 'data-note')).not.toContain('b-denied')
  expect(diagram().querySelector('[data-note="b-reached"]')!.textContent).toBe('막지 못함')
}

// 사후 알림은 리전 B에서 일어난 뒤에 알림으로 끝나고, 승인된 리전 A는 흐려진다.
async function expectAfterFactEndsOnNotify() {
  const scenario = scenarioNamed('after-fact')
  await selectScenario(scenario.label)
  const last = scenario.paths[scenario.paths.length - 1]
  const { end } = pathEnds(last)

  expect(onEdge(end.x, end.y, nodeBox('notify')), `${last} → notify`).toBe(true)
  expect(diagram().querySelector('[data-node="region-a"]')).toHaveAttribute('opacity', '0.25')
  expect(pathsEndingOn('region-b')).toEqual(['policy-b'])
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
  render(<><RegionConditionDiagram /><RegionConditionDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: '리전 조건 키 도식' })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'aws:SourceIp' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(3)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('RegionConditionDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<RegionConditionDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 다섯 개가 모두 선명하고 경로·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<RegionConditionDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual([...allNodes].sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·경로·곁말만 보이고 나머지 노드는 흐려진다', async (scenario) => {
    const { container } = render(<RegionConditionDiagram />)
    await expectScenario(scenario, tallNotes, tallPaths, 280, container)
  })

  it('장면을 바꾸면 이전 경로·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<RegionConditionDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
    }
    await selectScenario('전체')

    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
    for (const { label } of expectedScenarios) expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'false')
  })

  it('노드 다섯 개가 280×288 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<RegionConditionDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 288')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 288])
  })

  it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 곁말은 크기 9로 0..280 안에 있다', async (label) => {
    render(<RegionConditionDiagram />)
    await selectScenario(label)

    for (const text of diagram().querySelectorAll('[data-note]')) {
      expect(text).toHaveAttribute('font-size', '9')
      const box = textBox(text)
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(280)
    }
  })

  it('사용자만 회색이고 정책 평가·리전·알림은 파랑이며 청록·초록·빨강을 쓰지 않는다', () => {
    render(<RegionConditionDiagram />)
    expectColors()
  })

  it('aws:RequestedRegion이면 리전 B에 닿는 경로 없이 거부가 보이고, aws:SourceIp면 리전 B까지 경로가 닿는다', async () => {
    render(<RegionConditionDiagram />)
    await expectRegionBReach()
  })

  it('일어난 뒤 알림은 알림에서 흐름이 끝나고 리전 A는 흐려진다', async () => {
    render(<RegionConditionDiagram />)
    await expectAfterFactEndsOnNotify()
  })

  it('경로 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<RegionConditionDiagram />)
    await expectPathEnds()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 경로가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<RegionConditionDiagram />)
    const text = visualsByTopicId[topicId].diagrams['region-condition']
    const ids = regionConditionScenarios.map(({ id }) => id).sort()
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
    expect(text.label).toBe('리전 조건 키 도식')
    expect(text.svgLabel).toBe('aws:RequestedRegion·aws:SourceIp·사후 알림')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = regionConditionScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
      expect([...wording.caption].length).toBeLessThanOrEqual(57)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) {
      expect(conceptIds).toContain(source)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 aws:RequestedRegion 조건 키 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: '리전 조건 키 도식' })

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

    it('440×208 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<RegionConditionDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 208')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드 id 집합과 시나리오로 나타나는 경로 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<RegionConditionDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 288')
      const tallNodes = ids('[data-node]', 'data-node')
      const tallPathIds = await collectPathIds()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 208')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(tallNodes).toEqual([...allNodes].sort())
      expect(tallPathIds).toEqual(Object.keys(tallPaths).sort())
      expect(await collectPathIds()).toEqual(tallPathIds)
    })

    it('모든 rect가 440×208 viewBox 안에 있고 노드 라벨이 자기 상자 안에 들어간다', () => {
      render(<RegionConditionDiagram />)
      expectFits([0, 0, 440, 208])
    })

    it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 곁말은 크기 9로 0..440 안에 있다', async (label) => {
      render(<RegionConditionDiagram />)
      await selectScenario(label)

      for (const text of diagram().querySelectorAll('[data-note]')) {
        expect(text).toHaveAttribute('font-size', '9')
        const box = textBox(text)
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width).toBeLessThanOrEqual(440)
      }
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·경로·곁말·캡션을 보이고 곁말은 노드·경로와 겹치지 않는다', async (scenario) => {
      const { container } = render(<RegionConditionDiagram />)
      await expectScenario(scenario, wideNotes, widePaths, 440, container)
    })

    it('사용자만 회색이고 정책 평가·리전·알림은 파랑이며 청록·초록·빨강을 쓰지 않는다', () => {
      render(<RegionConditionDiagram />)
      expectColors()
    })

    it('aws:RequestedRegion이면 리전 B에 닿는 경로 없이 거부가 보이고, aws:SourceIp면 리전 B까지 경로가 닿는다', async () => {
      render(<RegionConditionDiagram />)
      await expectRegionBReach()
    })

    it('일어난 뒤 알림은 알림에서 흐름이 끝나고 리전 A는 흐려진다', async () => {
      render(<RegionConditionDiagram />)
      await expectAfterFactEndsOnNotify()
    })

    it('경로 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<RegionConditionDiagram />)
      await expectPathEnds()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 경로가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<RegionConditionDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 288')
      await selectScenario('aws:SourceIp')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: 'aws:SourceIp' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['user-policy', 'policy-a', 'policy-b'])
      for (const path of paths) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      for (const note of diagram().querySelectorAll('[data-note]')) {
        expect(note).toHaveAttribute('x', String(wideNotes[note.getAttribute('data-note')! as NoteId].x))
      }
    })
  })
})
