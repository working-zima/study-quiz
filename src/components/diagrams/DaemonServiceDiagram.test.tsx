import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { DaemonServiceDiagram, daemonServiceScenarios } from './DaemonServiceDiagram'

const topicId = 'linux-process-boot'
const anchorConceptId = `${topicId}.daemon`
const labels = {
  admin: '관리자',
  pid1: 'PID 1 systemd',
  sshd: '812 sshd',
  remote: '다른 컴퓨터',
}
const noteLabels = {
  boot: '부팅할 때 실행',
  manual: 'systemctl로 요청',
  waiting: '터미널 없이 접속을 기다림',
}
const nodeIds = Object.keys(labels)
const pathIds = ['start-path', 'request-path', 'connect-path']

// 선마다 시작하는 노드와 끝나는 노드.
const ends: Record<string, [string, string]> = {
  'start-path': ['pid1', 'sshd'],
  'request-path': ['admin', 'pid1'],
  'connect-path': ['remote', 'sshd'],
}

const question = '데몬은 언제 켜지고 무엇을 할까?'
const idleCaption = '관리자, PID 1로 실행된 systemd, 데몬 sshd, 원격으로 접속해 오는 다른 컴퓨터를 놓았다. 번호 812는 예로 붙인 것이다. 버튼을 고르면 sshd가 언제 누구에 의해 켜지고 켜진 뒤 무엇을 하는지 볼 수 있다.'
const legend = '화살표는 요청이나 실행이 가는 방향이다.'
const figureName = '데몬 sshd가 부팅할 때 systemd에 의해 켜지고, 부팅 뒤에는 관리자의 요청을 받은 systemd가 켜며, 켜진 뒤에는 터미널 없이 다른 컴퓨터의 접속을 기다린다는 것을 보이는 도식'
const svgName = '왼쪽 위에 관리자, 그 아래에 PID 1 systemd가 있고, 오른쪽에 812 sshd와 다른 컴퓨터가 있다'
const expectedScenarios = [
  {
    id: 'boot', label: '부팅 때',
    nodes: ['pid1', 'sshd'], paths: ['start-path'], notes: ['boot'],
    caption: '부팅하는 동안 PID 1로 실행된 systemd가 켜 두기로 정한 데몬들을 실행하고, 원격 접속을 받는 데몬 sshd도 대개 이때 시작된다.',
    sources: [anchorConceptId],
  },
  {
    id: 'manual', label: '부팅 뒤',
    nodes: ['admin', 'pid1', 'sshd'], paths: ['request-path', 'start-path'], notes: ['manual'],
    caption: '부팅이 끝난 뒤에도 관리자가 systemctl 명령으로 systemd에 요청하면, 요청을 받은 systemd가 멈춰 있던 sshd를 실행하거나 실행 중인 sshd를 멈춘다.',
    sources: [anchorConceptId],
  },
  {
    id: 'waiting', label: '요청 기다리기',
    nodes: ['remote', 'sshd'], paths: ['connect-path'], notes: ['waiting'],
    caption: 'sshd는 어느 터미널에도 딸리지 않고 백그라운드에서 계속 실행되며, 다른 컴퓨터가 원격으로 접속해 오기를 기다린다. 접속이 들어오면 그 접속을 맡을 새 sshd 프로세스를 자식으로 만든다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 148]
const wideBox: [number, number, number, number] = [0, 0, 440, 140]

function diagram() {
  return screen.getByRole('img', { name: svgName })
}

async function selectScenario(label: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) })
}

function nodeBox(id: string): SvgBox {
  const rect = diagram().querySelector(`[data-node="${id}"] rect`)!
  return {
    id,
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
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

function pathD(id: string) {
  return diagram().querySelector(`[data-path="${id}"]`)!.getAttribute('d')!
}

async function expectScenario(scenario: typeof expectedScenarios[number], container: HTMLElement) {
  await selectScenario(scenario.label)

  for (const element of diagram().querySelectorAll('[data-node]')) {
    const id = element.getAttribute('data-node')!
    expect(element, id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
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
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 선마다 끝점이 정한 두 노드의 변 위에 있고, 어떤 선분도 다른 노드 상자 안을 지나지 않는다.
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
      }
    }
  }
}

// 곁말은 viewBox 안에 있고 어느 노드와도 겹치지 않으며, 바로 위 노드의 아래 변에서 기준선까지 10 이상 띄운다.
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
    }
  }
}

// 요점: 부팅 때와 부팅 뒤 모두 sshd에 닿는 선은 systemd(PID 1)에서 나온다. 관리자의 선은 systemd에서 끝나고 sshd로 바로 가지 않는다.
// 관리자는 부팅 뒤에만 선명하고, 요청 기다리기에서는 PID 1이 흐리며 다른 컴퓨터의 선이 sshd에 닿는다. 곁말의 말은 개념 본문에 있다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const opacity = (id: string) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')

  for (const label of ['부팅 때', '부팅 뒤']) {
    await selectScenario(label)
    const reachingSshd = shownIds('[data-path]', 'data-path').filter((id) => {
      const list = points(pathD(id))
      return onEdge(list[list.length - 1], nodeBox('sshd'))
    })
    expect(reachingSshd, label).toHaveLength(1)
    expect(onEdge(points(pathD(reachingSshd[0]))[0], nodeBox('pid1')), label).toBe(true)
    for (const id of shownIds('[data-path]', 'data-path')) {
      const list = points(pathD(id))
      if (onEdge(list[0], nodeBox('admin'))) {
        expect(onEdge(list[list.length - 1], nodeBox('pid1')), id).toBe(true)
        expect(onEdge(list[list.length - 1], nodeBox('sshd')), id).toBe(false)
      }
    }
    expect(opacity('admin'), label).toBe(label === '부팅 뒤' ? '1' : '0.25')
  }

  await selectScenario('요청 기다리기')
  expect(opacity('pid1')).toBe('0.25')
  expect(opacity('admin')).toBe('0.25')
  const connect = points(pathD('connect-path'))
  expect(onEdge(connect[0], nodeBox('remote'))).toBe(true)
  expect(onEdge(connect[connect.length - 1], nodeBox('sshd'))).toBe(true)

  expect(body).toContain('PID 1로 실행된 systemd')
  expect(body).toContain('`systemctl` 명령으로 systemd에 요청하고')
  expect(body).toContain('어느 터미널에도 딸리지 않고')
  expect(body).toContain('부팅할 때만 시작될 수 있는 것은 아니다')
}

describe('DaemonServiceDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<DaemonServiceDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<DaemonServiceDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<DaemonServiceDiagram />)
    await expectScenario(scenario, container)
  })

  it('시나리오를 바꾸면 이전 화살표가 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<DaemonServiceDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('세 시나리오가 보이는 것(노드·화살표·곁말)이 서로 다르다', () => {
    const keys = expectedScenarios.map(({ nodes, paths, notes }) => JSON.stringify([[...nodes].sort(), paths, notes]))
    expect(new Set(keys).size).toBe(expectedScenarios.length)
  })

  it('노드가 280×148 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<DaemonServiceDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 148')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  it('선의 끝점이 노드 변 위에 있고 다른 노드를 지나지 않는다', async () => {
    render(<DaemonServiceDiagram />)
    await expectLines()
  })

  it('곁말이 viewBox 안에 있고 노드와 겹치지 않는다', async () => {
    render(<DaemonServiceDiagram />)
    await expectNotes(tallBox)
  })

  it('sshd를 켜는 것은 늘 systemd이고, 관리자는 부팅 뒤에 systemd에 요청하며, 켜진 sshd는 터미널 없이 접속을 기다린다', async () => {
    render(<DaemonServiceDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 고른 시나리오가 섞이지 않는다', async () => {
    const { container } = render(<><DaemonServiceDiagram /><DaemonServiceDiagram /></>)
    const markerIds = Array.from(container.querySelectorAll('marker'), (marker) => marker.id)
    expect(markerIds).toHaveLength(2)
    expect(new Set(markerIds).size).toBe(2)

    const figures = screen.getAllByRole('figure', { name: figureName })
    await act(async () => { await userEvent.click(within(figures[0]).getByRole('button', { name: '부팅 때' })) })

    expect(within(figures[0]).getByRole('button', { name: '부팅 때' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(figures[1]).getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(figures[1].querySelectorAll('[data-path]')).toHaveLength(0)
    expect(figures[0].querySelector('[data-path]')!.getAttribute('marker-end')).toBe(`url(#${markerIds[0]})`)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<DaemonServiceDiagram />)
    const text = visualsByTopicId[topicId].diagrams['daemon-service']
    const ids = daemonServiceScenarios.map(({ id }) => id).sort()
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
      const scenario = daemonServiceScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 데몬 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×140 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<DaemonServiceDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 140')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드 id 집합과 경로 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<DaemonServiceDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 148')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallPaths: string[] = []
      for (const scenario of expectedScenarios) {
        await selectScenario(scenario.label)
        tallPaths.push(...shownIds('[data-path]', 'data-path'))
      }
      await selectScenario('전체')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 140')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      const widePaths: string[] = []
      for (const scenario of expectedScenarios) {
        await selectScenario(scenario.label)
        widePaths.push(...shownIds('[data-path]', 'data-path'))
      }
      expect([...new Set(widePaths)].sort()).toEqual([...new Set(tallPaths)].sort())
      expect([...new Set(tallPaths)].sort()).toEqual([...pathIds].sort())
      expect(tallNodes).toEqual([...nodeIds].sort())
    })

    it('노드가 440×140 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<DaemonServiceDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<DaemonServiceDiagram />)
      await expectScenario(scenario, container)
    })

    it('선의 끝점이 노드 변 위에 있고 다른 노드를 지나지 않는다', async () => {
      render(<DaemonServiceDiagram />)
      await expectLines()
    })

    it('곁말이 viewBox 안에 있고 노드와 겹치지 않는다', async () => {
      render(<DaemonServiceDiagram />)
      await expectNotes(wideBox)
    })

    it('sshd를 켜는 것은 늘 systemd이고, 관리자는 부팅 뒤에 systemd에 요청하며, 켜진 sshd는 터미널 없이 접속을 기다린다', async () => {
      render(<DaemonServiceDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<DaemonServiceDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 148')
      await selectScenario('부팅 뒤')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '부팅 뒤' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownIds('[data-path]', 'data-path')).toEqual(['request-path', 'start-path'])
      expect(diagram().querySelector('[data-node="sshd"] rect')).toHaveAttribute('x', '200')
    })
  })
})
