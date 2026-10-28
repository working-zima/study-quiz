import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { FcsCheckDiagram, fcsCheckScenarios } from './FcsCheckDiagram'

const topicId = 'ethernet'
const anchorConceptId = `${topicId}.fcs`
const labels = {
  attach: 'FCS를 계산해 붙임',
  cable: '케이블',
  check: '다시 계산해 비교',
  upper: '위 계층',
}
const groupLabels = {
  sender: '보내는 컴퓨터',
  receiver: '받는 컴퓨터',
}
const noteLabels = {
  damage: '오는 길에 손상',
  same: '두 값이 같음',
  discard: '두 값이 다름: 버림',
}
type NoteId = keyof typeof noteLabels

const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
// 프레임이 지나는 차례. 화살표는 이 차례를 거슬러 가지 않는다.
const chain = ['attach', 'cable', 'check', 'upper']
const homeOf: Record<string, string | undefined> = { attach: 'sender', cable: undefined, check: 'receiver', upper: 'receiver' }
const linkIds = ['attach-cable', 'cable-check', 'check-upper']

const tallLinks: Record<string, string> = {
  'attach-cable': 'M76 64 V104',
  'cable-check': 'M76 136 V176',
  'check-upper': 'M128 192 H176',
}
const wideLinks: Record<string, string> = {
  'attach-cable': 'M120 56 H152',
  'cable-check': 'M208 56 H240',
  'check-upper': 'M344 56 H364',
}
const tallArrows: Record<string, string> = {
  send: 'M76 64 V104',
  arrive: 'M76 136 V176',
  deliver: 'M128 192 H176',
}
const wideArrows: Record<string, string> = {
  send: 'M120 56 H152',
  arrive: 'M208 56 H240',
  deliver: 'M344 56 H364',
}
const ends: Record<string, [string, string]> = {
  'attach-cable': ['attach', 'cable'],
  'cable-check': ['cable', 'check'],
  'check-upper': ['check', 'upper'],
  send: ['attach', 'cable'],
  arrive: ['cable', 'check'],
  deliver: ['check', 'upper'],
}

type Note = { x: number, y: number, anchor: 'start' | 'middle' }
const tallNotes: Record<NoteId, Note> = {
  damage: { x: 136, y: 124, anchor: 'start' },
  same: { x: 76, y: 230, anchor: 'middle' },
  discard: { x: 76, y: 230, anchor: 'middle' },
}
const wideNotes: Record<NoteId, Note> = {
  damage: { x: 180, y: 100, anchor: 'middle' },
  same: { x: 292, y: 100, anchor: 'middle' },
  discard: { x: 292, y: 100, anchor: 'middle' },
}

const question = '받은 프레임이 망가졌는지 어떻게 알까?'
const expectedScenarios = [
  {
    id: 'match', label: '값이 같을 때',
    nodes: ['attach', 'cable', 'check', 'upper', 'attach-cable', 'cable-check', 'check-upper'],
    paths: ['send', 'arrive', 'deliver'],
    notes: ['same'] as NoteId[],
  },
  {
    id: 'mismatch', label: '값이 다를 때',
    nodes: ['attach', 'cable', 'check', 'attach-cable', 'cable-check'],
    paths: ['send', 'arrive'],
    notes: ['damage', 'discard'] as NoteId[],
  },
]

const wording = () => visualsByTopicId[topicId].diagrams['fcs-check']
const concept = () => topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
const diagram = () => screen.getByRole('img', { name: wording().svgLabel })
const select = async (label: string) => { await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) }) }

function readBox(rect: Element): SvgBox {
  return {
    id: rect.getAttribute('data-group') ?? rect.parentElement?.getAttribute('data-node') ?? '',
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}
const nodeBox = (id: string) => readBox(diagram().querySelector(`[data-node="${id}"] rect`)!)
const groupBox = (id: string) => readBox(diagram().querySelector(`[data-group="${id}"]`)!)

function groupLabelArea(id: string): SvgBox {
  const box = groupBox(id)
  return { id, x: box.x + 10, y: box.y + 7, width: estimateTextWidth(groupLabels[id as keyof typeof groupLabels], 9), height: 9 }
}

function shownIds(selector: string, attribute: string) {
  return Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)!)
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function inside(box: SvgBox, group: string) {
  const frame = groupBox(group)
  return boxesOutsideViewBox([box], [frame.x, frame.y, frame.width, frame.height]).length === 0
}

function textBox(text: Element): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9)
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id: text.getAttribute('data-note')!, x: left, y: y - 9, width, height: 9 }
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
  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  for (const segment of segments(line.getAttribute('d')!)) {
    for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const group of groupIds) expect(touches(segment, groupLabelArea(group)), `${id} ↔ ${group} 라벨`).toBe(false)
  }
  const { start, end } = lineEnds(line)
  expect(nodeAt(start), `${id} 시작`).toBe(ends[id][0])
  expect(nodeAt(end), `${id} 끝`).toBe(ends[id][1])
}

function expectNotes(ids: NoteId[], places: Record<NoteId, Note>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note')).sort()).toEqual([...ids].sort())
  const lines = Array.from(diagram().querySelectorAll('[data-link], [data-path]'))
  for (const note of shown) {
    const id = note.getAttribute('data-note')! as NoteId
    expect(note.textContent).toBe(noteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', places[id].anchor)
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note.closest('[opacity]')).toBeNull()
    const box = textBox(note)
    expect(boxesOutsideViewBox([box], [0, 0, width, height]), id).toEqual([])
    for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
    for (const group of groupIds) expect(overlaps(box, groupLabelArea(group)), `${id} ↔ ${group} 라벨`).toBe(false)
    for (const line of lines) {
      for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), `${id} ↔ 선`).toBe(false)
    }
  }
  for (let i = 0; i < shown.length; i += 1) {
    for (let j = i + 1; j < shown.length; j += 1) expect(overlaps(textBox(shown[i]), textBox(shown[j])), '곁말끼리').toBe(false)
  }
}

async function expectScenario(
  scenario: typeof expectedScenarios[number],
  arrows: Record<string, string>,
  places: Record<NoteId, Note>,
  width: number,
  height: number,
  container: HTMLElement,
) {
  await select(scenario.label)
  for (const element of diagram().querySelectorAll('[data-node], [data-link]')) {
    const id = element.getAttribute('data-node') ?? element.getAttribute('data-link')!
    expect(element, id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  for (const group of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(group.closest('[opacity]')).toBeNull()
  const shownPaths = Array.from(diagram().querySelectorAll('[data-path]'))
  expect(shownPaths.map((path) => path.getAttribute('data-path'))).toEqual(scenario.paths)
  for (const path of shownPaths) {
    expect(path).toHaveAttribute('d', arrows[path.getAttribute('data-path')!])
    expect(path).toHaveAttribute('stroke-width', '2')
    expect(path).toHaveAttribute('marker-end', `url(#${diagram().querySelector('marker')!.id})`)
    expect(path).toHaveClass('stroke-title')
    expect(path.closest('[opacity]')).toBeNull()
  }
  expectNotes(scenario.notes, places, width, height)
  expect(container.querySelector('figcaption')!.textContent).toBe(wording().scenarios.find(({ id }) => id === scenario.id)!.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

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
  for (const [id, text] of Object.entries(groupLabels)) {
    const box = groupBox(id)
    const groupLabel = diagram().querySelector(`[data-group-label="${id}"]`)!
    expect(groupLabel.textContent).toBe(text)
    expect(groupLabel).toHaveAttribute('font-size', '9')
    expect(groupLabel).toHaveClass('fill-muted')
    expect(Number(groupLabel.getAttribute('x'))).toBe(box.x + 10)
    expect(Number(groupLabel.getAttribute('y'))).toBe(box.y + 14)
    expect(box.x + 10 + estimateTextWidth(text, 9), text).toBeLessThanOrEqual(box.x + box.width)
    for (const node of nodeIds) expect(overlaps(groupLabelArea(id), nodeBox(node)), `${text} ↔ ${node}`).toBe(false)
  }
}

// 보내는 쪽 계산은 보내는 컴퓨터 안에, 다시 계산·비교와 위 계층은 받는 컴퓨터 안에, 케이블은 두 박스 밖에 있다.
function expectMembershipAndLinks(links: Record<string, string>) {
  for (const [node, group] of Object.entries(homeOf)) {
    expect(groupIds.filter((id) => inside(nodeBox(node), id)), node).toEqual(group ? [group] : [])
    if (!group) for (const id of groupIds) expect(overlaps(nodeBox(node), groupBox(id)), `${node} ↔ ${id}`).toBe(false)
  }
  const shown = Array.from(diagram().querySelectorAll('[data-link]'))
  expect(shown.map((link) => link.getAttribute('data-link'))).toEqual(linkIds)
  for (const link of shown) {
    const id = link.getAttribute('data-link')!
    expect(link).toHaveAttribute('d', links[id])
    expect(link).toHaveClass('fill-none', 'stroke-muted')
    expect(link).toHaveAttribute('stroke-width', '1.5')
    expect(link).not.toHaveAttribute('marker-end')
    expectLine(link, id)
  }
  for (const id of nodeIds) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

async function expectArrowEnds() {
  for (const { label } of expectedScenarios) {
    await select(label)
    for (const path of diagram().querySelectorAll('[data-path]')) expectLine(path, path.getAttribute('data-path')!)
  }
}

// 요점: 두 값이 같을 때만 받는 컴퓨터 안에서 위 계층으로 넘기는 화살표가 보이고, 다를 때만 「버림」과 손상 곁말이 보이며 위 계층이 흐려진다.
// 어느 시나리오에서도 화살표는 프레임이 지나는 차례를 거슬러 가지 않는다 — 보낸 쪽으로 되돌아가 다시 보내 달라고 하거나 고치는 길이 없다.
// 곁말에도 고침·다시 보냄을 뜻하는 말이 없다. 본문은 버리고 고치지 않는다고 말한다.
async function expectPoint() {
  for (const scenario of expectedScenarios) {
    await select(scenario.label)
    const hops = Array.from(diagram().querySelectorAll('[data-path]'), (path) => [nodeAt(lineEnds(path).start)!, nodeAt(lineEnds(path).end)!])
    for (const [from, to] of hops) expect(chain.indexOf(to), `${scenario.label} ${from}→${to}`).toBe(chain.indexOf(from) + 1)
    const delivered = hops.some(([from, to]) => from === 'check' && to === 'upper')
    expect(delivered, scenario.label).toBe(scenario.id === 'match')
    expect(diagram().querySelector('[data-node="upper"]'), scenario.label).toHaveAttribute('opacity', scenario.id === 'match' ? '1' : '0.25')
    expect(diagram().querySelector('[data-note="discard"]') !== null, scenario.label).toBe(scenario.id === 'mismatch')
    expect(diagram().querySelector('[data-note="damage"]') !== null, scenario.label).toBe(scenario.id === 'mismatch')
    for (const note of diagram().querySelectorAll('[data-note]')) expect(note.textContent).not.toMatch(/고침|고친|고쳐|다시 보냄|다시 보내|재전송/u)
  }
  expect(noteLabels.discard).toContain('버림')
  const body = concept().paragraphs.join('\n')
  for (const word of ['버린다', '고치지 않는다', '위 계층', '손상', '다시 계산', '맨 끝에 붙이는']) expect(body, word).toContain(word)
}

describe('FcsCheckDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<FcsCheckDiagram />)
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 넷·연결선 셋·박스가 모두 선명하고 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<FcsCheckDiagram />)
    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
    expect(shownIds('[data-group]', 'data-group')).toEqual(groupIds)
    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(wording().idleCaption)
    expect(screen.getByText(wording().legend!)).toBeInTheDocument()
  })

  it.each(expectedScenarios)('$label: 지정한 노드·연결선·화살표·곁말만 보이고 박스는 그대로다', async (scenario) => {
    const { container } = render(<FcsCheckDiagram />)
    await expectScenario(scenario, tallArrows, tallNotes, 280, 248, container)
  })

  it('시나리오를 바꾸면 이전 화살표와 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<FcsCheckDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await select(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
    }
    await select('전체')
    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(wording().idleCaption)
  })

  it('노드와 박스가 280×248 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<FcsCheckDiagram />)
    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 248')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 248])
  })

  it('계산 노드는 자기 컴퓨터 안에, 케이블은 밖에 있고 연결선은 늘 보이며 노드는 모두 회색이다', () => {
    render(<FcsCheckDiagram />)
    expectMembershipAndLinks(tallLinks)
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
    render(<FcsCheckDiagram />)
    await expectArrowEnds()
  })

  it('두 값이 같을 때만 위 계층으로 넘기고, 다를 때는 버리며 어느 쪽에도 고치거나 되돌아가는 길이 없다', async () => {
    render(<FcsCheckDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    render(<><FcsCheckDiagram /><FcsCheckDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: wording().label })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '값이 같을 때' })) })
      expect(figure.querySelectorAll('[data-path]')).toHaveLength(3)
      for (const path of figure.querySelectorAll('[data-path]')) {
        expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
      }
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<FcsCheckDiagram />)
    const text = wording()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(fcsCheckScenarios.map(({ id }) => id)).toEqual(expectedScenarios.map(({ id }) => id))
    expect(text.scenarios.map(({ id }) => id)).toEqual(expectedScenarios.map(({ id }) => id))
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.label).toBe('FCS로 손상을 알아내는 도식')
    expect(text.sources).toEqual([anchorConceptId])
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wordingOf = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = fcsCheckScenarios.find(({ id }) => id === expected.id)!
      expect(wordingOf.label).toBe(expected.label)
      expect(wordingOf.sources).toEqual([anchorConceptId])
      expect(scenario.label).toBe(wordingOf.label)
      expect(scenario.caption).toBe(wordingOf.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 FCS 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    render(<ConceptList concepts={[concept()]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: wording().label })
    expect(figure.closest('article')).toHaveAttribute('id', concept().id)
    expect(figure.previousElementSibling?.textContent).toBe(concept().paragraphs.join('').replace(/\*\*|`/gu, ''))
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
          const event = Object.assign(new Event('change'), { matches: nextMatches, media: mediaQuery.media })
          listeners.forEach((listener) => listener(event))
        },
      }
    }

    async function collectPathIds() {
      const found = new Set<string>()
      for (const { label } of expectedScenarios) {
        await select(label)
        for (const id of shownIds('[data-path]', 'data-path')) found.add(id)
      }
      return [...found].sort()
    }

    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    it('440×108 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<FcsCheckDiagram />)
      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 108')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·그룹·연결선 id 집합과 화살표 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<FcsCheckDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 248')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroups = shownIds('[data-group]', 'data-group').sort()
      const tallLinkIds = shownIds('[data-link]', 'data-link').sort()
      const tallPathIds = await collectPathIds()
      act(() => change(true))
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 108')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroups)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinkIds)
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(await collectPathIds()).toEqual(tallPathIds)
    })

    it('모든 rect가 440×108 viewBox 안에 있고 라벨과 그룹 라벨이 자기 상자 안에 들어간다', () => {
      render(<FcsCheckDiagram />)
      expectFits([0, 0, 440, 108])
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<FcsCheckDiagram />)
      await expectScenario(scenario, wideArrows, wideNotes, 440, 108, container)
    })

    it('계산 노드는 자기 컴퓨터 안에, 케이블은 밖에 있고 연결선은 늘 보이며 노드는 모두 회색이다', () => {
      render(<FcsCheckDiagram />)
      expectMembershipAndLinks(wideLinks)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
      render(<FcsCheckDiagram />)
      await expectArrowEnds()
    })

    it('두 값이 같을 때만 위 계층으로 넘기고, 다를 때는 버리며 어느 쪽에도 고치거나 되돌아가는 길이 없다', async () => {
      render(<FcsCheckDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<FcsCheckDiagram />)
      await select('값이 다를 때')
      const caption = container.querySelector('figcaption')!.textContent
      act(() => change(true))
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 108')
      expect(screen.getByRole('button', { name: '값이 다를 때' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['send', 'arrive'])
      for (const path of paths) expect(path).toHaveAttribute('d', wideArrows[path.getAttribute('data-path')!])
      expect(diagram().querySelector('[data-note="discard"]')).toHaveAttribute('x', String(wideNotes.discard.x))
      expect(diagram().querySelector('[data-node="upper"]')).toHaveAttribute('opacity', '0.25')
    })
  })
})
