import { visualsByTopicId } from '../../data/aws'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const tables = visualsByTopicId['emr-glue-athena'].tables

export function AnalyticsServiceTable() {
  return <ComparisonTableFigure table={tables['service-roles']} />
}

export function LogStorageTable() {
  return <ComparisonTableFigure table={tables['log-storage']} />
}
