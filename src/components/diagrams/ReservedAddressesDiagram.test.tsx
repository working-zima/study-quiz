import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ReservedAddressesDiagram, reservedAddressesScenarios } from './ReservedAddressesDiagram'

const topicId = 'ip-address-types'
const anchorConceptId = `${topicId}.reserved-addresses`
const labels: Record<string, string> = {
  'this-network': '0.0.0.0/8',
  loopback: '127.0.0.0/8',
  'link-local': '169.254.0.0/16',
  'doc-1': '192.0.2.0/24',
  'doc-2': '198.51.100.0/24',
  'doc-3': '203.0.113.0/24',
  multicast: '224.0.0.0/4',
  future: '240.0.0.0/4',
  'limited-broadcast': '255.255.255.255',
}
const groupLabels: Record<string, string> = { documentation: '문서용 주소' }
const noteLabels: Record<string, string> = {
  'this-network-name': '「이 네트워크」 주소',
  'this-network-use': '주소를 모를 때 출발지로',
  'loopback-name': '루프백 주소',
  'loopback-use': '호스트 안에서만',
  'link-local-name': '링크 로컬 주소',
  'link-local-use': '같은 링크 안에서만',
  'documentation-use': '문서에서 주소의 예로 쓴다',
  'documentation-device': '실제 장치에 붙이지 않는다',
  'multicast-name': '멀티캐스트 주소',
  'multicast-use': '그룹에 한꺼번에 보낼 때',
  'future-name': '앞으로 쓸 주소',
  'future-use': '지금은 나눠 주지 않는다',
  'limited-broadcast-name': '제한 브로드캐스트 주소',
  'limited-broadcast-use': '같은 네트워크 안에서만',
}
// 곁말마다 흐림을 따르는 노드. 문서용 주소의 곁말은 가운데 범위 상자를 따른다(세 범위는 늘 함께 선명하다).
const noteOwner: Record<string, string> = {
  'this-network-name': 'this-network',
  'this-network-use': 'this-network',
  'loopback-name': 'loopback',
  'loopback-use': 'loopback',
  'link-local-name': 'link-local',
  'link-local-use': 'link-local',
  'documentation-use': 'doc-2',
  'documentation-device': 'doc-2',
  'multicast-name': 'multicast',
  'multicast-use': 'multicast',
  'future-name': 'future',
  'future-use': 'future',
  'limited-broadcast-name': 'limited-broadcast',
  'limited-broadcast-use': 'limited-broadcast',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const docIds = ['doc-1', 'doc-2', 'doc-3']
const stayLocalIds = ['loopback', 'link-local', 'limited-broadcast']
const specialUseIds = [...docIds, 'multicast', 'future']

const question = '호스트에 주지 않는 주소에는 어떤 것이 있을까?'
const figureName = '호스트에 나눠 주지 않고 쓰임을 정해 둔 IPv4 주소 범위와 그 이름·쓰임을 보이는 도식'
const svgName = '예약된 IP 주소 범위 0.0.0.0/8, 127.0.0.0/8, 169.254.0.0/16, 문서용 주소 192.0.2.0/24·198.51.100.0/24·203.0.113.0/24, 224.0.0.0/4, 240.0.0.0/4, 255.255.255.255와 범위마다의 이름과 쓰임'
const idleCaption = '호스트에 나눠 주지 않고 쓰임을 정해 둔 주소 범위를 본문의 차례대로 놓고, 범위마다 이름과 쓰임을 적었다. 버튼을 고르면 밖으로 나가지 않는 주소와, 쓰임을 정해 둔 범위를 볼 수 있다.'
const legend = '상자 하나가 예약된 주소 범위이고, 곁말의 첫 줄은 그 이름, 둘째 줄은 쓰임이다. 얇은 선 박스는 문서용 주소 세 범위를 묶는다.'
const expectedScenarios = [
  {
    id: 'stay-local', label: '밖으로 나가지 않는 주소', nodes: stayLocalIds,
    caption: '루프백 주소로 보낸 데이터는 호스트 밖으로 나가지 않고 호스트 안에서 되돌아온다. 링크 로컬 주소와 제한 브로드캐스트 주소는 라우터가 다른 네트워크로 넘기지 않아, 같은 링크나 같은 네트워크 안에서만 쓰인다.',
  },
  {
    id: 'special-use', label: '쓰임을 정한 범위', nodes: specialUseIds,
    caption: '문서용 주소는 문서에서 주소의 예로, 멀티캐스트 주소는 그룹에 한꺼번에 보낼 때 쓰고, 앞으로 쓸 주소는 나중의 쓰임을 위해 남겨 두었다. 셋 모두 쓰임이 정해져 있어 호스트 하나에 붙여 쓰라고 나눠 주지 않는다.',
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

// 주소를 32비트 수로 바꾼다.
const toNumber = (address: string) => address.split('.').reduce((sum, octet) => sum * 256 + Number(octet), 0)

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 208] : [0, 0, 280, 386]

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<ReservedAddressesDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 곁말이 모두 선명하고 선 없이 선택 안내가 나온다', () => {
    const { container } = render(<ReservedAddressesDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node], [data-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note'))).toEqual(Object.keys(noteLabels))
    for (const id of groupIds) expect(svg().querySelector(`[data-group-label="${id}"]`)!.textContent).toBe(groupLabels[id])
    expect(svg().querySelectorAll('[data-path], marker')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드와 그 곁말만 선명하고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<ReservedAddressesDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    for (const [id, owner] of Object.entries(noteOwner)) {
      expect(svg().querySelector(`[data-note="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(owner) ? '1' : '0.25')
    }
    for (const id of groupIds) {
      expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
      expect(svg().querySelector(`[data-group-label="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    }
    expect(svg().querySelectorAll('[data-path], marker')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말·그룹 라벨이 자리에 들어간다`, () => {
    render(<ReservedAddressesDiagram />)
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
      expect(note.textContent).toBe(noteLabels[note.getAttribute('data-note')!])
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
    // 문서용 주소 세 범위와 그 곁말은 문서용 주소 박스 안에, 나머지 범위와 곁말은 박스 밖에 있다.
    for (const id of docIds) expect(contains(groupBox('documentation'), nodeBox(id)), id).toBe(true)
    for (const id of nodeIds.filter((other) => !docIds.includes(other))) expect(overlaps(groupBox('documentation'), nodeBox(id)), id).toBe(false)
    for (const [id, owner] of Object.entries(noteOwner)) {
      const box = textBox(svg().querySelector(`[data-note="${id}"]`)!, id)
      expect(docIds.includes(owner) ? contains(groupBox('documentation'), box) : !overlaps(groupBox('documentation'), box), id).toBe(true)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  // 요점: 두 시나리오의 선명한 노드 집합은 겹치지 않고, 합치면 「이 네트워크」 주소를 뺀 모든 범위다.
  // 밖으로 나가지 않는 주소는 쓰임 곁말이 모두 「~ 안에서만」이고, 곁말의 이름은 본문 목록 항목의 굵은 이름과 같다.
  // 범위 상자는 본문의 차례대로 놓이고 주소가 차례로 커진다. 240.0.0.0/4는 255.255.255.255를 품는다.
  it('밖으로 나가지 않는 주소와 쓰임을 정한 범위가 겹치지 않고, 곁말의 이름이 본문 목록의 이름과 같다', async () => {
    render(<ReservedAddressesDiagram />)
    await select('밖으로 나가지 않는 주소')
    const stayLocal = brightNodes()
    expect(stayLocal).toEqual(stayLocalIds)
    for (const id of stayLocal) expect(noteLabels[`${id}-use`], id).toMatch(/안에서만$/u)

    await select('쓰임을 정한 범위')
    const specialUse = brightNodes()
    expect(specialUse).toEqual(specialUseIds)
    expect(stayLocal.filter((id) => specialUse.includes(id))).toEqual([])
    expect([...stayLocal, ...specialUse].sort()).toEqual(nodeIds.filter((id) => id !== 'this-network').sort())

    // 범위의 시작 주소가 본문의 차례대로 커진다.
    const starts = nodeIds.map((id) => toNumber(labels[id].split('/')[0]))
    for (let i = 1; i < starts.length; i += 1) expect(starts[i], nodeIds[i]).toBeGreaterThan(starts[i - 1])
    // 240.0.0.0/4는 240.0.0.0부터 255.255.255.255까지라 제한 브로드캐스트 주소를 품는다.
    const [futureStart, futurePrefix] = labels.future.split('/')
    const futureEnd = toNumber(futureStart) + 2 ** (32 - Number(futurePrefix)) - 1
    expect(futureEnd).toBe(toNumber(labels['limited-broadcast']))
    // 멀티캐스트 범위의 첫 옥텟은 앞 4비트가 1110이다.
    expect(Number(labels.multicast.split('.')[0]) >> 4).toBe(0b1110)

    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join('\n')
    for (const [id, text] of Object.entries(noteLabels).filter(([id]) => id.endsWith('-name'))) expect(body, id).toContain(`- **${text}**(`)
    expect(body).toContain(`- **${groupLabels.documentation}**(`)
    for (const id of nodeIds) expect(body, id).toContain(`\`${labels[id]}\``)
    expect(body).toContain('호스트 밖으로 나가지 않고 호스트 안에서 되돌아온다')
    expect(body).toContain('이 주소로는 같은 링크 안에서만 통신한다')
    expect(body).toContain('이 브로드캐스트는 같은 네트워크 안에서만 퍼진다')
    expect(body).toContain('출발지 주소로만 쓰고 목적지 주소로는 쓰지 않는다')
    expect(body).toContain('실제 장치에 붙이지 않는다')
    expect(body).toContain('그 그룹에 한꺼번에 보낼 때 목적지 주소로 쓴다')
    expect(body).toContain('지금은 어느 호스트에도 나눠 주지 않는다')
  })
}

describe('ReservedAddressesDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<ReservedAddressesDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 386')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('쓰임을 정한 범위')
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 208')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '쓰임을 정한 범위' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(brightNodes()).toEqual(specialUseIds)
    })
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<ReservedAddressesDiagram />)
    const text = visualsByTopicId[topicId].diagrams['reserved-addresses']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(reservedAddressesScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = reservedAddressesScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual([])
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 예약된 IP 주소 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
