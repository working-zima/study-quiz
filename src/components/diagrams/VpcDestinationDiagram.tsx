import { useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['vpc-networking'].diagrams['vpc-destination']

// 목적지는 세로로 쌓고, 각 조건과 답은 한 줄 전체 폭의 두 줄 노드에 둔다.
const groups = [
  { id: 'internet', y: 8 },
  { id: 'services', y: 208 },
  { id: 'application', y: 408 },
  { id: 'vpcs', y: 608 },
]

const nodes = [
  { id: 'inet-ipv4', x: 20, y: 36, width: 240 },
  { id: 'inet-ipv6', x: 20, y: 88, width: 240 },
  { id: 'inet-both', x: 20, y: 140, width: 240 },
  { id: 'svc-gateway', x: 20, y: 236, width: 240 },
  { id: 'svc-interface', x: 20, y: 288, width: 240 },
  { id: 'svc-no-public', x: 20, y: 340, width: 240 },
  { id: 'app-private', x: 20, y: 436, width: 240 },
  { id: 'app-scope', x: 20, y: 488, width: 240 },
  { id: 'app-routing', x: 20, y: 540, width: 240 },
  { id: 'vpc-pair', x: 20, y: 636, width: 240 },
  { id: 'vpc-many', x: 20, y: 688, width: 240 },
  { id: 'vpc-isolated', x: 20, y: 740, width: 240 },
]

// 가로형은 세로형의 읽는 순서를 유지하며 목적지 넷을 2×2로 놓는다.
const wideGroups = [
  { id: 'internet', x: 8, y: 8, width: 208, labelX: 20, labelY: 22 },
  { id: 'services', x: 224, y: 8, width: 208, labelX: 236, labelY: 22 },
  { id: 'application', x: 8, y: 208, width: 208, labelX: 20, labelY: 222 },
  { id: 'vpcs', x: 224, y: 208, width: 208, labelX: 236, labelY: 222 },
]

const wideNodes = [
  { id: 'inet-ipv4', x: 20, y: 36, width: 184 },
  { id: 'inet-ipv6', x: 20, y: 88, width: 184 },
  { id: 'inet-both', x: 20, y: 140, width: 184 },
  { id: 'svc-gateway', x: 236, y: 36, width: 184 },
  { id: 'svc-interface', x: 236, y: 88, width: 184 },
  { id: 'svc-no-public', x: 236, y: 140, width: 184 },
  { id: 'app-private', x: 20, y: 236, width: 184 },
  { id: 'app-scope', x: 20, y: 288, width: 184 },
  { id: 'app-routing', x: 20, y: 340, width: 184 },
  { id: 'vpc-pair', x: 236, y: 236, width: 184 },
  { id: 'vpc-many', x: 236, y: 288, width: 184 },
  { id: 'vpc-isolated', x: 236, y: 340, width: 184 },
]

// 문구는 JSON에서 읽고 선택에 따른 노드 묶음만 여기서 정한다. 경로는 없다.
export const vpcDestinationScenarios: DiagramScenario[] = [
  { id: 'd1', nodes: ['inet-ipv4', 'inet-ipv6', 'inet-both'], paths: [] },
  { id: 'd2', nodes: ['svc-gateway', 'svc-interface', 'svc-no-public'], paths: [] },
  { id: 'd3', nodes: ['app-private', 'app-scope', 'app-routing'], paths: [] },
  { id: 'd4', nodes: ['vpc-pair', 'vpc-many', 'vpc-isolated'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function VpcDestinationDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  // 세로형은 기존 JSX의 고정 좌표를 그대로 보충해 같은 마크업으로 그린다.
  const layoutGroups = wide ? wideGroups : groups.map((group) => ({
    ...group, x: 8, width: 264, labelX: 20, labelY: group.y + 14,
  }))

  return (
    <DiagramFrame
      label={text.label}
      idleCaption={text.idleCaption}
      scenarios={vpcDestinationScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 400' : '0 0 280 800'}>
          {layoutGroups.map((group) => (
            <g key={group.id}>
              <rect data-group={group.id} className="fill-none stroke-disabled" x={group.x} y={group.y} width={group.width} height="184" rx="6" strokeWidth="1" />
              <text className="fill-muted" x={group.labelX} y={group.labelY} fontSize="9">{text.groups?.[group.id]}</text>
            </g>
          ))}

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={active && !active.nodes.includes(node.id) ? 0.25 : 1}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="44" rx="4" strokeWidth="1.5" />
              <text className="fill-muted" x={node.x + node.width / 2} y={node.y + 13} dominantBaseline="central" textAnchor="middle" fontSize="9">
                {text.nodeNotes?.[node.id]}
              </text>
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 31} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
