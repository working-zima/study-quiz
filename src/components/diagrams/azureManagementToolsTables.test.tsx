import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { ConceptList } from '../ConceptList'
import { ComparisonTableFigure } from './ComparisonTableFigure'
import { CommandToolsTable } from './azureManagementToolsTables'

const topicId = 'azure-management-tools'
const concepts = topics.find(({ id }) => id === topicId)!.concepts

// 두 명령 도구와 Cloud Shell을 명령의 꼴과 실행하는 곳으로 견준다. 칸의 사실은 이 주제의 Cloud Shell·Azure PowerShell·Azure CLI 본문에 있다.
const commandTools = {
  id: 'command-tools',
  conceptId: 'azure-management-tools.azure-cli',
  label: 'Azure 명령 도구와 Cloud Shell 견주기',
  columns: ['도구', '명령의 꼴', '실행하는 곳'],
  // 스크롤 막대(15px)가 낀 320px에서 표 폭은 273px이고 칸마다 9px가 빠진다. 32% 열 안쪽 78px에 행 머리의 가장 긴 덩어리
  // 「PowerShell」(굵기 500, 약 73px)이 들어간다. 30% 열 안쪽 73px에 「동사-명사」(약 61px)·「cmdlet」(약 42px)이 들어간다.
  // 38% 열 안쪽 95px에 「PowerShell,」(약 73px)·「프롬프트,」(약 60px)가 들어간다. 영문 이름 바로 뒤에 조사를 붙이지 않는다.
  columnWidths: ['32%', '30%', '38%'],
  sources: ['azure-management-tools.cloud-shell', 'azure-management-tools.azure-powershell', 'azure-management-tools.azure-cli'],
  rows: [
    { header: 'Azure PowerShell', cells: ['동사-명사 꼴의 cmdlet', 'PowerShell 셸에서 실행한다. 컴퓨터에 설치하거나 Cloud Shell에서 쓴다'] },
    { header: 'Azure CLI', cells: ['az로 시작하는 명령', '명령 프롬프트, PowerShell, Bash 같은 여러 셸에서 실행한다. 컴퓨터에 설치하거나 Cloud Shell에서 쓴다'] },
    { header: 'Azure Cloud Shell', cells: ['따로 없고 두 도구의 명령을 쓴다', '웹 브라우저로 열고 셸로 Bash나 PowerShell을 고른다'] },
  ],
}

function table() {
  return visualsByTopicId[topicId].tables[commandTools.id]
}

describe('명령 도구 비교표', () => {
  it('주제의 시각 요소가 로더에 있고 약어 툴팁은 없다', () => {
    expect(visualsByTopicId[topicId].glossary).toEqual([])
  })

  it('표의 이름·열·열 폭·근거가 지정한 값이다', () => {
    expect(table().label).toBe(commandTools.label)
    expect(table().columns).toEqual(commandTools.columns)
    expect(table().columnWidths).toEqual(commandTools.columnWidths)
    expect(table().sources).toEqual(commandTools.sources)

    render(<CommandToolsTable />)

    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(commandTools.columns)
  })

  it('행 순서와 칸 문구가 지정한 내용 그대로다', () => {
    expect(table().rows).toEqual(commandTools.rows)
    render(<ComparisonTableFigure table={table()} />)

    expect(screen.getAllByRole('rowheader').map((header) => header.textContent)).toEqual(commandTools.rows.map(({ header }) => header))
    for (const { header, cells } of commandTools.rows) {
      const row = screen.getByRole('rowheader', { name: header }).closest('tr')!
      expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(cells)
    }
  })

  it('칸의 사실이 근거 개념의 본문에 있다', () => {
    const bodyOf = (slug: string) => concepts.find(({ id }) => id === `${topicId}.${slug}`)!.paragraphs.join(' ')

    for (const fact of [
      'Azure PowerShell의 명령 하나를 cmdlet이라고 부른다', '할 일을 나타내는 동사와 다룰 대상을 나타내는 명사를 하이픈(-)으로 이은 꼴',
      'Windows·Linux·macOS 컴퓨터에 설치해 쓴다', 'Cloud Shell에는 Azure PowerShell이 미리 설치되어 있고',
    ]) expect(bodyOf('azure-powershell'), fact).toContain(fact)
    for (const fact of [
      'Azure CLI의 명령은 `az`로 시작하고', '명령 프롬프트', 'Linux·macOS에서는 Bash 같은 셸에 `az` 명령을 입력한다',
      'Windows·Linux·macOS 컴퓨터에 설치해 쓰거나, Azure CLI가 미리 설치되어 있는 Azure Cloud Shell에서 쓴다',
      'Azure PowerShell의 cmdlet은 PowerShell에서 실행한다',
    ]) expect(bodyOf('azure-cli'), fact).toContain(fact)
    for (const fact of [
      '웹 브라우저 안에서 여는 셸', 'Bash와 PowerShell 가운데 하나로 고른다', 'Cloud Shell이 두 도구와 다른 제3의 명령 꼴을 갖는 것은 아니다',
    ]) expect(bodyOf('cloud-shell'), fact).toContain(fact)
  })

  it('표 어디에도 O·X 한 글자 판정, 백틱, 가운뎃점, 옛 조건이 없다', () => {
    for (const text of [...table().columns, ...table().rows.flatMap(({ header, cells }) => [header, ...cells])]) {
      expect(text.trim(), text).not.toMatch(/^[OX○×]$/u)
      expect(text, text).not.toMatch(/[`·]|PowerShell Core|Bash 명령/u)
    }
  })

  it('colgroup의 폭이 지정한 값이다', () => {
    render(<CommandToolsTable />)

    const widths = Array.from(screen.getByRole('table').querySelectorAll('colgroup col'), (col) => (col as HTMLElement).style.width)
    expect(widths).toEqual(commandTools.columnWidths)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 개념의 맨 끝에 비교표 figure 하나만 나온다', (headingLevel) => {
    const concept = concepts.find(({ id }) => id === commandTools.conceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)

    const figure = screen.getByRole('figure', { name: commandTools.label })
    const article = figure.closest('article')!
    expect(article).toHaveAttribute('id', concept.id)
    expect(within(article).getByRole('heading', { level: headingLevel, name: concept.name })).toBeInTheDocument()
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(article.lastElementChild).toBe(figure)
  })
})
