import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ChannelOverlapDiagram, channelOverlapScenarios } from './ChannelOverlapDiagram'

const topicId = 'wireless-lan'
const anchorConceptId = `${topicId}.wireless-channel`
const labels: Record<string, string> = {
  'ap01': 'AP01',
  'ap02': 'AP02',
  'ch3': '채널 3',
  'ch1': '채널 1',
  'ch6': '채널 6',
}
const noteLabels: Record<string, string> = {
  'overlap-note': '겹쳐서 간섭한다',
  'apart-note': '겹치지 않는다',
}
const nodeIds = Object.keys(labels)
const channelIds = ['ch3', 'ch1', 'ch6']
const pathEnds: Record<string, [string, string]> = {
  'ap01-ch1': ['ap01', 'ch1'],
  'ap02-ch3': ['ap02', 'ch3'],
  'ap02-ch6': ['ap02', 'ch6'],
}
const tallPaths: Record<string, string> = {
  'ap01-ch1': 'M44 40 V128',
  'ap02-ch3': 'M168 40 V72',
  'ap02-ch6': 'M216 40 V128',
}
const widePaths: Record<string, string> = {
  'ap01-ch1': 'M68 40 V120',
  'ap02-ch3': 'M272 40 V64',
  'ap02-ch6': 'M320 40 V120',
}

const question = '이웃한 두 AP는 왜 채널을 떨어뜨려 고를까?'
const figureName = 'AP01과 옆 사무실 AP02가 쓰는 채널을 주파수 순서로 놓고, AP02가 채널 3을 쓸 때와 채널 6을 쓸 때 AP01의 채널 1과 겹치는지 보이는 도식'
const svgName = '맨 위에 AP01과 AP02를 두고, 그 아래 줄에 채널 3을, 맨 아래 줄에 채널 1과 채널 6을 주파수 순서대로 둔 그림'
const idleCaption = 'AP01은 채널 1을 쓰고, 옆 사무실의 AP02는 채널 3이나 채널 6을 쓴다. AP01·AP02와 이 채널 번호들은 예로 고른 것이다. 버튼으로 AP02의 채널을 고르면 AP01의 채널 1과 겹치는지 볼 수 있다.'
const legend = '채널 상자의 가로 길이는 802.11b의 고속 DSSS 신호가 채널 하나에서 차지하는 폭 22MHz이고, 오른쪽으로 갈수록 주파수가 높다. 화살표는 AP가 쓰는 채널을 가리킨다.'
const expectedScenarios = [
  {
    id: 'overlap', label: '겹치는 채널',
    nodes: ['ap01', 'ap02', 'ch3', 'ch1'],
    paths: ['ap01-ch1', 'ap02-ch3'],
    notes: ['overlap-note'],
    caption: 'AP02가 채널 3을 쓰면 두 채널의 중심 주파수가 10MHz만 떨어져, 신호의 폭 22MHz보다 가깝다. 두 신호가 12MHz를 함께 써서, 한쪽 AP가 보낸 전파가 다른 쪽이 받는 신호에 섞이는 간섭이 생긴다.',
  },
  {
    id: 'apart', label: '겹치지 않는 채널',
    nodes: ['ap01', 'ap02', 'ch1', 'ch6'],
    paths: ['ap01-ch1', 'ap02-ch6'],
    notes: ['apart-note'],
    caption: 'AP02가 채널 6을 쓰면 두 채널의 중심 주파수가 25MHz 떨어져, 신호의 폭 22MHz보다 멀다. 채널 1의 위쪽 끝과 채널 6의 아래쪽 끝 사이가 3MHz 비어, 두 AP의 신호가 서로의 채널에 섞이지 않는다.',
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
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note')!)
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)!
const opacity = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

// 곁말(9)의 가로 범위. 반각 문자가 섞일 수 있으므로 어림값의 1.15배로 잡는다.
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 184] : [0, 0, 280, 192]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<ChannelOverlapDiagram />)
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
    const { container } = render(<ChannelOverlapDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(svg().querySelectorAll('[data-group]')).toHaveLength(0)
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<ChannelOverlapDiagram />)
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
    render(<ChannelOverlapDiagram />)
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
    expect(noteBoxes.map(({ id }) => id).sort()).toEqual(Object.keys(noteLabels).sort())
    expect(boxesOutsideViewBox(noteBoxes, viewBox)).toEqual([])
    for (const box of noteBoxes) {
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
      for (const other of noteBoxes.filter(({ id }) => id !== box.id)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
      for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 AP 노드의 변에서 시작해 채널 노드의 변에서 끝나고, 노드 안을 지나지 않는다', () => {
    render(<ChannelOverlapDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(pathEnds)))
    for (const [id, d] of Object.entries(paths)) {
      const [from, to] = pathEnds[id]
      const { start, end } = lineEnds(d)
      expect(onEdge(start, nodeBox(from)), `${id} 시작`).toBe(true)
      expect(onEdge(end, nodeBox(to)), `${id} 끝`).toBe(true)
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
      }
    }
  })

  // 채널 상자의 가로 위치와 길이가 주파수를 나타낸다 — 세 채널은 폭이 같고, 채널 3은 채널 1에서 10MHz, 채널 6은 25MHz 오른쪽이다.
  // 채널 1과 채널 3은 가로로 겹쳐 줄을 나눠 두고, 채널 1과 채널 6은 가로로도 떨어져 같은 줄에 선다.
  it('채널 상자는 폭 22MHz를 같은 길이로 그리고, 중심의 차이를 10MHz·25MHz 비율대로 둔다', () => {
    render(<ChannelOverlapDiagram />)
    const width = nodeBox('ch1').width
    for (const id of channelIds) expect(nodeBox(id).width, id).toBe(width)
    const perMHz = width / 22
    expect(nodeBox('ch3').x - nodeBox('ch1').x).toBeCloseTo(10 * perMHz)
    expect(nodeBox('ch6').x - nodeBox('ch1').x).toBeCloseTo(25 * perMHz)
    const horizontalOverlap = (a: SvgBox, b: SvgBox) => Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)
    expect(horizontalOverlap(nodeBox('ch1'), nodeBox('ch3'))).toBeCloseTo(12 * perMHz)
    expect(-horizontalOverlap(nodeBox('ch1'), nodeBox('ch6'))).toBeCloseTo(3 * perMHz)
    expect(nodeBox('ch3').y).not.toBe(nodeBox('ch1').y)
    expect(nodeBox('ch6').y).toBe(nodeBox('ch1').y)
  })

  // 요점: 두 시나리오에서 AP01이 가리키는 채널은 같고 AP02가 가리키는 채널만 다르다. 「간섭」을 말하는 곁말은 겹치는 채널에서만 보인다.
  it('AP02가 가리키는 채널만 시나리오마다 다르고, 간섭 곁말은 겹치는 채널에서만 보인다', async () => {
    render(<ChannelOverlapDiagram />)
    const targetOf = (from: string) => {
      const ids = shownPaths().filter((id) => onEdge(lineEnds(paths[id]).start, nodeBox(from)))
      expect(ids, from).toHaveLength(1)
      return channelIds.find((channel) => onEdge(lineEnds(paths[ids[0]]).end, nodeBox(channel)))
    }

    await select('겹치는 채널')
    expect(targetOf('ap01')).toBe('ch1')
    expect(targetOf('ap02')).toBe('ch3')
    expect(shownNotes().map((id) => note(id).textContent).join('')).toContain('간섭')
    expect(opacity('ch6')).toBe('0.25')

    await select('겹치지 않는 채널')
    expect(targetOf('ap01')).toBe('ch1')
    expect(targetOf('ap02')).toBe('ch6')
    expect(shownNotes().map((id) => note(id).textContent).join('')).not.toContain('간섭')
    expect(opacity('ch3')).toBe('0.25')

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const name of ['`AP01`', '`AP02`', '채널 1', '채널 3', '채널 6', '22MHz', '5MHz', '10MHz', '25MHz', '12MHz', '3MHz', '겹친다', '겹치지 않는다', '간섭']) {
      expect(body, name).toContain(name)
    }
  })
}

describe('ChannelOverlapDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<ChannelOverlapDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 192')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      await select('겹치는 채널')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 184')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(screen.getByRole('button', { name: '겹치는 채널' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><ChannelOverlapDiagram /><ChannelOverlapDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '겹치는 채널' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<ChannelOverlapDiagram />)
    const text = visualsByTopicId[topicId].diagrams['channel-overlap']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(channelOverlapScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = channelOverlapScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 무선 채널 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
