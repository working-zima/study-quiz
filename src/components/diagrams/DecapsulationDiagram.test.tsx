import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { DecapsulationDiagram, decapsulationScenarios } from './DecapsulationDiagram'

const topicId = 'protocols-encapsulation'
const anchorConceptId = `${topicId}.decapsulation`
const figureLabel = '받은 데이터에서 헤더를 바깥쪽부터 떼어 내는 순서 도식'
// 앞에서부터 이어 붙은 순서다. 캡슐화 도식의 프레임 줄과 같은 말을 쓴다.
const labels = {
  ethernet: '이더넷 헤더',
  ip: 'IP 헤더',
  tcp: 'TCP 헤더',
  http: 'HTTP 헤더',
  data: '데이터',
  trailer: '트레일러',
}
const noteLabels = {
  'detach-ethernet': '떼어 냄',
  'detach-ip': '떼어 냄',
  'detach-tcp': '떼어 냄',
  'detach-http': '떼어 냄',
  'detach-trailer': '떼어 냄',
  'arrive-data': '응용 프로그램에 닿음',
}

const cellIds = Object.keys(labels)

type NotePlace = { x: number, y: number, anchor: 'start' | 'middle' }
const tallNotes: Record<string, NotePlace> = {
  'detach-ethernet': { x: 47, y: 27, anchor: 'middle' },
  'detach-ip': { x: 107, y: 27, anchor: 'middle' },
  'detach-tcp': { x: 160, y: 27, anchor: 'middle' },
  'detach-http': { x: 219, y: 27, anchor: 'middle' },
  'detach-trailer': { x: 122, y: 87, anchor: 'start' },
  'arrive-data': { x: 12, y: 114, anchor: 'start' },
}
const wideNotes: Record<string, NotePlace> = {
  'detach-ethernet': { x: 85, y: 27, anchor: 'middle' },
  'detach-ip': { x: 145, y: 27, anchor: 'middle' },
  'detach-tcp': { x: 198, y: 27, anchor: 'middle' },
  'detach-http': { x: 257, y: 27, anchor: 'middle' },
  'detach-trailer': { x: 363, y: 27, anchor: 'middle' },
  'arrive-data': { x: 312, y: 78, anchor: 'middle' },
}

const question = '받은 데이터에서 헤더는 어떤 순서로 떨어질까?'
const idleCaption = '웹 페이지를 TCP로 받고, 네트워크 액세스 계층에서 이더넷을 쓰는 경우다. 받은 데이터는 아래 계층에서 위 계층으로 한 계층씩 올라가고, 각 계층은 보내는 쪽의 같은 계층이 붙였던 헤더를 떼어 낸다. 계층을 아래부터 차례로 고르면 어느 칸이 어떤 순서로 떨어지는지 볼 수 있다.'
const legend = '이어 붙은 상자들이 받은 데이터 한 덩어리이고, 왼쪽이 앞이다. 흐린 칸은 아래 계층이 이미 떼어 낸 것이다.'
// nodes는 이 계층에 닿았을 때 아직 남아 있는 칸(지금 떼는 칸 포함), detach는 이 계층이 떼는 칸이다.
const expectedScenarios = [
  {
    id: 'network-access', label: '네트워크 액세스 계층',
    nodes: ['ethernet', 'ip', 'tcp', 'http', 'data', 'trailer'],
    detach: ['ethernet', 'trailer'],
    notes: ['detach-ethernet', 'detach-trailer'],
    caption: '맨 아래 네트워크 액세스 계층이 맨 먼저 이더넷 헤더와 트레일러를 떼어 내고, 나머지를 위의 인터넷 계층으로 넘긴다. 이더넷 헤더는 보낼 때 맨 마지막에 붙은 가장 바깥쪽 헤더라, 받을 때는 맨 먼저 떨어진다.',
  },
  {
    id: 'internet', label: '인터넷 계층',
    nodes: ['ip', 'tcp', 'http', 'data'],
    detach: ['ip'],
    notes: ['detach-ip'],
    caption: '인터넷 계층은 자기 계층의 헤더인 IP 헤더만 떼어 내고 나머지를 전송 계층으로 넘긴다. 그 안의 TCP 헤더와 HTTP 헤더는 각자의 계층에 닿을 때까지 페이로드 안에 그대로 들어 있다.',
  },
  {
    id: 'transport', label: '전송 계층',
    nodes: ['tcp', 'http', 'data'],
    detach: ['tcp'],
    notes: ['detach-tcp'],
    caption: '전송 계층은 TCP 헤더를 떼어 내고 나머지를 응용 계층으로 넘긴다. 보내는 쪽의 전송 계층이 TCP 헤더에 적어 둔 내용은 받는 쪽의 전송 계층이 같은 TCP의 규칙대로 읽어 처리하므로, 이 헤더를 떼는 것도 같은 전송 계층이다.',
  },
  {
    id: 'application', label: '응용 계층',
    nodes: ['http', 'data'],
    detach: ['http'],
    notes: ['detach-http', 'arrive-data'],
    caption: '응용 계층까지 HTTP 헤더를 떼어 내면 데이터만 남아, 웹 브라우저 같은 응용 프로그램에 원래의 데이터가 닿는다. 보낼 때 맨 처음 붙은 HTTP 헤더가 맨 나중에 떨어졌으니, 헤더는 붙은 순서의 반대로 떨어진 셈이다.',
  },
]

function diagram() {
  return screen.getByRole('img', { name: '웹 페이지를 TCP로 받을 때 이더넷 헤더·IP 헤더·TCP 헤더·HTTP 헤더·데이터·트레일러가 차례로 이어 붙은 데이터 한 덩어리' })
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

// 글자가 차지하는 상자. 높이는 글자 크기 9를 기준선 위로 잡는다.
function textBox(text: Element): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9)
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id: text.getAttribute('data-note')!, x: left, y: y - 9, width, height: 9 }
}

// 칸을 읽는 순서로 늘어놓는다. 위 줄부터, 같은 줄에서는 왼쪽부터다.
function readingOrder(ids: string[]) {
  return [...ids].sort((a, b) => nodeBox(a).y - nodeBox(b).y || nodeBox(a).x - nodeBox(b).x)
}

function opaqueCells() {
  return cellIds.filter((id) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
}

async function expectScenario(scenario: typeof expectedScenarios[number], container: HTMLElement) {
  await selectScenario(scenario.label)

  for (const node of diagram().querySelectorAll('[data-node]')) {
    expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
  }
  expect(diagram().querySelectorAll('[data-path], [data-link], marker')).toHaveLength(0)
  expect(shownIds('[data-note]', 'data-note')).toEqual(scenario.notes)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고 라벨이 칸 안에 들어간다. 곁말은 viewBox 안에 있고 칸에 겹치지 않으며 자기 칸 곁에 붙는다.
async function expectFits(viewBox: [number, number, number, number], places: Record<string, NotePlace>) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(cellIds.length)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(node.querySelector('rect')).toHaveAttribute('rx', '0')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(label, 10) + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
  }

  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    for (const note of diagram().querySelectorAll('[data-note]')) {
      const id = note.getAttribute('data-note')!
      expect(note.textContent).toBe(noteLabels[id as keyof typeof noteLabels])
      expect(note).toHaveAttribute('x', String(places[id].x))
      expect(note).toHaveAttribute('y', String(places[id].y))
      expect(note).toHaveAttribute('text-anchor', places[id].anchor)
      expect(note).toHaveAttribute('font-size', '9')
      expect(note).toHaveClass('fill-muted')
      const box = textBox(note)
      expect(boxesOutsideViewBox([box], viewBox), id).toEqual([])
      for (const cell of cellIds) expect(overlaps(box, nodeBox(cell)), `${id} ↔ ${cell}`).toBe(false)

      // 곁말이 가리키는 칸: 떼어 냄은 그 칸, 닿음은 데이터 칸이다. 곁말은 칸 바로 위·아래 가운데나 바로 오른쪽에 붙는다.
      const cell = nodeBox(id === 'arrive-data' ? 'data' : id.replace('detach-', ''))
      const x = Number(note.getAttribute('x'))
      const y = Number(note.getAttribute('y'))
      const above = x > cell.x && x < cell.x + cell.width && cell.y - y >= 3 && cell.y - y <= 8
      const alignedX = places[id].anchor === 'middle' ? x > cell.x && x < cell.x + cell.width : x === cell.x
      const below = alignedX && box.y - (cell.y + cell.height) >= 2 && box.y - (cell.y + cell.height) <= 8
      const right = places[id].anchor === 'start' && x - (cell.x + cell.width) >= 4 && x - (cell.x + cell.width) <= 12 && y > cell.y && y < cell.y + cell.height
      expect(above || below || right, id).toBe(true)
    }
    const shown = Array.from(diagram().querySelectorAll('[data-note]'), textBox)
    shown.forEach((box, index) => shown.slice(index + 1).forEach((other) => expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)))
  }
}

// 칸은 앞에서부터 이더넷 헤더·IP 헤더·TCP 헤더·HTTP 헤더·데이터·트레일러 순서로 이어 붙는다.
// 같은 줄의 다음 칸은 앞 칸의 오른쪽 변에 바로 붙고, 줄이 바뀌면 다음 줄 맨 앞에서 다시 시작한다.
function expectChunk() {
  expect(readingOrder(cellIds)).toEqual(cellIds)
  const order = readingOrder(cellIds).map(nodeBox)
  const rowStart = order[0].x
  order.slice(1).forEach((box, index) => {
    const previous = order[index]
    if (box.y === previous.y) expect(box.x, box.id).toBe(previous.x + previous.width)
    else {
      expect(box.y, box.id).toBeGreaterThanOrEqual(previous.y + previous.height)
      expect(box.x, box.id).toBe(rowStart)
    }
  })
  for (const id of cellIds) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 시나리오를 아래 계층부터 차례로 보면 남는 칸이 줄어든다. 지금 떼는 칸은 남은 칸 가운데 가장 바깥이다 —
// 헤더는 맨 앞, 트레일러는 맨 뒤. 한 계층이 떼고 남은 칸이 다음 계층에 닿는 칸이고, 응용 계층이 떼면 데이터만 남는다.
async function expectPeelOrder() {
  let previousRemaining: string[] = [...cellIds]
  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    const visible = readingOrder(opaqueCells())
    expect(visible, scenario.label).toEqual(previousRemaining)
    const detaching = shownIds('[data-note]', 'data-note').filter((id) => id.startsWith('detach-')).map((id) => id.replace('detach-', ''))
    expect(detaching.sort(), scenario.label).toEqual([...scenario.detach].sort())

    const fronts = detaching.filter((id) => id !== 'trailer')
    expect(visible.slice(0, fronts.length), scenario.label).toEqual(fronts)
    if (detaching.includes('trailer')) expect(visible[visible.length - 1], scenario.label).toBe('trailer')

    const remaining = visible.filter((id) => !detaching.includes(id))
    expect(remaining.length, scenario.label).toBeLessThan(visible.length)
    previousRemaining = remaining
  }
  expect(previousRemaining).toEqual(['data'])
}

async function expectIndependentRenders() {
  render(<><DecapsulationDiagram /><DecapsulationDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureLabel })
  await act(async () => { await userEvent.click(within(figures[0]).getByRole('button', { name: '인터넷 계층' })) })
  await act(async () => { await userEvent.click(within(figures[1]).getByRole('button', { name: '응용 계층' })) })
  expect(Array.from(figures[0].querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note'))).toEqual(['detach-ip'])
  expect(Array.from(figures[1].querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note'))).toEqual(['detach-http', 'arrive-data'])
  for (const figure of figures) expect(figure.querySelector('marker')).toBeNull()
}

describe('DecapsulationDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<DecapsulationDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 칸 여섯이 모두 선명하고 곁말·화살표 없이 선택 안내가 나온다', () => {
    const { container } = render(<DecapsulationDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(cellIds)
    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-link], [data-group], [data-note], marker')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 아직 남은 칸만 선명하고 지금 떼는 칸에 곁말이 붙는다', async (scenario) => {
    const { container } = render(<DecapsulationDiagram />)
    await expectScenario(scenario, container)
  })

  it('시나리오를 바꾸면 이전 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<DecapsulationDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-note]', 'data-note')).toEqual(scenario.notes)
    }
    await selectScenario('전체')

    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('칸이 280×124 viewBox 안에 있고 모바일 너비 보정을 유지한다', async () => {
    render(<DecapsulationDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 124')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    await expectFits([0, 0, 280, 124], tallNotes)
  })

  it('칸이 앞에서부터 차례로 빈틈없이 이어 붙고 노드는 모두 회색이다', () => {
    render(<DecapsulationDiagram />)
    expectChunk()
  })

  it('아래 계층부터 남은 칸 가운데 가장 바깥 칸이 떨어지고, 응용 계층까지 떼면 데이터만 남는다', async () => {
    render(<DecapsulationDiagram />)
    await expectPeelOrder()
  })

  it('두 번 렌더해도 도식마다 자기 시나리오를 따로 고르고 화살표 마커가 없다', async () => {
    await expectIndependentRenders()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<DecapsulationDiagram />)
    const text = visualsByTopicId[topicId].diagrams['decapsulation-peel']
    const ids = decapsulationScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toBeUndefined()
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.label).toBe(figureLabel)
    expect(text.sources).toEqual([anchorConceptId])
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = decapsulationScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 역캡슐화 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureLabel })

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
      render(<DecapsulationDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 88')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('칸 id 집합이 세로형과 같고 한 줄로 이어 붙는다', () => {
      const { change } = mockMatchMedia(false)
      render(<DecapsulationDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 124')
      const tallCells = shownIds('[data-node]', 'data-node').sort()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 88')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallCells)
      expect(tallCells).toEqual([...cellIds].sort())
      expect(new Set(cellIds.map((id) => nodeBox(id).y)).size).toBe(1)
    })

    it('모든 rect가 440×88 viewBox 안에 있고 라벨과 곁말이 자기 자리에 들어간다', async () => {
      render(<DecapsulationDiagram />)
      await expectFits([0, 0, 440, 88], wideNotes)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 칸·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<DecapsulationDiagram />)
      await expectScenario(scenario, container)
    })

    it('칸이 앞에서부터 차례로 빈틈없이 이어 붙고 노드는 모두 회색이다', () => {
      render(<DecapsulationDiagram />)
      expectChunk()
    })

    it('아래 계층부터 남은 칸 가운데 가장 바깥 칸이 떨어지고, 응용 계층까지 떼면 데이터만 남는다', async () => {
      render(<DecapsulationDiagram />)
      await expectPeelOrder()
    })

    it('두 번 렌더해도 도식마다 자기 시나리오를 따로 고르고 화살표 마커가 없다', async () => {
      await expectIndependentRenders()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<DecapsulationDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 124')
      await selectScenario('네트워크 액세스 계층')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '네트워크 액세스 계층' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownIds('[data-note]', 'data-note')).toEqual(['detach-ethernet', 'detach-trailer'])
      expect(diagram().querySelector('[data-note="detach-trailer"]')).toHaveAttribute('x', String(wideNotes['detach-trailer'].x))
    })
  })
})
