import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { AzureRegionDiagram, azureRegionScenarios } from './AzureRegionDiagram'

const topicId = 'azure-regions-zones'
const anchorConceptId = `${topicId}.region`
const labels = {
  'dc-a1': '데이터 센터',
  'dc-a2': '데이터 센터',
  'vm-1': 'VM 1',
  'dc-b1': '데이터 센터',
  'dc-b2': '데이터 센터',
  'nonregional': 'Microsoft Entra ID',
}
const groupLabels = {
  'geography': '지리',
  'region-a': '지역 A',
  'region-b': '지역 B',
}
const noteLabels = {
  'vm-note': '지역 A를 골라 배포',
  'nonregional-note': '지역을 고르지 않는다',
}
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

// 같은 지역의 데이터 센터 둘을 잇는 연결선. 늘 보이고 화살표가 아니다.
const tallLinks = { 'link-a': 'M124 66 H156', 'link-b': 'M124 182 H156' }
const wideLinks = { 'link-a': 'M110 66 H126', 'link-b': 'M318 66 H330' }
type Links = typeof tallLinks

const tallNotes: NotePlaces = {
  'vm-note': { x: 132, y: 111, anchor: 'start' },
  'nonregional-note': { x: 152, y: 247, anchor: 'start' },
}
const wideNotes: NotePlaces = {
  'vm-note': { x: 118, y: 111, anchor: 'start' },
  'nonregional-note': { x: 154, y: 169, anchor: 'start' },
}

const allNodes = Object.keys(labels)
const regionANodes = ['dc-a1', 'dc-a2', 'vm-1']
const regionBNodes = ['dc-b1', 'dc-b2']
const question = 'Azure에 리소스를 만들 때, 고르는 것은 데이터 센터일까 지역일까?'
const idleCaption = '지리 하나 안에 지역 A와 지역 B가 있고, 지역마다 데이터 센터가 있다. 버튼을 고르면 리소스를 만들 때 고객이 무엇을 고르는지, 지역을 고르지 않는 서비스는 어떤지 볼 수 있다.'
const legend = '큰 박스는 지리이고, 그 안의 박스는 지역이다. 같은 지역의 데이터 센터를 잇는 선은 대기 시간이 짧은 네트워크로 이어져 있다는 뜻이다. 지역마다 데이터 센터를 둘씩 그린 것은 예다. Microsoft Entra ID는 지역 하나에 묶이지 않아 지역 박스 밖에 그렸다.'
const figureName = 'Azure에 리소스를 만들 때 고르는 지역과 그 안의 데이터 센터 도식'
const svgName = '지리 하나 안에 데이터 센터를 둘씩 담은 지역 A와 지역 B. 지역 A에는 VM 1이 있고, 두 지역 박스 밖에 Microsoft Entra ID가 있다'
const expectedScenarios = [
  {
    id: 'deploy', label: '지역에 배포',
    nodes: ['vm-1', 'dc-a1', 'dc-a2'],
    notes: ['vm-note'],
    caption: '회사 A는 VM 1을 만들면서 지역 A를 골랐다. 지역 A 안의 어느 데이터 센터에 VM 1을 둘지는 회사 A가 고르지 않는다. 지역 안의 리소스를 배정하고 관리하는 일은 Azure가 맡는다.',
    sources: ['azure-regions-zones.region'],
  },
  {
    id: 'nonregional', label: '지역을 고르지 않는 서비스',
    nodes: ['nonregional'],
    notes: ['nonregional-note'],
    caption: 'Microsoft Entra ID는 지역 하나에 묶이지 않는 비지역 서비스다. Microsoft가 이 서비스를 여러 지역에 걸쳐 두고 운영하므로, 쓰는 쪽은 서비스 자체의 지역을 고르지 않는다.',
    sources: ['azure-regions-zones.region'],
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

function inside(box: SvgBox, group: string) {
  const frame = groupBox(group)
  return boxesOutsideViewBox([box], [frame.x, frame.y, frame.width, frame.height]).length === 0
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

// 그룹 라벨이 차지하는 자리. 반각 글자 여유(1.15배)까지 잡는다.
function groupLabelArea(id: string): SvgBox {
  const group = groupBox(id)
  return { id, x: group.x + 10, y: group.y + 5, width: estimateTextWidth(groupLabels[id as keyof typeof groupLabels], 9) * 1.15, height: 9 }
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

function opacityOf(id: string) {
  return diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')
}

// 연결선 둘은 시나리오와 상관없이 같은 모양으로 늘 보이고, 흐려지지 않으며, 화살표 마커가 없다.
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

// 연결선마다 두 끝이 같은 지역 박스 안의 데이터 센터 노드 변에 있고, 다른 노드 안·그룹 라벨 자리를 지나지 않는다.
function expectLinksJoinSameRegion(links: Links) {
  const ends: Record<keyof Links, [string, string, string]> = {
    'link-a': ['dc-a1', 'dc-a2', 'region-a'],
    'link-b': ['dc-b1', 'dc-b2', 'region-b'],
  }
  for (const [id, d] of Object.entries(links) as [keyof Links, string][]) {
    const [from, to, region] = ends[id]
    const list = segments(d)
    expect(onEdge(list[0].x1, list[0].y1, nodeBox(from)), `${id} 시작은 ${from}의 변`).toBe(true)
    expect(onEdge(list[list.length - 1].x2, list[list.length - 1].y2, nodeBox(to)), `${id} 끝은 ${to}의 변`).toBe(true)
    expect(inside(nodeBox(from), region), `${from} ⊂ ${region}`).toBe(true)
    expect(inside(nodeBox(to), region), `${to} ⊂ ${region}`).toBe(true)
    for (const segment of list) {
      for (const node of allNodes) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
      for (const group of Object.keys(groupLabels)) expect(touches(segment, groupLabelArea(group)), `${id} ↔ ${group} 라벨`).toBe(false)
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
  for (const group of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(group.closest('[opacity]')).toBeNull()
  expectLinks(links)

  const linkSegments = Object.values(links).flatMap(segments)
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
    const box = textBox(note)
    const wideBox = { ...box, width: box.width * 1.15 }
    expect(box.x, id).toBeGreaterThanOrEqual(0)
    // 반각 글자는 화면에서 더 넓다 — 1.15배로 잡아도 viewBox 안이어야 한다.
    expect(wideBox.x + wideBox.width, id).toBeLessThanOrEqual(width)
    for (const label of groupLabelBoxes) expect(overlaps(wideBox, label), `${id} ↔ ${label.id}`).toBe(false)
    for (const node of nodeBoxes) expect(overlaps(wideBox, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const segment of linkSegments) expect(touches(segment, wideBox), `${id} ↔ 연결선`).toBe(false)
  }
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 상자 안에, 그룹 라벨은 1.15배로 잡아도 자기 박스 오른쪽 끝 안에 들어간다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(9)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(label, 10) * 1.15 + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
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
    expect(x + estimateTextWidth(wording, 9) * 1.15, wording).toBeLessThanOrEqual(box.x + box.width)
  }
}

// 지리 안에 두 지역이 겹치지 않게 들고, 안쪽 박스의 라벨 자리는 바깥 박스의 라벨 자리와 겹치지 않는다.
// 노드는 자기를 담는 가장 안쪽 박스의 라벨 자리보다 아래에 있다. 노드는 모두 회색이다.
function expectMembershipAndColors() {
  expect(inside(groupBox('region-a'), 'geography')).toBe(true)
  expect(inside(groupBox('region-b'), 'geography')).toBe(true)
  expect(overlaps(groupBox('region-a'), groupBox('region-b'))).toBe(false)
  expect(overlaps(groupLabelArea('geography'), groupBox('region-a'))).toBe(false)
  expect(overlaps(groupLabelArea('geography'), groupBox('region-b'))).toBe(false)
  for (const id of regionANodes) {
    expect(inside(nodeBox(id), 'region-a'), id).toBe(true)
    expect(nodeBox(id).y, id).toBeGreaterThan(groupLabelArea('region-a').y + 9)
  }
  for (const id of regionBNodes) {
    expect(inside(nodeBox(id), 'region-b'), id).toBe(true)
    expect(nodeBox(id).y, id).toBeGreaterThan(groupLabelArea('region-b').y + 9)
  }
  for (const id of allNodes) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 요점: VM 1은 지역 A 박스 안에 있고, 지역을 고르지 않는 서비스는 어느 지역 박스에도 들지 않는다.
// 지역에 배포하면 지역 B와 비지역 서비스가 흐려지고, 비지역 서비스를 고르면 두 지역 안의 노드가 모두 흐려진다.
async function expectPoint() {
  expect(inside(nodeBox('vm-1'), 'region-a')).toBe(true)
  expect(overlaps(nodeBox('nonregional'), groupBox('region-a'))).toBe(false)
  expect(overlaps(nodeBox('nonregional'), groupBox('region-b'))).toBe(false)

  await selectScenario('지역에 배포')
  for (const id of [...regionBNodes, 'nonregional']) expect(opacityOf(id), id).toBe('0.25')
  expect(opacityOf('vm-1')).toBe('1')

  await selectScenario('지역을 고르지 않는 서비스')
  for (const id of [...regionANodes, ...regionBNodes]) expect(opacityOf(id), id).toBe('0.25')
  expect(opacityOf('nonregional')).toBe('1')
}

describe('AzureRegionDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<AzureRegionDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 여섯이 모두 선명하고 연결선 둘만 보이며 곁말은 없고 선택 안내가 나온다', () => {
    const { container } = render(<AzureRegionDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual([...allNodes].sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expectLinks(tallLinks)
    expect(shownIds('[data-note]', 'data-note')).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('연결선마다 같은 지역의 데이터 센터 둘을 잇는다', () => {
    render(<AzureRegionDiagram />)
    expectLinksJoinSameRegion(tallLinks)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·곁말만 보이고 나머지 노드는 흐려지며 연결선은 그대로다', async (scenario) => {
    const { container } = render(<AzureRegionDiagram />)
    await expectScenario(scenario, tallNotes, tallLinks, 280, container)
  })

  it('시나리오를 바꾸면 이전 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<AzureRegionDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
      expectLinks(tallLinks)
    }
    await selectScenario('전체')

    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(shownIds('[data-note]', 'data-note')).toEqual([])
    expectLinks(tallLinks)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
    for (const { label } of expectedScenarios) expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'false')
  })

  it('그룹 셋과 노드 여섯이 280×268 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<AzureRegionDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 268')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 268])
  })

  it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 0..280 안에 있다', async (label) => {
    render(<AzureRegionDiagram />)
    await selectScenario(label)

    expect(diagram().querySelectorAll('[data-group]')).toHaveLength(3)
    for (const text of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(text.closest('[opacity]')).toBeNull()
    for (const text of diagram().querySelectorAll('[data-group-label], [data-note]')) {
      expect(text).toHaveAttribute('font-size', '9')
      const box = textBox(text)
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width * 1.15).toBeLessThanOrEqual(280)
    }
  })

  it('두 지역은 지리 안에 있고 노드는 각자의 지역 박스 안에 있으며 모두 회색이다', () => {
    render(<AzureRegionDiagram />)
    expectMembershipAndColors()
  })

  it('VM 1은 지역 A 안에, 지역을 고르지 않는 서비스는 두 지역 박스 밖에 있고 시나리오마다 다른 쪽이 흐려진다', async () => {
    render(<AzureRegionDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 각 도식에 연결선이 둘씩이고 화살표 마커가 없다', () => {
    render(<><AzureRegionDiagram /><AzureRegionDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })

    expect(figures).toHaveLength(2)
    for (const figure of figures) {
      expect(figure.querySelectorAll('[data-link]')).toHaveLength(2)
      expect(figure.querySelector('marker')).toBeNull()
    }
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<AzureRegionDiagram />)
    const text = visualsByTopicId[topicId].diagrams['azure-region']
    const ids = azureRegionScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([`${topicId}.datacenter`, anchorConceptId])
    expect(text.label).toBe(figureName)
    expect(text.svgLabel).toBe(svgName)
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = azureRegionScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 지역 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×190 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<AzureRegionDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 190')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expectLinks(wideLinks)
    })

    it('노드·그룹·연결선 id 집합이 세로형과 같다', () => {
      const { change } = mockMatchMedia(false)
      render(<AzureRegionDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 268')
      const tallNodes = ids('[data-node]', 'data-node')
      const tallGroups = ids('[data-group]', 'data-group')
      const tallLinkIds = ids('[data-link]', 'data-link')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 190')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(tallNodes).toEqual([...allNodes].sort())
      expect(ids('[data-group]', 'data-group')).toEqual(tallGroups)
      expect(tallGroups).toEqual(Object.keys(groupLabels).sort())
      expect(ids('[data-link]', 'data-link')).toEqual(tallLinkIds)
    })

    it('모든 rect가 440×190 viewBox 안에 있고 노드 라벨·그룹 라벨이 자기 상자 안에 들어간다', () => {
      render(<AzureRegionDiagram />)
      expectFits([0, 0, 440, 190])
    })

    it('연결선마다 같은 지역의 데이터 센터 둘을 잇는다', () => {
      render(<AzureRegionDiagram />)
      expectLinksJoinSameRegion(wideLinks)
    })

    it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 0..440 안에 있다', async (label) => {
      render(<AzureRegionDiagram />)
      await selectScenario(label)

      expect(diagram().querySelectorAll('[data-group]')).toHaveLength(3)
      for (const text of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(text.closest('[opacity]')).toBeNull()
      for (const text of diagram().querySelectorAll('[data-group-label], [data-note]')) {
        expect(text).toHaveAttribute('font-size', '9')
        const box = textBox(text)
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width * 1.15).toBeLessThanOrEqual(440)
      }
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·곁말·캡션을 보이고 곁말은 노드·그룹 라벨·연결선과 겹치지 않는다', async (scenario) => {
      const { container } = render(<AzureRegionDiagram />)
      await expectScenario(scenario, wideNotes, wideLinks, 440, container)
    })

    it('두 지역은 지리 안에 있고 노드는 각자의 지역 박스 안에 있으며 모두 회색이다', () => {
      render(<AzureRegionDiagram />)
      expectMembershipAndColors()
    })

    it('VM 1은 지역 A 안에, 지역을 고르지 않는 서비스는 두 지역 박스 밖에 있고 시나리오마다 다른 쪽이 흐려진다', async () => {
      render(<AzureRegionDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<AzureRegionDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 268')
      await selectScenario('지역을 고르지 않는 서비스')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '지역을 고르지 않는 서비스' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expectLinks(wideLinks)
      for (const note of diagram().querySelectorAll('[data-note]')) {
        expect(note).toHaveAttribute('x', String(wideNotes[note.getAttribute('data-note')! as NoteId].x))
      }
    })
  })
})
