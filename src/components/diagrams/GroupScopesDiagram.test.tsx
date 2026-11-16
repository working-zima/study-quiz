import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { GroupScopesDiagram, groupScopesScenarios } from './GroupScopesDiagram'

const topicId = 'windows-ad'
const anchorConceptId = `${topicId}.group-scopes`
const labels: Record<string, string> = {
  'com-account': '계정',
  'domain-local': '도메인 로컬 그룹',
  global: '글로벌 그룹',
  universal: '유니버설 그룹',
  'com-share': '공유 폴더',
  'sales-account': '계정',
  'sales-share': '공유 폴더',
}
const groupLabels: Record<string, string> = {
  com: 'example.com',
  sales: 'sales.example.com',
}
const noteLabels: Record<string, string> = {
  'domain-local-note': '사용 권한을 줄 수 없음',
  'global-note': '넣을 수 없음',
}
const noteScenario: Record<string, string> = {
  'domain-local-note': 'domain-local', 'global-note': 'global',
}
// 곁말은 자기가 말하는 노드 바로 아래, sales.example.com 박스 안에 놓인다.
const noteNode: Record<string, string> = {
  'domain-local-note': 'sales-share', 'global-note': 'sales-account',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const groupNodes = ['domain-local', 'global', 'universal']
const accounts = ['com-account', 'sales-account']
const shares = ['com-share', 'sales-share']
// 노드마다 들어가는 도메인 박스. 그룹 셋은 모두 example.com에 있다.
const domainOf: Record<string, string> = {
  'com-account': 'com', 'domain-local': 'com', global: 'com', universal: 'com', 'com-share': 'com',
  'sales-account': 'sales', 'sales-share': 'sales',
}

const tallPaths: Record<string, string> = {
  'dl-from-com': 'M60 72 H68 V48 H76',
  'dl-from-sales': 'M12 184 H8 V32 H76',
  'dl-to-com-share': 'M190 40 H239 V64',
  'global-from-com': 'M60 80 H76',
  'global-to-com-share': 'M190 80 H206',
  'global-to-sales-share': 'M190 88 H198 V184 H206',
  'universal-from-com': 'M36 96 V120 H76',
  'universal-from-sales': 'M12 184 H8 V128 H76',
  'universal-to-com-share': 'M190 112 H239 V96',
  'universal-to-sales-share': 'M190 128 H239 V168',
}
const widePaths: Record<string, string> = {
  'dl-from-com': 'M88 72 H118 V48 H148',
  'dl-from-sales': 'M24 184 H8 V32 H148',
  'dl-to-com-share': 'M292 40 H388 V64',
  'global-from-com': 'M88 80 H148',
  'global-to-com-share': 'M292 80 H352',
  'global-to-sales-share': 'M292 88 H322 V184 H352',
  'universal-from-com': 'M56 96 V120 H148',
  'universal-from-sales': 'M24 184 H8 V128 H148',
  'universal-to-com-share': 'M292 112 H388 V96',
  'universal-to-sales-share': 'M292 128 H388 V168',
}
// 선마다 [시작 노드, 끝 노드]. 계정에서 그룹으로 가는 선은 넣을 수 있는 구성원, 그룹에서 공유 폴더로 가는 선은 사용 권한을 받는 곳이다.
const ends: Record<string, [string, string]> = {
  'dl-from-com': ['com-account', 'domain-local'],
  'dl-from-sales': ['sales-account', 'domain-local'],
  'dl-to-com-share': ['domain-local', 'com-share'],
  'global-from-com': ['com-account', 'global'],
  'global-to-com-share': ['global', 'com-share'],
  'global-to-sales-share': ['global', 'sales-share'],
  'universal-from-com': ['com-account', 'universal'],
  'universal-from-sales': ['sales-account', 'universal'],
  'universal-to-com-share': ['universal', 'com-share'],
  'universal-to-sales-share': ['universal', 'sales-share'],
}

const question = '그룹 범위에 따라 누구를 넣고 어디에 쓸 수 있을까?'
const figureName = '도메인 example.com에 만든 도메인 로컬·글로벌·유니버설 그룹마다, example.com과 자식 도메인 sales.example.com 가운데 어느 도메인의 계정을 구성원으로 넣을 수 있고 어느 도메인의 공유 폴더에서 사용 권한을 받을 수 있는지를 보이는 도식'
const svgName = '도메인 example.com 박스 안에 계정, 도메인 로컬 그룹·글로벌 그룹·유니버설 그룹, 공유 폴더가 있고, 도메인 sales.example.com 박스 안에 계정과 공유 폴더가 있는 그림'
const idleCaption = '한 포리스트의 도메인 example.com과 자식 도메인 sales.example.com에 저마다 계정과 공유 폴더가 있고, 그룹 셋은 모두 example.com에 만들었다. 도메인 로컬 그룹은 Sales-Share-Read, 글로벌 그룹은 Sales-Users, 유니버설 그룹은 All-Sales이고, 이름은 예로 붙인 것이다. 버튼을 고르면 범위마다 넣을 수 있는 구성원과 사용 권한을 받는 곳을 볼 수 있다.'
const legend = '위 박스는 도메인 example.com, 아래 박스는 자식 도메인 sales.example.com이다. 계정에서 그룹으로 가는 화살표는 그 그룹에 넣을 수 있는 구성원을, 그룹에서 공유 폴더로 가는 화살표는 그 그룹이 사용 권한을 받을 수 있는 곳을 가리킨다.'
const expectedScenarios = [
  {
    id: 'domain-local', label: '도메인 로컬',
    nodes: ['com-account', 'domain-local', 'com-share', 'sales-account'],
    paths: ['dl-from-com', 'dl-from-sales', 'dl-to-com-share'],
    caption: '도메인 로컬 그룹 Sales-Share-Read에는 example.com의 계정도 sales.example.com의 계정도 넣을 수 있다. 하지만 이 그룹은 자기가 있는 example.com 안의 자원에서만 사용 권한을 받으므로, sales.example.com의 공유 폴더에는 이 그룹에 사용 권한을 줄 수 없다.',
  },
  {
    id: 'global', label: '글로벌',
    nodes: ['com-account', 'global', 'com-share', 'sales-share'],
    paths: ['global-from-com', 'global-to-com-share', 'global-to-sales-share'],
    caption: '글로벌 그룹 Sales-Users에는 자기가 있는 example.com의 계정만 넣을 수 있어 sales.example.com의 계정은 넣지 못한다. 대신 이 그룹은 같은 포리스트의 어느 도메인 자원에서나 사용 권한을 받으므로, 두 도메인의 공유 폴더에 모두 쓸 수 있다.',
  },
  {
    id: 'universal', label: '유니버설',
    nodes: ['com-account', 'universal', 'com-share', 'sales-account', 'sales-share'],
    paths: ['universal-from-com', 'universal-from-sales', 'universal-to-com-share', 'universal-to-sales-share'],
    caption: '유니버설 그룹 All-Sales에는 같은 포리스트의 어느 도메인 계정이든 넣을 수 있고, 이 그룹은 포리스트 어느 도메인의 자원에서나 사용 권한을 받는다. 그래서 두 도메인의 계정을 한 그룹에 묶어 두 도메인의 공유 폴더에 함께 쓸 수 있다.',
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

const endsAtNode = (point: { x: number, y: number }) => nodeIds.filter((id) => onEdge(point.x, point.y, nodeBox(id)))
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

const anchorConcept = () => topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!

function layoutTests(wide: boolean) {
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 224] : [0, 0, 280, 224]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<GroupScopesDiagram />)
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
    const { container } = render(<GroupScopesDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<GroupScopesDiagram />)
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
    render(<GroupScopesDiagram />)
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
      for (const group of groupIds) {
        if (domainOf[id] === group) expect(contains(groupBox(group), nodeBox(id)), `${id} ⊂ ${group}`).toBe(true)
        else expect(overlaps(groupBox(group), nodeBox(id)), `${id} ↔ ${group}`).toBe(false)
      }
    }
    expect(overlaps(groupBox('com'), groupBox('sales'))).toBe(false)
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
        expect(contains(groupBox('sales'), box), id).toBe(true)
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
      for (const box of noteTexts) for (const group of groupTexts) expect(overlaps(box, group), `${box.id} ↔ ${group.id}`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('선은 노드의 변에서 시작해 다른 노드의 변에서 끝나고 어떤 선분도 노드 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<GroupScopesDiagram />)
    for (const [id, d] of Object.entries(paths)) {
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
      const { start, end } = lineEnds(d)
      expect(endsAtNode(start), `${id} 시작`).toEqual([ends[id][0]])
      expect(endsAtNode(end), `${id} 끝`).toEqual([ends[id][1]])
    }
  })

  it('곁말은 자기가 말하는 노드 바로 아래에 놓인다', async () => {
    render(<GroupScopesDiagram />)
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of shownNotes()) {
        const box = textBox(note(id)!, id)
        const target = nodeBox(noteNode[id])
        expect(box.y, id).toBeGreaterThanOrEqual(target.y + target.height)
        expect(box.y - (target.y + target.height), id).toBeLessThanOrEqual(8)
        expect(box.x + box.width > target.x && box.x < target.x + target.width, id).toBe(true)
      }
    }
  })

  // 요점: 시나리오마다 선명한 그룹은 하나이고 서로 다르다. 글로벌에서 그룹으로 들어오는 구성원 화살표는 모두 example.com 박스 안에서 시작하고,
  // 유니버설에서는 두 도메인 박스 모두에서 시작한다. 도메인 로컬은 두 도메인의 계정을 받지만 사용 권한 화살표는 example.com 안의 공유 폴더에만 닿는다.
  it('범위에 따라 구성원을 넣을 수 있는 도메인과 사용 권한을 받는 도메인이 달라진다', async () => {
    render(<GroupScopesDiagram />)
    const startDomain = (pathId: string) => domainOf[ends[pathId][0]]
    const endDomain = (pathId: string) => domainOf[ends[pathId][1]]
    const memberPaths = () => shownPaths().filter((id) => accounts.includes(ends[id][0]))
    const permissionPaths = () => shownPaths().filter((id) => groupNodes.includes(ends[id][0]))
    const litGroups: string[] = []

    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const lit = groupNodes.filter((id) => opacityOf(id) === '1')
      expect(lit, scenario.id).toHaveLength(1)
      litGroups.push(lit[0])
      for (const id of memberPaths()) expect(ends[id][1], id).toBe(lit[0])
      for (const id of permissionPaths()) expect(shares, id).toContain(ends[id][1])
      // 선은 선명한 노드끼리만 잇는다.
      for (const id of shownPaths()) for (const node of ends[id]) expect(opacityOf(node), `${id} ${node}`).toBe('1')
    }
    expect(new Set(litGroups).size).toBe(3)

    await select('글로벌')
    expect(memberPaths().length).toBeGreaterThan(0)
    for (const id of memberPaths()) {
      expect(startDomain(id), id).toBe('com')
      expect(contains(groupBox('com'), nodeBox(ends[id][0])), id).toBe(true)
    }
    expect(new Set(permissionPaths().map(endDomain))).toEqual(new Set(['com', 'sales']))
    expect(opacityOf('sales-account')).toBe('0.25')

    await select('유니버설')
    expect(new Set(memberPaths().map(startDomain))).toEqual(new Set(['com', 'sales']))
    expect(new Set(permissionPaths().map(endDomain))).toEqual(new Set(['com', 'sales']))

    await select('도메인 로컬')
    expect(new Set(memberPaths().map(startDomain))).toEqual(new Set(['com', 'sales']))
    expect(permissionPaths().map(endDomain)).toEqual(['com'])
    expect(opacityOf('sales-share')).toBe('0.25')
    for (const id of shownPaths()) for (const segment of segments(paths[id])) expect(touches(segment, nodeBox('sales-share')), id).toBe(false)

    // 그림의 이름과 사실은 본문에 있는 것이다.
    const body = anchorConcept().paragraphs.join('\n')
    for (const name of ['`example.com`', '`sales.example.com`', '`Sales-Share-Read`', '`Sales-Users`', '`All-Sales`', '도메인 로컬 그룹', '글로벌 그룹', '유니버설 그룹', '공유 폴더']) expect(body).toContain(name)
    expect(body).toContain('`Sales-Users`에는 `example.com`의 계정만 넣을 수 있어, 같은 포리스트의 자식 도메인 `sales.example.com`에 있는 계정은 넣지 못한다')
    expect(body).toContain('`sales.example.com`의 공유 폴더에는 이 그룹에 사용 권한을 줄 수 없다')
    expect(body).toContain('`All-Sales`는 두 도메인 어느 쪽의 공유 폴더에서나 사용 권한을 받는다')
    expect(body).toContain('이 그룹은 자기가 있는 도메인 안의 자원에서만 사용 권한을 받는다')
  })
}

describe('GroupScopesDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<GroupScopesDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 224')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('유니버설')
      const tallShown = shownPaths()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 224')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '유니버설' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><GroupScopesDiagram /><GroupScopesDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '유니버설' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<GroupScopesDiagram />)
    const text = visualsByTopicId[topicId].diagrams['group-scopes']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(groupScopesScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = groupScopesScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 그룹 종류와 범위 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
