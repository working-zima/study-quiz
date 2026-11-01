import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { FileSyncDiagram, fileSyncScenarios } from './FileSyncDiagram'

const topicId = 'azure-data-movement'
const anchorConceptId = `${topicId}.file-sync`
const azcopyConceptId = `${topicId}.azcopy`
const labels = {
  "server": "Windows 파일 서버",
  "share": "Azure 파일 공유"
}
const groupLabels: Record<string, string> = {
  "on-premises": "온-프레미스",
  "azure": "Azure"
}
const noteLabels = {
  "azcopy-note": "정한 방향으로만 복사",
  "sync-note": "양쪽이 저절로 맞춰진다",
  "server-tier-note": "자주 쓰는 파일",
  "share-tier-note": "나머지 파일의 내용"
}
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

const tallNotes: NotePlaces = {
  "azcopy-note": { "x": 120, "y": 90, "anchor": "start" },
  "sync-note": { "x": 120, "y": 90, "anchor": "start" },
  "server-tier-note": { "x": 168, "y": 52, "anchor": "start" },
  "share-tier-note": { "x": 168, "y": 140, "anchor": "start" }
}
const wideNotes: NotePlaces = {
  "azcopy-note": { "x": 220, "y": 34, "anchor": "middle" },
  "sync-note": { "x": 220, "y": 34, "anchor": "middle" },
  "server-tier-note": { "x": 78, "y": 80, "anchor": "middle" },
  "share-tier-note": { "x": 362, "y": 80, "anchor": "middle" }
}

const allNodes = Object.keys(labels)
const allPaths = ["azcopy-one-way","sync-up","sync-down"]
const pathEnds: Record<string, [string, string]> = {"azcopy-one-way":["server","share"],"sync-up":["server","share"],"sync-down":["share","server"]}
const question = "한 방향 복사와 양쪽을 맞추는 일은 어떻게 다를까?"
const idleCaption = "회사 D의 온-프레미스에 있는 Windows 파일 서버와 Azure 파일 공유다. 버튼을 고르면 두 곳 사이에서 파일이 어느 쪽으로 가고 어디에 놓이는지 볼 수 있다."
const legend = "큰 박스는 서버와 파일 공유가 있는 곳이다. 화살표는 파일의 변경이 가는 방향이다. AzCopy는 서버를 원본으로, 파일 공유를 대상으로 정한 예다."
const figureName = "AzCopy의 한 방향 복사와 Azure 파일 동기화의 양방향 동기화, 클라우드 계층화를 Windows 파일 서버와 Azure 파일 공유 사이에 보인 모습"
const svgName = "온-프레미스 안에 Windows 파일 서버가 있고, Azure 안에 Azure 파일 공유가 있다"
const expectedScenarios = [
  {
    "id": "azcopy",
    "label": "AzCopy",
    "nodes": ["server", "share"],
    "paths": ["azcopy-one-way"],
    "notes": ["azcopy-note"],
    "sources": [azcopyConceptId],
    "caption": "서버를 원본으로, 파일 공유를 대상으로 정하고 AzCopy로 동기화하면 그 방향으로만 복사한다. 파일 공유에서 고치거나 지운 것은 서버로 돌아오지 않는다."
  },
  {
    "id": "file-sync",
    "label": "Azure 파일 동기화",
    "nodes": ["server", "share"],
    "paths": ["sync-up", "sync-down"],
    "notes": ["sync-note"],
    "sources": [anchorConceptId],
    "caption": "서버에 에이전트를 설치하면 서버와 파일 공유의 파일이 양쪽으로 저절로 맞춰진다. 어느 쪽에서 바꾼 파일이든 다른 쪽으로 간다."
  },
  {
    "id": "cloud-tiering",
    "label": "클라우드 계층화",
    "nodes": ["server", "share"],
    "paths": [],
    "notes": ["server-tier-note", "share-tier-note"],
    "sources": [anchorConceptId],
    "caption": "자주 쓰는 파일은 서버에 두고, 나머지 파일은 내용을 파일 공유에 두었다가 그 파일을 열 때 가져온다. Blob 액세스 계층과는 다른 일이다."
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

function inside(box: SvgBox, group: string) {
  const frame = groupBox(group)
  return boxesOutsideViewBox([box], [frame.x, frame.y, frame.width, frame.height]).length === 0
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
  expect(boxes).toHaveLength(4)
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

// 요점: 서버는 온-프레미스 안에, 파일 공유는 Azure 안에 있다. AzCopy는 서버에서 파일 공유로 가는 한 길이고, Azure 파일 동기화는 양쪽으로 가는 두 길이다.
// 클라우드 계층화에는 길이 없고 곁말이 서버 쪽과 파일 공유 쪽에 하나씩 놓인다.
async function expectPoint() {
  expect(inside(nodeBox('server'), 'on-premises')).toBe(true)
  expect(inside(nodeBox('server'), 'azure')).toBe(false)
  expect(inside(nodeBox('share'), 'azure')).toBe(true)
  expect(inside(nodeBox('share'), 'on-premises')).toBe(false)
  for (const id of allNodes) {
    for (const group of Object.keys(groupLabels)) expect(overlaps(nodeBox(id), groupLabelArea(group)), `${id} ↔ ${group}`).toBe(false)
  }

  await selectScenario('AzCopy')
  expect(shownIds('[data-path]', 'data-path')).toEqual(['azcopy-one-way'])
  const oneWay = pathPoints('azcopy-one-way')
  expect(onEdge(oneWay[0], nodeBox('server'))).toBe(true)
  expect(onEdge(oneWay[oneWay.length - 1], nodeBox('share'))).toBe(true)

  await selectScenario('Azure 파일 동기화')
  expect(shownIds('[data-path]', 'data-path').sort()).toEqual(['sync-down', 'sync-up'])
  const up = pathPoints('sync-up')
  const down = pathPoints('sync-down')
  expect(onEdge(up[up.length - 1], nodeBox('share'))).toBe(true)
  expect(onEdge(down[down.length - 1], nodeBox('server'))).toBe(true)
  // 양방향의 두 선이 같은 자리에 겹치지 않는다.
  expect(up[0].x === down[down.length - 1].x && up[0].y === down[down.length - 1].y).toBe(false)

  await selectScenario('클라우드 계층화')
  expect(shownIds('[data-path]', 'data-path')).toEqual([])
  const serverNote = noteBox(diagram().querySelector('[data-note="server-tier-note"]')!)
  const shareNote = noteBox(diagram().querySelector('[data-note="share-tier-note"]')!)
  expect(inside(serverNote, 'on-premises')).toBe(true)
  expect(inside(shareNote, 'azure')).toBe(true)
}

describe('FileSyncDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<FileSyncDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 경로와 곁말이 없으며 선택 안내가 나온다', () => {
    const { container } = render(<FileSyncDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual([...allNodes].sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expect(shownIds('[data-path]', 'data-path')).toEqual([])
    expect(shownIds('[data-note]', 'data-note')).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·경로·곁말이 보이고 두 노드는 선명하다', async (scenario) => {
    const { container } = render(<FileSyncDiagram />)
    await expectScenario(scenario, tallNotes, 280, container)
  })

  it('시나리오를 바꾸면 이전 경로와 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<FileSyncDiagram />)
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

  it('모든 상자가 280×172 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<FileSyncDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 172')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 172])
    expectColors()
  })

  it('요점을 보인다', async () => {
    render(<FileSyncDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 경로가 자기 마커를 가리킨다', async () => {
    render(<><FileSyncDiagram /><FileSyncDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    const markerIds = figures.map((figure) => figure.querySelector('marker')!.id)

    expect(figures).toHaveLength(2)
    expect(new Set(markerIds).size).toBe(2)
    for (const [index, figure] of figures.entries()) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: expectedScenarios[0].label })) })
      const paths = figure.querySelectorAll('[data-path]')
      expect(paths).toHaveLength(expectedScenarios[0].paths.length)
      for (const path of paths) expect(path.getAttribute('marker-end')).toBe(`url(#${markerIds[index]})`)
    }
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<FileSyncDiagram />)
    const text = visualsByTopicId[topicId].diagrams['file-sync']
    const ids = fileSyncScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups ?? {}).toEqual(groupLabels)
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([azcopyConceptId, anchorConceptId])
    expect(text.label).toBe(figureName)
    expect(text.svgLabel).toBe(svgName)
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = fileSyncScenarios.find(({ id }) => id === expected.id)!
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
    const bodyOf = (id: string) => concepts.find((concept) => concept.id === id)!.paragraphs.join(' ')

    for (const fact of ['회사 D', 'Windows 파일 서버', 'Azure 파일 공유', '원본', '대상', '그 방향으로만 복사', '돌아오지 않는다']) {
      expect(bodyOf(azcopyConceptId), fact).toContain(fact)
    }
    for (const fact of ['회사 D', '온-프레미스', '에이전트', '양쪽으로 저절로 맞춰진다', '클라우드 계층화', '자주 쓰는 파일', '나머지 파일', 'Blob 액세스 계층']) {
      expect(bodyOf(anchorConceptId), fact).toContain(fact)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })

    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.join('').replace(/\*\*|`/gu, ''))
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

    it('440×100 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<FileSyncDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 100')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·그룹·경로 id 집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<FileSyncDiagram />)
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
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 100')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(tallNodes).toEqual([...allNodes].sort())
      expect(ids('[data-group]', 'data-group')).toEqual(tallGroups)
      expect(tallGroups).toEqual(Object.keys(groupLabels).sort())
      expect([...widePathIds].sort()).toEqual(tallPaths)
      expect(tallPaths).toEqual([...allPaths].sort())
    })

    it('모든 rect가 440×100 viewBox 안에 있고 노드 라벨·그룹 라벨이 자기 상자 안에 들어간다', () => {
      render(<FileSyncDiagram />)
      expectFits([0, 0, 440, 100])
      expectColors()
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·경로·곁말·캡션을 보이고 곁말은 노드·그룹 라벨과 겹치지 않는다', async (scenario) => {
      const { container } = render(<FileSyncDiagram />)
      await expectScenario(scenario, wideNotes, 440, container)
    })

    it('요점을 보인다', async () => {
      render(<FileSyncDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<FileSyncDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 172')
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
