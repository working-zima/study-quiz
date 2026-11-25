import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { ConceptList } from '../ConceptList'
import { ComparisonTableFigure } from './ComparisonTableFigure'
import { CostToolsTable } from './azureCostManagementTables'

const topicId = 'azure-cost-management'
const concepts = topics.find(({ id }) => id === topicId)!.concepts

// 비용을 다루는 네 도구를 리소스에 미치는 영향으로 견준다. 칸의 사실은 이 주제의 네 개념 본문에 있다.
const costTools = {
  id: 'cost-tools',
  conceptId: 'azure-cost-management.spending-limit',
  label: '비용 도구 넷 견주기',
  columns: ['도구', '하는 일', '리소스에 미치는 영향'],
  // 스크롤 막대(15px)가 낀 320px에서 표 폭은 273px이고 칸마다 9px가 빠진다. 26% 열 안쪽 62px에 행 머리의 「비용」·「분석」·「한도」(굵기 500, 한글 두 글자 28px)가 들어간다.
  // 37% 열 안쪽 92px에 칸의 가장 긴 덩어리 「크레딧보다」(70px)가 들어간다. 가운뎃점으로 낱말을 잇지 않는다(UI_GUIDE 「타이포그래피」).
  columnWidths: ['26%', '37%', '37%'],
  sources: ['azure-cost-management.cost-analysis', 'azure-cost-management.budgets', 'azure-cost-management.cost-alerts', 'azure-cost-management.spending-limit'],
  rows: [
    { header: '비용 분석', cells: ['쓴 비용을 여러 기준으로 나눠 본다', '없다'] },
    { header: '예산', cells: ['쓴 비용이 기준에 닿으면 경고를 낸다', '자동화를 따로 설정해야 리소스를 멈춘다'] },
    { header: '비용 경고', cells: ['경고를 한곳에 모아 보여 준다', '없다'] },
    { header: '지출 한도', cells: ['크레딧보다 더 쓰지 못하게 막는다', '서비스를 실제로 멈춘다'] },
  ],
}

function table() {
  return visualsByTopicId[topicId].tables[costTools.id]
}

// 주제 첫 개념의 요약 바로 아래에서 상황마다 어떤 비용 도구를 쓸지 먼저 보인다.
const costToolChoice = {
  id: 'cost-tool-choice',
  conceptId: `${topicId}.cost-management`,
  label: '상황별 Azure 비용 관리 도구 선택',
  columns: ['도구', '이럴 때 쓴다'],
  columnWidths: ['35%', '65%'],
  sources: [
    'azure-cost-management.cost-analysis',
    'azure-cost-management.budgets',
    'azure-cost-management.cost-alerts',
    'azure-cost-management.tags',
    'azure-cost-management.spending-limit',
  ],
  rows: [
    { header: '비용 분석', cells: ['이미 쓴 비용을 서비스나 지역별로 나눠 어디에 돈이 들었는지 살펴본다'] },
    { header: '예산', cells: ['실제 비용이나 예측 비용에 알림 기준을 정한다'] },
    { header: '비용 경고', cells: ['발생한 경고를 포털에서 한곳에 모아 본다'] },
    { header: '태그', cells: ['부서 정보를 붙여 한 구독 안에서도 부서별 비용을 나눠 본다'] },
    { header: '지출 한도', cells: ['크레딧을 다 쓰면 해당 구독에서 배포한 서비스가 멈춘다'] },
  ],
}

it('비용 관리 도구 선택표의 이름·열·열 폭·근거·행이 지정한 값이다', () => {
  const choice = visualsByTopicId[topicId].tables[costToolChoice.id]
  expect(choice.label).toBe(costToolChoice.label)
  expect(choice.columns).toEqual(costToolChoice.columns)
  expect(choice.columnWidths).toEqual(costToolChoice.columnWidths)
  expect(choice.sources).toEqual(costToolChoice.sources)
  expect(choice.rows).toEqual(costToolChoice.rows)
  expect(choice.shortcut).toBeUndefined()
})

it.each([2, 4] as const)('공유 본문 h%i에서 비용 관리 도구 선택표를 요약 바로 아래에 보인다', (headingLevel) => {
  const concept = concepts.find(({ id }) => id === costToolChoice.conceptId)!
  render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)

  const figure = screen.getByRole('figure', { name: costToolChoice.label })
  expect(figure.closest('article')).toHaveAttribute('id', concept.id)
  expect(within(figure.closest('article')!).getByRole('heading', { level: headingLevel, name: concept.name })).toBeInTheDocument()
  expect(figure.previousElementSibling).toHaveTextContent(concept.summary)
  expect(figure.nextElementSibling).toHaveTextContent(concept.paragraphs[0])
  expect(within(figure).getAllByRole('rowheader').map(({ textContent }) => textContent)).toEqual([
    '비용 분석', '예산', '비용 경고', '태그', '지출 한도',
  ])
  expect(within(figure).getByRole('row', { name: /비용 분석/u })).toHaveTextContent('어디에 돈이 들었는지')
  expect(within(figure).getByRole('row', { name: /^예산/u })).toHaveTextContent('알림 기준')
  expect(within(figure).getByRole('row', { name: /비용 경고/u })).toHaveTextContent('한곳에 모아')
  expect(within(figure).getByRole('row', { name: /태그/u })).toHaveTextContent('한 구독 안에서도 부서별 비용')
  expect(within(figure).getByRole('row', { name: /지출 한도/u })).toHaveTextContent('배포한 서비스가 멈춘다')
})

describe('비용 도구 비교표', () => {
  it('주제의 시각 요소가 로더에 있고 약어 툴팁은 없다', () => {
    expect(visualsByTopicId[topicId].glossary).toEqual([])
  })

  it('표의 이름·열·열 폭·근거가 지정한 값이다', () => {
    expect(table().label).toBe(costTools.label)
    expect(table().columns).toEqual(costTools.columns)
    expect(table().columnWidths).toEqual(costTools.columnWidths)
    expect(table().sources).toEqual(costTools.sources)
    expect(table().shortcut).toEqual({ id: 'cost-tools-table', label: '비용 도구 비교표로 바로 가기' })

    render(<CostToolsTable />)

    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(costTools.columns)
  })

  it('행 순서와 칸 문구가 지정한 내용 그대로다', () => {
    expect(table().rows).toEqual(costTools.rows)
    render(<ComparisonTableFigure table={table()} />)

    expect(screen.getAllByRole('rowheader').map((header) => header.textContent)).toEqual(costTools.rows.map(({ header }) => header))
    for (const { header, cells } of costTools.rows) {
      const row = screen.getByRole('rowheader', { name: header }).closest('tr')!
      expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(cells)
    }
  })

  it('칸의 사실이 근거 개념의 본문에 있다', () => {
    const bodyOf = (slug: string) => concepts.find(({ id }) => id === `${topicId}.${slug}`)!.paragraphs.join(' ')

    for (const fact of ['쓴 비용', '나눠 보는 기능', '리소스를 멈추거나 바꾸지 않는다']) expect(bodyOf('cost-analysis'), fact).toContain(fact)
    for (const fact of ['쓴 비용이 그 기준에 닿으면 경고를 내는', '자동화를 따로 설정해야']) expect(bodyOf('budgets'), fact).toContain(fact)
    for (const fact of ['한곳에 모아', '리소스는 바뀌지 않는다']) expect(bodyOf('cost-alerts'), fact).toContain(fact)
    for (const fact of ['크레딧', '더 쓰지 못하게 막는', '서비스를 실제로 멈춘다']) expect(bodyOf('spending-limit'), fact).toContain(fact)
  })

  it('예산 행에 한도라는 말을 쓰지 않고, 표 어디에도 O·X 한 글자 판정과 금액이 없다', () => {
    const budget = table().rows.find(({ header }) => header === '예산')!
    expect(budget.cells.join(' ')).not.toContain('한도')
    for (const text of [...table().columns, ...table().rows.flatMap(({ header, cells }) => [header, ...cells])]) {
      expect(text.trim(), text).not.toMatch(/^[OX○×]$/u)
      expect(text, text).not.toMatch(/%|달러|\$/u)
    }
  })

  it('colgroup의 폭이 지정한 값이다', () => {
    render(<CostToolsTable />)

    const widths = Array.from(screen.getByRole('table').querySelectorAll('colgroup col'), (col) => (col as HTMLElement).style.width)
    expect(widths).toEqual(costTools.columnWidths)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 도식 뒤, 개념의 맨 끝에 비교표 figure가 나온다', (headingLevel) => {
    const concept = concepts.find(({ id }) => id === costTools.conceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)

    const figure = screen.getByRole('figure', { name: costTools.label })
    const article = figure.closest('article')!
    expect(article).toHaveAttribute('id', concept.id)
    expect(within(article).getByRole('heading', { level: headingLevel, name: concept.name })).toBeInTheDocument()
    expect(screen.getAllByRole('figure')).toHaveLength(2)
    expect(screen.getAllByRole('figure')[1]).toBe(figure)
    expect(article.lastElementChild).toBe(figure)
  })
})
