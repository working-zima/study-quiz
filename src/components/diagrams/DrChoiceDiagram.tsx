import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['backup-disaster-recovery'].diagrams['dr-choice']

// 원본 위치 → 복구 시간 목표 → 방식 순서다. 방식은 준비 상태와 이름을 두 줄로 둔다.
// 그룹 라벨 자리는 두 배치 모두 박스 왼쪽 위에서 x + 12, y + 18이다.
const groups = [
  { id: 'source', x: 12, y: 8, width: 256, height: 84 },
  { id: 'rto', x: 12, y: 120, width: 256, height: 84 },
  { id: 'strategy', x: 12, y: 232, width: 256, height: 200 },
]
const nodes = [
  { id: 'onprem', x: 20, y: 40, width: 112, height: 32 },
  { id: 'aws', x: 148, y: 40, width: 112, height: 32 },
  { id: 'rto-hours', x: 20, y: 152, width: 112, height: 32 },
  { id: 'rto-seconds', x: 148, y: 152, width: 112, height: 32 },
  { id: 'backup-restore', x: 20, y: 264, width: 240, height: 44 },
  { id: 'warm-standby', x: 20, y: 320, width: 240, height: 44 },
  { id: 'drs', x: 20, y: 376, width: 240, height: 44 },
]

// 온프레미스는 왼쪽 바깥 x=4로 RTO 단을 건너뛴다.
// 다른 경로는 열 사이 x=140과 오른쪽 바깥 x=276으로 노드·그룹 라벨을 피한다.
const paths: Record<string, string> = {
  'aws-hours': 'M204 72 V104 H140 V168 H132',
  'hours-backup-restore': 'M76 184 V216 H140 V264',
  'aws-seconds': 'M204 72 V152',
  'seconds-warm-standby': 'M204 184 V216 H276 V342 H260',
  'onprem-drs': 'M20 56 H4 V398 H20',
}

// 가로형은 원본 위치를 위에 두고, 그 아래 왼쪽 열이 복구 시간 목표, 오른쪽 열이 방식이다.
const wideGroups = [
  { id: 'source', x: 12, y: 8, width: 416, height: 76 },
  { id: 'rto', x: 12, y: 100, width: 112, height: 132 },
  { id: 'strategy', x: 140, y: 100, width: 288, height: 192 },
]

// 높이는 세로형 nodes에서 id로 가져온다(방식만 44). 시간 목표 둘은 이어지는 방식과 세로 가운데가 같고,
// 화살표가 짧아지도록 원본 위치 안에서 AWS를 왼쪽, 온프레미스를 오른쪽에 둔다.
const wideNodes = [
  { id: 'onprem', x: 320, y: 40, width: 96 },
  { id: 'aws', x: 20, y: 40, width: 96 },
  { id: 'rto-hours', x: 20, y: 138, width: 96 },
  { id: 'rto-seconds', x: 20, y: 190, width: 96 },
  { id: 'backup-restore', x: 152, y: 132, width: 264, height: 44 },
  { id: 'warm-standby', x: 152, y: 184, width: 264, height: 44 },
  { id: 'drs', x: 152, y: 236, width: 264, height: 44 },
]

// AWS → 60초는 왼쪽 바깥 x=8, 온프레미스 → Elastic Disaster Recovery는 오른쪽 바깥 x=432로 돈다.
const widePaths: Record<string, string> = {
  'aws-hours': 'M104 72 V138',
  'hours-backup-restore': 'M116 154 H152',
  'aws-seconds': 'M20 56 H8 V206 H20',
  'seconds-warm-standby': 'M116 206 H152',
  'onprem-drs': 'M416 56 H432 V258 H416',
}

export const drChoiceScenarios: DiagramScenario[] = [
  { id: 'r1', nodes: ['aws', 'rto-hours', 'backup-restore'], paths: ['aws-hours', 'hours-backup-restore'] },
  { id: 'r2', nodes: ['aws', 'rto-seconds', 'warm-standby'], paths: ['aws-seconds', 'seconds-warm-standby'] },
  { id: 'r3', nodes: ['onprem', 'drs'], paths: ['onprem-drs'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function DrChoiceDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-dr-choice-arrow`
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes.map((node) => ({ ...nodes.find(({ id }) => id === node.id)!, ...node })) : nodes
  const layoutPaths = wide ? widePaths : paths

  return (
    <DiagramFrame
      label={text.label}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={drChoiceScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 300' : '0 0 280 444'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {layoutGroups.map((group) => (
            <g key={group.id}>
              <rect data-group={group.id} className="fill-none stroke-disabled" x={group.x} y={group.y} width={group.width} height={group.height} rx="4" strokeWidth="1" />
              <text className="fill-muted" x={group.x + 12} y={group.y + 18} fontSize="9">{text.groups![group.id]}</text>
            </g>
          ))}

          {active?.paths.map((id) => (
            <path
              key={id}
              data-path={id}
              d={layoutPaths[id]}
              className="fill-none stroke-title"
              strokeWidth="2"
              strokeLinejoin="round"
              markerEnd={`url(#${arrowId})`}
            />
          ))}

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={active && !active.nodes.includes(node.id) ? 0.25 : 1}>
              <rect className={`fill-panel ${node.height === 44 ? 'stroke-diagram-managed' : 'stroke-disabled'}`} x={node.x} y={node.y} width={node.width} height={node.height} rx="4" strokeWidth="1.5" />
              {text.nodeNotes?.[node.id] && (
                <text className="fill-muted" x={node.x + node.width / 2} y={node.y + 13} dominantBaseline="central" textAnchor="middle" fontSize="9">
                  {text.nodeNotes[node.id]}
                </text>
              )}
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + (node.height === 44 ? 31 : 16)} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
