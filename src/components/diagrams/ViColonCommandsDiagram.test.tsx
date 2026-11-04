import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ViColonCommandsDiagram, viColonCommandsScenarios } from './ViColonCommandsDiagram'

const topicId = 'linux-shell'
const anchorConceptId = `${topicId}.vi-colon-commands`
const labels = {
  before: 'memo.txt',
  'cmd-write': ':w',
  'after-write': '저장됨, vi는 그대로',
  'cmd-quit': ':q',
  'after-quit': '끝나지 않음',
  'cmd-force-quit': ':q!',
  'after-force-quit': '바뀜을 버리고 끝남',
  'cmd-write-quit': ':wq',
  'after-write-quit': '저장하고 끝남',
}
const noteLabels = {
  unsaved: '고친 내용이 아직 저장되지 않음',
  error: '오류로 처리',
}
type NoteId = keyof typeof noteLabels
// 늘 보이는 곁말 — 파일을 고친 뒤 아직 저장하지 않았다는 것은 시나리오와 상관없이 보인다.
const fixedNotes: NoteId[] = ['unsaved']

const nodeIds = Object.keys(labels)

const tallArrows: Record<string, string> = {
  'in-write': 'M24 24 H12 V80 H24',
  'out-write': 'M64 80 H80',
  'in-quit': 'M24 24 H12 V128 H24',
  'out-quit': 'M64 128 H80',
  'in-force-quit': 'M24 24 H12 V176 H24',
  'out-force-quit': 'M64 176 H80',
  'in-write-quit': 'M24 24 H12 V224 H24',
  'out-write-quit': 'M64 224 H80',
}
const wideArrows: Record<string, string> = {
  'in-write': 'M80 88 H168 V24 H184',
  'out-write': 'M224 24 H240',
  'in-quit': 'M80 88 H168 V72 H184',
  'out-quit': 'M224 72 H240',
  'in-force-quit': 'M80 88 H168 V120 H184',
  'out-force-quit': 'M224 120 H240',
  'in-write-quit': 'M80 88 H168 V168 H184',
  'out-write-quit': 'M224 168 H240',
}
// 화살표마다 출발 노드와 도착 노드. in-*은 아직 저장하지 않은 파일에서 명령으로, out-*은 명령에서 그 결과로 간다.
const ends: Record<string, [string, string]> = {
  'in-write': ['before', 'cmd-write'],
  'out-write': ['cmd-write', 'after-write'],
  'in-quit': ['before', 'cmd-quit'],
  'out-quit': ['cmd-quit', 'after-quit'],
  'in-force-quit': ['before', 'cmd-force-quit'],
  'out-force-quit': ['cmd-force-quit', 'after-force-quit'],
  'in-write-quit': ['before', 'cmd-write-quit'],
  'out-write-quit': ['cmd-write-quit', 'after-write-quit'],
}

type Note = { x: number, y: number, anchor: 'start' | 'middle' | 'end' }
const tallNotes: Record<NoteId, Note> = {
  unsaved: { x: 104, y: 28, anchor: 'start' },
  error: { x: 214, y: 132, anchor: 'start' },
}
const wideNotes: Record<NoteId, Note> = {
  unsaved: { x: 8, y: 124, anchor: 'start' },
  error: { x: 374, y: 76, anchor: 'start' },
}

const question = '저장하지 않고 끝내려면 무엇을 입력할까?'
const idleCaption = 'vi로 연 memo.txt를 고쳤지만 아직 저장하지 않았다. 버튼을 고르면 명령 모드에서 :를 누르고 :w·:q·:q!·:wq를 입력했을 때 어떻게 되는지 볼 수 있다.'
const legend = '화살표는 아직 저장하지 않은 파일에서 명령으로, 명령에서 그 명령의 결과로 간다.'
const figureName = '고친 내용을 아직 저장하지 않은 memo.txt에서 :w, :q, :q!, :wq를 입력하면 저장되는지, vi가 끝나는지를 명령마다 보이는 도식'
const svgName = '아직 저장하지 않은 memo.txt 아래에 :w, :q, :q!, :wq 명령과 그 명령의 결과가 놓여 있다'
const expectedScenarios = [
  {
    id: 'write', label: ':w',
    nodes: ['before', 'cmd-write', 'after-write'],
    paths: ['in-write', 'out-write'],
    notes: ['unsaved'] as NoteId[],
    caption: ':w는 고친 내용을 memo.txt에 쓴다. 저장한 뒤에도 vi는 끝나지 않고 그대로 열려 있어 이어서 고칠 수 있다.',
    sources: [anchorConceptId],
  },
  {
    id: 'quit', label: ':q',
    nodes: ['before', 'cmd-quit', 'after-quit'],
    paths: ['in-quit', 'out-quit'],
    notes: ['unsaved', 'error'] as NoteId[],
    caption: '마지막으로 저장한 뒤 바뀐 내용이 있으므로 :q를 오류로 처리해 끝내지 않는다. 고친 내용은 vi 안에 그대로 남는다.',
    sources: [anchorConceptId],
  },
  {
    id: 'force-quit', label: ':q!',
    nodes: ['before', 'cmd-force-quit', 'after-force-quit'],
    paths: ['in-force-quit', 'out-force-quit'],
    notes: ['unsaved'] as NoteId[],
    caption: ':q!는 바뀐 내용이 있는지 따지지 않고 vi를 끝낸다. 고친 것은 파일에 쓰이지 않고 버려져, memo.txt는 마지막으로 저장한 때의 내용으로 남는다.',
    sources: [anchorConceptId],
  },
  {
    id: 'write-quit', label: ':wq',
    nodes: ['before', 'cmd-write-quit', 'after-write-quit'],
    paths: ['in-write-quit', 'out-write-quit'],
    notes: ['unsaved'] as NoteId[],
    caption: ':wq는 고친 내용을 memo.txt에 쓴 다음 vi를 끝낸다. 고친 것을 남기고 끝내려면 이 명령을 쓴다.',
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

// 그 시나리오의 화살표가 닿는 노드 — in-*의 끝은 명령, out-*의 끝은 그 명령의 결과다.
function arrowTarget(prefix: 'in-' | 'out-') {
  const path = Array.from(diagram().querySelectorAll('[data-path]')).find((element) => element.getAttribute('data-path')!.startsWith(prefix))
  return path ? nodeAt(lineEnds(path).end) : undefined
}

// 요점: 시나리오마다 아직 저장하지 않은 파일 → 명령 → 그 결과로 이어진다. :q의 결과는 끝나지 않는 것이고 오류로 처리한다는 곁말이 붙으며,
// :q!의 결과는 바뀜을 버리고 끝나는 것이다. 네 시나리오의 명령 노드와 결과 노드가 서로 다르고, 명령은 모두 본문에 있다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const commands: string[] = []
  const results: Record<string, string> = {}

  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    const firstPath = diagram().querySelector('[data-path]')!
    expect(nodeAt(lineEnds(firstPath).start)).toBe('before')
    const command = arrowTarget('in-')!
    const result = arrowTarget('out-')!
    expect(nodeLabel(command)).toBe(label)
    commands.push(command)
    results[label] = nodeLabel(result)
    expect(body).toContain(`\`${label}\``)
    if (label === ':q') expect(shownIds('[data-note]', 'data-note').sort()).toEqual(['error', 'unsaved'])
    else expect(shownIds('[data-note]', 'data-note')).toEqual(['unsaved'])
  }

  expect(results[':q']).toContain('끝나지 않')
  expect(results[':q!']).toContain('버리')
  expect(results[':q!']).not.toContain('저장')
  expect(results[':w']).not.toContain('끝남')
  expect(results[':wq']).toContain('저장')
  expect(results[':wq']).toContain('끝남')
  expect(new Set(commands).size).toBe(4)
  expect(new Set(Object.values(results)).size).toBe(4)
}

async function expectUniqueMarkers() {
  render(<><ViColonCommandsDiagram /><ViColonCommandsDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: ':q' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(2)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('ViColonCommandsDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<ViColonCommandsDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표 없이 늘 보이는 곁말과 선택 안내만 나온다', () => {
    const { container } = render(<ViColonCommandsDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expectNotes(fixedNotes, tallNotes, 280, 248)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<ViColonCommandsDiagram />)
    await expectScenario(scenario, tallArrows, tallNotes, 280, 248, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<ViColonCommandsDiagram />)
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
    render(<ViColonCommandsDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 248')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<ViColonCommandsDiagram />)
    await expectArrowEnds()
  })

  it(':q는 끝나지 않고 오류로 처리하며, :q!는 바뀜을 버리고 끝낸다', async () => {
    render(<ViColonCommandsDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<ViColonCommandsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['vi-colon-commands']
    const ids = viColonCommandsScenarios.map(({ id }) => id).sort()
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
      const scenario = viColonCommandsScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 vi의 콜론 명령 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
      render(<ViColonCommandsDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 192')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('처음에는 늘 보이는 곁말이 가로형 자리에 나온다', () => {
      render(<ViColonCommandsDiagram />)
      expectNotes(fixedNotes, wideNotes, 440, 192)
    })

    it('노드 id 집합과 화살표·곁말 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<ViColonCommandsDiagram />)
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
      render(<ViColonCommandsDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<ViColonCommandsDiagram />)
      await expectScenario(scenario, wideArrows, wideNotes, 440, 192, container)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<ViColonCommandsDiagram />)
      await expectArrowEnds()
    })

    it(':q는 끝나지 않고 오류로 처리하며, :q!는 바뀜을 버리고 끝낸다', async () => {
      render(<ViColonCommandsDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<ViColonCommandsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 248')
      await selectScenario(':q')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: ':q' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['in-quit', 'out-quit'])
      expect(paths[0]).toHaveAttribute('d', wideArrows['in-quit'])
      expect(diagram().querySelector('[data-note="error"]')).toHaveAttribute('x', String(wideNotes.error.x))
    })
  })
})
