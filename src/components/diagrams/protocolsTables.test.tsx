import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { topics, visualsByTopicId } from '../../data/network'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { ConceptList } from '../ConceptList'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const topicId = 'protocols-encapsulation'
const concepts = topics.find(({ id }) => id === topicId)!.concepts

// 행은 위 계층부터다. OSI 칸은 tcp-ip-model 목록 항목이 짝지은 계층을 위에서부터 적고, 하는 일은 두 개념 본문의 말로 쓴다.
const referenceModels = {
  id: 'reference-models',
  conceptId: 'protocols-encapsulation.tcp-ip-model',
  label: 'TCP/IP 모델과 OSI 모델의 계층 대응',
  columns: ['TCP/IP 모델', 'OSI 모델', '하는 일'],
  // 스크롤 막대(15px)가 낀 320px에서 표 폭은 273px이다. 26% 열 안쪽 63px에 행 머리의 가장 긴 덩어리 네트워크(한글 네 글자 56px)와
  // 열 머리 TCP/IP(약 46px)가, 28% 열 안쪽 68px에 OSI 칸의 네트워크(56px)가, 46% 열 안쪽 117px에 하는 일 칸의 가장 긴 덩어리
  // 프로토콜이·프로그램이·호스트에서(한글 다섯 글자 70px)가 들어간다.
  columnWidths: ['26%', '28%', '46%'],
  sources: ['protocols-encapsulation.osi-model', 'protocols-encapsulation.tcp-ip-model'],
  rows: [
    { header: '응용 계층', cells: ['응용, 표현, 세션 계층', '웹 페이지를 주고받는 HTTP처럼 응용 프로그램이 직접 쓰는 프로토콜이 속한다'] },
    { header: '전송 계층', cells: ['전송 계층', '통신의 양 끝에 있는 응용 프로그램에 데이터를 전달한다. TCP는 신뢰성을 더하고 UDP는 더하지 않는다'] },
    { header: '인터넷 계층', cells: ['네트워크 계층', 'IP가 IP 주소로 목적지를 가리고, 출발지 호스트에서 목적지 호스트까지 데이터를 나른다'] },
    { header: '네트워크 액세스 계층', cells: ['데이터 링크, 물리 계층', '직접 이어진 네트워크 안에서 통신할 때 쓰는 프로토콜이 속한다. 이더넷이 그 예다'] },
  ],
}

function comparisonTable() {
  const visuals = visualsByTopicId[topicId]
  expect(visuals).toBeDefined()
  const table = visuals.tables[referenceModels.id]
  expect(table).toBeDefined()
  return table
}

describe('참조 모델 대응표', () => {
  it('주제의 시각 요소가 로더에 있고 약어 툴팁은 없다', () => {
    const visuals = visualsByTopicId[topicId]
    expect(visuals).toBeDefined()
    expect(visuals.glossary).toEqual([])
  })

  it('표의 이름·열·열 폭·근거가 지정한 값이다', () => {
    const table = comparisonTable()
    expect(table.label).toBe(referenceModels.label)
    expect(table.columns).toEqual(referenceModels.columns)
    expect(table.columnWidths).toEqual(referenceModels.columnWidths)
    expect(table.sources).toEqual(referenceModels.sources)

    render(<ComparisonTableFigure table={table} />)

    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(referenceModels.columns)
  })

  it('행 머리가 위 계층부터 응용·전송·인터넷·네트워크 액세스 순이고 칸 문구가 지정한 내용 그대로다', () => {
    const table = comparisonTable()
    expect(table.rows).toEqual(referenceModels.rows)
    expect(table.rows.map(({ header }) => header)).toEqual(['응용 계층', '전송 계층', '인터넷 계층', '네트워크 액세스 계층'])
    render(<ComparisonTableFigure table={table} />)

    expect(screen.getAllByRole('rowheader').map((header) => header.textContent)).toEqual(referenceModels.rows.map(({ header }) => header))
    for (const { header, cells } of referenceModels.rows) {
      const row = screen.getByRole('rowheader', { name: header }).closest('tr')!
      expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(cells)
    }
  })

  it('행 머리와 OSI 칸의 계층 이름이 두 모델 개념의 목록 항목 이름이다', () => {
    const itemNames = (conceptId: string) => concepts.find(({ id }) => id === conceptId)!.paragraphs
      .flatMap((paragraph) => [...paragraph.matchAll(/^- \*\*(.+?) 계층\*\*/gu)].map(([, name]) => name))
    const tcpIpLayers = itemNames('protocols-encapsulation.tcp-ip-model')
    const osiLayers = itemNames('protocols-encapsulation.osi-model')
    const table = comparisonTable()

    expect(table.rows.map(({ header }) => header.replace(/ 계층$/u, ''))).toEqual([...tcpIpLayers].reverse())
    const osiInCells = table.rows.flatMap(({ cells }) => cells[0].replace(/ 계층$/u, '').split(', '))
    expect(osiInCells).toEqual([...osiLayers].reverse())
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
    expect(widths).toEqual(referenceModels.columnWidths)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 TCP/IP 모델 개념의 본문 바로 뒤에 비교표 figure 하나가 나온다', (headingLevel) => {
    const concept = concepts.find(({ id }) => id === referenceModels.conceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)

    const table = screen.getByRole('figure', { name: referenceModels.label })
    const article = table.closest('article')!
    expect(article).toHaveAttribute('id', concept.id)
    expect(within(article).getByRole('heading', { level: headingLevel, name: concept.name })).toBeInTheDocument()
    expect(screen.getAllByRole('figure')).toEqual([table])
    expect(table.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*/gu, ''))
    expect(article.lastElementChild).toBe(table)
    expect(within(table).getAllByRole('columnheader')).toHaveLength(referenceModels.columns.length)
    expect(within(table).getAllByRole('rowheader')).toHaveLength(referenceModels.rows.length)
  })
})
