import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { ConceptList } from '../ConceptList'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const topicId = 'api-gateway-step-functions'
const concepts = topics.find(({ id }) => id === topicId)!.concepts

const apiTypes = {
  id: 'api-types',
  conceptId: 'api-gateway-step-functions.api-gateway',
  label: 'API Gateway 유형과 Lambda 함수 URL',
  columns: ['유형', '고를 때', '고르지 않을 때'],
  columnWidths: ['30%', '35%', '35%'],
  sources: [
    'api-gateway-step-functions.api-gateway',
    'api-gateway-step-functions.api-gateway-jwt-authorizer',
    'api-gateway-step-functions.api-gateway-rest-vs-http-timeout',
    'api-gateway-step-functions.api-gateway-rest-only-features',
    'api-gateway-step-functions.api-gateway-websocket-api',
  ],
  rows: [
    { header: 'REST API', cells: ['API 키, 요청 검증, 스로틀링이 필요할 때', '비용과 지연을 낮추는 것이 먼저일 때'] },
    { header: 'HTTP API', cells: ['싸고 빠르게 JWT 인증과 ALB 통합을 쓸 때', '몇 분 걸리는 동기 호출이나 API 키가 필요할 때'] },
    { header: 'WebSocket API', cells: ['연결을 열어 둔 채 메시지를 주고받을 때', '요청에 응답하고 끝나는 RESTful 호출일 때'] },
    { header: 'Lambda 함수 URL', cells: ['함수를 곧장 열기만 하면 될 때', 'API 관리 기능이 필요할 때'] },
  ],
}

const accessControl = {
  id: 'access-control',
  conceptId: 'api-gateway-step-functions.api-gateway-ip-restriction-by-resource-policy',
  label: 'API 호출을 거르는 장치',
  columns: ['장치', '하는 일'],
  columnWidths: ['30%', '70%'],
  sources: [
    'api-gateway-step-functions.api-gateway-resource-policy',
    'api-gateway-step-functions.api-gateway-ip-restriction-by-resource-policy',
    'api-gateway-step-functions.api-gateway-api-key-not-auth',
    'api-gateway-step-functions.api-gateway-jwt-authorizer',
    'api-gateway-step-functions.api-gateway-lambda-proxy-integration',
  ],
  rows: [
    { header: '리소스 정책', cells: ['호출할 수 있는 계정과 IP 주소 범위를 정한다. 다른 계정에만 열거나 사내 IP만 허용할 때 쓴다.'] },
    { header: '권한 부여자', cells: ['로그인한 사용자의 신원을 확인한다. 인증 방식이 표준이 아니면 사용자 지정 권한 부여자를 붙인다.'] },
    { header: 'API 키', cells: ['어느 클라이언트가 호출했는지 구분해 사용량을 잰다. 신원은 확인하지 않는다.'] },
    { header: '엔드포인트 정책', cells: ['프라이빗 API를 부르는 인터페이스 VPC 엔드포인트의 트래픽에 통제를 더한다. 계정 간 접근은 리소스 정책이 정한다.'] },
    { header: '보안 그룹', cells: ['붙일 수 없다. API Gateway는 VPC 안에 만들어지는 리소스가 아니다.'] },
  ],
}

const expectedTables = [apiTypes, accessControl]

function comparisonTable(id: string) {
  const visuals = visualsByTopicId[topicId]
  expect(visuals).toBeDefined()
  const table = visuals.tables[id]
  expect(table).toBeDefined()
  return table
}

describe('API Gateway 비교표', () => {
  it('주제의 시각 요소가 로더에 있고 약어 툴팁은 없다', () => {
    const visuals = visualsByTopicId[topicId]
    expect(visuals).toBeDefined()
    expect(visuals.glossary).toEqual([])
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

    it('어느 칸에도 한 글자 판정이나 가능·불가가 없다', () => {
      const table = comparisonTable(expected.id)
      const cells = [...table.columns, ...table.rows.flatMap(({ header, cells }) => [header, ...cells])]

      for (const cell of cells) {
        expect(cell.trim()).not.toMatch(/^[OX○×]$/u)
        expect(cell).not.toMatch(/가능|불가/u)
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
