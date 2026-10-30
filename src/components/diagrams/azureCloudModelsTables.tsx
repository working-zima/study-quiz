import { visualsByTopicId } from '../../data/azure'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const tables = visualsByTopicId['azure-cloud-models'].tables

export function CloudModelsTable() {
  return <ComparisonTableFigure table={tables['cloud-models']} />
}
