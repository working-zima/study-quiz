import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { SnmpVersionsDiagram, snmpVersionsScenarios } from './SnmpVersionsDiagram'

const topicId = 'app-protocols-mgmt-security'
const anchorConceptId = `${topicId}.snmp-versions`
const labels: Record<string, string> = {
  nms: '관리 시스템',
  router: '라우터 1',
  'v2c-req': 'netops가 실린 요청',
  'v2c-peek': '엿보는 사람',
  'v3-req': '암호화한 요청',
  'v3-peek': '엿보는 사람',
}
const groupLabels: Record<string, string> = {
  'manager-side': '매니저',
  'agent-side': '에이전트',
  'v2c-box': 'SNMPv2c · 커뮤니티 문자열',
  'v3-box': 'SNMPv3 · 인증과 암호화',
}
const noteLabels: Record<string, string> = {
  'v2c-note': 'netops가 그대로 보임',
  'v3-note': '암호화되어 알아볼 수 없음',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
const headIds = ['nms', 'router']
const versions = ['v2c', 'v3']
const messageIds = nodeIds.filter((id) => !headIds.includes(id))
const boxOf: Record<string, string> = { 'v2c-req': 'v2c-box', 'v2c-peek': 'v2c-box', 'v3-req': 'v3-box', 'v3-peek': 'v3-box' }
const noteOwner: Record<string, string> = { 'v2c-note': 'v2c-peek', 'v3-note': 'v3-peek' }

const tallPaths: Record<string, string> = {
  'v2c-send': 'M64 96 H76',
  'v2c-deliver': 'M204 96 H216',
  'v2c-peek': 'M140 112 V136',
  'v3-send': 'M64 236 H76',
  'v3-deliver': 'M204 236 H216',
  'v3-peek': 'M140 252 V276',
}
const widePaths: Record<string, string> = {
  'v2c-send': 'M96 96 H120',
  'v2c-deliver': 'M320 96 H344',
  'v2c-peek': 'M220 112 V136',
  'v3-send': 'M96 236 H120',
  'v3-deliver': 'M320 236 H344',
  'v3-peek': 'M220 252 V276',
}
const pathsOf = (version: string) => [`${version}-send`, `${version}-deliver`, `${version}-peek`]

const question = '중간에서 엿보면 무엇이 보일까?'
const figureName = '관리 시스템의 매니저가 「라우터 1」의 에이전트에게 같은 요청을 SNMPv2c와 SNMPv3로 보낼 때, 중간에서 엿보는 사람에게 커뮤니티 문자열 netops가 그대로 보이는지 암호화되어 알아볼 수 없는지를 견주어 보이는 도식'
const svgName = '왼쪽 매니저 기둥과 오른쪽 에이전트 기둥 사이에, 위 SNMPv2c 박스에 netops가 실린 요청과 엿보는 사람을, 아래 SNMPv3 박스에 암호화한 요청과 엿보는 사람을 놓은 그림'
const idleCaption = '관리 시스템의 매니저가 「라우터 1」의 에이전트에게 값을 묻는 요청을 보내는 두 경우를 위아래로 놓았다. 위 박스는 커뮤니티 문자열을 쓰는 SNMPv2c로, 아래 박스는 인증과 암호화를 함께 쓰는 SNMPv3로 보낼 때다. 버튼을 고르면 중간에서 엿보는 사람에게 무엇이 보이는지 볼 수 있다.'
const legend = '위의 두 노드는 매니저가 실행되는 관리 시스템과 에이전트가 실행되는 「라우터 1」이고, 그 아래 왼쪽 박스가 매니저, 오른쪽 박스가 에이전트다. 가로 화살표는 요청이 가는 방향이고, 아래로 난 화살표는 엿보는 사람이 그 요청을 읽는 것이다. 곁의 글은 엿보는 사람에게 보이는 것이다.'
const expectedScenarios = [
  {
    id: 'v2c', label: 'SNMPv2c',
    nodes: [...headIds, 'v2c-req', 'v2c-peek'], paths: pathsOf('v2c'), notes: ['v2c-note'],
    caption: 'SNMPv2c에서는 매니저와 「라우터 1」의 에이전트가 미리 맞춰 둔 커뮤니티 문자열 netops가 GetRequest 메시지에 암호화되지 않은 채 실려 간다. 중간에서 엿보는 사람도 netops를 글자 그대로 읽어 낼 수 있고, 그 글자열을 실어 요청을 꾸며 보낼 수도 있다.',
  },
  {
    id: 'v3', label: 'SNMPv3',
    nodes: [...headIds, 'v3-req', 'v3-peek'], paths: pathsOf('v3'), notes: ['v3-note'],
    caption: 'SNMPv3에서는 메시지를 보냈다는 사용자가 맞는지와 메시지가 도중에 바뀌지 않았는지 확인하는 인증을 하고, 고르면 내용을 암호화한다. 인증과 암호화를 함께 쓰면 엿보는 사람은 요청의 내용을 알아볼 수 없고, 누가 도중에 내용을 바꾸면 에이전트가 알아챈다.',
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

function onEdge(x: number, y: number, box: SvgBox) {
  const insideX = x >= box.x && x <= box.x + box.width
  const insideY = y >= box.y && y <= box.y + box.height
  return ((x === box.x || x === box.x + box.width) && insideY) || ((y === box.y || y === box.y + box.height) && insideX)
}

function lineEnds(d: string) {
  const list = segments(d)
  return { start: { x: list[0].x1, y: list[0].y1 }, end: { x: list[list.length - 1].x2, y: list[list.length - 1].y2 } }
}

// 경로 끝이 닿은 곳 — 노드의 변이 먼저고, 아니면 기둥의 변이다.
const endAt = (point: { x: number, y: number }) => nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))
  ?? ['manager-side', 'agent-side'].find((id) => onEdge(point.x, point.y, groupBox(id)))
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 348] : [0, 0, 280, 348]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<SnmpVersionsDiagram />)
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
    const { container } = render(<SnmpVersionsDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<SnmpVersionsDiagram />)
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
    render(<SnmpVersionsDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    const manager = groupBox('manager-side')
    const agent = groupBox('agent-side')
    expect(manager.y).toBe(agent.y)
    expect(manager.height).toBe(agent.height)
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const column of ['manager-side', 'agent-side']) expect(overlaps(nodeBox(id), groupBox(column)), `${id} ↔ ${column}`).toBe(false)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    // 머리 노드는 기둥 위에 서고 바깥 변을 기둥과 맞춘다.
    for (const id of headIds) expect(nodeBox(id).y + 32, id).toBeLessThan(manager.y)
    expect(nodeBox('nms').x).toBe(manager.x)
    expect(nodeBox('router').x + nodeBox('router').width).toBe(agent.x + agent.width)
    // 요청과 엿보는 사람은 두 기둥 사이, 자기 판의 박스 안에 든다.
    for (const id of messageIds) {
      expect(nodeBox(id).x, id).toBeGreaterThan(manager.x + manager.width)
      expect(nodeBox(id).x + nodeBox(id).width, id).toBeLessThan(agent.x)
      expect(nodeBox(id).y + 32, id).toBeLessThan(manager.y + manager.height)
      for (const box of ['v2c-box', 'v3-box']) {
        if (boxOf[id] === box) expect(contains(groupBox(box), nodeBox(id)), `${id} ⊂ ${box}`).toBe(true)
        else expect(overlaps(nodeBox(id), groupBox(box)), `${id} ↔ ${box}`).toBe(false)
      }
    }
    for (const id of groupIds) {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
    }
    // 곁말은 자기 박스 안, 엿보는 사람 아래에 들어간다.
    const noteBoxes: SvgBox[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of scenario.notes) noteBoxes.push(textBox(note(id), id))
    }
    expect(noteBoxes.map(({ id }) => id)).toEqual(noteIds)
    for (const box of noteBoxes) {
      const owner = noteOwner[box.id]
      expect(contains(groupBox(boxOf[owner]), box), box.id).toBe(true)
      expect(box.y + 9 - (nodeBox(owner).y + 32), box.id).toBeGreaterThanOrEqual(10)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(viewBox[2])
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표 양 끝은 기둥이나 노드의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나거나 다른 화살표와 만나지 않는다', () => {
    render(<SnmpVersionsDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(versions.flatMap(pathsOf)))
    for (const [id, d] of Object.entries(paths)) {
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
    }
    const all = Object.keys(paths)
    for (let i = 0; i < all.length; i += 1) {
      for (const other of all.slice(i + 1)) {
        for (const a of segments(paths[all[i]])) {
          for (const b of segments(paths[other])) {
            const box = { id: '', x: Math.min(b.x1, b.x2), y: Math.min(b.y1, b.y2), width: Math.abs(b.x2 - b.x1), height: Math.abs(b.y2 - b.y1) }
            expect(touches(a, box), `${all[i]} ↔ ${other}`).toBe(false)
          }
        }
      }
    }
  })

  // 요점: 두 판 모두 요청은 매니저 기둥에서 에이전트 기둥으로 가고, 엿보는 사람은 그 요청 아래에서 요청을 읽는다.
  // 「SNMPv2c」에서 선명한 노드 라벨에 netops가 있고 곁말은 「그대로」를 말한다. 「SNMPv3」에서는 그 노드가 흐리고 곁말은 암호화를 말한다.
  it('SNMPv2c의 요청에는 netops가 그대로 보이고, SNMPv3의 요청은 암호화되어 알아볼 수 없다', async () => {
    render(<SnmpVersionsDiagram />)
    for (const version of versions) {
      expect(endAt(lineEnds(paths[`${version}-send`]).start), version).toBe('manager-side')
      expect(endAt(lineEnds(paths[`${version}-send`]).end), version).toBe(`${version}-req`)
      expect(endAt(lineEnds(paths[`${version}-deliver`]).start), version).toBe(`${version}-req`)
      expect(endAt(lineEnds(paths[`${version}-deliver`]).end), version).toBe('agent-side')
      expect(endAt(lineEnds(paths[`${version}-peek`]).start), version).toBe(`${version}-req`)
      expect(endAt(lineEnds(paths[`${version}-peek`]).end), version).toBe(`${version}-peek`)
      expect(nodeBox(`${version}-peek`).y, version).toBeGreaterThan(nodeBox(`${version}-req`).y + 32)
    }
    expect(groupBox('v3-box').y).toBeGreaterThan(groupBox('v2c-box').y + groupBox('v2c-box').height)

    await select('SNMPv2c')
    expect(nodeIds.filter((id) => opacity(id) === '1').map(label).some((text) => text.includes('netops'))).toBe(true)
    expect(label('v2c-req')).toContain('netops')
    expect(note('v2c-note').textContent).toContain('그대로')
    await select('SNMPv3')
    expect(opacity('v2c-req')).toBe('0.25')
    expect(nodeIds.filter((id) => opacity(id) === '1').map(label).some((text) => text.includes('netops'))).toBe(false)
    expect(note('v3-note').textContent).toContain('암호화')
    expect(note('v3-note').textContent).not.toContain('그대로')

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const name of ['`netops`', '`GetRequest`', '「라우터 1」', '커뮤니티 문자열', '엿보는 사람', '그대로', '인증과 암호화', '알아볼 수 없고']) {
      expect(body, name).toContain(name)
    }
  })
}

describe('SnmpVersionsDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<SnmpVersionsDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 348')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('SNMPv2c')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 348')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: 'SNMPv2c' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><SnmpVersionsDiagram /><SnmpVersionsDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'SNMPv2c' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<SnmpVersionsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['snmp-versions']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(snmpVersionsScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = snmpVersionsScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 버전과 보안 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
