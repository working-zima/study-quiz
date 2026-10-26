import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId.route53.diagrams['health-answers']

const nodes = [
  { id: 'user', x: 88, y: 8, width: 104, color: 'stroke-disabled' },
  { id: 'route53', x: 88, y: 80, width: 104, color: 'stroke-diagram-managed' },
  { id: 'region-a', x: 8, y: 176, width: 116, color: 'stroke-diagram-resource' },
  { id: 'region-b', x: 156, y: 176, width: 116, color: 'stroke-diagram-resource' },
]

// 두 리전의 곁말은 가운데, 응답 화살표는 바깥쪽 통로(x 24·256)에 둔다.
export const paths: Record<string, string> = {
  'user-route53': 'M140 40 V80',
  'route53-region-a': 'M116 112 V132 H24 V176',
  'route53-region-b': 'M164 112 V132 H256 V176',
}

const notes = [
  { id: 'unhealthy', x: 66, y: 228, scenarios: ['simple', 'failover', 'multivalue'] },
  { id: 'primary', x: 66, y: 160, scenarios: ['failover'] },
  { id: 'secondary', x: 214, y: 160, scenarios: ['failover'] },
  { id: 'dropped', x: 66, y: 160, scenarios: ['multivalue'] },
]

// 예시 곁말은 시나리오와 상관없이 늘 보인다. 질의 화살표(x 140) 오른쪽, 두 노드 사이에 두고 user의 opacity를 따른다.
const queryNote = { id: 'query', x: 148, y: 63, node: 'user' }

// 가로형은 왼쪽에서 오른쪽으로 사용자 · Route 53 · 두 리전을 둔다. 리전 A가 위, B가 아래다.
// 라벨과 색은 세로형 nodes에서 id로 가져온다.
const wideNodes = [
  { id: 'user', x: 8, y: 56, width: 64 },
  { id: 'route53', x: 208, y: 56, width: 80 },
  { id: 'region-a', x: 336, y: 16, width: 96 },
  { id: 'region-b', x: 336, y: 96, width: 96 },
]

// 응답 화살표는 Route 53 위·아래 변에서 나와 리전의 왼쪽 변에 닿는다.
const widePaths: Record<string, string> = {
  'user-route53': 'M72 72 H208',
  'route53-region-a': 'M248 56 V32 H336',
  'route53-region-b': 'M248 88 V112 H336',
}

// 곁말은 자리만 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
// 정책 곁말은 리전으로 들어가는 화살표 위에, 비정상은 리전 A 아래에 둔다.
const wideNotes = [
  { id: 'unhealthy', x: 384, y: 62 },
  { id: 'primary', x: 292, y: 24 },
  { id: 'secondary', x: 292, y: 104 },
  { id: 'dropped', x: 292, y: 24 },
]

// 예시 곁말은 사용자 → Route 53 화살표 위에 둔다.
const wideQueryNote = { ...queryNote, x: 80, y: 64 }

export const route53HealthScenarios: DiagramScenario[] = [
  // 단순 라우팅은 비정상인 A를 흐리게 표시해도 그곳을 가리키는 응답 경로가 남는다.
  { id: 'simple', nodes: ['user', 'route53'], paths: ['user-route53', 'route53-region-a'] },
  { id: 'failover', nodes: ['user', 'route53', 'region-b'], paths: ['user-route53', 'route53-region-b'] },
  { id: 'multivalue', nodes: ['user', 'route53', 'region-b'], paths: ['user-route53', 'route53-region-b'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function Route53HealthDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-route53-health-arrow`
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes.map((node) => ({ ...nodes.find(({ id }) => id === node.id)!, ...node })) : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const layoutQueryNote = wide ? wideQueryNote : queryNote

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={route53HealthScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 136' : '0 0 280 244'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
          <text
            data-note={layoutQueryNote.id}
            x={layoutQueryNote.x}
            y={layoutQueryNote.y}
            textAnchor="start"
            className="fill-muted"
            fontSize="9"
            opacity={active && !active.nodes.includes(layoutQueryNote.node) ? 0.25 : 1}
          >
            {text.notes![layoutQueryNote.id]}
          </text>
        </svg>
      </div>
    </DiagramFrame>
  )
}
