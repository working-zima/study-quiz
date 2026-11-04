import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ChownChangeDiagram, chownChangeScenarios } from './ChownChangeDiagram'

const topicId = 'linux-permissions'
const anchorConceptId = `${topicId}.chown`
const labels = {
  before: '소유자 user1 · 그룹 dev',
  root: 'root',
  user1: 'user1',
  'cmd-root': 'chown user2:dev report.txt',
  'after-root': '소유자 user2 · 그룹 dev',
  'cmd-deny': 'chown user2 report.txt',
  'cmd-group': 'chown :ops report.txt',
  'after-group': '소유자 user1 · 그룹 ops',
}
const noteLabels = {
  'before-note': '바꾸기 전',
  'root-after-note': '바꾼 뒤',
  'deny-note': '거부 — 소유자는 그대로',
  'group-after-note': '바꾼 뒤',
}
type NoteId = keyof typeof noteLabels

const nodeIds = Object.keys(labels)
// 화살표가 잇는 두 노드.
const ends: Record<string, [string, string]> = {
  'root-cmd': ['root', 'cmd-root'],
  'root-after': ['cmd-root', 'after-root'],
  'deny-cmd': ['user1', 'cmd-deny'],
  'group-cmd': ['user1', 'cmd-group'],
  'group-after': ['cmd-group', 'after-group'],
}

const tallPaths: Record<string, string> = {
  'root-cmd': 'M64 96 H80',
  'root-after': 'M192 112 V136',
  'deny-cmd': 'M64 208 H80',
  'group-cmd': 'M36 224 V264 H80',
  'group-after': 'M192 280 V304',
}
const widePaths: Record<string, string> = {
  'root-cmd': 'M56 80 H72',
  'root-after': 'M256 80 H272',
  'deny-cmd': 'M56 136 H72',
  'group-cmd': 'M32 152 V192 H72',
  'group-after': 'M256 192 H272',
}

type Note = { x: number, y: number, anchor: 'start' | 'middle' | 'end' }
const tallNotes: Record<NoteId, Note> = {
  'before-note': { x: 176, y: 36, anchor: 'start' },
  'root-after-note': { x: 104, y: 156, anchor: 'end' },
  'deny-note': { x: 88, y: 240, anchor: 'start' },
  'group-after-note': { x: 104, y: 324, anchor: 'end' },
}
const wideNotes: Record<NoteId, Note> = {
  'before-note': { x: 264, y: 36, anchor: 'end' },
  'root-after-note': { x: 352, y: 112, anchor: 'middle' },
  'deny-note': { x: 272, y: 140, anchor: 'start' },
  'group-after-note': { x: 352, y: 224, anchor: 'middle' },
}

const question = '누가 파일의 주인을 바꿀 수 있을까?'
const idleCaption = '소유자 user1 · 그룹 dev는 바꾸기 전 report.txt의 소유자와 그룹이고, root와 user1이 저마다 chown 명령을 입력한다. 버튼을 고르면 누가 무엇을 바꿀 수 있고 바꾼 뒤 report.txt가 어떻게 되는지 볼 수 있다.'
const legend = '화살표는 명령을 입력하는 사람에서 명령으로, 명령에서 바꾼 뒤의 소유자와 그룹으로 간다. 명령 뒤로 화살표가 없으면 그 명령은 거부되어 아무것도 바뀌지 않는다.'
const figureName = 'root는 chown user2:dev report.txt로 report.txt의 소유자를 user2로 바꾸고, 소유자 user1은 chown user2 report.txt로 소유자를 넘기려 하면 거부되지만 chown :ops report.txt로 그룹을 ops로 바꿀 수 있는 것을 보이는 도식'
const svgName = '바꾸기 전 소유자 user1 · 그룹 dev가 있고, root가 입력하는 chown user2:dev report.txt와 그 뒤의 소유자 user2 · 그룹 dev, user1이 입력하는 chown user2 report.txt와 chown :ops report.txt, 그리고 그 뒤의 소유자 user1 · 그룹 ops가 있다'
const expectedScenarios = [
  {
    id: 'root-owner', label: 'root가 소유자 바꾸기',
    nodes: ['before', 'root', 'cmd-root', 'after-root'],
    paths: ['root-cmd', 'root-after'],
    notes: ['before-note', 'root-after-note'] as NoteId[],
    caption: 'root가 chown user2:dev report.txt를 입력하면 report.txt의 소유자가 user2로 바뀌고 그룹은 적은 대로 dev다. 파일의 소유자를 다른 사용자로 바꾸는 일은 root만 할 수 있다.',
    sources: [anchorConceptId],
  },
  {
    id: 'owner-denied', label: '소유자가 넘기려 하면',
    nodes: ['before', 'user1', 'cmd-deny'],
    paths: ['deny-cmd'],
    notes: ['before-note', 'deny-note'] as NoteId[],
    caption: '파일의 소유자 user1이 chown user2 report.txt로 자기 파일을 user2에게 넘기려 하면 시스템이 그 요청을 거부한다. 소유자라도 소유자를 남에게 넘길 수는 없어서, report.txt의 소유자는 user1 그대로다.',
    sources: [anchorConceptId],
  },
  {
    id: 'owner-group', label: '소유자가 그룹 바꾸기',
    nodes: ['before', 'user1', 'cmd-group', 'after-group'],
    paths: ['group-cmd', 'group-after'],
    notes: ['before-note', 'group-after-note'] as NoteId[],
    caption: 'user1은 ops 그룹에도 들어서, chown :ops report.txt로 자기 파일의 그룹을 ops로 바꿀 수 있다. 소유자는 그룹을 자기가 속한 그룹으로만 바꿀 수 있고, 소유자는 user1 그대로다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 344]
const wideBox: [number, number, number, number] = [0, 0, 440, 232]

// 「소유자 X · 그룹 Y」 라벨을 소유자와 그룹으로 나눈다.
function ownership(label: string) {
  const [, owner, group] = /^소유자 (\S+) · 그룹 (\S+)$/u.exec(label)!
  return { owner, group }
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

// 요점: 「소유자가 넘기려 하면」에서는 명령에서 나가는 화살표가 없고 「거부」 곁말이 보이며 바꾼 뒤 노드가 모두 흐리다.
// 「root가 소유자 바꾸기」의 뒤 노드는 소유자가 user2이고, 「소유자가 그룹 바꾸기」의 뒤 노드는 소유자가 user1 그대로이고 그룹만 ops다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const labelOf = (id: string) => diagram().querySelector(`[data-node="${id}"] text`)!.textContent!
  const opacity = (id: string) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')
  const before = ownership(labelOf('before'))

  await selectScenario('소유자가 넘기려 하면')
  const paths = Array.from(diagram().querySelectorAll('[data-path]'))
  expect(paths.map((path) => nodeAt(lineEnds(path).start))).not.toContain('cmd-deny')
  expect(paths.map((path) => nodeAt(lineEnds(path).end))).toEqual(['cmd-deny'])
  expect(Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.textContent).join(' ')).toContain('거부')
  expect(opacity('after-root')).toBe('0.25')
  expect(opacity('after-group')).toBe('0.25')
  expect(opacity('root')).toBe('0.25')

  await selectScenario('root가 소유자 바꾸기')
  const [rootCmd] = Array.from(diagram().querySelectorAll('[data-path]'))
  expect(nodeAt(lineEnds(rootCmd).start)).toBe('root')
  expect(ownership(labelOf('after-root')).owner).toBe('user2')
  expect(ownership(labelOf('after-root')).owner).not.toBe(before.owner)

  await selectScenario('소유자가 그룹 바꾸기')
  const [groupCmd] = Array.from(diagram().querySelectorAll('[data-path]'))
  expect(nodeAt(lineEnds(groupCmd).start)).toBe('user1')
  expect(ownership(labelOf('after-group'))).toEqual({ owner: before.owner, group: 'ops' })
  expect(before.group).not.toBe('ops')

  for (const command of ['cmd-root', 'cmd-deny', 'cmd-group']) expect(body, command).toContain(`\`${labelOf(command)}\``)
  expect(body).toContain('그 요청을 거부한다')
  expect(body).toContain('`ops` 그룹에도 든다')
}

async function expectUniqueMarkers() {
  render(<><ChownChangeDiagram /><ChownChangeDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'root가 소유자 바꾸기' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(2)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('ChownChangeDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<ChownChangeDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<ChownChangeDiagram />)

    expect(shownIds('[data-node]', 'data-node').sort()).toEqual([...nodeIds].sort())
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<ChownChangeDiagram />)
    await expectScenario(scenario, tallPaths, tallNotes, tallBox, container)
  })

  it('시나리오를 바꾸면 이전 화살표와 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<ChownChangeDiagram />)
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

  it('세 시나리오의 선명한 노드·화살표·곁말이 서로 다르다', () => {
    const keys = expectedScenarios.map(({ nodes, paths, notes }) => JSON.stringify([[...nodes].sort(), [...paths].sort(), [...notes].sort()]))
    expect(new Set(keys).size).toBe(expectedScenarios.length)
  })

  it('노드가 280×344 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<ChownChangeDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 344')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  it('소유자가 넘기는 명령은 거부되고, root는 소유자를, 소유자는 그룹만 바꾼다', async () => {
    render(<ChownChangeDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<ChownChangeDiagram />)
    const text = visualsByTopicId[topicId].diagrams['chown-change']
    const ids = chownChangeScenarios.map(({ id }) => id).sort()
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
      const scenario = chownChangeScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 chown 명령 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×232 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<ChownChangeDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 232')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드 id 집합과 경로·곁말 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<ChownChangeDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 344')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')
      const tallNoteIds = await collectIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 232')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallPaths).sort())
      expect(tallNoteIds).toEqual(Object.keys(noteLabels).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
      expect(await collectIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
    })

    it('노드가 440×232 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<ChownChangeDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<ChownChangeDiagram />)
      await expectScenario(scenario, widePaths, wideNotes, wideBox, container)
    })

    it('소유자가 넘기는 명령은 거부되고, root는 소유자를, 소유자는 그룹만 바꾼다', async () => {
      render(<ChownChangeDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<ChownChangeDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 344')
      await selectScenario('소유자가 그룹 바꾸기')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '소유자가 그룹 바꾸기' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownIds('[data-path]', 'data-path')).toEqual(['group-cmd', 'group-after'])
      expect(diagram().querySelector('[data-path="group-cmd"]')).toHaveAttribute('d', widePaths['group-cmd'])
    })
  })
})
