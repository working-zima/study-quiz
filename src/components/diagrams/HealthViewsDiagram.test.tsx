import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { HealthViewsDiagram, healthViewsScenarios } from './HealthViewsDiagram'

const topicId = 'azure-monitoring'
const anchorConceptId = `${topicId}.service-health`
const resourceConceptId = `${topicId}.resource-health`
const labels = {
  "other-service": "지역 B의 서비스",
  "my-service": "지역 A의 서비스",
  "vm-1": "VM 1",
  "azure-status": "Azure 상태",
  "service-health": "Service Health",
  "resource-health": "Resource Health"
}
const groupLabels: Record<string, string> = {
  "g-all": "모든 지역의 모든 서비스",
  "g-mine": "내가 쓰는 서비스와 지역"
}
const noteLabels = {
  "status-note": "누구나 본다",
  "service-note": "장애·계획된 유지 관리",
  "resource-note": "지금 쓸 수 있는가"
}
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

const tallNotes: NotePlaces = {
  "status-note": { "x": 50, "y": 78, "anchor": "middle" },
  "service-note": { "x": 60, "y": 138, "anchor": "middle" },
  "resource-note": { "x": 62, "y": 194, "anchor": "middle" }
}
const wideNotes: NotePlaces = {
  "status-note": { "x": 92, "y": 162, "anchor": "middle" },
  "service-note": { "x": 264, "y": 162, "anchor": "middle" },
  "resource-note": { "x": 378, "y": 162, "anchor": "middle" }
}

const allNodes = Object.keys(labels)
const viewNodes = ['azure-status', 'service-health', 'resource-health']
const rangeNodes = ['other-service', 'my-service', 'vm-1']
const question = "세 보기는 각각 어디까지 볼까?"
const idleCaption = "Azure Service Health의 세 보기는 보는 범위가 서로 다르다. 버튼을 고르면 보기마다 어디까지 보는지 볼 수 있다."
const legend = "세 보기는 Azure 상태, Service Health, Resource Health 순으로 보는 범위가 좁아진다. 버튼을 고르면 그 보기가 보는 범위의 노드가 선명해지고, 흐린 노드는 장애가 난 것이 아니라 그 보기가 보는 범위 밖이라는 뜻이다."
const figureName = "Azure 상태는 모든 지역의 모든 서비스를, Service Health는 내가 쓰는 서비스와 지역을, Resource Health는 VM 1 같은 리소스 하나를 보는 모습"
const svgName = "모든 지역의 모든 서비스 안에 지역 B의 서비스와 내가 쓰는 서비스와 지역이 있고, 내가 쓰는 서비스와 지역 안에 지역 A의 서비스와 VM 1이 있다. 그 밖에 Azure 상태, Service Health, Resource Health가 있다"
const expectedScenarios = [
  {
    "id": "status",
    "label": "Azure 상태",
    "nodes": ["azure-status", "other-service", "my-service"],
    "notes": ["status-note"],
    "view": "azure-status",
    "caption": "Azure 상태는 공개된 페이지라 누구나 열어 볼 수 있고, 모든 지역의 모든 서비스에 걸쳐 넓게 퍼진 장애 같은 큰 일을 보여 준다. 흐리게 둔 VM 1은 멈춘 것이 아니다. 리소스 하나의 상태는 Resource Health가 보여 준다.",
    "sources": [anchorConceptId]
  },
  {
    "id": "service",
    "label": "Service Health",
    "nodes": ["service-health", "my-service"],
    "notes": ["service-note"],
    "view": "service-health",
    "caption": "Service Health는 로그인한 사람의 구독이 쓰는 서비스와 지역만 골라 장애, 계획된 유지 관리, 상태 권고를 알린다. 흐리게 둔 지역 B의 서비스는 장애가 난 것이 아니라 내가 쓰지 않아 이 보기에 나오지 않는 것이고, VM 1 한 대의 상태는 Resource Health가 보여 준다.",
    "sources": [anchorConceptId]
  },
  {
    "id": "resource",
    "label": "Resource Health",
    "nodes": ["resource-health", "vm-1"],
    "notes": ["resource-note"],
    "view": "resource-health",
    "caption": "Resource Health는 VM 1 같은 리소스 하나를 골라, 그 리소스를 지금 쓸 수 있는지와 지난 상태를 보여 준다. 흐리게 둔 서비스 노드는 멈춘 것이 아니라 이 보기가 보는 범위 밖이다.",
    "sources": [anchorConceptId, resourceConceptId]
  }
]

function diagram() {
  return screen.getByRole('img', { name: svgName })
}

// 시나리오 버튼의 이름이 노드 라벨과 같으므로 버튼은 role로만 찾는다(SVG의 글자는 버튼이 아니다).
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

function isInside(inner: SvgBox, outer: SvgBox) {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height
}

// 경로가 없는 도식이다. 화살표 선도 마커도 그리지 않고, 범위는 선명한 노드가 보인다.
function expectNoPaths() {
  expect(diagram().querySelectorAll('path, line, polyline, marker')).toHaveLength(0)
  expect(shownIds('[data-path]', 'data-path')).toEqual([])
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
  expectNoPaths()

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
    for (const groupId of Object.keys(groupLabels)) expect(overlaps(box, groupBox(groupId)), `${id} ↔ ${groupId}`).toBe(false)
    for (const other of boxes.filter((candidate) => candidate.id !== id)) expect(overlaps(box, other), `${id} ↔ ${other.id}`).toBe(false)
  }
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 상자 안에, 그룹 라벨은 1.15배로 잡아도 자기 박스 오른쪽 끝 안에 들어간다.
// 안쪽 그룹은 바깥 그룹 안에 있고, 두 그룹 라벨 자리는 서로 겹치지 않으며, 노드는 자기를 담는 가장 안쪽 박스의 라벨 아래에 있다.
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
    expect(x + estimateTextWidth(wording, 9) * 1.15, wording).toBeLessThanOrEqual(box.x + box.width)
    for (const nodeId of allNodes) {
      expect(overlaps(groupLabelArea(id), nodeBox(nodeId)), `${id} 라벨 ↔ ${nodeId}`).toBe(false)
    }
  }

  expect(isInside(groupBox('g-mine'), groupBox('g-all'))).toBe(true)
  expect(overlaps(groupLabelArea('g-mine'), groupLabelArea('g-all'))).toBe(false)
  expect(overlaps(groupLabelArea('g-all'), groupBox('g-mine'))).toBe(false)
}

function expectColors() {
  for (const id of allNodes) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

function nodesIn(groupId: string) {
  return allNodes.filter((id) => isInside(nodeBox(id), groupBox(groupId))).sort()
}

function brightIn(candidates: string[]) {
  return candidates.filter((id) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
}

// 요점: 「내가 쓰는 서비스와 지역」은 「모든 지역의 모든 서비스」 안에 들어 있다. 지역 B의 서비스는 Azure 상태 장면에서만 선명하다.
// 장면마다 선명한 보기는 하나이고 셋이 서로 다르며, Azure 상태가 보는 범위는 Service Health가 보는 범위를 모두 품고 더 넓다.
// 보기 셋은 어느 그룹 안에도 없다.
async function expectPoint() {
  expect(isInside(groupBox('g-mine'), groupBox('g-all'))).toBe(true)
  expect(nodesIn('g-all')).toEqual(['my-service', 'other-service', 'vm-1'])
  expect(nodesIn('g-mine')).toEqual(['my-service', 'vm-1'])
  for (const view of viewNodes) {
    for (const groupId of Object.keys(groupLabels)) expect(isInside(nodeBox(view), groupBox(groupId)), `${view} ⊂ ${groupId}`).toBe(false)
  }

  const brightViews: string[] = []
  const ranges: Record<string, string[]> = {}
  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    const views = brightIn(viewNodes)
    expect(views, scenario.id).toEqual([scenario.view])
    brightViews.push(...views)
    ranges[scenario.id] = brightIn(rangeNodes)
    expect(brightIn(['other-service']).length > 0, scenario.id).toBe(scenario.id === 'status')
  }
  expect(new Set(brightViews).size).toBe(3)
  for (const id of ranges.service) expect(ranges.status).toContain(id)
  expect(ranges.status.length).toBeGreaterThan(ranges.service.length)
  expect(ranges.resource).toEqual(['vm-1'])
  for (const label of [...Object.values(labels), ...Object.values(groupLabels), ...Object.values(noteLabels)]) {
    expect(label).not.toMatch(/로그인하지 않아도|서비스 상태|리소스 상태|`/u)
  }
}

describe('HealthViewsDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<HealthViewsDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 경로와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<HealthViewsDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual([...allNodes].sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expectNoPaths()
    expect(shownIds('[data-note]', 'data-note')).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·곁말이 보이고 그 밖의 노드는 흐리며 경로는 없다', async (scenario) => {
    const { container } = render(<HealthViewsDiagram />)
    await expectScenario(scenario, tallNotes, 280, container)
  })

  it('시나리오를 바꾸면 이전 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<HealthViewsDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
      expectNoPaths()
    }
    await selectScenario('전체')

    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(shownIds('[data-note]', 'data-note')).toEqual([])
    expectNoPaths()
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
    for (const { label } of expectedScenarios) expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'false')
  })

  it('모든 상자가 280×204 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<HealthViewsDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 204')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 204])
    expectColors()
  })

  it('요점을 보인다', async () => {
    render(<HealthViewsDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 각 그림이 자기 시나리오를 따로 갖는다', async () => {
    render(<><HealthViewsDiagram /><HealthViewsDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })

    expect(figures).toHaveLength(2)
    await act(async () => { await userEvent.click(figures[0].querySelector('button[aria-pressed="false"]')!) })
    expect(figures[0].querySelectorAll('[data-note]')).toHaveLength(1)
    expect(figures[1].querySelectorAll('[data-note]')).toHaveLength(0)
    for (const figure of figures) expect(figure.querySelectorAll('marker, path')).toHaveLength(0)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<HealthViewsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['health-views']
    const ids = healthViewsScenarios.map(({ id }) => id).sort()
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
      const scenario = healthViewsScenarios.find(({ id }) => id === expected.id)!
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

  it('그림의 사실과 라벨이 이 주제의 개념 본문에 있다', () => {
    const concepts = topics.find(({ id }) => id === topicId)!.concepts
    const body = concepts.filter(({ id }) => id === anchorConceptId || id === resourceConceptId).flatMap(({ paragraphs }) => paragraphs).join(' ')

    for (const fact of [
      ...Object.values(labels), ...Object.values(groupLabels), '누구나', '공개된', '넓게 퍼진 장애', '장애', '계획된 유지 관리', '상태 권고',
      '로그인한 사람', '리소스 하나', '지금 쓸 수 있는지', '지난 상태', '회사 A',
    ]) {
      expect(body, fact).toContain(fact)
    }
  })

  it('목록 개념이 세 보기를 넓은 범위부터 세우는 머리 개념이다', () => {
    const concepts = topics.find(({ id }) => id === topicId)!.concepts
    const health = concepts.find(({ id }) => id === anchorConceptId)!
    const items = health.paragraphs.filter((paragraph) => paragraph.startsWith('- '))

    expect(concepts.slice(0, 4).map(({ id }) => id)).toEqual([
      `${topicId}.monitoring-tools`, `${topicId}.azure-advisor`, anchorConceptId, resourceConceptId,
    ])
    expect(health.name).toBe('Azure Service Health')
    expect(health.parentId).toBeUndefined()
    expect(items.map((item) => item.match(/^- \*\*(.+?)\*\*/u)![1])).toEqual(['Azure 상태', 'Service Health', 'Resource Health'])
    expect(health.paragraphs.join(' ')).not.toMatch(/서비스 상태|리소스 상태|Copilot|Log Analytics|Application Insights/u)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })

    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map((paragraph) => paragraph.replace(/^- /u, '')).join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(figure.querySelector('h1, h2, h3, h4, h5, h6')).toBeNull()
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
      render(<HealthViewsDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 172')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·그룹 id 집합이 세로형과 같고 어느 배치에도 경로가 없다', () => {
      const { change } = mockMatchMedia(false)
      render(<HealthViewsDiagram />)
      const tallNodes = ids('[data-node]', 'data-node')
      const tallGroups = ids('[data-group]', 'data-group')
      expectNoPaths()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 172')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(tallNodes).toEqual([...allNodes].sort())
      expect(ids('[data-group]', 'data-group')).toEqual(tallGroups)
      expect(tallGroups).toEqual(Object.keys(groupLabels).sort())
      expectNoPaths()
    })

    it('모든 rect가 440×172 viewBox 안에 있고 노드 라벨·그룹 라벨이 자기 상자 안에 들어간다', () => {
      render(<HealthViewsDiagram />)
      expectFits([0, 0, 440, 172])
      expectColors()
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·곁말·캡션을 보이고 곁말은 노드·그룹과 겹치지 않는다', async (scenario) => {
      const { container } = render(<HealthViewsDiagram />)
      await expectScenario(scenario, wideNotes, 440, container)
    })

    it('요점을 보인다', async () => {
      render(<HealthViewsDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<HealthViewsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 204')
      await selectScenario(expectedScenarios[1].label)
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: expectedScenarios[1].label })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      for (const note of diagram().querySelectorAll('[data-note]')) {
        expect(note).toHaveAttribute('x', String(wideNotes[note.getAttribute('data-note')! as NoteId].x))
      }
    })
  })
})
