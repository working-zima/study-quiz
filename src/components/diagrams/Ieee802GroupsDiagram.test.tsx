import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { Ieee802GroupsDiagram, ieee802GroupsScenarios } from './Ieee802GroupsDiagram'

const topicId = 'network-topology'
const anchorConceptId = `${topicId}.ieee-802-standards`
const labels: Record<string, string> = {
  'g1': '802.1',
  'g3': '802.3',
  'g11': '802.11',
  'g15': '802.15',
  'g2': '802.2',
  'g4': '802.4',
  'g5': '802.5',
  't1': '브리지·VLAN',
  't3': '이더넷',
  't11': '무선 LAN',
  't15': 'WPAN',
  't2': 'LLC',
  't4': '토큰 버스',
  't5': '토큰 링',
}
const groupLabels: Record<string, string> = {
  'active': '활동 중인 작업 그룹',
  'disbanded': '해산한 작업 그룹',
}
const noteLabels: Record<string, string> = {
  'active-note': '지금도 활동한다',
  'disbanded-note': '해산해 표준을 더 고치지 않는다',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
// 작업 그룹 번호 노드는 자기 상태의 박스 안에, 맡은 기술 노드는 두 박스 밖에 둔다.
const activeGroupIds = ['g1', 'g3', 'g11', 'g15']
const disbandedGroupIds = ['g2', 'g4', 'g5']
const groupNodeIds = [...activeGroupIds, ...disbandedGroupIds]
const technologyIds = nodeIds.filter((id) => !groupNodeIds.includes(id))
// 연결선은 번호에서 나가 그 작업 그룹이 맡은 기술에서 끝나고, 늘 보인다.
const pathEnds: Record<string, [string, string]> = {
  'g1-t1': ['g1', 't1'],
  'g3-t3': ['g3', 't3'],
  'g11-t11': ['g11', 't11'],
  'g15-t15': ['g15', 't15'],
  'g2-t2': ['g2', 't2'],
  'g4-t4': ['g4', 't4'],
  'g5-t5': ['g5', 't5'],
}
const linkIds = Object.keys(pathEnds)
const tallPaths: Record<string, string> = {
  'g1-t1': 'M112 48 H152',
  'g3-t3': 'M112 92 H152',
  'g11-t11': 'M112 136 H152',
  'g15-t15': 'M112 180 H152',
  'g2-t2': 'M112 264 H152',
  'g4-t4': 'M112 308 H152',
  'g5-t5': 'M112 352 H152',
}
const widePaths: Record<string, string> = {
  'g1-t1': 'M104 48 H136',
  'g3-t3': 'M104 92 H136',
  'g11-t11': 'M104 136 H136',
  'g15-t15': 'M104 180 H136',
  'g2-t2': 'M328 48 H352',
  'g4-t4': 'M328 92 H352',
  'g5-t5': 'M328 136 H352',
}

const question = 'IEEE 802의 번호마다 어떤 기술이 있을까?'
const figureName = 'IEEE 802의 작업 그룹 802.1·802.2·802.3·802.4·802.5·802.11·802.15를 지금 활동하는 것과 해산한 것으로 나눠 두고, 번호마다 맡은 기술을 화살표로 이어 보이는 도식'
const svgName = '「활동 중인 작업 그룹」 박스 안에 802.1·802.3·802.11·802.15를, 「해산한 작업 그룹」 박스 안에 802.2·802.4·802.5를 두고, 번호마다 박스 밖의 기술 이름으로 화살표를 이은 그림'
const idleCaption = 'IEEE 802는 기술마다 작업 그룹을 두고, 표준을 그 작업 그룹의 번호로 부른다. 화살표는 번호에서 그 작업 그룹이 맡은 기술로 간다. 버튼으로 지금 활동하는 작업 그룹과 해산한 작업 그룹을 골라 볼 수 있다.'
const legend = '박스 안의 번호는 IEEE 802의 작업 그룹이고, 화살표가 가리키는 박스 밖의 이름은 그 작업 그룹이 맡은 기술이다. 두 박스는 작업 그룹이 지금 활동하는지, 해산했는지로 나뉜다.'
const expectedScenarios = [
  {
    id: 'active', label: '활동 중',
    nodes: ['g1', 'g3', 'g11', 'g15', 't1', 't3', 't11', 't15'],
    paths: ['g1-t1', 'g3-t3', 'g11-t11', 'g15-t15'],
    notes: ['active-note'],
    caption: '802.1·802.3·802.11·802.15 작업 그룹은 지금도 활동한다. 802.1은 브리지와 VLAN, 802.3은 이더넷, 802.11은 무선 LAN, 802.15는 WPAN의 표준을 맡는다.',
  },
  {
    id: 'disbanded', label: '해산',
    nodes: ['g2', 'g4', 'g5', 't2', 't4', 't5'],
    paths: ['g2-t2', 'g4-t4', 'g5-t5'],
    notes: ['disbanded-note'],
    caption: '802.2·802.4·802.5 작업 그룹은 해산했다. 802.2가 정한 LLC, 802.4가 정한 토큰 버스, 802.5가 정한 토큰 링의 표준은 모두 철회되어 더 고치는 곳이 없다.',
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
const shownLinks = () => Array.from(svg().querySelectorAll('[data-link]'), (link) => link.getAttribute('data-link')!)
const linkOpacity = (id: string) => svg().querySelector(`[data-link="${id}"]`)!.getAttribute('opacity')
const clearLinks = () => linkIds.filter((id) => linkOpacity(id) === null)
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 232] : [0, 0, 280, 408]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<Ieee802GroupsDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 연결선이 모두 선명하고 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<Ieee802GroupsDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownLinks()).toEqual(linkIds)
    for (const link of svg().querySelectorAll('[data-link]')) {
      expect(link).not.toHaveAttribute('opacity')
      expect(link).toHaveAttribute('d', paths[link.getAttribute('data-link')!])
      expect(link).toHaveClass('stroke-muted')
      expect(link).toHaveAttribute('marker-end', `url(#${svg().querySelector('marker')!.id})`)
    }
    expect(svg().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 작업 그룹과 그 기술·연결선·곁말만 선명하고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<Ieee802GroupsDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownLinks()).toEqual(linkIds)
    for (const id of linkIds) {
      if (scenario.paths.includes(id)) expect(svg().querySelector(`[data-link="${id}"]`), id).not.toHaveAttribute('opacity')
      else expect(linkOpacity(id), id).toBe('0.25')
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
    render(<Ieee802GroupsDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    for (const id of activeGroupIds) expect(contains(groupBox('active'), nodeBox(id)), `${id} ⊂ active`).toBe(true)
    for (const id of disbandedGroupIds) expect(contains(groupBox('disbanded'), nodeBox(id)), `${id} ⊂ disbanded`).toBe(true)
    for (const id of technologyIds) for (const group of groupIds) expect(overlaps(groupBox(group), nodeBox(id)), `${id}는 ${group} 박스 밖`).toBe(false)
    expect(overlaps(groupBox('active'), groupBox('disbanded'))).toBe(false)
    for (const id of groupIds) {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
    }
    // 곁말은 viewBox 안에 들어가고, 노드·그룹 라벨·그룹 박스·선과 겹치지 않는다. 두 곁말은 한 장면에 하나씩만 보인다.
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
      for (const group of groupIds) {
        expect(overlaps(box, groupLabelBox(group)), `${box.id} ↔ ${group} 라벨`).toBe(false)
        expect(overlaps(box, groupBox(group)), `${box.id}는 ${group} 박스 밖`).toBe(false)
      }
      for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('연결선은 번호의 변에서 시작해 그 기술의 변에서 끝나고, 노드 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<Ieee802GroupsDiagram />)
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
  })

  // 요점: 번호 노드의 라벨 집합이 본문 목록 항목의 번호 집합과 같다. 활동 중과 해산 장면에서 선명한 번호 노드의 집합은
  // 겹치지 않고 합치면 번호 전부이며, 장면마다 선명한 번호는 그 상태의 박스 안에 있고 선명한 연결선이 그 번호에서 그 기술로 간다.
  it('번호는 본문의 목록 항목과 같고, 활동 중과 해산으로 겹치지 않게 나뉜다', async () => {
    render(<Ieee802GroupsDiagram />)
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const bodyNumbers = concept.paragraphs.flatMap((paragraph) => {
      const match = /^- \*\*(802\.\d+)\*\*/u.exec(paragraph)
      return match ? [match[1]] : []
    })
    expect(new Set(groupNodeIds.map(label))).toEqual(new Set(bodyNumbers))
    expect(bodyNumbers).toHaveLength(groupNodeIds.length)

    const clearByScenario = new Map<string, string[]>()
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const numbers = clearNodes().filter((id) => groupNodeIds.includes(id))
      clearByScenario.set(scenario.id, numbers)
      for (const id of numbers) expect(contains(groupBox(scenario.id), nodeBox(id)), `${scenario.id}: ${id}`).toBe(true)
      for (const id of clearLinks()) {
        const { start, end } = lineEnds(paths[id])
        expect(numbers.some((number) => onEdge(start, nodeBox(number))), `${id} 시작`).toBe(true)
        expect(clearNodes().some((node) => technologyIds.includes(node) && onEdge(end, nodeBox(node))), `${id} 끝`).toBe(true)
      }
    }
    const active = clearByScenario.get('active')!
    const disbanded = clearByScenario.get('disbanded')!
    expect(active.filter((id) => disbanded.includes(id))).toEqual([])
    expect(new Set([...active, ...disbanded])).toEqual(new Set(groupNodeIds))

    const body = concept.paragraphs.join('\n')
    for (const phrase of ['작업 그룹(working group)', '브리지', 'VLAN(Virtual LAN)', 'LLC(Logical Link Control', '이더넷의 작업 그룹', '토큰 버스의 작업 그룹', '토큰 링의 작업 그룹', '무선 LAN의 작업 그룹', 'WPAN(wireless personal area network', '지금도 활동한다', '작업 그룹은 해산했고', '철회']) {
      expect(body, phrase).toContain(phrase)
    }
  })
}

describe('Ieee802GroupsDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<Ieee802GroupsDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 408')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('해산')
      const tallClear = clearLinks()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 232')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '해산' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(clearLinks()).toEqual(tallClear)
      expect(shownNotes()).toEqual(tallNotes)
      for (const link of svg().querySelectorAll('[data-link]')) expect(link).toHaveAttribute('d', widePaths[link.getAttribute('data-link')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', () => {
    render(<><Ieee802GroupsDiagram /><Ieee802GroupsDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      for (const link of figure.querySelectorAll('[data-link]')) expect(link).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    const markerIds = figures.flatMap((figure) => Array.from(figure.querySelectorAll('marker'), (marker) => marker.id))
    expect(markerIds).toHaveLength(2)
    expect(new Set(markerIds).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<Ieee802GroupsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['ieee802-groups']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(ieee802GroupsScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = ieee802GroupsScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 IEEE 802 표준 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
