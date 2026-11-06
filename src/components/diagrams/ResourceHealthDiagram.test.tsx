import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ResourceHealthDiagram, resourceHealthScenarios } from './ResourceHealthDiagram'

const topicId = 'azure-monitoring'
const anchorConceptId = `${topicId}.resource-health`
const parentConceptId = `${topicId}.service-health`
const labels = {
  "platform-event": "Azure 쪽의 일",
  "user-action": "담당자의 작업",
  "vm-1": "VM 1",
  "resource-health": "Resource Health",
  "support": "지원 요청"
}
const noteLabels = {
  "platform-note": "사용할 수 없음 — Azure 쪽",
  "user-note": "사용할 수 없음 — 사용자의 작업"
}
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

const tallNotes: NotePlaces = {
  "platform-note": { "x": 96, "y": 178, "anchor": "middle" },
  "user-note": { "x": 96, "y": 178, "anchor": "middle" }
}
const wideNotes: NotePlaces = {
  "platform-note": { "x": 284, "y": 96, "anchor": "middle" },
  "user-note": { "x": 284, "y": 96, "anchor": "middle" }
}

const allNodes = Object.keys(labels)
const causeNodes = ['platform-event', 'user-action']
const pathEnds: Record<string, [string, string]> = {
  "platform-to-vm": ["platform-event", "vm-1"],
  "user-to-vm": ["user-action", "vm-1"],
  "vm-to-rh": ["vm-1", "resource-health"],
  "rh-to-support": ["resource-health", "support"]
}
const allPaths = Object.keys(pathEnds)
const question = "VM 1을 쓸 수 없을 때 원인은 어느 쪽일까?"
const idleCaption = "VM 1을 쓸 수 없을 때 Resource Health는 원인이 Azure 쪽의 일인지 담당자의 작업인지 가른다. 버튼을 고르면 원인에 따라 무엇을 알려 주는지 볼 수 있다."
const legend = "화살표는 일이 VM 1에 영향을 주고, Resource Health가 VM 1의 상태를 살피고, 지원 요청으로 이어지는 방향이다. 이 그림은 상태 값 넷 가운데 사용할 수 없음의 두 원인만 그렸다."
const figureName = "Azure 쪽의 일이나 담당자의 작업으로 VM 1을 쓸 수 없게 되고, Resource Health가 그 원인을 가려 알리며 Azure 쪽의 일이면 지원 요청으로 이어지는 모습"
const svgName = "Azure 쪽의 일과 담당자의 작업이 VM 1로 이어지고, VM 1이 Resource Health로, Resource Health가 지원 요청으로 이어진다"
const expectedScenarios = [
  {
    "id": "platform",
    "label": "Azure 쪽 원인",
    "nodes": ["platform-event", "vm-1", "resource-health", "support"],
    "paths": ["platform-to-vm", "vm-to-rh", "rh-to-support"],
    "notes": ["platform-note"],
    "cause": "platform-event",
    "caption": "계획된 유지 관리처럼 Azure 쪽의 일로 VM 1을 쓸 수 없으면, Resource Health는 무슨 일이 있었고 복구가 어떻게 진행되는지 알리고, 지원 계약이 없어도 지원 요청을 낼 수 있게 해 준다.",
    "sources": [anchorConceptId]
  },
  {
    "id": "user",
    "label": "사용자 쪽 원인",
    "nodes": ["user-action", "vm-1", "resource-health"],
    "paths": ["user-to-vm", "vm-to-rh"],
    "notes": ["user-note"],
    "cause": "user-action",
    "caption": "담당자가 VM 1을 직접 중지해도 Resource Health는 VM 1을 사용할 수 없음으로 보여 주지만, 원인은 Azure 쪽의 일이 아니라 사용자가 시작한 작업으로 알린다. 흐리게 둔 노드는 이 원인과 상관없어 밝히지 않은 것이다.",
    "sources": [anchorConceptId]
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

// 곁말이 차지하는 상자. 반각 글자 여유(1.15배)를 넣고 기준점에 맞춰 편다. 높이는 글자 크기 9를 기준선 위로 잡는다.
function noteBox(text: Element): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9) * 1.15
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id: text.getAttribute('data-note')!, x: left, y: y - 9, width, height: 9 }
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

// 경로 끝점이 노드 변 위에 있고, 어떤 선분도 다른 노드 상자를 지나지 않는다. 지금 보이는 경로만 본다. 이 도식에는 그룹이 없다.
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
  expect(diagram().querySelectorAll('[data-group]')).toHaveLength(0)
  expect(shownIds('[data-path]', 'data-path').sort()).toEqual([...scenario.paths].sort())
  expectPathGeometry()

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
    const box = noteBox(note)
    expect(box.x, id).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, id).toBeLessThanOrEqual(width)
    expect(box.y + box.height, id).toBeLessThanOrEqual(Number(diagram().getAttribute('viewBox')!.split(' ')[3]))
    for (const node of nodeBoxes) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const pathId of shownIds('[data-path]', 'data-path')) {
      const points = pathPoints(pathId)
      for (let index = 1; index < points.length; index += 1) {
        expect(segmentTouches(segmentBox(points[index - 1], points[index]), box), `${id} ↔ ${pathId}`).toBe(false)
      }
    }
  }
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 1.15배 여유를 넣어도 상자 안에 든다.
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
}

function expectColors() {
  for (const id of allNodes) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

function brightIn(candidates: string[]) {
  return candidates.filter((id) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
}

// 요점: 두 장면 모두 VM 1과 Resource Health가 선명하고 VM 1에서 Resource Health로 가는 경로가 보인다 — 원인이 달라도 같은 리소스를
// 같은 보기가 살핀다. 원인 노드는 장면마다 하나만 선명하고 둘이 다르다. 지원 요청과 그리로 가는 경로는 Azure 쪽 원인에서만 보인다.
async function expectPoint() {
  const causes: string[] = []
  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    expect(brightIn(['vm-1', 'resource-health']), scenario.id).toEqual(['vm-1', 'resource-health'])
    expect(shownIds('[data-path]', 'data-path'), scenario.id).toContain('vm-to-rh')
    const bright = brightIn(causeNodes)
    expect(bright, scenario.id).toEqual([scenario.cause])
    causes.push(...bright)
    expect(brightIn(['support']).length > 0, scenario.id).toBe(scenario.id === 'platform')
    expect(shownIds('[data-path]', 'data-path').includes('rh-to-support'), scenario.id).toBe(scenario.id === 'platform')
    for (const id of shownIds('[data-path]', 'data-path')) {
      const [from] = pathEnds[id]
      if (causeNodes.includes(from)) expect(from, id).toBe(scenario.cause)
    }
  }
  expect(new Set(causes).size).toBe(2)
  expect(noteLabels['platform-note'].startsWith('사용할 수 없음')).toBe(true)
  expect(noteLabels['user-note'].startsWith('사용할 수 없음')).toBe(true)
  for (const label of [...Object.values(labels), ...Object.values(noteLabels)]) {
    expect(label).not.toMatch(/리소스 상태|SLA|`/u)
  }
}

describe('ResourceHealthDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<ResourceHealthDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 경로와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<ResourceHealthDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual([...allNodes].sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expect(shownIds('[data-path]', 'data-path')).toEqual([])
    expect(shownIds('[data-note]', 'data-note')).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·경로·곁말이 보이고 그 밖의 노드는 흐리다', async (scenario) => {
    const { container } = render(<ResourceHealthDiagram />)
    await expectScenario(scenario, tallNotes, 280, container)
  })

  it('시나리오를 바꾸면 이전 경로와 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<ResourceHealthDiagram />)
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

  it('모든 상자가 280×186 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<ResourceHealthDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 186')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 186])
    expectColors()
  })

  it('요점을 보인다', async () => {
    render(<ResourceHealthDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 경로가 자기 마커를 가리킨다', async () => {
    render(<><ResourceHealthDiagram /><ResourceHealthDiagram /></>)
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
    render(<ResourceHealthDiagram />)
    const text = visualsByTopicId[topicId].diagrams['resource-health']
    const ids = resourceHealthScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toBeUndefined()
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
      const scenario = resourceHealthScenarios.find(({ id }) => id === expected.id)!
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

  it('그림의 사실과 라벨이 이 개념 본문에 있다', () => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join(' ')

    for (const fact of [
      ...Object.values(labels), '사용할 수 없음', '사용자의 작업', '사용자가 시작한 작업', '계획된 유지 관리', '복구가 어떻게 진행되는지',
      '지원 계약', '중지', '플랫폼 이벤트', '비플랫폼 이벤트',
    ]) {
      expect(body, fact).toContain(fact)
    }
  })

  it('상태 값 넷을 목록으로 세운 딸린 개념이다', () => {
    const concepts = topics.find(({ id }) => id === topicId)!.concepts
    const health = concepts.find(({ id }) => id === anchorConceptId)!
    const items = health.paragraphs.filter((paragraph) => paragraph.startsWith('- '))
    const parentIndex = concepts.findIndex(({ id }) => id === parentConceptId)

    expect(health.name).toBe('Resource Health')
    expect(health.parentId).toBe(parentConceptId)
    expect(concepts[parentIndex + 1].id).toBe(anchorConceptId)
    expect(items.map((item) => item.match(/^- \*\*(.+?)\*\*/u)![1])).toEqual(['사용 가능', '사용할 수 없음', '알 수 없음', '저하됨'])
    expect(health.paragraphs.join(' ')).not.toMatch(/리소스 상태|SLA|서비스 수준/u)
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

    it('440×112 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<ResourceHealthDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 112')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·경로 id 집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<ResourceHealthDiagram />)
      const pathIds = new Set<string>()
      for (const scenario of expectedScenarios) {
        await selectScenario(scenario.label)
        for (const id of ids('[data-path]', 'data-path')) pathIds.add(id)
      }
      const tallNodes = ids('[data-node]', 'data-node')
      const tallPaths = [...pathIds].sort()

      act(() => change(true))

      const widePathIds = new Set<string>()
      for (const scenario of expectedScenarios) {
        await selectScenario(scenario.label)
        for (const id of ids('[data-path]', 'data-path')) widePathIds.add(id)
      }
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 112')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(tallNodes).toEqual([...allNodes].sort())
      expect(ids('[data-group]', 'data-group')).toEqual([])
      expect([...widePathIds].sort()).toEqual(tallPaths)
      expect(tallPaths).toEqual([...allPaths].sort())
    })

    it('모든 rect가 440×112 viewBox 안에 있고 노드 라벨이 자기 상자 안에 들어간다', () => {
      render(<ResourceHealthDiagram />)
      expectFits([0, 0, 440, 112])
      expectColors()
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·경로·곁말·캡션을 보이고 곁말은 노드·경로와 겹치지 않는다', async (scenario) => {
      const { container } = render(<ResourceHealthDiagram />)
      await expectScenario(scenario, wideNotes, 440, container)
    })

    it('요점을 보인다', async () => {
      render(<ResourceHealthDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<ResourceHealthDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 186')
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
