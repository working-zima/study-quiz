import { useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { QuizRunner } from '../components/QuizRunner'
import { useProgress } from '../hooks/useProgress'
import { useSubject } from '../hooks/useSubject'
import { parseQuizCount } from '../lib/random-quiz'
import { shuffleQuestions } from '../lib/shuffle'
import type { Question } from '../types/content'
import type { Progress } from '../types/progress'

interface RandomQuizPageProps {
  questions?: Question[]
  progress?: Progress
  answer?: (questionId: string, correct: boolean) => void
  setInReview?: (questionId: string, marked: boolean) => void
  shuffle?: (questions: Question[]) => Question[]
}

const defaultShuffle = (items: Question[]) => shuffleQuestions(items, Math.random)

const primaryButtonClass = 'inline-flex min-h-[44px] items-center rounded-md bg-neutral-100 px-4 py-2 text-neutral-900 transition-colors hover:bg-white'
const ghostLinkClass = 'inline-flex min-h-[44px] items-center rounded-md px-4 py-2 text-neutral-400 transition-colors hover:text-neutral-100'

export function RandomQuizPage({
  questions: providedQuestions,
  progress: providedProgress,
  answer: providedAnswer,
  setInReview: providedSetInReview,
  shuffle = defaultShuffle,
}: RandomQuizPageProps) {
  const subject = useSubject()
  const questions = providedQuestions ?? subject.questions
  const { count: countSegment } = useParams()
  const count = parseQuizCount(countSegment, questions.length)
  const { progress: storedProgress, answer: storedAnswer, setInReview: storedSetInReview } = useProgress()
  const progress = providedProgress ?? storedProgress
  const answer = providedAnswer ?? storedAnswer
  const setInReview = providedSetInReview ?? storedSetInReview
  const selectedQuestions = useMemo(
    () => count === null ? [] : shuffle(questions).slice(0, count),
    [count, questions, shuffle],
  )

  if (count === null) {
    return <Navigate replace to={`/${subject.id}/random`} />
  }

  return (
    <QuizRunner
      answer={answer}
      key={count}
      questions={selectedQuestions}
      renderComplete={(correctCount, total) => {
        // 정오답이 아니라 복습 목록을 따른다. 이 세트에 복습할 문항이 있을 때만 복습으로 안내한다 (ADR-032).
        const hasReviewQuestion = selectedQuestions.some((question) => question.id in progress.review)
        return (
          <section className="max-w-2xl space-y-8 break-keep break-anywhere">
            <div className="space-y-3">
              <h1 className="text-2xl font-semibold text-title">랜덤 문제 완료</h1>
              <p className="text-[15px] leading-7 text-neutral-300">맞힌 개수 {correctCount} / {total}</p>
            </div>
            <nav aria-label="랜덤 문제 완료 후 이동" className="flex flex-wrap gap-3">
              {hasReviewQuestion && <Link className={primaryButtonClass} to={`/${subject.id}/review`}>복습하기</Link>}
              <Link className={hasReviewQuestion ? ghostLinkClass : primaryButtonClass} to={`/${subject.id}/random`}>다시 뽑기</Link>
              <Link className={ghostLinkClass} to={`/${subject.id}`}>주제 목록으로 돌아가기</Link>
            </nav>
          </section>
        )
      }}
      review={progress.review}
      setInReview={setInReview}
      title="랜덤 문제"
    />
  )
}
