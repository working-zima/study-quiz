import { visualsByTopicId } from '../../data/azure'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const tables = visualsByTopicId['azure-storage'].tables

export function RedundancyOptionsTable() {
  return <ComparisonTableFigure table={tables['redundancy-options']} />
}

export function StorageAccountTypesTable() {
  return <ComparisonTableFigure table={tables['account-types']} />
}
