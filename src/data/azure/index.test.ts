import { describe, expect, it } from 'vitest'
import questionsData from './questions.json'
import topicsData from './topics.json'
import { azureSubject, questions, topics, visualsByTopicId } from './index'

describe('Azure 데이터 로더', () => {
  it('주제와 문항 데이터를 그대로 내보낸다', () => {
    expect(topics).toBe(topicsData)
    expect(questions).toBe(questionsData)
  })

  it('Azure 과목 객체가 이 과목의 id·이름·진행률 키와 이 모듈의 데이터를 담는다', () => {
    expect(azureSubject.id).toBe('azure')
    expect(azureSubject.title).toBe('Azure AZ-900')
    expect(azureSubject.progressKey).toBe('azure-quiz.progress')
    expect(azureSubject.hasKeywordQuiz).toBe(false)
    expect(azureSubject.topics).toBe(topics)
    expect(azureSubject.questions).toBe(questions)
    expect(azureSubject.visualsByTopicId).toBe(visualsByTopicId)
  })
})
