import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { MeshTreeLinksDiagram, meshTreeLinksScenarios } from './MeshTreeLinksDiagram'

const topicId = 'network-topology'
const anchorConceptId = `${topicId}.mesh-tree-topology`
const labels: Record<string, string> = {
  'm-pc01': 'PC01',
  'm-pc02': 'PC02',
  'm-pc03': 'PC03',
  'm-pc04': 'PC04',
  't-sw01': 'SW01',
  't-sw02': 'SW02',
  't-sw03': 'SW03',
  't-pc01': 'PC01',
  't-pc02': 'PC02',
  't-pc03': 'PC03',
  't-pc04': 'PC04',
}
const groupLabels: Record<string, string> = {
  'mesh': '완전 메시',
  'tree': '트리형',
}
// 완전 메시 박스에는 PC01~PC04가, 트리형 박스에는 SW01~SW03과 그 아래의 PC01~PC04가 들어 있다. 두 박스의 PC01~PC04는 서로 다른 노드다.
const members: Record<string, string[]> = {
  'mesh': ['m-pc01', 'm-pc02', 'm-pc03', 'm-pc04'],
  'tree': ['t-sw01', 't-sw02', 't-sw03', 't-pc01', 't-pc02', 't-pc03', 't-pc04'],
}
const noteLabels: Record<string, string> = {
  'full-mesh-note': '노드 쌍마다 링크가 하나씩, 모두 여섯이다',
  'mesh-cut-note': '끊긴 링크 대신 PC04를 거쳐 PC03에 닿는다',
  'tree-note': 'PC01에서 PC04로 가는 길은 하나뿐이다',
  'tree-cut-note': 'SW01에서 더 갈 길이 없어 PC01에 닿지 못한다',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
const meshLinkIds = ['m-12', 'm-13', 'm-14', 'm-23', 'm-24', 'm-34']
const treeLinkIds = ['t-sw01-sw02', 't-sw01-sw03', 't-sw02-pc01', 't-sw02-pc02', 't-sw03-pc03', 't-sw03-pc04']
const linkIds = [...meshLinkIds, ...treeLinkIds]
// 가는 선(링크)은 늘 보이고, 화살표(데이터)는 시나리오를 골랐을 때만 링크 위에 겹쳐 보인다.
const pathEnds: Record<string, [string, string]> = {
  'm-12': ['m-pc01', 'm-pc02'],
  'm-13': ['m-pc01', 'm-pc03'],
  'm-14': ['m-pc01', 'm-pc04'],
  'm-23': ['m-pc02', 'm-pc03'],
  'm-24': ['m-pc02', 'm-pc04'],
  'm-34': ['m-pc03', 'm-pc04'],
  't-sw01-sw02': ['t-sw01', 't-sw02'],
  't-sw01-sw03': ['t-sw01', 't-sw03'],
  't-sw02-pc01': ['t-sw02', 't-pc01'],
  't-sw02-pc02': ['t-sw02', 't-pc02'],
  't-sw03-pc03': ['t-sw03', 't-pc03'],
  't-sw03-pc04': ['t-sw03', 't-pc04'],
  'm-hop-14': ['m-pc01', 'm-pc04'],
  'm-hop-43': ['m-pc04', 'm-pc03'],
  't-hop-pc01-sw02': ['t-pc01', 't-sw02'],
  't-hop-sw02-sw01': ['t-sw02', 't-sw01'],
  't-hop-sw01-sw03': ['t-sw01', 't-sw03'],
  't-hop-sw03-pc04': ['t-sw03', 't-pc04'],
  't-cut-pc04-sw03': ['t-pc04', 't-sw03'],
  't-cut-sw03-sw01': ['t-sw03', 't-sw01'],
}
const tallPaths: Record<string, string> = {
  'm-12': 'M112 48 H168',
  'm-13': 'M72 64 V112',
  'm-14': 'M96 64 V88 H184 V112',
  'm-23': 'M224 48 H248 V160 H84 V144',
  'm-24': 'M208 64 V112',
  'm-34': 'M112 128 H168',
  't-sw01-sw02': 'M112 220 H52 V252',
  't-sw01-sw03': 'M168 220 H228 V252',
  't-sw02-pc01': 'M52 284 V300',
  't-sw02-pc02': 'M80 268 H96 V364 H80',
  't-sw03-pc03': 'M228 284 V300',
  't-sw03-pc04': 'M200 268 H184 V364 H200',
  'm-hop-14': 'M96 64 V88 H184 V112',
  'm-hop-43': 'M168 128 H112',
  't-hop-pc01-sw02': 'M52 300 V284',
  't-hop-sw02-sw01': 'M52 252 V220 H112',
  't-hop-sw01-sw03': 'M168 220 H228 V252',
  't-hop-sw03-pc04': 'M200 268 H184 V364 H200',
  't-cut-pc04-sw03': 'M200 364 H184 V268 H200',
  't-cut-sw03-sw01': 'M228 252 V220 H168',
}
const widePaths: Record<string, string> = {
  'm-12': 'M96 48 H128',
  'm-13': 'M56 64 V112',
  'm-14': 'M80 64 V88 H144 V112',
  'm-23': 'M184 48 H196 V160 H68 V144',
  'm-24': 'M168 64 V112',
  'm-34': 'M96 128 H128',
  't-sw01-sw02': 'M312 64 V76 H272 V88',
  't-sw01-sw03': 'M336 64 V76 H376 V88',
  't-sw02-pc01': 'M258 120 V144',
  't-sw02-pc02': 'M286 120 V144',
  't-sw03-pc03': 'M362 120 V144',
  't-sw03-pc04': 'M390 120 V144',
  'm-hop-14': 'M80 64 V88 H144 V112',
  'm-hop-43': 'M128 128 H96',
  't-hop-pc01-sw02': 'M258 144 V120',
  't-hop-sw02-sw01': 'M272 88 V76 H312 V64',
  't-hop-sw01-sw03': 'M336 64 V76 H376 V88',
  't-hop-sw03-pc04': 'M390 120 V144',
  't-cut-pc04-sw03': 'M390 144 V120',
  't-cut-sw03-sw01': 'M376 88 V76 H336 V64',
}

const question = '메시형과 트리형은 노드를 어떻게 이을까?'
const figureName = '노드 넷을 모든 쌍마다 링크로 바로 이은 완전 메시와, 스위치 셋 아래로 노드 넷이 가지를 친 트리형을 나란히 놓고, 링크 하나가 끊겼을 때 데이터가 다른 길로 가는지 견주는 도식'
const svgName = '「완전 메시」 박스에 PC01~PC04를 네 귀퉁이에 놓고 링크 여섯으로 서로 잇고, 「트리형」 박스에 SW01 아래로 SW02·SW03을, 그 아래로 PC01~PC04를 이은 그림'
const idleCaption = '완전 메시 박스에는 PC01~PC04 네 노드가 쌍마다 링크 하나로 이어져 있고, 트리형 박스에는 SW01 아래로 SW02·SW03이, 그 아래로 PC01~PC04가 이어져 있다. 두 박스의 PC01~PC04는 서로 다른 예이고, 노드 이름은 예로 붙인 것이다. 버튼으로 장면을 고르면 링크가 놓인 모양과, 링크 하나가 끊겼을 때 데이터가 가는 길을 볼 수 있다.'
const legend = '가는 선은 두 노드를 잇는 링크이고, 굵은 화살표는 데이터가 가는 쪽이다. 장면에서 고른 박스 안의 흐린 선은 끊긴 링크다.'
const expectedScenarios = [
  {
    id: 'full-mesh', label: '완전 메시',
    nodes: members.mesh,
    links: meshLinkIds,
    paths: [] as string[],
    notes: ['full-mesh-note'],
    caption: '완전 메시는 PC01~PC04의 모든 노드 쌍을 저마다 링크 하나로 바로 잇는다. 노드 넷이면 쌍이 여섯이라 링크도 4×3÷2=6개이고, 어느 두 노드든 다른 노드를 거치지 않고 주고받는다.',
  },
  {
    id: 'mesh-cut', label: '메시에서 끊기면',
    nodes: members.mesh,
    links: ['m-12', 'm-14', 'm-23', 'm-24', 'm-34'],
    paths: ['m-hop-14', 'm-hop-43'],
    notes: ['mesh-cut-note'],
    caption: 'PC01과 PC03 사이의 링크가 끊겨도, PC01이 PC03에게 보내는 데이터는 PC04에 먼저 닿고 PC04가 받아 PC03으로 넘겨 준다. 길이 여럿이라 링크 하나가 끊겨도 다른 노드를 거쳐 가는 길이 남는다.',
  },
  {
    id: 'tree', label: '트리형',
    nodes: members.tree,
    links: treeLinkIds,
    paths: ['t-hop-pc01-sw02', 't-hop-sw02-sw01', 't-hop-sw01-sw03', 't-hop-sw03-pc04'],
    notes: ['tree-note'],
    caption: '트리형은 SW01에서 아래로 가지를 친다. 노드가 일곱이니 링크는 여섯이고 고리가 없어, PC01이 PC04에게 보낸 데이터는 SW02, SW01, SW03을 차례로 거치는 길 하나로만 간다.',
  },
  {
    id: 'tree-cut', label: '트리에서 끊기면',
    nodes: members.tree,
    links: ['t-sw01-sw03', 't-sw02-pc01', 't-sw02-pc02', 't-sw03-pc03', 't-sw03-pc04'],
    paths: ['t-cut-pc04-sw03', 't-cut-sw03-sw01'],
    notes: ['tree-cut-note'],
    caption: 'SW01과 SW02 사이의 링크가 끊기면, PC04가 PC01에게 보낸 데이터는 SW03을 거쳐 SW01까지 가지만 더 갈 길이 없어 PC01에 닿지 못한다. 돌아갈 다른 길이 없기 때문이다. PC01과 PC02는 SW02를 거쳐 서로는 주고받는다.',
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
const shownLinks = () => Array.from(svg().querySelectorAll('[data-link]'), (link) => link.getAttribute('data-link')!)
const clearLinks = () => shownLinks().filter((id) => svg().querySelector(`[data-link="${id}"]`)!.getAttribute('opacity') === '1')
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note')!)
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)!
const opacity = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')
const clearNodes = () => nodeIds.filter((id) => opacity(id) === '1')

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

// 선이 어느 노드의 변에서 시작하고 어느 노드의 변에서 끝나는지 그림에서 읽는다.
function endpointNode(point: { x: number, y: number }) {
  return nodeIds.find((id) => onEdge(point, nodeBox(id)))
}

// 선명한 링크만 따라가서 start에서 닿는 노드를 모은다.
function reachable(start: string, links: string[], paths: Record<string, string>) {
  const edges = links.map((id) => [endpointNode(lineEnds(paths[id]).start)!, endpointNode(lineEnds(paths[id]).end)!])
  const seen = new Set([start])
  let grew = true
  while (grew) {
    grew = false
    for (const [a, b] of edges) {
      if (seen.has(a) && !seen.has(b)) { seen.add(b); grew = true }
      if (seen.has(b) && !seen.has(a)) { seen.add(a); grew = true }
    }
  }
  return seen
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 208] : [0, 0, 280, 412]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<MeshTreeLinksDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 링크가 모두 선명하고 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<MeshTreeLinksDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(shownLinks()).toEqual(linkIds)
    for (const link of svg().querySelectorAll('[data-link]')) {
      expect(link).toHaveAttribute('opacity', '1')
      expect(link).toHaveAttribute('d', paths[link.getAttribute('data-link')!])
      expect(link).toHaveClass('stroke-muted')
      expect(link).not.toHaveAttribute('marker-end')
    }
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·링크·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<MeshTreeLinksDiagram />)
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
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·그룹 라벨·곁말이 자리에 들어간다`, async () => {
    render(<MeshTreeLinksDiagram />)
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
    for (const id of groupIds) {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
    }
    for (const a of groupIds) for (const b of groupIds.filter((other) => other !== a)) expect(overlaps(groupBox(a), groupBox(b)), `${a} ↔ ${b}`).toBe(false)
    // 곁말은 그림 아래의 빈 줄에 들어가고, 노드·그룹 박스·선과 겹치지 않는다. 노드와는 위아래 4 이상 띄운다.
    const noteBoxes: SvgBox[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of scenario.notes) noteBoxes.push(textBox(note(id), id))
    }
    expect([...noteBoxes.map(({ id }) => id)].sort()).toEqual([...noteIds].sort())
    expect(boxesOutsideViewBox(noteBoxes, viewBox)).toEqual([])
    for (const box of noteBoxes) {
      for (const node of nodeIds) {
        const nodeArea = nodeBox(node)
        expect(overlaps(box, { ...nodeArea, y: nodeArea.y - 4, height: nodeArea.height + 8 }), `${box.id} ↔ ${node}`).toBe(false)
      }
      for (const group of groupIds) expect(overlaps(box, groupBox(group)), `${box.id} ↔ ${group}`).toBe(false)
      for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('선은 앞 노드의 변에서 시작해 뒤 노드의 변에서 끝나고, 노드 안이나 그룹 라벨을 지나지 않으며 링크끼리·한 장면의 화살표끼리 겹치지 않는다', () => {
    render(<MeshTreeLinksDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(pathEnds)))
    for (const [id, d] of Object.entries(paths)) {
      const { start, end } = lineEnds(d)
      expect(onEdge(start, nodeBox(pathEnds[id][0])), `${id} 시작`).toBe(true)
      expect(onEdge(end, nodeBox(pathEnds[id][1])), `${id} 끝`).toBe(true)
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
    }
    for (const a of linkIds) for (const b of linkIds.filter((other) => other !== a)) {
      for (const sa of segments(paths[a])) for (const sb of segments(paths[b])) expect(collinearOverlap(sa, sb), `${a} ↔ ${b}`).toBe(false)
    }
    // 화살표는 자기 링크 위에 겹쳐 그리므로, 겹침은 한 장면 안의 화살표끼리만 본다.
    for (const scenario of expectedScenarios) {
      for (const a of scenario.paths) for (const b of scenario.paths.filter((other) => other !== a)) {
        for (const sa of segments(paths[a])) for (const sb of segments(paths[b])) expect(collinearOverlap(sa, sb), `${a} ↔ ${b}`).toBe(false)
      }
    }
  })

  // 요점: 완전 메시에서는 선명한 링크가 여섯이고 메시 노드 넷의 모든 쌍이 링크 하나씩으로 이어진다.
  // 트리형에서는 선명한 링크 수가 선명한 노드 수 − 1이다(고리 없음). 링크 하나가 끊기면 메시는 네 노드가 여전히 이어져 있고
  // 화살표가 끊긴 링크를 비켜 PC04를 거쳐 PC03에 닿지만, 트리는 SW01 쪽에서 SW02 아래로 가는 길이 사라져 화살표가 SW01에서 멈춘다.
  it('완전 메시는 모든 쌍을 잇고 끊겨도 다른 길이 남지만, 트리는 길이 하나뿐이라 끊기면 그 아래와 떨어진다', async () => {
    render(<MeshTreeLinksDiagram />)
    const ends = (id: string) => [endpointNode(lineEnds(paths[id]).start)!, endpointNode(lineEnds(paths[id]).end)!]
    const pairKey = (pair: string[]) => [...pair].sort().join('|')

    await select('완전 메시')
    const meshLinks = clearLinks()
    expect(meshLinks).toHaveLength(6)
    const meshPairs = meshLinks.map((id) => pairKey(ends(id)))
    for (let i = 0; i < members.mesh.length; i += 1) {
      for (let j = i + 1; j < members.mesh.length; j += 1) {
        const key = pairKey([members.mesh[i], members.mesh[j]])
        expect(meshPairs.filter((pair) => pair === key), key).toHaveLength(1)
      }
    }

    await select('트리형')
    const treeNodes = clearNodes()
    const treeLinks = clearLinks()
    expect(treeLinks).toHaveLength(treeNodes.length - 1)
    expect(reachable('t-sw01', treeLinks, paths)).toEqual(new Set(members.tree))
    const treeChain = shownPaths().map(ends)
    expect(treeChain[0][0]).toBe('t-pc01')
    expect(treeChain[treeChain.length - 1][1]).toBe('t-pc04')
    for (let index = 1; index < treeChain.length; index += 1) expect(treeChain[index][0]).toBe(treeChain[index - 1][1])

    await select('메시에서 끊기면')
    const meshCutLinks = clearLinks()
    expect(meshCutLinks.map((id) => pairKey(ends(id)))).not.toContain(pairKey(['m-pc01', 'm-pc03']))
    expect(reachable('m-pc01', meshCutLinks, paths)).toEqual(new Set(members.mesh))
    const meshCutChain = shownPaths().map(ends)
    expect(meshCutChain).toEqual([['m-pc01', 'm-pc04'], ['m-pc04', 'm-pc03']])

    await select('트리에서 끊기면')
    const treeCutLinks = clearLinks()
    expect(treeCutLinks.map((id) => pairKey(ends(id)))).not.toContain(pairKey(['t-sw01', 't-sw02']))
    const fromTop = reachable('t-sw01', treeCutLinks, paths)
    for (const id of ['t-sw02', 't-pc01', 't-pc02']) expect(fromTop.has(id), id).toBe(false)
    expect(reachable('t-pc01', treeCutLinks, paths)).toEqual(new Set(['t-sw02', 't-pc01', 't-pc02']))
    const treeCutChain = shownPaths().map(ends)
    expect(treeCutChain[0][0]).toBe('t-pc04')
    expect(treeCutChain[treeCutChain.length - 1][1]).toBe('t-sw01')
    for (const [, to] of treeCutChain) expect(['t-sw02', 't-pc01', 't-pc02']).not.toContain(to)

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const phrase of ['4×3÷2=6', '`PC04`가 받아 `PC03`으로 넘겨 준다', '노드가 일곱이니 링크는 여섯이다', '`SW01`에서 더 갈 길이 없어 `PC01`에 닿지 못한다', '예로 붙인 이름']) {
      expect(body, phrase).toContain(phrase)
    }
  })
}

describe('MeshTreeLinksDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<MeshTreeLinksDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 412')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('트리에서 끊기면')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 208')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '트리에서 끊기면' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      expect(shownLinks()).toEqual(linkIds)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><MeshTreeLinksDiagram /><MeshTreeLinksDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '트리형' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<MeshTreeLinksDiagram />)
    const text = visualsByTopicId[topicId].diagrams['mesh-tree-links']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(meshTreeLinksScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = meshTreeLinksScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual([...expected.nodes, ...expected.links])
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 메시형과 트리형 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
