import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'
import { azureSubject } from '../../data/azure'
import { diagramsByConceptId } from './registry'

// Azure 과목은 주제마다 도식이 하나 이상이다. 구조·흐름이 있는 개념(지역과 가용성 영역, 리소스 계층, 공동 책임 같은 것)에는
// 개념마다 두지만, 어느 개념이 그런지는 각 phase의 설계가 정하므로 이 테스트는 주제 단위만 본다. 비교표는 도식을 대신하지 않는다
// (사용자 결정 2026-10-30). 네트워크 과목의 「개념마다 최소 하나」(ADR-056, networkDiagramCoverage.test.ts)와 다른 규칙이다.
// 컴포넌트가 도식인지 표인지는 이름의 끝(`Diagram`·`Table`)으로 가른다. 어느 쪽도 아니면 판정할 수 없으므로 위반으로 본다.
// 예외를 더하지 말고 도식을 그린다.

type Kind = 'diagram' | 'table' | 'unknown'

const kindOf = (component: ComponentType): Kind =>
  component.name.endsWith('Diagram') ? 'diagram' : component.name.endsWith('Table') ? 'table' : 'unknown'

const componentsOf = (conceptId: string): ComponentType[] => {
  const entry = diagramsByConceptId[conceptId]
  if (entry === undefined) return []
  return Array.isArray(entry) ? entry : [entry]
}

const conceptIds = azureSubject.topics.flatMap(({ concepts }) => concepts.map(({ id }) => id))

describe('Azure 주제의 도식', () => {
  it('모든 Azure 주제에 도식이 하나 이상 붙어 있다', () => {
    const missing = azureSubject.topics
      .filter(({ concepts }) =>
        !concepts.some(({ id }) => componentsOf(id).some((component) => kindOf(component) === 'diagram')),
      )
      .map(({ id }) => id)

    expect(missing).toEqual([])
  })

  it('Azure 개념에 붙은 컴포넌트는 이름으로 도식인지 표인지 가를 수 있다', () => {
    const unknown = conceptIds.flatMap((conceptId) =>
      componentsOf(conceptId)
        .filter((component) => kindOf(component) === 'unknown')
        .map((component) => `${conceptId}: ${component.name || '(이름 없음)'}`),
    )

    expect(unknown).toEqual([])
  })

  it('도식과 표가 함께 붙은 Azure 개념은 도식을 모두 표보다 앞에 둔다', () => {
    const misordered = conceptIds.filter((conceptId) => {
      const kinds = componentsOf(conceptId).map(kindOf)
      const lastDiagram = kinds.lastIndexOf('diagram')
      const firstTable = kinds.indexOf('table')
      return lastDiagram !== -1 && firstTable !== -1 && firstTable < lastDiagram
    })

    expect(misordered).toEqual([])
  })

  it('Azure 주제로 시작하는 registry 키는 모두 실제 Azure 개념 id다', () => {
    const known = new Set(conceptIds)
    const prefixes = azureSubject.topics.map(({ id }) => `${id}.`)
    const orphans = Object.keys(diagramsByConceptId).filter(
      (key) => prefixes.some((prefix) => key.startsWith(prefix)) && !known.has(key),
    )

    expect(orphans).toEqual([])
  })
})
