import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { questions, topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ExpressRouteDiagram, expressRouteScenarios } from './ExpressRouteDiagram'

const conceptId = 'azure-virtual-networking.expressroute'
const labels: Record<string, string> = { onprem: '온-프레미스 네트워크', provider: '연결 공급자', internet: '공용 인터넷', vnet: 'Azure 가상 네트워크', m365: 'Microsoft 365' }
const expected = [
  { id: 'expressroute', label: 'ExpressRoute', nodes: ['onprem', 'provider', 'vnet', 'm365'], paths: ['er-in', 'er-vnet', 'er-m365'], notes: { 'er-note': '공용 인터넷을 지나지 않음' } },
  { id: 'vpn', label: '사이트 간 VPN', nodes: ['onprem', 'internet', 'vnet'], paths: ['vpn-in', 'vpn-vnet'], notes: { 'vpn-note': '암호화된 터널로 지남' } },
]
const diagram = () => screen.getByRole('img')
const wording = () => visualsByTopicId['azure-virtual-networking'].diagrams.expressroute
const ids = (selector: string, attribute: string) => Array.from(diagram().querySelectorAll(selector), (el) => el.getAttribute(attribute)!).sort()
const select = async (name: string) => { await act(async () => { await userEvent.click(screen.getByRole('button', { name })) }) }
function box(rect: Element): SvgBox {
  return {
    id: rect.parentElement?.getAttribute('data-node') ?? rect.getAttribute('data-group') ?? '',
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}
const nodeBox = (id: string) => box(diagram().querySelector(`[data-node="${id}"] rect`)!)
const groupBox = (id: string) => box(diagram().querySelector(`[data-group="${id}"]`)!)
const overlaps = (a: SvgBox, b: SvgBox) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
const inside = (child: SvgBox, parent: SvgBox) => child.x > parent.x && child.y > parent.y && child.x + child.width < parent.x + parent.width && child.y + child.height < parent.y + parent.height
function textBox(el: Element): SvgBox {
  const width = estimateTextWidth(el.textContent!, 9) * 1.15
  const x = Number(el.getAttribute('x'))
  return { id: el.getAttribute('data-note') ?? el.getAttribute('data-group-label') ?? '', x: el.getAttribute('text-anchor') === 'middle' ? x - width / 2 : x, y: Number(el.getAttribute('y')) - 9, width, height: 9 }
}

const pathEnds: Record<string, [string, string]> = { 'er-in': ['onprem', 'provider'], 'er-vnet': ['provider', 'vnet'], 'er-m365': ['provider', 'm365'], 'vpn-in': ['onprem', 'internet'], 'vpn-vnet': ['internet', 'vnet'] }

// 경로의 꺾이는 점을 펼쳐 끝점뿐 아니라 선분 전체를 검사한다.
function points(d: string) {
  let x = 0, y = 0
  return Array.from(d.matchAll(/([MHV])\s*(-?\d+)(?:\s+(-?\d+))?/g), ([, command, a, b]) => {
    if (command === 'M') { x = Number(a); y = Number(b) }
    if (command === 'H') x = Number(a)
    if (command === 'V') y = Number(a)
    return { x, y }
  })
}
function onEdge(point: { x: number, y: number }, b: SvgBox) {
  return ((point.x === b.x || point.x === b.x + b.width) && point.y >= b.y && point.y <= b.y + b.height)
    || ((point.y === b.y || point.y === b.y + b.height) && point.x >= b.x && point.x <= b.x + b.width)
}
function crosses(a: { x: number, y: number }, b: { x: number, y: number }, area: SvgBox) {
  if (a.x === b.x) return a.x > area.x && a.x < area.x + area.width && Math.max(a.y, b.y) > area.y && Math.min(a.y, b.y) < area.y + area.height
  return a.y > area.y && a.y < area.y + area.height && Math.max(a.x, b.x) > area.x && Math.min(a.x, b.x) < area.x + area.width
}
function expectPaths(visible: string[]) {
  expect(ids('[data-path]', 'data-path')).toEqual([...visible].sort())
  const areas = [
    ...Object.keys(labels).map(nodeBox),
    ...Array.from(diagram().querySelectorAll('[data-note], [data-group-label]'), textBox),
  ]
  for (const path of diagram().querySelectorAll('[data-path]')) {
    expect(path.closest('[opacity]')).toBeNull()
    expect(path.getAttribute('marker-end')).toMatch(/^url\(#.+\)$/)
    const id = path.getAttribute('data-path')!
    const d = path.getAttribute('d')!
    expect(d).toMatch(/^M[\d\sHV]+$/)
    const vertices = points(d)
    const [from, to] = pathEnds[id]
    expect(onEdge(vertices[0], nodeBox(from)), id).toBe(true)
    expect(onEdge(vertices[vertices.length - 1], nodeBox(to)), id).toBe(true)
    for (let i = 1; i < vertices.length; i++) {
      for (const area of areas) expect(crosses(vertices[i - 1], vertices[i], area), `${id} ↔ ${area.id}`).toBe(false)
    }
  }
}
function expectGeometry(width: number, height: number) {
  const rectangles = Array.from(diagram().querySelectorAll('rect'), box)
  expect(rectangles).toHaveLength(6)
  expect(boxesOutsideViewBox(rectangles, [0, 0, width, height])).toEqual([])
  for (const [id, label] of Object.entries(labels)) {
    const b = nodeBox(id)
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    expect(node.querySelector('text')).toHaveTextContent(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(node.querySelector('rect')).toHaveClass('stroke-disabled')
    expect(b.height).toBe(32)
    expect(estimateTextWidth(label, 10) * 1.15 + 12, label).toBeLessThanOrEqual(b.width)
    for (const other of Object.keys(labels).filter((otherId) => otherId !== id).map(nodeBox)) expect(overlaps(b, other), `${id} ↔ ${other.id}`).toBe(false)
  }
  for (const group of diagram().querySelectorAll('[data-group]')) expect(group.closest('[opacity]')).toBeNull()
  const textAreas = Array.from(diagram().querySelectorAll('[data-note], [data-group-label]'), textBox)
  expect(boxesOutsideViewBox(textAreas, [0, 0, width, height])).toEqual([])
  for (const el of diagram().querySelectorAll('[data-note]')) {
    expect(el).toHaveAttribute('font-size', '9')
    expect(el).toHaveClass('fill-muted')
  }
  for (const area of textAreas) {
    for (const n of Object.keys(labels).map(nodeBox)) expect(overlaps(area, n), `${area.id} ↔ ${n.id}`).toBe(false)
  }
  // 곁말은 그룹 박스의 변을 가로지르지 않는다.
  for (const note of Array.from(diagram().querySelectorAll('[data-note]'), textBox)) expect(overlaps(note, groupBox('microsoft')), note.id).toBe(false)
  expect(diagram().querySelector('[class*="diagram-"], [class*="green"], [class*="red"], [class*="orange"], [class*="amber"]')).toBeNull()
}

function layoutTests(width: number, height: number) {
  it('전체에서는 노드가 모두 선명하고 경로와 곁말이 없다', () => {
    render(<ExpressRouteDiagram />)
    expect(diagram()).toHaveAttribute('viewBox', `0 0 ${width} ${height}`)
    expect(ids('[data-node]', 'data-node')).toEqual(Object.keys(labels).sort())
    for (const n of diagram().querySelectorAll('[data-node]')) expect(n).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(wording().idleCaption)).toBeInTheDocument()
    expectGeometry(width, height)
    expectPaths([])
  })
  it.each(expected)('$label: 선명한 노드·경로·곁말이 설계와 같다', async (scenario) => {
    const { container } = render(<ExpressRouteDiagram />)
    await select(scenario.label)
    for (const n of diagram().querySelectorAll('[data-node]')) expect(n).toHaveAttribute('opacity', scenario.nodes.includes(n.getAttribute('data-node')!) ? '1' : '0.25')
    expect(ids('[data-note]', 'data-note')).toEqual(Object.keys(scenario.notes).sort())
    for (const [id, note] of Object.entries(scenario.notes)) expect(diagram().querySelector(`[data-note="${id}"]`)).toHaveTextContent(note)
    expect(container.querySelector('figcaption')!.textContent).toBe(wording().scenarios.find(({ id }) => id === scenario.id)!.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expectGeometry(width, height)
    expectPaths(scenario.paths)
  })
  it('요점: Azure 가상 네트워크와 Microsoft 365만 Microsoft 클라우드 안이다', () => {
    render(<ExpressRouteDiagram />)
    const holders: Record<string, boolean> = { vnet: true, m365: true, onprem: false, provider: false, internet: false }
    for (const [node, within] of Object.entries(holders)) expect(inside(nodeBox(node), groupBox('microsoft')), node).toBe(within)
    const label = diagram().querySelector('[data-group-label="microsoft"]')!
    expect(label.textContent).toBe(wording().groups!.microsoft)
    expect(inside(textBox(label), groupBox('microsoft'))).toBe(true)
    for (const n of Object.keys(labels).map(nodeBox)) expect(overlaps(textBox(label), n), `라벨 ↔ ${n.id}`).toBe(false)
  })
  it('요점: ExpressRoute의 길은 공용 인터넷에 닿지 않고, 사이트 간 VPN의 길은 연결 공급자와 Microsoft 365에 닿지 않는다', async () => {
    render(<ExpressRouteDiagram />)
    const opacity = (id: string) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')
    const pathTouches = (node: string) => Array.from(diagram().querySelectorAll('[data-path]')).some((path) => {
      const vertices = points(path.getAttribute('d')!)
      return onEdge(vertices[0], nodeBox(node)) || onEdge(vertices[vertices.length - 1], nodeBox(node))
    })
    await select('ExpressRoute')
    expect(opacity('internet')).toBe('0.25')
    expect(pathTouches('internet')).toBe(false)
    expect(pathTouches('m365')).toBe(true)
    await select('사이트 간 VPN')
    expect(opacity('provider')).toBe('0.25')
    expect(opacity('m365')).toBe('0.25')
    expect(pathTouches('provider')).toBe(false)
    expect(pathTouches('m365')).toBe(false)
  })
  it('요점: 두 길의 시작과 끝은 같다 — 온-프레미스 네트워크와 Azure 가상 네트워크가 두 시나리오 모두 선명하다', async () => {
    render(<ExpressRouteDiagram />)
    for (const scenario of expected) {
      await select(scenario.label)
      for (const id of ['onprem', 'vnet']) expect(diagram().querySelector(`[data-node="${id}"]`), `${scenario.id} ${id}`).toHaveAttribute('opacity', '1')
    }
  })
  it('시나리오를 바꾼 뒤 전체로 돌아오면 경로·곁말이 사라지고 노드가 모두 선명하다', async () => {
    render(<ExpressRouteDiagram />)
    for (const scenario of expected) await select(scenario.label)
    await select('전체')
    expectPaths([])
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
  })
}

describe('ExpressRouteDiagram', () => {
  it('물음형 제목은 헤딩 없이 버튼 앞에 있고 문구는 Azure JSON에서 읽는다', () => {
    render(<ExpressRouteDiagram />)
    const text = wording()
    const title = screen.getByText(text.question!)
    expect(title.tagName).toBe('P')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
    expect(screen.getByRole('figure')).toHaveAttribute('aria-label', text.label)
    expect(diagram()).toHaveAttribute('aria-label', text.svgLabel)
    expect(text.nodes).toEqual(labels)
    expect(screen.getByText(text.legend!)).toBeInTheDocument()
    expect(expressRouteScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    for (const scenario of expected) {
      const actual = expressRouteScenarios.find(({ id }) => id === scenario.id)!
      expect(actual.nodes).toEqual(scenario.nodes)
      expect(actual.paths).toEqual(scenario.paths)
      expect(actual.label).toBe(text.scenarios.find(({ id }) => id === scenario.id)!.label)
    }
  })
  it('세로형은 모바일 보정 래퍼 하나로 그린다', () => {
    render(<ExpressRouteDiagram />)
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
  })
  layoutTests(280, 188)
  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', () => {
    render(<><ExpressRouteDiagram /><ExpressRouteDiagram /></>)
    const markerIds = Array.from(document.querySelectorAll('marker'), (marker) => marker.id)
    expect(markerIds).toHaveLength(2)
    expect(new Set(markerIds).size).toBe(2)
  })
  it.each([2, 4] as const)('공유 본문 h%i에서 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === 'azure-virtual-networking')!.concepts.find(({ id }) => id === conceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: wording().label })
    expect(figure.closest('article')).toHaveAttribute('id', conceptId)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(within(figure).queryByRole('heading')).toBeNull()
  })
  it('개념 16·17을 잇고 본문에 그림의 예를 쓰며 문항을 연결한다', () => {
    const topic = topics.find(({ id }) => id === 'azure-virtual-networking')!
    expect(topic.concepts).toHaveLength(8)
    expect(topic.concepts.slice(6).map(({ id, parentId, name }) => ({ id, parentId, name }))).toEqual([
      { id: conceptId, parentId: undefined, name: 'ExpressRoute' },
      { id: 'azure-virtual-networking.azure-dns', parentId: undefined, name: 'Azure DNS' },
    ])
    const route = topic.concepts[6].paragraphs.join(' ')
    for (const label of ['회사 D', '온-프레미스 네트워크', '연결 공급자', 'ExpressRoute 회로', 'Azure 가상 네트워크', 'Microsoft 365', '사이트 간 VPN', '공용 인터넷']) expect(route).toContain(label)
    expect(topic.concepts[7].paragraphs.join(' ')).toContain('살 수 없다')
    expect(questions.find(({ id }) => id === 'az076')).toMatchObject({ conceptId, format: 'choice', answerIndex: 0 })
    expect(questions.find(({ id }) => id === 'az077')).toMatchObject({ conceptId, format: 'yes-no', answer: true })
    expect(questions.find(({ id }) => id === 'az078')).toMatchObject({ conceptId: 'azure-virtual-networking.azure-dns', format: 'yes-no', answer: false })
  })
  describe('가로형 (768px 이상)', () => {
    function mediaMock(matches: boolean) {
      const listeners = new Set<() => void>()
      const query = { matches, media: WIDE_DIAGRAM_QUERY, addEventListener: (_type: string, cb: () => void) => listeners.add(cb), removeEventListener: (_type: string, cb: () => void) => listeners.delete(cb) }
      vi.stubGlobal('matchMedia', vi.fn(() => query))
      return (next: boolean) => { query.matches = next; listeners.forEach((cb) => cb()) }
    }
    beforeEach(() => { mediaMock(true) })
    afterEach(() => { vi.unstubAllGlobals() })
    layoutTests(440, 180)
    it('가로형은 w-full 래퍼와 SVG 하나뿐이다', () => {
      render(<ExpressRouteDiagram />)
      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
    })
    it('폭을 왕복해도 노드·경로 id와 선택·캡션을 유지한다', async () => {
      const change = mediaMock(false)
      const { container } = render(<ExpressRouteDiagram />)
      await select('사이트 간 VPN')
      const before = { nodes: ids('[data-node]', 'data-node'), paths: ids('[data-path]', 'data-path'), caption: container.querySelector('figcaption')!.textContent }
      for (const wide of [true, false]) {
        act(() => change(wide))
        expect(diagram()).toHaveAttribute('viewBox', wide ? '0 0 440 180' : '0 0 280 188')
        expect(ids('[data-node]', 'data-node')).toEqual(before.nodes)
        expect(ids('[data-path]', 'data-path')).toEqual(before.paths)
        expect(container.querySelector('figcaption')!.textContent).toBe(before.caption)
        expect(screen.getByRole('button', { name: '사이트 간 VPN' })).toHaveAttribute('aria-pressed', 'true')
      }
    })
  })
})
