import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { FtpConnectionsDiagram, ftpConnectionsScenarios } from './FtpConnectionsDiagram'

const topicId = 'app-protocols-mail-file'
const anchorConceptId = `${topicId}.ftp`
const labels: Record<string, string> = {
  client: '192.0.2.10',
  server: '198.51.100.10',
  control: '제어 연결 · 21번',
  'user-pass': 'USER · PASS',
  retr1: 'RETR report.txt',
  data1: 'report.txt 내용',
  retr2: 'RETR notes.txt',
  data2: 'notes.txt 내용',
  quit: 'QUIT',
}
const groupLabels: Record<string, string> = {
  'client-side': '클라이언트',
  'server-side': '서버',
  'data1-box': '데이터 연결',
  'data2-box': '데이터 연결',
}
const noteLabels: Record<string, string> = {
  'data1-note': '다 보내면 끊긴다',
  'data2-note': '새로 맺는다',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
const headIds = ['client', 'server']
// 클라이언트가 제어 연결로 보내는 것(클라이언트 → 서버)과 데이터 연결로 오는 파일 내용(서버 → 클라이언트).
const commandIds = ['control', 'user-pass', 'retr1', 'retr2', 'quit']
const dataIds = ['data1', 'data2']
const messageIds = nodeIds.filter((id) => !headIds.includes(id))
const boxOf: Record<string, string> = { data1: 'data1-box', data2: 'data2-box' }

const tallY: Record<string, number> = { control: 64, 'user-pass': 108, retr1: 152, data1: 216, retr2: 280, data2: 344, quit: 408 }
function pathsFor(wide: boolean) {
  const [clientEdge, nodeLeft, nodeRight, serverEdge] = wide ? [96, 120, 320, 344] : [64, 76, 204, 216]
  const result: Record<string, string> = {}
  for (const id of messageIds) {
    const y = tallY[id] + 16
    if (commandIds.includes(id)) {
      result[`${id}-out`] = `M${clientEdge} ${y} H${nodeLeft}`
      result[`${id}-in`] = `M${nodeRight} ${y} H${serverEdge}`
    } else {
      result[`${id}-out`] = `M${serverEdge} ${y} H${nodeRight}`
      result[`${id}-in`] = `M${nodeLeft} ${y} H${clientEdge}`
    }
  }
  return result
}
const tallPaths = pathsFor(false)
const widePaths = pathsFor(true)
const pathsOf = (ids: string[]) => ids.flatMap((id) => [`${id}-out`, `${id}-in`])

const question = 'FTP는 명령과 파일을 같은 연결로 보낼까?'
const figureName = '클라이언트 192.0.2.10이 서버 198.51.100.10에 FTP로 접속해, 하나로 이어지는 제어 연결로 명령을 보내고 파일마다 새로 맺는 데이터 연결로 report.txt와 notes.txt의 내용을 받는 차례를 보이는 도식'
const svgName = '왼쪽 클라이언트 192.0.2.10과 오른쪽 서버 198.51.100.10 두 기둥 사이에, 위에서부터 제어 연결 · 21번, USER · PASS, RETR report.txt, 데이터 연결 박스의 report.txt 내용, RETR notes.txt, 데이터 연결 박스의 notes.txt 내용, QUIT를 차례로 놓은 그림'
const idleCaption = '클라이언트 192.0.2.10이 서버 198.51.100.10에 접속해 파일 둘을 내려받고 접속을 끝내기까지를 위에서 아래로 놓았다. 두 기둥 사이 맨 위 노드는 클라이언트가 여는 제어 연결이고, 박스 밖의 다른 노드는 그 제어 연결로 보내는 명령이다. 데이터 연결 박스 안의 노드는 그때 맺은 데이터 연결로 오는 파일 내용이다. 버튼을 고르면 연결마다 무엇이 오가는지 볼 수 있다.'
const legend = '위의 두 노드는 클라이언트와 서버의 주소이고, 그 아래 왼쪽 박스가 클라이언트, 오른쪽 박스가 서버다. 화살표는 명령이나 파일 내용이 가는 방향이고, 곁의 글은 그 데이터 연결이 어떻게 되는지다.'
const expectedScenarios = [
  {
    id: 'control', label: '① 제어 연결',
    nodes: [...headIds, ...commandIds], paths: pathsOf(commandIds), notes: [] as string[],
    caption: '클라이언트가 서버의 21번 포트로 제어 연결을 열고, 이 연결로 USER·PASS, RETR, QUIT 같은 명령을 보내고 응답을 받는다. 제어 연결은 QUIT로 접속을 끝낼 때까지 하나로 이어진다.',
  },
  {
    id: 'data', label: '② 데이터 연결',
    nodes: [...headIds, 'control', 'retr1', 'data1'], paths: pathsOf(['retr1', 'data1']), notes: ['data1-note'],
    caption: 'RETR report.txt를 보내면 데이터 연결이 맺어지고, 서버가 그 연결로 report.txt의 내용을 보낸다. 다 보내면 서버가 데이터 연결을 닫고 제어 연결로 226을 보낸다. 제어 연결은 그대로 남는다.',
  },
  {
    id: 'next-file', label: '③ 다음 파일',
    nodes: [...headIds, 'control', 'retr2', 'data2'], paths: pathsOf(['retr2', 'data2']), notes: ['data2-note'],
    caption: '이어서 RETR notes.txt를 보내면 데이터 연결을 새로 맺어 notes.txt의 내용을 보내고, 다 보내면 다시 닫는다. 파일 하나를 옮길 때마다 데이터 연결을 새로 맺고, 명령은 처음 연 제어 연결로 계속 보낸다.',
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 456] : [0, 0, 280, 456]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<FtpConnectionsDiagram />)
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
    const { container } = render(<FtpConnectionsDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<FtpConnectionsDiagram />)
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
    render(<FtpConnectionsDiagram />)
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
    // 메시지 노드는 두 기둥 사이에 위에서 아래로 놓이고, 파일 내용은 자기 데이터 연결 박스 안에 든다.
    for (const id of messageIds) {
      expect(nodeBox(id).x, id).toBeGreaterThan(client.x + client.width)
      expect(nodeBox(id).x + nodeBox(id).width, id).toBeLessThan(server.x)
      expect(nodeBox(id).y, id).toBeGreaterThan(client.y)
      expect(nodeBox(id).y + 32, id).toBeLessThan(client.y + client.height)
    }
    for (const id of dataIds) expect(contains(groupBox(boxOf[id]), nodeBox(id)), id).toBe(true)
    for (const id of commandIds) for (const box of Object.values(boxOf)) expect(overlaps(nodeBox(id), groupBox(box)), `${id} ↔ ${box}`).toBe(false)
    for (const id of groupIds) {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
    }
    // 곁말은 자기 데이터 연결 박스 안, 파일 내용 노드 아래에 들어간다.
    const noteBoxes: SvgBox[] = []
    for (const scenario of expectedScenarios.filter(({ notes }) => notes.length > 0)) {
      await select(scenario.label)
      for (const id of scenario.notes) noteBoxes.push(textBox(note(id), id))
    }
    expect(noteBoxes.map(({ id }) => id)).toEqual(noteIds)
    for (const box of noteBoxes) {
      const owner = box.id === 'data1-note' ? 'data1' : 'data2'
      expect(contains(groupBox(boxOf[owner]), box), box.id).toBe(true)
      expect(box.y + 9 - (nodeBox(owner).y + 32), box.id).toBeGreaterThanOrEqual(10)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(viewBox[2])
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표 양 끝은 기둥이나 노드의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나거나 다른 화살표와 만나지 않는다', () => {
    render(<FtpConnectionsDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(pathsOf(messageIds)))
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

  // 요점: 명령은 모두 클라이언트 → 서버로 가고 파일 내용은 서버 → 클라이언트로 온다.
  // 제어 연결 노드는 세 시나리오 모두에서 같은 하나가 선명하고(접속하는 동안 이어진다), 데이터 연결은 전송마다 다른 노드다.
  it('제어 연결은 하나로 이어지고 데이터 연결은 파일마다 다른 노드이며, 명령과 파일 내용의 방향이 본문과 같다', async () => {
    render(<FtpConnectionsDiagram />)
    for (const id of commandIds) {
      expect(endAt(lineEnds(paths[`${id}-out`]).start), id).toBe('client-side')
      expect(endAt(lineEnds(paths[`${id}-out`]).end), id).toBe(id)
      expect(endAt(lineEnds(paths[`${id}-in`]).start), id).toBe(id)
      expect(endAt(lineEnds(paths[`${id}-in`]).end), id).toBe('server-side')
    }
    for (const id of dataIds) {
      expect(endAt(lineEnds(paths[`${id}-out`]).start), id).toBe('server-side')
      expect(endAt(lineEnds(paths[`${id}-out`]).end), id).toBe(id)
      expect(endAt(lineEnds(paths[`${id}-in`]).start), id).toBe(id)
      expect(endAt(lineEnds(paths[`${id}-in`]).end), id).toBe('client-side')
    }
    // 서버 쪽으로 가는 제어 연결의 라벨에 21이 있다.
    expect(label('control')).toContain('21')

    const brightData: string[][] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const bright = nodeIds.filter((id) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
      expect(bright, scenario.id).toContain('control')
      brightData.push(bright.filter((id) => dataIds.includes(id)))
    }
    expect(brightData[0]).toEqual([])
    expect(brightData[1]).toHaveLength(1)
    expect(brightData[2]).toHaveLength(1)
    expect(brightData[1][0]).not.toBe(brightData[2][0])
    // 두 번째 데이터 연결은 첫 번째가 끝난 뒤, 그다음 RETR 아래에 놓인다.
    expect(nodeBox('retr2').y).toBeGreaterThan(nodeBox('data1').y)
    expect(nodeBox('data2').y).toBeGreaterThan(nodeBox('retr2').y)
    expect(nodeBox('quit').y).toBeGreaterThan(nodeBox('data2').y)

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const name of ['`192.0.2.10`', '`198.51.100.10`', '`21`', '`USER`', '`PASS`', '`RETR report.txt`', '`RETR notes.txt`', '`QUIT`', '`226`', '제어 연결', '데이터 연결']) {
      expect(body, name).toContain(name)
    }
  })
}

describe('FtpConnectionsDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<FtpConnectionsDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 456')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('② 데이터 연결')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 456')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '② 데이터 연결' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><FtpConnectionsDiagram /><FtpConnectionsDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '① 제어 연결' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<FtpConnectionsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['ftp-connections']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(ftpConnectionsScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = ftpConnectionsScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 FTP 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
