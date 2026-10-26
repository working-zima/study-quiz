import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { awsSubject } from '../data/aws'
import { SubjectContext } from '../hooks/useSubject'
import { renderWithSubject } from '../test/subject'
import type { Subject } from '../types/subject'
import { BackButton } from './BackButton'

// 검색 화면처럼 자기 주소를 replace로 갈아치우는 화면을 흉내 낸다.
function ReplacingScreen() {
  const navigate = useNavigate()

  return (
    <>
      <button onClick={() => navigate('/aws/search?q=aurora', { replace: true })} type="button">
        주소 갈아치우기
      </button>
      <BackButton />
    </>
  )
}

function renderWithHistory(entries: string[]) {
  return renderWithSubject(
    <MemoryRouter initialEntries={entries} initialIndex={entries.length - 1}>
      <Routes>
        <Route element={<p>주제 목록 화면</p>} path="/aws" />
        <Route element={<p>개념 읽기 화면</p>} path="/aws/topic/database" />
        <Route element={<ReplacingScreen />} path="/aws/search" />
      </Routes>
    </MemoryRouter>,
  )
}

function CurrentPath() {
  return <output aria-label="현재 경로">{useLocation().pathname}</output>
}

describe('BackButton', () => {
  it('직전 화면으로 돌아간다', async () => {
    renderWithHistory(['/aws/topic/database', '/aws/search'])

    await userEvent.click(screen.getByRole('button', { name: '돌아가기' }))

    expect(screen.getByText('개념 읽기 화면')).toBeInTheDocument()
  })

  it('직접 연 화면이면 앱 밖으로 나가지 않고 주제 목록으로 보낸다', async () => {
    renderWithHistory(['/aws/search'])

    await userEvent.click(screen.getByRole('button', { name: '돌아가기' }))

    expect(screen.getByText('주제 목록 화면')).toBeInTheDocument()
  })

  it('화면이 주소를 replace해도 진입 시점의 판단을 유지한다', async () => {
    renderWithHistory(['/aws/search'])

    await userEvent.click(screen.getByRole('button', { name: '주소 갈아치우기' }))
    await userEvent.click(screen.getByRole('button', { name: '돌아가기' }))

    expect(screen.getByText('주제 목록 화면')).toBeInTheDocument()
  })

  // 주제 목록은 과목마다 있다. 과목 목록(/)으로 보내면 읽던 과목에서 한 단계 더 밀려난다.
  it('직접 연 화면이면 그 과목의 홈으로 보낸다', async () => {
    const networkSubject: Subject = { ...awsSubject, id: 'net', title: '네트워크', progressKey: 'net.progress', hasKeywordQuiz: false }
    render(
      <SubjectContext.Provider value={networkSubject}>
        <MemoryRouter initialEntries={['/net/search']}>
          <Routes>
            <Route element={<BackButton />} path="/net/search" />
            <Route element={null} path="*" />
          </Routes>
          <CurrentPath />
        </MemoryRouter>
      </SubjectContext.Provider>,
    )

    await userEvent.click(screen.getByRole('button', { name: '돌아가기' }))

    expect(screen.getByLabelText('현재 경로').textContent).toBe('/net')
  })
})
