import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { BuiltinLocalGroupsDiagram, builtinLocalGroupsScenarios } from './BuiltinLocalGroupsDiagram'

const topicId = 'windows-ad'
const anchorConceptId = `${topicId}.local-groups`
const labels: Record<string, string> = {
  account: 'user01',
  users: 'Users',
  backup: 'Backup Operators',
  admins: 'Administrators',
  'do-daily': '일상 작업',
  'do-backup': '파일 백업과 복원',
  'do-all': '컴퓨터 전체 제어',
}
const groupLabels: Record<string, string> = {
  groups: 'SRV01의 기본 로컬 그룹',
  abilities: '할 수 있게 되는 일',
}
const noteLabels: Record<string, string> = {
  'users-note': '로그온하면 Users의 권한을 받는다',
  'backup-note': 'Backup Operators에 넣는다',
  'admins-note': 'Administrators에 넣는다',
}
const noteScenario: Record<string, string> = {
  'users-note': 'users', 'backup-note': 'backup', 'admins-note': 'admins',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const localGroupIds = ['users', 'backup', 'admins']
const abilityIds = ['do-daily', 'do-backup', 'do-all']
// 노드마다 들어가는 그룹. 계정 user01은 어느 박스에도 들지 않는다.
const groupOf: Record<string, string | null> = {
  account: null, users: 'groups', backup: 'groups', admins: 'groups', 'do-daily': 'abilities', 'do-backup': 'abilities', 'do-all': 'abilities',
}

// to-는 시나리오에서만 보이는 화살표, -do는 그룹과 그 그룹이 할 수 있게 하는 일을 잇는 늘 보이는 선이다.
const tallPaths: Record<string, string> = {
  'to-users': 'M12 40 V88 H28',
  'to-backup': 'M12 40 V136 H28',
  'to-admins': 'M12 40 V184 H28',
  'users-do': 'M144 88 H164',
  'backup-do': 'M144 136 H164',
  'admins-do': 'M144 184 H164',
}
const widePaths: Record<string, string> = {
  'to-users': 'M44 40 V88 H128',
  'to-backup': 'M44 40 V136 H128',
  'to-admins': 'M44 40 V184 H128',
  'users-do': 'M256 88 H296',
  'backup-do': 'M256 136 H296',
  'admins-do': 'M256 184 H296',
}
const linkIds = ['users-do', 'backup-do', 'admins-do']
// 선마다 [시작 노드, 끝 노드].
const ends: Record<string, [string, string]> = {
  'to-users': ['account', 'users'],
  'to-backup': ['account', 'backup'],
  'to-admins': ['account', 'admins'],
  'users-do': ['users', 'do-daily'],
  'backup-do': ['backup', 'do-backup'],
  'admins-do': ['admins', 'do-all'],
}

const question = '계정을 그룹에 넣으면 무엇을 할 수 있게 될까?'
const figureName = 'SRV01의 로컬 계정 user01이 기본 로컬 그룹 Users·Backup Operators·Administrators 가운데 어느 그룹의 권한을 받느냐에 따라, 일상 작업을 하거나 파일을 백업하고 복원하거나 컴퓨터 전체를 제어하게 되는 것을 보이는 도식'
const svgName = '맨 위 왼쪽에 계정 user01이 있고, 그 아래 왼쪽 박스에 기본 로컬 그룹 Users·Backup Operators·Administrators가, 오른쪽 박스에 그룹마다 할 수 있게 되는 일인 일상 작업·파일 백업과 복원·컴퓨터 전체 제어가 이어진 그림'
const idleCaption = 'SRV01의 기본 로컬 그룹 셋과, 그룹마다 구성원이 할 수 있게 되는 일을 이어 두었다. 컴퓨터 이름과 계정 user01은 예로 붙인 이름이다. 버튼을 고르면 user01이 어느 그룹의 권한을 받는지와 그 결과를 볼 수 있다.'
const legend = '아래 왼쪽 박스는 SRV01의 기본 로컬 그룹이고, 오른쪽 박스는 그 그룹의 구성원이 할 수 있게 되는 일이다. 화살표는 user01이 권한을 받는 그룹을 가리킨다.'
const expectedScenarios = [
  {
    id: 'users', label: 'Users',
    nodes: ['account', 'users', 'do-daily'], paths: ['to-users'],
    caption: 'Windows를 설치한 직후 Users의 구성원은 로그온한 모든 사용자를 가리키는 Authenticated Users다. 그래서 어느 그룹에도 따로 넣지 않은 user01도 로그온하면 Users의 권한으로 일상 작업을 하고, 시스템 전체에 걸치는 설정은 바꾸지 못한다.',
  },
  {
    id: 'backup', label: 'Backup Operators',
    nodes: ['account', 'backup', 'do-backup'], paths: ['to-backup'],
    caption: 'user01을 Backup Operators에 넣으면 파일마다 정해 둔 사용 권한과 관계없이 SRV01의 모든 파일을 백업하고 복원할 수 있게 된다. 그룹이 받은 사용자 권한이 구성원에게 주어지기 때문이다.',
  },
  {
    id: 'admins', label: 'Administrators',
    nodes: ['account', 'admins', 'do-all'], paths: ['to-admins'],
    caption: 'user01을 Administrators에 넣으면 SRV01 전체를 제한 없이 제어할 수 있게 된다. 구성원 하나하나가 무엇이든 할 수 있으므로 이 그룹에는 구성원을 되도록 적게 두라고 권한다.',
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
const shownLinks = () => Array.from(svg().querySelectorAll('[data-link]'), (path) => path.getAttribute('data-link')!)
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 216] : [0, 0, 280, 216]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<BuiltinLocalGroupsDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 늘 보이는 선만 있으며 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<BuiltinLocalGroupsDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownLinks()).toEqual(linkIds)
    for (const id of linkIds) {
      const link = svg().querySelector(`[data-link="${id}"]`)!
      expect(link).toHaveAttribute('d', paths[id])
      expect(link).toHaveClass('stroke-muted')
      expect(link).not.toHaveAttribute('marker-end')
    }
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보이고 그룹 박스와 늘 보이는 선은 흐려지지 않는다', async (scenario) => {
    const { container } = render(<BuiltinLocalGroupsDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownNotes()).toEqual(Object.keys(noteScenario).filter((id) => noteScenario[id] === scenario.id))
    for (const id of shownNotes()) expect(note(id)!.textContent).toBe(noteLabels[id])
    expect(shownPaths()).toEqual(scenario.paths)
    expect(shownLinks()).toEqual(linkIds)
    for (const path of svg().querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('d', paths[path.getAttribute('data-path')!])
      expect(path).toHaveAttribute('stroke-width', '2')
      expect(path).toHaveClass('stroke-title')
      expect(path).toHaveAttribute('marker-end', `url(#${svg().querySelector('marker')!.id})`)
      expect(path.closest('[opacity]')).toBeNull()
    }
    for (const link of svg().querySelectorAll('[data-link]')) expect(link.closest('[opacity]')).toBeNull()
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말·그룹 라벨이 자리에 들어간다`, async () => {
    render(<BuiltinLocalGroupsDiagram />)
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
      // 그룹에 드는 노드는 그 그룹 안에만 있고, 계정은 어느 그룹과도 겹치지 않는다.
      for (const group of groupIds) {
        if (groupOf[id] === group) expect(contains(groupBox(group), nodeBox(id)), `${id} ⊂ ${group}`).toBe(true)
        else expect(overlaps(groupBox(group), nodeBox(id)), `${id} ↔ ${group}`).toBe(false)
      }
    }
    expect(overlaps(groupBox('groups'), groupBox('abilities'))).toBe(false)
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
      for (const box of noteTexts) {
        for (const group of groupTexts) expect(overlaps(box, group), `${box.id} ↔ ${group.id}`).toBe(false)
      }
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('선의 양 끝은 노드의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나거나 같은 시나리오에 보이는 다른 선과 만나지 않는다', async () => {
    render(<BuiltinLocalGroupsDiagram />)
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
      const lines = [...shownPaths(), ...shownLinks()]
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

  // 요점: 시나리오마다 계정에서 나가는 화살표는 하나이고 그 화살표가 닿는 그룹만 선명하다. 그 그룹에서 나가는 늘 보이는 선의 끝, 곧
  // 그 그룹이 할 수 있게 하는 일만 선명하고 나머지 일은 흐리다. 세 시나리오의 선명한 그룹은 서로 다르고, 곁말은 저마다 그 그룹의 이름을 말한다.
  it('계정이 권한을 받는 그룹이 바뀌면 할 수 있게 되는 일도 그 그룹의 것으로 바뀐다', async () => {
    render(<BuiltinLocalGroupsDiagram />)
    const reached: string[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const shown = shownPaths()
      expect(shown, scenario.id).toHaveLength(1)
      const { start, end } = lineEnds(paths[shown[0]])
      expect(endsAt(start), scenario.id).toEqual(['account'])
      const [group] = endsAt(end)
      expect(localGroupIds, scenario.id).toContain(group)
      reached.push(group)
      for (const id of localGroupIds) expect(opacityOf(id), `${scenario.id}: ${id}`).toBe(id === group ? '1' : '0.25')
      const link = linkIds.find((id) => endsAt(lineEnds(paths[id]).start).includes(group))!
      const [ability] = endsAt(lineEnds(paths[link]).end)
      for (const id of abilityIds) expect(opacityOf(id), `${scenario.id}: ${id}`).toBe(id === ability ? '1' : '0.25')
      expect(note(shownNotes()[0])!.textContent, scenario.id).toContain(label(group))
      // 계정은 화살표가 나가는 곳이라 늘 선명하다.
      expect(opacityOf('account'), scenario.id).toBe('1')
    }
    expect(new Set(reached).size).toBe(expectedScenarios.length)

    // 그림의 그룹·일·이름은 본문에 있는 것이다.
    const body = anchorConcept().paragraphs.join('\n')
    for (const id of localGroupIds) expect(body, id).toContain(`- **${label(id)}**`)
    expect(body).toContain('- **Users**는 일상 작업을 하는 그룹이다')
    expect(body).toContain('모든 파일을 백업하고, 그 사본으로 파일을 되돌려 놓는 복원도 할 수 있다')
    expect(body).toContain('- **Administrators**는 그 컴퓨터 전체를 제한 없이 제어하는 그룹이다')
    expect(body).toContain('설치 직후 구성원은 Authenticated Users')
    expect(body).toContain('`SRV01`의 로컬 계정 `user01`')
    expect(body).toContain('이 그룹에는 구성원을 되도록 적게 두라고 권한다')
  })
}

describe('BuiltinLocalGroupsDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<BuiltinLocalGroupsDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 216')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('Backup Operators')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 216')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: 'Backup Operators' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      for (const link of svg().querySelectorAll('[data-link]')) expect(link).toHaveAttribute('d', widePaths[link.getAttribute('data-link')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><BuiltinLocalGroupsDiagram /><BuiltinLocalGroupsDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: 'Administrators' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<BuiltinLocalGroupsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['builtin-local-groups']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(builtinLocalGroupsScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = builtinLocalGroupsScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 기본 로컬 그룹 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
