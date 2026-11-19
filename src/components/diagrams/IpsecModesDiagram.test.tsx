import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { IpsecModesDiagram, ipsecModesScenarios } from './IpsecModesDiagram'

const topicId = 'network-security'
const anchorConceptId = `${topicId}.ipsec`
const labels: Record<string, string> = {
  't-ip': '원래 IP 헤더',
  't-esp': 'ESP 헤더',
  't-data': '데이터',
  'n-ip': '새 IP 헤더',
  'n-esp': 'ESP 헤더',
  'u-ip': '원래 IP 헤더',
  'u-data': '데이터',
}
const groupLabels: Record<string, string> = {
  'transport': '전송 모드',
  'tunnel': '터널 모드',
  't-enc': '암호화되는 부분',
  'u-enc': '암호화되는 부분',
}
// 모드 박스 둘은 겹치지 않고, 암호화 박스는 자기 모드 박스 안에 든다.
const members: Record<string, string[]> = {
  'transport': ['t-ip', 't-esp', 't-data'],
  'tunnel': ['n-ip', 'n-esp', 'u-ip', 'u-data'],
  't-enc': ['t-data'],
  'u-enc': ['u-ip', 'u-data'],
}
const parentGroup: Record<string, string> = { 't-enc': 'transport', 'u-enc': 'tunnel' }
const noteLabels: Record<string, string> = {
  'transport-note': '원래 IP 헤더는 그대로 드러난다',
  'tunnel-note': '새 IP 헤더를 앞에 붙인다',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)

const question = 'IPsec의 두 모드는 패킷의 어디까지 보호할까?'
const figureName = 'IPsec의 ESP를 전송 모드와 터널 모드로 쓸 때 패킷의 칸이 놓이는 차례와, 그 가운데 암호화되는 칸을 견주는 도식'
const svgName = '전송 모드 박스와 터널 모드 박스에 패킷의 칸을 앞에서부터 차례로 두고, 암호화되는 칸을 따로 묶은 그림'
const idleCaption = 'IPsec의 ESP를 쓰는 두 모드에서 패킷의 칸이 놓이는 차례를 나란히 두었다. 버튼을 고르면 모드마다 무엇이 암호화되고 무엇이 드러나는지 볼 수 있다.'
const legend = '칸 하나가 패킷의 한 부분이고, 좁은 화면에서는 위에서 아래로, 넓은 화면에서는 왼쪽에서 오른쪽으로 패킷의 앞에서 뒤로 놓인다. 「데이터」 칸에는 IP 헤더 뒤에 실린 TCP·UDP 헤더와 그 뒤의 내용이 함께 들고, ESP가 데이터 뒤에 덧붙이는 부분은 그리지 않았다.'
const expectedScenarios = [
  {
    id: 'transport', label: '전송 모드',
    nodes: ['t-ip', 't-esp', 't-data'],
    notes: ['transport-note'],
    caption: '전송 모드는 원래 IP 헤더를 그대로 맨 앞에 두고, 그 바로 뒤에 ESP 헤더를 넣는다. ESP는 IP 헤더 뒤의 데이터만 암호화하므로, 가로챈 사람도 원래 IP 헤더에 적힌 출발지와 목적지는 볼 수 있다. 두 컴퓨터가 서로 주고받는 패킷을 스스로 지킬 때 쓴다.',
  },
  {
    id: 'tunnel', label: '터널 모드',
    nodes: ['n-ip', 'n-esp', 'u-ip', 'u-data'],
    notes: ['tunnel-note'],
    caption: '터널 모드는 원래 IP 패킷을 헤더까지 통째로 암호화하고, 그 앞에 ESP 헤더와 새 IP 헤더를 붙인다. 앞 예에서 새 IP 헤더에는 VPNGW1의 192.0.2.1과 VPNGW2의 203.0.113.1이 적히고, 원래 헤더의 10.1.0.5와 10.2.0.7은 암호화되어 가려진다. 게이트웨이 사이의 VPN에 쓴다.',
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
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note')!)
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)!
const opacity = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function contains(outer: SvgBox, inner: SvgBox) {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height
}

// 곁말·그룹 라벨(9)의 가로 범위. 반각 문자가 섞이므로 어림값의 1.15배로 잡는다.
function textBox(text: Element, id: string): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9) * 1.15
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id, x: left, y: y - 9, width, height: 9 }
}

const groupLabelBox = (id: string) => textBox(svg().querySelector(`[data-group-label="${id}"]`)!, `${id}-label`)

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 220] : [0, 0, 280, 224]

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<IpsecModesDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 선·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<IpsecModesDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(svg().querySelectorAll('path')).toHaveLength(0)
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 칸과 곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<IpsecModesDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(svg().querySelectorAll('path')).toHaveLength(0)
    expect(shownNotes()).toEqual(scenario.notes)
    for (const id of scenario.notes) {
      expect(note(id).textContent).toBe(noteLabels[id])
      expect(note(id)).toHaveAttribute('font-size', '9')
    }
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·그룹 라벨·곁말이 자리에 들어간다`, async () => {
    render(<IpsecModesDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const group of groupIds) {
        const inside = members[group].includes(id)
        expect(contains(groupBox(group), nodeBox(id)), `${id} ⊂ ${group}`).toBe(inside)
        if (!inside) expect(overlaps(groupBox(group), nodeBox(id)), `${id}는 ${group} 박스 밖`).toBe(false)
      }
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    expect(overlaps(groupBox('transport'), groupBox('tunnel'))).toBe(false)
    expect(overlaps(groupBox('t-enc'), groupBox('u-enc'))).toBe(false)
    for (const [inner, outer] of Object.entries(parentGroup)) expect(contains(groupBox(outer), groupBox(inner)), `${inner} ⊂ ${outer}`).toBe(true)
    for (const id of groupIds) {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
      for (const other of groupIds.filter((otherId) => otherId !== id)) {
        expect(overlaps(box, groupLabelBox(other)), `${id} 라벨 ↔ ${other} 라벨`).toBe(false)
        if (parentGroup[other] !== id) continue
        expect(overlaps(box, groupBox(other)), `${id} 라벨 ↔ ${other} 박스`).toBe(false)
      }
    }
    // 곁말은 시나리오마다 하나다. viewBox 안에 들어가고, 노드·그룹 박스와 겹치지 않는다.
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const shown = shownNotes().map((id) => textBox(note(id), id))
      expect(shown).toHaveLength(1)
      expect(boxesOutsideViewBox(shown, viewBox)).toEqual([])
      for (const box of shown) {
        for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(overlaps(box, groupBox(group)), `${box.id} ↔ ${group}`).toBe(false)
      }
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  // 요점: 「새 IP 헤더」 칸은 터널 모드 박스에만 있다. 암호화 박스는 터널 모드에서는 원래 IP 헤더 칸을 감싸고,
  // 전송 모드에서는 원래 IP 헤더 칸을 감싸지 않는다. ESP 헤더 칸은 두 모드 모두 암호화 박스 밖이고, 칸은 모드마다 패킷의 앞에서 뒤로 놓인다.
  it('터널 모드만 원래 IP 헤더까지 암호화하고 앞에 새 IP 헤더를 붙인다', async () => {
    render(<IpsecModesDiagram />)
    const newHeaders = nodeIds.filter((id) => label(id) === '새 IP 헤더')
    expect(newHeaders).toEqual(['n-ip'])
    expect(contains(groupBox('tunnel'), nodeBox('n-ip'))).toBe(true)
    expect(overlaps(groupBox('transport'), nodeBox('n-ip'))).toBe(false)

    const originals = nodeIds.filter((id) => label(id) === '원래 IP 헤더')
    expect(originals).toEqual(['t-ip', 'u-ip'])
    expect(contains(groupBox('u-enc'), nodeBox('u-ip'))).toBe(true)
    expect(contains(groupBox('t-enc'), nodeBox('t-ip'))).toBe(false)
    expect(overlaps(groupBox('t-enc'), nodeBox('t-ip'))).toBe(false)
    for (const id of ['t-esp', 'n-esp']) for (const enc of ['t-enc', 'u-enc']) expect(overlaps(groupBox(enc), nodeBox(id)), `${id} ↔ ${enc}`).toBe(false)

    for (const row of [members.transport, members.tunnel]) {
      for (let index = 1; index < row.length; index += 1) {
        const before = nodeBox(row[index - 1])
        const after = nodeBox(row[index])
        if (wide) {
          expect(after.y, row[index]).toBe(before.y)
          expect(after.x, row[index]).toBeGreaterThanOrEqual(before.x + before.width)
        } else {
          expect(after.x, row[index]).toBe(before.x)
          expect(after.y, row[index]).toBeGreaterThanOrEqual(before.y + before.height)
        }
      }
    }

    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const lit = nodeIds.filter((id) => opacity(id) === '1')
      const litOriginal = lit.filter((id) => label(id) === '원래 IP 헤더')
      expect(litOriginal, scenario.id).toHaveLength(1)
      const encrypted = ['t-enc', 'u-enc'].some((enc) => contains(groupBox(enc), nodeBox(litOriginal[0])))
      expect(encrypted, scenario.id).toBe(scenario.id === 'tunnel')
      expect(lit.some((id) => label(id) === '새 IP 헤더'), scenario.id).toBe(scenario.id === 'tunnel')
    }

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const phrase of ['원래 IP 헤더에 적힌 출발지와 목적지는 그대로 드러난다', '원래 IP 패킷을 헤더까지 통째로 지키고, 그 앞에 AH나 ESP의 헤더와 새 IP 헤더를 붙인다', '새 IP 헤더, ESP 헤더, 원래 IP 헤더, 데이터의 차례', '원래 IP 헤더부터 데이터까지가 암호화되어 있다', '출발지는 `192.0.2.1`, 목적지는 `203.0.113.1`이다']) {
      expect(body, phrase).toContain(phrase)
    }
  })
}

describe('IpsecModesDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<IpsecModesDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 224')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('터널 모드')
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 220')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '터널 모드' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownNotes()).toEqual(tallNotes)
    })
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<IpsecModesDiagram />)
    const text = visualsByTopicId[topicId].diagrams['ipsec-modes']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(ipsecModesScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
    expect(Object.keys(text.notes!).sort()).toEqual([...noteIds].sort())
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = ipsecModesScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual([])
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 IPsec 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.join('').replace(/\*\*|`/gu, ''))
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(within(figure).queryByRole('heading')).toBeNull()
  })
})
