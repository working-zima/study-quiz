import { act, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { diagramsByConceptId } from './registry'
import { VpcScopeDiagram } from './VpcScopeDiagram'

const diagramText = visualsByTopicId['vpc-networking'].diagrams['vpc-scope']
const nodeIds = ['s3', 'igw', 'nat-a', 'nat-b', 'ec2-a', 'ec2-b']
const groupIds = ['region', 'vpc', 'az-a', 'az-b', 'public-a', 'public-b', 'private-a', 'private-b']

function diagram() {
  return screen.getByRole('img', { name: diagramText.svgLabel })
}

function readBox(rect: Element): SvgBox {
  return {
    id: rect.parentElement?.getAttribute('data-node') ?? rect.getAttribute('data-group') ?? '',
    x: Number(rect.getAttribute('x')),
    y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')),
    height: Number(rect.getAttribute('height')),
  }
}

function node(id: string) {
  return readBox(diagram().querySelector(`[data-node="${id}"] rect`)!)
}

function group(id: string) {
  return readBox(diagram().querySelector(`[data-group="${id}"]`)!)
}

function inside(child: SvgBox, parent: SvgBox) {
  return boxesOutsideViewBox([child], [parent.x, parent.y, parent.width, parent.height])
}

function overlapArea(a: SvgBox, b: SvgBox) {
  const width = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)
  const height = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y)
  return Math.max(0, width) * Math.max(0, height)
}

describe('VpcScopeDiagram', () => {
  it('정적 도식이라 시나리오 버튼이 하나도 없고 캡션은 idleCaption이다', () => {
    const { container } = render(<VpcScopeDiagram />)

    expect(screen.queryAllByRole('button')).toHaveLength(0)
    expect(screen.queryByRole('button', { name: '전체' })).toBeNull()
    expect(diagramText.scenarios).toEqual([])
    expect(container.querySelector('figcaption')!.textContent).toBe(diagramText.idleCaption)
    expect(screen.getByText(diagramText.legend!)).toBeInTheDocument()
  })

  it('노드는 지정한 여섯뿐이고 그룹은 지정한 여덟이다', () => {
    render(<VpcScopeDiagram />)

    expect(Array.from(diagram().querySelectorAll('[data-node]'), (el) => el.getAttribute('data-node'))).toEqual(nodeIds)
    expect(Array.from(diagram().querySelectorAll('[data-group]'), (el) => el.getAttribute('data-group'))).toEqual(groupIds)
    expect(Object.keys(diagramText.nodes)).toEqual(nodeIds)
    expect(Object.keys(diagramText.groups!)).toEqual(groupIds)
    for (const id of nodeIds) expect(within(diagram().querySelector(`[data-node="${id}"]`) as HTMLElement).getByText(diagramText.nodes[id])).toBeInTheDocument()
  })

  it('그룹은 리전 > VPC > 가용 영역 > 서브넷으로 중첩되고 가용 영역 둘은 위아래로 쌓인다', () => {
    render(<VpcScopeDiagram />)

    expect(inside(group('vpc'), group('region'))).toEqual([])
    for (const az of ['a', 'b']) {
      expect(inside(group(`az-${az}`), group('vpc'))).toEqual([])
      expect(inside(group(`public-${az}`), group(`az-${az}`))).toEqual([])
      expect(inside(group(`private-${az}`), group(`az-${az}`))).toEqual([])
      expect(overlapArea(group(`public-${az}`), group(`private-${az}`))).toBe(0)
      expect(group(`public-${az}`).x).toBeLessThan(group(`private-${az}`).x)
    }
    expect(group('az-a').y + group('az-a').height).toBeLessThan(group('az-b').y)
  })

  it('인터넷 게이트웨이는 VPC 안, 두 가용 영역 어느 쪽에도 겹치지 않는 자리에 하나만 있다', () => {
    render(<VpcScopeDiagram />)

    expect(diagram().querySelectorAll('[data-node="igw"]')).toHaveLength(1)
    expect(inside(node('igw'), group('vpc'))).toEqual([])
    expect(overlapArea(node('igw'), group('az-a'))).toBe(0)
    expect(overlapArea(node('igw'), group('az-b'))).toBe(0)
  })

  it('NAT 게이트웨이는 가용 영역마다 퍼블릭 서브넷 안에, EC2는 프라이빗 서브넷 안에 있다', () => {
    render(<VpcScopeDiagram />)

    expect(inside(node('nat-a'), group('public-a'))).toEqual([])
    expect(inside(node('nat-b'), group('public-b'))).toEqual([])
    expect(inside(node('ec2-a'), group('private-a'))).toEqual([])
    expect(inside(node('ec2-b'), group('private-b'))).toEqual([])
  })

  it('S3는 리전 안에 있고 VPC와 겹치지 않는다', () => {
    render(<VpcScopeDiagram />)

    expect(inside(node('s3'), group('region'))).toEqual([])
    expect(overlapArea(node('s3'), group('vpc'))).toBe(0)
  })

  it('색은 S3에 AWS 관리, NAT·EC2에 서브넷 자원, 인터넷 게이트웨이에 무채색을 쓰고 경로선이 없다', () => {
    render(<VpcScopeDiagram />)
    const stroke = (id: string) => diagram().querySelector(`[data-node="${id}"] rect`)!.getAttribute('class')

    expect(stroke('s3')).toContain('stroke-diagram-managed')
    expect(stroke('igw')).toContain('stroke-disabled')
    for (const id of ['nat-a', 'nat-b', 'ec2-a', 'ec2-b']) expect(stroke(id)).toContain('stroke-diagram-resource')
    expect(diagram().querySelector('path, line, polyline, polygon, marker')).toBeNull()
    for (const el of diagram().querySelectorAll('[data-node]')) expect(el).toHaveAttribute('opacity', '1')
  })

  it('관문 5: 노드와 그룹을 포함한 모든 rect가 viewBox 안에 있다', () => {
    render(<VpcScopeDiagram />)
    const [x, y, width, height] = diagram().getAttribute('viewBox')!.split(' ').map(Number)
    const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)

    expect(boxes).toHaveLength(14)
    expect(boxesOutsideViewBox(boxes, [x, y, width, height])).toEqual([])
  })

  it('관문 6: 노드 라벨(10)이 여백 12를 남기고 들어가고 그룹 라벨은 9다', () => {
    render(<VpcScopeDiagram />)

    for (const el of diagram().querySelectorAll('[data-node]')) {
      const box = readBox(el.querySelector('rect')!)
      const label = el.querySelector('text')!
      expect(label).toHaveAttribute('font-size', '10')
      expect(estimateTextWidth(label.textContent!, 10) + 12, label.textContent!).toBeLessThanOrEqual(box.width)
    }
    for (const id of groupIds) {
      const label = diagram().querySelector(`[data-group-label="${id}"]`)!
      expect(label.textContent).toBe(diagramText.groups![id])
      expect(label.closest('[font-size]')).toHaveAttribute('font-size', '9')
      const box = group(id)
      expect(Number(label.getAttribute('x')) + estimateTextWidth(label.textContent!, 9)).toBeLessThanOrEqual(box.x + box.width)
    }
  })

  it('관문 7: viewBox 폭은 280이고 모바일 여백 보정과 좌측 정렬을 유지한다', () => {
    render(<VpcScopeDiagram />)

    expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(280)
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
  })

  it('근거 개념을 적고 인터넷 게이트웨이 개념 본문 뒤에 붙는다', () => {
    expect(diagramText.sources).toEqual([
      'vpc-networking.internet-gateway-is-not-per-az',
      'vpc-networking.nat-gateway-per-az',
      'vpc-networking.s3-is-regional',
    ])
    expect(diagramsByConceptId['vpc-networking.internet-gateway-is-not-per-az']).toBe(VpcScopeDiagram)

    const concept = topics.find(({ id }) => id === 'vpc-networking')!.concepts.find(({ id }) => id === 'vpc-networking.internet-gateway-is-not-per-az')!
    render(<ConceptList concepts={[concept]} headingLevel={2} />)
    const figure = screen.getByRole('figure', { name: diagramText.label })
    expect(figure.previousElementSibling).toHaveTextContent(concept.paragraphs[concept.paragraphs.length - 1])
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

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×240 viewBox를 w-full 래퍼 하나로 그리고 SVG 속성을 유지한다', () => {
      render(<VpcScopeDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 240')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram()).toHaveAttribute('aria-label', diagramText.svgLabel)
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드 id와 그룹 id가 세로형과 같다', () => {
      const { change } = mockMatchMedia(false)
      render(<VpcScopeDiagram />)
      const ids = (attribute: string) => Array.from(diagram().querySelectorAll(`[${attribute}]`), (el) => el.getAttribute(attribute))
      const tallNodes = ids('data-node')
      const tallGroups = ids('data-group')
      expect(tallNodes).toEqual(nodeIds)
      expect(tallGroups).toEqual(groupIds)

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 240')
      expect(ids('data-node')).toEqual(tallNodes)
      expect(ids('data-group')).toEqual(tallGroups)
      for (const id of nodeIds) expect(within(diagram().querySelector(`[data-node="${id}"]`) as HTMLElement).getByText(diagramText.nodes[id])).toBeInTheDocument()
    })

    it('노드와 그룹을 포함한 모든 rect가 440×240 viewBox 안에 있다', () => {
      render(<VpcScopeDiagram />)
      const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)

      expect(boxes).toHaveLength(14)
      expect(boxesOutsideViewBox(boxes, [0, 0, 440, 240])).toEqual([])
    })

    it('노드 라벨(10)이 여백 12를 남기고 들어가고 그룹 라벨(9)은 자기 박스 안에 있다', () => {
      render(<VpcScopeDiagram />)

      for (const el of diagram().querySelectorAll('[data-node]')) {
        const box = readBox(el.querySelector('rect')!)
        const label = el.querySelector('text')!
        expect(box.height).toBe(32)
        expect(label).toHaveAttribute('font-size', '10')
        expect(Number(label.getAttribute('x'))).toBe(box.x + box.width / 2)
        expect(Number(label.getAttribute('y'))).toBe(box.y + 16)
        expect(estimateTextWidth(label.textContent!, 10) + 12, label.textContent!).toBeLessThanOrEqual(box.width)
      }
      for (const id of groupIds) {
        const label = diagram().querySelector(`[data-group-label="${id}"]`)!
        const box = group(id)
        expect(label.textContent).toBe(diagramText.groups![id])
        expect(label.closest('[font-size]')).toHaveAttribute('font-size', '9')
        expect(Number(label.getAttribute('x'))).toBe(box.x + 10)
        expect(Number(label.getAttribute('y'))).toBe(box.y + 14)
        expect(Number(label.getAttribute('x')) + estimateTextWidth(label.textContent!, 9), id).toBeLessThanOrEqual(box.x + box.width)
      }
    })

    it('그룹은 리전 > VPC > 가용 영역 > 서브넷으로 중첩되고 가용 영역 둘은 위아래로 쌓인다', () => {
      render(<VpcScopeDiagram />)

      expect(inside(group('vpc'), group('region'))).toEqual([])
      for (const az of ['a', 'b']) {
        expect(inside(group(`az-${az}`), group('vpc'))).toEqual([])
        expect(inside(group(`public-${az}`), group(`az-${az}`))).toEqual([])
        expect(inside(group(`private-${az}`), group(`az-${az}`))).toEqual([])
        expect(overlapArea(group(`public-${az}`), group(`private-${az}`))).toBe(0)
        expect(group(`public-${az}`).x).toBeLessThan(group(`private-${az}`).x)
      }
      expect(group('az-a').y + group('az-a').height).toBeLessThan(group('az-b').y)
    })

    it('인터넷 게이트웨이는 VPC 안·가용 영역 밖, NAT는 퍼블릭·EC2는 프라이빗 서브넷 안, S3는 리전 안·VPC 밖에 있다', () => {
      render(<VpcScopeDiagram />)

      expect(diagram().querySelectorAll('[data-node="igw"]')).toHaveLength(1)
      expect(inside(node('igw'), group('vpc'))).toEqual([])
      expect(overlapArea(node('igw'), group('az-a'))).toBe(0)
      expect(overlapArea(node('igw'), group('az-b'))).toBe(0)
      expect(inside(node('nat-a'), group('public-a'))).toEqual([])
      expect(inside(node('nat-b'), group('public-b'))).toEqual([])
      expect(inside(node('ec2-a'), group('private-a'))).toEqual([])
      expect(inside(node('ec2-b'), group('private-b'))).toEqual([])
      expect(inside(node('s3'), group('region'))).toEqual([])
      expect(overlapArea(node('s3'), group('vpc'))).toBe(0)
    })

    it('S3와 인터넷 게이트웨이가 가용 영역보다 왼쪽에 선다', () => {
      render(<VpcScopeDiagram />)

      for (const id of ['s3', 'igw']) {
        for (const az of ['az-a', 'az-b']) expect(node(id).x + node(id).width, `${id} · ${az}`).toBeLessThan(group(az).x)
      }
      expect(node('s3').x + node('s3').width).toBeLessThan(group('vpc').x)
    })

    it('색과 opacity를 세로형과 같이 쓰고 경로선이 없다', () => {
      render(<VpcScopeDiagram />)
      const stroke = (id: string) => diagram().querySelector(`[data-node="${id}"] rect`)!.getAttribute('class')

      expect(stroke('s3')).toContain('stroke-diagram-managed')
      expect(stroke('igw')).toContain('stroke-disabled')
      for (const id of ['nat-a', 'nat-b', 'ec2-a', 'ec2-b']) expect(stroke(id)).toContain('stroke-diagram-resource')
      expect(diagram().querySelector('path, line, polyline, polygon, marker')).toBeNull()
      for (const el of diagram().querySelectorAll('[data-node]')) expect(el).toHaveAttribute('opacity', '1')
    })

    it('폭이 바뀌면 다시 그린다', () => {
      const { change } = mockMatchMedia(false)
      render(<VpcScopeDiagram />)
      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(280)

      act(() => change(true))
      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)

      act(() => change(false))
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 372')
    })
  })
})
