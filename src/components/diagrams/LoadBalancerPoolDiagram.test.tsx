import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { LoadBalancerPoolDiagram, loadBalancerPoolScenarios } from './LoadBalancerPoolDiagram'

const topicId = 'network-devices'
const anchorConceptId = `${topicId}.load-balancing`
const labels: Record<string, string> = {
  'client': '클라이언트',
  'lb01': 'LB01',
  'web01': 'WEB01',
  'web02': 'WEB02',
  'web03': 'WEB03',
}
const groupLabels: Record<string, string> = {
  'pool': '서버 풀',
}
const noteLabels: Record<string, string> = {
  'spread-note': '요청을 서버 셋에 나눈다',
  'health-note': '멈춘 WEB02에는 보내지 않는다',
}
const exampleNoteLabels: Record<string, string> = {
  'address-note': '가상 주소 192.0.2.100',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
const servers = ['web01', 'web02', 'web03']
// 서버 풀 박스는 웹 서버 셋만 담는다. 클라이언트와 LB01은 박스 밖에 있다.
const members: Record<string, string[]> = {
  'pool': servers,
}
// 화살표는 요청을 보낸 쪽의 변에서 나가 받은 쪽의 변에서 끝난다.
const pathEnds: Record<string, [string, string]> = {
  'client-lb': ['client', 'lb01'],
  'lb-web01': ['lb01', 'web01'],
  'lb-web02': ['lb01', 'web02'],
  'lb-web03': ['lb01', 'web03'],
}
const tallPaths: Record<string, string> = {
  'client-lb': 'M140 40 V80',
  'lb-web01': 'M116 112 V124 H56 V160',
  'lb-web02': 'M140 112 V160',
  'lb-web03': 'M164 112 V124 H224 V160',
}
const widePaths: Record<string, string> = {
  'client-lb': 'M96 96 H152',
  'lb-web01': 'M224 88 H248 V48 H304',
  'lb-web02': 'M224 96 H304',
  'lb-web03': 'M224 104 H256 V144 H304',
}

const question = '로드 밸런서는 멈춘 서버를 어떻게 다룰까?'
const figureName = '로드 밸런서 LB01이 가상 주소 192.0.2.100으로 받은 요청을 서버 풀의 WEB01·WEB02·WEB03에 나눠 보내다가, 상태 확인에 응답하지 않는 WEB02를 빼고 나누는 모습을 보이는 도식'
const svgName = '클라이언트와 로드 밸런서 LB01, 서버 풀 박스 안의 웹 서버 WEB01·WEB02·WEB03을 차례로 둔 그림'
const idleCaption = '클라이언트는 로드 밸런서 LB01의 가상 주소 192.0.2.100으로 접속하고, LB01 뒤의 서버 풀에는 웹 서버 WEB01·WEB02·WEB03이 있다. 버튼을 고르면 LB01이 요청을 어느 서버로 보내는지 볼 수 있다.'
const legend = '화살표는 요청이 가는 쪽이다. 192.0.2.100은 서버 풀 전체를 대표하는 가상 주소이고 문서의 예로 쓰라고 남겨 둔 주소다. LB01과 WEB01~WEB03은 예로 붙인 이름표다.'
const expectedScenarios = [
  {
    id: 'spread', label: '나눠 보내기',
    nodes: ['client', 'lb01', 'web01', 'web02', 'web03'],
    paths: ['client-lb', 'lb-web01', 'lb-web02', 'lb-web03'],
    notes: ['spread-note'],
    caption: '클라이언트는 서버마다의 주소가 아니라 LB01의 가상 주소 192.0.2.100으로 접속하고, LB01이 요청마다 서버 풀의 WEB01·WEB02·WEB03 가운데 하나를 골라 넘긴다. 클라이언트는 어느 서버가 요청을 처리하는지 알 필요가 없다.',
  },
  {
    id: 'health', label: '서버가 멈췄을 때',
    nodes: ['client', 'lb01', 'web01', 'web03'],
    paths: ['client-lb', 'lb-web01', 'lb-web03'],
    notes: ['health-note'],
    caption: 'WEB02가 멈춰 상태 확인에 응답하지 않자, LB01은 그 뒤로 들어오는 새 요청을 WEB01과 WEB03에만 나눠 보낸다. 클라이언트는 여전히 192.0.2.100으로 접속하므로 서버 한 대가 빠진 것을 알지 못한다.',
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
const exampleNote = (id: string) => svg().querySelector(`[data-example-note="${id}"]`)!
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 176] : [0, 0, 280, 228]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<LoadBalancerPoolDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표와 시나리오 곁말 없이 선택 안내가 나오며, 가상 주소 곁말은 늘 LB01에 붙어 있다', () => {
    const { container } = render(<LoadBalancerPoolDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(exampleNote('address-note').textContent).toBe(exampleNoteLabels['address-note'])
    expect(exampleNote('address-note').closest('[data-node]')).toHaveAttribute('data-node', 'lb01')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<LoadBalancerPoolDiagram />)
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
    expect(exampleNote('address-note').textContent).toBe(exampleNoteLabels['address-note'])
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·그룹 라벨·곁말이 자리에 들어간다`, async () => {
    render(<LoadBalancerPoolDiagram />)
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
    // 곁말은 viewBox 안, 서버 풀 박스 밖에 들어가고, 노드·그룹 라벨·선과 겹치지 않는다. 같이 보이는 곁말끼리도 겹치지 않는다.
    expect(exampleNote('address-note')).toHaveAttribute('font-size', '9')
    const exampleBox = textBox(exampleNote('address-note'), 'address-note')
    const seen: string[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const visible = [exampleBox, ...scenario.notes.map((id) => textBox(note(id), id))]
      seen.push(...scenario.notes)
      expect(boxesOutsideViewBox(visible, viewBox)).toEqual([])
      for (const box of visible) {
        for (const group of groupIds) expect(overlaps(box, groupBox(group)), `${box.id}는 ${group} 박스 밖`).toBe(false)
        for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(overlaps(box, groupLabelBox(group)), `${box.id} ↔ ${group} 라벨`).toBe(false)
        for (const other of visible.filter(({ id }) => id !== box.id)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
        for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
      }
    }
    expect([...seen].sort()).toEqual([...noteIds].sort())
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 보낸 쪽의 변에서 시작해 받은 쪽의 변에서 끝나고, 노드 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<LoadBalancerPoolDiagram />)
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

  // 요점: 나눠 보내기에서는 서버 셋 모두에 LB01에서 나간 화살표가 닿는다. 서버가 멈췄을 때는 WEB02가 흐리고,
  // 보이는 화살표 어느 것도 WEB02의 변에서 끝나지 않는다. 두 시나리오 모두 서버로 가는 화살표는 LB01에서만 나간다 — 클라이언트는 서버에 바로 가지 않는다.
  it('로드 밸런서는 서버 셋에 나눠 보내다가, 상태 확인에 응답하지 않는 WEB02에는 보내지 않는다', async () => {
    render(<LoadBalancerPoolDiagram />)
    const paths = wide ? widePaths : tallPaths
    const endsOn = (pathId: string, nodeId: string) => onEdge(lineEnds(paths[pathId]).end, nodeBox(nodeId))
    const startsOn = (pathId: string, nodeId: string) => onEdge(lineEnds(paths[pathId]).start, nodeBox(nodeId))

    await select('나눠 보내기')
    for (const server of servers) {
      const into = shownPaths().filter((id) => endsOn(id, server))
      expect(into, server).toHaveLength(1)
      expect(startsOn(into[0], 'lb01'), server).toBe(true)
    }

    await select('서버가 멈췄을 때')
    expect(opacity('web02')).toBe('0.25')
    expect(shownPaths().filter((id) => endsOn(id, 'web02'))).toEqual([])
    for (const server of ['web01', 'web03']) {
      expect(opacity(server)).toBe('1')
      expect(shownPaths().filter((id) => endsOn(id, server)), server).toHaveLength(1)
    }
    for (const id of shownPaths().filter((pathId) => servers.some((server) => endsOn(pathId, server)))) expect(startsOn(id, 'lb01'), id).toBe(true)
    // 클라이언트에서 나가는 화살표는 LB01로만 간다.
    expect(shownPaths().filter((id) => startsOn(id, 'client'))).toEqual(['client-lb'])

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const name of ['가상 주소가 `192.0.2.100`인 로드 밸런서 `LB01`', '`WEB01`(`192.0.2.11`)', '`WEB02`(`192.0.2.12`)', '`WEB03`(`192.0.2.13`)', '서버 풀', '상태 확인에 응답하지 않게 되면', '`WEB01`과 `WEB03`에만 나눠 보낸다']) {
      expect(body, name).toContain(name)
    }
  })
}

describe('LoadBalancerPoolDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<LoadBalancerPoolDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 228')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('서버가 멈췄을 때')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 176')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '서버가 멈췄을 때' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><LoadBalancerPoolDiagram /><LoadBalancerPoolDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '나눠 보내기' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<LoadBalancerPoolDiagram />)
    const text = visualsByTopicId[topicId].diagrams['load-balancer-pool']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(loadBalancerPoolScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual({ ...exampleNoteLabels, ...noteLabels })
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
      const scenario = loadBalancerPoolScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 부하 분산 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
