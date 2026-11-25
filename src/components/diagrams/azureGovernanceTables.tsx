import { visualsByTopicId } from '../../data/azure'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const tables = visualsByTopicId['azure-governance'].tables

export function GovernanceToolChoiceTable() {
  return <ComparisonTableFigure table={tables['governance-tool-choice']} />
}

export function GovernanceToolsTable() {
  return <ComparisonTableFigure table={tables['governance-tools']} />
}
