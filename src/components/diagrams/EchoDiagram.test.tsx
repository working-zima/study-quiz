import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { EchoDiagram, echoScenarios } from './EchoDiagram'

const text = visualsByTopicId.icmp.diagrams['echo']
const conceptId = 'icmp.echo'
const expected = [
  { id: 'request', nodes: ['host-a-1', 'host-a-2'], paths: ['request-1', 'request-2'], notes: ['request-1-note', 'request-2-note'] },
  { id: 'reply', nodes: ['host-b-1', 'host-b-2'], paths: ['reply-1', 'reply-2'], notes: ['reply-1-note', 'reply-2-note'] },
]
const edges: Record<string, string[]> = {
  'request-1': ['host-a-1', 'host-b-1'],
  'request-2': ['host-a-2', 'host-b-2'],
  'reply-1': ['host-b-1', 'host-a-1'],
  'reply-2': ['host-b-2', 'host-a-2'],
}
const ids = ['host-a-1', 'host-b-1', 'host-a-2', 'host-b-2']
const svg = () => screen.getByRole('img', { name: text.svgLabel })
const select = async (label: string) => { await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) }) }
const shown = (kind: string) => Array.from(svg().querySelectorAll(`[data-${kind}]`), (el) => el.getAttribute(`data-${kind}`)!)
const boxOf = (el: Element): SvgBox => ({ id: el.closest('[data-node]')?.getAttribute('data-node') ?? '', x: Number(el.getAttribute('x')), y: Number(el.getAttribute('y')), width: Number(el.getAttribute('width')), height: Number(el.getAttribute('height')) })
const boxes = () => ids.map((id) => boxOf(svg().querySelector(`[data-node="${id}"] rect`)!))
const overlap = (a: SvgBox, b: SvgBox) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
function points(path: Element) {
  let x = 0, y = 0
  return [...path.getAttribute('d')!.matchAll(/([MHV])(-?\d+)(?: (-?\d+))?/gu)].map(([, command, first, second]) => {
    if (command === 'M') { x = Number(first); y = Number(second) }
    if (command === 'H') x = Number(first)
    if (command === 'V') y = Number(first)
    return { x, y }
  })
}
function nodeAt(p: { x: number, y: number }) {
  return boxes().find((b) => (p.x === b.x || p.x === b.x + b.width) && p.y >= b.y && p.y <= b.y + b.height || (p.y === b.y || p.y === b.y + b.height) && p.x >= b.x && p.x <= b.x + b.width)?.id
}
function ends(id: string) {
  const ps = points(svg().querySelector(`[data-path="${id}"]`)!)
  return [nodeAt(ps[0]), nodeAt(ps[ps.length - 1])]
}
function expectGeometry() {
  const viewBox = svg().getAttribute('viewBox')!.split(' ').map(Number) as [number, number, number, number]
  const bs = boxes()
  expect(boxesOutsideViewBox(Array.from(svg().querySelectorAll('rect'), boxOf), viewBox)).toEqual([])
  for (const b of bs) {
    const label = svg().querySelector(`[data-node="${b.id}"] text`)!
    expect(label.textContent).toBe(text.nodes[b.id])
    expect(label).toHaveAttribute('font-size', '10')
    expect(estimateTextWidth(label.textContent!, 10) + 12).toBeLessThanOrEqual(b.width)
    expect(b.height).toBe(32)
    expect(svg().querySelector(`[data-node="${b.id}"] rect`)).toHaveClass('fill-panel', 'stroke-disabled')
    for (const other of bs.filter((other) => other.id !== b.id)) expect(overlap(b, other)).toBe(false)
  }
  for (const path of svg().querySelectorAll('[data-path]')) {
    const id = path.getAttribute('data-path')!
    expect(ends(id), id).toEqual(edges[id])
    const ps = points(path)
    for (let i = 1; i < ps.length; i += 1) {
      const a = ps[i - 1], b = ps[i]
      for (const box of bs) {
        const crosses = a.x === b.x
          ? a.x > box.x && a.x < box.x + box.width && Math.max(a.y, b.y) > box.y && Math.min(a.y, b.y) < box.y + box.height
          : a.y > box.y && a.y < box.y + box.height && Math.max(a.x, b.x) > box.x && Math.min(a.x, b.x) < box.x + box.width
        expect(crosses, `${id} → ${box.id}`).toBe(false)
      }
    }
    expect(path).toHaveClass('stroke-title')
    expect(path).toHaveAttribute('marker-end', `url(#${svg().querySelector('marker')!.id})`)
  }
  const noteBoxes: SvgBox[] = []
  for (const note of svg().querySelectorAll('[data-note]')) {
    const value = text.notes![note.getAttribute('data-note')!]
    expect(note.textContent).toBe(value)
    expect(note).toHaveAttribute('font-size', '9')
    const width = estimateTextWidth(value, 9) * 1.15
    const anchor = note.getAttribute('text-anchor')
    const b: SvgBox = { id: note.getAttribute('data-note')!, x: Number(note.getAttribute('x')) - (anchor === 'middle' ? width / 2 : anchor === 'end' ? width : 0), y: Number(note.getAttribute('y')) - 9, width, height: 9 }
    expect(boxesOutsideViewBox([b], viewBox), value).toEqual([])
    for (const other of [...bs, ...noteBoxes]) expect(overlap(b, other), value).toBe(false)
    for (const path of svg().querySelectorAll('[data-path]')) {
      const ps = points(path)
      for (let i = 1; i < ps.length; i += 1) {
        const a = ps[i - 1], z = ps[i]
        const touches = a.x === z.x
          ? a.x >= b.x && a.x <= b.x + b.width && Math.max(a.y, z.y) >= b.y && Math.min(a.y, z.y) <= b.y + b.height
          : a.y >= b.y && a.y <= b.y + b.height && Math.max(a.x, z.x) >= b.x && Math.min(a.x, z.x) <= b.x + b.width
        expect(touches, value).toBe(false)
      }
    }
    noteBoxes.push(b)
  }
}
function mockMedia(matches: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>()
  const query = { matches, media: WIDE_DIAGRAM_QUERY, addEventListener: (_: string, f: (event: MediaQueryListEvent) => void) => listeners.add(f), removeEventListener: (_: string, f: (event: MediaQueryListEvent) => void) => listeners.delete(f) }
  vi.stubGlobal('matchMedia', vi.fn(() => query))
  return (next: boolean) => { query.matches = next; listeners.forEach((f) => f({ matches: next } as MediaQueryListEvent)) }
}
afterEach(() => { vi.unstubAllGlobals() })

async function expectScenario(scenario: typeof expected[number]) {
  await select(text.scenarios.find(({ id }) => id === scenario.id)!.label)
  expect(shown('path')).toEqual(scenario.paths)
  expect(shown('note').sort()).toEqual([...scenario.notes].sort())
  for (const id of ids) expect(svg().querySelector(`[data-node="${id}"]`)).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  const caption = text.scenarios.find(({ id }) => id === scenario.id)!.caption
  expect(screen.getByText(caption).closest('figcaption')).toHaveAttribute('aria-live', 'polite')
  expectGeometry()
}
async function expectPoint() {
  const pairs: Record<string, { seq: string, identifier: string, data: string }[]> = {}
  for (const s of expected) {
    await expectScenario(s)
    pairs[s.id] = shown('note').map((id) => {
      const note = text.notes![id]
      return { seq: note.match(/순서 번호 (\d+)/u)![1], identifier: note.match(/식별자 (\d+)/u)![1], data: note.match(/데이터 (\w+)/u)![1] }
    })
    for (const [index, path] of shown('path').entries()) {
      expect(ends(path)).toEqual(s.id === 'request' ? [`host-a-${index + 1}`, `host-b-${index + 1}`] : [`host-b-${index + 1}`, `host-a-${index + 1}`])
    }
  }
  expect(pairs.reply).toEqual(pairs.request)
  expect(pairs.request.map(({ seq }) => seq)).toEqual(['1', '2'])
  expect(pairs.request[0].data).not.toBe(pairs.request[1].data)
  const body = topics.find(({ id }) => id === 'icmp')!.concepts.find(({ id }) => id === conceptId)!.paragraphs.join('\n')
  for (const { seq, identifier, data } of pairs.request) {
    expect(body).toContain(`순서 번호 ${seq}`)
    expect(body).toContain(`식별자 ${identifier}`)
    expect(body).toContain(data)
  }
  expect(body).toContain('그대로')
  expect(body).toContain('- **에코 요청**')
  expect(body).toContain('- **에코 응답**')
  const bs = boxes()
  expect(bs.find(({ id }) => id === 'host-a-1')!.y).toBeLessThan(bs.find(({ id }) => id === 'host-a-2')!.y)
}

describe('EchoDiagram', () => {
  it('물음형 제목은 헤딩이 아니며 버튼보다 앞에 있다', () => {
    render(<EchoDiagram />)
    const title = screen.getByText(text.question!)
    expect(title.tagName).toBe('P')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })
  it('전체에서는 노드가 선명하고 화살표와 곁말 없이 안내를 보인다', () => {
    render(<EchoDiagram />)
    expect(shown('node')).toEqual(ids)
    for (const id of ids) expect(svg().querySelector(`[data-node="${id}"]`)).toHaveAttribute('opacity', '1')
    expect(shown('path')).toEqual([])
    expect(shown('note')).toEqual([])
    expect(screen.getByText(text.idleCaption)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
  })
  it.each(expected)('$id의 노드·경로·곁말·캡션과 세로형 기하를 검증한다', async (scenario) => {
    render(<EchoDiagram />)
    await expectScenario(scenario)
  })
  it('세로형은 280 폭이고 모바일 여백을 보정한다', () => {
    render(<EchoDiagram />)
    expect(svg()).toHaveAttribute('viewBox', '0 0 280 200')
    expect(svg().parentElement).toHaveClass('-mx-4', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]')
    expectGeometry()
  })
  it('시나리오 전환과 전체 복귀 때 이전 경로와 곁말이 남지 않는다', async () => {
    render(<EchoDiagram />)
    for (const scenario of [...expected, expected[0]]) await expectScenario(scenario)
    await select('전체')
    expect(shown('path')).toEqual([])
    expect(shown('note')).toEqual([])
    for (const id of ids) expect(svg().querySelector(`[data-node="${id}"]`)).toHaveAttribute('opacity', '1')
    expect(screen.getByText(text.idleCaption)).toBeInTheDocument()
  })
  it('화살표와 곁말이 이 도식의 학습 요점을 보여 주고 본문과 맞는다', async () => {
    render(<EchoDiagram />)
    await expectPoint()
  })
  it('시나리오 id와 문구·근거를 과목 JSON에서 가져온다', () => {
    expect(echoScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    expect(echoScenarios.map(({ id }) => id)).toEqual(expected.map(({ id }) => id))
    expect(text.sources).toEqual([conceptId])
    for (const s of echoScenarios) {
      const wording = text.scenarios.find(({ id }) => id === s.id)!
      expect(s.label).toBe(wording.label)
      expect(s.caption).toBe(wording.caption)
      expect(wording.sources).toEqual([conceptId])
    }
  })
  it('두 인스턴스의 마커가 고유하고 각자 자기 화살표에 연결된다', async () => {
    render(<><EchoDiagram /><EchoDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: text.label })
    for (const f of figures) {
      await act(async () => { await userEvent.click(within(f).getByRole('button', { name: text.scenarios[0].label })) })
      for (const path of f.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${f.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((f) => f.querySelector('marker')!.id)).size).toBe(2)
  })
  it.each([2, 4] as const)('공유 본문 h%i에서 해당 개념의 본문 뒤에 붙는다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === 'icmp')!.concepts.find(({ id }) => id === conceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: text.label })
    expect(figure.closest('article')).toHaveAttribute('id', conceptId)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
  })
  describe('가로형 (768px 이상)', () => {
    it.each(expected)('$id의 노드·경로·곁말·캡션과 가로형 기하를 검증한다', async (scenario) => {
      mockMedia(true)
      render(<EchoDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 440 200')
      expect(svg().parentElement).toHaveClass('w-full')
      expect(svg().parentElement).not.toHaveClass('-mx-4', 'max-w-[380px]')
      await expectScenario(scenario)
    })
    it('가로형도 학습 요점을 지킨다', async () => {
      mockMedia(true)
      render(<EchoDiagram />)
      await expectPoint()
    })
    it('폭이 바뀌어도 시나리오·캡션·노드와 경로 id가 유지된다', async () => {
      const change = mockMedia(false)
      render(<EchoDiagram />)
      const collected = [new Set<string>(), new Set<string>()]
      for (const [index, wide] of [false, true].entries()) {
        act(() => change(wide))
        expect(shown('node')).toEqual(ids)
        for (const s of expected) {
          await expectScenario(s)
          shown('path').forEach((id) => collected[index].add(id))
          act(() => change(!wide))
          expect(screen.getByRole('button', { name: text.scenarios.find(({ id }) => id === s.id)!.label })).toHaveAttribute('aria-pressed', 'true')
          expect(screen.getByText(text.scenarios.find(({ id }) => id === s.id)!.caption)).toBeInTheDocument()
          act(() => change(wide))
        }
      }
      expect([...collected[0]].sort()).toEqual([...collected[1]].sort())
    })
  })
})
