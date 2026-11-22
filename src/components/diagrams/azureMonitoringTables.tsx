import { visualsByTopicId } from '../../data/azure'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const tables = visualsByTopicId['azure-monitoring'].tables

export function ToolChoiceTable() {
  return <ComparisonTableFigure table={tables['tool-choice']} />
}

export function MonitorFeaturesTable() {
  return <ComparisonTableFigure table={tables['monitor-features']} />
}
