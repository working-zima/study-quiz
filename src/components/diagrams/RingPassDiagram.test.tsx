import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { RingPassDiagram, ringPassScenarios } from './RingPassDiagram'

const topicId = 'network-topology'
const anchorConceptId = `${topicId}.ring-topology`
const labels: Record<string, string> = {
  'pc01': 'PC01',
  'pc02': 'PC02',
  'pc03': 'PC03',
  'pc04': 'PC04',
}
const noteLabels: Record<string, string> = {
  'dir-note': '한 방향으로 돈다',
  'pass-note': 'PC02가 받은 신호를 다시 내보내 PC03으로 넘긴다',
  'break-note': 'PC02에서 막혀 PC03에 닿지 못한다',
}
const nodeIds = Object.keys(labels)
const noteIds = Object.keys(noteLabels)
const linkIds = ['link-12', 'link-23', 'link-34', 'link-41']
// 가는 선(한 방향 링크)은 늘 보이고, 화살표(데이터)는 시나리오를 골랐을 때만 보인다.
const pathEnds: Record<string, [string, string]> = {
  'link-12': ['pc01', 'pc02'],
  'link-23': ['pc02', 'pc03'],
  'link-34': ['pc03', 'pc04'],
  'link-41': ['pc04', 'pc01'],
  'hop-12': ['pc01', 'pc02'],
  'hop-23': ['pc02', 'pc03'],
}
const tallPaths: Record<string, string> = {
  'link-12': 'M88 24 H192',
  'link-23': 'M224 40 V120',
  'link-34': 'M192 136 H88',
  'link-41': 'M56 120 V40',
  'hop-12': 'M88 24 H192',
  'hop-23': 'M224 40 V120',
}
const widePaths: Record<string, string> = {
  'link-12': 'M128 24 H312',
  'link-23': 'M344 40 V104',
  'link-34': 'M312 120 H128',
  'link-41': 'M96 104 V40',
  'hop-12': 'M128 24 H312',
  'hop-23': 'M344 40 V104',
}

const question = '링에서 데이터는 어떤 길로 목적지에 닿을까?'
const figureName = 'PC01→PC02→PC03→PC04→PC01 차례로 한 방향으로 도는 고리에서, PC01이 PC03에게 보낸 데이터가 PC02를 거쳐 가는 모습과, PC02가 고장 났을 때 데이터가 어디서 멈추는지를 보이는 도식'
const svgName = '왼쪽 위 PC01, 오른쪽 위 PC02, 오른쪽 아래 PC03, 왼쪽 아래 PC04를 사각형 둘레에 놓고 한 방향 링크 넷으로 이어 고리를 만든 그림'
const idleCaption = 'PC01~PC04가 링크 넷으로 이어져 고리를 이루고 있다. 데이터는 PC01 → PC02 → PC03 → PC04 → PC01 차례로 한 방향으로만 돈다. PC01~PC04는 예로 붙인 이름이다. 버튼으로 장면을 고르면 PC01이 PC03에게 보낸 데이터가 가는 길을 볼 수 있다.'
const legend = '가는 선은 한 노드에서 다음 노드로 가는 한 방향 링크이고, 화살표는 PC01이 PC03에게 보낸 데이터가 가는 쪽이다.'
const expectedScenarios = [
  {
    id: 'pass', label: '차례로 거쳐',
    nodes: ['pc01', 'pc02', 'pc03', 'pc04'],
    links: linkIds,
    paths: ['hop-12', 'hop-23'],
    notes: ['dir-note', 'pass-note'],
    caption: 'PC01이 PC03에게 보낸 데이터는 먼저 다음 노드인 PC02에 닿는다. PC02는 목적지가 아니지만 받은 신호를 다시 내보내 PC03으로 넘기고, 목적지인 PC03이 데이터를 받는다. 링크가 한 방향이라 PC04 쪽으로는 가지 않는다.',
  },
  {
    id: 'break', label: '노드 하나의 고장',
    nodes: ['pc01', 'pc03', 'pc04'],
    links: ['link-12', 'link-34', 'link-41'],
    paths: ['hop-12'],
    notes: ['dir-note', 'break-note'],
    caption: 'PC02가 고장 나 받은 신호를 다시 내보내지 못하면, PC01이 보낸 데이터는 PC02에서 멈춰 PC03에 닿지 못한다. 링크가 한 방향이라 반대쪽으로 돌아갈 길도 없어, 고리가 그 자리에서 끊긴 셈이 된다.',
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
const linkOpacity = (id: string) => svg().querySelector(`[data-link="${id}"]`)!.getAttribute('opacity')

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
    render(<RingPassDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 링크가 모두 선명하고 화살표 없이 도는 방향 곁말과 선택 안내가 나온다', () => {
    const { container } = render(<RingPassDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(shownLinks()).toEqual(linkIds)
    for (const link of svg().querySelectorAll('[data-link]')) {
      expect(link).toHaveAttribute('opacity', '1')
      expect(link).toHaveAttribute('d', paths[link.getAttribute('data-link')!])
      expect(link).toHaveClass('stroke-muted')
      expect(link).not.toHaveAttribute('marker-end')
    }
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual(['dir-note'])
    expect(note('dir-note').textContent).toBe(noteLabels['dir-note'])
    expect(svg().querySelector('[data-group]')).toBeNull()
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·링크·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<RingPassDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    for (const id of linkIds) expect(svg().querySelector(`[data-link="${id}"]`), id).toHaveAttribute('opacity', scenario.links.includes(id) ? '1' : '0.25')
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
    render(<RingPassDiagram />)
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
    // 도는 방향 곁말은 고리 가운데의 빈자리에, 장면 곁말은 그림 아래의 빈 줄에 들어간다. 노드와는 위아래 4 이상 띄우고 선에 닿지 않는다.
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
    // 도는 방향 곁말은 네 노드가 둘러싼 고리 안쪽에 있다.
    const dir = noteBoxes.get('dir-note')!
    expect(dir.x).toBeGreaterThan(nodeBox('pc01').x + nodeBox('pc01').width)
    expect(dir.x + dir.width).toBeLessThan(nodeBox('pc02').x)
    expect(dir.y).toBeGreaterThan(nodeBox('pc01').y + nodeBox('pc01').height)
    expect(dir.y + dir.height).toBeLessThan(nodeBox('pc04').y)
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('선은 앞 노드의 변에서 시작해 뒤 노드의 변에서 끝나고, 노드 안을 지나지 않으며 링크끼리·한 장면의 화살표끼리 겹치지 않는다', () => {
    render(<RingPassDiagram />)
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

  // 요점: 링크 넷이 PC01 → PC02 → PC03 → PC04 → PC01의 한 방향 고리를 이룬다(노드마다 들어오는 링크 하나·나가는 링크 하나).
  // 차례로 거쳐에서는 보이는 화살표가 PC01 → PC02 → PC03으로 끊김 없이 이어지고 PC04를 지나지 않는다.
  // 노드 하나의 고장에서는 PC02가 흐려지고 PC03으로 들어가는 화살표가 없다.
  it('데이터는 고리를 따라 PC02를 거쳐 PC03에 닿고, PC02가 고장 나면 PC03에 닿지 못한다', async () => {
    render(<RingPassDiagram />)
    const ends = (id: string) => [endpointNode(lineEnds(paths[id]).start), endpointNode(lineEnds(paths[id]).end)]

    const linkEnds = linkIds.map(ends)
    expect(linkEnds).toEqual([['pc01', 'pc02'], ['pc02', 'pc03'], ['pc03', 'pc04'], ['pc04', 'pc01']])
    for (const id of nodeIds) {
      expect(linkEnds.filter(([from]) => from === id), `${id} 나감`).toHaveLength(1)
      expect(linkEnds.filter(([, to]) => to === id), `${id} 들어옴`).toHaveLength(1)
    }

    await select('차례로 거쳐')
    const passChain = shownPaths().map(ends)
    expect(passChain[0][0]).toBe('pc01')
    expect(passChain[passChain.length - 1][1]).toBe('pc03')
    for (let index = 1; index < passChain.length; index += 1) expect(passChain[index][0]).toBe(passChain[index - 1][1])
    for (const pair of passChain) expect(pair, pair.join(' → ')).not.toContain('pc04')
    expect(passChain.map(([from]) => from)).toContain('pc02')

    await select('노드 하나의 고장')
    expect(opacity('pc02')).toBe('0.25')
    expect(linkOpacity('link-23')).toBe('0.25')
    for (const id of ['pc01', 'pc03', 'pc04']) expect(opacity(id), id).toBe('1')
    const breakChain = shownPaths().map(ends)
    expect(breakChain).toEqual([['pc01', 'pc02']])
    for (const [, to] of breakChain) expect(to).not.toBe('pc03')

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const phrase of ['`PC01`→`PC02`→`PC03`→`PC04`→`PC01`', '받은 신호를 다시 내보내 `PC03`으로 넘긴다', '`PC02`가 고장 나', '한 방향', '예로 붙인 이름']) {
      expect(body, phrase).toContain(phrase)
    }
  })
}

describe('RingPassDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<RingPassDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 188')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      await select('노드 하나의 고장')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 172')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(screen.getByRole('button', { name: '노드 하나의 고장' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      expect(shownLinks()).toEqual(linkIds)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><RingPassDiagram /><RingPassDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '차례로 거쳐' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<RingPassDiagram />)
    const text = visualsByTopicId[topicId].diagrams['ring-pass']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(ringPassScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = ringPassScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual([...expected.nodes, ...expected.links])
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 링형 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
