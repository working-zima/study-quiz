import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { questions, topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { VnetIsolationDiagram, vnetIsolationScenarios } from './VnetIsolationDiagram'

const conceptId = 'azure-virtual-networking.virtual-network'
const labels = { 'vm-1': 'VM 1', 'vm-2': 'VM 2', 'vm-3': 'VM 3' }
const expected = [
  { id: 'same', label: '같은 가상 네트워크', nodes: ['vm-1', 'vm-2'], paths: ['same-vnet'], notes: ['same-note'], note: '서브넷이 달라도 통신' },
  { id: 'other', label: '다른 가상 네트워크', nodes: ['vm-1', 'vm-3'], paths: [] as string[], notes: ['other-note'], note: '따로 잇지 않으면 통신하지 않음' },
]
const diagram = () => screen.getByRole('img')
const wording = () => visualsByTopicId['azure-virtual-networking'].diagrams['vnet-isolation']
const ids = (selector: string, attribute: string) => Array.from(diagram().querySelectorAll(selector), (el) => el.getAttribute(attribute)!).sort()
const select = async (name: string) => { await act(async () => { await userEvent.click(screen.getByRole('button', { name })) }) }
function box(rect: Element): SvgBox {
  return {
    id: rect.parentElement?.getAttribute('data-node') ?? '',
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}
const nodeBox = (id: string) => box(diagram().querySelector(`[data-node="${id}"] rect`)!)
const overlaps = (a: SvgBox, b: SvgBox) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
function textBox(el: Element): SvgBox {
  const width = estimateTextWidth(el.textContent!, 9) * 1.15
  const x = Number(el.getAttribute('x'))
  return { id: el.getAttribute('data-note') ?? '', x: el.getAttribute('text-anchor') === 'middle' ? x - width / 2 : x, y: Number(el.getAttribute('y')) - 9, width, height: 9 }
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
    ...Array.from(diagram().querySelectorAll('[data-note], [data-group-label]'), textBox),
  ]
  for (const path of diagram().querySelectorAll('[data-path]')) {
    expect(path.closest('[opacity]')).toBeNull()
    expect(path.getAttribute('marker-end')).toMatch(/^url\(#.+\)$/)
    const id = path.getAttribute('data-path')!
    const d = path.getAttribute('d')!
    expect(d).toMatch(/^M[\d\sHV]+$/)
    const vertices = points(d)
    // 같은 가상 네트워크의 VM 둘만 잇는다. 다른 가상 네트워크로 가는 경로는 없다.
    expect(onEdge(vertices[0], nodeBox('vm-1')), id).toBe(true)
    expect(onEdge(vertices[vertices.length - 1], nodeBox('vm-2')), id).toBe(true)
    for (let i = 1; i < vertices.length; i++) {
      for (const area of areas) expect(crosses(vertices[i - 1], vertices[i], area), `${id} ↔ ${area.id}`).toBe(false)
    }
  }
}
function expectGeometry(width: number, height: number) {
  const rectangles = Array.from(diagram().querySelectorAll('rect'), box)
  expect(rectangles).toHaveLength(7)
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
    for (const n of Object.keys(labels).map(nodeBox)) expect(overlaps(area, n)).toBe(false)
  }
  expect(diagram().querySelector('[class*="diagram-"], [class*="green"], [class*="red"], [class*="orange"], [class*="amber"]')).toBeNull()
}

function layoutTests(width: number, height: number) {
  it('전체에서는 노드가 모두 선명하고 경로와 곁말이 없다', () => {
    render(<VnetIsolationDiagram />)
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
    const { container } = render(<VnetIsolationDiagram />)
    await select(scenario.label)
    for (const n of diagram().querySelectorAll('[data-node]')) expect(n).toHaveAttribute('opacity', scenario.nodes.includes(n.getAttribute('data-node')!) ? '1' : '0.25')
    expect(ids('[data-note]', 'data-note')).toEqual(scenario.notes)
    expect(diagram().querySelector('[data-note]')).toHaveTextContent(scenario.note)
    expect(container.querySelector('figcaption')!.textContent).toBe(wording().scenarios.find(({ id }) => id === scenario.id)!.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expectGeometry(width, height)
    expectPaths(scenario.paths)
  })
  it('그룹 소속과 격리 경계가 맞고 그룹 라벨이 내용과 겹치지 않는다', () => {
    render(<VnetIsolationDiagram />)
    const group = (id: string) => box(diagram().querySelector(`[data-group="${id}"]`)!)
    const inside = (child: SvgBox, parent: SvgBox) => child.x > parent.x && child.y > parent.y && child.x + child.width < parent.x + parent.width && child.y + child.height < parent.y + parent.height
    expect(inside(group('subnet-web'), group('vnet-a'))).toBe(true)
    expect(inside(group('subnet-db'), group('vnet-a'))).toBe(true)
    expect(overlaps(group('subnet-web'), group('subnet-db'))).toBe(false)
    expect(overlaps(group('vnet-a'), group('vnet-b'))).toBe(false)
    for (const [node, parent] of [['vm-1', 'subnet-web'], ['vm-2', 'subnet-db'], ['vm-3', 'vnet-b']]) expect(inside(nodeBox(node), group(parent))).toBe(true)
    for (const rect of diagram().querySelectorAll('[data-group]')) {
      expect(rect.closest('[opacity]')).toBeNull()
      const label = diagram().querySelector(`[data-group-label="${rect.getAttribute('data-group')}"]`)!
      expect(label.textContent).toBe(wording().groups![rect.getAttribute('data-group')!])
      expect(inside(textBox(label), box(rect))).toBe(true)
      for (const child of diagram().querySelectorAll('[data-group]')) {
        if (inside(box(child), box(rect))) expect(overlaps(textBox(label), box(child))).toBe(false)
      }
    }
  })
  it('시나리오를 바꾼 뒤 전체로 돌아오면 경로·곁말이 사라지고 노드가 모두 선명하다', async () => {
    render(<VnetIsolationDiagram />)
    for (const scenario of expected) await select(scenario.label)
    await select('전체')
    expectPaths([])
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
  })
}

describe('VnetIsolationDiagram', () => {
  it('물음형 제목은 헤딩 없이 버튼 앞에 있고 문구는 Azure JSON에서 읽는다', () => {
    render(<VnetIsolationDiagram />)
    const text = wording()
    const title = screen.getByText(text.question!)
    expect(title.tagName).toBe('P')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
    expect(screen.getByRole('figure')).toHaveAttribute('aria-label', text.label)
    expect(diagram()).toHaveAttribute('aria-label', text.svgLabel)
    expect(text.nodes).toEqual(labels)
    expect(screen.getByText(text.legend!)).toBeInTheDocument()
    expect(vnetIsolationScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    for (const scenario of expected) {
      const actual = vnetIsolationScenarios.find(({ id }) => id === scenario.id)!
      expect(actual.nodes).toEqual(scenario.nodes)
      expect(actual.paths).toEqual(scenario.paths)
      expect(actual.label).toBe(text.scenarios.find(({ id }) => id === scenario.id)!.label)
    }
  })
  it('세로형은 모바일 보정 래퍼 하나로 그린다', () => {
    render(<VnetIsolationDiagram />)
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
  })
  layoutTests(280, 356)
  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><VnetIsolationDiagram /><VnetIsolationDiagram /></>)
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
  it('아홉째 주제의 부모·자식 개념과 문항 셋을 연결하고 본문에 그림의 예를 쓴다', () => {
    const topic = topics[8]
    expect(topic).toMatchObject({ id: 'azure-virtual-networking', title: '가상 네트워크와 연결', importance: 2, sourcePages: [0, 0] })
    expect(topic.concepts.slice(0, 2).map(({ id, parentId, name }) => ({ id, parentId, name }))).toEqual([
      { id: conceptId, parentId: undefined, name: '가상 네트워크' },
      { id: 'azure-virtual-networking.subnets', parentId: conceptId, name: '서브넷' },
    ])
    const prose = topic.concepts[0].paragraphs.join(' ')
    for (const label of [...Object.values(labels), '가상 네트워크 A', '가상 네트워크 B', '웹 서브넷', '데이터베이스 서브넷']) expect(prose).toContain(label)
    expect(questions.find(({ id }) => id === 'az068')).toMatchObject({ conceptId, format: 'choice', answerIndex: 0 })
    expect(questions.find(({ id }) => id === 'az069')).toMatchObject({ conceptId, format: 'yes-no', answer: true })
    expect(questions.find(({ id }) => id === 'az070')).toMatchObject({ conceptId: 'azure-virtual-networking.subnets', format: 'yes-no', answer: false })
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
    layoutTests(440, 252)
    it('가로형은 w-full 래퍼와 SVG 하나뿐이다', () => {
      render(<VnetIsolationDiagram />)
      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
    })
    it('폭을 왕복해도 노드·경로 id와 선택·캡션을 유지한다', async () => {
      const change = mediaMock(false)
      const { container } = render(<VnetIsolationDiagram />)
      await select('같은 가상 네트워크')
      const before = { nodes: ids('[data-node]', 'data-node'), paths: ids('[data-path]', 'data-path'), caption: container.querySelector('figcaption')!.textContent }
      for (const wide of [true, false]) {
        act(() => change(wide))
        expect(diagram()).toHaveAttribute('viewBox', wide ? '0 0 440 252' : '0 0 280 356')
        expect(ids('[data-node]', 'data-node')).toEqual(before.nodes)
        expect(ids('[data-path]', 'data-path')).toEqual(before.paths)
        expect(container.querySelector('figcaption')!.textContent).toBe(before.caption)
        expect(screen.getByRole('button', { name: '같은 가상 네트워크' })).toHaveAttribute('aria-pressed', 'true')
      }
    })
  })
})
