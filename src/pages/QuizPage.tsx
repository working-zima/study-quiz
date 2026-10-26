import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { QuizRunner } from '../components/QuizRunner'
import { useProgress } from '../hooks/useProgress'
import { useSubject } from '../hooks/useSubject'
import { adjacentTopics } from '../lib/navigation'
import { shuffleQuestions } from '../lib/shuffle'
import type { Question, Topic } from '../types/content'
import type { Progress } from '../types/progress'

interface QuizPageProps {
  questions?: Question[]
  topics?: Topic[]
  progress?: Progress
  answer?: (questionId: string, correct: boolean) => void
  setInReview?: (questionId: string, marked: boolean) => void
  shuffle?: (questions: Question[]) => Question[]
}

const defaultShuffle = (items: Question[]) => shuffleQuestions(items, Math.random)

const primaryButtonClass = 'inline-flex min-h-[44px] items-center rounded-md bg-neutral-100 px-4 py-2 text-neutral-900 transition-colors hover:bg-white'
const ghostLinkClass = 'inline-flex min-h-[44px] items-center rounded-md px-4 py-2 text-neutral-400 transition-colors hover:text-neutral-100'

export function QuizPage({
  questions: providedQuestions,
  topics: providedTopics,
  progress: providedProgress,
  answer: providedAnswer,
  setInReview: providedSetInReview,
  shuffle = defaultShuffle,
}: QuizPageProps) {
  const subject = useSubject()
  const questions = providedQuestions ?? subject.questions
  const topics = providedTopics ?? subject.topics
  const { topicId } = useParams()
  const { progress: storedProgress, answer: storedAnswer, setInReview: storedSetInReview } = useProgress()
  const progress = providedProgress ?? storedProgress
  const answer = providedAnswer ?? storedAnswer
  const setInReview = providedSetInReview ?? storedSetInReview
  const topicQuestions = useMemo(
    () => shuffle(questions.filter((question) => question.topicId === topicId)),
    [questions, shuffle, topicId],
  )
  const { next } = adjacentTopics(topics, topicId)

  if (!topicId || topicQuestions.length === 0) {
    return (
      <section className="max-w-2xl space-y-8 break-keep break-anywhere">
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold text-title">아직 확인 문제가 없습니다.</h1>
          <p className="text-[15px] leading-7 text-neutral-300">이 주제의 확인 문제는 준비 중입니다.</p>
        </div>
        {topicId && <Link className={primaryButtonClass} to={`/${subject.id}/topic/${topicId}`}>개념으로 돌아가기</Link>}
        {!topicId && <Link className={primaryButtonClass} to={`/${subject.id}`}>주제 목록으로 돌아가기</Link>}
      </section>
    )
  }

  return (
    <QuizRunner
      answer={answer}
      questions={topicQuestions}
      renderComplete={(correctCount, total) => {
        // 정오답이 아니라 복습 목록을 따른다. 이 세트에 복습할 문항이 있을 때만 복습으로 안내한다 (ADR-032).
        const hasReviewQuestion = topicQuestions.some((question) => question.id in progress.review)
        return (
          <section className="max-w-2xl space-y-8 break-keep break-anywhere">
            <div className="space-y-3">
              <h1 className="text-2xl font-semibold text-title">확인 문제 완료</h1>
              <p className="text-[15px] leading-7 text-neutral-300">맞힌 개수 {correctCount} / {total}</p>
            </div>
            <nav className="flex flex-wrap gap-3" aria-label="퀴즈 완료 후 이동">
              {hasReviewQuestion && <Link className={primaryButtonClass} to={`/${subject.id}/review`}>복습하기</Link>}
              {next && (
                <Link className={hasReviewQuestion ? ghostLinkClass : primaryButtonClass} to={`/${subject.id}/topic/${next.id}`}>
                  다음 주제 이어가기
                </Link>
              )}
              <Link className={ghostLinkClass} to={`/${subject.id}/topic/${topicId}`}>개념으로 돌아가기</Link>
            </nav>
          </section>
        )
      }}
      review={progress.review}
      setInReview={setInReview}
      title="확인 문제"
    />
  )
}
