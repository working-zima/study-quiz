import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { SubnetSizingDiagram, subnetSizingScenarios } from './SubnetSizingDiagram'

const topicId = 'ip-addressing'
const anchorConceptId = `${topicId}.subnet-sizing`
const labels: Record<string, string> = {
  p26: '/26', m26: '255.255.255.192',
  p27: '/27', m27: '255.255.255.224',
  p28: '/28', m28: '255.255.255.240',
  p29: '/29', m29: '255.255.255.248',
  p30: '/30', m30: '255.255.255.252',
}
const headLabels: Record<string, string> = {
  'head-prefix': '접두사 길이',
  'head-mask': '서브넷 마스크',
  'head-hosts': '호스트 수',
}
const rowLabels: Record<string, string> = {
  h26: '2⁶ − 2 = 62대',
  h27: '2⁵ − 2 = 30대',
  h28: '2⁴ − 2 = 14대',
  h29: '2³ − 2 = 6대',
  h30: '2² − 2 = 2대',
}
const pickLabels: Record<string, string> = {
  'by-hosts': '2⁴ − 2 = 14 ≥ 10 → /28',
  'by-subnets': '2³ = 8 ≥ 6 → 3비트 → /27',
}
const noteLabels = { ...headLabels, ...rowLabels, ...pickLabels }
const nodeIds = Object.keys(labels)
const prefixes = [26, 27, 28, 29, 30]

type Note = { x: number, y: number, anchor: 'start' | 'middle' | 'end' }
const tallNotes: Record<string, Note> = {
  'head-prefix': { x: 32, y: 16, anchor: 'middle' },
  'head-mask': { x: 120, y: 16, anchor: 'middle' },
  'head-hosts': { x: 184, y: 16, anchor: 'start' },
  h26: { x: 184, y: 43, anchor: 'start' },
  h27: { x: 184, y: 83, anchor: 'start' },
  h28: { x: 184, y: 123, anchor: 'start' },
  h29: { x: 184, y: 163, anchor: 'start' },
  h30: { x: 184, y: 203, anchor: 'start' },
  'by-hosts': { x: 8, y: 238, anchor: 'start' },
  'by-subnets': { x: 8, y: 238, anchor: 'start' },
}
const wideNotes: Record<string, Note> = {
  'head-prefix': { x: 36, y: 16, anchor: 'middle' },
  'head-mask': { x: 132, y: 16, anchor: 'middle' },
  'head-hosts': { x: 208, y: 16, anchor: 'start' },
  h26: { x: 208, y: 43, anchor: 'start' },
  h27: { x: 208, y: 83, anchor: 'start' },
  h28: { x: 208, y: 123, anchor: 'start' },
  h29: { x: 208, y: 163, anchor: 'start' },
  h30: { x: 208, y: 203, anchor: 'start' },
  'by-hosts': { x: 296, y: 123, anchor: 'start' },
  'by-subnets': { x: 296, y: 83, anchor: 'start' },
}

const question = '필요한 호스트 수와 서브넷 수에 맞는 마스크는 어떻게 고를까?'
const figureName = '접두사 길이마다 서브넷 마스크와 서브넷 하나의 호스트 수를 견주어, 필요한 수에 맞는 마스크를 고르는 도식'
const svgName = '접두사 길이 /26, /27, /28, /29, /30과 서브넷 마스크 255.255.255.192, 255.255.255.224, 255.255.255.240, 255.255.255.248, 255.255.255.252, 서브넷 하나에 붙일 수 있는 호스트 62대, 30대, 14대, 6대, 2대를 줄마다 놓은 표'
const idleCaption = '앞 24비트가 네트워크 부분인 네트워크를 나눌 때 쓰는 접두사 길이 /26부터 /30까지를 한 줄에 하나씩 놓았다. 줄마다 서브넷 마스크와, 서브넷 하나에 붙일 수 있는 호스트 수가 있다. 버튼을 고르면 필요한 수에서 어느 줄을 고르는지 볼 수 있다.'
const legend = '아래 줄로 갈수록 경계가 한 비트씩 뒤로 옮겨 가, 마스크의 넷째 옥텟은 커지고 서브넷 하나의 호스트 수는 줄어든다.'
const expectedScenarios = [
  {
    id: 'by-hosts', label: '호스트 10대', nodes: ['p28', 'm28'], note: 'by-hosts',
    caption: '서브넷마다 호스트가 10대 들어가야 한다면, 2³ − 2 = 6은 모자라고 2⁴ − 2 = 14가 10 이상인 가장 작은 크기라서 호스트 부분을 4비트 남긴 /28을 고른다. 마스크는 255.255.255.240이다.',
  },
  {
    id: 'by-subnets', label: '서브넷 6개', nodes: ['p27', 'm27'], note: 'by-subnets',
    caption: '서브넷이 6개 필요하다면, 2² = 4는 모자라고 2³ = 8이 6 이상이라 3비트를 넘겨 /24가 /27이 된다. 마스크는 255.255.255.224이고, 서브넷 하나에 호스트 30대가 들어간다.',
  },
]
const superscript: Record<string, number> = { '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6 }

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
const label = (id: string) => svg().querySelector(`[data-node="${id}"] text`)!.textContent!
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note')!)

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
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

// 보이는 곁말이 지정한 자리에 있고, viewBox 안에서 노드와도 서로와도 겹치지 않는다.
function expectNotes(ids: string[], places: Record<string, Note>, viewBox: [number, number, number, number]) {
  expect(shownNotes().sort()).toEqual([...ids].sort())
  const boxes = Array.from(svg().querySelectorAll('[data-note]'), (note) => {
    const id = note.getAttribute('data-note')!
    expect(note.textContent, id).toBe(noteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', places[id].anchor)
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    return textBox(note, id)
  })
  for (const box of boxes) {
    expect(box.x, box.id).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, box.id).toBeLessThanOrEqual(viewBox[2])
    expect(box.y, box.id).toBeGreaterThanOrEqual(0)
    expect(box.y + box.height, box.id).toBeLessThanOrEqual(viewBox[3])
    for (const id of nodeIds) expect(overlaps(box, nodeBox(id)), `${box.id} ↔ ${id}`).toBe(false)
  }
  for (let i = 0; i < boxes.length; i += 1) {
    for (const other of boxes.slice(i + 1)) expect(overlaps(boxes[i], other), `${boxes[i].id} ↔ ${other.id}`).toBe(false)
  }
}

function layoutTests(wide: boolean) {
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 224] : [0, 0, 280, 244]
  const places = wide ? wideNotes : tallNotes
  const fixedNotes = [...Object.keys(headLabels), ...Object.keys(rowLabels)]

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<SubnetSizingDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg()).toHaveAttribute('class', 'block h-auto w-full')
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 열 이름·호스트 수 곁말만 보이며 선택 안내가 나온다', () => {
    const { container } = render(<SubnetSizingDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node], [data-note]')) expect(element).toHaveAttribute('opacity', '1')
    expectNotes(fixedNotes, places, viewBox)
    expect(svg().querySelectorAll('[data-path], marker, [data-group]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 줄만 선명하고 그 셈 곁말이 보인다', async (scenario) => {
    const { container } = render(<SubnetSizingDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expectNotes([...fixedNotes, scenario.note], places, viewBox)
    // 호스트 수 곁말은 자기 줄의 흐림을 따르고, 열 이름과 셈 곁말은 흐려지지 않는다.
    for (const prefix of prefixes) {
      expect(svg().querySelector(`[data-note="h${prefix}"]`), `h${prefix}`).toHaveAttribute('opacity', scenario.nodes.includes(`p${prefix}`) ? '1' : '0.25')
    }
    for (const id of [...Object.keys(headLabels), scenario.note]) expect(svg().querySelector(`[data-note="${id}"]`), id).toHaveAttribute('opacity', '1')
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨이 자기 상자 안에 들어간다`, () => {
    render(<SubnetSizingDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length)
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
    // 줄마다 접두사 상자와 마스크 상자가 같은 높이에 나란하고, 줄은 접두사 길이 차례로 아래로 놓인다. 호스트 수 곁말은 마스크 오른쪽에 있다.
    for (const [index, prefix] of prefixes.entries()) {
      expect(nodeBox(`p${prefix}`).y).toBe(nodeBox(`m${prefix}`).y)
      expect(nodeBox(`p${prefix}`).x + nodeBox(`p${prefix}`).width).toBeLessThan(nodeBox(`m${prefix}`).x)
      expect(Number(places[`h${prefix}`].x)).toBeGreaterThan(nodeBox(`m${prefix}`).x + nodeBox(`m${prefix}`).width)
      if (index > 0) expect(nodeBox(`p${prefix}`).y).toBeGreaterThan(nodeBox(`p${prefix - 1}`).y)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  // 요점: 줄마다 마스크의 넷째 옥텟은 앞에서부터 1이 (접두사 길이 − 24)개 이어진 값이고 256에서 주소 수를 뺀 값이며,
  // 호스트 수 곁말은 2의 (32 − 접두사 길이) 제곱에서 2를 뺀 값이다(62·30·14·6·2). 호스트 10대에서는 14가 10 이상인 가장 작은
  // /28 줄 하나만, 서브넷 6개에서는 2³ = 8이 6 이상인 가장 작은 /27 줄 하나만 선명하다. 수와 마스크는 개념 본문에 있다.
  it('줄마다 마스크와 호스트 수가 2의 거듭제곱에서 나오고, 두 시나리오가 필요한 수를 채우는 가장 작은 줄을 고른다', async () => {
    render(<SubnetSizingDiagram />)
    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    const hostsOf = (prefix: number) => 2 ** (32 - prefix) - 2
    for (const prefix of prefixes) {
      expect(label(`p${prefix}`)).toBe(`/${prefix}`)
      const octets = label(`m${prefix}`).split('.').map(Number)
      expect(octets.slice(0, 3)).toEqual([255, 255, 255])
      expect(octets[3].toString(2).padStart(8, '0')).toBe('1'.repeat(prefix - 24) + '0'.repeat(32 - prefix))
      expect(octets[3]).toBe(256 - 2 ** (32 - prefix))
      const note = rowLabels[`h${prefix}`]
      const [, power, hosts] = note.match(/^2(.) − 2 = (\d+)대$/u)!
      expect(superscript[power], note).toBe(32 - prefix)
      expect(Number(hosts), note).toBe(hostsOf(prefix))
      expect(body, note).toContain(`2${power} − 2 = ${hosts}대`)
      expect(body).toContain(`\`${label(`m${prefix}`)}\``)
    }
    expect(prefixes.map(hostsOf)).toEqual([62, 30, 14, 6, 2])

    await select('호스트 10대')
    expect(brightNodes()).toEqual(['p28', 'm28'])
    expect(label('m28')).toBe('255.255.255.240')
    expect(hostsOf(28)).toBeGreaterThanOrEqual(10)
    expect(hostsOf(29)).toBeLessThan(10)
    const byHosts = brightNodes()

    await select('서브넷 6개')
    expect(brightNodes()).toEqual(['p27', 'm27'])
    expect(brightNodes()).not.toEqual(byHosts)
    expect(label('m27')).toBe('255.255.255.224')
    expect(2 ** (27 - 24)).toBeGreaterThanOrEqual(6)
    expect(2 ** (26 - 24)).toBeLessThan(6)

    expect(body).toContain('4일 때 2⁴ − 2 = 14라 10대가 들어간다')
    expect(body).toContain('곧 `/28`이며 마스크는 `255.255.255.240`이다')
    expect(body).toContain('k가 2일 때 2² = 4라 모자라고 3일 때 2³ = 8이라 6개를 채운다')
    expect(body).toContain('곧 `/27`이고 마스크는 `255.255.255.224`다')
  })
}

describe('SubnetSizingDiagram', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    afterEach(() => {
      vi.unstubAllGlobals()
    })

    describe('768px 이상으로 모의', () => {
      // 가로형 관문은 matchMedia를 모의한 뒤 같은 검사를 다시 건다.
      beforeEach(() => {
        mockMatchMedia(true)
      })
      layoutTests(true)
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지되고 노드·곁말 id가 세로형과 같다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<SubnetSizingDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 244')
      const tallNodeIds = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      await select('서브넷 6개')
      const tallNoteIds = shownNotes().sort()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 224')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodeIds)
      expect(shownNotes().sort()).toEqual(tallNoteIds)
      expect(screen.getByRole('button', { name: '서브넷 6개' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(svg().querySelector('[data-note="by-subnets"]')).toHaveAttribute('x', String(wideNotes['by-subnets'].x))
      expect(brightNodes()).toEqual(['p27', 'm27'])
    })
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<SubnetSizingDiagram />)
    const text = visualsByTopicId[topicId].diagrams['subnet-sizing']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(subnetSizingScenarios.map(({ id }) => id)).toEqual(expectedScenarios.map(({ id }) => id))
    expect(text.scenarios.map(({ id }) => id)).toEqual(expectedScenarios.map(({ id }) => id))
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toBeUndefined()
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.label).toBe(figureName)
    expect(text.svgLabel).toBe(svgName)
    expect(text.sources).toEqual([anchorConceptId])
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label: scenarioLabel }) => scenarioLabel)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = subnetSizingScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual([])
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 서브넷 수와 호스트 수 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
