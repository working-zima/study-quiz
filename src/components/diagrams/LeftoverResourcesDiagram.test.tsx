import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { LeftoverResourcesDiagram, leftoverResourcesScenarios } from './LeftoverResourcesDiagram'

const conceptId = 'azure-cost-factors.unused-resources'
const labels = {
  "vm": "VM 1",
  "disk": "디스크",
  "public-ip": "공용 IP 주소",
  "nic": "네트워크 인터페이스"
}
const groupId = 'resource-group'
const groupLabel = '리소스 그룹 1'
const question = 'VM을 지운 뒤 무엇을 더 지워야 할까?'
const expectedScenarios = [
  {
    "id": "before",
    "label": "VM이 있을 때",
    "nodes": [
      "vm",
      "disk",
      "public-ip",
      "nic"
    ],
    "note": null
  },
  {
    "id": "after",
    "label": "VM만 지운 뒤",
    "nodes": [
      "disk",
      "public-ip",
      "nic"
    ],
    "note": "함께 지워지지 않을 수 있다"
  },
  {
    "id": "charged",
    "label": "요금이 붙는 것",
    "nodes": [
      "disk",
      "public-ip"
    ],
    "note": "지우면 비용이 준다"
  }
]

function wording() {
  return visualsByTopicId['azure-cost-factors'].diagrams['leftover-resources']
}
function diagram() {
  return screen.getByRole('img')
}
function box(rect: Element): SvgBox {
  return { id: rect.getAttribute('data-group') ?? rect.parentElement?.getAttribute('data-node') ?? '',
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')) }
}
function textBox(element: Element): SvgBox {
  const width = estimateTextWidth(element.textContent!, 9) * 1.15
  const x = Number(element.getAttribute('x'))
  const anchor = element.getAttribute('text-anchor')
  return { id: element.getAttribute('data-note') ?? 'group-label',
    x: anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x,
    y: Number(element.getAttribute('y')) - 9, width, height: 9 }
}
function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}
async function select(label: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) })
}
function expectGeometry(width: number, height: number) {
  const svg = diagram()
  const rects = Array.from(svg.querySelectorAll('rect'), box)
  expect(rects).toHaveLength(Object.keys(labels).length + 1)
  expect(boxesOutsideViewBox(rects, [0, 0, width, height])).toEqual([])
  const group = box(svg.querySelector(`[data-group="${groupId}"]`)!)
  const groupText = svg.querySelector(`[data-group-label="${groupId}"]`)!
  expect(groupText.textContent).toBe(groupLabel)
  expect(groupText).toHaveAttribute('font-size', '9')
  const labelBox = textBox(groupText)
  expect(boxesOutsideViewBox([labelBox], [group.x, group.y, group.width, group.height])).toEqual([])
  const nodes = Array.from(svg.querySelectorAll('[data-node] rect'), box)
  expect(boxesOutsideViewBox(nodes, [group.x, group.y, group.width, group.height])).toEqual([])
  for (const [id, label] of Object.entries(labels)) {
    const node = svg.querySelector(`[data-node="${id}"]`)!
    const rect = node.querySelector('rect')!
    const nodeBox = box(rect)
    expect(rect).toHaveClass('stroke-disabled')
    expect(nodeBox.height).toBe(32)
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(estimateTextWidth(label, 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox.width)
    expect(nodeBox.y, id).toBeGreaterThan(labelBox.y + labelBox.height)
    for (const other of nodes.filter((candidate) => candidate.id !== id)) expect(overlaps(nodeBox, other)).toBe(false)
  }
  for (const note of svg.querySelectorAll('[data-note]')) {
    expect(note).toHaveAttribute('font-size', '9')
    const area = textBox(note)
    expect(boxesOutsideViewBox([area], [0, 0, width, height])).toEqual([])
    for (const node of nodes) expect(overlaps(area, node)).toBe(false)
    expect(overlaps(area, labelBox)).toBe(false)
  }
  expect(svg.querySelector('path, marker, line, polyline')).toBeNull()
  expect(svg.querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}
async function expectScenario(scenario: typeof expectedScenarios[number], width: number, height: number) {
  await select(scenario.label)
  for (const id of Object.keys(labels)) {
    expect(diagram().querySelector(`[data-node="${id}"]`)).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  for (const group of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(group.closest('[opacity]')).toBeNull()
  expect(Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.textContent)).toEqual(scenario.note ? [scenario.note] : [])
  const caption = screen.getByRole('figure').querySelector('figcaption')!
  expect(caption.textContent).toBe(wording().scenarios.find(({ id }) => id === scenario.id)!.caption)
  expect(caption).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expectGeometry(width, height)
}

describe('LeftoverResourcesDiagram', () => {
  it('물음형 제목이 헤딩 없이 버튼보다 앞에 나온다', () => {
    render(<LeftoverResourcesDiagram />)
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('전체에서는 모든 노드가 선명하고 곁말과 경로 없이 안내가 나온다', () => {
    render(<LeftoverResourcesDiagram />)
    expect(Array.from(diagram().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(Object.keys(labels))
    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelector('[data-note], path, marker')).toBeNull()
    expect(screen.getByRole('figure')).toHaveAccessibleName(wording().label)
    expect(diagram()).toHaveAccessibleName(wording().svgLabel)
    expect(screen.getByText(wording().idleCaption)).toBeInTheDocument()
  })

  it('모든 상자와 라벨이 세로형 안에 들고 노드가 그룹 안에 있다', () => {
    render(<LeftoverResourcesDiagram />)
    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 272')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expectGeometry(280, 272)
  })

  it.each(expectedScenarios)('$label: 요금을 가르는 노드와 곁말·캡션을 보인다', async (scenario) => {
    render(<LeftoverResourcesDiagram />)
    await expectScenario(scenario, 280, 272)
  })

  it('전체로 돌아가면 선택과 곁말이 사라지고 모든 노드가 다시 선명하다', async () => {
    render(<LeftoverResourcesDiagram />)
    await select(expectedScenarios[2].label)
    await select('전체')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelector('[data-note]')).toBeNull()
    expect(screen.getByText(wording().idleCaption)).toBeInTheDocument()
  })

  it('JSON의 시나리오와 문구를 쓰며 그림의 대상과 예시가 본문에 있다', () => {
    const text = wording()
    const concept = topics.flatMap(({ concepts }) => concepts).find(({ id }) => id === conceptId)!
    expect(concept).toBeDefined()
    expect(text.sources).toEqual([conceptId])
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual({ [groupId]: groupLabel })
    expect(text.question).toBe(question)
    expect(text.scenarios.map(({ id }) => id)).toEqual(expectedScenarios.map(({ id }) => id))
    expect(leftoverResourcesScenarios.map(({ id }) => id)).toEqual(expectedScenarios.map(({ id }) => id))
    for (const expected of expectedScenarios) {
      const source = text.scenarios.find(({ id }) => id === expected.id)!
      expect(source.sources).toEqual([conceptId])
      expect(leftoverResourcesScenarios.find(({ id }) => id === expected.id)).toEqual({ id: source.id, label: source.label, caption: source.caption, nodes: expected.nodes, paths: [] })
    }
    for (const fact of ["회사 B", "리소스 그룹 1", "VM 1", "디스크", "공용 IP 주소", "정적", "네트워크 인터페이스"]) expect(concept.paragraphs.join(' '), fact).toContain(fact)
  })

  it('두 번 렌더해도 마커가 없고 각 그림의 선택이 독립적이다', async () => {
    render(<><LeftoverResourcesDiagram /><LeftoverResourcesDiagram /></>)
    const figures = screen.getAllByRole('figure')
    await act(async () => { await userEvent.click(within(figures[0]).getByRole('button', { name: expectedScenarios[2].label })) })
    expect(within(figures[1]).getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    for (const figure of figures) expect(figure.querySelector('path, marker, [id]')).toBeNull()
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 개념 본문 뒤에 도식이 붙는다', (headingLevel) => {
    const concept = topics.flatMap(({ concepts }) => concepts).find(({ id }) => id === conceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: wording().label })
    expect(figure.closest('article')).toHaveAttribute('id', conceptId)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
  })

  describe('가로형 (768px 이상)', () => {
    function mockMatchMedia(matches: boolean) {
      const listeners = new Set<() => void>()
      const mediaQuery = { matches, media: WIDE_DIAGRAM_QUERY,
        addEventListener: (_: string, listener: () => void) => listeners.add(listener),
        removeEventListener: (_: string, listener: () => void) => listeners.delete(listener) }
      vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery))
      return (next: boolean) => { mediaQuery.matches = next; listeners.forEach((listener) => listener()) }
    }
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    it('SVG 하나를 가로형 w-full 래퍼로 그리고 소속과 넘침을 지킨다', () => {
      render(<LeftoverResourcesDiagram />)
      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 176')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expectGeometry(440, 176)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 요금 차이를 가로형에서도 보인다', async (scenario) => {
      render(<LeftoverResourcesDiagram />)
      await expectScenario(scenario, 440, 176)
    })

    it.each(expectedScenarios)('$label: 폭을 왕복해 바꿔도 선택·캡션·노드와 그룹 id가 유지된다', async (scenario) => {
      const change = mockMatchMedia(false)
      render(<LeftoverResourcesDiagram />)
      await expectScenario(scenario, 280, 272)
      const ids = () => Array.from(diagram().querySelectorAll('[data-node], [data-group]'), (node) => node.getAttribute('data-node') ?? node.getAttribute('data-group'))
      const before = ids()
      const caption = screen.getByRole('figure').querySelector('figcaption')!.textContent
      act(() => change(true))
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 176')
      expect(ids()).toEqual(before)
      expect(screen.getByRole('figure').querySelector('figcaption')!.textContent).toBe(caption)
      expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
      expectGeometry(440, 176)
      act(() => change(false))
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 272')
      expect(ids()).toEqual(before)
      expect(screen.getByRole('figure').querySelector('figcaption')!.textContent).toBe(caption)
      expectGeometry(280, 272)
    })
  })
})
