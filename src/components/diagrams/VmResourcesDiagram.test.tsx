import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { questions, topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { VmResourcesDiagram, vmResourcesScenarios } from './VmResourcesDiagram'

const conceptId = 'azure-compute.vm-resources'
const labels = {
  'vm-1': 'VM 1', nic: '네트워크 인터페이스', 'os-disk': 'OS 디스크',
  'data-disk': '데이터 디스크', 'public-ip': '공용 IP 주소', nsg: '네트워크 보안 그룹',
}
const connections = {
  'link-os': ['vm-1', 'os-disk'], 'link-data': ['vm-1', 'data-disk'],
  'link-nic': ['vm-1', 'nic'], 'link-ip': ['nic', 'public-ip'], 'link-nsg': ['nic', 'nsg'],
}
const expected = [
  { id: 'required', label: '꼭 있는 것', nodes: ['vm-1', 'os-disk', 'nic'], notes: ['nic-note'] },
  { id: 'optional', label: '필요할 때 붙이는 것', nodes: ['vm-1', 'data-disk', 'public-ip', 'nsg'], notes: ['ip-note', 'data-note', 'nsg-note'] },
]
const diagram = () => screen.getByRole('img')
const wording = () => visualsByTopicId['azure-compute'].diagrams['vm-resources']
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
const overlaps = (a: SvgBox, b: SvgBox) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
function textBox(el: Element): SvgBox {
  const width = estimateTextWidth(el.textContent!, 9) * 1.15
  const x = Number(el.getAttribute('x'))
  const anchor = el.getAttribute('text-anchor')
  return { id: el.getAttribute('data-note') ?? 'group-label', x: anchor === 'middle' ? x - width / 2 : x, y: Number(el.getAttribute('y')) - 9, width, height: 9 }
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
    const [source, target] = connections[id]
    const d = path.getAttribute('d')!
    expect(d).toMatch(/^M[\d\sHV]+$/)
    const vertices = points(d)
    expect(onEdge(vertices[0], nodeBox(source)), id).toBe(true)
    expect(onEdge(vertices[vertices.length - 1], nodeBox(target)), id).toBe(true)
    for (let i = 1; i < vertices.length; i++) {
      for (const area of areas) expect(crosses(vertices[i - 1], vertices[i], area), `${id} ↔ ${area.id}`).toBe(false)
    }
  }
}
function expectGeometry(width: number, height: number) {
  const rectangles = Array.from(diagram().querySelectorAll('rect'), box)
  expect(rectangles).toHaveLength(7)
  expect(boxesOutsideViewBox(rectangles, [0, 0, width, height])).toEqual([])
  const group = box(diagram().querySelector('[data-group="vnet"]')!)
  for (const [id, label] of Object.entries(labels)) {
    const b = nodeBox(id)
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    expect(node.querySelector('text')).toHaveTextContent(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(node.querySelector('rect')).toHaveClass('stroke-disabled')
    expect(b.height).toBe(32)
    expect(estimateTextWidth(label, 10) * 1.15 + 12, label).toBeLessThanOrEqual(b.width)
    const contained = boxesOutsideViewBox([b], [group.x, group.y, group.width, group.height]).length === 0
    expect(contained, id).toBe(['vm-1', 'nic'].includes(id))
    if (contained) expect(b.y).toBeGreaterThan(group.y + 18)
    else expect(overlaps(b, group), id).toBe(false)
  }
  for (const el of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(el.closest('[opacity]')).toBeNull()
  const textAreas = Array.from(diagram().querySelectorAll('[data-note], [data-group-label]'), textBox)
  expect(boxesOutsideViewBox(textAreas, [0, 0, width, height])).toEqual([])
  for (const el of diagram().querySelectorAll('[data-note], [data-group-label]')) {
    expect(el).toHaveAttribute('font-size', '9')
    expect(el).toHaveClass('fill-muted')
  }
  for (let i = 0; i < textAreas.length; i++) {
    for (const n of Object.keys(labels).map(nodeBox)) expect(overlaps(textAreas[i], n)).toBe(false)
    for (const other of textAreas.slice(i + 1)) expect(overlaps(textAreas[i], other)).toBe(false)
  }
  expect(diagram().querySelector('[class*="diagram-"], [class*="green"], [class*="red"], [class*="orange"], [class*="amber"]')).toBeNull()
  expectLinks()
}

function layoutTests(width: number, height: number) {
  it('전체에서는 모든 노드와 연결선이 보이고 개인 IP 곁말만 나온다', () => {
    render(<VmResourcesDiagram />)
    expect(diagram()).toHaveAttribute('viewBox', `0 0 ${width} ${height}`)
    expect(ids('[data-node]', 'data-node')).toEqual(Object.keys(labels).sort())
    for (const n of diagram().querySelectorAll('[data-node]')) expect(n).toHaveAttribute('opacity', '1')
    expect(ids('[data-note]', 'data-note')).toEqual(['private-ip-note'])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(wording().idleCaption)).toBeInTheDocument()
    expectGeometry(width, height)
  })
  it.each(expected)('$label: 필수와 선택을 흐림·곁말로 나누고 연결선 다섯은 유지한다', async (scenario) => {
    const { container } = render(<VmResourcesDiagram />)
    await select(scenario.label)
    for (const n of diagram().querySelectorAll('[data-node]')) expect(n).toHaveAttribute('opacity', scenario.nodes.includes(n.getAttribute('data-node')!) ? '1' : '0.25')
    expect(ids('[data-note]', 'data-note')).toEqual([...scenario.notes, 'private-ip-note'].sort())
    const privateIp = diagram().querySelector('[data-note="private-ip-note"]')!
    expect(privateIp.closest('[opacity]')).toHaveAttribute('opacity', scenario.id === 'required' ? '1' : '0.25')
    expect(container.querySelector('figcaption')!.textContent).toBe(wording().scenarios.find(({ id }) => id === scenario.id)!.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expectGeometry(width, height)
  })
  it('두 시나리오에서 함께 선명한 것은 VM 1뿐이고 전체로 돌아오면 선택 곁말을 지운다', async () => {
    render(<VmResourcesDiagram />)
    const vivid: string[][] = []
    for (const { label } of expected) {
      await select(label)
      vivid.push(ids('[data-node][opacity="1"]', 'data-node'))
    }
    expect(vivid[0].filter((id) => vivid[1].includes(id))).toEqual(['vm-1'])
    await select('전체')
    expect(ids('[data-note]', 'data-note')).toEqual(['private-ip-note'])
    for (const n of diagram().querySelectorAll('[data-node]')) expect(n).toHaveAttribute('opacity', '1')
    expectLinks()
  })
}

describe('VmResourcesDiagram', () => {
  it('물음형 제목은 헤딩 없이 버튼 앞에 있고 문구는 Azure JSON에서 읽는다', () => {
    render(<VmResourcesDiagram />)
    const text = wording()
    const title = screen.getByText(text.question!)
    expect(title.tagName).toBe('P')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
    expect(screen.getByRole('figure')).toHaveAttribute('aria-label', text.label)
    expect(diagram()).toHaveAttribute('aria-label', text.svgLabel)
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual({ vnet: '가상 네트워크' })
    expect(screen.getByText(text.legend!)).toBeInTheDocument()
    expect(vmResourcesScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    for (const scenario of expected) {
      const actual = vmResourcesScenarios.find(({ id }) => id === scenario.id)!
      expect(actual.nodes).toEqual(scenario.nodes)
      expect(actual.paths).toEqual([])
      expect(actual.label).toBe(text.scenarios.find(({ id }) => id === scenario.id)!.label)
    }
    for (const note of diagram().querySelectorAll('[data-note]')) expect(note.textContent).toBe(text.notes![note.getAttribute('data-note')!])
  })
  it('세로형은 모바일 보정 래퍼 하나로 그린다', () => {
    render(<VmResourcesDiagram />)
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
  })
  layoutTests(280, 420)
  it('두 번 렌더해도 화살표 마커 없이 독립된 연결선 다섯씩이다', () => {
    render(<><VmResourcesDiagram /><VmResourcesDiagram /></>)
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
  it('여덟째 주제에 VM 기본과 리소스 개념을 순서대로 두고 문항을 연결한다', () => {
    const topic = topics[7]
    expect(topic).toMatchObject({ id: 'azure-compute', title: '컴퓨팅과 앱 호스팅', importance: 2, sourcePages: [0, 0] })
    expect(topic.concepts.slice(0, 2).map(({ id, parentId, name }) => ({ id, parentId, name }))).toEqual([
      { id: 'azure-compute.virtual-machines', parentId: undefined, name: '가상 머신(Azure Virtual Machines)' },
      { id: conceptId, parentId: 'azure-compute.virtual-machines', name: '가상 머신에 필요한 리소스' },
    ])
    expect(topic.concepts[1].paragraphs.filter((p) => p.startsWith('- **'))).toHaveLength(5)
    expect(topic.concepts[1].paragraphs.join(' ')).toContain('개인 IP 주소')
    expect(questions.find(({ id }) => id === 'az056')).toMatchObject({ conceptId: 'azure-compute.virtual-machines', format: 'choice', answerIndex: 0 })
    expect(questions.find(({ id }) => id === 'az057')).toMatchObject({ conceptId, format: 'yes-no', answer: true })
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
    layoutTests(440, 288)
    it('가로형은 w-full 래퍼와 SVG 하나뿐이다', () => {
      render(<VmResourcesDiagram />)
      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
    })
    it('폭을 왕복해도 노드·그룹·연결선 id와 선택·캡션을 유지한다', async () => {
      const change = mediaMock(false)
      const { container } = render(<VmResourcesDiagram />)
      await select('필요할 때 붙이는 것')
      const before = { nodes: ids('[data-node]', 'data-node'), groups: ids('[data-group]', 'data-group'), links: ids('[data-link]', 'data-link'), caption: container.querySelector('figcaption')!.textContent }
      for (const wide of [true, false]) {
        act(() => change(wide))
        expect(diagram()).toHaveAttribute('viewBox', wide ? '0 0 440 288' : '0 0 280 420')
        expect(ids('[data-node]', 'data-node')).toEqual(before.nodes)
        expect(ids('[data-group]', 'data-group')).toEqual(before.groups)
        expect(ids('[data-link]', 'data-link')).toEqual(before.links)
        expect(container.querySelector('figcaption')!.textContent).toBe(before.caption)
        expect(screen.getByRole('button', { name: '필요할 때 붙이는 것' })).toHaveAttribute('aria-pressed', 'true')
      }
    })
  })
})
