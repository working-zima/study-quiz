import { useCallback, useState } from 'react'
import { markForReview, markTopicRead, recordAnswer } from '../lib/progress'
import { loadProgress, saveProgress } from '../lib/storage'
import type { Progress } from '../types/progress'
import { useSubject } from './useSubject'

export function useProgress(): { progress: Progress; markRead: (topicId: string) => void; answer: (questionId: string, correct: boolean) => void; setInReview: (questionId: string, marked: boolean) => void } {
  // 과목이 바뀌면 SubjectScope가 이 화면을 다시 마운트하므로, 키는 첫 렌더의 것 하나로 충분하다.
  const { progressKey } = useSubject()
  const [progress, setProgress] = useState<Progress>(() => loadProgress(progressKey))
  const updateProgress = useCallback((update: (current: Progress) => Progress) => {
    setProgress((current) => {
      const next = update(current)
      saveProgress(progressKey, next)
      return next
    })
  }, [progressKey])
  const markRead = useCallback((topicId: string) => updateProgress((current) => markTopicRead(current, topicId)), [updateProgress])
  const answer = useCallback((questionId: string, correct: boolean) => updateProgress((current) => recordAnswer(current, questionId, correct)), [updateProgress])
  const setInReview = useCallback((questionId: string, marked: boolean) => updateProgress((current) => markForReview(current, questionId, marked)), [updateProgress])
  return { progress, markRead, answer, setInReview }
}
