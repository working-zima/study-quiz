import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { TftpBlocksDiagram, tftpBlocksScenarios } from './TftpBlocksDiagram'

const topicId = 'app-protocols-mail-file'
const anchorConceptId = `${topicId}.tftp`
const labels: Record<string, string> = {
  client: '192.0.2.10',
  server: '198.51.100.10',
  req: '읽기 요청 · 69번',
  b1: '블록 1 · 512바이트',
  a1: '확인 응답 1',
  b2: '블록 2 · 512바이트',
  a2: '확인 응답 2',
  b3: '블록 3 · 276바이트',
  a3: '확인 응답 3',
  lost2: '블록 2 · 512바이트',
  're-a1': '확인 응답 1 · 다시',
  're-b2': '블록 2 · 다시',
}
const groupLabels: Record<string, string> = {
  'client-side': '클라이언트',
  'server-side': '서버',
  'lost-box': '블록 2를 잃었을 때',
}
const noteLabels: Record<string, string> = {
  'last-note': '512보다 짧아 끝',
  'lost-note': '사라짐',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
const headIds = ['client', 'server']
// 클라이언트 → 서버(요청과 확인 응답)와 서버 → 클라이언트(블록). 사라진 블록은 서버에서 나가기만 한다.
const toServerIds = ['req', 'a1', 'a2', 'a3', 're-a1']
const toClientIds = ['b1', 'b2', 'b3', 're-b2']
const ackIds = ['a1', 'a2', 'a3', 're-a1']
const blockIds = ['b1', 'b2', 'b3']
const lostBoxIds = ['lost2', 're-a1', 're-b2']
const messageIds = nodeIds.filter((id) => !headIds.includes(id))
const noteOwner: Record<string, string> = { 'last-note': 'b3', 'lost-note': 'lost2' }

const tallY: Record<string, number> = {
  req: 64, b1: 108, a1: 152, b2: 196, a2: 240, b3: 284, a3: 340, lost2: 408, 're-a1': 464, 're-b2': 508,
}
function pathsFor(wide: boolean) {
  const [clientEdge, nodeLeft, nodeRight, serverEdge] = wide ? [96, 120, 320, 344] : [64, 76, 204, 216]
  const result: Record<string, string> = {}
  for (const id of messageIds) {
    const y = tallY[id] + 16
    if (toServerIds.includes(id)) {
      result[`${id}-out`] = `M${clientEdge} ${y} H${nodeLeft}`
      result[`${id}-in`] = `M${nodeRight} ${y} H${serverEdge}`
    } else {
      result[`${id}-out`] = `M${serverEdge} ${y} H${nodeRight}`
      if (id !== 'lost2') result[`${id}-in`] = `M${nodeLeft} ${y} H${clientEdge}`
    }
  }
  return result
}
const tallPaths = pathsFor(false)
const widePaths = pathsFor(true)
const pathsOf = (ids: string[]) => ids.flatMap((id) => [`${id}-out`, `${id}-in`])

const question = 'TFTP는 파일을 어떻게 나눠 보낼까?'
const figureName = '클라이언트 192.0.2.10이 서버 198.51.100.10에서 1,300바이트 파일 config.txt를 TFTP로 내려받으며 블록마다 확인 응답을 주고받는 차례와, 블록 2를 잃었을 때 다시 보내는 차례를 보이는 도식'
const svgName = '왼쪽 클라이언트 192.0.2.10과 오른쪽 서버 198.51.100.10 두 기둥 사이에, 위에서부터 읽기 요청 · 69번, 블록 1 · 512바이트, 확인 응답 1, 블록 2 · 512바이트, 확인 응답 2, 블록 3 · 276바이트, 확인 응답 3을 차례로 놓고, 그 아래 블록 2를 잃었을 때 박스에 블록 2 · 512바이트, 확인 응답 1 · 다시, 블록 2 · 다시를 놓은 그림'
const idleCaption = '클라이언트 192.0.2.10이 서버 198.51.100.10에서 1,300바이트 파일 config.txt를 내려받는 차례를 위에서 아래로 놓았다. 클라이언트가 서버의 69번으로 읽기 요청을 보내면, 서버가 파일을 512바이트씩 블록으로 나눠 보내고 클라이언트가 블록마다 확인 응답을 보낸다. 아래 박스는 블록 2를 잃었을 때의 차례다. 버튼을 고르면 단계마다 무엇이 오가는지 볼 수 있다.'
const legend = '위의 두 노드는 클라이언트와 서버의 주소이고, 그 아래 왼쪽 박스가 클라이언트, 오른쪽 박스가 서버다. 화살표는 요청·블록·확인 응답이 가는 방향이고, 곁의 글은 그 블록이 어떻게 되는지다.'
const expectedScenarios = [
  {
    id: 'lockstep', label: '블록마다',
    nodes: [...headIds, 'b1', 'a1', 'b2'], paths: pathsOf(['b1', 'a1', 'b2']), notes: [] as string[],
    caption: '서버가 블록 1을 보내면 클라이언트가 확인 응답 1을 보내고, 서버는 확인 응답 1을 받고 나서야 블록 2를 보낸다. 확인 응답을 받기 전에는 다음 블록을 보내지 않으므로 한 번에 블록 하나만 오간다.',
  },
  {
    id: 'last', label: '끝',
    nodes: [...headIds, 'b3', 'a3'], paths: pathsOf(['b3', 'a3']), notes: ['last-note'],
    caption: '블록 1과 블록 2로 512 + 512 = 1,024바이트를 보내면 남은 크기는 1,300 − 1,024 = 276바이트다. 이 276바이트가 블록 3이 되고, 512바이트보다 짧으므로 클라이언트는 블록 3이 마지막임을 알고 확인 응답 3을 보낸다.',
  },
  {
    id: 'lost', label: '잃었을 때',
    nodes: [...headIds, 're-a1', 're-b2'], paths: ['lost2-out', ...pathsOf(['re-a1', 're-b2'])], notes: ['lost-note'],
    caption: '서버가 보낸 블록 2가 오는 길에 사라지면, 블록 2를 기다리던 클라이언트가 시간 초과 뒤 마지막으로 보낸 확인 응답 1을 다시 보낸다. 이를 받은 서버가 블록 2를 다시 보내 빠진 자리를 채운다.',
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

function onEdge(x: number, y: number, box: SvgBox) {
  const insideX = x >= box.x && x <= box.x + box.width
  const insideY = y >= box.y && y <= box.y + box.height
  return ((x === box.x || x === box.x + box.width) && insideY) || ((y === box.y || y === box.y + box.height) && insideX)
}

function lineEnds(d: string) {
  const list = segments(d)
  return { start: { x: list[0].x1, y: list[0].y1 }, end: { x: list[list.length - 1].x2, y: list[list.length - 1].y2 } }
}

// 경로 끝이 닿은 곳 — 노드의 변이 먼저고, 아니면 기둥의 변이다.
const endAt = (point: { x: number, y: number }) => nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))
  ?? ['client-side', 'server-side'].find((id) => onEdge(point.x, point.y, groupBox(id)))
const groupLabelBox = (id: string) => textBox(svg().querySelector(`[data-group-label="${id}"]`)!, `${id}-label`)
const bytesOf = (id: string) => Number(/(\d+)바이트/u.exec(label(id))![1])

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 564] : [0, 0, 280, 564]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<TftpBlocksDiagram />)
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
    const { container } = render(<TftpBlocksDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<TftpBlocksDiagram />)
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
    render(<TftpBlocksDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    const client = groupBox('client-side')
    const server = groupBox('server-side')
    expect(client.y).toBe(server.y)
    expect(client.height).toBe(server.height)
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const column of ['client-side', 'server-side']) expect(overlaps(nodeBox(id), groupBox(column)), `${id} ↔ ${column}`).toBe(false)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    // 머리 노드는 기둥 위에 서고 바깥 변을 기둥과 맞춘다.
    for (const id of headIds) expect(nodeBox(id).y + 32, id).toBeLessThan(client.y)
    expect(nodeBox('client').x).toBe(client.x)
    expect(nodeBox('server').x + nodeBox('server').width).toBe(server.x + server.width)
    // 메시지 노드는 두 기둥 사이에 위에서 아래로 놓이고, 잃었을 때의 노드만 그 박스 안에 든다.
    for (const id of messageIds) {
      expect(nodeBox(id).x, id).toBeGreaterThan(client.x + client.width)
      expect(nodeBox(id).x + nodeBox(id).width, id).toBeLessThan(server.x)
      expect(nodeBox(id).y, id).toBeGreaterThan(client.y)
      expect(nodeBox(id).y + 32, id).toBeLessThan(client.y + client.height)
      expect(lostBoxIds.includes(id) ? contains(groupBox('lost-box'), nodeBox(id)) : overlaps(nodeBox(id), groupBox('lost-box')), id).toBe(lostBoxIds.includes(id))
    }
    for (const id of groupIds) {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
    }
    // 곁말은 자기 블록 노드 바로 아래, 다음 노드보다 위에 들어간다.
    const noteBoxes: SvgBox[] = []
    for (const scenario of expectedScenarios.filter(({ notes }) => notes.length > 0)) {
      await select(scenario.label)
      for (const id of scenario.notes) noteBoxes.push(textBox(note(id), id))
    }
    expect(noteBoxes.map(({ id }) => id)).toEqual(noteIds)
    for (const box of noteBoxes) {
      const owner = noteOwner[box.id]
      expect(box.y + 9 - (nodeBox(owner).y + 32), box.id).toBeGreaterThanOrEqual(10)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
      for (const column of ['client-side', 'server-side']) expect(overlaps(box, groupBox(column)), `${box.id} ↔ ${column}`).toBe(false)
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(viewBox[2])
    }
    expect(contains(groupBox('lost-box'), noteBoxes.find(({ id }) => id === 'lost-note')!)).toBe(true)
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표 양 끝은 기둥이나 노드의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나거나 다른 화살표와 만나지 않는다', () => {
    render(<TftpBlocksDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(pathsOf(messageIds).filter((id) => id !== 'lost2-in')))
    for (const [id, d] of Object.entries(paths)) {
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
    }
    const all = Object.keys(paths)
    for (let i = 0; i < all.length; i += 1) {
      for (const other of all.slice(i + 1)) {
        for (const a of segments(paths[all[i]])) {
          for (const b of segments(paths[other])) {
            const box = { id: '', x: Math.min(b.x1, b.x2), y: Math.min(b.y1, b.y2), width: Math.abs(b.x2 - b.x1), height: Math.abs(b.y2 - b.y1) }
            expect(touches(a, box), `${all[i]} ↔ ${other}`).toBe(false)
          }
        }
      }
    }
  })

  // 요점: 블록 셋의 크기를 더하면 1,300바이트이고 마지막 블록만 512보다 짧다. 확인 응답은 모두 클라이언트 → 서버로 간다.
  // 잃은 블록은 서버에서 나가기만 하고 클라이언트에 닿지 않으며, 다시 보낸 블록은 「잃었을 때」에서만 선명하다.
  it('블록 크기를 더하면 1300이고 확인 응답은 클라이언트에서 서버로 가며, 잃은 블록은 다시 보내 채운다', async () => {
    render(<TftpBlocksDiagram />)
    expect(blockIds.reduce((sum, id) => sum + bytesOf(id), 0)).toBe(1300)
    expect(blockIds.map(bytesOf)).toEqual([512, 512, 276])
    for (const id of ackIds) {
      expect(endAt(lineEnds(paths[`${id}-out`]).start), id).toBe('client-side')
      expect(endAt(lineEnds(paths[`${id}-out`]).end), id).toBe(id)
      expect(endAt(lineEnds(paths[`${id}-in`]).start), id).toBe(id)
      expect(endAt(lineEnds(paths[`${id}-in`]).end), id).toBe('server-side')
    }
    expect(endAt(lineEnds(paths['req-out']).start)).toBe('client-side')
    expect(endAt(lineEnds(paths['req-in']).end)).toBe('server-side')
    for (const id of toClientIds) {
      expect(endAt(lineEnds(paths[`${id}-out`]).start), id).toBe('server-side')
      expect(endAt(lineEnds(paths[`${id}-in`]).end), id).toBe('client-side')
    }
    // 잃은 블록의 화살표는 서버에서 나와 그 노드에서 끝난다 — 클라이언트로 가는 화살표가 없다.
    expect(endAt(lineEnds(paths['lost2-out']).start)).toBe('server-side')
    expect(endAt(lineEnds(paths['lost2-out']).end)).toBe('lost2')
    expect(paths['lost2-in']).toBeUndefined()
    expect(label('req')).toContain('69')
    // 차례: 요청 → 블록 1 → … → 확인 응답 3, 그 아래 잃었을 때의 차례.
    const order = ['req', 'b1', 'a1', 'b2', 'a2', 'b3', 'a3', 'lost2', 're-a1', 're-b2']
    for (let i = 1; i < order.length; i += 1) expect(nodeBox(order[i]).y, order[i]).toBeGreaterThan(nodeBox(order[i - 1]).y)

    await select('끝')
    const brightBlocks = [...blockIds, 'lost2', 're-b2'].filter((id) => opacity(id) === '1')
    expect(brightBlocks).toEqual(['b3'])
    expect(label('b3')).toContain('276')

    for (const scenario of expectedScenarios.filter(({ id }) => id !== 'lost')) {
      await select(scenario.label)
      expect(opacity('re-b2'), scenario.id).toBe('0.25')
      expect(opacity('re-a1'), scenario.id).toBe('0.25')
      expect(shownPaths().filter((id) => id.startsWith('re-') || id.startsWith('lost2')), scenario.id).toEqual([])
    }
    await select('잃었을 때')
    expect(opacity('lost2')).toBe('0.25')
    expect(opacity('re-b2')).toBe('1')
    expect(shownPaths()).toContain('lost2-out')
    expect(note('lost-note').textContent).toBe('사라짐')

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const name of ['`192.0.2.10`', '`198.51.100.10`', '`69`', '`config.txt`', '1,300', '512 + 512 = 1,024', '1,300 − 1,024 = 276', '확인 응답 1', '읽기 요청', '시간 초과', '사라']) {
      expect(body, name).toContain(name)
    }
  })
}

describe('TftpBlocksDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<TftpBlocksDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 564')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('잃었을 때')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 564')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '잃었을 때' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><TftpBlocksDiagram /><TftpBlocksDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '블록마다' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<TftpBlocksDiagram />)
    const text = visualsByTopicId[topicId].diagrams['tftp-blocks']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(tftpBlocksScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = tftpBlocksScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 TFTP 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
