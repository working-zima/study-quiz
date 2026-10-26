import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { awsSubject } from '../data/aws'
import { SubjectContext } from '../hooks/useSubject'
import { renderWithSubject } from '../test/subject'
import type { Subject } from '../types/subject'
import { Layout } from './Layout'

function ConceptRoute() {
  const navigate = useNavigate()

  return <button onClick={() => navigate(-1)}>뒤로 가기</button>
}

function renderTestRoutes() {
  return renderWithSubject(
    <MemoryRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route
            index
            element={
              <>
                <Link to="/topic/example">개념 보기</Link>
                <Link to="/topic/example#example.concept">개념 위치로 보기</Link>
              </>
            }
          />
          <Route path="topic/example" element={<ConceptRoute />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

// 키워드 퀴즈가 없는 두 번째 과목. 로고 이름과 주소가 과목에서 온다는 것을 AWS 밖의 값으로 확인한다.
const networkSubject: Subject = { ...awsSubject, id: 'net', title: '네트워크', progressKey: 'net.progress', hasKeywordQuiz: false }

function CurrentPath() {
  return <output aria-label="현재 경로">{useLocation().pathname}</output>
}

// subject가 null이면 과목 목록 화면처럼 과목 컨텍스트 밖에서 그린다.
function renderInSubject(subject: Subject | null) {
  const routes = (
    <MemoryRouter initialEntries={[subject ? `/${subject.id}` : '/']}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="*" element={<p>화면 내용</p>} />
        </Route>
      </Routes>
      <CurrentPath />
    </MemoryRouter>
  )

  return render(subject ? <SubjectContext.Provider value={subject}>{routes}</SubjectContext.Provider> : routes)
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Layout', () => {
  it('앱 이름과 공통 내비게이션을 렌더링한다', () => {
    renderWithSubject(
      <MemoryRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<p>화면 내용</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'AWS SAA-C03' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: '주요 내비게이션' })).toBeInTheDocument()
    expect(screen.getByText('화면 내용')).toBeInTheDocument()
  })

  it('로고와 내비게이션 링크의 최소 터치 높이를 보장한다', () => {
    renderWithSubject(
      <MemoryRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<p>화면 내용</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'AWS SAA-C03' })).toHaveClass('min-h-[44px]')
    expect(screen.getByRole('link', { name: '복습' })).toHaveClass('min-h-[44px]')
  })

  // 확인 문제 화면의 근거 개념은 헤더가 아니라 문항 화면 안의 펼치기가 맡는다
  // (UI_GUIDE "보기 버튼 > 개념 펼치기"). 헤더에 다시 넣으면 링크가 세 개가 된다.
  it.each(['/', '/topic/vpc', '/topic/vpc/quiz', '/review'])('%s에서 근거 개념 링크를 렌더링하지 않는다', (path) => {
    renderWithSubject(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<p>주제 목록</p>} />
            <Route path="topic/:topicId" element={<p>개념 읽기</p>} />
            <Route path="topic/:topicId/quiz" element={<p>확인 문제</p>} />
            <Route path="review" element={<p>복습 화면</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.queryByRole('link', { name: '근거 개념' })).toBeNull()
  })

  it.each(['/', '/topic/vpc', '/topic/vpc/quiz', '/review'])('%s에서 주제 목록 링크를 렌더링하지 않는다', (path) => {
    renderWithSubject(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<p>주제 목록</p>} />
            <Route path="topic/:topicId" element={<p>개념 읽기</p>} />
            <Route path="topic/:topicId/quiz" element={<p>확인 문제</p>} />
            <Route path="review" element={<p>복습 화면</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.queryByRole('link', { name: '주제 목록' })).toBeNull()
  })

  it('헤더를 불투명한 sticky 영역으로 고정한다', () => {
    renderWithSubject(
      <MemoryRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<p>화면 내용</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const header = screen.getByRole('banner')

    expect(header).toHaveClass('sticky', 'top-0', 'bg-page', 'border-b')
    expect(header).not.toHaveClass('fixed')
  })

  it('헤더와 화면 내용을 동일한 중앙 정렬 셸에 배치한다', () => {
    renderWithSubject(
      <MemoryRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<p>화면 내용</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const headerShell = screen.getByRole('link', { name: 'AWS SAA-C03' }).parentElement
    const mainShell = screen.getByText('화면 내용').parentElement

    expect(headerShell).toHaveClass('mx-auto', 'max-w-3xl')
    expect(mainShell).toHaveClass('mx-auto', 'max-w-3xl')

    const headerWidthClass = [...(headerShell?.classList ?? [])].find((className) => className.startsWith('max-w-'))
    const mainWidthClass = [...(mainShell?.classList ?? [])].find((className) => className.startsWith('max-w-'))
    expect(headerWidthClass).toBe(mainWidthClass)
  })

  it('초기 렌더에서는 스크롤 위치를 변경하지 않는다', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    renderTestRoutes()

    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('링크로 다른 화면에 이동하면 맨 위로 스크롤한다', async () => {
    const user = userEvent.setup()
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    renderTestRoutes()

    await user.click(screen.getByRole('link', { name: '개념 보기' }))

    expect(scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('뒤로 가기에서는 스크롤 위치를 변경하지 않는다', async () => {
    const user = userEvent.setup()
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    renderTestRoutes()
    await user.click(screen.getByRole('link', { name: '개념 보기' }))
    const callCountBeforeBack = scrollTo.mock.calls.length

    await user.click(screen.getByRole('button', { name: '뒤로 가기' }))

    expect(scrollTo).toHaveBeenCalledTimes(callCountBeforeBack)
  })

  // ADR-020. 목적지가 앵커를 지정했으면 그 화면이 스크롤 주인이다.
  // 여기서 0으로 되돌리면 착지 직후 개념 위치가 지워진다.
  it('앵커를 지정한 링크로 이동하면 맨 위로 스크롤하지 않는다', async () => {
    const user = userEvent.setup()
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    renderTestRoutes()

    await user.click(screen.getByRole('link', { name: '개념 위치로 보기' }))

    expect(scrollTo).not.toHaveBeenCalled()
  })

  it.each(['/', '/topic/vpc', '/topic/vpc/quiz', '/review'])('%s에서 검색 링크를 렌더링한다', (path) => {
    renderWithSubject(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<p>주제 목록</p>} />
            <Route path="topic/:topicId" element={<p>개념 읽기</p>} />
            <Route path="topic/:topicId/quiz" element={<p>확인 문제</p>} />
            <Route path="review" element={<p>복습 화면</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: '검색' })).toHaveAttribute('href', '/aws/search')
    expect(screen.getByRole('link', { name: '검색' })).toHaveClass('min-h-[44px]')
  })

  // 320px에서 헤더 링크가 세 개가 되면 로고와 부딪힌다(UI_GUIDE "헤더 안의 링크").
  // jsdom에서는 폭을 잴 수 없으므로 링크 개수로 그 제약을 지킨다.
  it.each(['/', '/topic/vpc', '/topic/vpc/quiz', '/review'])('%s에서 내비게이션 링크가 두 개를 넘지 않는다', (path) => {
    renderWithSubject(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<p>주제 목록</p>} />
            <Route path="topic/:topicId" element={<p>개념 읽기</p>} />
            <Route path="topic/:topicId/quiz" element={<p>확인 문제</p>} />
            <Route path="review" element={<p>복습 화면</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const nav = screen.getByRole('navigation', { name: '주요 내비게이션' })

    expect(within(nav).getAllByRole('link').length).toBeLessThanOrEqual(2)
  })

  // 헤더가 과목 안과 밖에서 갈리는 근거는 과목 컨텍스트 하나다. 화면(경로)은 보지 않는다.
  describe('과목 안과 밖', () => {
    it.each([awsSubject, networkSubject])('과목 안에서는 로고가 과목 이름($title)으로 과목 홈을, 검색·복습이 그 과목의 화면을 가리킨다', (subject) => {
      renderInSubject(subject)

      expect(screen.getByRole('link', { name: subject.title })).toHaveAttribute('href', `/${subject.id}`)
      expect(screen.getByRole('link', { name: '검색' })).toHaveAttribute('href', `/${subject.id}/search`)
      expect(screen.getByRole('link', { name: '복습' })).toHaveAttribute('href', `/${subject.id}/review`)
    })

    // 검색·복습은 과목 안의 기능이다. 과목 목록 화면에서 갈 곳이 없다.
    it('과목 밖에서는 Study Quiz 로고만 /를 가리키고 검색·복습 링크가 없다', () => {
      renderInSubject(null)

      const logo = screen.getByRole('link', { name: 'Study Quiz' })
      expect(logo).toHaveAttribute('href', '/')
      expect(logo).toHaveClass('min-h-[44px]')
      expect(screen.queryByRole('navigation', { name: '주요 내비게이션' })).toBeNull()
      expect(screen.queryByRole('link', { name: '검색' })).toBeNull()
      expect(screen.queryByRole('link', { name: '복습' })).toBeNull()
    })
  })

  // ADR-040. 로고를 1.5초 안에 다섯 번 누르면 숨은 키워드 퀴즈로 간다. 키워드 퀴즈가 있는 과목에서만 그렇다.
  describe('로고 연속 탭', () => {
    function setup() {
      // 로고 링크를 누를 때마다 이동이 일어나 Layout이 window.scrollTo를 부른다. jsdom에는 구현이 없다.
      vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-09-27T12:00:00Z'))
      return userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    }

    async function tapLogo(user: ReturnType<typeof userEvent.setup>, name: string, times: number, interval: number) {
      for (let i = 0; i < times; i++) {
        await user.click(screen.getByRole('link', { name }))
        vi.advanceTimersByTime(interval)
      }
    }

    afterEach(() => {
      vi.useRealTimers()
    })

    it('짧은 간격으로 다섯 번 누르면 /aws/keywords에 도착한다', async () => {
      const user = setup()
      renderInSubject(awsSubject)

      await tapLogo(user, 'AWS SAA-C03', 5, 100)

      expect(screen.getByLabelText('현재 경로').textContent).toBe('/aws/keywords')
    })

    it('네 번이면 /aws에 머문다', async () => {
      const user = setup()
      renderInSubject(awsSubject)

      await tapLogo(user, 'AWS SAA-C03', 4, 100)

      expect(screen.getByLabelText('현재 경로').textContent).toBe('/aws')
    })

    it('간격이 1.5초 이상이면 다섯 번을 눌러도 /aws에 머문다', async () => {
      const user = setup()
      renderInSubject(awsSubject)

      await tapLogo(user, 'AWS SAA-C03', 5, 1500)

      expect(screen.getByLabelText('현재 경로').textContent).toBe('/aws')
    })

    it('키워드 퀴즈가 없는 과목에서는 다섯 번을 눌러도 과목 홈에 머문다', async () => {
      const user = setup()
      renderInSubject(networkSubject)

      await tapLogo(user, networkSubject.title, 5, 100)

      expect(screen.getByLabelText('현재 경로').textContent).toBe('/net')
    })

    it('과목 밖에서는 다섯 번을 눌러도 /에 머문다', async () => {
      const user = setup()
      renderInSubject(null)

      await tapLogo(user, 'Study Quiz', 5, 100)

      expect(screen.getByLabelText('현재 경로').textContent).toBe('/')
    })
  })
})
