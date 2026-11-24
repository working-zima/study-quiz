import { visualsByTopicId } from '../../data/azure'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const tables = visualsByTopicId['azure-management-tools'].tables

export function ManagementToolChoiceTable() {
  return <ComparisonTableFigure table={tables['management-tool-choice']} />
}

export function CommandToolsTable() {
  return <ComparisonTableFigure table={tables['command-tools']} />
}
