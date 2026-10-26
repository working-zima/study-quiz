import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ApiIntegrationDiagram, apiIntegrationScenarios } from './ApiIntegrationDiagram'

const topicId = 'api-gateway-step-functions'
const anchorConceptId = `${topicId}.api-gateway-mapping-template-limits`
const proxyConceptId = `${topicId}.api-gateway-lambda-proxy-integration`
const serviceConceptId = `${topicId}.api-gateway-aws-service-integration`
const labels = {
  client: '클라이언트', mapping: '매핑 템플릿', lambda: 'Lambda 함수',
  dynamodb: 'DynamoDB PutItem', backend: '백엔드',
}
const groupLabels = { 'api-gateway': 'API Gateway' }
const notes = {
  'as-is': { label: '헤더까지 그대로', x: 116, y: 150, anchor: 'start' },
  'as-response': { label: '결과가 곧 응답', x: 70, y: 150, anchor: 'end' },
  'no-function': { label: '함수 없이 직접', x: 176, y: 150, anchor: 'start' },
  'fields-only': { label: '필드 이름·값만', x: 264, y: 150, anchor: 'end' },
  json: { label: 'JSON', x: 116, y: 150, anchor: 'start' },
  xml: { label: 'XML', x: 144, y: 220, anchor: 'start' },
}
const expectedPaths: Record<string, string> = {
  'request-lambda': 'M110 40 V168',
  'lambda-response': 'M76 168 V24 H82',
  'request-dynamodb': 'M170 40 V168',
  'request-mapping': 'M190 40 V80',
  'mapping-backend': 'M260 96 H270 V248 H260',
  'lambda-backend': 'M128 184 H140 V248 H152',
}
const question = 'API Gateway는 받은 요청을 어떻게 넘길까?'
const idleCaption = '통합 방식을 고르면 요청이 무엇을 거쳐 넘어가는지 볼 수 있다.'
const legend = '파랑: API Gateway의 기능과 통합 대상 AWS 서비스 · 회색: 클라이언트와 백엔드. 위로 돌아오는 화살표는 응답이다.'
const expectedScenarios = [
  {
    id: 'proxy', label: 'Lambda 프록시',
    nodes: ['client', 'lambda'],
    paths: ['request-lambda', 'lambda-response'], notes: ['as-is', 'as-response'],
    caption: '요청을 헤더까지 그대로 함수에 넘기는 동기 호출이라, 함수의 결과가 곧 응답이 된다.',
    sources: [proxyConceptId],
  },
  {
    id: 'service', label: 'AWS 서비스',
    nodes: ['client', 'dynamodb'],
    paths: ['request-dynamodb'], notes: ['no-function'],
    caption: '메서드가 DynamoDB PutItem을 바로 부른다. 사이에 함수가 없어 관리할 코드도 없다.',
    sources: [serviceConceptId],
  },
  {
    id: 'mapping', label: '매핑 템플릿',
    nodes: ['client', 'mapping', 'backend'],
    paths: ['request-mapping', 'mapping-backend'], notes: ['fields-only'],
    caption: '필드 이름을 바꾸거나 값을 옮기는 정도는 매핑 템플릿에서 끝내고 백엔드로 넘긴다.',
    sources: [anchorConceptId],
  },
  {
    id: 'transform', label: 'JSON을 XML로',
    nodes: ['client', 'lambda', 'backend'],
    paths: ['request-lambda', 'lambda-backend'], notes: ['json', 'xml'],
    caption: 'JSON 주문을 XML 문서로 바꾸는 변환은 매핑 템플릿의 범위를 넘어, 함수 코드가 맡는다.',
    sources: [anchorConceptId],
  },
]

function diagram() {
  return screen.getByRole('img', { name: 'API Gateway가 요청을 백엔드에 넘기는 방식' })
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

describe('ApiIntegrationDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<ApiIntegrationDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 다섯이 모두 선명하고 경로·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<ApiIntegrationDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual(Object.keys(labels).sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·경로·곁말만 보이고 나머지 노드는 흐려진다', async (scenario) => {
    const { container } = render(<ApiIntegrationDiagram />)
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

  it('JSON을 XML로: 매핑 템플릿과 DynamoDB PutItem은 흐리다', async () => {
    render(<ApiIntegrationDiagram />)
    await selectScenario('JSON을 XML로')

    expect(diagram().querySelector('[data-node="mapping"]')).toHaveAttribute('opacity', '0.25')
    expect(diagram().querySelector('[data-node="dynamodb"]')).toHaveAttribute('opacity', '0.25')
  })

  it('요청 화살표·응답 화살표·매핑 경로는 지정한 시나리오에서만 보인다', async () => {
    render(<ApiIntegrationDiagram />)
    const visibleIn: Record<string, string[]> = {
      'request-lambda': ['proxy', 'transform'],
      'lambda-response': ['proxy'],
      'mapping-backend': ['mapping'],
    }
    for (const scenario of expectedScenarios) {
      await selectScenario(scenario.label)
      for (const [pathId, scenarioIds] of Object.entries(visibleIn)) {
        expect(diagram().querySelector(`[data-path="${pathId}"]`) !== null, `${scenario.id}: ${pathId}`).toBe(scenarioIds.includes(scenario.id))
      }
    }
  })

  it('방식을 바꾸면 이전 경로·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<ApiIntegrationDiagram />)
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

  it('관문 5·7: 그룹 하나와 노드 다섯이 280×272 viewBox 안에 있고 매핑 템플릿은 API Gateway 안에 있다', () => {
    render(<ApiIntegrationDiagram />)
    const [x, y, width, height] = diagram().getAttribute('viewBox')!.split(' ').map(Number)
    const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)

    expect([x, y, width, height]).toEqual([0, 0, 280, 272])
    expect(boxes).toHaveLength(6)
    expect(boxesOutsideViewBox(boxes, [x, y, width, height])).toEqual([])
    const gateway = boxes.find(({ id }) => id === 'api-gateway')!
    expect(boxesOutsideViewBox(boxes.filter(({ id }) => id === 'mapping'), [gateway.x, gateway.y, gateway.width, gateway.height])).toEqual([])
    for (const outsider of boxes.filter(({ id }) => ['client', 'lambda', 'dynamodb', 'backend'].includes(id))) {
      expect(boxesOutsideViewBox([outsider], [gateway.x, gateway.y, gateway.width, gateway.height]), outsider.id).toHaveLength(1)
    }
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
  })

  it('관문 6: 노드 라벨은 크기 10이고 높이 32 상자 안에 여백 12를 남기며 청록을 쓰지 않는다', () => {
    render(<ApiIntegrationDiagram />)
    for (const [id, label] of Object.entries(labels)) {
      const node = diagram().querySelector(`[data-node="${id}"]`)!
      const text = node.querySelector('text')!
      const rect = node.querySelector('rect')!
      const box = readBox(rect)
      expect(text.textContent).toBe(label)
      expect(text).toHaveAttribute('font-size', '10')
      expect(box.height).toBe(32)
      expect(estimateTextWidth(label, 10) + 12, label).toBeLessThanOrEqual(box.width)
      expect(rect).toHaveClass(['client', 'backend'].includes(id) ? 'stroke-disabled' : 'stroke-diagram-managed')
      expect(rect).not.toHaveClass('stroke-diagram-resource')
    }
  })

  it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 가로 범위 안에 있다', async (label) => {
    render(<ApiIntegrationDiagram />)
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
    render(<ApiIntegrationDiagram />)
    const text = visualsByTopicId[topicId].diagrams.integration
    const ids = apiIntegrationScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(['mapping', 'proxy', 'service', 'transform'])
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual(Object.fromEntries(Object.entries(notes).map(([id, note]) => [id, note.label])))
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([`${topicId}.api-gateway`, proxyConceptId, serviceConceptId, anchorConceptId])
    expect(text.label).toBe('API Gateway 통합 방식 도식')
    expect(text.svgLabel).toBe('API Gateway가 요청을 백엔드에 넘기는 방식')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = apiIntegrationScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: expected.sources })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(wording.caption.length).toBeLessThanOrEqual(57)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) {
      expect(conceptIds).toContain(source)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 매핑 템플릿 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: 'API Gateway 통합 방식 도식' })

    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(within(figure).queryByRole('heading')).toBeNull()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 경로가 자기 마커를 가리킨다', async () => {
    render(<><ApiIntegrationDiagram /><ApiIntegrationDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: 'API Gateway 통합 방식 도식' })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'Lambda 프록시' })) })
      expect(figure.querySelectorAll('[data-path]')).toHaveLength(2)
      for (const path of figure.querySelectorAll('[data-path]')) {
        expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
      }
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  describe('가로형 (768px 이상)', () => {
    const wideNotes = {
      'as-is': { x: 196, y: 58, anchor: 'middle' },
      'as-response': { x: 196, y: 14, anchor: 'middle' },
      'no-function': { x: 196, y: 154, anchor: 'middle' },
      'fields-only': { x: 222, y: 144, anchor: 'middle' },
      json: { x: 196, y: 58, anchor: 'middle' },
      xml: { x: 358, y: 92, anchor: 'start' },
    }
    const widePaths: Record<string, string> = {
      'request-lambda': 'M80 64 H304',
      'lambda-response': 'M352 48 V20 H44 V48',
      'request-dynamodb': 'M44 80 V160 H304',
      'request-mapping': 'M60 80 V112 H184',
      'mapping-backend': 'M260 112 H304',
      'lambda-backend': 'M352 80 V96',
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

    // 곁말 글자가 차지하는 상자. 높이는 글자 크기 9를 기준선 위로 잡는다.
    function noteBox(note: Element) {
      const x = Number(note.getAttribute('x'))
      const y = Number(note.getAttribute('y'))
      const width = estimateTextWidth(note.textContent!, 9)
      const anchor = note.getAttribute('text-anchor')
      const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
      return { id: note.getAttribute('data-note')!, x: left, y: y - 9, width, height: 9 }
    }

    function nodeBox(id: string) {
      return readBox(diagram().querySelector(`[data-node="${id}"] rect`)!)
    }

    function gatewayBox() {
      return readBox(diagram().querySelector('[data-group="api-gateway"]')!)
    }

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×192 viewBox를 w-full 래퍼 하나로 그리고 SVG 속성과 화살표를 유지한다', () => {
      render(<ApiIntegrationDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 192')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·그룹 id 집합과 시나리오로 나타나는 경로 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<ApiIntegrationDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 272')
      const tallNodes = ids('[data-node]', 'data-node')
      const tallGroups = ids('[data-group]', 'data-group')
      const tallPaths = await collectPathIds()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 192')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(tallNodes).toEqual(Object.keys(labels).sort())
      expect(ids('[data-group]', 'data-group')).toEqual(tallGroups)
      expect(tallGroups).toEqual(Object.keys(groupLabels).sort())
      expect(tallPaths).toHaveLength(6)
      expect(await collectPathIds()).toEqual(tallPaths)
    })

    it('그룹 하나와 노드 다섯의 모든 rect가 440×192 viewBox 안에 있다', () => {
      render(<ApiIntegrationDiagram />)
      const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)

      expect(boxes).toHaveLength(6)
      expect(boxesOutsideViewBox(boxes, [0, 0, 440, 192])).toEqual([])
    })

    it('노드 라벨은 크기 10과 여백 12로, 그룹 라벨은 크기 9로 자기 박스 오른쪽 끝 안에 들어간다', () => {
      render(<ApiIntegrationDiagram />)

      for (const [id, label] of Object.entries(labels)) {
        const node = diagram().querySelector(`[data-node="${id}"]`)!
        const rect = node.querySelector('rect')!
        const box = readBox(rect)
        expect(node.querySelector('text')!.textContent).toBe(label)
        expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
        expect(box.height).toBe(32)
        expect(estimateTextWidth(label, 10) + 12, label).toBeLessThanOrEqual(box.width)
        expect(rect).toHaveClass(['client', 'backend'].includes(id) ? 'stroke-disabled' : 'stroke-diagram-managed')
        expect(rect).not.toHaveClass('stroke-diagram-resource')
      }

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

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·경로·곁말·캡션을 보이고 곁말은 viewBox 안에서 노드와 겹치지 않는다', async (scenario) => {
      const { container } = render(<ApiIntegrationDiagram />)
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
        const box = noteBox(note)
        expect(boxesOutsideViewBox([box], [0, 0, 440, 192]), id).toEqual([])
        for (const node of nodeBoxes) {
          const overlaps = box.x < node.x + node.width && node.x < box.x + box.width
            && box.y < node.y + node.height && node.y < box.y + box.height
          expect(overlaps, `${id} ↔ ${node.id}`).toBe(false)
        }
      }
      expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
      expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
      expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
    })

    it('매핑 템플릿은 API Gateway 안에 있고 통합 대상 셋은 박스 밖 오른쪽, 클라이언트는 박스 밖 왼쪽이다', () => {
      render(<ApiIntegrationDiagram />)
      const gateway = gatewayBox()
      const frame: [number, number, number, number] = [gateway.x, gateway.y, gateway.width, gateway.height]

      expect(boxesOutsideViewBox([nodeBox('mapping')], frame)).toEqual([])
      for (const id of ['client', 'lambda', 'dynamodb', 'backend']) {
        expect(boxesOutsideViewBox([nodeBox(id)], frame), id).toHaveLength(1)
      }
      for (const id of ['lambda', 'dynamodb', 'backend']) {
        expect(nodeBox(id).x, id).toBeGreaterThanOrEqual(gateway.x + gateway.width)
      }
      expect(nodeBox('client').x + nodeBox('client').width).toBeLessThanOrEqual(gateway.x)
    })

    it('요청 경로 셋은 API Gateway 박스의 왼쪽 변을 가로로 지난다', async () => {
      render(<ApiIntegrationDiagram />)
      const requests: Record<string, string> = {
        'request-lambda': 'Lambda 프록시',
        'request-dynamodb': 'AWS 서비스',
        'request-mapping': '매핑 템플릿',
      }

      for (const [pathId, label] of Object.entries(requests)) {
        await selectScenario(label)
        const gateway = gatewayBox()
        const d = diagram().querySelector(`[data-path="${pathId}"]`)!.getAttribute('d')!
        const crossing = segments(d).some(({ x1, y1, x2, y2 }) => y1 === y2
          && y1 > gateway.y && y1 < gateway.y + gateway.height
          && Math.min(x1, x2) < gateway.x && Math.max(x1, x2) > gateway.x)
        expect(crossing, pathId).toBe(true)
      }
    })

    it('프록시의 응답은 API Gateway 박스 위 통로로 클라이언트에 돌아온다', async () => {
      render(<ApiIntegrationDiagram />)
      await selectScenario('Lambda 프록시')
      const gateway = gatewayBox()
      const list = segments(diagram().querySelector('[data-path="lambda-response"]')!.getAttribute('d')!)

      for (const { x1, y1, x2, y2 } of list) {
        const inside = Math.max(x1, x2) > gateway.x && Math.min(x1, x2) < gateway.x + gateway.width
          && Math.max(y1, y2) > gateway.y && Math.min(y1, y2) < gateway.y + gateway.height
        expect(inside, `(${x1},${y1})→(${x2},${y2})`).toBe(false)
      }
      const across = list.filter(({ y1, y2 }) => y1 === y2)
      expect(across).toHaveLength(1)
      expect(across[0].y1).toBeLessThan(gateway.y)
    })

    it('경로 양 끝이 출발 노드와 도착 노드의 변에 닿는다', async () => {
      render(<ApiIntegrationDiagram />)
      const ends: Record<string, [string, string, string]> = {
        'request-lambda': ['Lambda 프록시', 'client', 'lambda'],
        'lambda-response': ['Lambda 프록시', 'lambda', 'client'],
        'request-dynamodb': ['AWS 서비스', 'client', 'dynamodb'],
        'request-mapping': ['매핑 템플릿', 'client', 'mapping'],
        'mapping-backend': ['매핑 템플릿', 'mapping', 'backend'],
        'lambda-backend': ['JSON을 XML로', 'lambda', 'backend'],
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
      const { container } = render(<ApiIntegrationDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 272')
      await selectScenario('매핑 템플릿')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '매핑 템플릿' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(Array.from(diagram().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')))
        .toEqual(['request-mapping', 'mapping-backend'])
      expect(Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note'))).toEqual(['fields-only'])
    })
  })
})
