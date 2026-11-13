import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { NameServerRolesDiagram, nameServerRolesScenarios } from './NameServerRolesDiagram'

const topicId = 'dns'
const anchorConceptId = `${topicId}.name-servers`
const labels: Record<string, string> = {
  root: '루트 네임 서버',
  tld: 'com TLD 네임 서버',
  auth: 'example.com의 권한 있는 네임 서버',
  client: '클라이언트',
  local: '로컬 DNS 서버',
}
const groupLabels: Record<string, string> = {
  layers: '이름의 단계를 나눠 맡는 서버',
  resolver: '대신 찾아 주는 서버',
}
const noteLabels: Record<string, string> = {
  'root-note': '최상위 도메인을 맡은 서버를 알려 준다',
  'tld-note': 'example.com을 맡은 서버를 알려 준다',
  'auth-note': '원본 정보로 최종 답을 준다',
  'local-note': '클라이언트 대신 차례로 묻는다',
}
const noteScenario: Record<string, string> = {
  'root-note': 'root',
  'tld-note': 'tld',
  'auth-note': 'authoritative',
  'local-note': 'local',
}
// 곁말은 자기 시나리오에서만 보이고, 그 시나리오가 다루는 서버 바로 아래에 놓인다.
const noteNode: Record<string, string> = { 'root-note': 'root', 'tld-note': 'tld', 'auth-note': 'auth', 'local-note': 'local' }
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const layerIds = ['root', 'tld', 'auth']
const linkIds = ['l-root-tld', 'l-tld-auth']

const tallPaths: Record<string, string> = {
  'l-root-tld': 'M48 56 V80',
  'l-tld-auth': 'M48 112 V136',
  'ask-local': 'M140 240 V276',
}
const widePaths: Record<string, string> = {
  'l-root-tld': 'M36 60 V84',
  'l-tld-auth': 'M36 116 V140',
  'ask-local': 'M380 60 V100',
}
const ends: Record<string, [string, string]> = {
  'l-root-tld': ['root', 'tld'],
  'l-tld-auth': ['tld', 'auth'],
  'ask-local': ['client', 'local'],
}

const question = '네임 서버는 저마다 무엇을 맡을까?'
const figureName = '이름의 단계를 나눠 맡는 루트 네임 서버, TLD 네임 서버, 권한 있는 네임 서버와, 클라이언트 대신 찾아 주는 로컬 DNS 서버가 저마다 무엇을 맡고 무엇을 돌려주는지 보이는 도식'
const svgName = '한 묶음에 루트 네임 서버, com TLD 네임 서버, example.com의 권한 있는 네임 서버를 위에서 아래로 잇고, 다른 묶음에 로컬 DNS 서버를 두고 그 위에 클라이언트를 놓은 그림'
const idleCaption = 'www.example.com을 예로, 이름의 단계를 나눠 맡는 세 서버와 클라이언트 대신 찾아 주는 로컬 DNS 서버를 나눠 놓았다. 이름과 주소는 예로 붙인 것이다. 버튼을 고르면 서버마다 맡는 것과 돌려주는 것을 볼 수 있다.'
const legend = '세 서버를 잇는 선은 위 단계와 그 아래 단계를 잇는다. 화살표는 클라이언트가 보내는 질의다.'
const expectedScenarios = [
  {
    id: 'root', label: '루트',
    nodes: ['root'], paths: [] as string[],
    caption: '루트 네임 서버는 이름 나무의 맨 위인 루트를 맡는다. www.example.com을 물으면 IP 주소 대신 최상위 도메인 com을 맡은 서버들을 알려 준다.',
  },
  {
    id: 'tld', label: 'TLD',
    nodes: ['tld'], paths: [] as string[],
    caption: 'com TLD 네임 서버는 최상위 도메인 com을 맡는다. www.example.com을 물으면 역시 IP 주소 대신 그 아래 example.com을 맡은 서버들을 알려 준다.',
  },
  {
    id: 'authoritative', label: '권한 있는 서버',
    nodes: ['auth'], paths: [] as string[],
    caption: 'example.com의 권한 있는 네임 서버는 이 도메인의 정보를 원본으로 갖고 있어, 다른 서버에 묻지 않고 www.example.com의 IP 주소 198.51.100.10을 최종 답으로 준다.',
  },
  {
    id: 'local', label: '로컬 DNS 서버',
    nodes: ['client', 'local'], paths: ['ask-local'],
    caption: '로컬 DNS 서버는 이름의 어느 단계를 맡는 서버가 아니다. 클라이언트가 가장 먼저 찾아와 묻는 서버로, 클라이언트 대신 단계를 맡은 서버들에 차례로 물어 최종 답을 얻어 준다.',
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
const link = (id: string) => svg().querySelector(`[data-link="${id}"]`)!
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 208] : [0, 0, 280, 340]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<NameServerRolesDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 세 서버를 잇는 선만 보이며 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<NameServerRolesDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(Array.from(svg().querySelectorAll('[data-link]'), (item) => item.getAttribute('data-link'))).toEqual(linkIds)
    for (const id of linkIds) {
      expect(link(id)).toHaveAttribute('d', paths[id])
      expect(link(id)).toHaveClass('stroke-muted')
      expect(link(id)).not.toHaveAttribute('marker-end')
      expect(link(id).closest('[opacity]')).toBeNull()
    }
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보이고 그룹 박스와 잇는 선은 흐려지지 않는다', async (scenario) => {
    const { container } = render(<NameServerRolesDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    const scenarioNotes = Object.keys(noteScenario).filter((id) => noteScenario[id] === scenario.id)
    expect(shownNotes()).toEqual(scenarioNotes)
    for (const id of shownNotes()) expect(note(id)!.textContent).toBe(noteLabels[id])
    expect(shownPaths()).toEqual(scenario.paths)
    for (const path of svg().querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('d', paths[path.getAttribute('data-path')!])
      expect(path).toHaveAttribute('stroke-width', '2')
      expect(path).toHaveClass('stroke-title')
      expect(path).toHaveAttribute('marker-end', `url(#${svg().querySelector('marker')!.id})`)
      expect(path.closest('[opacity]')).toBeNull()
    }
    for (const id of linkIds) expect(link(id).closest('[opacity]'), id).toBeNull()
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말·그룹 라벨이 자리에 들어간다`, async () => {
    render(<NameServerRolesDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    expect(overlaps(groupBox('layers'), groupBox('resolver'))).toBe(false)
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    for (const id of layerIds) expect(contains(groupBox('layers'), nodeBox(id)), id).toBe(true)
    expect(contains(groupBox('resolver'), nodeBox('local'))).toBe(true)
    // 클라이언트는 서버가 아니므로 두 묶음 어디에도 들지 않는다.
    for (const id of groupIds) expect(overlaps(groupBox(id), nodeBox('client')), id).toBe(false)
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
        // 곁말은 자기 서버와 같은 묶음 안에서, 그 서버 바로 아래 줄에 놓인다.
        const own = nodeBox(noteNode[id])
        expect(contains(groupBox(id === 'local-note' ? 'resolver' : 'layers'), box), id).toBe(true)
        expect(box.y, id).toBeGreaterThanOrEqual(own.y + own.height)
        expect(box.y - (own.y + own.height), id).toBeLessThanOrEqual(12)
        expect(box.x, id).toBeGreaterThanOrEqual(own.x)
        expect(box.x + box.width, id).toBeLessThanOrEqual(own.x + own.width + 12)
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
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('선과 화살표의 양 끝은 노드의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<NameServerRolesDiagram />)
    for (const [id, d] of Object.entries(paths)) {
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
      const { start, end } = lineEnds(d)
      expect(endAt(start), `${id} 시작`).toBe(ends[id][0])
      expect(endAt(end), `${id} 끝`).toBe(ends[id][1])
    }
  })

  // 요점: 단계를 맡는 세 서버는 루트 → TLD → 권한 있는 서버 차례로 위에서 아래로 놓이고 한 묶음에 든다.
  // 로컬 DNS 서버를 고르면 단계를 맡는 세 서버가 모두 흐리고, 클라이언트의 질의는 로컬 DNS 서버로 간다.
  it('단계를 맡는 세 서버는 루트 → TLD → 권한 있는 서버 차례로 놓이고, 로컬 DNS 서버를 고르면 그 셋이 모두 흐리다', async () => {
    render(<NameServerRolesDiagram />)
    const ys = layerIds.map((id) => nodeBox(id).y)
    expect([...ys].sort((a, b) => a - b)).toEqual(ys)
    expect(new Set(ys).size).toBe(3)
    // 클라이언트는 로컬 DNS 서버 위에 있다.
    expect(nodeBox('client').y + nodeBox('client').height).toBeLessThanOrEqual(nodeBox('local').y)

    await select('로컬 DNS 서버')
    for (const id of layerIds) expect(opacityOf(id), id).toBe('0.25')
    expect(endAt(lineEnds(paths['ask-local']).start)).toBe('client')
    expect(endAt(lineEnds(paths['ask-local']).end)).toBe('local')
    for (const scenario of expectedScenarios.filter(({ id }) => id !== 'local')) {
      await select(scenario.label)
      expect(opacityOf('local'), scenario.id).toBe('0.25')
      expect(shownPaths(), scenario.id).toEqual([])
    }

    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join('\n')
    expect(body).toContain('그 이름의 최상위 도메인을 맡은 서버들을 알려 준다.')
    expect(body).toContain('`com`을 맡은 TLD 네임 서버에 `www.example.com`을 물으면 `example.com`을 맡은 서버들을 알려 준다.')
    expect(body).toContain('`www.example.com`의 IP 주소 `198.51.100.10`은 `example.com`의 권한 있는 네임 서버가 최종 답으로 알려 준다.')
    expect(body).toContain('이름의 어느 단계를 맡는 서버가 아니라, 클라이언트를 대신해')
    expect(body).toContain('`com`은 `com` TLD 네임 서버가, `example.com`과 그 아래 `www.example.com`은 `example.com`의 권한 있는 네임 서버가 맡는다.')
  })
}

describe('NameServerRolesDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선·화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<NameServerRolesDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 340')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('로컬 DNS 서버')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 208')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '로컬 DNS 서버' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      for (const id of linkIds) expect(link(id)).toHaveAttribute('d', widePaths[id])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><NameServerRolesDiagram /><NameServerRolesDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '로컬 DNS 서버' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<NameServerRolesDiagram />)
    const text = visualsByTopicId[topicId].diagrams['name-server-roles']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(nameServerRolesScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = nameServerRolesScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 네임 서버의 종류 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
