import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { BitLockerVolumeDiagram, bitLockerVolumeScenarios } from './BitLockerVolumeDiagram'

const topicId = 'windows-admin-tools'
const anchorConceptId = `${topicId}.bitlocker`
const labels: Record<string, string> = {
  tpm: 'TPM',
  os: '운영 체제 드라이브',
  d: 'D:',
  moved: '옮겨 붙인 D:',
  recovery: '복구 암호',
  efs: 'EFS로 암호화한 파일',
}
const groupLabels: Record<string, string> = {
  server: '서버',
  other: '다른 컴퓨터',
}
const noteLabels: Record<string, string> = {
  'key-note': '키를 내준다',
  'auto-note': '저절로 열린다',
  'locked-note': '읽을 수 없음',
  'digits-note': '48자리 숫자',
  'volume-note': '볼륨 전체',
  'file-note': '파일 하나하나',
}
const noteScenario: Record<string, string> = {
  'key-note': 'normal',
  'auto-note': 'normal',
  'locked-note': 'stolen',
  'digits-note': 'recovery',
  'volume-note': 'vs-efs',
  'file-note': 'vs-efs',
}
// 곁말이 들어가는 그룹. 「48자리 숫자」와 「파일 하나하나」는 두 박스 밖의 노드 아래에 놓인다.
const noteGroup: Record<string, string | null> = {
  'key-note': 'server', 'auto-note': 'server', 'locked-note': 'other', 'digits-note': null, 'volume-note': 'server', 'file-note': null,
}
// 곁말마다 그 곁말이 설명하는 노드. 곁말은 이 노드에 가장 가깝게 놓인다.
const noteNode: Record<string, string> = {
  'key-note': 'tpm', 'auto-note': 'd', 'locked-note': 'moved', 'digits-note': 'recovery', 'volume-note': 'd', 'file-note': 'efs',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
// 노드마다 들어가는 그룹. 복구 암호와 EFS로 암호화한 파일은 어느 컴퓨터 박스에도 들지 않는다.
const groupOf: Record<string, string | null> = {
  tpm: 'server', os: 'server', d: 'server', moved: 'other', recovery: null, efs: null,
}

// 모두 시나리오에서만 보이는 화살표다.
const tallPaths: Record<string, string> = {
  'tpm-os': 'M68 48 H100',
  'os-d': 'M160 64 V80',
  'recovery-moved': 'M160 176 H108',
}
const widePaths: Record<string, string> = {
  'tpm-os': 'M68 48 H92',
  'os-d': 'M152 64 V80',
  'recovery-moved': 'M340 144 V64',
}
// 선마다 [시작 노드, 끝 노드].
const ends: Record<string, [string, string]> = {
  'tpm-os': ['tpm', 'os'],
  'os-d': ['os', 'd'],
  'recovery-moved': ['recovery', 'moved'],
}

const question = '디스크를 떼어 가면 BitLocker로 암호화한 데이터는 어떻게 될까?'
const figureName = '서버의 운영 체제 드라이브와 D:를 BitLocker로 암호화하면 이 서버에서는 TPM이 키를 내주어 운영 체제 드라이브가 열리고 D:도 저절로 열리지만, 디스크를 떼어 다른 컴퓨터에 옮겨 붙인 D:는 복구 암호 없이는 읽을 수 없다는 것을 EFS와 견주어 보이는 도식'
const svgName = '서버 박스 안에 TPM·운영 체제 드라이브·D:가, 다른 컴퓨터 박스 안에 옮겨 붙인 D:가 있고, 두 박스 밖에 복구 암호와 EFS로 암호화한 파일이 있는 그림'
const idleCaption = '서버의 운영 체제 드라이브와 데이터 드라이브 D:를 BitLocker로 암호화해 두었다. 버튼을 고르면 이 서버에서, 디스크를 떼어 갔을 때, 복구 암호로 열 때 D:가 어떻게 되는지 볼 수 있다.'
const legend = '화살표는 무엇이 드라이브의 잠금을 푸는지를 따라간다. 박스는 컴퓨터 한 대다.'
const expectedScenarios = [
  {
    id: 'normal', label: '이 서버에서',
    nodes: ['tpm', 'os', 'd'], paths: ['tpm-os', 'os-d'],
    caption: '서버를 켜면 TPM이 꺼져 있던 동안 시작에 쓰는 부분이 바뀌지 않았는지 확인하고 운영 체제 드라이브를 풀 키를 내준다. 운영 체제 드라이브가 BitLocker로 보호되어 있으므로, 저절로 열리게 해 둔 D:는 이 서버에서 저절로 열린다.',
    sources: [anchorConceptId],
  },
  {
    id: 'stolen', label: '떼어 갔을 때',
    nodes: ['moved'], paths: [],
    caption: 'D:가 든 디스크를 떼어 다른 컴퓨터에 붙이면 그 컴퓨터에서는 저절로 열리지 않는다. 저절로 열리게만 해 두었으므로 복구 암호나 복구 키가 없으면 옮겨 붙인 D:의 데이터를 읽을 수 없다.',
    sources: [anchorConceptId],
  },
  {
    id: 'recovery', label: '복구 암호',
    nodes: ['recovery', 'moved'], paths: ['recovery-moved'],
    caption: '따로 보관해 둔 복구 암호 48자리를 넣으면 다른 컴퓨터에 옮겨 붙인 D:도 연다. 복구 정보까지 잃으면 BitLocker로 암호화한 드라이브의 데이터는 되살릴 수 없다.',
    sources: [anchorConceptId],
  },
  {
    id: 'vs-efs', label: 'EFS와',
    nodes: ['d', 'efs'], paths: [],
    caption: 'BitLocker는 D: 같은 볼륨 전체를 암호화해 디스크를 떼어 가 읽는 일을 막고, EFS는 사용자가 고른 파일 하나하나를 암호화해 같은 컴퓨터의 다른 사용자가 열지 못하게 한다. 둘은 함께 쓸 수 있다.',
    sources: [anchorConceptId, `${topicId}.efs`],
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

// 두 상자 사이의 가장 짧은 거리. 겹치면 0이다.
function gap(a: SvgBox, b: SvgBox) {
  const dx = Math.max(0, Math.max(a.x, b.x) - Math.min(a.x + a.width, b.x + b.width))
  const dy = Math.max(0, Math.max(a.y, b.y) - Math.min(a.y + a.height, b.y + b.height))
  return Math.hypot(dx, dy)
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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 200] : [0, 0, 280, 288]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<BitLockerVolumeDiagram />)
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
    const { container } = render(<BitLockerVolumeDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<BitLockerVolumeDiagram />)
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
    render(<BitLockerVolumeDiagram />)
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

  it('선의 양 끝은 노드의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<BitLockerVolumeDiagram />)
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

  // 요점: 떼어 갔을 때는 다른 컴퓨터 쪽에서 D:로 가는 화살표가 없다 — 어느 선도 다른 컴퓨터 박스 안의 노드에서 서버의 D:로 가지 않는다.
  // 복구 암호에서 보이는 화살표는 복구 암호에서 시작해 다른 컴퓨터에 옮겨 붙인 D:에서 끝난다. 이 서버에서는 TPM → 운영 체제 드라이브 → D: 차례다.
  // 곁말은 저마다 설명하는 노드에 가장 가깝고, 색으로 암호화를 가르지 않는다.
  it('떼어 간 디스크는 열리지 않고, 다른 컴퓨터에서는 복구 암호로만 열리며, 이 서버에서는 TPM과 운영 체제 드라이브를 거쳐 D:가 열린다', async () => {
    render(<BitLockerVolumeDiagram />)
    expect(Object.keys(paths).filter((id) => groupOf[ends[id][0]] === 'other' && ends[id][1] === 'd')).toEqual([])
    expect(Object.keys(paths).filter((id) => ends[id].includes('moved') && ends[id][0] !== 'recovery')).toEqual([])

    await select('떼어 갔을 때')
    expect(shownPaths()).toEqual([])
    expect(opacityOf('moved')).toBe('1')
    expect(opacityOf('d')).toBe('0.25')
    expect(opacityOf('recovery')).toBe('0.25')

    await select('복구 암호')
    const shown = shownPaths()
    expect(shown).toHaveLength(1)
    expect(endsAt(lineEnds(paths[shown[0]]).start)).toEqual(['recovery'])
    expect(endsAt(lineEnds(paths[shown[0]]).end)).toEqual(['moved'])
    expect(contains(groupBox('other'), nodeBox('moved'))).toBe(true)

    await select('이 서버에서')
    expect(shownPaths().map((id) => ends[id])).toEqual([['tpm', 'os'], ['os', 'd']])
    for (const id of ['tpm', 'os', 'd']) expect(contains(groupBox('server'), nodeBox(id)), id).toBe(true)

    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of shownNotes()) {
        const box = textBox(note(id)!, id)
        const nearest = [...nodeIds].sort((a, b) => gap(box, nodeBox(a)) - gap(box, nodeBox(b)))[0]
        expect(nearest, id).toBe(noteNode[id])
      }
    }

    const body = anchorConcept().paragraphs.join('\n').replace(/`/gu, '')
    for (const id of nodeIds) expect(body, id).toContain(label(id))
    for (const id of groupIds) expect(body, id).toContain(groupLabels[id])
    for (const id of ['key-note', 'auto-note', 'digits-note', 'volume-note', 'file-note']) expect(body, id).toContain(noteLabels[id])
  })
}

describe('BitLockerVolumeDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<BitLockerVolumeDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 288')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('복구 암호')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 200')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '복구 암호' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><BitLockerVolumeDiagram /><BitLockerVolumeDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '이 서버에서' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<BitLockerVolumeDiagram />)
    const text = visualsByTopicId[topicId].diagrams['bitlocker-volume']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(bitLockerVolumeScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = bitLockerVolumeScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: expected.sources })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 BitLocker 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
