import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { awsSubject } from '../data/aws'
import type { Question, Topic } from '../types/content'
import type { Subject } from '../types/subject'
import { SubjectListPage } from './SubjectListPage'

function fakeTopic(id: string): Topic {
  return { id, title: id, importance: 2, sourcePages: [1, 1], concepts: [] }
}

function fakeQuestion(id: string, topicId: string): Question {
  return {
    id,
    topicId,
    conceptId: `${topicId}.concept`,
    prompt: '질문',
    choices: ['A', 'B', 'C', 'D'],
    answerIndex: 0,
    explanation: '해설',
  }
}

const testSubjects: Subject[] = [
  {
    id: 'first',
    title: '첫 과목',
    progressKey: 'first.progress',
    topics: [fakeTopic('t1'), fakeTopic('t2')],
    questions: [fakeQuestion('q1', 't1'), fakeQuestion('q2', 't1'), fakeQuestion('q3', 't2')],
    visualsByTopicId: {},
    hasKeywordQuiz: false,
  },
  {
    id: 'second',
    title: '둘째 과목',
    progressKey: 'second.progress',
    topics: [fakeTopic('t3')],
    questions: [],
    visualsByTopicId: {},
    hasKeywordQuiz: false,
  },
]

function renderPage(subjects?: Subject[]) {
  return render(
    <MemoryRouter>
      <SubjectListPage subjects={subjects} />
    </MemoryRouter>,
  )
}

describe('SubjectListPage', () => {
  it('제목을 「과목」으로 보인다', () => {
    renderPage(testSubjects)

    expect(screen.getByRole('heading', { level: 1, name: '과목' })).toBeInTheDocument()
  })

  it('과목마다 그 과목 홈으로 가는 카드 하나를 이름과 주제·문항 수와 함께 보인다', () => {
    renderPage(testSubjects)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)

    const first = screen.getByRole('link', { name: /첫 과목/ })
    expect(first).toHaveAttribute('href', '/first')
    expect(within(first).getByRole('heading', { name: '첫 과목' })).toBeInTheDocument()
    expect(within(first).getByText('주제 2개 · 문항 3개')).toBeInTheDocument()

    const second = screen.getByRole('link', { name: /둘째 과목/ })
    expect(second).toHaveAttribute('href', '/second')
    expect(within(second).getByText('주제 1개 · 문항 0개')).toBeInTheDocument()
  })

  it('과목을 넘기지 않으면 앱의 과목 목록을 보인다', () => {
    renderPage()

    const aws = screen.getByRole('link', { name: /AWS SAA-C03/ })
    expect(aws).toHaveAttribute('href', '/aws')
    expect(
      within(aws).getByText(`주제 ${awsSubject.topics.length}개 · 문항 ${awsSubject.questions.length}개`),
    ).toBeInTheDocument()
  })
})
