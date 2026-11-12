import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['app-protocols-mgmt-security'].diagrams['snmp-roles']

// 위에 관리 시스템 박스와 그 안의 매니저를, 아래에 「라우터 1」 박스와 「스위치 1」 박스를 나란히 두고 각 박스 안에 에이전트를 둔다.
// 장비 박스의 라벨은 박스 아래쪽에 두어, 위에서 내려오는 화살표가 라벨을 지나지 않게 한다. 노드는 모두 회색이다.
const nodes = [
  { id: 'manager', x: 92, y: 28, width: 96 },
  { id: 'router-agent', x: 24, y: 200, width: 88 },
  { id: 'switch-agent', x: 168, y: 200, width: 88 },
]

const groups = [
  { id: 'nms', x: 72, y: 8, width: 136, height: 60, labelX: 80, labelY: 20 },
  { id: 'router', x: 8, y: 192, width: 120, height: 64, labelX: 16, labelY: 250 },
  { id: 'switch', x: 152, y: 192, width: 120, height: 64, labelX: 160, labelY: 250 },
]

// 요청은 매니저의 아래 변에서 나가 에이전트의 위 변으로 들어가고, 응답은 그 안쪽으로 거꾸로 올라온다.
// 요청의 꺾이는 줄(y 120)이 응답의 꺾이는 줄(y 136)보다 위라서 두 선이 서로 엇갈리지 않는다.
const paths: Record<string, string> = {
  'query-request': 'M112 60 V120 H48 V200',
  'query-response': 'M72 200 V136 H128 V60',
  'set-request': 'M168 60 V120 H232 V200',
  'set-response': 'M208 200 V136 H152 V60',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 그 시나리오를 골랐을 때만 보인다.
const noteScenarios: Record<string, string> = {
  'query-note': 'query',
  'set-note': 'set',
  'udp-note': 'transport',
}

const notes: Note[] = [
  { id: 'query-note', x: 8, y: 96, anchor: 'start' },
  { id: 'set-note', x: 272, y: 96, anchor: 'end' },
  { id: 'udp-note', x: 140, y: 172, anchor: 'middle' },
]

// 가로형은 같은 배치를 넓힌다. 관리 시스템을 위 가운데에 두고, 두 장비 박스를 아래에 넓게 벌려 둔다.
const wideNodes = [
  { id: 'manager', x: 172, y: 28, width: 96 },
  { id: 'router-agent', x: 48, y: 176, width: 120 },
  { id: 'switch-agent', x: 272, y: 176, width: 120 },
]

const wideGroups = [
  { id: 'nms', x: 152, y: 8, width: 136, height: 60, labelX: 160, labelY: 20 },
  { id: 'router', x: 24, y: 168, width: 168, height: 64, labelX: 32, labelY: 226 },
  { id: 'switch', x: 248, y: 168, width: 168, height: 64, labelX: 256, labelY: 226 },
]

const widePaths: Record<string, string> = {
  'query-request': 'M192 60 V104 H88 V176',
  'query-response': 'M128 176 V120 H208 V60',
  'set-request': 'M248 60 V104 H352 V176',
  'set-response': 'M312 176 V120 H232 V60',
}

const wideNotes: Note[] = [
  { id: 'query-note', x: 24, y: 92, anchor: 'start' },
  { id: 'set-note', x: 416, y: 92, anchor: 'end' },
  { id: 'udp-note', x: 220, y: 148, anchor: 'middle' },
]

// 조회 — 매니저가 「라우터 1」의 에이전트에게 묻고 에이전트가 답한다. 설정 — 매니저가 「스위치 1」의 에이전트에게 값을 바꾸게 한다.
// UDP — 매니저의 요청 둘이 UDP에 실려 에이전트가 기다리는 161번으로 간다.
export const snmpRolesScenarios: DiagramScenario[] = [
  { id: 'query', nodes: ['manager', 'router-agent'], paths: ['query-request', 'query-response'] },
  { id: 'set', nodes: ['manager', 'switch-agent'], paths: ['set-request', 'set-response'] },
  { id: 'transport', nodes: ['manager', 'router-agent', 'switch-agent'], paths: ['query-request', 'set-request'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function SnmpRolesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-snmp-roles-arrow`
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
      scenarios={snmpRolesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 240' : '0 0 280 264'}>
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

          {active && layoutNotes.filter((note) => noteScenarios[note.id] === active.id).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
