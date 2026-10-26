import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppRoutes } from './App'
import { questions } from './data/aws'

function CurrentPath() {
  return <output aria-label="현재 경로">{useLocation().pathname}</output>
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
      <CurrentPath />
    </MemoryRouter>,
  )
}

describe('App routes', () => {
  it('/에서 주제 목록 화면과 내비게이션 링크를 렌더링한다', () => {
    renderAt('/')

    expect(screen.getByRole('heading', { name: '주제 목록' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '복습' })).toHaveAttribute('href', '/review')
  })

  it('/review에서 복습 화면을 렌더링한다', () => {
    renderAt('/review')

    expect(screen.getByRole('heading', { name: '복습' })).toBeInTheDocument()
  })

  it('/review/quiz에서 복습 문제 풀기 화면을 렌더링한다', () => {
    renderAt('/review/quiz')

    expect(screen.getByRole('heading', { name: '복습 문제 풀기' })).toBeInTheDocument()
  })

  it('/search에서 검색 화면을 렌더링한다', () => {
    renderAt('/search')

    expect(screen.getByRole('heading', { name: '검색' })).toBeInTheDocument()
  })

  it('/random에서 랜덤 문제 시작 화면을 렌더링한다', () => {
    renderAt('/random')

    expect(screen.getByRole('heading', { name: '랜덤 문제' })).toBeInTheDocument()
  })

  it('/random/20에서 랜덤 문제 화면을 렌더링한다', () => {
    renderAt('/random/20')

    expect(screen.getByRole('heading', { name: '랜덤 문제' })).toBeInTheDocument()
    expect(screen.getByText('1 / 20')).toBeInTheDocument()
  })

  it('/random/all에서 문제 은행 전체를 낸다', () => {
    renderAt('/random/all')

    expect(screen.getByRole('heading', { name: '랜덤 문제' })).toBeInTheDocument()
    // 문항 수를 숫자로 박아 두면 문제 은행이 커질 때마다 이 단정이 깨진다.
    expect(screen.getByText(`1 / ${questions.length}`)).toBeInTheDocument()
  })

  it('알 수 없는 경로를 /로 리다이렉트한다', () => {
    renderAt('/unknown')

    expect(screen.getByRole('heading', { name: '주제 목록' })).toBeInTheDocument()
    expect(screen.getByLabelText('현재 경로')).toHaveTextContent('/')
  })

  // ADR-040. 숨은 화면이라 헤더에서 이 화면으로 가는 링크를 두지 않는다.
  it('/keywords에서 암호 입력 화면을 렌더링하고 헤더에는 그 링크가 없다', () => {
    renderAt('/keywords')

    expect(screen.getByRole('heading', { name: '키워드 퀴즈' })).toBeInTheDocument()
    expect(screen.getByLabelText('암호')).toHaveAttribute('type', 'text')
    for (const link of within(screen.getByRole('banner')).getAllByRole('link')) {
      expect(link).not.toHaveAttribute('href', '/keywords')
    }
    for (const link of within(screen.getByRole('navigation', { name: '주요 내비게이션' })).getAllByRole('link')) {
      expect(link).not.toHaveAttribute('href', '/keywords')
    }
  })
})

