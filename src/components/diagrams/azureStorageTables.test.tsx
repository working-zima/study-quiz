import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { ConceptList } from '../ConceptList'
import { ComparisonTableFigure } from './ComparisonTableFigure'
import { RedundancyOptionsTable } from './azureStorageTables'

const topicId = 'azure-storage'
const concepts = topics.find(({ id }) => id === topicId)!.concepts

// 옵션 여섯을 주 지역과 보조 지역에 복사본을 어떻게 두는가로 견준다. 칸마다 두 개념 본문에 근거가 있다.
const redundancyOptions = {
  id: 'redundancy-options',
  conceptId: 'azure-storage.geo-redundancy',
  label: '중복성 옵션 여섯 견주기',
  columns: ['옵션', '주 지역', '보조 지역'],
  // 스크롤 막대(15px)가 낀 320px에서 표 폭은 273px이고 칸마다 9px가 빠진다. 28% 열 안쪽 67px에 행 머리 RA-GZRS(굵기 500, 반각 일곱 글자 약 62px)가,
  // 36% 열 안쪽 89px에 가장 긴 덩어리인 복제하지(한글 네 글자 56px)와 GZRS와(반각 넷과 한글 하나 약 54px)가 들어간다.
  columnWidths: ['28%', '36%', '36%'],
  sources: ['azure-storage.storage-redundancy', 'azure-storage.geo-redundancy'],
  rows: [
    { header: 'LRS', cells: ['데이터 센터 한 곳에 복사본 셋', '복제하지 않음'] },
    { header: 'ZRS', cells: ['가용성 영역 셋에 하나씩', '복제하지 않음'] },
    { header: 'GRS', cells: ['데이터 센터 한 곳에 복사본 셋', '복사본 셋. 장애 조치 뒤에 읽음'] },
    { header: 'GZRS', cells: ['가용성 영역 셋에 하나씩', '복사본 셋. 장애 조치 뒤에 읽음'] },
    { header: 'RA-GRS', cells: ['GRS와 같음', '복사본 셋. 장애 조치 전에도 읽음'] },
    { header: 'RA-GZRS', cells: ['GZRS와 같음', '복사본 셋. 장애 조치 전에도 읽음'] },
  ],
}

function comparisonTable() {
  const visuals = visualsByTopicId[topicId]
  expect(visuals).toBeDefined()
  const table = visuals.tables[redundancyOptions.id]
  expect(table).toBeDefined()
  return table
}

describe('중복성 옵션 비교표', () => {
  it('주제의 시각 요소가 로더에 있고 약어 툴팁은 없다', () => {
    expect(visualsByTopicId[topicId].glossary).toEqual([])
  })

  it('표의 이름·열·열 폭·근거가 지정한 값이다', () => {
    const table = comparisonTable()
    expect(table.label).toBe(redundancyOptions.label)
    expect(table.columns).toEqual(redundancyOptions.columns)
    expect(table.columnWidths).toEqual(redundancyOptions.columnWidths)
    expect(table.sources).toEqual(redundancyOptions.sources)

    render(<RedundancyOptionsTable />)

    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(redundancyOptions.columns)
  })

  it('행 순서와 칸 문구가 지정한 내용 그대로다', () => {
    const table = comparisonTable()
    expect(table.rows).toEqual(redundancyOptions.rows)
    render(<ComparisonTableFigure table={table} />)

    expect(screen.getAllByRole('rowheader').map((header) => header.textContent)).toEqual(redundancyOptions.rows.map(({ header }) => header))
    for (const { header, cells } of redundancyOptions.rows) {
      const row = screen.getByRole('rowheader', { name: header }).closest('tr')!
      expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(cells)
    }
  })

  it('칸의 사실이 두 개념 본문에 있다', () => {
    const body = redundancyOptions.sources.flatMap((source) => concepts.find(({ id }) => id === source)!.paragraphs).join(' ')

    for (const fact of ['LRS', 'ZRS', 'GRS', 'GZRS', 'RA-GRS', 'RA-GZRS', '데이터 센터 한 곳', '가용성 영역 셋', '장애 조치 전에도']) {
      expect(body).toContain(fact)
    }
  })

  it('표 어디에도 O·X·○·× 한 글자 판정이 없다', () => {
    const table = comparisonTable()
    for (const text of [...table.columns, ...table.rows.flatMap(({ header, cells }) => [header, ...cells])]) {
      expect(text.trim(), text).not.toMatch(/^[OX○×]$/u)
    }
  })

  it('colgroup의 폭이 지정한 값이다', () => {
    render(<RedundancyOptionsTable />)

    const widths = Array.from(screen.getByRole('table').querySelectorAll('colgroup col'), (col) => (col as HTMLElement).style.width)
    expect(widths).toEqual(redundancyOptions.columnWidths)
  })

  // 한 개념에 도식과 표가 함께 붙으면 도식이 먼저다(UI_GUIDE 「한 개념 뒤의 여러 도식」).
  it.each([2, 4] as const)('공유 본문 h%i에서 보조 지역 개념의 도식 바로 뒤에 비교표 figure가 나온다', (headingLevel) => {
    const concept = concepts.find(({ id }) => id === redundancyOptions.conceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)

    const table = screen.getByRole('figure', { name: redundancyOptions.label })
    const article = table.closest('article')!
    expect(article).toHaveAttribute('id', concept.id)
    expect(within(article).getByRole('heading', { level: headingLevel, name: concept.name })).toBeInTheDocument()
    expect(screen.getAllByRole('figure')).toHaveLength(2)
    expect(screen.getAllByRole('figure')[1]).toBe(table)
    expect(article.lastElementChild).toBe(table)
    expect(within(table).getAllByRole('columnheader')).toHaveLength(redundancyOptions.columns.length)
    expect(within(table).getAllByRole('rowheader')).toHaveLength(redundancyOptions.rows.length)
  })
})
