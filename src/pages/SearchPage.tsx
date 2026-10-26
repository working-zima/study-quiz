import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BackButton } from '../components/BackButton'
import { useSubject } from '../hooks/useSubject'
import { searchContent, splitBodyOnly, stripEmphasis } from '../lib/search'
import type { SearchHit } from '../lib/search'
import type { Topic } from '../types/content'

interface SearchPageProps {
  topics?: Topic[]
}

const cardClass = 'block rounded-lg border border-neutral-800 bg-panel p-5 transition-colors hover:border-neutral-700'
const toggleClass = 'inline-flex min-h-[44px] items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-neutral-100'
const bodyHitsPanelId = 'search-body-hits'

const chevronDownIcon = (
  <svg aria-hidden="true" fill="none" height="20" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="20">
    <path d="M6 9l6 6 6-6" />
  </svg>
)

const chevronUpIcon = (
  <svg aria-hidden="true" fill="none" height="20" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="20">
    <path d="M18 15l-6-6-6 6" />
  </svg>
)

export function SearchPage({ topics: providedTopics }: SearchPageProps) {
  const subject = useSubject()
  const topics = providedTopics ?? subject.topics
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const hasQuery = query.trim().length > 0
  const hits = searchContent(topics, query)
  const { primary, bodyOnly } = splitBodyOnly(hits, query)
  // 접는 목적은 이름·요약 히트를 본문 히트 위에 남기는 것이다. 남길 것이 없으면
  // 접지 않는다 — 빈 목록과 펼치기만 남으면 결과가 없는 것처럼 보인다.
  const shownHits = primary.length > 0 ? primary : bodyOnly
  const foldedHits = primary.length > 0 ? bodyOnly : []
  // 펼친 질의를 들고 있는다. 질의가 바뀌면 앞 질의에서 펼친 상태가 남지 않는다
  // (UI_GUIDE "개념 펼치기"가 문항을 옮길 때 닫는 것과 같은 규칙이다).
  const [openedFor, setOpenedFor] = useState<string | null>(null)
  const foldedOpen = openedFor === query

  function renderHit(hit: SearchHit) {
    return hit.kind === 'concept' ? (
      <Link
        className={cardClass}
        key={hit.concept.id}
        to={`/${subject.id}/topic/${hit.topic.id}#${hit.concept.id}`}
      >
        <span className="block text-base font-medium text-neutral-100">
          {hit.concept.name}
        </span>
        <span className="mt-1 block text-xs text-neutral-500">{hit.topic.title}</span>
        <span className="mt-2 block text-sm text-neutral-400">
          {stripEmphasis(hit.concept.summary)}
        </span>
      </Link>
    ) : (
      <Link className={cardClass} key={hit.topic.id} to={`/${subject.id}/topic/${hit.topic.id}`}>
        <span className="block text-lg font-medium text-neutral-100">{hit.topic.title}</span>
        <span className="mt-1 block text-xs text-neutral-500">주제</span>
      </Link>
    )
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value
    // replace가 없으면 글자 수만큼 히스토리가 쌓여 뒤로 가기가 한 글자씩 되감긴다.
    setSearchParams(next === '' ? {} : { q: next }, { replace: true })
  }

  return (
    <section className="max-w-3xl space-y-8 break-keep break-anywhere">
      <div className="space-y-3">
        <BackButton />
        <div className="flex items-end justify-between gap-3">
          <h1 className="text-2xl font-semibold text-title">검색</h1>
          {hasQuery && <span className="text-sm text-neutral-500">결과 {hits.length}개</span>}
        </div>
        <input
          aria-label="개념·주제 검색"
          autoFocus
          className="w-full rounded-md border border-neutral-800 bg-[#141414] px-4 py-3 text-[15px] text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-600 focus:outline-none"
          onChange={handleChange}
          placeholder="개념·주제 검색"
          type="text"
          value={query}
        />
      </div>

      {!hasQuery ? (
        <p className="text-[15px] leading-7 text-neutral-400">
          개념 이름이나 주제 이름을 입력하면 결과가 여기에 나옵니다.
        </p>
      ) : hits.length === 0 ? (
        <p className="text-[15px] leading-7 text-neutral-400">검색 결과가 없습니다.</p>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-3">{shownHits.map(renderHit)}</div>
          {foldedHits.length > 0 && (
            <>
              <button
                aria-controls={bodyHitsPanelId}
                aria-expanded={foldedOpen}
                className={toggleClass}
                onClick={() => setOpenedFor(foldedOpen ? null : query)}
                type="button"
              >
                {foldedOpen ? chevronUpIcon : chevronDownIcon}
                본문에서 {foldedHits.length}개 더 찾음
              </button>
              {foldedOpen && (
                <div className="grid gap-3" id={bodyHitsPanelId}>
                  {foldedHits.map(renderHit)}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  )
}
