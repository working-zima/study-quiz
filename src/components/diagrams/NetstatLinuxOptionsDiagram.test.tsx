import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { NetstatLinuxOptionsDiagram, netstatLinuxOptionsScenarios } from './NetstatLinuxOptionsDiagram'

const topicId = 'diagnostic-commands'
const anchorConceptId = `${topicId}.netstat-linux-options`
const labels: Record<string, string> = {
  'command': 'netstat -antp',
  'opt-a': '-a',
  'opt-n': '-n',
  'opt-t': '-t',
  'opt-p': '-p',
  'win-p': '-p',
  'r-proto': '프로토콜: tcp',
  'r-local': '로컬 주소: 198.51.100.10:22',
  'r-state': '상태: LISTEN',
  'r-prog': 'PID/Program name: 812/sshd',
}
const groupLabels: Record<string, string> = {
  'linux': 'Linux의 netstat',
  'windows': 'Windows의 netstat',
  'result': '결과의 한 줄',
}
const noteLabels: Record<string, string> = {
  'a-note': '모두 보기',
  'n-note': '숫자로 보기',
  't-note': 'TCP만 보기',
  'p-note': '프로그램 보기',
  'tcp-note': '시간이 아니라 TCP',
  'p-diff-note': '프로그램 보기',
  'win-p-note': '프로토콜 고르기',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
const optionIds = ['opt-a', 'opt-n', 'opt-t', 'opt-p']
const resultIds = ['r-proto', 'r-local', 'r-state', 'r-prog']
const groupOf = (id: string) => (id.startsWith('opt-') ? 'linux' : id === 'win-p' ? 'windows' : id.startsWith('r-') ? 'result' : null)
// 곁말이 설명하는 칸. 곁말은 그 칸과 같은 줄의 오른쪽에 놓인다.
const noteNode: Record<string, string> = {
  'a-note': 'opt-a',
  'n-note': 'opt-n',
  't-note': 'opt-t',
  'p-note': 'opt-p',
  'tcp-note': 'opt-t',
  'p-diff-note': 'opt-p',
  'win-p-note': 'win-p',
}
// 화살표는 옵션 칸에서 그 옵션이 채우는 결과 칸으로 간다.
const pathEnds: Record<string, [string, string]> = {
  't-proto': ['opt-t', 'r-proto'],
  'p-prog': ['opt-p', 'r-prog'],
}
const tallPaths: Record<string, string> = {
  't-proto': 'M16 172 H10 V348 H16',
  'p-prog': 'M16 212 H10 V468 H16',
}
const widePaths: Record<string, string> = {
  't-proto': 'M16 172 H10 V348 H16',
  'p-prog': 'M16 212 H10 V468 H16',
}

const question = 'netstat -antp는 어떻게 읽을까?'
const figureName = 'Linux 서버 198.51.100.10에서 netstat -antp를 옵션 -a·-n·-t·-p로 나눠 읽고, sshd가 22번 포트로 기다리는 줄에 812/sshd가 붙는 것과 Windows의 -p가 하는 일을 견주는 도식'
const svgName = '위에 netstat -antp를, 그 아래에 Linux 옵션 넷과 Windows의 -p를 차례로, 맨 아래에 결과의 한 줄을 칸마다 쌓은 그림'
const idleCaption = 'Linux 서버 198.51.100.10에서 netstat -antp를 입력한 옵션을 하나씩 나누고, 그 결과 가운데 sshd가 22번 포트로 기다리는 줄을 칸마다 놓았다. 버튼을 고르면 옵션의 뜻과 Windows의 -p와 다른 점을 볼 수 있다.'
const legend = '위 박스의 칸이 Linux netstat의 옵션이고, 그 아래 박스는 Windows netstat의 같은 글자 옵션이다. 맨 아래 박스는 결과의 한 줄에서 프로토콜·로컬 주소·상태·PID/Program name 칸을 골라 차례로 쌓은 것이다.'
const expectedScenarios = [
  {
    id: 'read', label: '읽기',
    nodes: ['command', 'opt-a', 'opt-n', 'opt-t', 'opt-p', 'r-proto', 'r-local', 'r-state', 'r-prog'], paths: ['p-prog'], notes: ['a-note', 'n-note', 't-note', 'p-note'],
    caption: 'netstat -antp는 a(모두 보기)·n(숫자로 보기)·t(TCP만 보기)·p(프로그램 보기)를 이은 것이다. 연결을 기다리는 것까지 TCP의 소켓을 모두 숫자로, 그것을 가진 프로그램과 함께 보여, 22번 포트로 기다리는 줄에 812/sshd가 붙는다.',
  },
  {
    id: 'tcp', label: '-t',
    nodes: ['command', 'opt-t', 'r-proto'], paths: ['t-proto'], notes: ['tcp-note'],
    caption: '-t는 시간에 관한 옵션이 아니라 TCP의 소켓만 고르는 옵션이다. 그래서 결과 줄의 프로토콜 칸이 tcp다. 소켓의 타이머 정보를 더하는 옵션은 -o(--timers)다.',
  },
  {
    id: 'p-differs', label: '-p 견주기',
    nodes: ['opt-p', 'win-p'], paths: [] as string[], notes: ['p-diff-note', 'win-p-note'],
    caption: '같은 -p라도 Linux에서는 소켓마다 그것을 가진 프로그램을 보이고, Windows에서는 뒤에 적은 프로토콜의 연결만 고른다. Windows에서 프로그램을 보려면 -o나 -b를 쓴다.',
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
const value = (id: string) => label(id).split(': ')[1]
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

const body = () => topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')

function layoutTests(wide: boolean) {
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 500] : [0, 0, 280, 500]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<NetstatLinuxOptionsDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 칸이 모두 선명하고 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<NetstatLinuxOptionsDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 칸·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<NetstatLinuxOptionsDiagram />)
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
    render(<NetstatLinuxOptionsDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const [a, b] of [['linux', 'windows'], ['linux', 'result'], ['windows', 'result']]) expect(overlaps(groupBox(a), groupBox(b)), `${a} ↔ ${b}`).toBe(false)
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      const group = groupOf(id)
      if (group) expect(contains(groupBox(group), nodeBox(id)), `${id} ⊂ ${group}`).toBe(true)
      else for (const other of groupIds) expect(overlaps(groupBox(other), nodeBox(id)), `${id} ↔ ${other}`).toBe(false)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    for (const id of groupIds) {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
    }
    // 곁말은 자기가 설명하는 칸과 같은 박스 안, 그 칸의 오른쪽에 놓이고 칸·그룹 라벨·선과 겹치지 않는다.
    const noteBoxes: SvgBox[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of scenario.notes) noteBoxes.push(textBox(note(id), id))
    }
    expect(noteBoxes.map(({ id }) => id)).toEqual(noteIds)
    for (const box of noteBoxes) {
      const target = nodeBox(noteNode[box.id])
      expect(contains(groupBox(groupOf(noteNode[box.id])!), box), box.id).toBe(true)
      expect(box.x, box.id).toBeGreaterThan(target.x + target.width)
      expect(box.y >= target.y && box.y + box.height <= target.y + target.height, box.id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
      for (const group of groupIds) expect(overlaps(box, groupLabelBox(group)), `${box.id} ↔ ${group} 라벨`).toBe(false)
      for (const [pathId, d] of Object.entries(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ ${pathId}`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 옵션 칸의 변에서 시작해 결과 칸의 변에서 끝나고, 칸 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<NetstatLinuxOptionsDiagram />)
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

  // 요점: 옵션 칸을 위에서부터 이으면 antp다. 「읽기」에서 선명한 결과 줄에 812와 sshd가 있다.
  // 「-p 견주기」에서 선명한 두 칸의 곁말이 서로 다르고(프로그램·프로토콜), 「-t」의 곁말에 TCP가 있다.
  it('옵션 칸을 이으면 antp이고, 결과 줄에 812/sshd가 붙으며, 두 운영체제의 -p는 곁말이 다르다', async () => {
    render(<NetstatLinuxOptionsDiagram />)
    const letters = [...optionIds].sort((a, b) => nodeBox(a).y - nodeBox(b).y).map((id) => label(id).replace(/^-/u, '')).join('')
    expect(letters).toBe('antp')
    expect(label('command')).toBe(`netstat -${letters}`)
    expect([...resultIds].sort((a, b) => nodeBox(a).y - nodeBox(b).y).map((id) => label(id).split(': ')[0])).toEqual(['프로토콜', '로컬 주소', '상태', 'PID/Program name'])

    await select('읽기')
    const shown = resultIds.filter((id) => opacity(id) === '1').map(label).join(' ')
    expect(shown).toContain('812')
    expect(shown).toContain('sshd')
    expect(value('r-local')).toMatch(/:22$/u)
    expect(value('r-state')).toBe('LISTEN')

    await select('-t')
    expect(note('tcp-note').textContent).toContain('TCP')
    expect(value('r-proto')).toBe('tcp')

    await select('-p 견주기')
    expect(nodeIds.filter((id) => opacity(id) === '1')).toEqual(['opt-p', 'win-p'])
    expect(label('opt-p')).toBe(label('win-p'))
    const linuxNote = note('p-diff-note').textContent!
    const windowsNote = note('win-p-note').textContent!
    expect(linuxNote).not.toBe(windowsNote)
    expect(linuxNote).toContain('프로그램')
    expect(windowsNote).toContain('프로토콜')
    // Windows의 -p는 Windows 박스 안에, Linux의 -p는 Linux 박스 안에 있다.
    expect(contains(groupBox('windows'), nodeBox('win-p'))).toBe(true)
    expect(contains(groupBox('linux'), nodeBox('opt-p'))).toBe(true)

    // 본문이 같은 명령과 값으로 읽는다.
    const text = body()
    for (const phrase of ['`netstat -antp`', '`198.51.100.10:22`', '`812/sshd`', '`LISTEN`', '시간이 아니라 TCP', '`/etc/services`']) expect(text, phrase).toContain(phrase)
  })
}

describe('NetstatLinuxOptionsDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('칸·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<NetstatLinuxOptionsDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 500')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('읽기')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 500')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '읽기' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><NetstatLinuxOptionsDiagram /><NetstatLinuxOptionsDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '읽기' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<NetstatLinuxOptionsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['netstat-linux-options']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(netstatLinuxOptionsScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = netstatLinuxOptionsScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 Linux netstat의 옵션 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
