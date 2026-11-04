import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { RwxMeaningDiagram, rwxMeaningScenarios } from './RwxMeaningDiagram'

const topicId = 'linux-permissions'
const anchorConceptId = `${topicId}.rwx-permissions`
const labels = {
  r: 'r',
  w: 'w',
  x: 'x',
  'file-r': '내용 읽기',
  'file-w': '내용 고치기',
  'file-x': '프로그램으로 실행',
  'dir-r': '목록 보기',
  'dir-w': '만들기·지우기',
  'dir-x': '안으로 들어가기',
}
const groupLabels = { file: '파일', dir: '디렉터리' }
type GroupId = keyof typeof groupLabels

const nodeIds = Object.keys(labels)
const letters = ['r', 'w', 'x']
// 그룹 테두리마다 그 안에 드는 노드. 글자 노드는 어느 테두리에도 들지 않는다.
const members: Record<GroupId, string[]> = {
  file: ['file-r', 'file-w', 'file-x'],
  dir: ['dir-r', 'dir-w', 'dir-x'],
}

type Group = { x: number, y: number, width: number, height: number, labelX: number, labelY: number }
const tallGroups: Record<GroupId, Group> = {
  file: { x: 38, y: 8, width: 124, height: 140, labelX: 44, labelY: 22 },
  dir: { x: 166, y: 8, width: 112, height: 140, labelX: 172, labelY: 22 },
}
const wideGroups: Record<GroupId, Group> = {
  file: { x: 72, y: 8, width: 168, height: 140, labelX: 80, labelY: 22 },
  dir: { x: 256, y: 8, width: 168, height: 140, labelX: 264, labelY: 22 },
}

const question = 'r·w·x는 파일과 디렉터리에서 무엇을 허락할까?'
const idleCaption = '권한 글자 r·w·x가 파일에서와 디렉터리에서 각각 무엇을 허락하는지 한 줄에 하나씩 놓았다. 버튼을 고르면 파일에서의 뜻, 디렉터리에서의 뜻, 파일을 지울 때 따지는 권한을 차례로 볼 수 있다.'
const legend = '한 줄이 권한 글자 하나다. 가운데 테두리는 그 글자가 파일에서, 오른쪽 테두리는 디렉터리에서 허락하는 일이다.'
const figureName = '권한 글자 r·w·x가 파일에서는 내용 읽기·내용 고치기·프로그램으로 실행을, 디렉터리에서는 목록 보기·파일 만들기와 지우기·안으로 들어가기를 허락하고, 파일을 지울 수 있는지는 그 파일이 든 디렉터리의 쓰기·실행 권한이 정하는 것을 보이는 도식'
const svgName = '권한 글자 r·w·x마다 파일에서의 뜻과 디렉터리에서의 뜻이 한 줄에 놓여 있다'
const expectedScenarios = [
  {
    id: 'file', label: '파일에서',
    nodes: ['r', 'w', 'x', 'file-r', 'file-w', 'file-x'],
    caption: '파일에서 r은 내용을 읽게, w는 내용을 고치게, x는 그 파일을 프로그램으로 실행하게 한다.',
    sources: [anchorConceptId],
  },
  {
    id: 'directory', label: '디렉터리에서',
    nodes: ['r', 'w', 'x', 'dir-r', 'dir-w', 'dir-x'],
    caption: '디렉터리에서 r은 안의 목록을 보게, w는 안에 파일을 만들거나 안의 파일을 지우고 이름을 바꾸게, x는 안으로 들어가 안의 파일에 닿게 한다.',
    sources: [anchorConceptId],
  },
  {
    id: 'delete', label: '파일 지우기',
    nodes: ['w', 'x', 'dir-w', 'dir-x'],
    caption: '파일을 지울 수 있는지는 그 파일이 든 디렉터리의 쓰기 권한과 실행 권한이 정한다. 지울 파일 자신의 쓰기 권한은 따지지 않는다 — 파일의 쓰기 권한은 내용을 고치는 일에만 걸린다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 156]
const wideBox: [number, number, number, number] = [0, 0, 440, 156]

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

function litIds() {
  return Array.from(diagram().querySelectorAll('[data-node][opacity="1"]'), (element) => element.getAttribute('data-node')!)
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function contains(outer: SvgBox, inner: SvgBox) {
  return inner.x >= outer.x && inner.y >= outer.y
    && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height
}

// 글자 크기 9인 그룹 라벨이 차지하는 상자. 반각 글자가 화면에서 더 넓게 그려지는 것을 생각해 폭을 1.15배로 잡는다.
function labelBox(text: Element, id: string): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  return { id, x, y: y - 9, width: estimateTextWidth(text.textContent!, 9) * 1.15, height: 9 }
}

async function expectScenario(scenario: typeof expectedScenarios[number], container: HTMLElement) {
  await selectScenario(scenario.label)

  for (const element of diagram().querySelectorAll('[data-node]')) {
    const id = element.getAttribute('data-node')!
    expect(element, id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  for (const group of Object.keys(groupLabels)) {
    expect(diagram().querySelector(`[data-group="${group}"]`)!.closest('[opacity]'), group).toBeNull()
    expect(diagram().querySelector(`[data-group-label="${group}"]`)!.closest('[opacity]'), group).toBeNull()
  }
  expect(diagram().querySelectorAll('[data-path], [data-note], marker')).toHaveLength(0)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다.
// 글자 노드와 두 뜻 노드는 같은 줄(같은 y)에 서고, 그룹 테두리는 정한 노드만 담는다. 노드는 모두 회색이다.
function expectFits(viewBox: [number, number, number, number], groups: Record<GroupId, Group>) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length + Object.keys(groupLabels).length)
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
  for (const letter of letters) {
    const y = nodeBox(letter).y
    expect(nodeBox(`file-${letter}`).y, letter).toBe(y)
    expect(nodeBox(`dir-${letter}`).y, letter).toBe(y)
    expect(nodeBox(letter).x + nodeBox(letter).width, letter).toBeLessThan(nodeBox(`file-${letter}`).x)
    expect(nodeBox(`file-${letter}`).x + nodeBox(`file-${letter}`).width, letter).toBeLessThan(nodeBox(`dir-${letter}`).x)
  }
  expect(nodeBox('r').y).toBeLessThan(nodeBox('w').y)
  expect(nodeBox('w').y).toBeLessThan(nodeBox('x').y)

  for (const [id, group] of Object.entries(groups) as [GroupId, Group][]) {
    const rect = diagram().querySelector(`[data-group="${id}"]`)!
    expect(rect).toHaveAttribute('x', String(group.x))
    expect(rect).toHaveAttribute('y', String(group.y))
    expect(rect).toHaveAttribute('width', String(group.width))
    expect(rect).toHaveAttribute('height', String(group.height))
    for (const node of nodeIds) expect(contains(groupBox(id), nodeBox(node)), `${id} ⊃ ${node}`).toBe(members[id].includes(node))
    for (const node of nodeIds.filter((item) => !members[id].includes(item))) expect(overlaps(groupBox(id), nodeBox(node)), `${id} ↔ ${node}`).toBe(false)

    const labelText = diagram().querySelector(`[data-group-label="${id}"]`)!
    expect(labelText.textContent).toBe(groupLabels[id])
    expect(labelText).toHaveAttribute('x', String(group.labelX))
    expect(labelText).toHaveAttribute('y', String(group.labelY))
    expect(labelText).toHaveAttribute('font-size', '9')
    const label = labelBox(labelText, id)
    expect(contains(groupBox(id), label), `${id} 라벨`).toBe(true)
    for (const node of nodeIds) expect(overlaps(label, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
  }
  expect(overlaps(groupBox('file'), groupBox('dir'))).toBe(false)
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 요점: 「파일에서」의 선명한 뜻 노드는 모두 파일 테두리 안, 「디렉터리에서」의 것은 모두 디렉터리 테두리 안이다.
// 디렉터리 쪽 쓰기의 라벨에는 「만들」과 「지우」가 함께 있다. 「파일 지우기」에서는 파일 테두리 안의 노드가 하나도 선명하지 않고,
// 선명한 글자는 w와 x다 — 파일을 지울 수 있는지는 그 파일이 든 디렉터리의 쓰기·실행 권한이 정한다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const meaningsOf = (ids: string[]) => ids.filter((id) => !letters.includes(id))

  await selectScenario('파일에서')
  const fileLit = meaningsOf(litIds())
  expect(fileLit).toHaveLength(3)
  for (const id of fileLit) expect(contains(groupBox('file'), nodeBox(id)), id).toBe(true)

  await selectScenario('디렉터리에서')
  const dirLit = meaningsOf(litIds())
  expect(dirLit).toHaveLength(3)
  for (const id of dirLit) expect(contains(groupBox('dir'), nodeBox(id)), id).toBe(true)
  const dirWrite = diagram().querySelector('[data-node="dir-w"] text')!.textContent!
  expect(dirWrite).toContain('만들')
  expect(dirWrite).toContain('지우')

  await selectScenario('파일 지우기')
  const deleteLit = litIds()
  expect(meaningsOf(deleteLit).some((id) => contains(groupBox('file'), nodeBox(id)))).toBe(false)
  expect(deleteLit.filter((id) => letters.includes(id)).sort()).toEqual(['w', 'x'])

  expect(body).toContain('그 안에 파일을 새로 만들거나, 안의 파일을 지우거나 이름을 바꾸게 한다')
  expect(body).toContain('파일을 지울 수 있는지는 그 파일의 권한이 아니라 그 파일이 든 디렉터리의 권한이 정한다')
  expect(body).toContain('그 디렉터리에 쓰기 권한과 실행 권한이 있어야 하고')
  expect(body).toContain('파일의 쓰기 권한은 그 파일의 내용을 고치는 일에만 걸린다')
}

describe('RwxMeaningDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<RwxMeaningDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 선·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<RwxMeaningDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드만 선명하다', async (scenario) => {
    const { container } = render(<RwxMeaningDiagram />)
    await expectScenario(scenario, container)
  })

  it('시나리오를 바꾸면 선명한 노드가 바뀌고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<RwxMeaningDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(litIds().sort()).toEqual([...scenario.nodes].sort())
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('세 시나리오의 선명한 노드가 서로 다르다', () => {
    const keys = expectedScenarios.map(({ nodes }) => JSON.stringify([...nodes].sort()))
    expect(new Set(keys).size).toBe(expectedScenarios.length)
  })

  it('노드와 그룹 테두리가 280×156 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<RwxMeaningDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 156')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox, tallGroups)
  })

  it('파일·디렉터리에서의 뜻은 각자 테두리 안에 있고, 파일 지우기에서는 디렉터리의 w·x만 선명하다', async () => {
    render(<RwxMeaningDiagram />)
    await expectPoint()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<RwxMeaningDiagram />)
    const text = visualsByTopicId[topicId].diagrams['rwx-meaning']
    const ids = rwxMeaningScenarios.map(({ id }) => id).sort()
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
      const scenario = rwxMeaningScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 읽기·쓰기·실행 권한 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    const article = figure.closest('article')!

    expect(article).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(article.lastElementChild).toBe(figure)
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

    it('440×156 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<RwxMeaningDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 156')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·그룹 id 집합이 세로형과 같다', () => {
      const { change } = mockMatchMedia(false)
      render(<RwxMeaningDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 156')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroupIds = shownIds('[data-group]', 'data-group').sort()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 156')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroupIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallGroupIds).toEqual(Object.keys(groupLabels).sort())
    })

    it('노드와 그룹 테두리가 440×156 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<RwxMeaningDiagram />)
      expectFits(wideBox, wideGroups)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·캡션을 보인다', async (scenario) => {
      const { container } = render(<RwxMeaningDiagram />)
      await expectScenario(scenario, container)
    })

    it('파일·디렉터리에서의 뜻은 각자 테두리 안에 있고, 파일 지우기에서는 디렉터리의 w·x만 선명하다', async () => {
      render(<RwxMeaningDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<RwxMeaningDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 156')
      await selectScenario('파일 지우기')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '파일 지우기' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(litIds().sort()).toEqual(['dir-w', 'dir-x', 'w', 'x'])
    })
  })
})
