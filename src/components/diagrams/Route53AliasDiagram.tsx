import { Fragment, useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId.route53.diagrams['alias-record']

// 그룹 라벨은 두 배치 모두 박스 왼쪽 위(x + 8, y + 16)에 둔다.
const groups = [
  { id: 'tg', x: 8, y: 148, width: 264, height: 100 },
]

const nodes = [
  { id: 'record', x: 32, y: 8, width: 112, color: 'stroke-diagram-managed' },
  { id: 'alb', x: 32, y: 88, width: 112, color: 'stroke-diagram-resource' },
  { id: 'ec2', x: 148, y: 180, width: 100, color: 'stroke-diagram-resource' },
  { id: 'ec2-new', x: 24, y: 180, width: 100, color: 'stroke-diagram-resource' },
]

// 공용 IP 직접 연결은 오른쪽 통로(x 264)로 내려가 EC2 오른쪽에 닿는다.
export const paths: Record<string, string> = {
  'record-alb': 'M88 40 V88',
  'alb-ec2': 'M88 120 V136 H198 V180',
  'alb-ec2-new': 'M88 120 V136 H74 V180',
  'record-ec2': 'M144 24 H264 V196 H248',
}

const notes = [
  { id: 'replaced', x: 198, y: 232, textAnchor: 'middle' as const, scenarios: ['replace'] },
  { id: 'record-same', x: 194, y: 56, textAnchor: 'middle' as const, scenarios: ['replace'] },
  { id: 'record-edit', x: 194, y: 56, textAnchor: 'middle' as const, scenarios: ['direct-ip'] },
  // 본문 예시 IP. EC2 아래 대상 그룹 안에 두며, 같은 자리의 replaced와 시나리오가 달라 겹치지 않는다.
  { id: 'public-ip', x: 198, y: 232, textAnchor: 'middle' as const, scenarios: ['direct-ip'] },
]

// 가로형은 왼쪽에서 오른쪽으로 레코드 · ALB · 대상 그룹을 둔다. 대상 그룹 안에서 새 EC2가 위, 기존 EC2가 아래다.
const wideGroups = [
  { id: 'tg', x: 248, y: 8, width: 188, height: 112 },
]

// 라벨과 색은 세로형 nodes에서 id로 가져온다.
const wideNodes = [
  { id: 'record', x: 8, y: 40, width: 104 },
  { id: 'alb', x: 144, y: 40, width: 72 },
  { id: 'ec2', x: 264, y: 80, width: 56 },
  { id: 'ec2-new', x: 264, y: 32, width: 56 },
]

// 공용 IP 직접 연결은 ALB와 대상 그룹 아래 통로(y 128)로 돌아 EC2 아래 변에 닿는다.
const widePaths: Record<string, string> = {
  'record-alb': 'M112 56 H144',
  'alb-ec2': 'M216 64 H240 V96 H264',
  'alb-ec2-new': 'M216 48 H264',
  'record-ec2': 'M96 72 V128 H292 V112',
}

// 곁말은 자리와 정렬만 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
// 교체됨·공용 IP는 대상 그룹 안 기존 EC2 오른쪽에, 레코드 곁말은 도메인 이름 아래에 둔다.
const wideNotes = [
  { id: 'replaced', x: 328, y: 100, textAnchor: 'start' as const },
  { id: 'record-same', x: 48, y: 88, textAnchor: 'middle' as const },
  { id: 'record-edit', x: 48, y: 88, textAnchor: 'middle' as const },
  { id: 'public-ip', x: 328, y: 100, textAnchor: 'start' as const },
]

export const route53AliasScenarios: DiagramScenario[] = [
  { id: 'alias', nodes: ['record', 'alb', 'ec2'], paths: ['record-alb', 'alb-ec2'] },
  { id: 'replace', nodes: ['record', 'alb', 'ec2-new'], paths: ['record-alb', 'alb-ec2-new'] },
  { id: 'direct-ip', nodes: ['record', 'ec2'], paths: ['record-ec2'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function Route53AliasDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-route53-alias-arrow`
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes.map((node) => ({ ...nodes.find(({ id }) => id === node.id)!, ...node })) : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={route53AliasScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 136' : '0 0 280 256'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {layoutGroups.map((group) => (
            <Fragment key={group.id}>
              <rect data-group={group.id} className="fill-none stroke-diagram-resource" x={group.x} y={group.y} width={group.width} height={group.height} rx="6" strokeWidth="1" />
              <text x={group.x + 8} y={group.y + 16} className="fill-muted" fontSize="9">{text.groups![group.id]}</text>
            </Fragment>
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
              <rect className={`fill-panel ${node.color}`} x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {active && layoutNotes.filter((note) => note.scenarios.includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.textAnchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
