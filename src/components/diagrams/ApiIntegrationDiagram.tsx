import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['api-gateway-step-functions'].diagrams.integration

// 매핑 템플릿만 API Gateway 안의 기능이다. 그룹 경계는 시나리오와 무관하게 남긴다.
const groups = [
  { id: 'api-gateway', x: 4, y: 56, width: 272, height: 72 },
]

const nodes = [
  { id: 'client', x: 82, y: 8, width: 116, color: 'stroke-disabled' },
  { id: 'mapping', x: 184, y: 80, width: 76, color: 'stroke-diagram-managed' },
  { id: 'lambda', x: 20, y: 168, width: 108, color: 'stroke-diagram-managed' },
  { id: 'dynamodb', x: 152, y: 168, width: 108, color: 'stroke-diagram-managed' },
  { id: 'backend', x: 152, y: 232, width: 108, color: 'stroke-disabled' },
]

// 백엔드로 내려가는 두 경로는 오른쪽 바깥 통로(x 270)와 두 열 사이 통로(x 140)를 써서 노드를 뚫지 않는다.
const paths: Record<string, string> = {
  'request-lambda': 'M110 40 V168',
  'lambda-response': 'M76 168 V24 H82',
  'request-dynamodb': 'M170 40 V168',
  'request-mapping': 'M190 40 V80',
  'mapping-backend': 'M260 96 H270 V248 H260',
  'lambda-backend': 'M128 184 H140 V248 H152',
}

const notes = [
  { id: 'as-is', x: 116, y: 150, textAnchor: 'start' as const, scenarios: ['proxy'] },
  { id: 'as-response', x: 70, y: 150, textAnchor: 'end' as const, scenarios: ['proxy'] },
  { id: 'no-function', x: 176, y: 150, textAnchor: 'start' as const, scenarios: ['service'] },
  { id: 'fields-only', x: 264, y: 150, textAnchor: 'end' as const, scenarios: ['mapping'] },
  { id: 'json', x: 116, y: 150, textAnchor: 'start' as const, scenarios: ['transform'] },
  { id: 'xml', x: 144, y: 220, textAnchor: 'start' as const, scenarios: ['transform'] },
]

// 가로형은 왼쪽에서 오른쪽으로 클라이언트 · API Gateway · 통합 대상을 둔다.
// 요청은 API Gateway 박스를 가로로 지나고, 프록시의 응답은 박스 위 통로(y 20)로 돌아온다.
const wideGroups = [
  { id: 'api-gateway', x: 112, y: 32, width: 160, height: 152 },
]

// 라벨과 색은 세로형 nodes에서 id로 가져온다.
const wideNodes = [
  { id: 'client', x: 8, y: 48, width: 72 },
  { id: 'mapping', x: 184, y: 96, width: 76 },
  { id: 'lambda', x: 304, y: 48, width: 96 },
  { id: 'dynamodb', x: 304, y: 144, width: 112 },
  { id: 'backend', x: 304, y: 96, width: 96 },
]

const widePaths: Record<string, string> = {
  'request-lambda': 'M80 64 H304',
  'lambda-response': 'M352 48 V20 H44 V48',
  'request-dynamodb': 'M44 80 V160 H304',
  'request-mapping': 'M60 80 V112 H184',
  'mapping-backend': 'M260 112 H304',
  'lambda-backend': 'M352 80 V96',
}

// 곁말은 자리와 정렬만 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'as-is', x: 196, y: 58, textAnchor: 'middle' as const },
  { id: 'as-response', x: 196, y: 14, textAnchor: 'middle' as const },
  { id: 'no-function', x: 196, y: 154, textAnchor: 'middle' as const },
  { id: 'fields-only', x: 222, y: 144, textAnchor: 'middle' as const },
  { id: 'json', x: 196, y: 58, textAnchor: 'middle' as const },
  { id: 'xml', x: 358, y: 92, textAnchor: 'start' as const },
]

export const apiIntegrationScenarios: DiagramScenario[] = [
  { id: 'proxy', nodes: ['client', 'lambda'], paths: ['request-lambda', 'lambda-response'] },
  { id: 'service', nodes: ['client', 'dynamodb'], paths: ['request-dynamodb'] },
  { id: 'mapping', nodes: ['client', 'mapping', 'backend'], paths: ['request-mapping', 'mapping-backend'] },
  { id: 'transform', nodes: ['client', 'lambda', 'backend'], paths: ['request-lambda', 'lambda-backend'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ApiIntegrationDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-api-integration-arrow`
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
      scenarios={apiIntegrationScenarios}
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
