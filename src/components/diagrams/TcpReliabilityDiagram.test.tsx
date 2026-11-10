import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { TcpReliabilityDiagram, tcpReliabilityScenarios } from './TcpReliabilityDiagram'

const topicId = 'tcp-udp'
const anchorConceptId = `${topicId}.tcp`
const labels: Record<string, string> = {
  connect: '연결 맺기',
  'seg-1': '세그먼트 1',
  'seg-2': '세그먼트 2',
  'seg-3': '세그먼트 3',
  ack: '확인 응답',
  resend: '다시 보낸 세그먼트 2',
  deliver: '1 · 2 · 3 차례로 넘김',
}
const groupLabels: Record<string, string> = { sender: '보내는 쪽', receiver: '받는 쪽' }
const noteLabels: Record<string, string> = { late: '늦게 닿음', early: '먼저 닿음', lost: '사라짐' }
// 곁말은 자기 시나리오에서만 보이고, 받는 쪽 박스 안에서 자기 세그먼트와 같은 줄에 놓인다.
const noteScenario: Record<string, string> = { late: 'order', early: 'order', lost: 'resend' }
const noteRow: Record<string, string> = { late: 'seg-2', early: 'seg-3', lost: 'seg-2' }
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const segmentIds = ['seg-1', 'seg-2', 'seg-3']
// 두 기둥 사이에 놓이는 노드. 받은 차례 노드는 받는 쪽 기둥 아래에 있다.
const middleIds = ['connect', 'seg-1', 'seg-2', 'seg-3', 'ack', 'resend']

const tallPaths: Record<string, string> = {
  'connect-1': 'M60 42 H74',
  'connect-2': 'M206 42 H220',
  'connect-3': 'M220 54 H206',
  'connect-4': 'M74 54 H60',
  's1-out': 'M60 88 H74',
  's1-in': 'M206 88 H220',
  's2-out': 'M60 128 H74',
  's2-in': 'M206 128 H220',
  's3-out': 'M60 168 H74',
  's3-in': 'M206 168 H220',
  'ack-out': 'M220 208 H206',
  'ack-in': 'M74 208 H60',
  'resend-out': 'M60 248 H74',
  'resend-in': 'M206 248 H220',
  'deliver': 'M246 272 V288',
}
const widePaths: Record<string, string> = {
  'connect-1': 'M96 42 H152',
  'connect-2': 'M288 42 H344',
  'connect-3': 'M344 54 H288',
  'connect-4': 'M152 54 H96',
  's1-out': 'M96 88 H152',
  's1-in': 'M288 88 H344',
  's2-out': 'M96 128 H152',
  's2-in': 'M288 128 H344',
  's3-out': 'M96 168 H152',
  's3-in': 'M288 168 H344',
  'ack-out': 'M344 208 H288',
  'ack-in': 'M152 208 H96',
  'resend-out': 'M96 248 H152',
  'resend-in': 'M288 248 H344',
  'deliver': 'M388 272 V288',
}
// 경로마다 출발과 도착. 보내는 쪽·받는 쪽은 기둥(그룹 박스)의 변이고, 나머지는 노드의 변이다.
const ends: Record<string, [string, string]> = {
  'connect-1': ['sender', 'connect'],
  'connect-2': ['connect', 'receiver'],
  'connect-3': ['receiver', 'connect'],
  'connect-4': ['connect', 'sender'],
  's1-out': ['sender', 'seg-1'],
  's1-in': ['seg-1', 'receiver'],
  's2-out': ['sender', 'seg-2'],
  's2-in': ['seg-2', 'receiver'],
  's3-out': ['sender', 'seg-3'],
  's3-in': ['seg-3', 'receiver'],
  'ack-out': ['receiver', 'ack'],
  'ack-in': ['ack', 'sender'],
  'resend-out': ['sender', 'resend'],
  'resend-in': ['resend', 'receiver'],
  'deliver': ['receiver', 'deliver'],
}

const question = 'TCP는 데이터가 빠짐없이 가도록 무엇을 할까?'
const figureName = '보내는 쪽과 받는 쪽 사이를 오가는 세그먼트로, TCP가 연결을 먼저 맺고 차례를 맞추고 잃은 세그먼트를 다시 보내는 것을 보이는 도식'
const svgName = '보내는 쪽과 받는 쪽 두 기둥 사이에 연결 맺기, 세그먼트 1, 세그먼트 2, 세그먼트 3, 확인 응답, 다시 보낸 세그먼트 2를 위에서 아래로 놓고, 받는 쪽 아래에 1 · 2 · 3 차례로 넘김을 둔 그림'
const idleCaption = '보내는 쪽과 받는 쪽 사이를 오가는 것을 위에서 아래로 놓았다. 버튼을 고르면 연결을 먼저 맺는 것, 차례를 맞추는 것, 잃은 세그먼트를 다시 보내는 것을 하나씩 볼 수 있다.'
const legend = '왼쪽 박스가 보내는 쪽, 오른쪽 박스가 받는 쪽이고, 그 사이 노드 하나가 오가는 것 하나다. 화살표는 가는 방향이고, 받는 쪽 박스 안의 곁말은 그 세그먼트가 어떻게 닿았는지다.'
const expectedScenarios = [
  {
    id: 'connect', label: '연결 먼저',
    nodes: ['connect'], paths: ['connect-1', 'connect-2', 'connect-3', 'connect-4'],
    caption: '데이터를 보내기 전에 두 쪽이 세그먼트 셋을 주고받아 연결을 먼저 맺는다. 이 과정을 3-way handshake라 하고, 연결을 맺은 뒤에야 데이터를 담은 세그먼트가 오간다.',
  },
  {
    id: 'order', label: '차례 맞추기',
    nodes: ['seg-1', 'seg-2', 'seg-3', 'deliver'], paths: ['s1-out', 's1-in', 's2-out', 's2-in', 's3-out', 's3-in', 'deliver'],
    caption: '세그먼트 1·2·3을 차례로 보냈지만 세그먼트 3이 2보다 먼저 닿았다. 받는 쪽은 먼저 온 세그먼트 3을 버리지 않고 가지고 있다가, 순서 번호대로 놓아 1·2·3 차례로 응용 프로그램에 넘긴다.',
  },
  {
    id: 'resend', label: '다시 보내기',
    nodes: ['seg-1', 'seg-3', 'ack', 'resend', 'deliver'],
    paths: ['s1-out', 's1-in', 's2-out', 's3-out', 's3-in', 'ack-out', 'ack-in', 'resend-out', 'resend-in', 'deliver'],
    caption: '세그먼트 2가 오는 길에 사라졌다. 받는 쪽은 세그먼트 3을 받았어도 확인 응답으로 세그먼트 1까지 받았다고 알리고, 세그먼트 2를 받았다는 확인이 오지 않으므로 보내는 쪽이 세그먼트 2를 다시 보낸다. 받는 쪽이 고쳐 만드는 것이 아니다.',
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 328] : [0, 0, 280, 328]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<TcpReliabilityDiagram />)
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
    const { container } = render(<TcpReliabilityDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(svg().querySelector(`[data-group-label="${id}"]`)!.textContent).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<TcpReliabilityDiagram />)
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
    render(<TcpReliabilityDiagram />)
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
    // 오가는 노드는 두 기둥 사이, 기둥의 위아래 범위 안에 위에서 아래로 놓인다.
    middleIds.forEach((id, index) => {
      const box = nodeBox(id)
      expect(box.x, id).toBeGreaterThan(sender.x + sender.width)
      expect(box.x + box.width, id).toBeLessThan(receiver.x)
      expect(box.y, id).toBeGreaterThan(sender.y)
      expect(box.y + box.height, id).toBeLessThan(sender.y + sender.height)
      if (index > 0) expect(box.y, id).toBeGreaterThan(nodeBox(middleIds[index - 1]).y + 32)
    })
    // 받은 차례 노드는 받는 쪽 기둥 아래에 있고 기둥의 가운데를 품는다.
    const deliver = nodeBox('deliver')
    expect(deliver.y).toBeGreaterThan(receiver.y + receiver.height)
    expect(deliver.x).toBeLessThanOrEqual(receiver.x + receiver.width / 2)
    expect(deliver.x + deliver.width).toBeGreaterThanOrEqual(receiver.x + receiver.width / 2)
    for (let i = 0; i < nodeIds.length; i += 1) {
      for (const other of nodeIds.slice(i + 1)) expect(overlaps(nodeBox(nodeIds[i]), nodeBox(other)), `${nodeIds[i]} ↔ ${other}`).toBe(false)
    }
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
        expect(contains(receiver, box), id).toBe(true)
        // 곁말은 자기 세그먼트와 같은 줄에 놓인다.
        const row = nodeBox(noteRow[id])
        expect(box.y, id).toBeGreaterThanOrEqual(row.y)
        expect(box.y + box.height, id).toBeLessThanOrEqual(row.y + row.height)
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
    render(<TcpReliabilityDiagram />)
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

  // 요점: 연결 먼저에는 데이터 세그먼트가 하나도 없고 두 방향으로 주고받는다.
  // 다시 보내기에서는 세그먼트 2가 흐리고 받는 쪽에 닿는 화살표가 없으며, 다시 보낸 세그먼트 2가 보내는 쪽에서 받는 쪽으로 간다 — 받는 쪽이 고치지 않는다.
  it('연결을 먼저 맺고, 늦게 온 세그먼트는 번호대로 놓고, 잃은 세그먼트는 보내는 쪽이 다시 보낸다', async () => {
    render(<TcpReliabilityDiagram />)
    const hops = () => shownPaths().map((id) => [endAt(lineEnds(paths[id]).start), endAt(lineEnds(paths[id]).end)])

    await select('연결 먼저')
    expect(brightNodes().filter((id) => segmentIds.includes(id))).toEqual([])
    expect(hops()).toContainEqual(['connect', 'receiver'])
    expect(hops()).toContainEqual(['connect', 'sender'])

    await select('차례 맞추기')
    expect(brightNodes()).toContain('deliver')
    expect(noteRow.early).toBe('seg-3')
    expect(noteRow.late).toBe('seg-2')
    for (const id of segmentIds) expect(hops(), id).toContainEqual([id, 'receiver'])
    const delivered = label('deliver').match(/\d/gu)!.map(Number)
    expect(delivered).toEqual(segmentIds.map((id) => Number(label(id).match(/\d/u)![0])))

    await select('다시 보내기')
    expect(svg().querySelector('[data-node="seg-2"]')).toHaveAttribute('opacity', '0.25')
    expect(svg().querySelector('[data-node="resend"]')).toHaveAttribute('opacity', '1')
    expect(label('resend')).toContain(label('seg-2'))
    expect(hops()).toContainEqual(['sender', 'seg-2'])
    expect(hops()).not.toContainEqual(['seg-2', 'receiver'])
    expect(hops()).toContainEqual(['sender', 'resend'])
    expect(hops()).toContainEqual(['resend', 'receiver'])
    expect(hops()).toContainEqual(['receiver', 'ack'])
    expect(hops()).toContainEqual(['ack', 'sender'])
    expect(nodeBox('ack').y).toBeLessThan(nodeBox('resend').y)
    expect(shownNotes()).toEqual(['lost'])

    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join('\n')
    expect(body).toContain('세그먼트 셋을 주고받는데, 이 과정을 3-way handshake라 한다')
    expect(body).toContain('세그먼트 3이 세그먼트 2보다 먼저 닿았다')
    expect(body).toContain('확인 응답으로 세그먼트 1까지 받았다고 알린다')
    expect(body).toContain('보내는 쪽은 세그먼트 2를 다시 보내고')
    expect(body).toContain('받는 쪽이 망가진 데이터를 그 자리에서 고쳐 쓰는 것도')
  })
}

describe('TcpReliabilityDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<TcpReliabilityDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 328')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('다시 보내기')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 328')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '다시 보내기' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><TcpReliabilityDiagram /><TcpReliabilityDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '다시 보내기' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<TcpReliabilityDiagram />)
    const text = visualsByTopicId[topicId].diagrams['tcp-reliability']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(tcpReliabilityScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = tcpReliabilityScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 TCP 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
