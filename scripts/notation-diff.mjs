#!/usr/bin/env node
/**
 * 표기 치환 검사: 이번 phase의 변경이 **용어 표기 치환뿐인지**를 기계로 확인한다.
 *
 * phase 33은 phase 32와 달리 `paragraphs`와 `explanation`을 연다. 같은 대상을 두 이름으로
 * 부르는 자리가 그 두 필드에 걸쳐 있어서, 열지 않으면 통일할 수 없기 때문이다. 그런데 두
 * 필드를 열면 phase 32가 가졌던 안전망이 사라진다 — 사용자가 건 제한을 그대로 옮긴다.
 *
 * > 이번 phase의 목적은 용어 표기 통일뿐이다.
 * > 사실관계, 정답 논리, 문항 구조, 수치나 조건은 변경하지 마.
 * > paragraphs와 explanation도 이번 phase에서는 필요한 범위에 한해 수정 가능하게 하되,
 * > **표기 치환 외의 문장 수정은 하지 마.**
 *
 * 그래서 이 도구는 「무엇이 바뀌었나」가 아니라 **「바뀐 것이 표기 치환으로 설명되나」**를 본다.
 *
 * ## 방법 — 정규화 후 대조
 *
 * 아래 표의 한 줄에 있는 낱말들은 같은 대상의 다른 이름이다. 텍스트에서 그것들을 모두 같은
 * 자리표(`⟨KEY⟩`)로 바꾼 뒤 기준 커밋과 대조한다.
 *
 *   정규화한 것이 같다  → 바뀐 것은 표기뿐이다. 통과
 *   정규화해도 다르다   → 표기 말고 다른 것이 바뀌었다. **exit 1**
 *
 * 부분 치환(어떤 자리는 바꾸고 어떤 자리는 그대로 두기)도 그대로 통과한다. SNS의 `토픽`만
 * 바꾸고 Kafka의 `토픽`은 두는 것, EMR의 `주 노드`만 바꾸고 ElastiCache의 것은 두는 것이
 * 이번 phase의 요구라 이 성질이 필요하다.
 *
 * 낱말이 겹칠 때는 **긴 것부터** 바꾼다. `AWS IAM Identity Center` ⊃ `IAM Identity Center`
 * ⊃ `Identity Center`가 그런 자리다.
 *
 * ## 이 도구가 잡지 못하는 것
 *
 * 같은 줄에 있는 두 낱말을 서로 바꾸는 것은 정의상 통과한다(그것이 이 phase가 하는 일이다).
 * **어느 방향으로 바꿨는지가 맞는지는 사람이 판단한다** — 표 아래의 `standard`가 그 판정이고,
 * 도구는 마지막에 표준이 아닌 표기가 몇 건 남았는지 세어 찍는다(exit code에는 넣지 않는다.
 * 문맥상 남겨야 하는 자리가 있기 때문이다 — 약칭 도입, 다른 서비스의 같은 낱말).
 *
 * 사용법:
 *   node scripts/notation-diff.mjs <ref>          기준 커밋과 대조한다
 *   node scripts/notation-diff.mjs <ref> --list   바뀐 항목의 id를 전부 찍는다
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const TOPICS = 'src/data/aws/topics.json'
const QUESTIONS = 'src/data/aws/questions.json'

/**
 * 이번 phase가 통일하기로 한 표기. `variants`는 같은 대상의 다른 이름이고,
 * `standard`는 사용자가 정한 표준이다. 근거는 phase 33 명세에 있다.
 *
 * `Deny ↔ 거부`는 **여기 없다.** 표기 갈림이 아니라 IAM 정책의 `Effect` 값과 그 동작을
 * 설명하는 서술어라서, 사용자가 작업 대상에서 뺐다.
 */
const TERMS = [
  // 첫 등장에서 일반명사와 구분하려고 서비스 이름을 붙인 `SNS 주제`도 같은 대상이다.
  // 착수 시점에 있던 `SNS 토픽` 17곳과 짝이 맞아야 하므로 그 형태도 함께 넣는다.
  // `알림 주제`는 sqs-fifo-deduplication-id가 쓰던 또 다른 이름이다.
  { key: 'SNS_TOPIC', standard: 'SNS 주제(첫 등장)·주제(이후)', variants: ['SNS 주제', 'SNS 토픽', '알림 주제', '토픽', '주제'] },
  // ADR-015가 약어를 처음 쓸 때 풀어 주므로 `FIFO(First In First Out) 큐` 꼴이 따로 있다.
  // 삽입형을 짝으로 넣지 않으면 그 자리를 고칠 때 위반으로 잡힌다.
  { key: 'FIFO_QUEUE', standard: 'FIFO 대기열', variants: ['FIFO(First In First Out) 대기열', 'FIFO(First In First Out) 큐', 'FIFO 대기열', 'FIFO 큐'] },
  { key: 'NETWORK_ACL', standard: '네트워크 ACL', variants: ['네트워크 접근 제어 목록', '네트워크 ACL'] },
  { key: 'PERMISSION_SET', standard: '권한 세트', variants: ['권한 세트', 'Permission Set'] },
  { key: 'ACCESS_KEY', standard: '액세스 키', variants: ['액세스 키', 'Access Key'] },
  { key: 'IDENTITY_CENTER', standard: 'IAM Identity Center', variants: ['AWS IAM Identity Center', 'IAM Identity Center', 'Identity Center'] },
  { key: 'VGW', standard: '가상 프라이빗 게이트웨이', variants: ['가상 프라이빗 게이트웨이', 'Virtual Private Gateway'] },
  { key: 'EMR_PRIMARY', standard: '프라이머리 노드', variants: ['프라이머리 노드', '주 노드'] },
  { key: 'PERF_INSIGHTS', standard: 'Performance Insights', variants: ['Performance Insights', 'Performance Insight'] },
  { key: 'HSM', standard: '전용 하드웨어 보안 모듈', variants: ['전용 하드웨어 보안 모듈', '전용 하드웨어 모듈'] },
  { key: 'SPEECH', standard: '음성', variants: ['음성', '말소리'] },
  { key: 'PUBLIC_IP', standard: '퍼블릭 IP', variants: ['퍼블릭 IP', '퍼블릭 주소'] },
  { key: 'IP_SET', standard: 'IP 세트', variants: ['IP 세트', 'IP Set'] },
  { key: 'BILLING_CONSOLE', standard: '결제 콘솔', variants: ['결제 콘솔', '결제 대시보드'] },
  { key: 'BASE_LOAD', standard: '기본 부하', variants: ['기본 부하', '기준이 되는 부하'] },
  // 아래 둘은 표기 갈림이 아니라 **약칭 도입 자리**다. step 10이 첫 등장에 정식 이름을 덧붙여
  // `VIF` → `가상 인터페이스(VIF)`가 됐는데, 짝이 없으면 그것이 문장 수정으로 잡힌다.
  // 그래서 대조용으로만 둔다 — 아래 잔량 표의 이 두 줄은 「통일이 덜 됐다」는 뜻이 아니다.
  // `OU`는 단어 경계를 보지 못해 `SELECT INTO OUTFILE S3` 4건을 함께 센다(잔량 표시만 부풀고 대조에는 영향이 없다).
  { key: 'VIRTUAL_IF', standard: '가상 인터페이스', variants: ['가상 인터페이스(VIF)', '가상 인터페이스', 'VIF'] },
  { key: 'ORG_UNIT', standard: '조직 단위', variants: ['조직 단위(OU)', '조직 단위', 'OU'] },
]

/** 긴 낱말부터 바꿔야 `IAM Identity Center`가 `Identity Center`에 먼저 걸리지 않는다. */
const REPLACEMENTS = TERMS.flatMap((t) => t.variants.map((v) => [v, `⟨${t.key}⟩`])).sort(
  (a, b) => b[0].length - a[0].length,
)

/**
 * 자리표 바로 뒤에 오는 **조사**. 낱말을 바꾸면 받침이 달라져 조사가 함께 바뀌는데,
 * 그것은 한국어 문법이 강제하는 것이지 문장을 손댄 것이 아니다.
 * `토픽`(받침 ㄱ) → `주제`(받침 없음)이면 `토픽이` → `주제가`가 **되어야 맞다.**
 * 그래서 자리표 뒤의 조사도 한 자리표로 눌러 대조한다.
 *
 * 긴 것부터 적어야 `이라는`이 `이`에 먼저 걸리지 않는다.
 */
const PARTICLES = [
  // 계사(-이다)의 활용도 받침에 따라 갈린다. `토픽이어야` → `주제여야`가 그 자리다.
  '이어야', '여야', '이어서', '여서', '이에요', '예요', '이었', '였',
  '이라는', '라는', '이라고', '라고', '이라야', '라야', '이라도', '라도',
  '이라서', '라서', '이라', '라', '이란', '란', '이나', '나', '이며', '며',
  '으로', '로', '이야', '야', '와', '과', '이', '가', '을', '를', '은', '는',
]
/**
 * 자리표와 조사 사이에 마크다운 강조가 낀다. 본문이 용어를 `**권한 세트**`로 굵게 쓰기
 * 때문이다. `**Permission Set**을` → `**권한 세트**를`도 받침이 강제하는 교체이므로
 * 강조 기호를 사이에 허용한다.
 */
const PARTICLE_AFTER = new RegExp(`(⟨[A-Z_]+⟩)([*\`]{0,2})(${PARTICLES.join('|')})`, 'g')

const normalize = (text) => {
  let out = String(text)
  for (const [from, to] of REPLACEMENTS) out = out.split(from).join(to)
  // 자리표 뒤의 조사를 한 자리로 누른다. 두 번 돌리는 이유는 자리표가 잇달아 나올 때다.
  out = out.replace(PARTICLE_AFTER, '$1$2⟨J⟩').replace(PARTICLE_AFTER, '$1$2⟨J⟩')
  return out
}

const [ref, ...flags] = process.argv.slice(2)
const showList = flags.includes('--list')

if (!ref) {
  console.error('기준 커밋을 넘겨라: node scripts/notation-diff.mjs <ref> [--list]')
  process.exit(2)
}

const atRef = (path) => {
  try {
    return JSON.parse(execFileSync('git', ['show', `${ref}:${path}`], { cwd: ROOT, maxBuffer: 1 << 28 }))
  } catch {
    console.error(`${ref}:${path}를 읽을 수 없다.`)
    process.exit(2)
  }
}
const now = (path) => JSON.parse(readFileSync(join(ROOT, path), 'utf8'))

const baseTopics = atRef(TOPICS)
const headTopics = now(TOPICS)
const baseQuestions = atRef(QUESTIONS)
const headQuestions = now(QUESTIONS)

/** 어떤 경우에도 바뀌면 안 되는 것. */
const structural = []
/** 표기 치환으로 설명되지 않는 변경. */
const unexplained = []
/** 표기 치환으로 설명된 변경. 필드별로 센다. */
const changed = {}
const answerTouched = []

const note = (field, id) => {
  ;(changed[field] ??= []).push(id)
}

/** 두 텍스트를 견준다. 같으면 무시, 표기만 다르면 기록, 그 밖이면 위반이다. */
const compare = (field, id, before, after) => {
  if (before === after) return false
  if (normalize(before) === normalize(after)) {
    note(field, id)
    return true
  }
  unexplained.push({ field, id, before, after })
  return true
}

// ── 개념 ────────────────────────────────────────────────────────────────────
if (baseTopics.length !== headTopics.length) structural.push(`주제 개수 ${baseTopics.length} → ${headTopics.length}`)

baseTopics.forEach((base, i) => {
  const head = headTopics[i]
  if (!head || head.id !== base.id) {
    structural.push(`주제 ${i}번(${base.id}) 순서나 id가 바뀌었다`)
    return
  }
  for (const key of ['title', 'importance']) {
    if (head[key] !== base[key]) structural.push(`주제 ${base.id} ${key}가 바뀌었다`)
  }
  if (JSON.stringify(base.sourcePages) !== JSON.stringify(head.sourcePages)) {
    structural.push(`주제 ${base.id} sourcePages가 바뀌었다`)
  }
  if (base.concepts.length !== head.concepts.length) {
    structural.push(`주제 ${base.id} 개념 개수 ${base.concepts.length} → ${head.concepts.length}`)
    return
  }
  base.concepts.forEach((bc, j) => {
    const hc = head.concepts[j]
    if (hc.id !== bc.id) {
      structural.push(`개념 ${j}번 id ${bc.id} → ${hc.id}`)
      return
    }
    if (bc.paragraphs.length !== hc.paragraphs.length) {
      structural.push(`개념 ${bc.id} 문단 개수 ${bc.paragraphs.length} → ${hc.paragraphs.length}`)
      return
    }
    compare('개념 name', bc.id, bc.name, hc.name)
    compare('개념 summary', bc.id, bc.summary, hc.summary)
    bc.paragraphs.forEach((p, k) => compare('개념 paragraphs', `${bc.id}[${k}]`, p, hc.paragraphs[k]))
  })
})

// ── 문항 ────────────────────────────────────────────────────────────────────
if (baseQuestions.length !== headQuestions.length) {
  structural.push(`문항 개수 ${baseQuestions.length} → ${headQuestions.length}`)
}

baseQuestions.forEach((base, i) => {
  const head = headQuestions[i]
  if (!head || head.id !== base.id) {
    structural.push(`문항 ${i}번(${base.id}) 순서나 id가 바뀌었다`)
    return
  }
  for (const key of ['topicId', 'conceptId', 'answerIndex']) {
    if (head[key] !== base[key]) {
      structural.push(`문항 ${base.id} ${key}: ${JSON.stringify(base[key])} → ${JSON.stringify(head[key])}`)
    }
  }
  if (base.choices.length !== head.choices.length) {
    structural.push(`문항 ${base.id} 보기 개수 ${base.choices.length} → ${head.choices.length}`)
    return
  }
  compare('문항 prompt', base.id, base.prompt, head.prompt)
  base.choices.forEach((c, k) => {
    const isAnswer = k === base.answerIndex
    if (compare(`문항 choices`, `${base.id} c${k}${isAnswer ? '★' : ''}`, c, head.choices[k]) && isAnswer) {
      answerTouched.push(base.id)
    }
  })
  compare('문항 explanation', base.id, base.explanation, head.explanation)
})

// ── 표준이 아닌 표기가 몇 건 남았나 ─────────────────────────────────────────
const slots = []
for (const t of headTopics) {
  for (const c of t.concepts) {
    slots.push(c.name, c.summary, ...c.paragraphs)
  }
}
for (const q of headQuestions) slots.push(q.prompt, ...q.choices, q.explanation)

/**
 * 낱말이 서로를 품을 때(`Performance Insights` ⊃ `Performance Insight`) 부분 문자열로 두 번
 * 세지 않도록, **긴 표기부터 소진**하며 센다. 센 자리는 지워 다음 표기가 다시 세지 못하게 한다.
 */
const remaining = TERMS.map((t) => {
  const ordered = [...t.variants].sort((a, b) => b.length - a.length)
  const tally = new Map(ordered.map((v) => [v, 0]))
  for (const raw of slots) {
    let text = raw
    for (const v of ordered) {
      const parts = text.split(v)
      if (parts.length > 1) {
        tally.set(v, tally.get(v) + parts.length - 1)
        text = parts.join('\u0000')
      }
    }
  }
  return { key: t.key, standard: t.standard, counts: t.variants.map((v) => [v, tally.get(v)]) }
})

// ── 출력 ────────────────────────────────────────────────────────────────────
console.log(`기준: ${ref}\n`)
console.log('표기 치환으로 설명된 변경 — 필드별')
const order = ['개념 name', '개념 summary', '개념 paragraphs', '문항 prompt', '문항 choices', '문항 explanation']
let total = 0
for (const f of order) {
  const ids = changed[f] ?? []
  total += ids.length
  console.log(`  ${f.padEnd(18)} ${String(ids.length).padStart(4)}건`)
  if (showList && ids.length) for (const id of ids) console.log(`                     ${id}`)
}
console.log(`  ${'합계'.padEnd(17)} ${String(total).padStart(4)}건`)

if (answerTouched.length) {
  console.log(`\n정답 보기의 글자가 바뀐 문항 ${new Set(answerTouched).size}건`)
  for (const id of new Set(answerTouched)) console.log(`  ${id}`)
}

console.log('\n표준이 아닌 표기가 남은 자리 — 문맥상 남겨야 하는 것이 있으므로 0이 목표가 아니다')
for (const r of remaining) {
  const off = r.counts.filter(([v]) => v !== r.standard && !r.standard.includes(v) && !v.includes(r.standard))
  const line = r.counts.map(([v, n]) => `${v} ${n}`).join(' / ')
  const flag = off.some(([, n]) => n > 0) ? ' ←' : '  '
  console.log(`  ${flag} [${r.standard}] ${line}`)
}

if (structural.length) {
  console.log('\n구조가 바뀌었다 — 어떤 경우에도 허용되지 않는다')
  for (const s of structural) console.log(`  ✗ ${s}`)
}

if (unexplained.length) {
  console.log(`\n표기 치환으로 설명되지 않는 변경 ${unexplained.length}건 — 문장을 손댔다`)
  for (const u of unexplained.slice(0, 20)) {
    // 앞부분이 아니라 **처음 갈라지는 자리**를 보여 준다. 긴 해설에서 앞 110자만 찍으면
    // 두 줄이 똑같이 보여 무엇을 고쳐야 할지 알 수 없다.
    // **정규화한 문자열**에서 갈리는 자리를 보여 준다. 원문에서 처음 갈리는 자리는
    // 대개 정당한 표기 치환이라, 그것을 찍으면 무엇이 위반인지 알 수 없다.
    const nb = normalize(u.before)
    const na = normalize(u.after)
    let i = 0
    while (i < nb.length && i < na.length && nb[i] === na[i]) i++
    const from = Math.max(0, i - 40)
    const cut = (t) => `${from > 0 ? '…' : ''}${t.slice(from, i + 70)}${i + 70 < t.length ? '…' : ''}`
    console.log(`  ✗ ${u.field} ${u.id} — 표기를 눌러 대조하면 ${i}번째부터 갈린다`)
    console.log(`      이전: ${cut(nb)}`)
    console.log(`      이후: ${cut(na)}`)
  }
  if (unexplained.length > 20) console.log(`  …외 ${unexplained.length - 20}건`)
}

if (structural.length || unexplained.length) {
  console.log(`\n위반 ${structural.length + unexplained.length}건`)
  process.exit(1)
}

console.log('\n✓ 바뀐 것이 전부 표기 치환으로 설명된다 — 문장·수치·조건·정답 논리는 그대로다')
