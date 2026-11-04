import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { SymbolicModeDiagram, symbolicModeScenarios } from './SymbolicModeDiagram'

const topicId = 'linux-permissions'
const anchorConceptId = `${topicId}.symbolic-mode`
const labels = {
  before: '-rw-r--r--',
  'cmd-plus': 'chmod g+w report.txt',
  'after-plus': '-rw-rw-r--',
  'cmd-equals': 'chmod g=w report.txt',
  'after-equals': '-rw--w-r--',
  'cmd-minus': 'chmod o-r report.txt',
  'after-minus': '-rw-r-----',
}
const noteLabels = {
  'before-note': '바꾸기 전',
  'plus-note': '그룹에 쓰기가 더해짐',
  'equals-note': '그룹의 읽기가 지워짐',
  'minus-note': '그 밖의 읽기가 빠짐',
}
type NoteId = keyof typeof noteLabels

const nodeIds = Object.keys(labels)
// 화살표가 잇는 두 노드.
const ends: Record<string, [string, string]> = {
  'to-plus': ['before', 'cmd-plus'],
  'out-plus': ['cmd-plus', 'after-plus'],
  'to-equals': ['before', 'cmd-equals'],
  'out-equals': ['cmd-equals', 'after-equals'],
  'to-minus': ['before', 'cmd-minus'],
  'out-minus': ['cmd-minus', 'after-minus'],
}

const tallPaths: Record<string, string> = {
  'to-plus': 'M20 48 V88 H32',
  'out-plus': 'M176 88 H192',
  'to-equals': 'M20 48 V144 H32',
  'out-equals': 'M176 144 H192',
  'to-minus': 'M20 48 V200 H32',
  'out-minus': 'M176 200 H192',
}
const widePaths: Record<string, string> = {
  'to-plus': 'M96 88 H112 V32 H128',
  'out-plus': 'M288 32 H320',
  'to-equals': 'M96 88 H128',
  'out-equals': 'M288 88 H320',
  'to-minus': 'M96 88 H112 V144 H128',
  'out-minus': 'M288 144 H320',
}

type Note = { x: number, y: number, anchor: 'start' | 'middle' | 'end' }
const tallNotes: Record<NoteId, Note> = {
  'before-note': { x: 104, y: 36, anchor: 'start' },
  'plus-note': { x: 272, y: 124, anchor: 'end' },
  'equals-note': { x: 272, y: 180, anchor: 'end' },
  'minus-note': { x: 272, y: 236, anchor: 'end' },
}
const wideNotes: Record<NoteId, Note> = {
  'before-note': { x: 52, y: 64, anchor: 'middle' },
  'plus-note': { x: 416, y: 62, anchor: 'end' },
  'equals-note': { x: 416, y: 118, anchor: 'end' },
  'minus-note': { x: 416, y: 174, anchor: 'end' },
}

const question = 'g+w와 g=w는 무엇이 다를까?'
const idleCaption = '-rw-r--r--는 바꾸기 전 report.txt의 권한이고, 나머지 세 줄은 저마다 다른 기호 모드의 명령과 그 명령을 입력한 뒤의 권한이다. 버튼을 고르면 그 명령이 권한의 어느 몫을 어떻게 바꾸는지 볼 수 있다.'
const legend = '화살표는 바꾸기 전의 권한에서 명령을 거쳐 그 명령을 입력한 뒤의 권한으로 간다. 세 명령은 모두 같은 -rw-r--r--에서 시작한다.'
const figureName = 'chmod g+w·g=w·o-r report.txt가 report.txt의 권한 -rw-r--r--를 각각 -rw-rw-r--, -rw--w-r--, -rw-r-----로 바꾸는 것을 보이는 도식'
const svgName = '바꾸기 전 권한 -rw-r--r--가 있고, 명령 chmod g+w report.txt와 그 뒤의 권한 -rw-rw-r--, 명령 chmod g=w report.txt와 그 뒤의 권한 -rw--w-r--, 명령 chmod o-r report.txt와 그 뒤의 권한 -rw-r-----가 한 줄씩 있다'
const expectedScenarios = [
  {
    id: 'plus', label: 'g+w',
    nodes: ['before', 'cmd-plus', 'after-plus'],
    paths: ['to-plus', 'out-plus'],
    notes: ['before-note', 'plus-note'] as NoteId[],
    caption: 'chmod g+w report.txt를 입력하면 그룹 몫 r--에 쓰기만 더해져 rw-가 되고, 권한은 -rw-rw-r--가 된다. +는 적은 권한을 더하기만 하므로 그룹에 있던 읽기와 소유자·그 밖의 사용자의 몫은 그대로다.',
    sources: [anchorConceptId],
  },
  {
    id: 'equals', label: 'g=w',
    nodes: ['before', 'cmd-equals', 'after-equals'],
    paths: ['to-equals', 'out-equals'],
    notes: ['before-note', 'equals-note'] as NoteId[],
    caption: 'chmod g=w report.txt를 입력하면 그룹 몫을 쓰기 하나로 새로 정해 -w-가 되고, 권한은 -rw--w-r--가 된다. =는 그룹 몫에서 적지 않은 권한을 지우므로 그룹에 있던 읽기가 사라진다.',
    sources: [anchorConceptId],
  },
  {
    id: 'minus', label: 'o-r',
    nodes: ['before', 'cmd-minus', 'after-minus'],
    paths: ['to-minus', 'out-minus'],
    notes: ['before-note', 'minus-note'] as NoteId[],
    caption: 'chmod o-r report.txt를 입력하면 그 밖의 사용자의 몫에서 읽기가 빠져 ---가 되고, 권한은 -rw-r-----가 된다. -는 적은 권한만 빼고 소유자와 그룹의 몫은 그대로 둔다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 248]
const wideBox: [number, number, number, number] = [0, 0, 440, 184]

// 권한 문자열에 기호 모드 하나(누구 + 연산 하나 + 권한)를 적용한다.
// +는 적은 권한을 켜고, -는 끄고, =는 적은 부류의 몫을 모두 끈 뒤 적은 권한만 켠다.
function applySymbolic(permissions: string, mode: string) {
  const [, who, operator, what] = /^([ugoa]+)([+=-])([rwx]*)$/u.exec(mode)!
  const classes = who.includes('a') ? 'ugo' : who
  const chars = [...permissions]
  for (const [index, cls] of ['u', 'g', 'o'].entries()) {
    if (!classes.includes(cls)) continue
    for (const [offset, letter] of ['r', 'w', 'x'].entries()) {
      const position = 1 + index * 3 + offset
      if (operator === '+' && what.includes(letter)) chars[position] = letter
      if (operator === '-' && what.includes(letter)) chars[position] = '-'
      if (operator === '=') chars[position] = what.includes(letter) ? letter : '-'
    }
  }
  return chars.join('')
}

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

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

// 글자 크기 9인 글이 차지하는 상자. 반각 글자가 화면에서 더 넓게 그려지는 것을 생각해 폭을 1.15배로 잡는다.
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
function expectNotes(ids: NoteId[], places: Record<NoteId, Note>, viewBox: [number, number, number, number]) {
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
    expect(boxesOutsideViewBox([box], viewBox), id).toEqual([])
    for (const node of nodeIds.map(nodeBox)) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const other of boxes.filter((item) => item.id !== id)) expect(overlaps(box, other), `${id} ↔ ${other.id}`).toBe(false)
    for (const line of diagram().querySelectorAll('[data-path]')) {
      for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), `${id} ↔ 선`).toBe(false)
    }
  }
}

async function expectScenario(
  scenario: typeof expectedScenarios[number],
  arrows: Record<string, string>,
  places: Record<NoteId, Note>,
  viewBox: [number, number, number, number],
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
    const id = path.getAttribute('data-path')!
    expect(path).toHaveAttribute('d', arrows[id])
    expect(path).toHaveAttribute('stroke-width', '2')
    expect(path).toHaveAttribute('marker-end', `url(#${diagram().querySelector('marker')!.id})`)
    expect(path).toHaveClass('stroke-title')
    expect(path.closest('[opacity]')).toBeNull()
    expectLine(path, id, ends[id])
  }
  expectNotes(scenario.notes, places, viewBox)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다. 노드는 모두 회색이다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])

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

// 요점: 시나리오마다 뒤 노드의 권한 문자열은 앞 노드의 권한 문자열에 그 명령의 기호 모드를 적용한 결과와 같다.
// g+w와 g=w는 같은 쓰기를 적었는데도 결과가 다르고, g=w에서 그룹의 읽기 자리가 지워진다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const labelOf = (id: string) => diagram().querySelector(`[data-node="${id}"] text`)!.textContent!
  const before = labelOf('before')

  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    const [, command, after] = scenario.nodes
    const mode = labelOf(command).split(' ')[1]
    expect(mode, scenario.id).toBe(scenario.label)
    expect(labelOf(after), scenario.id).toBe(applySymbolic(before, mode))
    const [toCommand, toAfter] = Array.from(diagram().querySelectorAll('[data-path]'))
    expect(nodeAt(lineEnds(toCommand).start)).toBe('before')
    expect(nodeAt(lineEnds(toCommand).end)).toBe(command)
    expect(nodeAt(lineEnds(toAfter).start)).toBe(command)
    expect(nodeAt(lineEnds(toAfter).end)).toBe(after)
    expect(body, scenario.id).toContain(`\`${labelOf(command)}\``)
    expect(body, scenario.id).toContain(`\`${labelOf(after)}\``)
  }

  expect(labelOf('after-plus')).not.toBe(labelOf('after-equals'))
  expect(labelOf('after-plus')[4]).toBe('r')
  expect(labelOf('after-equals')[4]).toBe('-')
  expect(body).toContain('`-rw-r--r--`')
}

async function expectUniqueMarkers() {
  render(<><SymbolicModeDiagram /><SymbolicModeDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'g=w' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(2)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('SymbolicModeDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<SymbolicModeDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<SymbolicModeDiagram />)

    expect(shownIds('[data-node]', 'data-node').sort()).toEqual([...nodeIds].sort())
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<SymbolicModeDiagram />)
    await expectScenario(scenario, tallPaths, tallNotes, tallBox, container)
  })

  it('시나리오를 바꾸면 이전 화살표와 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<SymbolicModeDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('세 시나리오의 선명한 노드·화살표·곁말이 서로 다르고, 명령과 뒤 노드를 하나도 함께 쓰지 않는다', () => {
    const keys = expectedScenarios.map(({ nodes, paths, notes }) => JSON.stringify([[...nodes].sort(), [...paths].sort(), [...notes].sort()]))
    expect(new Set(keys).size).toBe(expectedScenarios.length)
    const own = expectedScenarios.map(({ nodes }) => nodes.filter((id) => id !== 'before'))
    expect(new Set(own.flat()).size).toBe(own.flat().length)
  })

  it('노드가 280×248 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<SymbolicModeDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 248')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  it('뒤 권한은 앞 권한에 그 명령의 기호 모드를 적용한 결과이고, g+w와 g=w의 결과가 다르다', async () => {
    render(<SymbolicModeDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<SymbolicModeDiagram />)
    const text = visualsByTopicId[topicId].diagrams['symbolic-mode']
    const ids = symbolicModeScenarios.map(({ id }) => id).sort()
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
      const scenario = symbolicModeScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 chmod의 기호 모드 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×184 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<SymbolicModeDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 184')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드 id 집합과 경로·곁말 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<SymbolicModeDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 248')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')
      const tallNoteIds = await collectIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 184')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallPaths).sort())
      expect(tallNoteIds).toEqual(Object.keys(noteLabels).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
      expect(await collectIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
    })

    it('노드가 440×184 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<SymbolicModeDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<SymbolicModeDiagram />)
      await expectScenario(scenario, widePaths, wideNotes, wideBox, container)
    })

    it('뒤 권한은 앞 권한에 그 명령의 기호 모드를 적용한 결과이고, g+w와 g=w의 결과가 다르다', async () => {
      render(<SymbolicModeDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<SymbolicModeDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 248')
      await selectScenario('g=w')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: 'g=w' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownIds('[data-path]', 'data-path')).toEqual(['to-equals', 'out-equals'])
      expect(diagram().querySelector('[data-path="to-equals"]')).toHaveAttribute('d', widePaths['to-equals'])
    })
  })
})
