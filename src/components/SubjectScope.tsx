import { Navigate, Outlet, useParams } from 'react-router-dom'
import { subjects as defaultSubjects } from '../data'
import { SubjectContext } from '../hooks/useSubject'
import type { Subject } from '../types/subject'

export function SubjectScope({ subjects = defaultSubjects }: { subjects?: Subject[] }) {
  const { subjectId } = useParams()
  const subject = subjects.find((candidate) => candidate.id === subjectId)

  if (!subject) return <Navigate replace to="/" />

  // 과목이 바뀌면 하위 화면을 다시 마운트한다. 라우트 모양이 같아 화면이 재사용되면
  // 첫 렌더에서 한 번만 읽는 값(useProgress의 저장소 등)에 앞 과목의 것이 남는다.
  return (
    <SubjectContext.Provider key={subject.id} value={subject}>
      <Outlet />
    </SubjectContext.Provider>
  )
}
