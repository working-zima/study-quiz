import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { PublicPrivateCloudDiagram, publicPrivateCloudScenarios } from './PublicPrivateCloudDiagram'

const topicId = 'azure-cloud-models'
const anchorConceptId = `${topicId}.private-cloud`
const labels = {
  'provider-hardware': '하드웨어',
  'company-a': '회사 A',
  'company-b': '회사 B',
  'company-c': '회사 C',
  'dedicated-hardware': '하드웨어',
  'company-d': '회사 D',
}
const groupLabels = {
  provider: '클라우드 공급자의 데이터 센터',
  dedicated: '한 조직 전용 데이터 센터',
}
const noteLabels = {
  'provider-note': '공급자가 갖추고 관리',
  'shared-note': '여러 회사가 함께 씀',
  'dedicated-note': '회사 D가 사서 관리',
  'only-note': '한 조직만 씀',
}
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

const tallPaths: Record<string, string> = {
  'a-to-provider': 'M52 96 V72',
  'b-to-provider': 'M140 96 V72',
  'c-to-provider': 'M228 96 V72',
  'd-to-dedicated': 'M140 252 V228',
}
const widePaths: Record<string, string> = {
  'a-to-provider': 'M54 96 V72',
  'b-to-provider': 'M140 96 V72',
  'c-to-provider': 'M226 96 V72',
  'd-to-dedicated': 'M360 96 V72',
}
// 경로마다 출발 노드(회사)와 도착 노드(하드웨어).
const ends: Record<string, [string, string]> = {
  'a-to-provider': ['company-a', 'provider-hardware'],
  'b-to-provider': ['company-b', 'provider-hardware'],
  'c-to-provider': ['company-c', 'provider-hardware'],
  'd-to-dedicated': ['company-d', 'dedicated-hardware'],
}

const tallNotes: NotePlaces = {
  'provider-note': { x: 16, y: 32, anchor: 'start' },
  'shared-note': { x: 140, y: 144, anchor: 'middle' },
  'dedicated-note': { x: 16, y: 188, anchor: 'start' },
  'only-note': { x: 140, y: 300, anchor: 'middle' },
}
const wideNotes: NotePlaces = {
  'provider-note': { x: 18, y: 32, anchor: 'start' },
  'shared-note': { x: 140, y: 144, anchor: 'middle' },
  'dedicated-note': { x: 298, y: 32, anchor: 'start' },
  'only-note': { x: 360, y: 144, anchor: 'middle' },
}

const allNodes = Object.keys(labels)
const companyIds = ['company-a', 'company-b', 'company-c', 'company-d']
const hardwareIds = ['provider-hardware', 'dedicated-hardware']
const question = '클라우드의 하드웨어는 누가 갖추고, 누가 함께 쓸까?'
const idleCaption = '두 데이터 센터에 하드웨어가 하나씩 있다. 버튼을 고르면 각 하드웨어를 누가 갖추고 관리하는지, 어느 회사가 그 하드웨어를 쓰는지 볼 수 있다.'
const legend = '큰 박스는 데이터 센터이고, 그 안의 하드웨어는 서버와 저장 장치 같은 실제 장비다. 화살표는 회사가 그 하드웨어를 쓴다는 뜻이다.'
const figureName = '퍼블릭 클라우드와 프라이빗 클라우드에서 하드웨어를 갖추는 쪽과 쓰는 쪽 도식'
const svgName = '클라우드 공급자의 데이터 센터에 있는 하드웨어와 그것을 쓰는 회사 A·B·C, 한 조직 전용 데이터 센터에 있는 하드웨어와 그것을 쓰는 회사 D'
const expectedScenarios = [
  {
    id: 'public', label: '퍼블릭 클라우드',
    nodes: ['provider-hardware', 'company-a', 'company-b', 'company-c'],
    paths: ['a-to-provider', 'b-to-provider', 'c-to-provider'],
    notes: ['provider-note', 'shared-note'],
    caption: '퍼블릭 클라우드에서는 클라우드 공급자가 하드웨어와 데이터 센터를 갖추고 관리한다. 서비스를 산 회사 A·B·C가 그 하드웨어를 함께 쓰지만, 테넌트 사이에 보안 경계가 있어 허락 없이 다른 회사의 리소스에 접근할 수 없다.',
    sources: ['azure-cloud-models.public-cloud'],
  },
  {
    id: 'private', label: '프라이빗 클라우드',
    nodes: ['dedicated-hardware', 'company-d'],
    paths: ['d-to-dedicated'],
    notes: ['dedicated-note', 'only-note'],
    caption: '프라이빗 클라우드의 하드웨어는 회사 D 한 곳만 쓴다. 그 하드웨어를 사서 유지 관리하는 일은 회사 D가 맡는다. 데이터 센터는 회사 D의 사업장 안에 있을 수도, 사업장 밖에서 다른 회사가 운영하는 곳일 수도 있다.',
    sources: ['azure-cloud-models.private-cloud'],
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

function pathEnds(id: string) {
  const list = segments(diagram().querySelector(`[data-path="${id}"]`)!.getAttribute('d')!)
  const first = list[0]
  const last = list[list.length - 1]
  return { start: { x: first.x1, y: first.y1 }, end: { x: last.x2, y: last.y2 } }
}

// 지금 보이는 경로의 끝이 닿는 노드.
function nodesReached() {
  return shownIds('[data-path]', 'data-path').map((id) => {
    const { end } = pathEnds(id)
    return allNodes.find((node) => onEdge(end.x, end.y, nodeBox(node)))!
  })
}

function opaque(ids: string[]) {
  return ids.filter((id) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
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
    // 반각 글자는 화면에서 더 넓다 — 1.15배로 잡아도 viewBox 안이어야 한다.
    expect(box.x + box.width * 1.15, id).toBeLessThanOrEqual(width)
    for (const label of groupLabelBoxes) expect(overlaps(box, label), `${id} ↔ ${label.id}`).toBe(false)
    for (const node of nodeBoxes) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const segment of pathSegments) expect(crossesInside(segment, box), `${id} ↔ 경로`).toBe(false)
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

// 하드웨어 둘은 각자의 데이터 센터 박스 안이고 회사 넷은 두 박스 밖이다. 노드는 모두 회색이다.
function expectMembershipAndColors() {
  expect(inside(nodeBox('provider-hardware'), 'provider')).toBe(true)
  expect(inside(nodeBox('dedicated-hardware'), 'dedicated')).toBe(true)
  for (const id of companyIds) {
    for (const group of Object.keys(groupLabels)) expect(overlaps(nodeBox(id), groupBox(group)), `${id} ↔ ${group}`).toBe(false)
  }
  for (const id of allNodes) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 요점: 퍼블릭은 회사 여럿이 공급자 데이터 센터 안의 같은 하드웨어로 가고, 프라이빗은 회사 하나가 전용 데이터 센터 안의 하드웨어로 간다.
// 두 시나리오에서 선명한 하드웨어는 서로 다른 데이터 센터에 있다.
async function expectSharedVersusDedicated() {
  await selectScenario('퍼블릭 클라우드')
  const publicCompanies = opaque(companyIds)
  expect(publicCompanies.length).toBeGreaterThanOrEqual(2)
  const publicReached = nodesReached()
  expect(publicReached.length).toBe(publicCompanies.length)
  for (const id of publicReached) expect(inside(nodeBox(id), 'provider'), id).toBe(true)
  const publicHardware = opaque(hardwareIds)
  expect(publicHardware).toHaveLength(1)

  await selectScenario('프라이빗 클라우드')
  expect(opaque(companyIds)).toHaveLength(1)
  const privateReached = nodesReached()
  expect(privateReached).toHaveLength(1)
  expect(inside(nodeBox(privateReached[0]), 'dedicated')).toBe(true)
  const privateHardware = opaque(hardwareIds)
  expect(privateHardware).toHaveLength(1)

  const groupOf = (id: string) => Object.keys(groupLabels).find((group) => inside(nodeBox(id), group))
  expect(groupOf(publicHardware[0])).toBe('provider')
  expect(groupOf(privateHardware[0])).toBe('dedicated')
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
  render(<><PublicPrivateCloudDiagram /><PublicPrivateCloudDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '퍼블릭 클라우드' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(3)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('PublicPrivateCloudDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<PublicPrivateCloudDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 여섯 개가 모두 선명하고 경로·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<PublicPrivateCloudDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual([...allNodes].sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·경로·곁말만 보이고 나머지 노드는 흐려진다', async (scenario) => {
    const { container } = render(<PublicPrivateCloudDiagram />)
    await expectScenario(scenario, tallNotes, tallPaths, 280, container)
  })

  it('시나리오를 바꾸면 이전 경로·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<PublicPrivateCloudDiagram />)
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

  it('그룹 둘과 노드 여섯 개가 280×308 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<PublicPrivateCloudDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 308')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 308])
  })

  it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 0..280 안에 있다', async (label) => {
    render(<PublicPrivateCloudDiagram />)
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
    render(<PublicPrivateCloudDiagram />)
    await expectPathsAvoidGroupLabels()
  })

  it('하드웨어 둘은 각자의 데이터 센터 안, 회사 넷은 밖이고 노드는 모두 회색이다', () => {
    render(<PublicPrivateCloudDiagram />)
    expectMembershipAndColors()
  })

  it('퍼블릭은 여러 회사가 공급자 데이터 센터의 하드웨어로, 프라이빗은 한 회사가 전용 데이터 센터의 하드웨어로 간다', async () => {
    render(<PublicPrivateCloudDiagram />)
    await expectSharedVersusDedicated()
  })

  it('경로 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<PublicPrivateCloudDiagram />)
    await expectPathEnds()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 경로가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<PublicPrivateCloudDiagram />)
    const text = visualsByTopicId[topicId].diagrams['public-private-cloud']
    const ids = publicPrivateCloudScenarios.map(({ id }) => id).sort()
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
      const scenario = publicPrivateCloudScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 프라이빗 클라우드 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×152 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<PublicPrivateCloudDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 152')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·그룹 id 집합과 시나리오로 나타나는 경로 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<PublicPrivateCloudDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 308')
      const tallNodes = ids('[data-node]', 'data-node')
      const tallGroups = ids('[data-group]', 'data-group')
      const tallPathIds = await collectPathIds()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 152')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(tallNodes).toEqual([...allNodes].sort())
      expect(ids('[data-group]', 'data-group')).toEqual(tallGroups)
      expect(tallGroups).toEqual(Object.keys(groupLabels).sort())
      expect(tallPathIds).toEqual(Object.keys(tallPaths).sort())
      expect(await collectPathIds()).toEqual(tallPathIds)
    })

    it('모든 rect가 440×152 viewBox 안에 있고 노드 라벨·그룹 라벨이 자기 상자 안에 들어간다', () => {
      render(<PublicPrivateCloudDiagram />)
      expectFits([0, 0, 440, 152])
    })

    it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 0..440 안에 있다', async (label) => {
      render(<PublicPrivateCloudDiagram />)
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
      const { container } = render(<PublicPrivateCloudDiagram />)
      await expectScenario(scenario, wideNotes, widePaths, 440, container)
    })

    it('어떤 경로도 그룹 라벨 자리를 지나지 않는다', async () => {
      render(<PublicPrivateCloudDiagram />)
      await expectPathsAvoidGroupLabels()
    })

    it('하드웨어 둘은 각자의 데이터 센터 안, 회사 넷은 밖이고 노드는 모두 회색이다', () => {
      render(<PublicPrivateCloudDiagram />)
      expectMembershipAndColors()
    })

    it('퍼블릭은 여러 회사가 공급자 데이터 센터의 하드웨어로, 프라이빗은 한 회사가 전용 데이터 센터의 하드웨어로 간다', async () => {
      render(<PublicPrivateCloudDiagram />)
      await expectSharedVersusDedicated()
    })

    it('경로 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<PublicPrivateCloudDiagram />)
      await expectPathEnds()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 경로가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<PublicPrivateCloudDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 308')
      await selectScenario('프라이빗 클라우드')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '프라이빗 클라우드' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['d-to-dedicated'])
      for (const path of paths) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      for (const note of diagram().querySelectorAll('[data-note]')) {
        expect(note).toHaveAttribute('x', String(wideNotes[note.getAttribute('data-note')! as NoteId].x))
      }
    })
  })
})
