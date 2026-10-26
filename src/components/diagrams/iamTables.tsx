import { visualsByTopicId } from '../../data/aws'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const tables = visualsByTopicId['iam-permissions'].tables

export function GroupMembersTable() {
  return <ComparisonTableFigure table={tables['group-members']} />
}

export function CredentialTable() {
  return <ComparisonTableFigure table={tables['credentials']} />
}

export function AnalyzerToolTable() {
  return <ComparisonTableFigure table={tables['analyzer-tools']} />
}
