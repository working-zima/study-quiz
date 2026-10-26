import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { Link, MemoryRouter, Route, Routes, useLocation, useNavigationType } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { useSubject } from '../hooks/useSubject'
import type { Subject } from '../types/subject'
import { SubjectScope } from './SubjectScope'

function fakeSubject(id: string): Subject {
  return {
    id,
    title: `과목 ${id}`,
    progressKey: `${id}.progress`,
    topics: [],
    questions: [],
    visualsByTopicId: {},
    hasKeywordQuiz: false,
  }
}

const testSubjects = [fakeSubject('a'), fakeSubject('b')]

function SubjectName() {
  return <p>지금 과목: {useSubject().id}</p>
}

// useProgress처럼 첫 렌더에서 한 번만 읽은 값을 붙잡는 화면을 흉내 낸다.
function FirstSubjectScreen() {
  const subject = useSubject()
  const [firstSubjectId] = useState(subject.id)

  return (
    <>
      <p>처음 읽은 과목: {firstSubjectId}</p>
      <Link to="/b/page">b 과목으로</Link>
    </>
  )
}

function CurrentLocation() {
  const { pathname } = useLocation()
  return <output aria-label="현재 위치">{`${useNavigationType()} ${pathname}`}</output>
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<p>과목 목록 화면</p>} path="/" />
        <Route element={<SubjectScope subjects={testSubjects} />} path=":subjectId">
          <Route element={<SubjectName />} index />
          <Route element={<FirstSubjectScreen />} path="page" />
        </Route>
      </Routes>
      <CurrentLocation />
    </MemoryRouter>,
  )
}

describe('SubjectScope', () => {
  it('URL의 과목 id로 과목을 찾아 하위 화면에 준다', () => {
    renderAt('/b')

    expect(screen.getByText('지금 과목: b')).toBeInTheDocument()
  })

  it('없는 과목이면 과목 목록으로 replace한다', () => {
    renderAt('/nope')

    expect(screen.getByText('과목 목록 화면')).toBeInTheDocument()
    expect(screen.getByLabelText('현재 위치').textContent).toBe('REPLACE /')
  })

  // 라우트 트리 모양이 같아 React가 화면을 재사용하면, 첫 렌더에 읽은 앞 과목의 값이 남는다.
  it('과목이 바뀌면 하위 화면을 다시 마운트한다', async () => {
    renderAt('/a/page')
    expect(screen.getByText('처음 읽은 과목: a')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('link', { name: 'b 과목으로' }))

    expect(screen.getByText('처음 읽은 과목: b')).toBeInTheDocument()
  })
})
