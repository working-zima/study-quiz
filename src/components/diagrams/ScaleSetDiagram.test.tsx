import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { questions, topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ScaleSetDiagram, scaleSetScenarios } from './ScaleSetDiagram'

const conceptId = 'azure-compute.scale-sets'
const labels = { lb: '부하 분산 장치', 'vm-1': 'VM 1', 'vm-2': 'VM 2', 'vm-3': 'VM 3', 'vm-4': 'VM 4' }
const vms = ['vm-1', 'vm-2', 'vm-3', 'vm-4']
const targets = { 'to-vm-1': 'vm-1', 'to-vm-2': 'vm-2', 'to-vm-3': 'vm-3', 'to-vm-4': 'vm-4' }
const basePaths = ['to-vm-1', 'to-vm-2']
const expected = [
  { id: 'normal', label: '평소', nodes: ['lb', 'vm-1', 'vm-2'], paths: basePaths, notes: [] as string[] },
  { id: 'peak', label: '사용자가 몰릴 때', nodes: ['lb', ...vms], paths: Object.keys(targets), notes: ['vm-3-note', 'vm-4-note'] },
]
const diagram = () => screen.getByRole('img')
const wording = () => visualsByTopicId['azure-compute'].diagrams['scale-sets']
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
const groupBox = () => box(diagram().querySelector('[data-group="scale-set"]')!)
const overlaps = (a: SvgBox, b: SvgBox) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
function textBox(el: Element): SvgBox {
  const width = estimateTextWidth(el.textContent!, 9) * 1.15
  const x = Number(el.getAttribute('x'))
  const anchor = el.getAttribute('text-anchor')
  return { id: el.getAttribute('data-note') ?? 'group-label', x: anchor === 'middle' ? x - width / 2 : x, y: Number(el.getAttribute('y')) - 9, width, height: 9 }
}

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
    ...Array.from(diagram().querySelectorAll('[data-group-label], [data-note]'), textBox),
  ]
  for (const path of diagram().querySelectorAll('[data-path]')) {
    expect(path.closest('[opacity]')).toBeNull()
    expect(path.getAttribute('marker-end')).toMatch(/^url\(#.+\)$/)
    const id = path.getAttribute('data-path')! as keyof typeof targets
    const d = path.getAttribute('d')!
    expect(d).toMatch(/^M[\d\sHV]+$/)
    const vertices = points(d)
    expect(onEdge(vertices[0], nodeBox('lb')), id).toBe(true)
    expect(onEdge(vertices[vertices.length - 1], nodeBox(targets[id])), id).toBe(true)
    for (let i = 1; i < vertices.length; i++) {
      for (const area of areas) expect(crosses(vertices[i - 1], vertices[i], area), `${id} ↔ ${area.id}`).toBe(false)
    }
  }
}
function expectGeometry(width: number, height: number) {
  const rectangles = Array.from(diagram().querySelectorAll('rect'), box)
  expect(rectangles).toHaveLength(6)
  expect(boxesOutsideViewBox(rectangles, [0, 0, width, height])).toEqual([])
  const group = groupBox()
  for (const [id, label] of Object.entries(labels)) {
    const b = nodeBox(id)
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    expect(node.querySelector('text')).toHaveTextContent(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(node.querySelector('rect')).toHaveClass('stroke-disabled')
    expect(b.height).toBe(32)
    expect(estimateTextWidth(label, 10) * 1.15 + 12, label).toBeLessThanOrEqual(b.width)
    const contained = boxesOutsideViewBox([b], [group.x, group.y, group.width, group.height]).length === 0
    expect(contained, id).toBe(vms.includes(id))
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
}

function layoutTests(width: number, height: number) {
  it('전체에서는 노드가 모두 선명하고 늘 보이는 경로 둘만 나온다', () => {
    render(<ScaleSetDiagram />)
    expect(diagram()).toHaveAttribute('viewBox', `0 0 ${width} ${height}`)
    expect(ids('[data-node]', 'data-node')).toEqual(Object.keys(labels).sort())
    for (const n of diagram().querySelectorAll('[data-node]')) expect(n).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(wording().idleCaption)).toBeInTheDocument()
    expectGeometry(width, height)
    expectPaths(basePaths)
  })
  it.each(expected)('$label: 선명한 VM·경로·곁말이 설계와 같다', async (scenario) => {
    const { container } = render(<ScaleSetDiagram />)
    await select(scenario.label)
    for (const n of diagram().querySelectorAll('[data-node]')) expect(n).toHaveAttribute('opacity', scenario.nodes.includes(n.getAttribute('data-node')!) ? '1' : '0.25')
    expect(ids('[data-note]', 'data-note')).toEqual([...scenario.notes].sort())
    expect(container.querySelector('figcaption')!.textContent).toBe(wording().scenarios.find(({ id }) => id === scenario.id)!.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expectGeometry(width, height)
    expectPaths(scenario.paths)
  })
  it('평소에는 더해질 VM 둘이 흐리고 경로가 없으며, 몰릴 때는 경로 넷이 모두 보인다', async () => {
    render(<ScaleSetDiagram />)
    await select('평소')
    for (const id of ['vm-3', 'vm-4']) expect(diagram().querySelector(`[data-node="${id}"]`)).toHaveAttribute('opacity', '0.25')
    expect(diagram().querySelector('[data-path="to-vm-3"], [data-path="to-vm-4"]')).toBeNull()
    await select('사용자가 몰릴 때')
    expect(ids('[data-path]', 'data-path')).toEqual(Object.keys(targets))
    for (const id of ['vm-3-note', 'vm-4-note']) expect(diagram().querySelector(`[data-note="${id}"]`)).toHaveTextContent('저절로 더해짐')
    await select('전체')
    expectPaths(basePaths)
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
  })
}

describe('ScaleSetDiagram', () => {
  it('물음형 제목은 헤딩 없이 버튼 앞에 있고 문구는 Azure JSON에서 읽는다', () => {
    render(<ScaleSetDiagram />)
    const text = wording()
    const title = screen.getByText(text.question!)
    expect(title.tagName).toBe('P')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
    expect(screen.getByRole('figure')).toHaveAttribute('aria-label', text.label)
    expect(diagram()).toHaveAttribute('aria-label', text.svgLabel)
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual({ 'scale-set': '확장 집합' })
    expect(screen.getByText(text.legend!)).toBeInTheDocument()
    expect(scaleSetScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    for (const scenario of expected) {
      const actual = scaleSetScenarios.find(({ id }) => id === scenario.id)!
      expect(actual.nodes).toEqual(scenario.nodes)
      expect(actual.paths).toEqual(scenario.paths)
      expect(actual.label).toBe(text.scenarios.find(({ id }) => id === scenario.id)!.label)
    }
  })
  it('세로형은 모바일 보정 래퍼 하나로 그린다', () => {
    render(<ScaleSetDiagram />)
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
  })
  layoutTests(280, 216)
  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', () => {
    render(<><ScaleSetDiagram /><ScaleSetDiagram /></>)
    const markerIds = Array.from(document.querySelectorAll('marker'), (marker) => marker.id)
    expect(markerIds).toHaveLength(2)
    expect(new Set(markerIds).size).toBe(2)
    for (const figure of screen.getAllByRole('figure')) {
      const markerId = figure.querySelector('marker')!.id
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${markerId})`)
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
  it('VM 개념 뒤에 확장 집합과 가용성 집합을 순서대로 두고 문항 셋을 연결한다', () => {
    const topic = topics.find(({ id }) => id === 'azure-compute')!
    expect(topic.concepts.slice(2, 4).map(({ id, parentId, name }) => ({ id, parentId, name }))).toEqual([
      { id: conceptId, parentId: undefined, name: '가상 머신 확장 집합' },
      { id: 'azure-compute.availability-sets', parentId: undefined, name: '가용성 집합' },
    ])
    expect(topic.concepts[2].paragraphs.join(' ')).toContain('부하 분산 장치')
    expect(questions.find(({ id }) => id === 'az058')).toMatchObject({ conceptId, format: 'choice', answerIndex: 1 })
    expect(questions.find(({ id }) => id === 'az059')).toMatchObject({ conceptId: 'azure-compute.availability-sets', format: 'choice', answerIndex: 2 })
    expect(questions.find(({ id }) => id === 'az060')).toMatchObject({ conceptId: 'azure-compute.availability-sets', format: 'yes-no', answer: false })
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
    layoutTests(440, 156)
    it('가로형은 w-full 래퍼와 SVG 하나뿐이다', () => {
      render(<ScaleSetDiagram />)
      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
    })
    it('폭을 왕복해도 노드·그룹·경로 id와 선택·캡션을 유지한다', async () => {
      const change = mediaMock(false)
      const { container } = render(<ScaleSetDiagram />)
      await select('사용자가 몰릴 때')
      const before = { nodes: ids('[data-node]', 'data-node'), groups: ids('[data-group]', 'data-group'), paths: ids('[data-path]', 'data-path'), caption: container.querySelector('figcaption')!.textContent }
      for (const wide of [true, false]) {
        act(() => change(wide))
        expect(diagram()).toHaveAttribute('viewBox', wide ? '0 0 440 156' : '0 0 280 216')
        expect(ids('[data-node]', 'data-node')).toEqual(before.nodes)
        expect(ids('[data-group]', 'data-group')).toEqual(before.groups)
        expect(ids('[data-path]', 'data-path')).toEqual(before.paths)
        expect(container.querySelector('figcaption')!.textContent).toBe(before.caption)
        expect(screen.getByRole('button', { name: '사용자가 몰릴 때' })).toHaveAttribute('aria-pressed', 'true')
      }
    })
  })
})
