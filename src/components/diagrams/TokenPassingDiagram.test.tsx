import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { TokenPassingDiagram, tokenPassingScenarios } from './TokenPassingDiagram'

const topicId = 'network-topology'
const anchorConceptId = `${topicId}.token-ring`
const labels: Record<string, string> = {
  'pc01': 'PC01',
  'pc02': 'PC02',
  'pc03': 'PC03',
  'pc04': 'PC04',
}
const noteLabels: Record<string, string> = {
  'circulate-center': '토큰이 차례로 돈다',
  'holder-transmit': '토큰을 잡은 노드: PC03',
  'holder-release': '토큰을 받은 노드: PC04',
  'circulate-note': '보낼 데이터가 없으면 토큰을 다음 노드로 넘긴다',
  'transmit-note': '토큰을 잡은 PC03만 데이터를 보낸다',
  'release-note': '다 보낸 PC03이 새 토큰을 PC04로 내보낸다',
}
// 고리 안쪽에 두는 곁말과 그림 아래의 빈 줄에 두는 곁말.
const centerNoteIds = ['circulate-center', 'holder-transmit', 'holder-release']
const nodeIds = Object.keys(labels)
const noteIds = Object.keys(noteLabels)
const linkIds = ['link-12', 'link-23', 'link-34', 'link-41']
// 가는 선(한 방향 링크)은 늘 보이고, 굵은 화살표(토큰이나 데이터)는 시나리오를 골랐을 때만 보인다.
const pathEnds: Record<string, [string, string]> = {
  'link-12': ['pc01', 'pc02'],
  'link-23': ['pc02', 'pc03'],
  'link-34': ['pc03', 'pc04'],
  'link-41': ['pc04', 'pc01'],
  'token-12': ['pc01', 'pc02'],
  'token-23': ['pc02', 'pc03'],
  'token-34': ['pc03', 'pc04'],
  'token-41': ['pc04', 'pc01'],
  'data-34': ['pc03', 'pc04'],
  'data-41': ['pc04', 'pc01'],
  'release-34': ['pc03', 'pc04'],
}
const tallPaths: Record<string, string> = {
  'link-12': 'M88 24 H192',
  'link-23': 'M224 40 V120',
  'link-34': 'M192 136 H88',
  'link-41': 'M56 120 V40',
  'token-12': 'M88 24 H192',
  'token-23': 'M224 40 V120',
  'token-34': 'M192 136 H88',
  'token-41': 'M56 120 V40',
  'data-34': 'M192 136 H88',
  'data-41': 'M56 120 V40',
  'release-34': 'M192 136 H88',
}
const widePaths: Record<string, string> = {
  'link-12': 'M128 24 H312',
  'link-23': 'M344 40 V104',
  'link-34': 'M312 120 H128',
  'link-41': 'M96 104 V40',
  'token-12': 'M128 24 H312',
  'token-23': 'M344 40 V104',
  'token-34': 'M312 120 H128',
  'token-41': 'M96 104 V40',
  'data-34': 'M312 120 H128',
  'data-41': 'M96 104 V40',
  'release-34': 'M312 120 H128',
}

const question = '토큰 링에서는 누가 언제 보낼까?'
const figureName = 'PC01→PC02→PC03→PC04→PC01 차례로 도는 토큰 링에서, 토큰이 노드를 차례로 거쳐 도는 모습과, 토큰을 잡은 PC03이 PC01에게 데이터를 보내는 모습과, 다 보낸 PC03이 새 토큰을 PC04로 내보내는 모습을 보이는 도식'
const svgName = '왼쪽 위 PC01, 오른쪽 위 PC02, 오른쪽 아래 PC03, 왼쪽 아래 PC04를 사각형 둘레에 놓고 한 방향 링크 넷으로 이어 고리를 만든 그림'
const idleCaption = 'PC01~PC04가 한 방향 링크 넷으로 이어진 링에서, 보낼 차례를 나타내는 토큰이 PC01 → PC02 → PC03 → PC04 → PC01 차례로 돈다. PC01~PC04는 예로 붙인 이름이다. 버튼으로 장면을 고르면 토큰과 데이터가 가는 길을 차례로 볼 수 있다.'
const legend = '가는 화살표는 한 노드에서 다음 노드로 가는 한 방향 링크이고, 굵은 화살표는 장면마다 토큰이나 데이터가 가는 쪽이다. 무엇이 가는지는 그림 아래의 곁말이 밝힌다.'
const expectedScenarios = [
  {
    id: 'circulate', label: '토큰이 돈다',
    nodes: ['pc01', 'pc02', 'pc03', 'pc04'],
    paths: ['token-12', 'token-23', 'token-34', 'token-41'],
    notes: ['circulate-center', 'circulate-note'],
    caption: '보낼 데이터가 없는 노드는 받은 토큰을 다음 노드로 넘긴다. 그래서 토큰은 PC01 → PC02 → PC03 → PC04 → PC01 차례로 링을 한 방향으로 돌고, 노드마다 보낼 차례가 돌아온다.',
  },
  {
    id: 'transmit', label: '토큰을 잡고 보낸다',
    nodes: ['pc03', 'pc04', 'pc01'],
    paths: ['data-34', 'data-41'],
    notes: ['holder-transmit', 'transmit-note'],
    caption: 'PC01에게 보낼 데이터가 있는 PC03은 토큰이 오기를 기다렸다가 토큰을 잡고 데이터를 보낸다. 데이터는 다음 노드인 PC04에 닿고, PC04가 받은 신호를 다시 내보내 PC01에 닿는다. 토큰을 잡은 노드 하나만 보내므로 신호가 부딪칠 일이 없다.',
  },
  {
    id: 'release', label: '토큰을 넘긴다',
    nodes: ['pc03', 'pc04'],
    paths: ['release-34'],
    notes: ['holder-release', 'release-note'],
    caption: '데이터를 다 보낸 PC03은 새 토큰을 다음 노드인 PC04로 내보낸다. 토큰을 잡고 있을 수 있는 시간에는 한도가 있어, 토큰은 다시 링을 돌며 다른 노드에게도 보낼 차례를 넘긴다.',
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
const label = (id: string) => svg().querySelector(`[data-node="${id}"] text`)!.textContent!
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const shownLinks = () => Array.from(svg().querySelectorAll('[data-link]'), (link) => link.getAttribute('data-link')!)
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note')!)
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)!
const opacity = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')
const clearNodes = () => nodeIds.filter((id) => opacity(id) === '1')
// 링크의 가는 화살표는 회색(fill-muted) 마커를, 토큰·데이터의 굵은 화살표는 fill-title 마커를 쓴다.
const markerOf = (fill: string) => Array.from(svg().querySelectorAll('marker')).find((marker) => marker.querySelector('path')!.classList.contains(fill))!

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

// 곁말(9)의 가로 범위. 반각 문자가 섞이므로 어림값의 1.15배로 잡는다.
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

// 두 선분이 같은 직선 위에 있고 길이가 있는 구간을 함께 쓰는가.
function collinearOverlap(a: Segment, b: Segment) {
  const shared = (a1: number, a2: number, b1: number, b2: number) => Math.min(Math.max(a1, a2), Math.max(b1, b2)) - Math.max(Math.min(a1, a2), Math.min(b1, b2)) > 0
  if (a.x1 === a.x2 && b.x1 === b.x2 && a.x1 === b.x1) return shared(a.y1, a.y2, b.y1, b.y2)
  if (a.y1 === a.y2 && b.y1 === b.y2 && a.y1 === b.y1) return shared(a.x1, a.x2, b.x1, b.x2)
  return false
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

// 선이 어느 노드의 변에서 시작하고 어느 노드의 변에서 끝나는지 그림에서 읽는다.
function endpointNode(point: { x: number, y: number }) {
  return nodeIds.find((id) => onEdge(point, nodeBox(id)))
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 172] : [0, 0, 280, 188]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<TokenPassingDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 링크가 모두 선명하고 굵은 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<TokenPassingDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(shownLinks()).toEqual(linkIds)
    for (const link of svg().querySelectorAll('[data-link]')) {
      expect(link).not.toHaveAttribute('opacity')
      expect(link).toHaveAttribute('d', paths[link.getAttribute('data-link')!])
      expect(link).toHaveClass('stroke-muted')
      expect(link).toHaveAttribute('marker-end', `url(#${markerOf('fill-muted').id})`)
    }
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보이고 링크는 늘 선명하다', async (scenario) => {
    const { container } = render(<TokenPassingDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownLinks()).toEqual(linkIds)
    for (const link of svg().querySelectorAll('[data-link]')) expect(link).not.toHaveAttribute('opacity')
    expect(shownPaths()).toEqual(scenario.paths)
    for (const path of svg().querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('d', paths[path.getAttribute('data-path')!])
      expect(path).toHaveAttribute('stroke-width', '2')
      expect(path).toHaveClass('stroke-title')
      expect(path).toHaveAttribute('marker-end', `url(#${markerOf('fill-title').id})`)
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
    render(<TokenPassingDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    // 토큰을 쥔 노드를 알리는 곁말은 고리 가운데의 빈자리에, 하는 일을 알리는 곁말은 그림 아래의 빈 줄에 들어간다.
    // 노드와는 위아래 4 이상 띄우고 선에 닿지 않는다.
    const noteBoxes = new Map<string, SvgBox>()
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of scenario.notes) noteBoxes.set(id, textBox(note(id), id))
    }
    expect([...noteBoxes.keys()].sort()).toEqual([...noteIds].sort())
    expect(boxesOutsideViewBox([...noteBoxes.values()], viewBox)).toEqual([])
    for (const box of noteBoxes.values()) {
      for (const node of nodeIds) {
        const nodeArea = nodeBox(node)
        expect(overlaps(box, { ...nodeArea, y: nodeArea.y - 4, height: nodeArea.height + 8 }), `${box.id} ↔ ${node}`).toBe(false)
      }
      for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
    }
    // 고리 안쪽 = 왼쪽 링크(PC04 → PC01)와 오른쪽 링크(PC02 → PC03) 사이, 위 링크(PC01 → PC02)와 아래 링크(PC03 → PC04) 사이.
    const ring = { left: segments(paths['link-41'])[0].x1, right: segments(paths['link-23'])[0].x1, top: segments(paths['link-12'])[0].y1, bottom: segments(paths['link-34'])[0].y1 }
    for (const id of centerNoteIds) {
      const box = noteBoxes.get(id)!
      expect(box.x, id).toBeGreaterThan(ring.left)
      expect(box.x + box.width, id).toBeLessThan(ring.right)
      expect(box.y, id).toBeGreaterThan(ring.top)
      expect(box.y + box.height, id).toBeLessThan(ring.bottom)
    }
    for (const id of noteIds.filter((noteId) => !centerNoteIds.includes(noteId))) {
      expect(noteBoxes.get(id)!.y, id).toBeGreaterThan(nodeBox('pc03').y + nodeBox('pc03').height)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('선은 앞 노드의 변에서 시작해 뒤 노드의 변에서 끝나고, 노드 안을 지나지 않으며 링크끼리·한 장면의 화살표끼리 겹치지 않는다', () => {
    render(<TokenPassingDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(pathEnds)))
    for (const [id, d] of Object.entries(paths)) {
      const { start, end } = lineEnds(d)
      expect(onEdge(start, nodeBox(pathEnds[id][0])), `${id} 시작`).toBe(true)
      expect(onEdge(end, nodeBox(pathEnds[id][1])), `${id} 끝`).toBe(true)
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
      }
    }
    for (const a of linkIds) for (const b of linkIds.filter((other) => other !== a)) {
      for (const sa of segments(paths[a])) for (const sb of segments(paths[b])) expect(collinearOverlap(sa, sb), `${a} ↔ ${b}`).toBe(false)
    }
    for (const scenario of expectedScenarios) {
      for (const a of scenario.paths) for (const b of scenario.paths.filter((other) => other !== a)) {
        for (const sa of segments(paths[a])) for (const sb of segments(paths[b])) expect(collinearOverlap(sa, sb), `${a} ↔ ${b}`).toBe(false)
      }
    }
  })

  // 요점: 토큰이 돈다에서는 굵은 화살표가 PC01 → PC02 → PC03 → PC04 → PC01의 고리를 끊김 없이 한 바퀴 돈다.
  // 토큰을 잡고 보낸다에서는 첫 화살표가 PC03에서 시작해 PC04를 거쳐 PC01에 닿고, 토큰을 잡지 않은 PC02는 흐리다.
  // 토큰을 넘긴다에서는 PC03에서 다음 노드 PC04로 가는 화살표 하나뿐이다. 세 장면의 선명한 노드·화살표·곁말은 서로 다르다.
  it('토큰은 노드를 차례로 돌고, 토큰을 잡은 PC03만 보내며, 다 보낸 뒤 다음 노드로 넘긴다', async () => {
    render(<TokenPassingDiagram />)
    const ends = (id: string) => [endpointNode(lineEnds(paths[id]).start), endpointNode(lineEnds(paths[id]).end)]
    const linkEnds = linkIds.map(ends)
    expect(linkEnds).toEqual([['pc01', 'pc02'], ['pc02', 'pc03'], ['pc03', 'pc04'], ['pc04', 'pc01']])

    const seen: string[] = []
    const record = () => seen.push(JSON.stringify([clearNodes(), shownPaths(), shownNotes()]))

    await select('토큰이 돈다')
    const loop = shownPaths().map(ends)
    expect(loop).toEqual(linkEnds)
    for (let index = 1; index < loop.length; index += 1) expect(loop[index][0]).toBe(loop[index - 1][1])
    expect(loop[loop.length - 1][1]).toBe(loop[0][0])
    record()

    await select('토큰을 잡고 보낸다')
    const sent = shownPaths().map(ends)
    expect(sent[0][0]).toBe('pc03')
    for (let index = 1; index < sent.length; index += 1) expect(sent[index][0]).toBe(sent[index - 1][1])
    expect(sent[sent.length - 1][1]).toBe('pc01')
    expect(sent.map(([from]) => from)).toContain('pc04')
    expect(opacity('pc02')).toBe('0.25')
    record()

    await select('토큰을 넘긴다')
    expect(shownPaths().map(ends)).toEqual([['pc03', 'pc04']])
    record()

    expect(new Set(seen).size).toBe(3)

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const phrase of ['`PC01`→`PC02`→`PC03`→`PC04`→`PC01`', '`PC03`이 토큰을 잡고 데이터를 보낸다', '`PC04`가 받은 신호를 다시 내보내 `PC01`에 닿는다', '새 토큰을 다음 노드인 `PC04`로 내보내고', '예로 붙인 이름']) {
      expect(body, phrase).toContain(phrase)
    }
  })
}

describe('TokenPassingDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<TokenPassingDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 188')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      await select('토큰을 잡고 보낸다')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 172')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(screen.getByRole('button', { name: '토큰을 잡고 보낸다' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      expect(shownLinks()).toEqual(linkIds)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><TokenPassingDiagram /><TokenPassingDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '토큰이 돈다' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    const markerIds = figures.flatMap((figure) => Array.from(figure.querySelectorAll('marker'), (marker) => marker.id))
    expect(markerIds).toHaveLength(4)
    expect(new Set(markerIds).size).toBe(4)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<TokenPassingDiagram />)
    const text = visualsByTopicId[topicId].diagrams['token-passing']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(tokenPassingScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toBeUndefined()
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
      const scenario = tokenPassingScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 토큰 링 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
