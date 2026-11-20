import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { TunnelEncapsulationDiagram, tunnelEncapsulationScenarios } from './TunnelEncapsulationDiagram'

const topicId = 'network-security'
const anchorConceptId = `${topicId}.tunneling`
const innerHeader = '10.1.0.5 → 10.2.0.7'
const outerHeader = '192.0.2.1 → 203.0.113.1'
const labels: Record<string, string> = {
  'orig-inner': innerHeader,
  'orig-data': '데이터',
  'vpngw1': 'VPNGW1 192.0.2.1',
  'wrap-outer': outerHeader,
  'wrap-inner': innerHeader,
  'wrap-data': '데이터',
  'vpngw2': 'VPNGW2 203.0.113.1',
  'out-inner': innerHeader,
  'out-data': '데이터',
}
const groupLabels: Record<string, string> = {
  'hq': '본사 10.1.0.0/24',
  'internet': '인터넷',
  'branch': '지사 10.2.0.0/24',
}
// 원래 패킷은 본사 박스, 감싼 패킷은 인터넷 박스, 꺼낸 패킷은 지사 박스 안에 있고, 두 게이트웨이는 세 박스의 경계 밖에 선다.
const members: Record<string, string[]> = {
  'hq': ['orig-inner', 'orig-data'],
  'internet': ['wrap-outer', 'wrap-inner', 'wrap-data'],
  'branch': ['out-inner', 'out-data'],
}
const noteLabels: Record<string, string> = {
  'wrap-note': '바깥 IP 헤더를 붙인다',
  'cross-note': '바깥 헤더를 보고 넘긴다',
  'unwrap-note': '바깥 IP 헤더를 뗀다',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
// 화살표는 패킷이 가는 쪽이다. 앞 노드의 변에서 나가 뒤 노드의 변에서 끝난다. 패킷 줄의 어느 칸에서 나가고 들어가는지는 배치마다 다르다.
const tallPathEnds: Record<string, [string, string]> = {
  'orig-gw1': ['orig-inner', 'vpngw1'],
  'gw1-wrap': ['vpngw1', 'wrap-outer'],
  'wrap-gw2': ['wrap-inner', 'vpngw2'],
  'gw2-out': ['vpngw2', 'out-inner'],
}
const widePathEnds: Record<string, [string, string]> = {
  'orig-gw1': ['orig-data', 'vpngw1'],
  'gw1-wrap': ['vpngw1', 'wrap-outer'],
  'wrap-gw2': ['wrap-outer', 'vpngw2'],
  'gw2-out': ['vpngw2', 'out-data'],
}
const tallPaths: Record<string, string> = {
  'orig-gw1': 'M140 64 V96',
  'gw1-wrap': 'M140 128 V176',
  'wrap-gw2': 'M140 240 V280',
  'gw2-out': 'M140 312 V360',
}
const widePaths: Record<string, string> = {
  'orig-gw1': 'M208 48 H296',
  'gw1-wrap': 'M312 64 V84 H148 V120',
  'wrap-gw2': 'M148 152 V176 H360 V216',
  'gw2-out': 'M296 232 H208',
}

const question = '터널을 지나는 패킷은 어떻게 감싸일까?'
const figureName = '본사의 10.1.0.5가 지사의 10.2.0.7에 보낸 패킷을 VPNGW1이 바깥 IP 헤더 192.0.2.1 → 203.0.113.1로 감싸 인터넷 너머로 보내고, VPNGW2가 바깥 헤더를 떼어 원래 패킷을 꺼내는 차례를 보이는 도식'
const svgName = '본사 박스(원래 패킷), VPNGW1, 인터넷 박스(감싼 패킷), VPNGW2, 지사 박스(꺼낸 패킷)를 둔 그림'
const idleCaption = '본사 네트워크의 10.1.0.5가 지사 네트워크의 10.2.0.7에 패킷을 보낸다. 두 네트워크 사이에는 VPNGW1과 VPNGW2가 인터넷 너머로 맺은 터널이 있다. 버튼을 고르면 패킷이 터널에 담기고 꺼내지는 차례를 볼 수 있다.'
const legend = '칸 하나가 패킷의 한 부분이고, 「출발지 → 목적지」는 그 IP 헤더에 적힌 두 주소다. 바깥 IP 헤더는 원래 패킷 앞에 붙는데, 좁은 화면의 그림에서는 그 칸을 원래 패킷 위에 그렸다. 이 예의 터널은 패킷을 담기만 하고 암호화하지 않는다.'
const expectedScenarios = [
  {
    id: 'wrap', label: '감싸기',
    nodes: ['orig-inner', 'orig-data', 'vpngw1', 'wrap-outer', 'wrap-inner', 'wrap-data'],
    paths: ['orig-gw1', 'gw1-wrap'],
    notes: ['wrap-note'],
    caption: '본사의 10.1.0.5가 보낸 패킷이 VPNGW1에 닿으면, 터널의 입구인 VPNGW1이 그 패킷을 통째로 담고 앞에 바깥 IP 헤더를 붙인다. 바깥 헤더에는 터널 양 끝의 주소, 곧 출발지 192.0.2.1과 목적지 203.0.113.1이 적힌다.',
  },
  {
    id: 'cross', label: '인터넷 지나기',
    nodes: ['wrap-outer', 'wrap-inner', 'wrap-data', 'vpngw2'],
    paths: ['wrap-gw2'],
    notes: ['cross-note'],
    caption: '감싼 패킷이 인터넷을 지나는 동안 라우터들은 바깥 헤더의 목적지 203.0.113.1을 보고 패킷을 VPNGW2 쪽으로 넘긴다. 안쪽 헤더의 사설 주소 10.1.0.5와 10.2.0.7은 바뀌지 않고 그대로 실려 간다.',
  },
  {
    id: 'unwrap', label: '꺼내기',
    nodes: ['vpngw2', 'out-inner', 'out-data'],
    paths: ['gw2-out'],
    notes: ['unwrap-note'],
    caption: '터널의 출구인 VPNGW2가 바깥 헤더를 떼어 원래 패킷을 꺼내고, 안쪽 헤더의 목적지 10.2.0.7에 전한다. 10.2.0.7이 받은 패킷의 출발지는 처음 보낸 10.1.0.5 그대로다.',
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

// 보이는 화살표가 어느 노드의 변에서 시작하고 어느 노드의 변에서 끝나는지 그림에서 읽는다.
function endpointNodes(point: { x: number, y: number }) {
  return nodeIds.filter((id) => onEdge(point, nodeBox(id)))
}

// 그 노드가 어느 패킷 줄(그룹 박스)에 드는가. 게이트웨이는 어느 줄에도 들지 않는다.
function rowOf(id: string) {
  return groupIds.find((group) => members[group].includes(id)) ?? id
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 272] : [0, 0, 280, 408]
  const paths = wide ? widePaths : tallPaths
  const pathEnds = wide ? widePathEnds : tallPathEnds

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<TunnelEncapsulationDiagram />)
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
    const { container } = render(<TunnelEncapsulationDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<TunnelEncapsulationDiagram />)
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
    render(<TunnelEncapsulationDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const group of groupIds) {
        const inside = members[group].includes(id)
        expect(contains(groupBox(group), nodeBox(id)), `${id} ⊂ ${group}`).toBe(inside)
        if (!inside) expect(overlaps(groupBox(group), nodeBox(id)), `${id}는 ${group} 박스 밖`).toBe(false)
      }
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    for (const a of groupIds) for (const b of groupIds.filter((other) => other !== a)) expect(overlaps(groupBox(a), groupBox(b)), `${a} ↔ ${b}`).toBe(false)
    for (const id of groupIds) {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
    }
    // 곁말은 시나리오마다 하나이고 자리가 다르다. viewBox 안에 들어가고, 노드·그룹 박스·선과 겹치지 않는다.
    const noteBoxes: SvgBox[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      expect(shownNotes()).toHaveLength(1)
      for (const id of scenario.notes) noteBoxes.push(textBox(note(id), id))
    }
    expect([...noteBoxes.map(({ id }) => id)].sort()).toEqual([...noteIds].sort())
    expect(boxesOutsideViewBox(noteBoxes, viewBox)).toEqual([])
    for (const box of noteBoxes) {
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
      for (const group of groupIds) expect(overlaps(box, groupBox(group)), `${box.id} ↔ ${group}`).toBe(false)
      for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
      for (const other of noteBoxes.filter((otherBox) => otherBox.id !== box.id)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 앞 노드의 변에서 시작해 뒤 노드의 변에서 끝나고, 노드 안이나 그룹 라벨을 지나지 않으며 서로 겹치지 않는다', () => {
    render(<TunnelEncapsulationDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(pathEnds)))
    for (const [id, d] of Object.entries(paths)) {
      const { start, end } = lineEnds(d)
      expect(endpointNodes(start), `${id} 시작`).toEqual([pathEnds[id][0]])
      expect(endpointNodes(end), `${id} 끝`).toEqual([pathEnds[id][1]])
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
    }
    const ids = Object.keys(paths)
    for (const a of ids) for (const b of ids.filter((other) => other !== a)) {
      for (const sa of segments(paths[a])) for (const sb of segments(paths[b])) expect(collinearOverlap(sa, sb), `${a} ↔ ${b}`).toBe(false)
    }
  })

  // 요점: 바깥 헤더 칸은 감싸기·인터넷 지나기에서 선명하고 꺼내기에서는 흐리며, 꺼낸 패킷 줄에는 바깥 헤더 칸이 없다.
  // 안쪽 헤더 칸의 라벨은 원래·감싼·꺼낸 패킷에서 같다. 바깥 헤더 칸은 감싼 패킷의 안쪽 헤더 바로 앞(좁은 화면에서는 바로 위)에 붙고,
  // 화살표는 본사 박스 → VPNGW1 → 인터넷 박스 → VPNGW2 → 지사 박스 차례로 이어진다.
  it('터널은 원래 패킷을 바꾸지 않고 바깥 헤더로 감쌌다가 출구에서 떼어 낸다', async () => {
    render(<TunnelEncapsulationDiagram />)
    const outerCells = () => nodeIds.filter((id) => label(id) === outerHeader)
    expect(outerCells()).toEqual(['wrap-outer'])
    expect(new Set(['orig-inner', 'wrap-inner', 'out-inner'].map(label))).toEqual(new Set([innerHeader]))

    const inner = nodeBox('wrap-inner')
    const outer = nodeBox('wrap-outer')
    if (wide) {
      expect(outer.x + outer.width).toBe(inner.x)
      expect(outer.y).toBe(inner.y)
    } else {
      expect(outer.y + outer.height).toBe(inner.y)
      expect(outer.x).toBe(inner.x)
    }

    const hops: string[][] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of shownPaths()) {
        const { start, end } = lineEnds(paths[id])
        hops.push([rowOf(endpointNodes(start)[0]), rowOf(endpointNodes(end)[0])])
      }
      const lit = nodeIds.filter((id) => opacity(id) === '1')
      if (scenario.id === 'unwrap') {
        expect(opacity('wrap-outer')).toBe('0.25')
        expect(lit.map(label)).not.toContain(outerHeader)
        expect(members.branch.map(label)).not.toContain(outerHeader)
        for (const id of members.branch) expect(lit, id).toContain(id)
      } else {
        expect(opacity('wrap-outer'), scenario.id).toBe('1')
      }
    }
    expect(hops).toEqual([['hq', 'vpngw1'], ['vpngw1', 'internet'], ['internet', 'vpngw2'], ['vpngw2', 'branch']])

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const phrase of ['본사의 컴퓨터 `10.1.0.5`가 지사의 컴퓨터 `10.2.0.7`에', '`VPNGW1`(`192.0.2.1`)과 `VPNGW2`(`203.0.113.1`)가 터널의 두 끝', '출발지는 `192.0.2.1`, 목적지는 `203.0.113.1`이다', '바깥 헤더의 목적지 `203.0.113.1`을 보고', '바깥 헤더를 떼어 원래 패킷을 꺼내고']) {
      expect(body, phrase).toContain(phrase)
    }
  })
}

describe('TunnelEncapsulationDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<TunnelEncapsulationDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 408')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('인터넷 지나기')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 272')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '인터넷 지나기' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><TunnelEncapsulationDiagram /><TunnelEncapsulationDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '감싸기' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<TunnelEncapsulationDiagram />)
    const text = visualsByTopicId[topicId].diagrams['tunnel-encapsulation']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(tunnelEncapsulationScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = tunnelEncapsulationScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 터널링 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
