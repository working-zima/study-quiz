import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { PortRangesDiagram, portRangesScenarios } from './PortRangesDiagram'

const topicId = 'ports'
const anchorConceptId = `${topicId}.port-ranges`
const labels: Record<string, string> = {
  'range-1': '0 ~ 1023',
  'example-1': '80 · HTTP',
  'range-2': '1024 ~ 49151',
  'example-2': '8080 · HTTP 대체 번호',
  'range-3': '49152 ~ 65535',
  'example-3': '50001 · 웹 브라우저',
}
const groupLabels: Record<string, string> = { 'well-known': '잘 알려진 포트', registered: '등록된 포트', dynamic: '동적 포트' }
const noteLabels: Record<string, string> = { 'assign-1': 'IANA가 정해 준다', 'assign-2': 'IANA에 신청해 정해 받는다', 'assign-3': 'IANA가 정해 주지 않는다' }
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
// 범위마다 그룹·범위 노드·예 노드·곁말.
const rows = [
  { group: 'well-known', range: 'range-1', example: 'example-1', note: 'assign-1' },
  { group: 'registered', range: 'range-2', example: 'example-2', note: 'assign-2' },
  { group: 'dynamic', range: 'range-3', example: 'example-3', note: 'assign-3' },
]
const noteOwner: Record<string, string> = Object.fromEntries(rows.map(({ note, range }) => [note, range]))

const question = '포트 번호 0~65535는 어떻게 나뉠까?'
const figureName = '포트 번호 0~65535를 잘 알려진 포트·등록된 포트·동적 포트의 세 범위로 나누고 범위마다 예를 보이는 도식'
const svgName = '잘 알려진 포트 0 ~ 1023과 그 예 80 · HTTP, 등록된 포트 1024 ~ 49151과 그 예 8080 · HTTP 대체 번호, 동적 포트 49152 ~ 65535와 그 예 50001 · 웹 브라우저'
const idleCaption = '포트 번호 0부터 65535까지를 IANA가 나눈 세 범위와, 범위마다 이 주제의 글에 나온 번호 하나씩을 놓았다. 버튼을 고르면 그 범위의 번호를 누가 어떻게 쓰는지 볼 수 있다.'
const legend = '얇은 선 박스 하나가 범위 하나다. 왼쪽 노드는 그 범위의 번호, 오른쪽 노드는 그 범위에 드는 예이고, 박스 오른쪽 위 곁말은 번호를 IANA가 어떻게 정해 주는지다.'
const expectedScenarios = [
  {
    id: 'well-known', label: '잘 알려진 포트', nodes: ['range-1', 'example-1'],
    caption: '0번부터 1023번까지는 잘 알려진 포트다. 널리 쓰는 서비스에 IANA가 정해 준 번호로, 웹 페이지를 주고받는 HTTP가 80번을 기본으로 쓴다. 0번은 남겨 둔 번호라 어떤 서비스에도 정해 주지 않는다.',
  },
  {
    id: 'registered', label: '등록된 포트', nodes: ['range-2', 'example-2'],
    caption: '1024번부터 49151번까지는 등록된 포트다. 응용 프로그램을 만든 쪽이 IANA에 신청해 정해 받아 쓰는 번호로, 8080번은 HTTP 대체 번호라는 이름으로 정해져 있다.',
  },
  {
    id: 'dynamic', label: '동적 포트', nodes: ['range-3', 'example-3'],
    caption: '49152번부터 65535번까지는 동적 포트다. IANA가 누구에게도 정해 주지 않아 등록 없이 비어 있는 번호를 골라 잠깐 쓰고, 운영체제가 웹 브라우저에게 정해 준 50001도 이 범위에 든다. 서비스의 고정 번호로는 쓰지 않는다.',
  },
]

const svg = () => screen.getByRole('img', { name: svgName })
const select = async (label: string) => { await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) }) }

function readBox(rect: Element, id = ''): SvgBox {
  return {
    id,
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

const nodeBox = (id: string) => readBox(svg().querySelector(`[data-node="${id}"] rect`)!, id)
const groupBox = (id: string) => readBox(svg().querySelector(`[data-group="${id}"]`)!, id)
const label = (id: string) => svg().querySelector(`[data-node="${id}"] text`)!.textContent!
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)!
const brightNodes = () => nodeIds.filter((id) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function contains(outer: SvgBox, inner: SvgBox) {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height
}

// 글자 크기 9인 글자가 차지하는 상자. 반각 글자가 화면에서 더 넓게 그려지는 것을 생각해 폭을 1.15배로 잡는다.
function textBox(text: Element, id: string): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9) * 1.15
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id, x: left, y: y - 9, width, height: 9 }
}

const groupLabelBox = (id: string) => textBox(svg().querySelector(`[data-group-label="${id}"]`)!, `${id}-label`)

// `시작 ~ 끝`과 `번호 · 쓰는 곳`에서 수를 꺼낸다.
const rangeOf = (id: string) => label(id).split(' ~ ').map(Number) as [number, number]
const exampleOf = (id: string) => Number(label(id).split(' · ')[0])

function mockMatchMedia(matches: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>()
  const mediaQuery = {
    matches,
    media: WIDE_DIAGRAM_QUERY,
    addEventListener: vi.fn((type: string, listener: (event: MediaQueryListEvent) => void) => {
      if (type === 'change') listeners.add(listener)
    }),
    removeEventListener: vi.fn((type: string, listener: (event: MediaQueryListEvent) => void) => {
      if (type === 'change') listeners.delete(listener)
    }),
  }
  vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery))
  return (nextMatches: boolean) => {
    mediaQuery.matches = nextMatches
    act(() => listeners.forEach((listener) => listener(Object.assign(new Event('change'), { matches: nextMatches, media: mediaQuery.media }) as MediaQueryListEvent)))
  }
}

function layoutTests(wide: boolean) {
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 212] : [0, 0, 280, 212]

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<PortRangesDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 곁말이 모두 선명하고 경로 없이 선택 안내가 나온다', () => {
    const { container } = render(<PortRangesDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node], [data-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(Array.from(svg().querySelectorAll('[data-note]'), (item) => item.getAttribute('data-note'))).toEqual(Object.keys(noteLabels))
    for (const id of groupIds) expect(svg().querySelector(`[data-group-label="${id}"]`)!.textContent).toBe(groupLabels[id])
    expect(svg().querySelectorAll('path, line, polyline')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 그 범위의 노드와 곁말만 선명하고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<PortRangesDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    for (const [id, owner] of Object.entries(noteOwner)) expect(note(id), id).toHaveAttribute('opacity', scenario.nodes.includes(owner) ? '1' : '0.25')
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말·그룹 라벨이 자리에 들어간다`, () => {
    render(<PortRangesDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
    }
    for (let i = 0; i < nodeIds.length; i += 1) {
      for (const other of nodeIds.slice(i + 1)) expect(overlaps(nodeBox(nodeIds[i]), nodeBox(other)), `${nodeIds[i]} ↔ ${other}`).toBe(false)
    }
    for (let i = 0; i < groupIds.length; i += 1) {
      for (const other of groupIds.slice(i + 1)) expect(overlaps(groupBox(groupIds[i]), groupBox(other)), `${groupIds[i]} ↔ ${other}`).toBe(false)
    }
    const texts: SvgBox[] = []
    for (const row of rows) {
      expect(contains(groupBox(row.group), nodeBox(row.range)), row.range).toBe(true)
      expect(contains(groupBox(row.group), nodeBox(row.example)), row.example).toBe(true)
      // 범위 노드가 왼쪽, 예 노드가 오른쪽에 같은 줄로 선다.
      expect(nodeBox(row.range).y).toBe(nodeBox(row.example).y)
      expect(nodeBox(row.range).x + nodeBox(row.range).width).toBeLessThanOrEqual(nodeBox(row.example).x)
      expect(svg().querySelector(`[data-group-label="${row.group}"]`)).toHaveAttribute('font-size', '9')
      expect(note(row.note)).toHaveAttribute('font-size', '9')
      expect(note(row.note)).toHaveClass('fill-muted')
      expect(note(row.note).textContent).toBe(noteLabels[row.note])
      const labelBox = groupLabelBox(row.group)
      const noteBox = textBox(note(row.note), row.note)
      expect(contains(groupBox(row.group), labelBox), row.group).toBe(true)
      expect(contains(groupBox(row.group), noteBox), row.note).toBe(true)
      texts.push(labelBox, noteBox)
    }
    for (const box of texts) {
      expect(box.x, box.id).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width, box.id).toBeLessThanOrEqual(viewBox[2])
      expect(box.y, box.id).toBeGreaterThanOrEqual(0)
      expect(box.y + box.height, box.id).toBeLessThanOrEqual(viewBox[3])
      for (const id of nodeIds) expect(overlaps(box, nodeBox(id)), `${box.id} ↔ ${id}`).toBe(false)
    }
    for (let i = 0; i < texts.length; i += 1) {
      for (const other of texts.slice(i + 1)) expect(overlaps(texts[i], other), `${texts[i].id} ↔ ${other.id}`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  // 요점: 세 범위는 0에서 시작해 65535에서 끝나고, 앞 범위의 끝 번호 + 1이 다음 범위의 시작 번호다.
  // 범위를 고르면 그 범위와 예 하나만 선명하고, 예의 번호가 그 범위 안에 든다. 범위와 예는 개념 본문에 있다.
  it('세 범위가 0부터 65535까지 빈틈없이 이어지고, 고른 범위의 예가 그 범위 안에 든다', async () => {
    render(<PortRangesDiagram />)
    const ranges = rows.map(({ range }) => rangeOf(range))
    expect(ranges[0][0]).toBe(0)
    expect(ranges[ranges.length - 1][1]).toBe(65535)
    for (let i = 0; i + 1 < ranges.length; i += 1) expect(ranges[i][1] + 1).toBe(ranges[i + 1][0])
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const bright = brightNodes()
      const range = bright.filter((id) => id.startsWith('range-'))
      const example = bright.filter((id) => id.startsWith('example-'))
      expect(range, scenario.id).toHaveLength(1)
      expect(example, scenario.id).toHaveLength(1)
      const [start, end] = rangeOf(range[0])
      expect(exampleOf(example[0]), scenario.id).toBeGreaterThanOrEqual(start)
      expect(exampleOf(example[0]), scenario.id).toBeLessThanOrEqual(end)
      expect(svg().querySelector(`[data-group-label="${rows.find((row) => row.range === range[0])!.group}"]`)!.textContent).toBe(scenario.label)
    }

    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join('\n')
    for (const [start, end] of ranges) expect(body).toContain(`\`${start}\`번부터 \`${end}\`번까지`)
    for (const name of Object.values(groupLabels)) expect(body).toContain(`**${name}**`)
    expect(body).toContain('HTTP는 `80`번을 기본으로 쓰고')
    expect(body).toContain('`8080`번은 HTTP 대체 번호(HTTP Alternate)라는 이름으로 정해져 있다')
    expect(body).toContain('운영체제가 웹 브라우저에게 정해 준 `50001`도 이 범위의 번호다')
  })
}

describe('PortRangesDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<PortRangesDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 212')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('등록된 포트')
      const tallBright = brightNodes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 212')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '등록된 포트' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(brightNodes()).toEqual(tallBright)
    })
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<PortRangesDiagram />)
    const text = visualsByTopicId[topicId].diagrams['port-ranges']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(portRangesScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.label).toBe(figureName)
    expect(text.svgLabel).toBe(svgName)
    expect(text.sources).toEqual([anchorConceptId])
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map((scenario) => scenario.label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = portRangesScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual([])
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 포트 번호의 범위 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(within(figure).queryByRole('heading')).toBeNull()
  })
})
