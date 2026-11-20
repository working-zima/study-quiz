import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { NacAdmissionDiagram, nacAdmissionScenarios } from './NacAdmissionDiagram'

const topicId = 'network-security'
const anchorConceptId = `${topicId}.nac`
const labels: Record<string, string> = {
  'laptop03': 'LAPTOP03',
  'sw01': 'SW01',
  'auth01': 'AUTH01',
  'internal': '사내 네트워크',
}
// 늘 보이는 역할 곁말과, 시나리오를 골랐을 때만 보이는 곁말.
const fixedNoteLabels: Record<string, string> = {
  'supplicant': '신청자',
  'authenticator': '인증자',
  'auth-server': '인증 서버',
}
const fixedNoteOwner: Record<string, string> = { 'supplicant': 'laptop03', 'authenticator': 'sw01', 'auth-server': 'auth01' }
const noteLabels: Record<string, string> = {
  'before-note': '인증 메시지만 통과시킨다',
  'after-note': '사내 네트워크와 통신한다',
}
const nodeIds = Object.keys(labels)
const noteIds = Object.keys(noteLabels)
// 화살표는 LAPTOP03이 보낸 것이 가는 쪽이다. 보낸 쪽의 변에서 나가 받는 쪽의 변에서 끝난다.
const pathEnds: Record<string, [string, string]> = {
  'auth-laptop': ['laptop03', 'sw01'],
  'data-laptop': ['laptop03', 'sw01'],
  'auth-sw01': ['sw01', 'auth01'],
  'data-sw01': ['sw01', 'internal'],
}
const tallPaths: Record<string, string> = {
  'auth-laptop': 'M124 48 V96',
  'data-laptop': 'M156 48 V96',
  'auth-sw01': 'M112 128 V152 H60 V176',
  'data-sw01': 'M168 128 V152 H208 V176',
}
const widePaths: Record<string, string> = {
  'auth-laptop': 'M104 66 H176',
  'data-laptop': 'M104 78 H176',
  'auth-sw01': 'M256 64 H288 V32 H320',
  'data-sw01': 'M256 80 H288 V112 H312',
}

const question = 'NAC는 장치를 언제 네트워크에 들여보낼까?'
const figureName = '노트북 LAPTOP03이 스위치 SW01의 포트에 꽂힌 뒤, 인증 전에는 인증 메시지만 SW01을 거쳐 인증 서버 AUTH01로 가고, 인증 뒤에야 사내 네트워크와 통신하는 모습을 보이는 도식'
const svgName = 'LAPTOP03(신청자), SW01(인증자), AUTH01(인증 서버), 사내 네트워크를 둔 그림'
const idleCaption = '노트북 LAPTOP03을 802.1X가 켜진 스위치 SW01의 포트에 꽂았다. LAPTOP03은 신청자, SW01은 인증자, AUTH01은 인증 서버다. 버튼을 고르면 인증 전과 뒤에 무엇이 오가는지 볼 수 있다.'
const legend = '화살표는 LAPTOP03이 보낸 것이 가는 쪽이고, 답은 같은 길을 거꾸로 온다. LAPTOP03과 SW01 사이의 두 선은 같은 포트로 오가는 인증 메시지와 데이터를 따로 그린 것이다. LAPTOP03·SW01·AUTH01은 예로 붙인 이름표다.'
const expectedScenarios = [
  {
    id: 'before', label: '인증 전',
    nodes: ['laptop03', 'sw01', 'auth01'],
    paths: ['auth-laptop', 'auth-sw01'],
    notes: ['before-note'],
    caption: '포트에 꽂힌 LAPTOP03은 아직 인증 전이라 이 포트로는 인증 메시지만 오간다. SW01이 인증을 요구하면 LAPTOP03이 자격 증명을 보내고, SW01은 그것을 AUTH01에 넘겨 신원이 맞는지 확인받는다.',
  },
  {
    id: 'after', label: '인증 뒤',
    nodes: ['laptop03', 'sw01', 'internal'],
    paths: ['data-laptop', 'data-sw01'],
    notes: ['after-note'],
    caption: 'AUTH01이 신원을 확인해 결과를 돌려주면, SW01은 그 포트로 LAPTOP03이 사내 네트워크와 통신하게 한다. 확인에 실패했다면 포트는 계속 인증 메시지만 통과시킨다.',
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
const fixedNote = (id: string) => svg().querySelector(`[data-fixed-note="${id}"]`)!
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 152] : [0, 0, 280, 256]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<NacAdmissionDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표 없이 역할 곁말만 보이며 선택 안내가 나온다', () => {
    const { container } = render(<NacAdmissionDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(svg().querySelectorAll('[data-group]')).toHaveLength(0)
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    for (const [id, text] of Object.entries(fixedNoteLabels)) {
      expect(fixedNote(id).textContent).toBe(text)
      expect(fixedNote(id)).toHaveAttribute('font-size', '9')
      expect(fixedNote(id)).toHaveAttribute('opacity', '1')
    }
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보이고 역할 곁말은 자기 노드를 따라 흐려진다', async (scenario) => {
    const { container } = render(<NacAdmissionDiagram />)
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
    for (const [id, owner] of Object.entries(fixedNoteOwner)) expect(fixedNote(id)).toHaveAttribute('opacity', opacity(owner))
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말이 자리에 들어간다`, async () => {
    render(<NacAdmissionDiagram />)
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
    // 역할 곁말은 늘 보이고, 시나리오 곁말은 자기 시나리오에서만 보인다. 모두 viewBox 안이고 노드·선·다른 곁말과 겹치지 않는다.
    const fixed = Object.keys(fixedNoteLabels).map((id) => textBox(fixedNote(id), id))
    const seen: string[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const visible = [...fixed, ...scenario.notes.map((id) => textBox(note(id), id))]
      seen.push(...scenario.notes)
      expect(boxesOutsideViewBox(visible, viewBox)).toEqual([])
      for (const box of visible) {
        for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
        for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
        for (const other of visible.filter((otherBox) => otherBox.id !== box.id)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
      }
    }
    expect([...seen].sort()).toEqual([...noteIds].sort())
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 보낸 쪽의 변에서 시작해 받는 쪽의 변에서 끝나고, 노드 안을 지나지 않으며 서로 겹치지 않는다', () => {
    render(<NacAdmissionDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(pathEnds)))
    for (const [id, d] of Object.entries(paths)) {
      const { start, end } = lineEnds(d)
      expect(onEdge(start, nodeBox(pathEnds[id][0])), `${id} 시작`).toBe(true)
      expect(onEdge(end, nodeBox(pathEnds[id][1])), `${id} 끝`).toBe(true)
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
      }
    }
    // 인증 메시지의 선과 데이터의 선은 같은 포트로 오가지만 따로 그려, 어느 두 선도 같은 구간을 함께 쓰지 않는다.
    const ids = Object.keys(paths)
    for (const a of ids) for (const b of ids.filter((other) => other !== a)) {
      for (const sa of segments(paths[a])) for (const sb of segments(paths[b])) expect(collinearOverlap(sa, sb), `${a} ↔ ${b}`).toBe(false)
    }
  })

  // 요점: 인증 전에는 화살표가 LAPTOP03 → SW01 → AUTH01로 이어지고, 어떤 화살표도 사내 네트워크에 닿지 않으며 사내 네트워크는 흐리다.
  // 인증 뒤에는 화살표가 LAPTOP03 → SW01 → 사내 네트워크로 이어지고, AUTH01은 흐리며 어떤 화살표도 AUTH01에 닿지 않는다.
  it('인증 전에는 사내 네트워크로 가는 길이 없고, 인증 뒤에야 사내 네트워크와 통신한다', async () => {
    render(<NacAdmissionDiagram />)
    const startNode = (pathId: string) => nodeIds.find((id) => onEdge(lineEnds(paths[pathId]).start, nodeBox(id)))
    const endNode = (pathId: string) => nodeIds.find((id) => onEdge(lineEnds(paths[pathId]).end, nodeBox(id)))

    await select('인증 전')
    expect(shownPaths().map((id) => [startNode(id), endNode(id)])).toEqual([['laptop03', 'sw01'], ['sw01', 'auth01']])
    for (const id of shownPaths()) for (const segment of segments(paths[id])) expect(touches(segment, nodeBox('internal')), id).toBe(false)
    expect(opacity('internal')).toBe('0.25')
    expect(opacity('auth01')).toBe('1')

    await select('인증 뒤')
    expect(shownPaths().map((id) => [startNode(id), endNode(id)])).toEqual([['laptop03', 'sw01'], ['sw01', 'internal']])
    for (const id of shownPaths()) for (const segment of segments(paths[id])) expect(touches(segment, nodeBox('auth01')), id).toBe(false)
    expect(opacity('auth01')).toBe('0.25')
    expect(opacity('internal')).toBe('1')

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const phrase of ['노트북 `LAPTOP03`', '스위치 `SW01`', '인증 서버 `AUTH01`', '`LAPTOP03`이 신청자, `SW01`이 인증자, `AUTH01`이 인증 서버다', '인증 메시지만 오간다', '사내 네트워크와 통신하게 한다']) {
      expect(body, phrase).toContain(phrase)
    }
  })
}

describe('NacAdmissionDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<NacAdmissionDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 256')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      await select('인증 뒤')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 152')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(screen.getByRole('button', { name: '인증 뒤' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><NacAdmissionDiagram /><NacAdmissionDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '인증 전' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<NacAdmissionDiagram />)
    const text = visualsByTopicId[topicId].diagrams['nac-admission']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(nacAdmissionScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toBeUndefined()
    expect(text.notes).toEqual({ ...fixedNoteLabels, ...noteLabels })
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
      const scenario = nacAdmissionScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 NAC 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
