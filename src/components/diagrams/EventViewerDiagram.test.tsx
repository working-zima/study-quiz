import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { EventViewerDiagram, eventViewerScenarios } from './EventViewerDiagram'

const topicId = 'windows-admin-tools'
const anchorConceptId = `${topicId}.event-viewer`
const labels: Record<string, string> = {
  writer: '운영 체제와 프로그램',
  event: '이벤트',
  'app-log': '응용 프로그램',
  'security-log': '보안',
  'system-log': '시스템',
  viewer: '이벤트 뷰어',
  'field-time': '날짜와 시간',
  'field-source': '원본',
  'field-id': '이벤트 ID',
  'field-level': '수준',
}
const groupLabels: Record<string, string> = {
  logs: 'Windows 로그',
  fields: '이벤트 한 건의 칸',
}
const noteLabels: Record<string, string> = {
  'level-note': '수준: 정보·경고·오류·위험',
  'filter-note': '이벤트 ID 1074로 거른다',
}
const noteScenario: Record<string, string> = {
  'level-note': 'fields', 'filter-note': 'shutdown',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const logIds = ['app-log', 'security-log', 'system-log']
const fieldIds = ['field-time', 'field-source', 'field-id', 'field-level']
// 노드마다 들어가는 그룹. 운영 체제와 프로그램·이벤트·이벤트 뷰어는 어느 박스에도 들지 않는다.
const groupOf: Record<string, string | null> = {
  writer: null, event: null, viewer: null,
  'app-log': 'logs', 'security-log': 'logs', 'system-log': 'logs',
  'field-time': 'fields', 'field-source': 'fields', 'field-id': 'fields', 'field-level': 'fields',
}

// 모두 시나리오에서만 보이는 화살표다.
const tallPaths: Record<string, string> = {
  'writer-event': 'M74 40 V64',
  'to-app': 'M140 72 H152 V44 H172',
  'to-security': 'M140 80 H160 V84 H172',
  'to-system': 'M140 88 H152 V124 H172',
  'system-viewer': 'M172 124 H140',
}
const widePaths: Record<string, string> = {
  'writer-event': 'M140 64 H164',
  'to-app': 'M236 56 H244 V44 H264',
  'to-security': 'M236 64 H252 V84 H264',
  'to-system': 'M236 72 H244 V124 H264',
  'system-viewer': 'M264 124 H236',
}
// 선마다 [시작 노드, 끝 노드].
const ends: Record<string, [string, string]> = {
  'writer-event': ['writer', 'event'],
  'to-app': ['event', 'app-log'],
  'to-security': ['event', 'security-log'],
  'to-system': ['event', 'system-log'],
  'system-viewer': ['system-log', 'viewer'],
}

const question = '지난밤 서버가 왜 다시 시작됐는지 어디서 찾을까?'
const figureName = '운영 체제와 프로그램이 남긴 이벤트가 응용 프로그램·보안·시스템 같은 Windows 로그에 쌓이고, 이벤트 한 건에 날짜와 시간·원본·이벤트 ID·수준이 남으며, 종료와 다시 시작의 기록은 시스템 로그에 남아 이벤트 뷰어로 찾는 것을 보이는 도식'
const svgName = '운영 체제와 프로그램, 이벤트, 이벤트 뷰어가 있고, Windows 로그 박스 안에 응용 프로그램·보안·시스템이, 이벤트 한 건의 칸 박스 안에 날짜와 시간·원본·이벤트 ID·수준이 있는 그림'
const idleCaption = '운영 체제와 프로그램이 남긴 이벤트가 쌓이는 Windows 로그와, 이벤트 한 건에 함께 남는 칸, 로그를 보는 이벤트 뷰어를 두었다. 버튼을 고르면 기록이 쌓이는 흐름과 한 건에 남는 칸, 종료 기록을 찾는 곳을 볼 수 있다.'
const legend = '화살표는 이벤트가 로그에 쌓이는 흐름과, 로그에서 기록을 찾는 도구로 가는 방향을 가리킨다. 아래 박스는 이벤트 한 건에 함께 남는 칸이다.'
const expectedScenarios = [
  {
    id: 'record', label: '기록',
    nodes: ['writer', 'event', 'app-log', 'security-log', 'system-log'], paths: ['writer-event', 'to-app', 'to-security', 'to-system'],
    caption: '서비스가 시작되거나 프로그램에 오류가 나는 것처럼 컴퓨터에 일이 일어나면, 운영 체제와 프로그램이 그 일을 이벤트 한 건으로 남긴다. 이벤트는 응용 프로그램·보안·시스템 같은 로그 가운데 정해진 로그에 쌓인다.',
  },
  {
    id: 'fields', label: '이벤트 한 건',
    nodes: ['field-time', 'field-source', 'field-id', 'field-level'], paths: [],
    caption: '이벤트마다 기록된 날짜와 시간, 그 이벤트를 남긴 소프트웨어인 원본, 일의 종류를 가리키는 번호인 이벤트 ID, 얼마나 심각한지를 나타내는 수준이 함께 남는다. 이벤트 ID는 원본과 함께 본다.',
  },
  {
    id: 'shutdown', label: '종료 기록',
    nodes: ['system-log', 'viewer'], paths: ['system-viewer'],
    caption: '컴퓨터를 끄거나 다시 시작한 기록은 시스템 로그에 남는다. 이벤트 뷰어로 시스템 로그를 이벤트 ID 1074로 거르면 어느 프로그램이 어느 사용자를 대신해 언제 왜 다시 시작했는지 나온다. 41이나 6008은 제대로 꺼지지 못한 채 다시 시작된 기록이다.',
  },
]

const svg = () => screen.getByRole('img', { name: svgName })
const select = async (name: string) => { await act(async () => { await userEvent.click(screen.getByRole('button', { name })) }) }

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
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (item) => item.getAttribute('data-note')!)
const opacityOf = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')

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

const endsAt = (point: { x: number, y: number }) => nodeIds.filter((id) => onEdge(point.x, point.y, nodeBox(id)))
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

const anchorConcept = () => topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!

function layoutTests(wide: boolean) {
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 240] : [0, 0, 280, 280]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<EventViewerDiagram />)
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
    const { container } = render(<EventViewerDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(svg().querySelectorAll('[data-link]')).toHaveLength(0)
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<EventViewerDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownNotes()).toEqual(Object.keys(noteScenario).filter((id) => noteScenario[id] === scenario.id))
    for (const id of shownNotes()) expect(note(id)!.textContent).toBe(noteLabels[id])
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

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말·그룹 라벨이 자리에 들어간다`, async () => {
    render(<EventViewerDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
      for (const group of groupIds) {
        if (groupOf[id] === group) expect(contains(groupBox(group), nodeBox(id)), `${id} ⊂ ${group}`).toBe(true)
        else expect(overlaps(groupBox(group), nodeBox(id)), `${id} ↔ ${group}`).toBe(false)
      }
    }
    expect(overlaps(groupBox('logs'), groupBox('fields'))).toBe(false)
    const groupTexts = groupIds.map((id) => {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
      return box
    })
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const noteTexts = shownNotes().map((id) => {
        const element = note(id)!
        expect(element).toHaveAttribute('font-size', '9')
        expect(element).toHaveClass('fill-muted')
        const box = textBox(element, id)
        for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(overlaps(box, groupBox(group)), `${id} ↔ ${group}`).toBe(false)
        return box
      })
      for (const box of [...noteTexts, ...groupTexts]) {
        expect(box.x, box.id).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width, box.id).toBeLessThanOrEqual(viewBox[2])
        expect(box.y, box.id).toBeGreaterThanOrEqual(0)
        expect(box.y + box.height, box.id).toBeLessThanOrEqual(viewBox[3])
        for (const d of Object.values(paths)) {
          for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
        }
      }
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('선의 양 끝은 노드의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나거나 같은 시나리오에 보이는 다른 선과 만나지 않는다', async () => {
    render(<EventViewerDiagram />)
    for (const [id, d] of Object.entries(paths)) {
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
      const { start, end } = lineEnds(d)
      expect(endsAt(start), `${id} 시작`).toEqual([ends[id][0]])
      expect(endsAt(end), `${id} 끝`).toEqual([ends[id][1]])
    }
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const lines = shownPaths()
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

  // 요점: 종료 기록에서 보이는 화살표는 시스템 로그에서 나와 이벤트 뷰어에서 끝나고, 응용 프로그램·보안 로그에는 어떤 선도 닿지 않는다.
  // 기록에서는 이벤트에서 나간 화살표가 저마다 Windows 로그 박스 안의 로그에서 끝난다. 이벤트 한 건에서 선명한 칸의 라벨은 본문이 든 칸 이름과 같다.
  it('종료 기록은 시스템 로그에서 이벤트 뷰어로 찾고, 이벤트 한 건에는 본문이 든 칸이 남는다', async () => {
    render(<EventViewerDiagram />)
    const body = anchorConcept().paragraphs.join('\n')

    await select('종료 기록')
    expect(shownPaths()).toHaveLength(1)
    const shutdown = lineEnds(paths[shownPaths()[0]])
    expect(endsAt(shutdown.start)).toEqual(['system-log'])
    expect(endsAt(shutdown.end)).toEqual(['viewer'])
    for (const id of ['app-log', 'security-log']) {
      expect(opacityOf(id), id).toBe('0.25')
      for (const segment of segments(paths[shownPaths()[0]])) expect(touches(segment, nodeBox(id)), id).toBe(false)
    }
    expect(note('filter-note')!.textContent).toContain('1074')
    expect(body).toContain('컴퓨터를 끄거나 다시 시작한 기록은 시스템 로그에 남는다')
    expect(body).toContain('그 로그를 이벤트 ID 1074로 거르')

    await select('기록')
    for (const id of shownPaths().filter((path) => path !== 'writer-event')) {
      const { start, end } = lineEnds(paths[id])
      expect(endsAt(start), id).toEqual(['event'])
      const [log] = endsAt(end)
      expect(logIds, id).toContain(log)
      expect(contains(groupBox('logs'), nodeBox(log)), id).toBe(true)
    }
    expect(new Set(shownPaths().map((id) => endsAt(lineEnds(paths[id]).end)[0]))).toEqual(new Set(['event', ...logIds]))
    expect(body).toContain('응용 프로그램·보안·시스템 같은 로그')
    expect(body).toContain('운영 체제와 프로그램이 그 일을 기록 한 건으로 남긴다')

    await select('이벤트 한 건')
    const sharp = nodeIds.filter((id) => opacityOf(id) === '1')
    expect(sharp).toEqual(fieldIds)
    for (const id of sharp) {
      expect(contains(groupBox('fields'), nodeBox(id)), id).toBe(true)
      expect(body, id).toContain(`${label(id)}(`)
    }
    expect(new Set(sharp.map(label))).toEqual(new Set(['날짜와 시간', '원본', '이벤트 ID', '수준']))
    expect(body).toContain('수준은 정보·경고·오류·위험 넷이다')
  })
}

describe('EventViewerDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<EventViewerDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 280')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('종료 기록')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 240')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '종료 기록' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><EventViewerDiagram /><EventViewerDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '기록' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<EventViewerDiagram />)
    const text = visualsByTopicId[topicId].diagrams['event-viewer']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(eventViewerScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = eventViewerScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 이벤트 뷰어 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = anchorConcept()
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(within(figure).queryByRole('heading')).toBeNull()
  })
})
