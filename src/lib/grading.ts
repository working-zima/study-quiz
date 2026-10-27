import type { Question } from '../types/content'

// 예/아니요 문항도 버튼을 인덱스로 고른다. 0 = 예, 1 = 아니요. 이 대응은 이 파일에만 둔다.
export function isCorrect(question: Question, choiceIndex: number): boolean {
  if (question.format === 'yes-no') {
    return (choiceIndex === 0) === question.answer
  }
  return question.answerIndex === choiceIndex
}

export function choiceLabels(question: Question): string[] {
  if (question.format === 'yes-no') {
    return ['예', '아니요']
  }
  return question.choices
}
