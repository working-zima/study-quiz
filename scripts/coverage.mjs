#!/usr/bin/env node
/**
 * 개념 커버리지: 개념 하나하나에 문항이 붙어 있는지 검사한다.
 *
 * 이 앱의 주 학습 경로는 "확인 문제를 반복해 풀고 틀린 것만 개념으로 되짚는다"이므로,
 * 문항이 가리키지 않는 개념은 그 경로에서 아예 배울 수 없는 사각지대다. 그래서 문제 은행의
 * 크기 기준이 중요도 비례 배분이 아니라 개념 커버리지다 — 근거는 ADR-026.
 *
 * 사용법:
 *   node scripts/coverage.mjs              주제별 커버리지 표와 전체 비율
 *   node scripts/coverage.mjs <topicId>…   주어진 주제만. 덮이지 않은 개념 id를 전부 찍는다
 *
 * exit code는 검사한 범위가 전부 덮였는가다 — 덮이지 않은 개념이 하나라도 있으면 exit 1.
 * 인자를 주면 그 주제만, 안 주면 문제 은행 전체가 범위다.
 *
 * npm test·npm run build에 엮지 마라. step 20이 커버리지를 테스트로 고정할 때까지는
 * 덜 덮인 상태가 정상이고, 빌드를 막으면 문항을 채우는 step들이 진행되지 않는다.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'))

const topics = read('src/data/aws/topics.json')
const questions = read('src/data/aws/questions.json')

const coveredConcepts = new Set(questions.map((q) => q.conceptId))
const questionCount = new Map()
for (const q of questions) {
  questionCount.set(q.topicId, (questionCount.get(q.topicId) ?? 0) + 1)
}

/** 주제 하나의 커버리지. uncovered는 문항이 가리키지 않는 개념 id다. */
const measure = (topic) => {
  const uncovered = topic.concepts.filter((c) => !coveredConcepts.has(c.id)).map((c) => c.id)
  return {
    id: topic.id,
    total: topic.concepts.length,
    covered: topic.concepts.length - uncovered.length,
    questions: questionCount.get(topic.id) ?? 0,
    uncovered,
  }
}

const pct = (covered, total) => (total === 0 ? 100 : Math.round((covered / total) * 100))

const wanted = process.argv.slice(2)

if (wanted.length > 0) {
  // 주제를 지정한 경우 — step이 자기 담당을 다 덮었는지 확인하는 경로다.
  const unknown = wanted.filter((id) => !topics.some((t) => t.id === id))
  if (unknown.length) {
    console.log(`✗ 그런 주제가 없다: ${unknown.join(', ')}`)
    process.exit(1)
  }

  const rows = wanted.map((id) => measure(topics.find((t) => t.id === id)))
  const width = Math.max(...rows.map((r) => r.id.length))
  for (const r of rows) {
    console.log(
      `${r.id.padEnd(width)}  ${String(r.covered).padStart(3)}/${String(r.total).padEnd(3)}` +
      `  ${String(pct(r.covered, r.total)).padStart(3)}%  문항 ${r.questions}개`,
    )
    for (const id of r.uncovered) console.log(`    ✗ ${id}`)
  }

  const remaining = rows.reduce((n, r) => n + r.uncovered.length, 0)
  if (remaining) {
    console.log(`\n덮이지 않은 개념 ${remaining}개 — 위 ✗ 개념마다 문항을 하나 이상 만들어라`)
    process.exit(1)
  }
  console.log('\n✓ 지정한 주제의 개념이 전부 덮였다')
  process.exit(0)
}

// 인자가 없으면 전체 개요다.
const rows = topics.map(measure)
const width = Math.max(...rows.map((r) => r.id.length))
for (const r of rows) {
  const mark = r.uncovered.length === 0 ? '✓' : ' '
  console.log(
    `${mark} ${r.id.padEnd(width)}  ${String(r.covered).padStart(3)}/${String(r.total).padEnd(3)}` +
    `  ${String(pct(r.covered, r.total)).padStart(3)}%  문항 ${String(r.questions).padStart(3)}개`,
  )
}

const total = rows.reduce((n, r) => n + r.total, 0)
const covered = rows.reduce((n, r) => n + r.covered, 0)
const empty = rows.filter((r) => r.questions === 0).map((r) => r.id)

console.log('')
console.log(
  `전체: 개념 ${total}개 중 ${covered}개 덮임 (${pct(covered, total)}%)` +
  ` — 남은 개념 ${total - covered}개, 문항 ${questions.length}개`,
)
console.log(
  empty.length
    ? `문항이 하나도 없는 주제 ${empty.length}개: ${empty.join(', ')}`
    : '문항이 하나도 없는 주제는 없다',
)

process.exit(covered === total ? 0 : 1)
