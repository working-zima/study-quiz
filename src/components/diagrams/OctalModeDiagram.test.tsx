import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { OctalModeDiagram, octalModeScenarios } from './OctalModeDiagram'

const topicId = 'linux-permissions'
const anchorConceptId = `${topicId}.octal-mode`
const labels = {
  'chunk-owner': 'rwx',
  'sum-owner': '4 + 2 + 1',
  'digit-owner': '7',
  'chunk-group': 'r-x',
  'sum-group': '4 + 0 + 1',
  'digit-group': '5',
  'chunk-others': 'r-x',
  'sum-others': '4 + 0 + 1',
  'digit-others': '5',
}
const groupLabels = { owner: '소유자', group: '그룹', others: '그 밖의 사용자' }
type GroupId = keyof typeof groupLabels

const nodeIds = Object.keys(labels)
const columns = Object.keys(groupLabels) as GroupId[]
const members: Record<GroupId, string[]> = {
  owner: ['chunk-owner', 'sum-owner', 'digit-owner'],
  group: ['chunk-group', 'sum-group', 'digit-group'],
  others: ['chunk-others', 'sum-others', 'digit-others'],
}
const linkIds = ['l-owner-1', 'l-owner-2', 'l-group-1', 'l-group-2', 'l-others-1', 'l-others-2']
// 연결선마다 위 노드와 아래 노드 — 권한 세 글자에서 더하는 식으로, 더하는 식에서 숫자 한 자리로.
const linkEnds: Record<string, [string, string]> = {
  'l-owner-1': ['chunk-owner', 'sum-owner'],
  'l-owner-2': ['sum-owner', 'digit-owner'],
  'l-group-1': ['chunk-group', 'sum-group'],
  'l-group-2': ['sum-group', 'digit-group'],
  'l-others-1': ['chunk-others', 'sum-others'],
  'l-others-2': ['sum-others', 'digit-others'],
}

const tallLinks: Record<string, string> = {
  'l-owner-1': 'M48 64 V80',
  'l-owner-2': 'M48 112 V128',
  'l-group-1': 'M140 64 V80',
  'l-group-2': 'M140 112 V128',
  'l-others-1': 'M232 64 V80',
  'l-others-2': 'M232 112 V128',
}
const wideLinks: Record<string, string> = {
  'l-owner-1': 'M76 64 V80',
  'l-owner-2': 'M76 112 V128',
  'l-group-1': 'M220 64 V80',
  'l-group-2': 'M220 112 V128',
  'l-others-1': 'M364 64 V80',
  'l-others-2': 'M364 112 V128',
}

type Group = { x: number, y: number, width: number, height: number, labelX: number, labelY: number }
const tallGroups: Record<GroupId, Group> = {
  owner: { x: 4, y: 8, width: 88, height: 164, labelX: 12, labelY: 22 },
  group: { x: 96, y: 8, width: 88, height: 164, labelX: 104, labelY: 22 },
  others: { x: 188, y: 8, width: 88, height: 164, labelX: 196, labelY: 22 },
}
const wideGroups: Record<GroupId, Group> = {
  owner: { x: 8, y: 8, width: 136, height: 164, labelX: 16, labelY: 22 },
  group: { x: 152, y: 8, width: 136, height: 164, labelX: 160, labelY: 22 },
  others: { x: 296, y: 8, width: 136, height: 164, labelX: 304, labelY: 22 },
}

const question = 'rwxr-xr-x는 왜 755일까?'
const idleCaption = '예로 붙인 파일 backup.sh의 권한 rwxr-xr-x를 소유자·그룹·그 밖의 사용자 몫으로 세 글자씩 나눠 놓았다. 버튼을 고르면 부류마다 켜진 권한의 값을 더해 숫자 한 자리를 만드는 과정을 볼 수 있다.'
const legend = '한 열이 한 부류의 몫이다. 위에서 아래로 권한 세 글자, 읽기 4·쓰기 2·실행 1 가운데 켜진 것만 더하는 식, 그 결과인 숫자 한 자리다.'
const figureName = '권한 rwxr-xr-x를 소유자 rwx, 그룹 r-x, 그 밖의 사용자 r-x로 나누고, 읽기 4·쓰기 2·실행 1을 켜진 자리만 더해 각각 7, 5, 5가 되어 755가 되는 것을 보이는 도식'
const svgName = '소유자·그룹·그 밖의 사용자 세 열에 위에서부터 권한 세 글자, 더하는 식, 숫자 한 자리가 있다. 소유자 열은 rwx, 4 + 2 + 1, 7이고 그룹 열과 그 밖의 사용자 열은 r-x, 4 + 0 + 1, 5다'
const expectedScenarios = [
  {
    id: 'owner', label: '소유자',
    nodes: ['chunk-owner', 'sum-owner', 'digit-owner', 'l-owner-1', 'l-owner-2'],
    caption: '소유자 몫 rwx는 읽기·쓰기·실행이 모두 켜져 있어, 읽기 4와 쓰기 2와 실행 1을 모두 더한 7이 된다.',
    sources: [anchorConceptId],
  },
  {
    id: 'group', label: '그룹',
    nodes: ['chunk-group', 'sum-group', 'digit-group', 'l-group-1', 'l-group-2'],
    caption: '그룹 몫 r-x는 쓰기 자리가 -라서 쓰기의 값 2 대신 0을 더해, 4 + 0 + 1 = 5가 된다.',
    sources: [anchorConceptId],
  },
  {
    id: 'others', label: '그 밖',
    nodes: ['chunk-others', 'sum-others', 'digit-others', 'l-others-1', 'l-others-2'],
    caption: '그 밖의 사용자 몫도 r-x라서 5다. 세 숫자를 소유자, 그룹, 그 밖의 차례로 이어 적으면 755가 된다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 180]
const wideBox: [number, number, number, number] = [0, 0, 440, 180]

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
  return textBox(diagram().querySelector(`[data-group-label="${id}"]`)!, `${id}-label`)
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
    for (const group of columns) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
  }
  const { start, end } = lineEnds(line)
  expect(nodeAt(start), `${id} 시작`).toBe(pair[0])
  expect(nodeAt(end), `${id} 끝`).toBe(pair[1])
}

// 연결선 여섯은 늘 보이고 한 열 안에서 위 노드와 아래 노드를 잇는다.
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

async function expectScenario(scenario: typeof expectedScenarios[number], links: Record<string, string>, container: HTMLElement) {
  await selectScenario(scenario.label)

  for (const element of diagram().querySelectorAll('[data-node]')) {
    const id = element.getAttribute('data-node')!
    expect(element, id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  for (const group of columns) {
    expect(diagram().querySelector(`[data-group="${group}"]`)!.closest('[opacity]'), group).toBeNull()
    expect(diagram().querySelector(`[data-group-label="${group}"]`)!.closest('[opacity]'), group).toBeNull()
  }
  expectLinks(links, scenario.nodes)
  expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다.
// 그룹 테두리는 자기 열의 노드 셋만 담고, 그룹 라벨은 자기 테두리 안에서 노드와 겹치지 않는다. 노드는 모두 회색이다.
function expectFits(viewBox: [number, number, number, number], groups: Record<GroupId, Group>) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length + columns.length)
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

  for (const [id, group] of Object.entries(groups) as [GroupId, Group][]) {
    const rect = diagram().querySelector(`[data-group="${id}"]`)!
    expect(rect).toHaveAttribute('x', String(group.x))
    expect(rect).toHaveAttribute('y', String(group.y))
    expect(rect).toHaveAttribute('width', String(group.width))
    expect(rect).toHaveAttribute('height', String(group.height))
    for (const node of nodeIds) expect(contains(groupBox(id), nodeBox(node)), `${id} ⊃ ${node}`).toBe(members[id].includes(node))

    const labelText = diagram().querySelector(`[data-group-label="${id}"]`)!
    expect(labelText.textContent).toBe(groupLabels[id])
    expect(labelText).toHaveAttribute('x', String(group.labelX))
    expect(labelText).toHaveAttribute('y', String(group.labelY))
    expect(labelText).toHaveAttribute('font-size', '9')
    const label = groupLabelBox(id)
    expect(contains(groupBox(id), label), `${id} 라벨`).toBe(true)
    for (const node of nodeIds) expect(overlaps(label, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
  }
  for (let i = 0; i < columns.length; i += 1) {
    for (let j = i + 1; j < columns.length; j += 1) expect(overlaps(groupBox(columns[i]), groupBox(columns[j]))).toBe(false)
  }
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 요점: 열마다 권한 세 글자에서 켜진 자리의 값(읽기 4, 쓰기 2, 실행 1)을 차례로 적으면 더하는 식이 되고,
// 그 식을 실제로 더한 값이 그 열의 숫자 한 자리다. 숫자 셋을 소유자·그룹·그 밖의 차례로 이으면 755다.
// 시나리오마다 선명한 노드는 한 열의 셋뿐이다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const labelOf = (id: string) => diagram().querySelector(`[data-node="${id}"] text`)!.textContent!
  const values = [4, 2, 1]

  for (const column of columns) {
    const chunk = labelOf(`chunk-${column}`)
    expect(chunk, column).toMatch(/^[r-][w-][x-]$/u)
    const terms = [...chunk].map((letter, index) => (letter === '-' ? 0 : values[index]))
    expect(labelOf(`sum-${column}`), column).toBe(terms.join(' + '))
    const sum = labelOf(`sum-${column}`).split(' + ').map(Number).reduce((total, value) => total + value, 0)
    expect(String(sum), column).toBe(labelOf(`digit-${column}`))
  }
  expect(columns.map((column) => labelOf(`digit-${column}`)).join('')).toBe('755')
  expect(columns.map((column) => labelOf(`chunk-${column}`)).join('')).toBe('rwxr-xr-x')

  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    const bright = Array.from(diagram().querySelectorAll('[data-node][opacity="1"]'), (element) => element.getAttribute('data-node')!)
    expect(bright.sort(), scenario.id).toEqual([...members[scenario.id as GroupId]].sort())
  }

  expect(body).toContain('`backup.sh`')
  expect(body).toContain('`-rwxr-xr-x`')
  expect(body).toContain('4 + 2 + 1 = 7')
  expect(body).toContain('4 + 0 + 1 = 5')
  expect(body).toContain('`755`')
}

describe('OctalModeDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<OctalModeDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 연결선이 모두 선명하고 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<OctalModeDiagram />)

    expect(shownIds('[data-node]', 'data-node').sort()).toEqual([...nodeIds].sort())
    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expectLinks(tallLinks, null)
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 열의 노드와 연결선만 선명하다', async (scenario) => {
    const { container } = render(<OctalModeDiagram />)
    await expectScenario(scenario, tallLinks, container)
  })

  it('시나리오를 바꾸면 이전 열이 흐려지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<OctalModeDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      const bright = Array.from(diagram().querySelectorAll('[data-node][opacity="1"], [data-link][opacity="1"]'), (element) => (
        element.getAttribute('data-node') ?? element.getAttribute('data-link')!
      ))
      expect(bright.sort()).toEqual([...scenario.nodes].sort())
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('세 시나리오의 선명한 노드가 서로 다르다', () => {
    const keys = expectedScenarios.map(({ nodes }) => JSON.stringify([...nodes].sort()))
    expect(new Set(keys).size).toBe(expectedScenarios.length)
  })

  it('노드와 테두리가 280×180 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<OctalModeDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 180')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox, tallGroups)
  })

  it('열마다 켜진 권한의 값을 더한 식과 그 합이 맞고, 숫자 셋을 이으면 755다', async () => {
    render(<OctalModeDiagram />)
    await expectPoint()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<OctalModeDiagram />)
    const text = visualsByTopicId[topicId].diagrams['octal-mode']
    const ids = octalModeScenarios.map(({ id }) => id).sort()
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
      const scenario = octalModeScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 8진수 권한 표기 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×180 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<OctalModeDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 180')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·그룹·연결선 id 집합이 세로형과 같다', () => {
      const { change } = mockMatchMedia(false)
      render(<OctalModeDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 180')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroupIds = shownIds('[data-group]', 'data-group').sort()
      const tallLinkIds = shownIds('[data-link]', 'data-link').sort()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 180')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroupIds)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinkIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallGroupIds).toEqual([...columns].sort())
      expect(tallLinkIds).toEqual([...linkIds].sort())
    })

    it('노드와 테두리가 440×180 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<OctalModeDiagram />)
      expectFits(wideBox, wideGroups)
      expectLinks(wideLinks, null)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·연결선·캡션을 보인다', async (scenario) => {
      const { container } = render(<OctalModeDiagram />)
      await expectScenario(scenario, wideLinks, container)
    })

    it('열마다 켜진 권한의 값을 더한 식과 그 합이 맞고, 숫자 셋을 이으면 755다', async () => {
      render(<OctalModeDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<OctalModeDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 180')
      await selectScenario('그룹')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '그룹' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(diagram().querySelector('[data-node="digit-group"]')).toHaveAttribute('opacity', '1')
      expect(diagram().querySelector('[data-node="digit-owner"]')).toHaveAttribute('opacity', '0.25')
      expect(diagram().querySelector('[data-link="l-group-2"]')).toHaveAttribute('d', wideLinks['l-group-2'])
    })
  })
})
