import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { MbrGptDiagram, mbrGptScenarios } from './MbrGptDiagram'

const topicId = 'linux-filesystem'
const anchorConceptId = `${topicId}.mbr-gpt`
const labels = {
  mtable: '파티션 테이블',
  p1: '1',
  p2: '2',
  p3: '3',
  ext: '확장 파티션 4',
  l5: '5',
  l6: '6',
  pmbr: '보호용 MBR',
  gtable: '파티션 테이블',
  g1: '1',
  g2: '2',
  g3: '3',
}
const groupLabels = { mbr: 'MBR 디스크', gpt: 'GPT 디스크' }
const noteLabels = {
  'mbr-limit': '32비트 섹터 수 — 약 2TB까지',
  'logical-note': '번호는 5부터',
  'gpt-limit': '64비트 — 2TB 한계 없음',
}
type NoteId = keyof typeof noteLabels
type GroupId = keyof typeof groupLabels

const nodeIds = Object.keys(labels)
// 그룹 박스마다 담는 노드.
const members: Record<GroupId, string[]> = {
  mbr: ['mtable', 'p1', 'p2', 'p3', 'ext', 'l5', 'l6'],
  gpt: ['pmbr', 'gtable', 'g1', 'g2', 'g3'],
}

type Group = { x: number, y: number, width: number, height: number, labelX: number, labelY: number }
const tallGroups: Record<GroupId, Group> = {
  mbr: { x: 8, y: 8, width: 264, height: 134, labelX: 16, labelY: 22 },
  gpt: { x: 8, y: 150, width: 264, height: 102, labelX: 16, labelY: 164 },
}
const wideGroups: Record<GroupId, Group> = {
  mbr: { x: 8, y: 8, width: 424, height: 94, labelX: 16, labelY: 22 },
  gpt: { x: 8, y: 110, width: 424, height: 62, labelX: 16, labelY: 124 },
}

type Note = { x: number, y: number, anchor: 'start' | 'middle' | 'end' }
const tallNotes: Record<NoteId, Note> = {
  'mbr-limit': { x: 116, y: 50, anchor: 'start' },
  'logical-note': { x: 204, y: 122, anchor: 'start' },
  'gpt-limit': { x: 108, y: 232, anchor: 'start' },
}
const wideNotes: Record<NoteId, Note> = {
  'mbr-limit': { x: 16, y: 82, anchor: 'start' },
  'logical-note': { x: 292, y: 82, anchor: 'start' },
  'gpt-limit': { x: 276, y: 152, anchor: 'start' },
}
// 곁말마다 그것이 놓이는 그룹 박스.
const noteGroups: Record<NoteId, GroupId> = { 'mbr-limit': 'mbr', 'logical-note': 'mbr', 'gpt-limit': 'gpt' }

const question = 'MBR과 GPT는 파티션을 어떻게 적을까?'
const idleCaption = 'MBR로 나눈 디스크와 GPT로 나눈 디스크를 나란히 놓았다. 두 디스크 모두 맨 앞 칸이 첫 섹터다. 버튼을 고르면 각 형식이 파티션 테이블을 어디에 두고 어떤 한계가 있는지, 논리 파티션의 번호가 어떻게 붙는지 볼 수 있다.'
const legend = '맨 앞 칸이 디스크의 첫 섹터이고, 숫자는 파티션 번호다. 확장 파티션 바로 아래의 칸은 그 안에 만든 논리 파티션이다. 파티션 칸의 차례와 너비는 실제 자리나 크기를 나타내지 않는다.'
const figureName = 'MBR 디스크와 GPT 디스크에서 파티션 테이블의 자리, 주 파티션·확장 파티션·논리 파티션의 번호, 다룰 수 있는 디스크 크기의 한계를 견줘 보이는 도식'
const svgName = 'MBR 디스크에는 파티션 테이블 뒤로 주 파티션 1·2·3과 확장 파티션 4, 그 안의 논리 파티션 5·6이 있고, GPT 디스크에는 보호용 MBR과 파티션 테이블 뒤로 파티션 1·2·3이 있다'
const expectedScenarios = [
  {
    id: 'mbr', label: 'MBR',
    nodes: ['mtable', 'p1', 'p2', 'p3', 'ext'],
    notes: ['mbr-limit'] as NoteId[],
    caption: 'MBR 디스크는 첫 섹터에 파티션 테이블을 둔다. 이 표에는 파티션을 적을 칸이 넷 있어 주 파티션이 번호 1~4를 받고, 여기서는 넷째 칸을 확장 파티션으로 두었다. 파티션의 시작 위치와 크기를 32비트 섹터 수로 적으므로 512바이트 섹터의 디스크에서는 약 2TB까지만 다룬다.',
    sources: [anchorConceptId],
  },
  {
    id: 'logical', label: '논리 파티션',
    nodes: ['ext', 'l5', 'l6'],
    notes: ['logical-note'] as NoteId[],
    caption: '확장 파티션은 그 안에 논리 파티션을 여러 개 담는 상자 노릇을 한다. 논리 파티션의 번호는 주 파티션을 몇 개 만들었든 5부터 붙어, 여기서는 5와 6이다.',
    sources: [anchorConceptId],
  },
  {
    id: 'gpt', label: 'GPT',
    nodes: ['pmbr', 'gtable', 'g1', 'g2', 'g3'],
    notes: ['gpt-limit'] as NoteId[],
    caption: 'GPT 디스크는 파티션의 위치를 64비트 수로 적어 MBR의 약 2TB 한계가 없고, 형식 자체에는 파티션 수의 제한도 없다. 첫 섹터는 MBR만 아는 오래된 도구가 디스크를 덮어쓰지 않게 보호용 MBR에 내주고, 파티션 테이블은 그 뒤에 둔다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 260]
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

// 곁말을 자리에 놓았을 때의 상자. 시나리오마다 일부만 보이지만 자리는 늘 같다.
function placedNoteBox(id: NoteId, places: Record<NoteId, Note>) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', 'text')
  element.textContent = noteLabels[id]
  element.setAttribute('x', String(places[id].x))
  element.setAttribute('y', String(places[id].y))
  element.setAttribute('text-anchor', places[id].anchor)
  return textBox(element, id)
}

// 보이는 곁말이 지정한 id·글·자리이고, 자기 그룹 박스 안에서 노드·그룹 라벨·다른 곁말과 겹치지 않는다.
function expectNotes(ids: NoteId[], places: Record<NoteId, Note>, viewBox: [number, number, number, number]) {
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
    expect(boxesOutsideViewBox([box], viewBox), id).toEqual([])
    expect(contains(groupBox(noteGroups[id]), box), id).toBe(true)
    for (const node of nodeIds.map(nodeBox)) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const other of boxes.filter((item) => item.id !== id)) expect(overlaps(box, other), `${id} ↔ ${other.id}`).toBe(false)
  }
}

async function expectScenario(
  scenario: typeof expectedScenarios[number],
  places: Record<NoteId, Note>,
  viewBox: [number, number, number, number],
  container: HTMLElement,
) {
  await selectScenario(scenario.label)

  for (const element of diagram().querySelectorAll('[data-node]')) {
    const id = element.getAttribute('data-node')!
    expect(element, id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  for (const id of Object.keys(groupLabels)) {
    expect(diagram().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(diagram().querySelector(`[data-group-label="${id}"]`)!.closest('[opacity]'), id).toBeNull()
  }
  expect(diagram().querySelectorAll('[data-path], [data-link]')).toHaveLength(0)
  expectNotes(scenario.notes, places, viewBox)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다.
// 그룹 박스는 자기 노드만 담고 서로 겹치지 않으며, 그룹 라벨은 박스 안에서 노드·곁말과 겹치지 않는다. 노드는 모두 회색이다.
function expectFits(viewBox: [number, number, number, number], groups: Record<GroupId, Group>, places: Record<NoteId, Note>) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length + 2)
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

  expect(overlaps(groupBox('mbr'), groupBox('gpt'))).toBe(false)
  const noteBoxes = (Object.keys(places) as NoteId[]).map((id) => placedNoteBox(id, places))
  for (const groupId of Object.keys(groupLabels) as GroupId[]) {
    const group = groups[groupId]
    const rect = diagram().querySelector(`[data-group="${groupId}"]`)!
    expect(rect).toHaveAttribute('x', String(group.x))
    expect(rect).toHaveAttribute('y', String(group.y))
    expect(rect).toHaveAttribute('width', String(group.width))
    expect(rect).toHaveAttribute('height', String(group.height))
    for (const id of nodeIds) expect(contains(groupBox(groupId), nodeBox(id)), `${groupId} ⊃ ${id}`).toBe(members[groupId].includes(id))

    const labelText = diagram().querySelector(`[data-group-label="${groupId}"]`)!
    expect(labelText.textContent).toBe(groupLabels[groupId])
    expect(labelText).toHaveAttribute('x', String(group.labelX))
    expect(labelText).toHaveAttribute('y', String(group.labelY))
    expect(labelText).toHaveAttribute('font-size', '9')
    const label = textBox(labelText, `${groupId}-label`)
    expect(contains(groupBox(groupId), label), groupId).toBe(true)
    for (const id of nodeIds) expect(overlaps(label, nodeBox(id)), `${groupId} 라벨 ↔ ${id}`).toBe(false)
    for (const note of noteBoxes) expect(overlaps(label, note), `${groupId} 라벨 ↔ ${note.id}`).toBe(false)
  }
  // 곁말 셋을 한꺼번에 놓아도 서로 겹치지 않는다.
  for (let i = 0; i < noteBoxes.length; i += 1) {
    for (let j = i + 1; j < noteBoxes.length; j += 1) expect(overlaps(noteBoxes[i], noteBoxes[j]), `${noteBoxes[i].id} ↔ ${noteBoxes[j].id}`).toBe(false)
    for (const node of nodeIds.map(nodeBox)) expect(overlaps(noteBoxes[i], node), `${noteBoxes[i].id} ↔ ${node.id}`).toBe(false)
  }
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 요점: 「논리 파티션」의 선명한 노드 가운데 수로 된 라벨은 5와 6이고 둘 다 5 이상이며, 두 칸은 확장 파티션 바로 아래에 그 너비 안으로 붙어 있다.
// 「GPT」의 선명한 노드는 모두 GPT 디스크 안에 있고 MBR 디스크의 노드는 모두 흐리다. 「MBR」의 보이는 곁말에 본문 계산의 결과(약 2TB)가 있다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')

  await selectScenario('논리 파티션')
  const numbers = Array.from(diagram().querySelectorAll('[data-node][opacity="1"] text'), (text) => text.textContent!)
    .filter((label) => /^\d+$/u.test(label))
    .map(Number)
  expect(numbers).toEqual([5, 6])
  for (const number of numbers) expect(number).toBeGreaterThanOrEqual(5)
  const ext = nodeBox('ext')
  for (const id of ['l5', 'l6']) {
    expect(nodeBox(id).y, id).toBe(ext.y + ext.height)
    expect(nodeBox(id).x, id).toBeGreaterThanOrEqual(ext.x)
    expect(nodeBox(id).x + nodeBox(id).width, id).toBeLessThanOrEqual(ext.x + ext.width)
  }

  await selectScenario('GPT')
  for (const element of diagram().querySelectorAll('[data-node]')) {
    const id = element.getAttribute('data-node')!
    if (element.getAttribute('opacity') === '1') expect(contains(groupBox('gpt'), nodeBox(id)), id).toBe(true)
  }
  for (const id of members.mbr) expect(diagram().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', '0.25')

  await selectScenario('MBR')
  expect(Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.textContent).join(' ')).toContain('약 2TB')

  expect(body).toContain('4,294,967,296 × 512 = 2³² × 2⁹ = 2⁴¹ = 2,199,023,255,552바이트')
  expect(body).toContain('MBR은 약 2TB까지만 다루고')
  expect(body).toContain('논리 파티션의 번호는 주 파티션을 몇 개 만들었든 5부터 붙는다')
  expect(body).toContain('GPT에는 이 2TB 한계가 없다')
  expect(4294967296 * 512).toBe(2199023255552)
  expect(2 ** 32).toBe(4294967296)
}

describe('MbrGptDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<MbrGptDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<MbrGptDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note], [data-link]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드와 곁말만 보인다', async (scenario) => {
    const { container } = render(<MbrGptDiagram />)
    await expectScenario(scenario, tallNotes, tallBox, container)
  })

  it('시나리오를 바꾸면 이전 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<MbrGptDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-note]', 'data-note')).toEqual(scenario.notes)
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('세 시나리오의 선명한 노드·곁말이 서로 다르다', () => {
    const keys = expectedScenarios.map(({ nodes, notes }) => JSON.stringify([[...nodes].sort(), [...notes].sort()]))
    expect(new Set(keys).size).toBe(expectedScenarios.length)
  })

  it('노드와 그룹 박스가 280×260 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<MbrGptDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 260')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox, tallGroups, tallNotes)
  })

  it('논리 파티션은 5부터, GPT는 MBR과 따로, MBR의 한계는 약 2TB다', async () => {
    render(<MbrGptDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 고른 시나리오가 서로 섞이지 않는다', async () => {
    render(<><MbrGptDiagram /><MbrGptDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    await act(async () => { await userEvent.click(within(figures[0]).getByRole('button', { name: 'GPT' })) })

    expect(within(figures[0]).getByRole('button', { name: 'GPT' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(figures[1]).getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(figures[1].querySelectorAll('[data-note]')).toHaveLength(0)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<MbrGptDiagram />)
    const text = visualsByTopicId[topicId].diagrams['mbr-gpt']
    const ids = mbrGptScenarios.map(({ id }) => id).sort()
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
      const scenario = mbrGptScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 MBR과 GPT 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×180 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<MbrGptDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 180')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·그룹 id 집합과 곁말 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<MbrGptDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 260')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroupIds = shownIds('[data-group]', 'data-group').sort()
      const tallNoteIds = await collectIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 180')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroupIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallGroupIds).toEqual(['gpt', 'mbr'])
      expect(tallNoteIds).toEqual(Object.keys(noteLabels).sort())
      expect(await collectIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
    })

    it('노드와 그룹 박스가 440×180 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<MbrGptDiagram />)
      expectFits(wideBox, wideGroups, wideNotes)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<MbrGptDiagram />)
      await expectScenario(scenario, wideNotes, wideBox, container)
    })

    it('논리 파티션은 5부터, GPT는 MBR과 따로, MBR의 한계는 약 2TB다', async () => {
      render(<MbrGptDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<MbrGptDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 260')
      await selectScenario('논리 파티션')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '논리 파티션' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownIds('[data-note]', 'data-note')).toEqual(['logical-note'])
      expect(diagram().querySelector('[data-note="logical-note"]')).toHaveAttribute('x', String(wideNotes['logical-note'].x))
    })
  })
})
