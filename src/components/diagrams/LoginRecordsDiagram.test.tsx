import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { LoginRecordsDiagram, loginRecordsScenarios } from './LoginRecordsDiagram'

const topicId = 'linux-accounts'
const anchorConceptId = `${topicId}.login-records`
const labels = {
  attempt: '로그인 시도',
  success: '성공',
  failure: '실패',
  wtmp: '/var/log/wtmp',
  btmp: '/var/log/btmp',
  last: 'last',
  lastb: 'lastb',
}
const nodeIds = Object.keys(labels)
const linkIds = ['l-success', 'l-wtmp', 'l-last', 'l-failure', 'l-btmp', 'l-lastb']
const pathIds = ['to-success', 'to-wtmp', 'to-last', 'to-failure', 'to-btmp', 'to-lastb']

// 선마다 시작하는 노드와 끝나는 노드. 늘 보이는 화살표(link)와 고른 갈래의 굵은 화살표(path)가 같은 두 노드를 잇는다.
const ends: Record<string, [string, string]> = {
  'l-success': ['attempt', 'success'],
  'l-wtmp': ['success', 'wtmp'],
  'l-last': ['wtmp', 'last'],
  'l-failure': ['attempt', 'failure'],
  'l-btmp': ['failure', 'btmp'],
  'l-lastb': ['btmp', 'lastb'],
  'to-success': ['attempt', 'success'],
  'to-wtmp': ['success', 'wtmp'],
  'to-last': ['wtmp', 'last'],
  'to-failure': ['attempt', 'failure'],
  'to-btmp': ['failure', 'btmp'],
  'to-lastb': ['btmp', 'lastb'],
}

const question = '실패한 로그인 시도는 어디에 남고, 무엇으로 볼까?'
const idleCaption = '로그인 시도가 성공했을 때와 실패했을 때, 기록이 남는 파일과 그 파일을 읽어 보여 주는 명령을 두 갈래로 놓았다. 버튼을 고르면 갈래를 하나씩 따라가 볼 수 있다.'
const legend = '가는 화살표는 로그인 시도에서 기록 파일을 거쳐 그 파일을 읽는 명령까지 잇는다. 굵은 화살표는 고른 갈래다.'
const figureName = '로그인 시도가 성공하면 /var/log/wtmp에 남아 last로 보고, 실패하면 /var/log/btmp에 남아 lastb로 본다는 것을 두 갈래로 보이는 도식'
const svgName = '로그인 시도에서 두 갈래가 나뉘어, 한쪽은 성공에서 /var/log/wtmp를 거쳐 last로, 다른 쪽은 실패에서 /var/log/btmp를 거쳐 lastb로 이어진다'
const expectedScenarios = [
  {
    id: 'success', label: 'last',
    nodes: ['attempt', 'success', 'wtmp', 'last'], paths: ['to-success', 'to-wtmp', 'to-last'],
    caption: '로그인에 성공하면 그 로그인과 뒤의 로그아웃이 /var/log/wtmp에 쌓이고, last가 이 파일을 읽어 기록을 늘어놓는다. 시스템을 다시 시작한 일도 이 파일에 남는다.',
    sources: [anchorConceptId],
  },
  {
    id: 'failure', label: 'lastb',
    nodes: ['attempt', 'failure', 'btmp', 'lastb'], paths: ['to-failure', 'to-btmp', 'to-lastb'],
    caption: '로그인하려다 실패한 시도는 /var/log/btmp에 쌓이고, lastb가 이 파일을 읽어 보인다. 허락받지 않은 사람이 남의 계정으로 들어오려 했는지 살필 때 쓴다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 248]
const wideBox: [number, number, number, number] = [0, 0, 440, 112]

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

// 굵은 화살표 하나가 닿는 노드(시작·끝 변 위에 있는 노드)들.
function touched(id: string) {
  const list = points(lineD(id))
  return nodeIds.filter((node) => onEdge(list[0], nodeBox(node)) || onEdge(list[list.length - 1], nodeBox(node)))
}

async function expectScenario(scenario: typeof expectedScenarios[number], container: HTMLElement) {
  await selectScenario(scenario.label)

  for (const element of diagram().querySelectorAll('[data-node]')) {
    const id = element.getAttribute('data-node')!
    expect(element, id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
  expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
  expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
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

// 늘 보이는 화살표와 고른 갈래의 화살표 모두 끝점이 정한 두 노드의 변 위에 있고, 다른 노드 상자 안을 지나지 않는다.
async function expectLines() {
  for (const id of linkIds) expectLine(id)
  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    for (const id of scenario.paths) expectLine(id)
  }
}

// 요점: 실패 갈래의 굵은 화살표는 /var/log/btmp를 지나 lastb에 닿고 /var/log/wtmp에는 닿지 않는다. 성공 갈래는 그 반대다.
// 두 갈래가 함께 밝히는 노드는 로그인 시도 하나뿐이고, 본문의 목록 항목이 같은 짝(명령과 파일)을 말한다.
async function expectPoint() {
  const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
  const items = concept.paragraphs.filter((paragraph) => paragraph.startsWith('- **'))
  const lit: Record<string, string[]> = {}
  const pairs: [string, string, string, string][] = [['failure', 'btmp', 'lastb', 'wtmp'], ['success', 'wtmp', 'last', 'btmp']]

  for (const [scenarioId, file, command, otherFile] of pairs) {
    const scenario = expectedScenarios.find(({ id }) => id === scenarioId)!
    await selectScenario(scenario.label)
    const shown = shownIds('[data-path]', 'data-path')
    const reached = new Set(shown.flatMap(touched))
    lit[scenarioId] = shownIds('[data-node]', 'data-node').filter((id) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')

    expect(reached.has(file), `${scenario.label} → ${labels[file as keyof typeof labels]}`).toBe(true)
    expect(reached.has(command), `${scenario.label} → ${command}`).toBe(true)
    expect(reached.has(otherFile), `${scenario.label}가 ${labels[otherFile as keyof typeof labels]}에 닿지 않는다`).toBe(false)
    const toCommand = shown.find((id) => ends[id][1] === command)!
    const list = points(lineD(toCommand))
    expect(onEdge(list[0], nodeBox(file)), `${command}로 가는 화살표는 ${file}에서 나온다`).toBe(true)

    const item = items.find((paragraph) => paragraph.includes(`(\`${labels[command as keyof typeof labels]}\`)`))!
    expect(item, command).toContain(`\`${labels[file as keyof typeof labels]}\``)
    expect(item).not.toContain(`\`${labels[otherFile as keyof typeof labels]}\``)
  }

  expect(lit.success.filter((id) => lit.failure.includes(id))).toEqual(['attempt'])
  const body = concept.paragraphs.join('\n')
  for (const word of ['로그인 시도', '성공', '실패']) expect(body).toContain(word)
}

describe('LoginRecordsDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<LoginRecordsDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 늘 보이는 화살표만 있으며 굵은 화살표 없이 선택 안내가 나온다', () => {
    const { container } = render(<LoginRecordsDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(shownIds('[data-link]', 'data-link')).toEqual(linkIds)
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표만 보인다', async (scenario) => {
    const { container } = render(<LoginRecordsDiagram />)
    await expectScenario(scenario, container)
  })

  it('시나리오를 바꾸면 이전 화살표가 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<LoginRecordsDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('두 시나리오가 보이는 것(노드·화살표)이 서로 다르다', () => {
    const keys = expectedScenarios.map(({ nodes, paths }) => JSON.stringify([[...nodes].sort(), paths]))
    expect(new Set(keys).size).toBe(expectedScenarios.length)
  })

  it('노드가 280×248 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<LoginRecordsDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 248')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  it('화살표의 끝점이 노드 변 위에 있고 다른 노드를 지나지 않는다', async () => {
    render(<LoginRecordsDiagram />)
    await expectLines()
  })

  it('실패 갈래는 /var/log/btmp를 지나 lastb에 닿고 /var/log/wtmp에는 닿지 않으며, 성공 갈래는 그 반대다', async () => {
    render(<LoginRecordsDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 고른 시나리오가 섞이지 않는다', async () => {
    const { container } = render(<><LoginRecordsDiagram /><LoginRecordsDiagram /></>)
    const markerIds = Array.from(container.querySelectorAll('marker'), (marker) => marker.id)
    expect(markerIds).toHaveLength(4)
    expect(new Set(markerIds).size).toBe(4)

    const figures = screen.getAllByRole('figure', { name: figureName })
    await act(async () => { await userEvent.click(within(figures[0]).getByRole('button', { name: 'lastb' })) })

    expect(within(figures[0]).getByRole('button', { name: 'lastb' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(figures[1]).getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(figures[1].querySelectorAll('[data-path]')).toHaveLength(0)
    const firstMarkers = Array.from(figures[0].querySelectorAll('marker'), (marker) => marker.id)
    expect(figures[0].querySelector('[data-path]')!.getAttribute('marker-end')).toMatch(new RegExp(`^url\\(#(${firstMarkers.join('|')})\\)$`, 'u'))
    for (const link of figures[0].querySelectorAll('[data-link]')) expect(firstMarkers.map((id) => `url(#${id})`)).toContain(link.getAttribute('marker-end'))
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<LoginRecordsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['login-records']
    const ids = loginRecordsScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
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
      const scenario = loginRecordsScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 로그인 기록 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×112 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<LoginRecordsDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 112')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드 id 집합과 늘 보이는 화살표·경로 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<LoginRecordsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 248')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallLinks = shownIds('[data-link]', 'data-link').sort()
      const tallPaths: string[] = []
      for (const scenario of expectedScenarios) {
        await selectScenario(scenario.label)
        tallPaths.push(...shownIds('[data-path]', 'data-path'))
      }
      await selectScenario('전체')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 112')
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

    it('노드가 440×112 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<LoginRecordsDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·캡션을 보인다', async (scenario) => {
      const { container } = render(<LoginRecordsDiagram />)
      await expectScenario(scenario, container)
    })

    it('화살표의 끝점이 노드 변 위에 있고 다른 노드를 지나지 않는다', async () => {
      render(<LoginRecordsDiagram />)
      await expectLines()
    })

    it('실패 갈래는 /var/log/btmp를 지나 lastb에 닿고 /var/log/wtmp에는 닿지 않으며, 성공 갈래는 그 반대다', async () => {
      render(<LoginRecordsDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<LoginRecordsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 248')
      await selectScenario('lastb')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: 'lastb' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownIds('[data-path]', 'data-path')).toEqual(['to-failure', 'to-btmp', 'to-lastb'])
      expect(diagram().querySelector('[data-node="btmp"] rect')).toHaveAttribute('x', '232')
    })
  })
})
