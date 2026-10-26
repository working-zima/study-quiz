#!/usr/bin/env node
/**
 * 전사 가드레일: 개념 본문이 원본을 그대로 옮겨 적지 않았는지 검사한다.
 *
 * 개념 본문은 사실만 원본에서 가져오고 문장은 직접 쓴다. 이유: 원본
 * docs/source/concepts-raw.md는 외부 참고 자료의 추출 전문이라, 전사하면 저장소를
 * 공개할 때 원문이 그대로 공개된다. 근거는 ADR-009.
 *
 * 공백·문장부호를 지운 뒤 원본과 32자 이상 연속으로 일치하는 구간을 잡아낸다.
 * 임계값 32자는 1-exam-gaps 개념 77개가 전부 통과하는 최소값이다. 이 값을 바꾸지 마라 —
 * 근거가 ADR-009 본문에 적혀 있고, 코드에서 바꾸면 문서와 어긋난다.
 * 이 검사는 하한선이지 완료 증명이 아니다. 본문이 짧으면 전사여도 통과한다.
 *
 * 대상은 `summary`와 `paragraphs`다. `name`은 보지 않고, 겹친 구간에 한글이 한 글자도
 * 없으면 넘긴다. 둘 다 ADR-025의 결정이고 이유는 그 ADR에 있다. 요약하면 `name`은
 * ADR-009가 재작성 대상에서 제외한 필드이고(대신 check-structure.mjs가 baseline으로
 * 고정한다), 한글 없는 겹침은 베낀 문장이 아니라 서비스 이름 나열이다.
 *
 * 원본은 ADR-009에 따라 gitignore로 로컬에만 둔다. clone한 환경에는 없는 것이 정상이라,
 * 원본이 없으면 실패가 아니라 건너뜀(exit 0)으로 끝난다. 그래서 이 검사는
 * npm test·npm run build에 엮지 않고 원본을 가진 사람이 손으로 돌린다.
 *
 * 사용법: node scripts/check-verbatim.mjs [원본 경로]
 * 겹침이 있으면 exit 1.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const MIN_RUN = 32 // ADR-009가 정한 임계값. 바꾸지 마라.

/** 한글이 한 글자도 없는 겹침은 서비스 이름 나열이다. 근거는 ADR-025. */
const hasHangul = (text) => /[ㄱ-ㆎ가-힣]/u.test(text)

const sourcePath = process.argv[2]
  ? join(process.cwd(), process.argv[2])
  : join(ROOT, 'docs/source/concepts-raw.md')

let sourceRaw
try {
  sourceRaw = readFileSync(sourcePath, 'utf8')
} catch {
  console.log(`- 건너뜀 — 원본이 없다: ${relative(ROOT, sourcePath) || sourcePath}`)
  console.log('  원본은 외부 참고 자료 추출본이라 gitignore로 로컬에만 둔다(ADR-009).')
  console.log('  clone한 환경에는 없는 것이 정상이므로 실패로 보지 않는다.')
  process.exit(0)
}

/** 공백·문장부호·기호를 지운다. `**강조**` 마커도 여기서 함께 사라진다. */
const normalize = (text) => text.replace(/[\s\p{P}\p{S}]/gu, '')

// 원본의 32자 창을 전부 모아 둔다. 개념 쪽을 훑으며 이 집합에 있는지만 보면 된다.
const source = normalize(sourceRaw)
const windows = new Set()
for (let i = 0; i + MIN_RUN <= source.length; i += 1) {
  windows.add(source.slice(i, i + MIN_RUN))
}

const topics = JSON.parse(readFileSync(join(ROOT, 'src/data/aws/topics.json'), 'utf8'))
const hits = []
const skipped = []

for (const topic of topics) {
  for (const concept of topic.concepts) {
    // `name`은 대상이 아니다. ADR-009가 재작성 대상에서 뺀 필드라, 여기서 잡아도
    // "문장을 다시 써서 해소하라"를 따를 수 없다. 근거는 ADR-025.
    const units = [
      ['summary', concept.summary],
      ...concept.paragraphs.map((p, i) => [`paragraphs[${i}]`, p]),
    ]
    for (const [field, text] of units) {
      const unit = normalize(text)
      let i = 0
      while (i + MIN_RUN <= unit.length) {
        if (!windows.has(unit.slice(i, i + MIN_RUN))) {
          i += 1
          continue
        }
        // 걸렸으면 더 이어지는 데까지 늘려서 보고한다. 겹치는 창을 여러 번 세지 않는다.
        let end = i + MIN_RUN
        while (end < unit.length && source.includes(unit.slice(i, end + 1))) end += 1
        const run = unit.slice(i, end)
        // 한글이 없으면 고유명사 나열이다. 조용히 버리지 않고 몇 건을 넘겼는지 알린다.
        if (hasHangul(run)) hits.push({ id: concept.id, field, run })
        else skipped.push({ id: concept.id, field, run })
        i = end - MIN_RUN + 1
      }
    }
  }
}

if (skipped.length) {
  console.log(`- 넘긴 겹침 ${skipped.length}건 — 한글이 없어 서비스 이름 나열로 본다 (ADR-025)`)
  for (const { id, field, run } of skipped) {
    console.log(`    ${id} ${field} (${run.length}자) ${run}`)
  }
  console.log('')
}

if (hits.length) {
  for (const { id, field, run } of hits) {
    console.log(`✗ ${id} ${field} — ${run.length}자 일치`)
    console.log(`    ${run}`)
  }
  console.log(`\n전사 의심 ${hits.length}건 (임계값 ${MIN_RUN}자)`)
  console.log('사실은 그대로 두고 문장을 다시 써서 해소하라. 검사를 통과시키려고 사실을 빼지 마라.')
  process.exit(1)
}
console.log(`✓ 전사 이상 없음 — 원본과 ${MIN_RUN}자 이상 연속으로 겹치는 개념 본문이 없다`)
