// @vitest-environment node

import { describe, expect, it, vi } from 'vitest'
import type { ChoiceQuestion, Question, YesNoQuestion } from '../types/content'
import { shuffle, shuffleChoices, shuffleQuestions } from './shuffle'

function seq(...values: number[]) {
  let index = 0
  return () => values[index++]
}

const firstQuestion: ChoiceQuestion = {
  id: 'q001',
  topicId: 'topic-a',
  conceptId: 'topic-a.concept-a',
  prompt: '첫 번째 질문',
  choices: ['A', 'B', 'C', 'D'],
  answerIndex: 0,
  explanation: '첫 번째 해설',
}

const lastQuestion: ChoiceQuestion = {
  id: 'q002',
  topicId: 'topic-a',
  conceptId: 'topic-a.concept-b',
  prompt: '두 번째 질문',
  choices: ['E', 'F', 'G', 'H'],
  answerIndex: 3,
  explanation: '두 번째 해설',
}

const yesNoQuestion: YesNoQuestion = {
  id: 'q004',
  topicId: 'topic-a',
  conceptId: 'topic-a.concept-c',
  prompt: '네 번째 주장',
  format: 'yes-no',
  answer: false,
  explanation: '네 번째 해설',
}

function findChoiceQuestion(questions: Question[], id: string): ChoiceQuestion {
  const question = questions.find((item) => item.id === id)
  if (!question || question.format === 'yes-no') {
    throw new Error(`${id}는 4지선다 문항이어야 한다`)
  }
  return question
}

describe('shuffle', () => {
  it('주어진 난수열로 내림차순 Fisher-Yates 순열을 만든다', () => {
    expect(shuffle(['a', 'b', 'c', 'd'], seq(0, 0, 0))).toEqual([
      'b',
      'c',
      'd',
      'a',
    ])
  })

  it('원본 배열을 바꾸지 않고 모든 원소를 보존한다', () => {
    const original = ['a', 'b', 'c', 'd']
    const result = shuffle(original, seq(0.75, 0.25, 0.5))

    expect(original).toEqual(['a', 'b', 'c', 'd'])
    expect(result).toHaveLength(original.length)
    expect([...result].sort()).toEqual([...original].sort())
  })

  it('빈 배열과 원소 하나인 배열에서는 난수를 사용하지 않는다', () => {
    const rng = vi.fn(() => 0)

    expect(shuffle([], rng)).toEqual([])
    expect(shuffle(['a'], rng)).toEqual(['a'])
    expect(rng).toHaveBeenCalledTimes(0)
  })
})

describe('shuffleChoices', () => {
  it.each([
    [firstQuestion, [0, 0, 0]],
    [firstQuestion, [0.75, 0.25, 0.5]],
    [lastQuestion, [0, 0.5, 0]],
    [lastQuestion, [0.5, 0.25, 0.75]],
  ] as const)('정답 보기가 옮겨 간 위치를 정답 인덱스로 삼는다', (question, values) => {
    const result = shuffleChoices(question, seq(...values))

    expect(result.choices[result.answerIndex]).toBe(
      question.choices[question.answerIndex],
    )
  })

  it('보기 집합과 문항 메타데이터를 보존한다', () => {
    const result = shuffleChoices(firstQuestion, seq(0, 0, 0))

    expect([...result.choices].sort()).toEqual([...firstQuestion.choices].sort())
    expect(result.id).toBe(firstQuestion.id)
    expect(result.prompt).toBe(firstQuestion.prompt)
    expect(result.explanation).toBe(firstQuestion.explanation)
  })

  it('원본 문항의 보기와 정답 인덱스를 바꾸지 않는다', () => {
    const originalChoices = [...firstQuestion.choices]
    const originalAnswerIndex = firstQuestion.answerIndex

    shuffleChoices(firstQuestion, seq(0, 0, 0))

    expect(firstQuestion.choices).toEqual(originalChoices)
    expect(firstQuestion.answerIndex).toBe(originalAnswerIndex)
  })

  it('예/아니요 문항은 섞지 않고 난수도 쓰지 않는다', () => {
    const original = structuredClone(yesNoQuestion)
    const rng = vi.fn(() => 0)

    expect(shuffleChoices(yesNoQuestion, rng)).toEqual(original)
    expect(rng).not.toHaveBeenCalled()
  })
})

describe('shuffleQuestions', () => {
  it('문항을 먼저 섞고 이어서 각 문항의 보기를 섞는다', () => {
    const thirdQuestion: ChoiceQuestion = {
      ...firstQuestion,
      id: 'q003',
      choices: ['I', 'J', 'K', 'L'],
      answerIndex: 2,
    }
    const questions = [firstQuestion, lastQuestion, thirdQuestion]
    const originalReferences = [...questions]
    const originals = structuredClone(questions)

    const result = shuffleQuestions(
      questions,
      seq(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
    )

    expect(result.map((question) => question.id)).toEqual(['q002', 'q003', 'q001'])
    result.forEach((question) => {
      const original = questions.find((item) => item.id === question.id)
      expect(original).toBeDefined()
      expect(question.choices[question.answerIndex]).toBe(
        original!.choices[original!.answerIndex],
      )
    })
    expect(questions).toEqual(originals)
    questions.forEach((question, index) => {
      expect(question).toBe(originalReferences[index])
    })
    result.forEach((question) => {
      expect(originalReferences).not.toContain(question)
    })
  })

  it('예/아니요 문항이 섞여 있어도 문항 순서만 섞고 4지선다의 보기만 섞는다', () => {
    const questions: Question[] = [firstQuestion, yesNoQuestion, lastQuestion]
    const originals = structuredClone(questions)

    const result = shuffleQuestions(questions, () => 0)

    expect(result.map((question) => question.id).sort()).toEqual(['q001', 'q002', 'q004'])
    expect(result.find((question) => question.id === 'q004')).toEqual(yesNoQuestion)
    ;[firstQuestion, lastQuestion].forEach((original) => {
      const shuffled = findChoiceQuestion(result, original.id)
      expect(shuffled.answerIndex).not.toBe(original.answerIndex)
      expect(shuffled.choices[shuffled.answerIndex]).toBe(
        original.choices[original.answerIndex],
      )
    })
    expect(questions).toEqual(originals)
  })
})
