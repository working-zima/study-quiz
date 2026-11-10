import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { ActivityLogDiagram, activityLogScenarios } from './ActivityLogDiagram'

const topicId = 'azure-monitoring'
const conceptId = `${topicId}.activity-log`
const parentId = `${topicId}.azure-monitor`
const labels = {
  admin: '담당자', 'vm-1': 'VM 1', database: '데이터베이스',
  'activity-log': '활동 로그', diag: '진단 설정', 'resource-log': '리소스 로그',
}
const noteLabels = { 'manage-note': '누가·언제·무엇을', 'inside-note': '진단 설정이 있어야 모인다' }
const figureName = '담당자가 VM 1을 중지한 관리 작업은 활동 로그에 남고, VM 1의 앱이 데이터베이스에 보낸 요청은 진단 설정을 거쳐 리소스 로그에 남는 모습'
const svgName = '담당자에서 VM 1과 활동 로그로 이어지는 길과, VM 1에서 데이터베이스와 진단 설정을 거쳐 리소스 로그로 이어지는 길이 있다'
const question = '누가 VM을 중지했는지는 어디에 남을까?'
const scenarios = [
  {
    id: 'manage', label: '관리 작업', nodes: ['admin', 'vm-1', 'activity-log'],
    paths: ['stop-vm', 'vm-to-activity'], note: 'manage-note',
    caption: '담당자가 VM 1을 중지한 관리 작업은 따로 설정하지 않아도 활동 로그에 누가 언제 무엇을 했는지 남는다. 이 기록은 시스템이 만들기 때문에 사용자가 고치거나 지울 수 없다.',
  },
  {
    id: 'inside', label: '리소스 안의 일', nodes: ['vm-1', 'database', 'diag', 'resource-log'],
    paths: ['vm-to-db', 'db-to-diag', 'diag-to-log'], note: 'inside-note',
    caption: 'VM 1 안의 앱이 데이터베이스에 보낸 요청은 활동 로그가 아니라 데이터베이스의 리소스 로그에 남는다. 리소스 로그는 진단 설정을 해 두어야 모인다. 흐린 활동 로그는 꺼진 것이 아니라, 이 장면이 리소스 안의 일만 밝힌 것이다.',
  },
]

function diagram() {
  return screen.getByRole('img', { name: svgName })
}

async function select(label: string) {
  await act(async () => userEvent.click(screen.getByRole('button', { name: label })))
}

function ids(selector: string, attribute: string) {
  return Array.from(diagram().querySelectorAll(selector), (node) => node.getAttribute(attribute)!).sort()
}

function box(element: Element): SvgBox {
  return {
    id: element.parentElement?.getAttribute('data-node') ?? '',
    x: Number(element.getAttribute('x')), y: Number(element.getAttribute('y')),
    width: Number(element.getAttribute('width')), height: Number(element.getAttribute('height')),
  }
}

function expectLayout(viewBox: [number, number, number, number]) {
  const rectangles = Array.from(diagram().querySelectorAll('rect'), box)
  expect(boxesOutsideViewBox(rectangles, viewBox)).toEqual([])
  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    const nodeBox = box(node.querySelector('rect')!)
    expect(node.querySelector('text')).toHaveTextContent(label)
    expect(node.querySelector('text')).toHaveAttribute('font-size', '10')
    expect(estimateTextWidth(label, 10) * 1.15 + 12).toBeLessThanOrEqual(nodeBox.width)
  }
  expect(diagram().querySelectorAll('[data-group]')).toHaveLength(0)
}

describe('ActivityLogDiagram', () => {
  it('물음형 제목을 헤딩 없이 버튼 앞에 보인다', () => {
    render(<ActivityLogDiagram />)
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 모든 노드가 선명하고 경로와 곁말은 숨긴다', () => {
    const { container } = render(<ActivityLogDiagram />)
    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(ids('[data-path]', 'data-path')).toEqual([])
    expect(ids('[data-note]', 'data-note')).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')).toHaveTextContent('버튼을 고르면')
  })

  it.each(scenarios)('$label 장면은 정한 노드·경로·곁말과 캡션을 보인다', async (scenario) => {
    const { container } = render(<ActivityLogDiagram />)
    await select(scenario.label)
    for (const node of diagram().querySelectorAll('[data-node]')) {
      expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
    }
    expect(ids('[data-path]', 'data-path')).toEqual([...scenario.paths].sort())
    expect(ids('[data-note]', 'data-note')).toEqual([scenario.note])
    const note = diagram().querySelector(`[data-note="${scenario.note}"]`)!
    const noteLabel = noteLabels[scenario.note as keyof typeof noteLabels]
    const noteWidth = estimateTextWidth(noteLabel, 9) * 1.15
    const noteX = Number(note.getAttribute('x'))
    expect(note).toHaveTextContent(noteLabel)
    expect(noteX - noteWidth / 2).toBeGreaterThanOrEqual(0)
    expect(noteX + noteWidth / 2).toBeLessThanOrEqual(Number(diagram().getAttribute('viewBox')!.split(' ')[2]))
    expect(container.querySelector('figcaption')).toHaveTextContent(scenario.caption)
  })

  it('280×272 세로형에서 모든 라벨이 상자와 viewBox 안에 든다', () => {
    render(<ActivityLogDiagram />)
    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 272')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expectLayout([0, 0, 280, 272])
  })

  it('관리 작업과 리소스 안의 일을 서로 다른 기록으로 가른다', async () => {
    render(<ActivityLogDiagram />)
    await select('관리 작업')
    for (const id of ['diag', 'resource-log']) expect(diagram().querySelector(`[data-node="${id}"]`)).toHaveAttribute('opacity', '0.25')
    expect(ids('[data-path]', 'data-path')).toContain('stop-vm')
    expect(ids('[data-path]', 'data-path')).not.toContain('diag-to-log')
    await select('리소스 안의 일')
    for (const id of ['admin', 'activity-log']) expect(diagram().querySelector(`[data-node="${id}"]`)).toHaveAttribute('opacity', '0.25')
    expect(ids('[data-path]', 'data-path')).toContain('diag-to-log')
    expect(ids('[data-path]', 'data-path')).not.toContain('stop-vm')
  })

  it('JSON 문구·시나리오와 존재하는 근거 개념을 그대로 읽는다', () => {
    render(<ActivityLogDiagram />)
    const text = visualsByTopicId[topicId].diagrams['activity-log']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toBeUndefined()
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.label).toBe(figureName)
    expect(text.svgLabel).toBe(svgName)
    expect(activityLogScenarios.map(({ id }) => id)).toEqual(scenarios.map(({ id }) => id))
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it('도식의 예와 핵심 말이 개념 본문에 있다', () => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === conceptId)!
    const body = concept.paragraphs.join(' ')
    for (const fact of ['담당자', 'VM 1', '데이터베이스', '관리 작업', '활동 로그', '리소스 로그', '진단 설정', '누가', '언제', '무엇']) expect(body, fact).toContain(fact)
  })

  it('Azure Monitor 바로 뒤에 딸린 개념으로 놓인다', () => {
    const concepts = topics.find(({ id }) => id === topicId)!.concepts
    const index = concepts.findIndex(({ id }) => id === parentId)
    const concept = concepts[index + 1]
    expect(concept.id).toBe(conceptId)
    expect(concept.parentId).toBe(parentId)
    expect(concept.name).toBe('활동 로그')
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 활동 로그 본문 바로 뒤에 붙는다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === conceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figure = screen.getByRole('figure', { name: figureName })
    expect(figure.closest('article')).toHaveAttribute('id', conceptId)
    expect(figure.closest('article')!.lastElementChild).toBe(figure)
    expect(within(figure).queryByRole('heading')).toBeNull()
  })

  describe('가로형', () => {
    beforeEach(() => {
      vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, media: WIDE_DIAGRAM_QUERY, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
    })
    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×152 viewBox와 w-full 래퍼를 쓴다', () => {
      render(<ActivityLogDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 152')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expectLayout([0, 0, 440, 152])
    })

    it.each(scenarios)('$label 장면이 세로형과 같은 노드·경로·곁말을 보인다', async (scenario) => {
      render(<ActivityLogDiagram />)
      await select(scenario.label)
      expect(ids('[data-path]', 'data-path')).toEqual([...scenario.paths].sort())
      expect(ids('[data-note]', 'data-note')).toEqual([scenario.note])
      const note = diagram().querySelector(`[data-note="${scenario.note}"]`)!
      const noteWidth = estimateTextWidth(note.textContent!, 9) * 1.15
      const noteX = Number(note.getAttribute('x'))
      expect(noteX - noteWidth / 2).toBeGreaterThanOrEqual(0)
      expect(noteX + noteWidth / 2).toBeLessThanOrEqual(440)
      for (const node of diagram().querySelectorAll('[data-node]')) {
        expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
      }
    })
  })
})
