import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { TransportChoiceDiagram, transportChoiceScenarios } from './TransportChoiceDiagram'

const topicId = 'tcp-udp'
const anchorConceptId = `${topicId}.transport-choice`
const labels: Record<string, string> = {
  'crit-complete': '빠짐없이 차례대로',
  'crit-timely': '늦지 않게 · 짧은 질의',
  ftp: '파일 전송 FTP',
  http: '웹 HTTP/1.1',
  smtp: '메일 SMTP',
  ssh: '원격 접속 SSH',
  realtime: '실시간 음성·영상',
  dns: 'DNS 질의',
  dhcp: 'DHCP',
  tftp: 'TFTP',
}
const groupLabels: Record<string, string> = { tcp: 'TCP', udp: 'UDP' }
const noteLabels: Record<string, string> = {
  complete: '한 바이트만 빠져도 결과가 망가진다',
  timely: '재생할 때가 지나 닿은 조각은 쓸모가 없다',
  'short-query': '연결을 맺지 않고 곧바로 보낸다',
  'app-reliability': '블록마다 확인하고 사라지면 다시 보낸다',
}
// 곁말은 시나리오마다 하나씩, 자기 시나리오에서만 보인다.
const noteScenario: Record<string, string> = { complete: 'complete', timely: 'timely', 'short-query': 'short-query', 'app-reliability': 'app-reliability' }
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const criteria = ['crit-complete', 'crit-timely']
const apps = nodeIds.filter((id) => !criteria.includes(id))

const tallPaths: Record<string, string> = {
  'to-tcp': 'M66 40 V64',
  'to-udp': 'M202 40 V64',
}
const widePaths: Record<string, string> = {
  'to-tcp': 'M148 60 H164',
  'to-udp': 'M148 180 H164',
}
// 경로마다 출발과 도착. 출발은 기준 노드의 변이고, 도착은 그 기준으로 고르는 쪽 박스(그룹)의 변이다.
const ends: Record<string, [string, string]> = {
  'to-tcp': ['crit-complete', 'tcp'],
  'to-udp': ['crit-timely', 'udp'],
}

const question = '이 응용 프로그램은 TCP와 UDP 가운데 무엇을 쓸까?'
const figureName = '응용 프로그램이 무엇을 더 중요하게 보는지에 따라 TCP와 UDP 가운데 무엇을 쓰는지 보이는 도식'
const svgName = '빠짐없이 차례대로와 늦지 않게 · 짧은 질의 두 기준 노드, 파일 전송 FTP·웹 HTTP/1.1·메일 SMTP·원격 접속 SSH를 담은 TCP 박스, 실시간 음성·영상·DNS 질의·DHCP·TFTP를 담은 UDP 박스를 놓은 그림'
const idleCaption = '응용 프로그램이 무엇을 더 중요하게 보는지를 기준 노드 둘로, 그 기준에 따라 TCP를 쓰는 응용 프로그램과 UDP를 쓰는 응용 프로그램을 박스 둘로 나눠 놓았다. 버튼을 고르면 어느 기준에서 어느 응용 프로그램이 어느 쪽을 쓰는지 하나씩 볼 수 있다.'
const legend = 'TCP 박스와 UDP 박스 안의 노드 하나가 응용 프로그램 하나이고, 박스 밖의 두 노드는 고르는 기준이다. 화살표는 그 기준이 어느 박스로 이어지는지를 가리키고, 곁말은 그쪽을 쓰는 까닭이다.'
const expectedScenarios = [
  {
    id: 'complete', label: '빠짐없이',
    nodes: ['crit-complete', 'ftp', 'http', 'smtp', 'ssh'], paths: ['to-tcp'],
    caption: '받은 데이터가 한 바이트만 빠지거나 차례가 바뀌어도 결과가 망가지는 응용 프로그램은 TCP를 쓴다. 파일 전송의 FTP, 웹 페이지를 주고받는 HTTP/1.1, 메일을 보내는 SMTP, 원격 접속의 SSH가 그렇다.',
  },
  {
    id: 'timely', label: '늦지 않게',
    nodes: ['crit-timely', 'realtime'], paths: ['to-udp'],
    caption: '인터넷 전화나 화상 회의는 음성과 영상의 조각을 정해진 순간에 재생하므로, 재생할 때가 지나 닿은 조각은 쓸모가 없다. 잃은 조각을 다시 받느라 뒤 조각까지 기다리게 되는 TCP 대신 보통 UDP를 쓴다.',
  },
  {
    id: 'short-query', label: '짧은 질의',
    nodes: ['crit-timely', 'dns', 'dhcp'], paths: ['to-udp'],
    caption: 'DNS 질의는 질의 하나와 응답 하나로 끝나고, DHCP도 메시지 몇 개를 주고받으면 끝난다. 연결부터 맺으면 그만큼 응답이 늦어지므로 UDP로 연결을 맺지 않고 곧바로 보낸다. DNS는 응답이 클 때 등에는 TCP도 쓴다.',
  },
  {
    id: 'app-reliability', label: '응용이 맡는 확인',
    nodes: ['tftp'], paths: [],
    caption: 'TFTP는 UDP를 쓰면서도 블록마다 확인 응답을 받고, 블록이 사라지면 다시 보내게 한다. UDP 자체는 잃은 데이터를 되찾아 주지 않지만, 그 위의 응용 프로그램이 확인과 다시 보내기를 스스로 맡을 수 있다.',
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
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)
const brightNodes = () => nodeIds.filter((id) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
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

// 경로 끝이 닿은 곳 — 노드의 변이 먼저고, 아니면 박스(그룹)의 변이다.
const endAt = (point: { x: number, y: number }) => nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))
  ?? groupIds.find((id) => onEdge(point.x, point.y, groupBox(id)))
const groupLabelBox = (id: string) => textBox(svg().querySelector(`[data-group-label="${id}"]`)!, `${id}-label`)
// 응용 프로그램 노드가 든 박스. 어느 박스에도 들지 않으면 undefined다.
const groupOf = (id: string) => groupIds.find((group) => contains(groupBox(group), nodeBox(id)))

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 264] : [0, 0, 280, 280]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<TransportChoiceDiagram />)
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
    const { container } = render(<TransportChoiceDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(svg().querySelector(`[data-group-label="${id}"]`)!.textContent).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<TransportChoiceDiagram />)
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
    render(<TransportChoiceDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    expect(overlaps(groupBox('tcp'), groupBox('udp'))).toBe(false)
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const other of nodeIds.filter((other) => other !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    // 기준 노드는 두 박스 밖에, 응용 프로그램 노드는 두 박스 가운데 하나의 안에 놓인다.
    for (const id of criteria) for (const group of groupIds) expect(overlaps(nodeBox(id), groupBox(group)), `${id} ↔ ${group}`).toBe(false)
    for (const id of apps) expect(groupOf(id), id).toBeDefined()
    const groupTexts = groupIds.map((id) => {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      return box
    })
    const groupsBottom = Math.max(...groupIds.map((id) => groupBox(id).y + groupBox(id).height))
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const noteTexts = shownNotes().map((id) => {
        const element = note(id)!
        expect(element).toHaveAttribute('font-size', '9')
        expect(element).toHaveClass('fill-muted')
        const box = textBox(element, id)
        // 곁말은 두 박스 아래에 놓인다.
        expect(box.y, id).toBeGreaterThan(groupsBottom)
        return box
      })
      const texts = [...noteTexts, ...groupTexts]
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
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표 양 끝은 노드나 박스의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<TransportChoiceDiagram />)
    for (const [id, d] of Object.entries(paths)) {
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
      const { start, end } = lineEnds(d)
      expect(endAt(start), `${id} 시작`).toBe(ends[id][0])
      expect(endAt(end), `${id} 끝`).toBe(ends[id][1])
    }
    // 두 화살표는 서로 만나지 않는다.
    for (const a of segments(paths['to-tcp'])) {
      for (const b of segments(paths['to-udp'])) {
        const box = { id: '', x: Math.min(b.x1, b.x2), y: Math.min(b.y1, b.y2), width: Math.abs(b.x2 - b.x1), height: Math.abs(b.y2 - b.y1) }
        expect(touches(a, box)).toBe(false)
      }
    }
  })

  // 요점: 시나리오마다 선명한 응용 프로그램은 모두 한 박스 안에 있다 — 빠짐없이는 TCP 박스, 나머지 셋은 UDP 박스.
  // 두 박스의 응용 프로그램은 겹치지 않고, 화살표는 선명한 기준에서 그 응용 프로그램이 든 박스로 간다.
  it('기준에 따라 선명한 응용 프로그램이 한쪽 박스에만 모이고, 화살표가 그 박스로 간다', async () => {
    render(<TransportChoiceDiagram />)
    const tcpApps = apps.filter((id) => groupOf(id) === 'tcp')
    const udpApps = apps.filter((id) => groupOf(id) === 'udp')
    expect(tcpApps).toEqual(['ftp', 'http', 'smtp', 'ssh'])
    expect(udpApps).toEqual(['realtime', 'dns', 'dhcp', 'tftp'])
    expect(tcpApps.filter((id) => udpApps.includes(id))).toEqual([])

    const expectedGroup: Record<string, string> = { complete: 'tcp', timely: 'udp', 'short-query': 'udp', 'app-reliability': 'udp' }
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const brightApps = brightNodes().filter((id) => apps.includes(id))
      expect(brightApps.length, scenario.id).toBeGreaterThan(0)
      expect(new Set(brightApps.map(groupOf)), scenario.id).toEqual(new Set([expectedGroup[scenario.id]]))
      for (const id of shownPaths()) {
        const { start, end } = lineEnds(paths[id])
        expect(brightNodes(), `${scenario.id} ${id}`).toContain(endAt(start))
        expect(endAt(end), `${scenario.id} ${id}`).toBe(expectedGroup[scenario.id])
      }
    }
    // 빠짐없이를 고르면 TCP 박스의 응용 프로그램이 모두 선명하다.
    await select('빠짐없이')
    expect(brightNodes().filter((id) => apps.includes(id))).toEqual(tcpApps)

    // 그림의 짝과 기준은 본문이 말한 것이다.
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join('\n')
    expect(body).toContain('한 바이트만 빠지거나 차례가 바뀌어도 결과가 망가지는 응용 프로그램은 TCP를 쓴다')
    expect(body).toContain('HTTP/1.1은 기본으로 TCP를 쓴다')
    expect(body).toContain('SSH(Secure Shell)도 보통 TCP 위에서 동작한다')
    expect(body).toContain('재생할 때가 지나 닿은 조각은 쓸모가 없다')
    expect(body).toContain('실시간 음성·영상은 보통 UDP로 보내고')
    expect(body).toContain('UDP로는 연결을 맺지 않고 곧바로 보낸다')
    expect(body).toContain('DHCP도 메시지 몇 개를 주고받으면 끝나는 일이고, UDP를 쓴다')
    expect(body).toContain('블록마다 확인 응답을 받고 나서야 다음 블록을 보낸다')
    expect(body).toContain('사라진 블록을 다시 보낸다')
    expect(body).toContain('늦지 않게')
    expect(body).toContain('짧은 질의')
  })
}

describe('TransportChoiceDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<TransportChoiceDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 280')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('짧은 질의')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 264')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '짧은 질의' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><TransportChoiceDiagram /><TransportChoiceDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '빠짐없이' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<TransportChoiceDiagram />)
    const text = visualsByTopicId[topicId].diagrams['transport-choice']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(transportChoiceScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = transportChoiceScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 TCP와 UDP를 고르는 기준 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
