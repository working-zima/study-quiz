import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['api-gateway-step-functions'].diagrams['map-state']

// 왼쪽은 반복문이 함수 안에, 오른쪽은 반복이 상태 머신에 있다. 그룹 경계는 시나리오와 무관하게 남긴다.
const groups = [
  { id: 'one-function', x: 4, y: 56, width: 132, height: 64 },
  { id: 'machine', x: 144, y: 56, width: 132, height: 64 },
]

// 함수 셋은 여러 번 부른다는 그림의 약속이다. 항목 수나 병렬도를 뜻하지 않는다.
const nodes = [
  { id: 'list', x: 82, y: 8, width: 116, color: 'stroke-disabled' },
  { id: 'loop', x: 12, y: 80, width: 116, color: 'stroke-disabled' },
  { id: 'map', x: 152, y: 80, width: 116, color: 'stroke-diagram-managed' },
  { id: 'loop-fn-1', x: 12, y: 152, width: 36, color: 'stroke-diagram-managed' },
  { id: 'loop-fn-2', x: 52, y: 152, width: 36, color: 'stroke-diagram-managed' },
  { id: 'loop-fn-3', x: 92, y: 152, width: 36, color: 'stroke-diagram-managed' },
  { id: 'map-fn-1', x: 152, y: 152, width: 36, color: 'stroke-diagram-managed' },
  { id: 'map-fn-2', x: 192, y: 152, width: 36, color: 'stroke-diagram-managed' },
  { id: 'map-fn-3', x: 232, y: 152, width: 36, color: 'stroke-diagram-managed' },
]

// Map 상태로 가는 경로는 목록의 오른쪽 변에서 나와 그룹 라벨 오른쪽(x 230)으로 내려간다.
const paths: Record<string, string> = {
  'list-loop': 'M100 40 V80',
  'list-map': 'M198 24 H230 V80',
  'loop-fn-1': 'M30 112 V152',
  'loop-fn-2': 'M70 112 V152',
  'loop-fn-3': 'M110 112 V152',
  'map-fn-1': 'M170 112 V152',
  'map-fn-2': 'M210 112 V152',
  'map-fn-3': 'M250 112 V152',
}

const notes = [
  { id: 'time-limit', x: 70, y: 200, textAnchor: 'middle' as const, scenarios: ['loop'] },
  { id: 'per-item', x: 210, y: 200, textAnchor: 'middle' as const, scenarios: ['map'] },
]

// 가로형은 목록을 왼쪽에 두고 두 방식을 나란히 둔다. 함수 셋은 각 방식의 아래다.
const wideGroups = [
  { id: 'one-function', x: 80, y: 8, width: 172, height: 64 },
  { id: 'machine', x: 264, y: 8, width: 172, height: 64 },
]

// 라벨과 색은 세로형 nodes에서 id로 가져온다.
const wideNodes = [
  { id: 'list', x: 8, y: 32, width: 56 },
  { id: 'loop', x: 92, y: 32, width: 148 },
  { id: 'map', x: 276, y: 32, width: 148 },
  { id: 'loop-fn-1', x: 94, y: 104, width: 40 },
  { id: 'loop-fn-2', x: 146, y: 104, width: 40 },
  { id: 'loop-fn-3', x: 198, y: 104, width: 40 },
  { id: 'map-fn-1', x: 278, y: 104, width: 40 },
  { id: 'map-fn-2', x: 330, y: 104, width: 40 },
  { id: 'map-fn-3', x: 382, y: 104, width: 40 },
]

// Map 상태로 가는 경로는 두 그룹 아래·함수 위의 통로(y 84)로 건너가, 두 그룹 사이(x 258)로 올라 Map 상태 왼쪽 변에 닿는다.
const widePaths: Record<string, string> = {
  'list-loop': 'M64 48 H92',
  'list-map': 'M36 64 V84 H258 V48 H276',
  'loop-fn-1': 'M114 64 V104',
  'loop-fn-2': 'M166 64 V104',
  'loop-fn-3': 'M218 64 V104',
  'map-fn-1': 'M298 64 V104',
  'map-fn-2': 'M350 64 V104',
  'map-fn-3': 'M402 64 V104',
}

// 곁말은 자리만 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'time-limit', x: 166, y: 152 },
  { id: 'per-item', x: 350, y: 152 },
]

export const mapStateScenarios: DiagramScenario[] = [
  {
    id: 'loop',
    nodes: ['list', 'loop', 'loop-fn-1', 'loop-fn-2', 'loop-fn-3'],
    paths: ['list-loop', 'loop-fn-1', 'loop-fn-2', 'loop-fn-3'],
  },
  {
    id: 'map',
    nodes: ['list', 'map', 'map-fn-1', 'map-fn-2', 'map-fn-3'],
    paths: ['list-map', 'map-fn-1', 'map-fn-2', 'map-fn-3'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function MapStateDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-map-state-arrow`
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
      scenarios={mapStateScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 160' : '0 0 280 212'}>
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
