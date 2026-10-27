import { describe, expect, it } from 'vitest'
import { topics, visualsByTopicId } from './index'

// src/data/aws/visuals.test.ts의 일반 단언을 네트워크에 건다. 시각 요소가 아직 없는 동안은 빈 집합으로 통과한다.

describe('네트워크 시각 요소 데이터 무결성', () => {
  it('시각 요소의 주제 키가 실제 네트워크 주제 id다', () => {
    const topicIds = new Set(topics.map(({ id }) => id))

    expect(Object.keys(visualsByTopicId).filter((topicId) => !topicIds.has(topicId))).toEqual([])
  })

  it('도식·시나리오·표의 sources가 비어 있지 않고 모두 실제 네트워크 개념 id다', () => {
    const conceptIds = new Set(topics.flatMap(({ concepts }) => concepts.map(({ id }) => id)))
    const problems = Object.entries(visualsByTopicId).flatMap(([topicId, visuals]) => {
      const sourcedItems = [
        ...Object.entries(visuals.diagrams).flatMap(([diagramId, diagram]) => [
          { where: `${topicId} 도식 ${diagramId}`, sources: diagram.sources },
          ...diagram.scenarios.map(({ id, sources }) => ({ where: `${topicId} 도식 ${diagramId} 시나리오 ${id}`, sources })),
        ]),
        ...Object.entries(visuals.tables).map(([tableId, { sources }]) => ({ where: `${topicId} 표 ${tableId}`, sources })),
      ]
      return sourcedItems.flatMap(({ where, sources }) => [
        ...(sources.length === 0 ? [`${where}: sources가 비었다`] : []),
        ...sources.filter((source) => !conceptIds.has(source)).map((source) => `${where}: ${source}`),
      ])
    })

    expect(problems).toEqual([])
  })

  it('표의 열은 셋 이하이고, 행의 셀 수는 열 수에서 하나를 뺀 값이며, columnWidths는 열 수와 같고 합이 100%다', () => {
    const problems = Object.entries(visualsByTopicId).flatMap(([topicId, visuals]) =>
      Object.entries(visuals.tables).flatMap(([tableId, table]) => {
        const where = `${topicId} 표 ${tableId}`
        const widths = table.columnWidths
        const widthTotal = widths?.reduce((sum, width) => sum + Number.parseFloat(width), 0)
        return [
          ...(table.columns.length > 3 ? [`${where}: 열이 ${table.columns.length}개다`] : []),
          ...table.rows
            .filter(({ cells }) => cells.length !== table.columns.length - 1)
            .map(({ header, cells }) => `${where} 행 ${header}: 셀이 ${cells.length}개다`),
          ...(widths && widths.length !== table.columns.length ? [`${where}: columnWidths가 ${widths.length}개다`] : []),
          ...(widths && widths.some((width) => !/^\d+(\.\d+)?%$/.test(width)) ? [`${where}: columnWidths가 백분율이 아니다`] : []),
          ...(widthTotal !== undefined && Math.abs(widthTotal - 100) > 1e-6 ? [`${where}: columnWidths의 합이 ${widthTotal}%다`] : []),
        ]
      }),
    )

    expect(problems).toEqual([])
  })

  it('도식 안의 시나리오 id는 유일하고 caption은 20자를 넘는다', () => {
    const problems = Object.entries(visualsByTopicId).flatMap(([topicId, visuals]) =>
      Object.entries(visuals.diagrams).flatMap(([diagramId, diagram]) => {
        const where = `${topicId} 도식 ${diagramId}`
        const ids = diagram.scenarios.map(({ id }) => id)
        return [
          ...(new Set(ids).size !== ids.length ? [`${where}: 시나리오 id가 겹친다`] : []),
          ...diagram.scenarios
            .filter(({ caption }) => caption.length <= 20)
            .map(({ id, caption }) => `${where} 시나리오 ${id}: caption ${caption.length}자`),
        ]
      }),
    )

    expect(problems).toEqual([])
  })

  // 약어 툴팁은 AWS의 VPC 주제에만 둔다(ADR-037).
  it('glossary는 모든 주제에서 빈 배열이다', () => {
    expect(
      Object.entries(visualsByTopicId)
        .filter(([, visuals]) => visuals.glossary.length > 0)
        .map(([topicId]) => topicId),
    ).toEqual([])
  })
})
