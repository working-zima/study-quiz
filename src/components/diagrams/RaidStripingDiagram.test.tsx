import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { RaidStripingDiagram, raidStripingScenarios } from './RaidStripingDiagram'

const topicId = 'raid-storage'
const anchorConceptId = `${topicId}.raid-0`
const labels: Record<string, string> = {
  'a1': 'A1',
  'a2': 'A2',
  'a3': 'A3',
  'a4': 'A4',
  'a5': 'A5',
  'a6': 'A6',
  'a7': 'A7',
  'a8': 'A8',
}
const groupLabels: Record<string, string> = {
  'disk0': 'DISK0',
  'disk1': 'DISK1',
  'disk2': 'DISK2',
  'disk3': 'DISK3',
}
const noteLabels: Record<string, string> = {
  'stripe-note': '조각을 디스크마다 차례로 번갈아 놓는다',
  'fail-mark': '고장',
  'fail-note': 'A2와 A6을 잃어 파일을 온전히 읽지 못한다',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
// 디스크 박스마다 조각 칸 둘을 담는다 — 조각은 디스크를 차례로 돌며 놓이므로 A1·A5가 DISK0, A2·A6이 DISK1, A3·A7이 DISK2, A4·A8이 DISK3에 있다.
const members: Record<string, string[]> = {
  'disk0': ['a1', 'a5'],
  'disk1': ['a2', 'a6'],
  'disk2': ['a3', 'a7'],
  'disk3': ['a4', 'a8'],
}
// 「고장」 곁말은 고장 난 DISK1의 박스 안, 디스크 이름 옆에 붙는다. 나머지 곁말은 디스크 박스들 아래의 빈 줄에 둔다.
const noteInside: Record<string, string> = {
  'fail-mark': 'disk1',
}

const question = 'RAID 0은 파일 조각을 디스크에 어떻게 놓을까?'
const figureName = 'RAID 0이 파일 조각 A1~A8을 DISK0~DISK3에 차례로 번갈아 놓는 모습과, DISK1 하나가 고장 났을 때 무엇을 잃는지 견주는 도식'
const svgName = 'DISK0·DISK1·DISK2·DISK3 박스마다 조각 칸 둘(A1·A5, A2·A6, A3·A7, A4·A8)을 둔 그림'
const idleCaption = '2TB 디스크 DISK0~DISK3 넷을 RAID 0으로 묶고 파일 하나를 쓰니 조각 A1~A8이 생겼다. 버튼으로 장면을 고르면 조각이 놓인 차례와, 디스크 하나가 고장 났을 때 무엇을 잃는지 볼 수 있다.'
const legend = '박스 하나가 디스크 하나이고, 칸 하나가 조각 하나다. 디스크 이름과 조각 이름은 예로 붙인 이름표다.'
const expectedScenarios = [
  {
    id: 'stripe', label: '나눠 놓기',
    nodes: ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8'],
    notes: ['stripe-note'],
    caption: 'A1~A4를 DISK0부터 DISK3까지 하나씩 놓아 첫째 줄을 채우고, A5부터 다시 DISK0으로 돌아가 둘째 줄을 채운다. 이어진 조각이 서로 다른 디스크에 있으므로, 이 파일을 읽을 때 네 디스크가 저마다 자기 조각을 함께 읽는다.',
  },
  {
    id: 'fail', label: '디스크 하나의 고장',
    nodes: ['a1', 'a3', 'a4', 'a5', 'a7', 'a8'],
    notes: ['fail-mark', 'fail-note'],
    caption: 'DISK1이 고장 나면 그 디스크에 있던 A2와 A6을 잃는다. RAID 0에는 사본도 패리티도 없어 잃은 조각을 다시 만들 수 없으므로, 나머지 세 디스크가 멀쩡해도 이 파일을 온전히 읽지 못한다.',
  },
]

const svg = () => screen.getByRole('img', { name: svgName })
const select = async (label: string) => { await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) }) }

function readBox(rect: Element, id = ''): SvgBox {
  return {
    id,
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

const nodeBox = (id: string) => readBox(svg().querySelector(`[data-node="${id}"] rect`)!, id)
const groupBox = (id: string) => readBox(svg().querySelector(`[data-group="${id}"]`)!, id)
const label = (id: string) => svg().querySelector(`[data-node="${id}"] text`)!.textContent!
const groupLabel = (id: string) => svg().querySelector(`[data-group-label="${id}"]`)!.textContent!
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note')!)
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)!
const opacity = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function contains(outer: SvgBox, inner: SvgBox) {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height
}

// 곁말·그룹 라벨(9)의 가로 범위. 반각 문자가 섞이므로 어림값의 1.15배로 잡는다.
function textBox(text: Element, id: string): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9) * 1.15
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id, x: left, y: y - 9, width, height: 9 }
}

const groupLabelBox = (id: string) => textBox(svg().querySelector(`[data-group-label="${id}"]`)!, `${id}-label`)

// 이 칸이 어느 디스크 박스 안에 놓였는지 좌표로 읽는다.
function diskOf(cell: string) {
  return groupIds.find((group) => contains(groupBox(group), nodeBox(cell)))
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
  return (nextMatches: boolean) => {
    mediaQuery.matches = nextMatches
    act(() => listeners.forEach((listener) => listener(Object.assign(new Event('change'), { matches: nextMatches, media: mediaQuery.media }) as MediaQueryListEvent)))
  }
}

function layoutTests(wide: boolean) {
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 136] : [0, 0, 280, 236]

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<RaidStripingDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 칸이 모두 선명하고 곁말 없이 선택 안내가 나오며, 화살표는 어느 장면에도 없다', async () => {
    const { container } = render(<RaidStripingDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      expect(svg().querySelectorAll('path, marker')).toHaveLength(0)
    }
  })

  it.each(expectedScenarios)('$label: 고른 칸·곁말만 보이고 디스크 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<RaidStripingDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownNotes()).toEqual(scenario.notes)
    for (const id of scenario.notes) {
      expect(note(id).textContent).toBe(noteLabels[id])
      expect(note(id)).toHaveAttribute('font-size', '9')
    }
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·디스크 이름·곁말이 자리에 들어간다`, async () => {
    render(<RaidStripingDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const group of groupIds) {
        const inside = members[group].includes(id)
        expect(contains(groupBox(group), nodeBox(id)), `${id} ⊂ ${group}`).toBe(inside)
        if (!inside) expect(overlaps(groupBox(group), nodeBox(id)), `${id}는 ${group} 박스 밖`).toBe(false)
      }
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    for (const id of groupIds) {
      for (const other of groupIds.filter((otherId) => otherId !== id)) expect(overlaps(groupBox(id), groupBox(other)), `${id} ↔ ${other}`).toBe(false)
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) {
        const nodeArea = nodeBox(node)
        expect(overlaps(box, { ...nodeArea, y: nodeArea.y - 4, height: nodeArea.height + 8 }), `${id} 라벨 ↔ ${node}`).toBe(false)
      }
    }
    // 곁말은 viewBox 안에 들고, 노드와는 위아래 4 이상 띄우며, 디스크 이름과 겹치지 않는다.
    // 「고장」은 DISK1 박스 안에, 나머지는 디스크 박스 모두의 밖에 둔다.
    const seen: string[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const visible = scenario.notes.map((id) => textBox(note(id), id))
      seen.push(...scenario.notes)
      expect(boxesOutsideViewBox(visible, viewBox)).toEqual([])
      for (const box of visible) {
        for (const group of groupIds) {
          if (noteInside[box.id] === group) expect(contains(groupBox(group), box), `${box.id} ⊂ ${group}`).toBe(true)
          else expect(overlaps(box, groupBox(group)), `${box.id}는 ${group} 박스 밖`).toBe(false)
          expect(overlaps(box, groupLabelBox(group)), `${box.id} ↔ ${group} 라벨`).toBe(false)
        }
        for (const node of nodeIds) {
          const nodeArea = nodeBox(node)
          expect(overlaps(box, { ...nodeArea, y: nodeArea.y - 4, height: nodeArea.height + 8 }), `${box.id} ↔ ${node}`).toBe(false)
        }
      }
    }
    expect([...seen].sort()).toEqual([...noteIds].sort())
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('디스크마다 조각 칸 둘이 같은 열에 빈틈없이 위아래로 붙어 있다', () => {
    render(<RaidStripingDiagram />)
    for (const group of groupIds) {
      const [upper, lower] = members[group].map(nodeBox)
      expect(upper.x, group).toBe(lower.x)
      expect(upper.width, group).toBe(lower.width)
      expect(upper.y + upper.height, group).toBe(lower.y)
    }
  })

  // 요점: 조각 A1~A8은 디스크를 차례로 돌며 놓인다 — A1이 DISK0, A2가 DISK1, A3이 DISK2, A4가 DISK3, A5가 다시 DISK0이다(칸이 어느 디스크 박스 안에 있는지 좌표로 읽는다).
  // 디스크 하나의 고장에서 흐린 칸은 DISK1 박스 안의 둘뿐이다.
  it('조각이 디스크를 번갈아 놓이고, DISK1이 고장 나면 그 디스크의 칸 둘만 잃는다', async () => {
    render(<RaidStripingDiagram />)
    const order = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8']
    expect(order.map(diskOf)).toEqual(['disk0', 'disk1', 'disk2', 'disk3', 'disk0', 'disk1', 'disk2', 'disk3'])
    // 같은 디스크 안에서는 앞 바퀴의 조각이 위 칸, 다음 바퀴의 조각이 아래 칸이다.
    for (let index = 0; index < 4; index += 1) expect(nodeBox(order[index]).y, order[index]).toBeLessThan(nodeBox(order[index + 4]).y)

    await select('디스크 하나의 고장')
    const dim = nodeIds.filter((id) => opacity(id) === '0.25')
    expect(dim.sort()).toEqual(['a2', 'a6'])
    for (const id of dim) expect(diskOf(id), id).toBe('disk1')
    expect(textBox(note('fail-mark'), 'fail-mark').x).toBeGreaterThan(groupLabelBox('disk1').x + groupLabelBox('disk1').width)

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const phrase of ['2TB 디스크 `DISK0`~`DISK3`', '조각 A1~A8', '8TB', 'A5는 다시 `DISK0`으로 돌아가고', '`DISK1`이 고장 나면 A2와 A6을 잃는데', '예로 든 값']) {
      expect(body, phrase).toContain(phrase)
    }
  })
}

describe('RaidStripingDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<RaidStripingDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 236')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('디스크 하나의 고장')
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 136')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '디스크 하나의 고장' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownNotes()).toEqual(tallNotes)
      for (const id of nodeIds) expect(opacity(id), id).toBe(['a2', 'a6'].includes(id) ? '0.25' : '1')
    })
  })

  it('두 번 렌더해도 장면을 따로 고른다', async () => {
    render(<><RaidStripingDiagram /><RaidStripingDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    await act(async () => { await userEvent.click(within(figures[0]).getByRole('button', { name: '디스크 하나의 고장' })) })
    expect(within(figures[0]).getByRole('button', { name: '디스크 하나의 고장' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(figures[1]).getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(figures[1].querySelectorAll('[data-note]')).toHaveLength(0)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<RaidStripingDiagram />)
    const text = visualsByTopicId[topicId].diagrams['raid-striping']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(raidStripingScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.label).toBe(figureName)
    expect(text.svgLabel).toBe(svgName)
    expect(text.sources).toEqual([anchorConceptId])
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map((scenario) => scenario.label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = raidStripingScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual([])
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 RAID 0 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(within(figure).queryByRole('heading')).toBeNull()
  })
})
