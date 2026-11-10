import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { ConceptList } from '../ConceptList'
import { ComparisonTableFigure } from './ComparisonTableFigure'
import { MonitorFeaturesTable } from './azureMonitoringTables'

const topicId = 'azure-monitoring'
const conceptId = `${topicId}.application-insights`
const expected = {
  id: 'monitor-features',
  label: 'Azure Monitor의 네 기능 견주기',
  columns: ['기능', '보는 것', '이럴 때 연다'],
  columnWidths: ['34%', '33%', '33%'],
  sources: [`${topicId}.activity-log`, `${topicId}.log-analytics`, `${topicId}.monitor-alerts`, conceptId],
  rows: [
    { header: '활동 로그', cells: ['리소스에 한 관리 작업에서 누가 언제 무엇을 했는지', '누가 VM 1을 중지했는지 알고 싶을 때'] },
    { header: 'Log Analytics', cells: ['작업 영역에 모인 로그를 쿼리로 골라 분석', '여러 VM의 오류 기록을 골라 견주고 싶을 때'] },
    { header: 'Azure Monitor 경고', cells: ['정해 둔 조건이 맞을 때 담당자에게 알림', 'CPU 사용률이 기준을 넘으면 알고 싶을 때'] },
    { header: 'Application Insights', cells: ['웹 앱 안의 요청과 응답 시간, 실패', '사용자가 겪는 앱의 느림과 오류를 찾고 싶을 때'] },
  ],
}

function table() { return visualsByTopicId[topicId].tables[expected.id] }

describe('Azure Monitor 기능 비교표', () => {
  it('이름·열·열 폭·근거가 지정한 값이다', () => {
    expect(table().label).toBe(expected.label)
    expect(table().columns).toEqual(expected.columns)
    expect(table().columnWidths).toEqual(expected.columnWidths)
    expect(table().sources).toEqual(expected.sources)
    render(<MonitorFeaturesTable />)
    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(expected.columns)
    expect(Array.from(screen.getByRole('table').querySelectorAll('colgroup col'), (col) => (col as HTMLElement).style.width)).toEqual(expected.columnWidths)
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
    const concepts = topics.find(({ id }) => id === topicId)!.concepts
    const bodyOf = (id: string) => concepts.find((concept) => concept.id === id)!.paragraphs.join(' ')
    for (const fact of ['관리 작업', '누가', '언제', '무엇']) expect(bodyOf(`${topicId}.activity-log`), fact).toContain(fact)
    for (const fact of ['Log Analytics 작업 영역', '쿼리', '여러 VM', '오류 기록']) expect(bodyOf(`${topicId}.log-analytics`), fact).toContain(fact)
    for (const fact of ['정해 둔 조건', 'CPU 사용률', '담당자']) expect(bodyOf(`${topicId}.monitor-alerts`), fact).toContain(fact)
    for (const fact of ['웹 앱', '요청', '응답 시간', '실패']) expect(bodyOf(conceptId), fact).toContain(fact)
  })

  it('표 어디에도 O·X 한 글자 판정, 백틱, 가운뎃점이 없다', () => {
    for (const text of [...table().columns, ...table().rows.flatMap(({ header, cells }) => [header, ...cells])]) {
      expect(text.trim(), text).not.toMatch(/^[OX○×]$/u)
      expect(text, text).not.toMatch(/[`·]/u)
    }
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 도식 뒤, 개념의 맨 끝에 나온다', (headingLevel) => {
    const concept = topics.find(({ id }) => id === topicId)!.concepts.find(({ id }) => id === conceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)
    const figures = screen.getAllByRole('figure')
    expect(figures).toHaveLength(2)
    expect(figures[0]).toHaveAttribute('aria-label', '사용자와 가용성 테스트가 웹 앱 1에 요청을 보내고, 웹 앱 1이 데이터베이스를 부르며 Application Insights가 앱의 요청과 성능을 살피는 모습')
    expect(figures[1]).toHaveAttribute('aria-label', expected.label)
    expect(figures[1].closest('article')).toHaveAttribute('id', conceptId)
    expect(figures[1].closest('article')!.lastElementChild).toBe(figures[1])
  })
})
