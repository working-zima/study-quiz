import { visualsByTopicId } from '../../data/aws'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const tables = visualsByTopicId['backup-disaster-recovery'].tables

// registry는 인자 없는 컴포넌트를 받으므로 표마다 JSON의 표를 넘기는 컴포넌트를 둔다.
export function Ec2AssignmentTable() {
  return <ComparisonTableFigure table={tables['ec2-assignment']} />
}

export function BackupPolicyScopeTable() {
  return <ComparisonTableFigure table={tables['backup-policy-scope']} />
}

export function CopyDestinationTable() {
  return <ComparisonTableFigure table={tables['copy-destination']} />
}
