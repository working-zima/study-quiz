#!/usr/bin/env node
/**
 * 해설 길이 감사: 문항의 해설이 그 개념을 가르칠 만큼 쓰였는지 잰다.
 *
 * 확인 문제만 푸는 학습자에게 해설은 그 개념에 대해 읽는 유일한 설명 텍스트이고, 문항 순서가
 * 열 때마다 섞이므로(ADR-011) 앞 해설이 설명해 줬을 것이라고 가정할 수 없다. 그래서 해설은
 * 정답을 정당화하는 글이 아니라 그 개념을 가르치는 글이어야 한다 — ADR-026 「해설을 짧게 쓰지
 * 않는 이유」. 이 도구는 그 규칙이 지켜졌는지 길이로 재는 하한선이다.
 *
 * 대상은 q001~q246으로 한정한다. 그 구간은 ADR-026이 위 규칙을 정하기 전에 쓰인 문항이고,
 * q247 이후 486개는 그 규칙대로 쓰여 이미 하한을 넘는다. 세어도 늘 통과하므로 세지 않는다.
 *
 * 사용법:
 *   node scripts/explanation-audit.mjs              주제별 표와 전체 요약. 보고 전용이라 항상 exit 0
 *   node scripts/explanation-audit.mjs <topicId>…   주어진 주제만. 미달 문항이 있으면 exit 1
 *
 * npm test·npm run build에 엮지 마라. 고치는 도중에는 미달 상태가 정상이고, 빌드를 막으면
 * 고치는 작업 자체가 진행되지 않는다 — ADR-026이 coverage.mjs를 엮지 않은 것과 같은 이유다.
 * 하한을 테스트 불변식으로 고정하는 것은 이 phase의 마지막 step이 한다.
 *
 * 「오답 언급」 열은 참고 지표이며 통과 기준이 아니다. exit code에 쓰지 마라. 오답 보기에서
 * 영문·숫자 토큰을 뽑아 해설에 나오는지 보는 근사값이라, 토큰이 없는 한국어 서술형 보기에서는
 * 판정 자체가 되지 않는다(그런 보기는 분모에서 뺀다). 오답을 설명했는지는 사람이 읽고 판단한다.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'))

/**
 * 해설 길이 하한. phase 27이 ADR-026의 규칙 그대로 쓴 해설 486개(q247~q732)의 실측 최소값이다.
 * 임의로 고른 값이 아니므로 낮추지 마라 — 낮추는 순간 근거가 실측에서 임의값으로 바뀐다.
 * 근거는 ADR-027. 길이는 목표가 아니라 "정답 근거 + 오답 3개"를 담으면 자연히 넘게 되는 선이다.
 */
const MIN_LENGTH = 187

/** 대상 구간의 마지막 문항. 근거는 위 헤더 주석과 ADR-027. */
const LAST_TARGET = 246

const topics = read('src/data/aws/topics.json')
const questions = read('src/data/aws/questions.json')

const target = questions.filter((q) => Number(q.id.slice(1)) <= LAST_TARGET)

/** 오답 보기에서 뽑는 토큰. 2자 이상의 영문·숫자 덩어리만 본다(EC2·Glacier·NLB 따위). */
const tokensOf = (choice) => (choice.match(/[A-Za-z0-9]+/g) ?? []).filter((t) => t.length >= 2)

/**
 * 참고 지표. 정답이 아닌 보기 셋 중 해설이 언급한 것을 센다.
 * 토큰이 없는 보기는 판정할 수 없으므로 분모에서 뺀다.
 */
const distractorMentions = (q) => {
  const explanation = q.explanation.toLowerCase()
  let mentioned = 0
  let judged = 0
  q.choices.forEach((choice, i) => {
    if (i === q.answerIndex) return
    const tokens = tokensOf(choice)
    if (tokens.length === 0) return
    judged += 1
    if (tokens.some((t) => explanation.includes(t.toLowerCase()))) mentioned += 1
  })
  return { mentioned, judged }
}

/** 주제 하나의 집계. rows는 그 주제가 담당하는 대상 문항이다. */
const measure = (topicId) => {
  const rows = target
    .filter((q) => q.topicId === topicId)
    .map((q) => ({ id: q.id, length: q.explanation.length, ...distractorMentions(q) }))
  const lengths = rows.map((r) => r.length)
  return {
    id: topicId,
    rows,
    count: rows.length,
    avg: rows.length ? Math.round(lengths.reduce((a, b) => a + b, 0) / rows.length) : 0,
    min: rows.length ? Math.min(...lengths) : 0,
    short: rows.filter((r) => r.length < MIN_LENGTH).length,
    mentioned: rows.reduce((n, r) => n + r.mentioned, 0),
    judged: rows.reduce((n, r) => n + r.judged, 0),
  }
}

/** 여러 주제의 집계. 평균은 주제 평균이 아니라 문항 길이에서 직접 낸다. */
const summarize = (stats) => {
  const rows = stats.flatMap((s) => s.rows)
  return {
    count: rows.length,
    avg: rows.length ? Math.round(rows.reduce((n, r) => n + r.length, 0) / rows.length) : 0,
    short: rows.filter((r) => r.length < MIN_LENGTH).length,
    mentioned: rows.reduce((n, r) => n + r.mentioned, 0),
    judged: rows.reduce((n, r) => n + r.judged, 0),
  }
}

const wanted = process.argv.slice(2)

if (wanted.length > 0) {
  // 주제를 지정한 경우 — step이 자기 담당을 다 고쳤는지 확인하는 경로다.
  const unknown = wanted.filter((id) => !topics.some((t) => t.id === id))
  if (unknown.length) {
    console.log(`✗ 그런 주제가 없다: ${unknown.join(', ')}`)
    process.exit(1)
  }

  const stats = wanted.map(measure)
  for (const s of stats) {
    console.log(`${s.id} — 대상 문항 ${s.count}개`)
    for (const r of s.rows) {
      const mark = r.length < MIN_LENGTH ? '✗' : '✓'
      console.log(
        `  ${mark} ${r.id}  ${String(r.length).padStart(3)}자` +
        `  오답 언급 ${r.mentioned}/${r.judged}`,
      )
    }
    if (s.count === 0) console.log('  (이 주제에는 q001~q246 구간의 문항이 없다)')
  }

  const { count, avg, short, mentioned, judged } = summarize(stats)

  console.log('')
  console.log(
    `지정한 주제: 문항 ${count}개, 평균 ${avg}자` +
    ` — ${MIN_LENGTH}자 미달 ${short}개, 오답 언급 ${mentioned}/${judged} (참고 지표)`,
  )
  if (short) {
    console.log(`\n위 ✗ 문항의 해설을 다시 써라 — 정답이 왜 맞는지와 오답 셋이 왜 아닌지를 담는다`)
    process.exit(1)
  }
  console.log(`✓ 지정한 주제의 해설이 전부 ${MIN_LENGTH}자 이상이다`)
  process.exit(0)
}

// 인자가 없으면 전체 개요다. 보고 전용이므로 미달이 남아 있어도 exit 0으로 끝난다.
const stats = topics.map((t) => measure(t.id)).filter((s) => s.count > 0)
const width = Math.max(...stats.map((s) => s.id.length))
for (const s of stats) {
  const mark = s.short === 0 ? '✓' : ' '
  console.log(
    `${mark} ${s.id.padEnd(width)}  문항 ${String(s.count).padStart(2)}개` +
    `  평균 ${String(s.avg).padStart(3)}자  최소 ${String(s.min).padStart(3)}자` +
    `  미달 ${String(s.short).padStart(2)}개  오답 언급 ${s.mentioned}/${s.judged}`,
  )
}

const { count, avg, short, mentioned, judged } = summarize(stats)
const outside = topics.length - stats.length

console.log('')
console.log(
  `전체: q001~q${LAST_TARGET} 문항 ${count}개, 평균 ${avg}자` +
  ` — ${MIN_LENGTH}자 미달 ${short}개, 오답 언급 ${mentioned}/${judged} (참고 지표)`,
)
console.log(
  `대상 밖 주제 ${outside}개는 표에서 뺐다 — q${LAST_TARGET + 1} 이후 문항만 있어 늘 통과한다`,
)
