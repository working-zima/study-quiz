import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { ConceptList } from '../ConceptList'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const concept = topics.find(({ id }) => id === 'governance-iac')!.concepts
  .find(({ id }) => id === 'governance-iac.cloudformation')!
const expectedRows = [
  { header: 'CloudFormation', cells: ['인프라를 반복해 같게 만들 때', '계정 관리는 Organizations'] },
  { header: 'CloudFormation 드리프트 감지', cells: ['템플릿과 다른지 볼 때', '스택 밖까지는 AWS Config'] },
  { header: 'Service Catalog', cells: ['허용된 구성만 배포하게 할 때', '변경 추적·감사는 AWS Config'] },
  { header: 'Control Tower 랜딩 존', cells: ['계정마다 같은 통제·로깅을 걸 때', '계정마다 따로 두는 사용자·역할'] },
  { header: 'Control Tower 사전 예방적 제어', cells: ['위반 배포를 막을 때', '만든 뒤 찾아 보고하는 탐지 제어'] },
  { header: 'RAM', cells: ['다른 계정과 리소스를 공유할 때', '사용자 인증은 못 한다'] },
  { header: 'Workload Discovery', cells: ['리소스 관계를 그림으로 볼 때', 'X-Ray는 요청 경로만 좇는다'] },
]

function comparisonTable() {
  const visuals = visualsByTopicId['governance-iac']
  expect(visuals).toBeDefined()
  const table = visuals.tables['tool-choice']
  expect(table).toBeDefined()
  return table
}

describe('거버넌스 도구 비교표', () => {
  it('표의 이름·세 열·열 폭·근거가 지정한 값이고 약어 툴팁은 없다', () => {
    const table = comparisonTable()
    expect(table.label).toBe('도구별 고를 때와 헷갈리는 짝')
    expect(table.columns).toEqual(['도구', '고를 때', '헷갈리는 짝'])
    expect(table.columnWidths).toEqual(['41%', '24%', '35%'])
    expect(table.sources).toEqual([
      'governance-iac.cloudformation',
      'governance-iac.cloudformation-drift-detection',
      'governance-iac.service-catalog',
      'governance-iac.control-tower-landing-zone',
      'governance-iac.control-tower-controls',
      'governance-iac.resource-access-manager',
      'governance-iac.workload-discovery',
    ])
    expect(visualsByTopicId['governance-iac'].glossary).toEqual([])

    render(<ComparisonTableFigure table={table} />)

    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(['도구', '고를 때', '헷갈리는 짝'])
  })

  it('일곱 행 머리와 칸 문구가 지정한 순서와 내용 그대로 나온다', () => {
    const table = comparisonTable()
    expect(table.rows).toEqual(expectedRows)
    render(<ComparisonTableFigure table={table} />)

    expect(screen.getAllByRole('rowheader').map((header) => header.textContent)).toEqual(expectedRows.map(({ header }) => header))
    for (const { header, cells } of expectedRows) {
      const row = screen.getByRole('rowheader', { name: header }).closest('tr')!
      expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(cells)
    }
  })

  it('어느 칸에도 한 글자 판정이나 가능·불가가 없다', () => {
    const table = comparisonTable()
    const cells = [...table.columns, ...table.rows.flatMap(({ header, cells }) => [header, ...cells])]

    for (const cell of cells) {
      expect(cell.trim()).not.toMatch(/^[OX○×]$/u)
      expect(cell).not.toMatch(/가능|불가/u)
    }
  })

  it('colgroup의 폭이 41% · 24% · 35%다', () => {
    render(<ComparisonTableFigure table={comparisonTable()} />)

    const widths = Array.from(screen.getByRole('table').querySelectorAll('colgroup col'), (col) => (col as HTMLElement).style.width)
    expect(widths).toEqual(['41%', '24%', '35%'])
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 본문 바로 뒤에 비교표 figure 하나가 나온다', (headingLevel) => {
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)

    const table = screen.getByRole('figure', { name: '도구별 고를 때와 헷갈리는 짝' })
    const article = table.closest('article')!
    expect(article).toHaveAttribute('id', concept.id)
    expect(within(article).getByRole('heading', { level: headingLevel, name: concept.name })).toBeInTheDocument()
    expect(screen.getAllByRole('figure')).toEqual([table])
    expect(table.previousElementSibling?.textContent).toBe(concept.paragraphs.join('').replace(/\*\*/gu, ''))
    expect(article.lastElementChild).toBe(table)
    expect(within(table).getAllByRole('columnheader')).toHaveLength(3)
    expect(within(table).getAllByRole('rowheader')).toHaveLength(7)
  })
})
