import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { FirewallHubDiagram, firewallHubScenarios } from './FirewallHubDiagram'

const conceptId = 'azure-network-protection.azure-firewall'
const labels = {"vm-1":"VM 1","vm-2":"VM 2","firewall":"Azure Firewall","internet":"인터넷"}
const endpoints = {"a-to-fw":["vm-1","firewall"],"b-to-fw":["vm-2","firewall"],"fw-to-internet":["firewall","internet"],"fw-to-b":["firewall","vm-2"]} as const
const expected = [{"id":"outbound","label":"인터넷으로 나갈 때","nodes":["vm-1","vm-2","firewall","internet"],"paths":["a-to-fw","b-to-fw","fw-to-internet"],"notes":{"outbound-note":"규칙 한 벌로 거름"}},{"id":"between","label":"가상 네트워크 사이","nodes":["vm-1","firewall","vm-2"],"paths":["a-to-fw","fw-to-b"],"notes":{"between-note":"가상 네트워크 사이도 거름"}}]
const groupIds = ["vnet-a","vnet-b","fw-vnet"]
const diagram = () => screen.getByRole('img')
const wording = () => visualsByTopicId['azure-network-protection'].diagrams['firewall-hub']
const ids = (selector: string, attribute: string) => Array.from(diagram().querySelectorAll(selector), (el) => el.getAttribute(attribute)!).sort()
const select = async (name: string) => { await act(async () => { await userEvent.click(screen.getByRole('button', { name })) }) }
function box(rect: Element): SvgBox {
  return {
    id: rect.parentElement?.getAttribute('data-node') ?? rect.getAttribute('data-group') ?? '',
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}
const nodeBox = (id: string) => ({ ...box(diagram().querySelector(`[data-node="${id}"] rect`)!), id })
const groupBox = (id: string) => box(diagram().querySelector(`[data-group="${id}"]`)!)
const overlaps = (a: SvgBox, b: SvgBox) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
const inside = (child: SvgBox, parent: SvgBox) => child.x > parent.x && child.y > parent.y && child.x + child.width < parent.x + parent.width && child.y + child.height < parent.y + parent.height
function textBox(el: Element): SvgBox {
  const width = estimateTextWidth(el.textContent!, 9) * 1.15
  const x = Number(el.getAttribute('x'))
  return { id: el.getAttribute('data-note') ?? el.getAttribute('data-group-label') ?? '', x: el.getAttribute('text-anchor') === 'middle' ? x - width / 2 : x, y: Number(el.getAttribute('y')) - 9, width, height: 9 }
}
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
    const id = path.getAttribute('data-path')! as keyof typeof endpoints
    expect(path.closest('[opacity]')).toBeNull()
    expect(path.getAttribute('marker-end')).toMatch(/^url\(#.+\)$/)
    const d = path.getAttribute('d')!
    expect(d).toMatch(/^M[\d\sHV]+$/)
    const vertices = points(d)
    const [from, to] = endpoints[id]
    expect(onEdge(vertices[0], nodeBox(from)), id).toBe(true)
    expect(onEdge(vertices[vertices.length - 1], nodeBox(to)), id).toBe(true)
    for (let i = 1; i < vertices.length; i++) {
      for (const area of areas) expect(crosses(vertices[i - 1], vertices[i], area), `${id} ↔ ${area.id}`).toBe(false)
    }
  }
}
function expectGeometry(width: number, height: number) {
  const rectangles = Array.from(diagram().querySelectorAll('rect'), box)
  expect(rectangles).toHaveLength(Object.keys(labels).length + groupIds.length)
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
  const textAreas = Array.from(diagram().querySelectorAll('[data-note], [data-group-label]'), textBox)
  expect(boxesOutsideViewBox(textAreas, [0, 0, width, height])).toEqual([])
  for (const group of groupIds) {
    const label = diagram().querySelector(`[data-group-label="${group}"]`)!
    expect(label.textContent).toBe(wording().groups![group])
    expect(label).toHaveAttribute('font-size', '9')
    expect(inside(textBox(label), groupBox(group)), group).toBe(true)
    expect(diagram().querySelector(`[data-group="${group}"]`)!.closest('[opacity]')).toBeNull()
  }
  for (const el of diagram().querySelectorAll('[data-note]')) {
    expect(el).toHaveAttribute('font-size', '9')
    expect(el).toHaveClass('fill-muted')
    for (const group of groupIds) expect(overlaps(textBox(el), groupBox(group)), `${el.getAttribute('data-note')} ↔ ${group}`).toBe(false)
  }
  for (let i = 0; i < textAreas.length; i++) {
    for (const n of Object.keys(labels).map(nodeBox)) expect(overlaps(textAreas[i], n), `${textAreas[i].id} ↔ ${n.id}`).toBe(false)
    for (let j = i + 1; j < textAreas.length; j++) expect(overlaps(textAreas[i], textAreas[j]), `${textAreas[i].id} ↔ ${textAreas[j].id}`).toBe(false)
  }
  expect(diagram().querySelector('[class*="diagram-"], [class*="green"], [class*="red"], [class*="orange"], [class*="amber"]')).toBeNull()
}

function layoutTests(width: number, height: number) {
  it('전체에서는 노드가 모두 선명하고 시나리오 경로와 곁말이 없다', () => {
    render(<FirewallHubDiagram />)
    expect(diagram()).toHaveAttribute('viewBox', `0 0 ${width} ${height}`)
    expect(ids('[data-node]', 'data-node')).toEqual(Object.keys(labels).sort())
    expect(ids('[data-group]', 'data-group')).toEqual([...groupIds].sort())
    for (const n of diagram().querySelectorAll('[data-node]')) expect(n).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(wording().idleCaption)).toBeInTheDocument()
    expectGeometry(width, height)
    expectPaths([])
  })
  it.each(expected)('$label: 선명한 노드·경로·곁말·캡션이 설계와 같다', async (scenario) => {
    const { container } = render(<FirewallHubDiagram />)
    await select(scenario.label)
    for (const n of diagram().querySelectorAll('[data-node]')) expect(n).toHaveAttribute('opacity', scenario.nodes.includes(n.getAttribute('data-node')!) ? '1' : '0.25')
    expect(ids('[data-note]', 'data-note')).toEqual(Object.keys(scenario.notes).sort())
    for (const [id, note] of Object.entries(scenario.notes)) expect(diagram().querySelector(`[data-note="${id}"]`)).toHaveTextContent(note as string)
    expect(container.querySelector('figcaption')!.textContent).toBe(wording().scenarios.find(({ id }) => id === scenario.id)!.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expectGeometry(width, height)
    expectPaths(scenario.paths)
  })
  it('요점: VM은 자기 가상 네트워크 안에 있고 방화벽은 그 둘 밖의 한곳에 있다', () => {
    render(<FirewallHubDiagram />)
    expect(inside(nodeBox('vm-1'), groupBox('vnet-a'))).toBe(true)
    expect(inside(nodeBox('vm-2'), groupBox('vnet-b'))).toBe(true)
    expect(inside(nodeBox('firewall'), groupBox('fw-vnet'))).toBe(true)
    for (const group of ['vnet-a', 'vnet-b']) expect(overlaps(nodeBox('firewall'), groupBox(group)), group).toBe(false)
    for (const group of groupIds) expect(overlaps(nodeBox('internet'), groupBox(group)), group).toBe(false)
  })
  it.each(expected)('요점: $label의 모든 경로는 한 끝이 방화벽이다', async (scenario) => {
    render(<FirewallHubDiagram />)
    await select(scenario.label)
    for (const path of diagram().querySelectorAll('[data-path]')) {
      const vertices = points(path.getAttribute('d')!)
      const ends = [vertices[0], vertices[vertices.length - 1]]
      expect(ends.some((end) => onEdge(end, nodeBox('firewall'))), path.getAttribute('data-path')!).toBe(true)
    }
  })
  it('요점: 가상 네트워크 사이 장면에서는 인터넷이 흐려진다', async () => {
    render(<FirewallHubDiagram />)
    await select('가상 네트워크 사이')
    expect(diagram().querySelector('[data-node="internet"]')).toHaveAttribute('opacity', '0.25')
  })
  it('시나리오를 바꾼 뒤 전체로 돌아오면 경로·곁말이 사라지고 노드가 모두 선명하다', async () => {
    render(<FirewallHubDiagram />)
    for (const scenario of expected) await select(scenario.label)
    await select('전체')
    expectPaths([])
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
  })
}

describe('FirewallHubDiagram', () => {
  it('물음형 제목은 헤딩 없이 버튼 앞에 있고 문구는 Azure JSON에서 읽는다', () => {
    render(<FirewallHubDiagram />)
    const text = wording()
    const title = screen.getByText(text.question!)
    expect(title.tagName).toBe('P')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
    expect(screen.getByRole('figure')).toHaveAttribute('aria-label', text.label)
    expect(diagram()).toHaveAttribute('aria-label', text.svgLabel)
    expect(text.nodes).toEqual(labels)
    expect(screen.getByText(text.legend!)).toBeInTheDocument()
    expect(firewallHubScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    for (const scenario of expected) {
      const actual = firewallHubScenarios.find(({ id }) => id === scenario.id)!
      expect(actual.nodes).toEqual(scenario.nodes)
      expect(actual.paths).toEqual(scenario.paths)
      expect(actual.label).toBe(scenario.label)
    }
  })
  it('세로형은 모바일 보정 래퍼 하나로 그린다', () => {
    render(<FirewallHubDiagram />)
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
  })
  layoutTests(280, 228)
  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', () => {
    render(<><FirewallHubDiagram /><FirewallHubDiagram /></>)
    const markerIds = Array.from(document.querySelectorAll('marker'), (marker) => marker.id)
    expect(markerIds).toHaveLength(2)
    expect(new Set(markerIds).size).toBe(2)
  })
  it.each([2, 4] as const)('공유 본문 h%i에서 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === 'azure-network-protection')!.concepts.find(({ id }) => id === conceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: wording().label })
    expect(figure.closest('article')).toHaveAttribute('id', conceptId)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(within(figure).queryByRole('heading')).toBeNull()
  })
  it('본문에 그림의 예를 쓴다', () => {
    const concept = topics.find(({ id }) => id === 'azure-network-protection')!.concepts.find(({ id }) => id === conceptId)!
    const prose = concept.paragraphs.join(' ')
    for (const word of ["회사 F","가상 네트워크 A","가상 네트워크 B","VM 1","VM 2","피어링"]) expect(prose).toContain(word)
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
    layoutTests(440, 160)
    it('가로형은 w-full 래퍼와 SVG 하나뿐이다', () => {
      render(<FirewallHubDiagram />)
      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
    })
    it('폭을 왕복해도 노드·경로 id와 선택·캡션을 유지한다', async () => {
      const change = mediaMock(false)
      const { container } = render(<FirewallHubDiagram />)
      await select('인터넷으로 나갈 때')
      const before = { nodes: ids('[data-node]', 'data-node'), paths: ids('[data-path]', 'data-path'), caption: container.querySelector('figcaption')!.textContent }
      for (const wide of [true, false]) {
        act(() => change(wide))
        expect(diagram()).toHaveAttribute('viewBox', wide ? '0 0 440 160' : '0 0 280 228')
        expect(ids('[data-node]', 'data-node')).toEqual(before.nodes)
        expect(ids('[data-path]', 'data-path')).toEqual(before.paths)
        expect(container.querySelector('figcaption')!.textContent).toBe(before.caption)
        expect(screen.getByRole('button', { name: '인터넷으로 나갈 때' })).toHaveAttribute('aria-pressed', 'true')
      }
    })
  })
})
