import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { DsCommandsDiagram, dsCommandsScenarios } from './DsCommandsDiagram'

const topicId = 'windows-ad'
const anchorConceptId = `${topicId}.ds-commands`
const labels: Record<string, string> = {
  cn: 'CN=user01',
  ou: 'OU=영업팀',
  dc1: 'DC=example',
  dc2: 'DC=com',
  dsadd: 'dsadd',
  add: '개체 추가',
  dsmod: 'dsmod',
  mod: '개체 속성 바꾸기',
  dsrm: 'dsrm',
  rm: '개체 지우기',
  dsquery: 'dsquery',
  query: '개체 찾기',
  dsget: 'dsget',
  get: '개체 속성 보기',
  dsmove: 'dsmove',
  move: '개체 옮기기·이름 바꾸기',
}
const groupLabels: Record<string, string> = {
  dn: '고유 이름',
  commands: 'ds 명령',
}
const noteLabels: Record<string, string> = {
  'cn-note': '개체 자신의 이름',
  'ou-note': '개체가 든 OU',
  'dc-note': '이어 읽으면 example.com',
  'change-note': '디렉터리를 바꾼다',
  'look-note': '바꾸지 않고 보기만 한다',
}
const noteScenario: Record<string, string> = {
  'cn-note': 'dn', 'ou-note': 'dn', 'dc-note': 'dn', 'change-note': 'change', 'look-note': 'look',
}
const noteGroup: Record<string, string> = {
  'cn-note': 'dn', 'ou-note': 'dn', 'dc-note': 'dn', 'change-note': 'commands', 'look-note': 'commands',
}
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels)
const pieces = ['cn', 'ou', 'dc1', 'dc2']
const commands = ['dsadd', 'dsmod', 'dsrm', 'dsquery', 'dsget', 'dsmove']
// 명령 칸과 그 오른쪽에 맞닿는 하는 일 칸의 짝.
const actionOf: Record<string, string> = {
  dsadd: 'add', dsmod: 'mod', dsrm: 'rm', dsquery: 'query', dsget: 'get', dsmove: 'move',
}
const dn = 'CN=user01,OU=영업팀,DC=example,DC=com'

const question = 'ds 명령은 어느 개체를 어떻게 가리킬까?'
const figureName = 'ds 명령이 개체를 가리키는 고유 이름 CN=user01,OU=영업팀,DC=example,DC=com을 조각마다 나누어 보이고, 명령 여섯 dsadd·dsmod·dsrm·dsquery·dsget·dsmove가 하는 일을 디렉터리를 바꾸는 명령과 보기만 하는 명령으로 가르는 도식'
const svgName = '고유 이름 박스 안에 CN=user01, OU=영업팀, DC=example, DC=com 조각이 차례로 이어져 있고, ds 명령 박스 안에 dsadd·dsmod·dsrm·dsquery·dsget·dsmove와 저마다 하는 일이 짝지어 있는 그림'
const idleCaption = '위 박스에는 도메인 example.com의 OU 영업팀에 둔 계정 user01의 고유 이름을 조각마다 나누어 두었고, 아래 박스에는 ds 명령 여섯과 저마다 하는 일을 짝지어 두었다. 이름은 예로 붙인 것이다. 버튼을 고르면 고유 이름을 읽는 법과 명령마다 하는 일을 볼 수 있다.'
const legend = '위 박스의 칸은 고유 이름을 쉼표에서 나눈 조각이다. 아래 박스의 칸은 왼쪽이 명령, 오른쪽이 그 명령이 하는 일이다.'
const expectedScenarios = [
  {
    id: 'dn', label: '고유 이름',
    nodes: ['cn', 'ou', 'dc1', 'dc2'],
    caption: 'ds 명령은 다룰 개체를 고유 이름으로 가리킨다. CN=user01은 개체 자신의 이름이고 OU=영업팀은 그 개체가 든 OU이며, DC=example과 DC=com을 이어 읽으면 도메인 example.com이 된다. 앞 조각일수록 안쪽 그릇이다.',
  },
  {
    id: 'change', label: '만들고 바꾸고 지우기',
    nodes: ['dsadd', 'add', 'dsmod', 'mod', 'dsrm', 'rm', 'dsmove', 'move'],
    caption: 'dsadd는 개체를 더하고, dsmod는 이미 있는 개체의 속성을 고치고, dsrm은 개체를 지운다. dsmove는 개체를 같은 도메인 안의 다른 자리로 옮기거나 이름만 바꾼다. 넷 모두 디렉터리를 바꾼다.',
  },
  {
    id: 'look', label: '찾고 보기',
    nodes: ['dsquery', 'query', 'dsget', 'get'],
    caption: 'dsquery는 정한 조건에 맞는 개체를 찾고, dsget은 개체 하나의 속성을 보여 준다. 사용자 계정이 든 그룹의 목록도 dsget으로 본다. 둘은 디렉터리를 바꾸지 않고 보기만 한다.',
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

function layoutTests(wide: boolean) {
  const viewBox: [number, number, number, number] = wide ? [0, 0, 440, 232] : [0, 0, 280, 416]

  it('물음형 제목을 헤딩 없이 버튼보다 앞에 보이고 SVG는 하나다', () => {
    render(<DsCommandsDiagram />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(svg()).toHaveAttribute('viewBox', viewBox.join(' '))
    expect(svg().parentElement).toHaveAttribute('class', wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0')
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 선·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<DsCommandsDiagram />)
    expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of svg().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    for (const id of groupIds) expect(groupLabel(id)).toBe(groupLabels[id])
    expect(svg().querySelectorAll('[data-path], path')).toHaveLength(0)
    expect(shownNotes()).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 지정한 칸·곁말만 보이고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<DsCommandsDiagram />)
    await select(scenario.label)
    for (const id of nodeIds) expect(svg().querySelector(`[data-node="${id}"]`), id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
    expect(shownNotes()).toEqual(Object.keys(noteScenario).filter((id) => noteScenario[id] === scenario.id))
    for (const id of shownNotes()) expect(note(id)!.textContent).toBe(noteLabels[id])
    expect(svg().querySelectorAll('[data-path], path')).toHaveLength(0)
    for (const id of groupIds) expect(svg().querySelector(`[data-group="${id}"]`)!.closest('[opacity]'), id).toBeNull()
    expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
    expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
  })

  it(`모든 rect가 ${viewBox[2]}×${viewBox[3]} 안에 있고 라벨·곁말·그룹 라벨이 자리에 들어간다`, async () => {
    render(<DsCommandsDiagram />)
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
      const home = pieces.includes(id) ? 'dn' : 'commands'
      for (const group of groupIds) {
        if (group === home) expect(contains(groupBox(group), nodeBox(id)), `${id} ⊂ ${group}`).toBe(true)
        else expect(overlaps(groupBox(group), nodeBox(id)), `${id} ↔ ${group}`).toBe(false)
      }
    }
    expect(overlaps(groupBox('dn'), groupBox('commands'))).toBe(false)
    const groupTexts = groupIds.map((id) => {
      expect(svg().querySelector(`[data-group-label="${id}"]`)).toHaveAttribute('font-size', '9')
      const box = groupLabelBox(id)
      expect(contains(groupBox(id), box), id).toBe(true)
      for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} 라벨 ↔ ${node}`).toBe(false)
      return box
    })
    for (const scenario of expectedScenarios) {
      await select(scenario.label)
      const noteTexts = shownNotes().map((id) => {
        const element = note(id)!
        expect(element).toHaveAttribute('font-size', '9')
        expect(element).toHaveClass('fill-muted')
        const box = textBox(element, id)
        for (const node of nodeIds) expect(overlaps(box, nodeBox(node)), `${id} ↔ ${node}`).toBe(false)
        expect(contains(groupBox(noteGroup[id]), box), id).toBe(true)
        return box
      })
      for (const box of [...noteTexts, ...groupTexts]) {
        expect(box.x, box.id).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width, box.id).toBeLessThanOrEqual(viewBox[2])
        expect(box.y, box.id).toBeGreaterThanOrEqual(0)
        expect(box.y + box.height, box.id).toBeLessThanOrEqual(viewBox[3])
      }
      for (const [index, box] of noteTexts.entries()) {
        for (const group of groupTexts) expect(overlaps(box, group), `${box.id} ↔ ${group.id}`).toBe(false)
        for (const other of noteTexts.slice(index + 1)) expect(overlaps(box, other), `${box.id} ↔ ${other.id}`).toBe(false)
      }
    }
    expect(svg().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
  })

  it('명령 칸마다 바로 오른쪽에 그 명령이 하는 일 칸이 맞닿는다', () => {
    render(<DsCommandsDiagram />)
    for (const command of commands) {
      const left = nodeBox(command)
      const right = nodeBox(actionOf[command])
      expect(left.x + left.width, command).toBe(right.x)
      expect(left.y, command).toBe(right.y)
    }
  })

  // 요점: 고유 이름 조각을 차례(세로형은 위에서 아래, 가로형은 왼쪽에서 오른쪽)대로 쉼표로 이으면 본문의 고유 이름이고, 조각은 빈틈없이 맞닿는다.
  // 찾고 보기에서 선명한 명령에는 dsadd·dsmod·dsrm이 없고, 두 시나리오가 명령 여섯을 한 번씩 나눠 맡는다.
  it('고유 이름 조각을 이으면 본문의 고유 이름이고, 보기만 하는 명령은 디렉터리를 바꾸는 명령과 갈린다', async () => {
    render(<DsCommandsDiagram />)
    const ordered = [...pieces].sort((a, b) => (wide ? nodeBox(a).x - nodeBox(b).x : nodeBox(a).y - nodeBox(b).y))
    expect(ordered).toEqual(pieces)
    expect(ordered.map(label).join(',')).toBe(dn)
    for (const [index, id] of ordered.slice(1).entries()) {
      const previous = nodeBox(ordered[index])
      const current = nodeBox(id)
      if (wide) {
        expect(previous.x + previous.width, id).toBe(current.x)
        expect(previous.y, id).toBe(current.y)
      } else {
        expect(previous.y + previous.height, id).toBe(current.y)
        expect(previous.x, id).toBe(current.x)
        expect(previous.width, id).toBe(current.width)
      }
    }

    await select('찾고 보기')
    const looked = commands.filter((id) => opacityOf(id) === '1')
    expect(looked).toEqual(['dsquery', 'dsget'])
    for (const id of ['dsadd', 'dsmod', 'dsrm']) expect(looked).not.toContain(id)
    for (const id of pieces) expect(opacityOf(id)).toBe('0.25')

    await select('만들고 바꾸고 지우기')
    const changed = commands.filter((id) => opacityOf(id) === '1')
    expect(changed).toEqual(['dsadd', 'dsmod', 'dsrm', 'dsmove'])
    expect([...changed, ...looked].sort()).toEqual([...commands].sort())
    for (const id of changed) expect(opacityOf(actionOf[id]), id).toBe('1')

    // 그림의 이름과 사실은 본문에 있는 것이다.
    const concept = anchorConcept()
    const body = concept.paragraphs.join('\n')
    expect(body).toContain(`\`${dn}\``)
    for (const command of commands) expect(body).toContain(`**${labels[actionOf[command]]}**(\`${command}\`)`)
    expect(body).toContain('`CN=user01`은 개체 자신의 이름이고, `OU=영업팀`은 그 개체가 든 OU다')
    expect(body).toContain('이어 읽으면 도메인 `example.com`이 된다')
    expect(body).toContain('앞 조각일수록 안쪽 그릇이고')
    expect(body).toContain('`dsquery`와 `dsget`은 디렉터리를 바꾸지 않고 보기만 한다')
    expect(body).toContain('나머지 넷은 개체를 더하거나 고치거나 지우거나 옮겨 디렉터리를 바꾼다')
  })
}

describe('DsCommandsDiagram', () => {
  describe('세로형', () => {
    layoutTests(false)
  })

  describe('가로형 (768px 이상)', () => {
    beforeEach(() => { mockMatchMedia(true) })
    afterEach(() => { vi.unstubAllGlobals() })

    layoutTests(true)

    it('노드·그룹 id 집합이 세로형과 같고, 고른 시나리오와 캡션이 폭이 바뀌어도 유지된다', async () => {
      const change = mockMatchMedia(false)
      const { container } = render(<DsCommandsDiagram />)
      expect(svg()).toHaveAttribute('viewBox', '0 0 280 416')
      const tallNodes = Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))
      const tallGroups = Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))
      await select('고유 이름')
      const tallNotes = shownNotes()
      const caption = container.querySelector('figcaption')!.textContent

      change(true)

      expect(svg()).toHaveAttribute('viewBox', '0 0 440 232')
      expect(Array.from(svg().querySelectorAll('[data-node]'), (node) => node.getAttribute('data-node'))).toEqual(tallNodes)
      expect(Array.from(svg().querySelectorAll('[data-group]'), (group) => group.getAttribute('data-group'))).toEqual(tallGroups)
      expect(screen.getByRole('button', { name: '고유 이름' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(shownNotes()).toEqual(tallNotes)
    })
  })

  it('두 번 렌더해도 고른 시나리오가 서로 섞이지 않는다', async () => {
    render(<><DsCommandsDiagram /><DsCommandsDiagram /></>)
    const [first, second] = screen.getAllByRole('figure', { name: figureName })
    await act(async () => { await userEvent.click(within(first).getByRole('button', { name: '찾고 보기' })) })
    expect(within(first).getByRole('button', { name: '찾고 보기' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(second).getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(second.querySelector('[data-node="dsadd"]')).toHaveAttribute('opacity', '1')
    expect(first.querySelector('[data-node="dsadd"]')).toHaveAttribute('opacity', '0.25')
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<DsCommandsDiagram />)
    const text = visualsByTopicId[topicId].diagrams['ds-commands']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(dsCommandsScenarios.map(({ id }) => id)).toEqual(text.scenarios.map(({ id }) => id))
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
      const scenario = dsCommandsScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual([])
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 ds 명령 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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
