import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { DriftScopeDiagram, driftScopeScenarios } from './DriftScopeDiagram'

const labels = {
  template: '템플릿', 'stack-a': '리소스', 'stack-b': '리소스',
  'team-a': '팀 A의 리소스', 'team-b': '팀 B의 리소스',
  drift: '드리프트 감지', config: 'AWS Config',
}
const groupLabels = { account: '한 계정', stack: '스택', outside: '스택 밖' }
const notes = {
  'not-seen': { label: '보지 못함', x: 260, y: 94 },
  'all-resources': { label: '모든 지원 리소스', x: 268, y: 70 },
}
const expectedPaths: Record<string, string> = {
  'template-stack': 'M74 40 V102',
  'drift-stack': 'M74 236 V188',
  'config-stack': 'M180 236 V216 H104 V188',
  'config-outside': 'M206 236 V188',
}
const question = '설정이 바뀐 리소스를 어디까지 잡아낼까?'
const idleCaption = '기능을 고르면 설정이 바뀐 리소스를 어디까지 살피는지 볼 수 있다.'
const legend = '파랑: 설정 변경을 살피는 기능 · 청록: 계정의 리소스 · 회색: 템플릿 파일. 위 화살표는 템플릿으로 배포한 것, 아래 화살표는 살피는 범위다.'
const expectedScenarios = [
  {
    id: 'drift', label: '드리프트 감지',
    nodes: ['template', 'stack-a', 'stack-b', 'drift'],
    paths: ['template-stack', 'drift-stack'], notes: ['not-seen'],
    caption: '스택으로 만든 리소스만 템플릿과 비교한다. 팀이 직접 만든 스택 밖 리소스는 빠진다.',
    sources: ['governance-iac.cloudformation-drift-detection', 'governance-iac.cloudformation'],
  },
  {
    id: 'config', label: 'AWS Config',
    nodes: ['stack-a', 'stack-b', 'team-a', 'team-b', 'config'],
    paths: ['config-stack', 'config-outside'], notes: ['all-resources'],
    caption: '스택 안팎을 가리지 않고 계정의 모든 지원 리소스에서 설정 변경을 기록한다.',
    sources: ['governance-iac.cloudformation-drift-detection', 'governance-iac.service-catalog'],
  },
]

function diagram() {
  return screen.getByRole('img', { name: '드리프트 감지와 AWS Config가 살피는 범위' })
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

describe('DriftScopeDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<DriftScopeDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 일곱이 모두 선명하고 경로·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<DriftScopeDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual(Object.keys(labels).sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·경로·곁말만 보이고 나머지 노드는 흐려진다', async (scenario) => {
    const { container } = render(<DriftScopeDiagram />)
    await selectScenario(scenario.label)

    for (const node of diagram().querySelectorAll('[data-node]')) {
      expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
    }
    const paths = Array.from(diagram().querySelectorAll('[data-path]'))
    expect(paths.map((path) => path.getAttribute('data-path')).sort()).toEqual([...scenario.paths].sort())
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

  it('기능을 바꾸면 이전 범위의 경로·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<DriftScopeDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(Array.from(diagram().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')).sort()).toEqual([...scenario.paths].sort())
      expect(Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note'))).toEqual(scenario.notes)
    }
    await selectScenario('전체')

    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    for (const { label } of expectedScenarios) expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'false')
  })

  it('관문 5·7: 그룹 셋과 노드 일곱이 280×276 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<DriftScopeDiagram />)
    const [x, y, width, height] = diagram().getAttribute('viewBox')!.split(' ').map(Number)
    const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)

    expect([x, y, width, height]).toEqual([0, 0, 280, 276])
    expect(boxes).toHaveLength(10)
    expect(boxesOutsideViewBox(boxes, [x, y, width, height])).toEqual([])
    for (const [groupId, memberIds] of Object.entries({ account: ['stack', 'outside'], stack: ['stack-a', 'stack-b'], outside: ['team-a', 'team-b'] })) {
      const group = boxes.find(({ id }) => id === groupId)!
      expect(boxesOutsideViewBox(boxes.filter(({ id }) => memberIds.includes(id)), [group.x, group.y, group.width, group.height])).toEqual([])
    }
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
  })

  it('관문 6: 노드 라벨은 크기 10이고 높이 32 상자 안에 여백 12를 남기며 계층별 색을 쓴다', () => {
    render(<DriftScopeDiagram />)
    for (const [id, label] of Object.entries(labels)) {
      const node = diagram().querySelector(`[data-node="${id}"]`)!
      const text = node.querySelector('text')!
      const rect = node.querySelector('rect')!
      const box = readBox(rect)
      expect(text.textContent).toBe(label)
      expect(text).toHaveAttribute('font-size', '10')
      expect(box.height).toBe(32)
      expect(estimateTextWidth(label, 10) + 12, label).toBeLessThanOrEqual(box.width)
      expect(rect).toHaveClass(id === 'template' ? 'stroke-disabled' : ['drift', 'config'].includes(id) ? 'stroke-diagram-managed' : 'stroke-diagram-resource')
    }
  })

  it.each(['전체', '드리프트 감지', 'AWS Config'])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 가로 범위 안에 있다', async (label) => {
    render(<DriftScopeDiagram />)
    await selectScenario(label)
    expect(diagram().querySelectorAll('[data-group]')).toHaveLength(3)
    expect(diagram().querySelectorAll('[data-group-label]')).toHaveLength(3)
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
      const left = text.getAttribute('text-anchor') === 'end' ? x - width : x
      expect(left).toBeGreaterThanOrEqual(0)
      expect(left + width).toBeLessThanOrEqual(280)
    }
    for (const note of diagram().querySelectorAll('[data-note]')) {
      const expected = notes[note.getAttribute('data-note')! as keyof typeof notes]
      expect(note.textContent).toBe(expected.label)
      expect(note).toHaveAttribute('x', String(expected.x))
      expect(note).toHaveAttribute('y', String(expected.y))
      expect(note).toHaveAttribute('text-anchor', 'end')
      expect(note.closest('[opacity]')).toBeNull()
    }
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구·근거를 JSON에서 읽는다', () => {
    render(<DriftScopeDiagram />)
    const text = visualsByTopicId['governance-iac'].diagrams['drift-scope']
    const ids = driftScopeScenarios.map(({ id }) => id).sort()

    expect(ids).toEqual(['config', 'drift'])
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual(Object.fromEntries(Object.entries(notes).map(([id, note]) => [id, note.label])))
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual(['governance-iac.cloudformation', 'governance-iac.cloudformation-drift-detection', 'governance-iac.service-catalog'])
    expect(text.label).toBe('드리프트 감지와 AWS Config 범위 도식')
    expect(text.svgLabel).toBe('드리프트 감지와 AWS Config가 살피는 범위')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', '드리프트 감지', 'AWS Config'])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = driftScopeScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: expected.sources })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(wording.caption.length).toBeLessThanOrEqual(50)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 드리프트 감지 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === 'governance-iac')!.concepts.find(({ id }) => id === 'governance-iac.cloudformation-drift-detection')!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: '드리프트 감지와 AWS Config 범위 도식' })

    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.join('').replace(/\*\*/g, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(within(figure).queryByRole('heading')).toBeNull()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 경로가 자기 마커를 가리킨다', async () => {
    render(<><DriftScopeDiagram /><DriftScopeDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: '드리프트 감지와 AWS Config 범위 도식' })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'AWS Config' })) })
      expect(figure.querySelectorAll('[data-path]')).toHaveLength(2)
      for (const path of figure.querySelectorAll('[data-path]')) {
        expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
      }
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  describe('가로형 (768px 이상)', () => {
    const wideNotes = {
      'not-seen': { x: 282, y: 118 },
      'all-resources': { x: 292, y: 22 },
    }
    const widePaths: Record<string, string> = {
      'template-stack': 'M72 70 H106',
      'drift-stack': 'M316 40 H292',
      'config-stack': 'M316 104 H304 V80 H292',
      'config-outside': 'M316 120 H292',
    }
    const resources = ['stack-a', 'stack-b', 'team-a', 'team-b']

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

    // 경계에 닿는 것까지 겹침으로 센다.
    function touches(a: SvgBox, b: SvgBox) {
      return a.x <= b.x + b.width && b.x <= a.x + a.width && a.y <= b.y + b.height && b.y <= a.y + a.height
    }

    function overlaps(a: SvgBox, b: SvgBox) {
      return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
    }

    function nodeBox(id: string) {
      return readBox(diagram().querySelector(`[data-node="${id}"] rect`)!)
    }

    function groupBox(id: string) {
      return readBox(diagram().querySelector(`[data-group="${id}"]`)!)
    }

    function frameOf(id: string) {
      const group = groupBox(id)
      return [group.x, group.y, group.width, group.height] as [number, number, number, number]
    }

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×184 viewBox를 w-full 래퍼 하나로 그리고 SVG 속성과 화살표를 유지한다', () => {
      render(<DriftScopeDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 184')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·그룹 id 집합과 시나리오로 나타나는 경로 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<DriftScopeDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 276')
      const tallNodes = ids('[data-node]', 'data-node')
      const tallGroups = ids('[data-group]', 'data-group')
      const tallPaths = await collectPathIds()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 184')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(tallNodes).toEqual(Object.keys(labels).sort())
      expect(ids('[data-group]', 'data-group')).toEqual(tallGroups)
      expect(tallGroups).toEqual(Object.keys(groupLabels).sort())
      expect(tallPaths).toEqual(Object.keys(expectedPaths).sort())
      expect(await collectPathIds()).toEqual(tallPaths)
    })

    it('그룹 셋과 노드 일곱의 모든 rect가 440×184 viewBox 안에 있다', () => {
      render(<DriftScopeDiagram />)
      const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)

      expect(boxes).toHaveLength(10)
      expect(boxesOutsideViewBox(boxes, [0, 0, 440, 184])).toEqual([])
    })

    it('노드 라벨은 크기 10과 여백 12로, 그룹 라벨은 크기 9로 자기 박스 오른쪽 끝 안에 들어간다', () => {
      render(<DriftScopeDiagram />)

      for (const [id, label] of Object.entries(labels)) {
        const node = diagram().querySelector(`[data-node="${id}"]`)!
        const rect = node.querySelector('rect')!
        const box = readBox(rect)
        expect(node.querySelector('text')!.textContent).toBe(label)
        expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
        expect(box.height).toBe(32)
        expect(estimateTextWidth(label, 10) + 12, label).toBeLessThanOrEqual(box.width)
        expect(rect).toHaveClass(id === 'template' ? 'stroke-disabled' : ['drift', 'config'].includes(id) ? 'stroke-diagram-managed' : 'stroke-diagram-resource')
      }

      for (const [id, wording] of Object.entries(groupLabels)) {
        const box = groupBox(id)
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
      const { container } = render(<DriftScopeDiagram />)
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
      const groupLabelBoxes = Array.from(diagram().querySelectorAll('[data-group-label]'), textBox)
      const shownNotes = Array.from(diagram().querySelectorAll('[data-note]'))
      expect(shownNotes.map((note) => note.getAttribute('data-note'))).toEqual(scenario.notes)
      for (const note of shownNotes) {
        const id = note.getAttribute('data-note')! as keyof typeof wideNotes
        expect(note.textContent).toBe(notes[id].label)
        expect(note).toHaveAttribute('x', String(wideNotes[id].x))
        expect(note).toHaveAttribute('y', String(wideNotes[id].y))
        expect(note).toHaveAttribute('text-anchor', 'end')
        expect(note).toHaveAttribute('font-size', '9')
        expect(note).toHaveClass('fill-muted')
        expect(note.closest('[opacity]')).toBeNull()
        const box = textBox(note)
        expect(boxesOutsideViewBox([box], [0, 0, 440, 184]), id).toEqual([])
        for (const label of groupLabelBoxes) expect(overlaps(box, label), `${id} ↔ ${label.id}`).toBe(false)
        for (const node of nodeBoxes) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
      }
      expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
      expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
      expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
    })

    it('살피는 경로 셋은 살피는 노드의 왼쪽 변에서 나와 리소스 노드가 아니라 자기 그룹의 오른쪽 변에서 끝난다', async () => {
      render(<DriftScopeDiagram />)
      const watches: Record<string, [string, string, string]> = {
        'drift-stack': ['드리프트 감지', 'drift', 'stack'],
        'config-stack': ['AWS Config', 'config', 'stack'],
        'config-outside': ['AWS Config', 'config', 'outside'],
      }

      for (const [pathId, [label, from, groupId]] of Object.entries(watches)) {
        await selectScenario(label)
        const list = segments(diagram().querySelector(`[data-path="${pathId}"]`)!.getAttribute('d')!)
        const first = list[0]
        const last = list[list.length - 1]
        const source = nodeBox(from)
        const group = groupBox(groupId)

        expect(first.x1, `${pathId} 시작`).toBe(source.x)
        expect(first.y1, `${pathId} 시작`).toBeGreaterThan(source.y)
        expect(first.y1, `${pathId} 시작`).toBeLessThan(source.y + source.height)
        expect(last.y2, `${pathId} 끝`).toBe(last.y1)
        expect(last.x2, `${pathId} 끝`).toBeLessThan(last.x1)
        expect(last.x2, `${pathId} 끝`).toBe(group.x + group.width)
        expect(last.y2, `${pathId} 끝`).toBeGreaterThan(group.y)
        expect(last.y2, `${pathId} 끝`).toBeLessThan(group.y + group.height)
        for (const { x1, y1, x2, y2 } of list) {
          const line = { id: `(${x1},${y1})-(${x2},${y2})`, x: Math.min(x1, x2), y: Math.min(y1, y2), width: Math.abs(x2 - x1), height: Math.abs(y2 - y1) }
          for (const id of resources) expect(touches(line, nodeBox(id)), `${pathId} ${line.id} ↔ ${id}`).toBe(false)
        }
      }
    })

    it('배포 경로는 템플릿 오른쪽 변에서 나와 스택 안 리소스의 왼쪽 변에 닿는다', async () => {
      render(<DriftScopeDiagram />)
      await selectScenario('드리프트 감지')
      const list = segments(diagram().querySelector('[data-path="template-stack"]')!.getAttribute('d')!)
      const template = nodeBox('template')
      const target = nodeBox('stack-a')
      const last = list[list.length - 1]

      expect(list[0].x1).toBe(template.x + template.width)
      expect(list[0].y1).toBeGreaterThan(template.y)
      expect(list[0].y1).toBeLessThan(template.y + template.height)
      expect(last.x2).toBe(target.x)
      expect(last.y2).toBeGreaterThan(target.y)
      expect(last.y2).toBeLessThan(target.y + target.height)
    })

    it('템플릿·드리프트 감지·AWS Config는 계정 박스 밖이고 리소스 넷은 자기 그룹 안이다', () => {
      render(<DriftScopeDiagram />)
      const account = groupBox('account')

      for (const id of ['template', 'drift', 'config']) {
        expect(overlaps(nodeBox(id), account), id).toBe(false)
      }
      expect(boxesOutsideViewBox([groupBox('stack'), groupBox('outside')], frameOf('account'))).toEqual([])
      expect(overlaps(groupBox('stack'), groupBox('outside'))).toBe(false)
      for (const [groupId, memberIds] of Object.entries({ stack: ['stack-a', 'stack-b'], outside: ['team-a', 'team-b'] })) {
        expect(boxesOutsideViewBox(memberIds.map(nodeBox), frameOf(groupId)), groupId).toEqual([])
      }
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<DriftScopeDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 276')
      await selectScenario('AWS Config')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: 'AWS Config' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['config-stack', 'config-outside'])
      for (const path of paths) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note'))).toEqual(['all-resources'])
    })
  })
})
