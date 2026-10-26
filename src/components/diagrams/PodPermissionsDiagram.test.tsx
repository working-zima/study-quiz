import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { PodPermissionsDiagram, podPermissionsScenarios } from './PodPermissionsDiagram'

const topicId = 'ecs-eks-fargate'
const anchorConceptId = `${topicId}.eks-irsa`
const labels = {
  'node-role': '노드 IAM 역할',
  oidc: 'OIDC 공급자',
  'irsa-role': 'IAM 역할',
  sa: '서비스 계정',
  netpol: '네트워크 정책',
  'pod-a': '파드 A',
  'pod-b': '파드 B',
}
const groupLabels = { node: '노드' }
const noteLabels = {
  'all-pods': '파드 A와 B가 같은 권한',
  trust: '신뢰 관계',
  'only-a': '파드 A만 역할을 맡는다',
  'traffic-only': '통신 경로만 다룬다',
}
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

const tallPaths: Record<string, string> = {
  'node-role-node': 'M132 24 H140 V192',
  'oidc-irsa-role': 'M210 40 V72',
  'irsa-role-sa': 'M210 104 V136',
  'sa-pod-a': 'M210 168 V216',
  'pod-b-pod-a': 'M132 232 H148',
}
const widePaths: Record<string, string> = {
  'node-role-node': 'M68 40 V64',
  'oidc-irsa-role': 'M384 56 V88',
  'irsa-role-sa': 'M336 104 H320',
  'sa-pod-a': 'M224 104 H188',
  'pod-b-pod-a': 'M96 104 H108',
}
// 경로마다 출발과 도착. 노드 IAM 역할의 경로만 노드 상자가 아니라 노드 박스(그룹)의 변에서 끝난다.
const ends: Record<string, [string, string]> = {
  'node-role-node': ['node-role', 'node'],
  'oidc-irsa-role': ['oidc', 'irsa-role'],
  'irsa-role-sa': ['irsa-role', 'sa'],
  'sa-pod-a': ['sa', 'pod-a'],
  'pod-b-pod-a': ['pod-b', 'pod-a'],
}
const iamPaths = ['node-role-node', 'oidc-irsa-role', 'irsa-role-sa', 'sa-pod-a']

const tallNotes: NotePlaces = {
  'all-pods': { x: 140, y: 280, anchor: 'middle' },
  trust: { x: 218, y: 60, anchor: 'start' },
  'only-a': { x: 140, y: 280, anchor: 'middle' },
  'traffic-only': { x: 70, y: 184, anchor: 'middle' },
}
const wideNotes: NotePlaces = {
  'all-pods': { x: 102, y: 152, anchor: 'middle' },
  trust: { x: 392, y: 76, anchor: 'start' },
  'only-a': { x: 148, y: 152, anchor: 'middle' },
  'traffic-only': { x: 328, y: 164, anchor: 'start' },
}

const allNodes = Object.keys(labels)
const members: Record<string, string[]> = { node: ['pod-a', 'pod-b'] }
const outsideNodes = ['node-role', 'oidc', 'irsa-role', 'sa', 'netpol']
const managedNodes = ['node-role', 'oidc', 'irsa-role']
const question = '파드 하나에만 AWS 권한을 주려면 역할을 어디에 붙일까?'
const idleCaption = '붙이는 곳을 고르면 권한이 어느 파드까지 닿는지 볼 수 있다.'
const legend = '파랑: IAM 역할과 OIDC 공급자 · 회색: 쿠버네티스 쪽. 큰 박스가 노드 하나다.'
const expectedScenarios = [
  {
    id: 'node-role', label: '노드 역할에 붙이면',
    nodes: ['node-role', 'pod-a', 'pod-b'],
    paths: ['node-role-node'],
    notes: ['all-pods'],
    caption: '노드의 IAM 역할에 정책을 붙이면 그 노드에서 도는 모든 파드가 같은 권한을 쓴다.',
    sources: [anchorConceptId],
  },
  {
    id: 'irsa', label: '서비스 계정에 붙이면',
    nodes: ['oidc', 'irsa-role', 'sa', 'pod-a'],
    paths: ['oidc-irsa-role', 'irsa-role-sa', 'sa-pod-a'],
    notes: ['trust', 'only-a'],
    caption: '역할 ARN을 서비스 계정에 적고 OIDC 공급자와 신뢰를 세우면 그 계정의 파드만 역할을 맡는다.',
    sources: [anchorConceptId],
  },
  {
    id: 'netpol', label: '네트워크 정책은',
    nodes: ['netpol', 'pod-a', 'pod-b'],
    paths: ['pod-b-pod-a'],
    notes: ['traffic-only'],
    caption: '네트워크 정책은 파드 사이의 통신 경로를 다룬다. AWS API를 부를 권한은 주지 않는다.',
    sources: [anchorConceptId],
  },
]

function diagram() {
  return screen.getByRole('img', { name: '노드 IAM 역할·서비스 계정용 IAM 역할·네트워크 정책' })
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

// 경로의 끝은 노드 상자이거나 그룹 박스다. id가 겹치지 않으므로 노드를 먼저 찾는다.
function endBox(id: string) {
  return diagram().querySelector(`[data-node="${id}"]`) ? nodeBox(id) : groupBox(id)
}

function frameOf(box: SvgBox) {
  return [box.x, box.y, box.width, box.height] as [number, number, number, number]
}

function shownIds(selector: string, attribute: string) {
  return Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)!)
}

// 곁말이 차지하는 상자. 설계 검사기(phases/64-container-visuals/tools/check-design.mjs)와 같이
// 크기 9 글자를 기준선 위 7, 아래 2로 잡는다.
function noteBox(text: Element): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9)
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id: text.getAttribute('data-note')!, x: left, y: y - 7, width, height: 9 }
}

// 그룹 라벨이 차지하는 영역. 가로는 x + 10부터 글자 폭, 세로는 y + 7..y + 16이다.
function groupLabelArea(id: string): SvgBox {
  const group = groupBox(id)
  return { id, x: group.x + 10, y: group.y + 7, width: estimateTextWidth(groupLabels[id as keyof typeof groupLabels], 9), height: 9 }
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
  const groupLabelBoxes = Object.keys(groupLabels).map(groupLabelArea)
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
    const box = noteBox(note)
    expect(box.x, id).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, id).toBeLessThanOrEqual(width)
    for (const label of groupLabelBoxes) expect(overlaps(box, label), `${id} ↔ ${label.id}`).toBe(false)
    for (const node of nodeBoxes) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const segment of pathSegments) expect(crossesInside(segment, box), `${id} ↔ 경로`).toBe(false)
  }
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 상자 안에, 그룹 라벨은 자기 박스 오른쪽 끝 안에 들어간다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(8)
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

// 그룹 라벨 영역을 어떤 경로 선분도 지나지 않는다.
async function expectPathsAvoidGroupLabels() {
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    for (const id of Object.keys(groupLabels)) {
      const area = groupLabelArea(id)
      for (const path of diagram().querySelectorAll('[data-path]')) {
        for (const segment of segments(path.getAttribute('d')!)) {
          expect(touches(segment, area), `${path.getAttribute('data-path')} ↔ ${groupLabels[id as keyof typeof groupLabels]}`).toBe(false)
        }
      }
    }
  }
}

// 파드 둘은 노드 박스 안이고 나머지 노드는 박스와 겹치지 않는다.
// IAM 역할 둘과 OIDC 공급자만 파랑이고 쿠버네티스 쪽은 회색이다.
function expectMembershipAndColors() {
  for (const [groupId, nodeIds] of Object.entries(members)) {
    for (const id of nodeIds) expect(boxesOutsideViewBox([nodeBox(id)], frameOf(groupBox(groupId))), `${id} ⊂ ${groupId}`).toEqual([])
  }
  for (const id of outsideNodes) {
    for (const groupId of Object.keys(members)) expect(overlaps(nodeBox(id), groupBox(groupId)), `${id} ∩ ${groupId}`).toBe(false)
  }
  for (const id of allNodes) {
    expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass(managedNodes.includes(id) ? 'stroke-diagram-managed' : 'stroke-disabled')
  }
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="diagram-resource"]')).toBeNull()
}

// 경로 양 끝은 정한 상자의 변에 닿고, 어떤 선분도 노드 안을 지나지 않는다.
async function expectPathEnds() {
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
    for (const path of diagram().querySelectorAll('[data-path]')) {
      const id = path.getAttribute('data-path')!
      for (const segment of segments(path.getAttribute('d')!)) {
        for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
      }
      const [from, to] = ends[id]
      const { start, end } = pathEnds(id)
      expect(onEdge(start.x, start.y, endBox(from)), `${id} 시작`).toBe(true)
      expect(onEdge(end.x, end.y, endBox(to)), `${id} 끝`).toBe(true)
    }
  }
}

// 노드 IAM 역할의 화살표는 노드 박스의 변에서 끝나고, 서비스 계정의 화살표는 파드 A 상자의 변에서 끝난다.
// IAM 쪽 경로 넷은 어느 것도 파드 B에 닿지 않는다.
async function expectIamPathsAvoidPodB() {
  await selectScenario('노드 역할에 붙이면')
  const nodeRole = pathEnds('node-role-node')
  expect(onEdge(nodeRole.end.x, nodeRole.end.y, groupBox('node')), 'node-role-node 끝').toBe(true)

  await selectScenario('서비스 계정에 붙이면')
  const saPodA = pathEnds('sa-pod-a')
  expect(onEdge(saPodA.end.x, saPodA.end.y, nodeBox('pod-a')), 'sa-pod-a 끝').toBe(true)

  const podB = nodeBox('pod-b')
  const checked = new Set<string>()
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    for (const path of diagram().querySelectorAll('[data-path]')) {
      const id = path.getAttribute('data-path')!
      if (!iamPaths.includes(id)) continue
      checked.add(id)
      const { end } = pathEnds(id)
      expect(onEdge(end.x, end.y, podB), `${id} 끝 ↔ 파드 B`).toBe(false)
      for (const segment of segments(path.getAttribute('d')!)) expect(touches(segment, podB), `${id} ↔ 파드 B`).toBe(false)
    }
  }
  expect([...checked].sort()).toEqual([...iamPaths].sort())
}

// 서비스 계정에 붙이면 장면에서는 파드 B와 노드 IAM 역할, 네트워크 정책이 흐리다.
async function expectIrsaDimsOthers() {
  await selectScenario('서비스 계정에 붙이면')
  for (const id of ['pod-b', 'node-role', 'netpol']) {
    expect(diagram().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', '0.25')
  }
}

async function expectUniqueMarkers() {
  render(<><PodPermissionsDiagram /><PodPermissionsDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: 'EKS 파드 권한 도식' })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '서비스 계정에 붙이면' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(3)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('PodPermissionsDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<PodPermissionsDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 일곱 개가 모두 선명하고 경로·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<PodPermissionsDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual([...allNodes].sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·경로·곁말만 보이고 나머지 노드는 흐려진다', async (scenario) => {
    const { container } = render(<PodPermissionsDiagram />)
    await expectScenario(scenario, tallNotes, tallPaths, 280, container)
  })

  it('장면을 바꾸면 이전 경로·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<PodPermissionsDiagram />)
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

  it('그룹 하나와 노드 일곱 개가 280×288 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<PodPermissionsDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 288')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 288])
  })

  it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 0..280 안에 있다', async (label) => {
    render(<PodPermissionsDiagram />)
    await selectScenario(label)

    expect(diagram().querySelectorAll('[data-group]')).toHaveLength(1)
    for (const text of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(text.closest('[opacity]')).toBeNull()
    for (const text of diagram().querySelectorAll('[data-note]')) {
      expect(text).toHaveAttribute('font-size', '9')
      const box = noteBox(text)
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(280)
    }
    for (const id of Object.keys(groupLabels)) {
      const area = groupLabelArea(id)
      expect(area.x).toBeGreaterThanOrEqual(0)
      expect(area.x + area.width).toBeLessThanOrEqual(280)
    }
  })

  it('어떤 경로도 그룹 라벨 자리를 지나지 않는다', async () => {
    render(<PodPermissionsDiagram />)
    await expectPathsAvoidGroupLabels()
  })

  it('파드 둘은 노드 박스 안이고 IAM 역할 둘과 OIDC 공급자만 파랑이다', () => {
    render(<PodPermissionsDiagram />)
    expectMembershipAndColors()
  })

  it('경로 양 끝은 정한 상자의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<PodPermissionsDiagram />)
    await expectPathEnds()
  })

  it('노드 역할은 노드 박스에, 서비스 계정은 파드 A에 닿고 IAM 쪽 경로는 파드 B에 닿지 않는다', async () => {
    render(<PodPermissionsDiagram />)
    await expectIamPathsAvoidPodB()
  })

  it('서비스 계정에 붙이면 장면에서 파드 B·노드 IAM 역할·네트워크 정책이 흐리다', async () => {
    render(<PodPermissionsDiagram />)
    await expectIrsaDimsOthers()
  })

  it('약어 IRSA를 버튼에도 그림에도 캡션에도 쓰지 않는다', () => {
    render(<PodPermissionsDiagram />)
    const figure = screen.getByRole('figure', { name: 'EKS 파드 권한 도식' })

    for (const button of screen.getAllByRole('button')) expect(button.textContent).not.toMatch(/IRSA/u)
    expect(figure.textContent).not.toMatch(/IRSA/u)
    expect(JSON.stringify(visualsByTopicId[topicId].diagrams['pod-permissions'])).not.toMatch(/IRSA/u)
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 경로가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<PodPermissionsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['pod-permissions']
    const ids = podPermissionsScenarios.map(({ id }) => id).sort()
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
    expect(text.label).toBe('EKS 파드 권한 도식')
    expect(text.svgLabel).toBe('노드 IAM 역할·서비스 계정용 IAM 역할·네트워크 정책')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = podPermissionsScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 서비스 계정용 IAM 역할 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: 'EKS 파드 권한 도식' })

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

    it('440×184 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<PodPermissionsDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 184')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·그룹 id 집합과 시나리오로 나타나는 경로 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<PodPermissionsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 288')
      const tallNodes = ids('[data-node]', 'data-node')
      const tallGroups = ids('[data-group]', 'data-group')
      const tallPathIds = await collectPathIds()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 184')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(tallNodes).toEqual([...allNodes].sort())
      expect(ids('[data-group]', 'data-group')).toEqual(tallGroups)
      expect(tallGroups).toEqual(Object.keys(groupLabels).sort())
      expect(tallPathIds).toEqual(Object.keys(tallPaths).sort())
      expect(await collectPathIds()).toEqual(tallPathIds)
    })

    it('모든 rect가 440×184 viewBox 안에 있고 노드 라벨·그룹 라벨이 자기 상자 안에 들어간다', () => {
      render(<PodPermissionsDiagram />)
      expectFits([0, 0, 440, 184])
    })

    it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 0..440 안에 있다', async (label) => {
      render(<PodPermissionsDiagram />)
      await selectScenario(label)

      expect(diagram().querySelectorAll('[data-group]')).toHaveLength(1)
      for (const text of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(text.closest('[opacity]')).toBeNull()
      for (const text of diagram().querySelectorAll('[data-note]')) {
        expect(text).toHaveAttribute('font-size', '9')
        const box = noteBox(text)
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width).toBeLessThanOrEqual(440)
      }
      for (const id of Object.keys(groupLabels)) {
        const area = groupLabelArea(id)
        expect(area.x).toBeGreaterThanOrEqual(0)
        expect(area.x + area.width).toBeLessThanOrEqual(440)
      }
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·경로·곁말·캡션을 보이고 곁말은 노드·그룹 라벨·경로와 겹치지 않는다', async (scenario) => {
      const { container } = render(<PodPermissionsDiagram />)
      await expectScenario(scenario, wideNotes, widePaths, 440, container)
    })

    it('어떤 경로도 그룹 라벨 자리를 지나지 않는다', async () => {
      render(<PodPermissionsDiagram />)
      await expectPathsAvoidGroupLabels()
    })

    it('파드 둘은 노드 박스 안이고 IAM 역할 둘과 OIDC 공급자만 파랑이다', () => {
      render(<PodPermissionsDiagram />)
      expectMembershipAndColors()
    })

    it('경로 양 끝은 정한 상자의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<PodPermissionsDiagram />)
      await expectPathEnds()
    })

    it('노드 역할은 노드 박스에, 서비스 계정은 파드 A에 닿고 IAM 쪽 경로는 파드 B에 닿지 않는다', async () => {
      render(<PodPermissionsDiagram />)
      await expectIamPathsAvoidPodB()
    })

    it('서비스 계정에 붙이면 장면에서 파드 B·노드 IAM 역할·네트워크 정책이 흐리다', async () => {
      render(<PodPermissionsDiagram />)
      await expectIrsaDimsOthers()
    })

    it('약어 IRSA를 버튼에도 그림에도 쓰지 않는다', () => {
      render(<PodPermissionsDiagram />)
      const figure = screen.getByRole('figure', { name: 'EKS 파드 권한 도식' })

      for (const button of screen.getAllByRole('button')) expect(button.textContent).not.toMatch(/IRSA/u)
      expect(figure.textContent).not.toMatch(/IRSA/u)
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 경로가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<PodPermissionsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 288')
      await selectScenario('서비스 계정에 붙이면')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '서비스 계정에 붙이면' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['oidc-irsa-role', 'irsa-role-sa', 'sa-pod-a'])
      for (const path of paths) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      for (const note of diagram().querySelectorAll('[data-note]')) {
        expect(note).toHaveAttribute('x', String(wideNotes[note.getAttribute('data-note')! as NoteId].x))
      }
    })
  })
})
