import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { RecordTypesDiagram, recordTypesScenarios } from './RecordTypesDiagram'

const topicId = 'dns'
const anchorConceptId = `${topicId}.resource-records`
const labels: Record<string, string> = {
  'cname-name': 'web.example.com',
  'cname-type': 'CNAME',
  'cname-data': 'www.example.com',
  'a-name': 'www.example.com',
  'a-type': 'A',
  'a-data': '198.51.100.10',
  'mx-name': 'example.com',
  'mx-type': 'MX',
  'mx-data': '10 mail.example.com',
  'ns-name': 'example.com',
  'ns-type': 'NS',
  'ns-data': 'ns1.example.com',
}
const groupLabels: Record<string, string> = { zone: 'example.com 영역의 레코드' }
const noteLabels: Record<string, string> = {
  'alias-note': '다른 이름을 가리킨다',
  'address-note': 'IPv4 주소를 짝짓는다',
  'mx-note': '메일 서버를 알린다',
  'ns-note': '네임 서버를 알린다',
}
// 곁말은 자기 레코드의 이름 칸 오른쪽, 그 칸과 같은 높이에 놓인다.
const noteNode: Record<string, string> = { 'alias-note': 'cname-name', 'address-note': 'a-name', 'mx-note': 'mx-name', 'ns-note': 'ns-name' }
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const records = ['cname', 'a', 'mx', 'ns']
// 화살표마다 [시작, 끝].
const ends: Record<string, [string, string]> = { alias: ['cname-data', 'a-name'] }

const tallPaths: Record<string, string> = { alias: 'M100 94 V106' }
const widePaths: Record<string, string> = { alias: 'M240 62 V72 H70 V82' }

const question = '레코드마다 이름에 무엇을 짝지어 둘까?'
const figureName = 'example.com 영역의 CNAME·A·MX·NS 레코드를 이름·유형·데이터 칸으로 나눠, 유형마다 이름에 무엇을 짝지어 두는지 보이는 도식'
const svgName = 'example.com 영역 상자 안에 web.example.com의 CNAME, www.example.com의 A, example.com의 MX와 NS 레코드를 맞닿은 칸 셋씩으로 놓은 그림'
const idleCaption = 'example.com 영역에 든 레코드 넷이다. 맞닿은 칸 셋이 레코드 하나로, 이름·유형·데이터를 적었고 TTL과 클래스 칸은 빼고 그렸다. 이름과 값은 예로 붙인 것이다. 버튼을 고르면 유형마다 이름에 무엇을 짝지어 두는지 볼 수 있다.'
const legend = '맞닿은 칸 셋이 레코드 하나이고, 화살표는 별칭이 가리키는 정식 이름이다.'
const expectedScenarios = [
  {
    id: 'address', label: '주소',
    nodes: ['a-name', 'a-type', 'a-data'], paths: [] as string[], notes: ['address-note'],
    caption: 'www.example.com의 A 레코드는 이 이름에 IPv4 주소 198.51.100.10을 짝지어 둔다. 이 이름의 IP 주소를 물으면 네임 서버는 이 데이터를 답으로 돌려준다.',
  },
  {
    id: 'alias', label: '별칭',
    nodes: ['cname-name', 'cname-type', 'cname-data', 'a-name', 'a-type', 'a-data'], paths: ['alias'], notes: ['alias-note'],
    caption: 'web.example.com의 CNAME 레코드는 주소 대신 정식 이름 www.example.com을 적는다. 이 별칭의 IP 주소를 물으면 네임 서버는 정식 이름으로 다시 찾아, www.example.com의 A 레코드에서 198.51.100.10을 얻는다.',
  },
  {
    id: 'mail-ns', label: '메일과 네임 서버',
    nodes: ['mx-name', 'mx-type', 'mx-data', 'ns-name', 'ns-type', 'ns-data'], paths: [] as string[], notes: ['mx-note', 'ns-note'],
    caption: 'example.com 앞으로 오는 메일을 받을 서버는 MX 레코드가 mail.example.com으로 알리고, 이 영역의 이름을 물을 때 답하는 네임 서버는 NS 레코드가 ns1.example.com으로 알린다. 둘 다 데이터는 IP 주소가 아니라 서버의 이름이고, 10은 MX의 우선순위 값이다.',
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

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function contains(outer: SvgBox, inner: SvgBox) {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height
}

// 두 상자가 변을 맞대는가. 한 변이 같은 줄에 있고, 그 변 위에서 겹치는 길이가 0보다 커야 한다.
function abut(a: SvgBox, b: SvgBox) {
  const xOverlap = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)
  const yOverlap = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y)
  const sideBySide = (a.x + a.width === b.x || b.x + b.width === a.x) && yOverlap > 0
  const stacked = (a.y + a.height === b.y || b.y + b.height === a.y) && xOverlap > 0
  return sideBySide || stacked
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

const groupLabelBox = (id: string) => textBox(svg().querySelector(`[data-group-label="${id}"]`)!, id)

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 218] : [0, 0, 280, 338]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<RecordTypesDiagram />)
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
    const { container } = render(<RecordTypesDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(svg().querySelectorAll('[data-link]')).toHaveLength(0)
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<RecordTypesDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownNotes()).toEqual(scenario.notes)
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
    render(<RecordTypesDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      expect(contains(groupBox('zone'), nodeBox(id)), id).toBe(true)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
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
        expect(contains(groupBox('zone'), box), id).toBe(true)
        // 곁말은 자기 레코드의 이름 칸 오른쪽에, 그 칸의 높이 안에 놓인다.
        const own = nodeBox(noteNode[id])
        expect(box.x, id).toBeGreaterThan(own.x + own.width)
        expect(box.y, id).toBeGreaterThanOrEqual(own.y)
        expect(box.y + box.height, id).toBeLessThanOrEqual(own.y + own.height)
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
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표의 양 끝은 노드의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<RecordTypesDiagram />)
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

  // 요점: 레코드 하나는 이름·유형·데이터 칸이 맞닿은 덩어리이고, 다른 레코드의 칸과는 닿지 않는다.
  it('레코드마다 이름·유형·데이터 칸이 맞닿고, 다른 레코드의 칸과는 떨어져 있다', () => {
    render(<RecordTypesDiagram />)
    for (const record of records) {
      expect(abut(nodeBox(`${record}-name`), nodeBox(`${record}-type`)), `${record} 이름 ↔ 유형`).toBe(true)
      expect(abut(nodeBox(`${record}-type`), nodeBox(`${record}-data`)), `${record} 유형 ↔ 데이터`).toBe(true)
      for (const other of records.filter((otherRecord) => otherRecord !== record)) {
        for (const cell of ['name', 'type', 'data']) {
          for (const otherCell of ['name', 'type', 'data']) {
            const a = nodeBox(`${record}-${cell}`)
            const b = nodeBox(`${other}-${otherCell}`)
            expect(abut(a, b) || overlaps(a, b), `${a.id} ↔ ${b.id}`).toBe(false)
          }
        }
      }
    }
  })
}

describe('RecordTypesDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<RecordTypesDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 338')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('별칭')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 218')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '별칭' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  // 요점: 별칭의 데이터 칸에는 IP 주소가 없고 정식 이름이 있으며, 화살표가 그 이름을 이름 칸으로 가진 A 레코드로 간다.
  // MX와 NS의 데이터는 서로 다른 서버의 이름이다. 유형 칸의 라벨은 본문 목록 항목의 이름과 같다.
  it('별칭의 데이터는 주소가 아닌 정식 이름이고, MX와 NS는 서로 다른 서버의 이름을 담으며, 유형 이름과 예 줄이 본문과 같다', async () => {
    render(<RecordTypesDiagram />)
    const ipv4 = /\b\d{1,3}(?:\.\d{1,3}){3}\b/u
    await select('별칭')
    expect(svg().querySelector('[data-node="cname-data"]')).toHaveAttribute('opacity', '1')
    expect(label('cname-data')).not.toMatch(ipv4)
    expect(label('cname-data')).toBe(label('a-name'))
    expect(label('a-data')).toMatch(ipv4)

    await select('메일과 네임 서버')
    const mxServer = label('mx-data').split(' ')[1]
    const nsServer = label('ns-data')
    expect(label('mx-data')).toMatch(/^\d+ /u)
    expect(mxServer).not.toBe(nsServer)
    for (const server of [mxServer, nsServer]) expect(server).not.toMatch(ipv4)
    expect(label('mx-name')).toBe(label('ns-name'))

    const body = anchorConcept().paragraphs.join('\n')
    for (const type of ['A', 'CNAME', 'MX', 'NS']) expect(body).toContain(`- **${type}**(`)
    expect(records.map((record) => label(`${record}-type`))).toEqual(['CNAME', 'A', 'MX', 'NS'])
    expect(body).toContain('`www.example.com. 3600 IN A 198.51.100.10`')
    expect(body).toContain('`web.example.com. 3600 IN CNAME www.example.com.`')
    expect(body).toContain('`example.com. 3600 IN MX 10 mail.example.com.`')
    expect(body).toContain('`example.com. 3600 IN NS ns1.example.com.`')
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><RecordTypesDiagram /><RecordTypesDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '별칭' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<RecordTypesDiagram />)
    const text = visualsByTopicId[topicId].diagrams['record-types']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(recordTypesScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = recordTypesScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 DNS 레코드 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
