import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { EmrNodeRolesDiagram, emrNodeRolesScenarios } from './EmrNodeRolesDiagram'

const topicId = 'emr-glue-athena'
const anchorConceptId = `${topicId}.emr-node-instance-family-choice`
const nodeTypesConceptId = `${topicId}.emr-node-types`
const labels = { primary: '프라이머리 노드', core: '코어 노드', task: '태스크 노드', fs: '분산 파일 시스템' }
const groupLabels = { cluster: 'EMR 클러스터' }
const noteLabels = {
  manage: '클러스터 관리',
  store: '데이터 저장',
  'compute-only': '추가 처리만',
  'on-demand-primary': '온디맨드',
  'on-demand-core': '온디맨드',
  'spot-task': '스팟',
  'core-reclaimed': '스팟이라 회수됨',
  'data-lost': '데이터도 함께 사라짐',
  'general-primary': '범용',
  'memory-core': '메모리 최적화',
  'memory-task': '메모리 최적화',
}
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

const tallPaths: Record<string, string> = {
  'primary-core': 'M110 68 V116',
  'primary-task': 'M170 68 V116',
  'core-fs': 'M74 148 V196',
}
const widePaths: Record<string, string> = {
  'primary-core': 'M68 64 V48 H168',
  'primary-task': 'M68 96 V120 H168',
  'core-fs': 'M272 48 H316',
}
// 경로마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'primary-core': ['primary', 'core'],
  'primary-task': ['primary', 'task'],
  'core-fs': ['core', 'fs'],
}

const tallNotes: NotePlaces = {
  manage: { x: 204, y: 56, anchor: 'start' },
  store: { x: 80, y: 176, anchor: 'start' },
  'compute-only': { x: 206, y: 168, anchor: 'middle' },
  'on-demand-primary': { x: 204, y: 56, anchor: 'start' },
  'on-demand-core': { x: 74, y: 168, anchor: 'middle' },
  'spot-task': { x: 206, y: 168, anchor: 'middle' },
  'core-reclaimed': { x: 74, y: 168, anchor: 'middle' },
  'data-lost': { x: 134, y: 216, anchor: 'start' },
  'general-primary': { x: 204, y: 56, anchor: 'start' },
  'memory-core': { x: 74, y: 168, anchor: 'middle' },
  'memory-task': { x: 206, y: 168, anchor: 'middle' },
}
const wideNotes: NotePlaces = {
  manage: { x: 68, y: 140, anchor: 'middle' },
  store: { x: 220, y: 84, anchor: 'middle' },
  'compute-only': { x: 280, y: 124, anchor: 'start' },
  'on-demand-primary': { x: 68, y: 140, anchor: 'middle' },
  'on-demand-core': { x: 220, y: 84, anchor: 'middle' },
  'spot-task': { x: 280, y: 124, anchor: 'start' },
  'core-reclaimed': { x: 220, y: 84, anchor: 'middle' },
  'data-lost': { x: 370, y: 84, anchor: 'middle' },
  'general-primary': { x: 68, y: 140, anchor: 'middle' },
  'memory-core': { x: 220, y: 84, anchor: 'middle' },
  'memory-task': { x: 280, y: 124, anchor: 'start' },
}

const allNodes = Object.keys(labels)
const question = 'EMR 클러스터의 노드는 저마다 무엇을 맡을까?'
const idleCaption = '장면을 고르면 노드마다 맡는 일과 알맞은 인스턴스를 볼 수 있다.'
const legend = '파랑: 클러스터의 노드 · 회색: 코어 노드가 데이터를 담는 분산 파일 시스템. 프라이머리 노드에서 나가는 화살표는 관리다.'
const expectedScenarios = [
  {
    id: 'roles', label: '노드 역할',
    nodes: allNodes, paths: ['primary-core', 'primary-task', 'core-fs'],
    notes: ['manage', 'store', 'compute-only'],
    caption: '프라이머리는 클러스터를 관리하고 코어는 분산 파일 시스템에 데이터를 저장한다. 태스크는 처리만 한다.',
    sources: [nodeTypesConceptId],
  },
  {
    id: 'task-spot', label: '태스크만 스팟',
    nodes: allNodes, paths: [],
    notes: ['on-demand-primary', 'on-demand-core', 'spot-task'],
    caption: '태스크 노드는 회수돼도 다시 시도하면 되므로 스팟으로 돌린다. 프라이머리·코어는 온디맨드로 둔다.',
    sources: [nodeTypesConceptId],
  },
  {
    id: 'core-spot', label: '코어도 스팟',
    nodes: ['primary', 'task'], paths: [],
    notes: ['core-reclaimed', 'data-lost', 'spot-task'],
    caption: '코어 노드를 스팟으로 돌리면 회수될 때 그 위의 데이터가 함께 사라진다. 손실이 없어야 하면 피한다.',
    sources: [nodeTypesConceptId],
  },
  {
    id: 'memory', label: '메모리 최적화',
    nodes: ['core', 'task'], paths: [],
    notes: ['general-primary', 'memory-core', 'memory-task'],
    caption: '메모리 최적화는 데이터를 저장·처리하는 코어와 태스크에 쓴다. 관리만 하는 프라이머리는 범용이면 된다.',
    sources: [anchorConceptId],
  },
]

function diagram() {
  return screen.getByRole('img', { name: 'EMR 클러스터의 프라이머리·코어·태스크 노드' })
}

async function selectScenario(label: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) })
}

function readBox(rect: Element): SvgBox {
  return {
    id: rect.getAttribute('data-group') ?? rect.parentElement?.getAttribute('data-node') ?? '',
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

function nodeBox(id: string) {
  return readBox(diagram().querySelector(`[data-node="${id}"] rect`)!)
}

function groupBox(id: string) {
  return readBox(diagram().querySelector(`[data-group="${id}"]`)!)
}

function frameOf(box: SvgBox) {
  return [box.x, box.y, box.width, box.height] as [number, number, number, number]
}

function opacityOf(id: string) {
  return diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')
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
  return { id: text.getAttribute('data-note') ?? text.getAttribute('data-group-label')!, x: left, y: y - 9, width, height: 9 }
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

function onEdge(x: number, y: number, box: SvgBox) {
  const insideX = x >= box.x && x <= box.x + box.width
  const insideY = y >= box.y && y <= box.y + box.height
  return ((x === box.x || x === box.x + box.width) && insideY) || ((y === box.y || y === box.y + box.height) && insideX)
}

// 아래 단언들은 배치에 묶이지 않는다. 세로형과 가로형이 같은 기대값으로 통과해야 한다.
async function expectScenario(
  scenario: typeof expectedScenarios[number],
  places: NotePlaces,
  paths: Record<string, string>,
  width: number,
  container: HTMLElement,
) {
  await selectScenario(scenario.label)

  for (const node of diagram().querySelectorAll('[data-node]')) {
    expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
  }
  for (const group of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(group.closest('[opacity]')).toBeNull()

  const shownPaths = Array.from(diagram().querySelectorAll('[data-path]'))
  expect(shownPaths.map((path) => path.getAttribute('data-path'))).toEqual(scenario.paths)
  for (const path of shownPaths) {
    expect(path).toHaveAttribute('d', paths[path.getAttribute('data-path')!])
    expect(path).toHaveAttribute('stroke-width', '2')
    expect(path).toHaveAttribute('marker-end', `url(#${diagram().querySelector('marker')!.id})`)
    expect(path).toHaveClass('stroke-title')
    expect(path.closest('[opacity]')).toBeNull()
  }

  const pathSegments = shownPaths.flatMap((path) => segments(path.getAttribute('d')!))
  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  const groupLabelBoxes = Array.from(diagram().querySelectorAll('[data-group-label]'), textBox)
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
    expect(box.x, id).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, id).toBeLessThanOrEqual(width)
    for (const label of groupLabelBoxes) expect(overlaps(box, label), `${id} ↔ ${label.id}`).toBe(false)
    for (const node of nodeBoxes) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const segment of pathSegments) expect(crossesInside(segment, box), `${id} ↔ 경로`).toBe(false)
  }
  const noteBoxes = shownNotes.map(textBox)
  for (const [index, box] of noteBoxes.entries()) {
    for (const other of noteBoxes.slice(index + 1)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
  }
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

async function expectPathsOnlyInRoles() {
  for (const label of ['전체', ...expectedScenarios.map(({ label }) => label)]) {
    await selectScenario(label)
    expect(shownIds('[data-path]', 'data-path'), label).toEqual(label === '노드 역할' ? ['primary-core', 'primary-task', 'core-fs'] : [])
  }
}

async function expectSpotTaskNote() {
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    expect(shownIds('[data-note]', 'data-note').includes('spot-task'), label).toBe(label === '태스크만 스팟' || label === '코어도 스팟')
  }
}

async function expectDimming() {
  await selectScenario('코어도 스팟')
  for (const id of ['core', 'fs']) expect(opacityOf(id), id).toBe('0.25')
  for (const id of ['primary', 'task']) expect(opacityOf(id), id).toBe('1')

  await selectScenario('메모리 최적화')
  for (const id of ['primary', 'fs']) expect(opacityOf(id), id).toBe('0.25')
  for (const id of ['core', 'task']) expect(opacityOf(id), id).toBe('1')
}

function expectMembershipAndColors() {
  for (const id of allNodes) {
    expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass(id === 'fs' ? 'stroke-disabled' : 'stroke-diagram-managed')
  }
  expect(boxesOutsideViewBox(allNodes.map(nodeBox), frameOf(groupBox('cluster')))).toEqual([])
}

// 경로 양 끝은 두 노드의 변에 닿고, 어떤 선분도 노드 안을 지나지 않는다.
async function expectPathEnds() {
  await selectScenario('노드 역할')
  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  for (const path of diagram().querySelectorAll('[data-path]')) {
    const id = path.getAttribute('data-path')!
    const list = segments(path.getAttribute('d')!)
    const first = list[0]
    const last = list[list.length - 1]
    const [from, to] = ends[id]

    expect(onEdge(first.x1, first.y1, nodeBox(from)), `${id} 시작`).toBe(true)
    expect(onEdge(last.x2, last.y2, nodeBox(to)), `${id} 끝`).toBe(true)
    for (const segment of list) {
      for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
    }
  }
}

async function expectUniqueMarkers() {
  render(<><EmrNodeRolesDiagram /><EmrNodeRolesDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: 'EMR 노드 역할 도식' })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '노드 역할' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(3)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

// 관문 5·6: 모든 rect가 viewBox 안에 있고, 라벨은 상자 안에, 그룹 라벨은 자기 박스 오른쪽 끝 안에 들어간다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(5)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(label, 10) + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
  }

  for (const [id, wording] of Object.entries(groupLabels)) {
    const box = groupBox(id)
    const groupLabel = diagram().querySelector(`[data-group-label="${id}"]`)!
    expect(groupLabel.textContent).toBe(wording)
    expect(groupLabel).toHaveAttribute('font-size', '9')
    expect(groupLabel).toHaveClass('fill-muted')
    const x = Number(groupLabel.getAttribute('x'))
    expect(x, wording).toBe(box.x + 10)
    expect(Number(groupLabel.getAttribute('y')), wording).toBe(box.y + 14)
    expect(x + estimateTextWidth(wording, 9), wording).toBeLessThanOrEqual(box.x + box.width)
    expect(x + estimateTextWidth(wording, 9), wording).toBeLessThanOrEqual(viewBox[2])
  }
}

describe('EmrNodeRolesDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<EmrNodeRolesDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 넷이 모두 선명하고 경로·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<EmrNodeRolesDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual([...allNodes].sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·경로·곁말만 보이고 나머지 노드는 흐려진다', async (scenario) => {
    const { container } = render(<EmrNodeRolesDiagram />)
    await expectScenario(scenario, tallNotes, tallPaths, 280, container)
  })

  it('장면을 바꾸면 이전 경로·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<EmrNodeRolesDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
    }
    await selectScenario('전체')

    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
    for (const { label } of expectedScenarios) expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'false')
  })

  it('관문 5·7: 그룹 하나와 노드 넷이 280×248 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<EmrNodeRolesDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 248')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 248])
  })

  it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 0..280 안에 있다', async (label) => {
    render(<EmrNodeRolesDiagram />)
    await selectScenario(label)

    expect(diagram().querySelectorAll('[data-group]')).toHaveLength(1)
    for (const text of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(text.closest('[opacity]')).toBeNull()
    for (const text of diagram().querySelectorAll('[data-group-label], [data-note]')) {
      expect(text).toHaveAttribute('font-size', '9')
      const box = textBox(text)
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(280)
    }
  })

  it('경로 셋은 노드 역할 장면에서만 보인다', async () => {
    render(<EmrNodeRolesDiagram />)
    await expectPathsOnlyInRoles()
  })

  it('스팟 곁말은 태스크만 스팟과 코어도 스팟 두 장면에서만 보인다', async () => {
    render(<EmrNodeRolesDiagram />)
    await expectSpotTaskNote()
  })

  it('코어도 스팟은 코어·분산 파일 시스템을, 메모리 최적화는 프라이머리·분산 파일 시스템을 흐린다', async () => {
    render(<EmrNodeRolesDiagram />)
    await expectDimming()
  })

  it('분산 파일 시스템만 회색이고 노드 넷은 클러스터 박스 안에 있다', () => {
    render(<EmrNodeRolesDiagram />)
    expectMembershipAndColors()
  })

  it('경로 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<EmrNodeRolesDiagram />)
    await expectPathEnds()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 경로가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<EmrNodeRolesDiagram />)
    const text = visualsByTopicId[topicId].diagrams['node-roles']
    const ids = emrNodeRolesScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([`${topicId}.emr`, nodeTypesConceptId, anchorConceptId])
    expect(text.label).toBe('EMR 노드 역할 도식')
    expect(text.svgLabel).toBe('EMR 클러스터의 프라이머리·코어·태스크 노드')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = emrNodeRolesScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: expected.sources })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
      expect([...wording.caption].length).toBeLessThanOrEqual(57)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) {
      expect(conceptIds).toContain(source)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 인스턴스 제품군 선택 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: 'EMR 노드 역할 도식' })

    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*/gu, ''))
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

    async function collectPathIds() {
      const found = new Set<string>()
      for (const { label } of expectedScenarios) {
        await selectScenario(label)
        for (const id of shownIds('[data-path]', 'data-path')) found.add(id)
      }
      return [...found].sort()
    }

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×160 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<EmrNodeRolesDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 160')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·그룹 id 집합과 시나리오로 나타나는 경로 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<EmrNodeRolesDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 248')
      const tallNodes = ids('[data-node]', 'data-node')
      const tallGroups = ids('[data-group]', 'data-group')
      const tallPathIds = await collectPathIds()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 160')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(tallNodes).toEqual([...allNodes].sort())
      expect(ids('[data-group]', 'data-group')).toEqual(tallGroups)
      expect(tallGroups).toEqual(Object.keys(groupLabels).sort())
      expect(tallPathIds).toEqual(Object.keys(tallPaths).sort())
      expect(await collectPathIds()).toEqual(tallPathIds)
    })

    it('모든 rect가 440×160 viewBox 안에 있고 노드 라벨·그룹 라벨이 자기 상자 안에 들어간다', () => {
      render(<EmrNodeRolesDiagram />)
      expectFits([0, 0, 440, 160])
    })

    it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 0..440 안에 있다', async (label) => {
      render(<EmrNodeRolesDiagram />)
      await selectScenario(label)

      expect(diagram().querySelectorAll('[data-group]')).toHaveLength(1)
      for (const text of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(text.closest('[opacity]')).toBeNull()
      for (const text of diagram().querySelectorAll('[data-group-label], [data-note]')) {
        expect(text).toHaveAttribute('font-size', '9')
        const box = textBox(text)
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width).toBeLessThanOrEqual(440)
      }
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·경로·곁말·캡션을 보이고 곁말은 노드·그룹 라벨·경로와 겹치지 않는다', async (scenario) => {
      const { container } = render(<EmrNodeRolesDiagram />)
      await expectScenario(scenario, wideNotes, widePaths, 440, container)
    })

    it('경로 셋은 노드 역할 장면에서만 보인다', async () => {
      render(<EmrNodeRolesDiagram />)
      await expectPathsOnlyInRoles()
    })

    it('스팟 곁말은 태스크만 스팟과 코어도 스팟 두 장면에서만 보인다', async () => {
      render(<EmrNodeRolesDiagram />)
      await expectSpotTaskNote()
    })

    it('코어도 스팟은 코어·분산 파일 시스템을, 메모리 최적화는 프라이머리·분산 파일 시스템을 흐린다', async () => {
      render(<EmrNodeRolesDiagram />)
      await expectDimming()
    })

    it('분산 파일 시스템만 회색이고 노드 넷은 클러스터 박스 안에 있다', () => {
      render(<EmrNodeRolesDiagram />)
      expectMembershipAndColors()
    })

    it('경로 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<EmrNodeRolesDiagram />)
      await expectPathEnds()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 경로가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<EmrNodeRolesDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 248')
      await selectScenario('노드 역할')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '노드 역할' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['primary-core', 'primary-task', 'core-fs'])
      for (const path of paths) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      for (const note of diagram().querySelectorAll('[data-note]')) {
        expect(note).toHaveAttribute('x', String(wideNotes[note.getAttribute('data-note')! as NoteId].x))
      }
    })
  })
})
