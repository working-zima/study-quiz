import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { ConceptList } from '../ConceptList'
import { ComparisonTableFigure } from './ComparisonTableFigure'
import { GovernanceToolsTable } from './azureGovernanceTables'

const topicId = 'azure-governance'
const concepts = topics.find(({ id }) => id === topicId)!.concepts

// 리소스를 지키는 세 도구를 정하는 것과 막는 일로 견준다. 칸의 사실은 이 주제의 Azure Policy·리소스 잠금·잠금 상속 본문에 있다.
const governanceTools = {
  id: 'governance-tools',
  conceptId: 'azure-governance.lock-inheritance',
  label: '리소스를 지키는 세 도구 견주기',
  columns: ['도구', '정하는 것', '막는 일'],
  // 스크롤 막대(15px)가 낀 320px에서 표 폭은 273px이고 칸마다 9px가 빠진다. 26% 열 안쪽 62px에 행 머리의 가장 긴 덩어리
  // 「Policy」·「리소스」(굵기 500, 약 42px)가 들어간다. 37% 열 안쪽 92px에 칸의 가장 긴 덩어리 「거부하도록」(한글 다섯 글자 70px)이 들어간다.
  // 낱말을 가운뎃점으로 잇지 않고 쉼표로 띄운다(UI_GUIDE 「타이포그래피」).
  columnWidths: ['26%', '37%', '37%'],
  sources: ['azure-governance.azure-policy', 'azure-governance.resource-locks', 'azure-governance.lock-inheritance'],
  rows: [
    { header: 'Azure RBAC', cells: ['누가 어느 범위에서 어떤 작업을 할 수 있는가', '역할이 허락하지 않은 작업'] },
    { header: 'Azure Policy', cells: ['리소스가 따라야 할 지역, 크기, 태그 같은 규칙', '거부하도록 만든 정책이면 규칙에 어긋난 리소스를 만들거나 바꾸는 요청'] },
    { header: '리소스 잠금', cells: ['리소스를 지울 수 있는가, 바꿀 수 있는가', '역할이 허락해도 실수로 지우거나 바꾸는 일'] },
  ],
}

function table() {
  return visualsByTopicId[topicId].tables[governanceTools.id]
}

describe('거버넌스 도구 비교표', () => {
  it('주제의 시각 요소가 로더에 있고 약어 툴팁은 없다', () => {
    expect(visualsByTopicId[topicId].glossary).toEqual([])
  })

  it('표의 이름·열·열 폭·근거가 지정한 값이다', () => {
    expect(table().label).toBe(governanceTools.label)
    expect(table().columns).toEqual(governanceTools.columns)
    expect(table().columnWidths).toEqual(governanceTools.columnWidths)
    expect(table().sources).toEqual(governanceTools.sources)

    render(<GovernanceToolsTable />)

    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(governanceTools.columns)
  })

  it('행 순서와 칸 문구가 지정한 내용 그대로다', () => {
    expect(table().rows).toEqual(governanceTools.rows)
    render(<ComparisonTableFigure table={table()} />)

    expect(screen.getAllByRole('rowheader').map((header) => header.textContent)).toEqual(governanceTools.rows.map(({ header }) => header))
    for (const { header, cells } of governanceTools.rows) {
      const row = screen.getByRole('rowheader', { name: header }).closest('tr')!
      expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(cells)
    }
  })

  it('칸의 사실이 근거 개념의 본문에 있다', () => {
    const bodyOf = (slug: string) => concepts.find(({ id }) => id === `${topicId}.${slug}`)!.paragraphs.join(' ')
    const inheritance = bodyOf('lock-inheritance')

    for (const fact of [
      '누가 어느 범위에서 어떤 작업을 할 수 있는지',
      '역할이 허락하지 않은 작업',
      '지역, 크기, 태그 같은 규칙',
      '거부하도록 만든 정책이면 규칙에 어긋난 리소스를 만들거나 바꾸는 요청을 막는다',
      '리소스를 지울 수 있는지, 바꿀 수 있는지',
      '실수로 지우거나 바꾸는 일을 막는다',
    ]) expect(inheritance, fact).toContain(fact)
    for (const fact of ['누가 어느 범위에서 어떤 작업을 할 수 있는지', '거부하도록 만든 정책에 어긋나면']) expect(bodyOf('azure-policy'), fact).toContain(fact)
    for (const fact of ['역할과 상관없이 적용된다', '지우거나 바꾸는 일 자체를 막는다']) expect(bodyOf('resource-locks'), fact).toContain(fact)
  })

  it('표 어디에도 O·X 한 글자 판정, 백틱, 가운뎃점, 효과·잠금의 영문 이름이 없다', () => {
    for (const text of [...table().columns, ...table().rows.flatMap(({ header, cells }) => [header, ...cells])]) {
      expect(text.trim(), text).not.toMatch(/^[OX○×]$/u)
      expect(text, text).not.toMatch(/[`·]|Deny|Audit|Modify|CanNotDelete|ReadOnly/u)
    }
  })

  it('colgroup의 폭이 지정한 값이다', () => {
    render(<GovernanceToolsTable />)

    const widths = Array.from(screen.getByRole('table').querySelectorAll('colgroup col'), (col) => (col as HTMLElement).style.width)
    expect(widths).toEqual(governanceTools.columnWidths)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 도식 뒤, 개념의 맨 끝에 비교표 figure가 나온다', (headingLevel) => {
    const concept = concepts.find(({ id }) => id === governanceTools.conceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)

    const figure = screen.getByRole('figure', { name: governanceTools.label })
    const article = figure.closest('article')!
    expect(article).toHaveAttribute('id', concept.id)
    expect(within(article).getByRole('heading', { level: headingLevel, name: concept.name })).toBeInTheDocument()
    expect(screen.getAllByRole('figure')).toHaveLength(2)
    expect(screen.getAllByRole('figure')[1]).toBe(figure)
    expect(article.lastElementChild).toBe(figure)
  })
})
