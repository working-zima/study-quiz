import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ResolvConfDiagram, resolvConfScenarios } from './ResolvConfDiagram'

const topicId = 'linux-servers'
const anchorConceptId = `${topicId}.resolv-conf`
const labels: Record<string, string> = {
  ns1: 'nameserver 192.0.2.53',
  ns2: 'nameserver 192.0.2.54',
  search: 'search example.com',
  short: 'server1',
  full: 'server1.example.com',
  dns1: 'DNS 서버 192.0.2.53',
  dns2: 'DNS 서버 192.0.2.54',
}
const groupLabels: Record<string, string> = {
  file: '/etc/resolv.conf',
  lookup: 'server1을 풀 때',
}
const noteLabels: Record<string, string> = {
  first: '먼저 묻는다',
  second: '그다음에 묻는다',
  attach: 'example.com을 붙인다',
  'no-answer': '답이 없다',
  next: '다음 서버에 묻는다',
}
const noteScenario: Record<string, string> = {
  first: 'servers', second: 'servers', attach: 'search', 'no-answer': 'fallback', next: 'fallback',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const lineIds = ['ns1', 'ns2', 'search']
const lookupIds = ['short', 'full', 'dns1', 'dns2']

const tallPaths: Record<string, string> = {
  'add-domain': 'M84 194 H124',
  'ask-first': 'M200 210 V242',
  'ask-second': 'M130 210 V300 H140',
}
const widePaths: Record<string, string> = {
  'add-domain': 'M272 46 H284',
  'ask-first': 'M352 62 V108',
  'ask-second': 'M420 46 H428 V188 H420',
}
const ends: Record<string, [string, string]> = {
  'add-domain': ['short', 'full'],
  'ask-first': ['full', 'dns1'],
  'ask-second': ['full', 'dns2'],
}

const question = 'Linux는 이름을 풀 때 어느 DNS 서버에 물을까?'
const figureName = '/etc/resolv.conf의 nameserver 두 줄과 search 한 줄을 놓고, 짧은 이름 server1을 풀 때 example.com을 붙여 적힌 차례대로 DNS 서버에 묻는 것을 보이는 도식'
const svgName = '위에 nameserver 192.0.2.53, nameserver 192.0.2.54, search example.com 세 줄이 있고, 아래에 server1에서 server1.example.com으로 가는 화살표와 DNS 서버 192.0.2.53, DNS 서버 192.0.2.54가 있는 그림'
const idleCaption = '위는 /etc/resolv.conf에 적은 예 세 줄이고, 아래는 이 컴퓨터가 짧은 이름 server1을 풀 때의 차례다. 주소와 이름은 예로 붙인 것이다. 버튼을 고르면 물을 서버, 짧은 이름에 도메인을 붙이는 일, 첫 서버가 답하지 않을 때를 볼 수 있다.'
const legend = '위 박스의 노드는 파일의 한 줄이다. 아래 화살표는 짧은 이름에 도메인을 붙이고 DNS 서버에 묻는 차례다.'
const expectedScenarios = [
  {
    id: 'servers', label: '물을 서버',
    nodes: ['ns1', 'ns2', 'dns1', 'dns2'], paths: [] as string[],
    caption: 'nameserver 두 줄에 적은 192.0.2.53과 192.0.2.54가 이 컴퓨터가 물을 DNS 서버다. 리졸버는 적힌 차례대로 192.0.2.53에 먼저 묻는다.',
  },
  {
    id: 'search', label: '짧은 이름',
    nodes: ['search', 'short', 'full'], paths: ['add-domain'],
    caption: 'search example.com이 있으면, 점이 없는 짧은 이름 server1을 풀 때 리졸버가 그 뒤에 example.com을 붙여 server1.example.com을 만들고 그 이름의 IP 주소를 DNS 서버에 묻는다.',
  },
  {
    id: 'fallback', label: '답이 없을 때',
    nodes: ['full', 'dns1', 'dns2'], paths: ['ask-first', 'ask-second'],
    caption: '192.0.2.53이 정해진 시간 안에 답하지 않으면, 리졸버는 같은 이름 server1.example.com을 다음 줄에 적힌 192.0.2.54에 묻는다.',
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

const endAt = (point: { x: number, y: number }) => nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))
const groupLabelBox = (id: string) => textBox(svg().querySelector(`[data-group-label="${id}"]`)!, `${id}-label`)
const centerY = (box: SvgBox) => box.y + box.height / 2
const addressOf = (text: string) => text.slice(text.lastIndexOf(' ') + 1)

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 240] : [0, 0, 280, 332]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<ResolvConfDiagram />)
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
    const { container } = render(<ResolvConfDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<ResolvConfDiagram />)
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
    render(<ResolvConfDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    expect(overlaps(groupBox('file'), groupBox('lookup'))).toBe(false)
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    for (const id of lineIds) expect(contains(groupBox('file'), nodeBox(id)), id).toBe(true)
    for (const id of lookupIds) expect(contains(groupBox('lookup'), nodeBox(id)), id).toBe(true)
    const groupTexts = groupIds.map((id) => {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
      return box
    })
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const noteTexts = shownNotes().map((id) => {
        const element = note(id)!
        expect(element).toHaveAttribute('font-size', '9')
        expect(element).toHaveClass('fill-muted')
        const box = textBox(element, id)
        for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        expect(contains(groupBox('lookup'), box), id).toBe(true)
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
      for (let i = 0; i < noteTexts.length; i += 1) {
        for (const other of noteTexts.slice(i + 1)) expect(overlaps(noteTexts[i], other), `${noteTexts[i].id} ↔ ${other.id}`).toBe(false)
      }
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표 양 끝은 노드의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나거나 같은 시나리오의 다른 화살표와 만나지 않는다', async () => {
    render(<ResolvConfDiagram />)
    for (const [id, d] of Object.entries(paths)) {
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
        // 이름을 붙이고 묻는 화살표는 모두 아래 박스 안에 있다.
        const span = { id: '', x: Math.min(segment.x1, segment.x2), y: Math.min(segment.y1, segment.y2), width: Math.abs(segment.x2 - segment.x1), height: Math.abs(segment.y2 - segment.y1) }
        expect(contains(groupBox('lookup'), span), id).toBe(true)
      }
      const { start, end } = lineEnds(d)
      expect(endAt(start), `${id} 시작`).toBe(ends[id][0])
      expect(endAt(end), `${id} 끝`).toBe(ends[id][1])
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

  // 요점: 물을 DNS 서버는 nameserver 줄에 적은 주소이고 적은 차례대로 묻는다. 짧은 이름에는 search 줄의 도메인을 붙인다.
  // 첫 서버가 답하지 않으면 같은 이름을 다음 서버에 묻는다.
  it('물을 서버는 nameserver 줄의 주소와 같은 차례이고, 붙여 만든 이름은 search 줄의 도메인으로 끝나며, 답이 없으면 다음 서버에 묻는다', async () => {
    render(<ResolvConfDiagram />)
    // 파일의 줄은 위에서 아래로 nameserver 둘, search 하나 차례다.
    const lineYs = lineIds.map((id) => nodeBox(id).y)
    expect([...lineYs].sort((a, b) => a - b)).toEqual(lineYs)

    await select('물을 서버')
    const litLines = ['ns1', 'ns2'].filter((id) => opacityOf(id) === '1')
    const litServers = ['dns1', 'dns2'].filter((id) => opacityOf(id) === '1')
    expect(litLines).toEqual(['ns1', 'ns2'])
    expect(litServers.map((id) => addressOf(label(id)))).toEqual(litLines.map((id) => addressOf(label(id))))
    for (const id of litLines) expect(label(id).startsWith('nameserver ')).toBe(true)
    // 첫째 줄의 서버가 위에 있고, 「먼저」 곁말은 그 서버 곁에, 「그다음에」 곁말은 다음 서버 곁에 있다.
    expect(nodeBox('dns1').y).toBeLessThan(nodeBox('dns2').y)
    const firstY = centerY(textBox(note('first')!, 'first'))
    const secondY = centerY(textBox(note('second')!, 'second'))
    expect(Math.abs(firstY - centerY(nodeBox('dns1')))).toBeLessThan(Math.abs(firstY - centerY(nodeBox('dns2'))))
    expect(Math.abs(secondY - centerY(nodeBox('dns2')))).toBeLessThan(Math.abs(secondY - centerY(nodeBox('dns1'))))

    await select('짧은 이름')
    const domain = label('search').replace('search ', '')
    expect(label('full').endsWith(`.${domain}`)).toBe(true)
    expect(label('full')).toBe(`${label('short')}.${domain}`)
    expect(label('short')).not.toContain('.')
    expect(note('attach')!.textContent).toContain(domain)
    for (const id of ['dns1', 'dns2']) expect(opacityOf(id), id).toBe('0.25')

    await select('답이 없을 때')
    expect(shownPaths().map((id) => endAt(lineEnds(paths[id]).end))).toEqual(['dns1', 'dns2'])
    for (const id of shownPaths()) expect(endAt(lineEnds(paths[id]).start), id).toBe('full')
    expect(Math.abs(centerY(textBox(note('no-answer')!, 'no-answer')) - centerY(nodeBox('dns1'))))
      .toBeLessThan(Math.abs(centerY(textBox(note('no-answer')!, 'no-answer')) - centerY(nodeBox('dns2'))))

    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join('\n')
    expect(body).toContain('`nameserver 192.0.2.53`, `nameserver 192.0.2.54`, `search example.com` 세 줄이 차례로 적혀 있다고 하자.')
    expect(body).toContain('리졸버는 적힌 차례대로 먼저 `192.0.2.53`에 묻는다. 그 서버가 정해진 시간 안에 답하지 않으면 다음 줄의 `192.0.2.54`에 묻고')
    expect(body).toContain('리졸버는 그 뒤에 `example.com`을 붙인 `server1.example.com`을 만들어 DNS 서버 `192.0.2.53`에 이 이름의 IP 주소를 묻는다.')
  })
}

describe('ResolvConfDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<ResolvConfDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 332')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('답이 없을 때')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 240')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '답이 없을 때' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><ResolvConfDiagram /><ResolvConfDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '답이 없을 때' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<ResolvConfDiagram />)
    const text = visualsByTopicId[topicId].diagrams['resolv-conf']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(resolvConfScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = resolvConfScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 DNS 클라이언트 설정 파일 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
