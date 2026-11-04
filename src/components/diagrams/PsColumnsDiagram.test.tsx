import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { PsColumnsDiagram, psColumnsScenarios } from './PsColumnsDiagram'

const topicId = 'linux-process-boot'
const anchorConceptId = `${topicId}.ps-command`
const labels = {
  'uid-name': 'UID',
  uid: 'user1',
  'pid-name': 'PID',
  pid: '2310',
  'ppid-name': 'PPID',
  ppid: '2045',
  'c-name': 'C',
  c: '0',
  'stime-name': 'STIME',
  stime: '09:15',
  'time-name': 'TIME',
  time: '00:00:01',
  'cmd-name': 'CMD',
  cmd: '/home/user1/backup.sh',
}
const groupLabels = { line: 'ps -ef가 보인 backup.sh의 줄' }

const nodeIds = Object.keys(labels)
// 값 칸은 ps -ef가 보이는 차례다(TTY 칸은 값을 예로 들지 않아 그리지 않는다). 이름 칸은 값 칸의 id 뒤에 -name을 붙인다.
const valueIds = ['uid', 'pid', 'ppid', 'c', 'stime', 'time', 'cmd']

type Group = { x: number, y: number, width: number, height: number, labelX: number, labelY: number }
const tallGroup: Group = { x: 8, y: 8, width: 264, height: 254, labelX: 16, labelY: 22 }
const wideGroup: Group = { x: 8, y: 8, width: 424, height: 158, labelX: 16, labelY: 22 }

const question = 'ps -ef의 한 줄은 무엇을 말할까?'
const idleCaption = 'ps -ef의 목록에서 backup.sh 프로세스가 차지한 한 줄을 칸 이름과 값으로 나눠 놓았다. 값은 예로 붙인 것이고, 터미널을 나타내는 TTY 칸은 값을 예로 들지 않아 그리지 않았다. 버튼을 고르면 칸들이 무엇을 말하는지 볼 수 있다.'
const legend = '칸 이름과 그 값을 나란히 놓았고, 칸은 ps -ef가 보이는 차례대로 놓았다.'
const figureName = 'ps -ef의 목록에서 backup.sh 프로세스가 차지한 한 줄을 칸 이름과 값으로 나눠, 누가 무엇을 실행했는지, 어느 프로세스의 번호인지, 언제 시작해 CPU를 얼마나 썼는지 보이는 도식'
const svgName = 'ps -ef가 보인 backup.sh의 줄 테두리 안에 UID user1, PID 2310, PPID 2045, C 0, STIME 09:15, TIME 00:00:01, CMD /home/user1/backup.sh가 칸 이름과 값의 짝으로 차례로 놓여 있다'
const expectedScenarios = [
  {
    id: 'who', label: '누가 무엇을',
    nodes: ['uid-name', 'uid', 'cmd-name', 'cmd'],
    caption: 'UID 칸은 이 프로세스를 실행한 사용자 user1이고, CMD 칸은 실행한 명령 /home/user1/backup.sh다. -f를 붙였으므로 UID 칸에는 번호가 아니라 사용자 이름이 나온다.',
    sources: [anchorConceptId],
  },
  {
    id: 'ids', label: '번호',
    nodes: ['pid-name', 'pid', 'ppid-name', 'ppid'],
    caption: 'PID 칸의 2310은 이 프로세스 자신의 번호이고, PPID 칸의 2045는 이 프로세스를 만든 부모 프로세스, 곧 셸 bash의 번호다. 두 칸은 서로 다른 프로세스를 가리킨다.',
    sources: [anchorConceptId],
  },
  {
    id: 'time', label: '시각과 시간',
    nodes: ['stime-name', 'stime', 'time-name', 'time'],
    caption: 'STIME 칸의 09:15는 이 프로세스가 시작한 시각이고, TIME 칸의 00:00:01은 지금까지 CPU를 실제로 쓴 시간을 더한 값이다. 시작한 뒤 흐른 시간이 아니므로 두 값은 따로 읽는다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 270]
const wideBox: [number, number, number, number] = [0, 0, 440, 174]

function diagram() {
  return screen.getByRole('img', { name: svgName })
}

async function selectScenario(label: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) })
}

function readBox(rect: Element): SvgBox {
  return {
    id: rect.parentElement?.getAttribute('data-node') ?? rect.getAttribute('data-group') ?? '',
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

function nodeBox(id: string) {
  return readBox(diagram().querySelector(`[data-node="${id}"] rect`)!)
}

function groupBox() {
  return readBox(diagram().querySelector('[data-group="line"]')!)
}

function shownIds(selector: string, attribute: string) {
  return Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)!)
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function contains(outer: SvgBox, inner: SvgBox) {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height
}

// 글자 크기 9인 글이 차지하는 상자. 반각 글자가 화면에서 더 넓게 그려지는 것을 생각해 폭을 1.15배로 잡는다.
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
  expect(diagram().querySelector('[data-group="line"]')!.closest('[opacity]')).toBeNull()
  expect(diagram().querySelector('[data-group-label="line"]')!.closest('[opacity]')).toBeNull()
  expect(diagram().querySelectorAll('[data-path], [data-link], [data-note]')).toHaveLength(0)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다.
// 테두리는 열네 칸을 모두 담고, 그룹 라벨은 테두리 안에서 노드와 겹치지 않는다. 노드는 모두 회색이다.
function expectFits(viewBox: [number, number, number, number], group: Group) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length + 1)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(node.querySelector('rect')).toHaveClass('stroke-disabled')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(label, 10) * 1.15 + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
  }
  for (let i = 0; i < nodeIds.length; i += 1) {
    for (let j = i + 1; j < nodeIds.length; j += 1) {
      expect(overlaps(nodeBox(nodeIds[i]), nodeBox(nodeIds[j])), `${nodeIds[i]} ↔ ${nodeIds[j]}`).toBe(false)
    }
  }

  const rect = diagram().querySelector('[data-group="line"]')!
  expect(rect).toHaveAttribute('x', String(group.x))
  expect(rect).toHaveAttribute('y', String(group.y))
  expect(rect).toHaveAttribute('width', String(group.width))
  expect(rect).toHaveAttribute('height', String(group.height))
  for (const id of nodeIds) expect(contains(groupBox(), nodeBox(id)), id).toBe(true)

  const labelText = diagram().querySelector('[data-group-label="line"]')!
  expect(labelText.textContent).toBe(groupLabels.line)
  expect(labelText).toHaveAttribute('x', String(group.labelX))
  expect(labelText).toHaveAttribute('y', String(group.labelY))
  expect(labelText).toHaveAttribute('font-size', '9')
  const label = textBox(labelText, 'label')
  expect(boxesOutsideViewBox([label], viewBox)).toEqual([])
  expect(contains(groupBox(), label)).toBe(true)
  for (const id of nodeIds) expect(overlaps(label, nodeBox(id)), id).toBe(false)
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 요점: 칸마다 이름 칸 바로 오른쪽에 값 칸이 맞닿고, 값은 본문이 보인 예 그대로다.
// 「번호」의 선명한 값은 정확히 PID와 PPID이고, PPID의 값은 프로세스 개념의 셸 PID와 같으며 PID의 값과 다르다.
// 세 시나리오의 선명한 칸은 서로 겹치지 않는다.
async function expectPoint() {
  const concepts = topics.find(({ id }) => id === topicId)!.concepts
  const body = concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const processBody = concepts.find(({ id }) => id === `${topicId}.process`)!.paragraphs.join('\n')
  const textOf = (id: string) => diagram().querySelector(`[data-node="${id}"] text`)!.textContent!

  for (const id of valueIds) {
    const name = nodeBox(`${id}-name`)
    const value = nodeBox(id)
    expect(value.y, id).toBe(name.y)
    expect(name.x + name.width, id).toBe(value.x)
    expect(body).toContain(`\`${textOf(`${id}-name`)}\``)
    expect(body).toContain(`\`${textOf(id)}\``)
  }

  const counts = new Map<string, number>()
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    const shown = Array.from(diagram().querySelectorAll('[data-node][opacity="1"]'), (element) => element.getAttribute('data-node')!)
    for (const id of shown) counts.set(id, (counts.get(id) ?? 0) + 1)
    if (label === '번호') {
      expect(shown.filter((id) => valueIds.includes(id)).sort()).toEqual(['pid', 'ppid'])
      expect(textOf('ppid')).not.toBe(textOf('pid'))
      expect(processBody).toContain(`PPID가 둘 다 셸 \`bash\`의 PID인 \`${textOf('ppid')}\`다`)
      expect(processBody).toContain(`PID \`${textOf('pid')}\`을 받는다`)
    }
  }
  expect([...counts.values()].every((count) => count === 1)).toBe(true)
  expect([...counts.keys()].sort()).toEqual(nodeIds.filter((id) => id !== 'c' && id !== 'c-name').sort())
  expect(body).toContain('`PPID`는 그것을 만든 부모 프로세스의 번호다')
}

describe('PsColumnsDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<PsColumnsDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 선·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<PsColumnsDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note], [data-link]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 칸만 선명하다', async (scenario) => {
    const { container } = render(<PsColumnsDiagram />)
    await expectScenario(scenario, container)
  })

  it('시나리오를 바꾸면 이전 칸이 흐려지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<PsColumnsDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-node][opacity="1"]', 'data-node').sort()).toEqual([...scenario.nodes].sort())
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('세 시나리오의 선명한 노드가 서로 다르다', () => {
    const keys = expectedScenarios.map(({ nodes }) => JSON.stringify([...nodes].sort()))
    expect(new Set(keys).size).toBe(expectedScenarios.length)
  })

  it('노드와 테두리가 280×270 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<PsColumnsDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 270')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox, tallGroup)
  })

  it('칸마다 이름과 값이 맞닿고, 번호 시나리오는 PID와 PPID만 밝히며 PPID는 부모 셸의 번호다', async () => {
    render(<PsColumnsDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 고른 시나리오가 서로 섞이지 않는다', async () => {
    render(<><PsColumnsDiagram /><PsColumnsDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    await act(async () => { await userEvent.click(within(figures[0]).getByRole('button', { name: '번호' })) })

    expect(within(figures[0]).getByRole('button', { name: '번호' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(figures[1]).getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    for (const element of figures[1].querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<PsColumnsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['ps-columns']
    const ids = psColumnsScenarios.map(({ id }) => id).sort()
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
      const scenario = psColumnsScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 ps 명령 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×174 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<PsColumnsDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 174')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·그룹 id 집합이 세로형과 같다', () => {
      const { change } = mockMatchMedia(false)
      render(<PsColumnsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 270')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroupIds = shownIds('[data-group]', 'data-group').sort()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 174')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroupIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallGroupIds).toEqual(['line'])
    })

    it('노드와 테두리가 440×174 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<PsColumnsDiagram />)
      expectFits(wideBox, wideGroup)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 칸·캡션을 보인다', async (scenario) => {
      const { container } = render(<PsColumnsDiagram />)
      await expectScenario(scenario, container)
    })

    it('칸마다 이름과 값이 맞닿고, 번호 시나리오는 PID와 PPID만 밝히며 PPID는 부모 셸의 번호다', async () => {
      render(<PsColumnsDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<PsColumnsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 270')
      await selectScenario('시각과 시간')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '시각과 시간' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownIds('[data-node][opacity="1"]', 'data-node').sort()).toEqual(['stime', 'stime-name', 'time', 'time-name'])
      expect(diagram().querySelector('[data-node="time"] rect')).toHaveAttribute('x', '272')
    })
  })
})
