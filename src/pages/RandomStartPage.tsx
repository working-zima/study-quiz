import { Link } from 'react-router-dom'
import { useSubject } from '../hooks/useSubject'
import { RANDOM_QUIZ_ALL, RANDOM_QUIZ_COUNTS } from '../lib/random-quiz'
import type { Question } from '../types/content'

interface RandomStartPageProps {
  questions?: Question[]
}

const countLinkClass = 'inline-flex min-h-[44px] items-center rounded-md border border-neutral-800 bg-[#141414] px-4 py-2 text-neutral-300 transition-colors hover:border-neutral-700 hover:text-neutral-100'

export function RandomStartPage({ questions: providedQuestions }: RandomStartPageProps) {
  const subject = useSubject()
  const questions = providedQuestions ?? subject.questions
  return (
    <section className="max-w-2xl space-y-8 break-keep break-anywhere">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-title">랜덤 문제</h1>
        <p className="text-[15px] leading-7 text-neutral-300">
          전체 {questions.length}문항에서 풀 문항 수를 고르세요.
        </p>
      </div>
      <nav aria-label="랜덤 문제 문항 수" className="flex flex-wrap gap-3">
        {RANDOM_QUIZ_COUNTS.map((count) => (
          <Link className={countLinkClass} key={count} to={`/${subject.id}/random/${count}`}>
            {count}문항
          </Link>
        ))}
        <Link className={countLinkClass} to={`/${subject.id}/random/${RANDOM_QUIZ_ALL}`}>전체</Link>
      </nav>
    </section>
  )
}
