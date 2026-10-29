import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { CidrBoundaryDiagram, cidrBoundaryScenarios } from './CidrBoundaryDiagram'

const topicId = 'ip-addressing'
const anchorConceptId = `${topicId}.cidr`
const labels: Record<string, string> = {
  'c-1': '192', 'c-2': '0', 'c-3': '2', 'c-4': '00000000',
  'v-1': '192', 'v-2': '0', 'v-3': '2', 'v-4': '00', 'v-5': '000000',
}
const groupLabels: Record<string, string> = {
  'classful-network': '네트워크 부분',
  'classful-host': '호스트 부분',
  'classless-network': '네트워크 부분',
  'classless-host': '호스트 부분',
}
const noteLabels: Record<string, string> = {
  'classful-title': '클래스 방식 · C 클래스',
  'classful-count': '앞 24비트 · 주소 256개',
  'classless-title': 'CIDR · 192.0.2.0/26',
  'classless-count': '/26 · 앞 26비트 · 주소 64개',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)

const question = '경계를 아무 비트에나 두면 무엇이 달라질까?'
const figureName = '같은 주소에서 클래스 방식과 CIDR가 네트워크 부분의 경계를 다르게 정하는 모습을 견주는 도식'
const svgName = '192.0.2.0을 두 줄로 놓고, 위 줄은 클래스 방식으로 앞 세 옥텟 24비트를 네트워크 부분, 넷째 옥텟 00000000을 호스트 부분으로, 아래 줄은 192.0.2.0/26으로 넷째 옥텟의 앞 2비트 00까지 26비트를 네트워크 부분, 남은 000000을 호스트 부분으로 나눈 모습'
const idleCaption = '같은 주소 192.0.2.0을 두 줄로 놓고 넷째 옥텟은 2진수로 펼쳤다. 위 줄은 클래스 방식으로, 아래 줄은 CIDR 표기 192.0.2.0/26으로 경계를 정한 것이다. 버튼을 고르면 두 방식에서 네트워크 부분이 어디까지인지 따로 볼 수 있다.'
const legend = '상자 하나가 옥텟 하나이거나 옥텟의 일부 비트다. 얇은 선 박스는 그 줄에서 정한 네트워크 부분과 호스트 부분이다.'
const expectedScenarios = [
  {
    id: 'classful', label: '클래스풀', nodes: ['c-1', 'c-2', 'c-3'], notes: ['classful-title', 'classful-count'],
    caption: '클래스 방식에서는 첫 옥텟이 192인 이 주소가 C 클래스라 경계가 24비트 자리로 정해진다. 호스트 부분이 넷째 옥텟 8비트이니 네트워크 하나의 주소는 2⁸ = 256개다.',
  },
  {
    id: 'classless', label: 'CIDR', nodes: ['v-1', 'v-2', 'v-3', 'v-4'], notes: ['classless-title', 'classless-count'],
    caption: '192.0.2.0/26처럼 경계를 26비트에 두면 넷째 옥텟의 앞 2비트까지 네트워크 부분이 된다. 호스트 부분이 6비트로 줄어 주소 2⁶ = 64개짜리 네트워크가 된다.',
  },
]
// 줄마다 네트워크 부분 박스와 호스트 부분 박스에 드는 상자.
const rows = [
  { network: 'classful-network', host: 'classful-host', networkNodes: ['c-1', 'c-2', 'c-3'], hostNodes: ['c-4'] },
  { network: 'classless-network', host: 'classless-host', networkNodes: ['v-1', 'v-2', 'v-3', 'v-4'], hostNodes: ['v-5'] },
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
const visibleNotes = () => Array.from(svg().querySelectorAll('[data-note]'))
  .filter((note) => note.getAttribute('opacity') === '1')
  .map((note) => note.textContent!)

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 172] : [0, 0, 280, 204]

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<CidrBoundaryDiagram />)
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
    const { container } = render(<CidrBoundaryDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node], [data-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(Array.from(svg().querySelectorAll('[data-note]'), (note) => note.textContent)).toEqual(Object.values(noteLabels))
    for (const id of groupIds) expect(svg().querySelector(`[data-group-label="${id}"]`)!.textContent, id).toBe(groupLabels[id])
    expect(svg().querySelectorAll('[data-path], marker')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 그 줄의 네트워크 부분과 그 줄의 곁말만 선명하고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<CidrBoundaryDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(visibleNotes()).toEqual(scenario.notes.map((id) => noteLabels[id]))
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말·그룹 라벨이 자리에 들어간다`, () => {
    render(<CidrBoundaryDiagram />)
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
    // 줄 제목과 개수 곁말은 박스 밖에 둔다.
    for (const box of noteTexts) for (const id of groupIds) expect(overlaps(box, groupBox(id)), `${box.id} ↔ ${id}`).toBe(false)
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  // 요점: 같은 주소 192.0.2.0을 두 줄로 놓고, 위 줄은 앞 세 옥텟 24비트까지, 아래 줄은 넷째 옥텟의 앞 2비트까지 26비트를 네트워크 부분 박스에 넣는다.
  // 호스트 부분의 비트 수로 센 주소 수(2⁸ = 256, 2⁶ = 64)가 곁말과 같고, 넷째 옥텟을 두 칸으로 나눠도 원래 8비트와 같다. 수와 표기는 개념 본문의 예와 같다.
  it('경계를 24비트에서 26비트로 옮기면 호스트 부분이 6비트가 되어 주소가 256개에서 64개로 준다', async () => {
    render(<CidrBoundaryDiagram />)
    for (const row of rows) {
      for (const id of row.networkNodes) expect(contains(groupBox(row.network), nodeBox(id)), id).toBe(true)
      for (const id of row.hostNodes) expect(contains(groupBox(row.host), nodeBox(id)), id).toBe(true)
      expect(groupBox(row.network).x + groupBox(row.network).width).toBeLessThan(groupBox(row.host).x)
    }
    // 앞 세 옥텟은 두 줄이 같은 주소다.
    for (const n of [1, 2, 3]) expect(label(`v-${n}`)).toBe(label(`c-${n}`))
    expect(`${label('v-4')}${label('v-5')}`).toBe(label('c-4'))
    expect([label('c-1'), label('c-2'), label('c-3'), parseInt(label('c-4'), 2)].join('.')).toBe('192.0.2.0')

    const bitsOf = (ids: string[]) => ids.reduce((sum, id) => sum + (/^[01]+$/u.test(label(id)) && label(id).length !== 1 ? label(id).length : 8), 0)
    const classfulNetwork = bitsOf(rows[0].networkNodes)
    const classlessNetwork = bitsOf(rows[1].networkNodes)
    expect(classfulNetwork).toBe(24)
    expect(classlessNetwork).toBe(26)
    expect(32 - classfulNetwork).toBe(label('c-4').length)
    expect(32 - classlessNetwork).toBe(label('v-5').length)
    expect(noteLabels['classful-count']).toBe(`앞 ${classfulNetwork}비트 · 주소 ${2 ** label('c-4').length}개`)
    expect(noteLabels['classless-count']).toBe(`/${classlessNetwork} · 앞 ${classlessNetwork}비트 · 주소 ${2 ** label('v-5').length}개`)

    await select('클래스풀')
    expect(brightNodes()).toEqual(rows[0].networkNodes)
    expect(visibleNotes().join()).toContain('256')
    expect(visibleNotes().join()).not.toContain('64')
    await select('CIDR')
    expect(brightNodes()).toEqual(rows[1].networkNodes)
    expect(visibleNotes().join()).toContain('/26')
    expect(visibleNotes().join()).toContain('64')
    expect(visibleNotes().join()).not.toContain('256')

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    expect(body).toContain('`192.0.2.0/26`은 앞 26비트가 네트워크 부분이다')
    expect(body).toContain(`넷째 옥텟 \`${label('c-4')}\`의 앞 2비트까지 네트워크 부분이고, 남은 뒤 6비트가 호스트 부분이다`)
    expect(body).toContain('2⁶ = 64개')
    expect(body).toContain('주소 256개짜리 네트워크')
  })

  it('폭이 바뀌어도 고른 시나리오와 캡션을 유지하고 노드·그룹·곁말 id가 같다', async () => {
    const change = mockMatchMedia(wide)
    const { container } = render(<CidrBoundaryDiagram />)
    await select('CIDR')
    const read = (selector: string, attribute: string) => Array.from(svg().querySelectorAll(selector), (element) => element.getAttribute(attribute)).sort()
    const ids = () => [read('[data-node]', 'data-node'), read('[data-group]', 'data-group'), read('[data-note]', 'data-note')]
    const before = ids()
    change(!wide)
    expect(svg()).toHaveAttribute('viewBox', wide ? '0 0 280 204' : '0 0 440 172')
    expect(ids()).toEqual(before)
    expect(screen.getByRole('button', { name: 'CIDR' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(expectedScenarios[1].caption)
    expect(brightNodes()).toEqual(rows[1].networkNodes)
  })
}

describe('CidrBoundaryDiagram', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  layoutTests(false)

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<CidrBoundaryDiagram />)
    const text = visualsByTopicId[topicId].diagrams['cidr-boundary']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(cidrBoundaryScenarios.map(({ id }) => id)).toEqual(expectedScenarios.map(({ id }) => id))
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
      const scenario = cidrBoundaryScenarios.find(({ id }) => id === expected.id)!
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
