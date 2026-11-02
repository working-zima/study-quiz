import { visualsByTopicId } from '../../data/azure'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const tables = visualsByTopicId['azure-cost-factors'].tables

export function CostSavingOptionsTable() {
  return <ComparisonTableFigure table={tables['cost-saving-options']} />
}
