import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { TtlCountdownDiagram, ttlCountdownScenarios } from './TtlCountdownDiagram'

const topicId = 'ip-protocol'
const anchorConceptId = `${topicId}.ttl`
const labels: Record<string, string> = {
  'source-host': '출발지 호스트', 'router-1': '라우터 1', 'router-2': '라우터 2', 'router-3': '라우터 3', 'dest-host': '목적지 호스트',
}
const noteLabels: Record<string, string> = {
  'arrive-1': 'TTL 4', 'arrive-2': 'TTL 3', 'arrive-3': 'TTL 2', 'arrive-4': 'TTL 1',
  'expire-1': 'TTL 2', 'expire-2': 'TTL 1',
  'drop-note': 'TTL이 0이 되어 버림', 'miss-note': '목적지에 닿지 않음',
}
const nodeIds = Object.keys(labels)
const linkIds = ['link-1', 'link-2', 'link-3', 'link-4']
const chain = ['source-host', 'router-1', 'router-2', 'router-3', 'dest-host']

const tallLines: Record<string, string> = {
  'link-1': 'M72 40 V72', 'link-2': 'M72 104 V136', 'link-3': 'M72 168 V200', 'link-4': 'M72 232 V264',
  'hop-1': 'M72 40 V72', 'hop-2': 'M72 104 V136', 'hop-3': 'M72 168 V200', 'hop-4': 'M72 232 V264',
}
const wideLines: Record<string, string> = {
  'link-1': 'M88 48 H112', 'link-2': 'M168 48 H192', 'link-3': 'M248 48 H272', 'link-4': 'M328 48 H352',
  'hop-1': 'M88 48 H112', 'hop-2': 'M168 48 H192', 'hop-3': 'M248 48 H272', 'hop-4': 'M328 48 H352',
}
const ends = (id: string): [string, string] => {
  const k = Number(id.split('-')[1])
  return [chain[k - 1], chain[k]]
}

const question = 'TTL이 다 떨어진 패킷은 어떻게 될까?'
const idleCaption = '출발지 호스트와 목적지 호스트 사이에 라우터 셋이 차례로 놓여 있다. 버튼을 고르면 출발지가 넣은 TTL 값에 따라 패킷이 목적지에 닿는지, 도중에 버려지는지 볼 수 있다.'
const legend = '가는 선은 장치 사이의 링크, 화살표는 패킷이 가는 길이다. 화살표 곁의 값은 그 구간을 지나는 패킷의 TTL이다.'
const figureName = '라우터를 지날 때마다 TTL이 줄고 0이 되면 패킷이 버려지는 것을 보이는 도식'
const svgName = '출발지 호스트가 보낸 IPv4 패킷이 라우터 1·라우터 2·라우터 3을 지나 목적지 호스트로 가는 동안 구간마다 TTL이 1씩 줄고, TTL이 0이 된 라우터에서 패킷이 버려지는 모습'
const expectedScenarios = [
  {
    id: 'arrive', label: '도착',
    nodes: [...nodeIds, ...linkIds],
    paths: ['hop-1', 'hop-2', 'hop-3', 'hop-4'],
    notes: ['arrive-1', 'arrive-2', 'arrive-3', 'arrive-4'],
    caption: '출발지가 TTL을 4로 넣어 보내면 라우터를 지날 때마다 1씩 줄어 3, 2, 1이 된다. TTL이 0이 되기 전에 목적지 호스트에 닿는다.',
  },
  {
    id: 'expire', label: '버려짐',
    nodes: ['source-host', 'router-1', 'router-2', 'link-1', 'link-2'],
    paths: ['hop-1', 'hop-2'],
    notes: ['expire-1', 'expire-2', 'drop-note', 'miss-note'],
    caption: '출발지가 TTL을 2로 넣으면 라우터 1이 1로 줄여 넘기고, 라우터 2가 0으로 줄인 뒤 패킷을 버린다. 패킷은 라우터 3에도 목적지 호스트에도 닿지 않는다.',
  },
]

function diagram() {
  return screen.getByRole('img', { name: svgName })
}

async function selectScenario(label: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) })
}

function readBox(rect: Element, id = ''): SvgBox {
  return {
    id,
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

function nodeBox(id: string) {
  return readBox(diagram().querySelector(`[data-node="${id}"] rect`)!, id)
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function textBox(text: Element, id: string): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9) * 1.15
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id, x: left, y: y - 9, width, height: 9 }
}

type Segment = { x1: number, y1: number, x2: number, y2: number }

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

function crossesInside(segment: Segment, box: SvgBox) {
  const left = Math.min(segment.x1, segment.x2)
  const right = Math.max(segment.x1, segment.x2)
  const top = Math.min(segment.y1, segment.y2)
  const bottom = Math.max(segment.y1, segment.y2)
  if (top === bottom) return top > box.y && top < box.y + box.height && Math.min(right, box.x + box.width) > Math.max(left, box.x)
  return left > box.x && left < box.x + box.width && Math.min(bottom, box.y + box.height) > Math.max(top, box.y)
}

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

function nodeAt(point: { x: number, y: number }) {
  return nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))
}

function expectLine(line: Element, id: string) {
  for (const segment of segments(line.getAttribute('d')!)) {
    for (const node of nodeIds.map(nodeBox)) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
  }
  const { start, end } = lineEnds(line)
  expect(nodeAt(start), `${id} 시작`).toBe(ends(id)[0])
  expect(nodeAt(end), `${id} 끝`).toBe(ends(id)[1])
}

function center(box: SvgBox) {
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

function distance(a: { x: number, y: number }, b: { x: number, y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function nearestNode(box: SvgBox) {
  return [...nodeIds].sort((a, b) => distance(center(box), center(nodeBox(a))) - distance(center(box), center(nodeBox(b))))[0]
}

// 곁말이 viewBox 안에서 노드·선과 겹치지 않는다.
function expectNotesClear(width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  const boxes = shown.map((note) => textBox(note, note.getAttribute('data-note')!))
  for (const box of boxes) {
    expect(box.x, box.id).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, box.id).toBeLessThanOrEqual(width)
    expect(box.y, box.id).toBeGreaterThanOrEqual(0)
    expect(box.y + box.height, box.id).toBeLessThanOrEqual(height)
    for (const id of nodeIds) expect(overlaps(box, nodeBox(id)), `${box.id} ↔ ${id}`).toBe(false)
    for (const line of diagram().querySelectorAll('[data-link], [data-path]')) {
      for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
    }
  }
  for (let i = 0; i < boxes.length; i += 1) {
    for (let j = i + 1; j < boxes.length; j += 1) expect(overlaps(boxes[i], boxes[j]), `${boxes[i].id} ↔ ${boxes[j].id}`).toBe(false)
  }
}

async function expectScenario(scenario: typeof expectedScenarios[number], lines: Record<string, string>, width: number, height: number, container: HTMLElement) {
  await selectScenario(scenario.label)
  for (const element of diagram().querySelectorAll('[data-node], [data-link]')) {
    const id = element.getAttribute('data-node') ?? element.getAttribute('data-link')!
    expect(element, id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  const shownPaths = Array.from(diagram().querySelectorAll('[data-path]'))
  expect(shownPaths.map((path) => path.getAttribute('data-path'))).toEqual(scenario.paths)
  for (const path of shownPaths) {
    expect(path).toHaveAttribute('d', lines[path.getAttribute('data-path')!])
    expect(path).toHaveAttribute('stroke-width', '2')
    expect(path).toHaveAttribute('marker-end', `url(#${diagram().querySelector('marker')!.id})`)
    expect(path).toHaveClass('stroke-title')
    expectLine(path, path.getAttribute('data-path')!)
  }
  const shownNotes = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shownNotes.map((note) => note.getAttribute('data-note'))).toEqual(scenario.notes)
  for (const note of shownNotes) {
    expect(note.textContent).toBe(noteLabels[note.getAttribute('data-note')!])
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note.closest('[opacity]')).toBeNull()
  }
  expectNotesClear(width, height)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
}

function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), (rect) => readBox(rect))
  expect(boxes).toHaveLength(nodeIds.length)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(nodeBox(id).height).toBe(32)
    expect(estimateTextWidth(label, 10) + 12, `${id} ${label}`).toBeLessThanOrEqual(nodeBox(id).width)
  }
  for (let i = 0; i < nodeIds.length; i += 1) {
    for (let j = i + 1; j < nodeIds.length; j += 1) expect(overlaps(nodeBox(nodeIds[i]), nodeBox(nodeIds[j]))).toBe(false)
  }
}

function expectLinks(lines: Record<string, string>) {
  const shown = Array.from(diagram().querySelectorAll('[data-link]'))
  expect(shown.map((link) => link.getAttribute('data-link'))).toEqual(linkIds)
  for (const link of shown) {
    const id = link.getAttribute('data-link')!
    expect(link).toHaveAttribute('d', lines[id])
    expect(link).toHaveClass('fill-none', 'stroke-muted')
    expect(link).not.toHaveAttribute('marker-end')
    expectLine(link, id)
  }
  for (const id of nodeIds) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

function ttlValues() {
  return Array.from(diagram().querySelectorAll('[data-note]'))
    .filter((note) => /^TTL \d+$/u.test(note.textContent!))
    .map((note) => Number(note.textContent!.slice(4)))
}

// 요점: 도착에서는 구간마다 TTL이 1씩 줄고 0이 되기 전에 목적지 호스트에 닿는다.
// 버려짐에서는 화살표가 TTL이 0이 되는 라우터에서 끝나고, 그 뒤의 라우터와 목적지 호스트가 흐려진다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')

  await selectScenario('도착')
  const arrive = ttlValues()
  expect(arrive).toHaveLength(4)
  for (let i = 1; i < arrive.length; i += 1) expect(arrive[i]).toBe(arrive[i - 1] - 1)
  expect(arrive[arrive.length - 1]).toBeGreaterThan(0)
  const arrivePaths = Array.from(diagram().querySelectorAll('[data-path]'))
  expect(nodeAt(lineEnds(arrivePaths[arrivePaths.length - 1]).end)).toBe('dest-host')
  expect(diagram().querySelector('[data-node="dest-host"]')).toHaveAttribute('opacity', '1')
  const arriveBright = nodeIds.filter((id) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')

  await selectScenario('버려짐')
  const expire = ttlValues()
  for (let i = 1; i < expire.length; i += 1) expect(expire[i]).toBe(expire[i - 1] - 1)
  const expirePaths = Array.from(diagram().querySelectorAll('[data-path]'))
  expect(expirePaths).toHaveLength(expire.length)
  const lastStop = nodeAt(lineEnds(expirePaths[expirePaths.length - 1]).end)!
  expect(lastStop).toBe('router-2')
  expect(expire[expire.length - 1] - 1, '마지막 라우터가 줄인 값').toBe(0)
  for (const id of chain.slice(chain.indexOf(lastStop) + 1)) expect(diagram().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', '0.25')
  expect(nearestNode(textBox(diagram().querySelector('[data-note="drop-note"]')!, 'drop-note'))).toBe('router-2')
  expect(nearestNode(textBox(diagram().querySelector('[data-note="miss-note"]')!, 'miss-note'))).toBe('dest-host')
  const expireBright = nodeIds.filter((id) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
  expect(expireBright).not.toEqual(arriveBright)

  expect(body).toContain('출발지가 TTL을 4로 넣어 보내면, 패킷은 라우터 1을 지나며 3, 라우터 2를 지나며 2, 라우터 3을 지나며 1이 되어 목적지 호스트에 닿는다')
  expect(body).toContain('출발지가 TTL을 2로 넣었다면 라우터 1이 1로 줄여 넘기고, 라우터 2가 0으로 줄인 뒤 그 패킷을 버린다')
  expect(body).toContain('이 패킷은 라우터 3에도 목적지 호스트에도 닿지 않는다')
}

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
      const event = Object.assign(new Event('change'), { matches: nextMatches, media: mediaQuery.media })
      listeners.forEach((listener) => listener(event))
    },
  }
}

describe('TtlCountdownDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<TtlCountdownDiagram />)
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 링크가 모두 선명하고 화살표·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<TtlCountdownDiagram />)
    expect(Array.from(diagram().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<TtlCountdownDiagram />)
    await expectScenario(scenario, tallLines, 280, 304, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<TtlCountdownDiagram />)
    await selectScenario('도착')
    await selectScenario('버려짐')
    expect(Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note'))).toEqual(expectedScenarios[1].notes)
    await selectScenario('전체')
    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드가 280×304 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<TtlCountdownDiagram />)
    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 304')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expectFits([0, 0, 280, 304])
  })

  it('링크는 늘 보이고 회색이며 이웃한 두 장치의 변에서 시작하고 끝난다', () => {
    render(<TtlCountdownDiagram />)
    expectLinks(tallLines)
  })

  it('도착에서는 TTL이 구간마다 1씩 줄고, 버려짐에서는 TTL이 0이 된 라우터에서 길이 끝난다', async () => {
    render(<TtlCountdownDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><TtlCountdownDiagram /><TtlCountdownDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '도착' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<TtlCountdownDiagram />)
    const text = visualsByTopicId[topicId].diagrams['ttl-countdown']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(ttlCountdownScenarios.map(({ id }) => id)).toEqual(expectedScenarios.map(({ id }) => id))
    expect(text.scenarios.map(({ id }) => id)).toEqual(expectedScenarios.map(({ id }) => id))
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toBeUndefined()
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.label).toBe(figureName)
    expect(text.sources).toEqual([anchorConceptId])
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = ttlCountdownScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
      expect(scenario.caption).toBe(wording.caption)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 TTL 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(screen.getAllByRole('figure')).toEqual([figure])
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×96 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<TtlCountdownDiagram />)
      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 96')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('모든 rect가 440×96 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<TtlCountdownDiagram />)
      expectFits([0, 0, 440, 96])
    })

    it('링크는 늘 보이고 이웃한 두 장치의 변에서 시작하고 끝난다', () => {
      render(<TtlCountdownDiagram />)
      expectLinks(wideLines)
    })

    it('노드·링크 id 집합이 세로형과 같다', () => {
      const { change } = mockMatchMedia(false)
      render(<TtlCountdownDiagram />)
      const read = (selector: string, attribute: string) => Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)).sort()
      const tall = [read('[data-node]', 'data-node'), read('[data-link]', 'data-link')]
      act(() => change(true))
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 96')
      expect([read('[data-node]', 'data-node'), read('[data-link]', 'data-link')]).toEqual(tall)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<TtlCountdownDiagram />)
      await expectScenario(scenario, wideLines, 440, 96, container)
    })

    it('가로형에서도 TTL이 줄어드는 요점이 그대로다', async () => {
      render(<TtlCountdownDiagram />)
      await expectPoint()
    })

    it('폭이 바뀌어도 고른 시나리오와 캡션을 유지한다', async () => {
      const { change } = mockMatchMedia(true)
      const { container } = render(<TtlCountdownDiagram />)
      await selectScenario('버려짐')
      act(() => change(false))
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 304')
      expect(screen.getByRole('button', { name: '버려짐' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(expectedScenarios[1].caption)
      expect(Array.from(diagram().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path'))).toEqual(['hop-1', 'hop-2'])
    })
  })
})
