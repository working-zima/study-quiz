import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { VpnProtocolLayersDiagram, vpnProtocolLayersScenarios } from './VpnProtocolLayersDiagram'

const topicId = 'network-security'
const anchorConceptId = `${topicId}.vpn-protocols`
const labels: Record<string, string> = {
  'tl': '전송 계층',
  'nl': '네트워크 계층',
  'dl': '데이터 링크 계층',
  'ssl': 'SSL/TLS VPN',
  'ipsec': 'IPsec',
  'pptp': 'PPTP',
  'l2tp': 'L2TP',
}
const noteLabels: Record<string, string> = {
  'layer2-note': 'PPP 프레임을 담아 IP 네트워크로 나른다',
  'l2tp-note': 'L2TP는 IPsec과 함께 써서 지킨다',
  'layer3-note': 'IP 패킷 하나하나를 지킨다',
  'tls-note': 'TLS로 감싸 보낸다',
}
const nodeIds = Object.keys(labels)
const noteIds = Object.keys(noteLabels)
const layerIds = ['tl', 'nl', 'dl']
const protocolIds = ['ssl', 'ipsec', 'pptp', 'l2tp']
// 화살표는 프로토콜에서 나가 그 프로토콜이 터널을 만드는 계층 칸에서 끝난다.
const pathEnds: Record<string, [string, string]> = {
  'ssl-tl': ['ssl', 'tl'],
  'ipsec-nl': ['ipsec', 'nl'],
  'pptp-dl': ['pptp', 'dl'],
  'l2tp-dl': ['l2tp', 'dl'],
}
const tallPaths: Record<string, string> = {
  'ssl-tl': 'M152 40 H128',
  'ipsec-nl': 'M152 88 H128',
  'pptp-dl': 'M152 136 H128',
  'l2tp-dl': 'M238 152 V164 H72 V152',
}
const widePaths: Record<string, string> = {
  'ssl-tl': 'M200 40 H160',
  'ipsec-nl': 'M200 88 H160',
  'pptp-dl': 'M200 136 H160',
  'l2tp-dl': 'M368 152 V164 H88 V152',
}

const question = 'VPN 프로토콜은 어느 계층에서 터널을 만들까?'
const figureName = 'PPTP·L2TP·IPsec·SSL/TLS VPN 네 VPN 프로토콜을, 각 프로토콜이 터널을 만드는 데이터 링크·네트워크·전송 계층의 칸에 이어 보이는 도식'
const svgName = '왼쪽에 아래에서 위로 쌓은 계층 칸 셋(데이터 링크·네트워크·전송), 오른쪽에 VPN 프로토콜 넷을 둔 그림'
const idleCaption = 'VPN 프로토콜 넷을, 아래에서 위로 쌓은 계층 칸 셋 옆에 두었다. 버튼을 고르면 각 프로토콜이 어느 계층에서 터널을 만드는지 볼 수 있다.'
const legend = '칸 하나가 계층 하나이고, 아래에 있을수록 낮은 계층이다. 화살표는 그 프로토콜이 터널을 만드는 계층을 가리킨다. 이 개념과 관계있는 세 계층만 그렸고, 계층의 경계가 늘 분명하지는 않다.'
const expectedScenarios = [
  {
    id: 'layer2', label: 'PPTP·L2TP',
    nodes: ['dl', 'pptp', 'l2tp'],
    paths: ['pptp-dl', 'l2tp-dl'],
    notes: ['layer2-note', 'l2tp-note'],
    caption: 'PPTP와 L2TP는 데이터 링크 계층의 데이터인 PPP 프레임을 통째로 담아 IP 네트워크 너머로 나르므로, 데이터 링크 계층의 터널을 만든다. 둘 다 스스로 데이터를 지키지 않아, L2TP는 IPsec과 함께 L2TP/IPsec으로 쓴다.',
  },
  {
    id: 'layer3', label: 'IPsec',
    nodes: ['nl', 'ipsec'],
    paths: ['ipsec-nl'],
    notes: ['layer3-note'],
    caption: 'IPsec은 네트워크 계층, 곧 IP 계층에서 IP 패킷 하나하나를 지킨다. 패킷을 보낸 쪽이 맞는지와 오는 길에 바뀌지 않았는지를 받는 쪽이 확인하게 하고, 내용을 암호화할 수 있다.',
  },
  {
    id: 'tls', label: 'SSL/TLS VPN',
    nodes: ['tl', 'ssl'],
    paths: ['ssl-tl'],
    notes: ['tls-note'],
    caption: 'SSL/TLS VPN은 컴퓨터가 VPN으로 보내는 IP 패킷을 TCP 연결 위의 TLS로 감싸 보낸다. NIST의 VPN 지침은 이것을 전송 계층 VPN으로 묶으면서도, 감싸 보내는 것이 IP 패킷이라 네트워크 계층에서 일한다고도 적는다.',
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
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note')!)
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)!
const opacity = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

// 곁말(9)의 가로 범위. 반각 문자가 섞이므로 어림값의 1.15배로 잡는다.
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

// 두 선분이 같은 직선 위에 있고 길이가 있는 구간을 함께 쓰는가.
function collinearOverlap(a: Segment, b: Segment) {
  const shared = (a1: number, a2: number, b1: number, b2: number) => Math.min(Math.max(a1, a2), Math.max(b1, b2)) - Math.max(Math.min(a1, a2), Math.min(b1, b2)) > 0
  if (a.x1 === a.x2 && b.x1 === b.x2 && a.x1 === b.x1) return shared(a.y1, a.y2, b.y1, b.y2)
  if (a.y1 === a.y2 && b.y1 === b.y2 && a.y1 === b.y1) return shared(a.x1, a.x2, b.x1, b.x2)
  return false
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

// 보이는 화살표가 어느 노드의 변에서 시작하고 어느 노드의 변에서 끝나는지 그림에서 읽는다.
function endpointNodes(point: { x: number, y: number }) {
  return nodeIds.filter((id) => onEdge(point, nodeBox(id)))
}

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 212] : [0, 0, 280, 212]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<VpnProtocolLayersDiagram />)
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
    const { container } = render(<VpnProtocolLayersDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<VpnProtocolLayersDiagram />)
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
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말이 자리에 들어간다`, async () => {
    render(<VpnProtocolLayersDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    // 곁말은 고른 시나리오의 것만 보인다. 함께 보이는 곁말끼리는 겹치지 않고, 어느 곁말도 노드·선과 겹치지 않는다.
    const seen = new Set<string>()
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const shown = shownNotes().map((id) => textBox(note(id), id))
      for (const box of shown) seen.add(box.id)
      expect(boxesOutsideViewBox(shown, viewBox)).toEqual([])
      for (const box of shown) {
        for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
        for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
        for (const other of shown.filter((otherBox) => otherBox.id !== box.id)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
      }
    }
    expect([...seen].sort()).toEqual([...noteIds].sort())
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 프로토콜의 변에서 시작해 계층 칸의 변에서 끝나고, 노드 안을 지나지 않으며 서로 겹치지 않는다', () => {
    render(<VpnProtocolLayersDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(pathEnds)))
    for (const [id, d] of Object.entries(paths)) {
      const { start, end } = lineEnds(d)
      expect(endpointNodes(start), `${id} 시작`).toEqual([pathEnds[id][0]])
      expect(endpointNodes(end), `${id} 끝`).toEqual([pathEnds[id][1]])
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
      }
    }
    const ids = Object.keys(paths)
    for (const a of ids) for (const b of ids.filter((other) => other !== a)) {
      for (const sa of segments(paths[a])) for (const sb of segments(paths[b])) expect(collinearOverlap(sa, sb), `${a} ↔ ${b}`).toBe(false)
    }
  })

  // 요점: 계층 칸은 위에서부터 전송 → 네트워크 → 데이터 링크로 쌓인다. 세 시나리오에서 선명한 프로토콜은 서로 겹치지 않고 합치면 넷 전부이며,
  // 시나리오마다 선명한 계층 칸은 하나이고 보이는 화살표는 모두 그 시나리오의 프로토콜에서 나가 그 칸에서 끝난다.
  // PPTP·L2TP는 IPsec보다 아래(낮은 계층)에 닿는다.
  it('프로토콜마다 터널을 만드는 계층이 다르고, PPTP·L2TP는 IPsec보다 낮은 계층에 닿는다', async () => {
    render(<VpnProtocolLayersDiagram />)
    expect(nodeBox('tl').y).toBeLessThan(nodeBox('nl').y)
    expect(nodeBox('nl').y).toBeLessThan(nodeBox('dl').y)

    const litProtocols: string[][] = []
    const litLayer: Record<string, string> = {}
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const lit = nodeIds.filter((id) => opacity(id) === '1')
      const protocols = lit.filter((id) => protocolIds.includes(id))
      const layers = lit.filter((id) => layerIds.includes(id))
      expect(layers, scenario.id).toHaveLength(1)
      litProtocols.push(protocols)
      litLayer[scenario.id] = layers[0]
      expect(shownPaths().length, scenario.id).toBe(protocols.length)
      for (const id of shownPaths()) {
        const { start, end } = lineEnds(paths[id])
        expect(protocols, `${id} 시작`).toContain(endpointNodes(start)[0])
        expect(endpointNodes(end), `${id} 끝`).toEqual([layers[0]])
      }
    }
    const flat = litProtocols.flat()
    expect(new Set(flat).size).toBe(flat.length)
    expect(new Set(flat)).toEqual(new Set(protocolIds))
    expect(litLayer).toEqual({ layer2: 'dl', layer3: 'nl', tls: 'tl' })
    for (const id of ['pptp', 'l2tp']) expect(nodeBox(id).y, id).toBeGreaterThan(nodeBox('ipsec').y)

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const phrase of ['PPP 프레임을 통째로 담아 IP 네트워크 너머로 나르므로, 데이터 링크 계층의 터널을 만든다', 'IPsec은 IP 패킷을 지키므로 네트워크 계층의 방법이다', 'NIST의 VPN 지침은 이것을 전송 계층 VPN으로 묶는다', '이렇게 짝지은 것을 L2TP/IPsec이라 부른다']) {
      expect(body, phrase).toContain(phrase)
    }
  })
}

describe('VpnProtocolLayersDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<VpnProtocolLayersDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 212')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      await select('PPTP·L2TP')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 212')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(screen.getByRole('button', { name: 'PPTP·L2TP' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><VpnProtocolLayersDiagram /><VpnProtocolLayersDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'PPTP·L2TP' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<VpnProtocolLayersDiagram />)
    const text = visualsByTopicId[topicId].diagrams['vpn-protocol-layers']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(vpnProtocolLayersScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    expect(text.nodes).toEqual(labels)
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
      const scenario = vpnProtocolLayersScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 VPN 프로토콜 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
