import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ZoneIsolationDiagram, zoneIsolationScenarios } from './ZoneIsolationDiagram'

const topicId = 'azure-regions-zones'
const anchorConceptId = `${topicId}.availability-zones`
const labels = {
  'dc-1': '데이터 센터',
  'vm-1': 'VM 1',
  'dc-2': '데이터 센터',
  'vm-2': 'VM 2',
  'dc-3': '데이터 센터',
  'vm-3': 'VM 3',
}
const groupLabels = {
  'region': '지역 A',
  'zone-1': '영역 1',
  'zone-2': '영역 2',
  'zone-3': '영역 3',
}
const noteLabels = {
  'region-note': '지역 전체 중단',
  'zone-1-note': '중단',
  'zone-2-note': '계속 동작',
  'zone-3-note': '계속 동작',
}
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

const tallNotes: NotePlaces = {
  'region-note': { x: 54, y: 18, anchor: 'start' },
  'zone-1-note': { x: 64, y: 42, anchor: 'start' },
  'zone-2-note': { x: 64, y: 114, anchor: 'start' },
  'zone-3-note': { x: 64, y: 186, anchor: 'start' },
}
const wideNotes: NotePlaces = {
  'region-note': { x: 56, y: 18, anchor: 'start' },
  'zone-1-note': { x: 66, y: 42, anchor: 'start' },
  'zone-2-note': { x: 204, y: 42, anchor: 'start' },
  'zone-3-note': { x: 342, y: 42, anchor: 'start' },
}

const allNodes = Object.keys(labels)
const zones = ['zone-1', 'zone-2', 'zone-3']
const vms = ['vm-1', 'vm-2', 'vm-3']
const question = '영역마다 나눠 둔 VM은 영역 하나가 멈출 때와 지역 전체가 멈출 때 어떻게 될까?'
const idleCaption = '회사 A는 지역 A의 영역 1·영역 2·영역 3에 VM을 한 대씩 두었다. 버튼을 고르면 영역 하나가 멈출 때와 지역 전체가 멈출 때 VM이 어떻게 되는지 볼 수 있다.'
const legend = '큰 박스는 지역이고, 그 안의 박스 셋은 가용성 영역이다. 영역마다 데이터 센터를 하나씩 그렸지만 영역 하나에 데이터 센터가 여럿일 수도 있다. VM을 세 대 둔 것은 예다. 흐리게 그린 노드는 멈춘 것이다.'
const figureName = '가용성 영역 셋에 나눠 둔 VM이 영역 하나가 멈출 때와 지역 전체가 멈출 때 어떻게 되는지 보는 도식'
const svgName = '지역 A 안에 가용성 영역 셋이 있고, 영역 1·영역 2·영역 3마다 데이터 센터 하나와 VM 한 대가 있다'
const expectedScenarios = [
  {
    id: 'zone-down', label: '영역 하나 중단',
    nodes: ['dc-2', 'vm-2', 'dc-3', 'vm-3'],
    notes: ['zone-1-note', 'zone-2-note', 'zone-3-note'],
    caption: '영역 1이 멈추면 그 안의 VM 1도 멈춘다. 하지만 영역마다 전원·냉각·네트워크가 따로라서, 영역 2와 영역 3에 둔 VM 2와 VM 3은 계속 동작한다.',
    sources: ['azure-regions-zones.availability-zones'],
  },
  {
    id: 'region-down', label: '지역 전체 중단',
    nodes: [] as string[],
    notes: ['region-note'],
    caption: '지역 A 전체에 미칠 만큼 큰 사건이 일어나면 영역 셋이 함께 멈추고 VM 셋도 모두 멈춘다. 가용성 영역은 지역 전체의 중단을 막지 못하므로, 이에 대비하려면 리소스를 다른 지역에도 둔다.',
    sources: ['azure-regions-zones.availability-zones'],
  },
]

function diagram() {
  return screen.getByRole('img', { name: svgName })
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

function inside(box: SvgBox, group: string) {
  const frame = groupBox(group)
  return boxesOutsideViewBox([box], [frame.x, frame.y, frame.width, frame.height]).length === 0
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
  return { id: text.getAttribute('data-note') ?? text.getAttribute('data-group-label')!, x: left, y: y - 9, width, height: 9 }
}

// 그룹 라벨이 차지하는 자리. 반각 글자 여유(1.15배)까지 잡는다.
function groupLabelArea(id: string): SvgBox {
  const group = groupBox(id)
  return { id, x: group.x + 10, y: group.y + 5, width: estimateTextWidth(groupLabels[id as keyof typeof groupLabels], 9) * 1.15, height: 9 }
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function opacityOf(id: string) {
  return diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')
}

// 노드를 담는 영역 박스. 노드는 영역 하나에만 든다.
function zonesHolding(id: string) {
  return zones.filter((zone) => inside(nodeBox(id), zone))
}

// 이 도식에는 경로·연결선·화살표가 없다. 무엇이 멈추는지는 흐림과 곁말로만 보인다.
function expectNoPaths() {
  expect(diagram().querySelectorAll('path, [data-path], [data-link], marker')).toHaveLength(0)
}

// 아래 단언들은 배치에 묶이지 않는다. 세로형과 가로형이 같은 기대값으로 통과해야 한다.
async function expectScenario(
  scenario: typeof expectedScenarios[number],
  places: NotePlaces,
  width: number,
  container: HTMLElement,
) {
  await selectScenario(scenario.label)

  for (const node of diagram().querySelectorAll('[data-node]')) {
    expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
  }
  for (const group of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(group.closest('[opacity]')).toBeNull()
  expectNoPaths()

  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  const groupLabelBoxes = Object.keys(groupLabels).map(groupLabelArea)
  const shownNotes = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shownNotes.map((note) => note.getAttribute('data-note')).sort()).toEqual([...scenario.notes].sort())
  for (const note of shownNotes) {
    const id = note.getAttribute('data-note')! as NoteId
    expect(note.textContent).toBe(noteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', places[id].anchor)
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note.closest('[opacity]')).toBeNull()
    const box = textBox(note)
    const wideBox = { ...box, width: box.width * 1.15 }
    expect(box.x, id).toBeGreaterThanOrEqual(0)
    // 반각 글자는 화면에서 더 넓다 — 1.15배로 잡아도 viewBox 안이어야 한다.
    expect(wideBox.x + wideBox.width, id).toBeLessThanOrEqual(width)
    for (const label of groupLabelBoxes) expect(overlaps(wideBox, label), `${id} ↔ ${label.id}`).toBe(false)
    for (const node of nodeBoxes) expect(overlaps(wideBox, node), `${id} ↔ ${node.id}`).toBe(false)
  }
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 상자 안에, 그룹 라벨은 1.15배로 잡아도 자기 박스 오른쪽 끝 안에 들어간다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(10)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(label, 10) * 1.15 + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
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
    expect(x + estimateTextWidth(wording, 9) * 1.15, wording).toBeLessThanOrEqual(box.x + box.width)
  }
}

// 영역 셋은 지역 안에 서로 겹치지 않게 들고, 지역의 라벨 자리와 겹치지 않는다.
// 노드는 영역 하나에만 들고, 자기 영역의 라벨 자리보다 아래에 있다. 영역마다 데이터 센터 하나와 VM 한 대가 있다. 노드는 모두 회색이다.
function expectMembershipAndColors() {
  for (const zone of zones) {
    expect(inside(groupBox(zone), 'region'), `${zone} ⊂ region`).toBe(true)
    expect(overlaps(groupLabelArea('region'), groupBox(zone)), `region 라벨 ↔ ${zone}`).toBe(false)
    for (const other of zones.filter((id) => id !== zone)) expect(overlaps(groupBox(zone), groupBox(other)), `${zone} ↔ ${other}`).toBe(false)
  }
  for (const id of allNodes) {
    const holding = zonesHolding(id)
    expect(holding, id).toHaveLength(1)
    expect(nodeBox(id).y, id).toBeGreaterThan(groupLabelArea(holding[0]).y + 9)
    expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  }
  for (const [index, zone] of zones.entries()) {
    expect(allNodes.filter((id) => zonesHolding(id)[0] === zone).sort(), zone).toEqual([`dc-${index + 1}`, `vm-${index + 1}`])
  }
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 요점: 영역 하나가 멈추면 그 영역 안의 노드만 흐려지고 다른 두 영역의 노드는 선명하다.
// 지역 전체가 멈추면 지역 안의 노드가 모두 흐려진다. 두 시나리오는 선명한 노드와 곁말이 서로 다르다.
async function expectPoint() {
  for (const vm of vms) expect(zonesHolding(vm), vm).toHaveLength(1)

  await selectScenario('영역 하나 중단')
  for (const id of allNodes) expect(opacityOf(id), id).toBe(zonesHolding(id)[0] === 'zone-1' ? '0.25' : '1')
  const zoneDownNotes = shownIds('[data-note]', 'data-note').sort()

  await selectScenario('지역 전체 중단')
  for (const id of allNodes) {
    expect(inside(nodeBox(id), 'region'), id).toBe(true)
    expect(opacityOf(id), id).toBe('0.25')
  }
  expect(shownIds('[data-note]', 'data-note').sort()).not.toEqual(zoneDownNotes)
}

describe('ZoneIsolationDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<ZoneIsolationDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 여섯이 모두 선명하고 경로와 곁말이 없으며 선택 안내가 나온다', () => {
    const { container } = render(<ZoneIsolationDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual([...allNodes].sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expectNoPaths()
    expect(shownIds('[data-note]', 'data-note')).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·곁말만 보이고 나머지 노드는 흐려진다', async (scenario) => {
    const { container } = render(<ZoneIsolationDiagram />)
    await expectScenario(scenario, tallNotes, 280, container)
  })

  it('시나리오를 바꾸면 이전 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<ZoneIsolationDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
    }
    await selectScenario('전체')

    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(shownIds('[data-note]', 'data-note')).toEqual([])
    expectNoPaths()
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
    for (const { label } of expectedScenarios) expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'false')
  })

  it('그룹 넷과 노드 여섯이 280×252 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<ZoneIsolationDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 252')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 252])
  })

  it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 0..280 안에 있다', async (label) => {
    render(<ZoneIsolationDiagram />)
    await selectScenario(label)

    expect(diagram().querySelectorAll('[data-group]')).toHaveLength(4)
    for (const text of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(text.closest('[opacity]')).toBeNull()
    for (const text of diagram().querySelectorAll('[data-group-label], [data-note]')) {
      expect(text).toHaveAttribute('font-size', '9')
      const box = textBox(text)
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width * 1.15).toBeLessThanOrEqual(280)
    }
  })

  it('영역 셋은 지역 안에 겹치지 않게 있고 노드는 각자의 영역 하나에만 들며 모두 회색이다', () => {
    render(<ZoneIsolationDiagram />)
    expectMembershipAndColors()
  })

  it('영역 하나가 멈추면 그 영역의 노드만, 지역 전체가 멈추면 지역 안의 노드가 모두 흐려진다', async () => {
    render(<ZoneIsolationDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 각 도식에 경로와 화살표 마커가 없다', () => {
    render(<><ZoneIsolationDiagram /><ZoneIsolationDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })

    expect(figures).toHaveLength(2)
    for (const figure of figures) {
      expect(figure.querySelectorAll('path')).toHaveLength(0)
      expect(figure.querySelector('marker')).toBeNull()
    }
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<ZoneIsolationDiagram />)
    const text = visualsByTopicId[topicId].diagrams['availability-zones']
    const ids = zoneIsolationScenarios.map(({ id }) => id).sort()
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
      const scenario = zoneIsolationScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 가용성 영역 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
          const event = Object.assign(new Event('change'), {
            matches: nextMatches,
            media: mediaQuery.media,
          })
          listeners.forEach((listener) => listener(event))
        },
      }
    }

    function ids(selector: string, attribute: string) {
      return shownIds(selector, attribute).sort()
    }

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×148 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<ZoneIsolationDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 148')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expectNoPaths()
    })

    it('노드·그룹 id 집합이 세로형과 같다', () => {
      const { change } = mockMatchMedia(false)
      render(<ZoneIsolationDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 252')
      const tallNodes = ids('[data-node]', 'data-node')
      const tallGroups = ids('[data-group]', 'data-group')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 148')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(tallNodes).toEqual([...allNodes].sort())
      expect(ids('[data-group]', 'data-group')).toEqual(tallGroups)
      expect(tallGroups).toEqual(Object.keys(groupLabels).sort())
      expectNoPaths()
    })

    it('모든 rect가 440×148 viewBox 안에 있고 노드 라벨·그룹 라벨이 자기 상자 안에 들어간다', () => {
      render(<ZoneIsolationDiagram />)
      expectFits([0, 0, 440, 148])
    })

    it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 0..440 안에 있다', async (label) => {
      render(<ZoneIsolationDiagram />)
      await selectScenario(label)

      expect(diagram().querySelectorAll('[data-group]')).toHaveLength(4)
      for (const text of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(text.closest('[opacity]')).toBeNull()
      for (const text of diagram().querySelectorAll('[data-group-label], [data-note]')) {
        expect(text).toHaveAttribute('font-size', '9')
        const box = textBox(text)
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width * 1.15).toBeLessThanOrEqual(440)
      }
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·곁말·캡션을 보이고 곁말은 노드·그룹 라벨과 겹치지 않는다', async (scenario) => {
      const { container } = render(<ZoneIsolationDiagram />)
      await expectScenario(scenario, wideNotes, 440, container)
    })

    it('영역 셋은 지역 안에 겹치지 않게 있고 노드는 각자의 영역 하나에만 들며 모두 회색이다', () => {
      render(<ZoneIsolationDiagram />)
      expectMembershipAndColors()
    })

    it('영역 하나가 멈추면 그 영역의 노드만, 지역 전체가 멈추면 지역 안의 노드가 모두 흐려진다', async () => {
      render(<ZoneIsolationDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<ZoneIsolationDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 252')
      await selectScenario('영역 하나 중단')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '영역 하나 중단' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      for (const note of diagram().querySelectorAll('[data-note]')) {
        expect(note).toHaveAttribute('x', String(wideNotes[note.getAttribute('data-note')! as NoteId].x))
      }
    })
  })
})
