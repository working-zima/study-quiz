import { visualsByTopicId } from '../../data/aws'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const tables = visualsByTopicId['route53'].tables

export function Route53PolicyTable() {
  return <ComparisonTableFigure table={tables['routing-policies']} />
}
