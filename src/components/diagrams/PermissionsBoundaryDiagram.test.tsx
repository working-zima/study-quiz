import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { PermissionsBoundaryDiagram, permissionsBoundaryScenarios } from './PermissionsBoundaryDiagram'

const topicId = 'iam-permissions'
const anchorConceptId = `${topicId}.permissions-boundary`
const labels = {
  'policy-only': '경계 밖',
  effective: '실제 권한',
  'boundary-only': '정책에 없음',
  request: '경계 없는 역할 생성 요청',
  scp: 'SCP',
  rejected: '생성 거부',
  created: '규정 어긴 역할',
  found: '나중에 찾아 지움',
}
const groupLabels = { 'policy-range': '붙인 정책', 'boundary-range': '권한 경계' }
const noteLabels = {
  'not-usable': '쓸 수 없음',
  'not-granted': '부여되지 않음',
  'scp-requires': '경계 부착을 요구',
  'never-created': '역할이 생기지 않음',
  'exists-until': '지우기 전까지 존재',
}
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

const tallPaths: Record<string, string> = {
  'request-scp': 'M100 192 V224',
  'scp-rejected': 'M70 256 V288',
  'request-created': 'M180 192 V224',
  'created-found': 'M210 256 V288',
}
const widePaths: Record<string, string> = {
  'request-scp': 'M300 40 V72',
  'scp-rejected': 'M292 104 V136',
  'request-created': 'M388 40 V72',
  'created-found': 'M388 104 V136',
}
// 경로마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'request-scp': ['request', 'scp'],
  'scp-rejected': ['scp', 'rejected'],
  'request-created': ['request', 'created'],
  'created-found': ['created', 'found'],
}

const tallNotes: NotePlaces = {
  'not-usable': { x: 228, y: 82, anchor: 'middle' },
  'not-granted': { x: 48, y: 122, anchor: 'middle' },
  'scp-requires': { x: 94, y: 216, anchor: 'end' },
  'never-created': { x: 70, y: 336, anchor: 'middle' },
  'exists-until': { x: 210, y: 336, anchor: 'middle' },
}
const wideNotes: NotePlaces = {
  'not-usable': { x: 198, y: 82, anchor: 'middle' },
  'not-granted': { x: 44, y: 122, anchor: 'middle' },
  'scp-requires': { x: 306, y: 60, anchor: 'start' },
  'never-created': { x: 292, y: 184, anchor: 'middle' },
  'exists-until': { x: 388, y: 184, anchor: 'middle' },
}

const allNodes = Object.keys(labels)
const managed = ['effective', 'scp', 'found']
const flowNodes = ['request', 'scp', 'rejected', 'created', 'found']
const question = '넓은 정책을 붙여도 권한이 넘지 않게 하려면?'
const idleCaption = '장면을 고르면 경계가 실제 권한을 어떻게 줄이고, 경계 없는 역할을 어떻게 막는지 볼 수 있다.'
const legend = '파랑: 실제 권한과 이를 지키는 장치 · 회색: 쓸 수 없는 권한과 역할 생성 쪽. 겹친 두 박스는 붙인 정책과 권한 경계의 범위다.'
const diagramSources = [`${topicId}.permissions-boundary`, `${topicId}.iam-policy`]
const expectedScenarios = [
  {
    id: 'boundary', label: '경계를 붙이면',
    nodes: ['effective'],
    paths: [] as string[],
    notes: ['not-usable', 'not-granted'],
    caption: '실제 권한은 붙인 정책과 권한 경계가 겹치는 범위다. 경계만으로는 권한이 생기지 않는다.',
    sources: [`${topicId}.permissions-boundary`, `${topicId}.iam-policy`],
  },
  {
    id: 'scp', label: 'SCP가 부착 요구',
    nodes: ['request', 'scp', 'rejected'],
    paths: ['request-scp', 'scp-rejected'],
    notes: ['scp-requires', 'never-created'],
    caption: '역할을 만들 때 경계 부착을 요구하는 SCP를 걸면 경계 없는 역할은 처음부터 만들어지지 않는다.',
    sources: [`${topicId}.permissions-boundary`],
  },
  {
    id: 'detect', label: '나중에 찾아 지움',
    nodes: ['request', 'created', 'found'],
    paths: ['request-created', 'created-found'],
    notes: ['exists-until'],
    caption: '어긴 역할을 나중에 찾아 지우는 방식은 만들어진 뒤에야 작동한다. 지우기 전까지 그 역할이 있다.',
    sources: [`${topicId}.permissions-boundary`],
  },
]

function diagram() {
  return screen.getByRole('img', { name: '붙인 정책과 권한 경계가 겹치는 범위, 경계 부착 요구' })
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

function opacityOf(id: string) {
  return diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')
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

function contains(box: SvgBox, x: number, y: number) {
  return x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height
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

// 보이는 경로 가운데 그 노드 상자의 변에서 끝나는 것.
function pathsEndingOn(id: string) {
  const box = nodeBox(id)
  return shownIds('[data-path]', 'data-path').filter((path) => {
    const { end } = pathEnds(path)
    return onEdge(end.x, end.y, box)
  })
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
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 상자 안에, 그룹 라벨은 자기 박스 오른쪽 끝 안에 들어간다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(10)
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

// 그룹 라벨이 차지하는 영역(가로 x + 10부터 글자 폭, 세로 y + 7..y + 16)을 어떤 경로 선분도 지나지 않는다.
async function expectPathsAvoidGroupLabels() {
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    for (const [id, wording] of Object.entries(groupLabels)) {
      const group = groupBox(id)
      const area: SvgBox = { id, x: group.x + 10, y: group.y + 7, width: estimateTextWidth(wording, 9), height: 9 }
      for (const path of diagram().querySelectorAll('[data-path]')) {
        for (const segment of segments(path.getAttribute('d')!)) {
          expect(touches(segment, area), `${path.getAttribute('data-path')} ↔ ${wording}`).toBe(false)
        }
      }
    }
  }
}

// 실제 권한은 두 박스 모두의 안, 경계 밖·정책에 없음은 자기 박스 안에만 있다. 흐름 노드 다섯은 어느 박스와도 겹치지 않는다.
// 각 그룹 라벨의 왼쪽 끝 점은 다른 박스 안에 놓이지 않는다.
function expectMembership() {
  const policy = groupBox('policy-range')
  const boundary = groupBox('boundary-range')

  expect(boxesOutsideViewBox([nodeBox('effective')], frameOf(policy)), 'effective ⊂ policy-range').toEqual([])
  expect(boxesOutsideViewBox([nodeBox('effective')], frameOf(boundary)), 'effective ⊂ boundary-range').toEqual([])
  expect(boxesOutsideViewBox([nodeBox('policy-only')], frameOf(policy)), 'policy-only ⊂ policy-range').toEqual([])
  expect(overlaps(nodeBox('policy-only'), boundary), 'policy-only ↔ boundary-range').toBe(false)
  expect(boxesOutsideViewBox([nodeBox('boundary-only')], frameOf(boundary)), 'boundary-only ⊂ boundary-range').toEqual([])
  expect(overlaps(nodeBox('boundary-only'), policy), 'boundary-only ↔ policy-range').toBe(false)
  for (const id of flowNodes) {
    for (const group of Object.keys(groupLabels)) expect(overlaps(nodeBox(id), groupBox(group)), `${id} ↔ ${group}`).toBe(false)
  }

  const others: Record<string, SvgBox> = { 'policy-range': boundary, 'boundary-range': policy }
  for (const id of Object.keys(groupLabels)) {
    const group = groupBox(id)
    expect(contains(others[id], group.x + 10, group.y + 14), `${id} 라벨`).toBe(false)
  }
}

// 실제 권한과 이를 지키는 장치만 파랑이고 나머지는 회색이며, 청록은 쓰지 않는다.
function expectColors() {
  for (const id of allNodes) {
    expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass(managed.includes(id) ? 'stroke-diagram-managed' : 'stroke-disabled')
  }
  expect(diagram().querySelector('.stroke-diagram-resource')).toBeNull()
}

// 경계를 붙이면 경로 없이 실제 권한만 선명하다. SCP 장면은 역할에 닿지 않고, 나중에 지우는 장면은 SCP 쪽에 닿지 않는다.
async function expectSceneSeparation() {
  await selectScenario('경계를 붙이면')
  expect(shownIds('[data-path]', 'data-path')).toEqual([])
  expect(allNodes.filter((id) => opacityOf(id) === '1')).toEqual(['effective'])

  await selectScenario('SCP가 부착 요구')
  expect(pathsEndingOn('created')).toEqual([])
  expect(pathsEndingOn('rejected')).toEqual(['scp-rejected'])

  await selectScenario('나중에 찾아 지움')
  expect(pathsEndingOn('scp')).toEqual([])
  expect(pathsEndingOn('rejected')).toEqual([])
  expect(pathsEndingOn('found')).toEqual(['created-found'])
}

// 경로 양 끝은 두 노드의 변에 닿고, 어떤 선분도 노드 안을 지나지 않는다.
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
      expect(onEdge(start.x, start.y, nodeBox(from)), `${id} 시작`).toBe(true)
      expect(onEdge(end.x, end.y, nodeBox(to)), `${id} 끝`).toBe(true)
    }
  }
}

async function expectUniqueMarkers() {
  render(<><PermissionsBoundaryDiagram /><PermissionsBoundaryDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: '권한 경계 도식' })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'SCP가 부착 요구' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(2)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('PermissionsBoundaryDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<PermissionsBoundaryDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 여덟 개가 모두 선명하고 경로·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<PermissionsBoundaryDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual([...allNodes].sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·경로·곁말만 보이고 나머지 노드는 흐려진다', async (scenario) => {
    const { container } = render(<PermissionsBoundaryDiagram />)
    await expectScenario(scenario, tallNotes, tallPaths, 280, container)
  })

  it('장면을 바꾸면 이전 경로·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<PermissionsBoundaryDiagram />)
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

  it('그룹 둘과 노드 여덟 개가 280×344 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<PermissionsBoundaryDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 344')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 344])
  })

  it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 0..280 안에 있다', async (label) => {
    render(<PermissionsBoundaryDiagram />)
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

  it('어떤 경로도 그룹 라벨 자리를 지나지 않는다', async () => {
    render(<PermissionsBoundaryDiagram />)
    await expectPathsAvoidGroupLabels()
  })

  it('실제 권한은 두 박스 모두의 안이고 다른 노드의 소속과 그룹 라벨 자리가 지정대로다', () => {
    render(<PermissionsBoundaryDiagram />)
    expectMembership()
  })

  it('실제 권한·SCP·나중에 찾아 지움만 파랑이고 나머지는 회색이다', () => {
    render(<PermissionsBoundaryDiagram />)
    expectColors()
  })

  it('경계 장면에는 경로가 없고, SCP 장면은 역할에, 나중에 지우는 장면은 SCP 쪽에 닿지 않는다', async () => {
    render(<PermissionsBoundaryDiagram />)
    await expectSceneSeparation()
  })

  it('경로 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<PermissionsBoundaryDiagram />)
    await expectPathEnds()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 경로가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<PermissionsBoundaryDiagram />)
    const text = visualsByTopicId[topicId].diagrams.boundary
    const ids = permissionsBoundaryScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual(diagramSources)
    expect(text.label).toBe('권한 경계 도식')
    expect(text.svgLabel).toBe('붙인 정책과 권한 경계가 겹치는 범위, 경계 부착 요구')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = permissionsBoundaryScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 권한 경계 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: '권한 경계 도식' })

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
      render(<PermissionsBoundaryDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 192')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·그룹 id 집합과 시나리오로 나타나는 경로 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<PermissionsBoundaryDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 344')
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
      render(<PermissionsBoundaryDiagram />)
      expectFits([0, 0, 440, 192])
    })

    it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 0..440 안에 있다', async (label) => {
      render(<PermissionsBoundaryDiagram />)
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
      const { container } = render(<PermissionsBoundaryDiagram />)
      await expectScenario(scenario, wideNotes, widePaths, 440, container)
    })

    it('어떤 경로도 그룹 라벨 자리를 지나지 않는다', async () => {
      render(<PermissionsBoundaryDiagram />)
      await expectPathsAvoidGroupLabels()
    })

    it('실제 권한은 두 박스 모두의 안이고 다른 노드의 소속과 그룹 라벨 자리가 지정대로다', () => {
      render(<PermissionsBoundaryDiagram />)
      expectMembership()
    })

    it('실제 권한·SCP·나중에 찾아 지움만 파랑이고 나머지는 회색이다', () => {
      render(<PermissionsBoundaryDiagram />)
      expectColors()
    })

    it('경계 장면에는 경로가 없고, SCP 장면은 역할에, 나중에 지우는 장면은 SCP 쪽에 닿지 않는다', async () => {
      render(<PermissionsBoundaryDiagram />)
      await expectSceneSeparation()
    })

    it('경로 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<PermissionsBoundaryDiagram />)
      await expectPathEnds()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 경로가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<PermissionsBoundaryDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 344')
      await selectScenario('SCP가 부착 요구')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: 'SCP가 부착 요구' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['request-scp', 'scp-rejected'])
      for (const path of paths) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      for (const note of diagram().querySelectorAll('[data-note]')) {
        const id = note.getAttribute('data-note')! as NoteId
        expect(note).toHaveAttribute('x', String(wideNotes[id].x))
        expect(note).toHaveAttribute('text-anchor', wideNotes[id].anchor)
      }
    })
  })
})
