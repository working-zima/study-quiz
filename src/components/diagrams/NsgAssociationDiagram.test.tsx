import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { questions, topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { NsgAssociationDiagram, nsgAssociationScenarios } from './NsgAssociationDiagram'

const conceptId = 'azure-network-protection.network-security-groups'
const labels = { 'nsg-a': 'NSG A', 'vm-1': 'VM 1', 'vm-2': 'VM 2', 'vm-3': 'VM 3', 'nic-3': '네트워크 인터페이스', 'nsg-b': 'NSG B' }
const connections = { 'link-nic': ['vm-3', 'nic-3'], 'link-nsg-b': ['nic-3', 'nsg-b'] } as const
const expected = [
  { id: 'subnet', label: '서브넷에 연결', nodes: ['nsg-a', 'vm-1', 'vm-2'], notes: ['subnet-note'], note: '웹 서브넷의 VM 모두에 적용' },
  { id: 'nic', label: '네트워크 인터페이스에 연결', nodes: ['nsg-b', 'nic-3', 'vm-3'], notes: ['nic-note'], note: 'VM 3에만 적용' },
]
const diagram = () => screen.getByRole('img')
const wording = () => visualsByTopicId['azure-network-protection'].diagrams['nsg-association']
const ids = (selector: string, attribute: string) => Array.from(diagram().querySelectorAll(selector), (el) => el.getAttribute(attribute)!).sort()
const select = async (name: string) => { await act(async () => { await userEvent.click(screen.getByRole('button', { name })) }) }
function box(rect: Element): SvgBox {
  return {
    id: rect.parentElement?.getAttribute('data-node') ?? '',
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
function expectLinks() {
  expect(ids('[data-link]', 'data-link')).toEqual(Object.keys(connections).sort())
  // 경로는 시나리오에서 바뀌지 않는다. 화살표 없는 연결 관계만 있다.
  expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
  const areas = [
    ...Object.keys(labels).map(nodeBox),
    ...Array.from(diagram().querySelectorAll('[data-note], [data-group-label]'), textBox),
  ]
  for (const path of diagram().querySelectorAll('[data-link]')) {
    const id = path.getAttribute('data-link')! as keyof typeof connections
    expect(path.closest('[opacity]')).toBeNull()
    expect(path).not.toHaveAttribute('marker-end')
    const vertices = points(path.getAttribute('d')!)
    const [from, to] = connections[id]
    expect(onEdge(vertices[0], nodeBox(from)), id).toBe(true)
    expect(onEdge(vertices[vertices.length - 1], nodeBox(to)), id).toBe(true)
    // NSG A는 선이 아니라 서브넷 상자 안의 위치로 소속을 보인다.
    for (const vertex of vertices) expect(onEdge(vertex, nodeBox('nsg-a')), id).toBe(false)
    for (let i = 1; i < vertices.length; i++) {
      for (const area of areas) expect(crosses(vertices[i - 1], vertices[i], area), `${id} ↔ ${area.id}`).toBe(false)
    }
  }
}
function expectGeometry(width: number, height: number) {
  const rectangles = Array.from(diagram().querySelectorAll('rect'), box)
  expect(rectangles).toHaveLength(9)
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
  for (const el of diagram().querySelectorAll('[data-note]')) {
    expect(el).toHaveAttribute('font-size', '9')
    expect(el).toHaveClass('fill-muted')
  }
  for (const area of textAreas) {
    for (const n of Object.keys(labels).map(nodeBox)) expect(overlaps(area, n), `${area.id} ↔ ${n.id}`).toBe(false)
  }
  expect(diagram().querySelector('[class*="diagram-"], [class*="green"], [class*="red"], [class*="orange"], [class*="amber"]')).toBeNull()
}

function layoutTests(width: number, height: number) {
  it('전체에서는 노드가 모두 선명하고 연결선이 있으며 곁말이 없다', () => {
    render(<NsgAssociationDiagram />)
    expect(diagram()).toHaveAttribute('viewBox', `0 0 ${width} ${height}`)
    expect(ids('[data-node]', 'data-node')).toEqual(Object.keys(labels).sort())
    for (const n of diagram().querySelectorAll('[data-node]')) expect(n).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(wording().idleCaption)).toBeInTheDocument()
    expectGeometry(width, height)
    expectLinks()
  })
  it.each(expected)('$label: 선명한 노드·곁말·캡션이 설계와 같고 연결선은 그대로다', async (scenario) => {
    const { container } = render(<NsgAssociationDiagram />)
    await select(scenario.label)
    for (const n of diagram().querySelectorAll('[data-node]')) expect(n).toHaveAttribute('opacity', scenario.nodes.includes(n.getAttribute('data-node')!) ? '1' : '0.25')
    expect(ids('[data-note]', 'data-note')).toEqual(scenario.notes)
    expect(diagram().querySelector('[data-note]')).toHaveTextContent(scenario.note)
    expect(container.querySelector('figcaption')!.textContent).toBe(wording().scenarios.find(({ id }) => id === scenario.id)!.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expectGeometry(width, height)
    expectLinks()
  })
  it('요점: 두 시나리오의 선명한 노드가 겹치지 않고 규칙이 미치는 VM이 갈린다', async () => {
    render(<NsgAssociationDiagram />)
    expect(expected[0].nodes.filter((id) => expected[1].nodes.includes(id))).toEqual([])
    await select('서브넷에 연결')
    expect(diagram().querySelector('[data-node="vm-3"]')).toHaveAttribute('opacity', '0.25')
    await select('네트워크 인터페이스에 연결')
    for (const id of ['vm-1', 'vm-2']) expect(diagram().querySelector(`[data-node="${id}"]`)).toHaveAttribute('opacity', '0.25')
  })
  it('요점: 소속이 맞고 그룹 박스는 흐려지지 않으며 그룹 라벨이 내용과 겹치지 않는다', async () => {
    render(<NsgAssociationDiagram />)
    await select('서브넷에 연결')
    expect(inside(groupBox('subnet-web'), groupBox('vnet'))).toBe(true)
    expect(inside(groupBox('subnet-db'), groupBox('vnet'))).toBe(true)
    expect(overlaps(groupBox('subnet-web'), groupBox('subnet-db'))).toBe(false)
    for (const node of ['nsg-a', 'vm-1', 'vm-2']) expect(inside(nodeBox(node), groupBox('subnet-web')), node).toBe(true)
    for (const node of ['vm-3', 'nic-3', 'nsg-b']) expect(inside(nodeBox(node), groupBox('subnet-db')), node).toBe(true)
    for (const rect of diagram().querySelectorAll('[data-group]')) {
      expect(rect.closest('[opacity]')).toBeNull()
      const label = diagram().querySelector(`[data-group-label="${rect.getAttribute('data-group')}"]`)!
      expect(label.textContent).toBe(wording().groups![rect.getAttribute('data-group')!])
      expect(inside(textBox(label), box(rect))).toBe(true)
      for (const child of diagram().querySelectorAll('[data-group]')) {
        if (inside(box(child), box(rect))) expect(overlaps(textBox(label), box(child))).toBe(false)
      }
    }
    const note = textBox(diagram().querySelector('[data-note="subnet-note"]')!)
    expect(inside(note, groupBox('subnet-web'))).toBe(true)
  })
  it('시나리오를 바꾼 뒤 전체로 돌아오면 곁말이 사라지고 노드가 모두 선명하다', async () => {
    render(<NsgAssociationDiagram />)
    for (const scenario of expected) await select(scenario.label)
    await select('전체')
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
  })
}

describe('NsgAssociationDiagram', () => {
  it('물음형 제목은 헤딩 없이 버튼 앞에 있고 문구는 Azure JSON에서 읽는다', () => {
    render(<NsgAssociationDiagram />)
    const text = wording()
    const title = screen.getByText(text.question!)
    expect(title.tagName).toBe('P')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
    expect(screen.getByRole('figure')).toHaveAttribute('aria-label', text.label)
    expect(diagram()).toHaveAttribute('aria-label', text.svgLabel)
    expect(text.nodes).toEqual(labels)
    expect(screen.getByText(text.legend!)).toBeInTheDocument()
    expect(nsgAssociationScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    for (const scenario of expected) {
      const actual = nsgAssociationScenarios.find(({ id }) => id === scenario.id)!
      expect(actual.nodes).toEqual(scenario.nodes)
      expect(actual.paths).toEqual([])
      expect(actual.label).toBe(scenario.label)
    }
  })
  it('세로형은 모바일 보정 래퍼 하나로 그린다', () => {
    render(<NsgAssociationDiagram />)
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
  })
  layoutTests(280, 272)
  it.each([2, 4] as const)('공유 본문 h%i에서 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === 'azure-network-protection')!.concepts.find(({ id }) => id === conceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: wording().label })
    expect(figure.closest('article')).toHaveAttribute('id', conceptId)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(within(figure).queryByRole('heading')).toBeNull()
  })
  it('열째 주제의 첫 개념 둘과 문항 넷을 연결하고 본문에 그림의 예를 쓴다', () => {
    const topic = topics[9]
    expect(topic).toMatchObject({ id: 'azure-network-protection', title: '네트워크 보호', importance: 2, sourcePages: [0, 0] })
    expect(topic.concepts.slice(0, 2).map(({ id, parentId, name }) => ({ id, parentId, name }))).toEqual([
      { id: conceptId, parentId: undefined, name: '네트워크 보안 그룹' },
      { id: 'azure-network-protection.security-rules', parentId: conceptId, name: '보안 규칙' },
    ])
    const prose = topic.concepts[0].paragraphs.join(' ')
    for (const label of [...Object.values(labels), '웹 서브넷', '데이터베이스 서브넷']) expect(prose).toContain(label)
    expect(questions.find(({ id }) => id === 'az079')).toMatchObject({ conceptId, format: 'yes-no', answer: false })
    expect(questions.find(({ id }) => id === 'az080')).toMatchObject({ conceptId, format: 'choice', answerIndex: 2 })
    expect(questions.find(({ id }) => id === 'az081')).toMatchObject({ conceptId: 'azure-network-protection.security-rules', format: 'choice', answerIndex: 0 })
    expect(questions.find(({ id }) => id === 'az082')).toMatchObject({ conceptId: 'azure-network-protection.security-rules', format: 'yes-no', answer: true })
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
    layoutTests(440, 188)
    it('가로형은 w-full 래퍼와 SVG 하나뿐이다', () => {
      render(<NsgAssociationDiagram />)
      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
    })
    it('폭을 왕복해도 노드·그룹·연결선 id와 선택·캡션을 유지한다', async () => {
      const change = mediaMock(false)
      const { container } = render(<NsgAssociationDiagram />)
      await select('서브넷에 연결')
      const before = { nodes: ids('[data-node]', 'data-node'), groups: ids('[data-group]', 'data-group'), links: ids('[data-link]', 'data-link'), caption: container.querySelector('figcaption')!.textContent }
      for (const wide of [true, false]) {
        act(() => change(wide))
        expect(diagram()).toHaveAttribute('viewBox', wide ? '0 0 440 188' : '0 0 280 272')
        expect(ids('[data-node]', 'data-node')).toEqual(before.nodes)
        expect(ids('[data-group]', 'data-group')).toEqual(before.groups)
        expect(ids('[data-link]', 'data-link')).toEqual(before.links)
        expect(container.querySelector('figcaption')!.textContent).toBe(before.caption)
        expect(screen.getByRole('button', { name: '서브넷에 연결' })).toHaveAttribute('aria-pressed', 'true')
      }
    })
  })
})
