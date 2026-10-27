import { describe, expect, it } from 'vitest'
import questionsData from './questions.json'
import topicsData from './topics.json'
import { networkSubject, questions, topics, visualsByTopicId } from './index'

describe('네트워크 데이터 로더', () => {
  it('주제와 문항 데이터를 그대로 내보낸다', () => {
    expect(topics).toBe(topicsData)
    expect(questions).toBe(questionsData)
  })

  it('네트워크 과목 객체가 이 과목의 id·이름·진행률 키와 이 모듈의 데이터를 담는다', () => {
    expect(networkSubject.id).toBe('network')
    expect(networkSubject.title).toBe('네트워크')
    expect(networkSubject.progressKey).toBe('network-quiz.progress')
    expect(networkSubject.hasKeywordQuiz).toBe(false)
    expect(networkSubject.topics).toBe(topics)
    expect(networkSubject.questions).toBe(questions)
    expect(networkSubject.visualsByTopicId).toBe(visualsByTopicId)
  })
})
