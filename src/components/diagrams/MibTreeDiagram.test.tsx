import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { MibTreeDiagram, mibTreeScenarios } from './MibTreeDiagram'

const topicId = 'app-protocols-mgmt-security'
const anchorConceptId = `${topicId}.mib`
const labels: Record<string, string> = {
  iso: 'iso(1)',
  org: 'org(3)',
  dod: 'dod(6)',
  internet: 'internet(1)',
  mgmt: 'mgmt(2)',
  mib2: 'mib-2(1)',
  system: 'system(1)',
  sysuptime: 'sysUpTime(3)',
  oid: '1.3.6.1.2.1.1.3',
  manager: '매니저',
  agent: '라우터 1의 에이전트',
}
const noteLabels: Record<string, string> = {
  'join-note': '번호를 점으로 잇는다',
  'object-note': '관리 객체의 이름표',
  'ask-note': 'OID로 묻는다',
  'value-note': '값을 돌려준다',
}
const nodeIds = Object.keys(labels)
const noteIds = Object.keys(noteLabels)
const branchIds = ['iso', 'org', 'dod', 'internet', 'mgmt', 'mib2', 'system', 'sysuptime']
const linkIds = ['b-org', 'b-dod', 'b-internet', 'b-mgmt', 'b-mib2', 'b-system', 'b-sysuptime']
const walkIds = ['walk-org', 'walk-dod', 'walk-internet', 'walk-mgmt', 'walk-mib2', 'walk-system', 'walk-sysuptime']

const tallPaths: Record<string, string> = {
  'b-org': 'M60 40 V56',
  'b-dod': 'M60 88 V104',
  'b-internet': 'M60 136 V152',
  'b-mgmt': 'M60 184 V200',
  'b-mib2': 'M60 232 V248',
  'b-system': 'M60 280 V296',
  'b-sysuptime': 'M60 328 V344',
  'walk-org': 'M60 40 V56',
  'walk-dod': 'M60 88 V104',
  'walk-internet': 'M60 136 V152',
  'walk-mgmt': 'M60 184 V200',
  'walk-mib2': 'M60 232 V248',
  'walk-system': 'M60 280 V296',
  'walk-sysuptime': 'M60 328 V344',
  'to-oid': 'M112 360 H136',
  ask: 'M112 432 H136',
  answer: 'M136 448 H112',
}
const widePaths: Record<string, string> = {
  'b-org': 'M100 24 H116',
  'b-dod': 'M208 24 H224',
  'b-internet': 'M316 24 H332',
  'b-mgmt': 'M378 40 V72',
  'b-mib2': 'M332 88 H316',
  'b-system': 'M224 88 H208',
  'b-sysuptime': 'M116 88 H100',
  'walk-org': 'M100 24 H116',
  'walk-dod': 'M208 24 H224',
  'walk-internet': 'M316 24 H332',
  'walk-mgmt': 'M378 40 V72',
  'walk-mib2': 'M332 88 H316',
  'walk-system': 'M224 88 H208',
  'walk-sysuptime': 'M116 88 H100',
  'to-oid': 'M54 104 V136',
  ask: 'M288 144 H304',
  answer: 'M304 160 H288',
}
// 경로마다 출발과 도착 노드. 가지와 그 위의 화살표는 위 가지에서 아래 가지로 간다.
const ends: Record<string, [string, string]> = {
  'b-org': ['iso', 'org'],
  'b-dod': ['org', 'dod'],
  'b-internet': ['dod', 'internet'],
  'b-mgmt': ['internet', 'mgmt'],
  'b-mib2': ['mgmt', 'mib2'],
  'b-system': ['mib2', 'system'],
  'b-sysuptime': ['system', 'sysuptime'],
  'walk-org': ['iso', 'org'],
  'walk-dod': ['org', 'dod'],
  'walk-internet': ['dod', 'internet'],
  'walk-mgmt': ['internet', 'mgmt'],
  'walk-mib2': ['mgmt', 'mib2'],
  'walk-system': ['mib2', 'system'],
  'walk-sysuptime': ['system', 'sysuptime'],
  'to-oid': ['sysuptime', 'oid'],
  ask: ['manager', 'agent'],
  answer: ['agent', 'manager'],
}

const question = 'OID는 MIB의 값을 어떻게 가리킬까?'
const figureName = 'OID 나무를 iso(1)에서 sysUpTime(3)까지 따라 읽어 1.3.6.1.2.1.1.3을 얻고, 매니저가 그 OID로 묻고 「라우터 1」의 에이전트가 MIB의 값을 돌려주는 것을 보이는 도식'
const svgName = 'iso(1)부터 sysUpTime(3)까지 여덟 가지를 차례로 잇고 그 끝에 OID 1.3.6.1.2.1.1.3을 둔 나무와, 매니저와 라우터 1의 에이전트를 둔 그림'
const idleCaption = 'sysUpTime이라는 관리 객체의 OID를 나무의 맨 위에서부터 한 갈래만 따라 그렸다. 그 옆에는 이 OID로 값을 묻는 매니저와 「라우터 1」의 에이전트를 두었다. 버튼을 고르면 OID를 읽는 법과 값이 어디서 오는지 볼 수 있다.'
const legend = '노드 안 이름 뒤의 괄호 속 수가 그 가지의 번호이고, 노드 사이의 선은 가지가 이어진 관계다. 화살표는 따라가는 방향이나 메시지가 가는 방향이다.'
const expectedScenarios = [
  {
    id: 'path', label: '나무 따라가기',
    nodes: [...branchIds, ...linkIds, 'oid'], paths: [...walkIds, 'to-oid'], notes: ['join-note'],
    caption: '맨 위의 iso(1)에서 org(3), dod(6), internet(1), mgmt(2), mib-2(1), system(1)을 거쳐 sysUpTime(3)까지 가지를 따라간다. 지나온 가지의 번호를 차례로 점으로 이으면 OID 1.3.6.1.2.1.1.3이 된다.',
  },
  {
    id: 'object', label: '관리 객체',
    nodes: ['sysuptime', 'oid'], paths: ['to-oid'], notes: ['object-note'],
    caption: '1.3.6.1.2.1.1.3은 sysUpTime이라는 관리 객체의 이름표다. 이 값은 장비에서 네트워크 관리를 맡은 부분이 마지막으로 다시 시작된 뒤 흐른 시간이고, 100분의 1초 단위로 센다.',
  },
  {
    id: 'agent', label: '값은 에이전트에',
    nodes: ['oid', 'manager', 'agent'], paths: ['ask', 'answer'], notes: ['ask-note', 'value-note'],
    caption: '매니저는 이 OID 뒤에 0을 붙인 1.3.6.1.2.1.1.3.0으로 「라우터 1」의 에이전트에게 값을 묻고, 에이전트가 자기 장비의 MIB에서 찾은 값을 응답에 채워 돌려준다. 값을 가진 쪽은 매니저가 아니라 에이전트다.',
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
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)!
const brightNodes = () => nodeIds.filter((id) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (item) => item.getAttribute('data-note')!)

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 200] : [0, 0, 280, 488]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<MibTreeDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 가지가 모두 선명하고 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<MibTreeDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(Array.from(svg().querySelectorAll('[data-link]'), (link) => link.getAttribute('data-link'))).toEqual(linkIds)
    for (const element of svg().querySelectorAll('[data-link]')) {
      expect(element).toHaveAttribute('opacity', '1')
      expect(element).not.toHaveAttribute('marker-end')
      expect(element).toHaveAttribute('d', paths[element.getAttribute('data-link')!])
    }
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·가지·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<MibTreeDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    for (const id of linkIds) expect(svg().querySelector(`[data-link="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownPaths()).toEqual(scenario.paths)
    expect(shownNotes()).toEqual(scenario.notes)
    for (const id of scenario.notes) expect(note(id).textContent).toBe(noteLabels[id])
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
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말이 자리에 들어간다`, async () => {
    render(<MibTreeDiagram />)
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
    // 곁말은 시나리오를 골랐을 때만 보이므로, 시나리오를 차례로 골라 모두 잰다.
    const noteTexts: SvgBox[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of scenario.notes) {
        expect(note(id)).toHaveAttribute('font-size', '9')
        expect(note(id)).toHaveClass('fill-muted')
        noteTexts.push(textBox(note(id), id))
      }
    }
    expect(noteTexts.map(({ id }) => id)).toEqual(noteIds)
    for (const box of noteTexts) {
      expect(box.x, box.id).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width, box.id).toBeLessThanOrEqual(viewBox[2])
      expect(box.y, box.id).toBeGreaterThanOrEqual(0)
      expect(box.y + box.height, box.id).toBeLessThanOrEqual(viewBox[3])
      for (const d of Object.values(paths)) {
        for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
      }
      for (const id of nodeIds) expect(overlaps(box, nodeBox(id)), `${box.id} ↔ ${id}`).toBe(false)
    }
    for (let i = 0; i < noteTexts.length; i += 1) {
      for (const other of noteTexts.slice(i + 1)) expect(overlaps(noteTexts[i], other), `${noteTexts[i].id} ↔ ${other.id}`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('경로 양 끝은 노드 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', () => {
    render(<MibTreeDiagram />)
    for (const [id, d] of Object.entries(paths)) {
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
      }
      const { start, end } = lineEnds(d)
      expect(endAt(start), `${id} 시작`).toBe(ends[id][0])
      expect(endAt(end), `${id} 끝`).toBe(ends[id][1])
    }
  })

  // 요점: 나무를 맨 위에서 가지를 따라 내려가며 번호를 이으면 OID가 되고, 그 OID는 sysUpTime의 이름표다.
  it('가지를 따라 번호를 이으면 1.3.6.1.2.1.1.3이 되고, 관리 객체 시나리오에서 선명한 노드는 sysUpTime과 그 OID다', async () => {
    render(<MibTreeDiagram />)
    const child = new Map(linkIds.map((id) => [ends[id][0], ends[id][1]]))
    const order = ['iso']
    while (child.has(order[order.length - 1])) order.push(child.get(order[order.length - 1])!)
    expect(order).toEqual(branchIds)
    const numbers = order.map((id) => label(id).match(/\((\d+)\)$/u)![1])
    expect(numbers.join('.')).toBe('1.3.6.1.2.1.1.3')
    expect(label('oid')).toBe(numbers.join('.'))
    for (const id of linkIds) {
      const { start } = lineEnds(paths[id])
      const parent = nodeBox(ends[id][0])
      // 세로형에서는 가지가 위 노드의 아래 변에서 시작하고, 가로형에서는 위 노드의 변 가운데 하나에서 시작한다.
      if (!wide) expect(start.y, id).toBe(parent.y + parent.height)
      expect(onEdge(start.x, start.y, parent), id).toBe(true)
    }

    await select('관리 객체')
    expect(brightNodes()).toEqual(['sysuptime', 'oid'])
    expect(brightNodes().map(label).join(' ')).toContain('sysUpTime')

    await select('값은 에이전트에')
    expect(endAt(lineEnds(paths.ask).start)).toBe('manager')
    expect(endAt(lineEnds(paths.answer).start)).toBe('agent')
    expect(label('agent')).toContain('에이전트')

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const name of [...branchIds.map((id) => `\`${labels[id]}\``), '`1.3.6.1.2.1.1.3`', '`1.3.6.1.2.1.1.3.0`', '「라우터 1」', '에이전트', '매니저']) {
      expect(body, name).toContain(name)
    }
  })
}

describe('MibTreeDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·가지 id 집합과 경로 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<MibTreeDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 488')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallLinks = Array.from(svg().querySelectorAll('[data-link]'), (link) => link.getAttribute('data-link'))
      await select('값은 에이전트에')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 200')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-link]'), (link) => link.getAttribute('data-link'))).toEqual(tallLinks)
      expect(screen.getByRole('button', { name: '값은 에이전트에' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><MibTreeDiagram /><MibTreeDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '나무 따라가기' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<MibTreeDiagram />)
    const text = visualsByTopicId[topicId].diagrams['mib-tree']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(mibTreeScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = mibTreeScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 MIB 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
