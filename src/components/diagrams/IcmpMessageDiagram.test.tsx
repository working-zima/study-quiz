import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { IcmpMessageDiagram, icmpMessageScenarios } from './IcmpMessageDiagram'

const topicId = 'icmp'
const anchorConceptId = `${topicId}.icmp-message`
const labels = {
  'ip-header': 'IP 헤더',
  'type': '타입',
  'code': '코드',
  'checksum': '체크섬',
  'rest': '나머지',
}
const groupLabel = 'IP 패킷 · IP 헤더 뒤가 ICMP 메시지'
const sizeLabels = {
  'type-size': '8비트',
  'code-size': '8비트',
  'checksum-size': '16비트',
  'rest-size': '타입마다 다름',
}
const noteLabels = {
  'echo-type': '타입 8',
  'echo-code': '코드 0',
  'unreachable-type': '타입 3',
  'unreachable-code': '코드로 까닭을 가름',
  'time-type': '타입 11',
  'time-code': '코드 0',
}
type SizeId = keyof typeof sizeLabels
type NoteId = keyof typeof noteLabels
const nodeIds = Object.keys(labels)
// 크기 곁말마다 그 크기를 적은 칸.
const sizeOf: Record<SizeId, string> = { 'type-size': 'type', 'code-size': 'code', 'checksum-size': 'checksum', 'rest-size': 'rest' }

type Note = { x: number, y: number, anchor: 'start' | 'middle' | 'end' }
type Box = { x: number, y: number, width: number }
const tallNodes: Record<string, Box> = {
  'ip-header': { x: 8, y: 24, width: 264 },
  'type': { x: 8, y: 56, width: 56 },
  'code': { x: 64, y: 56, width: 56 },
  'checksum': { x: 120, y: 56, width: 64 },
  'rest': { x: 184, y: 56, width: 88 },
}
const wideNodes: Record<string, Box> = {
  'ip-header': { x: 8, y: 24, width: 104 },
  'type': { x: 112, y: 24, width: 72 },
  'code': { x: 184, y: 24, width: 64 },
  'checksum': { x: 248, y: 24, width: 80 },
  'rest': { x: 328, y: 24, width: 104 },
}
const tallGroup = { x: 4, y: 4, width: 272, height: 104 }
const wideGroup = { x: 4, y: 4, width: 432, height: 72 }
const tallSizes: Record<SizeId, Note> = {
  'type-size': { x: 36, y: 102, anchor: 'middle' },
  'code-size': { x: 92, y: 102, anchor: 'middle' },
  'checksum-size': { x: 152, y: 102, anchor: 'middle' },
  'rest-size': { x: 228, y: 102, anchor: 'middle' },
}
const wideSizes: Record<SizeId, Note> = {
  'type-size': { x: 148, y: 70, anchor: 'middle' },
  'code-size': { x: 216, y: 70, anchor: 'middle' },
  'checksum-size': { x: 288, y: 70, anchor: 'middle' },
  'rest-size': { x: 380, y: 70, anchor: 'middle' },
}
const tallNotes: Record<NoteId, Note> = {
  'echo-type': { x: 36, y: 128, anchor: 'middle' },
  'echo-code': { x: 66, y: 128, anchor: 'start' },
  'unreachable-type': { x: 36, y: 128, anchor: 'middle' },
  'unreachable-code': { x: 66, y: 128, anchor: 'start' },
  'time-type': { x: 36, y: 128, anchor: 'middle' },
  'time-code': { x: 66, y: 128, anchor: 'start' },
}
const wideNotes: Record<NoteId, Note> = {
  'echo-type': { x: 148, y: 96, anchor: 'middle' },
  'echo-code': { x: 186, y: 96, anchor: 'start' },
  'unreachable-type': { x: 148, y: 96, anchor: 'middle' },
  'unreachable-code': { x: 186, y: 96, anchor: 'start' },
  'time-type': { x: 148, y: 96, anchor: 'middle' },
  'time-code': { x: 186, y: 96, anchor: 'start' },
}

const question = 'ICMP 메시지는 무엇으로 종류를 가를까?'
const idleCaption = 'ICMP 메시지는 IP 헤더 바로 뒤에 담기고, 맨 앞에 타입·코드·체크섬 칸이 차례로 붙는다. 버튼을 고르면 메시지마다 타입 칸과 코드 칸에 어떤 번호가 들어가는지 볼 수 있다.'
const legend = '상자 하나가 칸 하나다. 칸의 너비는 비트 수에 맞춘 것이 아니고, 칸의 크기는 칸 아래의 글로 적었다.'
const figureName = 'ICMP 메시지의 타입과 코드를 보이는 도식'
const svgName = 'IP 헤더 뒤에 ICMP 메시지의 타입·코드·체크섬·나머지 칸이 차례로 이어진 IP 패킷'
const expectedScenarios = [
  {
    id: 'echo-request', label: '에코 요청', message: '에코 요청',
    notes: ['echo-type', 'echo-code'] as NoteId[],
    caption: '에코 요청은 타입 칸에 8, 코드 칸에 0을 적는다. 받은 호스트에게 같은 데이터를 담아 돌려 달라고 보내는 질의 메시지라, 까닭을 더 가를 필요가 없어 코드는 0이다.',
  },
  {
    id: 'unreachable', label: '목적지 도달 불가', message: '목적지 도달 불가',
    notes: ['unreachable-type', 'unreachable-code'] as NoteId[],
    caption: '목적지 도달 불가는 타입 칸에 3을 적는다. 패킷을 목적지까지 넘기지 못한 까닭은 코드 칸의 번호로 가른다. 코드 0은 목적지 네트워크로 가는 경로를 모른다는 뜻이고, 코드 3은 데이터를 받을 프로그램이 없다는 뜻이다.',
  },
  {
    id: 'time-exceeded', label: '시간 초과', message: '시간 초과',
    notes: ['time-type', 'time-code'] as NoteId[],
    caption: '시간 초과는 타입 칸에 11, 코드 칸에 0을 적는다. 패킷의 TTL 값이 0이 되어 그 패킷을 버린 라우터가 출발지 호스트에 보내는 오류 메시지다.',
  },
].map((scenario) => ({ ...scenario, nodes: ['type', 'code'], sources: [anchorConceptId] }))

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

function inside(box: SvgBox, outer: { x: number, y: number, width: number, height: number }) {
  return box.x >= outer.x && box.x + box.width <= outer.x + outer.width && box.y >= outer.y && box.y + box.height <= outer.y + outer.height
}

function nearestNode(note: Element) {
  const box = textBox(note, '')
  const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  const distance = (id: string) => {
    const node = nodeBox(id)
    return Math.hypot(node.x + node.width / 2 - center.x, node.y + node.height / 2 - center.y)
  }
  return [...nodeIds].sort((a, b) => distance(a) - distance(b))[0]
}

// 노드·그룹이 지정한 자리이고, 모든 rect가 viewBox 안이며, 라벨이 자기 상자 안에 들어가고 칸끼리 겹치지 않는다.
function expectFits(viewBox: [number, number, number, number], places: Record<string, Box>, group: typeof tallGroup) {
  const boxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length)
  expect(boxesOutsideViewBox([...boxes, readBox(diagram().querySelector('[data-group] ')!)], viewBox)).toEqual([])
  expect(diagram().querySelectorAll('rect')).toHaveLength(nodeIds.length + 1)
  expect(diagram().querySelector('[data-group="packet"]')).toHaveAttribute('x', String(group.x))
  expect(diagram().querySelector('[data-group="packet"]')).toHaveAttribute('height', String(group.height))

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(box).toEqual({ id, ...places[id], height: 32 })
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(node.querySelector('rect')).toHaveClass('stroke-disabled')
    expect(estimateTextWidth(label, 10) + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
    expect(inside(box, group), `${id}는 IP 패킷 안`).toBe(true)
  }
  for (let i = 0; i < nodeIds.length; i += 1) {
    for (let j = i + 1; j < nodeIds.length; j += 1) {
      expect(overlaps(nodeBox(nodeIds[i]), nodeBox(nodeIds[j])), `${nodeIds[i]} ↔ ${nodeIds[j]}`).toBe(false)
    }
  }
  const label = diagram().querySelector('[data-group-label="packet"]')!
  expect(label.textContent).toBe(groupLabel)
  expect(label).toHaveAttribute('font-size', '9')
  const labelBox = textBox(label, 'group-label')
  expect(inside(labelBox, group)).toBe(true)
  for (const id of nodeIds) expect(overlaps(labelBox, nodeBox(id)), `그룹 라벨 ↔ ${id}`).toBe(false)
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  expect(diagram().querySelectorAll('path, marker')).toHaveLength(0)
}

// 크기 곁말은 늘 보이고, 자기 칸 바로 아래 같은 가운데에 서며 그 칸의 흐림을 따른다. 그룹 박스 안에 들어가고 칸·라벨과 겹치지 않는다.
function expectSizes(places: Record<SizeId, Note>, group: typeof tallGroup) {
  const shown = Array.from(diagram().querySelectorAll('[data-size-note]'))
  expect(shown.map((note) => note.getAttribute('data-size-note')).sort()).toEqual(Object.keys(sizeLabels).sort())
  const boxes: SvgBox[] = []
  for (const note of shown) {
    const id = note.getAttribute('data-size-note')! as SizeId
    const box = textBox(note, id)
    const field = nodeBox(sizeOf[id])
    expect(note.textContent).toBe(sizeLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('font-size', '9')
    expect(Number(note.getAttribute('x'))).toBe(field.x + field.width / 2)
    expect(box.y, id).toBeGreaterThanOrEqual(field.y + field.height)
    expect(inside(box, group), id).toBe(true)
    expect(note).toHaveAttribute('opacity', diagram().querySelector(`[data-node="${sizeOf[id]}"]`)!.getAttribute('opacity'))
    for (const node of nodeIds.map(nodeBox)) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const other of boxes) expect(overlaps(box, other), `${id} ↔ ${other.id}`).toBe(false)
    boxes.push(box)
  }
}

// 보이는 시나리오 곁말이 지정한 id·글·자리이고, viewBox 안에서 그룹 박스 밖(아래)에 있으며 칸·서로와 겹치지 않는다.
function expectNotes(ids: NoteId[], places: Record<NoteId, Note>, width: number, height: number, group: typeof tallGroup) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note')).sort()).toEqual([...ids].sort())
  const boxes: SvgBox[] = []
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
    expect(box.y, id).toBeGreaterThanOrEqual(group.y + group.height)
    expect(box.y + box.height, id).toBeLessThanOrEqual(height)
    for (const other of boxes) expect(overlaps(box, other), `${id} ↔ ${other.id}`).toBe(false)
    boxes.push(box)
  }
}

async function expectScenario(
  scenario: typeof expectedScenarios[number],
  places: Record<NoteId, Note>,
  width: number,
  height: number,
  group: typeof tallGroup,
  container: HTMLElement,
) {
  await selectScenario(scenario.label)

  for (const element of diagram().querySelectorAll('[data-node]')) {
    const id = element.getAttribute('data-node')!
    expect(element, id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  expect(diagram().querySelector('[data-group="packet"]')!.closest('[opacity]')).toBeNull()
  expectNotes(scenario.notes, places, width, height, group)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 요점: 칸의 차례(IP 헤더 → 타입 → 코드 → 체크섬 → 나머지)는 어느 시나리오에서나 같고 칸이 빈틈없이 이어진다.
// 시나리오마다 타입 곁말의 번호가 본문 목록 항목의 번호와 같고 서로 다르며, 타입·코드 곁말은 각자 자기 칸에 가장 가깝다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const order = () => {
    const boxes = nodeIds.map(nodeBox).sort((a, b) => a.y - b.y || a.x - b.x)
    return boxes
  }
  const expectBand = () => {
    const boxes = order()
    expect(boxes.map(({ id }) => id)).toEqual(['ip-header', 'type', 'code', 'checksum', 'rest'])
    const right = boxes[0].x + boxes[0].width
    for (let i = 1; i < boxes.length; i += 1) {
      const previous = boxes[i - 1]
      if (boxes[i].y === previous.y) expect(boxes[i].x, `${boxes[i].id}는 ${previous.id}에 붙는다`).toBe(previous.x + previous.width)
      else {
        expect(boxes[i].y, `${boxes[i].id}는 바로 아래 줄`).toBe(previous.y + previous.height)
        expect(previous.x + previous.width, '줄의 오른쪽 끝').toBe(right)
        expect(boxes[i].x, '줄의 왼쪽 끝').toBe(boxes[0].x)
      }
    }
    expect(boxes[boxes.length - 1].x + boxes[boxes.length - 1].width).toBe(Math.max(right, ...boxes.map((box) => box.x + box.width)))
  }
  expectBand()

  const types: string[] = []
  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    expectBand()
    const typeNote = diagram().querySelector(`[data-note="${scenario.notes[0]}"]`)!
    const codeNote = diagram().querySelector(`[data-note="${scenario.notes[1]}"]`)!
    const shown = typeNote.textContent!.match(/^타입 (\d+)$/u)![1]
    const listed = body.match(new RegExp(`\\*\\*${scenario.message}\\*\\*\\([^)]*타입 (\\d+)\\)`, 'u'))![1]
    expect(shown, scenario.id).toBe(listed)
    expect(scenario.caption).toContain(`타입 칸에 ${shown}`)
    expect(nearestNode(typeNote), `${scenario.id} 타입 곁말`).toBe('type')
    expect(nearestNode(codeNote), `${scenario.id} 코드 곁말`).toBe('code')
    types.push(shown)
  }
  expect(new Set(types).size).toBe(expectedScenarios.length)
  expect(body).toContain('에코 요청과 에코 응답처럼 까닭을 더 가를 필요가 없는 메시지는 코드를 0으로 둔다')
  expect(body).toContain('TTL이 다 되어 버렸다는 까닭은 코드 0으로 적는다')
  expect(body).toContain('세 칸 뒤의 나머지 부분은 타입마다 생김새가 다르므로')
  expect(body).toContain('칸의 크기는 타입과 코드가 8비트씩, 체크섬이 16비트다')
}

describe('IcmpMessageDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<IcmpMessageDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 칸이 모두 선명하고 크기 곁말만 보이며 선택 안내가 나온다', () => {
    const { container } = render(<IcmpMessageDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node], [data-size-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expectSizes(tallSizes, tallGroup)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 타입·코드 칸만 선명하고 지정한 곁말만 보인다', async (scenario) => {
    const { container } = render(<IcmpMessageDiagram />)
    await expectScenario(scenario, tallNotes, 280, 136, tallGroup, container)
    expectSizes(tallSizes, tallGroup)
  })

  it('시나리오를 바꾸면 이전 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<IcmpMessageDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('칸과 그룹이 280×136 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<IcmpMessageDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 136')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 136], tallNodes, tallGroup)
  })

  it('칸의 차례가 같고, 타입 곁말의 번호가 본문과 같으며 시나리오마다 다르다', async () => {
    render(<IcmpMessageDiagram />)
    await expectPoint()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<IcmpMessageDiagram />)
    const text = visualsByTopicId[topicId].diagrams['icmp-message']
    const ids = icmpMessageScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual({ packet: groupLabel })
    expect(text.notes).toEqual({ ...sizeLabels, ...noteLabels })
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([anchorConceptId])
    expect(text.label).toBe(figureName)
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = icmpMessageScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 ICMP 메시지의 타입과 코드 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×104 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<IcmpMessageDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 104')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('칸·그룹 id 집합이 세로형과 같다', () => {
      const { change } = mockMatchMedia(false)
      render(<IcmpMessageDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 136')
      const tallIds = shownIds('[data-node]', 'data-node').sort()
      const tallGroups = shownIds('[data-group]', 'data-group')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 104')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallIds)
      expect(shownIds('[data-group]', 'data-group')).toEqual(tallGroups)
    })

    it('칸과 그룹이 440×104 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<IcmpMessageDiagram />)
      expectFits([0, 0, 440, 104], wideNodes, wideGroup)
      expectSizes(wideSizes, wideGroup)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 칸·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<IcmpMessageDiagram />)
      await expectScenario(scenario, wideNotes, 440, 104, wideGroup, container)
      expectSizes(wideSizes, wideGroup)
    })

    it('칸의 차례가 같고, 타입 곁말의 번호가 본문과 같으며 시나리오마다 다르다', async () => {
      render(<IcmpMessageDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<IcmpMessageDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 136')
      await selectScenario('목적지 도달 불가')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '목적지 도달 불가' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(diagram().querySelector('[data-note="unreachable-type"]')).toHaveAttribute('x', String(wideNotes['unreachable-type'].x))
    })
  })
})
