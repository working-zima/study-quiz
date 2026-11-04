import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { FstabFieldsDiagram, fstabFieldsScenarios } from './FstabFieldsDiagram'

const topicId = 'linux-filesystem'
const anchorConceptId = `${topicId}.fstab`
const labels = {
  'spec-name': '장치',
  spec: '/dev/sdb1',
  'file-name': '마운트 지점',
  file: '/data',
  'type-name': '파일 시스템 형식',
  type: 'ext4',
  'opts-name': '마운트 옵션',
  opts: 'defaults',
  'freq-name': 'dump 백업 표시',
  freq: '0',
  'pass-name': 'fsck 점검 차례',
  pass: '2',
}
const groupLabels = { line: '/etc/fstab의 한 줄' }

const nodeIds = Object.keys(labels)
// 값 칸은 왼쪽 칸부터 차례대로다. 이름 칸은 값 칸의 id 뒤에 -name을 붙인다.
const valueIds = ['spec', 'file', 'type', 'opts', 'freq', 'pass']

type Group = { x: number, y: number, width: number, height: number, labelX: number, labelY: number }
const tallGroup: Group = { x: 8, y: 8, width: 264, height: 222, labelX: 16, labelY: 22 }
const wideGroup: Group = { x: 8, y: 8, width: 424, height: 126, labelX: 16, labelY: 22 }

const question = '/etc/fstab의 한 줄은 무엇을 말할까?'
const idleCaption = '예로 든 줄 /dev/sdb1 /data ext4 defaults 0 2를 칸 여섯으로 끊어, 칸마다 이름과 값을 나란히 놓았다. 버튼을 고르면 칸들이 무엇을 정하는지 볼 수 있다.'
const legend = '칸 이름과 그 값을 나란히 놓았고, 값을 왼쪽 칸부터 공백으로 이으면 /etc/fstab의 한 줄이 된다.'
const figureName = '/etc/fstab의 예 한 줄 /dev/sdb1 /data ext4 defaults 0 2를 칸 여섯으로 끊어, 칸마다 이름과 값을 나란히 보이는 도식'
const svgName = '/etc/fstab의 한 줄 테두리 안에 장치 /dev/sdb1, 마운트 지점 /data, 파일 시스템 형식 ext4, 마운트 옵션 defaults, dump 백업 표시 0, fsck 점검 차례 2가 칸 이름과 값의 짝으로 차례로 놓여 있다'
const expectedScenarios = [
  {
    id: 'what-where', label: '무엇을 어디에',
    nodes: ['spec-name', 'spec', 'file-name', 'file'],
    caption: '첫째 칸은 붙일 장치 /dev/sdb1이고, 둘째 칸은 그 장치의 파일 시스템을 붙일 마운트 지점 /data다. 이 두 칸이 어느 장치를 디렉터리 나무의 어디에 붙일지를 정한다.',
    sources: [anchorConceptId],
  },
  {
    id: 'how', label: '어떻게',
    nodes: ['type-name', 'type', 'opts-name', 'opts'],
    caption: '셋째 칸은 파일 시스템의 형식 ext4이고, 넷째 칸은 붙일 때 적용할 마운트 옵션이다. defaults는 기본 옵션으로 붙이라는 뜻이고, 무엇이 기본인지는 커널과 파일 시스템 형식에 따라 다르다.',
    sources: [anchorConceptId],
  },
  {
    id: 'check', label: '백업과 점검',
    nodes: ['freq-name', 'freq', 'pass-name', 'pass'],
    caption: '다섯째 칸은 dump라는 백업 프로그램이 보는 표시로, 0이면 백업하지 않는다. 여섯째 칸은 부팅할 때 fsck가 점검하는 차례로, 루트 디렉터리의 파일 시스템은 1, 다른 것은 2이고 0이면 점검하지 않는다.',
    sources: [anchorConceptId],
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 238]
const wideBox: [number, number, number, number] = [0, 0, 440, 142]

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
// 테두리는 열두 칸을 모두 담고, 그룹 라벨은 테두리 안에서 노드와 겹치지 않는다. 노드는 모두 회색이다.
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

// 요점: 값 칸 여섯의 라벨을 차례로 공백으로 이으면 본문의 예 한 줄이다. 칸마다 이름 칸 바로 오른쪽에 값 칸이 맞닿는다.
// 「무엇을 어디에」의 선명한 값은 정확히 /dev/sdb1과 /data다. 세 시나리오의 선명한 칸을 합하면 열두 칸이 한 번씩 나온다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const line = valueIds.map((id) => diagram().querySelector(`[data-node="${id}"] text`)!.textContent).join(' ')

  expect(line).toBe('/dev/sdb1 /data ext4 defaults 0 2')
  expect(body).toContain(`\`${line}\` 한 줄을 더한다`)
  for (const id of valueIds) {
    const name = nodeBox(`${id}-name`)
    const value = nodeBox(id)
    expect(value.y, id).toBe(name.y)
    expect(name.x + name.width, id).toBe(value.x)
  }

  const counts = new Map<string, number>()
  for (const { label } of expectedScenarios) {
    await selectScenario(label)
    const shown = Array.from(diagram().querySelectorAll('[data-node][opacity="1"]'), (element) => element.getAttribute('data-node')!)
    for (const id of shown) counts.set(id, (counts.get(id) ?? 0) + 1)
    if (label === '무엇을 어디에') {
      const values = shown.filter((id) => valueIds.includes(id)).map((id) => diagram().querySelector(`[data-node="${id}"] text`)!.textContent)
      expect(values.sort()).toEqual(['/data', '/dev/sdb1'])
    }
  }
  expect([...counts.keys()].sort()).toEqual([...nodeIds].sort())
  expect([...counts.values()].every((count) => count === 1)).toBe(true)

  expect(body).toContain('첫째 칸 `/dev/sdb1`은 붙일 장치, 둘째 칸 `/data`는 그 장치의 파일 시스템을 붙일 마운트 지점이다')
  expect(body).toContain('`defaults`는 기본 옵션으로 붙이라는 뜻이고')
  expect(body).toContain('다섯째 칸은 dump라는 백업 프로그램이')
  expect(body).toContain('여섯째 칸은 부팅할 때 앞에서 본 `fsck`가 파일 시스템을 점검하는 차례다')
}

describe('FstabFieldsDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<FstabFieldsDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 선·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<FstabFieldsDiagram />)

    expect(shownIds('[data-node]', 'data-node')).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('[data-path], [data-note], [data-link]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 칸만 선명하다', async (scenario) => {
    const { container } = render(<FstabFieldsDiagram />)
    await expectScenario(scenario, container)
  })

  it('시나리오를 바꾸면 이전 칸이 흐려지고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<FstabFieldsDiagram />)
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

  it('노드와 테두리가 280×238 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<FstabFieldsDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 238')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits(tallBox, tallGroup)
  })

  it('값 여섯을 이으면 본문의 예 한 줄이고, 세 시나리오가 열두 칸을 한 번씩 나눠 맡는다', async () => {
    render(<FstabFieldsDiagram />)
    await expectPoint()
  })

  it('두 번 렌더해도 고른 시나리오가 서로 섞이지 않는다', async () => {
    render(<><FstabFieldsDiagram /><FstabFieldsDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    await act(async () => { await userEvent.click(within(figures[0]).getByRole('button', { name: '어떻게' })) })

    expect(within(figures[0]).getByRole('button', { name: '어떻게' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(figures[1]).getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    for (const element of figures[1].querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<FstabFieldsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['fstab-fields']
    const ids = fstabFieldsScenarios.map(({ id }) => id).sort()
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
      const scenario = fstabFieldsScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 /etc/fstab 파일 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×142 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<FstabFieldsDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 142')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·그룹 id 집합이 세로형과 같다', () => {
      const { change } = mockMatchMedia(false)
      render(<FstabFieldsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 238')
      const tallNodes = shownIds('[data-node]', 'data-node').sort()
      const tallGroupIds = shownIds('[data-group]', 'data-group').sort()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 142')
      expect(shownIds('[data-node]', 'data-node').sort()).toEqual(tallNodes)
      expect(shownIds('[data-group]', 'data-group').sort()).toEqual(tallGroupIds)
      expect(tallNodes).toEqual([...nodeIds].sort())
      expect(tallGroupIds).toEqual(['line'])
    })

    it('노드와 테두리가 440×142 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<FstabFieldsDiagram />)
      expectFits(wideBox, wideGroup)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 칸·캡션을 보인다', async (scenario) => {
      const { container } = render(<FstabFieldsDiagram />)
      await expectScenario(scenario, container)
    })

    it('값 여섯을 이으면 본문의 예 한 줄이고, 세 시나리오가 열두 칸을 한 번씩 나눠 맡는다', async () => {
      render(<FstabFieldsDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<FstabFieldsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 238')
      await selectScenario('백업과 점검')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '백업과 점검' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownIds('[data-node][opacity="1"]', 'data-node').sort()).toEqual(['freq', 'freq-name', 'pass', 'pass-name'])
      expect(diagram().querySelector('[data-node="pass"] rect')).toHaveAttribute('x', '336')
    })
  })
})
