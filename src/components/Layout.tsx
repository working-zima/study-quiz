import { useEffect, useRef, type MouseEvent } from 'react'
import { NavLink, Outlet, useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { useOptionalSubject } from '../hooks/useSubject'
import { registerLogoTap } from '../lib/keyword-quiz'

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  `inline-flex min-h-[44px] items-center px-4 py-2 text-sm transition-colors hover:text-title ${isActive ? 'text-title' : 'text-muted'}`

export function Layout() {
  const { hash, key } = useLocation()
  const navigationType = useNavigationType()
  const navigate = useNavigate()
  const logoTaps = useRef<number[]>([])
  // 헤더가 갈리는 근거는 과목 컨텍스트가 있느냐 하나다. 과목 안에서는 어느 화면이든 헤더가 같다.
  const subject = useOptionalSubject()

  useEffect(() => {
    if (navigationType === 'POP') return
    // 목적지가 앵커를 지정했으면 스크롤 주인은 그 화면이다(ADR-020).
    // 여기서 0으로 되돌리면 착지 직후 개념 위치가 지워진다.
    if (hash) return

    window.scrollTo(0, 0)
  }, [hash, key, navigationType])

  // 로고 연속 탭은 숨은 키워드 퀴즈의 유일한 입구다(ADR-040). 그 밖의 탭은 평소처럼 로고 링크로 간다.
  // 키워드 퀴즈가 없는 과목과 과목 밖에서는 탭을 세지 않는다.
  function handleLogoClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!subject?.hasKeywordQuiz) return
    const { taps, unlocked } = registerLogoTap(logoTaps.current, Date.now())
    logoTaps.current = taps
    if (!unlocked) return
    event.preventDefault()
    navigate(`/${subject.id}/keywords`)
  }

  return (
    <div className="min-h-screen bg-page text-body">
      <header className="sticky top-0 border-b border-border bg-page">
        <div className="px-5 py-4 sm:px-8">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <NavLink className="inline-flex min-h-[44px] items-center text-base font-medium text-title" onClick={handleLogoClick} to={subject ? `/${subject.id}` : '/'}>
              {subject ? subject.title : 'Study Quiz'}
            </NavLink>
            {/* 검색·복습은 과목 안의 기능이라 과목 목록 화면에는 갈 곳이 없다. */}
            {subject && (
              <nav aria-label="주요 내비게이션" className="flex items-center gap-1">
                <NavLink className={linkClassName} to={`/${subject.id}/search`}>검색</NavLink>
                <NavLink className={linkClassName} to={`/${subject.id}/review`}>복습</NavLink>
              </nav>
            )}
          </div>
        </div>
      </header>
      <main className="px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-3xl"><Outlet /></div>
      </main>
    </div>
  )
}
