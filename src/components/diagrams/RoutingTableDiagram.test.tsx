import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { RoutingTableDiagram, routingTableScenarios } from './RoutingTableDiagram'

const topicId = 'routing'
const anchorConceptId = `${topicId}.routing-table`
const columns = ['dest', 'mask', 'gw', 'if', 'metric'] as const
const labels = {
  'packet': '패킷 · 목적지 198.51.100.1',
  'r1-dest': '192.0.2.0',
  'r1-mask': '255.255.255.0',
  'r1-gw': '바로 이어짐',
  'r1-if': 'eth0',
  'r1-metric': '1',
  'r2-dest': '198.51.100.0',
  'r2-mask': '255.255.255.0',
  'r2-gw': '203.0.113.2',
  'r2-if': 'eth1',
  'r2-metric': '2',
}
const noteLabels = {
  'col-dest': '목적지 주소',
  'col-mask': '서브넷 마스크',
  'col-gw': '게이트웨이',
  'col-if': '인터페이스',
  'col-metric': '메트릭',
  'row-1': '첫째 행',
  'row-2': '둘째 행',
}
type NoteId = keyof typeof noteLabels

const nodeIds = Object.keys(labels)
const cellIds = (row: 1 | 2) => columns.map((column) => `r${row}-${column}`)

type Note = { x: number, y: number, anchor: 'start' | 'middle' | 'end' }
const tallNotes: Record<NoteId, Note> = {
  'col-dest': { x: 8, y: 91, anchor: 'start' },
  'col-mask': { x: 8, y: 123, anchor: 'start' },
  'col-gw': { x: 8, y: 155, anchor: 'start' },
  'col-if': { x: 8, y: 187, anchor: 'start' },
  'col-metric': { x: 8, y: 219, anchor: 'start' },
  'row-1': { x: 128, y: 64, anchor: 'middle' },
  'row-2': { x: 224, y: 64, anchor: 'middle' },
}
const wideNotes: Record<NoteId, Note> = {
  'col-dest': { x: 104, y: 62, anchor: 'middle' },
  'col-mask': { x: 202, y: 62, anchor: 'middle' },
  'col-gw': { x: 300, y: 62, anchor: 'middle' },
  'col-if': { x: 372, y: 62, anchor: 'middle' },
  'col-metric': { x: 416, y: 62, anchor: 'middle' },
  'row-1': { x: 8, y: 89, anchor: 'start' },
  'row-2': { x: 8, y: 121, anchor: 'start' },
}

const question = '라우터는 표의 어느 칸을 보고 패킷을 보낼까?'
const idleCaption = '라우터 1의 라우팅 테이블에 행이 둘 있다. 첫째 행은 라우터 1에 바로 이어진 네트워크 192.0.2.0으로, 둘째 행은 라우터 2 너머의 네트워크 198.51.100.0으로 가는 행이다. 버튼을 고르면 목적지가 198.51.100.1인 패킷에 맞는 행과 내보낼 곳을 볼 수 있다.'
const legend = '맨 위 상자는 라우터 1이 받은 패킷이고, 그 아래 칸들은 라우터 1의 라우팅 테이블이다. 곁의 글은 열 이름과 행 이름이다. 메트릭 값은 예다.'
const figureName = '라우터 1의 라우팅 테이블에서 목적지가 198.51.100.1인 패킷에 맞는 행을 찾고, 그 행의 게이트웨이와 인터페이스로 패킷을 내보내는 과정을 보이는 도식'
const expectedScenarios = [
  {
    id: 'match', label: '맞는 행 찾기',
    nodes: ['packet', 'r2-dest', 'r2-mask'],
    caption: '목적지 198.51.100.1의 앞 세 수 198.51.100이 마스크가 255.255.255.0인 둘째 행의 목적지 주소 198.51.100.0과 같다. 첫째 행의 192.0.2.0과는 달라서 맞는 행은 둘째 행이다.',
    sources: [anchorConceptId],
  },
  {
    id: 'forward', label: '내보내기',
    nodes: ['r2-gw', 'r2-if'],
    caption: '맞는 둘째 행에 적힌 대로, 라우터 1은 패킷을 게이트웨이 203.0.113.2, 곧 다음 홉인 라우터 2에게 인터페이스 eth1로 내보낸다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 240]
const wideBox: [number, number, number, number] = [0, 0, 440, 142]

function diagram() {
  return screen.getByRole('img', { name: '라우터 1이 받은 패킷과 행이 둘인 라우팅 테이블' })
}

async function selectScenario(label: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) })
}

function readBox(rect: Element): SvgBox {
  return {
    id: rect.parentElement?.getAttribute('data-node') ?? '',
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

function nodeBox(id: string) {
  return readBox(diagram().querySelector(`[data-node="${id}"] rect`)!)
}

function shownIds(selector: string, attribute: string) {
  return Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)!)
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
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

// 곁말(열 이름·행 이름)은 늘 보이고 선명하며, viewBox 안에서 노드·다른 곁말과 겹치지 않는다.
function expectNotes(places: Record<NoteId, Note>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note')).sort()).toEqual(Object.keys(noteLabels).sort())
  const boxes = shown.map((note) => textBox(note, note.getAttribute('data-note')!))
  for (const note of shown) {
    const id = note.getAttribute('data-note')! as NoteId
    const box = textBox(note, id)
    expect(note.textContent).toBe(noteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', places[id].anchor)
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note.closest('[opacity]')).toBeNull()
    expect(box.x, id).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, id).toBeLessThanOrEqual(width)
    expect(box.y, id).toBeGreaterThanOrEqual(0)
    expect(box.y + box.height, id).toBeLessThanOrEqual(height)
    for (const node of nodeIds.map(nodeBox)) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const other of boxes.filter((item) => item.id !== id)) expect(overlaps(box, other), `${id} ↔ ${other.id}`).toBe(false)
  }
}

async function expectScenario(
  scenario: typeof expectedScenarios[number],
  places: Record<NoteId, Note>,
  width: number,
  height: number,
  container: HTMLElement,
) {
  await selectScenario(scenario.label)

  for (const element of diagram().querySelectorAll('[data-node]')) {
    const id = element.getAttribute('data-node')!
    expect(element, id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  expect(diagram().querySelectorAll('path')).toHaveLength(0)
  expectNotes(places, width, height)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다. 노드는 모두 회색이다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
  expect(diagram().querySelectorAll('rect')).toHaveLength(nodeIds.length)

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(node.querySelector('rect')).toHaveClass('stroke-disabled')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(label, 10) + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
  }
  for (let i = 0; i < nodeIds.length; i += 1) {
    for (let j = i + 1; j < nodeIds.length; j += 1) {
      expect(overlaps(nodeBox(nodeIds[i]), nodeBox(nodeIds[j])), `${nodeIds[i]} ↔ ${nodeIds[j]}`).toBe(false)
    }
  }
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

function brightIds() {
  return Array.from(diagram().querySelectorAll('[data-node]'))
    .filter((element) => element.getAttribute('opacity') === '1')
    .map((element) => element.getAttribute('data-node')!)
}

function firstThree(address: string) {
  return address.split('.').slice(0, 3).join('.')
}

// 요점: 「맞는 행 찾기」와 「내보내기」의 선명한 칸은 겹치지 않고 모두 둘째 행이다. 패킷의 목적지는 마스크가 앞 세 수를 가리키는 둘째 행과만 맞는다.
// 「내보내기」의 선명한 칸은 게이트웨이 203.0.113.2와 인터페이스 eth1이다. 칸의 값은 모두 본문 예의 값이다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')

  await selectScenario('맞는 행 찾기')
  const matched = brightIds()
  await selectScenario('내보내기')
  const forwarded = brightIds()

  expect(matched.filter((id) => forwarded.includes(id))).toEqual([])
  for (const id of [...matched, ...forwarded].filter((item) => item !== 'packet')) expect(id.startsWith('r2-'), id).toBe(true)
  expect(forwarded.map((id) => labels[id as keyof typeof labels]).sort()).toEqual(['203.0.113.2', 'eth1'])

  const destination = labels.packet.split(' ').pop()!
  expect(labels['r1-mask']).toBe('255.255.255.0')
  expect(labels['r2-mask']).toBe('255.255.255.0')
  expect(firstThree(destination)).toBe(firstThree(labels['r2-dest']))
  expect(firstThree(destination)).not.toBe(firstThree(labels['r1-dest']))

  for (const id of nodeIds.filter((item) => item !== 'packet' && item !== 'r1-gw')) {
    expect(body, id).toContain(`\`${labels[id as keyof typeof labels]}\``)
  }
  expect(body).toContain('그 칸을 「바로 이어짐」으로 적었다')
  expect(body).toContain('호스트 E(`198.51.100.1`)로 가는 패킷을 받으면')
  expect(body).toContain('패킷을 게이트웨이 `203.0.113.2`에게 인터페이스 `eth1`로 내보낸다')
}

describe('RoutingTableDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<RoutingTableDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 열·행 이름이 보이며 선택 안내가 나온다', () => {
    const { container } = render(<RoutingTableDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('path')).toHaveLength(0)
    expectNotes(tallNotes, 280, 240)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 칸만 선명하다', async (scenario) => {
    const { container } = render(<RoutingTableDiagram />)
    await expectScenario(scenario, tallNotes, 280, 240, container)
  })

  it('시나리오를 바꾸면 선명한 칸이 바뀌고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<RoutingTableDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(brightIds()).toEqual(nodeIds.filter((id) => scenario.nodes.includes(id)))
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드가 280×240 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<RoutingTableDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 240')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  // 세로형은 표를 돌려 세운다 — 행 하나가 다섯 칸짜리 세로 줄이고, 첫째 행 줄 오른쪽에 둘째 행 줄이 빈틈없이 붙는다. 열 이름은 같은 높이의 왼쪽 곁말이다.
  it('세로형: 행마다 칸 다섯이 열 차례로 빈틈없이 쌓이고, 두 행이 나란히 붙는다', () => {
    render(<RoutingTableDiagram />)
    for (const row of [1, 2] as const) {
      const boxes = cellIds(row).map(nodeBox)
      for (let i = 1; i < boxes.length; i += 1) {
        expect(boxes[i].x).toBe(boxes[0].x)
        expect(boxes[i].y).toBe(boxes[i - 1].y + 32)
      }
    }
    const first = cellIds(1).map(nodeBox)
    const second = cellIds(2).map(nodeBox)
    for (let i = 0; i < columns.length; i += 1) {
      expect(second[i].x).toBe(first[i].x + first[i].width)
      expect(second[i].y).toBe(first[i].y)
      const note = tallNotes[`col-${columns[i]}` as NoteId]
      expect(note.y).toBeGreaterThan(first[i].y)
      expect(note.y).toBeLessThan(first[i].y + 32)
    }
  })

  it('두 시나리오의 선명한 칸은 겹치지 않고 모두 둘째 행이며, 칸의 값은 본문 예와 같다', async () => {
    render(<RoutingTableDiagram />)
    await expectPoint()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<RoutingTableDiagram />)
    const text = visualsByTopicId[topicId].diagrams['routing-table']
    const ids = routingTableScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toBeUndefined()
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([anchorConceptId, `${topicId}.routing`])
    expect(text.label).toBe(figureName)
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = routingTableScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 라우팅 테이블 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×142 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<RoutingTableDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 142')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expectNotes(wideNotes, 440, 142)
    })

    it('노드 id 집합과 곁말 id 집합이 세로형과 같다', () => {
      const { change } = mockMatchMedia(false)
      render(<RoutingTableDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 240')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallNoteIds = shownIds('[data-note]', 'data-note').sort()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 142')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual(tallNoteIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallNoteIds).toEqual(Object.keys(noteLabels).sort())
    })

    it('모든 rect가 440×142 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<RoutingTableDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 칸·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<RoutingTableDiagram />)
      await expectScenario(scenario, wideNotes, 440, 142, container)
    })

    // 가로형은 보통의 표 모양이다 — 행마다 칸 다섯이 열 차례로 빈틈없이 놓이고, 둘째 행이 첫째 행 바로 아래에 붙는다. 열 이름은 그 열 위에 있다.
    it('행마다 칸 다섯이 열 차례로 빈틈없이 놓이고, 둘째 행이 첫째 행 바로 아래에 붙는다', () => {
      render(<RoutingTableDiagram />)
      for (const row of [1, 2] as const) {
        const boxes = cellIds(row).map(nodeBox)
        for (let i = 1; i < boxes.length; i += 1) {
          expect(boxes[i].y).toBe(boxes[0].y)
          expect(boxes[i].x).toBe(boxes[i - 1].x + boxes[i - 1].width)
        }
      }
      const first = cellIds(1).map(nodeBox)
      const second = cellIds(2).map(nodeBox)
      for (let i = 0; i < columns.length; i += 1) {
        expect(second[i].x).toBe(first[i].x)
        expect(second[i].width).toBe(first[i].width)
        expect(second[i].y).toBe(first[i].y + 32)
        const note = wideNotes[`col-${columns[i]}` as NoteId]
        expect(note.x).toBe(first[i].x + first[i].width / 2)
        expect(note.y).toBeLessThan(first[i].y)
      }
    })

    it('두 시나리오의 선명한 칸은 겹치지 않고 모두 둘째 행이며, 칸의 값은 본문 예와 같다', async () => {
      render(<RoutingTableDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<RoutingTableDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 240')
      await selectScenario('내보내기')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '내보내기' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(brightIds()).toEqual(['r2-gw', 'r2-if'])
      expect(diagram().querySelector('[data-note="col-gw"]')).toHaveAttribute('x', String(wideNotes['col-gw'].x))
    })
  })
})
