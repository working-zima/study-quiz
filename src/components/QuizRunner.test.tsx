import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { awsSubject } from '../data/aws'
import { SubjectContext } from '../hooks/useSubject'
import { renderWithSubject } from '../test/subject'
import type { Question, Topic } from '../types/content'
import type { Subject } from '../types/subject'
import { QuizRunner } from './QuizRunner'

const testQuestions: Question[] = [
  {
    id: 'q001',
    topicId: 'first-topic',
    conceptId: 'first-topic.first',
    prompt: '첫 번째 질문',
    choices: ['첫 번째 정답', '오답 보기 1', '오답 보기 2', '오답 보기 3'],
    answerIndex: 0,
    explanation: '첫 번째 해설',
  },
  {
    id: 'q002',
    topicId: 'second-topic',
    conceptId: 'second-topic.second',
    prompt: '두 번째 질문',
    choices: ['오답 보기 A', '두 번째 정답', '오답 보기 B', '오답 보기 C'],
    answerIndex: 1,
    explanation: '두 번째 해설',
  },
]

const testTopics: Topic[] = [
  {
    id: 'first-topic',
    title: '첫 번째 주제',
    importance: 3,
    sourcePages: [1, 2],
    concepts: [
      {
        id: 'first-topic.first',
        name: '첫 번째 개념',
        summary: '**첫 번째 요약**이다.',
        paragraphs: ['첫 번째 개념 본문', '첫 번째 개념 둘째 문단'],
      },
      {
        id: 'first-topic.neighbor',
        name: '이웃 개념',
        summary: '이웃 요약',
        paragraphs: ['이웃 개념 본문'],
      },
    ],
  },
  {
    id: 'second-topic',
    title: '두 번째 주제',
    importance: 2,
    sourcePages: [3, 4],
    concepts: [
      {
        id: 'second-topic.second',
        name: '두 번째 개념',
        summary: '두 번째 요약',
        paragraphs: ['두 번째 개념 본문'],
      },
    ],
  },
]

function renderRunner(
  renderComplete = vi.fn(() => <section>완료</section>),
  topics = testTopics,
  review: Record<string, true> = {},
) {
  const setInReview = vi.fn()
  const result = renderWithSubject(
    <MemoryRouter>
      <QuizRunner
        answer={vi.fn()}
        questions={testQuestions}
        renderComplete={renderComplete}
        review={review}
        setInReview={setInReview}
        title="사용자 지정 제목"
        topics={topics}
      />
    </MemoryRouter>,
  )

  return { ...result, renderComplete, setInReview }
}

describe('QuizRunner', () => {
  it('title을 제목으로 렌더한다', () => {
    renderRunner()

    expect(screen.getByRole('heading', { level: 1, name: '사용자 지정 제목' })).toBeInTheDocument()
  })

  it('완료 화면에 맞힌 개수와 총 개수를 전달한다', async () => {
    const user = userEvent.setup()
    const { renderComplete } = renderRunner()

    await user.click(screen.getByRole('button', { name: '첫 번째 정답' }))
    await user.click(screen.getByRole('button', { name: '첫 번째 정답' }))
    await user.click(screen.getByRole('button', { name: '오답 보기 A' }))
    await user.click(screen.getByRole('button', { name: '두 번째 정답' }))

    expect(renderComplete).toHaveBeenLastCalledWith(1, 2)
    expect(screen.getByText('완료')).toBeInTheDocument()
  })

  it('정답을 고르기 전에도 주제의 개념을 화면 안에서 펼친다', async () => {
    const user = userEvent.setup()
    renderRunner()

    const toggle = screen.getByRole('button', { name: '개념 보기' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('첫 번째 개념 본문')).toBeNull()

    await user.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('heading', { name: '첫 번째 주제' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '첫 번째 개념' })).toBeInTheDocument()
    expect(screen.getByText('첫 번째 개념 본문')).toBeInTheDocument()
    expect(screen.getByText('첫 번째 개념 둘째 문단')).toBeInTheDocument()
  })

  it('문항의 근거 개념뿐 아니라 같은 주제의 이웃 개념까지 펼친다', async () => {
    const user = userEvent.setup()
    renderRunner()

    await user.click(screen.getByRole('button', { name: '개념 보기' }))

    // q180("다중 AZ 대기 인스턴스로 할 수 없는 작업")처럼, 근거 개념 하나만으로는
    // 왜 그런지가 서지 않는다. 같은 주제의 개념과 대비해야 이해된다.
    expect(screen.getByRole('heading', { name: '이웃 개념' })).toBeInTheDocument()
    expect(screen.getByText('이웃 개념 본문')).toBeInTheDocument()
  })

  it('펼친 개념을 다시 눌러 접는다', async () => {
    const user = userEvent.setup()
    renderRunner()

    await user.click(screen.getByRole('button', { name: '개념 보기' }))
    await user.click(screen.getByRole('button', { name: '개념 보기' }))

    expect(screen.getByRole('button', { name: '개념 보기' })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('첫 번째 개념 본문')).toBeNull()
  })

  it('개념을 펼쳐 읽어도 진행 위치와 고른 보기가 그대로 남는다', async () => {
    const user = userEvent.setup()
    renderRunner()

    await user.click(screen.getByRole('button', { name: '첫 번째 정답' }))
    await user.click(screen.getByRole('button', { name: '첫 번째 정답' }))
    await user.click(screen.getByRole('button', { name: '오답 보기 A' }))
    await user.click(screen.getByRole('button', { name: '개념 보기' }))
    await user.click(screen.getByRole('button', { name: '개념 보기' }))

    expect(screen.getByText('2 / 2')).toBeInTheDocument()
    expect(screen.getByText('두 번째 해설')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '오답 보기 B' })).toBeDisabled()
  })

  it('문항마다 그 문항이 속한 주제를 펼친다', async () => {
    const user = userEvent.setup()
    renderRunner()

    await user.click(screen.getByRole('button', { name: '첫 번째 정답' }))
    await user.click(screen.getByRole('button', { name: '개념 보기' }))
    expect(screen.getByRole('heading', { name: '첫 번째 주제' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '첫 번째 정답' }))
    await user.click(screen.getByRole('button', { name: '두 번째 정답' }))
    await user.click(screen.getByRole('button', { name: '개념 보기' }))

    expect(screen.getByRole('heading', { name: '두 번째 주제' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '첫 번째 주제' })).toBeNull()
    expect(screen.queryByRole('heading', { name: '이웃 개념' })).toBeNull()
  })

  it('다음 문항으로 넘어가면 펼친 개념을 닫는다', async () => {
    const user = userEvent.setup()
    renderRunner()

    await user.click(screen.getByRole('button', { name: '첫 번째 정답' }))
    await user.click(screen.getByRole('button', { name: '개념 보기' }))
    await user.click(screen.getByRole('button', { name: '첫 번째 정답' }))

    expect(screen.getByRole('button', { name: '개념 보기' })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('첫 번째 개념 본문')).toBeNull()
  })

  it('개념 본문의 강조 표기를 굵게 렌더하고 기호는 노출하지 않는다', async () => {
    const user = userEvent.setup()
    const { container } = renderRunner()

    await user.click(screen.getByRole('button', { name: '개념 보기' }))

    expect(screen.getByText('첫 번째 요약')).toHaveClass('font-semibold', 'text-neutral-100')
    expect(container.textContent).not.toContain('**')
  })

  it('개념 화면으로 나가는 링크를 두지 않는다', async () => {
    const user = userEvent.setup()
    renderRunner()

    await user.click(screen.getByRole('button', { name: '첫 번째 정답' }))

    expect(screen.queryByRole('link', { name: '근거 개념으로 돌아가기' })).toBeNull()
    expect(screen.queryByRole('link')).toBeNull()
  })

  // 랜덤 세트는 문항마다 주제가 다르다. 펼칠 주제는 지금 과목의 주제에서 찾는다.
  it('topics를 넘기지 않으면 과목의 주제를 펼친다', async () => {
    const user = userEvent.setup()
    const subject: Subject = { ...awsSubject, id: 'test', topics: testTopics, visualsByTopicId: {} }
    render(
      <SubjectContext.Provider value={subject}>
        <MemoryRouter>
          <QuizRunner
            answer={vi.fn()}
            questions={testQuestions}
            renderComplete={() => <section>완료</section>}
            review={{}}
            setInReview={vi.fn()}
            title="사용자 지정 제목"
          />
        </MemoryRouter>
      </SubjectContext.Provider>,
    )

    await user.click(screen.getByRole('button', { name: '개념 보기' }))

    expect(screen.getByRole('heading', { level: 3, name: '첫 번째 주제' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 4, name: '이웃 개념' })).toBeInTheDocument()
  })

  it('주제를 찾을 수 없는 문항에는 토글을 렌더하지 않는다', () => {
    renderRunner(vi.fn(() => <section>완료</section>), [])

    expect(screen.queryByRole('button', { name: '개념 보기' })).toBeNull()
  })

  describe('복습에 넣기', () => {
    it('답을 고르기 전에는 렌더하지 않는다', () => {
      renderRunner()

      expect(screen.queryByRole('button', { name: '복습에 넣기' })).toBeNull()
    })

    // 틀렸다고 저절로 넣지 않는다. 무엇을 복습할지는 해설을 읽은 학습자가 정한다 (ADR-032).
    it('틀려도 눌리지 않은 채로 나온다', async () => {
      const user = userEvent.setup()
      const { setInReview } = renderRunner()

      await user.click(screen.getByRole('button', { name: '오답 보기 1' }))

      expect(screen.getByRole('button', { name: '복습에 넣기' })).toHaveAttribute('aria-pressed', 'false')
      expect(setInReview).not.toHaveBeenCalled()
    })

    it('누르면 그 문항을 복습 목록에 넣는다', async () => {
      const user = userEvent.setup()
      const { setInReview } = renderRunner()

      await user.click(screen.getByRole('button', { name: '첫 번째 정답' }))
      await user.click(screen.getByRole('button', { name: '복습에 넣기' }))

      expect(setInReview).toHaveBeenCalledWith('q001', true)
    })

    // 라벨은 켜져 있어도 그대로다. 상태는 체크 표시와 aria-pressed가 전한다 — 개념 보기 토글과 같은 규칙.
    it('복습 목록에 든 문항은 같은 라벨로 눌린 채 나오고, 누르면 뺀다', async () => {
      const user = userEvent.setup()
      const { setInReview } = renderRunner(undefined, testTopics, { q001: true })

      await user.click(screen.getByRole('button', { name: '첫 번째 정답' }))
      const toggle = screen.getByRole('button', { name: '복습에 넣기' })
      expect(toggle).toHaveAttribute('aria-pressed', 'true')

      await user.click(toggle)

      expect(setInReview).toHaveBeenCalledWith('q001', false)
    })

    it('문항마다 그 문항의 복습 여부를 보여준다', async () => {
      const user = userEvent.setup()
      renderRunner(undefined, testTopics, { q002: true })

      await user.click(screen.getByRole('button', { name: '첫 번째 정답' }))
      expect(screen.getByRole('button', { name: '복습에 넣기' })).toHaveAttribute('aria-pressed', 'false')

      await user.click(screen.getByRole('button', { name: '첫 번째 정답' }))
      await user.click(screen.getByRole('button', { name: '두 번째 정답' }))
      expect(screen.getByRole('button', { name: '복습에 넣기' })).toHaveAttribute('aria-pressed', 'true')
    })

    it('되돌아간 문항에서도 복습에 넣을 수 있다', async () => {
      const user = userEvent.setup()
      const { setInReview } = renderRunner()

      await user.click(screen.getByRole('button', { name: '첫 번째 정답' }))
      await user.click(screen.getByRole('button', { name: '첫 번째 정답' }))
      await user.click(screen.getByRole('button', { name: '이전 문제' }))
      await user.click(screen.getByRole('button', { name: '복습에 넣기' }))

      expect(setInReview).toHaveBeenCalledWith('q001', true)
    })
  })
})
