import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { EmrClusterCostDiagram, emrClusterCostScenarios } from './EmrClusterCostDiagram'

const labels = {
  job: '작업',
  'long-running': '장기 실행 클러스터',
  transient: '일시적 클러스터',
  'high-1': '노드',
  'high-2': '노드',
  'high-3': '노드',
  'low-busy': '노드',
  'low-idle-1': '노는 노드',
  'low-idle-2': '노는 노드',
}
const groupLabels = { day: '하루', work: '긴 작업 하나가 도는 동안', high: '부하가 클 때', low: '부하가 작을 때' }
const noteLabels = {
  'idle-cost': '나머지 시간도 비용',
  'ends-with-job': '작업과 함께 종료',
  'idle-nodes-cost': '노는 동안에도 비용',
  'add-nodes': '부하가 크면 더함',
  'remove-nodes': '부하가 작으면 뺌',
}
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

const tallNotes: NotePlaces = {
  'idle-cost': { x: 192, y: 52, anchor: 'middle' },
  'ends-with-job': { x: 124, y: 132, anchor: 'start' },
  'idle-nodes-cost': { x: 206, y: 352, anchor: 'middle' },
  'add-nodes': { x: 74, y: 352, anchor: 'middle' },
  'remove-nodes': { x: 206, y: 352, anchor: 'middle' },
}
const wideNotes: NotePlaces = {
  'idle-cost': { x: 290, y: 52, anchor: 'middle' },
  'ends-with-job': { x: 164, y: 132, anchor: 'start' },
  'idle-nodes-cost': { x: 326, y: 272, anchor: 'middle' },
  'add-nodes': { x: 114, y: 272, anchor: 'middle' },
  'remove-nodes': { x: 326, y: 272, anchor: 'middle' },
}

const dayNodes = ['job', 'long-running', 'transient']
const highNodes = ['high-1', 'high-2', 'high-3']
const lowNodes = ['low-busy', 'low-idle-1', 'low-idle-2']
const workNodes = [...highNodes, ...lowNodes]

const question = 'EMR 클러스터가 노는 시간은 어떻게 줄일까?'
const idleCaption = '방식을 고르면 클러스터와 노드가 언제 놀고 있는지 볼 수 있다.'
const legend = '파랑: EMR 클러스터와 노드 · 회색: 작업. 위 박스는 하루가 왼쪽에서 오른쪽으로 흐르며, 막대 길이는 실제 시간의 비율이 아니다.'
const expectedScenarios = [
  {
    id: 'long-running', label: '장기 실행',
    nodes: ['job', 'long-running'], notes: ['idle-cost'],
    caption: '클러스터를 계속 띄워 두면 작업이 끝난 뒤 남은 시간의 비용이 그대로 낭비된다.',
    sources: ['emr-glue-athena.emr-transient-cluster'],
  },
  {
    id: 'transient', label: '일시적 클러스터',
    nodes: ['job', 'transient'], notes: ['ends-with-job'],
    caption: '작업이 도는 동안만 살아 있다가 끝나면 종료된다. 매일 몇 시간만 도는 작업에서 비용을 낮춘다.',
    sources: ['emr-glue-athena.emr-transient-cluster'],
  },
  {
    id: 'no-scaling', label: '스케일링 없음',
    nodes: workNodes, notes: ['idle-nodes-cost'],
    caption: '작업이 도는 동안에도 부하가 줄면 노드 여럿이 논다. 클러스터의 수명을 줄이는 것과는 다른 문제다.',
    sources: ['emr-glue-athena.emr-managed-scaling'],
  },
  {
    id: 'managed', label: '관리형 스케일링',
    nodes: [...highNodes, 'low-busy'], notes: ['add-nodes', 'remove-nodes'],
    caption: '부하를 보고 노드를 더하고 뺀다. 필요할 때만 노드가 붙어 있어 긴 작업 안의 유휴 시간이 준다.',
    sources: ['emr-glue-athena.emr-managed-scaling'],
  },
]

function diagram() {
  return screen.getByRole('img', { name: '장기 실행·일시적 클러스터와 관리형 스케일링' })
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

// 글자가 차지하는 상자. 높이는 글자 크기 9를 기준선 위로 잡는다.
function textBox(text: Element): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9)
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id: text.getAttribute('data-note') ?? text.getAttribute('data-group-label')!, x: left, y: y - 9, width, height: 9 }
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function colorOf(id: string) {
  return id === 'job' ? 'stroke-disabled' : 'stroke-diagram-managed'
}

// 아래 단언들은 배치에 묶이지 않는다. 세로형과 가로형이 같은 기대값으로 통과해야 한다.
async function expectScenario(scenario: typeof expectedScenarios[number], places: NotePlaces, width: number, container: HTMLElement) {
  await selectScenario(scenario.label)

  for (const node of diagram().querySelectorAll('[data-node]')) {
    expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
  }
  for (const group of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(group.closest('[opacity]')).toBeNull()
  expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)

  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  const groupLabelBoxes = Array.from(diagram().querySelectorAll('[data-group-label]'), textBox)
  const shownNotes = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shownNotes.map((note) => note.getAttribute('data-note'))).toEqual(scenario.notes)
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
    expect(box.x, id).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, id).toBeLessThanOrEqual(width)
    for (const label of groupLabelBoxes) expect(overlaps(box, label), `${id} ↔ ${label.id}`).toBe(false)
    for (const node of nodeBoxes) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
  }
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

async function expectNoPaths() {
  for (const label of ['전체', ...expectedScenarios.map(({ label }) => label)]) {
    await selectScenario(label)
    expect(diagram().querySelectorAll('[data-path], path'), label).toHaveLength(0)
    expect(diagram().querySelector('marker'), label).toBeNull()
  }
}

// 일시적 클러스터는 작업과 함께 끝나므로 같은 자리·같은 길이이고, 장기 실행은 그보다 길다.
function expectBars() {
  const job = nodeBox('job')
  const transient = nodeBox('transient')
  const longRunning = nodeBox('long-running')

  expect(transient.x).toBe(job.x)
  expect(transient.width).toBe(job.width)
  expect(longRunning.width).toBeGreaterThan(job.width)
}

function opacityOf(id: string) {
  return diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')
}

async function expectScaling() {
  await selectScenario('관리형 스케일링')
  for (const id of ['low-idle-1', 'low-idle-2']) expect(opacityOf(id), id).toBe('0.25')
  for (const id of ['low-busy', ...highNodes]) expect(opacityOf(id), id).toBe('1')

  await selectScenario('스케일링 없음')
  for (const id of workNodes) expect(opacityOf(id), id).toBe('1')
}

async function expectBoxSeparation() {
  for (const label of ['장기 실행', '일시적 클러스터']) {
    await selectScenario(label)
    for (const id of workNodes) expect(opacityOf(id), `${label}: ${id}`).toBe('0.25')
  }
  for (const label of ['스케일링 없음', '관리형 스케일링']) {
    await selectScenario(label)
    for (const id of dayNodes) expect(opacityOf(id), `${label}: ${id}`).toBe('0.25')
  }
}

function expectMembershipAndColors() {
  for (const id of Object.keys(labels)) {
    expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass(colorOf(id))
  }
  expect(Object.keys(labels).filter((id) => colorOf(id) === 'stroke-disabled')).toEqual(['job'])

  const day = groupBox('day')
  const work = groupBox('work')
  expect(overlaps(day, work)).toBe(false)
  expect(boxesOutsideViewBox(dayNodes.map(nodeBox), frameOf(day))).toEqual([])
  expect(boxesOutsideViewBox(highNodes.map(nodeBox), frameOf(groupBox('high')))).toEqual([])
  expect(boxesOutsideViewBox(lowNodes.map(nodeBox), frameOf(groupBox('low')))).toEqual([])
  expect(boxesOutsideViewBox([groupBox('high'), groupBox('low')], frameOf(work))).toEqual([])
  expect(overlaps(groupBox('high'), groupBox('low'))).toBe(false)
  for (const id of workNodes) expect(overlaps(nodeBox(id), day), id).toBe(false)
  for (const id of dayNodes) expect(overlaps(nodeBox(id), work), id).toBe(false)
}

// 관문 5·6: 모든 rect가 viewBox 안에 있고, 라벨은 상자 안에, 그룹 라벨은 자기 박스 오른쪽 끝 안에 들어간다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(13)
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
    expect(x + estimateTextWidth(wording, 9), wording).toBeLessThanOrEqual(viewBox[2])
  }
}

describe('EmrClusterCostDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<EmrClusterCostDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 아홉이 모두 선명하고 경로·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<EmrClusterCostDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual(Object.keys(labels).sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·곁말만 보이고 나머지 노드는 흐려진다', async (scenario) => {
    const { container } = render(<EmrClusterCostDiagram />)
    await expectScenario(scenario, tallNotes, 280, container)
  })

  it('장면을 바꾸면 이전 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<EmrClusterCostDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note'))).toEqual(scenario.notes)
    }
    await selectScenario('전체')

    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
    for (const { label } of expectedScenarios) expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'false')
  })

  it('관문 5·7: 그룹 넷과 노드 아홉이 280×372 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<EmrClusterCostDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 372')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 372])
  })

  it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨은 크기 9로 0..280 안에 있다', async (label) => {
    render(<EmrClusterCostDiagram />)
    await selectScenario(label)

    expect(diagram().querySelectorAll('[data-group]')).toHaveLength(4)
    for (const text of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(text.closest('[opacity]')).toBeNull()
    for (const text of diagram().querySelectorAll('[data-group-label], [data-note]')) {
      const box = textBox(text)
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(280)
    }
  })

  it('어느 장면에서도 경로와 화살표 마커가 없다', async () => {
    render(<EmrClusterCostDiagram />)
    await expectNoPaths()
  })

  it('일시적 클러스터는 작업과 x·폭이 같고 장기 실행 클러스터는 그보다 길다', () => {
    render(<EmrClusterCostDiagram />)
    expectBars()
  })

  it('관리형 스케일링은 노는 노드 둘만 흐리고, 스케일링 없음은 아래 노드 여섯을 모두 보인다', async () => {
    render(<EmrClusterCostDiagram />)
    await expectScaling()
  })

  it('위 박스의 장면은 아래 노드를, 아래 박스의 장면은 위 노드를 흐린다', async () => {
    render(<EmrClusterCostDiagram />)
    await expectBoxSeparation()
  })

  it('작업만 회색이고 나머지는 파랑이며, 노드는 자기 그룹 안에 있다', () => {
    render(<EmrClusterCostDiagram />)
    expectMembershipAndColors()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구·근거를 JSON에서 읽는다', () => {
    render(<EmrClusterCostDiagram />)
    const text = visualsByTopicId['emr-glue-athena'].diagrams['cluster-cost']
    const ids = emrClusterCostScenarios.map(({ id }) => id).sort()

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual(['emr-glue-athena.emr-transient-cluster', 'emr-glue-athena.emr-managed-scaling'])
    expect(text.label).toBe('EMR 클러스터 비용 도식')
    expect(text.svgLabel).toBe('장기 실행·일시적 클러스터와 관리형 스케일링')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = emrClusterCostScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: expected.sources })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.paths).toEqual([])
      expect([...wording.caption].length).toBeLessThanOrEqual(57)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 관리형 스케일링 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === 'emr-glue-athena')!.concepts.find(({ id }) => id === 'emr-glue-athena.emr-managed-scaling')!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: 'EMR 클러스터 비용 도식' })

    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*/gu, ''))
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
      return Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)).sort()
    }

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×292 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<EmrClusterCostDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 292')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·그룹 id 집합이 세로형과 같다', () => {
      const { change } = mockMatchMedia(false)
      render(<EmrClusterCostDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 372')
      const tallNodes = ids('[data-node]', 'data-node')
      const tallGroups = ids('[data-group]', 'data-group')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 292')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(tallNodes).toEqual(Object.keys(labels).sort())
      expect(ids('[data-group]', 'data-group')).toEqual(tallGroups)
      expect(tallGroups).toEqual(Object.keys(groupLabels).sort())
    })

    it('모든 rect가 440×292 viewBox 안에 있고 노드 라벨·그룹 라벨이 자기 상자 안에 들어간다', () => {
      render(<EmrClusterCostDiagram />)
      expectFits([0, 0, 440, 292])
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·곁말·캡션을 보이고 곁말은 0..440 안에서 노드·그룹 라벨과 겹치지 않는다', async (scenario) => {
      const { container } = render(<EmrClusterCostDiagram />)
      await expectScenario(scenario, wideNotes, 440, container)
    })

    it('어느 장면에서도 경로와 화살표 마커가 없다', async () => {
      render(<EmrClusterCostDiagram />)
      await expectNoPaths()
    })

    it('일시적 클러스터는 작업과 x·폭이 같고 장기 실행 클러스터는 그보다 길다', () => {
      render(<EmrClusterCostDiagram />)
      expectBars()
    })

    it('관리형 스케일링은 노는 노드 둘만 흐리고, 스케일링 없음은 아래 노드 여섯을 모두 보인다', async () => {
      render(<EmrClusterCostDiagram />)
      await expectScaling()
    })

    it('위 박스의 장면은 아래 노드를, 아래 박스의 장면은 위 노드를 흐린다', async () => {
      render(<EmrClusterCostDiagram />)
      await expectBoxSeparation()
    })

    it('작업만 회색이고 나머지는 파랑이며, 노드는 자기 그룹 안에 있다', () => {
      render(<EmrClusterCostDiagram />)
      expectMembershipAndColors()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<EmrClusterCostDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 372')
      await selectScenario('관리형 스케일링')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '관리형 스케일링' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note'))).toEqual(['add-nodes', 'remove-nodes'])
      for (const note of diagram().querySelectorAll('[data-note]')) {
        expect(note).toHaveAttribute('x', String(wideNotes[note.getAttribute('data-note')! as NoteId].x))
      }
      expect(opacityOf('low-idle-1')).toBe('0.25')
    })
  })
})
