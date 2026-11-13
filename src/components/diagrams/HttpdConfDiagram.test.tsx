import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { HttpdConfDiagram, httpdConfScenarios } from './HttpdConfDiagram'

const topicId = 'linux-servers'
const anchorConceptId = `${topicId}.httpd-conf`
const labels: Record<string, string> = {
  'server-root': 'ServerRoot "/srv/apache"',
  include: 'Include conf/site.conf',
  'document-root': 'DocumentRoot "/srv/www/example"',
  options: 'Options None',
  'included-file': '/srv/apache/conf/site.conf',
  request: 'http://www.example.com/about.html',
  file: '/srv/www/example/about.html',
}
const groupLabels: Record<string, string> = {
  conf: 'httpd.conf',
  section: '<Directory "/srv/www/example">',
}
const noteLabels: Record<string, string> = {
  'url-path': '주소의 경로 /about.html',
  append: 'DocumentRoot 뒤에 경로를 붙인다',
  scope: '이 디렉터리와 그 아래에만 걸린다',
  find: '/srv/apache 아래에서 찾는다',
}
const noteScenario: Record<string, string> = {
  'url-path': 'mapping', append: 'mapping', scope: 'directory', find: 'server',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
// httpd.conf 박스 안에 드는 줄. <Directory> 구역 안에는 Options None만 든다.
const lineIds = ['server-root', 'include', 'document-root', 'options']

const tallPaths: Record<string, string> = {
  'include-to-file': 'M12 82 H8 V256 H48',
  'req-to-file': 'M140 332 V360',
  'root-to-file': 'M228 122 H272 V376 H240',
}
const widePaths: Record<string, string> = {
  'include-to-file': 'M180 82 H252',
  'req-to-file': 'M232 260 H252',
  'root-to-file': 'M228 122 H344 V244',
}
// 화살표마다 [시작 노드, 끝 노드].
const ends: Record<string, [string, string]> = {
  'include-to-file': ['include', 'included-file'],
  'req-to-file': ['request', 'file'],
  'root-to-file': ['document-root', 'file'],
}

const question = '요청한 주소는 서버의 어느 파일로 이어질까?'
const figureName = 'httpd.conf의 ServerRoot·Include·DocumentRoot 줄과 <Directory> 구역을 놓고, 요청한 주소가 DocumentRoot 아래 파일로 이어지는 것과 Include가 ServerRoot 아래 파일을 끌어오는 것을 보이는 도식'
const svgName = 'httpd.conf 박스 안에 ServerRoot "/srv/apache", Include conf/site.conf, DocumentRoot "/srv/www/example"와 <Directory "/srv/www/example"> 구역 안의 Options None이 있고, 박스 밖에 /srv/apache/conf/site.conf, 요청 주소 http://www.example.com/about.html, 파일 /srv/www/example/about.html이 있는 그림'
const idleCaption = 'httpd.conf에 적은 예 줄들과, 웹 브라우저가 요청한 주소, 서버의 파일을 놓은 것이다. 경로와 주소는 예로 붙인 것이다. 버튼을 고르면 주소가 어느 파일로 이어지는지, <Directory> 구역이 어디에 걸리는지, 서버의 기준 디렉터리가 무엇을 정하는지 볼 수 있다.'
const legend = '박스 안의 노드는 httpd.conf의 한 줄이고, 화살표는 주소나 줄이 가리키는 파일로 잇는다.'
const expectedScenarios = [
  {
    id: 'mapping', label: '주소와 파일',
    nodes: ['document-root', 'request', 'file'], paths: ['req-to-file', 'root-to-file'],
    caption: '웹 브라우저가 http://www.example.com/about.html을 요청하면, Apache는 도메인 이름 뒤의 경로 /about.html을 DocumentRoot의 /srv/www/example 뒤에 붙여 /srv/www/example/about.html을 찾아 보낸다.',
  },
  {
    id: 'directory', label: '디렉터리 설정',
    nodes: ['options'], paths: [] as string[],
    caption: '<Directory "/srv/www/example">와 </Directory> 사이에 적은 지시자는 그 디렉터리와 그 아래 디렉터리, 그 안의 파일에만 걸린다. 여기서는 Options None이 /srv/www/example과 그 아래에서 Options가 켤 수 있는 기능을 하나도 켜지 않는다.',
  },
  {
    id: 'server', label: '서버 설정',
    nodes: ['server-root', 'include', 'included-file'], paths: ['include-to-file'],
    caption: 'ServerRoot는 Apache가 설치된 기준 디렉터리이고, 설정 파일 안에 상대 경로로 적은 파일을 찾는 기준이다. 그래서 Include conf/site.conf는 /srv/apache/conf/site.conf를 끌어와 그 자리에 적은 것처럼 읽게 한다.',
  },
]

const svg = () => screen.getByRole('img', { name: svgName })
const select = async (name: string) => { await act(async () => { await userEvent.click(screen.getByRole('button', { name })) }) }

function readBox(rect: Element, id = ''): SvgBox {
  return {
    id,
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

const nodeBox = (id: string) => readBox(svg().querySelector(`[data-node="${id}"] rect`)!, id)
const groupBox = (id: string) => readBox(svg().querySelector(`[data-group="${id}"]`)!, id)
const label = (id: string) => svg().querySelector(`[data-node="${id}"] text`)!.textContent!
const groupLabel = (id: string) => svg().querySelector(`[data-group-label="${id}"]`)!.textContent!
const note = (id: string) => svg().querySelector(`[data-note="${id}"]`)
const shownPaths = () => Array.from(svg().querySelectorAll('[data-path]'), (path) => path.getAttribute('data-path')!)
const shownNotes = () => Array.from(svg().querySelectorAll('[data-note]'), (item) => item.getAttribute('data-note')!)
const opacityOf = (id: string) => svg().querySelector(`[data-node="${id}"]`)!.getAttribute('opacity')

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function contains(outer: SvgBox, inner: SvgBox) {
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

type Segment = { x1: number, y1: number, x2: number, y2: number }

// 직교 경로를 선분 목록으로 편다. M/H/V만 나온다.
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

// 선분이 상자 안쪽을 지나는가. 변에 닿기만 하는 것은 세지 않는다.
function crossesInside(segment: Segment, box: SvgBox) {
  const left = Math.min(segment.x1, segment.x2)
  const right = Math.max(segment.x1, segment.x2)
  const top = Math.min(segment.y1, segment.y2)
  const bottom = Math.max(segment.y1, segment.y2)
  if (top === bottom) return top > box.y && top < box.y + box.height && Math.min(right, box.x + box.width) > Math.max(left, box.x)
  return left > box.x && left < box.x + box.width && Math.min(bottom, box.y + box.height) > Math.max(top, box.y)
}

// 선분이 상자에 닿는가. 변에 닿는 것도 센다.
function touches(segment: Segment, box: SvgBox) {
  const left = Math.min(segment.x1, segment.x2)
  const right = Math.max(segment.x1, segment.x2)
  const top = Math.min(segment.y1, segment.y2)
  const bottom = Math.max(segment.y1, segment.y2)
  return left <= box.x + box.width && right >= box.x && top <= box.y + box.height && bottom >= box.y
}

function onEdge(x: number, y: number, box: SvgBox) {
  const insideX = x >= box.x && x <= box.x + box.width
  const insideY = y >= box.y && y <= box.y + box.height
  return ((x === box.x || x === box.x + box.width) && insideY) || ((y === box.y || y === box.y + box.height) && insideX)
}

function lineEnds(d: string) {
  const list = segments(d)
  return { start: { x: list[0].x1, y: list[0].y1 }, end: { x: list[list.length - 1].x2, y: list[list.length - 1].y2 } }
}

const endsAt = (point: { x: number, y: number }) => nodeIds.filter((id) => onEdge(point.x, point.y, nodeBox(id)))
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

const anchorConcept = () => topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!
// 지시자 줄에서 따옴표 안의 값이나 마지막 인자를 꺼낸다.
const valueOf = (line: string) => (line.match(/"([^"]+)"/u)?.[1] ?? line.split(' ').slice(-1)[0])

function layoutTests(wide: boolean) {
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 302] : [0, 0, 280, 418]
  const paths = wide ? widePaths : tallPaths

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<HttpdConfDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 화살표와 곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<HttpdConfDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(shownPaths()).toEqual([])
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 노드·화살표·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<HttpdConfDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownNotes()).toEqual(Object.keys(noteScenario).filter((id) => noteScenario[id] === scenario.id))
    for (const id of shownNotes()) expect(note(id)!.textContent).toBe(noteLabels[id])
    expect(shownPaths()).toEqual(scenario.paths)
    for (const path of svg().querySelectorAll('[data-path]')) {
      expect(path).toHaveAttribute('d', paths[path.getAttribute('data-path')!])
      expect(path).toHaveAttribute('stroke-width', '2')
      expect(path).toHaveClass('stroke-title')
      expect(path).toHaveAttribute('marker-end', `url(#${svg().querySelector('marker')!.id})`)
      expect(path.closest('[opacity]')).toBeNull()
    }
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말·그룹 라벨이 자리에 들어간다`, async () => {
    render(<HttpdConfDiagram />)
    const boxes = Array.from(svg().querySelectorAll('rect'), (rect) => readBox(rect))
    expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
    expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])
    for (const id of nodeIds) {
      expect(label(id)).toBe(labels[id])
      expect(svg().querySelector(`[data-node="${id}"] text`)).toHaveAttribute('font-size', '10')
      expect(nodeBox(id).height).toBe(32)
      expect(svg().querySelector(`[data-node="${id}"] rect`)).toHaveClass('stroke-disabled')
      expect(estimateTextWidth(label(id), 10) * 1.15 + 12, id).toBeLessThanOrEqual(nodeBox(id).width)
      for (const other of nodeIds.filter((otherId) => otherId !== id)) expect(overlaps(nodeBox(id), nodeBox(other)), `${id} ↔ ${other}`).toBe(false)
    }
    // httpd.conf 박스 안에는 설정 줄 넷과 <Directory> 구역이 들고, 끌어온 파일·요청 주소·찾은 파일은 박스 밖이다.
    // <Directory> 구역 안에는 Options None만 든다.
    for (const id of nodeIds) {
      expect(contains(groupBox('conf'), nodeBox(id)), id).toBe(lineIds.includes(id))
      if (!lineIds.includes(id)) expect(overlaps(groupBox('conf'), nodeBox(id)), id).toBe(false)
      expect(overlaps(groupBox('section'), nodeBox(id)), id).toBe(id === 'options')
    }
    expect(contains(groupBox('section'), nodeBox('options'))).toBe(true)
    expect(contains(groupBox('conf'), groupBox('section'))).toBe(true)
    const groupTexts = groupIds.map((id) => {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
      return box
    })
    expect(overlaps(groupTexts[0], groupTexts[1])).toBe(false)
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const noteTexts = shownNotes().map((id) => {
        const element = note(id)!
        expect(element).toHaveAttribute('font-size', '9')
        expect(element).toHaveClass('fill-muted')
        const box = textBox(element, id)
        for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        return box
      })
      for (const box of [...noteTexts, ...groupTexts]) {
        expect(box.x, box.id).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width, box.id).toBeLessThanOrEqual(viewBox[2])
        expect(box.y, box.id).toBeGreaterThanOrEqual(0)
        expect(box.y + box.height, box.id).toBeLessThanOrEqual(viewBox[3])
        for (const d of Object.values(paths)) {
          for (const segment of segments(d)) expect(touches(segment, box), `${box.id} ↔ 선`).toBe(false)
        }
      }
      for (const box of noteTexts) {
        for (const group of groupTexts) expect(overlaps(box, group), `${box.id} ↔ ${group.id}`).toBe(false)
      }
      for (let i = 0; i < noteTexts.length; i += 1) {
        for (const other of noteTexts.slice(i + 1)) expect(overlaps(noteTexts[i], other), `${noteTexts[i].id} ↔ ${other.id}`).toBe(false)
      }
    }
    // 구역의 곁말은 그 구역 안에 놓인다.
    await select('디렉터리 설정')
    expect(contains(groupBox('section'), textBox(note('scope')!, 'scope'))).toBe(true)
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('화살표 양 끝은 노드의 변에 닿고 어떤 선분도 노드 안이나 그룹 라벨을 지나거나 같은 시나리오의 다른 화살표와 만나지 않는다', async () => {
    render(<HttpdConfDiagram />)
    for (const [id, d] of Object.entries(paths)) {
      for (const segment of segments(d)) {
        for (const node of nodeIds) expect(crossesInside(segment, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        for (const group of groupIds) expect(touches(segment, groupLabelBox(group)), `${id} ↔ ${group} 라벨`).toBe(false)
      }
      const { start, end } = lineEnds(d)
      expect(endsAt(start), `${id} 시작`).toEqual([ends[id][0]])
      expect(endsAt(end), `${id} 끝`).toEqual([ends[id][1]])
    }
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const lines = shownPaths()
      for (let i = 0; i < lines.length; i += 1) {
        for (const other of lines.slice(i + 1)) {
          for (const a of segments(paths[lines[i]])) {
            for (const b of segments(paths[other])) {
              const box = { id: '', x: Math.min(b.x1, b.x2), y: Math.min(b.y1, b.y2), width: Math.abs(b.x2 - b.x1), height: Math.abs(b.y2 - b.y1) }
              expect(touches(a, box), `${lines[i]} ↔ ${other}`).toBe(false)
            }
          }
        }
      }
    }
  })

  // 요점: 찾은 파일의 경로는 DocumentRoot의 값 뒤에 요청 주소의 경로를 붙인 것이고, ServerRoot는 거기 쓰이지 않는다.
  // 「주소와 파일」에서 ServerRoot 줄은 흐리다. Include가 끌어온 파일은 ServerRoot 아래에서 찾는다.
  it('찾은 파일은 DocumentRoot 뒤에 주소의 경로를 이은 것이고, 주소와 파일에서 ServerRoot 줄이 흐리다', async () => {
    render(<HttpdConfDiagram />)
    const documentRoot = valueOf(label('document-root'))
    const serverRoot = valueOf(label('server-root'))
    const urlPath = new URL(label('request')).pathname
    expect(label('file')).toBe(`${documentRoot}${urlPath}`)
    expect(label('file').startsWith(serverRoot)).toBe(false)
    expect(label('file')).not.toContain(new URL(label('request')).hostname)
    expect(label('included-file')).toBe(`${serverRoot}/${valueOf(label('include'))}`)
    expect(groupLabel('section')).toBe(`<Directory "${documentRoot}">`)

    await select('주소와 파일')
    expect(opacityOf('server-root')).toBe('0.25')
    expect(opacityOf('include')).toBe('0.25')
    for (const id of ['request', 'document-root', 'file']) expect(opacityOf(id), id).toBe('1')
    for (const id of shownPaths()) expect(endsAt(lineEnds(paths[id]).end), id).toEqual(['file'])
    expect(note('url-path')!.textContent).toContain(urlPath)

    await select('서버 설정')
    expect(endsAt(lineEnds(paths['include-to-file']).end)).toEqual(['included-file'])
    expect(opacityOf('file')).toBe('0.25')

    const body = anchorConcept().paragraphs.join('\n')
    for (const id of ['server-root', 'include', 'document-root', 'options', 'included-file', 'request', 'file']) expect(body, id).toContain(`\`${label(id)}\``)
    expect(body).toContain(`\`${groupLabel('section')}\``)
    expect(body).toContain(`\`${urlPath}\``)
  })
}

describe('HttpdConfDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합과 화살표 id 합집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<HttpdConfDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 418')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('주소와 파일')
      const tallShown = shownPaths()
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 302')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '주소와 파일' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownPaths()).toEqual(tallShown)
      expect(shownNotes()).toEqual(tallNotes)
      for (const path of svg().querySelectorAll('[data-path]')) expect(path).toHaveAttribute('d', widePaths[path.getAttribute('data-path')!])
      expect(new Set(Object.keys(tallPaths))).toEqual(new Set(Object.keys(widePaths)))
    })
  })

  it('두 번 렌더해도 화살표 마커 id가 겹치지 않는다', async () => {
    render(<><HttpdConfDiagram /><HttpdConfDiagram /></>)
    const figures = screen.getAllByRole('figure', { name: figureName })
    for (const figure of figures) {
      await act(async () => { await userEvent.click(within(figure).getByRole('button', { name: '주소와 파일' })) })
      for (const path of figure.querySelectorAll('[data-path]')) expect(path).toHaveAttribute('marker-end', `url(#${figure.querySelector('marker')!.id})`)
    }
    expect(new Set(figures.map((figure) => figure.querySelector('marker')!.id)).size).toBe(2)
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<HttpdConfDiagram />)
    const text = visualsByTopicId[topicId].diagrams['httpd-conf']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(httpdConfScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = httpdConfScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual(expected.paths)
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 Apache와 httpd.conf 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
    const concept = anchorConcept()
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', concept.id)
    expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*|`/gu, ''))
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(within(figure).queryByRole('heading')).toBeNull()
  })
})
