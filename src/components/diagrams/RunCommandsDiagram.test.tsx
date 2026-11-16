import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { RunCommandsDiagram, runCommandsScenarios } from './RunCommandsDiagram'

const topicId = 'windows-admin-tools'
const anchorConceptId = `${topicId}.mmc-run-commands`
const rows = ['compmgmt', 'devmgmt', 'gpedit', 'secpol', 'eventvwr', 'certmgr', 'perfmon']
const runLabels: Record<string, string> = {
  compmgmt: 'compmgmt.msc',
  devmgmt: 'devmgmt.msc',
  gpedit: 'gpedit.msc',
  secpol: 'secpol.msc',
  eventvwr: 'eventvwr.msc',
  certmgr: 'certmgr.msc',
  perfmon: 'perfmon',
}
const toolLabels: Record<string, string> = {
  compmgmt: '컴퓨터 관리',
  devmgmt: '장치 관리자',
  gpedit: '로컬 그룹 정책 편집기',
  secpol: '로컬 보안 정책',
  eventvwr: '이벤트 뷰어',
  certmgr: '인증서 관리자',
  perfmon: '성능 모니터',
}
const labels: Record<string, string> = {
  ...Object.fromEntries(rows.map((row) => [`run-${row}`, runLabels[row]])),
  ...Object.fromEntries(rows.map((row) => [`tool-${row}`, toolLabels[row]])),
}
const groupLabels: Record<string, string> = {
  names: '실행 이름',
  tools: 'MMC 안에서 열리는 관리 도구',
}
const noteLabels: Record<string, string> = {
  'perfmon-note': '.msc가 없어도 MMC 안에서 열린다',
}
const noteScenario: Record<string, string> = { 'perfmon-note': 'records' }
const nodeIds = [...rows.map((row) => `run-${row}`), ...rows.map((row) => `tool-${row}`)]
const groupIds = Object.keys(groupLabels)
// 노드마다 들어가는 그룹. 실행 이름은 왼쪽 박스, 관리 도구는 오른쪽 박스에 든다.
const groupOf = (id: string) => (id.startsWith('run-') ? 'names' : 'tools')

// 줄마다 실행 이름에서 그 이름이 여는 도구로 가는 화살표 하나. 시나리오에서만 보인다.
const tallPaths: Record<string, string> = {
  compmgmt: 'M106 44 H130',
  devmgmt: 'M106 84 H130',
  gpedit: 'M106 124 H130',
  secpol: 'M106 164 H130',
  eventvwr: 'M106 204 H130',
  certmgr: 'M106 244 H130',
  perfmon: 'M106 284 H130',
}
const widePaths: Record<string, string> = {
  compmgmt: 'M148 44 H236',
  devmgmt: 'M148 84 H236',
  gpedit: 'M148 124 H236',
  secpol: 'M148 164 H236',
  eventvwr: 'M148 204 H236',
  certmgr: 'M148 244 H236',
  perfmon: 'M148 284 H236',
}
// 선마다 [시작 노드, 끝 노드].
const ends: Record<string, [string, string]> = Object.fromEntries(rows.map((row) => [row, [`run-${row}`, `tool-${row}`]]))

const question = '실행 창에 무엇을 적으면 어느 도구가 열릴까?'
const figureName = '실행 창에 입력하는 실행 이름 compmgmt.msc·devmgmt.msc·gpedit.msc·secpol.msc·eventvwr.msc·certmgr.msc·perfmon이 저마다 컴퓨터 관리·장치 관리자·로컬 그룹 정책 편집기·로컬 보안 정책·이벤트 뷰어·인증서 관리자·성능 모니터를 여는 것을 보이는 도식'
const svgName = '왼쪽 박스에 실행 이름 일곱이 위에서 아래로 있고, 오른쪽 박스에 그 이름이 여는 관리 도구 일곱이 같은 줄에 있는 그림'
const idleCaption = '실행 창에 입력하는 실행 이름 일곱과, 그 이름이 여는 관리 도구를 같은 줄에 두었다. 일곱 도구는 모두 MMC 안에서 열린다. 버튼을 고르면 어떤 이름이 어느 도구를 여는지 볼 수 있다.'
const legend = '왼쪽 박스는 실행 창에 입력하는 실행 이름이고, 오른쪽 박스는 그 이름이 여는 관리 도구다. 화살표는 실행 이름에서 그 이름이 여는 도구로 간다.'
const pairNodes = (...pairs: string[]) => pairs.flatMap((row) => [`run-${row}`, `tool-${row}`])
const expectedScenarios = [
  {
    id: 'system', label: '컴퓨터와 장치',
    nodes: pairNodes('compmgmt', 'devmgmt'), paths: ['compmgmt', 'devmgmt'],
    caption: 'compmgmt.msc는 이벤트 뷰어·장치 관리자 같은 관리 도구 여럿을 한 콘솔에 모아 둔 컴퓨터 관리를 연다. devmgmt.msc는 장치마다 종류·상태와 드라이버 정보를 보여 주는 장치 관리자를 연다.',
  },
  {
    id: 'policy', label: '정책',
    nodes: pairNodes('gpedit', 'secpol'), paths: ['gpedit', 'secpol'],
    caption: 'gpedit.msc는 그 컴퓨터 한 대에 걸리는 정책을 고치는 로컬 그룹 정책 편집기를 연다. secpol.msc는 암호 정책·계정 잠금 정책 같은 보안 설정을 모아 둔 로컬 보안 정책을 연다. 둘 다 여기서 바꾼 설정은 그 컴퓨터에만 걸린다.',
  },
  {
    id: 'records', label: '기록과 측정',
    nodes: pairNodes('eventvwr', 'perfmon'), paths: ['eventvwr', 'perfmon'],
    caption: 'eventvwr.msc는 운영 체제와 프로그램이 남긴 기록을 찾는 이벤트 뷰어를 연다. perfmon은 컴퓨터의 상태를 잰 값을 그래프로 보여 주는 성능 모니터를 연다. perfmon은 콘솔 파일이 아니라 프로그램의 이름이지만 이것도 MMC 안에서 열린다.',
  },
  {
    id: 'certificate', label: '인증서',
    nodes: pairNodes('certmgr'), paths: ['certmgr'],
    caption: 'certmgr.msc는 지금 로그온한 사용자의 인증서를 보고, 파일로 내보내고, 파일에서 가져오고, 지우는 인증서 관리자를 연다.',
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 332] : [0, 0, 280, 332]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<RunCommandsDiagram />)
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
    const { container } = render(<RunCommandsDiagram />)
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
    const { container } = render(<RunCommandsDiagram />)
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
    render(<RunCommandsDiagram />)
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
        if (groupOf(id) === group) expect(contains(groupBox(group), nodeBox(id)), `${id} ⊂ ${group}`).toBe(true)
        else expect(overlaps(groupBox(group), nodeBox(id)), `${id} ↔ ${group}`).toBe(false)
      }
    }
    expect(overlaps(groupBox('names'), groupBox('tools'))).toBe(false)
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
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('선의 양 끝은 노드의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나거나 같은 시나리오에 보이는 다른 선과 만나지 않는다', async () => {
    render(<RunCommandsDiagram />)
    for (const [id, d] of Object.entries(paths)) {
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
      const { start, end } = lineEnds(d)
      expect(endsAt(start), `${id} 시작`).toEqual([ends[id][0]])
      expect(endsAt(end), `${id} 끝`).toEqual([ends[id][1]])
    }
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const lines = shownPaths()
      for (let i = 0; i < lines.length; i += 1) {
        for (const other of lines.slice(i + 1)) {
          for (const a of segments(paths[lines[i]])) {
            for (const b of segments(paths[other])) {
              const box = { id: '', x: Math.min(b.x1, b.x2), y: Math.min(b.y1, b.y2), width: Math.abs(b.x2 - b.x1), height: Math.abs(b.y2 - b.y1) }
              expect(touches(a, box), `${lines[i]} ↔ ${other}`).toBe(false)
            }
          }
        }
      }
    }
  })

  // 요점: 줄마다 실행 이름에서 나간 화살표는 같은 줄의 도구에서 끝나고 다른 줄로 건너가지 않는다. 실행 이름 노드의 라벨은
  // 본문 목록 항목의 실행 이름과 같고, 짝마다 도구 노드의 라벨은 그 실행 이름을 단 항목의 이름과 같다.
  it('실행 이름마다 화살표가 같은 줄의 도구로 가고, 이름과 도구의 짝이 본문 목록과 같다', async () => {
    render(<RunCommandsDiagram />)
    const seen: string[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of shownPaths()) {
        const { start, end } = lineEnds(paths[id])
        const [from] = endsAt(start)
        const [to] = endsAt(end)
        expect(from, id).toMatch(/^run-/)
        expect(to, id).toBe(from.replace(/^run-/, 'tool-'))
        // 같은 줄이다 — 실행 이름 노드와 도구 노드의 위아래 자리가 같다.
        expect(nodeBox(to).y, id).toBe(nodeBox(from).y)
        expect(start.y, id).toBe(end.y)
        seen.push(id)
      }
      // 화살표가 없는 줄은 이름과 도구가 함께 흐리다.
      for (const row of rows.filter((other) => !shownPaths().includes(other))) {
        expect(opacityOf(`run-${row}`), `${scenario.id}: ${row}`).toBe('0.25')
        expect(opacityOf(`tool-${row}`), `${scenario.id}: ${row}`).toBe('0.25')
      }
    }
    // 네 시나리오가 일곱 줄을 한 번씩 나눠 맡는다.
    expect([...seen].sort()).toEqual([...rows].sort())

    const items = anchorConcept().paragraphs.filter((paragraph) => paragraph.startsWith('- '))
    const pairs = items.map((item) => {
      const match = /^- \*\*([^*]+)\*\*\(`([^`]+)`\)/u.exec(item)!
      return { tool: match[1], run: match[2] }
    })
    expect(new Set(rows.map((row) => label(`run-${row}`)))).toEqual(new Set(pairs.map(({ run }) => run)))
    for (const row of rows) {
      const pair = pairs.find(({ run }) => run === label(`run-${row}`))!
      expect(label(`tool-${row}`), row).toBe(pair.tool)
    }
    // 그림의 다른 말도 본문에 있다.
    const body = anchorConcept().paragraphs.join('\n')
    expect(body).toContain('실행 이름')
    expect(body).toContain('MMC 안에서 열리는 관리 도구')
    expect(body).toContain('`.msc`가 없어도 MMC 안에서 열린다')
    expect(body).toContain('`perfmon`은 콘솔 파일이 아니라 프로그램의 이름')
  })
}

describe('RunCommandsDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<RunCommandsDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 332')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('기록과 측정')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 332')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '기록과 측정' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><RunCommandsDiagram /><RunCommandsDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '정책' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<RunCommandsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['run-commands']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(runCommandsScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = runCommandsScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 MMC와 실행 창 명령 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
