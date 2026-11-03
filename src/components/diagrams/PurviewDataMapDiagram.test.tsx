import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { PurviewDataMapDiagram, purviewDataMapScenarios } from './PurviewDataMapDiagram'

const topicId = 'azure-governance'
const anchorConceptId = `${topicId}.purview`
const labels = {
  "on-prem": "온-프레미스",
  "other-cloud": "다른 클라우드",
  "saas": "SaaS",
  "purview": "Microsoft Purview"
}
const groupLabels: Record<string, string> = {"company-data": "회사 A의 데이터"}
const noteLabels = {
  "discover-note": "자동으로 찾는다",
  "classify-note": "민감한 데이터를 표시한다",
  "lineage-note": "어디서 와서 어디로 갔는지"
}
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

const tallNotes: NotePlaces = {
  "discover-note": {
    "x": 140,
    "y": 198,
    "anchor": "middle"
  },
  "classify-note": {
    "x": 140,
    "y": 198,
    "anchor": "middle"
  },
  "lineage-note": {
    "x": 140,
    "y": 198,
    "anchor": "middle"
  }
}
const wideNotes: NotePlaces = {
  "discover-note": {
    "x": 220,
    "y": 164,
    "anchor": "middle"
  },
  "classify-note": {
    "x": 220,
    "y": 164,
    "anchor": "middle"
  },
  "lineage-note": {
    "x": 220,
    "y": 164,
    "anchor": "middle"
  }
}

const allNodes = Object.keys(labels)
const pathEnds: Record<string, [string, string]> = {"on-prem-to-purview": ["on-prem", "purview"], "cloud-to-purview": ["other-cloud", "purview"], "saas-to-purview": ["saas", "purview"], "lineage": ["on-prem", "other-cloud"]}
const allPaths = Object.keys(pathEnds)
const question = "여러 곳에 흩어진 데이터를 어떻게 한곳에서 볼까?"
const idleCaption = "회사 A의 데이터가 온-프레미스, 다른 클라우드, SaaS 세 곳에 흩어져 있다. 버튼을 고르면 Microsoft Purview가 이 데이터로 하는 일을 하나씩 볼 수 있다."
const legend = "Microsoft Purview로 가는 화살표는 데이터를 옮기는 것이 아니라, 어떤 데이터가 어디 있는지 알려 주는 정보가 모이는 방향이다. 온-프레미스에서 다른 클라우드로 가는 화살표는 회사 A가 데이터를 옮긴 길이다."
const figureName = "회사 A의 데이터가 있는 세 곳에서 Microsoft Purview로 정보가 모이고, 온-프레미스에서 다른 클라우드로 데이터가 옮겨 간 길을 계보로 보는 모습"
const svgName = "회사 A의 데이터 안에 온-프레미스, 다른 클라우드, SaaS가 있고, 그 아래에 Microsoft Purview가 있다"
const expectedScenarios = [
  {
    "id": "discover",
    "label": "데이터 찾기",
    "nodes": [
      "on-prem",
      "other-cloud",
      "saas",
      "purview"
    ],
    "paths": [
      "on-prem-to-purview",
      "cloud-to-purview",
      "saas-to-purview"
    ],
    "notes": [
      "discover-note"
    ],
    "caption": "회사 A가 세 곳을 Purview에 연결하면 Purview가 각 곳의 데이터를 자동으로 찾는다. 데이터는 원래 있던 곳에 그대로 있고, 어떤 데이터가 어디 있는지 알려 주는 정보만 Purview에 모인다.",
    "sources": [
      anchorConceptId
    ]
  },
  {
    "id": "classify",
    "label": "분류",
    "nodes": [
      "on-prem",
      "purview"
    ],
    "paths": [
      "on-prem-to-purview"
    ],
    "notes": [
      "classify-note"
    ],
    "caption": "찾은 데이터 가운데 신용카드 번호가 든 것처럼 민감한 데이터를 분류해 표시하므로, 민감한 데이터가 어디 있는지 알 수 있다. 이 장면은 온-프레미스 한 곳을 예로 그렸다.",
    "sources": [
      anchorConceptId
    ]
  },
  {
    "id": "lineage",
    "label": "계보",
    "nodes": [
      "on-prem",
      "other-cloud",
      "purview"
    ],
    "paths": [
      "lineage"
    ],
    "notes": [
      "lineage-note"
    ],
    "caption": "회사 A가 온-프레미스의 데이터를 다른 클라우드로 옮겨 처리했다면, 그 데이터가 어디서 와서 어디로 갔는지를 Purview에서 데이터 계보로 따라간다. 데이터를 옮긴 것은 회사 A다.",
    "sources": [
      anchorConceptId
    ]
  }
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

function shownIds(selector: string, attribute: string) {
  return Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)!)
}

// 곁말이 차지하는 상자. 반각 글자 여유(1.15배)를 넣고 기준점에 맞춰 편다. 높이는 글자 크기 9를 기준선 위로 잡는다.
function noteBox(text: Element): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9) * 1.15
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id: text.getAttribute('data-note')!, x: left, y: y - 9, width, height: 9 }
}

// 그룹 라벨이 차지하는 자리. 반각 글자 여유(1.15배)까지 잡는다.
function groupLabelArea(id: string): SvgBox {
  const group = groupBox(id)
  return { id, x: group.x + 10, y: group.y + 5, width: estimateTextWidth(groupLabels[id], 9) * 1.15, height: 9 }
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

// 직교 경로를 꼭짓점 목록으로 편다. 경로 글자에는 M·H·V만 나온다.
function pointsOf(d: string) {
  const points: { x: number, y: number }[] = []
  for (const [, command, first, second] of d.matchAll(/([MHV])\s*(-?\d+)(?:\s+(-?\d+))?/g)) {
    const last = points[points.length - 1]
    if (command === 'M') points.push({ x: Number(first), y: Number(second) })
    else if (command === 'H') points.push({ x: Number(first), y: last.y })
    else points.push({ x: last.x, y: Number(first) })
  }
  return points
}

function pathPoints(id: string) {
  return pointsOf(diagram().querySelector(`[data-path="${id}"]`)!.getAttribute('d')!)
}

function onEdge(point: { x: number, y: number }, box: SvgBox) {
  const withinX = point.x >= box.x && point.x <= box.x + box.width
  const withinY = point.y >= box.y && point.y <= box.y + box.height
  return (withinX && (point.y === box.y || point.y === box.y + box.height)) || (withinY && (point.x === box.x || point.x === box.x + box.width))
}

function segmentBox(a: { x: number, y: number }, b: { x: number, y: number }): SvgBox {
  return { id: 'segment', x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), width: Math.abs(a.x - b.x), height: Math.abs(a.y - b.y) }
}

// 길이가 0인 축을 품은 선분도 잡도록 상자 경계를 포함해 견준다.
function segmentTouches(segment: SvgBox, box: SvgBox) {
  return segment.x <= box.x + box.width && box.x <= segment.x + segment.width && segment.y <= box.y + box.height && box.y <= segment.y + segment.height
}

// 경로 끝점이 노드 변 위에 있고, 어떤 선분도 다른 노드 상자 안이나 그룹 라벨 자리를 지나지 않는다. 지금 보이는 경로만 본다.
function expectPathGeometry() {
  for (const id of shownIds('[data-path]', 'data-path')) {
    const points = pathPoints(id)
    const [from, to] = pathEnds[id]
    expect(onEdge(points[0], nodeBox(from)), `${id} 시작점`).toBe(true)
    expect(onEdge(points[points.length - 1], nodeBox(to)), `${id} 끝점`).toBe(true)
    for (let index = 1; index < points.length; index += 1) {
      const segment = segmentBox(points[index - 1], points[index])
      for (const nodeId of allNodes.filter((node) => node !== from && node !== to)) {
        expect(segmentTouches(segment, nodeBox(nodeId)), `${id} ↔ ${nodeId}`).toBe(false)
      }
      for (const groupId of Object.keys(groupLabels)) {
        expect(segmentTouches(segment, groupLabelArea(groupId)), `${id} ↔ ${groupId} 라벨`).toBe(false)
      }
    }
  }
}

// 아래 단언들은 배치에 묶이지 않는다. 세로형과 가로형이 같은 기대값으로 통과해야 한다.
async function expectScenario(
  scenario: typeof expectedScenarios[number],
  places: NotePlaces,
  width: number,
  container: HTMLElement,
) {
  await selectScenario(scenario.label)

  for (const node of diagram().querySelectorAll('[data-node]')) {
    expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
  }
  for (const group of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(group.closest('[opacity]')).toBeNull()
  expect(shownIds('[data-path]', 'data-path').sort()).toEqual([...scenario.paths].sort())
  expectPathGeometry()

  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  const groupLabelBoxes = Object.keys(groupLabels).map(groupLabelArea)
  const shownNotes = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shownNotes.map((note) => note.getAttribute('data-note')).sort()).toEqual([...scenario.notes].sort())
  const boxes = shownNotes.map(noteBox)
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
    expect(box.y + box.height, id).toBeLessThanOrEqual(Number(diagram().getAttribute('viewBox')!.split(' ')[3]))
    for (const label of groupLabelBoxes) expect(overlaps(box, label), `${id} ↔ ${label.id}`).toBe(false)
    for (const node of nodeBoxes) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const other of boxes.filter((candidate) => candidate.id !== id)) expect(overlaps(box, other), `${id} ↔ ${other.id}`).toBe(false)
  }
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 상자 안에, 그룹 라벨은 1.15배로 잡아도 자기 박스 오른쪽 끝 안에 들어간다.
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

function expectColors() {
  for (const id of allNodes) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 요점: 세 곳에서 가는 경로가 모두 Microsoft Purview에서 끝나고, 계보 경로만 온-프레미스에서 다른 클라우드로 간다.
// 이 그림은 데이터만 다루므로 VM·리소스 그룹 같은 리소스 노드가 없다.
function isInside(inner: SvgBox, outer: SvgBox) {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height
}

async function expectPoint() {
  for (const id of ['on-prem', 'other-cloud', 'saas']) expect(isInside(nodeBox(id), groupBox('company-data')), id).toBe(true)
  expect(overlaps(nodeBox('purview'), groupBox('company-data'))).toBe(false)
  for (const label of [...Object.values(labels), ...Object.values(groupLabels), ...Object.values(noteLabels)]) {
    expect(label).not.toMatch(/VM|리소스|가상 머신/u)
  }

  await selectScenario('데이터 찾기')
  const gathered = shownIds('[data-path]', 'data-path').sort()
  expect(gathered).toEqual(['cloud-to-purview', 'on-prem-to-purview', 'saas-to-purview'])
  for (const id of gathered) {
    const points = pathPoints(id)
    expect(onEdge(points[points.length - 1], nodeBox('purview')), id).toBe(true)
  }

  await selectScenario('분류')
  expect(shownIds('[data-path]', 'data-path')).toEqual(['on-prem-to-purview'])

  for (const label of ['데이터 찾기', '분류']) {
    await selectScenario(label)
    expect(shownIds('[data-path]', 'data-path')).not.toContain('lineage')
  }
  await selectScenario('계보')
  expect(shownIds('[data-path]', 'data-path')).toEqual(['lineage'])
  const points = pathPoints('lineage')
  expect(onEdge(points[0], nodeBox('on-prem'))).toBe(true)
  expect(onEdge(points[points.length - 1], nodeBox('other-cloud'))).toBe(true)
}

describe('PurviewDataMapDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<PurviewDataMapDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 경로와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<PurviewDataMapDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual([...allNodes].sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expect(shownIds('[data-path]', 'data-path')).toEqual([])
    expect(shownIds('[data-note]', 'data-note')).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·경로·곁말이 보이고 그 밖의 노드는 흐리다', async (scenario) => {
    const { container } = render(<PurviewDataMapDiagram />)
    await expectScenario(scenario, tallNotes, 280, container)
  })

  it('시나리오를 바꾸면 이전 경로와 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<PurviewDataMapDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path').sort()).toEqual([...scenario.paths].sort())
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
    }
    await selectScenario('전체')

    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(shownIds('[data-note]', 'data-note')).toEqual([])
    expect(shownIds('[data-path]', 'data-path')).toEqual([])
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
    for (const { label } of expectedScenarios) expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'false')
  })

  it('모든 상자가 280×208 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<PurviewDataMapDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 208')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 208])
    expectColors()
  })

  it('요점을 보인다', async () => {
    render(<PurviewDataMapDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 경로가 자기 마커를 가리킨다', async () => {
    render(<><PurviewDataMapDiagram /><PurviewDataMapDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    const markerIds = figures.map((figure) => figure.querySelector('marker')!.id)

    expect(figures).toHaveLength(2)
    expect(new Set(markerIds).size).toBe(2)
    for (const [index, figure] of figures.entries()) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: expectedScenarios[1].label })) })
      const paths = figure.querySelectorAll('[data-path]')
      expect(paths).toHaveLength(expectedScenarios[1].paths.length)
      for (const path of paths) expect(path.getAttribute('marker-end')).toBe(`url(#${markerIds[index]})`)
    }
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<PurviewDataMapDiagram />)
    const text = visualsByTopicId[topicId].diagrams['purview-data-map']
    const ids = purviewDataMapScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups ?? {}).toEqual(groupLabels)
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
      const scenario = purviewDataMapScenarios.find(({ id }) => id === expected.id)!
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

  it('그림의 사실과 예시가 개념 본문에 있다', () => {
    const concepts = topics.find(({ id }) => id === topicId)!.concepts
    const body = concepts.find((concept) => concept.id === anchorConceptId)!.paragraphs.join(' ')

    for (const fact of ['회사 A의 데이터', '온-프레미스', '다른 클라우드', 'SaaS', 'Microsoft Purview', '자동으로 찾', '원래 있던 곳에 그대로', '신용카드 번호', '분류해 표시', '어디서 와서 어디로 갔는지', '데이터 계보', '옮겨 처리']) {
      expect(body, fact).toContain(fact)
    }
  })

  it('Azure Policy와 다스리는 대상을 가르고, 데이터를 Purview로 옮긴다고 쓰지 않는다', () => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join(' ')

    expect(concept.parentId).toBeUndefined()
    expect(body).toContain('Azure Policy')
    expect(body).toContain('리소스의 설정')
    expect(body).toContain('데이터를 Purview로 옮기지는 않는다')
    expect(body).not.toMatch(/Amazon|S3|Teams|OneDrive|Exchange|SharePoint/u)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })

    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map((paragraph) => paragraph.replace(/^- /u, '')).join('').replace(/\*\*|`/gu, ''))
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

    it('440×172 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<PurviewDataMapDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 172')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·그룹·경로 id 집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<PurviewDataMapDiagram />)
      const pathIds = new Set<string>()
      for (const scenario of expectedScenarios) {
        await selectScenario(scenario.label)
        for (const id of ids('[data-path]', 'data-path')) pathIds.add(id)
      }
      const tallNodes = ids('[data-node]', 'data-node')
      const tallGroups = ids('[data-group]', 'data-group')
      const tallPaths = [...pathIds].sort()

      act(() => change(true))

      const widePathIds = new Set<string>()
      for (const scenario of expectedScenarios) {
        await selectScenario(scenario.label)
        for (const id of ids('[data-path]', 'data-path')) widePathIds.add(id)
      }
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 172')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(tallNodes).toEqual([...allNodes].sort())
      expect(ids('[data-group]', 'data-group')).toEqual(tallGroups)
      expect(tallGroups).toEqual(Object.keys(groupLabels).sort())
      expect([...widePathIds].sort()).toEqual(tallPaths)
      expect(tallPaths).toEqual([...allPaths].sort())
    })

    it('모든 rect가 440×172 viewBox 안에 있고 노드 라벨·그룹 라벨이 자기 상자 안에 들어간다', () => {
      render(<PurviewDataMapDiagram />)
      expectFits([0, 0, 440, 172])
      expectColors()
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·경로·곁말·캡션을 보이고 곁말은 노드·그룹 라벨과 겹치지 않는다', async (scenario) => {
      const { container } = render(<PurviewDataMapDiagram />)
      await expectScenario(scenario, wideNotes, 440, container)
    })

    it('요점을 보인다', async () => {
      render(<PurviewDataMapDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<PurviewDataMapDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 208')
      await selectScenario(expectedScenarios[0].label)
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: expectedScenarios[0].label })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      for (const note of diagram().querySelectorAll('[data-note]')) {
        expect(note).toHaveAttribute('x', String(wideNotes[note.getAttribute('data-note')! as NoteId].x))
      }
    })
  })
})
