import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { Pop3DownloadDiagram, pop3DownloadScenarios } from './Pop3DownloadDiagram'

const topicId = 'app-protocols-mail-file'
const anchorConceptId = `${topicId}.pop3`
const labels: Record<string, string> = {
  'mail1-server': '1번 메일',
  'mail2-server': '2번 메일',
  'mail1-laptop': '1번 메일',
  'mail2-laptop': '2번 메일',
  'mailbox-after': 'QUIT 뒤의 메일함',
  phone: '휴대폰',
}
const groupLabels: Record<string, string> = { 'server-before': '처음의 메일함', laptop: '노트북' }
const noteLabels: Record<string, string> = {
  'retr-note': 'RETR',
  'quit-note': 'QUIT · 지워짐',
  'empty-note': '두 통이 없다',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
const serverMails = ['mail1-server', 'mail2-server']
const laptopMails = ['mail1-laptop', 'mail2-laptop']

const tallPaths: Record<string, string> = {
  download: 'M124 64 H164',
  delete: 'M66 120 V168',
  open: 'M164 184 H124',
}
const widePaths: Record<string, string> = {
  download: 'M184 40 H256',
  delete: 'M96 72 V120',
  open: 'M288 136 H152',
}
// 경로마다 출발과 도착. 노드의 변이거나 그룹 박스의 변이다.
const ends: Record<string, [string, string]> = {
  download: ['server-before', 'laptop'],
  delete: ['server-before', 'mailbox-after'],
  open: ['phone', 'mailbox-after'],
}

const question = 'POP3로 받은 메일은 어디에 남을까?'
const figureName = 'user2의 노트북이 POP3로 mail.example.net의 메일함에서 메일 두 통을 내려받고, QUIT 뒤 서버가 그 메일을 지워 휴대폰으로 접속해도 메일함이 비어 있는 것을 보이는 도식'
const svgName = '왼쪽 위 처음의 메일함 박스에 1번 메일과 2번 메일, 오른쪽 위 노트북 박스에 내려받은 1번 메일과 2번 메일, 왼쪽 아래에 QUIT 뒤의 메일함, 오른쪽 아래에 휴대폰을 둔 그림'
const idleCaption = '왼쪽은 mail.example.net에 있는 user2의 메일함이다. 위는 노트북이 접속하기 전, 아래는 노트북이 QUIT로 대화를 마친 뒤의 모습이다. 오른쪽은 user2의 두 기기다. 버튼을 고르면 메일이 어디로 가고 어디에 남는지 차례대로 볼 수 있다.'
const legend = '박스 하나가 메일함이나 기기 하나이고, 박스 안의 노드가 그 안에 든 메일이다. 화살표는 메일이 옮겨 가거나 기기가 메일함에 접속하는 방향이고, 곁의 글은 그때 보내는 명령이나 그 결과다.'
const expectedScenarios = [
  {
    id: 'download', label: '① 내려받기',
    nodes: ['mail1-server', 'mail2-server', 'mail1-laptop', 'mail2-laptop'], paths: ['download'], notes: ['retr-note'],
    caption: '노트북의 메일 클라이언트가 USER와 PASS로 사용자 확인을 마친 뒤, RETR로 1번과 2번 메일을 내려받아 노트북에 저장한다. 이어서 DELE로 두 메일에 지우기 표시를 하지만, 서버의 메일은 아직 그대로 있다.',
  },
  {
    id: 'delete', label: '② 지우기',
    nodes: ['mailbox-after', 'mail1-laptop', 'mail2-laptop'], paths: ['delete'], notes: ['quit-note'],
    caption: '노트북이 QUIT를 보내면 서버가 지우기 표시가 된 1번과 2번 메일을 메일함에서 지우고 연결을 닫는다. 이제 두 통은 노트북에만 있고, 서버의 메일함은 비었다.',
  },
  {
    id: 'other-device', label: '③ 다른 기기',
    nodes: ['mailbox-after', 'phone'], paths: ['open'], notes: ['empty-note'],
    caption: '그 뒤 user2가 휴대폰으로 같은 메일함에 접속해도 메일함이 비어 있어 두 통을 볼 수 없다. POP3로 내려받고 서버에서 지운 메일은 내려받은 기기에만 있다.',
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
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)!
const brightNodes = () => nodeIds.filter((id) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
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

// 선분이 상자 안쪽을 지나는가. 변에 닿기만 하는 것은 세지 않는다.
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

const endAt = (point: { x: number, y: number }) => nodeIds.find((id) => onEdge(point.x, point.y, nodeBox(id)))
  ?? groupIds.find((id) => onEdge(point.x, point.y, groupBox(id)))
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 176] : [0, 0, 280, 224]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<Pop3DownloadDiagram />)
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
    const { container } = render(<Pop3DownloadDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<Pop3DownloadDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownPaths()).toEqual(scenario.paths)
    expect(shownNotes()).toEqual(scenario.notes)
    for (const id of scenario.notes) expect(note(id).textContent).toBe(noteLabels[id])
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

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말·그룹 라벨이 자리에 들어간다`, async () => {
    render(<Pop3DownloadDiagram />)
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
    // 서버의 메일 두 통은 처음의 메일함 박스 안에, 내려받은 두 통은 노트북 박스 안에 있다. 나머지 노드는 두 박스 밖이다.
    for (const id of serverMails) expect(contains(groupBox('server-before'), nodeBox(id)), id).toBe(true)
    for (const id of laptopMails) expect(contains(groupBox('laptop'), nodeBox(id)), id).toBe(true)
    for (const id of ['mailbox-after', 'phone']) {
      for (const group of groupIds) expect(overlaps(nodeBox(id), groupBox(group)), `${id} ↔ ${group}`).toBe(false)
    }
    expect(overlaps(groupBox('server-before'), groupBox('laptop'))).toBe(false)
    const groupTexts = groupIds.map((id) => {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
      return box
    })
    // 곁말은 시나리오를 골랐을 때만 보이므로, 시나리오를 차례로 골라 모두 잰다.
    const noteTexts: SvgBox[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of scenario.notes) {
        expect(note(id)).toHaveAttribute('font-size', '9')
        expect(note(id)).toHaveClass('fill-muted')
        noteTexts.push(textBox(note(id), id))
      }
    }
    expect(noteTexts.map(({ id }) => id)).toEqual(noteIds)
    for (const box of [...groupTexts, ...noteTexts]) {
      expect(box.x, box.id).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width, box.id).toBeLessThanOrEqual(viewBox[2])
      expect(box.y, box.id).toBeGreaterThanOrEqual(0)
      expect(box.y + box.height, box.id).toBeLessThanOrEqual(viewBox[3])
      for (const d of Object.values(paths)) {
        for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
      }
    }
    for (const box of noteTexts) {
      for (const id of nodeIds) expect(overlaps(box, nodeBox(id)), `${box.id} ↔ ${id}`).toBe(false)
      for (const group of groupIds) expect(overlaps(box, groupBox(group)), `${box.id} ↔ ${group}`).toBe(false)
    }
    for (let i = 0; i < noteTexts.length; i += 1) {
      for (const other of noteTexts.slice(i + 1)) expect(overlaps(noteTexts[i], other), `${noteTexts[i].id} ↔ ${other.id}`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('경로 양 끝은 노드나 박스의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<Pop3DownloadDiagram />)
    for (const [id, d] of Object.entries(paths)) {
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
      const { start, end } = lineEnds(d)
      expect(endAt(start), `${id} 시작`).toBe(ends[id][0])
      expect(endAt(end), `${id} 끝`).toBe(ends[id][1])
    }
  })

  // 요점: POP3는 메일을 내려받은 뒤 QUIT로 마칠 때 서버에서 지운다. 그래서 메일은 내려받은 노트북에만 남고, 다른 기기는 빈 메일함을 본다.
  it('내려받기는 서버에서 노트북으로 가고, 지우기 뒤에는 서버 쪽 메일이 없으며, 다른 기기에서는 노트북의 메일이 흐리다', async () => {
    render(<Pop3DownloadDiagram />)
    const brightIn = (group: string) => brightNodes().filter((id) => contains(groupBox(group), nodeBox(id)))

    await select('① 내려받기')
    const { start, end } = lineEnds(paths.download)
    expect(endAt(start)).toBe('server-before')
    expect(endAt(end)).toBe('laptop')
    expect(brightIn('server-before')).toEqual(serverMails)
    expect(brightIn('laptop')).toEqual(laptopMails)

    await select('② 지우기')
    expect(brightIn('server-before')).toEqual([])
    for (const id of serverMails) expect(brightNodes(), id).not.toContain(id)
    expect(brightIn('laptop')).toEqual(laptopMails)
    expect(brightNodes()).toContain('mailbox-after')
    expect(label('mailbox-after')).toContain('QUIT')
    expect(note('quit-note').textContent).toContain('지워짐')
    // 지운 뒤의 메일함은 처음의 메일함보다 아래에 있다 — 시간이 위에서 아래로 흐른다.
    expect(nodeBox('mailbox-after').y).toBeGreaterThan(groupBox('server-before').y + groupBox('server-before').height)

    await select('③ 다른 기기')
    for (const id of laptopMails) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', '0.25')
    expect(brightNodes()).toEqual(['mailbox-after', 'phone'])
    expect(endAt(lineEnds(paths.open).start)).toBe('phone')
    expect(endAt(lineEnds(paths.open).end)).toBe('mailbox-after')

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const name of ['`mail.example.net`', '`user2`', '노트북', '휴대폰', '`RETR 1`', '`DELE 1`', '`QUIT`', '`USER user2`', '`PASS`', '1번과 2번']) {
      expect(body, name).toContain(name)
    }
  })
}

describe('Pop3DownloadDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 경로 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<Pop3DownloadDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 224')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('② 지우기')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 176')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '② 지우기' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><Pop3DownloadDiagram /><Pop3DownloadDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '① 내려받기' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<Pop3DownloadDiagram />)
    const text = visualsByTopicId[topicId].diagrams['pop3-download']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(pop3DownloadScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = pop3DownloadScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 POP3 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
