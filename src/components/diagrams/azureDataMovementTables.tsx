import { visualsByTopicId } from '../../data/azure'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const tables = visualsByTopicId['azure-data-movement'].tables

export function DataMoveOptionsTable() {
  return <ComparisonTableFigure table={tables['data-move-options']} />
}
