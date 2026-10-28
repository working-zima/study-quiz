import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { FragmentFieldsDiagram, fragmentFieldsScenarios } from './FragmentFieldsDiagram'

const topicId = 'ip-protocol'
const anchorConceptId = `${topicId}.fragment-fields`
const labels: Record<string, string> = {
  'frag-1': '조각 1', 'id-1': '식별자 1234', 'mf-1': 'MF 1', 'offset-1': '오프셋 0',
  'frag-2': '조각 2', 'id-2': '식별자 1234', 'mf-2': 'MF 1', 'offset-2': '오프셋 185',
  'frag-3': '조각 3', 'id-3': '식별자 1234', 'mf-3': 'MF 0', 'offset-3': '오프셋 370',
  'data-1': '1480바이트', 'data-2': '1480바이트', 'data-3': '1040바이트',
}
const noteLabels: Record<string, string> = { 'start-1': '0바이트부터', 'start-2': '1480바이트부터', 'start-3': '2960바이트부터' }
const groupLabel = '원래 데이터 4000바이트'
const nodeIds = Object.keys(labels)
const column = (k: number) => [`frag-${k}`, `id-${k}`, `mf-${k}`, `offset-${k}`, `data-${k}`]

const question = '조각들은 서로 어떻게 알아볼까?'
const idleCaption = '4020바이트짜리 IPv4 패킷이 라우터에서 조각 셋으로 나뉘었다. 세 조각의 헤더에는 같은 식별자가 들어 있고, MF와 단편화 오프셋은 조각마다 다르다. 버튼을 고르면 조각마다 세 칸이 무엇을 알려 주는지 볼 수 있다.'
const legend = '위쪽 상자는 조각마다 헤더에 적힌 세 칸이고, 아래 띠는 원래 데이터에서 각 조각이 담은 부분이다. 상자의 크기는 칸의 비트 수와 비례하지 않는다.'
const figureName = '한 패킷에서 나온 조각 셋의 식별자·MF·단편화 오프셋을 보이는 도식'
const svgName = '4020바이트 IPv4 패킷에서 나온 조각 셋이 저마다 식별자·MF·단편화 오프셋 칸을 갖고, 원래 데이터 4000바이트의 앞에서부터 차례로 1480바이트·1480바이트·1040바이트를 담는 모습'
const expectedScenarios = [
  {
    id: 'first', label: '첫 조각', nodes: column(1),
    caption: '첫 조각은 원래 데이터의 처음부터 1480바이트를 담아 단편화 오프셋이 0이다. 뒤에 조각이 더 있으므로 MF는 1이고, 식별자는 원래 패킷과 같은 1234다.',
  },
  {
    id: 'middle', label: '가운데 조각', nodes: column(2),
    caption: '둘째 조각은 원래 데이터의 1480바이트 지점부터 담는다. 오프셋 칸에는 이 거리를 8바이트 단위로 센 185(1480 ÷ 8)가 들어가고, 뒤에 조각이 더 있어 MF는 1이다.',
  },
  {
    id: 'last', label: '마지막 조각', nodes: column(3),
    caption: '마지막 조각은 2960바이트 지점부터 남은 1040바이트를 담아 오프셋이 370(2960 ÷ 8)이다. 뒤에 조각이 없으므로 MF가 0이고, 목적지 호스트는 이것으로 데이터가 어디서 끝나는지 안다.',
  },
]

function diagram() {
  return screen.getByRole('img', { name: svgName })
}

async function selectScenario(label: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) })
}

function readBox(rect: Element, id = ''): SvgBox {
  return {
    id,
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

function nodeBox(id: string) {
  return readBox(diagram().querySelector(`[data-node="${id}"] rect`)!, id)
}

function groupBox() {
  return readBox(diagram().querySelector('[data-group="data"]')!, 'data')
}

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

function numberIn(text: string) {
  return Number(/\d+/u.exec(text)![0])
}

function center(box: SvgBox) {
  return box.x + box.width / 2
}

function brightNodes() {
  return nodeIds.filter((id) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다. 곁말과 그룹 라벨은 viewBox 안에서 노드와 겹치지 않는다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), (rect) => readBox(rect))
  expect(boxes).toHaveLength(nodeIds.length + 1)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(nodeBox(id).height).toBe(32)
    expect(estimateTextWidth(label, 10) + 12, `${id} ${label}`).toBeLessThanOrEqual(nodeBox(id).width)
  }
  for (let i = 0; i < nodeIds.length; i += 1) {
    for (let j = i + 1; j < nodeIds.length; j += 1) {
      expect(overlaps(nodeBox(nodeIds[i]), nodeBox(nodeIds[j])), `${nodeIds[i]} ↔ ${nodeIds[j]}`).toBe(false)
    }
  }
  const texts = [
    ...Array.from(diagram().querySelectorAll('[data-note]'), (note) => textBox(note, note.getAttribute('data-note')!)),
    textBox(diagram().querySelector('[data-group-label="data"]')!, 'group-label'),
  ]
  for (const box of texts) {
    expect(box.x, box.id).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, box.id).toBeLessThanOrEqual(viewBox[2])
    expect(box.y, box.id).toBeGreaterThanOrEqual(0)
    expect(box.y + box.height, box.id).toBeLessThanOrEqual(viewBox[3])
    for (const id of nodeIds) expect(overlaps(box, nodeBox(id)), `${box.id} ↔ ${id}`).toBe(false)
  }
  for (let i = 0; i < texts.length; i += 1) {
    for (let j = i + 1; j < texts.length; j += 1) expect(overlaps(texts[i], texts[j]), `${texts[i].id} ↔ ${texts[j].id}`).toBe(false)
  }
  const label = textBox(diagram().querySelector('[data-group-label="data"]')!, 'group-label')
  expect(contains(groupBox(), label)).toBe(true)
}

async function expectScenario(scenario: typeof expectedScenarios[number], container: HTMLElement) {
  await selectScenario(scenario.label)
  for (const id of nodeIds) {
    expect(diagram().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  expect(diagram().querySelector('[data-group="data"]')!.closest('[opacity]')).toBeNull()
  for (const k of [1, 2, 3]) {
    expect(diagram().querySelector(`[data-note="start-${k}"]`)).toHaveAttribute('opacity', scenario.nodes.includes(`frag-${k}`) ? '1' : '0.25')
  }
  expect(diagram().querySelectorAll('path')).toHaveLength(0)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
}

// 요점: 세 조각의 식별자가 같고, MF는 마지막 조각만 0이며, 오프셋 칸의 값에 8을 곱한 수가 그 조각이 담은 데이터의 시작 자리다.
// 아래 띠에서 조각이 담은 데이터는 앞에서부터 빈틈없이 이어지고, 시작 자리는 앞 조각들이 담은 크기의 합이다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const ids = [1, 2, 3].map((k) => diagram().querySelector(`[data-node="id-${k}"] text`)!.textContent)
  expect(new Set(ids).size).toBe(1)
  const mfZero = [1, 2, 3].filter((k) => diagram().querySelector(`[data-node="mf-${k}"] text`)!.textContent === 'MF 0')
  const mfOne = [1, 2, 3].filter((k) => diagram().querySelector(`[data-node="mf-${k}"] text`)!.textContent === 'MF 1')
  expect(mfZero).toEqual([3])
  expect(mfOne).toEqual([1, 2])

  let start = 0
  for (const k of [1, 2, 3]) {
    const offset = numberIn(diagram().querySelector(`[data-node="offset-${k}"] text`)!.textContent!)
    const note = numberIn(diagram().querySelector(`[data-note="start-${k}"]`)!.textContent!)
    expect(offset * 8, `조각 ${k}`).toBe(note)
    expect(note, `조각 ${k} 시작`).toBe(start)
    start += numberIn(diagram().querySelector(`[data-node="data-${k}"] text`)!.textContent!)
    for (const id of column(k).slice(0, 4)) expect(center(nodeBox(id)), id).toBe(center(nodeBox(`data-${k}`)))
    expect(Number(diagram().querySelector(`[data-note="start-${k}"]`)!.getAttribute('x'))).toBe(center(nodeBox(`data-${k}`)))
    expect(contains(groupBox(), nodeBox(`data-${k}`)), `data-${k}`).toBe(true)
    for (const id of column(k).slice(0, 4)) expect(contains(groupBox(), nodeBox(id)), id).toBe(false)
  }
  expect(start).toBe(numberIn(groupLabel))
  expect(nodeBox('data-1').x + nodeBox('data-1').width).toBe(nodeBox('data-2').x)
  expect(nodeBox('data-2').x + nodeBox('data-2').width).toBe(nodeBox('data-3').x)

  const seen: string[][] = []
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    seen.push(brightNodes())
  }
  expect(new Set(seen.map((list) => list.join())).size).toBe(3)

  expect(body).toContain('원래 패킷의 식별자가 1234였다면 세 조각의 식별자도 모두 1234다')
  expect(body).toContain('MF는 첫째와 둘째 조각이 1이고, 마지막인 셋째 조각이 0이다')
  expect(body).toContain('원래 데이터의 0바이트·1480바이트·2960바이트 지점부터이므로, 단편화 오프셋 칸에는 이 거리를 8로 나눈 0·185·370이 들어간다')
  expect(body).toContain('세 조각은 데이터를 1480바이트·1480바이트·1040바이트씩 담는다')
}

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
  return {
    change(nextMatches: boolean) {
      mediaQuery.matches = nextMatches
      const event = Object.assign(new Event('change'), { matches: nextMatches, media: mediaQuery.media })
      listeners.forEach((listener) => listener(event))
    },
  }
}

describe('FragmentFieldsDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<FragmentFieldsDiagram />)
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 곁말이 모두 선명하고 그룹 박스와 선택 안내가 나온다', () => {
    const { container } = render(<FragmentFieldsDiagram />)
    expect(Array.from(diagram().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node], [data-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelector('[data-group-label="data"]')!.textContent).toBe(groupLabel)
    expect(Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.textContent)).toEqual(Object.values(noteLabels))
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 그 조각의 칸과 데이터만 선명하다', async (scenario) => {
    const { container } = render(<FragmentFieldsDiagram />)
    await expectScenario(scenario, container)
  })

  it('전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<FragmentFieldsDiagram />)
    await selectScenario('가운데 조각')
    await selectScenario('전체')
    for (const element of diagram().querySelectorAll('[data-node], [data-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드가 280×232 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<FragmentFieldsDiagram />)
    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 232')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expectFits([0, 0, 280, 232])
  })

  it('노드는 모두 회색이고 도식 전용 두 색·초록·빨강·주황은 쓰지 않는다', () => {
    render(<FragmentFieldsDiagram />)
    for (const id of nodeIds) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
    expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('세 조각의 식별자가 같고, MF는 마지막만 0이며, 오프셋 × 8이 데이터의 시작 자리다', async () => {
    render(<FragmentFieldsDiagram />)
    await expectPoint()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<FragmentFieldsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['fragment-fields']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(fragmentFieldsScenarios.map(({ id }) => id)).toEqual(expectedScenarios.map(({ id }) => id))
    expect(text.scenarios.map(({ id }) => id)).toEqual(expectedScenarios.map(({ id }) => id))
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual({ data: groupLabel })
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.label).toBe(figureName)
    expect(text.sources).toEqual([anchorConceptId])
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = fragmentFieldsScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual([])
      expect(scenario.caption).toBe(wording.caption)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(screen.getAllByRole('figure')).toEqual([figure])
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×232 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<FragmentFieldsDiagram />)
      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 232')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('모든 rect가 440×232 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<FragmentFieldsDiagram />)
      expectFits([0, 0, 440, 232])
    })

    it('노드·그룹·곁말 id 집합이 세로형과 같다', () => {
      const { change } = mockMatchMedia(false)
      render(<FragmentFieldsDiagram />)
      const read = (selector: string, attribute: string) => Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)).sort()
      const tall = [read('[data-node]', 'data-node'), read('[data-group]', 'data-group'), read('[data-note]', 'data-note')]
      act(() => change(true))
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 232')
      expect([read('[data-node]', 'data-node'), read('[data-group]', 'data-group'), read('[data-note]', 'data-note')]).toEqual(tall)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·캡션을 보인다', async (scenario) => {
      const { container } = render(<FragmentFieldsDiagram />)
      await expectScenario(scenario, container)
    })

    it('가로형에서도 식별자·MF·오프셋의 요점이 그대로다', async () => {
      render(<FragmentFieldsDiagram />)
      await expectPoint()
    })

    it('폭이 바뀌어도 고른 시나리오와 캡션을 유지한다', async () => {
      const { change } = mockMatchMedia(true)
      const { container } = render(<FragmentFieldsDiagram />)
      await selectScenario('마지막 조각')
      act(() => change(false))
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 232')
      expect(screen.getByRole('button', { name: '마지막 조각' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(expectedScenarios[2].caption)
      expect(brightNodes()).toEqual(column(3))
    })
  })
})
