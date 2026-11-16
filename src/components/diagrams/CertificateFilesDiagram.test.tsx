import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { CertificateFilesDiagram, certificateFilesScenarios } from './CertificateFilesDiagram'

const topicId = 'windows-admin-tools'
const anchorConceptId = `${topicId}.certificate-manager`
const labels: Record<string, string> = {
  cert: 'user01의 인증서',
  key: 'user01의 개인 키',
  cer: '.cer',
  p7b: '.p7b',
  sst: '.sst',
  pfx: '.pfx',
}
const groupLabels: Record<string, string> = {
  manager: '인증서 관리자',
  public: '공개 인증서만 담는 형식',
}
const noteLabels: Record<string, string> = {
  'cer-note': '공개 인증서 하나',
  'p7b-note': '인증서 하나 이상',
  'sst-note': '인증서 하나 이상',
  'pfx-note': '개인 키까지 담는다',
  'password-note': '암호로 보호한다',
}
const noteScenario: Record<string, string> = {
  'cer-note': 'cert-only',
  'p7b-note': 'cert-only',
  'sst-note': 'cert-only',
  'pfx-note': 'with-key',
  'password-note': 'with-key',
}
// 곁말이 들어가는 그룹. 공개 인증서 형식의 곁말은 그 박스 안에, .pfx의 곁말은 박스 밖에 놓인다.
const noteGroup: Record<string, string | null> = {
  'cer-note': 'public', 'p7b-note': 'public', 'sst-note': 'public', 'pfx-note': null, 'password-note': null,
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
// 노드마다 들어가는 그룹. .pfx만 어느 박스에도 들지 않는다.
const groupOf: Record<string, string | null> = {
  cert: 'manager', key: 'manager', cer: 'public', p7b: 'public', sst: 'public', pfx: null,
}

// 모두 시나리오에서만 보이는 화살표다.
const tallPaths: Record<string, string> = {
  'cert-public': 'M70 62 V96',
  'cert-pfx': 'M124 62 V84 H196 V116',
  'key-pfx': 'M220 62 V116',
}
const widePaths: Record<string, string> = {
  'cert-public': 'M140 46 H200',
  'cert-pfx': 'M140 56 H168 V164 H232 V176',
  'key-pfx': 'M78 116 V192 H216',
}
// 선마다 [시작 노드, 끝]. 공개 인증서로 가는 선은 노드가 아니라 공개 인증서만 담는 형식 박스의 변에서 끝난다.
const ends: Record<string, [string, { node: string } | { group: string }]> = {
  'cert-public': ['cert', { group: 'public' }],
  'cert-pfx': ['cert', { node: 'pfx' }],
  'key-pfx': ['key', { node: 'pfx' }],
}

const question = '인증서를 내보낼 때 어느 파일에 개인 키까지 담길까?'
const figureName = '인증서 관리자에 든 user01의 인증서와 개인 키를 파일로 내보낼 때, .cer·.p7b·.sst 파일에는 공개 인증서만 담기고 .pfx 파일에만 개인 키까지 담기는 것을 보이는 도식'
const svgName = '인증서 관리자 박스 안에 user01의 인증서와 개인 키가 있고, 공개 인증서만 담는 형식 박스 안에 .cer·.p7b·.sst가, 그 밖에 .pfx가 있는 그림'
const idleCaption = '인증서 관리자에 든 user01의 인증서와 개인 키, 그리고 인증서를 내보낼 수 있는 파일 형식 넷을 두었다. 버튼을 고르면 어느 형식에 무엇이 담기는지 볼 수 있다.'
const legend = '화살표는 인증서를 내보낼 때 그 파일에 담기는 것을 가리킨다. 박스 둘은 인증서 관리자와, 공개 인증서만 담는 형식이다.'
const expectedScenarios = [
  {
    id: 'cert-only', label: '인증서만',
    nodes: ['cert', 'cer', 'p7b', 'sst'], paths: ['cert-public'],
    caption: '공개 인증서만 담는 세 형식이다. .cer 파일은 공개 인증서 하나를, .p7b 파일과 .sst 파일은 인증서 하나 이상을 담는다. 셋 모두 개인 키는 담지 않으므로 개인 키의 백업이 되지 못한다.',
  },
  {
    id: 'with-key', label: '개인 키까지',
    nodes: ['cert', 'key', 'pfx'], paths: ['cert-pfx', 'key-pfx'],
    caption: '개인 정보 교환 파일인 .pfx 파일은 인증서와 함께 짝인 개인 키까지 담는다. 개인 키를 손에 넣은 사람은 주인처럼 서명하거나 데이터를 풀 수 있으므로, 내보낼 때 암호로 보호한다.',
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

const endsAt = (point: { x: number, y: number }) => nodeIds.filter((id) => onEdge(point.x, point.y, nodeBox(id)))
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 220] : [0, 0, 280, 256]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<CertificateFilesDiagram />)
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
    const { container } = render(<CertificateFilesDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<CertificateFilesDiagram />)
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
    render(<CertificateFilesDiagram />)
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
      for (const group of groupIds) {
        if (groupOf[id] === group) expect(contains(groupBox(group), nodeBox(id)), `${id} ⊂ ${group}`).toBe(true)
        else expect(overlaps(groupBox(group), nodeBox(id)), `${id} ↔ ${group}`).toBe(false)
      }
    }
    for (const group of groupIds) {
      for (const other of groupIds.filter((otherId) => otherId !== group)) expect(overlaps(groupBox(group), groupBox(other)), `${group} ↔ ${other}`).toBe(false)
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
        for (const group of groupIds) {
          if (noteGroup[id] === group) expect(contains(groupBox(group), box), `${id} ⊂ ${group}`).toBe(true)
          else expect(overlaps(box, groupBox(group)), `${id} ↔ ${group}`).toBe(false)
        }
        for (const other of groupTexts) expect(overlaps(box, other), `${id} ↔ ${other.id}`).toBe(false)
        return box
      })
      for (const [index, box] of noteTexts.entries()) {
        for (const other of noteTexts.slice(index + 1)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
      }
      for (const box of [...noteTexts, ...groupTexts]) {
        expect(box.x, box.id).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width, box.id).toBeLessThanOrEqual(viewBox[2])
        expect(box.y, box.id).toBeGreaterThanOrEqual(0)
        expect(box.y + box.height, box.id).toBeLessThanOrEqual(viewBox[3])
        for (const d of Object.values(paths)) {
          for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
        }
      }
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('선의 양 끝은 노드나 박스의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<CertificateFilesDiagram />)
    for (const [id, d] of Object.entries(paths)) {
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
      const { start, end } = lineEnds(d)
      const [from, to] = ends[id]
      expect(endsAt(start), `${id} 시작`).toEqual([from])
      if ('node' in to) {
        expect(endsAt(end), `${id} 끝`).toEqual([to.node])
      } else {
        expect(endsAt(end), `${id} 끝`).toEqual([])
        expect(onEdge(end.x, end.y, groupBox(to.group)), `${id} 끝 ⊂ ${to.group} 변`).toBe(true)
      }
    }
  })

  // 요점: 개인 키 노드에서 나가는 화살표는 .pfx에서만 끝난다. 인증서만에서는 개인 키와 .pfx가 흐리고,
  // 인증서의 화살표는 .cer·.p7b·.sst를 담은 공개 인증서만 담는 형식 박스에 닿는다. .pfx는 그 박스 밖이다.
  it('개인 키는 .pfx로만 가고, 공개 인증서만 담는 형식 박스에는 개인 키가 닿지 않는다', async () => {
    render(<CertificateFilesDiagram />)
    const fromKey = Object.keys(paths).filter((id) => ends[id][0] === 'key')
    expect(fromKey).toEqual(['key-pfx'])
    for (const id of fromKey) expect(endsAt(lineEnds(paths[id]).end)).toEqual(['pfx'])
    for (const segment of segments(paths['key-pfx'])) expect(touches(segment, groupBox('public'))).toBe(false)
    for (const id of ['cer', 'p7b', 'sst']) expect(contains(groupBox('public'), nodeBox(id)), id).toBe(true)
    expect(overlaps(groupBox('public'), nodeBox('pfx'))).toBe(false)

    await select('인증서만')
    for (const id of ['key', 'pfx']) expect(opacityOf(id), id).toBe('0.25')
    for (const id of shownPaths()) expect(ends[id][0], id).toBe('cert')

    await select('개인 키까지')
    for (const id of ['cer', 'p7b', 'sst']) expect(opacityOf(id), id).toBe('0.25')
    for (const id of shownPaths()) expect(endsAt(lineEnds(paths[id]).end), id).toEqual(['pfx'])

    const body = anchorConcept().paragraphs.join('\n').replace(/`/gu, '')
    for (const id of nodeIds) expect(body, id).toContain(label(id))
    for (const id of groupIds) expect(body, id).toContain(groupLabels[id])
    for (const id of Object.keys(noteLabels)) expect(body, id).toContain(noteLabels[id])
  })
}

describe('CertificateFilesDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<CertificateFilesDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 256')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('개인 키까지')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 220')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '개인 키까지' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><CertificateFilesDiagram /><CertificateFilesDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '개인 키까지' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<CertificateFilesDiagram />)
    const text = visualsByTopicId[topicId].diagrams['certificate-files']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(certificateFilesScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = certificateFilesScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 인증서와 인증서 관리자 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
