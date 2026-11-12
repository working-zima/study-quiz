import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { IpconfigOptionsDiagram, ipconfigOptionsScenarios } from './IpconfigOptionsDiagram'

const topicId = 'diagnostic-commands'
const anchorConceptId = `${topicId}.ipconfig-options`
const labels: Record<string, string> = {
  'before-ip': 'IP 주소 · 192.0.2.10',
  'before-cache': 'DNS 캐시 · www.example.com',
  'opt-release': '/release',
  'after-release': 'IP 주소 없음',
  'dhcp-server': 'DHCP 서버',
  'opt-renew': '/renew',
  'after-renew': 'IP 주소 · 다시 받음',
  'opt-displaydns': '/displaydns',
  'after-displaydns': '캐시 내용이 화면에 보임',
  'opt-flushdns': '/flushdns',
  'after-flush-cache': 'DNS 캐시 · 비었음',
  'after-flush-ip': 'IP 주소 · 192.0.2.10',
}
const groupLabels: Record<string, string> = {
  'before': '명령 전의 PC',
  'address': '주소를 다루는 옵션',
  'cache': '이름 캐시를 다루는 옵션',
}
const noteLabels: Record<string, string> = {
  'release-note': '주소를 돌려준다',
  'renew-note': '주소를 다시 준다',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
const groupOf: Record<string, string> = {
  'before-ip': 'before', 'before-cache': 'before',
  'opt-release': 'address', 'after-release': 'address', 'dhcp-server': 'address', 'opt-renew': 'address', 'after-renew': 'address',
  'opt-displaydns': 'cache', 'after-displaydns': 'cache', 'opt-flushdns': 'cache', 'after-flush-cache': 'cache', 'after-flush-ip': 'cache',
}
// 옵션을 입력한 뒤의 상태 칸. 맨 위의 명령 전 칸과 DHCP 서버는 들지 않는다.
const afterNodes = ['after-release', 'after-renew', 'after-displaydns', 'after-flush-cache', 'after-flush-ip']
const noteOwner: Record<string, string> = { 'release-note': 'address', 'renew-note': 'address' }
// 화살표는 앞 칸의 변에서 시작해 뒤 칸의 변에서 끝난다.
const pathEnds: Record<string, [string, string]> = {
  'release-cmd': ['opt-release', 'after-release'],
  'release-to-server': ['after-release', 'dhcp-server'],
  'renew-cmd': ['opt-renew', 'after-renew'],
  'renew-from-server': ['dhcp-server', 'after-renew'],
  'display-cmd': ['opt-displaydns', 'after-displaydns'],
  'flush-cmd': ['opt-flushdns', 'after-flush-cache'],
}
const tallPaths: Record<string, string> = {
  'release-cmd': 'M104 152 H120',
  'release-to-server': 'M164 168 V196 H184',
  'renew-cmd': 'M104 240 H120',
  'renew-from-server': 'M224 212 V224',
  'display-cmd': 'M104 312 H120',
  'flush-cmd': 'M104 360 H120',
}
const widePaths: Record<string, string> = {
  'release-cmd': 'M104 120 H120',
  'release-to-server': 'M224 120 H364 V128',
  'renew-cmd': 'M104 168 H120',
  'renew-from-server': 'M364 160 V168 H256',
  'display-cmd': 'M104 240 H120',
  'flush-cmd': 'M104 288 H120',
}

const question = '옵션마다 무엇이 바뀔까?'
const figureName = 'PC 192.0.2.10에서 ipconfig의 옵션 넷을 입력했을 때, /release와 /renew는 DHCP 서버와 주소를 주고받아 IP 주소를 없애거나 다시 붙이고, /displaydns와 /flushdns는 IP 주소를 그대로 둔 채 DNS 캐시를 보여 주거나 비우는 것을 명령 전과 뒤로 보이는 도식'
const svgName = '위에 명령 전 PC의 IP 주소와 DNS 캐시를, 아래에 주소를 다루는 옵션 둘과 이름 캐시를 다루는 옵션 둘을 옵션마다 명령 칸과 뒤 상태 칸으로 그린 그림'
const idleCaption = '맨 위 박스가 옵션을 입력하기 전 PC의 IP 주소와 DNS 캐시다. 버튼을 고르면 그 옵션을 입력한 뒤 무엇이 바뀌는지 볼 수 있다.'
const legend = '옵션 칸에서 나가는 화살표는 그 옵션을 입력한 뒤의 상태를 가리킨다. DHCP 서버와 잇는 화살표는 PC와 DHCP 서버 사이에서 주소가 오가는 쪽을 가리킨다.'
const before = ['before-ip', 'before-cache']
const expectedScenarios = [
  {
    id: 'release', label: '/release',
    nodes: [...before, 'opt-release', 'after-release', 'dhcp-server'], paths: ['release-cmd', 'release-to-server'], notes: ['release-note'],
    caption: 'ipconfig /release를 입력하면 PC는 DHCP 서버에 주소를 돌려주겠다고 알리고 어댑터의 주소 설정을 버린다. 그 뒤 어댑터에는 IP 주소가 없어, 주소를 다시 받기 전까지 그 어댑터로는 통신하지 못한다.',
  },
  {
    id: 'renew', label: '/renew',
    nodes: [...before, 'opt-renew', 'after-renew', 'dhcp-server'], paths: ['renew-cmd', 'renew-from-server'], notes: ['renew-note'],
    caption: 'ipconfig /renew를 입력하면 DHCP 서버가 쓸 IP 주소와 설정 값을 골라 다시 알려 주고, 어댑터에 IP 주소가 다시 붙는다. 어떤 주소를 줄지는 DHCP 서버가 정한다.',
  },
  {
    id: 'displaydns', label: '/displaydns',
    nodes: [...before, 'opt-displaydns', 'after-displaydns'], paths: ['display-cmd'], notes: [],
    caption: 'ipconfig /displaydns를 입력하면 DNS 캐시에 적힌 이름과 주소의 짝, 여기서는 www.example.com의 짝이 화면에 나온다. 보여 주기만 하므로 캐시도 IP 주소도 바뀌지 않는다.',
  },
  {
    id: 'flushdns', label: '/flushdns',
    nodes: [...before, 'opt-flushdns', 'after-flush-cache', 'after-flush-ip'], paths: ['flush-cmd'], notes: [],
    caption: 'ipconfig /flushdns를 입력하면 DNS 캐시가 비어, 다음에 www.example.com을 쓸 때 PC는 DNS 서버에 그 주소를 다시 묻는다. 이름의 기록만 지우므로 IP 주소는 192.0.2.10 그대로다.',
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 320] : [0, 0, 280, 436]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<IpconfigOptionsDiagram />)
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
    const { container } = render(<IpconfigOptionsDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 칸·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<IpconfigOptionsDiagram />)
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
    render(<IpconfigOptionsDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of groupIds) for (const other of groupIds.filter((otherId) => otherId !== id)) expect(overlaps(groupBox(id), groupBox(other)), `${id} ↔ ${other}`).toBe(false)
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      expect(contains(groupBox(groupOf[id]), nodeBox(id)), `${id} ⊂ ${groupOf[id]}`).toBe(true)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    for (const id of groupIds) {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
    }
    // 곁말은 주소를 다루는 박스 안에 들어가고, 칸이나 그룹 라벨, 다른 곁말과 겹치지 않는다.
    const noteBoxes: SvgBox[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of scenario.notes) noteBoxes.push(textBox(note(id), id))
    }
    expect(noteBoxes.map(({ id }) => id)).toEqual(noteIds)
    for (const box of noteBoxes) {
      expect(contains(groupBox(noteOwner[box.id]), box), box.id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
      for (const group of groupIds) expect(overlaps(box, groupLabelBox(group)), `${box.id} ↔ ${group} 라벨`).toBe(false)
      for (const other of noteBoxes.filter(({ id }) => id !== box.id)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 앞 칸의 변에서 시작해 뒤 칸의 변에서 끝나고, 칸 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<IpconfigOptionsDiagram />)
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

  // 요점: 「/flushdns」에서 선명한 뒤 상태 칸에 IP 주소 192.0.2.10이 그대로 있고 캐시의 이름 줄은 없다.
  // 「/release」에서 선명한 뒤 상태 칸에는 IP 주소 값이 없다. DHCP 서버로 가는 경로는 /release·/renew에서만 보인다.
  it('/flushdns 뒤에도 IP 주소는 그대로이고, /release 뒤에는 IP 주소가 없으며, DHCP 서버와 잇는 화살표는 주소를 다루는 옵션에만 있다', async () => {
    render(<IpconfigOptionsDiagram />)
    const serverPaths = Object.keys(pathEnds).filter((id) => pathEnds[id].includes('dhcp-server'))
    expect(serverPaths).toEqual(['release-to-server', 'renew-from-server'])
    const shownAfter = () => afterNodes.filter((id) => opacity(id) === '1').map(label)

    await select('/flushdns')
    const flushed = shownAfter()
    expect(flushed.some((name) => name.includes('192.0.2.10'))).toBe(true)
    expect(flushed.some((name) => name.includes('www.example.com'))).toBe(false)
    expect(flushed).toContain('DNS 캐시 · 비었음')
    expect(shownPaths().filter((id) => serverPaths.includes(id))).toEqual([])

    await select('/release')
    const released = shownAfter()
    expect(released).toEqual(['IP 주소 없음'])
    expect(released.some((name) => /\d/u.test(name))).toBe(false)
    expect(shownPaths()).toContain('release-to-server')
    // 주소를 돌려주는 화살표는 PC 쪽(뒤 상태 칸)에서 DHCP 서버로 간다.
    expect(onEdge(lineEnds(svg().querySelector('[data-path="release-to-server"]')!.getAttribute('d')!).end, nodeBox('dhcp-server'))).toBe(true)

    await select('/renew')
    expect(shownPaths()).toContain('renew-from-server')
    expect(onEdge(lineEnds(svg().querySelector('[data-path="renew-from-server"]')!.getAttribute('d')!).start, nodeBox('dhcp-server'))).toBe(true)

    await select('/displaydns')
    expect(shownPaths().filter((id) => serverPaths.includes(id))).toEqual([])
    expect(opacity('dhcp-server')).toBe('0.25')

    // 명령 전 칸은 맨 위 박스에 있고, 주소를 다루는 박스가 이름 캐시를 다루는 박스보다 위에 있다.
    expect(groupBox('before').y).toBeLessThan(groupBox('address').y)
    expect(groupBox('address').y).toBeLessThan(groupBox('cache').y)
    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const name of ['`/release`', '`/renew`', '`/displaydns`', '`/flushdns`', '`192.0.2.10` 그대로', '`www.example.com`', 'IP 주소가 없으므로', '`192.0.2.1`']) {
      expect(body, name).toContain(name)
    }
  })
}

describe('IpconfigOptionsDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('칸·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<IpconfigOptionsDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 436')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('/renew')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 320')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '/renew' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><IpconfigOptionsDiagram /><IpconfigOptionsDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '/release' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<IpconfigOptionsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['ipconfig-options']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(ipconfigOptionsScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = ipconfigOptionsScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 ipconfig의 옵션 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
