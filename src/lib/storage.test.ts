// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Progress } from '../types/progress'
import { loadProgress, saveProgress } from './storage'

const empty: Progress = { version: 3, read: {}, answers: {}, review: {} }
const key = 'subject.progress'

// 키마다 값을 따로 담는 저장소. 이 환경(node)에는 localStorage가 없다.
function memoryStorage() {
  const items = new Map<string, string>()
  return {
    getItem: (itemKey: string) => items.get(itemKey) ?? null,
    setItem: (itemKey: string, value: string) => { items.set(itemKey, value) },
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('storage', () => {
  it('저장된 진행 상태를 읽는다', () => {
    const stored: Progress = {
      version: 3,
      read: { s3: true },
      answers: { q001: false },
      review: { q001: true },
    }
    const getItem = vi.fn(() => JSON.stringify(stored))
    vi.stubGlobal('localStorage', { getItem })

    expect(loadProgress(key)).toEqual(stored)
    expect(getItem).toHaveBeenCalledWith(key)
  })

  // version 2의 오답노트는 틀리면 저절로 채워졌다. 복습 목록은 이제 사용자가 고르지만,
  // 이미 쌓인 목록은 사용자가 지우지 않고 남겨 둔 것이라 그대로 옮긴다.
  it('version 2 저장분을 옮기면서 오답노트를 복습 목록으로 잇는다', () => {
    const getItem = vi.fn(() => JSON.stringify({
      version: 2,
      read: { s3: true },
      answers: { q001: false, q002: true },
      wrong: { q001: true, q002: true },
    }))
    vi.stubGlobal('localStorage', { getItem })

    expect(loadProgress(key)).toEqual({
      version: 3,
      read: { s3: true },
      answers: { q001: false, q002: true },
      review: { q001: true, q002: true },
    })
  })

  // version 1에는 오답노트가 없었다. 기록이 끊기지 않도록 그때 틀린 문항을 씨앗으로 삼는다.
  it('version 1 저장분을 옮기면서 틀린 문항을 복습 목록에 채운다', () => {
    const getItem = vi.fn(() => JSON.stringify({
      version: 1,
      read: { s3: true },
      answers: { q001: false, q002: true, q003: false },
    }))
    vi.stubGlobal('localStorage', { getItem })

    expect(loadProgress(key)).toEqual({
      version: 3,
      read: { s3: true },
      answers: { q001: false, q002: true, q003: false },
      review: { q001: true, q003: true },
    })
  })

  it.each([
    ['저장소 접근 예외', () => { throw new Error('blocked') }],
    ['깨진 JSON', () => '{broken'],
    ['모르는 version', () => JSON.stringify({ version: 4, read: {}, answers: {}, review: {} })],
  ])('%s에서는 빈 상태를 반환한다', (_label, getItem) => {
    vi.stubGlobal('localStorage', { getItem })

    expect(loadProgress(key)).toEqual(empty)
  })

  it('localStorage 전역 접근 자체가 실패해도 빈 상태를 반환한다', () => {
    vi.stubGlobal('localStorage', undefined)

    expect(loadProgress(key)).toEqual(empty)
  })

  it('진행 상태를 지정된 키에 저장한다', () => {
    const setItem = vi.fn()
    vi.stubGlobal('localStorage', { setItem })

    saveProgress(key, empty)

    expect(setItem).toHaveBeenCalledWith(key, JSON.stringify(empty))
  })

  // 과목마다 키가 다르다. 한 과목의 기록이 다른 과목에 닿으면 안 된다.
  it('한 키에 저장한 것을 다른 키에서는 읽지 않는다', () => {
    vi.stubGlobal('localStorage', memoryStorage())
    const progressA: Progress = { version: 3, read: { s3: true }, answers: { q001: true }, review: { q001: true } }

    saveProgress('a.progress', progressA)

    expect(loadProgress('b.progress')).toEqual(empty)
  })

  it('다른 키에 저장해도 앞 키의 값은 그대로다', () => {
    vi.stubGlobal('localStorage', memoryStorage())
    const progressA: Progress = { version: 3, read: { s3: true }, answers: { q001: true }, review: { q001: true } }
    const progressB: Progress = { version: 3, read: { ec2: true }, answers: { q001: false }, review: {} }

    saveProgress('a.progress', progressA)
    saveProgress('b.progress', progressB)

    expect(loadProgress('a.progress')).toEqual(progressA)
    expect(loadProgress('b.progress')).toEqual(progressB)
  })

  it('쓰기 실패를 밖으로 던지지 않는다', () => {
    vi.stubGlobal('localStorage', {
      setItem: () => { throw new Error('blocked') },
    })

    expect(() => saveProgress(key, empty)).not.toThrow()
  })
})
