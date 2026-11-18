import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { DhcpScopeRangeDiagram, dhcpScopeRangeScenarios } from './DhcpScopeRangeDiagram'

const topicId = 'windows-server-roles'
const anchorConceptId = `${topicId}.dhcp-server-role`
const labels: Record<string, string> = {
  'excluded': '192.0.2.100~192.0.2.109',
  'leasable': '192.0.2.110~192.0.2.199',
  'pc01': 'PC01',
}
const groupLabels: Record<string, string> = {
  'scope': 'SRV01의 범위 · 192.0.2.100~192.0.2.199',
}
const noteLabels: Record<string, string> = {
  'range-note': '100개',
  'excl-note': '주지 않는 10개',
  'lease-note': '나눠 주는 90개',
  'term-note': '3일 동안 빌려준다',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
// 범위 박스 안에는 범위를 나눈 두 칸이 있다. PC01은 박스 밖에 있다.
const insideScope = ['excluded', 'leasable']
// 화살표는 앞 노드의 변에서 시작해 뒤 노드의 변에서 끝난다.
const pathEnds: Record<string, [string, string]> = {
  'lease-pc': ['leasable', 'pc01'],
}
const tallPaths: Record<string, string> = {
  'lease-pc': 'M88 104 V144',
}
const widePaths: Record<string, string> = {
  'lease-pc': 'M352 48 H384',
}

const question = '범위를 만들면 어느 주소가 클라이언트에게 갈까?'
const figureName = 'SRV01의 범위 192.0.2.100~192.0.2.199 가운데 제외 범위 192.0.2.100~192.0.2.109의 10개는 어느 클라이언트에게도 주지 않고, 나머지 192.0.2.110~192.0.2.199의 90개 가운데 하나를 PC01에게 임대 기간 3일 동안 빌려주는 것을 보이는 도식'
const svgName = 'SRV01의 범위 박스 안에 제외 범위 192.0.2.100~192.0.2.109 칸과 나머지 192.0.2.110~192.0.2.199 칸을 그리고, 박스 밖에 PC01을 그린 그림'
const idleCaption = 'SRV01에 만든 범위 하나를 제외 범위와 나머지로 나눠 두었다. SRV01과 PC01은 예로 붙인 이름이고, 두 구간과 임대 기간 3일은 예로 고른 값이다. 버튼을 고르면 범위·제외 범위·나눠 주는 주소가 저마다 무엇인지 볼 수 있다.'
const legend = '큰 박스가 SRV01의 범위이고, 그 안의 두 칸은 범위를 제외 범위와 나머지로 나눈 것이다. 화살표는 SRV01이 나머지 칸의 주소 하나를 PC01에게 빌려주는 방향이다.'
const expectedScenarios = [
  {
    id: 'range', label: '범위',
    nodes: ['excluded', 'leasable'], paths: [], notes: ['range-note'],
    caption: '범위는 SRV01이 한 서브넷의 클라이언트에게 나눠 줄 주소의 구간이다. 이 예에서는 192.0.2.100부터 192.0.2.199까지 끊김 없이 이어진 100개이고, 199 − 100 + 1로 센다. 제외할 주소도 이 구간 안에서 고른다.',
  },
  {
    id: 'exclude', label: '제외 범위',
    nodes: ['excluded'], paths: [], notes: ['excl-note'],
    caption: '제외 범위 192.0.2.100~192.0.2.109의 10개는 범위 안에 있지만 SRV01이 어느 클라이언트에게도 주지 않는다. 관리자가 장치에 손으로 넣는 고정 IP 주소를 이 구간에서 고르면 DHCP가 나눠 주는 주소와 겹치지 않는다.',
  },
  {
    id: 'lease', label: '나눠 주는 주소',
    nodes: ['leasable', 'pc01'], paths: ['lease-pc'], notes: ['lease-note', 'term-note'],
    caption: '범위 100개에서 제외 범위 10개를 빼면 나눠 줄 수 있는 주소는 192.0.2.110~192.0.2.199의 90개다. 새로 이어진 PC01은 이 가운데 아직 빌려주지 않은 주소 하나를 임대 기간 3일 동안 빌려 쓴다.',
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

// 「192.0.2.100~192.0.2.109」 꼴의 구간에서 첫 주소와 끝 주소의 마지막 수를 읽고, 둘 다 구간에 드니 1을 더해 센다.
function rangeOf(text: string) {
  const [, first, last] = /192\.0\.2\.(\d+)~192\.0\.2\.(\d+)/u.exec(text)!
  return { first: Number(first), last: Number(last), count: Number(last) - Number(first) + 1 }
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 104] : [0, 0, 280, 184]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<DhcpScopeRangeDiagram />)
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
    const { container } = render(<DhcpScopeRangeDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<DhcpScopeRangeDiagram />)
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
    render(<DhcpScopeRangeDiagram />)
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
    for (const id of insideScope) expect(contains(groupBox('scope'), nodeBox(id)), `${id} ⊂ 범위`).toBe(true)
    expect(overlaps(groupBox('scope'), nodeBox('pc01')), 'PC01은 범위 밖').toBe(false)
    for (const id of groupIds) {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
    }
    // 곁말은 viewBox 안에 들어가고, 노드·그룹 라벨·다른 곁말·선과 겹치지 않는다.
    const noteBoxes = new Map<string, SvgBox>()
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of scenario.notes) noteBoxes.set(id, textBox(note(id), id))
    }
    expect([...noteBoxes.keys()].sort()).toEqual([...noteIds].sort())
    for (const box of noteBoxes.values()) {
      expect(boxesOutsideViewBox([box], viewBox), box.id).toEqual([])
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
      for (const group of groupIds) expect(overlaps(box, groupLabelBox(group)), `${box.id} ↔ ${group} 라벨`).toBe(false)
      for (const other of [...noteBoxes.values()].filter(({ id }) => id !== box.id)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
      for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 나머지 칸의 변에서 시작해 PC01의 변에서 끝나고, 노드 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<DhcpScopeRangeDiagram />)
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

  // 요점: 「제외 범위」와 「나눠 주는 주소」의 선명한 칸은 겹치지 않는 서로 다른 자리다. 두 칸은 범위 안에서 빈틈없이 이어지고,
  // 칸의 주소 수(10과 90)를 더하면 범위의 100이다. 「나눠 주는 주소」의 곁말과 캡션의 90은 본문의 계산 예와 같다.
  it('제외 범위와 나눠 주는 주소의 칸이 다른 자리이고, 10과 90을 더하면 범위의 100이며 90이 본문의 계산과 같다', async () => {
    const { container } = render(<DhcpScopeRangeDiagram />)
    const brightNodes = () => nodeIds.filter((id) => opacity(id) === '1')

    await select('제외 범위')
    const excludeNodes = brightNodes()
    expect(excludeNodes).toEqual(['excluded'])

    await select('나눠 주는 주소')
    const leaseNodes = brightNodes()
    expect(leaseNodes).toEqual(['leasable', 'pc01'])
    expect(excludeNodes.filter((id) => leaseNodes.includes(id))).toEqual([])
    expect(overlaps(nodeBox('excluded'), nodeBox('leasable'))).toBe(false)
    // 제외 범위는 PC01에게 가는 화살표의 출발점이 아니다.
    expect(onEdge(lineEnds(paths['lease-pc']).start, nodeBox('excluded'))).toBe(false)

    const scope = rangeOf(groupLabel('scope'))
    const excluded = rangeOf(label('excluded'))
    const leasable = rangeOf(label('leasable'))
    expect(scope.count).toBe(100)
    expect(excluded.count).toBe(10)
    expect(leasable.count).toBe(90)
    expect(excluded.first).toBe(scope.first)
    expect(leasable.first).toBe(excluded.last + 1)
    expect(leasable.last).toBe(scope.last)
    expect(note('lease-note').textContent).toContain(String(leasable.count))
    expect(container.querySelector('figcaption')!.textContent).toContain(`${leasable.count}개`)

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const name of ['`SRV01`', '`PC01`', '`192.0.2.100`', '`192.0.2.109`', '`192.0.2.110`', '`192.0.2.199`', '100 − 10 = 90개', '3일', '제외 범위']) {
      expect(body, name).toContain(name)
    }
  })
}

describe('DhcpScopeRangeDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<DhcpScopeRangeDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 184')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('나눠 주는 주소')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 104')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '나눠 주는 주소' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><DhcpScopeRangeDiagram /><DhcpScopeRangeDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '나눠 주는 주소' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<DhcpScopeRangeDiagram />)
    const text = visualsByTopicId[topicId].diagrams['dhcp-scope-range']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(dhcpScopeRangeScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = dhcpScopeRangeScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 DHCP 서버 역할 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
