import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ThreeWayHandshakeDiagram, threeWayHandshakeScenarios } from './ThreeWayHandshakeDiagram'

const topicId = 'tcp-connection'
const anchorConceptId = `${topicId}.three-way-handshake`
const labels: Record<string, string> = {
  client: '192.0.2.10:50001',
  server: '198.51.100.10:80',
  'syn-seq': '순서 번호 1000',
  'synack-seq': '순서 번호 7000',
  'synack-ack': '확인 응답 1001',
  'ack-ack': '확인 응답 7001',
}
const groupLabels: Record<string, string> = {
  'client-side': '클라이언트',
  'server-side': '서버',
  syn: 'SYN',
  'syn-ack': 'SYN+ACK',
  ack: 'ACK',
}
const noteLabels: Record<string, string> = { 'plus-client': '1000 + 1 = 1001', 'plus-server': '7000 + 1 = 7001' }
// 계산 곁말은 자기 시나리오에서만 보이고, 자기 세그먼트 박스 바로 아래에 놓인다.
const noteScenario: Record<string, string> = { 'plus-client': 'syn-ack', 'plus-server': 'ack' }
const noteUnder: Record<string, string> = { 'plus-client': 'syn-ack', 'plus-server': 'ack' }
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const columnIds = ['client-side', 'server-side']
const segmentGroupIds = ['syn', 'syn-ack', 'ack']
const headIds = ['client', 'server']
// 머리 노드가 서는 기둥, 세그먼트 노드가 들어가는 세그먼트 박스.
const headColumn: Record<string, string> = { client: 'client-side', server: 'server-side' }
const nodeSegment: Record<string, string> = { 'syn-seq': 'syn', 'synack-seq': 'syn-ack', 'synack-ack': 'syn-ack', 'ack-ack': 'ack' }
const segmentNodeIds = Object.keys(nodeSegment)

const tallPaths: Record<string, string> = {
  'syn-out': 'M68 92 H80',
  'syn-in': 'M200 92 H212',
  'synack-out': 'M212 178 H200',
  'synack-in': 'M80 178 H68',
  'ack-out': 'M68 288 H80',
  'ack-in': 'M200 288 H212',
}
const widePaths: Record<string, string> = {
  'syn-out': 'M96 92 H108',
  'syn-in': 'M332 92 H344',
  'synack-out': 'M344 164 H332',
  'synack-in': 'M108 164 H96',
  'ack-out': 'M96 248 H108',
  'ack-in': 'M332 248 H344',
}
// 경로마다 출발과 도착. 모두 기둥이나 세그먼트 박스(그룹 박스)의 변이다.
const ends: Record<string, [string, string]> = {
  'syn-out': ['client-side', 'syn'],
  'syn-in': ['syn', 'server-side'],
  'synack-out': ['server-side', 'syn-ack'],
  'synack-in': ['syn-ack', 'client-side'],
  'ack-out': ['client-side', 'ack'],
  'ack-in': ['ack', 'server-side'],
}

const question = '연결을 맺을 때 무엇을 주고받을까?'
const figureName = '클라이언트와 서버가 연결을 맺으며 주고받는 세그먼트 셋과, 세그먼트마다 켠 제어 비트와 적는 번호를 보이는 도식'
const svgName = '클라이언트 192.0.2.10:50001과 서버 198.51.100.10:80 두 기둥 사이에 SYN 세그먼트의 순서 번호 1000, SYN+ACK 세그먼트의 순서 번호 7000과 확인 응답 1001, ACK 세그먼트의 확인 응답 7001을 위에서 아래로 놓은 그림'
const idleCaption = '클라이언트와 서버가 연결을 맺으며 주고받는 세그먼트 셋을 오가는 차례대로 위에서 아래로 놓았다. ISN 1000과 7000은 설명을 위해 정한 값이다. 버튼을 고르면 세그먼트마다 누가 누구에게 보내고 어떤 번호를 적는지 볼 수 있다.'
const legend = '위의 두 노드는 클라이언트와 서버의 IP 주소와 포트 번호이고, 그 아래 왼쪽 박스가 클라이언트, 오른쪽 박스가 서버다. 가운데 박스 하나가 세그먼트 하나이고, 박스 이름은 그 세그먼트에 켠 제어 비트다. 화살표는 세그먼트가 가는 방향이다.'
const expectedScenarios = [
  {
    id: 'syn', label: '① SYN',
    nodes: ['client', 'server', 'syn-seq'], paths: ['syn-out', 'syn-in'],
    caption: '클라이언트가 SYN을 켠 세그먼트를 서버에 보내 연결을 청한다. 순서 번호 칸에는 자기 ISN 1000을 적어, 클라이언트가 보낼 데이터의 번호가 1000에서 시작한다고 알린다.',
  },
  {
    id: 'syn-ack', label: '② SYN+ACK',
    nodes: ['client', 'server', 'synack-seq', 'synack-ack'], paths: ['synack-out', 'synack-in'],
    caption: '서버가 SYN과 ACK를 함께 켠 세그먼트로 답한다. SYN으로 자기 ISN 7000을 알리고, ACK로 클라이언트의 SYN을 받았다고 확인한다. SYN이 번호 하나를 차지하므로 확인 응답 번호는 1000 + 1 = 1001이다.',
  },
  {
    id: 'ack', label: '③ ACK',
    nodes: ['client', 'server', 'ack-ack'], paths: ['ack-out', 'ack-in'],
    caption: '클라이언트가 ACK를 켠 세그먼트로 서버의 SYN을 받았다고 확인한다. 확인 응답 번호는 7000 + 1 = 7001이다. 서버가 이 세그먼트를 받으면 연결이 맺어지고, 두 쪽은 이 연결로 데이터를 주고받는다.',
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
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)
const brightNodes = () => nodeIds.filter((id) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (item) => item.getAttribute('data-note')!)
// 「순서 번호 1000」·「확인 응답 1001」 같은 라벨에서 번호를 꺼낸다.
const numberOf = (id: string) => Number(label(id).match(/(\d+)$/u)![1])

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

// 경로 끝이 닿은 곳 — 노드의 변이 먼저고, 아니면 기둥이나 세그먼트 박스의 변이다.
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 304] : [0, 0, 280, 344]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<ThreeWayHandshakeDiagram />)
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
    const { container } = render(<ThreeWayHandshakeDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<ThreeWayHandshakeDiagram />)
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
    render(<ThreeWayHandshakeDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    const client = groupBox('client-side')
    const server = groupBox('server-side')
    expect(overlaps(client, server)).toBe(false)
    expect(client.y).toBe(server.y)
    expect(client.height).toBe(server.height)
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const column of columnIds) expect(overlaps(nodeBox(id), groupBox(column)), `${id} ↔ ${column}`).toBe(false)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    // 머리 노드는 자기 기둥 위에 서고, 바깥 변을 기둥과 맞춘다.
    for (const id of headIds) {
      const column = groupBox(headColumn[id])
      expect(nodeBox(id).y + 32, id).toBeLessThan(column.y)
    }
    expect(nodeBox('client').x).toBe(client.x)
    expect(nodeBox('server').x + nodeBox('server').width).toBe(server.x + server.width)
    // 세그먼트 박스는 두 기둥 사이, 기둥의 위아래 범위 안에 오가는 차례대로 위에서 아래로 놓이고, 세그먼트 노드는 자기 박스 안에 든다.
    segmentGroupIds.forEach((id, index) => {
      const box = groupBox(id)
      expect(box.x, id).toBeGreaterThan(client.x + client.width)
      expect(box.x + box.width, id).toBeLessThan(server.x)
      expect(box.y, id).toBeGreaterThan(client.y)
      expect(box.y + box.height, id).toBeLessThan(client.y + client.height)
      if (index > 0) {
        const previous = groupBox(segmentGroupIds[index - 1])
        expect(box.y, id).toBeGreaterThan(previous.y + previous.height)
      }
    })
    for (const id of segmentNodeIds) expect(contains(groupBox(nodeSegment[id]), nodeBox(id)), id).toBe(true)
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
        for (const group of groupIds) expect(overlaps(box, groupBox(group)), `${id} ↔ ${group}`).toBe(false)
        // 곁말은 자기 세그먼트 박스 바로 아래, 두 기둥 사이에 놓인다.
        const under = groupBox(noteUnder[id])
        expect(box.y, id).toBeGreaterThanOrEqual(under.y + under.height)
        expect(box.y + box.height, id).toBeLessThanOrEqual(client.y + client.height)
        expect(box.x, id).toBeGreaterThan(client.x + client.width)
        expect(box.x + box.width, id).toBeLessThan(server.x)
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
        for (const id of nodeIds) expect(overlaps(box, nodeBox(id)), `${box.id} ↔ ${id}`).toBe(false)
      }
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표 양 끝은 기둥이나 세그먼트 박스의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나거나 다른 화살표와 만나지 않는다', async () => {
    render(<ThreeWayHandshakeDiagram />)
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

  // 요점: 세그먼트는 클라이언트 → 서버 → 클라이언트 차례로 오간다. 첫째에는 SYN만, 둘째에는 SYN과 ACK가 함께, 셋째에는 ACK만 켠다.
  // 확인 응답 번호는 상대의 ISN에 1을 더한 값이다 — SYN이 번호 하나를 차지하기 때문이다.
  it('세그먼트 셋이 차례대로 오가고, 확인 응답 번호는 상대가 SYN에 적은 번호 + 1이다', async () => {
    render(<ThreeWayHandshakeDiagram />)
    expect(numberOf('synack-ack')).toBe(numberOf('syn-seq') + 1)
    expect(numberOf('ack-ack')).toBe(numberOf('synack-seq') + 1)
    expect(groupLabel('syn')).toContain('SYN')
    expect(groupLabel('syn')).not.toContain('ACK')
    expect(groupLabel('syn-ack')).toContain('SYN')
    expect(groupLabel('syn-ack')).toContain('ACK')
    expect(groupLabel('ack')).toContain('ACK')
    expect(groupLabel('ack')).not.toContain('SYN')
    // 머리 노드의 주소와 포트는 기둥 이름의 쪽과 맞는다.
    expect(label('client')).toBe('192.0.2.10:50001')
    expect(label('server')).toBe('198.51.100.10:80')

    const senders: string[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      // 선명한 세그먼트 노드는 모두 한 세그먼트 박스에 들고, 그 박스의 노드는 모두 선명하다.
      const bright = brightNodes().filter((id) => segmentNodeIds.includes(id))
      const segment = nodeSegment[bright[0]]
      expect(bright.every((id) => nodeSegment[id] === segment), scenario.id).toBe(true)
      expect(bright).toEqual(segmentNodeIds.filter((id) => nodeSegment[id] === segment))
      expect(segment).toBe(scenario.id)
      for (const id of headIds) expect(brightNodes(), scenario.id).toContain(id)
      // 보이는 화살표는 한쪽 기둥 → 세그먼트 박스 → 다른 쪽 기둥이다.
      const hops = shownPaths().map((id) => [endAt(lineEnds(paths[id]).start), endAt(lineEnds(paths[id]).end)])
      expect(hops).toHaveLength(2)
      expect(hops[0][1]).toBe(segment)
      expect(hops[1][0]).toBe(segment)
      expect(hops[0][0]).not.toBe(hops[1][1])
      senders.push(hops[0][0]!)
    }
    expect(senders).toEqual(['client-side', 'server-side', 'client-side'])

    // 계산 곁말은 SYN에 적은 번호 + 1 = 확인 응답 번호다.
    await select('② SYN+ACK')
    const [a, b, c] = note('plus-client')!.textContent!.match(/\d+/gu)!.map(Number)
    expect([a, b, a + b]).toEqual([numberOf('syn-seq'), 1, c])
    expect(c).toBe(numberOf('synack-ack'))
    await select('③ ACK')
    const [d, e, f] = note('plus-server')!.textContent!.match(/\d+/gu)!.map(Number)
    expect([d, e, d + e]).toEqual([numberOf('synack-seq'), 1, f])
    expect(f).toBe(numberOf('ack-ack'))

    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join('\n')
    expect(body).toContain('`192.0.2.10:50001`')
    expect(body).toContain('`198.51.100.10:80`')
    expect(body).toContain('첫째, 클라이언트가 SYN을 켠 세그먼트를 서버에 보낸다. 순서 번호 칸에는 자기 ISN `1000`을 적는다.')
    expect(body).toContain('둘째, 서버가 SYN과 ACK를 함께 켠 세그먼트, 곧 SYN+ACK 세그먼트로 답한다.')
    expect(body).toContain('1000 + 1 = 1001')
    expect(body).toContain('셋째, 클라이언트가 ACK를 켠 세그먼트를 서버에 보낸다.')
    expect(body).toContain('7000 + 1 = 7001')
  })
}

describe('ThreeWayHandshakeDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<ThreeWayHandshakeDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 344')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('② SYN+ACK')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 304')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '② SYN+ACK' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><ThreeWayHandshakeDiagram /><ThreeWayHandshakeDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '② SYN+ACK' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<ThreeWayHandshakeDiagram />)
    const text = visualsByTopicId[topicId].diagrams['three-way-handshake']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(threeWayHandshakeScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = threeWayHandshakeScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 3-way handshake 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
