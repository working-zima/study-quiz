import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { IpconfigViewDiagram, ipconfigViewScenarios } from './IpconfigViewDiagram'

const topicId = 'diagnostic-commands'
const anchorConceptId = `${topicId}.ipconfig`
const labels: Record<string, string> = {
  'cmd-basic': 'ipconfig',
  'cmd-all': 'ipconfig /all',
  'ip-label': 'IP 주소',
  'ip-value': '192.0.2.10',
  'mask-label': '서브넷 마스크',
  'mask-value': '255.255.255.0',
  'gateway-label': '기본 게이트웨이',
  'gateway-value': '192.0.2.1',
  'host-label': '호스트 이름',
  'host-value': 'pc1',
  'dns-label': 'DNS 서버',
  'dns-value': '192.0.2.53',
}
const groupLabels: Record<string, string> = {
  'basic': '옵션 없이도 나오는 줄',
  'extra': '/all에서 더 나오는 줄',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const basicRows = ['ip-label', 'ip-value', 'mask-label', 'mask-value', 'gateway-label', 'gateway-value']
const extraRows = ['host-label', 'host-value', 'dns-label', 'dns-value']
const rowsOf: Record<string, string[]> = { basic: basicRows, extra: extraRows }
// 줄마다 항목 이름 칸과 값 칸이 맞닿는다.
const rowPairs: [string, string][] = [
  ['ip-label', 'ip-value'], ['mask-label', 'mask-value'], ['gateway-label', 'gateway-value'], ['host-label', 'host-value'], ['dns-label', 'dns-value'],
]
// 화살표는 명령 칸의 변에서 시작해 그 명령이 보여 주는 줄들의 박스 변에서 끝난다.
const pathEnds: Record<string, [string, string]> = {
  'basic-out': ['cmd-basic', 'basic'],
  'all-basic': ['cmd-all', 'basic'],
  'all-extra': ['cmd-all', 'extra'],
}
const tallPaths: Record<string, string> = {
  'basic-out': 'M72 40 V56',
  'all-basic': 'M208 40 V56',
  'all-extra': 'M264 24 H274 V204 H264',
}
const widePaths: Record<string, string> = {
  'basic-out': 'M84 40 V56',
  'all-basic': 'M288 24 H200 V56',
  'all-extra': 'M356 40 V56',
}

const question = 'ipconfig는 무엇을 보여 줄까?'
const figureName = 'PC 192.0.2.10에서 옵션 없이 ipconfig를 입력하면 IP 주소·서브넷 마스크·기본 게이트웨이가 나오고, ipconfig /all을 입력하면 호스트 이름과 DNS 서버까지 더 나오는 것을 항목 이름과 값의 줄로 보이는 도식'
const svgName = '위에 두 명령을, 아래에 옵션 없이도 나오는 줄 셋과 /all에서 더 나오는 줄 둘을 항목 이름과 값의 칸으로 쌓은 그림'
const idleCaption = 'PC 192.0.2.10에서 두 명령이 보여 주는 항목을 이름과 값의 줄로 나눠 보였다. 버튼을 고르면 각 명령을 입력했을 때 어떤 줄이 나오는지 볼 수 있다.'
const legend = '한 줄이 항목 하나이고, 왼쪽 칸이 항목 이름, 오른쪽 칸이 값이다. 화살표는 명령을 입력했을 때 나오는 줄들을 가리킨다.'
const expectedScenarios = [
  {
    id: 'basic', label: '옵션 없이',
    nodes: ['cmd-basic', ...basicRows], paths: ['basic-out'],
    caption: '옵션 없이 ipconfig를 입력하면 어댑터마다 IP 주소 192.0.2.10, 서브넷 마스크 255.255.255.0, 기본 게이트웨이 192.0.2.1을 간단히 보여 준다. 호스트 이름과 DNS 서버의 주소는 나오지 않는다.',
  },
  {
    id: 'all', label: '/all',
    nodes: ['cmd-all', ...basicRows, ...extraRows], paths: ['all-basic', 'all-extra'],
    caption: 'ipconfig /all을 입력하면 어댑터마다 네트워크 설정 전체를 자세히 보여 주어, 세 값에 더해 호스트 이름 pc1과 DNS 서버 192.0.2.53 같은 항목까지 나온다.',
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
const opacity = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function contains(outer: SvgBox, inner: SvgBox) {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height
}

// 그룹 라벨(9)의 가로 범위. 반각 문자가 섞이므로 어림값의 1.15배로 잡는다.
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 188] : [0, 0, 280, 296]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<IpconfigViewDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 칸이 모두 선명하고 화살표 없이 선택 안내가 나온다', () => {
    const { container } = render(<IpconfigViewDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(svg().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 칸과 화살표만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<IpconfigViewDiagram />)
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
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨과 그룹 라벨이 자리에 들어간다`, () => {
    render(<IpconfigViewDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    expect(overlaps(groupBox('basic'), groupBox('extra'))).toBe(false)
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    for (const group of groupIds) {
      for (const id of rowsOf[group]) expect(contains(groupBox(group), nodeBox(id)), `${id} ⊂ ${group}`).toBe(true)
      expect(svg().querySelector(`[data-group-label="${group}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(group)
      expect(contains(groupBox(group), box), group).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${group} 라벨 ↔ ${node}`).toBe(false)
    }
    for (const id of ['cmd-basic', 'cmd-all']) for (const group of groupIds) expect(overlaps(nodeBox(id), groupBox(group)), `${id} ↔ ${group}`).toBe(false)
    // 줄마다 이름 칸 바로 오른쪽에 값 칸이 맞닿는다.
    for (const [name, value] of rowPairs) {
      expect(nodeBox(name).y, name).toBe(nodeBox(value).y)
      expect(nodeBox(name).x + nodeBox(name).width, name).toBe(nodeBox(value).x)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 명령 칸의 변에서 시작해 그 줄들의 박스 변에서 끝나고, 칸 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<IpconfigViewDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(pathEnds)))
    for (const [id, d] of Object.entries(paths)) {
      const [from, to] = pathEnds[id]
      const { start, end } = lineEnds(d)
      expect(onEdge(start, nodeBox(from)), `${id} 시작`).toBe(true)
      expect(onEdge(end, groupBox(to)), `${id} 끝`).toBe(true)
      for (const segment of segments(d)) {
        expect(segment.x1, id).toBeLessThanOrEqual(viewBox[2])
        expect(segment.x2, id).toBeLessThanOrEqual(viewBox[2])
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
    }
  })

  // 요점: 「옵션 없이」에서 선명한 줄에는 DNS 서버 줄이 없고 「/all」에서는 있다. 기본 줄의 IP 주소 값은 본문 예와 같고,
  // 「/all」의 선명한 줄 수가 「옵션 없이」보다 많다.
  it('옵션 없이는 DNS 서버 줄이 나오지 않고 /all에서는 나오며, /all이 더 많은 줄을 보인다', async () => {
    render(<IpconfigViewDiagram />)
    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    expect(label('ip-value')).toBe('192.0.2.10')
    for (const id of nodeIds.filter((nodeId) => nodeId.endsWith('-value'))) expect(body, id).toContain(`\`${label(id)}\``)

    await select('옵션 없이')
    const basicShown = nodeIds.filter((id) => id.endsWith('-label') && opacity(id) === '1').map(label)
    expect(basicShown).not.toContain('DNS 서버')
    expect(basicShown).toEqual(['IP 주소', '서브넷 마스크', '기본 게이트웨이'])

    await select('/all')
    const allShown = nodeIds.filter((id) => id.endsWith('-label') && opacity(id) === '1').map(label)
    expect(allShown).toContain('DNS 서버')
    expect(allShown.length).toBeGreaterThan(basicShown.length)
    for (const name of basicShown) expect(allShown).toContain(name)

    // 명령 칸은 위에, 줄들은 그 아래에 있다. 옵션 없이 나오는 줄의 박스가 /all에서 더 나오는 줄의 박스보다 앞(위나 왼쪽)이다.
    for (const id of ['cmd-basic', 'cmd-all']) for (const group of groupIds) expect(nodeBox(id).y + 32, id).toBeLessThanOrEqual(groupBox(group).y)
    expect(groupBox('basic').y <= groupBox('extra').y && groupBox('basic').x <= groupBox('extra').x).toBe(true)
    for (const name of ['`ipconfig /all`', '호스트 이름', 'DNS 서버', '`ip address`']) expect(body, name).toContain(name)
  })
}

describe('IpconfigViewDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('칸·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<IpconfigViewDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 296')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('/all')
      const tallShown = shownPaths()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 188')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '/all' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><IpconfigViewDiagram /><IpconfigViewDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '/all' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<IpconfigViewDiagram />)
    const text = visualsByTopicId[topicId].diagrams['ipconfig-view']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(ipconfigViewScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toBeUndefined()
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
      const scenario = ipconfigViewScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 ipconfig 명령 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
