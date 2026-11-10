import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['tcp-connection'].diagrams['time-wait']

// 왼쪽에 먼저 끊은 클라이언트, 오른쪽에 나중에 끊은 서버 기둥(그룹 박스)을 세우고, 클라이언트 기둥 안 위에 TIME-WAIT, 아래에 CLOSED를 둔다.
// 두 기둥 사이에는 오가는 세그먼트를 오가는 차례대로 위에서 아래로 놓는다. 방향은 노드 양옆의 짧은 화살표가 보인다.
// 마지막 ACK는 TIME-WAIT에서 나간다. 옛 연결의 세그먼트는 서버 쪽에서 나오지만 클라이언트에 닿지 않는다. 노드는 모두 회색이다.
const nodes = [
  { id: 'time-wait', x: 13, y: 42, width: 72 },
  { id: 'closed', x: 13, y: 242, width: 72 },
  { id: 'last-ack', x: 101, y: 42, width: 120 },
  { id: 'refin', x: 101, y: 90, width: 120 },
  { id: 'reack', x: 101, y: 138, width: 120 },
  { id: 'old', x: 101, y: 186, width: 120 },
]

const groups = [
  { id: 'client-side', x: 8, y: 22, width: 82, height: 260, labelX: 12, labelY: 34 },
  { id: 'server-side', x: 232, y: 22, width: 40, height: 260, labelX: 236, labelY: 34 },
]

const paths: Record<string, string> = {
  'last-ack-out': 'M85 58 H101',
  'refin-out': 'M232 106 H221',
  'refin-in': 'M101 106 H90',
  'reack-out': 'M90 154 H101',
  'reack-in': 'M221 154 H232',
  'old-out': 'M232 202 H221',
}

// 역할 곁말은 기둥 바로 위에서 기둥의 바깥 변에 맞추고, 2×MSL 곁말은 TIME-WAIT 바로 아래에 늘 보인다.
// 사라짐은 서버 기둥 안 마지막 ACK 줄에, 기다리는 동안 사라진다는 옛 세그먼트 아래에 자기 시나리오에서만 보인다.
const notes = [
  { id: 'role-active', x: 8, y: 14, anchor: 'start' as const, scenarios: null },
  { id: 'role-passive', x: 272, y: 14, anchor: 'end' as const, scenarios: null },
  { id: 'msl', x: 49, y: 88, anchor: 'middle' as const, scenarios: null },
  { id: 'lost', x: 252, y: 62, anchor: 'middle' as const, scenarios: ['lost-ack'] },
  { id: 'vanish', x: 161, y: 232, anchor: 'middle' as const, scenarios: ['old-segment'] },
]

// 가로형도 같은 꼴로 두 기둥 사이를 넓힌다.
const wideNodes = [
  { id: 'time-wait', x: 16, y: 42, width: 80 },
  { id: 'closed', x: 16, y: 242, width: 80 },
  { id: 'last-ack', x: 152, y: 42, width: 136 },
  { id: 'refin', x: 152, y: 90, width: 136 },
  { id: 'reack', x: 152, y: 138, width: 136 },
  { id: 'old', x: 152, y: 186, width: 136 },
]

const wideGroups = [
  { id: 'client-side', x: 8, y: 22, width: 96, height: 260, labelX: 16, labelY: 34 },
  { id: 'server-side', x: 336, y: 22, width: 96, height: 260, labelX: 344, labelY: 34 },
]

const widePaths: Record<string, string> = {
  'last-ack-out': 'M96 58 H152',
  'refin-out': 'M336 106 H288',
  'refin-in': 'M152 106 H104',
  'reack-out': 'M104 154 H152',
  'reack-in': 'M288 154 H336',
  'old-out': 'M336 202 H288',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes = [
  { id: 'role-active', x: 8, y: 14 },
  { id: 'role-passive', x: 432, y: 14 },
  { id: 'msl', x: 56, y: 88 },
  { id: 'lost', x: 384, y: 62 },
  { id: 'vanish', x: 220, y: 232 },
]

// 마지막 ACK가 사라지면 — 흐린 마지막 ACK는 서버에 닿지 않고, 서버가 FIN을 다시 보내며, 아직 TIME-WAIT인 클라이언트가 ACK를 다시 보낸다.
// 늦게 온 옛 세그먼트 — 서버 쪽에서 나온 옛 세그먼트가 클라이언트에 닿지 않고 기다리는 동안 사라진 뒤 CLOSED가 된다.
export const timeWaitScenarios: DiagramScenario[] = [
  { id: 'lost-ack', nodes: ['time-wait', 'refin', 'reack'], paths: ['last-ack-out', 'refin-out', 'refin-in', 'reack-out', 'reack-in'] },
  { id: 'old-segment', nodes: ['time-wait', 'old', 'closed'], paths: ['old-out'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function TimeWaitDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-time-wait-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = layoutNotes.filter((note) => note.scenarios === null || (active !== null && note.scenarios.includes(active.id)))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={timeWaitScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 290' : '0 0 280 290'}>
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

          {shownNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
