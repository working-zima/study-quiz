import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { ConceptList } from '../ConceptList'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const concept = topics.find(({ id }) => id === 'route53')!.concepts
  .find(({ id }) => id === 'route53.routing-policies')!
const expectedRows = [
  { header: '단순', cells: ['리소스 하나 · 상태 검사로 거르지 않음'] },
  { header: '페일오버', cells: ['주 대상 · 비정상이면 보조 대상'] },
  { header: '지리적 위치', cells: ['사용자의 국가'] },
  { header: '지리적 근접', cells: ['사용자와 리소스 사이의 거리'] },
  { header: '지연 시간', cells: ['지연이 가장 짧은 리전'] },
  { header: '가중치', cells: ['미리 정한 가중치'] },
  { header: '다중값 응답', cells: ['정상 레코드 최대 8개를 무작위로 · 위치는 보지 않음'] },
  { header: 'IP 기반', cells: ['클라이언트 IP가 속한 CIDR 범위'] },
]

function comparisonTable() {
  const visuals = visualsByTopicId['route53']
  expect(visuals).toBeDefined()
  const table = visuals.tables['routing-policies']
  expect(table).toBeDefined()
  return table
}

describe('Route 53 라우팅 정책 비교표', () => {
  it('표의 이름·두 열·근거가 지정한 값이고 약어 툴팁은 없다', () => {
    const table = comparisonTable()
    expect(table.label).toBe('Route 53 라우팅 정책 비교')
    expect(table.columns).toEqual(['정책', '응답을 고르는 기준'])
    expect(table.sources).toEqual([
      'route53.routing-policies',
      'route53.route53-failover-routing',
      'route53.multivalue-answer-details',
      'route53.multi-region-failover-for-region-outage',
    ])
    expect(visualsByTopicId['route53'].glossary).toEqual([])

    render(<ComparisonTableFigure table={table} />)

    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(['정책', '응답을 고르는 기준'])
  })

  it('여덟 행 머리와 칸 문구가 지정한 순서와 내용 그대로 나온다', () => {
    const table = comparisonTable()
    expect(table.rows).toEqual(expectedRows)
    render(<ComparisonTableFigure table={table} />)

    expect(screen.getAllByRole('rowheader').map((header) => header.textContent)).toEqual(expectedRows.map(({ header }) => header))
    for (const { header, cells } of expectedRows) {
      const row = screen.getByRole('rowheader', { name: header }).closest('tr')!
      expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(cells)
    }
  })

  it('한 글자 판정·백분율·숫자 비율이 없고 숫자 8은 다중값 응답 행에만 있다', () => {
    const table = comparisonTable()

    for (const { header, cells } of table.rows) {
      for (const cell of [header, ...cells]) {
        expect(cell.trim()).not.toMatch(/^[OX○×]$/u)
        expect(cell).not.toMatch(/%|\d\s*[:/]\s*\d/u)
      }
      expect([header, ...cells].join('').match(/\d/gu) ?? []).toEqual(header === '다중값 응답' ? ['8'] : [])
    }
  })

  it('colgroup의 폭이 30% · 70%다', () => {
    render(<ComparisonTableFigure table={comparisonTable()} />)

    const widths = Array.from(screen.getByRole('table').querySelectorAll('colgroup col'), (col) => (col as HTMLElement).style.width)
    expect(widths).toEqual(['30%', '70%'])
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 본문 바로 뒤에 비교표 figure 하나가 나온다', (headingLevel) => {
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)

    const table = screen.getByRole('figure', { name: 'Route 53 라우팅 정책 비교' })
    const article = table.closest('article')!
    expect(article).toHaveAttribute('id', concept.id)
    expect(within(article).getByRole('heading', { level: headingLevel, name: concept.name })).toBeInTheDocument()
    expect(screen.getAllByRole('figure')).toEqual([table])
    // 목록 항목의 `- ` 표지는 화면에 나오지 않는다(ADR-046).
    expect(table.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*/gu, ''))
    expect(article.lastElementChild).toBe(table)
    expect(within(table).getAllByRole('columnheader')).toHaveLength(2)
    expect(within(table).getAllByRole('rowheader')).toHaveLength(8)
  })
})
