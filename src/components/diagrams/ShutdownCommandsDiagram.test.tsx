import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ShutdownCommandsDiagram, shutdownCommandsScenarios } from './ShutdownCommandsDiagram'

const topicId = 'linux-process-boot'
const anchorConceptId = `${topicId}.shutdown-commands`

const labels = {
  'cmd-shutdown-h': 'shutdown -h now',
  'cmd-poweroff': 'poweroff',
  'cmd-init-0': 'init 0',
  'cmd-halt': 'halt',
  'cmd-shutdown-r': 'shutdown -r now',
  'cmd-reboot': 'reboot',
  'cmd-init-6': 'init 6',
  'result-off': '전원까지 꺼진다',
  'result-halt': '멈춘다',
  'result-reboot': '다시 켜진다',
}
const noteLabels = {
  halt: '전원은 켜 둔다',
  reboot: '끈 채로 두지 않는다',
}
const nodeIds = Object.keys(labels)
const commandIds = nodeIds.filter((id) => id.startsWith('cmd-'))
const resultIds = nodeIds.filter((id) => id.startsWith('result-'))

// 명령마다 시스템을 끝낸 뒤의 결과(shutdown(8)·halt(8)·telinit(8) — standards.md 「(phase 76) systemd」 항목). halt는 systemd 기준이다.
const resultOf: Record<string, string> = {
  'cmd-shutdown-h': 'result-off',
  'cmd-poweroff': 'result-off',
  'cmd-init-0': 'result-off',
  'cmd-halt': 'result-halt',
  'cmd-shutdown-r': 'result-reboot',
  'cmd-reboot': 'result-reboot',
  'cmd-init-6': 'result-reboot',
}
const linkIds = commandIds.map((id) => `l-${id.slice(4)}`)
const pathIds = commandIds.map((id) => `to-${id.slice(4)}`)

// 선마다 시작하는 노드와 끝나는 노드 — 늘 보이는 가는 화살표와 고른 시나리오의 굵은 화살표가 같은 두 노드를 잇는다.
const ends: Record<string, [string, string]> = Object.fromEntries(commandIds.flatMap((id) => [
  [`l-${id.slice(4)}`, [id, resultOf[id]]],
  [`to-${id.slice(4)}`, [id, resultOf[id]]],
]))

const question = '이 명령을 입력하면 시스템은 어떻게 될까?'
const idleCaption = '시스템을 끄고 다시 시작하는 명령 일곱과, 시스템을 끝낸 뒤의 결과 셋을 두고 명령마다 그 결과를 화살표로 이었다. 버튼을 고르면 같은 결과를 내는 명령들을 함께 볼 수 있다.'
const legend = '화살표는 그 명령을 입력했을 때 시스템을 끝낸 뒤 어떻게 되는지를 가리킨다. halt의 결과는 systemd를 쓰는 시스템을 기준으로 그렸다.'
const figureName = '시스템을 끄고 다시 시작하는 명령 일곱이 저마다 시스템을 끝낸 뒤 전원까지 꺼지는지, 멈추는지, 다시 켜지는지를 화살표로 이은 도식'
const svgName = 'shutdown -h now, poweroff, init 0은 전원까지 꺼진다로, halt는 멈춘다로, shutdown -r now, reboot, init 6은 다시 켜진다로 화살표가 이어져 있다'
const expectedScenarios = [
  {
    id: 'poweroff', label: '끄기',
    nodes: ['cmd-shutdown-h', 'cmd-poweroff', 'cmd-init-0', 'result-off'],
    paths: ['to-shutdown-h', 'to-poweroff', 'to-init-0'], notes: [] as string[],
    caption: 'shutdown -h now, poweroff, init 0은 모두 시스템을 끝내고 전원까지 내린다. 디스크 같은 부품을 바꾸려고 전원을 꺼 두어야 할 때는 이 셋 가운데 하나를 입력한다.',
    sources: [anchorConceptId],
  },
  {
    id: 'halt', label: '멈추기',
    nodes: ['cmd-halt', 'result-halt'],
    paths: ['to-halt'], notes: ['halt'],
    caption: 'halt도 시스템을 끝내지만, systemd를 쓰는 시스템에서는 운영체제만 멈추고 전원은 켜 둔다. 전원까지 끄려면 poweroff를 쓴다. 예전 SysV init을 쓰던 많은 시스템에서는 halt도 전원까지 껐다.',
    sources: [anchorConceptId],
  },
  {
    id: 'reboot', label: '다시 시작',
    nodes: ['cmd-shutdown-r', 'cmd-reboot', 'cmd-init-6', 'result-reboot'],
    paths: ['to-shutdown-r', 'to-reboot', 'to-init-6'], notes: ['reboot'],
    caption: 'shutdown -r now, reboot, init 6은 모두 시스템을 끝낸 뒤 다시 시작한다. 그래서 init 6은 시스템을 끈 채로 두지 않는다. 전원을 꺼 두려는데 init 6을 입력하면 컴퓨터가 꺼졌다가 다시 켜진다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 312]
const wideBox: [number, number, number, number] = [0, 0, 440, 232]

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

// 늘 보이는 화살표와 고른 시나리오의 화살표 모두 끝점이 정한 두 노드의 변 위에 있고, 다른 노드 상자 안을 지나지 않는다.
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

// 요점: 명령마다 늘 보이는 화살표가 하나뿐이고 결과 노드 하나에만 닿는다. 그 결과가 본문이 묶은 결과와 같다.
// init 6은 다시 시작에서 선명하고 끄기에서 흐리며, init 0은 그 반대다. 라벨과 곁말의 말은 본문에 있다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const opacity = (id: string) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')

  for (const command of commandIds) {
    const leaving = linkIds.filter((id) => onEdge(points(lineD(id))[0], nodeBox(command)))
    expect(leaving, command).toEqual([`l-${command.slice(4)}`])
    const list = points(lineD(leaving[0]))
    const reached = resultIds.filter((result) => onEdge(list[list.length - 1], nodeBox(result)))
    expect(reached, command).toEqual([resultOf[command]])
    expect(body, command).toContain(`\`${labels[command as keyof typeof labels]}\``)
  }
  for (const label of [...resultIds.map((id) => labels[id as keyof typeof labels]), ...Object.values(noteLabels)]) {
    expect(body).toContain(label)
  }
  expect(body).toContain('`shutdown -h now`·`poweroff`·`init 0`을 입력하면 시스템이 끝나고 전원까지 꺼진다')
  expect(body).toContain('`shutdown -r now`·`reboot`·`init 6`을 입력하면 시스템이 꺼졌다가 다시 켜진다')
  expect(body).toContain('`init 6`은 시스템을 끈 채로 두지 않는다')

  await selectScenario('다시 시작')
  expect(opacity('cmd-init-6')).toBe('1')
  expect(opacity('cmd-init-0')).toBe('0.25')
  expect(shownIds('[data-path]', 'data-path')).toContain('to-init-6')

  await selectScenario('끄기')
  expect(opacity('cmd-init-0')).toBe('1')
  expect(opacity('cmd-init-6')).toBe('0.25')
  expect(shownIds('[data-path]', 'data-path')).not.toContain('to-init-6')
  expect(opacity('result-reboot')).toBe('0.25')
}

describe('ShutdownCommandsDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<ShutdownCommandsDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 늘 보이는 화살표만 있으며 선택 안내가 나온다', () => {
    const { container } = render(<ShutdownCommandsDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<ShutdownCommandsDiagram />)
    await expectScenario(scenario, container)
  })

  it('시나리오를 바꾸면 이전 화살표·곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<ShutdownCommandsDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
      expect(shownIds('[data-note]', 'data-note')).toEqual(scenario.notes)
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('세 시나리오가 보이는 것(노드·화살표·곁말)이 서로 다르고, 셋을 합하면 명령 일곱과 결과 셋을 모두 덮는다', () => {
    const keys = expectedScenarios.map(({ nodes, paths, notes }) => JSON.stringify([[...nodes].sort(), paths, notes]))
    expect(new Set(keys).size).toBe(expectedScenarios.length)
    expect(expectedScenarios.flatMap(({ nodes }) => nodes).sort()).toEqual([...nodeIds].sort())
    expect(expectedScenarios.flatMap(({ paths }) => paths).sort()).toEqual([...pathIds].sort())
  })

  it('노드가 280×312 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<ShutdownCommandsDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 312')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  it('선의 끝점이 노드 변 위에 있고 다른 노드를 지나지 않는다', async () => {
    render(<ShutdownCommandsDiagram />)
    await expectLines()
  })

  it('곁말이 viewBox 안에 있고 노드·선과 겹치지 않는다', async () => {
    render(<ShutdownCommandsDiagram />)
    await expectNotes(tallBox)
  })

  it('명령마다 화살표가 결과 하나에만 닿고, init 6은 다시 시작에, init 0은 끄기에 든다', async () => {
    render(<ShutdownCommandsDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 고른 시나리오가 섞이지 않는다', async () => {
    const { container } = render(<><ShutdownCommandsDiagram /><ShutdownCommandsDiagram /></>)
    const markerIds = Array.from(container.querySelectorAll('marker'), (marker) => marker.id)
    expect(markerIds).toHaveLength(4)
    expect(new Set(markerIds).size).toBe(4)

    const figures = screen.getAllByRole('figure', { name: figureName })
    await act(async () => { await userEvent.click(within(figures[0]).getByRole('button', { name: '멈추기' })) })

    expect(within(figures[0]).getByRole('button', { name: '멈추기' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(figures[1]).getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(figures[1].querySelectorAll('[data-path]')).toHaveLength(0)
    const firstMarkers = Array.from(figures[0].querySelectorAll('marker'), (marker) => marker.id)
    expect(figures[0].querySelector('[data-path]')!.getAttribute('marker-end')).toMatch(new RegExp(`^url\\(#(${firstMarkers.join('|')})\\)$`, 'u'))
    for (const link of figures[0].querySelectorAll('[data-link]')) expect(firstMarkers.map((id) => `url(#${id})`)).toContain(link.getAttribute('marker-end'))
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<ShutdownCommandsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['shutdown-commands']
    const ids = shutdownCommandsScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.notes).toEqual(noteLabels)
    expect(text.groups).toBeUndefined()
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
      const scenario = shutdownCommandsScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 끄고 다시 시작하는 명령 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×232 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<ShutdownCommandsDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 232')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드 id 집합과 늘 보이는 화살표·경로·곁말 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<ShutdownCommandsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 312')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallLinks = shownIds('[data-link]', 'data-link').sort()
      const tallPaths: string[] = []
      const tallNotes: string[] = []
      for (const scenario of expectedScenarios) {
        await selectScenario(scenario.label)
        tallPaths.push(...shownIds('[data-path]', 'data-path'))
        tallNotes.push(...shownIds('[data-note]', 'data-note'))
      }
      await selectScenario('전체')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 232')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-link]', 'data-link').sort()).toEqual(tallLinks)
      const widePaths: string[] = []
      const wideNotes: string[] = []
      for (const scenario of expectedScenarios) {
        await selectScenario(scenario.label)
        widePaths.push(...shownIds('[data-path]', 'data-path'))
        wideNotes.push(...shownIds('[data-note]', 'data-note'))
      }
      expect([...new Set(widePaths)].sort()).toEqual([...new Set(tallPaths)].sort())
      expect([...new Set(wideNotes)].sort()).toEqual([...new Set(tallNotes)].sort())
      expect([...new Set(tallPaths)].sort()).toEqual([...pathIds].sort())
      expect(tallLinks).toEqual([...linkIds].sort())
      expect(tallNodes).toEqual([...nodeIds].sort())
    })

    it('노드가 440×232 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<ShutdownCommandsDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<ShutdownCommandsDiagram />)
      await expectScenario(scenario, container)
    })

    it('선의 끝점이 노드 변 위에 있고 다른 노드를 지나지 않는다', async () => {
      render(<ShutdownCommandsDiagram />)
      await expectLines()
    })

    it('곁말이 viewBox 안에 있고 노드·선과 겹치지 않는다', async () => {
      render(<ShutdownCommandsDiagram />)
      await expectNotes(wideBox)
    })

    it('명령마다 화살표가 결과 하나에만 닿고, init 6은 다시 시작에, init 0은 끄기에 든다', async () => {
      render(<ShutdownCommandsDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<ShutdownCommandsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 312')
      await selectScenario('다시 시작')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '다시 시작' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownIds('[data-path]', 'data-path')).toEqual(['to-shutdown-r', 'to-reboot', 'to-init-6'])
      expect(diagram().querySelector('[data-node="cmd-reboot"] rect')).toHaveAttribute('x', '320')
    })
  })
})
