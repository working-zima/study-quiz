import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { QuizRunner } from '../components/QuizRunner'
import { questions as defaultQuestions } from '../data/aws'
import { useProgress } from '../hooks/useProgress'
import { shuffleQuestions } from '../lib/shuffle'
import { reviewQuestions } from '../lib/stats'
import type { Question } from '../types/content'
import type { Progress } from '../types/progress'

interface ReviewQuizPageProps {
  questions?: Question[]
  progress?: Progress
  answer?: (questionId: string, correct: boolean) => void
  setInReview?: (questionId: string, marked: boolean) => void
  shuffle?: (questions: Question[]) => Question[]
}

const defaultShuffle = (items: Question[]) => shuffleQuestions(items, Math.random)

const primaryButtonClass = 'inline-flex min-h-[44px] items-center rounded-md bg-neutral-100 px-4 py-2 text-neutral-900 transition-colors hover:bg-white'
const ghostLinkClass = 'inline-flex min-h-[44px] items-center rounded-md px-4 py-2 text-neutral-400 transition-colors hover:text-neutral-100'

export function ReviewQuizPage({
  questions = defaultQuestions,
  progress: providedProgress,
  answer: providedAnswer,
  setInReview: providedSetInReview,
  shuffle = defaultShuffle,
}: ReviewQuizPageProps) {
  const { topicId } = useParams()
  const { progress: storedProgress, answer: storedAnswer, setInReview: storedSetInReview } = useProgress()
  const progress = providedProgress ?? storedProgress
  const answer = providedAnswer ?? storedAnswer
  const setInReview = providedSetInReview ?? storedSetInReview
  // 푸는 동안 복습 목록이 바뀌어도 세트는 흔들리지 않아야 한다. 진입 시점에 한 번만 고른다.
  const [selectedQuestions] = useState(() => {
    const reviewList = reviewQuestions(questions, progress)
    return shuffle(topicId ? reviewList.filter((question) => question.topicId === topicId) : reviewList)
  })

  if (selectedQuestions.length === 0) {
    return (
      <section className="max-w-2xl space-y-8 break-keep break-anywhere">
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold text-title">복습 문제 풀기</h1>
          <p className="text-[15px] leading-7 text-neutral-300">다시 풀 문항이 없습니다.</p>
        </div>
        <Link className={primaryButtonClass} to="/review">복습으로 돌아가기</Link>
      </section>
    )
  }

  return (
    <QuizRunner
      answer={answer}
      questions={selectedQuestions}
      renderComplete={(correctCount, total) => (
        <section className="max-w-2xl space-y-8 break-keep break-anywhere">
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold text-title">복습 문제 풀기 완료</h1>
            <p className="text-[15px] leading-7 text-neutral-300">맞힌 개수 {correctCount} / {total}</p>
          </div>
          <nav aria-label="복습 문제 풀기 완료 후 이동" className="flex flex-wrap gap-3">
            <Link className={primaryButtonClass} to="/review">복습으로 돌아가기</Link>
            <Link className={ghostLinkClass} to="/">주제 목록으로 돌아가기</Link>
          </nav>
        </section>
      )}
      review={progress.review}
      setInReview={setInReview}
      title="복습 문제 풀기"
    />
  )
}
