import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { AvailabilitySetDiagram, availabilitySetScenarios } from './AvailabilitySetDiagram'

const conceptId = 'azure-compute.availability-sets'
const labels = { 'vm-1': 'VM 1', 'vm-2': 'VM 2', 'vm-3': 'VM 3', 'vm-4': 'VM 4' }
const groupLabels = { 'availability-set': '가용성 집합', 'fd-a': '장애 도메인 A', 'fd-b': '장애 도메인 B', 'fd-c': '장애 도메인 C' }
// 장애 도메인마다 담는 VM. 이 배치가 두 시나리오의 차이를 만든다.
const membership = { 'fd-a': ['vm-1', 'vm-4'], 'fd-b': ['vm-2'], 'fd-c': ['vm-3'] }
const expected = [
  { id: 'power', label: '전원 장애', dimmed: ['vm-1', 'vm-4'], notes: ['fd-a-note'] },
  { id: 'maintenance', label: '계획된 유지 관리', dimmed: ['vm-1'], notes: ['vm-1-note'] },
]
const diagram = () => screen.getByRole('img')
const wording = () => visualsByTopicId['azure-compute'].diagrams['availability-sets']
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

function expectGeometry(width: number, height: number) {
  const rectangles = Array.from(diagram().querySelectorAll('rect'), box)
  expect(rectangles).toHaveLength(8)
  expect(boxesOutsideViewBox(rectangles, [0, 0, width, height])).toEqual([])
  expect(diagram().querySelectorAll('path, marker')).toHaveLength(0)
  const outer = groupBox('availability-set')
  for (const [fd, members] of Object.entries(membership)) {
    const fdBox = groupBox(fd)
    expect(inside(fdBox, outer), fd).toBe(true)
    // 안쪽 박스의 라벨 영역은 바깥 박스의 라벨 영역 아래에 있다.
    expect(fdBox.y).toBeGreaterThanOrEqual(outer.y + 18)
    for (const vm of Object.keys(labels)) {
      const b = nodeBox(vm)
      expect(inside(b, fdBox), `${vm} in ${fd}`).toBe(members.includes(vm))
      if (members.includes(vm)) expect(b.y).toBeGreaterThan(fdBox.y + 18)
      else expect(overlaps(b, fdBox), `${vm} ↔ ${fd}`).toBe(false)
    }
  }
  const fds = Object.keys(membership).map(groupBox)
  for (let i = 0; i < fds.length; i++) for (const other of fds.slice(i + 1)) expect(overlaps(fds[i], other)).toBe(false)
  for (const [id, label] of Object.entries(labels)) {
    const b = nodeBox(id)
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    expect(node.querySelector('text')).toHaveTextContent(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(node.querySelector('rect')).toHaveClass('stroke-disabled')
    expect(b.height).toBe(32)
    expect(estimateTextWidth(label, 10) * 1.15 + 12, label).toBeLessThanOrEqual(b.width)
  }
  for (const el of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(el.closest('[opacity]')).toBeNull()
  for (const el of diagram().querySelectorAll('[data-group-label]')) {
    const id = el.getAttribute('data-group-label')!
    expect(el).toHaveTextContent(groupLabels[id as keyof typeof groupLabels])
    const label = textBox(el)
    const group = groupBox(id)
    expect(label.x + label.width, id).toBeLessThanOrEqual(group.x + group.width)
  }
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
  it('전체에서는 VM 넷이 모두 선명하고 곁말과 경로가 없다', () => {
    render(<AvailabilitySetDiagram />)
    expect(diagram()).toHaveAttribute('viewBox', `0 0 ${width} ${height}`)
    expect(ids('[data-node]', 'data-node')).toEqual(Object.keys(labels))
    expect(ids('[data-group]', 'data-group')).toEqual(Object.keys(groupLabels).sort())
    for (const n of diagram().querySelectorAll('[data-node]')) expect(n).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(wording().idleCaption)).toBeInTheDocument()
    expectGeometry(width, height)
  })
  it.each(expected)('$label: 멈춘 VM만 흐리고 곁말과 캡션이 설계와 같다', async (scenario) => {
    const { container } = render(<AvailabilitySetDiagram />)
    await select(scenario.label)
    expect(ids('[data-node][opacity="0.25"]', 'data-node')).toEqual(scenario.dimmed)
    for (const n of diagram().querySelectorAll('[data-node]')) expect(n).toHaveAttribute('opacity', scenario.dimmed.includes(n.getAttribute('data-node')!) ? '0.25' : '1')
    expect(ids('[data-note]', 'data-note')).toEqual(scenario.notes)
    for (const note of diagram().querySelectorAll('[data-note]')) expect(note.textContent).toBe(wording().notes![note.getAttribute('data-note')!])
    expect(container.querySelector('figcaption')!.textContent).toBe(wording().scenarios.find(({ id }) => id === scenario.id)!.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expectGeometry(width, height)
  })
  it('두 시나리오는 멈추는 VM이 다르다 — 장애 도메인과 업데이트 도메인은 다른 묶음이다', async () => {
    render(<AvailabilitySetDiagram />)
    const dimmed: string[][] = []
    for (const { label } of expected) {
      await select(label)
      dimmed.push(ids('[data-node][opacity="0.25"]', 'data-node'))
    }
    expect(dimmed[0]).toEqual(['vm-1', 'vm-4'])
    expect(dimmed[1]).toEqual(['vm-1'])
    await select('전체')
    for (const n of diagram().querySelectorAll('[data-node]')) expect(n).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
  })
}

describe('AvailabilitySetDiagram', () => {
  it('물음형 제목은 헤딩 없이 버튼 앞에 있고 문구는 Azure JSON에서 읽는다', () => {
    render(<AvailabilitySetDiagram />)
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
    expect(availabilitySetScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    for (const scenario of expected) {
      const actual = availabilitySetScenarios.find(({ id }) => id === scenario.id)!
      expect(actual.nodes).toEqual(Object.keys(labels).filter((id) => !scenario.dimmed.includes(id)))
      expect(actual.paths).toEqual([])
      expect(actual.label).toBe(text.scenarios.find(({ id }) => id === scenario.id)!.label)
    }
  })
  it('세로형은 모바일 보정 래퍼 하나로 그린다', () => {
    render(<AvailabilitySetDiagram />)
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
  })
  layoutTests(280, 180)
  it('두 번 렌더해도 도식이 따로 그려지고 경로·마커가 없다', () => {
    render(<><AvailabilitySetDiagram /><AvailabilitySetDiagram /></>)
    const figures = screen.getAllByRole('figure')
    expect(figures).toHaveLength(2)
    for (const figure of figures) {
      expect(figure.querySelectorAll('[data-node]')).toHaveLength(4)
      expect(figure.querySelector('marker, path')).toBeNull()
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
  it('본문이 도식의 예(장애 도메인 A의 VM 1·VM 4)와 막지 못하는 장애를 말한다', () => {
    const body = topics.find(({ id }) => id === 'azure-compute')!.concepts.find(({ id }) => id === conceptId)!.paragraphs.join(' ')
    for (const phrase of ['장애 도메인', '업데이트 도메인', '계획된 유지 관리', '장애 도메인 A', 'VM 1과 VM 4', '가용성 영역']) expect(body).toContain(phrase)
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
    layoutTests(440, 120)
    it('가로형은 w-full 래퍼와 SVG 하나뿐이다', () => {
      render(<AvailabilitySetDiagram />)
      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
    })
    it('폭을 왕복해도 노드·그룹 id와 선택·캡션을 유지한다', async () => {
      const change = mediaMock(false)
      const { container } = render(<AvailabilitySetDiagram />)
      await select('계획된 유지 관리')
      const before = { nodes: ids('[data-node]', 'data-node'), groups: ids('[data-group]', 'data-group'), caption: container.querySelector('figcaption')!.textContent }
      for (const wide of [true, false]) {
        act(() => change(wide))
        expect(diagram()).toHaveAttribute('viewBox', wide ? '0 0 440 120' : '0 0 280 180')
        expect(ids('[data-node]', 'data-node')).toEqual(before.nodes)
        expect(ids('[data-group]', 'data-group')).toEqual(before.groups)
        expect(container.querySelector('figcaption')!.textContent).toBe(before.caption)
        expect(screen.getByRole('button', { name: '계획된 유지 관리' })).toHaveAttribute('aria-pressed', 'true')
      }
    })
  })
})
