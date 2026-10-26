import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ApiEndpointPathDiagram, apiEndpointPathScenarios } from './ApiEndpointPathDiagram'

const topicId = 'api-gateway-step-functions'
const anchorConceptId = `${topicId}.api-gateway-behind-cloudfront`
const endpointTypesConceptId = `${topicId}.api-gateway-endpoint-types`
const labels = {
  user: '전 세계 사용자', cloudfront: 'CloudFront', s3: 'S3 버킷',
  api: 'API Gateway', lambda: 'Lambda 함수',
}
const groupLabels = { edge: '엣지', region: '리전' }
const notes = {
  'via-edge': { label: '엣지를 거쳐 들어옴', x: 246, y: 70, anchor: 'end' },
  'latency-remains': { label: '멀리서는 지연이 그대로', x: 262, y: 150, anchor: 'end' },
  'from-cache': { label: '캐시에서 응답', x: 206, y: 215, anchor: 'middle' },
  static: { label: '정적 파일', x: 74, y: 215, anchor: 'middle' },
  dynamic: { label: '동적 응답', x: 206, y: 215, anchor: 'middle' },
}
const expectedPaths: Record<string, string> = {
  'user-cloudfront': 'M140 40 V80',
  'cloudfront-api': 'M180 112 V168',
  'cloudfront-s3': 'M100 112 V168',
  'user-api': 'M198 24 H270 V184 H260',
  'api-lambda': 'M206 200 V224',
}
const question = '전 세계 사용자의 요청은 어디를 거쳐 갈까?'
const idleCaption = '설정을 고르면 요청이 어디를 거쳐 응답을 받는지 볼 수 있다.'
const legend = '파랑: AWS 서비스 · 회색: 사용자. 위 박스는 CloudFront의 엣지, 아래 박스는 API가 배포된 리전이다.'
const expectedScenarios = [
  {
    id: 'edge', label: '엣지 최적화',
    nodes: ['user', 'cloudfront', 'api', 'lambda'],
    paths: ['user-cloudfront', 'cloudfront-api', 'api-lambda'], notes: ['via-edge'],
    caption: '엣지 최적화 엔드포인트는 요청을 CloudFront 엣지로 받아, 전 세계 사용자의 지연을 줄인다.',
    sources: [endpointTypesConceptId],
  },
  {
    id: 'regional', label: '리전',
    nodes: ['user', 'api', 'lambda'],
    paths: ['user-api', 'api-lambda'], notes: ['latency-remains'],
    caption: '리전 엔드포인트는 그 리전으로 직접 받는다. 멀리 있는 사용자의 지연이 그대로 남는다.',
    sources: [endpointTypesConceptId],
  },
  {
    id: 'cache', label: 'API 캐싱',
    nodes: ['user', 'api'],
    paths: ['user-api'], notes: ['from-cache'],
    caption: '캐싱을 켜면 같은 응답을 백엔드까지 가지 않고 API Gateway가 바로 돌려준다.',
    sources: [endpointTypesConceptId],
  },
  {
    id: 'cdn-origins', label: 'CloudFront 오리진',
    nodes: ['user', 'cloudfront', 's3', 'api'],
    paths: ['user-cloudfront', 'cloudfront-s3', 'cloudfront-api'], notes: ['static', 'dynamic'],
    caption: '배포 하나에 S3 버킷과 HTTP API를 오리진으로 두면 정적·동적 응답이 다 엣지를 거친다.',
    sources: [anchorConceptId],
  },
]

function diagram() {
  return screen.getByRole('img', { name: '엣지 최적화·리전 엔드포인트와 CloudFront 오리진' })
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

// 직교 경로(M/H/V)를 선분으로 편다.
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

describe('ApiEndpointPathDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<ApiEndpointPathDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 다섯이 모두 선명하고 경로·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<ApiEndpointPathDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual(Object.keys(labels).sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·경로·곁말만 보이고 나머지 노드는 흐려진다', async (scenario) => {
    const { container } = render(<ApiEndpointPathDiagram />)
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

  it('리전·API 캐싱에서는 CloudFront가, API 캐싱에서는 Lambda 함수까지 흐리다', async () => {
    render(<ApiEndpointPathDiagram />)
    await selectScenario('리전')
    expect(diagram().querySelector('[data-node="cloudfront"]')).toHaveAttribute('opacity', '0.25')

    await selectScenario('API 캐싱')
    expect(diagram().querySelector('[data-node="cloudfront"]')).toHaveAttribute('opacity', '0.25')
    expect(diagram().querySelector('[data-node="lambda"]')).toHaveAttribute('opacity', '0.25')
  })

  it('리전으로 직접 가는 경로와 버킷으로 가는 경로는 지정한 시나리오에서만 보인다', async () => {
    render(<ApiEndpointPathDiagram />)
    const visibleIn: Record<string, string[]> = {
      'user-api': ['regional', 'cache'],
      'cloudfront-s3': ['cdn-origins'],
    }
    for (const scenario of expectedScenarios) {
      await selectScenario(scenario.label)
      for (const [pathId, scenarioIds] of Object.entries(visibleIn)) {
        expect(diagram().querySelector(`[data-path="${pathId}"]`) !== null, `${scenario.id}: ${pathId}`).toBe(scenarioIds.includes(scenario.id))
      }
    }
  })

  it('리전으로 직접 가는 경로는 엣지 박스 안을 지나지 않는다', async () => {
    render(<ApiEndpointPathDiagram />)
    await selectScenario('리전')
    const edge = readBox(diagram().querySelector('[data-group="edge"]')!)
    const path = diagram().querySelector('[data-path="user-api"]')!

    for (const { x1, y1, x2, y2 } of segments(path.getAttribute('d')!)) {
      const inside = Math.max(x1, x2) > edge.x && Math.min(x1, x2) < edge.x + edge.width
        && Math.max(y1, y2) > edge.y && Math.min(y1, y2) < edge.y + edge.height
      expect(inside, `(${x1},${y1})→(${x2},${y2})`).toBe(false)
    }
  })

  it('설정을 바꾸면 이전 경로·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<ApiEndpointPathDiagram />)
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

  it('관문 5·7: 그룹 둘과 노드 다섯이 280×276 viewBox 안에 있고 각 노드가 제 층에 있다', () => {
    render(<ApiEndpointPathDiagram />)
    const [x, y, width, height] = diagram().getAttribute('viewBox')!.split(' ').map(Number)
    const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
    const frame = (id: string) => {
      const group = boxes.find((box) => box.id === id)!
      return [group.x, group.y, group.width, group.height] as [number, number, number, number]
    }
    const pick = (ids: string[]) => boxes.filter((box) => ids.includes(box.id))

    expect([x, y, width, height]).toEqual([0, 0, 280, 276])
    expect(boxes).toHaveLength(7)
    expect(boxesOutsideViewBox(boxes, [x, y, width, height])).toEqual([])
    expect(boxesOutsideViewBox(pick(['cloudfront']), frame('edge'))).toEqual([])
    expect(boxesOutsideViewBox(pick(['s3', 'api', 'lambda']), frame('region'))).toEqual([])
    for (const outsider of pick(['user', 's3', 'api', 'lambda'])) {
      expect(boxesOutsideViewBox([outsider], frame('edge')), outsider.id).toHaveLength(1)
    }
    for (const outsider of pick(['user', 'cloudfront'])) {
      expect(boxesOutsideViewBox([outsider], frame('region')), outsider.id).toHaveLength(1)
    }
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
  })

  it('관문 6: 노드 라벨은 크기 10이고 높이 32 상자 안에 여백 12를 남기며 청록을 쓰지 않는다', () => {
    render(<ApiEndpointPathDiagram />)
    for (const [id, label] of Object.entries(labels)) {
      const node = diagram().querySelector(`[data-node="${id}"]`)!
      const text = node.querySelector('text')!
      const rect = node.querySelector('rect')!
      const box = readBox(rect)
      expect(text.textContent).toBe(label)
      expect(text).toHaveAttribute('font-size', '10')
      expect(box.height).toBe(32)
      expect(estimateTextWidth(label, 10) + 12, label).toBeLessThanOrEqual(box.width)
      expect(rect).toHaveClass(id === 'user' ? 'stroke-disabled' : 'stroke-diagram-managed')
      expect(rect).not.toHaveClass('stroke-diagram-resource')
    }
    expect(diagram().querySelector('.stroke-diagram-resource, .fill-diagram-resource')).toBeNull()
  })

  it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 가로 범위 안에 있다', async (label) => {
    render(<ApiEndpointPathDiagram />)
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
    render(<ApiEndpointPathDiagram />)
    const text = visualsByTopicId[topicId].diagrams['endpoint-path']
    const ids = apiEndpointPathScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(['cache', 'cdn-origins', 'edge', 'regional'])
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual(Object.fromEntries(Object.entries(notes).map(([id, note]) => [id, note.label])))
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([`${topicId}.api-gateway`, endpointTypesConceptId, anchorConceptId])
    expect(text.label).toBe('API 엔드포인트 경로 도식')
    expect(text.svgLabel).toBe('엣지 최적화·리전 엔드포인트와 CloudFront 오리진')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = apiEndpointPathScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: expected.sources })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(wording.caption.length).toBeLessThanOrEqual(57)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) {
      expect(conceptIds).toContain(source)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 CloudFront 오리진 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: 'API 엔드포인트 경로 도식' })

    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(within(figure).queryByRole('heading')).toBeNull()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 경로가 자기 마커를 가리킨다', async () => {
    render(<><ApiEndpointPathDiagram /><ApiEndpointPathDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: 'API 엔드포인트 경로 도식' })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '엣지 최적화' })) })
      expect(figure.querySelectorAll('[data-path]')).toHaveLength(3)
      for (const path of figure.querySelectorAll('[data-path]')) {
        expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
      }
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  describe('가로형 (768px 이상)', () => {
    const wideNotes = {
      'via-edge': { x: 108, y: 40, anchor: 'end' },
      'latency-remains': { x: 176, y: 128, anchor: 'middle' },
      'from-cache': { x: 294, y: 144, anchor: 'middle' },
      static: { x: 344, y: 52, anchor: 'start' },
      dynamic: { x: 294, y: 144, anchor: 'middle' },
    }
    const widePaths: Record<string, string> = {
      'user-cloudfront': 'M54 96 V48 H124',
      'cloudfront-api': 'M196 64 V80 H294 V96',
      'cloudfront-s3': 'M212 48 H252',
      'user-api': 'M100 112 H252',
      'api-lambda': 'M336 112 H352',
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

    // 곁말 글자가 차지하는 상자. 높이는 글자 크기 9를 기준선 위로 잡는다.
    function noteBox(note: Element) {
      const x = Number(note.getAttribute('x'))
      const y = Number(note.getAttribute('y'))
      const width = estimateTextWidth(note.textContent!, 9)
      const anchor = note.getAttribute('text-anchor')
      const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
      return { id: note.getAttribute('data-note')!, x: left, y: y - 9, width, height: 9 }
    }

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×160 viewBox를 w-full 래퍼 하나로 그리고 SVG 속성과 화살표를 유지한다', () => {
      render(<ApiEndpointPathDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 160')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·그룹 id 집합과 시나리오로 나타나는 경로 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<ApiEndpointPathDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 276')
      const tallNodes = ids('[data-node]', 'data-node')
      const tallGroups = ids('[data-group]', 'data-group')
      const tallPaths = await collectPathIds()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 160')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(tallNodes).toEqual(Object.keys(labels).sort())
      expect(ids('[data-group]', 'data-group')).toEqual(tallGroups)
      expect(tallGroups).toEqual(Object.keys(groupLabels).sort())
      expect(tallPaths).toHaveLength(5)
      expect(await collectPathIds()).toEqual(tallPaths)
    })

    it('그룹 둘과 노드 다섯의 모든 rect가 440×160 viewBox 안에 있다', () => {
      render(<ApiEndpointPathDiagram />)
      const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)

      expect(boxes).toHaveLength(7)
      expect(boxesOutsideViewBox(boxes, [0, 0, 440, 160])).toEqual([])
    })

    it('노드 라벨은 크기 10과 여백 12로, 그룹 라벨은 크기 9로 자기 박스 오른쪽 끝 안에 들어간다', () => {
      render(<ApiEndpointPathDiagram />)

      for (const [id, label] of Object.entries(labels)) {
        const node = diagram().querySelector(`[data-node="${id}"]`)!
        const rect = node.querySelector('rect')!
        const box = readBox(rect)
        expect(node.querySelector('text')!.textContent).toBe(label)
        expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
        expect(box.height).toBe(32)
        expect(estimateTextWidth(label, 10) + 12, label).toBeLessThanOrEqual(box.width)
        expect(rect).toHaveClass(id === 'user' ? 'stroke-disabled' : 'stroke-diagram-managed')
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
      const { container } = render(<ApiEndpointPathDiagram />)
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
        expect(boxesOutsideViewBox([box], [0, 0, 440, 160]), id).toEqual([])
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

    it('리전으로 직접 가는 경로는 엣지 박스 안을 지나지 않는다', async () => {
      render(<ApiEndpointPathDiagram />)
      await selectScenario('리전')
      const edge = readBox(diagram().querySelector('[data-group="edge"]')!)
      const path = diagram().querySelector('[data-path="user-api"]')!

      for (const { x1, y1, x2, y2 } of segments(path.getAttribute('d')!)) {
        const inside = Math.max(x1, x2) > edge.x && Math.min(x1, x2) < edge.x + edge.width
          && Math.max(y1, y2) > edge.y && Math.min(y1, y2) < edge.y + edge.height
        expect(inside, `(${x1},${y1})→(${x2},${y2})`).toBe(false)
      }
    })

    it('각 노드가 제 층에 있다: CloudFront는 엣지, S3·API·Lambda는 리전 안이고 사용자는 둘 다 밖이다', () => {
      render(<ApiEndpointPathDiagram />)
      const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
      const frame = (id: string) => {
        const group = boxes.find((box) => box.id === id)!
        return [group.x, group.y, group.width, group.height] as [number, number, number, number]
      }
      const pick = (ids: string[]) => boxes.filter((box) => ids.includes(box.id))

      expect(boxesOutsideViewBox(pick(['cloudfront']), frame('edge'))).toEqual([])
      expect(boxesOutsideViewBox(pick(['s3', 'api', 'lambda']), frame('region'))).toEqual([])
      for (const outsider of pick(['user', 's3', 'api', 'lambda'])) {
        expect(boxesOutsideViewBox([outsider], frame('edge')), outsider.id).toHaveLength(1)
      }
      for (const outsider of pick(['user', 'cloudfront'])) {
        expect(boxesOutsideViewBox([outsider], frame('region')), outsider.id).toHaveLength(1)
      }
    })

    it('리전 엔드포인트 경로는 수평선 하나다', async () => {
      render(<ApiEndpointPathDiagram />)
      await selectScenario('리전')
      const d = diagram().querySelector('[data-path="user-api"]')!.getAttribute('d')!

      expect(d).toMatch(/^M\d+ \d+ H\d+$/u)
      expect(segments(d)).toHaveLength(1)
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<ApiEndpointPathDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 276')
      await selectScenario('CloudFront 오리진')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: 'CloudFront 오리진' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(Array.from(diagram().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')))
        .toEqual(['user-cloudfront', 'cloudfront-s3', 'cloudfront-api'])
      expect(Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note'))).toEqual(['static', 'dynamic'])
    })
  })
})
