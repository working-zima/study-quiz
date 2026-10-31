import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { questions, topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { VmContainerDiagram, vmContainerScenarios } from './VmContainerDiagram'

const conceptId = 'azure-compute.containers'
const labels = {
  'vm-1-app': '앱 1', 'vm-1-os': '운영 체제', 'vm-2-app': '앱 2', 'vm-2-os': '운영 체제',
  'ctr-1': '컨테이너 1', 'ctr-2': '컨테이너 2', 'ctr-3': '컨테이너 3', 'host-os': '호스트의 운영 체제',
}
const groupLabels = { 'vm-host': 'VM으로 실행하는 호스트', 'vm-1': 'VM 1', 'vm-2': 'VM 2', 'container-host': '컨테이너로 실행하는 호스트' }
// 노드마다 자기를 담는 그룹 박스. 앞의 것이 가장 안쪽이다.
const membership: Record<string, string[]> = {
  'vm-1-app': ['vm-1', 'vm-host'], 'vm-1-os': ['vm-1', 'vm-host'],
  'vm-2-app': ['vm-2', 'vm-host'], 'vm-2-os': ['vm-2', 'vm-host'],
  'ctr-1': ['container-host'], 'ctr-2': ['container-host'], 'ctr-3': ['container-host'], 'host-os': ['container-host'],
}
// 연결선은 앱이나 컨테이너에서 그것이 쓰는 운영 체제로 간다. 셋째 값은 선이 머무는 호스트다.
const connections = {
  'link-vm-1': ['vm-1-app', 'vm-1-os', 'vm-host'], 'link-vm-2': ['vm-2-app', 'vm-2-os', 'vm-host'],
  'link-ctr-1': ['ctr-1', 'host-os', 'container-host'], 'link-ctr-2': ['ctr-2', 'host-os', 'container-host'],
  'link-ctr-3': ['ctr-3', 'host-os', 'container-host'],
}
const vmNodes = ['vm-1-app', 'vm-1-os', 'vm-2-app', 'vm-2-os']
const containerNodes = ['ctr-1', 'ctr-2', 'ctr-3', 'host-os']
const expected = [
  { id: 'vm', label: 'VM', nodes: vmNodes, notes: ['vm-os-note'] },
  { id: 'container', label: '컨테이너', nodes: containerNodes, notes: ['container-note'] },
]
const diagram = () => screen.getByRole('img')
const wording = () => visualsByTopicId['azure-compute'].diagrams['vm-containers']
const ids = (selector: string, attribute: string) => Array.from(diagram().querySelectorAll(selector), (el) => el.getAttribute(attribute)!).sort()
const select = async (name: string) => { await act(async () => { await userEvent.click(screen.getByRole('button', { name })) }) }
function box(rect: Element): SvgBox {
  return {
    id: rect.getAttribute('data-group') ?? rect.parentElement?.getAttribute('data-node') ?? '',
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}
const nodeBox = (id: string) => box(diagram().querySelector(`[data-node="${id}"] rect`)!)
const groupBox = (id: string) => box(diagram().querySelector(`[data-group="${id}"]`)!)
const inside = (inner: SvgBox, outer: SvgBox) => boxesOutsideViewBox([inner], [outer.x, outer.y, outer.width, outer.height]).length === 0
const overlaps = (a: SvgBox, b: SvgBox) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
function textBox(el: Element): SvgBox {
  const width = estimateTextWidth(el.textContent!, 9) * 1.15
  const x = Number(el.getAttribute('x'))
  const anchor = el.getAttribute('text-anchor')
  return { id: el.getAttribute('data-note') ?? el.getAttribute('data-group-label') ?? '', x: anchor === 'middle' ? x - width / 2 : x, y: Number(el.getAttribute('y')) - 9, width, height: 9 }
}

// 연결선의 꺾이는 점을 펼쳐 끝점뿐 아니라 선분 전체를 검사한다.
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
const strictlyInside = (p: { x: number, y: number }, b: SvgBox) => p.x > b.x && p.x < b.x + b.width && p.y > b.y && p.y < b.y + b.height

function expectLinks() {
  expect(ids('[data-link]', 'data-link')).toEqual(Object.keys(connections).sort())
  expect(diagram().querySelectorAll('path')).toHaveLength(5)
  expect(diagram().querySelector('marker, [marker-end], [data-path]')).toBeNull()
  const areas = [
    ...Object.keys(labels).map(nodeBox),
    ...Array.from(diagram().querySelectorAll('[data-group-label], [data-note]'), textBox),
  ]
  for (const path of diagram().querySelectorAll('[data-link]')) {
    expect(path.closest('[opacity]')).toBeNull()
    const id = path.getAttribute('data-link')! as keyof typeof connections
    const [source, target, host] = connections[id]
    const d = path.getAttribute('d')!
    expect(d).toMatch(/^M[\d\sHV]+$/)
    const vertices = points(d)
    expect(onEdge(vertices[0], nodeBox(source)), id).toBe(true)
    expect(onEdge(vertices[vertices.length - 1], nodeBox(target)), id).toBe(true)
    // 선은 자기 호스트 박스 안에만 있고, 어느 호스트 박스의 경계도 가로지르지 않는다.
    for (const vertex of vertices) expect(strictlyInside(vertex, groupBox(host)), `${id} 안`).toBe(true)
    for (let i = 1; i < vertices.length; i++) {
      for (const area of areas) expect(crosses(vertices[i - 1], vertices[i], area), `${id} ↔ ${area.id}`).toBe(false)
    }
  }
}
function expectGeometry(width: number, height: number) {
  const rectangles = Array.from(diagram().querySelectorAll('rect'), box)
  expect(rectangles).toHaveLength(12)
  expect(boxesOutsideViewBox(rectangles, [0, 0, width, height])).toEqual([])
  expect(ids('[data-group]', 'data-group')).toEqual(Object.keys(groupLabels).sort())
  // 그룹 박스 안의 그룹 박스: VM 박스는 VM 호스트 안에 들고, 라벨 영역이 바깥 박스의 라벨 영역 아래에 있다.
  for (const vm of ['vm-1', 'vm-2']) {
    expect(inside(groupBox(vm), groupBox('vm-host')), vm).toBe(true)
    expect(groupBox(vm).y).toBeGreaterThan(groupBox('vm-host').y + 18)
    expect(overlaps(groupBox(vm), groupBox('container-host')), vm).toBe(false)
  }
  expect(overlaps(groupBox('vm-1'), groupBox('vm-2'))).toBe(false)
  expect(overlaps(groupBox('vm-host'), groupBox('container-host'))).toBe(false)
  for (const [id, label] of Object.entries(labels)) {
    const b = nodeBox(id)
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    expect(node.querySelector('text')).toHaveTextContent(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(node.querySelector('rect')).toHaveClass('stroke-disabled')
    expect(b.height).toBe(32)
    expect(estimateTextWidth(label, 10) * 1.15 + 12, label).toBeLessThanOrEqual(b.width)
    for (const group of Object.keys(groupLabels)) {
      expect(inside(b, groupBox(group)), `${id} ⊂ ${group}`).toBe(membership[id].includes(group))
      if (!membership[id].includes(group)) expect(overlaps(b, groupBox(group)), `${id} ∩ ${group}`).toBe(false)
    }
    expect(b.y, id).toBeGreaterThan(groupBox(membership[id][0]).y + 18)
  }
  for (const el of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(el.closest('[opacity]')).toBeNull()
  for (const el of diagram().querySelectorAll('[data-group-label]')) expect(el.textContent).toBe(groupLabels[el.getAttribute('data-group-label') as keyof typeof groupLabels])
  const textAreas = Array.from(diagram().querySelectorAll('[data-note], [data-group-label]'), textBox)
  expect(boxesOutsideViewBox(textAreas, [0, 0, width, height])).toEqual([])
  for (const el of diagram().querySelectorAll('[data-note], [data-group-label]')) {
    expect(el).toHaveAttribute('font-size', '9')
    expect(el).toHaveClass('fill-muted')
  }
  for (let i = 0; i < textAreas.length; i++) {
    for (const n of Object.keys(labels).map(nodeBox)) expect(overlaps(textAreas[i], n), `${textAreas[i].id} ↔ ${n.id}`).toBe(false)
    for (const other of textAreas.slice(i + 1)) expect(overlaps(textAreas[i], other), `${textAreas[i].id} ↔ ${other.id}`).toBe(false)
  }
  // 곁말은 자기 호스트 박스 안에 놓인다.
  for (const el of diagram().querySelectorAll('[data-note]')) {
    const host = el.getAttribute('data-note') === 'vm-os-note' ? 'vm-host' : 'container-host'
    expect(inside(textBox(el), groupBox(host)), el.getAttribute('data-note')!).toBe(true)
  }
  expect(diagram().querySelector('[class*="diagram-"], [class*="green"], [class*="red"], [class*="orange"], [class*="amber"]')).toBeNull()
  expectLinks()
}

function layoutTests(width: number, height: number) {
  it('전체에서는 모든 노드와 연결선이 보이고 곁말은 없다', () => {
    render(<VmContainerDiagram />)
    expect(diagram()).toHaveAttribute('viewBox', `0 0 ${width} ${height}`)
    expect(ids('[data-node]', 'data-node')).toEqual(Object.keys(labels).sort())
    for (const n of diagram().querySelectorAll('[data-node]')) expect(n).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(wording().idleCaption)).toBeInTheDocument()
    expectGeometry(width, height)
  })
  it('VM 박스는 저마다 운영 체제를 하나씩 담고, 컨테이너 호스트의 운영 체제는 하나다', () => {
    render(<VmContainerDiagram />)
    const osIn = (group: string) => Object.keys(labels).filter((id) => labels[id as keyof typeof labels].includes('운영 체제') && inside(nodeBox(id), groupBox(group)))
    expect(osIn('vm-1')).toEqual(['vm-1-os'])
    expect(osIn('vm-2')).toEqual(['vm-2-os'])
    expect(osIn('container-host')).toEqual(['host-os'])
    // 컨테이너 셋은 모두 같은 운영 체제 하나로 이어진다.
    for (const ctr of ['ctr-1', 'ctr-2', 'ctr-3']) {
      const link = Object.entries(connections).find(([, [source]]) => source === ctr)!
      expect(link[1][1]).toBe('host-os')
    }
  })
  it.each(expected)('$label: 한 방식만 선명하게 두고 연결선 다섯은 유지한다', async (scenario) => {
    const { container } = render(<VmContainerDiagram />)
    await select(scenario.label)
    for (const n of diagram().querySelectorAll('[data-node]')) expect(n).toHaveAttribute('opacity', scenario.nodes.includes(n.getAttribute('data-node')!) ? '1' : '0.25')
    expect(ids('[data-note]', 'data-note')).toEqual(scenario.notes)
    expect(container.querySelector('figcaption')!.textContent).toBe(wording().scenarios.find(({ id }) => id === scenario.id)!.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expectGeometry(width, height)
  })
  it('두 시나리오의 선명한 노드는 겹치지 않고, 저마다 한 호스트 안의 노드 전부다', async () => {
    render(<VmContainerDiagram />)
    const vivid: string[][] = []
    for (const { label } of expected) {
      await select(label)
      vivid.push(ids('[data-node][opacity="1"]', 'data-node'))
    }
    expect(vivid[0].filter((id) => vivid[1].includes(id))).toEqual([])
    expect(vivid[0]).toEqual(Object.keys(membership).filter((id) => membership[id].includes('vm-host')).sort())
    expect(vivid[1]).toEqual(Object.keys(membership).filter((id) => membership[id].includes('container-host')).sort())
    await select('전체')
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    for (const n of diagram().querySelectorAll('[data-node]')) expect(n).toHaveAttribute('opacity', '1')
    expectLinks()
  })
}

describe('VmContainerDiagram', () => {
  it('물음형 제목은 헤딩 없이 버튼 앞에 있고 문구는 Azure JSON에서 읽는다', () => {
    render(<VmContainerDiagram />)
    const text = wording()
    const title = screen.getByText(text.question!)
    expect(title.tagName).toBe('P')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
    expect(screen.getByRole('figure')).toHaveAttribute('aria-label', text.label)
    expect(diagram()).toHaveAttribute('aria-label', text.svgLabel)
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(screen.getByText(text.legend!)).toBeInTheDocument()
    expect(vmContainerScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    for (const scenario of expected) {
      const actual = vmContainerScenarios.find(({ id }) => id === scenario.id)!
      expect(actual.nodes).toEqual(scenario.nodes)
      expect(actual.paths).toEqual([])
      expect(actual.label).toBe(text.scenarios.find(({ id }) => id === scenario.id)!.label)
    }
  })
  it('곁말 문구를 JSON에서 읽는다', async () => {
    render(<VmContainerDiagram />)
    for (const { label } of expected) {
      await select(label)
      for (const note of diagram().querySelectorAll('[data-note]')) expect(note.textContent).toBe(wording().notes![note.getAttribute('data-note')!])
    }
  })
  it('세로형은 모바일 보정 래퍼 하나로 그린다', () => {
    render(<VmContainerDiagram />)
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
  })
  layoutTests(280, 336)
  it('두 번 렌더해도 화살표 마커 없이 독립된 연결선 다섯씩이다', () => {
    render(<><VmContainerDiagram /><VmContainerDiagram /></>)
    const figures = screen.getAllByRole('figure')
    expect(figures).toHaveLength(2)
    for (const figure of figures) {
      expect(figure.querySelectorAll('[data-link]')).toHaveLength(5)
      expect(figure.querySelector('marker')).toBeNull()
    }
  })
  it.each([2, 4] as const)('공유 본문 h%i에서 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === 'azure-compute')!.concepts.find(({ id }) => id === conceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: wording().label })
    expect(figure.closest('article')).toHaveAttribute('id', conceptId)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(within(figure).queryByRole('heading')).toBeNull()
  })
  it('VM 묶음 뒤에 Virtual Desktop·컨테이너·컨테이너 서비스를 순서대로 두고 문항을 연결한다', () => {
    const topic = topics.find(({ id }) => id === 'azure-compute')!
    expect(topic.concepts.slice(4, 7).map(({ id, parentId, name }) => ({ id, parentId, name }))).toEqual([
      { id: 'azure-compute.virtual-desktop', parentId: undefined, name: 'Azure Virtual Desktop' },
      { id: conceptId, parentId: undefined, name: '컨테이너' },
      { id: 'azure-compute.container-services', parentId: conceptId, name: 'Azure의 컨테이너 서비스' },
    ])
    expect(topic.concepts[6].paragraphs.filter((p) => p.startsWith('- **'))).toHaveLength(3)
    // 본문에 도식의 예(VM 두 대, 컨테이너 세 개, 호스트의 운영 체제)가 먼저 있다(ADR-036·038).
    const body = topic.concepts[5].paragraphs.join(' ')
    for (const phrase of ['VM 1과 VM 2', '컨테이너 1~3', '호스트의 운영 체제를 함께 쓴다']) expect(body).toContain(phrase)
    expect(questions.find(({ id }) => id === 'az061')).toMatchObject({ conceptId: 'azure-compute.virtual-desktop', format: 'yes-no', answer: true })
    expect(questions.find(({ id }) => id === 'az062')).toMatchObject({ conceptId, format: 'choice', answerIndex: 3 })
    expect(questions.find(({ id }) => id === 'az063')).toMatchObject({ conceptId: 'azure-compute.container-services', format: 'choice', answerIndex: 1 })
    expect(questions.find(({ id }) => id === 'az064')).toMatchObject({ conceptId: 'azure-compute.container-services', format: 'yes-no', answer: true })
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
    it('가로형은 w-full 래퍼와 SVG 하나뿐이고, 두 호스트를 나란히 둔다', () => {
      render(<VmContainerDiagram />)
      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      const vmHost = groupBox('vm-host')
      const containerHost = groupBox('container-host')
      expect(vmHost.x + vmHost.width).toBeLessThan(containerHost.x)
      expect(vmHost.y).toBe(containerHost.y)
    })
    it('폭을 왕복해도 노드·그룹·연결선 id와 선택·캡션을 유지한다', async () => {
      const change = mediaMock(false)
      const { container } = render(<VmContainerDiagram />)
      await select('컨테이너')
      const before = { nodes: ids('[data-node]', 'data-node'), groups: ids('[data-group]', 'data-group'), links: ids('[data-link]', 'data-link'), notes: ids('[data-note]', 'data-note'), caption: container.querySelector('figcaption')!.textContent }
      for (const wide of [true, false]) {
        act(() => change(wide))
        expect(diagram()).toHaveAttribute('viewBox', wide ? '0 0 440 180' : '0 0 280 336')
        expect(ids('[data-node]', 'data-node')).toEqual(before.nodes)
        expect(ids('[data-group]', 'data-group')).toEqual(before.groups)
        expect(ids('[data-link]', 'data-link')).toEqual(before.links)
        expect(ids('[data-note]', 'data-note')).toEqual(before.notes)
        expect(container.querySelector('figcaption')!.textContent).toBe(before.caption)
        expect(screen.getByRole('button', { name: '컨테이너' })).toHaveAttribute('aria-pressed', 'true')
      }
    })
  })
})
