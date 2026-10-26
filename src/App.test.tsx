import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from './App'
import { awsSubject, questions } from './data/aws'
import type { Subject } from './types/subject'

function CurrentPath() {
  const { pathname, search, hash } = useLocation()
  return <output aria-label="현재 경로">{`${pathname}${search}${hash}`}</output>
}

function renderAt(path: string, subjects?: Subject[]) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes subjects={subjects} />
      <CurrentPath />
    </MemoryRouter>,
  )
}

function currentPath() {
  return screen.getByLabelText('현재 경로').textContent
}

describe('App routes', () => {
  // 리다이렉트는 REPLACE 이동이라 Layout이 window.scrollTo를 부른다. jsdom에는 구현이 없다.
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('/에서 과목 목록 화면을 렌더링한다', () => {
    renderAt('/')

    expect(screen.getByRole('heading', { name: '과목' })).toBeInTheDocument()
    expect(within(screen.getByRole('main')).getByRole('link', { name: /AWS SAA-C03/ })).toHaveAttribute('href', '/aws')
  })

  it('/aws에서 주제 목록 화면과 내비게이션 링크를 렌더링한다', () => {
    renderAt('/aws')

    expect(screen.getByRole('heading', { name: '주제 목록' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '복습' })).toHaveAttribute('href', '/review')
  })

  it('/aws/review에서 복습 화면을 렌더링한다', () => {
    renderAt('/aws/review')

    expect(screen.getByRole('heading', { name: '복습' })).toBeInTheDocument()
  })

  it('/aws/review/quiz에서 복습 문제 풀기 화면을 렌더링한다', () => {
    renderAt('/aws/review/quiz')

    expect(screen.getByRole('heading', { name: '복습 문제 풀기' })).toBeInTheDocument()
  })

  it('/aws/search에서 검색 화면을 렌더링한다', () => {
    renderAt('/aws/search')

    expect(screen.getByRole('heading', { name: '검색' })).toBeInTheDocument()
  })

  it('/aws/random에서 랜덤 문제 시작 화면을 렌더링한다', () => {
    renderAt('/aws/random')

    expect(screen.getByRole('heading', { name: '랜덤 문제' })).toBeInTheDocument()
  })

  it('/aws/random/20에서 랜덤 문제 화면을 렌더링한다', () => {
    renderAt('/aws/random/20')

    expect(screen.getByRole('heading', { name: '랜덤 문제' })).toBeInTheDocument()
    expect(screen.getByText('1 / 20')).toBeInTheDocument()
  })

  it('/aws/random/all에서 문제 은행 전체를 낸다', () => {
    renderAt('/aws/random/all')

    expect(screen.getByRole('heading', { name: '랜덤 문제' })).toBeInTheDocument()
    // 문항 수를 숫자로 박아 두면 문제 은행이 커질 때마다 이 단정이 깨진다.
    expect(screen.getByText(`1 / ${questions.length}`)).toBeInTheDocument()
  })

  it('과목 밖의 알 수 없는 경로를 /로 리다이렉트한다', () => {
    renderAt('/unknown/a/b')

    expect(screen.getByRole('heading', { name: '과목' })).toBeInTheDocument()
    expect(currentPath()).toBe('/')
  })

  it.each(['/nope', '/nope/topic/x'])('없는 과목(%s)은 /로 보낸다', (path) => {
    renderAt(path)

    expect(screen.getByRole('heading', { name: '과목' })).toBeInTheDocument()
    expect(currentPath()).toBe('/')
  })

  it('과목 안의 알 수 없는 경로는 그 과목 홈으로 보낸다', () => {
    renderAt('/aws/nope')

    expect(screen.getByRole('heading', { name: '주제 목록' })).toBeInTheDocument()
    expect(currentPath()).toBe('/aws')
  })

  // 과목이 AWS 하나였던 시절의 주소다. 북마크·공유한 주소와 아직 화면에 남은 예전 링크가 이 길로 들어온다.
  describe('예전 주소', () => {
    const topicId = awsSubject.topics[0].id

    it.each([
      [`/topic/${topicId}`, `/aws/topic/${topicId}`],
      [`/topic/${topicId}/quiz`, `/aws/topic/${topicId}/quiz`],
      ['/review', '/aws/review'],
      ['/review/quiz', '/aws/review/quiz'],
      [`/review/quiz/${topicId}`, `/aws/review/quiz/${topicId}`],
      ['/search', '/aws/search'],
      ['/random', '/aws/random'],
      ['/random/20', '/aws/random/20'],
      ['/keywords', '/aws/keywords'],
    ])('%s는 %s로 간다', (from, to) => {
      renderAt(from)

      expect(currentPath()).toBe(to)
    })

    it('검색어(?q=)를 잃지 않는다', () => {
      renderAt('/search?q=s3')

      expect(currentPath()).toBe('/aws/search?q=s3')
      expect(screen.getByLabelText('개념·주제 검색')).toHaveValue('s3')
    })

    // 검색 결과가 개념 위치로 보내는 앵커다(ADR-020).
    it('개념 앵커(#개념id)를 잃지 않는다', () => {
      const concept = awsSubject.topics[0].concepts[0]
      renderAt(`/topic/${topicId}#${concept.id}`)

      expect(currentPath()).toBe(`/aws/topic/${topicId}#${concept.id}`)
    })
  })

  // ADR-040. 숨은 화면이라 헤더에서 이 화면으로 가는 링크를 두지 않는다.
  it('/aws/keywords에서 암호 입력 화면을 렌더링하고 헤더에는 그 링크가 없다', () => {
    renderAt('/aws/keywords')

    expect(screen.getByRole('heading', { name: '키워드 퀴즈' })).toBeInTheDocument()
    expect(screen.getByLabelText('암호')).toHaveAttribute('type', 'text')
    for (const link of within(screen.getByRole('banner')).getAllByRole('link')) {
      expect(link).not.toHaveAttribute('href', '/keywords')
      expect(link).not.toHaveAttribute('href', '/aws/keywords')
    }
    for (const link of within(screen.getByRole('navigation', { name: '주요 내비게이션' })).getAllByRole('link')) {
      expect(link).not.toHaveAttribute('href', '/keywords')
      expect(link).not.toHaveAttribute('href', '/aws/keywords')
    }
  })

  it('키워드 퀴즈가 없는 과목의 /keywords는 그 과목 홈으로 보낸다', () => {
    const noKeywords: Subject = { ...awsSubject, id: 'plain', progressKey: 'plain.progress', hasKeywordQuiz: false }
    renderAt('/plain/keywords', [noKeywords])

    expect(screen.queryByRole('heading', { name: '키워드 퀴즈' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '주제 목록' })).toBeInTheDocument()
    expect(currentPath()).toBe('/plain')
  })
})
