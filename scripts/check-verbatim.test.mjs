// @vitest-environment node

import { describe, expect, it } from 'vitest'
import { collectUnits, findVerbatimRuns } from './check-verbatim.mjs'

// 전부 지어낸 문장이다. 실제 강의·면접·AWS 원본 문장을 옮겨 적지 마라(ADR-009).
// 공백·문장부호를 지우면 40자가 되는 한국어 문장.
const SENTENCE = '가상의 통신 규약은 지어낸 순서 번호로 흩어진 조각을 다 모아 원래 차례대로 빠짐없이 다시 맞춘다'
const NORMALIZED = '가상의통신규약은지어낸순서번호로흩어진조각을다모아원래차례대로빠짐없이다시맞춘다'

// 원본과 단위의 앞뒤 말은 서로 다른 글자로 끝나고 시작한다. 같으면 겹친 구간이 그만큼 늘어난다.
const source = `원본 쪽에서 앞에 놓인 글귀. ${SENTENCE}. 원본 쪽 끝맺음.`
const unit = (text, field = 'paragraphs[0]', id = 'fake.concept') => ({ id, field, text })

describe('findVerbatimRuns', () => {
  it('원본 문장 40자를 그대로 담은 단위는 그 구간 하나로 걸린다', () => {
    const result = findVerbatimRuns([source], [unit(`단위 쪽 머리말, ${SENTENCE}. 단위 쪽 꼬리말.`)])
    expect(NORMALIZED).toHaveLength(40)
    expect(result).toEqual({
      hits: [{ id: 'fake.concept', field: 'paragraphs[0]', run: NORMALIZED }],
      skipped: [],
    })
  })

  it('겹침이 31자뿐이면 걸리지 않는다', () => {
    const partial = NORMALIZED.slice(0, 31)
    const result = findVerbatimRuns([source], [unit(`단위 쪽 머리말 ${partial} 하고 끝낸다.`)])
    expect(result).toEqual({ hits: [], skipped: [] })
  })

  it('공백·문장부호·** 표지만 다른 글은 같은 글로 보고 잡는다', () => {
    const marked = '단위 쪽 머리말. **가상의** 통신-규약은, 지어낸 "순서 번호"로 흩어진 조각을 다 모아 (원래 차례대로) 빠짐없이 다시 **맞춘다**! 단위 쪽 꼬리말.'
    const result = findVerbatimRuns([source], [unit(marked)])
    expect(result.hits).toEqual([{ id: 'fake.concept', field: 'paragraphs[0]', run: NORMALIZED }])
  })

  it('겹친 구간에 한글이 없으면 넘긴 겹침으로 따로 모은다', () => {
    const names = 'ZETA-17 OMEGA-42 SIGMA-88 THETA-05 KAPPA-63 DELTA-9'
    const result = findVerbatimRuns(
      [`원본 쪽에 적힌 이름표 ${names} 원본 끝`],
      [unit(`단위에 옮긴 목록은 ${names} 단위 끝`, 'summary')],
    )
    expect(result).toEqual({
      hits: [],
      skipped: [{ id: 'fake.concept', field: 'summary', run: 'ZETA17OMEGA42SIGMA88THETA05KAPPA63DELTA9' }],
    })
  })

  it('원본이 여럿이면 둘째 원본에만 있는 겹침도 잡는다', () => {
    const second = '둘째 원본에만 적힌 지어낸 문장으로 겹침 검사가 원본마다 창을 따로 만드는지 차근차근 살펴본다'
    const result = findVerbatimRuns(
      [source, `둘째 원본 머리. ${second}. 둘째 원본 꼬리.`],
      [unit(`단위 쪽 머리말 ${second} 하고 마친다.`, 'explanation', 'n001')],
    )
    expect(result.hits).toEqual([
      { id: 'n001', field: 'explanation', run: '둘째원본에만적힌지어낸문장으로겹침검사가원본마다창을따로만드는지차근차근살펴본다' },
    ])
  })

  it('두 원본의 끝과 처음을 이어 붙여야만 생기는 구간은 잡지 않는다', () => {
    const tail = '첫째 원본 끝에 붙은 스무 글자짜리 지어낸 말이다'
    const head = '둘째 원본 처음에 놓인 스무 글자짜리 꾸민 말이다'
    const result = findVerbatimRuns(
      [`첫째 원본의 앞부분. ${tail}`, `${head}. 둘째 원본의 뒷부분.`],
      [unit(`${tail} ${head}`)],
    )
    expect(result).toEqual({ hits: [], skipped: [] })
  })
})

describe('collectUnits', () => {
  const topics = [
    {
      id: 'fake-topic',
      concepts: [
        { id: 'fake-topic.alpha', name: '알파 개념의 이름', summary: '알파 요약', paragraphs: ['알파 첫 문단', '알파 둘째 문단'] },
        { id: 'fake-topic.beta', name: '베타 개념의 이름', summary: '베타 요약', paragraphs: ['베타 문단'] },
      ],
    },
  ]
  const questions = [
    {
      id: 'n001',
      topicId: 'fake-topic',
      conceptId: 'fake-topic.alpha',
      format: 'yes-no',
      prompt: '지어낸 문제문인가요?',
      answer: true,
      explanation: '지어낸 해설',
    },
  ]
  const conceptUnits = [
    { id: 'fake-topic.alpha', field: 'summary', text: '알파 요약' },
    { id: 'fake-topic.alpha', field: 'paragraphs[0]', text: '알파 첫 문단' },
    { id: 'fake-topic.alpha', field: 'paragraphs[1]', text: '알파 둘째 문단' },
    { id: 'fake-topic.beta', field: 'summary', text: '베타 요약' },
    { id: 'fake-topic.beta', field: 'paragraphs[0]', text: '베타 문단' },
  ]

  it('AWS 과목은 개념의 요약과 문단만 단위로 낸다', () => {
    expect(collectUnits('aws', topics, questions)).toEqual(conceptUnits)
  })

  it('네트워크 과목은 개념의 요약·문단에 더해 문항의 문제문과 해설도 낸다', () => {
    expect(collectUnits('network', topics, questions)).toEqual([
      ...conceptUnits,
      { id: 'n001', field: 'prompt', text: '지어낸 문제문인가요?' },
      { id: 'n001', field: 'explanation', text: '지어낸 해설' },
    ])
  })
})
