import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { HybridCloudDiagram, hybridCloudScenarios } from './HybridCloudDiagram'

const topicId = 'azure-cloud-models'
const anchorConceptId = `${topicId}.hybrid-cloud`
const labels = {
  'private-data': '고객 데이터',
  'private-app': '웹 앱',
  'public-app': '웹 앱',
  'public-extra': '추가 서버',
}
const groupLabels = {
  private: '회사 A의 데이터 센터(프라이빗 클라우드)',
  public: '퍼블릭 클라우드(Azure)',
}
const noteLabels = {
  'connect-note': '서로 연결',
  'data-note': '여기에 둔다',
  'app-note': '여기에 둔다',
  'usual-note': '평소 몫',
  'extra-note': '늘어난 몫',
}
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

// 연결선은 늘 보이고 화살표가 아니다. 위(왼쪽) 박스의 변에서 아래(오른쪽) 박스의 변까지 곧게 간다.
const tallLink = 'M140 92 V140'
const wideLink = 'M224 44 H272'

const tallNotes: NotePlaces = {
  'connect-note': { x: 148, y: 120, anchor: 'start' },
  'data-note': { x: 76, y: 80, anchor: 'middle' },
  'app-note': { x: 76, y: 216, anchor: 'middle' },
  'usual-note': { x: 204, y: 80, anchor: 'middle' },
  'extra-note': { x: 204, y: 216, anchor: 'middle' },
}
const wideNotes: NotePlaces = {
  'connect-note': { x: 248, y: 36, anchor: 'middle' },
  'data-note': { x: 62, y: 80, anchor: 'middle' },
  'app-note': { x: 314, y: 80, anchor: 'middle' },
  'usual-note': { x: 170, y: 80, anchor: 'middle' },
  'extra-note': { x: 390, y: 80, anchor: 'middle' },
}

const allNodes = Object.keys(labels)
const privateNodes = ['private-data', 'private-app']
const publicNodes = ['public-app', 'public-extra']
const question = '자기 데이터 센터와 퍼블릭 클라우드를 이어 두면 무엇을 할 수 있을까?'
const idleCaption = '회사 A의 데이터 센터와 Azure가 서로 이어져 있다. 버튼을 고르면 회사 A가 두 곳을 이어 쓰는 두 방식에서 무엇을 어디에 두고 실행하는지 볼 수 있다.'
const legend = '큰 박스는 회사 A의 데이터 센터와 Azure이고, 둘을 잇는 선은 두 곳이 서로 연결되어 있다는 뜻이다. 웹 앱은 방식마다 실행되는 곳이 달라 양쪽에 그려 두었다.'
const figureName = '하이브리드 클라우드에서 회사 A의 데이터 센터와 Azure를 이어 쓰는 두 방식 도식'
const svgName = '서로 연결된 회사 A의 데이터 센터(프라이빗 클라우드)와 퍼블릭 클라우드(Azure). 데이터 센터에는 고객 데이터와 웹 앱이, Azure에는 웹 앱과 추가 서버가 있다'
const expectedScenarios = [
  {
    id: 'placement', label: '둘 곳을 고른다',
    nodes: ['private-data', 'public-app'],
    notes: ['connect-note', 'data-note', 'app-note'],
    caption: '서비스마다 둘 곳을 고른다. 회사 A는 고객 데이터를 자기 데이터 센터의 프라이빗 클라우드에 두고, 웹 앱은 Azure에 두어 실행한다. 두 곳이 이어져 있으므로 Azure의 웹 앱이 프라이빗 클라우드의 고객 데이터를 쓴다.',
    sources: ['azure-cloud-models.hybrid-cloud'],
  },
  {
    id: 'burst', label: '수요가 잠시 늘 때',
    nodes: ['private-app', 'public-extra'],
    notes: ['connect-note', 'usual-note', 'extra-note'],
    caption: '평소 몫의 주문은 자기 데이터 센터에서 실행하는 웹 앱이 처리한다. 행사 기간에 주문이 몰리면 Azure에 추가 서버를 만들어 늘어난 몫을 맡기고, 행사가 끝나면 줄인다. 한때 몰리는 주문 때문에 하드웨어를 새로 사지 않아도 된다.',
    sources: ['azure-cloud-models.hybrid-cloud'],
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

function frameOf(box: SvgBox) {
  return [box.x, box.y, box.width, box.height] as [number, number, number, number]
}

function inside(box: SvgBox, group: string) {
  return boxesOutsideViewBox([box], frameOf(groupBox(group))).length === 0
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

function link() {
  const links = diagram().querySelectorAll('[data-link]')
  expect(links).toHaveLength(1)
  return links[0]
}

function opaque(ids: string[]) {
  return ids.filter((id) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
}

// 연결선은 시나리오와 상관없이 같은 모양으로 늘 보이고, 흐려지지 않으며, 화살표 마커가 없다.
function expectLink(d: string) {
  expect(link()).toHaveAttribute('data-link', 'link')
  expect(link()).toHaveAttribute('d', d)
  expect(link()).toHaveClass('stroke-muted')
  expect(link()).toHaveAttribute('stroke-width', '1.5')
  expect(link()).not.toHaveAttribute('marker-end')
  expect(link().closest('[opacity]')).toBeNull()
  expect(diagram().querySelector('marker')).toBeNull()
  expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
}

// 아래 단언들은 배치에 묶이지 않는다. 세로형과 가로형이 같은 기대값으로 통과해야 한다.
async function expectScenario(
  scenario: typeof expectedScenarios[number],
  places: NotePlaces,
  d: string,
  width: number,
  container: HTMLElement,
) {
  await selectScenario(scenario.label)

  for (const node of diagram().querySelectorAll('[data-node]')) {
    expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
  }
  for (const group of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(group.closest('[opacity]')).toBeNull()
  expectLink(d)

  const linkSegments = segments(link().getAttribute('d')!)
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
    // 반각 글자는 화면에서 더 넓다 — 1.15배로 잡아도 viewBox 안이어야 한다.
    expect(box.x + box.width * 1.15, id).toBeLessThanOrEqual(width)
    for (const label of groupLabelBoxes) expect(overlaps(box, label), `${id} ↔ ${label.id}`).toBe(false)
    for (const node of nodeBoxes) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const segment of linkSegments) expect(touches(segment, box), `${id} ↔ 연결선`).toBe(false)
  }
  for (let i = 0; i < shownNotes.length; i += 1) {
    for (let j = i + 1; j < shownNotes.length; j += 1) {
      expect(overlaps(textBox(shownNotes[i]), textBox(shownNotes[j])), '곁말끼리').toBe(false)
    }
  }
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 상자 안에, 그룹 라벨은 1.15배로 잡아도 자기 박스 오른쪽 끝 안에 들어간다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(6)
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
    expect(x + estimateTextWidth(wording, 9) * 1.15, wording).toBeLessThanOrEqual(viewBox[2])
  }
}

// 연결선은 두 그룹 박스의 변 사이를 잇고, 노드 안과 그룹 라벨 자리를 지나지 않는다.
function expectLinkJoinsGroups() {
  const list = segments(link().getAttribute('d')!)
  const start = { x: list[0].x1, y: list[0].y1 }
  const end = { x: list[list.length - 1].x2, y: list[list.length - 1].y2 }
  expect(onEdge(start.x, start.y, groupBox('private')), '시작은 데이터 센터 박스의 변').toBe(true)
  expect(onEdge(end.x, end.y, groupBox('public')), '끝은 퍼블릭 클라우드 박스의 변').toBe(true)

  for (const segment of list) {
    for (const id of allNodes) expect(crossesInside(segment, nodeBox(id)), `연결선 ↔ ${id}`).toBe(false)
    for (const [id, wording] of Object.entries(groupLabels)) {
      const group = groupBox(id)
      const area: SvgBox = { id, x: group.x + 10, y: group.y + 7, width: estimateTextWidth(wording, 9) * 1.15, height: 9 }
      expect(touches(segment, area), `연결선 ↔ ${wording}`).toBe(false)
    }
    // 두 박스 사이의 빈자리만 지난다 — 어느 박스 안쪽으로도 들어가지 않는다.
    for (const id of Object.keys(groupLabels)) expect(crossesInside(segment, groupBox(id)), `연결선 ↔ ${id} 박스 안`).toBe(false)
  }
}

// 노드 둘씩 각자의 그룹 박스 안에 있다. 노드는 모두 회색이다.
function expectMembershipAndColors() {
  for (const id of privateNodes) expect(inside(nodeBox(id), 'private'), id).toBe(true)
  for (const id of publicNodes) expect(inside(nodeBox(id), 'public'), id).toBe(true)
  expect(overlaps(groupBox('private'), groupBox('public'))).toBe(false)
  for (const id of allNodes) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 요점: 두 방식 모두 두 곳에 걸쳐 쓰고(선명한 노드가 두 그룹에 하나 이상씩), 둘 곳을 고를 때는 퍼블릭 쪽에서 웹 앱이,
// 수요가 잠시 늘 때는 웹 앱이 아닌 노드(늘어난 몫을 맡는 노드)가 선명하다. 두 방식의 선명한 노드 집합은 서로 다르다.
async function expectBothSidesUsed() {
  const vivid: Record<string, string[]> = {}
  for (const { id, label } of expectedScenarios) {
    await selectScenario(label)
    const privateVivid = opaque(privateNodes)
    const publicVivid = opaque(publicNodes)
    expect(privateVivid.length, `${id} 데이터 센터 쪽`).toBeGreaterThanOrEqual(1)
    expect(publicVivid.length, `${id} 퍼블릭 쪽`).toBeGreaterThanOrEqual(1)
    expect(diagram().querySelectorAll('[data-link]')).toHaveLength(1)
    vivid[id] = opaque(allNodes)
    const publicLabels = publicVivid.map((node) => diagram().querySelector(`[data-node="${node}"] text`)!.textContent)
    if (id === 'placement') expect(publicLabels).toEqual(['웹 앱'])
    else expect(publicLabels).not.toContain('웹 앱')
  }
  expect([...vivid.placement].sort()).not.toEqual([...vivid.burst].sort())
}

describe('HybridCloudDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<HybridCloudDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 넷이 모두 선명하고 연결선과 「서로 연결」만 보이며 선택 안내가 나온다', () => {
    const { container } = render(<HybridCloudDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual([...allNodes].sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expectLink(tallLink)
    expect(shownIds('[data-note]', 'data-note')).toEqual(['connect-note'])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('전체에서 연결선 하나가 두 그룹 박스의 변 사이를 잇는다', () => {
    render(<HybridCloudDiagram />)
    expectLinkJoinsGroups()
  })

  it.each(expectedScenarios)('$label: 지정한 노드·곁말만 보이고 나머지 노드는 흐려지며 연결선은 그대로다', async (scenario) => {
    const { container } = render(<HybridCloudDiagram />)
    await expectScenario(scenario, tallNotes, tallLink, 280, container)
  })

  it('시나리오를 바꾸면 이전 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<HybridCloudDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
      expect(diagram().querySelectorAll('[data-link]')).toHaveLength(1)
    }
    await selectScenario('전체')

    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(shownIds('[data-note]', 'data-note')).toEqual(['connect-note'])
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
    for (const { label } of expectedScenarios) expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'false')
  })

  it('그룹 둘과 노드 넷이 280×232 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<HybridCloudDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 232')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 232])
  })

  it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 0..280 안에 있다', async (label) => {
    render(<HybridCloudDiagram />)
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

  it('노드는 둘씩 각자의 그룹 박스 안에 있고 모두 회색이다', () => {
    render(<HybridCloudDiagram />)
    expectMembershipAndColors()
  })

  it('두 방식 모두 두 곳에 걸쳐 쓰고, 둘 곳을 고를 때는 퍼블릭 쪽 웹 앱이, 수요가 늘 때는 다른 노드가 선명하다', async () => {
    render(<HybridCloudDiagram />)
    await expectBothSidesUsed()
  })

  it('두 번 렌더해도 각 도식에 연결선이 하나씩이고 화살표 마커가 없다', () => {
    render(<><HybridCloudDiagram /><HybridCloudDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })

    expect(figures).toHaveLength(2)
    for (const figure of figures) {
      expect(figure.querySelectorAll('[data-link]')).toHaveLength(1)
      expect(figure.querySelector('marker')).toBeNull()
    }
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<HybridCloudDiagram />)
    const text = visualsByTopicId[topicId].diagrams['hybrid-cloud']
    const ids = hybridCloudScenarios.map(({ id }) => id).sort()
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
      const scenario = hybridCloudScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 하이브리드 클라우드 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×96 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<HybridCloudDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 96')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expectLink(wideLink)
    })

    it('노드·그룹·연결선 id 집합이 세로형과 같다', () => {
      const { change } = mockMatchMedia(false)
      render(<HybridCloudDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 232')
      const tallNodes = ids('[data-node]', 'data-node')
      const tallGroups = ids('[data-group]', 'data-group')
      const tallLinks = ids('[data-link]', 'data-link')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 96')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(tallNodes).toEqual([...allNodes].sort())
      expect(ids('[data-group]', 'data-group')).toEqual(tallGroups)
      expect(tallGroups).toEqual(Object.keys(groupLabels).sort())
      expect(ids('[data-link]', 'data-link')).toEqual(tallLinks)
    })

    it('모든 rect가 440×96 viewBox 안에 있고 노드 라벨·그룹 라벨이 자기 상자 안에 들어간다', () => {
      render(<HybridCloudDiagram />)
      expectFits([0, 0, 440, 96])
    })

    it('전체에서 연결선 하나가 두 그룹 박스의 변 사이를 잇는다', () => {
      render(<HybridCloudDiagram />)
      expectLinkJoinsGroups()
    })

    it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 0..440 안에 있다', async (label) => {
      render(<HybridCloudDiagram />)
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

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·곁말·캡션을 보이고 곁말은 노드·그룹 라벨·연결선과 겹치지 않는다', async (scenario) => {
      const { container } = render(<HybridCloudDiagram />)
      await expectScenario(scenario, wideNotes, wideLink, 440, container)
    })

    it('노드는 둘씩 각자의 그룹 박스 안에 있고 모두 회색이다', () => {
      render(<HybridCloudDiagram />)
      expectMembershipAndColors()
    })

    it('두 방식 모두 두 곳에 걸쳐 쓰고, 둘 곳을 고를 때는 퍼블릭 쪽 웹 앱이, 수요가 늘 때는 다른 노드가 선명하다', async () => {
      render(<HybridCloudDiagram />)
      await expectBothSidesUsed()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<HybridCloudDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 232')
      await selectScenario('수요가 잠시 늘 때')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '수요가 잠시 늘 때' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(link()).toHaveAttribute('d', wideLink)
      for (const note of diagram().querySelectorAll('[data-note]')) {
        expect(note).toHaveAttribute('x', String(wideNotes[note.getAttribute('data-note')! as NoteId].x))
      }
    })
  })
})
