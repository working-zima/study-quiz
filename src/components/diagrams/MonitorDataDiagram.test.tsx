import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { WIDE_DIAGRAM_QUERY } from '../../hooks/useWideDiagram'
import { boxesOutsideViewBox, estimateTextWidth, type SvgBox } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { MonitorDataDiagram, monitorDataScenarios } from './MonitorDataDiagram'

const topicId = 'azure-monitoring'
const conceptId = `${topicId}.azure-monitor`
const labels = {
  'web-app': '웹 앱 1',
  'vm-1': 'VM 1',
  onprem: '회사 데이터 센터의 서버',
  metrics: '메트릭',
  logs: '로그',
  analyze: '쿼리로 분석',
  alerts: '경고',
}
const groupLabels = { 'g-sources': '데이터가 나오는 곳', 'g-monitor': 'Azure Monitor' }
const noteLabels = {
  'collect-note': 'Azure 밖의 서버까지',
  'metrics-note': '정해진 간격으로 잰 수치',
  'logs-note': '일어난 일의 기록',
}
const figureName = '웹 앱 1과 VM 1, 회사 데이터 센터의 서버에서 메트릭과 로그를 모아 쿼리로 분석하거나 경고에 쓰는 모습'
const svgName = '데이터가 나오는 곳에 웹 앱 1과 VM 1, 회사 데이터 센터의 서버가 있고, Azure Monitor 안에 메트릭과 로그가 있으며, 쿼리로 분석과 경고로 이어진다'
const question = 'Azure Monitor는 무엇을 어디서 모아 어디에 쓸까?'
const scenarios = [
  {
    id: 'collect', label: '모은다',
    nodes: ['web-app', 'vm-1', 'onprem', 'metrics', 'logs'],
    paths: ['vm-to-metrics', 'app-to-logs', 'onprem-to-logs'], note: 'collect-note',
    caption: 'Azure Monitor는 Azure의 리소스와 앱에서 데이터를 모은다. 회사 데이터 센터의 서버는 Azure Arc로 연결해 Azure 리소스와 나란히 지켜보며, 성능 데이터와 일어난 일의 기록을 모을 수 있다.',
  },
  {
    id: 'metrics', label: '메트릭', nodes: ['vm-1', 'metrics', 'alerts'],
    paths: ['vm-to-metrics', 'metrics-to-alerts'], note: 'metrics-note',
    caption: 'VM 1의 CPU 사용률 같은 메트릭은 정해진 간격으로 잰 수치다. 빠르게 변화를 알아차리고 정해 둔 기준을 넘을 때 경고하는 데 알맞다. 이 장면은 메트릭 경고의 예이며, 로그에도 경고를 걸 수 있다.',
  },
  {
    id: 'logs', label: '로그', nodes: ['web-app', 'logs', 'analyze'],
    paths: ['app-to-logs', 'logs-to-analyze'], note: 'logs-note',
    caption: '웹 앱 1의 오류 기록 같은 로그는 일어난 일을 시각과 함께 적은 기록이다. 쿼리로 원하는 기록을 찾아 문제의 원인을 분석하며, 로그에도 조건을 걸어 경고를 낼 수 있다.',
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
    id: element.getAttribute('data-group') ?? element.parentElement?.getAttribute('data-node') ?? '',
    x: Number(element.getAttribute('x')),
    y: Number(element.getAttribute('y')),
    width: Number(element.getAttribute('width')),
    height: Number(element.getAttribute('height')),
  }
}

function inside(inner: SvgBox, outer: SvgBox) {
  return inner.x >= outer.x && inner.y >= outer.y
    && inner.x + inner.width <= outer.x + outer.width
    && inner.y + inner.height <= outer.y + outer.height
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
  for (const [id, label] of Object.entries(groupLabels)) {
    const group = diagram().querySelector(`[data-group="${id}"]`)!
    const text = diagram().querySelector(`[data-group-label="${id}"]`)!
    expect(text).toHaveTextContent(label)
    expect(text).toHaveAttribute('font-size', '9')
    expect(Number(text.getAttribute('x')) + estimateTextWidth(label, 9) * 1.15).toBeLessThanOrEqual(box(group).x + box(group).width)
  }
  const sourceGroup = box(diagram().querySelector('[data-group="g-sources"]')!)
  const monitorGroup = box(diagram().querySelector('[data-group="g-monitor"]')!)
  for (const id of ['web-app', 'vm-1', 'onprem']) expect(inside(box(diagram().querySelector(`[data-node="${id}"] rect`)!), sourceGroup)).toBe(true)
  for (const id of ['metrics', 'logs']) expect(inside(box(diagram().querySelector(`[data-node="${id}"] rect`)!), monitorGroup)).toBe(true)
  for (const id of ['analyze', 'alerts']) {
    const node = box(diagram().querySelector(`[data-node="${id}"] rect`)!)
    expect(inside(node, sourceGroup)).toBe(false)
    expect(inside(node, monitorGroup)).toBe(false)
  }
}

describe('MonitorDataDiagram', () => {
  it('물음형 제목을 헤딩 없이 버튼 앞에 보인다', () => {
    render(<MonitorDataDiagram />)
    const title = screen.getByText(question)
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('text-sm', 'text-title')
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('처음에는 모든 노드가 선명하고 경로와 곁말은 숨긴다', () => {
    const { container } = render(<MonitorDataDiagram />)
    for (const node of diagram().querySelectorAll('[data-node]')) expect(node).toHaveAttribute('opacity', '1')
    expect(ids('[data-path]', 'data-path')).toEqual([])
    expect(ids('[data-note]', 'data-note')).toEqual([])
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('figcaption')).toHaveTextContent('버튼을 고르면')
  })

  it.each(scenarios)('$label 장면은 정한 노드·경로·곁말과 캡션을 보인다', async (scenario) => {
    const { container } = render(<MonitorDataDiagram />)
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

  it('280×336 세로형에서 그룹 소속과 라벨 폭을 지킨다', () => {
    render(<MonitorDataDiagram />)
    expect(diagram()).toHaveAttribute('viewBox', '0 0 280 336')
    expect(diagram().parentElement).toHaveClass('-mx-4', 'w-full', 'max-w-[380px]', 'max-sm:w-[calc(100%+2rem)]', 'sm:mx-0')
    expectLayout([0, 0, 280, 336])
  })

  it('모으기 장면에서는 두 쓰임이 흐리고 온-프레미스 서버는 그 장면에서만 선명하다', async () => {
    render(<MonitorDataDiagram />)
    await select('모은다')
    for (const id of ['analyze', 'alerts']) expect(diagram().querySelector(`[data-node="${id}"]`)).toHaveAttribute('opacity', '0.25')
    expect(diagram().querySelector('[data-node="onprem"]')).toHaveAttribute('opacity', '1')
    await select('메트릭')
    expect(diagram().querySelector('[data-node="onprem"]')).toHaveAttribute('opacity', '0.25')
    await select('로그')
    expect(diagram().querySelector('[data-node="onprem"]')).toHaveAttribute('opacity', '0.25')
  })

  it('JSON 문구·시나리오와 존재하는 근거 개념을 그대로 읽는다', () => {
    render(<MonitorDataDiagram />)
    const text = visualsByTopicId[topicId].diagrams['monitor-data']
    const conceptIds = topics.find(({ id }) => id === topicId)!.concepts.map(({ id }) => id)
    expect(text.nodes).toEqual(labels)
    expect(text.groups).toEqual(groupLabels)
    expect(text.notes).toEqual(noteLabels)
    expect(text.question).toBe(question)
    expect(text.label).toBe(figureName)
    expect(text.svgLabel).toBe(svgName)
    expect(monitorDataScenarios.map(({ id }) => id)).toEqual(scenarios.map(({ id }) => id))
    for (const source of [...text.sources, ...text.scenarios.flatMap(({ sources }) => sources)]) expect(conceptIds).toContain(source)
  })

  it('도식의 예와 핵심 말이 개념 본문에 있다', () => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === conceptId)!
    const body = concept.paragraphs.join(' ')
    for (const fact of ['웹 앱 1', 'VM 1', '회사 데이터 센터의 서버', 'CPU 사용률', '오류 기록', 'Azure Arc', '메트릭', '로그', '쿼리', '경고']) expect(body, fact).toContain(fact)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 Azure Monitor 본문 바로 뒤에 붙는다', (headingLevel) => {
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

    it('440×232 viewBox와 w-full 래퍼를 쓴다', () => {
      render(<MonitorDataDiagram />)
      expect(diagram()).toHaveAttribute('viewBox', '0 0 440 232')
      expect(diagram().parentElement).toHaveAttribute('class', 'w-full')
      expectLayout([0, 0, 440, 232])
    })

    it.each(scenarios)('$label 장면이 세로형과 같은 노드·경로·곁말을 보인다', async (scenario) => {
      render(<MonitorDataDiagram />)
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
