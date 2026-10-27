import { describe, expect, it } from 'vitest'
import type { ChoiceQuestion, Question, YesNoQuestion } from '../types/content'
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

// 예/아니요 문항의 답이 내용과 무관하게 새는 길을 막는다. 4지선다에는 걸지 않는다 —
// 4지선다에서는 「절대」가 답을 흘리지 않고 문제의 내용일 수 있다(AWS q242).
const answerLeakingWords = ['항상', '절대']

function yesNoProblems(questions: Question[]): string[] {
  const yesNoQuestions = questions.filter((question): question is YesNoQuestion => question.format === 'yes-no')
  const problems: string[] = []
  for (const question of yesNoQuestions) {
    if (!question.prompt.trimEnd().endsWith('?')) problems.push(`${question.id}: 문제문이 물음표로 끝나지 않는다`)
    for (const word of answerLeakingWords) {
      if (question.prompt.includes(word)) problems.push(`${question.id}: 문제문에 답을 흘리는 낱말이 있다 — 「${word}」`)
    }
  }
  const yes = yesNoQuestions.filter((question) => question.answer).length
  const no = yesNoQuestions.length - yes
  if (Math.abs(yes - no) > Math.max(2, Math.ceil(yesNoQuestions.length * 0.2))) {
    problems.push(`예와 아니요가 반반에서 벗어난다: 예 ${yes} · 아니요 ${no}`)
  }
  return problems
}

describe('과목 목록', () => {
  // 첫 화면(과목 목록)이 이 순서로 카드를 보인다.
  it('과목이 AWS, 네트워크 순서다', () => {
    expect(subjects.map((subject) => subject.id)).toEqual(['aws', 'network'])
  })

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

function yesNo(id: string, answer: boolean, prompt = '이 설명이 맞나요?'): YesNoQuestion {
  return { id, topicId: 'yn-topic', conceptId: 'yn-topic.concept', prompt, explanation: '해설', format: 'yes-no', answer }
}

function yesNoSet(yes: number, no: number): YesNoQuestion[] {
  return [
    ...Array.from({ length: yes }, (_, index) => yesNo(`yes${index}`, true)),
    ...Array.from({ length: no }, (_, index) => yesNo(`no${index}`, false)),
  ]
}

function choice(id: string, prompt: string): ChoiceQuestion {
  return {
    id,
    topicId: 'yn-topic',
    conceptId: 'yn-topic.concept',
    prompt,
    choices: ['보기 1', '보기 2', '보기 3', '보기 4'],
    answerIndex: 0,
    explanation: '해설',
  }
}

describe('예/아니요 문항', () => {
  describe('검사가 위반을 잡는다', () => {
    it('문제문이 물음표로 끝나지 않으면 그 문항을 보고한다', () => {
      const problems = yesNoProblems([yesNo('q1', true, '이 설명은 맞다.')])
      expect(problems).toHaveLength(1)
      expect(problems[0]).toContain('q1')
      expect(problems[0]).toContain('물음표')
    })

    it('문제문에 「항상」이 있으면 그 문항을 보고한다', () => {
      const problems = yesNoProblems([yesNo('q1', true, '이 설정은 항상 켜져 있나요?')])
      expect(problems).toHaveLength(1)
      expect(problems[0]).toContain('q1')
      expect(problems[0]).toContain('「항상」')
    })

    it('문제문에 「절대」가 있으면 그 문항을 보고한다', () => {
      const problems = yesNoProblems([yesNo('q1', false, '이 요청은 절대 막히지 않나요?')])
      expect(problems).toHaveLength(1)
      expect(problems[0]).toContain('q1')
      expect(problems[0]).toContain('「절대」')
    })

    it('예 5 : 아니요 1이면 비율을 보고한다', () => {
      const problems = yesNoProblems(yesNoSet(5, 1))
      expect(problems).toHaveLength(1)
      expect(problems[0]).toContain('예 5')
      expect(problems[0]).toContain('아니요 1')
    })

    it('예 3 : 아니요 2이고 규칙을 지키면 빈 배열이다', () => {
      expect(yesNoProblems(yesNoSet(3, 2))).toEqual([])
    })

    it('4지선다 문항은 물음표로 끝나지 않고 「항상」이 있어도 빈 배열이다', () => {
      expect(yesNoProblems([choice('c1', '항상 켜 두어야 하는 설정')])).toEqual([])
    })

    // 허용 오차 max(2, ceil(total × 0.2))의 비례 쪽이 살아 있는지 본다. 20문항이면 12 : 8까지다.
    it('예/아니요 20문항이면 12 : 8까지 허용하고 13 : 7은 보고한다', () => {
      expect(yesNoProblems(yesNoSet(12, 8))).toEqual([])
      expect(yesNoProblems(yesNoSet(13, 7))).toHaveLength(1)
    })

    it('4지선다 문항은 비율의 문항 수에 세지 않는다', () => {
      const choices = Array.from({ length: 20 }, (_, index) => choice(`c${index}`, '어느 것인가?'))
      expect(yesNoProblems([...yesNoSet(4, 0), ...choices])).toHaveLength(1)
    })
  })

  // 비율은 과목 단위로 잰다. 주제 단위로 쪼개지 않는다.
  it.each(subjects)('$id 과목의 예/아니요 문항이 규칙을 지킨다', (subject) => {
    expect(yesNoProblems(subject.questions)).toEqual([])
  })
})
