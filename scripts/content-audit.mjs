#!/usr/bin/env node
/**
 * 콘텐츠 품질 감사: 개념 제목·문항 문구의 결함을 기계로 검출되는 만큼만 세어 찍는다.
 *
 * phase 29가 시범 주제(`s3-encryption-batch`) 하나에서 세운 기준이 ADR-030에 있고, 이 도구는
 * 그중 **기계가 볼 수 있는 셋**을 잰다. 나머지 38개 주제로 넓히는 작업의 입력이다.
 *
 * | 지표 | 무엇을 보는가 | 근거 |
 * |---|---|---|
 * | ① 문장형 제목 | 개념 `name`이 종결어미 `-다`로 끝나는가 | ADR-030 기준 1 (명사구) |
 * | ② 관용 표현   | 본문·문항에 `돌린다`·`띄운다` 계열이 있는가 | ADR-030 기준 5 (하는 일을 그대로) |
 * | ③ 정답 노출   | 정답 보기의 영문·숫자 토큰이 프롬프트에 있고 오답 셋에는 없는가 | ADR-030 기준 3 (이름을 꺼내지 않는다) |
 * | ④ 소속 없는 용어 | 프롬프트가 `버킷`·`객체`·`접두사`를 쓰는데 `S3`가 한 번도 없는가 | phase 29 step 7 (A) |
 * | ⑤ 장문       | 프롬프트에 60자를 넘는 문장이 있는가 | phase 29 step 7 (B) |
 * | ⑥ 중복 후보  | 같은 `conceptId`에 정답 텍스트까지 같은 짝이 있는가 | phase 29 step 7 (C) |
 *
 * **④~⑥은 phase 29 step 7이 3차 피드백에서 얻은 잣대다.** 셋 다 앞의 셋과 같은 성질을 갖는다 —
 * 세는 것과 판정하는 것이 다르고 마지막 판정은 사람이 한다. 각각의 한계를 아래에 적었다.
 *
 * **③은 후보 목록이지 위반 목록이 아니다.** 정당한 자리가 다수 섞인다 — `q327`은 프롬프트의
 * "Windows 애플리케이션 서버"가 정답 `FSx for Windows File Server`와 글자로 이어지지만,
 * 그 낱말이 없으면 어느 파일 시스템을 고를지 정할 수 없어 **문항 자체가 성립하지 않는다.**
 * 판정 기준은 "그 낱말이 프롬프트에 없으면 문제가 성립하지 않는가"이고 사람이 읽어야 갈린다.
 * `AWS`·`DB`·`IP`처럼 상식으로 통하는 토큰도 걸리므로(ADR-015가 풀이 대상에서 뺀 것들)
 * 걸린 수를 위반 건수로 읽지 마라. ②도 마지막에 한 번은 읽어야 한다 — 아래 「제외한 뜻」을 봐라.
 *
 * **③과 ④가 서로를 끌어당긴다.** ④를 고치려고 프롬프트에 `S3`를 넣으면, 정답 보기에만 `S3`가
 * 붙어 있고 오답 셋에는 없는 문항에서 ③이 새로 걸린다. 그때 고칠 것은 프롬프트가 아니라
 * **보기의 이름 표기**다 — 같은 주제의 기능을 한쪽은 `S3 수명 주기 규칙`, 다른 쪽은
 * `수명 주기 규칙`으로 부르면 그 글자가 정답을 가리키는 신호가 된다. phase 29 step 7이
 * `q280`·`q281`에서 오답 하나씩의 표기를 나란히 맞춰 이 자리를 풀었다.
 *
 * **⑤의 60자는 위반선이 아니라 검사해 볼 신호다.** 사용자가 직접 다시 쓴 `q038`은 원래와
 * 길이가 거의 같은데도 읽힌다 — `사용자가`(누가) → `키를 직접 생성하고 보관·관리해야 해서`
 * (무엇을) → `운영 부담과 …이 큰`(왜) → `암호화 방식은 무엇인가`(묻는 것)로 끊기기 때문이다.
 * 즉 **재는 것은 길이이고 문제는 덩어리 구분이다.** 기계가 잴 수 없는 것을 재는 척하지 않으려고
 * 이 지표는 길이만 찍는다. 걸린 프롬프트는 소리 내어 읽어 「누가 / 무엇을 / 왜」로 끊어지는지
 * 사람이 판정해라. 끊어져 읽히면 60자를 넘어도 그대로 두는 것이 맞다.
 *
 * **⑥은 후보 목록이지 위반 목록이 아니다.** 문제 은행 732문항 전체를 이 규칙으로 훑으면
 * 짝이 여덟인데, phase 29 step 7이 여덟을 다 읽어 보니 **실제 중복은 셋뿐이었다.**
 * 중복인 셋 — `q113`·`q116`(낱말만 다르고 묻는 것이 같다), `q031`·`q033`(뒤가 앞의 부분집합),
 * `q040`·`q041`(뒤가 `단일 AZ` 하나를 더한 것뿐). 셋 다 다음 phase의 몫이다.
 * 중복이 아닌 다섯 — `q096`·`q097` / `q129`·`q136` / `q130`·`q137` / `q141`·`q145` /
 * `q146`·`q148`. **같은 답을 다른 성질로 묻고 있어 학습되는 것이 다르다** — `q141`은 KMS가
 * 키를 만들고 보관하는 것을 묻고 `q145`는 자동 교체를 묻는다.
 *
 * **⑥은 개념이 다르면 잡지 못한다.** 사용자가 지적한 `q036`·`q173`이 그 자리였다 —
 * 자동 교체 → SSE-KMS와 봉투 암호화 + 자동 교체 → SSE-KMS로 정답도 근거도 겹쳤는데,
 * `conceptId`가 `sse-types`와 `envelope-encryption`으로 갈려 이 표에는 한 번도 뜨지 않았다.
 * 개념까지 같은 경우만 세는 이유는 위 다섯 짝 때문이다 — 개념이 다르면 묻는 성질이 다른 쪽이
 * 다수여서, 넓히면 후보가 잡음으로 덮인다.
 *
 * **기계로 검출되지 않는 결함이 넷 더 있다.** 사용자가 낸 지적 일곱 중 아래 넷이고,
 * 이 도구는 하나도 세지 못한다.
 *
 *   ① 기초 용어가 정의되지 않은 채 쓰인다      (`접두사에 쌓여 있는 객체`)
 *   ② 개념이 왜 거기 있는지 없이 튀어나온다     (도입 문장이 앞 개념과 이어지지 않는다)
 *   ③ 한 문항이 두 요구를 겹친다                (요구를 둘 쌓고 하나만 정답 논리에 쓴다)
 *   ⑦ 문항의 목적이 불분명하다                  (무엇을 배우게 하려는 문항인지 말할 수 없다)
 *
 * **넷을 찾는 방법은 프롬프트와 본문을 처음 보는 학습자의 눈으로 직접 읽는 것뿐이다.**
 * 필터로 후보를 만들어 그 안에서만 고르는 방식은 이미 실패한 전례가 있다 — 결함의 모양이
 * 서로 달라서(처음 나온 용어를 전제한 경우 / 수식어에 뜻이 없는 경우 / 일반 명사가 가리키는
 * 대상이 없는 경우) 어떤 지표도 한 유형만 잡고 나머지를 놓쳤다. 이 도구의 출력을 대상 선정의
 * 근거로 삼지 마라. 정렬과 우선순위 참고로만 쓴다.
 *
 * 사용법:
 *   node scripts/content-audit.mjs              주제별 표와 전체 집계. 보고 전용이라 항상 exit 0
 *   node scripts/content-audit.mjs <topicId>…    주어진 주제만. 걸린 항목을 전부 찍는다. exit 0
 *
 * **exit code는 언제나 0이다.** ③이 후보 목록이라 위반 건수로 문을 닫을 수 없고, ①·②도
 * 나머지 38개 주제에 아직 남아 있어 지금 실패로 만들면 아무 작업도 시작할 수 없다.
 * npm test·npm run build에 엮지 마라 — ADR-026이 `coverage.mjs`를, ADR-027이
 * `explanation-audit.mjs`를 엮지 않은 것과 같은 이유다. 고치는 도중에는 미달이 정상이고,
 * 빌드를 막으면 고치는 작업 자체가 진행되지 않는다. 고친 주제를 고정하는 것은
 * `src/data/aws/data.test.ts`의 몫이고, 지금은 시범 주제 하나에만 걸려 있다.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'))

/**
 * ① 문장형 제목. 한국어 평서형 종결어미는 모두 `-다`로 끝나므로 그것으로 잰다.
 * `src/data/aws/data.test.ts`의 「S3 암호화 주제의 개념 제목이 모두 문장이 아니라 명사구다」와
 * 같은 규칙이다 — 두 곳이 갈리면 테스트를 통과한 주제가 여기서 걸린다.
 *
 * `-자`·`-라`로 끝나는 이름은 대상이 아니다. `HTTP API의 JWT 권한 부여자`,
 * `샤드와 체크포인트를 직접 다루는 소비자`처럼 **명사구의 마지막 글자**일 뿐이다.
 * 종결어미 목록을 넓히면 그 둘이 곧바로 오검출로 걸린다 — phase 29 착수 조사가 실제로
 * 그렇게 세어 189건을 얻었고, 이 규칙으로 다시 재면 187건이다.
 */
const SENTENCE_NAME = /다$/

/**
 * ② 뜻이 좁아지는 관용 표현. 프로그램을 실행한다는 뜻으로 쓰였지만 그 뜻으로 읽히지 않는다.
 * 사용자가 `q281`의 "돌릴 인스턴스"에서 "회전축을 기준으로 어떤 걸 돌리는 형태인건가?"라고
 * 막힌 자리가 근거다. 문항과 보기는 열 때마다 섞이므로(ADR-011) 앞뒤 문맥이 뜻을 보정해
 * 주지 않는다 — 각 문항은 단독으로 읽혀야 한다.
 */
const IDIOM = /돌(리|린|릴|려|아가)|띄(우|운|워)|태(우|운|워)/g

/**
 * ②에서 제외한 뜻. 같은 글자가 관용 표현이 아닌 자리에 쓰인 것들이라 먼저 지우고 센다.
 *
 * - `돌려주다`·`돌려받다`·`되돌리다` — **반환**이다. `s3-object-lambda`의 "변환한 결과를
 *   호출자에게 돌려준다"가 그 자리이고, phase 29 step 2가 개념 쪽에서도 그대로 두기로
 *   판정했다(실행·운영의 비유가 아니라서 읽는 데 막히지 않는다).
 * - `맞물리다` — "조건과 맞물린다"는 **부합**이다. 해설 여덟 곳이 이 뜻으로 쓴다.
 * - `돌아가며` — **순번**이다. "요청을 차례대로 돌아가며 넘기는 라운드 로빈"은 ADR-014가
 *   승인한 문장이다.
 *
 * 지운 뒤에도 남는 것 중 `Kafka 자체가 그대로 돌아가므로`처럼 **가동**의 뜻인 자리가 있다.
 * 관용 표현이 맞지만 고칠 말이 자리마다 다르므로, 걸린 항목은 한 번은 읽고 고쳐라.
 */
const OTHER_SENSE = /되돌|돌려(주|준|줄|줘|받|보|놓)|돌아오|맞물|돌아가며/g

/** ③ 정답 노출 후보에서 쓰는 토큰. 2자 이상의 영문·숫자 덩어리만 본다(`KMS`·`FSx`·`io2`). */
const TOKEN = /[A-Za-z0-9]+/g

/**
 * ④ 소속 없이 쓰이면 막히는 S3 고유의 기초 용어. ADR-028이 뜻풀이를 허용한 셋과 같다.
 * 개념 본문에서는 주제 안에 풀이를 한 줄 두면 되지만(ADR-029) **문항에는 그 주제가 없다** —
 * 순서가 열 때마다 섞이고(ADR-011) 랜덤 세트는 일부만 뽑으므로(ADR-012·018) 학습자는 그
 * 주제를 읽지 않은 채로 문항을 만난다. 그래서 문항에서는 풀이가 아니라 소속을 붙인다.
 */
const ORPHAN_TERM = /버킷|객체|접두사/

/** ④에서 소속을 세우는 이름. 위 세 낱말이 어느 서비스의 것인지 밝히는 유일한 글자다. */
const OWNER_NAME = 'S3'

/** ⑤ 문장을 가르는 자리. 한국어 프롬프트도 마침표·물음표로 끝난다. */
const SENTENCE_END = /[.?!]/

/** ⑤ 검사해 볼 신호가 되는 길이. 위반선이 아니다 — 머리주석을 봐라. */
const LONG_SENTENCE = 60

const topics = read('src/data/aws/topics.json')
const questions = read('src/data/aws/questions.json')

/** 관용 표현이 남아 있는 자리. 제외할 뜻을 먼저 지운 뒤 센다. */
const idiomsIn = (text) => [...text.replace(OTHER_SENSE, '').matchAll(IDIOM)].map((m) => m[0])

const conceptText = (concept) => [concept.summary, ...concept.paragraphs]
const questionText = (question) => [question.prompt, ...question.choices, question.explanation]

/**
 * ③ 정답 보기의 이름 중 프롬프트에만 있는 토큰. 오답 셋에도 있으면 변별에 쓸 수 없어 뺀다.
 * `SSE-KMS`처럼 붙임표가 든 이름은 `SSE`·`KMS`로 쪼개 본다 — 사용자가 지적한 `q036`이
 * 프롬프트의 `AWS KMS`와 정답 `SSE-KMS`가 이어지는 자리였고, 통째로 보면 그것을 놓친다.
 */
const leakedTokens = (question) => {
  const answer = question.choices[question.answerIndex]
  const tokens = [...new Set((answer.match(TOKEN) ?? []).filter((t) => t.length >= 2))]
  const distractors = question.choices
    .filter((_, i) => i !== question.answerIndex)
    .join(' ')
    .toUpperCase()
  const prompt = question.prompt.toUpperCase()

  return tokens.filter((t) => {
    const upper = t.toUpperCase()
    return prompt.includes(upper) && !distractors.includes(upper)
  })
}

/** ④ 프롬프트가 소속 없이 쓴 기초 용어. 없으면 빈 배열이다. */
const orphanTermsIn = (prompt) =>
  prompt.includes(OWNER_NAME)
    ? []
    : [...new Set(prompt.match(new RegExp(ORPHAN_TERM, 'g')) ?? [])]

/** ⑤ 프롬프트 안에서 60자를 넘는 문장. 재는 것은 길이뿐이다. */
const longSentencesIn = (prompt) =>
  prompt
    .split(SENTENCE_END)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > LONG_SENTENCE)

/** ⑥ 같은 개념에 정답 텍스트까지 같은 짝. 먼저 나온 쪽을 앞에 둔다. */
const duplicatePairsIn = (topicQuestions) => {
  const first = new Map()
  const pairs = []

  for (const question of topicQuestions) {
    const answer = question.choices[question.answerIndex]
    const key = `${question.conceptId}|${answer}`
    const seen = first.get(key)

    if (seen) pairs.push({ ids: [seen, question.id], conceptId: question.conceptId, answer })
    else first.set(key, question.id)
  }

  return pairs
}

/** 주제 하나의 집계. 여섯 지표에 걸린 항목을 그대로 들고 있는다. */
const measure = (topic) => {
  const topicQuestions = questions.filter((q) => q.topicId === topic.id)

  return {
    id: topic.id,
    concepts: topic.concepts.length,
    questions: topicQuestions.length,
    sentenceNames: topic.concepts
      .filter((c) => SENTENCE_NAME.test(c.name))
      .map((c) => ({ id: c.id, name: c.name })),
    idiomConcepts: topic.concepts
      .map((c) => ({ id: c.id, found: conceptText(c).flatMap(idiomsIn) }))
      .filter((row) => row.found.length > 0),
    idiomQuestions: topicQuestions
      .map((q) => ({ id: q.id, found: questionText(q).flatMap(idiomsIn) }))
      .filter((row) => row.found.length > 0),
    leakCandidates: topicQuestions
      .map((q) => ({ id: q.id, tokens: leakedTokens(q), answer: q.choices[q.answerIndex] }))
      .filter((row) => row.tokens.length > 0),
    orphanTerms: topicQuestions
      .map((q) => ({ id: q.id, terms: orphanTermsIn(q.prompt) }))
      .filter((row) => row.terms.length > 0),
    longPrompts: topicQuestions
      .map((q) => ({ id: q.id, sentences: longSentencesIn(q.prompt) }))
      .filter((row) => row.sentences.length > 0),
    duplicateCandidates: duplicatePairsIn(topicQuestions),
  }
}

const counts = (stats) => ({
  concepts: stats.reduce((n, s) => n + s.concepts, 0),
  questions: stats.reduce((n, s) => n + s.questions, 0),
  sentenceNames: stats.reduce((n, s) => n + s.sentenceNames.length, 0),
  idiomConcepts: stats.reduce((n, s) => n + s.idiomConcepts.length, 0),
  idiomQuestions: stats.reduce((n, s) => n + s.idiomQuestions.length, 0),
  leakCandidates: stats.reduce((n, s) => n + s.leakCandidates.length, 0),
  orphanTerms: stats.reduce((n, s) => n + s.orphanTerms.length, 0),
  longPrompts: stats.reduce((n, s) => n + s.longPrompts.length, 0),
  duplicateCandidates: stats.reduce((n, s) => n + s.duplicateCandidates.length, 0),
})

const isClean = (s) =>
  s.sentenceNames.length === 0 &&
  s.idiomConcepts.length + s.idiomQuestions.length === 0 &&
  s.leakCandidates.length === 0 &&
  s.orphanTerms.length === 0 &&
  s.longPrompts.length === 0 &&
  s.duplicateCandidates.length === 0

const wanted = process.argv.slice(2)

if (wanted.length > 0) {
  // 주제를 지정한 경우 — 그 주제를 고친 step이 무엇을 남겼는지 확인하는 경로다.
  const unknown = wanted.filter((id) => !topics.some((t) => t.id === id))
  if (unknown.length) {
    console.log(`✗ 그런 주제가 없다: ${unknown.join(', ')}`)
    process.exit(1)
  }

  const stats = wanted.map((id) => measure(topics.find((t) => t.id === id)))
  for (const s of stats) {
    console.log(`${s.id} — 개념 ${s.concepts}개, 문항 ${s.questions}개`)

    console.log(`  ① 문장형 제목 ${s.sentenceNames.length}건`)
    for (const row of s.sentenceNames) console.log(`     ✗ ${row.id}  "${row.name}"`)

    const idiom = s.idiomConcepts.length + s.idiomQuestions.length
    console.log(
      `  ② 관용 표현 ${idiom}건` +
      ` (개념 ${s.idiomConcepts.length} / 문항 ${s.idiomQuestions.length})`,
    )
    for (const row of s.idiomConcepts) console.log(`     ✗ ${row.id}  ${row.found.join(' ')}`)
    for (const row of s.idiomQuestions) console.log(`     ✗ ${row.id}  ${row.found.join(' ')}`)

    console.log(`  ③ 정답 노출 후보 ${s.leakCandidates.length}건 (사람이 읽어야 갈린다)`)
    for (const row of s.leakCandidates) {
      console.log(`     ? ${row.id}  [${row.tokens.join(' ')}] → "${row.answer}"`)
    }

    console.log(`  ④ 소속 없는 용어 ${s.orphanTerms.length}건`)
    for (const row of s.orphanTerms) {
      console.log(`     ✗ ${row.id}  ${row.terms.join('·')} — 프롬프트에 ${OWNER_NAME}가 없다`)
    }

    console.log(`  ⑤ 장문 ${s.longPrompts.length}건 (${LONG_SENTENCE}자는 위반선이 아니라 신호다)`)
    for (const row of s.longPrompts) {
      for (const sentence of row.sentences) {
        console.log(`     ? ${row.id}  ${sentence.length}자  ${sentence}`)
      }
    }

    console.log(`  ⑥ 중복 후보 ${s.duplicateCandidates.length}쌍 (사람이 읽어야 갈린다)`)
    for (const row of s.duplicateCandidates) {
      console.log(`     ? ${row.ids.join('·')}  ${row.conceptId} → "${row.answer}"`)
    }
    console.log('')
  }

  const c = counts(stats)
  console.log(
    `지정한 주제: 개념 ${c.concepts}개·문항 ${c.questions}개 —` +
    ` 문장형 제목 ${c.sentenceNames}건, 관용 표현 ${c.idiomConcepts + c.idiomQuestions}건,` +
    ` 정답 노출 후보 ${c.leakCandidates}건, 소속 없는 용어 ${c.orphanTerms}건,` +
    ` 장문 ${c.longPrompts}건, 중복 후보 ${c.duplicateCandidates}쌍`,
  )
  if (stats.every(isClean)) console.log('✓ 기계로 검출되는 여섯 지표가 모두 0건이다')
  console.log(
    '기계로 검출되지 않는 넷(①기초 용어 ②도입 문장 ③요구 겹치기 ⑦문항 목적)은 사람이 읽어야 한다',
  )
  process.exit(0)
}

// 인자가 없으면 전체 개요다. 보고 전용이므로 위반이 남아 있어도 exit 0으로 끝난다.
const stats = topics.map(measure)
const width = Math.max(...stats.map((s) => s.id.length))
for (const s of stats) {
  const idiom = s.idiomConcepts.length + s.idiomQuestions.length
  console.log(
    `${isClean(s) ? '✓' : ' '} ${s.id.padEnd(width)}` +
    `  개념 ${String(s.concepts).padStart(2)}·문항 ${String(s.questions).padStart(2)}` +
    `  ① 제목 ${String(s.sentenceNames.length).padStart(2)}` +
    `  ② 관용 ${String(idiom).padStart(2)}` +
    ` (개념 ${String(s.idiomConcepts.length).padStart(2)}/문항 ${String(s.idiomQuestions.length).padStart(2)})` +
    `  ③ 노출 ${String(s.leakCandidates.length).padStart(2)}` +
    `  ④ 무소속 ${String(s.orphanTerms.length).padStart(2)}` +
    `  ⑤ 장문 ${String(s.longPrompts.length).padStart(2)}` +
    `  ⑥ 중복 ${String(s.duplicateCandidates.length).padStart(2)}`,
  )
}

const c = counts(stats)
const cleanTopics = stats.filter(isClean)

console.log('')
console.log(`전체: 주제 ${topics.length}개, 개념 ${c.concepts}개, 문항 ${c.questions}개`)
console.log(
  `① 문장형 제목 ${c.sentenceNames}건` +
  ` (걸린 주제 ${stats.filter((s) => s.sentenceNames.length > 0).length}개)`,
)
console.log(
  `② 관용 표현 ${c.idiomConcepts + c.idiomQuestions}건` +
  ` — 개념 ${c.idiomConcepts}개, 문항 ${c.idiomQuestions}개`,
)
console.log(`③ 정답 노출 후보 ${c.leakCandidates}건 — 위반 건수가 아니다. 사람이 읽어 갈라야 한다`)
console.log(
  `④ 소속 없는 용어 ${c.orphanTerms}건` +
  ` (걸린 주제 ${stats.filter((s) => s.orphanTerms.length > 0).length}개)`,
)
console.log(`⑤ 장문 ${c.longPrompts}건 — ${LONG_SENTENCE}자는 위반선이 아니라 검사해 볼 신호다`)
console.log(`⑥ 중복 후보 ${c.duplicateCandidates}쌍 — 여덟 짝 중 셋만 실제 중복이었다(머리주석 참고)`)
console.log(
  `여섯 지표가 모두 0건인 주제 ${cleanTopics.length}개: ${cleanTopics.map((s) => s.id).join(', ')}`,
)
console.log('')
console.log(
  '기계로 검출되지 않는 결함 넷은 이 표에 없다 — ①기초 용어 ②도입 문장 ③요구 겹치기 ⑦문항 목적.',
)
console.log(
  '그 넷은 주제 페이지를 처음 읽는 학습자의 눈으로 통독하는 것 외에 찾는 방법이 없다(머리주석 참고).',
)
