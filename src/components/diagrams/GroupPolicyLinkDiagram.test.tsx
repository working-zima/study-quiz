import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { GroupPolicyLinkDiagram, groupPolicyLinkScenarios } from './GroupPolicyLinkDiagram'

const topicId = 'windows-ad'
const anchorConceptId = `${topicId}.group-policy`
const labels: Record<string, string> = {
  local: '로컬 GPO',
  site: '사이트',
  domain: 'example.com',
  ou: 'OU 영업팀',
  pc: 'PC01',
  user: 'user01',
  gpo: 'GPO 영업팀 PC 정책',
  security: '보안 설정',
  software: '소프트웨어 설치',
  redirect: '폴더 리디렉션',
  roaming: '로밍 사용자 프로필',
}
const groupLabels: Record<string, string> = {
  features: 'GPO로 할 수 있는 일',
}
const noteLabels: Record<string, string> = {
  'step-1': '①', 'step-2': '②', 'step-3': '③', 'step-4': '④',
}
const noteScenario: Record<string, string> = {
  'step-1': 'order', 'step-2': 'order', 'step-3': 'order', 'step-4': 'order',
}
// 번호마다 붙는 자리. ①부터 ④까지 로컬 GPO → 사이트 → 도메인 → OU 차례다.
const noteNode: Record<string, string> = {
  'step-1': 'local', 'step-2': 'site', 'step-3': 'domain', 'step-4': 'ou',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const featureIds = ['security', 'software', 'redirect', 'roaming']

const tallPaths: Record<string, string> = {
  'local-site': 'M80 64 V84',
  'site-domain': 'M80 116 V136',
  'domain-ou': 'M80 168 V188',
  'ou-pc': 'M58 220 V244',
  'ou-user': 'M116 220 V244',
  'gpo-ou': 'M152 204 H128',
  'gpo-features': 'M214 188 V168',
}
const widePaths: Record<string, string> = {
  'local-site': 'M84 56 H104',
  'site-domain': 'M160 56 H180',
  'domain-ou': 'M268 56 H288',
  'ou-pc': 'M360 48 H380',
  'ou-user': 'M360 68 H380',
  'gpo-ou': 'M330 120 V72',
  'gpo-features': 'M300 136 H268',
}
// 선마다 [시작 노드, 끝 노드 또는 박스]. GPO로 하는 일을 가리키는 선만 박스의 변에서 끝난다.
const ends: Record<string, [string, string]> = {
  'local-site': ['local', 'site'],
  'site-domain': ['site', 'domain'],
  'domain-ou': ['domain', 'ou'],
  'ou-pc': ['ou', 'pc'],
  'ou-user': ['ou', 'user'],
  'gpo-ou': ['gpo', 'ou'],
  'gpo-features': ['gpo', 'features'],
}

const question = 'GPO는 어디에 연결하면 누구에게 걸릴까?'
const figureName = 'GPO 영업팀 PC 정책을 OU 영업팀에 연결해 그 안의 PC01과 user01에 설정을 거는 것, 로컬 GPO·사이트·도메인·OU 차례로 GPO가 적용되는 것, GPO로 할 수 있는 일을 보이는 도식'
const svgName = '로컬 GPO, 사이트, example.com, OU 영업팀과 PC01, user01, GPO 영업팀 PC 정책, GPO로 할 수 있는 일 박스(보안 설정, 소프트웨어 설치, 폴더 리디렉션, 로밍 사용자 프로필)가 있는 그림'
const idleCaption = 'GPO가 걸리는 자리인 로컬 GPO, 사이트, 도메인 example.com, OU 영업팀과, 영업팀 안의 PC01·user01, 영업팀에 연결할 GPO 영업팀 PC 정책, GPO로 할 수 있는 일을 두었다. 이름은 예로 붙인 것이다. 버튼을 고르면 GPO가 누구에게 걸리는지, 어떤 차례로 적용되는지, 무엇을 할 수 있는지 볼 수 있다.'
const legend = '번호는 GPO가 적용되는 차례다. 화살표는 GPO를 연결하는 곳, 설정이 걸리는 사용자와 컴퓨터, 적용 차례의 다음 단계, GPO로 하는 일을 가리킨다.'
const expectedScenarios = [
  {
    id: 'link', label: '연결',
    nodes: ['ou', 'pc', 'user', 'gpo'], paths: ['gpo-ou', 'ou-pc', 'ou-user'],
    caption: 'GPO 영업팀 PC 정책을 OU 영업팀에 연결하면 영업팀이 그 GPO의 적용 범위가 되어, 영업팀 안의 PC01과 user01에 설정이 걸린다. GPO는 사이트·도메인·OU에 연결하고, 그룹이나 사용자 계정에는 연결하지 않는다.',
  },
  {
    id: 'order', label: '적용 차례',
    nodes: ['local', 'site', 'domain', 'ou', 'pc'], paths: ['local-site', 'site-domain', 'domain-ou', 'ou-pc'],
    caption: 'PC01에는 PC01의 로컬 GPO, 사이트에 연결된 GPO, example.com에 연결된 GPO, 영업팀에 연결된 GPO 차례로 적용된다. 같은 설정을 GPO마다 다르게 정했으면 기본으로는 나중에 적용된 GPO의 값이 앞의 값을 덮어써, 영업팀에 연결된 GPO의 값이 남는다.',
  },
  {
    id: 'features', label: '할 수 있는 일',
    nodes: ['gpo', 'security', 'software', 'redirect', 'roaming'], paths: ['gpo-features'],
    caption: 'GPO로는 암호와 계정 잠금 같은 보안 설정을 강제하고, 소프트웨어 설치로 프로그램을 배포하며, 폴더 리디렉션과 로밍 사용자 프로필로 로그온하는 PC가 바뀌어도 같은 파일과 설정을 쓰게 한다.',
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

// 두 상자 사이의 가장 짧은 거리. 겹치거나 맞닿으면 0이다.
function gap(a: SvgBox, b: SvgBox) {
  const dx = Math.max(0, b.x - (a.x + a.width), a.x - (b.x + b.width))
  const dy = Math.max(0, b.y - (a.y + a.height), a.y - (b.y + b.height))
  return Math.hypot(dx, dy)
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

// 끝점이 변 위에 놓인 노드와 박스.
const endsAt = (point: { x: number, y: number }) => [
  ...nodeIds.filter((id) => onEdge(point.x, point.y, nodeBox(id))),
  ...groupIds.filter((id) => onEdge(point.x, point.y, groupBox(id))),
]
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 204] : [0, 0, 280, 284]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<GroupPolicyLinkDiagram />)
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
    const { container } = render(<GroupPolicyLinkDiagram />)
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
    const { container } = render(<GroupPolicyLinkDiagram />)
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
    render(<GroupPolicyLinkDiagram />)
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
      // GPO로 할 수 있는 일만 박스 안에 든다.
      if (featureIds.includes(id)) expect(contains(groupBox('features'), nodeBox(id)), `${id} ⊂ features`).toBe(true)
      else expect(overlaps(groupBox('features'), nodeBox(id)), `${id} ↔ features`).toBe(false)
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
        for (const group of groupIds) expect(overlaps(box, groupBox(group)), `${id} ↔ ${group}`).toBe(false)
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
      for (const [index, box] of noteTexts.entries()) {
        for (const group of groupTexts) expect(overlaps(box, group), `${box.id} ↔ ${group.id}`).toBe(false)
        for (const other of noteTexts.slice(index + 1)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
      }
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('선은 노드의 변에서 시작해 노드나 박스의 변에서 끝나고 어떤 선분도 노드 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<GroupPolicyLinkDiagram />)
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

  // 요점: 적용 차례에서 번호 ①~④가 로컬 GPO·사이트·도메인·OU 곁에 그 차례로 놓이고, 차례 화살표가 이 순서로 이어져
  // 마지막 OU에서 PC01로 간다. 연결에서는 GPO에서 나간 화살표가 OU 영업팀에서 끝나고, 그 안의 PC01·user01로 이어진다.
  it('GPO는 로컬 → 사이트 → 도메인 → OU 차례로 적용되고, 연결한 OU 안의 사용자와 컴퓨터에 걸린다', async () => {
    render(<GroupPolicyLinkDiagram />)
    await select('적용 차례')
    expect(shownNotes()).toEqual(['step-1', 'step-2', 'step-3', 'step-4'])
    for (const id of shownNotes()) {
      const box = textBox(note(id)!, id)
      // 번호는 자기 자리 노드에 가장 가깝고, 그 노드에서 16 안쪽에 놓인다.
      const nearest = nodeIds.reduce((best, nodeId) => (gap(box, nodeBox(nodeId)) < gap(box, nodeBox(best)) ? nodeId : best))
      expect(nearest, id).toBe(noteNode[id])
      expect(gap(box, nodeBox(noteNode[id])), id).toBeLessThanOrEqual(16)
    }
    const chain = ['local-site', 'site-domain', 'domain-ou', 'ou-pc']
    expect(shownPaths()).toEqual(chain)
    for (const [index, id] of chain.entries()) {
      const { start, end } = lineEnds(paths[id])
      expect(endsAt(start), id).toEqual([['local', 'site', 'domain', 'ou'][index]])
      expect(endsAt(end), id).toEqual([['site', 'domain', 'ou', 'pc'][index]])
    }
    expect(opacityOf('gpo')).toBe('0.25')
    expect(opacityOf('user')).toBe('0.25')

    await select('연결')
    const linkStart = lineEnds(paths['gpo-ou'])
    expect(endsAt(linkStart.start)).toEqual(['gpo'])
    expect(endsAt(linkStart.end)).toEqual(['ou'])
    for (const id of ['ou-pc', 'ou-user']) {
      expect(shownPaths()).toContain(id)
      expect(endsAt(lineEnds(paths[id]).start), id).toEqual(['ou'])
    }
    expect(nodeIds.filter((id) => opacityOf(id) === '1')).toEqual(['ou', 'pc', 'user', 'gpo'])
    for (const id of ['local', 'site', 'domain', ...featureIds]) expect(opacityOf(id), id).toBe('0.25')

    await select('할 수 있는 일')
    expect(shownPaths()).toEqual(['gpo-features'])
    expect(nodeIds.filter((id) => opacityOf(id) === '1')).toEqual(['gpo', ...featureIds])

    // 그림의 이름과 사실은 본문에 있는 것이다.
    const body = anchorConcept().paragraphs.join('\n')
    for (const name of ['로컬 GPO', '사이트', '`example.com`', '`영업팀`', '`영업팀 PC 정책`', '`PC01`', '`user01`', '보안 설정', '소프트웨어 설치', '폴더 리디렉션', '로밍 사용자 프로필']) expect(body).toContain(name)
    expect(body).toContain('먼저 그 컴퓨터의 로컬 GPO, 다음으로 그 컴퓨터가 속한 사이트에 연결된 GPO, 그다음 도메인에 연결된 GPO, 마지막으로 그 컴퓨터가 든 OU에 연결된 GPO 차례로 적용된다')
    expect(body).toContain('기본으로는 나중에 적용된 GPO의 값이 앞의 값을 덮어써서 마지막 값이 남는다')
    expect(body).toContain('그룹이나 사용자 계정에는 GPO를 연결하지 않는다')
  })
}

describe('GroupPolicyLinkDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<GroupPolicyLinkDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 284')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('적용 차례')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 204')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '적용 차례' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><GroupPolicyLinkDiagram /><GroupPolicyLinkDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '연결' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<GroupPolicyLinkDiagram />)
    const text = visualsByTopicId[topicId].diagrams['group-policy-link']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(groupPolicyLinkScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = groupPolicyLinkScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 그룹 정책 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
