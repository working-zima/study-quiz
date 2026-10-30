import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { SharedResponsibilityDiagram, sharedResponsibilityScenarios } from './SharedResponsibilityDiagram'

const topicId = 'azure-service-types'
const anchorConceptId = `${topicId}.shared-responsibility-model`
const customerIds = ['data', 'config', 'account']
const variesIds = ['device', 'application', 'network', 'os']
const providerIds = ['host', 'physical-network', 'datacenter']
const nodeIds = [...customerIds, ...variesIds, ...providerIds]
const groupIds = ['customer', 'varies', 'provider']
const groupOf: Record<string, string> = Object.fromEntries([
  ...customerIds.map((id) => [id, 'customer']),
  ...variesIds.map((id) => [id, 'varies']),
  ...providerIds.map((id) => [id, 'provider']),
])
const labels: Record<string, string> = {
  data: '정보와 데이터',
  config: '구성과 설정',
  account: '계정과 ID',
  device: '장치',
  application: '애플리케이션',
  network: '네트워크 제어',
  os: '운영 체제',
  host: '물리 호스트',
  'physical-network': '물리 네트워크',
  datacenter: '물리 데이터 센터',
}
const groupLabels: Record<string, string> = {
  customer: '늘 고객',
  varies: '서비스 유형에 따라',
  provider: '클라우드에서는 늘 공급자',
}
const noteLabels: Record<string, string> = {
  'device-shared': '함께',
  'application-shared': '함께',
  'network-shared': '함께',
}
const noteOwner: Record<string, string> = {
  'device-shared': 'device',
  'application-shared': 'application',
  'network-shared': 'network',
}

// 「Shared responsibility in the cloud」의 책임 표 그대로다(official.md, phase 101 step 6). 칸은 고객·함께·공급자.
type Scenario = 'on-premises' | 'iaas' | 'paas' | 'saas'
type Owner = '고객' | '함께' | '공급자'
const assignment: Record<string, Record<Scenario, Owner>> = {
  data: { 'on-premises': '고객', iaas: '고객', paas: '고객', saas: '고객' },
  config: { 'on-premises': '고객', iaas: '고객', paas: '고객', saas: '고객' },
  account: { 'on-premises': '고객', iaas: '고객', paas: '고객', saas: '고객' },
  device: { 'on-premises': '고객', iaas: '고객', paas: '고객', saas: '함께' },
  application: { 'on-premises': '고객', iaas: '고객', paas: '함께', saas: '함께' },
  network: { 'on-premises': '고객', iaas: '고객', paas: '함께', saas: '공급자' },
  os: { 'on-premises': '고객', iaas: '고객', paas: '공급자', saas: '공급자' },
  host: { 'on-premises': '고객', iaas: '공급자', paas: '공급자', saas: '공급자' },
  'physical-network': { 'on-premises': '고객', iaas: '공급자', paas: '공급자', saas: '공급자' },
  datacenter: { 'on-premises': '고객', iaas: '공급자', paas: '공급자', saas: '공급자' },
}

type Group = { x: number, y: number, width: number, height: number }
type Note = { x: number, y: number }
const tallGroups: Record<string, Group> = {
  customer: { x: 6, y: 4, width: 268, height: 140 },
  varies: { x: 6, y: 152, width: 268, height: 180 },
  provider: { x: 6, y: 340, width: 268, height: 140 },
}
const wideGroups: Record<string, Group> = {
  customer: { x: 14, y: 4, width: 116, height: 140 },
  varies: { x: 138, y: 4, width: 146, height: 180 },
  provider: { x: 292, y: 4, width: 134, height: 140 },
}
const tallNotes: Record<string, Note> = {
  'device-shared': { x: 247, y: 192 },
  'application-shared': { x: 247, y: 232 },
  'network-shared': { x: 247, y: 272 },
}
const wideNotes: Record<string, Note> = {
  'device-shared': { x: 266, y: 44 },
  'application-shared': { x: 266, y: 84 },
  'network-shared': { x: 266, y: 124 },
}

const question = '온-프레미스에서 SaaS로 갈수록, 고객이 맡는 책임은 어떻게 줄어들까?'
const idleCaption = '책임 열 가지를 늘 고객이 맡는 것, 서비스 유형에 따라 맡는 쪽이 달라지는 것, 클라우드에서는 늘 공급자가 맡는 것의 세 묶음으로 나눠 두었다. 버튼을 고르면 그 방식에서 고객이 맡는 책임은 선명하게, 공급자가 맡는 책임은 흐리게 보인다.'
const legend = '선명한 칸은 고객이 맡거나 고객과 공급자가 함께 맡는 책임이고, 흐린 칸은 공급자가 맡는 책임이다. 「함께」가 붙은 칸은 둘이 나눠 맡는다.'
const expectedScenarios = [
  {
    id: 'on-premises' as const, label: '온-프레미스',
    nodes: nodeIds,
    notes: [] as string[],
    caption: '온-프레미스에서는 회사가 자기 데이터 센터를 직접 운영하므로, 물리 데이터 센터부터 정보와 데이터까지 모든 책임을 회사가 맡는다.',
  },
  {
    id: 'iaas' as const, label: 'IaaS',
    nodes: [...customerIds, 'device', 'application', 'network', 'os'],
    notes: [] as string[],
    caption: 'IaaS로 옮기면 물리 데이터 센터·물리 네트워크·물리 호스트가 공급자에게 넘어간다. 운영 체제부터 앱과 데이터까지는 네트워크 제어와 장치를 포함해 모두 고객이 맡는다.',
  },
  {
    id: 'paas' as const, label: 'PaaS',
    nodes: [...customerIds, 'device', 'application', 'network'],
    notes: ['application-shared', 'network-shared'],
    caption: 'PaaS에서는 운영 체제까지 공급자가 맡는다. 애플리케이션과 네트워크 제어는 고객과 공급자가 함께 맡고, 장치와 정보와 데이터·구성과 설정·계정과 ID는 고객이 맡는다.',
  },
  {
    id: 'saas' as const, label: 'SaaS',
    nodes: [...customerIds, 'device', 'application'],
    notes: ['device-shared', 'application-shared'],
    caption: 'SaaS에서는 네트워크 제어까지 공급자가 맡고, 애플리케이션과 장치는 함께 맡는다. 그래도 정보와 데이터·구성과 설정·계정과 ID는 여전히 고객이 맡는다.',
  },
]

function diagram() {
  return screen.getByRole('img', { name: '책임 열 가지를 늘 고객이 맡는 묶음, 서비스 유형에 따라 맡는 쪽이 달라지는 묶음, 클라우드에서는 늘 공급자가 맡는 묶음으로 나눠 놓은 모습' })
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

function groupBox(id: string) {
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

// 글자가 차지하는 상자. 높이는 글자 크기 9를 기준선 위로 잡는다.
function textBox(text: Element): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9)
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id: text.getAttribute('data-note') ?? text.getAttribute('data-group-label')!, x: left, y: y - 9, width, height: 9 }
}

// 보이는 곁말이 지정한 id·글·자리이고, 자기 행의 노드 오른쪽, 「서비스 유형에 따라」 박스 안에서 노드·그룹 라벨·다른 곁말과 겹치지 않는다.
function expectNotes(ids: string[], places: Record<string, Note>, varies: Group, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note'))).toEqual(ids)
  const labelBoxes = Array.from(diagram().querySelectorAll('[data-group-label]'), textBox)
  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  for (const note of shown) {
    const id = note.getAttribute('data-note')!
    const box = textBox(note)
    const owner = nodeBox(noteOwner[id])
    expect(note.textContent).toBe(noteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', 'middle')
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note.closest('[opacity]')).toBeNull()
    expect(box.x, id).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, id).toBeLessThanOrEqual(width)
    expect(box.y, id).toBeGreaterThanOrEqual(0)
    expect(box.y + box.height, id).toBeLessThanOrEqual(height)
    expect(contains({ id: 'varies', ...varies }, box), `${id} 서비스 유형에 따라 박스 안`).toBe(true)
    expect(box.x, `${id}는 자기 노드 오른쪽`).toBeGreaterThanOrEqual(owner.x + owner.width)
    expect(box.y, `${id}는 자기 노드 높이 안`).toBeGreaterThanOrEqual(owner.y)
    expect(box.y + box.height, `${id}는 자기 노드 높이 안`).toBeLessThanOrEqual(owner.y + owner.height)
    for (const node of nodeBoxes) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const label of labelBoxes) expect(overlaps(box, label), `${id} ↔ ${label.id}`).toBe(false)
    for (const other of shown.filter((element) => element !== note)) expect(overlaps(box, textBox(other)), `${id} ↔ 다른 곁말`).toBe(false)
  }
}

async function expectScenario(
  scenario: typeof expectedScenarios[number],
  places: Record<string, Note>,
  varies: Group,
  width: number,
  height: number,
  container: HTMLElement,
) {
  await selectScenario(scenario.label)

  expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
  for (const element of diagram().querySelectorAll('[data-node]')) {
    const id = element.getAttribute('data-node')!
    expect(element, id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  for (const group of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(group).not.toHaveAttribute('opacity')
  expect(diagram().querySelectorAll('path')).toHaveLength(0)
  expectNotes(scenario.notes, places, varies, width, height)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨이 자기 상자 안에 들어가며, 노드마다 자기 그룹 박스 안에 든다.
function expectFits(viewBox: [number, number, number, number], groups: Record<string, Group>) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])

  expect(shownIds('[data-group]', 'data-group')).toEqual(groupIds)
  const labelBoxes: SvgBox[] = []
  for (const id of groupIds) {
    const group = diagram().querySelector(`[data-group="${id}"]`)!
    expect(readBox(group)).toEqual({ id, ...groups[id] })
    expect(group).toHaveClass('fill-none', 'stroke-disabled')
    expect(group.closest('[opacity]')).toBeNull()
    const label = diagram().querySelector(`[data-group-label="${id}"]`)!
    expect(label.textContent).toBe(groupLabels[id])
    expect(label).toHaveAttribute('font-size', '9')
    expect(label).toHaveClass('fill-muted')
    expect(contains(readBox(group), textBox(label)), `${id} 그룹 라벨`).toBe(true)
    labelBoxes.push(textBox(label))
  }
  for (let i = 0; i < groupIds.length; i += 1) {
    for (let j = i + 1; j < groupIds.length; j += 1) {
      expect(overlaps(groupBox(groupIds[i]), groupBox(groupIds[j])), `${groupIds[i]} ↔ ${groupIds[j]}`).toBe(false)
    }
  }

  for (const id of nodeIds) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(labels[id])
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(node.querySelector('rect')).toHaveClass('stroke-disabled')
    expect(box.height).toBe(32)
    // 반각 문자(ID)가 섞인 라벨은 1.15배로 어림한다(guide 「글자 폭의 여유」).
    const width = estimateTextWidth(labels[id], 10) * (/[ -~]/u.test(labels[id].replace(/ /gu, '')) ? 1.15 : 1)
    expect(width + 12, `${id} ${labels[id]}`).toBeLessThanOrEqual(box.width)
    expect(contains(groupBox(groupOf[id]), box), `${id} ${groupOf[id]} 박스 안`).toBe(true)
    for (const label of labelBoxes) expect(overlaps(label, box), `${id} ↔ ${label.id}`).toBe(false)
  }
  for (let i = 0; i < nodeIds.length; i += 1) {
    for (let j = i + 1; j < nodeIds.length; j += 1) {
      expect(overlaps(nodeBox(nodeIds[i]), nodeBox(nodeIds[j])), `${nodeIds[i]} ↔ ${nodeIds[j]}`).toBe(false)
    }
  }
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 요점: 선명한 행은 책임 표에서 고객이나 함께인 행이고, 「함께」 곁말이 붙는 행은 표에서 함께인 행이다.
// 선명한 행 수는 온-프레미스 > IaaS ≥ PaaS ≥ SaaS로 줄고, 「늘 고객」 묶음은 네 경우 모두 선명하며 「늘 공급자」 묶음은 온-프레미스에서만 선명하다.
// 행 이름과 묶음 이름의 말은 공유 책임 모델 본문에 있다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  for (const label of Object.values(labels)) expect(body, label).toContain(label)
  expect(body).toContain('늘 고객이 맡는')
  expect(body).toContain('늘 공급자가 맡는')
  expect(body).toContain('서비스 유형에 따라 맡는 쪽이 달라지는')
  expect(body).toContain('함께 맡는다')

  const sharpCounts: number[] = []
  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    const sharp = shownIds('[data-node][opacity="1"]', 'data-node')
    sharpCounts.push(sharp.length)
    expect(sharp, scenario.id).toEqual(nodeIds.filter((id) => assignment[id][scenario.id] !== '공급자'))
    expect(shownIds('[data-note]', 'data-note').map((id) => noteOwner[id]), scenario.id)
      .toEqual(nodeIds.filter((id) => assignment[id][scenario.id] === '함께'))
    for (const id of customerIds) expect(diagram().querySelector(`[data-node="${id}"]`), `${scenario.id} ${id}`).toHaveAttribute('opacity', '1')
    for (const id of providerIds) {
      expect(diagram().querySelector(`[data-node="${id}"]`), `${scenario.id} ${id}`).toHaveAttribute('opacity', scenario.id === 'on-premises' ? '1' : '0.25')
    }
    for (const group of diagram().querySelectorAll('[data-group]')) expect(group).not.toHaveAttribute('opacity')
  }
  const [onPremises, iaas, paas, saas] = sharpCounts
  expect(onPremises).toBeGreaterThan(iaas)
  expect(iaas).toBeGreaterThanOrEqual(paas)
  expect(paas).toBeGreaterThanOrEqual(saas)
}

describe('SharedResponsibilityDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<SharedResponsibilityDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 열 행이 모두 선명하고 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<SharedResponsibilityDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    expect(shownIds('[data-group]', 'data-group')).toEqual(groupIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('경로·화살표가 없다', async () => {
    render(<SharedResponsibilityDiagram />)
    for (const { label } of expectedScenarios) {
      await selectScenario(label)
      expect(diagram().querySelectorAll('path, marker, [data-path], [data-link]')).toHaveLength(0)
    }
  })

  it.each(expectedScenarios)('$label: 지정한 행만 선명하고 지정한 곁말과 캡션이 보인다', async (scenario) => {
    const { container } = render(<SharedResponsibilityDiagram />)
    await expectScenario(scenario, tallNotes, tallGroups.varies, 280, 484, container)
  })

  it('시나리오를 바꾸면 선명한 행과 곁말이 바뀌고 전체를 누르면 처음으로 돌아온다', async () => {
    const { container } = render(<SharedResponsibilityDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-note]', 'data-note')).toEqual(scenario.notes)
      expect(diagram().querySelectorAll('[data-node][opacity="1"]')).toHaveLength(scenario.nodes.length)
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드와 그룹 박스가 280×484 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<SharedResponsibilityDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 484')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 484], tallGroups)
  })

  it('선명한 행과 「함께」 곁말이 책임 표와 같고, 고객 몫은 온-프레미스에서 SaaS로 갈수록 줄어든다', async () => {
    render(<SharedResponsibilityDiagram />)
    await expectPoint()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<SharedResponsibilityDiagram />)
    const text = visualsByTopicId[topicId].diagrams['shared-responsibility']
    const ids = sharedResponsibilityScenarios.map(({ id }) => id).sort()
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
    expect(text.label).toBe('온-프레미스와 세 서비스 유형에서 고객과 공급자가 책임을 나눠 맡는 모습을 견주는 도식')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = sharedResponsibilityScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 공유 책임 모델 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: '온-프레미스와 세 서비스 유형에서 고객과 공급자가 책임을 나눠 맡는 모습을 견주는 도식' })

    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(screen.getAllByRole('figure')).toEqual([figure])
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

    it('440×188 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<SharedResponsibilityDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 188')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·그룹·곁말 id 집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<SharedResponsibilityDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 484')
      const tallNodeIds = shownIds('[data-node]', 'data-node')
      const tallGroupIds = shownIds('[data-group]', 'data-group')
      await selectScenario('SaaS')
      const tallNoteIds = shownIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 188')
      expect(shownIds('[data-node]', 'data-node')).toEqual(tallNodeIds)
      expect(shownIds('[data-group]', 'data-group')).toEqual(tallGroupIds)
      expect(shownIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
      expect(diagram().querySelectorAll('path')).toHaveLength(0)
    })

    it('노드와 그룹 박스가 440×188 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<SharedResponsibilityDiagram />)
      expectFits([0, 0, 440, 188], wideGroups)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 행·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<SharedResponsibilityDiagram />)
      await expectScenario(scenario, wideNotes, wideGroups.varies, 440, 188, container)
    })

    it('선명한 행과 「함께」 곁말이 책임 표와 같고, 고객 몫은 온-프레미스에서 SaaS로 갈수록 줄어든다', async () => {
      render(<SharedResponsibilityDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<SharedResponsibilityDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 484')
      await selectScenario('PaaS')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: 'PaaS' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(diagram().querySelector('[data-node="os"]')).toHaveAttribute('opacity', '0.25')
      expect(diagram().querySelector('[data-note="network-shared"]')).toHaveAttribute('x', String(wideNotes['network-shared'].x))
    })
  })
})
