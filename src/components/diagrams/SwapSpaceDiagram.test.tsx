import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { SwapSpaceDiagram, swapSpaceScenarios } from './SwapSpaceDiagram'

const topicId = 'linux-filesystem'
const anchorConceptId = `${topicId}.swap`
const labels = {
  recent: '최근에 쓴 내용',
  idle: '최근에 덜 쓴 내용',
  file: '스왑 파일',
  part: '스왑 파티션',
  mkswap: 'mkswap',
  swapon: 'swapon',
}
const groupLabels = { memory: '메모리(RAM)', disk: '디스크' }

const nodeIds = Object.keys(labels)
const memoryNodes = ['recent', 'idle']
const diskNodes = ['file', 'part']
const groupIds = ['memory', 'disk'] as const
type GroupId = typeof groupIds[number]

const tallArrows: Record<string, string> = {
  'to-swap': 'M204 62 V126',
  'to-memory': 'M204 126 V62',
  'make-file': 'M44 200 V158',
  'on-file': 'M108 200 V158',
}
const wideArrows: Record<string, string> = {
  'to-swap': 'M144 94 H200',
  'to-memory': 'M200 94 H144',
  'make-file': 'M368 46 H328',
  'on-file': 'M368 94 H348 V54 H328',
}
// 선마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'to-swap': ['idle', 'part'],
  'to-memory': ['part', 'idle'],
  'make-file': ['mkswap', 'file'],
  'on-file': ['swapon', 'file'],
}

type Group = { x: number, y: number, width: number, height: number, labelX: number, labelY: number }
const tallGroups: Record<GroupId, Group> = {
  memory: { x: 8, y: 8, width: 264, height: 62, labelX: 16, labelY: 22 },
  disk: { x: 8, y: 104, width: 264, height: 62, labelX: 16, labelY: 118 },
}
const wideGroups: Record<GroupId, Group> = {
  memory: { x: 8, y: 8, width: 144, height: 110, labelX: 16, labelY: 22 },
  disk: { x: 192, y: 8, width: 144, height: 110, labelX: 200, labelY: 22 },
}

const question = '메모리가 모자라면 무엇이 일어날까?'
const idleCaption = '메모리(RAM)와 디스크를 나란히 놓고, 디스크 안에 스왑 공간 둘을 두었다. 버튼을 고르면 메모리가 모자랄 때와 다시 쓸 때, 스왑 공간을 나중에 더할 때를 볼 수 있다.'
const legend = '테두리 안이 메모리와 디스크이고, 화살표는 메모리의 내용이 옮겨 가는 방향이나 명령이 다루는 스왑 파일을 가리킨다.'
const figureName = '메모리가 모자랄 때 커널이 최근에 덜 쓴 내용을 디스크의 스왑 공간으로 옮기고, 다시 쓸 때 메모리로 들여오며, 설치한 뒤에도 mkswap과 swapon으로 스왑 파일을 더할 수 있음을 보이는 도식'
const svgName = '메모리(RAM) 테두리 안에 최근에 쓴 내용과 최근에 덜 쓴 내용이, 디스크 테두리 안에 스왑 파티션과 스왑 파일이 있고, 디스크 밖에 명령 mkswap과 swapon이 있다'
const expectedScenarios = [
  {
    id: 'move', label: '메모리가 모자랄 때',
    nodes: ['idle', 'part'],
    paths: ['to-swap'],
    caption: '메모리가 모자라면 커널은 최근에 덜 쓴 내용을 디스크의 스왑 공간으로 옮겨 두고, 비운 메모리를 다른 데 쓴다. 최근에 쓴 내용은 되도록 메모리에 그대로 둔다.',
    sources: [anchorConceptId],
  },
  {
    id: 'back', label: '다시 쓸 때',
    nodes: ['part', 'idle'],
    paths: ['to-memory'],
    caption: '스왑 공간에 옮겨 둔 내용을 프로그램이 다시 쓰려 하면 커널이 그 내용을 메모리로 다시 들여온다. 스왑 공간은 메모리 그 자체가 아니어서, 이렇게 오가는 일이 잦으면 프로그램이 예상보다 늦게 실행될 수 있다.',
    sources: [anchorConceptId],
  },
  {
    id: 'add', label: '나중에 더하기',
    nodes: ['mkswap', 'swapon', 'file'],
    paths: ['make-file', 'on-file'],
    caption: '설치한 뒤에도 스왑 파일을 만들어 더할 수 있다. mkswap으로 그 파일에 스왑 공간을 만들고 swapon으로 켜면, 이미 있던 스왑 파티션에 더해 이 파일도 스왑 공간으로 쓰인다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 240]
const wideBox: [number, number, number, number] = [0, 0, 440, 126]

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

function groupBox(id: GroupId) {
  return readBox(diagram().querySelector(`[data-group="${id}"]`)!)
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

function groupLabelBox(id: GroupId) {
  return textBox(diagram().querySelector(`[data-group-label="${id}"]`)!, id)
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
  for (const segment of segments(line.getAttribute('d')!)) {
    for (const node of nodeBoxes) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
  }
  const { start, end } = lineEnds(line)
  expect(nodeAt(start), `${id} 시작`).toBe(pair[0])
  expect(nodeAt(end), `${id} 끝`).toBe(pair[1])
}

async function expectScenario(
  scenario: typeof expectedScenarios[number],
  arrows: Record<string, string>,
  container: HTMLElement,
) {
  await selectScenario(scenario.label)

  for (const element of diagram().querySelectorAll('[data-node]')) {
    const id = element.getAttribute('data-node')!
    expect(element, id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  for (const group of groupIds) {
    expect(diagram().querySelector(`[data-group="${group}"]`)!.closest('[opacity]')).toBeNull()
    expect(diagram().querySelector(`[data-group-label="${group}"]`)!.closest('[opacity]')).toBeNull()
  }

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
  expect(diagram().querySelectorAll('[data-note], [data-link]')).toHaveLength(0)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다.
// 메모리 테두리는 메모리의 두 노드만, 디스크 테두리는 스왑 공간 둘만 담고 명령은 어느 테두리에도 들지 않는다. 노드는 모두 회색이다.
function expectFits(viewBox: [number, number, number, number], groups: Record<GroupId, Group>) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
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

  expect(overlaps(groupBox('memory'), groupBox('disk'))).toBe(false)
  for (const group of groupIds) {
    const rect = diagram().querySelector(`[data-group="${group}"]`)!
    expect(rect).toHaveAttribute('x', String(groups[group].x))
    expect(rect).toHaveAttribute('y', String(groups[group].y))
    expect(rect).toHaveAttribute('width', String(groups[group].width))
    expect(rect).toHaveAttribute('height', String(groups[group].height))
    const members = group === 'memory' ? memoryNodes : diskNodes
    for (const id of nodeIds) expect(contains(groupBox(group), nodeBox(id)), `${group} ${id}`).toBe(members.includes(id))
    for (const id of nodeIds.filter((item) => !members.includes(item))) expect(overlaps(groupBox(group), nodeBox(id)), `${group} ${id}`).toBe(false)

    const labelText = diagram().querySelector(`[data-group-label="${group}"]`)!
    expect(labelText.textContent).toBe(groupLabels[group])
    expect(labelText).toHaveAttribute('x', String(groups[group].labelX))
    expect(labelText).toHaveAttribute('y', String(groups[group].labelY))
    expect(labelText).toHaveAttribute('font-size', '9')
    const label = groupLabelBox(group)
    expect(boxesOutsideViewBox([label], viewBox)).toEqual([])
    expect(contains(groupBox(group), label)).toBe(true)
    for (const id of nodeIds) expect(overlaps(label, nodeBox(id)), `${group} 라벨 ${id}`).toBe(false)
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

// 요점: 「나중에 더하기」에서 스왑 파일이 선명하고 mkswap·swapon에서 시작하는 화살표가 보인다.
// 「메모리가 모자랄 때」에서는 스왑 파일과 두 명령이 흐리고, 보이는 화살표는 메모리 테두리 안 노드에서 시작해 디스크 테두리 안 노드에서 끝난다.
// 「다시 쓸 때」의 화살표는 거꾸로 디스크에서 메모리로 간다. 어느 시나리오에서도 「최근에 쓴 내용」은 스왑 쪽으로 옮겨 가지 않는다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const groupOf = (id: string | undefined) => (id && memoryNodes.includes(id) ? 'memory' : id && diskNodes.includes(id) ? 'disk' : 'outside')

  await selectScenario('나중에 더하기')
  expect(diagram().querySelector('[data-node="file"]')).toHaveAttribute('opacity', '1')
  const starts = Array.from(diagram().querySelectorAll('[data-path]'), (path) => nodeAt(lineEnds(path).start)).sort()
  expect(starts).toEqual(['mkswap', 'swapon'])
  for (const path of diagram().querySelectorAll('[data-path]')) expect(nodeAt(lineEnds(path).end)).toBe('file')

  await selectScenario('메모리가 모자랄 때')
  for (const id of ['file', 'mkswap', 'swapon']) expect(diagram().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', '0.25')
  for (const path of diagram().querySelectorAll('[data-path]')) {
    const { start, end } = lineEnds(path)
    expect(groupOf(nodeAt(start))).toBe('memory')
    expect(groupOf(nodeAt(end))).toBe('disk')
    expect(nodeAt(start)).not.toBe('recent')
  }

  await selectScenario('다시 쓸 때')
  for (const path of diagram().querySelectorAll('[data-path]')) {
    const { start, end } = lineEnds(path)
    expect(groupOf(nodeAt(start))).toBe('disk')
    expect(groupOf(nodeAt(end))).toBe('memory')
  }

  expect(body).toContain('커널은 최근에 쓴 메모리를 되도록 그대로 두고, 최근에 덜 쓴 메모리를 먼저 거둬들여 다른 데 쓴다')
  expect(body).toContain('먼저 `mkswap`으로 그 파티션이나 파일에 스왑 공간을 만들고, 다음으로 `swapon`으로 켠다')
  expect(body).toContain('시스템을 쓰는 중에도 스왑 파일을 만들어 더할 수 있다')
  expect(body).toContain('커널이 그 내용을 메모리로 다시 들여온다')
}

async function expectUniqueMarkers() {
  render(<><SwapSpaceDiagram /><SwapSpaceDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '나중에 더하기' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(2)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('SwapSpaceDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<SwapSpaceDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표 없이 선택 안내가 나온다', () => {
    const { container } = render(<SwapSpaceDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note], [data-link]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드와 화살표만 보인다', async (scenario) => {
    const { container } = render(<SwapSpaceDiagram />)
    await expectScenario(scenario, tallArrows, container)
  })

  it('시나리오를 바꾸면 이전 화살표가 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<SwapSpaceDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('세 시나리오의 선명한 노드·화살표가 서로 다르다', () => {
    const keys = expectedScenarios.map(({ nodes, paths }) => JSON.stringify([[...nodes].sort(), paths]))
    expect(new Set(keys).size).toBe(expectedScenarios.length)
  })

  it('노드와 두 테두리가 280×240 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<SwapSpaceDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 240')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox, tallGroups)
  })

  it('화살표의 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
    render(<SwapSpaceDiagram />)
    await expectArrowEnds()
  })

  it('메모리가 모자라면 덜 쓴 내용이 디스크로 가고, 다시 쓸 때 돌아오며, 스왑 파일은 명령 둘로 더한다', async () => {
    render(<SwapSpaceDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<SwapSpaceDiagram />)
    const text = visualsByTopicId[topicId].diagrams['swap-space']
    const ids = swapSpaceScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toBeUndefined()
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
      const scenario = swapSpaceScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 스왑 공간 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×126 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<SwapSpaceDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 126')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<SwapSpaceDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 240')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroupIds = shownIds('[data-group]', 'data-group').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 126')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroupIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallGroupIds).toEqual([...groupIds].sort())
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
    })

    it('노드와 두 테두리가 440×126 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<SwapSpaceDiagram />)
      expectFits(wideBox, wideGroups)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·캡션을 보인다', async (scenario) => {
      const { container } = render(<SwapSpaceDiagram />)
      await expectScenario(scenario, wideArrows, container)
    })

    it('화살표의 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안과 그룹 라벨을 지나지 않는다', async () => {
      render(<SwapSpaceDiagram />)
      await expectArrowEnds()
    })

    it('메모리가 모자라면 덜 쓴 내용이 디스크로 가고, 다시 쓸 때 돌아오며, 스왑 파일은 명령 둘로 더한다', async () => {
      render(<SwapSpaceDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<SwapSpaceDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 240')
      await selectScenario('나중에 더하기')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '나중에 더하기' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      const paths = Array.from(diagram().querySelectorAll('[data-path]'))
      expect(paths.map((path) => path.getAttribute('data-path'))).toEqual(['make-file', 'on-file'])
      expect(paths[1]).toHaveAttribute('d', wideArrows['on-file'])
    })
  })
})
