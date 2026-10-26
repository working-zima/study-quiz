import { visualsByTopicId } from '../../data/aws'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const tables = visualsByTopicId['governance-iac'].tables

export function GovernanceToolTable() {
  return <ComparisonTableFigure table={tables['tool-choice']} />
}
