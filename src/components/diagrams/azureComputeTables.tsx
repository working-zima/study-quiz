import { visualsByTopicId } from '../../data/azure'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const tables = visualsByTopicId['azure-compute'].tables

export function HostingOptionsTable() {
  return <ComparisonTableFigure table={tables['hosting-options']} />
}
