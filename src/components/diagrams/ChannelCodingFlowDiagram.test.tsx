import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ChannelCodingFlowDiagram, channelCodingFlowScenarios } from './ChannelCodingFlowDiagram'

const topicId = 'transmission-media'
const anchorConceptId = `${topicId}.channel-coding`
const labels: Record<string, string> = {
  'info': '원래 정보',
  'source-coding': '원천 부호화',
  'data': '데이터 비트',
  'channel-coding': '채널 부호화',
  'coded': '데이터 비트 + 여분 비트',
  'medium': '매체',
  'check': '오류 검출·정정',
  'data-out': '데이터 비트',
}
const groupLabels: Record<string, string> = {
  'sender': '보내는 쪽',
  'receiver': '받는 쪽',
}
// 보내는 쪽 박스에는 원래 정보부터 데이터 비트 + 여분 비트까지, 받는 쪽 박스에는 오류 검출·정정과 되살린 데이터 비트가 있고, 매체는 두 박스 밖에 있다.
const members: Record<string, string[]> = {
  'sender': ['info', 'source-coding', 'data', 'channel-coding', 'coded'],
  'receiver': ['check', 'data-out'],
}
const noteLabels: Record<string, string> = {
  'source-note': '원래 정보를 비트로 바꾼다',
  'add-note': '여분 비트를 덧붙인다',
  'medium-note': '손상으로 비트가 바뀔 수 있다',
  'check-note': '여분으로 찾고 고친다',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
// 늘 보이는 화살표는 원래 정보에서 되살린 데이터 비트까지 한 줄로 이어지는 차례다.
const linkEnds: Record<string, [string, string]> = {
  'info-source': ['info', 'source-coding'],
  'source-data': ['source-coding', 'data'],
  'data-channel': ['data', 'channel-coding'],
  'channel-coded': ['channel-coding', 'coded'],
  'coded-medium': ['coded', 'medium'],
  'medium-check': ['medium', 'check'],
  'check-out': ['check', 'data-out'],
}
const tallPaths: Record<string, string> = {
  'info-source': 'M72 60 V80',
  'source-data': 'M72 112 V132',
  'data-channel': 'M72 164 V184',
  'channel-coded': 'M72 216 V236',
  'coded-medium': 'M72 268 V296',
  'medium-check': 'M72 328 V364',
  'check-out': 'M72 396 V416',
}
const widePaths: Record<string, string> = {
  'info-source': 'M104 44 H128',
  'source-data': 'M216 44 H248',
  'data-channel': 'M292 60 V100',
  'channel-coded': 'M248 116 H176',
  'coded-medium': 'M72 132 V196',
  'medium-check': 'M104 212 H200',
  'check-out': 'M300 212 H324',
}

const question = '오류를 찾으려고 보내는 쪽은 무엇을 더할까?'
const figureName = '원래 정보가 원천 부호화와 채널 부호화를 거쳐 매체로 나가고, 받는 쪽이 여분 비트로 오류를 찾거나 고쳐 데이터 비트를 되살리는 차례를 보이는 도식'
const svgName = '보내는 쪽 박스에 원래 정보·원천 부호화·데이터 비트·채널 부호화·데이터 비트 + 여분 비트를 차례로 잇고, 매체를 지나 받는 쪽 박스의 오류 검출·정정과 데이터 비트로 이은 그림'
const idleCaption = '보내는 쪽은 원래 정보를 데이터 비트로 바꾼 뒤 여분 비트를 덧붙여 매체로 내보내고, 받는 쪽은 그 여분으로 비트 오류를 살핀다. 버튼으로 원천 부호화와 채널 부호화를 고르면 각각 어디서 무엇을 하는지 볼 수 있다.'
const legend = '화살표는 정보가 보내는 쪽에서 매체를 지나 받는 쪽까지 거치는 차례다. 보내는 쪽 박스와 받는 쪽 박스는 그 일을 어느 쪽이 하는지 적는다.'
const expectedScenarios = [
  {
    id: 'source', label: '원천 부호화',
    nodes: ['info', 'source-coding', 'data'],
    paths: [] as string[],
    notes: ['source-note'],
    caption: '원천 부호화는 음성 같은 원래 정보를 비트로 바꾸거나 그 비트 수를 줄여 데이터 비트를 만든다. 비트 오류를 찾거나 고칠 여분 비트는 더하지 않는다.',
  },
  {
    id: 'channel', label: '채널 부호화',
    nodes: ['data', 'channel-coding', 'coded', 'medium', 'check', 'data-out'],
    paths: [] as string[],
    notes: ['add-note', 'medium-note', 'check-note'],
    caption: '채널 부호화는 데이터 비트로 계산한 여분 비트를 덧붙여 매체로 내보낸다. 매체를 지나며 손상으로 비트가 바뀌어도, 받는 쪽은 그 여분으로 비트 오류를 찾아내거나 고쳐 데이터 비트를 되살린다.',
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 264] : [0, 0, 280, 464]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<ChannelCodingFlowDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고, 늘 보이는 차례 화살표만 있고 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<ChannelCodingFlowDiagram />)
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

  it.each(expectedScenarios)('$label: 고른 노드와 곁말만 선명하고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<ChannelCodingFlowDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownLinks()).toEqual(Object.keys(linkEnds))
    expect(shownPaths()).toEqual(scenario.paths)
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
    render(<ChannelCodingFlowDiagram />)
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
    // 곁말은 자기 노드 곁의 빈자리에 들어간다 — 노드와는 위아래 4 이상 띄우고, 그룹 박스에 걸치지 않고(안에 들거나 밖에 있다), 선에 닿지 않는다.
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
        const groupArea = groupBox(group)
        expect(contains(groupArea, box) || !overlaps(groupArea, box), `${box.id}가 ${group} 테두리에 걸친다`).toBe(true)
        expect(overlaps(box, groupLabelBox(group)), `${box.id} ↔ ${group} 라벨`).toBe(false)
      }
      for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 앞 노드의 변에서 시작해 뒤 노드의 변에서 끝나고, 노드 안이나 그룹 라벨을 지나지 않으며 서로 겹치지 않는다', () => {
    render(<ChannelCodingFlowDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(linkEnds)))
    for (const [id, d] of Object.entries(paths)) {
      const { start, end } = lineEnds(d)
      expect(onEdge(start, nodeBox(linkEnds[id][0])), `${id} 시작`).toBe(true)
      expect(onEdge(end, nodeBox(linkEnds[id][1])), `${id} 끝`).toBe(true)
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

  // 요점: 화살표를 끝에서 끝으로 따라가면 원래 정보 → 원천 부호화 → 데이터 비트 → 채널 부호화 → 데이터 비트 + 여분 비트 → 매체 → 오류 검출·정정 → 데이터 비트다.
  // 「데이터 비트 + 여분 비트」는 채널 부호화에서 선명하고 원천 부호화에서 흐리며, 두 시나리오가 함께 선명하게 두는 노드는 첫 「데이터 비트」 하나뿐이다.
  it('원천 부호화와 채널 부호화가 차례의 다른 구간을 맡는다', async () => {
    render(<ChannelCodingFlowDiagram />)
    const order: string[] = ['info']
    for (let step = 0; step < Object.keys(linkEnds).length; step += 1) {
      const from = order[order.length - 1]
      const next = Object.values(paths).map(lineEnds).find(({ start }) => endpointNode(start) === from)
      order.push(endpointNode(next!.end)!)
    }
    expect(order).toEqual(['info', 'source-coding', 'data', 'channel-coding', 'coded', 'medium', 'check', 'data-out'])
    expect(contains(groupBox('sender'), nodeBox('coded'))).toBe(true)
    expect(overlaps(groupBox('sender'), nodeBox('medium')) || overlaps(groupBox('receiver'), nodeBox('medium'))).toBe(false)

    await select('원천 부호화')
    const sourceSharp = sharpNodes()
    expect(opacity('coded')).toBe('0.25')
    await select('채널 부호화')
    const channelSharp = sharpNodes()
    expect(opacity('coded')).toBe('1')
    expect(sourceSharp.filter((id) => channelSharp.includes(id))).toEqual(['data'])
    expect(channelSharp).toContain('data-out')

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const phrase of ['원래 정보를 비트로 바꾸거나', '여분 비트를 덧붙여', '원천 부호화를 먼저 하고 그 결과에 채널 부호화를 한다', '오류 검출', '오류 정정', '여분 비트를 떼어 내']) {
      expect(body, phrase).toContain(phrase)
    }
  })
}

describe('ChannelCodingFlowDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<ChannelCodingFlowDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 464')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('채널 부호화')
      const tallNotes = shownNotes()
      const tallSharp = sharpNodes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 264')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '채널 부호화' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownNotes()).toEqual(tallNotes)
      expect(sharpNodes()).toEqual(tallSharp)
      for (const link of svg().querySelectorAll('[data-link]')) expect(link).toHaveAttribute('d', widePaths[link.getAttribute('data-link')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', () => {
    render(<><ChannelCodingFlowDiagram /><ChannelCodingFlowDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      for (const path of figure.querySelectorAll('[data-link]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<ChannelCodingFlowDiagram />)
    const text = visualsByTopicId[topicId].diagrams['channel-coding-flow']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(channelCodingFlowScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = channelCodingFlowScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 채널 부호화 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
