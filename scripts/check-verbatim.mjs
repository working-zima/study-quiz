#!/usr/bin/env node
/**
 * 전사 가드레일: 학습 데이터가 원본을 그대로 옮겨 적지 않았는지 검사한다.
 *
 * 개념 본문은 사실만 원본에서 가져오고 문장은 직접 쓴다. 이유: 원본은 외부 참고 자료의
 * 추출 전문이라, 전사하면 저장소를 공개할 때 원문이 그대로 공개된다. 근거는 ADR-009.
 * 과목마다 원본이 다르다(ADR-053).
 * - aws: docs/source/concepts-raw.md
 * - network: docs/source/network/raw/lecture.md(강의), docs/source/network/raw/interview.md(면접)
 *
 * 공백·문장부호를 지운 뒤 원본과 32자 이상 연속으로 일치하는 구간을 잡아낸다.
 * 임계값 32자는 1-exam-gaps 개념 77개가 전부 통과하는 최소값이다. 이 값을 바꾸지 마라 —
 * 근거가 ADR-009 본문에 적혀 있고, 코드에서 바꾸면 문서와 어긋난다.
 * 이 검사는 하한선이지 완료 증명이 아니다. 본문이 짧으면 전사여도 통과한다.
 * 원본이 여럿이면 원본마다 따로 창을 만든다. 두 원본의 끝과 처음을 이어 붙여야만 생기는
 * 구간은 어느 원본에도 없는 글이라 잡지 않는다.
 *
 * 대상은 개념의 `summary`와 `paragraphs`다. `name`은 보지 않고, 겹친 구간에 한글이 한 글자도
 * 없으면 넘긴다. 둘 다 ADR-025의 결정이고 이유는 그 ADR에 있다. 요약하면 `name`은
 * ADR-009가 재작성 대상에서 제외한 필드이고(대신 check-structure.mjs가 baseline으로
 * 고정한다), 한글 없는 겹침은 베낀 문장이 아니라 서비스 이름 나열이다.
 * network는 여기에 문항의 `prompt`와 `explanation`을 더한다. 면접 답은 완성된 문장이라
 * 해설로 그대로 옮겨지기 쉽기 때문이다. aws의 대상은 ADR-025 그대로 개념뿐이다.
 *
 * 원본은 ADR-009에 따라 gitignore로 로컬에만 둔다. clone한 환경에는 없는 것이 정상이라,
 * 원본이 없으면 실패가 아니라 건너뜀(exit 0)으로 끝난다. 일부만 있으면 있는 것으로 검사한다.
 * 그래서 이 검사는 npm test·npm run build에 엮지 않고 원본을 가진 사람이 손으로 돌린다.
 *
 * 사용법: node scripts/check-verbatim.mjs [--subject aws|network] [원본 경로 ...]
 * --subject가 없으면 aws다. 원본 경로를 주면 그 과목의 기본 원본 대신 그것을 쓴다.
 * 겹침이 있으면 exit 1, 인자가 잘못되면 exit 2.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative, resolve } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const MIN_RUN = 32 // ADR-009가 정한 임계값. 바꾸지 마라.

/** 과목마다 기본 원본. 데이터는 src/data/<과목>/에 있다. */
const DEFAULT_SOURCES = {
  aws: ['docs/source/concepts-raw.md'],
  network: ['docs/source/network/raw/lecture.md', 'docs/source/network/raw/interview.md'],
}

/** 한글이 한 글자도 없는 겹침은 서비스 이름 나열이다. 근거는 ADR-025. */
const hasHangul = (text) => /[ㄱ-ㆎ가-힣]/u.test(text)

/** 공백·문장부호·기호를 지운다. `**강조**` 마커도 여기서 함께 사라진다. */
const normalize = (text) => text.replace(/[\s\p{P}\p{S}]/gu, '')

/**
 * 원본 글들과 단위({ id, field, text })를 견주어 minRun자 이상 연속으로 같은 구간을 찾는다.
 * 한글이 든 구간은 hits, 한글이 없는 구간은 skipped에 담는다.
 */
export function findVerbatimRuns(sourceTexts, units, minRun = MIN_RUN) {
  // 원본의 창을 전부 모아 둔다. 단위 쪽을 훑으며 이 집합에 있는지만 보면 된다.
  const sources = sourceTexts.map(normalize)
  const windows = new Set()
  for (const source of sources) {
    for (let i = 0; i + minRun <= source.length; i += 1) {
      windows.add(source.slice(i, i + minRun))
    }
  }

  const hits = []
  const skipped = []
  for (const { id, field, text } of units) {
    const unit = normalize(text)
    let i = 0
    while (i + minRun <= unit.length) {
      if (!windows.has(unit.slice(i, i + minRun))) {
        i += 1
        continue
      }
      // 걸렸으면 더 이어지는 데까지 늘려서 보고한다. 겹치는 창을 여러 번 세지 않는다.
      let end = i + minRun
      while (end < unit.length && sources.some((source) => source.includes(unit.slice(i, end + 1)))) end += 1
      const run = unit.slice(i, end)
      // 한글이 없으면 고유명사 나열이다. 조용히 버리지 않고 몇 건을 넘겼는지 알린다.
      if (hasHangul(run)) hits.push({ id, field, run })
      else skipped.push({ id, field, run })
      i = end - minRun + 1
    }
  }
  return { hits, skipped }
}

/** 과목의 데이터에서 검사할 단위를 모은다. */
export function collectUnits(subjectId, topics, questions) {
  const units = []
  for (const topic of topics) {
    for (const concept of topic.concepts) {
      // `name`은 대상이 아니다. ADR-009가 재작성 대상에서 뺀 필드라, 여기서 잡아도
      // "문장을 다시 써서 해소하라"를 따를 수 없다. 근거는 ADR-025.
      units.push({ id: concept.id, field: 'summary', text: concept.summary })
      concept.paragraphs.forEach((text, i) => units.push({ id: concept.id, field: `paragraphs[${i}]`, text }))
    }
  }
  // 네트워크는 면접 답이 해설로 옮겨지기 쉬워 문항도 본다. AWS는 ADR-025 그대로 개념만 본다.
  if (subjectId === 'network') {
    for (const question of questions) {
      units.push({ id: question.id, field: 'prompt', text: question.prompt })
      units.push({ id: question.id, field: 'explanation', text: question.explanation })
    }
  }
  return units
}

function main(args) {
  let subject = 'aws'
  const paths = []
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--subject') {
      subject = args[i + 1]
      i += 1
    } else {
      paths.push(args[i])
    }
  }
  if (!Object.hasOwn(DEFAULT_SOURCES, subject)) {
    console.error(`과목은 ${Object.keys(DEFAULT_SOURCES).join('·')} 가운데 하나다: ${subject ?? '(없음)'}`)
    console.error('사용법: node scripts/check-verbatim.mjs [--subject aws|network] [원본 경로 ...]')
    process.exit(2)
  }

  const sourcePaths = paths.length
    ? paths.map((path) => resolve(process.cwd(), path))
    : DEFAULT_SOURCES[subject].map((path) => join(ROOT, path))
  const shown = (path) => relative(ROOT, path) || path

  const sourceTexts = []
  const missing = []
  for (const path of sourcePaths) {
    try {
      sourceTexts.push(readFileSync(path, 'utf8'))
    } catch {
      missing.push(shown(path))
    }
  }
  if (!sourceTexts.length) {
    console.log(`- 건너뜀 — 원본이 없다: ${missing.join(', ')}`)
    console.log('  원본은 외부 참고 자료 추출본이라 gitignore로 로컬에만 둔다(ADR-009).')
    console.log('  clone한 환경에는 없는 것이 정상이므로 실패로 보지 않는다.')
    process.exit(0)
  }
  if (missing.length) {
    console.log(`- 원본 일부가 없어 있는 것만 검사한다. 없는 원본: ${missing.join(', ')}`)
    console.log('')
  }

  const readData = (file) => JSON.parse(readFileSync(join(ROOT, 'src/data', subject, file), 'utf8'))
  const units = collectUnits(subject, readData('topics.json'), readData('questions.json'))
  const { hits, skipped } = findVerbatimRuns(sourceTexts, units)
  const scope = `${subject}: 원본 ${sourceTexts.length}개, 단위 ${units.length}개`

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
    console.log(`\n전사 의심 ${hits.length}건 (임계값 ${MIN_RUN}자) — ${scope}`)
    console.log('사실은 그대로 두고 문장을 다시 써서 해소하라. 검사를 통과시키려고 사실을 빼지 마라.')
    process.exit(1)
  }
  console.log(`✓ 전사 이상 없음 — ${scope}`)
}

// import할 때는 함수만 내보내고 검사를 돌리지 않는다. 직접 실행했을 때만 명령줄을 처리한다.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main(process.argv.slice(2))
}
