import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'
import { networkSubject } from '../../data/network'
import { diagramsByConceptId } from './registry'

// 네트워크 과목은 개념마다 도식이 하나 이상이고, 비교표는 도식을 대신하지 않는다(ADR-056).
// 컴포넌트가 도식인지 표인지는 이름의 끝(`Diagram`·`Table`)으로 가른다. 어느 쪽도 아니면 판정할 수 없으므로 위반으로 본다.
// 예외를 더하지 말고 도식을 그린다(ADR-056). AWS 개념에는 이 규칙을 걸지 않는다.

type Kind = 'diagram' | 'table' | 'unknown'

const kindOf = (component: ComponentType): Kind =>
  component.name.endsWith('Diagram') ? 'diagram' : component.name.endsWith('Table') ? 'table' : 'unknown'

const componentsOf = (conceptId: string): ComponentType[] => {
  const entry = diagramsByConceptId[conceptId]
  if (entry === undefined) return []
  return Array.isArray(entry) ? entry : [entry]
}

const conceptIds = networkSubject.topics.flatMap(({ concepts }) => concepts.map(({ id }) => id))

describe('네트워크 개념의 도식', () => {
  it('모든 네트워크 개념에 도식이 하나 이상 붙어 있다', () => {
    const missing = conceptIds.filter((conceptId) => !componentsOf(conceptId).some((component) => kindOf(component) === 'diagram'))

    expect(missing).toEqual([])
  })

  it('네트워크 개념에 붙은 컴포넌트는 이름으로 도식인지 표인지 가를 수 있다', () => {
    const unknown = conceptIds.flatMap((conceptId) =>
      componentsOf(conceptId)
        .filter((component) => kindOf(component) === 'unknown')
        .map((component) => `${conceptId}: ${component.name || '(이름 없음)'}`),
    )

    expect(unknown).toEqual([])
  })

  it('도식과 표가 함께 붙은 네트워크 개념은 도식을 모두 표보다 앞에 둔다', () => {
    const misordered = conceptIds.filter((conceptId) => {
      const kinds = componentsOf(conceptId).map(kindOf)
      const lastDiagram = kinds.lastIndexOf('diagram')
      const firstTable = kinds.indexOf('table')
      return lastDiagram !== -1 && firstTable !== -1 && firstTable < lastDiagram
    })

    expect(misordered).toEqual([])
  })

  it('네트워크 주제로 시작하는 registry 키는 모두 실제 네트워크 개념 id다', () => {
    const known = new Set(conceptIds)
    const prefixes = networkSubject.topics.map(({ id }) => `${id}.`)
    const orphans = Object.keys(diagramsByConceptId).filter(
      (key) => prefixes.some((prefix) => key.startsWith(prefix)) && !known.has(key),
    )

    expect(orphans).toEqual([])
  })
})
