import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { EthernetSpeedsDiagram, ethernetSpeedsScenarios } from './EthernetSpeedsDiagram'

const topicId = 'ethernet'
const anchorConceptId = `${topicId}.fast-gigabit`
const labels = {
  'fast-speed': '100 Mb/s',
  'fast-twisted': '100BASE-TX',
  'fast-fiber': '100BASE-FX',
  'gigabit-speed': '1 Gb/s',
  'gigabit-twisted': '1000BASE-T',
  'gigabit-fiber': '1000BASE-SX',
  'ten-gigabit-speed': '10 Gb/s',
  'ten-gigabit-twisted': '10GBASE-T',
  'ten-gigabit-fiber': '10GBASE-SR',
}
// 속도가 느린 것부터 차례로 놓은 박스 셋.
const groupLabels = {
  fast: '패스트 이더넷',
  gigabit: '기가비트 이더넷',
  'ten-gigabit': '10기가비트 이더넷',
}
// 줄 머리 곁말. 같은 줄의 칸이 속도인지, 어떤 케이블을 쓰는 규격인지 알려 준다.
const noteLabels = {
  speed: '속도',
  twisted: '트위스티드 페어',
  fiber: '멀티 모드 광섬유',
}

const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
// 노드마다 든 박스와 놓인 줄.
const homeOf = (id: string) => id.slice(0, id.lastIndexOf('-'))
const lineOf = (id: string) => id.slice(id.lastIndexOf('-') + 1)

type Note = { x: number, y: number, anchor: 'start' | 'middle' }
const tallNotes: Record<string, Note> = {
  speed: { x: 44, y: 16, anchor: 'middle' },
  twisted: { x: 128, y: 16, anchor: 'middle' },
  fiber: { x: 224, y: 16, anchor: 'middle' },
}
const wideNotes: Record<string, Note> = {
  speed: { x: 8, y: 51, anchor: 'start' },
  twisted: { x: 8, y: 91, anchor: 'start' },
  fiber: { x: 8, y: 131, anchor: 'start' },
}

const question = '패스트 이더넷과 기가비트 이더넷은 얼마나 빠를까?'
const idleCaption = '패스트 이더넷, 기가비트 이더넷, 10기가비트 이더넷은 이더넷을 속도에 따라 부르는 이름이다. 박스마다 그 속도와, 그 속도로 보내는 규격 가운데 트위스티드 페어 케이블을 쓰는 것 하나와 멀티 모드 광섬유를 쓰는 것 하나를 담았다. 버튼을 고르면 이름마다 어떤 규격이 드는지 볼 수 있다.'
const legend = '박스 하나가 이더넷 이름 하나이고, 속도가 느린 것부터 차례로 놓았다. 같은 케이블을 쓰는 규격 칸끼리 한 줄로 놓고, 그 케이블을 줄 머리에 적었다.'
const expectedScenarios = [
  {
    id: 'fast', label: '패스트 이더넷',
    nodes: ['fast-speed', 'fast-twisted', 'fast-fiber'],
    caption: '패스트 이더넷은 1초에 100메가비트(100 Mb/s)를 보내는 이더넷으로, 1995년의 개정판 802.3u가 정했다. 802.3u는 이 이더넷을 공식 이름으로 100BASE-T라 부르고, 트위스티드 페어 케이블을 쓰는 100BASE-TX와 멀티 모드 광섬유를 쓰는 100BASE-FX가 모두 이 묶음에 든다.',
  },
  {
    id: 'gigabit', label: '기가비트 이더넷',
    nodes: ['gigabit-speed', 'gigabit-twisted', 'gigabit-fiber'],
    caption: '기가비트 이더넷은 1초에 1기가비트(1 Gb/s)를 보낸다. 같은 1 Gb/s라도 케이블에 따라 규격이 따로 있어, 802.3ab의 1000BASE-T는 트위스티드 페어 케이블로, 802.3z의 1000BASE-SX는 멀티 모드 광섬유로 보낸다. 그래서 기가비트 이더넷이라는 이름만으로는 어떤 케이블을 쓰는지 알 수 없다.',
  },
]

function diagram() {
  return screen.getByRole('img', { name: '패스트 이더넷, 기가비트 이더넷, 10기가비트 이더넷의 속도와 케이블별 규격 이름' })
}

async function selectScenario(label: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) })
}

function readBox(rect: Element): SvgBox {
  return {
    id: rect.getAttribute('data-group') ?? rect.parentElement?.getAttribute('data-node') ?? '',
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

function nodeBox(id: string) {
  return readBox(diagram().querySelector(`[data-node="${id}"] rect`)!)
}

function groupBox(id: string) {
  return readBox(diagram().querySelector(`[data-group="${id}"]`)!)
}

function groupLabelArea(id: string): SvgBox {
  const box = groupBox(id)
  return { id, x: box.x + 10, y: box.y + 7, width: estimateTextWidth(groupLabels[id as keyof typeof groupLabels], 9), height: 9 }
}

function frameOf(box: SvgBox) {
  return [box.x, box.y, box.width, box.height] as [number, number, number, number]
}

function shownIds(selector: string, attribute: string) {
  return Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)!)
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

// 상자가 그룹 박스 안에 다 들어 있는가.
function inside(box: SvgBox, group: string) {
  return boxesOutsideViewBox([box], frameOf(groupBox(group))).length === 0
}

// 글자가 차지하는 상자. 높이는 글자 크기 9를 기준선 위로 잡는다.
function textBox(text: Element): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9)
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id: text.getAttribute('data-note')!, x: left, y: y - 9, width, height: 9 }
}

// 줄 머리 곁말 셋은 시나리오와 상관없이 늘 같은 자리에 보이고 흐려지지 않는다. 노드·박스·다른 곁말과 겹치지 않고 viewBox 안에 있다.
function expectNotes(places: Record<string, Note>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note'))).toEqual(noteIds)
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  for (const note of shown) {
    const id = note.getAttribute('data-note')!
    expect(note.textContent).toBe(noteLabels[id as keyof typeof noteLabels])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', places[id].anchor)
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note.closest('[opacity]')).toBeNull()
    const box = textBox(note)
    expect(box.x, id).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, id).toBeLessThanOrEqual(width)
    expect(box.y, id).toBeGreaterThanOrEqual(0)
    expect(box.y + box.height, id).toBeLessThanOrEqual(height)
    for (const rect of boxes) expect(overlaps(box, rect), `${id} ↔ ${rect.id}`).toBe(false)
  }
  for (let i = 0; i < shown.length; i += 1) {
    for (let j = i + 1; j < shown.length; j += 1) {
      expect(overlaps(textBox(shown[i]), textBox(shown[j])), '곁말끼리').toBe(false)
    }
  }
}

// 아래 단언들은 배치에 묶이지 않는다. 세로형과 가로형이 같은 기대값으로 통과해야 한다.
async function expectScenario(
  scenario: typeof expectedScenarios[number],
  places: Record<string, Note>,
  width: number,
  height: number,
  container: HTMLElement,
) {
  await selectScenario(scenario.label)

  for (const node of diagram().querySelectorAll('[data-node]')) {
    const id = node.getAttribute('data-node')!
    expect(node, id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  for (const group of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(group.closest('[opacity]')).toBeNull()
  expect(diagram().querySelectorAll('[data-path], [data-link], marker')).toHaveLength(0)
  expectNotes(places, width, height)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 상자 안에, 그룹 라벨은 자기 박스 오른쪽 끝 안에 들어간다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(label, 10) + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
  }

  for (const [id, wording] of Object.entries(groupLabels)) {
    const box = groupBox(id)
    const groupLabel = diagram().querySelector(`[data-group-label="${id}"]`)!
    expect(groupLabel.textContent).toBe(wording)
    expect(groupLabel).toHaveAttribute('font-size', '9')
    expect(groupLabel).toHaveClass('fill-muted')
    expect(Number(groupLabel.getAttribute('x')), wording).toBe(box.x + 10)
    expect(Number(groupLabel.getAttribute('y')), wording).toBe(box.y + 14)
    expect(box.x + 10 + estimateTextWidth(wording, 9), wording).toBeLessThanOrEqual(box.x + box.width)
    expect(box.x + 10 + estimateTextWidth(wording, 9), wording).toBeLessThanOrEqual(viewBox[2])
    for (const node of nodeIds) expect(overlaps(groupLabelArea(id), nodeBox(node)), `${wording} ↔ ${node}`).toBe(false)
  }
}

// 노드는 자기 박스 하나 안에만 있고 박스끼리는 겹치지 않는다. 노드는 모두 회색이고 도식 전용 두 색·초록·빨강·주황은 쓰지 않는다.
function expectMembership() {
  for (const node of nodeIds) {
    expect(groupIds.filter((id) => inside(nodeBox(node), id)), node).toEqual([homeOf(node)])
  }
  for (let i = 0; i < groupIds.length; i += 1) {
    for (let j = i + 1; j < groupIds.length; j += 1) {
      expect(overlaps(groupBox(groupIds[i]), groupBox(groupIds[j])), `${groupIds[i]} ↔ ${groupIds[j]}`).toBe(false)
    }
  }
  for (const id of nodeIds) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 노드의 가운데가 곁말과 같은 줄에 있는가. 세로형은 곁말이 줄(열) 위의 가운데에, 가로형은 줄(행) 왼쪽에 놓인다.
function inLineWith(node: SvgBox, note: Element, wide: boolean) {
  return wide
    ? node.y + node.height / 2 === Number(note.getAttribute('y')) - 3
    : node.x + node.width / 2 === Number(note.getAttribute('x'))
}

// 요점: 박스 셋이 속도가 느린 것부터 차례로 놓여 있다(세로형은 위에서 아래, 가로형은 왼쪽에서 오른쪽).
// 기가비트 이더넷을 고르면 1 Gb/s 칸에 딸린 규격 이름이 둘이고, 둘은 서로 다른 케이블 줄에 놓인다.
// 노드·박스 라벨과 줄 머리의 낱말은 모두 개념 본문에 그대로 있다.
async function expectPoint(wide: boolean) {
  const starts = groupIds.map((id) => (wide ? groupBox(id).x : groupBox(id).y))
  expect(starts).toEqual([...starts].sort((a, b) => a - b))
  expect(new Set(starts).size).toBe(groupIds.length)
  expect(groupIds.map((id) => labels[`${id}-speed` as keyof typeof labels])).toEqual(['100 Mb/s', '1 Gb/s', '10 Gb/s'])

  for (const node of nodeIds) {
    const note = diagram().querySelector(`[data-note="${lineOf(node)}"]`)!
    expect(inLineWith(nodeBox(node), note, wide), node).toBe(true)
  }

  await selectScenario('기가비트 이더넷')
  const sharp = shownIds('[data-node][opacity="1"]', 'data-node')
  expect(sharp.every((id) => homeOf(id) === 'gigabit')).toBe(true)
  const specs = sharp.filter((id) => lineOf(id) !== 'speed')
  expect(specs).toHaveLength(2)
  const cables = specs.map((id) => diagram().querySelector(`[data-note="${lineOf(id)}"]`)!.textContent)
  expect(new Set(cables).size).toBe(2)
  expect(cables).not.toContain(noteLabels.speed)

  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  for (const wording of [...Object.values(labels), ...Object.values(groupLabels), ...Object.values(noteLabels).slice(1)]) {
    expect(body, wording).toContain(wording)
  }
}

describe('EthernetSpeedsDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<EthernetSpeedsDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 아홉·박스 셋이 모두 선명하고 줄 머리 곁말이 보이며 선택 안내가 나온다', () => {
    const { container } = render(<EthernetSpeedsDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    expect(shownIds('[data-group]', 'data-group')).toEqual(groupIds)
    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    for (const group of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(group.closest('[opacity]')).toBeNull()
    expectNotes(tallNotes, 280, 240)
    expect(diagram().querySelectorAll('[data-path], [data-link], marker')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 그 박스의 노드만 선명하고 박스와 줄 머리는 그대로다', async (scenario) => {
    const { container } = render(<EthernetSpeedsDiagram />)
    await expectScenario(scenario, tallNotes, 280, 240, container)
  })

  it('시나리오를 바꾸면 이전 선택이 풀리고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<EthernetSpeedsDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-node][opacity="1"]', 'data-node')).toEqual(scenario.nodes)
    }
    await selectScenario('전체')

    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드와 박스가 280×240 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<EthernetSpeedsDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 240')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 240])
  })

  it('노드는 자기 이름의 박스 안에 있고 박스끼리 겹치지 않으며 노드는 모두 회색이다', () => {
    render(<EthernetSpeedsDiagram />)
    expectMembership()
  })

  it('박스가 위에서 아래로 속도 차례이고, 기가비트 이더넷의 규격 둘이 서로 다른 케이블 줄에 있다', async () => {
    render(<EthernetSpeedsDiagram />)
    await expectPoint(false)
  })

  it('두 번 렌더해도 도식마다 자기 시나리오를 따로 고르고 화살표 마커가 없다', async () => {
    render(<><EthernetSpeedsDiagram /><EthernetSpeedsDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: '이더넷 속도별 이름 도식' })

    await act(async () => { await userEvent.click(within(figures[0]).getByRole('button', { name: '기가비트 이더넷' })) })

    expect(figures[0].querySelector('[data-node="fast-speed"]')).toHaveAttribute('opacity', '0.25')
    expect(figures[1].querySelector('[data-node="fast-speed"]')).toHaveAttribute('opacity', '1')
    for (const figure of figures) expect(figure.querySelector('marker')).toBeNull()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<EthernetSpeedsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['ethernet-speeds']
    const ids = ethernetSpeedsScenarios.map(({ id }) => id).sort()
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
    expect(text.label).toBe('이더넷 속도별 이름 도식')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = ethernetSpeedsScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual([])
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) {
      expect(conceptIds).toContain(source)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 속도별 이름 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: '이더넷 속도별 이름 도식' })

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
          const event = Object.assign(new Event('change'), {
            matches: nextMatches,
            media: mediaQuery.media,
          })
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

    it('440×160 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<EthernetSpeedsDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 160')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·박스·곁말 id 집합이 세로형과 같다', () => {
      const { change } = mockMatchMedia(false)
      render(<EthernetSpeedsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 240')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroups = shownIds('[data-group]', 'data-group').sort()
      const tallNoteIds = shownIds('[data-note]', 'data-note').sort()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 160')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroups)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual(tallNoteIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallGroups).toEqual([...groupIds].sort())
    })

    it('모든 rect가 440×160 viewBox 안에 있고 라벨과 그룹 라벨이 자기 상자 안에 들어간다', () => {
      render(<EthernetSpeedsDiagram />)
      expectFits([0, 0, 440, 160])
      expectNotes(wideNotes, 440, 160)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<EthernetSpeedsDiagram />)
      await expectScenario(scenario, wideNotes, 440, 160, container)
    })

    it('노드는 자기 이름의 박스 안에 있고 박스끼리 겹치지 않으며 노드는 모두 회색이다', () => {
      render(<EthernetSpeedsDiagram />)
      expectMembership()
    })

    it('박스가 왼쪽에서 오른쪽으로 속도 차례이고, 기가비트 이더넷의 규격 둘이 서로 다른 케이블 줄에 있다', async () => {
      render(<EthernetSpeedsDiagram />)
      await expectPoint(true)
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<EthernetSpeedsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 240')
      await selectScenario('기가비트 이더넷')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '기가비트 이더넷' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownIds('[data-node][opacity="1"]', 'data-node')).toEqual(expectedScenarios[1].nodes)
    })
  })
})
