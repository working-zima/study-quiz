import { visualsByTopicId } from '../../data/azure'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const tables = visualsByTopicId['azure-monitoring'].tables

export function MonitorFeaturesTable() {
  return <ComparisonTableFigure table={tables['monitor-features']} />
}
