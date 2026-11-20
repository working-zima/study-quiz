import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { CsmaCaSequenceDiagram, csmaCaSequenceScenarios } from './CsmaCaSequenceDiagram'

const topicId = 'wireless-lan'
const anchorConceptId = `${topicId}.csma-ca`
const labels: Record<string, string> = {
  'listen': '채널 듣기',
  'fixed-wait': '정해 둔 시간',
  'backoff': '백오프',
  'laptop01-rts': 'LAPTOP01',
  'ap01-rts': 'AP01',
  'laptop02': 'LAPTOP02',
  'laptop01-data': 'LAPTOP01',
  'ap01-data': 'AP01',
}
const groupLabels: Record<string, string> = {
  'before-send': 'LAPTOP01이 보내기 전에',
}
const noteLabels: Record<string, string> = {
  'rts-note': 'RTS',
  'cts-note': 'CTS',
  'hold-note': 'CTS를 듣고 보내지 않는다',
  'data-note': '데이터 프레임',
  'ack-note': 'ACK',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const stepIds = ['listen', 'fixed-wait', 'backoff']
const pathEnds: Record<string, [string, string]> = {
  'listen-wait': ['listen', 'fixed-wait'],
  'wait-backoff': ['fixed-wait', 'backoff'],
  'rts': ['laptop01-rts', 'ap01-rts'],
  'cts': ['ap01-rts', 'laptop01-rts'],
  'cts-laptop02': ['ap01-rts', 'laptop02'],
  'data': ['laptop01-data', 'ap01-data'],
  'ack': ['ap01-data', 'laptop01-data'],
}
const tallPaths: Record<string, string> = {
  'listen-wait': 'M88 46 H104',
  'wait-backoff': 'M188 46 H204',
  'rts': 'M80 112 H116',
  'cts': 'M116 128 H80',
  'cts-laptop02': 'M164 128 H200',
  'data': 'M80 196 H116',
  'ack': 'M116 212 H80',
}
const widePaths: Record<string, string> = {
  'listen-wait': 'M128 46 H168',
  'wait-backoff': 'M272 46 H312',
  'rts': 'M128 104 H200',
  'cts': 'M200 120 H128',
  'cts-laptop02': 'M272 120 H336',
  'data': 'M128 176 H200',
  'ack': 'M200 192 H128',
}

const question = '무선 LAN의 스테이션은 보내기 전에 무엇을 기다릴까?'
const figureName = 'LAPTOP01이 AP01에 데이터 프레임 하나를 보내기 전에 거치는 차례와 오가는 프레임을, RTS/CTS를 쓰지 않을 때와 쓸 때로 나눠 보이는 도식'
const svgName = '맨 위 박스에 LAPTOP01이 보내기 전에 거치는 채널 듣기·정해 둔 시간·백오프를 차례로 두고, 그 아래 첫 줄에 LAPTOP01·AP01·LAPTOP02를, 둘째 줄에 LAPTOP01·AP01을 둔 그림'
const idleCaption = '노트북 LAPTOP01이 AP01에 데이터 프레임 하나를 보내려 한다. LAPTOP02는 AP01의 전파는 듣지만 LAPTOP01의 전파는 듣지 못하는 자리에 있다. 버튼으로 RTS/CTS를 쓰지 않을 때와 쓸 때를 고르면 어떤 차례로 무엇이 오가는지 볼 수 있다.'
const legend = '맨 위 박스 안의 화살표는 LAPTOP01이 보내기 전에 거치는 차례이고, 그 아래 화살표는 장치 사이를 오가는 프레임이다. 「정해 둔 시간」은 채널이 줄곧 비어 있어야 하는 시간이고, 「백오프」는 그 뒤 무작위로 고른 만큼 더 기다리는 시간이다.'
const expectedScenarios = [
  {
    id: 'basic', label: '기본 차례',
    nodes: ['listen', 'fixed-wait', 'backoff', 'laptop01-data', 'ap01-data'],
    paths: ['listen-wait', 'wait-backoff', 'data', 'ack'],
    notes: ['data-note', 'ack-note'],
    caption: 'LAPTOP01은 채널을 들어 보고, 정해 둔 시간 동안 채널이 줄곧 비어 있어도 무작위로 고른 시간만큼 더 기다린 뒤 데이터 프레임을 보낸다. 프레임을 오류 없이 받은 AP01은 곧바로 ACK를 보내고, LAPTOP01은 ACK를 보고 프레임이 전해졌음을 안다.',
  },
  {
    id: 'rtscts', label: 'RTS/CTS',
    nodes: ['listen', 'fixed-wait', 'backoff', 'laptop01-rts', 'ap01-rts', 'laptop02', 'laptop01-data', 'ap01-data'],
    paths: ['listen-wait', 'wait-backoff', 'rts', 'cts', 'cts-laptop02', 'data', 'ack'],
    notes: ['rts-note', 'cts-note', 'hold-note', 'data-note', 'ack-note'],
    caption: '백오프를 마친 LAPTOP01은 데이터 프레임 대신 RTS를 보내고, AP01이 CTS로 답한다. LAPTOP02는 LAPTOP01의 RTS는 듣지 못해도 AP01의 CTS는 들으므로 CTS에 적힌 시간 동안 보내지 않는다. 그동안 데이터 프레임과 ACK가 오간다.',
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

const groupLabelBox = (id: string) => textBox(svg().querySelector(`[data-group-label="${id}"]`)!, `${id}-label`)

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 224] : [0, 0, 280, 244]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<CsmaCaSequenceDiagram />)
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
    const { container } = render(<CsmaCaSequenceDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(groupIds)
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<CsmaCaSequenceDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
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
    render(<CsmaCaSequenceDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
      // 차례 노드 셋만 「LAPTOP01이 보내기 전에」 박스 안에 있다.
      if (stepIds.includes(id)) expect(contains(groupBox('before-send'), nodeBox(id)), `${id} ⊂ before-send`).toBe(true)
      else expect(overlaps(groupBox('before-send'), nodeBox(id)), `${id}는 박스 밖`).toBe(false)
    }
    for (const id of groupIds) {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
    }
    // 곁말은 viewBox 안에 들어가고, 노드·그룹 라벨·다른 곁말·선과 겹치지 않는다.
    const noteBoxes: SvgBox[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of scenario.notes) if (!noteBoxes.some((box) => box.id === id)) noteBoxes.push(textBox(note(id), id))
    }
    expect(noteBoxes.map(({ id }) => id).sort()).toEqual(Object.keys(noteLabels).sort())
    expect(boxesOutsideViewBox(noteBoxes, viewBox)).toEqual([])
    for (const box of noteBoxes) {
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
      for (const group of groupIds) {
        expect(overlaps(box, groupLabelBox(group)), `${box.id} ↔ ${group} 라벨`).toBe(false)
        expect(overlaps(box, groupBox(group)), `${box.id}는 ${group} 박스 밖`).toBe(false)
      }
      for (const other of noteBoxes.filter(({ id }) => id !== box.id)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
      for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 정한 노드 변에서 시작해 정한 노드 변에서 끝나고, 노드 안과 그룹 라벨을 지나지 않는다', () => {
    render(<CsmaCaSequenceDiagram />)
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

  // 요점: RTS·CTS 화살표는 RTS/CTS 시나리오에서만 보인다. 두 시나리오 모두 ACK는 AP01 쪽에서 시작해 LAPTOP01로 가고, 데이터 프레임과 방향이 반대다.
  // 기본 차례에서 LAPTOP02는 흐리고, RTS/CTS에서는 AP01의 CTS만 LAPTOP02에 닿고 LAPTOP01의 RTS는 닿지 않는다.
  it('RTS·CTS는 RTS/CTS에서만 보이고, ACK는 늘 AP01에서 LAPTOP01로 데이터 프레임과 반대로 간다', async () => {
    render(<CsmaCaSequenceDiagram />)
    const rtsCtsPaths = ['rts', 'cts', 'cts-laptop02']
    const checkDataAndAck = () => {
      expect(shownPaths()).toEqual(expect.arrayContaining(['data', 'ack']))
      expect(onEdge(lineEnds(paths.ack).start, nodeBox('ap01-data')), 'ACK는 AP01에서 시작').toBe(true)
      expect(onEdge(lineEnds(paths.ack).end, nodeBox('laptop01-data')), 'ACK는 LAPTOP01에서 끝').toBe(true)
      expect(onEdge(lineEnds(paths.data).start, nodeBox('laptop01-data')), '데이터는 LAPTOP01에서 시작').toBe(true)
      expect(onEdge(lineEnds(paths.data).end, nodeBox('ap01-data')), '데이터는 AP01에서 끝').toBe(true)
    }

    await select('기본 차례')
    for (const id of rtsCtsPaths) expect(shownPaths(), id).not.toContain(id)
    checkDataAndAck()
    expect(opacity('laptop02')).toBe('0.25')
    for (const id of stepIds) expect(opacity(id), id).toBe('1')

    await select('RTS/CTS')
    for (const id of rtsCtsPaths) expect(shownPaths(), id).toContain(id)
    checkDataAndAck()
    expect(opacity('laptop02')).toBe('1')
    const reaching = shownPaths().filter((id) => onEdge(lineEnds(paths[id]).end, nodeBox('laptop02')))
    expect(reaching).toEqual(['cts-laptop02'])
    expect(onEdge(lineEnds(paths['cts-laptop02']).start, nodeBox('ap01-rts'))).toBe(true)
    expect(onEdge(lineEnds(paths.rts).end, nodeBox('ap01-rts'))).toBe(true)
    // RTS 줄이 데이터 프레임 줄보다 먼저(위에) 온다.
    expect(nodeBox('laptop01-rts').y).toBeLessThan(nodeBox('laptop01-data').y)

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const name of ['`LAPTOP01`', '`LAPTOP02`', '`AP01`', '채널을 들어 본다', '정해 둔 짧은 시간', '무작위로 고른 시간', '백오프', 'ACK', 'RTS', 'CTS', '데이터 프레임', 'CTS에 적힌 시간 동안 보내지 않는다']) {
      expect(body, name).toContain(name)
    }
  })
}

describe('CsmaCaSequenceDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<CsmaCaSequenceDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 244')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('RTS/CTS')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 224')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: 'RTS/CTS' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><CsmaCaSequenceDiagram /><CsmaCaSequenceDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'RTS/CTS' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<CsmaCaSequenceDiagram />)
    const text = visualsByTopicId[topicId].diagrams['csma-ca-sequence']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(csmaCaSequenceScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = csmaCaSequenceScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 CSMA/CA 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
