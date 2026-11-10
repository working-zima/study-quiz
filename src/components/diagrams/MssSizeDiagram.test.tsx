import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { MssSizeDiagram, mssSizeScenarios } from './MssSizeDiagram'

const topicId = 'tcp-udp'
const anchorConceptId = `${topicId}.mss`
const labels: Record<string, string> = {
  'ip-header': 'IPv4 헤더 20바이트',
  'tcp-header': 'TCP 헤더 20바이트',
  data: '데이터 1460바이트',
}
const groupLabels: Record<string, string> = { mtu: 'MTU 1500바이트', mss: 'MSS 1460바이트' }
const noteLabels: Record<string, string> = { 'mtu-sum': '20 + 20 + 1460 = 1500바이트', 'mss-calc': '1500 − 20 − 20 = 1460바이트' }
// 계산 곁말은 자기 시나리오에서만 보인다.
const noteScenario: Record<string, string> = { 'mtu-sum': 'mtu', 'mss-calc': 'mss' }
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
// 노드마다 들어 있어야 할 가장 안쪽 그룹.
const membership: Record<string, string> = { 'ip-header': 'mtu', 'tcp-header': 'mtu', data: 'mss' }

const question = 'MSS는 패킷의 어느 부분 크기일까?'
const figureName = 'MTU 1500바이트인 IP 패킷 하나를 IPv4 헤더·TCP 헤더·데이터 칸으로 나누고, MSS가 데이터 칸만 재는 것을 보이는 도식'
const svgName = 'MTU 1500바이트 박스 안에 IPv4 헤더 20바이트, TCP 헤더 20바이트, 그리고 MSS 1460바이트 박스로 묶은 데이터 1460바이트를 차례로 놓은 그림'
const idleCaption = '이더넷 링크로 보내는 IP 패킷 하나를 앞에서부터 IPv4 헤더, TCP 헤더, 데이터 칸으로 나눴다. 버튼을 고르면 MTU와 MSS가 각각 어디까지를 재는지 볼 수 있다.'
const legend = '노드 하나가 IP 패킷의 한 칸이고, 패킷의 앞 칸부터 차례로 놓았다. 바깥 박스는 MTU가 재는 범위, 안쪽 박스는 MSS가 재는 범위이고, 박스 아래 곁말은 크기 계산이다.'
const expectedScenarios = [
  {
    id: 'mtu', label: 'MTU',
    nodes: ['ip-header', 'tcp-header', 'data'],
    caption: '이더넷 링크가 한 번에 실어 나르는 IP 패킷 전체가 1500바이트다. MTU는 IPv4 헤더와 TCP 헤더까지 친 패킷 전체를 잰다.',
  },
  {
    id: 'mss', label: 'MSS',
    nodes: ['data'],
    caption: 'MTU에서 두 헤더를 뺀 데이터 칸만 1460바이트다. MSS는 이 데이터 칸만 재고, TCP 헤더는 그 앞에 따로 붙는다.',
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

const groupLabelBox = (id: string) => textBox(svg().querySelector(`[data-group-label="${id}"]`)!, `${id}-label`)
// 「… 20바이트」 같은 글에서 바이트 수를 꺼낸다.
const bytesOf = (text: string) => Number(text.match(/(\d+)바이트$/u)![1])

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 124] : [0, 0, 280, 184]

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<MssSizeDiagram />)
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
    const { container } = render(<MssSizeDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(svg().querySelectorAll('path')).toHaveLength(0)
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드와 계산 곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<MssSizeDiagram />)
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
    render(<MssSizeDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    expect(contains(groupBox('mtu'), groupBox('mss'))).toBe(true)
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      expect(contains(groupBox(membership[id]), nodeBox(id)), id).toBe(true)
      if (membership[id] !== 'mss') expect(overlaps(groupBox('mss'), nodeBox(id)), id).toBe(false)
    }
    for (let i = 0; i < nodeIds.length; i += 1) {
      for (const other of nodeIds.slice(i + 1)) expect(overlaps(nodeBox(nodeIds[i]), nodeBox(other)), `${nodeIds[i]} ↔ ${other}`).toBe(false)
    }
    // 패킷의 앞 칸부터 차례로 — 세로형은 위에서 아래로, 가로형은 왼쪽에서 오른쪽으로 놓는다.
    const along = (id: string) => (wide ? nodeBox(id).x : nodeBox(id).y)
    expect(along('ip-header')).toBeLessThan(along('tcp-header'))
    expect(along('tcp-header')).toBeLessThan(along('data'))
    const groupTexts = groupIds.map((id) => {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      return box
    })
    const mtu = groupBox('mtu')
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const noteTexts = shownNotes().map((id) => {
        const element = note(id)!
        expect(element).toHaveAttribute('font-size', '9')
        expect(element).toHaveClass('fill-muted')
        const box = textBox(element, id)
        // 계산 곁말은 MTU 박스 아래에 놓인다.
        expect(box.y, id).toBeGreaterThanOrEqual(mtu.y + mtu.height)
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

  // 요점: 세 칸의 크기를 더하면 MTU이고, MSS 박스는 데이터 칸만 품으며 그 크기가 데이터 칸과 같다. MSS를 고르면 데이터 칸 하나만 선명하다.
  it('세 칸을 더하면 MTU이고, MSS는 두 헤더를 뺀 데이터 칸 하나만 잰다', async () => {
    render(<MssSizeDiagram />)
    const mtuBytes = bytesOf(groupLabel('mtu'))
    const mssBytes = bytesOf(groupLabel('mss'))
    expect(nodeIds.reduce((sum, id) => sum + bytesOf(label(id)), 0)).toBe(mtuBytes)
    expect(mssBytes).toBe(bytesOf(label('data')))
    expect(mtuBytes - bytesOf(label('ip-header')) - bytesOf(label('tcp-header'))).toBe(mssBytes)
    expect(nodeIds.filter((id) => contains(groupBox('mss'), nodeBox(id)))).toEqual(['data'])

    await select('MSS')
    expect(brightNodes()).toEqual(['data'])
    const [minuend, ...subtrahends] = note('mss-calc')!.textContent!.split(' = ')[0].split(' − ').map(Number)
    expect(minuend - subtrahends.reduce((sum, value) => sum + value, 0)).toBe(mssBytes)
    expect(bytesOf(note('mss-calc')!.textContent!)).toBe(mssBytes)

    await select('MTU')
    expect(brightNodes()).toEqual(nodeIds)
    const addends = note('mtu-sum')!.textContent!.split(' = ')[0].split(' + ').map(Number)
    expect(addends).toEqual(nodeIds.map((id) => bytesOf(label(id))))
    expect(bytesOf(note('mtu-sum')!.textContent!)).toBe(mtuBytes)

    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join('\n')
    expect(body).toContain('이더넷의 링크는 MTU가 대개 1500바이트다')
    expect(body).toContain('IPv4의 헤더는 덧붙는 정보, 곧 옵션이 없으면 20바이트')
    expect(body).toContain('TCP 헤더도 옵션이 없으면 20바이트')
    expect(body).toContain('1500 − 20 − 20 = 1460바이트')
    expect(body).toContain('MSS가 세는 것은 TCP 헤더를 뺀 데이터 부분뿐이다')
  })
}

describe('MssSizeDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<MssSizeDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 184')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('MSS')
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 124')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: 'MSS' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownNotes()).toEqual(tallNotes)
    })
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<MssSizeDiagram />)
    const text = visualsByTopicId[topicId].diagrams['mss-size']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(mssSizeScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = mssSizeScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual([])
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 MSS 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
