import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { SmtpDialogueDiagram, smtpDialogueScenarios } from './SmtpDialogueDiagram'

const topicId = 'app-protocols-mail-file'
const anchorConceptId = `${topicId}.smtp`
const labels: Record<string, string> = {
  client: 'mail.example.com',
  server: 'mail.example.net:25',
  r220: '220',
  ehlo: 'EHLO',
  'r250-ehlo': '250',
  'mail-from': 'MAIL FROM',
  'r250-mail': '250',
  'rcpt-to': 'RCPT TO',
  'r250-rcpt': '250',
  'data-cmd': 'DATA',
  r354: '354',
  content: '메일 내용',
  dot: '마침표 한 줄',
  'r250-data': '250',
  'quit-cmd': 'QUIT',
  r221: '221',
}
const groupLabels: Record<string, string> = {
  'client-side': '클라이언트',
  'server-side': '서버',
  greet: '인사',
  envelope: '주고받을 사람',
  data: '메일 내용 넘기기',
  quit: '끝',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const headIds = ['client', 'server']
const stageIds = ['greet', 'envelope', 'data', 'quit']
// 클라이언트가 보내는 명령과 서버가 답하는 응답. 메시지마다 들어가는 단계 박스.
const commandIds = ['ehlo', 'mail-from', 'rcpt-to', 'data-cmd', 'content', 'dot', 'quit-cmd']
const responseIds = ['r220', 'r250-ehlo', 'r250-mail', 'r250-rcpt', 'r354', 'r250-data', 'r221']
const messageIds = nodeIds.filter((id) => !headIds.includes(id))
const stageOf: Record<string, string> = {
  r220: 'greet', ehlo: 'greet', 'r250-ehlo': 'greet',
  'mail-from': 'envelope', 'r250-mail': 'envelope', 'rcpt-to': 'envelope', 'r250-rcpt': 'envelope',
  'data-cmd': 'data', r354: 'data', content: 'data', dot: 'data', 'r250-data': 'data',
  'quit-cmd': 'quit', r221: 'quit',
}

// 명령은 클라이언트 기둥 → 노드(-out), 노드 → 서버 기둥(-in). 응답은 서버 기둥 → 노드(-out), 노드 → 클라이언트 기둥(-in).
const tallY: Record<string, number> = {
  r220: 76, ehlo: 116, 'r250-ehlo': 140, 'mail-from': 212, 'r250-mail': 236, 'rcpt-to': 276, 'r250-rcpt': 300,
  'data-cmd': 372, r354: 396, content: 436, dot: 476, 'r250-data': 500, 'quit-cmd': 572, r221: 596,
}
function pathsFor(wide: boolean) {
  const [clientEdge, commandLeft, commandRight, responseLeft, responseRight, serverEdge] = wide ? [96, 120, 240, 272, 320, 344] : [64, 76, 164, 172, 204, 216]
  const result: Record<string, string> = {}
  for (const id of messageIds) {
    const y = tallY[id] + 16
    if (commandIds.includes(id)) {
      result[`${id}-out`] = `M${clientEdge} ${y} H${commandLeft}`
      result[`${id}-in`] = `M${commandRight} ${y} H${serverEdge}`
    } else {
      result[`${id}-out`] = `M${serverEdge} ${y} H${responseRight}`
      result[`${id}-in`] = `M${responseLeft} ${y} H${clientEdge}`
    }
  }
  return result
}
const tallPaths = pathsFor(false)
const widePaths = pathsFor(true)
const pathsOf = (ids: string[]) => ids.flatMap((id) => [`${id}-out`, `${id}-in`])

const question = 'SMTP로 메일 한 통을 넘길 때 무엇을 주고받을까?'
const figureName = 'SMTP 클라이언트 mail.example.com이 SMTP 서버 mail.example.net에 메일 한 통을 넘기며 주고받는 명령과 응답 코드를 차례대로 보이는 도식'
const svgName = '왼쪽 클라이언트 mail.example.com과 오른쪽 서버 mail.example.net:25 두 기둥 사이에, 인사의 220·EHLO·250, 주고받을 사람의 MAIL FROM·250·RCPT TO·250, 메일 내용 넘기기의 DATA·354·메일 내용·마침표 한 줄·250, 끝의 QUIT·221을 위에서 아래로 놓은 그림'
const idleCaption = 'mail.example.com이 mail.example.net의 25번 포트로 연결해 user2@example.net 앞 메일 한 통을 넘기는 대화를 위에서 아래로 놓았다. 가운데 박스의 왼쪽 노드는 클라이언트가 보내는 명령, 오른쪽 노드는 서버가 답하는 응답 코드다. 버튼을 고르면 단계마다 무엇이 오가는지 볼 수 있다.'
const legend = '위의 두 노드는 클라이언트와 서버의 이름이고, 그 아래 왼쪽 박스가 클라이언트, 오른쪽 박스가 서버다. 가운데 박스 하나가 대화의 한 단계이고, 화살표는 명령이나 응답이 가는 방향이다.'
const stageMessages = (stage: string) => messageIds.filter((id) => stageOf[id] === stage)
const expectedScenarios = [
  {
    id: 'greet', label: '① 인사',
    caption: '클라이언트가 서버의 25번 포트로 TCP 연결을 열면, 서버가 메일을 받을 준비가 됐다는 뜻으로 220을 보낸다. 클라이언트가 EHLO로 자기를 밝히면 서버가 250으로 답한다.',
  },
  {
    id: 'envelope', label: '② 주고받을 사람',
    caption: '클라이언트가 MAIL FROM으로 보내는 사람 user1@example.com을, RCPT TO로 받는 사람 user2@example.net을 알린다. 서버는 명령마다 요청한 일을 마쳤다는 뜻의 250으로 답한다.',
  },
  {
    id: 'data', label: '③ 메일 내용',
    caption: '클라이언트가 DATA를 보내면 서버가 354로 메일 내용을 보내라고 답한다. 클라이언트가 메일 내용을 보내고 마침표 한 줄로 끝을 알리면, 서버가 메일을 받아 맡고 250으로 답한다.',
  },
  {
    id: 'quit', label: '④ 끝',
    caption: '넘길 메일이 더 없으면 클라이언트가 QUIT를 보내고, 서버가 221로 답한 뒤 연결을 닫는다. 이제 메일은 mail.example.net에 있고, 이 서버가 user2의 메일함에 넣어 둔다.',
  },
].map((scenario) => ({ ...scenario, nodes: [...headIds, ...stageMessages(scenario.id)], paths: pathsOf(stageMessages(scenario.id)) }))

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

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function contains(outer: SvgBox, inner: SvgBox) {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height
}

function textBox(text: Element, id: string): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9) * 1.15
  return { id, x, y: y - 9, width, height: 9 }
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 652] : [0, 0, 280, 652]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<SmtpDialogueDiagram />)
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
    const { container } = render(<SmtpDialogueDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(svg().querySelector('[data-note]')).toBeNull()
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 그 단계의 메시지와 화살표만 선명하고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<SmtpDialogueDiagram />)
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
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨과 그룹 라벨이 자리에 들어간다`, () => {
    render(<SmtpDialogueDiagram />)
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
    expect(nodeBox('client').x).toBe(client.x)
    expect(nodeBox('server').x + nodeBox('server').width).toBe(server.x + server.width)
    // 단계 박스는 두 기둥 사이, 기둥 범위 안에 차례대로 놓이고, 메시지 노드는 자기 단계 박스 안에 든다.
    stageIds.forEach((id, index) => {
      const box = groupBox(id)
      expect(box.x, id).toBeGreaterThan(client.x + client.width)
      expect(box.x + box.width, id).toBeLessThan(server.x)
      expect(box.y, id).toBeGreaterThan(client.y)
      expect(box.y + box.height, id).toBeLessThan(client.y + client.height)
      if (index > 0) {
        const previous = groupBox(stageIds[index - 1])
        expect(box.y, id).toBeGreaterThan(previous.y + previous.height)
      }
    })
    for (const id of messageIds) expect(contains(groupBox(stageOf[id]), nodeBox(id)), id).toBe(true)
    for (const id of groupIds) {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표 양 끝은 기둥이나 메시지 노드의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나거나 다른 화살표와 만나지 않는다', () => {
    render(<SmtpDialogueDiagram />)
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

  // 요점: 명령은 모두 클라이언트 → 서버로, 응답 코드는 모두 서버 → 클라이언트로 간다.
  // 명령의 차례는 EHLO → MAIL FROM → RCPT TO → DATA → QUIT이고, 서버 쪽은 25번 포트에서 기다린다.
  it('명령은 클라이언트에서 서버로, 응답은 서버에서 클라이언트로 가고 명령의 차례가 본문과 같다', () => {
    render(<SmtpDialogueDiagram />)
    for (const id of commandIds) {
      expect(endAt(lineEnds(paths[`${id}-out`]).start), id).toBe('client-side')
      expect(endAt(lineEnds(paths[`${id}-out`]).end), id).toBe(id)
      expect(endAt(lineEnds(paths[`${id}-in`]).start), id).toBe(id)
      expect(endAt(lineEnds(paths[`${id}-in`]).end), id).toBe('server-side')
    }
    for (const id of responseIds) {
      expect(label(id), id).toMatch(/^\d{3}$/u)
      expect(endAt(lineEnds(paths[`${id}-out`]).start), id).toBe('server-side')
      expect(endAt(lineEnds(paths[`${id}-out`]).end), id).toBe(id)
      expect(endAt(lineEnds(paths[`${id}-in`]).start), id).toBe(id)
      expect(endAt(lineEnds(paths[`${id}-in`]).end), id).toBe('client-side')
    }
    const commandOrder = [...commandIds].sort((a, b) => nodeBox(a).y - nodeBox(b).y).map(label)
    expect(commandOrder.filter((name) => /^[A-Z ]+$/u.test(name))).toEqual(['EHLO', 'MAIL FROM', 'RCPT TO', 'DATA', 'QUIT'])
    // 메시지는 위에서 아래로 한 줄씩 차례대로 놓인다 — 응답은 자기 명령보다 아래에 온다.
    const order = [...messageIds].sort((a, b) => nodeBox(a).y - nodeBox(b).y)
    expect(order).toEqual(messageIds)
    expect(label('server')).toContain('25')
    expect(label('r354')).toBe('354')
    expect(nodeBox('r354').y).toBeGreaterThan(nodeBox('data-cmd').y)
    expect(nodeBox('r221').y).toBeGreaterThan(nodeBox('quit-cmd').y)

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const name of ['`mail.example.net:25`', '`220`', '`EHLO mail.example.com`', '`MAIL FROM:<user1@example.com>`', '`RCPT TO:<user2@example.net>`', '`DATA`', '`354`', '마침표 한 줄', '`QUIT`', '`221`', '메일 내용']) {
      expect(body, name).toContain(name)
    }
  })
}

describe('SmtpDialogueDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<SmtpDialogueDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 652')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('③ 메일 내용')
      const tallShown = shownPaths()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 652')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '③ 메일 내용' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><SmtpDialogueDiagram /><SmtpDialogueDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '② 주고받을 사람' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<SmtpDialogueDiagram />)
    const text = visualsByTopicId[topicId].diagrams['smtp-dialogue']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(smtpDialogueScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = smtpDialogueScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 SMTP 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
