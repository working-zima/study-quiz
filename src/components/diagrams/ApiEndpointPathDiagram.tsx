import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['api-gateway-step-functions'].diagrams['endpoint-path']

// 위는 CloudFront의 엣지, 아래는 API가 배포된 리전이다. 그룹 경계는 시나리오와 무관하게 남긴다.
// 엣지 박스는 오른쪽 바깥 통로(x 270)가 박스 밖에 남도록 리전 박스보다 좁다.
const groups = [
  { id: 'edge', x: 4, y: 56, width: 256, height: 64 },
  { id: 'region', x: 4, y: 136, width: 272, height: 132 },
]

const nodes = [
  { id: 'user', x: 82, y: 8, width: 116, color: 'stroke-disabled' },
  { id: 'cloudfront', x: 82, y: 80, width: 116, color: 'stroke-diagram-managed' },
  { id: 's3', x: 20, y: 168, width: 108, color: 'stroke-diagram-managed' },
  { id: 'api', x: 152, y: 168, width: 108, color: 'stroke-diagram-managed' },
  { id: 'lambda', x: 152, y: 224, width: 108, color: 'stroke-diagram-managed' },
]

// 리전 엔드포인트로 직접 가는 경로는 엣지 박스를 피해 오른쪽 바깥 통로(x 270)로 내려간다.
const paths: Record<string, string> = {
  'user-cloudfront': 'M140 40 V80',
  'cloudfront-api': 'M180 112 V168',
  'cloudfront-s3': 'M100 112 V168',
  'user-api': 'M198 24 H270 V184 H260',
  'api-lambda': 'M206 200 V224',
}

const notes = [
  { id: 'via-edge', x: 246, y: 70, textAnchor: 'end' as const, scenarios: ['edge'] },
  { id: 'latency-remains', x: 262, y: 150, textAnchor: 'end' as const, scenarios: ['regional'] },
  { id: 'from-cache', x: 206, y: 215, textAnchor: 'middle' as const, scenarios: ['cache'] },
  { id: 'static', x: 74, y: 215, textAnchor: 'middle' as const, scenarios: ['cdn-origins'] },
  { id: 'dynamic', x: 206, y: 215, textAnchor: 'middle' as const, scenarios: ['cdn-origins'] },
]

// 가로형은 왼쪽에서 오른쪽으로 사용자 · 엣지 · 리전을 둔다. 엣지 박스는 윗줄에만 있어
// 리전 엔드포인트로 바로 가는 길이 그 아래로 곧게 지나 API Gateway에 닿는다.
const wideGroups = [
  { id: 'edge', x: 112, y: 8, width: 112, height: 64 },
  { id: 'region', x: 240, y: 8, width: 196, height: 144 },
]

// 라벨과 색은 세로형 nodes에서 id로 가져온다.
const wideNodes = [
  { id: 'user', x: 8, y: 96, width: 92 },
  { id: 'cloudfront', x: 124, y: 32, width: 88 },
  { id: 's3', x: 252, y: 32, width: 84 },
  { id: 'api', x: 252, y: 96, width: 84 },
  { id: 'lambda', x: 352, y: 96, width: 76 },
]

const widePaths: Record<string, string> = {
  'user-cloudfront': 'M54 96 V48 H124',
  'cloudfront-api': 'M196 64 V80 H294 V96',
  'cloudfront-s3': 'M212 48 H252',
  'user-api': 'M100 112 H252',
  'api-lambda': 'M336 112 H352',
}

// 곁말은 자리와 정렬만 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'via-edge', x: 108, y: 40, textAnchor: 'end' as const },
  { id: 'latency-remains', x: 176, y: 128, textAnchor: 'middle' as const },
  { id: 'from-cache', x: 294, y: 144, textAnchor: 'middle' as const },
  { id: 'static', x: 344, y: 52, textAnchor: 'start' as const },
  { id: 'dynamic', x: 294, y: 144, textAnchor: 'middle' as const },
]

export const apiEndpointPathScenarios: DiagramScenario[] = [
  { id: 'edge', nodes: ['user', 'cloudfront', 'api', 'lambda'], paths: ['user-cloudfront', 'cloudfront-api', 'api-lambda'] },
  { id: 'regional', nodes: ['user', 'api', 'lambda'], paths: ['user-api', 'api-lambda'] },
  { id: 'cache', nodes: ['user', 'api'], paths: ['user-api'] },
  { id: 'cdn-origins', nodes: ['user', 'cloudfront', 's3', 'api'], paths: ['user-cloudfront', 'cloudfront-s3', 'cloudfront-api'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ApiEndpointPathDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-api-endpoint-path-arrow`
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
      scenarios={apiEndpointPathScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 160' : '0 0 280 276'}>
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
