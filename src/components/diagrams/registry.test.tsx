import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ConceptList } from '../ConceptList'

// 다음 step이 매핑에 도식을 추가하면 호출 화면을 고치지 않아도 표시되어야 한다.
vi.mock('./registry', () => ({
  diagramsByConceptId: {
    'x.y': () => <figure aria-label="등록한 도식" />,
  },
  stepFiguresByConceptId: {},
  summaryFiguresByConceptId: {
    'x.y': () => <figure aria-label="등록한 요약 아래 표" />,
  },
}))

describe('diagramsByConceptId', () => {
  it('ConceptList에 별도 매핑을 넘기지 않으면 등록한 도식을 사용한다', () => {
    render(
      <ConceptList
        concepts={[{ id: 'x.y', name: '개념', summary: '요약', paragraphs: ['본문'] }]}
        headingLevel={2}
      />,
    )

    expect(screen.getByRole('figure', { name: '등록한 도식' })).toBeInTheDocument()
  })
})

describe('summaryFiguresByConceptId', () => {
  it('ConceptList에 별도 매핑을 넘기지 않으면 등록한 요약 아래 표를 사용한다', () => {
    render(
      <ConceptList
        concepts={[{ id: 'x.y', name: '개념', summary: '요약', paragraphs: ['본문'] }]}
        headingLevel={2}
      />,
    )

    expect(screen.getAllByRole('figure').map((figure) => figure.getAttribute('aria-label'))).toEqual(['등록한 요약 아래 표', '등록한 도식'])
  })
})
