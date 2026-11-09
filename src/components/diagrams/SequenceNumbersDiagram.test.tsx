import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { SequenceNumbersDiagram, sequenceNumbersScenarios } from './SequenceNumbersDiagram'

const topicId = 'tcp-udp'
const anchorConceptId = `${topicId}.sequence-number`
const labels: Record<string, string> = {
  syn: 'SYN · ISN 5000',
  'seq-1': '순서 번호 5001',
  'bytes-1': '5001 ~ 6000번 바이트',
  'seq-2': '순서 번호 6001',
  'bytes-2': '6001 ~ 7000번 바이트',
  'seq-3': '순서 번호 7001',
  'bytes-3': '7001 ~ 8000번 바이트',
}
const groupLabels: Record<string, string> = {
  syn: '연결을 맺는 SYN 세그먼트 · 데이터 없음',
  'seg-1': '첫째 세그먼트',
  'seg-2': '둘째 세그먼트',
  'seg-3': '셋째 세그먼트',
}
const noteLabels: Record<string, string> = { 'next-calc': '5001 + 1000 = 6001', 'isn-calc': '5000 + 1 = 5001' }
// 계산 곁말은 자기 시나리오에서만 보이고, 그 계산이 가리키는 세그먼트 상자에 붙는다.
const noteScenario: Record<string, string> = { 'next-calc': 'next', 'isn-calc': 'isn' }
const noteGroup: Record<string, string> = { 'next-calc': 'seg-2', 'isn-calc': 'seg-1' }
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const membership: Record<string, string> = {
  syn: 'syn', 'seq-1': 'seg-1', 'bytes-1': 'seg-1', 'seq-2': 'seg-2', 'bytes-2': 'seg-2', 'seq-3': 'seg-3', 'bytes-3': 'seg-3',
}
const segments = [1, 2, 3]

const question = '순서 번호는 무엇을 셀까?'
const figureName = 'TCP가 바이트마다 매긴 번호와 세그먼트의 순서 번호를 보이는 도식'
const svgName = 'ISN 5000을 알리는 SYN 세그먼트 뒤에, 순서 번호 5001·6001·7001인 세 세그먼트가 각각 5001~6000번, 6001~7000번, 7001~8000번 바이트를 싣고 보낸 차례대로 놓인 그림'
const idleCaption = '응용 프로그램이 넘긴 데이터 3,000바이트를 1,000바이트씩 세 세그먼트로 나눠 보낸 모습이다. 세그먼트마다 헤더의 순서 번호와 실은 데이터의 바이트 번호를 함께 놓았다. 버튼을 고르면 순서 번호가 무엇을 세는지 볼 수 있다.'
const legend = '세그먼트 상자마다 헤더의 순서 번호 칸과 그 세그먼트가 실은 데이터의 바이트 번호 범위를 함께 넣었다. 맨 앞 상자는 연결을 맺을 때 보내는 SYN 세그먼트이고, 세그먼트는 보낸 차례대로 놓았다.'
const expectedScenarios = [
  {
    id: 'first-byte', label: '첫 바이트',
    nodes: ['seq-1', 'bytes-1'],
    caption: '첫째 세그먼트는 5001번부터 6000번까지 1,000바이트를 싣는다. 헤더의 순서 번호에는 그 가운데 첫 바이트의 번호 5001 하나만 적고, 나머지 바이트의 번호는 여기서 하나씩 늘어난다.',
  },
  {
    id: 'next', label: '다음 번호',
    nodes: ['seq-1', 'bytes-1', 'seq-2', 'bytes-2'],
    caption: '둘째 세그먼트의 순서 번호는 첫째의 순서 번호 5001에 첫째가 실은 1,000바이트를 더한 6001이다. 순서 번호는 세그먼트마다 1씩이 아니라 실은 바이트 수만큼 늘어난다.',
  },
  {
    id: 'isn', label: '시작 번호',
    nodes: ['syn', 'seq-1', 'bytes-1'],
    caption: '연결을 맺을 때 SYN 세그먼트가 ISN 5000을 알린다. SYN은 데이터가 아닌데도 번호 하나를 차지하므로, 첫 데이터 바이트의 번호는 5000 + 1 = 5001이다. ISN은 연결마다 새로 고르는 값이고, 5000은 예다.',
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
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)
const brightNodes = () => nodeIds.filter((id) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (item) => item.getAttribute('data-note')!)

// 「순서 번호 5001」·「SYN · ISN 5000」에서 끝의 번호를, 「5001 ~ 6000번 바이트」에서 첫 번호와 끝 번호를 꺼낸다.
const lastNumber = (text: string) => Number(text.match(/(\d+)$/u)![1])
function byteRange(text: string) {
  const [, first, last] = text.match(/^(\d+) ~ (\d+)번 바이트$/u)!
  return { first: Number(first), last: Number(last), count: Number(last) - Number(first) + 1 }
}
function calc(text: string) {
  const [left, result] = text.split(' = ')
  return { addends: left.split(' + ').map(Number), result: Number(result) }
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 180] : [0, 0, 280, 256]

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<SequenceNumbersDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 경로와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<SequenceNumbersDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(svg().querySelectorAll('path')).toHaveLength(0)
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드와 계산 곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<SequenceNumbersDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownNotes()).toEqual(Object.keys(noteScenario).filter((id) => noteScenario[id] === scenario.id))
    for (const id of shownNotes()) expect(note(id)!.textContent).toBe(noteLabels[id])
    expect(svg().querySelectorAll('path')).toHaveLength(0)
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말·그룹 라벨이 자리에 들어간다`, async () => {
    render(<SequenceNumbersDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      expect(contains(groupBox(membership[id]), nodeBox(id)), id).toBe(true)
      for (const group of groupIds) if (group !== membership[id]) expect(overlaps(groupBox(group), nodeBox(id)), `${group} ↔ ${id}`).toBe(false)
    }
    for (let i = 0; i < nodeIds.length; i += 1) {
      for (const other of nodeIds.slice(i + 1)) expect(overlaps(nodeBox(nodeIds[i]), nodeBox(other)), `${nodeIds[i]} ↔ ${other}`).toBe(false)
    }
    for (let i = 0; i < groupIds.length; i += 1) {
      for (const other of groupIds.slice(i + 1)) expect(overlaps(groupBox(groupIds[i]), groupBox(other)), `${groupIds[i]} ↔ ${other}`).toBe(false)
    }
    const groupTexts = groupIds.map((id) => {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = textBox(svg().querySelector(`[data-group-label="${id}"]`)!, `${id}-label`)
      expect(contains(groupBox(id), box), id).toBe(true)
      return box
    })
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const noteTexts = shownNotes().map((id) => {
        const element = note(id)!
        expect(element).toHaveAttribute('font-size', '9')
        expect(element).toHaveClass('fill-muted')
        const box = textBox(element, id)
        // 세로형은 그 세그먼트 상자의 라벨 줄 오른쪽에, 가로형은 그 세그먼트 상자 바로 아래, 같은 열에 붙는다.
        const target = groupBox(noteGroup[id])
        if (wide) {
          expect(box.y, id).toBeGreaterThanOrEqual(target.y + target.height)
          expect(box.x, id).toBeGreaterThanOrEqual(target.x)
          expect(box.x + box.width, id).toBeLessThanOrEqual(target.x + target.width)
        } else {
          expect(contains(target, box), id).toBe(true)
        }
        return box
      })
      const texts = [...noteTexts, ...groupTexts]
      for (const box of texts) {
        expect(box.x, box.id).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width, box.id).toBeLessThanOrEqual(viewBox[2])
        expect(box.y, box.id).toBeGreaterThanOrEqual(0)
        expect(box.y + box.height, box.id).toBeLessThanOrEqual(viewBox[3])
        for (const id of nodeIds) expect(overlaps(box, nodeBox(id)), `${box.id} ↔ ${id}`).toBe(false)
      }
      for (let i = 0; i < texts.length; i += 1) {
        for (const other of texts.slice(i + 1)) expect(overlaps(texts[i], other), `${texts[i].id} ↔ ${other.id}`).toBe(false)
      }
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('SYN 세그먼트가 맨 앞이고 세그먼트는 보낸 차례대로 놓이며, 세그먼트마다 순서 번호 칸과 데이터 칸이 맞붙는다', () => {
    render(<SequenceNumbersDiagram />)
    // 세로형은 위에서 아래로, 가로형은 SYN 아래에 세그먼트 셋을 왼쪽에서 오른쪽으로 놓는다.
    for (const n of segments) expect(groupBox('syn').y + groupBox('syn').height, `seg-${n}`).toBeLessThanOrEqual(groupBox(`seg-${n}`).y)
    const along = (id: string) => (wide ? groupBox(id).x : groupBox(id).y)
    expect(along('seg-1')).toBeLessThan(along('seg-2'))
    expect(along('seg-2')).toBeLessThan(along('seg-3'))
    for (const n of segments) {
      const seq = nodeBox(`seq-${n}`)
      const bytes = nodeBox(`bytes-${n}`)
      if (wide) {
        expect(bytes.x, `${n}`).toBe(seq.x)
        expect(bytes.y, `${n}`).toBe(seq.y + 32)
      } else {
        expect(bytes.y, `${n}`).toBe(seq.y)
        expect(bytes.x, `${n}`).toBe(seq.x + seq.width)
      }
    }
  })

  // 요점: 세그먼트의 순서 번호는 자기가 실은 첫 바이트 번호와 같고, 이웃한 세그먼트의 번호 차이는 실은 바이트 수(1000)와 같다.
  // 다음 번호 곁말의 결과는 둘째 세그먼트의 번호이고, 시작 번호 곁말은 ISN에 1을 더해 첫 데이터 바이트 번호가 된다.
  it('순서 번호는 실은 첫 바이트의 번호이고, 실은 바이트 수만큼 늘어나며, 첫 데이터 바이트는 ISN + 1이다', async () => {
    render(<SequenceNumbersDiagram />)
    for (const n of segments) expect(lastNumber(label(`seq-${n}`)), `${n}`).toBe(byteRange(label(`bytes-${n}`)).first)
    for (const n of [1, 2]) {
      const range = byteRange(label(`bytes-${n}`))
      expect(range.count).toBe(1000)
      expect(lastNumber(label(`seq-${n + 1}`)) - lastNumber(label(`seq-${n}`)), `${n}`).toBe(range.count)
      expect(byteRange(label(`bytes-${n + 1}`)).first, `${n}`).toBe(range.last + 1)
    }
    expect(byteRange(label('bytes-3')).count).toBe(1000)

    await select('다음 번호')
    expect(brightNodes()).toEqual(['seq-1', 'bytes-1', 'seq-2', 'bytes-2'])
    const next = calc(note('next-calc')!.textContent!)
    expect(next.addends).toEqual([lastNumber(label('seq-1')), byteRange(label('bytes-1')).count])
    expect(next.addends[0] + next.addends[1]).toBe(next.result)
    expect(next.result).toBe(lastNumber(label('seq-2')))

    await select('시작 번호')
    const isn = calc(note('isn-calc')!.textContent!)
    expect(isn.addends).toEqual([lastNumber(label('syn')), 1])
    expect(isn.addends[0] + isn.addends[1]).toBe(isn.result)
    expect(isn.result).toBe(byteRange(label('bytes-1')).first)
    expect(isn.result).toBe(lastNumber(label('seq-1')))

    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join('\n')
    expect(body).toContain('첫 데이터 바이트의 번호는 5000 + 1 = 5001이다')
    expect(body).toContain('5001 + 1000 = 6001')
    expect(body).toContain('6001 + 1000 = 7001')
    expect(body).toContain('`7001`번부터 `8000`번까지')
    expect(body).toContain('ISN은 SYN이 쓰고 첫 데이터 바이트는 ISN + 1번이 된다')
  })
}

describe('SequenceNumbersDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<SequenceNumbersDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 256')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('다음 번호')
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 180')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '다음 번호' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownNotes()).toEqual(tallNotes)
    })
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<SequenceNumbersDiagram />)
    const text = visualsByTopicId[topicId].diagrams['sequence-numbers']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(sequenceNumbersScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = sequenceNumbersScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual([])
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 순서 번호 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(within(figure).queryByRole('heading')).toBeNull()
  })
})
