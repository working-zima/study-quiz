import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { HierarchyInheritanceDiagram, hierarchyInheritanceScenarios } from './HierarchyInheritanceDiagram'

const topicId = 'azure-resource-hierarchy'
const anchorConceptId = `${topicId}.hierarchy`
const labels = {
  'root': '테넌트 루트 그룹',
  'mg-prod': '관리 그룹: 운영',
  'mg-dev': '관리 그룹: 개발',
  'sub-a': '구독 A',
  'sub-b': '구독 B',
  'sub-c': '구독 C',
  'rg-web': '리소스 그룹: 웹',
  'vm-1': 'VM 1',
}
const noteLabels = {
  'policy-note': '정책을 건 곳',
  'inherit-note': '물려받음',
  'sub-role-note': '역할 할당',
  'rg-role-note': '역할 할당',
}
type NodeId = keyof typeof labels
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>
type Links = Record<string, string>

const tallLinks: Links = {
  'root-mg-prod': 'M94 40 V64',
  'root-mg-dev': 'M186 40 V64',
  'mg-prod-sub-a': 'M32 96 V120',
  'mg-prod-sub-b': 'M96 96 V108 H144 V120',
  'mg-dev-sub-c': 'M248 96 V120',
  'sub-a-rg-web': 'M32 152 V176',
  'rg-web-vm-1': 'M32 208 V232',
}
const wideLinks: Links = {
  'root-mg-prod': 'M200 40 V60',
  'root-mg-dev': 'M290 40 V60',
  'mg-prod-sub-a': 'M144 92 V112',
  'mg-prod-sub-b': 'M208 92 V112',
  'mg-dev-sub-c': 'M334 92 V112',
  'sub-a-rg-web': 'M144 144 V164',
  'rg-web-vm-1': 'M144 196 V216',
}
const tallNotes: NotePlaces = {
  'policy-note': { x: 108, y: 83, anchor: 'start' },
  'inherit-note': { x: 64, y: 251, anchor: 'start' },
  'sub-role-note': { x: 64, y: 139, anchor: 'start' },
  'rg-role-note': { x: 108, y: 195, anchor: 'start' },
}
const wideNotes: NotePlaces = {
  'policy-note': { x: 112, y: 79, anchor: 'end' },
  'inherit-note': { x: 112, y: 235, anchor: 'end' },
  'sub-role-note': { x: 112, y: 131, anchor: 'end' },
  'rg-role-note': { x: 112, y: 183, anchor: 'end' },
}
// 곁말이 가리키는 노드. 곁말은 그 노드와 같은 줄에 있다.
const noteNode: Record<NoteId, NodeId> = {
  'policy-note': 'mg-prod',
  'inherit-note': 'vm-1',
  'sub-role-note': 'sub-a',
  'rg-role-note': 'rg-web',
}
// 부모 → 자식. 연결선의 끝점에서 읽은 나무가 이것과 같아야 한다.
const expectedChildren: Record<NodeId, NodeId[]> = {
  'root': ['mg-dev', 'mg-prod'],
  'mg-prod': ['sub-a', 'sub-b'],
  'mg-dev': ['sub-c'],
  'sub-a': ['rg-web'],
  'sub-b': [],
  'sub-c': [],
  'rg-web': ['vm-1'],
  'vm-1': [],
}

const allNodes = Object.keys(labels) as NodeId[]
const question = '한 층에 건 규칙은, 아래 어디까지 내려갈까?'
const idleCaption = '회사 A의 테넌트 루트 그룹 아래에 관리 그룹 「운영」과 「개발」이 있고, 「운영」 아래에 구독 A·B가, 「개발」 아래에 구독 C가 있다. 구독 A 안에는 리소스 그룹 「웹」과 VM 1이 있다. 버튼을 고르면 한 층에 건 정책이나 역할 할당이 어디까지 미치는지 볼 수 있다.'
const legend = '선은 위의 단위가 바로 아래 단위를 담는다는 뜻이다. 맨 아래 VM 1은 리소스이고, 구독과 리소스의 수는 예다. 시나리오를 고르면 정책이나 역할 할당이 미치는 곳만 선명하게 남는다.'
const figureName = '테넌트 루트 그룹 아래로 관리 그룹·구독·리소스 그룹·리소스가 이어진 계층에서, 한 층에 건 정책이나 역할 할당이 어디까지 미치는지 보는 도식'
const svgName = '테넌트 루트 그룹 아래에 관리 그룹 「운영」과 「개발」이 있고, 「운영」 아래에 구독 A와 구독 B가, 「개발」 아래에 구독 C가 있다. 구독 A 안에는 리소스 그룹 「웹」이, 그 안에는 VM 1이 있다'
const expectedScenarios = [
  {
    id: 'at-mg', label: '관리 그룹에 정책', target: 'mg-prod' as NodeId,
    nodes: ['mg-prod', 'sub-a', 'sub-b', 'rg-web', 'vm-1'],
    dimmed: ['root', 'mg-dev', 'sub-c'],
    notes: ['policy-note', 'inherit-note'],
    caption: '관리 그룹 「운영」에 VM을 둘 수 있는 지역을 한 곳으로 제한하는 정책을 걸면, 그 아래 구독 A·B와 리소스 그룹 「웹」, VM 1이 모두 이 정책을 물려받는다. 구독 A의 소유자도 이 정책을 바꿀 수 없다. 「개발」 아래의 구독 C에는 미치지 않는다.',
    sources: ['azure-resource-hierarchy.hierarchy'],
  },
  {
    id: 'at-sub', label: '구독에 역할 할당', target: 'sub-a' as NodeId,
    nodes: ['sub-a', 'rg-web', 'vm-1'],
    dimmed: ['root', 'mg-prod', 'mg-dev', 'sub-b', 'sub-c'],
    notes: ['sub-role-note'],
    caption: '구독 A에 역할 할당을 만들면, 그 접근 권한은 구독 A 안의 리소스 그룹 「웹」과 VM 1에 미친다. 같은 관리 그룹 「운영」 아래에 있어도 구독 B에는 미치지 않는다.',
    sources: ['azure-resource-hierarchy.hierarchy'],
  },
  {
    id: 'at-rg', label: '리소스 그룹에 역할 할당', target: 'rg-web' as NodeId,
    nodes: ['rg-web', 'vm-1'],
    dimmed: ['root', 'mg-prod', 'mg-dev', 'sub-a', 'sub-b', 'sub-c'],
    notes: ['rg-role-note'],
    caption: '리소스 그룹 「웹」에 역할 할당을 만들면, 그 접근 권한은 만든 층인 리소스 그룹 「웹」과 그 아래의 VM 1에만 미친다. 세 경우 가운데 가장 아래층에 걸어서, 미치는 곳도 가장 좁다.',
    sources: ['azure-resource-hierarchy.hierarchy'],
  },
]

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

// 글자가 차지하는 상자. 높이는 글자 크기 9를 기준선 위로 잡는다.
function textBox(text: Element): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9)
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id: text.getAttribute('data-note')!, x: left, y: y - 9, width, height: 9 }
}

// 반각 글자는 화면에서 더 넓다 — 1.15배로 잡는다. 글자 붙임 기준(start·end)은 그대로 둔다.
function wideTextBox(text: Element): SvgBox {
  const box = textBox(text)
  const width = box.width * 1.15
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? box.x + box.width - width : anchor === 'middle' ? box.x + box.width / 2 - width / 2 : box.x
  return { ...box, x: left, width }
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

function onBottomEdge(x: number, y: number, box: SvgBox) {
  return y === box.y + box.height && x > box.x && x < box.x + box.width
}

function onTopEdge(x: number, y: number, box: SvgBox) {
  return y === box.y && x > box.x && x < box.x + box.width
}

function opacityOf(id: string) {
  return diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')
}

// 연결선의 끝점에서 나무를 읽는다. 시작점이 아랫변에 놓인 노드가 부모, 끝점이 윗변에 놓인 노드가 자식이다.
function readTree() {
  const children: Record<string, string[]> = Object.fromEntries(allNodes.map((id) => [id, []]))
  for (const link of diagram().querySelectorAll('[data-link]')) {
    const list = segments(link.getAttribute('d')!)
    const start = list[0]
    const end = list[list.length - 1]
    const parents = allNodes.filter((id) => onBottomEdge(start.x1, start.y1, nodeBox(id)))
    const kids = allNodes.filter((id) => onTopEdge(end.x2, end.y2, nodeBox(id)))
    expect(parents, `${link.getAttribute('data-link')} 시작`).toHaveLength(1)
    expect(kids, `${link.getAttribute('data-link')} 끝`).toHaveLength(1)
    children[parents[0]].push(kids[0])
  }
  for (const id of allNodes) children[id].sort()
  return children
}

function descendantsOf(id: string, children: Record<string, string[]>): string[] {
  return children[id].flatMap((child) => [child, ...descendantsOf(child, children)])
}

// 연결선은 시나리오와 상관없이 같은 모양으로 늘 보이고, 흐려지지 않으며, 화살표 마커가 없다.
function expectLinks(links: Links) {
  expect(shownIds('[data-link]', 'data-link').sort()).toEqual(Object.keys(links).sort())
  for (const [id, d] of Object.entries(links)) {
    const link = diagram().querySelector(`[data-link="${id}"]`)!
    expect(link).toHaveAttribute('d', d)
    expect(link).toHaveClass('stroke-muted')
    expect(link).toHaveAttribute('stroke-width', '1.5')
    expect(link).not.toHaveAttribute('marker-end')
    expect(link.closest('[opacity]')).toBeNull()
  }
  expect(diagram().querySelector('marker')).toBeNull()
  expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
}

// 연결선마다 이름에 적힌 부모의 아랫변에서 시작해 자식의 윗변에서 끝나고, 다른 노드 안을 지나지 않는다.
function expectLinksJoinParentAndChild(links: Links) {
  const ends: Record<string, [NodeId, NodeId]> = {
    'root-mg-prod': ['root', 'mg-prod'],
    'root-mg-dev': ['root', 'mg-dev'],
    'mg-prod-sub-a': ['mg-prod', 'sub-a'],
    'mg-prod-sub-b': ['mg-prod', 'sub-b'],
    'mg-dev-sub-c': ['mg-dev', 'sub-c'],
    'sub-a-rg-web': ['sub-a', 'rg-web'],
    'rg-web-vm-1': ['rg-web', 'vm-1'],
  }
  expect(Object.keys(links).sort()).toEqual(Object.keys(ends).sort())
  for (const [id, d] of Object.entries(links)) {
    const [parent, child] = ends[id]
    const list = segments(d)
    expect(onBottomEdge(list[0].x1, list[0].y1, nodeBox(parent)), `${id} 시작은 ${parent}의 아랫변`).toBe(true)
    expect(onTopEdge(list[list.length - 1].x2, list[list.length - 1].y2, nodeBox(child)), `${id} 끝은 ${child}의 윗변`).toBe(true)
    for (const segment of list) {
      for (const node of allNodes) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
    }
  }
}

// 아래 단언들은 배치에 묶이지 않는다. 세로형과 가로형이 같은 기대값으로 통과해야 한다.
async function expectScenario(
  scenario: typeof expectedScenarios[number],
  places: NotePlaces,
  links: Links,
  width: number,
  container: HTMLElement,
) {
  await selectScenario(scenario.label)

  for (const node of diagram().querySelectorAll('[data-node]')) {
    expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
  }
  expectLinks(links)

  const linkSegments = Object.values(links).flatMap(segments)
  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
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
    const box = wideTextBox(note)
    expect(box.x, id).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, id).toBeLessThanOrEqual(width)
    // 곁말은 자기 노드와 같은 줄에 있다.
    const holder = nodeBox(noteNode[id])
    expect(box.y, id).toBeGreaterThanOrEqual(holder.y)
    expect(box.y + box.height, id).toBeLessThanOrEqual(holder.y + holder.height)
    for (const node of nodeBoxes) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const segment of linkSegments) expect(touches(segment, box), `${id} ↔ 연결선`).toBe(false)
  }
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 노드 라벨은 반각 글자 여유(1.15배)까지 잡아도 상자 안에 들어간다. 노드끼리 겹치지 않는다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(8)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
  for (const a of boxes) for (const b of boxes) if (a !== b) expect(overlaps(a, b), `${a.id} ↔ ${b.id}`).toBe(false)

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(label, 10) * 1.15 + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
  }
  // 그룹 박스는 없다. 층은 노드 라벨과 위아래 순서로 보인다.
  expect(diagram().querySelectorAll('[data-group], [data-group-label]')).toHaveLength(0)
}

// 층마다 한 줄이다 — 위에서부터 테넌트 루트 그룹, 관리 그룹, 구독, 리소스 그룹, 리소스. 노드는 모두 회색이다.
function expectRowsAndColors() {
  const rows: NodeId[][] = [['root'], ['mg-prod', 'mg-dev'], ['sub-a', 'sub-b', 'sub-c'], ['rg-web'], ['vm-1']]
  rows.forEach((row, index) => {
    for (const id of row) expect(nodeBox(id).y, id).toBe(nodeBox(row[0]).y)
    if (index > 0) expect(nodeBox(row[0]).y, row[0]).toBeGreaterThan(nodeBox(rows[index - 1][0]).y + 32)
  })
  for (const id of allNodes) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 요점: 연결선에서 읽은 나무가 설계와 같고, 시나리오마다 선명한 노드가 「고른 노드와 그 자손 전부」와 같다.
// 고른 노드의 조상과 형제(와 그 자손)는 흐리다. 연결선은 세 시나리오와 전체에서 모두 보인다.
async function expectPoint(links: Links) {
  const children = readTree()
  expect(children).toEqual(expectedChildren)
  expectLinks(links)
  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    const vivid = allNodes.filter((id) => opacityOf(id) === '1').sort()
    expect(vivid, scenario.label).toEqual([scenario.target, ...descendantsOf(scenario.target, children)].sort())
    for (const id of scenario.dimmed) expect(opacityOf(id), `${scenario.label} ${id}`).toBe('0.25')
    expectLinks(links)
  }
  await selectScenario('전체')
  expectLinks(links)
}

describe('HierarchyInheritanceDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<HierarchyInheritanceDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 여덟이 모두 선명하고 연결선 일곱만 보이며 곁말은 없고 선택 안내가 나온다', () => {
    const { container } = render(<HierarchyInheritanceDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual([...allNodes].sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expectLinks(tallLinks)
    expect(shownIds('[data-note]', 'data-note')).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·곁말만 보이고 나머지 노드는 흐려지며 연결선은 그대로다', async (scenario) => {
    const { container } = render(<HierarchyInheritanceDiagram />)
    await expectScenario(scenario, tallNotes, tallLinks, 280, container)
  })

  it('시나리오를 바꾸면 이전 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<HierarchyInheritanceDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
    }
    await selectScenario('전체')

    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(shownIds('[data-note]', 'data-note')).toEqual([])
    expectLinks(tallLinks)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
    for (const { label } of expectedScenarios) expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'false')
  })

  it('노드 여덟이 280×272 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<HierarchyInheritanceDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 272')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 272])
  })

  it('층마다 한 줄로 위에서 아래로 놓이고 노드는 모두 회색이다', () => {
    render(<HierarchyInheritanceDiagram />)
    expectRowsAndColors()
  })

  it('연결선마다 부모 노드의 아랫변에서 자식 노드의 윗변으로 가고, 다른 노드 안을 지나지 않는다', () => {
    render(<HierarchyInheritanceDiagram />)
    expectLinksJoinParentAndChild(tallLinks)
  })

  it('연결선에서 읽은 나무가 설계와 같고, 시나리오마다 고른 노드와 그 자손만 선명하다', async () => {
    render(<HierarchyInheritanceDiagram />)
    await expectPoint(tallLinks)
  })

  it('두 번 렌더해도 각 도식에 연결선이 일곱씩이고 화살표 마커가 없다', () => {
    render(<><HierarchyInheritanceDiagram /><HierarchyInheritanceDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })

    expect(figures).toHaveLength(2)
    for (const figure of figures) {
      expect(figure.querySelectorAll('[data-link]')).toHaveLength(7)
      expect(figure.querySelector('marker')).toBeNull()
    }
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<HierarchyInheritanceDiagram />)
    const text = visualsByTopicId[topicId].diagrams.hierarchy
    const ids = hierarchyInheritanceScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toBeUndefined()
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([`${topicId}.management-group`, anchorConceptId])
    expect(text.label).toBe(figureName)
    expect(text.svgLabel).toBe(svgName)
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = hierarchyInheritanceScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: expected.sources })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual([])
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) {
      expect(conceptIds).toContain(source)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 계층 구조 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×256 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<HierarchyInheritanceDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 256')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expectLinks(wideLinks)
    })

    it('노드·연결선 id 집합이 세로형과 같다', () => {
      const { change } = mockMatchMedia(false)
      render(<HierarchyInheritanceDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 272')
      const tallNodes = ids('[data-node]', 'data-node')
      const tallLinkIds = ids('[data-link]', 'data-link')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 256')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(tallNodes).toEqual([...allNodes].sort())
      expect(ids('[data-link]', 'data-link')).toEqual(tallLinkIds)
      expect(tallLinkIds).toEqual(Object.keys(tallLinks).sort())
    })

    it('모든 rect가 440×256 viewBox 안에 있고 노드 라벨이 자기 상자 안에 들어간다', () => {
      render(<HierarchyInheritanceDiagram />)
      expectFits([0, 0, 440, 256])
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·곁말·캡션을 보이고 곁말은 노드·연결선과 겹치지 않는다', async (scenario) => {
      const { container } = render(<HierarchyInheritanceDiagram />)
      await expectScenario(scenario, wideNotes, wideLinks, 440, container)
    })

    it('층마다 한 줄로 위에서 아래로 놓이고 노드는 모두 회색이다', () => {
      render(<HierarchyInheritanceDiagram />)
      expectRowsAndColors()
    })

    it('연결선마다 부모 노드의 아랫변에서 자식 노드의 윗변으로 가고, 다른 노드 안을 지나지 않는다', () => {
      render(<HierarchyInheritanceDiagram />)
      expectLinksJoinParentAndChild(wideLinks)
    })

    it('연결선에서 읽은 나무가 설계와 같고, 시나리오마다 고른 노드와 그 자손만 선명하다', async () => {
      render(<HierarchyInheritanceDiagram />)
      await expectPoint(wideLinks)
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<HierarchyInheritanceDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 272')
      await selectScenario('구독에 역할 할당')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '구독에 역할 할당' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      for (const note of diagram().querySelectorAll('[data-note]')) {
        expect(note).toHaveAttribute('x', String(wideNotes[note.getAttribute('data-note')! as NoteId].x))
      }
    })
  })
})
