import { act, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { OsiStackDiagram } from './OsiStackDiagram'

const topicId = 'protocols-encapsulation'
const anchorConceptId = `${topicId}.osi-model`
// 본문 목록 순서(아래 계층부터)다.
const labels = {
  physical: '물리 계층',
  'data-link': '데이터 링크 계층',
  network: '네트워크 계층',
  transport: '전송 계층',
  session: '세션 계층',
  presentation: '표현 계층',
  application: '응용 계층',
}
const noteLabels = {
  'role-physical': '비트를 신호로 바꿔 실어 나르기',
  'role-data-link': '프레임으로 묶기·오류 검출하기',
  'role-network': '주소로 목적지까지 경로 정하기',
  'role-transport': '양 끝 호스트 사이에 전달하기',
  'role-session': '대화 열기·차례 맞추기·닫기',
  'role-presentation': '표현 형식을 공통으로 맞추기',
  'role-application': '응용 프로그램이 쓰는 창구',
}

const nodeIds = Object.keys(labels)
const noteIds = Object.keys(noteLabels)
const tallNoteX = 128
const wideNoteX = 240

const question = 'OSI 모델의 일곱 계층은 어떤 순서로 쌓여 있을까?'
const idleCaption = 'OSI 모델은 통신 과정을 일곱 계층으로 나눈 국제 표준 참조 모델이다. 맨 아래 물리 계층부터 데이터 링크·네트워크·전송·세션·표현 계층을 거쳐 맨 위 응용 계층까지 차례로 쌓여 있고, 계층마다 맡는 일이 따로 있다. 데이터 링크 계층은 오류를 검출하지만, 검출한 오류를 고칠지는 그 계층의 프로토콜마다 다르다.'
const legend = '상자 하나가 계층 하나이고, 아래에서 위로 쌓여 있다. 상자 옆 글은 그 계층이 맡는 일이다.'

function diagram() {
  return screen.getByRole('img', { name: '물리 계층부터 응용 계층까지 아래에서 위로 쌓인 OSI 모델의 일곱 계층' })
}

function readBox(rect: Element): SvgBox {
  return {
    id: rect.parentElement?.getAttribute('data-node') ?? '',
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

// 글자가 차지하는 상자. 높이는 글자 크기 9를 기준선 위로 잡는다.
function textBox(text: Element): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9)
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id: text.getAttribute('data-note')!, x: left, y: y - 9, width, height: 9 }
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

// 본문 목록 항목의 굵은 이름을 차례로 뽑는다.
function listedLayers() {
  const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
  return concept.paragraphs.flatMap((paragraph) => paragraph.match(/^- \*\*([^*]+)\*\*/u)?.[1] ?? [])
}

// 정지 그림이라 버튼·화살표·연결선이 없고, 노드와 곁말이 모두 선명하며 캡션은 늘 idleCaption이다.
function expectStatic(container: HTMLElement) {
  expect(screen.queryAllByRole('button')).toHaveLength(0)
  expect(screen.queryByRole('group')).toBeNull()
  expect(diagram().querySelectorAll('[data-path], [data-link], marker')).toHaveLength(0)
  expect(diagram().querySelectorAll('[opacity]')).toHaveLength(0)
  expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
}

// 모든 rect가 viewBox 안에 있고 라벨이 상자 안에, 곁말이 viewBox 안에 들어간다. 노드는 모두 회색이다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(node.querySelector('rect')).toHaveClass('stroke-disabled')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(label, 10) + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
  }

  const noteBoxes = Array.from(diagram().querySelectorAll('[data-note]'), textBox)
  expect(boxesOutsideViewBox(noteBoxes, viewBox)).toEqual([])
  for (const note of noteBoxes) {
    for (const box of boxes) expect(overlaps(note, box), `${note.id} ↔ ${box.id}`).toBe(false)
  }
  for (let i = 0; i < noteBoxes.length; i++) {
    for (let j = i + 1; j < noteBoxes.length; j++) expect(overlaps(noteBoxes[i], noteBoxes[j]), `${noteBoxes[i].id} ↔ ${noteBoxes[j].id}`).toBe(false)
  }
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 계층 일곱이 본문 목록 순서대로 아래에서 위로 빈틈없이 쌓여 있다. 물리 계층이 맨 아래(y가 가장 크다)이고 응용 계층이 맨 위다.
// 계층마다 하는 일 곁말은 그 계층 상자의 오른쪽, 같은 높이에 있다.
function expectStack(noteX: number) {
  expect(shownIds('[data-node]', 'data-node').map((id) => labels[id as keyof typeof labels])).toEqual(listedLayers())

  const stack = nodeIds.map(nodeBox)
  expect(Math.max(...stack.map(({ y }) => y))).toBe(nodeBox('physical').y)
  expect(Math.min(...stack.map(({ y }) => y))).toBe(nodeBox('application').y)
  stack.forEach((box, index) => {
    if (index === 0) return
    const below = stack[index - 1]
    expect(box.y + box.height, box.id).toBe(below.y)
    expect(box.x, box.id).toBe(below.x)
    expect(box.width, box.id).toBe(below.width)
  })
  for (const id of nodeIds) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveAttribute('rx', '0')

  expect(shownIds('[data-note]', 'data-note')).toEqual(noteIds)
  for (const id of nodeIds) {
    const note = diagram().querySelector(`[data-note="role-${id}"]`)!
    const box = nodeBox(id)
    const area = textBox(note)
    expect(note.textContent).toBe(noteLabels[`role-${id}` as keyof typeof noteLabels])
    expect(note).toHaveAttribute('x', String(noteX))
    expect(note).toHaveAttribute('text-anchor', 'start')
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(area.x, id).toBeGreaterThanOrEqual(box.x + box.width + 8)
    expect(area.y, id).toBeGreaterThanOrEqual(box.y)
    expect(area.y + area.height, id).toBeLessThanOrEqual(box.y + box.height)
  }
  // 데이터 링크 계층은 오류를 검출할 뿐 고친다고 말하지 않는다(강의 수정 이력 I1).
  expect(noteLabels['role-data-link']).toContain('검출')
  expect(noteLabels['role-data-link']).not.toMatch(/고치|고침|정정|수정/u)
}

describe('OsiStackDiagram', () => {
  it('물음형 제목을 헤딩 없이 그림보다 앞에 보인다', () => {
    render(<OsiStackDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(diagram()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('정지 그림이라 시나리오 버튼과 화살표가 없고 계층·곁말이 모두 선명하며 캡션은 idleCaption이다', () => {
    const { container } = render(<OsiStackDiagram />)
    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    expectStatic(container)
  })

  it('계층이 280×240 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<OsiStackDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 240')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 240])
  })

  it('계층 일곱이 본문 목록 순서대로 아래에서 위로 쌓이고 계층마다 하는 일이 옆에 붙는다', () => {
    render(<OsiStackDiagram />)
    expectStack(tallNoteX)
  })

  it('지정한 문구와 존재하는 근거 개념을 JSON에서 읽고 시나리오가 없다', () => {
    render(<OsiStackDiagram />)
    const text = visualsByTopicId[topicId].diagrams['osi-stack']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(text.scenarios).toEqual([])
    expect(text.nodes).toEqual(labels)
    expect(text.notes).toEqual(noteLabels)
    expect(text.groups).toBeUndefined()
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([anchorConceptId])
    expect(text.label).toBe('OSI 모델의 일곱 계층과 계층마다 맡는 일 도식')
    expect(screen.getByText(legend)).toBeInTheDocument()
    for (const source of text.sources) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 OSI 모델 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: 'OSI 모델의 일곱 계층과 계층마다 맡는 일 도식' })

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

    it('440×240 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<OsiStackDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 240')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·곁말 id 집합이 세로형과 같다', () => {
      const { change } = mockMatchMedia(false)
      render(<OsiStackDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 240')
      const tallNodes = shownIds('[data-node]', 'data-node')
      const tallNotes = shownIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 240')
      expect(shownIds('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(shownIds('[data-note]', 'data-note')).toEqual(tallNotes)
      expect(tallNodes).toEqual(nodeIds)
      expect(tallNotes).toEqual(noteIds)
    })

    it('모든 rect가 440×240 viewBox 안에 있고 라벨과 곁말이 들어간다', () => {
      render(<OsiStackDiagram />)
      expectFits([0, 0, 440, 240])
    })

    it('정지 그림이라 시나리오 버튼과 화살표가 없고 캡션은 idleCaption이다', () => {
      const { container } = render(<OsiStackDiagram />)
      expectStatic(container)
    })

    it('계층 일곱이 본문 목록 순서대로 아래에서 위로 쌓이고 계층마다 하는 일이 옆에 붙는다', () => {
      render(<OsiStackDiagram />)
      expectStack(wideNoteX)
    })

    it('폭을 바꾸어도 캡션이 idleCaption 그대로이고 곁말이 새 자리로 옮겨 간다', () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<OsiStackDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 240')
      expectStack(tallNoteX)

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expectStatic(container)
      expectStack(wideNoteX)
    })
  })
})
