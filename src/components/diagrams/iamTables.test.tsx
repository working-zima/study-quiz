import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { ConceptList } from '../ConceptList'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const topicId = 'iam-permissions'
const concepts = topics.find(({ id }) => id === topicId)!.concepts

const groupMembers = {
  id: 'group-members',
  conceptId: 'iam-permissions.iam-user-is-account-scoped',
  label: 'IAM 그룹에 넣을 수 있는 것',
  columns: ['대상', '그룹에 넣기', '권한을 주는 방법'],
  columnWidths: ['34%', '20%', '46%'],
  sources: [
    'iam-permissions.iam-user',
    'iam-permissions.iam-group-users-only',
    'iam-permissions.iam-user-is-account-scoped',
    'iam-permissions.iam-policy',
  ],
  rows: [
    { header: '같은 계정의 IAM 사용자', cells: ['가능', '그룹에 넣으면 그룹에 붙인 정책을 받는다'] },
    { header: '다른 계정의 IAM 사용자', cells: ['불가', '자원이 있는 계정의 역할을 신뢰 정책으로 허용한다'] },
    { header: 'EC2 인스턴스', cells: ['불가', 'IAM 역할을 쓴다'] },
    { header: 'IAM 역할', cells: ['불가', '역할에 정책을 직접 붙인다'] },
  ],
}

const credentials = {
  id: 'credentials',
  conceptId: 'iam-permissions.iam-role',
  label: 'IAM 사용자와 IAM 역할의 자격 증명',
  columns: ['견주는 것', 'IAM 사용자', 'IAM 역할'],
  columnWidths: ['24%', '40%', '36%'],
  sources: ['iam-permissions.iam', 'iam-permissions.iam-user', 'iam-permissions.iam-role'],
  rows: [
    { header: '접근 수단', cells: ['액세스 키(만료 시점 없음)', '역할을 맡아 받는 임시 자격 증명'] },
    { header: '보관과 전달', cells: ['사용자가 키를 직접 보관한다', '자격 증명을 서로 건넬 필요가 없다'] },
    { header: '멈추는 방법', cells: ['키를 비활성화하거나 삭제한다. 그 전까지 계속 유효하다', '필요할 때 언제든 역할을 해제한다'] },
  ],
}

const analyzerTools = {
  id: 'analyzer-tools',
  conceptId: 'iam-permissions.network-access-analyzer',
  label: '권한 검토에서 함께 비교되는 것',
  columns: ['도구·구성', '다루는 것', '하는 일'],
  columnWidths: ['34%', '26%', '40%'],
  sources: [
    'iam-permissions.iam-access-analyzer',
    'iam-permissions.network-access-analyzer',
    'iam-permissions.permissions-boundary',
  ],
  rows: [
    { header: 'IAM Access Analyzer', cells: ['정책이 부여한 권한', '외부 주체와 공유되는 리소스와 최소 권한에서 벗어난 부분을 찾는다'] },
    { header: 'Network Access Analyzer', cells: ['VPC 네트워크 경로', 'VPC 안에서 통신이 어디까지 닿는지 분석한다. 권한 정책은 다루지 않는다'] },
    { header: '변경 경보 구성', cells: ['리소스 생성과 변경', '일이 일어났다는 사실을 알린다. 권한이 얼마나 넓은지는 분석하지 못한다'] },
    { header: '권한 경계', cells: ['주체 하나의 권한 상한', '그 주체가 가질 수 있는 권한의 최대치를 정한다'] },
  ],
}

const expectedTables = [groupMembers, credentials, analyzerTools]

function comparisonTable(id: string) {
  const visuals = visualsByTopicId[topicId]
  expect(visuals).toBeDefined()
  const table = visuals.tables[id]
  expect(table).toBeDefined()
  return table
}

describe('IAM 비교표', () => {
  it('주제의 시각 요소가 로더에 있고 약어 툴팁은 없다', () => {
    const visuals = visualsByTopicId[topicId]
    expect(visuals).toBeDefined()
    expect(visuals.glossary).toEqual([])
  })

  it('그룹 표의 둘째 열은 가능·불가만 쓰고 첫 행만 가능이다', () => {
    const table = comparisonTable(groupMembers.id)

    expect(table.rows.map(({ cells }) => cells[0])).toEqual(['가능', '불가', '불가', '불가'])
  })

  it('세 표 어디에도 O·X·○·× 한 글자 판정이 없다', () => {
    for (const { id } of expectedTables) {
      const table = comparisonTable(id)
      const cells = [...table.columns, ...table.rows.flatMap(({ header, cells }) => [header, ...cells])]

      for (const cell of cells) {
        expect(cell.trim(), `${id}: ${cell}`).not.toMatch(/^[OX○×]$/u)
      }
    }
  })

  it.each([credentials, analyzerTools])('$label의 어느 칸에도 가능·불가가 없다', (expected) => {
    const table = comparisonTable(expected.id)
    const cells = [...table.columns, ...table.rows.flatMap(({ header, cells }) => [header, ...cells])]

    for (const cell of cells) {
      expect(cell).not.toMatch(/가능|불가/u)
    }
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
