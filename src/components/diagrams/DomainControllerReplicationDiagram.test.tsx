import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { DomainControllerReplicationDiagram, domainControllerReplicationScenarios } from './DomainControllerReplicationDiagram'

const topicId = 'windows-ad'
const anchorConceptId = `${topicId}.domain-controller`
const labels: Record<string, string> = {
  pc01: 'PC01',
  dc01: 'DC01',
  dc02: 'DC02',
  rodc: '읽기 전용 도메인 컨트롤러',
}
const groupLabels: Record<string, string> = {
  dcs: 'example.com의 도메인 컨트롤러',
}
const noteLabels: Record<string, string> = {
  'copy-note': '복제',
  'stop-note': '멈춤',
  'oneway-note': '한 방향으로만 받는다',
}
const noteScenario: Record<string, string> = {
  'copy-note': 'replicate', 'stop-note': 'failover', 'oneway-note': 'rodc',
}
// 곁말은 모두 도메인 컨트롤러 박스 안에 놓인다.
const noteGroup: Record<string, string> = {
  'copy-note': 'dcs', 'stop-note': 'dcs', 'oneway-note': 'dcs',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
// 노드마다 들어가는 박스. 도메인 컨트롤러 셋은 박스 안에 있고, 로그온하는 PC01은 박스 밖에 있다.
const groupOf: Record<string, string | undefined> = {
  pc01: undefined, dc01: 'dcs', dc02: 'dcs', rodc: 'dcs',
}

const tallPaths: Record<string, string> = {
  'dc01-dc02': 'M120 96 H160',
  'pc01-dc02': 'M214 40 V80',
  'dc02-rodc': 'M200 112 V136',
}
const widePaths: Record<string, string> = {
  'dc01-dc02': 'M108 96 H148',
  'pc01-dc02': 'M194 40 V80',
  'dc02-rodc': 'M240 96 H268',
}
// 선마다 [시작 노드, 끝 노드].
const ends: Record<string, [string, string]> = {
  'dc01-dc02': ['dc01', 'dc02'],
  'pc01-dc02': ['pc01', 'dc02'],
  'dc02-rodc': ['dc02', 'rodc'],
}

const question = '도메인 컨트롤러 한 대가 멈추면 로그온은 어떻게 될까?'
const figureName = '도메인 example.com의 도메인 컨트롤러 DC01·DC02가 바뀐 내용을 서로 복제해 같은 디렉터리를 갖고, DC01이 멈춰도 PC01의 로그온을 DC02가 확인하며, 읽기 전용 도메인 컨트롤러는 한 방향으로 복제받기만 하는 것을 보이는 도식'
const svgName = 'PC01과, example.com의 도메인 컨트롤러 박스 안의 DC01·DC02·읽기 전용 도메인 컨트롤러가 있는 그림'
const idleCaption = '도메인 example.com에 도메인 컨트롤러 DC01·DC02와 읽기 전용 도메인 컨트롤러를 두고, 박스 밖에 로그온하는 PC01을 두었다. 도메인 이름과 컴퓨터 이름은 예로 붙인 이름이다. 버튼을 고르면 복제와 한 대가 멈출 때의 로그온, 읽기 전용 도메인 컨트롤러가 복제받는 방향을 볼 수 있다.'
const legend = '박스 안은 example.com의 도메인 컨트롤러이고, 화살표는 바뀐 내용이 복제되는 방향이나 로그온을 확인받는 곳을 가리킨다.'
const expectedScenarios = [
  {
    id: 'replicate', label: '복제',
    nodes: ['dc01', 'dc02'], paths: ['dc01-dc02'],
    caption: '관리자가 DC01에서 user01의 암호를 바꾸면 그 바뀐 내용이 DC02로 복제되어 두 서버가 같은 디렉터리를 갖는다. 디렉터리를 고치는 일은 대부분 어느 도메인 컨트롤러에서 해도 되고, 그 일을 받은 서버가 다른 도메인 컨트롤러로 복제한다.',
  },
  {
    id: 'failover', label: '한 대가 멈출 때',
    nodes: ['pc01', 'dc02'], paths: ['pc01-dc02'],
    caption: 'DC01이 고장으로 멈춰도 DC02가 복제로 같은 내용을 갖고 있으므로, PC01에서 user01로 로그온하면 DC02가 확인해 준다. 도메인 컨트롤러를 한 대만 두면 그 서버가 멈출 때 도메인 계정을 확인해 줄 서버가 없어진다.',
  },
  {
    id: 'rodc', label: '읽기 전용',
    nodes: ['dc02', 'rodc'], paths: ['dc02-rodc'],
    caption: '읽기 전용 도메인 컨트롤러는 디렉터리를 고칠 수 없어, 바꿀 일은 DC02처럼 고칠 수 있는 도메인 컨트롤러에서 하고 그 내용을 한 방향으로 복제받기만 한다. 물리 보안을 장담하기 어려운 지점 사무실에 도메인 컨트롤러를 둘 때 쓴다.',
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 144] : [0, 0, 280, 184]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<DomainControllerReplicationDiagram />)
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
    const { container } = render(<DomainControllerReplicationDiagram />)
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
    const { container } = render(<DomainControllerReplicationDiagram />)
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
    render(<DomainControllerReplicationDiagram />)
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
      // 도메인 컨트롤러는 박스 안에만 있고, PC01은 박스와 겹치지 않는다.
      for (const group of groupIds) {
        if (groupOf[id] === group) expect(contains(groupBox(group), nodeBox(id)), `${id} ⊂ ${group}`).toBe(true)
        else expect(overlaps(groupBox(group), nodeBox(id)), `${id} ↔ ${group}`).toBe(false)
      }
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
        expect(contains(groupBox(noteGroup[id]), box), id).toBe(true)
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
    render(<DomainControllerReplicationDiagram />)
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

  // 요점: 복제를 고르면 화살표가 DC01에서 DC02로 간다. 한 대가 멈출 때를 고르면 PC01에서 나간 로그온 화살표가 DC02에 닿고 DC01에는 어떤 선도 닿지 않으며,
  // DC01은 흐리고 그 바로 아래에 「멈춤」이 붙는다. 읽기 전용을 고르면 화살표가 읽기 전용 도메인 컨트롤러로 들어오기만 하고, 그 노드에서 나가는 선은 어느 시나리오에도 없다.
  it('한 대가 멈춰도 다른 도메인 컨트롤러가 확인하고, 읽기 전용 도메인 컨트롤러는 복제받기만 한다', async () => {
    render(<DomainControllerReplicationDiagram />)
    await select('복제')
    expect(shownPaths().map((id) => [endsAt(lineEnds(paths[id]).start)[0], endsAt(lineEnds(paths[id]).end)[0]])).toEqual([['dc01', 'dc02']])

    await select('한 대가 멈출 때')
    expect(shownPaths()).toEqual(['pc01-dc02'])
    expect(endsAt(lineEnds(paths['pc01-dc02']).start)).toEqual(['pc01'])
    expect(endsAt(lineEnds(paths['pc01-dc02']).end)).toEqual(['dc02'])
    for (const id of shownPaths()) {
      for (const segment of segments(paths[id])) expect(touches(segment, nodeBox('dc01')), id).toBe(false)
    }
    expect(opacityOf('dc01')).toBe('0.25')
    expect(opacityOf('dc02')).toBe('1')
    const stop = textBox(note('stop-note')!, 'stop-note')
    const dc01 = nodeBox('dc01')
    expect(stop.x + stop.width / 2).toBeGreaterThanOrEqual(dc01.x)
    expect(stop.x + stop.width / 2).toBeLessThanOrEqual(dc01.x + dc01.width)
    expect(stop.y).toBeGreaterThanOrEqual(dc01.y + dc01.height)
    expect(stop.y).toBeLessThanOrEqual(dc01.y + dc01.height + 16)

    await select('읽기 전용')
    expect(shownPaths().map((id) => endsAt(lineEnds(paths[id]).end)[0])).toEqual(['rodc'])
    for (const d of Object.values(paths)) expect(endsAt(lineEnds(d).start)).not.toContain('rodc')

    // 그림의 이름과 사실은 본문에 있는 것이다.
    const body = anchorConcept().paragraphs.join('\n')
    for (const name of ['`example.com`', '`DC01`', '`DC02`', '`PC01`', '`user01`']) expect(body).toContain(name)
    expect(body).toContain('`DC01`에서 도메인 계정 `user01`의 암호를 바꾸면 그 바뀐 내용이 `DC02`로 복제되어')
    expect(body).toContain('`DC01`이 고장으로 멈춰도')
    expect(body).toContain('`DC02`가 새 암호로 확인해 준다')
    expect(body).toContain('읽기 전용 도메인 컨트롤러(read-only domain controller, RODC)')
    expect(body).toContain('단방향 복제')
    expect(body).toContain('`DC01`이나 `DC02`에서 바꾼 내용이 그 RODC로 복제되고')
  })
}

describe('DomainControllerReplicationDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<DomainControllerReplicationDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 184')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('한 대가 멈출 때')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 144')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '한 대가 멈출 때' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><DomainControllerReplicationDiagram /><DomainControllerReplicationDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '복제' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<DomainControllerReplicationDiagram />)
    const text = visualsByTopicId[topicId].diagrams['dc-replication']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(domainControllerReplicationScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = domainControllerReplicationScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 도메인 컨트롤러 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
