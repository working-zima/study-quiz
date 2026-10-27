import { describe, expect, it } from 'vitest'

import { questions, topics } from './index'
import { hierarchyProblems } from '../../lib/concept-groups'
import { isListItem } from '../../lib/paragraph-blocks'

// 네트워크 과목이 앞으로 지켜야 할 불변식이다. 데이터가 비어 있는 동안은 빈 집합으로 통과하고,
// 주제가 들어오는 순간부터 걸린다. 단언마다 위반 id를 모아 [] 와 비교하므로 실패 메시지가 위반 자리를 보여 준다.
// AWS 고유의 단언(특정 개념·문항·수)은 여기 두지 않는다 — 그것은 src/data/aws/data.test.ts의 몫이다.

const concepts = topics.flatMap((topic) => topic.concepts)

// 강의 통합본의 마지막 쪽이다(docs/source/network/lecture-outline.md 「주제 지도」).
const lastLecturePage = 502

function duplicates(values: string[]): string[] {
  const seen = new Set<string>()
  const repeated = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) repeated.add(value)
    seen.add(value)
  }
  return [...repeated]
}

describe('네트워크 학습 데이터 무결성', () => {
  it('주제 id와 개념 id가 유일하다', () => {
    expect(duplicates(topics.map(({ id }) => id))).toEqual([])
    expect(duplicates(concepts.map(({ id }) => id))).toEqual([])
  })

  it('개념 id는 <주제 id>.<슬러그>이고 슬러그는 소문자·숫자·하이픈이다', () => {
    const malformed = topics.flatMap((topic) =>
      topic.concepts
        .filter((concept) => {
          const prefix = `${topic.id}.`
          return !concept.id.startsWith(prefix) || !/^[a-z0-9-]+$/.test(concept.id.slice(prefix.length))
        })
        .map(({ id }) => `${topic.id}: ${id}`),
    )

    expect(malformed).toEqual([])
  })

  it('모든 주제는 하나 이상의 개념을 가진다', () => {
    expect(topics.filter(({ concepts }) => concepts.length === 0).map(({ id }) => id)).toEqual([])
  })

  it('모든 개념의 이름과 요약이 빈 문자열이 아니고, 빈 문자열이 아닌 문단을 하나 이상 가진다', () => {
    const problems = concepts.flatMap(({ id, name, summary, paragraphs }) => [
      ...(name.trim() === '' ? [`${id}: 이름이 비었다`] : []),
      ...(summary.trim() === '' ? [`${id}: 요약이 비었다`] : []),
      ...(paragraphs.length === 0 ? [`${id}: 문단이 없다`] : []),
      ...paragraphs.flatMap((paragraph, index) => (paragraph.trim() === '' ? [`${id} 문단 ${index}: 비었다`] : [])),
    ])

    expect(problems).toEqual([])
  })

  // 자격증 목표가 정해지지 않아 별점을 매길 기준이 없다. 별점은 무엇을 먼저 읽을지를 정하는 값이라(ADR-026)
  // 기준 없이 매기면 근거 없는 순위가 된다.
  it('모든 주제의 importance가 0이다(별점 없음)', () => {
    expect(topics.filter(({ importance }) => importance !== 0).map(({ id, importance }) => `${id}: ${importance}`)).toEqual([])
  })

  it(`모든 주제의 sourcePages가 강의 통합본 쪽(1~${lastLecturePage}) 안의 [시작, 끝]이다`, () => {
    const invalid = topics
      .filter(({ sourcePages }) => {
        if (sourcePages.length !== 2) return true
        const [start, end] = sourcePages
        return !Number.isInteger(start) || !Number.isInteger(end) || start < 1 || start > end || end > lastLecturePage
      })
      .map(({ id, sourcePages }) => `${id}: ${JSON.stringify(sourcePages)}`)

    expect(invalid).toEqual([])
  })

  it('모든 주제의 parentId가 같은 주제·두 단·연속 규칙을 지킨다(ADR-041)', () => {
    expect(topics.flatMap((topic) => hierarchyProblems(topic))).toEqual([])
  })

  it('목록 항목은 혼자 서지 않는다(ADR-046)', () => {
    const lonely = concepts.flatMap(({ id, paragraphs }) =>
      paragraphs.flatMap((paragraph, index) =>
        isListItem(paragraph) && !isListItem(paragraphs[index - 1] ?? '') && !isListItem(paragraphs[index + 1] ?? '')
          ? [`${id} 문단 ${index}`]
          : [],
      ),
    )

    expect(lonely).toEqual([])
  })

  // 강조 기준(AWS의 ADR-051 같은 것)이 없으므로 굵은 글씨는 목록 항목의 이름(`- **이름**(English name)은 …`, ADR-046)에만 쓴다.
  it('굵은 글씨 표지 **는 목록 항목 안에만 있다', () => {
    const misplaced = concepts.flatMap(({ id, summary, paragraphs }) => [
      ...(summary.includes('**') ? [`${id}: 요약`] : []),
      ...paragraphs.flatMap((paragraph, index) =>
        !isListItem(paragraph) && paragraph.includes('**') ? [`${id} 문단 ${index}`] : [],
      ),
    ])

    expect(misplaced).toEqual([])
  })

  // AWS의 q001…과 섞여 보이지 않게 접두사를 n으로 둔다. 문항 id는 과목 안에서만 유일하면 된다(ADR-053).
  it('문항 id가 n001부터 빈 번호 없이 이어진다', () => {
    expect(questions.map(({ id }) => id)).toEqual(
      questions.map((_, index) => `n${String(index + 1).padStart(3, '0')}`),
    )
  })

  it('모든 문항이 실재하는 주제와 개념을 참조하고, topicId가 그 개념의 주제와 같다', () => {
    const topicIds = new Set(topics.map(({ id }) => id))
    const topicOfConcept = new Map(topics.flatMap((topic) => topic.concepts.map((concept) => [concept.id, topic.id])))
    const problems = questions.flatMap(({ id, topicId, conceptId }) => [
      ...(topicIds.has(topicId) ? [] : [`${id}: 주제 ${topicId}가 없다`]),
      ...(topicOfConcept.has(conceptId) ? [] : [`${id}: 개념 ${conceptId}가 없다`]),
      ...(topicOfConcept.has(conceptId) && topicOfConcept.get(conceptId) !== topicId
        ? [`${id}: topicId ${topicId} ≠ 개념의 주제 ${topicOfConcept.get(conceptId)}`]
        : []),
    ])

    expect(problems).toEqual([])
  })

  // ADR-026 — 이 앱의 주 학습 경로는 문제를 풀고 틀린 것만 개념으로 되짚는 순환이라,
  // 문항이 가리키지 않는 개념은 그 경로에서 아예 배울 수 없는 사각지대다. 개념을 더하는 사람은 문항도 함께 만든다.
  // 예외 목록("이 개념들은 출제하지 않는다")을 만들어 통과시키지 마라. 그 목록이 생기는
  // 순간 다음 사람이 거기에 개념을 추가해 사각지대가 되살아난다.
  it('모든 개념이 문항 하나 이상을 갖는다', () => {
    const covered = new Set(questions.map(({ conceptId }) => conceptId))

    expect(concepts.filter(({ id }) => !covered.has(id)).map(({ id }) => id)).toEqual([])
  })

  // AWS 문항은 format이 없는 것이 4지선다지만, 새 과목은 데이터만 보고 형식을 알 수 있게 늘 적는다(ADR-054).
  it('모든 문항이 format을 가지고, 형식에 맞는 필드만 가진다', () => {
    const problems = questions.flatMap((question) => {
      if (question.format === 'choice') {
        const { id, choices, answerIndex } = question
        return [
          ...(Array.isArray(choices) && choices.length === 4 && new Set(choices).size === 4
            ? []
            : [`${id}: 서로 다른 보기 4개가 아니다`]),
          ...(Number.isInteger(answerIndex) && answerIndex >= 0 && answerIndex <= 3
            ? []
            : [`${id}: answerIndex가 0~3이 아니다`]),
        ]
      }
      if (question.format === 'yes-no') {
        const { id, answer } = question
        return [
          ...(typeof answer === 'boolean' ? [] : [`${id}: answer가 불리언이 아니다`]),
          ...('choices' in question ? [`${id}: 예/아니요인데 choices가 있다`] : []),
          ...('answerIndex' in question ? [`${id}: 예/아니요인데 answerIndex가 있다`] : []),
        ]
      }
      return [`${question.id}: format이 없다`]
    })

    expect(problems).toEqual([])
  })

  // ADR-027. 하한 187자는 AWS 해설 486개(q247~q732)의 실측 최소값이다. 해설은 정답만 정당화하는 글이
  // 아니라 그 개념을 가르치는 글이라, 정답이 왜 맞는지와 오답이 왜 아닌지를 담으면 자연히 넘는 선이다.
  // 과목이 바뀌어도 해설의 일은 같으므로 하한을 과목에 맞춰 낮추지 마라 — 낮추는 순간 근거가 실측에서 임의값으로 바뀐다.
  const explanationMinLength = 187

  it('모든 문항의 해설이 그 개념을 가르칠 만큼의 길이를 갖는다', () => {
    const tooShort = questions
      .filter(({ explanation }) => explanation.length < explanationMinLength)
      .map(({ id, explanation }) => `${id}(${explanation.length}자)`)

    expect(tooShort).toEqual([])
  })

  // 예/아니요는 src/data/index.test.ts가 이미 보지만, 네트워크는 4지선다도 물음으로 끝낸다(「무엇인가?」).
  it('모든 문항의 문제문이 물음표로 끝난다', () => {
    expect(questions.filter(({ prompt }) => !prompt.trimEnd().endsWith('?')).map(({ id }) => id)).toEqual([])
  })
})
