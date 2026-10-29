import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { AddressAssignmentDiagram, addressAssignmentScenarios } from './AddressAssignmentDiagram'

const topicId = 'ip-address-types'
const anchorConceptId = `${topicId}.static-dynamic-address`
const labels: Record<string, string> = {
  server: 'DHCP 서버',
  printer: '네트워크 프린터',
  pc1: 'PC 1',
  pc2: 'PC 2',
}
const groupLabels: Record<string, string> = { private: '사설 네트워크' }
const noteLabels: Record<string, string> = {
  'server-address': '192.168.0.1',
  'printer-address': '192.168.0.2',
  'printer-static': '관리자가 직접 넣은 주소',
  'printer-kept': '바꾸지 않는 한 그대로',
  'pc1-address': '받은 주소 192.168.0.10',
  'pc2-address': '받은 주소 192.168.0.11',
}
// 장치의 주소 곁말은 그 장치의 흐림을 따른다. 나머지 곁말은 자기 시나리오에서만 보인다.
const noteOwner: Record<string, string> = {
  'server-address': 'server',
  'printer-address': 'printer',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)

const tallPaths: Record<string, string> = {
  'to-pc1': 'M40 60 V136',
  'to-pc2': 'M112 60 V112 H176 V136',
}
const widePaths: Record<string, string> = {
  'to-pc1': 'M124 44 H168',
  'to-pc2': 'M124 52 H144 V124 H168',
}
// 경로마다 출발 노드와 도착 노드.
const ends: Record<string, [string, string]> = {
  'to-pc1': ['server', 'pc1'],
  'to-pc2': ['server', 'pc2'],
}

const question = '주소를 직접 정할 때와 자동으로 받을 때는 무엇이 다를까?'
const figureName = '관리자가 직접 넣은 정적 IP 주소와 DHCP 서버에게서 받는 동적 IP 주소를 견주는 도식'
const svgName = '사설 네트워크의 DHCP 서버(192.168.0.1), 관리자가 주소 192.168.0.2를 넣어 둔 네트워크 프린터, DHCP 서버에게서 주소를 받는 PC 1과 PC 2'
const idleCaption = '사설 네트워크에 DHCP 서버, 네트워크 프린터, PC 1과 PC 2를 놓았다. 버튼을 고르면 관리자가 주소를 직접 넣어 둔 프린터와, DHCP 서버에게서 주소를 받는 두 PC를 따로 볼 수 있다.'
const legend = '얇은 선 박스가 사설 네트워크이고, 화살표는 DHCP 서버가 주소를 나눠 주는 방향이다. 장치 아래의 곁말은 그 장치가 쓰는 주소와 그 주소를 얻은 방법이다.'
const expectedScenarios = [
  {
    id: 'static', label: '정적 할당',
    nodes: ['printer'], paths: [] as string[],
    notes: ['printer-static', 'printer-kept'],
    caption: '관리자가 네트워크 프린터의 설정에 사설 주소 192.168.0.2를 직접 넣어 두었다. DHCP 서버에게서 받는 주소가 아니고, 관리자가 바꾸지 않는 한 그대로라 다른 장치들이 늘 같은 주소로 이 프린터를 찾아온다.',
  },
  {
    id: 'dynamic', label: '동적 할당',
    nodes: ['server', 'pc1', 'pc2'], paths: ['to-pc1', 'to-pc2'],
    notes: ['pc1-address', 'pc2-address'],
    caption: 'PC 1과 PC 2는 네트워크에 이어질 때 DHCP 서버에게서 192.168.0.10, 192.168.0.11 같은 주소를 받는다. 더는 쓰지 않는 주소는 다른 장치에게 다시 주어지므로, 다음에 이어질 때는 다른 주소를 받을 수 있다.',
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
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const scenarioNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note')!).filter((id) => !(id in noteOwner))
const noteText = (id: string) => svg().querySelector(`[data-note="${id}"]`)!.textContent!

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 172] : [0, 0, 280, 204]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<AddressAssignmentDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 장치의 주소가 모두 선명하고 화살표와 시나리오 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<AddressAssignmentDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node], [data-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note'))).toEqual(Object.keys(noteOwner))
    for (const id of Object.keys(noteOwner)) expect(noteText(id)).toBe(noteLabels[id])
    expect(scenarioNotes()).toEqual([])
    for (const id of groupIds) expect(svg().querySelector(`[data-group-label="${id}"]`)!.textContent).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<AddressAssignmentDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    for (const [id, owner] of Object.entries(noteOwner)) {
      expect(svg().querySelector(`[data-note="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(owner) ? '1' : '0.25')
    }
    expect(scenarioNotes()).toEqual(scenario.notes)
    for (const id of scenario.notes) {
      expect(noteText(id)).toBe(noteLabels[id])
      expect(svg().querySelector(`[data-note="${id}"]`)!.closest('[opacity]')).toBeNull()
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
    render(<AddressAssignmentDiagram />)
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
      for (const group of groupIds) expect(contains(groupBox(group), nodeBox(id)), `${id} ⊂ ${group}`).toBe(true)
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
      const box = textBox(note, note.getAttribute('data-note')!)
      for (const group of groupIds) expect(contains(groupBox(group), box), `${box.id} ⊂ ${group}`).toBe(true)
      return box
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
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나거나 다른 화살표와 만나지 않는다', async () => {
    render(<AddressAssignmentDiagram />)
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

  // 요점: 정적 할당에서는 화살표가 하나도 없고(프린터는 DHCP 서버에게서 주소를 받지 않는다) 선명한 것은 프린터뿐이며,
  // 그 주소는 늘 보이는 192.168.0.2다. 동적 할당의 화살표는 모두 DHCP 서버에서 시작해 PC 1·PC 2에서 끝나고, 프린터에 닿는 화살표는 없다.
  // 두 PC가 받은 주소는 서로 다르고 DHCP 서버·프린터의 주소와도 다르다. 이 사실과 예시 주소는 개념 본문에 있다.
  it('정적 할당은 화살표 없이 프린터만 선명하고, 동적 할당의 화살표는 모두 DHCP 서버에서 두 PC로 간다', async () => {
    render(<AddressAssignmentDiagram />)

    await select('정적 할당')
    expect(shownPaths()).toEqual([])
    expect(Array.from(svg().querySelectorAll('[data-node]')).filter((node) => node.getAttribute('opacity') === '1').map((node) => node.getAttribute('data-node'))).toEqual(['printer'])
    expect(noteText('printer-address')).toBe('192.168.0.2')

    await select('동적 할당')
    const hops = shownPaths().map((id) => [nodeAt(lineEnds(paths[id]).start), nodeAt(lineEnds(paths[id]).end)])
    expect(hops).toEqual([['server', 'pc1'], ['server', 'pc2']])
    for (const [, to] of hops) expect(to).not.toBe('printer')
    const received = ['pc1-address', 'pc2-address'].map((id) => noteText(id).replace('받은 주소 ', ''))
    expect(new Set([...received, noteText('server-address'), noteText('printer-address')]).size).toBe(4)
    for (const address of received) expect(address).toMatch(/^192\.168\.0\.\d+$/u)

    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const body = concept.paragraphs.join('\n')
    expect(body).toContain('네트워크 프린터에 관리자가 사설 주소 `192.168.0.2`를 넣어 두면')
    expect(body).toContain('정적 주소는 관리자가 바꾸지 않는 한 그대로다')
    expect(body).toContain('DHCP 서버(사설 주소 `192.168.0.1`)가 PC 1에게 `192.168.0.10`을, PC 2에게 `192.168.0.11`을 줄 수 있고')
    expect(body).toContain('장치가 더는 쓰지 않는 주소는 다른 장치에게 다시 주어지므로, 같은 장치라도 다음에 받을 때는 다른 주소일 수 있다')
    expect(body).toContain('다른 장치들은 그 장치를 주소로 찾아오는데')
  })
}

describe('AddressAssignmentDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<AddressAssignmentDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 204')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('정적 할당')
      const tallStatic = shownPaths()
      await select('동적 할당')
      const tallDynamic = shownPaths()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 172')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '동적 할당' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallDynamic)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(scenarioNotes()).toEqual(['pc1-address', 'pc2-address'])
      await select('정적 할당')
      expect(shownPaths()).toEqual(tallStatic)
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><AddressAssignmentDiagram /><AddressAssignmentDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '동적 할당' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<AddressAssignmentDiagram />)
    const text = visualsByTopicId[topicId].diagrams['address-assignment']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(addressAssignmentScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = addressAssignmentScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 정적·동적 IP 주소 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
