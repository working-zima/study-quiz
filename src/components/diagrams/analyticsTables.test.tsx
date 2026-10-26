import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { ConceptList } from '../ConceptList'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const topicId = 'emr-glue-athena'
const concepts = topics.find(({ id }) => id === topicId)!.concepts

const serviceRoles = {
  id: 'service-roles',
  conceptId: 'emr-glue-athena.emr',
  label: '분석 서비스가 맡는 일',
  columns: ['서비스', '고를 때', '고르지 않을 때'],
  columnWidths: ['30%', '35%', '35%'],
  sources: [
    'emr-glue-athena.emr',
    'emr-glue-athena.spark',
    'emr-glue-athena.glue',
    'emr-glue-athena.glue-crawler',
    'emr-glue-athena.glue-databrew',
    'emr-glue-athena.glue-etl-with-per-customer-kms-key',
    'emr-glue-athena.athena',
    'emr-glue-athena.athena-encrypted-and-pay-per-query',
    'emr-glue-athena.athena-federated-query',
    'emr-glue-athena.lake-formation',
  ],
  rows: [
    { header: 'EMR', cells: ['대량의 데이터를 처리할 컴퓨팅이 필요할 때', '가끔 실행하는 조회나, 운영 부담이 작아야 하는 ETL일 때'] },
    { header: 'Spark', cells: ['여러 서버가 대량의 데이터를 나누어 처리할 때', '실시간 분석이 필요할 때'] },
    { header: 'Glue', cells: ['추출, 변환, 적재를 관리형 서비스에 맡길 때', '데이터를 직접 분석해야 할 때'] },
    { header: 'Glue Crawler', cells: ['S3에 막 들어온 데이터를 바로 쿼리할 수 있게 준비할 때', '데이터의 형태를 바꾸는 ETL 작업일 때'] },
    { header: 'Glue DataBrew', cells: ['분석 전에 값을 정리하고 형태를 고르게 맞출 때', '누가 어느 행을 볼지 접근을 나눌 때'] },
    { header: 'Athena', cells: ['S3에 둔 데이터를 옮기지 않고 SQL로 조회할 때', '데이터 웨어하우스에 정기적으로 대량 적재할 때'] },
    { header: 'Lake Formation', cells: ['데이터 레이크의 접근 권한을 행·열 수준까지 나눌 때', '분석 전에 값을 정리하고 다듬을 때'] },
  ],
}

const logStorage = {
  id: 'log-storage',
  conceptId: 'emr-glue-athena.log-storage-s3-athena',
  label: '조회 빈도로 고르는 로그 저장 위치',
  columns: ['저장 위치', '맞는 쓰임'],
  columnWidths: ['34%', '66%'],
  sources: ['emr-glue-athena.log-storage-s3-athena', 'emr-glue-athena.athena-encrypted-and-pay-per-query'],
  rows: [
    { header: 'S3와 Athena', cells: ['오래 보관하면서 가끔만 조회할 때. 저장은 객체 스토리지 값이고 조회는 실행한 만큼만 내서 가장 싸다.'] },
    { header: 'OpenSearch', cells: ['검색이 잦고 응답이 빨라야 할 때. 클러스터를 띄워 두는 비용이 계속 붙는다.'] },
    { header: 'CloudWatch Logs', cells: ['지금 벌어지는 일을 실시간으로 볼 때. 대용량 장기 보관과 분석에는 맞지 않는다.'] },
  ],
}

const expectedTables = [serviceRoles, logStorage]

function comparisonTable(id: string) {
  const visuals = visualsByTopicId[topicId]
  expect(visuals).toBeDefined()
  const table = visuals.tables[id]
  expect(table).toBeDefined()
  return table
}

describe('EMR·Glue·Athena 비교표', () => {
  it('주제의 시각 요소가 로더에 있고 약어 툴팁은 없다', () => {
    const visuals = visualsByTopicId[topicId]
    expect(visuals).toBeDefined()
    expect(visuals.glossary).toEqual([])
  })

  describe.each(expectedTables)('$label', (expected) => {
    it('표의 이름·열·열 폭·근거가 지정한 값이다', () => {
      const table = comparisonTable(expected.id)
      expect(table.label).toBe(expected.label)
      expect(table.columns).toEqual(expected.columns)
      expect(table.columnWidths).toEqual(expected.columnWidths)
      expect(table.sources).toEqual(expected.sources)

      render(<ComparisonTableFigure table={table} />)

      expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(expected.columns)
    })

    it('행 머리와 칸 문구가 지정한 순서와 내용 그대로 나온다', () => {
      const table = comparisonTable(expected.id)
      expect(table.rows).toEqual(expected.rows)
      render(<ComparisonTableFigure table={table} />)

      expect(screen.getAllByRole('rowheader').map((header) => header.textContent)).toEqual(expected.rows.map(({ header }) => header))
      for (const { header, cells } of expected.rows) {
        const row = screen.getByRole('rowheader', { name: header }).closest('tr')!
        expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(cells)
      }
    })

    it('어느 칸에도 한 글자 판정이나 가능·불가가 없다', () => {
      const table = comparisonTable(expected.id)
      const cells = [...table.columns, ...table.rows.flatMap(({ header, cells }) => [header, ...cells])]

      for (const cell of cells) {
        expect(cell.trim()).not.toMatch(/^[OX○×]$/u)
        expect(cell).not.toMatch(/가능|불가/u)
      }
    })

    it('colgroup의 폭이 지정한 값이다', () => {
      render(<ComparisonTableFigure table={comparisonTable(expected.id)} />)

      const widths = Array.from(screen.getByRole('table').querySelectorAll('colgroup col'), (col) => (col as HTMLElement).style.width)
      expect(widths).toEqual(expected.columnWidths)
    })

    it.each([2, 4] as const)('공유 본문 h%i에서 앵커 개념의 본문 바로 뒤에 비교표 figure 하나가 나온다', (headingLevel) => {
      const concept = concepts.find(({ id }) => id === expected.conceptId)!
      render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)

      const table = screen.getByRole('figure', { name: expected.label })
      const article = table.closest('article')!
      expect(article).toHaveAttribute('id', concept.id)
      expect(within(article).getByRole('heading', { level: headingLevel, name: concept.name })).toBeInTheDocument()
      expect(screen.getAllByRole('figure')).toEqual([table])
      expect(table.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*/gu, ''))
      expect(article.lastElementChild).toBe(table)
      expect(within(table).getAllByRole('columnheader')).toHaveLength(expected.columns.length)
      expect(within(table).getAllByRole('rowheader')).toHaveLength(expected.rows.length)
    })
  })
})
