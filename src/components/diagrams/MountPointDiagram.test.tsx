import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { MountPointDiagram, mountPointScenarios } from './MountPointDiagram'

const topicId = 'linux-filesystem'
const anchorConceptId = `${topicId}.filesystem-mount`
const labels = {
  root: '/',
  home: 'home',
  data: 'data',
  fdisk: 'fdisk',
  sdb1: '/dev/sdb1',
  mount: 'mount',
  mkfs: 'mkfs.ext4',
}
const groupLabels = { tree: '디렉터리 나무' }
const noteLabels = {
  'no-fs-note': '아직 파일 시스템이 없다',
  'unmounted-note': '아직 나무에 붙어 있지 않다',
  'mountpoint-note': '마운트 지점 /data',
}
type NoteId = keyof typeof noteLabels

const nodeIds = Object.keys(labels)
// 디렉터리 나무 테두리 안에 있는 노드.
const treeNodes = ['root', 'home', 'data']

// 늘 보이는 나무의 가지와, 시나리오마다 보이는 화살표.
const linkIds = ['b-home', 'b-data']
const tallLinks: Record<string, string> = {
  'b-home': 'M140 62 V71 H80 V80',
  'b-data': 'M140 62 V71 H200 V80',
}
const wideLinks: Record<string, string> = {
  'b-home': 'M108 62 V71 H60 V80',
  'b-data': 'M108 62 V71 H156 V80',
}
const tallArrows: Record<string, string> = {
  'to-part': 'M80 184 H160',
  'to-make': 'M200 224 V200',
  'to-mount': 'M80 240 H120 V192 H160',
  'to-data': 'M200 168 V112',
}
const wideArrows: Record<string, string> = {
  'to-part': 'M304 56 V80',
  'to-make': 'M304 136 V112',
  'to-mount': 'M360 96 H344',
  'to-data': 'M264 96 H192',
}
// 선마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'b-home': ['root', 'home'],
  'b-data': ['root', 'data'],
  'to-part': ['fdisk', 'sdb1'],
  'to-make': ['mkfs', 'sdb1'],
  'to-mount': ['mount', 'sdb1'],
  'to-data': ['sdb1', 'data'],
}

type Group = { x: number, y: number, width: number, height: number, labelX: number, labelY: number }
const tallGroup: Group = { x: 8, y: 8, width: 264, height: 112, labelX: 16, labelY: 22 }
const wideGroup: Group = { x: 8, y: 8, width: 200, height: 128, labelX: 16, labelY: 22 }

type Note = { x: number, y: number, anchor: 'start' | 'middle' | 'end' }
const tallNotes: Record<NoteId, Note> = {
  'no-fs-note': { x: 200, y: 272, anchor: 'middle' },
  'unmounted-note': { x: 200, y: 272, anchor: 'middle' },
  'mountpoint-note': { x: 194, y: 148, anchor: 'end' },
}
const wideNotes: Record<NoteId, Note> = {
  'no-fs-note': { x: 304, y: 188, anchor: 'middle' },
  'unmounted-note': { x: 304, y: 188, anchor: 'middle' },
  'mountpoint-note': { x: 156, y: 128, anchor: 'middle' },
}

const question = '새 디스크를 쓰려면 무엇을 차례로 할까?'
const idleCaption = '예로 든 새 디스크의 파티션 /dev/sdb1과 디렉터리 나무를 함께 놓았다. 버튼을 차례로 고르면 새 디스크를 쓰기까지의 세 단계를 볼 수 있다.'
const legend = '테두리 안이 디렉터리 나무이고 가는 선은 디렉터리의 가지다. 명령에서 나가는 화살표는 그 명령이 다루는 파티션을, /dev/sdb1에서 나가는 화살표는 그 파일 시스템이 붙는 마운트 지점을 가리킨다.'
const figureName = '새 디스크를 쓰는 세 단계, fdisk로 나눠 파티션 만들기, mkfs.ext4로 파일 시스템 만들기, mount로 /data에 붙이기를 차례로 보이는 도식'
const svgName = '디렉터리 나무 테두리 안에 /와 그 아래 home, data가 있고, 나무 밖에 /dev/sdb1과 명령 fdisk, mkfs.ext4, mount가 있다'
const expectedScenarios = [
  {
    id: 'partition', label: '1. 나누기',
    nodes: ['fdisk', 'sdb1'],
    paths: ['to-part'],
    notes: ['no-fs-note'] as NoteId[],
    caption: '첫 단계로 fdisk를 써서 새 디스크를 나눠 파티션 /dev/sdb1을 만든다. 이때는 디스크에서 한 구역이 정해질 뿐, 그 안에 파일을 적어 둘 파일 시스템은 아직 없다.',
    sources: [anchorConceptId],
  },
  {
    id: 'make', label: '2. 파일 시스템',
    nodes: ['mkfs', 'sdb1'],
    paths: ['to-make'],
    notes: ['unmounted-note'] as NoteId[],
    caption: '둘째 단계로 mkfs.ext4 /dev/sdb1을 입력해 그 파티션에 ext4 파일 시스템을 만든다. 파일 시스템이 생겨도 아직 디렉터리 나무 어디에도 붙어 있지 않아, 나무의 경로로는 그 안의 파일에 닿을 수 없다.',
    sources: [anchorConceptId],
  },
  {
    id: 'mount', label: '3. 마운트',
    nodes: ['mount', 'sdb1', 'root', 'data', 'b-data'],
    paths: ['to-mount', 'to-data'],
    notes: ['mountpoint-note'] as NoteId[],
    caption: '셋째 단계로 mount /dev/sdb1 /data를 입력해 그 파일 시스템을 마운트 지점 /data에 붙인다. 그 뒤로 /data 아래에 보이는 것이 곧 새 디스크의 내용이다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 280]
const wideBox: [number, number, number, number] = [0, 0, 440, 196]

function diagram() {
  return screen.getByRole('img', { name: svgName })
}

async function selectScenario(label: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) })
}

function readBox(rect: Element): SvgBox {
  return {
    id: rect.parentElement?.getAttribute('data-node') ?? rect.getAttribute('data-group') ?? '',
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

function nodeBox(id: string) {
  return readBox(diagram().querySelector(`[data-node="${id}"] rect`)!)
}

function groupBox() {
  return readBox(diagram().querySelector('[data-group="tree"]')!)
}

function shownIds(selector: string, attribute: string) {
  return Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)!)
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function contains(outer: SvgBox, inner: SvgBox) {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height
}

// 글자 크기 9인 글이 차지하는 상자. 반각 글자가 화면에서 더 넓게 그려지는 것을 생각해 폭을 1.15배로 잡는다.
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

// 선의 양 끝이 지정한 두 노드의 변에 닿고, 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다.
function expectLine(line: Element, id: string, pair: [string, string]) {
  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  const label = textBox(diagram().querySelector('[data-group-label="tree"]')!, 'label')
  for (const segment of segments(line.getAttribute('d')!)) {
    for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
    expect(touches(segment, label), `${id} ↔ 디렉터리 나무 라벨`).toBe(false)
  }
  const { start, end } = lineEnds(line)
  expect(nodeAt(start), `${id} 시작`).toBe(pair[0])
  expect(nodeAt(end), `${id} 끝`).toBe(pair[1])
}

// 가지는 늘 보이고, 시나리오 밖의 가지는 흐리다.
function expectLinks(links: Record<string, string>, scenarioNodes: string[] | null) {
  expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
  for (const link of diagram().querySelectorAll('[data-link]')) {
    const id = link.getAttribute('data-link')!
    expect(link).toHaveAttribute('d', links[id])
    expect(link).toHaveClass('stroke-muted')
    expect(link).not.toHaveAttribute('marker-end')
    expect(link).toHaveAttribute('opacity', scenarioNodes && !scenarioNodes.includes(id) ? '0.25' : '1')
    expectLine(link, id, ends[id])
  }
}

// 보이는 곁말이 지정한 id·글·자리이고, viewBox 안에서 노드·그룹 라벨·선·다른 곁말과 겹치지 않는다.
function expectNotes(ids: NoteId[], places: Record<NoteId, Note>, viewBox: [number, number, number, number]) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note')).sort()).toEqual([...ids].sort())
  const boxes = shown.map((note) => textBox(note, note.getAttribute('data-note')!))
  const label = textBox(diagram().querySelector('[data-group-label="tree"]')!, 'label')
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
    expect(boxesOutsideViewBox([box], viewBox), id).toEqual([])
    expect(overlaps(box, label), `${id} ↔ 그룹 라벨`).toBe(false)
    for (const node of nodeIds.map(nodeBox)) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const line of diagram().querySelectorAll('[data-path], [data-link]')) {
      for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), `${id} ↔ 선`).toBe(false)
    }
    for (const other of boxes.filter((item) => item.id !== id)) expect(overlaps(box, other), `${id} ↔ ${other.id}`).toBe(false)
  }
}

async function expectScenario(
  scenario: typeof expectedScenarios[number],
  arrows: Record<string, string>,
  links: Record<string, string>,
  places: Record<NoteId, Note>,
  viewBox: [number, number, number, number],
  container: HTMLElement,
) {
  await selectScenario(scenario.label)

  for (const element of diagram().querySelectorAll('[data-node]')) {
    const id = element.getAttribute('data-node')!
    expect(element, id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  expect(diagram().querySelector('[data-group="tree"]')!.closest('[opacity]')).toBeNull()
  expect(diagram().querySelector('[data-group-label="tree"]')!.closest('[opacity]')).toBeNull()
  expectLinks(links, scenario.nodes)

  const shownPaths = Array.from(diagram().querySelectorAll('[data-path]'))
  expect(shownPaths.map((path) => path.getAttribute('data-path'))).toEqual(scenario.paths)
  for (const path of shownPaths) {
    const id = path.getAttribute('data-path')!
    expect(path).toHaveAttribute('d', arrows[id])
    expect(path).toHaveAttribute('stroke-width', '2')
    expect(path).toHaveAttribute('marker-end', `url(#${diagram().querySelector('marker')!.id})`)
    expect(path).toHaveClass('stroke-title')
    expect(path.closest('[opacity]')).toBeNull()
    expectLine(path, id, ends[id])
  }
  expectNotes(scenario.notes, places, viewBox)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다.
// 디렉터리 나무 테두리는 나무의 노드만 담고, 그룹 라벨은 테두리 안에서 노드와 겹치지 않는다. 노드는 모두 회색이다.
function expectFits(viewBox: [number, number, number, number], group: Group) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length + 1)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])

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

  const rect = diagram().querySelector('[data-group="tree"]')!
  expect(rect).toHaveAttribute('x', String(group.x))
  expect(rect).toHaveAttribute('y', String(group.y))
  expect(rect).toHaveAttribute('width', String(group.width))
  expect(rect).toHaveAttribute('height', String(group.height))
  for (const id of nodeIds) expect(contains(groupBox(), nodeBox(id)), id).toBe(treeNodes.includes(id))
  for (const id of nodeIds.filter((item) => !treeNodes.includes(item))) expect(overlaps(groupBox(), nodeBox(id)), id).toBe(false)

  const labelText = diagram().querySelector('[data-group-label="tree"]')!
  expect(labelText.textContent).toBe(groupLabels.tree)
  expect(labelText).toHaveAttribute('x', String(group.labelX))
  expect(labelText).toHaveAttribute('y', String(group.labelY))
  expect(labelText).toHaveAttribute('font-size', '9')
  const label = textBox(labelText, 'label')
  expect(contains(groupBox(), label)).toBe(true)
  for (const id of nodeIds) expect(overlaps(label, nodeBox(id)), id).toBe(false)
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

// 요점: /dev/sdb1에서 data로 가는 화살표는 「3. 마운트」에서만 보인다. 「2. 파일 시스템」에서는 나무의 노드(/·home·data)가 모두 흐리다.
// 세 시나리오의 라벨과 캡션이 차례로 첫·둘째·셋째 단계를 말한다.
async function expectPoint(container: HTMLElement) {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const order = ['첫 단계', '둘째 단계', '셋째 단계']

  for (const [index, { label }] of expectedScenarios.entries()) {
    await selectScenario(label)
    expect(label.startsWith(`${index + 1}.`), label).toBe(true)
    expect(container.querySelector('figcaption')!.textContent!.startsWith(order[index]), label).toBe(true)
    const toData = Array.from(diagram().querySelectorAll('[data-path]')).filter((path) => {
      const { start, end } = lineEnds(path)
      return nodeAt(start) === 'sdb1' && nodeAt(end) === 'data'
    })
    expect(toData, label).toHaveLength(label === '3. 마운트' ? 1 : 0)
  }

  await selectScenario('2. 파일 시스템')
  for (const id of treeNodes) expect(diagram().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', '0.25')

  expect(body).toContain('`mkfs.ext4 /dev/sdb1`을 입력한다')
  expect(body).toContain('`mount /dev/sdb1 /data`를 입력하면 `/dev/sdb1`의 파일 시스템이 마운트 지점 `/data`에 붙고')
  expect(body).toContain('새로 만든 파일 시스템은 아직 이 나무 어디에도 붙어 있지 않기 때문이다')
  expect(body).toContain('먼저 `fdisk`로 디스크를 나눠 파티션 `/dev/sdb1`을 만든다. 다음으로 `mkfs.ext4 /dev/sdb1`로 그 파티션에 파일 시스템을 만든다. 마지막으로 `mount /dev/sdb1 /data`로')
}

async function expectUniqueMarkers() {
  render(<><MountPointDiagram /><MountPointDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '3. 마운트' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(2)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('MountPointDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<MountPointDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 가지가 모두 선명하고 화살표·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<MountPointDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expectLinks(tallLinks, null)
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드와 화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<MountPointDiagram />)
    await expectScenario(scenario, tallArrows, tallLinks, tallNotes, tallBox, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<MountPointDiagram />)
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

  it('노드와 나무 테두리가 280×280 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<MountPointDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 280')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox, tallGroup)
  })

  it('가지와 화살표의 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
    render(<MountPointDiagram />)
    expectLinks(tallLinks, null)
    await expectArrowEnds()
  })

  it('나누기 → 파일 시스템 → 마운트 차례이고, 나무에 닿는 화살표는 마운트에서만 보인다', async () => {
    const { container } = render(<MountPointDiagram />)
    await expectPoint(container)
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<MountPointDiagram />)
    const text = visualsByTopicId[topicId].diagrams['mount-point']
    const ids = mountPointScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
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
      const scenario = mountPointScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 파일 시스템과 마운트 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×196 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<MountPointDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 196')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·그룹·가지 id 집합과 화살표·곁말 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<MountPointDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 280')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroups = shownIds('[data-group]', 'data-group').sort()
      const tallLinkIds = shownIds('[data-link]', 'data-link').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')
      const tallNoteIds = await collectIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 196')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroups)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinkIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallGroups).toEqual(['tree'])
      expect(tallLinkIds).toEqual([...linkIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(tallNoteIds).toEqual(Object.keys(noteLabels).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
      expect(await collectIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
    })

    it('노드와 나무 테두리가 440×196 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<MountPointDiagram />)
      expectFits(wideBox, wideGroup)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<MountPointDiagram />)
      await expectScenario(scenario, wideArrows, wideLinks, wideNotes, wideBox, container)
    })

    it('가지와 화살표의 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
      render(<MountPointDiagram />)
      expectLinks(wideLinks, null)
      await expectArrowEnds()
    })

    it('나누기 → 파일 시스템 → 마운트 차례이고, 나무에 닿는 화살표는 마운트에서만 보인다', async () => {
      const { container } = render(<MountPointDiagram />)
      await expectPoint(container)
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<MountPointDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 280')
      await selectScenario('3. 마운트')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '3. 마운트' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['to-mount', 'to-data'])
      expect(paths[1]).toHaveAttribute('d', wideArrows['to-data'])
      expect(shownIds('[data-note]', 'data-note')).toEqual(['mountpoint-note'])
    })
  })
})
