import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ShadowFieldsDiagram, shadowFieldsScenarios } from './ShadowFieldsDiagram'

const topicId = 'linux-accounts'
const anchorConceptId = `${topicId}.etc-shadow`
const labels = {
  'name-name': '사용자 이름',
  'name': 'user4',
  'password-name': '암호화된 암호',
  'password': '(줄임)',
  'lastchange-name': '마지막으로 바꾼 날',
  'lastchange': '20454',
  'min-name': '최소 사용 기간',
  'min': '0',
  'max-name': '최대 사용 기간',
  'max': '60',
  'warn-name': '경고 기간',
  'warn': '7',
  'inactive-name': '비활성 기간',
  'inactive': '(비어 있음)',
  'expire-name': '계정 만료일',
  'expire': '(비어 있음)',
  'reserved-name': '예약 칸',
  'reserved': '(비어 있음)',
}
const groupLabels = { line: 'user4의 /etc/shadow 한 줄' }
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)

// 줄에 적힌 차례대로의 칸. 칸마다 이름 노드 바로 오른쪽에 값 노드가 맞닿는다.
const fields = ['name', 'password', 'lastchange', 'min', 'max', 'warn', 'inactive', 'expire', 'reserved']

const question = '/etc/shadow의 한 줄에는 무엇이 들어 있을까?'
const idleCaption = '/etc/shadow에 적힌 user4의 줄을 콜론으로 나눈 칸 아홉을 칸 이름과 값으로 나눠 놓았다. 암호화된 암호는 (줄임)으로 줄였고, user4와 날 수는 예로 붙인 것이다. 버튼을 고르면 칸들이 무엇을 말하는지 볼 수 있다.'
const legend = '칸 이름과 그 값을 나란히 놓았고, 칸은 줄에 적힌 차례대로 놓았다. (비어 있음)은 그 칸에 아무것도 적혀 있지 않다는 뜻이다.'
const figureName = '/etc/shadow에 적힌 user4의 한 줄을 칸 이름과 값으로 나눠, 암호화된 암호와 암호의 기간 칸, 만료 칸을 보이는 도식'
const svgName = '테두리 user4의 /etc/shadow 한 줄 안에 사용자 이름 user4, 암호화된 암호 (줄임), 마지막으로 바꾼 날 20454, 최소 사용 기간 0, 최대 사용 기간 60, 경고 기간 7, 비활성 기간 (비어 있음), 계정 만료일 (비어 있음), 예약 칸 (비어 있음)이 칸 이름과 값의 짝으로 차례로 놓여 있다'
const expectedScenarios = [
  {
    id: 'password', label: '암호',
    nodes: ['name-name', 'name', 'password-name', 'password'],
    caption: 'user4의 암호는 원래 글자 그대로가 아니라 알아볼 수 없게 바꾼 값으로 둘째 칸에 적혀 있다. 이 파일은 root만 읽을 수 있어서, 모든 사용자가 읽는 /etc/passwd 대신 여기에 둔다.',
    sources: [anchorConceptId],
  },
  {
    id: 'aging', label: '기간',
    nodes: ['lastchange-name', 'lastchange', 'min-name', 'min', 'max-name', 'max', 'warn-name', 'warn'],
    caption: '20454는 1970년 1월 1일부터 센 날 수로 2026년 1월 1일이다. 그날부터 60일이 지나면 암호가 만료되고, 만료되기 7일 전부터 알린다. 최소 사용 기간이 0이라 언제든 다시 바꿀 수 있다.',
    sources: [anchorConceptId],
  },
  {
    id: 'expire', label: '만료',
    nodes: ['inactive-name', 'inactive', 'expire-name', 'expire'],
    caption: '두 칸이 비어 있어, user4는 암호가 만료된 뒤에도 새 암호로 바꾸면 다시 들어올 수 있고 계정도 만료되지 않는다. 계정 만료일을 적어 두면 그날 계정이 만료되어 로그인 자체가 막힌다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 334]
const wideBox: [number, number, number, number] = [0, 0, 440, 206]

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

async function expectScenario(scenario: typeof expectedScenarios[number], container: HTMLElement) {
  await selectScenario(scenario.label)

  for (const element of diagram().querySelectorAll('[data-node]')) {
    const id = element.getAttribute('data-node')!
    expect(element, id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  for (const element of diagram().querySelectorAll('rect[data-group]')) expect(element).not.toHaveAttribute('opacity')
  expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다.
// 칸 노드는 모두 테두리 안에 있고, 칸마다 이름 노드 바로 오른쪽에 값 노드가 맞닿는다.
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
  for (const id of nodeIds) expect(inside(nodeBox(id), groupBox('line')), id).toBe(true)
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
    expect(boxesOutsideViewBox([box], viewBox)).toEqual([])
    expect(inside(box, groupBox(id)), id).toBe(true)
    for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
  }
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 요점: 기간 시나리오의 선명한 칸은 정확히 네 개이고 마지막으로 바꾼 날 칸의 값이 본문 예의 수와 같다.
// 칸 아홉의 값을 차례대로 콜론으로 이으면 본문 예의 줄(줄여 보인 암호 그대로)과 같다. 세 시나리오의 선명한 칸은 겹치지 않는다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const label = (id: string) => diagram().querySelector(`[data-node="${id}"] text`)!.textContent!
  const opacity = (id: string) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')

  const line = fields.map((field) => (label(field) === '(비어 있음)' ? '' : label(field))).join(':')
  expect(line).toBe('user4:(줄임):20454:0:60:7:::')
  expect(body).toContain(`\`${line}\``)
  for (const field of fields) expect(body).toContain(`**${label(`${field}-name`)}**`)
  expect(body).toContain('`(줄임)`으로 줄여 적었다')
  expect(body).toContain('예의 `20454`는 2026년 1월 1일이다')
  expect(body).toContain('20440 + 14 = 20454')
  expect(body).toContain('1970년 1월 1일부터 센 날 수')

  await selectScenario('기간')
  const shownFields = fields.filter((id) => opacity(id) === '1')
  expect(shownFields).toEqual(['lastchange', 'min', 'max', 'warn'])
  expect(label('lastchange')).toBe('20454')
  for (const id of shownFields) expect(body).toContain(`\`${label(id)}\``)

  const seen = new Set<string>()
  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    for (const id of nodeIds.filter((node) => opacity(node) === '1')) {
      expect(seen.has(id), `${scenario.id} ${id}`).toBe(false)
      seen.add(id)
    }
  }
  expect(['name-name', 'name'].every((id) => expectedScenarios.find(({ id: s }) => s === 'password')!.nodes.includes(id))).toBe(true)
}

describe('ShadowFieldsDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<ShadowFieldsDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 선·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<ShadowFieldsDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 칸만 선명하다', async (scenario) => {
    const { container } = render(<ShadowFieldsDiagram />)
    await expectScenario(scenario, container)
  })

  it('전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<ShadowFieldsDiagram />)
    for (const scenario of expectedScenarios) await selectScenario(scenario.label)
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('세 시나리오가 보이는 것이 서로 다르다', () => {
    const keys = expectedScenarios.map(({ nodes }) => JSON.stringify([...nodes].sort()))
    expect(new Set(keys).size).toBe(expectedScenarios.length)
  })

  it('노드가 280×334 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<ShadowFieldsDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 334')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox)
  })

  it('기간 칸은 넷이고, 칸 아홉은 본문 예의 줄을 차례대로 나눈 것이다', async () => {
    render(<ShadowFieldsDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 고른 시나리오가 섞이지 않는다', async () => {
    render(<><ShadowFieldsDiagram /><ShadowFieldsDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    await act(async () => { await userEvent.click(within(figures[0]).getByRole('button', { name: '기간' })) })

    expect(within(figures[0]).getByRole('button', { name: '기간' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(figures[1]).getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    for (const element of figures[1].querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<ShadowFieldsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['shadow-fields']
    const ids = shadowFieldsScenarios.map(({ id }) => id).sort()
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
      const scenario = shadowFieldsScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 /etc/shadow 파일 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×206 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<ShadowFieldsDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 206')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·그룹 id 집합이 세로형과 같다', () => {
      const { change } = mockMatchMedia(false)
      render(<ShadowFieldsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 334')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroups = shownIds('rect[data-group]', 'data-group').sort()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 206')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('rect[data-group]', 'data-group').sort()).toEqual(tallGroups)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallGroups).toEqual([...groupIds].sort())
    })

    it('노드가 440×206 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<ShadowFieldsDiagram />)
      expectFits(wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 칸·캡션을 보인다', async (scenario) => {
      const { container } = render(<ShadowFieldsDiagram />)
      await expectScenario(scenario, container)
    })

    it('기간 칸은 넷이고, 칸 아홉은 본문 예의 줄을 차례대로 나눈 것이다', async () => {
      render(<ShadowFieldsDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<ShadowFieldsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 334')
      await selectScenario('만료')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '만료' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(diagram().querySelector('[data-node="warn-name"] rect')).toHaveAttribute('x', '224')
    })
  })
})
