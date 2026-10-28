import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { Ipv6ChangesDiagram, ipv6ChangesScenarios } from './Ipv6ChangesDiagram'

const topicId = 'ip-protocol'
const anchorConceptId = `${topicId}.ipv6`
const rows = ['address', 'broadcast', 'header', 'fragment'] as const
const labels: Record<string, string> = {
  'v4-address': '주소 32비트', 'v6-address': '주소 128비트',
  'v4-broadcast': '브로드캐스트 있음', 'v6-broadcast': '브로드캐스트 없음',
  'v4-header': '헤더 20~60바이트', 'v6-header': '기본 헤더 40바이트',
  'v4-fragment': '출발지·라우터가 나눔', 'v6-fragment': '출발지만 나눔',
}
const groupLabels: Record<string, string> = { v4: 'IPv4', v6: 'IPv6' }
const noteLabels: Record<string, string> = { multicast: '멀티캐스트가 맡음' }
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const ends: Record<string, [string, string]> = Object.fromEntries(rows.map((row) => [`change-${row}`, [`v4-${row}`, `v6-${row}`]]))

const question = 'IPv6는 IPv4에서 무엇이 달라졌을까?'
const idleCaption = '왼쪽에 IPv4, 오른쪽에 IPv6를 놓고 같은 점을 같은 줄에 짝지었다. 버튼을 고르면 주소 크기, 브로드캐스트, 헤더, 단편화하는 곳 가운데 하나가 IPv4에서 IPv6로 어떻게 바뀌었는지 볼 수 있다.'
const legend = '왼쪽 상자는 IPv4, 오른쪽 상자는 IPv6이고, 같은 줄의 두 상자가 같은 점을 견준다. 화살표는 IPv4에서 IPv6로 바뀐 쪽을 가리킨다.'
const figureName = 'IPv4에서 IPv6로 달라진 점 넷을 같은 줄에 나란히 견주는 도식'
const svgName = 'IPv4와 IPv6를 두 열로 놓고, 주소 32비트와 128비트, 브로드캐스트 있음과 없음(멀티캐스트가 맡음), 헤더 20~60바이트와 기본 헤더 40바이트, 출발지·라우터가 나눔과 출발지만 나눔을 같은 줄에 짝지은 모습'
const expectedScenarios = [
  {
    id: 'address', label: '주소 크기', nodes: ['v4-address', 'v6-address'], paths: ['change-address'],
    caption: 'IPv4 주소는 32비트지만 IPv6 주소는 128비트로 네 배 길다. 그래서 이론상 있을 수 있는 주소의 개수가 2³²개에서 2¹²⁸개로 늘었다.',
  },
  {
    id: 'broadcast', label: '브로드캐스트', nodes: ['v4-broadcast', 'v6-broadcast'], paths: ['change-broadcast'],
    caption: 'IPv4에는 같은 네트워크의 모든 장치에게 한꺼번에 보내는 브로드캐스트 주소가 있지만 IPv6에는 없다. IPv6에서는 정해 둔 무리의 장치들에게 보내는 멀티캐스트 주소가 그 일을 맡는다.',
  },
  {
    id: 'header', label: '헤더', nodes: ['v4-header', 'v6-header'], paths: ['change-header'],
    caption: 'IPv4 헤더는 옵션에 따라 20바이트에서 60바이트까지 길이가 바뀌지만, IPv6의 기본 헤더는 늘 40바이트다. 칸 몇 개를 없애거나 필요할 때만 덧붙이는 별도의 헤더로 옮겨 단순해졌다.',
  },
  {
    id: 'fragment', label: '단편화', nodes: ['v4-fragment', 'v6-fragment'], paths: ['change-fragment'],
    caption: 'IPv4에서는 출발지 호스트도 경로 중간의 라우터도 패킷을 조각으로 나눌 수 있다. IPv6에서는 라우터가 나누지 않고 출발지만 나눈다.',
  },
]

function diagram() {
  return screen.getByRole('img', { name: svgName })
}

async function selectScenario(label: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) })
}

function readBox(rect: Element, id = ''): SvgBox {
  return {
    id,
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

function nodeBox(id: string) {
  return readBox(diagram().querySelector(`[data-node="${id}"] rect`)!, id)
}

function groupBox(id: string) {
  return readBox(diagram().querySelector(`[data-group="${id}"]`)!, id)
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function contains(outer: SvgBox, inner: SvgBox) {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height
}

// 글자 크기 9인 글자가 차지하는 상자. 반각 글자가 화면에서 더 넓게 그려지는 것을 생각해 폭을 1.15배로 잡는다.
function textBox(text: Element, id: string): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9) * 1.15
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id, x: left, y: y - 9, width, height: 9 }
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

function nodeAt(point: { x: number, y: number }) {
  return nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))
}

function brightNodes() {
  return nodeIds.filter((id) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
}

function groupLabelBoxes() {
  return Array.from(diagram().querySelectorAll('[data-group-label]'), (label) => textBox(label, label.getAttribute('data-group-label')!))
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다.
// 노드는 이름의 앞머리대로 IPv4나 IPv6 박스 안에 통째로 들고, 곁말과 그룹 라벨은 viewBox 안에서 노드·서로와 겹치지 않는다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), (rect) => readBox(rect))
  expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(nodeBox(id).height).toBe(32)
    expect(estimateTextWidth(label, 10) + 12, `${id} ${label}`).toBeLessThanOrEqual(nodeBox(id).width)
    const own = id.slice(0, 2)
    expect(contains(groupBox(own), nodeBox(id)), `${id} ∈ ${own}`).toBe(true)
    for (const other of groupIds.filter((group) => group !== own)) expect(overlaps(groupBox(other), nodeBox(id)), `${id} ∉ ${other}`).toBe(false)
  }
  for (let i = 0; i < nodeIds.length; i += 1) {
    for (let j = i + 1; j < nodeIds.length; j += 1) {
      expect(overlaps(nodeBox(nodeIds[i]), nodeBox(nodeIds[j])), `${nodeIds[i]} ↔ ${nodeIds[j]}`).toBe(false)
    }
  }
  expect(overlaps(groupBox('v4'), groupBox('v6'))).toBe(false)
  const texts = [...Array.from(diagram().querySelectorAll('[data-note]'), (note) => textBox(note, note.getAttribute('data-note')!)), ...groupLabelBoxes()]
  for (const box of texts) {
    expect(box.x, box.id).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, box.id).toBeLessThanOrEqual(viewBox[2])
    expect(box.y, box.id).toBeGreaterThanOrEqual(0)
    expect(box.y + box.height, box.id).toBeLessThanOrEqual(viewBox[3])
    for (const id of nodeIds) expect(overlaps(box, nodeBox(id)), `${box.id} ↔ ${id}`).toBe(false)
  }
  for (let i = 0; i < texts.length; i += 1) {
    for (let j = i + 1; j < texts.length; j += 1) expect(overlaps(texts[i], texts[j]), `${texts[i].id} ↔ ${texts[j].id}`).toBe(false)
  }
  for (const id of groupIds) expect(contains(groupBox(id), textBox(diagram().querySelector(`[data-group-label="${id}"]`)!, id)), `${id} 라벨`).toBe(true)
  expect(contains(groupBox('v6'), textBox(diagram().querySelector('[data-note="multicast"]')!, 'multicast'))).toBe(true)
}

// 시나리오마다 화살표의 양 끝이 같은 줄의 IPv4 노드와 IPv6 노드의 변에 닿고, 어떤 선분도 노드 안·그룹 라벨·곁말을 지나지 않는다.
async function expectArrows(arrows: Record<string, string>) {
  const notes = Array.from(diagram().querySelectorAll('[data-note]'), (note) => textBox(note, note.getAttribute('data-note')!))
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    for (const path of diagram().querySelectorAll('[data-path]')) {
      const id = path.getAttribute('data-path')!
      expect(path).toHaveAttribute('d', arrows[id])
      const list = segments(path.getAttribute('d')!)
      for (const segment of list) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const groupLabel of groupLabelBoxes()) expect(touches(segment, groupLabel), `${id} ↔ 라벨 ${groupLabel.id}`).toBe(false)
        for (const note of notes) expect(touches(segment, note), `${id} ↔ ${note.id}`).toBe(false)
      }
      expect(nodeAt({ x: list[0].x1, y: list[0].y1 }), `${id} 시작`).toBe(ends[id][0])
      expect(nodeAt({ x: list[list.length - 1].x2, y: list[list.length - 1].y2 }), `${id} 끝`).toBe(ends[id][1])
    }
  }
}

async function expectScenario(scenario: typeof expectedScenarios[number], container: HTMLElement) {
  await selectScenario(scenario.label)
  for (const id of nodeIds) {
    expect(diagram().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  expect(diagram().querySelector('[data-note="multicast"]')).toHaveAttribute('opacity', scenario.nodes.includes('v6-broadcast') ? '1' : '0.25')
  for (const id of groupIds) expect(diagram().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
  const shownPaths = Array.from(diagram().querySelectorAll('[data-path]'))
  expect(shownPaths.map((path) => path.getAttribute('data-path'))).toEqual(scenario.paths)
  for (const path of shownPaths) {
    expect(path).toHaveAttribute('marker-end', `url(#${diagram().querySelector('marker')!.id})`)
    expect(path).toHaveClass('stroke-title')
  }
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
}

// 요점: 시나리오마다 선명한 노드는 같은 줄에 놓인 IPv4 쪽 하나와 IPv6 쪽 하나의 짝이고, 화살표는 IPv4 쪽에서 IPv6 쪽으로 간다.
// 네 시나리오의 짝은 서로 다르고, 짝의 말은 개념 본문에 있다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const pairs = new Set<string>()
  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    const bright = brightNodes()
    expect(bright, scenario.id).toHaveLength(2)
    const left = bright.find((id) => id.startsWith('v4-'))!
    const right = bright.find((id) => id.startsWith('v6-'))!
    expect(left, scenario.id).toBeDefined()
    expect(right, scenario.id).toBeDefined()
    expect(nodeBox(left).y, scenario.id).toBe(nodeBox(right).y)
    expect(nodeBox(left).x + nodeBox(left).width, scenario.id).toBeLessThan(nodeBox(right).x)
    const list = segments(diagram().querySelector('[data-path]')!.getAttribute('d')!)
    expect(nodeAt({ x: list[0].x1, y: list[0].y1 })).toBe(left)
    expect(nodeAt({ x: list[list.length - 1].x2, y: list[list.length - 1].y2 })).toBe(right)
    pairs.add(`${left}|${right}`)
  }
  expect(pairs.size).toBe(4)
  for (const row of rows) {
    const others = rows.filter((other) => other !== row).map((other) => nodeBox(`v4-${other}`).y)
    expect(others, row).not.toContain(nodeBox(`v4-${row}`).y)
  }

  expect(body).toContain('IPv6 주소는 128비트, 곧 16바이트로, 32비트인 IPv4 주소보다 네 배 길다')
  expect(body).toContain('IPv6에는 브로드캐스트 주소가 없다')
  expect(body).toContain('IPv4에는 이렇게 보낼 때 쓰는 브로드캐스트 주소가 있다')
  expect(body).toContain('IPv6에서는 그 일을 멀티캐스트 주소가 맡는다')
  expect(body).toContain('IPv6 패킷 맨 앞의 기본 헤더는 늘 40바이트다')
  expect(body).toContain('IPv4 헤더는 옵션에 따라 20바이트에서 60바이트까지 길이가 바뀌지만')
  expect(body).toContain('경로 중간의 라우터는 패킷을 조각으로 나누지 않고, 나누는 일은 출발지만 한다')
}

async function expectUniqueMarkers() {
  render(<><Ipv6ChangesDiagram /><Ipv6ChangesDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '헤더' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(1)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

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
      const event = Object.assign(new Event('change'), { matches: nextMatches, media: mediaQuery.media })
      listeners.forEach((listener) => listener(event))
    },
  }
}

const tallArrows: Record<string, string> = {
  'change-address': 'M132 44 H150',
  'change-broadcast': 'M132 84 H150',
  'change-header': 'M132 140 H150',
  'change-fragment': 'M132 180 H150',
}
const wideArrows: Record<string, string> = {
  'change-address': 'M192 44 H248',
  'change-broadcast': 'M192 84 H248',
  'change-header': 'M192 140 H248',
  'change-fragment': 'M192 180 H248',
}

describe('Ipv6ChangesDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<Ipv6ChangesDiagram />)
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 곁말이 모두 선명하고 화살표 없이 선택 안내가 나온다', () => {
    const { container } = render(<Ipv6ChangesDiagram />)
    expect(Array.from(diagram().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node], [data-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(Array.from(diagram().querySelectorAll('[data-group-label]'), (label) => label.textContent)).toEqual(Object.values(groupLabels))
    expect(Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.textContent)).toEqual(Object.values(noteLabels))
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 그 줄의 짝과 화살표만 선명하다', async (scenario) => {
    const { container } = render(<Ipv6ChangesDiagram />)
    await expectScenario(scenario, container)
  })

  it('전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<Ipv6ChangesDiagram />)
    await selectScenario('브로드캐스트')
    await selectScenario('전체')
    for (const element of diagram().querySelectorAll('[data-node], [data-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드가 280×208 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<Ipv6ChangesDiagram />)
    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 208')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expectFits([0, 0, 280, 208])
  })

  it('화살표는 같은 줄의 IPv4 노드에서 IPv6 노드로 가고 노드 안·라벨·곁말을 지나지 않는다', async () => {
    render(<Ipv6ChangesDiagram />)
    await expectArrows(tallArrows)
  })

  it('노드는 모두 회색이고 도식 전용 두 색·초록·빨강·주황은 쓰지 않는다', () => {
    render(<Ipv6ChangesDiagram />)
    for (const id of nodeIds) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
    expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('시나리오마다 같은 줄의 IPv4·IPv6 짝 둘만 선명하고 네 짝이 서로 다르다', async () => {
    render(<Ipv6ChangesDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<Ipv6ChangesDiagram />)
    const text = visualsByTopicId[topicId].diagrams['ipv6-changes']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(ipv6ChangesScenarios.map(({ id }) => id)).toEqual(expectedScenarios.map(({ id }) => id))
    expect(text.scenarios.map(({ id }) => id)).toEqual(expectedScenarios.map(({ id }) => id))
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.label).toBe(figureName)
    expect(text.sources).toEqual([anchorConceptId])
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = ipv6ChangesScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
      expect(scenario.caption).toBe(wording.caption)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(screen.getAllByRole('figure')).toEqual([figure])
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×208 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<Ipv6ChangesDiagram />)
      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 208')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('모든 rect가 440×208 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<Ipv6ChangesDiagram />)
      expectFits([0, 0, 440, 208])
    })

    it('화살표가 가로형에서도 같은 줄의 IPv4 노드에서 IPv6 노드로 간다', async () => {
      render(<Ipv6ChangesDiagram />)
      await expectArrows(wideArrows)
    })

    it('노드·그룹·곁말 id 집합과 화살표 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<Ipv6ChangesDiagram />)
      const read = (selector: string, attribute: string) => Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)).sort()
      const pathIds = async () => {
        const seen: string[] = []
        for (const { label } of expectedScenarios) {
          await selectScenario(label)
          seen.push(...read('[data-path]', 'data-path') as string[])
        }
        return seen.sort()
      }
      const tall = [read('[data-node]', 'data-node'), read('[data-group]', 'data-group'), read('[data-note]', 'data-note'), await pathIds()]
      act(() => change(true))
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 208')
      expect([read('[data-node]', 'data-node'), read('[data-group]', 'data-group'), read('[data-note]', 'data-note'), await pathIds()]).toEqual(tall)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·캡션을 보인다', async (scenario) => {
      const { container } = render(<Ipv6ChangesDiagram />)
      await expectScenario(scenario, container)
    })

    it('가로형에서도 짝과 화살표의 요점이 그대로다', async () => {
      render(<Ipv6ChangesDiagram />)
      await expectPoint()
    })

    it('폭이 바뀌어도 고른 시나리오와 캡션을 유지한다', async () => {
      const { change } = mockMatchMedia(true)
      const { container } = render(<Ipv6ChangesDiagram />)
      await selectScenario('단편화')
      act(() => change(false))
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 208')
      expect(screen.getByRole('button', { name: '단편화' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(expectedScenarios[3].caption)
      expect(brightNodes()).toEqual(['v4-fragment', 'v6-fragment'])
    })
  })
})
