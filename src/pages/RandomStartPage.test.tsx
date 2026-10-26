import { screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { renderWithSubject } from '../test/subject'
import type { Question } from '../types/content'
import { RandomStartPage } from './RandomStartPage'

function questions(count: number): Question[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `q${index}`,
    topicId: 'topic-a',
    conceptId: 'topic-a.concept',
    prompt: `질문 ${index}`,
    choices: ['정답', '오답 1', '오답 2', '오답 3'],
    answerIndex: 0,
    explanation: '해설',
  }))
}

function renderPage(count: number) {
  return renderWithSubject(<MemoryRouter><RandomStartPage questions={questions(count)} /></MemoryRouter>)
}

describe('RandomStartPage', () => {
  it('허용 문항 수마다 랜덤 문제 링크를 렌더한다', () => {
    renderPage(246)

    for (const count of [10, 20, 30, 50, 100]) {
      expect(screen.getByRole('link', { name: `${count}문항` })).toHaveAttribute('href', `/aws/random/${count}`)
    }
  })

  // 전체는 숫자 대신 세그먼트를 쓴다. 문제 은행이 늘어도 링크가 낡지 않는다 (ADR-018).
  it('전체 문항을 푸는 링크를 렌더한다', () => {
    renderPage(246)

    const allLink = screen.getByRole('link', { name: '전체' })
    expect(allLink).toHaveAttribute('href', '/aws/random/all')
    expect(allLink).toHaveClass('min-h-[44px]')
  })

  it('버튼을 모두 같은 스타일로 둔다', () => {
    renderPage(246)

    const links = screen.getAllByRole('link')
    const classes = new Set(links.map((link) => link.className))
    expect(classes.size).toBe(1)
  })

  it.each([7, 43])('전체 문항 수 %i를 주입된 배열 길이로 표시한다', (count) => {
    renderPage(count)

    expect(screen.getByText(new RegExp(`전체 ${count}문항`))).toBeInTheDocument()
  })
})
