import { visualsByTopicId } from '../../data/azure'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const tables = visualsByTopicId['azure-cost-management'].tables

export function CostToolChoiceTable() {
  return <ComparisonTableFigure table={tables['cost-tool-choice']} />
}

export function CostToolsTable() {
  return <ComparisonTableFigure table={tables['cost-tools']} />
}
