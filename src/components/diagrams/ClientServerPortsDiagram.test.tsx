import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ClientServerPortsDiagram, clientServerPortsScenarios } from './ClientServerPortsDiagram'

const topicId = 'ports'
const anchorConceptId = `${topicId}.client-server-ports`
const labels: Record<string, string> = {
  'client-1': '192.0.2.10:50001',
  'client-2': '192.0.2.11:50001',
  server: '198.51.100.10:80',
  'req-src': '출발지 포트 50001',
  'req-dst': '목적지 포트 80',
  'res-src': '출발지 포트 80',
  'res-dst': '목적지 포트 50001',
}
const groupLabels: Record<string, string> = {
  'client-1-host': '웹 브라우저',
  'client-2-host': '웹 브라우저',
  'server-host': '웹 서버 프로그램',
  request: '요청',
  response: '응답',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const clientIds = ['client-1', 'client-2']

const tallPaths: Record<string, string> = {
  'request-out': 'M72 56 V104',
  'request-in': 'M72 168 V192 H110 V216',
  'response-out': 'M170 216 V192 H208 V168',
  'response-in': 'M208 104 V80 H100 V56',
}
const widePaths: Record<string, string> = {
  'request-out': 'M130 40 H166',
  'request-in': 'M282 72 H296 V92 H310',
  'response-out': 'M310 108 H296 V168 H282',
  'response-in': 'M166 136 H148 V48 H130',
}
// 경로마다 출발 노드와 도착 노드. 요청은 웹 브라우저 → 요청 → 웹 서버 프로그램, 응답은 그 거꾸로다.
const ends: Record<string, [string, string]> = {
  'request-out': ['client-1', 'req-src'],
  'request-in': ['req-dst', 'server'],
  'response-out': ['server', 'res-dst'],
  'response-in': ['res-src', 'client-1'],
}
// 노드마다 들어 있어야 할 그룹.
const membership: Record<string, string> = {
  'client-1': 'client-1-host', 'client-2': 'client-2-host', server: 'server-host',
  'req-src': 'request', 'req-dst': 'request', 'res-src': 'response', 'res-dst': 'response',
}

const question = '응답은 어느 포트로 돌아올까?'
const figureName = '클라이언트의 웹 브라우저가 서버의 웹 서버 프로그램에 보낸 요청과 돌아온 응답의 포트 번호, 그리고 같은 서버 포트에 이어진 두 번째 클라이언트를 보이는 도식'
const svgName = '웹 브라우저 192.0.2.10:50001과 192.0.2.11:50001, 웹 서버 프로그램 198.51.100.10:80, 요청의 출발지 포트 50001과 목적지 포트 80, 응답의 출발지 포트 80과 목적지 포트 50001'
const idleCaption = '두 클라이언트의 웹 브라우저와 서버의 웹 서버 프로그램, 그리고 요청과 응답에 적히는 포트 번호를 놓았다. 버튼을 고르면 요청과 응답이 오가는 차례와, 같은 서버 포트에 클라이언트 둘이 이어진 모습을 볼 수 있다.'
const legend = '얇은 선 박스는 프로그램과 그 프로그램이 주고받는 데이터다. 프로그램 박스 안 노드는 그 프로그램이 쓰는 IP 주소:포트이고, 요청·응답 박스 안 노드는 그 데이터에 적힌 출발지 포트와 목적지 포트다. 화살표는 데이터가 가는 방향이다.'
const expectedScenarios = [
  {
    id: 'request', label: '요청',
    nodes: ['client-1', 'server', 'req-src', 'req-dst'], paths: ['request-out', 'request-in'],
    caption: '웹 브라우저는 운영체제가 골라 준 50001을 출발지 포트로, 웹 서버 프로그램이 기다리는 80을 목적지 포트로 적어 요청을 보낸다. 서버의 전송 계층은 목적지 포트 80을 보고 요청을 웹 서버 프로그램에게 넘긴다.',
  },
  {
    id: 'response', label: '응답',
    nodes: ['client-1', 'server', 'res-src', 'res-dst'], paths: ['response-out', 'response-in'],
    caption: '웹 서버 프로그램은 요청의 두 번호를 맞바꿔 출발지 포트 80, 목적지 포트 50001로 응답을 보낸다. 클라이언트의 전송 계층은 목적지 포트 50001을 보고 응답을 웹 브라우저에게 넘긴다.',
  },
  {
    id: 'two-clients', label: '두 클라이언트',
    nodes: ['client-1', 'client-2', 'server'], paths: [],
    caption: '두 클라이언트의 운영체제가 같은 50001을 골라도 IP 주소가 192.0.2.10과 192.0.2.11로 달라서, 서버는 둘을 다른 상대로 본다. 연결은 양쪽의 IP 주소와 포트 번호 넷으로 정해진다.',
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
const brightNodes = () => nodeIds.filter((id) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)

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
const groupLabelBox = (id: string) => textBox(svg().querySelector(`[data-group-label="${id}"]`)!, `${id}-label`)

// `주소:포트`나 `출발지 포트 번호` 꼴의 글에서 포트 번호와 주소를 꺼낸다.
const portOf = (text: string) => text.match(/(\d+)$/u)![1]
const addressOf = (text: string) => text.split(':')[0]

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 200] : [0, 0, 280, 264]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<ClientServerPortsDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표 없이 선택 안내가 나온다', () => {
    const { container } = render(<ClientServerPortsDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(svg().querySelector(`[data-group-label="${id}"]`)!.textContent).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표만 선명하고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<ClientServerPortsDiagram />)
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
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·그룹 라벨이 자리에 들어간다`, () => {
    render(<ClientServerPortsDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      expect(contains(groupBox(membership[id]), nodeBox(id)), id).toBe(true)
    }
    for (let i = 0; i < nodeIds.length; i += 1) {
      for (const other of nodeIds.slice(i + 1)) expect(overlaps(nodeBox(nodeIds[i]), nodeBox(other)), `${nodeIds[i]} ↔ ${other}`).toBe(false)
    }
    for (let i = 0; i < groupIds.length; i += 1) {
      for (const other of groupIds.slice(i + 1)) expect(overlaps(groupBox(groupIds[i]), groupBox(other)), `${groupIds[i]} ↔ ${other}`).toBe(false)
    }
    const texts = groupIds.map((id) => {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      return box
    })
    for (const box of texts) {
      expect(box.x, box.id).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width, box.id).toBeLessThanOrEqual(viewBox[2])
      expect(box.y, box.id).toBeGreaterThanOrEqual(0)
      expect(box.y + box.height, box.id).toBeLessThanOrEqual(viewBox[3])
      for (const id of nodeIds) expect(overlaps(box, nodeBox(id)), `${box.id} ↔ ${id}`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나거나 같은 시나리오의 다른 화살표와 만나지 않는다', async () => {
    render(<ClientServerPortsDiagram />)
    for (const [id, d] of Object.entries(paths)) {
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
      const { start, end } = lineEnds(d)
      expect(nodeAt(start), `${id} 시작`).toBe(ends[id][0])
      expect(nodeAt(end), `${id} 끝`).toBe(ends[id][1])
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

  // 요점: 요청에 적힌 출발지·목적지 포트가 응답에서는 서로 바뀌어 있고, 요청은 웹 브라우저에서 웹 서버 프로그램으로, 응답은 그 거꾸로 간다.
  // 두 클라이언트는 포트 번호가 같고 IP 주소가 달라서 서버가 둘을 가린다. 값은 개념 본문의 예에 있다.
  it('응답은 요청의 두 포트를 맞바꾸고, 두 클라이언트는 포트가 같아도 IP 주소로 갈린다', async () => {
    render(<ClientServerPortsDiagram />)
    const [requestSource, requestDestination] = [portOf(label('req-src')), portOf(label('req-dst'))]
    expect(requestSource).toBe(portOf(label('client-1')))
    expect(requestDestination).toBe(portOf(label('server')))
    expect(portOf(label('res-src'))).toBe(requestDestination)
    expect(portOf(label('res-dst'))).toBe(requestSource)
    expect(requestSource).not.toBe(requestDestination)

    await select('요청')
    expect(shownPaths().map((id) => [nodeAt(lineEnds(paths[id]).start), nodeAt(lineEnds(paths[id]).end)])).toEqual([['client-1', 'req-src'], ['req-dst', 'server']])
    await select('응답')
    expect(shownPaths().map((id) => [nodeAt(lineEnds(paths[id]).start), nodeAt(lineEnds(paths[id]).end)])).toEqual([['server', 'res-dst'], ['res-src', 'client-1']])

    await select('두 클라이언트')
    const clients = brightNodes().filter((id) => clientIds.includes(id))
    expect(clients).toEqual(clientIds)
    expect(portOf(label(clients[0]))).toBe(portOf(label(clients[1])))
    expect(addressOf(label(clients[0]))).not.toBe(addressOf(label(clients[1])))
    expect(brightNodes()).toContain('server')

    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join('\n')
    for (const id of [...clientIds, 'server']) expect(body).toContain(`\`${labels[id]}\``)
    expect(body).toContain('출발지 포트 `50001`과 목적지 포트 `80`이 적혀')
    expect(body).toContain('두 번호를 맞바꿔 출발지 포트 `80`과 목적지 포트 `50001`이 적히고')
    expect(body).toContain('그 호스트의 운영체제도 `50001`번을 골랐다고 하자')
  })
}

describe('ClientServerPortsDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<ClientServerPortsDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 264')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('응답')
      const tallShown = shownPaths()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 200')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '응답' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><ClientServerPortsDiagram /><ClientServerPortsDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '요청' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<ClientServerPortsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['client-server-ports']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(clientServerPortsScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
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
      const scenario = clientServerPortsScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 서버 포트와 클라이언트 포트 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
