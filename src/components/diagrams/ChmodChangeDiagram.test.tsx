import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ChmodChangeDiagram, chmodChangeScenarios } from './ChmodChangeDiagram'

const topicId = 'linux-permissions'
const anchorConceptId = `${topicId}.chmod`
const labels = {
  before: '-rw-r--r--',
  'cmd-numeric': 'chmod 640 report.txt',
  after: '-rw-r-----',
  'cmd-recursive': 'chmod -R 750 project',
  'dir-project': 'project',
  'file-readme': 'readme.txt',
  'dir-src': 'src',
}
const groupLabels = { project: 'project와 그 안의 것' }
const noteLabels = {
  'before-note': '바꾸기 전 · 644',
  'after-note': '바꾼 뒤 · 640',
  'all-note': '셋 모두 rwxr-x---',
}
type GroupId = keyof typeof groupLabels
type NoteId = keyof typeof noteLabels

const nodeIds = Object.keys(labels)
const members: Record<GroupId, string[]> = { project: ['dir-project', 'file-readme', 'dir-src'] }
const numericNodes = ['before', 'cmd-numeric', 'after']
const linkIds = ['b-readme', 'b-src']
// 화살표와 가지가 잇는 두 노드.
const ends: Record<string, [string, string]> = {
  'to-command': ['before', 'cmd-numeric'],
  'to-after': ['cmd-numeric', 'after'],
  'to-project': ['cmd-recursive', 'dir-project'],
  'b-readme': ['dir-project', 'file-readme'],
  'b-src': ['dir-project', 'dir-src'],
}

type Group = { x: number, y: number, width: number, height: number, labelX: number, labelY: number }
const tallGroups: Record<GroupId, Group> = {
  project: { x: 8, y: 176, width: 264, height: 104, labelX: 136, labelY: 190 },
}
const wideGroups: Record<GroupId, Group> = {
  project: { x: 184, y: 76, width: 248, height: 112, labelX: 192, labelY: 90 },
}

const tallPaths: Record<string, string> = {
  'to-command': 'M56 56 V88 H68',
  'to-after': 'M212 88 H224 V56',
  'to-project': 'M60 160 V212',
}
const widePaths: Record<string, string> = {
  'to-command': 'M104 40 H128',
  'to-after': 'M288 40 H312',
  'to-project': 'M160 136 H200',
}
const tallLinks: Record<string, string> = {
  'b-readme': 'M96 228 H116 V212 H136',
  'b-src': 'M96 228 H116 V256 H136',
}
const wideLinks: Record<string, string> = {
  'b-readme': 'M280 136 H300 V116 H320',
  'b-src': 'M280 136 H300 V164 H320',
}

type Note = { x: number, y: number, anchor: 'start' | 'middle' | 'end' }
const tallNotes: Record<NoteId, Note> = {
  'before-note': { x: 56, y: 18, anchor: 'middle' },
  'after-note': { x: 224, y: 18, anchor: 'middle' },
  'all-note': { x: 168, y: 148, anchor: 'start' },
}
const wideNotes: Record<NoteId, Note> = {
  'before-note': { x: 56, y: 18, anchor: 'middle' },
  'after-note': { x: 360, y: 18, anchor: 'middle' },
  'all-note': { x: 84, y: 172, anchor: 'middle' },
}

const question = 'chmod를 입력하면 무엇이 바뀔까?'
const idleCaption = '위는 파일 report.txt의 권한을 숫자로 바꾸는 명령이고, 아래는 디렉터리 project와 그 안에 든 것의 권한을 한꺼번에 바꾸는 명령이다. 버튼을 고르면 명령을 입력해 무엇이 어떻게 바뀌는지 볼 수 있다.'
const legend = '화살표는 바꾸기 전의 권한에서 명령을 거쳐 바꾼 뒤의 권한으로 가거나, 명령에서 그 명령이 바꾸는 디렉터리로 간다. 테두리 안은 디렉터리 project와 그 안에 든 것이다.'
const figureName = 'chmod 640 report.txt가 report.txt의 권한을 -rw-r--r--에서 -rw-r-----로 바꾸고, chmod -R 750 project가 디렉터리 project와 그 안의 readme.txt·src까지 권한을 모두 rwxr-x---로 바꾸는 것을 보이는 도식'
const svgName = '위에 권한 -rw-r--r--, 명령 chmod 640 report.txt, 권한 -rw-r-----가 있고, 아래에 명령 chmod -R 750 project와, project와 그 안의 것 테두리 안에 project·readme.txt·src가 있다'
const expectedScenarios = [
  {
    id: 'numeric', label: '숫자로 바꾸기',
    nodes: ['before', 'cmd-numeric', 'after'],
    paths: ['to-command', 'to-after'],
    notes: ['before-note', 'after-note'] as NoteId[],
    caption: 'chmod 640 report.txt를 입력하면 report.txt의 권한이 -rw-r--r--에서 -rw-r-----로 바뀐다. 숫자로 준 권한은 아홉 자리를 새로 정해서, 그룹에는 읽기만 남기고 그 밖의 사용자의 권한은 모두 지운다.',
    sources: [anchorConceptId],
  },
  {
    id: 'recursive', label: '-R',
    nodes: ['cmd-recursive', 'dir-project', 'file-readme', 'dir-src', 'b-readme', 'b-src'],
    paths: ['to-project'],
    notes: ['all-note'] as NoteId[],
    caption: 'chmod -R 750 project를 입력하면 디렉터리 project 자신과 그 안의 readme.txt, 하위 디렉터리 src까지 모두 권한이 rwxr-x---가 된다. -R 없이 입력하면 project 하나만 바뀐다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 288]
const wideBox: [number, number, number, number] = [0, 0, 440, 196]

// 8진수 세 자리를 권한 아홉 글자로 푼다 — 자리마다 4는 r, 2는 w, 1은 x.
function decode(mode: string) {
  return [...mode].map((digit) => {
    const value = Number(digit)
    return `${value & 4 ? 'r' : '-'}${value & 2 ? 'w' : '-'}${value & 1 ? 'x' : '-'}`
  }).join('')
}

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

// 선의 양 끝이 지정한 두 노드의 변에 닿고, 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다.
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

// 가지 둘은 늘 보이고 project에서 그 안의 readme.txt와 src로 간다.
function expectLinks(links: Record<string, string>, scenarioNodes: string[] | null) {
  expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
  for (const link of diagram().querySelectorAll('[data-link]')) {
    const id = link.getAttribute('data-link')!
    expect(link).toHaveAttribute('d', links[id])
    expect(link).toHaveClass('stroke-muted')
    expect(link.getAttribute('marker-end')).toBeNull()
    expect(link).toHaveAttribute('opacity', scenarioNodes && !scenarioNodes.includes(id) ? '0.25' : '1')
    expectLine(link, id, ends[id])
  }
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
    for (const line of diagram().querySelectorAll('[data-path], [data-link]')) {
      for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), `${id} ↔ 선`).toBe(false)
    }
  }
}

async function expectScenario(
  scenario: typeof expectedScenarios[number],
  arrows: Record<string, string>,
  links: Record<string, string>,
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
  expectLinks(links, scenario.nodes)

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
// 그룹 테두리는 project와 그 안의 둘만 담고, 그룹 라벨은 자기 테두리 안에서 노드와 겹치지 않는다. 노드는 모두 회색이다.
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
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 요점: 「숫자로 바꾸기」의 바꾼 뒤 권한은 640을 4·2·1로 풀어 쓴 -rw-r-----이고, 화살표가 바꾸기 전 → 명령 → 바꾼 뒤로 간다.
// 「-R」에서는 project 테두리 안의 노드가 하나도 흐리지 않고, 「숫자로 바꾸기」의 노드는 모두 흐리다. 곁말은 750을 푼 rwxr-x---를 말한다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const labelOf = (id: string) => diagram().querySelector(`[data-node="${id}"] text`)!.textContent
  const opacity = (id: string) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')

  expect(labelOf('before')).toBe(`-${decode('644')}`)
  expect(labelOf('after')).toBe(`-${decode('640')}`)
  expect(labelOf('cmd-numeric')).toContain('640')
  expect(labelOf('cmd-recursive')).toContain('-R 750')

  await selectScenario('숫자로 바꾸기')
  const [toCommand, toAfter] = Array.from(diagram().querySelectorAll('[data-path]'))
  expect(nodeAt(lineEnds(toCommand).start)).toBe('before')
  expect(nodeAt(lineEnds(toCommand).end)).toBe('cmd-numeric')
  expect(nodeAt(lineEnds(toAfter).start)).toBe('cmd-numeric')
  expect(nodeAt(lineEnds(toAfter).end)).toBe('after')
  for (const id of members.project) expect(opacity(id), id).toBe('0.25')

  await selectScenario('-R')
  const inside = nodeIds.filter((id) => contains(groupBox('project'), nodeBox(id)))
  expect(inside.sort()).toEqual([...members.project].sort())
  for (const id of inside) expect(opacity(id), id).toBe('1')
  for (const id of numericNodes) expect(opacity(id), id).toBe('0.25')
  expect(diagram().querySelector('[data-note="all-note"]')!.textContent).toContain(decode('750'))
  const toProject = diagram().querySelector('[data-path="to-project"]')!
  expect(nodeAt(lineEnds(toProject).start)).toBe('cmd-recursive')
  expect(inside).toContain(nodeAt(lineEnds(toProject).end))

  expect(body).toContain('`chmod 640 report.txt`')
  expect(body).toContain('`-rw-r-----`')
  expect(body).toContain('`chmod -R 750 project`')
  expect(body).toContain('`readme.txt`')
  expect(body).toContain('`src`')
  expect(body).toContain('`rwxr-x---`')
}

async function expectUniqueMarkers() {
  render(<><ChmodChangeDiagram /><ChmodChangeDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '숫자로 바꾸기' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(2)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('ChmodChangeDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<ChmodChangeDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 가지가 모두 선명하고 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<ChmodChangeDiagram />)

    expect(shownIds('[data-node]', 'data-node').sort()).toEqual([...nodeIds].sort())
    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expectLinks(tallLinks, null)
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<ChmodChangeDiagram />)
    await expectScenario(scenario, tallPaths, tallLinks, tallNotes, tallBox, container)
  })

  it('시나리오를 바꾸면 이전 화살표와 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<ChmodChangeDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('두 시나리오의 선명한 노드·화살표·곁말이 서로 다르고, 노드가 하나도 겹치지 않는다', () => {
    const keys = expectedScenarios.map(({ nodes, paths, notes }) => JSON.stringify([[...nodes].sort(), [...paths].sort(), [...notes].sort()]))
    expect(new Set(keys).size).toBe(expectedScenarios.length)
    expect(expectedScenarios[0].nodes.filter((id) => expectedScenarios[1].nodes.includes(id))).toEqual([])
  })

  it('노드와 테두리가 280×288 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<ChmodChangeDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 288')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox, tallGroups)
  })

  it('640은 -rw-r-----로 바뀌고, -R은 project 테두리 안을 모두 rwxr-x---로 바꾼다', async () => {
    render(<ChmodChangeDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<ChmodChangeDiagram />)
    const text = visualsByTopicId[topicId].diagrams['chmod-change']
    const ids = chmodChangeScenarios.map(({ id }) => id).sort()
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
      const scenario = chmodChangeScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 chmod 명령 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×196 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<ChmodChangeDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 196')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·그룹·가지 id 집합과 경로·곁말 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<ChmodChangeDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 288')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroupIds = shownIds('[data-group]', 'data-group').sort()
      const tallLinkIds = shownIds('[data-link]', 'data-link').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')
      const tallNoteIds = await collectIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 196')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroupIds)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinkIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallGroupIds).toEqual(['project'])
      expect(tallLinkIds).toEqual([...linkIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallPaths).sort())
      expect(tallNoteIds).toEqual(Object.keys(noteLabels).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
      expect(await collectIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
    })

    it('노드와 테두리가 440×196 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<ChmodChangeDiagram />)
      expectFits(wideBox, wideGroups)
      expectLinks(wideLinks, null)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<ChmodChangeDiagram />)
      await expectScenario(scenario, widePaths, wideLinks, wideNotes, wideBox, container)
    })

    it('640은 -rw-r-----로 바뀌고, -R은 project 테두리 안을 모두 rwxr-x---로 바꾼다', async () => {
      render(<ChmodChangeDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<ChmodChangeDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 288')
      await selectScenario('-R')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '-R' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownIds('[data-path]', 'data-path')).toEqual(['to-project'])
      expect(diagram().querySelector('[data-path="to-project"]')).toHaveAttribute('d', widePaths['to-project'])
    })
  })
})
