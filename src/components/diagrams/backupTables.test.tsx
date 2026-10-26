import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { ConceptList } from '../ConceptList'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const tables = visualsByTopicId['backup-disaster-recovery'].tables
const concepts = topics.find(({ id }) => id === 'backup-disaster-recovery')!.concepts
const anchors = {
  'ec2-assignment': 'backup-disaster-recovery.backup-ec2-resource-assignment',
  'backup-policy-scope': 'backup-disaster-recovery.organizations-backup-policy',
  'copy-destination': 'backup-disaster-recovery.backup-cross-account-copy',
}

describe('백업 비교표', () => {
  it('표 셋이 모두 데이터에 있다', () => {
    expect(Object.keys(tables).sort()).toEqual(Object.keys(anchors).sort())
  })

  describe.each([2, 4] as const)('공유 본문 h%i', (headingLevel) => {
    it.each(Object.entries(anchors))('%s 표가 %s의 본문 바로 뒤에 나온다', (id, conceptId) => {
      expect(tables[id]).toBeDefined()
      render(<ConceptList concepts={concepts} headingLevel={headingLevel} />)

      const concept = concepts.find(({ id: cid }) => cid === conceptId)!
      const figure = screen.getByRole('figure', { name: tables[id].label })
      const article = figure.closest('article')!
      expect(article).toHaveAttribute('id', conceptId)
      // 세 표의 개념은 모두 backup 아래 딸린 개념이라 제목이 한 단계 아래다(ADR-041).
      expect(within(article).getByRole('heading', { level: headingLevel + 1, name: concept.name })).toBeInTheDocument()
      expect(figure.previousElementSibling?.textContent).toBe(concept.paragraphs.join(''))
      expect(article.lastElementChild).toBe(figure)
      expect(within(article).getAllByRole('figure')).toHaveLength(1)
    })
  })

  it.each(Object.keys(anchors))('%s의 열 머리와 행 구조가 데이터와 같다', (id) => {
    const table = tables[id]
    expect(table).toBeDefined()
    render(<ComparisonTableFigure table={table} />)

    const element = screen.getByRole('table')
    const headers = within(element).getAllByRole('columnheader')
    expect(headers).toHaveLength(3)
    expect(headers.map((header) => header.textContent)).toEqual(table.columns)
    for (const header of headers) expect(header).toHaveAttribute('scope', 'col')

    const rows = within(element).getAllByRole('row').slice(1)
    expect(rows).toHaveLength(table.rows.length)
    rows.forEach((row, index) => {
      const rowHeaders = within(row).getAllByRole('rowheader')
      expect(rowHeaders).toHaveLength(1)
      expect(rowHeaders[0]).toHaveAttribute('scope', 'row')
      expect(rowHeaders[0].textContent).toBe(table.rows[index].header)
      const cells = within(row).getAllByRole('cell')
      expect(cells).toHaveLength(table.columns.length - 1)
      expect(cells.map((cell) => cell.textContent)).toEqual(table.rows[index].cells)
    })
  })

  it.each(Object.keys(anchors))('%s의 colgroup 폭은 24%% · 38%% · 38%%다', (id) => {
    const table = tables[id]
    expect(table).toBeDefined()
    render(<ComparisonTableFigure table={table} />)

    expect(table.columnWidths).toEqual(['24%', '38%', '38%'])
    const widths = Array.from(screen.getByRole('table').querySelectorAll('colgroup col'), (col) => (col as HTMLElement).style.width)
    expect(widths).toEqual(['24%', '38%', '38%'])
  })

  it('새 계정의 계정마다 설정 칸은 근거 없는 설명 대신 —로 둔다', () => {
    const table = tables['backup-policy-scope']
    expect(table).toBeDefined()
    render(<ComparisonTableFigure table={table} />)

    expect(table.rows.find(({ header }) => header === '새 계정')?.cells[0]).toBe('—')
    const row = screen.getByRole('rowheader', { name: '새 계정' }).closest('tr')!
    expect(within(row).getAllByRole('cell')[0].textContent).toBe('—')
  })
})
