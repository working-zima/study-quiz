import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { FreeMemoryDiagram, freeMemoryScenarios } from './FreeMemoryDiagram'

const topicId = 'linux-process-boot'
const anchorConceptId = `${topicId}.free-command`
const labels = {
  'mem-total-name': 'total',
  'mem-total': '8000000',
  'mem-used-name': 'used',
  'mem-used': '3000000',
  'mem-free-name': 'free',
  'mem-free': '1200000',
  'mem-shared-name': 'shared',
  'mem-shared': '100000',
  'mem-cache-name': 'buff/cache',
  'mem-cache': '4000000',
  'mem-avail-name': 'available',
  'mem-avail': '5000000',
  'swap-total-name': 'total',
  'swap-total': '2000000',
  'swap-used-name': 'used',
  'swap-used': '0',
  'swap-free-name': 'free',
  'swap-free': '2000000',
}
const groupLabels = { mem: '메모리 쪽 칸', swap: '스왑 쪽 칸' }
const noteLabels = { calc: '8000000 − 5000000 = 3000000' }
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const memIds = nodeIds.filter((id) => id.startsWith('mem-'))
const swapIds = nodeIds.filter((id) => id.startsWith('swap-'))

const question = '메모리는 얼마나 남았을까?'
const idleCaption = 'free를 입력해 나온 칸을 메모리 쪽과 스왑 쪽으로 나눠 이름과 값으로 놓았다. 값은 예로 든 것이고 단위는 KiB다. 버튼을 고르면 used를 구하는 셈, free와 available의 차이, 스왑 쪽 칸을 볼 수 있다.'
const legend = '칸 이름과 그 값을 나란히 놓았고, 칸은 free가 보이는 차례대로 놓았다.'
const figureName = 'free 명령이 보인 메모리 쪽 여섯 칸과 스왑 쪽 세 칸을 칸 이름과 값으로 나눠, used를 구하는 셈, free와 available의 차이, 스왑의 양을 보이는 도식'
const svgName = '메모리 쪽 칸 테두리 안에 total 8000000, used 3000000, free 1200000, shared 100000, buff/cache 4000000, available 5000000이, 스왑 쪽 칸 테두리 안에 total 2000000, used 0, free 2000000이 칸 이름과 값의 짝으로 놓여 있다'
const expectedScenarios = [
  {
    id: 'used', label: 'used',
    nodes: ['mem-total-name', 'mem-total', 'mem-used-name', 'mem-used', 'mem-avail-name', 'mem-avail'], notes: ['calc'],
    caption: 'used는 total에서 available을 빼서 구한다. total의 8000000에서 available의 5000000을 빼면 3000000이 되고, 이것이 used 칸의 값이다.',
    sources: [anchorConceptId],
  },
  {
    id: 'available', label: 'free와 available',
    nodes: ['mem-free-name', 'mem-free', 'mem-cache-name', 'mem-cache', 'mem-avail-name', 'mem-avail'], notes: [],
    caption: 'free 칸의 1200000은 아무 데도 쓰이지 않은 메모리만 센 값이다. available 칸의 5000000은 buff/cache의 캐시처럼 비워서 내줄 수 있는 몫까지 넣어 어림한 값이라, 새 프로그램을 시작할 여유는 available로 본다.',
    sources: [anchorConceptId],
  },
  {
    id: 'swap', label: '스왑',
    nodes: ['swap-total-name', 'swap-total', 'swap-used-name', 'swap-used', 'swap-free-name', 'swap-free'], notes: [],
    caption: '스왑 쪽 칸은 메모리가 모자랄 때 커널이 내용을 옮겨 두는 디스크의 공간을 보인다. total 2000000 가운데 used가 0이고 free가 2000000이라, 스왑 공간을 아직 조금도 쓰지 않았다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 388]
const wideBox: [number, number, number, number] = [0, 0, 440, 232]

function diagram() {
  return screen.getByRole('img', { name: svgName })
}

async function selectScenario(label: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) })
}

function rectBox(rect: Element, id: string): SvgBox {
  return {
    id,
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

function nodeBox(id: string) {
  return rectBox(diagram().querySelector(`[data-node="${id}"] rect`)!, id)
}

function groupBox(id: string) {
  return rectBox(diagram().querySelector(`rect[data-group="${id}"]`)!, id)
}

function shownIds(selector: string, attribute: string) {
  return Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)!)
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function inside(inner: SvgBox, outer: SvgBox) {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height
}

// 글자 크기 9인 곁말·그룹 라벨이 차지하는 상자. 반각 글자가 화면에서 더 넓게 그려지는 것을 생각해 폭을 1.15배로 잡는다.
function textBox(text: Element, id: string): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9) * 1.15
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id, x: left, y: y - 9, width, height: 9 }
}

async function expectScenario(scenario: typeof expectedScenarios[number], container: HTMLElement) {
  await selectScenario(scenario.label)

  for (const element of diagram().querySelectorAll('[data-node]')) {
    const id = element.getAttribute('data-node')!
    expect(element, id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  for (const element of diagram().querySelectorAll('rect[data-group]')) expect(element).not.toHaveAttribute('opacity')
  expect(shownIds('[data-note]', 'data-note')).toEqual(scenario.notes)
  for (const id of scenario.notes) {
    expect(diagram().querySelector(`[data-note="${id}"]`)!.textContent).toBe(noteLabels[id as keyof typeof noteLabels])
  }
  expect(diagram().querySelectorAll('path')).toHaveLength(0)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다.
// 메모리 쪽 칸은 메모리 테두리 안에, 스왑 쪽 칸은 스왑 테두리 안에 있고, 그룹 라벨은 viewBox 안에서 노드와 겹치지 않는다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = nodeIds.map(nodeBox)
  expect(diagram().querySelectorAll('rect')).toHaveLength(nodeIds.length + groupIds.length)
  expect(boxesOutsideViewBox([...boxes, ...groupIds.map(groupBox)], viewBox)).toEqual([])

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(node.querySelector('rect')).toHaveClass('stroke-disabled')
    expect(nodeBox(id).height).toBe(32)
    expect(estimateTextWidth(label, 10) * 1.15 + 12, `${id} ${label}`).toBeLessThanOrEqual(nodeBox(id).width)
  }
  for (let i = 0; i < nodeIds.length; i += 1) {
    for (let j = i + 1; j < nodeIds.length; j += 1) {
      expect(overlaps(nodeBox(nodeIds[i]), nodeBox(nodeIds[j])), `${nodeIds[i]} ↔ ${nodeIds[j]}`).toBe(false)
    }
  }
  for (const id of memIds) expect(inside(nodeBox(id), groupBox('mem')), id).toBe(true)
  for (const id of swapIds) expect(inside(nodeBox(id), groupBox('swap')), id).toBe(true)
  expect(overlaps(groupBox('mem'), groupBox('swap'))).toBe(false)
  for (const [id, label] of Object.entries(groupLabels)) {
    const text = diagram().querySelector(`[data-group-label="${id}"]`)!
    expect(text.textContent).toBe(label)
    expect(text).toHaveAttribute('font-size', '9')
    const box = textBox(text, id)
    expect(inside(box, groupBox(id)), id).toBe(true)
    for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
  }
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 칸 이름 바로 오른쪽에 그 값 칸이 맞닿는다.
function expectPairs() {
  for (const id of nodeIds.filter((node) => node.endsWith('-name'))) {
    const name = nodeBox(id)
    const value = nodeBox(id.replace(/-name$/u, ''))
    expect(name.x + name.width, id).toBe(value.x)
    expect(name.y, id).toBe(value.y)
  }
}

// 곁말은 viewBox 안에 있고 어느 노드와도 겹치지 않으며, 노드 아래 변에서 기준선까지 10 이상 띄운다.
async function expectNotes(viewBox: [number, number, number, number]) {
  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    for (const element of diagram().querySelectorAll('[data-note]')) {
      expect(element).toHaveAttribute('font-size', '9')
      const box = textBox(element, element.getAttribute('data-note')!)
      expect(boxesOutsideViewBox([box], viewBox)).toEqual([])
      const baseline = Number(element.getAttribute('y'))
      for (const node of nodeIds) {
        const nodeRect = nodeBox(node)
        expect(overlaps(box, nodeRect), `${box.id} ↔ ${node}`).toBe(false)
        const sameColumn = box.x < nodeRect.x + nodeRect.width && nodeRect.x < box.x + box.width
        if (sameColumn && nodeRect.y + 32 <= baseline) expect(baseline - (nodeRect.y + 32), `${box.id} ↔ ${node}`).toBeGreaterThanOrEqual(10)
      }
      for (const group of groupIds) {
        const label = textBox(diagram().querySelector(`[data-group-label="${group}"]`)!, group)
        expect(overlaps(box, label), `${box.id} ↔ ${group}`).toBe(false)
      }
    }
  }
}

// 요점: 칸 값으로 total − available = used가 성립하고 available이 free보다 크다.
// used 곁말의 셈에 나온 세 수는 total·available·used 칸의 값과 같고, 그 값들은 개념 본문에 있다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const value = (id: string) => Number(diagram().querySelector(`[data-node="${id}"] text`)!.textContent)

  expect(value('mem-total') - value('mem-avail')).toBe(value('mem-used'))
  expect(value('mem-avail')).toBeGreaterThan(value('mem-free'))

  await selectScenario('used')
  const numbers = diagram().querySelector('[data-note="calc"]')!.textContent!.match(/\d+/gu)!.map(Number)
  expect(numbers).toEqual([value('mem-total'), value('mem-avail'), value('mem-used')])
  for (const label of Object.values(labels)) expect(body, label).toContain(`\`${label}\``)
  expect(body).toContain('`total`의 `8000000`에서 `available`의 `5000000`을 빼면 `3000000`')

  await selectScenario('free와 available')
  const bright = Array.from(diagram().querySelectorAll('[data-node][opacity="1"]'), (element) => element.getAttribute('data-node')!)
  expect(bright).toContain('mem-free')
  expect(bright).toContain('mem-avail')
  expect(bright).not.toContain('mem-used')
}

describe('FreeMemoryDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<FreeMemoryDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 칸이 모두 선명하고 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<FreeMemoryDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-note], path')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 칸·곁말만 선명하게 보인다', async (scenario) => {
    const { container } = render(<FreeMemoryDiagram />)
    await expectScenario(scenario, container)
  })

  it('시나리오를 바꾸고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<FreeMemoryDiagram />)
    for (const scenario of expectedScenarios) await selectScenario(scenario.label)
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('세 시나리오가 보이는 것(칸·곁말)이 서로 다르고 겹치는 칸 없이 나뉜다', () => {
    const keys = expectedScenarios.map(({ nodes, notes }) => JSON.stringify([[...nodes].sort(), notes]))
    expect(new Set(keys).size).toBe(expectedScenarios.length)
    expect(expectedScenarios[2].nodes.every((id) => id.startsWith('swap-'))).toBe(true)
  })

  it('칸이 280×388 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<FreeMemoryDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 388')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
    expectPairs()
  })

  it('곁말이 viewBox 안에 있고 칸·그룹 라벨과 겹치지 않는다', async () => {
    render(<FreeMemoryDiagram />)
    await expectNotes(tallBox)
  })

  it('total − available = used가 칸 값과 곁말의 셈에서 함께 성립하고 available이 free보다 크다', async () => {
    render(<FreeMemoryDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 고른 시나리오가 섞이지 않는다', async () => {
    render(<><FreeMemoryDiagram /><FreeMemoryDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    await act(async () => { await userEvent.click(within(figures[0]).getByRole('button', { name: 'used' })) })

    expect(within(figures[0]).getByRole('button', { name: 'used' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(figures[1]).getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(figures[1].querySelectorAll('[data-note]')).toHaveLength(0)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<FreeMemoryDiagram />)
    const text = visualsByTopicId[topicId].diagrams['free-memory']
    const ids = freeMemoryScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([anchorConceptId])
    expect(text.label).toBe(figureName)
    expect(text.svgLabel).toBe(svgName)
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = freeMemoryScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: expected.sources })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual([])
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) {
      expect(conceptIds).toContain(source)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 free 명령 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })

    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(within(figure).queryByRole('heading')).toBeNull()
  })

  describe('가로형 (768px 이상)', () => {
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

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×232 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<FreeMemoryDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 232')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·그룹 id 집합이 세로형과 같다', () => {
      const { change } = mockMatchMedia(false)
      render(<FreeMemoryDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 388')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroups = shownIds('rect[data-group]', 'data-group').sort()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 232')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('rect[data-group]', 'data-group').sort()).toEqual(tallGroups)
      expect(tallNodes).toEqual([...nodeIds].sort())
    })

    it('칸이 440×232 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<FreeMemoryDiagram />)
      expectFits(wideBox)
      expectPairs()
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 칸·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<FreeMemoryDiagram />)
      await expectScenario(scenario, container)
    })

    it('곁말이 viewBox 안에 있고 칸·그룹 라벨과 겹치지 않는다', async () => {
      render(<FreeMemoryDiagram />)
      await expectNotes(wideBox)
    })

    it('total − available = used가 칸 값과 곁말의 셈에서 함께 성립하고 available이 free보다 크다', async () => {
      render(<FreeMemoryDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<FreeMemoryDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 388')
      await selectScenario('used')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: 'used' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownIds('[data-note]', 'data-note')).toEqual(['calc'])
      expect(diagram().querySelector('[data-node="mem-avail"] rect')).toHaveAttribute('x', '312')
    })
  })
})
