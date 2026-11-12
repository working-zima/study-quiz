import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['app-protocols-mgmt-security'].diagrams['snmp-poll-trap']

// 맨 위에 관리 시스템과 관리받는 장비를 머리 노드로 두고, 그 아래 왼쪽에 매니저, 오른쪽에 에이전트 기둥(그룹 박스)을 세운다.
// 두 기둥 사이에는 메시지를 위에서 아래로 놓는다 — 위 박스는 매니저가 먼저 보내는 요청과 그 응답(폴링·설정),
// 아래 박스는 에이전트가 먼저 보내는 트랩이다. 노드는 모두 회색이고, 누가 먼저 보내는지는 박스와 화살표 방향으로 가른다.
const nodes = [
  { id: 'nms', x: 8, y: 8, width: 124 },
  { id: 'device', x: 148, y: 8, width: 124 },
  { id: 'get', x: 76, y: 80, width: 128 },
  { id: 'get-res', x: 76, y: 124, width: 128 },
  { id: 'set', x: 76, y: 168, width: 128 },
  { id: 'set-res', x: 76, y: 212, width: 128 },
  { id: 'trap', x: 76, y: 296, width: 128 },
]

const groups = [
  { id: 'manager-side', x: 8, y: 48, width: 56, height: 312, labelX: 10, labelY: 60 },
  { id: 'agent-side', x: 216, y: 48, width: 56, height: 312, labelX: 220, labelY: 60 },
  { id: 'poll-box', x: 68, y: 60, width: 144, height: 204, labelX: 72, labelY: 73 },
  { id: 'trap-box', x: 68, y: 276, width: 144, height: 72, labelX: 72, labelY: 289 },
]

// 노드마다 화살표 둘 — 보내는 쪽 기둥에서 노드로(-out), 노드에서 받는 쪽 기둥으로(-in).
// 요청(GetRequest·SetRequest)은 매니저 → 에이전트, 응답(Response)과 트랩은 에이전트 → 매니저로 간다.
const paths: Record<string, string> = {
  'get-out': 'M64 96 H76',
  'get-in': 'M204 96 H216',
  'get-res-out': 'M216 140 H204',
  'get-res-in': 'M76 140 H64',
  'set-out': 'M64 184 H76',
  'set-in': 'M204 184 H216',
  'set-res-out': 'M216 228 H204',
  'set-res-in': 'M76 228 H64',
  'trap-out': 'M216 312 H204',
  'trap-in': 'M76 312 H64',
}

type Note = { id: string, x: number, y: number }

// 곁말은 자기 시나리오를 골랐을 때만 자기 박스 안, 그 박스의 마지막 노드 아래에 보인다.
// 폴링과 설정의 요청은 같은 포트로 가므로 위 박스의 곁말 하나를 함께 쓴다.
const noteScenarios: Record<string, string[]> = {
  'poll-note': ['poll', 'set'],
  'trap-note': ['trap'],
}

const notes: Note[] = [
  { id: 'poll-note', x: 140, y: 256 },
  { id: 'trap-note', x: 140, y: 340 },
]

// 가로형은 기둥과 노드를 넓힐 뿐 차례와 높이는 세로형과 같다.
const wideNodes = [
  { id: 'nms', x: 8, y: 8, width: 124 },
  { id: 'device', x: 308, y: 8, width: 124 },
  { id: 'get', x: 120, y: 80, width: 200 },
  { id: 'get-res', x: 120, y: 124, width: 200 },
  { id: 'set', x: 120, y: 168, width: 200 },
  { id: 'set-res', x: 120, y: 212, width: 200 },
  { id: 'trap', x: 120, y: 296, width: 200 },
]

const wideGroups = [
  { id: 'manager-side', x: 8, y: 48, width: 88, height: 312, labelX: 12, labelY: 60 },
  { id: 'agent-side', x: 344, y: 48, width: 88, height: 312, labelX: 348, labelY: 60 },
  { id: 'poll-box', x: 104, y: 60, width: 232, height: 204, labelX: 112, labelY: 73 },
  { id: 'trap-box', x: 104, y: 276, width: 232, height: 72, labelX: 112, labelY: 289 },
]

const widePaths: Record<string, string> = {
  'get-out': 'M96 96 H120',
  'get-in': 'M320 96 H344',
  'get-res-out': 'M344 140 H320',
  'get-res-in': 'M120 140 H96',
  'set-out': 'M96 184 H120',
  'set-in': 'M320 184 H344',
  'set-res-out': 'M344 228 H320',
  'set-res-in': 'M120 228 H96',
  'trap-out': 'M344 312 H320',
  'trap-in': 'M120 312 H96',
}

const wideNotes: Note[] = [
  { id: 'poll-note', x: 220, y: 256 },
  { id: 'trap-note', x: 220, y: 340 },
]

// 폴링 — 매니저가 묻고 에이전트가 답한다. 설정 — 값을 바꿀 때도 매니저가 먼저 보낸다. 트랩 — 에이전트가 먼저 알린다.
export const snmpPollTrapScenarios: DiagramScenario[] = [
  {
    id: 'poll',
    nodes: ['nms', 'device', 'get', 'get-res'],
    paths: ['get-out', 'get-in', 'get-res-out', 'get-res-in'],
  },
  {
    id: 'set',
    nodes: ['nms', 'device', 'set', 'set-res'],
    paths: ['set-out', 'set-in', 'set-res-out', 'set-res-in'],
  },
  {
    id: 'trap',
    nodes: ['nms', 'device', 'trap'],
    paths: ['trap-out', 'trap-in'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function SnmpPollTrapDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-snmp-poll-trap-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={snmpPollTrapScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 368' : '0 0 280 368'}>
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
            <text key={group.id} data-group-label={group.id} x={group.labelX} y={group.labelY} className="fill-muted" fontSize="9">
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
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {active && layoutNotes.filter((note) => noteScenarios[note.id].includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
