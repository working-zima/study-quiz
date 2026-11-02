import { visualsByTopicId } from '../../data/azure'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const tables = visualsByTopicId['azure-identity'].tables

export function SignInMethodsTable() {
  return <ComparisonTableFigure table={tables['sign-in-methods']} />
}
