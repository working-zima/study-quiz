import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { questions, topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { SiteToSiteVpnDiagram, siteToSiteVpnScenarios } from './SiteToSiteVpnDiagram'

const conceptId = 'azure-virtual-networking.vpn-gateway'
const labels: Record<string, string> = { 'vpn-device': '온-프레미스 VPN 디바이스', lng: '로컬 네트워크 게이트웨이', laptop: '집의 컴퓨터', 'vpn-gw': 'VPN 게이트웨이', 'vm-1': 'VM 1' }
const expected = [
  { id: 'site-to-site', label: '사이트 간', nodes: ['vpn-device', 'lng', 'vpn-gw', 'vm-1'], paths: ['s2s-tunnel', 'gw-to-vm'], notes: { 's2s-note': '인터넷 위의 암호화된 터널', 'lng-note': '온-프레미스 위치를 Azure에 알림' } },
  { id: 'point-to-site', label: '지점 및 사이트 간', nodes: ['laptop', 'vpn-gw', 'vm-1'], paths: ['p2s-tunnel', 'gw-to-vm'], notes: { 'laptop-note': '컴퓨터가 연결을 시작' } },
]
const diagram = () => screen.getByRole('img')
const wording = () => visualsByTopicId['azure-virtual-networking'].diagrams['site-to-site-vpn']
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

const pathEnds: Record<string, [string, string]> = { 's2s-tunnel': ['vpn-device', 'vpn-gw'], 'p2s-tunnel': ['laptop', 'vpn-gw'], 'gw-to-vm': ['vpn-gw', 'vm-1'] }

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
  expect(rectangles).toHaveLength(8)
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
  const notes = Array.from(diagram().querySelectorAll('[data-note]'), textBox)
  for (const note of notes) {
    for (const group of ['onprem', 'vnet', 'gateway-subnet'].map(groupBox)) expect(overlaps(note, group), `${note.id} ↔ ${group.id}`).toBe(false)
    for (const other of notes.filter(({ id }) => id !== note.id)) expect(overlaps(note, other), `${note.id} ↔ ${other.id}`).toBe(false)
  }
  expect(diagram().querySelector('[class*="diagram-"], [class*="green"], [class*="red"], [class*="orange"], [class*="amber"]')).toBeNull()
}

function layoutTests(width: number, height: number) {
  it('전체에서는 노드가 모두 선명하고 경로와 곁말이 없다', () => {
    render(<SiteToSiteVpnDiagram />)
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
    const { container } = render(<SiteToSiteVpnDiagram />)
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
  it('요점: VPN 게이트웨이는 게이트웨이 서브넷 안, 로컬 네트워크 게이트웨이와 집의 컴퓨터는 두 네트워크 밖이다', () => {
    render(<SiteToSiteVpnDiagram />)
    expect(inside(groupBox('gateway-subnet'), groupBox('vnet'))).toBe(true)
    const holders: Record<string, string[]> = { 'vpn-gw': ['gateway-subnet', 'vnet'], 'vm-1': ['vnet'], 'vpn-device': ['onprem'], lng: [], laptop: [] }
    for (const [node, groups] of Object.entries(holders)) {
      for (const group of ['onprem', 'vnet', 'gateway-subnet']) expect(inside(nodeBox(node), groupBox(group)), `${node} in ${group}`).toBe(groups.includes(group))
    }
    for (const rect of diagram().querySelectorAll('[data-group]')) {
      const id = rect.getAttribute('data-group')!
      const label = diagram().querySelector(`[data-group-label="${id}"]`)!
      expect(label.textContent).toBe(wording().groups![id])
      expect(inside(textBox(label), box(rect)), id).toBe(true)
      for (const n of Object.keys(labels).map(nodeBox)) expect(overlaps(textBox(label), n), `${id} 라벨 ↔ ${n.id}`).toBe(false)
    }
    expect(overlaps(textBox(diagram().querySelector('[data-group-label="vnet"]')!), groupBox('gateway-subnet'))).toBe(false)
  })
  it('요점: 두 시나리오 모두 VPN 게이트웨이가 선명하고 터널의 끝점이 VPN 게이트웨이 변 위에 있으며, 로컬 네트워크 게이트웨이는 터널의 끝이 아니다', async () => {
    render(<SiteToSiteVpnDiagram />)
    const opacity = (id: string) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')
    const pathEnd = (id: string) => { const vertices = points(diagram().querySelector(`[data-path="${id}"]`)!.getAttribute('d')!); return vertices[vertices.length - 1] }
    const pathTouches = (node: string) => Array.from(diagram().querySelectorAll('[data-path]')).some((path) => {
      const vertices = points(path.getAttribute('d')!)
      return onEdge(vertices[0], nodeBox(node)) || onEdge(vertices[vertices.length - 1], nodeBox(node))
    })
    await select('사이트 간')
    expect(opacity('vpn-gw')).toBe('1')
    expect(opacity('laptop')).toBe('0.25')
    expect(onEdge(pathEnd('s2s-tunnel'), nodeBox('vpn-gw'))).toBe(true)
    expect(pathTouches('lng')).toBe(false)
    await select('지점 및 사이트 간')
    expect(opacity('vpn-gw')).toBe('1')
    expect(opacity('vpn-device')).toBe('0.25')
    expect(opacity('lng')).toBe('0.25')
    expect(onEdge(pathEnd('p2s-tunnel'), nodeBox('vpn-gw'))).toBe(true)
    expect(pathTouches('lng')).toBe(false)
    expect(pathTouches('vpn-device')).toBe(false)
  })
  it('시나리오를 바꾼 뒤 전체로 돌아오면 경로·곁말이 사라지고 노드가 모두 선명하다', async () => {
    render(<SiteToSiteVpnDiagram />)
    for (const scenario of expected) await select(scenario.label)
    await select('전체')
    expectPaths([])
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
  })
}

describe('SiteToSiteVpnDiagram', () => {
  it('물음형 제목은 헤딩 없이 버튼 앞에 있고 문구는 Azure JSON에서 읽는다', () => {
    render(<SiteToSiteVpnDiagram />)
    const text = wording()
    const title = screen.getByText(text.question!)
    expect(title.tagName).toBe('P')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
    expect(screen.getByRole('figure')).toHaveAttribute('aria-label', text.label)
    expect(diagram()).toHaveAttribute('aria-label', text.svgLabel)
    expect(text.nodes).toEqual(labels)
    expect(screen.getByText(text.legend!)).toBeInTheDocument()
    expect(siteToSiteVpnScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    for (const scenario of expected) {
      const actual = siteToSiteVpnScenarios.find(({ id }) => id === scenario.id)!
      expect(actual.nodes).toEqual(scenario.nodes)
      expect(actual.paths).toEqual(scenario.paths)
      expect(actual.label).toBe(text.scenarios.find(({ id }) => id === scenario.id)!.label)
    }
  })
  it('세로형은 모바일 보정 래퍼 하나로 그린다', () => {
    render(<SiteToSiteVpnDiagram />)
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
  })
  layoutTests(280, 308)
  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', () => {
    render(<><SiteToSiteVpnDiagram /><SiteToSiteVpnDiagram /></>)
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
  it('개념 14·15를 잇고 본문에 그림의 예를 쓰며 문항을 연결한다', () => {
    const topic = topics.find(({ id }) => id === 'azure-virtual-networking')!
    expect(topic.concepts.slice(4, 6).map(({ id, parentId, name }) => ({ id, parentId, name }))).toEqual([
      { id: conceptId, parentId: undefined, name: 'VPN 게이트웨이' },
      { id: 'azure-virtual-networking.vpn-connection-types', parentId: conceptId, name: 'VPN 게이트웨이 연결 유형' },
    ])
    const gateway = topic.concepts[4].paragraphs.join(' ')
    for (const label of ['회사 C', '온-프레미스 VPN 디바이스', '로컬 네트워크 게이트웨이', 'VPN 게이트웨이', '게이트웨이 서브넷', 'VM 1', '`GatewaySubnet`']) expect(gateway).toContain(label)
    const types = topic.concepts[5].paragraphs
    expect(types[1]).toMatch(/^- \*\*사이트 간\*\*\(Site-to-Site\)/u)
    expect(types[2]).toMatch(/^- \*\*지점 및 사이트 간\*\*\(Point-to-Site\)/u)
    expect(types[3]).toMatch(/^- \*\*VNet 간\*\*\(VNet-to-VNet\)/u)
    expect(types.join(' ')).toContain('집의 컴퓨터')
    expect(questions.find(({ id }) => id === 'az073')).toMatchObject({ conceptId, format: 'choice', answerIndex: 1 })
    expect(questions.find(({ id }) => id === 'az074')).toMatchObject({ conceptId, format: 'yes-no', answer: true })
    expect(questions.find(({ id }) => id === 'az075')).toMatchObject({ conceptId: 'azure-virtual-networking.vpn-connection-types', format: 'choice', answerIndex: 2 })
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
    layoutTests(440, 200)
    it('가로형은 w-full 래퍼와 SVG 하나뿐이다', () => {
      render(<SiteToSiteVpnDiagram />)
      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
    })
    it('폭을 왕복해도 노드·경로 id와 선택·캡션을 유지한다', async () => {
      const change = mediaMock(false)
      const { container } = render(<SiteToSiteVpnDiagram />)
      await select('지점 및 사이트 간')
      const before = { nodes: ids('[data-node]', 'data-node'), paths: ids('[data-path]', 'data-path'), caption: container.querySelector('figcaption')!.textContent }
      for (const wide of [true, false]) {
        act(() => change(wide))
        expect(diagram()).toHaveAttribute('viewBox', wide ? '0 0 440 200' : '0 0 280 308')
        expect(ids('[data-node]', 'data-node')).toEqual(before.nodes)
        expect(ids('[data-path]', 'data-path')).toEqual(before.paths)
        expect(container.querySelector('figcaption')!.textContent).toBe(before.caption)
        expect(screen.getByRole('button', { name: '지점 및 사이트 간' })).toHaveAttribute('aria-pressed', 'true')
      }
    })
  })
})
