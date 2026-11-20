import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { L7SwitchUrlDiagram, l7SwitchUrlScenarios } from './L7SwitchUrlDiagram'

const topicId = 'network-devices'
const anchorConceptId = `${topicId}.l7-switch`
const labels: Record<string, string> = {
  'client': '클라이언트',
  'req-images': '/images/로 시작하는 경로',
  'req-others': '그 밖의 경로',
  'switch': 'L7 스위치',
  'img01': 'IMG01',
  'web01': 'WEB01',
}
const noteLabels: Record<string, string> = {
  'images-note': 'URL을 읽어 IMG01로 보낸다',
  'others-note': '같은 주소·포트여도 WEB01로 간다',
}
const nodeIds = Object.keys(labels)
const noteIds = Object.keys(noteLabels)
const requests = ['req-images', 'req-others']
// 화살표는 요청이 가는 쪽이다. 클라이언트가 보낸 요청(경로 노드)이 L7 스위치에 닿고, 스위치가 서버 하나로 보낸다.
const pathEnds: Record<string, [string, string]> = {
  'client-images': ['client', 'req-images'],
  'images-switch': ['req-images', 'switch'],
  'switch-img01': ['switch', 'img01'],
  'client-others': ['client', 'req-others'],
  'others-switch': ['req-others', 'switch'],
  'switch-web01': ['switch', 'web01'],
}
const tallPaths: Record<string, string> = {
  'client-images': 'M120 40 V72',
  'images-switch': 'M120 104 V136',
  'switch-img01': 'M108 168 V200',
  'client-others': 'M180 40 V72',
  'others-switch': 'M180 104 V136',
  'switch-web01': 'M172 168 V200',
}
const widePaths: Record<string, string> = {
  'client-images': 'M60 72 V40 H120',
  'images-switch': 'M280 40 H320 V72',
  'switch-img01': 'M352 72 V40 H384',
  'client-others': 'M60 104 V136 H120',
  'others-switch': 'M280 136 H320 V104',
  'switch-web01': 'M352 104 V136 H384',
}

const question = 'L7 스위치는 무엇을 보고 서버를 고를까?'
const figureName = 'L7 스위치가 www.example.com으로 온 요청의 URL 경로를 읽어, 경로가 /images/로 시작하는 요청은 IMG01로, 그 밖의 요청은 WEB01로 보내는 모습을 보이는 도식'
const svgName = '클라이언트가 보낸 두 가지 요청이 L7 스위치를 지나 서버 IMG01이나 WEB01로 가는 그림'
const idleCaption = '클라이언트가 www.example.com으로 보내는 요청은 모두 L7 스위치에 닿고, 스위치 뒤에는 이미지 파일을 내주는 IMG01과 웹 페이지를 내주는 WEB01이 있다. 버튼을 고르면 요청이 어느 서버로 가는지 볼 수 있다.'
const legend = '화살표는 요청이 가는 쪽이다. 두 요청은 같은 주소의 같은 포트 번호로 오고 URL의 경로만 다르다. example.com은 문서의 예로 쓰라고 남겨 둔 이름이고, IMG01·WEB01은 예로 붙인 이름표다.'
const expectedScenarios = [
  {
    id: 'images', label: '이미지 요청',
    nodes: ['client', 'req-images', 'switch', 'img01'],
    paths: ['client-images', 'images-switch', 'switch-img01'],
    notes: ['images-note'],
    caption: '클라이언트가 경로가 /images/로 시작하는 URL을 요청하자, L7 스위치는 클라이언트와 맺은 연결로 받은 HTTP 요청의 URL을 읽고 그 요청을 IMG01로 보낸다.',
  },
  {
    id: 'others', label: '그 밖의 요청',
    nodes: ['client', 'req-others', 'switch', 'web01'],
    paths: ['client-others', 'others-switch', 'switch-web01'],
    notes: ['others-note'],
    caption: '경로가 /images/로 시작하지 않는 요청은 L7 스위치가 WEB01로 보낸다. 두 요청은 같은 주소의 같은 포트 번호로 왔으므로, 주소와 포트 번호만 보아서는 이렇게 나눌 수 없다.',
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
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note')!)
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)!
const opacity = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

// 곁말(9)의 가로 범위. 반각 문자가 섞이므로 어림값의 1.15배로 잡는다.
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

// 두 선분이 같은 직선 위에 있고 길이가 있는 구간을 함께 쓰는가.
function collinearOverlap(a: Segment, b: Segment) {
  const shared = (a1: number, a2: number, b1: number, b2: number) => Math.min(Math.max(a1, a2), Math.max(b1, b2)) - Math.max(Math.min(a1, a2), Math.min(b1, b2)) > 0
  if (a.x1 === a.x2 && b.x1 === b.x2 && a.x1 === b.x1) return shared(a.y1, a.y2, b.y1, b.y2)
  if (a.y1 === a.y2 && b.y1 === b.y2 && a.y1 === b.y1) return shared(a.x1, a.x2, b.x1, b.x2)
  return false
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 184] : [0, 0, 280, 260]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<L7SwitchUrlDiagram />)
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
    const { container } = render(<L7SwitchUrlDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(svg().querySelectorAll('[data-group]')).toHaveLength(0)
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<L7SwitchUrlDiagram />)
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
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말이 자리에 들어간다`, async () => {
    render(<L7SwitchUrlDiagram />)
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
    // 곁말은 viewBox 안에 들어가고, 노드·선과 겹치지 않는다.
    const seen: string[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const visible = scenario.notes.map((id) => textBox(note(id), id))
      seen.push(...scenario.notes)
      expect(boxesOutsideViewBox(visible, viewBox)).toEqual([])
      for (const box of visible) {
        for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
        for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
      }
    }
    expect([...seen].sort()).toEqual([...noteIds].sort())
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 보낸 쪽의 변에서 시작해 받은 쪽의 변에서 끝나고, 노드 안을 지나지 않으며 서로 겹치지 않는다', () => {
    render(<L7SwitchUrlDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(pathEnds)))
    for (const [id, d] of Object.entries(paths)) {
      const { start, end } = lineEnds(d)
      expect(onEdge(start, nodeBox(pathEnds[id][0])), `${id} 시작`).toBe(true)
      expect(onEdge(end, nodeBox(pathEnds[id][1])), `${id} 끝`).toBe(true)
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
      }
    }
    // 같은 시나리오 안의 화살표끼리는 끝점에서 이어질 뿐 겹치지 않는다.
    for (const scenario of expectedScenarios) {
      for (const a of scenario.paths) for (const b of scenario.paths.filter((other) => other !== a)) {
        for (const sa of segments(paths[a])) for (const sb of segments(paths[b])) expect(collinearOverlap(sa, sb), `${a} ↔ ${b}`).toBe(false)
      }
    }
  })

  // 요점: 두 시나리오 모두 화살표가 L7 스위치를 지난다 — 하나가 스위치에서 끝나고 하나가 스위치에서 시작한다.
  // 스위치로 들어오는 화살표는 그 시나리오의 경로 노드에서 나오고, 스위치에서 나가는 화살표의 끝은 이미지 요청이면 IMG01, 그 밖의 요청이면 WEB01이다.
  // 두 시나리오의 선명한 경로 노드는 서로 다르다.
  it('L7 스위치는 요청의 URL 경로에 따라 이미지 요청은 IMG01로, 그 밖의 요청은 WEB01로 보낸다', async () => {
    render(<L7SwitchUrlDiagram />)
    const startNode = (pathId: string) => nodeIds.find((id) => onEdge(lineEnds(paths[pathId]).start, nodeBox(id)))
    const endNode = (pathId: string) => nodeIds.find((id) => onEdge(lineEnds(paths[pathId]).end, nodeBox(id)))
    const target: Record<string, string> = { images: 'img01', others: 'web01' }
    const shownRequest: Record<string, string> = {}

    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const into = shownPaths().filter((id) => endNode(id) === 'switch')
      const out = shownPaths().filter((id) => startNode(id) === 'switch')
      expect(into, scenario.id).toHaveLength(1)
      expect(out, scenario.id).toHaveLength(1)
      expect(endNode(out[0])).toBe(target[scenario.id])
      const brightRequests = requests.filter((id) => opacity(id) === '1')
      expect(brightRequests, scenario.id).toHaveLength(1)
      expect(startNode(into[0])).toBe(brightRequests[0])
      expect(shownPaths().filter((id) => startNode(id) === 'client').map(endNode)).toEqual(brightRequests)
      const other = Object.values(target).find((server) => server !== target[scenario.id])!
      expect(opacity(other)).toBe('0.25')
      shownRequest[scenario.id] = brightRequests[0]
    }
    expect(shownRequest.images).not.toBe(shownRequest.others)
    expect(label(shownRequest.images)).toContain('/images/')

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const name of ['`www.example.com`으로 오는 요청을 L7 스위치가 받고', '이미지 파일을 내주는 서버 `IMG01`', '웹 페이지를 내주는 서버 `WEB01`', '경로가 `/images/`로 시작하는 요청은 `IMG01`로, 그 밖의 요청은 `WEB01`로', '같은 주소의 같은 포트 번호로 왔다', '경로(path)']) {
      expect(body, name).toContain(name)
    }
  })
}

describe('L7SwitchUrlDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<L7SwitchUrlDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 260')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      await select('그 밖의 요청')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 184')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(screen.getByRole('button', { name: '그 밖의 요청' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><L7SwitchUrlDiagram /><L7SwitchUrlDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '이미지 요청' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<L7SwitchUrlDiagram />)
    const text = visualsByTopicId[topicId].diagrams['l7-switch-url']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(l7SwitchUrlScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = l7SwitchUrlScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 L7 스위치 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
