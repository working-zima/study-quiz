import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { SipCallDiagram, sipCallScenarios } from './SipCallDiagram'

const topicId = 'app-protocols-mgmt-security'
const anchorConceptId = `${topicId}.sip`
const labels: Record<string, string> = {
  caller: 'sip:user1@example.com',
  callee: 'sip:user2@example.net',
  invite: 'INVITE',
  ringing: '180 Ringing',
  'ok-setup': '200 OK',
  ack: 'ACK',
  media: 'RTP · 음성과 영상',
  bye: 'BYE',
  'ok-bye': '200 OK',
}
const groupLabels: Record<string, string> = {
  'caller-side': '거는 쪽',
  'callee-side': '받는 쪽',
  'setup-box': '통화 맺기',
  'media-box': '통화 중',
  'teardown-box': '통화 끝내기',
}
const noteLabels: Record<string, string> = {
  'setup-note': 'ACK로 통화가 맺어진다',
  'media-note': 'SIP 메시지와 따로 오간다',
  'teardown-note': '누구나 BYE를 보낼 수 있다',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
const headIds = ['caller', 'callee']
const columnIds = ['caller-side', 'callee-side']
// 거는 쪽 → 받는 쪽과 받는 쪽 → 거는 쪽. 본문의 예에서는 user2(받는 쪽)가 먼저 끊어 BYE를 보내고, user1(거는 쪽)이 200 OK로 답한다.
const toCalleeIds = ['invite', 'ack', 'ok-bye']
const toCallerIds = ['ringing', 'ok-setup', 'bye']
const sipMessageIds = ['invite', 'ringing', 'ok-setup', 'ack', 'bye', 'ok-bye']
const messageIds = nodeIds.filter((id) => !headIds.includes(id))
const boxOf = (id: string) => (id === 'media' ? 'media-box' : ['bye', 'ok-bye'].includes(id) ? 'teardown-box' : 'setup-box')
const noteOwner: Record<string, string> = { 'setup-note': 'ack', 'media-note': 'media', 'teardown-note': 'ok-bye' }
const mediaPathIds = ['media-to-callee-out', 'media-to-callee-in', 'media-to-caller-out', 'media-to-caller-in']

// 세로형의 메시지 노드 y. 가로형은 머리 노드를 한 줄에 두므로 모두 40씩 위에 있다.
const tallY: Record<string, number> = { invite: 120, ringing: 164, 'ok-setup': 208, ack: 252, media: 344, bye: 436, 'ok-bye': 480 }
function pathsFor(wide: boolean) {
  const [callerEdge, nodeLeft, nodeRight, calleeEdge] = wide ? [96, 120, 320, 344] : [64, 76, 204, 216]
  const shift = wide ? 40 : 0
  const result: Record<string, string> = {}
  for (const id of sipMessageIds) {
    const y = tallY[id] - shift + 16
    if (toCalleeIds.includes(id)) {
      result[`${id}-out`] = `M${callerEdge} ${y} H${nodeLeft}`
      result[`${id}-in`] = `M${nodeRight} ${y} H${calleeEdge}`
    } else {
      result[`${id}-out`] = `M${calleeEdge} ${y} H${nodeRight}`
      result[`${id}-in`] = `M${nodeLeft} ${y} H${callerEdge}`
    }
  }
  // 음성과 영상은 양쪽이 서로에게 보낸다 — 노드 위쪽 줄은 거는 쪽 → 받는 쪽, 아래쪽 줄은 받는 쪽 → 거는 쪽.
  const upper = tallY.media - shift + 10
  const lower = tallY.media - shift + 22
  result['media-to-callee-out'] = `M${callerEdge} ${upper} H${nodeLeft}`
  result['media-to-callee-in'] = `M${nodeRight} ${upper} H${calleeEdge}`
  result['media-to-caller-out'] = `M${calleeEdge} ${lower} H${nodeRight}`
  result['media-to-caller-in'] = `M${nodeLeft} ${lower} H${callerEdge}`
  return result
}
const tallPaths = pathsFor(false)
const widePaths = pathsFor(true)
const pathsOf = (ids: string[]) => ids.flatMap((id) => [`${id}-out`, `${id}-in`])

const question = 'SIP 통화는 어떤 차례로 맺고 끝낼까?'
const figureName = 'sip:user1@example.com이 sip:user2@example.net에 INVITE로 영상 통화를 걸고, 180 Ringing·200 OK·ACK로 통화를 맺은 뒤 음성과 영상이 RTP로 오가고, BYE와 200 OK로 통화를 끝내는 차례를 보이는 도식'
const svgName = '왼쪽 거는 쪽 기둥과 오른쪽 받는 쪽 기둥 사이에, 위 박스에 INVITE·180 Ringing·200 OK·ACK를, 가운데 박스에 RTP로 오가는 음성과 영상을, 아래 박스에 BYE·200 OK를 차례로 놓은 그림'
const idleCaption = 'sip:user1@example.com이 sip:user2@example.net에 영상 통화를 걸어 통화를 맺고, 통화하고, 끝내는 동안 두 쪽이 주고받는 것을 위에서 아래로 간추려 놓았다. 버튼을 고르면 단계마다 무엇이 어느 쪽에서 어느 쪽으로 가는지 볼 수 있다.'
const legend = '위의 두 노드는 거는 쪽과 받는 쪽의 SIP 주소이고, 그 아래 왼쪽 박스가 거는 쪽, 오른쪽 박스가 받는 쪽이다. 맨 위와 맨 아래 박스의 노드는 SIP 메시지이고, 가운데 박스의 노드는 RTP로 오가는 음성과 영상이다. 화살표는 가는 방향이다.'
const expectedScenarios = [
  {
    id: 'setup', label: '맺기',
    nodes: [...headIds, 'invite', 'ringing', 'ok-setup', 'ack'], paths: pathsOf(['invite', 'ringing', 'ok-setup', 'ack']), notes: ['setup-note'],
    caption: 'user1 쪽이 INVITE로 user2를 통화에 부르면, user2 쪽은 전화가 울리는 동안 180 Ringing을 보내고 통화를 받으면 200 OK로 답한다. INVITE와 200 OK에는 쓸 음성과 영상의 방식이 SDP로 적혀 있다. user1 쪽이 ACK로 200 OK를 받았다고 확인하면 통화가 맺어진다.',
  },
  {
    id: 'media', label: '통화',
    nodes: [...headIds, 'media'], paths: mediaPathIds, notes: ['media-note'],
    caption: '통화가 맺어지면 음성과 영상은 SIP 메시지에 실리지 않고, 합의한 방식대로 RTP에 실려 두 쪽 사이를 오간다. 통화하는 내내 양쪽이 서로에게 계속 보낸다.',
  },
  {
    id: 'teardown', label: '끝내기',
    nodes: [...headIds, 'bye', 'ok-bye'], paths: pathsOf(['bye', 'ok-bye']), notes: ['teardown-note'],
    caption: '통화를 끝내려는 쪽이 BYE를 보내고 받은 쪽이 200 OK로 답하면 통화가 끝난다. 여기서는 user2가 먼저 끊었지만, 거는 쪽과 받는 쪽 누구나 BYE를 보낼 수 있다. 이 200 OK에는 ACK를 보내지 않는다.',
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
  ?? columnIds.find((id) => onEdge(point.x, point.y, groupBox(id)))
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 520] : [0, 0, 280, 560]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<SipCallDiagram />)
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
    const { container } = render(<SipCallDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<SipCallDiagram />)
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
    render(<SipCallDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    const caller = groupBox('caller-side')
    const callee = groupBox('callee-side')
    expect(caller.y).toBe(callee.y)
    expect(caller.height).toBe(callee.height)
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const column of columnIds) expect(overlaps(nodeBox(id), groupBox(column)), `${id} ↔ ${column}`).toBe(false)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    // 머리 노드는 기둥 위에 서고 바깥 변을 기둥과 맞춘다.
    for (const id of headIds) expect(nodeBox(id).y + 32, id).toBeLessThan(caller.y)
    expect(nodeBox('caller').x).toBe(caller.x)
    expect(nodeBox('callee').x + nodeBox('callee').width).toBe(callee.x + callee.width)
    // 메시지 노드는 두 기둥 사이에 위에서 아래로 놓이고, 자기 박스 안에 든다.
    for (const id of messageIds) {
      expect(nodeBox(id).x, id).toBeGreaterThan(caller.x + caller.width)
      expect(nodeBox(id).x + nodeBox(id).width, id).toBeLessThan(callee.x)
      expect(nodeBox(id).y + 32, id).toBeLessThan(caller.y + caller.height)
      for (const box of ['setup-box', 'media-box', 'teardown-box']) {
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
    render(<SipCallDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set([...pathsOf(sipMessageIds), ...mediaPathIds]))
    for (const [id, d] of Object.entries(paths)) {
      const { start, end } = lineEnds(d)
      expect(endAt(start), `${id} 시작`).toBeDefined()
      expect(endAt(end), `${id} 끝`).toBeDefined()
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

  // 요점: SIP 메시지 노드의 위아래 차례가 본문의 통화 차례와 같다(INVITE → 180 Ringing → 200 OK → ACK → BYE → 200 OK).
  // 「통화」에서 선명한 메시지 노드에는 SIP 메시지 이름이 없고 RTP가 있다. INVITE는 거는 쪽에서 받는 쪽으로, 첫 200 OK는 받는 쪽에서 거는 쪽으로 간다.
  it('SIP 메시지가 본문의 차례대로 놓이고, 통화 중의 음성과 영상은 SIP 메시지가 아니라 RTP로 오가며, INVITE와 첫 200 OK의 방향이 반대다', async () => {
    render(<SipCallDiagram />)
    const byY = [...messageIds].sort((a, b) => nodeBox(a).y - nodeBox(b).y)
    expect(byY.filter((id) => id !== 'media').map(label)).toEqual(['INVITE', '180 Ringing', '200 OK', 'ACK', 'BYE', '200 OK'])
    // RTP 구간은 통화를 맺는 메시지 뒤, 끝내는 메시지 앞에 있다.
    expect(byY.indexOf('media')).toBe(4)
    expect(groupBox('media-box').y).toBeGreaterThan(groupBox('setup-box').y + groupBox('setup-box').height)
    expect(groupBox('teardown-box').y).toBeGreaterThan(groupBox('media-box').y + groupBox('media-box').height)

    for (const id of toCalleeIds) {
      expect(endAt(lineEnds(paths[`${id}-out`]).start), id).toBe('caller-side')
      expect(endAt(lineEnds(paths[`${id}-out`]).end), id).toBe(id)
      expect(endAt(lineEnds(paths[`${id}-in`]).start), id).toBe(id)
      expect(endAt(lineEnds(paths[`${id}-in`]).end), id).toBe('callee-side')
    }
    for (const id of toCallerIds) {
      expect(endAt(lineEnds(paths[`${id}-out`]).start), id).toBe('callee-side')
      expect(endAt(lineEnds(paths[`${id}-out`]).end), id).toBe(id)
      expect(endAt(lineEnds(paths[`${id}-in`]).start), id).toBe(id)
      expect(endAt(lineEnds(paths[`${id}-in`]).end), id).toBe('caller-side')
    }

    await select('맺기')
    expect(endAt(lineEnds(svg().querySelector('[data-path="invite-out"]')!.getAttribute('d')!).start)).toBe('caller-side')
    expect(endAt(lineEnds(svg().querySelector('[data-path="invite-in"]')!.getAttribute('d')!).end)).toBe('callee-side')
    expect(endAt(lineEnds(svg().querySelector('[data-path="ok-setup-out"]')!.getAttribute('d')!).start)).toBe('callee-side')
    expect(endAt(lineEnds(svg().querySelector('[data-path="ok-setup-in"]')!.getAttribute('d')!).end)).toBe('caller-side')

    await select('통화')
    const shownMessages = messageIds.filter((id) => opacity(id) === '1')
    expect(shownMessages).toEqual(['media'])
    const mediaLabel = label('media')
    expect(mediaLabel).toContain('RTP')
    for (const name of ['INVITE', 'Ringing', 'OK', 'ACK', 'BYE']) expect(mediaLabel, name).not.toContain(name)
    // 음성과 영상은 양쪽이 서로에게 보낸다 — 거는 쪽에서 받는 쪽으로 가는 화살표와 그 반대 화살표가 함께 보인다.
    const ends = (id: string) => lineEnds(svg().querySelector(`[data-path="${id}"]`)!.getAttribute('d')!)
    expect(endAt(ends('media-to-callee-out').start)).toBe('caller-side')
    expect(endAt(ends('media-to-callee-in').end)).toBe('callee-side')
    expect(endAt(ends('media-to-caller-out').start)).toBe('callee-side')
    expect(endAt(ends('media-to-caller-in').end)).toBe('caller-side')

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    const order = ['`INVITE`', '`180 Ringing`', '`200 OK`', '`ACK`', '`BYE`'].map((name) => body.indexOf(name))
    for (const at of order) expect(at).toBeGreaterThanOrEqual(0)
    expect([...order].sort((a, b) => a - b)).toEqual(order)
    for (const name of ['`sip:user1@example.com`', '`sip:user2@example.net`', 'RTP', 'SDP', '`user2` 쪽이 `BYE`를 보내고', '`5060`']) expect(body, name).toContain(name)
  })
}

describe('SipCallDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<SipCallDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 560')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('통화')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 520')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '통화' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><SipCallDiagram /><SipCallDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '맺기' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<SipCallDiagram />)
    const text = visualsByTopicId[topicId].diagrams['sip-call']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(sipCallScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = sipCallScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 SIP 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
