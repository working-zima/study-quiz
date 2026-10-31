import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { DdosProtectionDiagram, ddosProtectionScenarios } from './DdosProtectionDiagram'

const conceptId = 'azure-network-protection.ddos-protection'
const labels = {"users":"정상 사용자","attack":"공격 트래픽","ddos":"DDoS Protection","public-ip":"공용 IP 주소","vm-1":"VM 1"}
const endpoints = {"users-in":["users","ddos"],"pass":["ddos","public-ip"],"attack-in":["attack","ddos"]} as const
const expected = [{"id":"normal","label":"평소","nodes":["users","ddos","public-ip","vm-1"],"paths":["users-in","pass"],"notes":{"watch-note":"트래픽을 지켜봄"}},{"id":"attack","label":"공격이 올 때","nodes":["users","attack","ddos","public-ip","vm-1"],"paths":["users-in","attack-in","pass"],"notes":{"filter-note":"걸러 냄","pass-note":"정상 트래픽은 계속 통과"}}]
const groupIds = ["vnet"]
const diagram = () => screen.getByRole('img')
const wording = () => visualsByTopicId['azure-network-protection'].diagrams['ddos-protection']
const ids = (selector: string, attribute: string) => Array.from(diagram().querySelectorAll(selector), (el) => el.getAttribute(attribute)!).sort()
const select = async (name: string) => { await act(async () => { await userEvent.click(screen.getByRole('button', { name })) }) }
function box(rect: Element): SvgBox {
  return {
    id: rect.parentElement?.getAttribute('data-node') ?? rect.getAttribute('data-group') ?? '',
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}
const nodeBox = (id: string) => ({ ...box(diagram().querySelector(`[data-node="${id}"] rect`)!), id })
const groupBox = (id: string) => box(diagram().querySelector(`[data-group="${id}"]`)!)
const overlaps = (a: SvgBox, b: SvgBox) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
const inside = (child: SvgBox, parent: SvgBox) => child.x > parent.x && child.y > parent.y && child.x + child.width < parent.x + parent.width && child.y + child.height < parent.y + parent.height
function textBox(el: Element): SvgBox {
  const width = estimateTextWidth(el.textContent!, 9) * 1.15
  const x = Number(el.getAttribute('x'))
  return { id: el.getAttribute('data-note') ?? el.getAttribute('data-group-label') ?? '', x: el.getAttribute('text-anchor') === 'middle' ? x - width / 2 : x, y: Number(el.getAttribute('y')) - 9, width, height: 9 }
}
function points(d: string) {
  let x = 0, y = 0
  return Array.from(d.matchAll(/([MHV])\s*(-?\d+)(?:\s+(-?\d+))?/g), ([, command, a, b]) => {
    if (command === 'M') { x = Number(a); y = Number(b) }
    if (command === 'H') x = Number(a)
    if (command === 'V') y = Number(a)
    return { x, y }
  })
}
function onEdge(point: { x: number, y: number }, b: SvgBox) {
  return ((point.x === b.x || point.x === b.x + b.width) && point.y >= b.y && point.y <= b.y + b.height)
    || ((point.y === b.y || point.y === b.y + b.height) && point.x >= b.x && point.x <= b.x + b.width)
}
function crosses(a: { x: number, y: number }, b: { x: number, y: number }, area: SvgBox) {
  if (a.x === b.x) return a.x > area.x && a.x < area.x + area.width && Math.max(a.y, b.y) > area.y && Math.min(a.y, b.y) < area.y + area.height
  return a.y > area.y && a.y < area.y + area.height && Math.max(a.x, b.x) > area.x && Math.min(a.x, b.x) < area.x + area.width
}
function expectPaths(visible: string[]) {
  expect(ids('[data-path]', 'data-path')).toEqual([...visible].sort())
  const areas = [
    ...Object.keys(labels).map(nodeBox),
    ...Array.from(diagram().querySelectorAll('[data-note], [data-group-label]'), textBox),
  ]
  for (const path of diagram().querySelectorAll('[data-path]')) {
    const id = path.getAttribute('data-path')! as keyof typeof endpoints
    expect(path.closest('[opacity]')).toBeNull()
    expect(path.getAttribute('marker-end')).toMatch(/^url\(#.+\)$/)
    const d = path.getAttribute('d')!
    expect(d).toMatch(/^M[\d\sHV]+$/)
    const vertices = points(d)
    const [from, to] = endpoints[id]
    expect(onEdge(vertices[0], nodeBox(from)), id).toBe(true)
    expect(onEdge(vertices[vertices.length - 1], nodeBox(to)), id).toBe(true)
    for (let i = 1; i < vertices.length; i++) {
      for (const area of areas) expect(crosses(vertices[i - 1], vertices[i], area), `${id} ↔ ${area.id}`).toBe(false)
    }
  }
}
function expectGeometry(width: number, height: number) {
  const rectangles = Array.from(diagram().querySelectorAll('rect'), box)
  expect(rectangles).toHaveLength(Object.keys(labels).length + groupIds.length)
  expect(boxesOutsideViewBox(rectangles, [0, 0, width, height])).toEqual([])
  for (const [id, label] of Object.entries(labels)) {
    const b = nodeBox(id)
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    expect(node.querySelector('text')).toHaveTextContent(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(node.querySelector('rect')).toHaveClass('stroke-disabled')
    expect(b.height).toBe(32)
    expect(estimateTextWidth(label, 10) * 1.15 + 12, label).toBeLessThanOrEqual(b.width)
    for (const other of Object.keys(labels).filter((otherId) => otherId !== id).map(nodeBox)) expect(overlaps(b, other), `${id} ↔ ${other.id}`).toBe(false)
  }
  const textAreas = Array.from(diagram().querySelectorAll('[data-note], [data-group-label]'), textBox)
  expect(boxesOutsideViewBox(textAreas, [0, 0, width, height])).toEqual([])
  for (const group of groupIds) {
    const label = diagram().querySelector(`[data-group-label="${group}"]`)!
    expect(label.textContent).toBe(wording().groups![group])
    expect(label).toHaveAttribute('font-size', '9')
    expect(inside(textBox(label), groupBox(group)), group).toBe(true)
    expect(diagram().querySelector(`[data-group="${group}"]`)!.closest('[opacity]')).toBeNull()
  }
  for (const el of diagram().querySelectorAll('[data-note]')) {
    expect(el).toHaveAttribute('font-size', '9')
    expect(el).toHaveClass('fill-muted')
    for (const group of groupIds) expect(overlaps(textBox(el), groupBox(group)), `${el.getAttribute('data-note')} ↔ ${group}`).toBe(false)
  }
  for (let i = 0; i < textAreas.length; i++) {
    for (const n of Object.keys(labels).map(nodeBox)) expect(overlaps(textAreas[i], n), `${textAreas[i].id} ↔ ${n.id}`).toBe(false)
    for (let j = i + 1; j < textAreas.length; j++) expect(overlaps(textAreas[i], textAreas[j]), `${textAreas[i].id} ↔ ${textAreas[j].id}`).toBe(false)
  }
  expect(diagram().querySelector('[class*="diagram-"], [class*="green"], [class*="red"], [class*="orange"], [class*="amber"]')).toBeNull()
}

function layoutTests(width: number, height: number) {
  it('전체에서는 노드가 모두 선명하고 시나리오 경로와 곁말이 없다', () => {
    render(<DdosProtectionDiagram />)
    expect(diagram()).toHaveAttribute('viewBox', `0 0 ${width} ${height}`)
    expect(ids('[data-node]', 'data-node')).toEqual(Object.keys(labels).sort())
    expect(ids('[data-group]', 'data-group')).toEqual([...groupIds].sort())
    for (const n of diagram().querySelectorAll('[data-node]')) expect(n).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(wording().idleCaption)).toBeInTheDocument()
    expectGeometry(width, height)
    expectPaths([])
  })
  it.each(expected)('$label: 선명한 노드·경로·곁말·캡션이 설계와 같다', async (scenario) => {
    const { container } = render(<DdosProtectionDiagram />)
    await select(scenario.label)
    for (const n of diagram().querySelectorAll('[data-node]')) expect(n).toHaveAttribute('opacity', scenario.nodes.includes(n.getAttribute('data-node')!) ? '1' : '0.25')
    expect(ids('[data-note]', 'data-note')).toEqual(Object.keys(scenario.notes).sort())
    for (const [id, note] of Object.entries(scenario.notes)) expect(diagram().querySelector(`[data-note="${id}"]`)).toHaveTextContent(note as string)
    expect(container.querySelector('figcaption')!.textContent).toBe(wording().scenarios.find(({ id }) => id === scenario.id)!.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expectGeometry(width, height)
    expectPaths(scenario.paths)
  })
  it('요점: 공용 IP 주소와 VM 1은 가상 네트워크 안에 있고 나머지는 밖이다', () => {
    render(<DdosProtectionDiagram />)
    for (const node of ['public-ip', 'vm-1']) expect(inside(nodeBox(node), groupBox('vnet')), node).toBe(true)
    for (const node of ['users', 'attack', 'ddos']) expect(overlaps(nodeBox(node), groupBox('vnet')), node).toBe(false)
  })
  it('요점: 공용 IP 주소와 VM 1을 잇는 선은 늘 보이고 화살표가 없다', async () => {
    render(<DdosProtectionDiagram />)
    for (const name of ['전체', ...expected.map(({ label }) => label)]) {
      await select(name)
      const link = diagram().querySelector('[data-link="link-ip"]')!
      expect(link.getAttribute('marker-end')).toBeNull()
      const vertices = points(link.getAttribute('d')!)
      expect(onEdge(vertices[0], nodeBox('public-ip'))).toBe(true)
      expect(onEdge(vertices[vertices.length - 1], nodeBox('vm-1'))).toBe(true)
    }
  })
  it('요점: 공격 트래픽은 DDoS Protection에서 끝나고 공용 IP 주소와 VM 1에 바로 닿지 않는다', async () => {
    render(<DdosProtectionDiagram />)
    await select('공격이 올 때')
    const attackIn = points(diagram().querySelector('[data-path="attack-in"]')!.getAttribute('d')!)
    expect(onEdge(attackIn[attackIn.length - 1], nodeBox('ddos'))).toBe(true)
    for (const path of diagram().querySelectorAll('[data-path]')) {
      const vertices = points(path.getAttribute('d')!)
      if (!onEdge(vertices[0], nodeBox('attack'))) continue
      for (const target of ['public-ip', 'vm-1']) expect(onEdge(vertices[vertices.length - 1], nodeBox(target)), target).toBe(false)
    }
  })
  it('요점: 평소에는 공격 트래픽이 흐리고 그 경로가 없다', async () => {
    render(<DdosProtectionDiagram />)
    await select('평소')
    expect(diagram().querySelector('[data-node="attack"]')).toHaveAttribute('opacity', '0.25')
    expect(diagram().querySelector('[data-path="attack-in"]')).toBeNull()
  })
  it('시나리오를 바꾼 뒤 전체로 돌아오면 경로·곁말이 사라지고 노드가 모두 선명하다', async () => {
    render(<DdosProtectionDiagram />)
    for (const scenario of expected) await select(scenario.label)
    await select('전체')
    expectPaths([])
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
  })
}

describe('DdosProtectionDiagram', () => {
  it('물음형 제목은 헤딩 없이 버튼 앞에 있고 문구는 Azure JSON에서 읽는다', () => {
    render(<DdosProtectionDiagram />)
    const text = wording()
    const title = screen.getByText(text.question!)
    expect(title.tagName).toBe('P')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
    expect(screen.getByRole('figure')).toHaveAttribute('aria-label', text.label)
    expect(diagram()).toHaveAttribute('aria-label', text.svgLabel)
    expect(text.nodes).toEqual(labels)
    expect(screen.getByText(text.legend!)).toBeInTheDocument()
    expect(ddosProtectionScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    for (const scenario of expected) {
      const actual = ddosProtectionScenarios.find(({ id }) => id === scenario.id)!
      expect(actual.nodes).toEqual(scenario.nodes)
      expect(actual.paths).toEqual(scenario.paths)
      expect(actual.label).toBe(scenario.label)
    }
  })
  it('세로형은 모바일 보정 래퍼 하나로 그린다', () => {
    render(<DdosProtectionDiagram />)
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
  })
  layoutTests(280, 220)
  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', () => {
    render(<><DdosProtectionDiagram /><DdosProtectionDiagram /></>)
    const markerIds = Array.from(document.querySelectorAll('marker'), (marker) => marker.id)
    expect(markerIds).toHaveLength(2)
    expect(new Set(markerIds).size).toBe(2)
  })
  it.each([2, 4] as const)('공유 본문 h%i에서 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === 'azure-network-protection')!.concepts.find(({ id }) => id === conceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: wording().label })
    expect(figure.closest('article')).toHaveAttribute('id', conceptId)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(within(figure).queryByRole('heading')).toBeNull()
  })
  it('본문에 그림의 예를 쓴다', () => {
    const concept = topics.find(({ id }) => id === 'azure-network-protection')!.concepts.find(({ id }) => id === conceptId)!
    const prose = concept.paragraphs.join(' ')
    for (const word of ["회사 G","VM 1","공용 IP 주소","정상 사용자"]) expect(prose).toContain(word)
  })
  describe('가로형 (768px 이상)', () => {
    function mediaMock(matches: boolean) {
      const listeners = new Set<() => void>()
      const query = { matches, media: WIDE_DIAGRAM_QUERY, addEventListener: (_type: string, cb: () => void) => listeners.add(cb), removeEventListener: (_type: string, cb: () => void) => listeners.delete(cb) }
      vi.stubGlobal('matchMedia', vi.fn(() => query))
      return (next: boolean) => { query.matches = next; listeners.forEach((cb) => cb()) }
    }
    beforeEach(() => { mediaMock(true) })
    afterEach(() => { vi.unstubAllGlobals() })
    layoutTests(440, 144)
    it('가로형은 w-full 래퍼와 SVG 하나뿐이다', () => {
      render(<DdosProtectionDiagram />)
      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
    })
    it('폭을 왕복해도 노드·경로 id와 선택·캡션을 유지한다', async () => {
      const change = mediaMock(false)
      const { container } = render(<DdosProtectionDiagram />)
      await select('평소')
      const before = { nodes: ids('[data-node]', 'data-node'), paths: ids('[data-path]', 'data-path'), caption: container.querySelector('figcaption')!.textContent }
      for (const wide of [true, false]) {
        act(() => change(wide))
        expect(diagram()).toHaveAttribute('viewBox', wide ? '0 0 440 144' : '0 0 280 220')
        expect(ids('[data-node]', 'data-node')).toEqual(before.nodes)
        expect(ids('[data-path]', 'data-path')).toEqual(before.paths)
        expect(container.querySelector('figcaption')!.textContent).toBe(before.caption)
        expect(screen.getByRole('button', { name: '평소' })).toHaveAttribute('aria-pressed', 'true')
      }
    })
  })
})
