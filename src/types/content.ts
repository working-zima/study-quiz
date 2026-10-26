export type Importance = 3 | 2 | 0 // ★★★ = 3, ★★☆ = 2, 별점 없음(기초) = 0

export interface Topic {
  id: string
  title: string
  importance: Importance
  sourcePages: [number, number]
  concepts: Concept[]
}

export interface Concept {
  id: string
  parentId?: string // 딸린 개념만. 같은 주제 안 머리 개념의 id (ADR-041)
  name: string
  summary: string
  paragraphs: string[]
}

// 머리 개념 하나와 그 바로 뒤에 이어지는 딸린 개념들. 딸린 개념이 없으면 children은 빈 배열이다.
export interface ConceptGroup {
  concept: Concept
  children: Concept[]
}

interface QuestionBase {
  id: string
  topicId: string
  conceptId: string
  prompt: string
  explanation: string
}

export interface ChoiceQuestion extends QuestionBase {
  format?: 'choice' // 없으면 4지선다다. AWS 문항 JSON에는 이 필드가 없다
  choices: [string, string, string, string]
  answerIndex: 0 | 1 | 2 | 3
}

export interface YesNoQuestion extends QuestionBase {
  format: 'yes-no'
  answer: boolean // 예가 정답이면 true
}

export type Question = ChoiceQuestion | YesNoQuestion
