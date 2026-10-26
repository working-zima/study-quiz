import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { renderWithSubject } from '../test/subject'
import type { Question } from '../types/content'
import type { Progress } from '../types/progress'
import { RandomQuizPage } from './RandomQuizPage'

function makeQuestions(count: number): Question[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `q${index}`,
    topicId: index % 2 === 0 ? 'topic-a' : 'topic-b',
    conceptId: `concept-${index}`,
    prompt: `질문 ${index + 1}`,
    choices: [`정답 ${index + 1}`, `오답 A ${index + 1}`, `오답 B ${index + 1}`, `오답 C ${index + 1}`],
    answerIndex: 0,
    explanation: `해설 ${index + 1}`,
  }))
}

const noShuffle = (items: Question[]) => items

const noReview: Progress = { version: 3, read: {}, answers: {}, review: {} }

function CurrentPath() {
  return <output aria-label="현재 경로">{useLocation().pathname}</output>
}

function renderPage(path: string, questions = makeQuestions(25), progress = noReview) {
  return renderWithSubject(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/random/:count" element={<RandomQuizPage answer={vi.fn()} progress={progress} questions={questions} setInReview={vi.fn()} shuffle={noShuffle} />} />
        <Route path="/random" element={<><h1>랜덤 시작</h1><CurrentPath /></>} />
      </Routes>
    </MemoryRouter>,
  )
}

async function finishSet(count: number, incorrectFirst = false) {
  const user = userEvent.setup()
  for (let index = 0; index < count; index += 1) {
    if (index === 0 && incorrectFirst) {
      await user.click(screen.getByRole('button', { name: '오답 A 1' }))
    } else {
      await user.click(screen.getByRole('button', { name: `정답 ${index + 1}` }))
    }
    await user.click(screen.getByRole('button', { name: `정답 ${index + 1}` }))
  }
}

describe('RandomQuizPage', () => {
  it('/random/20에서 섞은 문항 중 앞의 20개만 사용한다', () => {
    renderPage('/random/20')
    expect(screen.getByText('1 / 20')).toBeInTheDocument()
  })

  it('/random/10에서 URL 세그먼트가 세트 크기를 정한다', () => {
    renderPage('/random/10')
    expect(screen.getByText('1 / 10')).toBeInTheDocument()
  })

  it('/random/all은 문제 은행 전체를 낸다', () => {
    renderPage('/random/all', makeQuestions(37))
    expect(screen.getByText('1 / 37')).toBeInTheDocument()
  })

  it('/random/100에서 100문항 세트를 낸다', () => {
    renderPage('/random/100', makeQuestions(246))
    expect(screen.getByText('1 / 100')).toBeInTheDocument()
  })

  it('허용하지 않는 문항 수는 /random으로 replace 이동한다', () => {
    renderPage('/random/15')
    expect(screen.getByRole('heading', { name: '랜덤 시작' })).toBeInTheDocument()
    expect(screen.getByLabelText('현재 경로')).toHaveTextContent('/random')
  })

  it('세트를 끝까지 풀면 완료 제목과 맞힌 개수를 표시한다', async () => {
    renderPage('/random/10')
    await finishSet(10)
    expect(screen.getByRole('heading', { name: '랜덤 문제 완료' })).toBeInTheDocument()
    expect(screen.getByText('맞힌 개수 10 / 10')).toBeInTheDocument()
  })

  it('세트에 복습 목록의 문항이 있으면 복습과 다시 뽑기 링크를 제공한다', async () => {
    renderPage('/random/10', makeQuestions(25), { ...noReview, review: { q0: true } })
    await finishSet(10)
    expect(screen.getByRole('link', { name: '복습하기' })).toHaveAttribute('href', '/review')
    expect(screen.getByRole('link', { name: '다시 뽑기' })).toHaveAttribute('href', '/random')
  })

  // 복습 목록에 문항이 있어도 이 세트 밖이면 이번 풀이와 무관하다. 틀린 문항도 저절로 들어가지 않는다 (ADR-032).
  it('복습 목록에 이 세트의 문항이 없으면 틀린 문항이 있어도 복습 링크를 두지 않는다', async () => {
    renderPage('/random/10', makeQuestions(25), { ...noReview, review: { q24: true } })
    await finishSet(10, true)
    expect(screen.queryByRole('link', { name: '복습하기' })).toBeNull()
    expect(screen.getByRole('link', { name: '다시 뽑기' })).toHaveClass('bg-neutral-100')
  })

  it('완료 화면에 다음 주제 링크를 두지 않는다', async () => {
    renderPage('/random/10')
    await finishSet(10)
    expect(screen.queryByRole('link', { name: '다음 주제 이어가기' })).toBeNull()
  })
})
