import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { InternetworkDiagram, internetworkScenarios } from './InternetworkDiagram'

const topicId = 'network-basics'
const anchorConceptId = `${topicId}.internet`
const labels = {
  'host-a': '호스트 A',
  'host-b': '호스트 B',
  'router-1': '라우터',
  'host-c': '호스트 C',
  'host-d': '호스트 D',
  'router-2': '라우터',
  'host-e': '호스트 E',
  'host-f': '호스트 F',
}
const groupLabels = {
  'net-1': '네트워크 1',
  'net-2': '네트워크 2',
  'net-3': '네트워크 3',
}

const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const hostIds = nodeIds.filter((id) => id.startsWith('host-'))
const routerIds = ['router-1', 'router-2']
// 호스트마다 든 네트워크.
const homeOf: Record<string, string> = {
  'host-a': 'net-1', 'host-b': 'net-1', 'host-c': 'net-2', 'host-d': 'net-2', 'host-e': 'net-3', 'host-f': 'net-3',
}
// 라우터마다 잇는 두 네트워크.
const joins: Record<string, string[]> = { 'router-1': ['net-1', 'net-2'], 'router-2': ['net-2', 'net-3'] }

const tallPaths: Record<string, string> = {
  inside: 'M112 48 H168',
  'across-1': 'M104 64 V88',
  'across-2': 'M104 120 V144',
}
const widePaths: Record<string, string> = {
  inside: 'M60 64 V96',
  'across-1': 'M92 48 H112',
  'across-2': 'M168 48 H188',
}
// 화살표마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  inside: ['host-a', 'host-b'],
  'across-1': ['host-a', 'router-1'],
  'across-2': ['router-1', 'host-c'],
}

const question = '다른 네트워크에 있는 호스트와는 어떻게 주고받을까?'
const idleCaption = '큰 박스 하나가 장치 여럿을 이은 네트워크 하나다. 인터넷은 이런 네트워크 여럿을 다시 서로 이은 것이고, 네트워크와 네트워크 사이는 라우터가 잇는다. 통신을 고르면 메시지가 어디로 가는지 볼 수 있다.'
const legend = '큰 박스가 네트워크 하나이고, 두 박스에 걸친 라우터가 두 네트워크를 잇는다. 화살표는 메시지가 가는 방향이다.'
const expectedScenarios = [
  {
    id: 'inside', label: '같은 네트워크 안',
    nodes: ['host-a', 'host-b'],
    paths: ['inside'],
    caption: '호스트 A와 호스트 B는 같은 네트워크 1 안에 있어, 그 네트워크 안에서 메시지를 주고받는다. 집에서 노트북·휴대폰·데스크톱이 공유기 하나에 이어져 있으면 그것이 이런 네트워크 하나다.',
    sources: [anchorConceptId, `${topicId}.computer-network`],
  },
  {
    id: 'across', label: '다른 네트워크로',
    nodes: ['host-a', 'router-1', 'host-c'],
    paths: ['across-1', 'across-2'],
    caption: '네트워크 1의 호스트 A가 보낸 메시지는 두 네트워크를 잇는 라우터를 거쳐 네트워크 2의 호스트 C에 닿는다. 장치를 이어 네트워크를 만들듯 네트워크를 이어 더 큰 네트워크를 만들었으므로, 인터넷을 「네트워크의 네트워크」라고 부른다.',
    sources: [anchorConceptId],
  },
]

function diagram() {
  return screen.getByRole('img', { name: '호스트가 둘씩 든 네트워크 셋을 라우터 둘이 이은 인터넷' })
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

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

// 상자가 그룹 박스 안에 다 들어 있는가.
function inside(box: SvgBox, group: string) {
  return boxesOutsideViewBox([box], frameOf(groupBox(group))).length === 0
}

type Segment = { x1: number, y1: number, x2: number, y2: number }

// 직교 경로를 선분 목록으로 편다. M/H/V만 나온다.
function segments(d: string) {
  const result: Segment[] = []
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

// 선분을 폭이나 높이가 0인 상자로 본다.
function segmentBox(segment: Segment): SvgBox {
  return {
    id: '',
    x: Math.min(segment.x1, segment.x2), y: Math.min(segment.y1, segment.y2),
    width: Math.abs(segment.x2 - segment.x1), height: Math.abs(segment.y2 - segment.y1),
  }
}

// 선분이 상자 안쪽을 지나는가. 변에 닿기만 하는 것은 세지 않는다.
function crossesInside(segment: Segment, box: SvgBox) {
  const left = Math.min(segment.x1, segment.x2)
  const right = Math.max(segment.x1, segment.x2)
  const top = Math.min(segment.y1, segment.y2)
  const bottom = Math.max(segment.y1, segment.y2)
  if (top === bottom) return top > box.y && top < box.y + box.height && Math.min(right, box.x + box.width) > Math.max(left, box.x)
  return left > box.x && left < box.x + box.width && Math.min(bottom, box.y + box.height) > Math.max(top, box.y)
}

// 선분이 상자에 닿는가. 변에 닿는 것도 센다.
function touches(segment: Segment, box: SvgBox) {
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

function lineEnds(element: Element) {
  const list = segments(element.getAttribute('d')!)
  return { start: { x: list[0].x1, y: list[0].y1 }, end: { x: list[list.length - 1].x2, y: list[list.length - 1].y2 } }
}

// 점이 변 위에 놓인 노드.
function nodeAt(point: { x: number, y: number }) {
  return nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))
}

function pathSegments(id: string) {
  return segments(diagram().querySelector(`[data-path="${id}"]`)!.getAttribute('d')!)
}

// 아래 단언들은 배치에 묶이지 않는다. 세로형과 가로형이 같은 기대값으로 통과해야 한다.
async function expectScenario(
  scenario: typeof expectedScenarios[number],
  paths: Record<string, string>,
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
  expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 상자 안에, 그룹 라벨은 자기 박스 오른쪽 끝 안에 들어간다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
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
    // 그룹 라벨은 어느 노드와도 겹치지 않는다.
    const area: SvgBox = { id, x, y: box.y + 7, width: estimateTextWidth(wording, 9), height: 9 }
    for (const node of nodeIds) expect(overlaps(area, nodeBox(node)), `${wording} ↔ ${node}`).toBe(false)
  }
}

// 화살표 양 끝은 두 노드의 변에 닿고, 어떤 선분도 노드 안과 그룹 라벨 영역을 지나지 않는다.
async function expectPathEnds() {
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
    for (const path of diagram().querySelectorAll('[data-path]')) {
      const id = path.getAttribute('data-path')!
      for (const segment of segments(path.getAttribute('d')!)) {
        for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
        for (const [group, wording] of Object.entries(groupLabels)) {
          const box = groupBox(group)
          const area: SvgBox = { id: group, x: box.x + 10, y: box.y + 7, width: estimateTextWidth(wording, 9), height: 9 }
          expect(touches(segment, area), `${id} ↔ ${wording}`).toBe(false)
        }
      }
      const { start, end } = lineEnds(path)
      expect(nodeAt(start), `${id} 시작`).toBe(ends[id][0])
      expect(nodeAt(end), `${id} 끝`).toBe(ends[id][1])
    }
  }
}

// 호스트는 자기 네트워크 박스 하나 안에만 있다. 라우터는 어느 박스 안에도 다 들어 있지 않고, 잇는 두 박스에 걸친다.
// 노드는 모두 회색이고 도식 전용 두 색·초록·빨강·주황은 쓰지 않는다.
function expectMembership() {
  for (const host of hostIds) {
    expect(groupIds.filter((group) => inside(nodeBox(host), group)), host).toEqual([homeOf[host]])
  }
  for (const router of routerIds) {
    expect(groupIds.filter((group) => inside(nodeBox(router), group)), router).toEqual([])
    expect(groupIds.filter((group) => overlaps(nodeBox(router), groupBox(group))), router).toEqual(joins[router])
  }
  for (const id of nodeIds) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 같은 네트워크 안: 화살표가 네트워크 1 박스를 벗어나지 않는다.
// 다른 네트워크로: 화살표가 네트워크 1의 호스트에서 라우터를 거쳐 네트워크 2의 호스트에 닿는다. 라우터에 들어가는 화살표는
// 아직 네트워크 1 안이고, 라우터에서 나오는 화살표는 이미 네트워크 2 안이다 — 라우터가 두 네트워크의 경계에 있다.
async function expectRoutes() {
  await selectScenario('같은 네트워크 안')
  for (const segment of pathSegments('inside')) expect(inside(segmentBox(segment), 'net-1')).toBe(true)
  expect(homeOf[ends.inside[0]]).toBe(homeOf[ends.inside[1]])

  await selectScenario('다른 네트워크로')
  const hops = Array.from(diagram().querySelectorAll('[data-path]'), (path) => [nodeAt(lineEnds(path).start), nodeAt(lineEnds(path).end)])
  expect(hops).toEqual([['host-a', 'router-1'], ['router-1', 'host-c']])
  expect(homeOf['host-a']).not.toBe(homeOf['host-c'])
  for (const segment of pathSegments('across-1')) expect(inside(segmentBox(segment), 'net-1')).toBe(true)
  for (const segment of pathSegments('across-2')) expect(inside(segmentBox(segment), 'net-2')).toBe(true)
  expect(joins['router-1']).toEqual([homeOf['host-a'], homeOf['host-c']])
}

async function expectUniqueMarkers() {
  render(<><InternetworkDiagram /><InternetworkDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: '네트워크 여럿을 라우터로 이은 인터넷 도식' })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '다른 네트워크로' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(2)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('InternetworkDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<InternetworkDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 여덟과 네트워크 박스 셋이 모두 선명하고 화살표 없이 선택 안내가 나온다', () => {
    const { container } = render(<InternetworkDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    expect(shownIds('[data-group]', 'data-group')).toEqual(groupIds)
    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    for (const group of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(group.closest('[opacity]')).toBeNull()
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표만 선명하고 나머지 노드는 흐려지며 네트워크 박스는 그대로다', async (scenario) => {
    const { container } = render(<InternetworkDiagram />)
    await expectScenario(scenario, tallPaths, container)
  })

  it('시나리오를 바꾸면 이전 화살표가 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<InternetworkDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
    }
    await selectScenario('전체')

    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드와 네트워크 박스가 280×320 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<InternetworkDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 320')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 320])
  })

  it('호스트는 자기 네트워크 안에, 라우터는 두 네트워크의 경계에 있고 노드는 모두 회색이다', () => {
    render(<InternetworkDiagram />)
    expectMembership()
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
    render(<InternetworkDiagram />)
    await expectPathEnds()
  })

  it('같은 네트워크 안의 화살표는 그 박스를 벗어나지 않고, 다른 네트워크로 가는 화살표는 라우터를 거쳐 다른 박스의 호스트에 닿는다', async () => {
    render(<InternetworkDiagram />)
    await expectRoutes()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<InternetworkDiagram />)
    const text = visualsByTopicId[topicId].diagrams.internetwork
    const ids = internetworkScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toBeUndefined()
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([anchorConceptId])
    expect(text.label).toBe('네트워크 여럿을 라우터로 이은 인터넷 도식')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = internetworkScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 인터넷 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: '네트워크 여럿을 라우터로 이은 인터넷 도식' })

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
      render(<InternetworkDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 152')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<InternetworkDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 320')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroups = shownIds('[data-group]', 'data-group').sort()
      const tallPathIds = await collectPathIds()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 152')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroups)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallGroups).toEqual([...groupIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallPaths).sort())
      expect(await collectPathIds()).toEqual(tallPathIds)
    })

    it('모든 rect가 440×152 viewBox 안에 있고 라벨과 그룹 라벨이 자기 상자 안에 들어간다', () => {
      render(<InternetworkDiagram />)
      expectFits([0, 0, 440, 152])
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·캡션을 보인다', async (scenario) => {
      const { container } = render(<InternetworkDiagram />)
      await expectScenario(scenario, widePaths, container)
    })

    it('호스트는 자기 네트워크 안에, 라우터는 두 네트워크의 경계에 있고 노드는 모두 회색이다', () => {
      render(<InternetworkDiagram />)
      expectMembership()
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
      render(<InternetworkDiagram />)
      await expectPathEnds()
    })

    it('같은 네트워크 안의 화살표는 그 박스를 벗어나지 않고, 다른 네트워크로 가는 화살표는 라우터를 거쳐 다른 박스의 호스트에 닿는다', async () => {
      render(<InternetworkDiagram />)
      await expectRoutes()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<InternetworkDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 320')
      await selectScenario('다른 네트워크로')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '다른 네트워크로' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['across-1', 'across-2'])
      for (const path of paths) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
    })
  })
})
