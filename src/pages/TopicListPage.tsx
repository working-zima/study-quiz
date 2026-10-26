import { Link } from 'react-router-dom'
import { useProgress } from '../hooks/useProgress'
import { useSubject } from '../hooks/useSubject'
import { overallPercent, topicStats } from '../lib/stats'
import type { Question, Topic } from '../types/content'
import type { Progress } from '../types/progress'

interface TopicListPageProps {
  topics?: Topic[]
  questions?: Question[]
  progress?: Progress
}

const importanceLabel = {
  3: { label: '★★★', className: 'text-importance-high' },
  2: { label: '★★☆', className: 'text-importance-medium' },
} as const

export function TopicListPage({
  topics: providedTopics,
  questions: providedQuestions,
  progress: providedProgress,
}: TopicListPageProps) {
  const subject = useSubject()
  const topics = providedTopics ?? subject.topics
  const questions = providedQuestions ?? subject.questions
  const { progress: storedProgress } = useProgress()
  const progress = providedProgress ?? storedProgress
  const stats = topicStats(topics, questions, progress)
  const percent = overallPercent(stats)

  return (
    <section className="max-w-3xl space-y-8 break-keep break-anywhere">
      <div className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <h1 className="text-2xl font-semibold text-title">주제 목록</h1>
          <span className="text-sm text-muted">{percent}%</span>
        </div>
        <div
          aria-label={`전체 진행률 ${percent}%`}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={percent}
          className="h-1 rounded-full bg-neutral-800"
          role="progressbar"
        >
          <div className="h-full rounded-full bg-neutral-300" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <Link
        className="block rounded-lg border border-neutral-800 px-5 py-4 transition-colors hover:border-neutral-700"
        to={`/${subject.id}/random`}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-neutral-100">랜덤 문제</span>
          <span className="shrink-0 text-sm text-neutral-500">전체 {questions.length}문항</span>
        </div>
      </Link>

      {topics.length === 0 ? (
        <p className="text-[15px] leading-7 text-muted">표시할 학습 주제가 없습니다.</p>
      ) : (
        <div className="grid gap-3">
          {topics.map((topic, index) => {
            const stat = stats[index]
            const importance = topic.importance === 0 ? null : importanceLabel[topic.importance]
            const progressStatus = stat.answered > 0
              ? `정답 ${stat.correct}/${stat.total}`
              : stat.read ? '읽음' : null
            // 개념은 들어왔지만 확인 문제가 아직 없는 주제가 있다. 목록에서 미리 알려 주지 않으면
            // 학습자가 개념을 다 읽고 나서야 확인 문제가 없다는 것을 발견한다.
            const status = stat.total === 0
              ? [progressStatus, '확인 문제 준비 중'].filter(Boolean).join(' · ')
              : progressStatus

            return (
              <Link
                className="rounded-lg border border-neutral-800 bg-panel p-5 transition-colors hover:border-neutral-700"
                key={topic.id}
                to={`/${subject.id}/topic/${topic.id}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-medium text-neutral-100">{topic.title}</h2>
                  {importance && (
                    <span className={`shrink-0 text-sm ${importance.className}`}>
                      {importance.label}
                    </span>
                  )}
                </div>
                {status && <p className="mt-3 text-xs text-neutral-500">{status}</p>}
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
