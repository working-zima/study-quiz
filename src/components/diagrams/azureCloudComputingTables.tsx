import { visualsByTopicId } from '../../data/azure'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const tables = visualsByTopicId['azure-cloud-computing'].tables

export function PricingModelsTable() {
  return <ComparisonTableFigure table={tables['pricing-models']} />
}
