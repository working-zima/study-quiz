import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { Ipv6NotationDiagram, ipv6NotationScenarios } from './Ipv6NotationDiagram'

const topicId = 'ip-protocol'
const anchorConceptId = `${topicId}.ipv6-address-notation`
const labels: Record<string, string> = {
  full: '2001:0db8:0000:0000:0000:0000:0000:0001',
  leading: '2001:db8:0:0:0:0:0:1',
  compressed: '2001:db8::1',
}
const noteLabels: Record<string, string> = {
  'title-full': '전체 표기',
  'title-leading': '앞쪽 0 생략',
  'title-compressed': ':: 줄임',
  gap: '적힌 묶음 셋, :: 자리에 0 묶음 다섯',
}
// 곁말마다 흐림을 따르는 노드. 줄 이름은 자기 줄을, 묶음 수 곁말은 :: 줄임 줄을 따른다.
const noteOwner: Record<string, string> = {
  'title-full': 'full',
  'title-leading': 'leading',
  'title-compressed': 'compressed',
  gap: 'compressed',
}
const nodeIds = Object.keys(labels)
const noteIds = Object.keys(noteLabels)
const ends: Record<string, [string, string]> = {
  'to-leading': ['full', 'leading'],
  'to-compressed': ['leading', 'compressed'],
}

const question = 'IPv6 주소는 어떻게 줄여 쓸까?'
const idleCaption = 'IPv6 주소 2001:0db8:0000:0000:0000:0000:0000:0001을 줄여 가는 세 단계다. 버튼을 고르면 단계마다 무엇이 바뀌는지 따로 볼 수 있다.'
const legend = '화살표를 따라갈수록 같은 주소를 더 짧게 적은 것이다. 세 꼴은 모두 같은 128비트 주소를 가리킨다.'
const figureName = 'IPv6 주소 하나를 기본 꼴에서 앞쪽 0을 빼고 ::로 줄여 가는 세 단계를 보이는 도식'
const svgName = 'IPv6 주소 2001:0db8:0000:0000:0000:0000:0000:0001이 앞쪽 0을 빼면 2001:db8:0:0:0:0:0:1이 되고, 0 묶음 다섯을 ::로 바꾸면 2001:db8::1이 되는 모습'
const expectedScenarios = [
  {
    id: 'full', label: '전체 표기', nodes: ['full'], paths: [] as string[],
    caption: '128비트를 16비트씩 여덟 묶음으로 끊고, 묶음마다 16진수 네 자리로 적어 콜론(:)으로 잇는다. 이 주소는 네 자리 묶음 여덟을 콜론 일곱 개로 이은 기본 꼴이다.',
  },
  {
    id: 'leading-zeros', label: '앞쪽 0 생략', nodes: ['full', 'leading'], paths: ['to-leading'],
    caption: '묶음마다 앞쪽의 0을 뺀다. 0db8은 db8, 0001은 1이 되고, 0000은 0 하나로 적는다. 뺄 수 있는 것은 앞쪽의 0뿐이다.',
  },
  {
    id: 'double-colon', label: ':: 줄임', nodes: ['leading', 'compressed'], paths: ['to-compressed'],
    caption: '0만 있는 묶음 다섯이 이어진 곳을 콜론 두 개(::)로 바꿔 2001:db8::1로 적는다. ::는 한 주소에 한 번만 쓸 수 있고, 적힌 묶음이 셋이니 :: 자리에는 0 묶음 다섯이 들어 있다.',
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

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
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

// 줄인 IPv6 주소를 여덟 묶음, 묶음마다 네 자리로 되살린다. ::는 한 번만 있어야 한다.
function expand(address: string) {
  const halves = address.split('::')
  expect(halves.length, address).toBeLessThanOrEqual(2)
  const head = halves[0] === '' ? [] : halves[0].split(':')
  const tail = halves.length === 2 && halves[1] !== '' ? halves[1].split(':') : []
  const missing = halves.length === 2 ? 8 - head.length - tail.length : 0
  const groups = [...head, ...Array(missing).fill('0'), ...tail]
  expect(groups, address).toHaveLength(8)
  return groups.map((group) => group.padStart(4, '0')).join(':')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다.
// 곁말은 viewBox 안에서 노드·서로와 겹치지 않는다. 그룹 박스는 없다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), (rect) => readBox(rect))
  expect(boxes).toHaveLength(nodeIds.length)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
  expect(diagram().querySelectorAll('[data-group]')).toHaveLength(0)
  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(nodeBox(id).height).toBe(32)
    expect(estimateTextWidth(label, 10) + 12, `${id} ${label}`).toBeLessThanOrEqual(nodeBox(id).width)
  }
  for (let i = 0; i < nodeIds.length; i += 1) {
    for (let j = i + 1; j < nodeIds.length; j += 1) {
      expect(overlaps(nodeBox(nodeIds[i]), nodeBox(nodeIds[j])), `${nodeIds[i]} ↔ ${nodeIds[j]}`).toBe(false)
    }
  }
  const texts = Array.from(diagram().querySelectorAll('[data-note]'), (note) => textBox(note, note.getAttribute('data-note')!))
  expect(texts.map(({ id }) => id)).toEqual(noteIds)
  for (const note of diagram().querySelectorAll('[data-note]')) expect(note).toHaveAttribute('font-size', '9')
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
  // 줄 이름은 자기 줄 바로 위에 있다.
  for (const id of ['title-full', 'title-leading', 'title-compressed']) {
    const owner = nodeBox(noteOwner[id])
    const box = texts.find((text) => text.id === id)!
    expect(box.y + box.height, id).toBeLessThanOrEqual(owner.y)
    expect(owner.y - (box.y + box.height), id).toBeLessThanOrEqual(8)
    expect(box.x, id).toBe(owner.x)
  }
}

// 화살표의 양 끝이 지정한 두 노드의 변에 닿고, 어떤 선분도 노드 안·곁말을 지나지 않는다.
async function expectArrows(arrows: Record<string, string>) {
  for (const scenario of expectedScenarios.filter(({ paths }) => paths.length > 0)) {
    await selectScenario(scenario.label)
    const notes = Array.from(diagram().querySelectorAll('[data-note]'), (note) => textBox(note, note.getAttribute('data-note')!))
    for (const path of diagram().querySelectorAll('[data-path]')) {
      const id = path.getAttribute('data-path')!
      expect(path).toHaveAttribute('d', arrows[id])
      const list = segments(path.getAttribute('d')!)
      for (const segment of list) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
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
  for (const id of noteIds) {
    expect(diagram().querySelector(`[data-note="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(noteOwner[id]) ? '1' : '0.25')
  }
  const shownPaths = Array.from(diagram().querySelectorAll('[data-path]'))
  expect(shownPaths.map((path) => path.getAttribute('data-path'))).toEqual(scenario.paths)
  for (const path of shownPaths) {
    expect(path).toHaveAttribute('marker-end', `url(#${diagram().querySelector('marker')!.id})`)
    expect(path).toHaveClass('stroke-title')
  }
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 요점: 세 줄의 글자는 같은 128비트 주소를 가리킨다 — 줄인 꼴을 되살리면 전체 표기와 같다.
// 앞쪽 0 생략 줄은 묶음마다 앞쪽 0만 뺀 것이고, ::는 마지막 줄에 한 번만 나온다. 세 꼴은 본문의 예와 같다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const read = (id: string) => diagram().querySelector(`[data-node="${id}"] text`)!.textContent!
  const full = read('full')
  const leading = read('leading')
  const compressed = read('compressed')

  const fullGroups = full.split(':')
  expect(fullGroups).toHaveLength(8)
  for (const group of fullGroups) expect(group).toMatch(/^[0-9a-f]{4}$/u)
  expect(leading.split(':').map((group) => group.padStart(4, '0'))).toEqual(fullGroups)
  expect(leading.split(':')).toEqual(fullGroups.map((group) => group.replace(/^0+(?=.)/u, '')))
  expect(expand(leading)).toBe(full)
  expect(expand(compressed)).toBe(full)
  expect(full.includes('::')).toBe(false)
  expect(leading.includes('::')).toBe(false)
  expect(compressed.split('::')).toHaveLength(2)
  expect(compressed.length).toBeLessThan(leading.length)
  expect(leading.length).toBeLessThan(full.length)

  // 묶음 수 곁말이 :: 자리에 든 0 묶음의 수와 맞다.
  const written = compressed.split('::').flatMap((half) => (half === '' ? [] : half.split(':'))).length
  expect(written).toBe(3)
  expect(8 - written).toBe(5)
  expect(diagram().querySelector('[data-note="gap"]')!.textContent).toBe('적힌 묶음 셋, :: 자리에 0 묶음 다섯')

  // 화살표를 따라 줄이 짧아진다 — 세로형은 아래로, 가로형은 둘째 줄에서 오른쪽으로 간다.
  expect(nodeBox('leading').y).toBeGreaterThan(nodeBox('full').y)
  expect(nodeBox('compressed').y + nodeBox('compressed').x).toBeGreaterThan(nodeBox('leading').y + nodeBox('leading').x)

  const seen: string[] = []
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    seen.push(`${brightNodes().join()}|${Array.from(diagram().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')).join()}`)
  }
  expect(new Set(seen).size).toBe(expectedScenarios.length)

  expect(body).toContain(`예를 들어 \`${full}\`은 네 자리 묶음 여덟을 콜론 일곱 개로 이은 IPv6 주소다`)
  expect(body).toContain(`첫째 규칙만 쓰면 위 주소는 \`${leading}\`이 된다`)
  expect(body).toContain(`0 묶음 다섯을 \`::\`로 바꾸면 \`${compressed}\`이 된다`)
  expect(body).toContain('묶음이 셋 적혀 있으면 `::` 자리에는 0 묶음 다섯이 들어 있다')
  expect(body).toContain('`::`는 한 주소에 한 번만 쓸 수 있다')
}

async function expectUniqueMarkers() {
  render(<><Ipv6NotationDiagram /><Ipv6NotationDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '앞쪽 0 생략' })) })
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
  'to-leading': 'M140 56 V92',
  'to-compressed': 'M140 124 V160',
}
const wideArrows: Record<string, string> = {
  'to-leading': 'M108 56 V92',
  'to-compressed': 'M208 108 H232',
}

describe('Ipv6NotationDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<Ipv6NotationDiagram />)
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 곁말이 모두 선명하고 화살표 없이 선택 안내가 나온다', () => {
    const { container } = render(<Ipv6NotationDiagram />)
    expect(Array.from(diagram().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node], [data-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.textContent)).toEqual(Object.values(noteLabels))
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 선명하다', async (scenario) => {
    const { container } = render(<Ipv6NotationDiagram />)
    await expectScenario(scenario, container)
  })

  it('전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<Ipv6NotationDiagram />)
    await selectScenario(':: 줄임')
    await selectScenario('전체')
    for (const element of diagram().querySelectorAll('[data-node], [data-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드가 280×216 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<Ipv6NotationDiagram />)
    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 216')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 216])
  })

  it('화살표는 앞 줄에서 다음 줄로 가고 노드 안·곁말을 지나지 않는다', async () => {
    render(<Ipv6NotationDiagram />)
    await expectArrows(tallArrows)
  })

  it('노드는 모두 회색이고 도식 전용 두 색·초록·빨강·주황은 쓰지 않는다', () => {
    render(<Ipv6NotationDiagram />)
    for (const id of nodeIds) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
    expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('세 꼴은 같은 주소이고, 앞쪽 0만 빼며, ::는 마지막 줄에 한 번만 나온다', async () => {
    render(<Ipv6NotationDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<Ipv6NotationDiagram />)
    const text = visualsByTopicId[topicId].diagrams['ipv6-notation']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(ipv6NotationScenarios.map(({ id }) => id)).toEqual(expectedScenarios.map(({ id }) => id))
    expect(text.scenarios.map(({ id }) => id)).toEqual(expectedScenarios.map(({ id }) => id))
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toBeUndefined()
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
      const scenario = ipv6NotationScenarios.find(({ id }) => id === expected.id)!
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
    expect(within(figure).queryByRole('heading')).toBeNull()
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×148 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<Ipv6NotationDiagram />)
      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 148')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('모든 rect가 440×148 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<Ipv6NotationDiagram />)
      expectFits([0, 0, 440, 148])
    })

    it('화살표가 가로형에서도 앞 줄에서 다음 줄로 간다', async () => {
      render(<Ipv6NotationDiagram />)
      await expectArrows(wideArrows)
    })

    it('노드·곁말 id 집합과 화살표 id가 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<Ipv6NotationDiagram />)
      const read = (selector: string, attribute: string) => Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)).sort()
      const ids = async () => {
        const paths: (string | null)[] = []
        for (const { label } of expectedScenarios) {
          await selectScenario(label)
          paths.push(...read('[data-path]', 'data-path'))
        }
        await selectScenario('전체')
        return [read('[data-node]', 'data-node'), read('[data-group]', 'data-group'), read('[data-note]', 'data-note'), paths.sort()]
      }
      const tall = await ids()
      act(() => change(true))
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 148')
      expect(await ids()).toEqual(tall)
      expect(tall[0]).toEqual([...nodeIds].sort())
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·캡션을 보인다', async (scenario) => {
      const { container } = render(<Ipv6NotationDiagram />)
      await expectScenario(scenario, container)
    })

    it('가로형에서도 세 꼴이 같은 주소이고 ::는 마지막 줄에 한 번만 나온다', async () => {
      render(<Ipv6NotationDiagram />)
      await expectPoint()
    })

    it('폭이 바뀌어도 고른 시나리오와 캡션을 유지한다', async () => {
      const { change } = mockMatchMedia(true)
      const { container } = render(<Ipv6NotationDiagram />)
      await selectScenario(':: 줄임')
      act(() => change(false))
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 216')
      expect(screen.getByRole('button', { name: ':: 줄임' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(expectedScenarios[2].caption)
      expect(brightNodes()).toEqual(['leading', 'compressed'])
    })
  })
})
