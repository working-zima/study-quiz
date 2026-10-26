#!/usr/bin/env node
/**
 * 구조 스냅샷 갱신: `scripts/topics-baseline.json`의 개념 `name`과 `questionsSha256`만 다시 쓴다.
 *
 * `check-structure.mjs`가 개념 `name`을 스냅샷과 대조하므로, 제목을 명사구로 고치는 phase 32는
 * 갱신 없이는 한 걸음도 나가지 못한다. 그런데 개념이 618개라 손으로 고치면 오타가 들어가고,
 * 오타는 "구조가 바뀌었다"로 보고돼 진짜 사고와 구분되지 않는다.
 *
 * **그렇다고 스냅샷을 통째로 다시 만들면 가드레일이 고무도장이 된다.** 그래서 이 도구는
 * 두 가지만 고치고, 나머지가 어긋나 있으면 **아무것도 쓰지 않고 exit 1로 끝난다.**
 *
 * | 항목 | 이 도구의 처리 |
 * |---|---|
 * | 개념 `name` | 현재 값으로 **갱신한다** |
 * | `questionsSha256` | 현재 파일 해시로 **갱신한다** |
 * | 주제 개수·id·title·importance·sourcePages | 다르면 **거부한다** |
 * | 개념 개수·순서·id | 다르면 **거부한다** |
 * | 개념 parentId | 다르면 **거부한다** (ADR-041 — 구조다) |
 * | `conceptLineCount` | 다르면 **거부한다** (개념을 나누거나 합쳤다는 뜻이다) |
 *
 * 거부되는 것들은 문체 작업으로는 바뀔 수 없는 값이다. 그런 변경을 정말 의도했다면
 * 그것은 구조 변경이므로 이 도구가 아니라 사람이 스냅샷을 고쳐야 한다.
 *
 * 파일은 `JSON.stringify(obj, null, 1)` 형식이다 — 그대로 다시 써도 `questionsSha256` 줄의
 * 콜론 뒤 공백 하나만 달라진다(phase 31이 그 줄만 손으로 고쳤던 흔적이다).
 *
 * 사용법:
 *   node scripts/sync-baseline.mjs            갱신한다
 *   node scripts/sync-baseline.mjs --dry-run  무엇이 바뀌는지만 찍고 쓰지 않는다
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const BASELINE = 'scripts/topics-baseline.json'
const dryRun = process.argv.includes('--dry-run')

const baseline = JSON.parse(readFileSync(join(ROOT, BASELINE), 'utf8'))
const raw = readFileSync(join(ROOT, 'src/data/aws/topics.json'), 'utf8')
const topics = JSON.parse(raw)

const refusals = []

// 개념 한 줄 포맷. 개념을 나누거나 합치면 이 수가 바뀐다 — 문체 작업으로는 바뀌지 않는다.
const lineCount = raw.split('\n').filter((l) => l.startsWith('      {"id":"')).length
if (lineCount !== baseline.conceptLineCount) {
  refusals.push(`conceptLineCount ${baseline.conceptLineCount} → ${lineCount}. 개념 개수나 한 줄 포맷이 바뀌었다`)
}

if (topics.length !== baseline.topics.length) {
  refusals.push(`주제 개수 ${baseline.topics.length} → ${topics.length}`)
}

/** 갱신할 이름. [개념 id, 이전, 이후] */
const renames = []

baseline.topics.forEach((want, i) => {
  const got = topics[i]
  if (!got) {
    refusals.push(`주제 ${i}번(${want.id})이 사라졌다`)
    return
  }
  if (got.id !== want.id) {
    refusals.push(`주제 ${i}번 id: "${want.id}" → "${got.id}"`)
    return
  }
  for (const key of ['title', 'importance']) {
    if (got[key] !== want[key]) refusals.push(`주제 ${want.id} ${key}: "${want[key]}" → "${got[key]}"`)
  }
  if (JSON.stringify(got.sourcePages) !== JSON.stringify(want.sourcePages)) {
    refusals.push(`주제 ${want.id} sourcePages가 바뀌었다`)
  }
  if (got.concepts.length !== want.concepts.length) {
    refusals.push(`주제 ${want.id} 개념 개수: ${want.concepts.length} → ${got.concepts.length}`)
    return
  }

  want.concepts.forEach((wc, j) => {
    const gc = got.concepts[j]
    if (gc.id !== wc.id) {
      refusals.push(`주제 ${want.id} ${j}번 개념 id: "${wc.id}" → "${gc.id}"`)
      return
    }
    if (gc.parentId !== wc.parentId) {
      refusals.push(`개념 ${wc.id} parentId: "${wc.parentId ?? '없음'}" → "${gc.parentId ?? '없음'}"`)
    }
    if (gc.name !== wc.name) renames.push([wc.id, wc.name, gc.name])
  })
})

if (refusals.length) {
  console.log('구조가 어긋나 있어 갱신하지 않는다 — 이것들은 문체 작업으로 바뀔 수 없는 값이다\n')
  for (const r of refusals) console.log(`  ✗ ${r}`)
  console.log(`\n거부 ${refusals.length}건. 되돌리고 다시 돌려라.`)
  process.exit(1)
}

const sha = createHash('sha256').update(readFileSync(join(ROOT, 'src/data/aws/questions.json'))).digest('hex')
const shaChanged = sha !== baseline.questionsSha256

if (!renames.length && !shaChanged) {
  console.log('✓ 갱신할 것이 없다 — 개념 name과 questionsSha256이 이미 현재 데이터와 같다')
  process.exit(0)
}

for (const [id, before, after] of renames) {
  console.log(`  ${id}\n    "${before}"\n  → "${after}"`)
}
if (shaChanged) console.log(`  questionsSha256 ${baseline.questionsSha256.slice(0, 8)}… → ${sha.slice(0, 8)}…`)

if (dryRun) {
  console.log(`\n(--dry-run) 개념 name ${renames.length}건, 해시 ${shaChanged ? 1 : 0}건을 쓰지 않고 끝낸다`)
  process.exit(0)
}

baseline.questionsSha256 = sha
baseline.topics.forEach((want, i) => {
  want.concepts.forEach((wc, j) => {
    wc.name = topics[i].concepts[j].name
  })
})

writeFileSync(join(ROOT, BASELINE), `${JSON.stringify(baseline, null, 1)}\n`)
console.log(`\n✓ ${BASELINE} 갱신 — 개념 name ${renames.length}건, questionsSha256 ${shaChanged ? '갱신' : '그대로'}`)
