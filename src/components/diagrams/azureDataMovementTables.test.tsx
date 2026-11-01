import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { ConceptList } from '../ConceptList'
import { ComparisonTableFigure } from './ComparisonTableFigure'
import { DataMoveOptionsTable } from './azureDataMovementTables'

const topicId = 'azure-data-movement'
const concepts = topics.find(({ id }) => id === topicId)!.concepts

// 이 주제의 도구 다섯을 옮기는 방식과 알맞은 때로 견준다. 칸마다 다섯 개념 본문에 근거가 있다.
const dataMoveOptions = {
  id: 'data-move-options',
  conceptId: 'azure-data-movement.data-box',
  label: '데이터를 옮기는 도구 다섯 견주기',
  columns: ['도구', '옮기는 방식', '알맞은 때'],
  // 스크롤 막대(15px)가 낀 320px에서 표 폭은 273px이고 칸마다 9px가 빠진다. 28% 열 안쪽 67px에 행 머리의 가장 긴 덩어리 Explorer(굵기 500, 반각 여덟 글자, 좁은 글자가 많아 약 56px)와
  // 동기화(42px)가, 32% 열 안쪽 78px에 가장 긴 덩어리 명령줄에서·컴퓨터에(한글 다섯 글자 이하 70px)가, 40% 열 안쪽 100px에 데이터베이스,(한글 여섯 글자와 쉼표 약 88px)가 들어간다.
  columnWidths: ['28%', '32%', '40%'],
  sources: [
    'azure-data-movement.azcopy',
    'azure-data-movement.storage-explorer',
    'azure-data-movement.file-sync',
    'azure-data-movement.azure-migrate',
    'azure-data-movement.data-box',
  ],
  rows: [
    { header: 'AzCopy', cells: ['명령줄에서 복사, 한 방향 동기화', '명령으로 파일을 옮기거나 같은 전송을 스크립트로 되풀이할 때'] },
    { header: 'Azure Storage Explorer', cells: ['내 컴퓨터에 설치한 앱의 화면에서 다룸', '화면을 보며 파일을 올리고 내려받을 때'] },
    { header: 'Azure 파일 동기화', cells: ['Windows 파일 서버와 양쪽으로 저절로 맞춤', '파일 서버를 계속 쓰면서 파일을 Azure 파일 공유에 모을 때'] },
    { header: 'Azure Migrate', cells: ['허브에서 평가한 뒤 이전', '온-프레미스의 서버, 데이터베이스, 웹 앱 같은 것을 옮길 때'] },
    { header: 'Azure Data Box', cells: ['저장 장치에 담아 배송', '데이터가 크고 네트워크로 보내기 어려울 때'] },
  ],
}

function comparisonTable() {
  const visuals = visualsByTopicId[topicId]
  expect(visuals).toBeDefined()
  const table = visuals.tables[dataMoveOptions.id]
  expect(table).toBeDefined()
  return table
}

describe('데이터를 옮기는 도구 비교표', () => {
  it('주제의 시각 요소가 로더에 있고 약어 툴팁은 없다', () => {
    expect(visualsByTopicId[topicId].glossary).toEqual([])
  })

  it('표의 이름·열·열 폭·근거가 지정한 값이다', () => {
    const table = comparisonTable()
    expect(table.label).toBe(dataMoveOptions.label)
    expect(table.columns).toEqual(dataMoveOptions.columns)
    expect(table.columnWidths).toEqual(dataMoveOptions.columnWidths)
    expect(table.sources).toEqual(dataMoveOptions.sources)

    render(<DataMoveOptionsTable />)

    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(dataMoveOptions.columns)
  })

  it('행 순서와 칸 문구가 지정한 내용 그대로다', () => {
    const table = comparisonTable()
    expect(table.rows).toEqual(dataMoveOptions.rows)
    render(<ComparisonTableFigure table={table} />)

    expect(screen.getAllByRole('rowheader').map((header) => header.textContent)).toEqual(dataMoveOptions.rows.map(({ header }) => header))
    for (const { header, cells } of dataMoveOptions.rows) {
      const row = screen.getByRole('rowheader', { name: header }).closest('tr')!
      expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(cells)
    }
  })

  it('칸의 사실이 다섯 개념 본문에 있다', () => {
    const bodyOf = (id: string) => concepts.find((concept) => concept.id === id)!.paragraphs.join(' ')

    for (const fact of ['명령줄', '한 방향', '스크립트']) expect(bodyOf('azure-data-movement.azcopy'), fact).toContain(fact)
    for (const fact of ['설치', '화면', '올리고 내려받', '스크립트로 되풀이']) expect(bodyOf('azure-data-movement.storage-explorer'), fact).toContain(fact)
    for (const fact of ['Windows 파일 서버', '양쪽으로 저절로', 'Azure 파일 공유']) expect(bodyOf('azure-data-movement.file-sync'), fact).toContain(fact)
    for (const fact of ['허브', '평가', '온-프레미스', '서버', '데이터베이스', '웹 앱']) expect(bodyOf('azure-data-movement.azure-migrate'), fact).toContain(fact)
    for (const fact of ['저장 장치', '배송', '네트워크로 보내기 어려운']) expect(bodyOf('azure-data-movement.data-box'), fact).toContain(fact)
  })

  it('표 어디에도 O·X·○·× 한 글자 판정이 없다', () => {
    const table = comparisonTable()
    for (const text of [...table.columns, ...table.rows.flatMap(({ header, cells }) => [header, ...cells])]) {
      expect(text.trim(), text).not.toMatch(/^[OX○×]$/u)
    }
  })

  it('colgroup의 폭이 지정한 값이다', () => {
    render(<DataMoveOptionsTable />)

    const widths = Array.from(screen.getByRole('table').querySelectorAll('colgroup col'), (col) => (col as HTMLElement).style.width)
    expect(widths).toEqual(dataMoveOptions.columnWidths)
  })

  // 한 개념에 도식과 표가 함께 붙으면 도식이 먼저다(UI_GUIDE 「한 개념 뒤의 여러 도식」).
  it.each([2, 4] as const)('공유 본문 h%i에서 Data Box 개념의 도식 바로 뒤에 비교표 figure가 나온다', (headingLevel) => {
    const concept = concepts.find(({ id }) => id === dataMoveOptions.conceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)

    const table = screen.getByRole('figure', { name: dataMoveOptions.label })
    const article = table.closest('article')!
    expect(article).toHaveAttribute('id', concept.id)
    expect(within(article).getByRole('heading', { level: headingLevel, name: concept.name })).toBeInTheDocument()
    expect(screen.getAllByRole('figure')).toHaveLength(2)
    expect(screen.getAllByRole('figure')[1]).toBe(table)
    expect(article.lastElementChild).toBe(table)
    expect(within(table).getAllByRole('columnheader')).toHaveLength(dataMoveOptions.columns.length)
    expect(within(table).getAllByRole('rowheader')).toHaveLength(dataMoveOptions.rows.length)
  })
})
