import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { FiberCoreCladdingDiagram, fiberCoreCladdingScenarios } from './FiberCoreCladdingDiagram'

const topicId = 'transmission-media'
const anchorConceptId = `${topicId}.optical-fiber`
const labels: Record<string, string> = {
  'single-sender': '보내는 쪽',
  'single-receiver': '받는 쪽',
  'multi-sender': '보내는 쪽',
  'multi-receiver': '받는 쪽',
}
const groupLabels: Record<string, string> = {
  'single-cladding-top': '클래딩',
  'single-core': '싱글 모드의 코어',
  'single-cladding-bottom': '클래딩',
  'multi-cladding-top': '클래딩',
  'multi-core': '멀티 모드의 코어',
  'multi-cladding-bottom': '클래딩',
}
const noteLabels: Record<string, string> = {
  'single-note': '빛이 하나의 모드로만 나아간다',
  'multi-note': '빛이 여러 모드로 함께 나아간다',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
// 화살표 하나가 빛이 나아가는 모드 하나다. 보내는 쪽 노드의 변에서 나가 받는 쪽 노드의 변에서 끝난다.
const pathEnds: Record<string, [string, string]> = {
  'single-mode': ['single-sender', 'single-receiver'],
  'multi-mode-1': ['multi-sender', 'multi-receiver'],
  'multi-mode-2': ['multi-sender', 'multi-receiver'],
  'multi-mode-3': ['multi-sender', 'multi-receiver'],
}
const tallPaths: Record<string, string> = {
  'single-mode': 'M74 50 H206',
  'multi-mode-1': 'M74 148 H206',
  'multi-mode-2': 'M74 160 H206',
  'multi-mode-3': 'M74 172 H206',
}
const widePaths: Record<string, string> = {
  'single-mode': 'M104 50 H336',
  'multi-mode-1': 'M104 148 H336',
  'multi-mode-2': 'M104 160 H336',
  'multi-mode-3': 'M104 172 H336',
}

const question = '빛은 광섬유의 어디를 지나 나아갈까?'
const figureName = '싱글 모드 광섬유와 멀티 모드 광섬유를 위아래로 놓고, 둘 다 코어를 클래딩이 감싸며 빛이 코어를 따라 나아가는 것과, 빛이 나아가는 모드의 수를 견주는 도식'
const svgName = '위아래 두 광섬유마다 왼쪽에 보내는 쪽, 오른쪽에 받는 쪽을 두고, 그 사이에 클래딩·코어·클래딩의 띠를 쌓은 그림'
const idleCaption = '위는 싱글 모드 광섬유, 아래는 멀티 모드 광섬유다. 둘 다 가운데의 코어를 클래딩이 감싸고, 빛은 코어를 따라 보내는 쪽에서 받는 쪽으로 나아간다. 버튼으로 하나를 고르면 빛이 몇 개의 모드로 나아가는지 볼 수 있다.'
const legend = '화살표 하나가 빛이 나아가는 모드 하나다. 실제 모드는 선이 아니라 코어 안에 빛이 퍼진 모양이고, 띠의 두께는 크기를 재어 그린 것이 아니다.'
const expectedScenarios = [
  {
    id: 'single', label: '싱글 모드',
    nodes: ['single-sender', 'single-receiver'],
    paths: ['single-mode'],
    notes: ['single-note'],
    caption: '싱글 모드 광섬유에서는 빛이 하나의 모드로만 나아간다. 빛이 퍼진 폭이 약 9 µm로 가늘고, 빛이 덜 약해져 통신사의 공중망처럼 먼 거리를 잇는 데 쓴다.',
  },
  {
    id: 'multi', label: '멀티 모드',
    nodes: ['multi-sender', 'multi-receiver'],
    paths: ['multi-mode-1', 'multi-mode-2', 'multi-mode-3'],
    notes: ['multi-note'],
    caption: '멀티 모드 광섬유에서는 여러 모드의 빛이 함께 나아간다. 코어 지름이 50 µm로 싱글 모드에서 빛이 퍼진 폭보다 굵고, 건물 안 배선처럼 짧은 거리에 쓴다.',
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

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function contains(outer: SvgBox, inner: SvgBox) {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height
}

// 곁말·그룹 라벨(9)의 가로 범위. 반각 문자가 섞일 수 있으므로 어림값의 1.15배로 잡는다.
function textBox(text: Element, id: string): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9) * 1.15
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id, x: left, y: y - 9, width, height: 9 }
}

const groupLabelBox = (id: string) => textBox(svg().querySelector(`[data-group-label="${id}"]`)!, `${id}-label`)

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

// 선이 띠(그룹 박스)의 안쪽을 지나는가 — 가로선이 띠의 위아래 변 사이에 있고, 띠의 왼쪽 끝에서 오른쪽 끝까지 가로지른다.
function runsThrough(d: string, band: SvgBox) {
  return segments(d).some((segment) => segment.y1 === segment.y2
    && segment.y1 > band.y && segment.y1 < band.y + band.height
    && Math.min(segment.x1, segment.x2) <= band.x && Math.max(segment.x1, segment.x2) >= band.x + band.width)
}

// 선의 어느 부분이라도 띠의 위아래 변 사이를 지나는가.
function entersBand(d: string, band: SvgBox) {
  return segments(d).some((segment) => {
    const top = Math.min(segment.y1, segment.y2)
    const bottom = Math.max(segment.y1, segment.y2)
    const left = Math.min(segment.x1, segment.x2)
    const right = Math.max(segment.x1, segment.x2)
    return bottom > band.y && top < band.y + band.height && right > band.x && left < band.x + band.width
  })
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
  return (nextMatches: boolean) => {
    mediaQuery.matches = nextMatches
    act(() => listeners.forEach((listener) => listener(Object.assign(new Event('change'), { matches: nextMatches, media: mediaQuery.media }) as MediaQueryListEvent)))
  }
}

function layoutTests(wide: boolean) {
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 220] : [0, 0, 280, 220]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<FiberCoreCladdingDiagram />)
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
    const { container } = render(<FiberCoreCladdingDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<FiberCoreCladdingDiagram />)
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
    render(<FiberCoreCladdingDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      // 보내는 쪽과 받는 쪽은 띠 밖에 있다.
      for (const group of groupIds) expect(overlaps(groupBox(group), nodeBox(id)), `${id}는 ${group} 띠 밖`).toBe(false)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    // 띠는 서로 겹치지 않고 위아래로 맞닿는다.
    for (const a of groupIds) for (const b of groupIds.filter((other) => other !== a)) expect(overlaps(groupBox(a), groupBox(b)), `${a} ↔ ${b}`).toBe(false)
    for (const id of groupIds) {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
    }
    // 곁말은 띠 밖의 빈자리에 들어가고, 노드와는 위아래 4 이상 띄우며 그룹 라벨·다른 곁말·선과 겹치지 않는다.
    const noteBoxes: SvgBox[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of scenario.notes) noteBoxes.push(textBox(note(id), id))
    }
    expect([...noteBoxes.map(({ id }) => id)].sort()).toEqual([...noteIds].sort())
    expect(boxesOutsideViewBox(noteBoxes, viewBox)).toEqual([])
    for (const box of noteBoxes) {
      for (const group of groupIds) expect(overlaps(box, groupBox(group)), `${box.id} ↔ ${group}`).toBe(false)
      for (const node of nodeIds) {
        const nodeArea = nodeBox(node)
        expect(overlaps(box, { ...nodeArea, y: nodeArea.y - 4, height: nodeArea.height + 8 }), `${box.id} ↔ ${node}`).toBe(false)
      }
      for (const other of noteBoxes.filter(({ id }) => id !== box.id)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
      for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 보내는 쪽의 변에서 시작해 받는 쪽의 변에서 끝나고, 노드 안이나 그룹 라벨을 지나지 않으며 서로 겹치지 않는다', () => {
    render(<FiberCoreCladdingDiagram />)
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
    const ids = Object.keys(paths)
    for (const a of ids) for (const b of ids.filter((other) => other !== a)) {
      for (const sa of segments(paths[a])) for (const sb of segments(paths[b])) expect(collinearOverlap(sa, sb), `${a} ↔ ${b}`).toBe(false)
    }
  })

  // 요점: 싱글 모드에서 보이는 화살표는 하나이고 싱글 모드의 코어 띠를 가로지른다. 멀티 모드에서 보이는 화살표는 둘 이상이고
  // 모두 멀티 모드의 코어 띠를 가로지르며, 어느 화살표도 클래딩 띠 안으로 들어가지 않는다. 멀티 모드의 코어 띠가 싱글 모드의 것보다 굵다.
  it('싱글 모드는 코어를 지나는 화살표 하나, 멀티 모드는 코어를 지나는 화살표 여럿이고 어느 것도 클래딩에 들어가지 않는다', async () => {
    render(<FiberCoreCladdingDiagram />)
    const claddings = groupIds.filter((id) => id.includes('cladding'))

    await select('싱글 모드')
    expect(shownPaths()).toHaveLength(1)
    for (const id of shownPaths()) {
      expect(runsThrough(paths[id], groupBox('single-core')), `${id}는 싱글 모드의 코어를 지난다`).toBe(true)
      for (const cladding of claddings) expect(entersBand(paths[id], groupBox(cladding)), `${id} ↔ ${cladding}`).toBe(false)
    }

    await select('멀티 모드')
    expect(shownPaths().length).toBeGreaterThanOrEqual(2)
    for (const id of shownPaths()) {
      expect(runsThrough(paths[id], groupBox('multi-core')), `${id}는 멀티 모드의 코어를 지난다`).toBe(true)
      for (const cladding of claddings) expect(entersBand(paths[id], groupBox(cladding)), `${id} ↔ ${cladding}`).toBe(false)
    }

    expect(groupBox('multi-core').height).toBeGreaterThan(groupBox('single-core').height)
    // 코어는 위아래의 클래딩 띠 사이에 끼어 있다.
    for (const kind of ['single', 'multi']) {
      const [top, core, bottom] = [groupBox(`${kind}-cladding-top`), groupBox(`${kind}-core`), groupBox(`${kind}-cladding-bottom`)]
      expect(top.y + top.height, `${kind} 위 클래딩`).toBe(core.y)
      expect(core.y + core.height, `${kind} 아래 클래딩`).toBe(bottom.y)
    }

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const phrase of ['코어(core)', '클래딩(cladding)', '하나의 모드로만 나아가', '여러 모드의 빛이 함께 나아가', '9 µm', '50 µm', '건물 안 배선', '공중망']) {
      expect(body, phrase).toContain(phrase)
    }
  })
}

describe('FiberCoreCladdingDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<FiberCoreCladdingDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 220')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('멀티 모드')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 220')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '멀티 모드' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><FiberCoreCladdingDiagram /><FiberCoreCladdingDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '멀티 모드' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<FiberCoreCladdingDiagram />)
    const text = visualsByTopicId[topicId].diagrams['fiber-core-cladding']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(fiberCoreCladdingScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = fiberCoreCladdingScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 광케이블 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
