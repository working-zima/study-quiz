import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { OrganizationalUnitDiagram, organizationalUnitScenarios } from './OrganizationalUnitDiagram'

const topicId = 'windows-ad'
const anchorConceptId = `${topicId}.organizational-unit`
const labels: Record<string, string> = {
  gpo: 'GPO 영업팀 PC 정책',
  admin: '영업팀 관리 담당',
  user: 'user01',
  pc: 'PC01',
  dev: '개발팀 계정과 PC',
}
const groupLabels: Record<string, string> = {
  domain: 'example.com',
  'sales-ou': 'OU 영업팀',
  'dev-ou': 'OU 개발팀',
}
const noteLabels: Record<string, string> = {
  'policy-note': '영업팀 안에 적용',
  'dev-note': '정책이 걸리지 않음',
  'delegate-note': '관리를 맡긴다',
}
const noteScenario: Record<string, string> = {
  'policy-note': 'policy', 'dev-note': 'policy', 'delegate-note': 'delegate',
}
// 곁말은 자기가 말하는 박스 안에 놓인다.
const noteGroup: Record<string, string> = {
  'policy-note': 'domain', 'dev-note': 'dev-ou', 'delegate-note': 'domain',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
// 노드마다 들어가는 박스. GPO와 관리 담당은 도메인 안이지만 어느 OU에도 들지 않는다.
const groupsOf: Record<string, string[]> = {
  gpo: ['domain'], admin: ['domain'], user: ['domain', 'sales-ou'], pc: ['domain', 'sales-ou'], dev: ['domain', 'dev-ou'],
}
const parentGroup: Record<string, string | undefined> = {
  domain: undefined, 'sales-ou': 'domain', 'dev-ou': 'domain',
}

const tallPaths: Record<string, string> = {
  'gpo-sales': 'M78 56 V80',
  'admin-sales': 'M208 56 V80',
}
const widePaths: Record<string, string> = {
  'gpo-sales': 'M86 56 V80',
  'admin-sales': 'M226 56 V80',
}
// 선마다 [시작 노드, 끝 박스]. 두 선 모두 OU 영업팀 박스의 위 변에서 끝난다.
const ends: Record<string, [string, string]> = {
  'gpo-sales': ['gpo', 'sales-ou'],
  'admin-sales': ['admin', 'sales-ou'],
}

const question = 'OU로 나누면 무엇을 따로 할 수 있을까?'
const figureName = '도메인 example.com 안을 OU 영업팀과 OU 개발팀으로 나눠 계정과 PC를 담고, GPO 영업팀 PC 정책을 영업팀에 연결하거나 영업팀의 관리를 영업팀 관리 담당에게 맡기는 것을 보이는 도식'
const svgName = '도메인 example.com 박스 안에 GPO 영업팀 PC 정책과 영업팀 관리 담당이 있고, OU 영업팀 박스(user01, PC01)와 OU 개발팀 박스(개발팀 계정과 PC)가 있는 그림'
const idleCaption = '도메인 example.com 안을 OU 영업팀과 OU 개발팀으로 나누고, 영업팀에는 계정 user01과 PC01을 두었다. OU 밖에는 GPO 영업팀 PC 정책과 영업팀 관리 담당이 있다. 이름은 예로 붙인 것이다. 버튼을 고르면 OU에 무엇을 담고 OU마다 무엇을 따로 할 수 있는지 볼 수 있다.'
const legend = '가장 바깥 박스는 도메인, 그 안의 두 박스는 OU다. 화살표는 GPO를 OU에 연결하는 것과 OU의 관리를 맡기는 것을 가리킨다.'
const expectedScenarios = [
  {
    id: 'contain', label: '나눠 담기',
    nodes: ['user', 'pc', 'dev'], paths: [] as string[],
    caption: '한 도메인 안을 OU 영업팀과 OU 개발팀으로 나누고, 계정과 PC를 저마다의 OU에 담았다. OU는 관리하려고 만드는 그릇이라 부서나 지역대로 나누는 일이 많지만, 부서 짜임을 꼭 그대로 따를 필요는 없다.',
  },
  {
    id: 'policy', label: '정책 연결',
    nodes: ['gpo', 'user', 'pc'], paths: ['gpo-sales'],
    caption: 'GPO 영업팀 PC 정책을 OU 영업팀에 연결하면 그 설정은 영업팀 안의 user01과 PC01에 적용되고, 개발팀에 둔 계정과 PC에는 걸리지 않는다. GPO 자체는 도메인에 저장되고 OU에는 연결만 한다.',
  },
  {
    id: 'delegate', label: '관리 맡기기',
    nodes: ['admin', 'user', 'pc'], paths: ['admin-sales'],
    caption: '영업팀의 계정을 관리하는 일을 영업팀 관리 담당에게 맡기면, 영업팀 관리 담당은 영업팀 안의 계정을 다룰 수 있게 된다. 맡긴 일은 고른 OU 안의 개체에 미치므로, 이 위임으로 개발팀의 계정까지 다루게 되지는 않는다.',
  },
]

const svg = () => screen.getByRole('img', { name: svgName })
const select = async (name: string) => { await act(async () => { await userEvent.click(screen.getByRole('button', { name })) }) }

function readBox(rect: Element, id = ''): SvgBox {
  return {
    id,
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

const nodeBox = (id: string) => readBox(svg().querySelector(`[data-node="${id}"] rect`)!, id)
const groupBox = (id: string) => readBox(svg().querySelector(`[data-group="${id}"]`)!, id)
const label = (id: string) => svg().querySelector(`[data-node="${id}"] text`)!.textContent!
const groupLabel = (id: string) => svg().querySelector(`[data-group-label="${id}"]`)!.textContent!
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (item) => item.getAttribute('data-note')!)
const opacityOf = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function contains(outer: SvgBox, inner: SvgBox) {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height
}

// 글자 크기 9인 글자가 차지하는 상자. 반각 글자가 화면에서 더 넓게 그려지는 것을 생각해 폭을 1.15배로 잡는다.
function textBox(text: Element, id: string): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9) * 1.15
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id, x: left, y: y - 9, width, height: 9 }
}

type Segment = { x1: number, y1: number, x2: number, y2: number }

// 직교 경로를 선분 목록으로 편다. M/H/V만 나온다.
function segments(d: string) {
  const result: Segment[] = []
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

// 선분이 상자 안쪽을 지나는가. 변에 닿기만 하는 것은 세지 않는다.
function crossesInside(segment: Segment, box: SvgBox) {
  const left = Math.min(segment.x1, segment.x2)
  const right = Math.max(segment.x1, segment.x2)
  const top = Math.min(segment.y1, segment.y2)
  const bottom = Math.max(segment.y1, segment.y2)
  if (top === bottom) return top > box.y && top < box.y + box.height && Math.min(right, box.x + box.width) > Math.max(left, box.x)
  return left > box.x && left < box.x + box.width && Math.min(bottom, box.y + box.height) > Math.max(top, box.y)
}

// 선분이 상자에 닿는가. 변에 닿는 것도 센다.
function touches(segment: Segment, box: SvgBox) {
  const left = Math.min(segment.x1, segment.x2)
  const right = Math.max(segment.x1, segment.x2)
  const top = Math.min(segment.y1, segment.y2)
  const bottom = Math.max(segment.y1, segment.y2)
  return left <= box.x + box.width && right >= box.x && top <= box.y + box.height && bottom >= box.y
}

function onEdge(x: number, y: number, box: SvgBox) {
  const insideX = x >= box.x && x <= box.x + box.width
  const insideY = y >= box.y && y <= box.y + box.height
  return ((x === box.x || x === box.x + box.width) && insideY) || ((y === box.y || y === box.y + box.height) && insideX)
}

function lineEnds(d: string) {
  const list = segments(d)
  return { start: { x: list[0].x1, y: list[0].y1 }, end: { x: list[list.length - 1].x2, y: list[list.length - 1].y2 } }
}

// 끝점이 닿는 노드와, 노드가 아니면 끝점이 위 변에 놓인 OU 박스.
const endsAtNode = (point: { x: number, y: number }) => nodeIds.filter((id) => onEdge(point.x, point.y, nodeBox(id)))
const endsAtOu = (point: { x: number, y: number }) => ['sales-ou', 'dev-ou'].filter((id) => {
  const box = groupBox(id)
  return point.y === box.y && point.x > box.x && point.x < box.x + box.width
})
const groupLabelBox = (id: string) => textBox(svg().querySelector(`[data-group-label="${id}"]`)!, `${id}-label`)

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
  return (nextMatches: boolean) => {
    mediaQuery.matches = nextMatches
    act(() => listeners.forEach((listener) => listener(Object.assign(new Event('change'), { matches: nextMatches, media: mediaQuery.media }) as MediaQueryListEvent)))
  }
}

const anchorConcept = () => topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!

function layoutTests(wide: boolean) {
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 176] : [0, 0, 280, 224]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<OrganizationalUnitDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<OrganizationalUnitDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(svg().querySelectorAll('[data-link]')).toHaveLength(0)
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<OrganizationalUnitDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownNotes()).toEqual(Object.keys(noteScenario).filter((id) => noteScenario[id] === scenario.id))
    for (const id of shownNotes()) expect(note(id)!.textContent).toBe(noteLabels[id])
    expect(shownPaths()).toEqual(scenario.paths)
    for (const path of svg().querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('d', paths[path.getAttribute('data-path')!])
      expect(path).toHaveAttribute('stroke-width', '2')
      expect(path).toHaveClass('stroke-title')
      expect(path).toHaveAttribute('marker-end', `url(#${svg().querySelector('marker')!.id})`)
      expect(path.closest('[opacity]')).toBeNull()
    }
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말·그룹 라벨이 자리에 들어간다`, async () => {
    render(<OrganizationalUnitDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
      for (const group of groupIds) {
        if (groupsOf[id].includes(group)) expect(contains(groupBox(group), nodeBox(id)), `${id} ⊂ ${group}`).toBe(true)
        else expect(overlaps(groupBox(group), nodeBox(id)), `${id} ↔ ${group}`).toBe(false)
      }
    }
    for (const id of groupIds) {
      const parent = parentGroup[id]
      if (parent) expect(contains(groupBox(parent), groupBox(id)), `${id} ⊂ ${parent}`).toBe(true)
    }
    expect(overlaps(groupBox('sales-ou'), groupBox('dev-ou'))).toBe(false)
    const groupTexts = groupIds.map((id) => {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
      for (const other of groupIds.filter((otherId) => otherId !== id && parentGroup[id] !== otherId)) {
        expect(overlaps(box, groupBox(other)), `${id} 라벨 ↔ ${other}`).toBe(false)
      }
      return box
    })
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const noteTexts = shownNotes().map((id) => {
        const element = note(id)!
        expect(element).toHaveAttribute('font-size', '9')
        expect(element).toHaveClass('fill-muted')
        const box = textBox(element, id)
        for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        expect(contains(groupBox(noteGroup[id]), box), id).toBe(true)
        // 도메인 안의 곁말은 어느 OU 박스에도 걸치지 않는다.
        if (noteGroup[id] === 'domain') for (const ou of ['sales-ou', 'dev-ou']) expect(overlaps(box, groupBox(ou)), `${id} ↔ ${ou}`).toBe(false)
        return box
      })
      for (const box of [...noteTexts, ...groupTexts]) {
        expect(box.x, box.id).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width, box.id).toBeLessThanOrEqual(viewBox[2])
        expect(box.y, box.id).toBeGreaterThanOrEqual(0)
        expect(box.y + box.height, box.id).toBeLessThanOrEqual(viewBox[3])
        for (const d of Object.values(paths)) {
          for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
        }
      }
      for (const [index, box] of noteTexts.entries()) {
        for (const group of groupTexts) expect(overlaps(box, group), `${box.id} ↔ ${group.id}`).toBe(false)
        for (const other of noteTexts.slice(index + 1)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
      }
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('선은 노드의 변에서 시작해 OU 박스의 위 변에서 끝나고 어떤 선분도 노드 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<OrganizationalUnitDiagram />)
    for (const [id, d] of Object.entries(paths)) {
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
      const { start, end } = lineEnds(d)
      expect(endsAtNode(start), `${id} 시작`).toEqual([ends[id][0]])
      expect(endsAtNode(end), `${id} 끝의 노드`).toEqual([])
      expect(endsAtOu(end), `${id} 끝`).toEqual([ends[id][1]])
    }
  })

  // 요점: 정책을 연결하면 GPO에서 나간 화살표가 OU 영업팀 박스에 닿고 영업팀 안의 계정·PC만 선명하며, 개발팀 쪽은 흐리다.
  // 관리를 맡기면 화살표가 관리 담당에서 OU 영업팀으로만 간다. 어느 시나리오에서도 그룹 박스는 흐려지지 않는다.
  it('OU에 연결한 정책과 맡긴 관리는 그 OU 안에만 미친다', async () => {
    render(<OrganizationalUnitDiagram />)
    await select('나눠 담기')
    expect(nodeIds.filter((id) => opacityOf(id) === '1')).toEqual(['user', 'pc', 'dev'])
    for (const id of ['user', 'pc']) expect(contains(groupBox('sales-ou'), nodeBox(id)), id).toBe(true)
    expect(contains(groupBox('dev-ou'), nodeBox('dev'))).toBe(true)

    await select('정책 연결')
    expect(shownPaths()).toEqual(['gpo-sales'])
    const policyEnd = lineEnds(paths['gpo-sales'])
    expect(endsAtNode(policyEnd.start)).toEqual(['gpo'])
    expect(endsAtOu(policyEnd.end)).toEqual(['sales-ou'])
    for (const segment of segments(paths['gpo-sales'])) expect(touches(segment, groupBox('dev-ou'))).toBe(false)
    const lit = nodeIds.filter((id) => opacityOf(id) === '1')
    expect(lit).toEqual(['gpo', 'user', 'pc'])
    expect(opacityOf('dev')).toBe('0.25')
    for (const id of lit.filter((nodeId) => nodeId !== 'gpo')) expect(contains(groupBox('sales-ou'), nodeBox(id)), id).toBe(true)
    // GPO는 도메인 안에 있지만 어느 OU에도 들지 않는다.
    expect(contains(groupBox('domain'), nodeBox('gpo'))).toBe(true)
    for (const ou of ['sales-ou', 'dev-ou']) expect(overlaps(groupBox(ou), nodeBox('gpo')), ou).toBe(false)

    await select('관리 맡기기')
    expect(shownPaths()).toEqual(['admin-sales'])
    const delegateEnd = lineEnds(paths['admin-sales'])
    expect(endsAtNode(delegateEnd.start)).toEqual(['admin'])
    expect(endsAtOu(delegateEnd.end)).toEqual(['sales-ou'])
    for (const segment of segments(paths['admin-sales'])) expect(touches(segment, groupBox('dev-ou'))).toBe(false)
    expect(opacityOf('dev')).toBe('0.25')
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()

    // 그림의 이름과 사실은 본문에 있는 것이다.
    const body = anchorConcept().paragraphs.join('\n')
    for (const name of ['`example.com`', '`영업팀`', '`개발팀`', '`user01`', '`PC01`', '`영업팀 PC 정책`', '영업팀 관리 담당']) expect(body).toContain(name)
    expect(body).toContain('`개발팀`에 둔 계정과 PC에는 걸리지 않는다')
    expect(body).toContain('GPO 자체는 OU 안에 들어가는 것이 아니라 도메인에 저장되고, OU에는 연결만 한다')
    expect(body).toContain('이렇게 맡긴 일은 고른 OU 안의 모든 개체에 미친다')
    expect(body).toContain('이 위임으로 `개발팀`의 계정까지 다루게 되지는 않는다')
    expect(body).toContain('OU를 꼭 부서 짜임 그대로 만들어야 하는 것은 아니다')
  })
}

describe('OrganizationalUnitDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<OrganizationalUnitDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 224')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('정책 연결')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 176')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '정책 연결' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><OrganizationalUnitDiagram /><OrganizationalUnitDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '정책 연결' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<OrganizationalUnitDiagram />)
    const text = visualsByTopicId[topicId].diagrams['organizational-unit']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(organizationalUnitScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.label).toBe(figureName)
    expect(text.svgLabel).toBe(svgName)
    expect(text.sources).toEqual([anchorConceptId])
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map((scenario) => scenario.label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = organizationalUnitScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 조직 구성 단위 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = anchorConcept()
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(within(figure).queryByRole('heading')).toBeNull()
  })
})
