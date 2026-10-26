import { describe, expect, it } from 'vitest'
import { markFirstOccurrences } from '../../lib/glossary'
import { groupParagraphs } from '../../lib/paragraph-blocks'
import { topics, visualsByTopicId } from './index'

describe('시각 요소 데이터 무결성', () => {
  it('시각 요소의 주제 키가 실제 주제 id다', () => {
    const topicIds = new Set(topics.map(({ id }) => id))

    expect(Object.keys(visualsByTopicId)).toContain('vpc-networking')
    for (const topicId of Object.keys(visualsByTopicId)) {
      expect(topicIds.has(topicId), topicId).toBe(true)
    }
  })

  it('모든 근거가 실제 개념 id이고 sources는 비어 있지 않다', () => {
    const conceptIds = new Set(topics.flatMap(({ concepts }) => concepts.map(({ id }) => id)))

    for (const visuals of Object.values(visualsByTopicId)) {
      const sourcedItems = [
        ...Object.values(visuals.diagrams).flatMap((diagram) => [diagram, ...diagram.scenarios]),
        ...Object.values(visuals.tables),
      ]
      for (const { sources } of sourcedItems) {
        expect(sources.length).toBeGreaterThan(0)
        for (const source of sources) {
          expect(conceptIds.has(source), source).toBe(true)
        }
      }
      for (const { sourceConceptId } of visuals.glossary) {
        expect(conceptIds.has(sourceConceptId), sourceConceptId).toBe(true)
      }
    }
  })

  it('표의 열은 셋 이하이고 행의 셀 수는 열 수에서 하나를 뺀 값이다', () => {
    for (const visuals of Object.values(visualsByTopicId)) {
      for (const table of Object.values(visuals.tables)) {
        expect(table.columns.length, table.label).toBeLessThanOrEqual(3)
        for (const row of table.rows) {
          expect(row.cells, `${table.label}: ${row.header}`).toHaveLength(table.columns.length - 1)
        }
      }
    }
  })

  it('도식 안의 시나리오 id는 유일하고 caption은 20자를 넘는다', () => {
    for (const visuals of Object.values(visualsByTopicId)) {
      for (const diagram of Object.values(visuals.diagrams)) {
        const ids = diagram.scenarios.map(({ id }) => id)
        expect(new Set(ids).size, diagram.label).toBe(ids.length)
        for (const scenario of diagram.scenarios) {
          expect(scenario.caption.length, `${diagram.label}: ${scenario.id}`).toBeGreaterThan(20)
        }
      }
    }
  })

  it('주제 안의 약어 term은 중복되지 않는다', () => {
    for (const [topicId, visuals] of Object.entries(visualsByTopicId)) {
      const terms = visuals.glossary.map(({ term }) => term)
      expect(new Set(terms).size, topicId).toBe(terms.length)
    }
  })

  it('약어마다 그 주제의 개념 본문(요약·문단)에 단어로 한 번 이상 나온다', () => {
    for (const [topicId, visuals] of Object.entries(visualsByTopicId)) {
      const topic = topics.find(({ id }) => id === topicId)!
      const marked = new Set(
        topic.concepts.flatMap(({ summary, paragraphs }) =>
          markFirstOccurrences([summary, ...paragraphs], visuals.glossary.map(({ term }) => term))
            .flat()
            .flatMap(({ term }) => (term ? [term] : [])),
        ),
      )
      for (const { term } of visuals.glossary) {
        expect(marked.has(term), `${topicId}: ${term}`).toBe(true)
      }
    }
  })

  it('VPC 주제의 약어는 IAM·EC2·ACL·VPN 넷이다', () => {
    expect(visualsByTopicId['vpc-networking'].glossary.map(({ term }) => term)).toEqual(['IAM', 'EC2', 'ACL', 'VPN'])
  })

  it('단계 그림의 근거는 실제 개념 id이고, 키가 단계 목록을 가진 개념이며 단계 번호가 그 개념의 번호 항목과 같다', () => {
    const conceptIds = new Set(topics.flatMap(({ concepts }) => concepts.map(({ id }) => id)))
    const withStepFigures = Object.entries(visualsByTopicId).filter(([, visuals]) => visuals.stepFigures)

    expect(withStepFigures.map(([topicId]) => topicId)).toContain('identity-federation')
    for (const [topicId, visuals] of withStepFigures) {
      const topic = topics.find(({ id }) => id === topicId)!
      for (const [conceptId, figures] of Object.entries(visuals.stepFigures!)) {
        const concept = topic.concepts.find(({ id }) => id === conceptId)
        expect(concept, conceptId).toBeDefined()
        const numbers = groupParagraphs(concept!.paragraphs)
          .flatMap((block) => (block.kind === 'steps' ? block.items.map(({ number }) => number) : []))
        expect(numbers.length, conceptId).toBeGreaterThan(0)
        expect(Object.keys(figures).map(Number), conceptId).toEqual(numbers)
        for (const { sources } of Object.values(figures)) {
          expect(sources.length).toBeGreaterThan(0)
          for (const source of sources) {
            expect(conceptIds.has(source), source).toBe(true)
          }
        }
      }
    }
  })
})
