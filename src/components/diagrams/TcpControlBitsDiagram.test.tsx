import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { isListItem, stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { TcpControlBitsDiagram, tcpControlBitsScenarios } from './TcpControlBitsDiagram'

const topicId = 'tcp-udp'
const anchorConceptId = `${topicId}.tcp-control-bits`
// 헤더 안의 차례대로다.
const labels: Record<string, string> = {
  ae: 'AE',
  cwr: 'CWR',
  ece: 'ECE',
  urg: 'URG',
  ack: 'ACK',
  psh: 'PSH',
  rst: 'RST',
  syn: 'SYN',
  fin: 'FIN',
}
const groupLabels: Record<string, string> = { bits: '제어 비트 · 9비트 · 칸마다 1비트' }
const noteLabels: Record<string, string> = {
  start: '연결을 시작하며 순서 번호의 시작을 알린다',
  confirm: '확인 응답 번호 칸이 유효하다',
  finish: '더 보낼 데이터가 없다 · 정상 종료',
  reset: '연결을 그 자리에서 지운다 · 비정상 종료나 거절',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)

const question = '제어 비트 아홉은 무엇을 알릴까?'
const figureName = 'TCP 헤더의 제어 비트 아홉을 헤더 안의 차례대로 보이고, 고른 비트가 무엇을 알리는지 보이는 도식'
const svgName = 'AE, CWR, ECE, URG, ACK, PSH, RST, SYN, FIN 아홉 칸을 헤더 안의 차례대로 빈틈없이 이어 놓은 그림. 칸 하나가 1비트다'
const idleCaption = 'TCP 헤더의 제어 비트 아홉을 헤더 안의 차례대로 놓았다. 보내는 쪽은 칸마다 켜거나(1) 꺼서(0) 이 세그먼트가 할 일을 알린다. 버튼을 고르면 자주 쓰는 비트 넷이 무엇을 알리는지 볼 수 있다.'
const legend = '칸 하나가 1비트이고, 칸은 헤더 안의 차례대로 왼쪽에서 오른쪽으로 이어지며 한 줄에 다 들지 않으면 다음 줄로 이어진다. 칸 아래의 곁말은 고른 비트를 켰을 때 받는 쪽에 알리는 뜻이다.'
const expectedScenarios = [
  {
    id: 'start', label: '연결 시작', bit: 'SYN',
    nodes: ['syn'],
    caption: 'SYN은 연결을 시작하는 세그먼트에 켠다. 이 세그먼트는 자기 순서 번호가 어디서 시작하는지, 곧 ISN을 상대에게 알리고, SYN은 데이터가 아닌데도 순서 번호 하나를 차지한다.',
  },
  {
    id: 'confirm', label: '확인', bit: 'ACK',
    nodes: ['ack'],
    caption: 'ACK는 이 세그먼트의 확인 응답 번호 칸이 유효하다는 표시다. 연결이 맺어진 뒤에는 데이터를 실은 세그먼트를 포함해 모든 세그먼트가 ACK를 켜고, 상대에게서 받은 데까지를 함께 알린다.',
  },
  {
    id: 'finish', label: '정상 종료', bit: 'FIN',
    nodes: ['fin'],
    caption: 'FIN은 이 세그먼트를 보낸 쪽이 더 보낼 데이터가 없다는 표시로, 연결을 정상으로 끝낼 때 쓴다. 보내기를 마친 쪽도 상대가 보내는 데이터는 상대가 끝낼 때까지 계속 받는다.',
  },
  {
    id: 'reset', label: '재설정', bit: 'RST',
    nodes: ['rst'],
    caption: 'RST는 연결을 그 자리에서 지우라는 표시라, 남은 데이터를 더 주고받지 않는다. 연결을 비정상으로 끊거나, 아무 프로그램도 기다리지 않는 포트로 온 연결 요청을 거절할 때 쓴다.',
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 96] : [0, 0, 280, 156]

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<TcpControlBitsDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 칸이 모두 선명하고 선과 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<TcpControlBitsDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(svg().querySelectorAll('path')).toHaveLength(0)
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 칸만 선명하고 그 뜻의 곁말이 보이며 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<TcpControlBitsDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownNotes()).toEqual([scenario.id])
    expect(note(scenario.id)!.textContent).toBe(noteLabels[scenario.id])
    expect(svg().querySelectorAll('path')).toHaveLength(0)
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말·그룹 라벨이 자리에 들어간다`, async () => {
    render(<TcpControlBitsDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    const bits = groupBox('bits')
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      expect(contains(bits, nodeBox(id)), id).toBe(true)
    }
    for (let i = 0; i < nodeIds.length; i += 1) {
      for (const other of nodeIds.slice(i + 1)) expect(overlaps(nodeBox(nodeIds[i]), nodeBox(other)), `${nodeIds[i]} ↔ ${other}`).toBe(false)
    }
    expect(svg().querySelector('[data-group-label="bits"]')).toHaveAttribute('font-size', '9')
    const labelBox = textBox(svg().querySelector('[data-group-label="bits"]')!, 'bits-label')
    expect(contains(bits, labelBox)).toBe(true)
    for (const id of nodeIds) expect(overlaps(labelBox, nodeBox(id)), id).toBe(false)
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const element = note(scenario.id)!
      expect(element).toHaveAttribute('font-size', '9')
      expect(element).toHaveClass('fill-muted')
      const box = textBox(element, scenario.id)
      // 뜻의 곁말은 칸 묶음 아래에 놓이고 그림 안에 든다.
      expect(box.y, scenario.id).toBeGreaterThanOrEqual(bits.y + bits.height)
      expect(box.x, scenario.id).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width, scenario.id).toBeLessThanOrEqual(viewBox[2])
      expect(box.y + box.height, scenario.id).toBeLessThanOrEqual(viewBox[3])
      for (const id of nodeIds) expect(overlaps(box, nodeBox(id)), `${scenario.id} ↔ ${id}`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('아홉 칸이 헤더의 차례대로 빈틈없이 이어진다', () => {
    render(<TcpControlBitsDiagram />)
    const first = nodeBox(nodeIds[0])
    const right = Math.max(...nodeIds.map((id) => nodeBox(id).x + nodeBox(id).width))
    for (let i = 1; i < nodeIds.length; i += 1) {
      const before = nodeBox(nodeIds[i - 1])
      const after = nodeBox(nodeIds[i])
      if (after.y === before.y) {
        // 같은 줄에서는 앞 칸의 오른쪽 변에 맞붙는다.
        expect(after.x, nodeIds[i]).toBe(before.x + before.width)
      } else {
        // 줄이 바뀌면 앞 줄 바로 아래, 첫 칸과 같은 왼쪽 끝에서 다시 시작하고, 앞 줄은 오른쪽 끝까지 찼다.
        expect(after.y, nodeIds[i]).toBe(before.y + 32)
        expect(after.x, nodeIds[i]).toBe(first.x)
        expect(before.x + before.width, nodeIds[i - 1]).toBe(right)
      }
    }
    // 마지막 칸도 오른쪽 끝까지 찬다 — 줄마다 칸 수가 같다.
    const last = nodeBox(nodeIds[nodeIds.length - 1])
    expect(last.x + last.width).toBe(right)
  })

  // 요점: 칸이 아홉이고 라벨이 헤더의 차례(AE부터 FIN까지)와 같다. 시나리오마다 선명한 칸은 하나이고, 그 비트가 시나리오가 말하는 비트다.
  it('칸은 아홉이고 헤더의 차례와 같으며, 시나리오마다 비트 하나가 무엇을 알리는지 보인다', async () => {
    render(<TcpControlBitsDiagram />)
    expect(svg().querySelectorAll('[data-node]')).toHaveLength(9)
    expect(nodeIds.map(label)).toEqual(['AE', 'CWR', 'ECE', 'URG', 'ACK', 'PSH', 'RST', 'SYN', 'FIN'])
    expect(Number(groupLabel('bits').match(/(\d+)비트/u)![1])).toBe(nodeIds.length)

    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      expect(brightNodes(), scenario.id).toHaveLength(1)
      expect(label(brightNodes()[0]), scenario.id).toBe(scenario.bit)
      expect(scenario.caption.startsWith(`${scenario.bit}은`) || scenario.caption.startsWith(`${scenario.bit}는`), scenario.id).toBe(true)
    }

    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    // 본문 목록의 굵은 이름 차례가 칸의 차례와 같다.
    const names = concept.paragraphs.filter(isListItem).flatMap((item) => Array.from(item.matchAll(/\*\*(.+?)\*\*/gu), (match) => match[1]))
    expect(names).toEqual(nodeIds.map(label))
    const body = concept.paragraphs.join('\n')
    expect(body).toContain('TCP 헤더 넷째 줄의 9비트 칸')
    expect(body).toContain('1비트짜리 표시 9개')
    expect(body).toContain('이름 붙은 제어 비트를 9개로 둔다')
  })
}

describe('TcpControlBitsDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('한 줄에 아홉 칸을 둔다', () => {
      render(<TcpControlBitsDiagram />)
      expect(new Set(nodeIds.map((id) => nodeBox(id).y)).size).toBe(1)
    })

    it('노드·그룹 id 집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<TcpControlBitsDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 156')
      expect(new Set(nodeIds.map((id) => nodeBox(id).y)).size).toBe(3)
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('재설정')
      const bright = brightNodes()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 96')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '재설정' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(brightNodes()).toEqual(bright)
      expect(shownNotes()).toEqual(tallNotes)
    })
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<TcpControlBitsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['tcp-control-bits']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(tcpControlBitsScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = tcpControlBitsScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual([])
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 TCP 제어 비트 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
