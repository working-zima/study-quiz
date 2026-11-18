import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { SmbShareAccessDiagram, smbShareAccessScenarios } from './SmbShareAccessDiagram'

const topicId = 'windows-server-roles'
const anchorConceptId = `${topicId}.file-print-services`
const labels: Record<string, string> = {
  'pc01': 'PC01',
  'smb': 'SMB',
  'tcpip': 'TCP/IP',
  'share-data': '공유 폴더 Data',
  'printer': '공유 프린터',
}
const groupLabels: Record<string, string> = {
  'server': 'SRV01',
}
const noteLabels: Record<string, string> = {
  'unc-note': '\\\\SRV01\\Data',
  'port-note': 'TCP 445번',
  'print-note': '공유 프린터로 인쇄',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
// SRV01 박스 안에는 SRV01이 공유한 두 자원이 있다. PC01과 통신 규칙의 두 칸은 박스 밖에 있다.
const insideServer = ['share-data', 'printer']
const outsideServer = ['pc01', 'smb', 'tcpip']
// 화살표는 앞 노드의 변에서 시작해 뒤 노드의 변에서 끝난다.
const pathEnds: Record<string, [string, string]> = {
  'pc-smb': ['pc01', 'smb'],
  'smb-tcp': ['smb', 'tcpip'],
  'tcp-data': ['tcpip', 'share-data'],
  'tcp-printer': ['tcpip', 'printer'],
}
const tallPaths: Record<string, string> = {
  'pc-smb': 'M140 40 V64',
  'smb-tcp': 'M140 96 V108',
  'tcp-data': 'M120 140 V156 H80 V188',
  'tcp-printer': 'M160 140 V156 H208 V188',
}
const widePaths: Record<string, string> = {
  'pc-smb': 'M72 72 H136',
  'smb-tcp': 'M176 88 V100',
  'tcp-data': 'M216 108 H248 V64 H288',
  'tcp-printer': 'M216 128 H288',
}

const question = '다른 PC는 서버의 공유 폴더와 프린터를 어떻게 쓸까?'
const figureName = 'PC01이 \\\\SRV01\\Data로 SRV01의 공유 폴더 Data를 열 때와 SRV01이 공유한 프린터로 인쇄할 때, 두 컴퓨터 사이의 요청이 TCP/IP 위에서 동작하는 SMB로 오가는 것을 보이는 도식'
const svgName = 'PC01과 SRV01 박스 사이에 SMB 칸과 그 아래 TCP/IP 칸을 쌓고, SRV01 박스 안에 공유 폴더 Data와 공유 프린터를 그린 그림'
const idleCaption = 'PC01이 SRV01의 공유 자원을 쓸 때 두 컴퓨터 사이에 쓰는 통신 규칙을 SMB와 그 아래 TCP/IP로 쌓아 두었다. PC01·SRV01과 공유 이름 Data는 예로 붙인 이름이다. 버튼을 고르면 PC01의 요청이 어느 공유에 닿는지 볼 수 있다.'
const legend = 'SMB 칸이 TCP/IP 칸 위에 놓인 것은 SMB가 TCP/IP 위에서 동작한다는 뜻이다. SRV01 박스 안의 둘은 SRV01이 공유한 자원이고, 화살표는 PC01의 요청이 가는 길이다.'
const expectedScenarios = [
  {
    id: 'file', label: '공유 폴더',
    nodes: ['pc01', 'smb', 'tcpip', 'share-data'], paths: ['pc-smb', 'smb-tcp', 'tcp-data'], notes: ['unc-note', 'port-note'],
    caption: 'PC01에서 \\\\SRV01\\Data를 열면 PC01의 SMB 클라이언트가 SRV01의 TCP 445번 포트로 연결을 맺는다. SMB가 TCP/IP 위에서 요청과 응답을 주고받으므로, PC01은 공유 폴더 Data의 파일을 열어 고치고 그 자리에 저장한다.',
  },
  {
    id: 'print', label: '공유 프린터',
    nodes: ['pc01', 'smb', 'tcpip', 'printer'], paths: ['pc-smb', 'smb-tcp', 'tcp-printer'], notes: ['port-note', 'print-note'],
    caption: 'SRV01이 자기에게 이어진 프린터를 공유하면 PC01도 같은 SMB로 그 공유 프린터에 이어 인쇄한다. SRV01에 인쇄 서버 역할 서비스가 있으면 SRV01은 그 프린터의 인쇄 대기열을 살피다가, 인쇄 작업을 처리하지 못하게 되면 알려 준다.',
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 168] : [0, 0, 280, 236]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<SmbShareAccessDiagram />)
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
    const { container } = render(<SmbShareAccessDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<SmbShareAccessDiagram />)
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
    render(<SmbShareAccessDiagram />)
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
    for (const id of insideServer) expect(contains(groupBox('server'), nodeBox(id)), `${id} ⊂ SRV01`).toBe(true)
    for (const id of outsideServer) expect(overlaps(groupBox('server'), nodeBox(id)), `${id}은 SRV01 밖`).toBe(false)
    for (const id of groupIds) {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
    }
    // 곁말은 viewBox 안에 들어가고, 노드·그룹 라벨·다른 곁말·선과 겹치지 않는다.
    const noteBoxes = new Map<string, SvgBox>()
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of scenario.notes) noteBoxes.set(id, textBox(note(id), id))
    }
    expect([...noteBoxes.keys()].sort()).toEqual([...noteIds].sort())
    for (const box of noteBoxes.values()) {
      expect(boxesOutsideViewBox([box], viewBox), box.id).toEqual([])
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
      for (const group of groupIds) expect(overlaps(box, groupLabelBox(group)), `${box.id} ↔ ${group} 라벨`).toBe(false)
      for (const other of [...noteBoxes.values()].filter(({ id }) => id !== box.id)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
      for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 앞 노드의 변에서 시작해 뒤 노드의 변에서 끝나고, 노드 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<SmbShareAccessDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(pathEnds)))
    for (const [id, d] of Object.entries(paths)) {
      const [from, to] = pathEnds[id]
      const { start, end } = lineEnds(d)
      expect(onEdge(start, nodeBox(from)), `${id} 시작`).toBe(true)
      expect(onEdge(end, nodeBox(to)), `${id} 끝`).toBe(true)
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
    }
  })

  // 요점: 두 시나리오의 끝 노드(공유 폴더 Data / 공유 프린터)가 다르고, 각 끝 노드에는 자기 시나리오의 화살표만 닿는다.
  // 「공유 폴더」에서 SMB와 TCP/IP가 함께 선명하다 — SMB는 TCP/IP 위에서 동작하고, SMB 칸은 TCP/IP 칸 바로 위에 쌓여 있다.
  it('두 시나리오의 끝 노드가 다르고 각각 다른 화살표로만 닿으며, 공유 폴더에서 SMB와 TCP/IP가 함께 선명하다', async () => {
    render(<SmbShareAccessDiagram />)
    const endsOf = (shown: string[]) => shown.filter((id) => insideServer.includes(pathEnds[id][1])).map((id) => pathEnds[id][1])

    await select('공유 폴더')
    const fileShown = shownPaths()
    expect(endsOf(fileShown)).toEqual(['share-data'])
    expect(opacity('smb')).toBe('1')
    expect(opacity('tcpip')).toBe('1')
    expect(opacity('printer')).toBe('0.25')
    // SMB 칸은 TCP/IP 칸 위에 있고, 화살표가 SMB에서 TCP/IP로 내려간다.
    expect(nodeBox('smb').y + nodeBox('smb').height).toBeLessThanOrEqual(nodeBox('tcpip').y)
    expect(nodeBox('smb').x).toBe(nodeBox('tcpip').x)
    expect(fileShown).toContain('smb-tcp')

    await select('공유 프린터')
    const printShown = shownPaths()
    expect(endsOf(printShown)).toEqual(['printer'])
    expect(opacity('share-data')).toBe('0.25')
    expect(overlaps(nodeBox('share-data'), nodeBox('printer'))).toBe(false)
    // 공유 폴더로 가는 화살표와 공유 프린터로 가는 화살표는 서로 다르다.
    expect(fileShown.filter((id) => !printShown.includes(id))).toEqual(['tcp-data'])
    expect(printShown.filter((id) => !fileShown.includes(id))).toEqual(['tcp-printer'])

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const name of ['`SRV01`', '`PC01`', '`Data`', '`\\\\SRV01\\Data`', 'SMB', 'TCP/IP', '`445`', '공유 프린터', '인쇄 대기열']) {
      expect(body, name).toContain(name)
    }
  })
}

describe('SmbShareAccessDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<SmbShareAccessDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 236')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('공유 프린터')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 168')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '공유 프린터' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><SmbShareAccessDiagram /><SmbShareAccessDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '공유 폴더' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<SmbShareAccessDiagram />)
    const text = visualsByTopicId[topicId].diagrams['smb-share-access']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(smbShareAccessScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = smbShareAccessScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 파일 서버와 프린트 서버 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
