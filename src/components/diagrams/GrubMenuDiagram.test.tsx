import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { GrubMenuDiagram, grubMenuScenarios } from './GrubMenuDiagram'

const topicId = 'linux-process-boot'
const anchorConceptId = `${topicId}.grub`
const labels = {
  'linux-item': 'Linux 항목',
  'windows-item': 'Windows 항목',
  kernel: 'Linux 커널',
  'win-loader': 'Windows의 부트 로더',
  windows: 'Windows',
}
const groupLabels = { menu: 'GRUB 메뉴' }
const noteLabels = {
  linux: '직접 불러옴',
  windows: '체인 로딩',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const pathIds = ['linux-path', 'chain-path', 'windows-path']

// 선마다 시작하는 노드와 끝나는 노드.
const ends: Record<string, [string, string]> = {
  'linux-path': ['linux-item', 'kernel'],
  'chain-path': ['windows-item', 'win-loader'],
  'windows-path': ['win-loader', 'windows'],
}

const question = 'GRUB 메뉴에서 고르면 무엇이 부팅될까?'
const idleCaption = 'Linux와 Windows가 함께 설치된 컴퓨터를 켰을 때 GRUB 메뉴에 나오는 두 항목과, 고른 뒤에 실행될 것들을 놓았다. 버튼을 고르면 항목마다 운영체제가 어떤 길로 시작되는지 볼 수 있다.'
const legend = '테두리 안은 GRUB 메뉴의 항목이다. 화살표는 실행을 넘기는 방향이다. 메뉴 항목에 실제로 나오는 글자는 설정 파일에 따라 다르다.'
const figureName = 'GRUB 메뉴에서 Linux 항목을 고르면 GRUB이 Linux 커널을 직접 불러오고, Windows 항목을 고르면 Windows의 부트 로더를 거쳐 Windows가 시작되는 것을 보이는 도식'
const svgName = '테두리 GRUB 메뉴 안의 Linux 항목과 Windows 항목, Linux 커널, Windows의 부트 로더, Windows가 있다'
const expectedScenarios = [
  {
    id: 'linux', label: 'Linux 고르기',
    nodes: ['linux-item', 'kernel'], paths: ['linux-path'], notes: ['linux'],
    caption: 'Linux 항목을 고르면 GRUB이 Linux 커널을 직접 메모리에 올려 실행을 넘긴다. 그 뒤로는 커널이 장치를 준비하고 첫 프로세스 init을 만든다.',
    sources: [anchorConceptId],
  },
  {
    id: 'windows', label: 'Windows 고르기',
    nodes: ['windows-item', 'win-loader', 'windows'], paths: ['chain-path', 'windows-path'], notes: ['windows'],
    caption: 'GRUB은 Windows를 직접 불러오지 못한다. Windows 항목을 고르면 GRUB이 Windows의 부트 로더를 불러와 실행을 넘기고, 그 부트 로더가 Windows를 시작한다. 이렇게 잇는 것을 체인 로딩이라 한다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 216]
const wideBox: [number, number, number, number] = [0, 0, 440, 144]

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

function groupBox(id: string) {
  return rectBox(diagram().querySelector(`rect[data-group="${id}"]`)!, id)
}

function shownIds(selector: string, attribute: string) {
  return Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)!)
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function inside(inner: SvgBox, outer: SvgBox) {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height
}

// 글자 크기 9인 곁말·그룹 라벨이 차지하는 상자. 반각 글자가 화면에서 더 넓게 그려지는 것을 생각해 폭을 1.15배로 잡는다.
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

function pathD(id: string) {
  return diagram().querySelector(`[data-path="${id}"]`)!.getAttribute('d')!
}

async function expectScenario(scenario: typeof expectedScenarios[number], container: HTMLElement) {
  await selectScenario(scenario.label)

  for (const element of diagram().querySelectorAll('[data-node]')) {
    const id = element.getAttribute('data-node')!
    expect(element, id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  for (const element of diagram().querySelectorAll('rect[data-group]')) expect(element).not.toHaveAttribute('opacity')
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
// 메뉴 항목 둘은 테두리 안에 있고 다른 노드는 테두리 밖에 있으며, 그룹 라벨은 테두리 안에서 노드와 겹치지 않는다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = nodeIds.map(nodeBox)
  expect(diagram().querySelectorAll('rect')).toHaveLength(nodeIds.length + groupIds.length)
  expect(boxesOutsideViewBox([...boxes, ...groupIds.map(groupBox)], viewBox)).toEqual([])

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
  for (const id of nodeIds) {
    const inGroup = id === 'linux-item' || id === 'windows-item'
    expect(inGroup ? inside(nodeBox(id), groupBox('menu')) : overlaps(nodeBox(id), groupBox('menu')), id).toBe(inGroup)
  }
  for (const [id, label] of Object.entries(groupLabels)) {
    const text = diagram().querySelector(`[data-group-label="${id}"]`)!
    expect(text.textContent).toBe(label)
    expect(text).toHaveAttribute('font-size', '9')
    const box = textBox(text, id)
    expect(inside(box, groupBox(id)), id).toBe(true)
    for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
  }
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 선마다 끝점이 정한 두 노드의 변 위에 있고, 어떤 선분도 다른 노드 상자 안과 그룹 라벨 영역을 지나지 않는다.
async function expectLines() {
  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    for (const id of scenario.paths) {
      const list = points(pathD(id))
      const [from, to] = ends[id]
      expect(onEdge(list[0], nodeBox(from)), `${id} 시작`).toBe(true)
      expect(onEdge(list[list.length - 1], nodeBox(to)), `${id} 끝`).toBe(true)
      for (let i = 1; i < list.length; i += 1) {
        for (const node of nodeIds.filter((other) => other !== from && other !== to)) {
          expect(crossesInside(list[i - 1], list[i], nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        }
        for (const group of groupIds) {
          const label = textBox(diagram().querySelector(`[data-group-label="${group}"]`)!, group)
          expect(crossesInside(list[i - 1], list[i], label), `${id} ↔ ${group} 라벨`).toBe(false)
        }
      }
    }
  }
}

// 곁말은 viewBox 안에 있고 어느 노드·그룹 라벨·선과도 겹치지 않으며, 바로 위 노드의 아래 변에서 기준선까지 10 이상 띄운다.
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
      for (const group of groupIds) {
        const label = textBox(diagram().querySelector(`[data-group-label="${group}"]`)!, group)
        expect(overlaps(box, label), `${box.id} ↔ ${group}`).toBe(false)
        expect(overlaps(box, groupBox(group)), `${box.id} ↔ ${group} 테두리`).toBe(false)
      }
      for (const id of shownIds('[data-path]', 'data-path')) {
        const list = points(pathD(id))
        for (let i = 1; i < list.length; i += 1) expect(crossesInside(list[i - 1], list[i], box), `${box.id} ↔ ${id}`).toBe(false)
      }
    }
  }
}

// 요점: Windows 고르기에서 보이는 선은 Windows 항목에서 Windows의 부트 로더를 거쳐 Windows에 닿는다(체인 로딩).
// Linux 고르기에서 보이는 선은 부트 로더 노드를 거치지 않고 Linux 항목에서 Linux 커널에 바로 닿는다. 두 시나리오의 선명한 노드는 겹치지 않는다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const opacity = (id: string) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')
  const lit = () => nodeIds.filter((id) => opacity(id) === '1')

  await selectScenario('Windows 고르기')
  const windowsLit = lit()
  expect(shownIds('[data-path]', 'data-path')).toEqual(['chain-path', 'windows-path'])
  const chain = points(pathD('chain-path'))
  const onward = points(pathD('windows-path'))
  expect(onEdge(chain[0], nodeBox('windows-item'))).toBe(true)
  expect(onEdge(chain[chain.length - 1], nodeBox('win-loader'))).toBe(true)
  expect(onEdge(onward[0], nodeBox('win-loader'))).toBe(true)
  expect(onEdge(onward[onward.length - 1], nodeBox('windows'))).toBe(true)

  await selectScenario('Linux 고르기')
  const linuxLit = lit()
  expect(shownIds('[data-path]', 'data-path')).toEqual(['linux-path'])
  const direct = points(pathD('linux-path'))
  expect(onEdge(direct[0], nodeBox('linux-item'))).toBe(true)
  expect(onEdge(direct[direct.length - 1], nodeBox('kernel'))).toBe(true)
  for (const point of direct) expect(onEdge(point, nodeBox('win-loader'))).toBe(false)
  expect(opacity('win-loader')).toBe('0.25')

  expect(linuxLit.filter((id) => windowsLit.includes(id))).toEqual([])
  for (const element of diagram().querySelectorAll('rect[data-group]')) expect(element).not.toHaveAttribute('opacity')

  for (const label of Object.values(labels)) expect(body).toContain(label)
  expect(body).toContain(groupLabels.menu)
  expect(body).toContain('직접 불러온다')
  expect(body).toContain('체인 로딩')
}

describe('GrubMenuDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<GrubMenuDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<GrubMenuDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<GrubMenuDiagram />)
    await expectScenario(scenario, container)
  })

  it('시나리오를 바꾸면 이전 화살표가 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<GrubMenuDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('두 시나리오가 보이는 것(노드·화살표·곁말)이 서로 다르다', () => {
    const keys = expectedScenarios.map(({ nodes, paths, notes }) => JSON.stringify([[...nodes].sort(), paths, notes]))
    expect(new Set(keys).size).toBe(expectedScenarios.length)
  })

  it('노드가 280×216 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<GrubMenuDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 216')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  it('선의 끝점이 노드 변 위에 있고 다른 노드와 그룹 라벨을 지나지 않는다', async () => {
    render(<GrubMenuDiagram />)
    await expectLines()
  })

  it('곁말이 viewBox 안에 있고 노드·테두리·선과 겹치지 않는다', async () => {
    render(<GrubMenuDiagram />)
    await expectNotes(tallBox)
  })

  it('Linux는 GRUB이 커널을 직접 불러오고 Windows는 그 부트 로더를 거친다', async () => {
    render(<GrubMenuDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 고른 시나리오가 섞이지 않는다', async () => {
    const { container } = render(<><GrubMenuDiagram /><GrubMenuDiagram /></>)
    const markerIds = Array.from(container.querySelectorAll('marker'), (marker) => marker.id)
    expect(markerIds).toHaveLength(2)
    expect(new Set(markerIds).size).toBe(2)

    const figures = screen.getAllByRole('figure', { name: figureName })
    await act(async () => { await userEvent.click(within(figures[0]).getByRole('button', { name: 'Windows 고르기' })) })

    expect(within(figures[0]).getByRole('button', { name: 'Windows 고르기' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(figures[1]).getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(figures[1].querySelectorAll('[data-path]')).toHaveLength(0)
    expect(figures[0].querySelector('[data-path]')!.getAttribute('marker-end')).toBe(`url(#${markerIds[0]})`)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<GrubMenuDiagram />)
    const text = visualsByTopicId[topicId].diagrams['grub-menu']
    const ids = grubMenuScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
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
      const scenario = grubMenuScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 GRUB 부트 로더 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×144 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<GrubMenuDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 144')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·그룹 id 집합과 경로 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<GrubMenuDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 216')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroups = shownIds('rect[data-group]', 'data-group').sort()
      const tallPaths: string[] = []
      for (const scenario of expectedScenarios) {
        await selectScenario(scenario.label)
        tallPaths.push(...shownIds('[data-path]', 'data-path'))
      }
      await selectScenario('전체')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 144')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('rect[data-group]', 'data-group').sort()).toEqual(tallGroups)
      const widePaths: string[] = []
      for (const scenario of expectedScenarios) {
        await selectScenario(scenario.label)
        widePaths.push(...shownIds('[data-path]', 'data-path'))
      }
      expect([...new Set(widePaths)].sort()).toEqual([...new Set(tallPaths)].sort())
      expect([...new Set(tallPaths)].sort()).toEqual([...pathIds].sort())
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallGroups).toEqual([...groupIds].sort())
    })

    it('노드가 440×144 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<GrubMenuDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<GrubMenuDiagram />)
      await expectScenario(scenario, container)
    })

    it('선의 끝점이 노드 변 위에 있고 다른 노드와 그룹 라벨을 지나지 않는다', async () => {
      render(<GrubMenuDiagram />)
      await expectLines()
    })

    it('곁말이 viewBox 안에 있고 노드·테두리·선과 겹치지 않는다', async () => {
      render(<GrubMenuDiagram />)
      await expectNotes(wideBox)
    })

    it('Linux는 GRUB이 커널을 직접 불러오고 Windows는 그 부트 로더를 거친다', async () => {
      render(<GrubMenuDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<GrubMenuDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 216')
      await selectScenario('Windows 고르기')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: 'Windows 고르기' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownIds('[data-path]', 'data-path')).toEqual(['chain-path', 'windows-path'])
      expect(diagram().querySelector('[data-node="win-loader"] rect')).toHaveAttribute('x', '176')
    })
  })
})
