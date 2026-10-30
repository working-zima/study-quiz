import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { PermissionStringDiagram, permissionStringScenarios } from './PermissionStringDiagram'

const topicId = 'linux-permissions'
const anchorConceptId = `${topicId}.permission-string`
const labels = {
  type: '-',
  owner: 'rw-',
  group: 'r--',
  others: 'r--',
}
const groupLabels = { string: '권한 문자열' }
const slotLabels = {
  'type-slot': '종류',
  'owner-slot': '소유자',
  'group-slot': '그룹',
  'others-slot': '그 밖',
}
const scenarioNoteLabels = {
  'type-note': '일반 파일',
  'owner-note': '읽기와 쓰기',
  'group-note': '읽기만',
  'others-note': '읽기만',
}
type SlotId = keyof typeof slotLabels
type NoteId = keyof typeof scenarioNoteLabels

// 권한 문자열 테두리 안에 왼쪽부터 빈틈없이 이어 놓은 덩어리.
const nodeIds = Object.keys(labels)

type Group = { x: number, y: number, width: number, height: number, labelX: number, labelY: number }
const tallGroup: Group = { x: 8, y: 8, width: 264, height: 96, labelX: 16, labelY: 22 }
const wideGroup: Group = { x: 8, y: 8, width: 424, height: 96, labelX: 16, labelY: 22 }

type Place = { x: number, y: number, anchor: 'start' | 'middle' | 'end' }
const tallSlots: Record<SlotId, Place> = {
  'type-slot': { x: 44, y: 40, anchor: 'middle' },
  'owner-slot': { x: 96, y: 40, anchor: 'middle' },
  'group-slot': { x: 160, y: 40, anchor: 'middle' },
  'others-slot': { x: 224, y: 40, anchor: 'middle' },
}
const wideSlots: Record<SlotId, Place> = {
  'type-slot': { x: 76, y: 40, anchor: 'middle' },
  'owner-slot': { x: 156, y: 40, anchor: 'middle' },
  'group-slot': { x: 252, y: 40, anchor: 'middle' },
  'others-slot': { x: 348, y: 40, anchor: 'middle' },
}
const tallNotes: Record<NoteId, Place> = {
  'type-note': { x: 44, y: 96, anchor: 'middle' },
  'owner-note': { x: 96, y: 96, anchor: 'middle' },
  'group-note': { x: 160, y: 96, anchor: 'middle' },
  'others-note': { x: 224, y: 96, anchor: 'middle' },
}
const wideNotes: Record<NoteId, Place> = {
  'type-note': { x: 76, y: 96, anchor: 'middle' },
  'owner-note': { x: 156, y: 96, anchor: 'middle' },
  'group-note': { x: 252, y: 96, anchor: 'middle' },
  'others-note': { x: 348, y: 96, anchor: 'middle' },
}

const question = '-rw-r--r--는 어떻게 읽을까?'
const idleCaption = 'ls -l이 보여 준 report.txt의 권한 문자열 -rw-r--r--를 한 글자, 세 글자, 세 글자, 세 글자로 끊어 놓았다. 버튼을 고르면 덩어리마다 무엇을 뜻하는지 볼 수 있다.'
const legend = '네 칸을 왼쪽부터 이어 읽으면 권한 문자열 하나가 된다. 칸 위의 말은 그 칸이 무엇의 자리인지 알려 준다.'
const figureName = 'report.txt의 권한 문자열 -rw-r--r--를 -, rw-, r--, r-- 네 덩어리로 끊어, 덩어리마다 파일의 종류, 소유자의 권한, 그룹의 권한, 그 밖의 사용자의 권한을 뜻한다는 것을 보이는 도식'
const svgName = '권한 문자열 테두리 안에 -, rw-, r--, r--가 차례로 빈틈없이 이어져 -rw-r--r--를 이루고, 칸마다 위에 종류·소유자·그룹·그 밖이라는 자리 이름이 있다'
const expectedScenarios = [
  {
    id: 'type', label: '종류',
    nodes: ['type'],
    notes: ['type-note'] as NoteId[],
    caption: '첫 글자는 권한이 아니라 그 이름이 어떤 종류의 파일인지 알려 준다. report.txt의 첫 글자 -는 일반 파일이라는 뜻이고, 디렉터리라면 이 자리에 d가 온다.',
    sources: [anchorConceptId],
  },
  {
    id: 'owner', label: '소유자',
    nodes: ['owner'],
    notes: ['owner-note'] as NoteId[],
    caption: '첫 글자 다음의 세 글자 rw-는 소유자 user1의 권한이다. 읽기 자리에 r, 쓰기 자리에 w가 있고 실행 자리는 -라서, user1은 이 파일을 읽고 고칠 수 있지만 프로그램으로 실행할 수는 없다.',
    sources: [anchorConceptId],
  },
  {
    id: 'group', label: '그룹',
    nodes: ['group'],
    notes: ['group-note'] as NoteId[],
    caption: '그다음 세 글자 r--는 이 파일의 그룹 dev에 든 사용자의 권한이다. 읽기 자리에만 r이 있고 쓰기·실행 자리는 -라서, dev 그룹의 user2는 이 파일을 읽을 수만 있다.',
    sources: [anchorConceptId],
  },
  {
    id: 'others', label: '그 밖',
    nodes: ['others'],
    notes: ['others-note'] as NoteId[],
    caption: '마지막 세 글자 r--는 소유자도 아니고 dev 그룹에도 들지 않은 그 밖의 사용자의 권한이다. 그룹 몫과 같은 r--라서, 그 밖의 사용자 user3도 이 파일을 읽을 수만 있다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 112]
const wideBox: [number, number, number, number] = [0, 0, 440, 112]

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
  return readBox(diagram().querySelector('[data-group="string"]')!)
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

// 자리 이름은 시나리오와 상관없이 늘 보인다. 지정한 글·자리이고, 테두리 안에서 노드·그룹 라벨·다른 자리 이름과 겹치지 않는다.
function expectSlots(places: Record<SlotId, Place>, viewBox: [number, number, number, number]) {
  const shown = Array.from(diagram().querySelectorAll('[data-slot]'))
  expect(shown.map((slot) => slot.getAttribute('data-slot')).sort()).toEqual(Object.keys(slotLabels).sort())
  const boxes = shown.map((slot) => textBox(slot, slot.getAttribute('data-slot')!))
  const label = textBox(diagram().querySelector('[data-group-label="string"]')!, 'label')
  for (const slot of shown) {
    const id = slot.getAttribute('data-slot')! as SlotId
    const box = textBox(slot, id)
    expect(slot.textContent).toBe(slotLabels[id])
    expect(slot).toHaveAttribute('x', String(places[id].x))
    expect(slot).toHaveAttribute('y', String(places[id].y))
    expect(slot).toHaveAttribute('text-anchor', places[id].anchor)
    expect(slot).toHaveAttribute('font-size', '9')
    expect(slot).toHaveClass('fill-muted')
    expect(slot.closest('[opacity]')).toBeNull()
    expect(boxesOutsideViewBox([box], viewBox), id).toEqual([])
    expect(contains(groupBox(), box), id).toBe(true)
    expect(overlaps(box, label), `${id} ↔ 그룹 라벨`).toBe(false)
    for (const node of nodeIds.map(nodeBox)) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const other of boxes.filter((item) => item.id !== id)) expect(overlaps(box, other), `${id} ↔ ${other.id}`).toBe(false)
  }
  // 자리 이름은 자기 덩어리 바로 위 가운데에 선다.
  for (const [slotId, nodeId] of [['type-slot', 'type'], ['owner-slot', 'owner'], ['group-slot', 'group'], ['others-slot', 'others']] as const) {
    const node = nodeBox(nodeId)
    expect(places[slotId].x, slotId).toBe(node.x + node.width / 2)
    expect(places[slotId].y, slotId).toBeLessThanOrEqual(node.y)
  }
}

// 보이는 곁말이 지정한 id·글·자리이고, 테두리 안에서 노드·그룹 라벨·자리 이름·다른 곁말과 겹치지 않는다.
function expectNotes(ids: NoteId[], places: Record<NoteId, Place>, viewBox: [number, number, number, number]) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note')).sort()).toEqual([...ids].sort())
  const boxes = shown.map((note) => textBox(note, note.getAttribute('data-note')!))
  const label = textBox(diagram().querySelector('[data-group-label="string"]')!, 'label')
  const slots = Array.from(diagram().querySelectorAll('[data-slot]'), (slot) => textBox(slot, slot.getAttribute('data-slot')!))
  for (const note of shown) {
    const id = note.getAttribute('data-note')! as NoteId
    const box = textBox(note, id)
    expect(note.textContent).toBe(scenarioNoteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', places[id].anchor)
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note.closest('[opacity]')).toBeNull()
    expect(boxesOutsideViewBox([box], viewBox), id).toEqual([])
    expect(contains(groupBox(), box), id).toBe(true)
    expect(overlaps(box, label), `${id} ↔ 그룹 라벨`).toBe(false)
    for (const node of nodeIds.map(nodeBox)) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const slot of slots) expect(overlaps(box, slot), `${id} ↔ ${slot.id}`).toBe(false)
    for (const other of boxes.filter((item) => item.id !== id)) expect(overlaps(box, other), `${id} ↔ ${other.id}`).toBe(false)
  }
}

async function expectScenario(
  scenario: typeof expectedScenarios[number],
  places: Record<NoteId, Place>,
  viewBox: [number, number, number, number],
  container: HTMLElement,
) {
  await selectScenario(scenario.label)

  for (const element of diagram().querySelectorAll('[data-node]')) {
    const id = element.getAttribute('data-node')!
    expect(element, id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  expect(diagram().querySelector('[data-group="string"]')!.closest('[opacity]')).toBeNull()
  expect(diagram().querySelector('[data-group-label="string"]')!.closest('[opacity]')).toBeNull()
  expect(diagram().querySelectorAll('[data-path], [data-link]')).toHaveLength(0)
  expect(diagram().querySelectorAll('[data-slot]')).toHaveLength(4)
  expectNotes(scenario.notes, places, viewBox)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다.
// 테두리는 네 덩어리를 모두 담고, 그룹 라벨은 테두리 안에서 노드와 겹치지 않는다. 노드는 모두 회색이다.
function expectFits(viewBox: [number, number, number, number], group: Group, slots: Record<SlotId, Place>) {
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

  const rect = diagram().querySelector('[data-group="string"]')!
  expect(rect).toHaveAttribute('x', String(group.x))
  expect(rect).toHaveAttribute('y', String(group.y))
  expect(rect).toHaveAttribute('width', String(group.width))
  expect(rect).toHaveAttribute('height', String(group.height))
  for (const id of nodeIds) expect(contains(groupBox(), nodeBox(id)), id).toBe(true)

  const labelText = diagram().querySelector('[data-group-label="string"]')!
  expect(labelText.textContent).toBe(groupLabels.string)
  expect(labelText).toHaveAttribute('x', String(group.labelX))
  expect(labelText).toHaveAttribute('y', String(group.labelY))
  expect(labelText).toHaveAttribute('font-size', '9')
  const label = textBox(labelText, 'label')
  expect(contains(groupBox(), label)).toBe(true)
  for (const id of nodeIds) expect(overlaps(label, nodeBox(id)), id).toBe(false)
  expectSlots(slots, viewBox)
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 요점: 네 덩어리는 한 줄에 빈틈없이 이어져 있고, 라벨을 차례로 이으면 -rw-r--r--다.
// 시나리오마다 선명한 덩어리는 하나이고 네 시나리오가 서로 다른 덩어리를 가리킨다.
// 「소유자」의 보이는 곁말에 「읽기」와 「쓰기」가 있고 「실행」은 없다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')

  const cells = nodeIds.map(nodeBox)
  for (let i = 1; i < cells.length; i += 1) {
    expect(cells[i].y, nodeIds[i]).toBe(cells[0].y)
    expect(cells[i - 1].x + cells[i - 1].width, nodeIds[i]).toBe(cells[i].x)
  }
  expect(nodeIds.map((id) => diagram().querySelector(`[data-node="${id}"] text`)!.textContent).join('')).toBe('-rw-r--r--')

  const bright: string[] = []
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    const shown = Array.from(diagram().querySelectorAll('[data-node][opacity="1"]'), (element) => element.getAttribute('data-node')!)
    expect(shown, label).toHaveLength(1)
    bright.push(shown[0])
  }
  expect(new Set(bright).size).toBe(expectedScenarios.length)

  await selectScenario('소유자')
  const ownerNotes = Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.textContent).join(' ')
  expect(ownerNotes).toContain('읽기')
  expect(ownerNotes).toContain('쓰기')
  expect(ownerNotes).not.toContain('실행')

  expect(body).toContain('`-rw-r--r-- 1 user1 dev 1024 Oct 30 09:15 report.txt`')
  expect(body).toContain('`report.txt`의 `-rw-r--r--`를 이렇게 끊으면 `-`, `rw-`, `r--`, `r--`다')
  expect(body).toContain('소유자 `user1`은 이 파일을 읽고 고칠 수 있지만 프로그램으로 실행할 수는 없다')
  expect(body).toContain('그룹 `dev`에 든 `user2`는 이 파일을 읽을 수만 있다')
  expect(body).toContain('`user3`도 읽을 수만 있다')
}

describe('PermissionStringDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<PermissionStringDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 자리 이름만 보이며 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<PermissionStringDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note], [data-link]')).toHaveLength(0)
    expect(shownIds('[data-slot]', 'data-slot').sort()).toEqual(Object.keys(slotLabels).sort())
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드와 곁말만 보인다', async (scenario) => {
    const { container } = render(<PermissionStringDiagram />)
    await expectScenario(scenario, tallNotes, tallBox, container)
  })

  it('시나리오를 바꾸면 이전 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<PermissionStringDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('네 시나리오의 선명한 노드·곁말이 서로 다르다', () => {
    const keys = expectedScenarios.map(({ nodes, notes }) => JSON.stringify([[...nodes].sort(), [...notes].sort()]))
    expect(new Set(keys).size).toBe(expectedScenarios.length)
  })

  it('노드와 테두리가 280×112 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<PermissionStringDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 112')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox, tallGroup, tallSlots)
  })

  it('네 덩어리를 이으면 -rw-r--r--이고, 시나리오마다 덩어리 하나의 뜻을 보인다', async () => {
    render(<PermissionStringDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 고른 시나리오가 서로 섞이지 않는다', async () => {
    render(<><PermissionStringDiagram /><PermissionStringDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    await act(async () => { await userEvent.click(within(figures[0]).getByRole('button', { name: '소유자' })) })

    expect(within(figures[0]).getByRole('button', { name: '소유자' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(figures[1]).getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(figures[1].querySelectorAll('[data-note]')).toHaveLength(0)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<PermissionStringDiagram />)
    const text = visualsByTopicId[topicId].diagrams['permission-string']
    const ids = permissionStringScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual({ ...slotLabels, ...scenarioNoteLabels })
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
      const scenario = permissionStringScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 권한 문자열 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×112 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<PermissionStringDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 112')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·그룹·자리 이름 id 집합과 곁말 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<PermissionStringDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 112')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroupIds = shownIds('[data-group]', 'data-group').sort()
      const tallSlotIds = shownIds('[data-slot]', 'data-slot').sort()
      const tallNoteIds = await collectIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 112')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroupIds)
      expect(shownIds('[data-slot]', 'data-slot').sort()).toEqual(tallSlotIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallGroupIds).toEqual(['string'])
      expect(tallNoteIds).toEqual(Object.keys(scenarioNoteLabels).sort())
      expect(await collectIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
    })

    it('노드와 테두리가 440×112 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<PermissionStringDiagram />)
      expectFits(wideBox, wideGroup, wideSlots)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<PermissionStringDiagram />)
      await expectScenario(scenario, wideNotes, wideBox, container)
    })

    it('네 덩어리를 이으면 -rw-r--r--이고, 시나리오마다 덩어리 하나의 뜻을 보인다', async () => {
      render(<PermissionStringDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<PermissionStringDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 112')
      await selectScenario('소유자')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '소유자' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownIds('[data-note]', 'data-note')).toEqual(['owner-note'])
      expect(diagram().querySelector('[data-note="owner-note"]')).toHaveAttribute('x', String(wideNotes['owner-note'].x))
    })
  })
})
