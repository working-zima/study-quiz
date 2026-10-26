import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { VpcDestinationDiagram, vpcDestinationScenarios } from './VpcDestinationDiagram'

const diagramText = visualsByTopicId['vpc-networking'].diagrams['vpc-destination']
const destinations = [
  { id: 'd1', group: 'internet', label: '인터넷', nodes: ['inet-ipv4', 'inet-ipv6', 'inet-both'] },
  { id: 'd2', group: 'services', label: 'AWS 서비스', nodes: ['svc-gateway', 'svc-interface', 'svc-no-public'] },
  { id: 'd3', group: 'application', label: '다른 VPC의 앱', nodes: ['app-private', 'app-scope', 'app-routing'] },
  { id: 'd4', group: 'vpcs', label: '다른 VPC 전체', nodes: ['vpc-pair', 'vpc-many', 'vpc-isolated'] },
]

function diagram() {
  return screen.getByRole('img', { name: 'VPC 목적지별 선택' })
}

function readBox(rect: Element) {
  return {
    id: rect.parentElement?.getAttribute('data-node') ?? rect.getAttribute('data-group') ?? '',
    x: Number(rect.getAttribute('x')),
    y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')),
    height: Number(rect.getAttribute('height')),
  }
}

async function selectDestination(label: string) {
  await act(async () => {
    await userEvent.click(screen.getByRole('button', { name: label }))
  })
}

describe('VpcDestinationDiagram', () => {
  it('처음에는 지정한 노드 열둘이 모두 선명하고 목적지부터 고르도록 안내한다', () => {
    const { container } = render(<VpcDestinationDiagram />)
    const nodes = Array.from(diagram().querySelectorAll('[data-node]'))

    expect(nodes.map((node) => node.getAttribute('data-node'))).toEqual(destinations.flatMap(({ nodes }) => nodes))
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(diagramText.idleCaption)
    expect(diagramText.idleCaption).toMatch(/목적지.*고르/)
  })

  it.each(destinations)('$label을 고르면 그 그룹 셋만 선명하고 그룹 박스와 라벨은 흐려지지 않는다', async (destination) => {
    const { container } = render(<VpcDestinationDiagram />)
    await selectDestination(destination.label)

    expect(diagram().querySelectorAll('[data-node][opacity="1"]')).toHaveLength(3)
    expect(diagram().querySelectorAll('[data-node][opacity="0.25"]')).toHaveLength(9)
    for (const node of diagram().querySelectorAll('[data-node]')) {
      expect(node).toHaveAttribute('opacity', destination.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
    }
    for (const group of diagram().querySelectorAll('[data-group]')) {
      expect(group.closest('[opacity]')).toBeNull()
    }
    for (const { label } of destinations) {
      expect(within(diagram()).getByText(label).closest('[opacity]')).toBeNull()
    }
    expect(container.querySelector('figcaption')!.textContent).toBe(diagramText.scenarios.find(({ id }) => id === destination.id)!.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: destination.label })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('다른 목적지로 바꾸면 이전 선택이 풀리고 전체로 돌아오면 열둘이 다시 선명하다', async () => {
    const { container } = render(<VpcDestinationDiagram />)
    await selectDestination('인터넷')
    await selectDestination('다른 VPC의 앱')

    expect(screen.getByRole('button', { name: '인터넷' })).toHaveAttribute('aria-pressed', 'false')
    expect(Array.from(diagram().querySelectorAll('[data-node][opacity="1"]'), (node) => node.getAttribute('data-node')))
      .toEqual(destinations[2].nodes)

    await selectDestination('전체')

    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(container.querySelector('figcaption')!.textContent).toBe(diagramText.idleCaption)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('관문 5: 노드와 그룹을 포함한 모든 rect가 viewBox 안에 있다', () => {
    render(<VpcDestinationDiagram />)
    const [x, y, width, height] = diagram().getAttribute('viewBox')!.split(' ').map(Number)
    const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)

    expect(boxes).toHaveLength(16)
    expect(boxesOutsideViewBox(boxes, [x, y, width, height])).toEqual([])
  })

  it('관문 6: 240×44 노드의 조건(9)과 답(10)이 각각 여백 12를 남기고 들어간다', () => {
    render(<VpcDestinationDiagram />)

    for (const node of diagram().querySelectorAll('[data-node]')) {
      const id = node.getAttribute('data-node')!
      const box = readBox(node.querySelector('rect')!)
      const lines = Array.from(node.querySelectorAll('text'))
      expect(box.width).toBe(240)
      expect(box.height).toBe(44)
      expect(lines).toHaveLength(2)
      expect(lines[0].textContent).toBe(diagramText.nodeNotes![id])
      expect(lines[1].textContent).toBe(diagramText.nodes[id])
      expect(lines[0]).toHaveClass('fill-muted')
      expect(lines[1]).toHaveClass('fill-title')
      for (const [index, fontSize] of [9, 10].entries()) {
        const line = lines[index]
        expect(line.textContent!.trim().length).toBeGreaterThan(0)
        expect(line).toHaveAttribute('font-size', String(fontSize))
        expect(estimateTextWidth(line.textContent!, fontSize) + 12, `${id}: ${line.textContent}`).toBeLessThanOrEqual(box.width)
        expect(Number(line.getAttribute('y'))).toBeGreaterThan(box.y)
        expect(Number(line.getAttribute('y'))).toBeLessThan(box.y + box.height)
      }
      expect(Number(lines[0].getAttribute('y'))).toBeLessThan(Number(lines[1].getAttribute('y')))
    }
  })

  it('관문 7: viewBox 폭은 280이고 모바일 여백 보정과 좌측 정렬을 유지한다', () => {
    render(<VpcDestinationDiagram />)

    expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(280)
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
  })

  it('그룹 넷은 지정한 순서로 쌓이고 노드 셋은 자기 그룹 안에서 겹치지 않는다', () => {
    render(<VpcDestinationDiagram />)
    const groups = Array.from(diagram().querySelectorAll('[data-group]'), readBox)
    expect(groups.map(({ id }) => id)).toEqual(destinations.map(({ group }) => group))

    for (const [index, { group, label, nodes }] of destinations.entries()) {
      const box = groups[index]
      expect(diagramText.groups![group]).toBe(label)
      expect(within(diagram()).getByText(label)).toHaveAttribute('font-size', '9')
      if (index > 0) expect(groups[index - 1].y + groups[index - 1].height).toBeLessThan(box.y)
      const children = nodes.map((id) => readBox(diagram().querySelector(`[data-node="${id}"] rect`)!))
      expect(boxesOutsideViewBox(children, [box.x, box.y, box.width, box.height]), group).toEqual([])
      for (let i = 1; i < children.length; i++) {
        expect(children[i - 1].y + children[i - 1].height).toBeLessThan(children[i].y)
      }
    }
  })

  it('문구와 시나리오는 JSON에서 읽고 모든 id가 좌표와 일치한다', () => {
    render(<VpcDestinationDiagram />)
    const ids = destinations.flatMap(({ nodes }) => nodes).sort()

    expect(screen.getByRole('figure', { name: diagramText.label })).toBeInTheDocument()
    expect(diagram()).toHaveAttribute('aria-label', diagramText.svgLabel)
    expect(screen.getAllByRole('button')).toHaveLength(5)
    expect(Object.keys(diagramText.nodes).sort()).toEqual(ids)
    expect(Object.keys(diagramText.nodeNotes!).sort()).toEqual(ids)
    expect(Object.keys(diagramText.groups!).sort()).toEqual(destinations.map(({ group }) => group).sort())
    expect(diagramText.sources).toEqual(['vpc-networking.comparison'])
    expect(diagramText.scenarios.map(({ id }) => id)).toEqual(destinations.map(({ id }) => id))
    expect(vpcDestinationScenarios.map(({ id }) => id)).toEqual(diagramText.scenarios.map(({ id }) => id))
    for (const [index, scenario] of vpcDestinationScenarios.entries()) {
      const { id, label, caption } = diagramText.scenarios[index]
      expect(scenario).toEqual({ id, label, caption, nodes: destinations[index].nodes, paths: [] })
    }
  })

  it('경로선·화살표 없이 무채색 글자로 조건과 답을 표시한다', async () => {
    render(<VpcDestinationDiagram />)

    for (const label of ['전체', ...destinations.map(({ label }) => label)]) {
      await selectDestination(label)
      expect(diagram().querySelector('path, line, polyline, polygon, marker')).toBeNull()
      expect(diagram().querySelector('[fill], [stroke], [style]')).toBeNull()
      for (const element of diagram().querySelectorAll('[class]')) {
        const paintClasses = element.getAttribute('class')!.split(' ').filter((name) => /^(fill|stroke)-/.test(name))
        for (const name of paintClasses) expect(['fill-none', 'fill-panel', 'fill-muted', 'fill-title', 'stroke-disabled']).toContain(name)
      }
      expect(diagram()).not.toHaveTextContent(/온프레미스|Direct Connect|[✕✖❌×]|\bX\b/)
      expect(diagram().querySelector('.line-through, del, s')).toBeNull()
    }
  })

  it.each([2, 4] as const)('h%i 공유 본문에서 comparison 뒤에 표, 지도, 목적지 도식이 차례로 온다', (headingLevel) => {
    const comparison = topics.find(({ id }) => id === 'vpc-networking')!.concepts.find(({ id }) => id === 'vpc-networking.comparison')!
    render(<ConceptList concepts={[comparison]} headingLevel={headingLevel} />)
    const figures = screen.getAllByRole('figure')

    expect(figures).toHaveLength(3)
    expect(figures[0]).toHaveAttribute('aria-label', 'NAT 게이트웨이, VPC Endpoint, PrivateLink, VPC 피어링')
    expect(figures[1]).toHaveAttribute('aria-label', 'VPC 통신 경로 도식')
    expect(figures[2]).toHaveAttribute('aria-label', diagramText.label)
    expect(figures[0].previousElementSibling).toHaveTextContent(comparison.paragraphs[comparison.paragraphs.length - 1])
    expect(figures[1].previousElementSibling).toBe(figures[0])
    expect(figures[2].previousElementSibling).toBe(figures[1])
    for (const figure of figures) {
      expect(figure.closest('article')).toHaveAttribute('id', comparison.id)
      expect(within(figure).queryByRole('heading')).toBeNull()
    }
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

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×400 viewBox를 w-full 래퍼 하나로 그리고 SVG 속성을 유지한다', () => {
      render(<VpcDestinationDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 400')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram()).toHaveAttribute('aria-label', diagramText.svgLabel)
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드 id 집합과 그룹 순서를 세로형과 같이 유지한다', () => {
      render(<VpcDestinationDiagram />)

      expect(Array.from(diagram().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node')))
        .toEqual(destinations.flatMap(({ nodes }) => nodes))
      expect(Array.from(diagram().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group')))
        .toEqual(destinations.map(({ group }) => group))
    })

    it('노드와 그룹을 포함한 모든 rect가 440×400 viewBox 안에 있다', () => {
      render(<VpcDestinationDiagram />)
      const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)

      expect(boxes).toHaveLength(16)
      expect(boxesOutsideViewBox(boxes, [0, 0, 440, 400])).toEqual([])
    })

    it('노드 두 줄과 그룹 라벨이 글자 크기를 유지하며 각 상자 안에 들어간다', () => {
      render(<VpcDestinationDiagram />)

      for (const node of diagram().querySelectorAll('[data-node]')) {
        const id = node.getAttribute('data-node')!
        const box = readBox(node.querySelector('rect')!)
        const lines = Array.from(node.querySelectorAll('text'))
        expect(box.width).toBe(184)
        expect(box.height).toBe(44)
        expect(lines).toHaveLength(2)
        expect(lines[0].textContent).toBe(diagramText.nodeNotes![id])
        expect(lines[1].textContent).toBe(diagramText.nodes[id])
        expect(lines[0]).toHaveClass('fill-muted')
        expect(lines[1]).toHaveClass('fill-title')
        for (const [index, fontSize] of [9, 10].entries()) {
          const line = lines[index]
          expect(line.textContent!.trim().length).toBeGreaterThan(0)
          expect(line).toHaveAttribute('font-size', String(fontSize))
          expect(estimateTextWidth(line.textContent!, fontSize) + 12, `${id}: ${line.textContent}`).toBeLessThanOrEqual(box.width)
          expect(Number(line.getAttribute('x'))).toBe(box.x + box.width / 2)
          expect(Number(line.getAttribute('y'))).toBe(box.y + (index === 0 ? 13 : 31))
        }
      }

      for (const rect of diagram().querySelectorAll('[data-group]')) {
        const box = readBox(rect)
        const label = rect.parentElement!.querySelector('text')!
        const x = Number(label.getAttribute('x'))
        expect(label.textContent).toBe(diagramText.groups![box.id])
        expect(label).toHaveAttribute('font-size', '9')
        expect(label).toHaveClass('fill-muted')
        expect(x).toBeGreaterThan(box.x)
        expect(x + estimateTextWidth(label.textContent!, 9)).toBeLessThanOrEqual(box.x + box.width)
        expect(Number(label.getAttribute('y'))).toBe(box.y + 14)
      }
    })

    it('그룹 넷이 읽는 순서대로 2×2에 놓이고 서로 겹치지 않는다', () => {
      render(<VpcDestinationDiagram />)
      const groups = Array.from(diagram().querySelectorAll('[data-group]'), readBox)
      const [internet, services, application, vpcs] = groups

      expect(internet.y).toBe(services.y)
      expect(application.y).toBe(vpcs.y)
      expect(internet.x).toBe(application.x)
      expect(services.x).toBe(vpcs.x)
      expect(internet.y + internet.height).toBeLessThan(application.y)
      expect(services.y + services.height).toBeLessThan(vpcs.y)
      expect(internet.x + internet.width).toBeLessThan(services.x)
      expect(application.x + application.width).toBeLessThan(vpcs.x)
      for (const [index, box] of groups.entries()) {
        expect(box.width).toBe(208)
        expect(box.height).toBe(184)
        for (const other of groups.slice(index + 1)) {
          const overlapX = Math.min(box.x + box.width, other.x + other.width) - Math.max(box.x, other.x)
          const overlapY = Math.min(box.y + box.height, other.y + other.height) - Math.max(box.y, other.y)
          expect(overlapX > 0 && overlapY > 0, `${box.id} / ${other.id}`).toBe(false)
        }
      }
    })

    it('목적지마다 노드 셋이 자기 그룹 안에서 위아래로 겹치지 않고 쌓인다', () => {
      render(<VpcDestinationDiagram />)

      for (const { group, nodes } of destinations) {
        const box = readBox(diagram().querySelector(`[data-group="${group}"]`)!)
        const children = nodes.map((id) => readBox(diagram().querySelector(`[data-node="${id}"] rect`)!))
        expect(children).toHaveLength(3)
        expect(boxesOutsideViewBox(children, [box.x, box.y, box.width, box.height]), group).toEqual([])
        for (let i = 1; i < children.length; i++) {
          expect(children[i - 1].x).toBe(children[i].x)
          expect(children[i - 1].y + children[i - 1].height).toBeLessThan(children[i].y)
        }
      }
    })

    it.each(destinations)('$label을 고르면 그 그룹 셋만 선명하고 그룹 박스와 라벨은 흐려지지 않는다', async (destination) => {
      const { container } = render(<VpcDestinationDiagram />)
      await selectDestination(destination.label)

      expect(diagram().querySelectorAll('[data-node][opacity="1"]')).toHaveLength(3)
      expect(diagram().querySelectorAll('[data-node][opacity="0.25"]')).toHaveLength(9)
      for (const node of diagram().querySelectorAll('[data-node]')) {
        expect(node).toHaveAttribute('opacity', destination.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
      }
      for (const group of diagram().querySelectorAll('[data-group]')) {
        expect(group.closest('[opacity]')).toBeNull()
      }
      for (const { label } of destinations) {
        expect(within(diagram()).getByText(label).closest('[opacity]')).toBeNull()
      }
      expect(container.querySelector('figcaption')!.textContent).toBe(diagramText.scenarios.find(({ id }) => id === destination.id)!.caption)
      expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
      expect(screen.getByRole('button', { name: destination.label })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
    })

    it('세로형에서 고른 목적지와 캡션이 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<VpcDestinationDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 800')
      await selectDestination('다른 VPC의 앱')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 400')
      expect(screen.getByRole('button', { name: '다른 VPC의 앱' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(Array.from(diagram().querySelectorAll('[data-node][opacity="1"]'), (node) => node.getAttribute('data-node')))
        .toEqual(destinations[2].nodes)

      act(() => change(false))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 800')
      expect(screen.getByRole('button', { name: '다른 VPC의 앱' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
    })
  })
})
