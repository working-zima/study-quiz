import { visualsByTopicId } from '../../data/aws'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const tables = visualsByTopicId['api-gateway-step-functions'].tables

export function ApiTypeTable() {
  return <ComparisonTableFigure table={tables['api-types']} />
}

export function ApiAccessControlTable() {
  return <ComparisonTableFigure table={tables['access-control']} />
}
