import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { topics, visualsByTopicId } from '../../data/azure'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { ConceptList } from '../ConceptList'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const topicId = 'azure-cloud-computing'
const concepts = topics.find(({ id }) => id === topicId)!.concepts

// 세 가격 모델을 무엇을 내주고 할인받는가(가격과 조건)와 어떤 작업에 맞는가로 견준다. 스폿 가상 머신에 기간 약정이 없다는 문장은
// 공식 문서에서 확인하지 못해(phase 100 step 4) 열 이름을 「미리 약속하는 것」 대신 「가격과 조건」으로 두었다.
const pricingModels = {
  id: 'pricing-models',
  conceptId: 'azure-cloud-computing.spot-vm',
  label: '종량제·Azure 예약·Azure 스폿 가상 머신 견주기',
  columns: ['가격 모델', '가격과 조건', '어떤 작업에 맞나'],
  // 스크롤 막대(15px)가 낀 320px에서 표 폭은 273px이고 칸마다 9px가 빠진다. 24% 열 안쪽 56px에 행 머리의 가장 긴 덩어리
  // Azure(반각 다섯 글자, 약 44px)·종량제(한글 세 글자 42px)가, 42% 열 안쪽 105px에 종량제보다(한글 다섯 글자 70px)가,
  // 34% 열 안쪽 83px에 실행하면(한글 네 글자 56px)이 들어간다.
  columnWidths: ['24%', '42%', '34%'],
  sources: [
    'azure-cloud-computing.pay-as-you-go',
    'azure-cloud-computing.reservations',
    'azure-cloud-computing.spot-vm',
  ],
  rows: [
    { header: '종량제', cells: ['미리 약속하지 않고 쓴 만큼 낸다. 언제든 그만 쓸 수 있다', '쓰는 양이 자주 바뀌는 작업'] },
    { header: 'Azure 예약', cells: ['1년이나 3년 동안 쓰겠다고 약정하고 종량제보다 낮은 가격을 받는다', '같은 리소스를 꾸준히 오래 쓰는 작업'] },
    { header: 'Azure 스폿 가상 머신', cells: ['남는 용량을 크게 할인받아 쓰지만, Azure가 그 용량을 다시 써야 하면 회수된다', '도중에 멈춰도 다시 실행하면 되는 작업'] },
  ],
}

function comparisonTable() {
  const visuals = visualsByTopicId[topicId]
  expect(visuals).toBeDefined()
  const table = visuals.tables[pricingModels.id]
  expect(table).toBeDefined()
  return table
}

describe('세 가격 모델 비교표', () => {
  it('주제의 시각 요소가 로더에 있고 약어 툴팁은 없다', () => {
    const visuals = visualsByTopicId[topicId]
    expect(visuals).toBeDefined()
    expect(visuals.glossary).toEqual([])
  })

  it('표의 이름·열·열 폭·근거가 지정한 값이다', () => {
    const table = comparisonTable()
    expect(table.label).toBe(pricingModels.label)
    expect(table.columns).toEqual(pricingModels.columns)
    expect(table.columnWidths).toEqual(pricingModels.columnWidths)
    expect(table.sources).toEqual(pricingModels.sources)

    render(<ComparisonTableFigure table={table} />)

    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(pricingModels.columns)
  })

  it('행 머리가 개념 순서대로 개념 이름과 같고 칸 문구가 지정한 내용 그대로다', () => {
    const table = comparisonTable()
    expect(table.rows).toEqual(pricingModels.rows)
    expect(table.rows.map(({ header }) => header)).toEqual(
      pricingModels.sources.map((source) => concepts.find(({ id }) => id === source)!.name),
    )
    render(<ComparisonTableFigure table={table} />)

    expect(screen.getAllByRole('rowheader').map((header) => header.textContent)).toEqual(pricingModels.rows.map(({ header }) => header))
    for (const { header, cells } of pricingModels.rows) {
      const row = screen.getByRole('rowheader', { name: header }).closest('tr')!
      expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(cells)
    }
  })

  it('표 어디에도 O·X·○·× 한 글자 판정이 없다', () => {
    const table = comparisonTable()
    for (const text of [...table.columns, ...table.rows.flatMap(({ header, cells }) => [header, ...cells])]) {
      expect(text.trim(), text).not.toMatch(/^[OX○×]$/u)
    }
  })

  it('colgroup의 폭이 지정한 값이다', () => {
    render(<ComparisonTableFigure table={comparisonTable()} />)

    const widths = Array.from(screen.getByRole('table').querySelectorAll('colgroup col'), (col) => (col as HTMLElement).style.width)
    expect(widths).toEqual(pricingModels.columnWidths)
  })

  // 세 가격 모델을 다 읽은 자리인 스폿 가상 머신 개념에 붙는다. 이 개념은 정의형이라 도식이 없다(사용자 결정 2026-10-30).
  it.each([2, 4] as const)('공유 본문 h%i에서 스폿 가상 머신 개념의 본문 바로 뒤에 비교표 figure 하나가 나온다', (headingLevel) => {
    const concept = concepts.find(({ id }) => id === pricingModels.conceptId)!
    render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)

    const table = screen.getByRole('figure', { name: pricingModels.label })
    const article = table.closest('article')!
    expect(article).toHaveAttribute('id', concept.id)
    expect(within(article).getByRole('heading', { level: headingLevel, name: concept.name })).toBeInTheDocument()
    expect(screen.getAllByRole('figure')).toEqual([table])
    expect(table.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*/gu, ''))
    expect(article.lastElementChild).toBe(table)
    expect(within(table).getAllByRole('columnheader')).toHaveLength(pricingModels.columns.length)
    expect(within(table).getAllByRole('rowheader')).toHaveLength(pricingModels.rows.length)
  })
})
