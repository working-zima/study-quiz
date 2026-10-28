import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { PduNamesDiagram, pduNamesScenarios } from './PduNamesDiagram'

const topicId = 'protocols-encapsulation'
const anchorConceptId = `${topicId}.pdu-names`
const figureLabel = 'TCP/IP 모델의 계층마다 데이터 단위를 부르는 이름 도식'
const labels = {
  app: '응용 계층',
  transport: '전송 계층',
  internet: '인터넷 계층',
  'network-access': '네트워크 액세스 계층',
  message: '메시지',
  segment: '세그먼트',
  datagram: '데이터그램',
  packet: '패킷',
  frame: '프레임',
}
const groupLabels = {
  layers: 'TCP/IP 모델의 계층',
  units: '데이터 단위',
}
const noteLabels = {
  'by-tcp': 'TCP가 만듦',
  'by-udp': 'UDP가 만듦',
  'packet-standard': '표준 이름: IP 데이터그램',
}

const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
// 맨 위가 응용 계층이다.
const layers = ['app', 'transport', 'internet', 'network-access']
const units = ['message', 'segment', 'datagram', 'packet', 'frame']
// 계층마다 같은 줄에 놓이는 단위. 전송 계층만 프로토콜에 따라 둘로 갈린다.
const pairs: Record<string, string[]> = {
  app: ['message'],
  transport: ['segment', 'datagram'],
  internet: ['packet'],
  'network-access': ['frame'],
}
// 곁말이 딸린 단위 칸. 곁말은 그 칸의 opacity를 따른다.
const noteCells: Record<string, string> = {
  'by-tcp': 'segment',
  'by-udp': 'datagram',
  'packet-standard': 'packet',
}

type NotePlace = { x: number, y: number }
const tallNotes: Record<string, NotePlace> = {
  'by-tcp': { x: 144, y: 127 },
  'by-udp': { x: 208, y: 127 },
  'packet-standard': { x: 144, y: 179 },
}
const wideNotes: Record<string, NotePlace> = {
  'by-tcp': { x: 212, y: 127 },
  'by-udp': { x: 304, y: 127 },
  'packet-standard': { x: 300, y: 155 },
}

const question = '계층마다 데이터 단위를 무엇이라 부를까?'
const idleCaption = '데이터가 계층을 지나며 헤더가 하나씩 붙으므로, 각 계층에서 만들어진 덩어리는 담고 있는 헤더가 서로 다르다. 그래서 TCP/IP 모델의 계층마다 데이터 단위를 다른 이름으로 부르고, 이름만 들어도 어느 헤더까지 붙어 있는지 알 수 있다. 전송 계층에서 쓰는 프로토콜을 고르면 그 계층의 이름이 어떻게 갈리는지 볼 수 있다.'
const legend = '왼쪽 박스는 TCP/IP 모델의 네 계층이고 맨 위가 응용 계층이다. 오른쪽 박스에서 같은 줄에 놓인 이름이 그 계층의 데이터 단위다.'
const expectedScenarios = [
  {
    id: 'tcp', label: 'TCP를 쓸 때',
    nodes: [...layers, 'message', 'segment', 'packet', 'frame'],
    caption: '전송 계층에서 TCP를 쓰면, 응용 계층이 넘긴 데이터 앞에 TCP 헤더가 붙은 단위를 세그먼트라 부른다. 인터넷 계층은 세그먼트 앞에 IP 헤더를 붙여 패킷을 만들고, 네트워크 액세스 계층은 패킷 앞에 헤더를, 뒤에 트레일러를 붙여 프레임을 만든다.',
  },
  {
    id: 'udp', label: 'UDP를 쓸 때',
    nodes: [...layers, 'message', 'datagram', 'packet', 'frame'],
    caption: '같은 전송 계층이라도 UDP를 쓰면, 응용 계층이 넘긴 데이터 앞에 UDP 헤더가 붙은 단위를 데이터그램이라 부른다. 어느 프로토콜을 썼는지에 따라 붙은 헤더가 다르기 때문이다. 메시지·패킷·프레임은 TCP를 쓸 때와 같은 이름이다.',
  },
]

function diagram() {
  return screen.getByRole('img', { name: 'TCP/IP 모델의 네 계층과, 같은 줄에 놓인 계층마다의 데이터 단위 이름' })
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

function groupLabelArea(group: string): SvgBox {
  const box = groupBox(group)
  return { id: group, x: box.x + 10, y: box.y + 7, width: estimateTextWidth(groupLabels[group as keyof typeof groupLabels], 9), height: 9 }
}

function opaque(ids: string[]) {
  return ids.filter((id) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
}

async function expectScenario(scenario: typeof expectedScenarios[number], container: HTMLElement) {
  await selectScenario(scenario.label)

  for (const node of diagram().querySelectorAll('[data-node]')) {
    expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
  }
  for (const note of diagram().querySelectorAll('[data-note]')) {
    const cell = noteCells[note.getAttribute('data-note')!]
    expect(note).toHaveAttribute('opacity', scenario.nodes.includes(cell) ? '1' : '0.25')
  }
  for (const group of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(group.closest('[opacity]')).toBeNull()
  expect(diagram().querySelectorAll('[data-path], [data-link], marker')).toHaveLength(0)
  expect(shownIds('[data-note]', 'data-note')).toEqual(noteIds)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 상자 안에, 그룹 라벨은 자기 박스 오른쪽 끝 안에 들어간다.
// 곁말은 단위 박스 안에서 자기 칸 바로 아래나 바로 오른쪽에 붙고 노드·그룹 라벨·다른 곁말에 겹치지 않는다.
function expectFits(viewBox: [number, number, number, number], places: Record<string, NotePlace>) {
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
    const x = Number(groupLabel.getAttribute('x'))
    expect(x, wording).toBe(box.x + 10)
    expect(Number(groupLabel.getAttribute('y')), wording).toBe(box.y + 14)
    expect(x + estimateTextWidth(wording, 9), wording).toBeLessThanOrEqual(box.x + box.width)
    for (const node of nodeIds) expect(overlaps(groupLabelArea(id), nodeBox(node)), `${wording} ↔ ${node}`).toBe(false)
  }

  const noteBoxes: SvgBox[] = []
  for (const note of diagram().querySelectorAll('[data-note]')) {
    const id = note.getAttribute('data-note')!
    expect(note.textContent).toBe(noteLabels[id as keyof typeof noteLabels])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', 'start')
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    const box = textBox(note)
    expect(boxesOutsideViewBox([box], viewBox), id).toEqual([])
    expect(inside(box, 'units'), id).toBe(true)
    for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
    for (const group of groupIds) expect(overlaps(box, groupLabelArea(group)), `${id} ↔ ${group}`).toBe(false)

    const cell = nodeBox(noteCells[id])
    const below = places[id].x === cell.x && box.y - (cell.y + cell.height) >= 2 && box.y - (cell.y + cell.height) <= 8
    const right = places[id].x - (cell.x + cell.width) >= 4 && places[id].x - (cell.x + cell.width) <= 12 && places[id].y > cell.y && places[id].y < cell.y + cell.height
    expect(below || right, id).toBe(true)
    noteBoxes.push(box)
  }
  noteBoxes.forEach((box, index) => noteBoxes.slice(index + 1).forEach((other) => expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)))
}

// 계층은 계층 박스에만, 단위는 단위 박스에만 있다. 계층은 맨 위 응용 계층부터 아래로 쌓이고,
// 계층마다 그 단위가 같은 높이에 짝을 이룬다. 노드는 모두 회색이며 도식 전용 두 색·초록·빨강·주황은 쓰지 않는다.
function expectStructure() {
  for (const layer of layers) expect(groupIds.filter((group) => inside(nodeBox(layer), group)), layer).toEqual(['layers'])
  for (const unit of units) expect(groupIds.filter((group) => inside(nodeBox(unit), group)), unit).toEqual(['units'])
  layers.forEach((layer, index) => {
    if (index > 0) expect(nodeBox(layer).y, layer).toBeGreaterThanOrEqual(nodeBox(layers[index - 1]).y + 32)
  })
  for (const [layer, paired] of Object.entries(pairs)) {
    for (const unit of paired) {
      expect(nodeBox(unit).y, `${layer} ↔ ${unit}`).toBe(nodeBox(layer).y)
      expect(nodeBox(unit).x, `${layer} ↔ ${unit}`).toBeGreaterThan(nodeBox(layer).x + nodeBox(layer).width)
    }
  }
  expect(Object.values(pairs).flat().sort()).toEqual([...units].sort())
  // 전송 계층의 두 이름은 같은 줄에 나란히 놓인다.
  expect(nodeBox('datagram').x).toBeGreaterThanOrEqual(nodeBox('segment').x + nodeBox('segment').width)

  for (const id of nodeIds) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 두 시나리오에서 계층은 넷 다 선명하고, 선명한 단위는 전송 계층의 것만 다르다(TCP는 세그먼트, UDP는 데이터그램).
async function expectTransportDiffers() {
  const shownUnits: Record<string, string[]> = {}
  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    expect(opaque(layers), scenario.label).toEqual(layers)
    shownUnits[scenario.id] = opaque(units)
    for (const [layer, paired] of Object.entries(pairs)) {
      expect(paired.filter((unit) => shownUnits[scenario.id].includes(unit)), `${scenario.label} ${layer}`).toHaveLength(1)
    }
  }
  const onlyTcp = shownUnits.tcp.filter((unit) => !shownUnits.udp.includes(unit))
  const onlyUdp = shownUnits.udp.filter((unit) => !shownUnits.tcp.includes(unit))
  expect(onlyTcp).toEqual(['segment'])
  expect(onlyUdp).toEqual(['datagram'])
  for (const unit of [...onlyTcp, ...onlyUdp]) expect(nodeBox(unit).y).toBe(nodeBox('transport').y)
  expect(shownUnits.tcp.filter((unit) => shownUnits.udp.includes(unit))).toEqual(['message', 'packet', 'frame'])
}

async function expectIndependentRenders() {
  render(<><PduNamesDiagram /><PduNamesDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureLabel })
  await act(async () => { await userEvent.click(within(figures[0]).getByRole('button', { name: 'TCP를 쓸 때' })) })
  await act(async () => { await userEvent.click(within(figures[1]).getByRole('button', { name: 'UDP를 쓸 때' })) })
  expect(figures[0].querySelector('[data-node="datagram"]')).toHaveAttribute('opacity', '0.25')
  expect(figures[1].querySelector('[data-node="segment"]')).toHaveAttribute('opacity', '0.25')
  for (const figure of figures) expect(figure.querySelector('marker')).toBeNull()
}

describe('PduNamesDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<PduNamesDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 계층 넷·단위 다섯·곁말 셋이 모두 선명하고 화살표 없이 선택 안내가 나온다', () => {
    const { container } = render(<PduNamesDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    expect(shownIds('[data-group]', 'data-group')).toEqual(groupIds)
    expect(shownIds('[data-note]', 'data-note')).toEqual(noteIds)
    for (const node of diagram().querySelectorAll('[data-node], [data-note]')) expect(node).toHaveAttribute('opacity', '1')
    for (const group of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(group.closest('[opacity]')).toBeNull()
    expect(diagram().querySelectorAll('[data-path], [data-link], marker')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 그 프로토콜의 단위만 선명하고 다른 쪽 단위와 그 곁말이 흐려진다', async (scenario) => {
    const { container } = render(<PduNamesDiagram />)
    await expectScenario(scenario, container)
  })

  it('시나리오를 바꾸고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<PduNamesDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(opaque(units)).toEqual(units.filter((unit) => scenario.nodes.includes(unit)))
    }
    await selectScenario('전체')

    for (const node of diagram().querySelectorAll('[data-node], [data-note]')) expect(node).toHaveAttribute('opacity', '1')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드와 박스가 280×236 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<PduNamesDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 236')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 236], tallNotes)
  })

  it('계층과 단위가 같은 높이에 짝을 이루고 전송 계층의 두 이름이 나란히 놓인다', () => {
    render(<PduNamesDiagram />)
    expectStructure()
  })

  it('두 시나리오에서 전송 계층의 단위만 다르고 나머지 단위는 같다', async () => {
    render(<PduNamesDiagram />)
    await expectTransportDiffers()
  })

  it('두 번 렌더해도 도식마다 자기 시나리오를 따로 고르고 화살표 마커가 없다', async () => {
    await expectIndependentRenders()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<PduNamesDiagram />)
    const text = visualsByTopicId[topicId].diagrams['pdu-names']
    const ids = pduNamesScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
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
      const scenario = pduNamesScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 계층별 데이터 단위 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×236 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<PduNamesDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 236')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·그룹·곁말 id 집합이 세로형과 같다', () => {
      const { change } = mockMatchMedia(false)
      render(<PduNamesDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 236')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroups = shownIds('[data-group]', 'data-group').sort()
      const tallNoteIds = shownIds('[data-note]', 'data-note').sort()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 236')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroups)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual(tallNoteIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallGroups).toEqual([...groupIds].sort())
      expect(tallNoteIds).toEqual([...noteIds].sort())
    })

    it('모든 rect가 440×236 viewBox 안에 있고 라벨과 그룹 라벨과 곁말이 자기 자리에 들어간다', () => {
      render(<PduNamesDiagram />)
      expectFits([0, 0, 440, 236], wideNotes)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<PduNamesDiagram />)
      await expectScenario(scenario, container)
    })

    it('계층과 단위가 같은 높이에 짝을 이루고 전송 계층의 두 이름이 나란히 놓인다', () => {
      render(<PduNamesDiagram />)
      expectStructure()
    })

    it('두 시나리오에서 전송 계층의 단위만 다르고 나머지 단위는 같다', async () => {
      render(<PduNamesDiagram />)
      await expectTransportDiffers()
    })

    it('두 번 렌더해도 도식마다 자기 시나리오를 따로 고르고 화살표 마커가 없다', async () => {
      await expectIndependentRenders()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<PduNamesDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 236')
      await selectScenario('UDP를 쓸 때')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: 'UDP를 쓸 때' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(diagram().querySelector('[data-node="segment"]')).toHaveAttribute('opacity', '0.25')
      expect(diagram().querySelector('[data-note="packet-standard"]')).toHaveAttribute('x', String(wideNotes['packet-standard'].x))
    })
  })
})
