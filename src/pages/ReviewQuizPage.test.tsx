import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { renderWithSubject } from '../test/subject'
import type { Question } from '../types/content'
import type { Progress } from '../types/progress'
import { ReviewQuizPage } from './ReviewQuizPage'

const testQuestions: Question[] = [
  { id: 'q001', topicId: 'storage', conceptId: 'storage.s3', prompt: '질문 1', choices: ['정답 1', '오답 A 1', '오답 B 1', '오답 C 1'], answerIndex: 0, explanation: '해설 1' },
  { id: 'q002', topicId: 'storage', conceptId: 'storage.ebs', prompt: '질문 2', choices: ['정답 2', '오답 A 2', '오답 B 2', '오답 C 2'], answerIndex: 0, explanation: '해설 2' },
  { id: 'q003', topicId: 'database', conceptId: 'database.rds', prompt: '질문 3', choices: ['정답 3', '오답 A 3', '오답 B 3', '오답 C 3'], answerIndex: 0, explanation: '해설 3' },
]

const noShuffle = (items: Question[]) => items

const twoInReview: Progress = {
  version: 3,
  read: {},
  answers: { q001: false, q003: true },
  review: { q001: true, q003: true },
}

function renderPage(path: string, progress: Progress = twoInReview) {
  const setInReview = vi.fn()
  const view = renderWithSubject(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          element={<ReviewQuizPage answer={vi.fn()} progress={progress} questions={testQuestions} setInReview={setInReview} shuffle={noShuffle} />}
          path="/review/quiz"
        />
        <Route
          element={<ReviewQuizPage answer={vi.fn()} progress={progress} questions={testQuestions} setInReview={setInReview} shuffle={noShuffle} />}
          path="/review/quiz/:topicId"
        />
      </Routes>
    </MemoryRouter>,
  )
  return { ...view, setInReview }
}

async function answerCorrectly(label: string) {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: label }))
  await user.click(screen.getByRole('button', { name: label }))
}

describe('ReviewQuizPage', () => {
  it('복습 목록에 있는 문항만 낸다', () => {
    renderPage('/review/quiz')

    expect(screen.getByRole('heading', { name: '복습 문제 풀기' })).toBeInTheDocument()
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
    expect(screen.getByText('질문 1')).toBeInTheDocument()
  })

  it('주제가 붙으면 그 주제의 복습 문항만 낸다', () => {
    renderPage('/review/quiz/database')

    expect(screen.getByText('1 / 1')).toBeInTheDocument()
    expect(screen.getByText('질문 3')).toBeInTheDocument()
  })

  // 푸는 도중 복습 목록이 바뀌어도 세트가 흔들리면 안 된다. 진입 시점에 한 번만 고른다.
  it('푸는 도중 복습 목록이 비어도 세트를 그대로 유지한다', () => {
    const { rerender } = renderPage('/review/quiz')
    expect(screen.getByText('1 / 2')).toBeInTheDocument()

    rerender(
      <MemoryRouter initialEntries={['/review/quiz']}>
        <Routes>
          <Route
            element={(
              <ReviewQuizPage
                answer={vi.fn()}
                progress={{ version: 3, read: {}, answers: {}, review: {} }}
                questions={testQuestions}
                setInReview={vi.fn()}
                shuffle={noShuffle}
              />
            )}
            path="/review/quiz"
          />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('1 / 2')).toBeInTheDocument()
  })

  // 복습 목록에서 다시 푼 문항은 눌린 채로 나온다. 익혔다고 판단하면 그 자리에서 뺀다.
  it('다시 풀면서 복습에 넣기를 눌러 그 문항을 뺄 수 있다', async () => {
    const user = userEvent.setup()
    const { setInReview } = renderPage('/review/quiz')

    await user.click(screen.getByRole('button', { name: '정답 1' }))
    const toggle = screen.getByRole('button', { name: '복습에 넣기' })
    expect(toggle).toHaveAttribute('aria-pressed', 'true')

    await user.click(toggle)

    expect(setInReview).toHaveBeenCalledWith('q001', false)
  })

  it('세트를 끝내면 완료 화면과 복습으로 돌아가는 링크를 준다', async () => {
    renderPage('/review/quiz')

    await answerCorrectly('정답 1')
    await answerCorrectly('정답 3')

    expect(screen.getByRole('heading', { name: '복습 문제 풀기 완료' })).toBeInTheDocument()
    expect(screen.getByText('맞힌 개수 2 / 2')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '복습으로 돌아가기' })).toHaveAttribute('href', '/review')
  })

  it('다시 풀 문항이 없으면 안내와 복습 링크를 보여준다', () => {
    renderPage('/review/quiz', { version: 3, read: {}, answers: { q001: false }, review: {} })

    expect(screen.getByRole('heading', { name: '복습 문제 풀기' })).toBeInTheDocument()
    expect(screen.getByText('다시 풀 문항이 없습니다.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '복습으로 돌아가기' })).toHaveAttribute('href', '/review')
  })
})
