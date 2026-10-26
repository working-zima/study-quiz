import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSubject } from '../hooks/useSubject'

// 주제 목록의 「모든 과목」 링크가 같은 모양을 쓴다(UI_GUIDE 「돌아가기」).
export const backIcon = (
  <svg aria-hidden="true" fill="none" height="20" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="20">
    <path d="M15 19l-7-7 7-7" />
  </svg>
)

// -ml-4로 px-4를 상쇄해야 화살표가 아래의 제목·본문과 같은 세로선(320px에서 20px)에 선다.
export const backButtonClass = '-ml-4 inline-flex min-h-[44px] items-center gap-2 rounded-md px-4 py-2 text-sm text-neutral-400 transition-colors hover:text-neutral-100'

export function BackButton() {
  const navigate = useNavigate()
  const subject = useSubject()
  const { key } = useLocation()
  // 새 탭이나 공유 링크로 이 화면을 직접 열면 돌아갈 앱 화면이 없다(첫 항목의 키가 'default').
  // 화면이 주소를 replace하면 키가 바뀌므로 진입 시점 값을 붙잡아 둔다.
  const [hasPreviousScreen] = useState(() => key !== 'default')

  function handleBack() {
    if (hasPreviousScreen) {
      navigate(-1)
      return
    }

    navigate(`/${subject.id}`)
  }

  return (
    <button className={backButtonClass} onClick={handleBack} type="button">
      {backIcon}
      돌아가기
    </button>
  )
}
