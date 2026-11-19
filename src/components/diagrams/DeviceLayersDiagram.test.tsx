import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { DeviceLayersDiagram, deviceLayersScenarios } from './DeviceLayersDiagram'

const topicId = 'network-devices'
const anchorConceptId = `${topicId}.device-layers`
const labels: Record<string, string> = {
  'application': '응용 계층',
  'transport': '전송 계층',
  'network': '네트워크 계층',
  'datalink': '데이터 링크 계층',
  'physical': '물리 계층',
  'load-balancer': '부하 분산 장치',
  'router': '라우터',
  'bridge-switch': '브리지와 스위치',
  'repeater-hub': '리피터와 허브',
  'gateway': '게이트웨이',
}
const noteLabels: Record<string, string> = {
  'physical-note': '주소를 읽지 않는다',
  'datalink-note': 'MAC 주소를 읽는다',
  'network-note': 'IP 주소를 읽는다',
  'upper-note': '포트 번호나 URL을 읽는다',
  'gateway-note': '한 계층에 묶이지 않는다',
}
const nodeIds = Object.keys(labels)
const scenarioNoteIds = ['physical-note', 'datalink-note', 'network-note', 'upper-note']
// 계층 칸은 아래에서 위로 이 차례다.
const layerIds = ['physical', 'datalink', 'network', 'transport', 'application']
const deviceIds = ['load-balancer', 'router', 'bridge-switch', 'repeater-hub', 'gateway']
// 화살표는 장비의 변에서 나가 그 장비가 읽는 계층 칸의 변에서 끝난다.
const pathEnds: Record<string, [string, string]> = {
  'repeater-physical': ['repeater-hub', 'physical'],
  'switch-datalink': ['bridge-switch', 'datalink'],
  'router-network': ['router', 'network'],
  'lb-application': ['load-balancer', 'application'],
  'lb-transport': ['load-balancer', 'transport'],
}
const tallPaths: Record<string, string> = {
  'repeater-physical': 'M160 192 H120',
  'switch-datalink': 'M160 152 H120',
  'router-network': 'M160 112 H120',
  'lb-application': 'M160 32 H120',
  'lb-transport': 'M168 48 V72 H120',
}
const widePaths: Record<string, string> = {
  'repeater-physical': 'M184 192 H136',
  'switch-datalink': 'M184 152 H136',
  'router-network': 'M184 112 H136',
  'lb-application': 'M184 32 H136',
  'lb-transport': 'M192 48 V72 H136',
}

const question = '네트워크 장비는 받은 데이터를 어디까지 읽을까?'
const figureName = '리피터와 허브, 브리지와 스위치, 라우터, 부하 분산 장치가 받은 데이터를 어느 계층까지 풀어 보는지 계층 칸과 화살표로 보이고, 한 계층에 묶이지 않는 게이트웨이를 따로 두는 도식'
const svgName = '왼쪽에 물리 계층부터 응용 계층까지 다섯 칸을 아래에서 위로 쌓고, 오른쪽에 장비 다섯을 둔 그림'
const idleCaption = '왼쪽은 OSI 모델의 계층 가운데 다섯 칸을 아래에서 위로 쌓은 것이고, 오른쪽은 네트워크 장비들이다. 버튼을 고르면 그 장비가 받은 데이터를 어느 계층까지 풀어 보는지 볼 수 있다.'
const legend = '화살표는 장비가 읽는 가장 높은 계층을 가리키고, 선명한 칸은 그 장비가 받은 데이터를 풀어 보는 계층이다. 세션 계층과 표현 계층은 이 그림에서 뺐다.'
const expectedScenarios = [
  {
    id: 'physical', label: '리피터와 허브',
    nodes: ['repeater-hub', 'physical'],
    paths: ['repeater-physical'],
    notes: ['physical-note'],
    caption: '리피터와 허브는 케이블로 들어온 신호를 받아 다시 만들어 내보낼 뿐, 신호에 실린 프레임을 읽지 않는다. 그래서 MAC 주소도 IP 주소도 보지 않고 물리 계층에서 신호만 다룬다.',
  },
  {
    id: 'datalink', label: '브리지와 스위치',
    nodes: ['bridge-switch', 'physical', 'datalink'],
    paths: ['switch-datalink'],
    notes: ['datalink-note'],
    caption: '브리지와 스위치는 신호에 실린 프레임을 받아 그 헤더에 적힌 목적지 MAC 주소를 읽고, 그 주소의 장치가 이어진 포트를 골라 프레임을 내보낸다.',
  },
  {
    id: 'network', label: '라우터',
    nodes: ['router', 'physical', 'datalink', 'network'],
    paths: ['router-network'],
    notes: ['network-note'],
    caption: '라우터는 받은 프레임의 헤더를 떼어 안의 패킷을 꺼내고, 패킷의 목적지 IP 주소로 다음에 넘길 곳을 고른다. 내보낼 때는 그 패킷을 새 프레임에 담는다.',
  },
  {
    id: 'upper', label: '부하 분산 장치',
    nodes: ['load-balancer', 'physical', 'datalink', 'network', 'transport', 'application'],
    paths: ['lb-application', 'lb-transport'],
    notes: ['upper-note'],
    caption: '부하 분산 장치는 패킷 안까지 풀어, 목적지 포트 번호나 HTTP 요청의 URL을 보고 같은 일을 하는 서버 여러 대 가운데 한 대를 고른다. 라우터가 넘길 곳을 정할 때 쓰지 않는 정보다.',
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
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note')!)
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)!
const gatewayNote = () => svg().querySelector('[data-static-note="gateway-note"]')!
const opacity = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

// 곁말(9)의 가로 범위. 반각 문자가 섞이므로 어림값의 1.15배로 잡는다.
function textBox(text: Element, id: string): SvgBox {
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const width = estimateTextWidth(text.textContent!, 9) * 1.15
  const anchor = text.getAttribute('text-anchor')
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
  return { id, x: left, y: y - 9, width, height: 9 }
}

type Segment = { x1: number, y1: number, x2: number, y2: number }

function segments(d: string) {
  const result: Segment[] = []
  let x = 0
  let y = 0
  for (const [, command, first, second] of d.matchAll(/([MHV])(-?\d+)(?: (-?\d+))?/gu)) {
    if (command === 'M') { x = Number(first); y = Number(second); continue }
    const next = command === 'H' ? { x: Number(first), y } : { x, y: Number(first) }
    result.push({ x1: x, y1: y, x2: next.x, y2: next.y })
    x = next.x
    y = next.y
  }
  return result
}

function crossesInside(segment: Segment, box: SvgBox) {
  const left = Math.min(segment.x1, segment.x2)
  const right = Math.max(segment.x1, segment.x2)
  const top = Math.min(segment.y1, segment.y2)
  const bottom = Math.max(segment.y1, segment.y2)
  if (top === bottom) return top > box.y && top < box.y + box.height && Math.min(right, box.x + box.width) > Math.max(left, box.x)
  return left > box.x && left < box.x + box.width && Math.min(bottom, box.y + box.height) > Math.max(top, box.y)
}

function touches(segment: Segment, box: SvgBox) {
  const left = Math.min(segment.x1, segment.x2)
  const right = Math.max(segment.x1, segment.x2)
  const top = Math.min(segment.y1, segment.y2)
  const bottom = Math.max(segment.y1, segment.y2)
  return left <= box.x + box.width && right >= box.x && top <= box.y + box.height && bottom >= box.y
}

function lineEnds(d: string) {
  const list = segments(d)
  return { start: { x: list[0].x1, y: list[0].y1 }, end: { x: list[list.length - 1].x2, y: list[list.length - 1].y2 } }
}

// 점이 상자의 네 변 가운데 하나 위에 있는가.
function onEdge(point: { x: number, y: number }, box: SvgBox) {
  const withinX = point.x >= box.x && point.x <= box.x + box.width
  const withinY = point.y >= box.y && point.y <= box.y + box.height
  return ((point.x === box.x || point.x === box.x + box.width) && withinY) || ((point.y === box.y || point.y === box.y + box.height) && withinX)
}

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 264] : [0, 0, 280, 296]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<DeviceLayersDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표와 시나리오 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<DeviceLayersDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    // 게이트웨이의 곁말은 늘 보이고 게이트웨이와 함께 선명하다.
    expect(gatewayNote().textContent).toBe(noteLabels['gateway-note'])
    expect(gatewayNote()).toHaveAttribute('opacity', '1')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보인다', async (scenario) => {
    const { container } = render(<DeviceLayersDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownPaths()).toEqual(scenario.paths)
    for (const path of svg().querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('d', paths[path.getAttribute('data-path')!])
      expect(path).toHaveAttribute('stroke-width', '2')
      expect(path).toHaveClass('stroke-title')
      expect(path).toHaveAttribute('marker-end', `url(#${svg().querySelector('marker')!.id})`)
      expect(path.closest('[opacity]')).toBeNull()
    }
    expect(shownNotes()).toEqual(scenario.notes)
    for (const id of scenario.notes) {
      expect(note(id).textContent).toBe(noteLabels[id])
      expect(note(id)).toHaveAttribute('font-size', '9')
    }
    expect(gatewayNote()).toHaveAttribute('opacity', '0.25')
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말이 자리에 들어간다`, async () => {
    render(<DeviceLayersDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    // 시나리오 곁말은 한 번에 하나만 보이므로 같은 자리를 함께 써도 된다. 늘 보이는 게이트웨이 곁말과는 겹치지 않는다.
    expect(gatewayNote()).toHaveAttribute('font-size', '9')
    const fixed = textBox(gatewayNote(), 'gateway-note')
    const noteBoxes: SvgBox[] = [fixed]
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of scenario.notes) {
        const box = textBox(note(id), id)
        noteBoxes.push(box)
        expect(overlaps(box, fixed), `${id} ↔ 게이트웨이 곁말`).toBe(false)
      }
    }
    expect([...noteBoxes.map(({ id }) => id)].sort()).toEqual([...Object.keys(noteLabels)].sort())
    expect(boxesOutsideViewBox(noteBoxes, viewBox)).toEqual([])
    for (const box of noteBoxes) {
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
      for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표는 장비의 변에서 시작해 계층 칸의 변에서 끝나고, 다른 노드 안을 지나지 않는다', () => {
    render(<DeviceLayersDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(pathEnds)))
    for (const [id, d] of Object.entries(paths)) {
      const { start, end } = lineEnds(d)
      expect(onEdge(start, nodeBox(pathEnds[id][0])), `${id} 시작`).toBe(true)
      expect(onEdge(end, nodeBox(pathEnds[id][1])), `${id} 끝`).toBe(true)
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
      }
    }
  })

  // 요점: 계층 칸은 아래에서 위로 물리 → 데이터 링크 → 네트워크 → 전송 → 응용 차례이고, 장비는 자기가 읽는 가장 높은 계층의 높이에 있다.
  // 선명한 계층 칸의 수가 리피터와 허브 < 브리지와 스위치 < 라우터 < 부하 분산 장치 차례로 늘고, 시나리오마다 선명한 장비는 하나다.
  // 화살표는 그 장비에서 나가 선명한 칸 가운데 가장 높은 칸에 닿는다. 게이트웨이는 어느 시나리오에서도 선명해지지 않는다.
  it('위 계층을 읽는 장비일수록 선명한 계층 칸이 늘고, 화살표가 그 가운데 가장 높은 칸에 닿는다', async () => {
    render(<DeviceLayersDiagram />)
    for (let index = 1; index < layerIds.length; index += 1) {
      expect(nodeBox(layerIds[index]).y, `${layerIds[index]} 위 ${layerIds[index - 1]}`).toBeLessThan(nodeBox(layerIds[index - 1]).y)
      expect(nodeBox(layerIds[index]).x).toBe(nodeBox(layerIds[0]).x)
    }
    expect(nodeBox('repeater-hub').y).toBe(nodeBox('physical').y)
    expect(nodeBox('bridge-switch').y).toBe(nodeBox('datalink').y)
    expect(nodeBox('router').y).toBe(nodeBox('network').y)
    expect(nodeBox('load-balancer').y).toBe(nodeBox('application').y)
    // 게이트웨이는 계층 칸이 놓인 높이보다 아래에 따로 둔다.
    for (const layer of layerIds) expect(nodeBox('gateway').y, layer).toBeGreaterThan(nodeBox(layer).y + nodeBox(layer).height)

    const counts: number[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const litLayers = layerIds.filter((id) => opacity(id) === '1')
      const litDevices = deviceIds.filter((id) => opacity(id) === '1')
      expect(litDevices, scenario.id).toHaveLength(1)
      expect(litDevices, scenario.id).not.toContain('gateway')
      // 선명한 칸은 물리 계층부터 끊김 없이 이어진다.
      expect(litLayers, scenario.id).toEqual(layerIds.slice(0, litLayers.length))
      counts.push(litLayers.length)
      const topLayer = litLayers[litLayers.length - 1]
      for (const id of shownPaths()) expect(pathEnds[id][0], id).toBe(litDevices[0])
      expect(shownPaths().map((id) => pathEnds[id][1]), scenario.id).toContain(topLayer)
      for (const id of shownPaths()) expect(litLayers, id).toContain(pathEnds[id][1])
    }
    expect(counts).toEqual([1, 2, 3, 5])

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const name of ['물리 계층·데이터 링크 계층·네트워크 계층·전송 계층·응용 계층', '**리피터**', '**허브**', '**브리지**', '**스위치**', '**라우터**', '**부하 분산 장치**', '**게이트웨이**',
      '받은 프레임의 헤더를 떼어 안의 패킷을 꺼내고', '새 프레임에 담아', '목적지 포트 번호', 'HTTP 요청의 URL', '목적지 MAC 주소를 읽고', '한 계층에 묶이지 않는다', '라우터가 넘길 곳을 정할 때 쓰지 않는 정보']) {
      expect(body, name).toContain(name)
    }
  })
}

describe('DeviceLayersDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<DeviceLayersDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 296')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      await select('부하 분산 장치')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 264')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(screen.getByRole('button', { name: '부하 분산 장치' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><DeviceLayersDiagram /><DeviceLayersDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '부하 분산 장치' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<DeviceLayersDiagram />)
    const text = visualsByTopicId[topicId].diagrams['device-layers']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(deviceLayersScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
    expect(scenarioNoteIds).toEqual(expectedScenarios.flatMap(({ notes }) => notes))
    for (const expected of expectedScenarios) {
      const wording = text.scenarios.find(({ id }) => id === expected.id)!
      const scenario = deviceLayersScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 계층별 네트워크 장비 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(within(figure).queryByRole('heading')).toBeNull()
  })
})
