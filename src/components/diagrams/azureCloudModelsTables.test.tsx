import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { ConceptList } from '../ConceptList'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const topicId = 'azure-cloud-models'
const concepts = topics.find(({ id }) => id === topicId)!.concepts

// 네 모델을 하드웨어를 누가 갖추고 관리하는가와 언제 고르는가로 견준다. 칸마다 그 모델 개념의 본문에 근거가 있다.
const cloudModels = {
  id: 'cloud-models',
  conceptId: 'azure-cloud-models.multicloud',
  label: '네 클라우드 모델 견주기',
  columns: ['모델', '하드웨어를 갖추고 관리하는 쪽', '이럴 때 고른다'],
  // 스크롤 막대(15px)가 낀 320px에서 표 폭은 273px이고 칸마다 9px가 빠진다. 31% 열 안쪽 75px에 행 머리의 가장 긴 덩어리
  // 하이브리드(한글 다섯 글자, 굵기 500에서 70px)가, 31% 열 안쪽 75px에 열 이름의 하드웨어를(한글 다섯 글자 70px)이,
  // 38% 열 안쪽 94px에 칸의 가장 긴 덩어리 하드웨어를·공급자마다(한글 다섯 글자 70px)가 들어간다.
  columnWidths: ['31%', '31%', '38%'],
  sources: [
    'azure-cloud-models.public-cloud',
    'azure-cloud-models.private-cloud',
    'azure-cloud-models.hybrid-cloud',
    'azure-cloud-models.multicloud',
  ],
  rows: [
    { header: '퍼블릭 클라우드', cells: ['클라우드 공급자', '하드웨어를 사지 않고 리소스를 빨리 만들어 쓰고, 쓴 만큼 내고 싶을 때'] },
    { header: '프라이빗 클라우드', cells: ['그 조직. 데이터 센터는 사업장 안에도 밖에도 둘 수 있다', '리소스와 보안을 직접 통제해야 할 때'] },
    { header: '하이브리드 클라우드', cells: ['프라이빗 쪽은 조직이, 퍼블릭 쪽은 클라우드 공급자가', '서비스마다 둘 곳을 고르거나, 잠시 늘어난 수요를 퍼블릭 쪽에 맡기고 싶을 때'] },
    { header: '다중 클라우드', cells: ['둘 이상의 공급자가 각자 자기 클라우드를', '공급자마다 다른 기능을 쓰거나, 다른 공급자로 옮겨 가는 중일 때'] },
  ],
}

function comparisonTable() {
  const visuals = visualsByTopicId[topicId]
  expect(visuals).toBeDefined()
  const table = visuals.tables[cloudModels.id]
  expect(table).toBeDefined()
  return table
}

describe('네 클라우드 모델 비교표', () => {
  it('주제의 시각 요소가 로더에 있고 약어 툴팁은 없다', () => {
    const visuals = visualsByTopicId[topicId]
    expect(visuals).toBeDefined()
    expect(visuals.glossary).toEqual([])
  })

  it('표의 이름·열·열 폭·근거가 지정한 값이다', () => {
    const table = comparisonTable()
    expect(table.label).toBe(cloudModels.label)
    expect(table.columns).toEqual(cloudModels.columns)
    expect(table.columnWidths).toEqual(cloudModels.columnWidths)
    expect(table.sources).toEqual(cloudModels.sources)

    render(<ComparisonTableFigure table={table} />)

    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(cloudModels.columns)
  })

  it('행 머리가 개념 순서대로 개념 이름과 같고 칸 문구가 지정한 내용 그대로다', () => {
    const table = comparisonTable()
    expect(table.rows).toEqual(cloudModels.rows)
    expect(table.rows.map(({ header }) => header)).toEqual(
      cloudModels.sources.map((source) => concepts.find(({ id }) => id === source)!.name),
    )
    render(<ComparisonTableFigure table={table} />)

    expect(screen.getAllByRole('rowheader').map((header) => header.textContent)).toEqual(cloudModels.rows.map(({ header }) => header))
    for (const { header, cells } of cloudModels.rows) {
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
    expect(widths).toEqual(cloudModels.columnWidths)
  })

  // 네 모델을 다 읽은 자리인 다중 클라우드 개념에 붙는다. 이 개념은 정의형이라 도식이 없다(사용자 결정 2026-10-30).
  it.each([2, 4] as const)('공유 본문 h%i에서 다중 클라우드 개념의 본문 바로 뒤에 비교표 figure 하나가 나온다', (headingLevel) => {
    const concept = concepts.find(({ id }) => id === cloudModels.conceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)

    const table = screen.getByRole('figure', { name: cloudModels.label })
    const article = table.closest('article')!
    expect(article).toHaveAttribute('id', concept.id)
    expect(within(article).getByRole('heading', { level: headingLevel, name: concept.name })).toBeInTheDocument()
    expect(screen.getAllByRole('figure')).toEqual([table])
    expect(table.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*/gu, ''))
    expect(article.lastElementChild).toBe(table)
    expect(within(table).getAllByRole('columnheader')).toHaveLength(cloudModels.columns.length)
    expect(within(table).getAllByRole('rowheader')).toHaveLength(cloudModels.rows.length)
  })
})
