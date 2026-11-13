import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ReverseNameDiagram, reverseNameScenarios } from './ReverseNameDiagram'

const topicId = 'dns'
const anchorConceptId = `${topicId}.reverse-lookup`
const labels: Record<string, string> = {
  'f-name': 'www.example.com',
  'f-addr': '198.51.100.10',
  'r-addr': '198.51.100.10',
  'r-flip': '10.100.51.198',
  'r-arpa': '10.100.51.198.in-addr.arpa.',
  'r-ptr': 'PTR 레코드',
  'r-host': 'www.example.com.',
}
const groupLabels: Record<string, string> = { forward: '정방향 조회', reverse: '역방향 조회' }
const noteLabels: Record<string, string> = {
  'a-note': 'A 레코드로 찾는다',
  'flip-note': '네 수의 차례를 거꾸로',
  'suffix-note': '끝에 .in-addr.arpa.를 붙인다',
  'ask-note': '이 이름의 PTR 레코드를 묻는다',
  'answer-note': '데이터가 호스트 이름이다',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const forwardIds = ['f-name', 'f-addr']
const reverseIds = ['r-addr', 'r-flip', 'r-arpa', 'r-ptr', 'r-host']
// 곁말이 놓이는 그룹.
const noteGroup: Record<string, string> = {
  'a-note': 'forward', 'flip-note': 'reverse', 'suffix-note': 'reverse', 'ask-note': 'reverse', 'answer-note': 'reverse',
}
// 화살표마다 [출발, 도착].
const ends: Record<string, [string, string]> = {
  'f-a': ['f-name', 'f-addr'],
  'flip': ['r-addr', 'r-flip'],
  'suffix': ['r-flip', 'r-arpa'],
  'ask': ['r-arpa', 'r-ptr'],
  'answer': ['r-ptr', 'r-host'],
}

const tallPaths: Record<string, string> = {
  'f-a': 'M128 48 H152',
  'flip': 'M48 144 V168',
  'suffix': 'M48 200 V224',
  'ask': 'M48 256 V280',
  'answer': 'M48 312 V336',
}
const widePaths: Record<string, string> = {
  'f-a': 'M144 48 H264',
  'flip': 'M144 128 H264',
  'suffix': 'M324 144 V176',
  'ask': 'M324 208 V240',
  'answer': 'M264 256 H144',
}

const question = 'IP 주소로 이름을 찾을 때는 무엇을 물을까?'
const figureName = 'IP 주소 198.51.100.10으로 호스트 이름 www.example.com을 찾는 역방향 조회에서 주소를 in-addr.arpa 아래 이름으로 바꾸는 차례와 그 이름의 PTR 레코드를, 같은 짝을 이름으로 찾는 정방향 조회와 견주어 보이는 도식'
const svgName = '정방향 조회 상자에 www.example.com과 198.51.100.10을 놓고, 역방향 조회 상자에 198.51.100.10, 10.100.51.198, 10.100.51.198.in-addr.arpa., PTR 레코드, www.example.com.을 차례로 놓은 그림'
const idleCaption = '같은 짝 www.example.com과 198.51.100.10을, 위에서는 이름으로 주소를 찾는 정방향 조회로, 아래에서는 주소로 이름을 찾는 역방향 조회로 보인다. 이름과 주소는 예로 붙인 것이다. 버튼을 고르면 조회마다 무엇을 묻는지 볼 수 있다.'
const legend = '화살표는 조회의 차례이고, 화살표 곁의 글은 그 단계에서 하는 일이다.'
const expectedScenarios = [
  {
    id: 'forward', label: '정방향',
    nodes: ['f-name', 'f-addr'], paths: ['f-a'], notes: ['a-note'],
    caption: '이름 www.example.com을 주고, 그 이름의 A 레코드에서 IP 주소 198.51.100.10을 받는다. 이렇게 이름으로 주소를 찾는 것이 정방향 조회다.',
  },
  {
    id: 'reverse-name', label: '이름 만들기',
    nodes: ['r-addr', 'r-flip', 'r-arpa'], paths: ['flip', 'suffix'], notes: ['flip-note', 'suffix-note'],
    caption: '역방향 조회는 먼저 주소를 도메인 이름 꼴로 바꾼다. 198.51.100.10의 네 수를 거꾸로 늘어놓아 10.100.51.198을 만들고, 끝에 .in-addr.arpa.를 붙여 10.100.51.198.in-addr.arpa.를 얻는다.',
  },
  {
    id: 'ptr', label: 'PTR',
    nodes: ['r-arpa', 'r-ptr', 'r-host'], paths: ['ask', 'answer'], notes: ['ask-note', 'answer-note'],
    caption: '만든 이름 10.100.51.198.in-addr.arpa.의 PTR 레코드를 물으면, 그 데이터에 적힌 호스트 이름 www.example.com.이 답으로 온다. 이 PTR 레코드는 A 레코드와 따로 적어 둔 레코드다.',
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

const groupLabelBox = (id: string) => textBox(svg().querySelector(`[data-group-label="${id}"]`)!, id)

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 304] : [0, 0, 280, 392]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<ReverseNameDiagram />)
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
    const { container } = render(<ReverseNameDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(svg().querySelectorAll('path:not(marker path)')).toHaveLength(0)
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<ReverseNameDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownNotes()).toEqual(scenario.notes)
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
    render(<ReverseNameDiagram />)
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
    }
    // 정방향의 두 노드는 정방향 상자 안에, 역방향의 다섯 노드는 역방향 상자 안에 놓이고, 두 상자는 겹치지 않는다.
    for (const id of forwardIds) expect(contains(groupBox('forward'), nodeBox(id)), id).toBe(true)
    for (const id of reverseIds) expect(contains(groupBox('reverse'), nodeBox(id)), id).toBe(true)
    expect(overlaps(groupBox('forward'), groupBox('reverse'))).toBe(false)
    expect(groupBox('forward').y).toBeLessThan(groupBox('reverse').y)
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
        expect(contains(groupBox(noteGroup[id]), box), id).toBe(true)
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
        for (const other of noteTexts.filter(({ id }) => id !== box.id)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
      }
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표의 양 끝은 노드의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<ReverseNameDiagram />)
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

  // 요점: 거꾸로 적은 노드의 네 수는 원래 주소의 네 수를 거꾸로 늘어놓은 것이고, 수 안의 자릿수는 그대로다.
  // in-addr.arpa 이름은 그 거꾸로 적은 수로 시작한다. 정방향에서는 PTR 레코드가 흐리고, 역방향의 답은 정방향의 이름과 같은 호스트다.
  it('주소의 네 수를 거꾸로 늘어놓아 in-addr.arpa 이름을 만들고, 정방향에서는 PTR 레코드가 흐리다', async () => {
    render(<ReverseNameDiagram />)
    const octets = label('r-addr').split('.')
    expect(octets).toHaveLength(4)
    expect(label('r-flip').split('.')).toEqual([...octets].reverse())
    expect(label('r-flip')).not.toBe([...label('r-addr')].reverse().join(''))
    expect(label('r-arpa')).toBe(`${label('r-flip')}.in-addr.arpa.`)
    expect(label('r-arpa').startsWith(label('r-flip'))).toBe(true)
    // 역방향의 출발 주소와 답은 정방향의 짝과 같다(답은 끝에 점까지 적은 이름).
    expect(label('r-addr')).toBe(label('f-addr'))
    expect(label('r-host')).toBe(`${label('f-name')}.`)

    await select('정방향')
    expect(svg().querySelector('[data-node="r-ptr"]')).toHaveAttribute('opacity', '0.25')
    for (const id of reverseIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', '0.25')
    await select('PTR')
    for (const id of forwardIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', '0.25')

    // 본문의 계산 예와 같은 값이다.
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join('\n')
    expect(body).toContain('네 수의 차례를 거꾸로 해 `10`, `100`, `51`, `198`로 늘어놓는다')
    expect(body).toContain('끝에 `.in-addr.arpa.`를 붙이면 `10.100.51.198.in-addr.arpa.`가 된다')
    expect(body).toContain('이 이름의 PTR 레코드를 물으면 데이터에 적힌 `www.example.com.`이 답으로 온다')
    expect(body).toContain('`www.example.com. 3600 IN A 198.51.100.10`')
  })
}

describe('ReverseNameDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<ReverseNameDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 392')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('이름 만들기')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 304')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '이름 만들기' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><ReverseNameDiagram /><ReverseNameDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'PTR' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<ReverseNameDiagram />)
    const text = visualsByTopicId[topicId].diagrams['reverse-name']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(reverseNameScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = reverseNameScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 역방향 조회와 PTR 레코드 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
