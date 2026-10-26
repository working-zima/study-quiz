import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { LakePermissionsDiagram, lakePermissionsScenarios } from './LakePermissionsDiagram'

const topicId = 'emr-glue-athena'
const lakeFormationConceptId = `${topicId}.lake-formation`
const blueprintConceptId = `${topicId}.lake-formation-blueprint-and-athena`
const anchorConceptId = `${topicId}.lake-formation-lf-tags`
const labels = {
  database: '관계형 데이터베이스',
  viz: '시각화 도구',
  athena: 'Athena',
  'lf-tags': 'LF 태그',
  blueprint: '블루프린트',
  permissions: '열·행 권한',
  'table-1': '테이블',
  'table-2': '테이블',
  'table-new': '새 테이블',
}
const groupLabels = { 'lake-formation': 'Lake Formation', lake: '데이터 레이크' }
type GroupId = keyof typeof groupLabels
const noteLabels = {
  ingest: '레이크로 수집',
  applied: '열·행 권한 적용',
  'policy-only': 'IAM·버킷 정책만',
  'by-tag': '태그 기준 권한',
  'new-table': '태그만 달면 됨',
}
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

const tallPaths: Record<string, string> = {
  'database-blueprint': 'M108 40 V136',
  'blueprint-lake': 'M124 168 V200',
  'viz-athena': 'M212 40 V64',
  'athena-permissions': 'M200 96 V136',
  'permissions-lake': 'M200 168 V200',
  'viz-lake': 'M264 24 H272 V200',
  'lf-tags-lake': 'M48 168 V200',
}
const widePaths: Record<string, string> = {
  'database-blueprint': 'M128 48 H224',
  'blueprint-lake': 'M312 48 H336',
  'viz-athena': 'M112 92 H128',
  'athena-permissions': 'M200 92 H224',
  'permissions-lake': 'M312 92 H336',
  'viz-lake': 'M60 108 V184 H386 V176',
  'lf-tags-lake': 'M312 136 H336',
}
// 노드에서 노드로 가는 경로의 출발과 도착.
const ends: Record<string, [string, string]> = {
  'database-blueprint': ['database', 'blueprint'],
  'viz-athena': ['viz', 'athena'],
  'athena-permissions': ['athena', 'permissions'],
}
// 레이크로 들어가는 경로의 출발 노드. 도착은 테이블이 아니라 데이터 레이크 박스의 변이다.
const intoLake: Record<string, string> = {
  'blueprint-lake': 'blueprint',
  'permissions-lake': 'permissions',
  'lf-tags-lake': 'lf-tags',
  'viz-lake': 'viz',
}

const tallNotes: NotePlaces = {
  ingest: { x: 102, y: 92, anchor: 'end' },
  applied: { x: 206, y: 192, anchor: 'start' },
  'policy-only': { x: 266, y: 192, anchor: 'end' },
  'by-tag': { x: 54, y: 192, anchor: 'start' },
  'new-table': { x: 228, y: 218, anchor: 'middle' },
}
const wideNotes: NotePlaces = {
  ingest: { x: 176, y: 42, anchor: 'middle' },
  applied: { x: 164, y: 124, anchor: 'middle' },
  'policy-only': { x: 140, y: 180, anchor: 'middle' },
  'by-tag': { x: 208, y: 140, anchor: 'end' },
  'new-table': { x: 386, y: 170, anchor: 'middle' },
}

const allNodes = Object.keys(labels)
const outsideGroups = ['database', 'viz', 'athena']
const insideLakeFormation = ['lf-tags', 'blueprint', 'permissions']
const insideLake = ['table-1', 'table-2', 'table-new']
const managedNodes = ['athena', 'lf-tags', 'blueprint', 'permissions']
const question = '데이터 레이크의 열·행 권한은 어디서 걸릴까?'
const idleCaption = '경로를 고르면 데이터가 들어오고 읽히는 길에서 권한이 어디서 걸리는지 볼 수 있다.'
const legend = '파랑: AWS 서비스와 Lake Formation의 기능 · 회색: 데이터와 그것을 읽는 쪽.'
const expectedScenarios = [
  {
    id: 'blueprint', label: '블루프린트 수집',
    nodes: ['database', 'blueprint', 'table-1', 'table-2', 'table-new'],
    paths: ['database-blueprint', 'blueprint-lake'],
    notes: ['ingest'],
    caption: '블루프린트가 관계형 데이터베이스의 데이터를 레이크로 가져온다. 수집 파이프라인을 따로 짜지 않는다.',
    sources: [blueprintConceptId],
  },
  {
    id: 'via-athena', label: 'Athena로 조회',
    nodes: ['viz', 'athena', 'permissions', 'table-1', 'table-2', 'table-new'],
    paths: ['viz-athena', 'athena-permissions', 'permissions-lake'],
    notes: ['applied'],
    caption: '시각화 도구가 Athena로 조회하면 Lake Formation의 열 수준 권한이 그대로 걸린다.',
    sources: [blueprintConceptId, lakeFormationConceptId],
  },
  {
    id: 'direct-s3', label: 'S3 직접 읽기',
    nodes: ['viz', 'table-1', 'table-2', 'table-new'],
    paths: ['viz-lake'],
    notes: ['policy-only'],
    caption: 'S3를 직접 읽게 하고 IAM·버킷 정책으로 막으면, SQL 질의 단위의 열 권한이 되지 못한다.',
    sources: [blueprintConceptId, lakeFormationConceptId],
  },
  {
    id: 'lf-tags', label: 'LF 태그',
    nodes: ['lf-tags', 'table-1', 'table-2', 'table-new'],
    paths: ['lf-tags-lake'],
    notes: ['by-tag', 'new-table'],
    caption: '테이블·열에 LF 태그를 달고 역할에는 태그 기준으로 권한을 준다. 새 테이블도 태그만 달면 된다.',
    sources: [anchorConceptId],
  },
]

function diagram() {
  return screen.getByRole('img', { name: '블루프린트 수집과 Athena 조회에 걸리는 Lake Formation 권한' })
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

// 그룹 라벨이 차지하는 상자. 가로는 x + 10부터 라벨 폭만큼, 세로는 y + 6 ~ y + 15다.
function groupLabelBox(id: GroupId): SvgBox {
  const group = groupBox(id)
  return { id, x: group.x + 10, y: group.y + 6, width: estimateTextWidth(groupLabels[id], 9), height: 9 }
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

// 선분이 상자에 닿는가. 변에 닿는 것도 센다.
function touches(segment: ReturnType<typeof segments>[number], box: SvgBox) {
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

function pathEnds(id: string) {
  const list = segments(diagram().querySelector(`[data-path="${id}"]`)!.getAttribute('d')!)
  const first = list[0]
  const last = list[list.length - 1]
  return { start: { x: first.x1, y: first.y1 }, end: { x: last.x2, y: last.y2 } }
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

// S3 직접 읽기는 Lake Formation 박스를 지나지 않는다 — 그 박스 바깥 통로로 레이크에 닿는다.
async function expectDirectReadSkipsLakeFormation() {
  await selectScenario('S3 직접 읽기')
  const lakeFormation = groupBox('lake-formation')
  const list = segments(diagram().querySelector('[data-path="viz-lake"]')!.getAttribute('d')!)

  expect(list.length).toBeGreaterThan(1)
  for (const segment of list) {
    expect(crossesInside(segment, lakeFormation)).toBe(false)
    expect(touches(segment, lakeFormation)).toBe(false)
  }
}

// 레이크로 들어가는 화살표는 출발 노드의 변에서 나와 데이터 레이크 박스의 변에서 끝난다.
async function expectArrowsEndOnLake() {
  const seen = new Set<string>()
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    const lake = groupBox('lake')
    for (const id of shownIds('[data-path]', 'data-path')) {
      if (!intoLake[id]) continue
      seen.add(id)
      const { start, end } = pathEnds(id)
      expect(onEdge(end.x, end.y, lake), `${id} 끝`).toBe(true)
      expect(onEdge(start.x, start.y, nodeBox(intoLake[id])), `${id} 시작`).toBe(true)
    }
  }
  expect([...seen].sort()).toEqual(Object.keys(intoLake).sort())
}

function expectMembershipAndColors() {
  for (const id of allNodes) {
    expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass(managedNodes.includes(id) ? 'stroke-diagram-managed' : 'stroke-disabled')
  }
  expect(diagram().querySelector('.stroke-diagram-resource')).toBeNull()
  const lakeFormation = groupBox('lake-formation')
  const lake = groupBox('lake')
  expect(overlaps(lakeFormation, lake)).toBe(false)
  expect(boxesOutsideViewBox(insideLakeFormation.map(nodeBox), frameOf(lakeFormation))).toEqual([])
  expect(boxesOutsideViewBox(insideLake.map(nodeBox), frameOf(lake))).toEqual([])
  for (const id of outsideGroups) {
    expect(overlaps(nodeBox(id), lakeFormation), `${id} ↔ Lake Formation`).toBe(false)
    expect(overlaps(nodeBox(id), lake), `${id} ↔ 데이터 레이크`).toBe(false)
  }
}

// 노드끼리 잇는 경로는 두 노드의 변에 닿고, 어떤 선분도 노드 안을 지나지 않는다.
async function expectPathEnds() {
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
    for (const path of diagram().querySelectorAll('[data-path]')) {
      const id = path.getAttribute('data-path')!
      for (const segment of segments(path.getAttribute('d')!)) {
        for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
      }
      if (!ends[id]) continue
      const [from, to] = ends[id]
      const { start, end } = pathEnds(id)
      expect(onEdge(start.x, start.y, nodeBox(from)), `${id} 시작`).toBe(true)
      expect(onEdge(end.x, end.y, nodeBox(to)), `${id} 끝`).toBe(true)
    }
  }
}

// 어느 경로 선분도 그룹 라벨이 차지하는 상자에 닿지 않는다.
async function expectPathsClearGroupLabels() {
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    const labelBoxes = (Object.keys(groupLabels) as GroupId[]).map(groupLabelBox)
    for (const path of diagram().querySelectorAll('[data-path]')) {
      for (const segment of segments(path.getAttribute('d')!)) {
        for (const box of labelBoxes) expect(touches(segment, box), `${path.getAttribute('data-path')} ↔ ${box.id}`).toBe(false)
      }
    }
  }
}

async function expectUniqueMarkers() {
  render(<><LakePermissionsDiagram /><LakePermissionsDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: 'Lake Formation 권한 경로 도식' })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'Athena로 조회' })) })
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
  expect(boxes).toHaveLength(11)
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

describe('LakePermissionsDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<LakePermissionsDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 아홉이 모두 선명하고 경로·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<LakePermissionsDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual([...allNodes].sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·경로·곁말만 보이고 나머지 노드는 흐려진다', async (scenario) => {
    const { container } = render(<LakePermissionsDiagram />)
    await expectScenario(scenario, tallNotes, tallPaths, 280, container)
  })

  it('경로를 바꾸면 이전 경로·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<LakePermissionsDiagram />)
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

  it('관문 5·7: 그룹 둘과 노드 아홉이 280×272 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<LakePermissionsDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 272')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 272])
  })

  it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 0..280 안에 있다', async (label) => {
    render(<LakePermissionsDiagram />)
    await selectScenario(label)

    expect(diagram().querySelectorAll('[data-group]')).toHaveLength(2)
    for (const text of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(text.closest('[opacity]')).toBeNull()
    for (const text of diagram().querySelectorAll('[data-group-label], [data-note]')) {
      expect(text).toHaveAttribute('font-size', '9')
      const box = textBox(text)
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(280)
    }
  })

  it('S3 직접 읽기의 화살표는 Lake Formation 박스를 지나지 않는다', async () => {
    render(<LakePermissionsDiagram />)
    await expectDirectReadSkipsLakeFormation()
  })

  it('레이크로 들어가는 화살표 넷은 테이블이 아니라 데이터 레이크 박스의 변에서 끝난다', async () => {
    render(<LakePermissionsDiagram />)
    await expectArrowsEndOnLake()
  })

  it('데이터베이스·시각화 도구·Athena는 두 박스 밖, LF 태그·블루프린트·열·행 권한과 테이블 셋은 각자 박스 안에 있다', () => {
    render(<LakePermissionsDiagram />)
    expectMembershipAndColors()
  })

  it('노드끼리 잇는 경로는 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<LakePermissionsDiagram />)
    await expectPathEnds()
  })

  it('어느 경로 선분도 그룹 라벨 상자에 닿지 않는다', async () => {
    render(<LakePermissionsDiagram />)
    await expectPathsClearGroupLabels()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 경로가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<LakePermissionsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['lake-permissions']
    const ids = lakePermissionsScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([lakeFormationConceptId, blueprintConceptId, anchorConceptId])
    expect(text.label).toBe('Lake Formation 권한 경로 도식')
    expect(text.svgLabel).toBe('블루프린트 수집과 Athena 조회에 걸리는 Lake Formation 권한')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = lakePermissionsScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 LF 태그 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: 'Lake Formation 권한 경로 도식' })

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

    it('440×192 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<LakePermissionsDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 192')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·그룹 id 집합과 시나리오로 나타나는 경로 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<LakePermissionsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 272')
      const tallNodes = ids('[data-node]', 'data-node')
      const tallGroups = ids('[data-group]', 'data-group')
      const tallPathIds = await collectPathIds()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 192')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(tallNodes).toEqual([...allNodes].sort())
      expect(ids('[data-group]', 'data-group')).toEqual(tallGroups)
      expect(tallGroups).toEqual(Object.keys(groupLabels).sort())
      expect(tallPathIds).toEqual(Object.keys(tallPaths).sort())
      expect(await collectPathIds()).toEqual(tallPathIds)
    })

    it('모든 rect가 440×192 viewBox 안에 있고 노드 라벨·그룹 라벨이 자기 상자 안에 들어간다', () => {
      render(<LakePermissionsDiagram />)
      expectFits([0, 0, 440, 192])
    })

    it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 0..440 안에 있다', async (label) => {
      render(<LakePermissionsDiagram />)
      await selectScenario(label)

      expect(diagram().querySelectorAll('[data-group]')).toHaveLength(2)
      for (const text of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(text.closest('[opacity]')).toBeNull()
      for (const text of diagram().querySelectorAll('[data-group-label], [data-note]')) {
        expect(text).toHaveAttribute('font-size', '9')
        const box = textBox(text)
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width).toBeLessThanOrEqual(440)
      }
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·경로·곁말·캡션을 보이고 곁말은 노드·그룹 라벨·경로와 겹치지 않는다', async (scenario) => {
      const { container } = render(<LakePermissionsDiagram />)
      await expectScenario(scenario, wideNotes, widePaths, 440, container)
    })

    it('S3 직접 읽기의 화살표는 Lake Formation 박스를 지나지 않는다', async () => {
      render(<LakePermissionsDiagram />)
      await expectDirectReadSkipsLakeFormation()
    })

    it('레이크로 들어가는 화살표 넷은 테이블이 아니라 데이터 레이크 박스의 변에서 끝난다', async () => {
      render(<LakePermissionsDiagram />)
      await expectArrowsEndOnLake()
    })

    it('데이터베이스·시각화 도구·Athena는 두 박스 밖, LF 태그·블루프린트·열·행 권한과 테이블 셋은 각자 박스 안에 있다', () => {
      render(<LakePermissionsDiagram />)
      expectMembershipAndColors()
    })

    it('노드끼리 잇는 경로는 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<LakePermissionsDiagram />)
      await expectPathEnds()
    })

    it('어느 경로 선분도 그룹 라벨 상자에 닿지 않는다', async () => {
      render(<LakePermissionsDiagram />)
      await expectPathsClearGroupLabels()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 경로가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<LakePermissionsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 272')
      await selectScenario('S3 직접 읽기')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: 'S3 직접 읽기' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['viz-lake'])
      for (const path of paths) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      for (const note of diagram().querySelectorAll('[data-note]')) {
        expect(note).toHaveAttribute('x', String(wideNotes[note.getAttribute('data-note')! as NoteId].x))
      }
    })
  })
})
