import { visualsByTopicId } from '../../data/azure'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const tables = visualsByTopicId['azure-infrastructure-as-code'].tables

export function DeploymentMethodsTable() {
  return <ComparisonTableFigure table={tables['deployment-methods']} />
}
