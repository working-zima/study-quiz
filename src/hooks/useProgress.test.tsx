import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { emptyProgress } from '../lib/progress'
import { loadProgress, saveProgress } from '../lib/storage'
import type { Subject } from '../types/subject'
import { useProgress } from './useProgress'
import { SubjectContext } from './useSubject'

vi.mock('../lib/storage', () => ({
  loadProgress: vi.fn(),
  saveProgress: vi.fn(),
}))

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

const subjectA = fakeSubject('a')
const subjectB = fakeSubject('b')

function renderProgress(subject = subjectA) {
  return renderHook(() => useProgress(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <SubjectContext.Provider value={subject}>{children}</SubjectContext.Provider>
    ),
  })
}

describe('useProgress', () => {
  beforeEach(() => {
    vi.mocked(loadProgress).mockReset()
    vi.mocked(loadProgress).mockReturnValue(emptyProgress())
    vi.mocked(saveProgress).mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('과목의 진행률 키로 저장된 진행 상태를 읽어 초기화한다', () => {
    vi.mocked(loadProgress).mockReturnValue({
      version: 3,
      read: { ec2: true },
      answers: {},
      review: {},
    })

    const { result } = renderProgress()

    expect(loadProgress).toHaveBeenCalledWith('a.progress')
    expect(result.current.progress.read.ec2).toBe(true)
  })

  it('읽기와 답변 상태를 갱신하고 과목의 키로 저장한다', () => {
    const { result } = renderProgress()

    act(() => result.current.markRead('ec2'))
    expect(result.current.progress.read.ec2).toBe(true)
    expect(saveProgress).toHaveBeenLastCalledWith('a.progress', result.current.progress)

    act(() => result.current.answer('q001', false))
    expect(result.current.progress.answers.q001).toBe(false)
    expect(saveProgress).toHaveBeenLastCalledWith('a.progress', result.current.progress)
  })

  it('답을 틀려도 복습 목록에 넣지 않는다', () => {
    const { result } = renderProgress()

    act(() => result.current.answer('q001', false))

    expect(result.current.progress.review).toEqual({})
  })

  it('복습 목록에 문항을 넣고 빼면서 과목의 키로 저장한다', () => {
    const { result } = renderProgress()

    act(() => result.current.setInReview('q001', true))
    expect(result.current.progress.review).toEqual({ q001: true })
    expect(saveProgress).toHaveBeenLastCalledWith('a.progress', result.current.progress)

    act(() => result.current.setInReview('q001', false))
    expect(result.current.progress.review).toEqual({})
    expect(saveProgress).toHaveBeenLastCalledWith('a.progress', result.current.progress)
  })

  // 과목마다 진행률 키가 다르다. 같은 문항 id라도 한 과목의 답이 다른 과목의 저장에 섞이면 안 된다.
  it('키가 다른 두 과목에서 같은 문항에 답해도 서로의 저장에 섞이지 않는다', () => {
    const inA = renderProgress(subjectA)
    const inB = renderProgress(subjectB)

    act(() => inA.result.current.answer('q001', true))
    act(() => inB.result.current.answer('q001', false))

    expect(vi.mocked(loadProgress).mock.calls).toEqual([['a.progress'], ['b.progress']])
    expect(vi.mocked(saveProgress).mock.calls).toEqual([
      ['a.progress', { ...emptyProgress(), answers: { q001: true } }],
      ['b.progress', { ...emptyProgress(), answers: { q001: false } }],
    ])
  })

  // 과목 없이 렌더링된 것은 배선 실수다. AWS 키로 물러서면 다른 과목의 화면이 AWS 기록을 덮어쓴다.
  it('과목 밖에서 부르면 오류를 던진다', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => renderHook(() => useProgress())).toThrow()
  })
})
