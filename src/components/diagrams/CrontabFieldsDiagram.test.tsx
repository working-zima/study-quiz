import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { CrontabFieldsDiagram, crontabFieldsScenarios } from './CrontabFieldsDiagram'

const topicId = 'linux-process-boot'
const anchorConceptId = `${topicId}.crontab-fields`
const labels = {
  'min-name': '분',
  min: '30',
  'hour-name': '시',
  hour: '2',
  'day-name': '일',
  day: '*',
  'month-name': '월',
  month: '*',
  'dow-name': '요일',
  dow: '6',
  'cmd-name': '명령',
  command: '/home/user1/backup.sh',
}
const groupLabels = { fields: '시간 칸 다섯' }
const noteLabels = {
  time: '02:30',
  every: '값을 가리지 않음',
  weekday: '토요일',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
// 이름 칸과 그 아래에 맞닿는 값 칸의 짝. 차례는 crontab 한 줄의 칸 차례다.
const pairs: [string, string][] = [
  ['min-name', 'min'],
  ['hour-name', 'hour'],
  ['day-name', 'day'],
  ['month-name', 'month'],
  ['dow-name', 'dow'],
  ['cmd-name', 'command'],
]
const valueIds = pairs.map(([, value]) => value)
const timeFieldIds = nodeIds.filter((id) => id !== 'cmd-name' && id !== 'command')

const question = '이 줄은 언제 실행될까?'
const idleCaption = 'user1의 crontab에 예로 적은 줄 30 2 * * 6 /home/user1/backup.sh를 칸마다 이름과 값으로 나눠 놓았다. 버튼을 고르면 칸을 하나씩 읽어, 이 줄이 언제 무엇을 실행하는지 볼 수 있다.'
const legend = '칸마다 이름을 위에, 적은 값을 아래에 두었다. 테두리 안의 다섯 칸이 실행할 때를 정하는 시간 칸이고, 값을 왼쪽부터 빈칸으로 이으면 crontab의 한 줄이 된다.'
const figureName = 'crontab의 예 줄 30 2 * * 6 /home/user1/backup.sh를 시간 칸 다섯과 명령으로 나눠, 칸마다 이름과 값을 보이는 도식'
const svgName = '테두리 시간 칸 다섯 안에 분 30, 시 2, 일 *, 월 *, 요일 6이 칸 이름과 값으로 차례로 놓여 있고, 테두리 밖에 명령 칸 /home/user1/backup.sh가 있다'
const expectedScenarios = [
  {
    id: 'time', label: '시각',
    nodes: ['min-name', 'min', 'hour-name', 'hour'], notes: ['time'],
    caption: '첫째 칸 30은 분이고 둘째 칸 2는 시라서, 이 줄의 시각은 2시 30분, 곧 02:30이다. 시각을 말할 때와 달리 분 칸이 시 칸보다 앞에 온다.',
    sources: [anchorConceptId],
  },
  {
    id: 'every', label: '*',
    nodes: ['day-name', 'day', 'month-name', 'month'], notes: ['every'],
    caption: '셋째 칸 일과 넷째 칸 월에 적은 *는 그 칸의 값을 가리지 않는다는 뜻이다. 그래서 이 줄은 며칠인지와 몇 월인지에 상관없이 실행된다.',
    sources: [anchorConceptId],
  },
  {
    id: 'weekday', label: '요일',
    nodes: ['dow-name', 'dow'], notes: ['weekday'],
    caption: '다섯째 칸 요일은 번호로 적고, 0이 일요일이고 1이 월요일이라 6은 토요일이다. 앞의 칸과 합치면 이 줄은 매주 토요일 02:30에 실행된다.',
    sources: [anchorConceptId],
  },
  {
    id: 'command', label: '명령',
    nodes: ['cmd-name', 'command'], notes: [] as string[],
    caption: '시간 칸 다섯 뒤의 여섯째 칸부터 줄 끝까지가 실행할 명령이다. 정한 때가 되면 crond가 /home/user1/backup.sh를 user1로서 실행한다.',
    sources: [anchorConceptId, `${topicId}.cron`],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 204]
const wideBox: [number, number, number, number] = [0, 0, 440, 128]

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

async function expectScenario(scenario: typeof expectedScenarios[number], container: HTMLElement) {
  await selectScenario(scenario.label)

  for (const element of diagram().querySelectorAll('[data-node]')) {
    const id = element.getAttribute('data-node')!
    expect(element, id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  for (const element of diagram().querySelectorAll('rect[data-group]')) expect(element).not.toHaveAttribute('opacity')
  expect(diagram().querySelectorAll('[data-path]')).toHaveLength(0)
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
// 이름 칸 바로 아래에 값 칸이 맞닿고, 시간 칸 다섯은 왼쪽부터 빈틈없이 이어져 테두리 안에 있으며 명령 칸은 테두리 밖에 있다.
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
  for (const [name, value] of pairs) {
    expect(nodeBox(value).x, `${name} ↔ ${value}`).toBe(nodeBox(name).x)
    expect(nodeBox(value).width, `${name} ↔ ${value}`).toBe(nodeBox(name).width)
    expect(nodeBox(value).y, `${name} ↔ ${value}`).toBe(nodeBox(name).y + 32)
  }
  for (let i = 1; i < 5; i += 1) {
    const [before, after] = [nodeBox(pairs[i - 1][1]), nodeBox(pairs[i][1])]
    expect(after.x, `${pairs[i - 1][1]} → ${pairs[i][1]}`).toBe(before.x + before.width)
    expect(after.y).toBe(before.y)
  }
  for (const id of nodeIds) {
    const inGroup = timeFieldIds.includes(id)
    expect(inGroup ? inside(nodeBox(id), groupBox('fields')) : overlaps(nodeBox(id), groupBox('fields')), id).toBe(inGroup)
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

// 곁말은 viewBox 안에 있고 어느 노드·그룹 라벨·테두리와도 겹치지 않으며, 바로 위 노드의 아래 변에서 기준선까지 10 이상 띄운다.
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
    }
  }
}

// 요점: 시각을 고르면 선명한 값 칸이 왼쪽부터 30·2 차례이고(분 칸이 시 칸보다 왼쪽), 보이는 곁말이 그 둘로 만든 시각 02:30이다.
// 요일을 고르면 선명한 값 칸은 요일 칸 하나다. 네 시나리오를 합하면 열두 칸이 빠짐없이 나온다.
// 값을 칸 차례대로 빈칸으로 이으면 개념 본문의 예 줄이다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const ordered = [...valueIds].sort((a, b) => nodeBox(a).y - nodeBox(b).y || nodeBox(a).x - nodeBox(b).x)
  const line = ordered.map(label).join(' ')

  expect(ordered).toEqual(valueIds)
  expect(body).toContain(`\`${line}\``)
  expect(line.split(' ')).toHaveLength(6)

  await selectScenario('시각')
  const timeValues = brightNodes().filter((id) => valueIds.includes(id)).sort((a, b) => nodeBox(a).x - nodeBox(b).x)
  expect(timeValues).toEqual(['min', 'hour'])
  expect(timeValues.map(label)).toEqual(['30', '2'])
  expect(nodeBox('min-name').x).toBeLessThan(nodeBox('hour-name').x)
  expect([label('min-name'), label('hour-name')]).toEqual(['분', '시'])
  const note = diagram().querySelector('[data-note="time"]')!.textContent
  expect(note).toBe(`${label('hour').padStart(2, '0')}:${label('min').padStart(2, '0')}`)
  expect(body).toContain(note)

  await selectScenario('요일')
  expect(brightNodes().filter((id) => valueIds.includes(id))).toEqual(['dow'])
  expect(body).toContain(`\`${label('dow')}\`은 토요일`)

  const union = new Set<string>()
  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    brightNodes().forEach((id) => union.add(id))
  }
  expect([...union].sort()).toEqual([...nodeIds].sort())

  expect(body).toContain('값을 가리지 않는다')
  expect(body).toContain('여섯째 칸부터 줄 끝까지가 실행할 명령')
}

describe('CrontabFieldsDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<CrontabFieldsDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 선·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<CrontabFieldsDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note], marker')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 칸과 곁말만 보인다', async (scenario) => {
    const { container } = render(<CrontabFieldsDiagram />)
    await expectScenario(scenario, container)
  })

  it('시나리오를 바꾸면 이전 칸이 흐려지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<CrontabFieldsDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(brightNodes().sort()).toEqual([...scenario.nodes].sort())
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('네 시나리오가 보이는 것(노드·곁말)이 서로 다르다', () => {
    const keys = expectedScenarios.map(({ nodes, notes }) => JSON.stringify([[...nodes].sort(), notes]))
    expect(new Set(keys).size).toBe(expectedScenarios.length)
  })

  it('노드와 테두리가 280×204 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<CrontabFieldsDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 204')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  it('곁말이 viewBox 안에 있고 노드·테두리와 겹치지 않는다', async () => {
    render(<CrontabFieldsDiagram />)
    await expectNotes(tallBox)
  })

  it('칸을 하나씩 읽으면 분이 시보다 앞이고, 30 2는 02:30, 요일 6은 토요일이다', async () => {
    render(<CrontabFieldsDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 고른 시나리오가 서로 섞이지 않는다', async () => {
    render(<><CrontabFieldsDiagram /><CrontabFieldsDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    await act(async () => { await userEvent.click(within(figures[0]).getByRole('button', { name: '요일' })) })

    expect(within(figures[0]).getByRole('button', { name: '요일' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(figures[1]).getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    for (const element of figures[1].querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(figures[1].querySelectorAll('[data-note]')).toHaveLength(0)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<CrontabFieldsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['crontab-fields']
    const ids = crontabFieldsScenarios.map(({ id }) => id).sort()
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
      const scenario = crontabFieldsScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: expected.sources })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual([])
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) {
      expect(conceptIds).toContain(source)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 crontab의 시간 칸 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×128 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<CrontabFieldsDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 128')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·그룹 id 집합이 세로형과 같다', () => {
      const { change } = mockMatchMedia(false)
      render(<CrontabFieldsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 204')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroups = shownIds('rect[data-group]', 'data-group').sort()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 128')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('rect[data-group]', 'data-group').sort()).toEqual(tallGroups)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallGroups).toEqual([...groupIds].sort())
    })

    it('노드와 테두리가 440×128 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<CrontabFieldsDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 칸·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<CrontabFieldsDiagram />)
      await expectScenario(scenario, container)
    })

    it('곁말이 viewBox 안에 있고 노드·테두리와 겹치지 않는다', async () => {
      render(<CrontabFieldsDiagram />)
      await expectNotes(wideBox)
    })

    it('칸을 하나씩 읽으면 분이 시보다 앞이고, 30 2는 02:30, 요일 6은 토요일이다', async () => {
      render(<CrontabFieldsDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<CrontabFieldsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 204')
      await selectScenario('*')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '*' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownIds('[data-note]', 'data-note')).toEqual(['every'])
      expect(diagram().querySelector('[data-node="command"] rect')).toHaveAttribute('x', '272')
    })
  })
})
