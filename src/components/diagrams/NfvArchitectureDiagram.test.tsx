import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { NfvArchitectureDiagram, nfvArchitectureScenarios } from './NfvArchitectureDiagram'

const topicId = 'cloud-sdn'
const anchorConceptId = `${topicId}.nfv`
const labels: Record<string, string> = {
  'vfw': '가상 방화벽',
  'vrouter': '가상 라우터',
  'vfw2': '가상 방화벽 2',
  'mano': 'NFV-MANO',
  'virt': '가상화 계층',
  'hw': '하드웨어(NFVI01)',
}
const groupLabels: Record<string, string> = {
  'nfvi': 'NFVI',
}
const noteLabels: Record<string, string> = {
  'vnf-note': '네트워크 기능을 소프트웨어로 만든 것이다',
  'nfvi-note': 'VNF가 실행될 하드웨어와 가상화 계층이다',
  'scale-note': '트래픽이 늘면 가상 방화벽을 하나 더 실행한다',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
const vnfs = ['vfw', 'vrouter', 'vfw2']
// 「NFVI」 박스는 아래에서 위로 쌓은 하드웨어와 가상화 계층 두 칸을 담는다. VNF 셋과 NFV-MANO는 박스 밖에 있다.
const members: Record<string, string[]> = {
  'nfvi': ['virt', 'hw'],
}
// 아래에서 위로 쌓은 두 칸이다. 하드웨어가 맨 아래, 그 위에 가상화 계층이다.
const tiers = ['hw', 'virt']
// 화살표는 NFV-MANO의 변에서 나가 새로 실행하는 가상 방화벽 2의 변에서 끝난다.
const pathEnds: Record<string, [string, string]> = {
  'scale-mano-vfw2': ['mano', 'vfw2'],
}
const tallPaths: Record<string, string> = {
  'scale-mano-vfw2': 'M226 40 V56',
}
const widePaths: Record<string, string> = {
  'scale-mano-vfw2': 'M344 24 H312',
}

const question = 'NFV에서 네트워크 기능은 어디에서 실행될까?'
const figureName = 'NFV에서 가상 방화벽·가상 라우터 같은 VNF가 NFVI의 하드웨어와 가상화 계층 위에서 실행되는 모습과, 트래픽이 늘 때 NFV-MANO가 VNF를 하나 더 실행하는 모습을 보이는 도식'
const svgName = '「NFVI」 박스 안에 아래에서 위로 쌓은 하드웨어(NFVI01)·가상화 계층 두 칸과, 그 위의 가상 방화벽·가상 라우터·가상 방화벽 2, 그리고 NFV-MANO를 화살표로 이은 그림'
const idleCaption = '가상 방화벽과 가상 라우터는 범용 서버 NFVI01의 하드웨어 위, 가상화 계층 위에서 실행되는 소프트웨어다. 버튼으로 VNF·NFVI·늘리기를 고르면 NFV의 세 부분이 저마다 무엇이고 무엇을 하는지 볼 수 있다.'
const legend = '아래에서 위로 쌓은 두 칸은 VNF가 실행되는 바탕이고, 화살표는 NFV-MANO가 VNF를 하나 더 실행하는 쪽이다. 가상 방화벽 2는 트래픽이 늘었을 때 더 실행한 가상 방화벽이고, NFVI01은 예로 붙인 범용 서버의 이름표다.'
const expectedScenarios = [
  {
    id: 'vnf', label: 'VNF',
    nodes: ['vfw', 'vrouter'],
    paths: [] as string[],
    notes: ['vnf-note'],
    caption: '가상 방화벽과 가상 라우터는 방화벽과 라우터의 일을 소프트웨어로 만든 VNF다. 기능마다 따로 만든 전용 장비가 아니라, 범용 서버 NFVI01 위에서 함께 실행된다.',
  },
  {
    id: 'nfvi', label: 'NFVI',
    nodes: ['virt', 'hw'],
    paths: [] as string[],
    notes: ['nfvi-note'],
    caption: 'NFVI는 VNF가 실행되는 바탕으로, 범용 서버 NFVI01의 계산·저장·네트워크 하드웨어와 그 자원을 VNF들에게 나눠 주는 가상화 계층으로 이루어진다. NFV를 써도 이 물리 하드웨어는 여전히 있어야 한다.',
  },
  {
    id: 'scale', label: '늘리기',
    nodes: ['vfw', 'vrouter', 'vfw2', 'mano'],
    paths: ['scale-mano-vfw2'],
    notes: ['scale-note'],
    caption: '지나가는 트래픽이 늘어 가상 방화벽 하나로 감당하기 어려워지면, NFV-MANO가 NFVI01에 남은 자원으로 가상 방화벽 2를 실행해 둘로 늘린다. 방화벽 장비를 새로 사서 설치하지 않고 소프트웨어를 하나 더 실행한 것이다.',
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
const vividNodes = () => nodeIds.filter((id) => opacity(id) === '1')

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

// 선이 어느 노드의 변에서 시작하고 어느 노드의 변에서 끝나는지 그림에서 읽는다. 점이 두 노드에 걸치면 찾지 못한 것으로 친다.
function endpointNode(point: { x: number, y: number }) {
  const found = nodeIds.filter((id) => onEdge(point, nodeBox(id)))
  return found.length === 1 ? found[0] : undefined
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 184] : [0, 0, 280, 224]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<NfvArchitectureDiagram />)
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
    const { container } = render(<NfvArchitectureDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<NfvArchitectureDiagram />)
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

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·그룹 라벨·곁말이 자리에 들어가며, 두 칸은 박스 안에서 아래에서 위로 빈틈없이 쌓인다`, async () => {
    render(<NfvArchitectureDiagram />)
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
    // 하드웨어 위에 가상화 계층이 같은 열에 맞닿아 쌓인다.
    for (let index = 1; index < tiers.length; index += 1) {
      const below = nodeBox(tiers[index - 1])
      const above = nodeBox(tiers[index])
      expect(above.y + above.height, `${tiers[index]} 위에 ${tiers[index - 1]}`).toBe(below.y)
      expect([above.x, above.width]).toEqual([below.x, below.width])
    }
    for (const id of groupIds) {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
    }
    // 곁말은 viewBox 안, 「NFVI」 박스 밖의 빈 줄에 들어가고, 노드·그룹 라벨·선과 겹치지 않는다. 노드와는 위아래 4 이상 띄운다.
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

  it('화살표는 NFV-MANO의 변에서 시작해 가상 방화벽 2의 변에서 끝나고, 노드 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<NfvArchitectureDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(pathEnds)))
    for (const [id, d] of Object.entries(paths)) {
      const { start, end } = lineEnds(d)
      expect(endpointNode(start), `${id} 시작`).toBe(pathEnds[id][0])
      expect(endpointNode(end), `${id} 끝`).toBe(pathEnds[id][1])
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) {
          expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
          expect(overlaps({ id, x: Math.min(segment.x1, segment.x2), y: Math.min(segment.y1, segment.y2), width: Math.abs(segment.x2 - segment.x1), height: Math.abs(segment.y2 - segment.y1) }, groupBox(group)), `${id}는 ${group} 박스 밖`).toBe(false)
        }
      }
    }
  })

  // 요점: VNF 셋은 「가상화 계층」 칸보다 위에 있고, 가상화 계층은 하드웨어 칸 바로 위에 있다 — 하드웨어 위에 가상화, 그 위에 VNF다.
  // 「가상 방화벽 2」는 늘리기 장면에서만 선명하고, 그 장면의 화살표는 NFV-MANO에서 나와 가상 방화벽 2에서 끝난다. 세 장면의 선명한 노드 집합은 서로 다르다.
  it('VNF는 가상화 계층 위에, 가상화 계층은 하드웨어 위에 있고, 가상 방화벽 2는 늘리기에서만 선명하며 세 장면의 선명한 노드가 서로 다르다', async () => {
    render(<NfvArchitectureDiagram />)
    for (const id of vnfs) expect(nodeBox(id).y + nodeBox(id).height, `${id}는 가상화 계층 위`).toBeLessThanOrEqual(nodeBox('virt').y)
    expect(nodeBox('virt').y).toBeLessThan(nodeBox('hw').y)

    const vivid: string[][] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      expect(opacity('vfw2'), scenario.id).toBe(scenario.id === 'scale' ? '1' : '0.25')
      vivid.push(vividNodes())
    }
    for (let a = 0; a < vivid.length; a += 1) {
      for (let b = a + 1; b < vivid.length; b += 1) expect(vivid[a], `${expectedScenarios[a].id} ↔ ${expectedScenarios[b].id}`).not.toEqual(vivid[b])
    }

    await select('늘리기')
    const ends = shownPaths().map((id) => [endpointNode(lineEnds(paths[id]).start), endpointNode(lineEnds(paths[id]).end)])
    expect(ends).toEqual([['mano', 'vfw2']])

    await select('NFVI')
    for (const id of vnfs) expect(opacity(id), id).toBe('0.25')
    for (const id of tiers) expect(opacity(id), id).toBe('1')

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const phrase of ['범용 서버 `NFVI01`', '가상 방화벽 2', '가상 라우터', '가상화 계층', 'NFV-MANO', '물리 장비가 없어지는 것은 아니다', '하나 더 실행한 것이다']) {
      expect(body, phrase).toContain(phrase)
    }
  })
}

describe('NfvArchitectureDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<NfvArchitectureDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 224')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('늘리기')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 184')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '늘리기' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><NfvArchitectureDiagram /><NfvArchitectureDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '늘리기' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<NfvArchitectureDiagram />)
    const text = visualsByTopicId[topicId].diagrams['nfv-architecture']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(nfvArchitectureScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = nfvArchitectureScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 NFV 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
