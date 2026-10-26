import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { awsSubject } from '../data/aws'
import { SubjectContext, useOptionalSubject, useSubject } from './useSubject'

function withSubject({ children }: { children: ReactNode }) {
  return <SubjectContext.Provider value={awsSubject}>{children}</SubjectContext.Provider>
}

describe('useSubject', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('Provider가 준 과목을 돌려준다', () => {
    const { result } = renderHook(() => useSubject(), { wrapper: withSubject })

    expect(result.current).toBe(awsSubject)
  })

  // 과목 안의 화면이 과목 없이 렌더링되면 라우트 배선 실수다. AWS로 조용히 넘어가면 그 실수를 테스트가 못 잡는다.
  it('Provider 밖에서 부르면 오류를 던진다', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => renderHook(() => useSubject())).toThrow()
  })
})

describe('useOptionalSubject', () => {
  it('Provider 안에서는 과목을 돌려준다', () => {
    const { result } = renderHook(() => useOptionalSubject(), { wrapper: withSubject })

    expect(result.current).toBe(awsSubject)
  })

  it('Provider 밖(과목 목록 화면)에서는 null이다', () => {
    const { result } = renderHook(() => useOptionalSubject())

    expect(result.current).toBeNull()
  })
})
