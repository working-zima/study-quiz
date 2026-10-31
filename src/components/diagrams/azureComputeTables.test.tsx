import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { ConceptList } from '../ConceptList'
import { ComparisonTableFigure } from './ComparisonTableFigure'
import { HostingOptionsTable } from './azureComputeTables'

const topicId = 'azure-compute'
const concepts = topics.find(({ id }) => id === topicId)!.concepts

// 앱을 실행할 네 곳을 고객이 관리하는 것과 알맞은 일로 견준다. 칸마다 그 곳을 다룬 개념 본문에 근거가 있다.
const hostingOptions = {
  id: 'hosting-options',
  conceptId: 'azure-compute.app-service',
  label: '앱을 실행할 네 곳 견주기',
  columns: ['실행할 곳', '고객이 관리하는 것', '알맞은 일'],
  // 스크롤 막대(15px)가 낀 320px에서 표 폭은 273px이고 칸마다 9px가 빠진다. 28% 열 안쪽 67px에 행 머리의 가장 긴 덩어리
  // Functions(굵기 500, 영문 아홉 글자 약 64px)와 컨테이너(한글 네 글자 56px)가, 34% 열 안쪽 84px에 소프트웨어,(한글 다섯 글자와
  // 쉼표 약 74px)와 컨테이너의(70px)가, 38% 열 안쪽 95px에 소프트웨어(70px)와 백그라운드(70px)가 들어간다.
  columnWidths: ['28%', '34%', '38%'],
  sources: [
    'azure-compute.virtual-machines',
    'azure-compute.containers',
    'azure-compute.functions',
    'azure-compute.app-service',
  ],
  rows: [
    { header: '가상 머신', cells: ['운영 체제와 그 위의 소프트웨어, 패치와 구성까지', '운영 체제를 직접 통제해야 하는 일, 직접 만든 소프트웨어 실행'] },
    { header: '컨테이너', cells: ['컨테이너에 담을 앱. 컨테이너의 운영 체제는 맡지 않는다', '빨리 만들고 늘리고 멈추는 일, 앱을 부분마다 따로 관리하는 마이크로 서비스'] },
    { header: 'Azure Functions', cells: ['함수의 코드. 서버와 운영 체제는 맡지 않는다', '이벤트에 따라 실행되어 몇 초 안에 끝나는 일'] },
    { header: 'Azure App Service', cells: ['앱을 만들고 유지하는 일. 서버와 운영 체제는 맡지 않는다', '늘 웹 요청을 받는 웹앱과 REST API, 백그라운드 작업'] },
  ],
}

function comparisonTable() {
  const visuals = visualsByTopicId[topicId]
  expect(visuals).toBeDefined()
  const table = visuals.tables[hostingOptions.id]
  expect(table).toBeDefined()
  return table
}

describe('앱을 실행할 네 곳 비교표', () => {
  it('주제의 시각 요소가 로더에 있고 약어 툴팁은 없다', () => {
    expect(visualsByTopicId[topicId].glossary).toEqual([])
  })

  it('표의 이름·열·열 폭·근거가 지정한 값이다', () => {
    const table = comparisonTable()
    expect(table.label).toBe(hostingOptions.label)
    expect(table.columns).toEqual(hostingOptions.columns)
    expect(table.columnWidths).toEqual(hostingOptions.columnWidths)
    expect(table.sources).toEqual(hostingOptions.sources)

    render(<HostingOptionsTable />)

    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(hostingOptions.columns)
  })

  it('행 머리가 개념 순서대로 개념 이름에서 오고 칸 문구가 지정한 내용 그대로다', () => {
    const table = comparisonTable()
    expect(table.rows).toEqual(hostingOptions.rows)
    // 가상 머신 개념의 이름은 「가상 머신(Azure Virtual Machines)」이라 괄호 앞을 행 머리로 쓴다.
    expect(table.rows.map(({ header }) => header)).toEqual(
      hostingOptions.sources.map((source) => concepts.find(({ id }) => id === source)!.name.split('(')[0]),
    )
    render(<ComparisonTableFigure table={table} />)

    expect(screen.getAllByRole('rowheader').map((header) => header.textContent)).toEqual(hostingOptions.rows.map(({ header }) => header))
    for (const { header, cells } of hostingOptions.rows) {
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
    render(<HostingOptionsTable />)

    const widths = Array.from(screen.getByRole('table').querySelectorAll('colgroup col'), (col) => (col as HTMLElement).style.width)
    expect(widths).toEqual(hostingOptions.columnWidths)
  })

  // App Service 개념은 네 곳을 견주는 문단으로 끝나고, 표가 그 바로 뒤에 붙는다. 이 개념에는 도식이 없다(guide 「도식」).
  it.each([2, 4] as const)('공유 본문 h%i에서 App Service 개념의 본문 바로 뒤에 비교표 figure 하나가 나온다', (headingLevel) => {
    const concept = concepts.find(({ id }) => id === hostingOptions.conceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)

    const table = screen.getByRole('figure', { name: hostingOptions.label })
    const article = table.closest('article')!
    expect(article).toHaveAttribute('id', concept.id)
    expect(within(article).getByRole('heading', { level: headingLevel, name: concept.name })).toBeInTheDocument()
    expect(screen.getAllByRole('figure')).toEqual([table])
    expect(table.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*/gu, ''))
    expect(article.lastElementChild).toBe(table)
    expect(within(table).getAllByRole('columnheader')).toHaveLength(hostingOptions.columns.length)
    expect(within(table).getAllByRole('rowheader')).toHaveLength(hostingOptions.rows.length)
  })
})
