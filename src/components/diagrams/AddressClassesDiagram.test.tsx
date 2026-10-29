import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { AddressClassesDiagram, addressClassesScenarios } from './AddressClassesDiagram'

const topicId = 'ip-addressing'
const anchorConceptId = `${topicId}.address-classes`
const rows = ['a', 'b', 'c', 'd', 'e']
const labels: Record<string, string> = {
  'a-name': 'A', 'a-bits': '0', 'a-range': '0~127',
  'b-name': 'B', 'b-bits': '10', 'b-range': '128~191',
  'c-name': 'C', 'c-bits': '110', 'c-range': '192~223',
  'd-name': 'D', 'd-bits': '1110', 'd-range': '224~239',
  'e-name': 'E', 'e-bits': '1111', 'e-range': '240~255',
}
const noteLabels: Record<string, string> = {
  'head-name': '클래스',
  'head-bits': '맨 앞 비트',
  'head-range': '첫 옥텟',
  'a-use': '네트워크 부분 8비트',
  'b-use': '네트워크 부분 16비트',
  'c-use': '네트워크 부분 24비트',
  'd-use': '멀티캐스트 주소',
  'e-use': '남겨 둔 주소',
  'example-bits': '첫 옥텟 150 = 10010110',
  'example-class': '맨 앞 두 비트가 10이라 B 클래스',
}
const nodeIds = Object.keys(labels)
const rowNodes = (row: string) => [`${row}-name`, `${row}-bits`, `${row}-range`]

const question = '첫 옥텟만 보고 어느 클래스인지 어떻게 알까?'
const figureName = 'IPv4 주소 클래스 A부터 E까지를 맨 앞 비트와 첫 옥텟 범위로 가르는 도식'
const svgName = 'A부터 E까지 클래스마다 한 줄에 맨 앞 비트 0, 10, 110, 1110, 1111과 첫 옥텟 범위 0~127, 128~191, 192~223, 224~239, 240~255를 놓고, A·B·C에는 네트워크 부분 8·16·24비트를, D에는 멀티캐스트 주소를, E에는 남겨 둔 주소를 적은 모습. 아래에 첫 옥텟 150을 2진수 10010110으로 펼쳐 B 클래스로 가르는 예가 있다'
const idleCaption = '클래스마다 한 줄에 맨 앞 비트와 첫 옥텟의 십진수 범위, 그리고 네트워크 부분의 길이나 그 범위의 쓰임을 놓았다. 버튼을 고르면 A·B·C와 D·E를 나눠 보거나, 첫 옥텟이 150인 주소가 어느 클래스인지 따라가 볼 수 있다.'
const legend = '한 줄이 클래스 하나다. 상자는 왼쪽부터 클래스 이름, 맨 앞 비트, 첫 옥텟의 십진수 범위이고, 오른쪽 글은 네트워크 부분의 길이나 그 범위의 쓰임이다.'
const expectedScenarios = [
  {
    id: 'unicast', label: 'A·B·C', nodes: [...rowNodes('a'), ...rowNodes('b'), ...rowNodes('c')],
    caption: 'A·B·C 클래스는 맨 앞 비트가 0, 10, 110으로 한 자리씩 길어지고, 네트워크 부분은 8, 16, 24비트로 커진다. 맨 앞 비트로 갈리므로 세 클래스의 첫 옥텟 범위는 서로 겹치지 않는다.',
    notes: ['a-use', 'b-use', 'c-use'],
  },
  {
    id: 'others', label: 'D·E', nodes: [...rowNodes('d'), ...rowNodes('e')],
    caption: '맨 앞이 1110인 D 클래스 224~239는 멀티캐스트 주소이고, 맨 앞이 1111인 E 클래스 240~255는 남겨 둔 주소다. 둘은 네트워크 부분과 호스트 부분으로 나누지 않는다.',
    notes: ['d-use', 'e-use'],
  },
  {
    id: 'example', label: '첫 옥텟 150', nodes: rowNodes('b'),
    caption: '첫 옥텟 150을 2진수로 펼치면 10010110이다. 맨 앞 두 비트가 10이라 B 클래스이고, 그래서 이 주소는 앞 16비트가 네트워크 부분이다.',
    notes: ['b-use', 'example-bits', 'example-class'],
  },
]
const headNotes = ['head-name', 'head-bits', 'head-range']

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
const visibleNotes = () => Array.from(svg().querySelectorAll('[data-note]'))
  .filter((note) => note.getAttribute('opacity') === '1')
  .map((note) => note.getAttribute('data-note')!)

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 232] : [0, 0, 280, 250]

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<AddressClassesDiagram />)
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
    const { container } = render(<AddressClassesDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node], [data-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(Array.from(svg().querySelectorAll('[data-note]'), (note) => note.textContent)).toEqual(Object.values(noteLabels))
    expect(svg().querySelectorAll('[data-group], [data-path], marker')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 줄과 그 곁말만 선명하다', async (scenario) => {
    const { container } = render(<AddressClassesDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(visibleNotes()).toEqual([...headNotes, ...scenario.notes])
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말이 자리에 들어간다`, () => {
    render(<AddressClassesDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length)
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
    const texts = Array.from(svg().querySelectorAll('[data-note]'), (note) => {
      expect(note).toHaveAttribute('font-size', '9')
      return textBox(note, note.getAttribute('data-note')!)
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
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  // 요점: 클래스는 맨 앞 비트로 갈리고, 각 줄의 첫 옥텟 범위는 그 비트로 시작하는 8비트의 가장 작은 값과 가장 큰 값이다.
  // 그래서 다섯 범위는 0~255를 빈틈없이 나누고 서로 겹치지 않는다. 첫 옥텟 150의 2진수는 B 줄의 맨 앞 비트로 시작한다.
  it('맨 앞 비트가 첫 옥텟 범위를 정하고, 150은 B 줄에 든다', async () => {
    render(<AddressClassesDiagram />)
    let next = 0
    for (const row of rows) {
      const bits = label(`${row}-bits`)
      const [low, high] = label(`${row}-range`).split('~').map(Number)
      expect(low, row).toBe(parseInt(bits.padEnd(8, '0'), 2))
      expect(high, row).toBe(parseInt(bits.padEnd(8, '1'), 2))
      expect(low, row).toBe(next)
      next = high + 1
      // 같은 줄의 상자는 같은 높이에 왼쪽부터 이름·비트·범위 차례로 놓인다.
      expect(nodeBox(`${row}-bits`).y).toBe(nodeBox(`${row}-name`).y)
      expect(nodeBox(`${row}-range`).y).toBe(nodeBox(`${row}-name`).y)
      expect(nodeBox(`${row}-name`).x).toBeLessThan(nodeBox(`${row}-bits`).x)
      expect(nodeBox(`${row}-bits`).x).toBeLessThan(nodeBox(`${row}-range`).x)
    }
    expect(next).toBe(256)
    expect(['a-use', 'b-use', 'c-use'].map((id) => noteLabels[id].match(/\d+/u)![0])).toEqual(['8', '16', '24'])

    const binary = noteLabels['example-bits'].split(' = ')[1]
    expect(parseInt(binary, 2)).toBe(150)
    expect(noteLabels['example-bits']).toContain('150')
    const matching = rows.filter((row) => binary.startsWith(label(`${row}-bits`)))
    expect(matching).toEqual(['b'])
    expect(noteLabels['example-class']).toContain(label('b-bits'))
    expect(noteLabels['example-class']).toContain(`${label('b-name')} 클래스`)

    await select('A·B·C')
    expect(brightNodes().filter((id) => id.endsWith('-bits')).map(label)).toEqual(['0', '10', '110'])
    await select('D·E')
    expect(brightNodes().filter((id) => id.endsWith('-name')).map(label)).toEqual(['D', 'E'])
    await select('첫 옥텟 150')
    expect(brightNodes()).toEqual(rowNodes('b'))
    expect(visibleNotes().map((id) => noteLabels[id]).join()).toContain(binary)

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const row of rows) {
      const [low, high] = label(`${row}-range`).split('~')
      expect(body, row).toContain(`\`${label(`${row}-bits`)}\`이다`)
      expect(body, row).toContain(`십진수로 ${low}부터 ${high}까지다`)
    }
    expect(body).toContain(`2진수로는 \`${binary}\`이다`)
    expect(body).toContain('멀티캐스트 주소')
    expect(body).toContain('남겨 두었다')
  })

  it('폭이 바뀌어도 고른 시나리오와 캡션을 유지하고 노드·곁말 id가 같다', async () => {
    const change = mockMatchMedia(wide)
    const { container } = render(<AddressClassesDiagram />)
    await select('첫 옥텟 150')
    const read = (selector: string, attribute: string) => Array.from(svg().querySelectorAll(selector), (element) => element.getAttribute(attribute)).sort()
    const ids = () => [read('[data-node]', 'data-node'), read('[data-note]', 'data-note')]
    const before = ids()
    change(!wide)
    expect(svg()).toHaveAttribute('viewBox', wide ? '0 0 280 250' : '0 0 440 232')
    expect(ids()).toEqual(before)
    expect(screen.getByRole('button', { name: '첫 옥텟 150' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(expectedScenarios[2].caption)
    expect(brightNodes()).toEqual(rowNodes('b'))
  })
}

describe('AddressClassesDiagram', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  layoutTests(false)

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<AddressClassesDiagram />)
    const text = visualsByTopicId[topicId].diagrams['address-classes']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(addressClassesScenarios.map(({ id }) => id)).toEqual(expectedScenarios.map(({ id }) => id))
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
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label: name }) => name)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = addressClassesScenarios.find(({ id }) => id === expected.id)!
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
