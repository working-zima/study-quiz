import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { NaptPortsDiagram, naptPortsScenarios } from './NaptPortsDiagram'

const topicId = 'ip-address-types'
const anchorConceptId = `${topicId}.napt`
const labels: Record<string, string> = {
  'host-a': '호스트 A',
  'host-b': '호스트 B',
  router: 'NAT 라우터',
  server: '서버',
  'private-1': '192.168.0.10:50000',
  'public-1': '203.0.113.1:60001',
  'private-2': '192.168.0.11:50000',
  'public-2': '203.0.113.1:60002',
}
const groupLabels: Record<string, string> = { private: '사설 네트워크', table: 'NAT 라우터의 표' }
const noteLabels: Record<string, string> = {
  'host-a-address': '192.168.0.10',
  'host-b-address': '192.168.0.11',
  'router-address': '203.0.113.1',
  'private-header': '사설 주소:포트',
  'public-header': '공인 주소:포트',
}
// 장치의 주소 곁말은 그 장치의 흐림을 따르고, 표의 열 이름은 늘 선명하다.
const noteOwner: Record<string, string | null> = {
  'host-a-address': 'host-a',
  'host-b-address': 'host-b',
  'router-address': 'router',
  'private-header': null,
  'public-header': null,
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const rows = [['private-1', 'public-1'], ['private-2', 'public-2']]
const cellIds = rows.flat()

const tallPaths: Record<string, string> = {
  'from-server': 'M208 124 H188',
  'to-host-a': 'M128 108 V60',
  'to-host-b': 'M152 108 V60',
}
const widePaths: Record<string, string> = {
  'from-server': 'M352 76 H288',
  'to-host-a': 'M192 68 H160 V44 H128',
  'to-host-b': 'M192 84 H160 V108 H128',
}
// 경로마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'from-server': ['server', 'router'],
  'to-host-a': ['router', 'host-a'],
  'to-host-b': ['router', 'host-b'],
}

const question = '공인 주소 하나를 여러 호스트가 어떻게 나눠 쓸까?'
const figureName = 'NAPT에서 NAT 라우터가 표의 포트 번호로 응답을 받을 호스트를 가리는 도식'
const svgName = '사설 네트워크의 호스트 A(192.168.0.10)와 호스트 B(192.168.0.11), 공인 주소 203.0.113.1을 쓰는 NAT 라우터, 서버, 그리고 사설 주소:포트와 공인 주소:포트의 짝 두 줄을 적은 NAT 라우터의 표'
const idleCaption = '사설 네트워크의 호스트 A·B, 공인 주소 203.0.113.1 하나를 쓰는 NAT 라우터, 서버, 그리고 NAT 라우터의 표 두 줄을 놓았다. 버튼을 고르면 서버의 응답이 표의 어느 줄을 따라 어느 호스트에게 돌아가는지 볼 수 있다.'
const legend = '얇은 선 박스가 사설 네트워크와 NAT 라우터의 표이고, 화살표는 서버의 응답이 돌아가는 방향이다. 호스트 곁의 곁말은 그 호스트의 사설 주소, NAT 라우터 곁의 곁말은 NAT 라우터가 쓰는 공인 주소다.'
const expectedScenarios = [
  {
    id: 'host-1', label: '호스트 A의 통신',
    nodes: ['host-a', 'router', 'server', 'private-1', 'public-1'], paths: ['from-server', 'to-host-a'],
    caption: '호스트 A의 패킷은 출발지 192.168.0.10:50000이 203.0.113.1:60001로 바뀌어 나가고, 표 첫 줄에 그 짝이 적힌다. 서버의 응답이 203.0.113.1:60001로 돌아오면 NAT 라우터는 첫 줄을 보고 목적지를 192.168.0.10:50000으로 바꿔 호스트 A에게 넘긴다.',
  },
  {
    id: 'host-2', label: '호스트 B의 통신',
    nodes: ['host-b', 'router', 'server', 'private-2', 'public-2'], paths: ['from-server', 'to-host-b'],
    caption: '호스트 B도 출발지 포트 번호가 50000이지만, 같은 공인 주소 203.0.113.1에 포트 60002가 붙어 나가고 표 둘째 줄에 적힌다. 응답이 203.0.113.1:60002로 돌아오면 둘째 줄을 보고 호스트 B에게 넘기므로, 공인 주소가 같아도 호스트 A의 통신과 섞이지 않는다.',
  },
]

const svg = () => screen.getByRole('img', { name: svgName })
const select = async (label: string) => { await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) }) }

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
const brightNodes = () => nodeIds.filter((id) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)

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

const nodeAt = (point: { x: number, y: number }) => nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))

// 그룹 라벨이 차지하는 상자.
const groupLabelBox = (id: string) => textBox(svg().querySelector(`[data-group-label="${id}"]`)!, `${id}-label`)

// 표 칸 라벨 `주소:포트`를 주소와 포트로 가른다.
const splitCell = (id: string) => { const [address, port] = label(id).split(':'); return { address, port } }

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 232] : [0, 0, 280, 272]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<NaptPortsDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 곁말이 모두 선명하고 화살표 없이 선택 안내가 나온다', () => {
    const { container } = render(<NaptPortsDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node], [data-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note'))).toEqual(Object.keys(noteLabels))
    for (const id of groupIds) expect(svg().querySelector(`[data-group-label="${id}"]`)!.textContent).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표만 선명하고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<NaptPortsDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    for (const [id, owner] of Object.entries(noteOwner)) {
      expect(svg().querySelector(`[data-note="${id}"]`), id).toHaveAttribute('opacity', owner === null || scenario.nodes.includes(owner) ? '1' : '0.25')
    }
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

  it.each(expectedScenarios)(`$label: 모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말·그룹 라벨이 자리에 들어간다`, async (scenario) => {
    render(<NaptPortsDiagram />)
    await select(scenario.label)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
    }
    for (let i = 0; i < nodeIds.length; i += 1) {
      for (const other of nodeIds.slice(i + 1)) expect(overlaps(nodeBox(nodeIds[i]), nodeBox(other)), `${nodeIds[i]} ↔ ${other}`).toBe(false)
    }
    const groupTexts = groupIds.map((id) => {
      const text = svg().querySelector(`[data-group-label="${id}"]`)!
      expect(text).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      return box
    })
    const texts = [...Array.from(svg().querySelectorAll('[data-note]'), (note) => {
      expect(note).toHaveAttribute('font-size', '9')
      expect(note).toHaveClass('fill-muted')
      expect(note.textContent).toBe(noteLabels[note.getAttribute('data-note')!])
      return textBox(note, note.getAttribute('data-note')!)
    }), ...groupTexts]
    expect(texts).toHaveLength(Object.keys(noteLabels).length + groupIds.length)
    for (const box of texts) {
      expect(box.x, box.id).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width, box.id).toBeLessThanOrEqual(viewBox[2])
      expect(box.y, box.id).toBeGreaterThanOrEqual(0)
      expect(box.y + box.height, box.id).toBeLessThanOrEqual(viewBox[3])
      for (const id of nodeIds) expect(overlaps(box, nodeBox(id)), `${box.id} ↔ ${id}`).toBe(false)
      for (const d of Object.values(paths)) {
        for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
      }
    }
    for (let i = 0; i < texts.length; i += 1) {
      for (const other of texts.slice(i + 1)) expect(overlaps(texts[i], other), `${texts[i].id} ↔ ${other.id}`).toBe(false)
    }
    // 표의 열 이름은 표 박스 안, 각 열의 칸 위에 있다.
    for (const [id, column] of [['private-header', 'private-1'], ['public-header', 'public-1']]) {
      const box = textBox(svg().querySelector(`[data-note="${id}"]`)!, id)
      expect(contains(groupBox('table'), box), id).toBe(true)
      expect(box.y + box.height, id).toBeLessThanOrEqual(nodeBox(column).y)
      expect(box.x, id).toBeGreaterThanOrEqual(nodeBox(column).x)
      expect(box.x + box.width, id).toBeLessThanOrEqual(nodeBox(column).x + nodeBox(column).width)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('표의 칸은 빈틈없이 이어지고 표 박스 안에 있으며, 호스트는 사설 네트워크 안, NAT 라우터와 서버는 두 박스 밖에 있다', () => {
    render(<NaptPortsDiagram />)
    for (const [privateCell, publicCell] of rows) {
      expect(nodeBox(privateCell).x + nodeBox(privateCell).width).toBe(nodeBox(publicCell).x)
      expect(nodeBox(privateCell).y).toBe(nodeBox(publicCell).y)
    }
    expect(nodeBox('private-1').y + 32).toBe(nodeBox('private-2').y)
    expect(nodeBox('private-1').x).toBe(nodeBox('private-2').x)
    expect(nodeBox('public-1').x).toBe(nodeBox('public-2').x)
    for (const id of cellIds) expect(contains(groupBox('table'), nodeBox(id)), id).toBe(true)
    for (const id of ['host-a', 'host-b']) expect(contains(groupBox('private'), nodeBox(id)), id).toBe(true)
    for (const id of ['router', 'server']) {
      for (const group of groupIds) expect(overlaps(groupBox(group), nodeBox(id)), `${id} ↔ ${group}`).toBe(false)
    }
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나거나 다른 화살표와 만나지 않는다', async () => {
    render(<NaptPortsDiagram />)
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const lines = shownPaths()
      for (const id of lines) {
        const d = paths[id]
        for (const segment of segments(d)) {
          for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
          for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
        }
        const { start, end } = lineEnds(d)
        expect(nodeAt(start), `${id} 시작`).toBe(ends[id][0])
        expect(nodeAt(end), `${id} 끝`).toBe(ends[id][1])
      }
      for (let i = 0; i < lines.length; i += 1) {
        for (const other of lines.slice(i + 1)) {
          for (const a of segments(paths[lines[i]])) {
            for (const b of segments(paths[other])) {
              const box = { id: '', x: Math.min(b.x1, b.x2), y: Math.min(b.y1, b.y2), width: Math.abs(b.x2 - b.x1), height: Math.abs(b.y2 - b.y1) }
              expect(touches(a, box), `${lines[i]} ↔ ${other}`).toBe(false)
            }
          }
        }
      }
    }
  })

  // 요점: 두 시나리오에서 선명한 NAT 라우터는 같은 노드(공인 주소 하나)이고, 선명한 표 줄은 서로 다르며 그 공인 쪽 주소는 같고 포트는 다르다(60001·60002).
  // 사설 쪽 포트는 같다(50000). 응답은 서버에서 NAT 라우터를 거쳐 그 줄의 사설 주소를 가진 호스트에게 간다. 이 사실과 예시 값은 개념 본문에 있다.
  it('공인 주소 하나를 함께 쓰는 두 호스트는 표의 다른 줄로 갈리고, 공인 쪽 포트가 달라 응답이 제 호스트에게 돌아간다', async () => {
    render(<NaptPortsDiagram />)
    const brightRows: string[][] = []
    const routers: string[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const bright = brightNodes()
      routers.push(...bright.filter((id) => id === 'router'))
      const row = rows.find(([privateCell, publicCell]) => bright.includes(privateCell) && bright.includes(publicCell))!
      expect(rows.filter((candidate) => candidate.some((cell) => bright.includes(cell))), scenario.id).toEqual([row])
      brightRows.push(row)
      const hops = shownPaths().map((id) => [nodeAt(lineEnds(paths[id]).start), nodeAt(lineEnds(paths[id]).end)])
      expect(hops[0]).toEqual(['server', 'router'])
      const host = hops[hops.length - 1][1]!
      const address = svg().querySelector(`[data-note="${host}-address"]`)!.textContent
      expect(splitCell(row[0]).address, scenario.id).toBe(address)
    }
    expect(routers).toEqual(['router', 'router'])
    expect(brightRows[0]).not.toEqual(brightRows[1])
    const [first, second] = brightRows.map(([privateCell, publicCell]) => ({ private: splitCell(privateCell), public: splitCell(publicCell) }))
    expect(first.public.address).toBe(second.public.address)
    expect(first.public.address).toBe(svg().querySelector('[data-note="router-address"]')!.textContent)
    expect([first.public.port, second.public.port]).toEqual(['60001', '60002'])
    expect(first.private.port).toBe('50000')
    expect(second.private.port).toBe('50000')
    expect(first.private.address).not.toBe(second.private.address)

    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join('\n')
    for (const cell of cellIds) expect(body).toContain(`\`${labels[cell]}\``)
    expect(body).toContain('둘 다 출발지 포트 번호 `50000`으로')
    expect(body).toContain('호스트 A의 패킷을 출발지 `203.0.113.1`의 포트 `60001`로, 호스트 B의 패킷을 같은 `203.0.113.1`의 포트 `60002`로 바꿔 내보낸다')
    expect(body).toContain('공인 쪽은 주소가 같아도 포트 번호가 달라 짝이 겹치지 않는다')
  })
}

describe('NaptPortsDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<NaptPortsDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 272')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('호스트 A의 통신')
      const tallFirst = shownPaths()
      await select('호스트 B의 통신')
      const tallSecond = shownPaths()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 232')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '호스트 B의 통신' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallSecond)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      await select('호스트 A의 통신')
      expect(shownPaths()).toEqual(tallFirst)
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><NaptPortsDiagram /><NaptPortsDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '호스트 A의 통신' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<NaptPortsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['napt-ports']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(naptPortsScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = naptPortsScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 NAPT 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(within(figure).queryByRole('heading')).toBeNull()
  })
})
