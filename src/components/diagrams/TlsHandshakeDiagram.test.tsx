import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { TlsHandshakeDiagram, tlsHandshakeScenarios } from './TlsHandshakeDiagram'

const topicId = 'app-protocols-mgmt-security'
const anchorConceptId = `${topicId}.tls`
const labels: Record<string, string> = {
  browser: '웹 브라우저',
  server: 'www.example.com',
  'client-hello': 'ClientHello',
  'server-hello': 'ServerHello',
  certificate: 'Certificate',
  'cert-verify': 'CertificateVerify',
  'finished-s': 'Finished',
  'finished-c': 'Finished',
  request: '암호화된 요청',
  response: '암호화된 응답',
}
const groupLabels: Record<string, string> = {
  'client-side': '클라이언트',
  'server-side': '서버',
  'handshake-box': '핸드셰이크',
  'data-box': '핸드셰이크 뒤',
}
const noteLabels: Record<string, string> = {
  'hello-note': '암호 방식과 키를 정한다',
  'cert-note': '서버가 자신을 증명한다',
  'data-note': '암호화되어 오간다',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
const headIds = ['browser', 'server']
// 클라이언트 → 서버와 서버 → 클라이언트.
const toServerIds = ['client-hello', 'finished-c', 'request']
const toClientIds = ['server-hello', 'certificate', 'cert-verify', 'finished-s', 'response']
const messageIds = nodeIds.filter((id) => !headIds.includes(id))
const handshakeIds = ['client-hello', 'server-hello', 'certificate', 'cert-verify', 'finished-s', 'finished-c']
const dataIds = ['request', 'response']
const boxOf = (id: string) => (dataIds.includes(id) ? 'data-box' : 'handshake-box')
const noteOwner: Record<string, string> = { 'hello-note': 'server-hello', 'cert-note': 'cert-verify', 'data-note': 'response' }

const tallY: Record<string, number> = {
  'client-hello': 80, 'server-hello': 124, certificate: 180, 'cert-verify': 224, 'finished-s': 280, 'finished-c': 324, request: 400, response: 444,
}
function pathsFor(wide: boolean) {
  const [clientEdge, nodeLeft, nodeRight, serverEdge] = wide ? [96, 120, 320, 344] : [64, 76, 204, 216]
  const result: Record<string, string> = {}
  for (const id of messageIds) {
    const y = tallY[id] + 16
    if (toServerIds.includes(id)) {
      result[`${id}-out`] = `M${clientEdge} ${y} H${nodeLeft}`
      result[`${id}-in`] = `M${nodeRight} ${y} H${serverEdge}`
    } else {
      result[`${id}-out`] = `M${serverEdge} ${y} H${nodeRight}`
      result[`${id}-in`] = `M${nodeLeft} ${y} H${clientEdge}`
    }
  }
  return result
}
const tallPaths = pathsFor(false)
const widePaths = pathsFor(true)
const pathsOf = (ids: string[]) => ids.flatMap((id) => [`${id}-out`, `${id}-in`])

const question = 'TLS는 암호화하기 전에 무엇을 주고받을까?'
const figureName = '웹 브라우저가 www.example.com의 서버와 ClientHello·ServerHello로 인사하고, 서버가 Certificate·CertificateVerify로 자신을 증명하고, 두 쪽이 Finished로 핸드셰이크를 끝맺은 뒤 요청과 응답을 암호화해 주고받는 차례를 보이는 도식'
const svgName = '왼쪽 클라이언트 기둥과 오른쪽 서버 기둥 사이에, 위 박스에 ClientHello·ServerHello·Certificate·CertificateVerify·Finished·Finished를, 아래 박스에 암호화된 요청과 암호화된 응답을 차례로 놓은 그림'
const idleCaption = '웹 브라우저와 www.example.com의 서버가 TLS로 통신을 시작할 때 주고받는 메시지를 위에서 아래로 간추려 놓았다. 위 박스가 핸드셰이크이고, 아래 박스가 핸드셰이크 뒤에 오가는 데이터다. 버튼을 고르면 단계마다 무엇이 어느 쪽에서 어느 쪽으로 가는지 볼 수 있다.'
const legend = '위의 두 노드는 클라이언트인 웹 브라우저와 www.example.com의 서버이고, 그 아래 왼쪽 박스가 클라이언트, 오른쪽 박스가 서버다. 화살표는 메시지가 가는 방향이다.'
const expectedScenarios = [
  {
    id: 'hello', label: '인사',
    nodes: [...headIds, 'client-hello', 'server-hello'], paths: pathsOf(['client-hello', 'server-hello']), notes: ['hello-note'],
    caption: '브라우저가 ClientHello에 자기가 쓸 수 있는 TLS 판과 암호 방식, 키를 함께 만드는 데 쓸 값을 담아 보내면, 서버가 ServerHello로 그 가운데 고른 것과 서버 쪽의 값을 돌려준다. 이 두 메시지로 두 쪽은 함께 쓸 키를 만들고, 그 뒤의 메시지는 모두 암호화해 보낸다.',
  },
  {
    id: 'certificate', label: '인증서',
    nodes: [...headIds, 'certificate', 'cert-verify'], paths: pathsOf(['certificate', 'cert-verify']), notes: ['cert-note'],
    caption: '서버가 Certificate로 자기 인증서를 보내고, 그 인증서의 공개 키와 짝인 개인 키로 핸드셰이크에 서명한 CertificateVerify를 보낸다. 브라우저는 인증서의 이름이 www.example.com인지, 인증 기관의 서명이 올바른지, 서버의 서명이 그 공개 키로 맞는지 확인한다.',
  },
  {
    id: 'data', label: '암호화된 데이터',
    nodes: [...headIds, 'finished-s', 'finished-c', 'request', 'response'], paths: pathsOf(['finished-s', 'finished-c', 'request', 'response']), notes: ['data-note'],
    caption: '두 쪽이 Finished를 주고받아 핸드셰이크를 끝맺으면, 웹 페이지를 달라는 요청과 그 응답은 핸드셰이크에서 만든 키로 암호화되어 오간다. 중간에서 엿봐도 알아볼 수 없고, 누가 도중에 바꾸면 받는 쪽이 알아챈다.',
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

function onEdge(x: number, y: number, box: SvgBox) {
  const insideX = x >= box.x && x <= box.x + box.width
  const insideY = y >= box.y && y <= box.y + box.height
  return ((x === box.x || x === box.x + box.width) && insideY) || ((y === box.y || y === box.y + box.height) && insideX)
}

function lineEnds(d: string) {
  const list = segments(d)
  return { start: { x: list[0].x1, y: list[0].y1 }, end: { x: list[list.length - 1].x2, y: list[list.length - 1].y2 } }
}

// 경로 끝이 닿은 곳 — 노드의 변이 먼저고, 아니면 기둥의 변이다.
const endAt = (point: { x: number, y: number }) => nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))
  ?? ['client-side', 'server-side'].find((id) => onEdge(point.x, point.y, groupBox(id)))
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 516] : [0, 0, 280, 516]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<TlsHandshakeDiagram />)
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
    const { container } = render(<TlsHandshakeDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<TlsHandshakeDiagram />)
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
    render(<TlsHandshakeDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    const client = groupBox('client-side')
    const server = groupBox('server-side')
    expect(client.y).toBe(server.y)
    expect(client.height).toBe(server.height)
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const column of ['client-side', 'server-side']) expect(overlaps(nodeBox(id), groupBox(column)), `${id} ↔ ${column}`).toBe(false)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    // 머리 노드는 기둥 위에 서고 바깥 변을 기둥과 맞춘다.
    for (const id of headIds) expect(nodeBox(id).y + 32, id).toBeLessThan(client.y)
    expect(nodeBox('browser').x).toBe(client.x)
    expect(nodeBox('server').x + nodeBox('server').width).toBe(server.x + server.width)
    // 메시지 노드는 두 기둥 사이에 위에서 아래로 놓이고, 자기 박스 안에 든다.
    for (const id of messageIds) {
      expect(nodeBox(id).x, id).toBeGreaterThan(client.x + client.width)
      expect(nodeBox(id).x + nodeBox(id).width, id).toBeLessThan(server.x)
      expect(nodeBox(id).y + 32, id).toBeLessThan(client.y + client.height)
      for (const box of ['handshake-box', 'data-box']) {
        if (boxOf(id) === box) expect(contains(groupBox(box), nodeBox(id)), `${id} ⊂ ${box}`).toBe(true)
        else expect(overlaps(nodeBox(id), groupBox(box)), `${id} ↔ ${box}`).toBe(false)
      }
    }
    for (const id of groupIds) {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
    }
    // 곁말은 자기 박스 안, 자기 노드 아래에 들어가고 노드와 겹치지 않는다.
    const noteBoxes: SvgBox[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of scenario.notes) noteBoxes.push(textBox(note(id), id))
    }
    expect(noteBoxes.map(({ id }) => id)).toEqual(noteIds)
    for (const box of noteBoxes) {
      const owner = noteOwner[box.id]
      expect(contains(groupBox(boxOf(owner)), box), box.id).toBe(true)
      expect(box.y + 9 - (nodeBox(owner).y + 32), box.id).toBeGreaterThanOrEqual(10)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(viewBox[2])
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표 양 끝은 기둥이나 노드의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나거나 다른 화살표와 만나지 않는다', () => {
    render(<TlsHandshakeDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(pathsOf(messageIds)))
    for (const [id, d] of Object.entries(paths)) {
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
    }
    const all = Object.keys(paths)
    for (let i = 0; i < all.length; i += 1) {
      for (const other of all.slice(i + 1)) {
        for (const a of segments(paths[all[i]])) {
          for (const b of segments(paths[other])) {
            const box = { id: '', x: Math.min(b.x1, b.x2), y: Math.min(b.y1, b.y2), width: Math.abs(b.x2 - b.x1), height: Math.abs(b.y2 - b.y1) }
            expect(touches(a, box), `${all[i]} ↔ ${other}`).toBe(false)
          }
        }
      }
    }
  })

  // 요점: 메시지 노드의 위아래 차례가 본문이 간추린 핸드셰이크 차례와 같다(ClientHello → ServerHello → Certificate → CertificateVerify → Finished → Finished).
  // 「인증서」에서 선명한 메시지 노드는 둘 다 서버 기둥에서 나와 클라이언트 기둥으로 가는 화살표를 갖는다. 데이터 노드는 핸드셰이크 노드들보다 아래에 있다.
  it('핸드셰이크 메시지가 본문의 차례대로 놓이고, 인증서는 서버에서 브라우저로 가며, 암호화된 데이터는 그 뒤에 온다', async () => {
    render(<TlsHandshakeDiagram />)
    const byY = [...messageIds].sort((a, b) => nodeBox(a).y - nodeBox(b).y)
    expect(byY.map(label)).toEqual(['ClientHello', 'ServerHello', 'Certificate', 'CertificateVerify', 'Finished', 'Finished', '암호화된 요청', '암호화된 응답'])
    for (const id of toServerIds) {
      expect(endAt(lineEnds(paths[`${id}-out`]).start), id).toBe('client-side')
      expect(endAt(lineEnds(paths[`${id}-out`]).end), id).toBe(id)
      expect(endAt(lineEnds(paths[`${id}-in`]).start), id).toBe(id)
      expect(endAt(lineEnds(paths[`${id}-in`]).end), id).toBe('server-side')
    }
    for (const id of toClientIds) {
      expect(endAt(lineEnds(paths[`${id}-out`]).start), id).toBe('server-side')
      expect(endAt(lineEnds(paths[`${id}-out`]).end), id).toBe(id)
      expect(endAt(lineEnds(paths[`${id}-in`]).start), id).toBe(id)
      expect(endAt(lineEnds(paths[`${id}-in`]).end), id).toBe('client-side')
    }
    const lowestHandshake = Math.max(...handshakeIds.map((id) => nodeBox(id).y + 32))
    for (const id of dataIds) expect(nodeBox(id).y, id).toBeGreaterThan(lowestHandshake)
    expect(groupBox('data-box').y).toBeGreaterThan(groupBox('handshake-box').y + groupBox('handshake-box').height)

    await select('인증서')
    const shownMessages = messageIds.filter((id) => opacity(id) === '1')
    expect(shownMessages).toEqual(['certificate', 'cert-verify'])
    for (const id of shownMessages) {
      expect(endAt(lineEnds(svg().querySelector(`[data-path="${id}-out"]`)!.getAttribute('d')!).start), id).toBe('server-side')
      expect(endAt(lineEnds(svg().querySelector(`[data-path="${id}-in"]`)!.getAttribute('d')!).end), id).toBe('client-side')
    }

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    const order = ['`ClientHello`', '`ServerHello`', '`Certificate`', '`CertificateVerify`', '`Finished`'].map((name) => body.indexOf(name))
    for (const at of order) expect(at).toBeGreaterThanOrEqual(0)
    expect([...order].sort((a, b) => a - b)).toEqual(order)
    for (const name of ['`www.example.com`', '인증 기관', '개인 키', '암호화해 보내고']) expect(body, name).toContain(name)
  })
}

describe('TlsHandshakeDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<TlsHandshakeDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 516')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('인증서')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 516')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '인증서' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><TlsHandshakeDiagram /><TlsHandshakeDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '인사' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<TlsHandshakeDiagram />)
    const text = visualsByTopicId[topicId].diagrams['tls-handshake']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(tlsHandshakeScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = tlsHandshakeScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 TLS 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
