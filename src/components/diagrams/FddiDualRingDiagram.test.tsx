import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { FddiDualRingDiagram, fddiDualRingScenarios } from './FddiDualRingDiagram'

const topicId = 'network-topology'
const anchorConceptId = `${topicId}.fddi`
const labels: Record<string, string> = {
  'a': 'A',
  'b': 'B',
  'c': 'C',
  'd': 'D',
}
const noteLabels: Record<string, string> = {
  'normal-center': '1차 링으로 돈다',
  'normal-note': '2차 링은 반대 방향으로 도는 고리다',
  'wrap-center': 'B와 C가 두 링을 잇는다',
  'wrap-break': '끊김',
  'wrap-note': '끊긴 곳 양쪽에서 두 링이 고리 하나로 이어진다',
}
// 고리 안쪽에 두는 곁말, 끊긴 링크 곁에 두는 곁말, 그림 아래의 빈 줄에 두는 곁말.
const centerNoteIds = ['normal-center', 'wrap-center']
const breakNoteIds = ['wrap-break']
const nodeIds = Object.keys(labels)
const noteIds = Object.keys(noteLabels)
// 가는 선(한 방향 링크) 여덟은 늘 보인다. 안쪽 넷이 1차 링(A→B→C→D→A), 바깥쪽 넷이 2차 링(A→D→C→B→A)이다.
const primaryLinkIds = ['p-ab', 'p-bc', 'p-cd', 'p-da']
const secondaryLinkIds = ['s-ba', 's-cb', 's-dc', 's-ad']
const linkIds = [...primaryLinkIds, ...secondaryLinkIds]
// 끊긴 뒤 장면에서 흐려지는 링크 — B와 C 사이의 두 링크.
const brokenLinkIds = ['p-bc', 's-cb']
// 굵은 화살표(데이터가 도는 길)는 시나리오를 골랐을 때만 보인다. 래핑 화살표는 한 노드의 변에서 나가 같은 노드의 변으로 돌아온다.
const pathEnds: Record<string, [string, string]> = {
  'p-ab': ['a', 'b'],
  'p-bc': ['b', 'c'],
  'p-cd': ['c', 'd'],
  'p-da': ['d', 'a'],
  's-ba': ['b', 'a'],
  's-cb': ['c', 'b'],
  's-dc': ['d', 'c'],
  's-ad': ['a', 'd'],
  'flow-p-ab': ['a', 'b'],
  'flow-p-bc': ['b', 'c'],
  'flow-p-cd': ['c', 'd'],
  'flow-p-da': ['d', 'a'],
  'flow-s-ba': ['b', 'a'],
  'flow-s-ad': ['a', 'd'],
  'flow-s-dc': ['d', 'c'],
  'wrap-b': ['b', 'b'],
  'wrap-c': ['c', 'c'],
}
const tallPaths: Record<string, string> = {
  'p-ab': 'M96 48 H184',
  'p-bc': 'M200 56 V152',
  'p-cd': 'M184 160 H96',
  'p-da': 'M80 152 V56',
  's-ba': 'M184 32 H96',
  's-cb': 'M224 152 V56',
  's-dc': 'M96 176 H184',
  's-ad': 'M56 56 V152',
  'flow-p-ab': 'M96 48 H184',
  'flow-p-bc': 'M200 56 V152',
  'flow-p-cd': 'M184 160 H96',
  'flow-p-da': 'M80 152 V56',
  'flow-s-ba': 'M184 32 H96',
  'flow-s-ad': 'M56 56 V152',
  'flow-s-dc': 'M96 176 H184',
  'wrap-b': 'M200 56 V68 H224 V56',
  'wrap-c': 'M224 152 V140 H200 V152',
}
const widePaths: Record<string, string> = {
  'p-ab': 'M152 48 H288',
  'p-bc': 'M304 56 V120',
  'p-cd': 'M288 128 H152',
  'p-da': 'M136 120 V56',
  's-ba': 'M288 32 H152',
  's-cb': 'M328 120 V56',
  's-dc': 'M152 144 H288',
  's-ad': 'M112 56 V120',
  'flow-p-ab': 'M152 48 H288',
  'flow-p-bc': 'M304 56 V120',
  'flow-p-cd': 'M288 128 H152',
  'flow-p-da': 'M136 120 V56',
  'flow-s-ba': 'M288 32 H152',
  'flow-s-ad': 'M112 56 V120',
  'flow-s-dc': 'M152 144 H288',
  'wrap-b': 'M304 56 V68 H328 V56',
  'wrap-c': 'M328 120 V108 H304 V120',
}

const question = 'FDDI는 링 한 곳이 끊겨도 어떻게 통신을 이어 갈까?'
const figureName = '노드 A~D를 1차 링과 반대 방향으로 도는 2차 링으로 이은 FDDI 이중 링에서, 평소 1차 링으로 데이터가 도는 모습과, B와 C 사이의 링크가 끊긴 뒤 B와 C가 두 링을 이어 고리 하나로 만드는 모습을 보이는 도식'
const svgName = '왼쪽 위 A, 오른쪽 위 B, 오른쪽 아래 C, 왼쪽 아래 D를 사각형 둘레에 놓고, 이웃한 두 노드 사이마다 안쪽의 1차 링 링크와 바깥쪽의 2차 링 링크를 둔 그림'
const idleCaption = '노드 A~D를 이중 링으로 이었다. 안쪽의 1차 링은 A → B → C → D → A 차례로 돌고, 바깥쪽의 2차 링은 그 반대로 돈다. A~D는 예로 붙인 이름이다. 버튼으로 장면을 고르면 평소와 링크가 끊긴 뒤에 데이터가 도는 길을 볼 수 있다.'
const legend = '가는 화살표는 한 노드에서 이웃 노드로 가는 한 방향 링크다. 안쪽 고리가 1차 링, 바깥쪽 고리가 2차 링이다. 굵은 화살표는 장면마다 데이터가 도는 길이다.'
const expectedScenarios = [
  {
    id: 'normal', label: '1차 링',
    nodes: ['a', 'b', 'c', 'd'],
    paths: ['flow-p-ab', 'flow-p-bc', 'flow-p-cd', 'flow-p-da'],
    notes: ['normal-center', 'normal-note'],
    faded: [] as string[],
    caption: '고장이 없을 때 데이터는 안쪽의 1차 링을 따라 A → B → C → D → A 차례로 돈다. MAC을 하나만 둔 노드는 대개 그 MAC을 1차 링에 두기 때문이다. 바깥쪽의 2차 링은 반대 방향으로 도는 고리로, 고장이 나면 끌어 쓰인다.',
  },
  {
    id: 'wrap', label: '끊긴 뒤',
    nodes: ['a', 'b', 'c', 'd'],
    paths: ['flow-p-ab', 'wrap-b', 'flow-s-ba', 'flow-s-ad', 'flow-s-dc', 'wrap-c', 'flow-p-cd', 'flow-p-da'],
    notes: ['wrap-center', 'wrap-break', 'wrap-note'],
    faded: brokenLinkIds,
    caption: 'B와 C 사이의 두 링크가 끊기면, B는 1차 링으로 받은 데이터를 2차 링으로 돌려 A 쪽으로 내보내고 C는 2차 링으로 받은 데이터를 1차 링으로 돌려 D 쪽으로 내보낸다. 두 링이 B와 C에서 이어져 A~D를 모두 지나는 고리 하나가 된다. 이것이 래핑이다.',
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
const linkOpacity = (id: string) => svg().querySelector(`[data-link="${id}"]`)!.getAttribute('opacity')
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note')!)
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)!
const opacity = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')
const clearNodes = () => nodeIds.filter((id) => opacity(id) === '1')
// 링크의 가는 화살표는 회색(fill-muted) 마커를, 데이터의 굵은 화살표는 fill-title 마커를 쓴다.
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 184] : [0, 0, 280, 216]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<FddiDualRingDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 링크 여덟이 모두 선명하고 굵은 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<FddiDualRingDiagram />)
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

  it.each(expectedScenarios)('$label: 고른 화살표·곁말만 보이고 끊긴 링크만 흐려진다', async (scenario) => {
    const { container } = render(<FddiDualRingDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownLinks()).toEqual(linkIds)
    for (const id of linkIds) {
      if (scenario.faded.includes(id)) expect(linkOpacity(id), id).toBe('0.25')
      else expect(svg().querySelector(`[data-link="${id}"]`), id).not.toHaveAttribute('opacity')
    }
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
    render(<FddiDualRingDiagram />)
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
    // 곁말은 노드와 위아래 4 이상 띄우고 어떤 선에도 닿지 않는다.
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
    // 고리 안쪽 = 1차 링의 왼쪽 링크(D → A)와 오른쪽 링크(B → C) 사이, 위 링크(A → B)와 아래 링크(C → D) 사이.
    const ring = { left: segments(paths['p-da'])[0].x1, right: segments(paths['p-bc'])[0].x1, top: segments(paths['p-ab'])[0].y1, bottom: segments(paths['p-cd'])[0].y1 }
    for (const id of centerNoteIds) {
      const box = noteBoxes.get(id)!
      expect(box.x, id).toBeGreaterThan(ring.left)
      expect(box.x + box.width, id).toBeLessThan(ring.right)
      expect(box.y, id).toBeGreaterThan(ring.top)
      expect(box.y + box.height, id).toBeLessThan(ring.bottom)
    }
    // 「끊김」은 B와 C 사이의 두 링크 바깥쪽, 두 노드 사이의 높이에 놓인다.
    for (const id of breakNoteIds) {
      const box = noteBoxes.get(id)!
      expect(box.x, id).toBeGreaterThan(segments(paths['s-cb'])[0].x1)
      expect(box.y, id).toBeGreaterThan(nodeBox('b').y + nodeBox('b').height)
      expect(box.y + box.height, id).toBeLessThan(nodeBox('c').y)
    }
    for (const id of noteIds.filter((noteId) => !centerNoteIds.includes(noteId) && !breakNoteIds.includes(noteId))) {
      expect(noteBoxes.get(id)!.y, id).toBeGreaterThan(nodeBox('c').y + nodeBox('c').height)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('선은 노드의 변에서 시작하고 끝나며, 노드 안을 지나지 않고 링크끼리·한 장면의 화살표끼리 겹치지 않는다', () => {
    render(<FddiDualRingDiagram />)
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

  // 요점: 1차 링 장면에서는 굵은 화살표가 1차 링 링크 위로만 A → B → C → D → A를 끊김 없이 돌고, 2차 링 링크 위의 화살표는 없다.
  // 끊긴 뒤 장면에서는 B와 C 사이를 잇는 화살표가 없고 그 사이의 두 링크가 흐려진다. 그래도 보이는 화살표를 차례로 따라가면
  // A·B·C·D를 모두 지나 처음 노드로 돌아오는 고리 하나가 되고, B와 C에서는 화살표가 같은 노드로 돌아와 두 링을 잇는다.
  it('평소에는 1차 링만 돌고, 끊긴 뒤에는 B와 C가 두 링을 이어 네 노드를 모두 지나는 고리 하나가 된다', async () => {
    render(<FddiDualRingDiagram />)
    const ends = (id: string) => [endpointNode(lineEnds(paths[id]).start), endpointNode(lineEnds(paths[id]).end)]
    expect(primaryLinkIds.map(ends)).toEqual([['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'a']])
    expect(secondaryLinkIds.map(ends)).toEqual([['b', 'a'], ['c', 'b'], ['d', 'c'], ['a', 'd']])
    const followsLoop = (route: (string | undefined)[][]) => {
      for (let index = 1; index < route.length; index += 1) expect(route[index][0]).toBe(route[index - 1][1])
      expect(route[route.length - 1][1]).toBe(route[0][0])
    }

    await select('1차 링')
    const normal = shownPaths()
    expect(normal.map(ends)).toEqual([['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'a']])
    followsLoop(normal.map(ends))
    for (const id of normal) expect(primaryLinkIds.map((link) => paths[link]), id).toContain(paths[id])
    for (const id of normal) expect(secondaryLinkIds.map((link) => paths[link]), id).not.toContain(paths[id])
    const normalSeen = JSON.stringify([clearNodes(), normal, shownNotes()])

    await select('끊긴 뒤')
    const wrap = shownPaths()
    const route = wrap.map(ends)
    for (const [from, to] of route) expect([from, to].sort().join(), `${from} → ${to}`).not.toBe('b,c')
    for (const id of brokenLinkIds) expect(linkOpacity(id), id).toBe('0.25')
    followsLoop(route)
    expect(new Set(route.flat())).toEqual(new Set(nodeIds))
    expect(ends('wrap-b')).toEqual(['b', 'b'])
    expect(ends('wrap-c')).toEqual(['c', 'c'])
    expect(wrap).toContain('wrap-b')
    expect(wrap).toContain('wrap-c')
    // B에서는 1차 링으로 들어온 데이터가 2차 링으로 나가고, C에서는 2차 링으로 들어온 데이터가 1차 링으로 나간다.
    expect(wrap[wrap.indexOf('wrap-b') - 1]).toBe('flow-p-ab')
    expect(wrap[wrap.indexOf('wrap-b') + 1]).toBe('flow-s-ba')
    expect(wrap[wrap.indexOf('wrap-c') - 1]).toBe('flow-s-dc')
    expect(wrap[wrap.indexOf('wrap-c') + 1]).toBe('flow-p-cd')
    expect(JSON.stringify([clearNodes(), wrap, shownNotes()])).not.toBe(normalSeen)

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const phrase of ['1차 링(primary ring)', '2차 링(secondary ring)', '도는 방향이 서로 반대', '래핑(wrapping)', 'MAC을 하나만 둔 노드는 대개 그 MAC을 1차 링에 두므로', '`B`는 1차 링으로 받은 데이터를', '2차 링으로 돌려 `A` 쪽으로 내보낸다', '1차 링으로 돌려 `D` 쪽으로 내보낸다', '네 노드를 모두 지나는 고리 하나', '예로 붙인 이름']) {
      expect(body, phrase).toContain(phrase)
    }
  })
}

describe('FddiDualRingDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<FddiDualRingDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 216')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      await select('끊긴 뒤')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 184')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(screen.getByRole('button', { name: '끊긴 뒤' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      expect(shownLinks()).toEqual(linkIds)
      for (const id of brokenLinkIds) expect(linkOpacity(id), id).toBe('0.25')
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><FddiDualRingDiagram /><FddiDualRingDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '1차 링' })) })
      const titleMarker = Array.from(figure.querySelectorAll('marker')).find((marker) => marker.querySelector('path')!.classList.contains('fill-title'))!
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${titleMarker.id})`)
    }
    const markerIds = figures.flatMap((figure) => Array.from(figure.querySelectorAll('marker'), (marker) => marker.id))
    expect(markerIds).toHaveLength(4)
    expect(new Set(markerIds).size).toBe(4)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<FddiDualRingDiagram />)
    const text = visualsByTopicId[topicId].diagrams['fddi-dual-ring']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(fddiDualRingScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = fddiDualRingScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 FDDI 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
