import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { isListItem, stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { Ipv6HeaderDiagram, ipv6HeaderScenarios } from './Ipv6HeaderDiagram'

const topicId = 'ip-protocol'
const anchorConceptId = `${topicId}.ipv6-header`
const labels = {
  version: '버전',
  'traffic-class': '트래픽 클래스',
  'flow-label': '흐름 레이블',
  'payload-length': '페이로드 길이',
  'next-header': '다음 헤더',
  'hop-limit': '홉 제한',
  source: '출발지 주소',
  destination: '목적지 주소',
  payload: '페이로드',
}
const nodeIds = Object.keys(labels)
const headerIds = nodeIds.filter((id) => id !== 'payload')
const groupLabel = 'IPv6 기본 헤더'
const sizeLabel = '늘 40바이트'

type Box = { x: number, y: number, width: number, height: number }
const tallGroup: Box = { x: 4, y: 4, width: 272, height: 156 }
const wideGroup: Box = { x: 4, y: 4, width: 432, height: 124 }
const tallSize = { x: 268, y: 18 }
const wideSize = { x: 428, y: 18 }
// 줄마다 왼쪽 끝(8)에서 오른쪽 끝(세로형 272, 가로형 432)까지 칸을 빈틈없이 이어 붙인다.
const tallRows = [
  ['version', 'traffic-class', 'flow-label'],
  ['payload-length', 'next-header', 'hop-limit'],
  ['source'],
  ['destination'],
]
const wideRows = [
  ['version', 'traffic-class', 'flow-label'],
  ['payload-length', 'next-header', 'hop-limit'],
  ['source', 'destination'],
]

const question = 'IPv6 기본 헤더에는 어떤 칸이 있을까?'
const idleCaption = 'IPv6 패킷은 칸 여덟을 이어 붙인 40바이트 기본 헤더 뒤에 페이로드가 오는 모양이다. 헤더 체크섬 칸과 단편화 칸은 없다. 버튼을 고르면 칸이 하는 일을 따로 볼 수 있다.'
const legend = '칸은 헤더 안의 순서대로 왼쪽에서 오른쪽, 위에서 아래로 이어진다. 칸의 너비는 실제 비트 수에 비례하지 않는다.'
const figureName = 'IPv6 기본 헤더의 칸을 순서대로 보이는 도식'
const svgName = 'IPv6 기본 헤더의 칸 여덟을 버전부터 목적지 주소까지 순서대로 이어 붙이고, 그 뒤에 페이로드가 오는 IPv6 패킷의 모습'
const expectedScenarios = [
  {
    id: 'hop-limit', label: '홉 제한',
    nodes: ['hop-limit'],
    caption: '홉 제한은 패킷을 다음으로 넘겨주는 라우터마다 1씩 줄고, 0이 되면 그 패킷이 버려진다. IPv4 헤더의 TTL 칸과 같은 일을 하는 칸이다.',
    sources: [anchorConceptId, `${topicId}.ttl`],
  },
  {
    id: 'next-header', label: '다음 헤더',
    nodes: ['next-header', 'payload'],
    caption: '다음 헤더는 기본 헤더 바로 뒤에 오는 헤더가 무엇인지 번호로 적는다. IPv4 헤더의 프로토콜 칸과 같은 번호를 써서, 바로 뒤에 TCP 헤더가 오면 6이 들어간다.',
    sources: [anchorConceptId],
  },
  {
    id: 'addresses', label: '주소',
    nodes: ['source', 'destination'],
    caption: '출발지 주소와 목적지 주소는 각각 128비트라, 둘을 합치면 32바이트로 40바이트 기본 헤더의 대부분을 차지한다.',
    sources: [anchorConceptId],
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
    id: rect.parentElement?.getAttribute('data-node') ?? rect.getAttribute('data-group') ?? '',
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

function nodeBox(id: string) {
  return readBox(diagram().querySelector(`[data-node="${id}"] rect`)!)
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function inside(inner: Box, outer: Box) {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height
}

// 글자 크기 9인 글자가 차지하는 상자. 반각 글자가 화면에서 더 넓게 그려지는 것을 생각해 폭을 1.15배로 잡는다.
function textBox(text: Element, id: string): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9) * 1.15
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id, x: left, y: y - 9, width, height: 9 }
}

function brightNodes() {
  return nodeIds.filter((id) => diagram().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
}

// 칸을 읽는 차례(위에서 아래, 같은 줄에서는 왼쪽에서 오른쪽)로 늘어놓은 헤더 칸 id.
function readingOrder() {
  return [...headerIds].sort((a, b) => nodeBox(a).y - nodeBox(b).y || nodeBox(a).x - nodeBox(b).x)
}

// 모든 rect가 viewBox 안에 있고, 라벨이 자기 칸에 들어가며, 칸끼리 겹치지 않는다. 헤더 칸은 그룹 박스 안, 페이로드는 밖이다.
function expectFits(viewBox: [number, number, number, number], group: Box, rows: string[][], size: { x: number, y: number }) {
  const boxes = Array.from(diagram().querySelectorAll('[data-node] rect'), readBox)
  expect(boxes).toHaveLength(nodeIds.length)
  expect(boxesOutsideViewBox([...boxes, readBox(diagram().querySelector('[data-group="header"]')!)], viewBox)).toEqual([])
  expect(diagram().querySelectorAll('rect')).toHaveLength(nodeIds.length + 1)

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = readBox(node.querySelector('rect')!)
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(box.height).toBe(32)
    expect(estimateTextWidth(label, 10) + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
  }
  for (let i = 0; i < nodeIds.length; i += 1) {
    for (let j = i + 1; j < nodeIds.length; j += 1) {
      expect(overlaps(nodeBox(nodeIds[i]), nodeBox(nodeIds[j])), `${nodeIds[i]} ↔ ${nodeIds[j]}`).toBe(false)
    }
  }

  const groupRect = diagram().querySelector('[data-group="header"]')!
  expect(readBox(groupRect)).toMatchObject(group)
  for (const id of headerIds) expect(inside(nodeBox(id), group), `${id}는 헤더 안`).toBe(true)
  expect(overlaps(nodeBox('payload'), { id: 'header', ...group }), '페이로드는 헤더 밖').toBe(false)
  expect(nodeBox('payload').y, '페이로드는 헤더 뒤').toBeGreaterThanOrEqual(group.y + group.height)

  // 줄마다 칸이 빈틈없이 이어지고, 줄은 32씩 아래로 붙는다.
  const right = viewBox[2] - 8
  rows.forEach((row, index) => {
    const y = nodeBox(rows[0][0]).y + index * 32
    expect(nodeBox(row[0]).x, row[0]).toBe(8)
    expect(nodeBox(row[row.length - 1]).x + nodeBox(row[row.length - 1]).width, row[row.length - 1]).toBe(right)
    for (let i = 0; i < row.length; i += 1) {
      expect(nodeBox(row[i]).y, row[i]).toBe(y)
      if (i > 0) expect(nodeBox(row[i]).x, row[i]).toBe(nodeBox(row[i - 1]).x + nodeBox(row[i - 1]).width)
    }
  })
  expect(rows.flat()).toEqual(headerIds)

  // 그룹 라벨과 크기 곁말은 그룹 박스 안 위쪽에 있고, 칸·서로와 겹치지 않는다.
  const labelText = diagram().querySelector('[data-group-label="header"]')!
  expect(labelText.textContent).toBe(groupLabel)
  expect(labelText).toHaveAttribute('font-size', '9')
  const sizeText = diagram().querySelector('[data-note="size"]')!
  expect(sizeText.textContent).toBe(sizeLabel)
  expect(sizeText).toHaveAttribute('x', String(size.x))
  expect(sizeText).toHaveAttribute('y', String(size.y))
  expect(sizeText).toHaveAttribute('text-anchor', 'end')
  expect(sizeText).toHaveAttribute('font-size', '9')
  expect(sizeText).toHaveClass('fill-muted')
  const texts = [textBox(labelText, 'label'), textBox(sizeText, 'size')]
  for (const box of texts) {
    expect(inside(box, group), box.id).toBe(true)
    for (const id of nodeIds) expect(overlaps(box, nodeBox(id)), `${box.id} ↔ ${id}`).toBe(false)
  }
  expect(overlaps(texts[0], texts[1])).toBe(false)
}

// 시나리오를 고르면 그 칸만 선명하고 나머지는 흐려지며, 그룹 박스와 크기 곁말은 흐려지지 않는다.
async function expectScenario(scenario: typeof expectedScenarios[number], container: HTMLElement) {
  await selectScenario(scenario.label)
  for (const id of nodeIds) {
    expect(diagram().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  expect(diagram().querySelector('[data-group="header"]')!.closest('[opacity]')).toBeNull()
  expect(diagram().querySelector('[data-note="size"]')!.closest('[opacity]')).toBeNull()
  expect(diagram().querySelectorAll('path')).toHaveLength(0)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 요점: 헤더 칸을 읽는 차례대로 늘어놓은 이름이 개념 본문의 목록 항목 이름 여덟과 같다.
// 헤더 체크섬·식별자·플래그·단편화 오프셋·헤더 길이 칸은 없고, 페이로드는 헤더 칸 무리에 들지 않는다.
async function expectPoint() {
  const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
  const bodyNames = concept.paragraphs.filter(isListItem).flatMap((paragraph) => Array.from(paragraph.matchAll(/\*\*(.+?)\*\*/gu), (match) => match[1]))
  expect(bodyNames).toHaveLength(8)
  expect(readingOrder().map((id) => labels[id as keyof typeof labels])).toEqual(bodyNames)
  const nodeText = Array.from(diagram().querySelectorAll('[data-node] text'), (text) => text.textContent).join(' ')
  for (const missing of ['체크섬', '식별자', '플래그', '오프셋', '헤더 길이', 'TTL']) expect(nodeText, missing).not.toContain(missing)

  const seen = new Set<string>()
  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    const bright = brightNodes()
    for (const id of bright.filter((id) => id !== 'payload')) {
      expect(seen.has(id), `${id}는 한 시나리오에만`).toBe(false)
      seen.add(id)
    }
  }
  expect(seen).toEqual(new Set(['hop-limit', 'next-header', 'source', 'destination']))

  // 다음 헤더 시나리오만 페이로드를 밝힌다 — 다음 헤더 칸은 기본 헤더 바로 뒤에 무엇이 오는지 가리킨다.
  await selectScenario('다음 헤더')
  expect(brightNodes()).toContain('payload')
  await selectScenario('홉 제한')
  expect(brightNodes()).not.toContain('payload')

  const body = concept.paragraphs.join('\n')
  expect(body).toContain('크기가 늘 40바이트로 같다')
  expect(body).toContain('4 + 8 + 20 + 16 + 8 + 8 + 128 + 128 = 320비트, 곧 40바이트다')
  expect(body).toContain('IPv4 헤더의 TTL 칸과 같은 일을 한다')
  expect(body).toContain('IPv4 헤더의 프로토콜 칸과 같은 번호를 써서, 바로 뒤에 TCP 헤더가 오면 6이')
  expect(body).toContain('먼저 헤더 체크섬 칸이 없다')
  expect(body).toContain('식별자·플래그·단편화 오프셋 같은 단편화 칸 셋도 없다')
  expect(body).toContain('128비트짜리 주소 둘이 합쳐 32바이트로 기본 헤더의 대부분을 차지한다')
  expect(body).toContain('기본 헤더 뒤에 오는 나머지 전부를 페이로드(payload)라 한다')
}

describe('Ipv6HeaderDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<Ipv6HeaderDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 칸이 모두 선명하고 선이 없으며 선택 안내가 나온다', () => {
    const { container } = render(<Ipv6HeaderDiagram />)

    expect(Array.from(diagram().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('path, marker')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 칸만 선명하다', async (scenario) => {
    const { container } = render(<Ipv6HeaderDiagram />)
    await expectScenario(scenario, container)
  })

  it('시나리오를 바꾸고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<Ipv6HeaderDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(brightNodes()).toEqual(nodeIds.filter((id) => scenario.nodes.includes(id)))
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('칸이 280×212 viewBox 안에 빈틈없이 이어지고 모바일 너비 보정을 유지한다', () => {
    render(<Ipv6HeaderDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 212')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 212], tallGroup, tallRows, tallSize)
  })

  it('칸은 모두 회색이고 도식 전용 두 색·초록·빨강·주황은 쓰지 않는다', () => {
    render(<Ipv6HeaderDiagram />)
    for (const id of nodeIds) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
    expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('칸 이름이 본문의 여덟 칸 순서와 같고, 헤더 체크섬·단편화 칸은 없다', async () => {
    render(<Ipv6HeaderDiagram />)
    await expectPoint()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<Ipv6HeaderDiagram />)
    const text = visualsByTopicId[topicId].diagrams['ipv6-header']
    const ids = ipv6HeaderScenarios.map(({ id }) => id)
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id))
    expect(text.scenarios.map(({ id }) => id)).toEqual(ids)
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual({ header: groupLabel })
    expect(text.notes).toEqual({ size: sizeLabel })
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.sources).toEqual([anchorConceptId])
    expect(text.label).toBe(figureName)
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map(({ label }) => label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = ipv6HeaderScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 IPv6 기본 헤더 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    beforeEach(() => {
      mockMatchMedia(true)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×180 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<Ipv6HeaderDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 180')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·그룹 id 집합이 세로형과 같다', () => {
      const { change } = mockMatchMedia(false)
      render(<Ipv6HeaderDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 212')
      const tallNodes = Array.from(diagram().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node')).sort()
      const tallGroups = Array.from(diagram().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group')).sort()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 180')
      expect(Array.from(diagram().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node')).sort()).toEqual(tallNodes)
      expect(Array.from(diagram().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group')).sort()).toEqual(tallGroups)
      expect(tallNodes).toEqual([...nodeIds].sort())
    })

    it('칸이 440×180 viewBox 안에 빈틈없이 이어지고 라벨이 자기 칸에 들어간다', () => {
      render(<Ipv6HeaderDiagram />)
      expectFits([0, 0, 440, 180], wideGroup, wideRows, wideSize)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 칸과 캡션을 보인다', async (scenario) => {
      const { container } = render(<Ipv6HeaderDiagram />)
      await expectScenario(scenario, container)
    })

    it('가로형에서도 칸 이름이 본문의 여덟 칸 순서와 같고, 헤더 체크섬·단편화 칸은 없다', async () => {
      render(<Ipv6HeaderDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<Ipv6HeaderDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 212')
      await selectScenario('다음 헤더')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '다음 헤더' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(brightNodes()).toEqual(['next-header', 'payload'])
    })
  })
})
