import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ZoneTransferDiagram, zoneTransferScenarios } from './ZoneTransferDiagram'

const topicId = 'dns'
const anchorConceptId = `${topicId}.dns-zone`
const labels: Record<string, string> = {
  secondary: 'ns2.example.com',
  primary: 'ns1.example.com',
  ask: '일련번호 묻기',
  'serial-same': '일련번호 100',
  'serial-changed': '일련번호 101',
  transfer: '영역 전송 (AXFR)',
}
const groupLabels: Record<string, string> = {
  'secondary-side': '보조 서버',
  'primary-side': '주 서버',
}
const noteLabels: Record<string, string> = {
  'same-note': '사본도 100이라 그대로 둔다',
  'changed-note': '사본의 100보다 크다',
  'transfer-note': 'TCP로 받아 온다',
}
const noteScenarios: Record<string, string> = {
  'same-note': 'same',
  'changed-note': 'changed',
  'transfer-note': 'changed',
}
// 곁말은 자기 메시지 노드 바로 아래에 놓인다.
const noteNode: Record<string, string> = { 'same-note': 'serial-same', 'changed-note': 'serial-changed', 'transfer-note': 'transfer' }
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const messageIds = ['ask', 'serial-same', 'serial-changed', 'transfer']

const tallPaths: Record<string, string> = {
  'ask-out': 'M60 80 H72',
  'ask-in': 'M208 80 H220',
  'same-out': 'M220 128 H208',
  'same-in': 'M72 128 H60',
  'changed-out': 'M220 192 H208',
  'changed-in': 'M72 192 H60',
  'transfer-out': 'M220 256 H208',
  'transfer-in': 'M72 256 H60',
}
const widePaths: Record<string, string> = {
  'ask-out': 'M96 80 H140',
  'ask-in': 'M300 80 H344',
  'same-out': 'M344 128 H300',
  'same-in': 'M140 128 H96',
  'changed-out': 'M344 192 H300',
  'changed-in': 'M140 192 H96',
  'transfer-out': 'M344 256 H300',
  'transfer-in': 'M140 256 H96',
}
// 화살표마다 시작과 끝이 닿는 상자. 기둥(그룹 박스)이나 메시지 노드다.
const ends: Record<string, [string, string]> = {
  'ask-out': ['secondary-side', 'ask'],
  'ask-in': ['ask', 'primary-side'],
  'same-out': ['primary-side', 'serial-same'],
  'same-in': ['serial-same', 'secondary-side'],
  'changed-out': ['primary-side', 'serial-changed'],
  'changed-in': ['serial-changed', 'secondary-side'],
  'transfer-out': ['primary-side', 'transfer'],
  'transfer-in': ['transfer', 'secondary-side'],
}

const question = '보조 서버는 언제 주 서버의 영역을 받아 올까?'
const figureName = '보조 서버가 주 서버에 영역의 일련번호를 묻고, 받은 번호가 자기 사본과 같을 때와 커졌을 때 영역 데이터를 받아 오는지가 어떻게 달라지는지 보이는 도식'
const svgName = '왼쪽 보조 서버 ns2.example.com과 오른쪽 주 서버 ns1.example.com 두 기둥 사이에 일련번호 묻기, 일련번호 100, 일련번호 101, 영역 전송 (AXFR)을 위에서 아래로 놓은 그림'
const idleCaption = 'example.com 영역을 함께 맡은 보조 서버 ns2.example.com과 주 서버 ns1.example.com 사이에 오가는 메시지를 차례대로 위에서 아래로 놓았다. 보조 서버가 가진 사본의 일련번호는 100이고, 서버 이름과 일련번호는 예로 붙인 값이다. 버튼을 고르면 주 서버의 일련번호가 그대로일 때와 커졌을 때를 볼 수 있다.'
const legend = '위의 두 노드는 두 서버의 이름이고, 그 아래 왼쪽 박스가 보조 서버, 오른쪽 박스가 주 서버다. 가운데 노드 하나가 메시지 하나이고, 화살표는 메시지가 가는 방향이다.'
const expectedScenarios = [
  {
    id: 'same', label: '그대로',
    nodes: ['secondary', 'primary', 'ask', 'serial-same'],
    paths: ['ask-out', 'ask-in', 'same-out', 'same-in'],
    caption: '영역을 고치지 않은 동안에는 주 서버가 일련번호 100을 답한다. 보조 서버의 사본도 100이라 영역이 바뀌지 않은 것이므로, 영역 데이터를 받아 오지 않고 가진 사본으로 계속 답한다.',
  },
  {
    id: 'changed', label: '바뀜',
    nodes: ['secondary', 'primary', 'ask', 'serial-changed', 'transfer'],
    paths: ['ask-out', 'ask-in', 'changed-out', 'changed-in', 'transfer-out', 'transfer-in'],
    caption: '주 서버에서 레코드를 고치고 일련번호를 101로 올린 뒤에는 주 서버가 101을 답한다. 사본의 100보다 크므로 보조 서버는 영역 전송으로 영역 데이터를 TCP로 받아 오고, 그때부터 고친 데이터로 답한다.',
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

// 끝점이 닿는 상자. 메시지 노드를 먼저 보고, 없으면 기둥을 본다.
const endAt = (point: { x: number, y: number }) => nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))
  ?? groupIds.find((id) => onEdge(point.x, point.y, groupBox(id)))
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 308] : [0, 0, 280, 308]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<ZoneTransferDiagram />)
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
    const { container } = render(<ZoneTransferDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<ZoneTransferDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownNotes()).toEqual(Object.keys(noteScenarios).filter((id) => noteScenarios[id] === scenario.id))
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
    render(<ZoneTransferDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    expect(overlaps(groupBox('secondary-side'), groupBox('primary-side'))).toBe(false)
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
      // 메시지 노드와 머리 노드는 두 기둥에 들지 않는다.
      for (const group of groupIds) expect(overlaps(nodeBox(id), groupBox(group)), `${id} ↔ ${group}`).toBe(false)
    }
    const groupTexts = groupIds.map((id) => {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
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
        // 곁말은 자기 메시지 노드 바로 아래 줄에 놓인다.
        const own = nodeBox(noteNode[id])
        expect(box.y, id).toBeGreaterThanOrEqual(own.y + own.height)
        expect(box.y - (own.y + own.height), id).toBeLessThanOrEqual(12)
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

  it('화살표의 양 끝은 메시지 노드나 기둥의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<ZoneTransferDiagram />)
    for (const [id, d] of Object.entries(paths)) {
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
      const { start, end } = lineEnds(d)
      expect(endAt(start), `${id} 시작`).toBe(ends[id][0])
      expect(endAt(end), `${id} 끝`).toBe(ends[id][1])
    }
  })

  // 요점: 번호가 그대로면 영역 전송이 없고, 커졌을 때만 주 서버 쪽에서 보조 서버 쪽으로 영역 전송이 TCP로 온다.
  // 두 시나리오의 일련번호 답은 서로 다른 노드이고 다른 자리에 있다.
  it('그대로에서는 영역 전송이 흐리고 화살표가 없으며, 바뀜에서는 주 서버 쪽에서 보조 서버 쪽으로 영역 전송이 온다', async () => {
    render(<ZoneTransferDiagram />)
    // 메시지는 묻기 → 일련번호 답 → 영역 전송 차례로 위에서 아래로 놓인다.
    const ys = messageIds.map((id) => nodeBox(id).y)
    expect([...ys].sort((a, b) => a - b)).toEqual(ys)
    expect(new Set(ys).size).toBe(messageIds.length)
    expect(nodeBox('serial-same').y).not.toBe(nodeBox('serial-changed').y)
    // 머리 노드는 자기 기둥 위에 있다 — 보조 서버는 왼쪽, 주 서버는 오른쪽.
    expect(nodeBox('secondary').x).toBeLessThan(nodeBox('primary').x)
    expect(groupBox('secondary-side').x).toBeLessThan(groupBox('primary-side').x)

    await select('그대로')
    expect(opacityOf('transfer')).toBe('0.25')
    expect(opacityOf('serial-changed')).toBe('0.25')
    expect(shownPaths().filter((id) => id.startsWith('transfer'))).toEqual([])

    await select('바뀜')
    expect(opacityOf('transfer')).toBe('1')
    expect(opacityOf('serial-same')).toBe('0.25')
    expect(shownPaths()).toEqual(expect.arrayContaining(['transfer-out', 'transfer-in']))
    expect(endAt(lineEnds(paths['transfer-out']).start)).toBe('primary-side')
    expect(endAt(lineEnds(paths['transfer-in']).end)).toBe('secondary-side')
    // 묻기는 반대로 보조 서버 쪽에서 주 서버 쪽으로 간다.
    expect(endAt(lineEnds(paths['ask-out']).start)).toBe('secondary-side')
    expect(endAt(lineEnds(paths['ask-in']).end)).toBe('primary-side')
    expect(`${label('transfer')} ${note('transfer-note')!.textContent}`).toContain('TCP')

    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join('\n')
    expect(body).toContain('두 번호가 같으면 영역이 바뀌지 않은 것이므로 받아 오지 않고, 가진 사본으로 계속 답한다.')
    expect(body).toContain('주 서버의 번호가 더 크면 영역이 바뀐 것이므로 영역 데이터를 새로 받아 온다.')
    expect(body).toContain('영역 전체를 옮기는 영역 전송(AXFR)은 TCP로 한다.')
    expect(body).toContain('주 서버 `ns1.example.com`과 보조 서버 `ns2.example.com`')
    expect(body).toContain('일련번호를 `101`로 올리면')
  })
}

describe('ZoneTransferDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<ZoneTransferDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 308')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('바뀜')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 308')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '바뀜' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><ZoneTransferDiagram /><ZoneTransferDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '바뀜' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<ZoneTransferDiagram />)
    const text = visualsByTopicId[topicId].diagrams['zone-transfer']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(zoneTransferScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = zoneTransferScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 영역과 주 서버·보조 서버 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(within(figure).queryByRole('heading')).toBeNull()
  })
})
