import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { DomainTreeDiagram, domainTreeScenarios } from './DomainTreeDiagram'

const topicId = 'dns'
const anchorConceptId = `${topicId}.domain-hierarchy`
const labels: Record<string, string> = {
  root: '루트',
  com: 'com',
  net: 'net',
  org: 'org',
  example: 'example',
  www: 'www',
  mail: 'mail',
  'name-www': 'www',
  'name-example': 'example',
  'name-com': 'com',
}
const groupLabels: Record<string, string> = {
  tree: '이름 나무',
  name: '이름 www.example.com',
}
const noteLabels: Record<string, string> = {
  'tld-layer': '최상위 도메인',
  'second-layer': '2단계',
  'third-layer': '3단계',
  'www-level': '3단계',
  'example-level': '2단계',
  'com-level': '최상위 도메인',
  'read-note': '오른쪽 레이블부터 읽는다',
  'sub-note': '서브 도메인',
}
// 나무의 층 이름은 늘 보이고 흐려지지 않는다. 레이블의 단계 이름은 늘 보이고 자기 레이블 노드의 opacity를 따른다.
// 나머지 곁말은 자기 시나리오에서만 보인다.
const layerNotes = ['tld-layer', 'second-layer', 'third-layer']
const fieldNoteOf: Record<string, string> = { 'www-level': 'name-www', 'example-level': 'name-example', 'com-level': 'name-com' }
const noteScenario: Record<string, string> = { 'read-note': 'read', 'sub-note': 'subdomain' }
// 같은 단계를 가리키는 나무의 층 이름과 레이블의 단계 이름은 같은 말이다.
const layerOf: Record<string, string> = { 'name-com': 'tld-layer', 'name-example': 'second-layer', 'name-www': 'third-layer' }
const treeOf: Record<string, string> = { 'name-com': 'com', 'name-example': 'example', 'name-www': 'www' }
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const treeIds = ['root', 'com', 'net', 'org', 'example', 'www', 'mail']
const nameIds = ['name-www', 'name-example', 'name-com']
const linkIds = ['b-com', 'b-net', 'b-org', 'b-example', 'b-www', 'b-mail']
const alwaysNotes = [...layerNotes, ...Object.keys(fieldNoteOf)]

const tallPaths: Record<string, string> = {
  'b-com': 'M132 56 V80',
  'b-net': 'M132 56 V68 H188 V80',
  'b-org': 'M132 56 V68 H244 V80',
  'b-example': 'M132 112 V136',
  'b-www': 'M132 168 V180 H108 V192',
  'b-mail': 'M132 168 V180 H164 V192',
  'to-com': 'M132 56 V80',
  'to-example': 'M132 112 V136',
  'to-www': 'M132 168 V180 H108 V192',
}
const widePaths: Record<string, string> = {
  'b-com': 'M124 60 V84',
  'b-net': 'M124 60 V72 H176 V84',
  'b-org': 'M124 60 V72 H228 V84',
  'b-example': 'M124 116 V140',
  'b-www': 'M124 172 V184 H96 V196',
  'b-mail': 'M124 172 V184 H152 V196',
  'to-com': 'M124 60 V84',
  'to-example': 'M124 116 V140',
  'to-www': 'M124 172 V184 H96 V196',
}
const ends: Record<string, [string, string]> = {
  'b-com': ['root', 'com'],
  'b-net': ['root', 'net'],
  'b-org': ['root', 'org'],
  'b-example': ['com', 'example'],
  'b-www': ['example', 'www'],
  'b-mail': ['example', 'mail'],
  'to-com': ['root', 'com'],
  'to-example': ['com', 'example'],
  'to-www': ['example', 'www'],
}

const question = '도메인 이름은 어느 쪽부터 읽어야 할까?'
const figureName = '도메인 이름을 묶는 이름 나무의 일부와 이름 www.example.com을 레이블마다 나눈 것을 함께 놓고, 이름을 읽는 차례와 최상위 도메인, 서브 도메인을 보이는 도식'
const svgName = '루트 아래에 최상위 도메인 com, net, org가, com 아래에 example이, example 아래에 www와 mail이 있는 이름 나무와, 이름 www.example.com을 www, example, com 레이블로 나눈 그림'
const idleCaption = '도메인 이름을 묶는 이름 나무의 일부와, 이름 www.example.com을 레이블마다 나눈 것을 함께 놓았다. 이름은 예로 붙인 것이다. 버튼을 고르면 이름을 읽는 차례와 최상위 도메인, 서브 도메인을 볼 수 있다.'
const legend = '나무의 선은 위 단계의 마디와 그 바로 아래 마디를 잇고, 화살표는 루트에서 한 단계씩 내려가는 차례다. 단계 이름은 나무의 층과 이름의 레이블에 함께 붙어 있다.'
const expectedScenarios = [
  {
    id: 'read', label: '읽는 차례',
    nodes: ['root', 'com', 'example', 'www', 'name-www', 'name-example', 'name-com', 'b-com', 'b-example', 'b-www'],
    paths: ['to-com', 'to-example', 'to-www'],
    caption: 'www.example.com은 오른쪽 레이블일수록 위 단계라서 오른쪽부터 읽는다. 루트에서 시작해 최상위 도메인 com, 2단계 example, 3단계 www로 한 단계씩 내려가며, 맨 왼쪽의 www가 가장 아래 단계다.',
  },
  {
    id: 'tld', label: '최상위 도메인',
    nodes: ['root', 'com', 'net', 'org', 'name-com', 'b-com', 'b-net', 'b-org'],
    paths: [] as string[],
    caption: '루트 바로 아래 단계가 최상위 도메인이다. com, net, org가 이 단계에 있고, 이름 www.example.com에서는 맨 오른쪽 레이블 com이 최상위 도메인이다.',
  },
  {
    id: 'subdomain', label: '서브 도메인',
    nodes: ['example', 'www', 'mail', 'name-www', 'name-example', 'name-com', 'b-www', 'b-mail'],
    paths: [] as string[],
    caption: 'example.com 도메인에는 그 아래에 딸린 www.example.com과 mail.example.com이 함께 든다. 이렇게 어떤 도메인 안에 든 도메인을 그 도메인의 서브 도메인이라 하고, 두 이름은 모두 example.com으로 끝난다.',
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

const center = (box: SvgBox) => ({ x: box.x + box.width / 2, y: box.y + box.height / 2 })
const distance = (a: SvgBox, b: SvgBox) => Math.hypot(center(a).x - center(b).x, center(a).y - center(b).y)
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 244] : [0, 0, 280, 328]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<DomainTreeDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 나무의 선이 모두 선명하고 단계 이름만 보이며 화살표 없이 선택 안내가 나온다', () => {
    const { container } = render(<DomainTreeDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(Array.from(svg().querySelectorAll('[data-link]'), (item) => item.getAttribute('data-link'))).toEqual(linkIds)
    for (const id of linkIds) {
      expect(link(id)).toHaveAttribute('opacity', '1')
      expect(link(id)).toHaveAttribute('d', paths[id])
      expect(link(id)).toHaveClass('stroke-muted')
      expect(link(id)).not.toHaveAttribute('marker-end')
    }
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual(alwaysNotes)
    for (const id of alwaysNotes) expect(note(id)!.textContent).toBe(noteLabels[id])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·선·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<DomainTreeDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    for (const id of linkIds) expect(link(id), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    const scenarioNotes = Object.keys(noteScenario).filter((id) => noteScenario[id] === scenario.id)
    expect(shownNotes()).toEqual([...alwaysNotes, ...scenarioNotes])
    for (const id of shownNotes()) expect(note(id)!.textContent).toBe(noteLabels[id])
    for (const [id, field] of Object.entries(fieldNoteOf)) expect(note(id), id).toHaveAttribute('opacity', opacityOf(field)!)
    for (const id of [...layerNotes, ...scenarioNotes]) expect(note(id)!.getAttribute('opacity'), id).toBeNull()
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
    render(<DomainTreeDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    expect(overlaps(groupBox('tree'), groupBox('name'))).toBe(false)
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    for (const id of treeIds) expect(contains(groupBox('tree'), nodeBox(id)), id).toBe(true)
    for (const id of nameIds) expect(contains(groupBox('name'), nodeBox(id)), id).toBe(true)
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
        // 나무의 층 이름과 서브 도메인 곁말은 나무 박스 안에, 레이블의 단계 이름과 읽는 차례 곁말은 이름 박스 안에 놓인다.
        const home = layerNotes.includes(id) || id === 'sub-note' ? 'tree' : 'name'
        expect(contains(groupBox(home), box), id).toBe(true)
        // 레이블의 단계 이름은 다른 레이블보다 자기 레이블에 가깝다.
        if (fieldNoteOf[id]) {
          for (const other of nameIds.filter((nameId) => nameId !== fieldNoteOf[id])) {
            expect(distance(box, nodeBox(fieldNoteOf[id])), `${id} ↔ ${other}`).toBeLessThan(distance(box, nodeBox(other)))
          }
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
        for (const group of groupTexts) expect(overlaps(noteTexts[i], group), `${noteTexts[i].id} ↔ ${group.id}`).toBe(false)
      }
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('선과 화살표의 양 끝은 노드의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나지 않는다', async () => {
    render(<DomainTreeDiagram />)
    for (const [id, d] of Object.entries(paths)) {
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
        const span = { id: '', x: Math.min(segment.x1, segment.x2), y: Math.min(segment.y1, segment.y2), width: Math.abs(segment.x2 - segment.x1), height: Math.abs(segment.y2 - segment.y1) }
        expect(contains(groupBox('tree'), span), id).toBe(true)
      }
      const { start, end } = lineEnds(d)
      expect(endAt(start), `${id} 시작`).toBe(ends[id][0])
      expect(endAt(end), `${id} 끝`).toBe(ends[id][1])
    }
    // 화살표는 나무의 선 위에 겹쳐 그린다.
    for (const id of ['to-com', 'to-example', 'to-www']) expect(paths[id]).toBe(paths[`b-${id.slice(3)}`])
  })

  // 요점: 나무는 루트 → com → example → www 차례로 위에서 아래로 내려가고, 선과 화살표는 모두 아래로만 내려간다.
  // 읽는 차례에서는 www로 가는 갈래만 보이고 mail은 흐리다. 레이블의 단계 이름은 나무에서 같은 층의 이름과 같다.
  it('나무는 루트 → com → example → www 차례로 내려가고, 선은 모두 아래로 내려가며, 레이블마다 나무의 같은 층 이름이 붙는다', async () => {
    render(<DomainTreeDiagram />)
    const ys = ['root', 'com', 'example', 'www'].map((id) => nodeBox(id).y)
    expect([...ys].sort((a, b) => a - b)).toEqual(ys)
    expect(new Set(ys).size).toBe(4)
    for (const id of ['net', 'org']) expect(nodeBox(id).y, id).toBe(nodeBox('com').y)
    expect(nodeBox('mail').y).toBe(nodeBox('www').y)
    for (const [id, d] of Object.entries(paths)) {
      for (const segment of segments(d)) {
        if (segment.x1 === segment.x2) expect(segment.y2, id).toBeGreaterThan(segment.y1)
      }
    }
    for (const nameId of nameIds) {
      expect(label(nameId)).toBe(label(treeOf[nameId]))
      const fieldNote = Object.keys(fieldNoteOf).find((id) => fieldNoteOf[id] === nameId)!
      expect(note(fieldNote)!.textContent, nameId).toBe(note(layerOf[nameId])!.textContent)
      // 나무의 층 이름은 그 층의 노드와 같은 높이에 놓인다.
      const layer = textBox(note(layerOf[nameId])!, layerOf[nameId])
      const row = nodeBox(treeOf[nameId])
      expect(layer.y, nameId).toBeGreaterThanOrEqual(row.y)
      expect(layer.y + layer.height, nameId).toBeLessThanOrEqual(row.y + row.height)
    }
    if (wide) {
      // 가로형은 레이블을 나무의 같은 층 옆에 위에서 아래로 놓는다 — 맨 위가 오른쪽 레이블 com이다.
      for (const nameId of nameIds) expect(nodeBox(nameId).y, nameId).toBe(nodeBox(treeOf[nameId]).y)
    } else {
      // 세로형은 이름을 쓴 차례 그대로 왼쪽부터 www · example · com을 빈틈없이 잇는다.
      for (let i = 1; i < nameIds.length; i += 1) {
        expect(nodeBox(nameIds[i]).x).toBe(nodeBox(nameIds[i - 1]).x + nodeBox(nameIds[i - 1]).width)
        expect(nodeBox(nameIds[i]).y).toBe(nodeBox(nameIds[0]).y)
      }
    }

    await select('읽는 차례')
    expect(opacityOf('mail')).toBe('0.25')
    expect(link('b-mail')).toHaveAttribute('opacity', '0.25')
    expect(shownPaths().map((id) => ends[id][1])).toEqual(['com', 'example', 'www'])
    await select('최상위 도메인')
    expect(['com', 'net', 'org'].map(opacityOf)).toEqual(['1', '1', '1'])
    expect(['name-www', 'name-example'].map(opacityOf)).toEqual(['0.25', '0.25'])
    expect(opacityOf('name-com')).toBe('1')
    await select('서브 도메인')
    expect(['www', 'mail'].map(opacityOf)).toEqual(['1', '1'])
    expect(opacityOf('root')).toBe('0.25')

    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join('\n')
    expect(body).toContain('오른쪽에 있는 레이블일수록 위 단계다.')
    expect(body).toContain('루트 아래의 최상위 도메인 `com`, `com` 아래 2단계의 `example`, `example` 아래 3단계의 `www`로 한 단계씩 내려간다.')
    expect(body).toContain('`www.example.com`과 `mail.example.com`은 `example.com`의 서브 도메인이고')
    expect(body).toContain('`com`·`net`·`org`')
  })
}

describe('DomainTreeDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선·화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<DomainTreeDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 328')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('읽는 차례')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 244')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '읽는 차례' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      for (const id of linkIds) expect(link(id)).toHaveAttribute('d', widePaths[id])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><DomainTreeDiagram /><DomainTreeDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '읽는 차례' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<DomainTreeDiagram />)
    const text = visualsByTopicId[topicId].diagrams['domain-tree']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(domainTreeScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = domainTreeScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 도메인 이름의 계층 구조 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
