import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { LinkTypesDiagram, linkTypesScenarios } from './LinkTypesDiagram'

const topicId = 'network-basics'
const anchorConceptId = `${topicId}.communication-link`
const labels = {
  laptop: '노트북',
  phone: '휴대폰',
  'home-router': '공유기',
  switch: '스위치',
  computer: '컴퓨터',
}
const noteLabels = {
  'wifi-laptop': '와이파이',
  'wifi-phone': '와이파이',
  'cable-switch': '케이블',
  'cable-computer': '케이블',
}
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

const nodeIds = Object.keys(labels)
const wirelessLinks = ['laptop-home-router', 'phone-home-router']
const wiredLinks = ['home-router-switch', 'switch-computer']
const linkIds = [...wirelessLinks, ...wiredLinks]

const tallLinks: Record<string, string> = {
  'laptop-home-router': 'M64 48 V112 H92',
  'phone-home-router': 'M216 48 V112 H188',
  'home-router-switch': 'M140 128 V160',
  'switch-computer': 'M140 192 V224',
}
const wideLinks: Record<string, string> = {
  'laptop-home-router': 'M80 32 H152 V48',
  'phone-home-router': 'M80 96 H152 V80',
  'home-router-switch': 'M200 64 H248',
  'switch-computer': 'M320 64 H360',
}
// 링크마다 잇는 두 노드.
const ends: Record<string, [string, string]> = {
  'laptop-home-router': ['laptop', 'home-router'],
  'phone-home-router': ['phone', 'home-router'],
  'home-router-switch': ['home-router', 'switch'],
  'switch-computer': ['switch', 'computer'],
}

const tallNotes: NotePlaces = {
  'wifi-laptop': { x: 70, y: 84, anchor: 'start' },
  'wifi-phone': { x: 210, y: 84, anchor: 'end' },
  'cable-switch': { x: 148, y: 147, anchor: 'start' },
  'cable-computer': { x: 148, y: 211, anchor: 'start' },
}
const wideNotes: NotePlaces = {
  'wifi-laptop': { x: 116, y: 26, anchor: 'middle' },
  'wifi-phone': { x: 116, y: 110, anchor: 'middle' },
  'cable-switch': { x: 224, y: 58, anchor: 'middle' },
  'cable-computer': { x: 340, y: 58, anchor: 'middle' },
}

const question = '장치들은 무엇으로 이어져 있을까?'
const idleCaption = '공유기와 스위치는 통신 링크가 아니라, 링크의 끝에 놓여 메시지를 받아 다음 노드로 넘겨주는 노드다. 한 네트워크 안에 유선 링크와 무선 링크가 섞여 있을 수 있고, 버튼을 고르면 어느 선이 어느 쪽인지 볼 수 있다.'
const legend = '상자는 노드, 실선은 케이블로 이은 유선 링크, 점선은 케이블 없이 이은 무선 링크다.'
const expectedScenarios = [
  {
    id: 'wireless', label: '무선',
    nodes: ['laptop', 'phone', 'home-router', 'laptop-home-router', 'phone-home-router'],
    notes: ['wifi-laptop', 'wifi-phone'],
    caption: '무선 링크는 케이블 없이 두 장치를 잇고, 와이파이가 그 예다. 이 그림에서는 노트북과 휴대폰이 와이파이로 공유기에 닿는다.',
  },
  {
    id: 'wired', label: '유선',
    nodes: ['home-router', 'switch', 'computer', 'home-router-switch', 'switch-computer'],
    notes: ['cable-switch', 'cable-computer'],
    caption: '유선 링크는 케이블로 두 장치를 잇고, 케이블로는 트위스티드 페어 케이블이나 광케이블을 쓴다. 이 그림에서는 공유기와 스위치, 스위치와 컴퓨터를 케이블로 이었다.',
  },
]

function diagram() {
  return screen.getByRole('img', { name: '노트북과 휴대폰은 와이파이로 공유기에, 공유기와 스위치와 컴퓨터는 케이블로 이어진 네트워크' })
}

async function selectScenario(label: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) })
}

function readBox(rect: Element): SvgBox {
  return {
    id: rect.parentElement?.getAttribute('data-node') ?? '',
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

function nodeBox(id: string) {
  return readBox(diagram().querySelector(`[data-node="${id}"] rect`)!)
}

function shownIds(selector: string, attribute: string) {
  return Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)!)
}

// 글자가 차지하는 상자. 높이는 글자 크기 9를 기준선 위로 잡는다.
function textBox(text: Element): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9)
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id: text.getAttribute('data-note')!, x: left, y: y - 9, width, height: 9 }
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

// 직교 경로를 선분 목록으로 편다. M/H/V만 나온다.
function segments(d: string) {
  const result: { x1: number, y1: number, x2: number, y2: number }[] = []
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
function crossesInside(segment: ReturnType<typeof segments>[number], box: SvgBox) {
  const left = Math.min(segment.x1, segment.x2)
  const right = Math.max(segment.x1, segment.x2)
  const top = Math.min(segment.y1, segment.y2)
  const bottom = Math.max(segment.y1, segment.y2)
  if (top === bottom) return top > box.y && top < box.y + box.height && Math.min(right, box.x + box.width) > Math.max(left, box.x)
  return left > box.x && left < box.x + box.width && Math.min(bottom, box.y + box.height) > Math.max(top, box.y)
}

// 선분과 상자 사이의 가장 짧은 거리.
function distance(segment: ReturnType<typeof segments>[number], box: SvgBox) {
  const dx = Math.max(Math.min(segment.x1, segment.x2) - (box.x + box.width), box.x - Math.max(segment.x1, segment.x2), 0)
  const dy = Math.max(Math.min(segment.y1, segment.y2) - (box.y + box.height), box.y - Math.max(segment.y1, segment.y2), 0)
  return Math.hypot(dx, dy)
}

function onEdge(x: number, y: number, box: SvgBox) {
  const insideX = x >= box.x && x <= box.x + box.width
  const insideY = y >= box.y && y <= box.y + box.height
  return ((x === box.x || x === box.x + box.width) && insideY) || ((y === box.y || y === box.y + box.height) && insideX)
}

function lineEnds(element: Element) {
  const list = segments(element.getAttribute('d')!)
  return { start: { x: list[0].x1, y: list[0].y1 }, end: { x: list[list.length - 1].x2, y: list[list.length - 1].y2 } }
}

// 점이 변 위에 놓인 노드.
function nodeAt(point: { x: number, y: number }) {
  return nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))
}

// 곁말에서 8 안쪽으로 지나는 링크 — 곁말이 가리키는 링크다.
function linksBesideNote(note: Element) {
  const box = textBox(note)
  return Array.from(diagram().querySelectorAll('[data-link]'))
    .filter((link) => segments(link.getAttribute('d')!).some((segment) => distance(segment, box) <= 8))
    .map((link) => link.getAttribute('data-link')!)
}

// 아래 단언들은 배치에 묶이지 않는다. 세로형과 가로형이 같은 기대값으로 통과해야 한다.
async function expectScenario(
  scenario: typeof expectedScenarios[number],
  places: NotePlaces,
  width: number,
  container: HTMLElement,
) {
  await selectScenario(scenario.label)

  for (const element of diagram().querySelectorAll('[data-node], [data-link]')) {
    const id = element.getAttribute('data-node') ?? element.getAttribute('data-link')!
    expect(element, id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)

  const lineSegments = Array.from(diagram().querySelectorAll('[data-link]')).flatMap((line) => segments(line.getAttribute('d')!))
  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  const shownNotes = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shownNotes.map((note) => note.getAttribute('data-note')).sort()).toEqual([...scenario.notes].sort())
  for (const note of shownNotes) {
    const id = note.getAttribute('data-note')! as NoteId
    expect(note.textContent).toBe(noteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', places[id].anchor)
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note.closest('[opacity]')).toBeNull()
    const box = textBox(note)
    expect(box.x, id).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, id).toBeLessThanOrEqual(width)
    for (const node of nodeBoxes) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const segment of lineSegments) expect(crossesInside(segment, box), `${id} ↔ 선`).toBe(false)
  }
  for (let i = 0; i < shownNotes.length; i += 1) {
    for (let j = i + 1; j < shownNotes.length; j += 1) {
      expect(overlaps(textBox(shownNotes[i]), textBox(shownNotes[j])), '곁말끼리').toBe(false)
    }
  }
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 노드 라벨이 자기 상자 안에 들어간다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(5)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(label, 10) + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
  }
}

// 통신 링크는 늘 보이고 화살표가 없다. 노드는 모두 회색이고 도식 전용 두 색·초록·빨강·주황은 쓰지 않는다.
function expectLinksAndColors(links: Record<string, string>) {
  const shown = Array.from(diagram().querySelectorAll('[data-link]'))
  expect(shown.map((link) => link.getAttribute('data-link'))).toEqual(linkIds)
  for (const link of shown) {
    const id = link.getAttribute('data-link')!
    expect(link).toHaveAttribute('d', links[id])
    expect(link).toHaveClass('fill-none', 'stroke-muted')
    expect(link).toHaveAttribute('stroke-width', '1.5')
    expect(link).not.toHaveAttribute('marker-end')
  }
  expect(diagram().querySelector('marker')).toBeNull()
  for (const id of nodeIds) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 링크의 양 끝은 두 노드의 변에 닿고, 어떤 선분도 노드 안을 지나지 않는다.
function expectLinkEnds() {
  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  for (const link of diagram().querySelectorAll('[data-link]')) {
    const id = link.getAttribute('data-link')!
    for (const segment of segments(link.getAttribute('d')!)) {
      for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
    }
    const { start, end } = lineEnds(link)
    expect(nodeAt(start), `${id} 시작`).toBe(ends[id][0])
    expect(nodeAt(end), `${id} 끝`).toBe(ends[id][1])
  }
}

// 무선과 유선은 선 모양으로 갈린다 — 무선 링크만 점선이다. 두 시나리오가 밝히는 링크는 겹치지 않고, 합치면 모든 링크다.
// 와이파이 곁말은 무선 링크 곁에, 케이블 곁말은 유선 링크 곁에만 붙는다. 공유기와 스위치는 링크가 아니라 링크 끝의 노드다.
async function expectLinkKinds() {
  for (const id of wirelessLinks) expect(diagram().querySelector(`[data-link="${id}"]`), id).toHaveAttribute('stroke-dasharray', '4 3')
  for (const id of wiredLinks) expect(diagram().querySelector(`[data-link="${id}"]`), id).not.toHaveAttribute('stroke-dasharray')

  const litLinks = (scenario: typeof expectedScenarios[number]) => scenario.nodes.filter((id) => linkIds.includes(id))
  const [wireless, wired] = expectedScenarios.map(litLinks)
  expect(wireless).toEqual(wirelessLinks)
  expect(wired).toEqual(wiredLinks)
  expect(wireless.filter((id) => wired.includes(id))).toEqual([])
  expect([...wireless, ...wired].sort()).toEqual([...linkIds].sort())

  await selectScenario('무선')
  for (const note of diagram().querySelectorAll('[data-note]')) {
    expect(note.textContent).toBe('와이파이')
    expect(linksBesideNote(note), note.getAttribute('data-note')!).toHaveLength(1)
    expect(wirelessLinks).toContain(linksBesideNote(note)[0])
  }
  expect(new Set(Array.from(diagram().querySelectorAll('[data-note]'), linksBesideNote).flat())).toEqual(new Set(wirelessLinks))

  await selectScenario('유선')
  for (const note of diagram().querySelectorAll('[data-note]')) {
    expect(note.textContent).toBe('케이블')
    expect(linksBesideNote(note), note.getAttribute('data-note')!).toHaveLength(1)
    expect(wiredLinks).toContain(linksBesideNote(note)[0])
  }
  expect(new Set(Array.from(diagram().querySelectorAll('[data-note]'), linksBesideNote).flat())).toEqual(new Set(wiredLinks))

  const linksAt = (node: string) => linkIds.filter((id) => ends[id].includes(node))
  expect(linksAt('home-router')).toEqual(['laptop-home-router', 'phone-home-router', 'home-router-switch'])
  expect(linksAt('switch')).toEqual(['home-router-switch', 'switch-computer'])
  for (const id of ['home-router', 'switch']) expect(diagram().querySelector(`[data-link="${id}"]`), id).toBeNull()
}

describe('LinkTypesDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<LinkTypesDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 다섯과 통신 링크 넷이 모두 선명하고 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<LinkTypesDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·링크·곁말만 선명하고 나머지는 흐려진다', async (scenario) => {
    const { container } = render(<LinkTypesDiagram />)
    await expectScenario(scenario, tallNotes, 280, container)
  })

  it('시나리오를 바꾸면 이전 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<LinkTypesDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-note]', 'data-note')).toEqual(scenario.notes)
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드 다섯이 280×272 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<LinkTypesDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 272')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 272])
  })

  it('통신 링크는 늘 화살표 없이 보이고 노드는 모두 회색이다', () => {
    render(<LinkTypesDiagram />)
    expectLinksAndColors(tallLinks)
  })

  it('링크의 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', () => {
    render(<LinkTypesDiagram />)
    expectLinkEnds()
  })

  it('무선 링크는 점선, 유선 링크는 실선이고 두 시나리오가 링크를 겹치지 않게 나눠 밝힌다', async () => {
    render(<LinkTypesDiagram />)
    await expectLinkKinds()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<LinkTypesDiagram />)
    const text = visualsByTopicId[topicId].diagrams['link-types']
    const ids = linkTypesScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toBeUndefined()
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([anchorConceptId])
    expect(text.label).toBe('유선 링크와 무선 링크가 섞인 네트워크 도식')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = linkTypesScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual([])
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) {
      expect(conceptIds).toContain(source)
    }
  })

  it('두 번 렌더해도 도식마다 자기 시나리오를 따로 고른다', async () => {
    render(<><LinkTypesDiagram /><LinkTypesDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: '유선 링크와 무선 링크가 섞인 네트워크 도식' })

    await act(async () => { await userEvent.click(within(figures[0]).getByRole('button', { name: '무선' })) })

    expect(figures[0].querySelectorAll('[data-note]')).toHaveLength(2)
    expect(figures[1].querySelectorAll('[data-note]')).toHaveLength(0)
    for (const figure of figures) expect(figure.querySelector('marker')).toBeNull()
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 통신 링크 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: '유선 링크와 무선 링크가 섞인 네트워크 도식' })

    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(within(figure).queryByRole('heading')).toBeNull()
  })

  describe('가로형 (768px 이상)', () => {
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

      return {
        change(nextMatches: boolean) {
          mediaQuery.matches = nextMatches
          const event = Object.assign(new Event('change'), {
            matches: nextMatches,
            media: mediaQuery.media,
          })
          listeners.forEach((listener) => listener(event))
        },
      }
    }

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×128 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<LinkTypesDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 128')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드 id 집합과 링크 id 집합이 세로형과 같다', () => {
      const { change } = mockMatchMedia(false)
      render(<LinkTypesDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 272')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallLinkIds = shownIds('[data-link]', 'data-link').sort()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 128')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinkIds)
      expect(tallLinkIds).toEqual([...linkIds].sort())
    })

    it('모든 rect가 440×128 viewBox 안에 있고 노드 라벨이 자기 상자 안에 들어간다', () => {
      render(<LinkTypesDiagram />)
      expectFits([0, 0, 440, 128])
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·링크·곁말·캡션을 보이고 곁말은 노드·선과 겹치지 않는다', async (scenario) => {
      const { container } = render(<LinkTypesDiagram />)
      await expectScenario(scenario, wideNotes, 440, container)
    })

    it('통신 링크는 늘 화살표 없이 보이고 노드는 모두 회색이다', () => {
      render(<LinkTypesDiagram />)
      expectLinksAndColors(wideLinks)
    })

    it('링크의 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', () => {
      render(<LinkTypesDiagram />)
      expectLinkEnds()
    })

    it('무선 링크는 점선, 유선 링크는 실선이고 두 시나리오가 링크를 겹치지 않게 나눠 밝힌다', async () => {
      render(<LinkTypesDiagram />)
      await expectLinkKinds()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<LinkTypesDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 272')
      await selectScenario('유선')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '유선' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      for (const id of ['laptop', 'phone', 'laptop-home-router', 'phone-home-router']) {
        expect(diagram().querySelector(`[data-node="${id}"], [data-link="${id}"]`), id).toHaveAttribute('opacity', '0.25')
      }
      expect(diagram().querySelector('[data-note="cable-switch"]')).toHaveAttribute('x', String(wideNotes['cable-switch'].x))
    })
  })
})
