import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { PermissionClassesDiagram, permissionClassesScenarios } from './PermissionClassesDiagram'

const topicId = 'linux-permissions'
const anchorConceptId = `${topicId}.owner-group-others`
const labels = {
  file: 'report.txt',
  user1: 'user1',
  user2: 'user2',
  user3: 'user3',
  owner: '소유자 권한',
  group: '그룹 권한',
  others: '그 밖의 권한',
}
const groupLabels = { dev: 'dev 그룹', perms: 'report.txt의 권한' }
const noteLabels = { 'file-note': '소유자 user1 · 그룹 dev' }
type GroupId = keyof typeof groupLabels

const nodeIds = Object.keys(labels)
// 그룹 테두리마다 그 안에 드는 노드.
const members: Record<GroupId, string[]> = {
  dev: ['user1', 'user2'],
  perms: ['owner', 'group', 'others'],
}

// 시나리오마다 보이는 화살표. 늘 보이는 선은 없다.
const tallArrows: Record<string, string> = {
  'to-owner': 'M80 92 H152',
  'to-group': 'M80 132 H152',
  'to-others': 'M80 188 H152',
}
const wideArrows: Record<string, string> = {
  'to-owner': 'M168 100 V132',
  'to-group': 'M272 100 V132',
  'to-others': 'M376 100 V132',
}
const ends: Record<string, [string, string]> = {
  'to-owner': ['user1', 'owner'],
  'to-group': ['user2', 'group'],
  'to-others': ['user3', 'others'],
}

type Group = { x: number, y: number, width: number, height: number, labelX: number, labelY: number }
const tallGroups: Record<GroupId, Group> = {
  dev: { x: 8, y: 56, width: 88, height: 100, labelX: 16, labelY: 70 },
  perms: { x: 136, y: 56, width: 136, height: 156, labelX: 144, labelY: 70 },
}
const wideGroups: Record<GroupId, Group> = {
  dev: { x: 128, y: 48, width: 184, height: 60, labelX: 136, labelY: 62 },
  perms: { x: 8, y: 124, width: 424, height: 48, labelX: 16, labelY: 152 },
}

type Note = { x: number, y: number, anchor: 'start' | 'middle' | 'end' }
const tallNote: Note = { x: 112, y: 28, anchor: 'start' }
const wideNote: Note = { x: 112, y: 28, anchor: 'start' }

const question = '이 사람에게는 어느 권한이 적용될까?'
const idleCaption = '예로 붙인 파일 report.txt의 소유자는 user1, 그룹은 dev이고, user1과 user2는 dev 그룹에 든다. 버튼을 고르면 세 사람에게 각각 어느 부류의 권한이 적용되는지 볼 수 있다.'
const legend = 'dev 그룹 테두리 안의 사람은 그 그룹에 든 사용자다. 화살표는 그 사람이 report.txt에 접근할 때 적용되는 권한을 가리킨다.'
const figureName = '파일 report.txt에 접근하는 user1·user2·user3가 각각 소유자 권한·그룹 권한·그 밖의 권한을 받는 것을, 소유자인지 먼저 보고 그다음 그룹에 드는지 보는 차례대로 보이는 도식'
const svgName = '파일 report.txt와 사용자 user1·user2·user3, 그리고 이 파일의 소유자 권한·그룹 권한·그 밖의 권한이 있다. user1과 user2는 dev 그룹 테두리 안에 있다'
const expectedScenarios = [
  {
    id: 'owner', label: 'user1',
    nodes: ['file', 'user1', 'owner'],
    paths: ['to-owner'],
    caption: 'user1은 report.txt의 소유자라 소유자 권한을 받는다. user1은 파일의 그룹 dev에도 들어 있지만, 소유자인지를 먼저 가리므로 그룹 권한은 보지 않는다.',
    sources: [anchorConceptId],
  },
  {
    id: 'group', label: 'user2',
    nodes: ['file', 'user2', 'group'],
    paths: ['to-group'],
    caption: 'user2는 report.txt의 소유자가 아니지만 파일의 그룹 dev에 들어 있어 그룹 권한을 받는다.',
    sources: [anchorConceptId],
  },
  {
    id: 'others', label: 'user3',
    nodes: ['file', 'user3', 'others'],
    paths: ['to-others'],
    caption: 'user3는 report.txt의 소유자도 아니고 dev 그룹에도 들지 않아 그 밖의 권한을 받는다. 한 사람에게는 세 부류 가운데 한 부류의 권한만 적용된다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 220]
const wideBox: [number, number, number, number] = [0, 0, 440, 180]

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
  return inner.x >= outer.x && inner.y >= outer.y
    && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height
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

// 파일의 곁말은 시나리오와 상관없이 늘 보인다. viewBox 안에서 노드·선·그룹 라벨과 겹치지 않는다.
function expectFileNote(place: Note, viewBox: [number, number, number, number]) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note'))).toEqual(['file-note'])
  const note = shown[0]
  const box = textBox(note, 'file-note')
  expect(note.textContent).toBe(noteLabels['file-note'])
  expect(note).toHaveAttribute('x', String(place.x))
  expect(note).toHaveAttribute('y', String(place.y))
  expect(note).toHaveAttribute('text-anchor', place.anchor)
  expect(note).toHaveAttribute('font-size', '9')
  expect(note).toHaveClass('fill-muted')
  expect(note.closest('[opacity]')).toBeNull()
  expect(boxesOutsideViewBox([box], viewBox)).toEqual([])
  for (const node of nodeIds.map(nodeBox)) expect(overlaps(box, node), `file-note ↔ ${node.id}`).toBe(false)
  for (const group of Object.keys(groupLabels) as GroupId[]) expect(overlaps(box, groupLabelBox(group)), `file-note ↔ ${group}`).toBe(false)
  for (const line of diagram().querySelectorAll('[data-path]')) {
    for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), 'file-note ↔ 선').toBe(false)
  }
}

async function expectScenario(
  scenario: typeof expectedScenarios[number],
  arrows: Record<string, string>,
  note: Note,
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
  expectFileNote(note, viewBox)
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

  for (const [id, group] of Object.entries(groups) as [GroupId, Group][]) {
    const rect = diagram().querySelector(`[data-group="${id}"]`)!
    expect(rect).toHaveAttribute('x', String(group.x))
    expect(rect).toHaveAttribute('y', String(group.y))
    expect(rect).toHaveAttribute('width', String(group.width))
    expect(rect).toHaveAttribute('height', String(group.height))
    for (const node of nodeIds) expect(contains(groupBox(id), nodeBox(node)), `${id} ⊃ ${node}`).toBe(members[id].includes(node))
    for (const node of nodeIds.filter((item) => !members[id].includes(item))) expect(overlaps(groupBox(id), nodeBox(node)), `${id} ↔ ${node}`).toBe(false)

    const labelText = diagram().querySelector(`[data-group-label="${id}"]`)!
    expect(labelText.textContent).toBe(groupLabels[id])
    expect(labelText).toHaveAttribute('x', String(group.labelX))
    expect(labelText).toHaveAttribute('y', String(group.labelY))
    expect(labelText).toHaveAttribute('font-size', '9')
    const label = groupLabelBox(id)
    expect(contains(groupBox(id), label), `${id} 라벨`).toBe(true)
    for (const node of nodeIds) expect(overlaps(label, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
  }
  expect(overlaps(groupBox('dev'), groupBox('perms'))).toBe(false)
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

// 요점: 시나리오마다 보이는 화살표가 하나이고, 그 시나리오의 사용자에서 시작해 권한 노드에서 끝난다.
// user2의 끝은 그룹 권한이고, 세 시나리오의 끝 노드가 서로 다르다.
// user1은 dev 그룹 테두리 안에 있는데도 화살표가 그룹 권한이 아니라 소유자 권한으로 간다 — 소유자를 먼저 가린다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const endNodes: string[] = []
  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    const paths = Array.from(diagram().querySelectorAll('[data-path]'))
    expect(paths, scenario.id).toHaveLength(1)
    const { start, end } = lineEnds(paths[0])
    const user = scenario.nodes.find((id) => id.startsWith('user'))!
    expect(nodeAt(start), scenario.id).toBe(user)
    const target = nodeAt(end)!
    expect(members.perms, scenario.id).toContain(target)
    endNodes.push(target)
    if (scenario.id === 'group') expect(diagram().querySelector(`[data-node="${target}"] text`)!.textContent).toBe('그룹 권한')
    if (scenario.id === 'owner') {
      expect(contains(groupBox('dev'), nodeBox(user))).toBe(true)
      expect(target).toBe('owner')
    }
  }
  expect(new Set(endNodes).size).toBe(expectedScenarios.length)

  expect(body).toContain('파일 `report.txt`의 소유자가 `user1`이고 그룹이 `dev`라고 하자')
  expect(body).toContain('`user1`과 `user2`는 `dev` 그룹에 들고, `user3`는 들지 않는다')
  expect(body).toContain('소유자는 파일의 그룹에 들어 있어도 그룹 권한을 받지 않는다')
  expect(body).toContain('세 부류 가운데 처음 맞은 한 부류의 권한만 적용된다')
}

async function expectUniqueMarkers() {
  render(<><PermissionClassesDiagram /><PermissionClassesDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'user2' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(1)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('PermissionClassesDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<PermissionClassesDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표 없이 파일의 곁말과 선택 안내가 나온다', () => {
    const { container } = render(<PermissionClassesDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expectFileNote(tallNote, tallBox)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드와 화살표만 보인다', async (scenario) => {
    const { container } = render(<PermissionClassesDiagram />)
    await expectScenario(scenario, tallArrows, tallNote, tallBox, container)
  })

  it('시나리오를 바꾸면 이전 화살표가 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<PermissionClassesDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(shownIds('[data-note]', 'data-note')).toEqual(['file-note'])
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('세 시나리오의 선명한 노드·화살표가 서로 다르다', () => {
    const keys = expectedScenarios.map(({ nodes, paths }) => JSON.stringify([[...nodes].sort(), [...paths].sort()]))
    expect(new Set(keys).size).toBe(expectedScenarios.length)
  })

  it('노드와 그룹 테두리가 280×220 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<PermissionClassesDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 220')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox, tallGroups)
  })

  it('화살표의 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
    render(<PermissionClassesDiagram />)
    await expectArrowEnds()
  })

  it('시나리오마다 화살표 하나가 그 사용자에서 서로 다른 권한으로 가고, dev 그룹 안의 user1도 소유자 권한으로 간다', async () => {
    render(<PermissionClassesDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<PermissionClassesDiagram />)
    const text = visualsByTopicId[topicId].diagrams['permission-classes']
    const ids = permissionClassesScenarios.map(({ id }) => id).sort()
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
      const scenario = permissionClassesScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 소유자·그룹·그 밖의 사용자 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })

    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.join('').replace(/\*\*|`/gu, ''))
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

    it('440×180 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<PermissionClassesDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 180')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·그룹 id 집합과 화살표·곁말 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<PermissionClassesDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 220')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroupIds = shownIds('[data-group]', 'data-group').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')
      const tallNoteIds = await collectIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 180')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroupIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallGroupIds).toEqual(Object.keys(groupLabels).sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(tallNoteIds).toEqual(Object.keys(noteLabels).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
      expect(await collectIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
    })

    it('노드와 그룹 테두리가 440×180 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<PermissionClassesDiagram />)
      expectFits(wideBox, wideGroups)
    })

    it('처음에는 노드가 모두 선명하고 파일의 곁말이 보인다', () => {
      render(<PermissionClassesDiagram />)
      for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
      expectFileNote(wideNote, wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·캡션을 보인다', async (scenario) => {
      const { container } = render(<PermissionClassesDiagram />)
      await expectScenario(scenario, wideArrows, wideNote, wideBox, container)
    })

    it('화살표의 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
      render(<PermissionClassesDiagram />)
      await expectArrowEnds()
    })

    it('시나리오마다 화살표 하나가 그 사용자에서 서로 다른 권한으로 가고, dev 그룹 안의 user1도 소유자 권한으로 간다', async () => {
      render(<PermissionClassesDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<PermissionClassesDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 220')
      await selectScenario('user2')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: 'user2' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['to-group'])
      expect(paths[0]).toHaveAttribute('d', wideArrows['to-group'])
    })
  })
})
