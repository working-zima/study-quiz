import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { NetstatRowsDiagram, netstatRowsScenarios } from './NetstatRowsDiagram'

const topicId = 'diagnostic-commands'
const anchorConceptId = `${topicId}.netstat`
const labels: Record<string, string> = {
  'l-proto': '프로토콜: TCP',
  'l-local': '로컬 주소: 198.51.100.10:22',
  'l-foreign': '외부 주소: 정해진 상대 없음',
  'l-state': '상태: LISTEN',
  'e-proto': '프로토콜: TCP',
  'e-local': '로컬 주소: 198.51.100.10:22',
  'e-foreign': '외부 주소: 192.0.2.10:50001',
  'e-state': '상태: ESTABLISHED',
  'client': '클라이언트 · 192.0.2.10',
}
const groupLabels: Record<string, string> = {
  'listen': '기다리는 줄',
  'established': '맺은 연결의 줄',
}
const noteLabels: Record<string, string> = {
  'listen-note': '연결을 기다리는 열린 포트',
  'est-note': '외부 주소의 컴퓨터와 맺은 연결',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
const listenIds = ['l-proto', 'l-local', 'l-foreign', 'l-state']
const establishedIds = ['e-proto', 'e-local', 'e-foreign', 'e-state']
// 클라이언트 칸만 두 줄의 박스 밖에 있다.
const groupOf = (id: string) => (id.startsWith('l-') ? 'listen' : id.startsWith('e-') ? 'established' : null)
const noteGroup: Record<string, string> = {
  'listen-note': 'listen',
  'est-note': 'established',
}
// 화살표는 맺은 연결의 외부 주소 칸에서 그 주소의 컴퓨터로 간다.
const pathEnds: Record<string, [string, string]> = {
  'to-client': ['e-foreign', 'client'],
}
const tallPaths: Record<string, string> = {
  'to-client': 'M216 332 H244 V432',
}
const widePaths: Record<string, string> = {
  'to-client': 'M236 124 H220 V232',
}

const question = 'netstat의 한 줄은 무엇을 말할까?'
const figureName = 'Linux 서버 198.51.100.10에서 netstat -an을 입력했을 때 나오는 두 줄, 곧 22번 포트로 연결을 기다리는 LISTEN 줄과 클라이언트 192.0.2.10:50001과 맺은 ESTABLISHED 줄을 칸마다 나눠 읽는 도식'
const svgName = '기다리는 줄과 맺은 연결의 줄을 각각 프로토콜·로컬 주소·외부 주소·상태 칸으로 나눠 놓고, 맺은 연결의 외부 주소에서 클라이언트로 화살표를 그은 그림'
const idleCaption = 'Linux 서버 198.51.100.10에서 netstat -an을 입력했을 때 나오는 TCP 줄 둘을 칸마다 나눠 놓았다. 버튼을 고르면 각 줄이 무엇을 말하는지 볼 수 있다.'
const legend = '박스 하나가 결과의 한 줄이고, 박스 안의 칸은 위에서부터 프로토콜·로컬 주소·외부 주소·상태 차례다. 화살표는 외부 주소가 가리키는 컴퓨터로 간다.'
const expectedScenarios = [
  {
    id: 'listening', label: '열린 포트',
    nodes: ['l-proto', 'l-local', 'l-foreign', 'l-state'], paths: [] as string[], notes: ['listen-note'],
    caption: '기다리는 줄은 상태가 LISTEN이고 로컬 주소가 198.51.100.10:22다. 이 서버가 22번 포트를 열어 두고 어느 클라이언트에게서든 연결 요청이 오기를 기다린다는 뜻이다. 아직 이어진 상대가 없어 외부 주소 칸에는 정해진 상대가 없다.',
  },
  {
    id: 'established', label: '맺은 연결',
    nodes: ['e-proto', 'e-local', 'e-foreign', 'e-state', 'client'], paths: ['to-client'], notes: ['est-note'],
    caption: '맺은 연결의 줄은 상태가 ESTABLISHED이고 외부 주소가 192.0.2.10:50001이다. 클라이언트 192.0.2.10의 50001번 포트와 이 서버의 22번 포트 사이에 연결이 맺어져 있다는 뜻으로, 외부 주소 칸이 접속해 있는 상대 컴퓨터를 가리킨다.',
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
// 「칸 이름: 값」 라벨의 값 부분.
const value = (id: string) => label(id).split(': ')[1]
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

const body = () => topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')

function layoutTests(wide: boolean) {
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 272] : [0, 0, 280, 472]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<NetstatRowsDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 칸이 모두 선명하고 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<NetstatRowsDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 칸·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<NetstatRowsDiagram />)
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
    render(<NetstatRowsDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    expect(overlaps(groupBox('listen'), groupBox('established'))).toBe(false)
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      const group = groupOf(id)
      if (group) expect(contains(groupBox(group), nodeBox(id)), `${id} ⊂ ${group}`).toBe(true)
      else for (const other of groupIds) expect(overlaps(groupBox(other), nodeBox(id)), `${id} ↔ ${other}`).toBe(false)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    for (const id of groupIds) {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
    }
    // 곁말은 자기 줄의 박스 안에 들어가고, 칸이나 그룹 라벨, 선과 겹치지 않는다.
    const noteBoxes: SvgBox[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of scenario.notes) noteBoxes.push(textBox(note(id), id))
    }
    expect(noteBoxes.map(({ id }) => id)).toEqual(noteIds)
    for (const box of noteBoxes) {
      expect(contains(groupBox(noteGroup[box.id]), box), box.id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
      for (const group of groupIds) expect(overlaps(box, groupLabelBox(group)), `${box.id} ↔ ${group} 라벨`).toBe(false)
      for (const [pathId, d] of Object.entries(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ ${pathId}`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 외부 주소 칸의 변에서 시작해 클라이언트 칸의 변에서 끝나고, 칸 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<NetstatRowsDiagram />)
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

  // 요점: 「열린 포트」에서 선명한 상태 칸이 LISTEN이고 「맺은 연결」에서는 ESTABLISHED다.
  // 「맺은 연결」의 외부 주소 칸이 192.0.2.10:50001이고, 두 줄의 로컬 주소 칸에 22가 있다.
  it('두 줄의 칸 차례가 같고, 기다리는 줄은 LISTEN, 맺은 연결의 줄은 ESTABLISHED와 외부 주소 192.0.2.10:50001이다', async () => {
    render(<NetstatRowsDiagram />)
    // 박스 안의 칸은 위에서부터 프로토콜·로컬 주소·외부 주소·상태 차례다.
    const order = (ids: string[]) => [...ids].sort((a, b) => nodeBox(a).y - nodeBox(b).y).map((id) => label(id).split(': ')[0])
    expect(order(listenIds)).toEqual(['프로토콜', '로컬 주소', '외부 주소', '상태'])
    expect(order(establishedIds)).toEqual(['프로토콜', '로컬 주소', '외부 주소', '상태'])
    for (const id of ['l-local', 'e-local']) expect(value(id), id).toMatch(/:22$/u)

    await select('열린 포트')
    const listenStates = ['l-state', 'e-state'].filter((id) => opacity(id) === '1')
    expect(listenStates.map(value)).toEqual(['LISTEN'])
    expect(opacity('client')).toBe('0.25')

    await select('맺은 연결')
    expect(['l-state', 'e-state'].filter((id) => opacity(id) === '1').map(value)).toEqual(['ESTABLISHED'])
    expect(value('e-foreign')).toBe('192.0.2.10:50001')
    // 외부 주소 칸에서 나가는 화살표가 끝나는 칸은 그 주소의 컴퓨터다.
    const target = nodeIds.find((id) => id !== 'e-foreign' && onEdge(lineEnds(paths['to-client']).end, nodeBox(id)))!
    expect(label(target)).toContain(value('e-foreign').split(':')[0])

    // 본문이 같은 두 줄을 칸마다 읽는다.
    const text = body()
    for (const phrase of ['`netstat -an`', '`198.51.100.10:22`', '`192.0.2.10:50001`', '`LISTEN`', '`ESTABLISHED`', '외부 주소 칸에는 정해진 상대가 없다']) expect(text, phrase).toContain(phrase)
    expect(text.indexOf('`LISTEN`')).toBeLessThan(text.indexOf('`ESTABLISHED`'))
  })
}

describe('NetstatRowsDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('칸·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<NetstatRowsDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 472')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('맺은 연결')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 272')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '맺은 연결' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><NetstatRowsDiagram /><NetstatRowsDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '맺은 연결' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<NetstatRowsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['netstat-rows']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(netstatRowsScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = netstatRowsScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 netstat 명령 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
