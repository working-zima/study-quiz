import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { UseraddOptionsDiagram, useraddOptionsScenarios } from './UseraddOptionsDiagram'

const topicId = 'linux-accounts'
const anchorConceptId = `${topicId}.useradd`
const labels = {
  'useradd': 'useradd',
  'opt-m': '-m',
  'opt-g': '-g dev',
  'opt-supp': '-G ops',
  'opt-s': '-s /bin/bash',
  'name': 'user4',
  'passwd-name': '사용자 이름 user4',
  'passwd-gid': 'GID 2001',
  'passwd-shell': '로그인 셸 /bin/bash',
  'home': '/home/user4',
  'group-ops': 'ops 줄에 user4',
}
const groupLabels = { 'command': '입력한 명령', 'passwd': '/etc/passwd에 생긴 줄', 'group-file': '/etc/group' }
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const pathIds = ['name-path', 'primary-path', 'supplementary-path', 'home-path', 'shell-path']

// 명령을 차례대로 나눈 덩어리.
const tokens = ['useradd', 'opt-m', 'opt-g', 'opt-supp', 'opt-s', 'name']

// 노드마다 들어 있는 테두리. 홈 디렉터리는 어느 테두리에도 들지 않는다.
const memberOf: Record<string, string | null> = {
  'useradd': 'command', 'opt-m': 'command', 'opt-g': 'command', 'opt-supp': 'command', 'opt-s': 'command', 'name': 'command',
  'passwd-name': 'passwd', 'passwd-gid': 'passwd', 'passwd-shell': 'passwd',
  'group-ops': 'group-file',
  'home': null,
}

// 선마다 시작하는 노드와 끝나는 노드.
const ends: Record<string, [string, string]> = {
  'name-path': ['name', 'passwd-name'],
  'primary-path': ['opt-g', 'passwd-gid'],
  'supplementary-path': ['opt-supp', 'group-ops'],
  'home-path': ['opt-m', 'home'],
  'shell-path': ['opt-s', 'passwd-shell'],
}

const question = 'useradd의 옵션은 어디에 무엇을 남길까?'
const idleCaption = 'useradd -m -g dev -G ops -s /bin/bash user4를 옵션과 그 값끼리 묶어 놓고, 그 결과로 /etc/passwd와 /etc/group에 적히는 것과 새로 만들어지는 홈 디렉터리를 놓았다. 버튼을 고르면 옵션마다 무엇을 남기는지 볼 수 있다.'
const legend = '입력한 명령을 옵션과 그 값끼리 묶은 덩어리로 나눠 차례대로 놓았다. 화살표는 그 덩어리가 남기는 곳으로 간다.'
const figureName = 'useradd -m -g dev -G ops -s /bin/bash user4의 옵션마다, 그 결과가 /etc/passwd의 줄과 /etc/group의 ops 줄, 새 홈 디렉터리 가운데 어디에 남는지 보이는 도식'
const svgName = '테두리 입력한 명령 안에 useradd, -m, -g dev, -G ops, -s /bin/bash, user4가 차례로 놓이고, 테두리 /etc/passwd에 생긴 줄 안에 사용자 이름 user4, GID 2001, 로그인 셸 /bin/bash가, 테두리 /etc/group 안에 ops 줄에 user4가 있으며, 따로 /home/user4가 있다'
const expectedScenarios = [
  {
    id: 'name', label: '이름',
    nodes: ['name', 'passwd-name'], paths: ['name-path'],
    caption: '맨 뒤에 적은 user4가 새 계정의 이름이다. 이 이름으로 /etc/passwd에 user4의 줄이 더해지고, 그 첫째 칸인 사용자 이름 칸에 user4가 적힌다.',
    sources: [anchorConceptId],
  },
  {
    id: 'primary', label: '-g',
    nodes: ['opt-g', 'passwd-gid'], paths: ['primary-path'],
    caption: '-g dev는 기본 그룹을 dev 하나로 정한다. dev의 GID 2001이 /etc/passwd에 생긴 user4 줄의 GID 칸에 적힌다.',
    sources: [anchorConceptId],
  },
  {
    id: 'supplementary', label: '-G',
    nodes: ['opt-supp', 'group-ops'], paths: ['supplementary-path'],
    caption: '-G ops는 ops를 보조 그룹으로 정한다. /etc/passwd의 GID 칸에는 적히지 않고, /etc/group의 ops 줄에 user4가 더해진다.',
    sources: [anchorConceptId],
  },
  {
    id: 'home-shell', label: '-m·-s',
    nodes: ['opt-m', 'opt-s', 'home', 'passwd-shell'], paths: ['home-path', 'shell-path'],
    caption: '-m은 홈 디렉터리 /home/user4를 새로 만들고, -s /bin/bash는 로그인 셸을 정해 /etc/passwd의 로그인 셸 칸에 /bin/bash를 적는다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 304]
const wideBox: [number, number, number, number] = [0, 0, 440, 230]

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
  const parts = d.trim().split(/\s+/u)
  let x = 0
  let y = 0
  for (let i = 0; i < parts.length; i += 1) {
    const command = parts[i][0]
    const value = parts[i].slice(1)
    if (command === 'M') {
      x = Number(value)
      y = Number(parts[i + 1])
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

function touches([x, y]: [number, number], box: SvgBox) {
  return x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height
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

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다. 노드는 정한 테두리 안에만 있다.
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
    for (const group of groupIds) {
      const member = memberOf[id] === group
      expect(member ? inside(nodeBox(id), groupBox(group)) : overlaps(nodeBox(id), groupBox(group)), `${id} ↔ ${group}`).toBe(member)
    }
  }
  for (let i = 0; i < groupIds.length; i += 1) {
    for (let j = i + 1; j < groupIds.length; j += 1) {
      expect(overlaps(groupBox(groupIds[i]), groupBox(groupIds[j])), `${groupIds[i]} ↔ ${groupIds[j]}`).toBe(false)
    }
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

// 요점: 명령 덩어리를 차례대로 이으면 본문 예의 명령이다. -g의 선은 -g dev에서 GID 노드로 가고 그 값이 dev의 GID와 같다.
// -G의 선은 /etc/group의 ops 노드에 닿고 GID 노드에는 닿지 않는다.
async function expectPoint() {
  const concepts = topics.find(({ id }) => id === topicId)!.concepts
  const body = concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const accountBody = concepts.find(({ id }) => id === `${topicId}.user-account`)!.paragraphs.join('\n')
  const passwdBody = concepts.find(({ id }) => id === `${topicId}.etc-passwd`)!.paragraphs.join('\n')
  const label = (id: string) => diagram().querySelector(`[data-node="${id}"] text`)!.textContent!

  const command = tokens.map(label).join(' ')
  expect(command).toBe('useradd -m -g dev -G ops -s /bin/bash user4')
  expect(body).toContain(`\`${command}\``)
  expect(body).toContain('`user4:x:1004:2001::/home/user4:/bin/bash`')
  expect(body).toContain('`ops` 줄에 `user4`가 더해져')
  expect(body).toContain('새 계정의 이름은 맨 뒤에 적는다')

  await selectScenario('-g')
  const primary = points(pathD('primary-path'))
  expect(onEdge(primary[0], nodeBox('opt-g'))).toBe(true)
  expect(onEdge(primary[primary.length - 1], nodeBox('passwd-gid'))).toBe(true)
  const gid = label('passwd-gid').split(' ').pop()!
  expect(gid).toBe('2001')
  expect(accountBody).toContain(`기본 그룹이 \`dev\`(GID \`${gid}\`)`)
  expect(passwdBody).toContain(`그룹 \`dev\`의 번호 \`${gid}\``)
  expect(body).toContain(`GID 칸의 \`${gid}\`은 \`-g dev\`로 정한`)

  await selectScenario('-G')
  const supplementary = points(pathD('supplementary-path'))
  expect(onEdge(supplementary[0], nodeBox('opt-supp'))).toBe(true)
  expect(onEdge(supplementary[supplementary.length - 1], nodeBox('group-ops'))).toBe(true)
  for (const point of supplementary) expect(touches(point, nodeBox('passwd-gid'))).toBe(false)
  for (let i = 1; i < supplementary.length; i += 1) {
    expect(crossesInside(supplementary[i - 1], supplementary[i], nodeBox('passwd-gid'))).toBe(false)
  }
}

describe('UseraddOptionsDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<UseraddOptionsDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표 없이 선택 안내가 나온다', () => {
    const { container } = render(<UseraddOptionsDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표만 보인다', async (scenario) => {
    const { container } = render(<UseraddOptionsDiagram />)
    await expectScenario(scenario, container)
  })

  it('시나리오를 바꾸면 이전 화살표가 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<UseraddOptionsDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[1]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-path]', 'data-path')).toEqual(scenario.paths)
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('네 시나리오가 보이는 것(노드·화살표)이 서로 다르다', () => {
    const keys = expectedScenarios.map(({ nodes, paths }) => JSON.stringify([[...nodes].sort(), paths]))
    expect(new Set(keys).size).toBe(expectedScenarios.length)
  })

  it('노드가 280×304 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<UseraddOptionsDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 304')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  it('선의 끝점이 노드 변 위에 있고 다른 노드와 그룹 라벨을 지나지 않는다', async () => {
    render(<UseraddOptionsDiagram />)
    await expectLines()
  })

  it('-g는 GID 칸으로, -G는 /etc/group으로 가고, 명령 덩어리는 본문 예의 명령이다', async () => {
    render(<UseraddOptionsDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 고른 시나리오가 섞이지 않는다', async () => {
    const { container } = render(<><UseraddOptionsDiagram /><UseraddOptionsDiagram /></>)
    const markerIds = Array.from(container.querySelectorAll('marker'), (marker) => marker.id)
    expect(markerIds).toHaveLength(2)
    expect(new Set(markerIds).size).toBe(2)

    const figures = screen.getAllByRole('figure', { name: figureName })
    await act(async () => { await userEvent.click(within(figures[0]).getByRole('button', { name: '-g' })) })

    expect(within(figures[0]).getByRole('button', { name: '-g' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(figures[1]).getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(figures[1].querySelectorAll('[data-path]')).toHaveLength(0)
    expect(figures[0].querySelector('[data-path]')!.getAttribute('marker-end')).toBe(`url(#${markerIds[0]})`)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<UseraddOptionsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['useradd-options']
    const ids = useraddOptionsScenarios.map(({ id }) => id).sort()
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
      const scenario = useraddOptionsScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 useradd 명령 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    const article = figure.closest('article')!

    expect(article).toHaveAttribute('id', concept.id)
    expect(article.lastElementChild).toBe(figure)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
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

    it('440×230 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<UseraddOptionsDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 230')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·그룹 id 집합과 경로 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<UseraddOptionsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 304')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroups = shownIds('rect[data-group]', 'data-group').sort()
      const tallPaths: string[] = []
      for (const scenario of expectedScenarios) {
        await selectScenario(scenario.label)
        tallPaths.push(...shownIds('[data-path]', 'data-path'))
      }
      await selectScenario('전체')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 230')
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

    it('노드가 440×230 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<UseraddOptionsDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·캡션을 보인다', async (scenario) => {
      const { container } = render(<UseraddOptionsDiagram />)
      await expectScenario(scenario, container)
    })

    it('선의 끝점이 노드 변 위에 있고 다른 노드와 그룹 라벨을 지나지 않는다', async () => {
      render(<UseraddOptionsDiagram />)
      await expectLines()
    })

    it('-g는 GID 칸으로, -G는 /etc/group으로 가고, 명령 덩어리는 본문 예의 명령이다', async () => {
      render(<UseraddOptionsDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<UseraddOptionsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 304')
      await selectScenario('-G')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '-G' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownIds('[data-path]', 'data-path')).toEqual(['supplementary-path'])
      expect(diagram().querySelector('[data-node="group-ops"] rect')).toHaveAttribute('x', '168')
    })
  })
})
