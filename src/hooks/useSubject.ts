import { createContext, useContext } from 'react'
import type { Subject } from '../types/subject'

export const SubjectContext = createContext<Subject | null>(null)

export function useSubject(): Subject {
  const subject = useContext(SubjectContext)
  // 과목 안의 화면이 과목 없이 렌더링됐다면 라우트 배선 실수다. AWS로 넘어가면 그 실수가 조용히 숨는다.
  if (!subject) throw new Error('useSubject는 SubjectScope 안에서만 부를 수 있다')
  return subject
}

export function useOptionalSubject(): Subject | null {
  return useContext(SubjectContext)
}
