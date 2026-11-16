import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { DomainUserAccountDiagram, domainUserAccountScenarios } from './DomainUserAccountDiagram'

const topicId = 'windows-ad'
const anchorConceptId = `${topicId}.domain-user-accounts`
const labels: Record<string, string> = {
  tool: 'Active Directory 사용자 및 컴퓨터',
  ou: 'OU 영업팀',
  user: 'user01',
  group: 'Sales-Users',
  pc01: 'PC01',
  otherpc: '다른 PC',
  share: '공유 폴더',
}
const noteLabels: Record<string, string> = {
  'step-1': '①',
  'step-2': '②',
  'step-3': '③',
  'step-4': '④',
  'member-note': '구성원',
  'permission-note': '사용 권한',
}
const noteScenario: Record<string, string> = {
  'step-1': 'create', 'step-2': 'create', 'step-3': 'create', 'step-4': 'create',
  'member-note': 'access', 'permission-note': 'access',
}
// 번호 곁말마다 그 번호가 가리키는 차례의 노드.
const stepNode: Record<string, string> = {
  'step-1': 'tool', 'step-2': 'ou', 'step-3': 'user', 'step-4': 'group',
}
const nodeIds = Object.keys(labels)

const tallPaths: Record<string, string> = {
  'tool-ou': 'M82 44 V64',
  'ou-user': 'M82 96 V116',
  'user-group': 'M82 148 V168',
  'user-pc01': 'M132 124 H158 V80 H184',
  'user-otherpc': 'M132 140 H184',
  'group-share': 'M132 184 H184',
}
const widePaths: Record<string, string> = {
  'tool-ou': 'M82 48 V72',
  'ou-user': 'M132 88 H172',
  'user-group': 'M272 88 H312',
  'user-pc01': 'M192 104 V132',
  'user-otherpc': 'M252 104 V132',
  'group-share': 'M368 104 V132',
}
// 선마다 [시작 노드, 끝 노드].
const ends: Record<string, [string, string]> = {
  'tool-ou': ['tool', 'ou'],
  'ou-user': ['ou', 'user'],
  'user-group': ['user', 'group'],
  'user-pc01': ['user', 'pc01'],
  'user-otherpc': ['user', 'otherpc'],
  'group-share': ['group', 'share'],
}

const question = '도메인 계정은 어떻게 만들고 어디까지 쓸 수 있을까?'
const figureName = '「Active Directory 사용자 및 컴퓨터」에서 OU 영업팀을 골라 user01을 만들고 보안 그룹 Sales-Users에 넣는 차례와, user01이 PC01과 다른 PC에 로그온하고 Sales-Users를 거쳐 공유 폴더에 접근하는 것을 보이는 도식'
const svgName = 'Active Directory 사용자 및 컴퓨터, OU 영업팀, user01, Sales-Users와 PC01, 다른 PC, 공유 폴더가 있는 그림'
const idleCaption = '관리 도구 「Active Directory 사용자 및 컴퓨터」, OU 영업팀, 도메인 계정 user01, 보안 그룹 Sales-Users와, user01이 로그온하는 PC01과 다른 PC, Sales-Users에 사용 권한을 준 공유 폴더를 두었다. 이름은 예로 붙인 것이다. 버튼을 고르면 계정을 만드는 차례와 그 계정으로 할 수 있는 일을 볼 수 있다.'
const legend = '번호는 계정을 만드는 차례다. 화살표는 차례의 다음 단계, 계정으로 로그온하는 컴퓨터, 그룹의 구성원과 그 그룹이 받은 사용 권한을 가리킨다.'
const expectedScenarios = [
  {
    id: 'create', label: '만들기',
    nodes: ['tool', 'ou', 'user', 'group'], paths: ['tool-ou', 'ou-user', 'user-group'],
    caption: '「Active Directory 사용자 및 컴퓨터」에서 계정을 둘 OU 영업팀을 고르고, 「작업」 메뉴의 「새로 만들기」 → 「사용자」로 user01을 만든다. 그다음 계정의 속성을 열어 Member Of 탭에서 보안 그룹 Sales-Users에 넣는다.',
  },
  {
    id: 'logon', label: '로그온',
    nodes: ['user', 'pc01', 'otherpc'], paths: ['user-pc01', 'user-otherpc'],
    caption: 'user01은 도메인의 디렉터리에 만든 계정이라, PC01에서도 같은 도메인에 가입한 다른 PC에서도 같은 이름과 암호로 로그온한다. 어느 컴퓨터에서 로그온하든 도메인 컨트롤러가 이 계정으로 본인인지 확인한다.',
  },
  {
    id: 'access', label: '자원 접근',
    nodes: ['user', 'group', 'share'], paths: ['user-group', 'group-share'],
    caption: '이 공유 폴더의 사용 권한을 받은 것은 Sales-Users이고, user01은 그 구성원이라 폴더를 연다. 계정을 만든 것만으로 폴더가 열리는 것은 아니어서, user01에게도 그 그룹에도 사용 권한을 주지 않은 폴더는 열 수 없다.',
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
const label = (id: string) => svg().querySelector(`[data-node="${id}"] text`)!.textContent!
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (item) => item.getAttribute('data-note')!)
const opacityOf = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 176] : [0, 0, 280, 212]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<DomainUserAccountDiagram />)
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
    const { container } = render(<DomainUserAccountDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(svg().querySelectorAll('[data-group]')).toHaveLength(0)
    expect(shownPaths()).toEqual([])
    expect(svg().querySelectorAll('[data-link]')).toHaveLength(0)
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<DomainUserAccountDiagram />)
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
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말이 자리에 들어간다`, async () => {
    render(<DomainUserAccountDiagram />)
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
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const noteTexts = shownNotes().map((id) => {
        const element = note(id)!
        expect(element).toHaveAttribute('font-size', '9')
        expect(element).toHaveClass('fill-muted')
        const box = textBox(element, id)
        for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        expect(box.x, id).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width, id).toBeLessThanOrEqual(viewBox[2])
        expect(box.y, id).toBeGreaterThanOrEqual(0)
        expect(box.y + box.height, id).toBeLessThanOrEqual(viewBox[3])
        for (const d of Object.values(paths)) {
          for (const segment of segments(d)) expect(touches(segment, box), `${id} ↔ 선`).toBe(false)
        }
        return box
      })
      for (const [index, box] of noteTexts.entries()) {
        for (const other of noteTexts.slice(index + 1)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
      }
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('선의 양 끝은 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', () => {
    render(<DomainUserAccountDiagram />)
    for (const [id, d] of Object.entries(paths)) {
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
      }
      const { start, end } = lineEnds(d)
      expect(endsAt(start), `${id} 시작`).toEqual([ends[id][0]])
      expect(endsAt(end), `${id} 끝`).toEqual([ends[id][1]])
    }
  })

  // 요점: 만들기에서 번호 곁말 ①~④가 읽는 차례(위에서 아래, 같은 줄이면 왼쪽에서 오른쪽)로 놓이고, 번호마다 자기 차례의 노드 바로 왼쪽에 선다.
  // 자원 접근에서 user01에서 공유 폴더로 바로 가는 화살표는 없고, user01 → Sales-Users → 공유 폴더로 그룹을 거친다.
  it('계정은 도구에서 OU를 골라 만든 뒤 그룹에 넣고, 공유 폴더에는 그룹을 거쳐 닿는다', async () => {
    render(<DomainUserAccountDiagram />)
    await select('만들기')
    const steps = ['step-1', 'step-2', 'step-3', 'step-4'].map((id) => ({ id, box: textBox(note(id)!, id) }))
    for (const [index, step] of steps.entries()) {
      const node = nodeBox(stepNode[step.id])
      // 번호는 자기 노드의 왼쪽에 있고, 높이가 노드 안에 든다.
      expect(step.box.x + step.box.width, step.id).toBeLessThan(node.x)
      expect(node.x - (step.box.x + step.box.width), step.id).toBeLessThanOrEqual(16)
      expect(step.box.y, step.id).toBeGreaterThanOrEqual(node.y)
      expect(step.box.y + step.box.height, step.id).toBeLessThanOrEqual(node.y + node.height)
      if (index === 0) continue
      const before = steps[index - 1].box
      const inReadingOrder = step.box.y > before.y || (step.box.y === before.y && step.box.x > before.x)
      expect(inReadingOrder, `${steps[index - 1].id} → ${step.id}`).toBe(true)
    }
    expect(shownPaths().map((id) => [endsAt(lineEnds(paths[id]).start)[0], endsAt(lineEnds(paths[id]).end)[0]]))
      .toEqual([['tool', 'ou'], ['ou', 'user'], ['user', 'group']])

    await select('로그온')
    expect(shownPaths().map((id) => [endsAt(lineEnds(paths[id]).start)[0], endsAt(lineEnds(paths[id]).end)[0]]))
      .toEqual([['user', 'pc01'], ['user', 'otherpc']])

    await select('자원 접근')
    const links = shownPaths().map((id) => [endsAt(lineEnds(paths[id]).start)[0], endsAt(lineEnds(paths[id]).end)[0]])
    expect(links).toEqual([['user', 'group'], ['group', 'share']])
    expect(links.some(([from, to]) => from === 'user' && to === 'share')).toBe(false)
    expect(Object.values(ends).some(([from, to]) => from === 'user' && to === 'share')).toBe(false)
    expect(nodeIds.filter((id) => opacityOf(id) === '1')).toEqual(['user', 'group', 'share'])

    // 그림의 이름과 사실은 본문에 있는 것이다.
    const body = anchorConcept().paragraphs.join('\n')
    for (const name of ['「Active Directory 사용자 및 컴퓨터」', '`영업팀`', '`user01`', '`Sales-Users`', '`PC01`', '다른 PC', '공유 폴더']) expect(body).toContain(name)
    expect(body).toContain('먼저 이 도구에서 도메인을 펼쳐 계정을 둘 OU를 고른다')
    expect(body).toContain('「작업」 메뉴에서 「새로 만들기」 → 「사용자」를 고르면')
    expect(body).toContain('Member Of 탭에서 「추가」를 누르고')
    expect(body).toContain('같은 도메인에 가입한 다른 PC에서도 같은 이름과 암호로 로그온한다')
    expect(body).toContain('`user01`은 `Sales-Users`의 구성원이라 그 공유 폴더를 열 수 있다')
    expect(body).toContain('계정을 만든 것만으로는 그 사용자가 도메인에 가입한 컴퓨터에 로그온할 수 있게 될 뿐이다')
  })
}

describe('DomainUserAccountDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<DomainUserAccountDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 212')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      await select('자원 접근')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 176')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(screen.getByRole('button', { name: '자원 접근' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><DomainUserAccountDiagram /><DomainUserAccountDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '만들기' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<DomainUserAccountDiagram />)
    const text = visualsByTopicId[topicId].diagrams['domain-user-account']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(domainUserAccountScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = domainUserAccountScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 도메인 사용자 계정 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
