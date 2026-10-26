import { useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { hubAttachmentCount, meshConnectionCount, ringPoints } from '../../lib/peering'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['vpc-networking'].diagrams['peering-scale']

// 위는 메시(피어링), 아래는 허브(Transit Gateway). 두 원은 반지름이 같다.
// 반지름 72는 VPC 10개일 때 이웃 상자끼리, 허브 원의 상자와 가운데 Transit Gateway가 겹치지 않는 값이다.
const radius = 72
const vpcBox = { width: 32, height: 20 }
const groups = [
  { id: 'mesh', x: 4, y: 4, width: 272, height: 212, cx: 140, cy: 110 },
  { id: 'hub', x: 4, y: 224, width: 272, height: 212, cx: 140, cy: 330 },
]
// 가로형은 메시를 왼쪽, 허브를 오른쪽에 나란히 둔다. 반지름과 상자 크기는 같고 그룹과 원의 중심만 옮긴다.
const wideGroups = [
  { id: 'mesh', x: 4, y: 4, width: 212, height: 212, cx: 110, cy: 110 },
  { id: 'hub', x: 224, y: 4, width: 212, height: 212, cx: 330, cy: 110 },
]
const tgw = { width: 100, height: 32 }

// 아무것도 고르지 않았을 때 그리는 VPC 수
const idleVpcCount = 4
const vpcCounts: Record<string, number> = { p3: 3, p6: 6, p10: 10 }

// 수가 바뀌면 그림 자체를 다시 그리므로 흐릴 노드도 보일 경로도 없다.
export const peeringScaleScenarios: DiagramScenario[] = text.scenarios.map(({ id, label, caption }) => ({
  id, label, caption, nodes: [], paths: [],
}))

const countNote = (count: number) => (text.notes?.count ?? '').replace('{count}', String(count))

export function PeeringScaleDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const vpcCount = active ? vpcCounts[active.id] : idleVpcCount
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const [mesh, hub] = layoutGroups
  const meshPoints = ringPoints(vpcCount, mesh.cx, mesh.cy, radius)
  const hubPoints = ringPoints(vpcCount, hub.cx, hub.cy, radius)
  const pairs = meshPoints.flatMap((from, i) => meshPoints.slice(i + 1).map((to, j) => ({ from, to, key: `${i}-${i + j + 1}` })))

  return (
    <DiagramFrame
      label={text.label}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={peeringScaleScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 220' : '0 0 280 440'}>
          <g className="fill-none stroke-disabled" strokeWidth="1">
            {layoutGroups.map((group) => (
              <rect key={group.id} data-group={group.id} x={group.x} y={group.y} width={group.width} height={group.height} rx="4" />
            ))}
          </g>
          <g className="fill-muted" fontSize="9">
            {layoutGroups.map((group) => (
              <text key={group.id} data-group-label={group.id} x={group.x + 10} y={group.y + 14}>{text.groups?.[group.id]}</text>
            ))}
            <text data-count-note="mesh" x={mesh.x + 10} y={mesh.y + mesh.height - 8}>{countNote(meshConnectionCount(vpcCount))}</text>
            <text data-count-note="hub" x={hub.x + 10} y={hub.y + hub.height - 8}>{countNote(hubAttachmentCount(vpcCount))}</text>
          </g>

          {/* 선은 상자 중심끼리 잇고, 상자가 선 끝을 덮는다. */}
          <g className="stroke-disabled" strokeWidth="1">
            {pairs.map(({ from, to, key }) => (
              <line key={key} data-mesh-line={key} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
            ))}
            {hubPoints.map((point, i) => (
              <line key={i} data-hub-line={i} x1={hub.cx} y1={hub.cy} x2={point.x} y2={point.y} />
            ))}
          </g>

          {[{ group: mesh, points: meshPoints }, { group: hub, points: hubPoints }].map(({ group, points }) => (
            <g key={group.id} data-ring={group.id}>
              {points.map((point, i) => (
                <g key={i} data-node={`${group.id}-vpc-${i}`}>
                  <rect className="fill-panel stroke-disabled" x={point.x - vpcBox.width / 2} y={point.y - vpcBox.height / 2} width={vpcBox.width} height={vpcBox.height} rx="4" strokeWidth="1.5" />
                  <text className="fill-title" x={point.x} y={point.y} dominantBaseline="central" textAnchor="middle" fontSize="10">
                    {text.nodes.vpc}
                  </text>
                </g>
              ))}
            </g>
          ))}

          <g data-node="tgw">
            <rect className="fill-panel stroke-diagram-managed" x={hub.cx - tgw.width / 2} y={hub.cy - tgw.height / 2} width={tgw.width} height={tgw.height} rx="4" strokeWidth="1.5" />
            <text className="fill-title" x={hub.cx} y={hub.cy} dominantBaseline="central" textAnchor="middle" fontSize="10">
              {text.nodes.tgw}
            </text>
          </g>
        </svg>
      </div>
    </DiagramFrame>
  )
}
