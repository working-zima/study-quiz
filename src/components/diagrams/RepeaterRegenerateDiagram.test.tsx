import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { RepeaterRegenerateDiagram, repeaterRegenerateScenarios } from './RepeaterRegenerateDiagram'

const topicId = 'network-devices'
const anchorConceptId = `${topicId}.repeater`
const labels: Record<string, string> = {
  'pc01': 'PC01',
  'weak': '약해진 신호',
  'rp01': 'RP01',
  'pc05': 'PC05',
  'regen': '다시 만든 신호',
}
const groupLabels: Record<string, string> = {
  'domain': '충돌 도메인 하나',
  'segment1': '구간 1',
  'segment2': '구간 2',
}
const noteLabels: Record<string, string> = {
  'regenerate-note': '다시 만들어 보낸다',
  'domain-note': '두 신호가 부딪친다',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
// 그룹 박스마다 담는 노드. RP01은 두 구간 박스 사이, 충돌 도메인 박스 안에 있다.
const members: Record<string, string[]> = {
  'domain': ['pc01', 'weak', 'rp01', 'pc05', 'regen'],
  'segment1': ['pc01', 'weak'],
  'segment2': ['pc05', 'regen'],
}
// 화살표는 신호를 보낸 쪽의 변에서 나가 받은 쪽의 변에서 끝난다.
const pathEnds: Record<string, [string, string]> = {
  'weak-rp01': ['weak', 'rp01'],
  'rp01-regen': ['rp01', 'regen'],
  'pc01-rp01': ['pc01', 'rp01'],
  'pc05-rp01': ['pc05', 'rp01'],
}
const tallPaths: Record<string, string> = {
  'weak-rp01': 'M200 84 V128 H184',
  'rp01-regen': 'M184 144 H200 V196',
  'pc01-rp01': 'M76 84 V128 H96',
  'pc05-rp01': 'M76 196 V144 H96',
}
const widePaths: Record<string, string> = {
  'weak-rp01': 'M144 108 H170 V96 H188',
  'rp01-regen': 'M252 96 H270 V108 H296',
  'pc01-rp01': 'M144 66 H170 V80 H188',
  'pc05-rp01': 'M296 66 H270 V80 H252',
}

const question = '리피터는 두 케이블 구간 사이에서 무엇을 할까?'
const figureName = '케이블 두 구간 사이의 리피터 RP01이 약해진 신호를 다시 만들어 내보내는 모습과, 리피터로 이은 두 구간이 충돌 도메인 하나가 되는 모습을 보이는 도식'
const svgName = '충돌 도메인 박스 안에 구간 1(PC01·약해진 신호)과 구간 2(PC05·다시 만든 신호)를 두고, 두 구간 사이에 RP01을 둔 그림'
const idleCaption = '케이블 두 구간 사이에 리피터 RP01이 있고, 구간 1에 PC01, 구간 2에 PC05가 이어져 있다. 이름은 예로 붙인 이름표다. 버튼을 고르면 RP01이 신호를 다시 만드는 모습과, 두 구간이 충돌 도메인 하나가 되는 모습을 볼 수 있다.'
const legend = '바깥 박스는 서로 충돌할 수 있는 장치들의 범위인 충돌 도메인이고, 안의 두 박스는 케이블 구간이다. 화살표는 신호가 가는 쪽이다.'
const expectedScenarios = [
  {
    id: 'regenerate', label: '신호 다시 만들기',
    nodes: ['weak', 'rp01', 'regen'],
    paths: ['weak-rp01', 'rp01-regen'],
    notes: ['regenerate-note'],
    caption: '구간 1을 지나며 약해지고 흐트러진 신호가 RP01에 닿는다. RP01은 그 신호의 파형과 타이밍을 되살려 올바른 신호로 다시 만들고, 그 신호를 구간 2에 내보낸다.',
  },
  {
    id: 'one-domain', label: '충돌 도메인 하나',
    nodes: ['pc01', 'rp01', 'pc05'],
    paths: ['pc01-rp01', 'pc05-rp01'],
    notes: ['domain-note'],
    caption: 'RP01은 프레임을 읽지 않아 받을 장치가 어느 구간에 있는지 가리지 못하고, 한 구간의 신호를 다른 구간으로 모두 내보낸다. 그래서 PC01과 PC05가 거의 같은 때 보내면 두 신호가 만나 충돌한다.',
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 152] : [0, 0, 280, 258]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<RepeaterRegenerateDiagram />)
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
    const { container } = render(<RepeaterRegenerateDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<RepeaterRegenerateDiagram />)
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
    render(<RepeaterRegenerateDiagram />)
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
    // 충돌 도메인 박스의 라벨은 두 구간 박스와 겹치지 않는다.
    for (const segment of ['segment1', 'segment2']) expect(overlaps(groupLabelBox('domain'), groupBox(segment)), segment).toBe(false)
    // 곁말은 viewBox와 충돌 도메인 박스 안, 두 구간 박스 밖에 들어가고, 노드·그룹 라벨·다른 곁말·선과 겹치지 않는다.
    const noteBoxes: SvgBox[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of scenario.notes) noteBoxes.push(textBox(note(id), id))
    }
    expect([...noteBoxes.map(({ id }) => id)].sort()).toEqual([...noteIds].sort())
    expect(boxesOutsideViewBox(noteBoxes, viewBox)).toEqual([])
    for (const box of noteBoxes) {
      expect(contains(groupBox('domain'), box), box.id).toBe(true)
      for (const segment of ['segment1', 'segment2']) expect(overlaps(box, groupBox(segment)), `${box.id}는 ${segment} 박스 밖`).toBe(false)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
      for (const group of groupIds) expect(overlaps(box, groupLabelBox(group)), `${box.id} ↔ ${group} 라벨`).toBe(false)
      for (const other of noteBoxes.filter(({ id }) => id !== box.id)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
      for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 보낸 쪽의 변에서 시작해 받은 쪽의 변에서 끝나고, 노드 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<RepeaterRegenerateDiagram />)
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
  })

  // 요점: 신호 다시 만들기에서는 화살표가 약해진 신호 → RP01 → 다시 만든 신호로 이어진다. 약해진 신호는 구간 1에, 다시 만든 신호는 구간 2에 있다.
  // 충돌 도메인 하나에서는 RP01로 들어오는 화살표가 두 구간 모두(PC01·PC05)에서 오고, 충돌 도메인 박스가 두 구간의 장치와 RP01을 모두 감싼다.
  it('신호 다시 만들기는 약해진 신호 → RP01 → 다시 만든 신호로 잇고, 충돌 도메인 하나는 두 구간의 신호가 모두 RP01로 모인다', async () => {
    render(<RepeaterRegenerateDiagram />)
    expect(overlaps(groupBox('segment1'), groupBox('segment2'))).toBe(false)
    expect(contains(groupBox('domain'), groupBox('segment1'))).toBe(true)
    expect(contains(groupBox('domain'), groupBox('segment2'))).toBe(true)
    // RP01은 두 구간 박스 어느 쪽에도 들지 않고, 두 박스 사이에 놓인다.
    for (const segment of ['segment1', 'segment2']) expect(overlaps(groupBox(segment), nodeBox('rp01')), segment).toBe(false)

    await select('신호 다시 만들기')
    const chain = shownPaths().map((id) => pathEnds[id])
    expect(chain).toEqual([['weak', 'rp01'], ['rp01', 'regen']])
    expect(contains(groupBox('segment1'), nodeBox('weak'))).toBe(true)
    expect(contains(groupBox('segment2'), nodeBox('regen'))).toBe(true)
    for (const id of ['pc01', 'pc05']) expect(opacity(id), id).toBe('0.25')

    await select('충돌 도메인 하나')
    const ends = shownPaths().map((id) => pathEnds[id])
    expect(ends.every(([, to]) => to === 'rp01')).toBe(true)
    const senders = ends.map(([from]) => from)
    expect(senders.some((id) => members.segment1.includes(id))).toBe(true)
    expect(senders.some((id) => members.segment2.includes(id))).toBe(true)
    for (const id of ['pc01', 'pc05', 'rp01']) expect(contains(groupBox('domain'), nodeBox(id)), id).toBe(true)
    for (const id of ['weak', 'regen']) expect(opacity(id), id).toBe('0.25')

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const name of ['리피터 `RP01`', '구간 1에 `PC01`', '구간 2에 `PC05`', '파형과 타이밍을 되살려', '약해진 채', '다시 만든 신호', '충돌 도메인 하나', '충돌도 넘긴다', '거의 같은 때 보내면']) {
      expect(body, name).toContain(name)
    }
  })
}

describe('RepeaterRegenerateDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<RepeaterRegenerateDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 258')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('충돌 도메인 하나')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 152')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '충돌 도메인 하나' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><RepeaterRegenerateDiagram /><RepeaterRegenerateDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '신호 다시 만들기' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<RepeaterRegenerateDiagram />)
    const text = visualsByTopicId[topicId].diagrams['repeater-regenerate']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(repeaterRegenerateScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = repeaterRegenerateScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 리피터 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
