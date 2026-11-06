import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { AlertRuleDiagram, alertRuleScenarios } from './AlertRuleDiagram'

const topicId = 'azure-monitoring'
const conceptId = `${topicId}.monitor-alerts`
const labels = {
  'vm-1': 'VM 1', 'sh-event': 'Service Health 이벤트', rule: '경고 규칙',
  'action-group': '작업 그룹', email: '이메일', automation: '자동화',
}
const noteLabels = {
  'metric-note': 'CPU 사용률이 80%를 넘음',
  'service-note': '같은 작업 그룹',
  'automate-note': '자동화를 시작',
}
const figureName = 'VM 1의 메트릭이나 Service Health 이벤트가 경고 규칙의 조건에 맞으면 작업 그룹이 이메일을 보내거나 자동화를 시작하는 모습'
const svgName = 'VM 1과 Service Health 이벤트가 경고 규칙을 거쳐 작업 그룹으로 이어지고, 작업 그룹에서 이메일과 자동화로 갈라진다'
const scenarios = [
  { id: 'metric', label: '메트릭 경고', nodes: ['vm-1', 'rule', 'action-group', 'email'], paths: ['vm-to-rule', 'rule-to-group', 'group-to-email'], note: 'metric-note' },
  { id: 'service', label: 'Service Health 경고', nodes: ['sh-event', 'rule', 'action-group', 'email'], paths: ['sh-to-rule', 'rule-to-group', 'group-to-email'], note: 'service-note' },
  { id: 'automate', label: '자동화', nodes: ['rule', 'action-group', 'automation'], paths: ['rule-to-group', 'group-to-automation'], note: 'automate-note' },
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
    expect(estimateTextWidth(label, 10) * 1.15 + 12).toBeLessThanOrEqual(nodeBox.width)
  }
}

describe('AlertRuleDiagram', () => {
  it('처음에는 모든 노드가 선명하고 경로와 곁말은 숨긴다', () => {
    render(<AlertRuleDiagram />)
    expect(screen.getByText('경고는 언제 나고 누구에게 알릴까?').tagName).toBe('P')
    expect(screen.queryByRole('heading')).toBeNull()
    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(ids('[data-path]', 'data-path')).toEqual([])
    expect(ids('[data-note]', 'data-note')).toEqual([])
  })

  it.each(scenarios)('$label 장면은 정한 노드·경로·곁말을 보인다', async (scenario) => {
    render(<AlertRuleDiagram />)
    await select(scenario.label)
    for (const node of diagram().querySelectorAll('[data-node]')) {
      expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
    }
    expect(ids('[data-path]', 'data-path')).toEqual([...scenario.paths].sort())
    expect(ids('[data-note]', 'data-note')).toEqual([scenario.note])
    expect(diagram().querySelector(`[data-note="${scenario.note}"]`)).toHaveTextContent(noteLabels[scenario.note as keyof typeof noteLabels])
  })

  it('모든 신호가 경고 규칙을 거쳐 작업 그룹으로 간다', async () => {
    render(<AlertRuleDiagram />)
    for (const scenario of scenarios) {
      await select(scenario.label)
      expect(ids('[data-path]', 'data-path')).toContain('rule-to-group')
      expect(diagram().querySelector('[data-node="action-group"]')).toHaveAttribute('opacity', '1')
    }
    expect(Object.keys(visualsByTopicId[topicId].diagrams['alert-rule'].nodes)).not.toContain('signal-to-group')
    await select('Service Health 경고')
    expect(diagram().querySelector('[data-node="sh-event"]')).toHaveAttribute('opacity', '1')
    await select('메트릭 경고')
    expect(diagram().querySelector('[data-node="sh-event"]')).toHaveAttribute('opacity', '0.25')
    await select('자동화')
    expect(diagram().querySelector('[data-node="automation"]')).toHaveAttribute('opacity', '1')
  })

  it('280×272 세로형에서 모든 라벨이 상자와 viewBox 안에 든다', () => {
    render(<AlertRuleDiagram />)
    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 272')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expectLayout([0, 0, 280, 272])
  })

  it('JSON 문구와 근거 개념을 읽고 본문의 예를 그대로 쓴다', () => {
    const text = visualsByTopicId[topicId].diagrams['alert-rule']
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === conceptId)!
    const body = concept.paragraphs.join(' ')
    expect(text.label).toBe(figureName)
    expect(text.svgLabel).toBe(svgName)
    expect(text.nodes).toEqual(labels)
    expect(text.notes).toEqual(noteLabels)
    expect(alertRuleScenarios.map(({ id }) => id)).toEqual(scenarios.map(({ id }) => id))
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(source).toBe(conceptId)
    for (const fact of ['VM 1', 'CPU 사용률이 80%', '운영 팀', '이메일', '자동화', 'Service Health', '작업 그룹']) expect(body, fact).toContain(fact)
    expect(body).not.toContain('알리는 대신')
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 경고 개념의 맨 끝에 붙는다', (headingLevel) => {
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
      render(<AlertRuleDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 152')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expectLayout([0, 0, 440, 152])
    })

    it.each(scenarios)('$label 장면이 세로형과 같은 노드·경로를 보인다', async (scenario) => {
      render(<AlertRuleDiagram />)
      await select(scenario.label)
      expect(ids('[data-path]', 'data-path')).toEqual([...scenario.paths].sort())
      expect(ids('[data-note]', 'data-note')).toEqual([scenario.note])
    })
  })
})
