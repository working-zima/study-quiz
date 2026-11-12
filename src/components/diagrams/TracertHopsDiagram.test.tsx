import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { TracertHopsDiagram, tracertHopsScenarios } from './TracertHopsDiagram'

const topicId = 'diagnostic-commands'
const anchorConceptId = `${topicId}.tracert`
const labels: Record<string, string> = {
  'pc': 'PC · 192.0.2.10',
  'router-1': '192.0.2.1',
  'router-2': '203.0.113.1',
  'router-3': '198.51.100.1',
  'dest': '198.51.100.10',
  'hop-1': '홉 1의 줄',
  'hop-2': '홉 2의 줄',
  'hop-3': '홉 3의 줄',
  'hop-4': '홉 4의 줄',
}
const groupLabels: Record<string, string> = {
  'route': 'PC에서 목적지까지',
  'result': 'tracert 결과',
}
const noteLabels: Record<string, string> = {
  'gateway-note': '기본 게이트웨이',
  'path-note': '줄마다 라우터 하나',
  'dest-note': '마지막 줄이 목적지',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
const deviceIds = ['pc', 'router-1', 'router-2', 'router-3', 'dest']
const hopIds = ['hop-1', 'hop-2', 'hop-3', 'hop-4']
const linkIds = ['link-1', 'link-2', 'link-3', 'link-4']
const groupOf = (id: string) => (id.startsWith('hop') ? 'result' : 'route')
// 늘 보이는 연결선은 경로의 앞 장치에서 다음 장치로, 화살표는 결과의 줄에서 그 줄이 가리키는 장치로 간다.
const pathEnds: Record<string, [string, string]> = {
  'link-1': ['pc', 'router-1'],
  'link-2': ['router-1', 'router-2'],
  'link-3': ['router-2', 'router-3'],
  'link-4': ['router-3', 'dest'],
  'map-1': ['hop-1', 'router-1'],
  'map-2': ['hop-2', 'router-2'],
  'map-3': ['hop-3', 'router-3'],
  'map-4': ['hop-4', 'dest'],
}
const tallPaths: Record<string, string> = {
  'link-1': 'M70 60 V76',
  'link-2': 'M70 108 V124',
  'link-3': 'M70 156 V172',
  'link-4': 'M70 204 V220',
  'map-1': 'M152 92 H124',
  'map-2': 'M152 140 H124',
  'map-3': 'M152 188 H124',
  'map-4': 'M152 236 H124',
}
const widePaths: Record<string, string> = {
  'link-1': 'M76 60 V68',
  'link-2': 'M76 100 V108',
  'link-3': 'M76 140 V148',
  'link-4': 'M76 180 V188',
  'map-1': 'M208 84 H136',
  'map-2': 'M208 124 H136',
  'map-3': 'M208 164 H136',
  'map-4': 'M208 204 H136',
}

const question = 'tracert 결과의 한 줄은 어느 장치일까?'
const figureName = 'PC 192.0.2.10에서 tracert 198.51.100.10을 입력했을 때 결과의 홉 1~4 줄이 차례로 192.0.2.1, 203.0.113.1, 198.51.100.1, 목적지 198.51.100.10을 가리키는 것을 경로의 장치와 결과의 줄을 이어 보이는 도식'
const svgName = '왼쪽 박스에 PC에서 목적지까지의 장치를 차례로 잇고, 오른쪽 박스에 tracert 결과의 홉 1~4 줄을 두어 줄마다 그 장치로 화살표를 그은 그림'
const idleCaption = 'PC 192.0.2.10에서 tracert 198.51.100.10을 입력했을 때 패킷이 거치는 장치와, 결과에 나오는 홉마다의 줄을 나란히 놓았다. 버튼을 고르면 결과의 줄이 어느 장치인지 볼 수 있다.'
const legend = '왼쪽 박스의 선은 패킷이 지나는 길이고, 결과의 줄에서 나가는 화살표는 그 줄에 주소가 적힌 장치를 가리킨다.'
const expectedScenarios = [
  {
    id: 'first-hop', label: '첫 줄',
    nodes: ['router-1', 'hop-1'], paths: ['map-1'], notes: ['gateway-note'],
    caption: '결과의 첫 줄은 홉 1, PC에서 가장 가까운 라우터인 192.0.2.1이다. PC가 자기 네트워크 밖으로 보내는 패킷은 먼저 기본 게이트웨이에 맡겨지므로, TTL이 1인 요청을 버리고 알림을 보내는 것도 이 기본 게이트웨이다.',
  },
  {
    id: 'path', label: '경로',
    nodes: ['router-1', 'router-2', 'router-3', 'hop-1', 'hop-2', 'hop-3', 'link-2', 'link-3'], paths: ['map-1', 'map-2', 'map-3'], notes: ['path-note'],
    caption: '줄이 하나 내려갈 때마다 PC에서 한 홉 더 먼 라우터다. 홉 1의 192.0.2.1, 홉 2의 203.0.113.1, 홉 3의 198.51.100.1이 패킷이 거치는 차례대로 나온다.',
  },
  {
    id: 'destination', label: '목적지',
    nodes: ['dest', 'hop-4'], paths: ['map-4'], notes: ['dest-note'],
    caption: '마지막 줄인 홉 4의 198.51.100.10이 목적지다. TTL을 늘리던 요청이 목적지에 닿으면 목적지가 에코 응답으로 답하고, tracert는 거기서 찾기를 끝낸다.',
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 236] : [0, 0, 280, 280]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<TracertHopsDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 칸·연결선이 모두 선명하고 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<TracertHopsDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(Array.from(svg().querySelectorAll('[data-link]'), (link) => link.getAttribute('data-link'))).toEqual(linkIds)
    for (const element of svg().querySelectorAll('[data-link]')) {
      expect(element).toHaveAttribute('opacity', '1')
      expect(element).not.toHaveAttribute('marker-end')
    }
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 칸·연결선·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<TracertHopsDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    for (const id of linkIds) expect(svg().querySelector(`[data-link="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
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
    render(<TracertHopsDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    expect(overlaps(groupBox('route'), groupBox('result'))).toBe(false)
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      expect(contains(groupBox(groupOf(id)), nodeBox(id)), `${id} ⊂ ${groupOf(id)}`).toBe(true)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    for (const id of groupIds) {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
    }
    // 곁말은 결과 박스 안에 들어가고, 칸이나 그룹 라벨, 선과 겹치지 않는다.
    const noteBoxes: SvgBox[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of scenario.notes) noteBoxes.push(textBox(note(id), id))
    }
    expect(noteBoxes.map(({ id }) => id)).toEqual(noteIds)
    for (const box of noteBoxes) {
      expect(contains(groupBox('result'), box), box.id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
      for (const group of groupIds) expect(overlaps(box, groupLabelBox(group)), `${box.id} ↔ ${group} 라벨`).toBe(false)
      for (const [pathId, d] of Object.entries(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ ${pathId}`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('선과 화살표는 앞 칸의 변에서 시작해 뒤 칸의 변에서 끝나고, 칸 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<TracertHopsDiagram />)
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

  // 요점: 결과 줄의 홉 번호가 위에서부터 1, 2, 3, 4이고, 각 줄이 가리키는 장치의 주소가 본문 경로의 차례와 같다.
  // 「목적지」에서 선명한 장치 라벨은 198.51.100.10이다.
  it('결과의 줄은 홉 1~4 차례이고, 줄마다 가리키는 장치가 본문의 경로 차례와 같으며, 마지막 줄이 목적지다', async () => {
    render(<TracertHopsDiagram />)
    const byTop = [...hopIds].sort((a, b) => nodeBox(a).y - nodeBox(b).y)
    expect(byTop.map((id) => Number(/홉 (\d)/u.exec(label(id))![1]))).toEqual([1, 2, 3, 4])
    // 줄에서 나가는 화살표가 끝나는 장치의 주소를 홉 차례대로 읽는다.
    const target = (hop: string) => deviceIds.find((device) => onEdge(lineEnds(paths[`map-${hop.slice(4)}`]).end, nodeBox(device)))!
    const addresses = byTop.map((hop) => label(target(hop)))
    expect(addresses).toEqual(['192.0.2.1', '203.0.113.1', '198.51.100.1', '198.51.100.10'])
    // 경로의 장치는 PC에서 연결선을 따라가면 같은 차례로 나온다.
    const chain = ['pc']
    for (let i = 0; i < linkIds.length; i += 1) {
      const end = lineEnds(paths[linkIds[i]]).end
      chain.push(deviceIds.find((device) => onEdge(end, nodeBox(device)) && !chain.includes(device))!)
    }
    expect(chain.slice(1).map(label)).toEqual(addresses)
    // 본문의 경로도 같은 차례로 적혀 있다.
    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    const positions = addresses.map((address) => body.indexOf(`홉 ${addresses.indexOf(address) + 1}의 줄에는 \`${address}\``))
    for (const position of positions) expect(position).toBeGreaterThanOrEqual(0)
    expect([...positions].sort((a, b) => a - b)).toEqual(positions)
    for (const phrase of ['`tracert 198.51.100.10`', '기본 게이트웨이', '목적지']) expect(body, phrase).toContain(phrase)

    await select('목적지')
    const shownDevices = deviceIds.filter((id) => opacity(id) === '1')
    expect(shownDevices.map(label)).toEqual(['198.51.100.10'])
    expect(shownNotes().map((id) => note(id).textContent)).toEqual(['마지막 줄이 목적지'])

    await select('첫 줄')
    expect(deviceIds.filter((id) => opacity(id) === '1').map(label)).toEqual(['192.0.2.1'])
    expect(hopIds.filter((id) => opacity(id) === '1').map(label)).toEqual(['홉 1의 줄'])
  })
}

describe('TracertHopsDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('칸·그룹·연결선 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<TracertHopsDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 280')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      const tallLinks = Array.from(svg().querySelectorAll('[data-link]'), (link) => link.getAttribute('data-link'))
      await select('경로')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 236')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(Array.from(svg().querySelectorAll('[data-link]'), (link) => link.getAttribute('data-link'))).toEqual(tallLinks)
      expect(screen.getByRole('button', { name: '경로' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><TracertHopsDiagram /><TracertHopsDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '경로' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<TracertHopsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['tracert-hops']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(tracertHopsScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = tracertHopsScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 tracert 명령 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
