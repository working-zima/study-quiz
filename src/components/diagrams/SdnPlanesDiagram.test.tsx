import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { SdnPlanesDiagram, sdnPlanesScenarios } from './SdnPlanesDiagram'

const topicId = 'cloud-sdn'
const anchorConceptId = `${topicId}.sdn`
const labels: Record<string, string> = {
  'app': '응용 프로그램',
  'ctrl01': 'CTRL01',
  'sw01': 'SW01',
  'sw02': 'SW02',
  'sw03': 'SW03',
  'sender': '보내는 컴퓨터',
  'dest': '192.0.2.10',
}
const groupLabels: Record<string, string> = {
  'control': '제어 평면',
  'data': '데이터 평면',
}
const noteLabels: Record<string, string> = {
  'northbound-note': '노스바운드 인터페이스',
  'southbound-note': '사우스바운드 인터페이스',
  'forward-note': '스위치가 받은 규칙대로 패킷을 내보낸다',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
const switches = ['sw01', 'sw02', 'sw03']
// 「제어 평면」 박스는 컨트롤러 CTRL01을, 「데이터 평면」 박스는 스위치 셋을 담는다. 응용 프로그램과 두 컴퓨터는 박스 밖에 있다.
const members: Record<string, string[]> = {
  'control': ['ctrl01'],
  'data': ['sw01', 'sw02', 'sw03'],
}
// 화살표는 정보·규칙·패킷을 보내는 쪽의 변에서 나가 받는 쪽의 변에서 끝난다.
const pathEnds: Record<string, [string, string]> = {
  'app-ctrl': ['app', 'ctrl01'],
  'ctrl-sw01': ['ctrl01', 'sw01'],
  'ctrl-sw02': ['ctrl01', 'sw02'],
  'ctrl-sw03': ['ctrl01', 'sw03'],
  'pc-sw01': ['sender', 'sw01'],
  'sw01-sw02': ['sw01', 'sw02'],
  'sw02-sw03': ['sw02', 'sw03'],
  'sw03-dest': ['sw03', 'dest'],
}
const tallPaths: Record<string, string> = {
  'app-ctrl': 'M232 40 V84',
  'ctrl-sw01': 'M224 116 V184',
  'ctrl-sw02': 'M244 108 H256 V248 H244',
  'ctrl-sw03': 'M244 92 H264 V296 H244',
  'pc-sw01': 'M104 200 H164',
  'sw01-sw02': 'M204 216 V232',
  'sw02-sw03': 'M204 264 V280',
  'sw03-dest': 'M164 296 H96',
}
const widePaths: Record<string, string> = {
  'app-ctrl': 'M220 40 V84',
  'ctrl-sw01': 'M188 116 V184',
  'ctrl-sw02': 'M248 116 V184',
  'ctrl-sw03': 'M260 100 H364 V184',
  'pc-sw01': 'M164 256 V216',
  'sw01-sw02': 'M200 200 H228',
  'sw02-sw03': 'M300 200 H328',
  'sw03-dest': 'M364 216 V256',
}

const question = 'SDN에서는 누가 길을 정하고 누가 패킷을 보낼까?'
const figureName = 'SDN에서 컨트롤러가 응용 프로그램의 정보를 받아 규칙을 정해 스위치 셋에 내려보내는 모습과, 스위치들이 그 규칙대로 패킷을 내보내는 모습을 견주는 도식'
const svgName = '응용 프로그램, 「제어 평면」 박스 안의 CTRL01, 「데이터 평면」 박스 안의 SW01·SW02·SW03과, 보내는 컴퓨터·192.0.2.10을 화살표로 이은 그림'
const idleCaption = '컨트롤러 CTRL01은 제어 평면을, 스위치 SW01·SW02·SW03은 데이터 평면을 맡는다. 버튼으로 장면을 고르면 규칙이 어디서 어디로 내려가는지와, 패킷이 어느 길로 가는지 볼 수 있다.'
const legend = '응용 프로그램에서 CTRL01로, CTRL01에서 스위치로 가는 화살표는 정보와 규칙이 가는 쪽이고, 보내는 컴퓨터에서 스위치를 거쳐 가는 화살표는 패킷이 가는 쪽이다. CTRL01·SW01~SW03은 예로 붙인 이름이고, 192.0.2.10은 문서의 예로 쓰라고 남겨 둔 주소다.'
const expectedScenarios = [
  {
    id: 'rule', label: '규칙 내려보내기',
    nodes: ['app', 'ctrl01', 'sw01', 'sw02', 'sw03'],
    paths: ['app-ctrl', 'ctrl-sw01', 'ctrl-sw02', 'ctrl-sw03'],
    notes: ['northbound-note', 'southbound-note'],
    caption: '응용 프로그램이 노스바운드 인터페이스로 CTRL01에 필요한 정보를 주면, CTRL01은 패킷을 어떻게 보낼지 정해 사우스바운드 인터페이스로 SW01·SW02·SW03에 저마다 규칙을 내려보낸다. SW01에 가는 규칙은 「목적지가 192.0.2.10인 패킷은 2번 포트로 내보낸다」 같은 것이다.',
  },
  {
    id: 'forward', label: '규칙대로 보내기',
    nodes: ['sw01', 'sw02', 'sw03', 'sender', 'dest'],
    paths: ['pc-sw01', 'sw01-sw02', 'sw02-sw03', 'sw03-dest'],
    notes: ['forward-note'],
    caption: '보내는 컴퓨터가 192.0.2.10으로 보낸 패킷이 SW01에 들어오면, SW01의 데이터 평면이 그 패킷에 맞는 규칙을 찾아 SW02 쪽 포트로 내보낸다. SW02와 SW03도 받은 규칙대로 넘겨 패킷이 192.0.2.10에 닿고, 이 패킷은 CTRL01을 거치지 않는다.',
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
const groupLabel = (id: string) => svg().querySelector(`[data-group-label="${id}"]`)!.textContent!
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note')!)
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)!
const opacity = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function contains(outer: SvgBox, inner: SvgBox) {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height
}

// 곁말·그룹 라벨(9)의 가로 범위. 반각 문자가 섞이므로 어림값의 1.15배로 잡는다.
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 320] : [0, 0, 280, 360]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<SdnPlanesDiagram />)
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
    const { container } = render(<SdnPlanesDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<SdnPlanesDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownPaths()).toEqual(scenario.paths)
    for (const path of svg().querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('d', paths[path.getAttribute('data-path')!])
      expect(path).toHaveAttribute('stroke-width', '2')
      expect(path).toHaveClass('stroke-title')
      expect(path).toHaveAttribute('marker-end', `url(#${svg().querySelector('marker')!.id})`)
      expect(path.closest('[opacity]')).toBeNull()
    }
    expect(shownNotes()).toEqual(scenario.notes)
    for (const id of scenario.notes) {
      expect(note(id).textContent).toBe(noteLabels[id])
      expect(note(id)).toHaveAttribute('font-size', '9')
    }
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·그룹 라벨·곁말이 자리에 들어간다`, async () => {
    render(<SdnPlanesDiagram />)
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
    // 곁말은 viewBox 안, 두 평면 박스 밖의 빈자리에 들어가고, 노드·그룹 라벨·선과 겹치지 않는다. 노드와는 위아래 4 이상 띄운다.
    const seen: string[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const visible = scenario.notes.map((id) => textBox(note(id), id))
      seen.push(...scenario.notes)
      expect(boxesOutsideViewBox(visible, viewBox)).toEqual([])
      for (const box of visible) {
        for (const group of groupIds) expect(overlaps(box, groupBox(group)), `${box.id}는 ${group} 박스 밖`).toBe(false)
        for (const node of nodeIds) {
          const nodeArea = nodeBox(node)
          expect(overlaps(box, { ...nodeArea, y: nodeArea.y - 4, height: nodeArea.height + 8 }), `${box.id} ↔ ${node}`).toBe(false)
        }
        for (const group of groupIds) expect(overlaps(box, groupLabelBox(group)), `${box.id} ↔ ${group} 라벨`).toBe(false)
        for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
      }
    }
    expect([...seen].sort()).toEqual([...noteIds].sort())
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 보내는 쪽의 변에서 시작해 받는 쪽의 변에서 끝나고, 노드 안이나 그룹 라벨을 지나지 않으며 한 장면의 화살표끼리 겹치지 않는다', () => {
    render(<SdnPlanesDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(pathEnds)))
    for (const [id, d] of Object.entries(paths)) {
      const { start, end } = lineEnds(d)
      expect(onEdge(start, nodeBox(pathEnds[id][0])), `${id} 시작`).toBe(true)
      expect(onEdge(end, nodeBox(pathEnds[id][1])), `${id} 끝`).toBe(true)
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
    }
    for (const scenario of expectedScenarios) {
      for (const a of scenario.paths) for (const b of scenario.paths.filter((other) => other !== a)) {
        for (const sa of segments(paths[a])) for (const sb of segments(paths[b])) expect(collinearOverlap(sa, sb), `${a} ↔ ${b}`).toBe(false)
      }
    }
  })

  // 요점: 규칙 내려보내기에서는 CTRL01에서 나간 보이는 화살표가 스위치 셋 모두에 닿는다 — 컨트롤러 한곳이 여러 장비의 규칙을 정한다.
  // 규칙대로 보내기에서는 보이는 화살표 어느 것도 CTRL01을 끝점으로 갖지 않고, 화살표를 따라가면 보내는 컴퓨터 → SW01 → SW02 → SW03 → 192.0.2.10이다.
  it('규칙은 CTRL01에서 스위치 셋으로 내려가고, 패킷은 CTRL01을 거치지 않고 스위치들을 따라 목적지에 닿는다', async () => {
    render(<SdnPlanesDiagram />)
    const ends = (id: string) => [endpointNode(lineEnds(paths[id]).start), endpointNode(lineEnds(paths[id]).end)] as [string, string]

    await select('규칙 내려보내기')
    const fromController = shownPaths().map(ends).filter(([from]) => from === 'ctrl01').map(([, to]) => to)
    expect([...fromController].sort()).toEqual([...switches].sort())
    expect(shownPaths().map(ends).filter(([, to]) => to === 'ctrl01')).toEqual([['app', 'ctrl01']])
    for (const id of ['sender', 'dest']) expect(opacity(id), id).toBe('0.25')

    await select('규칙대로 보내기')
    const visible = shownPaths().map(ends)
    for (const [from, to] of visible) {
      expect(from, `${from} → ${to}`).not.toBe('ctrl01')
      expect(to, `${from} → ${to}`).not.toBe('ctrl01')
    }
    expect(opacity('ctrl01')).toBe('0.25')
    const route = ['sender']
    while (route.length <= visible.length) {
      const next = visible.find(([from]) => from === route[route.length - 1])
      if (!next) break
      route.push(next[1])
    }
    expect(route).toEqual(['sender', 'sw01', 'sw02', 'sw03', 'dest'])

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const phrase of ['컨트롤러 `CTRL01`', '`SW01`·`SW02`·`SW03`', '`192.0.2.10`', '2번 포트로 내보낸다', '`SW01`의 2번 포트는 `SW02`와 이어져', '`CTRL01`에게 묻지 않는다', '노스바운드 인터페이스', '사우스바운드 인터페이스', '예로 붙인 이름표']) {
      expect(body, phrase).toContain(phrase)
    }
  })
}

describe('SdnPlanesDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<SdnPlanesDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 360')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('규칙 내려보내기')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 320')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '규칙 내려보내기' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><SdnPlanesDiagram /><SdnPlanesDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '규칙 내려보내기' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<SdnPlanesDiagram />)
    const text = visualsByTopicId[topicId].diagrams['sdn-planes']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(sdnPlanesScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = sdnPlanesScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 SDN 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
