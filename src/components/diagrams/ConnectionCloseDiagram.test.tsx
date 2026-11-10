import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ConnectionCloseDiagram, connectionCloseScenarios } from './ConnectionCloseDiagram'

const topicId = 'tcp-connection'
const anchorConceptId = `${topicId}.connection-termination`
const labels: Record<string, string> = {
  'fin-1': 'FIN',
  'ack-1': 'ACK',
  data: '남은 데이터',
  'fin-2': 'FIN',
  'ack-2': 'ACK',
}
const groupLabels: Record<string, string> = { 'client-side': '클라이언트', 'server-side': '서버' }
const noteLabels: Record<string, string> = { active: '액티브 클로즈', passive: '패시브 클로즈' }
// 역할 곁말은 늘 보이고, 자기 기둥 바로 위에 놓인다.
const noteColumn: Record<string, string> = { active: 'client-side', passive: 'server-side' }
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)

const tallPaths: Record<string, string> = {
  'fin1-out': 'M68 64 H88',
  'fin1-in': 'M192 64 H212',
  'ack1-out': 'M212 104 H192',
  'ack1-in': 'M88 104 H68',
  'data-out': 'M212 144 H192',
  'data-in': 'M88 144 H68',
  'fin2-out': 'M212 184 H192',
  'fin2-in': 'M88 184 H68',
  'ack2-out': 'M68 224 H88',
  'ack2-in': 'M192 224 H212',
}
const widePaths: Record<string, string> = {
  'fin1-out': 'M96 64 H152',
  'fin1-in': 'M288 64 H344',
  'ack1-out': 'M344 104 H288',
  'ack1-in': 'M152 104 H96',
  'data-out': 'M344 144 H288',
  'data-in': 'M152 144 H96',
  'fin2-out': 'M344 184 H288',
  'fin2-in': 'M152 184 H96',
  'ack2-out': 'M96 224 H152',
  'ack2-in': 'M288 224 H344',
}
// 경로마다 출발과 도착. 클라이언트·서버는 기둥(그룹 박스)의 변이고, 나머지는 노드의 변이다.
const ends: Record<string, [string, string]> = {
  'fin1-out': ['client-side', 'fin-1'],
  'fin1-in': ['fin-1', 'server-side'],
  'ack1-out': ['server-side', 'ack-1'],
  'ack1-in': ['ack-1', 'client-side'],
  'data-out': ['server-side', 'data'],
  'data-in': ['data', 'client-side'],
  'fin2-out': ['server-side', 'fin-2'],
  'fin2-in': ['fin-2', 'client-side'],
  'ack2-out': ['client-side', 'ack-2'],
  'ack2-in': ['ack-2', 'server-side'],
}

const question = '연결은 왜 네 번에 걸쳐 끊을까?'
const figureName = '연결을 끊을 때 클라이언트와 서버가 FIN과 ACK를 주고받아 두 방향을 하나씩 닫는 차례를 보이는 도식'
const svgName = '먼저 끊는 클라이언트와 나중에 끊는 서버 두 기둥 사이에 FIN, ACK, 남은 데이터, FIN, ACK를 위에서 아래로 놓은 그림'
const idleCaption = '클라이언트가 먼저 연결을 끊을 때 오가는 세그먼트를 차례대로 위에서 아래로 놓았다. 버튼을 고르면 한 방향이 닫힌 뒤에도 반대 방향으로 데이터가 오가고, 그다음에 그 방향도 닫히는 차례를 볼 수 있다.'
const legend = '왼쪽 박스가 먼저 끊는 클라이언트, 오른쪽 박스가 나중에 끊는 서버이고, 그 사이 노드가 오가는 세그먼트다. 화살표는 세그먼트가 가는 방향이다.'
const expectedScenarios = [
  {
    id: 'first-fin', label: '한쪽 닫기',
    nodes: ['fin-1', 'ack-1'], paths: ['fin1-out', 'fin1-in', 'ack1-out', 'ack1-in'],
    caption: '보낼 데이터를 다 보낸 클라이언트가 FIN을 보내고, 서버가 ACK로 그 FIN을 받았다고 확인한다. 이로써 클라이언트에서 서버로 가는 방향 하나가 닫힌다.',
  },
  {
    id: 'half-close', label: '남은 데이터',
    nodes: ['data'], paths: ['data-out', 'data-in'],
    caption: '서버에서 클라이언트로 가는 방향은 아직 열려 있다. 서버는 보낼 데이터가 남아 있으면 마저 보내고, 먼저 FIN을 보낸 클라이언트도 그것을 받는다.',
  },
  {
    id: 'second-fin', label: '다른 쪽 닫기',
    nodes: ['fin-2', 'ack-2'], paths: ['fin2-out', 'fin2-in', 'ack2-out', 'ack2-in'],
    caption: '서버 프로그램이 연결을 닫으면 서버가 FIN을 보내고, 클라이언트가 ACK로 그 FIN을 받았다고 확인한다. 이로써 서버에서 클라이언트로 가는 방향도 닫혀 연결이 끝난다.',
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
// 노드에 닿는 화살표가 어느 기둥에서 출발했는지 — 그 세그먼트를 보낸 쪽이다.
const senderOf = (id: string) => ends[Object.keys(ends).find((path) => ends[path][1] === id)!][0]

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 256] : [0, 0, 280, 256]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<ConnectionCloseDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표 없이 역할 곁말과 선택 안내가 나온다', () => {
    const { container } = render(<ConnectionCloseDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(svg().querySelector(`[data-group-label="${id}"]`)!.textContent).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual(noteIds)
    for (const id of noteIds) expect(note(id)!.textContent).toBe(noteLabels[id])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표만 보이고 역할 곁말과 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<ConnectionCloseDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownNotes()).toEqual(noteIds)
    for (const id of noteIds) expect(note(id)!.closest('[opacity]'), id).toBeNull()
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

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말·그룹 라벨이 자리에 들어간다`, () => {
    render(<ConnectionCloseDiagram />)
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
      for (const group of groupIds) expect(overlaps(nodeBox(id), groupBox(group)), `${id} ↔ ${group}`).toBe(false)
    }
    // 오가는 노드는 두 기둥 사이, 기둥의 위아래 범위 안에 오가는 차례대로 위에서 아래로 놓인다.
    nodeIds.forEach((id, index) => {
      const box = nodeBox(id)
      expect(box.x, id).toBeGreaterThan(client.x + client.width)
      expect(box.x + box.width, id).toBeLessThan(server.x)
      expect(box.y, id).toBeGreaterThan(client.y)
      expect(box.y + box.height, id).toBeLessThan(client.y + client.height)
      if (index > 0) expect(box.y, id).toBeGreaterThan(nodeBox(nodeIds[index - 1]).y + 32)
    })
    const groupTexts = groupIds.map((id) => {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      return box
    })
    const noteTexts = noteIds.map((id) => {
      const element = note(id)!
      expect(element).toHaveAttribute('font-size', '9')
      expect(element).toHaveClass('fill-muted')
      const box = textBox(element, id)
      // 역할 곁말은 자기 기둥 바로 위에 서고, 기둥과 가로 범위가 겹친다.
      const column = groupBox(noteColumn[id])
      expect(box.y + box.height, id).toBeLessThanOrEqual(column.y)
      expect(overlaps({ ...box, y: column.y, height: 1 }, { ...column, height: 1 }), id).toBe(true)
      return box
    })
    // 왼쪽 곁말은 왼쪽 기둥의 왼쪽 변에서 시작하고, 오른쪽 곁말은 오른쪽 기둥의 오른쪽 변에서 끝난다.
    expect(note('active')).toHaveAttribute('text-anchor', 'start')
    expect(Number(note('active')!.getAttribute('x'))).toBe(client.x)
    expect(note('passive')).toHaveAttribute('text-anchor', 'end')
    expect(Number(note('passive')!.getAttribute('x'))).toBe(server.x + server.width)
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
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표 양 끝은 노드나 기둥의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나거나 다른 화살표와 만나지 않는다', async () => {
    render(<ConnectionCloseDiagram />)
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

  // 요점: 두 방향을 따로 닫는다. 첫 FIN은 클라이언트가, 둘째 FIN은 서버가 보내고, ACK는 FIN을 받은 쪽이 보낸다.
  // 한 방향이 닫힌 뒤에도 남은 데이터는 서버에서 클라이언트로만 간다. FIN·ACK 세그먼트는 넷이다.
  it('두 방향을 따로 닫고, 그 사이 남은 데이터는 서버에서 클라이언트로만 간다', async () => {
    render(<ConnectionCloseDiagram />)
    const finAck = nodeIds.filter((id) => ['FIN', 'ACK'].includes(label(id)))
    expect(finAck).toHaveLength(4)
    const fins = nodeIds.filter((id) => label(id) === 'FIN')
    expect(fins).toHaveLength(2)
    expect(senderOf(fins[0])).toBe('client-side')
    expect(senderOf(fins[1])).toBe('server-side')
    // FIN마다 바로 뒤의 ACK는 그 FIN을 받은 쪽이 보낸다.
    for (const fin of fins) {
      const ack = nodeIds.slice(nodeIds.indexOf(fin) + 1).find((id) => label(id) === 'ACK')!
      expect(senderOf(ack), fin).not.toBe(senderOf(fin))
    }

    const hops = () => shownPaths().map((id) => [endAt(lineEnds(paths[id]).start), endAt(lineEnds(paths[id]).end)])
    await select('남은 데이터')
    expect(brightNodes()).toEqual(['data'])
    expect(label('data')).toBe('남은 데이터')
    expect(hops()).toEqual([['server-side', 'data'], ['data', 'client-side']])
    // 남은 데이터는 첫 FIN·ACK와 둘째 FIN 사이에 오간다.
    expect(nodeBox('data').y).toBeGreaterThan(nodeBox('ack-1').y)
    expect(nodeBox('data').y).toBeLessThan(nodeBox('fin-2').y)

    await select('한쪽 닫기')
    expect(hops()[0]).toEqual(['client-side', 'fin-1'])
    await select('다른 쪽 닫기')
    expect(hops()[0]).toEqual(['server-side', 'fin-2'])

    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join('\n')
    expect(body).toContain('첫째, 보낼 데이터를 다 보낸 클라이언트가 FIN을 켠 세그먼트를 서버에 보낸다.')
    expect(body).toContain('둘째, 서버가 ACK를 켠 세그먼트로 그 FIN을 받았다고 확인한다.')
    expect(body).toContain('서버는 보낼 데이터가 남아 있으면 마저 보내고 클라이언트는 그것을 받는다')
    expect(body).toContain('셋째, 서버 프로그램이 보낼 것을 다 보내고 연결을 닫으면, 서버도 FIN을 켠 세그먼트를 클라이언트에 보낸다.')
    expect(body).toContain('넷째, 클라이언트가 ACK를 켠 세그먼트로 서버의 FIN을 받았다고 확인한다.')
    expect(body).toContain('이 예에서는 클라이언트가 액티브 클로즈, 서버가 패시브 클로즈다.')
  })
}

describe('ConnectionCloseDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<ConnectionCloseDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 256')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('남은 데이터')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 256')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '남은 데이터' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><ConnectionCloseDiagram /><ConnectionCloseDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '한쪽 닫기' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<ConnectionCloseDiagram />)
    const text = visualsByTopicId[topicId].diagrams['connection-close']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(connectionCloseScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = connectionCloseScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 TCP 연결 종료 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
