import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { EthernetFrameDiagram, ethernetFrameScenarios } from './EthernetFrameDiagram'

const wording = () => visualsByTopicId.ethernet.diagrams['ethernet-frame']
const concept = () => topics.find(({ id }) => id === 'ethernet')!.concepts.find(({ id }) => id === 'ethernet.frame')!
const svg = () => screen.getByRole('img', { name: wording().svgLabel })
const box = (element: Element): SvgBox => ({
  id: element.parentElement?.getAttribute('data-node') ?? element.getAttribute('data-group') ?? '',
  x: Number(element.getAttribute('x')), y: Number(element.getAttribute('y')),
  width: Number(element.getAttribute('width')), height: Number(element.getAttribute('height')),
})
const cells = () => Array.from(svg().querySelectorAll('[data-node]'), (node) => box(node.querySelector('rect')!))
const select = async (label: string) => { await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) }) }

function mockWidth(matches: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>()
  const query = {
    matches, media: WIDE_DIAGRAM_QUERY,
    addEventListener: vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener)),
    removeEventListener: vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener)),
  }
  vi.stubGlobal('matchMedia', vi.fn(() => query))
  return (matches: boolean) => {
    query.matches = matches
    act(() => listeners.forEach((listener) => listener(Object.assign(new Event('change'), { matches }) as MediaQueryListEvent)))
  }
}

function expectGeometry(width: number, height: number) {
  expect(boxesOutsideViewBox(Array.from(svg().querySelectorAll('rect'), box), [0, 0, width, height])).toEqual([])
  for (const node of svg().querySelectorAll('[data-node]')) {
    const rect = node.querySelector('rect')!
    expect(rect).toHaveAttribute('height', '32')
    expect(rect).toHaveAttribute('rx', '0')
    expect(rect).toHaveClass('stroke-disabled')
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(estimateTextWidth(node.querySelector('text')!.textContent!, 10) + 12).toBeLessThanOrEqual(box(rect).width)
  }
  // 곁말과 그룹 라벨은 크기 9이며 칸·서로와 겹치지 않고 좌표계 안에 있다.
  const textBoxes = Array.from(svg().querySelectorAll('[data-note], [data-group-label]'), (text): SvgBox => {
    expect(text).toHaveAttribute('font-size', '9')
    const width = estimateTextWidth(text.textContent!, 9)
    const x = Number(text.getAttribute('x'))
    return { id: text.textContent!, x: x - (text.getAttribute('text-anchor') === 'middle' ? width / 2 : 0), y: Number(text.getAttribute('y')) - 9, width, height: 9 }
  })
  expect(boxesOutsideViewBox(textBoxes, [0, 0, width, height])).toEqual([])
  const overlaps = (a: SvgBox, b: SvgBox) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
  for (const text of textBoxes) {
    for (const cell of cells()) expect(overlaps(text, cell), `${text.id} / ${cell.id}`).toBe(false)
  }
  for (let i = 0; i < textBoxes.length; i += 1) {
    for (const other of textBoxes.slice(i + 1)) expect(overlaps(textBoxes[i], other)).toBe(false)
  }
  for (const group of svg().querySelectorAll('[data-group]')) {
    expect(group.closest('[opacity]')).toBeNull()
  }
  // 이어진 칸 자체가 순서를 보이므로 경로와 화살표 마커는 두지 않는다.
  expect(svg().querySelectorAll('[data-path], [data-link], marker')).toHaveLength(0)
  expect(svg().querySelector('[class*="diagram-"], [class*="red"], [class*="green"], [class*="orange"], [class*="amber"]')).toBeNull()
}

const scenarios = [
  { id: 'header', nodes: ['destination', 'source', 'type-length'], notes: ['preamble', 'destination', 'source', 'type-length', 'data', 'fcs'] },
  { id: 'payload', nodes: ['data'], notes: ['preamble', 'destination', 'source', 'type-length', 'data', 'fcs'] },
  { id: 'trailer', nodes: ['fcs'], notes: ['preamble', 'destination', 'source', 'type-length', 'data', 'fcs'] },
  { id: 'preamble', nodes: ['preamble'], notes: ['preamble', 'destination', 'source', 'type-length', 'data', 'fcs'] },
]

function layoutTests(wide: boolean) {
  const width = wide ? 440 : 280
  const height = wide ? 112 : 248
  it('물음형 제목이 버튼 앞에 있고 헤딩은 없으며 SVG는 하나다', () => {
    render(<EthernetFrameDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', `0 0 ${width} ${height}`)
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const question = screen.getByText(wording().question!)
    expect(question.tagName).toBe('P')
    expect(question.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('전체에서는 모든 칸이 선명하고 초기 캡션·범례가 보인다', () => {
    const { container } = render(<EthernetFrameDiagram />)
    for (const cell of svg().querySelectorAll('[data-node]')) expect(cell).toHaveAttribute('opacity', '1')
    expect(container.querySelector('figcaption')).toHaveTextContent(wording().idleCaption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByText(wording().legend!)).toBeInTheDocument()
    expectGeometry(width, height)
    expectPoint(wide)
  })

  it.each(scenarios)('$id: 필요한 칸·곁말만 선명하고 캡션이 바뀐다', async (expected) => {
    const { container } = render(<EthernetFrameDiagram />)
    const scenario = wording().scenarios.find(({ id }) => id === expected.id)!
    await select(scenario.label)
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    for (const cell of svg().querySelectorAll('[data-node]')) {
      expect(cell).toHaveAttribute('opacity', expected.nodes.includes(cell.getAttribute('data-node')!) ? '1' : '0.25')
      expect(cell.querySelector('text')!.textContent).toBe(wording().nodes[cell.getAttribute('data-node')!])
    }
    expect(Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note'))).toEqual(expected.notes)
    for (const note of svg().querySelectorAll('[data-note]')) expect(note.textContent).toBe(wording().notes![note.getAttribute('data-note')!])
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expectGeometry(width, height)
    expectPoint(wide)
    for (const note of svg().querySelectorAll('[data-note]')) {
      expect(note).toHaveAttribute('opacity', expected.nodes.includes(note.getAttribute('data-note')!) ? '1' : '0.25')
    }
  })

  it('다른 시나리오와 전체로 바꾸면 이전 상태가 남지 않는다', async () => {
    const { container } = render(<EthernetFrameDiagram />)
    for (const scenario of wording().scenarios) await select(scenario.label)
    await select('전체')
    for (const cell of svg().querySelectorAll('[data-node]')) expect(cell).toHaveAttribute('opacity', '1')
    expect(container.querySelector('figcaption')!.textContent).toBe(wording().idleCaption)
    expectGeometry(width, height)
  })
}

describe('EthernetFrameDiagram', () => {
  layoutTests(false)

  it('JSON의 문구와 시나리오·근거를 쓰고 시나리오들은 서로 다른 부분을 보인다', () => {
    render(<EthernetFrameDiagram />)
    expect(ethernetFrameScenarios.map(({ id }) => id)).toEqual(scenarios.map(({ id }) => id))
    expect(wording().scenarios.map(({ id }) => id)).toEqual(scenarios.map(({ id }) => id))
    expect(wording().sources).toEqual([concept().id])
    for (const [index, scenario] of ethernetFrameScenarios.entries()) {
      expect(scenario.nodes).toEqual(scenarios[index].nodes)
      expect(scenario.paths).toEqual([])
      expect(scenario.caption).toBe(wording().scenarios[index].caption)
      expect(scenario.label).toBe(wording().scenarios[index].label)
    }
    expect(new Set(scenarios.map(({ nodes, notes }) => JSON.stringify({ nodes, notes }))).size).toBe(scenarios.length)
    for (const group of svg().querySelectorAll('[data-group-label]')) expect(group.textContent).toBe(wording().groups![group.getAttribute('data-group-label')!])
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 본문 뒤에 도식이 붙는다', (headingLevel) => {
    render(<ConceptList concepts={[concept()]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: wording().label })
    expect(figure.closest('article')).toHaveAttribute('id', concept().id)
    expect(figure.previousElementSibling?.textContent).toBe(concept().paragraphs.join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
  })

  it('같은 도식을 둘 그려도 선택 상태가 서로 닿지 않고 마커도 없다', async () => {
    render(<><EthernetFrameDiagram /><EthernetFrameDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: wording().label })
    await act(async () => { await userEvent.click(within(figures[0]).getByRole('button', { name: wording().scenarios[1].label })) })
    expect(within(figures[1]).getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    for (const figure of figures) expect(figure.querySelector('marker')).toBeNull()
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockWidth(true) })
    afterEach(() => { vi.unstubAllGlobals() })
    layoutTests(true)

    it('폭이 바뀌어도 노드·그룹 id와 선택·캡션이 유지된다', async () => {
      const change = mockWidth(false)
      const { container } = render(<EthernetFrameDiagram />)
      await select(wording().scenarios[1].label)
      const ids = (selector: string, attr: string) => Array.from(svg().querySelectorAll(selector), (element) => element.getAttribute(attr))
      const nodes = ids('[data-node]', 'data-node')
      const groups = ids('[data-group]', 'data-group')
      const caption = container.querySelector('figcaption')!.textContent
      change(true)
      expect(svg()).toHaveAttribute('viewBox', '0 0 440 112')
      expect(ids('[data-node]', 'data-node')).toEqual(nodes)
      expect(ids('[data-group]', 'data-group')).toEqual(groups)
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(screen.getByRole('button', { name: wording().scenarios[1].label })).toHaveAttribute('aria-pressed', 'true')
      change(false)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 248')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
    })
  })
})

function expectPoint(wide: boolean) {
  const ordered = cells()
  expect(ordered.map(({ id }) => id)).toEqual(['preamble', 'destination', 'source', 'type-length', 'data', 'fcs'])
  for (let i = 1; i < ordered.length; i += 1) {
    if (wide) {
      expect(ordered[i].x).toBe(ordered[i - 1].x + ordered[i - 1].width)
      expect(ordered[i].y).toBe(ordered[0].y)
    } else {
      expect(ordered[i].y).toBe(ordered[i - 1].y + ordered[i - 1].height)
      expect(ordered[i].x).toBe(ordered[0].x)
    }
  }
  const group = box(svg().querySelector('[data-group="frame"]')!)
  expect(boxesOutsideViewBox(ordered.slice(1), [group.x, group.y, group.width, group.height])).toEqual([])
  expect(boxesOutsideViewBox([ordered[0]], [group.x, group.y, group.width, group.height])).toEqual([ordered[0]])
  const noteText = Array.from(svg().querySelectorAll('[data-note]'), (note) => note.textContent)
  expect(noteText).toEqual(['7+1바이트', '6바이트', '6바이트', '2바이트', '46~1500바이트', '4바이트'])
  const sets = scenarios.map(({ nodes }) => nodes)
  expect(new Set(sets.flat()).size).toBe(sets.flat().length)
}
