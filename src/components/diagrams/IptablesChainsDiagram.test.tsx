import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { IptablesChainsDiagram, iptablesChainsScenarios } from './IptablesChainsDiagram'

const topicId = 'linux-servers'
const anchorConceptId = `${topicId}.iptables`
const labels: Record<string, string> = {
  outside: '다른 컴퓨터',
  input: 'INPUT',
  output: 'OUTPUT',
  forward: 'FORWARD',
  program: '웹 서버',
  beyond: '또 다른 컴퓨터',
  'frag-a': '-A INPUT',
  'frag-p': '-p tcp',
  'frag-d': '--dport 8080',
  'frag-j': '-j DROP',
}
const groupLabels: Record<string, string> = {
  this: '이 컴퓨터',
  rule: 'iptables 규칙 한 줄',
}
const noteLabels: Record<string, string> = {
  'in-note': '이 컴퓨터로 들어온다',
  'out-note': '이 컴퓨터에서 나간다',
  'fwd-note': '거쳐 지나간다',
  'a-note': 'INPUT 끝에 더한다',
  'p-note': 'TCP 패킷만',
  'd-note': '목적지 포트가 8080',
  'j-note': '맞으면 버린다',
}
const noteScenario: Record<string, string> = {
  'in-note': 'input', 'out-note': 'output', 'fwd-note': 'forward',
  'a-note': 'rule', 'p-note': 'rule', 'd-note': 'rule', 'j-note': 'rule',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const chainIds = ['input', 'output', 'forward']
const fragmentIds = ['frag-a', 'frag-p', 'frag-d', 'frag-j']
// 규칙 조각마다 그 뜻을 다는 곁말.
const fragmentNote: Record<string, string> = { 'frag-a': 'a-note', 'frag-p': 'p-note', 'frag-d': 'd-note', 'frag-j': 'j-note' }
// 노드마다 들어가는 그룹. 다른 컴퓨터와 또 다른 컴퓨터는 어느 그룹에도 들지 않는다.
const groupOf: Record<string, string | null> = {
  outside: null, input: 'this', output: 'this', forward: 'this', program: 'this', beyond: null,
  'frag-a': 'rule', 'frag-p': 'rule', 'frag-d': 'rule', 'frag-j': 'rule',
}

const tallPaths: Record<string, string> = {
  'in-1': 'M72 40 V84',
  'in-2': 'M24 116 V156',
  'out-1': 'M152 156 V116',
  'out-2': 'M120 84 V40',
  'fwd-1': 'M232 40 V84',
  'fwd-2': 'M232 116 V220',
}
const widePaths: Record<string, string> = {
  'in-1': 'M88 40 V84',
  'in-2': 'M40 116 V156',
  'out-1': 'M224 156 V116',
  'out-2': 'M192 84 V40',
  'fwd-1': 'M364 40 V84',
  'fwd-2': 'M364 116 V220',
}
// 선마다 [시작 노드, 끝 노드].
const ends: Record<string, [string, string]> = {
  'in-1': ['outside', 'input'],
  'in-2': ['input', 'program'],
  'out-1': ['program', 'output'],
  'out-2': ['output', 'outside'],
  'fwd-1': ['outside', 'forward'],
  'fwd-2': ['forward', 'beyond'],
}

const rule = 'iptables -A INPUT -p tcp --dport 8080 -j DROP'
const question = '패킷은 어느 체인의 규칙과 견주어질까?'
const figureName = 'iptables의 filter 테이블에서 들어오는 패킷은 INPUT, 내보내는 패킷은 OUTPUT, 거쳐 가는 패킷은 FORWARD 체인의 규칙과 견주어지는 것과, 규칙 iptables -A INPUT -p tcp --dport 8080 -j DROP을 조각마다 읽는 것을 보이는 도식'
const svgName = '맨 위에 다른 컴퓨터, 그 아래 이 컴퓨터 박스 안에 INPUT·OUTPUT·FORWARD 체인과 웹 서버, 박스 아래에 또 다른 컴퓨터, 맨 아래 iptables 규칙 한 줄 박스 안에 -A INPUT, -p tcp, --dport 8080, -j DROP 조각이 있는 그림'
const idleCaption = '이 컴퓨터 안에 filter 테이블의 세 체인 INPUT·OUTPUT·FORWARD와 웹 서버를 두고, 바깥에 다른 컴퓨터와 또 다른 컴퓨터를 두었다. 아래는 규칙 한 줄을 뜻이 갈리는 조각 넷으로 나눈 것이고, 포트 번호는 예로 든 것이다. 버튼을 고르면 패킷이 가는 길마다 지나는 체인과, 규칙 조각의 뜻을 볼 수 있다.'
const legend = '위의 큰 박스는 이 컴퓨터이고, 아래 박스는 iptables 규칙 한 줄을 조각으로 나눈 것이다. 화살표는 패킷이 가는 길을 가리킨다.'
const expectedScenarios = [
  {
    id: 'input', label: '들어오는 패킷',
    nodes: ['outside', 'input', 'program'], paths: ['in-1', 'in-2'],
    caption: '다른 컴퓨터가 이 컴퓨터의 웹 서버에게 보낸 패킷은 INPUT 체인을 지나며, 그 체인의 규칙과 맨 위부터 차례로 견주어진다. 다른 컴퓨터가 접속해 오는 것을 막는 규칙은 이 체인에 넣는다.',
  },
  {
    id: 'output', label: '내보내는 패킷',
    nodes: ['program', 'output', 'outside'], paths: ['out-1', 'out-2'],
    caption: '이 컴퓨터의 웹 서버가 만들어 다른 컴퓨터로 내보내는 패킷은 OUTPUT 체인을 지난다. 그래서 OUTPUT에 넣은 규칙은 이 컴퓨터가 내보내는 패킷과 견주어진다.',
  },
  {
    id: 'forward', label: '거쳐 가는 패킷',
    nodes: ['outside', 'forward', 'beyond'], paths: ['fwd-1', 'fwd-2'],
    caption: '다른 컴퓨터에서 와서 이 컴퓨터를 거쳐 또 다른 컴퓨터로 가는 패킷은 FORWARD 체인을 지난다. 이 컴퓨터의 프로그램에게 가는 패킷이 아니므로 INPUT이 아니라 FORWARD의 규칙과 견주어진다.',
  },
  {
    id: 'rule', label: '규칙 읽기',
    nodes: ['frag-a', 'frag-p', 'frag-d', 'frag-j'], paths: [],
    caption: 'iptables -A INPUT -p tcp --dport 8080 -j DROP은 INPUT 체인의 끝에 규칙 하나를 더한다. 이 규칙에 이른 패킷이 TCP 패킷이고 목적지 포트가 8080이면, 두 조건에 모두 맞으므로 버린다.',
  },
]

const svg = () => screen.getByRole('img', { name: svgName })
const select = async (name: string) => { await act(async () => { await userEvent.click(screen.getByRole('button', { name })) }) }

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
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (item) => item.getAttribute('data-note')!)
const opacityOf = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')

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

const endsAt = (point: { x: number, y: number }) => nodeIds.filter((id) => onEdge(point.x, point.y, nodeBox(id)))
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

const anchorConcept = () => topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!

function layoutTests(wide: boolean) {
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 364] : [0, 0, 280, 460]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<IptablesChainsDiagram />)
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
    const { container } = render(<IptablesChainsDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(svg().querySelectorAll('[data-link]')).toHaveLength(0)
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<IptablesChainsDiagram />)
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
    render(<IptablesChainsDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
      // 그룹에 드는 노드는 그 그룹 안에만 있고, 그 밖의 노드는 어느 그룹과도 겹치지 않는다.
      for (const group of groupIds) {
        if (groupOf[id] === group) expect(contains(groupBox(group), nodeBox(id)), `${id} ⊂ ${group}`).toBe(true)
        else expect(overlaps(groupBox(group), nodeBox(id)), `${id} ↔ ${group}`).toBe(false)
      }
    }
    const groupTexts = groupIds.map((id) => {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
      return box
    })
    for (let i = 0; i < groupTexts.length; i += 1) {
      for (const other of groupTexts.slice(i + 1)) expect(overlaps(groupTexts[i], other), `${groupTexts[i].id} ↔ ${other.id}`).toBe(false)
    }
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const noteTexts = shownNotes().map((id) => {
        const element = note(id)!
        expect(element).toHaveAttribute('font-size', '9')
        expect(element).toHaveClass('fill-muted')
        const box = textBox(element, id)
        for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        return box
      })
      for (const box of [...noteTexts, ...groupTexts]) {
        expect(box.x, box.id).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width, box.id).toBeLessThanOrEqual(viewBox[2])
        expect(box.y, box.id).toBeGreaterThanOrEqual(0)
        expect(box.y + box.height, box.id).toBeLessThanOrEqual(viewBox[3])
        for (const d of Object.values(paths)) {
          for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
        }
      }
      for (const box of noteTexts) {
        for (const group of groupTexts) expect(overlaps(box, group), `${box.id} ↔ ${group.id}`).toBe(false)
      }
      for (let i = 0; i < noteTexts.length; i += 1) {
        for (const other of noteTexts.slice(i + 1)) expect(overlaps(noteTexts[i], other), `${noteTexts[i].id} ↔ ${other.id}`).toBe(false)
      }
    }
    // 길의 곁말은 이 컴퓨터 박스 안에, 규칙 조각의 곁말은 규칙 박스 안에 놓인다.
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const box = scenario.id === 'rule' ? groupBox('rule') : groupBox('this')
      for (const id of shownNotes()) expect(contains(box, textBox(note(id)!, id)), id).toBe(true)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('선의 양 끝은 노드의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나거나 같은 시나리오의 다른 선과 만나지 않는다', async () => {
    render(<IptablesChainsDiagram />)
    for (const [id, d] of Object.entries(paths)) {
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
      const { start, end } = lineEnds(d)
      expect(endsAt(start), `${id} 시작`).toEqual([ends[id][0]])
      expect(endsAt(end), `${id} 끝`).toEqual([ends[id][1]])
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

  // 요점: 길마다 패킷은 체인 하나를 지난다 — 앞 화살표가 그 체인에 닿고 뒤 화살표가 거기서 나가며, 다른 두 체인은 흐리다.
  // 거쳐 가는 패킷은 INPUT을 지나지 않는다. 규칙 조각은 읽는 차례대로 이어 붙이면 본문의 규칙 한 줄이 되고, 곁말은 저마다 자기 조각 곁에 있다.
  it('길마다 체인 하나를 지나고, 규칙 조각을 차례대로 이으면 본문의 규칙이 된다', async () => {
    render(<IptablesChainsDiagram />)
    const throughChain: Record<string, string> = { input: 'input', output: 'output', forward: 'forward' }
    for (const [scenarioId, chain] of Object.entries(throughChain)) {
      await select(expectedScenarios.find(({ id }) => id === scenarioId)!.label)
      const [first, second] = shownPaths()
      expect(endsAt(lineEnds(paths[first]).end), scenarioId).toEqual([chain])
      expect(endsAt(lineEnds(paths[second]).start), scenarioId).toEqual([chain])
      for (const other of chainIds.filter((id) => id !== chain)) expect(opacityOf(other), `${scenarioId}: ${other}`).toBe('0.25')
      for (const id of fragmentIds) expect(opacityOf(id), `${scenarioId}: ${id}`).toBe('0.25')
    }
    // 거쳐 가는 패킷은 이 컴퓨터의 프로그램에게 가지 않는다.
    await select('거쳐 가는 패킷')
    expect(opacityOf('program')).toBe('0.25')
    for (const id of shownPaths()) expect([...endsAt(lineEnds(paths[id]).start), ...endsAt(lineEnds(paths[id]).end)], id).not.toContain('program')

    await select('규칙 읽기')
    for (const id of [...chainIds, 'program', 'outside', 'beyond']) expect(opacityOf(id), id).toBe('0.25')
    const reading = [...fragmentIds].sort((a, b) => (wide ? nodeBox(a).x - nodeBox(b).x : nodeBox(a).y - nodeBox(b).y))
    expect(reading).toEqual(fragmentIds)
    expect(`iptables ${reading.map(label).join(' ')}`).toBe(rule)
    expect(groupLabel('rule').split(' ')[0]).toBe(rule.split(' ')[0])
    for (const id of fragmentIds) {
      const box = textBox(note(fragmentNote[id])!, fragmentNote[id])
      const fragment = nodeBox(id)
      if (wide) {
        expect(box.x + box.width / 2, id).toBeGreaterThanOrEqual(fragment.x)
        expect(box.x + box.width / 2, id).toBeLessThanOrEqual(fragment.x + fragment.width)
        expect(box.y, id).toBeGreaterThanOrEqual(fragment.y + fragment.height)
      } else {
        expect(box.x, id).toBeGreaterThanOrEqual(fragment.x + fragment.width)
        expect(box.y, id).toBeGreaterThanOrEqual(fragment.y)
        expect(box.y + box.height, id).toBeLessThanOrEqual(fragment.y + fragment.height)
      }
    }
    // INPUT 조각의 체인 이름과 위 체인 노드의 이름이 같고, 대상은 색이 아니라 본문의 말로 「버린다」고 적는다.
    expect(label('frag-a').split(' ')[1]).toBe(label('input'))
    expect(note('d-note')!.textContent).toContain(label('frag-d').split(' ')[1])
    expect(note('j-note')!.textContent).toContain('버린다')

    const body = anchorConcept().paragraphs.join('\n')
    expect(body).toContain(`\`${rule}\``)
    for (const id of [...fragmentIds, ...chainIds]) expect(body, id).toContain(`\`${label(id)}\``)
    expect(body).toContain('`INPUT` 체인의 끝에 더한다')
    expect(body).toContain('두 조건에 모두 맞는 패킷을 버린다')
    expect(body).toContain('`INPUT`은 들어오는 패킷, `OUTPUT`은 내보내는 패킷, `FORWARD`는 거쳐 가는 패킷의 체인이다')
  })
}

describe('IptablesChainsDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<IptablesChainsDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 460')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('거쳐 가는 패킷')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 364')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '거쳐 가는 패킷' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><IptablesChainsDiagram /><IptablesChainsDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '들어오는 패킷' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<IptablesChainsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['iptables-chains']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(iptablesChainsScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = iptablesChainsScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 iptables 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = anchorConcept()
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(within(figure).queryByRole('heading')).toBeNull()
  })
})
