import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { EtcFilesDiagram, etcFilesScenarios } from './EtcFilesDiagram'

const topicId = 'linux-filesystem'
const anchorConceptId = `${topicId}.etc-directory`
const labels = {
  slash: '/',
  etc: 'etc',
  bin: 'bin',
  passwd: 'passwd',
  shadow: 'shadow',
  fstab: 'fstab',
  cat: 'cat',
}
const noteLabels = {
  'passwd-note': '계정 목록',
  'shadow-note': 'root만 읽을 수 있다',
  'fstab-note': '마운트할 목록',
  'cat-note': '/bin/cat',
}
type NoteId = keyof typeof noteLabels

const nodeIds = Object.keys(labels)
const linkIds = ['b-etc', 'b-bin', 'b-passwd', 'b-shadow', 'b-fstab', 'b-cat']
// 가지마다 부모와 자식.
const linkEnds: Record<string, [string, string]> = {
  'b-etc': ['slash', 'etc'],
  'b-bin': ['slash', 'bin'],
  'b-passwd': ['etc', 'passwd'],
  'b-shadow': ['etc', 'shadow'],
  'b-fstab': ['etc', 'fstab'],
  'b-cat': ['bin', 'cat'],
}

const tallLinks: Record<string, string> = {
  'b-etc': 'M140 40 V56 H50 V72',
  'b-bin': 'M140 40 V56 H226 V72',
  'b-passwd': 'M36 104 V136 H60',
  'b-shadow': 'M36 104 V184 H60',
  'b-fstab': 'M36 104 V232 H60',
  'b-cat': 'M226 104 V120',
}
const wideLinks: Record<string, string> = {
  'b-etc': 'M48 112 H68 V68 H88',
  'b-bin': 'M48 112 H68 V156 H88',
  'b-passwd': 'M148 68 H172 V24 H196',
  'b-shadow': 'M148 68 H196',
  'b-fstab': 'M148 68 H172 V112 H196',
  'b-cat': 'M148 156 H196',
}

type Note = { x: number, y: number, anchor: 'start' | 'middle' | 'end' }
const tallNotes: Record<NoteId, Note> = {
  'passwd-note': { x: 132, y: 140, anchor: 'start' },
  'shadow-note': { x: 132, y: 188, anchor: 'start' },
  'fstab-note': { x: 132, y: 236, anchor: 'start' },
  'cat-note': { x: 226, y: 168, anchor: 'middle' },
}
const wideNotes: Record<NoteId, Note> = {
  'passwd-note': { x: 268, y: 28, anchor: 'start' },
  'shadow-note': { x: 268, y: 72, anchor: 'start' },
  'fstab-note': { x: 268, y: 116, anchor: 'start' },
  'cat-note': { x: 256, y: 160, anchor: 'start' },
}

const question = '설정 파일과 계정 정보는 어디에 있을까?'
const idleCaption = '루트 디렉터리 / 아래의 etc 디렉터리에 passwd·shadow·fstab 파일이 있고, bin 디렉터리에 명령 cat의 프로그램 파일이 있다. 버튼을 고르면 계정 정보, 마운트할 목록, 명령의 프로그램이 어디 있는지 볼 수 있다.'
const legend = '가는 선은 디렉터리와 그 안에 든 것을 잇는다.'
const figureName = '루트 디렉터리 / 아래 etc 디렉터리에 계정 목록 passwd, 암호 정보 shadow, 마운트할 목록 fstab이 있고 명령 cat의 프로그램은 bin 디렉터리에 있어, 설정 파일과 계정 정보는 /etc에 있고 명령의 프로그램은 다른 곳에 있다는 것을 보이는 도식'
const svgName = '루트 디렉터리 / 아래 etc 디렉터리에 passwd·shadow·fstab 파일이, bin 디렉터리에 cat 파일이 나무 모양으로 이어져 있다'
const expectedScenarios = [
  {
    id: 'accounts', label: '계정 정보',
    nodes: ['etc', 'passwd', 'shadow', 'b-passwd', 'b-shadow'],
    notes: ['passwd-note', 'shadow-note'] as NoteId[],
    caption: '어떤 사용자 계정이 있는지 적은 /etc/passwd와 계정마다의 암호 정보를 적은 /etc/shadow도 /etc의 설정 파일이다. /etc/passwd는 모든 사용자가 읽을 수 있지만, /etc/shadow는 암호를 지키려고 root만 읽을 수 있게 둔다.',
    sources: [anchorConceptId],
  },
  {
    id: 'mounts', label: '마운트할 목록',
    nodes: ['etc', 'fstab', 'b-fstab'],
    notes: ['fstab-note'] as NoteId[],
    caption: '부팅할 때 어느 디스크의 저장 공간을 디렉터리 나무의 어디에 마운트할지 적은 목록 /etc/fstab도 /etc에 있는 설정 파일이다.',
    sources: [anchorConceptId],
  },
  {
    id: 'programs', label: '명령의 프로그램',
    nodes: ['bin', 'cat', 'b-cat'],
    notes: ['cat-note'] as NoteId[],
    caption: '명령의 프로그램 파일은 /etc에 두지 않는다. 파일 내용을 화면에 보여 주는 명령 cat의 프로그램은 /bin/cat에 있고, /etc에는 프로그램들이 읽는 설정 파일을 둔다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 256]
const wideBox: [number, number, number, number] = [0, 0, 440, 180]

function diagram() {
  return screen.getByRole('img', { name: svgName })
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

function lineEnds(element: Element) {
  const list = segments(element.getAttribute('d')!)
  return { start: { x: list[0].x1, y: list[0].y1 }, end: { x: list[list.length - 1].x2, y: list[list.length - 1].y2 } }
}

// 점이 변 위에 놓인 노드.
function nodeAt(point: { x: number, y: number }) {
  return nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))
}

// 선의 양 끝이 지정한 두 노드의 변에 닿고, 어떤 선분도 노드 안을 지나지 않는다.
function expectLine(line: Element, id: string, pair: [string, string]) {
  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  for (const segment of segments(line.getAttribute('d')!)) {
    for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
  }
  const { start, end } = lineEnds(line)
  expect(nodeAt(start), `${id} 시작`).toBe(pair[0])
  expect(nodeAt(end), `${id} 끝`).toBe(pair[1])
}

// 보이는 곁말이 지정한 id·글·자리이고, viewBox 안에서 노드·선·다른 곁말과 겹치지 않는다.
function expectNotes(ids: NoteId[], places: Record<NoteId, Note>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note')).sort()).toEqual([...ids].sort())
  const boxes = shown.map((note) => textBox(note, note.getAttribute('data-note')!))
  for (const note of shown) {
    const id = note.getAttribute('data-note')! as NoteId
    const box = textBox(note, id)
    expect(note.textContent).toBe(noteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', places[id].anchor)
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note.closest('[opacity]')).toBeNull()
    expect(box.x, id).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, id).toBeLessThanOrEqual(width)
    expect(box.y, id).toBeGreaterThanOrEqual(0)
    expect(box.y + box.height, id).toBeLessThanOrEqual(height)
    for (const node of nodeIds.map(nodeBox)) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const line of diagram().querySelectorAll('[data-link]')) {
      for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), `${id} ↔ 선`).toBe(false)
    }
    for (const other of boxes.filter((item) => item.id !== id)) expect(overlaps(box, other), `${id} ↔ ${other.id}`).toBe(false)
  }
}

// 곁말 넷을 한꺼번에 놓아도 서로·노드·선과 겹치지 않는다(시나리오마다 일부만 보이지만 자리는 늘 같다).
function expectAllNotesApart(places: Record<NoteId, Note>) {
  const boxes = (Object.keys(places) as NoteId[]).map((id) => {
    const element = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    element.textContent = noteLabels[id]
    element.setAttribute('x', String(places[id].x))
    element.setAttribute('y', String(places[id].y))
    element.setAttribute('text-anchor', places[id].anchor)
    return textBox(element, id)
  })
  for (let i = 0; i < boxes.length; i += 1) {
    for (let j = i + 1; j < boxes.length; j += 1) expect(overlaps(boxes[i], boxes[j]), `${boxes[i].id} ↔ ${boxes[j].id}`).toBe(false)
    for (const node of nodeIds.map(nodeBox)) expect(overlaps(boxes[i], node), `${boxes[i].id} ↔ ${node.id}`).toBe(false)
    for (const line of diagram().querySelectorAll('[data-link]')) {
      for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, boxes[i]), `${boxes[i].id} ↔ 선`).toBe(false)
    }
  }
}

// 가지 여섯은 늘 보이고 부모와 자식을 잇는다.
function expectLinks(links: Record<string, string>, scenarioNodes: string[] | null) {
  expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
  for (const link of diagram().querySelectorAll('[data-link]')) {
    const id = link.getAttribute('data-link')!
    expect(link).toHaveAttribute('d', links[id])
    expect(link).toHaveClass('stroke-muted')
    expect(link).toHaveAttribute('opacity', scenarioNodes && !scenarioNodes.includes(id) ? '0.25' : '1')
    expectLine(link, id, linkEnds[id])
  }
}

async function expectScenario(
  scenario: typeof expectedScenarios[number],
  links: Record<string, string>,
  places: Record<NoteId, Note>,
  width: number,
  height: number,
  container: HTMLElement,
) {
  await selectScenario(scenario.label)

  for (const element of diagram().querySelectorAll('[data-node]')) {
    const id = element.getAttribute('data-node')!
    expect(element, id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  expectLinks(links, scenario.nodes)
  expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
  expectNotes(scenario.notes, places, width, height)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다. 노드는 모두 회색이다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
  expect(diagram().querySelectorAll('rect')).toHaveLength(nodeIds.length)

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(node.querySelector('rect')).toHaveClass('stroke-disabled')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(label, 10) * 1.15 + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
  }
  for (let i = 0; i < nodeIds.length; i += 1) {
    for (let j = i + 1; j < nodeIds.length; j += 1) {
      expect(overlaps(nodeBox(nodeIds[i]), nodeBox(nodeIds[j])), `${nodeIds[i]} ↔ ${nodeIds[j]}`).toBe(false)
    }
  }
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 요점: 「계정 정보」에서는 passwd·shadow가 선명하고 cat은 흐리다. 「명령의 프로그램」에서는 etc 아래의 파일이 하나도 선명하지 않다.
// 곧 계정 목록과 암호 정보는 /etc에 있고, 명령의 프로그램은 /etc가 아닌 /bin에 있다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const brightNodes = () => Array.from(diagram().querySelectorAll('[data-node][opacity="1"]'), (element) => element.getAttribute('data-node')!)
  const etcChildren = Object.values(linkEnds).filter(([parent]) => parent === 'etc').map(([, child]) => child)
  expect(etcChildren.sort()).toEqual(['fstab', 'passwd', 'shadow'])

  await selectScenario('계정 정보')
  expect(brightNodes()).toEqual(expect.arrayContaining(['passwd', 'shadow']))
  expect(brightNodes()).not.toContain('cat')
  expect(body).toContain('`/etc/passwd`는 이 컴퓨터에 어떤 사용자 계정이 있는지 적은 계정 목록이다')
  expect(body).toContain('`/etc/shadow`에 두고 root만 읽을 수 있게 한다')

  await selectScenario('명령의 프로그램')
  expect(brightNodes().filter((id) => etcChildren.includes(id))).toEqual([])
  expect(brightNodes()).toContain('cat')
  expect(body).toContain('명령 `cat`의 프로그램은 `/bin/cat`에 있다')
}

describe('EtcFilesDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<EtcFilesDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 가지가 모두 선명하고 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<EtcFilesDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expectLinks(tallLinks, null)
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·가지·곁말만 선명하다', async (scenario) => {
    const { container } = render(<EtcFilesDiagram />)
    await expectScenario(scenario, tallLinks, tallNotes, 280, 256, container)
  })

  it('시나리오를 바꾸면 이전 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<EtcFilesDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('세 시나리오의 선명한 노드·곁말이 서로 다르다', () => {
    const keys = expectedScenarios.map(({ nodes, notes }) => JSON.stringify([[...nodes].sort(), [...notes].sort()]))
    expect(new Set(keys).size).toBe(expectedScenarios.length)
  })

  it('노드가 280×256 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<EtcFilesDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 256')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
    expectAllNotesApart(tallNotes)
  })

  it('/etc와 /bin이 받는 파일이 다르다 — 계정 정보는 etc 아래, 명령의 프로그램은 bin 아래에 있다', async () => {
    render(<EtcFilesDiagram />)
    await expectPoint()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<EtcFilesDiagram />)
    const text = visualsByTopicId[topicId].diagrams['etc-files']
    const ids = etcFilesScenarios.map(({ id }) => id).sort()
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
    expect(text.label).toBe(figureName)
    expect(text.svgLabel).toBe(svgName)
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = etcFilesScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: expected.sources })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual([])
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) {
      expect(conceptIds).toContain(source)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 /etc 디렉터리 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })

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
          const event = Object.assign(new Event('change'), { matches: nextMatches, media: mediaQuery.media })
          listeners.forEach((listener) => listener(event))
        },
      }
    }

    async function collectIds(selector: string, attribute: string) {
      const found = new Set<string>()
      for (const { label } of expectedScenarios) {
        await selectScenario(label)
        for (const id of shownIds(selector, attribute)) found.add(id)
      }
      return [...found].sort()
    }

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×180 viewBox를 w-full 래퍼 하나로 그리고 가지를 유지한다', () => {
      render(<EtcFilesDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 180')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expectLinks(wideLinks, null)
    })

    it('노드·가지 id 집합과 곁말 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<EtcFilesDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 256')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallLinkIds = shownIds('[data-link]', 'data-link').sort()
      const tallNoteIds = await collectIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 180')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinkIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallNoteIds).toEqual(Object.keys(noteLabels).sort())
      expect(await collectIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
    })

    it('모든 rect가 440×180 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<EtcFilesDiagram />)
      expectFits(wideBox)
      expectAllNotesApart(wideNotes)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·가지·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<EtcFilesDiagram />)
      await expectScenario(scenario, wideLinks, wideNotes, 440, 180, container)
    })

    it('/etc와 /bin이 받는 파일이 다르다 — 계정 정보는 etc 아래, 명령의 프로그램은 bin 아래에 있다', async () => {
      render(<EtcFilesDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<EtcFilesDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 256')
      await selectScenario('계정 정보')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '계정 정보' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(diagram().querySelector('[data-note="shadow-note"]')).toHaveAttribute('x', String(wideNotes['shadow-note'].x))
    })
  })
})
