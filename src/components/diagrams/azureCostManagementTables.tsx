import { visualsByTopicId } from '../../data/azure'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const tables = visualsByTopicId['azure-cost-management'].tables

export function CostToolsTable() {
  return <ComparisonTableFigure table={tables['cost-tools']} />
}
