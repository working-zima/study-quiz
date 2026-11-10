import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { AppInsightsDiagram, appInsightsScenarios } from './AppInsightsDiagram'

const topicId = 'azure-monitoring'
const conceptId = `${topicId}.application-insights`
const labels = { user: '사용자', test: '가용성 테스트', 'web-app': '웹 앱 1', database: '데이터베이스', 'app-insights': 'Application Insights' }
const notes = { 'requests-note': '응답 시간·실패율·페이지 로드 시간', 'dependency-note': '호출과 성능', 'availability-note': '사용자가 적을 때도' }
const figureName = '사용자와 가용성 테스트가 웹 앱 1에 요청을 보내고, 웹 앱 1이 데이터베이스를 부르며 Application Insights가 앱의 요청과 성능을 살피는 모습'
const svgName = '사용자와 가용성 테스트가 웹 앱 1로 이어지고, 웹 앱 1에서 데이터베이스와 Application Insights로 이어진다'
const scenarios = [
  { id: 'requests', label: '사용자 요청', nodes: ['user', 'web-app', 'app-insights'], paths: ['user-to-app', 'app-to-ai'], note: 'requests-note' },
  { id: 'dependency', label: '다른 서비스 호출', nodes: ['web-app', 'database', 'app-insights'], paths: ['app-to-db', 'app-to-ai'], note: 'dependency-note' },
  { id: 'availability', label: '가용성 테스트', nodes: ['test', 'web-app', 'app-insights'], paths: ['test-to-app', 'app-to-ai'], note: 'availability-note' },
]

function diagram() { return screen.getByRole('img', { name: svgName }) }
async function select(label: string) { await act(async () => userEvent.click(screen.getByRole('button', { name: label }))) }
function ids(selector: string, attribute: string) { return Array.from(diagram().querySelectorAll(selector), (node) => node.getAttribute(attribute)!).sort() }
function box(element: Element): SvgBox {
  return { id: element.parentElement?.getAttribute('data-node') ?? '', x: Number(element.getAttribute('x')), y: Number(element.getAttribute('y')), width: Number(element.getAttribute('width')), height: Number(element.getAttribute('height')) }
}
function expectLayout(viewBox: [number, number, number, number]) {
  expect(boxesOutsideViewBox(Array.from(diagram().querySelectorAll('rect'), box), viewBox)).toEqual([])
  for (const [id, label] of Object.entries(labels)) {
    const node = diagram().querySelector(`[data-node="${id}"]`)!
    expect(node.querySelector('text')).toHaveTextContent(label)
    expect(estimateTextWidth(label, 10) * 1.15 + 12).toBeLessThanOrEqual(box(node.querySelector('rect')!).width)
  }
}

describe('AppInsightsDiagram', () => {
  it('처음에는 모든 노드가 선명하고 경로와 곁말은 숨긴다', () => {
    render(<AppInsightsDiagram />)
    expect(screen.getByText('Application Insights는 웹 앱에서 무엇을 볼까?').tagName).toBe('P')
    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(ids('[data-path]', 'data-path')).toEqual([])
    expect(ids('[data-note]', 'data-note')).toEqual([])
  })

  it.each(scenarios)('$label 장면은 정한 노드·경로·곁말을 보인다', async (scenario) => {
    render(<AppInsightsDiagram />)
    await select(scenario.label)
    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', scenario.nodes.includes(node.getAttribute('data-node')!) ? '1' : '0.25')
    expect(ids('[data-path]', 'data-path')).toEqual([...scenario.paths].sort())
    expect(ids('[data-note]', 'data-note')).toEqual([scenario.note])
    expect(diagram().querySelector(`[data-note="${scenario.note}"]`)).toHaveTextContent(notes[scenario.note as keyof typeof notes])
    expect(ids('[data-path]', 'data-path')).toContain('app-to-ai')
  })

  it('사용자·가용성 테스트·데이터베이스는 각자 맡은 장면에서만 선명하다', async () => {
    render(<AppInsightsDiagram />)
    for (const [label, bright] of [['사용자 요청', 'user'], ['다른 서비스 호출', 'database'], ['가용성 테스트', 'test']] as const) {
      await select(label)
      for (const id of ['user', 'database', 'test']) expect(diagram().querySelector(`[data-node="${id}"]`)).toHaveAttribute('opacity', id === bright ? '1' : '0.25')
    }
  })

  it('280×228 세로형에서 모든 라벨이 상자와 viewBox 안에 든다', () => {
    render(<AppInsightsDiagram />)
    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 228')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expectLayout([0, 0, 280, 228])
  })

  it('JSON 문구와 근거 개념을 읽고 본문의 예를 그대로 쓴다', () => {
    const text = visualsByTopicId[topicId].diagrams['app-insights']
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === conceptId)!
    const body = concept.paragraphs.join(' ')
    expect(text.label).toBe(figureName)
    expect(text.svgLabel).toBe(svgName)
    expect(text.nodes).toEqual(labels)
    expect(text.notes).toEqual(notes)
    expect(appInsightsScenarios.map(({ id }) => id)).toEqual(scenarios.map(({ id }) => id))
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(source).toBe(conceptId)
    for (const fact of ['사용자', '웹 앱 1', '데이터베이스', '가용성 테스트', '응답 시간', '실패율', '페이지 로드 시간', '종속성']) expect(body, fact).toContain(fact)
    expect(body).not.toContain('의존성')
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 도식이 표보다 먼저 붙는다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === conceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figures = screen.getAllByRole('figure')
    expect(figures[0]).toHaveAttribute('aria-label', figureName)
    expect(figures[0].closest('article')).toHaveAttribute('id', conceptId)
    expect(within(figures[0]).queryByRole('heading')).toBeNull()
  })

  describe('가로형', () => {
    beforeEach(() => {
      vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, media: WIDE_DIAGRAM_QUERY, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
    })
    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('440×152 viewBox와 w-full 래퍼를 쓴다', () => {
      render(<AppInsightsDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 152')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expectLayout([0, 0, 440, 152])
    })

    it.each(scenarios)('$label 장면이 세로형과 같은 노드·경로를 보인다', async (scenario) => {
      render(<AppInsightsDiagram />)
      await select(scenario.label)
      expect(ids('[data-path]', 'data-path')).toEqual([...scenario.paths].sort())
      expect(ids('[data-note]', 'data-note')).toEqual([scenario.note])
    })
  })
})
