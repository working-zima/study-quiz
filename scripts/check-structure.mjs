#!/usr/bin/env node
/**
 * 구조 가드레일: 개념 본문 외의 것이 의도치 않게 바뀌지 않았는지 검사한다.
 *
 * 본문 손질은 summary·paragraphs만 바꾼다. 개념 id·name·parentId, 주제 메타데이터, 개념 개수와
 * 순서, 문항 파일은 그대로여야 한다. 이유: 문항이 conceptId로 개념을 참조하고
 * src/data/aws/data.test.ts가 개념 개수·주제 메타데이터를 하드코딩으로 검증한다.
 *
 * 기준은 scripts/topics-baseline.json (현재 구조 스냅샷)이다.
 * 구조를 의도적으로 바꿨다면 이 스냅샷도 같은 커밋에서 갱신한다.
 *
 * 사용법: node scripts/check-structure.mjs
 * 위반이 있으면 exit 1.
 */
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const problems = []

const baseline = JSON.parse(readFileSync(join(ROOT, 'scripts/topics-baseline.json'), 'utf8'))
const raw = readFileSync(join(ROOT, 'src/data/aws/topics.json'), 'utf8')
const topics = JSON.parse(raw)

// 1. 개념 한 줄 포맷 — 개념 하나가 한 줄이어야 diff를 사람이 읽을 수 있다.
const lines = raw.split('\n').filter((l) => l.startsWith('      {"id":"')).length
if (lines !== baseline.conceptLineCount) {
  problems.push(
    `개념 한 줄 포맷이 깨졌다: ${lines}줄 (기준 ${baseline.conceptLineCount}줄).\n` +
    `    개념 하나는 \`      {"id":"...","name":"...","summary":"...","paragraphs":[...]},\` 형태로\n` +
    `    정확히 한 줄에 있어야 한다. JSON 라이브러리로 파일 전체를 재직렬화하면 이 포맷이 깨진다.`,
  )
}

// 2. 주제 메타데이터
if (topics.length !== baseline.topics.length) {
  problems.push(`주제 개수가 ${baseline.topics.length} → ${topics.length}로 바뀌었다`)
}
baseline.topics.forEach((want, i) => {
  const got = topics[i]
  if (!got) {
    problems.push(`주제 ${i}번(${want.id})이 사라졌다`)
    return
  }
  for (const key of ['id', 'title', 'importance']) {
    if (got[key] !== want[key]) {
      problems.push(`주제 ${i}번 ${key}: "${want[key]}" → "${got[key]}"`)
    }
  }
  if (JSON.stringify(got.sourcePages) !== JSON.stringify(want.sourcePages)) {
    problems.push(`주제 ${want.id} sourcePages: ${JSON.stringify(want.sourcePages)} → ${JSON.stringify(got.sourcePages)}`)
  }

  // 3. 개념 id·name·parentId·개수·순서
  if (got.concepts.length !== want.concepts.length) {
    problems.push(`주제 ${want.id} 개념 개수: ${want.concepts.length} → ${got.concepts.length}`)
  }
  want.concepts.forEach((wc, j) => {
    const gc = got.concepts[j]
    if (!gc) {
      problems.push(`개념 ${wc.id}가 사라졌다`)
      return
    }
    if (gc.id !== wc.id) problems.push(`주제 ${want.id} ${j}번 개념 id: "${wc.id}" → "${gc.id}"`)
    if (gc.name !== wc.name) problems.push(`개념 ${wc.id} name: "${wc.name}" → "${gc.name}"`)
    if (gc.parentId !== wc.parentId) {
      problems.push(`개념 ${wc.id} parentId: "${wc.parentId ?? '없음'}" → "${gc.parentId ?? '없음'}"`)
    }
  })
})

// 4. 문항 파일 불변
const sha = createHash('sha256').update(readFileSync(join(ROOT, 'src/data/aws/questions.json'))).digest('hex')
if (sha !== baseline.questionsSha256) {
  problems.push(
    'src/data/aws/questions.json이 바뀌었다.\n' +
    '    문항의 정답 근거가 사라졌다면 문항이 아니라 개념 본문을 보강해서 해결하라.\n' +
    '    문항을 의도적으로 고쳤다면 scripts/topics-baseline.json의 questionsSha256을 갱신하라.',
  )
}

if (problems.length) {
  for (const p of problems) console.log(`✗ ${p}`)
  console.log(`\n구조 위반 ${problems.length}건`)
  process.exit(1)
}
console.log('✓ 구조 이상 없음 — 개념 id·name·parentId, 주제 메타데이터, 개념 개수·순서, 문항 파일 모두 기준과 같다')
