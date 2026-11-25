import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { ConceptList } from '../ConceptList'
import { ComparisonTableFigure } from './ComparisonTableFigure'
import { CostSavingOptionsTable } from './azureCostFactorsTables'

const topicId = 'azure-cost-factors'
const concepts = topics.find(({ id }) => id === topicId)!.concepts

// 할인 방식 넷을 무엇을 내놓고 할인을 받는가로 견준다. 칸의 사실은 이 주제의 세 개념 본문에 있다.
const savingOptions = {
  id: 'cost-saving-options',
  conceptId: 'azure-cost-factors.hybrid-benefit',
  label: '할인 방식 넷 견주기',
  columns: ['방식', '내놓는 것', '맞는 작업'],
  // 스크롤 막대(15px)가 낀 320px에서 표 폭은 273px이고 칸마다 9px가 빠진다. 30% 열 안쪽 73px에 행 머리의 가장 긴 덩어리 「하이브리드」(굵기 500, 한글 다섯 글자 70px)가 들어간다.
  // 35% 열 안쪽 87px에 칸의 가장 긴 덩어리 「받아들인다」(70px)와 「Windows」(약 56px)가 들어간다. 가운뎃점으로 낱말을 잇지 않는다(UI_GUIDE 「타이포그래피」).
  columnWidths: ['30%', '35%', '35%'],
  sources: ['azure-cost-factors.cost-factors', 'azure-cost-factors.savings-plan', 'azure-cost-factors.hybrid-benefit'],
  rows: [
    { header: '예약', cells: ['특정 리소스와 지역에 1년이나 3년 약정', '쉬지 않고 실행되고 크기나 지역이 바뀌지 않는 작업'] },
    { header: '저축 플랜', cells: ['시간당 쓸 금액을 1년이나 3년 약정', '여러 서비스를 쓰거나 여러 지역에서 실행하는 작업'] },
    { header: '스폿 가상 머신', cells: ['언제든 회수될 수 있음을 받아들인다', '도중에 멈춰도 되는 작업'] },
    { header: '하이브리드 혜택', cells: ['이미 가진 라이선스', 'Windows Server나 SQL Server를 Azure에서 실행하는 작업'] },
  ],
}

function table() {
  return visualsByTopicId[topicId].tables[savingOptions.id]
}

// 비용 요인 개념의 요약 바로 아래에서 요금을 가르는 요인과 가격 계산기로 무엇을 살펴볼지 먼저 보인다.
const costFactorsOverview = {
  id: 'cost-factors-overview',
  conceptId: `${topicId}.cost-factors`,
  label: 'Azure 비용 요인과 가격 계산기',
  columns: ['확인할 항목', '무엇을 살펴보나'],
  columnWidths: ['38%', '62%'],
  sources: ['azure-cost-factors.cost-factors', 'azure-cost-factors.pricing-calculator'],
  rows: [
    { header: '리소스 종류와 지역', cells: ['리소스의 종류와 설정, 배포할 지역에 따라 단가가 달라질 수 있다'] },
    { header: '사용량과 유지 관리', cells: ['얼마나 쓰는지, 쓰지 않는 디스크 같은 리소스가 남아 있는지 확인한다'] },
    { header: '구독 유형과 Marketplace', cells: ['구독의 무료 사용량과 Marketplace 판매 업체의 추가 요금을 확인한다'] },
    { header: '가격 계산기', cells: ['배포 전에 리소스 구성과 예상 사용량을 넣어 월 예상 비용을 비교한다'] },
  ],
}

it('비용 요인 개요표의 이름·열·열 폭·근거·행이 지정한 값이다', () => {
  const overview = visualsByTopicId[topicId].tables[costFactorsOverview.id]
  expect(overview.label).toBe(costFactorsOverview.label)
  expect(overview.columns).toEqual(costFactorsOverview.columns)
  expect(overview.columnWidths).toEqual(costFactorsOverview.columnWidths)
  expect(overview.sources).toEqual(costFactorsOverview.sources)
  expect(overview.rows).toEqual(costFactorsOverview.rows)
  expect(overview.shortcut).toBeUndefined()
})

it.each([2, 4] as const)('공유 본문 h%i에서 비용 요인 개요표를 요약 바로 아래에 보인다', (headingLevel) => {
  const concept = concepts.find(({ id }) => id === costFactorsOverview.conceptId)!
  render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)

  const figure = screen.getByRole('figure', { name: costFactorsOverview.label })
  expect(figure.closest('article')).toHaveAttribute('id', concept.id)
  expect(within(figure.closest('article')!).getByRole('heading', { level: headingLevel, name: concept.name })).toBeInTheDocument()
  expect(figure.previousElementSibling).toHaveTextContent(concept.summary)
  expect(figure.nextElementSibling).toHaveTextContent(concept.paragraphs[0])
  expect(within(figure).getAllByRole('rowheader').map(({ textContent }) => textContent)).toEqual(costFactorsOverview.rows.map(({ header }) => header))
  for (const { header, cells } of costFactorsOverview.rows) {
    const row = within(figure).getByRole('rowheader', { name: header }).closest('tr')!
    expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(cells)
  }
})

describe('할인 방식 비교표', () => {
  it('주제의 시각 요소가 로더에 있고 약어 툴팁은 없다', () => {
    expect(visualsByTopicId[topicId].glossary).toEqual([])
  })

  it('표의 이름·열·열 폭·근거가 지정한 값이다', () => {
    expect(table().label).toBe(savingOptions.label)
    expect(table().columns).toEqual(savingOptions.columns)
    expect(table().columnWidths).toEqual(savingOptions.columnWidths)
    expect(table().sources).toEqual(savingOptions.sources)
    expect(table().shortcut).toEqual({ id: 'cost-saving-options-table', label: '비용 절감 옵션 비교표로 바로 가기' })

    render(<CostSavingOptionsTable />)

    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(savingOptions.columns)
  })

  it('행 순서와 칸 문구가 지정한 내용 그대로다', () => {
    expect(table().rows).toEqual(savingOptions.rows)
    render(<ComparisonTableFigure table={table()} />)

    expect(screen.getAllByRole('rowheader').map((header) => header.textContent)).toEqual(savingOptions.rows.map(({ header }) => header))
    for (const { header, cells } of savingOptions.rows) {
      const row = screen.getByRole('rowheader', { name: header }).closest('tr')!
      expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(cells)
    }
  })

  it('칸의 사실이 이 주제의 개념 본문에 있다', () => {
    const body = concepts.filter(({ id }) => savingOptions.sources.includes(id)).flatMap(({ paragraphs }) => paragraphs).join(' ')

    for (const fact of ['1년이나 3년 약정', 'VM 크기나 지역이 바뀔 일이 없는 작업', '시간당 쓸 금액', '여러 지역에서 실행', '언제든 회수', '받아들이고', '도중에 멈춰도 되는 작업', '이미 가진 라이선스', 'Windows Server나 SQL Server']) {
      expect(body, fact).toContain(fact)
    }
  })

  it('표 어디에도 O·X·○·× 한 글자 판정이 없고 할인율 숫자가 없다', () => {
    for (const text of [...table().columns, ...table().rows.flatMap(({ header, cells }) => [header, ...cells])]) {
      expect(text.trim(), text).not.toMatch(/^[OX○×]$/u)
      expect(text, text).not.toMatch(/%/u)
    }
  })

  it('colgroup의 폭이 지정한 값이다', () => {
    render(<CostSavingOptionsTable />)

    const widths = Array.from(screen.getByRole('table').querySelectorAll('colgroup col'), (col) => (col as HTMLElement).style.width)
    expect(widths).toEqual(savingOptions.columnWidths)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 도식 뒤, 개념의 맨 끝에 비교표 figure가 나온다', (headingLevel) => {
    const concept = concepts.find(({ id }) => id === savingOptions.conceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)

    const figure = screen.getByRole('figure', { name: savingOptions.label })
    const article = figure.closest('article')!
    expect(article).toHaveAttribute('id', concept.id)
    expect(within(article).getByRole('heading', { level: headingLevel, name: concept.name })).toBeInTheDocument()
    expect(screen.getAllByRole('figure')).toHaveLength(2)
    expect(screen.getAllByRole('figure')[0]).toBe(screen.getByRole('figure', { name: visualsByTopicId[topicId].diagrams['hybrid-benefit'].label }))
    expect(screen.getAllByRole('figure')[1]).toBe(figure)
    expect(article.lastElementChild).toBe(figure)
    expect(figure).toHaveAttribute('id', 'cost-saving-options-table')
    expect(figure).toHaveClass('scroll-mt-24')
  })
})
