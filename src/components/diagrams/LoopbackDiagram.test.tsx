import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { LoopbackDiagram, loopbackScenarios } from './LoopbackDiagram'

const topicId = 'ip-address-types'
const anchorConceptId = `${topicId}.loopback`
const labels: Record<string, string> = {
  program: '프로그램',
  software: '네트워크 소프트웨어',
  nic: '네트워크 카드',
  network: '네트워크',
  'host-b': '호스트 B',
}
const groupLabels: Record<string, string> = { 'host-a': '호스트 A' }
const noteLabels: Record<string, string> = {
  'host-b-address': '192.168.0.11',
  'to-loopback': '목적지 127.0.0.1',
  'to-host-b': '목적지 192.168.0.11',
}
// 호스트 B의 주소 곁말은 호스트 B의 흐림을 따른다. 목적지 곁말은 자기 시나리오에서만 보인다.
const noteOwner: Record<string, string> = { 'host-b-address': 'host-b' }
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const insideIds = ['program', 'software', 'nic']

const tallPaths: Record<string, string> = {
  send: 'M72 60 V84',
  return: 'M104 84 V60',
  'to-nic': 'M88 116 V140',
  'nic-out': 'M88 172 V196',
  'to-host-b': 'M152 212 H168',
}
const widePaths: Record<string, string> = {
  send: 'M88 38 H112',
  return: 'M112 50 H88',
  'to-nic': 'M240 44 H264',
  'nic-out': 'M312 60 V104',
  'to-host-b': 'M348 120 H364',
}
// 경로마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  send: ['program', 'software'],
  return: ['software', 'program'],
  'to-nic': ['software', 'nic'],
  'nic-out': ['nic', 'network'],
  'to-host-b': ['network', 'host-b'],
}

const question = '127.0.0.1로 보낸 패킷은 어디로 갈까?'
const figureName = '루프백 주소로 보낸 패킷과 다른 호스트로 보낸 패킷이 어디까지 가는지 견주는 도식'
const svgName = '호스트 A 안의 프로그램·네트워크 소프트웨어·네트워크 카드, 호스트 A 밖의 네트워크와 호스트 B(192.168.0.11), 그리고 목적지에 따라 패킷이 지나는 길'
const idleCaption = '호스트 A 안에 프로그램, 네트워크 소프트웨어, 네트워크 카드를 놓고, 호스트 A 밖에 네트워크와 호스트 B를 놓았다. 버튼을 고르면 목적지가 루프백 주소일 때와 호스트 B일 때 패킷이 지나는 길을 볼 수 있다.'
const legend = '얇은 선 박스가 호스트 A이고, 화살표는 패킷이 가는 방향이다. 호스트 B 아래의 곁말은 호스트 B의 사설 주소다.'
const expectedScenarios = [
  {
    id: 'loopback', label: '127.0.0.1로',
    nodes: ['program', 'software'], paths: ['send', 'return'], notes: ['to-loopback'],
    caption: '목적지가 루프백 주소 127.0.0.1이면 네트워크 소프트웨어가 패킷을 네트워크 카드로 넘기지 않고, 호스트 A 안의 프로그램에게 곧바로 되돌려 준다. 패킷이 호스트 A 밖으로 나가지 않으므로 호스트 B에게는 닿지 않는다.',
  },
  {
    id: 'other-host', label: '다른 호스트로',
    nodes: nodeIds, paths: ['send', 'to-nic', 'nic-out', 'to-host-b'], notes: ['to-host-b'],
    caption: '목적지가 호스트 B의 주소 192.168.0.11이면 네트워크 소프트웨어가 패킷을 네트워크 카드로 넘기고, 패킷은 네트워크로 나가 호스트 B에 닿는다.',
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
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const scenarioNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note')!).filter((id) => !(id in noteOwner))

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

const nodeAt = (point: { x: number, y: number }) => nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))

// 그룹 라벨이 차지하는 상자.
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 156] : [0, 0, 280, 248]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<LoopbackDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 호스트 B의 주소가 모두 선명하고 화살표 없이 선택 안내가 나온다', () => {
    const { container } = render(<LoopbackDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node], [data-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note'))).toEqual(Object.keys(noteOwner))
    expect(scenarioNotes()).toEqual([])
    for (const id of groupIds) expect(svg().querySelector(`[data-group-label="${id}"]`)!.textContent).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 선명하고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<LoopbackDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    for (const [id, owner] of Object.entries(noteOwner)) {
      expect(svg().querySelector(`[data-note="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(owner) ? '1' : '0.25')
    }
    expect(scenarioNotes()).toEqual(scenario.notes)
    for (const id of scenario.notes) {
      const note = svg().querySelector(`[data-note="${id}"]`)!
      expect(note.textContent).toBe(noteLabels[id])
      expect(note.closest('[opacity]')).toBeNull()
    }
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

  it.each(expectedScenarios)(`$label: 모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말·그룹 라벨이 자리에 들어간다`, async (scenario) => {
    render(<LoopbackDiagram />)
    await select(scenario.label)
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
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      return box
    })
    const texts = [...Array.from(svg().querySelectorAll('[data-note]'), (note) => {
      expect(note).toHaveAttribute('font-size', '9')
      expect(note).toHaveClass('fill-muted')
      return textBox(note, note.getAttribute('data-note')!)
    }), ...groupTexts]
    expect(texts).toHaveLength(Object.keys(noteOwner).length + scenario.notes.length + groupIds.length)
    for (const box of texts) {
      expect(box.x, box.id).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width, box.id).toBeLessThanOrEqual(viewBox[2])
      expect(box.y, box.id).toBeGreaterThanOrEqual(0)
      expect(box.y + box.height, box.id).toBeLessThanOrEqual(viewBox[3])
      for (const id of nodeIds) expect(overlaps(box, nodeBox(id)), `${box.id} ↔ ${id}`).toBe(false)
      for (const d of Object.values(paths)) {
        for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
      }
    }
    for (let i = 0; i < texts.length; i += 1) {
      for (const other of texts.slice(i + 1)) expect(overlaps(texts[i], other), `${texts[i].id} ↔ ${other.id}`).toBe(false)
    }
    // 목적지 곁말은 호스트 A 박스 안에, 호스트 B의 주소는 박스 밖에 있다.
    for (const id of scenario.notes) expect(contains(groupBox('host-a'), textBox(svg().querySelector(`[data-note="${id}"]`)!, id)), id).toBe(true)
    expect(overlaps(groupBox('host-a'), textBox(svg().querySelector('[data-note="host-b-address"]')!, 'host-b-address'))).toBe(false)
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나거나 다른 화살표와 만나지 않는다', async () => {
    render(<LoopbackDiagram />)
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const lines = shownPaths()
      for (const id of lines) {
        const d = paths[id]
        for (const segment of segments(d)) {
          for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
          for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
        }
        const { start, end } = lineEnds(d)
        expect(nodeAt(start), `${id} 시작`).toBe(ends[id][0])
        expect(nodeAt(end), `${id} 끝`).toBe(ends[id][1])
      }
      for (let i = 0; i < lines.length; i += 1) {
        for (const other of lines.slice(i + 1)) {
          for (const a of segments(paths[lines[i]])) {
            for (const b of segments(paths[other])) {
              const box = { id: '', x: Math.min(b.x1, b.x2), y: Math.min(b.y1, b.y2), width: Math.abs(b.x2 - b.x1), height: Math.abs(b.y2 - b.y1) }
              expect(touches(a, box), `${lines[i]} ↔ ${other}`).toBe(false)
            }
          }
        }
      }
    }
  })

  // 요점: 127.0.0.1로 보낸 패킷의 길은 모두 호스트 A 박스 안에 있고 네트워크 카드에 닿지 않으며, 프로그램에서 나가 프로그램으로 돌아온다.
  // 다른 호스트로 보낸 패킷은 네트워크 카드를 지나 호스트 A 박스 밖으로 나가 호스트 B에서 끝난다. 이 사실과 예시 주소는 개념 본문에 있다.
  it('루프백 주소로 보낸 패킷은 호스트 A 안에서 돌아오고, 다른 호스트로 보낸 패킷만 네트워크 카드를 지나 호스트 B에 닿는다', async () => {
    render(<LoopbackDiagram />)
    for (const id of insideIds) expect(contains(groupBox('host-a'), nodeBox(id)), id).toBe(true)
    for (const id of ['network', 'host-b']) expect(overlaps(groupBox('host-a'), nodeBox(id)), id).toBe(false)

    await select('127.0.0.1로')
    const loopLines = shownPaths()
    for (const id of loopLines) {
      for (const segment of segments(paths[id])) {
        const box = { id, x: Math.min(segment.x1, segment.x2), y: Math.min(segment.y1, segment.y2), width: Math.abs(segment.x2 - segment.x1), height: Math.abs(segment.y2 - segment.y1) }
        expect(contains(groupBox('host-a'), box), id).toBe(true)
        expect(touches(segment, nodeBox('nic')), `${id} ↔ 네트워크 카드`).toBe(false)
      }
    }
    const loopHops = loopLines.map((id) => [nodeAt(lineEnds(paths[id]).start), nodeAt(lineEnds(paths[id]).end)])
    expect(loopHops).toEqual([['program', 'software'], ['software', 'program']])
    expect(brightNodes()).not.toContain('nic')
    expect(brightNodes()).not.toContain('host-b')

    await select('다른 호스트로')
    const hops = shownPaths().map((id) => [nodeAt(lineEnds(paths[id]).start), nodeAt(lineEnds(paths[id]).end)])
    expect(hops).toEqual([['program', 'software'], ['software', 'nic'], ['nic', 'network'], ['network', 'host-b']])
    expect(hops[hops.length - 1][1]).toBe('host-b')
    expect(hops.some(([, to]) => to === 'program')).toBe(false)

    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join('\n')
    expect(body).toContain('흔히 `127.0.0.1`을 쓴다')
    expect(body).toContain('네트워크 소프트웨어는 그 패킷을 네트워크 카드로 넘기지 않고, 같은 호스트 안에서 받을 프로그램에게 곧바로 되돌려 준다')
    expect(body).toContain('같은 네트워크의 호스트 B(사설 주소 `192.168.0.11`)에게는 닿지 않는다')
    expect(body).toContain('그 패킷은 호스트 A의 네트워크 카드를 지나 네트워크로 나가 호스트 B에 닿는다')
  })
}

describe('LoopbackDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<LoopbackDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 248')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('127.0.0.1로')
      const tallLoop = shownPaths()
      await select('다른 호스트로')
      const tallOther = shownPaths()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 156')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '다른 호스트로' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallOther)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(scenarioNotes()).toEqual(['to-host-b'])
      await select('127.0.0.1로')
      expect(shownPaths()).toEqual(tallLoop)
      expect(new Set([...Object.keys(tallPaths)])).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><LoopbackDiagram /><LoopbackDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '다른 호스트로' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<LoopbackDiagram />)
    const text = visualsByTopicId[topicId].diagrams.loopback
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(loopbackScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = loopbackScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 루프백 주소 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
