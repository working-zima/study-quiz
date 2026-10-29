import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { DhcpLeaseDiagram, dhcpLeaseScenarios } from './DhcpLeaseDiagram'

const topicId = 'ip-address-types'
const anchorConceptId = `${topicId}.dhcp`
const labels: Record<string, string> = {
  server: 'DHCP 서버',
  pc: 'PC',
  ip: 'IP 주소 192.168.0.10',
  mask: '서브넷 마스크 255.255.255.0',
  gateway: '기본 게이트웨이 192.168.0.1',
  dns: 'DNS 서버의 주소',
}
const groupLabels: Record<string, string> = { settings: '서버가 알려 주는 값' }
const settingIds = ['ip', 'mask', 'gateway', 'dns']
const noteLabels: Record<string, string> = {
  'server-address': '192.168.0.1',
  'lease-time': '임대 시간 8시간 동안 빌려준다',
  'renew-time': '4시간이 지나면 갱신 요청',
  'renew-ack': '서버가 임대를 늘려 준다',
}
// 서버의 주소 곁말은 서버의 흐림을 따른다. 나머지 곁말은 자기 시나리오에서만 보인다.
const noteOwner: Record<string, string> = { 'server-address': 'server' }
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)

const tallPaths: Record<string, string> = {
  lease: 'M24 40 V252',
  'renew-request': 'M48 252 V40',
  'renew-reply': 'M24 40 V252',
}
const widePaths: Record<string, string> = {
  lease: 'M120 32 H320',
  'renew-request': 'M320 48 H120',
  'renew-reply': 'M120 32 H320',
}
// 경로마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  lease: ['server', 'pc'],
  'renew-request': ['pc', 'server'],
  'renew-reply': ['server', 'pc'],
}

const question = 'DHCP 서버는 PC에게 무엇을 빌려줄까?'
const figureName = 'DHCP 서버가 PC에게 IP 주소와 설정 값을 임대 시간 동안 빌려주고, 임대가 끝나기 전에 PC가 임대를 늘려 달라고 요청하는 도식'
const svgName = 'DHCP 서버(사설 주소 192.168.0.1)와 PC, 서버가 PC에게 알려 주는 IP 주소 192.168.0.10, 서브넷 마스크 255.255.255.0, 기본 게이트웨이 192.168.0.1, DNS 서버의 주소'
const idleCaption = 'DHCP 서버와 PC, 그리고 서버가 PC에게 알려 주는 값 넷을 놓았다. 버튼을 고르면 서버가 주소와 설정을 빌려주는 임대와, 임대가 끝나기 전에 PC가 임대를 늘려 달라고 하는 갱신을 따로 볼 수 있다.'
const legend = '얇은 선 박스 안은 DHCP 서버가 PC에게 알려 주는 값이다. 화살표는 서버와 PC 사이에 메시지가 가는 방향이고, 곁말은 그때 오가는 내용이다.'
const expectedScenarios = [
  {
    id: 'lease', label: '임대',
    nodes: ['server', 'pc', 'ip', 'mask', 'gateway', 'dns'], paths: ['lease'],
    notes: ['lease-time'],
    caption: 'DHCP 서버는 PC에게 IP 주소 192.168.0.10과 서브넷 마스크, 기본 게이트웨이, DNS 서버의 주소를 알려 준다. 주소는 이 예에서 정한 임대 시간 8시간 동안만 빌려주는 것이고, 그동안 서버는 이 주소를 다른 클라이언트에게 주지 않는다.',
  },
  {
    id: 'renew', label: '갱신',
    nodes: ['server', 'pc'], paths: ['renew-request', 'renew-reply'],
    notes: ['renew-time', 'renew-ack'],
    caption: '임대 시간이 끝나기 전, 기본으로 절반인 4시간이 지나면 PC가 주소를 준 DHCP 서버에게 임대를 늘려 달라고 요청한다. 서버가 임대를 늘려 주면 PC는 같은 주소를 계속 쓴다.',
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
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const sharpNodes = () => Array.from(svg().querySelectorAll('[data-node]')).filter((node) => node.getAttribute('opacity') === '1').map((node) => node.getAttribute('data-node')!)
const scenarioNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note')!).filter((id) => !(id in noteOwner))
const noteText = (id: string) => svg().querySelector(`[data-note="${id}"]`)!.textContent!

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

const nodeAt = (point: { x: number, y: number }) => nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))

// 그룹 라벨이 차지하는 상자.
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 196] : [0, 0, 280, 292]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<DhcpLeaseDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 서버의 주소가 모두 선명하고 화살표와 시나리오 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<DhcpLeaseDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node], [data-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note'))).toEqual(Object.keys(noteOwner))
    for (const id of Object.keys(noteOwner)) expect(noteText(id)).toBe(noteLabels[id])
    expect(scenarioNotes()).toEqual([])
    for (const id of groupIds) expect(svg().querySelector(`[data-group-label="${id}"]`)!.textContent).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<DhcpLeaseDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    for (const [id, owner] of Object.entries(noteOwner)) {
      expect(svg().querySelector(`[data-note="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(owner) ? '1' : '0.25')
    }
    expect(scenarioNotes()).toEqual(scenario.notes)
    for (const id of scenario.notes) {
      expect(noteText(id)).toBe(noteLabels[id])
      expect(svg().querySelector(`[data-note="${id}"]`)!.closest('[opacity]')).toBeNull()
    }
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

  it.each(expectedScenarios)(`$label: 모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말·그룹 라벨이 자리에 들어간다`, async (scenario) => {
    render(<DhcpLeaseDiagram />)
    await select(scenario.label)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      // 설정 값 넷만 박스 안에 있고, DHCP 서버와 PC는 박스 밖에 있다.
      expect(contains(groupBox('settings'), nodeBox(id)), `${id} ⊂ settings`).toBe(settingIds.includes(id))
    }
    for (let i = 0; i < nodeIds.length; i += 1) {
      for (const other of nodeIds.slice(i + 1)) expect(overlaps(nodeBox(nodeIds[i]), nodeBox(other)), `${nodeIds[i]} ↔ ${other}`).toBe(false)
    }
    const groupTexts = groupIds.map((id) => {
      const text = svg().querySelector(`[data-group-label="${id}"]`)!
      expect(text).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      return box
    })
    const texts = [...Array.from(svg().querySelectorAll('[data-note]'), (note) => {
      expect(note).toHaveAttribute('font-size', '9')
      expect(note).toHaveClass('fill-muted')
      const box = textBox(note, note.getAttribute('data-note')!)
      for (const group of groupIds) expect(overlaps(groupBox(group), box), `${box.id} ↔ ${group}`).toBe(false)
      return box
    }), ...groupTexts]
    expect(texts).toHaveLength(Object.keys(noteOwner).length + scenario.notes.length + groupIds.length)
    for (const box of texts) {
      expect(box.x, box.id).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width, box.id).toBeLessThanOrEqual(viewBox[2])
      expect(box.y, box.id).toBeGreaterThanOrEqual(0)
      expect(box.y + box.height, box.id).toBeLessThanOrEqual(viewBox[3])
      for (const id of nodeIds) expect(overlaps(box, nodeBox(id)), `${box.id} ↔ ${id}`).toBe(false)
      for (const d of Object.values(paths)) {
        for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
      }
    }
    for (let i = 0; i < texts.length; i += 1) {
      for (const other of texts.slice(i + 1)) expect(overlaps(texts[i], other), `${texts[i].id} ↔ ${other.id}`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나거나 다른 화살표와 만나지 않는다', async () => {
    render(<DhcpLeaseDiagram />)
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const lines = shownPaths()
      for (const id of lines) {
        const d = paths[id]
        for (const segment of segments(d)) {
          for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
          for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
        }
        const { start, end } = lineEnds(d)
        expect(nodeAt(start), `${id} 시작`).toBe(ends[id][0])
        expect(nodeAt(end), `${id} 끝`).toBe(ends[id][1])
      }
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

  // 요점: 임대에서는 설정 값 넷이 모두 선명하고 그 라벨이 개념 본문의 예와 같으며, 화살표는 DHCP 서버에서 PC로 간다.
  // 갱신에서는 PC에서 서버로 가는 요청 화살표가 있고 설정 값은 흐리다. 두 시나리오의 화살표 집합이 다르다.
  // 임대 시간 8시간과 갱신을 요청하는 4시간(8의 절반)도 본문 예와 같다.
  it('임대는 설정 값 넷을 서버에서 PC로 주고, 갱신은 PC가 서버에게 먼저 요청한다', async () => {
    render(<DhcpLeaseDiagram />)
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join('\n').replace(/`/gu, '')

    await select('임대')
    const leaseSharp = sharpNodes()
    for (const id of settingIds) {
      expect(leaseSharp, id).toContain(id)
      expect(body, id).toContain(label(id))
    }
    const leaseHops = shownPaths().map((id) => [nodeAt(lineEnds(paths[id]).start), nodeAt(lineEnds(paths[id]).end)])
    expect(leaseHops).toEqual([['server', 'pc']])
    const leasePaths = shownPaths()

    await select('갱신')
    for (const id of settingIds) expect(sharpNodes(), id).not.toContain(id)
    const renewHops = shownPaths().map((id) => [nodeAt(lineEnds(paths[id]).start), nodeAt(lineEnds(paths[id]).end)])
    expect(renewHops).toContainEqual(['pc', 'server'])
    expect(new Set(shownPaths())).not.toEqual(new Set(leasePaths))

    const hours = Number(noteLabels['lease-time'].match(/(\d+)시간/u)![1])
    expect(Number(noteLabels['renew-time'].match(/(\d+)시간/u)![1])).toBe(hours / 2)
    expect(body).toContain('DHCP 서버(사설 주소 192.168.0.1)')
    expect(body).toContain('임대 시간 8시간 동안 빌려준다고')
    expect(body).toContain('PC는 4시간이 지났을 때 처음 요청하고')
    expect(body).toContain('기본으로 임대 시간의 절반이 지나면 주소를 준 DHCP 서버에게 임대를 늘려 달라고 요청한다')
    expect(body).toContain('서버가 임대를 늘려 주면 클라이언트는 같은 주소를 계속 쓴다')
  })
}

describe('DhcpLeaseDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<DhcpLeaseDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 292')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('임대')
      const tallLease = shownPaths()
      await select('갱신')
      const tallRenew = shownPaths()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 196')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '갱신' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallRenew)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(scenarioNotes()).toEqual(['renew-time', 'renew-ack'])
      await select('임대')
      expect(shownPaths()).toEqual(tallLease)
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><DhcpLeaseDiagram /><DhcpLeaseDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '갱신' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<DhcpLeaseDiagram />)
    const text = visualsByTopicId[topicId].diagrams['dhcp-lease']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(dhcpLeaseScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = dhcpLeaseScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 DHCP 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(within(figure).queryByRole('heading')).toBeNull()
  })
})
