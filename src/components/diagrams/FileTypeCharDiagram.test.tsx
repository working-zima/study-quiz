import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { FileTypeCharDiagram, fileTypeCharScenarios } from './FileTypeCharDiagram'

const topicId = 'linux-permissions'
const anchorConceptId = `${topicId}.file-type-char`
const labels = {
  'type-report': '-',
  'type-report2': '-',
  'type-latest': 'l',
  'type-docs': 'd',
  'type-sda': 'b',
  'name-report': 'report.txt',
  'name-report2': 'report2.txt',
  'name-latest': 'latest',
  'name-docs': 'docs',
  'name-sda': '/dev/sda',
}
const groupLabels = { chars: '첫 글자', names: '이름' }
const noteLabels = {
  'hard-note': '같은 파일의',
  'hard-note-2': '두 이름',
  'sym-note': '가리킨다',
  'dir-note': '디렉터리',
  'dev-note': '블록 장치',
}
type GroupId = keyof typeof groupLabels
type NoteId = keyof typeof noteLabels

const nodeIds = Object.keys(labels)
// 표의 줄 다섯. 줄마다 첫 글자 칸과 이름 칸이 같은 높이에 선다.
const rows = ['report', 'report2', 'latest', 'docs', 'sda']
const members: Record<GroupId, string[]> = {
  chars: rows.map((row) => `type-${row}`),
  names: rows.map((row) => `name-${row}`),
}
// 화살표가 잇는 두 노드 — 심볼릭 링크 latest에서 그것이 가리키는 report.txt로.
const ends: Record<string, [string, string]> = {
  'to-target': ['name-latest', 'name-report'],
}

type Group = { x: number, y: number, width: number, height: number, labelX: number, labelY: number }
const tallGroups: Record<GroupId, Group> = {
  chars: { x: 8, y: 8, width: 48, height: 220, labelX: 14, labelY: 22 },
  names: { x: 64, y: 8, width: 104, height: 220, labelX: 72, labelY: 22 },
}
const wideGroups: Record<GroupId, Group> = {
  chars: { x: 8, y: 8, width: 72, height: 220, labelX: 16, labelY: 22 },
  names: { x: 96, y: 8, width: 144, height: 220, labelX: 104, labelY: 22 },
}

const tallPaths = { 'to-target': 'M160 124 H180 V44 H160' }
const widePaths = { 'to-target': 'M224 124 H256 V44 H224' }

type Note = { x: number, y: number, anchor: 'start' | 'middle' | 'end' }
const tallNotes: Record<NoteId, Note> = {
  'hard-note': { x: 188, y: 62, anchor: 'start' },
  'hard-note-2': { x: 188, y: 74, anchor: 'start' },
  'sym-note': { x: 188, y: 88, anchor: 'start' },
  'dir-note': { x: 188, y: 168, anchor: 'start' },
  'dev-note': { x: 188, y: 208, anchor: 'start' },
}
const wideNotes: Record<NoteId, Note> = {
  'hard-note': { x: 272, y: 62, anchor: 'start' },
  'hard-note-2': { x: 272, y: 74, anchor: 'start' },
  'sym-note': { x: 272, y: 88, anchor: 'start' },
  'dir-note': { x: 272, y: 168, anchor: 'start' },
  'dev-note': { x: 272, y: 208, anchor: 'start' },
}

const question = '첫 글자만 보고 무엇인지 알 수 있을까?'
const idleCaption = 'ls -l로 본 줄 다섯에서 첫 글자와 이름만 옮겨 놓았다. 버튼을 고르면 하드 링크, 심볼릭 링크, 디렉터리와 장치가 첫 글자에 어떻게 나타나는지 볼 수 있다.'
const legend = '한 줄이 ls -l의 줄 하나다. 왼쪽 열은 그 줄의 첫 글자, 오른쪽 열은 이름이다. 화살표는 심볼릭 링크가 가리키는 파일로 간다.'
const figureName = 'ls -l로 본 줄 다섯의 첫 글자와 이름을 표로 놓고, 하드 링크 report2.txt는 원래 파일 report.txt와 같은 -로, 심볼릭 링크 latest는 l로, 디렉터리 docs는 d로, 디스크 장치 파일 /dev/sda는 b로 보인다는 것을 보이는 도식'
const svgName = '첫 글자 열과 이름 열이 있는 표에 - report.txt, - report2.txt, l latest, d docs, b /dev/sda 다섯 줄이 있다'
const expectedScenarios = [
  {
    id: 'hard-link', label: '하드 링크',
    nodes: ['type-report', 'name-report', 'type-report2', 'name-report2'],
    paths: [] as string[],
    notes: ['hard-note', 'hard-note-2'] as NoteId[],
    caption: 'ln report.txt report2.txt로 만든 하드 링크 report2.txt는 report.txt와 같은 파일에 붙은 또 하나의 이름이다. 하드 링크는 따로 된 종류가 아니라서 두 줄 모두 일반 파일의 -로 시작한다.',
    sources: [anchorConceptId],
  },
  {
    id: 'symlink', label: '심볼릭 링크',
    nodes: ['type-latest', 'name-latest', 'type-report', 'name-report'],
    paths: ['to-target'],
    notes: ['sym-note'] as NoteId[],
    caption: 'ln -s report.txt latest로 만든 심볼릭 링크 latest는 report.txt의 경로를 담아 그 파일을 가리키는 따로 된 파일이다. 그래서 latest의 줄은 심볼릭 링크를 뜻하는 l로 시작한다.',
    sources: [anchorConceptId],
  },
  {
    id: 'others', label: '디렉터리와 장치',
    nodes: ['type-docs', 'name-docs', 'type-sda', 'name-sda'],
    paths: [] as string[],
    notes: ['dir-note', 'dev-note'] as NoteId[],
    caption: '디렉터리 docs의 줄은 d로 시작한다. 디스크를 가리키는 장치 파일 /dev/sda는 데이터를 한 덩어리씩 읽고 쓰는 블록 장치라 그 줄이 b로 시작한다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 236]
const wideBox: [number, number, number, number] = [0, 0, 440, 236]

function diagram() {
  return screen.getByRole('img', { name: svgName })
}

async function selectScenario(label: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) })
}

function readBox(rect: Element): SvgBox {
  return {
    id: rect.parentElement?.getAttribute('data-node') ?? rect.getAttribute('data-group') ?? '',
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

function nodeBox(id: string) {
  return readBox(diagram().querySelector(`[data-node="${id}"] rect`)!)
}

function groupBox(id: GroupId) {
  return readBox(diagram().querySelector(`[data-group="${id}"]`)!)
}

function shownIds(selector: string, attribute: string) {
  return Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)!)
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function contains(outer: SvgBox, inner: SvgBox) {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height
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

function groupLabelBox(id: GroupId) {
  return textBox(diagram().querySelector(`[data-group-label="${id}"]`)!, `${id}-label`)
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

// 화살표의 양 끝이 지정한 두 노드의 변에 닿고, 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다.
function expectLine(line: Element, id: string, pair: [string, string]) {
  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  for (const segment of segments(line.getAttribute('d')!)) {
    for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const group of Object.keys(groupLabels) as GroupId[]) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
  }
  const { start, end } = lineEnds(line)
  expect(nodeAt(start), `${id} 시작`).toBe(pair[0])
  expect(nodeAt(end), `${id} 끝`).toBe(pair[1])
}

// 보이는 곁말이 지정한 id·글·자리이고, viewBox 안에서 노드·그룹 라벨·선·다른 곁말과 겹치지 않는다.
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
    for (const group of Object.keys(groupLabels) as GroupId[]) expect(overlaps(box, groupLabelBox(group)), `${id} ↔ ${group}`).toBe(false)
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
  for (const group of Object.keys(groupLabels)) {
    expect(diagram().querySelector(`[data-group="${group}"]`)!.closest('[opacity]'), group).toBeNull()
    expect(diagram().querySelector(`[data-group-label="${group}"]`)!.closest('[opacity]'), group).toBeNull()
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

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다.
// 그룹 테두리는 정한 노드만 담고, 그룹 라벨은 자기 테두리 안에서 노드와 겹치지 않는다. 노드는 모두 회색이다.
function expectFits(viewBox: [number, number, number, number], groups: Record<GroupId, Group>) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length + Object.keys(groupLabels).length)
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
  // 한 줄의 첫 글자 칸과 이름 칸은 같은 높이에 선다.
  for (const row of rows) expect(nodeBox(`type-${row}`).y, row).toBe(nodeBox(`name-${row}`).y)

  for (const [id, group] of Object.entries(groups) as [GroupId, Group][]) {
    const rect = diagram().querySelector(`[data-group="${id}"]`)!
    expect(rect).toHaveAttribute('x', String(group.x))
    expect(rect).toHaveAttribute('y', String(group.y))
    expect(rect).toHaveAttribute('width', String(group.width))
    expect(rect).toHaveAttribute('height', String(group.height))
    for (const node of nodeIds) expect(contains(groupBox(id), nodeBox(node)), `${id} ⊃ ${node}`).toBe(members[id].includes(node))

    const labelText = diagram().querySelector(`[data-group-label="${id}"]`)!
    expect(labelText.textContent).toBe(groupLabels[id])
    expect(labelText).toHaveAttribute('x', String(group.labelX))
    expect(labelText).toHaveAttribute('y', String(group.labelY))
    expect(labelText).toHaveAttribute('font-size', '9')
    const label = groupLabelBox(id)
    expect(contains(groupBox(id), label), `${id} 라벨`).toBe(true)
    for (const node of nodeIds) expect(overlaps(label, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
  }
  expect(overlaps(groupBox('chars'), groupBox('names'))).toBe(false)
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 요점: 「하드 링크」에서 선명한 두 줄의 첫 글자가 모두 -다(하드 링크에는 따로 된 글자가 없다).
// 「심볼릭 링크」의 화살표는 latest 줄에서 시작해 report.txt 줄에서 끝나고, latest 줄의 첫 글자는 l이다.
// 「디렉터리와 장치」에서는 첫 글자가 -인 줄이 모두 흐리다. 곁말은 자기 줄 곁에 선다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const labelOf = (id: string) => diagram().querySelector(`[data-node="${id}"] text`)!.textContent
  const bright = () => Array.from(diagram().querySelectorAll('[data-node][opacity="1"]'), (element) => element.getAttribute('data-node')!)

  await selectScenario('하드 링크')
  const hardTypes = bright().filter((id) => id.startsWith('type-'))
  expect(hardTypes.sort()).toEqual(['type-report', 'type-report2'])
  for (const id of hardTypes) expect(labelOf(id), id).toBe('-')
  expect(bright().filter((id) => id.startsWith('name-')).map(labelOf).sort()).toEqual(['report.txt', 'report2.txt'])
  expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)

  await selectScenario('심볼릭 링크')
  const paths = Array.from(diagram().querySelectorAll('[data-path]'))
  expect(paths).toHaveLength(1)
  const { start, end } = lineEnds(paths[0])
  expect(labelOf(nodeAt(start)!)).toBe('latest')
  expect(labelOf(nodeAt(end)!)).toBe('report.txt')
  expect(labelOf('type-latest')).toBe('l')
  expect(nodeBox('type-latest').y).toBe(nodeBox('name-latest').y)

  await selectScenario('디렉터리와 장치')
  for (const id of nodeIds.filter((item) => labelOf(item) === '-')) {
    expect(diagram().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', '0.25')
  }
  for (const [note, row] of [['dir-note', 'docs'], ['dev-note', 'sda']] as const) {
    const y = Number(diagram().querySelector(`[data-note="${note}"]`)!.getAttribute('y'))
    const box = nodeBox(`name-${row}`)
    expect(y, note).toBeGreaterThan(box.y)
    expect(y, note).toBeLessThanOrEqual(box.y + box.height)
  }

  expect(body).toContain('`report.txt`가 일반 파일이라 그 줄이 `-`로 시작한다')
  expect(body).toContain('`docs`가 디렉터리라 그 줄이 `d`로 시작한다')
  expect(body).toContain('`ln -s report.txt latest`')
  expect(body).toContain('`latest`의 줄은 `l`로 시작하고')
  expect(body).toContain('장치 파일 `/dev/sda`의 줄은 `b`로 시작한다')
  expect(body).toContain('`ln report.txt report2.txt`')
  expect(body).toContain('두 줄 모두 일반 파일의 `-`로 시작하고')
}

async function expectUniqueMarkers() {
  render(<><FileTypeCharDiagram /><FileTypeCharDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '심볼릭 링크' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(1)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('FileTypeCharDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<FileTypeCharDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<FileTypeCharDiagram />)

    expect(shownIds('[data-node]', 'data-node').sort()).toEqual([...nodeIds].sort())
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note], [data-link]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<FileTypeCharDiagram />)
    await expectScenario(scenario, tallPaths, tallNotes, tallBox, container)
  })

  it('시나리오를 바꾸면 이전 화살표와 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<FileTypeCharDiagram />)
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

  it('노드와 테두리가 280×236 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<FileTypeCharDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 236')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox, tallGroups)
  })

  it('하드 링크는 원래 파일과 같은 -로, 심볼릭 링크는 l로 보이고 가리키는 파일로 화살표가 간다', async () => {
    render(<FileTypeCharDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<FileTypeCharDiagram />)
    const text = visualsByTopicId[topicId].diagrams['file-type-char']
    const ids = fileTypeCharScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
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
      const scenario = fileTypeCharScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 파일 종류 문자 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×236 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<FileTypeCharDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 236')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·그룹 id 집합과 경로·곁말 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<FileTypeCharDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 236')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroupIds = shownIds('[data-group]', 'data-group').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')
      const tallNoteIds = await collectIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 236')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroupIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallGroupIds).toEqual(['chars', 'names'])
      expect(tallPathIds).toEqual(['to-target'])
      expect(tallNoteIds).toEqual(Object.keys(noteLabels).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
      expect(await collectIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
    })

    it('노드와 테두리가 440×236 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<FileTypeCharDiagram />)
      expectFits(wideBox, wideGroups)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<FileTypeCharDiagram />)
      await expectScenario(scenario, widePaths, wideNotes, wideBox, container)
    })

    it('하드 링크는 원래 파일과 같은 -로, 심볼릭 링크는 l로 보이고 가리키는 파일로 화살표가 간다', async () => {
      render(<FileTypeCharDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<FileTypeCharDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 236')
      await selectScenario('심볼릭 링크')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '심볼릭 링크' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownIds('[data-path]', 'data-path')).toEqual(['to-target'])
      expect(diagram().querySelector('[data-path="to-target"]')).toHaveAttribute('d', widePaths['to-target'])
    })
  })
})
