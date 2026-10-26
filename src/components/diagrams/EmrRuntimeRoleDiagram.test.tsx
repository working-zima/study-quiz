import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { EmrRuntimeRoleDiagram, emrRuntimeRoleScenarios } from './EmrRuntimeRoleDiagram'

const topicId = 'emr-glue-athena'
const anchorConceptId = `${topicId}.emr-security-configuration`
const runtimeRoleConceptId = `${topicId}.emr-runtime-role`
const labels = {
  'job-a': '팀 A의 작업',
  'job-b': '팀 B의 작업',
  'role-a': '런타임 역할 A',
  'role-b': '런타임 역할 B',
  profile: '인스턴스 프로파일',
  'node-1': '노드',
  'node-2': '노드',
  's3-a': 'S3 데이터 A',
  's3-b': 'S3 데이터 B',
  security: '보안 구성',
}
const groupLabels = { cluster: 'EMR 클러스터' }
const noteLabels = {
  'same-permission': '같은 권한',
  'per-job': '작업마다 역할 지정',
  assumes: '역할을 인수',
  'in-transit': '전송 중',
  'at-rest': '저장 중: S3와 로컬 디스크',
}
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

const tallPaths: Record<string, string> = {
  'job-a-profile': 'M128 24 H136 V144',
  'job-b-profile': 'M152 24 H144 V144',
  'profile-s3-a': 'M136 176 V264 H82 V280',
  'profile-s3-b': 'M144 176 V264 H198 V280',
  'job-a-role-a': 'M82 40 V88',
  'job-b-role-b': 'M198 40 V88',
  'role-a-s3-a': 'M36 104 H24 V296 H36',
  'role-b-s3-b': 'M244 104 H256 V296 H244',
  'profile-role-a': 'M100 144 V120',
  'profile-role-b': 'M180 144 V120',
  'node-node': 'M128 216 H152',
  'security-cluster': 'M140 336 V252',
}
const widePaths: Record<string, string> = {
  'job-a-profile': 'M132 24 H160 V124',
  'job-b-profile': 'M196 24 H172 V124',
  'profile-s3-a': 'M124 156 V192',
  'profile-s3-b': 'M208 156 V192',
  'job-a-role-a': 'M86 40 V80',
  'job-b-role-b': 'M242 40 V80',
  'role-a-s3-a': 'M60 112 V192',
  'role-b-s3-b': 'M268 112 V192',
  'profile-role-a': 'M124 124 V112',
  'profile-role-b': 'M208 124 V112',
  'node-node': 'M360 116 H380',
  'security-cluster': 'M372 192 V168',
}
// 경로마다 출발 노드와 도착 노드. 보안 구성 화살표는 노드가 아니라 클러스터 박스에서 끝난다.
const ends: Record<string, [string, string]> = {
  'job-a-profile': ['job-a', 'profile'],
  'job-b-profile': ['job-b', 'profile'],
  'profile-s3-a': ['profile', 's3-a'],
  'profile-s3-b': ['profile', 's3-b'],
  'job-a-role-a': ['job-a', 'role-a'],
  'job-b-role-b': ['job-b', 'role-b'],
  'role-a-s3-a': ['role-a', 's3-a'],
  'role-b-s3-b': ['role-b', 's3-b'],
  'profile-role-a': ['profile', 'role-a'],
  'profile-role-b': ['profile', 'role-b'],
  'node-node': ['node-1', 'node-2'],
}

const tallNotes: NotePlaces = {
  'same-permission': { x: 206, y: 164, anchor: 'start' },
  'per-job': { x: 140, y: 76, anchor: 'middle' },
  assumes: { x: 206, y: 164, anchor: 'start' },
  'in-transit': { x: 140, y: 194, anchor: 'middle' },
  'at-rest': { x: 140, y: 246, anchor: 'middle' },
}
const wideNotes: NotePlaces = {
  'same-permission': { x: 224, y: 144, anchor: 'start' },
  'per-job': { x: 164, y: 72, anchor: 'middle' },
  assumes: { x: 224, y: 144, anchor: 'start' },
  'in-transit': { x: 370, y: 94, anchor: 'middle' },
  'at-rest': { x: 370, y: 152, anchor: 'middle' },
}

const allNodes = Object.keys(labels)
const insideCluster = ['role-a', 'role-b', 'profile', 'node-1', 'node-2']
const outsideCluster = ['job-a', 'job-b', 's3-a', 's3-b', 'security']
const question = '클러스터를 함께 쓰는 팀의 권한과 암호화는 무엇이 정할까?'
const idleCaption = '구성을 고르면 작업이 어떤 권한으로 데이터에 닿고 무엇이 암호화되는지 볼 수 있다.'
const legend = '파랑: AWS 서비스와 IAM 권한 · 회색: 팀이 제출한 작업. 큰 박스가 EMR 클러스터 하나다.'
const expectedScenarios = [
  {
    id: 'instance-profile', label: '기본 구성',
    nodes: ['job-a', 'job-b', 'profile', 's3-a', 's3-b'],
    paths: ['job-a-profile', 'job-b-profile', 'profile-s3-a', 'profile-s3-b'],
    notes: ['same-permission'],
    caption: '기본 구성에서는 작업이 인스턴스 프로파일 권한으로 돈다. 작업을 낸 모든 팀이 같은 권한을 갖는다.',
    sources: [runtimeRoleConceptId],
  },
  {
    id: 'runtime-role', label: '런타임 역할',
    nodes: ['job-a', 'job-b', 'role-a', 'role-b', 's3-a', 's3-b'],
    paths: ['job-a-role-a', 'job-b-role-b', 'role-a-s3-a', 'role-b-s3-b'],
    notes: ['per-job'],
    caption: '작업을 제출할 때 IAM 역할을 지정한다. 팀마다 역할을 달리 주면 허용된 S3 데이터에만 닿는다.',
    sources: [runtimeRoleConceptId],
  },
  {
    id: 'trust', label: '역할 인수',
    nodes: ['profile', 'role-a', 'role-b'],
    paths: ['profile-role-a', 'profile-role-b'],
    notes: ['assumes'],
    caption: '인스턴스 프로파일이 런타임 역할을 인수하므로, 런타임 역할이 인스턴스 프로파일 역할을 신뢰해야 한다.',
    sources: [runtimeRoleConceptId],
  },
  {
    id: 'encryption', label: '보안 구성',
    nodes: ['security', 'node-1', 'node-2', 's3-a', 's3-b'],
    paths: ['security-cluster', 'node-node'],
    notes: ['in-transit', 'at-rest'],
    caption: '보안 구성 하나를 적용하면 S3·로컬 디스크의 데이터와 노드 사이를 오가는 데이터가 함께 암호화된다.',
    sources: [anchorConceptId],
  },
]

function diagram() {
  return screen.getByRole('img', { name: '인스턴스 프로파일·런타임 역할·보안 구성' })
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

// 보안 구성 화살표는 클러스터 박스의 아래 변에서 끝난다.
async function expectSecurityEndsOnClusterBottom(bottom: number) {
  await selectScenario('보안 구성')
  const cluster = groupBox('cluster')
  const { start, end } = pathEnds('security-cluster')

  expect(cluster.y + cluster.height).toBe(bottom)
  expect(end.y).toBe(bottom)
  expect(end.x).toBeGreaterThan(cluster.x)
  expect(end.x).toBeLessThan(cluster.x + cluster.width)
  expect(onEdge(start.x, start.y, nodeBox('security')), '보안 구성에서 출발').toBe(true)
}

// 역할 인수는 인스턴스 프로파일에서 위로 역할에 닿는다.
async function expectTrustGoesUp() {
  await selectScenario('역할 인수')
  for (const id of ['profile-role-a', 'profile-role-b']) {
    const { start, end } = pathEnds(id)
    expect(end.y, id).toBeLessThan(start.y)
  }
}

// 런타임 역할에서는 인스턴스 프로파일을 거치지 않는다.
async function expectRuntimeRoleSkipsProfile() {
  await selectScenario('런타임 역할')
  expect(opacityOf('profile')).toBe('0.25')
  const profile = nodeBox('profile')
  const shownPaths = Array.from(diagram().querySelectorAll('[data-path]'))
  expect(shownPaths).toHaveLength(4)
  for (const path of shownPaths) {
    for (const segment of segments(path.getAttribute('d')!)) {
      expect(touches(segment, profile), path.getAttribute('data-path')!).toBe(false)
    }
  }
}

function expectMembershipAndColors() {
  for (const id of allNodes) {
    expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass(id.startsWith('job-') ? 'stroke-disabled' : 'stroke-diagram-managed')
  }
  expect(diagram().querySelector('.stroke-diagram-resource')).toBeNull()
  const cluster = groupBox('cluster')
  expect(boxesOutsideViewBox(insideCluster.map(nodeBox), frameOf(cluster))).toEqual([])
  for (const id of outsideCluster) expect(overlaps(nodeBox(id), cluster), id).toBe(false)
}

// 경로 양 끝은 두 노드의 변에 닿고, 어떤 선분도 노드 안을 지나지 않는다.
async function expectPathEnds() {
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
    for (const path of diagram().querySelectorAll('[data-path]')) {
      const id = path.getAttribute('data-path')!
      const list = segments(path.getAttribute('d')!)
      for (const segment of list) {
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

async function expectUniqueMarkers() {
  render(<><EmrRuntimeRoleDiagram /><EmrRuntimeRoleDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: 'EMR 권한과 암호화 도식' })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '기본 구성' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(4)
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

describe('EmrRuntimeRoleDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<EmrRuntimeRoleDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 열 개가 모두 선명하고 경로·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<EmrRuntimeRoleDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual([...allNodes].sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·경로·곁말만 보이고 나머지 노드는 흐려진다', async (scenario) => {
    const { container } = render(<EmrRuntimeRoleDiagram />)
    await expectScenario(scenario, tallNotes, tallPaths, 280, container)
  })

  it('장면을 바꾸면 이전 경로·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<EmrRuntimeRoleDiagram />)
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

  it('관문 5·7: 그룹 하나와 노드 열 개가 280×376 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<EmrRuntimeRoleDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 376')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 376])
  })

  it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 0..280 안에 있다', async (label) => {
    render(<EmrRuntimeRoleDiagram />)
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

  it('보안 구성 화살표는 클러스터 박스의 아래 변 y 252에서 끝난다', async () => {
    render(<EmrRuntimeRoleDiagram />)
    await expectSecurityEndsOnClusterBottom(252)
  })

  it('역할 인수의 두 경로는 인스턴스 프로파일에서 위로 역할에 닿는다', async () => {
    render(<EmrRuntimeRoleDiagram />)
    await expectTrustGoesUp()
  })

  it('런타임 역할에서는 인스턴스 프로파일이 흐려지고 경로 넷이 그 상자에 닿지 않는다', async () => {
    render(<EmrRuntimeRoleDiagram />)
    await expectRuntimeRoleSkipsProfile()
  })

  it('작업·S3 데이터·보안 구성은 클러스터 밖, 역할·인스턴스 프로파일·노드는 안에 있고 작업만 회색이다', () => {
    render(<EmrRuntimeRoleDiagram />)
    expectMembershipAndColors()
  })

  it('경로 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<EmrRuntimeRoleDiagram />)
    await expectPathEnds()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 경로가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<EmrRuntimeRoleDiagram />)
    const text = visualsByTopicId[topicId].diagrams['runtime-role']
    const ids = emrRuntimeRoleScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([runtimeRoleConceptId, anchorConceptId])
    expect(text.label).toBe('EMR 권한과 암호화 도식')
    expect(text.svgLabel).toBe('인스턴스 프로파일·런타임 역할·보안 구성')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = emrRuntimeRoleScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 보안 구성 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: 'EMR 권한과 암호화 도식' })

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

    it('440×232 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<EmrRuntimeRoleDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 232')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·그룹 id 집합과 시나리오로 나타나는 경로 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<EmrRuntimeRoleDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 376')
      const tallNodes = ids('[data-node]', 'data-node')
      const tallGroups = ids('[data-group]', 'data-group')
      const tallPathIds = await collectPathIds()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 232')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(tallNodes).toEqual([...allNodes].sort())
      expect(ids('[data-group]', 'data-group')).toEqual(tallGroups)
      expect(tallGroups).toEqual(Object.keys(groupLabels).sort())
      expect(tallPathIds).toEqual(Object.keys(tallPaths).sort())
      expect(await collectPathIds()).toEqual(tallPathIds)
    })

    it('모든 rect가 440×232 viewBox 안에 있고 노드 라벨·그룹 라벨이 자기 상자 안에 들어간다', () => {
      render(<EmrRuntimeRoleDiagram />)
      expectFits([0, 0, 440, 232])
    })

    it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 0..440 안에 있다', async (label) => {
      render(<EmrRuntimeRoleDiagram />)
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
      const { container } = render(<EmrRuntimeRoleDiagram />)
      await expectScenario(scenario, wideNotes, widePaths, 440, container)
    })

    it('보안 구성 화살표는 클러스터 박스의 아래 변 y 168에서 끝난다', async () => {
      render(<EmrRuntimeRoleDiagram />)
      await expectSecurityEndsOnClusterBottom(168)
    })

    it('역할 인수의 두 경로는 인스턴스 프로파일에서 위로 역할에 닿는다', async () => {
      render(<EmrRuntimeRoleDiagram />)
      await expectTrustGoesUp()
    })

    it('런타임 역할에서는 인스턴스 프로파일이 흐려지고 경로 넷이 그 상자에 닿지 않는다', async () => {
      render(<EmrRuntimeRoleDiagram />)
      await expectRuntimeRoleSkipsProfile()
    })

    it('작업·S3 데이터·보안 구성은 클러스터 밖, 역할·인스턴스 프로파일·노드는 안에 있고 작업만 회색이다', () => {
      render(<EmrRuntimeRoleDiagram />)
      expectMembershipAndColors()
    })

    it('경로 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<EmrRuntimeRoleDiagram />)
      await expectPathEnds()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 경로가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<EmrRuntimeRoleDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 376')
      await selectScenario('런타임 역할')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '런타임 역할' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['job-a-role-a', 'job-b-role-b', 'role-a-s3-a', 'role-b-s3-b'])
      for (const path of paths) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      for (const note of diagram().querySelectorAll('[data-note]')) {
        expect(note).toHaveAttribute('x', String(wideNotes[note.getAttribute('data-note')! as NoteId].x))
      }
    })
  })
})
