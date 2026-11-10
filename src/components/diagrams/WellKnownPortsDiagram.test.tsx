import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { WellKnownPortsDiagram, wellKnownPortsScenarios } from './WellKnownPortsDiagram'

const topicId = 'ports'
const anchorConceptId = `${topicId}.well-known-ports`
// 본문 목록과 같은 차례의 서비스 여덟. 행마다 이름·포트 번호·전송 계층 프로토콜 칸이 있다.
const services = [
  { key: 'ftp', name: 'FTP', port: '20 · 21', transport: 'TCP' },
  { key: 'ssh', name: 'SSH', port: '22', transport: 'TCP' },
  { key: 'telnet', name: 'Telnet', port: '23', transport: 'TCP' },
  { key: 'smtp', name: 'SMTP', port: '25', transport: 'TCP' },
  { key: 'dns', name: 'DNS', port: '53', transport: 'UDP · TCP' },
  { key: 'dhcp', name: 'DHCP', port: '67 · 68', transport: 'UDP' },
  { key: 'http', name: 'HTTP', port: '80', transport: 'TCP' },
  { key: 'https', name: 'HTTPS', port: '443', transport: 'TCP' },
]
const rowNodes = (key: string) => [`${key}-name`, `${key}-port`, `${key}-transport`]
const labels: Record<string, string> = Object.fromEntries(services.flatMap(({ key, name, port, transport }) => [
  [`${key}-name`, name], [`${key}-port`, port], [`${key}-transport`, transport],
]))
const noteLabels: Record<string, string> = { 'col-name': '서비스', 'col-port': '포트 번호', 'col-transport': '전송 계층 프로토콜' }
const nodeIds = Object.keys(labels)

const question = '어떤 서비스가 몇 번 포트에서 기다릴까?'
const figureName = '널리 쓰는 서비스 여덟이 기본으로 쓰는 포트 번호와 전송 계층 프로토콜을 서비스마다 한 줄씩 놓은 표 모양의 도식'
const svgName = 'FTP 20 · 21 TCP, SSH 22 TCP, Telnet 23 TCP, SMTP 25 TCP, DNS 53 UDP · TCP, DHCP 67 · 68 UDP, HTTP 80 TCP, HTTPS 443 TCP'
const idleCaption = '널리 쓰는 서비스 여덟과, 그 서버 프로그램이 기본으로 기다리는 포트 번호, 쓰는 전송 계층 프로토콜을 한 줄씩 놓았다. 버튼을 고르면 하는 일이 비슷한 서비스끼리 묶어 볼 수 있다.'
const legend = '한 줄이 서비스 하나다. 왼쪽부터 서비스 이름, 기본 포트 번호, 전송 계층 프로토콜이고, 번호가 둘인 칸은 한 서비스가 두 번호를 쓴다는 뜻이다. 표 위의 곁말은 열 이름이다.'
const expectedScenarios = [
  {
    id: 'web', label: '웹', rows: ['http', 'https'],
    caption: '웹 페이지를 주고받는 HTTP는 TCP 80번을, 그 통신을 TLS로 보호한 HTTPS는 TCP 443번을 기본으로 쓴다. 하는 일은 같아도 서로 다른 프로토콜이라 쓰는 번호가 다르다.',
  },
  {
    id: 'remote-file', label: '원격 접속·파일', rows: ['ftp', 'ssh', 'telnet'],
    caption: '원격 접속에는 내용을 암호화하는 SSH가 TCP 22번을, 암호화하지 않는 Telnet이 TCP 23번을 쓴다. 파일을 주고받는 FTP는 명령이 오가는 제어 연결에 21번을, 파일 내용이 오가는 데이터 연결에 20번을 쓴다.',
  },
  {
    id: 'mail-name-address', label: '메일·이름·주소', rows: ['smtp', 'dns', 'dhcp'],
    caption: '메일을 보내는 SMTP는 TCP 25번을 쓰고, 이름으로 IP 주소를 찾는 DNS는 53번을 주로 UDP로, TCP로도 쓴다. IP 주소 같은 설정을 나눠 주는 DHCP는 UDP를 쓰고, 서버가 67번에서 요청을 받으며 답은 클라이언트의 68번으로 간다.',
  },
]

const svg = () => screen.getByRole('img', { name: svgName })
const select = async (label: string) => { await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) }) }

function readBox(rect: Element, id = ''): SvgBox {
  return {
    id,
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

const nodeBox = (id: string) => readBox(svg().querySelector(`[data-node="${id}"] rect`)!, id)
const label = (id: string) => svg().querySelector(`[data-node="${id}"] text`)!.textContent!
const brightNodes = () => nodeIds.filter((id) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity') === '1')
const noteElements = () => Array.from(svg().querySelectorAll('[data-note]'))

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
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

// 「20 · 21」처럼 번호가 둘인 칸에서 수를 모두 꺼낸다.
const portsOf = (id: string) => label(id).split(' · ').map(Number)

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
  return (nextMatches: boolean) => {
    mediaQuery.matches = nextMatches
    act(() => listeners.forEach((listener) => listener(Object.assign(new Event('change'), { matches: nextMatches, media: mediaQuery.media }) as MediaQueryListEvent)))
  }
}

function layoutTests(wide: boolean) {
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 164] : [0, 0, 280, 292]

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<WellKnownPortsDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 칸이 모두 선명하고 경로 없이 열 이름과 선택 안내가 나온다', () => {
    const { container } = render(<WellKnownPortsDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node], [data-note]')) expect(element).toHaveAttribute('opacity', '1')
    expect(svg().querySelectorAll('path, line, polyline')).toHaveLength(0)
    expect(new Set(noteElements().map((note) => note.textContent))).toEqual(new Set(Object.values(noteLabels)))
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 그 서비스들의 행만 선명하고 열 이름은 흐려지지 않는다', async (scenario) => {
    const { container } = render(<WellKnownPortsDiagram />)
    await select(scenario.label)
    const bright = scenario.rows.flatMap(rowNodes)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', bright.includes(id) ? '1' : '0.25')
    for (const note of noteElements()) expect(note).toHaveAttribute('opacity', '1')
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 칸이 빈틈없이 이어지며 라벨과 열 이름이 자리에 들어간다`, () => {
    render(<WellKnownPortsDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
    }
    for (let i = 0; i < nodeIds.length; i += 1) {
      for (const other of nodeIds.slice(i + 1)) expect(overlaps(nodeBox(nodeIds[i]), nodeBox(other)), `${nodeIds[i]} ↔ ${other}`).toBe(false)
    }
    // 한 행의 세 칸은 같은 높이에서 왼쪽부터 이름·번호·프로토콜 차례로 맞붙는다.
    for (const { key } of services) {
      const [name, port, transport] = rowNodes(key).map(nodeBox)
      expect(port.y, key).toBe(name.y)
      expect(transport.y, key).toBe(name.y)
      expect(name.x + name.width, key).toBe(port.x)
      expect(port.x + port.width, key).toBe(transport.x)
    }
    const notes = noteElements().map((note, index) => {
      expect(note).toHaveAttribute('font-size', '9')
      expect(note).toHaveClass('fill-muted')
      return textBox(note, `note-${index}`)
    })
    for (const box of notes) {
      expect(box.x, box.id).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width, box.id).toBeLessThanOrEqual(viewBox[2])
      expect(box.y, box.id).toBeGreaterThanOrEqual(0)
      expect(box.y + box.height, box.id).toBeLessThanOrEqual(viewBox[3])
      for (const id of nodeIds) expect(overlaps(box, nodeBox(id)), `${box.id} ↔ ${id}`).toBe(false)
    }
    for (let i = 0; i < notes.length; i += 1) {
      for (const other of notes.slice(i + 1)) expect(overlaps(notes[i], other), `${notes[i].id} ↔ ${other.id}`).toBe(false)
    }
    // 열 이름은 자기 열의 칸 바로 위 가운데에 있다.
    for (const note of noteElements()) {
      const column = note.getAttribute('data-column')!
      const cells = nodeIds.filter((id) => id.endsWith(`-${column}`)).map(nodeBox)
      const center = Number(note.getAttribute('x'))
      expect(cells.some((cell) => cell.x + cell.width / 2 === center && cell.y - Number(note.getAttribute('y')) === 8), note.textContent!).toBe(true)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  // 요점: 여덟 서비스의 기본 포트 번호는 모두 잘 알려진 포트(0~1023) 안에 있다. 세 묶음은 겹치지 않고 합하면 모든 행이며,
  // 원격 접속 묶음에서 SSH와 Telnet의 번호가 서로 다르다. 번호와 프로토콜은 개념 본문의 목록에 있다.
  it('기본 포트 번호가 모두 0~1023 안에 있고, 세 묶음이 모든 행을 겹치지 않게 나누며, SSH와 Telnet의 번호가 다르다', async () => {
    render(<WellKnownPortsDiagram />)
    for (const { key } of services) {
      for (const port of portsOf(`${key}-port`)) {
        expect(Number.isInteger(port), key).toBe(true)
        expect(port, key).toBeGreaterThanOrEqual(0)
        expect(port, key).toBeLessThanOrEqual(1023)
      }
    }
    const seen: string[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const bright = brightNodes()
      expect(bright.filter((id) => seen.includes(id)), scenario.id).toEqual([])
      seen.push(...bright)
      if (scenario.id === 'remote-file') {
        expect(bright).toContain('ssh-port')
        expect(bright).toContain('telnet-port')
        expect(label('ssh-port')).not.toBe(label('telnet-port'))
      }
    }
    expect(new Set(seen)).toEqual(new Set(nodeIds))

    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    const items = concept.paragraphs.filter((paragraph) => paragraph.startsWith('- '))
    expect(items.map((item) => item.match(/^- \*\*([^*]+)\*\*/u)![1])).toEqual(services.map(({ name }) => name))
    for (const [index, { port, transport }] of services.entries()) {
      for (const number of port.split(' · ')) expect(items[index], number).toContain(`\`${number}\``)
      for (const protocol of transport.split(' · ')) expect(items[index], protocol).toContain(protocol)
    }
  })
}

describe('WellKnownPortsDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드 id 집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<WellKnownPortsDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 292')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      await select('원격 접속·파일')
      const tallBright = brightNodes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 164')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(screen.getByRole('button', { name: '원격 접속·파일' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(brightNodes()).toEqual(tallBright)
    })
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<WellKnownPortsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['well-known-ports']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(wellKnownPortsScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    expect(text.nodes).toEqual(labels)
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.idleCaption).toBe(idleCaption)
    expect(text.legend).toBe(legend)
    expect(text.label).toBe(figureName)
    expect(text.svgLabel).toBe(svgName)
    expect(text.sources).toEqual([anchorConceptId])
    expect(screen.getByText(legend)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['전체', ...expectedScenarios.map((scenario) => scenario.label)])
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = wellKnownPortsScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.rows.flatMap(rowNodes))
      expect(scenario.paths).toEqual([])
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 잘 알려진 포트 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(within(figure).queryByRole('heading')).toBeNull()
  })
})
