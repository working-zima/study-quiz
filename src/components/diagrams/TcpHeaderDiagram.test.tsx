import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { isListItem, stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { TcpHeaderDiagram, tcpHeaderScenarios } from './TcpHeaderDiagram'

const topicId = 'tcp-udp'
const anchorConceptId = `${topicId}.tcp-header`
const labels: Record<string, string> = {
  'src-port': '출발지 포트 16비트',
  'dst-port': '목적지 포트 16비트',
  seq: '순서 번호 32비트',
  ack: '확인 응답 번호 32비트',
  offset: '데이터 오프셋 4비트',
  reserved: '예약 3비트',
  control: '제어 비트 9비트',
  window: '윈도우 16비트',
  checksum: '체크섬 16비트',
  urgent: '긴급 포인터 16비트',
  options: '옵션',
}
const groupLabels: Record<string, string> = { header: 'TCP 헤더', row4: '넷째 줄 · 4 + 3 + 9 + 16 = 32비트' }
const noteLabels: Record<string, string> = { size: '옵션이 없으면 20바이트', options: '옵션은 붙는 만큼 길어진다 · 헤더는 60바이트까지' }
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
// 옵션을 뺀 32비트 줄 다섯. 넷째 줄의 칸 넷은 세로형에서 두 줄로 나뉘어도 같은 줄이다.
const rows = [
  ['src-port', 'dst-port'],
  ['seq'],
  ['ack'],
  ['offset', 'reserved', 'control', 'window'],
  ['checksum', 'urgent'],
]
const row4 = rows[3]

const question = 'TCP 헤더에는 어떤 칸이 들어 있을까?'
const figureName = 'TCP 세그먼트 헤더의 칸을 32비트 줄로 보이는 도식'
const svgName = 'TCP 헤더의 칸을 출발지 포트부터 옵션까지 차례대로 이어 붙이고 칸마다 비트 수를 적은 그림. 넷째 줄은 데이터 오프셋·예약·제어 비트·윈도우가 32비트를 나눠 쓴다'
const idleCaption = 'TCP 세그먼트 헤더의 칸을 표준 문서처럼 한 줄에 32비트씩 끊어 차례대로 놓았다. 옵션이 없으면 다섯 줄, 20바이트다. 버튼을 고르면 하는 일이 비슷한 칸끼리 볼 수 있다.'
const legend = '칸은 헤더 안의 차례대로 왼쪽에서 오른쪽, 위에서 아래로 이어지고, 칸마다 적은 숫자가 그 칸의 비트 수다. 칸의 너비는 비트 수에 꼭 비례하지 않는다. 넷째 줄을 나눠 쓰는 칸 넷은 상자 하나로 묶었다.'
const expectedScenarios = [
  {
    id: 'ports', label: '포트',
    nodes: ['src-port', 'dst-port'],
    caption: '출발지 포트는 세그먼트를 보낸 프로그램을, 목적지 포트는 받을 프로그램을 가리킨다. 받는 쪽은 목적지 포트로 데이터를 넘길 프로그램을 가리고, 답은 출발지 포트를 목적지로 적어 돌려보낸다.',
    sources: [anchorConceptId],
  },
  {
    id: 'numbers', label: '번호',
    nodes: ['seq', 'ack'],
    caption: '순서 번호는 이 세그먼트에 실린 데이터가 몇 번째 바이트부터인지 적고, 확인 응답 번호는 보낸 쪽이 상대에게서 다음에 받기를 기다리는 바이트의 번호를 적는다. 두 칸은 32비트로 한 줄씩 차지한다.',
    sources: [anchorConceptId],
  },
  {
    id: 'control', label: '제어',
    nodes: ['offset', 'control', 'window'],
    caption: '데이터 오프셋은 헤더 길이를 4바이트 단위로 적어 데이터가 어디서 시작하는지 알리고, 제어 비트는 세그먼트가 하는 일을, 윈도우는 보낸 쪽이 지금 더 받을 수 있는 바이트 수를 알린다.',
    sources: [anchorConceptId],
  },
  {
    id: 'error-check', label: '손상 검사',
    nodes: ['checksum'],
    caption: '체크섬은 헤더와 데이터에 의사 헤더까지 넣어 계산한 값이다. 받는 쪽은 같은 계산을 해 값이 맞지 않으면 오는 길에 망가진 것으로 보고 그 세그먼트를 쓰지 않는다.',
    sources: [anchorConceptId, `${topicId}.tcp`],
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 268] : [0, 0, 280, 300]

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<TcpHeaderDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 칸이 모두 선명하고 선이 없으며 크기 곁말 둘과 선택 안내가 나온다', () => {
    const { container } = render(<TcpHeaderDiagram />)
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
    const { container } = render(<TcpHeaderDiagram />)
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
    render(<TcpHeaderDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    expect(contains(groupBox('header'), groupBox('row4'))).toBe(true)
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      expect(contains(groupBox('header'), nodeBox(id)), id).toBe(true)
      // 넷째 줄 상자는 그 줄의 칸 넷만 품고, 다른 칸과 겹치지 않는다.
      if (row4.includes(id)) expect(contains(groupBox('row4'), nodeBox(id)), id).toBe(true)
      else expect(overlaps(groupBox('row4'), nodeBox(id)), id).toBe(false)
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
    const header = groupBox('header')
    // 크기 곁말은 헤더 상자 안 라벨 줄에, 옵션 곁말은 헤더 상자 아래에 놓인다.
    expect(contains(header, noteTexts[0])).toBe(true)
    expect(noteTexts[1].y).toBeGreaterThanOrEqual(header.y + header.height)
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

  it('32비트 줄이 위에서 아래로 빈틈없이 이어지고, 넷째 줄 상자가 셋째 줄과 다섯째 줄 사이를 채운다', () => {
    render(<TcpHeaderDiagram />)
    const right = viewBox[2] - 8
    for (const [index, row] of rows.entries()) {
      if (row === row4) continue
      // 넷째 줄이 아닌 줄은 칸이 같은 높이에서 왼쪽 끝(8)부터 오른쪽 끝까지 맞붙는다.
      const boxes = row.map(nodeBox)
      expect(boxes[0].x, `줄 ${index + 1}`).toBe(8)
      expect(boxes[boxes.length - 1].x + boxes[boxes.length - 1].width, `줄 ${index + 1}`).toBe(right)
      for (let i = 1; i < boxes.length; i += 1) {
        expect(boxes[i].y).toBe(boxes[0].y)
        expect(boxes[i].x).toBe(boxes[i - 1].x + boxes[i - 1].width)
      }
    }
    const rowTop = (row: string[]) => nodeBox(row[0]).y
    const box4 = groupBox('row4')
    expect(rowTop(rows[1])).toBe(rowTop(rows[0]) + 32)
    expect(rowTop(rows[2])).toBe(rowTop(rows[1]) + 32)
    expect(box4.y).toBe(rowTop(rows[2]) + 32)
    expect(rowTop(rows[4])).toBe(box4.y + box4.height)
    expect(box4.x).toBe(8)
    expect(box4.x + box4.width).toBe(right)
    expect(nodeBox('options').y).toBe(rowTop(rows[4]) + 32)
    expect(nodeBox('options').x).toBe(8)
    expect(nodeBox('options').width).toBe(right - 8)
    // 넷째 줄 안에서도 칸은 헤더의 차례대로 놓인다(위 줄에서 아래 줄로, 왼쪽에서 오른쪽으로).
    const order = row4.map(nodeBox)
    for (let i = 1; i < order.length; i += 1) {
      const before = order[i - 1]
      const after = order[i]
      expect(after.y > before.y || (after.y === before.y && after.x >= before.x + before.width), row4[i]).toBe(true)
    }
  })

  // 요점: 옵션을 뺀 줄마다 비트 수 합이 32이고, 그런 줄이 다섯이라 20바이트다. 손상 검사를 고르면 체크섬 하나만 선명하다.
  it('옵션을 뺀 다섯 줄이 32비트씩이라 20바이트이고, 손상 검사는 체크섬 하나다', async () => {
    render(<TcpHeaderDiagram />)
    for (const row of rows) expect(row.reduce((sum, id) => sum + bitsOf(label(id)), 0), row.join(',')).toBe(32)
    expect(rows.flat().sort()).toEqual(nodeIds.filter((id) => id !== 'options').sort())
    expect((rows.length * 32) / 8).toBe(Number(noteLabels.size.match(/(\d+)바이트$/u)![1]))
    const [addends, total] = groupLabel('row4').split(' · ')[1].split(' = ')
    expect(addends.split(' + ').map(Number)).toEqual(row4.map((id) => bitsOf(label(id))))
    expect(bitsOf(total)).toBe(32)

    await select('손상 검사')
    expect(brightNodes()).toEqual(['checksum'])

    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    // 본문 목록의 굵은 이름 차례가 칸의 차례와 같고, 항목마다 같은 비트 수를 적는다.
    const items = concept.paragraphs.filter(isListItem)
    const names = items.map((item) => item.match(/^- \*\*(.+?)\*\*/u)![1])
    expect(names).toEqual(nodeIds.map((id) => labels[id].replace(/ \d+비트$/u, '')))
    for (const [index, id] of nodeIds.entries()) {
      if (id === 'options') continue
      expect(items[index], id).toContain(`${bitsOf(labels[id])}비트`)
    }
    const body = concept.paragraphs.join('\n')
    expect(body).toContain('16 + 16 + 32 + 32 + 4 + 3 + 9 + 16 + 16 + 16 = 160비트, 곧 20바이트다')
    expect(body).toContain('4 + 3 + 9 + 16 = 32비트를 나눠 쓰고')
    expect(body).toContain('15 × 4 = 60바이트를 넘지 못한다')
  })
}

describe('TcpHeaderDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<TcpHeaderDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 300')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('제어')
      const bright = brightNodes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 268')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '제어' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(brightNodes()).toEqual(bright)
    })
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<TcpHeaderDiagram />)
    const text = visualsByTopicId[topicId].diagrams['tcp-header-fields']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(tcpHeaderScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = tcpHeaderScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: expected.sources })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual([])
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 TCP 세그먼트 헤더 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
