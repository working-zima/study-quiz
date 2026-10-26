#!/usr/bin/env node
/**
 * 키워드 퀴즈의 평문 원본(docs/source/keywords-raw.json)을 검사한다.
 *
 * 이 파일은 원본 PDF의 키워드 정의를 원문 그대로 담는다. 그래서 gitignore로 로컬에만 두고,
 * 저장소와 배포본에는 암호문(src/data/aws/keywords.enc.json)만 들어간다. 근거는 ADR-040.
 * clone한 환경에는 평문이 없는 것이 정상이라, 없으면 실패가 아니라 건너뜀(exit 0)으로 끝난다.
 * 그래서 이 검사는 npm test·npm run build에 엮지 않고 평문을 가진 사람이 손으로 돌린다.
 *
 * 이 스크립트에 키워드 이름이나 요약 문장을 적지 마라 — 공개되는 파일이다.
 *
 * 사용법: node scripts/check-keywords.mjs
 * 검사가 하나라도 실패하면 이유를 모두 출력하고 exit 1.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = 'docs/source/keywords-raw.json'
const FIELDS = ['id', 'term', 'summary', 'section', 'page']
// 하위 항목은 parentId로 부모 키워드를, [특징] 문장은 features로, 옳지 않은 것 고르기의 가짜 보기는 falseFeature로 들고 있을 수 있다.
const OPTIONAL_FIELDS = ['parentId', 'features', 'falseFeature']
const FEATURE_FIELDS = ['page', 'section', 'text']
const FALSE_FEATURE_FIELDS = ['replaces', 'text']
const MAX_SUMMARY = 200
const MIN_SECTIONS = 3

let raw
try {
  raw = readFileSync(join(ROOT, SOURCE), 'utf8')
} catch {
  console.log(`건너뜀: ${SOURCE} 없음`)
  process.exit(0)
}

const errors = []
let items
try {
  items = JSON.parse(raw)
} catch (e) {
  console.error(`JSON을 읽을 수 없다: ${e.message}`)
  process.exit(1)
}
if (!Array.isArray(items)) {
  console.error('최상위 값이 배열이 아니다')
  process.exit(1)
}

/** 공백을 지우고 소문자로 바꾼다. */
const norm = (text) => text.replace(/\s+/g, '').toLowerCase()

/** `이름 (풀네임)`을 이름과 풀네임으로 나눈다. 괄호가 없으면 풀네임은 null이다. */
const splitTerm = (term) => {
  const m = term.match(/^(.*?)\s*\((.*)\)\s*$/)
  return m ? { name: m[1], full: m[2] } : { name: term, full: null }
}

// 1. 모양
items.forEach((item, i) => {
  const at = `#${i}`
  if (item === null || typeof item !== 'object' || Array.isArray(item)) {
    errors.push(`${at}: 객체가 아니다`)
    return
  }
  const keys = Object.keys(item)
  const missing = FIELDS.filter((f) => !keys.includes(f))
  const unknown = keys.filter((k) => !FIELDS.includes(k) && !OPTIONAL_FIELDS.includes(k))
  if (missing.length > 0 || unknown.length > 0) {
    errors.push(`${at}: 필드가 ${FIELDS.join('·')}(+${OPTIONAL_FIELDS.join('·')})가 아니다 (${keys.join(', ')})`)
  }
  for (const f of ['id', 'term', 'summary', 'section']) {
    if (typeof item[f] !== 'string' || item[f].trim() === '') errors.push(`${at}: ${f}가 비었거나 문자열이 아니다`)
  }
  if (!Number.isInteger(item.page) || item.page < 1 || item.page > 50) {
    errors.push(`${at}: page가 1~50의 정수가 아니다 (${item.page})`)
  }
})
const valid = items.filter(
  (item) => item && typeof item === 'object' && FIELDS.slice(0, 4).every((f) => typeof item[f] === 'string'),
)

// 2. id 연속
items.forEach((item, i) => {
  const expected = `kw-${String(i + 1).padStart(3, '0')}`
  if (item?.id !== expected) errors.push(`#${i}: id가 ${expected}가 아니다 (${item?.id})`)
})

// 3. term 중복 — 전체와 괄호 앞부분 모두
const seenTerm = new Map()
for (const item of valid) {
  const { name } = splitTerm(item.term)
  for (const key of new Set([norm(item.term), norm(name)])) {
    if (seenTerm.has(key)) errors.push(`${item.id}: term이 ${seenTerm.get(key)}와 겹친다`)
    else seenTerm.set(key, item.id)
  }
}

// 4. summary 중복
const seenSummary = new Map()
for (const item of valid) {
  const key = norm(item.summary)
  if (seenSummary.has(key)) errors.push(`${item.id}: summary가 ${seenSummary.get(key)}와 같다`)
  else seenSummary.set(key, item.id)
}

// 5. summary에 자기 term이 남아 있지 않다. 두 글자 이하는 오탐이 많아 보지 않는다.
for (const item of valid) {
  const { name, full } = splitTerm(item.term)
  const summary = norm(item.summary)
  for (const part of [name, full]) {
    if (!part) continue
    const key = norm(part)
    if (key.length <= 2) continue
    if (summary.includes(key)) errors.push(`${item.id}: summary에 키워드 이름이 남아 있다`)
  }
}

// 6. summary 길이
for (const item of valid) {
  if (item.summary.length > MAX_SUMMARY) {
    errors.push(`${item.id}: summary가 ${MAX_SUMMARY}자를 넘는다 (${item.summary.length}자)`)
  }
}

// 7. parentId는 자기 아닌 다른 키워드를 가리킨다
const ids = new Set(valid.map((item) => item.id))
for (const item of valid) {
  if (!('parentId' in item)) continue
  if (typeof item.parentId !== 'string' || !ids.has(item.parentId) || item.parentId === item.id) {
    errors.push(`${item.id}: parentId가 다른 키워드를 가리키지 않는다 (${item.parentId})`)
  }
}

// 8. features — 모양, 단원, 길이, 중복, 자기 term이 가려졌는지
const sections = new Set(valid.map((item) => item.section))
const seenFeature = new Map()
let featureCount = 0
for (const item of valid) {
  if (!('features' in item)) continue
  if (!Array.isArray(item.features) || item.features.length === 0) {
    errors.push(`${item.id}: features가 비어 있지 않은 배열이 아니다`)
    continue
  }
  const { name, full } = splitTerm(item.term)
  item.features.forEach((feature, i) => {
    const at = `${item.id} features[${i}]`
    featureCount += 1
    if (feature === null || typeof feature !== 'object' || Object.keys(feature).sort().join() !== FEATURE_FIELDS.join()) {
      errors.push(`${at}: 필드가 ${FEATURE_FIELDS.join('·')}가 아니다`)
      return
    }
    if (typeof feature.text !== 'string' || feature.text.trim() === '') errors.push(`${at}: text가 비었다`)
    else if (feature.text.length > MAX_SUMMARY) errors.push(`${at}: text가 ${MAX_SUMMARY}자를 넘는다 (${feature.text.length}자)`)
    if (!sections.has(feature.section)) errors.push(`${at}: section이 키워드의 단원 가운데 하나가 아니다`)
    if (!Number.isInteger(feature.page) || feature.page < 1 || feature.page > 50) errors.push(`${at}: page가 1~50의 정수가 아니다`)
    if (typeof feature.text !== 'string') return
    const key = norm(feature.text)
    if (seenFeature.has(key)) errors.push(`${at}: text가 ${seenFeature.get(key)}와 같다`)
    else seenFeature.set(key, at)
    for (const part of [name, full]) {
      if (!part || norm(part).length <= 2) continue
      if (key.includes(norm(part))) errors.push(`${at}: text에 키워드 이름이 남아 있다`)
    }
  })
}

// 9. falseFeature — 옳지 않은 것 고르기의 가짜 보기. 바꾼 특징을 가리키고, 옳은 보기(요약 + 나머지 특징)가 셋 이상이어야 한다.
for (const item of valid) {
  if (!('falseFeature' in item)) continue
  const fake = item.falseFeature
  const at = `${item.id} falseFeature`
  if (fake === null || typeof fake !== 'object' || Object.keys(fake).sort().join() !== FALSE_FEATURE_FIELDS.join()) {
    errors.push(`${at}: 필드가 ${FALSE_FEATURE_FIELDS.join('·')}가 아니다`)
    continue
  }
  const features = Array.isArray(item.features) ? item.features : []
  if (features.length < 3) errors.push(`${at}: 특징이 셋 미만이라 옳은 보기 셋을 채울 수 없다`)
  if (!Number.isInteger(fake.replaces) || fake.replaces < 0 || fake.replaces >= features.length) {
    errors.push(`${at}: replaces가 특징 번호가 아니다 (${fake.replaces})`)
  }
  if (typeof fake.text !== 'string' || fake.text.trim() === '') {
    errors.push(`${at}: text가 비었다`)
    continue
  }
  if (fake.text.length > MAX_SUMMARY) errors.push(`${at}: text가 ${MAX_SUMMARY}자를 넘는다 (${fake.text.length}자)`)
  const key = norm(fake.text)
  const truths = [item.summary, ...features.map((feature) => feature?.text)].filter((text) => typeof text === 'string')
  if (truths.some((text) => norm(text) === key)) errors.push(`${at}: text가 요약이나 특징과 같다`)
  const { name, full } = splitTerm(item.term)
  for (const part of [name, full]) {
    if (!part || norm(part).length <= 2) continue
    if (key.includes(norm(part))) errors.push(`${at}: text에 키워드 이름이 남아 있다`)
  }
}

// 10. 단원 수
const bySection = new Map()
for (const item of valid) bySection.set(item.section, (bySection.get(item.section) ?? 0) + 1)
if (bySection.size < MIN_SECTIONS) errors.push(`단원이 ${MIN_SECTIONS}개 미만이다 (${bySection.size}개)`)

if (errors.length > 0) {
  console.error(`실패 ${errors.length}건`)
  for (const e of errors) console.error(`- ${e}`)
  process.exit(1)
}

console.log(`${items.length}개 통과 — 단원 ${bySection.size}개, 특징 ${featureCount}개`)
for (const [section, count] of bySection) console.log(`- ${count}개  ${section}`)
