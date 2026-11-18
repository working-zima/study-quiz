import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { BaseImageChoiceDiagram, baseImageChoiceScenarios } from './BaseImageChoiceDiagram'

const topicId = 'windows-hyperv'
const anchorConceptId = `${topicId}.container-base-images`
const labels: Record<string, string> = {
  'container': '컨테이너',
  'app-layer': '응용 프로그램 층',
  'nano': 'Nano Server',
  'servercore': 'Server Core',
  'windows': 'Windows',
  'windows-server': 'Windows Server',
}
const groupLabels: Record<string, string> = {
  'base': '기본 이미지',
}
const noteLabels: Record<string, string> = {
  'run-note': '이미지로 실행한다',
  'nano-note': '가장 작은 기본 이미지',
  'servercore-note': '중간 크기의 기본 이미지',
  'windows-note': '가장 큰 기본 이미지',
  'windows-server-note': 'Windows 이미지보다 조금 작다',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
const baseImageIds = ['nano', 'servercore', 'windows', 'windows-server']
// 노드마다 들어 있는 박스. 기본 이미지 넷만 기본 이미지 박스 안이고, 응용 프로그램 층과 컨테이너는 그 밖 위에 있다.
const memberOf: Record<string, string[]> = {
  'container': [],
  'app-layer': [],
  'nano': ['base'],
  'servercore': ['base'],
  'windows': ['base'],
  'windows-server': ['base'],
}
const pathEnds: Record<string, [string, string]> = {
  'app-container': ['app-layer', 'container'],
  'nano-app': ['nano', 'app-layer'],
  'servercore-app': ['servercore', 'app-layer'],
  'windows-app': ['windows', 'app-layer'],
  'windows-server-app': ['windows-server', 'app-layer'],
}
const tallPaths: Record<string, string> = {
  'app-container': 'M140 80 V48',
  'nano-app': 'M78 160 V112',
  'servercore-app': 'M202 160 V112',
  'windows-app': 'M132 216 H140 V112',
  'windows-server-app': 'M148 216 H140 V112',
}
const widePaths: Record<string, string> = {
  'app-container': 'M220 80 V48',
  'nano-app': 'M80 160 V112',
  'servercore-app': 'M182 160 V112',
  'windows-app': 'M274 160 V112',
  'windows-server-app': 'M372 160 V112',
}

const question = '컨테이너 이미지는 어떤 기본 이미지 위에 만들까?'
const figureName = '기본 이미지 넷 가운데 하나를 골라 그 위에 응용 프로그램 층을 얹어 컨테이너 이미지를 만들고, 그 이미지로 컨테이너를 실행하는 것을 보이는 도식'
const svgName = '아래 기본 이미지 박스 안에 Nano Server·Server Core·Windows·Windows Server를 두고, 그 위에 응용 프로그램 층, 맨 위에 컨테이너를 둔 그림'
const idleCaption = '기본 이미지 넷 가운데 하나를 골라 그 위에 응용 프로그램 층을 얹고, 그렇게 만든 이미지로 컨테이너를 실행하는 차례를 그려 두었다. 버튼을 고르면 기본 이미지마다 크기와 어떤 응용 프로그램에 맞는지 볼 수 있다.'
const legend = '아래 박스의 기본 이미지 넷 가운데 하나만 골라 그 위에 응용 프로그램 층을 얹는다. 위로 향하는 화살표는 기본 이미지 위에 층을 얹는 차례와, 만든 이미지로 컨테이너를 실행하는 차례를 가리킨다.'
const expectedScenarios = [
  {
    id: 'nano', label: 'Nano Server', base: 'nano',
    nodes: ['container', 'app-layer', 'nano'],
    paths: ['nano-app', 'app-container'],
    notes: ['run-note', 'nano-note'],
    caption: 'Nano Server는 가장 작은 기본 이미지로, .NET Core로 새로 만드는 응용 프로그램에 맞는다. 그 위에 응용 프로그램 층을 얹어 컨테이너 이미지를 만들고, 그 이미지로 컨테이너를 실행한다.',
  },
  {
    id: 'servercore', label: 'Server Core', base: 'servercore',
    nodes: ['container', 'app-layer', 'servercore'],
    paths: ['servercore-app', 'app-container'],
    notes: ['run-note', 'servercore-note'],
    caption: 'Server Core는 중간 크기의 기본 이미지로, .NET Framework로 만든 기존 응용 프로그램을 거의 고치지 않고 컨테이너로 옮겨 올 때 맞는다. 그 위에 응용 프로그램 층을 얹는 차례는 Nano Server와 같다.',
  },
  {
    id: 'windows', label: 'Windows', base: 'windows',
    nodes: ['container', 'app-layer', 'windows'],
    paths: ['windows-app', 'app-container'],
    notes: ['run-note', 'windows-note'],
    caption: 'Windows는 Windows API 전체를 담은 가장 큰 기본 이미지로, 응용 프로그램이 필요로 하는 것이 Server Core에 빠져 있을 때 고른다.',
  },
  {
    id: 'windows-server', label: 'Windows Server', base: 'windows-server',
    nodes: ['container', 'app-layer', 'windows-server'],
    paths: ['windows-server-app', 'app-container'],
    notes: ['run-note', 'windows-server-note'],
    caption: 'Windows Server도 Windows API 전체를 담지만 Windows 이미지보다 조금 작고, 그래픽 처리 장치(GPU)로 처리를 빠르게 하는 기능이 필요할 때 고른다.',
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 244] : [0, 0, 280, 276]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<BaseImageChoiceDiagram />)
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
    const { container } = render(<BaseImageChoiceDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<BaseImageChoiceDiagram />)
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
    render(<BaseImageChoiceDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      expect(groupIds.filter((group) => contains(groupBox(group), nodeBox(id))), id).toEqual(memberOf[id])
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    for (const id of groupIds) {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
    }
    // 곁말은 viewBox 안에 들고 어느 박스에도 들지 않으며, 노드·그룹 라벨·선과 겹치지 않는다.
    // 크기 곁말은 시나리오마다 하나만 보이므로 같은 자리를 함께 쓴다 — 같은 시나리오에 함께 보이는 곁말끼리만 겹치지 않으면 된다.
    const noteBoxes = new Map<string, SvgBox>()
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const shown = scenario.notes.map((id) => textBox(note(id), id))
      for (const box of shown) noteBoxes.set(box.id, box)
      for (const box of shown) for (const other of shown.filter(({ id }) => id !== box.id)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
    }
    expect([...noteBoxes.keys()].sort()).toEqual([...noteIds].sort())
    expect(boxesOutsideViewBox([...noteBoxes.values()], viewBox)).toEqual([])
    for (const box of noteBoxes.values()) {
      expect(groupIds.filter((group) => contains(groupBox(group), box)), box.id).toEqual([])
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
      for (const group of groupIds) {
        expect(overlaps(box, groupLabelBox(group)), `${box.id} ↔ ${group} 라벨`).toBe(false)
        expect(overlaps(box, groupBox(group)), `${box.id} ↔ ${group} 박스`).toBe(false)
      }
      for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 정한 노드 변에서 시작해 정한 노드 변에서 끝나고, 노드 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<BaseImageChoiceDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(pathEnds)))
    for (const [id, d] of Object.entries(paths)) {
      const [from, to] = pathEnds[id]
      const { start, end } = lineEnds(d)
      expect(onEdge(start, nodeBox(from)), `${id} 시작`).toBe(true)
      expect(onEdge(end, nodeBox(to)), `${id} 끝`).toBe(true)
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
    }
  })

  // 요점: 시나리오마다 선명한 기본 이미지가 하나씩이고 서로 다르며, 보이는 화살표가 그 기본 이미지에서 응용 프로그램 층으로 가고
  // 응용 프로그램 층에서 컨테이너로 간다. Nano Server에 닿는 선은 응용 프로그램 층으로 가는 것 하나뿐이고,
  // 호스트나 운영 체제 설치를 뜻하는 노드는 그림에 없다 — Nano Server는 기본 이미지 하나일 뿐이다.
  it('시나리오마다 다른 기본 이미지 하나에서 응용 프로그램 층을 거쳐 컨테이너로 가고, Nano Server는 응용 프로그램 층으로만 이어진다', async () => {
    render(<BaseImageChoiceDiagram />)
    const startNode = (pathId: string) => nodeIds.filter((id) => onEdge(lineEnds(paths[pathId]).start, nodeBox(id)))
    const endNode = (pathId: string) => nodeIds.filter((id) => onEdge(lineEnds(paths[pathId]).end, nodeBox(id)))

    const chosen: string[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const sharp = baseImageIds.filter((id) => opacity(id) === '1')
      expect(sharp, scenario.id).toEqual([scenario.base])
      chosen.push(sharp[0])
      const [basePath, runPath] = shownPaths()
      expect(startNode(basePath), scenario.id).toEqual([scenario.base])
      expect(endNode(basePath), scenario.id).toEqual(['app-layer'])
      expect(startNode(runPath), scenario.id).toEqual(['app-layer'])
      expect(endNode(runPath), scenario.id).toEqual(['container'])
      expect(contains(groupBox('base'), nodeBox(scenario.base))).toBe(true)
      expect(contains(groupBox('base'), nodeBox('app-layer'))).toBe(false)
      expect(nodeBox('app-layer').y + 32, '응용 프로그램 층은 기본 이미지보다 위').toBeLessThan(nodeBox(scenario.base).y)
      expect(nodeBox('container').y + 32, '컨테이너는 응용 프로그램 층보다 위').toBeLessThan(nodeBox('app-layer').y)
    }
    expect(new Set(chosen).size).toBe(expectedScenarios.length)

    const touchingNano = Object.entries(paths)
      .filter(([, d]) => segments(d).some((segment) => touches(segment, nodeBox('nano'))))
      .map(([id]) => id)
    expect(touchingNano).toEqual(['nano-app'])
    for (const id of nodeIds) expect(labels[id], id).not.toMatch(/호스트|설치/u)

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const words of [...Object.values(noteLabels).filter((text) => text !== noteLabels['run-note']), '응용 프로그램 층', '이 이미지로 컨테이너를 실행한다', 'Nano Server', 'Server Core', '**Windows**', '**Windows Server**']) {
      expect(body, words).toContain(words)
    }
  })
}

describe('BaseImageChoiceDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<BaseImageChoiceDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 276')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('Server Core')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 244')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: 'Server Core' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><BaseImageChoiceDiagram /><BaseImageChoiceDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'Nano Server' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<BaseImageChoiceDiagram />)
    const text = visualsByTopicId[topicId].diagrams['base-image-choice']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(baseImageChoiceScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = baseImageChoiceScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 컨테이너 기본 이미지 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
