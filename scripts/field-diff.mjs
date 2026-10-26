#!/usr/bin/env node
/**
 * 필드 단위 diff: 어떤 필드가 바뀌었고 어떤 필드가 그대로인지를 기준 커밋과 대조해 센다.
 *
 * phase 32의 범위는 개념 `name`·`summary`와 문항 `prompt`·`choices` 넷뿐이다. 나머지는
 * 전부 **얼어 있다** — 특히 개념 `paragraphs`와 문항 `explanation`은 phase 31이 이미
 * 다시 썼고, 문항 `answerIndex`는 정답 자체다. 사용자가 제한으로 못 박은 것을 그대로 옮긴다.
 *
 * > - AWS 사실관계나 정답 논리를 새로 해석하거나 변경하지 말 것
 * > - 문항의 정답 선택지가 바뀔 수 있는 수정은 하지 말 것
 * > - 수치, 조건, 서비스 특성, 제한 사항은 그대로 유지할 것
 *
 * `git diff --stat`으로는 이것을 볼 수 없다. `topics.json`은 개념 하나가 한 줄이라
 * `name`만 고쳐도 `paragraphs`가 든 줄 전체가 바뀐 것으로 찍히기 때문이다. 그래서 두 파일을
 * 파싱해 **필드별로** 비교한다.
 *
 * 얼어 있는 필드가 하나라도 바뀌면 **exit 1**이다. 이것이 이 도구를 만든 이유다 —
 * 문체를 다듬다가 사실이 딸려 바뀌는 것을 기계가 잡을 수 있는 유일한 지점이다.
 * 반대로 범위 안 필드는 몇 건이 바뀌었는지 세어 찍기만 한다. 몇 건을 고쳤는지가 성과가
 * 아니므로 하한도 상한도 두지 않는다.
 *
 * 사용법:
 *   node scripts/field-diff.mjs <ref>          기준 커밋과 워킹 트리를 대조한다
 *   node scripts/field-diff.mjs <ref> --list   바뀐 항목의 id를 전부 찍는다
 *
 * <ref>는 git이 아는 것이면 무엇이든 된다 (`develop`, 커밋 해시, `HEAD~3`).
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const TOPICS = 'src/data/aws/topics.json'
const QUESTIONS = 'src/data/aws/questions.json'

const [ref, ...flags] = process.argv.slice(2)
const showList = flags.includes('--list')

if (!ref) {
  console.error('기준 커밋을 넘겨라: node scripts/field-diff.mjs <ref> [--list]')
  process.exit(2)
}

/** 기준 커밋의 파일. 워킹 트리가 아니라 git 객체에서 읽는다. */
const atRef = (path) => {
  try {
    return JSON.parse(execFileSync('git', ['show', `${ref}:${path}`], { cwd: ROOT, maxBuffer: 1 << 28 }))
  } catch {
    console.error(`${ref}:${path}를 읽을 수 없다. ref가 맞는지 확인해라.`)
    process.exit(2)
  }
}

const now = (path) => JSON.parse(readFileSync(join(ROOT, path), 'utf8'))

const baseTopics = atRef(TOPICS)
const headTopics = now(TOPICS)
const baseQuestions = atRef(QUESTIONS)
const headQuestions = now(QUESTIONS)

/** 얼어 있는 필드의 위반. 하나라도 있으면 exit 1이다. */
const frozen = []
/** 범위 안 필드의 변경. 세어 찍기만 한다. */
const changed = { name: [], summary: [], prompt: [], choices: [] }

const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b)

// ── 주제와 개념 ──────────────────────────────────────────────────────────────
if (baseTopics.length !== headTopics.length) {
  frozen.push(`주제 개수: ${baseTopics.length} → ${headTopics.length}`)
}

baseTopics.forEach((base, i) => {
  const head = headTopics[i]
  if (!head) {
    frozen.push(`주제 ${base.id}가 사라졌다`)
    return
  }
  if (head.id !== base.id) {
    frozen.push(`주제 ${i}번 순서: ${base.id} → ${head.id}`)
    return
  }
  for (const key of ['title', 'importance']) {
    if (head[key] !== base[key]) frozen.push(`주제 ${base.id} ${key}: "${base[key]}" → "${head[key]}"`)
  }
  if (!eq(base.sourcePages, head.sourcePages)) frozen.push(`주제 ${base.id} sourcePages가 바뀌었다`)
  if (base.concepts.length !== head.concepts.length) {
    frozen.push(`주제 ${base.id} 개념 개수: ${base.concepts.length} → ${head.concepts.length}`)
    return
  }

  base.concepts.forEach((bc, j) => {
    const hc = head.concepts[j]
    if (hc.id !== bc.id) {
      frozen.push(`주제 ${base.id} ${j}번 개념 id: ${bc.id} → ${hc.id}`)
      return
    }
    if (!eq(bc.paragraphs, hc.paragraphs)) {
      frozen.push(`개념 ${bc.id} paragraphs가 바뀌었다 — phase 31이 쓴 본문이다. 되돌려라`)
    }
    if (bc.name !== hc.name) changed.name.push(bc.id)
    if (bc.summary !== hc.summary) changed.summary.push(bc.id)
  })
})

// ── 문항 ────────────────────────────────────────────────────────────────────
if (baseQuestions.length !== headQuestions.length) {
  frozen.push(`문항 개수: ${baseQuestions.length} → ${headQuestions.length}`)
}

const headQuestionById = new Map(headQuestions.map((q) => [q.id, q]))

baseQuestions.forEach((base, i) => {
  const head = headQuestions[i] ?? headQuestionById.get(base.id)
  if (!head) {
    frozen.push(`문항 ${base.id}가 사라졌다`)
    return
  }
  if (headQuestions[i]?.id !== base.id) frozen.push(`문항 ${i}번 순서: ${base.id} → ${headQuestions[i]?.id}`)
  for (const key of ['topicId', 'conceptId', 'answerIndex']) {
    if (head[key] !== base[key]) {
      frozen.push(`문항 ${base.id} ${key}: ${JSON.stringify(base[key])} → ${JSON.stringify(head[key])}`)
    }
  }
  if (base.explanation !== head.explanation) {
    frozen.push(`문항 ${base.id} explanation이 바뀌었다 — phase 31이 쓴 해설이다. 되돌려라`)
  }
  if (base.choices.length !== head.choices.length) {
    frozen.push(`문항 ${base.id} 보기 개수: ${base.choices.length} → ${head.choices.length}`)
    return
  }
  if (base.prompt !== head.prompt) changed.prompt.push(base.id)
  const movedChoices = base.choices.filter((c, k) => c !== head.choices[k])
  if (movedChoices.length) {
    const touchesAnswer = base.choices[base.answerIndex] !== head.choices[base.answerIndex]
    changed.choices.push(touchesAnswer ? `${base.id}(정답 보기 포함)` : base.id)
  }
})

// ── 출력 ────────────────────────────────────────────────────────────────────
console.log(`기준: ${ref}\n`)
console.log('범위 안 필드 — 바꿔도 되는 넷')
for (const key of ['name', 'summary', 'prompt', 'choices']) {
  console.log(`  ${key.padEnd(8)} ${String(changed[key].length).padStart(4)}건`)
  if (showList && changed[key].length) {
    for (const id of changed[key]) console.log(`             ${id}`)
  }
}

const answerTouched = changed.choices.filter((id) => id.endsWith('(정답 보기 포함)'))
if (answerTouched.length) {
  console.log(
    `\n  ⚠ 정답 보기의 글자가 바뀐 문항 ${answerTouched.length}건. ` +
      '보기의 기술적 의미가 그대로인지 사람이 한 번 더 읽어라.',
  )
  if (!showList) for (const id of answerTouched) console.log(`      ${id}`)
}

if (frozen.length) {
  console.log('\n얼어 있는 필드가 바뀌었다 — 범위를 넘었다')
  for (const p of frozen) console.log(`  ✗ ${p}`)
  console.log(`\n위반 ${frozen.length}건`)
  process.exit(1)
}

console.log('\n✓ 얼어 있는 필드는 그대로다 — paragraphs·explanation·answerIndex·id·순서·주제 메타데이터')
