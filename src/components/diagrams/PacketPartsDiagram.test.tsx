import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { PacketPartsDiagram, packetPartsScenarios } from './PacketPartsDiagram'

const topicId = 'protocols-encapsulation'
const anchorConceptId = `${topicId}.packet`
const labels = {
  header: '헤더',
  payload: '페이로드',
  trailer: '트레일러',
}
const roleNoteLabels = {
  'role-header': '앞에 붙는 부가 정보',
  'role-payload': '실어 보낼 내용',
  'role-trailer': '뒤에 붙는 부가 정보',
}
const noteLabels = {
  ...roleNoteLabels,
  'trailer-used': '쓰는 프로토콜이면 붙음',
  'trailer-absent': '붙지 않음',
}
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

const cellIds = Object.keys(labels)
const roleNoteIds = Object.keys(roleNoteLabels)
// 칸마다 하는 일을 적은 곁말. 늘 보이고 자기 칸의 opacity를 따른다.
const roleOf: Record<string, string> = { 'role-header': 'header', 'role-payload': 'payload', 'role-trailer': 'trailer' }

const tallNotes: NotePlaces = {
  'role-header': { x: 56, y: 78, anchor: 'middle' },
  'role-payload': { x: 140, y: 78, anchor: 'middle' },
  'role-trailer': { x: 224, y: 78, anchor: 'middle' },
  'trailer-used': { x: 224, y: 24, anchor: 'middle' },
  'trailer-absent': { x: 224, y: 24, anchor: 'middle' },
}
const wideNotes: NotePlaces = {
  'role-header': { x: 100, y: 78, anchor: 'middle' },
  'role-payload': { x: 220, y: 78, anchor: 'middle' },
  'role-trailer': { x: 340, y: 78, anchor: 'middle' },
  'trailer-used': { x: 340, y: 24, anchor: 'middle' },
  'trailer-absent': { x: 340, y: 24, anchor: 'middle' },
}

const question = '패킷 하나는 어떤 부분으로 이루어질까?'
const idleCaption = '패킷 하나에는 실어 보낼 내용인 페이로드만 들어 있지 않다. 그 내용을 목적지까지 전달하고 받는 쪽이 처리하는 데 필요한 부가 정보가 앞이나 뒤에 함께 붙는다. 앞에 붙는 것이 헤더, 뒤에 붙는 것이 트레일러다. 버튼을 고르면 트레일러가 언제 붙는지 볼 수 있다.'
const legend = '이어 붙은 상자들이 패킷 하나이고, 왼쪽이 앞이다. 상자의 길이는 실제 크기와 상관없다.'
const expectedScenarios = [
  {
    id: 'with-trailer', label: '트레일러를 쓰는 프로토콜',
    nodes: ['header', 'payload', 'trailer'],
    notes: ['trailer-used'],
    caption: '트레일러를 쓰는 프로토콜을 따르는 패킷에는 페이로드 앞의 헤더에 더해, 페이로드 뒤에도 부가 정보인 트레일러가 붙는다. 받는 쪽이 끝내 쓰려는 것은 가운데의 페이로드이고, 헤더와 트레일러는 주고받는 양쪽이 그 패킷을 어떻게 다룰지 맞추는 데 쓰인다.',
  },
  {
    id: 'without-trailer', label: '트레일러가 없는 패킷',
    nodes: ['header', 'payload'],
    notes: ['trailer-absent'],
    caption: '트레일러는 모든 패킷에 붙지 않고, 트레일러를 쓰는 프로토콜을 따를 때만 붙는다. 그래서 헤더와 페이로드만으로 이루어진 패킷도 있다.',
  },
]

function diagram() {
  return screen.getByRole('img', { name: '왼쪽부터 헤더, 페이로드, 트레일러를 이어 붙인 패킷 하나' })
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

function cellBox(id: string) {
  return readBox(diagram().querySelector(`[data-node="${id}"] rect`)!)
}

function shownIds(selector: string, attribute: string) {
  return Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)!)
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

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

// 아래 단언들은 배치에 묶이지 않는다. 세로형과 가로형이 같은 기대값으로 통과해야 한다.
async function expectScenario(
  scenario: typeof expectedScenarios[number],
  places: NotePlaces,
  width: number,
  container: HTMLElement,
) {
  await selectScenario(scenario.label)

  for (const cell of diagram().querySelectorAll('[data-node]')) {
    expect(cell).toHaveAttribute('opacity', scenario.nodes.includes(cell.getAttribute('data-node')!) ? '1' : '0.25')
  }
  expect(diagram().querySelectorAll('[data-path], [data-link], marker')).toHaveLength(0)

  const cellBoxes = cellIds.map(cellBox)
  const shownNotes = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shownNotes.map((note) => note.getAttribute('data-note')).sort()).toEqual([...roleNoteIds, ...scenario.notes].sort())
  for (const note of shownNotes) {
    const id = note.getAttribute('data-note')! as NoteId
    expect(note.textContent).toBe(noteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', places[id].anchor)
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    const box = textBox(note)
    expect(box.x, id).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, id).toBeLessThanOrEqual(width)
    expect(box.y, id).toBeGreaterThanOrEqual(0)
    for (const cell of cellBoxes) expect(overlaps(box, cell), `${id} ↔ ${cell.id}`).toBe(false)
  }
  for (const id of roleNoteIds) {
    const note = diagram().querySelector(`[data-note="${id}"]`)!
    expect(note, id).toHaveAttribute('opacity', scenario.nodes.includes(roleOf[id]) ? '1' : '0.25')
  }
  for (const id of scenario.notes) expect(diagram().querySelector(`[data-note="${id}"]`)!.closest('[opacity]')).toBeNull()
  for (let i = 0; i < shownNotes.length; i += 1) {
    for (let j = i + 1; j < shownNotes.length; j += 1) {
      expect(overlaps(textBox(shownNotes[i]), textBox(shownNotes[j])), '곁말끼리').toBe(false)
    }
  }
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 칸 라벨이 자기 칸 안에 들어간다. 칸은 모서리 없는 회색 상자이고 그룹 박스는 없다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(cellIds.length)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
  expect(diagram().querySelector('[data-group]')).toBeNull()

  for (const [id, label] of Object.entries(labels)) {
    const cell = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(cell.querySelector('rect')!)
    expect(cell.querySelector('text')!.textContent).toBe(label)
    expect(cell.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(cell.querySelector('rect')).toHaveAttribute('rx', '0')
    expect(cell.querySelector('rect')).toHaveClass('stroke-disabled')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(label, 10) + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
  }
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 칸이 왼쪽부터 헤더·페이로드·트레일러 순서로 한 줄에 빈틈없이 이어지고, 길이로 크기를 말하지 않도록 폭이 같다.
// 칸마다 하는 일 곁말은 그 칸 바로 아래 가운데에 늘 있고, 트레일러에 붙는 시나리오 곁말은 트레일러 칸 바로 위 가운데에 있다.
async function expectPoint() {
  const [header, payload, trailer] = cellIds.map(cellBox)
  expect([header.id, payload.id, trailer.id]).toEqual(['header', 'payload', 'trailer'])
  expect(payload.x).toBe(header.x + header.width)
  expect(trailer.x).toBe(payload.x + payload.width)
  expect(new Set([header.y, payload.y, trailer.y]).size).toBe(1)
  expect(new Set([header.width, payload.width, trailer.width]).size).toBe(1)

  for (const id of roleNoteIds) {
    const box = textBox(diagram().querySelector(`[data-note="${id}"]`)!)
    const cell = cellBox(roleOf[id])
    expect(box.x + box.width / 2, id).toBe(cell.x + cell.width / 2)
    expect(box.y + box.height - (cell.y + cell.height), id).toBeGreaterThanOrEqual(10)
    expect(box.y + box.height - (cell.y + cell.height), id).toBeLessThanOrEqual(16)
  }

  for (const { label, notes } of expectedScenarios) {
    await selectScenario(label)
    const box = textBox(diagram().querySelector(`[data-note="${notes[0]}"]`)!)
    expect(box.x + box.width / 2, label).toBe(trailer.x + trailer.width / 2)
    expect(trailer.y - (box.y + box.height), label).toBeGreaterThanOrEqual(6)
    expect(trailer.y - (box.y + box.height), label).toBeLessThanOrEqual(16)
  }

  await selectScenario('트레일러가 없는 패킷')
  expect(Array.from(diagram().querySelectorAll('[data-node][opacity="0.25"]'), (cell) => cell.getAttribute('data-node'))).toEqual(['trailer'])
}

describe('PacketPartsDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<PacketPartsDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 칸 셋이 모두 선명하고 칸마다 하는 일 곁말만 보이며 선택 안내가 나온다', () => {
    const { container } = render(<PacketPartsDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(cellIds)
    for (const cell of diagram().querySelectorAll('[data-node]')) expect(cell).toHaveAttribute('opacity', '1')
    expect(shownIds('[data-note]', 'data-note')).toEqual(roleNoteIds)
    for (const id of roleNoteIds) expect(diagram().querySelector(`[data-note="${id}"]`)).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-link], marker')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 칸만 선명하고 칸마다 하는 일 곁말이 칸을 따르며 지정한 곁말이 보인다', async (scenario) => {
    const { container } = render(<PacketPartsDiagram />)
    await expectScenario(scenario, tallNotes, 280, container)
  })

  it('시나리오를 바꾸면 이전 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<PacketPartsDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...roleNoteIds, ...scenario.notes].sort())
    }
    await selectScenario('전체')

    for (const cell of diagram().querySelectorAll('[data-node]')) expect(cell).toHaveAttribute('opacity', '1')
    expect(shownIds('[data-note]', 'data-note')).toEqual(roleNoteIds)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('칸 셋이 280×88 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<PacketPartsDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 88')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 88])
  })

  it('칸이 헤더·페이로드·트레일러 순서로 빈틈없이 이어지고, 트레일러가 없는 패킷에서는 트레일러만 흐리다', async () => {
    render(<PacketPartsDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 도식마다 자기 시나리오를 따로 고르고 화살표 마커가 없다', async () => {
    render(<><PacketPartsDiagram /><PacketPartsDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: '패킷을 이루는 헤더·페이로드·트레일러 도식' })

    await act(async () => { await userEvent.click(within(figures[0]).getByRole('button', { name: '트레일러가 없는 패킷' })) })

    expect(figures[0].querySelector('[data-note="trailer-absent"]')).not.toBeNull()
    expect(figures[1].querySelector('[data-note="trailer-absent"]')).toBeNull()
    expect(figures[1].querySelector('[data-node="trailer"]')).toHaveAttribute('opacity', '1')
    for (const figure of figures) expect(figure.querySelector('marker')).toBeNull()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<PacketPartsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['packet-parts']
    const ids = packetPartsScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toBeUndefined()
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([anchorConceptId])
    expect(text.label).toBe('패킷을 이루는 헤더·페이로드·트레일러 도식')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = packetPartsScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 패킷 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: '패킷을 이루는 헤더·페이로드·트레일러 도식' })

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

    it('440×88 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<PacketPartsDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 88')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('칸 id 집합과 곁말 id 집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<PacketPartsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 88')
      const tallCells = shownIds('[data-node]', 'data-node')
      const tallNoteIds = shownIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 88')
      expect(shownIds('[data-node]', 'data-node')).toEqual(tallCells)
      expect(shownIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
      expect(tallCells).toEqual(cellIds)
    })

    it('모든 rect가 440×88 viewBox 안에 있고 칸 라벨이 자기 칸 안에 들어간다', () => {
      render(<PacketPartsDiagram />)
      expectFits([0, 0, 440, 88])
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 칸·곁말·캡션을 보이고 곁말은 칸과 겹치지 않는다', async (scenario) => {
      const { container } = render(<PacketPartsDiagram />)
      await expectScenario(scenario, wideNotes, 440, container)
    })

    it('칸이 헤더·페이로드·트레일러 순서로 빈틈없이 이어지고, 트레일러가 없는 패킷에서는 트레일러만 흐리다', async () => {
      render(<PacketPartsDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<PacketPartsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 88')
      await selectScenario('트레일러가 없는 패킷')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '트레일러가 없는 패킷' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(diagram().querySelector('[data-node="trailer"]')).toHaveAttribute('opacity', '0.25')
      expect(diagram().querySelector('[data-note="trailer-absent"]')).toHaveAttribute('x', String(wideNotes['trailer-absent'].x))
    })
  })
})
