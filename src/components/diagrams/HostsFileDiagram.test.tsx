import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { HostsFileDiagram, hostsFileScenarios } from './HostsFileDiagram'

const topicId = 'dns'
const anchorConceptId = `${topicId}.hosts-file`
const labels: Record<string, string> = {
  addr: '192.0.2.20',
  canonical: 'server1.example.com',
  alias: 'server1',
  'find-listed': 'server1 찾기',
  'find-unlisted': 'www.example.com 찾기',
  'look-hosts': '/etc/hosts 보기',
  'ask-dns': 'DNS 서버에 묻기',
}
const groupLabels: Record<string, string> = {
  line: '/etc/hosts의 한 줄',
  order: 'hosts: files dns일 때',
}
// 칸 이름 곁말은 늘 보이고 자기 칸 노드의 opacity를 따른다. 결과 곁말은 자기 시나리오에서만 보인다.
const fieldNoteOf: Record<string, string> = { 'addr-name': 'addr', 'canonical-name': 'canonical', 'alias-name': 'alias' }
const noteLabels: Record<string, string> = {
  'addr-name': 'IP 주소',
  'canonical-name': '정식 이름',
  'alias-name': '별명',
  'listed-result': '192.0.2.20을 쓴다',
  'unlisted-result': '파일에 없는 이름',
}
const noteScenario: Record<string, string> = { 'listed-result': 'listed', 'unlisted-result': 'unlisted' }
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const fieldIds = ['addr', 'canonical', 'alias']
const flowIds = ['find-listed', 'find-unlisted', 'look-hosts', 'ask-dns']

const tallPaths: Record<string, string> = {
  'listed-to-hosts': 'M58 144 V176',
  'unlisted-to-hosts': 'M160 144 V160 H100 V176',
  'hosts-to-dns': 'M128 192 H156',
}
const widePaths: Record<string, string> = {
  'listed-to-hosts': 'M164 132 H176 V144 H188',
  'unlisted-to-hosts': 'M164 172 H176 V160 H188',
  'hosts-to-dns': 'M304 152 H316',
}
const ends: Record<string, [string, string]> = {
  'listed-to-hosts': ['find-listed', 'look-hosts'],
  'unlisted-to-hosts': ['find-unlisted', 'look-hosts'],
  'hosts-to-dns': ['look-hosts', 'ask-dns'],
}

const question = 'hosts 파일에 적어 둔 이름은 어디서 주소를 찾을까?'
const figureName = '/etc/hosts의 한 줄을 IP 주소·정식 이름·별명 칸으로 나누고, hosts 파일을 먼저 보는 차례에서 파일에 적힌 이름과 없는 이름이 어디서 주소를 얻는지 보이는 도식'
const svgName = '위에 /etc/hosts의 한 줄 192.0.2.20, server1.example.com, server1을 칸 셋으로 나눠 놓고, 아래에 server1 찾기와 www.example.com 찾기가 /etc/hosts 보기로 이어지고 그 옆에 DNS 서버에 묻기가 있는 그림'
const idleCaption = '위는 /etc/hosts의 예 한 줄이고, 아래는 Linux에서 /etc/nsswitch.conf에 hosts: files dns라고 적어 hosts 파일을 먼저 보는 차례다. 주소와 이름은 예로 붙인 것이다. 버튼을 고르면 줄의 칸과, 파일에 적힌 이름과 없는 이름이 어디서 주소를 얻는지 볼 수 있다.'
const legend = '위 박스의 노드 셋은 한 줄의 칸을 왼쪽부터 차례로 놓은 것이고, 노드 아래 글은 그 칸의 이름이다. 화살표는 이름을 찾는 차례다.'
const expectedScenarios = [
  {
    id: 'fields', label: '줄의 칸',
    nodes: ['addr', 'canonical', 'alias'], paths: [] as string[],
    caption: '한 줄에는 IP 주소 192.0.2.20, 그 주소를 가진 호스트의 정식 이름 server1.example.com, 별명 server1을 차례로 적고 칸 사이는 빈칸이나 탭으로 띄운다. 별명은 정식 이름 대신 쓸 수 있는 짧은 이름이다.',
  },
  {
    id: 'listed', label: '적힌 이름',
    nodes: ['addr', 'canonical', 'alias', 'find-listed', 'look-hosts'], paths: ['listed-to-hosts'],
    caption: 'server1은 이 줄에 별명으로 적혀 있다. hosts 파일을 먼저 보는 차례라서 /etc/hosts에서 짝을 찾으면 거기서 192.0.2.20을 얻고, DNS 서버에는 묻지 않는다.',
  },
  {
    id: 'unlisted', label: '없는 이름',
    nodes: ['find-unlisted', 'look-hosts', 'ask-dns'], paths: ['unlisted-to-hosts', 'hosts-to-dns'],
    caption: 'www.example.com은 /etc/hosts에 적혀 있지 않다. 그래서 파일에서 짝을 찾지 못하고, 다음 차례인 DNS 서버에 이 이름의 IP 주소를 묻는다.',
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 208] : [0, 0, 280, 240]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<HostsFileDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 칸 이름만 보이며 화살표와 결과 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<HostsFileDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual(Object.keys(fieldNoteOf))
    for (const id of Object.keys(fieldNoteOf)) expect(note(id)).toHaveAttribute('opacity', '1')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<HostsFileDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    const resultNotes = Object.keys(noteScenario).filter((id) => noteScenario[id] === scenario.id)
    expect(shownNotes()).toEqual([...Object.keys(fieldNoteOf), ...resultNotes])
    for (const id of shownNotes()) expect(note(id)!.textContent).toBe(noteLabels[id])
    // 칸 이름 곁말은 자기 칸 노드와 함께 흐려지고 밝아진다.
    for (const [id, field] of Object.entries(fieldNoteOf)) expect(note(id), id).toHaveAttribute('opacity', opacityOf(field)!)
    for (const id of resultNotes) expect(note(id)!.getAttribute('opacity'), id).toBeNull()
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
    render(<HostsFileDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    expect(overlaps(groupBox('line'), groupBox('order'))).toBe(false)
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    for (const id of fieldIds) expect(contains(groupBox('line'), nodeBox(id)), id).toBe(true)
    for (const id of flowIds) expect(contains(groupBox('order'), nodeBox(id)), id).toBe(true)
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
        // 칸 이름 곁말은 줄 박스 안에서 자기 칸 노드 바로 아래, 그 칸의 가로 범위 안에 놓인다.
        if (fieldNoteOf[id]) {
          const field = nodeBox(fieldNoteOf[id])
          expect(contains(groupBox('line'), box), id).toBe(true)
          expect(box.y, id).toBeGreaterThanOrEqual(field.y + field.height)
          expect(box.x, id).toBeGreaterThanOrEqual(field.x)
          expect(box.x + box.width, id).toBeLessThanOrEqual(field.x + field.width)
        } else {
          expect(contains(groupBox('order'), box), id).toBe(true)
        }
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
    render(<HostsFileDiagram />)
    for (const [id, d] of Object.entries(paths)) {
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
        // 찾는 차례의 화살표는 모두 아래 박스 안에 있다.
        const span = { id: '', x: Math.min(segment.x1, segment.x2), y: Math.min(segment.y1, segment.y2), width: Math.abs(segment.x2 - segment.x1), height: Math.abs(segment.y2 - segment.y1) }
        expect(contains(groupBox('order'), span), id).toBe(true)
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

  // 요점: 파일에 적힌 이름은 파일에서 짝을 얻고 DNS 서버에 묻지 않으며, 없는 이름만 DNS 서버로 넘어간다.
  // 줄의 칸은 왼쪽부터 IP 주소 → 정식 이름 → 별명 차례다.
  it('적힌 이름은 DNS 서버에 묻지 않고 없는 이름은 묻으며, 칸은 왼쪽부터 IP 주소 → 정식 이름 → 별명이다', async () => {
    render(<HostsFileDiagram />)
    const xs = fieldIds.map((id) => nodeBox(id).x)
    expect([...xs].sort((a, b) => a - b)).toEqual(xs)
    // 칸은 빈틈없이 한 줄로 잇는다.
    for (let i = 1; i < fieldIds.length; i += 1) {
      expect(nodeBox(fieldIds[i]).x).toBe(nodeBox(fieldIds[i - 1]).x + nodeBox(fieldIds[i - 1]).width)
      expect(nodeBox(fieldIds[i]).y).toBe(nodeBox(fieldIds[0]).y)
    }
    expect(fieldIds.map((id) => noteLabels[Object.keys(fieldNoteOf).find((note) => fieldNoteOf[note] === id)!])).toEqual(['IP 주소', '정식 이름', '별명'])
    // 찾는 이름 server1은 이 줄의 별명이고, www.example.com은 줄 어디에도 없다.
    expect(label('find-listed')).toContain(label('alias'))
    expect(fieldIds.some((id) => label('find-unlisted').includes(label(id)))).toBe(false)

    const askDns = (id: string) => endAt(lineEnds(paths[id]).end) === 'ask-dns'
    await select('적힌 이름')
    expect(shownPaths().some(askDns)).toBe(false)
    expect(opacityOf('ask-dns')).toBe('0.25')
    expect(note('listed-result')!.textContent).toContain(label('addr'))
    await select('없는 이름')
    expect(shownPaths().some(askDns)).toBe(true)
    expect(opacityOf('ask-dns')).toBe('1')
    for (const id of fieldIds) expect(opacityOf(id), id).toBe('0.25')
    // 두 경우 모두 /etc/hosts를 먼저 본다.
    for (const scenario of ['적힌 이름', '없는 이름']) {
      await select(scenario)
      expect(shownPaths().some((id) => endAt(lineEnds(paths[id]).end) === 'look-hosts'), scenario).toBe(true)
    }

    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join('\n')
    expect(body).toContain('`192.0.2.20 server1.example.com server1`')
    expect(body).toContain('첫 칸 `192.0.2.20`이 IP 주소, 둘째 칸 `server1.example.com`이 정식 이름, 셋째 칸 `server1`이 별명이다.')
    expect(body).toContain('이 줄을 `hosts: files dns`로 적으면 `files`, 곧 `/etc/hosts`를 먼저 보고 거기서 찾지 못했을 때 `dns`, 곧 DNS 서버에 묻는다.')
    expect(body).toContain('반면 파일에 없는 `www.example.com`은 파일에서 짝을 찾지 못하므로 DNS 서버에 묻는다.')
  })
}

describe('HostsFileDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<HostsFileDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 240')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('없는 이름')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 208')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '없는 이름' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><HostsFileDiagram /><HostsFileDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '없는 이름' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<HostsFileDiagram />)
    const text = visualsByTopicId[topicId].diagrams['hosts-file']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(hostsFileScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = hostsFileScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 hosts 파일 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
