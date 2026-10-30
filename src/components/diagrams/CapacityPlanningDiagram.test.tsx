import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { CapacityPlanningDiagram, capacityPlanningScenarios } from './CapacityPlanningDiagram'

const topicId = 'azure-cloud-computing'
const anchorConceptId = `${topicId}.consumption-based-model`
const months = [1, 2, 3, 4]
const needIds = months.map((month) => `need-${month}`)
const ownedIds = months.map((month) => `owned-${month}`)
const rentedIds = months.map((month) => `rented-${month}`)
const nodeIds = [...needIds, ...ownedIds, ...rentedIds]
const groupIds = ['need', 'owned', 'rented']
const labels: Record<string, string> = {
  'need-1': '1월 2대',
  'need-2': '2월 3대',
  'need-3': '3월 5대',
  'need-4': '4월 2대',
  'owned-1': '4대',
  'owned-2': '4대',
  'owned-3': '4대',
  'owned-4': '4대',
  'rented-1': '2대',
  'rented-2': '3대',
  'rented-3': '5대',
  'rented-4': '2대',
}
const groupLabels: Record<string, string> = {
  need: '필요한 서버',
  owned: '기존 데이터 센터 — 미리 갖춘 서버',
  rented: '클라우드 — 그달 빌린 서버',
}
const noteLabels: Record<string, string> = {
  'owned-note-1': '2대 남음',
  'owned-note-2': '1대 남음',
  'owned-note-3': '1대 모자람',
  'owned-note-4': '2대 남음',
}
const noteIds = Object.keys(noteLabels)

type Group = { x: number, y: number, width: number, height: number }
type Note = { x: number, y: number }
const tallGroups: Record<string, Group> = {
  need: { x: 6, y: 4, width: 268, height: 60 },
  owned: { x: 6, y: 72, width: 268, height: 72 },
  rented: { x: 6, y: 152, width: 268, height: 60 },
}
const wideGroups: Record<string, Group> = {
  need: { x: 14, y: 4, width: 412, height: 60 },
  owned: { x: 14, y: 72, width: 412, height: 72 },
  rented: { x: 14, y: 152, width: 412, height: 60 },
}
const tallNotes: Record<string, Note> = {
  'owned-note-1': { x: 41, y: 138 },
  'owned-note-2': { x: 107, y: 138 },
  'owned-note-3': { x: 173, y: 138 },
  'owned-note-4': { x: 239, y: 138 },
}
const wideNotes: Record<string, Note> = {
  'owned-note-1': { x: 66, y: 138 },
  'owned-note-2': { x: 166, y: 138 },
  'owned-note-3': { x: 266, y: 138 },
  'owned-note-4': { x: 366, y: 138 },
}

const question = '필요한 서버 수가 달마다 다르면, 미리 갖춘 서버와 클라우드에서 빌린 서버는 어떻게 다를까?'
const idleCaption = '넉 달 동안 회사 A에 필요한 서버 수를 맨 위 줄에, 같은 수요를 두 방식으로 맞춘 서버 수를 아래 두 줄에 두었다. 숫자는 예로 든 것이다. 버튼을 고르면 미리 갖춘 서버와 클라우드에서 빌린 서버가 달마다 필요한 양과 어떻게 맞는지 볼 수 있다.'
const legend = '세 줄에서 같은 열은 같은 달이다. 위 줄은 그달 필요한 서버, 가운데 줄은 기존 데이터 센터에 미리 갖춘 서버, 아래 줄은 그달 클라우드에서 빌린 서버의 대수다.'
const expectedScenarios = [
  {
    id: 'traditional', label: '기존 데이터 센터',
    nodes: [...needIds, ...ownedIds],
    notes: noteIds,
    caption: '기존 데이터 센터에 서버 4대를 미리 갖춰 둔 경우다. 필요한 서버가 적은 1월·2월·4월에는 서버가 남아 노는데, 그 서버에도 이미 돈을 썼다. 5대가 필요한 3월에는 1대가 모자라 앱이 느려진다.',
  },
  {
    id: 'cloud', label: '클라우드',
    nodes: [...needIds, ...rentedIds],
    notes: [] as string[],
    caption: '클라우드에서 달마다 필요한 만큼 빌린 경우다. 1월 2대, 2월 3대, 3월 5대, 4월 2대를 빌리고 필요가 줄면 돌려주므로 남는 서버도 모자라는 서버도 없고, 쓴 만큼만 낸다.',
  },
]

function diagram() {
  return screen.getByRole('img', { name: '1월부터 4월까지 필요한 서버 수를 위 줄에, 기존 데이터 센터에 미리 갖춘 서버 4대를 가운데 줄에, 달마다 클라우드에서 빌린 서버 수를 아래 줄에 같은 달끼리 세로로 맞춰 놓은 모습' })
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

function center(box: SvgBox) {
  return box.x + box.width / 2
}

function count(label: string) {
  return Number(label.match(/(\d+)대/u)![1])
}

// 보이는 곁말이 지정한 id·글·자리이고, 가운데 줄 그룹 박스 안에서 노드·그룹 라벨·다른 곁말과 겹치지 않는다.
function expectNotes(ids: string[], places: Record<string, Note>, owned: Group, width: number, height: number) {
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
    expect(contains({ id: 'owned', ...owned }, box), `${id} 가운데 줄 박스 안`).toBe(true)
    for (const node of nodeBoxes) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const label of labelBoxes) expect(overlaps(box, label), `${id} ↔ ${label.id}`).toBe(false)
    for (const other of shown.filter((element) => element !== note)) expect(overlaps(box, textBox(other)), `${id} ↔ 다른 곁말`).toBe(false)
  }
}

async function expectScenario(
  scenario: typeof expectedScenarios[number],
  places: Record<string, Note>,
  owned: Group,
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
  expectNotes(scenario.notes, places, owned, width, height)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨이 자기 상자 안에 들어가며, 줄마다 자기 그룹 박스 안에 든다.
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
    expect(estimateTextWidth(labels[id], 10) + 12, `${id} ${labels[id]}`).toBeLessThanOrEqual(box.width)
    const row = id.split('-')[0]
    expect(contains(groupBox(row), box), `${id} ${row} 박스 안`).toBe(true)
    for (const label of labelBoxes) expect(overlaps(label, box), `${id} ↔ ${label.id}`).toBe(false)
  }
  for (let i = 0; i < nodeIds.length; i += 1) {
    for (let j = i + 1; j < nodeIds.length; j += 1) {
      expect(overlaps(nodeBox(nodeIds[i]), nodeBox(nodeIds[j])), `${nodeIds[i]} ↔ ${nodeIds[j]}`).toBe(false)
    }
  }
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 요점: 같은 달은 같은 열에 선다. 기존 데이터 센터에서는 곁말 넷이 자기 열 아래에 놓이고,
// 「모자람」은 필요한 대수(5)가 미리 갖춘 대수(4)보다 큰 열 하나뿐이며 나머지 셋은 「남음」이고 그 차이가 곁말의 대수다.
// 클라우드에서는 열마다 빌린 대수가 필요한 대수와 같다. 예시 값은 개념 본문에 있는 그대로다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  expect(body).toContain('1월 2대, 2월 3대, 3월 5대, 4월 2대')
  expect(body).toContain('서버 4대를 미리 갖춰 두면')
  expect(body).toContain('남아 놀고')
  expect(body).toContain('1대가 모자라')

  for (const month of months) {
    const x = center(nodeBox(`need-${month}`))
    expect(center(nodeBox(`owned-${month}`)), `${month}월 가운데 줄`).toBe(x)
    expect(center(nodeBox(`rented-${month}`)), `${month}월 아래 줄`).toBe(x)
    expect(labels[`need-${month}`].startsWith(`${month}월 `)).toBe(true)
  }

  await selectScenario('기존 데이터 센터')
  const notes = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(notes).toHaveLength(4)
  let short = 0
  notes.forEach((note, index) => {
    const month = months[index]
    const need = count(diagram().querySelector(`[data-node="need-${month}"] text`)!.textContent!)
    const owned = count(diagram().querySelector(`[data-node="owned-${month}"] text`)!.textContent!)
    const owner = nodeBox(`owned-${month}`)
    expect(Number(note.getAttribute('x')), `${month}월 곁말 열`).toBe(center(owner))
    expect(textBox(note).y, `${month}월 곁말은 노드 아래`).toBeGreaterThanOrEqual(owner.y + owner.height)
    const [, amount, state] = note.textContent!.match(/^(\d+)대 (남음|모자람)$/u)!
    if (state === '모자람') {
      short += 1
      expect(need, `${month}월`).toBeGreaterThan(owned)
      expect(Number(amount)).toBe(need - owned)
    } else {
      expect(need, `${month}월`).toBeLessThan(owned)
      expect(Number(amount)).toBe(owned - need)
    }
  })
  expect(short).toBe(1)
  for (const id of rentedIds) expect(diagram().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', '0.25')

  await selectScenario('클라우드')
  for (const month of months) {
    const need = diagram().querySelector(`[data-node="need-${month}"] text`)!.textContent!
    expect(diagram().querySelector(`[data-node="rented-${month}"] text`)!.textContent, `${month}월`).toBe(need.replace(`${month}월 `, ''))
  }
  for (const id of ownedIds) expect(diagram().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', '0.25')
  expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
}

describe('CapacityPlanningDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<CapacityPlanningDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 세 줄의 노드가 모두 선명하고 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<CapacityPlanningDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    expect(shownIds('[data-group]', 'data-group')).toEqual(groupIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('경로·화살표가 없다', async () => {
    render(<CapacityPlanningDiagram />)
    for (const { label } of expectedScenarios) {
      await selectScenario(label)
      expect(diagram().querySelectorAll('path, marker, [data-path], [data-link]')).toHaveLength(0)
    }
  })

  it.each(expectedScenarios)('$label: 지정한 노드만 선명하고 지정한 곁말과 캡션이 보인다', async (scenario) => {
    const { container } = render(<CapacityPlanningDiagram />)
    await expectScenario(scenario, tallNotes, tallGroups.owned, 280, 216, container)
  })

  it('시나리오를 바꾸면 선명한 줄과 곁말이 바뀌고 전체를 누르면 처음으로 돌아온다', async () => {
    const { container } = render(<CapacityPlanningDiagram />)
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

  it('노드와 그룹 박스가 280×216 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<CapacityPlanningDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 216')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 216], tallGroups)
  })

  it('같은 달은 같은 열에 서고, 남는 대수와 모자란 대수가 필요한 대수와 미리 갖춘 대수의 차이와 같다', async () => {
    render(<CapacityPlanningDiagram />)
    await expectPoint()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<CapacityPlanningDiagram />)
    const text = visualsByTopicId[topicId].diagrams['capacity-planning']
    const ids = capacityPlanningScenarios.map(({ id }) => id).sort()
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
    expect(text.label).toBe('필요한 서버 수를 미리 갖춘 서버와 클라우드에서 빌린 서버로 맞추는 도식')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = capacityPlanningScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 사용량 기반 모델 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: '필요한 서버 수를 미리 갖춘 서버와 클라우드에서 빌린 서버로 맞추는 도식' })

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

    it('440×216 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<CapacityPlanningDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 216')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·그룹·곁말 id 집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<CapacityPlanningDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 216')
      const tallNodeIds = shownIds('[data-node]', 'data-node')
      const tallGroupIds = shownIds('[data-group]', 'data-group')
      await selectScenario('기존 데이터 센터')
      const tallNoteIds = shownIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 216')
      expect(shownIds('[data-node]', 'data-node')).toEqual(tallNodeIds)
      expect(shownIds('[data-group]', 'data-group')).toEqual(tallGroupIds)
      expect(shownIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
      expect(diagram().querySelectorAll('path')).toHaveLength(0)
    })

    it('노드와 그룹 박스가 440×216 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<CapacityPlanningDiagram />)
      expectFits([0, 0, 440, 216], wideGroups)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<CapacityPlanningDiagram />)
      await expectScenario(scenario, wideNotes, wideGroups.owned, 440, 216, container)
    })

    it('같은 달은 같은 열에 서고, 남는 대수와 모자란 대수가 필요한 대수와 미리 갖춘 대수의 차이와 같다', async () => {
      render(<CapacityPlanningDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<CapacityPlanningDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 216')
      await selectScenario('기존 데이터 센터')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '기존 데이터 센터' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(diagram().querySelector('[data-node="rented-1"]')).toHaveAttribute('opacity', '0.25')
      expect(diagram().querySelector('[data-note="owned-note-3"]')).toHaveAttribute('x', String(wideNotes['owned-note-3'].x))
    })
  })
})
