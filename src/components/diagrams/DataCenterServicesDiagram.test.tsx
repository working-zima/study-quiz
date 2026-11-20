import { act, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { DataCenterServicesDiagram } from './DataCenterServicesDiagram'

const topicId = 'cloud-sdn'
const anchorConceptId = `${topicId}.data-center`
const labels: Record<string, string> = {
  'power': '전원 설비',
  'cooling': '냉방 설비',
  'network': '네트워크 장비',
  'web01': 'WEB01',
  'outside': '바깥의 네트워크',
}
const groupLabels: Record<string, string> = {
  'idc': '인터넷 데이터 센터',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const facilities = ['power', 'cooling', 'network']
// 「인터넷 데이터 센터」 박스는 설비 셋과 WEB01을 담는다. 바깥의 네트워크는 박스 밖에 있다.
const members: Record<string, string[]> = {
  'idc': ['power', 'cooling', 'network', 'web01'],
}
// 화살표는 설비의 변에서 나가 WEB01의 변에서 끝난다. 가는 선은 네트워크 장비와 바깥의 네트워크를 잇는다.
const pathEnds: Record<string, [string, string]> = {
  'power-web01': ['power', 'web01'],
  'cooling-web01': ['cooling', 'web01'],
  'network-web01': ['network', 'web01'],
}
const linkEnds: Record<string, [string, string]> = {
  'network-outside': ['network', 'outside'],
}
const tallPaths: Record<string, string> = {
  'power-web01': 'M128 48 H212 V80',
  'cooling-web01': 'M128 96 H168',
  'network-web01': 'M128 144 H212 V112',
}
const tallLinks: Record<string, string> = {
  'network-outside': 'M76 160 V196',
}
const widePaths: Record<string, string> = {
  'power-web01': 'M136 48 H256 V80',
  'cooling-web01': 'M136 96 H208',
  'network-web01': 'M136 144 H256 V112',
}
const wideLinks: Record<string, string> = {
  'network-outside': 'M136 152 H332',
}

const question = '데이터 센터는 서버에게 무엇을 내줄까?'
const figureName = '인터넷 데이터 센터 안에서 전원 설비·냉방 설비·네트워크 장비가 서버 WEB01을 받치고, 네트워크 장비가 데이터 센터 바깥의 네트워크와 이어지는 모습을 보이는 도식'
const svgName = '「인터넷 데이터 센터」 박스 안의 전원 설비·냉방 설비·네트워크 장비에서 WEB01로 가는 화살표와, 네트워크 장비를 박스 밖의 바깥의 네트워크와 잇는 선을 그린 그림'
const idleCaption = 'example.com이 인터넷 데이터 센터에 둔 서버 WEB01은 데이터 센터의 전원 설비에서 전기를 받고 냉방 설비로 식혀지며, 데이터 센터의 네트워크 장비에 이어진다. 그 네트워크는 데이터 센터 바깥의 네트워크와 이어져 있어 손님들이 WEB01에 닿는다. example.com은 이 설비를 직접 갖추지 않고 데이터 센터에서 사서 쓴다.'
const legend = '화살표는 데이터 센터의 설비가 WEB01을 받치는 쪽이고, 가는 선은 네트워크 장비가 데이터 센터 바깥의 네트워크와 이어져 있다는 뜻이다. WEB01은 example.com의 서버로, 예로 붙인 이름이다.'

const svg = () => screen.getByRole('img', { name: svgName })

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
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const shownLinks = () => Array.from(svg().querySelectorAll('[data-link]'), (link) => link.getAttribute('data-link')!)

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function contains(outer: SvgBox, inner: SvgBox) {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height
}

// 그룹 라벨(9)의 가로 범위. 반각 문자가 섞일 수 있으므로 어림값의 1.15배로 잡는다.
function textBox(text: Element, id: string): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9) * 1.15
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id, x: left, y: y - 9, width, height: 9 }
}

type Segment = { x1: number, y1: number, x2: number, y2: number }

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

function crossesInside(segment: Segment, box: SvgBox) {
  const left = Math.min(segment.x1, segment.x2)
  const right = Math.max(segment.x1, segment.x2)
  const top = Math.min(segment.y1, segment.y2)
  const bottom = Math.max(segment.y1, segment.y2)
  if (top === bottom) return top > box.y && top < box.y + box.height && Math.min(right, box.x + box.width) > Math.max(left, box.x)
  return left > box.x && left < box.x + box.width && Math.min(bottom, box.y + box.height) > Math.max(top, box.y)
}

function touches(segment: Segment, box: SvgBox) {
  const left = Math.min(segment.x1, segment.x2)
  const right = Math.max(segment.x1, segment.x2)
  const top = Math.min(segment.y1, segment.y2)
  const bottom = Math.max(segment.y1, segment.y2)
  return left <= box.x + box.width && right >= box.x && top <= box.y + box.height && bottom >= box.y
}

// 두 선분이 같은 직선 위에 있고 길이가 있는 구간을 함께 쓰는가.
function collinearOverlap(a: Segment, b: Segment) {
  const shared = (a1: number, a2: number, b1: number, b2: number) => Math.min(Math.max(a1, a2), Math.max(b1, b2)) - Math.max(Math.min(a1, a2), Math.min(b1, b2)) > 0
  if (a.x1 === a.x2 && b.x1 === b.x2 && a.x1 === b.x1) return shared(a.y1, a.y2, b.y1, b.y2)
  if (a.y1 === a.y2 && b.y1 === b.y2 && a.y1 === b.y1) return shared(a.x1, a.x2, b.x1, b.x2)
  return false
}

function lineEnds(d: string) {
  const list = segments(d)
  return { start: { x: list[0].x1, y: list[0].y1 }, end: { x: list[list.length - 1].x2, y: list[list.length - 1].y2 } }
}

// 점이 상자의 네 변 가운데 하나 위에 있는가.
function onEdge(point: { x: number, y: number }, box: SvgBox) {
  const withinX = point.x >= box.x && point.x <= box.x + box.width
  const withinY = point.y >= box.y && point.y <= box.y + box.height
  return ((point.x === box.x || point.x === box.x + box.width) && withinY) || ((point.y === box.y || point.y === box.y + box.height) && withinX)
}

// 선이 어느 노드의 변에서 시작하고 어느 노드의 변에서 끝나는지 그림에서 읽는다.
function endpointNode(point: { x: number, y: number }) {
  return nodeIds.find((id) => onEdge(point, nodeBox(id)))
}

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

function layoutTests(wide: boolean) {
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 184] : [0, 0, 280, 236]
  const paths = wide ? widePaths : tallPaths
  const links = wide ? wideLinks : tallLinks
  const allLines = { ...paths, ...links }

  it('물음형 제목을 헤딩 없이 SVG보다 앞에 보이고, 시나리오 버튼 없이 정지 그림의 캡션이 나온다', () => {
    const { container } = render(<DataCenterServicesDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(svg()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
    expect(screen.queryAllByRole('button')).toEqual([])
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
    expect(screen.getByText(legend)).toBeInTheDocument()
  })

  it('노드가 모두 선명하고 화살표 셋과 가는 선 하나가 늘 보인다', () => {
    render(<DataCenterServicesDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).not.toHaveAttribute('opacity', '0.25')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual(Object.keys(paths))
    for (const path of svg().querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('d', paths[path.getAttribute('data-path')!])
      expect(path).toHaveAttribute('stroke-width', '2')
      expect(path).toHaveClass('stroke-title')
      expect(path).toHaveAttribute('marker-end', `url(#${svg().querySelector('marker')!.id})`)
    }
    expect(shownLinks()).toEqual(Object.keys(links))
    for (const link of svg().querySelectorAll('[data-link]')) {
      expect(link).toHaveAttribute('d', links[link.getAttribute('data-link')!])
      expect(link).toHaveAttribute('stroke-width', '1.5')
      expect(link).not.toHaveAttribute('marker-end')
    }
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·그룹 라벨이 자리에 들어간다`, () => {
    render(<DataCenterServicesDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const group of groupIds) {
        const inside = members[group].includes(id)
        expect(contains(groupBox(group), nodeBox(id)), `${id} ⊂ ${group}`).toBe(inside)
        if (!inside) expect(overlaps(groupBox(group), nodeBox(id)), `${id}는 ${group} 박스 밖`).toBe(false)
      }
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    for (const id of groupIds) {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('선은 노드의 변에서 시작하고 끝나며, 노드 안이나 그룹 라벨을 지나지 않고 서로 겹치지 않는다', () => {
    render(<DataCenterServicesDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(pathEnds)))
    expect(new Set(Object.keys(links))).toEqual(new Set(Object.keys(linkEnds)))
    const ends = { ...pathEnds, ...linkEnds }
    for (const [id, d] of Object.entries(allLines)) {
      const { start, end } = lineEnds(d)
      expect(onEdge(start, nodeBox(ends[id][0])), `${id} 시작`).toBe(true)
      expect(onEdge(end, nodeBox(ends[id][1])), `${id} 끝`).toBe(true)
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
    }
    const ids = Object.keys(allLines)
    for (const a of ids) for (const b of ids.filter((other) => other !== a)) {
      for (const sa of segments(allLines[a])) for (const sb of segments(allLines[b])) expect(collinearOverlap(sa, sb), `${a} ↔ ${b}`).toBe(false)
    }
  })

  // 요점: 설비 노드(전원 설비·냉방 설비·네트워크 장비)에서 나간 화살표가 모두 WEB01에서 끝나고, WEB01과 설비가 모두 「인터넷 데이터 센터」 박스 안에 있다.
  // 박스 밖으로 이어지는 것은 네트워크 장비와 바깥의 네트워크를 잇는 가는 선 하나뿐이다.
  it('설비에서 나간 화살표는 모두 WEB01에 닿고, 데이터 센터 밖으로는 네트워크 장비만 이어진다', () => {
    render(<DataCenterServicesDiagram />)
    const ends = (d: string) => [endpointNode(lineEnds(d).start), endpointNode(lineEnds(d).end)] as [string, string]
    const arrows = shownPaths().map((id) => ends(paths[id]))
    expect(arrows.map(([from]) => from).sort()).toEqual([...facilities].sort())
    for (const [from, to] of arrows) expect(to, from).toBe('web01')
    for (const id of [...facilities, 'web01']) expect(contains(groupBox('idc'), nodeBox(id)), id).toBe(true)
    expect(contains(groupBox('idc'), nodeBox('outside'))).toBe(false)
    expect(shownLinks().map((id) => ends(links[id]))).toEqual([['network', 'outside']])

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const phrase of ['자기 웹 서버 `WEB01`', '전원 설비에서 전기를 받고, 냉방 설비로 식혀진다', '네트워크 장비에 이어지고', '데이터 센터 바깥의 네트워크와 이어져', '바깥의 네트워크와 잇는다', '코로케이션 고객']) {
      expect(body, phrase).toContain(phrase)
    }
  })
}

describe('DataCenterServicesDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 집합이 세로형과 같고, 폭이 바뀌어도 캡션이 그대로다', () => {
      const change = mockMatchMedia(false)
      const { container } = render(<DataCenterServicesDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 236')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 184')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      for (const link of svg().querySelectorAll('[data-link]')) expect(link).toHaveAttribute('d', wideLinks[link.getAttribute('data-link')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
      expect(new Set(Object.keys(wideLinks))).toEqual(new Set(Object.keys(tallLinks)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', () => {
    render(<><DataCenterServicesDiagram /><DataCenterServicesDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('문구와 존재하는 근거 개념을 JSON에서 읽고 시나리오가 없다', () => {
    render(<DataCenterServicesDiagram />)
    const text = visualsByTopicId[topicId].diagrams['data-center-services']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(text.scenarios).toEqual([])
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toBeUndefined()
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.label).toBe(figureName)
    expect(text.svgLabel).toBe(svgName)
    expect(text.sources).toEqual([anchorConceptId])
    for (const source of text.sources) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 인터넷 데이터 센터 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(within(figure).queryByRole('heading')).toBeNull()
  })
})
