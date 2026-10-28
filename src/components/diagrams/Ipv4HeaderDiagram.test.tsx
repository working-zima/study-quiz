import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { isListItem, stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { Ipv4HeaderDiagram, ipv4HeaderScenarios } from './Ipv4HeaderDiagram'

const topicId = 'ip-protocol'
const anchorConceptId = `${topicId}.ipv4-header`
const labels = {
  version: '버전',
  ihl: '헤더 길이',
  tos: '서비스 유형',
  'total-length': '전체 길이',
  identification: '식별자',
  flags: '플래그',
  'fragment-offset': '단편화 오프셋',
  ttl: 'TTL',
  protocol: '프로토콜',
  checksum: '헤더 체크섬',
  source: '출발지 IP 주소',
  destination: '목적지 IP 주소',
  options: '옵션',
  data: '데이터',
}
const nodeIds = Object.keys(labels)
const headerIds = nodeIds.filter((id) => id !== 'data')
const groupLabel = 'IPv4 헤더'
const sizeLabel = '옵션이 없으면 20바이트'

type Box = { x: number, y: number, width: number, height: number }
const tallGroup: Box = { x: 4, y: 4, width: 272, height: 220 }
const wideGroup: Box = { x: 4, y: 4, width: 432, height: 188 }
const tallSize = { x: 268, y: 18 }
const wideSize = { x: 428, y: 18 }
// 줄마다 왼쪽 끝(8)에서 오른쪽 끝(세로형 272, 가로형 432)까지 칸을 빈틈없이 이어 붙인다.
const tallRows = [
  ['version', 'ihl', 'tos', 'total-length'],
  ['identification', 'flags', 'fragment-offset'],
  ['ttl', 'protocol', 'checksum'],
  ['source'],
  ['destination'],
  ['options'],
]
const wideRows = [
  ['version', 'ihl', 'tos', 'total-length'],
  ['identification', 'flags', 'fragment-offset'],
  ['ttl', 'protocol', 'checksum'],
  ['source', 'destination'],
  ['options'],
]

const question = 'IPv4 헤더에는 어떤 칸이 있을까?'
const idleCaption = 'IPv4 패킷은 칸 여럿을 이어 붙인 헤더 뒤에 데이터가 오는 모양이다. 옵션이 없으면 헤더는 20바이트다. 버튼을 고르면 하는 일이 비슷한 칸끼리 묶어 볼 수 있다.'
const legend = '칸은 헤더 안의 순서대로 왼쪽에서 오른쪽, 위에서 아래로 이어진다. 칸의 너비는 실제 비트 수에 비례하지 않는다.'
const figureName = 'IPv4 헤더의 칸을 순서대로 보이는 도식'
const expectedScenarios = [
  {
    id: 'basic', label: '기본 정보',
    nodes: ['version', 'ihl', 'tos', 'total-length'],
    caption: '버전은 IP의 어느 판인지(IPv4면 4)를, 헤더 길이는 헤더가 얼마나 긴지를, 서비스 유형은 패킷을 어떻게 다뤄 주기를 바라는지를, 전체 길이는 헤더와 데이터를 합친 패킷의 크기를 적는다.',
    sources: [anchorConceptId],
  },
  {
    id: 'fragment', label: '단편화',
    nodes: ['identification', 'flags', 'fragment-offset'],
    caption: '패킷이 조각으로 나뉠 때 쓰는 칸 셋이다. 목적지 호스트는 식별자·플래그·단편화 오프셋을 보고 어느 조각끼리 어떤 차례로 합칠지 안다.',
    sources: [anchorConceptId, `${topicId}.fragmentation`],
  },
  {
    id: 'delivery', label: '전달',
    nodes: ['ttl', 'protocol', 'checksum'],
    caption: 'TTL은 라우터를 지날 때마다 줄어 0이 되면 패킷이 버려지고, 프로토콜은 데이터를 넘길 프로토콜의 번호(TCP 6, UDP 17, ICMP 1)다. 헤더 체크섬은 헤더만 검사하고, 헤더를 처리하는 곳마다 다시 계산한다.',
    sources: [anchorConceptId],
  },
  {
    id: 'address', label: '주소',
    nodes: ['source', 'destination'],
    caption: '출발지 IP 주소는 패킷을 처음 보낸 호스트를, 목적지 IP 주소는 패킷이 닿아야 할 호스트를 가리킨다. 라우터는 목적지 IP 주소를 보고 패킷을 넘길 쪽을 정한다.',
    sources: [anchorConceptId],
  },
]

function diagram() {
  return screen.getByRole('img', { name: 'IPv4 헤더의 칸 열세 개를 버전부터 옵션까지 순서대로 이어 붙이고, 그 뒤에 데이터가 오는 IPv4 패킷의 모습' })
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

// 모든 rect가 viewBox 안에 있고, 라벨이 자기 칸에 들어가며, 칸끼리 겹치지 않는다. 헤더 칸은 그룹 박스 안, 데이터는 밖이다.
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
  expect(overlaps(nodeBox('data'), { id: 'header', ...group }), '데이터는 헤더 밖').toBe(false)
  expect(nodeBox('data').y, '데이터는 헤더 뒤').toBeGreaterThanOrEqual(group.y + group.height)

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

// 시나리오를 고르면 그 칸만 선명하고 나머지 칸과 데이터는 흐려지며, 그룹 박스는 흐려지지 않는다.
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

// 요점: 헤더 칸을 읽는 차례대로 늘어놓은 이름이 개념 본문의 목록 항목 이름 순서와 같다.
// 데이터 칸은 어느 시나리오에서도 헤더 칸 무리에 들지 않고, 확인 응답 번호라는 칸은 없다.
async function expectPoint() {
  const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
  const bodyNames = concept.paragraphs.filter(isListItem).flatMap((paragraph) => Array.from(paragraph.matchAll(/\*\*(.+?)\*\*/gu), (match) => match[1]))
  expect(readingOrder().map((id) => labels[id as keyof typeof labels])).toEqual(bodyNames)
  expect(Array.from(diagram().querySelectorAll('[data-node] text'), (text) => text.textContent).join(' ')).not.toContain('확인 응답')

  const seen = new Set<string>()
  for (const scenario of expectedScenarios) {
    await selectScenario(scenario.label)
    const bright = brightNodes()
    expect(bright).not.toContain('data')
    for (const id of bright) expect(headerIds, id).toContain(id)
    for (const id of bright) {
      expect(seen.has(id), `${id}는 한 시나리오에만`).toBe(false)
      seen.add(id)
    }
  }
  expect([...seen].sort()).toEqual(headerIds.filter((id) => id !== 'options').sort())

  const body = concept.paragraphs.join('\n')
  expect(body).toContain('이름대로 헤더만 검사하고, 뒤의 데이터가 망가졌는지는 보지 않는다')
  expect(body).toContain('TCP는 6, UDP는 17, ICMP는 1이다')
  expect(body).toContain('옵션이 없는 헤더는 20바이트')
  expect(body).toContain('확인 응답 번호(Acknowledgment Number)는 IPv4 헤더가 아니라 TCP 헤더의 칸이다')
}

describe('Ipv4HeaderDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<Ipv4HeaderDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 칸이 모두 선명하고 선이 없으며 선택 안내가 나온다', () => {
    const { container } = render(<Ipv4HeaderDiagram />)

    expect(Array.from(diagram().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('path, marker')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 칸만 선명하다', async (scenario) => {
    const { container } = render(<Ipv4HeaderDiagram />)
    await expectScenario(scenario, container)
  })

  it('시나리오를 바꾸고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<Ipv4HeaderDiagram />)
    for (const scenario of [...expectedScenarios, expectedScenarios[0]]) {
      await selectScenario(scenario.label)
      expect(brightNodes()).toEqual(nodeIds.filter((id) => scenario.nodes.includes(id)))
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('칸이 280×276 viewBox 안에 빈틈없이 이어지고 모바일 너비 보정을 유지한다', () => {
    render(<Ipv4HeaderDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 276')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectFits([0, 0, 280, 276], tallGroup, tallRows, tallSize)
  })

  it('칸은 모두 회색이고 도식 전용 두 색·초록·빨강·주황은 쓰지 않는다', () => {
    render(<Ipv4HeaderDiagram />)
    for (const id of nodeIds) expect(diagram().querySelector(`[data-node="${id}"] rect`), id).toHaveClass('stroke-disabled')
    expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('칸 이름이 본문의 칸 순서와 같고, 데이터는 헤더 칸 무리에 들지 않으며, 확인 응답 번호 칸은 없다', async () => {
    render(<Ipv4HeaderDiagram />)
    await expectPoint()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<Ipv4HeaderDiagram />)
    const text = visualsByTopicId[topicId].diagrams['ipv4-header']
    const ids = ipv4HeaderScenarios.map(({ id }) => id).sort()
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)

    expect(ids).toEqual(expectedScenarios.map(({ id }) => id).sort())
    expect(ids).toEqual(text.scenarios.map(({ id }) => id).sort())
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
      const scenario = ipv4HeaderScenarios.find(({ id }) => id === expected.id)!
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

  it.each([2, 4] as const)('공유 본문 h%i에서 IPv4 헤더 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×244 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<Ipv4HeaderDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 244')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·그룹 id 집합이 세로형과 같다', () => {
      const { change } = mockMatchMedia(false)
      render(<Ipv4HeaderDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 276')
      const tallNodes = Array.from(diagram().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node')).sort()
      const tallGroups = Array.from(diagram().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group')).sort()

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 244')
      expect(Array.from(diagram().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node')).sort()).toEqual(tallNodes)
      expect(Array.from(diagram().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group')).sort()).toEqual(tallGroups)
      expect(tallNodes).toEqual([...nodeIds].sort())
    })

    it('칸이 440×244 viewBox 안에 빈틈없이 이어지고 라벨이 자기 칸에 들어간다', () => {
      render(<Ipv4HeaderDiagram />)
      expectFits([0, 0, 440, 244], wideGroup, wideRows, wideSize)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 칸과 캡션을 보인다', async (scenario) => {
      const { container } = render(<Ipv4HeaderDiagram />)
      await expectScenario(scenario, container)
    })

    it('칸 이름이 본문의 칸 순서와 같고, 데이터는 헤더 칸 무리에 들지 않으며, 확인 응답 번호 칸은 없다', async () => {
      render(<Ipv4HeaderDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<Ipv4HeaderDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 276')
      await selectScenario('전달')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '전달' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(brightNodes()).toEqual(['ttl', 'protocol', 'checksum'])
    })
  })
})
