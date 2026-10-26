// @vitest-environment node

import { describe, expect, it } from 'vitest'
import { topics as realTopics } from '../data/aws'
import type { Topic } from '../types/content'
import { searchContent, splitBodyOnly, stripEmphasis } from './search'

const topics: Topic[] = [
  {
    id: 'database',
    title: 'Aurora·DynamoDB·ElastiCache',
    importance: 3,
    sourcePages: [1, 2],
    concepts: [
      {
        id: 'database.aurora',
        name: 'Aurora',
        summary: 'MySQL·PostgreSQL과 호환되는 관계형 데이터베이스다',
        paragraphs: ['Aurora는 읽기 전용 복제본을 최대 15개까지 둔다.'],
      },
      {
        id: 'database.dynamodb',
        name: 'DynamoDB',
        summary: '완전 관리형 NoSQL 데이터베이스다',
        paragraphs: ['Aurora와 달리 스키마를 미리 정하지 않는다.'],
      },
    ],
  },
  {
    id: 'storage',
    title: 'S3 스토리지 클래스 유형',
    importance: 2,
    sourcePages: [3, 4],
    concepts: [
      {
        id: 'storage.deep-archive',
        name: 'S3 Glacier Deep Archive',
        summary: '**장기** 보관에 쓰는 가장 저렴한 클래스다',
        paragraphs: ['조회에 12시간이 걸린다.'],
      },
    ],
  },
]

describe('searchContent', () => {
  it('빈 질의에는 결과가 없다', () => {
    expect(searchContent(topics, '')).toEqual([])
  })

  it('공백만 있는 질의에는 결과가 없다', () => {
    expect(searchContent(topics, '   ')).toEqual([])
  })

  it('개념 이름으로 찾는다 — 대소문자를 가리지 않는다', () => {
    const hits = searchContent(topics, 'aurora')

    expect(hits[0]).toEqual({
      kind: 'concept',
      topic: topics[0],
      concept: topics[0].concepts[0],
    })
  })

  it('주제 제목으로 찾으면 주제 히트가 나온다', () => {
    const hits = searchContent(topics, '스토리지 클래스')

    expect(hits).toContainEqual({ kind: 'topic', topic: topics[1] })
  })

  it('토큰이 하나라도 없으면 결과에서 빠진다', () => {
    const hits = searchContent(topics, 'aurora postgresql')

    expect(hits).toEqual([
      { kind: 'concept', topic: topics[0], concept: topics[0].concepts[0] },
    ])
  })

  it('토큰이 서로 다른 필드에 흩어져 있어도 개념 히트가 된다', () => {
    const hits = searchContent(topics, '관계형 복제본')

    expect(hits).toEqual([
      { kind: 'concept', topic: topics[0], concept: topics[0].concepts[0] },
    ])
  })

  it('강조 마커를 사이에 둔 문구를 마커 없는 질의로 찾는다', () => {
    const hits = searchContent(topics, '장기 보관')

    expect(hits).toEqual([
      { kind: 'concept', topic: topics[1], concept: topics[1].concepts[0] },
    ])
  })

  it('이름에서 걸린 개념이 본문에서만 걸린 개념보다 앞에 온다', () => {
    const hits = searchContent(topics, 'aurora')

    expect(hits.map((hit) => (hit.kind === 'concept' ? hit.concept.id : hit.topic.id))).toEqual([
      'database.aurora',
      'database',
      'database.dynamodb',
    ])
  })

  it('같은 개념이 이름과 본문 양쪽에 걸려도 한 번만 나온다', () => {
    const hits = searchContent(topics, 'aurora')
    const auroraHits = hits.filter(
      (hit) => hit.kind === 'concept' && hit.concept.id === 'database.aurora',
    )

    expect(auroraHits).toHaveLength(1)
  })

  it('주제 제목에 걸린 질의가 그 주제의 개념을 끌고 오지 않는다', () => {
    const hits = searchContent(topics, '스토리지 클래스')

    expect(hits).toEqual([{ kind: 'topic', topic: topics[1] }])
  })

  it('실데이터에서 aurora를 찾으면 결과가 비어 있지 않다', () => {
    expect(searchContent(realTopics, 'aurora').length).toBeGreaterThan(0)
  })
})

describe('splitBodyOnly', () => {
  // 개념이 618개로 늘어난 뒤 한 단어 질의의 절반 이상이 본문에만 걸린 히트다.
  // 전부 한 목록에 그리면 찾으려던 것이 그 안에 묻힌다.
  const ids = (hits: ReturnType<typeof searchContent>) =>
    hits.map((hit) => (hit.kind === 'concept' ? hit.concept.id : hit.topic.id))

  it('본문에만 걸린 개념 히트를 갈라낸다', () => {
    const { primary, bodyOnly } = splitBodyOnly(searchContent(topics, 'aurora'), 'aurora')

    expect(ids(primary)).toEqual(['database.aurora', 'database'])
    expect(ids(bodyOnly)).toEqual(['database.dynamodb'])
  })

  it('이름에 걸린 개념은 본문에도 그 말이 있어도 본문 쪽으로 가지 않는다', () => {
    // `database.aurora`의 본문에도 'Aurora'가 있다.
    const { bodyOnly } = splitBodyOnly(searchContent(topics, 'aurora'), 'aurora')

    expect(ids(bodyOnly)).not.toContain('database.aurora')
  })

  it('요약에 걸린 개념은 본문 쪽으로 가지 않는다', () => {
    const { primary, bodyOnly } = splitBodyOnly(searchContent(topics, '보관'), '보관')

    expect(ids(primary)).toEqual(['storage.deep-archive'])
    expect(bodyOnly).toEqual([])
  })

  it('주제 히트는 본문 쪽으로 가지 않는다', () => {
    const { primary, bodyOnly } = splitBodyOnly(
      searchContent(topics, '스토리지 클래스'),
      '스토리지 클래스',
    )

    expect(ids(primary)).toEqual(['storage'])
    expect(bodyOnly).toEqual([])
  })

  it('히트가 없으면 두 쪽 모두 빈 배열이다', () => {
    const { primary, bodyOnly } = splitBodyOnly(searchContent(topics, '없는말'), '없는말')

    expect(primary).toEqual([])
    expect(bodyOnly).toEqual([])
  })

  it('본문에만 걸린 히트끼리는 원래 순서를 지킨다', () => {
    const hits = searchContent(realTopics, '복제')
    const { bodyOnly } = splitBodyOnly(hits, '복제')

    expect(ids(bodyOnly)).toEqual(ids(hits.filter((hit) => bodyOnly.includes(hit))))
  })
})

describe('stripEmphasis', () => {
  it('강조 마커를 지우고 나머지 글자는 그대로 둔다', () => {
    expect(stripEmphasis('**장기** 보관에 쓰는 클래스다')).toBe('장기 보관에 쓰는 클래스다')
  })

  it('백틱을 지우고 나머지 글자는 그대로 둔다', () => {
    expect(stripEmphasis('`NotAction`은 **나머지**를 가리킨다')).toBe('NotAction은 나머지를 가리킨다')
  })
})
