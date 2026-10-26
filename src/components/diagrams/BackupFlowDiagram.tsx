import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['backup-disaster-recovery'].diagrams['backup-flow']

// 그룹 라벨 자리는 두 배치 모두 박스 왼쪽 위에서 x + 12, y + 18이다.
const groups = [
  { id: 'source', x: 12, y: 68, width: 256, height: 192 },
  { id: 'backup', x: 12, y: 284, width: 256, height: 152 },
  { id: 'copies', x: 12, y: 460, width: 256, height: 84 },
]

// 그룹은 백업의 단계다. VPC 계층이 없으므로 관리 기능만 파랑으로 구별한다.
// 긴 조직 정책·감사 라벨은 축약하지 않고 한 줄 전체 폭을 쓴다.
const nodes = [
  { id: 'org-policy', x: 20, y: 12, width: 240, color: 'stroke-diagram-managed' },
  { id: 'ec2', x: 20, y: 100, width: 112, color: 'stroke-disabled' },
  { id: 'ebs', x: 148, y: 100, width: 112, color: 'stroke-disabled' },
  { id: 'rds', x: 20, y: 156, width: 112, color: 'stroke-disabled' },
  { id: 'dynamodb', x: 148, y: 156, width: 112, color: 'stroke-disabled' },
  { id: 's3', x: 20, y: 212, width: 112, color: 'stroke-disabled' },
  { id: 'plan', x: 20, y: 316, width: 112, color: 'stroke-diagram-managed' },
  { id: 'restore-test', x: 148, y: 316, width: 112, color: 'stroke-diagram-managed' },
  { id: 'audit', x: 20, y: 388, width: 240, color: 'stroke-diagram-managed' },
  { id: 'other-region', x: 20, y: 492, width: 112, color: 'stroke-disabled' },
  { id: 'other-account', x: 148, y: 492, width: 112, color: 'stroke-disabled' },
]

// 좌우 바깥 통로와 열 사이 틈을 써서 노드·그룹 라벨을 지나지 않는다.
// 사본은 백업 계획에서 직접 나가고, 대상 지정은 EC2에서만 시작한다.
const paths: Record<string, string> = {
  'rds-plan': 'M76 188 V200 H140 V332 H132',
  'dynamodb-plan': 'M204 188 V200 H140 V332 H132',
  'ec2-plan': 'M20 116 H4 V332 H20',
  'org-policy-plan': 'M260 28 H276 V272 H140 V332 H132',
  's3-plan': 'M20 228 H4 V332 H20',
  'plan-other-region': 'M76 348 V360 H4 V508 H20',
  'plan-other-account': 'M76 348 V360 H276 V508 H260',
  'plan-restore-test': 'M132 332 H148',
  'plan-audit': 'M76 348 V388',
}

// 가로형도 세 단계를 위에서 아래로 쌓고, 단계 안에서 노드를 가로로 편다.
const wideGroups = [
  { id: 'source', x: 12, y: 56, width: 416, height: 76 },
  { id: 'backup', x: 12, y: 156, width: 416, height: 76 },
  { id: 'copies', x: 12, y: 256, width: 416, height: 76 },
]

// 색은 세로형 nodes에서 id로 가져온다. 백업 계획은 RDS 바로 아래, 사본 둘은 계획 바로 아래이고 조직 정책은 그룹 밖 왼쪽 위다.
const wideNodes = [
  { id: 'org-policy', x: 20, y: 8, width: 140 },
  { id: 'ec2', x: 36, y: 88, width: 80 },
  { id: 'ebs', x: 128, y: 88, width: 64 },
  { id: 'rds', x: 204, y: 88, width: 56 },
  { id: 'dynamodb', x: 272, y: 88, width: 64 },
  { id: 's3', x: 348, y: 88, width: 56 },
  { id: 'plan', x: 184, y: 188, width: 96 },
  { id: 'restore-test', x: 296, y: 188, width: 104 },
  { id: 'audit', x: 40, y: 188, width: 128 },
  { id: 'other-region', x: 152, y: 288, width: 72 },
  { id: 'other-account', x: 240, y: 288, width: 72 },
]

// 원본 → 계획 경로는 원본 단과 백업 단 사이 띠(y 144)로 모여 계획 위 변의 x 232로 들어간다.
// 조직 정책은 그룹 밖 왼쪽 통로(x 8)로 내려와 같은 띠에 합류한다.
const widePaths: Record<string, string> = {
  'rds-plan': 'M232 120 V188',
  'dynamodb-plan': 'M304 120 V144 H232 V188',
  'ec2-plan': 'M76 120 V144 H232 V188',
  'org-policy-plan': 'M20 24 H8 V144 H232 V188',
  's3-plan': 'M376 120 V144 H232 V188',
  'plan-other-region': 'M208 220 V288',
  'plan-other-account': 'M256 220 V288',
  'plan-restore-test': 'M280 204 H296',
  'plan-audit': 'M184 204 H168',
}

export const backupFlowScenarios: DiagramScenario[] = [
  { id: 'b1', nodes: ['rds', 'dynamodb', 'plan'], paths: ['rds-plan', 'dynamodb-plan'] },
  { id: 'b2', nodes: ['ec2', 'plan'], paths: ['ec2-plan'] },
  { id: 'b3', nodes: ['org-policy', 'plan'], paths: ['org-policy-plan'] },
  { id: 'b4', nodes: ['s3', 'plan'], paths: ['s3-plan'] },
  { id: 'b5', nodes: ['plan', 'other-region', 'other-account'], paths: ['plan-other-region', 'plan-other-account'] },
  { id: 'b6', nodes: ['plan', 'restore-test'], paths: ['plan-restore-test'] },
  { id: 'b7', nodes: ['plan', 'audit'], paths: ['plan-audit'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function BackupFlowDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-backup-arrow`
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes.map((node) => ({ ...nodes.find(({ id }) => id === node.id)!, ...node })) : nodes
  const layoutPaths = wide ? widePaths : paths

  return (
    <DiagramFrame
      label={text.label}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={backupFlowScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 340' : '0 0 280 556'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          <g className="fill-none stroke-disabled" strokeWidth="1">
            {layoutGroups.map((group) => (
              <rect key={group.id} data-group={group.id} x={group.x} y={group.y} width={group.width} height={group.height} rx="4" />
            ))}
          </g>
          <g className="fill-muted" fontSize="9">
            {layoutGroups.map((group) => (
              <text key={group.id} x={group.x + 12} y={group.y + 18}>{text.groups![group.id]}</text>
            ))}
          </g>

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
              <rect className={`fill-panel ${node.color}`} x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
