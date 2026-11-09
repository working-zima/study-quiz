import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { isListItem, stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { UdpHeaderDiagram, udpHeaderScenarios } from './UdpHeaderDiagram'

const topicId = 'tcp-udp'
const anchorConceptId = `${topicId}.udp-header`
const labels: Record<string, string> = {
  'src-port': '출발지 포트 16비트',
  'dst-port': '목적지 포트 16비트',
  length: '길이 16비트',
  checksum: '체크섬 16비트',
  'tcp-seq': '순서 번호',
  'tcp-ack': '확인 응답 번호',
  'tcp-control': '제어 비트',
  'tcp-window': '윈도우',
}
const groupLabels: Record<string, string> = { header: 'UDP 헤더', 'tcp-only': 'TCP 헤더에만 있는 칸' }
const noteLabels: Record<string, string> = { size: '늘 8바이트' }
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
// UDP 헤더의 32비트 줄 둘과, 그 밖에 모은 TCP 헤더에만 있는 칸 넷.
const rows = [
  ['src-port', 'dst-port'],
  ['length', 'checksum'],
]
const headerIds = rows.flat()
const tcpOnlyIds = ['tcp-seq', 'tcp-ack', 'tcp-control', 'tcp-window']

const question = 'UDP 헤더에는 무엇이 있고 무엇이 없을까?'
const figureName = 'UDP 데이터그램 헤더의 칸을 32비트 줄로 보이고, TCP 헤더에만 있는 칸과 견주는 도식'
const svgName = 'UDP 헤더의 칸 넷을 출발지 포트부터 체크섬까지 32비트 두 줄로 이어 붙이고 칸마다 비트 수를 적은 그림. 그 아래에 TCP 헤더에만 있는 순서 번호·확인 응답 번호·제어 비트·윈도우를 따로 모았다'
const idleCaption = 'UDP 데이터그램 헤더의 칸 넷을 TCP 헤더처럼 한 줄에 32비트씩 끊어 놓았다. 두 줄, 8바이트다. 아래 상자는 TCP 헤더에는 있지만 UDP 헤더에는 없는 칸이다. 버튼을 고르면 칸마다 하는 일을 볼 수 있다.'
const legend = '위 상자의 칸은 헤더 안의 차례대로 왼쪽에서 오른쪽, 위에서 아래로 이어지고, 칸마다 적은 숫자가 그 칸의 비트 수다. 아래 상자의 칸은 헤더의 줄이 아니라 UDP 헤더에 없는 칸을 모아 둔 것이다.'
const expectedScenarios = [
  {
    id: 'ports', label: '포트',
    nodes: ['src-port', 'dst-port'],
    caption: '출발지 포트는 데이터그램을 보낸 프로그램을, 목적지 포트는 받을 프로그램을 가리킨다. 받는 쪽은 TCP처럼 목적지 포트로 데이터를 넘길 프로그램을 가린다. 답을 받을 필요가 없으면 출발지 포트에는 0을 넣어도 된다.',
  },
  {
    id: 'length-checksum', label: '길이와 체크섬',
    nodes: ['length', 'checksum'],
    caption: '길이는 헤더 8바이트와 데이터를 합친 데이터그램 전체의 바이트 수라서, 길이에서 8을 빼면 데이터의 크기가 나온다. 체크섬은 오는 길에 망가졌는지 검사하는 값이고, 값이 맞지 않는 데이터그램은 받는 쪽이 버린다.',
  },
  {
    id: 'missing', label: '없는 칸',
    nodes: tcpOnlyIds,
    caption: '순서 번호·확인 응답 번호·제어 비트·윈도우는 TCP 헤더에만 있다. 그래서 UDP는 데이터그램의 차례를 맞추지 않고, 받았다고 확인하지 않고, 연결을 시작하거나 끝내는 표시를 주고받지 않고, 보내는 양을 받는 쪽에 맞춰 줄이지 않는다.',
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
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)!
const brightNodes = () => nodeIds.filter((id) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (item) => item.getAttribute('data-note')!)
// 「… 16비트」 같은 라벨에서 비트 수를 꺼낸다.
const bitsOf = (text: string) => Number(text.match(/(\d+)비트$/u)![1])

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 176] : [0, 0, 280, 216]

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<UdpHeaderDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 칸이 모두 선명하고 선이 없으며 크기 곁말과 선택 안내가 나온다', () => {
    const { container } = render(<UdpHeaderDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(svg().querySelectorAll('path')).toHaveLength(0)
    expect(shownNotes()).toEqual(noteIds)
    for (const id of noteIds) expect(note(id).textContent).toBe(noteLabels[id])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 칸만 선명하고 곁말과 그룹 박스는 그대로다', async (scenario) => {
    const { container } = render(<UdpHeaderDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownNotes()).toEqual(noteIds)
    expect(svg().querySelectorAll('path')).toHaveLength(0)
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말·그룹 라벨이 자리에 들어간다`, () => {
    render(<UdpHeaderDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    expect(overlaps(groupBox('header'), groupBox('tcp-only'))).toBe(false)
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      // UDP 헤더의 칸은 위 상자에, TCP 헤더에만 있는 칸은 아래 상자에 들고, 다른 상자와는 겹치지 않는다.
      const own = headerIds.includes(id) ? 'header' : 'tcp-only'
      const other = own === 'header' ? 'tcp-only' : 'header'
      expect(contains(groupBox(own), nodeBox(id)), id).toBe(true)
      expect(overlaps(groupBox(other), nodeBox(id)), id).toBe(false)
    }
    for (let i = 0; i < nodeIds.length; i += 1) {
      for (const other of nodeIds.slice(i + 1)) expect(overlaps(nodeBox(nodeIds[i]), nodeBox(other)), `${nodeIds[i]} ↔ ${other}`).toBe(false)
    }
    const groupTexts = groupIds.map((id) => {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = textBox(svg().querySelector(`[data-group-label="${id}"]`)!, `${id}-label`)
      expect(contains(groupBox(id), box), id).toBe(true)
      return box
    })
    const noteTexts = noteIds.map((id) => {
      expect(note(id)).toHaveAttribute('font-size', '9')
      expect(note(id)).toHaveClass('fill-muted')
      return textBox(note(id), id)
    })
    // 크기 곁말은 UDP 헤더 상자 안 라벨 줄에 놓인다.
    expect(contains(groupBox('header'), noteTexts[0])).toBe(true)
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
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('UDP 헤더의 32비트 두 줄이 빈틈없이 이어지고, TCP 헤더에만 있는 칸은 그 아래 따로 떨어져 있다', () => {
    render(<UdpHeaderDiagram />)
    const right = viewBox[2] - 8
    for (const [index, row] of rows.entries()) {
      // 줄마다 칸이 같은 높이에서 왼쪽 끝(8)부터 오른쪽 끝까지 맞붙는다.
      const boxes = row.map(nodeBox)
      expect(boxes[0].x, `줄 ${index + 1}`).toBe(8)
      expect(boxes[boxes.length - 1].x + boxes[boxes.length - 1].width, `줄 ${index + 1}`).toBe(right)
      for (let i = 1; i < boxes.length; i += 1) {
        expect(boxes[i].y).toBe(boxes[0].y)
        expect(boxes[i].x).toBe(boxes[i - 1].x + boxes[i - 1].width)
      }
    }
    expect(nodeBox(rows[1][0]).y).toBe(nodeBox(rows[0][0]).y + 32)
    // 아래 상자는 UDP 헤더 상자보다 아래에 떨어져 있고, 그 칸들은 서로 맞붙지 않는다 — 헤더의 줄이 아니라 모아 둔 칸이다.
    expect(groupBox('tcp-only').y).toBeGreaterThan(groupBox('header').y + groupBox('header').height)
    const tcpBoxes = tcpOnlyIds.map(nodeBox)
    for (let i = 0; i < tcpBoxes.length; i += 1) {
      for (const other of tcpBoxes.slice(i + 1)) {
        const sameRow = other.y === tcpBoxes[i].y
        if (sameRow) expect(Math.abs(other.x - (tcpBoxes[i].x + tcpBoxes[i].width)), `${tcpBoxes[i].id} ↔ ${other.id}`).toBeGreaterThan(0)
      }
    }
  })

  // 요점: UDP 헤더는 32비트 줄 둘이라 64비트 = 8바이트이고, 없는 칸을 고르면 윈도우·확인 응답 번호 같은 TCP 헤더의 칸만 선명하다.
  it('두 줄이 32비트씩이라 8바이트이고, 없는 칸은 TCP 헤더의 칸이다', async () => {
    render(<UdpHeaderDiagram />)
    expect(rows).toHaveLength(2)
    for (const row of rows) expect(row.reduce((sum, id) => sum + bitsOf(label(id)), 0), row.join(',')).toBe(32)
    expect((rows.length * 32) / 8).toBe(Number(noteLabels.size.match(/(\d+)바이트$/u)![1]))

    await select('없는 칸')
    const bright = brightNodes().map(label)
    expect(brightNodes()).toEqual(tcpOnlyIds)
    expect(bright.some((text) => text.includes('윈도우'))).toBe(true)
    expect(bright.some((text) => text.includes('확인 응답 번호'))).toBe(true)

    const conceptOf = (id: string) => topics.find(({ id: topic }) => topic === topicId)!.concepts.find((concept) => concept.id === id)!
    const namesOf = (id: string) => conceptOf(id).paragraphs.filter(isListItem).map((item) => item.match(/^- \*\*(.+?)\*\*/u)![1])
    // UDP 헤더 본문 목록의 굵은 이름 차례가 칸의 차례와 같고, 항목마다 같은 비트 수를 적는다.
    const udpItems = conceptOf(anchorConceptId).paragraphs.filter(isListItem)
    expect(namesOf(anchorConceptId)).toEqual(headerIds.map((id) => labels[id].replace(/ \d+비트$/u, '')))
    for (const [index, id] of headerIds.entries()) expect(udpItems[index], id).toContain(`${bitsOf(labels[id])}비트`)
    // 아래 상자의 칸은 TCP 헤더의 칸이고, UDP 헤더의 칸에는 없다.
    for (const id of tcpOnlyIds) {
      expect(namesOf(`${topicId}.tcp-header`), id).toContain(labels[id])
      expect(namesOf(anchorConceptId), id).not.toContain(labels[id])
    }
    const body = conceptOf(anchorConceptId).paragraphs.join('\n')
    expect(body).toContain('16 × 4 = 64비트, 곧 8바이트다')
    expect(body).toContain('순서 번호·확인 응답 번호·제어 비트·윈도우 칸은 UDP 헤더에 없다')
    expect(body).toContain('1008 − 8 = 1000바이트다')
  })
}

describe('UdpHeaderDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<UdpHeaderDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 216')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('없는 칸')
      const bright = brightNodes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 176')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '없는 칸' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(brightNodes()).toEqual(bright)
    })
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<UdpHeaderDiagram />)
    const text = visualsByTopicId[topicId].diagrams['udp-header-fields']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(udpHeaderScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = udpHeaderScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual([])
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 UDP 데이터그램 헤더 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
