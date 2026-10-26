import type { ChoiceQuestion, Question } from '../types/content'

export function shuffle<T>(items: T[], rng: () => number): T[] {
  const result = [...items]

  for (let i = result.length - 1; i >= 1; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }

  return result
}

// 예/아니요 문항은 그대로 돌려준다. 버튼 순서는 늘 예 다음 아니요다.
export function shuffleChoices(question: ChoiceQuestion, rng: () => number): ChoiceQuestion
export function shuffleChoices(question: Question, rng: () => number): Question
export function shuffleChoices(question: Question, rng: () => number): Question {
  if (question.format === 'yes-no') {
    return question
  }

  const order = shuffle([0, 1, 2, 3], rng)
  const choices = [
    question.choices[order[0]],
    question.choices[order[1]],
    question.choices[order[2]],
    question.choices[order[3]],
  ] as [string, string, string, string]
  const answerIndex = order.indexOf(question.answerIndex) as 0 | 1 | 2 | 3

  return { ...question, choices, answerIndex }
}

export function shuffleQuestions(
  questions: ChoiceQuestion[],
  rng: () => number,
): ChoiceQuestion[]
export function shuffleQuestions(questions: Question[], rng: () => number): Question[]
export function shuffleQuestions(
  questions: Question[],
  rng: () => number,
): Question[] {
  return shuffle(questions, rng).map((question) => shuffleChoices(question, rng))
}
