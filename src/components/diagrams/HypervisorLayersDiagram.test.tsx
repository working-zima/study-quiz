import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { HypervisorLayersDiagram, hypervisorLayersScenarios } from './HypervisorLayersDiagram'

const topicId = 'windows-hyperv'
const anchorConceptId = `${topicId}.hyper-v`
const labels: Record<string, string> = {
  'host-os': 'Windows Server',
  'vm01': 'VM01',
  'vm02': 'VM02',
  'hypervisor': '하이퍼바이저(Hyper-V)',
  'hardware': '물리 하드웨어(CPU·메모리·디스크)',
}
const groupLabels: Record<string, string> = {
  'host': 'HV01',
}
const noteLabels: Record<string, string> = {
  'guest-note': '자기 운영 체제를 실행한다',
  'share-note': '하드웨어를 나눠 준다',
  'host-note': '가상 컴퓨터를 실행하는 물리 컴퓨터',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
// 맨 위 줄의 셋은 하이퍼바이저 위의 칸에서 실행된다.
const upperIds = ['host-os', 'vm01', 'vm02']
const vmIds = ['vm01', 'vm02']
const pathEnds: Record<string, [string, string]> = {
  'vm01-hypervisor': ['vm01', 'hypervisor'],
  'vm02-hypervisor': ['vm02', 'hypervisor'],
  'hypervisor-hardware-01': ['hypervisor', 'hardware'],
  'hypervisor-hardware-02': ['hypervisor', 'hardware'],
}
const tallPaths: Record<string, string> = {
  'vm01-hypervisor': 'M160 64 V80',
  'vm02-hypervisor': 'M232 64 V80',
  'hypervisor-hardware-01': 'M160 112 V136',
  'hypervisor-hardware-02': 'M232 112 V136',
}
const widePaths: Record<string, string> = {
  'vm01-hypervisor': 'M248 64 V80',
  'vm02-hypervisor': 'M368 64 V80',
  'hypervisor-hardware-01': 'M248 112 V136',
  'hypervisor-hardware-02': 'M368 112 V136',
}
const sharePaths = ['vm01-hypervisor', 'vm02-hypervisor', 'hypervisor-hardware-01', 'hypervisor-hardware-02']

const question = '물리 서버 한 대에서 운영 체제 여럿이 어떻게 함께 실행될까?'
const figureName = '호스트 HV01의 물리 하드웨어 위에 하이퍼바이저 Hyper-V가 놓이고, 그 위의 칸들에서 HV01의 Windows Server와 가상 컴퓨터 VM01·VM02의 게스트 운영 체제가 함께 실행되는 것을 보이는 도식'
const svgName = 'HV01 박스 안에 아래부터 물리 하드웨어(CPU·메모리·디스크), 하이퍼바이저(Hyper-V)를 쌓고, 맨 위 줄에 Windows Server와 VM01·VM02를 나란히 그린 그림'
const idleCaption = '호스트 HV01 안의 층을 아래부터 쌓아 두었다. HV01·VM01·VM02는 예로 붙인 이름이다. 버튼을 고르면 호스트와 게스트가 무엇인지와, 두 가상 컴퓨터가 하드웨어를 어떻게 나눠 쓰는지 볼 수 있다.'
const legend = '아래 줄은 HV01의 물리 하드웨어, 가운데 줄은 하이퍼바이저인 Hyper-V이고, 맨 위 줄의 셋은 하이퍼바이저가 내준 칸에서 실행된다. 화살표는 가상 컴퓨터가 하이퍼바이저를 거쳐 하드웨어를 나눠 쓰는 것을 가리킨다.'
const expectedScenarios = [
  {
    id: 'host', label: '호스트',
    nodes: ['host-os', 'hypervisor', 'hardware'], paths: [], notes: ['host-note'],
    caption: '호스트 HV01은 가상 컴퓨터를 실행하는 물리 컴퓨터다. 하드웨어 바로 위에 하이퍼바이저인 Hyper-V가 놓이고, HV01에 설치한 Windows Server는 그 위의 한 칸에서 실행되며 Hyper-V 관리자로 가상 컴퓨터를 관리한다.',
  },
  {
    id: 'guest', label: '게스트',
    nodes: ['vm01', 'vm02'], paths: [], notes: ['guest-note'],
    caption: 'VM01과 VM02 안의 운영 체제가 게스트다. 두 게스트는 하이퍼바이저가 내준 서로 다른 칸에서 실행되어, 저마다 자기 컴퓨터를 가진 것처럼 따로 운영 체제를 실행한다.',
  },
  {
    id: 'share', label: '하드웨어 나눠 쓰기',
    nodes: ['vm01', 'vm02', 'hypervisor', 'hardware'], paths: sharePaths, notes: ['share-note'],
    caption: '두 가상 컴퓨터가 쓰는 CPU·메모리·디스크는 모두 HV01의 하드웨어이고, 하이퍼바이저가 그것을 두 가상 컴퓨터에 나눠 준다. 그래서 서버 여러 대의 일을 HV01 한 대에 모으면 HV01의 하드웨어가 더 많이 쓰인다.',
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
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
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

type Segment = { x1: number, y1: number, x2: number, y2: number }

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

function crossesInside(segment: Segment, box: SvgBox) {
  const left = Math.min(segment.x1, segment.x2)
  const right = Math.max(segment.x1, segment.x2)
  const top = Math.min(segment.y1, segment.y2)
  const bottom = Math.max(segment.y1, segment.y2)
  if (top === bottom) return top > box.y && top < box.y + box.height && Math.min(right, box.x + box.width) > Math.max(left, box.x)
  return left > box.x && left < box.x + box.width && Math.min(bottom, box.y + box.height) > Math.max(top, box.y)
}

function touches(segment: Segment, box: SvgBox) {
  const left = Math.min(segment.x1, segment.x2)
  const right = Math.max(segment.x1, segment.x2)
  const top = Math.min(segment.y1, segment.y2)
  const bottom = Math.max(segment.y1, segment.y2)
  return left <= box.x + box.width && right >= box.x && top <= box.y + box.height && bottom >= box.y
}

function lineEnds(d: string) {
  const list = segments(d)
  return { start: { x: list[0].x1, y: list[0].y1 }, end: { x: list[list.length - 1].x2, y: list[list.length - 1].y2 } }
}

// 점이 상자의 네 변 가운데 하나 위에 있는가.
function onEdge(point: { x: number, y: number }, box: SvgBox) {
  const withinX = point.x >= box.x && point.x <= box.x + box.width
  const withinY = point.y >= box.y && point.y <= box.y + box.height
  return ((point.x === box.x || point.x === box.x + box.width) && withinY) || ((point.y === box.y || point.y === box.y + box.height) && withinX)
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 200] : [0, 0, 280, 200]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<HypervisorLayersDiagram />)
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
    const { container } = render(<HypervisorLayersDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<HypervisorLayersDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownPaths()).toEqual(scenario.paths)
    for (const path of svg().querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('d', paths[path.getAttribute('data-path')!])
      expect(path).toHaveAttribute('stroke-width', '2')
      expect(path).toHaveClass('stroke-title')
      expect(path).toHaveAttribute('marker-end', `url(#${svg().querySelector('marker')!.id})`)
      expect(path.closest('[opacity]')).toBeNull()
    }
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
    render(<HypervisorLayersDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      expect(contains(groupBox('host'), nodeBox(id)), `${id} ⊂ host`).toBe(true)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    for (const id of groupIds) {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
    }
    // 곁말은 HV01 박스 안에 들어가고, 노드·그룹 라벨·다른 곁말·선과 겹치지 않는다.
    const noteBoxes: SvgBox[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of scenario.notes) noteBoxes.push(textBox(note(id), id))
    }
    expect([...noteBoxes.map(({ id }) => id)].sort()).toEqual([...noteIds].sort())
    for (const box of noteBoxes) {
      expect(contains(groupBox('host'), box), box.id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
      for (const group of groupIds) expect(overlaps(box, groupLabelBox(group)), `${box.id} ↔ ${group} 라벨`).toBe(false)
      for (const other of noteBoxes.filter(({ id }) => id !== box.id)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
      for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 정한 노드 변에서 시작해 정한 노드 변에서 끝나고, 노드 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<HypervisorLayersDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(pathEnds)))
    for (const [id, d] of Object.entries(paths)) {
      const [from, to] = pathEnds[id]
      const { start, end } = lineEnds(d)
      expect(onEdge(start, nodeBox(from)), `${id} 시작`).toBe(true)
      expect(onEdge(end, nodeBox(to)), `${id} 끝`).toBe(true)
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
    }
  })

  // 요점: 「호스트」와 「게스트」에서 선명한 노드가 겹치지 않는다 — 호스트는 실제 하드웨어를 가진 쪽이고 게스트는 가상 컴퓨터 안의 운영 체제다.
  // 「하드웨어 나눠 쓰기」의 화살표는 두 가상 컴퓨터에서 저마다 하이퍼바이저로 들어가고, 하이퍼바이저에서 같은 물리 하드웨어 노드로 이어진다.
  it('호스트와 게스트의 선명한 노드가 겹치지 않고, 두 가상 컴퓨터의 화살표가 하이퍼바이저를 거쳐 같은 물리 하드웨어에 닿는다', async () => {
    render(<HypervisorLayersDiagram />)
    const brightNodes = () => nodeIds.filter((id) => opacity(id) === '1')

    // 층은 아래부터 물리 하드웨어 → 하이퍼바이저 → 맨 위 줄이다.
    for (const id of upperIds) {
      expect(nodeBox(id).y, id).toBe(nodeBox('host-os').y)
      expect(nodeBox(id).y + nodeBox(id).height, id).toBeLessThan(nodeBox('hypervisor').y)
    }
    expect(nodeBox('hypervisor').y + nodeBox('hypervisor').height).toBeLessThan(nodeBox('hardware').y)

    await select('호스트')
    const hostNodes = brightNodes()
    await select('게스트')
    const guestNodes = brightNodes()
    expect(hostNodes).toEqual(['host-os', 'hypervisor', 'hardware'])
    expect(guestNodes).toEqual(vmIds)
    expect(hostNodes.filter((id) => guestNodes.includes(id))).toEqual([])

    await select('하드웨어 나눠 쓰기')
    const shown = shownPaths()
    const ends = (id: string) => lineEnds(paths[id])
    const startsOn = (id: string, node: string) => onEdge(ends(id).start, nodeBox(node))
    const endsOn = (id: string, node: string) => onEdge(ends(id).end, nodeBox(node))
    for (const vm of vmIds) {
      const into = shown.filter((id) => startsOn(id, vm) && endsOn(id, 'hypervisor'))
      expect(into, vm).toHaveLength(1)
      const onward = shown.filter((id) => startsOn(id, 'hypervisor') && ends(id).start.x === ends(into[0]).end.x)
      expect(onward, vm).toHaveLength(1)
      expect(endsOn(onward[0], 'hardware'), vm).toBe(true)
    }
    const toHardware = shown.filter((id) => endsOn(id, 'hardware'))
    expect(toHardware).toHaveLength(2)
    for (const id of shown) expect(startsOn(id, 'host-os'), id).toBe(false)
    expect(opacity('host-os')).toBe('0.25')

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const name of ['`HV01`', '`VM01`', '`VM02`', '하이퍼바이저', '호스트', '게스트', 'CPU·메모리·디스크', 'Windows Server', '가상 컴퓨터를 실행하는 물리 컴퓨터', '자기 운영 체제를 실행한다', '하드웨어를 나눠 주는', '나눠 준다']) {
      expect(body, name).toContain(name)
    }
  })
}

describe('HypervisorLayersDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<HypervisorLayersDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 200')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('하드웨어 나눠 쓰기')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 200')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '하드웨어 나눠 쓰기' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><HypervisorLayersDiagram /><HypervisorLayersDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '하드웨어 나눠 쓰기' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<HypervisorLayersDiagram />)
    const text = visualsByTopicId[topicId].diagrams['hypervisor-layers']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(hypervisorLayersScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = hypervisorLayersScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 Hyper-V 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(within(figure).queryByRole('heading')).toBeNull()
  })
})
