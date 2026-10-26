import { screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { renderWithSubject } from '../test/subject'
import type { Question, Topic } from '../types/content'
import type { Progress } from '../types/progress'
import { TopicListPage } from './TopicListPage'

const testTopics: Topic[] = [
  {
    id: 'high-topic',
    title: '중요 주제',
    importance: 3,
    sourcePages: [1, 1],
    concepts: [],
  },
  {
    id: 'basic-topic',
    title: '기초 주제',
    importance: 0,
    sourcePages: [2, 2],
    concepts: [],
  },
]

const testQuestions: Question[] = [
  {
    id: 'q001',
    topicId: 'high-topic',
    conceptId: 'high-topic.concept',
    prompt: '질문 1',
    choices: ['A', 'B', 'C', 'D'],
    answerIndex: 0,
    explanation: '해설 1',
  },
  {
    id: 'q002',
    topicId: 'high-topic',
    conceptId: 'high-topic.concept',
    prompt: '질문 2',
    choices: ['A', 'B', 'C', 'D'],
    answerIndex: 1,
    explanation: '해설 2',
  },
]

const emptyProgress: Progress = { version: 3, read: {}, answers: {}, review: {} }

function renderPage(
  progress: Progress = emptyProgress,
  pageTopics: Topic[] = testTopics,
  pageQuestions: Question[] = [],
) {
  return renderWithSubject(
    <MemoryRouter>
      <TopicListPage
        progress={progress}
        questions={pageQuestions}
        topics={pageTopics}
      />
    </MemoryRouter>,
  )
}

describe('TopicListPage', () => {
  it('최상위 section에 한글 단어와 긴 문자열 줄바꿈 클래스를 함께 적용한다', () => {
    const { container } = renderPage()

    expect(container.querySelector('section')).toHaveClass('break-keep', 'break-anywhere')
  })

  it('주제 제목들을 렌더한다', () => {
    renderPage()

    expect(screen.getByText('중요 주제')).toBeInTheDocument()
    expect(screen.getByText('기초 주제')).toBeInTheDocument()
  })

  it('중요도 3에는 별 세 개를 표시하고 중요도 0에는 별을 표시하지 않는다', () => {
    renderPage()

    expect(within(screen.getByRole('link', { name: /중요 주제/ })).getByText('★★★')).toBeInTheDocument()
    expect(within(screen.getByRole('link', { name: /기초 주제/ })).queryByText(/[★☆]/)).not.toBeInTheDocument()
  })

  it('문항이 없는 주제에서 NaN을 렌더하지 않는다', () => {
    renderPage()

    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument()
    expect(screen.queryByText('정답 0/0')).not.toBeInTheDocument()
  })

  it('문제를 푼 주제에 정답 수와 전체 문항 수를 표시한다', () => {
    renderPage(
      { version: 3, read: { 'high-topic': true }, answers: { q001: true, q002: false }, review: {} },
      testTopics,
      testQuestions,
    )

    expect(screen.getByText('정답 1/2')).toBeInTheDocument()
  })

  // 개념은 들어왔지만 확인 문제가 아직 없는 주제가 있다. 목록에서 미리 알려 주지 않으면
  // 학습자가 개념을 다 읽고 나서야 확인 문제가 없다는 것을 발견한다.
  describe('확인 문제가 없는 주제', () => {
    it('확인 문제가 준비 중이라고 표시한다', () => {
      renderPage(emptyProgress, testTopics, testQuestions)

      const basicCard = screen.getByRole('link', { name: /기초 주제/ })
      expect(within(basicCard).getByText('확인 문제 준비 중')).toBeInTheDocument()
    })

    it('읽은 주제라면 읽음 표시와 함께 보여준다', () => {
      renderPage(
        { version: 3, read: { 'basic-topic': true }, answers: {}, review: {} },
        testTopics,
        testQuestions,
      )

      const basicCard = screen.getByRole('link', { name: /기초 주제/ })
      expect(within(basicCard).getByText('읽음 · 확인 문제 준비 중')).toBeInTheDocument()
    })

    it('문항이 있는 주제에는 표시하지 않는다', () => {
      renderPage(emptyProgress, testTopics, testQuestions)

      const highCard = screen.getByRole('link', { name: /중요 주제/ })
      expect(within(highCard).queryByText(/확인 문제 준비 중/)).toBeNull()
    })
  })

  it('카드 링크가 MemoryRouter의 주제 경로를 가리킨다', () => {
    renderPage()

    expect(screen.getByRole('link', { name: /중요 주제/ })).toHaveAttribute('href', '/topic/high-topic')
  })

  it('주제 카드보다 앞에 전체 문항 수를 표시하는 랜덤 문제 링크를 렌더한다', () => {
    const { rerender } = renderPage(emptyProgress, testTopics, testQuestions)
    const randomLink = screen.getByRole('link', { name: /랜덤 문제.*2문항/ })
    const topicLink = screen.getByRole('link', { name: /중요 주제/ })

    expect(randomLink).toHaveAttribute('href', '/random')
    expect(randomLink.compareDocumentPosition(topicLink) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    rerender(
      <MemoryRouter>
        <TopicListPage
          progress={emptyProgress}
          questions={testQuestions.slice(0, 1)}
          topics={testTopics}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /랜덤 문제.*1문항/ })).toBeInTheDocument()
  })
})
