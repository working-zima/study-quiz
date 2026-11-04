import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ProcessTreeDiagram, processTreeScenarios } from './ProcessTreeDiagram'

const topicId = 'linux-process-boot'
const anchorConceptId = `${topicId}.process`
const labels = {
  pid1: 'PID 1',
  sshd: '812 sshd',
  bash: '2045 bash',
  run1: '2310 backup.sh',
  run2: '2311 backup.sh',
}
const noteLabels = {
  first: '첫 프로세스',
  ppid: 'PPID 2045',
  same: '같은 프로그램 파일',
}
type NoteId = keyof typeof noteLabels

const nodeIds = Object.keys(labels)
const linkIds = ['b-sshd', 'b-bash', 'b-run1', 'b-run2']
// 가지마다 부모와 자식. PID 1과 bash 사이의 가지만 점선이다 — 그 사이의 프로세스는 그리지 않았다.
const linkEnds: Record<string, [string, string]> = {
  'b-sshd': ['pid1', 'sshd'],
  'b-bash': ['pid1', 'bash'],
  'b-run1': ['bash', 'run1'],
  'b-run2': ['bash', 'run2'],
}
const dashedLinks = ['b-bash']

const tallLinks: Record<string, string> = {
  'b-sshd': 'M110 40 V56 H52 V72',
  'b-bash': 'M110 40 V56 H168 V72',
  'b-run1': 'M168 104 V120 H112 V136',
  'b-run2': 'M168 104 V120 H224 V136',
}
const wideLinks: Record<string, string> = {
  'b-sshd': 'M68 88 H88 V40 H108',
  'b-bash': 'M68 88 H88 V136 H108',
  'b-run1': 'M184 136 H208 V104 H232',
  'b-run2': 'M184 136 H208 V168 H232',
}
const tallArrows: Record<string, string> = {
  'to-sshd': 'M110 40 V56 H52 V72',
  'to-run1': 'M168 104 V120 H112 V136',
}
const wideArrows: Record<string, string> = {
  'to-sshd': 'M68 88 H88 V40 H108',
  'to-run1': 'M184 136 H208 V104 H232',
}
// 화살표마다 출발 노드(부모)와 도착 노드(자식).
const ends: Record<string, [string, string]> = {
  'to-sshd': ['pid1', 'sshd'],
  'to-run1': ['bash', 'run1'],
}

type Note = { x: number, y: number, anchor: 'start' | 'middle' | 'end' }
const tallNotes: Record<NoteId, Note> = {
  first: { x: 148, y: 28, anchor: 'start' },
  ppid: { x: 112, y: 184, anchor: 'middle' },
  same: { x: 168, y: 184, anchor: 'middle' },
}
const wideNotes: Record<NoteId, Note> = {
  first: { x: 38, y: 124, anchor: 'middle' },
  ppid: { x: 344, y: 108, anchor: 'start' },
  same: { x: 284, y: 200, anchor: 'middle' },
}

const question = '프로세스는 누가 만들까?'
const idleCaption = '프로세스마다 PID와 프로그램 이름을 적었다. 번호와 셸 bash, backup.sh는 예로 붙인 것이다. 버튼을 고르면 같은 프로그램의 두 프로세스, 부모와 자식, PID 1을 볼 수 있다.'
const legend = '가는 선은 부모 프로세스와 그것이 만든 자식 프로세스를 잇는다. 점선은 부모를 거슬러 올라가면 닿는다는 것만 보이고 그 사이는 그리지 않았다는 뜻이다. 화살표는 부모가 자식을 만든 방향이다.'
const figureName = 'PID 1 아래로 데몬 sshd와 셸 bash, bash가 실행한 backup.sh 프로세스 둘이 부모와 자식으로 이어진 나무에서, 같은 프로그램의 두 프로세스, 부모와 자식, PID 1이 어디인지 보이는 도식'
const svgName = '맨 위 PID 1 아래에 812 sshd가 이어지고, 점선으로 이어진 2045 bash 아래에 2310 backup.sh와 2311 backup.sh가 이어져 있다'
const expectedScenarios = [
  {
    id: 'program-process', label: '같은 프로그램',
    nodes: ['run1', 'run2'],
    paths: [] as string[],
    notes: ['same'] as NoteId[],
    caption: '2310과 2311은 같은 프로그램 파일 backup.sh를 두 번 실행해 생긴 프로세스다. 파일은 디스크에 하나뿐이지만 실행할 때마다 프로세스가 따로 생기고, 커널은 저마다 다른 PID를 붙인다.',
    sources: [anchorConceptId],
  },
  {
    id: 'parent', label: '부모와 자식',
    nodes: ['bash', 'run1', 'b-run1'],
    paths: ['to-run1'],
    notes: ['ppid'] as NoteId[],
    caption: '셸 bash가 backup.sh를 실행하려고 자식 프로세스 2310을 만들었다. 그래서 2310의 PPID는 부모인 bash의 PID 2045이고, 셸에서 실행한 명령의 부모는 그 셸이다.',
    sources: [anchorConceptId],
  },
  {
    id: 'pid1', label: 'PID 1',
    nodes: ['pid1', 'sshd', 'b-sshd'],
    paths: ['to-sshd'],
    notes: ['first'] as NoteId[],
    caption: 'PID 1은 부팅할 때 커널이 장치를 준비한 뒤 직접 만든 첫 프로세스로, init이라 부른다. 데몬 sshd는 보통 PID 1의 자식으로 실행되고, 셸 bash도 부모를 거슬러 올라가면 PID 1에 닿는다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 192]
const wideBox: [number, number, number, number] = [0, 0, 440, 208]

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
    for (const line of diagram().querySelectorAll('[data-link], [data-path]')) {
      for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), `${id} ↔ 선`).toBe(false)
    }
    for (const other of boxes.filter((item) => item.id !== id)) expect(overlaps(box, other), `${id} ↔ ${other.id}`).toBe(false)
  }
}

// 가지 넷은 늘 보이고 부모와 자식을 잇는다. PID 1과 bash 사이만 점선이다.
function expectLinks(links: Record<string, string>, scenarioNodes: string[] | null) {
  expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
  for (const link of diagram().querySelectorAll('[data-link]')) {
    const id = link.getAttribute('data-link')!
    expect(link).toHaveAttribute('d', links[id])
    expect(link).toHaveClass('stroke-muted')
    expect(link).toHaveAttribute('opacity', scenarioNodes && !scenarioNodes.includes(id) ? '0.25' : '1')
    if (dashedLinks.includes(id)) expect(link, id).toHaveAttribute('stroke-dasharray')
    else expect(link, id).not.toHaveAttribute('stroke-dasharray')
    expectLine(link, id, linkEnds[id])
  }
}

async function expectScenario(
  scenario: typeof expectedScenarios[number],
  links: Record<string, string>,
  arrows: Record<string, string>,
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

  const shownPaths = Array.from(diagram().querySelectorAll('[data-path]'))
  expect(shownPaths.map((path) => path.getAttribute('data-path'))).toEqual(scenario.paths)
  for (const path of shownPaths) {
    expect(path).toHaveAttribute('d', arrows[path.getAttribute('data-path')!])
    expect(path).toHaveAttribute('stroke-width', '2')
    expect(path).toHaveAttribute('marker-end', `url(#${diagram().querySelector('marker')!.id})`)
    expect(path).toHaveClass('stroke-title')
    expect(path.closest('[opacity]')).toBeNull()
  }
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

async function expectArrowEnds() {
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    for (const path of diagram().querySelectorAll('[data-path]')) {
      const id = path.getAttribute('data-path')!
      expectLine(path, id, ends[id])
    }
  }
}

// 노드 라벨 「PID 프로그램 이름」을 둘로 나눈다. PID 1 노드는 번호만 있다.
function splitLabel(id: string) {
  const [pid, name] = diagram().querySelector(`[data-node="${id}"] text`)!.textContent!.split(' ')
  return { pid, name }
}

// 요점: 「부모와 자식」의 곁말에 적힌 PPID가 선명한 부모 노드의 PID와 같고 자식 노드의 PID와 다르다.
// 「같은 프로그램」의 선명한 두 노드는 프로그램 이름이 같고 PID가 다르다. 「PID 1」의 선명한 노드에 라벨이 PID 1인 노드가 있다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const brightNodes = () => Array.from(diagram().querySelectorAll('[data-node][opacity="1"]'), (element) => element.getAttribute('data-node')!)

  await selectScenario('부모와 자식')
  const ppid = diagram().querySelector('[data-note="ppid"]')!.textContent!.split(' ')[1]
  expect(brightNodes().sort()).toEqual(['bash', 'run1'])
  expect(splitLabel('bash').pid).toBe(ppid)
  expect(splitLabel('run1').pid).not.toBe(ppid)
  expect(body).toContain(`PPID가 둘 다 셸 \`bash\`의 PID인 \`${ppid}\`다`)

  await selectScenario('같은 프로그램')
  const [first, second] = brightNodes().map(splitLabel)
  expect(brightNodes()).toHaveLength(2)
  expect(first.name).toBe(second.name)
  expect(first.pid).not.toBe(second.pid)
  expect(body).toContain(`디스크의 파일 \`${first.name}\`는 하나뿐이지만 실행한 횟수만큼 프로세스가 생기고`)

  await selectScenario('PID 1')
  expect(brightNodes().map((id) => diagram().querySelector(`[data-node="${id}"] text`)!.textContent)).toContain('PID 1')
  expect(body).toContain('그 뒤 커널이 첫 프로세스를 직접 만든다. 이 프로세스의 PID가 1이다')
}

async function expectUniqueMarkers() {
  render(<><ProcessTreeDiagram /><ProcessTreeDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '부모와 자식' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(1)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('ProcessTreeDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<ProcessTreeDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 가지가 모두 선명하고 화살표·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<ProcessTreeDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expectLinks(tallLinks, null)
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<ProcessTreeDiagram />)
    await expectScenario(scenario, tallLinks, tallArrows, tallNotes, 280, 192, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<ProcessTreeDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('세 시나리오의 선명한 노드·화살표·곁말이 서로 다르다', () => {
    const keys = expectedScenarios.map(({ nodes, paths, notes }) => JSON.stringify([[...nodes].sort(), paths, [...notes].sort()]))
    expect(new Set(keys).size).toBe(expectedScenarios.length)
  })

  it('노드가 280×192 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<ProcessTreeDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 192')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  it('화살표 양 끝은 부모와 자식 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<ProcessTreeDiagram />)
    await expectArrowEnds()
  })

  it('곁말의 PPID는 부모 노드의 PID이고, 같은 프로그램의 두 프로세스는 PID가 다르며, PID 1 노드가 있다', async () => {
    render(<ProcessTreeDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<ProcessTreeDiagram />)
    const text = visualsByTopicId[topicId].diagrams['process-tree']
    const ids = processTreeScenarios.map(({ id }) => id).sort()
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
      const scenario = processTreeScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: expected.sources })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) {
      expect(conceptIds).toContain(source)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 프로세스 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×208 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커와 가지를 유지한다', () => {
      render(<ProcessTreeDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 208')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
      expectLinks(wideLinks, null)
    })

    it('노드·가지 id 집합과 화살표·곁말 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<ProcessTreeDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 192')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallLinkIds = shownIds('[data-link]', 'data-link').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')
      const tallNoteIds = await collectIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 208')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinkIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(tallNoteIds).toEqual(Object.keys(noteLabels).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
      expect(await collectIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
    })

    it('모든 rect가 440×208 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<ProcessTreeDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<ProcessTreeDiagram />)
      await expectScenario(scenario, wideLinks, wideArrows, wideNotes, 440, 208, container)
    })

    it('화살표 양 끝은 부모와 자식 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<ProcessTreeDiagram />)
      await expectArrowEnds()
    })

    it('곁말의 PPID는 부모 노드의 PID이고, 같은 프로그램의 두 프로세스는 PID가 다르며, PID 1 노드가 있다', async () => {
      render(<ProcessTreeDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<ProcessTreeDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 192')
      await selectScenario('부모와 자식')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '부모와 자식' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['to-run1'])
      expect(paths[0]).toHaveAttribute('d', wideArrows['to-run1'])
      expect(diagram().querySelector('[data-note="ppid"]')).toHaveAttribute('x', String(wideNotes.ppid.x))
    })
  })
})
