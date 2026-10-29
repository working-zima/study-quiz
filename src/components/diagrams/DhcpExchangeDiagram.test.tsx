import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { DhcpExchangeDiagram, dhcpExchangeScenarios } from './DhcpExchangeDiagram'

const topicId = 'ip-address-types'
const anchorConceptId = `${topicId}.dhcp-messages`
const labels: Record<string, string> = {
  'client-1': '클라이언트',
  'server-1': 'DHCP 서버',
  'client-2': '클라이언트',
  'server-2': 'DHCP 서버',
}
const noteLabels: Record<string, string> = {
  discover: 'Discover · 브로드캐스트',
  'discover-address': '출발지 0.0.0.0 · 목적지 255.255.255.255',
  offer: 'Offer · 줄 주소와 설정을 제안',
  request: 'Request · 브로드캐스트',
  'request-server': '고른 서버를 서버 식별자로 알린다',
  ack: 'ACK · 주소를 확정',
}
// 곁말은 늘 보이고, 자기 줄 클라이언트의 흐림을 따른다.
const noteOwner: Record<string, string> = {
  discover: 'client-1',
  'discover-address': 'client-1',
  offer: 'client-1',
  request: 'client-2',
  'request-server': 'client-2',
  ack: 'client-2',
}
const nodeIds = Object.keys(labels)
const noteIds = Object.keys(noteLabels)

const tallPaths: Record<string, string> = {
  discover: 'M96 48 H184',
  offer: 'M184 64 H96',
  request: 'M96 152 H184',
  ack: 'M184 168 H96',
}
const widePaths: Record<string, string> = {
  discover: 'M120 48 H320',
  offer: 'M320 64 H120',
  request: 'M120 152 H320',
  ack: 'M320 168 H120',
}
// 경로마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  discover: ['client-1', 'server-1'],
  offer: ['server-1', 'client-1'],
  request: ['client-2', 'server-2'],
  ack: ['server-2', 'client-2'],
}
const order = ['discover', 'offer', 'request', 'ack']

const question = '처음 주소를 받을 때 어떤 메시지가 어떤 차례로 오갈까?'
const figureName = '주소가 없는 클라이언트와 DHCP 서버 사이에 Discover, Offer, Request, ACK가 차례로 오가는 도식'
const svgName = '위 줄은 클라이언트와 DHCP 서버 사이에 오가는 Discover와 Offer, 아래 줄은 같은 둘 사이에 그다음 오가는 Request와 ACK'
const idleCaption = '같은 클라이언트와 DHCP 서버를 두 줄로 그렸다. 위 줄의 두 메시지가 먼저 오가고 아래 줄의 두 메시지가 그다음에 오간다. 버튼을 고르면 서버를 찾는 두 메시지와 주소를 확정하는 두 메시지를 따로 볼 수 있다.'
const legend = '화살표는 메시지가 가는 방향이고, 아래 줄로 갈수록 나중에 오가는 메시지다. 곁말은 메시지의 이름과 보내는 방식이나 내용이다.'
const expectedScenarios = [
  {
    id: 'find', label: '서버 찾기',
    nodes: ['client-1', 'server-1'], paths: ['discover', 'offer'],
    caption: '주소가 없는 클라이언트는 출발지를 0.0.0.0, 목적지를 255.255.255.255로 적은 Discover를 브로드캐스트한다. 서버의 주소를 몰라도 같은 네트워크의 DHCP 서버에게 닿고, 서버는 줄 수 있는 주소와 설정을 Offer로 제안한다.',
  },
  {
    id: 'confirm', label: '확정',
    nodes: ['client-2', 'server-2'], paths: ['request', 'ack'],
    caption: '클라이언트는 고른 제안을 Request로 요청한다. Request도 브로드캐스트라 고르지 않은 서버들도 받아 자기 제안이 골라지지 않았음을 안다. 고른 서버가 ACK로 주소를 확정하면 클라이언트는 그 주소를 쓴다.',
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
const label = (id: string) => svg().querySelector(`[data-node="${id}"] text`)!.textContent!
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const noteText = (id: string) => svg().querySelector(`[data-note="${id}"]`)!.textContent!

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 204] : [0, 0, 280, 204]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<DhcpExchangeDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 곁말이 모두 선명하고 화살표 없이 선택 안내가 나온다', () => {
    const { container } = render(<DhcpExchangeDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node], [data-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note'))).toEqual(noteIds)
    for (const id of noteIds) expect(noteText(id)).toBe(noteLabels[id])
    expect(svg().querySelectorAll('[data-group]')).toHaveLength(0)
    expect(shownPaths()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 줄의 노드·화살표·곁말만 선명하다', async (scenario) => {
    const { container } = render(<DhcpExchangeDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    for (const [id, owner] of Object.entries(noteOwner)) {
      expect(svg().querySelector(`[data-note="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(owner) ? '1' : '0.25')
    }
    expect(shownPaths()).toEqual(scenario.paths)
    for (const path of svg().querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('d', paths[path.getAttribute('data-path')!])
      expect(path).toHaveAttribute('stroke-width', '2')
      expect(path).toHaveClass('stroke-title')
      expect(path).toHaveAttribute('marker-end', `url(#${svg().querySelector('marker')!.id})`)
      expect(path.closest('[opacity]')).toBeNull()
    }
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨과 곁말이 자리에 들어간다`, () => {
    render(<DhcpExchangeDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
    }
    for (let i = 0; i < nodeIds.length; i += 1) {
      for (const other of nodeIds.slice(i + 1)) expect(overlaps(nodeBox(nodeIds[i]), nodeBox(other)), `${nodeIds[i]} ↔ ${other}`).toBe(false)
    }
    const texts = Array.from(svg().querySelectorAll('[data-note]'), (note) => {
      expect(note).toHaveAttribute('font-size', '9')
      expect(note).toHaveClass('fill-muted')
      return textBox(note, note.getAttribute('data-note')!)
    })
    expect(texts).toHaveLength(noteIds.length)
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

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나거나 다른 화살표와 만나지 않는다', async () => {
    render(<DhcpExchangeDiagram />)
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const lines = shownPaths()
      for (const id of lines) {
        const d = paths[id]
        for (const segment of segments(d)) {
          for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
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

  // 요점: 서버 찾기에서 보이는 화살표는 Discover(클라이언트에서 시작)와 Offer(서버에서 시작)이고 Discover의 곁말은 브로드캐스트다.
  // 확정에서는 Request(클라이언트에서 시작)와 ACK(서버에서 시작)이고 Request도 브로드캐스트다.
  // 네 화살표는 위에서 아래로 Discover → Offer → Request → ACK 차례다. 이 차례와 주소는 개념 본문에 있다.
  it('네 메시지는 위에서 아래로 Discover → Offer → Request → ACK이고, 클라이언트가 보내는 둘이 브로드캐스트다', async () => {
    render(<DhcpExchangeDiagram />)
    const kind = (id: string) => labels[nodeAt(lineEnds(paths[id]).start)!]

    await select('서버 찾기')
    expect(shownPaths().map(kind)).toEqual(['클라이언트', 'DHCP 서버'])
    expect(noteText('discover')).toContain('브로드캐스트')
    expect(noteText('discover-address')).toContain('0.0.0.0')
    expect(noteText('discover-address')).toContain('255.255.255.255')

    await select('확정')
    expect(shownPaths().map(kind)).toEqual(['클라이언트', 'DHCP 서버'])
    expect(noteText('request')).toContain('브로드캐스트')

    const heights = order.map((id) => segments(paths[id])[0].y1)
    expect([...heights].sort((a, b) => a - b)).toEqual(heights)
    expect(new Set(heights).size).toBe(order.length)
    expect(order.map((id) => noteText(id).split(' · ')[0])).toEqual(['Discover', 'Offer', 'Request', 'ACK'])

    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join('\n')
    expect(body).toContain('출발지 주소에 `0.0.0.0`을 적고, 서버의 주소를 모르므로 목적지 주소에 `255.255.255.255`를 적어 브로드캐스트한다')
    expect(body).toContain('고른 서버를 서버 식별자로 적고, Discover와 같이 목적지 `255.255.255.255`로 브로드캐스트한다')
    expect(body).toContain('줄 수 있는 IP 주소와 설정 값을 제안하는 메시지다')
    expect(body).toContain('고른 DHCP 서버가 주소를 확정해 클라이언트에게 알리는 메시지다')
    const items = concept.paragraphs.filter((paragraph) => paragraph.startsWith('- **'))
    expect(items.map((item) => item.match(/^- \*\*(\w+)\*\*/u)![1])).toEqual(['Discover', 'Offer', 'Request', 'ACK'])
  })
}

describe('DhcpExchangeDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<DhcpExchangeDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 204')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      await select('서버 찾기')
      const tallFind = shownPaths()
      await select('확정')
      const tallConfirm = shownPaths()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 204')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(screen.getByRole('button', { name: '확정' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallConfirm)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      await select('서버 찾기')
      expect(shownPaths()).toEqual(tallFind)
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><DhcpExchangeDiagram /><DhcpExchangeDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '서버 찾기' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<DhcpExchangeDiagram />)
    const text = visualsByTopicId[topicId].diagrams['dhcp-exchange']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(dhcpExchangeScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toBeUndefined()
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
      const scenario = dhcpExchangeScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 DHCP 메시지 교환 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
