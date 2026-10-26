import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { EcsStructureDiagram, ecsStructureScenarios } from './EcsStructureDiagram'

const topicId = 'ecs-eks-fargate'
const anchorConceptId = `${topicId}.ecs`
const fargateConceptId = `${topicId}.fargate`
const labels = {
  taskdef: '태스크 정의',
  service: '서비스',
  'ec2-task-1': '태스크',
  'ec2-task-2': '태스크',
  'fg-task-1': '태스크',
  'fg-task-2': '태스크',
}
const groupLabels = { ec2: 'EC2 인스턴스', fargate: 'Fargate' }
const noteLabels = {
  'user-managed': '사용자가 관리',
  'aws-managed': 'AWS가 관리',
  stopped: '멈춘 태스크',
  restarted: '같은 정의로 새로 시작',
}
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

const tallPaths: Record<string, string> = {
  'taskdef-service': 'M128 24 H152',
  'service-ec2': 'M180 40 V52 H100 V64',
  'service-fargate': 'M230 40 V64',
  'restart': 'M152 32 H140 V152 H124',
}
const widePaths: Record<string, string> = {
  'taskdef-service': 'M108 88 H128',
  'service-ec2': 'M174 72 V48 H244',
  'service-fargate': 'M174 104 V144 H244',
  'restart': 'M220 80 H236 V56 H256',
}
// 경로마다 출발과 도착. 서비스에서 나가는 두 경로는 그룹 박스의 변에서 끝난다 — 태스크가 그 박스 안에서 돈다는 뜻이다.
const ends: Record<string, [string, string]> = {
  'taskdef-service': ['node:taskdef', 'node:service'],
  'service-ec2': ['node:service', 'group:ec2'],
  'service-fargate': ['node:service', 'group:fargate'],
  'restart': ['node:service', 'node:ec2-task-2'],
}

// stopped는 두 태스크 상자(아래 변 120, 위 변 136) 사이에 든다. 한글 글리프 윗선이 기준선 위 8이라(Windows Chrome 실측)
// 128이면 위 상자 테두리에 닿는다. 131이면 위로 2.25, 아래로 3.25가 남는다.
const tallNotes: NotePlaces = {
  'user-managed': { x: 70, y: 208, anchor: 'middle' },
  'aws-managed': { x: 210, y: 208, anchor: 'middle' },
  stopped: { x: 70, y: 131, anchor: 'middle' },
  restarted: { x: 70, y: 184, anchor: 'middle' },
}
const wideNotes: NotePlaces = {
  'user-managed': { x: 428, y: 22, anchor: 'end' },
  'aws-managed': { x: 428, y: 118, anchor: 'end' },
  stopped: { x: 386, y: 84, anchor: 'middle' },
  restarted: { x: 298, y: 84, anchor: 'middle' },
}

const allNodes = Object.keys(labels)
const members: Record<string, string[]> = { ec2: ['ec2-task-1', 'ec2-task-2'], fargate: ['fg-task-1', 'fg-task-2'] }
const outsideNodes = ['taskdef', 'service']
const question = 'ECS에서 태스크는 무엇으로 만들어지고 어디에서 돌까?'
const idleCaption = '방식을 고르면 서비스가 태스크 정의로 띄운 태스크가 어디에서 도는지 볼 수 있다.'
const legend = '회색: 태스크 정의·서비스·태스크. 왼쪽 큰 박스가 EC2 인스턴스, 오른쪽이 Fargate다.'
const expectedScenarios = [
  {
    id: 'ec2', label: 'EC2 기반',
    nodes: ['taskdef', 'service', 'ec2-task-1', 'ec2-task-2'],
    paths: ['taskdef-service', 'service-ec2'],
    notes: ['user-managed'],
    caption: '태스크가 사용자가 관리하는 EC2 인스턴스에서 돈다. 구성을 조정할 수 있지만 운영 부담이 크다.',
    sources: [anchorConceptId],
  },
  {
    id: 'fargate', label: 'Fargate 기반',
    nodes: ['taskdef', 'service', 'fg-task-1', 'fg-task-2'],
    paths: ['taskdef-service', 'service-fargate'],
    notes: ['aws-managed'],
    caption: '서버 관리와 확장·축소를 AWS가 맡는다. 사용자가 관리할 인스턴스가 없다.',
    sources: [anchorConceptId, fargateConceptId],
  },
  {
    id: 'restart', label: '태스크가 멈추면',
    nodes: ['service', 'ec2-task-2'],
    paths: ['restart'],
    notes: ['stopped', 'restarted'],
    caption: '태스크가 멈추면 서비스가 같은 태스크 정의로 새 태스크를 시작해 정해 둔 수를 맞춘다.',
    sources: [anchorConceptId],
  },
]

function diagram() {
  return screen.getByRole('img', { name: '태스크 정의·서비스·EC2 인스턴스와 Fargate의 태스크' })
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

// 'node:노드 id' 또는 'group:그룹 id'를 상자로 바꾼다.
function endBox(end: string) {
  const [kind, id] = end.split(':')
  return kind === 'group' ? groupBox(id) : nodeBox(id)
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
  for (let i = 0; i < shownNotes.length; i += 1) {
    for (let j = i + 1; j < shownNotes.length; j += 1) {
      expect(overlaps(noteBox(shownNotes[i]), noteBox(shownNotes[j])), '곁말끼리').toBe(false)
    }
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

// 태스크 넷은 자기 박스 안이고, 태스크 정의와 서비스는 어느 박스와도 겹치지 않는다. 모두 회색이다.
function expectMembershipAndColors() {
  for (const [groupId, nodeIds] of Object.entries(members)) {
    for (const id of nodeIds) expect(boxesOutsideViewBox([nodeBox(id)], frameOf(groupBox(groupId))), `${id} ⊂ ${groupId}`).toEqual([])
  }
  for (const id of outsideNodes) {
    for (const groupId of Object.keys(members)) expect(overlaps(nodeBox(id), groupBox(groupId)), `${id} ∩ ${groupId}`).toBe(false)
  }
  for (const id of allNodes) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="diagram-managed"], [class*="diagram-resource"]')).toBeNull()
}

// 경로 양 끝은 정한 노드나 그룹 박스의 변에 닿고, 어떤 선분도 노드 안을 지나지 않는다.
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

// 멈춘 태스크는 흐려지고, 새 태스크로 가는 화살표 하나만 보인다.
async function expectRestart() {
  await selectScenario('태스크가 멈추면')
  expect(diagram().querySelector('[data-node="ec2-task-1"]')).toHaveAttribute('opacity', '0.25')
  expect(diagram().querySelector('[data-note="stopped"]')!.textContent).toBe('멈춘 태스크')
  expect(shownIds('[data-path]', 'data-path')).toEqual(['restart'])
  const { end } = pathEnds('restart')
  expect(onEdge(end.x, end.y, nodeBox('ec2-task-2'))).toBe(true)
}

async function expectUniqueMarkers() {
  render(<><EcsStructureDiagram /><EcsStructureDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: 'ECS 구성 도식' })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'EC2 기반' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(2)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('EcsStructureDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<EcsStructureDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 여섯 개가 모두 선명하고 경로·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<EcsStructureDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual([...allNodes].sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·경로·곁말만 보이고 나머지 노드는 흐려진다', async (scenario) => {
    const { container } = render(<EcsStructureDiagram />)
    await expectScenario(scenario, tallNotes, tallPaths, 280, container)
  })

  it('장면을 바꾸면 이전 경로·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<EcsStructureDiagram />)
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

  it('그룹 둘과 노드 여섯 개가 280×216 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<EcsStructureDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 216')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 216])
  })

  it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 0..280 안에 있다', async (label) => {
    render(<EcsStructureDiagram />)
    await selectScenario(label)

    expect(diagram().querySelectorAll('[data-group]')).toHaveLength(2)
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
    render(<EcsStructureDiagram />)
    await expectPathsAvoidGroupLabels()
  })

  it('태스크 넷은 자기 박스 안이고 태스크 정의와 서비스는 박스 밖이며 모두 회색이다', () => {
    render(<EcsStructureDiagram />)
    expectMembershipAndColors()
  })

  it('경로 양 끝은 정한 노드·그룹 박스의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<EcsStructureDiagram />)
    await expectPathEnds()
  })

  it('태스크가 멈추면 장면에서 멈춘 태스크는 흐려지고 새 태스크로 가는 경로 하나만 보인다', async () => {
    render(<EcsStructureDiagram />)
    await expectRestart()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 경로가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<EcsStructureDiagram />)
    const text = visualsByTopicId[topicId].diagrams['ecs-structure']
    const ids = ecsStructureScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([anchorConceptId, fargateConceptId])
    expect(text.label).toBe('ECS 구성 도식')
    expect(text.svgLabel).toBe('태스크 정의·서비스·EC2 인스턴스와 Fargate의 태스크')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = ecsStructureScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 ECS 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: 'ECS 구성 도식' })

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

    it('440×192 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<EcsStructureDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 192')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·그룹 id 집합과 시나리오로 나타나는 경로 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<EcsStructureDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 216')
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
      render(<EcsStructureDiagram />)
      expectFits([0, 0, 440, 192])
    })

    it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 0..440 안에 있다', async (label) => {
      render(<EcsStructureDiagram />)
      await selectScenario(label)

      expect(diagram().querySelectorAll('[data-group]')).toHaveLength(2)
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
      const { container } = render(<EcsStructureDiagram />)
      await expectScenario(scenario, wideNotes, widePaths, 440, container)
    })

    it('어떤 경로도 그룹 라벨 자리를 지나지 않는다', async () => {
      render(<EcsStructureDiagram />)
      await expectPathsAvoidGroupLabels()
    })

    it('태스크 넷은 자기 박스 안이고 태스크 정의와 서비스는 박스 밖이며 모두 회색이다', () => {
      render(<EcsStructureDiagram />)
      expectMembershipAndColors()
    })

    it('경로 양 끝은 정한 노드·그룹 박스의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<EcsStructureDiagram />)
      await expectPathEnds()
    })

    it('태스크가 멈추면 장면에서 멈춘 태스크는 흐려지고 새 태스크로 가는 경로 하나만 보인다', async () => {
      render(<EcsStructureDiagram />)
      await expectRestart()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 경로가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<EcsStructureDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 216')
      await selectScenario('태스크가 멈추면')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '태스크가 멈추면' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['restart'])
      for (const path of paths) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      for (const note of diagram().querySelectorAll('[data-note]')) {
        expect(note).toHaveAttribute('x', String(wideNotes[note.getAttribute('data-note')! as NoteId].x))
      }
    })
  })
})
