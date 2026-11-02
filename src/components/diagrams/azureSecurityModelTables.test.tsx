import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { ConceptList } from '../ConceptList'
import { ComparisonTableFigure } from './ComparisonTableFigure'
import { RbacRolesTable, SecurityToolsTable } from './azureSecurityModelTables'

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

// 보안 도구 셋을 맡는 일과 고르는 때로 견준다. 칸마다 Sentinel 개념의 마지막 문단에 근거가 있다.
const securityTools = {
  id: 'security-tools',
  conceptId: 'azure-security-model.sentinel',
  label: '보안 도구 셋 견주기',
  columns: ['도구', '맡는 일', '고르는 때'],
  // 스크롤 막대(15px)가 낀 320px에서 표 폭은 273px이고 칸마다 9px가 빠진다. 32% 열 안쪽 78px에 Microsoft·Defender·Sentinel(굵기 500, 14px에서 긴 것이 약 70px)이 끊기지 않고 들어간다.
  // 34% 열 안쪽 83px에 가장 긴 덩어리 자동화하고·권장 사항을 쪽의 한글 다섯 글자(70px)가 들어간다. 가운뎃점으로 낱말을 잇지 않는다(UI_GUIDE 「타이포그래피」).
  columnWidths: ['32%', '34%', '34%'],
  sources: ['azure-security-model.defender-for-cloud', 'azure-security-model.key-vault', 'azure-security-model.sentinel'],
  rows: [
    { header: 'Microsoft Defender for Cloud', cells: ['리소스의 보안 상태를 평가하고 권장 사항을 준다. 위협을 찾아 경고한다', '내 리소스의 설정이 안전한지, 무엇을 고칠지 알고 싶을 때'] },
    { header: 'Azure Key Vault', cells: ['비밀과 키, 인증서를 한곳에 두고 접근을 통제한다', '앱의 암호를 코드에 적고 싶지 않을 때'] },
    { header: 'Microsoft Sentinel', cells: ['여러 곳의 보안 데이터를 모아 위협을 찾고 조사하고 대응한다', '흩어진 로그를 한곳에서 분석하고 대응을 자동화하고 싶을 때'] },
  ],
}

function toolsTable() {
  return visualsByTopicId[topicId].tables[securityTools.id]
}

describe('보안 도구 비교표', () => {
  it('표의 이름·열·열 폭·근거가 지정한 값이다', () => {
    expect(toolsTable().label).toBe(securityTools.label)
    expect(toolsTable().columns).toEqual(securityTools.columns)
    expect(toolsTable().columnWidths).toEqual(securityTools.columnWidths)
    expect(toolsTable().sources).toEqual(securityTools.sources)

    render(<SecurityToolsTable />)

    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(securityTools.columns)
  })

  it('행 순서와 칸 문구가 지정한 내용 그대로다', () => {
    expect(toolsTable().rows).toEqual(securityTools.rows)
    render(<ComparisonTableFigure table={toolsTable()} />)

    expect(screen.getAllByRole('rowheader').map((header) => header.textContent)).toEqual(securityTools.rows.map(({ header }) => header))
    for (const { header, cells } of securityTools.rows) {
      const row = screen.getByRole('rowheader', { name: header }).closest('tr')!
      expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(cells)
    }
  })

  it('칸의 사실이 개념 본문에 있다', () => {
    const body = concepts.find(({ id }) => id === securityTools.conceptId)!.paragraphs.join(' ')

    for (const fact of ['리소스의 보안 상태를 평가하고 권장 사항을', '위협을 찾아 경고', '내 리소스의 설정이 안전한지, 무엇을 고칠지 알고 싶을 때', '비밀과 키, 인증서를 한곳에 두고 접근을 통제', '앱의 암호를 코드에 적고 싶지 않을 때', '여러 곳의 보안 데이터를 모아 위협을 찾고 조사하고 대응', '흩어진 로그를 한곳에서 분석하고 대응을 자동화하고 싶을 때']) {
      expect(body, fact).toContain(fact)
    }
  })

  it('표 어디에도 O·X·○·× 한 글자 판정이 없다', () => {
    for (const text of [...toolsTable().columns, ...toolsTable().rows.flatMap(({ header, cells }) => [header, ...cells])]) {
      expect(text.trim(), text).not.toMatch(/^[OX○×]$/u)
    }
  })

  it('colgroup의 폭이 지정한 값이다', () => {
    render(<SecurityToolsTable />)

    const widths = Array.from(screen.getByRole('table').querySelectorAll('colgroup col'), (col) => (col as HTMLElement).style.width)
    expect(widths).toEqual(securityTools.columnWidths)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 도식 뒤, 개념의 맨 끝에 비교표 figure가 나온다', (headingLevel) => {
    const concept = concepts.find(({ id }) => id === securityTools.conceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)

    const figure = screen.getByRole('figure', { name: securityTools.label })
    const article = figure.closest('article')!
    expect(article).toHaveAttribute('id', concept.id)
    expect(within(article).getByRole('heading', { level: headingLevel, name: concept.name })).toBeInTheDocument()
    expect(screen.getAllByRole('figure')).toHaveLength(2)
    expect(screen.getAllByRole('figure')[1]).toBe(figure)
    expect(article.lastElementChild).toBe(figure)
  })
})
