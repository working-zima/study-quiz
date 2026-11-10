import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { TimeWaitDiagram, timeWaitScenarios } from './TimeWaitDiagram'

const topicId = 'tcp-connection'
const anchorConceptId = `${topicId}.time-wait`
const labels: Record<string, string> = {
  'time-wait': 'TIME-WAIT',
  closed: 'CLOSED',
  'last-ack': '마지막 ACK',
  refin: '다시 온 FIN',
  reack: '다시 보낸 ACK',
  old: '옛 연결의 세그먼트',
}
const groupLabels: Record<string, string> = { 'client-side': '클라이언트', 'server-side': '서버' }
const noteLabels: Record<string, string> = {
  'role-active': '먼저 끊은 쪽',
  'role-passive': '나중에 끊은 쪽',
  msl: '2×MSL 동안',
  lost: '사라짐',
  vanish: '기다리는 동안 사라진다',
}
// 역할 곁말과 2×MSL 곁말은 늘 보이고, 나머지 곁말은 자기 시나리오에서만 보인다.
const alwaysNotes = ['role-active', 'role-passive', 'msl']
const noteScenario: Record<string, string> = { lost: 'lost-ack', vanish: 'old-segment' }
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const stateIds = ['time-wait', 'closed']
const segmentIds = ['last-ack', 'refin', 'reack', 'old']

const tallPaths: Record<string, string> = {
  'last-ack-out': 'M85 58 H101',
  'refin-out': 'M232 106 H221',
  'refin-in': 'M101 106 H90',
  'reack-out': 'M90 154 H101',
  'reack-in': 'M221 154 H232',
  'old-out': 'M232 202 H221',
}
const widePaths: Record<string, string> = {
  'last-ack-out': 'M96 58 H152',
  'refin-out': 'M336 106 H288',
  'refin-in': 'M152 106 H104',
  'reack-out': 'M104 154 H152',
  'reack-in': 'M288 154 H336',
  'old-out': 'M336 202 H288',
}
// 경로마다 출발과 도착. 노드가 아니면 그 끝이 닿는 기둥이다.
const ends: Record<string, [string, string]> = {
  'last-ack-out': ['time-wait', 'last-ack'],
  'refin-out': ['server-side', 'refin'],
  'refin-in': ['refin', 'client-side'],
  'reack-out': ['client-side', 'reack'],
  'reack-in': ['reack', 'server-side'],
  'old-out': ['server-side', 'old'],
}

const question = '먼저 끊은 쪽은 왜 바로 닫지 않고 기다릴까?'
const figureName = '연결을 먼저 끊은 쪽이 마지막 ACK를 보낸 뒤 TIME-WAIT 상태로 기다리는 까닭 둘을 보이는 도식'
const svgName = '왼쪽에 먼저 끊은 클라이언트, 오른쪽에 나중에 끊은 서버 기둥을 세우고, 클라이언트 기둥에 TIME-WAIT와 그 아래 CLOSED를 놓았다. 두 기둥 사이에는 마지막 ACK, 다시 온 FIN, 다시 보낸 ACK, 옛 연결의 세그먼트를 위에서 아래로 놓은 그림'
const idleCaption = '먼저 끊은 클라이언트는 마지막 ACK를 보낸 뒤 TIME-WAIT로 2×MSL 동안 머문 다음에 CLOSED가 된다. 버튼을 고르면 그동안 기다리는 까닭 둘을 볼 수 있다.'
const legend = '왼쪽 박스가 먼저 끊은 클라이언트, 오른쪽 박스가 나중에 끊은 서버이고, 그 사이 노드가 오가는 세그먼트다. 아래로 갈수록 나중이고, 화살표는 세그먼트가 가는 방향이다.'
const expectedScenarios = [
  {
    id: 'lost-ack', label: '마지막 ACK가 사라지면',
    nodes: ['time-wait', 'refin', 'reack'], paths: ['last-ack-out', 'refin-out', 'refin-in', 'reack-out', 'reack-in'],
    caption: '클라이언트가 보낸 마지막 ACK가 오는 길에 사라지면, 확인을 받지 못한 서버가 FIN을 다시 보낸다. 클라이언트는 아직 TIME-WAIT로 기다리고 있어서 ACK를 다시 보내 확인해 줄 수 있고, 2×MSL을 처음부터 다시 잰다.',
  },
  {
    id: 'old-segment', label: '늦게 온 옛 세그먼트',
    nodes: ['time-wait', 'old', 'closed'], paths: ['old-out'],
    caption: '양 끝의 IP 주소와 포트 번호가 모두 같은 새 연결을 곧바로 맺으면 옛 연결에서 늦게 온 세그먼트가 새 연결의 것으로 받아들여질 수 있다. 옛 세그먼트는 MSL보다 오래 남아 있지 않으므로 2×MSL을 기다리는 동안 사라지고, 그 뒤 클라이언트는 CLOSED가 된다.',
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
const isBright = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1'
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

const groupLabelBox = (id: string) => textBox(svg().querySelector(`[data-group-label="${id}"]`)!, `${id}-label`)

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

// 끝점이 노드의 변에 닿으면 그 노드, 아니면 기둥의 변에 닿는 기둥.
const endAt = (point: { x: number, y: number }) => nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))
  ?? groupIds.find((id) => onEdge(point.x, point.y, groupBox(id)))

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 290] : [0, 0, 280, 290]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<TimeWaitDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표 없이 늘 보이는 곁말과 선택 안내만 나온다', () => {
    const { container } = render(<TimeWaitDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual(alwaysNotes)
    for (const id of alwaysNotes) expect(note(id)!.textContent).toBe(noteLabels[id])
    for (const id of groupIds) expect(svg().querySelector(`[data-group-label="${id}"]`)!.textContent).toBe(groupLabels[id])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보이고 기둥은 흐려지지 않는다', async (scenario) => {
    const { container } = render(<TimeWaitDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(shownNotes()).toEqual([...alwaysNotes, ...Object.keys(noteScenario).filter((id) => noteScenario[id] === scenario.id)])
    for (const id of shownNotes()) {
      expect(note(id)!.textContent).toBe(noteLabels[id])
      expect(note(id)!.closest('[opacity]'), id).toBeNull()
    }
    expect(shownPaths()).toEqual(scenario.paths)
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
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말이 자리에 들어간다`, async () => {
    render(<TimeWaitDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
    }
    for (let i = 0; i < nodeIds.length; i += 1) {
      for (const other of nodeIds.slice(i + 1)) expect(overlaps(nodeBox(nodeIds[i]), nodeBox(other)), `${nodeIds[i]} ↔ ${other}`).toBe(false)
    }
    const client = groupBox('client-side')
    const server = groupBox('server-side')
    expect(overlaps(client, server)).toBe(false)
    expect(client.x + client.width).toBeLessThan(server.x)
    // 상태 노드는 클라이언트 기둥 안에, 세그먼트는 두 기둥 사이에 위에서 아래로 놓인다.
    for (const id of stateIds) expect(contains(client, nodeBox(id)), id).toBe(true)
    for (const id of segmentIds) {
      for (const group of groupIds) expect(overlaps(nodeBox(id), groupBox(group)), `${id} ↔ ${group}`).toBe(false)
      expect(nodeBox(id).x, id).toBe(nodeBox(segmentIds[0]).x)
    }
    for (let i = 1; i < segmentIds.length; i += 1) expect(nodeBox(segmentIds[i]).y, segmentIds[i]).toBeGreaterThan(nodeBox(segmentIds[i - 1]).y + 32)
    const groupTexts = groupIds.map((id) => {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      return box
    })
    // 역할 곁말은 자기 기둥 바로 위에서 기둥의 바깥 변에 맞춘다.
    expect(note('role-active')).toHaveAttribute('text-anchor', 'start')
    expect(Number(note('role-active')!.getAttribute('x'))).toBe(client.x)
    expect(note('role-passive')).toHaveAttribute('text-anchor', 'end')
    expect(Number(note('role-passive')!.getAttribute('x'))).toBe(server.x + server.width)
    // 2×MSL 곁말은 TIME-WAIT 노드 바로 아래, 클라이언트 기둥 안에 선다.
    const msl = textBox(note('msl')!, 'msl')
    expect(contains(client, msl)).toBe(true)
    expect(msl.y).toBeGreaterThanOrEqual(nodeBox('time-wait').y + 32)
    expect(msl.x + msl.width / 2).toBeCloseTo(nodeBox('time-wait').x + nodeBox('time-wait').width / 2)
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const texts = shownNotes().map((id) => {
        const element = note(id)!
        expect(element).toHaveAttribute('font-size', '9')
        expect(element).toHaveClass('fill-muted')
        return textBox(element, id)
      })
      for (const box of [...texts, ...groupTexts]) {
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
        for (const groupText of groupTexts) expect(overlaps(texts[i], groupText), `${texts[i].id} ↔ ${groupText.id}`).toBe(false)
      }
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표 양 끝은 노드나 기둥의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나거나 같은 시나리오의 다른 화살표와 만나지 않는다', async () => {
    render(<TimeWaitDiagram />)
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

  // 요점: 마지막 ACK가 사라지면 서버가 FIN을 다시 보내고, 아직 TIME-WAIT인 클라이언트가 ACK를 다시 보낸다.
  // 옛 연결의 세그먼트는 클라이언트에 닿지 않고 기다리는 동안 사라진다. TIME-WAIT는 먼저 끊은 쪽 기둥에 있고 두 시나리오에서 모두 선명하다.
  it('먼저 끊은 쪽이 TIME-WAIT로 기다려서 다시 온 FIN에 다시 답하고, 옛 세그먼트는 기다리는 동안 사라진다', async () => {
    render(<TimeWaitDiagram />)
    expect(contains(groupBox('client-side'), nodeBox('time-wait'))).toBe(true)
    expect(nodeBox('closed').y).toBeGreaterThan(nodeBox('time-wait').y + 32)
    expect(groupLabels['client-side']).toBe('클라이언트')
    const from = (id: string) => ends[Object.keys(ends).find((path) => ends[path][1] === id)!][0]
    const to = (id: string) => Object.keys(ends).filter((path) => ends[path][0] === id).map((path) => ends[path][1])

    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      expect(isBright('time-wait'), scenario.id).toBe(true)
    }

    await select('마지막 ACK가 사라지면')
    expect(isBright('last-ack')).toBe(false)
    expect(isBright('reack')).toBe(true)
    // 마지막 ACK는 클라이언트의 TIME-WAIT에서 나가지만 서버에 닿지 않는다.
    expect(from('last-ack')).toBe('time-wait')
    expect(to('last-ack')).toEqual([])
    expect(shownNotes()).toContain('lost')
    expect(contains(groupBox('server-side'), textBox(note('lost')!, 'lost'))).toBe(true)
    // 다시 온 FIN은 서버에서 클라이언트로, 다시 보낸 ACK는 클라이언트에서 서버로 간다. 다시 보낸 ACK가 다시 온 FIN보다 아래다.
    expect(from('refin')).toBe('server-side')
    expect(to('refin')).toEqual(['client-side'])
    expect(from('reack')).toBe('client-side')
    expect(to('reack')).toEqual(['server-side'])
    expect(nodeBox('reack').y).toBeGreaterThan(nodeBox('refin').y)
    expect(nodeBox('refin').y).toBeGreaterThan(nodeBox('last-ack').y)

    await select('늦게 온 옛 세그먼트')
    expect(isBright('old')).toBe(true)
    // 옛 연결의 세그먼트는 서버 쪽에서 오지만 클라이언트에 닿는 화살표가 없다.
    expect(from('old')).toBe('server-side')
    expect(to('old')).toEqual([])
    expect(shownNotes()).toContain('vanish')
    expect(textBox(note('vanish')!, 'vanish').y).toBeGreaterThanOrEqual(nodeBox('old').y + 32)

    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join('\n')
    expect(body).toContain('그 시간은 MSL의 두 배, 곧 2×MSL이고, 시간이 다 되면 기록을 지우고 `CLOSED`가 된다.')
    expect(body).toContain('`LAST-ACK`에 남은 채 FIN을 다시 보낸다.')
    expect(body).toContain('다시 온 FIN에 ACK를 다시 보내 확인해 줄 수 있다.')
    expect(body).toContain('이쪽은 2×MSL을 처음부터 다시 잰다.')
    expect(body).toContain('옛 연결의 세그먼트는 MSL보다 오래 네트워크에 남아 있지 않으므로, 2×MSL을 기다리는 동안 네트워크에서 사라진다.')
  })
}

describe('TimeWaitDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<TimeWaitDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 290')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('마지막 ACK가 사라지면')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 290')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '마지막 ACK가 사라지면' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><TimeWaitDiagram /><TimeWaitDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '마지막 ACK가 사라지면' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<TimeWaitDiagram />)
    const text = visualsByTopicId[topicId].diagrams['time-wait']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(timeWaitScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = timeWaitScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 TIME-WAIT 상태 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
