import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { NetworkBroadcastDiagram, networkBroadcastScenarios } from './NetworkBroadcastDiagram'

const topicId = 'ip-addressing'
const anchorConceptId = `${topicId}.network-broadcast-address`
const labels: Record<string, string> = {
  net: '192.0.2.0', first: '192.0.2.1', gap: '…', last: '192.0.2.254', broadcast: '192.0.2.255',
}
const groupLabel = '호스트에 붙일 수 있는 주소'
const noteLabels: Record<string, string> = {
  'net-role': '네트워크 주소',
  'net-bits': '호스트 부분 00000000',
  count: '256 − 2 = 254개',
  'broadcast-role': '브로드캐스트 주소',
  'broadcast-bits': '호스트 부분 11111111',
}
// 곁말마다 흐림을 따르는 노드.
const noteOwner: Record<string, string> = {
  'net-role': 'net', 'net-bits': 'net', count: 'first', 'broadcast-role': 'broadcast', 'broadcast-bits': 'broadcast',
}
const nodeIds = Object.keys(labels)
const hostNodes = ['first', 'gap', 'last']

const question = '네트워크의 주소 가운데 호스트에 붙일 수 없는 것은 무엇일까?'
const figureName = '한 네트워크의 주소를 네트워크 주소·브로드캐스트 주소와 호스트에 붙일 수 있는 주소로 가르는 도식'
const svgName = '앞 24비트가 네트워크 부분인 네트워크의 주소 192.0.2.0부터 192.0.2.255까지를 차례로 놓고, 호스트 부분이 00000000인 192.0.2.0은 네트워크 주소, 11111111인 192.0.2.255는 브로드캐스트 주소, 그 사이 192.0.2.1부터 192.0.2.254까지 254개는 호스트에 붙일 수 있는 주소로 나눈 모습'
const idleCaption = '앞 24비트가 네트워크 부분이라 호스트 부분이 넷째 옥텟 8비트인 네트워크다. 이 네트워크의 주소는 192.0.2.0부터 192.0.2.255까지 256개다. 버튼을 고르면 호스트에 붙이지 않는 두 주소와, 호스트에 붙일 수 있는 주소를 따로 볼 수 있다.'
const legend = '상자 하나가 주소 하나이고, 가운데의 …는 그 사이 주소를 줄인 것이다. 얇은 선 박스 안이 호스트에 붙일 수 있는 주소다.'
const expectedScenarios = [
  {
    id: 'network-address', label: '네트워크 주소', nodes: ['net'],
    caption: '호스트 부분을 모두 0인 00000000으로 둔 192.0.2.0은 이 네트워크 자체를 가리키는 네트워크 주소다. 네트워크를 가리킬 때 쓰는 주소라 호스트 하나에 붙이지 않는다.',
  },
  {
    id: 'hosts', label: '호스트에 붙일 주소', nodes: hostNodes,
    caption: '호스트 부분 8비트로 만들 수 있는 값은 256가지다. 모두 0인 값과 모두 1인 값을 빼면 192.0.2.1부터 192.0.2.254까지 254개가 남고, 이 주소들을 호스트에 하나씩 붙인다.',
  },
  {
    id: 'broadcast', label: '브로드캐스트 주소', nodes: ['broadcast'],
    caption: '호스트 부분을 모두 1인 11111111로 둔 192.0.2.255는 브로드캐스트 주소다. 이 네트워크의 모든 호스트에게 한꺼번에 보낼 때 받는 쪽 주소로 적으므로 호스트 하나에 붙이지 않는다.',
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
const groupBox = () => readBox(svg().querySelector('[data-group="hosts"]')!, 'hosts')
const label = (id: string) => svg().querySelector(`[data-node="${id}"] text`)!.textContent!
const lastOctet = (address: string) => Number(address.split('.')[3])

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 120] : [0, 0, 280, 246]
  // 주소가 커지는 방향. 세로형은 위에서 아래로, 가로형은 왼쪽에서 오른쪽으로 놓는다.
  const along = (box: SvgBox) => (wide ? box.x : box.y)

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<NetworkBroadcastDiagram />)
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
    const { container } = render(<NetworkBroadcastDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node], [data-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(Array.from(svg().querySelectorAll('[data-note]'), (note) => note.textContent)).toEqual(Object.values(noteLabels))
    expect(svg().querySelector('[data-group-label="hosts"]')!.textContent).toBe(groupLabel)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드와 그 곁말만 선명하고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<NetworkBroadcastDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    for (const [id, owner] of Object.entries(noteOwner)) {
      expect(svg().querySelector(`[data-note="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(owner) ? '1' : '0.25')
    }
    expect(svg().querySelector('[data-group="hosts"]')!.closest('[opacity]')).toBeNull()
    expect(svg().querySelectorAll('[data-path], marker')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말·그룹 라벨이 자리에 들어간다`, () => {
    render(<NetworkBroadcastDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + 1)
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
    const groupText = textBox(svg().querySelector('[data-group-label="hosts"]')!, 'group-label')
    const texts = [...Array.from(svg().querySelectorAll('[data-note]'), (note) => {
      expect(note).toHaveAttribute('font-size', '9')
      return textBox(note, note.getAttribute('data-note')!)
    }), groupText]
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
    expect(contains(groupBox(), groupText)).toBe(true)
    // 「256 − 2 = 254개」는 호스트에 붙일 주소 박스 안에, 두 주소의 이름과 비트는 박스 밖에 둔다.
    expect(contains(groupBox(), textBox(svg().querySelector('[data-note="count"]')!, 'count'))).toBe(true)
    for (const id of ['net-role', 'net-bits', 'broadcast-role', 'broadcast-bits']) {
      expect(overlaps(groupBox(), textBox(svg().querySelector(`[data-note="${id}"]`)!, id)), id).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  // 요점: 호스트 부분이 모두 0인 첫 주소와 모두 1인 끝 주소는 호스트에 붙일 주소 박스 밖에 있고, 그 사이 254개만 박스 안에 있다.
  // 2진수 곁말은 두 주소의 넷째 옥텟과 같고, 254는 8비트로 만들 수 있는 256가지에서 2를 뺀 수다. 주소와 셈은 개념 본문의 예와 같다.
  it('호스트 부분이 모두 0·모두 1인 두 주소만 박스 밖이고, 그 사이 254개가 호스트에 붙일 주소다', async () => {
    render(<NetworkBroadcastDiagram />)
    const netBits = noteLabels['net-bits'].split(' ').pop()!
    const broadcastBits = noteLabels['broadcast-bits'].split(' ').pop()!
    expect(netBits).toMatch(/^0{8}$/u)
    expect(broadcastBits).toMatch(/^1{8}$/u)
    expect(lastOctet(label('net'))).toBe(parseInt(netBits, 2))
    expect(lastOctet(label('broadcast'))).toBe(parseInt(broadcastBits, 2))
    const prefix = label('net').split('.').slice(0, 3).join('.')
    for (const id of ['first', 'last', 'broadcast']) expect(label(id).startsWith(`${prefix}.`), id).toBe(true)
    expect(lastOctet(label('first'))).toBe(lastOctet(label('net')) + 1)
    expect(lastOctet(label('last'))).toBe(lastOctet(label('broadcast')) - 1)
    const hostCount = lastOctet(label('last')) - lastOctet(label('first')) + 1
    expect(2 ** netBits.length - 2).toBe(hostCount)
    expect(noteLabels.count).toBe(`${2 ** netBits.length} − 2 = ${hostCount}개`)

    for (const id of hostNodes) expect(contains(groupBox(), nodeBox(id)), id).toBe(true)
    for (const id of ['net', 'broadcast']) expect(overlaps(groupBox(), nodeBox(id)), id).toBe(false)
    expect(along(nodeBox('net'))).toBeLessThan(along(nodeBox('first')))
    expect(along(nodeBox('first'))).toBeLessThan(along(nodeBox('gap')))
    expect(along(nodeBox('gap'))).toBeLessThan(along(nodeBox('last')))
    expect(along(nodeBox('last'))).toBeLessThan(along(nodeBox('broadcast')))

    const seen: string[] = []
    await select('네트워크 주소')
    expect(brightNodes()).toEqual(['net'])
    expect(visibleNotes().join()).toContain(netBits)
    expect(visibleNotes().join()).not.toContain(broadcastBits)
    seen.push(brightNodes().join())
    await select('호스트에 붙일 주소')
    expect(brightNodes().map(label)).not.toContain(label('net'))
    expect(brightNodes().map(label)).not.toContain(label('broadcast'))
    expect(visibleNotes()).toEqual([noteLabels.count])
    seen.push(brightNodes().join())
    await select('브로드캐스트 주소')
    expect(brightNodes()).toEqual(['broadcast'])
    expect(visibleNotes().join()).toContain(broadcastBits)
    expect(visibleNotes().join()).not.toContain(netBits)
    seen.push(brightNodes().join())
    expect(new Set(seen).size).toBe(3)

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    expect(body).toContain(`모두 0인 \`${netBits}\`으로 두면 \`${label('net')}\``)
    expect(body).toContain(`모두 1인 \`${broadcastBits}\`로 두면 십진수로 255이므로 \`${label('broadcast')}\``)
    expect(body).toContain(`\`${label('first')}\`부터 \`${label('last')}\`까지가 호스트에 붙일 수 있는 주소다`)
    expect(body).toContain(noteLabels.count)
  })

  it('폭이 바뀌어도 고른 시나리오와 캡션을 유지하고 노드·그룹·곁말 id가 같다', async () => {
    const change = mockMatchMedia(wide)
    const { container } = render(<NetworkBroadcastDiagram />)
    await select('브로드캐스트 주소')
    const read = (selector: string, attribute: string) => Array.from(svg().querySelectorAll(selector), (element) => element.getAttribute(attribute)).sort()
    const ids = () => [read('[data-node]', 'data-node'), read('[data-group]', 'data-group'), read('[data-note]', 'data-note')]
    const before = ids()
    change(!wide)
    expect(svg()).toHaveAttribute('viewBox', wide ? '0 0 280 246' : '0 0 440 120')
    expect(ids()).toEqual(before)
    expect(screen.getByRole('button', { name: '브로드캐스트 주소' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(expectedScenarios[2].caption)
    expect(brightNodes()).toEqual(['broadcast'])
  })
}

describe('NetworkBroadcastDiagram', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  layoutTests(false)

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<NetworkBroadcastDiagram />)
    const text = visualsByTopicId[topicId].diagrams['network-broadcast']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(networkBroadcastScenarios.map(({ id }) => id)).toEqual(expectedScenarios.map(({ id }) => id))
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual({ hosts: groupLabel })
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
      const scenario = networkBroadcastScenarios.find(({ id }) => id === expected.id)!
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
