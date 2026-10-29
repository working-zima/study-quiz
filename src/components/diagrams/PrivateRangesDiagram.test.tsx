import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { PrivateRangesDiagram, privateRangesScenarios } from './PrivateRangesDiagram'

const topicId = 'ip-address-types'
const anchorConceptId = `${topicId}.private-address`
const labels: Record<string, string> = {
  r10: '10.0.0.0/8',
  r172: '172.16.0.0/12',
  r192: '192.168.0.0/16',
  host1: '192.168.0.10',
  internet: '인터넷',
  host2: '192.168.0.10',
}
const groupLabels: Record<string, string> = { company1: '회사 1', company2: '회사 2' }
const noteLabels: Record<string, string> = {
  'end-10': '10.255.255.255까지',
  'end-172': '172.31.255.255까지',
  'end-192': '192.168.255.255까지',
  'no-exit': '사설 주소는 인터넷으로 나가지 않는다',
}
// 끝 주소 곁말은 자기 범위 상자의 흐림을 따른다. 「나가지 않는다」 곁말은 겹쳐 쓰기에서만 보인다.
const noteOwner: Record<string, string> = { 'end-10': 'r10', 'end-172': 'r172', 'end-192': 'r192' }
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const rangeIds = ['r10', 'r172', 'r192']

const question = '사설 IP 주소는 어느 범위이고, 왜 겹쳐도 될까?'
const figureName = '사설 IP 주소의 세 범위와, 두 회사가 같은 사설 주소를 겹쳐 쓰는 모습을 보이는 도식'
const svgName = '사설 주소 범위 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16과 그 끝 주소, 그리고 회사 1과 회사 2의 사설 네트워크에 저마다 있는 192.168.0.10과 두 회사 사이의 인터넷'
const idleCaption = '위에 사설 주소로 떼어 둔 범위 셋과 그 끝 주소를, 아래에 사설 네트워크를 쓰는 두 회사와 인터넷을 놓았다. 버튼을 고르면 사설 주소의 범위와, 두 회사가 같은 주소를 쓰는 모습을 볼 수 있다.'
const legend = '위쪽 상자는 사설 주소 범위이고, 곁말은 그 범위의 끝 주소다. 얇은 선 박스는 회사마다의 사설 네트워크이고, 그 안의 상자가 회사 안 장치의 주소다.'
const expectedScenarios = [
  {
    id: 'ranges', label: '사설 대역 셋', nodes: rangeIds, notes: [] as string[],
    caption: '사설 주소는 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 세 범위 안의 주소다. 172.16.0.0/12는 둘째 옥텟의 앞 4비트가 0001인 범위라 172.16부터 172.31까지다.',
  },
  {
    id: 'overlap', label: '겹쳐 쓰기', nodes: ['host1', 'host2'], notes: ['no-exit'],
    caption: '회사 1과 회사 2가 안쪽 장치에 같은 사설 주소 192.168.0.10을 붙였다. 사설 주소로 오가는 데이터는 회사 밖 인터넷으로 나가지 않으므로 두 주소가 서로 마주칠 일이 없다.',
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
const brightNodes = () => nodeIds.filter((id) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
const scenarioNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note')!).filter((id) => !(id in noteOwner))

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 160] : [0, 0, 280, 224]

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<PrivateRangesDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 끝 주소 곁말이 모두 선명하고 선택 안내가 나온다', () => {
    const { container } = render(<PrivateRangesDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node], [data-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note'))).toEqual(Object.keys(noteOwner))
    expect(scenarioNotes()).toEqual([])
    for (const id of groupIds) expect(svg().querySelector(`[data-group-label="${id}"]`)!.textContent).toBe(groupLabels[id])
    expect(svg().querySelectorAll('[data-path], marker')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드와 곁말만 선명하고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<PrivateRangesDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    for (const [id, owner] of Object.entries(noteOwner)) {
      expect(svg().querySelector(`[data-note="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(owner) ? '1' : '0.25')
    }
    expect(scenarioNotes()).toEqual(scenario.notes)
    for (const id of scenario.notes) {
      const note = svg().querySelector(`[data-note="${id}"]`)!
      expect(note.textContent).toBe(noteLabels[id])
      expect(note.closest('[opacity]')).toBeNull()
    }
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(svg().querySelectorAll('[data-path], marker')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말·그룹 라벨이 자리에 들어간다`, async () => {
    render(<PrivateRangesDiagram />)
    await select('겹쳐 쓰기')
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
    const groupTexts = groupIds.map((id) => {
      const text = svg().querySelector(`[data-group-label="${id}"]`)!
      expect(text).toHaveAttribute('font-size', '9')
      const box = textBox(text, `${id}-label`)
      expect(contains(groupBox(id), box), id).toBe(true)
      return box
    })
    const texts = [...Array.from(svg().querySelectorAll('[data-note]'), (note) => {
      expect(note).toHaveAttribute('font-size', '9')
      expect(note).toHaveClass('fill-muted')
      return textBox(note, note.getAttribute('data-note')!)
    }), ...groupTexts]
    expect(texts).toHaveLength(Object.keys(noteLabels).length + groupIds.length)
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
    // 범위 상자와 끝 주소 곁말, 인터넷은 두 회사 박스 밖에 있다.
    for (const id of [...rangeIds, 'internet']) {
      for (const group of groupIds) expect(overlaps(groupBox(group), nodeBox(id)), `${id} ↔ ${group}`).toBe(false)
    }
    for (const id of Object.keys(noteOwner)) {
      for (const group of groupIds) expect(overlaps(groupBox(group), textBox(svg().querySelector(`[data-note="${id}"]`)!, id)), `${id} ↔ ${group}`).toBe(false)
    }
    expect(overlaps(groupBox('company1'), groupBox('company2'))).toBe(false)
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  // 요점: 사설 대역 셋에서는 범위 상자 셋만 선명하고, 172.16.0.0/12의 끝이 172.31.255.255인 것은 둘째 옥텟의 앞 4비트가 같기 때문이다.
  // 겹쳐 쓰기에서는 같은 주소 192.168.0.10이 서로 다른 회사 박스 안에 하나씩 있고, 호스트에서 인터넷으로 가는 선이 하나도 없다.
  it('사설 범위 셋의 끝 주소가 접두사 길이와 맞고, 두 회사의 같은 주소는 인터넷으로 이어지지 않는다', async () => {
    render(<PrivateRangesDiagram />)
    await select('사설 대역 셋')
    expect(brightNodes()).toEqual(rangeIds)
    const shownNotes = Array.from(svg().querySelectorAll('[data-note]'), (note) => note.textContent!)
    expect(shownNotes.some((text) => text.startsWith('172.31.255.255'))).toBe(true)
    // 범위의 끝 주소는 접두사 길이 뒤의 비트를 모두 1로 채운 값이다.
    for (const id of rangeIds) {
      const [start, prefix] = label(id).split('/')
      const toNumber = (address: string) => address.split('.').reduce((sum, octet) => sum * 256 + Number(octet), 0)
      const end = noteLabels[`end-${id.slice(1)}`].replace('까지', '')
      expect(toNumber(end) - toNumber(start), id).toBe(2 ** (32 - Number(prefix)) - 1)
    }
    const secondFirst = Number(label('r172').split('.')[1])
    const secondLast = Number(noteLabels['end-172'].split('.')[1])
    expect([secondFirst, secondLast]).toEqual([16, 31])
    expect(secondFirst >> 4).toBe(secondLast >> 4)
    expect((secondFirst - 1) >> 4).not.toBe(secondFirst >> 4)
    expect((secondLast + 1) >> 4).not.toBe(secondFirst >> 4)
    const rangesBright = brightNodes()

    await select('겹쳐 쓰기')
    expect(brightNodes()).toEqual(['host1', 'host2'])
    expect(brightNodes()).not.toEqual(rangesBright)
    expect(label('host1')).toBe(label('host2'))
    expect(contains(groupBox('company1'), nodeBox('host1'))).toBe(true)
    expect(contains(groupBox('company2'), nodeBox('host2'))).toBe(true)
    expect(overlaps(groupBox('company1'), nodeBox('host2'))).toBe(false)
    expect(overlaps(groupBox('company2'), nodeBox('host1'))).toBe(false)
    expect(svg().querySelectorAll('[data-path]')).toHaveLength(0)

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    expect(body).toContain('`172.16.0.0/12`는 `172.16.0.0`부터 `172.31.255.255`까지')
    expect(body).toContain('둘째 옥텟은 `00010000`(16)부터 `00011111`(31)까지 간다')
    expect(body).toContain('회사 1과 회사 2가 저마다 안쪽 장치에 `192.168.0.10`을 붙여도 된다')
    expect(body).toContain('사설 주소로 오가는 데이터는 조직 밖으로 나가지 않으므로')
  })
}

describe('PrivateRangesDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<PrivateRangesDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 224')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('겹쳐 쓰기')
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 160')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '겹쳐 쓰기' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(scenarioNotes()).toEqual(['no-exit'])
    })
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<PrivateRangesDiagram />)
    const text = visualsByTopicId[topicId].diagrams['private-ranges']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(privateRangesScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = privateRangesScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual([])
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 사설 IP 주소 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
