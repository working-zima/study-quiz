import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { ConceptList } from '../ConceptList'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const topicId = 'azure-service-types'
const concepts = topics.find(({ id }) => id === topicId)!.concepts

// 세 서비스 유형을 고객이 맡는 것과 맞는 경우로 견준다. 칸마다 공유 책임 모델과 그 유형 개념의 본문에 근거가 있다.
const serviceTypes = {
  id: 'service-types',
  conceptId: 'azure-service-types.saas',
  label: '세 서비스 유형 견주기',
  columns: ['유형', '고객이 맡는 것', '맞는 경우'],
  // 스크롤 막대(15px)가 낀 320px에서 표 폭은 273px이고 칸마다 9px가 빠진다. 22% 열 안쪽 51px에 행 머리 IaaS·PaaS·SaaS
  // (굵기 500, 영문 네 글자 약 32px)와 열 이름 유형(한글 두 글자 28px)이, 40% 열 안쪽 100px에 칸의 가장 긴 덩어리
  // 데이터까지(한글 다섯 글자 70px)가, 38% 열 안쪽 94px에 마이그레이션,(한글 여섯 글자와 쉼표 약 88px)과 프레임워크로(84px)가 들어간다.
  columnWidths: ['22%', '40%', '38%'],
  sources: [
    'azure-service-types.shared-responsibility-model',
    'azure-service-types.iaas',
    'azure-service-types.paas',
    'azure-service-types.saas',
  ],
  rows: [
    { header: 'IaaS', cells: ['운영 체제의 설치와 구성, 패치부터 그 위의 앱과 데이터까지 모두', '리프트 앤 시프트 마이그레이션, 개발과 테스트 환경'] },
    { header: 'PaaS', cells: ['앱 코드와 데이터, 누가 앱에 접근할지 정하는 일. 일부 보안 설정은 공급자와 함께', '개발 프레임워크로 앱 만들기, 분석과 비즈니스 인텔리전스'] },
    { header: 'SaaS', cells: ['앱에 넣는 데이터, 계정과 접근 설정, 앱에 접속하는 장치 보호', '이메일과 메시지, 생산성 앱, 재무와 경비 관리'] },
  ],
}

// 행 머리는 세 유형 개념 이름의 약어 쪽이다(개념 이름 「IaaS(서비스형 인프라)」의 괄호 앞).
const typeConceptIds = serviceTypes.sources.slice(1)

function comparisonTable() {
  const visuals = visualsByTopicId[topicId]
  expect(visuals).toBeDefined()
  const table = visuals.tables[serviceTypes.id]
  expect(table).toBeDefined()
  return table
}

describe('세 서비스 유형 비교표', () => {
  it('주제의 시각 요소가 로더에 있고 약어 툴팁은 없다', () => {
    const visuals = visualsByTopicId[topicId]
    expect(visuals).toBeDefined()
    expect(visuals.glossary).toEqual([])
  })

  it('표의 이름·열·열 폭·근거가 지정한 값이다', () => {
    const table = comparisonTable()
    expect(table.label).toBe(serviceTypes.label)
    expect(table.columns).toEqual(serviceTypes.columns)
    expect(table.columnWidths).toEqual(serviceTypes.columnWidths)
    expect(table.sources).toEqual(serviceTypes.sources)

    render(<ComparisonTableFigure table={table} />)

    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(serviceTypes.columns)
  })

  it('행 머리가 개념 순서대로 유형 개념 이름의 약어이고 칸 문구가 지정한 내용 그대로다', () => {
    const table = comparisonTable()
    expect(table.rows).toEqual(serviceTypes.rows)
    expect(table.rows.map(({ header }) => header)).toEqual(
      typeConceptIds.map((source) => concepts.find(({ id }) => id === source)!.name.split('(')[0]),
    )
    render(<ComparisonTableFigure table={table} />)

    expect(screen.getAllByRole('rowheader').map((header) => header.textContent)).toEqual(serviceTypes.rows.map(({ header }) => header))
    for (const { header, cells } of serviceTypes.rows) {
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
    expect(widths).toEqual(serviceTypes.columnWidths)
  })

  // 세 유형을 다 읽은 자리인 SaaS 개념에 붙는다. 이 개념은 정의형이라 도식이 없다(phase 101 설계).
  it.each([2, 4] as const)('공유 본문 h%i에서 SaaS 개념의 본문 바로 뒤에 비교표 figure 하나가 나온다', (headingLevel) => {
    const concept = concepts.find(({ id }) => id === serviceTypes.conceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)

    const table = screen.getByRole('figure', { name: serviceTypes.label })
    const article = table.closest('article')!
    expect(article).toHaveAttribute('id', concept.id)
    expect(within(article).getByRole('heading', { level: headingLevel, name: concept.name })).toBeInTheDocument()
    expect(screen.getAllByRole('figure')).toEqual([table])
    expect(table.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*/gu, ''))
    expect(article.lastElementChild).toBe(table)
    expect(within(table).getAllByRole('columnheader')).toHaveLength(serviceTypes.columns.length)
    expect(within(table).getAllByRole('rowheader')).toHaveLength(serviceTypes.rows.length)
  })
})
