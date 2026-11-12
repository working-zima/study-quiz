import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { DnssecChainDiagram, dnssecChainScenarios } from './DnssecChainDiagram'

const topicId = 'dns'
const anchorConceptId = `${topicId}.dnssec`
const labels: Record<string, string> = {
  root: '루트 영역',
  com: 'com 영역',
  example: 'example.com 영역',
  record: 'A 198.51.100.10',
  signature: 'RRSIG (서명)',
  local: '로컬 DNS 서버',
}
const groupLabels: Record<string, string> = {
  chain: '서명된 영역',
  answer: 'www.example.com의 답',
}
const noteLabels: Record<string, string> = {
  'sign-note': '개인 키로 서명해 둔다',
  'root-com-note': '루트가 com의 키를 보증',
  'com-example-note': 'com이 example.com의 키를 보증',
  'local-note': '공개 키로 서명을 확인한다',
  'visible-note': '내용은 그대로 보인다',
}
const noteScenarios: Record<string, string> = {
  'sign-note': 'sign',
  'root-com-note': 'verify',
  'com-example-note': 'verify',
  'local-note': 'verify',
  'visible-note': 'visible',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const chainIds = ['root', 'com', 'example']
const answerIds = ['record', 'signature']
const linkIds = ['l-root-com', 'l-com-example']

const tallPaths: Record<string, string> = {
  'l-root-com': 'M48 56 V80',
  'l-com-example': 'M48 112 V136',
  signs: 'M162 168 V216',
  deliver: 'M80 248 V288',
}
const widePaths: Record<string, string> = {
  'l-root-com': 'M36 60 V84',
  'l-com-example': 'M36 116 V140',
  signs: 'M180 156 H276',
  deliver: 'M288 96 V52',
}
// 선과 화살표마다 시작과 끝이 닿는 노드. 사슬의 선은 위 영역에서 아래 영역으로, 서명 화살표는 example.com 영역에서 서명으로,
// 답 화살표는 레코드에서 로컬 DNS 서버로 간다.
const ends: Record<string, [string, string]> = {
  'l-root-com': ['root', 'com'],
  'l-com-example': ['com', 'example'],
  signs: ['example', 'signature'],
  deliver: ['record', 'local'],
}
// 사슬의 두 곁말은 자기가 잇는 두 영역 사이에 놓인다.
const linkNoteBetween: Record<string, [string, string]> = {
  'root-com-note': ['root', 'com'],
  'com-example-note': ['com', 'example'],
}

const question = 'DNSSEC은 응답의 무엇을 확인해 줄까?'
const figureName = '서명된 영역이 레코드에 서명을 붙여 두고, 로컬 DNS 서버가 루트까지 이어진 키로 그 서명을 확인하며, 서명이 응답의 내용을 감추지는 않는다는 것을 보이는 도식'
const svgName = '루트 영역, com 영역, example.com 영역을 위에서 아래로 이은 박스와, A 198.51.100.10과 RRSIG (서명)가 든 답 박스, 로컬 DNS 서버를 놓은 그림'
const idleCaption = 'www.example.com의 A 레코드를 예로, 서명된 example.com 영역과 그 위의 com·루트 영역이 이루는 사슬, 레코드와 서명이 함께 실린 답, 그 답을 받는 로컬 DNS 서버를 놓았다. 이름과 주소는 예로 붙인 것이다. 버튼을 고르면 서명을 붙이는 일, 확인하는 일, 감추지 않는 것을 볼 수 있다.'
const legend = '위 박스의 세 영역을 잇는 선은 위 영역과 그 아래 영역을 잇는다. 아래 박스는 응답에 함께 실린 레코드와 서명이다. 화살표는 서명을 붙이는 쪽과 답이 가는 쪽을 가리킨다.'
const expectedScenarios = [
  {
    id: 'sign', label: '서명',
    nodes: ['example', 'record', 'signature'],
    paths: ['signs'],
    caption: 'example.com 영역은 www.example.com의 A 레코드에 그 영역의 개인 키로 서명해, 그 서명을 RRSIG 레코드에 담아 둔다. 응답에는 레코드와 서명이 함께 실린다.',
  },
  {
    id: 'verify', label: '확인',
    nodes: ['root', 'com', 'example', 'record', 'signature', 'local'],
    paths: ['deliver'],
    caption: '로컬 DNS 서버는 example.com의 DNSKEY 레코드에 든 공개 키로 서명을 확인한다. 그 키는 com 영역이 DS 레코드로 보증하고, com의 키는 루트 영역이 보증하며, 루트 영역의 공개 키는 처음부터 믿을 키로 설정해 둔 신뢰 앵커다.',
  },
  {
    id: 'visible', label: '감추지 않음',
    nodes: ['record', 'signature'],
    paths: [],
    caption: '서명은 레코드가 바뀌지 않았는지 확인할 값을 덧붙일 뿐 내용을 감추지 않는다. 질의와 응답은 암호화되지 않아, 엿보는 사람도 www.example.com과 주소 198.51.100.10을 그대로 알아볼 수 있다.',
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
const link = (id: string) => svg().querySelector(`[data-link="${id}"]`)!
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

const endAt = (point: { x: number, y: number }) => nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 212] : [0, 0, 280, 344]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<DnssecChainDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 세 영역을 잇는 선만 보이며 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<DnssecChainDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(Array.from(svg().querySelectorAll('[data-link]'), (item) => item.getAttribute('data-link'))).toEqual(linkIds)
    for (const id of linkIds) {
      expect(link(id)).toHaveAttribute('d', paths[id])
      expect(link(id)).toHaveClass('stroke-muted')
      expect(link(id)).not.toHaveAttribute('marker-end')
      expect(link(id).closest('[opacity]')).toBeNull()
    }
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보이고 그룹 박스와 잇는 선은 흐려지지 않는다', async (scenario) => {
    const { container } = render(<DnssecChainDiagram />)
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
    for (const id of linkIds) expect(link(id).closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말·그룹 라벨이 자리에 들어간다`, async () => {
    render(<DnssecChainDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    expect(overlaps(groupBox('chain'), groupBox('answer'))).toBe(false)
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    for (const id of chainIds) expect(contains(groupBox('chain'), nodeBox(id)), id).toBe(true)
    for (const id of answerIds) expect(contains(groupBox('answer'), nodeBox(id)), id).toBe(true)
    // 로컬 DNS 서버는 두 박스 어디에도 들지 않는다.
    for (const id of groupIds) expect(overlaps(groupBox(id), nodeBox('local')), id).toBe(false)
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
      for (const box of noteTexts) {
        for (const group of groupTexts) expect(overlaps(box, group), `${box.id} ↔ ${group.id}`).toBe(false)
        for (const other of noteTexts.filter((item) => item !== box)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
      }
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('선과 화살표의 양 끝은 노드의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<DnssecChainDiagram />)
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

  // 요점: 사슬의 세 영역은 루트 → com → example.com 차례로 위에서 아래로 놓이고, 위 영역이 아래 영역의 키를 보증한다.
  // 어느 라벨·곁말도 암호화를 말하지 않고, 「감추지 않음」의 곁말은 본문의 「그대로 보인다」를 쓴다. 상태는 색이 아니라 곁말로 보인다.
  it('사슬은 루트 → com → example.com 차례이고, 라벨·곁말에 암호화가 없으며 감추지 않음은 본문의 「그대로 보인다」를 쓴다', async () => {
    render(<DnssecChainDiagram />)
    const ys = chainIds.map((id) => nodeBox(id).y)
    expect([...ys].sort((a, b) => a - b)).toEqual(ys)
    expect(new Set(ys).size).toBe(3)
    // 사슬의 선은 위 영역의 아래 변에서 아래 영역의 위 변으로 이어진다.
    for (const id of linkIds) {
      const { start, end } = lineEnds(paths[id])
      expect(start.y, id).toBeLessThan(end.y)
    }
    // 서명 화살표는 example.com 영역에서 서명으로, 답 화살표는 레코드에서 로컬 DNS 서버로 간다.
    expect(endAt(lineEnds(paths.signs).start)).toBe('example')
    expect(endAt(lineEnds(paths.signs).end)).toBe('signature')
    expect(endAt(lineEnds(paths.deliver).end)).toBe('local')

    const words = [...Object.values(labels), ...Object.values(groupLabels), ...Object.values(noteLabels)]
    for (const word of words) expect(word, word).not.toMatch(/암호/u)
    expect(svg().querySelector('[class*="fill-green"], [class*="fill-red"], [class*="stroke-green"], [class*="stroke-red"]')).toBeNull()

    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of shownNotes()) expect(note(id)!.textContent, id).not.toMatch(/암호/u)
    }

    // 사슬의 곁말은 자기가 잇는 두 영역 사이 줄에 놓인다.
    await select('확인')
    for (const [id, [upper, lower]] of Object.entries(linkNoteBetween)) {
      const box = textBox(note(id)!, id)
      expect(box.y, id).toBeGreaterThanOrEqual(nodeBox(upper).y + nodeBox(upper).height)
      expect(box.y + box.height, id).toBeLessThanOrEqual(nodeBox(lower).y)
    }
    expect(opacityOf('local')).toBe('1')

    await select('감추지 않음')
    for (const id of ['root', 'com', 'example', 'local']) expect(opacityOf(id), id).toBe('0.25')
    expect(note('visible-note')!.textContent).toContain('그대로 보인다')

    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join('\n')
    expect(body).toContain('질의와 응답의 내용은 그대로 보인다')
    expect(body).toContain('DNSSEC은 응답을 암호화하지 않는다.')
    expect(body).toContain('위 영역이 아래 영역의 키를 보증한다')
    expect(body).toContain('신뢰 앵커(trust anchor)')
    expect(body).toContain('`www.example.com`의 A 레코드 `198.51.100.10`')
    for (const name of ['RRSIG', 'DNSKEY', 'DS 레코드', '개인 키', '공개 키']) expect(body, name).toContain(name)
  })
}

describe('DnssecChainDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선·화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<DnssecChainDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 344')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('확인')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 212')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '확인' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      for (const id of linkIds) expect(link(id)).toHaveAttribute('d', widePaths[id])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><DnssecChainDiagram /><DnssecChainDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '확인' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<DnssecChainDiagram />)
    const text = visualsByTopicId[topicId].diagrams['dnssec-chain']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(dnssecChainScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = dnssecChainScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 DNSSEC 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
