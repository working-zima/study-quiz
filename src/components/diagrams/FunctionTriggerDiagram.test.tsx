import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { questions, topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { FunctionTriggerDiagram, functionTriggerScenarios } from './FunctionTriggerDiagram'

const conceptId = 'azure-compute.functions'
const labels = { request: 'REST 요청', timer: '타이머', message: '다른 서비스의 메시지', function: '함수' }
const triggers = ['request', 'timer', 'message']
const sources = { 'from-request': 'request', 'from-timer': 'timer', 'from-message': 'message' }
const expected = [
  { id: 'idle', label: '이벤트가 없을 때', nodes: ['function'], paths: [] as string[], notes: ['idle-note'], note: '실행되지 않음' },
  { id: 'request', label: 'REST 요청이 올 때', nodes: ['request', 'function'], paths: ['from-request'], notes: ['request-note'], note: '요청을 처리하는 동안 실행' },
  { id: 'timer', label: '정해 둔 시각', nodes: ['timer', 'function'], paths: ['from-timer'], notes: ['timer-note'], note: '정해 둔 시각에 실행' },
  { id: 'message', label: '메시지가 올 때', nodes: ['message', 'function'], paths: ['from-message'], notes: ['message-note'], note: '메시지를 처리하는 동안 실행' },
]
const diagram = () => screen.getByRole('img')
const wording = () => visualsByTopicId['azure-compute'].diagrams['function-trigger']
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
  return { id: el.getAttribute('data-note') ?? '', x: x - width / 2, y: Number(el.getAttribute('y')) - 9, width, height: 9 }
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
    ...Array.from(diagram().querySelectorAll('[data-note]'), textBox),
  ]
  for (const path of diagram().querySelectorAll('[data-path]')) {
    expect(path.closest('[opacity]')).toBeNull()
    expect(path.getAttribute('marker-end')).toMatch(/^url\(#.+\)$/)
    const id = path.getAttribute('data-path')! as keyof typeof sources
    const d = path.getAttribute('d')!
    expect(d).toMatch(/^M[\d\sHV]+$/)
    const vertices = points(d)
    // 요점: 어느 트리거에서 나온 경로든 끝은 함수의 변 위다.
    expect(onEdge(vertices[0], nodeBox(sources[id])), id).toBe(true)
    expect(onEdge(vertices[vertices.length - 1], nodeBox('function')), id).toBe(true)
    for (let i = 1; i < vertices.length; i++) {
      for (const area of areas) expect(crosses(vertices[i - 1], vertices[i], area), `${id} ↔ ${area.id}`).toBe(false)
    }
  }
}
function expectGeometry(width: number, height: number) {
  const rectangles = Array.from(diagram().querySelectorAll('rect'), box)
  expect(rectangles).toHaveLength(4)
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
  const textAreas = Array.from(diagram().querySelectorAll('[data-note]'), textBox)
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
    render(<FunctionTriggerDiagram />)
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
    const { container } = render(<FunctionTriggerDiagram />)
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
  it('이벤트가 없을 때는 경로가 없고 트리거 셋이 모두 흐리며, 트리거마다 경로가 정확히 하나씩 서로 다르다', async () => {
    render(<FunctionTriggerDiagram />)
    await select('이벤트가 없을 때')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    for (const id of triggers) expect(diagram().querySelector(`[data-node="${id}"]`)).toHaveAttribute('opacity', '0.25')
    expect(diagram().querySelector('[data-node="function"]')).toHaveAttribute('opacity', '1')
    const seen = new Set<string>()
    for (const label of ['REST 요청이 올 때', '정해 둔 시각', '메시지가 올 때']) {
      await select(label)
      const shown = ids('[data-path]', 'data-path')
      expect(shown).toHaveLength(1)
      seen.add(shown[0])
    }
    expect(seen.size).toBe(3)
    await select('전체')
    expectPaths([])
  })
}

describe('FunctionTriggerDiagram', () => {
  it('물음형 제목은 헤딩 없이 버튼 앞에 있고 문구는 Azure JSON에서 읽는다', () => {
    render(<FunctionTriggerDiagram />)
    const text = wording()
    const title = screen.getByText(text.question!)
    expect(title.tagName).toBe('P')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
    expect(screen.getByRole('figure')).toHaveAttribute('aria-label', text.label)
    expect(diagram()).toHaveAttribute('aria-label', text.svgLabel)
    expect(text.nodes).toEqual(labels)
    expect(screen.getByText(text.legend!)).toBeInTheDocument()
    expect(functionTriggerScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    for (const scenario of expected) {
      const actual = functionTriggerScenarios.find(({ id }) => id === scenario.id)!
      expect(actual.nodes).toEqual(scenario.nodes)
      expect(actual.paths).toEqual(scenario.paths)
      expect(actual.label).toBe(text.scenarios.find(({ id }) => id === scenario.id)!.label)
    }
  })
  // 트리거를 고를 수 있는 종류로 그린 그림이다. 함수 하나에 트리거 셋이 함께 걸린 것으로 읽히면 공식 문서와 어긋난다.
  it('함수 하나에 트리거가 하나뿐이라는 것을 그림과 본문이 함께 밝힌다', () => {
    expect(wording().idleCaption).toContain('함수 하나에는')
    const concept = topics.find(({ id }) => id === 'azure-compute')!.concepts.find(({ id }) => id === conceptId)!
    expect(concept.paragraphs.join(' ')).toContain('함수 하나에는 트리거를 하나 둔다')
  })
  it('세로형은 모바일 보정 래퍼 하나로 그린다', () => {
    render(<FunctionTriggerDiagram />)
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
  })
  layoutTests(280, 152)
  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><FunctionTriggerDiagram /><FunctionTriggerDiagram /></>)
    const markerIds = Array.from(document.querySelectorAll('marker'), (marker) => marker.id)
    expect(markerIds).toHaveLength(2)
    expect(new Set(markerIds).size).toBe(2)
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
  it('컨테이너 서비스 뒤에 Functions와 App Service를 순서대로 두고 문항 셋을 연결한다', () => {
    const topic = topics.find(({ id }) => id === 'azure-compute')!
    expect(topic.concepts).toHaveLength(9)
    expect(topic.concepts.slice(7).map(({ id, parentId, name }) => ({ id, parentId, name }))).toEqual([
      { id: conceptId, parentId: undefined, name: 'Azure Functions' },
      { id: 'azure-compute.app-service', parentId: undefined, name: 'Azure App Service' },
    ])
    expect(questions.find(({ id }) => id === 'az065')).toMatchObject({ conceptId, format: 'yes-no', answer: false })
    expect(questions.find(({ id }) => id === 'az066')).toMatchObject({ conceptId: 'azure-compute.app-service', format: 'choice', answerIndex: 3 })
    expect(questions.find(({ id }) => id === 'az067')).toMatchObject({ conceptId: 'azure-compute.app-service', format: 'choice', answerIndex: 2 })
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
    layoutTests(440, 144)
    it('가로형은 w-full 래퍼와 SVG 하나뿐이다', () => {
      render(<FunctionTriggerDiagram />)
      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
    })
    it('폭을 왕복해도 노드·경로 id와 선택·캡션을 유지한다', async () => {
      const change = mediaMock(false)
      const { container } = render(<FunctionTriggerDiagram />)
      await select('정해 둔 시각')
      const before = { nodes: ids('[data-node]', 'data-node'), paths: ids('[data-path]', 'data-path'), caption: container.querySelector('figcaption')!.textContent }
      for (const wide of [true, false]) {
        act(() => change(wide))
        expect(diagram()).toHaveAttribute('viewBox', wide ? '0 0 440 144' : '0 0 280 152')
        expect(ids('[data-node]', 'data-node')).toEqual(before.nodes)
        expect(ids('[data-path]', 'data-path')).toEqual(before.paths)
        expect(container.querySelector('figcaption')!.textContent).toBe(before.caption)
        expect(screen.getByRole('button', { name: '정해 둔 시각' })).toHaveAttribute('aria-pressed', 'true')
      }
    })
  })
})
