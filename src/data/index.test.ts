import { describe, expect, it } from 'vitest'
import { awsSubject, questions, topics, visualsByTopicId } from './aws/index'
import { subjects } from './index'

// 과목 접두사 없는 예전 주소의 첫 세그먼트. 출처는 src/App.tsx의 예전 경로다.
// 이 이름을 과목 id로 쓰면 예전 주소를 넘기는 리다이렉트 라우트가 순위에서 이겨 그 과목에 들어갈 수 없다.
const legacyRouteSegments = ['topic', 'review', 'search', 'random', 'keywords']

function duplicates(values: string[]): string[] {
  const seen = new Set<string>()
  const repeated = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) repeated.add(value)
    seen.add(value)
  }
  return [...repeated]
}

describe('과목 목록', () => {
  it('과목 id가 서로 겹치지 않는다', () => {
    expect(duplicates(subjects.map((subject) => subject.id))).toEqual([])
  })

  it('과목 id가 예전 경로의 첫 세그먼트와 겹치지 않는다', () => {
    const clashes = subjects.map((subject) => subject.id).filter((id) => legacyRouteSegments.includes(id))
    expect(clashes).toEqual([])
  })

  // 도식 registry와 검색 결과의 앵커(#개념id)가 개념 id 하나로 찾으므로 과목을 넘어서도 유일해야 한다.
  it('주제 id와 개념 id가 과목을 넘어서도 겹치지 않는다', () => {
    const allTopics = subjects.flatMap((subject) => subject.topics)
    expect(duplicates(allTopics.map((topic) => topic.id))).toEqual([])
    expect(duplicates(allTopics.flatMap((topic) => topic.concepts.map((concept) => concept.id)))).toEqual([])
  })

  it('진행률 키가 서로 겹치지 않는다', () => {
    expect(duplicates(subjects.map((subject) => subject.progressKey))).toEqual([])
  })

  it('AWS 과목은 지금의 진행률 키와 AWS 데이터를 그대로 담는다', () => {
    expect(subjects).toContain(awsSubject)
    expect(awsSubject.id).toBe('aws')
    expect(awsSubject.title).toBe('AWS SAA-C03')
    expect(awsSubject.progressKey).toBe('aws-quiz.progress')
    expect(awsSubject.hasKeywordQuiz).toBe(true)
    expect(awsSubject.topics).toBe(topics)
    expect(awsSubject.questions).toBe(questions)
    expect(awsSubject.visualsByTopicId).toBe(visualsByTopicId)
  })
})
