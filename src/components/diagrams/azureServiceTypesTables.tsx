import { visualsByTopicId } from '../../data/azure'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const tables = visualsByTopicId['azure-service-types'].tables

export function ServiceTypesTable() {
  return <ComparisonTableFigure table={tables['service-types']} />
}
