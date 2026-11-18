import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { RoleServiceFeatureDiagram, roleServiceFeatureScenarios } from './RoleServiceFeatureDiagram'

const topicId = 'windows-server-roles'
const anchorConceptId = `${topicId}.server-roles-features`
const labels: Record<string, string> = {
  'wizard': '역할 및 기능 추가 마법사',
  'cmdlet': 'Install-WindowsFeature',
  'role-iis': '웹 서버(IIS)',
  'role-dhcp': 'DHCP 서버',
  'svc-ftp': 'FTP 서버',
  'feat-bitlocker': 'BitLocker 드라이브 암호화',
}
const groupLabels: Record<string, string> = {
  'server': 'SRV01',
  'roles': '서버 역할',
  'features': '기능',
}
const noteLabels: Record<string, string> = {
  'role-note': '다른 컴퓨터에게 해 주는 일',
  'svc-note': '역할 안에서 고른다',
  'feature-note': '서버 자신의 일을 돕는다',
  'install-note': '같은 일을 한다',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const noteIds = Object.keys(noteLabels)
// 서버 안의 노드는 자기 갈래 박스 안에 있다. 설치하는 두 자리는 서버 박스 밖에 있다.
const groupOf: Record<string, string> = {
  'role-iis': 'roles', 'role-dhcp': 'roles', 'svc-ftp': 'roles',
  'feat-bitlocker': 'features',
}
const toolIds = ['wizard', 'cmdlet']
// 곁말의 자리. 설치 곁말은 서버 박스 밖에 있다.
const noteOwner: Record<string, string | null> = {
  'role-note': 'roles', 'svc-note': 'roles', 'feature-note': 'features', 'install-note': null,
}
// 끝점: 노드면 노드 id, 그룹 박스면 'group:<id>'.
const pathEnds: Record<string, [string, string]> = {
  'wizard-install': ['wizard', 'group:server'],
  'cmdlet-install': ['cmdlet', 'group:server'],
  'role-iis-ftp': ['role-iis', 'svc-ftp'],
}
const linkIds = ['role-iis-ftp']
const tallPaths: Record<string, string> = {
  'wizard-install': 'M168 24 H256 V96',
  'cmdlet-install': 'M168 64 H232 V96',
  'role-iis-ftp': 'M36 168 V196 H48',
}
const widePaths: Record<string, string> = {
  'wizard-install': 'M168 76 H200',
  'cmdlet-install': 'M168 132 H200',
  'role-iis-ftp': 'M228 80 V108 H240',
}

const question = '서버에 무엇을 설치하면 어떤 일을 맡게 될까?'
const figureName = '서버 SRV01에 설치하는 서버 역할(웹 서버(IIS)와 그 안의 역할 서비스 FTP 서버, DHCP 서버)과 기능(BitLocker 드라이브 암호화)이 무엇이 다른지와, 역할 및 기능 추가 마법사와 Install-WindowsFeature가 같은 설치를 하는 것을 보이는 도식'
const svgName = '위에 설치하는 두 자리인 역할 및 기능 추가 마법사와 Install-WindowsFeature를, 그 아래 SRV01 박스 안에 서버 역할 박스(웹 서버(IIS)와 그 아래의 FTP 서버, DHCP 서버)와 기능 박스(BitLocker 드라이브 암호화)를 그린 그림'
const idleCaption = 'SRV01에 설치할 수 있는 구성 요소를 서버 역할과 기능으로 나눠 두었다. SRV01은 예로 붙인 이름이다. 버튼을 고르면 역할과 역할 서비스, 기능이 저마다 무엇을 맡는지와 설치하는 두 자리를 볼 수 있다.'
const legend = 'SRV01 박스 안의 위 박스는 서버 역할이고, 웹 서버(IIS)에서 선으로 이어진 FTP 서버는 그 역할 안에서 고르는 역할 서비스다. 아래 박스는 기능이다. 화살표는 설치하는 자리에서 SRV01로 간다.'
const expectedScenarios = [
  {
    id: 'role', label: '역할',
    nodes: ['role-iis', 'role-dhcp', 'svc-ftp'], paths: [], notes: ['role-note', 'svc-note'],
    caption: '서버 역할은 서버가 네트워크의 다른 컴퓨터에게 해 주는 주된 일이다. DHCP 서버는 장치들에게 IP 주소를 나눠 주고 웹 서버(IIS)는 웹 페이지를 보내 준다. FTP 서버는 웹 서버(IIS) 역할 안에서 골라 넣는 역할 서비스다.',
  },
  {
    id: 'feature', label: '기능',
    nodes: ['feat-bitlocker'], paths: [], notes: ['feature-note'],
    caption: 'BitLocker 드라이브 암호화는 어느 역할에도 속하지 않는 기능이다. 서버의 저장 공간을 통째로 암호화해 디스크를 떼어 가도 데이터를 읽지 못하게 하는 식으로, 서버 자신의 일을 돕는다.',
  },
  {
    id: 'install', label: '설치하는 자리',
    nodes: ['wizard', 'cmdlet'], paths: ['wizard-install', 'cmdlet-install'], notes: ['install-note'],
    caption: '역할 및 기능 추가 마법사에서 고르든, PowerShell에서 Install-WindowsFeature 뒤에 설치 이름을 적든 SRV01에는 같은 것이 설치된다. 다만 이 cmdlet은 -IncludeManagementTools를 붙여야 관리 도구도 함께 설치한다.',
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
const groupBox = (id: string) => readBox(svg().querySelector(`[data-group="${id}"]`)!, id)
const endBox = (id: string) => (id.startsWith('group:') ? groupBox(id.slice('group:'.length)) : nodeBox(id))
const label = (id: string) => svg().querySelector(`[data-node="${id}"] text`)!.textContent!
const groupLabel = (id: string) => svg().querySelector(`[data-group-label="${id}"]`)!.textContent!
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const shownLinks = () => Array.from(svg().querySelectorAll('[data-link]'), (path) => path.getAttribute('data-link')!)
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (note) => note.getAttribute('data-note')!)
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)!
const opacity = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function contains(outer: SvgBox, inner: SvgBox) {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height
}

// 곁말·그룹 라벨(9)의 가로 범위. 반각 문자가 섞이므로 어림값의 1.15배로 잡는다.
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

const groupLabelBox = (id: string) => textBox(svg().querySelector(`[data-group-label="${id}"]`)!, `${id}-label`)

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
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 216] : [0, 0, 280, 304]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<RoleServiceFeatureDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고, 역할과 역할 서비스를 잇는 선만 보이며 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<RoleServiceFeatureDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownLinks()).toEqual(linkIds)
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 고른 노드·화살표·곁말만 보이고 그룹 박스와 잇는 선은 흐려지지 않는다', async (scenario) => {
    const { container } = render(<RoleServiceFeatureDiagram />)
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
    expect(shownLinks()).toEqual(linkIds)
    for (const link of svg().querySelectorAll('[data-link]')) {
      expect(link).toHaveAttribute('d', paths[link.getAttribute('data-link')!])
      expect(link.closest('[opacity]')).toBeNull()
      expect(link).not.toHaveAttribute('marker-end')
    }
    expect(shownNotes()).toEqual(scenario.notes)
    for (const id of scenario.notes) {
      expect(note(id).textContent).toBe(noteLabels[id])
      expect(note(id)).toHaveAttribute('font-size', '9')
    }
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·그룹 라벨·곁말이 자리에 들어간다`, async () => {
    render(<RoleServiceFeatureDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    // 두 갈래 박스는 서버 박스 안에 있고 서로 겹치지 않는다.
    expect(contains(groupBox('server'), groupBox('roles'))).toBe(true)
    expect(contains(groupBox('server'), groupBox('features'))).toBe(true)
    expect(overlaps(groupBox('roles'), groupBox('features'))).toBe(false)
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      if (groupOf[id]) expect(contains(groupBox(groupOf[id]), nodeBox(id)), `${id} ⊂ ${groupOf[id]}`).toBe(true)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    for (const id of toolIds) expect(overlaps(nodeBox(id), groupBox('server')), `${id}은 서버 밖`).toBe(false)
    for (const id of groupIds) {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
    }
    // 서버 박스의 라벨은 안쪽 두 갈래 박스와 겹치지 않는다.
    for (const inner of ['roles', 'features']) expect(overlaps(groupLabelBox('server'), groupBox(inner)), `SRV01 라벨 ↔ ${inner}`).toBe(false)
    // 곁말은 자기 갈래 박스 안(설치 곁말은 서버 밖)에 들어가고, 노드·그룹 라벨·다른 곁말과 겹치지 않는다.
    const noteBoxes: SvgBox[] = []
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      for (const id of scenario.notes) noteBoxes.push(textBox(note(id), id))
    }
    expect([...noteBoxes.map(({ id }) => id)].sort()).toEqual([...noteIds].sort())
    for (const box of noteBoxes) {
      const owner = noteOwner[box.id]
      if (owner) expect(contains(groupBox(owner), box), box.id).toBe(true)
      else {
        expect(overlaps(box, groupBox('server')), box.id).toBe(false)
        expect(boxesOutsideViewBox([box], viewBox), box.id).toEqual([])
      }
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${box.id} ↔ ${node}`).toBe(false)
      for (const group of groupIds) expect(overlaps(box, groupLabelBox(group)), `${box.id} ↔ ${group} 라벨`).toBe(false)
      for (const other of noteBoxes.filter(({ id }) => id !== box.id)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
      for (const d of Object.values(paths)) for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표와 잇는 선은 정한 변에서 시작해 정한 변에서 끝나고, 노드 안이나 그룹 라벨을 지나지 않는다', () => {
    render(<RoleServiceFeatureDiagram />)
    expect(new Set(Object.keys(paths))).toEqual(new Set(Object.keys(pathEnds)))
    for (const [id, d] of Object.entries(paths)) {
      const [from, to] = pathEnds[id]
      const { start, end } = lineEnds(d)
      expect(onEdge(start, endBox(from)), `${id} 시작`).toBe(true)
      expect(onEdge(end, endBox(to)), `${id} 끝`).toBe(true)
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
    }
  })

  // 요점: 「역할」과 「기능」에서 선명한 노드가 겹치지 않는다 — 역할(과 그 안의 역할 서비스)과 기능은 다른 구성 요소다.
  // 「설치하는 자리」의 화살표 둘은 서로 다른 도구 노드에서 시작해 같은 서버 박스에 닿는다 — 마법사와 cmdlet은 같은 설치를 한다.
  it('역할과 기능의 선명한 노드가 겹치지 않고, 설치 화살표 둘은 서로 다른 도구에서 나와 같은 SRV01 박스에 닿는다', async () => {
    render(<RoleServiceFeatureDiagram />)
    const brightNodes = () => nodeIds.filter((id) => opacity(id) === '1')

    await select('역할')
    const roleNodes = brightNodes()
    expect(roleNodes).toEqual(['role-iis', 'role-dhcp', 'svc-ftp'])
    for (const id of roleNodes) expect(contains(groupBox('roles'), nodeBox(id)), id).toBe(true)

    await select('기능')
    const featureNodes = brightNodes()
    expect(featureNodes).toEqual(['feat-bitlocker'])
    expect(roleNodes.filter((id) => featureNodes.includes(id))).toEqual([])
    for (const id of featureNodes) expect(overlaps(groupBox('roles'), nodeBox(id)), id).toBe(false)

    await select('설치하는 자리')
    const shown = shownPaths()
    expect(shown).toHaveLength(2)
    const starts = shown.map((id) => nodeIds.find((node) => onEdge(lineEnds(paths[id]).start, nodeBox(node))))
    expect(new Set(starts)).toEqual(new Set(toolIds))
    for (const id of shown) expect(onEdge(lineEnds(paths[id]).end, groupBox('server')), id).toBe(true)

    // 역할 서비스 FTP 서버는 웹 서버(IIS) 역할과 늘 보이는 선으로 이어진다.
    const link = lineEnds(paths['role-iis-ftp'])
    expect(onEdge(link.start, nodeBox('role-iis'))).toBe(true)
    expect(onEdge(link.end, nodeBox('svc-ftp'))).toBe(true)

    const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
    for (const name of ['FTP 서버', '웹 서버(IIS)', 'DHCP 서버', 'BitLocker 드라이브 암호화', '역할 및 기능 추가 마법사', '`Install-WindowsFeature`', '`-IncludeManagementTools`', '`SRV01`']) {
      expect(body, name).toContain(name)
    }
  })
}

describe('RoleServiceFeatureDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 선 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<RoleServiceFeatureDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 304')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('설치하는 자리')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 216')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '설치하는 자리' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(widePaths))).toEqual(new Set(Object.keys(tallPaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><RoleServiceFeatureDiagram /><RoleServiceFeatureDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '설치하는 자리' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<RoleServiceFeatureDiagram />)
    const text = visualsByTopicId[topicId].diagrams['role-service-feature']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(roleServiceFeatureScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
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
      const scenario = roleServiceFeatureScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 서버 역할과 기능 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
