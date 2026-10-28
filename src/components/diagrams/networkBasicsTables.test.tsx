import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { ConceptList } from '../ConceptList'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const topicId = 'network-basics'
const concepts = topics.find(({ id }) => id === topicId)!.concepts

// 대역폭의 단위는 본문에 없어 단위 열을 두지 않는다. 셋을 가르는 축(기대치·실제로 잰 값·상한)을 열로 둔다.
const performanceMetrics = {
  id: 'performance-metrics',
  conceptId: 'network-basics.packet-loss',
  label: '네트워크 성능을 나타내는 지표',
  columns: ['지표', '무엇을 나타내는가', '어떤 값인가'],
  // 스크롤 막대(15px)가 낀 320px에서 표 폭은 273px이다. 22% 열 안쪽 51px에 행 머리의 처리율·대역폭(한글 세 글자 42px)이,
  // 39% 열 안쪽 97px에 칸의 가장 긴 덩어리인 데이터를·처리율과·대역폭을·상관없다(한글 네 글자 56px)가 들어간다.
  columnWidths: ['22%', '39%', '39%'],
  sources: [
    'network-basics.transmission-speed',
    'network-basics.throughput',
    'network-basics.bandwidth',
    'network-basics.packet-loss',
  ],
  rows: [
    { header: '전송 속도', cells: ['데이터를 얼마나 빠르게 보낼 수 있는지', '기대치. 실제로 잰 처리율과 다르게 나올 수 있다'] },
    { header: '처리율', cells: ['정해 둔 시간 동안 실제로 전송된 데이터 양', '실제로 잰 값. 대역폭을 넘지 못한다'] },
    { header: '대역폭', cells: ['보내고 받을 수 있는 데이터 양의 최대치', '넘을 수 없는 상한. 지금 실제로 오가는 양과 상관없다'] },
    { header: '패킷 손실', cells: ['보낸 패킷 가운데 목적지에 닿지 못하고 도중에 사라진 정도', '잃은 수를 보낸 수에 견준 백분율. ping 결과에 나온다'] },
  ],
}

function comparisonTable() {
  const visuals = visualsByTopicId[topicId]
  expect(visuals).toBeDefined()
  const table = visuals.tables[performanceMetrics.id]
  expect(table).toBeDefined()
  return table
}

describe('네트워크 성능 지표 비교표', () => {
  it('주제의 시각 요소가 로더에 있고 약어 툴팁은 없다', () => {
    const visuals = visualsByTopicId[topicId]
    expect(visuals).toBeDefined()
    expect(visuals.glossary).toEqual([])
  })

  it('표의 이름·열·열 폭·근거가 지정한 값이다', () => {
    const table = comparisonTable()
    expect(table.label).toBe(performanceMetrics.label)
    expect(table.columns).toEqual(performanceMetrics.columns)
    expect(table.columnWidths).toEqual(performanceMetrics.columnWidths)
    expect(table.sources).toEqual(performanceMetrics.sources)

    render(<ComparisonTableFigure table={table} />)

    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(performanceMetrics.columns)
  })

  it('행 머리가 개념 순서대로 나오고 칸 문구가 지정한 내용 그대로다', () => {
    const table = comparisonTable()
    expect(table.rows).toEqual(performanceMetrics.rows)
    expect(table.rows.map(({ header }) => header)).toEqual(
      performanceMetrics.sources.map((source) => concepts.find(({ id }) => id === source)!.name),
    )
    render(<ComparisonTableFigure table={table} />)

    expect(screen.getAllByRole('rowheader').map((header) => header.textContent)).toEqual(performanceMetrics.rows.map(({ header }) => header))
    for (const { header, cells } of performanceMetrics.rows) {
      const row = screen.getByRole('rowheader', { name: header }).closest('tr')!
      expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(cells)
    }
  })

  it('표 어디에도 O·X·○·× 한 글자 판정이 없다', () => {
    const table = comparisonTable()
    for (const text of [...table.columns, ...table.rows.flatMap(({ header, cells }) => [header, ...cells])]) {
      expect(text.trim(), text).not.toMatch(/^[OX○×]$/u)
    }
  })

  it('colgroup의 폭이 지정한 값이다', () => {
    render(<ComparisonTableFigure table={comparisonTable()} />)

    const widths = Array.from(screen.getByRole('table').querySelectorAll('colgroup col'), (col) => (col as HTMLElement).style.width)
    expect(widths).toEqual(performanceMetrics.columnWidths)
  })

  // 네트워크 과목은 개념마다 도식이 있고, 표는 도식을 대신하지 않아 도식 뒤에 온다(ADR-056).
  it.each([2, 4] as const)('공유 본문 h%i에서 패킷 손실 개념의 본문 뒤 도식 다음에 비교표 figure가 나온다', (headingLevel) => {
    const concept = concepts.find(({ id }) => id === performanceMetrics.conceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)

    const table = screen.getByRole('figure', { name: performanceMetrics.label })
    const diagram = screen.getByRole('figure', { name: 'ping 결과로 패킷 손실을 읽는 도식' })
    const article = table.closest('article')!
    expect(article).toHaveAttribute('id', concept.id)
    expect(within(article).getByRole('heading', { level: headingLevel, name: concept.name })).toBeInTheDocument()
    expect(screen.getAllByRole('figure')).toEqual([diagram, table])
    expect(diagram.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*/gu, ''))
    expect(table.previousElementSibling).toBe(diagram)
    expect(article.lastElementChild).toBe(table)
    expect(within(table).getAllByRole('columnheader')).toHaveLength(performanceMetrics.columns.length)
    expect(within(table).getAllByRole('rowheader')).toHaveLength(performanceMetrics.rows.length)
  })
})
