import { visualsByTopicId } from '../../data/aws'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const tables = visualsByTopicId['ecs-eks-fargate'].tables

export function OrchestrationComputeTable() {
  return <ComparisonTableFigure table={tables['orchestration-compute']} />
}

export function EksRoutingTable() {
  return <ComparisonTableFigure table={tables['eks-routing']} />
}

export function EksHybridTable() {
  return <ComparisonTableFigure table={tables['eks-hybrid']} />
}

export function ComputeChoiceTable() {
  return <ComparisonTableFigure table={tables['compute-choice']} />
}
