import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ResolutionStepsDiagram, resolutionStepsScenarios } from './ResolutionStepsDiagram'

const topicId = 'dns'
const anchorConceptId = `${topicId}.name-resolution`
const labels: Record<string, string> = {
  client: '클라이언트',
  local: '로컬 DNS 서버',
  root: '루트 네임 서버',
  tld: 'com TLD 네임 서버',
  auth: 'example.com의 권한 있는 네임 서버',
}
const numbers = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧']
const noteLabels: Record<string, string> = {
  n1: '①', n2: '②', n3: '③', n4: '④', n5: '⑤', n6: '⑥', n7: '⑦', n8: '⑧',
  'root-note': 'com TLD 네임 서버를 알려 준다',
  'tld-note': 'example.com을 맡은 서버를 알려 준다',
  'auth-note': '198.51.100.10',
}
// 번호 곁말과 그 번호의 화살표. 번호 차례가 메시지가 오가는 차례다.
const numberPath: Record<string, string> = { n1: 'q1', n2: 'q2', n3: 'r3', n4: 'q4', n5: 'r5', n6: 'q6', n7: 'r7', n8: 'r8' }
const pathOrder = ['q1', 'q2', 'r3', 'q4', 'r5', 'q6', 'r7', 'r8']
// 화살표마다 [보내는 쪽, 받는 쪽].
const ends: Record<string, [string, string]> = {
  q1: ['client', 'local'],
  q2: ['local', 'root'],
  r3: ['root', 'local'],
  q4: ['local', 'tld'],
  r5: ['tld', 'local'],
  q6: ['local', 'auth'],
  r7: ['auth', 'local'],
  r8: ['local', 'client'],
}
// 내용 곁말은 답을 돌려주는 서버 바로 아래 줄에 놓인다.
const contentNoteNode: Record<string, string> = { 'root-note': 'root', 'tld-note': 'tld', 'auth-note': 'auth' }
const nodeIds = Object.keys(labels)
const serverIds = ['root', 'tld', 'auth']

const tallPaths: Record<string, string> = {
  q1: 'M120 264 V216',
  q2: 'M80 208 H16 V24 H36',
  r3: 'M248 24 H268 V208 H200',
  q4: 'M80 192 H28 V72 H36',
  r5: 'M248 72 H260 V192 H200',
  q6: 'M100 184 V136',
  r7: 'M180 136 V184',
  r8: 'M160 216 V264',
}
const widePaths: Record<string, string> = {
  q1: 'M64 168 V96',
  q2: 'M120 64 V24 H220',
  r3: 'M220 32 H136 V64',
  q4: 'M160 76 H220',
  r5: 'M220 88 H160',
  q6: 'M136 96 V136 H220',
  r7: 'M220 144 H120 V96',
  r8: 'M96 96 V168',
}

const question = '이름 하나의 주소는 어떤 차례로 찾을까?'
const figureName = '클라이언트가 로컬 DNS 서버에 www.example.com의 IP 주소를 묻고, 로컬 DNS 서버가 루트 네임 서버, com TLD 네임 서버, example.com의 권한 있는 네임 서버에 차례로 물어 얻은 답을 돌려주는 차례를 보이는 도식'
const svgName = '루트 네임 서버, com TLD 네임 서버, example.com의 권한 있는 네임 서버를 위에서 아래로 쌓아 한쪽에 두고, 로컬 DNS 서버와 클라이언트를 따로 놓아 번호 붙은 화살표로 잇는 그림'
const idleCaption = '캐시가 모두 비어 있을 때 클라이언트가 www.example.com의 IP 주소를 얻는 차례다. 화살표 옆의 번호가 메시지가 오가는 차례이고, 이름과 주소는 예로 붙인 것이다. 버튼을 고르면 차례의 구간마다 누가 누구에게 묻고 무엇을 돌려받는지 볼 수 있다.'
const legend = '화살표는 질의나 응답이 가는 방향이고, 화살표 옆의 번호는 메시지가 오가는 차례다.'
const expectedScenarios = [
  {
    id: 'ask-local', label: '로컬에 묻기',
    nodes: ['client', 'local'], paths: ['q1'], notes: ['n1'],
    caption: '① 클라이언트는 자기 캐시에 답이 없으면 로컬 DNS 서버 하나에 www.example.com의 IP 주소를 묻는 질의를 보내고 응답을 기다린다. 루트나 TLD 네임 서버가 어디 있는지는 몰라도 된다.',
  },
  {
    id: 'referral', label: '다음 서버 안내',
    nodes: ['local', 'root', 'tld'], paths: ['q2', 'r3', 'q4', 'r5'], notes: ['n2', 'n3', 'n4', 'n5', 'root-note', 'tld-note'],
    caption: '②③ 로컬 DNS 서버가 루트 네임 서버에 물으면, 루트는 주소 대신 com을 맡은 TLD 네임 서버들을 알려 준다. ④⑤ 그 TLD 네임 서버에 다시 물으면, 역시 주소 대신 example.com을 맡은 권한 있는 네임 서버들을 알려 준다.',
  },
  {
    id: 'answer', label: '최종 답',
    nodes: ['client', 'local', 'auth'], paths: ['q6', 'r7', 'r8'], notes: ['n6', 'n7', 'n8', 'auth-note'],
    caption: '⑥⑦ 로컬 DNS 서버가 example.com의 권한 있는 네임 서버에 물으면, 그 서버가 원본 정보로 IP 주소 198.51.100.10을 답한다. ⑧ 로컬 DNS 서버는 이 답을 캐시에 넣고 클라이언트에 돌려준다.',
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
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (item) => item.getAttribute('data-note')!)
const opacityOf = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')

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

// 두 선분이 한 점에서라도 만나는가.
function meets(a: Segment, b: Segment) {
  return touches(a, { id: '', x: Math.min(b.x1, b.x2), y: Math.min(b.y1, b.y2), width: Math.abs(b.x2 - b.x1), height: Math.abs(b.y2 - b.y1) })
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

const endAt = (point: { x: number, y: number }) => nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 208] : [0, 0, 280, 304]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<ResolutionStepsDiagram />)
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
    const { container } = render(<ResolutionStepsDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(svg().querySelectorAll('[data-group]')).toHaveLength(0)
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<ResolutionStepsDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownNotes()).toEqual(scenario.notes)
    for (const id of shownNotes()) expect(note(id)!.textContent).toBe(noteLabels[id])
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

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말이 자리에 들어간다`, async () => {
    render(<ResolutionStepsDiagram />)
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
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const noteTexts = shownNotes().map((id) => {
        const element = note(id)!
        expect(element).toHaveAttribute('font-size', '9')
        expect(element).toHaveClass('fill-muted')
        const box = textBox(element, id)
        for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        expect(box.x, id).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width, id).toBeLessThanOrEqual(viewBox[2])
        expect(box.y, id).toBeGreaterThanOrEqual(0)
        expect(box.y + box.height, id).toBeLessThanOrEqual(viewBox[3])
        for (const d of Object.values(paths)) {
          for (const segment of segments(d)) expect(touches(segment, box), `${id} ↔ 선`).toBe(false)
        }
        // 내용 곁말은 답을 돌려주는 서버 바로 아래 줄에 놓인다.
        if (id in contentNoteNode) {
          const own = nodeBox(contentNoteNode[id])
          expect(box.y, id).toBeGreaterThanOrEqual(own.y + own.height)
          expect(box.y - (own.y + own.height), id).toBeLessThanOrEqual(16)
        }
        return box
      })
      for (const box of noteTexts) {
        for (const other of noteTexts.filter(({ id }) => id !== box.id)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
      }
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표의 양 끝은 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않으며, 한 시나리오의 화살표끼리 만나지 않는다', () => {
    render(<ResolutionStepsDiagram />)
    for (const [id, d] of Object.entries(paths)) {
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
      }
      const { start, end } = lineEnds(d)
      expect(endAt(start), `${id} 시작`).toBe(ends[id][0])
      expect(endAt(end), `${id} 끝`).toBe(ends[id][1])
    }
    for (const scenario of expectedScenarios) {
      for (const a of scenario.paths) {
        for (const b of scenario.paths.filter((id) => id !== a)) {
          for (const sa of segments(paths[a])) {
            for (const sb of segments(paths[b])) expect(meets(sa, sb), `${scenario.id}: ${a} ↔ ${b}`).toBe(false)
          }
        }
      }
    }
  })

  // 요점: 클라이언트는 로컬 DNS 서버하고만 잇는다. 다음 서버 안내 구간의 응답 곁말에는 주소가 없다.
  // 번호 곁말의 차례가 본문이 적은 차례와 같다.
  it('클라이언트는 로컬 DNS 서버하고만 잇고, 안내 응답에는 주소가 없으며, 번호 차례가 본문의 차례와 같다', async () => {
    render(<ResolutionStepsDiagram />)
    for (const [id, [from, to]] of Object.entries(ends)) {
      if (from === 'client' || to === 'client') expect([from, to].sort(), id).toEqual(['client', 'local'])
    }
    // 단계를 맡는 세 서버는 루트 → TLD → 권한 있는 서버 차례로 위에서 아래로 놓인다.
    const ys = serverIds.map((id) => nodeBox(id).y)
    expect([...ys].sort((a, b) => a - b)).toEqual(ys)
    expect(new Set(ys).size).toBe(3)

    await select('다음 서버 안내')
    for (const id of shownNotes()) expect(note(id)!.textContent, id).not.toContain('198.51.100.10')
    expect(opacityOf('client')).toBe('0.25')
    expect(opacityOf('auth')).toBe('0.25')

    await select('최종 답')
    expect(note('auth-note')!.textContent).toBe('198.51.100.10')
    expect(opacityOf('root')).toBe('0.25')
    expect(opacityOf('tld')).toBe('0.25')

    // 번호 곁말 n1~n8은 화살표 q1·q2·r3·q4·r5·q6·r7·r8에 차례로 붙는다.
    expect(Object.keys(numberPath).map((id) => noteLabels[id])).toEqual(numbers)
    expect(Object.values(numberPath)).toEqual(pathOrder)

    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join('\n')
    const positions = numbers.map((number) => body.indexOf(number))
    for (const position of positions) expect(position).toBeGreaterThanOrEqual(0)
    expect([...positions].sort((a, b) => a - b)).toEqual(positions)
    // 본문의 번호마다 그 화살표가 잇는 두 쪽을 말한다.
    const step = (number: string) => body.slice(body.indexOf(number), body.indexOf(numbers[numbers.indexOf(number) + 1] ?? '\u0000'))
    expect(step('①')).toContain('로컬 DNS 서버 `192.0.2.53`에 `www.example.com`의 IP 주소를 묻는 질의를 보낸')
    expect(step('②')).toContain('루트 네임 서버에 `www.example.com`을 묻는다')
    expect(step('③')).toContain('주소 대신 `com`을 맡은 TLD 네임 서버들의 이름과 아는 주소를 돌려준다')
    expect(step('④')).toContain('`com` TLD 네임 서버에 같은 이름을 다시 묻는다')
    expect(step('⑤')).toContain('`example.com`을 맡은 권한 있는 네임 서버들을 알려 주는 안내 응답을 돌려준다')
    expect(step('⑥')).toContain('`example.com`의 권한 있는 네임 서버에 같은 이름을 묻는다')
    expect(step('⑦')).toContain('`198.51.100.10`이라는 레코드를 답으로 돌려준다')
    expect(step('⑧')).toContain('이 답을 캐시에 넣고 클라이언트 `192.0.2.10`에 돌려준다')
  })
}

describe('ResolutionStepsDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<ResolutionStepsDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 304')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      await select('다음 서버 안내')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 208')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(screen.getByRole('button', { name: '다음 서버 안내' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><ResolutionStepsDiagram /><ResolutionStepsDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '다음 서버 안내' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<ResolutionStepsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['resolution-steps']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(resolutionStepsScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = resolutionStepsScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 이름 풀이 과정 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(within(figure).queryByRole('heading')).toBeNull()
  })
})
