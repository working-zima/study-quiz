import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { SpanningTreeDiagram, spanningTreeScenarios } from './SpanningTreeDiagram'

const topicId = 'hub-switch-vlan'
const anchorConceptId = `${topicId}.stp`
const labels = {
  'host-a': '호스트 A',
  'switch-1': '스위치 1',
  'switch-2': '스위치 2',
  'switch-3': '스위치 3',
}
const noteLabels = {
  'loop-note': '끝없이 돎',
  blocked: '막음',
  broken: '끊김',
  reopened: '전달 상태로 바꿈',
}
type NoteId = keyof typeof noteLabels

const nodeIds = Object.keys(labels)
const switchIds = ['switch-1', 'switch-2', 'switch-3']
const ringIds = ['link-12', 'link-23', 'link-31']
const linkIds = ['cable-a', ...ringIds]

const tallLinks: Record<string, string> = {
  'cable-a': 'M48 40 V72',
  'link-12': 'M86 88 H194',
  'link-23': 'M232 104 V184 H178',
  'link-31': 'M102 184 H48 V104',
}
const wideLinks: Record<string, string> = {
  'cable-a': 'M102 48 H150',
  'link-12': 'M238 48 H338',
  'link-23': 'M382 64 V128 H332',
  'link-31': 'M244 128 H194 V64',
}
const tallArrows: Record<string, string> = {
  'from-a': 'M48 40 V72',
  's1-s2': 'M86 88 H194',
  's2-s3': 'M232 104 V184 H178',
  's3-s1': 'M102 184 H48 V104',
  's1-s3': 'M48 104 V184 H102',
  's3-s2': 'M178 184 H232 V104',
}
const wideArrows: Record<string, string> = {
  'from-a': 'M102 48 H150',
  's1-s2': 'M238 48 H338',
  's2-s3': 'M382 64 V128 H332',
  's3-s1': 'M244 128 H194 V64',
  's1-s3': 'M194 64 V128 H244',
  's3-s2': 'M332 128 H382 V64',
}
const ends: Record<string, [string, string]> = {
  'cable-a': ['host-a', 'switch-1'],
  'link-12': ['switch-1', 'switch-2'],
  'link-23': ['switch-2', 'switch-3'],
  'link-31': ['switch-3', 'switch-1'],
  'from-a': ['host-a', 'switch-1'],
  's1-s2': ['switch-1', 'switch-2'],
  's2-s3': ['switch-2', 'switch-3'],
  's3-s1': ['switch-3', 'switch-1'],
  's1-s3': ['switch-1', 'switch-3'],
  's3-s2': ['switch-3', 'switch-2'],
}
// 곁말마다 그 곁말이 짚는 링크.
const linkOfNote: Record<NoteId, string | null> = {
  'loop-note': null,
  blocked: 'link-23',
  broken: 'link-12',
  reopened: 'link-23',
}

type Note = { x: number, y: number, anchor: 'start' | 'middle' }
const tallNotes: Record<NoteId, Note> = {
  'loop-note': { x: 140, y: 136, anchor: 'middle' },
  blocked: { x: 184, y: 200, anchor: 'start' },
  broken: { x: 140, y: 80, anchor: 'middle' },
  reopened: { x: 184, y: 200, anchor: 'start' },
}
const wideNotes: Record<NoteId, Note> = {
  'loop-note': { x: 288, y: 88, anchor: 'middle' },
  blocked: { x: 338, y: 144, anchor: 'start' },
  broken: { x: 288, y: 40, anchor: 'middle' },
  reopened: { x: 338, y: 144, anchor: 'start' },
}

const question = '스위치를 고리로 이으면 무슨 일이 생길까?'
const idleCaption = '호스트 A가 이어진 스위치 1과 스위치 2·3을, 링크 하나가 끊겨도 통신이 이어지도록 서로 이어 고리를 만들었다. 버튼을 고르면 STP가 없을 때와 STP를 쓸 때, 그리고 쓰던 링크가 끊겼을 때 브로드캐스트 프레임이 가는 길을 볼 수 있다.'
const legend = '가는 선은 케이블과 스위치 사이의 링크이고, 화살표는 브로드캐스트 프레임이 가는 길이다. 흐린 선은 막히거나 끊겨 프레임이 지나가지 않는 링크다.'
const allIds = [...nodeIds, ...linkIds]
const expectedScenarios = [
  {
    id: 'loop', label: 'STP가 없으면', off: null as string | null,
    nodes: allIds,
    paths: ['from-a', 's1-s2', 's2-s3', 's3-s1'],
    notes: ['loop-note'] as NoteId[],
    caption: '호스트 A가 보낸 브로드캐스트 프레임을 스위치 1이 스위치 2와 3으로 플러딩하고, 받은 스위치도 저마다 다시 플러딩해 프레임이 스위치 1로 돌아온다. 돌아온 프레임도 또 플러딩되어 고리를 끝없이 돈다. 화살표는 한 방향만 그렸지만 반대 방향으로 간 프레임도 같다.',
  },
  {
    id: 'stp', label: 'STP를 쓰면', off: 'link-23' as string | null,
    nodes: allIds.filter((id) => id !== 'link-23'),
    paths: ['from-a', 's1-s2', 's1-s3'],
    notes: ['blocked'] as NoteId[],
    caption: 'STP를 쓰는 스위치들은 서로 정보를 주고받아 막을 링크를 정한다. 이 그림은 스위치 2와 3 사이의 링크를 막은 경우다. 이제 스위치 1이 플러딩한 프레임은 스위치 2와 3에 한 번씩 닿고, 남은 두 링크에는 한 바퀴 도는 길이 없어 더는 돌지 않는다.',
  },
  {
    id: 'failover', label: '링크가 끊기면', off: 'link-12' as string | null,
    nodes: allIds.filter((id) => id !== 'link-12'),
    paths: ['from-a', 's1-s3', 's3-s2'],
    notes: ['broken', 'reopened'] as NoteId[],
    caption: '쓰던 스위치 1과 2 사이의 링크가 끊기면, 스위치들은 다시 정보를 주고받아 막아 두었던 포트를 전달 상태로 바꾼다. 이제 프레임은 스위치 1에서 3을 거쳐 2로 가고, 세 스위치는 고리 없는 길로 다시 이어진다.',
  },
]

function diagram() {
  return screen.getByRole('img', { name: '호스트 A가 이어진 스위치 1과 스위치 2·3이 링크 셋으로 서로 이어져 고리를 이룬 모습' })
}

async function selectScenario(label: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) })
}

function readBox(rect: Element): SvgBox {
  return {
    id: rect.parentElement?.getAttribute('data-node') ?? '',
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

function nodeBox(id: string) {
  return readBox(diagram().querySelector(`[data-node="${id}"] rect`)!)
}

function shownIds(selector: string, attribute: string) {
  return Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)!)
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

// 글자가 차지하는 상자. 높이는 글자 크기 9를 기준선 위로 잡는다.
function textBox(text: Element): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9)
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id: text.getAttribute('data-note')!, x: left, y: y - 9, width, height: 9 }
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

// 방향을 지운 선분 묶음. 화살표가 어느 링크 위에 겹쳐 그려졌는지 비교할 때 쓴다.
function trace(d: string) {
  return segments(d).map(({ x1, y1, x2, y2 }) => [`${x1},${y1}`, `${x2},${y2}`].sort().join('-')).sort().join('|')
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

function onEdge(x: number, y: number, box: SvgBox) {
  const insideX = x >= box.x && x <= box.x + box.width
  const insideY = y >= box.y && y <= box.y + box.height
  return ((x === box.x || x === box.x + box.width) && insideY) || ((y === box.y || y === box.y + box.height) && insideX)
}

function lineEnds(element: Element) {
  const list = segments(element.getAttribute('d')!)
  return { start: { x: list[0].x1, y: list[0].y1 }, end: { x: list[list.length - 1].x2, y: list[list.length - 1].y2 } }
}

function nodeAt(point: { x: number, y: number }) {
  return nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))
}

// 선의 양 끝이 지정한 두 노드의 변에 닿고, 어떤 선분도 노드 안을 지나지 않는다.
function expectLine(line: Element, id: string) {
  for (const segment of segments(line.getAttribute('d')!)) {
    for (const node of nodeIds.map(nodeBox)) expect(crossesInside(segment, node), `${id} ↔ ${node.id}`).toBe(false)
  }
  const { start, end } = lineEnds(line)
  expect(nodeAt(start), `${id} 시작`).toBe(ends[id][0])
  expect(nodeAt(end), `${id} 끝`).toBe(ends[id][1])
}

// 보이는 곁말이 지정한 id·글·자리이고, viewBox 안에서 노드·선·다른 곁말과 겹치거나 닿지 않는다.
function expectNotes(ids: NoteId[], places: Record<NoteId, Note>, width: number, height: number) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note'))).toEqual(ids)
  const boxes = shown.map(textBox)
  for (const note of shown) {
    const id = note.getAttribute('data-note')! as NoteId
    const box = textBox(note)
    expect(note.textContent).toBe(noteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', places[id].anchor)
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note.closest('[opacity]')).toBeNull()
    expect(box.x, id).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, id).toBeLessThanOrEqual(width)
    expect(box.y, id).toBeGreaterThanOrEqual(0)
    expect(box.y + box.height, id).toBeLessThanOrEqual(height)
    for (const node of nodeIds.map(nodeBox)) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const line of diagram().querySelectorAll('[data-link], [data-path]')) {
      for (const segment of segments(line.getAttribute('d')!)) expect(touches(segment, box), `${id} ↔ 선`).toBe(false)
    }
    for (const other of boxes.filter((other) => other.id !== id)) expect(overlaps(box, other), `${id} ↔ ${other.id}`).toBe(false)
  }
}

async function expectScenario(
  scenario: typeof expectedScenarios[number],
  arrows: Record<string, string>,
  places: Record<NoteId, Note>,
  width: number,
  height: number,
  container: HTMLElement,
) {
  await selectScenario(scenario.label)

  expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
  for (const element of diagram().querySelectorAll('[data-node], [data-link]')) {
    const id = element.getAttribute('data-node') ?? element.getAttribute('data-link')!
    expect(element, id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }

  const shownPaths = Array.from(diagram().querySelectorAll('[data-path]'))
  expect(shownPaths.map((path) => path.getAttribute('data-path'))).toEqual(scenario.paths)
  for (const path of shownPaths) {
    expect(path).toHaveAttribute('d', arrows[path.getAttribute('data-path')!])
    expect(path).toHaveAttribute('stroke-width', '2')
    expect(path).toHaveAttribute('marker-end', `url(#${diagram().querySelector('marker')!.id})`)
    expect(path).toHaveClass('stroke-title')
    expect(path.closest('[opacity]')).toBeNull()
  }
  expectNotes(scenario.notes, places, width, height)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
  for (const [id, text] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(text)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(node.querySelector('rect')).toHaveClass('stroke-disabled')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(text, 10) + 12, `${id} ${text}`).toBeLessThanOrEqual(box.width)
  }
  for (let i = 0; i < nodeIds.length; i += 1) {
    for (let j = i + 1; j < nodeIds.length; j += 1) {
      expect(overlaps(nodeBox(nodeIds[i]), nodeBox(nodeIds[j])), `${nodeIds[i]} ↔ ${nodeIds[j]}`).toBe(false)
    }
  }
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

function expectLinks(links: Record<string, string>) {
  const shown = Array.from(diagram().querySelectorAll('[data-link]'))
  expect(shown.map((link) => link.getAttribute('data-link'))).toEqual(linkIds)
  for (const link of shown) {
    const id = link.getAttribute('data-link')!
    expect(link).toHaveAttribute('d', links[id])
    expect(link).toHaveClass('fill-none', 'stroke-muted')
    expect(link).toHaveAttribute('stroke-width', '1.5')
    expect(link).not.toHaveAttribute('marker-end')
    expectLine(link, id)
  }
}

async function expectArrowEnds() {
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    for (const path of diagram().querySelectorAll('[data-path]')) expectLine(path, path.getAttribute('data-path')!)
  }
}

// 보이는 화살표마다 [출발 노드, 도착 노드, 겹쳐 그린 링크].
function hops() {
  const linkTraces = Array.from(diagram().querySelectorAll('[data-link]'), (link) => [link.getAttribute('data-link')!, trace(link.getAttribute('d')!)])
  return Array.from(diagram().querySelectorAll('[data-path]'), (path) => {
    const { start, end } = lineEnds(path)
    const link = linkTraces.find(([, linkTrace]) => linkTrace === trace(path.getAttribute('d')!))
    return { from: nodeAt(start)!, to: nodeAt(end)!, link: link?.[0] ?? null }
  })
}

// 방향을 지운 스위치 사이의 화살표가 세 스위치를 모두 잇는가. 변이 둘인데 모두 이어지면 고리가 없다.
function connectsAll(edges: { from: string, to: string }[]) {
  const reached = new Set(['switch-1'])
  for (let round = 0; round < switchIds.length; round += 1) {
    for (const { from, to } of edges) {
      if (reached.has(from)) reached.add(to)
      if (reached.has(to)) reached.add(from)
    }
  }
  return switchIds.every((id) => reached.has(id))
}

// 요점: STP가 없으면 화살표가 링크 셋을 모두 지나 스위치 1로 되돌아오는 고리를 이룬다.
// STP를 쓰면 막힌 링크(흐린 선) 위에는 화살표가 없고, 남은 화살표 둘이 고리 없이 세 스위치를 잇는다.
// 링크가 끊기면 끊긴 링크 위의 화살표가 사라지고, 막혀 있던 링크 위에 화살표가 생겨 다시 세 스위치를 고리 없이 잇는다.
// 막힘·끊김·전달 상태로 바꿈 곁말은 자기가 짚는 링크 바로 곁에 있다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')

  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    const all = hops()
    expect(all[0], scenario.label).toEqual({ from: 'host-a', to: 'switch-1', link: 'cable-a' })
    const ring = all.filter(({ from }) => from !== 'host-a')
    for (const hop of ring) {
      expect(hop.link, `${scenario.label} ${hop.from}→${hop.to}`).not.toBeNull()
      expect(ringIds).toContain(hop.link)
      expect(diagram().querySelector(`[data-link="${hop.link}"]`), `${scenario.label} ${hop.link}`).toHaveAttribute('opacity', '1')
    }
    if (scenario.off) {
      expect(diagram().querySelector(`[data-link="${scenario.off}"]`)).toHaveAttribute('opacity', '0.25')
      expect(ring.map(({ link }) => link), scenario.label).not.toContain(scenario.off)
    }

    if (scenario.id === 'loop') {
      expect(ring.map(({ link }) => link).sort()).toEqual([...ringIds].sort())
      let at = 'switch-1'
      const visited: string[] = []
      for (let step = 0; step < ring.length; step += 1) {
        const next = ring.find(({ from }) => from === at)!
        visited.push(next.to)
        at = next.to
      }
      expect(visited).toEqual(['switch-2', 'switch-3', 'switch-1'])
      expect(all.filter(({ to }) => to === 'switch-1')).toHaveLength(2)
    } else {
      expect(ring).toHaveLength(2)
      expect(connectsAll(ring), scenario.label).toBe(true)
      expect(new Set(ring.map(({ link }) => link)).size).toBe(2)
      for (const id of switchIds) expect(all.filter(({ to }) => to === id), `${scenario.label} ${id}`).toHaveLength(1)
      expect(ring.some(({ from }) => from === 'switch-1'), scenario.label).toBe(true)
    }

    for (const note of diagram().querySelectorAll('[data-note]')) {
      const id = note.getAttribute('data-note')! as NoteId
      const box = textBox(note)
      const link = linkOfNote[id]
      if (link === null) {
        const left = segments(diagram().querySelector('[data-link="link-31"]')!.getAttribute('d')!).find(({ x1, x2 }) => x1 === x2)!.x1
        const right = segments(diagram().querySelector('[data-link="link-23"]')!.getAttribute('d')!).find(({ x1, x2 }) => x1 === x2)!.x1
        const top = segments(diagram().querySelector('[data-link="link-12"]')!.getAttribute('d')!)[0].y1
        expect(box.x, id).toBeGreaterThan(left)
        expect(box.x + box.width, id).toBeLessThan(right)
        expect(box.y, id).toBeGreaterThan(top)
        expect(box.y + box.height, id).toBeLessThan(nodeBox('switch-3').y)
        continue
      }
      const near = segments(diagram().querySelector(`[data-link="${link}"]`)!.getAttribute('d')!).filter(({ y1, y2 }) => y1 === y2)
      expect(near.some((segment) => {
        const from = Math.min(segment.x1, segment.x2)
        const to = Math.max(segment.x1, segment.x2)
        const gap = Math.min(Math.abs(box.y - segment.y1), Math.abs(box.y + box.height - segment.y1))
        return box.x < to && box.x + box.width > from && gap <= 16
      }), id).toBe(true)
    }
  }

  expect(body).toContain('고리를 끝없이 돈다')
  expect(body).toContain('그 링크에 이어진 포트를 막아')
  expect(body).toContain('스위치 2와 3에 한 번씩 닿고 더는 돌지 않는다')
  expect(body).toContain('막아 두었던 포트를 전달 상태로 바꿔')
  expect(body).toContain('스위치 1에서 3을 거쳐 2로 가는 길')
  expect(body).toContain('차단(blocking) 상태')
}

async function expectUniqueMarkers() {
  render(<><SpanningTreeDiagram /><SpanningTreeDiagram /></>)
  const figures = screen.getAllByRole('figure', { name: '스패닝 트리 프로토콜이 고리를 막는 도식' })
  for (const figure of figures) {
    await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'STP가 없으면' })) })
    expect(figure.querySelectorAll('[data-path]')).toHaveLength(4)
    for (const path of figure.querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
  }
  expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
}

describe('SpanningTreeDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<SpanningTreeDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 호스트·스위치·케이블·링크가 모두 선명하고 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<SpanningTreeDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note], [data-group]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·링크·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<SpanningTreeDiagram />)
    await expectScenario(scenario, tallArrows, tallNotes, 280, 216, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 처음으로 돌아온다', async () => {
    const { container } = render(<SpanningTreeDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
      expect(shownIds('[data-note]', 'data-note')).toEqual(scenario.notes)
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node], [data-link]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드가 280×216 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<SpanningTreeDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 216')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 216])
  })

  it('케이블과 링크는 늘 보이고 회색이며 양 끝이 두 노드의 변에 닿는다', () => {
    render(<SpanningTreeDiagram />)
    expectLinks(tallLinks)
  })

  it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
    render(<SpanningTreeDiagram />)
    await expectArrowEnds()
  })

  it('STP가 없으면 화살표가 고리를 돌고, STP를 쓰거나 링크가 끊기면 흐린 링크를 피해 고리 없이 세 스위치를 잇는다', async () => {
    render(<SpanningTreeDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
    await expectUniqueMarkers()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<SpanningTreeDiagram />)
    const text = visualsByTopicId[topicId].diagrams['spanning-tree']
    const ids = spanningTreeScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toBeUndefined()
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([anchorConceptId])
    expect(text.label).toBe('스패닝 트리 프로토콜이 고리를 막는 도식')
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = spanningTreeScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) {
      expect(conceptIds).toContain(source)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 STP 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: '스패닝 트리 프로토콜이 고리를 막는 도식' })

    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(within(figure).queryByRole('heading')).toBeNull()
  })

  describe('가로형 (768px 이상)', () => {
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

      return {
        change(nextMatches: boolean) {
          mediaQuery.matches = nextMatches
          const event = Object.assign(new Event('change'), {
            matches: nextMatches,
            media: mediaQuery.media,
          })
          listeners.forEach((listener) => listener(event))
        },
      }
    }

    async function collectIds(selector: string, attribute: string) {
      const found = new Set<string>()
      for (const { label } of expectedScenarios) {
        await selectScenario(label)
        for (const id of shownIds(selector, attribute)) found.add(id)
      }
      return [...found].sort()
    }

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×160 viewBox를 w-full 래퍼 하나로 그리고 화살표 마커를 유지한다', () => {
      render(<SpanningTreeDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 160')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(diagram().querySelector('marker')).not.toBeNull()
    })

    it('노드·링크 id 집합과 화살표 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<SpanningTreeDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 216')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallLinkIds = shownIds('[data-link]', 'data-link').sort()
      const tallPathIds = await collectIds('[data-path]', 'data-path')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 160')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinkIds)
      expect(tallPathIds).toEqual(Object.keys(tallArrows).sort())
      expect(await collectIds('[data-path]', 'data-path')).toEqual(tallPathIds)
    })

    it('노드가 440×160 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<SpanningTreeDiagram />)
      expectFits([0, 0, 440, 160])
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·링크·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<SpanningTreeDiagram />)
      await expectScenario(scenario, wideArrows, wideNotes, 440, 160, container)
    })

    it('케이블과 링크는 늘 보이고 회색이며 양 끝이 두 노드의 변에 닿는다', () => {
      render(<SpanningTreeDiagram />)
      expectLinks(wideLinks)
    })

    it('화살표 양 끝은 두 노드의 변에 닿고 어떤 선분도 노드 안을 지나지 않는다', async () => {
      render(<SpanningTreeDiagram />)
      await expectArrowEnds()
    })

    it('STP가 없으면 화살표가 고리를 돌고, STP를 쓰거나 링크가 끊기면 흐린 링크를 피해 고리 없이 세 스위치를 잇는다', async () => {
      render(<SpanningTreeDiagram />)
      await expectPoint()
    })

    it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 각 화살표가 자기 마커를 가리킨다', async () => {
      await expectUniqueMarkers()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<SpanningTreeDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 216')
      await selectScenario('링크가 끊기면')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '링크가 끊기면' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(diagram().querySelector('[data-link="link-12"]')).toHaveAttribute('opacity', '0.25')
      expect(diagram().querySelector('[data-note="reopened"]')).toHaveAttribute('x', String(wideNotes.reopened.x))
    })
  })
})
