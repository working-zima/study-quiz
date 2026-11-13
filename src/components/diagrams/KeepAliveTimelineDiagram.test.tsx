import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { KeepAliveTimelineDiagram, keepAliveTimelineScenarios } from './KeepAliveTimelineDiagram'

const topicId = 'linux-servers'
const anchorConceptId = `${topicId}.apache-keepalive`
const labels: Record<string, string> = {
  'on-connect': 'TCP 연결 맺기',
  'req-1': '요청 1',
  'res-1': '응답 1',
  'req-2': '요청 2',
  'res-2': '응답 2',
  close: '연결 닫기',
  'off-connect-1': 'TCP 연결 맺기',
  'off-req-1': '요청 1',
  'off-res-1': '응답 1',
  'off-close-1': '연결 닫기',
  'off-connect-2': 'TCP 연결 맺기',
  'off-req-2': '요청 2',
}
const groupLabels: Record<string, string> = {
  browser: '웹 브라우저',
  server: '웹 서버',
  on: 'KeepAliveTimeout 15',
  off: 'KeepAlive Off',
}
const noteLabels: Record<string, string> = {
  'reuse-wait': '15초 안에 요청 2',
  'timeout-wait': '15초 동안 요청 없음',
  'off-note': '응답마다 연결을 닫는다',
}
const noteScenario: Record<string, string> = { 'reuse-wait': 'reuse', 'timeout-wait': 'timeout', 'off-note': 'off' }
// 곁말마다 [바로 위 노드, 바로 아래 노드]. 곁말은 두 노드 사이 빈 줄에 놓인다.
const noteBetween: Record<string, [string, string]> = {
  'reuse-wait': ['res-1', 'req-2'],
  'timeout-wait': ['res-2', 'close'],
  'off-note': ['off-close-1', 'off-connect-2'],
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const onIds = ['on-connect', 'req-1', 'res-1', 'req-2', 'res-2', 'close']
const offIds = ['off-connect-1', 'off-req-1', 'off-res-1', 'off-close-1', 'off-connect-2', 'off-req-2']
// 웹 브라우저가 시작하는 것(연결 맺기와 요청)과 웹 서버가 시작하는 것(응답과 연결 닫기).
const fromBrowser = ['on-connect', 'req-1', 'req-2', 'off-connect-1', 'off-req-1', 'off-connect-2', 'off-req-2']
const fromServer = ['res-1', 'res-2', 'close', 'off-res-1', 'off-close-1']

const tallY: Record<string, number> = {
  'on-connect': 44, 'req-1': 84, 'res-1': 124, 'req-2': 180, 'res-2': 220, close: 276,
  'off-connect-1': 348, 'off-req-1': 388, 'off-res-1': 428, 'off-close-1': 468, 'off-connect-2': 524, 'off-req-2': 564,
}
function arrows(browserEdge: number, nodeLeft: number, nodeRight: number, serverEdge: number) {
  const result: Record<string, string> = {}
  for (const id of fromBrowser) {
    result[`${id}-out`] = `M${browserEdge} ${tallY[id]} H${nodeLeft}`
    result[`${id}-in`] = `M${nodeRight} ${tallY[id]} H${serverEdge}`
  }
  for (const id of fromServer) {
    result[`${id}-out`] = `M${serverEdge} ${tallY[id]} H${nodeRight}`
    result[`${id}-in`] = `M${nodeLeft} ${tallY[id]} H${browserEdge}`
  }
  return result
}
const tallPaths = arrows(72, 88, 192, 208)
const widePaths = arrows(96, 140, 300, 344)
// 화살표마다 시작과 끝이 닿는 상자. 기둥(그룹 박스)이나 메시지 노드다.
const ends: Record<string, [string, string]> = Object.fromEntries([
  ...fromBrowser.flatMap((id) => [[`${id}-out`, ['browser', id]], [`${id}-in`, [id, 'server']]]),
  ...fromServer.flatMap((id) => [[`${id}-out`, ['server', id]], [`${id}-in`, [id, 'browser']]]),
])
const pathsOf = (ids: string[]) => ids.flatMap((id) => [`${id}-out`, `${id}-in`])

const question = '응답을 보낸 뒤 서버는 연결을 언제 닫을까?'
const figureName = 'KeepAlive On과 KeepAliveTimeout 15일 때 웹 브라우저와 웹 서버가 한 연결로 요청과 응답을 주고받다가 연결이 닫히는 차례와, KeepAlive Off일 때 응답마다 연결을 닫는 차례를 보이는 도식'
const svgName = '왼쪽 웹 브라우저와 오른쪽 웹 서버 두 기둥 사이에, 위 박스 KeepAliveTimeout 15에는 TCP 연결 맺기, 요청 1, 응답 1, 요청 2, 응답 2, 연결 닫기를, 아래 박스 KeepAlive Off에는 TCP 연결 맺기, 요청 1, 응답 1, 연결 닫기, TCP 연결 맺기, 요청 2를 위에서 아래로 놓은 그림'
const idleCaption = '위 박스는 KeepAlive On과 KeepAliveTimeout 15를 적었을 때, 아래 박스는 KeepAlive Off를 적었을 때 웹 브라우저와 웹 서버 사이에 오가는 것을 차례대로 위에서 아래로 놓았다. 15는 예로 든 값이다. 버튼을 고르면 같은 연결을 다시 쓸 때, 기다리는 시간이 지났을 때, 지속 연결을 껐을 때를 볼 수 있다.'
const legend = '왼쪽 기둥은 웹 브라우저, 오른쪽 기둥은 웹 서버다. 가운데 노드 하나가 오가는 메시지나 일 하나이고, 화살표는 그것을 시작한 쪽에서 상대 쪽으로 간다.'
const expectedScenarios = [
  {
    id: 'reuse', label: '같은 연결',
    nodes: ['on-connect', 'req-1', 'res-1', 'req-2', 'res-2'], paths: pathsOf(['on-connect', 'req-1', 'res-1', 'req-2', 'res-2']),
    caption: '응답 1을 보낸 뒤 웹 서버는 연결을 닫지 않고 15초 동안 다음 요청을 기다린다. 그 안에 온 요청 2는 연결을 새로 맺지 않고 같은 연결로 받아 응답한다.',
  },
  {
    id: 'timeout', label: '시간 초과',
    nodes: ['res-2', 'close'], paths: pathsOf(['res-2', 'close']),
    caption: '응답 2를 보낸 뒤 15초 동안 요청이 오지 않으면 웹 서버가 연결을 닫는다. 그 뒤에 웹 브라우저가 다시 요청하려면 연결을 새로 맺어야 한다.',
  },
  {
    id: 'off', label: '끄기',
    nodes: offIds, paths: pathsOf(offIds),
    caption: 'KeepAlive Off이면 지속 연결을 쓰지 않으므로, 웹 서버는 응답을 보낼 때마다 연결을 닫는다. 웹 브라우저는 요청 2를 보내려고 연결을 새로 맺는다.',
  },
]

const svg = () => screen.getByRole('img', { name: svgName })
const select = async (name: string) => { await act(async () => { await userEvent.click(screen.getByRole('button', { name })) }) }

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
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (item) => item.getAttribute('data-note')!)
const opacityOf = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')

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

function lineEnds(d: string) {
  const list = segments(d)
  return { start: { x: list[0].x1, y: list[0].y1 }, end: { x: list[list.length - 1].x2, y: list[list.length - 1].y2 } }
}

// 끝점이 닿는 상자. 메시지 노드를 먼저 보고, 없으면 두 기둥을 본다(가운데 두 박스는 끝점이 아니다).
const endAt = (point: { x: number, y: number }) => nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))
  ?? ['browser', 'server'].find((id) => onEdge(point.x, point.y, groupBox(id)))
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

const anchorConcept = () => topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!

function layoutTests(wide: boolean) {
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 600] : [0, 0, 280, 600]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<KeepAliveTimelineDiagram />)
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
    const { container } = render(<KeepAliveTimelineDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<KeepAliveTimelineDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownNotes()).toEqual(Object.keys(noteScenario).filter((id) => noteScenario[id] === scenario.id))
    for (const id of shownNotes()) expect(note(id)!.textContent).toBe(noteLabels[id])
    expect(shownPaths()).toEqual(scenario.paths)
    for (const path of svg().querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('d', paths[path.getAttribute('data-path')!])
      expect(path).toHaveAttribute('stroke-width', '2')
      expect(path).toHaveClass('stroke-title')
      expect(path).toHaveAttribute('marker-end', `url(#${svg().querySelector('marker')!.id})`)
      expect(path.closest('[opacity]')).toBeNull()
    }
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말·그룹 라벨이 자리에 들어간다`, async () => {
    render(<KeepAliveTimelineDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    // 두 기둥과 가운데 두 박스는 서로 겹치지 않는다.
    for (let i = 0; i < groupIds.length; i += 1) {
      for (const other of groupIds.slice(i + 1)) expect(overlaps(groupBox(groupIds[i]), groupBox(other)), `${groupIds[i]} ↔ ${other}`).toBe(false)
    }
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
      // 메시지 노드는 자기 박스(KeepAliveTimeout 15나 KeepAlive Off) 안에만 있고 두 기둥에 들지 않는다.
      const own = onIds.includes(id) ? 'on' : 'off'
      expect(contains(groupBox(own), nodeBox(id)), `${id} ⊂ ${own}`).toBe(true)
      for (const group of groupIds.filter((groupId) => groupId !== own)) expect(overlaps(nodeBox(id), groupBox(group)), `${id} ↔ ${group}`).toBe(false)
    }
    const groupTexts = groupIds.map((id) => {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
      return box
    })
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const noteTexts = shownNotes().map((id) => {
        const element = note(id)!
        expect(element).toHaveAttribute('font-size', '9')
        expect(element).toHaveClass('fill-muted')
        const box = textBox(element, id)
        for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        // 곁말은 자기 박스 안, 두 노드 사이의 빈 줄에 놓인다.
        const [above, below] = noteBetween[id]
        expect(contains(groupBox(onIds.includes(above) ? 'on' : 'off'), box), id).toBe(true)
        expect(box.y, id).toBeGreaterThanOrEqual(nodeBox(above).y + nodeBox(above).height)
        expect(box.y + box.height, id).toBeLessThanOrEqual(nodeBox(below).y)
        return box
      })
      for (const box of [...noteTexts, ...groupTexts]) {
        expect(box.x, box.id).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width, box.id).toBeLessThanOrEqual(viewBox[2])
        expect(box.y, box.id).toBeGreaterThanOrEqual(0)
        expect(box.y + box.height, box.id).toBeLessThanOrEqual(viewBox[3])
        for (const d of Object.values(paths)) {
          for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
        }
      }
      for (const box of noteTexts) {
        for (const group of groupTexts) expect(overlaps(box, group), `${box.id} ↔ ${group.id}`).toBe(false)
      }
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표의 양 끝은 메시지 노드나 기둥의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<KeepAliveTimelineDiagram />)
    expect(Object.keys(paths).sort()).toEqual(Object.keys(ends).sort())
    for (const [id, d] of Object.entries(paths)) {
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
      const { start, end } = lineEnds(d)
      expect(endAt(start), `${id} 시작`).toBe(ends[id][0])
      expect(endAt(end), `${id} 끝`).toBe(ends[id][1])
    }
  })

  // 요점: 시간 초과에서 연결 닫기는 웹 서버 쪽에서 웹 브라우저 쪽으로 간다. 같은 연결에서 「TCP 연결 맺기」는 하나만 선명하다(두 요청이 한 연결을 쓴다).
  // 곁말의 초 수와 위 박스의 값이 본문의 KeepAliveTimeout 값과 같다. 끄기에서는 요청 2 앞에 연결을 다시 맺는다.
  it('연결 닫기는 서버 쪽에서 나오고, 같은 연결에서는 연결 맺기가 하나만 선명하며, 초 수가 본문의 값과 같다', async () => {
    render(<KeepAliveTimelineDiagram />)
    // 메시지는 박스마다 위에서 아래로 차례대로 놓이고, 위 박스가 아래 박스보다 위에 있다.
    for (const ids of [onIds, offIds]) {
      const ys = ids.map((id) => nodeBox(id).y)
      expect([...ys].sort((a, b) => a - b)).toEqual(ys)
      expect(new Set(ys).size).toBe(ids.length)
    }
    expect(groupBox('on').y + groupBox('on').height).toBeLessThan(groupBox('off').y)
    expect(groupBox('browser').x).toBeLessThan(groupBox('server').x)
    for (const id of fromBrowser) {
      expect(endAt(lineEnds(paths[`${id}-out`]).start), id).toBe('browser')
      expect(endAt(lineEnds(paths[`${id}-in`]).end), id).toBe('server')
    }
    for (const id of fromServer) {
      expect(endAt(lineEnds(paths[`${id}-out`]).start), id).toBe('server')
      expect(endAt(lineEnds(paths[`${id}-in`]).end), id).toBe('browser')
    }

    await select('시간 초과')
    expect(shownPaths()).toEqual(expect.arrayContaining(['close-out', 'close-in']))
    expect(endAt(lineEnds(paths['close-out']).start)).toBe('server')
    expect(endAt(lineEnds(paths['close-in']).end)).toBe('browser')
    expect(opacityOf('close')).toBe('1')

    await select('같은 연결')
    const connects = nodeIds.filter((id) => label(id) === 'TCP 연결 맺기')
    expect(connects).toHaveLength(3)
    expect(connects.filter((id) => opacityOf(id) === '1')).toEqual(['on-connect'])
    expect(opacityOf('close')).toBe('0.25')

    await select('끄기')
    expect(nodeBox('off-connect-2').y).toBeGreaterThan(nodeBox('off-close-1').y)
    expect(nodeBox('off-connect-2').y).toBeLessThan(nodeBox('off-req-2').y)
    for (const id of onIds) expect(opacityOf(id), id).toBe('0.25')

    const body = anchorConcept().paragraphs.join('\n')
    const seconds = body.match(/`KeepAliveTimeout (\d+)`/u)![1]
    expect(groupLabel('on')).toBe(`KeepAliveTimeout ${seconds}`)
    for (const id of Object.keys(noteLabels)) {
      for (const [, value] of noteLabels[id].matchAll(/(\d+)초/gu)) expect(value, id).toBe(seconds)
    }
    expect(body).toContain(`${seconds}초 동안 다음 요청을 기다린다`)
    expect(body).toContain('그동안 요청이 오지 않으면 웹 서버가 연결을 닫는다')
    expect(body).toContain('웹 서버는 응답을 하나 보낼 때마다 그 연결을 닫는다')
    expect(body).toContain(`\`${groupLabel('off')}\``)
  })
}

describe('KeepAliveTimelineDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<KeepAliveTimelineDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 600')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('시간 초과')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 600')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '시간 초과' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><KeepAliveTimelineDiagram /><KeepAliveTimelineDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '같은 연결' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<KeepAliveTimelineDiagram />)
    const text = visualsByTopicId[topicId].diagrams['keepalive-timeline']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(keepAliveTimelineScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = keepAliveTimelineScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 KeepAlive와 KeepAliveTimeout 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = anchorConcept()
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(within(figure).queryByRole('heading')).toBeNull()
  })
})
