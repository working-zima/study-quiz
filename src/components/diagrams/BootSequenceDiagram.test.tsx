import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { BootSequenceDiagram, bootSequenceScenarios } from './BootSequenceDiagram'

const topicId = 'linux-process-boot'
const anchorConceptId = `${topicId}.boot-sequence`
const labels = {
  firmware: '펌웨어',
  loader: '부트 로더',
  kernel: '커널',
  init: 'init',
  service: '서비스 시작',
}
const noteLabels = {
  firmware: '부트 로더를 불러옴',
  loader: '커널을 메모리에 올림',
  kernel: '첫 프로세스 init을 만듦',
  init: '서비스를 켬',
}
const nodeIds = Object.keys(labels)
const linkIds = ['l-loader', 'l-kernel', 'l-init', 'l-service']
const pathIds = ['to-loader', 'to-kernel', 'to-init', 'to-service']

// 선마다 시작하는 노드와 끝나는 노드. 늘 보이는 화살표(link)와 고른 단계의 굵은 화살표(path)가 같은 두 노드를 잇는다.
const ends: Record<string, [string, string]> = {
  'l-loader': ['firmware', 'loader'],
  'l-kernel': ['loader', 'kernel'],
  'l-init': ['kernel', 'init'],
  'l-service': ['init', 'service'],
  'to-loader': ['firmware', 'loader'],
  'to-kernel': ['loader', 'kernel'],
  'to-init': ['kernel', 'init'],
  'to-service': ['init', 'service'],
}

const question = '전원을 켜면 무엇이 차례로 실행될까?'
const idleCaption = '전원을 켠 뒤 실행되는 다섯 단계를 차례대로 놓았다. 버튼을 고르면 단계마다 무엇을 실행하고 넘겨주는지 볼 수 있다.'
const legend = '화살표는 앞 단계가 다음 단계를 실행하는 방향이다. 굵은 화살표는 고른 단계가 넘겨주는 곳이다.'
const figureName = '전원을 켠 뒤 펌웨어, 부트 로더, 커널, init, 서비스 시작이 차례로 이어지며 앞 단계가 다음 단계를 실행하는 부팅 과정을 보이는 도식'
const svgName = '펌웨어, 부트 로더, 커널, init, 서비스 시작 다섯 단계가 화살표로 차례대로 이어져 있다'
const expectedScenarios = [
  {
    id: 'firmware', label: '펌웨어',
    nodes: ['firmware', 'loader'], paths: ['to-loader'], notes: ['firmware'],
    caption: '전원을 켜면 읽기 전용 메모리에 미리 들어 있는 펌웨어가 가장 먼저 실행되어 하드웨어를 점검하고, 부팅할 저장 장치에서 부트 로더를 불러와 실행을 넘긴다.',
    sources: [anchorConceptId],
  },
  {
    id: 'loader', label: '부트 로더',
    nodes: ['loader', 'kernel'], paths: ['to-kernel'], notes: ['loader'],
    caption: '부트 로더가 디스크에서 커널 파일을 찾아 메모리에 올리고 실행을 넘긴다. Linux에서 흔히 쓰는 부트 로더는 GRUB이다.',
    sources: [anchorConceptId],
  },
  {
    id: 'kernel', label: '커널',
    nodes: ['kernel', 'init'], paths: ['to-init'], notes: ['kernel'],
    caption: '커널이 드라이버로 장치를 준비하고 루트 파일 시스템을 마운트한 뒤, PID가 1인 첫 프로세스 init을 만든다.',
    sources: [anchorConceptId],
  },
  {
    id: 'init', label: 'init',
    nodes: ['init', 'service'], paths: ['to-service'], notes: ['init'],
    caption: 'init이 시스템에 필요한 서비스들을 켠다. 여러 Linux 시스템에서는 systemd가 init 자리에서 실행되고, 이 단계가 끝나면 사용자가 시스템을 쓸 수 있다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 304]
const wideBox: [number, number, number, number] = [0, 0, 440, 80]

function diagram() {
  return screen.getByRole('img', { name: svgName })
}

async function selectScenario(label: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) })
}

function rectBox(rect: Element, id: string): SvgBox {
  return {
    id,
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

function nodeBox(id: string) {
  return rectBox(diagram().querySelector(`[data-node="${id}"] rect`)!, id)
}

function shownIds(selector: string, attribute: string) {
  return Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)!)
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

// 글자 크기 9인 곁말이 차지하는 상자. 반각 글자가 화면에서 더 넓게 그려지는 것을 생각해 폭을 1.15배로 잡는다.
function textBox(text: Element, id: string): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9) * 1.15
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id, x: left, y: y - 9, width, height: 9 }
}

// 직교 경로(M·H·V)를 꼭짓점 목록으로 읽는다.
function points(d: string) {
  const result: [number, number][] = []
  const tokens = d.trim().split(/\s+/u)
  let x = 0
  let y = 0
  for (let i = 0; i < tokens.length; i += 1) {
    const command = tokens[i][0]
    const value = tokens[i].slice(1)
    if (command === 'M') {
      x = Number(value)
      y = Number(tokens[i + 1])
      i += 1
    } else if (command === 'H') {
      x = Number(value)
    } else if (command === 'V') {
      y = Number(value)
    } else {
      throw new Error(`직교 경로가 아니다: ${d}`)
    }
    result.push([x, y])
  }
  return result
}

function onEdge([x, y]: [number, number], box: SvgBox) {
  const inX = x >= box.x && x <= box.x + box.width
  const inY = y >= box.y && y <= box.y + box.height
  return (inX && (y === box.y || y === box.y + box.height)) || (inY && (x === box.x || x === box.x + box.width))
}

function crossesInside(a: [number, number], b: [number, number], box: SvgBox) {
  const left = Math.min(a[0], b[0])
  const right = Math.max(a[0], b[0])
  const top = Math.min(a[1], b[1])
  const bottom = Math.max(a[1], b[1])
  return left < box.x + box.width && right > box.x && top < box.y + box.height && bottom > box.y
}

function lineD(id: string) {
  return diagram().querySelector(`[data-path="${id}"], [data-link="${id}"]`)!.getAttribute('d')!
}

async function expectScenario(scenario: typeof expectedScenarios[number], container: HTMLElement) {
  await selectScenario(scenario.label)

  for (const element of diagram().querySelectorAll('[data-node]')) {
    const id = element.getAttribute('data-node')!
    expect(element, id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
  expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
  expect(shownIds('[data-note]', 'data-note')).toEqual(scenario.notes)
  for (const id of scenario.notes) {
    expect(diagram().querySelector(`[data-note="${id}"]`)!.textContent).toBe(noteLabels[id as keyof typeof noteLabels])
  }
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = nodeIds.map(nodeBox)
  expect(diagram().querySelectorAll('rect')).toHaveLength(nodeIds.length)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(node.querySelector('rect')).toHaveClass('stroke-disabled')
    expect(nodeBox(id).height).toBe(32)
    expect(estimateTextWidth(label, 10) * 1.15 + 12, `${id} ${label}`).toBeLessThanOrEqual(nodeBox(id).width)
  }
  for (let i = 0; i < nodeIds.length; i += 1) {
    for (let j = i + 1; j < nodeIds.length; j += 1) {
      expect(overlaps(nodeBox(nodeIds[i]), nodeBox(nodeIds[j])), `${nodeIds[i]} ↔ ${nodeIds[j]}`).toBe(false)
    }
  }
  for (const link of diagram().querySelectorAll('[data-link]')) {
    expect(link).toHaveClass('stroke-muted')
    expect(link).not.toHaveAttribute('opacity')
  }
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

function expectLine(id: string) {
  const list = points(lineD(id))
  const [from, to] = ends[id]
  expect(onEdge(list[0], nodeBox(from)), `${id} 시작`).toBe(true)
  expect(onEdge(list[list.length - 1], nodeBox(to)), `${id} 끝`).toBe(true)
  for (let i = 1; i < list.length; i += 1) {
    for (const node of nodeIds.filter((other) => other !== from && other !== to)) {
      expect(crossesInside(list[i - 1], list[i], nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
    }
  }
}

// 늘 보이는 화살표와 고른 단계의 화살표 모두 끝점이 정한 두 노드의 변 위에 있고, 다른 노드 상자 안을 지나지 않는다.
async function expectLines() {
  for (const id of linkIds) expectLine(id)
  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    for (const id of scenario.paths) expectLine(id)
  }
}

// 곁말은 viewBox 안에 있고 어느 노드·선과도 겹치지 않으며, 바로 위 노드의 아래 변에서 기준선까지 10 이상 띄운다.
async function expectNotes(viewBox: [number, number, number, number]) {
  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    for (const element of diagram().querySelectorAll('[data-note]')) {
      expect(element).toHaveAttribute('font-size', '9')
      const box = textBox(element, element.getAttribute('data-note')!)
      expect(boxesOutsideViewBox([box], viewBox)).toEqual([])
      const baseline = Number(element.getAttribute('y'))
      for (const node of nodeIds) {
        const nodeRect = nodeBox(node)
        expect(overlaps(box, nodeRect), `${box.id} ↔ ${node}`).toBe(false)
        const sameColumn = box.x < nodeRect.x + nodeRect.width && nodeRect.x < box.x + box.width
        if (sameColumn && nodeRect.y + 32 <= baseline) expect(baseline - (nodeRect.y + 32), `${box.id} ↔ ${node}`).toBeGreaterThanOrEqual(10)
      }
      for (const id of [...linkIds, ...shownIds('[data-path]', 'data-path')]) {
        const list = points(lineD(id))
        for (let i = 1; i < list.length; i += 1) expect(crossesInside(list[i - 1], list[i], box), `${box.id} ↔ ${id}`).toBe(false)
      }
    }
  }
}

// 요점: 노드를 읽는 차례(세로형은 위에서 아래, 가로형은 왼쪽에서 오른쪽)가 개념 본문의 목록 항목 차례와 같다.
// 시나리오마다 선명한 두 노드는 그 차례에서 이웃하고, 앞 시나리오가 넘겨주는 쪽이 다음 시나리오가 넘겨받아 실행하는 쪽이다.
async function expectPoint(axis: 'x' | 'y') {
  const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
  const body = concept.paragraphs.join('\n')
  const listNames = concept.paragraphs
    .filter((paragraph) => paragraph.startsWith('- **'))
    .map((paragraph) => /^- \*\*(.+?)\*\*/u.exec(paragraph)![1])
  const order = [...nodeIds].sort((a, b) => nodeBox(a)[axis] - nodeBox(b)[axis])
  const label = (id: string) => diagram().querySelector(`[data-node="${id}"] text`)!.textContent!

  expect(order.map(label)).toEqual(listNames)
  expect(listNames).toHaveLength(5)

  for (let k = 0; k < expectedScenarios.length; k += 1) {
    const scenario = expectedScenarios[k]
    await selectScenario(scenario.label)
    const lit = shownIds('[data-node]', 'data-node').filter((id) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
    const indices = lit.map((id) => order.indexOf(id)).sort((a, b) => a - b)
    expect(indices, scenario.label).toEqual([k, k + 1])
    const [path] = shownIds('[data-path]', 'data-path')
    const list = points(lineD(path))
    expect(onEdge(list[0], nodeBox(order[k])), `${scenario.label} 넘겨주는 쪽`).toBe(true)
    expect(onEdge(list[list.length - 1], nodeBox(order[k + 1])), `${scenario.label} 넘겨받는 쪽`).toBe(true)
    if (k + 1 < expectedScenarios.length) expect(expectedScenarios[k + 1].nodes[0]).toBe(scenario.nodes[1])
  }

  for (const note of Object.values(noteLabels)) expect(body).toContain(note.replace(/(?:옴|림|듦|켬)$/u, ''))
}

describe('BootSequenceDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<BootSequenceDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 늘 보이는 화살표만 있으며 굵은 화살표·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<BootSequenceDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<BootSequenceDiagram />)
    await expectScenario(scenario, container)
  })

  it('시나리오를 바꾸면 이전 화살표가 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<BootSequenceDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('네 시나리오가 보이는 것(노드·화살표·곁말)이 서로 다르다', () => {
    const keys = expectedScenarios.map(({ nodes, paths, notes }) => JSON.stringify([[...nodes].sort(), paths, notes]))
    expect(new Set(keys).size).toBe(expectedScenarios.length)
  })

  it('노드가 280×304 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<BootSequenceDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 304')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  it('화살표의 끝점이 노드 변 위에 있고 다른 노드를 지나지 않는다', async () => {
    render(<BootSequenceDiagram />)
    await expectLines()
  })

  it('곁말이 viewBox 안에 있고 노드·화살표와 겹치지 않는다', async () => {
    render(<BootSequenceDiagram />)
    await expectNotes(tallBox)
  })

  it('위에서 아래로 본문의 다섯 단계 차례대로 놓이고, 단계마다 다음 단계에 실행을 넘긴다', async () => {
    render(<BootSequenceDiagram />)
    await expectPoint('y')
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 고른 시나리오가 섞이지 않는다', async () => {
    const { container } = render(<><BootSequenceDiagram /><BootSequenceDiagram /></>)
    const markerIds = Array.from(container.querySelectorAll('marker'), (marker) => marker.id)
    expect(markerIds).toHaveLength(4)
    expect(new Set(markerIds).size).toBe(4)

    const figures = screen.getAllByRole('figure', { name: figureName })
    await act(async () => { await userEvent.click(within(figures[0]).getByRole('button', { name: '커널' })) })

    expect(within(figures[0]).getByRole('button', { name: '커널' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(figures[1]).getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(figures[1].querySelectorAll('[data-path]')).toHaveLength(0)
    const firstMarkers = Array.from(figures[0].querySelectorAll('marker'), (marker) => marker.id)
    expect(figures[0].querySelector('[data-path]')!.getAttribute('marker-end')).toMatch(new RegExp(`^url\\(#(${firstMarkers.join('|')})\\)$`, 'u'))
    for (const link of figures[0].querySelectorAll('[data-link]')) expect(firstMarkers.map((id) => `url(#${id})`)).toContain(link.getAttribute('marker-end'))
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<BootSequenceDiagram />)
    const text = visualsByTopicId[topicId].diagrams['boot-sequence']
    const ids = bootSequenceScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([anchorConceptId])
    expect(text.label).toBe(figureName)
    expect(text.svgLabel).toBe(svgName)
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = bootSequenceScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: expected.sources })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) {
      expect(conceptIds).toContain(source)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 부팅 과정 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })

    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(within(figure).queryByRole('heading')).toBeNull()
  })

  describe('가로형 (768px 이상)', () => {
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

      return {
        change(nextMatches: boolean) {
          mediaQuery.matches = nextMatches
          const event = Object.assign(new Event('change'), { matches: nextMatches, media: mediaQuery.media })
          listeners.forEach((listener) => listener(event))
        },
      }
    }

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×80 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<BootSequenceDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 80')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드 id 집합과 늘 보이는 화살표·경로 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<BootSequenceDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 304')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallLinks = shownIds('[data-link]', 'data-link').sort()
      const tallPaths: string[] = []
      for (const scenario of expectedScenarios) {
        await selectScenario(scenario.label)
        tallPaths.push(...shownIds('[data-path]', 'data-path'))
      }
      await selectScenario('전체')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 80')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinks)
      const widePaths: string[] = []
      for (const scenario of expectedScenarios) {
        await selectScenario(scenario.label)
        widePaths.push(...shownIds('[data-path]', 'data-path'))
      }
      expect([...new Set(widePaths)].sort()).toEqual([...new Set(tallPaths)].sort())
      expect([...new Set(tallPaths)].sort()).toEqual([...pathIds].sort())
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallLinks).toEqual([...linkIds].sort())
    })

    it('노드가 440×80 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<BootSequenceDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<BootSequenceDiagram />)
      await expectScenario(scenario, container)
    })

    it('화살표의 끝점이 노드 변 위에 있고 다른 노드를 지나지 않는다', async () => {
      render(<BootSequenceDiagram />)
      await expectLines()
    })

    it('곁말이 viewBox 안에 있고 노드·화살표와 겹치지 않는다', async () => {
      render(<BootSequenceDiagram />)
      await expectNotes(wideBox)
    })

    it('왼쪽에서 오른쪽으로 본문의 다섯 단계 차례대로 놓이고, 단계마다 다음 단계에 실행을 넘긴다', async () => {
      render(<BootSequenceDiagram />)
      await expectPoint('x')
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<BootSequenceDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 304')
      await selectScenario('부트 로더')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '부트 로더' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownIds('[data-path]', 'data-path')).toEqual(['to-kernel'])
      expect(diagram().querySelector('[data-node="kernel"] rect')).toHaveAttribute('x', '192')
    })
  })
})
