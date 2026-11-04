import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { DiskDeviceNameDiagram, diskDeviceNameScenarios } from './DiskDeviceNameDiagram'

const topicId = 'linux-filesystem'
const anchorConceptId = `${topicId}.disk-device-names`
const labels = {
  dir: '/dev/',
  driver: 'sd',
  disk: 'a',
  part: '5',
}
const groupLabels = { name: '장치 이름' }
const noteLabels = {
  'dir-note': '장치 파일을 두는 디렉터리',
  'driver-note': 'sd 드라이버가 다루는 디스크',
  'disk-note': 'a는 첫째, b는 둘째 디스크',
  'part-note': '파티션 번호 5',
  'logical-note': 'MBR에서는 첫 논리 파티션',
}
type NoteId = keyof typeof noteLabels

// 장치 이름 테두리 안에 왼쪽부터 빈틈없이 이어 놓은 덩어리.
const nodeIds = Object.keys(labels)

type Group = { x: number, y: number, width: number, height: number, labelX: number, labelY: number }
const tallGroup: Group = { x: 8, y: 8, width: 264, height: 96, labelX: 16, labelY: 22 }
const wideGroup: Group = { x: 8, y: 8, width: 424, height: 96, labelX: 16, labelY: 22 }

type Note = { x: number, y: number, anchor: 'start' | 'middle' | 'end' }
const tallNotes: Record<NoteId, Note> = {
  'dir-note': { x: 20, y: 82, anchor: 'start' },
  'driver-note': { x: 120, y: 82, anchor: 'middle' },
  'disk-note': { x: 176, y: 82, anchor: 'middle' },
  'part-note': { x: 260, y: 82, anchor: 'end' },
  'logical-note': { x: 260, y: 96, anchor: 'end' },
}
const wideNotes: Record<NoteId, Note> = {
  'dir-note': { x: 48, y: 82, anchor: 'start' },
  'driver-note': { x: 192, y: 82, anchor: 'middle' },
  'disk-note': { x: 272, y: 82, anchor: 'middle' },
  'part-note': { x: 392, y: 82, anchor: 'end' },
  'logical-note': { x: 392, y: 96, anchor: 'end' },
}

const question = '/dev/sda5는 어떻게 읽을까?'
const idleCaption = '디스크의 장치 이름 /dev/sda5를 앞에서부터 네 덩어리로 끊어 놓았다. 버튼을 고르면 덩어리마다 무엇을 뜻하는지 볼 수 있다.'
const legend = '네 칸을 왼쪽부터 이어 읽으면 장치 이름 하나가 된다. 칸의 너비는 뜻과 상관없다.'
const figureName = '디스크의 장치 이름 /dev/sda5를 /dev/, sd, a, 5 네 덩어리로 끊어, 덩어리마다 장치 파일을 두는 디렉터리, sd 드라이버가 다루는 디스크, 몇째 디스크, 파티션 번호를 뜻한다는 것을 보이는 도식'
const svgName = '장치 이름 테두리 안에 /dev/, sd, a, 5가 차례로 빈틈없이 이어져 /dev/sda5를 이룬다'
const expectedScenarios = [
  {
    id: 'directory', label: '/dev/',
    nodes: ['dir'],
    notes: ['dir-note'] as NoteId[],
    caption: '/dev/는 장치 파일을 두는 디렉터리다. Linux는 디스크와 그 안의 파티션도 이 디렉터리 아래의 장치 파일로 나타내고, 디스크를 나누는 fdisk 같은 명령은 이 이름을 받아 어느 디스크나 파티션을 다룰지 안다.',
    sources: [anchorConceptId],
  },
  {
    id: 'driver', label: 'sd',
    nodes: ['driver'],
    notes: ['driver-note'] as NoteId[],
    caption: 'sd는 커널 안에서 SCSI 디스크를 다루는 드라이버의 이름이다. 지금의 Linux는 ATA 디스크도 sd로 시작하는 이름으로 불러, 디스크의 장치 이름은 보통 sd로 시작한다.',
    sources: [anchorConceptId],
  },
  {
    id: 'disk', label: 'a',
    nodes: ['disk'],
    notes: ['disk-note'] as NoteId[],
    caption: 'sd 뒤의 글자는 몇째 디스크인지를 가리킨다. 커널이 디스크를 알아본 차례대로 a가 첫째, b가 둘째 디스크이고, 수를 붙이지 않은 /dev/sda는 첫째 디스크 전체를 가리킨다.',
    sources: [anchorConceptId],
  },
  {
    id: 'partition', label: '5',
    nodes: ['part'],
    notes: ['part-note', 'logical-note'] as NoteId[],
    caption: '마지막 수 5는 그 디스크 안의 파티션 번호다. MBR 디스크에서 1~4는 주 파티션의 몫이고 논리 파티션은 5부터 번호를 받으므로, /dev/sda5는 첫째 디스크의 첫 논리 파티션이며 다섯째 디스크가 아니다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 112]
const wideBox: [number, number, number, number] = [0, 0, 440, 112]

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
  return readBox(diagram().querySelector('[data-group="name"]')!)
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

// 보이는 곁말이 지정한 id·글·자리이고, 테두리 안에서 노드·그룹 라벨·다른 곁말과 겹치지 않는다.
function expectNotes(ids: NoteId[], places: Record<NoteId, Note>, viewBox: [number, number, number, number]) {
  const shown = Array.from(diagram().querySelectorAll('[data-note]'))
  expect(shown.map((note) => note.getAttribute('data-note')).sort()).toEqual([...ids].sort())
  const boxes = shown.map((note) => textBox(note, note.getAttribute('data-note')!))
  const label = textBox(diagram().querySelector('[data-group-label="name"]')!, 'label')
  for (const note of shown) {
    const id = note.getAttribute('data-note')! as NoteId
    const box = textBox(note, id)
    expect(note.textContent).toBe(noteLabels[id])
    expect(note).toHaveAttribute('x', String(places[id].x))
    expect(note).toHaveAttribute('y', String(places[id].y))
    expect(note).toHaveAttribute('text-anchor', places[id].anchor)
    expect(note).toHaveAttribute('font-size', '9')
    expect(note).toHaveClass('fill-muted')
    expect(note.closest('[opacity]')).toBeNull()
    expect(boxesOutsideViewBox([box], viewBox), id).toEqual([])
    expect(contains(groupBox(), box), id).toBe(true)
    expect(overlaps(box, label), `${id} ↔ 그룹 라벨`).toBe(false)
    for (const node of nodeIds.map(nodeBox)) expect(overlaps(box, node), `${id} ↔ ${node.id}`).toBe(false)
    for (const other of boxes.filter((item) => item.id !== id)) expect(overlaps(box, other), `${id} ↔ ${other.id}`).toBe(false)
  }
}

async function expectScenario(
  scenario: typeof expectedScenarios[number],
  places: Record<NoteId, Note>,
  viewBox: [number, number, number, number],
  container: HTMLElement,
) {
  await selectScenario(scenario.label)

  for (const element of diagram().querySelectorAll('[data-node]')) {
    const id = element.getAttribute('data-node')!
    expect(element, id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  expect(diagram().querySelector('[data-group="name"]')!.closest('[opacity]')).toBeNull()
  expect(diagram().querySelector('[data-group-label="name"]')!.closest('[opacity]')).toBeNull()
  expect(diagram().querySelectorAll('[data-path], [data-link]')).toHaveLength(0)
  expectNotes(scenario.notes, places, viewBox)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 모든 rect가 viewBox 안에 있고, 라벨은 자기 상자 안에 들어가며 노드끼리 겹치지 않는다.
// 테두리는 네 덩어리를 모두 담고, 그룹 라벨은 테두리 안에서 노드와 겹치지 않는다. 노드는 모두 회색이다.
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

  const rect = diagram().querySelector('[data-group="name"]')!
  expect(rect).toHaveAttribute('x', String(group.x))
  expect(rect).toHaveAttribute('y', String(group.y))
  expect(rect).toHaveAttribute('width', String(group.width))
  expect(rect).toHaveAttribute('height', String(group.height))
  for (const id of nodeIds) expect(contains(groupBox(), nodeBox(id)), id).toBe(true)

  const labelText = diagram().querySelector('[data-group-label="name"]')!
  expect(labelText.textContent).toBe(groupLabels.name)
  expect(labelText).toHaveAttribute('x', String(group.labelX))
  expect(labelText).toHaveAttribute('y', String(group.labelY))
  expect(labelText).toHaveAttribute('font-size', '9')
  const label = textBox(labelText, 'label')
  expect(contains(groupBox(), label)).toBe(true)
  for (const id of nodeIds) expect(overlaps(label, nodeBox(id)), id).toBe(false)
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

// 요점: 네 덩어리는 한 줄에 빈틈없이 이어져 있고, 라벨을 차례로 이으면 /dev/sda5다.
// 시나리오마다 선명한 덩어리는 하나이고 네 시나리오가 서로 다른 덩어리를 가리킨다.
// 「5」의 보이는 곁말에 「논리 파티션」이, 「a」의 보이는 곁말에 「첫째」가 있다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')

  const cells = nodeIds.map(nodeBox)
  for (let i = 1; i < cells.length; i += 1) {
    expect(cells[i].y, nodeIds[i]).toBe(cells[0].y)
    expect(cells[i - 1].x + cells[i - 1].width, nodeIds[i]).toBe(cells[i].x)
  }
  expect(nodeIds.map((id) => diagram().querySelector(`[data-node="${id}"] text`)!.textContent).join('')).toBe('/dev/sda5')

  const bright: string[] = []
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    const shown = Array.from(diagram().querySelectorAll('[data-node][opacity="1"]'), (element) => element.getAttribute('data-node')!)
    expect(shown, label).toHaveLength(1)
    bright.push(shown[0])
  }
  expect(new Set(bright).size).toBe(expectedScenarios.length)

  await selectScenario('5')
  expect(Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.textContent).join(' ')).toContain('논리 파티션')
  await selectScenario('a')
  expect(Array.from(diagram().querySelectorAll('[data-note]'), (note) => note.textContent).join(' ')).toContain('첫째')

  expect(body).toContain('`/dev/sda5`는 첫째 디스크의 파티션 번호 5, 곧 그 디스크의 첫 논리 파티션이다')
  expect(body).toContain('`a`가 첫째, `b`가 둘째 디스크다')
  expect(body).toContain('다섯째 디스크가 아니라 첫째 디스크 안의 파티션이다')
  expect(body).toContain('`sd`는 SCSI 디스크를 다루는 드라이버의 이름이고')
}

describe('DiskDeviceNameDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<DiskDeviceNameDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<DiskDeviceNameDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note], [data-link]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드와 곁말만 보인다', async (scenario) => {
    const { container } = render(<DiskDeviceNameDiagram />)
    await expectScenario(scenario, tallNotes, tallBox, container)
  })

  it('시나리오를 바꾸면 이전 곁말이 사라지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<DiskDeviceNameDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual([...scenario.notes].sort())
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-note]')).toHaveLength(0)
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('네 시나리오의 선명한 노드·곁말이 서로 다르다', () => {
    const keys = expectedScenarios.map(({ nodes, notes }) => JSON.stringify([[...nodes].sort(), [...notes].sort()]))
    expect(new Set(keys).size).toBe(expectedScenarios.length)
  })

  it('노드와 테두리가 280×112 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<DiskDeviceNameDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 112')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox, tallGroup)
  })

  it('네 덩어리를 이으면 /dev/sda5이고, 시나리오마다 덩어리 하나의 뜻을 보인다', async () => {
    render(<DiskDeviceNameDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 고른 시나리오가 서로 섞이지 않는다', async () => {
    render(<><DiskDeviceNameDiagram /><DiskDeviceNameDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    await act(async () => { await userEvent.click(within(figures[0]).getByRole('button', { name: '5' })) })

    expect(within(figures[0]).getByRole('button', { name: '5' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(figures[1]).getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(figures[1].querySelectorAll('[data-note]')).toHaveLength(0)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<DiskDeviceNameDiagram />)
    const text = visualsByTopicId[topicId].diagrams['disk-device-name']
    const ids = diskDeviceNameScenarios.map(({ id }) => id).sort()
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
      const scenario = diskDeviceNameScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 디스크 장치 이름 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    async function collectIds(selector: string, attribute: string) {
      const found = new Set<string>()
      for (const { label } of expectedScenarios) {
        await selectScenario(label)
        for (const id of shownIds(selector, attribute)) found.add(id)
      }
      return [...found].sort()
    }

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×112 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<DiskDeviceNameDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 112')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·그룹 id 집합과 곁말 id 합집합이 세로형과 같다', async () => {
      const { change } = mockMatchMedia(false)
      render(<DiskDeviceNameDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 112')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroupIds = shownIds('[data-group]', 'data-group').sort()
      const tallNoteIds = await collectIds('[data-note]', 'data-note')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 112')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroupIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallGroupIds).toEqual(['name'])
      expect(tallNoteIds).toEqual(Object.keys(noteLabels).sort())
      expect(await collectIds('[data-note]', 'data-note')).toEqual(tallNoteIds)
    })

    it('노드와 테두리가 440×112 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<DiskDeviceNameDiagram />)
      expectFits(wideBox, wideGroup)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·곁말·캡션을 보인다', async (scenario) => {
      const { container } = render(<DiskDeviceNameDiagram />)
      await expectScenario(scenario, wideNotes, wideBox, container)
    })

    it('네 덩어리를 이으면 /dev/sda5이고, 시나리오마다 덩어리 하나의 뜻을 보인다', async () => {
      render(<DiskDeviceNameDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<DiskDeviceNameDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 112')
      await selectScenario('5')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '5' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownIds('[data-note]', 'data-note').sort()).toEqual(['logical-note', 'part-note'])
      expect(diagram().querySelector('[data-note="logical-note"]')).toHaveAttribute('x', String(wideNotes['logical-note'].x))
    })
  })
})
