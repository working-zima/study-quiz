import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { ConceptList } from '../ConceptList'
import { ComparisonTableFigure } from './ComparisonTableFigure'
import { RbacRolesTable } from './azureSecurityModelTables'

const topicId = 'azure-security-model'
const concepts = topics.find(({ id }) => id === topicId)!.concepts

// 자주 보는 기본 제공 역할 넷을 리소스 관리와 역할 할당으로 견준다. 칸마다 개념 본문에 근거가 있다.
const rbacRoles = {
  id: 'rbac-roles',
  conceptId: 'azure-security-model.rbac',
  label: '자주 보는 기본 제공 역할 넷 견주기',
  columns: ['역할', '리소스 관리', '역할 할당'],
  // 스크롤 막대(15px)가 낀 320px에서 표 폭은 273px이고 칸마다 9px가 빠진다. 38% 열 안쪽 95px에 「사용자 액세스」(한글 여섯 글자와 공백 약 88px)가 한 줄로 들어가
  // 사용자 액세스 관리자가 두 줄로 끝난다. 36% 열 안쪽 89px에 리소스를·관리한다(56px)가, 26% 열 안쪽 62px에 있다·없다 같은 짧은 낱말이 들어간다.
  columnWidths: ['38%', '36%', '26%'],
  sources: ['azure-security-model.rbac'],
  rows: [
    { header: '소유자', cells: ['모든 리소스를 관리한다', '할 수 있다'] },
    { header: '기여자', cells: ['모든 리소스를 관리한다', '할 수 없다'] },
    { header: '읽기 권한자', cells: ['보기만 한다', '할 수 없다'] },
    { header: '사용자 액세스 관리자', cells: ['보기만 한다', '할 수 있다'] },
  ],
}

function table() {
  return visualsByTopicId[topicId].tables[rbacRoles.id]
}

describe('기본 제공 역할 비교표', () => {
  it('주제의 시각 요소가 로더에 있고 약어 툴팁은 없다', () => {
    expect(visualsByTopicId[topicId].glossary).toEqual([])
  })

  it('표의 이름·열·열 폭·근거가 지정한 값이다', () => {
    expect(table().label).toBe(rbacRoles.label)
    expect(table().columns).toEqual(rbacRoles.columns)
    expect(table().columnWidths).toEqual(rbacRoles.columnWidths)
    expect(table().sources).toEqual(rbacRoles.sources)

    render(<RbacRolesTable />)

    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(rbacRoles.columns)
  })

  it('행 순서와 칸 문구가 지정한 내용 그대로다', () => {
    expect(table().rows).toEqual(rbacRoles.rows)
    render(<ComparisonTableFigure table={table()} />)

    expect(screen.getAllByRole('rowheader').map((header) => header.textContent)).toEqual(rbacRoles.rows.map(({ header }) => header))
    for (const { header, cells } of rbacRoles.rows) {
      const row = screen.getByRole('rowheader', { name: header }).closest('tr')!
      expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(cells)
    }
  })

  it('칸의 사실이 개념 본문에 있다', () => {
    const body = concepts.find(({ id }) => id === rbacRoles.conceptId)!.paragraphs.join(' ')

    for (const fact of ['소유자', '기여자', '읽기 권한자', '사용자 액세스 관리자', '모든 리소스를 관리', '보기만', '소유자는 할 수 있고 기여자는 할 수 없다', '역할은 할당할 수 있']) {
      expect(body, fact).toContain(fact)
    }
  })

  it('표 어디에도 O·X·○·× 한 글자 판정이 없다', () => {
    for (const text of [...table().columns, ...table().rows.flatMap(({ header, cells }) => [header, ...cells])]) {
      expect(text.trim(), text).not.toMatch(/^[OX○×]$/u)
    }
  })

  it('colgroup의 폭이 지정한 값이다', () => {
    render(<RbacRolesTable />)

    const widths = Array.from(screen.getByRole('table').querySelectorAll('colgroup col'), (col) => (col as HTMLElement).style.width)
    expect(widths).toEqual(rbacRoles.columnWidths)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 도식 뒤, 개념의 맨 끝에 비교표 figure가 나온다', (headingLevel) => {
    const concept = concepts.find(({ id }) => id === rbacRoles.conceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)

    const figure = screen.getByRole('figure', { name: rbacRoles.label })
    const article = figure.closest('article')!
    expect(article).toHaveAttribute('id', concept.id)
    expect(within(article).getByRole('heading', { level: headingLevel, name: concept.name })).toBeInTheDocument()
    expect(screen.getAllByRole('figure')).toHaveLength(2)
    expect(screen.getAllByRole('figure')[1]).toBe(figure)
    expect(article.lastElementChild).toBe(figure)
  })
})
