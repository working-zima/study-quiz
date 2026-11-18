import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { IisSitePoolDiagram, iisSitePoolScenarios } from './IisSitePoolDiagram'

const topicId = 'windows-server-roles'
const anchorConceptId = `${topicId}.iis`
const labels: Record<string, string> = {
  'browser': '웹 브라우저',
  'manager': 'IIS 관리자',
  'www-site': 'www.example.com',
  'default-site': 'Default Web Site',
  'pool': 'DefaultAppPool',
}
const groupLabels: Record<string, string> = {
  'server': 'SRV01',
}
const noteLabels: Record<string, string> = {
  'request-note': 'www.example.com 요청',
  'worker-note': '작업자 프로세스가 처리한다',
  'manage-note': '사이트와 풀을 설정한다',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
// SRV01 박스 안에는 사이트 둘과 응용 프로그램 풀이 있다. 웹 브라우저와 IIS 관리자는 박스 밖에 있다.
const insideServer = ['www-site', 'default-site', 'pool']
const outsideServer = ['browser', 'manager']
// 화살표는 앞 노드의 변에서 시작해 뒤 노드(또는 #으로 적은 그룹 박스)의 변에서 끝난다.
const pathEnds: Record<string, [string, string]> = {
  'browser-www': ['browser', 'www-site'],
  'www-pool': ['www-site', 'pool'],
  'default-pool': ['default-site', 'pool'],
  'manager-server': ['manager', '#server'],
}
const tallPaths: Record<string, string> = {
  'browser-www': 'M60 40 V104',
  'www-pool': 'M104 136 V184',
  'default-pool': 'M176 136 V184',
  'manager-server': 'M220 40 V80',
}
const widePaths: Record<string, string> = {
  'browser-www': 'M96 56 H152',
  'www-pool': 'M248 72 V120',
  'default-pool': 'M320 72 V120',
  'manager-server': 'M96 136 H136',
}

const question = 'IIS에서 사이트와 응용 프로그램 풀은 어떻게 이어질까?'
const figureName = 'SRV01에 웹 서버(IIS)를 설치하면 생기는 Default Web Site와 새로 만든 사이트 www.example.com이 응용 프로그램 풀 DefaultAppPool을 함께 쓰고, 웹 브라우저의 요청은 사이트가 받아 풀의 작업자 프로세스가 처리하며, 관리자는 IIS 관리자로 이를 설정하는 것을 보이는 도식'
const svgName = '위에 웹 브라우저와 IIS 관리자를, 아래 SRV01 박스 안에 사이트 www.example.com과 Default Web Site를 한 줄로, 그 아래 응용 프로그램 풀 DefaultAppPool을 그린 그림'
const idleCaption = 'SRV01의 IIS에 사이트 둘과 응용 프로그램 풀 하나를 두었다. SRV01과 www.example.com은 예로 붙인 이름이고, Default Web Site와 DefaultAppPool은 IIS를 설치하면 생긴다. 버튼을 고르면 요청을 누가 받고 처리하는지, 관리자가 어디서 설정하는지 볼 수 있다.'
const legend = 'SRV01 박스 안의 위 줄은 사이트이고 아래 칸은 응용 프로그램 풀이다. 사이트에서 풀로 가는 화살표는 그 사이트를 맡은 풀을 가리킨다.'
const expectedScenarios = [
  {
    id: 'request', label: '요청',
    nodes: ['browser', 'www-site', 'pool'], paths: ['browser-www', 'www-pool'], notes: ['request-note', 'worker-note'],
    caption: '웹 브라우저가 www.example.com을 요청하면 바인딩이 그 요청에 맞는 사이트 www.example.com이 요청을 받는다. 이 사이트를 맡은 응용 프로그램 풀 DefaultAppPool의 작업자 프로세스가 그 요청을 처리한다.',
  },
  {
    id: 'shared', label: '같은 풀',
    nodes: ['www-site', 'default-site', 'pool'], paths: ['www-pool', 'default-pool'], notes: ['worker-note'],
    caption: 'Default Web Site와 www.example.com이 모두 DefaultAppPool을 쓰면 풀 하나가 두 사이트를 맡아, 그 풀의 작업자 프로세스가 두 사이트의 요청을 함께 처리한다. 사이트마다 풀을 따로 두면 한 풀의 문제가 다른 풀의 사이트에 번지지 않는다.',
  },
  {
    id: 'manage', label: '관리',
    nodes: ['manager', 'www-site', 'default-site', 'pool'], paths: ['manager-server'], notes: ['manage-note'],
    caption: '관리자는 실행 창에 inetmgr를 적어 IIS 관리자를 열고, SRV01에 사이트를 더하고 바인딩을 정하며, 응용 프로그램 풀을 만들고 사이트를 어느 풀에 맡길지 고른다.',
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
const endBox = (ref: string) => (ref.startsWith('#') ? groupBox(ref.slice(1)) : nodeBox(ref))
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 192] : [0, 0, 280, 256]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<IisSitePoolDiagram />)
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
    const { container } = render(<IisSitePoolDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<IisSitePoolDiagram />)
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
    render(<IisSitePoolDiagram />)
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
    }
    for (const id of insideServer) expect(contains(groupBox('server'), nodeBox(id)), `${id} ⊂ SRV01`).toBe(true)
    for (const id of outsideServer) expect(overlaps(groupBox('server'), nodeBox(id)), `${id}은 SRV01 밖`).toBe(false)
    for (const id of groupIds) {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
    }
    // 곁말은 viewBox 안에 들어가고, 노드·그룹 라벨·다른 곁말·선과 겹치지 않는다.
    const noteBoxes = new Map<string, SvgBox>()
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of scenario.notes) noteBoxes.set(id, textBox(note(id), id))
    }
    expect([...noteBoxes.keys()].sort()).toEqual([...noteIds].sort())
    for (const box of noteBoxes.values()) {
      expect(boxesOutsideViewBox([box], viewBox), box.id).toEqual([])
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
      for (const group of groupIds) expect(overlaps(box, groupLabelBox(group)), `${box.id} ↔ ${group} 라벨`).toBe(false)
      for (const other of [...noteBoxes.values()].filter(({ id }) => id !== box.id)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
      for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 앞 노드의 변에서 시작해 뒤 노드나 SRV01 박스의 변에서 끝나고, 노드 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<IisSitePoolDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(pathEnds)))
    for (const [id, d] of Object.entries(paths)) {
      const [from, to] = pathEnds[id]
      const { start, end } = lineEnds(d)
      expect(onEdge(start, endBox(from)), `${id} 시작`).toBe(true)
      expect(onEdge(end, endBox(to)), `${id} 끝`).toBe(true)
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
    }
  })

  // 요점: 「요청」의 화살표는 웹 브라우저에서 사이트로 들어갔다가 그 사이트에서 풀로 이어진다. 「같은 풀」에서는 사이트 둘에서 나온 화살표가 같은 풀 노드에서 끝난다.
  // 「관리」에서는 웹 브라우저가 흐리고, IIS 관리자의 화살표가 SRV01 박스에 닿는다.
  it('요청은 사이트를 거쳐 풀에 닿고, 같은 풀에서는 두 사이트의 화살표가 한 풀에서 끝나며, 관리에서는 웹 브라우저가 흐리다', async () => {
    render(<IisSitePoolDiagram />)

    await select('요청')
    expect(shownPaths()).toEqual(['browser-www', 'www-pool'])
    expect(opacity('browser')).toBe('1')
    const toSite = lineEnds(paths['browser-www'])
    const toPool = lineEnds(paths['www-pool'])
    expect(onEdge(toSite.end, nodeBox('www-site'))).toBe(true)
    expect(onEdge(toPool.start, nodeBox('www-site'))).toBe(true)
    expect(onEdge(toPool.end, nodeBox('pool'))).toBe(true)
    expect(opacity('default-site')).toBe('0.25')

    await select('같은 풀')
    const shared = shownPaths()
    expect(shared).toEqual(['www-pool', 'default-pool'])
    expect(new Set(shared.map((id) => pathEnds[id][1]))).toEqual(new Set(['pool']))
    expect(new Set(shared.map((id) => pathEnds[id][0]))).toEqual(new Set(['www-site', 'default-site']))
    for (const id of shared) expect(onEdge(lineEnds(paths[id]).end, nodeBox('pool')), id).toBe(true)
    expect(opacity('browser')).toBe('0.25')

    await select('관리')
    expect(opacity('browser')).toBe('0.25')
    expect(opacity('manager')).toBe('1')
    expect(onEdge(lineEnds(paths['manager-server']).end, groupBox('server'))).toBe(true)

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const name of ['`SRV01`', '`www.example.com`', 'Default Web Site', '`DefaultAppPool`', '작업자 프로세스', '`inetmgr`', 'IIS 관리자', '웹 브라우저', '「응용 프로그램 풀」']) {
      expect(body, name).toContain(name)
    }
  })
}

describe('IisSitePoolDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<IisSitePoolDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 256')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('같은 풀')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 192')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '같은 풀' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><IisSitePoolDiagram /><IisSitePoolDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '요청' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<IisSitePoolDiagram />)
    const text = visualsByTopicId[topicId].diagrams['iis-site-pool']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(iisSitePoolScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = iisSitePoolScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 IIS 웹 서버 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
