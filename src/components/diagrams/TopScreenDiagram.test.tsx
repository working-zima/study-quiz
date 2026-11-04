import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { TopScreenDiagram, topScreenScenarios } from './TopScreenDiagram'

const topicId = 'linux-process-boot'
const anchorConceptId = `${topicId}.top-command`
const labels = {
  uptime: '가동 시간',
  'task-count': '작업 수',
  cpu: 'CPU 사용',
  memory: '메모리 사용',
  row1: '2310 backup.sh',
  'row1-cpu': '%CPU 25.0',
  row2: '812 sshd',
  'row2-cpu': '%CPU 0.3',
  row3: '2045 bash',
  'row3-cpu': '%CPU 0.0',
  ps: 'ps: 그 순간 한 번',
  top: 'top: 계속 다시 그림',
}
const groupLabels = { summary: '요약 영역', tasks: '작업 영역' }
type GroupId = keyof typeof groupLabels

const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels) as GroupId[]
const summaryIds = ['uptime', 'task-count', 'cpu', 'memory']
const rowIds = ['row1', 'row2', 'row3']
const taskIds = ['row1', 'row1-cpu', 'row2', 'row2-cpu', 'row3', 'row3-cpu']
const compareIds = ['ps', 'top']

type Group = { x: number, y: number, width: number, height: number, labelX: number, labelY: number }
const tallGroups: Record<GroupId, Group> = {
  summary: { x: 8, y: 8, width: 264, height: 102, labelX: 16, labelY: 22 },
  tasks: { x: 8, y: 122, width: 264, height: 126, labelX: 16, labelY: 136 },
}
const wideGroups: Record<GroupId, Group> = {
  summary: { x: 8, y: 8, width: 424, height: 62, labelX: 16, labelY: 22 },
  tasks: { x: 8, y: 82, width: 272, height: 126, labelX: 16, labelY: 96 },
}

const question = 'top 화면은 무엇을 보여 줄까?'
const idleCaption = 'top 화면을 요약 영역과 작업 영역으로 나눠 그렸다. 프로세스의 이름과 번호, %CPU 값은 예로 든 것이다. 버튼을 고르면 두 영역이 무엇을 보이는지와 ps와 무엇이 다른지 볼 수 있다.'
const legend = '두 테두리는 top 화면의 두 영역이고, 작업 영역의 줄은 %CPU가 큰 것부터 놓았다. 테두리 밖의 두 칸은 ps와 top이 목록을 보이는 방식을 견준 것이다.'
const figureName = 'top 화면을 위쪽 요약 영역과 아래쪽 작업 영역으로 나누고, 작업 영역의 줄이 무엇의 차례로 놓이는지와 ps와 무엇이 다른지 보이는 도식'
const svgName = '요약 영역 테두리 안에 가동 시간, 작업 수, CPU 사용, 메모리 사용이 놓이고, 작업 영역 테두리 안에 2310 backup.sh %CPU 25.0, 812 sshd %CPU 0.3, 2045 bash %CPU 0.0 줄이 차례로 놓이며, 테두리 밖에 ps: 그 순간 한 번과 top: 계속 다시 그림이 놓여 있다'
const expectedScenarios = [
  {
    id: 'summary', label: '요약 영역',
    nodes: summaryIds,
    caption: '요약 영역은 시스템 전체를 보인다. 마지막으로 부팅한 뒤 흐른 가동 시간과 상태별로 나눈 작업 수, CPU가 시간을 어떤 일에 나눠 썼는지, 메모리를 얼마나 쓰고 얼마나 남겼는지가 나온다.',
    sources: [anchorConceptId],
  },
  {
    id: 'tasks', label: '작업 영역',
    nodes: taskIds,
    caption: '작업 영역에는 프로세스가 한 줄에 하나씩 놓인다. 여기서는 %CPU를 정렬 칸으로 골라 CPU를 많이 쓴 것부터 늘어세웠다. 이 차례는 실제로 쓴 몫의 차례이고, 우선순위는 PR·NI 칸에 따로 나온다.',
    sources: [anchorConceptId],
  },
  {
    id: 'refresh', label: '다시 그리기',
    nodes: compareIds,
    caption: 'ps는 입력한 그 순간의 목록을 한 번 보이고 끝난다. top은 q를 눌러 끝낼 때까지 일정한 간격으로 화면을 다시 그려, 그사이 바뀐 프로세스와 사용량을 보인다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 300]
const wideBox: [number, number, number, number] = [0, 0, 440, 216]

function diagram() {
  return screen.getByRole('img', { name: svgName })
}

async function selectScenario(label: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) })
}

function readBox(rect: Element): SvgBox {
  return {
    id: rect.parentElement?.getAttribute('data-node') ?? rect.getAttribute('data-group') ?? '',
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

function shownIds(selector: string, attribute: string) {
  return Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)!)
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function contains(outer: SvgBox, inner: SvgBox) {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height
}

// 글자 크기 9인 글이 차지하는 상자. 반각 글자가 화면에서 더 넓게 그려지는 것을 생각해 폭을 1.15배로 잡는다.
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
  for (const id of groupIds) {
    expect(diagram().querySelector(`[data-group="${id}"]`)!.closest('[opacity]')).toBeNull()
    expect(diagram().querySelector(`[data-group-label="${id}"]`)!.closest('[opacity]')).toBeNull()
  }
  expect(diagram().querySelectorAll('[data-path], [data-link], [data-note]')).toHaveLength(0)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다.
// 두 테두리는 자기 영역의 칸을 모두 담고 ps·top 칸은 어느 테두리에도 닿지 않는다. 그룹 라벨은 테두리 안에서 노드와 겹치지 않는다.
function expectFits(viewBox: [number, number, number, number], places: Record<GroupId, Group>) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(node.querySelector('rect')).toHaveClass('stroke-disabled')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(label, 10) * 1.15 + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
  }
  for (let i = 0; i < nodeIds.length; i += 1) {
    for (let j = i + 1; j < nodeIds.length; j += 1) {
      expect(overlaps(nodeBox(nodeIds[i]), nodeBox(nodeIds[j])), `${nodeIds[i]} ↔ ${nodeIds[j]}`).toBe(false)
    }
  }

  for (const id of groupIds) {
    const rect = diagram().querySelector(`[data-group="${id}"]`)!
    expect(rect).toHaveAttribute('x', String(places[id].x))
    expect(rect).toHaveAttribute('y', String(places[id].y))
    expect(rect).toHaveAttribute('width', String(places[id].width))
    expect(rect).toHaveAttribute('height', String(places[id].height))

    const labelText = diagram().querySelector(`[data-group-label="${id}"]`)!
    expect(labelText.textContent).toBe(groupLabels[id])
    expect(labelText).toHaveAttribute('x', String(places[id].labelX))
    expect(labelText).toHaveAttribute('y', String(places[id].labelY))
    expect(labelText).toHaveAttribute('font-size', '9')
    const label = textBox(labelText, id)
    expect(boxesOutsideViewBox([label], viewBox)).toEqual([])
    expect(contains(groupBox(id), label)).toBe(true)
    for (const node of nodeIds) expect(overlaps(label, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
  }
  expect(overlaps(groupBox('summary'), groupBox('tasks'))).toBe(false)
  for (const id of summaryIds) expect(contains(groupBox('summary'), nodeBox(id)), id).toBe(true)
  for (const id of taskIds) expect(contains(groupBox('tasks'), nodeBox(id)), id).toBe(true)
  for (const id of compareIds) {
    for (const group of groupIds) expect(overlaps(groupBox(group), nodeBox(id)), `${id} ↔ ${group}`).toBe(false)
  }
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 요점: 작업 영역의 줄을 위에서 아래로 읽으면 %CPU 값이 커지지 않는다(큰 것부터). 줄마다 프로세스 칸 바로 오른쪽에 %CPU 칸이 맞닿는다.
// 요약 영역의 선명한 칸은 모두 요약 영역 안에, 작업 영역의 선명한 칸은 모두 작업 영역 안에 있고, 다시 그리기의 칸은 테두리 밖에 있다.
// 칸에 쓴 예시 값과 이름은 개념 본문에 있다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const textOf = (id: string) => diagram().querySelector(`[data-node="${id}"] text`)!.textContent!
  const brightNodes = () => Array.from(diagram().querySelectorAll('[data-node][opacity="1"]'), (element) => element.getAttribute('data-node')!)

  await selectScenario('작업 영역')
  const rows = brightNodes().filter((id) => rowIds.includes(id)).sort((a, b) => nodeBox(a).y - nodeBox(b).y)
  expect(rows).toEqual(rowIds)
  const values = rows.map((id) => Number(textOf(`${id}-cpu`).replace('%CPU ', '')))
  for (let i = 1; i < values.length; i += 1) expect(values[i], rows[i]).toBeLessThanOrEqual(values[i - 1])
  expect(values[0]).toBeGreaterThan(values[values.length - 1])
  for (const id of rows) {
    const name = nodeBox(id)
    const value = nodeBox(`${id}-cpu`)
    expect(value.y, id).toBe(name.y)
    expect(name.x + name.width, id).toBe(value.x)
    const [pid, program] = textOf(id).split(' ')
    expect(body).toContain(`\`${program}\`(PID \`${pid}\`)`)
    expect(body).toContain(`\`${textOf(`${id}-cpu`).replace('%CPU ', '')}\``)
  }
  for (const id of brightNodes()) expect(contains(groupBox('tasks'), nodeBox(id)), id).toBe(true)
  expect(body).toContain('`%CPU`를 정렬 칸으로 골라 큰 것부터 늘어세운 작업 영역')
  expect(body).toContain('이 차례는 프로세스들이 실제로 쓴 CPU의 몫을 견준 것이지 우선순위의 차례가 아니다')

  await selectScenario('요약 영역')
  expect(brightNodes().sort()).toEqual([...summaryIds].sort())
  for (const id of brightNodes()) {
    expect(contains(groupBox('summary'), nodeBox(id)), id).toBe(true)
    expect(body).toContain(textOf(id))
  }

  await selectScenario('다시 그리기')
  expect(brightNodes().sort()).toEqual([...compareIds].sort())
  for (const id of brightNodes()) {
    for (const group of groupIds) expect(overlaps(groupBox(group), nodeBox(id)), `${id} ↔ ${group}`).toBe(false)
  }
  expect(body).toContain('`ps`는 입력한 그 순간의 목록을 한 번 보이므로')
  expect(body).toContain('`top`은 끝낼 때까지 계속 다시 그리므로')
}

describe('TopScreenDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<TopScreenDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 선·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<TopScreenDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note], [data-link]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 칸만 선명하다', async (scenario) => {
    const { container } = render(<TopScreenDiagram />)
    await expectScenario(scenario, container)
  })

  it('시나리오를 바꾸면 이전 칸이 흐려지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<TopScreenDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-node][opacity="1"]', 'data-node').sort()).toEqual([...scenario.nodes].sort())
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('세 시나리오의 선명한 노드가 서로 다르다', () => {
    const keys = expectedScenarios.map(({ nodes }) => JSON.stringify([...nodes].sort()))
    expect(new Set(keys).size).toBe(expectedScenarios.length)
  })

  it('노드와 테두리가 280×300 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<TopScreenDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 300')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox, tallGroups)
  })

  it('작업 영역의 줄은 %CPU가 큰 것부터 놓이고, 두 영역과 견준 칸이 제자리에 있다', async () => {
    render(<TopScreenDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 고른 시나리오가 서로 섞이지 않는다', async () => {
    render(<><TopScreenDiagram /><TopScreenDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    await act(async () => { await userEvent.click(within(figures[0]).getByRole('button', { name: '작업 영역' })) })

    expect(within(figures[0]).getByRole('button', { name: '작업 영역' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(figures[1]).getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    for (const element of figures[1].querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<TopScreenDiagram />)
    const text = visualsByTopicId[topicId].diagrams['top-screen']
    const ids = topScreenScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toBeUndefined()
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
      const scenario = topScreenScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 top 명령 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×216 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<TopScreenDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 216')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·그룹 id 집합이 세로형과 같다', () => {
      const { change } = mockMatchMedia(false)
      render(<TopScreenDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 300')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroupIds = shownIds('[data-group]', 'data-group').sort()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 216')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroupIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallGroupIds).toEqual([...groupIds].sort())
    })

    it('노드와 테두리가 440×216 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<TopScreenDiagram />)
      expectFits(wideBox, wideGroups)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 칸·캡션을 보인다', async (scenario) => {
      const { container } = render(<TopScreenDiagram />)
      await expectScenario(scenario, container)
    })

    it('작업 영역의 줄은 %CPU가 큰 것부터 놓이고, 두 영역과 견준 칸이 제자리에 있다', async () => {
      render(<TopScreenDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<TopScreenDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 300')
      await selectScenario('다시 그리기')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '다시 그리기' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownIds('[data-node][opacity="1"]', 'data-node').sort()).toEqual([...compareIds].sort())
      expect(diagram().querySelector('[data-node="top"] rect')).toHaveAttribute('x', '296')
    })
  })
})
