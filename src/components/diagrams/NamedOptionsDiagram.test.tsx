import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { NamedOptionsDiagram, namedOptionsScenarios } from './NamedOptionsDiagram'

const topicId = 'linux-servers'
const anchorConceptId = `${topicId}.named-conf-options`
// 노드는 본문 예 options 문의 줄을 적은 차례대로 둔다.
const labels: Record<string, string> = {
  directory: 'directory "/srv/named";',
  masterfile: 'masterfile-format text;',
  dump: 'dump-file "cache_dump.db";',
  listen: 'listen-on port 53 { 192.0.2.53; };',
  allow: 'allow-query { 192.0.2.0/24; };',
  recursion: 'recursion yes;',
  dnssec: 'dnssec-validation auto;',
}
const groupLabels: Record<string, string> = { options: 'options { … };' }
// 곁말은 줄마다 하나이고 그 줄과 같은 id를 쓴다.
const noteLabels: Record<string, string> = {
  directory: '파일을 찾는 기준 디렉터리',
  masterfile: '영역 파일을 글자 꼴로 적는다',
  dump: '캐시를 쏟아 낼 파일',
  listen: '질의를 받을 이 서버의 주소',
  allow: '질의를 받아 줄 클라이언트',
  recursion: '대신 물어 답을 얻어 준다',
  dnssec: '받은 응답의 서명을 확인한다',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)

const question = 'options 문의 줄은 저마다 무엇을 정할까?'
const figureName = 'named.conf의 options 문에 적은 예 일곱 줄을 놓고, 파일을 맡는 줄, 질의를 받는 줄, 재귀와 DNSSEC 검증을 맡는 줄이 저마다 무엇을 정하는지 보이는 도식'
const svgName = 'options { … }; 박스 안에 directory "/srv/named";, masterfile-format text;, dump-file "cache_dump.db";, listen-on port 53 { 192.0.2.53; };, allow-query { 192.0.2.0/24; };, recursion yes;, dnssec-validation auto; 일곱 줄이 위에서 아래로 놓인 그림'
const idleCaption = 'named.conf의 options 문에 적은 예 일곱 줄이다. 경로와 파일 이름, 주소는 예로 붙인 것이다. 버튼을 고르면 파일을 맡는 줄, 질의를 받는 줄, 재귀와 검증을 맡는 줄이 저마다 무엇을 정하는지 볼 수 있다.'
const legend = '박스 안의 노드는 options 문의 한 줄이고, 곁말은 그 줄이 정하는 것이다.'
const expectedScenarios = [
  {
    id: 'files', label: '파일',
    nodes: ['directory', 'masterfile', 'dump'],
    caption: 'directory 줄의 /srv/named가 상대 경로의 기준이라, zone 문에 파일 이름만 적은 영역 파일 example.com.zone은 /srv/named/example.com.zone에서 찾는다. masterfile-format text는 보조 서버로 받아 저장하는 영역 파일까지 글자 꼴로 적게 하고, dump-file은 캐시를 쏟아 낼 파일을 정한다.',
  },
  {
    id: 'who', label: '받기와 답하기',
    nodes: ['listen', 'allow'],
    caption: 'listen-on에는 받는 쪽인 이 서버 자신의 주소 192.0.2.53과 포트 53을, allow-query에는 묻는 쪽인 클라이언트의 주소 범위 192.0.2.0/24를 적는다. 그래서 192.0.2.53으로 온 질의라도 이 범위 밖의 클라이언트가 보냈으면 받아 주지 않는다.',
  },
  {
    id: 'resolver', label: '재귀와 검증',
    nodes: ['recursion', 'dnssec'],
    caption: 'recursion yes면 재귀를 청하는 질의를 받았을 때 다른 DNS 서버들에 차례로 물어 답을 얻어 준다. dnssec-validation auto면 그렇게 받은 답이 서명된 영역에서 온 것일 때 BIND에 든 루트 영역의 신뢰 앵커를 출발점으로 서명을 확인하고, 확인에 실패한 답은 클라이언트에 돌려주지 않는다.',
  },
]

const svg = () => screen.getByRole('img', { name: svgName })
const select = async (name: string) => { await act(async () => { await userEvent.click(screen.getByRole('button', { name })) }) }

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
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (item) => item.getAttribute('data-note')!)
const opacityOf = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')

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

const groupLabelBox = (id: string) => textBox(svg().querySelector(`[data-group-label="${id}"]`)!, id)

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

const anchorConcept = () => topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!

function layoutTests(wide: boolean) {
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 314] : [0, 0, 280, 396]

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<NamedOptionsDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 줄이 모두 선명하고 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<NamedOptionsDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(svg().querySelectorAll('path:not(marker path)')).toHaveLength(0)
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 그 묶음의 줄과 곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<NamedOptionsDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownNotes()).toEqual(scenario.nodes)
    for (const id of shownNotes()) expect(note(id)!.textContent).toBe(noteLabels[id])
    expect(shownPaths()).toEqual([])
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말·그룹 라벨이 자리에 들어간다`, async () => {
    render(<NamedOptionsDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      expect(contains(groupBox('options'), nodeBox(id)), id).toBe(true)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    const groupText = groupLabelBox('options')
    expect(svg().querySelector('[data-group-label="options"]')).toHaveAttribute('font-size', '9')
    expect(contains(groupBox('options'), groupText)).toBe(true)
    for (const node of nodeIds) expect(overlaps(groupText, nodeBox(node)), `라벨 ↔ ${node}`).toBe(false)
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const noteTexts = shownNotes().map((id) => {
        const element = note(id)!
        expect(element).toHaveAttribute('font-size', '9')
        expect(element).toHaveClass('fill-muted')
        const box = textBox(element, id)
        for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        expect(overlaps(box, groupText), id).toBe(false)
        expect(contains(groupBox('options'), box), id).toBe(true)
        expect(box.x, id).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width, id).toBeLessThanOrEqual(viewBox[2])
        expect(box.y, id).toBeGreaterThanOrEqual(0)
        expect(box.y + box.height, id).toBeLessThanOrEqual(viewBox[3])
        // 곁말은 자기 줄 곁에 놓인다 — 세로형은 그 줄 바로 아래(다음 줄보다 위), 가로형은 그 줄 오른쪽(그 줄의 높이 안).
        const line = nodeBox(id)
        if (wide) {
          expect(box.x, id).toBeGreaterThan(line.x + line.width)
          expect(box.y, id).toBeGreaterThanOrEqual(line.y)
          expect(box.y + box.height, id).toBeLessThanOrEqual(line.y + line.height)
        } else {
          expect(box.y, id).toBeGreaterThanOrEqual(line.y + line.height)
          expect(box.x, id).toBeGreaterThanOrEqual(line.x)
          expect(box.x + box.width, id).toBeLessThanOrEqual(line.x + line.width)
          const below = nodeIds.map(nodeBox).filter((other) => other.y > line.y)
          for (const other of below) expect(box.y + box.height, `${id} ↔ ${other.id}`).toBeLessThanOrEqual(other.y)
        }
        return box
      })
      for (let i = 0; i < noteTexts.length; i += 1) {
        for (const other of noteTexts.slice(i + 1)) expect(overlaps(noteTexts[i], other), `${noteTexts[i].id} ↔ ${other.id}`).toBe(false)
      }
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  // 요점: 줄은 본문 예 options 문에 적은 차례대로 위에서 아래로 놓이고, 라벨이 본문의 줄과 글자 그대로 같다.
  // 「받기와 답하기」에서 선명한 줄은 정확히 listen-on과 allow-query이고, 그룹 박스는 흐려지지 않는다.
  it('줄이 본문 예의 차례대로 놓이고, 받기와 답하기에서 정확히 listen-on과 allow-query가 선명하다', async () => {
    render(<NamedOptionsDiagram />)
    const ys = nodeIds.map((id) => nodeBox(id).y)
    expect([...ys].sort((a, b) => a - b)).toEqual(ys)
    expect(new Set(ys).size).toBe(nodeIds.length)

    const body = anchorConcept().paragraphs.join('\n')
    const positions = nodeIds.map((id) => body.indexOf(`\`${label(id)}\``))
    for (const [index, id] of nodeIds.entries()) expect(positions[index], id).toBeGreaterThanOrEqual(0)
    // 예의 일곱 줄을 차례대로 늘어놓은 문장에서 줄의 차례가 노드의 차례와 같다.
    const listing = body.split('\n').find((paragraph) => paragraph.includes('일곱 줄은 차례대로'))!
    const order = nodeIds.map((id) => listing.indexOf(`\`${label(id)}\``))
    expect(order.every((position) => position >= 0)).toBe(true)
    expect([...order].sort((a, b) => a - b)).toEqual(order)
    expect(groupLabel('options').startsWith('options {')).toBe(true)
    expect(body).toContain('`options { … };`')

    await select('받기와 답하기')
    const clear = nodeIds.filter((id) => opacityOf(id) === '1')
    expect(clear).toEqual(['listen', 'allow'])
    expect(clear.map(label).map((line) => line.split(' ')[0])).toEqual(['listen-on', 'allow-query'])
    expect(svg().querySelector('[data-group="options"]')!.closest('[opacity]')).toBeNull()
    // 두 줄의 곁말은 받는 쪽(이 서버)과 묻는 쪽(클라이언트)을 가른다.
    expect(note('listen')!.textContent).toContain('이 서버')
    expect(note('allow')!.textContent).toContain('클라이언트')
  })
}

describe('NamedOptionsDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<NamedOptionsDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 396')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('받기와 답하기')
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 314')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '받기와 답하기' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownNotes()).toEqual(tallNotes)
      expect(shownPaths()).toEqual([])
    })
  })

  it('두 번 렌더해도 고른 시나리오가 서로 섞이지 않는다', async () => {
    render(<><NamedOptionsDiagram /><NamedOptionsDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    await act(async () => { await userEvent.click(within(figures[0]).getByRole('button', { name: '파일' })) })
    await act(async () => { await userEvent.click(within(figures[1]).getByRole('button', { name: '재귀와 검증' })) })
    const notesOf = (figure: HTMLElement) => Array.from(figure.querySelectorAll('[data-note]'), (item) => item.getAttribute('data-note'))
    expect(notesOf(figures[0])).toEqual(['directory', 'masterfile', 'dump'])
    expect(notesOf(figures[1])).toEqual(['recursion', 'dnssec'])
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<NamedOptionsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['named-options']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(namedOptionsScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = namedOptionsScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual([])
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 options 문 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = anchorConcept()
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(within(figure).queryByRole('heading')).toBeNull()
  })
})
