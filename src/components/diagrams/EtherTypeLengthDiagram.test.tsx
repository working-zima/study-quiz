import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { EtherTypeLengthDiagram, etherTypeLengthScenarios } from './EtherTypeLengthDiagram'

const anchorConceptId = 'ethernet.ethertype-length'
const wording = () => visualsByTopicId.ethernet.diagrams['ethertype-length']
const concept = () => topics.find(({ id }) => id === 'ethernet')!.concepts.find(({ id }) => id === anchorConceptId)!
const body = () => concept().paragraphs.join('\n')
const svg = () => screen.getByRole('img', { name: wording().svgLabel })

const labels = {
  'length-range': '0000~05DC',
  gap: '05DD~05FF',
  'type-range': '0600~FFFF',
  'value-0064': '0064',
  'value-0800': '0800',
  'value-0806': '0806',
}
const noteLabels = {
  'length-range': '1500 이하 · 길이로 읽음',
  gap: '1501~1535 · 정해지지 않음',
  'type-range': '1536 이상 · 이더타입으로 읽음',
  'value-0064': '데이터의 길이 100바이트',
  'value-0800': 'IPv4',
  'value-0806': 'ARP',
}
const nodeIds = Object.keys(labels)
// 값의 범위를 작은 값부터 나눈 세 칸. 띠로 빈틈없이 잇는다.
const bandIds = ['length-range', 'gap', 'type-range']
const valueIds = ['value-0064', 'value-0800', 'value-0806']
const question = '같은 두 바이트를 왜 다르게 읽을까?'

const tallPaths: Record<string, string> = {
  'to-length': 'M68 40 V64',
  'to-type-0800': 'M44 184 V160',
  'to-type-0806': 'M116 184 V160',
}
const widePaths: Record<string, string> = {
  'to-length': 'M78 56 V80',
  'to-type-0800': 'M328 56 V80',
  'to-type-0806': 'M400 56 V80',
}
// 화살표마다 출발하는 예시 값과 그 값이 드는 범위 칸.
const ends: Record<string, [string, string]> = {
  'to-length': ['value-0064', 'length-range'],
  'to-type-0800': ['value-0800', 'type-range'],
  'to-type-0806': ['value-0806', 'type-range'],
}

const scenarios = [
  { id: 'ipv4', label: '값 0800', nodes: ['value-0800', 'type-range'], paths: ['to-type-0800'] },
  { id: 'arp', label: '값 0806', nodes: ['value-0806', 'type-range'], paths: ['to-type-0806'] },
  { id: 'length', label: '값 0064', nodes: ['value-0064', 'length-range'], paths: ['to-length'] },
]

const select = async (label: string) => { await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) }) }

function readBox(rect: Element): SvgBox {
  return {
    id: rect.parentElement?.getAttribute('data-node') ?? '',
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}
const nodeBox = (id: string) => readBox(svg().querySelector(`[data-node="${id}"] rect`)!)

function textBox(text: Element): SvgBox {
  const width = estimateTextWidth(text.textContent!, 9)
  const x = Number(text.getAttribute('x'))
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id: text.getAttribute('data-note')!, x: left, y: Number(text.getAttribute('y')) - 9, width, height: 9 }
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
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

function lineEnds(d: string) {
  const list = segments(d)
  return { start: { x: list[0].x1, y: list[0].y1 }, end: { x: list[list.length - 1].x2, y: list[list.length - 1].y2 } }
}

// 점이 변 위에 놓인 노드. 띠 칸끼리는 변을 나누므로 화살표 끝은 칸 하나에만 닿아야 한다.
function nodesAt(point: { x: number, y: number }) {
  return nodeIds.filter((id) => onEdge(point.x, point.y, nodeBox(id)))
}

function mockWidth(matches: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>()
  const query = {
    matches, media: WIDE_DIAGRAM_QUERY,
    addEventListener: vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener)),
    removeEventListener: vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener)),
  }
  vi.stubGlobal('matchMedia', vi.fn(() => query))
  return (next: boolean) => {
    query.matches = next
    act(() => listeners.forEach((listener) => listener(Object.assign(new Event('change'), { matches: next }) as MediaQueryListEvent)))
  }
}

// 모든 rect가 viewBox 안에 있고, 라벨이 칸 안에 들어가며, 곁말은 크기 9로 노드·서로·선과 겹치지 않는다.
function expectGeometry(width: number, height: number) {
  const boxes = Array.from(svg().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length)
  expect(boxesOutsideViewBox(boxes, [0, 0, width, height])).toEqual([])
  for (const [id, label] of Object.entries(labels)) {
    const node = svg().querySelector(`[data-node="${id}"]`)!
    const rect = node.querySelector('rect')!
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(rect).toHaveAttribute('height', '32')
    expect(rect).toHaveAttribute('rx', bandIds.includes(id) ? '0' : '4')
    expect(rect).toHaveClass('stroke-disabled')
    expect(estimateTextWidth(label, 10) + 12, `${id} ${label}`).toBeLessThanOrEqual(readBox(rect).width)
  }

  const notes = Array.from(svg().querySelectorAll('[data-note]'))
  const noteBoxes = notes.map(textBox)
  expect(boxesOutsideViewBox(noteBoxes, [0, 0, width, height])).toEqual([])
  const lines = Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('d')!)
  for (const [index, note] of notes.entries()) {
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    for (const box of boxes) expect(overlaps(noteBoxes[index], box), `${noteBoxes[index].id} ↔ ${box.id}`).toBe(false)
    for (const line of lines) {
      for (const segment of segments(line)) expect(touches(segment, noteBoxes[index]), `${noteBoxes[index].id} ↔ 선`).toBe(false)
    }
  }
  for (let i = 0; i < noteBoxes.length; i += 1) {
    for (const other of noteBoxes.slice(i + 1)) expect(overlaps(noteBoxes[i], other), `${noteBoxes[i].id} ↔ ${other.id}`).toBe(false)
  }
  expect(svg().querySelector('[class*="diagram-"], [class*="red"], [class*="green"], [class*="orange"], [class*="amber"]')).toBeNull()
}

// 보이는 화살표는 자기 예시 값의 변에서 출발해 범위 칸 하나의 변에서 끝나고, 어떤 노드 안도 지나지 않는다.
function expectArrows(expected: Record<string, string>) {
  for (const path of svg().querySelectorAll('[data-path]')) {
    const id = path.getAttribute('data-path')!
    const d = path.getAttribute('d')!
    expect(d, id).toBe(expected[id])
    expect(path).toHaveAttribute('stroke-width', '2')
    expect(path).toHaveClass('fill-none', 'stroke-title')
    expect(path).toHaveAttribute('marker-end', `url(#${svg().querySelector('marker')!.id})`)
    expect(path.closest('[opacity]')).toBeNull()
    for (const segment of segments(d)) {
      for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
    }
    const { start, end } = lineEnds(d)
    expect(nodesAt(start), `${id} 시작`).toEqual([ends[id][0]])
    expect(nodesAt(end), `${id} 끝`).toEqual([ends[id][1]])
  }
}

// 요점: 범위 세 칸은 작은 값부터 빈틈없이 이어지고(세로형은 위에서 아래로, 가로형은 왼쪽에서 오른쪽으로) 서로 겹치지 않는다.
// 이더타입 예시를 고르면 1536 이상 칸만, 길이 예시를 고르면 1500 이하 칸만 선명하고, 사이의 칸은 어느 예시에서도 선명하지 않다.
// 예시 값·곁말과 칸의 범위는 모두 개념 본문에 적혀 있다.
function expectBand(wide: boolean) {
  const band = bandIds.map(nodeBox)
  for (let i = 1; i < band.length; i += 1) {
    if (wide) {
      expect(band[i].x).toBe(band[i - 1].x + band[i - 1].width)
      expect(band[i].y).toBe(band[0].y)
    } else {
      expect(band[i].y).toBe(band[i - 1].y + band[i - 1].height)
      expect(band[i].x).toBe(band[0].x)
      expect(band[i].width).toBe(band[0].width)
    }
    for (const earlier of band.slice(0, i)) expect(overlaps(band[i], earlier)).toBe(false)
  }
  for (const value of valueIds) {
    for (const cell of band) expect(overlaps(nodeBox(value), cell), `${value} ↔ ${cell.id}`).toBe(false)
  }
}

async function expectPoint() {
  for (const scenario of scenarios) {
    await select(scenario.label)
    const brightBand = bandIds.filter((id) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
    expect(brightBand, scenario.id).toEqual(scenario.id === 'length' ? ['length-range'] : ['type-range'])
    const arrows = Array.from(svg().querySelectorAll('[data-path]'), (path) => lineEnds(path.getAttribute('d')!))
    expect(arrows, scenario.id).toHaveLength(1)
    expect(nodesAt(arrows[0].end), scenario.id).toEqual(brightBand)
  }
  // 칸 라벨은 경계 수(0000·05DC·05DD·05FF·0600·FFFF)를 하나씩 본다.
  for (const word of [...valueIds.map((id) => labels[id as keyof typeof labels]), '0000', 'FFFF', '05DC', '05DD', '05FF', '0600', '1500 이하', '1536 이상', '1501', '1535', 'IPv4', 'ARP', '100바이트']) {
    expect(body(), word).toContain(word)
  }
  expect(body()).toContain('길이로 읽는다')
  expect(body()).toContain('이더타입(EtherType)으로 읽는다')
  expect(body()).toContain('정해져 있지 않다')
  expect(body()).toContain('프레임 전체의 크기와는 다르다')
}

function layoutTests(wide: boolean) {
  const width = wide ? 440 : 280
  const height = wide ? 136 : 240
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목이 버튼 앞에 있고 헤딩은 없으며 SVG는 하나다', () => {
    render(<EtherTypeLengthDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', `0 0 ${width} ${height}`)
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('전체에서는 칸·예시 값·곁말이 모두 선명하고 화살표 없이 초기 캡션과 범례가 보인다', () => {
    const { container } = render(<EtherTypeLengthDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const node of svg().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note')).sort()).toEqual([...nodeIds].sort())
    for (const note of svg().querySelectorAll('[data-note]')) {
      expect(note.textContent).toBe(noteLabels[note.getAttribute('data-note') as keyof typeof noteLabels])
      expect(note).toHaveAttribute('opacity', '1')
    }
    expect(svg().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(wording().idleCaption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByText(wording().legend!)).toBeInTheDocument()
    expectGeometry(width, height)
    expectBand(wide)
  })

  it.each(scenarios)('$label: 그 값과 그 값이 드는 칸만 선명하고 화살표 하나와 캡션이 바뀐다', async (expected) => {
    const { container } = render(<EtherTypeLengthDiagram />)
    await select(expected.label)
    for (const node of svg().querySelectorAll('[data-node]')) {
      expect(node).toHaveAttribute('opacity', expected.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
    }
    for (const note of svg().querySelectorAll('[data-note]')) {
      expect(note).toHaveAttribute('opacity', expected.nodes.includes(note.getAttribute('data-note')!) ? '1' : '0.25')
    }
    expect(Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path'))).toEqual(expected.paths)
    expectArrows(paths)
    expect(container.querySelector('figcaption')!.textContent).toBe(wording().scenarios.find(({ id }) => id === expected.id)!.caption)
    expect(screen.getByRole('button', { name: expected.label })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
    expectGeometry(width, height)
  })

  it('다른 시나리오와 전체로 바꾸면 이전 화살표와 흐림이 남지 않는다', async () => {
    const { container } = render(<EtherTypeLengthDiagram />)
    for (const scenario of [...scenarios, scenarios[0]]) {
      await select(scenario.label)
      expect(Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path'))).toEqual(scenario.paths)
    }
    await select('전체')
    for (const node of svg().querySelectorAll('[data-node], [data-note]')) expect(node).toHaveAttribute('opacity', '1')
    expect(svg().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(wording().idleCaption)
  })

  it('이더타입 예시는 1536 이상 칸에만, 길이 예시는 1500 이하 칸에만 닿고 사이 칸은 쓰이지 않는다', async () => {
    render(<EtherTypeLengthDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    render(<><EtherTypeLengthDiagram /><EtherTypeLengthDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: wording().label })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: scenarios[0].label })) })
      for (const path of figure.querySelectorAll('[data-path]')) {
        expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
      }
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })
}

describe('EtherTypeLengthDiagram', () => {
  layoutTests(false)

  it('JSON과 컴포넌트의 시나리오가 같고 문구와 근거 개념을 JSON에서 읽는다', () => {
    render(<EtherTypeLengthDiagram />)
    const text = wording()
    expect(etherTypeLengthScenarios.map(({ id }) => id)).toEqual(scenarios.map(({ id }) => id))
    expect(text.scenarios.map(({ id }) => id)).toEqual(scenarios.map(({ id }) => id))
    expect(text.nodes).toEqual(labels)
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.label).toBe('이더타입/길이 필드를 읽는 법 도식')
    expect(text.sources).toEqual([anchorConceptId])
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...scenarios.map(({ label }) => label)])
    for (const [index, scenario] of etherTypeLengthScenarios.entries()) {
      expect(scenario.nodes).toEqual(scenarios[index].nodes)
      expect(scenario.paths).toEqual(scenarios[index].paths)
      expect(scenario.label).toBe(scenarios[index].label)
      expect(text.scenarios[index].label).toBe(scenarios[index].label)
      expect(scenario.caption).toBe(text.scenarios[index].caption)
      expect(text.scenarios[index].sources).toEqual([anchorConceptId])
    }
    // 같은 칸에 드는 두 이더타입 예시도 선명한 값과 화살표가 달라 서로 다른 것을 보인다.
    expect(new Set(scenarios.map(({ nodes, paths }) => JSON.stringify({ nodes, paths }))).size).toBe(scenarios.length)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 본문 뒤에 도식이 붙는다', (headingLevel) => {
    render(<ConceptList concepts={[concept()]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: wording().label })
    expect(figure.closest('article')).toHaveAttribute('id', concept().id)
    expect(figure.previousElementSibling?.textContent).toBe(concept().paragraphs.join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(within(figure).queryByRole('heading')).toBeNull()
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockWidth(true) })
    afterEach(() => { vi.unstubAllGlobals() })
    layoutTests(true)

    it('폭이 바뀌어도 노드·화살표 id와 선택·캡션이 유지된다', async () => {
      const change = mockWidth(false)
      const { container } = render(<EtherTypeLengthDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 240')
      const ids = () => Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallIds = ids()
      await select(scenarios[1].label)
      const caption = container.querySelector('figcaption')!.textContent
      change(true)
      expect(svg()).toHaveAttribute('viewBox', '0 0 440 136')
      expect(ids()).toEqual(tallIds)
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(screen.getByRole('button', { name: scenarios[1].label })).toHaveAttribute('aria-pressed', 'true')
      const shown = Array.from(svg().querySelectorAll('[data-path]'))
      expect(shown.map((path) => path.getAttribute('data-path'))).toEqual(scenarios[1].paths)
      for (const path of shown) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(Object.keys(widePaths).sort()).toEqual(Object.keys(tallPaths).sort())
      change(false)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 240')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
    })
  })
})
