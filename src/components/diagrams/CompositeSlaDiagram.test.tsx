import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { CompositeSlaDiagram, compositeSlaScenarios } from './CompositeSlaDiagram'

const topicId = 'azure-sla-lifecycle'
const anchorConceptId = `${topicId}.composite-sla`
const labels = {
  'app': '회사 A의 앱',
  'service-a': '서비스 A',
  'service-b': '서비스 B',
}
const noteLabels = {
  'a-value': '99.9%',
  'b-value': '99.95%',
  'app-single': '99.9%',
  'app-composite': '99.9% × 99.95% ≈ 99.85%',
}
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

// 연결선은 늘 그려진다. 앱의 변에서 나가 각 서비스의 변에서 화살표로 끝난다. 선의 흐림은 도착하는 서비스를 따른다.
const linkTargets = { 'app-a': 'service-a', 'app-b': 'service-b' } as const
type LinkId = keyof typeof linkTargets
const tallLinks: Record<LinkId, string> = {
  'app-a': 'M92 24 H60 V96',
  'app-b': 'M188 24 H220 V96',
}
const wideLinks: Record<LinkId, string> = {
  'app-a': 'M120 44 H184 V24 H280',
  'app-b': 'M120 60 H216 V84 H280',
}

const tallNotes: NotePlaces = {
  'a-value': { x: 60, y: 146, anchor: 'middle' },
  'b-value': { x: 220, y: 146, anchor: 'middle' },
  'app-single': { x: 140, y: 58, anchor: 'middle' },
  'app-composite': { x: 140, y: 58, anchor: 'middle' },
}
const wideNotes: NotePlaces = {
  'a-value': { x: 368, y: 28, anchor: 'start' },
  'b-value': { x: 368, y: 88, anchor: 'start' },
  'app-single': { x: 72, y: 84, anchor: 'middle' },
  'app-composite': { x: 72, y: 84, anchor: 'middle' },
}

const allNodes = Object.keys(labels)
const question = '서비스 두 개에 함께 기대는 앱은, 가동률이 어떻게 될까?'
const idleCaption = '회사 A의 앱이 서비스 A와 서비스 B에 기대는 모습이다. 버튼을 고르면 앱이 기대는 서비스가 하나일 때와 둘일 때 앱 전체의 가동률이 어떻게 되는지 볼 수 있다. 서비스 이름과 백분율은 예로 든 것이다.'
const legend = '화살표는 앱이 그 서비스에 기댄다는 뜻으로, 그 서비스가 멈추면 앱도 멈춘다. 서비스에 붙은 글은 그 서비스의 SLA이고, 앱에 붙은 글은 앱 전체의 가동률을 어림한 값이다. 흐린 상자와 화살표는 그 경우에 쓰지 않는 서비스다.'
const figureName = '앱이 기대는 서비스의 SLA를 곱해 복합 SLA를 어림하는 도식'
const svgName = '회사 A의 앱에서 서비스 A와 서비스 B로 화살표가 하나씩 이어진 모습'
const expectedScenarios = [
  {
    id: 'single', label: '서비스 하나',
    nodes: ['app', 'service-a'],
    notes: ['a-value', 'app-single'],
    caption: '회사 A의 앱이 서비스 A 하나에만 기대면, 서비스 A가 멈출 때만 앱이 멈춘다. 곱할 값이 하나뿐이므로 앱의 가동률은 서비스 A의 SLA 99.9%와 같다.',
    sources: [anchorConceptId],
  },
  {
    id: 'composite', label: '서비스 둘',
    nodes: ['app', 'service-a', 'service-b'],
    notes: ['a-value', 'b-value', 'app-composite'],
    caption: '회사 A의 앱이 서비스 A와 서비스 B에 함께 기대면, 둘 중 어느 하나만 멈춰도 앱이 멈춘다. 그래서 두 값을 곱해 약 99.85%로 어림하고, 이 값은 99.9%와 99.95% 어느 쪽보다도 낮다. 이 값은 어림값이지 Microsoft가 앱 전체를 두고 약속하는 SLA가 아니다.',
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

function opacityOf(id: string) {
  return diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')
}

// 곁말 글에서 백분율을 읽는다. 셈이 든 곁말은 마지막 백분율이 결과다.
function percentages(id: NoteId) {
  const note = diagram().querySelector(`[data-note="${id}"]`)!
  return Array.from(note.textContent!.matchAll(/(\d+(?:\.\d+)?)%/gu), ([, value]) => Number(value))
}

// 연결선 둘은 늘 그려지고, 모양은 배치의 것이며, 화살표로 끝나고, 흐림은 도착하는 서비스를 따른다.
function expectLinks(d: Record<LinkId, string>) {
  expect(shownIds('[data-link]', 'data-link').sort()).toEqual(Object.keys(linkTargets).sort())
  for (const [id, target] of Object.entries(linkTargets) as [LinkId, string][]) {
    expect(link(id), id).toHaveAttribute('d', d[id])
    expect(link(id), id).toHaveClass('fill-none', 'stroke-title')
    expect(link(id).getAttribute('marker-end'), id).toMatch(/^url\(#.+\)$/u)
    expect(link(id), id).toHaveAttribute('opacity', opacityOf(target))
  }
  expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
}

// 연결선은 앱의 변에서 시작해 자기 서비스의 변에서 끝나고, 어떤 노드 상자 안도 지나지 않는다.
function expectLinksJoinNodes() {
  for (const [id, target] of Object.entries(linkTargets) as [LinkId, string][]) {
    const list = segments(link(id).getAttribute('d')!)
    expect(onEdge(list[0].x1, list[0].y1, nodeBox('app')), `${id} 시작은 앱의 변`).toBe(true)
    expect(onEdge(list[list.length - 1].x2, list[list.length - 1].y2, nodeBox(target)), `${id} 끝은 ${target}의 변`).toBe(true)
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

  const linkSegments = (Object.keys(linkTargets) as LinkId[]).flatMap((id) => segments(link(id).getAttribute('d')!))
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

// 요점: 서비스 둘에 기대면 앱의 값은 두 서비스 값을 곱한 것이고 어느 쪽보다도 낮다. 서비스 하나에 기대면 그 서비스의 값과 같다.
async function expectPoint() {
  await selectScenario('서비스 둘')
  const [a] = percentages('a-value')
  const [b] = percentages('b-value')
  const appValues = percentages('app-composite')
  const app = appValues[appValues.length - 1]
  expect(app).toBeLessThan(a)
  expect(app).toBeLessThan(b)
  expect(app).toBe(Math.round(a * b) / 100)
  expect(appValues).toEqual([a, b, app])

  await selectScenario('서비스 하나')
  expect(percentages('app-single')).toEqual(percentages('a-value'))
  expect(opacityOf('service-b')).toBe('0.25')
  expect(link('app-b')).toHaveAttribute('opacity', '0.25')
  expect(diagram().querySelector('[data-note="b-value"]')).toBeNull()
}

describe('CompositeSlaDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<CompositeSlaDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 셋이 모두 선명하고 연결선 둘이 흐려지지 않으며 곁말은 없다', () => {
    const { container } = render(<CompositeSlaDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual([...allNodes].sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expectLinks(tallLinks)
    for (const id of Object.keys(linkTargets) as LinkId[]) expect(link(id)).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('연결선은 앱의 변에서 각 서비스의 변까지 가고 노드 안을 지나지 않는다', () => {
    render(<CompositeSlaDiagram />)
    expectLinksJoinNodes()
  })

  it.each(expectedScenarios)('$label: 지정한 노드·곁말만 보이고 나머지 노드는 흐려지며 연결선은 남는다', async (scenario) => {
    const { container } = render(<CompositeSlaDiagram />)
    await expectScenario(scenario, tallNotes, tallLinks, 280, container)
  })

  it('시나리오를 바꾸면 이전 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<CompositeSlaDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
      expect(diagram().querySelectorAll('[data-link]')).toHaveLength(2)
    }
    await selectScenario('전체')

    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    for (const id of Object.keys(linkTargets) as LinkId[]) expect(link(id)).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
    for (const { label } of expectedScenarios) expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'false')
  })

  it('노드 셋이 280×152 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<CompositeSlaDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 152')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 152])
  })

  it('서비스 둘이면 앱의 값은 두 값을 곱한 것이라 어느 쪽보다도 낮고, 서비스 하나면 그 서비스의 값과 같다', async () => {
    render(<CompositeSlaDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', () => {
    render(<><CompositeSlaDiagram /><CompositeSlaDiagram /></>)
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
    render(<CompositeSlaDiagram />)
    const text = visualsByTopicId[topicId].diagrams['composite-sla']
    const ids = compositeSlaScenarios.map(({ id }) => id).sort()
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
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = compositeSlaScenarios.find(({ id }) => id === expected.id)!
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

  it('곁말의 예시 값과 셈은 앵커 개념 본문에 있다', () => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join(' ')

    for (const value of ['99.9%', '99.95%', '약 99.85%', '서비스 A', '서비스 B', '회사 A의 앱', '0.999 × 0.9995 ≈ 0.9985']) {
      expect(body, value).toContain(value)
    }
    expect(0.999 * 0.9995).toBeCloseTo(0.9985005, 9)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 복합 SLA 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×108 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<CompositeSlaDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 108')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expectLinks(wideLinks)
    })

    it('노드·연결선 id 집합이 세로형과 같다', () => {
      const { change } = mockMatchMedia(false)
      render(<CompositeSlaDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 152')
      const tallNodes = ids('[data-node]', 'data-node')
      const tallLinkIds = ids('[data-link]', 'data-link')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 108')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(tallNodes).toEqual([...allNodes].sort())
      expect(ids('[data-link]', 'data-link')).toEqual(tallLinkIds)
      expect(diagram().querySelectorAll('[data-group]')).toHaveLength(0)
    })

    it('모든 rect가 440×108 viewBox 안에 있고 노드 라벨이 자기 상자 안에 들어간다', () => {
      render(<CompositeSlaDiagram />)
      expectFits([0, 0, 440, 108])
    })

    it('연결선은 앱의 변에서 각 서비스의 변까지 가고 노드 안을 지나지 않는다', () => {
      render(<CompositeSlaDiagram />)
      expectLinksJoinNodes()
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·곁말·캡션을 보이고 곁말은 노드·연결선과 겹치지 않는다', async (scenario) => {
      const { container } = render(<CompositeSlaDiagram />)
      await expectScenario(scenario, wideNotes, wideLinks, 440, container)
    })

    it('서비스 둘이면 앱의 값은 두 값을 곱한 것이라 어느 쪽보다도 낮고, 서비스 하나면 그 서비스의 값과 같다', async () => {
      render(<CompositeSlaDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<CompositeSlaDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 152')
      await selectScenario('서비스 둘')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '서비스 둘' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expectLinks(wideLinks)
      for (const note of diagram().querySelectorAll('[data-note]')) {
        expect(note).toHaveAttribute('x', String(wideNotes[note.getAttribute('data-note')! as NoteId].x))
      }
    })
  })
})
