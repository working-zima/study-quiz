import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { ConceptList } from '../ConceptList'
import { ComparisonTableFigure } from './ComparisonTableFigure'
import { SignInMethodsTable } from './azureIdentityTables'

const topicId = 'azure-identity'
const concepts = topics.find(({ id }) => id === topicId)!.concepts

// 세 로그인 방식을 쓰는 것과 보안·편의로 견준다. 칸마다 두 개념 본문에 근거가 있다.
const signInMethods = {
  id: 'sign-in-methods',
  conceptId: 'azure-identity.passwordless',
  label: '로그인 방식 셋 견주기',
  columns: ['방법', '로그인에 쓰는 것', '보안과 편의'],
  // 스크롤 막대(15px)가 낀 320px에서 표 폭은 273px이고 칸마다 9px가 빠진다. 26% 열 안쪽 62px에 행 머리의 가장 긴 덩어리 다단계·암호만(한글 세 글자 42px)이,
  // 37% 열 안쪽 92px에 디바이스에·휴대폰이나(한글 다섯 글자 70px)와 인증보다(56px)가 들어간다.
  columnWidths: ['26%', '37%', '37%'],
  sources: ['azure-identity.multifactor-authentication', 'azure-identity.passwordless'],
  rows: [
    { header: '암호만', cells: ['암호', '보안은 가장 낮다. 편의는 다단계 인증보다 높다.'] },
    { header: '다단계 인증', cells: ['암호에 휴대폰이나 생체 신호를 더한다', '보안은 중간이다. 단계가 늘어 편의는 가장 낮다.'] },
    { header: '암호 없는 인증', cells: ['디바이스에 생체 신호나 PIN을 더한다', '보안과 편의 모두 가장 높다.'] },
  ],
}

function table() {
  return visualsByTopicId[topicId].tables[signInMethods.id]
}

describe('로그인 방식 비교표', () => {
  it('주제의 시각 요소가 로더에 있고 약어 툴팁은 없다', () => {
    expect(visualsByTopicId[topicId].glossary).toEqual([])
  })

  it('표의 이름·열·열 폭·근거가 지정한 값이다', () => {
    expect(table().label).toBe(signInMethods.label)
    expect(table().columns).toEqual(signInMethods.columns)
    expect(table().columnWidths).toEqual(signInMethods.columnWidths)
    expect(table().sources).toEqual(signInMethods.sources)

    render(<SignInMethodsTable />)

    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(signInMethods.columns)
  })

  it('행 순서와 칸 문구가 지정한 내용 그대로다', () => {
    expect(table().rows).toEqual(signInMethods.rows)
    render(<ComparisonTableFigure table={table()} />)

    expect(screen.getAllByRole('rowheader').map((header) => header.textContent)).toEqual(signInMethods.rows.map(({ header }) => header))
    for (const { header, cells } of signInMethods.rows) {
      const row = screen.getByRole('rowheader', { name: header }).closest('tr')!
      expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(cells)
    }
  })

  it('칸의 사실이 두 개념 본문에 있다', () => {
    const body = signInMethods.sources.flatMap((source) => concepts.find(({ id }) => id === source)!.paragraphs).join(' ')

    for (const fact of ['암호만', '다단계 인증', '암호 없는 인증', '휴대폰', '생체 신호', '디바이스', 'PIN', '보안이 가장 높고', '편의도 가장 높다', '보안은 가장 낮다', '편의는 가장 낮다', '단계가 하나 늘어']) {
      expect(body, fact).toContain(fact)
    }
  })

  it('표 어디에도 O·X·○·× 한 글자 판정이 없다', () => {
    for (const text of [...table().columns, ...table().rows.flatMap(({ header, cells }) => [header, ...cells])]) {
      expect(text.trim(), text).not.toMatch(/^[OX○×]$/u)
    }
  })

  it('colgroup의 폭이 지정한 값이다', () => {
    render(<SignInMethodsTable />)

    const widths = Array.from(screen.getByRole('table').querySelectorAll('colgroup col'), (col) => (col as HTMLElement).style.width)
    expect(widths).toEqual(signInMethods.columnWidths)
  })

  it.each([2, 4] as const)('공유 본문 h%i에서 개념 본문 바로 뒤에 비교표 figure가 나온다', (headingLevel) => {
    const concept = concepts.find(({ id }) => id === signInMethods.conceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)

    const figure = screen.getByRole('figure', { name: signInMethods.label })
    const article = figure.closest('article')!
    expect(article).toHaveAttribute('id', concept.id)
    expect(within(article).getByRole('heading', { level: headingLevel, name: concept.name })).toBeInTheDocument()
    expect(screen.getAllByRole('figure')).toEqual([figure])
    expect(article.lastElementChild).toBe(figure)
  })
})
