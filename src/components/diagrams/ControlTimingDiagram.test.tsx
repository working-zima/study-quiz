import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ControlTimingDiagram, controlTimingScenarios } from './ControlTimingDiagram'

const labels = {
  request: '규칙을 어기는 배포', preventive: '사전 예방적 제어', reject: '스택 작업 거부',
  resource: '규정에 어긋난 리소스', detective: '탐지 제어',
}
const groupLabels = { 'deploy-time': '배포 시점', after: '만들어진 뒤' }
const notes = {
  'not-created': { label: '생기지 않음', x: 70 },
  'report-only': { label: '찾아서 보고 · 지우지 않음', x: 210 },
  'exists-until-fixed': { label: '고치기 전까지 존재', x: 70 },
  'auto-fix': { label: '탐지 뒤 자동 수정', x: 210 },
}
const expectedPaths: Record<string, string> = {
  'request-preventive': 'M110 40 V80',
  'preventive-reject': 'M128 96 H152',
  'request-resource': 'M140 40 V132 H70 V168',
  'detective-resource': 'M152 184 H128',
}
const question = '규칙을 어기는 리소스는 언제 걸러질까?'
const idleCaption = '제어를 고르면 규칙을 어기는 배포가 어느 시점에 걸러지는지 볼 수 있다.'
const legend = '파랑: Control Tower의 제어 · 청록: 배포로 생기는 리소스 · 회색: 배포 요청과 거부. 위에서 내려가는 화살표는 배포가 지나가는 길, 탐지 제어의 화살표는 찾아내는 대상이다.'
const sourceConceptId = 'governance-iac.control-tower-controls'
const expectedScenarios = [
  {
    id: 'preventive', label: '사전 예방적 제어',
    nodes: ['request', 'preventive', 'reject'],
    paths: ['request-preventive', 'preventive-reject'], notes: ['not-created'],
    caption: '배포 시점에 템플릿을 평가해 위반 스택 작업을 거부한다. 리소스가 아예 생기지 않는다.',
  },
  {
    id: 'detective', label: '탐지 제어',
    nodes: ['request', 'resource', 'detective'],
    paths: ['request-resource', 'detective-resource'], notes: ['report-only'],
    caption: '이미 만들어진 리소스에서 규정 미준수를 찾아 보고한다. 찾은 것을 지우지는 않는다.',
  },
  {
    id: 'auto-fix', label: '탐지 후 자동 수정',
    nodes: ['request', 'resource', 'detective'],
    paths: ['request-resource', 'detective-resource'], notes: ['exists-until-fixed', 'auto-fix'],
    caption: '탐지한 뒤 자동으로 고치게 엮어도 고치기 전까지 위반 리소스가 존재한다. 방지가 아니다.',
  },
]

function diagram() {
  return screen.getByRole('img', { name: '사전 예방적 제어와 탐지 제어가 작동하는 시점' })
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

describe('ControlTimingDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<ControlTimingDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 다섯이 모두 선명하고 경로·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<ControlTimingDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual(Object.keys(labels).sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·경로·곁말만 보이고 나머지 노드는 흐려진다', async (scenario) => {
    const { container } = render(<ControlTimingDiagram />)
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

  it('제어를 바꾸면 이전 경로·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<ControlTimingDiagram />)
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

  it('관문 5·7: 그룹 둘과 노드 다섯이 280×240 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<ControlTimingDiagram />)
    const [x, y, width, height] = diagram().getAttribute('viewBox')!.split(' ').map(Number)
    const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)

    expect([x, y, width, height]).toEqual([0, 0, 280, 240])
    expect(boxes).toHaveLength(7)
    expect(boxesOutsideViewBox(boxes, [x, y, width, height])).toEqual([])
    for (const [groupId, memberIds] of Object.entries({ 'deploy-time': ['preventive', 'reject'], after: ['resource', 'detective'] })) {
      const group = boxes.find(({ id }) => id === groupId)!
      expect(boxesOutsideViewBox(boxes.filter(({ id }) => memberIds.includes(id)), [group.x, group.y, group.width, group.height])).toEqual([])
    }
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
  })

  it('관문 6: 노드 라벨은 크기 10이고 높이 32 상자 안에 여백 12를 남기며 계층별 색을 쓴다', () => {
    render(<ControlTimingDiagram />)
    for (const [id, label] of Object.entries(labels)) {
      const node = diagram().querySelector(`[data-node="${id}"]`)!
      const text = node.querySelector('text')!
      const rect = node.querySelector('rect')!
      const box = readBox(rect)
      expect(text.textContent).toBe(label)
      expect(text).toHaveAttribute('font-size', '10')
      expect(box.height).toBe(32)
      expect(estimateTextWidth(label, 10) + 12, label).toBeLessThanOrEqual(box.width)
      expect(rect).toHaveClass(['request', 'reject'].includes(id) ? 'stroke-disabled' : id === 'resource' ? 'stroke-diagram-resource' : 'stroke-diagram-managed')
    }
  })

  it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 가로 범위 안에 있다', async (label) => {
    render(<ControlTimingDiagram />)
    await selectScenario(label)
    expect(diagram().querySelectorAll('[data-group]')).toHaveLength(2)
    expect(diagram().querySelectorAll('[data-group-label]')).toHaveLength(2)
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
      const left = text.getAttribute('text-anchor') === 'middle' ? x - width / 2 : x
      expect(left).toBeGreaterThanOrEqual(0)
      expect(left + width).toBeLessThanOrEqual(280)
    }
    for (const note of diagram().querySelectorAll('[data-note]')) {
      const expected = notes[note.getAttribute('data-note')! as keyof typeof notes]
      expect(note.textContent).toBe(expected.label)
      expect(note).toHaveAttribute('x', String(expected.x))
      expect(note).toHaveAttribute('y', '218')
      expect(note).toHaveAttribute('text-anchor', 'middle')
      expect(note.closest('[opacity]')).toBeNull()
    }
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구·근거를 JSON에서 읽는다', () => {
    render(<ControlTimingDiagram />)
    const text = visualsByTopicId['governance-iac'].diagrams['control-timing']
    const ids = controlTimingScenarios.map(({ id }) => id).sort()

    expect(ids).toEqual(['auto-fix', 'detective', 'preventive'])
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual(Object.fromEntries(Object.entries(notes).map(([id, note]) => [id, note.label])))
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([sourceConceptId])
    expect(text.label).toBe('Control Tower 제어 시점 도식')
    expect(text.svgLabel).toBe('사전 예방적 제어와 탐지 제어가 작동하는 시점')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = controlTimingScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [sourceConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(wording.caption.length).toBeLessThanOrEqual(50)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 Control Tower 제어 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === 'governance-iac')!.concepts.find(({ id }) => id === sourceConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: 'Control Tower 제어 시점 도식' })

    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    // 목록 항목의 `- ` 표지는 화면에 나오지 않는다(ADR-046).
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*/g, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(within(figure).queryByRole('heading')).toBeNull()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 경로가 자기 마커를 가리킨다', async () => {
    render(<><ControlTimingDiagram /><ControlTimingDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: 'Control Tower 제어 시점 도식' })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '탐지 제어' })) })
      expect(figure.querySelectorAll('[data-path]')).toHaveLength(2)
      for (const path of figure.querySelectorAll('[data-path]')) {
        expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
      }
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  describe('가로형 (768px 이상)', () => {
    const wideNotes = {
      'not-created': { x: 196, y: 160 },
      'report-only': { x: 322, y: 160 },
      'exists-until-fixed': { x: 196, y: 160 },
      'auto-fix': { x: 322, y: 160 },
    }
    const widePaths: Record<string, string> = {
      'request-preventive': 'M60 72 V48 H136',
      'preventive-reject': 'M256 48 H272',
      'request-resource': 'M60 104 V128 H136',
      'detective-resource': 'M272 128 H256',
    }
    const members = { 'deploy-time': ['preventive', 'reject'], after: ['resource', 'detective'] }

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
      render(<ControlTimingDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 184')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·그룹 id 집합과 시나리오로 나타나는 경로 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<ControlTimingDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 240')
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

    it('그룹 둘과 노드 다섯의 모든 rect가 440×184 viewBox 안에 있다', () => {
      render(<ControlTimingDiagram />)
      const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)

      expect(boxes).toHaveLength(7)
      expect(boxesOutsideViewBox(boxes, [0, 0, 440, 184])).toEqual([])
    })

    it('노드 라벨은 크기 10과 여백 12로, 그룹 라벨은 크기 9로 자기 박스 오른쪽 끝 안에 들어간다', () => {
      render(<ControlTimingDiagram />)

      for (const [id, label] of Object.entries(labels)) {
        const node = diagram().querySelector(`[data-node="${id}"]`)!
        const rect = node.querySelector('rect')!
        const box = readBox(rect)
        expect(node.querySelector('text')!.textContent).toBe(label)
        expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
        expect(box.height).toBe(32)
        expect(estimateTextWidth(label, 10) + 12, label).toBeLessThanOrEqual(box.width)
        expect(rect).toHaveClass(['request', 'reject'].includes(id) ? 'stroke-disabled' : id === 'resource' ? 'stroke-diagram-resource' : 'stroke-diagram-managed')
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

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·경로·곁말·캡션을 보이고 곁말은 만들어진 뒤 안에서 노드·그룹 라벨과 겹치지 않는다', async (scenario) => {
      const { container } = render(<ControlTimingDiagram />)
      await selectScenario(scenario.label)

      for (const node of diagram().querySelectorAll('[data-node]')) {
        expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
      }
      for (const group of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(group.closest('[opacity]')).toBeNull()
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path')).sort()).toEqual([...scenario.paths].sort())
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
        expect(note).toHaveAttribute('text-anchor', 'middle')
        expect(note).toHaveAttribute('font-size', '9')
        expect(note).toHaveClass('fill-muted')
        expect(note.closest('[opacity]')).toBeNull()
        const box = textBox(note)
        expect(boxesOutsideViewBox([box], frameOf('after')), id).toEqual([])
        for (const label of groupLabelBoxes) expect(overlaps(box, label), `${id} ↔ ${label.id}`).toBe(false)
        for (const node of nodeBoxes) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
      }
      const shownBoxes = shownNotes.map(textBox)
      for (const [index, box] of shownBoxes.entries()) {
        for (const other of shownBoxes.slice(index + 1)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
      }
      expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
      expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
      expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
    })

    it('두 시간대는 위아래로 겹치지 않고 노드는 자기 시간대 안에, 배포는 두 시간대 밖 왼쪽에 있다', () => {
      render(<ControlTimingDiagram />)
      const deployTime = groupBox('deploy-time')
      const after = groupBox('after')
      const request = nodeBox('request')

      expect(deployTime.y + deployTime.height).toBeLessThan(after.y)
      for (const [groupId, memberIds] of Object.entries(members)) {
        expect(boxesOutsideViewBox(memberIds.map(nodeBox), frameOf(groupId)), groupId).toEqual([])
      }
      for (const group of [deployTime, after]) {
        expect(overlaps(request, group), group.id).toBe(false)
        expect(request.x + request.width, group.id).toBeLessThan(group.x)
      }
    })

    it('배포에서 나가는 경로는 배포 노드의 위·아래 변에서 나와 각 시간대 첫 노드의 왼쪽 변에 닿는다', async () => {
      render(<ControlTimingDiagram />)
      const starts: Record<string, [string, string, 'top' | 'bottom']> = {
        'request-preventive': ['사전 예방적 제어', 'preventive', 'top'],
        'request-resource': ['탐지 제어', 'resource', 'bottom'],
      }

      for (const [pathId, [label, to, edge]] of Object.entries(starts)) {
        await selectScenario(label)
        const list = segments(diagram().querySelector(`[data-path="${pathId}"]`)!.getAttribute('d')!)
        const first = list[0]
        const last = list[list.length - 1]
        const request = nodeBox('request')
        const target = nodeBox(to)

        expect(first.y1, `${pathId} 시작`).toBe(edge === 'top' ? request.y : request.y + request.height)
        expect(first.x1, `${pathId} 시작`).toBeGreaterThan(request.x)
        expect(first.x1, `${pathId} 시작`).toBeLessThan(request.x + request.width)
        expect(last.y2, `${pathId} 끝`).toBe(last.y1)
        expect(last.x2, `${pathId} 끝`).toBe(target.x)
        expect(last.y2, `${pathId} 끝`).toBeGreaterThan(target.y)
        expect(last.y2, `${pathId} 끝`).toBeLessThan(target.y + target.height)
      }
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<ControlTimingDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 240')
      await selectScenario('탐지 후 자동 수정')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '탐지 후 자동 수정' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['request-resource', 'detective-resource'])
      for (const path of paths) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note'))).toEqual(['exists-until-fixed', 'auto-fix'])
    })
  })
})
