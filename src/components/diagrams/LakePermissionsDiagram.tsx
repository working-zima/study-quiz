import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['emr-glue-athena'].diagrams['lake-permissions']

// Lake Formation과 데이터 레이크를 위아래 박스로 나눈다. 그룹 경계는 시나리오와 무관하게 남긴다.
// Lake Formation 박스는 폭을 240으로 줄여 오른쪽에 S3 직접 읽기가 내려갈 통로(x 272)를 남긴다.
const groups = [
  { id: 'lake-formation', x: 4, y: 112, width: 240, height: 64 },
  { id: 'lake', x: 4, y: 200, width: 272, height: 64 },
]

// 데이터베이스·시각화 도구·Athena는 두 박스 위 밖에 둔다.
const nodes = [
  { id: 'database', x: 8, y: 8, width: 120, color: 'stroke-disabled' },
  { id: 'viz', x: 160, y: 8, width: 104, color: 'stroke-disabled' },
  { id: 'athena', x: 160, y: 64, width: 104, color: 'stroke-diagram-managed' },
  { id: 'lf-tags', x: 12, y: 136, width: 72, color: 'stroke-diagram-managed' },
  { id: 'blueprint', x: 88, y: 136, width: 72, color: 'stroke-diagram-managed' },
  { id: 'permissions', x: 164, y: 136, width: 72, color: 'stroke-diagram-managed' },
  { id: 'table-1', x: 12, y: 224, width: 80, color: 'stroke-disabled' },
  { id: 'table-2', x: 100, y: 224, width: 80, color: 'stroke-disabled' },
  { id: 'table-new', x: 188, y: 224, width: 80, color: 'stroke-disabled' },
]

// 레이크로 들어가는 화살표는 테이블 노드가 아니라 데이터 레이크 박스의 위 변에서 끝난다.
// S3 직접 읽기는 Lake Formation 박스 오른쪽 바깥 통로로 내려가 그 박스를 지나지 않는다.
const paths: Record<string, string> = {
  'database-blueprint': 'M108 40 V136',
  'blueprint-lake': 'M124 168 V200',
  'viz-athena': 'M212 40 V64',
  'athena-permissions': 'M200 96 V136',
  'permissions-lake': 'M200 168 V200',
  'viz-lake': 'M264 24 H272 V200',
  'lf-tags-lake': 'M48 168 V200',
}

// 열·행 권한 적용과 IAM·버킷 정책만은 두 박스 사이 같은 줄을 장면마다 나눠 쓴다.
const notes = [
  { id: 'ingest', x: 102, y: 92, textAnchor: 'end' as const, scenarios: ['blueprint'] },
  { id: 'applied', x: 206, y: 192, textAnchor: 'start' as const, scenarios: ['via-athena'] },
  { id: 'policy-only', x: 266, y: 192, textAnchor: 'end' as const, scenarios: ['direct-s3'] },
  { id: 'by-tag', x: 54, y: 192, textAnchor: 'start' as const, scenarios: ['lf-tags'] },
  { id: 'new-table', x: 228, y: 218, textAnchor: 'middle' as const, scenarios: ['lf-tags'] },
]

// 가로형은 데이터베이스·시각화 도구 → Athena → Lake Formation → 데이터 레이크를 왼쪽에서 오른쪽으로 둔다.
const wideGroups = [
  { id: 'lake-formation', x: 216, y: 8, width: 104, height: 152 },
  { id: 'lake', x: 336, y: 8, width: 100, height: 168 },
]

// 라벨과 색은 세로형 nodes에서 id로 가져온다.
const wideNodes = [
  { id: 'database', x: 8, y: 32, width: 120 },
  { id: 'viz', x: 8, y: 76, width: 104 },
  { id: 'athena', x: 128, y: 76, width: 72 },
  { id: 'blueprint', x: 224, y: 32, width: 88 },
  { id: 'permissions', x: 224, y: 76, width: 88 },
  { id: 'lf-tags', x: 224, y: 120, width: 88 },
  { id: 'table-1', x: 344, y: 32, width: 84 },
  { id: 'table-2', x: 344, y: 76, width: 84 },
  { id: 'table-new', x: 344, y: 120, width: 84 },
]

// 레이크로 들어가는 화살표는 데이터 레이크 박스의 왼쪽 변에서 끝난다.
// S3 직접 읽기는 두 박스 아래를 지나 데이터 레이크 박스의 아래 변으로 들어간다.
const widePaths: Record<string, string> = {
  'database-blueprint': 'M128 48 H224',
  'blueprint-lake': 'M312 48 H336',
  'viz-athena': 'M112 92 H128',
  'athena-permissions': 'M200 92 H224',
  'permissions-lake': 'M312 92 H336',
  'viz-lake': 'M60 108 V184 H386 V176',
  'lf-tags-lake': 'M312 136 H336',
}

// 곁말은 자리와 정렬이 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'ingest', x: 176, y: 42, textAnchor: 'middle' as const },
  { id: 'applied', x: 164, y: 124, textAnchor: 'middle' as const },
  { id: 'policy-only', x: 140, y: 180, textAnchor: 'middle' as const },
  { id: 'by-tag', x: 208, y: 140, textAnchor: 'end' as const },
  { id: 'new-table', x: 386, y: 170, textAnchor: 'middle' as const },
]

export const lakePermissionsScenarios: DiagramScenario[] = [
  {
    id: 'blueprint',
    nodes: ['database', 'blueprint', 'table-1', 'table-2', 'table-new'],
    paths: ['database-blueprint', 'blueprint-lake'],
  },
  {
    id: 'via-athena',
    nodes: ['viz', 'athena', 'permissions', 'table-1', 'table-2', 'table-new'],
    paths: ['viz-athena', 'athena-permissions', 'permissions-lake'],
  },
  { id: 'direct-s3', nodes: ['viz', 'table-1', 'table-2', 'table-new'], paths: ['viz-lake'] },
  { id: 'lf-tags', nodes: ['lf-tags', 'table-1', 'table-2', 'table-new'], paths: ['lf-tags-lake'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function LakePermissionsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-lake-permissions-arrow`
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
      scenarios={lakePermissionsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 192' : '0 0 280 272'}>
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
          {layoutGroups.map((group) => (
            <text key={group.id} data-group-label={group.id} x={group.x + 10} y={group.y + 14} className="fill-muted" fontSize="9">
              {text.groups?.[group.id]}
            </text>
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
