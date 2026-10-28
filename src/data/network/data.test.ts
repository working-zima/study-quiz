import { describe, expect, it } from 'vitest'

import { questions, topics } from './index'
import { hierarchyProblems } from '../../lib/concept-groups'
import { isListItem } from '../../lib/paragraph-blocks'
import type { Importance } from '../../types/content'

// 네트워크 과목이 앞으로 지켜야 할 불변식이다. 데이터가 비어 있는 동안은 빈 집합으로 통과하고,
// 주제가 들어오는 순간부터 걸린다. 단언마다 위반 id를 모아 [] 와 비교하므로 실패 메시지가 위반 자리를 보여 준다.
// AWS 고유의 단언(특정 개념·문항·수)은 여기 두지 않는다 — 그것은 src/data/aws/data.test.ts의 몫이다.

const concepts = topics.flatMap((topic) => topic.concepts)

// 강의 통합본의 마지막 쪽이다(docs/source/network/lecture-outline.md 「주제 지도」).
const lastLecturePage = 502

// 과목의 주제 42개마다 네트워크관리사 2급 필기 기출 11회 가운데 그 주제의 문항이 나온 회의 수(출제 회차)와,
// 강의 주제인지(lecture)를 적는다. docs/source/network/topic-map.md 「주제 지도」 표와 같은 값이고 순서도 그 표와 같다(ADR-059).
// 지도를 바꾸면 이 표도 함께 바꾼다. 아직 앱에 없는 주제도 여기 있다 — 주제를 만드는 phase가 이 표를 보고 별점을 매긴다.
const topicMap: Record<string, { examSessions: number; lecture: boolean }> = {
  'network-basics':              { examSessions:  6, lecture: true  },
  'protocols-encapsulation':     { examSessions: 11, lecture: true  },
  'transmission-media':          { examSessions: 10, lecture: false },
  'network-topology':            { examSessions: 10, lecture: false },
  'ethernet':                    { examSessions:  6, lecture: true  },
  'hub-switch-vlan':             { examSessions: 10, lecture: true  },
  'wireless-lan':                { examSessions: 10, lecture: false },
  'ip-protocol':                 { examSessions: 11, lecture: true  },
  'arp':                         { examSessions:  7, lecture: true  },
  'icmp':                        { examSessions: 11, lecture: true  },
  'ip-addressing':               { examSessions: 11, lecture: true  },
  'ip-address-types':            { examSessions: 11, lecture: true  },
  'routing':                     { examSessions: 10, lecture: true  },
  'ports':                       { examSessions:  6, lecture: true  },
  'tcp-udp':                     { examSessions: 10, lecture: true  },
  'tcp-connection':              { examSessions:  6, lecture: true  },
  'tcp-retransmission':          { examSessions:  8, lecture: true  },
  'tcp-flow-congestion':         { examSessions:  6, lecture: true  },
  'dns':                         { examSessions: 10, lecture: true  },
  'app-protocols-mail-file':     { examSessions:  9, lecture: false },
  'app-protocols-mgmt-security': { examSessions:  9, lecture: false },
  'uri-web-server':              { examSessions:  0, lecture: true  },
  'http-basics':                 { examSessions:  1, lecture: true  },
  'http-messages':               { examSessions:  1, lecture: true  },
  'http-headers':                { examSessions:  0, lecture: true  },
  'http-cache':                  { examSessions:  0, lecture: true  },
  'http-cookie':                 { examSessions:  0, lecture: true  },
  'network-devices':             { examSessions: 11, lecture: false },
  'network-security':            { examSessions:  9, lecture: false },
  'cloud-sdn':                   { examSessions:  9, lecture: false },
  'diagnostic-commands':         { examSessions: 10, lecture: false },
  'linux-filesystem':            { examSessions: 10, lecture: false },
  'linux-permissions':           { examSessions: 11, lecture: false },
  'linux-shell':                 { examSessions:  9, lecture: false },
  'linux-process-boot':          { examSessions: 11, lecture: false },
  'linux-accounts':              { examSessions:  6, lecture: false },
  'linux-servers':               { examSessions:  8, lecture: false },
  'windows-ad':                  { examSessions: 10, lecture: false },
  'windows-server-roles':        { examSessions:  8, lecture: false },
  'windows-hyperv':              { examSessions:  8, lecture: false },
  'windows-admin-tools':         { examSessions:  8, lecture: false },
  'raid-storage':                { examSessions:  8, lecture: false },
}

// 기출 회차의 수다. 별점 경계(9·6)는 이 수를 기준으로 정했다 — 회차가 늘면 topic-map.md 「이 지도를 바꾸는 법」대로 경계도 함께 본다.
const examSessionCount = 11

// 출제 회차 9 이상 ★★★, 6~8 ★★☆, 5 이하 별점 없음(ADR-059).
function importanceFromSessions(sessions: number): Importance {
  if (sessions >= 9) return 3
  if (sessions >= 6) return 2
  return 0
}

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

  it(`주제 지도 표는 주제 42개(강의 주제 22개)이고 출제 회차가 0~${examSessionCount}의 정수다`, () => {
    const entries = Object.entries(topicMap)

    expect(entries).toHaveLength(42)
    expect(entries.filter(([, { lecture }]) => lecture)).toHaveLength(22)
    expect(
      entries
        .filter(([, { examSessions }]) => !Number.isInteger(examSessions) || examSessions < 0 || examSessions > examSessionCount)
        .map(([id, { examSessions }]) => `${id}: ${examSessions}`),
    ).toEqual([])
  })

  // 과목의 범위는 ADR-059가 정한 주제 42개다. 지도에 없는 주제를 더하려면 ADR과 지도를 먼저 고친다.
  it('앱의 모든 네트워크 주제가 주제 지도에 있다', () => {
    expect(topics.filter(({ id }) => !(id in topicMap)).map(({ id }) => id)).toEqual([])
  })

  // 별점은 무엇을 먼저 읽을지를 정하는 값이다(ADR-026). 네트워크는 목표 자격증의 출제 회차에서 계산한다(ADR-059).
  // 주제마다 손으로 덮어쓰지 마라 — 별점이 회차에서 계산되는 값이 아니라 목록이 된다.
  it('모든 주제의 별점이 출제 회차에서 계산한 값과 같다', () => {
    const mismatched = topics
      .filter(({ id }) => id in topicMap)
      .filter(({ id, importance }) => importance !== importanceFromSessions(topicMap[id].examSessions))
      .map(({ id, importance }) => `${id}: ${importance} → ${importanceFromSessions(topicMap[id].examSessions)}`)

    expect(mismatched).toEqual([])
  })

  it(`강의 주제의 sourcePages가 강의 통합본 쪽(1~${lastLecturePage}) 안의 [시작, 끝]이다`, () => {
    const invalid = topics
      .filter(({ id }) => topicMap[id]?.lecture === true)
      .filter(({ sourcePages }) => {
        if (sourcePages.length !== 2) return true
        const [start, end] = sourcePages
        return !Number.isInteger(start) || !Number.isInteger(end) || start < 1 || start > end || end > lastLecturePage
      })
      .map(({ id, sourcePages }) => `${id}: ${JSON.stringify(sourcePages)}`)

    expect(invalid).toEqual([])
  })

  // 강의 밖 주제에는 가리킬 강의 쪽이 없다. 타입은 AWS와 같이 쓰므로 필드를 비우지 않고 [0, 0]으로 적는다(ADR-059).
  it('강의 밖 주제의 sourcePages가 [0, 0]이다', () => {
    const invalid = topics
      .filter(({ id }) => topicMap[id]?.lecture === false)
      .filter(({ sourcePages }) => sourcePages.length !== 2 || sourcePages[0] !== 0 || sourcePages[1] !== 0)
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
