import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { ConceptList } from '../ConceptList'
import { ComparisonTableFigure } from './ComparisonTableFigure'
import { DeploymentMethodsTable } from './azureInfrastructureAsCodeTables'

const topicId = 'azure-infrastructure-as-code'
const concepts = topics.find(({ id }) => id === topicId)!.concepts

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

  it('표의 이름·열·열 폭·근거가 지정한 값이다', () => {
    expect(table().label).toBe(deploymentMethods.label)
    expect(table().columns).toEqual(deploymentMethods.columns)
    expect(table().columnWidths).toEqual(deploymentMethods.columnWidths)
    expect(table().sources).toEqual(deploymentMethods.sources)

    render(<DeploymentMethodsTable />)

    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(deploymentMethods.columns)
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
    const bodyOf = (slug: string) => concepts.find(({ id }) => id === `${topicId}.${slug}`)!.paragraphs.join(' ')

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
})
