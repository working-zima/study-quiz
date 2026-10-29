import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { NetworkHostPartsDiagram, networkHostPartsScenarios } from './NetworkHostPartsDiagram'

const topicId = 'ip-addressing'
const anchorConceptId = `${topicId}.network-host`
const labels: Record<string, string> = {
  'a-1': '192', 'a-2': '0', 'a-3': '2', 'a-4': '1',
  'b-1': '192', 'b-2': '0', 'b-3': '2', 'b-4': '2',
}
const groupLabels = { network: '네트워크 부분', host: '호스트 부분' }
const noteLabels: Record<string, string> = {
  'row-a': '호스트 A', 'row-b': '호스트 B', 'network-bits': '앞 24비트', 'host-bits': '뒤 8비트',
}
// 곁말마다 흐림을 따르는 노드. 줄 이름표는 어느 시나리오에서나 선명하다.
const noteOwner: Record<string, string | null> = {
  'row-a': null, 'row-b': null, 'network-bits': 'a-1', 'host-bits': 'a-4',
}
const nodeIds = Object.keys(labels)
const networkNodes = ['a-1', 'a-2', 'a-3', 'b-1', 'b-2', 'b-3']
const hostNodes = ['a-4', 'b-4']

const question = 'IP 주소의 어디까지가 네트워크를 가리킬까?'
const figureName = '같은 네트워크에 있는 두 IPv4 주소에서 네트워크 부분과 호스트 부분을 보이는 도식'
const svgName = '호스트 A의 192.0.2.1과 호스트 B의 192.0.2.2를 옥텟 넷씩 두 줄로 놓고, 앞 세 옥텟을 네트워크 부분 박스로, 넷째 옥텟을 호스트 부분 박스로 묶은 모습'
const idleCaption = '주소의 앞 24비트가 네트워크 부분이라고 정한 예에서, 같은 네트워크에 있는 호스트 A의 192.0.2.1과 호스트 B의 192.0.2.2를 옥텟 넷씩 두 줄로 놓았다. 버튼을 고르면 두 주소에서 같은 부분과 다른 부분을 따로 볼 수 있다.'
const legend = '한 줄이 IPv4 주소 하나이고, 상자 하나가 옥텟 하나를 십진수로 적은 것이다. 얇은 선 박스는 이 예에서 정한 네트워크 부분과 호스트 부분이다.'
const expectedScenarios = [
  {
    id: 'network', label: '네트워크 부분', nodes: networkNodes,
    caption: '두 주소의 앞 세 옥텟은 192, 0, 2로 같다. 이 예에서는 이 앞 24비트가 네트워크 부분이고, 같은 네트워크에 있는 호스트들의 주소는 네트워크 부분이 모두 같다.',
  },
  {
    id: 'host', label: '호스트 부분', nodes: hostNodes,
    caption: '넷째 옥텟은 호스트 A가 1, 호스트 B가 2로 다르다. 이 뒤 8비트가 호스트 부분이고, 같은 네트워크 안의 호스트마다 다른 값을 붙여 어느 호스트인지를 가린다.',
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

const brightNodes = () => nodeIds.filter((id) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')

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
  const viewBox: [number, number, number, number] = [0, 0, wide ? 440 : 280, 132]

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<NetworkHostPartsDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 곁말이 모두 선명하고 선택 안내가 나온다', () => {
    const { container } = render(<NetworkHostPartsDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node], [data-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(Array.from(svg().querySelectorAll('[data-note]'), (note) => note.textContent)).toEqual(Object.values(noteLabels))
    for (const [id, text] of Object.entries(groupLabels)) expect(svg().querySelector(`[data-group-label="${id}"]`)!.textContent).toBe(text)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드와 그 곁말만 선명하고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<NetworkHostPartsDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    for (const [id, owner] of Object.entries(noteOwner)) {
      expect(svg().querySelector(`[data-note="${id}"]`), id).toHaveAttribute('opacity', owner === null || scenario.nodes.includes(owner) ? '1' : '0.25')
    }
    for (const group of svg().querySelectorAll('[data-group]')) expect(group.closest('[opacity]')).toBeNull()
    expect(svg().querySelectorAll('[data-path], marker')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말·그룹 라벨이 자리에 들어간다`, () => {
    render(<NetworkHostPartsDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + 2)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      const text = svg().querySelector(`[data-node="${id}"] text`)!
      expect(text).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
    }
    for (let i = 0; i < nodeIds.length; i += 1) {
      for (const other of nodeIds.slice(i + 1)) expect(overlaps(nodeBox(nodeIds[i]), nodeBox(other)), `${nodeIds[i]} ↔ ${other}`).toBe(false)
    }
    const texts = Array.from(svg().querySelectorAll('[data-note], [data-group-label]'), (text) => {
      expect(text).toHaveAttribute('font-size', '9')
      return textBox(text, text.getAttribute('data-note') ?? `group-${text.getAttribute('data-group-label')}`)
    })
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
    for (const id of Object.keys(groupLabels)) {
      expect(contains(groupBox(id), textBox(svg().querySelector(`[data-group-label="${id}"]`)!, id)), id).toBe(true)
    }
    // 줄 이름표는 두 그룹 박스 밖, 왼쪽에 둔다 — 이름표가 네트워크 부분에 든 것처럼 보이지 않게 한다.
    for (const id of ['row-a', 'row-b']) {
      const box = textBox(svg().querySelector(`[data-note="${id}"]`)!, id)
      for (const group of Object.keys(groupLabels)) expect(overlaps(box, groupBox(group)), `${id} ↔ ${group}`).toBe(false)
      expect(box.x + box.width).toBeLessThan(groupBox('network').x)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  // 요점: 같은 네트워크의 두 주소는 네트워크 부분 박스 안의 옥텟이 서로 같고, 호스트 부분 박스 안의 옥텟만 다르다.
  // 네트워크 부분이 호스트 부분보다 앞(왼쪽)이고, 두 주소와 경계는 개념 본문의 예와 같다.
  it('네트워크 부분의 옥텟은 두 주소가 같고 호스트 부분의 옥텟만 다르며, 본문의 예와 같다', async () => {
    render(<NetworkHostPartsDiagram />)
    const row = (prefix: string) => [1, 2, 3, 4].map((k) => label(`${prefix}-${k}`)).join('.')
    expect(row('a')).toBe('192.0.2.1')
    expect(row('b')).toBe('192.0.2.2')
    for (const id of networkNodes) expect(contains(groupBox('network'), nodeBox(id)), id).toBe(true)
    for (const id of hostNodes) expect(contains(groupBox('host'), nodeBox(id)), id).toBe(true)
    expect(groupBox('network').x + groupBox('network').width).toBeLessThanOrEqual(groupBox('host').x)
    for (const k of [1, 2, 3, 4]) expect(nodeBox(`b-${k}`).x, `열 ${k}`).toBe(nodeBox(`a-${k}`).x)

    await select('네트워크 부분')
    const network = brightNodes()
    expect(network).toEqual(networkNodes)
    for (const k of [1, 2, 3]) expect(label(`a-${k}`), `열 ${k}`).toBe(label(`b-${k}`))

    await select('호스트 부분')
    expect(brightNodes()).toEqual(hostNodes)
    expect(label('a-4')).not.toBe(label('b-4'))
    expect(new Set([network.join(), brightNodes().join()]).size).toBe(2)

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    expect(body).toContain(`호스트 A가 \`${row('a')}\`, 호스트 B가 \`${row('b')}\``)
    expect(body).toContain('네트워크 부분이 `192.0.2`로 같으니')
    for (const note of ['network-bits', 'host-bits']) expect(body).toContain(noteLabels[note])
  })

  it('폭이 바뀌어도 고른 시나리오와 캡션을 유지하고 노드·그룹·곁말 id가 같다', async () => {
    const change = mockMatchMedia(wide)
    const { container } = render(<NetworkHostPartsDiagram />)
    await select('호스트 부분')
    const read = (selector: string, attribute: string) => Array.from(svg().querySelectorAll(selector), (element) => element.getAttribute(attribute)).sort()
    const ids = () => [read('[data-node]', 'data-node'), read('[data-group]', 'data-group'), read('[data-note]', 'data-note')]
    const before = ids()
    change(!wide)
    expect(svg()).toHaveAttribute('viewBox', `0 0 ${wide ? 280 : 440} 132`)
    expect(ids()).toEqual(before)
    expect(screen.getByRole('button', { name: '호스트 부분' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(expectedScenarios[1].caption)
    expect(brightNodes()).toEqual(hostNodes)
  })
}

describe('NetworkHostPartsDiagram', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  layoutTests(false)

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<NetworkHostPartsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['network-host-parts']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(networkHostPartsScenarios.map(({ id }) => id)).toEqual(expectedScenarios.map(({ id }) => id))
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
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label: name }) => name)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = networkHostPartsScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual([])
      expect(scenario.caption).toBe(wording.caption)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(screen.getAllByRole('figure')).toEqual([figure])
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    layoutTests(true)
  })
})
