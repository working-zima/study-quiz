import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { MaskAndDiagram, maskAndScenarios } from './MaskAndDiagram'

const topicId = 'ip-addressing'
const anchorConceptId = `${topicId}.network-address-calc`
const labels: Record<string, string> = {
  'a-dot': '192.0.2.130', 'a-hi': '10', 'a-lo': '000010',
  'm-dot': '255.255.255.192', 'm-hi': '11', 'm-lo': '000000',
  'r-dot': '192.0.2.128', 'r-hi': '10', 'r-lo': '000000',
}
const groupLabels: Record<string, string> = { hi: '앞 2비트', lo: '뒤 6비트' }
const noteLabels: Record<string, string> = {
  octet: '넷째 옥텟의 2진수',
  'row-address': 'IP 주소',
  'row-mask': '서브넷 마스크',
  'row-result': 'AND 결과',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)

const question = '주소와 마스크를 AND하면 무엇이 남을까?'
const figureName = 'IP 주소 192.0.2.130과 서브넷 마스크 255.255.255.192를 AND해 네트워크 주소 192.0.2.128을 구하는 계산을 보이는 도식'
const svgName = '세 줄에 IP 주소 192.0.2.130, 서브넷 마스크 255.255.255.192, AND 결과 192.0.2.128을 놓고, 줄마다 넷째 옥텟을 앞 2비트와 뒤 6비트로 펼친 모습. 주소는 10과 000010, 마스크는 11과 000000, AND 결과는 10과 000000이다'
const idleCaption = '주소 192.0.2.130과 마스크 255.255.255.192(/26), 그리고 둘을 AND한 결과를 세 줄로 놓았다. 오른쪽 두 칸은 넷째 옥텟을 2진수로 펼쳐 앞 2비트와 뒤 6비트로 나눈 것이다. 버튼을 고르면 마스크가 1인 자리, 0인 자리, 결과를 따로 볼 수 있다.'
const legend = '줄마다 왼쪽 상자는 주소 전체를 점 10진 표기로 적은 것이고, 오른쪽 두 상자는 넷째 옥텟의 앞 2비트와 뒤 6비트다. 얇은 선 박스는 같은 비트 칸을 세 줄에 걸쳐 묶은 것이다.'
const expectedScenarios = [
  {
    id: 'keep', label: '마스크가 1인 자리', nodes: ['a-hi', 'm-hi', 'r-hi'],
    caption: '마스크가 1인 자리는 AND 결과가 주소의 비트와 같다. 넷째 옥텟의 앞 2비트는 주소의 10이 결과에도 10으로 남고, 마스크가 255인 앞 세 옥텟 192.0.2도 그대로 남는다.',
  },
  {
    id: 'clear', label: '마스크가 0인 자리', nodes: ['a-lo', 'm-lo', 'r-lo'],
    caption: '마스크가 0인 자리는 주소의 비트가 무엇이든 AND 결과가 0이다. 넷째 옥텟의 뒤 6비트는 주소의 000010이 000000이 되어, 호스트 부분이 모두 0으로 지워진다.',
  },
  {
    id: 'result', label: '결과', nodes: ['r-dot', 'r-hi', 'r-lo'],
    caption: '남은 넷째 옥텟 10000000은 128이라 AND 결과는 192.0.2.128이다. 호스트 부분이 모두 0인 이 주소가 192.0.2.130이 속한 네트워크의 네트워크 주소다.',
  },
]
const rows = [
  { dot: 'a-dot', hi: 'a-hi', lo: 'a-lo' },
  { dot: 'm-dot', hi: 'm-hi', lo: 'm-lo' },
  { dot: 'r-dot', hi: 'r-hi', lo: 'r-lo' },
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

// 두 비트 문자열을 같은 자리끼리 AND한다.
const and = (left: string, right: string) => left.split('').map((bit, index) => (bit === '1' && right[index] === '1' ? '1' : '0')).join('')
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 164] : [0, 0, 280, 196]

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<MaskAndDiagram />)
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
    const { container } = render(<MaskAndDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node], [data-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(Array.from(svg().querySelectorAll('[data-note]'), (note) => note.textContent)).toEqual(Object.values(noteLabels))
    for (const id of groupIds) expect(svg().querySelector(`[data-group-label="${id}"]`)!.textContent, id).toBe(groupLabels[id])
    expect(svg().querySelectorAll('[data-path], marker')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 칸만 선명하고 곁말과 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<MaskAndDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    for (const id of noteIds) expect(svg().querySelector(`[data-note="${id}"]`), id).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말·그룹 라벨이 자리에 들어간다`, () => {
    render(<MaskAndDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
    }
    for (let i = 0; i < nodeIds.length; i += 1) {
      for (const other of nodeIds.slice(i + 1)) expect(overlaps(nodeBox(nodeIds[i]), nodeBox(other)), `${nodeIds[i]} ↔ ${other}`).toBe(false)
    }
    const groupTexts = groupIds.map((id) => textBox(svg().querySelector(`[data-group-label="${id}"]`)!, `group-${id}`))
    const noteTexts = Array.from(svg().querySelectorAll('[data-note]'), (note) => {
      expect(note).toHaveAttribute('font-size', '9')
      return textBox(note, note.getAttribute('data-note')!)
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
    for (const id of groupIds) expect(contains(groupBox(id), groupTexts[groupIds.indexOf(id)]), id).toBe(true)
    // 줄 이름표는 박스 밖 왼쪽에, 넷째 옥텟 곁말은 박스 위에 둔다.
    for (const box of noteTexts) for (const id of groupIds) expect(overlaps(box, groupBox(id)), `${box.id} ↔ ${id}`).toBe(false)
    expect(groupBox('hi').x + groupBox('hi').width).toBeLessThan(groupBox('lo').x)
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  // 요점: 세 줄의 넷째 옥텟을 앞 2비트와 뒤 6비트로 펼쳐 열을 맞추면, 결과 줄의 비트는 주소 줄과 마스크 줄을 같은 자리끼리 AND한 값이다.
  // 마스크가 1인 앞 2비트는 주소의 10이 그대로 남고, 마스크가 0인 뒤 6비트는 000000이 된다. 결과의 넷째 옥텟 10000000은 128이고,
  // 앞 세 옥텟은 마스크가 255라 주소 그대로라서 결과는 192.0.2.128이다. 수와 표기는 개념 본문의 예와 같다.
  it('마스크가 1인 자리는 주소의 비트가 남고 0인 자리는 0이 되어 결과가 192.0.2.128이다', async () => {
    render(<MaskAndDiagram />)
    for (const row of rows) {
      expect(contains(groupBox('hi'), nodeBox(row.hi)), row.hi).toBe(true)
      expect(contains(groupBox('lo'), nodeBox(row.lo)), row.lo).toBe(true)
      for (const id of groupIds) expect(overlaps(nodeBox(row.dot), groupBox(id)), `${row.dot} ↔ ${id}`).toBe(false)
      // 넷째 옥텟을 펼친 두 칸을 이으면 점 10진 표기의 넷째 값과 같다.
      const octets = label(row.dot).split('.')
      expect(octets).toHaveLength(4)
      expect(`${label(row.hi)}${label(row.lo)}`, row.dot).toBe(Number(octets[3]).toString(2).padStart(8, '0'))
      expect(label(row.hi)).toHaveLength(2)
      expect(label(row.lo)).toHaveLength(6)
    }
    for (const column of ['dot', 'hi', 'lo'] as const) {
      const [address, mask, result] = rows.map((row) => nodeBox(row[column]))
      expect(address.x, column).toBe(mask.x)
      expect(mask.x, column).toBe(result.x)
      expect(address.y).toBeLessThan(mask.y)
      expect(mask.y).toBeLessThan(result.y)
    }
    const [address, mask, result] = rows
    expect(label(mask.hi)).toBe('11')
    expect(label(mask.lo)).toBe('000000')
    expect(label(result.hi)).toBe(and(label(address.hi), label(mask.hi)))
    expect(label(result.lo)).toBe(and(label(address.lo), label(mask.lo)))
    const addressOctets = label(address.dot).split('.')
    const maskOctets = label(mask.dot).split('.')
    expect(label(result.dot).split('.').map(Number)).toEqual(addressOctets.map((octet, index) => Number(octet) & Number(maskOctets[index])))
    expect(label(result.dot)).toBe('192.0.2.128')

    await select('마스크가 1인 자리')
    expect(brightNodes()).toEqual(['a-hi', 'm-hi', 'r-hi'])
    expect(label('a-hi')).toBe(label('r-hi'))
    expect(label('r-hi')).toBe('10')
    await select('마스크가 0인 자리')
    expect(brightNodes()).toEqual(['a-lo', 'm-lo', 'r-lo'])
    expect(label('r-lo')).toBe('000000')
    expect(label('a-lo')).not.toBe(label('r-lo'))
    await select('결과')
    expect(brightNodes()).toEqual(['r-dot', 'r-hi', 'r-lo'])
    expect(brightNodes().map(label)).toContain('192.0.2.128')

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    expect(body).toContain('주소 `192.0.2.130`에 마스크 `255.255.255.192`(`/26`)를 쓰는 호스트')
    expect(body).toContain('130은 128 + 2이므로 `10000010`이고, 마스크의 192는 128 + 64이므로 `11000000`이다')
    expect(body).toContain('주소의 `10`이 그대로 남고')
    expect(body).toContain('주소의 `000010`이 `000000`이 된다')
    expect(body).toContain('넷째 옥텟의 AND 결과는 `10000000`, 곧 128이다')
    expect(body).toContain('네트워크 주소는 `192.0.2.128`')
  })

  it('폭이 바뀌어도 고른 시나리오와 캡션을 유지하고 노드·그룹·곁말 id가 같다', async () => {
    const change = mockMatchMedia(wide)
    const { container } = render(<MaskAndDiagram />)
    await select('결과')
    const read = (selector: string, attribute: string) => Array.from(svg().querySelectorAll(selector), (element) => element.getAttribute(attribute)).sort()
    const ids = () => [read('[data-node]', 'data-node'), read('[data-group]', 'data-group'), read('[data-note]', 'data-note')]
    const before = ids()
    change(!wide)
    expect(svg()).toHaveAttribute('viewBox', wide ? '0 0 280 196' : '0 0 440 164')
    expect(ids()).toEqual(before)
    expect(screen.getByRole('button', { name: '결과' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(expectedScenarios[2].caption)
    expect(brightNodes()).toEqual(expectedScenarios[2].nodes)
  })
}

describe('MaskAndDiagram', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  layoutTests(false)

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<MaskAndDiagram />)
    const text = visualsByTopicId[topicId].diagrams['mask-and']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(maskAndScenarios.map(({ id }) => id)).toEqual(expectedScenarios.map(({ id }) => id))
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
      const scenario = maskAndScenarios.find(({ id }) => id === expected.id)!
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

    layoutTests(true)
  })
})
