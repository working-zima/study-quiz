import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { TemplateDeploymentDiagram, templateDeploymentScenarios } from './TemplateDeploymentDiagram'

const topicId = 'azure-infrastructure-as-code'
const anchorConceptId = `${topicId}.arm-templates`
const labels = {
  "template": "ARM 템플릿",
  "arm": "Azure Resource Manager",
  "vnet-1": "가상 네트워크 1",
  "vm-1": "VM 1",
  "storage-1": "스토리지 계정 1"
}
const noteLabels = {
  "validate-note": "먼저 검사한다",
  "vnet-note": "가상 네트워크가 먼저",
  "storage-note": "기대지 않는 것은 동시에",
  "redeploy-note": "하나 더 만들지 않는다"
}
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

const tallNotes: NotePlaces = {
  "validate-note": { "x": 148, "y": 72, "anchor": "start" },
  "vnet-note": { "x": 84, "y": 232, "anchor": "start" },
  "storage-note": { "x": 156, "y": 210, "anchor": "start" },
  "redeploy-note": { "x": 148, "y": 72, "anchor": "start" }
}
const wideNotes: NotePlaces = {
  "validate-note": { "x": 106, "y": 64, "anchor": "middle" },
  "vnet-note": { "x": 312, "y": 148, "anchor": "start" },
  "storage-note": { "x": 312, "y": 212, "anchor": "start" },
  "redeploy-note": { "x": 106, "y": 64, "anchor": "middle" }
}

const allNodes = Object.keys(labels)
const resources = ['vnet-1', 'vm-1', 'storage-1']
const pathEnds: Record<string, [string, string]> = {
  "submit": ["template", "arm"],
  "create-vnet": ["arm", "vnet-1"],
  "then-vm": ["vnet-1", "vm-1"],
  "create-storage": ["arm", "storage-1"]
}
const allPaths = Object.keys(pathEnds)
const question = "템플릿 하나를 배포하면 Resource Manager는 무엇을 할까?"
const idleCaption = "회사 A의 ARM 템플릿 하나에 가상 네트워크 1, VM 1, 스토리지 계정 1이 적혀 있다. 버튼을 고르면 Azure Resource Manager가 이 템플릿으로 하는 일을 하나씩 볼 수 있다."
const legend = "화살표는 템플릿을 넘기고 리소스를 만드는 방향이다. 가상 네트워크 1에서 VM 1로 가는 화살표는 만드는 순서를 뜻하며, 그 사이에서 VM을 가상 네트워크에 잇는 네트워크 인터페이스는 그림에서 뺐다."
const figureName = "ARM 템플릿 하나를 Azure Resource Manager에 넘기면 검사를 거쳐 가상 네트워크 1, VM 1, 스토리지 계정 1을 의존 관계에 맞춰 만들고, 다시 배포해도 같은 리소스를 하나 더 만들지 않는 모습"
const svgName = "ARM 템플릿과 Azure Resource Manager, 그리고 템플릿에 적힌 가상 네트워크 1, VM 1, 스토리지 계정 1이 있다"
const expectedScenarios = [
  {
    "id": "validate",
    "label": "배포하기 전에",
    "nodes": ["template", "arm"],
    "paths": ["submit"],
    "notes": ["validate-note"],
    "caption": "Azure Resource Manager는 ARM 템플릿을 받으면 배포를 시작하기 전에 먼저 템플릿을 검사하고, 검사를 통과한 템플릿만 배포한다. 흐린 세 리소스는 아직 만들어지기 전이다.",
    "sources": [anchorConceptId]
  },
  {
    "id": "order",
    "label": "만드는 순서",
    "nodes": ["arm", "vnet-1", "vm-1", "storage-1"],
    "paths": ["create-vnet", "then-vm", "create-storage"],
    "notes": ["vnet-note", "storage-note"],
    "caption": "VM 1은 가상 네트워크 1을 먼저 필요로 하므로 Azure Resource Manager는 가상 네트워크 1을 만든 뒤 VM 1을 만든다. 스토리지 계정 1은 다른 두 리소스와 의존 관계가 없어 기다리지 않고 함께 만든다.",
    "sources": [anchorConceptId]
  },
  {
    "id": "redeploy",
    "label": "다시 배포하면",
    "nodes": ["template", "arm", "vnet-1", "vm-1", "storage-1"],
    "paths": ["submit"],
    "notes": ["redeploy-note"],
    "caption": "같은 템플릿을 같은 리소스 그룹에 같은 값으로 다시 배포하면, Azure Resource Manager는 적힌 리소스를 그 설정으로 맞춘다. 세 리소스가 이미 그 설정이면 바꾸지 않고, 같은 리소스를 하나 더 만들지도 않는다.",
    "sources": [anchorConceptId]
  }
]

function diagram() {
  return screen.getByRole('img', { name: svgName })
}

async function selectScenario(label: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) })
}

function readBox(rect: Element): SvgBox {
  return {
    id: rect.getAttribute('data-group') ?? rect.parentElement?.getAttribute('data-node') ?? '',
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

// 곁말이 차지하는 상자. 반각 글자 여유(1.15배)를 넣고 기준점에 맞춰 편다. 높이는 글자 크기 9를 기준선 위로 잡는다.
function noteBox(text: Element): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9) * 1.15
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id: text.getAttribute('data-note')!, x: left, y: y - 9, width, height: 9 }
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

// 직교 경로를 꼭짓점 목록으로 편다. 경로 글자에는 M·H·V만 나온다.
function pointsOf(d: string) {
  const points: { x: number, y: number }[] = []
  for (const [, command, first, second] of d.matchAll(/([MHV])\s*(-?\d+)(?:\s+(-?\d+))?/g)) {
    const last = points[points.length - 1]
    if (command === 'M') points.push({ x: Number(first), y: Number(second) })
    else if (command === 'H') points.push({ x: Number(first), y: last.y })
    else points.push({ x: last.x, y: Number(first) })
  }
  return points
}

function pathPoints(id: string) {
  return pointsOf(diagram().querySelector(`[data-path="${id}"]`)!.getAttribute('d')!)
}

function onEdge(point: { x: number, y: number }, box: SvgBox) {
  const withinX = point.x >= box.x && point.x <= box.x + box.width
  const withinY = point.y >= box.y && point.y <= box.y + box.height
  return (withinX && (point.y === box.y || point.y === box.y + box.height)) || (withinY && (point.x === box.x || point.x === box.x + box.width))
}

function segmentBox(a: { x: number, y: number }, b: { x: number, y: number }): SvgBox {
  return { id: 'segment', x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), width: Math.abs(a.x - b.x), height: Math.abs(a.y - b.y) }
}

// 길이가 0인 축을 품은 선분도 잡도록 상자 경계를 포함해 견준다.
function segmentTouches(segment: SvgBox, box: SvgBox) {
  return segment.x <= box.x + box.width && box.x <= segment.x + segment.width && segment.y <= box.y + box.height && box.y <= segment.y + segment.height
}

// 경로 끝점이 노드 변 위에 있고, 어떤 선분도 다른 노드 상자 안을 지나지 않는다. 이 도식에는 그룹 박스가 없다. 지금 보이는 경로만 본다.
function expectPathGeometry() {
  for (const id of shownIds('[data-path]', 'data-path')) {
    const points = pathPoints(id)
    const [from, to] = pathEnds[id]
    expect(onEdge(points[0], nodeBox(from)), `${id} 시작점`).toBe(true)
    expect(onEdge(points[points.length - 1], nodeBox(to)), `${id} 끝점`).toBe(true)
    for (let index = 1; index < points.length; index += 1) {
      const segment = segmentBox(points[index - 1], points[index])
      for (const nodeId of allNodes.filter((node) => node !== from && node !== to)) {
        expect(segmentTouches(segment, nodeBox(nodeId)), `${id} ↔ ${nodeId}`).toBe(false)
      }
    }
  }
}

// 아래 단언들은 배치에 묶이지 않는다. 세로형과 가로형이 같은 기대값으로 통과해야 한다.
async function expectScenario(
  scenario: typeof expectedScenarios[number],
  places: NotePlaces,
  width: number,
  container: HTMLElement,
) {
  await selectScenario(scenario.label)

  for (const node of diagram().querySelectorAll('[data-node]')) {
    expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
  }
  expect(shownIds('[data-path]', 'data-path').sort()).toEqual([...scenario.paths].sort())
  expectPathGeometry()

  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  const shownNotes = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shownNotes.map((note) => note.getAttribute('data-note')).sort()).toEqual([...scenario.notes].sort())
  const boxes = shownNotes.map(noteBox)
  for (const note of shownNotes) {
    const id = note.getAttribute('data-note')! as NoteId
    expect(note.textContent).toBe(noteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', places[id].anchor)
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note.closest('[opacity]')).toBeNull()
    const box = noteBox(note)
    expect(box.x, id).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, id).toBeLessThanOrEqual(width)
    expect(box.y + box.height, id).toBeLessThanOrEqual(Number(diagram().getAttribute('viewBox')!.split(' ')[3]))
    for (const node of nodeBoxes) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const other of boxes.filter((candidate) => candidate.id !== id)) expect(overlaps(box, other), `${id} ↔ ${other.id}`).toBe(false)
  }
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 1.15배로 잡아도 상자 안에 들어간다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(5)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
  expect(diagram().querySelectorAll('[data-group]')).toHaveLength(0)

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(label, 10) * 1.15 + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
  }
}

function expectColors() {
  for (const id of allNodes) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

function opacityOf(id: string) {
  return diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')
}

// 요점: VM 1은 가상 네트워크 1에서 시작하는 경로(then-vm)로만 닿는다 — Azure Resource Manager에서 VM 1로 바로 가는 경로가 어느 장면에도 없다.
// 스토리지 계정 1로 가는 경로(create-storage)는 Azure Resource Manager에서 바로 오고 가상 네트워크 1·VM 1을 거치지 않는다.
// 배포하기 전에는 세 리소스가 모두 흐리다. 다시 배포하면 다섯이 모두 선명하되 리소스를 만드는 경로는 보이지 않고, 같은 라벨의 노드가 둘 생기지 않는다.
async function expectPoint() {
  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    for (const id of shownIds('[data-path]', 'data-path')) {
      const points = pathPoints(id)
      const start = points[0]
      const end = points[points.length - 1]
      if (onEdge(end, nodeBox('vm-1'))) {
        expect(id).toBe('then-vm')
        expect(onEdge(start, nodeBox('vnet-1')), id).toBe(true)
        expect(onEdge(start, nodeBox('arm')), id).toBe(false)
      }
      if (id === 'create-storage') {
        expect(onEdge(start, nodeBox('arm')), id).toBe(true)
        expect(onEdge(end, nodeBox('storage-1')), id).toBe(true)
        for (let index = 1; index < points.length; index += 1) {
          const segment = segmentBox(points[index - 1], points[index])
          expect(segmentTouches(segment, nodeBox('vnet-1')), 'create-storage ↔ vnet-1').toBe(false)
          expect(segmentTouches(segment, nodeBox('vm-1')), 'create-storage ↔ vm-1').toBe(false)
        }
      }
    }
    if (scenario.id === 'validate') {
      for (const id of resources) expect(opacityOf(id), id).toBe('0.25')
      expect(opacityOf('template')).toBe('1')
    }
    if (scenario.id === 'redeploy') {
      for (const id of allNodes) expect(opacityOf(id), id).toBe('1')
      expect(shownIds('[data-path]', 'data-path')).toEqual(['submit'])
    }
  }
  const nodeTexts = Array.from(diagram().querySelectorAll('[data-node] text'), (text) => text.textContent)
  expect(new Set(nodeTexts).size).toBe(nodeTexts.length)
  expect(pathEnds['then-vm']).toEqual(['vnet-1', 'vm-1'])
  expect(Object.entries(pathEnds).filter(([, [from, to]]) => from === 'arm' && to === 'vm-1')).toEqual([])
  for (const label of [...Object.values(labels), ...Object.values(noteLabels)]) {
    expect(label).not.toMatch(/`|Bicep|Terraform|증분|전체 모드|배포 스택|템플릿 사양/u)
  }
}

describe('TemplateDeploymentDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<TemplateDeploymentDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 경로와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<TemplateDeploymentDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual([...allNodes].sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expect(shownIds('[data-path]', 'data-path')).toEqual([])
    expect(shownIds('[data-note]', 'data-note')).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·경로·곁말이 보이고 그 밖의 노드는 흐리다', async (scenario) => {
    const { container } = render(<TemplateDeploymentDiagram />)
    await expectScenario(scenario, tallNotes, 280, container)
  })

  it('시나리오를 바꾸면 이전 경로와 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<TemplateDeploymentDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path').sort()).toEqual([...scenario.paths].sort())
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
    }
    await selectScenario('전체')

    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(shownIds('[data-note]', 'data-note')).toEqual([])
    expect(shownIds('[data-path]', 'data-path')).toEqual([])
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
    for (const { label } of expectedScenarios) expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'false')
  })

  it('세 장면의 선명한 노드·경로·곁말 조합이 서로 다르다', () => {
    const keys = expectedScenarios.map(({ nodes, paths, notes }) => JSON.stringify([[...nodes].sort(), [...paths].sort(), [...notes].sort()]))
    expect(new Set(keys).size).toBe(expectedScenarios.length)
  })

  it('모든 상자가 280×288 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<TemplateDeploymentDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 288')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 288])
    expectColors()
  })

  it('요점을 보인다', async () => {
    render(<TemplateDeploymentDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 경로가 자기 마커를 가리킨다', async () => {
    render(<><TemplateDeploymentDiagram /><TemplateDeploymentDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    const markerIds = figures.map((figure) => figure.querySelector('marker')!.id)

    expect(figures).toHaveLength(2)
    expect(new Set(markerIds).size).toBe(2)
    for (const [index, figure] of figures.entries()) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: expectedScenarios[0].label })) })
      const paths = figure.querySelectorAll('[data-path]')
      expect(paths).toHaveLength(expectedScenarios[0].paths.length)
      for (const path of paths) expect(path.getAttribute('marker-end')).toBe(`url(#${markerIds[index]})`)
    }
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<TemplateDeploymentDiagram />)
    const text = visualsByTopicId[topicId].diagrams['template-deployment']
    const ids = templateDeploymentScenarios.map(({ id }) => id).sort()
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
      const scenario = templateDeploymentScenarios.find(({ id }) => id === expected.id)!
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

  it('그림의 사실과 라벨이 개념 본문에 있다', () => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join(' ')

    for (const fact of [
      ...Object.values(labels).filter((label) => label !== 'ARM 템플릿'), '먼저 검사하고 검사를 통과한 템플릿만 배포한다',
      '템플릿에 적힌 의존 관계를 보고 먼저 필요한 리소스부터 만든다', '하나가 끝나기를 기다리지 않고 동시에 만든다',
      'VM 1은 가상 네트워크 1을 먼저 필요로 한다', '네트워크 인터페이스', '다른 두 리소스와 의존 관계가 없는 별도 계정',
      '가상 네트워크 1을 만든 뒤 VM 1을 만들고, 스토리지 계정 1은 기다리지 않고 함께 만든다',
      '템플릿에 적힌 리소스를 그 설정으로 맞춘다', '같은 리소스 그룹에 같은 이름과 설정으로 다시 배포', '같은 리소스를 하나 더 만들지도 않는다',
      '회사 A',
    ]) {
      expect(body, fact).toContain(fact)
    }
    expect(concept.name).toBe('ARM 템플릿')
  })

  it('주제 끝에 ARM 템플릿과 그 아래 Bicep이 이어지고, 진행 안내와 쓰지 않기로 한 것이 없다', () => {
    const concepts = topics.find(({ id }) => id === topicId)!.concepts
    const concept = concepts.find(({ id }) => id === anchorConceptId)!
    const bicep = concepts.find(({ id }) => id === `${topicId}.bicep`)!

    expect(concepts.map(({ id }) => id)).toEqual([`${topicId}.resource-manager`, `${topicId}.infrastructure-as-code`, anchorConceptId, `${topicId}.bicep`])
    expect(concept.parentId).toBeUndefined()
    expect(bicep.parentId).toBe(anchorConceptId)
    for (const item of [concept, bicep]) {
      expect(item.paragraphs.some((paragraph) => paragraph.startsWith('- ')), item.id).toBe(false)
      expect([item.summary, ...item.paragraphs].join(' '), item.id).not.toMatch(/Terraform|Blueprints|배포 스택|템플릿 사양|배포 모드|증분|전체 모드|what-if|멱등|트랜스파일|\*\*|\$schema|dependsOn/u)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })

    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.join('').replace(/\*\*|`/gu, ''))
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

    function ids(selector: string, attribute: string) {
      return shownIds(selector, attribute).sort()
    }

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×220 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<TemplateDeploymentDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 220')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·경로 id 집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<TemplateDeploymentDiagram />)
      const pathIds = new Set<string>()
      for (const scenario of expectedScenarios) {
        await selectScenario(scenario.label)
        for (const id of ids('[data-path]', 'data-path')) pathIds.add(id)
      }
      const tallNodes = ids('[data-node]', 'data-node')
      const tallPaths = [...pathIds].sort()

      act(() => change(true))

      const widePathIds = new Set<string>()
      for (const scenario of expectedScenarios) {
        await selectScenario(scenario.label)
        for (const id of ids('[data-path]', 'data-path')) widePathIds.add(id)
      }
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 220')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(tallNodes).toEqual([...allNodes].sort())
      expect([...widePathIds].sort()).toEqual(tallPaths)
      expect(tallPaths).toEqual([...allPaths].sort())
    })

    it('모든 rect가 440×220 viewBox 안에 있고 노드 라벨이 자기 상자 안에 들어간다', () => {
      render(<TemplateDeploymentDiagram />)
      expectFits([0, 0, 440, 220])
      expectColors()
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·경로·곁말·캡션을 보이고 곁말은 노드와 겹치지 않는다', async (scenario) => {
      const { container } = render(<TemplateDeploymentDiagram />)
      await expectScenario(scenario, wideNotes, 440, container)
    })

    it('요점을 보인다', async () => {
      render(<TemplateDeploymentDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<TemplateDeploymentDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 288')
      await selectScenario(expectedScenarios[2].label)
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: expectedScenarios[2].label })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      for (const note of diagram().querySelectorAll('[data-note]')) {
        expect(note).toHaveAttribute('x', String(wideNotes[note.getAttribute('data-note')! as NoteId].x))
      }
    })
  })
})
