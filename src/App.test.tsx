import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from './App'
import { awsSubject, questions } from './data/aws'
import { saveProgress } from './lib/storage'
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
    expect(screen.getByRole('link', { name: '복습' })).toHaveAttribute('href', '/aws/review')
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

  // 네트워크 과목은 주제를 채우기 전에 먼저 등록된다(phase 69). 빈 과목에서도 과목 안 화면이 죽지 않아야 한다.
  it('주제가 없는 과목의 화면이 열린다', () => {
    for (const path of ['/network', '/network/random', '/network/review', '/network/search']) {
      const { unmount } = renderAt(path)

      expect(within(screen.getByRole('banner')).getByRole('link', { name: '네트워크' }), path).toHaveAttribute('href', '/network')
      expect(currentPath(), path).toBe(path)
      unmount()
    }
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

  // 과목이 섞이지 않는 것이 과목을 나눈 이유다. 두 과목의 주제 제목에 같은 낱말을 넣어 검색이 경계를 넘는지 본다.
  describe('과목 경계', () => {
    function makeSubject(id: string, questionCount: number): Subject {
      const topicId = `${id}-topic`
      const conceptId = `${topicId}.concept`
      return {
        id,
        title: `과목 ${id}`,
        progressKey: `${id}.progress`,
        topics: [{
          id: topicId,
          title: `${id} 공통낱말 주제`,
          importance: 2,
          sourcePages: [1, 1],
          concepts: [{ id: conceptId, name: `${id} 개념`, summary: `${id} 요약`, paragraphs: [`${id} 본문`] }],
        }],
        questions: Array.from({ length: questionCount }, (_, index) => ({
          id: `${id}-q${index + 1}`,
          topicId,
          conceptId,
          prompt: `${id} 질문 ${index + 1}`,
          choices: ['정답', '오답 1', '오답 2', '오답 3'],
          answerIndex: 0,
          explanation: '해설',
        })),
        visualsByTopicId: {},
        hasKeywordQuiz: false,
      }
    }

    const subjectA = makeSubject('a', 3)
    const subjectB = makeSubject('b', 2)
    const bothSubjects = [subjectA, subjectB]

    afterEach(() => {
      localStorage.clear()
    })

    it('검색은 그 과목의 주제만 찾고 과목 안의 주소로 링크한다', () => {
      renderAt('/a/search?q=공통낱말', bothSubjects)

      const results = within(screen.getByRole('main')).getAllByRole('link')
      expect(results).toHaveLength(1)
      expect(results[0]).toHaveTextContent('a 공통낱말 주제')
      expect(results[0]).toHaveAttribute('href', '/a/topic/a-topic')
    })

    it('랜덤 전체 세트는 그 과목의 문항만 낸다', () => {
      renderAt('/b/random/all', bothSubjects)

      expect(screen.getByText('1 / 2')).toBeInTheDocument()
      // 세트는 섞이므로 첫 문항이 어느 것인지는 정하지 않는다.
      expect(screen.getByText(/^b 질문 [12]$/)).toBeInTheDocument()
    })

    it('복습 목록은 그 과목의 진행률 키에서만 읽는다', () => {
      saveProgress(subjectA.progressKey, { version: 3, read: {}, answers: {}, review: { 'a-q1': true } })

      const { unmount } = renderAt('/b/review', bothSubjects)
      expect(screen.getByText('문제를 푼 뒤 복습에 넣은 문항이 여기에 모입니다.')).toBeInTheDocument()
      expect(screen.queryByText('a 질문 1')).not.toBeInTheDocument()
      unmount()

      renderAt('/a/review', bothSubjects)
      expect(screen.getByText('a 질문 1')).toBeInTheDocument()
    })

    it('주제 목록은 그 과목의 주제만 보이고 과목 안의 주소로 링크한다', () => {
      renderAt('/a', bothSubjects)

      const main = within(screen.getByRole('main'))
      expect(main.getByRole('link', { name: /a 공통낱말 주제/ })).toHaveAttribute('href', '/a/topic/a-topic')
      expect(main.queryByText('b 공통낱말 주제')).not.toBeInTheDocument()
      expect(main.getByRole('link', { name: /랜덤 문제/ })).toHaveAttribute('href', '/a/random')
    })

    // 과목의 문항(Question[])이 실제 섞기를 거쳐 문항 화면까지 끊기지 않고 이어지는지 본다.
    it('예/아니요 문항만 있는 과목의 확인 문제는 예·아니요 버튼으로 푼다', async () => {
      const user = userEvent.setup()
      const yesNoSubject: Subject = {
        ...makeSubject('yn', 0),
        questions: [true, false, true].map((answer, index) => ({
          id: `yn-q${index + 1}`,
          format: 'yes-no' as const,
          topicId: 'yn-topic',
          conceptId: 'yn-topic.concept',
          prompt: `yn 질문 ${index + 1}`,
          answer,
          explanation: `yn 해설 ${index + 1}`,
        })),
      }
      renderAt('/yn/topic/yn-topic/quiz', [yesNoSubject])

      const main = within(screen.getByRole('main'))
      expect(main.getByText('1 / 3')).toBeInTheDocument()
      const choices = main.getAllByRole('button').filter((button) => button.textContent !== '개념 보기')
      expect(choices.map((button) => button.textContent)).toEqual(['예', '아니요'])

      await user.click(main.getByRole('button', { name: '예' }))

      expect(main.getByText(/^yn 해설 [123]$/)).toBeInTheDocument()
    })
  })
})
