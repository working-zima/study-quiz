import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { Ieee80211BandsDiagram, ieee80211BandsScenarios } from './Ieee80211BandsDiagram'

const topicId = 'wireless-lan'
const anchorConceptId = `${topicId}.ieee-80211-standards`
const labels: Record<string, string> = {
  'band24': '2.4GHz 대역',
  'band5': '5GHz 대역',
  'band60': '60GHz 대역',
  'std11b': '802.11b',
  'std11g': '802.11g',
  'std11n': '802.11n',
  'std11ax': '802.11ax',
  'std11a': '802.11a',
  'std11ac': '802.11ac',
  'std11ad': '802.11ad',
}
const noteLabels: Record<string, string> = {
  'band-24-note': '802.11ac는 없다',
  'band-5-note': '802.11ac는 여기',
  'band-60-note': '802.11ad는 여기',
}
const nodeIds = Object.keys(labels)
const noteIds = Object.keys(noteLabels)
const bandIds = ['band24', 'band5', 'band60']
const standardIds = nodeIds.filter((id) => !bandIds.includes(id))
// 화살표는 개정 노드의 변에서 시작해 그 개정이 쓰는 대역 노드의 변에서 끝난다.
const pathEnds: Record<string, [string, string]> = {
  '11b-24': ['std11b', 'band24'],
  '11g-24': ['std11g', 'band24'],
  '11n-24': ['std11n', 'band24'],
  '11ax-24': ['std11ax', 'band24'],
  '11n-5': ['std11n', 'band5'],
  '11ax-5': ['std11ax', 'band5'],
  '11a-5': ['std11a', 'band5'],
  '11ac-5': ['std11ac', 'band5'],
  '11ad-60': ['std11ad', 'band60'],
}
const tallPaths: Record<string, string> = {
  '11b-24': 'M176 32 H136 V60 H88',
  '11g-24': 'M176 68 H88',
  '11n-24': 'M176 104 H120 V76 H88',
  '11ax-24': 'M176 144 H104 V84 H88',
  '11n-5': 'M176 120 H104 V180 H88',
  '11ax-5': 'M176 160 H120 V188 H88',
  '11a-5': 'M176 196 H88',
  '11ac-5': 'M176 232 H136 V204 H88',
  '11ad-60': 'M176 272 H88',
}
const widePaths: Record<string, string> = {
  '11b-24': 'M104 32 H160 V52 H184',
  '11g-24': 'M104 60 H184',
  '11n-24': 'M104 104 H128 V68 H184',
  '11ax-24': 'M104 160 H144 V76 H184',
  '11n-5': 'M104 120 H184',
  '11ax-5': 'M104 140 H184',
  '11a-5': 'M336 120 H264',
  '11ac-5': 'M336 140 H264',
  '11ad-60': 'M336 192 H264',
}

const question = '802.11 규격들은 어느 주파수 대역을 쓸까?'
const figureName = '802.11의 개정 일곱(802.11a·b·g·n·ad·ac·ax)과 주파수 대역 셋(2.4GHz·5GHz·60GHz)을 두고, 대역마다 그 대역을 쓰는 개정을 잇는 도식'
const svgName = '주파수 대역 셋과 802.11의 개정 일곱을 두고, 개정에서 그 개정이 쓰는 대역으로 화살표를 잇는 그림'
const idleCaption = '802.11a·802.11b·802.11g·802.11n·802.11ad·802.11ac·802.11ax는 무선 LAN 표준 802.11의 개정이고, 2.4GHz·5GHz·60GHz는 주파수 대역이다. 버튼으로 대역을 고르면 그 대역을 쓰는 개정을 볼 수 있다.'
const legend = '화살표는 802.11의 개정에서 그 개정이 쓰는 주파수 대역으로 간다. 802.11ax는 1GHz부터 7.125GHz 사이의 다른 대역도 쓸 수 있지만, 이 그림은 2.4GHz·5GHz·60GHz 대역만 보인다.'
const expectedScenarios = [
  {
    id: 'band-24', label: '2.4GHz',
    nodes: ['band24', 'std11b', 'std11g', 'std11n', 'std11ax'],
    paths: ['11b-24', '11g-24', '11n-24', '11ax-24'],
    notes: ['band-24-note'],
    caption: '2.4GHz 대역은 802.11b와 802.11g가 쓰고, 802.11n과 802.11ax도 쓴다. 802.11ac는 2.4GHz 대역을 빼고 6GHz 아래에서 동작하도록 만든 개정이라 이 대역을 쓰지 않는다.',
  },
  {
    id: 'band-5', label: '5GHz',
    nodes: ['band5', 'std11n', 'std11ax', 'std11a', 'std11ac'],
    paths: ['11n-5', '11ax-5', '11a-5', '11ac-5'],
    notes: ['band-5-note'],
    caption: '5GHz 대역은 802.11a와 802.11ac가 쓰고, 802.11n과 802.11ax도 쓴다. 802.11ac는 2.4GHz 대역을 뺀 6GHz 아래, 곧 5GHz 대역에서 동작한다.',
  },
  {
    id: 'band-60', label: '60GHz',
    nodes: ['band60', 'std11ad'],
    paths: ['11ad-60'],
    notes: ['band-60-note'],
    caption: '60GHz 대역은 802.11ad가 쓴다. 802.11ad는 이름이 한 글자 다른 802.11ac와 같은 연구 그룹에서 나왔지만, 802.11ac와 달리 60GHz 대역에서 동작한다.',
  },
]
// 본문 목록 항목에서 개정마다 쓰는 대역. 802.11ac 항목에는 「2.4GHz 대역을 빼고」가 있어 2.4GHz 대역은 따로 본다.
const bandPhrases: Record<string, string> = { band24: '2.4GHz 대역', band5: '5GHz 대역', band60: '60GHz 대역' }
const bandsOf: Record<string, string[]> = {
  std11a: ['band5'],
  std11b: ['band24'],
  std11g: ['band24'],
  std11n: ['band24', 'band5'],
  std11ad: ['band60'],
  std11ac: ['band5'],
  std11ax: ['band24', 'band5'],
}

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
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note')!)
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)!
const opacity = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

// 곁말(9)의 가로 범위. 반각 문자가 섞이므로 어림값의 1.15배로 잡는다.
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

// 두 선분이 길이를 갖고 겹치는가(같은 줄 위에서 구간이 겹친다).
function coincides(a: Segment, b: Segment) {
  const aHorizontal = a.y1 === a.y2
  const bHorizontal = b.y1 === b.y2
  if (aHorizontal !== bHorizontal) return false
  if (aHorizontal) {
    return a.y1 === b.y1 && Math.min(Math.max(a.x1, a.x2), Math.max(b.x1, b.x2)) > Math.max(Math.min(a.x1, a.x2), Math.min(b.x1, b.x2))
  }
  return a.x1 === b.x1 && Math.min(Math.max(a.y1, a.y2), Math.max(b.y1, b.y2)) > Math.max(Math.min(a.y1, a.y2), Math.min(b.y1, b.y2))
}

function lineEnds(d: string) {
  const list = segments(d)
  return { start: { x: list[0].x1, y: list[0].y1 }, end: { x: list[list.length - 1].x2, y: list[list.length - 1].y2 } }
}

// 점이 상자의 네 변 가운데 하나 위에 있는가.
function onEdge(point: { x: number, y: number }, box: SvgBox) {
  const withinX = point.x >= box.x && point.x <= box.x + box.width
  const withinY = point.y >= box.y && point.y <= box.y + box.height
  return ((point.x === box.x || point.x === box.x + box.width) && withinY) || ((point.y === box.y || point.y === box.y + box.height) && withinX)
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
  return (nextMatches: boolean) => {
    mediaQuery.matches = nextMatches
    act(() => listeners.forEach((listener) => listener(Object.assign(new Event('change'), { matches: nextMatches, media: mediaQuery.media }) as MediaQueryListEvent)))
  }
}

function layoutTests(wide: boolean) {
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 232] : [0, 0, 280, 312]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<Ieee80211BandsDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<Ieee80211BandsDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(svg().querySelectorAll('[data-group]')).toHaveLength(0)
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<Ieee80211BandsDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownPaths()).toEqual(scenario.paths)
    for (const path of svg().querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('d', paths[path.getAttribute('data-path')!])
      expect(path).toHaveAttribute('stroke-width', '2')
      expect(path).toHaveClass('stroke-title')
      expect(path).toHaveAttribute('marker-end', `url(#${svg().querySelector('marker')!.id})`)
      expect(path.closest('[opacity]')).toBeNull()
    }
    expect(shownNotes()).toEqual(scenario.notes)
    for (const id of scenario.notes) {
      expect(note(id).textContent).toBe(noteLabels[id])
      expect(note(id)).toHaveAttribute('font-size', '9')
    }
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말이 자리에 들어간다`, async () => {
    render(<Ieee80211BandsDiagram />)
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
    // 곁말은 viewBox 안에 들어가고, 노드·다른 곁말·선과 겹치지 않는다.
    const noteBoxes: SvgBox[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of scenario.notes) noteBoxes.push(textBox(note(id), id))
    }
    expect([...noteBoxes.map(({ id }) => id)].sort()).toEqual([...noteIds].sort())
    expect(boxesOutsideViewBox(noteBoxes, viewBox)).toEqual([])
    for (const box of noteBoxes) {
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
      for (const other of noteBoxes.filter(({ id }) => id !== box.id)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
      for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 개정 노드의 변에서 시작해 대역 노드의 변에서 끝나고, 노드 안을 지나지 않으며 같은 대역의 선끼리 겹치지 않는다', () => {
    render(<Ieee80211BandsDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(pathEnds)))
    for (const [id, d] of Object.entries(paths)) {
      const [from, to] = pathEnds[id]
      const { start, end } = lineEnds(d)
      expect(onEdge(start, nodeBox(from)), `${id} 시작`).toBe(true)
      expect(onEdge(end, nodeBox(to)), `${id} 끝`).toBe(true)
      expect(bandIds, `${id}는 대역 노드로 간다`).toContain(to)
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
      }
    }
    for (const scenario of expectedScenarios) {
      for (const first of scenario.paths) {
        for (const second of scenario.paths.filter((id) => id !== first)) {
          for (const a of segments(paths[first])) for (const b of segments(paths[second])) expect(coincides(a, b), `${first} ↔ ${second}`).toBe(false)
        }
      }
    }
  })

  // 요점: 802.11ac는 5GHz에서 선명하고 60GHz에서 흐리며, 802.11ad는 60GHz에서만 선명하다.
  // 시나리오마다 선명한 개정이 본문 목록 항목이 말하는 그 개정의 대역과 같다.
  it('802.11ac는 5GHz에, 802.11ad는 60GHz에만 선명하고, 대역마다 선명한 개정이 본문 항목의 대역과 같다', async () => {
    render(<Ieee80211BandsDiagram />)
    const brightBy: Record<string, string[]> = {}
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      brightBy[scenario.id] = standardIds.filter((id) => opacity(id) === '1')
      for (const band of bandIds) expect(opacity(band), `${scenario.id} ${band}`).toBe(scenario.nodes.includes(band) ? '1' : '0.25')
    }
    expect(brightBy['band-5']).toContain('std11ac')
    expect(brightBy['band-60']).not.toContain('std11ac')
    expect(brightBy['band-24']).not.toContain('std11ac')
    expect(brightBy['band-60']).toEqual(['std11ad'])
    expect(brightBy['band-24']).not.toContain('std11ad')
    expect(brightBy['band-5']).not.toContain('std11ad')

    const scenarioBand: Record<string, string> = { 'band-24': 'band24', 'band-5': 'band5', 'band-60': 'band60' }
    for (const [scenarioId, band] of Object.entries(scenarioBand)) {
      expect(new Set(brightBy[scenarioId]), scenarioId).toEqual(new Set(standardIds.filter((id) => bandsOf[id].includes(band))))
    }

    const paragraphs = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs
    for (const id of standardIds) {
      const item = paragraphs.find((paragraph) => paragraph.startsWith(`- **${labels[id]}**`))
      expect(item, id).toBeDefined()
      for (const band of bandIds) {
        if (id === 'std11ac' && band === 'band24') {
          expect(item, `${id}는 2.4GHz 대역을 뺀다`).toContain('2.4GHz 대역을 빼고')
          continue
        }
        expect(item!.includes(bandPhrases[band]), `${id} ${band}`).toBe(bandsOf[id].includes(band))
      }
    }
  })
}

describe('Ieee80211BandsDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<Ieee80211BandsDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 312')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      await select('5GHz')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 232')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(screen.getByRole('button', { name: '5GHz' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><Ieee80211BandsDiagram /><Ieee80211BandsDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '2.4GHz' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<Ieee80211BandsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['ieee-80211-bands']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(ieee80211BandsScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toBeUndefined()
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
      const scenario = ieee80211BandsScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 IEEE 802.11 규격 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(within(figure).queryByRole('heading')).toBeNull()
  })
})
