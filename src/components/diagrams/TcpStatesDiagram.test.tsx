import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { TcpStatesDiagram, tcpStatesScenarios } from './TcpStatesDiagram'

const topicId = 'tcp-connection'
const anchorConceptId = `${topicId}.tcp-states`
// 본문 목록의 차례와 같다.
const labels: Record<string, string> = {
  closed: 'CLOSED',
  listen: 'LISTEN',
  'syn-sent': 'SYN-SENT',
  'syn-received': 'SYN-RECEIVED',
  established: 'ESTABLISHED',
  'fin-wait-1': 'FIN-WAIT-1',
  'fin-wait-2': 'FIN-WAIT-2',
  'close-wait': 'CLOSE-WAIT',
  closing: 'CLOSING',
  'last-ack': 'LAST-ACK',
  'time-wait': 'TIME-WAIT',
}
const groupLabels: Record<string, string> = { before: '연결 전', opening: '맺는 중', established: '연결됨', closing: '끊는 중' }
const noteLabels: Record<string, string> = { 'active-note': '먼저 끊는 쪽', 'passive-note': '나중에 끊는 쪽' }
// 곁말은 자기 줄 첫 노드의 흐림을 따르고, 그 노드 바로 위에 선다.
const noteOwner: Record<string, string> = { 'active-note': 'fin-wait-1', 'passive-note': 'close-wait' }
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const nodeGroup: Record<string, string> = {
  closed: 'before',
  listen: 'before',
  'syn-sent': 'opening',
  'syn-received': 'opening',
  established: 'established',
  'fin-wait-1': 'closing',
  'fin-wait-2': 'closing',
  'close-wait': 'closing',
  closing: 'closing',
  'last-ack': 'closing',
  'time-wait': 'closing',
}
const activeSide = ['fin-wait-1', 'fin-wait-2', 'closing', 'time-wait']
const passiveSide = ['close-wait', 'last-ack']

const question = 'TCP 연결은 어떤 상태들을 거칠까?'
const figureName = 'TCP 연결이 거치는 상태 열하나를 연결 전·맺는 중·연결됨·끊는 중 네 단계로 묶어 보이는 도식'
const svgName = '연결 전 박스에 CLOSED와 LISTEN, 맺는 중 박스에 SYN-SENT와 SYN-RECEIVED, 연결됨 박스에 ESTABLISHED, 끊는 중 박스에 먼저 끊는 쪽의 FIN-WAIT-1·FIN-WAIT-2·CLOSING·TIME-WAIT와 나중에 끊는 쪽의 CLOSE-WAIT·LAST-ACK를 놓은 그림'
const idleCaption = 'TCP 연결이 거치는 상태 열하나를 연결이 어느 단계에 있는지로 묶어 놓았다. 버튼을 고르면 단계마다 그 상태들이 무엇을 기다리는지 볼 수 있다.'
const legend = '얇은 선 박스 하나가 연결의 한 단계이고, 박스 안의 노드가 그 단계의 상태다. 끊는 중 박스 안의 곁말은 그 줄의 상태를 먼저 끊는 쪽과 나중에 끊는 쪽 가운데 어느 쪽이 거치는지 알린다.'
const expectedScenarios = [
  {
    id: 'before', label: '연결 전', nodes: ['closed', 'listen'],
    caption: 'CLOSED는 연결이 없는 때다. LISTEN은 서버가 포트를 열어 두고 어느 클라이언트에게서든 연결을 청하는 SYN이 오기를 기다리는 상태다. 둘 다 아직 연결이 맺어지지 않은 상태다.',
  },
  {
    id: 'opening', label: '맺는 중', nodes: ['syn-sent', 'syn-received'],
    caption: '3-way handshake가 오가는 동안이다. SYN을 보낸 클라이언트는 SYN-SENT에서 서버의 SYN+ACK를 기다리고, SYN+ACK로 답한 서버는 SYN-RECEIVED에서 클라이언트의 ACK를 기다린다.',
  },
  {
    id: 'established', label: '연결됨', nodes: ['established'],
    caption: 'ESTABLISHED는 연결이 맺어진 상태다. 무엇이 오기를 기다리는 상태가 아니라, 두 쪽이 데이터를 주고받는 동안 머무는 보통의 상태다.',
  },
  {
    id: 'closing', label: '끊는 중', nodes: ['fin-wait-1', 'fin-wait-2', 'close-wait', 'closing', 'last-ack', 'time-wait'],
    caption: 'FIN과 ACK를 주고받으며 연결을 끊는 동안이다. 먼저 끊는 쪽은 FIN-WAIT-1·FIN-WAIT-2·CLOSING·TIME-WAIT를, 나중에 끊는 쪽은 CLOSE-WAIT·LAST-ACK를 거친다. CLOSING은 두 쪽이 거의 함께 FIN을 보냈을 때 거친다.',
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
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)!
const brightNodes = () => nodeIds.filter((id) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')

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

const groupLabelBox = (id: string) => textBox(svg().querySelector(`[data-group-label="${id}"]`)!, `${id}-label`)

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 256] : [0, 0, 280, 416]
  // 끊는 중 박스 안에서 한 쪽이 거치는 상태들은 세로형에서는 한 열(같은 x), 가로형에서는 한 줄(같은 y)에 선다.
  const sameLine = (a: SvgBox, b: SvgBox) => (wide ? a.y === b.y : a.x === b.x)

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<TcpStatesDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 곁말이 모두 선명하고 경로 없이 선택 안내가 나온다', () => {
    const { container } = render(<TcpStatesDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node], [data-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(Array.from(svg().querySelectorAll('[data-note]'), (item) => item.getAttribute('data-note'))).toEqual(Object.keys(noteLabels))
    for (const id of groupIds) expect(svg().querySelector(`[data-group-label="${id}"]`)!.textContent).toBe(groupLabels[id])
    expect(svg().querySelectorAll('path, line, polyline')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 그 단계의 노드와 곁말만 선명하고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<TcpStatesDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    for (const [id, owner] of Object.entries(noteOwner)) expect(note(id), id).toHaveAttribute('opacity', scenario.nodes.includes(owner) ? '1' : '0.25')
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말·그룹 라벨이 자리에 들어간다`, () => {
    render(<TcpStatesDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
    }
    for (let i = 0; i < nodeIds.length; i += 1) {
      for (const other of nodeIds.slice(i + 1)) expect(overlaps(nodeBox(nodeIds[i]), nodeBox(other)), `${nodeIds[i]} ↔ ${other}`).toBe(false)
    }
    for (let i = 0; i < groupIds.length; i += 1) {
      for (const other of groupIds.slice(i + 1)) expect(overlaps(groupBox(groupIds[i]), groupBox(other)), `${groupIds[i]} ↔ ${other}`).toBe(false)
    }
    const texts: SvgBox[] = []
    for (const id of groupIds) {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      texts.push(box)
    }
    for (const [id, owner] of Object.entries(noteOwner)) {
      expect(note(id)).toHaveAttribute('font-size', '9')
      expect(note(id)).toHaveClass('fill-muted')
      expect(note(id).textContent).toBe(noteLabels[id])
      const box = textBox(note(id), id)
      // 곁말은 끊는 중 박스 안, 자기 줄 첫 노드 바로 위에서 그 노드와 같은 왼쪽 끝으로 선다.
      expect(contains(groupBox('closing'), box), id).toBe(true)
      expect(box.x, id).toBe(nodeBox(owner).x)
      expect(box.y + box.height, id).toBeLessThanOrEqual(nodeBox(owner).y)
      expect(nodeBox(owner).y - (box.y + box.height), id).toBeLessThanOrEqual(12)
      texts.push(box)
    }
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
    // 한 쪽이 거치는 상태들은 한 줄에 서고, 두 쪽의 줄은 겹치지 않는다.
    for (const id of activeSide) expect(sameLine(nodeBox(id), nodeBox('fin-wait-1')), id).toBe(true)
    for (const id of passiveSide) expect(sameLine(nodeBox(id), nodeBox('close-wait')), id).toBe(true)
    expect(sameLine(nodeBox('fin-wait-1'), nodeBox('close-wait'))).toBe(false)
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  // 요점: 상태 노드는 열하나이고 라벨이 본문 목록의 차례와 같다. 각 상태는 단계 박스 하나에만 든다.
  // 네 단계를 고르면 선명한 노드가 그 단계 박스의 노드 전부이고, 넷을 합하면 열하나가 겹치지 않고 모두 나온다.
  it('상태 열하나가 본문 목록과 같고, 단계마다 겹치지 않게 나뉜다', async () => {
    render(<TcpStatesDiagram />)
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const listed = concept.paragraphs.filter((paragraph) => paragraph.startsWith('- **')).map((paragraph) => paragraph.match(/^- \*\*([^*]+)\*\*/u)![1])
    expect(nodeIds).toHaveLength(11)
    expect(nodeIds.map(label)).toEqual(listed)
    for (const id of nodeIds) {
      const holders = groupIds.filter((group) => contains(groupBox(group), nodeBox(id)))
      expect(holders, id).toEqual([nodeGroup[id]])
    }
    const seen: string[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const bright = brightNodes()
      expect(bright, scenario.id).toEqual(nodeIds.filter((id) => contains(groupBox(scenario.id), nodeBox(id))))
      expect(svg().querySelector(`[data-group-label="${scenario.id}"]`)!.textContent).toBe(scenario.label)
      for (const id of bright) expect(seen, id).not.toContain(id)
      seen.push(...bright)
    }
    expect([...seen].sort()).toEqual([...nodeIds].sort())

    const body = concept.paragraphs.join('\n')
    expect(body).toContain('`CLOSED`와 `LISTEN`은 아직 연결이 맺어지지 않은 연결 전의 상태')
    expect(body).toContain('`SYN-SENT`와 `SYN-RECEIVED`는 3-way handshake가 오가는 맺는 중의 상태')
    expect(body).toContain('`ESTABLISHED`는 데이터를 주고받는 연결됨의 상태')
    expect(body).toContain('나머지 여섯은 FIN과 ACK를 주고받는 끊는 중의 상태다')
    expect(body).toContain(`${activeSide.map((id) => `\`${labels[id]}\``).join('·')}는 먼저 끊는 쪽이 거치는 상태`)
    expect(body).toContain(`${passiveSide.map((id) => `\`${labels[id]}\``).join('·')}는 나중에 끊는 쪽이 거치는 상태`)
  })
}

describe('TcpStatesDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<TcpStatesDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 416')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('끊는 중')
      const tallBright = brightNodes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 256')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '끊는 중' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(brightNodes()).toEqual(tallBright)
    })
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<TcpStatesDiagram />)
    const text = visualsByTopicId[topicId].diagrams['tcp-states']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(tcpStatesScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = tcpStatesScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual([])
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 TCP 상태 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(screen.getAllByRole('figure')).toEqual([figure])
  })
})
