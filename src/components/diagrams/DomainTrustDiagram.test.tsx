import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { DomainTrustDiagram, domainTrustScenarios } from './DomainTrustDiagram'

const topicId = 'windows-ad'
const anchorConceptId = `${topicId}.trust`
const labels: Record<string, string> = {
  com: 'example.com',
  sales: 'sales.example.com',
  org: 'example.org',
}
const groupLabels: Record<string, string> = {
  'forest-com': 'example.com이 든 포리스트',
  'forest-org': '다른 포리스트',
}
const noteLabels: Record<string, string> = {
  'trust-note': '신뢰',
  'access-note': '접근',
  'trust-both-note': '서로 신뢰',
  'access-both-note': '서로 접근',
  'transitive-note': '전이적',
  'reach-note': '접근',
}
const noteScenario: Record<string, string> = {
  'trust-note': 'one-way', 'access-note': 'one-way',
  'trust-both-note': 'two-way', 'access-both-note': 'two-way',
  'transitive-note': 'transitive', 'reach-note': 'transitive',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
// 노드마다 들어가는 포리스트 박스.
const groupOf: Record<string, string> = {
  com: 'forest-com', sales: 'forest-com', org: 'forest-org',
}

const tallPaths: Record<string, string> = {
  'trust-com-org': 'M112 38 H184',
  'access-org-com': 'M184 50 H112',
  'trust-both': 'M112 38 H184',
  'access-both': 'M184 50 H112',
  'access-org-sales': 'M226 60 V104 H136',
}
const widePaths: Record<string, string> = {
  'trust-com-org': 'M124 38 H296',
  'access-org-com': 'M296 50 H124',
  'trust-both': 'M124 38 H296',
  'access-both': 'M296 50 H124',
  'access-org-sales': 'M346 60 V104 H136',
}
// 양쪽 끝에 화살촉이 있는 선(양방향).
const doubleHeaded = ['trust-both', 'access-both']
// 선마다 [시작 노드, 끝 노드].
const ends: Record<string, [string, string]> = {
  'trust-com-org': ['com', 'org'],
  'access-org-com': ['org', 'com'],
  'trust-both': ['com', 'org'],
  'access-both': ['org', 'com'],
  'access-org-sales': ['org', 'sales'],
}

const question = '트러스트를 맺으면 누가 어느 쪽 자원을 쓸까?'
const figureName = 'example.com이 다른 포리스트의 example.org를 신뢰할 때 신뢰의 방향과 사용자 접근의 방향이 반대라는 것과 양방향 트러스트, 전이적인 포리스트 트러스트가 sales.example.com까지 이어지는 것을 보이는 도식'
const svgName = 'example.com이 든 포리스트 박스 안의 example.com·sales.example.com과, 다른 포리스트 박스 안의 example.org가 있는 그림'
const idleCaption = '왼쪽 박스는 example.com과 그 자식 도메인 sales.example.com이 든 포리스트이고, 오른쪽 박스는 example.org가 포리스트 루트 도메인인 다른 포리스트다. 도메인 이름은 예로 붙인 이름이다. 버튼을 고르면 트러스트의 방향에 따라 어느 도메인의 사용자가 어느 도메인의 자원에 접근하는지 볼 수 있다.'
const legend = '신뢰 화살표는 신뢰하는 도메인에서 신뢰받는 도메인을 가리키고, 접근 화살표는 사용자의 계정이 있는 도메인에서 그 사용자가 쓰려는 자원이 있는 도메인을 가리킨다. 양쪽 끝에 화살촉이 있으면 두 방향 모두다.'
const expectedScenarios = [
  {
    id: 'one-way', label: '단방향',
    nodes: ['com', 'org'], paths: ['trust-com-org', 'access-org-com'],
    caption: 'example.com이 example.org를 단방향으로 신뢰하면 신뢰는 example.com에서 example.org 쪽으로 향하고 접근은 그 반대다. example.org의 사용자는 사용 권한을 받은 example.com의 자원에 접근하지만, example.com의 사용자는 이 트러스트로 example.org의 자원에 접근하지 못한다. 이 트러스트가 비전이적인 외부 트러스트라면 sales.example.com까지 이어지지 않는다.',
  },
  {
    id: 'two-way', label: '양방향',
    nodes: ['com', 'org'], paths: ['trust-both', 'access-both'],
    caption: 'example.org도 example.com을 신뢰해 양방향 트러스트가 되면, 단방향 트러스트 둘을 반대 방향으로 맺은 것과 같아 두 도메인의 사용자가 모두 상대 도메인의 자원에 접근할 수 있다. 어느 쪽이든 그 자원에 사용 권한이 주어져 있어야 한다.',
  },
  {
    id: 'transitive', label: '전이',
    nodes: ['com', 'sales', 'org'], paths: ['trust-com-org', 'access-org-sales'],
    caption: 'example.com과 example.org는 각 포리스트의 포리스트 루트 도메인이라 둘 사이에 포리스트 트러스트를 맺을 수 있다. example.com의 포리스트가 example.org의 포리스트를 단방향으로 신뢰하면, 포리스트 트러스트는 전이적이라 example.org의 사용자가 sales.example.com의 자원에도 사용 권한이 있으면 접근한다.',
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
const markerIds = () => Array.from(svg().querySelectorAll('marker'), (marker) => marker.id)

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

const endsAt = (point: { x: number, y: number }) => nodeIds.filter((id) => onEdge(point.x, point.y, nodeBox(id)))
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 136] : [0, 0, 280, 136]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<DomainTrustDiagram />)
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
    const { container } = render(<DomainTrustDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(svg().querySelectorAll('[data-link]')).toHaveLength(0)
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<DomainTrustDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownNotes()).toEqual(Object.keys(noteScenario).filter((id) => noteScenario[id] === scenario.id))
    for (const id of shownNotes()) expect(note(id)!.textContent).toBe(noteLabels[id])
    expect(shownPaths()).toEqual(scenario.paths)
    const [endMarker, startMarker] = markerIds()
    for (const path of svg().querySelectorAll('[data-path]')) {
      const id = path.getAttribute('data-path')!
      expect(path).toHaveAttribute('d', paths[id])
      expect(path).toHaveAttribute('stroke-width', '2')
      expect(path).toHaveClass('stroke-title')
      expect(path).toHaveAttribute('marker-end', `url(#${endMarker})`)
      if (doubleHeaded.includes(id)) expect(path, id).toHaveAttribute('marker-start', `url(#${startMarker})`)
      else expect(path, id).not.toHaveAttribute('marker-start')
      expect(path.closest('[opacity]')).toBeNull()
    }
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말·그룹 라벨이 자리에 들어간다`, async () => {
    render(<DomainTrustDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    expect(overlaps(groupBox('forest-com'), groupBox('forest-org'))).toBe(false)
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
      // example.com·sales.example.com은 example.com이 든 포리스트 안에, example.org는 다른 포리스트 안에만 있다.
      for (const group of groupIds) {
        if (groupOf[id] === group) expect(contains(groupBox(group), nodeBox(id)), `${id} ⊂ ${group}`).toBe(true)
        else expect(overlaps(groupBox(group), nodeBox(id)), `${id} ↔ ${group}`).toBe(false)
      }
    }
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
        // 곁말이 박스 테두리에 걸치지 않는다 — 박스 안에 다 들거나 박스와 겹치지 않는다.
        for (const group of groupIds) expect(contains(groupBox(group), box) || !overlaps(groupBox(group), box), `${id} ↔ ${group} 테두리`).toBe(true)
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
      for (let i = 0; i < noteTexts.length; i += 1) {
        for (const other of noteTexts.slice(i + 1)) expect(overlaps(noteTexts[i], other), `${noteTexts[i].id} ↔ ${other.id}`).toBe(false)
      }
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('선의 양 끝은 노드의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<DomainTrustDiagram />)
    for (const [id, d] of Object.entries(paths)) {
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
      const { start, end } = lineEnds(d)
      expect(endsAt(start), `${id} 시작`).toEqual([ends[id][0]])
      expect(endsAt(end), `${id} 끝`).toEqual([ends[id][1]])
    }
  })

  // 요점: 단방향을 고르면 신뢰 화살표는 example.com에서 example.org로, 접근 화살표는 그 반대로 example.org에서 example.com으로 가고, 둘 다 화살촉이 한쪽에만 있다.
  // sales.example.com에는 어떤 선도 닿지 않는다. 양방향을 고르면 보이는 두 선이 모두 양쪽 끝에 화살촉을 갖는다.
  // 전이를 고르면 신뢰 화살표는 그대로 example.com에서 example.org로 가고, 접근 화살표는 example.org에서 sales.example.com으로 간다.
  it('신뢰의 방향과 접근의 방향이 반대이고, 전이적인 트러스트는 sales.example.com까지 이어진다', async () => {
    render(<DomainTrustDiagram />)
    const direction = (id: string) => [endsAt(lineEnds(paths[id]).start)[0], endsAt(lineEnds(paths[id]).end)[0]]

    await select('단방향')
    expect(direction('trust-com-org')).toEqual(['com', 'org'])
    expect(direction('access-org-com')).toEqual(['org', 'com'])
    expect(note('trust-note')!.textContent).toBe('신뢰')
    expect(note('access-note')!.textContent).toBe('접근')
    for (const path of svg().querySelectorAll('[data-path]')) expect(path).not.toHaveAttribute('marker-start')
    expect(opacityOf('sales')).toBe('0.25')
    for (const id of shownPaths()) {
      for (const segment of segments(paths[id])) expect(touches(segment, nodeBox('sales')), id).toBe(false)
    }

    await select('양방향')
    expect(shownPaths()).toHaveLength(2)
    for (const path of svg().querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-start')
      expect(new Set(direction(path.getAttribute('data-path')!))).toEqual(new Set(['com', 'org']))
    }

    await select('전이')
    expect(shownPaths().map(direction)).toEqual([['com', 'org'], ['org', 'sales']])
    for (const id of ['com', 'sales', 'org']) expect(opacityOf(id)).toBe('1')

    // 그림의 이름과 사실은 본문에 있는 것이다.
    const body = anchorConcept().paragraphs.join('\n')
    for (const name of ['`example.com`', '`example.org`', '`sales.example.com`']) expect(body).toContain(name)
    expect(body).toContain('신뢰는 신뢰하는 도메인에서 신뢰받는 도메인 쪽으로 향하고, 사용자의 접근은 그 반대로 신뢰받는 도메인에서 신뢰하는 도메인 쪽으로 간다')
    expect(body).toContain('여기서 신뢰하는 도메인은 `example.com`, 신뢰받는 도메인은 `example.org`다')
    expect(body).toContain('단방향 트러스트 둘을 서로 반대 방향으로 맺은 것과 같다')
    expect(body).toContain('그 포리스트에 처음 만든 포리스트 루트 도메인')
    expect(body).toContain('외부 트러스트(external trust)는 포리스트 트러스트로 이어지지 않은 다른 포리스트의 도메인 하나와 맺는 비전이적 트러스트다')
    expect(body).toContain('`example.org`의 사용자는 `example.com`의 자원에는 접근할 수 있어도 같은 포리스트의 `sales.example.com`이나 `example.net`의 자원에는 이 트러스트로 접근하지 못한다')
    expect(body).toContain('`example.com`의 포리스트가 `example.org`의 포리스트를 신뢰하는 단방향 포리스트 트러스트를 맺으면, `example.org`의 사용자는 `sales.example.com`과 `example.net`의 자원에도 사용 권한이 있으면 접근한다')
  })
}

describe('DomainTrustDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<DomainTrustDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 136')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('전이')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 136')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '전이' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><DomainTrustDiagram /><DomainTrustDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '양방향' })) })
      const [endMarker, startMarker] = Array.from(figure.querySelectorAll('marker'), (marker) => marker.id)
      for (const path of figure.querySelectorAll('[data-path]')) {
        expect(path).toHaveAttribute('marker-end', `url(#${endMarker})`)
        expect(path).toHaveAttribute('marker-start', `url(#${startMarker})`)
      }
    }
    expect(new Set(figures.flatMap((figure) => Array.from(figure.querySelectorAll('marker'), (marker) => marker.id))).size).toBe(4)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<DomainTrustDiagram />)
    const text = visualsByTopicId[topicId].diagrams['domain-trust']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(domainTrustScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = domainTrustScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 트러스트 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
