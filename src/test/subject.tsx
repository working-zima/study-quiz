import { render } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { awsSubject } from '../data/aws'
import { SubjectContext } from '../hooks/useSubject'

function withAwsSubject({ children }: { children: ReactNode }) {
  return <SubjectContext.Provider value={awsSubject}>{children}</SubjectContext.Provider>
}

// 과목 안의 화면은 useSubject()로 과목을 읽으므로 Provider 없이 렌더링하면 던진다.
// 화면 테스트는 데이터를 props로 넘기므로 과목에서 쓰이는 것은 진행률 키뿐이다.
// wrapper로 감싸므로 돌려받은 rerender도 같은 과목 안에서 다시 그린다.
export function renderWithSubject(ui: ReactElement) {
  return render(ui, { wrapper: withAwsSubject })
}
