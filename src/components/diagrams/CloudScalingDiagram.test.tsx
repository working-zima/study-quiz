import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { CloudScalingDiagram, cloudScalingScenarios } from './CloudScalingDiagram'

const topicId = 'azure-cloud-benefits'
const anchorConceptId = `${topicId}.scalability`
const nodeIds = ['vm-1', 'vm-2', 'vm-3']
const groupIds = ['vms']
const labels: Record<string, string> = {
  'vm-1': 'VM 1',
  'vm-2': 'VM 2',
  'vm-3': 'VM 3',
}
const groupLabels: Record<string, string> = {
  vms: '회사 A의 웹사이트를 실행하는 VM',
}
const noteLabels: Record<string, string> = {
  'vm-1-note': 'CPU와 RAM을 더한다',
  'vm-2-note': '더한 VM',
  'vm-3-note': '더한 VM',
}

type Group = { x: number, y: number, width: number, height: number }
type Note = { x: number, y: number }
const tallGroup: Group = { x: 6, y: 4, width: 268, height: 80 }
const wideGroup: Group = { x: 14, y: 4, width: 412, height: 80 }
const tallNotes: Record<string, Note> = {
  'vm-1-note': { x: 62, y: 74 },
  'vm-2-note': { x: 140, y: 74 },
  'vm-3-note': { x: 218, y: 74 },
}
const wideNotes: Record<string, Note> = {
  'vm-1-note': { x: 100, y: 74 },
  'vm-2-note': { x: 220, y: 74 },
  'vm-3-note': { x: 340, y: 74 },
}

const question = 'VM 한 대로 수요를 감당하지 못하면, 어떻게 늘릴 수 있을까?'
const idleCaption = '회사 A의 웹사이트를 VM 1 한 대로 실행하다가 사용자가 늘어 VM 1로는 감당하지 못하게 된 상황이다. VM 대수는 예로 든 것이다. 버튼을 고르면 수직 크기 조정과 수평 크기 조정이 각각 무엇을 늘리는지 볼 수 있다.'
const legend = '상자 하나가 VM 한 대다. VM 2와 VM 3은 수평 크기 조정에서 더하는 VM이다. 흐린 상자는 그 방식에서 쓰지 않는 VM이고, 상자 아래 글은 그 VM에 하는 일이다.'
const expectedScenarios = [
  {
    id: 'vertical', label: '수직 크기 조정',
    nodes: ['vm-1'],
    notes: ['vm-1-note'],
    caption: 'VM 수는 그대로 두고 VM 1에 CPU와 RAM을 더해 VM 1 한 대의 성능을 올린다. 이것이 스케일 업이다. 필요한 양을 너무 크게 잡았다면 CPU와 RAM을 줄이는데, 이것이 스케일 다운이다.',
  },
  {
    id: 'horizontal', label: '수평 크기 조정',
    nodes: ['vm-1', 'vm-2', 'vm-3'],
    notes: ['vm-2-note', 'vm-3-note'],
    caption: '같은 웹사이트를 실행하는 VM 2와 VM 3을 더해 VM을 세 대로 늘린다. 이것이 스케일 아웃이고, 자동으로도 사람이 직접 손으로도 할 수 있다. 수요가 줄면 더했던 VM을 빼는데, 이것이 스케일 인이다.',
  },
]

function diagram() {
  return screen.getByRole('img', { name: '회사 A의 웹사이트를 실행하는 VM 1, VM 2, VM 3을 한 줄에 나란히 놓은 모습' })
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

// 보이는 곁말이 지정한 id·글·자리이고, 그룹 박스 안에서 노드·그룹 라벨·다른 곁말과 겹치지 않는다.
function expectNotes(ids: string[], places: Record<string, Note>, group: Group, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note'))).toEqual(ids)
  const labelBoxes = Array.from(diagram().querySelectorAll('[data-group-label]'), textBox)
  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  for (const note of shown) {
    const id = note.getAttribute('data-note')!
    const box = textBox(note)
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
    expect(contains({ id: 'vms', ...group }, box), `${id} 그룹 박스 안`).toBe(true)
    for (const node of nodeBoxes) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const label of labelBoxes) expect(overlaps(box, label), `${id} ↔ ${label.id}`).toBe(false)
    for (const other of shown.filter((element) => element !== note)) expect(overlaps(box, textBox(other)), `${id} ↔ 다른 곁말`).toBe(false)
  }
}

async function expectScenario(
  scenario: typeof expectedScenarios[number],
  places: Record<string, Note>,
  group: Group,
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
  for (const element of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(element).not.toHaveAttribute('opacity')
  expect(diagram().querySelectorAll('path')).toHaveLength(0)
  expectNotes(scenario.notes, places, group, width, height)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨이 자기 상자 안에 들어가며, 노드가 그룹 박스 안에 든다.
// 반각 문자가 섞인 라벨은 화면에서 어림보다 넓으므로(guide 「글자 폭의 여유」) 그룹 라벨도 반각 몫을 1.15배로 잡아 본다.
function expectFits(viewBox: [number, number, number, number], group: Group) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])

  expect(shownIds('[data-group]', 'data-group')).toEqual(groupIds)
  const groupRect = diagram().querySelector('[data-group="vms"]')!
  expect(readBox(groupRect)).toEqual({ id: 'vms', ...group })
  expect(groupRect).toHaveClass('fill-none', 'stroke-disabled')
  expect(groupRect.closest('[opacity]')).toBeNull()
  const label = diagram().querySelector('[data-group-label="vms"]')!
  expect(label.textContent).toBe(groupLabels.vms)
  expect(label).toHaveAttribute('font-size', '9')
  expect(label).toHaveClass('fill-muted')
  const labelBox = textBox(label)
  const halfWidth = [...groupLabels.vms].filter((character) => estimateTextWidth(character, 9) < 9).length * 9 * 0.55
  expect(contains(readBox(groupRect), { ...labelBox, width: labelBox.width + halfWidth * 0.15 }), '그룹 라벨').toBe(true)

  for (const id of nodeIds) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(labels[id])
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(node.querySelector('rect')).toHaveClass('stroke-disabled')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(labels[id], 10) + 12, `${id} ${labels[id]}`).toBeLessThanOrEqual(box.width)
    expect(contains(readBox(groupRect), box), `${id} 그룹 박스 안`).toBe(true)
    expect(overlaps(labelBox, box), `${id} ↔ 그룹 라벨`).toBe(false)
  }
  for (let i = 0; i < nodeIds.length; i += 1) {
    for (let j = i + 1; j < nodeIds.length; j += 1) {
      expect(overlaps(nodeBox(nodeIds[i]), nodeBox(nodeIds[j])), `${nodeIds[i]} ↔ ${nodeIds[j]}`).toBe(false)
    }
  }
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

function center(box: SvgBox) {
  return box.x + box.width / 2
}

function inColumn(note: Element, owner: SvgBox) {
  const x = Number(note.getAttribute('x'))
  return x >= owner.x && x <= owner.x + owner.width
}

// 요점: 수직 크기 조정은 VM 한 대(VM 1)만 쓰고 그 VM에 CPU와 RAM을 더한다. 수평 크기 조정은 VM을 셋으로 늘리고,
// 더한 VM 둘 아래에 곁말이 하나씩 놓인다. 두 시나리오가 함께 보이는 곁말은 없다. 예시는 개념 본문에 있는 그대로다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  expect(body).toContain('VM 1에 CPU와 RAM을 더해')
  expect(body).toContain('VM 2와 VM 3을 더해')
  expect(body).toContain('스케일 업')
  expect(body).toContain('스케일 아웃')
  expect(body).toContain('VM 대수는 예로 든 것이다')

  await selectScenario('수직 크기 조정')
  expect(diagram().querySelectorAll('[data-node][opacity="1"]')).toHaveLength(1)
  expect(diagram().querySelector('[data-node="vm-1"]')).toHaveAttribute('opacity', '1')
  expect(diagram().querySelector('[data-node="vm-2"]')).toHaveAttribute('opacity', '0.25')
  expect(diagram().querySelector('[data-node="vm-3"]')).toHaveAttribute('opacity', '0.25')
  const verticalNotes = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(verticalNotes).toHaveLength(1)
  expect(verticalNotes[0].textContent).toContain('CPU')
  expect(verticalNotes[0].textContent).toContain('RAM')
  expect(inColumn(verticalNotes[0], nodeBox('vm-1')), 'VM 1 열').toBe(true)
  expect(Number(verticalNotes[0].getAttribute('x'))).toBe(center(nodeBox('vm-1')))
  expect(textBox(verticalNotes[0]).y, '곁말은 노드 아래').toBeGreaterThanOrEqual(nodeBox('vm-1').y + 32)
  const verticalIds = verticalNotes.map((note) => note.getAttribute('data-note'))

  await selectScenario('수평 크기 조정')
  expect(diagram().querySelectorAll('[data-node][opacity="1"]')).toHaveLength(3)
  const horizontalNotes = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(horizontalNotes).toHaveLength(2)
  expect(Number(horizontalNotes[0].getAttribute('x'))).toBe(center(nodeBox('vm-2')))
  expect(Number(horizontalNotes[1].getAttribute('x'))).toBe(center(nodeBox('vm-3')))
  for (const note of horizontalNotes) {
    expect(textBox(note).y, '곁말은 노드 아래').toBeGreaterThanOrEqual(nodeBox('vm-1').y + 32)
    expect(verticalIds).not.toContain(note.getAttribute('data-note'))
  }
  for (const note of horizontalNotes) expect(inColumn(note, nodeBox('vm-1')), 'VM 1 열에는 없다').toBe(false)
}

describe('CloudScalingDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<CloudScalingDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 VM 셋이 모두 선명하고 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<CloudScalingDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    expect(shownIds('[data-group]', 'data-group')).toEqual(groupIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('경로·화살표가 없다', async () => {
    render(<CloudScalingDiagram />)
    expect(diagram().querySelectorAll('path, marker, [data-path], [data-link]')).toHaveLength(0)
    for (const { label } of expectedScenarios) {
      await selectScenario(label)
      expect(diagram().querySelectorAll('path, marker, [data-path], [data-link]')).toHaveLength(0)
    }
  })

  it.each(expectedScenarios)('$label: 지정한 노드만 선명하고 지정한 곁말과 캡션이 보인다', async (scenario) => {
    const { container } = render(<CloudScalingDiagram />)
    await expectScenario(scenario, tallNotes, tallGroup, 280, 88, container)
  })

  it('시나리오를 바꾸면 선명한 VM과 곁말이 바뀌고 전체를 누르면 처음으로 돌아온다', async () => {
    const { container } = render(<CloudScalingDiagram />)
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

  it('노드와 그룹 박스가 280×88 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<CloudScalingDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 88')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 88], tallGroup)
  })

  it('수직 크기 조정은 VM 1 한 대에 CPU와 RAM을 더하고, 수평 크기 조정은 VM 2·VM 3을 더한다', async () => {
    render(<CloudScalingDiagram />)
    await expectPoint()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<CloudScalingDiagram />)
    const text = visualsByTopicId[topicId].diagrams['cloud-scaling']
    const ids = cloudScalingScenarios.map(({ id }) => id).sort()
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
    expect(text.label).toBe('수직 크기 조정과 수평 크기 조정을 견주는 도식')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = cloudScalingScenarios.find(({ id }) => id === expected.id)!
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

  it('두 번 렌더해도 같은 요소 id가 겹치지 않는다', () => {
    const { container } = render(<><CloudScalingDiagram /><CloudScalingDiagram /></>)
    const elementIds = Array.from(container.querySelectorAll('[id]'), (element) => element.id)

    expect(new Set(elementIds).size).toBe(elementIds.length)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 확장성 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: '수직 크기 조정과 수평 크기 조정을 견주는 도식' })

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

    it('440×88 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<CloudScalingDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 88')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·그룹·곁말 id 집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<CloudScalingDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 88')
      const tallNodeIds = shownIds('[data-node]', 'data-node')
      const tallGroupIds = shownIds('[data-group]', 'data-group')
      await selectScenario('수평 크기 조정')
      const tallNoteIds = shownIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 88')
      expect(shownIds('[data-node]', 'data-node')).toEqual(tallNodeIds)
      expect(shownIds('[data-group]', 'data-group')).toEqual(tallGroupIds)
      expect(shownIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
      expect(diagram().querySelectorAll('path')).toHaveLength(0)
    })

    it('노드와 그룹 박스가 440×88 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<CloudScalingDiagram />)
      expectFits([0, 0, 440, 88], wideGroup)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<CloudScalingDiagram />)
      await expectScenario(scenario, wideNotes, wideGroup, 440, 88, container)
    })

    it('수직 크기 조정은 VM 1 한 대에 CPU와 RAM을 더하고, 수평 크기 조정은 VM 2·VM 3을 더한다', async () => {
      render(<CloudScalingDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<CloudScalingDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 88')
      await selectScenario('수직 크기 조정')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '수직 크기 조정' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(diagram().querySelector('[data-node="vm-2"]')).toHaveAttribute('opacity', '0.25')
      expect(diagram().querySelector('[data-note="vm-1-note"]')).toHaveAttribute('x', String(wideNotes['vm-1-note'].x))
    })
  })
})
