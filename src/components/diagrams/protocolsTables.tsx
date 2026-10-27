import { visualsByTopicId } from '../../data/network'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const tables = visualsByTopicId['protocols-encapsulation'].tables

export function ReferenceModelTable() {
  return <ComparisonTableFigure table={tables['reference-models']} />
}
