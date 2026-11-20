import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { WirelessLanModesDiagram, wirelessLanModesScenarios } from './WirelessLanModesDiagram'

const topicId = 'wireless-lan'
const anchorConceptId = `${topicId}.wireless-lan`
const labels: Record<string, string> = {
  'wired': '유선 LAN',
  'laptop01': 'LAPTOP01',
  'ap01': 'AP01',
  'laptop02': 'LAPTOP02',
}
// SSID 곁말은 예시 곁말이라 시나리오와 상관없이 늘 보이고 AP01의 opacity를 따른다(ADR-038).
const exampleNoteLabels: Record<string, string> = {
  'ssid-note': 'SSID OfficeNet',
}
const scenarioNoteLabels: Record<string, string> = {
  'infra-note': 'AP01을 거쳐 간다',
  'adhoc-note': 'AP 없이 직접',
}
const nodeIds = Object.keys(labels)
const pathEnds: Record<string, [string, string]> = {
  'laptop01-ap': ['laptop01', 'ap01'],
  'ap-laptop02': ['ap01', 'laptop02'],
  'ap-wired': ['ap01', 'wired'],
  'laptop01-laptop02': ['laptop01', 'laptop02'],
}
const tallPaths: Record<string, string> = {
  'laptop01-ap': 'M80 112 H104',
  'ap-laptop02': 'M176 112 H200',
  'ap-wired': 'M140 96 V48',
  'laptop01-laptop02': 'M44 128 V176 H236 V128',
}
const widePaths: Record<string, string> = {
  'laptop01-ap': 'M128 112 H184',
  'ap-laptop02': 'M256 112 H312',
  'ap-wired': 'M220 96 V48',
  'laptop01-laptop02': 'M84 128 V176 H356 V128',
}

const question = '무선 LAN의 장치들은 누구를 거쳐 통신할까?'
const figureName = '노트북 LAPTOP01·LAPTOP02와 AP01(SSID OfficeNet), 유선 LAN을 두고, 인프라스트럭처 모드와 애드혹 모드에서 LAPTOP01이 보낸 프레임이 어디를 거쳐 가는지 보이는 도식'
const svgName = '맨 위에 유선 LAN을, 그 아래 줄 가운데에 AP01을, AP01의 양옆에 LAPTOP01과 LAPTOP02를 둔 그림'
const idleCaption = '사무실에 AP01을 두고 SSID를 OfficeNet으로 정했다. LAPTOP01·LAPTOP02·AP01·OfficeNet은 예로 붙인 이름이다. 버튼으로 무선 LAN의 두 구성을 고르면 LAPTOP01이 보낸 프레임이 어디를 거쳐 가는지 볼 수 있다.'
const legend = '화살표는 LAPTOP01이 보낸 프레임이 지나가는 길이다. AP01 아래의 SSID OfficeNet은 AP01이 주변에 알리는 무선 LAN의 이름이다.'
const expectedScenarios = [
  {
    id: 'infra', label: '인프라스트럭처 모드',
    nodes: ['wired', 'laptop01', 'ap01', 'laptop02'],
    paths: ['laptop01-ap', 'ap-laptop02', 'ap-wired'],
    notes: ['infra-note'],
    caption: '인프라스트럭처 모드에서는 LAPTOP01이 LAPTOP02에게 보내는 프레임도 대개 AP01을 거쳐 간다. AP01은 자기에게 연결된 두 노트북을 서로 잇고, 케이블로 이어진 유선 LAN과도 잇는다.',
  },
  {
    id: 'adhoc', label: '애드혹 모드',
    nodes: ['laptop01', 'laptop02'],
    paths: ['laptop01-laptop02'],
    notes: ['adhoc-note'],
    caption: '애드혹 모드에서는 AP 없이 LAPTOP01과 LAPTOP02가 서로 직접 프레임을 주고받는다. AP가 없으니 유선 LAN으로 가는 길이 없고, 두 노트북의 전파가 서로 닿는 범위에서 통신한다.',
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
const label = (id: string) => svg().querySelector(`[data-node="${id}"] text`)!.textContent!
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note')!)
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)!
const exampleNote = (id: string) => svg().querySelector(`[data-example-note="${id}"]`)!
const opacity = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

// 곁말(9)의 가로 범위. 반각 문자가 섞이므로 어림값의 1.15배로 잡는다.
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 208] : [0, 0, 280, 208]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<WirelessLanModesDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표와 시나리오 곁말 없이 선택 안내가 나오며, SSID 곁말은 늘 보인다', () => {
    const { container } = render(<WirelessLanModesDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(svg().querySelectorAll('[data-group]')).toHaveLength(0)
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(exampleNote('ssid-note').textContent).toBe(exampleNoteLabels['ssid-note'])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<WirelessLanModesDiagram />)
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
      expect(note(id).textContent).toBe(scenarioNoteLabels[id])
      expect(note(id)).toHaveAttribute('font-size', '9')
    }
    // SSID 곁말은 AP01의 묶음 안에 있어 AP01과 함께 흐려진다.
    expect(exampleNote('ssid-note').closest('[data-node]')).toHaveAttribute('data-node', 'ap01')
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말이 자리에 들어간다`, async () => {
    render(<WirelessLanModesDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    // 곁말은 viewBox 안에 들어가고, 노드·다른 곁말·선과 겹치지 않는다.
    expect(exampleNote('ssid-note')).toHaveAttribute('font-size', '9')
    const noteBoxes: SvgBox[] = [textBox(exampleNote('ssid-note'), 'ssid-note')]
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of scenario.notes) noteBoxes.push(textBox(note(id), id))
    }
    expect([...noteBoxes.map(({ id }) => id)].sort()).toEqual([...Object.keys(exampleNoteLabels), ...Object.keys(scenarioNoteLabels)].sort())
    expect(boxesOutsideViewBox(noteBoxes, viewBox)).toEqual([])
    for (const box of noteBoxes) {
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
      for (const other of noteBoxes.filter(({ id }) => id !== box.id)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
      for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 정한 노드 변에서 시작해 정한 노드 변에서 끝나고, 노드 안을 지나지 않는다', () => {
    render(<WirelessLanModesDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(pathEnds)))
    for (const [id, d] of Object.entries(paths)) {
      const [from, to] = pathEnds[id]
      const { start, end } = lineEnds(d)
      expect(onEdge(start, nodeBox(from)), `${id} 시작`).toBe(true)
      expect(onEdge(end, nodeBox(to)), `${id} 끝`).toBe(true)
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
      }
    }
  })

  // 요점: 인프라스트럭처 모드에서는 보이는 화살표가 모두 AP01을 한쪽 끝으로 갖는다(두 노트북 사이도 AP01을 거친다).
  // 애드혹 모드에서는 보이는 화살표가 LAPTOP01과 LAPTOP02를 바로 잇고, AP01과 유선 LAN은 흐리다.
  it('인프라스트럭처 모드의 화살표는 모두 AP01에 닿고, 애드혹 모드의 화살표는 AP01 없이 두 노트북을 바로 잇는다', async () => {
    render(<WirelessLanModesDiagram />)
    const touchesNode = (id: string, node: string) => {
      const { start, end } = lineEnds(paths[id])
      return onEdge(start, nodeBox(node)) || onEdge(end, nodeBox(node))
    }

    await select('인프라스트럭처 모드')
    expect(shownPaths().length).toBeGreaterThan(0)
    for (const id of shownPaths()) expect(touchesNode(id, 'ap01'), `${id}는 AP01에 닿는다`).toBe(true)
    expect(shownPaths().some((id) => onEdge(lineEnds(paths[id]).end, nodeBox('laptop02'))), 'AP01 → LAPTOP02').toBe(true)
    expect(shownPaths().some((id) => onEdge(lineEnds(paths[id]).end, nodeBox('wired'))), 'AP01 → 유선 LAN').toBe(true)

    await select('애드혹 모드')
    expect(shownPaths()).toHaveLength(1)
    const [direct] = shownPaths()
    expect(onEdge(lineEnds(paths[direct]).start, nodeBox('laptop01'))).toBe(true)
    expect(onEdge(lineEnds(paths[direct]).end, nodeBox('laptop02'))).toBe(true)
    expect(touchesNode(direct, 'ap01')).toBe(false)
    expect(opacity('ap01')).toBe('0.25')
    expect(opacity('wired')).toBe('0.25')

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const name of ['`LAPTOP01`', '`LAPTOP02`', '`AP01`', '`OfficeNet`', 'SSID', '유선 LAN', '인프라스트럭처 모드', '애드혹 모드', 'AP 없이', '을 거쳐 가고', '직접 프레임을 주고받는다']) {
      expect(body, name).toContain(name)
    }
  })
}

describe('WirelessLanModesDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<WirelessLanModesDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 208')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      await select('인프라스트럭처 모드')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 208')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(screen.getByRole('button', { name: '인프라스트럭처 모드' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><WirelessLanModesDiagram /><WirelessLanModesDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '인프라스트럭처 모드' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<WirelessLanModesDiagram />)
    const text = visualsByTopicId[topicId].diagrams['wlan-modes']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(wirelessLanModesScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toBeUndefined()
    expect(text.notes).toEqual({ ...exampleNoteLabels, ...scenarioNoteLabels })
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
      const scenario = wirelessLanModesScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 무선 LAN 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
