import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { Ipv4AddressDiagram, ipv4AddressScenarios } from './Ipv4AddressDiagram'

const topicId = 'ip-protocol'
const anchorConceptId = `${topicId}.ipv4-address`
const labels: Record<string, string> = {
  'bits-1': '11000000', 'bits-2': '00000000', 'bits-3': '00000010', 'bits-4': '00000001',
  'dec-1': '192', 'dec-2': '0', 'dec-3': '2', 'dec-4': '1',
  address: '192.0.2.1',
}
const noteLabels: Record<string, string> = {
  'octet-1': '8비트', 'octet-2': '8비트', 'octet-3': '8비트', 'octet-4': '8비트',
  'dot-1': '.', 'dot-2': '.', 'dot-3': '.',
}
// 곁말마다 흐림을 따르는 노드. 「8비트」는 자기 칸을, 점은 이어 적은 주소를 따른다.
const noteOwner: Record<string, string> = {
  'octet-1': 'bits-1', 'octet-2': 'bits-2', 'octet-3': 'bits-3', 'octet-4': 'bits-4',
  'dot-1': 'address', 'dot-2': 'address', 'dot-3': 'address',
}
const groupLabel = 'IPv4 주소 32비트'
const nodeIds = Object.keys(labels)
const noteIds = Object.keys(noteLabels)
const bits = [1, 2, 3, 4].map((k) => `bits-${k}`)
const decimals = [1, 2, 3, 4].map((k) => `dec-${k}`)
const ends: Record<string, [string, string]> = {
  'conv-1': ['bits-1', 'dec-1'],
  'conv-2': ['bits-2', 'dec-2'],
  'conv-3': ['bits-3', 'dec-3'],
  'conv-4': ['bits-4', 'dec-4'],
}

const question = '32비트 주소는 어떻게 네 수가 될까?'
const idleCaption = 'IPv4 주소 192.0.2.1의 32비트를 8비트씩 끊어 놓은 모습이다. 버튼을 고르면 32비트를 네 칸으로 끊는 단계와, 칸마다 십진수로 바꿔 점으로 잇는 단계를 따로 볼 수 있다.'
const legend = '위쪽 띠의 네 칸은 주소의 32비트를 8비트씩 끊은 것이고, 아래 수는 각 칸의 값을 십진수로 바꾼 것이다.'
const figureName = 'IPv4 주소 32비트를 8비트씩 네 칸으로 끊어 십진수 넷으로 적는 과정을 보이는 도식'
const svgName = 'IPv4 주소 192.0.2.1의 32비트를 8비트씩 끊은 네 칸 11000000·00000000·00000010·00000001이 차례로 십진수 192·0·2·1이 되고, 네 수를 점으로 이어 192.0.2.1로 적는 모습'
const expectedScenarios = [
  {
    id: 'bits', label: '8비트씩', nodes: bits, paths: [] as string[],
    caption: 'IPv4 주소는 32비트를 앞에서부터 8비트씩 네 칸으로 끊어 적는다. 8비트 한 칸은 1바이트이고, 표준 문서에서는 옥텟이라고도 부른다.',
  },
  {
    id: 'decimal', label: '십진수', nodes: [...decimals, 'address'], paths: ['conv-1', 'conv-2', 'conv-3', 'conv-4'],
    caption: '칸마다 8비트의 값을 0부터 255 사이의 십진수로 바꾸면 192, 0, 2, 1이 된다. 네 수를 점으로 이어 이 주소를 192.0.2.1로 적는다.',
  },
]

function diagram() {
  return screen.getByRole('img', { name: svgName })
}

async function selectScenario(label: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) })
}

function readBox(rect: Element, id = ''): SvgBox {
  return {
    id,
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

function nodeBox(id: string) {
  return readBox(diagram().querySelector(`[data-node="${id}"] rect`)!, id)
}

function groupBox() {
  return readBox(diagram().querySelector('[data-group="bits"]')!, 'bits')
}

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

function nodeAt(point: { x: number, y: number }) {
  return nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))
}

function center(box: SvgBox) {
  return box.x + box.width / 2
}

function brightNodes() {
  return nodeIds.filter((id) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다.
// 곁말과 그룹 라벨은 viewBox 안에서 노드·화살표·서로와 겹치지 않고, 그룹 라벨은 자기 박스 안에 든다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), (rect) => readBox(rect))
  expect(boxes).toHaveLength(nodeIds.length + 1)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(nodeBox(id).height).toBe(32)
    expect(estimateTextWidth(label, 10) + 12, `${id} ${label}`).toBeLessThanOrEqual(nodeBox(id).width)
  }
  for (let i = 0; i < nodeIds.length; i += 1) {
    for (let j = i + 1; j < nodeIds.length; j += 1) {
      expect(overlaps(nodeBox(nodeIds[i]), nodeBox(nodeIds[j])), `${nodeIds[i]} ↔ ${nodeIds[j]}`).toBe(false)
    }
  }
  const label = textBox(diagram().querySelector('[data-group-label="bits"]')!, 'group-label')
  const texts = [...Array.from(diagram().querySelectorAll('[data-note]'), (note) => textBox(note, note.getAttribute('data-note')!)), label]
  for (const box of texts) {
    expect(box.x, box.id).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, box.id).toBeLessThanOrEqual(viewBox[2])
    expect(box.y, box.id).toBeGreaterThanOrEqual(0)
    expect(box.y + box.height, box.id).toBeLessThanOrEqual(viewBox[3])
    for (const id of nodeIds) expect(overlaps(box, nodeBox(id)), `${box.id} ↔ ${id}`).toBe(false)
  }
  for (let i = 0; i < texts.length; i += 1) {
    for (let j = i + 1; j < texts.length; j += 1) expect(overlaps(texts[i], texts[j]), `${texts[i].id} ↔ ${texts[j].id}`).toBe(false)
  }
  expect(contains(groupBox(), label)).toBe(true)
  for (const id of bits) expect(contains(groupBox(), nodeBox(id)), id).toBe(true)
  for (const id of [...decimals, 'address']) expect(overlaps(groupBox(), nodeBox(id)), id).toBe(false)
}

// 화살표의 양 끝이 지정한 두 노드의 변에 닿고, 어떤 선분도 노드 안·그룹 라벨·곁말을 지나지 않는다.
async function expectArrows(arrows: Record<string, string>) {
  await selectScenario('십진수')
  const label = textBox(diagram().querySelector('[data-group-label="bits"]')!, 'group-label')
  const notes = Array.from(diagram().querySelectorAll('[data-note]'), (note) => textBox(note, note.getAttribute('data-note')!))
  for (const path of diagram().querySelectorAll('[data-path]')) {
    const id = path.getAttribute('data-path')!
    expect(path).toHaveAttribute('d', arrows[id])
    const list = segments(path.getAttribute('d')!)
    for (const segment of list) {
      for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
      expect(touches(segment, label), `${id} ↔ 그룹 라벨`).toBe(false)
      for (const note of notes) expect(touches(segment, note), `${id} ↔ ${note.id}`).toBe(false)
    }
    expect(nodeAt({ x: list[0].x1, y: list[0].y1 }), `${id} 시작`).toBe(ends[id][0])
    expect(nodeAt({ x: list[list.length - 1].x2, y: list[list.length - 1].y2 }), `${id} 끝`).toBe(ends[id][1])
  }
}

async function expectScenario(scenario: typeof expectedScenarios[number], container: HTMLElement) {
  await selectScenario(scenario.label)
  for (const id of nodeIds) {
    expect(diagram().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  for (const id of noteIds) {
    expect(diagram().querySelector(`[data-note="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(noteOwner[id]) ? '1' : '0.25')
  }
  expect(diagram().querySelector('[data-group="bits"]')!.closest('[opacity]')).toBeNull()
  const shownPaths = Array.from(diagram().querySelectorAll('[data-path]'))
  expect(shownPaths.map((path) => path.getAttribute('data-path'))).toEqual(scenario.paths)
  for (const path of shownPaths) {
    expect(path).toHaveAttribute('marker-end', `url(#${diagram().querySelector('marker')!.id})`)
    expect(path).toHaveClass('stroke-title')
  }
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
}

// 요점: 위 띠의 네 칸은 8비트씩 빈틈없이 이어져 32비트가 되고, 칸마다 2진수 값이 바로 아래 십진수(0~255)와 같다.
// 네 십진수를 점으로 이으면 이어 적은 주소이고, 그 주소와 비트는 개념 본문의 예와 같다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const read = (id: string) => diagram().querySelector(`[data-node="${id}"] text`)!.textContent!
  const bitTexts = bits.map(read)
  const decimalTexts = decimals.map(read)
  for (const value of bitTexts) expect(value).toMatch(/^[01]{8}$/u)
  expect(bitTexts.join('')).toHaveLength(32)
  for (let k = 0; k < 4; k += 1) {
    const value = Number(decimalTexts[k])
    expect(value, decimals[k]).toBeGreaterThanOrEqual(0)
    expect(value, decimals[k]).toBeLessThanOrEqual(255)
    expect(parseInt(bitTexts[k], 2), bits[k]).toBe(value)
    expect(center(nodeBox(decimals[k])), decimals[k]).toBe(center(nodeBox(bits[k])))
    expect(nodeBox(decimals[k]).y, decimals[k]).toBeGreaterThan(nodeBox(bits[k]).y)
  }
  for (let k = 0; k < 3; k += 1) expect(nodeBox(bits[k]).x + nodeBox(bits[k]).width, `${bits[k]} 뒤`).toBe(nodeBox(bits[k + 1]).x)
  for (let k = 0; k < 3; k += 1) {
    const dot = Number(diagram().querySelector(`[data-note="dot-${k + 1}"]`)!.getAttribute('x'))
    expect(dot).toBeGreaterThan(nodeBox(decimals[k]).x + nodeBox(decimals[k]).width)
    expect(dot).toBeLessThan(nodeBox(decimals[k + 1]).x)
  }
  expect(decimalTexts.join('.')).toBe(read('address'))
  expect(read('address')).toBe('192.0.2.1')
  expect(nodeBox('address').y).toBeGreaterThan(nodeBox('dec-1').y)
  expect(diagram().querySelector('[data-group-label="bits"]')!.textContent).toContain(`${bitTexts.join('').length}비트`)

  const seen: string[] = []
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    seen.push(`${brightNodes().join()}|${Array.from(diagram().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')).join()}`)
  }
  expect(new Set(seen).size).toBe(2)

  expect(body).toContain(`32비트가 \`${bitTexts.join('')}\`인 주소를 8비트씩 끊으면 ${bitTexts.map((value) => `\`${value}\``).join(', ')}이 된다`)
  expect(body).toContain(`넷을 십진수로 바꾸면 ${decimalTexts.join(', ')}이므로 이 주소는 \`${read('address')}\`로 적는다`)
  expect(body).toContain('네 수를 점(`.`)으로 이으면')
}

async function expectUniqueMarkers() {
  render(<><Ipv4AddressDiagram /><Ipv4AddressDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: figureName })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '십진수' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(4)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

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

const tallArrows: Record<string, string> = {
  'conv-1': 'M44 72 V112',
  'conv-2': 'M108 72 V112',
  'conv-3': 'M172 72 V112',
  'conv-4': 'M236 72 V112',
}
const wideArrows: Record<string, string> = {
  'conv-1': 'M76 72 V112',
  'conv-2': 'M172 72 V112',
  'conv-3': 'M268 72 V112',
  'conv-4': 'M364 72 V112',
}

describe('Ipv4AddressDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<Ipv4AddressDiagram />)
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 곁말이 모두 선명하고 화살표 없이 선택 안내가 나온다', () => {
    const { container } = render(<Ipv4AddressDiagram />)
    expect(Array.from(diagram().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node], [data-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(diagram().querySelector('[data-group-label="bits"]')!.textContent).toBe(groupLabel)
    expect(Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.textContent)).toEqual(Object.values(noteLabels))
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 선명하다', async (scenario) => {
    const { container } = render(<Ipv4AddressDiagram />)
    await expectScenario(scenario, container)
  })

  it('전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<Ipv4AddressDiagram />)
    await selectScenario('십진수')
    await selectScenario('전체')
    for (const element of diagram().querySelectorAll('[data-node], [data-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드가 280×204 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<Ipv4AddressDiagram />)
    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 204')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expectFits([0, 0, 280, 204])
  })

  it('화살표는 칸에서 바로 아래 십진수로 가고 노드 안·라벨·곁말을 지나지 않는다', async () => {
    render(<Ipv4AddressDiagram />)
    await expectArrows(tallArrows)
  })

  it('노드는 모두 회색이고 도식 전용 두 색·초록·빨강·주황은 쓰지 않는다', () => {
    render(<Ipv4AddressDiagram />)
    for (const id of nodeIds) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
    expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('네 칸의 비트가 각 십진수와 같고, 네 수를 점으로 이으면 본문의 예시 주소다', async () => {
    render(<Ipv4AddressDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<Ipv4AddressDiagram />)
    const text = visualsByTopicId[topicId].diagrams['ipv4-address']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(ipv4AddressScenarios.map(({ id }) => id)).toEqual(expectedScenarios.map(({ id }) => id))
    expect(text.scenarios.map(({ id }) => id)).toEqual(expectedScenarios.map(({ id }) => id))
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual({ bits: groupLabel })
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.label).toBe(figureName)
    expect(text.sources).toEqual([anchorConceptId])
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = ipv4AddressScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
      expect(scenario.caption).toBe(wording.caption)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(screen.getAllByRole('figure')).toEqual([figure])
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×204 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<Ipv4AddressDiagram />)
      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 204')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('모든 rect가 440×204 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<Ipv4AddressDiagram />)
      expectFits([0, 0, 440, 204])
    })

    it('화살표가 가로형에서도 칸에서 바로 아래 십진수로 간다', async () => {
      render(<Ipv4AddressDiagram />)
      await expectArrows(wideArrows)
    })

    it('노드·그룹·곁말 id 집합과 화살표 id가 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<Ipv4AddressDiagram />)
      await selectScenario('십진수')
      const read = (selector: string, attribute: string) => Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)).sort()
      const ids = () => [read('[data-node]', 'data-node'), read('[data-group]', 'data-group'), read('[data-note]', 'data-note'), read('[data-path]', 'data-path')]
      const tall = ids()
      act(() => change(true))
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 204')
      expect(ids()).toEqual(tall)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·캡션을 보인다', async (scenario) => {
      const { container } = render(<Ipv4AddressDiagram />)
      await expectScenario(scenario, container)
    })

    it('가로형에서도 비트·십진수·이어 적은 주소의 요점이 그대로다', async () => {
      render(<Ipv4AddressDiagram />)
      await expectPoint()
    })

    it('폭이 바뀌어도 고른 시나리오와 캡션을 유지한다', async () => {
      const { change } = mockMatchMedia(true)
      const { container } = render(<Ipv4AddressDiagram />)
      await selectScenario('십진수')
      act(() => change(false))
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 204')
      expect(screen.getByRole('button', { name: '십진수' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(expectedScenarios[1].caption)
      expect(brightNodes()).toEqual([...decimals, 'address'])
    })
  })
})
