import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { SoaFieldsDiagram, soaFieldsScenarios } from './SoaFieldsDiagram'

const topicId = 'dns'
const anchorConceptId = `${topicId}.soa-record`
const labels: Record<string, string> = {
  'mname-name': 'MNAME',
  'mname-value': 'ns1.example.com.',
  'rname-name': 'RNAME',
  'rname-value': 'hostmaster.example.com.',
  'mail': 'hostmaster@example.com',
  'serial-name': 'SERIAL',
  'serial-value': '100',
  'refresh-name': 'REFRESH',
  'refresh-value': '7200초 (2시간)',
  'retry-name': 'RETRY',
  'retry-value': '600초 (10분)',
  'expire-name': 'EXPIRE',
  'expire-value': '604800초 (7일)',
  'minimum-name': 'MINIMUM',
  'minimum-value': '300초 (5분)',
}
const groupLabels: Record<string, string> = { secondary: '보조 서버의 일정' }
const noteLabels: Record<string, string> = { 'rname-note': '@ 대신 점' }
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
// 필드는 SOA 레코드의 데이터에 적는 차례다. 이름 칸은 -name, 값 칸은 -value를 붙인다.
const fields = ['mname', 'rname', 'serial', 'refresh', 'retry', 'expire', 'minimum']
const secondaryFields = ['refresh', 'retry', 'expire']
const linkIds = ['rname-mail']
// 선마다 [위쪽, 아래쪽].
const ends: Record<string, [string, string]> = { 'rname-mail': ['rname-value', 'mail'] }

const tallPaths: Record<string, string> = { 'rname-mail': 'M160 94 V106' }
const widePaths: Record<string, string> = { 'rname-mail': 'M160 94 V106' }

const question = 'SOA 레코드의 필드는 각각 무엇을 정할까?'
const figureName = 'example.com 영역의 SOA 레코드에 든 필드 일곱을 예의 값과 함께 놓고, 필드마다 무엇을 정하는지 보이는 도식'
const svgName = 'MNAME·RNAME·SERIAL·REFRESH·RETRY·EXPIRE·MINIMUM 필드를 필드 이름과 값의 칸으로 놓고, RNAME 아래에 메일 주소 hostmaster@example.com을 두고, REFRESH·RETRY·EXPIRE를 보조 서버의 일정 상자로 묶은 그림'
const idleCaption = 'example.com 영역의 SOA 레코드에 든 필드 일곱을 데이터에 적는 차례대로 놓은 것이다. 시간은 초로 적고, 값은 예로 붙인 것이지 권하는 값이 아니다. 버튼을 고르면 필드들이 무엇을 정하는지 볼 수 있다.'
const legend = '왼쪽 칸이 필드 이름, 오른쪽 칸이 예의 값이고, 상자로 묶은 필드는 보조 서버가 쓴다.'
const pair = (field: string) => [`${field}-name`, `${field}-value`]
const expectedScenarios = [
  {
    id: 'who', label: '서버와 책임자',
    nodes: [...pair('mname'), ...pair('rname'), 'mail'], notes: ['rname-note'],
    caption: 'MNAME에는 이 영역의 원본을 가진 주 서버의 이름 ns1.example.com.을, RNAME에는 영역 책임자의 메일 주소를 적는다. 메일 주소의 @ 자리에 점을 써서 hostmaster.example.com.으로 적고, 이것은 메일 주소 hostmaster@example.com이다.',
  },
  {
    id: 'version', label: '판 번호',
    nodes: pair('serial'), notes: [] as string[],
    caption: 'SERIAL은 영역의 판 번호인 일련번호다. 영역을 고칠 때마다 올리고, 보조 서버는 주 서버의 이 번호를 자기 사본의 번호와 견주어 영역이 바뀌었는지 안다.',
  },
  {
    id: 'secondary', label: '보조 서버의 일정',
    nodes: secondaryFields.flatMap(pair), notes: [] as string[],
    caption: 'REFRESH·RETRY·EXPIRE는 보조 서버가 따르는 일정이다. 보조 서버는 7200초를 기다렸다가 주 서버에 일련번호를 물어 견주고, 닿지 못하면 600초마다 다시 해 보며, 마지막으로 확인한 뒤 604800초가 지나도록 끝내 닿지 못하면 사본을 버리고 이 영역에 답하기를 멈춘다.',
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
const link = (id: string) => svg().querySelector(`[data-link="${id}"]`)!
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (item) => item.getAttribute('data-note')!)

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 190] : [0, 0, 280, 362]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<SoaFieldsDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드와 RNAME의 선이 모두 선명하고 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<SoaFieldsDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(Array.from(svg().querySelectorAll('[data-link]'), (item) => item.getAttribute('data-link'))).toEqual(linkIds)
    for (const id of linkIds) {
      expect(link(id)).toHaveAttribute('d', paths[id])
      expect(link(id)).toHaveClass('stroke-muted')
      expect(link(id)).not.toHaveAttribute('marker-end')
    }
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·곁말만 보이고 그룹 박스와 선은 흐려지지 않는다', async (scenario) => {
    const { container } = render(<SoaFieldsDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownNotes()).toEqual(scenario.notes)
    for (const id of shownNotes()) expect(note(id)!.textContent).toBe(noteLabels[id])
    expect(shownPaths()).toEqual([])
    for (const id of linkIds) expect(link(id).closest('[opacity]'), id).toBeNull()
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말·그룹 라벨이 자리에 들어간다`, async () => {
    render(<SoaFieldsDiagram />)
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
        // 곁말은 메일 주소 칸의 왼쪽, 그 칸의 높이 안에 놓인다.
        const mail = nodeBox('mail')
        expect(box.x + box.width, id).toBeLessThan(mail.x)
        expect(box.y, id).toBeGreaterThanOrEqual(mail.y)
        expect(box.y + box.height, id).toBeLessThanOrEqual(mail.y + mail.height)
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

  it('선의 양 끝은 노드의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<SoaFieldsDiagram />)
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

  // 요점: 필드마다 이름 칸 바로 오른쪽에 값 칸이 맞닿는다. 보조 서버의 일정 상자에는 REFRESH·RETRY·EXPIRE만 들고,
  // 「보조 서버의 일정」을 고르면 정확히 그 셋이 선명하다.
  it('필드마다 이름과 값이 맞닿고, 상자 안에는 REFRESH·RETRY·EXPIRE만 들며 그 시나리오에서 정확히 그 셋이 선명하다', async () => {
    render(<SoaFieldsDiagram />)
    for (const field of fields) {
      const name = nodeBox(`${field}-name`)
      const value = nodeBox(`${field}-value`)
      expect(value.x, field).toBe(name.x + name.width)
      expect(value.y, field).toBe(name.y)
    }
    for (const id of nodeIds) {
      const field = id.replace(/-(name|value)$/u, '')
      expect(contains(groupBox('secondary'), nodeBox(id)), id).toBe(secondaryFields.includes(field))
      if (!secondaryFields.includes(field)) expect(overlaps(groupBox('secondary'), nodeBox(id)), id).toBe(false)
    }
    await select('보조 서버의 일정')
    const clear = nodeIds.filter((id) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
    expect(new Set(clear.map((id) => id.replace(/-(name|value)$/u, '')))).toEqual(new Set(secondaryFields))
  })
}

describe('SoaFieldsDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)

    it('필드가 위에서 아래로 MNAME → RNAME → SERIAL → REFRESH → RETRY → EXPIRE → MINIMUM 차례다', () => {
      render(<SoaFieldsDiagram />)
      const ys = fields.map((field) => nodeBox(`${field}-name`).y)
      expect([...ys].sort((a, b) => a - b)).toEqual(ys)
      expect(new Set(ys).size).toBe(fields.length)
    })
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('필드를 왼쪽 열 위에서 아래로, 다음에 오른쪽 열 위에서 아래로 읽으면 MNAME부터 MINIMUM까지의 차례다', () => {
      render(<SoaFieldsDiagram />)
      const read = [...fields].sort((a, b) => {
        const boxA = nodeBox(`${a}-name`)
        const boxB = nodeBox(`${b}-name`)
        return boxA.x - boxB.x || boxA.y - boxB.y
      })
      expect(read).toEqual(fields)
    })

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<SoaFieldsDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 362')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('서버와 책임자')
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 190')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '서버와 책임자' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownNotes()).toEqual(tallNotes)
      for (const id of linkIds) expect(link(id)).toHaveAttribute('d', widePaths[id])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  // 요점: RNAME의 값에는 @가 없고, 그 값을 메일 주소로 읽은 칸과 곁말에 @가 있다.
  // 값 칸의 수는 본문 SOA 줄의 데이터와 같은 차례다.
  it('RNAME 값에는 @가 없고 메일 주소 칸에 있으며, 값 칸의 수가 본문 SOA 줄의 데이터와 같은 차례다', async () => {
    render(<SoaFieldsDiagram />)
    expect(label('rname-value')).not.toContain('@')
    expect(label('mail')).toContain('@')
    // 첫 점을 @로 바꾸고 끝의 점을 빼면 메일 주소가 된다.
    expect(label('rname-value').replace('.', '@').replace(/\.$/u, '')).toBe(label('mail'))
    await select('서버와 책임자')
    expect(note('rname-note')!.textContent).toContain('@')

    const body = anchorConcept().paragraphs.join('\n')
    const line = 'example.com. 3600 IN SOA ns1.example.com. hostmaster.example.com. 100 7200 600 604800 300'
    expect(body).toContain(`\`${line}\``)
    const data = line.split(' ').slice(4)
    expect(fields.map((field) => label(`${field}-value`).split('초')[0])).toEqual(data)
    expect(body).toContain('`hostmaster@example.com`')
    for (const field of fields) expect(body).toContain(`- **${label(`${field}-name`)}**`)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<SoaFieldsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['soa-fields']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(soaFieldsScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = soaFieldsScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual([])
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 SOA 레코드 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
