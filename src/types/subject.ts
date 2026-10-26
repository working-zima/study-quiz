import type { Question, Topic } from './content'
import type { TopicVisuals } from './visuals'

export interface Subject {
  id: string // URL 첫 세그먼트. '#/aws/topic/…'의 'aws'
  title: string // 헤더와 과목 목록에 쓰는 이름
  progressKey: string // 이 과목의 진행률을 담는 localStorage 키
  topics: Topic[]
  questions: Question[]
  visualsByTopicId: Record<string, TopicVisuals>
  hasKeywordQuiz: boolean // 숨은 키워드 퀴즈(ADR-040)가 있는 과목인가
}
