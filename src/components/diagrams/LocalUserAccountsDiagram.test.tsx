import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { LocalUserAccountsDiagram, localUserAccountsScenarios } from './LocalUserAccountsDiagram'

const topicId = 'windows-ad'
const anchorConceptId = `${topicId}.local-accounts`
const labels: Record<string, string> = {
  admin: 'Administrator',
  guest: 'Guest',
  default: 'DefaultAccount',
  user01: 'user01',
  'srv-res': 'SRV01의 자원',
  'pc-res': 'PC01의 자원',
}
const groupLabels: Record<string, string> = {
  srv01: '서버 SRV01',
  pc01: '다른 컴퓨터 PC01',
}
const noteLabels: Record<string, string> = {
  'admin-note': '지우거나 잠글 수 없음',
  'guest-note': '기본으로 꺼짐',
  'default-note': '시스템이 관리',
  'pc-note': 'user01로 쓸 수 없음',
}
const noteScenario: Record<string, string> = {
  'admin-note': 'builtin', 'guest-note': 'builtin', 'default-note': 'builtin', 'pc-note': 'scope',
}
// 곁말마다 그 곁말이 설명하는 노드.
const noteNode: Record<string, string> = {
  'admin-note': 'admin', 'guest-note': 'guest', 'default-note': 'default', 'pc-note': 'pc-res',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const builtinIds = ['admin', 'guest', 'default']
// 노드마다 들어가는 그룹. 계정과 SRV01의 자원은 서버 SRV01 박스에, PC01의 자원은 다른 컴퓨터 PC01 박스에 든다.
const groupOf: Record<string, string> = {
  admin: 'srv01', guest: 'srv01', default: 'srv01', user01: 'srv01', 'srv-res': 'srv01', 'pc-res': 'pc01',
}

const tallPaths: Record<string, string> = {
  'use-srv': 'M210 112 V136',
}
const widePaths: Record<string, string> = {
  'use-srv': 'M212 116 V140',
}
// 선마다 [시작 노드, 끝 노드].
const ends: Record<string, [string, string]> = {
  'use-srv': ['user01', 'srv-res'],
}

const question = '로컬 계정은 어디까지 쓰일까?'
const figureName = '서버 SRV01에 Windows를 설치할 때 생기는 기본 로컬 사용자 계정 Administrator·Guest·DefaultAccount의 성질과, SRV01에 만든 로컬 계정 user01이 SRV01의 자원에만 쓰이고 다른 컴퓨터 PC01에서는 쓰이지 않는 것을 보이는 도식'
const svgName = '서버 SRV01 박스 안에 계정 Administrator·Guest·DefaultAccount·user01과 SRV01의 자원이 있고, 다른 컴퓨터 PC01 박스 안에 PC01의 자원이 있는 그림'
const idleCaption = '서버 SRV01 안에 Windows를 설치할 때 생기는 기본 계정 가운데 셋과 로컬 계정 user01, SRV01의 자원을 두고, 그와 따로 다른 컴퓨터 PC01과 그 자원을 두었다. 컴퓨터 이름과 user01은 예로 붙인 이름이다. 버튼을 고르면 기본 계정의 성질과 로컬 계정이 쓰이는 곳을 볼 수 있다.'
const legend = '박스 하나가 컴퓨터 한 대이고, 화살표는 계정이 쓸 수 있는 자원을 가리킨다.'
const expectedScenarios = [
  {
    id: 'builtin', label: '기본 계정',
    nodes: ['admin', 'guest', 'default'], paths: [] as string[],
    caption: 'Administrator·Guest·DefaultAccount는 Windows를 설치할 때 저절로 생기는 기본 로컬 사용자 계정이고 지울 수 없다. Administrator는 잠글 수도 없지만 이름을 바꾸거나 꺼 둘 수는 있고, Guest는 기본으로 꺼져 있으며, DefaultAccount는 사람이 아니라 시스템이 관리한다.',
  },
  {
    id: 'scope', label: '쓰이는 곳',
    nodes: ['user01', 'srv-res'], paths: ['use-srv'],
    caption: 'user01은 SRV01에 만든 로컬 계정이라 SRV01이 직접 확인하고, 이 계정으로는 SRV01에 있는 자원만 쓸 수 있다. PC01은 이 계정을 갖고 있지 않으므로 user01로 PC01에 로그온하거나 PC01의 파일을 쓸 수 없다.',
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

type Segment = { x1: number, y1: number, x2: number, y2: number }

// 직교 경로를 선분 목록으로 편다. M/H/V만 나온다.
function segments(d: string) {
  const result: Segment[] = []
  let x = 0
  let y = 0
  for (const [, command, first, second] of d.matchAll(/([MHV])(-?\d+)(?: (-?\d+))?/gu)) {
    if (command === 'M') { x = Number(first); y = Number(second); continue }
    const next = command === 'H' ? { x: Number(first), y } : { x, y: Number(first) }
    result.push({ x1: x, y1: y, x2: next.x, y2: next.y })
    x = next.x
    y = next.y
  }
  return result
}

// 선분이 상자 안쪽을 지나는가. 변에 닿기만 하는 것은 세지 않는다.
function crossesInside(segment: Segment, box: SvgBox) {
  const left = Math.min(segment.x1, segment.x2)
  const right = Math.max(segment.x1, segment.x2)
  const top = Math.min(segment.y1, segment.y2)
  const bottom = Math.max(segment.y1, segment.y2)
  if (top === bottom) return top > box.y && top < box.y + box.height && Math.min(right, box.x + box.width) > Math.max(left, box.x)
  return left > box.x && left < box.x + box.width && Math.min(bottom, box.y + box.height) > Math.max(top, box.y)
}

// 선분이 상자에 닿는가. 변에 닿는 것도 센다.
function touches(segment: Segment, box: SvgBox) {
  const left = Math.min(segment.x1, segment.x2)
  const right = Math.max(segment.x1, segment.x2)
  const top = Math.min(segment.y1, segment.y2)
  const bottom = Math.max(segment.y1, segment.y2)
  return left <= box.x + box.width && right >= box.x && top <= box.y + box.height && bottom >= box.y
}

function onEdge(x: number, y: number, box: SvgBox) {
  const insideX = x >= box.x && x <= box.x + box.width
  const insideY = y >= box.y && y <= box.y + box.height
  return ((x === box.x || x === box.x + box.width) && insideY) || ((y === box.y || y === box.y + box.height) && insideX)
}

function lineEnds(d: string) {
  const list = segments(d)
  return { start: { x: list[0].x1, y: list[0].y1 }, end: { x: list[list.length - 1].x2, y: list[list.length - 1].y2 } }
}

const endsAt = (point: { x: number, y: number }) => nodeIds.filter((id) => onEdge(point.x, point.y, nodeBox(id)))
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

const anchorConcept = () => topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!

function layoutTests(wide: boolean) {
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 188] : [0, 0, 280, 252]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<LocalUserAccountsDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<LocalUserAccountsDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(svg().querySelectorAll('[data-link]')).toHaveLength(0)
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<LocalUserAccountsDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownNotes()).toEqual(Object.keys(noteScenario).filter((id) => noteScenario[id] === scenario.id))
    for (const id of shownNotes()) expect(note(id)!.textContent).toBe(noteLabels[id])
    expect(shownPaths()).toEqual(scenario.paths)
    for (const path of svg().querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('d', paths[path.getAttribute('data-path')!])
      expect(path).toHaveAttribute('stroke-width', '2')
      expect(path).toHaveClass('stroke-title')
      expect(path).toHaveAttribute('marker-end', `url(#${svg().querySelector('marker')!.id})`)
      expect(path.closest('[opacity]')).toBeNull()
    }
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말·그룹 라벨이 자리에 들어간다`, async () => {
    render(<LocalUserAccountsDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
      // 노드는 자기 그룹 안에만 있고 다른 그룹과는 겹치지 않는다.
      for (const group of groupIds) {
        if (groupOf[id] === group) expect(contains(groupBox(group), nodeBox(id)), `${id} ⊂ ${group}`).toBe(true)
        else expect(overlaps(groupBox(group), nodeBox(id)), `${id} ↔ ${group}`).toBe(false)
      }
    }
    for (const group of groupIds) {
      for (const other of groupIds.filter((id) => id !== group)) expect(overlaps(groupBox(group), groupBox(other)), `${group} ↔ ${other}`).toBe(false)
    }
    const groupTexts = groupIds.map((id) => {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
      return box
    })
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const noteTexts = shownNotes().map((id) => {
        const element = note(id)!
        expect(element).toHaveAttribute('font-size', '9')
        expect(element).toHaveClass('fill-muted')
        const box = textBox(element, id)
        for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        // 곁말은 그 곁말이 설명하는 노드와 같은 컴퓨터 박스 안에 놓인다.
        expect(contains(groupBox(groupOf[noteNode[id]]), box), id).toBe(true)
        return box
      })
      for (const box of [...noteTexts, ...groupTexts]) {
        expect(box.x, box.id).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width, box.id).toBeLessThanOrEqual(viewBox[2])
        expect(box.y, box.id).toBeGreaterThanOrEqual(0)
        expect(box.y + box.height, box.id).toBeLessThanOrEqual(viewBox[3])
        for (const d of Object.values(paths)) {
          for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
        }
      }
      for (const box of noteTexts) {
        for (const group of groupTexts) expect(overlaps(box, group), `${box.id} ↔ ${group.id}`).toBe(false)
      }
      for (let i = 0; i < noteTexts.length; i += 1) {
        for (const other of noteTexts.slice(i + 1)) expect(overlaps(noteTexts[i], other), `${noteTexts[i].id} ↔ ${other.id}`).toBe(false)
      }
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('선의 양 끝은 노드의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<LocalUserAccountsDiagram />)
    for (const [id, d] of Object.entries(paths)) {
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
      const { start, end } = lineEnds(d)
      expect(endsAt(start), `${id} 시작`).toEqual([ends[id][0]])
      expect(endsAt(end), `${id} 끝`).toEqual([ends[id][1]])
    }
  })

  // 요점: 기본 계정을 고르면 설치할 때 생기는 계정 셋만 선명하고 사람이 만든 user01은 흐리며, 곁말이 저마다 자기 계정 바로 아래에 붙는다.
  // 쓰이는 곳을 고르면 화살표는 user01에서 같은 서버 SRV01의 자원으로만 가고, 다른 컴퓨터 PC01의 자원에는 어떤 선도 닿지 않으며 그 자원은 흐리다.
  it('기본 계정은 설치할 때 생기는 셋이고, 로컬 계정의 화살표는 같은 서버의 자원에만 닿는다', async () => {
    render(<LocalUserAccountsDiagram />)
    await select('기본 계정')
    expect(nodeIds.filter((id) => opacityOf(id) === '1')).toEqual(builtinIds)
    expect(opacityOf('user01')).toBe('0.25')
    for (const id of ['admin-note', 'guest-note', 'default-note']) {
      const box = textBox(note(id)!, id)
      const node = nodeBox(noteNode[id])
      expect(box.x + box.width / 2, id).toBeGreaterThanOrEqual(node.x)
      expect(box.x + box.width / 2, id).toBeLessThanOrEqual(node.x + node.width)
      expect(box.y, id).toBeGreaterThanOrEqual(node.y + node.height)
      expect(box.y, id).toBeLessThanOrEqual(node.y + node.height + 16)
    }
    expect(note('guest-note')!.textContent).toContain('꺼짐')

    await select('쓰이는 곳')
    expect(shownPaths()).toEqual(['use-srv'])
    const { start, end } = lineEnds(paths['use-srv'])
    expect(endsAt(start)).toEqual(['user01'])
    expect(endsAt(end)).toEqual(['srv-res'])
    expect(groupOf['srv-res']).toBe(groupOf.user01)
    for (const d of Object.values(paths)) {
      for (const segment of segments(d)) expect(touches(segment, nodeBox('pc-res'))).toBe(false)
      for (const segment of segments(d)) expect(touches(segment, groupBox('pc01'))).toBe(false)
    }
    expect(opacityOf('pc-res')).toBe('0.25')
    expect(note('pc-note')!.textContent).toContain(label('user01'))

    // 그림의 계정·컴퓨터 이름과 성질은 본문에 있는 것이다.
    const body = anchorConcept().paragraphs.join('\n')
    for (const id of builtinIds) expect(body, id).toContain(label(id))
    for (const name of ['`SRV01`', '`user01`', '`PC01`']) expect(body).toContain(name)
    expect(body).toContain('이 계정은 기본으로 꺼져 있고')
    expect(body).toContain('DefaultAccount는 사람이 아니라 시스템이 관리하는 계정')
    expect(body).toContain('지우거나, 로그온하지 못하게 잠글 수는 없지만')
    expect(body).toContain('`user01`로는 `PC01`에 로그온할 수도 `PC01`의 파일을 쓸 수도 없다')
    expect(body).toContain('root는 Windows의 기본 계정이 아니다')
  })
}

describe('LocalUserAccountsDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<LocalUserAccountsDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 252')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('쓰이는 곳')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 188')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '쓰이는 곳' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><LocalUserAccountsDiagram /><LocalUserAccountsDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '쓰이는 곳' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<LocalUserAccountsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['local-user-accounts']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(localUserAccountsScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = localUserAccountsScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 로컬 사용자 계정 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
