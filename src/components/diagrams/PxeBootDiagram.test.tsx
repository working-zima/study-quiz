import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { PxeBootDiagram, pxeBootScenarios } from './PxeBootDiagram'

const topicId = 'network-devices'
const anchorConceptId = `${topicId}.pxe`
const labels: Record<string, string> = {
  'pc05': 'PC05',
  'dhcp': 'DHCP 서버',
  'srv01': '부팅 서버 SRV01',
  'run': '부팅 파일 실행',
}
// 늘 보이는 곁말(자기 노드를 따라 흐려진다)과, 시나리오를 골랐을 때만 보이는 곁말.
const fixedNoteLabels: Record<string, string> = {
  'nic': '네트워크 카드의 PXE',
  'srv01-address': '192.0.2.10',
}
const fixedNoteOwner: Record<string, string> = { 'nic': 'pc05', 'srv01-address': 'srv01' }
const noteLabels: Record<string, string> = {
  'dhcp-note': '주소와 부팅 서버·부팅 파일 이름을 받는다',
  'tftp-note': 'SRV01에서 TFTP로 부팅 파일을 받는다',
  'run-note': '받은 부팅 파일을 실행한다',
}
const nodeIds = Object.keys(labels)
const noteIds = Object.keys(noteLabels)
// 1·2의 화살표는 PC05가 받는 것이 오는 쪽이고, 3의 화살표는 PC05가 받은 부팅 파일을 실행하는 단계를 가리킨다.
const pathEnds: Record<string, [string, string]> = {
  'dhcp-pc05': ['dhcp', 'pc05'],
  'srv01-pc05': ['srv01', 'pc05'],
  'pc05-run': ['pc05', 'run'],
}
const tallPaths: Record<string, string> = {
  'dhcp-pc05': 'M48 40 V112 H104',
  'srv01-pc05': 'M256 40 V112 H176',
  'pc05-run': 'M140 128 V168',
}
const widePaths: Record<string, string> = {
  'dhcp-pc05': 'M96 32 H160 V72 H192',
  'srv01-pc05': 'M128 128 H160 V88 H192',
  'pc05-run': 'M264 80 H320',
}

const question = '디스크가 빈 컴퓨터는 어디서 부팅 파일을 받을까?'
const figureName = '디스크가 빈 PC05가 DHCP 서버에게서 주소와 부팅 서버·부팅 파일 이름을 받고, 부팅 서버 SRV01에서 TFTP로 부팅 파일을 받아 실행하는 PXE 부팅의 차례를 보이는 도식'
const svgName = 'PC05와 DHCP 서버, 부팅 서버 SRV01, 부팅 파일 실행을 화살표로 이은 그림'
const idleCaption = '디스크가 비어 있는 PC05를 켜면 네트워크 카드의 PXE가 네트워크로 부팅을 시작한다. 같은 네트워크에는 DHCP 서버와 부팅 서버 SRV01이 있다. 버튼을 차례로 고르면 PXE 부팅의 단계를 볼 수 있다.'
const legend = '1과 2의 화살표는 PC05가 받는 것이 오는 쪽이고, 3의 화살표는 PC05가 받은 부팅 파일을 실행하는 단계를 가리킨다. 192.0.2.10은 문서의 예로 쓰라고 남겨 둔 주소이고, PC05·SRV01은 예로 붙인 이름표다.'
const expectedScenarios = [
  {
    id: 'dhcp', label: '1. 주소 받기',
    nodes: ['pc05', 'dhcp'],
    paths: ['dhcp-pc05'],
    notes: ['dhcp-note'],
    caption: 'PC05의 네트워크 카드가 DHCP로 주소를 청하면, DHCP 서버는 PC05가 쓸 IP 주소와 함께 부팅 서버의 주소 192.0.2.10과 부팅 파일의 이름을 알려 준다.',
  },
  {
    id: 'tftp', label: '2. 파일 받기',
    nodes: ['pc05', 'srv01'],
    paths: ['srv01-pc05'],
    notes: ['tftp-note'],
    caption: 'PC05는 DHCP로 알게 된 부팅 서버 SRV01에 TFTP로 그 이름의 파일을 달라고 청해, 부팅 파일을 내려받는다.',
  },
  {
    id: 'run', label: '3. 실행',
    nodes: ['pc05', 'run'],
    paths: ['pc05-run'],
    notes: ['run-note'],
    caption: 'PC05는 내려받은 부팅 파일을 실행한다. 그 파일이 운영 체제를 설치하거나 시작하는 다음 일을 이어 가므로, 디스크가 비어 있어도 PC05는 네트워크로 받은 파일로 부팅을 이어 간다.',
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
const label = (id: string) => svg().querySelector(`[data-node="${id}"] text`)!.textContent!
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note')!)
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)!
const fixedNote = (id: string) => svg().querySelector(`[data-fixed-note="${id}"]`)!
const opacity = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

// 곁말(9)의 가로 범위. 반각 문자가 섞이므로 어림값의 1.15배로 잡는다.
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

// 두 선분이 같은 직선 위에 있고 길이가 있는 구간을 함께 쓰는가.
function collinearOverlap(a: Segment, b: Segment) {
  const shared = (a1: number, a2: number, b1: number, b2: number) => Math.min(Math.max(a1, a2), Math.max(b1, b2)) - Math.max(Math.min(a1, a2), Math.min(b1, b2)) > 0
  if (a.x1 === a.x2 && b.x1 === b.x2 && a.x1 === b.x1) return shared(a.y1, a.y2, b.y1, b.y2)
  if (a.y1 === a.y2 && b.y1 === b.y2 && a.y1 === b.y1) return shared(a.x1, a.x2, b.x1, b.x2)
  return false
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 176] : [0, 0, 280, 236]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<PxeBootDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표와 시나리오 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<PxeBootDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(svg().querySelectorAll('[data-group]')).toHaveLength(0)
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    for (const [id, text] of Object.entries(fixedNoteLabels)) {
      expect(fixedNote(id).textContent).toBe(text)
      expect(fixedNote(id)).toHaveAttribute('font-size', '9')
      expect(fixedNote(id)).toHaveAttribute('opacity', '1')
    }
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<PxeBootDiagram />)
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
    for (const [id, owner] of Object.entries(fixedNoteOwner)) expect(fixedNote(id)).toHaveAttribute('opacity', opacity(owner))
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말이 자리에 들어간다`, async () => {
    render(<PxeBootDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    // 늘 보이는 곁말과 시나리오 곁말은 viewBox 안에 들어가고, 노드·선·서로와 겹치지 않는다.
    const fixed = Object.keys(fixedNoteLabels).map((id) => textBox(fixedNote(id), id))
    const seen: string[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const visible = [...fixed, ...scenario.notes.map((id) => textBox(note(id), id))]
      seen.push(...scenario.notes)
      expect(boxesOutsideViewBox(visible, viewBox)).toEqual([])
      for (const box of visible) {
        for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
        for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
        for (const other of visible.filter((otherBox) => otherBox.id !== box.id)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
      }
    }
    expect([...seen].sort()).toEqual([...noteIds].sort())
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 보낸 쪽의 변에서 시작해 받은 쪽의 변에서 끝나고, 노드 안을 지나지 않으며 서로 겹치지 않는다', () => {
    render(<PxeBootDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(pathEnds)))
    for (const [id, d] of Object.entries(paths)) {
      const { start, end } = lineEnds(d)
      expect(onEdge(start, nodeBox(pathEnds[id][0])), `${id} 시작`).toBe(true)
      expect(onEdge(end, nodeBox(pathEnds[id][1])), `${id} 끝`).toBe(true)
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
      }
    }
    for (const a of Object.keys(paths)) for (const b of Object.keys(paths).filter((other) => other !== a)) {
      for (const sa of segments(paths[a])) for (const sb of segments(paths[b])) expect(collinearOverlap(sa, sb), `${a} ↔ ${b}`).toBe(false)
    }
  })

  // 요점: 세 단계 모두 PC05가 선명하고, 함께 선명한 상대 노드는 DHCP 서버 → SRV01 → 부팅 파일 실행으로 단계마다 다르다.
  // 1과 2의 화살표는 상대 노드에서 PC05로 온다 — 특히 2의 화살표는 SRV01에서 PC05 쪽으로, 파일이 오는 방향이다. 3의 화살표는 PC05에서 나간다.
  it('PC05는 DHCP 서버에게서 주소를, SRV01에게서 부팅 파일을 받은 뒤 그 파일을 실행한다', async () => {
    render(<PxeBootDiagram />)
    const startNode = (pathId: string) => nodeIds.find((id) => onEdge(lineEnds(paths[pathId]).start, nodeBox(id)))
    const endNode = (pathId: string) => nodeIds.find((id) => onEdge(lineEnds(paths[pathId]).end, nodeBox(id)))
    const partner: Record<string, string> = {}

    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      expect(opacity('pc05'), scenario.id).toBe('1')
      const bright = nodeIds.filter((id) => id !== 'pc05' && opacity(id) === '1')
      expect(bright, scenario.id).toHaveLength(1)
      partner[scenario.id] = bright[0]
      expect(shownPaths(), scenario.id).toHaveLength(1)
      const [shown] = shownPaths()
      if (scenario.id === 'run') {
        expect(startNode(shown)).toBe('pc05')
        expect(endNode(shown)).toBe(bright[0])
      } else {
        expect(startNode(shown)).toBe(bright[0])
        expect(endNode(shown)).toBe('pc05')
      }
    }
    expect(partner).toEqual({ dhcp: 'dhcp', tftp: 'srv01', run: 'run' })

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const name of ['디스크가 비어 있는 컴퓨터 `PC05`', '부팅 서버 `SRV01`(`192.0.2.10`)', 'DHCP 서버는 `PC05`가 쓸 IP 주소와 함께 부팅 서버의 주소 `192.0.2.10`과 부팅 파일의 이름을 알려 준다', '`SRV01`에 TFTP로 그 이름의 파일을 달라고 청해 부팅 파일을 내려받는다', '`PC05`는 내려받은 부팅 파일을 실행한다', '네트워크 카드의 PXE']) {
      expect(body, name).toContain(name)
    }
  })
}

describe('PxeBootDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<PxeBootDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 236')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      await select('2. 파일 받기')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 176')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(screen.getByRole('button', { name: '2. 파일 받기' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><PxeBootDiagram /><PxeBootDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '2. 파일 받기' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<PxeBootDiagram />)
    const text = visualsByTopicId[topicId].diagrams['pxe-boot']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(pxeBootScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toBeUndefined()
    expect(text.notes).toEqual({ ...fixedNoteLabels, ...noteLabels })
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
      const scenario = pxeBootScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 PXE 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
