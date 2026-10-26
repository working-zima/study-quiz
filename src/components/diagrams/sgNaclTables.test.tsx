import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { ConceptList } from '../ConceptList'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const concept = topics.find(({ id }) => id === 'security-groups-nacl')!.concepts
  .find(({ id }) => id === 'security-groups-nacl.security-group-stateful-vs-nacl-stateless')!
const expectedRows = [
  { header: '적용 위치', cells: ['리소스 · 서브넷에 매이지 않음', '서브넷'] },
  { header: '허용 규칙', cells: ['가능', '가능'] },
  { header: '차단 규칙', cells: ['불가', '가능'] },
  { header: '상태 기억', cells: ['함 · 응답은 규칙 없이 나감', '안 함 · 양방향에 규칙 필요'] },
  { header: '규칙 대상 IP', cells: ['가능', '가능'] },
  { header: '다른 보안 그룹 참조', cells: ['가능', '불가'] },
  { header: '기본 규칙', cells: ['인바운드 차단 · 아웃바운드 허용', '양방향 허용'] },
]

function comparisonTable() {
  const visuals = visualsByTopicId['security-groups-nacl']
  expect(visuals).toBeDefined()
  const table = visuals.tables['sg-vs-nacl']
  expect(table).toBeDefined()
  return table
}

describe('보안 그룹과 NACL 비교표', () => {
  it('표가 데이터에 있고 열 머리와 일곱 행 머리가 지정한 순서로 나온다', () => {
    const table = comparisonTable()
    expect(table.label).toBe('보안 그룹과 NACL 비교')
    expect(table.columns).toEqual(['', '보안 그룹', 'NACL'])
    expect(table.rows.map(({ header }) => header)).toEqual(expectedRows.map(({ header }) => header))
    expect(table.sources).toEqual([
      'security-groups-nacl.security-group',
      'security-groups-nacl.nacl',
      'security-groups-nacl.security-group-referencing',
      'security-groups-nacl.security-group-stateful-vs-nacl-stateless',
    ])
    expect(visualsByTopicId['security-groups-nacl'].glossary).toEqual([])

    render(<ComparisonTableFigure table={table} />)

    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(['', '보안 그룹', 'NACL'])
    expect(screen.getAllByRole('rowheader').map((header) => header.textContent)).toEqual(expectedRows.map(({ header }) => header))
  })

  it('모든 칸이 지정 문구와 같고 차단과 다른 보안 그룹 참조의 가능 여부가 서로 반대다', () => {
    const table = comparisonTable()
    expect(table.rows).toEqual(expectedRows)
    render(<ComparisonTableFigure table={table} />)

    for (const { header, cells } of expectedRows) {
      const row = screen.getByRole('rowheader', { name: header }).closest('tr')!
      expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(cells)
    }
  })

  it('어느 칸에도 O·X·○·× 한 글자 판정이 없다', () => {
    const table = comparisonTable()
    render(<ComparisonTableFigure table={table} />)

    for (const cell of table.rows.flatMap(({ cells }) => cells)) {
      expect(cell.trim()).not.toMatch(/^[OX○×]$/u)
    }
    for (const cell of screen.getAllByRole('cell')) {
      expect(cell.textContent?.trim()).not.toMatch(/^[OX○×]$/u)
    }
  })

  it('colgroup의 폭이 24% · 38% · 38%다', () => {
    render(<ComparisonTableFigure table={comparisonTable()} />)

    const widths = Array.from(screen.getByRole('table').querySelectorAll('colgroup col'), (col) => (col as HTMLElement).style.width)
    expect(widths).toEqual(['24%', '38%', '38%'])
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 본문 뒤에 경계 도식과 비교표가 차례로 나온다', (headingLevel) => {
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)

    const boundary = screen.getByRole('figure', { name: '보안 그룹과 네트워크 ACL 경계 도식' })
    const table = screen.getByRole('figure', { name: '보안 그룹과 NACL 비교' })
    const article = boundary.closest('article')!
    expect(article).toHaveAttribute('id', concept.id)
    expect(within(article).getByRole('heading', { level: headingLevel, name: concept.name })).toBeInTheDocument()
    expect(screen.getAllByRole('figure')).toEqual([boundary, table])
    // 본문의 `**강조**` 표지는 <strong>이 되어 textContent에 남지 않는다(ADR-051).
    expect(boundary.previousElementSibling?.textContent).toBe(concept.paragraphs.join('').split('**').join(''))
    expect(boundary.nextElementSibling).toBe(table)
    expect(article.lastElementChild).toBe(table)
  })
})
