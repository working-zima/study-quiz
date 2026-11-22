import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ImpairmentKindsDiagram, impairmentKindsScenarios } from './ImpairmentKindsDiagram'

const topicId = 'transmission-media'
const anchorConceptId = `${topicId}.transmission-impairments`
const labels: Record<string, string> = {
  'sender': '보내는 쪽',
  'medium': '매체',
  'receiver': '받는 쪽',
  'noise': '바깥 잡음',
  'neighbor': '옆 선로',
  'weak': '약해진 신호',
  'early': '먼저 닿은 성분',
  'late': '늦게 닿은 성분',
}
const groupLabels: Record<string, string> = {
  'arrived': '받는 쪽에 닿은 신호',
}
// 받는 쪽에 닿은 신호 박스 안에는 신호의 모습 셋만 있고, 보내는 쪽·매체·받는 쪽·바깥 잡음·옆 선로는 박스 밖에 있다.
const members: Record<string, string[]> = {
  'arrived': ['weak', 'early', 'late'],
}
const noteLabels: Record<string, string> = {
  'attenuation-note': '멀리 갈수록 세기가 줄어든다',
  'delay-note': '성분마다 걸린 시간이 다르다',
  'noise-note': '원치 않는 방해가 섞여 든다',
  'crosstalk-note': '옆 선로의 신호가 넘어온다',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
const chainIds = ['sender', 'medium', 'receiver']
// 늘 보이는 가는 화살표는 신호가 보내는 쪽에서 매체를 지나 받는 쪽으로 가는 길이다.
const linkEnds: Record<string, [string, string]> = {
  'sender-medium': ['sender', 'medium'],
  'medium-receiver': ['medium', 'receiver'],
}
// 굵은 화살표는 매체 밖의 신호가 매체로 섞여 드는 길이다.
const pathEnds: Record<string, [string, string]> = {
  'noise-medium': ['noise', 'medium'],
  'neighbor-medium': ['neighbor', 'medium'],
}
const allEnds = { ...linkEnds, ...pathEnds }
const tallPaths: Record<string, string> = {
  'sender-medium': 'M140 40 V64',
  'medium-receiver': 'M140 96 V120',
  'noise-medium': 'M80 80 H108',
  'neighbor-medium': 'M200 80 H172',
}
const widePaths: Record<string, string> = {
  'sender-medium': 'M80 80 H124',
  'medium-receiver': 'M188 80 H236',
  'noise-medium': 'M156 40 V64',
  'neighbor-medium': 'M156 120 V96',
}

const question = '신호는 매체를 지나며 어떤 손상을 입을까?'
const figureName = '보내는 쪽에서 매체를 지나 받는 쪽으로 가는 신호에 감쇠·지연 왜곡·잡음·누화가 각각 무엇을 바꾸는지 보이는 도식'
const svgName = '보내는 쪽·매체·받는 쪽을 차례로 잇고, 매체 곁에 바깥 잡음과 옆 선로를, 받는 쪽에 닿은 신호 박스에 약해진 신호·먼저 닿은 성분·늦게 닿은 성분을 둔 그림'
const idleCaption = '보내는 쪽이 보낸 신호가 매체를 지나 받는 쪽에 닿는다. 버튼으로 감쇠·지연 왜곡·잡음·누화를 하나씩 고르면, 그 손상이 신호의 무엇을 바꾸는지와 어디서 섞여 드는지 볼 수 있다.'
const legend = '가는 화살표는 신호가 보내는 쪽에서 받는 쪽으로 가는 길이고, 굵은 화살표는 매체 밖에서 섞여 드는 신호의 길이다. 받는 쪽에 닿은 신호 박스는 받는 쪽에 닿은 신호가 어떤 모습인지 적는다.'
const expectedScenarios = [
  {
    id: 'attenuation', label: '감쇠',
    nodes: ['sender', 'medium', 'receiver', 'weak'],
    paths: [] as string[],
    notes: ['attenuation-note'],
    caption: '감쇠는 신호가 매체를 지나는 동안 세기가 약해지는 것이다. 같은 매체라도 길이가 길수록 더 약해져, 받는 쪽에는 약해진 신호가 닿는다.',
  },
  {
    id: 'delay', label: '지연 왜곡',
    nodes: ['sender', 'medium', 'receiver', 'early', 'late'],
    paths: [] as string[],
    notes: ['delay-note'],
    caption: '지연 왜곡은 신호를 이루는 여러 주파수 성분이 매체를 지나는 데 걸리는 시간이 서로 달라 생긴다. 받는 쪽에는 먼저 닿는 성분과 늦게 닿는 성분이 생기고, 어긋난 채 합쳐진 신호는 보낸 것과 모양이 다르다.',
  },
  {
    id: 'noise', label: '잡음',
    nodes: ['sender', 'medium', 'receiver', 'noise'],
    paths: ['noise-medium'],
    notes: ['noise-note'],
    caption: '잡음은 주변의 전기 장치처럼 신호 밖에서 생긴 원치 않는 전기적 방해가 매체를 지나는 신호에 섞여 드는 것이다. 받는 쪽은 섞여 든 방해 때문에 신호를 읽기 어려워진다.',
  },
  {
    id: 'crosstalk', label: '누화',
    nodes: ['sender', 'medium', 'receiver', 'neighbor'],
    paths: ['neighbor-medium'],
    notes: ['crosstalk-note'],
    caption: '누화는 같은 케이블에 함께 든 다른 쌍처럼 가까이 놓인 옆 선로를 지나는 신호가 일부 넘어와 이 신호에 섞이는 것이다. 섞여 드는 것이 다른 통신의 신호라는 점에서 잡음과 갈린다.',
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
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note')!)
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)!
const opacity = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')
const sharpNodes = () => nodeIds.filter((id) => opacity(id) === '1')

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function contains(outer: SvgBox, inner: SvgBox) {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height
}

// 곁말·그룹 라벨(9)의 가로 범위. 반각 문자가 섞일 수 있으므로 어림값의 1.15배로 잡는다.
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 188] : [0, 0, 280, 288]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<ImpairmentKindsDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고, 늘 보이는 신호 길만 있고 섞여 드는 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<ImpairmentKindsDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownLinks()).toEqual(Object.keys(linkEnds))
    for (const link of svg().querySelectorAll('[data-link]')) {
      expect(link).toHaveAttribute('d', paths[link.getAttribute('data-link')!])
      expect(link).toHaveClass('stroke-muted')
      expect(link).toHaveAttribute('stroke-width', '1.5')
      expect(link).toHaveAttribute('marker-end', `url(#${svg().querySelector('marker')!.id})`)
    }
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<ImpairmentKindsDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownLinks()).toEqual(Object.keys(linkEnds))
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
    render(<ImpairmentKindsDiagram />)
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
    // 곁말은 받는 쪽 가까이의 빈자리에 들어가고, 노드·그룹 박스·선과 겹치지 않는다. 노드와는 위아래 4 이상 띄운다.
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

  it('화살표는 앞 노드의 변에서 시작해 뒤 노드의 변에서 끝나고, 노드 안이나 그룹 라벨을 지나지 않으며 서로 겹치지 않는다', () => {
    render(<ImpairmentKindsDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(allEnds)))
    for (const [id, d] of Object.entries(paths)) {
      const { start, end } = lineEnds(d)
      expect(onEdge(start, nodeBox(allEnds[id][0])), `${id} 시작`).toBe(true)
      expect(onEdge(end, nodeBox(allEnds[id][1])), `${id} 끝`).toBe(true)
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) {
          expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
          expect(overlaps({ id, x: Math.min(segment.x1, segment.x2), y: Math.min(segment.y1, segment.y2), width: Math.abs(segment.x2 - segment.x1), height: Math.abs(segment.y2 - segment.y1) }, groupBox(group)), `${id} ↔ ${group}`).toBe(false)
        }
      }
    }
    const ids = Object.keys(paths)
    for (const a of ids) for (const b of ids.filter((other) => other !== a)) {
      for (const sa of segments(paths[a])) for (const sb of segments(paths[b])) expect(collinearOverlap(sa, sb), `${a} ↔ ${b}`).toBe(false)
    }
  })

  // 요점: 네 손상은 선명한 노드·보이는 화살표·곁말이 모두 다르다. 잡음과 누화는 매체로 섞여 드는 화살표가 서로 다른 노드에서 시작하고,
  // 지연 왜곡은 먼저 닿은 성분과 늦게 닿은 성분을 서로 다른 자리에 함께 선명하게 둔다. 감쇠와 지연 왜곡에는 매체로 섞여 드는 화살표가 없다.
  it('손상마다 바뀌는 것이 다르게 보인다', async () => {
    render(<ImpairmentKindsDiagram />)
    const signatures = new Set<string>()
    const intoMediumFrom: Record<string, string[]> = {}
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of chainIds) expect(opacity(id), `${scenario.id} ${id}`).toBe('1')
      signatures.add(JSON.stringify([sharpNodes(), shownPaths(), shownNotes()]))
      intoMediumFrom[scenario.id] = shownPaths()
        .map((id) => [endpointNode(lineEnds(paths[id]).start), endpointNode(lineEnds(paths[id]).end)])
        .filter(([, to]) => to === 'medium')
        .map(([from]) => from!)
    }
    expect(signatures.size).toBe(expectedScenarios.length)
    expect(intoMediumFrom.attenuation).toEqual([])
    expect(intoMediumFrom.delay).toEqual([])
    expect(intoMediumFrom.noise).toEqual(['noise'])
    expect(intoMediumFrom.crosstalk).toEqual(['neighbor'])

    await select('지연 왜곡')
    expect(opacity('early')).toBe('1')
    expect(opacity('late')).toBe('1')
    expect(opacity('weak')).toBe('0.25')
    const early = nodeBox('early')
    const late = nodeBox('late')
    expect(early.x !== late.x || early.y !== late.y).toBe(true)
    expect(overlaps(early, late)).toBe(false)

    await select('감쇠')
    expect(sharpNodes().filter((id) => members.arrived.includes(id))).toEqual(['weak'])

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const phrase of ['길이가 길수록 신호가 더 약해진다', '먼저 닿는 성분과 늦게 닿는 성분', '원치 않는 전기적 방해', '옆 선로', '주변의 전기 장치', '같은 케이블에 함께 든 다른 쌍']) {
      expect(body, phrase).toContain(phrase)
    }
  })
}

describe('ImpairmentKindsDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<ImpairmentKindsDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 288')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('잡음')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 188')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '잡음' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      for (const link of svg().querySelectorAll('[data-link]')) expect(link).toHaveAttribute('d', widePaths[link.getAttribute('data-link')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><ImpairmentKindsDiagram /><ImpairmentKindsDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '잡음' })) })
      for (const path of figure.querySelectorAll('[data-path], [data-link]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<ImpairmentKindsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['impairment-kinds']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(impairmentKindsScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = impairmentKindsScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 전송 손상 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
