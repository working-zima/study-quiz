import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ServerlessDutiesDiagram, serverlessDutiesScenarios } from './ServerlessDutiesDiagram'

const topicId = 'cloud-sdn'
const anchorConceptId = `${topicId}.serverless`
const labels: Record<string, string> = {
  'code': '응용 프로그램 코드',
  'os': '운영 체제',
  'server': '서버(하드웨어)',
  'user': '사용자가 맡는 것',
  'provider': '제공자가 맡는 것',
}
const noteLabels: Record<string, string> = {
  'iaas-note': '운영 체제부터 위를 사용자가 맡는다',
  'serverless-note': '사용자는 코드만, 나머지는 제공자가 맡는다',
}
const nodeIds = Object.keys(labels)
const noteIds = Object.keys(noteLabels)
// 아래에서 위로 쌓은 세 칸이다. 서버가 맨 아래, 응용 프로그램 코드가 맨 위다.
const tiers = ['server', 'os', 'code']
const actors = ['user', 'provider']
// 화살표는 맡는 쪽(사용자·제공자)의 변에서 나가 그 칸의 변에서 끝난다. 시나리오마다 경로 id를 따로 둔다.
const pathEnds: Record<string, [string, string]> = {
  'iaas-user-code': ['user', 'code'],
  'iaas-user-os': ['user', 'os'],
  'iaas-provider-server': ['provider', 'server'],
  'serverless-user-code': ['user', 'code'],
  'serverless-provider-os': ['provider', 'os'],
  'serverless-provider-server': ['provider', 'server'],
}
const tallPaths: Record<string, string> = {
  'iaas-user-code': 'M164 24 H150 V56 H136',
  'iaas-user-os': 'M200 40 V88 H136',
  'iaas-provider-server': 'M164 168 H150 V120 H136',
  'serverless-user-code': 'M164 24 H150 V56 H136',
  'serverless-provider-os': 'M200 152 V88 H136',
  'serverless-provider-server': 'M164 168 H150 V120 H136',
}
const widePaths: Record<string, string> = {
  'iaas-user-code': 'M120 24 H164',
  'iaas-user-os': 'M120 44 H164',
  'iaas-provider-server': 'M320 80 H292',
  'serverless-user-code': 'M120 24 H164',
  'serverless-provider-os': 'M320 64 H292',
  'serverless-provider-server': 'M320 80 H292',
}

const question = '서버리스에서는 사용자가 어디까지 맡을까?'
const figureName = 'IaaS와 서버리스 컴퓨팅에서 서버·운영 체제·응용 프로그램 코드의 세 칸을 저마다 사용자와 제공자 가운데 누가 맡는지 견주는 도식'
const svgName = '아래에서 위로 쌓은 서버(하드웨어)·운영 체제·응용 프로그램 코드 세 칸과, 사용자가 맡는 것·제공자가 맡는 것 두 노드를 화살표로 이은 그림'
const idleCaption = '응용 프로그램 코드는 운영 체제 위에서, 운영 체제는 서버 위에서 실행된다. 버튼으로 IaaS나 서버리스를 고르면 세 칸 가운데 어느 칸을 사용자가 맡고 어느 칸을 제공자가 맡는지 볼 수 있다.'
const legend = '아래에서 위로 쌓인 칸은 코드가 실행되는 데 필요한 것들이다. 화살표는 그 칸을 누가 맡는지 가리킨다.'
const expectedScenarios = [
  {
    id: 'iaas', label: 'IaaS',
    nodes: ['code', 'os', 'server', 'user', 'provider'],
    paths: ['iaas-user-code', 'iaas-user-os', 'iaas-provider-server'],
    notes: ['iaas-note'],
    caption: 'IaaS에서 제공자는 서버를 맡고, 사용자는 받은 가상 컴퓨터의 운영 체제와 그 위의 응용 프로그램 코드를 맡는다. 운영 체제를 관리하는 일이 사용자의 몫이고, 코드를 올리기 전에 서버를 마련하고 설정해 두어야 한다.',
  },
  {
    id: 'serverless', label: '서버리스',
    nodes: ['code', 'os', 'server', 'user', 'provider'],
    paths: ['serverless-user-code', 'serverless-provider-os', 'serverless-provider-server'],
    notes: ['serverless-note'],
    caption: '서버리스에서 사용자는 응용 프로그램 코드만 맡고, 그 아래의 운영 체제와 서버는 제공자가 맡는다. 서버가 없는 것이 아니라, 서버를 마련하고 관리하는 일이 모두 제공자의 몫이다.',
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

// 선이 어느 노드의 변에서 시작하고 어느 노드의 변에서 끝나는지 그림에서 읽는다. 점이 두 노드에 걸치면 찾지 못한 것으로 친다.
function endpointNode(point: { x: number, y: number }) {
  const found = nodeIds.filter((id) => onEdge(point, nodeBox(id)))
  return found.length === 1 ? found[0] : undefined
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 140] : [0, 0, 280, 220]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<ServerlessDutiesDiagram />)
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
    const { container } = render(<ServerlessDutiesDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<ServerlessDutiesDiagram />)
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

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말이 자리에 들어가며, 세 칸은 아래에서 위로 빈틈없이 쌓인다`, async () => {
    render(<ServerlessDutiesDiagram />)
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
    // 서버 위에 운영 체제, 그 위에 응용 프로그램 코드가 같은 열에 맞닿아 쌓인다.
    for (let index = 1; index < tiers.length; index += 1) {
      const below = nodeBox(tiers[index - 1])
      const above = nodeBox(tiers[index])
      expect(above.y + above.height, `${tiers[index]} 위에 ${tiers[index - 1]}`).toBe(below.y)
      expect([above.x, above.width]).toEqual([below.x, below.width])
    }
    // 곁말은 viewBox 안의 빈 줄에 들어가고, 노드·선과 겹치지 않는다. 노드와는 위아래 4 이상 띄운다.
    const seen: string[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const visible = scenario.notes.map((id) => textBox(note(id), id))
      seen.push(...scenario.notes)
      expect(boxesOutsideViewBox(visible, viewBox)).toEqual([])
      for (const box of visible) {
        for (const node of nodeIds) {
          const nodeArea = nodeBox(node)
          expect(overlaps(box, { ...nodeArea, y: nodeArea.y - 4, height: nodeArea.height + 8 }), `${box.id} ↔ ${node}`).toBe(false)
        }
        for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
      }
    }
    expect([...seen].sort()).toEqual([...noteIds].sort())
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 맡는 쪽의 변에서 시작해 칸의 변에서 끝나고, 노드 안을 지나지 않으며 한 장면의 화살표끼리 겹치지 않는다', () => {
    render(<ServerlessDutiesDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(pathEnds)))
    for (const [id, d] of Object.entries(paths)) {
      const { start, end } = lineEnds(d)
      expect(endpointNode(start), `${id} 시작`).toBe(pathEnds[id][0])
      expect(endpointNode(end), `${id} 끝`).toBe(pathEnds[id][1])
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
      }
    }
    for (const scenario of expectedScenarios) {
      for (const a of scenario.paths) for (const b of scenario.paths.filter((other) => other !== a)) {
        for (const sa of segments(paths[a])) for (const sb of segments(paths[b])) expect(collinearOverlap(sa, sb), `${a} ↔ ${b}`).toBe(false)
      }
    }
  })

  // 요점: 「사용자가 맡는 것」에서 나간 보이는 화살표가 닿는 칸이 IaaS에서는 운영 체제·응용 프로그램 코드 둘, 서버리스에서는 응용 프로그램 코드 하나다.
  // 운영 체제 칸으로 들어오는 화살표는 IaaS에서 사용자, 서버리스에서 제공자에게서 나온다. 「서버(하드웨어)」 칸에는 두 장면 모두 사용자 화살표가 닿지 않는다.
  it('사용자가 맡는 칸은 IaaS에서 운영 체제부터 위, 서버리스에서 코드뿐이고 서버 칸에는 사용자가 닿지 않는다', async () => {
    render(<ServerlessDutiesDiagram />)
    const ends = (id: string) => [endpointNode(lineEnds(paths[id]).start), endpointNode(lineEnds(paths[id]).end)] as [string, string]
    const reached = (from: string) => shownPaths().map(ends).filter(([start]) => start === from).map(([, to]) => to).sort()

    await select('IaaS')
    expect(reached('user')).toEqual(['code', 'os'])
    expect(reached('provider')).toEqual(['server'])

    await select('서버리스')
    expect(reached('user')).toEqual(['code'])
    expect(reached('provider')).toEqual(['os', 'server'])

    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      expect(reached('user'), scenario.id).not.toContain('server')
      for (const tier of tiers) expect(shownPaths().map(ends).filter(([, to]) => to === tier), `${scenario.id} ${tier}`).toHaveLength(1)
      for (const [from] of shownPaths().map(ends)) expect(actors).toContain(from)
    }

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const phrase of ['운영 체제부터 그 위를 맡는다', '서버리스에서 사용자는 응용 프로그램 코드만 맡고, 그 아래의 운영 체제와 서버는 제공자가 맡는다', 'IaaS에서 제공자는 서버를 맡고', '서버가 정말 없는 것은 아니다']) {
      expect(body, phrase).toContain(phrase)
    }
  })
}

describe('ServerlessDutiesDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<ServerlessDutiesDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 220')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      await select('서버리스')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 140')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(svg().querySelectorAll('[data-group]')).toHaveLength(0)
      expect(screen.getByRole('button', { name: '서버리스' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><ServerlessDutiesDiagram /><ServerlessDutiesDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'IaaS' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<ServerlessDutiesDiagram />)
    const text = visualsByTopicId[topicId].diagrams['serverless-duties']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(serverlessDutiesScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = serverlessDutiesScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 서버리스 컴퓨팅 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
