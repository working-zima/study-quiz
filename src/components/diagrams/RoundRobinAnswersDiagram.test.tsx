import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { RoundRobinAnswersDiagram, roundRobinAnswersScenarios } from './RoundRobinAnswersDiagram'

const topicId = 'dns'
const anchorConceptId = `${topicId}.dns-round-robin`
const labels: Record<string, string> = {
  'rec-10': '198.51.100.10',
  'rec-11': '198.51.100.11',
  'rec-12': '198.51.100.12',
  'q1-10': '198.51.100.10',
  'q1-11': '198.51.100.11',
  'q1-12': '198.51.100.12',
  'q2-11': '198.51.100.11',
  'q2-12': '198.51.100.12',
  'q2-10': '198.51.100.10',
  'q3-12': '198.51.100.12',
  'q3-10': '198.51.100.10',
  'q3-11': '198.51.100.11',
}
const groupLabels: Record<string, string> = {
  server: 'DNS 서버의 레코드',
  q1: '질의 1의 답',
  q2: '질의 2의 답',
  q3: '질의 3의 답',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const answerIds = ['q1', 'q2', 'q3']
// 상자마다 든 노드.
const members: Record<string, string[]> = {
  server: ['rec-10', 'rec-11', 'rec-12'],
  q1: ['q1-10', 'q1-11', 'q1-12'],
  q2: ['q2-11', 'q2-12', 'q2-10'],
  q3: ['q3-12', 'q3-10', 'q3-11'],
}

const question = '같은 이름을 물을 때마다 답이 어떻게 바뀔까?'
const figureName = 'www.example.com에 주소가 다른 A 레코드 셋을 둔 DNS 서버가 질의 셋에 답한 차례를 나란히 보여, 질의마다 맨 앞 주소가 바뀌고 실리는 주소는 그대로인 것을 보이는 도식'
const svgName = 'DNS 서버의 레코드 상자와 질의 1·2·3의 답 상자 셋에, 주소 198.51.100.10, 198.51.100.11, 198.51.100.12를 각 상자의 차례대로 놓은 그림'
const idleCaption = 'DNS 서버에 적힌 www.example.com의 A 레코드 셋과, 이 이름을 잇달아 물은 질의 셋에 DNS 서버가 답한 차례다. 주소와 차례는 예로 붙인 것이다. 버튼을 고르면 질의마다의 답을 볼 수 있다.'
const legend = '상자마다 위 칸의 주소가 먼저 놓인 주소이고, 답 상자에서는 위 칸이 응답의 맨 앞이다.'
const expectedScenarios = [
  {
    id: 'first', label: '질의 1', answer: 'q1',
    caption: '예로 든 첫 질의에는 198.51.100.10, 198.51.100.11, 198.51.100.12의 차례로 답한다. 이 이름에 둔 A 레코드 셋이 한 묶음으로 응답에 모두 실린다.',
  },
  {
    id: 'second', label: '질의 2', answer: 'q2',
    caption: '다음 질의에는 차례를 하나 돌려 198.51.100.11이 맨 앞에 온다. 응답에 실리는 세 주소는 그대로이고, 바뀌는 것은 차례뿐이다.',
  },
  {
    id: 'third', label: '질의 3', answer: 'q3',
    caption: '그다음 질의에는 198.51.100.12가 맨 앞에 온다. 이렇게 질의마다 맨 앞 주소가 바뀌어, 이 이름을 묻는 클라이언트들이 늘 같은 서버로만 접속하지 않고 여러 서버로 나뉜다.',
  },
].map((scenario) => ({ ...scenario, nodes: [...members.server, ...members[scenario.answer]] }))

const svg = () => screen.getByRole('img', { name: svgName })
const select = async (name: string) => { await act(async () => { await userEvent.click(screen.getByRole('button', { name })) }) }

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

const groupLabelBox = (id: string) => textBox(svg().querySelector(`[data-group-label="${id}"]`)!, id)

// 상자 안의 주소를 놓인 차례(위에서 아래로)로 읽는다.
const order = (group: string) => [...members[group]].sort((a, b) => nodeBox(a).y - nodeBox(b).y || nodeBox(a).x - nodeBox(b).x).map(label)
const rotate = (list: string[]) => [...list.slice(1), list[0]]

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 136] : [0, 0, 280, 288]

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<RoundRobinAnswersDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 선 없이 선택 안내가 나온다', () => {
    const { container } = render(<RoundRobinAnswersDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(svg().querySelectorAll('path')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 서버의 레코드와 그 질의의 답만 선명하고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<RoundRobinAnswersDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(svg().querySelectorAll('path')).toHaveLength(0)
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·그룹 라벨이 자리에 들어간다`, () => {
    render(<RoundRobinAnswersDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    // 노드는 저마다 자기 상자 안에 있고, 상자끼리는 겹치지 않는다.
    for (const group of groupIds) {
      for (const id of members[group]) expect(contains(groupBox(group), nodeBox(id)), `${group} ⊃ ${id}`).toBe(true)
      for (const other of groupIds.filter((otherId) => otherId !== group)) expect(overlaps(groupBox(group), groupBox(other)), `${group} ↔ ${other}`).toBe(false)
    }
    const groupTexts = groupIds.map((id) => {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
      expect(box.x + box.width, id).toBeLessThanOrEqual(viewBox[2])
      return box
    })
    for (const box of groupTexts) {
      for (const other of groupTexts.filter(({ id }) => id !== box.id)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  // 요점: 세 답 상자의 맨 앞 주소가 서로 다르고, 세 답에 든 주소의 집합은 서버의 레코드와 같다(레코드는 그대로이고 차례만 바뀐다).
  // 다음 질의의 답은 앞 질의의 답을 하나 돌린 차례다. 답마다 노드는 다른 id로 다른 자리에 있다.
  it('질의마다 맨 앞 주소가 바뀌고, 실리는 주소의 집합은 서버의 레코드와 같다', async () => {
    render(<RoundRobinAnswersDiagram />)
    const records = order('server')
    const answers = answerIds.map(order)
    expect(new Set(answers.map((answer) => answer[0])).size).toBe(answerIds.length)
    for (const answer of answers) {
      expect(answer).toHaveLength(records.length)
      expect([...answer].sort()).toEqual([...records].sort())
    }
    expect(answers[1]).toEqual(rotate(answers[0]))
    expect(answers[2]).toEqual(rotate(answers[1]))

    // 답의 노드는 상자마다 다른 id이고, 서로 다른 자리에 놓인다.
    const answerNodes = answerIds.flatMap((group) => members[group])
    expect(new Set(answerNodes).size).toBe(answerNodes.length)
    expect(new Set(answerNodes.map((id) => `${nodeBox(id).x},${nodeBox(id).y}`)).size).toBe(answerNodes.length)

    // 상자 안의 칸은 위에서 아래로 빈틈없이 잇는다.
    for (const group of groupIds) {
      const ys = members[group].map((id) => nodeBox(id).y).sort((a, b) => a - b)
      expect(ys[1] - ys[0], group).toBe(32)
      expect(ys[2] - ys[1], group).toBe(32)
      expect(new Set(members[group].map((id) => nodeBox(id).x)).size, group).toBe(1)
    }

    // 질의를 고르면 그 답 상자만 선명하고 다른 답 상자는 흐리다.
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const group of answerIds) {
        for (const id of members[group]) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', group === scenario.answer ? '1' : '0.25')
      }
      for (const id of members.server) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', '1')
    }

    // 본문의 예와 같은 차례다.
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join('\n')
    const listed = (answer: string[]) => answer.map((address) => `\`${address}\``).join(', ')
    expect(body).toContain(`어떤 질의의 응답이 ${listed(answers[0])}의 차례였다면`)
    expect(body).toContain(`차례를 하나 돌려 ${listed(answers[1])}이 되고`)
    expect(body).toContain(`그다음 질의의 응답은 ${listed(answers[2])}이 된다`)
    expect(body).toContain('응답마다 세 주소가 모두 실리고, 바뀌는 것은 차례뿐이다')
  })
}

describe('RoundRobinAnswersDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<RoundRobinAnswersDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 288')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('질의 2')
      const tallOpacity = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('opacity'))
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 136')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('opacity'))).toEqual(tallOpacity)
      expect(screen.getByRole('button', { name: '질의 2' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
    })
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<RoundRobinAnswersDiagram />)
    const text = visualsByTopicId[topicId].diagrams['round-robin-answers']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(roundRobinAnswersScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toBeUndefined()
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
      const scenario = roundRobinAnswersScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual([])
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 DNS 라운드 로빈 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(within(figure).queryByRole('heading')).toBeNull()
  })
})
