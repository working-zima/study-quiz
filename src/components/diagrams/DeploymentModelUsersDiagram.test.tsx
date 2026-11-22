import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { DeploymentModelUsersDiagram, deploymentModelUsersScenarios } from './DeploymentModelUsersDiagram'

const topicId = 'cloud-sdn'
const anchorConceptId = `${topicId}.cloud-deployment-models`
const labels: Record<string, string> = {
  'org': '한 조직',
  'orgs': '관심사가 같은 조직들',
  'anyone': '누구나',
  'private': '사설 클라우드',
  'community': '커뮤니티 클라우드',
  'public': '공용 클라우드',
}
const noteLabels: Record<string, string> = {
  'private-note': '건물 안에 두든 밖에 두든 한 조직만 쓴다',
  'community-note': '관심사가 같은 조직들이 함께 쓴다',
  'public-note': '누구나 쓸 수 있게 연다',
  'hybrid-note': '둘을 이어 데이터와 응용 프로그램을 옮긴다',
}
const nodeIds = Object.keys(labels)
const noteIds = Object.keys(noteLabels)
const users = ['org', 'orgs', 'anyone']
const clouds = ['private', 'community', 'public']
// 한쪽 화살표는 쓰는 쪽의 변에서 나가 그 클라우드의 변에서 끝난다. 하이브리드의 화살표는 사설과 공용 사이를 양쪽으로 잇는다.
const pathEnds: Record<string, [string, string]> = {
  'org-private': ['org', 'private'],
  'orgs-community': ['orgs', 'community'],
  'anyone-public': ['anyone', 'public'],
  'hybrid-link': ['private', 'public'],
}
const tallPaths: Record<string, string> = {
  'org-private': 'M140 32 H164',
  'orgs-community': 'M140 88 H164',
  'anyone-public': 'M140 144 H164',
  'hybrid-link': 'M164 40 H152 V136 H164',
}
const widePaths: Record<string, string> = {
  'org-private': 'M76 48 V96',
  'orgs-community': 'M220 48 V96',
  'anyone-public': 'M364 48 V96',
  'hybrid-link': 'M76 128 V152 H364 V128',
}

const question = '배포 모델마다 누가 그 클라우드를 쓸까?'
const figureName = '사설·커뮤니티·공용 클라우드를 저마다 누가 쓰는지 잇고, 사설 클라우드와 공용 클라우드를 이어 하이브리드 클라우드를 이루는 모습을 견주는 도식'
const svgName = '한 조직·관심사가 같은 조직들·누구나를 사설 클라우드·커뮤니티 클라우드·공용 클라우드와 짝지어 둔 그림'
const idleCaption = '쓰는 쪽 셋과 클라우드 셋이 짝을 지어 놓여 있다. 버튼으로 배포 모델을 고르면 그 클라우드를 누가 쓰는지, 하이브리드 클라우드에서는 무엇과 무엇이 이어지는지 볼 수 있다.'
const legend = '한쪽 화살표는 쓰는 쪽이 그 클라우드를 쓰는 것이고, 양쪽 화살표는 두 클라우드 사이로 데이터와 응용 프로그램을 옮길 수 있게 이은 것이다.'
const expectedScenarios = [
  {
    id: 'private', label: '사설',
    nodes: ['org', 'private'],
    paths: ['org-private'],
    notes: ['private-note'],
    caption: '사설 클라우드는 한 조직만 쓰도록 마련하고, 자원도 그 조직이 통제한다. 조직이 직접 운영하든 다른 업체가 맡든, 건물 안에 두든 밖의 데이터 센터에 두든 쓰는 쪽이 한 조직이면 사설 클라우드다.',
  },
  {
    id: 'community', label: '커뮤니티',
    nodes: ['orgs', 'community'],
    paths: ['orgs-community'],
    notes: ['community-note'],
    caption: '커뮤니티 클라우드는 하는 일이나 지켜야 할 규정 같은 관심사가 같은 조직들의 무리가 함께 쓴다. 쓰는 조직을 그 무리로 묶으므로 누구나 쓰는 공용 클라우드보다 닫혀 있고, 한 조직만 쓰는 사설 클라우드보다 넓다.',
  },
  {
    id: 'public', label: '공용',
    nodes: ['anyone', 'public'],
    paths: ['anyone-public'],
    notes: ['public-note'],
    caption: '공용 클라우드는 누구나 쓸 수 있게 연 클라우드다. 클라우드 제공자가 자기 건물에 두고 운영하며 자원을 통제하고, 사용자는 대개 인터넷을 거쳐 닿는다.',
  },
  {
    id: 'hybrid', label: '하이브리드',
    nodes: ['private', 'public'],
    paths: ['hybrid-link'],
    notes: ['hybrid-note'],
    caption: '하이브리드 클라우드는 사설 클라우드와 공용 클라우드처럼 서로 다른 클라우드 둘 이상을 묶은 것이다. 묶인 클라우드는 저마다 따로인 채 남고, 데이터와 응용 프로그램을 옮길 수 있게 이어진다.',
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
const visibleNodes = () => nodeIds.filter((id) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')

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

// 선이 어느 노드의 변에서 시작하고 어느 노드의 변에서 끝나는지 그림에서 읽는다.
function endpointNode(point: { x: number, y: number }) {
  return nodeIds.find((id) => onEdge(point, nodeBox(id)))
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 190] : [0, 0, 280, 192]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<DeploymentModelUsersDiagram />)
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
    const { container } = render(<DeploymentModelUsersDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(svg().querySelector('[data-group]')).toBeNull()
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<DeploymentModelUsersDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownPaths()).toEqual(scenario.paths)
    const [endMarker, startMarker] = Array.from(svg().querySelectorAll('marker'), (marker) => marker.id)
    for (const path of svg().querySelectorAll('[data-path]')) {
      const id = path.getAttribute('data-path')!
      expect(path).toHaveAttribute('d', paths[id])
      expect(path).toHaveAttribute('stroke-width', '2')
      expect(path).toHaveClass('stroke-title')
      expect(path).toHaveAttribute('marker-end', `url(#${endMarker})`)
      if (id === 'hybrid-link') expect(path).toHaveAttribute('marker-start', `url(#${startMarker})`)
      else expect(path).not.toHaveAttribute('marker-start')
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
    render(<DeploymentModelUsersDiagram />)
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
    // 곁말은 그림 아래의 빈 줄에 들어가고, 노드·선과 겹치지 않는다. 노드와는 위아래 4 이상 띄운다.
    const noteBoxes: SvgBox[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of scenario.notes) noteBoxes.push(textBox(note(id), id))
    }
    expect([...noteBoxes.map(({ id }) => id)].sort()).toEqual([...noteIds].sort())
    expect(boxesOutsideViewBox(noteBoxes, viewBox)).toEqual([])
    for (const box of noteBoxes) {
      for (const node of nodeIds) {
        const nodeArea = nodeBox(node)
        expect(overlaps(box, { ...nodeArea, y: nodeArea.y - 4, height: nodeArea.height + 8 }), `${box.id} ↔ ${node}`).toBe(false)
      }
      for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('선은 앞 노드의 변에서 시작해 뒤 노드의 변에서 끝나고, 노드 안을 지나지 않는다', () => {
    render(<DeploymentModelUsersDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(pathEnds)))
    for (const [id, d] of Object.entries(paths)) {
      const { start, end } = lineEnds(d)
      expect(onEdge(start, nodeBox(pathEnds[id][0])), `${id} 시작`).toBe(true)
      expect(onEdge(end, nodeBox(pathEnds[id][1])), `${id} 끝`).toBe(true)
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
      }
    }
  })

  // 요점: 네 배포 모델의 선명한 노드 집합이 서로 다르고, 사설·커뮤니티·공용에서는 쓰는 쪽 하나와 그 클라우드 하나를 잇는 화살표 하나만 보인다.
  // 사설 클라우드와 공용 클라우드를 잇는 선은 하이브리드에서만 보인다.
  it('배포 모델마다 쓰는 쪽이 다르고, 사설과 공용을 잇는 선은 하이브리드에서만 보인다', async () => {
    render(<DeploymentModelUsersDiagram />)
    const ends = (id: string) => [endpointNode(lineEnds(paths[id]).start), endpointNode(lineEnds(paths[id]).end)]
    const joinsPrivatePublic = (id: string) => [...ends(id)].sort().join(' ') === 'private public'

    const seen = new Set<string>()
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const key = visibleNodes().join(' ')
      expect(seen.has(key), scenario.label).toBe(false)
      seen.add(key)
      const linking = shownPaths().filter(joinsPrivatePublic)
      expect(linking, scenario.label).toEqual(scenario.id === 'hybrid' ? ['hybrid-link'] : [])
      if (scenario.id !== 'hybrid') {
        const [pair] = shownPaths().map(ends)
        expect(shownPaths(), scenario.label).toHaveLength(1)
        expect(users).toContain(pair[0])
        expect(clouds).toContain(pair[1])
      }
    }

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const phrase of ['한 조직만 쓰도록', '관심사가 같은 조직들', '누구나 쓸 수 있게', '데이터와 응용 프로그램을', '건물 안에 둘 수도 밖에 둘 수도']) {
      expect(body, phrase).toContain(phrase)
    }
  })
}

describe('DeploymentModelUsersDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<DeploymentModelUsersDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 192')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      await select('하이브리드')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 190')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(screen.getByRole('button', { name: '하이브리드' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><DeploymentModelUsersDiagram /><DeploymentModelUsersDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '하이브리드' })) })
      const [endMarker, startMarker] = Array.from(figure.querySelectorAll('marker'), (marker) => marker.id)
      for (const path of figure.querySelectorAll('[data-path]')) {
        expect(path).toHaveAttribute('marker-end', `url(#${endMarker})`)
        expect(path).toHaveAttribute('marker-start', `url(#${startMarker})`)
      }
    }
    const ids = figures.flatMap((figure) => Array.from(figure.querySelectorAll('marker'), (marker) => marker.id))
    expect(new Set(ids).size).toBe(4)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<DeploymentModelUsersDiagram />)
    const text = visualsByTopicId[topicId].diagrams['deployment-model-users']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(deploymentModelUsersScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = deploymentModelUsersScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 클라우드 배포 모델 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
