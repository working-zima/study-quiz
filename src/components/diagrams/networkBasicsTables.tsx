import { visualsByTopicId } from '../../data/network'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const tables = visualsByTopicId['network-basics'].tables

export function PerformanceMetricsTable() {
  return <ComparisonTableFigure table={tables['performance-metrics']} />
}
