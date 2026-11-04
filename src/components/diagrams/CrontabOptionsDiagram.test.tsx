import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { CrontabOptionsDiagram, crontabOptionsScenarios } from './CrontabOptionsDiagram'

const topicId = 'linux-process-boot'
const anchorConceptId = `${topicId}.crontab-command`
const backupLine = '30 2 * * 6 /home/user1/backup.sh'
const reportLine = '0 3 1 * * /home/user1/report.sh'
const labels = {
  'before-backup': backupLine,
  'before-report': reportLine,
  'cmd-list': 'crontab -l',
  'list-backup': backupLine,
  'list-report': reportLine,
  'cmd-edit': 'crontab -e',
  editor: '편집기',
  'cmd-remove': 'crontab -r',
}
const groupLabels = { before: '입력하기 전 user1의 crontab' }
const noteLabels = {
  list: '보여 주기만 함',
  edit: '줄 하나만 고치거나 지움',
  remove: '줄이 하나도 없음',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const pathIds = ['list-path', 'edit-path']
const beforeIds = ['before-backup', 'before-report']
const lineIds = ['before-backup', 'before-report', 'list-backup', 'list-report']
const commandIds = ['cmd-list', 'cmd-edit', 'cmd-remove']

// 선마다 시작하는 노드와 끝나는 노드.
const ends: Record<string, [string, string]> = {
  'list-path': ['cmd-list', 'list-backup'],
  'edit-path': ['cmd-edit', 'editor'],
}

const question = 'crontab -r은 무엇을 지울까?'
const idleCaption = 'user1의 crontab에 예로 적은 두 줄을 테두리 안에 두고, crontab 명령의 옵션 셋을 놓았다. 버튼을 고르면 옵션마다 명령을 입력한 뒤 crontab이 어떻게 되는지 볼 수 있다.'
const legend = '테두리 안은 명령을 입력하기 전 user1의 crontab이다. 화살표는 명령을 입력한 뒤의 결과로 간다.'
const figureName = 'user1의 crontab에 줄이 둘 있을 때 crontab -l, crontab -e, crontab -r을 입력하면 crontab이 어떻게 되는지 보이는 도식'
const svgName = '테두리 입력하기 전 user1의 crontab 안에 줄 30 2 * * 6 /home/user1/backup.sh와 0 3 1 * * /home/user1/report.sh가 있고, 명령 crontab -l, crontab -e, crontab -r과 그 결과인 두 줄과 편집기가 있다'
const expectedScenarios = [
  {
    id: 'list', label: '-l',
    nodes: ['before-backup', 'before-report', 'cmd-list', 'list-backup', 'list-report'], paths: ['list-path'], notes: ['list'],
    caption: 'crontab -l은 user1의 crontab에 적힌 두 줄을 적힌 그대로 터미널에 보여 준다. 보여 주기만 하므로 입력한 뒤에도 crontab은 입력하기 전과 같다.',
    sources: [anchorConceptId],
  },
  {
    id: 'edit', label: '-e',
    nodes: ['before-backup', 'before-report', 'cmd-edit', 'editor'], paths: ['edit-path'], notes: ['edit'],
    caption: 'crontab -e는 편집기로 user1의 crontab을 연다. 예약 하나만 그만두려면 그 줄만 지우고 편집기를 닫는다. 그러면 고친 내용이 곧바로 crontab이 되고 나머지 줄은 남는다.',
    sources: [anchorConceptId],
  },
  {
    id: 'remove', label: '-r',
    nodes: ['before-backup', 'before-report', 'cmd-remove'], paths: [] as string[], notes: ['remove'],
    caption: 'crontab -r은 줄 하나가 아니라 user1의 crontab 전체를 지운다. 다시 crontab -l로 보면 줄이 하나도 없고, 두 예약이 모두 사라져 crond는 어느 것도 실행하지 않는다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 428]
const wideBox: [number, number, number, number] = [0, 0, 440, 304]

function diagram() {
  return screen.getByRole('img', { name: svgName })
}

async function selectScenario(name: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name })) })
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

function brightNodes() {
  return Array.from(diagram().querySelectorAll('[data-node]'))
    .filter((element) => element.getAttribute('opacity') === '1')
    .map((element) => element.getAttribute('data-node')!)
}

function label(id: string) {
  return diagram().querySelector(`[data-node="${id}"] text`)!.textContent!
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
// 입력하기 전의 두 줄은 테두리 안에 있고 다른 노드는 테두리 밖에 있으며, 그룹 라벨은 테두리 안에서 노드와 겹치지 않는다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = nodeIds.map(nodeBox)
  expect(diagram().querySelectorAll('rect')).toHaveLength(nodeIds.length + groupIds.length)
  expect(boxesOutsideViewBox([...boxes, ...groupIds.map(groupBox)], viewBox)).toEqual([])

  for (const [id, text] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    expect(node.querySelector('text')!.textContent).toBe(text)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(node.querySelector('rect')).toHaveClass('stroke-disabled')
    expect(nodeBox(id).height).toBe(32)
    expect(estimateTextWidth(text, 10) * 1.15 + 12, `${id} ${text}`).toBeLessThanOrEqual(nodeBox(id).width)
  }
  for (let i = 0; i < nodeIds.length; i += 1) {
    for (let j = i + 1; j < nodeIds.length; j += 1) {
      expect(overlaps(nodeBox(nodeIds[i]), nodeBox(nodeIds[j])), `${nodeIds[i]} ↔ ${nodeIds[j]}`).toBe(false)
    }
  }
  for (const id of nodeIds) {
    const inGroup = beforeIds.includes(id)
    expect(inGroup ? inside(nodeBox(id), groupBox('before')) : overlaps(nodeBox(id), groupBox('before')), id).toBe(inGroup)
  }
  for (const [id, text] of Object.entries(groupLabels)) {
    const element = diagram().querySelector(`[data-group-label="${id}"]`)!
    expect(element.textContent).toBe(text)
    expect(element).toHaveAttribute('font-size', '9')
    const box = textBox(element, id)
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
          const groupLabel = textBox(diagram().querySelector(`[data-group-label="${group}"]`)!, group)
          expect(crossesInside(list[i - 1], list[i], groupLabel), `${id} ↔ ${group} 라벨`).toBe(false)
        }
      }
    }
  }
}

// 곁말은 viewBox 안에 있고 어느 노드·그룹 라벨·테두리·선과도 겹치지 않으며, 바로 위 노드의 아래 변에서 기준선까지 10 이상 띄운다.
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
        const groupLabel = textBox(diagram().querySelector(`[data-group-label="${group}"]`)!, group)
        expect(overlaps(box, groupLabel), `${box.id} ↔ ${group}`).toBe(false)
        expect(overlaps(box, groupBox(group)), `${box.id} ↔ ${group} 테두리`).toBe(false)
      }
      for (const id of shownIds('[data-path]', 'data-path')) {
        const list = points(pathD(id))
        for (let i = 1; i < list.length; i += 1) expect(crossesInside(list[i - 1], list[i], box), `${box.id} ↔ ${id}`).toBe(false)
      }
    }
  }
}

// 요점: -l의 뒤 상태 두 줄은 입력하기 전 두 줄과 라벨이 같다(보여 주기만 한다).
// -r의 뒤에는 선명한 줄 노드가 입력하기 전 두 줄뿐이고 「줄이 하나도 없음」이 보인다(줄 하나가 아니라 crontab 전체가 지워진다).
// 시나리오마다 선명한 명령은 하나이고 그 라벨이 crontab 뒤에 버튼의 옵션을 붙인 것이며, 보이는 선은 그 명령에서 나온다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const opacity = (id: string) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')

  for (const id of [...new Set(Object.values(labels))].filter((text) => text !== '편집기')) expect(body, id).toContain(`\`${id}\``)
  expect(body).toContain('편집기')
  expect(body).toContain('보여 주기만 하고 crontab은 바꾸지 않는다')
  expect(body).toContain('줄 하나가 아니라 crontab 전체')
  expect(body).toContain('줄이 하나도 없다')

  await selectScenario('-l')
  expect(label('list-backup')).toBe(label('before-backup'))
  expect(label('list-report')).toBe(label('before-report'))
  expect(opacity('list-backup')).toBe('1')
  expect(opacity('list-report')).toBe('1')

  await selectScenario('-r')
  expect(label('cmd-remove')).toContain('-r')
  expect(brightNodes().filter((id) => lineIds.includes(id))).toEqual(beforeIds)
  expect(opacity('list-backup')).toBe('0.25')
  expect(opacity('list-report')).toBe('0.25')
  expect(opacity('editor')).toBe('0.25')
  expect(shownIds('[data-path]', 'data-path')).toEqual([])
  expect(diagram().querySelector('[data-note="remove"]')!.textContent).toBe('줄이 하나도 없음')

  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    const commands = brightNodes().filter((id) => commandIds.includes(id))
    expect(commands, scenario.label).toHaveLength(1)
    expect(label(commands[0])).toBe(`crontab ${scenario.label}`)
    for (const id of shownIds('[data-path]', 'data-path')) {
      expect(onEdge(points(pathD(id))[0], nodeBox(commands[0])), `${scenario.label} ${id}`).toBe(true)
    }
  }
}

describe('CrontabOptionsDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<CrontabOptionsDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<CrontabOptionsDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<CrontabOptionsDiagram />)
    await expectScenario(scenario, container)
  })

  it('시나리오를 바꾸면 이전 화살표가 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<CrontabOptionsDiagram />)
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

  it('노드가 280×428 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<CrontabOptionsDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 428')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  it('선의 끝점이 노드 변 위에 있고 다른 노드와 그룹 라벨을 지나지 않는다', async () => {
    render(<CrontabOptionsDiagram />)
    await expectLines()
  })

  it('곁말이 viewBox 안에 있고 노드·테두리·선과 겹치지 않는다', async () => {
    render(<CrontabOptionsDiagram />)
    await expectNotes(tallBox)
  })

  it('-l은 보여 주기만 하고 -r은 줄 하나가 아니라 crontab 전체를 지운다', async () => {
    render(<CrontabOptionsDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않고 고른 시나리오가 섞이지 않는다', async () => {
    const { container } = render(<><CrontabOptionsDiagram /><CrontabOptionsDiagram /></>)
    const markerIds = Array.from(container.querySelectorAll('marker'), (marker) => marker.id)
    expect(markerIds).toHaveLength(2)
    expect(new Set(markerIds).size).toBe(2)

    const figures = screen.getAllByRole('figure', { name: figureName })
    await act(async () => { await userEvent.click(within(figures[0]).getByRole('button', { name: '-l' })) })

    expect(within(figures[0]).getByRole('button', { name: '-l' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(figures[1]).getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(figures[1].querySelectorAll('[data-path]')).toHaveLength(0)
    expect(figures[0].querySelector('[data-path]')!.getAttribute('marker-end')).toBe(`url(#${markerIds[0]})`)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<CrontabOptionsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['crontab-options']
    const ids = crontabOptionsScenarios.map(({ id }) => id).sort()
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
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label: name }) => name)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = crontabOptionsScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 crontab 명령 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×304 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<CrontabOptionsDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 304')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·그룹 id 집합과 경로 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<CrontabOptionsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 428')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroups = shownIds('rect[data-group]', 'data-group').sort()
      const tallPaths: string[] = []
      for (const scenario of expectedScenarios) {
        await selectScenario(scenario.label)
        tallPaths.push(...shownIds('[data-path]', 'data-path'))
      }
      await selectScenario('전체')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 304')
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

    it('노드가 440×304 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<CrontabOptionsDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·화살표·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<CrontabOptionsDiagram />)
      await expectScenario(scenario, container)
    })

    it('선의 끝점이 노드 변 위에 있고 다른 노드와 그룹 라벨을 지나지 않는다', async () => {
      render(<CrontabOptionsDiagram />)
      await expectLines()
    })

    it('곁말이 viewBox 안에 있고 노드·테두리·선과 겹치지 않는다', async () => {
      render(<CrontabOptionsDiagram />)
      await expectNotes(wideBox)
    })

    it('-l은 보여 주기만 하고 -r은 줄 하나가 아니라 crontab 전체를 지운다', async () => {
      render(<CrontabOptionsDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<CrontabOptionsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 428')
      await selectScenario('-e')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '-e' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownIds('[data-path]', 'data-path')).toEqual(['edit-path'])
      expect(diagram().querySelector('[data-node="editor"] rect')).toHaveAttribute('x', '160')
    })
  })
})
