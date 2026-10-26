import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { Route53HealthDiagram, route53HealthScenarios, paths as healthPaths } from './Route53HealthDiagram'

const labels = { user: '사용자', route53: 'Route 53', 'region-a': '리전 A의 ALB', 'region-b': '리전 B의 ALB' }
const notes = { unhealthy: '비정상', primary: '주 · 상태 검사', secondary: '보조', dropped: '응답에서 빠짐', query: 'www.example.com의 주소는?' }
const question = '리전 A가 멈추면 Route 53은 어디를 알려 줄까?'
const expectedScenarios = [
  {
    id: 'simple', label: '단순', nodes: ['user', 'route53'],
    paths: ['user-route53', 'route53-region-a'], notes: ['unhealthy'],
    sources: ['route53.routing-policies', 'route53.multivalue-answer-details', 'route53.multi-region-failover-for-region-outage'],
  },
  {
    id: 'failover', label: '페일오버', nodes: ['user', 'route53', 'region-b'],
    paths: ['user-route53', 'route53-region-b'], notes: ['unhealthy', 'primary', 'secondary'],
    sources: ['route53.route53-failover-routing', 'route53.multi-region-failover-for-region-outage'],
  },
  {
    id: 'multivalue', label: '다중값 응답', nodes: ['user', 'route53', 'region-b'],
    paths: ['user-route53', 'route53-region-b'], notes: ['unhealthy', 'dropped'],
    sources: ['route53.multivalue-answer-details'],
  },
]

function diagram() {
  return screen.getByRole('img', { name: '상태 검사와 Route 53 응답' })
}

async function selectScenario(label: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) })
}

function readBox(rect: Element) {
  return {
    id: rect.parentElement?.getAttribute('data-node') ?? '',
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

describe('Route53HealthDiagram', () => {
  it('처음에는 노드 넷이 모두 선명하고 경로 없이 예시 곁말만 두고 선택 안내가 나온다', () => {
    const { container } = render(<Route53HealthDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual(Object.keys(labels).sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note'))).toEqual(['query'])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(visualsByTopicId.route53.diagrams['health-answers'].idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·경로·곁말만 표시하고 리전 A는 항상 비정상이다', async (scenario) => {
    const { container } = render(<Route53HealthDiagram />)
    await selectScenario(scenario.label)

    for (const node of diagram().querySelectorAll('[data-node]')) {
      expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
    }
    expect(diagram().querySelector('[data-node="region-a"]')).toHaveAttribute('opacity', '0.25')
    const paths = Array.from(diagram().querySelectorAll('[data-path]'))
    expect(paths.map((path) => path.getAttribute('data-path')).sort()).toEqual([...scenario.paths].sort())
    for (const path of paths) {
      expect(path).toHaveAttribute('d', healthPaths[path.getAttribute('data-path')!])
      expect(path).toHaveAttribute('stroke-width', '2')
      expect(path).toHaveAttribute('marker-end', `url(#${diagram().querySelector('marker')!.id})`)
      expect(path).toHaveClass('stroke-title')
      expect(path.closest('[opacity]')).toBeNull()
    }
    const allNotes = Array.from(diagram().querySelectorAll('[data-note]'))
    expect(allNotes.map((note) => note.getAttribute('data-note')).sort()).toEqual([...scenario.notes, 'query'].sort())
    const visibleNotes = allNotes.filter((note) => note.getAttribute('data-note') !== 'query')
    expect(diagram().querySelector('[data-note="unhealthy"]')).toHaveTextContent('비정상')
    const [minX, minY, width, height] = diagram().getAttribute('viewBox')!.split(' ').map(Number)
    for (const note of visibleNotes) {
      const id = note.getAttribute('data-note')! as keyof typeof notes
      expect(note.textContent).toBe(notes[id])
      expect(note.textContent).not.toContain('장애')
      expect(note).toHaveAttribute('font-size', '9')
      expect(note).toHaveClass('fill-muted')
      expect(note.closest('[opacity]')).toBeNull()
      expect(note).toHaveAttribute('text-anchor', 'middle')
      const halfWidth = estimateTextWidth(note.textContent!, 9) / 2
      expect(Number(note.getAttribute('x')) - halfWidth).toBeGreaterThanOrEqual(minX)
      expect(Number(note.getAttribute('x')) + halfWidth).toBeLessThanOrEqual(minX + width)
      expect(Number(note.getAttribute('y')) - 9).toBeGreaterThanOrEqual(minY)
      expect(Number(note.getAttribute('y'))).toBeLessThanOrEqual(minY + height)
    }
    const regionA = readBox(diagram().querySelector('[data-node="region-a"] rect')!)
    expect(Number(diagram().querySelector('[data-note="unhealthy"]')!.getAttribute('y'))).toBeGreaterThan(regionA.y + regionA.height)
    const wording = visualsByTopicId.route53.diagrams['health-answers'].scenarios.find(({ id }) => id === scenario.id)!
    expect(container.querySelector('figcaption')!.textContent).toBe(wording.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  })

  it('정책을 연달아 바꿔도 이전 곁말이 남지 않고 전체에서 경로를 숨기고 예시 곁말만 남긴다', async () => {
    render(<Route53HealthDiagram />)
    for (const label of ['페일오버', '다중값 응답', '단순']) await selectScenario(label)

    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(2)
    expect(diagram().querySelector('[data-path="route53-region-a"]')).toBeInTheDocument()
    expect(diagram().querySelector('[data-path="route53-region-b"]')).toBeNull()
    await selectScenario('전체')
    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note'))).toEqual(['query'])
  })

  it('물음형 제목이 시나리오 버튼보다 앞에 보인다', () => {
    render(<Route53HealthDiagram />)
    const title = screen.getByText(question)

    expect(visualsByTopicId.route53.diagrams['health-answers'].question).toBe(question)
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(title.tagName).toBe('P')
  })

  it.each(['전체', '단순', '페일오버', '다중값 응답'])('%s: 예시 곁말이 질의 화살표 오른쪽에 보이고 viewBox 안에 있다', async (label) => {
    render(<Route53HealthDiagram />)
    if (label !== '전체') await selectScenario(label)
    const query = diagram().querySelector('[data-note="query"]')!
    const [minX, minY, width, height] = diagram().getAttribute('viewBox')!.split(' ').map(Number)
    const user = readBox(diagram().querySelector('[data-node="user"] rect')!)
    const route53 = readBox(diagram().querySelector('[data-node="route53"] rect')!)
    const x = Number(query.getAttribute('x')), y = Number(query.getAttribute('y'))

    expect(query.textContent).toBe(notes.query)
    expect(query).toHaveAttribute('font-size', '9')
    expect(query).toHaveClass('fill-muted')
    expect(query).toHaveAttribute('text-anchor', 'start')
    expect(query).toHaveAttribute('opacity', diagram().querySelector('[data-node="user"]')!.getAttribute('opacity'))
    expect(x).toBeGreaterThan(140)
    expect(x).toBeGreaterThanOrEqual(minX)
    expect(x + estimateTextWidth(notes.query, 9)).toBeLessThanOrEqual(minX + width)
    expect(y - 9).toBeGreaterThanOrEqual(user.y + user.height)
    expect(y).toBeLessThanOrEqual(route53.y)
    expect(y).toBeLessThanOrEqual(minY + height)
  })

  it('관문 5·7: 네 상자가 폭 280의 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<Route53HealthDiagram />)
    const [x, y, width, height] = diagram().getAttribute('viewBox')!.split(' ').map(Number)
    const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)

    expect([x, y, width]).toEqual([0, 0, 280])
    expect(boxes).toHaveLength(4)
    expect(boxesOutsideViewBox(boxes, [x, y, width, height])).toEqual([])
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
  })

  it('관문 6: 노드 라벨은 크기 10이고 높이 32 상자 안에 여백 12를 남긴다', () => {
    render(<Route53HealthDiagram />)

    for (const [id, label] of Object.entries(labels)) {
      const node = diagram().querySelector(`[data-node="${id}"]`)!
      const text = node.querySelector('text')!
      const box = readBox(node.querySelector('rect')!)
      expect(text.textContent).toBe(label)
      expect(text).toHaveAttribute('font-size', '10')
      expect(box.height).toBe(32)
      expect(estimateTextWidth(label, 10) + 12, label).toBeLessThanOrEqual(box.width)
    }
  })

  it('사용자·Route 53은 중앙에, 두 리전은 그 아래 나란히 있고 색은 지정한 계층만 구분한다', () => {
    render(<Route53HealthDiagram />)
    const box = (id: string) => readBox(diagram().querySelector(`[data-node="${id}"] rect`)!)
    const user = box('user'), route53 = box('route53'), a = box('region-a'), b = box('region-b')

    expect(user.x + user.width / 2).toBe(140)
    expect(route53.x + route53.width / 2).toBe(140)
    expect(user.y + user.height).toBeLessThan(route53.y)
    expect(route53.y + route53.height).toBeLessThan(a.y)
    expect(a.y).toBe(b.y)
    expect(a.x + a.width).toBeLessThan(b.x)
    for (const [id, color] of Object.entries({ user: 'stroke-disabled', route53: 'stroke-diagram-managed', 'region-a': 'stroke-diagram-resource', 'region-b': 'stroke-diagram-resource' })) {
      expect(diagram().querySelector(`[data-node="${id}"] rect`)).toHaveClass(color)
    }
    expect(Object.keys(healthPaths).sort()).toEqual(['route53-region-a', 'route53-region-b', 'user-route53'])
    for (const path of Object.values(healthPaths)) expect(path).toMatch(/^M[\d\sHV]+$/)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구·근거와 50자 이하 캡션을 JSON에서 읽는다', () => {
    render(<Route53HealthDiagram />)
    const text = visualsByTopicId.route53.diagrams['health-answers']
    const ids = route53HealthScenarios.map(({ id }) => id).sort()

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.notes).toEqual(notes)
    expect(text.sources).toEqual(['route53.route53', 'route53.routing-policies', 'route53.route53-failover-routing', 'route53.multi-region-failover-for-region-outage'])
    expect(text.label).toBe('상태 검사와 Route 53 응답 도식')
    expect(text.svgLabel).toBe('상태 검사와 Route 53 응답')
    expect(screen.getByText(text.legend!)).toBeInTheDocument()
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = route53HealthScenarios.find(({ id }) => id === expected.id)!
      expect(wording.sources).toEqual(expected.sources)
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(wording.caption.length).toBeLessThanOrEqual(50)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 다중값 응답 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === 'route53')!.concepts.find(({ id }) => id === 'route53.multivalue-answer-details')!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: '상태 검사와 Route 53 응답 도식' })

    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.join(''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(within(figure).queryByRole('heading')).toBeNull()
  })

  it('두 번 렌더해도 각 도식의 경로는 서로 다른 화살표 마커를 쓴다', async () => {
    render(<><Route53HealthDiagram /><Route53HealthDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: '상태 검사와 Route 53 응답 도식' })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '단순' })) })
      for (const path of figure.querySelectorAll('[data-path]')) {
        expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
      }
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  describe('가로형 (768px 이상)', () => {
    const pathEnds: Record<string, [string, string]> = {
      'user-route53': ['user', 'route53'],
      'route53-region-a': ['route53', 'region-a'],
      'route53-region-b': ['route53', 'region-b'],
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

    async function collectPaths() {
      const found = new Map<string, string>()
      for (const { label } of expectedScenarios) {
        await selectScenario(label)
        for (const path of diagram().querySelectorAll('[data-path]')) found.set(path.getAttribute('data-path')!, path.getAttribute('d')!)
      }
      return found
    }

    const nodeBox = (id: string) => readBox(diagram().querySelector(`[data-node="${id}"] rect`)!)

    // 곁말 한 줄이 차지하는 상자. 글자 높이는 크기 9로 잡고, 정렬(text-anchor)에 따라 왼쪽 끝을 정한다.
    function noteBox(note: Element) {
      const width = estimateTextWidth(note.textContent!, 9)
      const x = Number(note.getAttribute('x')), y = Number(note.getAttribute('y'))
      const left = note.getAttribute('text-anchor') === 'start' ? x : x - width / 2
      return { id: note.getAttribute('data-note')!, x: left, y: y - 9, width, height: 9 }
    }

    type Box = ReturnType<typeof readBox>
    const overlaps = (a: Box, b: Box) =>
      Math.min(a.x + a.width, b.x + b.width) > Math.max(a.x, b.x)
      && Math.min(a.y + a.height, b.y + b.height) > Math.max(a.y, b.y)

    const onEdge = (point: { x: number, y: number }, box: Box) => (
      ((point.x === box.x || point.x === box.x + box.width) && point.y > box.y && point.y < box.y + box.height)
      || ((point.y === box.y || point.y === box.y + box.height) && point.x > box.x && point.x < box.x + box.width)
    )

    // 직교 경로의 시작점과 끝점.
    function endpoints(d: string) {
      const [, x0, y0] = d.match(/^M(\d+) (\d+)/)!.map(Number)
      let x = x0, y = y0
      for (const [, cmd, n] of d.matchAll(/([HV])(\d+)/g)) {
        if (cmd === 'H') x = Number(n); else y = Number(n)
      }
      return { start: { x: x0, y: y0 }, end: { x, y } }
    }

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×136 viewBox를 w-full 래퍼 하나로 그리고 SVG 속성과 화살표를 유지한다', () => {
      render(<Route53HealthDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 136')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드 id 집합과 시나리오로 나타나는 경로 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<Route53HealthDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 244')
      const tallNodes = ids('[data-node]', 'data-node')
      const tallPaths = [...(await collectPaths()).keys()].sort()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 136')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(tallNodes).toEqual(Object.keys(labels).sort())
      expect(diagram().querySelectorAll('[data-group]')).toHaveLength(0)
      expect(tallPaths).toEqual(Object.keys(healthPaths).sort())
      expect(tallPaths).toHaveLength(3)
      expect([...(await collectPaths()).keys()].sort()).toEqual(tallPaths)
    })

    it('노드 넷의 rect가 모두 440×136 viewBox 안에 있다', () => {
      render(<Route53HealthDiagram />)
      const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)

      expect(boxes).toHaveLength(4)
      expect(boxesOutsideViewBox(boxes, [0, 0, 440, 136])).toEqual([])
    })

    it('노드 라벨은 크기 10이고 높이 32 상자 안에 여백 12를 남긴다', () => {
      render(<Route53HealthDiagram />)

      for (const [id, label] of Object.entries(labels)) {
        const node = diagram().querySelector(`[data-node="${id}"]`)!
        const box = nodeBox(id)
        expect(node.querySelector('text')!.textContent).toBe(label)
        expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
        expect(box.height).toBe(32)
        expect(estimateTextWidth(label, 10) + 12, label).toBeLessThanOrEqual(box.width)
      }
    })

    it.each(expectedScenarios)('$label은 세로형과 같은 노드·경로·곁말·캡션을 보이고 곁말은 노드와 겹치지 않는다', async (scenario) => {
      const { container } = render(<Route53HealthDiagram />)
      await selectScenario(scenario.label)

      for (const node of diagram().querySelectorAll('[data-node]')) {
        expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
      }
      expect(diagram().querySelector('[data-node="region-a"]')).toHaveAttribute('opacity', '0.25')
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path')).sort()).toEqual([...scenario.paths].sort())
      for (const path of paths) {
        expect(path.getAttribute('d')).toMatch(/^M\d+ \d+( [HV]\d+)+$/)
        expect(path).toHaveAttribute('stroke-width', '2')
        expect(path).toHaveAttribute('marker-end', `url(#${diagram().querySelector('marker')!.id})`)
        expect(path).toHaveClass('stroke-title')
        expect(path.closest('[opacity]')).toBeNull()
      }
      const allNotes = Array.from(diagram().querySelectorAll('[data-note]'))
      expect(allNotes.map((note) => note.getAttribute('data-note')).sort()).toEqual([...scenario.notes, 'query'].sort())
      const nodeBoxes = Object.keys(labels).map(nodeBox)
      for (const note of allNotes) {
        const id = note.getAttribute('data-note')! as keyof typeof notes
        expect(note.textContent).toBe(notes[id])
        expect(note.textContent).not.toContain('장애')
        expect(note).toHaveAttribute('font-size', '9')
        expect(note).toHaveClass('fill-muted')
        expect(note).toHaveAttribute('text-anchor', id === 'query' ? 'start' : 'middle')
        if (id !== 'query') expect(note.closest('[opacity]')).toBeNull()
        expect(boxesOutsideViewBox([noteBox(note)], [0, 0, 440, 136]), id).toEqual([])
        for (const box of nodeBoxes) expect(overlaps(noteBox(note), box), `${id}·${box.id}`).toBe(false)
      }
      const regionA = nodeBox('region-a')
      expect(Number(diagram().querySelector('[data-note="unhealthy"]')!.getAttribute('y'))).toBeGreaterThan(regionA.y + regionA.height)
      const wording = visualsByTopicId.route53.diagrams['health-answers'].scenarios.find(({ id }) => id === scenario.id)!
      expect(container.querySelector('figcaption')!.textContent).toBe(wording.caption)
      expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
      expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')

      await selectScenario('전체')

      for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
      expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
      expect(ids('[data-note]', 'data-note')).toEqual(['query'])
    })

    it('경로 양 끝이 두 노드의 변에 닿는다', async () => {
      render(<Route53HealthDiagram />)
      const paths = await collectPaths()

      for (const [id, [from, to]] of Object.entries(pathEnds)) {
        const { start, end } = endpoints(paths.get(id)!)
        expect(onEdge(start, nodeBox(from)), `${id} 시작`).toBe(true)
        expect(onEdge(end, nodeBox(to)), `${id} 끝`).toBe(true)
      }
    })

    // 세로형은 사용자·Route 53을 가운데 위아래로, 두 리전을 그 아래 나란히 두지만, 가로형은 왼쪽에서 오른쪽으로 흐른다.
    it('사용자 → Route 53 → 두 리전이 왼쪽에서 오른쪽이고 두 리전은 같은 열에서 A가 B 위이며 색은 세로형과 같다', () => {
      render(<Route53HealthDiagram />)
      const user = nodeBox('user'), route53 = nodeBox('route53'), a = nodeBox('region-a'), b = nodeBox('region-b')

      expect(user.x + user.width).toBeLessThan(route53.x)
      expect(route53.x + route53.width).toBeLessThan(a.x)
      expect(a.x).toBe(b.x)
      expect(a.width).toBe(b.width)
      expect(a.y + a.height).toBeLessThan(b.y)
      for (const [id, color] of Object.entries({ user: 'stroke-disabled', route53: 'stroke-diagram-managed', 'region-a': 'stroke-diagram-resource', 'region-b': 'stroke-diagram-resource' })) {
        expect(diagram().querySelector(`[data-node="${id}"] rect`)).toHaveClass(color)
      }
    })

    // 세로형은 예시 곁말을 질의 화살표(x 140) 오른쪽, 두 노드 사이에 둔다. 가로형의 질의 화살표는 사용자 가운데 높이로 지난다.
    it.each(['전체', '단순', '페일오버', '다중값 응답'])('%s: 예시 곁말이 사용자와 Route 53 사이, 질의 화살표 위에 보이고 user의 opacity를 따른다', async (label) => {
      render(<Route53HealthDiagram />)
      if (label !== '전체') await selectScenario(label)
      const query = diagram().querySelector('[data-note="query"]')!
      const box = noteBox(query)
      const user = nodeBox('user'), route53 = nodeBox('route53')

      expect(query.textContent).toBe(notes.query)
      expect(query).toHaveAttribute('opacity', diagram().querySelector('[data-node="user"]')!.getAttribute('opacity'))
      expect(box.x).toBeGreaterThan(user.x + user.width)
      expect(box.x + box.width).toBeLessThan(route53.x)
      expect(box.y + box.height).toBeLessThan(user.y + user.height / 2)
      expect(boxesOutsideViewBox([box], [0, 0, 440, 136])).toEqual([])
    })

    // 정책 곁말은 리전으로 들어가는 화살표 위, Route 53과 리전 사이에 둔다.
    it('주·응답에서 빠짐 곁말은 리전 A로 가는 화살표 위에, 보조 곁말은 리전 B로 가는 화살표 위에 있다', async () => {
      render(<Route53HealthDiagram />)
      const paths = await collectPaths()
      const toA = endpoints(paths.get('route53-region-a')!).end
      const toB = endpoints(paths.get('route53-region-b')!).end

      for (const [label, id, arrow] of [['페일오버', 'primary', toA], ['페일오버', 'secondary', toB], ['다중값 응답', 'dropped', toA]] as const) {
        await selectScenario(label)
        const box = noteBox(diagram().querySelector(`[data-note="${id}"]`)!)
        expect(box.y + box.height, id).toBeLessThan(arrow.y)
        expect(box.y + box.height, id).toBeGreaterThan(arrow.y - 16)
        expect(box.x, id).toBeGreaterThan(nodeBox('route53').x)
        expect(box.x + box.width, id).toBeLessThan(arrow.x)
      }
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<Route53HealthDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 244')
      await selectScenario('페일오버')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '페일오버' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(ids('[data-path]', 'data-path')).toEqual(['route53-region-b', 'user-route53'])
      expect(ids('[data-note]', 'data-note')).toEqual(['primary', 'query', 'secondary', 'unhealthy'])
    })
  })
})
