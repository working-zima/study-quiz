import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { PowerShellCommandsDiagram, powerShellCommandsScenarios } from './PowerShellCommandsDiagram'

const topicId = 'windows-admin-tools'
const anchorConceptId = `${topicId}.powershell`
const labels: Record<string, string> = {
  verb: 'Get',
  noun: 'ChildItem',
  'in-dir': 'dir',
  'in-ipconfig': 'ipconfig',
  'in-lower': 'get-service',
  'in-upper': 'Get-Service',
  'run-gci': 'Get-ChildItem',
  'run-ipconfig': 'ipconfig.exe',
  'run-gsv': 'Get-Service',
}
const groupLabels: Record<string, string> = {
  'cmdlet-name': 'cmdlet 이름',
  typed: '입력한 이름',
  runs: '실행되는 것',
}
const noteLabels: Record<string, string> = {
  'verb-note': '동사',
  'noun-note': '명사',
  'alias-note': '별칭',
  'native-note': '실행 파일',
  'case-note': '대소문자와 관계없다',
}
const noteScenario: Record<string, string> = {
  'verb-note': 'cmdlet',
  'noun-note': 'cmdlet',
  'alias-note': 'alias',
  'native-note': 'native',
  'case-note': 'case',
}
// 곁말이 들어가는 그룹. 별칭 곁말만 두 박스 사이, 화살표 위에 놓인다.
const noteGroup: Record<string, string | null> = {
  'verb-note': 'cmdlet-name',
  'noun-note': 'cmdlet-name',
  'alias-note': null,
  'native-note': 'runs',
  'case-note': 'runs',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
// 노드마다 들어가는 그룹.
const groupOf: Record<string, string | null> = {
  verb: 'cmdlet-name', noun: 'cmdlet-name',
  'in-dir': 'typed', 'in-ipconfig': 'typed', 'in-lower': 'typed', 'in-upper': 'typed',
  'run-gci': 'runs', 'run-ipconfig': 'runs', 'run-gsv': 'runs',
}

// 모두 시나리오에서만 보이는 화살표다.
const tallPaths: Record<string, string> = {
  alias: 'M112 120 H152',
  native: 'M112 168 H152',
  'case-lower': 'M112 216 H132 V232 H152',
  'case-upper': 'M112 264 H132 V248 H152',
}
const widePaths: Record<string, string> = {
  alias: 'M264 44 H304',
  native: 'M264 92 H304',
  'case-lower': 'M264 140 H284 V156 H304',
  'case-upper': 'M264 188 H284 V172 H304',
}
// 선마다 [시작 노드, 끝 노드].
const ends: Record<string, [string, string]> = {
  alias: ['in-dir', 'run-gci'],
  native: ['in-ipconfig', 'run-ipconfig'],
  'case-lower': ['in-lower', 'run-gsv'],
  'case-upper': ['in-upper', 'run-gsv'],
}

const question = 'PowerShell에 적은 이름은 무엇을 실행할까?'
const figureName = 'PowerShell에서 cmdlet 이름은 동사와 명사를 하이픈으로 이은 꼴이고, dir은 별칭으로 Get-ChildItem을, ipconfig는 실행 파일 ipconfig.exe를 실행하며, get-service와 Get-Service는 대소문자와 관계없이 같은 cmdlet을 실행한다는 것을 보이는 도식'
const svgName = '동사와 명사로 나눈 cmdlet 이름이 있고, 입력한 이름 박스의 이름들이 실행되는 것 박스의 cmdlet과 실행 파일로 이어지는 그림'
const idleCaption = 'cmdlet 이름 하나를 동사와 명사로 나눠 두고, 입력한 이름과 그 이름으로 실행되는 것을 나란히 두었다. 버튼을 고르면 이름마다 무엇이 실행되는지 볼 수 있다.'
const legend = '화살표는 입력한 이름에서 실제로 실행되는 것을 가리킨다.'
const expectedScenarios = [
  {
    id: 'cmdlet', label: 'cmdlet',
    nodes: ['verb', 'noun'], paths: [] as string[],
    caption: 'cmdlet 이름은 동작을 나타내는 동사와 그 대상을 나타내는 명사를 하이픈으로 잇는다. Get-ChildItem은 동사 Get과 명사 ChildItem으로 되어 있어, 폴더 같은 위치를 주면 그 안의 항목을 가져온다.',
  },
  {
    id: 'alias', label: '별칭',
    nodes: ['in-dir', 'run-gci'], paths: ['alias'],
    caption: 'dir은 Get-ChildItem에 붙인 다른 이름, 곧 별칭이다. PowerShell 창에 dir을 입력하면 별칭이 가리키는 cmdlet Get-ChildItem이 실행되어 지금 위치 안의 항목을 보여 준다.',
  },
  {
    id: 'native', label: '실행 파일',
    nodes: ['in-ipconfig', 'run-ipconfig'], paths: ['native'],
    caption: 'ipconfig는 운영 체제에 설치된 실행 파일 ipconfig.exe다. PowerShell 창에서도 명령 프롬프트에서처럼 이름을 입력하면 그 실행 파일이 실행된다.',
  },
  {
    id: 'case', label: '대소문자',
    nodes: ['in-lower', 'in-upper', 'run-gsv'], paths: ['case-lower', 'case-upper'],
    caption: 'Windows에서 PowerShell은 cmdlet 이름의 대소문자를 가리지 않는다. get-service로 적든 Get-Service로 적든 같은 cmdlet Get-Service가 실행되어 서비스 목록을 가져온다.',
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

// 두 선분이 서로 만나는가(가로와 세로가 엇갈리거나, 같은 줄에서 겹친다).
function meets(a: Segment, b: Segment) {
  return touches(a, { id: '', x: Math.min(b.x1, b.x2), y: Math.min(b.y1, b.y2), width: Math.abs(b.x2 - b.x1), height: Math.abs(b.y2 - b.y1) })
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 224] : [0, 0, 280, 296]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<PowerShellCommandsDiagram />)
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
    const { container } = render(<PowerShellCommandsDiagram />)
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
    const { container } = render(<PowerShellCommandsDiagram />)
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
    render(<PowerShellCommandsDiagram />)
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

  it('선의 양 끝은 노드의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨, 다른 선을 지나지 않는다', () => {
    render(<PowerShellCommandsDiagram />)
    for (const [id, d] of Object.entries(paths)) {
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
      const { start, end } = lineEnds(d)
      expect(endsAt(start), `${id} 시작`).toEqual([ends[id][0]])
      expect(endsAt(end), `${id} 끝`).toEqual([ends[id][1]])
      for (const [otherId, otherD] of Object.entries(paths).filter(([other]) => other !== id)) {
        for (const segment of segments(d)) {
          for (const other of segments(otherD)) expect(meets(segment, other), `${id} ↔ ${otherId}`).toBe(false)
        }
      }
    }
  })

  // 요점: cmdlet의 동사·명사 조각은 빈틈없이 맞닿고, 하이픈으로 이으면 본문의 cmdlet 이름(실행되는 것 박스의 Get-ChildItem)이 된다.
  // 별칭의 화살표는 입력한 이름 박스의 dir에서 나와 실행되는 것 박스의 Get-ChildItem에서 끝난다.
  // 대소문자에서 보이는 두 화살표는 대소문자만 다른 두 이름에서 나와 같은 cmdlet 노드에서 끝난다.
  it('조각을 이으면 cmdlet 이름이 되고, dir은 Get-ChildItem으로, 대소문자만 다른 두 이름은 같은 cmdlet으로 간다', async () => {
    render(<PowerShellCommandsDiagram />)
    const body = anchorConcept().paragraphs.join('\n')

    await select('cmdlet')
    const verb = nodeBox('verb')
    const noun = nodeBox('noun')
    expect(verb.x + verb.width).toBe(noun.x)
    expect(verb.y).toBe(noun.y)
    const joined = `${label('verb')}-${label('noun')}`
    expect(joined).toBe(label('run-gci'))
    expect(body).toContain(`\`${joined}\``)
    expect(body).toContain(`동사 \`${label('verb')}\``)
    expect(body).toContain(`명사 \`${label('noun')}\``)
    for (const [noteId, nodeId] of [['verb-note', 'verb'], ['noun-note', 'noun']] as const) {
      const box = textBox(note(noteId)!, noteId)
      const piece = nodeBox(nodeId)
      expect(box.x, noteId).toBeGreaterThanOrEqual(piece.x)
      expect(box.x + box.width, noteId).toBeLessThanOrEqual(piece.x + piece.width)
      expect(box.y, noteId).toBeGreaterThanOrEqual(piece.y + piece.height)
    }

    await select('별칭')
    const alias = lineEnds(paths[shownPaths()[0]])
    expect(endsAt(alias.start)).toEqual(['in-dir'])
    expect(endsAt(alias.end)).toEqual(['run-gci'])
    expect(contains(groupBox('typed'), nodeBox('in-dir'))).toBe(true)
    expect(contains(groupBox('runs'), nodeBox('run-gci'))).toBe(true)
    expect(body).toContain(`\`${label('in-dir')}\`을 입력하면 \`${label('run-gci')}\``)

    await select('실행 파일')
    const native = lineEnds(paths[shownPaths()[0]])
    expect(endsAt(native.start)).toEqual(['in-ipconfig'])
    expect(endsAt(native.end)).toEqual(['run-ipconfig'])
    expect(body).toContain(`실행 파일 \`${label('run-ipconfig')}\``)

    await select('대소문자')
    expect(shownPaths()).toHaveLength(2)
    const targets = shownPaths().map((id) => endsAt(lineEnds(paths[id]).end))
    expect(targets).toEqual([['run-gsv'], ['run-gsv']])
    const starts = shownPaths().map((id) => endsAt(lineEnds(paths[id]).start)[0])
    const names = starts.map(label)
    expect(names[0]).not.toBe(names[1])
    expect(names[0].toLowerCase()).toBe(names[1].toLowerCase())
    for (const name of names) expect(body).toContain(`\`${name}\``)
    expect(body).toContain('대소문자와 관계없이')
  })
}

describe('PowerShellCommandsDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<PowerShellCommandsDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 296')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('대소문자')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 224')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '대소문자' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><PowerShellCommandsDiagram /><PowerShellCommandsDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '대소문자' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<PowerShellCommandsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['powershell-commands']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(powerShellCommandsScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = powerShellCommandsScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 PowerShell 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = anchorConcept()
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(within(figure).queryByRole('heading')).toBeNull()
  })
})
