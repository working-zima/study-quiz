import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { ConceptList } from '../ConceptList'
import { ComparisonTableFigure } from './ComparisonTableFigure'
import { DeploymentMethodsTable, InfrastructureRolesTable } from './azureInfrastructureAsCodeTables'

const topicId = 'azure-infrastructure-as-code'
const concepts = topics.find(({ id }) => id === topicId)!.concepts
const bodyOf = (slug: string) => concepts.find(({ id }) => id === `${topicId}.${slug}`)!.paragraphs.join(' ')

// 주제 첫 개념의 요약 바로 아래에 붙는 표다. 네 용어가 ARM → 코드형 인프라 → ARM 템플릿 → Bicep 차례로 이어져,
// 이 표만 읽어도 Bicep 파일이 배포할 때 ARM 템플릿으로 바뀌어 ARM에 넘어간다는 연결이 보인다.
const infrastructureRoles = {
  id: 'infrastructure-roles',
  label: 'ARM과 코드형 인프라의 용어별 역할',
  columns: ['용어', '역할'],
  // 표 폭 273px(스크롤 막대가 낀 320px, 뷰포트 305px)에서 칸마다 9px가 빠진다. 45% 열 안쪽 약 114px에 행 머리의
  // 「Resource」(굵기 500)·「Manager」가, 55% 열 안쪽 약 141px에 가장 긴 덩어리 「템플릿으로」(약 70px)가 들어간다.
  columnWidths: ['45%', '55%'],
  sources: [
    `${topicId}.resource-manager`, `${topicId}.infrastructure-as-code`, `${topicId}.arm-templates`, `${topicId}.bicep`,
  ],
  rows: [
    { header: 'Azure Resource Manager (ARM)', cells: ['Azure 리소스를 만들거나 바꾸는 요청을 처리하는 서비스'] },
    { header: '코드형 인프라 (IaC)', cells: ['서버나 네트워크의 구성을 코드로 적어 배포하는 방식'] },
    { header: 'ARM 템플릿', cells: ['만들 리소스와 설정을 적어 ARM에 넘기는 JSON 파일'] },
    { header: 'Bicep', cells: ['리소스와 설정을 적는 언어. 배포할 때 ARM 템플릿으로 바뀌어 ARM에 넘어간다'] },
  ],
}

function rolesTable() {
  return visualsByTopicId[topicId].tables[infrastructureRoles.id]
}

describe('ARM과 코드형 인프라의 용어별 역할 표', () => {
  it('이름·열·열 폭·근거가 지정한 값이고 바로 가기를 두지 않는다', () => {
    expect(rolesTable().label).toBe(infrastructureRoles.label)
    expect(rolesTable().columns).toEqual(infrastructureRoles.columns)
    expect(rolesTable().columnWidths).toEqual(infrastructureRoles.columnWidths)
    expect(rolesTable().sources).toEqual(infrastructureRoles.sources)
    expect(rolesTable().shortcut).toBeUndefined()

    render(<InfrastructureRolesTable />)

    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(infrastructureRoles.columns)
    expect(Array.from(screen.getByRole('table').querySelectorAll('colgroup col'), (col) => (col as HTMLElement).style.width)).toEqual(infrastructureRoles.columnWidths)
    expect(screen.getByRole('figure', { name: infrastructureRoles.label })).not.toHaveAttribute('id')
  })

  it('행 순서와 칸 문구가 지정한 내용 그대로다', () => {
    expect(rolesTable().rows).toEqual(infrastructureRoles.rows)
    render(<InfrastructureRolesTable />)

    expect(screen.getAllByRole('rowheader').map((header) => header.textContent)).toEqual(infrastructureRoles.rows.map(({ header }) => header))
    for (const { header, cells } of infrastructureRoles.rows) {
      const row = screen.getByRole('rowheader', { name: header }).closest('tr')!
      expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(cells)
    }
  })

  // 칸에 쓰는 약칭 ARM은 첫 행 머리에서 밝힌다. ARM 템플릿 행은 그 파일이 ARM에 넘어가는 것을, Bicep 행은 배포할 때
  // ARM 템플릿으로 바뀌어 같은 ARM에 넘어가는 것을 말한다.
  it('ARM 템플릿 행과 Bicep 행이 ARM으로 이어진다', () => {
    const cellOf = (header: string) => rolesTable().rows.find((row) => row.header === header)!.cells[0]

    expect(rolesTable().rows[0].header).toContain('(ARM)')
    expect(cellOf('ARM 템플릿')).toContain('ARM에 넘기는 JSON 파일')
    expect(cellOf('Bicep')).toContain('언어')
    expect(cellOf('Bicep')).toContain('배포할 때 ARM 템플릿으로 바뀌어 ARM에 넘어간다')
  })

  it('칸의 사실이 근거 개념의 본문에 있다', () => {
    for (const fact of [
      '리소스를 만들고, 설정을 바꾸고, 지우는 관리 요청을 한곳에서 받아 처리한다',
      'ARM 템플릿은 Azure Resource Manager에 만들 리소스와 그 설정을 적어 넘겨주는 파일이다',
    ]) expect(bodyOf('resource-manager'), fact).toContain(fact)
    for (const fact of ['서버·네트워크·저장소', '원하는 인프라의 구성을 코드로 적고, 그 코드로 인프라를 만드는 방식이다']) {
      expect(bodyOf('infrastructure-as-code'), fact).toContain(fact)
    }
    expect(bodyOf('arm-templates')).toContain('템플릿은 JSON 파일이다')
    for (const fact of [
      'Bicep은 Azure에 배포할 리소스와 그 설정을 적는 언어',
      'Bicep CLI라는 도구가 그 파일을 ARM 템플릿(JSON)으로 바꾸고, Azure Resource Manager가 그 템플릿을 받아 리소스를 만든다',
      '바꾸는 일은 배포 과정에서 이루어지므로',
    ]) expect(bodyOf('bicep'), fact).toContain(fact)
  })

  it('표 어디에도 O·X 한 글자 판정, 백틱, 가운뎃점, 우열을 가르는 말이 없다', () => {
    for (const text of [...rolesTable().columns, ...rolesTable().rows.flatMap(({ header, cells }) => [header, ...cells])]) {
      expect(text.trim(), text).not.toMatch(/^[OX○×]$/u)
      expect(text, text).not.toMatch(/[`·]|더 낫|더 좋|더 짧|Terraform|트랜스파일/u)
    }
  })
})

// 스크립트·ARM 템플릿·Bicep을 무엇을 적는가와 어떤 파일로 적는가로 견준다. 칸의 사실은 이 주제의 코드형 인프라·ARM 템플릿·Bicep 본문에 있다.
const deploymentMethods = {
  id: 'deployment-methods',
  conceptId: 'azure-infrastructure-as-code.bicep',
  label: '스크립트, ARM 템플릿, Bicep 견주기',
  columns: ['방식', '적는 것', '파일'],
  // 스크롤 막대(15px)가 낀 320px에서 표 폭은 273px이고 칸마다 9px가 빠진다. 26% 열 안쪽 62px에 행 머리의 가장 긴 덩어리
  // 「스크립트」(굵기 500, 한글 넷 약 57px)·「템플릿」(약 42px)이 들어간다. 36% 열 안쪽 89px에 「리소스와」(약 56px)·「명령형」·「선언형」(약 42px)이 들어간다.
  // 38% 열 안쪽 95px에 「PowerShell」(약 73px)·「템플릿으로」(약 70px)가 들어간다. 영문 이름 바로 뒤에 조사를 붙이지 않는다.
  columnWidths: ['26%', '36%', '38%'],
  sources: ['azure-infrastructure-as-code.infrastructure-as-code', 'azure-infrastructure-as-code.arm-templates', 'azure-infrastructure-as-code.bicep'],
  // 비교표는 주제 맨 끝 Bicep 개념 뒤에 있어, 주제 제목 아래의 바로 가기로 곧장 간다(Azure Monitor 기능 비교표와 같은 방식).
  shortcut: { id: 'deployment-methods-table', label: '배포 방식 비교표로 바로 가기' },
  rows: [
    { header: '스크립트', cells: ['해야 할 작업과 그 순서를 적는 명령형', 'Azure CLI나 Azure PowerShell 명령을 차례로 적은 파일'] },
    { header: 'ARM 템플릿', cells: ['배포가 끝났을 때 있어야 할 리소스와 그 설정을 적는 선언형', 'JSON 파일'] },
    { header: 'Bicep', cells: ['배포가 끝났을 때 있어야 할 리소스와 그 설정을 적는 선언형', 'Bicep 파일. 배포할 때 ARM 템플릿으로 바뀐다'] },
  ],
}

function table() {
  return visualsByTopicId[topicId].tables[deploymentMethods.id]
}

describe('배포 방식 비교표', () => {
  it('주제의 시각 요소가 로더에 있고 약어 툴팁은 없다', () => {
    expect(visualsByTopicId[topicId].glossary).toEqual([])
  })

  it('표의 이름·열·열 폭·근거·바로 가기가 지정한 값이다', () => {
    expect(table().label).toBe(deploymentMethods.label)
    expect(table().columns).toEqual(deploymentMethods.columns)
    expect(table().columnWidths).toEqual(deploymentMethods.columnWidths)
    expect(table().sources).toEqual(deploymentMethods.sources)
    expect(table().shortcut).toEqual(deploymentMethods.shortcut)

    render(<DeploymentMethodsTable />)

    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(deploymentMethods.columns)
    const figure = screen.getByRole('figure', { name: deploymentMethods.label })
    expect(figure).toHaveAttribute('id', deploymentMethods.shortcut.id)
    expect(figure).toHaveClass('scroll-mt-24')
  })

  it('행 순서와 칸 문구가 지정한 내용 그대로다', () => {
    expect(table().rows).toEqual(deploymentMethods.rows)
    render(<ComparisonTableFigure table={table()} />)

    expect(screen.getAllByRole('rowheader').map((header) => header.textContent)).toEqual(deploymentMethods.rows.map(({ header }) => header))
    for (const { header, cells } of deploymentMethods.rows) {
      const row = screen.getByRole('rowheader', { name: header }).closest('tr')!
      expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(cells)
    }
  })

  it('칸의 사실이 근거 개념의 본문에 있다', () => {
    for (const fact of [
      '명령형은 해야 할 작업과 그 순서를 명령으로 차례로 적는다', 'Azure CLI나 Azure PowerShell 명령을 스크립트(여러 명령을 차례로 적어 둔 파일)로 묶어',
      '선언형은 배포가 끝났을 때 있어야 할 리소스와 그 설정만 적고',
    ]) expect(bodyOf('infrastructure-as-code'), fact).toContain(fact)
    for (const fact of ['템플릿은 JSON 파일이다', '템플릿은 앞에서 본 선언형으로 적는다']) expect(bodyOf('arm-templates'), fact).toContain(fact)
    for (const fact of [
      'Bicep으로 적은 파일을 Bicep 파일이라고 한다', 'Bicep CLI라는 도구가 그 파일을 ARM 템플릿(JSON)으로 바꾸고',
      '스크립트는 Azure CLI나 Azure PowerShell 명령을 차례로 적어 해야 할 작업과 그 순서를 적는 명령형이다',
      'ARM 템플릿과 Bicep은 배포가 끝났을 때 있어야 할 리소스와 그 설정을 적는 선언형이다', 'ARM 템플릿은 JSON 파일로, Bicep은 Bicep 파일로 적는다',
    ]) expect(bodyOf('bicep'), fact).toContain(fact)
  })

  it('표 어디에도 O·X 한 글자 판정, 백틱, 가운뎃점, 우열을 가르는 말이 없다', () => {
    for (const text of [...table().columns, ...table().rows.flatMap(({ header, cells }) => [header, ...cells])]) {
      expect(text.trim(), text).not.toMatch(/^[OX○×]$/u)
      expect(text, text).not.toMatch(/[`·]|더 낫|더 좋|Terraform|배포 모드/u)
    }
  })

  it('colgroup의 폭이 지정한 값이다', () => {
    render(<DeploymentMethodsTable />)

    const widths = Array.from(screen.getByRole('table').querySelectorAll('colgroup col'), (col) => (col as HTMLElement).style.width)
    expect(widths).toEqual(deploymentMethods.columnWidths)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 개념의 맨 끝에 비교표 figure 하나만 나온다', (headingLevel) => {
    const concept = concepts.find(({ id }) => id === deploymentMethods.conceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)

    const figure = screen.getByRole('figure', { name: deploymentMethods.label })
    const article = figure.closest('article')!
    expect(article).toHaveAttribute('id', concept.id)
    expect(within(article).getByRole('heading', { level: headingLevel, name: concept.name })).toBeInTheDocument()
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(article.lastElementChild).toBe(figure)
  })

  it('주제 전체 본문에서 역할 표가 맨 앞, 비교표가 맨 끝에 한 번씩 나오고 바로 가기 id를 가진 요소가 비교표 하나다', () => {
    render(<ConceptList concepts={concepts} headingLevel={2} />)
    const figures = screen.getAllByRole('figure')
    const roles = screen.getByRole('figure', { name: infrastructureRoles.label })
    const methods = screen.getByRole('figure', { name: deploymentMethods.label })

    expect(figures[0]).toBe(roles)
    expect(figures[figures.length - 1]).toBe(methods)
    expect(screen.getAllByRole('figure', { name: infrastructureRoles.label })).toHaveLength(1)
    expect(screen.getAllByRole('figure', { name: deploymentMethods.label })).toHaveLength(1)
    expect(roles.closest('article')).toHaveAttribute('id', `${topicId}.resource-manager`)
    expect(methods.closest('article')).toHaveAttribute('id', deploymentMethods.conceptId)
    expect(concepts.map(({ id }) => id)).not.toContain(deploymentMethods.shortcut.id)
    expect(document.querySelectorAll(`[id="${deploymentMethods.shortcut.id}"]`)).toHaveLength(1)
    expect(document.getElementById(deploymentMethods.shortcut.id)).toBe(methods)
  })
})
