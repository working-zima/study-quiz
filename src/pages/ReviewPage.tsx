import { Link } from 'react-router-dom'
import { BackButton } from '../components/BackButton'
import { questions as defaultQuestions, topics as defaultTopics } from '../data/aws'
import { useProgress } from '../hooks/useProgress'
import { reviewQuestions } from '../lib/stats'
import type { Question, Topic } from '../types/content'
import type { Progress } from '../types/progress'

interface ReviewPageProps {
  topics?: Topic[]
  questions?: Question[]
  progress?: Progress
  setInReview?: (questionId: string, marked: boolean) => void
}

const ghostLinkClass = 'inline-flex min-h-[44px] shrink-0 items-center rounded-md px-4 py-2 text-sm text-neutral-400 transition-colors hover:text-neutral-100'

export function ReviewPage({
  topics = defaultTopics,
  questions = defaultQuestions,
  progress: providedProgress,
  setInReview: providedSetInReview,
}: ReviewPageProps) {
  const { progress: storedProgress, setInReview: storedSetInReview } = useProgress()
  const progress = providedProgress ?? storedProgress
  const setInReview = providedSetInReview ?? storedSetInReview
  const reviewList = reviewQuestions(questions, progress)
  const conceptNames = new Map(
    topics.flatMap((topic) => topic.concepts.map((concept) => [concept.id, concept.name] as const)),
  )
  const reviewGroups = topics
    .map((topic) => ({
      topic,
      groupQuestions: reviewList.filter((question) => question.topicId === topic.id),
    }))
    .filter((group) => group.groupQuestions.length > 0)

  return (
    <section className="max-w-3xl space-y-8 break-keep break-anywhere">
      <div className="space-y-3">
        <BackButton />
        <h1 className="text-2xl font-semibold text-title">복습</h1>
      </div>

      {reviewGroups.length === 0 ? (
        // 문제를 풀었어도 복습에 넣지 않았으면 목록은 비어 있다. 그때도 넣는 방법을 알린다 (ADR-032).
        <div className="space-y-3">
          <p className="text-[15px] leading-7 text-body">
            문제를 푼 뒤 복습에 넣은 문항이 여기에 모입니다.
          </p>
          <Link className="inline-flex min-h-[44px] items-center rounded-md px-4 py-2 text-neutral-400 transition-colors hover:text-neutral-100" to="/">
            주제 목록으로 가기
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[15px] leading-7 text-body">복습할 문항 {reviewList.length}개</p>
            <Link className={ghostLinkClass} to="/review/quiz">전체 다시 풀기</Link>
          </div>

          {reviewGroups.map(({ topic, groupQuestions }) => {
            const headingId = `review-${topic.id}`

            return (
              <section
                aria-labelledby={headingId}
                className="space-y-4 border-t border-neutral-800 pt-6"
                key={topic.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-medium text-neutral-100" id={headingId}>
                    {topic.title}
                  </h2>
                  <Link className={ghostLinkClass} to={`/review/quiz/${topic.id}`}>
                    다시 풀기
                  </Link>
                </div>

                <ul className="divide-y divide-neutral-800">
                  {groupQuestions.map((question) => (
                    <li className="space-y-2 py-4" key={question.id}>
                      <p className="text-base text-neutral-100">{question.prompt}</p>
                      <div className="flex items-center justify-between gap-3">
                        <Link
                          className="text-sm text-neutral-400 transition-colors hover:text-neutral-100"
                          to={`/topic/${question.topicId}`}
                        >
                          근거 개념: {conceptNames.get(question.conceptId)}
                        </Link>
                        {/* 다시 맞혔다고 저절로 빠지지 않는다. 빼는 길은 이 버튼과 문제 화면의 복습에 넣기 스위치다 (ADR-017·ADR-032). */}
                        <button
                          aria-label={`복습 목록에서 지우기: ${question.prompt}`}
                          className={ghostLinkClass}
                          onClick={() => setInReview(question.id, false)}
                          type="button"
                        >
                          지우기
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </section>
  )
}
