import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { ConceptList } from '../ConceptList'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const visuals = visualsByTopicId['vpc-networking']
const concept = topics.find(({ id }) => id === 'vpc-networking')!.concepts
  .find(({ id }) => id === 'vpc-networking.comparison')!
const label = 'NAT 게이트웨이, VPC Endpoint, PrivateLink, VPC 피어링'
const expectedRows = [
  { header: 'NAT 게이트웨이', cells: ['인터넷. 프라이빗 서브넷에서 나가는 통신만 연다', '거친다. AWS 서비스로 가도 공용 엔드포인트로 나간다'] },
  { header: 'VPC Endpoint', cells: ['AWS 서비스', '거치지 않는다'] },
  { header: 'PrivateLink', cells: ['다른 VPC의 애플리케이션 하나', '거치지 않는다'] },
  { header: 'VPC 피어링', cells: ['다른 VPC 전체', '거치지 않는다'] },
]

function comparisonTable() {
  const table = visuals.tables['nat-endpoint-privatelink-peering']
  expect(table).toBeDefined()
  return table
}

describe('VPC 네 기능 비교표', () => {
  it('표의 이름·세 열·열 폭·근거가 지정한 값이다', () => {
    const table = comparisonTable()
    expect(table.label).toBe(label)
    expect(table.columns).toEqual(['', '연결 대상', '인터넷을 거치나'])
    expect(table.columnWidths).toEqual(['32%', '34%', '34%'])
    expect(table.sources).toEqual([
      'vpc-networking.comparison',
      'vpc-networking.nat-gateway',
      'vpc-networking.nat-gateway-traffic-uses-public-endpoints',
      'vpc-networking.vpc-endpoint',
      'vpc-networking.privatelink',
      'vpc-networking.privatelink-endpoint-service',
      'vpc-networking.vpc-peering',
    ])

    render(<ComparisonTableFigure table={table} />)

    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(['', '연결 대상', '인터넷을 거치나'])
  })

  it('네 행 머리와 칸 문구가 지정한 순서와 내용 그대로 나온다', () => {
    const table = comparisonTable()
    expect(table.rows).toEqual(expectedRows)
    render(<ComparisonTableFigure table={table} />)

    expect(screen.getAllByRole('rowheader').map((header) => header.textContent)).toEqual(expectedRows.map(({ header }) => header))
    for (const { header, cells } of expectedRows) {
      const row = screen.getByRole('rowheader', { name: header }).closest('tr')!
      expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(cells)
    }
  })

  it('어느 칸에도 한 글자 판정이 없다', () => {
    const table = comparisonTable()
    const cells = [...table.columns, ...table.rows.flatMap(({ header, cells }) => [header, ...cells])]

    for (const cell of cells) expect(cell.trim()).not.toMatch(/^[OX○×]$/u)
  })

  it('기존 private-connectivity 표의 열 폭이 32% · 34% · 34%다', () => {
    expect(visuals.tables['private-connectivity'].columnWidths).toEqual(['32%', '34%', '34%'])
  })

  it.each([2, 4] as const)('h%i 공유 본문에서 본문, 표, 지도, 목적지 도식이 차례로 나온다', (headingLevel) => {
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)

    const figures = screen.getAllByRole('figure')
    expect(figures).toHaveLength(3)
    expect(figures[0]).toHaveAttribute('aria-label', label)
    expect(figures[1]).toHaveAttribute('aria-label', 'VPC 통신 경로 도식')
    expect(figures[2]).toHaveAttribute('aria-label', visuals.diagrams['vpc-destination'].label)
    expect(figures[0].previousElementSibling).toHaveTextContent(concept.paragraphs[concept.paragraphs.length - 1])
    expect(figures[1].previousElementSibling).toBe(figures[0])
    expect(figures[2].previousElementSibling).toBe(figures[1])
    const article = figures[0].closest('article')!
    expect(article).toHaveAttribute('id', concept.id)
    expect(within(article).getByRole('heading', { level: headingLevel, name: concept.name })).toBeInTheDocument()
    for (const figure of figures) {
      expect(figure.closest('article')).toBe(article)
      expect(within(figure).queryByRole('heading')).toBeNull()
    }
  })
})
