import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { NtpStratumDiagram, ntpStratumScenarios } from './NtpStratumDiagram'

const topicId = 'app-protocols-mgmt-security'
const anchorConceptId = `${topicId}.ntp`
const labels: Record<string, string> = {
  clock: '기준 시계',
  primary: '주 서버',
  company: '회사의 시각 서버',
  pc1: 'PC 1',
  pc2: 'PC 2',
}
const noteLabels: Record<string, string> = {
  'stratum-1': 'stratum 1',
  'stratum-2': 'stratum 2',
  'source-note': '기준 시계에 바로 맞춘다',
  'chain-note': '번호가 하나 커진다',
  'udp-note': 'UDP · 123번',
}
const nodeIds = Object.keys(labels)
const noteIds = Object.keys(noteLabels)
const layerNotes = ['stratum-1', 'stratum-2']
const linkIds = ['l-clock', 'l-s1', 'l-pc1', 'l-pc2']

const tallPaths: Record<string, string> = {
  'l-clock': 'M140 40 V72',
  'l-s1': 'M140 104 V136',
  'l-pc1': 'M96 168 V232',
  'l-pc2': 'M200 168 V232',
  'from-clock': 'M140 40 V72',
  'ask-s1': 'M124 136 V104',
  'answer-s1': 'M140 104 V136',
  'ask-pc1': 'M80 232 V168',
  'answer-pc1': 'M96 168 V232',
  'ask-pc2': 'M184 232 V168',
  'answer-pc2': 'M200 168 V232',
}
const widePaths: Record<string, string> = {
  'l-clock': 'M96 40 H128',
  'l-s1': 'M216 32 H248',
  'l-pc1': 'M272 56 V120',
  'l-pc2': 'M384 56 V120',
  'from-clock': 'M96 40 H128',
  'ask-s1': 'M248 48 H216',
  'answer-s1': 'M216 32 H248',
  'ask-pc1': 'M256 120 V56',
  'answer-pc1': 'M272 56 V120',
  'ask-pc2': 'M368 120 V56',
  'answer-pc2': 'M384 56 V120',
}
// 경로마다 출발과 도착 노드. 선과 답은 시각을 주는 쪽에서 받는 쪽으로, 요청은 받는 쪽에서 주는 쪽으로 간다.
const ends: Record<string, [string, string]> = {
  'l-clock': ['clock', 'primary'],
  'l-s1': ['primary', 'company'],
  'l-pc1': ['company', 'pc1'],
  'l-pc2': ['company', 'pc2'],
  'from-clock': ['clock', 'primary'],
  'ask-s1': ['company', 'primary'],
  'answer-s1': ['primary', 'company'],
  'ask-pc1': ['pc1', 'company'],
  'answer-pc1': ['company', 'pc1'],
  'ask-pc2': ['pc2', 'company'],
  'answer-pc2': ['company', 'pc2'],
}
// stratum 번호 곁말이 붙는 서버
const layerOf: Record<string, string> = { 'stratum-1': 'primary', 'stratum-2': 'company' }

const question = '시각은 어떤 차례로 전해질까?'
const figureName = '기준 시계에 바로 맞추는 주 서버(stratum 1)에서 회사의 시각 서버(stratum 2)가 시각을 받고, 「PC 1」과 「PC 2」가 그 서버에 UDP 123번으로 시각을 물어 시계를 맞추는 차례를 보이는 도식'
const svgName = '기준 시계, 주 서버, 회사의 시각 서버를 차례로 잇고 회사의 시각 서버 아래에 PC 1과 PC 2를 둔 그림'
const idleCaption = '기준 시계에서 주 서버와 회사의 시각 서버를 거쳐 회사의 PC 두 대까지 시각이 전해지는 차례를 그렸다. 버튼을 고르면 층마다 시각을 어떻게 주고받는지 볼 수 있다.'
const legend = '노드 사이의 선은 시각이 전해지는 길이고, 화살표는 시각을 묻는 요청이나 시각을 알려 주는 답이 가는 방향이다. 서버 곁의 stratum 번호는 그 서버가 기준 시계에서 몇 번째 층인지 나타낸다.'
const expectedScenarios = [
  {
    id: 'source', label: '기준 시계',
    nodes: ['clock', 'primary', 'l-clock'], paths: ['from-clock'], notes: ['source-note'],
    caption: 'GPS 수신기처럼 표준 시각을 바로 받아 알려 주는 장치가 기준 시계이고, 이 기준 시계에 바로 맞추는 서버가 주 서버다. 주 서버의 stratum 번호는 1이다.',
  },
  {
    id: 'chain', label: '이어 받기',
    nodes: ['primary', 'company', 'l-s1'], paths: ['ask-s1', 'answer-s1'], notes: ['chain-note'],
    caption: '회사의 시각 서버는 주 서버에 시각을 묻는 요청을 보내고, 주 서버가 돌려준 답으로 시계를 맞춘다. stratum 1 서버에서 시각을 받으므로 번호가 하나 커진 stratum 2다.',
  },
  {
    id: 'client', label: '클라이언트',
    nodes: ['company', 'pc1', 'pc2', 'l-pc1', 'l-pc2'], paths: ['ask-pc1', 'answer-pc1', 'ask-pc2', 'answer-pc2'], notes: ['udp-note'],
    caption: '「PC 1」과 「PC 2」는 회사의 시각 서버의 UDP 123번으로 시각을 묻고, 서버가 바로 돌려준 답으로 자기 시계를 맞춘다. 서버는 PC에게 시각을 알려 주기만 한다.',
  },
]

const svg = () => screen.getByRole('img', { name: svgName })
const select = async (label: string) => { await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) }) }

function readBox(rect: Element, id = ''): SvgBox {
  return {
    id,
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

const nodeBox = (id: string) => readBox(svg().querySelector(`[data-node="${id}"] rect`)!, id)
const label = (id: string) => svg().querySelector(`[data-node="${id}"] text`)!.textContent!
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)!
const brightNodes = () => nodeIds.filter((id) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (item) => item.getAttribute('data-note')!)

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

// 두 상자 사이의 틈. 가로와 세로 가운데 큰 쪽이다.
function gap(a: SvgBox, b: SvgBox) {
  const dx = Math.max(0, b.x - (a.x + a.width), a.x - (b.x + b.width))
  const dy = Math.max(0, b.y - (a.y + a.height), a.y - (b.y + b.height))
  return Math.max(dx, dy)
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

const endAt = (point: { x: number, y: number }) => nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))

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
  return (nextMatches: boolean) => {
    mediaQuery.matches = nextMatches
    act(() => listeners.forEach((listener) => listener(Object.assign(new Event('change'), { matches: nextMatches, media: mediaQuery.media }) as MediaQueryListEvent)))
  }
}

function layoutTests(wide: boolean) {
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 160] : [0, 0, 280, 272]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<NtpStratumDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 선이 모두 선명하고 화살표 없이 stratum 번호만 곁말로 보이며 선택 안내가 나온다', () => {
    const { container } = render(<NtpStratumDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(Array.from(svg().querySelectorAll('[data-link]'), (link) => link.getAttribute('data-link'))).toEqual(linkIds)
    for (const element of svg().querySelectorAll('[data-link]')) {
      expect(element).toHaveAttribute('opacity', '1')
      expect(element).not.toHaveAttribute('marker-end')
      expect(element).toHaveAttribute('d', paths[element.getAttribute('data-link')!])
    }
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual(layerNotes)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·선·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<NtpStratumDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    for (const id of linkIds) expect(svg().querySelector(`[data-link="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownPaths()).toEqual(scenario.paths)
    expect(shownNotes()).toEqual([...layerNotes, ...scenario.notes])
    for (const id of [...layerNotes, ...scenario.notes]) expect(note(id).textContent).toBe(noteLabels[id])
    for (const path of svg().querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('d', paths[path.getAttribute('data-path')!])
      expect(path).toHaveAttribute('stroke-width', '2')
      expect(path).toHaveClass('stroke-title')
      expect(path).toHaveAttribute('marker-end', `url(#${svg().querySelector('marker')!.id})`)
      expect(path.closest('[opacity]')).toBeNull()
    }
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말이 자리에 들어간다`, async () => {
    render(<NtpStratumDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    // 시나리오 곁말은 그 시나리오를 골랐을 때만 보이므로, 시나리오를 차례로 골라 모두 잰다.
    const noteTexts: SvgBox[] = layerNotes.map((id) => textBox(note(id), id))
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const element of svg().querySelectorAll('[data-note]')) {
        expect(element).toHaveAttribute('font-size', '9')
        expect(element).toHaveClass('fill-muted')
      }
      for (const id of scenario.notes) noteTexts.push(textBox(note(id), id))
    }
    expect(noteTexts.map(({ id }) => id)).toEqual(noteIds)
    for (const box of noteTexts) {
      expect(box.x, box.id).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width, box.id).toBeLessThanOrEqual(viewBox[2])
      expect(box.y, box.id).toBeGreaterThanOrEqual(0)
      expect(box.y + box.height, box.id).toBeLessThanOrEqual(viewBox[3])
      for (const d of Object.values(paths)) {
        for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
      }
      for (const id of nodeIds) expect(overlaps(box, nodeBox(id)), `${box.id} ↔ ${id}`).toBe(false)
    }
    for (let i = 0; i < noteTexts.length; i += 1) {
      for (const other of noteTexts.slice(i + 1)) expect(overlaps(noteTexts[i], other), `${noteTexts[i].id} ↔ ${other.id}`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('경로 양 끝은 노드 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', () => {
    render(<NtpStratumDiagram />)
    for (const [id, d] of Object.entries(paths)) {
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
      }
      const { start, end } = lineEnds(d)
      expect(endAt(start), `${id} 시작`).toBe(ends[id][0])
      expect(endAt(end), `${id} 끝`).toBe(ends[id][1])
    }
  })

  // 요점: 기준 시계에서 선을 따라 내려가면 서버의 stratum 번호가 1, 2로 하나씩 커지고, PC는 UDP 123번으로 묻는다. 기준 시계는 기준 시계 시나리오에서만 선명하다.
  it('선을 따라 내려가면 stratum 번호가 하나씩 커지고, 클라이언트 경로의 곁말에 123이 있으며, 기준 시계는 기준 시계 시나리오에서만 선명하다', async () => {
    render(<NtpStratumDiagram />)
    const next = new Map(linkIds.filter((id) => ends[id][0] !== 'company').map((id) => [ends[id][0], ends[id][1]]))
    const order = ['clock']
    while (next.has(order[order.length - 1])) order.push(next.get(order[order.length - 1])!)
    expect(order).toEqual(['clock', 'primary', 'company'])
    const numbers = order.slice(1).map((id) => {
      const noteId = Object.keys(layerOf).find((key) => layerOf[key] === id)!
      const box = textBox(note(noteId), noteId)
      // 곁말은 자기 서버 바로 곁에 있고, 그 서버가 곁말에 가장 가까운 노드다.
      expect(gap(box, nodeBox(id)), noteId).toBeLessThanOrEqual(12)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(gap(box, nodeBox(other)), `${noteId} ↔ ${other}`).toBeGreaterThan(gap(box, nodeBox(id)))
      return Number(note(noteId).textContent!.match(/^stratum (\d+)$/u)![1])
    })
    expect(numbers).toEqual([1, 2])
    expect(svg().textContent).not.toContain('stratum 0')

    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      expect(brightNodes().includes('clock'), scenario.id).toBe(scenario.id === 'source')
    }

    await select('클라이언트')
    expect(note('udp-note').textContent).toContain('123')
    expect(note('udp-note').textContent).toContain('UDP')
    const udp = textBox(note('udp-note'), 'udp-note')
    expect(udp.y).toBeGreaterThan(nodeBox('company').y + nodeBox('company').height)
    expect(udp.y + udp.height).toBeLessThan(nodeBox('pc1').y)
    for (const id of ['ask-pc1', 'ask-pc2']) {
      expect(['pc1', 'pc2']).toContain(endAt(lineEnds(paths[id]).start))
      expect(endAt(lineEnds(paths[id]).end)).toBe('company')
    }
    for (const id of ['answer-pc1', 'answer-pc2']) expect(endAt(lineEnds(paths[id]).start)).toBe('company')

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const name of ['기준 시계', '주 서버', '「회사의 시각 서버」', '「PC 1」', '「PC 2」', 'stratum 1', 'stratum 2', 'UDP `123`번', 'GPS 수신기', '번호가 하나씩 커진다', '기준 시계에 바로 맞추는']) {
      expect(body, name).toContain(name)
    }
  })
}

describe('NtpStratumDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·선 id 집합과 경로 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<NtpStratumDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 272')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallLinks = Array.from(svg().querySelectorAll('[data-link]'), (link) => link.getAttribute('data-link'))
      await select('이어 받기')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 160')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-link]'), (link) => link.getAttribute('data-link'))).toEqual(tallLinks)
      expect(screen.getByRole('button', { name: '이어 받기' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><NtpStratumDiagram /><NtpStratumDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '클라이언트' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<NtpStratumDiagram />)
    const text = visualsByTopicId[topicId].diagrams['ntp-stratum']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(ntpStratumScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    expect(text.nodes).toEqual(labels)
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.label).toBe(figureName)
    expect(text.svgLabel).toBe(svgName)
    expect(text.sources).toEqual([anchorConceptId])
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map((scenario) => scenario.label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = ntpStratumScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 NTP 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(within(figure).queryByRole('heading')).toBeNull()
  })
})
