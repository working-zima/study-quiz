import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { SubscriptionBoundaryDiagram, subscriptionBoundaryScenarios } from './SubscriptionBoundaryDiagram'

const topicId = 'azure-resource-hierarchy'
const anchorConceptId = `${topicId}.subscription-boundaries`
const labels = {
  'rg-dev': '리소스 그룹',
  'bill-dev': '청구서',
  'access-dev': '액세스 규칙',
  'rg-prod': '리소스 그룹',
  'bill-prod': '청구서',
  'access-prod': '액세스 규칙',
}
const groupLabels = {
  'account': 'Azure 계정',
  'sub-dev': '구독: 개발',
  'sub-prod': '구독: 운영',
}
const noteLabels = {
  'dev-billing-note': '따로 청구',
  'prod-billing-note': '따로 청구',
  'dev-access-note': '다른 규칙',
  'prod-access-note': '다른 규칙',
}
type NoteId = keyof typeof noteLabels
type NotePlaces = Record<NoteId, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }>

const tallNotes: NotePlaces = {
  'dev-billing-note': { x: 140, y: 40, anchor: 'start' },
  'prod-billing-note': { x: 140, y: 114, anchor: 'start' },
  'dev-access-note': { x: 140, y: 40, anchor: 'start' },
  'prod-access-note': { x: 140, y: 114, anchor: 'start' },
}
const wideNotes: NotePlaces = {
  'dev-billing-note': { x: 110, y: 40, anchor: 'start' },
  'prod-billing-note': { x: 318, y: 40, anchor: 'start' },
  'dev-access-note': { x: 110, y: 40, anchor: 'start' },
  'prod-access-note': { x: 318, y: 40, anchor: 'start' },
}
// 곁말은 자기 구독 박스 안에 있어야 한다.
const noteSubscription: Record<NoteId, string> = {
  'dev-billing-note': 'sub-dev',
  'prod-billing-note': 'sub-prod',
  'dev-access-note': 'sub-dev',
  'prod-access-note': 'sub-prod',
}

const allNodes = Object.keys(labels)
const subscriptions = ['sub-dev', 'sub-prod']
const question = '구독을 둘로 나누면, 무엇이 따로 갈릴까?'
const idleCaption = '회사 A는 Azure 계정 하나에 구독 「개발」과 구독 「운영」을 두고, 구독마다 리소스 그룹을 만들어 리소스를 넣었다. 버튼을 고르면 구독을 나눌 때 무엇이 구독마다 따로 갈리는지 볼 수 있다.'
const legend = '큰 박스는 Azure 계정이고, 그 안의 두 박스는 구독이다. 구독마다 리소스 그룹을 하나씩 그린 것은 예다. 시나리오를 고르면 그 경계 때문에 구독마다 따로 정해지는 것만 선명하게 남는다.'
const figureName = 'Azure 계정 하나에 둔 두 구독에서 청구서와 액세스 규칙이 구독마다 따로 갈리는 것을 보는 도식'
const svgName = 'Azure 계정 안에 구독 「개발」과 구독 「운영」이 있고, 구독마다 리소스 그룹·청구서·액세스 규칙이 있다'
const expectedScenarios = [
  {
    id: 'billing', label: '청구 경계',
    nodes: ['bill-dev', 'bill-prod'],
    notes: ['dev-billing-note', 'prod-billing-note'],
    caption: '청구서는 구독마다 따로 나온다. 구독 「개발」에서 쓴 비용과 구독 「운영」에서 쓴 비용이 서로 다른 청구서로 청구되므로, 비용을 나눠 받으려면 구독을 나눈다. 같은 구독 안에서 리소스 그룹을 나눠서는 청구서가 나뉘지 않는다.',
    sources: ['azure-resource-hierarchy.subscription-boundaries'],
  },
  {
    id: 'access', label: '액세스 제어 경계',
    nodes: ['access-dev', 'access-prod'],
    notes: ['dev-access-note', 'prod-access-note'],
    caption: '액세스 규칙과 지출 한도는 구독마다 따로 둘 수 있다. 구독 「개발」과 구독 「운영」에 서로 다른 액세스 규칙과 지출 한도를 두어, 개발 환경과 운영 환경을 따로 관리한다.',
    sources: ['azure-resource-hierarchy.subscription-boundaries'],
  },
]

function diagram() {
  return screen.getByRole('img', { name: svgName })
}

async function selectScenario(label: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) })
}

function readBox(rect: Element): SvgBox {
  return {
    id: rect.getAttribute('data-group') ?? rect.parentElement?.getAttribute('data-node') ?? '',
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

function nodeBox(id: string) {
  return readBox(diagram().querySelector(`[data-node="${id}"] rect`)!)
}

function groupBox(id: string) {
  return readBox(diagram().querySelector(`[data-group="${id}"]`)!)
}

function inside(box: SvgBox, group: string) {
  const frame = groupBox(group)
  return boxesOutsideViewBox([box], [frame.x, frame.y, frame.width, frame.height]).length === 0
}

function shownIds(selector: string, attribute: string) {
  return Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)!)
}

// 글자가 차지하는 상자. 높이는 글자 크기 9를 기준선 위로 잡는다.
function textBox(text: Element): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9)
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id: text.getAttribute('data-note') ?? text.getAttribute('data-group-label')!, x: left, y: y - 9, width, height: 9 }
}

// 그룹 라벨이 차지하는 자리. 반각 글자 여유(1.15배)까지 잡는다.
function groupLabelArea(id: string): SvgBox {
  const group = groupBox(id)
  return { id, x: group.x + 10, y: group.y + 5, width: estimateTextWidth(groupLabels[id as keyof typeof groupLabels], 9) * 1.15, height: 9 }
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function opacityOf(id: string) {
  return diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')
}

// 노드를 담는 구독 박스. 노드는 구독 하나에만 든다.
function subscriptionsHolding(id: string) {
  return subscriptions.filter((group) => inside(nodeBox(id), group))
}

// 이 도식에는 경로·연결선·화살표가 없다. 무엇이 구독마다 갈리는지는 흐림과 곁말로만 보인다.
function expectNoPaths() {
  expect(diagram().querySelectorAll('path, [data-path], [data-link], marker')).toHaveLength(0)
}

// 아래 단언들은 배치에 묶이지 않는다. 세로형과 가로형이 같은 기대값으로 통과해야 한다.
async function expectScenario(
  scenario: typeof expectedScenarios[number],
  places: NotePlaces,
  width: number,
  container: HTMLElement,
) {
  await selectScenario(scenario.label)

  for (const node of diagram().querySelectorAll('[data-node]')) {
    expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
  }
  for (const group of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(group.closest('[opacity]')).toBeNull()
  expectNoPaths()

  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  const groupLabelBoxes = Object.keys(groupLabels).map(groupLabelArea)
  const shownNotes = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shownNotes.map((note) => note.getAttribute('data-note')).sort()).toEqual([...scenario.notes].sort())
  for (const note of shownNotes) {
    const id = note.getAttribute('data-note')! as NoteId
    expect(note.textContent).toBe(noteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', places[id].anchor)
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note.closest('[opacity]')).toBeNull()
    const box = textBox(note)
    const wideBox = { ...box, width: box.width * 1.15 }
    const holder = groupBox(noteSubscription[id])
    expect(box.x, id).toBeGreaterThanOrEqual(0)
    // 반각 글자는 화면에서 더 넓다 — 1.15배로 잡아도 viewBox 안이고 자기 구독 박스 안이어야 한다.
    expect(wideBox.x + wideBox.width, id).toBeLessThanOrEqual(width)
    expect(wideBox.x, id).toBeGreaterThanOrEqual(holder.x)
    expect(wideBox.x + wideBox.width, id).toBeLessThanOrEqual(holder.x + holder.width)
    expect(wideBox.y, id).toBeGreaterThanOrEqual(holder.y)
    for (const label of groupLabelBoxes) expect(overlaps(wideBox, label), `${id} ↔ ${label.id}`).toBe(false)
    for (const node of nodeBoxes) expect(overlaps(wideBox, node), `${id} ↔ ${node.id}`).toBe(false)
  }
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 상자 안에, 그룹 라벨은 1.15배로 잡아도 자기 박스 오른쪽 끝 안에 들어간다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(9)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(label, 10) * 1.15 + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
  }

  for (const [id, wording] of Object.entries(groupLabels)) {
    const box = groupBox(id)
    const groupLabel = diagram().querySelector(`[data-group-label="${id}"]`)!
    expect(groupLabel.textContent).toBe(wording)
    expect(groupLabel).toHaveAttribute('font-size', '9')
    expect(groupLabel).toHaveClass('fill-muted')
    const x = Number(groupLabel.getAttribute('x'))
    expect(x, wording).toBe(box.x + 10)
    expect(Number(groupLabel.getAttribute('y')), wording).toBe(box.y + 14)
    expect(x + estimateTextWidth(wording, 9) * 1.15, wording).toBeLessThanOrEqual(box.x + box.width)
  }
}

// 구독 박스 둘은 Azure 계정 박스 안에 있고 서로 겹치지 않는다. 구독 박스의 라벨 자리는 계정 박스의 라벨 자리보다 아래에 있다.
// 노드는 구독 박스 하나에만 들고, 자기 구독의 라벨 자리보다 아래에 있다. 노드는 모두 회색이다.
function expectMembershipAndColors() {
  const account = groupBox('account')
  for (const subscription of subscriptions) {
    const box = groupBox(subscription)
    expect(boxesOutsideViewBox([box], [account.x, account.y, account.width, account.height]), subscription).toEqual([])
    expect(groupLabelArea(subscription).y, subscription).toBeGreaterThan(groupLabelArea('account').y + 9)
    expect(overlaps(groupLabelArea(subscription), groupLabelArea('account')), subscription).toBe(false)
  }
  expect(overlaps(groupBox('sub-dev'), groupBox('sub-prod'))).toBe(false)
  for (const id of allNodes) {
    const holding = subscriptionsHolding(id)
    expect(holding, id).toHaveLength(1)
    expect(nodeBox(id).y, id).toBeGreaterThan(groupLabelArea(holding[0]).y + 9)
    expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  }
  expect(allNodes.filter((id) => subscriptionsHolding(id)[0] === 'sub-dev').sort()).toEqual(['access-dev', 'bill-dev', 'rg-dev'])
  expect(allNodes.filter((id) => subscriptionsHolding(id)[0] === 'sub-prod').sort()).toEqual(['access-prod', 'bill-prod', 'rg-prod'])
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 요점: 청구 경계와 액세스 제어 경계의 선명한 노드 집합은 겹치지 않고, 각 집합의 두 노드는 서로 다른 구독 박스에 든다.
// 두 시나리오 모두 리소스 그룹은 흐리다 — 리소스 그룹은 이 경계를 가르는 단위가 아니다.
async function expectPoint() {
  const vividSets: string[][] = []
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    const vivid = allNodes.filter((id) => opacityOf(id) === '1')
    expect(vivid, label).toHaveLength(2)
    expect(vivid.map((id) => subscriptionsHolding(id)[0]).sort(), label).toEqual([...subscriptions].sort())
    expect(opacityOf('rg-dev'), label).toBe('0.25')
    expect(opacityOf('rg-prod'), label).toBe('0.25')
    vividSets.push(vivid)
  }
  expect(vividSets[0].filter((id) => vividSets[1].includes(id))).toEqual([])
}

describe('SubscriptionBoundaryDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<SubscriptionBoundaryDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 여섯이 모두 선명하고 경로와 곁말이 없으며 선택 안내가 나온다', () => {
    const { container } = render(<SubscriptionBoundaryDiagram />)
    const nodes = diagram().querySelectorAll('[data-node]')

    expect(Array.from(nodes, (node) => node.getAttribute('data-node')).sort()).toEqual([...allNodes].sort())
    for (const node of nodes) expect(node).toHaveAttribute('opacity', '1')
    expectNoPaths()
    expect(shownIds('[data-note]', 'data-note')).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·곁말만 보이고 나머지 노드는 흐려진다', async (scenario) => {
    const { container } = render(<SubscriptionBoundaryDiagram />)
    await expectScenario(scenario, tallNotes, 280, container)
  })

  it('시나리오를 바꾸면 이전 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<SubscriptionBoundaryDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
    }
    await selectScenario('전체')

    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(shownIds('[data-note]', 'data-note')).toEqual([])
    expectNoPaths()
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
    for (const { label } of expectedScenarios) expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'false')
  })

  it('그룹 셋과 노드 여섯이 280×180 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<SubscriptionBoundaryDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 180')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 180])
  })

  it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 0..280 안에 있다', async (label) => {
    render(<SubscriptionBoundaryDiagram />)
    await selectScenario(label)

    expect(diagram().querySelectorAll('[data-group]')).toHaveLength(3)
    for (const text of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(text.closest('[opacity]')).toBeNull()
    for (const text of diagram().querySelectorAll('[data-group-label], [data-note]')) {
      expect(text).toHaveAttribute('font-size', '9')
      const box = textBox(text)
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width * 1.15).toBeLessThanOrEqual(280)
    }
  })

  it('구독 둘은 Azure 계정 안에서 겹치지 않고, 노드는 구독 하나에만 들며 모두 회색이다', () => {
    render(<SubscriptionBoundaryDiagram />)
    expectMembershipAndColors()
  })

  it('청구 경계와 액세스 제어 경계는 서로 다른 것을 구독마다 하나씩 가르고, 리소스 그룹은 두 경계 모두에서 흐리다', async () => {
    render(<SubscriptionBoundaryDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 각 도식에 경로와 화살표 마커가 없다', () => {
    render(<><SubscriptionBoundaryDiagram /><SubscriptionBoundaryDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })

    expect(figures).toHaveLength(2)
    for (const figure of figures) {
      expect(figure.querySelectorAll('path')).toHaveLength(0)
      expect(figure.querySelector('marker')).toBeNull()
    }
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<SubscriptionBoundaryDiagram />)
    const text = visualsByTopicId[topicId].diagrams['subscription-boundaries']
    const ids = subscriptionBoundaryScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([`${topicId}.subscription`, anchorConceptId])
    expect(text.label).toBe(figureName)
    expect(text.svgLabel).toBe(svgName)
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = subscriptionBoundaryScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 구독 경계 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
          const event = Object.assign(new Event('change'), {
            matches: nextMatches,
            media: mediaQuery.media,
          })
          listeners.forEach((listener) => listener(event))
        },
      }
    }

    function ids(selector: string, attribute: string) {
      return shownIds(selector, attribute).sort()
    }

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×144 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<SubscriptionBoundaryDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 144')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expectNoPaths()
    })

    it('노드·그룹 id 집합이 세로형과 같다', () => {
      const { change } = mockMatchMedia(false)
      render(<SubscriptionBoundaryDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 180')
      const tallNodes = ids('[data-node]', 'data-node')
      const tallGroups = ids('[data-group]', 'data-group')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 144')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(tallNodes).toEqual([...allNodes].sort())
      expect(ids('[data-group]', 'data-group')).toEqual(tallGroups)
      expect(tallGroups).toEqual(Object.keys(groupLabels).sort())
      expectNoPaths()
    })

    it('모든 rect가 440×144 viewBox 안에 있고 노드 라벨·그룹 라벨이 자기 상자 안에 들어간다', () => {
      render(<SubscriptionBoundaryDiagram />)
      expectFits([0, 0, 440, 144])
    })

    it.each(['전체', ...expectedScenarios.map(({ label }) => label)])('%s: 그룹은 흐려지지 않고 그룹 라벨·곁말은 크기 9로 0..440 안에 있다', async (label) => {
      render(<SubscriptionBoundaryDiagram />)
      await selectScenario(label)

      expect(diagram().querySelectorAll('[data-group]')).toHaveLength(3)
      for (const text of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(text.closest('[opacity]')).toBeNull()
      for (const text of diagram().querySelectorAll('[data-group-label], [data-note]')) {
        expect(text).toHaveAttribute('font-size', '9')
        const box = textBox(text)
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width * 1.15).toBeLessThanOrEqual(440)
      }
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·곁말·캡션을 보이고 곁말은 노드·그룹 라벨과 겹치지 않는다', async (scenario) => {
      const { container } = render(<SubscriptionBoundaryDiagram />)
      await expectScenario(scenario, wideNotes, 440, container)
    })

    it('구독 둘은 Azure 계정 안에서 겹치지 않고, 노드는 구독 하나에만 들며 모두 회색이다', () => {
      render(<SubscriptionBoundaryDiagram />)
      expectMembershipAndColors()
    })

    it('청구 경계와 액세스 제어 경계는 서로 다른 것을 구독마다 하나씩 가르고, 리소스 그룹은 두 경계 모두에서 흐리다', async () => {
      render(<SubscriptionBoundaryDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<SubscriptionBoundaryDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 180')
      await selectScenario('액세스 제어 경계')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '액세스 제어 경계' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      for (const note of diagram().querySelectorAll('[data-note]')) {
        expect(note).toHaveAttribute('x', String(wideNotes[note.getAttribute('data-note')! as NoteId].x))
      }
    })
  })
})
