import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { StorageAttachDiagram, storageAttachScenarios } from './StorageAttachDiagram'

const topicId = 'raid-storage'
const anchorConceptId = `${topicId}.network-storage`
const labels: Record<string, string> = {
  'das-server': '서버',
  'das-storage': '저장 장치',
  'nas-pc': '사무실 컴퓨터들',
  'nas-lan': 'LAN',
  'nas-nas01': 'NAS01',
  'san-srv01': 'SRV01',
  'san-srv02': 'SRV02',
  'san-network': '저장 장치를 잇는 네트워크',
  'san-stor01': 'STOR01',
}
const groupLabels: Record<string, string> = {
  'das': 'DAS',
  'nas': 'NAS',
  'san': 'SAN',
}
const noteLabels: Record<string, string> = {
  'das-note': '서버 한 대에 바로 이어 그 서버만 쓴다',
  'nas-note': 'LAN으로 여러 컴퓨터에 파일 단위로 내준다',
  'san-note': '서버들이 디스크 공간을 블록 단위로 읽고 쓴다',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
// 갈래마다 박스 하나에 그 갈래의 노드를 모두 담는다. 갈래끼리 노드를 함께 쓰지 않는다.
const members: Record<string, string[]> = {
  'das': ['das-server', 'das-storage'],
  'nas': ['nas-pc', 'nas-lan', 'nas-nas01'],
  'san': ['san-srv01', 'san-srv02', 'san-network', 'san-stor01'],
}
// 화살표는 서버나 컴퓨터가 저장 장치에 데이터를 청하는 쪽을 가리킨다.
const pathEnds: Record<string, [string, string]> = {
  'das-server-storage': ['das-server', 'das-storage'],
  'nas-pc-lan': ['nas-pc', 'nas-lan'],
  'nas-lan-nas01': ['nas-lan', 'nas-nas01'],
  'san-srv01-network': ['san-srv01', 'san-network'],
  'san-srv02-network': ['san-srv02', 'san-network'],
  'san-network-stor01': ['san-network', 'san-stor01'],
}
const tallPaths: Record<string, string> = {
  'das-server-storage': 'M112 44 H168',
  'nas-pc-lan': 'M120 124 H140',
  'nas-lan-nas01': 'M188 124 H208',
  'san-srv01-network': 'M52 220 V244',
  'san-srv02-network': 'M140 220 V244',
  'san-network-stor01': 'M176 260 H200',
}
const widePaths: Record<string, string> = {
  'das-server-storage': 'M112 44 H344',
  'nas-pc-lan': 'M128 124 H208',
  'nas-lan-nas01': 'M272 124 H344',
  'san-srv01-network': 'M112 204 H136 V224 H160',
  'san-srv02-network': 'M112 252 H136 V232 H160',
  'san-network-stor01': 'M320 228 H344',
}

const question = 'DAS·NAS·SAN은 저장 장치를 어떻게 이어 쓸까?'
const figureName = 'DAS·NAS·SAN이 저장 장치를 서버나 컴퓨터에 잇는 길과 데이터를 내주는 단위를 갈래마다 견주는 도식'
const svgName = '「DAS」 박스의 서버와 저장 장치, 「NAS」 박스의 사무실 컴퓨터들·LAN·NAS01, 「SAN」 박스의 SRV01·SRV02·저장 장치를 잇는 네트워크·STOR01을 화살표로 이은 그림'
const idleCaption = 'DAS·NAS·SAN을 한 그림에 갈래로 나눠 그렸다. 버튼으로 갈래를 고르면 저장 장치가 누구에게 어떤 길로 이어지고, 데이터를 무엇 단위로 내주는지 볼 수 있다.'
const legend = '화살표는 서버나 컴퓨터가 저장 장치에 데이터를 청하는 쪽을 가리킨다. SRV01·SRV02·STOR01·NAS01은 예로 붙인 이름표다.'
const expectedScenarios = [
  {
    id: 'das', label: 'DAS',
    nodes: ['das-server', 'das-storage'],
    paths: ['das-server-storage'],
    notes: ['das-note'],
    caption: 'DAS는 저장 장치를 서버 한 대에 네트워크를 거치지 않고 바로 이어, 그 서버만 쓴다. 다른 서버는 이 저장 장치에 닿지 못한다.',
  },
  {
    id: 'nas', label: 'NAS',
    nodes: ['nas-pc', 'nas-lan', 'nas-nas01'],
    paths: ['nas-pc-lan', 'nas-lan-nas01'],
    notes: ['nas-note'],
    caption: 'NAS01은 LAN에 이어져, 사무실 컴퓨터들이 이름으로 청한 파일을 내준다. 그 파일을 디스크의 어느 블록에 둘지는 NAS01 쪽의 파일 시스템이 정한다.',
  },
  {
    id: 'san', label: 'SAN',
    nodes: ['san-srv01', 'san-srv02', 'san-network', 'san-stor01'],
    paths: ['san-srv01-network', 'san-srv02-network', 'san-network-stor01'],
    notes: ['san-note'],
    caption: 'SRV01과 SRV02는 저장 장치를 잇는 네트워크를 거쳐, STOR01이 내준 디스크 공간을 저마다 자기 디스크처럼 블록 단위로 읽고 쓴다. 이 데이터는 사무실 컴퓨터들이 쓰는 LAN을 지나지 않는다.',
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 312] : [0, 0, 280, 324]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<StorageAttachDiagram />)
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
    const { container } = render(<StorageAttachDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<StorageAttachDiagram />)
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
    render(<StorageAttachDiagram />)
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
      for (const other of groupIds.filter((otherId) => otherId !== id)) expect(overlaps(groupBox(id), groupBox(other)), `${id} ↔ ${other} 박스`).toBe(false)
    }
    // 곁말은 viewBox 안, 세 박스 밖의 빈 줄에 들어가고, 노드·그룹 라벨·선과 겹치지 않는다. 노드와는 위아래 4 이상 띄운다.
    const seen: string[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const visible = scenario.notes.map((id) => textBox(note(id), id))
      seen.push(...scenario.notes)
      expect(boxesOutsideViewBox(visible, viewBox)).toEqual([])
      for (const box of visible) {
        for (const group of groupIds) expect(overlaps(box, groupBox(group)), `${box.id}는 ${group} 박스 밖`).toBe(false)
        for (const node of nodeIds) {
          const nodeArea = nodeBox(node)
          expect(overlaps(box, { ...nodeArea, y: nodeArea.y - 4, height: nodeArea.height + 8 }), `${box.id} ↔ ${node}`).toBe(false)
        }
        for (const group of groupIds) expect(overlaps(box, groupLabelBox(group)), `${box.id} ↔ ${group} 라벨`).toBe(false)
        for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
      }
    }
    expect([...seen].sort()).toEqual([...noteIds].sort())
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 청하는 쪽의 변에서 시작해 받는 쪽의 변에서 끝나고, 노드 안이나 그룹 라벨을 지나지 않으며 한 장면의 화살표끼리 겹치지 않는다', () => {
    render(<StorageAttachDiagram />)
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

  // 요점: 세 갈래의 선명한 노드 집합이 서로 겹치지 않는다.
  // DAS는 서버에서 저장 장치로 바로 가는 화살표 하나뿐이다. NAS의 화살표는 LAN 노드를 지나 NAS01에 닿는다.
  // SAN의 화살표는 두 서버에서 「저장 장치를 잇는 네트워크」로 모이고 거기서 STOR01로 가며, LAN 노드에는 닿지 않는다.
  it('DAS는 서버에 바로 잇고, NAS는 LAN을 거치며, SAN은 LAN이 아닌 저장 장치를 잇는 네트워크를 거친다', async () => {
    render(<StorageAttachDiagram />)
    const ends = (id: string) => [endpointNode(lineEnds(paths[id]).start), endpointNode(lineEnds(paths[id]).end)] as [string, string]
    const clear: Record<string, string[]> = {}

    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      clear[scenario.id] = nodeIds.filter((id) => opacity(id) === '1')
    }
    for (const a of expectedScenarios) for (const b of expectedScenarios.filter((other) => other.id !== a.id)) {
      expect(clear[a.id].filter((id) => clear[b.id].includes(id)), `${a.id} ∩ ${b.id}`).toEqual([])
    }

    await select('DAS')
    expect(shownPaths().map(ends)).toEqual([['das-server', 'das-storage']])

    await select('NAS')
    const nasEnds = shownPaths().map(ends)
    expect(nasEnds.filter(([, to]) => to === 'nas-lan')).toEqual([['nas-pc', 'nas-lan']])
    expect(nasEnds.filter(([from]) => from === 'nas-lan')).toEqual([['nas-lan', 'nas-nas01']])
    expect(nasEnds.some(([from, to]) => from === 'nas-pc' && to === 'nas-nas01')).toBe(false)

    await select('SAN')
    const sanEnds = shownPaths().map(ends)
    expect(sanEnds.filter(([, to]) => to === 'san-network').map(([from]) => from).sort()).toEqual(['san-srv01', 'san-srv02'])
    expect(sanEnds.filter(([from]) => from === 'san-network')).toEqual([['san-network', 'san-stor01']])
    expect(sanEnds.some(([from, to]) => from === 'nas-lan' || to === 'nas-lan')).toBe(false)
    expect(opacity('nas-lan')).toBe('0.25')

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const phrase of ['서버 `SRV01`·`SRV02`', '저장 장치 `STOR01`', '`NAS01`', '사무실 컴퓨터들', '저장 장치를 잇는 네트워크', '파일 단위', '블록 단위', '예로 붙인 이름표']) {
      expect(body, phrase).toContain(phrase)
    }
  })
}

describe('StorageAttachDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<StorageAttachDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 324')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('SAN')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 312')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: 'SAN' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><StorageAttachDiagram /><StorageAttachDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'SAN' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<StorageAttachDiagram />)
    const text = visualsByTopicId[topicId].diagrams['storage-attach']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(storageAttachScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = storageAttachScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 DAS·NAS·SAN 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
