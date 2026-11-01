import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { StorageAccountDiagram, storageAccountScenarios } from './StorageAccountDiagram'

const topicId = 'azure-storage'
const anchorConceptId = `${topicId}.storage-accounts`
const accountName = 'companycdata'
const labels = {
  'blob': 'Blob',
  'files': '파일 공유',
  'queue': '큐',
  'table': '테이블',
  'managed-disk': '관리 디스크',
}
const groupLabels = { account: '스토리지 계정' }
const noteLabels = {
  'name-note': accountName,
  'services-note': '이름은 Azure 전체에서 하나뿐',
  'blob-endpoint-note': `https://${accountName}.blob.core.windows.net`,
  'file-endpoint-note': `https://${accountName}.file.core.windows.net`,
  'disk-note': '계정을 직접 만들지 않는다',
}
type NoteId = keyof typeof noteLabels

const allNodes = Object.keys(labels)
const serviceNodes = ['blob', 'files', 'queue', 'table']
const question = '스토리지 계정 안에는 무엇이 있을까?'
const idleCaption = '회사 C의 스토리지 계정 companycdata와 그 밖에 그린 관리 디스크다. 버튼을 고르면 계정이 무엇을 담는지, 계정 이름이 어떻게 주소가 되는지, 관리 디스크가 왜 계정 밖에 있는지 볼 수 있다.'
const legend = '박스는 스토리지 계정이고, companycdata는 설명을 위해 정한 이름이다. 흐리게 그린 노드는 그 버튼의 설명에 들지 않는 것이다.'
const figureName = '스토리지 계정이 담는 서비스와 서비스마다의 주소, 계정 밖의 관리 디스크를 보는 도식'
const svgName = '스토리지 계정 companycdata 안에 Blob·파일 공유·큐·테이블이 있고, 계정 밖에 관리 디스크가 있다'
const expectedScenarios = [
  {
    id: 'services', label: '계정 안의 서비스',
    nodes: serviceNodes,
    notes: ['services-note'],
    caption: '스토리지 계정 하나가 Blob·파일 공유·큐·테이블을 담고, 그 데이터에 고유한 네임스페이스를 준다. 이름 companycdata는 구독이나 지역이 달라도 Azure 전체에서 다른 계정이 쓸 수 없다.',
    sources: ['azure-storage.storage-accounts'],
  },
  {
    id: 'endpoint', label: '주소',
    nodes: ['blob', 'files'],
    notes: ['blob-endpoint-note', 'file-endpoint-note'],
    caption: '계정 이름과 서비스 이름이 합쳐져 서비스마다 다른 주소가 된다. companycdata 계정의 Blob과 파일 공유는 같은 계정 이름에 blob과 file이 붙은 주소로 닿는다.',
    sources: ['azure-storage.storage-accounts'],
  },
  {
    id: 'disk', label: '계정 밖',
    nodes: ['managed-disk'],
    notes: ['disk-note'],
    caption: '관리 디스크를 쓸 때는 쓰는 쪽이 스토리지 계정을 만들거나 관리하지 않는다. 그 일은 Azure가 뒤에서 대신하고, 쓰는 쪽은 디스크의 유형과 크기만 정한다.',
    sources: ['azure-storage.storage-accounts'],
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

function accountBox() {
  return readBox(diagram().querySelector('[data-group="account"]')!)
}

function inAccount(box: SvgBox) {
  const frame = accountBox()
  return boxesOutsideViewBox([box], [frame.x, frame.y, frame.width, frame.height]).length === 0
}

function shownNotes() {
  return Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note')!)
}

// 글자가 차지하는 상자. 반각 글자는 화면에서 더 넓으므로 1.15배로 잡는다.
function textBox(text: Element): SvgBox {
  return {
    id: text.getAttribute('data-note') ?? text.getAttribute('data-group-label')!,
    x: Number(text.getAttribute('x')), y: Number(text.getAttribute('y')) - 9,
    width: estimateTextWidth(text.textContent!, 9) * 1.15, height: 9,
  }
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function opacityOf(id: string) {
  return diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')
}

// 이 도식에는 경로·연결선·화살표가 없다.
function expectNoPaths() {
  expect(diagram().querySelectorAll('path, [data-path], [data-link], marker')).toHaveLength(0)
}

// 아래 단언들은 배치에 묶이지 않는다. 세로형과 가로형이 같은 기대값으로 통과해야 한다.
async function expectScenario(scenario: typeof expectedScenarios[number], width: number, container: HTMLElement) {
  await selectScenario(scenario.label)

  for (const id of allNodes) expect(opacityOf(id), id).toBe(scenario.nodes.includes(id) ? '1' : '0.25')
  for (const group of diagram().querySelectorAll('[data-group], [data-group-label]')) expect(group.closest('[opacity]')).toBeNull()
  expectNoPaths()
  // 계정 이름 곁말은 예시 값이라 늘 보인다(ADR-038).
  expect(shownNotes().sort()).toEqual(['name-note', ...scenario.notes].sort())

  const nodeBoxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  const labelBox = textBox(diagram().querySelector('[data-group-label="account"]')!)
  const noteBoxes = Array.from(diagram().querySelectorAll('[data-note]'), textBox)
  for (const note of diagram().querySelectorAll('[data-note]')) {
    const id = note.getAttribute('data-note')! as NoteId
    const box = textBox(note)
    expect(note.textContent).toBe(noteLabels[id])
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note.closest('[opacity]')).toBeNull()
    expect(box.x, id).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, id).toBeLessThanOrEqual(width)
    expect(overlaps(box, labelBox), `${id} ↔ 그룹 라벨`).toBe(false)
    for (const node of nodeBoxes) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const other of noteBoxes) {
      if (other.id !== id) expect(overlaps(box, other), `${id} ↔ ${other.id}`).toBe(false)
    }
    // 계정 안의 곁말은 계정 박스 안에, 관리 디스크의 곁말은 박스 밖에 있다.
    expect(inAccount(box), id).toBe(id !== 'disk-note')
  }
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 1.15배로 잡아도 자기 상자 안에 들어간다.
function expectFits(viewBox: [number, number, number, number]) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), readBox)
  expect(boxes).toHaveLength(6)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(label, 10) * 1.15 + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
  }

  const box = accountBox()
  const groupLabel = diagram().querySelector('[data-group-label="account"]')!
  expect(groupLabel.textContent).toBe(groupLabels.account)
  expect(groupLabel).toHaveAttribute('font-size', '9')
  expect(groupLabel).toHaveClass('fill-muted')
  expect(Number(groupLabel.getAttribute('x'))).toBe(box.x + 10)
  expect(Number(groupLabel.getAttribute('y'))).toBe(box.y + 14)
}

// 요점: 서비스 넷은 계정 안이고 관리 디스크는 계정 밖이다. 라벨 자리 아래에 노드가 있고 노드는 모두 회색이다.
function expectMembershipAndColors() {
  for (const id of serviceNodes) {
    expect(inAccount(nodeBox(id)), id).toBe(true)
    expect(nodeBox(id).y, id).toBeGreaterThan(accountBox().y + 14)
  }
  expect(inAccount(nodeBox('managed-disk'))).toBe(false)
  expect(overlaps(nodeBox('managed-disk'), accountBox())).toBe(false)
  for (const id of allNodes) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 요점: 주소 곁말 둘은 본문에 쓴 주소와 같고 계정 이름이 같다. 계정 밖 시나리오에서는 서비스 넷이 모두 흐리다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join(' ')

  await selectScenario('주소')
  const addresses = ['blob-endpoint-note', 'file-endpoint-note'].map((id) => diagram().querySelector(`[data-note="${id}"]`)!.textContent!)
  for (const address of addresses) {
    expect(body).toContain(`\`${address}\``)
    expect(new URL(address).hostname.split('.')[0]).toBe(accountName)
  }
  expect(body).toContain(`\`${accountName}\``)

  await selectScenario('계정 밖')
  for (const id of serviceNodes) expect(opacityOf(id), id).toBe('0.25')
  expect(opacityOf('managed-disk')).toBe('1')
}

describe('StorageAccountDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<StorageAccountDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드 다섯이 모두 선명하고 경로가 없으며 계정 이름 곁말만 보인다', () => {
    const { container } = render(<StorageAccountDiagram />)

    expect(Array.from(diagram().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node')).sort()).toEqual([...allNodes].sort())
    for (const id of allNodes) expect(opacityOf(id), id).toBe('1')
    expectNoPaths()
    expect(shownNotes()).toEqual(['name-note'])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·곁말만 보이고 나머지 노드는 흐려진다', async (scenario) => {
    const { container } = render(<StorageAccountDiagram />)
    await expectScenario(scenario, 280, container)
  })

  it('세 시나리오의 선명한 노드와 곁말이 서로 다르다', () => {
    const shapes = expectedScenarios.map(({ nodes, notes }) => JSON.stringify([nodes, notes]))
    expect(new Set(shapes).size).toBe(expectedScenarios.length)
  })

  it('시나리오를 바꾸면 이전 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<StorageAccountDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownNotes().sort()).toEqual(['name-note', ...scenario.notes].sort())
    }
    await selectScenario('전체')

    for (const id of allNodes) expect(opacityOf(id), id).toBe('1')
    expect(shownNotes()).toEqual(['name-note'])
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('그룹과 노드가 280×188 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<StorageAccountDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 188')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 188])
  })

  it('서비스 넷은 계정 안에, 관리 디스크는 계정 밖에 있고 노드는 모두 회색이다', () => {
    render(<StorageAccountDiagram />)
    expectMembershipAndColors()
  })

  it('주소 곁말이 본문의 주소와 같고, 계정 밖 시나리오에서 서비스 넷이 흐려진다', async () => {
    render(<StorageAccountDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 각 도식에 경로와 화살표 마커가 없다', () => {
    render(<><StorageAccountDiagram /><StorageAccountDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })

    expect(figures).toHaveLength(2)
    for (const figure of figures) {
      expect(figure.querySelectorAll('path')).toHaveLength(0)
      expect(figure.querySelector('marker')).toBeNull()
    }
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<StorageAccountDiagram />)
    const text = visualsByTopicId[topicId].diagrams['storage-account']
    const ids = storageAccountScenarios.map(({ id }) => id).sort()
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
      const scenario = storageAccountScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: expected.sources })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual([])
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 스토리지 계정 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×150 viewBox를 w-full 래퍼 하나로 그리고 노드·그룹 id가 세로형과 같다', () => {
      const { change } = mockMatchMedia(false)
      render(<StorageAccountDiagram />)
      const ids = (selector: string, attribute: string) => Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)!).sort()
      const tallNodes = ids('[data-node]', 'data-node')
      const tallGroups = ids('[data-group]', 'data-group')

      act(() => change(true))

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 150')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodes)
      expect(ids('[data-group]', 'data-group')).toEqual(tallGroups)
      expectNoPaths()
    })

    it('모든 rect가 440×150 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<StorageAccountDiagram />)
      expectFits([0, 0, 440, 150])
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<StorageAccountDiagram />)
      await expectScenario(scenario, 440, container)
    })

    it('서비스 넷은 계정 안에, 관리 디스크는 계정 밖에 있고 노드는 모두 회색이다', () => {
      render(<StorageAccountDiagram />)
      expectMembershipAndColors()
    })

    it('주소 곁말이 본문의 주소와 같고, 계정 밖 시나리오에서 서비스 넷이 흐려진다', async () => {
      render(<StorageAccountDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<StorageAccountDiagram />)
      await selectScenario('주소')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '주소' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownNotes().sort()).toEqual(['blob-endpoint-note', 'file-endpoint-note', 'name-note'])
    })
  })
})
