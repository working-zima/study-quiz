import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { SubnetMaskDiagram, subnetMaskScenarios } from './SubnetMaskDiagram'

const topicId = 'ip-addressing'
const anchorConceptId = `${topicId}.subnet-mask`
const labels: Record<string, string> = {
  'a-1': '192', 'a-2': '0', 'a-3': '2', 'a-4': '1',
  'm-1': '255', 'm-2': '255', 'm-3': '255', 'm-4': '0',
}
const groupLabels: Record<string, string> = { network: '네트워크 부분', host: '호스트 부분' }
const noteLabels: Record<string, string> = {
  'row-address': 'IP 주소',
  'row-mask': '서브넷 마스크',
  ones: '255 = 11111111',
  zeros: '0 = 00000000',
  prefix: '1이 24개 · /24',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)

const question = '서브넷 마스크의 1과 0은 주소의 어디를 가리킬까?'
const figureName = 'IP 주소 192.0.2.1과 서브넷 마스크 255.255.255.0을 옥텟마다 맞대어, 마스크의 1과 0이 주소의 네트워크 부분과 호스트 부분을 가리키는 모습을 보이는 도식'
const svgName = '위 줄에 IP 주소 192.0.2.1의 옥텟 넷, 아래 줄에 서브넷 마스크 255.255.255.0의 옥텟 넷을 열을 맞춰 놓고, 앞 세 열을 네트워크 부분 박스로, 넷째 열을 호스트 부분 박스로 묶은 모습. 박스 아래 곁말은 255가 11111111, 0이 00000000이라는 것과 1이 24개라 /24라는 것이다'
const idleCaption = 'IP 주소 192.0.2.1과 그 서브넷 마스크 255.255.255.0을 옥텟마다 열을 맞춰 두 줄로 놓았다. 버튼을 고르면 같은 마스크를 점 10진 표기로 적은 꼴과 접두사 길이로 적은 꼴을 따로 볼 수 있다.'
const legend = '한 줄에 옥텟 넷이 있고, 상자 하나가 옥텟 하나를 십진수로 적은 것이다. 얇은 선 박스는 마스크가 가리키는 네트워크 부분과 호스트 부분이다.'
const expectedScenarios = [
  {
    id: 'dotted', label: '점 10진', nodes: ['m-1', 'm-2', 'm-3', 'm-4'], notes: ['row-address', 'row-mask', 'ones', 'zeros'],
    caption: '마스크 255.255.255.0을 2진수로 펼치면 255인 세 옥텟은 11111111, 0인 넷째 옥텟은 00000000이다. 앞 24비트가 1이고 뒤 8비트가 0이니, 1이 놓인 앞 세 옥텟이 네트워크 부분이고 0이 놓인 넷째 옥텟이 호스트 부분이다.',
  },
  {
    id: 'prefix', label: '접두사 길이', nodes: ['a-1', 'a-2', 'a-3', 'm-1', 'm-2', 'm-3'], notes: ['row-address', 'row-mask', 'prefix'],
    caption: '마스크의 1은 왼쪽부터 24개가 이어지므로 같은 경계를 /24로도 적는다. 1이 덮는 주소의 앞 24비트 192.0.2가 네트워크 부분이고, 두 표기는 같은 경계를 다르게 적은 것이다.',
  },
]
// 같은 열의 주소 옥텟과 마스크 옥텟이 함께 드는 박스.
const columns = [
  { group: 'network', ids: ['a-1', 'm-1'] },
  { group: 'network', ids: ['a-2', 'm-2'] },
  { group: 'network', ids: ['a-3', 'm-3'] },
  { group: 'host', ids: ['a-4', 'm-4'] },
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
const visibleNoteIds = () => noteIds.filter((id) => svg().querySelector(`[data-note="${id}"]`)!.getAttribute('opacity') === '1')
const visibleNotes = () => visibleNoteIds().map((id) => noteLabels[id])

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 148] : [0, 0, 280, 148]

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<SubnetMaskDiagram />)
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
    const { container } = render(<SubnetMaskDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node], [data-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(Array.from(svg().querySelectorAll('[data-note]'), (note) => note.textContent)).toEqual(Object.values(noteLabels))
    for (const id of groupIds) expect(svg().querySelector(`[data-group-label="${id}"]`)!.textContent, id).toBe(groupLabels[id])
    expect(svg().querySelectorAll('[data-path], marker')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 옥텟과 곁말만 선명하고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<SubnetMaskDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(visibleNoteIds()).toEqual(scenario.notes)
    for (const id of noteIds.filter((note) => !scenario.notes.includes(note))) expect(svg().querySelector(`[data-note="${id}"]`), id).toHaveAttribute('opacity', '0.25')
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말·그룹 라벨이 자리에 들어간다`, () => {
    render(<SubnetMaskDiagram />)
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
    // 줄 이름표는 박스 밖 왼쪽에, 2진수와 접두사 길이 곁말은 박스 아래에 둔다.
    for (const box of noteTexts) for (const id of groupIds) expect(overlaps(box, groupBox(id)), `${box.id} ↔ ${id}`).toBe(false)
    expect(groupBox('network').x + groupBox('network').width).toBeLessThan(groupBox('host').x)
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  // 요점: 주소와 마스크를 열을 맞춰 두 줄로 놓으면, 마스크가 255인 열(1이 8개)은 주소의 옥텟과 함께 네트워크 부분 박스에, 0인 열(0이 8개)은 호스트 부분 박스에 든다.
  // 마스크의 1을 모두 세면 24개이고 그것이 /24다. 점 10진 표기 버튼은 2진수 곁말을, 접두사 길이 버튼은 /24를 보인다. 수와 표기는 개념 본문과 같다.
  it('마스크의 1이 놓인 열이 네트워크 부분이고, 1의 개수 24가 /24다', async () => {
    render(<SubnetMaskDiagram />)
    for (const column of columns) for (const id of column.ids) expect(contains(groupBox(column.group), nodeBox(id)), id).toBe(true)
    for (const column of columns) {
      const [address, mask] = column.ids.map((id) => nodeBox(id))
      expect(address.x, column.ids.join()).toBe(mask.x)
      expect(address.y).toBeLessThan(mask.y)
    }
    const maskBits = ['m-1', 'm-2', 'm-3', 'm-4'].map((id) => Number(label(id)).toString(2).padStart(8, '0'))
    expect(maskBits).toEqual(['11111111', '11111111', '11111111', '00000000'])
    expect(noteLabels.ones).toBe(`255 = ${maskBits[0]}`)
    expect(noteLabels.zeros).toBe(`0 = ${maskBits[3]}`)
    const ones = maskBits.join('').split('').filter((bit) => bit === '1').length
    expect(maskBits.join('')).toMatch(/^1*0*$/u)
    expect(ones).toBe(24)
    expect(noteLabels.prefix).toBe(`1이 ${ones}개 · /${ones}`)
    // 1이 놓인 열이 네트워크 부분 박스의 열이다.
    for (const [index, column] of columns.entries()) expect(column.group, column.ids.join()).toBe(maskBits[index] === '11111111' ? 'network' : 'host')
    expect(['a-1', 'a-2', 'a-3', 'a-4'].map(label).join('.')).toBe('192.0.2.1')

    await select('점 10진')
    expect(brightNodes()).toEqual(['m-1', 'm-2', 'm-3', 'm-4'])
    expect(visibleNotes().join()).toContain('11111111')
    expect(visibleNotes().join()).not.toContain('/24')
    await select('접두사 길이')
    expect(brightNodes()).toEqual(['a-1', 'a-2', 'a-3', 'm-1', 'm-2', 'm-3'])
    expect(visibleNotes().join()).toContain('/24')
    expect(visibleNotes().join()).not.toContain('11111111')
    expect(screen.getByText(expectedScenarios[1].caption).textContent).toContain('/24')

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    expect(body).toContain('1이 8개 이어진 옥텟 `11111111`은 255이고, 모두 0인 옥텟 `00000000`은 0이다')
    expect(body).toContain('앞 24비트가 1이고 뒤 8비트가 0인 마스크는 `255.255.255.0`이다')
    expect(body).toContain('주소 `192.0.2.1`과 함께 두면')
    expect(body).toContain('위 마스크는 1이 24개이므로 `/24`라 적는다')
  })

  it('폭이 바뀌어도 고른 시나리오와 캡션을 유지하고 노드·그룹·곁말 id가 같다', async () => {
    const change = mockMatchMedia(wide)
    const { container } = render(<SubnetMaskDiagram />)
    await select('접두사 길이')
    const read = (selector: string, attribute: string) => Array.from(svg().querySelectorAll(selector), (element) => element.getAttribute(attribute)).sort()
    const ids = () => [read('[data-node]', 'data-node'), read('[data-group]', 'data-group'), read('[data-note]', 'data-note')]
    const before = ids()
    change(!wide)
    expect(svg()).toHaveAttribute('viewBox', wide ? '0 0 280 148' : '0 0 440 148')
    expect(ids()).toEqual(before)
    expect(screen.getByRole('button', { name: '접두사 길이' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(expectedScenarios[1].caption)
    expect(brightNodes()).toEqual(expectedScenarios[1].nodes)
    expect(visibleNoteIds()).toEqual(expectedScenarios[1].notes)
  })
}

describe('SubnetMaskDiagram', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  layoutTests(false)

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<SubnetMaskDiagram />)
    const text = visualsByTopicId[topicId].diagrams['subnet-mask']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(subnetMaskScenarios.map(({ id }) => id)).toEqual(expectedScenarios.map(({ id }) => id))
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
      const scenario = subnetMaskScenarios.find(({ id }) => id === expected.id)!
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
