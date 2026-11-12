import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { HttpsStackDiagram, httpsStackScenarios } from './HttpsStackDiagram'

const topicId = 'app-protocols-mgmt-security'
const anchorConceptId = `${topicId}.https`
const labels: Record<string, string> = {
  'http-app': 'HTTP',
  'http-tcp': 'TCP · 80번',
  'https-app': 'HTTP',
  'https-tls': 'TLS',
  'https-tcp': 'TCP · 443번',
}
const groupLabels: Record<string, string> = {
  'http-stack': 'http:// 주소로 열 때',
  'https-stack': 'https:// 주소로 열 때',
}
const noteLabels: Record<string, string> = {
  'http-note': '그대로 보임',
  'https-note': '암호화됨',
  'https-check': '서버를 확인한다',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
const stackOf: Record<string, string> = {
  'http-app': 'http-stack', 'http-tcp': 'http-stack', 'https-app': 'https-stack', 'https-tls': 'https-stack', 'https-tcp': 'https-stack',
}
const noteOwner: Record<string, string> = { 'http-note': 'http-tcp', 'https-note': 'https-tcp', 'https-check': 'https-tcp' }
// 화살표는 위 칸의 아래 변에서 바로 아래 칸의 위 변으로 간다.
const pathEnds: Record<string, [string, string]> = {
  'http-down': ['http-app', 'http-tcp'],
  'https-down-1': ['https-app', 'https-tls'],
  'https-down-2': ['https-tls', 'https-tcp'],
}
const tallPaths: Record<string, string> = {
  'http-down': 'M72 64 V120',
  'https-down-1': 'M208 64 V76',
  'https-down-2': 'M208 108 V120',
}
const widePaths: Record<string, string> = {
  'http-down': 'M112 64 V120',
  'https-down-1': 'M328 64 V76',
  'https-down-2': 'M328 108 V120',
}

const question = 'HTTP와 HTTPS는 무엇이 다를까?'
const figureName = '같은 www.example.com의 서버를 http:// 주소로 열 때는 HTTP가 TCP 80번 위에 바로 놓이고, https:// 주소로 열 때는 HTTP와 TCP 443번 사이에 TLS가 들어가는 것을 나란히 보이는 도식'
const svgName = '왼쪽 박스에 HTTP와 TCP · 80번을, 오른쪽 박스에 HTTP·TLS·TCP · 443번을 위에서 아래로 쌓은 그림'
const idleCaption = '같은 서버를 http:// 주소와 https:// 주소로 열 때, 브라우저가 보내는 HTTP 요청이 어떤 층을 거쳐 나가는지 나란히 쌓아 보였다. 버튼을 고르면 두 방식의 포트와 보호가 어떻게 다른지 볼 수 있다.'
const legend = '박스 하나가 한 주소로 열 때의 쌓임이고, 위 칸이 아래 칸에 데이터를 넘긴다. 화살표는 브라우저가 보내는 HTTP 요청이 아래 층으로 넘겨지는 차례다.'
const expectedScenarios = [
  {
    id: 'http', label: 'HTTP',
    nodes: ['http-app', 'http-tcp'], paths: ['http-down'], notes: ['http-note'],
    caption: 'http://www.example.com/으로 열면 브라우저는 서버의 TCP 80번으로 연결을 맺고, TLS 없이 그 연결로 HTTP 요청과 응답을 주고받는다. 내용이 암호화되지 않아 중간에서 엿보면 그대로 보이고, 브라우저는 상대 서버가 진짜인지 확인하지 않는다.',
  },
  {
    id: 'https', label: 'HTTPS',
    nodes: ['https-app', 'https-tls', 'https-tcp'], paths: ['https-down-1', 'https-down-2'], notes: ['https-note', 'https-check'],
    caption: 'https://www.example.com/으로 열면 브라우저는 서버의 TCP 443번으로 연결을 맺고 그 위에서 TLS 핸드셰이크를 하며, 인증서의 이름이 www.example.com과 맞는지 확인한다. 그 뒤 HTTP 요청과 응답은 TLS로 암호화되어 오간다.',
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

function lineEnds(d: string) {
  const list = segments(d)
  return { start: { x: list[0].x1, y: list[0].y1 }, end: { x: list[list.length - 1].x2, y: list[list.length - 1].y2 } }
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 200] : [0, 0, 280, 200]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<HttpsStackDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 칸이 모두 선명하고 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<HttpsStackDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 칸·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<HttpsStackDiagram />)
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
    render(<HttpsStackDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    expect(overlaps(groupBox('http-stack'), groupBox('https-stack'))).toBe(false)
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      expect(contains(groupBox(stackOf[id]), nodeBox(id)), `${id} ⊂ ${stackOf[id]}`).toBe(true)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    for (const id of groupIds) {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
    }
    // 곁말은 자기 쌓기 안, 맨 아래 칸 아래에 들어가고 칸이나 다른 곁말과 겹치지 않는다.
    const noteBoxes: SvgBox[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of scenario.notes) noteBoxes.push(textBox(note(id), id))
    }
    expect(noteBoxes.map(({ id }) => id)).toEqual(noteIds)
    for (const box of noteBoxes) {
      const owner = noteOwner[box.id]
      expect(contains(groupBox(stackOf[owner]), box), box.id).toBe(true)
      expect(box.y + 9 - (nodeBox(owner).y + 32), box.id).toBeGreaterThanOrEqual(10)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
      for (const other of noteBoxes.filter(({ id }) => id !== box.id)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 위 칸의 아래 변에서 바로 아래 칸의 위 변으로 가고, 칸 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<HttpsStackDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(pathEnds)))
    for (const [id, d] of Object.entries(paths)) {
      const [from, to] = pathEnds[id]
      const { start, end } = lineEnds(d)
      expect(start.y, id).toBe(nodeBox(from).y + 32)
      expect(start.x, id).toBeGreaterThan(nodeBox(from).x)
      expect(start.x, id).toBeLessThan(nodeBox(from).x + nodeBox(from).width)
      expect(end.y, id).toBe(nodeBox(to).y)
      expect(end.x, id).toBeGreaterThan(nodeBox(to).x)
      expect(end.x, id).toBeLessThan(nodeBox(to).x + nodeBox(to).width)
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
    }
  })

  // 요점: 「HTTPS」에서 선명한 칸에 TLS가 있고 「HTTP」에서 선명한 칸에는 TLS가 없다.
  // HTTP 쪽 TCP 칸은 80, HTTPS 쪽 TCP 칸은 443을 말한다. 두 쌓기 모두 HTTP 칸이 맨 위이고 TCP 칸이 맨 아래다.
  it('HTTPS에만 TLS 칸이 있고, TCP 칸의 포트가 80과 443으로 갈리며, 두 쌓기 모두 HTTP가 맨 위다', async () => {
    render(<HttpsStackDiagram />)
    for (const [stack, app, tcp] of [['http-stack', 'http-app', 'http-tcp'], ['https-stack', 'https-app', 'https-tcp']]) {
      const cells = nodeIds.filter((id) => stackOf[id] === stack).sort((a, b) => nodeBox(a).y - nodeBox(b).y)
      expect(cells[0], stack).toBe(app)
      expect(cells[cells.length - 1], stack).toBe(tcp)
      expect(label(app)).toBe('HTTP')
    }
    expect(nodeBox('https-tls').y).toBeGreaterThan(nodeBox('https-app').y)
    expect(nodeBox('https-tls').y).toBeLessThan(nodeBox('https-tcp').y)
    // 두 TCP 칸은 같은 높이에 서서 견주어 보인다.
    expect(nodeBox('http-tcp').y).toBe(nodeBox('https-tcp').y)
    expect(label('http-tcp')).toContain('80')
    expect(label('http-tcp')).not.toContain('443')
    expect(label('https-tcp')).toContain('443')
    expect(label('https-tcp')).not.toContain('80')

    await select('HTTPS')
    const httpsShown = nodeIds.filter((id) => opacity(id) === '1').map(label)
    expect(httpsShown).toContain('TLS')
    expect(httpsShown.some((name) => name.includes('443'))).toBe(true)
    expect(note('https-note').textContent).toContain('암호화')

    await select('HTTP')
    const httpShown = nodeIds.filter((id) => opacity(id) === '1').map(label)
    expect(httpShown).not.toContain('TLS')
    expect(httpShown.some((name) => name.includes('80'))).toBe(true)
    expect(note('http-note').textContent).toContain('그대로')

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const name of ['`80`', '`443`', '`http://www.example.com/`', '`https://www.example.com/`', '인증서', 'TLS 없이 TCP 위에서 바로', '그대로 읽을 수 있고']) {
      expect(body, name).toContain(name)
    }
  })
}

describe('HttpsStackDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('칸·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<HttpsStackDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 200')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('HTTPS')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 200')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: 'HTTPS' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><HttpsStackDiagram /><HttpsStackDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'HTTPS' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<HttpsStackDiagram />)
    const text = visualsByTopicId[topicId].diagrams['https-stack']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(httpsStackScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = httpsStackScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 HTTPS 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
