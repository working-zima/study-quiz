import { visualsByTopicId } from '../../data/aws'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const tables = visualsByTopicId['vpc-networking'].tables

// registry는 인자 없는 컴포넌트를 받으므로 표마다 JSON의 표를 넘기는 컴포넌트를 둔다.
export function AttachTargetsTable() {
  return <ComparisonTableFigure table={tables['attach-targets']} />
}

export function EndpointTypesTable() {
  return <ComparisonTableFigure table={tables['endpoint-types']} />
}

export function NatInstanceVsGatewayTable() {
  return <ComparisonTableFigure table={tables['nat-instance-vs-gateway']} />
}

export function PrivateConnectivityTable() {
  return <ComparisonTableFigure table={tables['private-connectivity']} />
}

export function FlowLogsVsCloudTrailTable() {
  return <ComparisonTableFigure table={tables['flow-logs-vs-cloudtrail']} />
}

export function ConnectionTargetsTable() {
  return <ComparisonTableFigure table={tables['nat-endpoint-privatelink-peering']} />
}
