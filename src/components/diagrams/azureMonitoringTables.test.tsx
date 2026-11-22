import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { ConceptList } from '../ConceptList'
import { ComparisonTableFigure } from './ComparisonTableFigure'
import { MonitorFeaturesTable, ToolChoiceTable } from './azureMonitoringTables'

const topicId = 'azure-monitoring'
const conceptId = `${topicId}.application-insights`
const monitorConceptId = `${topicId}.azure-monitor`
const toolsConceptId = `${topicId}.monitoring-tools`
const monitorDataLabel = '웹 앱 1과 VM 1, 회사 데이터 센터의 서버에서 메트릭과 로그를 모아 쿼리로 분석하거나 경고에 쓰는 모습'
const appInsightsLabel = '사용자와 가용성 테스트가 웹 앱 1에 요청을 보내고, 웹 앱 1이 데이터베이스를 부르며 Application Insights가 앱의 요청과 성능을 살피는 모습'
const monitoringToolsLabel = 'Azure 쪽의 서비스와 지역은 Azure Service Health가, 내 구독의 VM 1은 Azure Advisor가, VM 1과 웹 앱 1이 내놓는 데이터는 Azure Monitor가 살피는 모습'
const expected = {
  id: 'monitor-features',
  label: 'Azure Monitor의 네 기능 견주기',
  columns: ['기능', '보는 것', '이럴 때 연다'],
  columnWidths: ['34%', '33%', '33%'],
  sources: [`${topicId}.activity-log`, `${topicId}.log-analytics`, `${topicId}.monitor-alerts`, conceptId],
  shortcut: { id: 'monitor-features-table', label: 'Azure Monitor 기능 비교표로 바로 가기' },
  rows: [
    { header: '활동 로그', cells: ['리소스에 한 관리 작업에서 누가 언제 무엇을 했는지', '누가 VM 1을 중지했는지 알고 싶을 때'] },
    { header: 'Log Analytics', cells: ['작업 영역에 모인 로그를 쿼리로 골라 분석', '여러 VM의 오류 기록을 골라 견주고 싶을 때'] },
    { header: 'Azure Monitor 경고', cells: ['정해 둔 조건이 맞을 때 담당자에게 알림', 'CPU 사용률이 기준을 넘으면 알고 싶을 때'] },
    { header: 'Application Insights', cells: ['웹 앱 안의 요청과 응답 시간, 실패', '사용자가 겪는 앱의 느림과 오류를 찾고 싶을 때'] },
  ],
}
const toolChoice = {
  id: 'tool-choice',
  label: '모니터링 도구 셋 고르기',
  columns: ['궁금한 것', '여는 도구'],
  columnWidths: ['55%', '45%'],
  sources: [toolsConceptId],
  rows: [
    { header: '지역에 생긴 장애와 계획된 유지 관리', cells: ['Azure Service Health'] },
    { header: 'VM의 비용을 줄일 권장 사항', cells: ['Azure Advisor'] },
    { header: 'VM의 CPU 사용률 추이와 웹 앱의 오류', cells: ['Azure Monitor'] },
  ],
}

function table() { return visualsByTopicId[topicId].tables[expected.id] }
function toolChoiceTable() { return visualsByTopicId[topicId].tables[toolChoice.id] }
function topicConcepts() { return topics.find(({ id }) => id === topicId)!.concepts }
function conceptOf(id: string) { return topicConcepts().find((concept) => concept.id === id)! }

describe('Azure Monitor 기능 비교표', () => {
  it('이름·열·열 폭·근거·바로 가기가 지정한 값이다', () => {
    expect(table().label).toBe(expected.label)
    expect(table().columns).toEqual(expected.columns)
    expect(table().columnWidths).toEqual(expected.columnWidths)
    expect(table().sources).toEqual(expected.sources)
    expect(table().shortcut).toEqual(expected.shortcut)
    render(<MonitorFeaturesTable />)
    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(expected.columns)
    expect(Array.from(screen.getByRole('table').querySelectorAll('colgroup col'), (col) => (col as HTMLElement).style.width)).toEqual(expected.columnWidths)
    expect(screen.getByRole('figure', { name: expected.label })).toHaveAttribute('id', expected.shortcut.id)
  })

  it('행 순서와 칸 문구가 지정한 내용 그대로다', () => {
    expect(table().rows).toEqual(expected.rows)
    render(<ComparisonTableFigure table={table()} />)
    expect(screen.getAllByRole('rowheader').map((header) => header.textContent)).toEqual(expected.rows.map(({ header }) => header))
    for (const { header, cells } of expected.rows) {
      const row = screen.getByRole('rowheader', { name: header }).closest('tr')!
      expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(cells)
    }
  })

  it('표의 사실이 개념 6~9 본문에 있다', () => {
    const bodyOf = (id: string) => conceptOf(id).paragraphs.join(' ')
    for (const fact of ['관리 작업', '누가', '언제', '무엇']) expect(bodyOf(`${topicId}.activity-log`), fact).toContain(fact)
    for (const fact of ['Log Analytics 작업 영역', '쿼리', '여러 VM', '오류 기록']) expect(bodyOf(`${topicId}.log-analytics`), fact).toContain(fact)
    for (const fact of ['정해 둔 조건', 'CPU 사용률', '담당자']) expect(bodyOf(`${topicId}.monitor-alerts`), fact).toContain(fact)
    for (const fact of ['웹 앱', '요청', '응답 시간', '실패']) expect(bodyOf(conceptId), fact).toContain(fact)
  })

  // 표가 Azure Monitor 소개 바로 뒤로 옮겨 가므로, 소개 본문이 네 기능을 이름으로 먼저 세워 두어야 표가 낯설지 않다.
  it('네 기능의 이름이 Azure Monitor 소개 본문에 모두 나온다', () => {
    const body = conceptOf(monitorConceptId).paragraphs.join(' ')
    for (const { header } of expected.rows) expect(body, header).toContain(header)
  })

  it('표 어디에도 O·X 한 글자 판정, 백틱, 가운뎃점이 없다', () => {
    for (const text of [...table().columns, ...table().rows.flatMap(({ header, cells }) => [header, ...cells])]) {
      expect(text.trim(), text).not.toMatch(/^[OX○×]$/u)
      expect(text, text).not.toMatch(/[`·]/u)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 Azure Monitor 소개의 도식 뒤, 그 개념의 맨 끝에 나온다', (headingLevel) => {
    render(<ConceptList concepts={[conceptOf(monitorConceptId)]} headingLevel={headingLevel} />)
    const figures = screen.getAllByRole('figure')
    expect(figures).toHaveLength(2)
    expect(figures[0]).toHaveAttribute('aria-label', monitorDataLabel)
    expect(figures[1]).toHaveAttribute('aria-label', expected.label)
    expect(figures[1].closest('article')).toHaveAttribute('id', monitorConceptId)
    expect(figures[1].closest('article')!.lastElementChild).toBe(figures[1])
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 Application Insights 끝에는 더 나오지 않고 그 개념의 도식만 남는다', (headingLevel) => {
    render(<ConceptList concepts={[conceptOf(conceptId)]} headingLevel={headingLevel} />)
    expect(screen.queryByRole('figure', { name: expected.label })).toBeNull()
    expect(screen.getAllByRole('figure').map((figure) => figure.getAttribute('aria-label'))).toEqual([appInsightsLabel])
  })

  it('주제 전체 본문에서 한 번만, 딸린 개념 넷보다 앞에 나오고 바로 가기 id를 가진 요소가 이 표 하나다', () => {
    render(<ConceptList concepts={topicConcepts()} headingLevel={2} />)
    const figure = screen.getByRole('figure', { name: expected.label })
    const monitor = document.getElementById(monitorConceptId)!

    expect(screen.getAllByRole('figure', { name: expected.label })).toHaveLength(1)
    expect(figure.closest('article')).toBe(monitor)
    expect(monitor.nextElementSibling!.firstElementChild).toHaveAttribute('id', `${topicId}.activity-log`)
    for (const source of expected.sources) {
      expect(figure.compareDocumentPosition(document.getElementById(source)!) & Node.DOCUMENT_POSITION_FOLLOWING, source).toBeTruthy()
    }
    expect(topicConcepts().map(({ id }) => id)).not.toContain(expected.shortcut.id)
    expect(document.querySelectorAll(`[id="${expected.shortcut.id}"]`)).toHaveLength(1)
    expect(document.getElementById(expected.shortcut.id)).toBe(figure)
  })
})

describe('모니터링 도구 선택표', () => {
  it('이름·열·열 폭·근거가 지정한 값이고 바로 가기를 두지 않는다', () => {
    expect(toolChoiceTable().label).toBe(toolChoice.label)
    expect(toolChoiceTable().columns).toEqual(toolChoice.columns)
    expect(toolChoiceTable().columnWidths).toEqual(toolChoice.columnWidths)
    expect(toolChoiceTable().sources).toEqual(toolChoice.sources)
    expect(toolChoiceTable().shortcut).toBeUndefined()
    render(<ToolChoiceTable />)
    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(toolChoice.columns)
    expect(Array.from(screen.getByRole('table').querySelectorAll('colgroup col'), (col) => (col as HTMLElement).style.width)).toEqual(toolChoice.columnWidths)
  })

  it('머리 행 아래 데이터 행이 셋이고, 행 순서와 칸 문구가 지정한 내용 그대로다', () => {
    expect(toolChoiceTable().rows).toEqual(toolChoice.rows)
    render(<ToolChoiceTable />)
    expect(screen.getAllByRole('row')).toHaveLength(4)
    expect(screen.getAllByRole('rowheader').map((header) => header.textContent)).toEqual(toolChoice.rows.map(({ header }) => header))
    for (const { header, cells } of toolChoice.rows) {
      const row = screen.getByRole('rowheader', { name: header }).closest('tr')!
      expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(cells)
    }
  })

  it('세 행이 서로 다른 도구를 가리키고, 도구 이름이 첫 도식의 도구 노드 이름과 같다', () => {
    const nodes = visualsByTopicId[topicId].diagrams['monitoring-tools'].nodes
    expect(toolChoiceTable().rows.map(({ cells }) => cells[0])).toEqual([nodes['service-health'], nodes.advisor, nodes.monitor])
  })

  // 첫 도식에서 VM 1과 웹 앱 1의 연결선이 같은 Azure Monitor로 모이는 것과 같은 말이다.
  it('VM의 CPU 사용률과 웹 앱의 오류는 한 행에서 같은 Azure Monitor를 가리킨다', () => {
    const rows = toolChoiceTable().rows.filter(({ header }) => header.includes('CPU 사용률') || header.includes('웹 앱'))
    expect(rows).toHaveLength(1)
    expect(rows[0].header).toMatch(/CPU 사용률.*웹 앱의 오류/u)
    expect(rows[0].cells).toEqual(['Azure Monitor'])
  })

  it('표의 사실이 첫 개념 본문(회사 A의 세 담당자)에 있다', () => {
    const body = conceptOf(toolsConceptId).paragraphs.join(' ')
    for (const fact of [
      '지역', '장애', '계획된 유지 관리', '비용을 줄', '권장 사항', 'CPU 사용률', '웹 앱', '오류',
      'Azure Service Health', 'Azure Advisor', 'Azure Monitor',
    ]) {
      expect(body, fact).toContain(fact)
    }
  })

  it('표 어디에도 O·X 한 글자 판정, 백틱, 가운뎃점이 없다', () => {
    for (const text of [...toolChoiceTable().columns, ...toolChoiceTable().rows.flatMap(({ header, cells }) => [header, ...cells])]) {
      expect(text.trim(), text).not.toMatch(/^[OX○×]$/u)
      expect(text, text).not.toMatch(/[`·]/u)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 첫 개념의 한 줄 요약 바로 아래, 본문과 도식보다 앞에 나온다', (headingLevel) => {
    const concept = conceptOf(toolsConceptId)
    expect(topicConcepts()[0]).toBe(concept)
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const article = screen.getByRole('article')
    const figure = screen.getByRole('figure', { name: toolChoice.label })
    const [head, second, body, last] = Array.from(article.children)

    expect(article.children).toHaveLength(4)
    expect(head.lastElementChild).toHaveTextContent(concept.summary)
    expect(second).toBe(figure)
    expect(body).toContainElement(screen.getByText(concept.paragraphs[0]))
    expect(last).toHaveAttribute('aria-label', monitoringToolsLabel)
    expect(screen.getAllByRole('figure', { name: toolChoice.label })).toHaveLength(1)
  })
})
