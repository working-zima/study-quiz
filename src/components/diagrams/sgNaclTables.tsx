import { visualsByTopicId } from '../../data/aws'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const tables = visualsByTopicId['security-groups-nacl'].tables

export function SgNaclCompareTable() {
  return <ComparisonTableFigure table={tables['sg-vs-nacl']} />
}
