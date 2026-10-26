import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { StateMachineDiagram, stateMachineScenarios } from './StateMachineDiagram'

const topicId = 'api-gateway-step-functions'
const anchorConceptId = `${topicId}.step-functions-long-running-workflow`
const headConceptId = `${topicId}.step-functions`
const featuresConceptId = `${topicId}.step-functions-features`
const labels = {
  s3: 'S3 버킷', rule: 'EventBridge 규칙',
  'task-a': '태스크', approval: '관리자 승인', 'task-b': '태스크',
  'one-lambda': 'Lambda 함수 하나로 전부 처리',
}
const groupLabels = { machine: '상태 머신' }
const notes = {
  'per-upload': { label: '업로드마다 실행 시작', x: 268, y: 78, anchor: 'end' },
  'on-failure': { label: '실패하면 다시', x: 72, y: 150, anchor: 'start' },
  'up-to-year': { label: '실행은 최대 1년', x: 268, y: 78, anchor: 'end' },
  'limit-15': { label: '15분 제한에 걸림', x: 140, y: 248, anchor: 'middle' },
}
const expectedPaths: Record<string, string> = {
  's3-rule': 'M128 24 H152',
  'rule-task': 'M206 40 V52 H70 V96',
  retry: 'M64 128 V144 H36 V128',
  'task-approval': 'M88 112 H102',
  'approval-task': 'M178 112 H192',
}
const question = '15분을 넘는 여러 단계 작업은 누가 이어 갈까?'
const idleCaption = '장면을 고르면 상태 머신이 단계를 잇고 관리하는 모습을 볼 수 있다.'
const legend = '파랑: AWS 서비스와 상태 머신의 단계. 큰 박스가 상태 머신 하나이고, 맨 아래는 견줘 볼 구성이다.'
const expectedScenarios = [
  {
    id: 'start', label: '업로드로 시작',
    nodes: ['s3', 'rule', 'task-a'],
    paths: ['s3-rule', 'rule-task'], notes: ['per-upload'],
    caption: '업로드 이벤트가 EventBridge로 가고, 상태 머신을 대상으로 둔 규칙이 실행을 시작한다.',
    sources: [anchorConceptId],
  },
  {
    id: 'retry', label: '실패하면 재시도',
    nodes: ['task-a'],
    paths: ['retry'], notes: ['on-failure'],
    caption: '단계마다 실행 상태를 상태 머신이 관리해, 실패한 태스크를 자동으로 다시 시도한다.',
    sources: [headConceptId],
  },
  {
    id: 'approval', label: '관리자 승인',
    nodes: ['task-a', 'approval', 'task-b'],
    paths: ['task-approval', 'approval-task'], notes: [],
    caption: '단계 사이에 관리자 승인을 넣을 수 있다. 같은 흐름을 코드로 짜면 부담이 훨씬 크다.',
    sources: [featuresConceptId],
  },
  {
    id: 'one-lambda', label: 'Lambda 하나로',
    nodes: ['one-lambda'],
    paths: [], notes: ['up-to-year', 'limit-15'],
    caption: '전체가 24시간 걸리면 함수 하나로는 15분 제한에 걸린다. 상태 머신의 실행은 최대 1년이다.',
    sources: [anchorConceptId, headConceptId],
  },
]

function diagram() {
  return screen.getByRole('img', { name: '상태 머신이 잇는 태스크와 관리자 승인' })
}

async function selectScenario(label: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) })
}

function readBox(rect: Element) {
  return {
    id: rect.getAttribute('data-group') ?? rect.parentElement?.getAttribute('data-node') ?? '',
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

describe('StateMachineDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<StateMachineDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 여섯이 모두 선명하고 경로·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<StateMachineDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual(Object.keys(labels).sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·경로·곁말만 보이고 나머지 노드는 흐려진다', async (scenario) => {
    const { container } = render(<StateMachineDiagram />)
    await selectScenario(scenario.label)

    for (const node of diagram().querySelectorAll('[data-node]')) {
      expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
    }
    const paths = Array.from(diagram().querySelectorAll('[data-path]'))
    expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(scenario.paths)
    for (const path of paths) {
      expect(path).toHaveAttribute('d', expectedPaths[path.getAttribute('data-path')!])
      expect(path).toHaveAttribute('stroke-width', '2')
      expect(path).toHaveAttribute('marker-end', `url(#${diagram().querySelector('marker')!.id})`)
      expect(path).toHaveClass('stroke-title')
      expect(path.closest('[opacity]')).toBeNull()
    }
    expect(Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note'))).toEqual(scenario.notes)
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('Lambda 하나로에서는 상태 머신의 단계 셋이, 나머지 장면에서는 Lambda 함수 하나가 흐리다', async () => {
    render(<StateMachineDiagram />)
    await selectScenario('Lambda 하나로')
    for (const id of ['task-a', 'approval', 'task-b']) {
      expect(diagram().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', '0.25')
    }

    for (const { label } of expectedScenarios.filter(({ id }) => id !== 'one-lambda')) {
      await selectScenario(label)
      expect(diagram().querySelector('[data-node="one-lambda"]'), label).toHaveAttribute('opacity', '0.25')
    }
  })

  it('재시도 경로는 실패하면 재시도에서만, 실행 시작 경로는 업로드로 시작에서만 보인다', async () => {
    render(<StateMachineDiagram />)
    const visibleIn: Record<string, string[]> = {
      retry: ['retry'],
      'rule-task': ['start'],
    }
    for (const scenario of expectedScenarios) {
      await selectScenario(scenario.label)
      for (const [pathId, scenarioIds] of Object.entries(visibleIn)) {
        expect(diagram().querySelector(`[data-path="${pathId}"]`) !== null, `${scenario.id}: ${pathId}`).toBe(scenarioIds.includes(scenario.id))
      }
    }
  })

  it('실행 시작 경로는 그룹 라벨 오른쪽으로 내려가 첫 태스크 위 변에 닿는다', async () => {
    render(<StateMachineDiagram />)
    await selectScenario('업로드로 시작')
    const groupLabel = diagram().querySelector('[data-group-label="machine"]')!
    const labelRight = Number(groupLabel.getAttribute('x')) + estimateTextWidth(groupLabel.textContent!, 9)
    const task = readBox(diagram().querySelector('[data-node="task-a"] rect')!)
    const [, x, y] = diagram().querySelector('[data-path="rule-task"]')!.getAttribute('d')!.match(/H(\d+) V(\d+)$/u)!.map(Number)

    expect(x).toBeGreaterThan(labelRight)
    expect(x).toBeGreaterThan(task.x)
    expect(x).toBeLessThan(task.x + task.width)
    expect(y).toBe(task.y)
  })

  it('장면을 바꾸면 이전 경로·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<StateMachineDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(Array.from(diagram().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path'))).toEqual(scenario.paths)
      expect(Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note'))).toEqual(scenario.notes)
    }
    await selectScenario('전체')

    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    for (const { label } of expectedScenarios) expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'false')
  })

  it('관문 5·7: 그룹 하나와 노드 여섯이 280×256 viewBox 안에 있고 단계 셋만 상태 머신 안에 있다', () => {
    render(<StateMachineDiagram />)
    const [x, y, width, height] = diagram().getAttribute('viewBox')!.split(' ').map(Number)
    const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
    const group = boxes.find((box) => box.id === 'machine')!
    const frame = [group.x, group.y, group.width, group.height] as [number, number, number, number]
    const pick = (ids: string[]) => boxes.filter((box) => ids.includes(box.id))

    expect([x, y, width, height]).toEqual([0, 0, 280, 256])
    expect(boxes).toHaveLength(7)
    expect(boxesOutsideViewBox(boxes, [x, y, width, height])).toEqual([])
    expect(boxesOutsideViewBox(pick(['task-a', 'approval', 'task-b']), frame)).toEqual([])
    for (const outsider of pick(['s3', 'rule', 'one-lambda'])) {
      expect(boxesOutsideViewBox([outsider], frame), outsider.id).toHaveLength(1)
    }
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
  })

  it('관문 6: 노드 라벨은 크기 10이고 높이 32 상자 안에 여백 12를 남기며 파랑만 쓴다', () => {
    render(<StateMachineDiagram />)
    for (const [id, label] of Object.entries(labels)) {
      const node = diagram().querySelector(`[data-node="${id}"]`)!
      const text = node.querySelector('text')!
      const rect = node.querySelector('rect')!
      const box = readBox(rect)
      expect(text.textContent).toBe(label)
      expect(text).toHaveAttribute('font-size', '10')
      expect(box.height).toBe(32)
      expect(estimateTextWidth(label, 10) + 12, label).toBeLessThanOrEqual(box.width)
      expect(rect).toHaveClass('stroke-diagram-managed')
    }
    expect(diagram().querySelector('.stroke-diagram-resource, .fill-diagram-resource')).toBeNull()
  })

  it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 가로 범위 안에 있다', async (label) => {
    render(<StateMachineDiagram />)
    await selectScenario(label)
    expect(diagram().querySelectorAll('[data-group]')).toHaveLength(1)
    expect(diagram().querySelectorAll('[data-group-label]')).toHaveLength(1)
    for (const [id, wording] of Object.entries(groupLabels)) {
      const group = diagram().querySelector(`[data-group="${id}"]`)!
      const groupLabel = diagram().querySelector(`[data-group-label="${id}"]`)!
      expect(group.closest('[opacity]')).toBeNull()
      expect(groupLabel.closest('[opacity]')).toBeNull()
      expect(groupLabel.textContent).toBe(wording)
      expect(groupLabel).toHaveAttribute('x', String(Number(group.getAttribute('x')) + 10))
      expect(groupLabel).toHaveAttribute('y', String(Number(group.getAttribute('y')) + 14))
    }
    for (const text of diagram().querySelectorAll('[data-group-label], [data-note]')) {
      expect(text).toHaveAttribute('font-size', '9')
      expect(text).toHaveClass('fill-muted')
      const x = Number(text.getAttribute('x'))
      const width = estimateTextWidth(text.textContent!, 9)
      const anchor = text.getAttribute('text-anchor')
      const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
      expect(left, text.textContent!).toBeGreaterThanOrEqual(0)
      expect(left + width, text.textContent!).toBeLessThanOrEqual(280)
    }
    for (const note of diagram().querySelectorAll('[data-note]')) {
      const expected = notes[note.getAttribute('data-note')! as keyof typeof notes]
      expect(note.textContent).toBe(expected.label)
      expect(note).toHaveAttribute('x', String(expected.x))
      expect(note).toHaveAttribute('y', String(expected.y))
      expect(note).toHaveAttribute('text-anchor', expected.anchor)
      expect(note.closest('[opacity]')).toBeNull()
    }
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구·근거를 JSON에서 읽는다', () => {
    render(<StateMachineDiagram />)
    const text = visualsByTopicId[topicId].diagrams['state-machine']
    const ids = stateMachineScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(['approval', 'one-lambda', 'retry', 'start'])
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual(Object.fromEntries(Object.entries(notes).map(([id, note]) => [id, note.label])))
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([headConceptId, featuresConceptId, anchorConceptId])
    expect(text.label).toBe('Step Functions 상태 머신 도식')
    expect(text.svgLabel).toBe('상태 머신이 잇는 태스크와 관리자 승인')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = stateMachineScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: expected.sources })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(wording.caption.length).toBeLessThanOrEqual(57)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) {
      expect(conceptIds).toContain(source)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 최대 1년 실행 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: 'Step Functions 상태 머신 도식' })

    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(within(figure).queryByRole('heading')).toBeNull()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 경로가 자기 마커를 가리킨다', async () => {
    render(<><StateMachineDiagram /><StateMachineDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: 'Step Functions 상태 머신 도식' })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '업로드로 시작' })) })
      expect(figure.querySelectorAll('[data-path]')).toHaveLength(2)
      for (const path of figure.querySelectorAll('[data-path]')) {
        expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
      }
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  describe('가로형 (768px 이상)', () => {
    const wideNotes = {
      'per-upload': { x: 428, y: 22, anchor: 'end' },
      'on-failure': { x: 248, y: 90, anchor: 'start' },
      'up-to-year': { x: 428, y: 22, anchor: 'end' },
      'limit-15': { x: 316, y: 160, anchor: 'middle' },
    }
    const widePaths: Record<string, string> = {
      's3-rule': 'M64 48 H80',
      'rule-task': 'M180 48 H204',
      retry: 'M240 64 V80 H216 V64',
      'task-approval': 'M260 48 H276',
      'approval-task': 'M352 48 H368',
    }

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

    async function collectPathIds() {
      const found = new Set<string>()
      for (const { label } of expectedScenarios) {
        await selectScenario(label)
        for (const path of diagram().querySelectorAll('[data-path]')) found.add(path.getAttribute('data-path')!)
      }
      return [...found].sort()
    }

    // 직교 경로를 선분 목록으로 편다. M/H/V만 나온다.
    function segments(d: string) {
      const result: { x1: number, y1: number, x2: number, y2: number }[] = []
      let x = 0
      let y = 0
      for (const [, command, first, second] of d.matchAll(/([MHV])(-?\d+)(?: (-?\d+))?/gu)) {
        if (command === 'M') { x = Number(first); y = Number(second); continue }
        const next = command === 'H' ? { x: Number(first), y } : { x, y: Number(first) }
        result.push({ x1: x, y1: y, x2: next.x, y2: next.y })
        x = next.x
        y = next.y
      }
      return result
    }

    // 글자가 차지하는 상자. 높이는 글자 크기 9를 기준선 위로 잡는다.
    function textBox(text: Element) {
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

    function nodeBox(id: string) {
      return readBox(diagram().querySelector(`[data-node="${id}"] rect`)!)
    }

    function machineBox() {
      return readBox(diagram().querySelector('[data-group="machine"]')!)
    }

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×168 viewBox를 w-full 래퍼 하나로 그리고 SVG 속성과 화살표를 유지한다', () => {
      render(<StateMachineDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 168')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·그룹 id 집합과 시나리오로 나타나는 경로 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<StateMachineDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 256')
      const tallNodes = ids('[data-node]', 'data-node')
      const tallGroups = ids('[data-group]', 'data-group')
      const tallPaths = await collectPathIds()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 168')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(tallNodes).toEqual(Object.keys(labels).sort())
      expect(ids('[data-group]', 'data-group')).toEqual(tallGroups)
      expect(tallGroups).toEqual(Object.keys(groupLabels).sort())
      expect(tallPaths).toHaveLength(5)
      expect(await collectPathIds()).toEqual(tallPaths)
    })

    it('그룹 하나와 노드 여섯의 모든 rect가 440×168 viewBox 안에 있다', () => {
      render(<StateMachineDiagram />)
      const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)

      expect(boxes).toHaveLength(7)
      expect(boxesOutsideViewBox(boxes, [0, 0, 440, 168])).toEqual([])
    })

    it('노드 라벨은 크기 10과 여백 12로, 그룹 라벨은 크기 9로 자기 박스 오른쪽 끝 안에 들어간다', () => {
      render(<StateMachineDiagram />)

      for (const [id, label] of Object.entries(labels)) {
        const node = diagram().querySelector(`[data-node="${id}"]`)!
        const rect = node.querySelector('rect')!
        const box = readBox(rect)
        expect(node.querySelector('text')!.textContent).toBe(label)
        expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
        expect(box.height).toBe(32)
        expect(estimateTextWidth(label, 10) + 12, label).toBeLessThanOrEqual(box.width)
        expect(rect).toHaveClass('stroke-diagram-managed')
      }
      expect(diagram().querySelector('.stroke-diagram-resource, .fill-diagram-resource')).toBeNull()

      for (const [id, wording] of Object.entries(groupLabels)) {
        const box = readBox(diagram().querySelector(`[data-group="${id}"]`)!)
        const groupLabel = diagram().querySelector(`[data-group-label="${id}"]`)!
        expect(groupLabel.textContent).toBe(wording)
        expect(groupLabel).toHaveAttribute('font-size', '9')
        const x = Number(groupLabel.getAttribute('x'))
        expect(x, wording).toBe(box.x + 10)
        expect(Number(groupLabel.getAttribute('y')), wording).toBe(box.y + 14)
        expect(x + estimateTextWidth(wording, 9), wording).toBeLessThanOrEqual(box.x + box.width)
      }
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·경로·곁말·캡션을 보이고 곁말은 viewBox 안에서 노드·그룹 라벨과 겹치지 않는다', async (scenario) => {
      const { container } = render(<StateMachineDiagram />)
      await selectScenario(scenario.label)

      for (const node of diagram().querySelectorAll('[data-node]')) {
        expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
      }
      for (const group of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(group.closest('[opacity]')).toBeNull()
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(scenario.paths)
      for (const path of paths) {
        expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
        expect(path).toHaveAttribute('stroke-width', '2')
        expect(path).toHaveAttribute('marker-end', `url(#${diagram().querySelector('marker')!.id})`)
        expect(path).toHaveClass('stroke-title')
        expect(path.closest('[opacity]')).toBeNull()
      }
      const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
      const groupLabelBox = textBox(diagram().querySelector('[data-group-label="machine"]')!)
      const shownNotes = Array.from(diagram().querySelectorAll('[data-note]'))
      expect(shownNotes.map((note) => note.getAttribute('data-note'))).toEqual(scenario.notes)
      for (const note of shownNotes) {
        const id = note.getAttribute('data-note')! as keyof typeof wideNotes
        expect(note.textContent).toBe(notes[id].label)
        expect(note).toHaveAttribute('x', String(wideNotes[id].x))
        expect(note).toHaveAttribute('y', String(wideNotes[id].y))
        expect(note).toHaveAttribute('text-anchor', wideNotes[id].anchor)
        expect(note).toHaveAttribute('font-size', '9')
        expect(note).toHaveClass('fill-muted')
        expect(note.closest('[opacity]')).toBeNull()
        const box = textBox(note)
        expect(boxesOutsideViewBox([box], [0, 0, 440, 168]), id).toEqual([])
        expect(overlaps(box, groupLabelBox), `${id} ↔ 그룹 라벨`).toBe(false)
        for (const node of nodeBoxes) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
      }
      expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
      expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
      expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
    })

    it('실행 시작 경로는 수평선 하나로 상태 머신 왼쪽 변을 지나 첫 태스크 왼쪽 변에 닿고 그룹 라벨과 겹치지 않는다', async () => {
      render(<StateMachineDiagram />)
      await selectScenario('업로드로 시작')
      const machine = machineBox()
      const task = nodeBox('task-a')
      const groupLabelBox = textBox(diagram().querySelector('[data-group-label="machine"]')!)
      const list = segments(diagram().querySelector('[data-path="rule-task"]')!.getAttribute('d')!)

      expect(list).toHaveLength(1)
      const [{ x1, y1, x2, y2 }] = list
      expect(y2).toBe(y1)
      expect(y1).toBeGreaterThan(machine.y)
      expect(y1).toBeLessThan(machine.y + machine.height)
      expect(x1).toBeLessThan(machine.x)
      expect(x2).toBeGreaterThan(machine.x)
      expect(x2).toBe(task.x)
      expect(y1).toBeGreaterThan(task.y)
      expect(y1).toBeLessThan(task.y + task.height)
      const line = { id: 'rule-task', x: Math.min(x1, x2), y: y1, width: Math.abs(x2 - x1), height: 0 }
      expect(line.y < groupLabelBox.y || line.y > groupLabelBox.y + groupLabelBox.height
        || line.x + line.width < groupLabelBox.x || line.x > groupLabelBox.x + groupLabelBox.width).toBe(true)
    })

    it('단계 셋만 상태 머신 안에 있고 재시도 고리는 상태 머신 안에 머문다', async () => {
      render(<StateMachineDiagram />)
      const machine = machineBox()
      const frame: [number, number, number, number] = [machine.x, machine.y, machine.width, machine.height]

      for (const id of ['task-a', 'approval', 'task-b']) expect(boxesOutsideViewBox([nodeBox(id)], frame), id).toEqual([])
      for (const id of ['s3', 'rule', 'one-lambda']) expect(boxesOutsideViewBox([nodeBox(id)], frame), id).toHaveLength(1)

      await selectScenario('실패하면 재시도')
      for (const { x1, y1, x2, y2 } of segments(diagram().querySelector('[data-path="retry"]')!.getAttribute('d')!)) {
        for (const [x, y] of [[x1, y1], [x2, y2]]) {
          expect(x, `(${x},${y})`).toBeGreaterThan(machine.x)
          expect(x, `(${x},${y})`).toBeLessThan(machine.x + machine.width)
          expect(y, `(${x},${y})`).toBeGreaterThan(machine.y)
          expect(y, `(${x},${y})`).toBeLessThan(machine.y + machine.height)
        }
      }
    })

    it('경로 양 끝이 출발 노드와 도착 노드의 변에 닿는다', async () => {
      render(<StateMachineDiagram />)
      const ends: Record<string, [string, string, string]> = {
        's3-rule': ['업로드로 시작', 's3', 'rule'],
        'rule-task': ['업로드로 시작', 'rule', 'task-a'],
        retry: ['실패하면 재시도', 'task-a', 'task-a'],
        'task-approval': ['관리자 승인', 'task-a', 'approval'],
        'approval-task': ['관리자 승인', 'approval', 'task-b'],
      }
      const onEdge = (x: number, y: number, id: string) => {
        const { x: left, y: top, width, height } = nodeBox(id)
        const withinX = x >= left && x <= left + width
        const withinY = y >= top && y <= top + height
        return ((x === left || x === left + width) && withinY) || ((y === top || y === top + height) && withinX)
      }

      for (const [pathId, [label, from, to]] of Object.entries(ends)) {
        await selectScenario(label)
        const list = segments(diagram().querySelector(`[data-path="${pathId}"]`)!.getAttribute('d')!)
        expect(onEdge(list[0].x1, list[0].y1, from), `${pathId} 시작`).toBe(true)
        expect(onEdge(list[list.length - 1].x2, list[list.length - 1].y2, to), `${pathId} 끝`).toBe(true)
      }
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<StateMachineDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 256')
      await selectScenario('업로드로 시작')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '업로드로 시작' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['s3-rule', 'rule-task'])
      for (const path of paths) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note'))).toEqual(['per-upload'])
    })
  })
})
