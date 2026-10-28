import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { StandardNameDiagram, standardNameScenarios } from './StandardNameDiagram'

const topicId = 'ethernet'
const anchorConceptId = `${topicId}.standard-names`
const cellIds = ['speed', 'base', 'letters']
// 처음(전체)의 칸 글자와 칸 아래 곁말.
const idleCells = ['속도', 'BASE', '하이픈 뒤 글자']
const idleNotes = {
  speed: '1초에 보내는 비트 수',
  base: '베이스밴드',
  letters: '신호를 보내는 케이블',
}
const nodeLabels = {
  speed: '속도',
  base: 'BASE',
  letters: '하이픈 뒤 글자',
  '10base-t.speed': '10',
  '10base-t.letters': '-T',
  '1000base-sx.speed': '1000',
  '1000base-sx.letters': '-SX',
  '10gbase-t.speed': '10G',
  '10gbase-t.letters': '-T',
}
const noteLabels = {
  ...idleNotes,
  '10base-t.speed': '10 Mb/s',
  '10base-t.letters': '트위스티드 페어',
  '1000base-sx.speed': '1 Gb/s',
  '1000base-sx.letters': '짧은 파장의 빛',
  '1000base-sx.encoding': 'X는 부호화 방식',
  '10gbase-t.speed': '10 Gb/s',
  '10gbase-t.letters': '트위스티드 페어',
}
type NoteId = keyof typeof noteLabels
// 곁말이 놓이는 자리. 칸 셋 아래 첫 줄과, 하이픈 뒤 글자 칸 아래 둘째 줄이다.
type Place = 'speed' | 'base' | 'letters' | 'encoding'
type Places = Record<Place, { x: number, y: number }>

const tallPlaces: Places = {
  speed: { x: 56, y: 54 },
  base: { x: 140, y: 54 },
  letters: { x: 224, y: 54 },
  encoding: { x: 224, y: 68 },
}
const widePlaces: Places = {
  speed: { x: 100, y: 54 },
  base: { x: 220, y: 54 },
  letters: { x: 340, y: 54 },
  encoding: { x: 340, y: 68 },
}
// 곁말 id가 어느 자리에 놓이는가.
const placeOf = (id: NoteId): Place => (id.includes('.') ? id.split('.')[1] : id) as Place
// 곁말이 어느 칸 아래에 있는가. 둘째 줄은 하이픈 뒤 글자 칸 아래다.
const cellOf = (place: Place) => (place === 'encoding' ? 'letters' : place)

const question = '이더넷 규격 이름은 무엇을 알려 줄까?'
const idleCaption = '이더넷 규격 이름은 세 부분으로 나눠 읽는다. 맨 앞은 1초에 보내는 비트 수인 속도이고, 가운데 BASE는 신호를 싣는 방식이 베이스밴드라는 표시이며, 하이픈 뒤 글자는 어떤 케이블로 신호를 보내는지를 알려 준다. 버튼을 고르면 실제 규격 이름을 나눠 읽어 볼 수 있다.'
const legend = '이어 붙은 세 칸이 규격 이름 하나이고, 왼쪽부터 읽는다. 칸 아래 글은 그 칸이 말하는 것이다.'
const expectedScenarios = [
  {
    id: '10base-t', label: '10BASE-T',
    cells: ['10', 'BASE', '-T'],
    notes: ['10base-t.speed', 'base', '10base-t.letters'] as NoteId[],
    caption: '10BASE-T는 앞의 수 10에 G가 없으므로 메가비트 단위, 곧 1초에 10메가비트(10 Mb/s)를 보내는 규격이다. 하이픈 뒤 T는 트위스티드 페어 케이블로 전기 신호를 보낸다는 뜻이다.',
  },
  {
    id: '1000base-sx', label: '1000BASE-SX',
    cells: ['1000', 'BASE', '-SX'],
    notes: ['1000base-sx.speed', 'base', '1000base-sx.letters', '1000base-sx.encoding'] as NoteId[],
    caption: '1000BASE-SX의 1000은 1000 Mb/s, 곧 1 Gb/s다. 하이픈 뒤 첫 글자 S는 광섬유로 짧은 파장의 빛을 보낸다는 뜻이고, 이 규격은 멀티 모드 광섬유를 쓴다. 둘째 글자 X는 케이블이 아니라 데이터를 신호로 바꾸는 규칙(부호화 방식)을 가리킨다.',
  },
  {
    id: '10gbase-t', label: '10GBASE-T',
    cells: ['10G', 'BASE', '-T'],
    notes: ['10gbase-t.speed', 'base', '10gbase-t.letters'] as NoteId[],
    caption: '10GBASE-T는 10 뒤에 G가 붙었으므로 기가비트 단위, 곧 1초에 10기가비트(10 Gb/s)를 보낸다. 하이픈 뒤 글자는 10BASE-T와 같은 T라, 둘 다 트위스티드 페어 케이블로 전기 신호를 보내지만 속도는 1000배 다르다.',
  },
]

function diagram() {
  return screen.getByRole('img', { name: '이더넷 규격 이름 하나를 속도, BASE, 하이픈 뒤 글자의 세 칸으로 나눈 띠' })
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

function cellTexts() {
  return cellIds.map((id) => diagram().querySelector(`[data-node="${id}"] text`)!.textContent!)
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

// 보이는 곁말이 지정한 id·글·자리이고, 칸·다른 곁말과 겹치지 않으며 viewBox 안에 있다.
function expectNotes(ids: NoteId[], places: Places, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note')).sort()).toEqual([...ids].sort())
  const cells = cellIds.map(cellBox)
  for (const note of shown) {
    const id = note.getAttribute('data-note')! as NoteId
    const place = places[placeOf(id)]
    expect(note.textContent).toBe(noteLabels[id])
    expect(note).toHaveAttribute('x', String(place.x))
    expect(note).toHaveAttribute('y', String(place.y))
    expect(note).toHaveAttribute('text-anchor', 'middle')
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note.closest('[opacity]')).toBeNull()
    const box = textBox(note)
    expect(box.x, id).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, id).toBeLessThanOrEqual(width)
    expect(box.y, id).toBeGreaterThanOrEqual(0)
    expect(box.y + box.height, id).toBeLessThanOrEqual(height)
    for (const cell of cells) expect(overlaps(box, cell), `${id} ↔ ${cell.id}`).toBe(false)
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
  places: Places,
  width: number,
  height: number,
  container: HTMLElement,
) {
  await selectScenario(scenario.label)

  for (const cell of diagram().querySelectorAll('[data-node]')) expect(cell).toHaveAttribute('opacity', '1')
  expect(diagram().querySelectorAll('[data-path], [data-link], marker')).toHaveLength(0)
  expect(cellTexts()).toEqual(scenario.cells)
  expectNotes(scenario.notes, places, width, height)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 칸 글자가 어느 상태에서나 자기 칸 안에 들어간다. 칸은 모서리 없는 회색 상자이고 그룹 박스는 없다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(cellIds.length)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
  expect(diagram().querySelector('[data-group]')).toBeNull()

  for (const id of cellIds) {
    const cell = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(cell.querySelector('rect')!)
    expect(cell.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(cell.querySelector('rect')).toHaveAttribute('rx', '0')
    expect(cell.querySelector('rect')).toHaveClass('stroke-disabled')
    expect(box.height).toBe(32)
    const labelsOfCell = Object.entries(nodeLabels).filter(([key]) => key === id || key.endsWith(`.${id}`)).map(([, label]) => label)
    for (const label of labelsOfCell) expect(estimateTextWidth(label, 10) + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
  }
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 요점: 칸이 속도·BASE·하이픈 뒤 글자 순서로 한 줄에 빈틈없이 이어진다. 시나리오마다 세 칸의 글자를 이으면 그 규격 이름이 되고,
// 속도 칸 아래 곁말은 개념 본문이 쓴 속도 표기와 같다. 곁말은 자기 칸 바로 아래 가운데에 있다.
async function expectPoint() {
  const [speed, base, letters] = cellIds.map(cellBox)
  expect(base.x).toBe(speed.x + speed.width)
  expect(letters.x).toBe(base.x + base.width)
  expect(new Set([speed.y, base.y, letters.y]).size).toBe(1)
  expect(new Set([speed.width, base.width, letters.width]).size).toBe(1)

  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    expect(cellTexts().join(''), scenario.label).toBe(scenario.label)
    expect(body, scenario.label).toContain(scenario.label)
    const speedNote = diagram().querySelector(`[data-note="${scenario.id}.speed"]`)!.textContent!
    expect(body, `${scenario.label} 속도 ${speedNote}`).toContain(speedNote)
    for (const note of diagram().querySelectorAll('[data-note]')) {
      const id = note.getAttribute('data-note')! as NoteId
      const place = placeOf(id)
      const box = textBox(note)
      const cell = cellBox(cellOf(place))
      expect(box.x + box.width / 2, id).toBe(cell.x + cell.width / 2)
      const line = place === 'encoding' ? 2 : 1
      expect(box.y + box.height - (cell.y + cell.height), id).toBe(14 * line)
    }
  }
}

describe('StandardNameDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<StandardNameDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 세 칸이 일반 이름으로 모두 선명하고 칸마다 뜻 곁말이 보이며 선택 안내가 나온다', () => {
    const { container } = render(<StandardNameDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(cellIds)
    for (const cell of diagram().querySelectorAll('[data-node]')) expect(cell).toHaveAttribute('opacity', '1')
    expect(cellTexts()).toEqual(idleCells)
    expectNotes(['speed', 'base', 'letters'], tallPlaces, 280, 80)
    expect(diagram().querySelectorAll('[data-path], [data-link], marker')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 세 칸이 그 이름으로 바뀌고 칸마다 그 뜻 곁말이 보인다', async (scenario) => {
    const { container } = render(<StandardNameDiagram />)
    await expectScenario(scenario, tallPlaces, 280, 80, container)
  })

  it('시나리오를 바꾸면 이전 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<StandardNameDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
    }
    await selectScenario('전체')

    expect(cellTexts()).toEqual(idleCells)
    expect(shownIds('[data-note]', 'data-note').sort()).toEqual(['base', 'letters', 'speed'])
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('세 칸이 280×80 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<StandardNameDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 80')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 80])
  })

  it('칸이 빈틈없이 이어지고, 시나리오마다 세 칸을 이으면 규격 이름이며 속도 곁말이 본문의 표기와 같다', async () => {
    render(<StandardNameDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 도식마다 자기 시나리오를 따로 고르고 화살표 마커가 없다', async () => {
    render(<><StandardNameDiagram /><StandardNameDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: '이더넷 규격 이름을 읽는 법 도식' })

    await act(async () => { await userEvent.click(within(figures[0]).getByRole('button', { name: '1000BASE-SX' })) })

    expect(figures[0].querySelector('[data-note="1000base-sx.encoding"]')).not.toBeNull()
    expect(figures[1].querySelector('[data-note="1000base-sx.encoding"]')).toBeNull()
    expect(figures[1].querySelector('[data-node="speed"] text')!.textContent).toBe('속도')
    for (const figure of figures) expect(figure.querySelector('marker')).toBeNull()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<StandardNameDiagram />)
    const text = visualsByTopicId[topicId].diagrams['standard-name']
    const ids = standardNameScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(nodeLabels)
    expect(text.groups).toBeUndefined()
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([anchorConceptId])
    expect(text.label).toBe('이더넷 규격 이름을 읽는 법 도식')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = standardNameScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(cellIds)
      expect(scenario.paths).toEqual([])
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) {
      expect(conceptIds).toContain(source)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 규격 이름 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: '이더넷 규격 이름을 읽는 법 도식' })

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

    it('440×80 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<StandardNameDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 80')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('칸 id 집합과 곁말 id 집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<StandardNameDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 80')
      const tallCells = shownIds('[data-node]', 'data-node')
      const tallNoteIds = shownIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 80')
      expect(shownIds('[data-node]', 'data-node')).toEqual(tallCells)
      expect(shownIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
      expect(tallCells).toEqual(cellIds)
    })

    it('모든 rect가 440×80 viewBox 안에 있고 칸 글자가 자기 칸 안에 들어간다', () => {
      render(<StandardNameDiagram />)
      expectFits([0, 0, 440, 80])
    })

    it('처음에는 세 칸이 일반 이름이고 칸마다 뜻 곁말이 가로형 자리에 보인다', () => {
      render(<StandardNameDiagram />)
      expect(cellTexts()).toEqual(idleCells)
      expectNotes(['speed', 'base', 'letters'], widePlaces, 440, 80)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 칸 글자·곁말·캡션을 보이고 곁말은 칸과 겹치지 않는다', async (scenario) => {
      const { container } = render(<StandardNameDiagram />)
      await expectScenario(scenario, widePlaces, 440, 80, container)
    })

    it('칸이 빈틈없이 이어지고, 시나리오마다 세 칸을 이으면 규격 이름이며 속도 곁말이 본문의 표기와 같다', async () => {
      render(<StandardNameDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<StandardNameDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 80')
      await selectScenario('1000BASE-SX')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '1000BASE-SX' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(cellTexts()).toEqual(['1000', 'BASE', '-SX'])
      expect(diagram().querySelector('[data-note="1000base-sx.encoding"]')).toHaveAttribute('x', String(widePlaces.encoding.x))
    })
  })
})
