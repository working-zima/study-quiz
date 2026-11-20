import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { FirewallRulesDiagram, firewallRulesScenarios } from './FirewallRulesDiagram'

const topicId = 'network-security'
const anchorConceptId = `${topicId}.firewall`
const labels: Record<string, string> = {
  'req443': 'TCP 443 연결',
  'req8080': 'TCP 8080 연결',
  'fw01': 'FW01',
  'rule-allow': 'TCP 443 → 192.0.2.20: 허용',
  'rule-deny': '그 밖: 거부',
  'web': '웹 서버 192.0.2.20',
  'pc01': 'PC01',
  'pc02': 'PC02',
}
const groupLabels: Record<string, string> = {
  'internet': '인터넷',
  'rules': 'FW01의 규칙',
  'internal': '사내 네트워크',
}
const noteLabels: Record<string, string> = {
  'allow-note': '규칙에 맞아 지나간다',
  'deny-note': 'FW01에서 막힌다',
  'bypass-note': 'FW01을 지나지 않는다',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
// 그룹 박스마다 담는 노드. FW01은 어느 박스에도 들지 않는다.
const members: Record<string, string[]> = {
  'internet': ['req443', 'req8080'],
  'rules': ['rule-allow', 'rule-deny'],
  'internal': ['web', 'pc01', 'pc02'],
}
// 화살표는 연결을 청하거나 데이터를 보낸 쪽의 변에서 나가 받는 쪽의 변에서 끝난다.
const pathEnds: Record<string, [string, string]> = {
  'req443-fw': ['req443', 'fw01'],
  'req8080-fw': ['req8080', 'fw01'],
  'fw-web': ['fw01', 'web'],
  'pc01-pc02': ['pc01', 'pc02'],
}
const tallPaths: Record<string, string> = {
  'req443-fw': 'M68 64 V120 H100',
  'req8080-fw': 'M214 64 V120 H180',
  'fw-web': 'M180 128 H232 V292',
  'pc01-pc02': 'M80 360 H184',
}
const widePaths: Record<string, string> = {
  'req443-fw': 'M112 52 H156',
  'req8080-fw': 'M116 100 H188 V80',
  'fw-web': 'M220 64 H268',
  'pc01-pc02': 'M324 132 H372',
}

const question = '방화벽은 어떤 트래픽을 들여보낼까?'
const figureName = '방화벽 FW01이 규칙에 따라 웹 서버 192.0.2.20의 TCP 443 연결은 들여보내고 TCP 8080 연결은 막으며, 사내 PC끼리의 트래픽은 FW01을 지나지 않는 모습을 보이는 도식'
const svgName = '인터넷 박스(TCP 443 연결·TCP 8080 연결), 방화벽 FW01, FW01의 규칙 박스(허용 규칙·거부 규칙), 사내 네트워크 박스(웹 서버 192.0.2.20·PC01·PC02)를 둔 그림'
const idleCaption = '인터넷에서 온 연결 둘은 사내 네트워크로 들어가려면 방화벽 FW01을 지나야 하고, FW01은 위에서부터 규칙 둘과 견주어 들여보낼지 정한다. 버튼을 고르면 연결마다 어떻게 되는지와, FW01을 지나지 않는 사내 트래픽을 볼 수 있다.'
const legend = '화살표는 연결을 청하거나 데이터를 보내는 쪽에서 받는 쪽으로 가는 길이다. FW01·PC01·PC02는 예로 붙인 이름표이고 192.0.2.20은 문서의 예로 쓰라고 남겨 둔 주소다. 8080은 예로 든 포트 번호이고, PC01과 PC02를 잇는 스위치는 그리지 않았다.'
const expectedScenarios = [
  {
    id: 'allow', label: '허용',
    nodes: ['req443', 'fw01', 'rule-allow', 'web'],
    paths: ['req443-fw', 'fw-web'],
    notes: ['allow-note'],
    caption: '인터넷의 컴퓨터가 웹 서버 192.0.2.20의 TCP 443번 포트로 청한 연결이다. FW01이 위에서부터 견주면 첫째 규칙 「TCP 443 → 192.0.2.20: 허용」에 맞으므로 들여보내고, 연결은 웹 서버에 닿는다.',
  },
  {
    id: 'deny', label: '거부',
    nodes: ['req8080', 'fw01', 'rule-deny'],
    paths: ['req8080-fw'],
    notes: ['deny-note'],
    caption: '같은 웹 서버라도 TCP 8080번 포트로 청한 연결은 포트가 달라 첫째 규칙에 맞지 않는다. 둘째 규칙 「그 밖: 거부」에 맞아 FW01에서 막히고, 웹 서버는 이 연결을 받지 못한다.',
  },
  {
    id: 'bypass', label: '거치지 않는 트래픽',
    nodes: ['pc01', 'pc02'],
    paths: ['pc01-pc02'],
    notes: ['bypass-note'],
    caption: '같은 스위치에 이어진 PC01과 PC02가 주고받는 트래픽은 사내 네트워크 안에서만 오가 FW01을 지나지 않는다. 그래서 FW01의 규칙은 이 트래픽에 닿지 않고, 사내 컴퓨터끼리의 공격도 FW01은 막지 못한다.',
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
  return nodeIds.filter((id) => onEdge(point, nodeBox(id)))
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 256] : [0, 0, 280, 408]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<FirewallRulesDiagram />)
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
    const { container } = render(<FirewallRulesDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<FirewallRulesDiagram />)
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
    render(<FirewallRulesDiagram />)
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
    for (const group of groupIds) {
      for (const other of groupIds.filter((otherId) => otherId !== group)) expect(overlaps(groupBox(group), groupBox(other)), `${group} ↔ ${other}`).toBe(false)
    }
    for (const id of groupIds) {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
    }
    // 곁말은 viewBox 안에 들어가고, 노드·그룹 라벨·선과 겹치지 않는다. 허용과 거부의 곁말은 FW01 위 같은 자리를 함께 쓴다 — 함께 보이지 않으므로
    // 같은 시나리오의 곁말끼리만 겹치지 않는지 본다.
    const noteBoxes: SvgBox[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const shown = scenario.notes.map((id) => textBox(note(id), id))
      for (const box of shown) for (const other of shown.filter(({ id }) => id !== box.id)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
      noteBoxes.push(...shown)
    }
    expect([...noteBoxes.map(({ id }) => id)].sort()).toEqual([...noteIds].sort())
    expect(boxesOutsideViewBox(noteBoxes, viewBox)).toEqual([])
    for (const box of noteBoxes) {
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
      for (const group of groupIds) expect(overlaps(box, groupLabelBox(group)), `${box.id} ↔ ${group} 라벨`).toBe(false)
      for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 보낸 쪽의 변에서 시작해 받는 쪽의 변에서 끝나고, 노드 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<FirewallRulesDiagram />)
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

  // 요점: 허용 규칙에 맞는 연결은 FW01을 지나 웹 서버에서 끝나고, 거부 규칙에 걸린 연결은 FW01에서 끝나 웹 서버로 이어지지 않는다.
  // FW01을 지나지 않는 사내 트래픽은 FW01에 닿지 않고, 그때 FW01은 흐리다 — 방화벽의 규칙은 자기를 지나는 트래픽에만 닿는다.
  it('규칙에 맞는 연결만 웹 서버에 닿고, FW01을 지나지 않는 사내 트래픽에는 FW01의 규칙이 닿지 않는다', async () => {
    render(<FirewallRulesDiagram />)

    await select('허용')
    const allowEnds = shownPaths().map((id) => lineEnds(paths[id]))
    expect(allowEnds.map(({ start, end }) => [endpointNode(start), endpointNode(end)])).toEqual([[['req443'], ['fw01']], [['fw01'], ['web']]])
    expect(opacity('rule-allow')).toBe('1')
    expect(opacity('rule-deny')).toBe('0.25')

    await select('거부')
    const denyEnds = shownPaths().map((id) => lineEnds(paths[id]))
    expect(endpointNode(denyEnds[denyEnds.length - 1].end)).toEqual(['fw01'])
    for (const id of shownPaths()) for (const segment of segments(paths[id])) expect(touches(segment, nodeBox('web')), id).toBe(false)
    expect(opacity('web')).toBe('0.25')
    expect(opacity('rule-deny')).toBe('1')
    expect(opacity('rule-allow')).toBe('0.25')

    await select('거치지 않는 트래픽')
    expect(shownPaths()).not.toHaveLength(0)
    for (const id of shownPaths()) for (const segment of segments(paths[id])) expect(touches(segment, nodeBox('fw01')), id).toBe(false)
    expect(opacity('fw01')).toBe('0.25')
    for (const id of shownPaths()) {
      const { start, end } = lineEnds(paths[id])
      for (const point of [start, end]) expect(members.internal).toEqual(expect.arrayContaining(endpointNode(point)))
    }

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const phrase of ['방화벽 `FW01`', '웹 서버 `192.0.2.20`', '「TCP `443` → `192.0.2.20`: 허용」', '「그 밖: 거부」', 'TCP `443` 연결', 'TCP `8080` 연결', '`FW01`에서 막힌다', '`PC01`과 `PC02`', '`FW01`을 지나지 않으므로']) {
      expect(body, phrase).toContain(phrase)
    }
  })
}

describe('FirewallRulesDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<FirewallRulesDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 408')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('거부')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 256')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '거부' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><FirewallRulesDiagram /><FirewallRulesDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '허용' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<FirewallRulesDiagram />)
    const text = visualsByTopicId[topicId].diagrams['firewall-rules']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(firewallRulesScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = firewallRulesScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 방화벽 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
