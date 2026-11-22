import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { RaidParityRotationDiagram, raidParityRotationScenarios } from './RaidParityRotationDiagram'

const topicId = 'raid-storage'
const anchorConceptId = `${topicId}.raid-5`
const labels: Record<string, string> = {
  'a1': 'A1',
  'a2': 'A2',
  'a3': 'A3',
  'p1': 'P1',
  'a4': 'A4',
  'a5': 'A5',
  'p2': 'P2',
  'a6': 'A6',
  'a7': 'A7',
  'p3': 'P3',
  'a8': 'A8',
  'a9': 'A9',
  'p4': 'P4',
  'a10': 'A10',
  'a11': 'A11',
  'a12': 'A12',
  'rebuilt': '다시 계산한 A2',
}
const groupLabels: Record<string, string> = {
  'disk0': 'DISK0',
  'disk1': 'DISK1',
  'disk2': 'DISK2',
  'disk3': 'DISK3',
}
const noteLabels: Record<string, string> = {
  'layout-note': '줄마다 패리티를 다른 디스크에 둔다',
  'fail-mark': '고장',
  'rebuild-note': 'A1·A3·P1로 잃은 A2를 다시 계산한다',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
// 디스크 박스마다 칸 넷을 위(첫째 줄)에서 아래(넷째 줄)로 담는다 — 본문 예의 배치다. 「다시 계산한 A2」는 박스 밖에 있다.
const members: Record<string, string[]> = {
  'disk0': ['a1', 'a4', 'a7', 'p4'],
  'disk1': ['a2', 'a5', 'p3', 'a10'],
  'disk2': ['a3', 'p2', 'a8', 'a11'],
  'disk3': ['p1', 'a6', 'a9', 'a12'],
}
// 「고장」 곁말은 고장 난 DISK1의 박스 안, 디스크 이름 옆에 붙는다. 나머지 곁말은 그림 아래의 빈 줄에 둔다.
const noteInside: Record<string, string> = {
  'fail-mark': 'disk1',
}
// 화살표는 다시 계산하는 데 쓰는 값이 가는 쪽이다 — 같은 줄에 남은 A1·A3·P1에서 「다시 계산한 A2」로.
const pathEnds: Record<string, [string, string]> = {
  'a1-rebuilt': ['a1', 'rebuilt'],
  'a3-rebuilt': ['a3', 'rebuilt'],
  'p1-rebuilt': ['p1', 'rebuilt'],
}
const tallPaths: Record<string, string> = {
  'a1-rebuilt': 'M40 44 H24 V196 H52',
  'a3-rebuilt': 'M72 248 V212',
  'p1-rebuilt': 'M208 248 V196 H156',
}
const widePaths: Record<string, string> = {
  'a1-rebuilt': 'M26 44 H17 V212 H172',
  'a3-rebuilt': 'M242 44 H233 V196',
  'p1-rebuilt': 'M414 44 H423 V212 H276',
}
const cellIds = nodeIds.filter((id) => id !== 'rebuilt')

const question = 'RAID 5는 패리티를 어디에 두고, 고장 난 조각을 어떻게 되살릴까?'
const figureName = 'RAID 5가 패리티 P1~P4를 DISK0~DISK3에 줄마다 돌아가며 두는 모습과, DISK1이 고장 났을 때 같은 줄의 A1·A3·P1로 A2를 다시 계산하는 차례를 견주는 도식'
const svgName = 'DISK0·DISK1·DISK2·DISK3 박스마다 칸 넷을 두고, 박스 밖의 「다시 계산한 A2」 노드로 화살표를 이은 그림'
const idleCaption = '2TB 디스크 DISK0~DISK3 넷을 RAID 5로 묶고 데이터 조각 A1~A12를 썼다. 버튼으로 장면을 고르면 패리티 P1~P4가 놓인 자리와, DISK1이 고장 났을 때 잃은 조각을 다시 계산하는 차례를 볼 수 있다.'
const legend = '박스 하나가 디스크 하나이고, 칸 하나가 조각이나 패리티 하나다. 박스마다 위에서부터 첫째 줄~넷째 줄이다. 화살표는 다시 계산하는 데 쓰는 값이 가는 쪽이다. 디스크·조각·패리티 이름은 예로 붙인 이름표다.'
const expectedScenarios = [
  {
    id: 'layout', label: '패리티 돌려 놓기',
    nodes: cellIds,
    paths: [] as string[],
    notes: ['layout-note'],
    caption: '첫째 줄의 패리티 P1을 DISK3에 두고, 한 줄 내려갈 때마다 패리티를 한 디스크씩 앞으로 옮겨 P2·P3·P4를 DISK2·DISK1·DISK0에 둔다. 네 디스크가 패리티를 하나씩 맡으므로, 패리티를 고치는 쓰기가 디스크 하나에 몰리지 않는다.',
  },
  {
    id: 'rebuild', label: '조각 다시 계산',
    nodes: ['a1', 'a3', 'p1', 'rebuilt'],
    paths: ['a1-rebuilt', 'a3-rebuilt', 'p1-rebuilt'],
    notes: ['fail-mark', 'rebuild-note'],
    caption: 'DISK1이 고장 나 첫째 줄의 A2를 잃었다. 같은 줄에 남은 A1·A3·P1을 배타적 논리합하면 A2가 다시 나온다. 둘째·넷째 줄의 A5·A10도 같은 식으로 계산하고, DISK1에 P3이 있던 셋째 줄은 데이터 조각이 모두 남아 그대로 읽는다.',
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

// 이 칸이 어느 디스크 박스 안에 놓였는지 좌표로 읽는다.
function diskOf(cell: string) {
  return groupIds.find((group) => contains(groupBox(group), nodeBox(cell)))
}

// 이 칸이 자기 디스크 박스 안에서 위에서 몇째 칸인지(0이 첫째 줄) 좌표로 읽는다.
function rowOf(cell: string) {
  const disk = diskOf(cell)!
  const inDisk = cellIds.filter((id) => diskOf(id) === disk).sort((a, b) => nodeBox(a).y - nodeBox(b).y)
  return inDisk.indexOf(cell)
}

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 260] : [0, 0, 280, 412]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<RaidParityRotationDiagram />)
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
    const { container } = render(<RaidParityRotationDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보이고 디스크 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<RaidParityRotationDiagram />)
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

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·디스크 이름·곁말이 자리에 들어간다`, async () => {
    render(<RaidParityRotationDiagram />)
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
      for (const other of groupIds.filter((otherId) => otherId !== id)) expect(overlaps(groupBox(id), groupBox(other)), `${id} ↔ ${other}`).toBe(false)
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) {
        const nodeArea = nodeBox(node)
        expect(overlaps(box, { ...nodeArea, y: nodeArea.y - 4, height: nodeArea.height + 8 }), `${id} 라벨 ↔ ${node}`).toBe(false)
      }
    }
    // 곁말은 viewBox 안에 들고, 노드와는 위아래 4 이상 띄우며, 디스크 이름·선과 겹치지 않는다.
    // 「고장」은 DISK1 박스 안에, 나머지는 디스크 박스 모두의 밖에 둔다.
    const seen: string[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const visible = scenario.notes.map((id) => textBox(note(id), id))
      seen.push(...scenario.notes)
      expect(boxesOutsideViewBox(visible, viewBox)).toEqual([])
      for (const box of visible) {
        for (const group of groupIds) {
          if (noteInside[box.id] === group) expect(contains(groupBox(group), box), `${box.id} ⊂ ${group}`).toBe(true)
          else expect(overlaps(box, groupBox(group)), `${box.id}는 ${group} 박스 밖`).toBe(false)
          expect(overlaps(box, groupLabelBox(group)), `${box.id} ↔ ${group} 라벨`).toBe(false)
        }
        for (const node of nodeIds) {
          const nodeArea = nodeBox(node)
          expect(overlaps(box, { ...nodeArea, y: nodeArea.y - 4, height: nodeArea.height + 8 }), `${box.id} ↔ ${node}`).toBe(false)
        }
        for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
      }
    }
    expect([...seen].sort()).toEqual([...noteIds].sort())
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 보내는 쪽의 변에서 시작해 받는 쪽의 변에서 끝나고, 노드 안이나 디스크 이름을 지나지 않으며 한 장면의 화살표끼리 겹치지 않는다', () => {
    render(<RaidParityRotationDiagram />)
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
    for (const scenario of expectedScenarios) {
      for (const a of scenario.paths) for (const b of scenario.paths.filter((other) => other !== a)) {
        for (const sa of segments(paths[a])) for (const sb of segments(paths[b])) expect(collinearOverlap(sa, sb), `${a} ↔ ${b}`).toBe(false)
      }
    }
  })

  it('디스크마다 칸 넷이 같은 열에 빈틈없이 위아래로 붙어 있고, 줄마다 디스크 넷의 칸이 같은 높이에 있다', () => {
    render(<RaidParityRotationDiagram />)
    for (const group of groupIds) {
      const cells = members[group].map(nodeBox)
      for (let index = 1; index < cells.length; index += 1) {
        expect(cells[index].x, group).toBe(cells[0].x)
        expect(cells[index].width, group).toBe(cells[0].width)
        expect(cells[index - 1].y + cells[index - 1].height, group).toBe(cells[index].y)
      }
    }
    for (let row = 0; row < 4; row += 1) {
      const offsets = groupIds.map((group) => nodeBox(members[group][row]).y - groupBox(group).y)
      expect(new Set(offsets).size, `${row}째 줄`).toBe(1)
    }
  })

  // 요점: 패리티 칸 넷은 서로 다른 디스크 박스 안에 있고, P1~P4가 첫째~넷째 줄에 차례로 DISK3·DISK2·DISK1·DISK0으로 옮겨 간다(좌표로 읽는다).
  // 조각 다시 계산에서는 「다시 계산한 A2」로 들어가는 화살표의 시작 칸이 모두 같은 줄(첫째 줄)이고, 고장 난 DISK1 박스 안의 칸에서 시작하는 화살표가 없다.
  it('패리티가 줄마다 다른 디스크에 놓이고, 잃은 조각은 같은 줄에 남은 칸들로 다시 계산한다', async () => {
    render(<RaidParityRotationDiagram />)
    const parity = ['p1', 'p2', 'p3', 'p4']
    expect(new Set(parity.map(diskOf)).size).toBe(4)
    expect(parity.map(diskOf)).toEqual(['disk3', 'disk2', 'disk1', 'disk0'])
    expect(parity.map(rowOf)).toEqual([0, 1, 2, 3])
    // 줄마다 데이터 칸 셋과 패리티 칸 하나가 든다.
    for (let row = 0; row < 4; row += 1) {
      const inRow = cellIds.filter((id) => rowOf(id) === row)
      expect(inRow, `${row}째 줄`).toHaveLength(4)
      expect(inRow.filter((id) => id.startsWith('p')), `${row}째 줄`).toHaveLength(1)
    }

    await select('조각 다시 계산')
    const ends = (id: string) => [endpointNode(lineEnds(paths[id]).start), endpointNode(lineEnds(paths[id]).end)] as [string, string]
    const toRebuilt = shownPaths().map(ends).filter(([, to]) => to === 'rebuilt')
    expect(toRebuilt).toHaveLength(3)
    expect(new Set(toRebuilt.map(([from]) => rowOf(from)))).toEqual(new Set([rowOf('a2')]))
    expect(toRebuilt.some(([from]) => diskOf(from) === 'disk1')).toBe(false)
    expect(new Set(toRebuilt.map(([from]) => diskOf(from)))).toEqual(new Set(['disk0', 'disk2', 'disk3']))
    for (const cell of members.disk1) expect(opacity(cell), cell).toBe('0.25')
    expect(textBox(note('fail-mark'), 'fail-mark').x).toBeGreaterThan(groupLabelBox('disk1').x + groupLabelBox('disk1').width)

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const phrase of ['2TB 디스크 `DISK0`~`DISK3`', '데이터 조각 A1~A12', '6TB', '패리티 P1을 `DISK3`에', '패리티 P2를 `DISK2`에', 'P3을 `DISK1`에', 'P4를 `DISK0`에', '`DISK1`이 고장 났다', '남은 A1·A3·P1을 배타적 논리합해 A2를 다시 계산', '예로 든 값']) {
      expect(body, phrase).toContain(phrase)
    }
  })
}

describe('RaidParityRotationDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<RaidParityRotationDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 412')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('조각 다시 계산')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 260')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '조각 다시 계산' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><RaidParityRotationDiagram /><RaidParityRotationDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '조각 다시 계산' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<RaidParityRotationDiagram />)
    const text = visualsByTopicId[topicId].diagrams['raid-parity-rotation']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(raidParityRotationScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = raidParityRotationScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 RAID 5 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
