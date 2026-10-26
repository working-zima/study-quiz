import { describe, expect, it } from 'vitest'
import questionsData from './questions.json'
import topicsData from './topics.json'
import { questions, topics, visualsByTopicId } from './index'

describe('정적 데이터 로더', () => {
  it('기존 주제와 문항 데이터를 그대로 내보낸다', () => {
    expect(topics).toBe(topicsData)
    expect(questions).toBe(questionsData)
  })

  it('VPC 시각 요소를 주제 id로 조회할 수 있다', () => {
    expect(visualsByTopicId['vpc-networking']).toEqual({
      diagrams: expect.any(Object),
      tables: expect.any(Object),
      glossary: expect.any(Array),
    })
  })
})
