import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { PasswdFieldsDiagram, passwdFieldsScenarios } from './PasswdFieldsDiagram'

const topicId = 'linux-accounts'
const anchorConceptId = `${topicId}.etc-passwd`
const labels = {
  'name-name': '사용자 이름',
  'name': 'user4',
  'password-name': '암호 칸',
  'password': 'x',
  'uid-name': 'UID',
  'uid': '1004',
  'gid-name': 'GID',
  'gid': '2001',
  'gecos-name': '설명 칸',
  'gecos': '(비어 있음)',
  'home-name': '홈 디렉터리',
  'home': '/home/user4',
  'shell-name': '로그인 셸',
  'shell': '/bin/bash',
  'shadow': '/etc/shadow',
}
const groupLabels = { line: 'user4의 /etc/passwd 한 줄' }
const noteLabels = { shadow: '암호화한 암호' }
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const pathIds = ['shadow-path']

// 줄에 적힌 차례대로의 칸. 칸마다 이름 노드 바로 오른쪽에 값 노드가 맞닿는다.
const fields = ['name', 'password', 'uid', 'gid', 'gecos', 'home', 'shell']

// 선마다 시작하는 노드와 끝나는 노드.
const ends: Record<string, [string, string]> = {
  'shadow-path': ['password', 'shadow'],
}

const question = '/etc/passwd의 한 줄은 무엇을 말할까?'
const idleCaption = '/etc/passwd에 적힌 user4의 줄을 콜론으로 나눈 칸 일곱을 칸 이름과 값으로 나눠 놓았다. user4와 번호들은 예로 붙인 것이다. 버튼을 고르면 칸들이 무엇을 말하는지 볼 수 있다.'
const legend = '칸 이름과 그 값을 나란히 놓았고, 칸은 줄에 적힌 차례대로 놓았다. 화살표는 암호 칸의 x가 가리키는 파일로 간다.'
const figureName = '/etc/passwd에 적힌 user4의 한 줄을 칸 이름과 값으로 나눠, 이름과 번호, 암호 칸의 x가 가리키는 곳, 로그인할 때 쓰이는 칸을 보이는 도식'
const svgName = '테두리 user4의 /etc/passwd 한 줄 안에 사용자 이름 user4, 암호 칸 x, UID 1004, GID 2001, 설명 칸 (비어 있음), 홈 디렉터리 /home/user4, 로그인 셸 /bin/bash가 칸 이름과 값의 짝으로 차례로 놓이고, 테두리 밖에 /etc/shadow가 있다'
const expectedScenarios = [
  {
    id: 'ids', label: '번호',
    nodes: ['name-name', 'name', 'uid-name', 'uid', 'gid-name', 'gid'], paths: [] as string[], notes: [] as string[],
    caption: '첫째 칸은 사용자 이름 user4이고, 숫자 두 칸 가운데 앞의 1004가 이 계정의 UID, 뒤의 2001이 기본 그룹 dev의 GID다. 보조 그룹은 이 줄에 적지 않고 /etc/group에 적는다.',
    sources: [anchorConceptId],
  },
  {
    id: 'password', label: 'x',
    nodes: ['password-name', 'password', 'shadow'], paths: ['shadow-path'], notes: ['shadow'],
    caption: '암호 칸의 x는 암호가 글자 x라는 뜻이 아니라, 암호화한 암호가 /etc/shadow에 있다는 표시다. /etc/passwd는 모든 사용자가 읽을 수 있어서 암호를 여기 두지 않는다.',
    sources: [anchorConceptId],
  },
  {
    id: 'login', label: '로그인',
    nodes: ['home-name', 'home', 'shell-name', 'shell'], paths: [] as string[], notes: [] as string[],
    caption: 'user4가 로그인하면 홈 디렉터리 /home/user4에서 로그인 셸 /bin/bash가 실행된다. 셸 칸이 비어 있으면 /bin/sh가 실행된다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 318]
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
// 칸 노드는 테두리 안에, /etc/shadow는 테두리 밖에 있고, 칸마다 이름 노드 바로 오른쪽에 값 노드가 맞닿는다.
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
    const inLine = id !== 'shadow'
    expect(inLine ? inside(nodeBox(id), groupBox('line')) : overlaps(nodeBox(id), groupBox('line')), id).toBe(inLine)
  }
  for (const field of fields) {
    const name = nodeBox(`${field}-name`)
    expect(nodeBox(field).x, field).toBe(name.x + name.width)
    expect(nodeBox(field).y, field).toBe(name.y)
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

// 곁말은 viewBox 안에 있고 어느 노드·테두리·그룹 라벨·선과도 겹치지 않으며, 바로 위 노드의 아래 변에서 기준선까지 10 이상 띄운다.
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

// 요점: 암호 칸의 x에서 나온 선은 /etc/shadow에 닿고, 그 선은 x 시나리오에서만 보인다.
// 번호 시나리오의 선명한 값은 차례대로 user4·1004·2001이고, 칸 일곱의 값을 차례대로 콜론으로 이으면 본문 예의 줄과 같다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const label = (id: string) => diagram().querySelector(`[data-node="${id}"] text`)!.textContent!
  const opacity = (id: string) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')

  const line = fields.map((field) => (label(field) === '(비어 있음)' ? '' : label(field))).join(':')
  expect(line).toBe('user4:x:1004:2001::/home/user4:/bin/bash')
  expect(body).toContain(`\`${line}\``)
  for (const field of fields.filter((id) => id !== 'gecos')) expect(body).toContain(`\`${label(field)}\``)
  for (const field of fields) expect(body).toContain(`**${label(`${field}-name`)}**`)
  expect(body).toContain('비어 있')
  expect(body).toContain(noteLabels.shadow)
  expect(body).toContain('`x`는 암호가 아니라')

  await selectScenario('번호')
  expect(['name', 'uid', 'gid'].filter((id) => opacity(id) === '1').map(label)).toEqual(['user4', '1004', '2001'])
  expect(fields.filter((id) => opacity(id) === '1')).toEqual(['name', 'uid', 'gid'])

  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    expect(shownIds('[data-path]', 'data-path').includes('shadow-path'), scenario.label).toBe(scenario.id === 'password')
  }
  await selectScenario('x')
  const list = points(pathD('shadow-path'))
  expect(onEdge(list[0], nodeBox('password'))).toBe(true)
  expect(onEdge(list[list.length - 1], nodeBox('shadow'))).toBe(true)
  expect(label('password')).toBe('x')
  expect(label('shadow')).toBe('/etc/shadow')
}

describe('PasswdFieldsDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<PasswdFieldsDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<PasswdFieldsDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<PasswdFieldsDiagram />)
    await expectScenario(scenario, container)
  })

  it('시나리오를 바꾸면 이전 화살표가 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<PasswdFieldsDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[1]]) {
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

  it('노드가 280×318 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<PasswdFieldsDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 318')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  it('선의 끝점이 노드 변 위에 있고 다른 노드와 그룹 라벨을 지나지 않는다', async () => {
    render(<PasswdFieldsDiagram />)
    await expectLines()
  })

  it('곁말이 viewBox 안에 있고 노드·테두리·선과 겹치지 않는다', async () => {
    render(<PasswdFieldsDiagram />)
    await expectNotes(tallBox)
  })

  it('암호 칸의 x는 /etc/shadow를 가리키고, 칸 일곱은 본문 예의 줄을 차례대로 나눈 것이다', async () => {
    render(<PasswdFieldsDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 고른 시나리오가 섞이지 않는다', async () => {
    const { container } = render(<><PasswdFieldsDiagram /><PasswdFieldsDiagram /></>)
    const markerIds = Array.from(container.querySelectorAll('marker'), (marker) => marker.id)
    expect(markerIds).toHaveLength(2)
    expect(new Set(markerIds).size).toBe(2)

    const figures = screen.getAllByRole('figure', { name: figureName })
    await act(async () => { await userEvent.click(within(figures[0]).getByRole('button', { name: 'x' })) })

    expect(within(figures[0]).getByRole('button', { name: 'x' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(figures[1]).getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(figures[1].querySelectorAll('[data-path]')).toHaveLength(0)
    expect(figures[0].querySelector('[data-path]')!.getAttribute('marker-end')).toBe(`url(#${markerIds[0]})`)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<PasswdFieldsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['passwd-fields']
    const ids = passwdFieldsScenarios.map(({ id }) => id).sort()
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
      const scenario = passwdFieldsScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 /etc/passwd 파일 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
      render(<PasswdFieldsDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 230')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·그룹 id 집합과 경로 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<PasswdFieldsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 318')
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
      render(<PasswdFieldsDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<PasswdFieldsDiagram />)
      await expectScenario(scenario, container)
    })

    it('선의 끝점이 노드 변 위에 있고 다른 노드와 그룹 라벨을 지나지 않는다', async () => {
      render(<PasswdFieldsDiagram />)
      await expectLines()
    })

    it('곁말이 viewBox 안에 있고 노드·테두리·선과 겹치지 않는다', async () => {
      render(<PasswdFieldsDiagram />)
      await expectNotes(wideBox)
    })

    it('암호 칸의 x는 /etc/shadow를 가리키고, 칸 일곱은 본문 예의 줄을 차례대로 나눈 것이다', async () => {
      render(<PasswdFieldsDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<PasswdFieldsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 318')
      await selectScenario('x')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: 'x' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownIds('[data-path]', 'data-path')).toEqual(['shadow-path'])
      expect(diagram().querySelector('[data-node="shadow"] rect')).toHaveAttribute('x', '152')
    })
  })
})
