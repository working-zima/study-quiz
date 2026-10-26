import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ConceptList } from '../components/ConceptList'
import { questions as defaultQuestions, topics as defaultTopics, visualsByTopicId } from '../data/aws'
import { useProgress } from '../hooks/useProgress'
import { adjacentTopics } from '../lib/navigation'
import type { Question, Topic } from '../types/content'

interface ConceptReadPageProps {
  topics?: Topic[]
  questions?: Question[]
  markRead?: (topicId: string) => void
}

const previousIcon = (
  <svg aria-hidden="true" fill="none" height="20" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="20">
    <path d="M15 19l-7-7 7-7" />
  </svg>
)

const nextIcon = (
  <svg aria-hidden="true" fill="none" height="20" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="20">
    <path d="M9 5l7 7-7 7" />
  </svg>
)

const primaryButtonClass = 'inline-flex min-h-[44px] items-center rounded-md bg-neutral-100 px-4 py-2 text-neutral-900 transition-colors hover:bg-white'

const ghostLinkClass = 'inline-flex min-h-[44px] items-center rounded-md px-4 py-2 text-neutral-400 transition-colors hover:text-neutral-100'

const importanceLabel = {
  3: { label: '★★★', className: 'text-importance-high' },
  2: { label: '★★☆', className: 'text-importance-medium' },
} as const

export function ConceptReadPage({ topics = defaultTopics, questions = defaultQuestions, markRead: providedMarkRead }: ConceptReadPageProps) {
  const { topicId } = useParams()
  const { hash } = useLocation()
  const { markRead: storedMarkRead } = useProgress()
  const markRead = providedMarkRead ?? storedMarkRead
  const topic = topics.find((candidate) => candidate.id === topicId)
  const { prev, next } = adjacentTopics(topics, topicId)

  useEffect(() => {
    if (topicId && topic) markRead(topicId)
  }, [markRead, topic, topicId])

  // 검색 결과가 개념 하나를 지목해 들어오는 경로다(ADR-020).
  // `Layout`은 해시가 있으면 맨 위로 되돌리지 않으므로 여기가 스크롤 주인이다.
  useEffect(() => {
    if (!hash) return

    // 개념 id는 `aws-core-services.ec2`처럼 점을 품는다. CSS 선택자로 읽으면
    // 점이 클래스 구분자로 해석되므로 getElementById로 찾는다.
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView()
  }, [hash])

  // iOS 26 Safari는 툴바가 접혀도 하단 sticky 요소를 따라 내리지 않아 바 밑에 본문이 비친다(ADR-052).
  // 툴바처럼 내릴 때 숨기고 올릴 때 보인다. 맨 위에서 튕기는 스크롤(음수 → 0)은 내림으로 치지 않는다.
  // 들어온 직후의 첫 스크롤은 브라우저·`Layout`이 옮긴 것(뒤로 가기의 위치 복원, 맨 위로, 앵커)이라 기준점으로만 쓴다.
  const [scrollingDown, setScrollingDown] = useState(false)
  useEffect(() => {
    let lastY: number | null = null
    function handleScroll() {
      const y = window.scrollY
      if (lastY !== null && y !== lastY) setScrollingDown(y > 0 && y > lastY)
      lastY = y
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!topic) {
    return (
      <section className="max-w-2xl space-y-8 break-keep break-anywhere">
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold text-title">주제를 찾을 수 없습니다.</h1>
          <p className="text-[15px] leading-7 text-neutral-300">요청한 학습 주제가 존재하지 않습니다.</p>
        </div>
        <Link className={primaryButtonClass} to="/">
          주제 목록으로 돌아가기
        </Link>
      </section>
    )
  }

  const importance = topic.importance === 0 ? null : importanceLabel[topic.importance]
  // 개념은 들어왔지만 확인 문제가 아직 없는 주제가 있다. 그 주제에서 주 액션을 확인 문제로 두면
  // 개념을 다 읽은 학습자가 "아직 확인 문제가 없습니다" 안내 화면에 갇힌다. 갈 곳을 주 액션으로 둔다.
  const hasQuestions = questions.some((question) => question.topicId === topic.id)
  const onward = next
    ? { to: `/topic/${next.id}`, label: '다음 주제 이어가기' }
    : { to: '/', label: '주제 목록으로 돌아가기' }
  const primaryAction = hasQuestions
    ? { to: `/topic/${topic.id}/quiz`, label: '확인 문제 풀기' }
    : onward

  return (
    <section className="max-w-2xl space-y-8 break-keep break-anywhere">
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold text-title">{topic.title}</h1>
          {importance && <span className={`shrink-0 text-sm ${importance.className}`}>{importance.label}</span>}
        </div>
      </header>

      <ConceptList concepts={topic.concepts} glossary={visualsByTopicId[topic.id]?.glossary} headingLevel={2} />

      {!hasQuestions && (
        <p className="text-[15px] leading-7 text-muted">이 주제의 확인 문제는 준비 중입니다.</p>
      )}

      <div className={`sticky bottom-0 -mx-5 border-t border-border bg-page px-5 py-3 sm:mx-0 sm:px-0 ${scrollingDown ? 'max-sm:static' : ''}`}>
        <div className="flex items-center justify-between gap-3">
          {prev ? (
            <Link aria-label="이전 주제" className={ghostLinkClass} to={`/topic/${prev.id}`}>
              {previousIcon}
            </Link>
          ) : (
            <span aria-hidden="true" className={`${ghostLinkClass} text-neutral-500`}>
              {previousIcon}
            </span>
          )}
          <Link className={primaryButtonClass} to={primaryAction.to}>
            {primaryAction.label}
          </Link>
          {next ? (
            <Link aria-label="다음 주제" className={ghostLinkClass} to={`/topic/${next.id}`}>
              {nextIcon}
            </Link>
          ) : (
            <span aria-hidden="true" className={`${ghostLinkClass} text-neutral-500`}>
              {nextIcon}
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
