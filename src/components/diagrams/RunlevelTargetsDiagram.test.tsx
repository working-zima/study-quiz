import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { RunlevelTargetsDiagram, runlevelTargetsScenarios } from './RunlevelTargetsDiagram'

const topicId = 'linux-process-boot'
const anchorConceptId = `${topicId}.runlevel`

// runlevel(8)의 표 — 실행 레벨 번호와 systemd 타깃의 짝(standards.md 「(phase 76) systemd」 항목). 2·4는 3과 같은 타깃이라 줄로 그리지 않는다.
const pairs: [string, string][] = [
  ['0', 'poweroff.target'],
  ['1', 'rescue.target'],
  ['3', 'multi-user.target'],
  ['5', 'graphical.target'],
  ['6', 'reboot.target'],
]
const levels = pairs.map(([level]) => level)
const labels: Record<string, string> = Object.fromEntries(pairs.flatMap(([level, target]) => [[`level-${level}`, level], [`target-${level}`, target]]))
const groupLabels = {
  'row-0': '끄기',
  'row-1': '복구 모드',
  'row-3': '문자 화면 다중 사용자',
  'row-5': '그래픽 다중 사용자',
  'row-6': '다시 시작',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const pathIds = ['pulls']

// 선마다 시작하는 노드와 끝나는 노드.
const ends: Record<string, [string, string]> = {
  pulls: ['target-5', 'target-3'],
}

const question = '실행 레벨 번호는 어떤 상태일까?'
const idleCaption = '실행 레벨 다섯을 줄마다 놓고, 왼쪽 칸에 번호, 오른쪽 칸에 systemd에서 그 번호와 짝이 되는 타깃을 두었다. 버튼을 고르면 번호마다 시스템이 어떤 상태가 되는지 볼 수 있다.'
const legend = '테두리 위의 이름은 그 줄의 번호가 가리키는 상태다. 화살표는 graphical.target이 multi-user.target을 함께 켠다는 뜻이다.'
const figureName = '실행 레벨 0, 1, 3, 5, 6이 저마다 어떤 상태이고 systemd에서 어느 타깃에 짝지어지는지를 보이는 도식'
const svgName = '끄기, 복구 모드, 문자 화면 다중 사용자, 그래픽 다중 사용자, 다시 시작의 다섯 줄마다 실행 레벨 번호와 짝이 되는 타깃이 있다'
const expectedScenarios = [
  {
    id: 'off-reboot', label: '끄기·다시 시작',
    nodes: ['level-0', 'target-0', 'level-6', 'target-6'], paths: [] as string[],
    caption: '실행 레벨 0은 시스템을 끄고 전원까지 내리는 poweroff.target에, 6은 시스템을 끈 뒤 다시 시작하는 reboot.target에 짝지어진다. 그래서 init 6을 입력하면 시스템이 꺼진 채로 있지 않고 다시 시작된다.',
    sources: [anchorConceptId],
  },
  {
    id: 'multi-user', label: '문자 화면',
    nodes: ['level-3', 'target-3'], paths: [] as string[],
    caption: '실행 레벨 3은 multi-user.target에 짝지어진다. 여러 사용자가 로그인해 쓸 수 있게 서비스를 켜지만 그래픽 로그인 화면은 열지 않는다. 2와 4도 systemd에서는 같은 multi-user.target에 짝지어진다.',
    sources: [anchorConceptId],
  },
  {
    id: 'graphical', label: '그래픽 화면',
    nodes: ['level-5', 'target-5', 'target-3'], paths: ['pulls'],
    caption: '실행 레벨 5는 graphical.target에 짝지어진다. graphical.target은 multi-user.target을 함께 켜고 그 위에 그래픽 로그인 화면까지 세우므로, 5는 3의 상태에 그래픽 로그인 화면을 더한 것이다.',
    sources: [anchorConceptId],
  },
  {
    id: 'rescue', label: '복구 모드',
    nodes: ['level-1', 'target-1'], paths: [] as string[],
    caption: '실행 레벨 1은 rescue.target에 짝지어진다. 파일 시스템은 마운트하지만 가장 기본적인 것 말고는 서비스를 실행하지 않고 셸 하나만 여는 단일 사용자 모드로, 관리자가 시스템을 관리하거나 고칠 때 쓴다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 328]
const wideBox: [number, number, number, number] = [0, 0, 440, 288]

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

// 글자 크기 9인 그룹 라벨이 차지하는 상자. 반각 글자가 화면에서 더 넓게 그려지는 것을 생각해 폭을 1.15배로 잡는다.
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
  expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리·줄끼리 겹치지 않는다.
// 줄마다 번호 칸과 타깃 칸이 그 줄의 테두리 안에서 빈틈없이 이어지고, 그룹 라벨은 테두리 안에서 노드와 겹치지 않는다.
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
  for (let i = 0; i < groupIds.length; i += 1) {
    for (let j = i + 1; j < groupIds.length; j += 1) {
      expect(overlaps(groupBox(groupIds[i]), groupBox(groupIds[j])), `${groupIds[i]} ↔ ${groupIds[j]}`).toBe(false)
    }
  }
  for (const level of levels) {
    const number = nodeBox(`level-${level}`)
    const target = nodeBox(`target-${level}`)
    expect(inside(number, groupBox(`row-${level}`)), `level-${level}`).toBe(true)
    expect(inside(target, groupBox(`row-${level}`)), `target-${level}`).toBe(true)
    expect(number.x + number.width, level).toBe(target.x)
    expect(number.y, level).toBe(target.y)
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

// 요점: 줄마다 번호 칸과 타깃 칸의 짝이 runlevel(8)의 표와 같고, 줄의 상태 이름이 본문 목록 항목의 이름·번호와 같다.
// 그래픽 화면에서 선명한 번호 칸은 5 하나이고, 화살표는 graphical.target에서 나와 multi-user.target에 닿는다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const opacity = (id: string) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')
  const text = (id: string) => diagram().querySelector(`[data-node="${id}"] text`)!.textContent

  for (const [level, target] of pairs) {
    expect(text(`level-${level}`)).toBe(level)
    expect(text(`target-${level}`)).toBe(target)
    const state = groupLabels[`row-${level}` as keyof typeof groupLabels]
    expect(body).toContain(`- **${state}**(\`${level}\`)`)
    expect(body).toContain(`\`${target}\``)
  }
  expect(body).toContain('`0`은 `poweroff.target`, `1`은 `rescue.target`, `2`·`3`·`4`는 `multi-user.target`, `5`는 `graphical.target`, `6`은 `reboot.target`')
  expect(body).toContain('`graphical.target`은 `multi-user.target`을 함께 켜고')

  await selectScenario('그래픽 화면')
  expect(levels.filter((level) => opacity(`level-${level}`) === '1')).toEqual(['5'])
  expect(shownIds('[data-path]', 'data-path')).toEqual(['pulls'])
  const list = points(pathD('pulls'))
  expect(onEdge(list[0], nodeBox('target-5'))).toBe(true)
  expect(onEdge(list[list.length - 1], nodeBox('target-3'))).toBe(true)

  await selectScenario('끄기·다시 시작')
  expect(levels.filter((level) => opacity(`level-${level}`) === '1')).toEqual(['0', '6'])
}

describe('RunlevelTargetsDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<RunlevelTargetsDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<RunlevelTargetsDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표만 보인다', async (scenario) => {
    const { container } = render(<RunlevelTargetsDiagram />)
    await expectScenario(scenario, container)
  })

  it('시나리오를 바꾸면 이전 화살표가 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<RunlevelTargetsDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('네 시나리오가 보이는 것(노드·화살표)이 서로 다르다', () => {
    const keys = expectedScenarios.map(({ nodes, paths }) => JSON.stringify([[...nodes].sort(), paths]))
    expect(new Set(keys).size).toBe(expectedScenarios.length)
  })

  it('노드가 280×328 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<RunlevelTargetsDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 328')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  it('선의 끝점이 노드 변 위에 있고 다른 노드와 그룹 라벨을 지나지 않는다', async () => {
    render(<RunlevelTargetsDiagram />)
    await expectLines()
  })

  it('번호와 타깃의 짝이 runlevel(8)의 표와 같고, 5는 multi-user.target을 함께 켠다', async () => {
    render(<RunlevelTargetsDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 고른 시나리오가 섞이지 않는다', async () => {
    const { container } = render(<><RunlevelTargetsDiagram /><RunlevelTargetsDiagram /></>)
    const markerIds = Array.from(container.querySelectorAll('marker'), (marker) => marker.id)
    expect(markerIds).toHaveLength(2)
    expect(new Set(markerIds).size).toBe(2)

    const figures = screen.getAllByRole('figure', { name: figureName })
    await act(async () => { await userEvent.click(within(figures[0]).getByRole('button', { name: '그래픽 화면' })) })

    expect(within(figures[0]).getByRole('button', { name: '그래픽 화면' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(figures[1]).getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(figures[1].querySelectorAll('[data-path]')).toHaveLength(0)
    expect(figures[0].querySelector('[data-path]')!.getAttribute('marker-end')).toBe(`url(#${markerIds[0]})`)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<RunlevelTargetsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['runlevel-targets']
    const ids = runlevelTargetsScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toBeUndefined()
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
      const scenario = runlevelTargetsScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 실행 레벨 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    const article = figure.closest('article')!

    expect(article).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(article.lastElementChild).toBe(figure)
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

    it('440×288 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<RunlevelTargetsDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 288')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·그룹 id 집합과 경로 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<RunlevelTargetsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 328')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroups = shownIds('rect[data-group]', 'data-group').sort()
      const tallPaths: string[] = []
      for (const scenario of expectedScenarios) {
        await selectScenario(scenario.label)
        tallPaths.push(...shownIds('[data-path]', 'data-path'))
      }
      await selectScenario('전체')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 288')
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

    it('노드가 440×288 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<RunlevelTargetsDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·캡션을 보인다', async (scenario) => {
      const { container } = render(<RunlevelTargetsDiagram />)
      await expectScenario(scenario, container)
    })

    it('선의 끝점이 노드 변 위에 있고 다른 노드와 그룹 라벨을 지나지 않는다', async () => {
      render(<RunlevelTargetsDiagram />)
      await expectLines()
    })

    it('번호와 타깃의 짝이 runlevel(8)의 표와 같고, 5는 multi-user.target을 함께 켠다', async () => {
      render(<RunlevelTargetsDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<RunlevelTargetsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 328')
      await selectScenario('그래픽 화면')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '그래픽 화면' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownIds('[data-path]', 'data-path')).toEqual(['pulls'])
      expect(diagram().querySelector('[data-node="target-5"] rect')).toHaveAttribute('x', '200')
    })
  })
})
