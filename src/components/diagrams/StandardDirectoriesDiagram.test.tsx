import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { StandardDirectoriesDiagram, standardDirectoriesScenarios } from './StandardDirectoriesDiagram'

const topicId = 'linux-filesystem'
const anchorConceptId = `${topicId}.standard-directories`
const labels = {
  bin: '/bin',
  sbin: '/sbin',
  lib: '/lib',
  usr: '/usr',
  etc: '/etc',
  home: '/home',
  root: '/root',
  var: '/var',
  tmp: '/tmp',
  boot: '/boot',
  dev: '/dev',
  proc: '/proc',
}
const groupLabels = {
  programs: '명령과 라이브러리',
  config: '설정',
  users: '사용자의 홈',
  data: '바뀌는 데이터와 임시 파일',
  system: '부팅·장치·커널 정보',
}
type GroupId = keyof typeof groupLabels
const nodeIds = Object.keys(labels)
const groupIds = Object.keys(groupLabels) as GroupId[]
// 묶음마다 든 디렉터리. 본문 마지막 문단의 다섯 묶음과 같다.
const members: Record<GroupId, string[]> = {
  programs: ['bin', 'sbin', 'lib', 'usr'],
  config: ['etc'],
  users: ['home', 'root'],
  data: ['var', 'tmp'],
  system: ['boot', 'dev', 'proc'],
}

type Box = { x: number, y: number, width: number, height: number }
const tallNodes: Record<string, Box> = {
  bin: { x: 18, y: 30, width: 52, height: 32 },
  sbin: { x: 82, y: 30, width: 52, height: 32 },
  lib: { x: 146, y: 30, width: 52, height: 32 },
  usr: { x: 210, y: 30, width: 52, height: 32 },
  etc: { x: 18, y: 102, width: 52, height: 32 },
  home: { x: 106, y: 102, width: 52, height: 32 },
  root: { x: 170, y: 102, width: 52, height: 32 },
  var: { x: 18, y: 174, width: 52, height: 32 },
  tmp: { x: 82, y: 174, width: 52, height: 32 },
  boot: { x: 18, y: 246, width: 52, height: 32 },
  dev: { x: 82, y: 246, width: 52, height: 32 },
  proc: { x: 146, y: 246, width: 52, height: 32 },
}
const tallGroups: Record<GroupId, Box & { labelX: number, labelY: number }> = {
  programs: { x: 8, y: 8, width: 264, height: 64, labelX: 16, labelY: 22 },
  config: { x: 8, y: 80, width: 72, height: 64, labelX: 16, labelY: 94 },
  users: { x: 96, y: 80, width: 176, height: 64, labelX: 104, labelY: 94 },
  data: { x: 8, y: 152, width: 264, height: 64, labelX: 16, labelY: 166 },
  system: { x: 8, y: 224, width: 264, height: 64, labelX: 16, labelY: 238 },
}
const wideNodes: Record<string, Box> = {
  bin: { x: 16, y: 30, width: 52, height: 32 },
  sbin: { x: 76, y: 30, width: 52, height: 32 },
  lib: { x: 136, y: 30, width: 52, height: 32 },
  usr: { x: 196, y: 30, width: 52, height: 32 },
  home: { x: 284, y: 30, width: 52, height: 32 },
  root: { x: 344, y: 30, width: 52, height: 32 },
  etc: { x: 18, y: 102, width: 52, height: 32 },
  var: { x: 98, y: 102, width: 52, height: 32 },
  tmp: { x: 158, y: 102, width: 52, height: 32 },
  boot: { x: 254, y: 102, width: 52, height: 32 },
  dev: { x: 314, y: 102, width: 52, height: 32 },
  proc: { x: 374, y: 102, width: 52, height: 32 },
}
const wideGroups: Record<GroupId, Box & { labelX: number, labelY: number }> = {
  programs: { x: 8, y: 8, width: 248, height: 64, labelX: 16, labelY: 22 },
  users: { x: 264, y: 8, width: 168, height: 64, labelX: 272, labelY: 22 },
  config: { x: 8, y: 80, width: 72, height: 64, labelX: 16, labelY: 94 },
  data: { x: 88, y: 80, width: 148, height: 64, labelX: 96, labelY: 94 },
  system: { x: 244, y: 80, width: 188, height: 64, labelX: 252, labelY: 94 },
}

const question = '어느 디렉터리에 무엇이 들어 있을까?'
const idleCaption = 'FHS가 루트 디렉터리 / 바로 안에 두라고 정한 디렉터리 열둘을 쓰임에 따라 다섯 묶음으로 나눴다. 버튼을 고르면 그 묶음의 디렉터리에 무엇이 들어 있는지 볼 수 있다.'
const legend = '상자 하나가 루트 디렉터리 바로 안의 디렉터리 하나이고, 둘레의 테두리는 쓰임이 같은 디렉터리를 묶은 것이다.'
const figureName = '루트 디렉터리 바로 안의 표준 디렉터리 열둘을 명령과 라이브러리, 설정, 사용자의 홈, 바뀌는 데이터와 임시 파일, 부팅·장치·커널 정보의 다섯 묶음으로 나눠, 묶음마다 무엇이 들어 있는지 보이는 도식'
const svgName = '표준 디렉터리 열둘이 쓰임에 따라 다섯 묶음으로 나뉘어 있다'
const expectedScenarios = [
  {
    id: 'programs', label: '명령과 라이브러리', nodes: members.programs,
    caption: '누구나 쓰는 기본 명령은 /bin, 시스템을 관리하는 명령은 /sbin, 그 명령들이 불러 쓰는 라이브러리는 /lib에 있다. /usr도 명령과 라이브러리 같은 읽기 전용 데이터를 두며, 이름이 user를 닮았지만 사용자의 파일을 두는 곳이 아니다.',
  },
  {
    id: 'config', label: '설정', nodes: members.config,
    caption: '시스템의 설정 파일, 곧 프로그램이 어떻게 동작할지 정해 적어 둔 파일은 /etc에 둔다.',
  },
  {
    id: 'users', label: '사용자의 홈', nodes: members.users,
    caption: '사용자마다의 홈 디렉터리는 /home 아래에 하나씩 있고(user1이면 /home/user1), 관리자 root의 홈 디렉터리만은 루트 디렉터리 바로 안의 /root다.',
  },
  {
    id: 'data', label: '바뀌는 데이터', nodes: members.data,
    caption: '로그처럼 시스템이 동작하면서 내용이 바뀌는 데이터는 /var에, 프로그램이 잠깐 쓰고 버리는 임시 파일은 /tmp에 둔다. /tmp의 파일은 컴퓨터를 다시 켤 때 지워질 수 있다.',
  },
  {
    id: 'system', label: '부팅·장치·커널', nodes: members.system,
    caption: '부팅에 쓰는 파일은 /boot, 디스크 같은 장치를 가리키는 장치 파일은 /dev에 있다. /proc의 파일은 커널이 실행 중인 프로세스와 커널 자신의 정보를 그때그때 파일 꼴로 보여 주는 것이다.',
  },
]

const tallBox: [number, number, number, number] = [0, 0, 280, 296]
const wideBox: [number, number, number, number] = [0, 0, 440, 152]

function diagram() {
  return screen.getByRole('img', { name: svgName })
}

async function selectScenario(label: string) {
  await act(async () => { await userEvent.click(screen.getByRole('button', { name: label })) })
}

function readBox(rect: Element, id = ''): SvgBox {
  return {
    id,
    x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
  }
}

function nodeBox(id: string) {
  return readBox(diagram().querySelector(`[data-node="${id}"] rect`)!, id)
}

function groupBox(id: string) {
  return readBox(diagram().querySelector(`[data-group="${id}"]`)!, id)
}

function overlaps(a: SvgBox, b: SvgBox) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function contains(outer: SvgBox, inner: SvgBox) {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height
}

// 그룹 라벨(글자 크기 9)이 차지하는 상자. 반각 글자가 화면에서 더 넓게 그려지는 것을 생각해 폭을 1.15배로 잡는다.
function labelBox(text: Element, id: string): SvgBox {
  const width = estimateTextWidth(text.textContent!, 9) * 1.15
  return { id, x: Number(text.getAttribute('x')), y: Number(text.getAttribute('y')) - 9, width, height: 9 }
}

function brightNodes() {
  return Array.from(diagram().querySelectorAll('[data-node][opacity="1"]'), (element) => element.getAttribute('data-node')!)
}

// 노드·그룹이 지정한 자리에 있고, viewBox 안이며, 라벨이 상자 안에 들어가고, 노드는 자기 그룹 안에만 있다.
function expectLayout(
  places: Record<string, Box>,
  groups: Record<GroupId, Box & { labelX: number, labelY: number }>,
  viewBox: [number, number, number, number],
) {
  const boxes = Array.from(diagram().querySelectorAll('rect'), (rect) => readBox(rect, rect.getAttribute('data-group') ?? rect.parentElement?.getAttribute('data-node') ?? ''))
  expect(boxes).toHaveLength(nodeIds.length + groupIds.length)
  expect(boxesOutsideViewBox(boxes, viewBox)).toEqual([])

  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const box = nodeBox(id)
    expect({ x: box.x, y: box.y, width: box.width, height: box.height }, id).toEqual(places[id])
    expect(node.querySelector('text')!.textContent).toBe(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(node.querySelector('rect')).toHaveClass('stroke-disabled')
    expect(estimateTextWidth(label, 10) * 1.15 + 12, `${id} ${label}`).toBeLessThanOrEqual(box.width)
  }
  for (let i = 0; i < nodeIds.length; i += 1) {
    for (let j = i + 1; j < nodeIds.length; j += 1) {
      expect(overlaps(nodeBox(nodeIds[i]), nodeBox(nodeIds[j])), `${nodeIds[i]} ↔ ${nodeIds[j]}`).toBe(false)
    }
  }

  const labelBoxes = groupIds.map((id) => labelBox(diagram().querySelector(`[data-group-label="${id}"]`)!, id))
  for (const id of groupIds) {
    const box = groupBox(id)
    const { labelX, labelY, ...rest } = groups[id]
    expect({ x: box.x, y: box.y, width: box.width, height: box.height }, id).toEqual(rest)
    const label = diagram().querySelector(`[data-group-label="${id}"]`)!
    expect(label.textContent).toBe(groupLabels[id])
    expect(label).toHaveAttribute('x', String(labelX))
    expect(label).toHaveAttribute('y', String(labelY))
    expect(label).toHaveAttribute('font-size', '9')
    expect(label.closest('[opacity]')).toBeNull()
    const text = labelBox(label, id)
    expect(contains(box, text), `${id} 라벨이 그룹 안`).toBe(true)
    for (const node of nodeIds.map(nodeBox)) expect(overlaps(text, node), `${id} 라벨 ↔ ${node.id}`).toBe(false)
    for (const other of labelBoxes.filter((item) => item.id !== id)) expect(overlaps(text, other), `${id} ↔ ${other.id}`).toBe(false)
    for (const other of groupIds.filter((item) => item !== id)) expect(overlaps(box, groupBox(other)), `${id} ↔ ${other}`).toBe(false)
    for (const node of nodeIds) expect(contains(box, nodeBox(node)), `${id} ⊃ ${node}`).toBe(members[id].includes(node))
  }
  expect(diagram().querySelector('[class*="green"], [class*="red"], [class*="amber"], [class*="orange"], [class*="diagram-"]')).toBeNull()
}

async function expectScenario(scenario: typeof expectedScenarios[number], container: HTMLElement) {
  await selectScenario(scenario.label)

  for (const element of diagram().querySelectorAll('[data-node]')) {
    const id = element.getAttribute('data-node')!
    expect(element, id).toHaveAttribute('opacity', scenario.nodes.includes(id) ? '1' : '0.25')
  }
  for (const group of diagram().querySelectorAll('[data-group]')) expect(group.closest('[opacity]')).toBeNull()
  expect(diagram().querySelectorAll('path, [data-note]')).toHaveLength(0)
  expect(container.querySelector('figcaption')!.textContent).toBe(scenario.caption)
  expect(container.querySelector('figcaption')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
}

// 요점: 「사용자의 홈」에서 선명한 디렉터리는 /home과 /root 둘뿐이다. 「명령과 라이브러리」에는 /usr가 있고 /home이 없다.
// 다섯 시나리오의 선명한 노드를 합하면 열두 디렉터리가 빠짐없이 한 번씩 나온다.
async function expectPoint() {
  const body = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === anchorConceptId)!.paragraphs.join('\n')
  const label = (id: string) => labels[id as keyof typeof labels]
  const seen: string[] = []
  for (const { label: button } of expectedScenarios) {
    await selectScenario(button)
    seen.push(...brightNodes())
  }
  expect([...seen].sort()).toEqual([...nodeIds].sort())

  await selectScenario('사용자의 홈')
  expect(brightNodes().map(label).sort()).toEqual(['/home', '/root'])
  await selectScenario('명령과 라이브러리')
  expect(brightNodes().map(label)).toContain('/usr')
  expect(brightNodes().map(label)).not.toContain('/home')

  expect(body).toContain('명령과 라이브러리는 `/bin`·`/sbin`·`/lib`·`/usr`, 설정은 `/etc`, 사용자의 홈은 `/home`·`/root`, 바뀌는 데이터와 임시 파일은 `/var`·`/tmp`, 부팅·장치·커널 정보는 `/boot`·`/dev`·`/proc`에 있다')
  for (const id of nodeIds) expect(body).toContain(`- **${label(id)}**`)
}

describe('StandardDirectoriesDiagram', () => {
  it('물음형 제목을 헤딩 없이 시나리오 버튼보다 앞에 보인다', () => {
    render(<StandardDirectoriesDiagram />)
    const title = screen.getByText(question)

    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(title.compareDocumentPosition(screen.getByRole('button', { name: '전체' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 노드가 모두 선명하고 선·곁말 없이 선택 안내가 나온다', () => {
    const { container } = render(<StandardDirectoriesDiagram />)

    expect(Array.from(diagram().querySelectorAll('[data-node]'), (element) => element.getAttribute('data-node'))).toEqual(nodeIds)
    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(diagram().querySelectorAll('path, [data-note]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it.each(expectedScenarios)('$label: 그 묶음의 디렉터리만 선명하고 그룹 박스는 흐려지지 않는다', async (scenario) => {
    const { container } = render(<StandardDirectoriesDiagram />)
    await expectScenario(scenario, container)
  })

  it('시나리오를 바꾸고 전체를 누르면 초기 상태로 돌아온다', async () => {
    const { container } = render(<StandardDirectoriesDiagram />)
    for (const scenario of expectedScenarios) {
      await selectScenario(scenario.label)
      expect(brightNodes()).toEqual(scenario.nodes)
    }
    await selectScenario('전체')

    for (const element of diagram().querySelectorAll('[data-node]')) expect(element).toHaveAttribute('opacity', '1')
    expect(container.querySelector('figcaption')!.textContent).toBe(idleCaption)
  })

  it('노드·그룹이 280×296 viewBox 안에 있고 모바일 너비 보정을 유지한다', () => {
    render(<StandardDirectoriesDiagram />)

    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 296')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expect(diagram().parentElement).not.toHaveClass('mx-auto')
    expectLayout(tallNodes, tallGroups, tallBox)
  })

  it('사용자의 홈은 /home과 /root뿐이고, 다섯 묶음이 열두 디렉터리를 한 번씩 덮는다', async () => {
    render(<StandardDirectoriesDiagram />)
    await expectPoint()
  })

  it('JSON과 컴포넌트의 시나리오 id가 같고 지정한 문구와 존재하는 근거 개념을 JSON에서 읽는다', () => {
    render(<StandardDirectoriesDiagram />)
    const text = visualsByTopicId[topicId].diagrams['standard-directories']
    const ids = standardDirectoriesScenarios.map(({ id }) => id).sort()
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
      const scenario = standardDirectoriesScenarios.find(({ id }) => id === expected.id)!
      expect(wording).toEqual({ id: expected.id, label: expected.label, caption: expected.caption, sources: [anchorConceptId] })
      expect(scenario.label).toBe(wording.label)
      expect(scenario.caption).toBe(wording.caption)
      expect(scenario.nodes).toEqual(expected.nodes)
      expect(scenario.paths).toEqual([])
    }
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) {
      expect(conceptIds).toContain(source)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 표준 디렉터리 개념 본문 바로 뒤에 도식을 붙인다', (headingLevel) => {
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

    it('440×152 viewBox를 w-full 래퍼 하나로 그린다', () => {
      render(<StandardDirectoriesDiagram />)

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 152')
      expect(diagram()).toHaveAttribute('class', 'block h-auto w-full')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expect(diagram().parentElement).not.toHaveClass('max-w-[380px]', '-mx-4')
    })

    it('노드·그룹 id 집합이 세로형과 같다', () => {
      const { change } = mockMatchMedia(false)
      render(<StandardDirectoriesDiagram />)
      const ids = (selector: string, attribute: string) => Array.from(diagram().querySelectorAll(selector), (element) => element.getAttribute(attribute)!).sort()
      const tallNodeIds = ids('[data-node]', 'data-node')
      const tallGroupIds = ids('[data-group]', 'data-group')

      act(() => change(true))

      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 152')
      expect(ids('[data-node]', 'data-node')).toEqual(tallNodeIds)
      expect(ids('[data-group]', 'data-group')).toEqual(tallGroupIds)
      expect(tallGroupIds).toEqual([...groupIds].sort())
    })

    it('노드·그룹이 440×152 viewBox 안에 있고 라벨이 자기 상자 안에 들어간다', () => {
      render(<StandardDirectoriesDiagram />)
      expectLayout(wideNodes, wideGroups, wideBox)
    })

    it.each(expectedScenarios)('$label: 세로형과 같은 노드·캡션을 보인다', async (scenario) => {
      const { container } = render(<StandardDirectoriesDiagram />)
      await expectScenario(scenario, container)
    })

    it('사용자의 홈은 /home과 /root뿐이고, 다섯 묶음이 열두 디렉터리를 한 번씩 덮는다', async () => {
      render(<StandardDirectoriesDiagram />)
      await expectPoint()
    })

    it('세로형에서 고른 시나리오가 폭을 바꾸어도 유지된다', async () => {
      const { change } = mockMatchMedia(false)
      const { container } = render(<StandardDirectoriesDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 280 296')
      await selectScenario('사용자의 홈')
      const caption = container.querySelector('figcaption')!.textContent

      act(() => change(true))

      expect(diagram().getAttribute('viewBox')!.split(' ').map(Number)[2]).toBe(440)
      expect(screen.getByRole('button', { name: '사용자의 홈' })).toHaveAttribute('aria-pressed', 'true')
      expect(container.querySelector('figcaption')!.textContent).toBe(caption)
      expect(brightNodes()).toEqual(['home', 'root'])
      expect(nodeBox('home').x).toBe(wideNodes.home.x)
    })
  })
})
