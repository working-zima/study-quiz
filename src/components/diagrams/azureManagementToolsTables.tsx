import { visualsByTopicId } from '../../data/azure'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const tables = visualsByTopicId['azure-management-tools'].tables

export function CommandToolsTable() {
  return <ComparisonTableFigure table={tables['command-tools']} />
}
