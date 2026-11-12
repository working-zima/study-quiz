import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { PingOptionsDiagram, pingOptionsScenarios } from './PingOptionsDiagram'

const topicId = 'diagnostic-commands'
const anchorConceptId = `${topicId}.ping-options`
const labels: Record<string, string> = {
  'cmd-default': 'ping 198.51.100.10',
  'default-1': '요청 1',
  'default-2': '요청 2',
  'default-3': '요청 3',
  'default-4': '요청 4',
  'cmd-count': 'ping /n 2 198.51.100.10',
  'count-1': '요청 1',
  'count-2': '요청 2',
  'cmd-continuous': 'ping /t 198.51.100.10',
  'continuous-1': '요청 1',
  'continuous-2': '요청 2',
  'continuous-3': '요청 3',
  'continuous-more': '계속 보냄',
}
const groupLabels: Record<string, string> = {
  'default': '옵션 없이',
  'count': '횟수 정하기',
  'continuous': '계속 보내기',
}
const noteLabels: Record<string, string> = {
  'default-stop': '4개를 보내고 멈춤',
  'count-stop': '2개를 보내고 멈춤',
  'continuous-stop': 'Ctrl+C로 멈춤',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
const groupOf = (id: string) => (id.includes('default') ? 'default' : id.includes('count') ? 'count' : 'continuous')
const commandNodes = ['cmd-default', 'cmd-count', 'cmd-continuous']
// 화살표는 앞 칸의 변에서 시작해 뒤 칸의 변에서 끝난다.
const pathEnds: Record<string, [string, string]> = {
  'default-send': ['cmd-default', 'default-1'],
  'default-next-2': ['default-1', 'default-2'],
  'default-next-3': ['default-2', 'default-3'],
  'default-next-4': ['default-3', 'default-4'],
  'count-send': ['cmd-count', 'count-1'],
  'count-next-2': ['count-1', 'count-2'],
  'continuous-send': ['cmd-continuous', 'continuous-1'],
  'continuous-next-2': ['continuous-1', 'continuous-2'],
  'continuous-next-3': ['continuous-2', 'continuous-3'],
  'continuous-next-more': ['continuous-3', 'continuous-more'],
}
const tallPaths: Record<string, string> = {
  'default-send': 'M176 44 H188',
  'default-next-2': 'M226 60 V72',
  'default-next-3': 'M226 104 V116',
  'default-next-4': 'M226 148 V160',
  'count-send': 'M176 248 H188',
  'count-next-2': 'M226 264 V276',
  'continuous-send': 'M176 364 H188',
  'continuous-next-2': 'M226 380 V392',
  'continuous-next-3': 'M226 424 V436',
  'continuous-next-more': 'M226 468 V480',
}
const widePaths: Record<string, string> = {
  'default-send': 'M46 60 V72',
  'default-next-2': 'M76 88 H96',
  'default-next-3': 'M156 88 H176',
  'default-next-4': 'M236 88 H256',
  'count-send': 'M46 176 V188',
  'count-next-2': 'M76 204 H96',
  'continuous-send': 'M46 292 V304',
  'continuous-next-2': 'M76 320 H96',
  'continuous-next-3': 'M156 320 H176',
  'continuous-next-more': 'M236 320 H256',
}

const question = '옵션에 따라 ping은 언제 멈출까?'
const figureName = 'Windows PC에서 ping을 옵션 없이 입력하면 에코 요청 4개를, /n 2를 붙이면 2개를 보내고 멈추고, /t를 붙이면 Ctrl+C를 누를 때까지 계속 보내는 것을 명령 줄과 보내는 요청의 차례로 보이는 도식'
const svgName = '세 박스에 명령 줄 하나씩과 그 명령이 보내는 에코 요청을 차례로 이어 그린 그림'
const idleCaption = 'Windows PC에서 ping을 세 가지로 입력했을 때 보내는 에코 요청을 명령 줄마다 차례로 이어 보였다. 버튼을 고르면 각 줄이 요청을 몇 개 보내고 언제 멈추는지 볼 수 있다.'
const legend = '명령 줄에서 나가는 화살표는 첫 에코 요청을 가리키고, 요청 사이의 화살표는 요청을 보내는 차례다.'
const expectedScenarios = [
  {
    id: 'default', label: '옵션 없이',
    nodes: ['cmd-default', 'default-1', 'default-2', 'default-3', 'default-4'],
    paths: ['default-send', 'default-next-2', 'default-next-3', 'default-next-4'], notes: ['default-stop'],
    caption: '옵션 없이 ping 198.51.100.10을 입력하면 Windows의 ping은 에코 요청 4개를 보내고 멈춘다. 결과에는 돌아온 응답마다 한 줄과, 보낸 수·받은 수·잃은 수와 왕복 시간을 모은 요약이 나온다.',
  },
  {
    id: 'count', label: '횟수 정하기',
    nodes: ['cmd-count', 'count-1', 'count-2'],
    paths: ['count-send', 'count-next-2'], notes: ['count-stop'],
    caption: 'ping /n 2 198.51.100.10을 입력하면 /n 뒤에 적은 수만큼, 곧 에코 요청 2개를 보내고 멈춘다. 두 응답이 모두 돌아오면 응답 줄 둘과 요약이 나오고, 요약의 보낸 수는 2다.',
  },
  {
    id: 'continuous', label: '계속 보내기',
    nodes: ['cmd-continuous', 'continuous-1', 'continuous-2', 'continuous-3', 'continuous-more'],
    paths: ['continuous-send', 'continuous-next-2', 'continuous-next-3', 'continuous-next-more'], notes: ['continuous-stop'],
    caption: 'ping /t 198.51.100.10을 입력하면 4개에서 멈추지 않고 사용자가 멈출 때까지 에코 요청을 계속 보낸다. Ctrl+C를 누르면 보내기를 멈추고 명령을 끝낸다. Linux의 ping은 아무것도 정하지 않아도 이렇게 끊을 때까지 보낸다.',
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
const groupBox = (id: string) => readBox(svg().querySelector(`[data-group="${id}"]`)!, id)
const label = (id: string) => svg().querySelector(`[data-node="${id}"] text`)!.textContent!
const groupLabel = (id: string) => svg().querySelector(`[data-group-label="${id}"]`)!.textContent!
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note')!)
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)!
const opacity = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function contains(outer: SvgBox, inner: SvgBox) {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height
}

// 곁말·그룹 라벨(9)의 가로 범위. 반각 문자가 섞이므로 어림값의 1.15배로 잡는다.
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

const groupLabelBox = (id: string) => textBox(svg().querySelector(`[data-group-label="${id}"]`)!, `${id}-label`)

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 352] : [0, 0, 280, 528]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<PingOptionsDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 칸이 모두 선명하고 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<PingOptionsDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 칸·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<PingOptionsDiagram />)
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
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·그룹 라벨·곁말이 자리에 들어간다`, async () => {
    render(<PingOptionsDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of groupIds) for (const other of groupIds.filter((otherId) => otherId !== id)) expect(overlaps(groupBox(id), groupBox(other)), `${id} ↔ ${other}`).toBe(false)
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      expect(contains(groupBox(groupOf(id)), nodeBox(id)), `${id} ⊂ ${groupOf(id)}`).toBe(true)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    for (const id of groupIds) {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
    }
    // 곁말은 자기 명령의 박스 안에 들어가고, 칸이나 그룹 라벨, 화살표와 겹치지 않는다.
    const noteBoxes: SvgBox[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of scenario.notes) noteBoxes.push(textBox(note(id), id))
    }
    expect(noteBoxes.map(({ id }) => id)).toEqual(noteIds)
    for (const box of noteBoxes) {
      expect(contains(groupBox(groupOf(box.id)), box), box.id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
      for (const group of groupIds) expect(overlaps(box, groupLabelBox(group)), `${box.id} ↔ ${group} 라벨`).toBe(false)
      for (const [pathId, d] of Object.entries(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ ${pathId}`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 앞 칸의 변에서 시작해 뒤 칸의 변에서 끝나고, 칸 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<PingOptionsDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(pathEnds)))
    for (const [id, d] of Object.entries(paths)) {
      const [from, to] = pathEnds[id]
      const { start, end } = lineEnds(d)
      expect(onEdge(start, nodeBox(from)), `${id} 시작`).toBe(true)
      expect(onEdge(end, nodeBox(to)), `${id} 끝`).toBe(true)
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
    }
  })

  // 요점: 「옵션 없이」에서 선명한 요청 칸은 4개, 「횟수 정하기」에서는 2개다. 「계속 보내기」의 곁말에 Ctrl+C가 있다.
  // 명령 줄 칸의 라벨은 본문에 적힌 명령 줄과 같다.
  it('옵션 없이는 요청 4개, /n 2는 2개를 보내고 멈추며, /t는 Ctrl+C로 멈출 때까지 보낸다', async () => {
    render(<PingOptionsDiagram />)
    const shownRequests = () => nodeIds.filter((id) => opacity(id) === '1' && label(id).startsWith('요청'))

    await select('옵션 없이')
    expect(shownRequests()).toHaveLength(4)
    expect(shownRequests().map(label)).toEqual(['요청 1', '요청 2', '요청 3', '요청 4'])

    await select('횟수 정하기')
    expect(shownRequests()).toHaveLength(2)
    expect(label(nodeIds.find((id) => commandNodes.includes(id) && opacity(id) === '1')!)).toContain('/n 2')

    await select('계속 보내기')
    expect(shownNotes().map((id) => note(id).textContent).join(' ')).toContain('Ctrl+C')
    // 계속 보내기의 마지막 칸은 정해진 수의 요청이 아니라 계속 이어진다는 칸이다.
    expect(opacity('continuous-more')).toBe('1')
    expect(label('continuous-more').startsWith('요청')).toBe(false)

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const id of commandNodes) expect(body, id).toContain(`\`${label(id)}\``)
    for (const phrase of ['에코 요청 4개를 보내고 멈춘다', '요청 2개를 보내고 멈춘다', 'Ctrl+C', '사용자가 멈출 때까지']) expect(body, phrase).toContain(phrase)
  })
}

describe('PingOptionsDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('칸·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<PingOptionsDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 528')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('횟수 정하기')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 352')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '횟수 정하기' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><PingOptionsDiagram /><PingOptionsDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '옵션 없이' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<PingOptionsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['ping-options']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(pingOptionsScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
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
      const scenario = pingOptionsScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 ping 명령의 옵션 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
