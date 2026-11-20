import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { PoePowerDiagram, poePowerScenarios } from './PoePowerDiagram'

const topicId = 'network-devices'
const anchorConceptId = `${topicId}.poe`
const labels: Record<string, string> = {
  'sw01': 'PoE 스위치 SW01',
  'ap01': '무선 AP AP01',
  'cam01': 'IP 카메라 CAM01',
  'pc01': '컴퓨터 PC01',
}
// 늘 보이는 역할 곁말과, 시나리오를 골랐을 때만 보이는 곁말.
const fixedNoteLabels: Record<string, string> = {
  'pse': 'PSE',
  'pd-ap01': 'PD',
  'pd-cam01': 'PD',
}
const fixedNoteOwner: Record<string, string> = { 'pse': 'sw01', 'pd-ap01': 'ap01', 'pd-cam01': 'cam01' }
const noteLabels: Record<string, string> = {
  'data-note': '랜선 하나로 프레임을 주고받는다',
  'power-note': 'PD인 AP01·CAM01에만 전원을 보낸다',
}
const nodeIds = Object.keys(labels)
const noteIds = Object.keys(noteLabels)
const linkIds = ['link-ap01', 'link-cam01', 'link-pc01']
// 랜선 셋은 늘 보이고, 데이터와 전원의 선은 그 랜선 위에 겹쳐 그린다. 선은 모두 SW01에서 장치 쪽으로 적는다.
const pathEnds: Record<string, [string, string]> = {
  'link-ap01': ['sw01', 'ap01'],
  'link-cam01': ['sw01', 'cam01'],
  'link-pc01': ['sw01', 'pc01'],
  'data-ap01': ['sw01', 'ap01'],
  'data-cam01': ['sw01', 'cam01'],
  'data-pc01': ['sw01', 'pc01'],
  'power-ap01': ['sw01', 'ap01'],
  'power-cam01': ['sw01', 'cam01'],
}
const tallPaths: Record<string, string> = {
  'link-ap01': 'M104 40 V64 H52 V96',
  'link-cam01': 'M176 40 V64 H220 V96',
  'link-pc01': 'M140 40 V168',
  'data-ap01': 'M104 40 V64 H52 V96',
  'data-cam01': 'M176 40 V64 H220 V96',
  'data-pc01': 'M140 40 V168',
  'power-ap01': 'M104 40 V64 H52 V96',
  'power-cam01': 'M176 40 V64 H220 V96',
}
const widePaths: Record<string, string> = {
  'link-ap01': 'M196 48 V72 H76 V104',
  'link-cam01': 'M244 48 V72 H372 V104',
  'link-pc01': 'M220 48 V104',
  'data-ap01': 'M196 48 V72 H76 V104',
  'data-cam01': 'M244 48 V72 H372 V104',
  'data-pc01': 'M220 48 V104',
  'power-ap01': 'M196 48 V72 H76 V104',
  'power-cam01': 'M244 48 V72 H372 V104',
}

const question = 'PoE 스위치는 랜선 하나로 무엇을 함께 보낼까?'
const figureName = 'PoE 스위치 SW01이 무선 AP AP01·IP 카메라 CAM01·컴퓨터 PC01과 랜선 하나씩으로 프레임을 주고받고, 그 가운데 PD인 AP01과 CAM01에만 같은 랜선으로 전원도 보내는 모습을 보이는 도식'
const svgName = 'PoE 스위치 SW01 아래에 무선 AP AP01, IP 카메라 CAM01, 컴퓨터 PC01을 두고 랜선으로 이은 그림'
const idleCaption = 'PoE 스위치 SW01의 포트에 무선 AP AP01, IP 카메라 CAM01, 컴퓨터 PC01이 랜선 하나씩으로 이어져 있다. 버튼을 고르면 그 랜선으로 무엇이 오가는지 볼 수 있다.'
const legend = '가는 선은 랜선이다. 데이터를 고르면 굵은 선이 프레임이 두 방향으로 오가는 랜선을 가리키고, 전원을 고르면 화살표가 전원이 가는 쪽을 가리킨다. PSE는 전원을 주는 장치, PD는 전원을 받는 장치다. SW01·AP01·CAM01·PC01은 예로 붙인 이름표다.'
const expectedScenarios = [
  {
    id: 'data', label: '데이터',
    nodes: ['sw01', 'ap01', 'cam01', 'pc01'],
    paths: ['data-ap01', 'data-cam01', 'data-pc01'],
    notes: ['data-note'],
    caption: 'SW01은 여느 스위치처럼 이어진 장치들과 랜선으로 프레임을 주고받는다. PoE로 전원을 받지 않는 컴퓨터 PC01과도 프레임은 그대로 주고받는다.',
  },
  {
    id: 'power', label: '전원',
    nodes: ['sw01', 'ap01', 'cam01'],
    paths: ['power-ap01', 'power-cam01'],
    notes: ['power-note'],
    caption: 'SW01은 검출로 AP01과 CAM01이 PD인지 먼저 가린 뒤, 프레임이 오가는 그 랜선으로 두 장치에 전원도 보낸다. PD가 아닌 PC01이 이어진 포트로는 전원을 보내지 않는다.',
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 176] : [0, 0, 280, 232]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<PoePowerDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 랜선 셋과 역할 곁말만 보이며 선택 안내가 나온다', () => {
    const { container } = render(<PoePowerDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(svg().querySelectorAll('[data-group]')).toHaveLength(0)
    expect(Array.from(svg().querySelectorAll('[data-link]'), (link) => link.getAttribute('data-link'))).toEqual(linkIds)
    for (const link of svg().querySelectorAll('[data-link]')) {
      expect(link).toHaveAttribute('d', paths[link.getAttribute('data-link')!])
      expect(link).toHaveClass('stroke-muted')
      expect(link).not.toHaveAttribute('marker-end')
    }
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

  it.each(expectedScenarios)('$label: 고른 노드·선·곁말만 보인다', async (scenario) => {
    const { container } = render(<PoePowerDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownPaths()).toEqual(scenario.paths)
    for (const path of svg().querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('d', paths[path.getAttribute('data-path')!])
      expect(path).toHaveAttribute('stroke-width', '2')
      expect(path).toHaveClass('stroke-title')
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
    render(<PoePowerDiagram />)
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
    // 역할 곁말은 늘 보이고, 시나리오 곁말은 자기 시나리오에서만 보인다. 모두 viewBox 안이고 노드·선과 겹치지 않는다.
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

  it('선은 SW01의 변에서 시작해 장치의 변에서 끝나고, 노드 안을 지나지 않으며 같은 시나리오 안에서 겹치지 않는다', () => {
    render(<PoePowerDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(pathEnds)))
    for (const [id, d] of Object.entries(paths)) {
      const { start, end } = lineEnds(d)
      expect(onEdge(start, nodeBox(pathEnds[id][0])), `${id} 시작`).toBe(true)
      expect(onEdge(end, nodeBox(pathEnds[id][1])), `${id} 끝`).toBe(true)
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
      }
    }
    // 랜선은 서로 겹치지 않고, 같은 시나리오 안의 선끼리도 겹치지 않는다.
    for (const group of [linkIds, ...expectedScenarios.map(({ paths: scenarioPaths }) => scenarioPaths)]) {
      for (const a of group) for (const b of group.filter((other) => other !== a)) {
        for (const sa of segments(paths[a])) for (const sb of segments(paths[b])) expect(collinearOverlap(sa, sb), `${a} ↔ ${b}`).toBe(false)
      }
    }
    // 데이터와 전원의 선은 늘 보이는 랜선 바로 위에 겹쳐 그린다 — 전원도 프레임과 같은 랜선으로 간다.
    for (const id of [...expectedScenarios[0].paths, ...expectedScenarios[1].paths]) {
      const device = pathEnds[id][1]
      expect(paths[id], id).toBe(paths[`link-${device}`])
    }
  })

  // 요점: 전원의 선은 모두 SW01(PSE)에서 시작해 PD인 AP01·CAM01에서 끝나고 화살표가 있다. PC01로 가는 전원의 선은 없고 PC01은 흐려진다.
  // 데이터의 선은 화살표 없이 세 장치에 하나씩 닿아, PC01과도 프레임을 주고받는다. 두 시나리오의 선 id는 겹치지 않는다.
  it('SW01은 프레임을 세 장치와 주고받지만 전원은 PD인 AP01과 CAM01에만 보낸다', async () => {
    render(<PoePowerDiagram />)
    const startNode = (pathId: string) => nodeIds.find((id) => onEdge(lineEnds(paths[pathId]).start, nodeBox(id)))
    const endNode = (pathId: string) => nodeIds.find((id) => onEdge(lineEnds(paths[pathId]).end, nodeBox(id)))
    const shown: Record<string, string[]> = {}

    await select('전원')
    shown.power = shownPaths()
    expect(shown.power.length).toBeGreaterThan(0)
    for (const id of shown.power) {
      expect(startNode(id), id).toBe('sw01')
      expect(svg().querySelector(`[data-path="${id}"]`)).toHaveAttribute('marker-end', `url(#${svg().querySelector('marker')!.id})`)
    }
    expect(shown.power.map(endNode).sort()).toEqual(['ap01', 'cam01'])
    expect(opacity('pc01')).toBe('0.25')

    await select('데이터')
    shown.data = shownPaths()
    for (const id of shown.data) expect(svg().querySelector(`[data-path="${id}"]`)).not.toHaveAttribute('marker-end')
    expect(shown.data.map(endNode).sort()).toEqual(['ap01', 'cam01', 'pc01'])
    expect(opacity('pc01')).toBe('1')

    expect(shown.power.filter((id) => shown.data.includes(id))).toEqual([])

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const name of ['PoE 스위치 `SW01`', '무선 AP `AP01`', 'IP 카메라 `CAM01`', '랜선 하나씩으로', '컴퓨터 `PC01`', '`PC01`이 PD가 아님을 가려 그 포트로는 전원을 보내지 않고', 'PSE(Power Sourcing Equipment, 전원을 주는 장치)', 'PD(Powered Device, 전원을 받는 장치)', '검출(detection)']) {
      expect(body, name).toContain(name)
    }
  })
}

describe('PoePowerDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<PoePowerDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 232')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      await select('전원')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 176')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(screen.getByRole('button', { name: '전원' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><PoePowerDiagram /><PoePowerDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '전원' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<PoePowerDiagram />)
    const text = visualsByTopicId[topicId].diagrams['poe-power']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(poePowerScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = poePowerScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 PoE 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
