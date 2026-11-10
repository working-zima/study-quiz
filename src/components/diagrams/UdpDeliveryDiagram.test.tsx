import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { UdpDeliveryDiagram, udpDeliveryScenarios } from './UdpDeliveryDiagram'

const topicId = 'tcp-udp'
const anchorConceptId = `${topicId}.udp`
const labels: Record<string, string> = {
  'dg-1': '데이터그램 1',
  'dg-2': '데이터그램 2',
  'dg-3': '데이터그램 3',
}
const groupLabels: Record<string, string> = { sender: '보내는 쪽', receiver: '받는 쪽' }
const noteLabels: Record<string, string> = {
  direct: '연결 없이 곧바로 보냄',
  lost: '사라짐',
  'no-resend': '다시 보내지 않음',
  damaged: '체크섬이 맞지 않아 버림',
}
// 곁말은 자기 시나리오에서만 보인다. 사라짐은 받는 쪽 기둥 안 그 데이터그램의 줄에, 나머지는 두 기둥 사이에 놓인다.
const noteScenario: Record<string, string> = { direct: 'no-connection', lost: 'lost', 'no-resend': 'lost', damaged: 'damaged' }
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)

const tallPaths: Record<string, string> = {
  'd1-out': 'M60 56 H74',
  'd1-in': 'M206 56 H220',
  'd2-out': 'M60 112 H74',
  'd2-in': 'M206 112 H220',
  'd3-out': 'M60 168 H74',
  'd3-in': 'M206 168 H220',
}
const widePaths: Record<string, string> = {
  'd1-out': 'M96 56 H152',
  'd1-in': 'M288 56 H344',
  'd2-out': 'M96 112 H152',
  'd2-in': 'M288 112 H344',
  'd3-out': 'M96 168 H152',
  'd3-in': 'M288 168 H344',
}
// 경로마다 출발과 도착. 보내는 쪽·받는 쪽은 기둥(그룹 박스)의 변이고, 나머지는 노드의 변이다.
const ends: Record<string, [string, string]> = {
  'd1-out': ['sender', 'dg-1'],
  'd1-in': ['dg-1', 'receiver'],
  'd2-out': ['sender', 'dg-2'],
  'd2-in': ['dg-2', 'receiver'],
  'd3-out': ['sender', 'dg-3'],
  'd3-in': ['dg-3', 'receiver'],
}

const question = 'UDP는 잃거나 망가진 데이터그램을 어떻게 할까?'
const figureName = '보내는 쪽과 받는 쪽 사이를 오가는 데이터그램으로, UDP가 연결 없이 곧바로 보내고 잃거나 망가진 데이터그램을 되찾지 않는 것을 보이는 도식'
const svgName = '보내는 쪽과 받는 쪽 두 기둥 사이에 데이터그램 1, 데이터그램 2, 데이터그램 3을 위에서 아래로 놓은 그림'
const idleCaption = '보내는 쪽과 받는 쪽 사이를 오가는 데이터그램을 보낸 차례대로 위에서 아래로 놓았다. 버튼을 고르면 연결 없이 곧바로 보내는 것과, 데이터그램을 잃었을 때와 망가졌을 때 UDP가 어떻게 하는지를 하나씩 볼 수 있다.'
const legend = '왼쪽 박스가 보내는 쪽, 오른쪽 박스가 받는 쪽이고, 그 사이 노드 하나가 데이터그램 하나다. 화살표는 가는 방향이고, 곁말은 그 데이터그램에 일어난 일이다.'
const expectedScenarios = [
  {
    id: 'no-connection', label: '바로 보내기',
    nodes: ['dg-1', 'dg-2', 'dg-3'], paths: ['d1-out', 'd1-in', 'd2-out', 'd2-in', 'd3-out', 'd3-in'],
    caption: 'UDP는 데이터를 보내기 전에 연결을 맺지 않는다. 받는 쪽과 미리 주고받는 것 없이 첫 데이터그램부터 곧바로 보내고, 받는 쪽은 받았다는 확인 응답을 보내지 않는다.',
  },
  {
    id: 'lost', label: '잃었을 때',
    nodes: ['dg-1', 'dg-3'], paths: ['d1-out', 'd1-in', 'd2-out', 'd3-out', 'd3-in'],
    caption: '데이터그램 2가 오는 길에 사라졌다. 확인 응답이 없으니 보내는 쪽 UDP는 사라진 것을 알지 못하고, 데이터그램 2를 다시 보내지 않는다. 받는 쪽은 데이터그램 1과 3만 받는다.',
  },
  {
    id: 'damaged', label: '망가졌을 때',
    nodes: ['dg-3'], paths: ['d3-out', 'd3-in'],
    caption: '데이터그램 3이 닿았지만 오는 길에 내용이 망가졌다. 받는 쪽은 체크섬 값이 맞지 않는 것으로 손상을 알아채 그 데이터그램을 버리고, 보내는 쪽에 알리지 않는다. 고치지도, 다시 받지도 않는다.',
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
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)
const brightNodes = () => nodeIds.filter((id) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (item) => item.getAttribute('data-note')!)

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

// 경로 끝이 닿은 곳 — 노드의 변이 먼저고, 아니면 두 기둥의 변이다.
const endAt = (point: { x: number, y: number }) => nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))
  ?? groupIds.find((id) => onEdge(point.x, point.y, groupBox(id)))
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 216] : [0, 0, 280, 216]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<UdpDeliveryDiagram />)
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
    const { container } = render(<UdpDeliveryDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(svg().querySelector(`[data-group-label="${id}"]`)!.textContent).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<UdpDeliveryDiagram />)
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
    render(<UdpDeliveryDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    const sender = groupBox('sender')
    const receiver = groupBox('receiver')
    expect(overlaps(sender, receiver)).toBe(false)
    expect(sender.y).toBe(receiver.y)
    expect(sender.height).toBe(receiver.height)
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const group of groupIds) expect(overlaps(nodeBox(id), groupBox(group)), `${id} ↔ ${group}`).toBe(false)
    }
    // 데이터그램은 두 기둥 사이, 기둥의 위아래 범위 안에 보낸 차례대로 위에서 아래로 놓인다.
    nodeIds.forEach((id, index) => {
      const box = nodeBox(id)
      expect(box.x, id).toBeGreaterThan(sender.x + sender.width)
      expect(box.x + box.width, id).toBeLessThan(receiver.x)
      expect(box.y, id).toBeGreaterThan(sender.y)
      expect(box.y + box.height, id).toBeLessThan(sender.y + sender.height)
      if (index > 0) expect(box.y, id).toBeGreaterThan(nodeBox(nodeIds[index - 1]).y + 32)
    })
    const groupTexts = groupIds.map((id) => {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      return box
    })
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const noteTexts = shownNotes().map((id) => {
        const element = note(id)!
        expect(element).toHaveAttribute('font-size', '9')
        expect(element).toHaveClass('fill-muted')
        const box = textBox(element, id)
        if (id === 'lost') {
          // 사라짐은 받는 쪽 기둥 안, 사라진 데이터그램과 같은 줄에 놓인다.
          expect(contains(receiver, box), id).toBe(true)
          const row = nodeBox('dg-2')
          expect(box.y, id).toBeGreaterThanOrEqual(row.y)
          expect(box.y + box.height, id).toBeLessThanOrEqual(row.y + row.height)
        } else {
          // 나머지 곁말은 두 기둥 사이에 놓인다.
          expect(box.x, id).toBeGreaterThanOrEqual(sender.x + sender.width)
          expect(box.x + box.width, id).toBeLessThanOrEqual(receiver.x)
        }
        return box
      })
      const texts = [...noteTexts, ...groupTexts]
      for (const box of texts) {
        expect(box.x, box.id).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width, box.id).toBeLessThanOrEqual(viewBox[2])
        expect(box.y, box.id).toBeGreaterThanOrEqual(0)
        expect(box.y + box.height, box.id).toBeLessThanOrEqual(viewBox[3])
        for (const id of nodeIds) expect(overlaps(box, nodeBox(id)), `${box.id} ↔ ${id}`).toBe(false)
        for (const d of Object.values(paths)) {
          for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
        }
      }
      for (let i = 0; i < texts.length; i += 1) {
        for (const other of texts.slice(i + 1)) expect(overlaps(texts[i], other), `${texts[i].id} ↔ ${other.id}`).toBe(false)
      }
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표 양 끝은 노드나 기둥의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나거나 다른 화살표와 만나지 않는다', async () => {
    render(<UdpDeliveryDiagram />)
    for (const [id, d] of Object.entries(paths)) {
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
      const { start, end } = lineEnds(d)
      expect(endAt(start), `${id} 시작`).toBe(ends[id][0])
      expect(endAt(end), `${id} 끝`).toBe(ends[id][1])
    }
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const lines = shownPaths()
      for (let i = 0; i < lines.length; i += 1) {
        for (const other of lines.slice(i + 1)) {
          for (const a of segments(paths[lines[i]])) {
            for (const b of segments(paths[other])) {
              const box = { id: '', x: Math.min(b.x1, b.x2), y: Math.min(b.y1, b.y2), width: Math.abs(b.x2 - b.x1), height: Math.abs(b.y2 - b.y1) }
              expect(touches(a, box), `${lines[i]} ↔ ${other}`).toBe(false)
            }
          }
        }
      }
    }
  })

  // 요점: 어느 시나리오에도 연결 맺기·확인 응답·다시 보낸 데이터그램이 없다 — 노드는 데이터그램 셋뿐이고, 모든 화살표가 보내는 쪽에서 받는 쪽으로만 간다.
  // 잃었을 때는 데이터그램 2가 흐리고 받는 쪽에 닿는 화살표가 없다. 망가졌을 때는 닿았지만 체크섬으로 알아채 버린다.
  it('연결 없이 곧바로 보내고, 잃거나 망가진 데이터그램을 다시 보내지도 받는 쪽에서 확인하지도 않는다', async () => {
    render(<UdpDeliveryDiagram />)
    const hops = () => shownPaths().map((id) => [endAt(lineEnds(paths[id]).start), endAt(lineEnds(paths[id]).end)])

    // 노드는 데이터그램 셋뿐이다 — 연결 맺기·확인 응답·다시 보낸 노드가 없다.
    expect(nodeIds).toEqual(['dg-1', 'dg-2', 'dg-3'])
    for (const id of nodeIds) expect(label(id)).toMatch(/^데이터그램 \d$/u)
    for (const [id, [from, to]] of Object.entries(ends)) {
      expect(from === 'sender' || to === 'receiver', id).toBe(true)
      expect(from === 'receiver' || to === 'sender', id).toBe(false)
    }

    await select('바로 보내기')
    expect(brightNodes()).toEqual(nodeIds)
    // 첫 데이터그램부터 받는 쪽에 닿는다. 그 앞에 주고받는 것이 없다.
    expect(hops()[0]).toEqual(['sender', 'dg-1'])
    expect(hops()[1]).toEqual(['dg-1', 'receiver'])
    // 곧바로 보낸다는 곁말은 첫 데이터그램보다 위에 놓인다.
    expect(Number(note('direct')!.getAttribute('y'))).toBeLessThan(nodeBox('dg-1').y)

    await select('잃었을 때')
    expect(svg().querySelector('[data-node="dg-2"]')).toHaveAttribute('opacity', '0.25')
    expect(hops()).toContainEqual(['sender', 'dg-2'])
    expect(hops()).not.toContainEqual(['dg-2', 'receiver'])
    expect(hops()).toContainEqual(['dg-3', 'receiver'])
    expect(hops().every(([from]) => from !== 'receiver')).toBe(true)

    await select('망가졌을 때')
    expect(brightNodes()).toEqual(['dg-3'])
    expect(hops()).toContainEqual(['dg-3', 'receiver'])
    expect(note('damaged')!.textContent).toContain('체크섬')
    expect(hops().every(([from]) => from !== 'receiver')).toBe(true)

    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join('\n')
    expect(body).toContain('첫 데이터그램부터 곧바로 보낸다')
    expect(body).toContain('보내는 쪽 UDP는 그것을 알지 못하고 다시 보내지도 않는다')
    expect(body).toContain('값이 맞지 않으면 그 데이터그램을 버린다')
    expect(body).toContain('망가진 곳을 고치지도 않고 다시 보내 달라고 하지도 않으므로')
  })
}

describe('UdpDeliveryDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<UdpDeliveryDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 216')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('잃었을 때')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 216')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '잃었을 때' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><UdpDeliveryDiagram /><UdpDeliveryDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '잃었을 때' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<UdpDeliveryDiagram />)
    const text = visualsByTopicId[topicId].diagrams['udp-delivery']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(udpDeliveryScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = udpDeliveryScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 UDP 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
