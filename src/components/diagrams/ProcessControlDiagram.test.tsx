import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ProcessControlDiagram, processControlScenarios } from './ProcessControlDiagram'

const topicId = 'linux-process-boot'
const anchorConceptId = `${topicId}.process-commands`
const labels = {
  'c-term': 'kill 2310',
  'c-kill9': 'kill -9 2310',
  'c-renice': 'renice 10 2310',
  'c-pstree': 'pstree',
  pid1: 'PID 1',
  bash: '2045 bash',
  run: '2310 backup.sh',
}
const noteLabels = {
  term: 'TERM: 끝내라는 요청',
  kill9: 'KILL: 막을 수 없어 끝남',
  nice: '나이스 값 10: 계속 실행',
  tree: '부모·자식 관계를 나무로',
}
const nodeIds = Object.keys(labels)
const linkIds = ['b-bash', 'b-run']
const pathIds = ['term-arrow', 'kill9-arrow', 'renice-arrow', 'pstree-arrow']

// 선마다 시작하는 노드와 끝나는 노드.
const ends: Record<string, [string, string]> = {
  'b-bash': ['pid1', 'bash'],
  'b-run': ['bash', 'run'],
  'term-arrow': ['c-term', 'run'],
  'kill9-arrow': ['c-kill9', 'run'],
  'renice-arrow': ['c-renice', 'run'],
  'pstree-arrow': ['c-pstree', 'pid1'],
}

const question = '실행 중인 프로세스에 무엇을 할 수 있을까?'
const idleCaption = '왼쪽은 입력한 명령이고, 오른쪽은 PID 1부터 셸 bash, bash가 실행한 backup.sh로 이어진 프로세스다. 번호는 예로 붙인 것이다. 버튼을 고르면 명령마다 어느 프로세스를 가리키고 무엇이 달라지는지 볼 수 있다.'
const legend = '화살표는 명령이 가리키는 프로세스로 간다. 가는 선은 부모 프로세스와 자식 프로세스를 잇고, 점선은 그 사이의 프로세스를 그리지 않았다는 뜻이다.'
const figureName = 'kill 2310, kill -9 2310, renice 10 2310, pstree 네 명령이 PID 1 아래 셸 bash가 실행한 backup.sh 프로세스에 저마다 무엇을 하는지 보이는 도식'
const svgName = '왼쪽에 kill 2310, kill -9 2310, renice 10 2310, pstree 명령이 차례로 놓이고, 오른쪽에 PID 1 아래로 점선으로 2045 bash, 그 아래로 2310 backup.sh가 이어져 있다'
const expectedScenarios = [
  {
    id: 'term', label: 'kill',
    nodes: ['c-term', 'run'], paths: ['term-arrow'], notes: ['term'],
    caption: 'kill 2310은 PID 2310인 backup.sh에 기본 시그널 TERM을 보낸다. TERM은 끝내라는 요청이라 프로세스가 하던 일을 정리한 뒤 끝날 수 있고, 끝나면 ps -ef의 목록에서 그 줄이 사라진다.',
    sources: [anchorConceptId],
  },
  {
    id: 'kill9', label: 'kill -9',
    nodes: ['c-kill9', 'run'], paths: ['kill9-arrow'], notes: ['kill9'],
    caption: 'TERM을 보내도 끝나지 않으면 kill -9 2310으로 KILL을 보낸다. KILL은 프로세스가 붙잡거나 무시할 수 없어서, backup.sh는 정리할 기회 없이 끝난다.',
    sources: [anchorConceptId],
  },
  {
    id: 'nice', label: 'nice·renice',
    nodes: ['c-renice', 'run'], paths: ['renice-arrow'], notes: ['nice'],
    caption: 'nice는 나이스 값을 정해 명령을 새로 실행하고, 이미 실행 중인 2310의 값은 renice 10 2310처럼 renice로 바꾼다. 값이 클수록 CPU를 다른 프로세스에 양보하고, 프로세스는 끝나지 않고 계속 실행된다.',
    sources: [anchorConceptId],
  },
  {
    id: 'pstree', label: 'pstree',
    nodes: ['c-pstree', 'pid1', 'bash', 'run', 'b-bash', 'b-run'], paths: ['pstree-arrow'], notes: ['tree'],
    caption: 'pstree는 실행 중인 프로세스들을 부모와 자식의 관계대로 나무 모양으로 보여 준다. PID를 주지 않으면 PID 1을 맨 위에 두고, 그 아래로 bash와 bash가 실행한 backup.sh가 이어진다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 192]
const wideBox: [number, number, number, number] = [0, 0, 440, 176]

function diagram() {
  return screen.getByRole('img', { name: svgName })
}

async function selectScenario(label: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) })
}

function nodeBox(id: string): SvgBox {
  const rect = diagram().querySelector(`[data-node="${id}"] rect`)!
  return {
    id,
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

function shownIds(selector: string, attribute: string) {
  return Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)!)
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

// 글자 크기 9인 곁말이 차지하는 상자. 반각 글자가 화면에서 더 넓게 그려지는 것을 생각해 폭을 1.15배로 잡는다.
function textBox(text: Element, id: string): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9) * 1.15
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id, x: left, y: y - 9, width, height: 9 }
}

// 직교 경로(M·H·V)를 꼭짓점 목록으로 읽는다.
function points(d: string) {
  const result: [number, number][] = []
  const tokens = d.trim().split(/\s+/u)
  let x = 0
  let y = 0
  for (let i = 0; i < tokens.length; i += 1) {
    const command = tokens[i][0]
    const value = tokens[i].slice(1)
    if (command === 'M') {
      x = Number(value)
      y = Number(tokens[i + 1])
      i += 1
    } else if (command === 'H') {
      x = Number(value)
    } else if (command === 'V') {
      y = Number(value)
    } else {
      throw new Error(`직교 경로가 아니다: ${d}`)
    }
    result.push([x, y])
  }
  return result
}

function onEdge([x, y]: [number, number], box: SvgBox) {
  const inX = x >= box.x && x <= box.x + box.width
  const inY = y >= box.y && y <= box.y + box.height
  return (inX && (y === box.y || y === box.y + box.height)) || (inY && (x === box.x || x === box.x + box.width))
}

function crossesInside(a: [number, number], b: [number, number], box: SvgBox) {
  const left = Math.min(a[0], b[0])
  const right = Math.max(a[0], b[0])
  const top = Math.min(a[1], b[1])
  const bottom = Math.max(a[1], b[1])
  return left < box.x + box.width && right > box.x && top < box.y + box.height && bottom > box.y
}

function pathD(id: string) {
  return diagram().querySelector(`[data-path="${id}"], [data-link="${id}"]`)!.getAttribute('d')!
}

async function expectScenario(scenario: typeof expectedScenarios[number], container: HTMLElement) {
  await selectScenario(scenario.label)

  for (const element of diagram().querySelectorAll('[data-node]')) {
    const id = element.getAttribute('data-node')!
    expect(element, id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  for (const element of diagram().querySelectorAll('[data-link]')) {
    const id = element.getAttribute('data-link')!
    expect(element, id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
  expect(shownIds('[data-note]', 'data-note')).toEqual(scenario.notes)
  for (const id of scenario.notes) {
    expect(diagram().querySelector(`[data-note="${id}"]`)!.textContent).toBe(noteLabels[id as keyof typeof noteLabels])
  }
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = nodeIds.map(nodeBox)
  expect(diagram().querySelectorAll('rect')).toHaveLength(nodeIds.length)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])

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
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 선마다 끝점이 정한 두 노드의 변 위에 있고, 어떤 선분도 다른 노드 상자 안을 지나지 않는다.
async function expectLines() {
  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    for (const id of [...linkIds, ...scenario.paths]) {
      const list = points(pathD(id))
      const [from, to] = ends[id]
      expect(onEdge(list[0], nodeBox(from)), `${id} 시작`).toBe(true)
      expect(onEdge(list[list.length - 1], nodeBox(to)), `${id} 끝`).toBe(true)
      for (let i = 1; i < list.length; i += 1) {
        for (const node of nodeIds.filter((other) => other !== from && other !== to)) {
          expect(crossesInside(list[i - 1], list[i], nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        }
      }
    }
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
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
    }
  }
}

// 요점: kill과 kill -9의 명령 칸에 적은 PID는 화살표가 닿는 프로세스 칸의 PID와 같다.
// 두 시나리오의 곁말(시그널 이름)은 서로 다르고 끝남을 말한다. nice·renice와 pstree에서는 끝났다는 곁말이 없다.
// 명령 줄과 시그널 이름은 개념 본문에 있다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const textOf = (id: string) => diagram().querySelector(`[data-node="${id}"] text`)!.textContent!
  const brightNodes = () => Array.from(diagram().querySelectorAll('[data-node][opacity="1"]'), (element) => element.getAttribute('data-node')!)
  const noteTexts: string[] = []

  for (const label of ['kill', 'kill -9']) {
    await selectScenario(label)
    const command = brightNodes().find((id) => id.startsWith('c-'))!
    const target = brightNodes().find((id) => !id.startsWith('c-'))!
    expect(target).toBe('run')
    const pid = textOf(command).split(' ').pop()
    expect(textOf(target).split(' ')[0]).toBe(pid)
    const arrow = points(pathD(shownIds('[data-path]', 'data-path')[0]))
    expect(onEdge(arrow[arrow.length - 1], nodeBox(target))).toBe(true)
    expect(body).toContain(`\`${textOf(command)}\``)
    const note = diagram().querySelector('[data-note]')!.textContent!
    expect(note).toContain('끝')
    expect(body).toContain(note.split(':')[0])
    noteTexts.push(note)
  }
  expect(noteTexts[0]).not.toBe(noteTexts[1])
  expect(noteTexts[0].split(':')[0]).toBe('TERM')
  expect(noteTexts[1].split(':')[0]).toBe('KILL')

  for (const label of ['nice·renice', 'pstree']) {
    await selectScenario(label)
    expect(diagram().querySelector('[data-note]')!.textContent).not.toContain('끝')
  }
  await selectScenario('nice·renice')
  expect(body).toContain(`\`${textOf('c-renice')}\``)
  await selectScenario('pstree')
  expect(brightNodes()).toContain('pid1')
  const arrow = points(pathD('pstree-arrow'))
  expect(onEdge(arrow[arrow.length - 1], nodeBox('pid1'))).toBe(true)
  expect(body).toContain('PID 1, 곧 init을 맨 위에 두고')
}

describe('ProcessControlDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<ProcessControlDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 가지가 모두 선명하고 화살표·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<ProcessControlDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
    expect(diagram().querySelector('[data-link="b-bash"]')).toHaveAttribute('stroke-dasharray', '4 3')
    expect(diagram().querySelector('[data-link="b-run"]')).not.toHaveAttribute('stroke-dasharray')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 칸·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<ProcessControlDiagram />)
    await expectScenario(scenario, container)
  })

  it('시나리오를 바꾸면 이전 화살표가 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<ProcessControlDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('네 시나리오가 보이는 것(칸·화살표·곁말)이 서로 다르다', () => {
    const keys = expectedScenarios.map(({ nodes, paths, notes }) => JSON.stringify([[...nodes].sort(), paths, notes]))
    expect(new Set(keys).size).toBe(expectedScenarios.length)
  })

  it('노드가 280×192 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<ProcessControlDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 192')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  it('선의 끝점이 노드 변 위에 있고 다른 노드를 지나지 않는다', async () => {
    render(<ProcessControlDiagram />)
    await expectLines()
  })

  it('곁말이 viewBox 안에 있고 노드와 겹치지 않는다', async () => {
    render(<ProcessControlDiagram />)
    await expectNotes(tallBox)
  })

  it('kill과 kill -9는 같은 PID의 프로세스를 가리키고 서로 다른 시그널로 끝내며, nice·pstree는 끝내지 않는다', async () => {
    render(<ProcessControlDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 고른 시나리오가 섞이지 않는다', async () => {
    const { container } = render(<><ProcessControlDiagram /><ProcessControlDiagram /></>)
    const markerIds = Array.from(container.querySelectorAll('marker'), (marker) => marker.id)
    expect(markerIds).toHaveLength(2)
    expect(new Set(markerIds).size).toBe(2)

    const figures = screen.getAllByRole('figure', { name: figureName })
    await act(async () => { await userEvent.click(within(figures[0]).getByRole('button', { name: 'kill' })) })

    expect(within(figures[0]).getByRole('button', { name: 'kill' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(figures[1]).getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(figures[1].querySelectorAll('[data-path]')).toHaveLength(0)
    expect(figures[0].querySelector('[data-path]')!.getAttribute('marker-end')).toBe(`url(#${markerIds[0]})`)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<ProcessControlDiagram />)
    const text = visualsByTopicId[topicId].diagrams['process-control']
    const ids = processControlScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.notes).toEqual(noteLabels)
    expect(text.groups).toBeUndefined()
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
      const scenario = processControlScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: expected.sources })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) {
      expect(conceptIds).toContain(source)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 프로세스를 다루는 명령 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×176 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<ProcessControlDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 176')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드 id 집합과 선 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<ProcessControlDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 192')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallLinks = shownIds('[data-link]', 'data-link').sort()
      const tallPaths: string[] = []
      for (const scenario of expectedScenarios) {
        await selectScenario(scenario.label)
        tallPaths.push(...shownIds('[data-path]', 'data-path'))
      }
      await selectScenario('전체')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 176')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinks)
      const widePaths: string[] = []
      for (const scenario of expectedScenarios) {
        await selectScenario(scenario.label)
        widePaths.push(...shownIds('[data-path]', 'data-path'))
      }
      expect(widePaths.sort()).toEqual(tallPaths.sort())
      expect(tallPaths.sort()).toEqual([...pathIds].sort())
      expect(tallNodes).toEqual([...nodeIds].sort())
    })

    it('노드가 440×176 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<ProcessControlDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 칸·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<ProcessControlDiagram />)
      await expectScenario(scenario, container)
    })

    it('선의 끝점이 노드 변 위에 있고 다른 노드를 지나지 않는다', async () => {
      render(<ProcessControlDiagram />)
      await expectLines()
    })

    it('곁말이 viewBox 안에 있고 노드와 겹치지 않는다', async () => {
      render(<ProcessControlDiagram />)
      await expectNotes(wideBox)
    })

    it('kill과 kill -9는 같은 PID의 프로세스를 가리키고 서로 다른 시그널로 끝내며, nice·pstree는 끝내지 않는다', async () => {
      render(<ProcessControlDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<ProcessControlDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 192')
      await selectScenario('kill -9')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: 'kill -9' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownIds('[data-path]', 'data-path')).toEqual(['kill9-arrow'])
      expect(diagram().querySelector('[data-node="run"] rect')).toHaveAttribute('x', '184')
    })
  })
})
