// @vitest-environment node

import { describe, expect, it } from 'vitest'
import type { ChoiceQuestion, YesNoQuestion } from '../types/content'
import { choiceLabels, isCorrect } from './grading'

const question: ChoiceQuestion = {
  id: 'q001',
  topicId: 'topic-a',
  conceptId: 'topic-a.concept-a',
  prompt: '질문',
  choices: ['A', 'B', 'C', 'D'],
  answerIndex: 2,
  explanation: '해설',
}

const yesQuestion: YesNoQuestion = {
  id: 'q002',
  topicId: 'topic-a',
  conceptId: 'topic-a.concept-a',
  prompt: '주장',
  format: 'yes-no',
  answer: true,
  explanation: '해설',
}

const noQuestion: YesNoQuestion = { ...yesQuestion, id: 'q003', answer: false }

describe('isCorrect', () => {
  it('선택한 보기와 정답 인덱스를 비교한다', () => {
    expect(isCorrect(question, 2)).toBe(true)
    expect(isCorrect(question, 1)).toBe(false)
  })

  it('예/아니요 문항은 0을 예, 1을 아니요로 채점한다', () => {
    expect(isCorrect(yesQuestion, 0)).toBe(true)
    expect(isCorrect(yesQuestion, 1)).toBe(false)
    expect(isCorrect(noQuestion, 0)).toBe(false)
    expect(isCorrect(noQuestion, 1)).toBe(true)
  })
})

describe('choiceLabels', () => {
  it('4지선다는 보기 문구를 그대로 돌려준다', () => {
    expect(choiceLabels(question)).toEqual(['A', 'B', 'C', 'D'])
  })

  it('예/아니요 문항은 예, 아니요 순서로 돌려준다', () => {
    expect(choiceLabels(yesQuestion)).toEqual(['예', '아니요'])
    expect(choiceLabels(noQuestion)).toEqual(['예', '아니요'])
  })
})
