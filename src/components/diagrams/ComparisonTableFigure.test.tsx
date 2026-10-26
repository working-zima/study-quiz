import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { ConceptList } from '../ConceptList'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const tables = visualsByTopicId['vpc-networking'].tables

// 표 id → 그 표가 붙는 개념
const anchors: Record<string, string> = {
  'attach-targets': 'vpc-networking.s3-is-regional',
  'endpoint-types': 'vpc-networking.endpoint-pricing',
  'nat-instance-vs-gateway': 'vpc-networking.nat-instance',
  'private-connectivity': 'vpc-networking.privatelink-endpoint-service',
  'flow-logs-vs-cloudtrail': 'vpc-networking.vpc-flow-logs',
  'nat-endpoint-privatelink-peering': 'vpc-networking.comparison',
}

// tailwind.config의 정답/오답 토큰과 기본 팔레트의 초록·빨강
const colorClass = /\b(?:text|bg|border)-(?:correct|incorrect|green|red|emerald|rose)\b/

describe('ComparisonTableFigure', () => {
  it('표 여섯이 모두 데이터에 있다', () => {
    expect(Object.keys(tables).sort()).toEqual(Object.keys(anchors).sort())
  })

  it.each(Object.keys(anchors))('%s: figure 이름이 표 label이고 헤딩이 없다', (id) => {
    const table = tables[id]
    render(<ComparisonTableFigure table={table} />)

    const figure = screen.getByRole('figure', { name: table.label })
    expect(within(figure).queryAllByRole('heading')).toHaveLength(0)
    expect(figure.querySelector('h1, h2, h3, h4, h5, h6')).toBeNull()
  })

  // 320px에서 세 열이 같은 폭이면 짧은 판정 열은 비고 나머지가 빽빽하게 접힌다(phase 40 실측).
  it.each(Object.keys(anchors))('%s: 열 폭을 데이터대로 나누고 합이 100%%다', (id) => {
    const table = tables[id]
    render(<ComparisonTableFigure table={table} />)

    const widths = Array.from(screen.getByRole('table').querySelectorAll('colgroup col'), (col) => (col as HTMLElement).style.width)
    expect(widths).toEqual(table.columnWidths)
    expect(table.columnWidths!.reduce((sum, width) => sum + Number.parseFloat(width), 0)).toBe(100)
  })

  it('무엇을 어디에 붙이나: 판정 열이 가장 좁다', () => {
    const widths = tables['attach-targets'].columnWidths!.map((width) => Number.parseFloat(width))
    expect(Math.min(...widths)).toBe(widths[1])
  })

  it.each(Object.keys(anchors))('%s: 열 머리와 행 구조가 데이터와 같다', (id) => {
    const table = tables[id]
    render(<ComparisonTableFigure table={table} />)

    const element = screen.getByRole('table')
    expect(element.querySelectorAll('thead th')).toHaveLength(table.columns.length)
    const rows = element.querySelectorAll('tbody tr')
    expect(rows).toHaveLength(table.rows.length)
    rows.forEach((row, index) => {
      const rowHeaders = row.querySelectorAll('th')
      expect(rowHeaders).toHaveLength(1)
      expect(rowHeaders[0]).toHaveAttribute('scope', 'row')
      expect(rowHeaders[0]).toHaveTextContent(table.rows[index].header)
      expect(row.querySelectorAll('td')).toHaveLength(table.columns.length - 1)
    })
  })

  it.each(Object.entries(anchors))('%s 표가 %s 개념 뒤에 나온다', (id, conceptId) => {
    const concept = topics.flatMap(({ concepts }) => concepts).find(({ id: cid }) => cid === conceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={2} />)

    expect(screen.getByRole('figure', { name: tables[id].label })).toBeInTheDocument()
  })

  it('가능/불가 판정 칸에 색이 없고 굵기만 있다', () => {
    const table = tables['attach-targets']
    const { container } = render(<ComparisonTableFigure table={table} />)

    const verdicts = [...container.querySelectorAll('td')].filter((cell) => ['가능', '불가'].includes(cell.textContent ?? ''))
    expect(verdicts).toHaveLength(table.rows.length)
    for (const cell of verdicts) {
      expect(cell.className).toContain('font-medium')
    }
    for (const element of container.querySelectorAll('*')) {
      expect(element.getAttribute('class') ?? '').not.toMatch(colorClass)
    }
  })

  it.each(Object.keys(anchors))('%s: 가로 스크롤 래퍼가 없다', (id) => {
    const { container } = render(<ComparisonTableFigure table={tables[id]} />)

    expect(container.querySelector('.overflow-x-auto')).toBeNull()
    expect(container.innerHTML).not.toContain('colspan')
  })
})
