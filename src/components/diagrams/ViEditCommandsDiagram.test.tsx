import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ViEditCommandsDiagram, viEditCommandsScenarios } from './ViEditCommandsDiagram'

const topicId = 'linux-shell'
const anchorConceptId = `${topicId}.vi-edit-commands`
const labels = {
  before: 'red green blue',
  'cmd-char': 'x',
  'after-char': 'red reen blue',
  'cmd-word': 'dw',
  'after-word': 'red blue',
  'cmd-end': 'D',
  'after-end': 'red',
  'cmd-line': 'dd',
  'after-line': '줄이 사라짐',
}
const noteLabels = {
  cursor: '커서: green의 g',
  front: '커서 앞만 남음',
}
type NoteId = keyof typeof noteLabels
// 늘 보이는 곁말 — 커서가 어디 놓였는지는 시나리오와 상관없이 보인다.
const fixedNotes: NoteId[] = ['cursor']

const nodeIds = Object.keys(labels)

const tallArrows: Record<string, string> = {
  'in-char': 'M32 24 H16 V80 H32',
  'out-char': 'M72 80 H88',
  'in-word': 'M32 24 H16 V128 H32',
  'out-word': 'M72 128 H88',
  'in-end': 'M32 24 H16 V176 H32',
  'out-end': 'M72 176 H88',
  'in-line': 'M32 24 H16 V224 H32',
  'out-line': 'M72 224 H88',
}
const wideArrows: Record<string, string> = {
  'in-char': 'M128 88 H144 V24 H160',
  'out-char': 'M200 24 H232',
  'in-word': 'M128 88 H144 V72 H160',
  'out-word': 'M200 72 H232',
  'in-end': 'M128 88 H144 V120 H160',
  'out-end': 'M200 120 H232',
  'in-line': 'M128 88 H144 V168 H160',
  'out-line': 'M200 168 H232',
}
// 화살표마다 출발 노드와 도착 노드. in-*은 지우기 전의 줄에서 명령으로, out-*은 명령에서 그 명령 뒤의 줄로 간다.
const ends: Record<string, [string, string]> = {
  'in-char': ['before', 'cmd-char'],
  'out-char': ['cmd-char', 'after-char'],
  'in-word': ['before', 'cmd-word'],
  'out-word': ['cmd-word', 'after-word'],
  'in-end': ['before', 'cmd-end'],
  'out-end': ['cmd-end', 'after-end'],
  'in-line': ['before', 'cmd-line'],
  'out-line': ['cmd-line', 'after-line'],
}

type Note = { x: number, y: number, anchor: 'start' | 'middle' | 'end' }
const tallNotes: Record<NoteId, Note> = {
  cursor: { x: 160, y: 28, anchor: 'start' },
  front: { x: 200, y: 180, anchor: 'start' },
}
const wideNotes: Record<NoteId, Note> = {
  cursor: { x: 68, y: 124, anchor: 'middle' },
  front: { x: 340, y: 124, anchor: 'start' },
}

const question = 'x·dw·D·dd는 각각 얼마나 지울까?'
const idleCaption = '예로 든 줄 red green blue에서 커서가 green의 첫 글자 g에 놓여 있다. 버튼을 고르면 명령 모드에서 x·dw·D·dd를 눌렀을 때 줄이 어떻게 바뀌는지 볼 수 있다.'
const legend = '화살표는 지우기 전의 줄에서 명령으로, 명령에서 그 명령 뒤의 줄로 간다.'
const figureName = '줄 red green blue에서 커서가 green의 g에 있을 때 x, dw, D, dd를 누르면 줄이 어떻게 바뀌는지를 명령마다 보이는 도식'
const svgName = '지우기 전의 줄 red green blue 아래에 x, dw, D, dd 명령과 그 명령 뒤의 줄이 놓여 있다'
const expectedScenarios = [
  {
    id: 'char', label: 'x',
    nodes: ['before', 'cmd-char', 'after-char'],
    paths: ['in-char', 'out-char'],
    notes: ['cursor'] as NoteId[],
    caption: 'x는 커서가 놓인 글자 g 하나만 지운다. 같은 줄의 다른 글자는 그대로라 줄이 red reen blue가 된다.',
    sources: [anchorConceptId],
  },
  {
    id: 'word', label: 'dw',
    nodes: ['before', 'cmd-word', 'after-word'],
    paths: ['in-word', 'out-word'],
    notes: ['cursor'] as NoteId[],
    caption: 'dw는 커서 자리부터 다음 낱말이 시작하기 바로 앞까지 지운다. green과 그 뒤의 빈칸이 지워져 줄이 red blue가 된다.',
    sources: [anchorConceptId],
  },
  {
    id: 'end', label: 'D',
    nodes: ['before', 'cmd-end', 'after-end'],
    paths: ['in-end', 'out-end'],
    notes: ['cursor', 'front'] as NoteId[],
    caption: 'D는 커서 자리부터 줄 끝까지 지운다. green blue가 지워지고 커서 앞의 red와 그 뒤 빈칸 하나만 남는다.',
    sources: [anchorConceptId],
  },
  {
    id: 'line', label: 'dd',
    nodes: ['before', 'cmd-line', 'after-line'],
    paths: ['in-line', 'out-line'],
    notes: ['cursor'] as NoteId[],
    caption: 'dd는 커서가 있는 줄을 통째로 지운다. 커서가 줄의 어느 글자에 있든 줄 전체가 사라진다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 248]
const wideBox: [number, number, number, number] = [0, 0, 440, 192]

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

function nodeLabel(id: string) {
  return diagram().querySelector(`[data-node="${id}"] text`)!.textContent!
}

function shownIds(selector: string, attribute: string) {
  return Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)!)
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

// 글자 크기 9인 글자가 차지하는 상자. 반각 글자가 화면에서 더 넓게 그려지는 것을 생각해 폭을 1.15배로 잡는다.
function textBox(text: Element, id: string): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9) * 1.15
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id, x: left, y: y - 9, width, height: 9 }
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

// 선의 양 끝이 지정한 두 노드의 변에 닿고, 어떤 선분도 노드 안을 지나지 않는다.
function expectLine(line: Element, id: string, pair: [string, string]) {
  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  for (const segment of segments(line.getAttribute('d')!)) {
    for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
  }
  const { start, end } = lineEnds(line)
  expect(nodeAt(start), `${id} 시작`).toBe(pair[0])
  expect(nodeAt(end), `${id} 끝`).toBe(pair[1])
}

// 보이는 곁말이 지정한 id·글·자리이고, viewBox 안에서 노드·선·다른 곁말과 겹치지 않는다.
function expectNotes(ids: NoteId[], places: Record<NoteId, Note>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note')).sort()).toEqual([...ids].sort())
  const boxes = shown.map((note) => textBox(note, note.getAttribute('data-note')!))
  for (const note of shown) {
    const id = note.getAttribute('data-note')! as NoteId
    const box = textBox(note, id)
    expect(note.textContent).toBe(noteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', places[id].anchor)
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note.closest('[opacity]')).toBeNull()
    expect(box.x, id).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, id).toBeLessThanOrEqual(width)
    expect(box.y, id).toBeGreaterThanOrEqual(0)
    expect(box.y + box.height, id).toBeLessThanOrEqual(height)
    for (const node of nodeIds.map(nodeBox)) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const line of diagram().querySelectorAll('[data-path]')) {
      for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), `${id} ↔ 선`).toBe(false)
    }
    for (const other of boxes.filter((item) => item.id !== id)) expect(overlaps(box, other), `${id} ↔ ${other.id}`).toBe(false)
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
  await selectScenario(scenario.label)

  for (const element of diagram().querySelectorAll('[data-node]')) {
    const id = element.getAttribute('data-node')!
    expect(element, id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }

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
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다. 노드는 모두 회색이다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
  expect(diagram().querySelectorAll('rect')).toHaveLength(nodeIds.length)

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(node.querySelector('rect')).toHaveClass('stroke-disabled')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(label, 10) * 1.15 + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
  }
  for (let i = 0; i < nodeIds.length; i += 1) {
    for (let j = i + 1; j < nodeIds.length; j += 1) {
      expect(overlaps(nodeBox(nodeIds[i]), nodeBox(nodeIds[j])), `${nodeIds[i]} ↔ ${nodeIds[j]}`).toBe(false)
    }
  }
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

async function expectArrowEnds() {
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    for (const path of diagram().querySelectorAll('[data-path]')) {
      const id = path.getAttribute('data-path')!
      expectLine(path, id, ends[id])
    }
  }
}

// 그 시나리오의 화살표가 닿는 노드 — in-*의 끝은 명령, out-*의 끝은 그 명령 뒤의 줄이다.
function arrowTarget(prefix: 'in-' | 'out-') {
  const path = Array.from(diagram().querySelectorAll('[data-path]')).find((element) => element.getAttribute('data-path')!.startsWith(prefix))
  return path ? nodeAt(lineEnds(path).end) : undefined
}

// 요점: 시나리오마다 지우기 전의 줄 → 명령 → 명령 뒤의 줄로 이어지고, 뒤 줄은 커서 자리(green의 g)에서 계산한 결과와 같다.
// x는 g 한 글자만, dw는 green과 뒤 빈칸을, D는 커서부터 줄 끝을 지우고, dd 뒤에는 줄이 사라진다.
// 네 시나리오의 명령 노드와 뒤 줄 노드가 서로 다르고, 명령과 뒤 줄은 모두 본문에 있다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const line = nodeLabel('before')
  const cursor = line.indexOf('green')
  const nextWord = line.indexOf('blue')
  const expectedAfter: Record<string, string> = {
    x: line.slice(0, cursor) + line.slice(cursor + 1),
    dw: line.slice(0, cursor) + line.slice(nextWord),
    D: line.slice(0, cursor).trimEnd(),
  }
  const commands: string[] = []
  const afters: string[] = []

  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    const firstPath = diagram().querySelector('[data-path]')!
    expect(nodeAt(lineEnds(firstPath).start)).toBe('before')
    const command = arrowTarget('in-')!
    const after = arrowTarget('out-')!
    expect(nodeLabel(command)).toBe(label)
    commands.push(command)
    afters.push(after)
    if (label === 'dd') expect(nodeLabel(after)).toContain('사라')
    else expect(nodeLabel(after)).toBe(expectedAfter[label])
    expect(body).toContain(`\`${label}\``)
  }

  expect(expectedAfter.x).toBe('red reen blue')
  expect(nodeLabel('before')).not.toBe(expectedAfter.x)
  expect(new Set(commands).size).toBe(4)
  expect(new Set(afters).size).toBe(4)
  for (const id of ['before', 'after-char', 'after-word']) expect(body).toContain(`\`${nodeLabel(id)}\``)
  await selectScenario('D')
  expect(shownIds('[data-note]', 'data-note').sort()).toEqual(['cursor', 'front'])
}

async function expectUniqueMarkers() {
  render(<><ViEditCommandsDiagram /><ViEditCommandsDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'dw' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(2)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('ViEditCommandsDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<ViEditCommandsDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표 없이 늘 보이는 곁말과 선택 안내만 나온다', () => {
    const { container } = render(<ViEditCommandsDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expectNotes(fixedNotes, tallNotes, 280, 248)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<ViEditCommandsDiagram />)
    await expectScenario(scenario, tallArrows, tallNotes, 280, 248, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<ViEditCommandsDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(shownIds('[data-note]', 'data-note')).toEqual(fixedNotes)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('네 시나리오의 선명한 노드·화살표·곁말이 서로 다르다', () => {
    const keys = expectedScenarios.map(({ nodes, paths, notes }) => JSON.stringify([[...nodes].sort(), paths, [...notes].sort()]))
    expect(new Set(keys).size).toBe(expectedScenarios.length)
  })

  it('노드가 280×248 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<ViEditCommandsDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 248')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<ViEditCommandsDiagram />)
    await expectArrowEnds()
  })

  it('x는 g 한 글자만, dw는 green과 뒤 빈칸을, D는 커서부터 줄 끝을 지우고 dd 뒤에는 줄이 사라진다', async () => {
    render(<ViEditCommandsDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<ViEditCommandsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['vi-edit-commands']
    const ids = viEditCommandsScenarios.map(({ id }) => id).sort()
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
      const scenario = viEditCommandsScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 vi의 편집 명령 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
          const event = Object.assign(new Event('change'), { matches: nextMatches, media: mediaQuery.media })
          listeners.forEach((listener) => listener(event))
        },
      }
    }

    async function collectIds(selector: string, attribute: string) {
      const found = new Set<string>()
      for (const { label } of expectedScenarios) {
        await selectScenario(label)
        for (const id of shownIds(selector, attribute)) found.add(id)
      }
      return [...found].sort()
    }

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×192 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<ViEditCommandsDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 192')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('처음에는 늘 보이는 곁말이 가로형 자리에 나온다', () => {
      render(<ViEditCommandsDiagram />)
      expectNotes(fixedNotes, wideNotes, 440, 192)
    })

    it('노드 id 집합과 화살표·곁말 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<ViEditCommandsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 248')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')
      const tallNoteIds = await collectIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 192')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(tallNoteIds).toEqual(Object.keys(noteLabels).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
      expect(await collectIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
    })

    it('모든 rect가 440×192 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<ViEditCommandsDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<ViEditCommandsDiagram />)
      await expectScenario(scenario, wideArrows, wideNotes, 440, 192, container)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<ViEditCommandsDiagram />)
      await expectArrowEnds()
    })

    it('x는 g 한 글자만, dw는 green과 뒤 빈칸을, D는 커서부터 줄 끝을 지우고 dd 뒤에는 줄이 사라진다', async () => {
      render(<ViEditCommandsDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<ViEditCommandsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 248')
      await selectScenario('D')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: 'D' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['in-end', 'out-end'])
      expect(paths[0]).toHaveAttribute('d', wideArrows['in-end'])
      expect(diagram().querySelector('[data-note="front"]')).toHaveAttribute('x', String(wideNotes.front.x))
    })
  })
})
