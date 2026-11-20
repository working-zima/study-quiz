import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { WdmWavelengthsDiagram, wdmWavelengthsScenarios } from './WdmWavelengthsDiagram'

const topicId = 'transmission-media'
const anchorConceptId = `${topicId}.wdm`
const labels: Record<string, string> = {
  'tx1': 'λ1',
  'tx2': 'λ2',
  'tx3': 'λ3',
  'tx4': 'λ4',
  'mux': '다중화기',
  'fiber1': '광섬유',
  'amp': '광 증폭기',
  'fiber2': '광섬유',
  'demux': '역다중화기',
  'rx1': 'λ1',
  'rx2': 'λ2',
  'rx3': 'λ3',
  'rx4': 'λ4',
}
const groupLabels: Record<string, string> = {
  'tx': '보내는 쪽',
  'rx': '받는 쪽',
}
// 보내는 쪽 박스에는 λ1~λ4를 보내는 쪽이, 받는 쪽 박스에는 λ1~λ4를 받는 쪽이 있고, 다중화기·광섬유·광 증폭기·역다중화기는 두 박스 밖에 있다.
const members: Record<string, string[]> = {
  'tx': ['tx1', 'tx2', 'tx3', 'tx4'],
  'rx': ['rx1', 'rx2', 'rx3', 'rx4'],
}
const noteLabels: Record<string, string> = {
  'combine-note': '빛 넷을 한 가닥에 함께 싣는다',
  'amplify-note': '넷을 빛인 채로 함께 키운다',
  'split-note': '파장마다 다시 나눈다',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
// 화살표는 모두 늘 보인다 — λ1~λ4에서 다중화기로, 광섬유·광 증폭기·광섬유를 차례로 지나 역다중화기로, 역다중화기에서 λ1~λ4로 가는 빛의 길이다.
const linkEnds: Record<string, [string, string]> = {
  'tx1-mux': ['tx1', 'mux'],
  'tx2-mux': ['tx2', 'mux'],
  'tx3-mux': ['tx3', 'mux'],
  'tx4-mux': ['tx4', 'mux'],
  'mux-fiber1': ['mux', 'fiber1'],
  'fiber1-amp': ['fiber1', 'amp'],
  'amp-fiber2': ['amp', 'fiber2'],
  'fiber2-demux': ['fiber2', 'demux'],
  'demux-rx1': ['demux', 'rx1'],
  'demux-rx2': ['demux', 'rx2'],
  'demux-rx3': ['demux', 'rx3'],
  'demux-rx4': ['demux', 'rx4'],
}
const pathEnds = linkEnds
const tallPaths: Record<string, string> = {
  'tx1-mux': 'M44 60 V76 H32 V108',
  'tx2-mux': 'M108 60 V84 H48 V108',
  'tx3-mux': 'M172 60 V92 H64 V108',
  'tx4-mux': 'M236 60 V100 H80 V108',
  'mux-fiber1': 'M56 140 V164',
  'fiber1-amp': 'M56 196 V220',
  'amp-fiber2': 'M56 252 V276',
  'fiber2-demux': 'M56 308 V332',
  'demux-rx1': 'M32 364 V396 H44 V412',
  'demux-rx2': 'M48 364 V388 H108 V412',
  'demux-rx3': 'M64 364 V380 H172 V412',
  'demux-rx4': 'M80 364 V372 H236 V412',
}
const widePaths: Record<string, string> = {
  'tx1-mux': 'M36 60 V76 H24 V112',
  'tx2-mux': 'M84 60 V84 H40 V112',
  'tx3-mux': 'M132 60 V92 H56 V112',
  'tx4-mux': 'M180 60 V100 H72 V112',
  'mux-fiber1': 'M80 128 H96',
  'fiber1-amp': 'M152 128 H168',
  'amp-fiber2': 'M240 128 H256',
  'fiber2-demux': 'M312 128 H328',
  'demux-rx1': 'M344 144 V152 H264 V180',
  'demux-rx2': 'M352 144 V160 H312 V180',
  'demux-rx3': 'M360 144 V180',
  'demux-rx4': 'M376 144 V160 H408 V180',
}

const question = '광섬유 한 가닥에 여러 신호를 어떻게 싣고 멀리 보낼까?'
const figureName = '보내는 쪽의 빛 λ1~λ4를 다중화기가 광섬유 한 가닥에 함께 싣고, 중간의 광 증폭기가 넷을 빛인 채로 한꺼번에 키우고, 받는 쪽의 역다중화기가 다시 파장마다 나누는 모습을 보이는 도식'
const svgName = '보내는 쪽 박스의 λ1~λ4를 다중화기에, 다중화기를 광섬유·광 증폭기·광섬유를 차례로 지나 역다중화기에, 역다중화기를 받는 쪽 박스의 λ1~λ4에 이은 그림'
const idleCaption = '보내는 쪽의 빛 λ1~λ4는 다중화기에서 광섬유 한 가닥으로 모이고, 중간의 광 증폭기를 지나 받는 쪽의 역다중화기에서 다시 λ1~λ4로 나뉜다. 버튼으로 차례마다 무슨 일이 일어나는지 볼 수 있다.'
const legend = '화살표는 빛이 지나가는 길이다. λ1~λ4는 파장이 서로 다른 빛에 붙인 이름표다.'
const expectedScenarios = [
  {
    id: 'combine', label: '한 가닥에 싣기',
    nodes: [...members.tx, 'mux', 'fiber1'],
    paths: [] as string[],
    notes: ['combine-note'],
    caption: '보내는 쪽 장치 넷이 저마다 데이터를 λ1~λ4의 빛에 실어 보내면, 다중화기가 파장이 서로 다른 네 빛을 합쳐 광섬유 한 가닥에 함께 싣는다. 파장 하나가 채널 하나라서 네 빛은 한 가닥 안에서도 저마다 따로 데이터를 나른다.',
  },
  {
    id: 'amplify', label: '빛인 채로 키우기',
    nodes: ['fiber1', 'amp', 'fiber2'],
    paths: [] as string[],
    notes: ['amplify-note'],
    caption: '광섬유를 지나며 약해진 빛을 광 증폭기가 전기 신호로 바꾸지 않고 빛인 채로 키운다. 한 가닥에 실린 λ1~λ4를 한꺼번에 키우므로, 광 증폭기로 들어가는 길도 나오는 길도 하나다.',
  },
  {
    id: 'split', label: '다시 나누기',
    nodes: ['fiber2', 'demux', ...members.rx],
    paths: [] as string[],
    notes: ['split-note'],
    caption: '받는 쪽의 역다중화기가 광섬유로 함께 온 빛을 파장마다 갈라, λ1~λ4를 받는 장치 넷에 저마다 하나씩 보낸다.',
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
const shownLinks = () => Array.from(svg().querySelectorAll('[data-link]'), (link) => link.getAttribute('data-link')!)
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note')!)
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)!
const opacity = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')
const sharpNodes = () => nodeIds.filter((id) => opacity(id) === '1')

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function contains(outer: SvgBox, inner: SvgBox) {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height
}

// 곁말·그룹 라벨(9)의 가로 범위. 반각 문자가 섞일 수 있으므로 어림값의 1.15배로 잡는다.
function textBox(text: Element, id: string): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9) * 1.15
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id, x: left, y: y - 9, width, height: 9 }
}

const groupLabelBox = (id: string) => textBox(svg().querySelector(`[data-group-label="${id}"]`)!, `${id}-label`)

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

// 두 선분이 서로 가로지르거나(한쪽은 가로, 다른 쪽은 세로) 같은 직선 위에서 길이가 있는 구간을 함께 쓰는가. 끝점끼리 닿는 것은 뺀다.
function meets(a: Segment, b: Segment) {
  const shared = (a1: number, a2: number, b1: number, b2: number) => Math.min(Math.max(a1, a2), Math.max(b1, b2)) - Math.max(Math.min(a1, a2), Math.min(b1, b2)) > 0
  const between = (value: number, end1: number, end2: number) => value > Math.min(end1, end2) && value < Math.max(end1, end2)
  const aVertical = a.x1 === a.x2
  const bVertical = b.x1 === b.x2
  if (aVertical && bVertical) return a.x1 === b.x1 && shared(a.y1, a.y2, b.y1, b.y2)
  if (!aVertical && !bVertical) return a.y1 === b.y1 && shared(a.x1, a.x2, b.x1, b.x2)
  const [vertical, horizontal] = aVertical ? [a, b] : [b, a]
  return between(vertical.x1, horizontal.x1, horizontal.x2) && between(horizontal.y1, vertical.y1, vertical.y2)
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

// 보이는 화살표가 어느 노드의 변에서 끝나는지 그림에서 읽는다.
function endpointNode(point: { x: number, y: number }) {
  return nodeIds.find((id) => onEdge(point, nodeBox(id)))
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 244] : [0, 0, 280, 472]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<WdmWavelengthsDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고, 빛이 지나는 길이 모두 보이며 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<WdmWavelengthsDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownLinks()).toEqual(Object.keys(linkEnds))
    for (const link of svg().querySelectorAll('[data-link]')) {
      expect(link).toHaveAttribute('d', paths[link.getAttribute('data-link')!])
      expect(link).toHaveClass('stroke-muted')
      expect(link).toHaveAttribute('stroke-width', '1.5')
      expect(link).toHaveAttribute('marker-end', `url(#${svg().querySelector('marker')!.id})`)
    }
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 차례의 노드와 곁말만 선명하고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<WdmWavelengthsDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownLinks()).toEqual(Object.keys(linkEnds))
    expect(shownPaths()).toEqual(scenario.paths)
    for (const path of svg().querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('d', paths[path.getAttribute('data-path')!])
      expect(path).toHaveClass('stroke-title')
      expect(path).toHaveAttribute('stroke-width', '2')
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
    render(<WdmWavelengthsDiagram />)
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
    for (const id of groupIds) {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
    }
    for (const a of groupIds) for (const b of groupIds.filter((other) => other !== a)) expect(overlaps(groupBox(a), groupBox(b)), `${a} ↔ ${b}`).toBe(false)
    // 곁말은 두 박스 밖의 빈자리에 들어가고, 노드와는 위아래 4 이상 띄우며 선에 닿지 않는다.
    const noteBoxes: SvgBox[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of scenario.notes) noteBoxes.push(textBox(note(id), id))
    }
    expect([...noteBoxes.map(({ id }) => id)].sort()).toEqual([...noteIds].sort())
    expect(boxesOutsideViewBox(noteBoxes, viewBox)).toEqual([])
    for (const box of noteBoxes) {
      for (const node of nodeIds) {
        const nodeArea = nodeBox(node)
        expect(overlaps(box, { ...nodeArea, y: nodeArea.y - 4, height: nodeArea.height + 8 }), `${box.id} ↔ ${node}`).toBe(false)
      }
      for (const group of groupIds) expect(overlaps(box, groupBox(group)), `${box.id} ↔ ${group}`).toBe(false)
      for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 앞 노드의 변에서 시작해 뒤 노드의 변에서 끝나고, 노드 안이나 그룹 라벨을 지나지 않으며 서로 만나지 않는다', () => {
    render(<WdmWavelengthsDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(pathEnds)))
    for (const [id, d] of Object.entries(paths)) {
      const { start, end } = lineEnds(d)
      expect(onEdge(start, nodeBox(pathEnds[id][0])), `${id} 시작`).toBe(true)
      expect(onEdge(end, nodeBox(pathEnds[id][1])), `${id} 끝`).toBe(true)
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
    }
    const ids = Object.keys(paths)
    for (const a of ids) for (const b of ids.filter((other) => other !== a)) {
      for (const sa of segments(paths[a])) for (const sb of segments(paths[b])) expect(meets(sa, sb), `${a} ↔ ${b}`).toBe(false)
    }
  })

  // 요점: λ1~λ4의 빛은 다중화기에서 한 길로 모인 뒤 광섬유·광 증폭기·광섬유를 한 길로 지나고, 역다중화기에서 다시 넷으로 갈린다.
  // 빛인 채로 키우기에서 광 증폭기로 들어가는 길과 나오는 길은 하나씩이다(파장마다 따로 가지 않는다). 세 차례의 선명한 노드는 서로 다르다.
  it('네 빛이 광섬유 한 가닥에 모여 광 증폭기를 함께 지나고, 받는 쪽에서 다시 넷으로 갈린다', async () => {
    render(<WdmWavelengthsDiagram />)
    const ends = (id: string) => lineEnds(paths[id])
    const shown = () => shownLinks().map((id) => ({ id, from: endpointNode(ends(id).start)!, to: endpointNode(ends(id).end)! }))
    for (const tx of members.tx) expect(shown().filter(({ from }) => from === tx).map(({ to }) => to), tx).toEqual(['mux'])
    expect(shown().filter(({ from }) => from === 'mux').map(({ to }) => to)).toEqual(['fiber1'])
    expect(shown().filter(({ from }) => from === 'demux').map(({ to }) => to)).toEqual(members.rx)
    for (const index of [0, 1, 2, 3]) {
      const route = [members.tx[index]]
      while (!members.rx.includes(route[route.length - 1])) {
        const from = route[route.length - 1]
        const next = shown().filter((link) => link.from === from)
        route.push(next.length === 1 ? next[0].to : members.rx[index])
      }
      expect(route, members.tx[index]).toEqual([members.tx[index], 'mux', 'fiber1', 'amp', 'fiber2', 'demux', members.rx[index]])
      expect(label(route[0]), route[0]).toBe(label(route[route.length - 1]))
    }

    const sharpSets: Record<string, string[]> = {}
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      sharpSets[scenario.id] = sharpNodes()
      if (scenario.id === 'amplify') {
        expect(shown().filter(({ to }) => to === 'amp').map(({ from }) => from)).toEqual(['fiber1'])
        expect(shown().filter(({ from }) => from === 'amp').map(({ to }) => to)).toEqual(['fiber2'])
        expect(sharpNodes().filter((id) => [...members.tx, ...members.rx].includes(id))).toEqual([])
      }
    }
    const ids = Object.keys(sharpSets)
    for (const a of ids) for (const b of ids.filter((other) => other !== a)) expect(sharpSets[a], `${a} ↔ ${b}`).not.toEqual(sharpSets[b])

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const phrase of ['λ1·λ2·λ3·λ4', 'λ1~λ4', '다중화기', '역다중화기', '광 증폭기', '광섬유 한 가닥', '보내는 쪽', '받는 쪽', '빛인 채로']) {
      expect(body, phrase).toContain(phrase)
    }
  })
}

describe('WdmWavelengthsDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<WdmWavelengthsDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 472')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('빛인 채로 키우기')
      const tallNotes = shownNotes()
      const tallSharp = sharpNodes()
      const tallShown = shownPaths()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 244')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '빛인 채로 키우기' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownNotes()).toEqual(tallNotes)
      expect(sharpNodes()).toEqual(tallSharp)
      expect(shownPaths()).toEqual(tallShown)
      for (const link of svg().querySelectorAll('[data-link]')) expect(link).toHaveAttribute('d', widePaths[link.getAttribute('data-link')!])
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', () => {
    render(<><WdmWavelengthsDiagram /><WdmWavelengthsDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      for (const path of figure.querySelectorAll('[data-link]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<WdmWavelengthsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['wdm-wavelengths']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(wdmWavelengthsScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = wdmWavelengthsScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 파장 분할 다중화 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
