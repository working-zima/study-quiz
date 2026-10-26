import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { PeeringScaleDiagram, peeringScaleScenarios } from './PeeringScaleDiagram'
import { diagramsByConceptId } from './registry'

const diagramText = visualsByTopicId['vpc-networking'].diagrams['peering-scale']
const conceptId = 'vpc-networking.vpc-peering-scaling-limit'

function diagram() {
  return screen.getByRole('img', { name: diagramText.svgLabel })
}

async function select(label: string) {
  await act(async () => {
    await userEvent.click(screen.getByRole('button', { name: label }))
  })
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

const group = (id: string) => readBox(diagram().querySelector(`[data-group="${id}"]`)!)
const inside = (child: SvgBox, parent: SvgBox) => boxesOutsideViewBox([child], [parent.x, parent.y, parent.width, parent.height])
const vpcBoxes = (groupId: string) => Array.from(diagram().querySelectorAll(`[data-ring="${groupId}"] [data-node] rect`), readBox)
const count = (selector: string) => diagram().querySelectorAll(selector).length
const note = (groupId: string) => diagram().querySelector(`[data-count-note="${groupId}"]`)!.textContent

function overlapArea(a: SvgBox, b: SvgBox) {
  const width = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)
  const height = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y)
  return Math.max(0, width) * Math.max(0, height)
}

describe('PeeringScaleDiagram', () => {
  it('전체에서는 VPC 4개로 메시 선 6개, 허브 선 4개를 그리고 캡션은 idleCaption이다', () => {
    const { container } = render(<PeeringScaleDiagram />)

    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(vpcBoxes('mesh')).toHaveLength(4)
    expect(vpcBoxes('hub')).toHaveLength(4)
    expect(count('[data-mesh-line]')).toBe(6)
    expect(count('[data-hub-line]')).toBe(4)
    expect(note('mesh')).toBe('연결 6개')
    expect(note('hub')).toBe('연결 4개')
    expect(container.querySelector('figcaption')!.textContent).toBe(diagramText.idleCaption)
  })

  it.each([
    ['p3', 'VPC 3개', 3, 3, 3],
    ['p6', 'VPC 6개', 6, 15, 6],
    ['p10', 'VPC 10개', 10, 45, 10],
  ] as const)('%s: VPC %s에서 메시 선 %i개·허브 선 %i개가 곁말과 같다', async (id, label, vpcs, mesh, hub) => {
    const { container } = render(<PeeringScaleDiagram />)
    await select(label)

    expect(vpcBoxes('mesh')).toHaveLength(vpcs)
    expect(vpcBoxes('hub')).toHaveLength(vpcs)
    expect(count('[data-mesh-line]')).toBe(mesh)
    expect(count('[data-hub-line]')).toBe(hub)
    expect(note('mesh')).toBe(`연결 ${mesh}개`)
    expect(note('hub')).toBe(`연결 ${hub}개`)
    const caption = container.querySelector('figcaption')!.textContent!
    expect(caption).toBe(diagramText.scenarios.find((s) => s.id === id)!.caption)
    expect(caption).toContain(`${mesh}개`)
    for (const el of diagram().querySelectorAll('[opacity]')) expect(el).toHaveAttribute('opacity', '1')
  })

  it('p10에서 VPC 상자끼리, 그리고 Transit Gateway와 겹치지 않는다', async () => {
    render(<PeeringScaleDiagram />)
    await select('VPC 10개')

    for (const groupId of ['mesh', 'hub']) {
      const boxes = vpcBoxes(groupId)
      for (let i = 0; i < boxes.length; i += 1) {
        for (let j = i + 1; j < boxes.length; j += 1) {
          expect(overlapArea(boxes[i], boxes[j]), `${groupId} ${i}-${j}`).toBe(0)
        }
        expect(inside(boxes[i], group(groupId))).toEqual([])
      }
    }
    const tgw = readBox(diagram().querySelector('[data-node="tgw"] rect')!)
    for (const box of vpcBoxes('hub')) expect(overlapArea(box, tgw)).toBe(0)
    expect(inside(tgw, group('hub'))).toEqual([])
  })

  it('전제는 idleCaption과 모든 캡션에 있다', () => {
    for (const caption of [diagramText.idleCaption, ...diagramText.scenarios.map((s) => s.caption)]) {
      expect(caption).toContain('모든 VPC가 서로 통신해야 한다면')
    }
  })

  it('JSON과 컴포넌트 시나리오의 id·순서가 같고 버튼은 전체 포함 넷이다', () => {
    expect(peeringScaleScenarios.map(({ id }) => id)).toEqual(['p3', 'p6', 'p10'])
    expect(diagramText.scenarios.map(({ id }) => id)).toEqual(['p3', 'p6', 'p10'])
    render(<PeeringScaleDiagram />)
    expect(screen.getAllByRole('button')).toHaveLength(4)
    expect(screen.queryByRole('slider')).toBeNull()
    expect(screen.queryByRole('spinbutton')).toBeNull()
  })

  it.each(['전체', 'VPC 3개', 'VPC 6개', 'VPC 10개'])('관문 5 (%s): 모든 rect가 viewBox 안에 있다', async (label) => {
    render(<PeeringScaleDiagram />)
    await select(label)
    const [x, y, width, height] = diagram().getAttribute('viewBox')!.split(' ').map(Number)

    expect(boxesOutsideViewBox(Array.from(diagram().querySelectorAll('rect'), readBox), [x, y, width, height])).toEqual([])
  })

  it('관문 6: 노드 라벨(10)은 여백 12를 남기고, 그룹 라벨·곁말(9)은 자기 그룹 안에 들어간다', async () => {
    render(<PeeringScaleDiagram />)
    await select('VPC 10개')

    for (const el of diagram().querySelectorAll('[data-node]')) {
      const label = el.querySelector('text')!
      const kind = el.getAttribute('data-node') === 'tgw' ? 'tgw' : 'vpc'
      expect(label.textContent).toBe(diagramText.nodes[kind])
      expect(label).toHaveAttribute('font-size', '10')
      expect(estimateTextWidth(label.textContent!, 10) + 12).toBeLessThanOrEqual(readBox(el.querySelector('rect')!).width)
    }
    for (const id of ['mesh', 'hub']) {
      const box = group(id)
      for (const label of [diagram().querySelector(`[data-group-label="${id}"]`)!, diagram().querySelector(`[data-count-note="${id}"]`)!]) {
        expect(label.closest('[font-size]')).toHaveAttribute('font-size', '9')
        expect(Number(label.getAttribute('x')) + estimateTextWidth(label.textContent!, 9)).toBeLessThanOrEqual(box.x + box.width)
        expect(Number(label.getAttribute('y'))).toBeGreaterThan(box.y)
        expect(Number(label.getAttribute('y'))).toBeLessThan(box.y + box.height)
      }
      expect(diagram().querySelector(`[data-group-label="${id}"]`)!.textContent).toBe(diagramText.groups![id])
    }
  })

  it('관문 7: viewBox 폭은 280이고 모바일 여백 보정과 좌측 정렬을 유지한다', () => {
    render(<PeeringScaleDiagram />)

    expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(280)
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
  })

  it('선은 stroke-disabled 1px이고 파랑은 Transit Gateway 노드에만 쓴다', async () => {
    render(<PeeringScaleDiagram />)
    await select('VPC 6개')

    for (const line of diagram().querySelectorAll('[data-mesh-line], [data-hub-line]')) {
      const stroke = line.closest('[stroke-width]')!
      expect(stroke).toHaveAttribute('stroke-width', '1')
      expect(line.closest('.stroke-disabled')).not.toBeNull()
    }
    const blue = Array.from(diagram().querySelectorAll('[class*="diagram-managed"]'))
    expect(blue).toHaveLength(1)
    expect(blue[0].closest('[data-node]')).toHaveAttribute('data-node', 'tgw')
  })

  it('근거 개념을 적고 피어링 확장 한계 개념 본문 뒤에 붙는다', () => {
    expect(diagramText.sources).toEqual([conceptId, 'hybrid-connectivity.transit-gateway'])
    expect(diagramsByConceptId[conceptId]).toBe(PeeringScaleDiagram)

    const concept = topics.find(({ id }) => id === 'vpc-networking')!.concepts.find(({ id }) => id === conceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={2} />)
    const figure = screen.getByRole('figure', { name: diagramText.label })
    expect(figure.previousElementSibling).toHaveTextContent(concept.paragraphs[concept.paragraphs.length - 1])
    expect(within(figure).queryByRole('heading')).toBeNull()
  })

  describe('가로형 (768px 이상)', () => {
    const groupIds = ['mesh', 'hub']
    const scenarios = [
      ['전체', 4, 6, 4],
      ['VPC 3개', 3, 3, 3],
      ['VPC 6개', 6, 15, 6],
      ['VPC 10개', 10, 45, 10],
    ] as const

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

    function ids(attribute: string) {
      return Array.from(diagram().querySelectorAll(`[${attribute}]`), (el) => el.getAttribute(attribute))
    }

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×220 viewBox를 w-full 래퍼 하나로 그리고 SVG 속성을 유지한다', () => {
      render(<PeeringScaleDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 220')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram()).toHaveAttribute('aria-label', diagramText.svgLabel)
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it.each(scenarios)('%s: 노드 id·그룹 id 집합이 세로형과 같다', async (label) => {
      const { change } = mockMatchMedia(false)
      render(<PeeringScaleDiagram />)
      await select(label)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 440')
      const tallNodes = ids('data-node')
      const tallGroups = ids('data-group')
      expect(tallGroups).toEqual(groupIds)

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 220')
      expect(ids('data-node')).toEqual(tallNodes)
      expect(ids('data-group')).toEqual(tallGroups)
    })

    it.each(scenarios)('%s: 모든 rect가 440×220 viewBox 안에 있다', async (label, vpcs) => {
      render(<PeeringScaleDiagram />)
      await select(label)
      const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)

      expect(boxes).toHaveLength(2 + vpcs * 2 + 1)
      expect(boxesOutsideViewBox(boxes, [0, 0, 440, 220])).toEqual([])
    })

    it('노드 라벨(10)이 여백 12를 남기고 들어가고 그룹 라벨(9)은 자기 박스 오른쪽 끝을 넘지 않는다', async () => {
      render(<PeeringScaleDiagram />)
      await select('VPC 10개')

      for (const el of diagram().querySelectorAll('[data-node]')) {
        const label = el.querySelector('text')!
        const kind = el.getAttribute('data-node') === 'tgw' ? 'tgw' : 'vpc'
        expect(label.textContent).toBe(diagramText.nodes[kind])
        expect(label).toHaveAttribute('font-size', '10')
        expect(estimateTextWidth(label.textContent!, 10) + 12).toBeLessThanOrEqual(readBox(el.querySelector('rect')!).width)
      }
      for (const id of groupIds) {
        const label = diagram().querySelector(`[data-group-label="${id}"]`)!
        const box = group(id)
        expect(label.textContent).toBe(diagramText.groups![id])
        expect(Number(label.getAttribute('x'))).toBe(box.x + 10)
        expect(Number(label.getAttribute('y'))).toBe(box.y + 14)
        expect(Number(label.getAttribute('x')) + estimateTextWidth(label.textContent!, 9), id).toBeLessThanOrEqual(box.x + box.width)
      }
    })

    it.each(scenarios)('%s: VPC %i개·메시 선 %i개·허브 선 %i개와 곁말·캡션이 세로형과 같다', async (label, vpcs, mesh, hub) => {
      const { container } = render(<PeeringScaleDiagram />)
      await select(label)

      expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'true')
      expect(vpcBoxes('mesh')).toHaveLength(vpcs)
      expect(vpcBoxes('hub')).toHaveLength(vpcs)
      expect(count('[data-mesh-line]')).toBe(mesh)
      expect(count('[data-hub-line]')).toBe(hub)
      expect(note('mesh')).toBe(`연결 ${mesh}개`)
      expect(note('hub')).toBe(`연결 ${hub}개`)
      const caption = label === '전체'
        ? diagramText.idleCaption
        : diagramText.scenarios.find((s) => s.label === label)!.caption
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      for (const el of diagram().querySelectorAll('[opacity]')) expect(el).toHaveAttribute('opacity', '1')
    })

    it('p10에서 VPC 상자끼리, 그리고 Transit Gateway와 겹치지 않고 모든 상자가 자기 그룹 안에 있다', async () => {
      render(<PeeringScaleDiagram />)
      await select('VPC 10개')

      for (const groupId of groupIds) {
        const boxes = vpcBoxes(groupId)
        for (let i = 0; i < boxes.length; i += 1) {
          for (let j = i + 1; j < boxes.length; j += 1) {
            expect(overlapArea(boxes[i], boxes[j]), `${groupId} ${i}-${j}`).toBe(0)
          }
          expect(inside(boxes[i], group(groupId))).toEqual([])
        }
      }
      const tgw = readBox(diagram().querySelector('[data-node="tgw"] rect')!)
      for (const box of vpcBoxes('hub')) expect(overlapArea(box, tgw)).toBe(0)
      expect(inside(tgw, group('hub'))).toEqual([])
    })

    it('두 그룹이 겹치지 않고 나란하다', () => {
      render(<PeeringScaleDiagram />)

      expect(group('hub').y).toBe(group('mesh').y)
      expect(group('hub').height).toBe(group('mesh').height)
      expect(group('mesh').x + group('mesh').width).toBeLessThan(group('hub').x)
    })

    it('그룹 라벨·연결 수 곁말(9)이 자기 그룹 안에 들어간다', async () => {
      render(<PeeringScaleDiagram />)
      await select('VPC 10개')

      for (const id of groupIds) {
        const box = group(id)
        for (const label of [diagram().querySelector(`[data-group-label="${id}"]`)!, diagram().querySelector(`[data-count-note="${id}"]`)!]) {
          expect(label.closest('[font-size]')).toHaveAttribute('font-size', '9')
          expect(Number(label.getAttribute('x'))).toBeGreaterThan(box.x)
          expect(Number(label.getAttribute('x')) + estimateTextWidth(label.textContent!, 9)).toBeLessThanOrEqual(box.x + box.width)
          expect(Number(label.getAttribute('y'))).toBeGreaterThan(box.y)
          expect(Number(label.getAttribute('y'))).toBeLessThan(box.y + box.height)
        }
      }
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<PeeringScaleDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 440')
      await select('VPC 10개')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: 'VPC 10개' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(count('[data-mesh-line]')).toBe(45)
    })
  })
})
