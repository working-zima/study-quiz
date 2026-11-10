import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['tcp-connection'].diagrams['connection-close']

// 세로형은 왼쪽에 먼저 끊는 클라이언트, 오른쪽에 나중에 끊는 서버 기둥(그룹 박스)을 세우고, 그 사이에 오가는 세그먼트를 노드로 오가는 차례대로 위에서 아래로 놓는다.
// 방향은 노드 양옆의 짧은 화살표가 보인다. 같은 FIN·ACK라도 첫 방향을 닫는 것과 둘째 방향을 닫는 것은 다른 노드다. 노드는 모두 회색이다.
const nodes = [
  { id: 'fin-1', x: 88, y: 48, width: 104 },
  { id: 'ack-1', x: 88, y: 88, width: 104 },
  { id: 'data', x: 88, y: 128, width: 104 },
  { id: 'fin-2', x: 88, y: 168, width: 104 },
  { id: 'ack-2', x: 88, y: 208, width: 104 },
]

const groups = [
  { id: 'client-side', x: 8, y: 24, width: 60, height: 224, labelX: 12, labelY: 36 },
  { id: 'server-side', x: 212, y: 24, width: 60, height: 224, labelX: 216, labelY: 36 },
]

const paths: Record<string, string> = {
  'fin1-out': 'M68 64 H88',
  'fin1-in': 'M192 64 H212',
  'ack1-out': 'M212 104 H192',
  'ack1-in': 'M88 104 H68',
  'data-out': 'M212 144 H192',
  'data-in': 'M88 144 H68',
  'fin2-out': 'M212 184 H192',
  'fin2-in': 'M88 184 H68',
  'ack2-out': 'M68 224 H88',
  'ack2-in': 'M192 224 H212',
}

// 역할 곁말은 늘 보이고, 자기 기둥 바로 위에서 기둥의 바깥 변에 맞춘다.
const notes = [
  { id: 'active', x: 8, y: 16, anchor: 'start' as const },
  { id: 'passive', x: 272, y: 16, anchor: 'end' as const },
]

// 가로형도 같은 꼴로 두 기둥 사이를 넓힌다.
const wideNodes = [
  { id: 'fin-1', x: 152, y: 48, width: 136 },
  { id: 'ack-1', x: 152, y: 88, width: 136 },
  { id: 'data', x: 152, y: 128, width: 136 },
  { id: 'fin-2', x: 152, y: 168, width: 136 },
  { id: 'ack-2', x: 152, y: 208, width: 136 },
]

const wideGroups = [
  { id: 'client-side', x: 8, y: 24, width: 88, height: 224, labelX: 16, labelY: 36 },
  { id: 'server-side', x: 344, y: 24, width: 88, height: 224, labelX: 352, labelY: 36 },
]

const widePaths: Record<string, string> = {
  'fin1-out': 'M96 64 H152',
  'fin1-in': 'M288 64 H344',
  'ack1-out': 'M344 104 H288',
  'ack1-in': 'M152 104 H96',
  'data-out': 'M344 144 H288',
  'data-in': 'M152 144 H96',
  'fin2-out': 'M344 184 H288',
  'fin2-in': 'M152 184 H96',
  'ack2-out': 'M96 224 H152',
  'ack2-in': 'M288 224 H344',
}

const wideNotes = [
  { id: 'active', x: 8, y: 16, anchor: 'start' as const },
  { id: 'passive', x: 432, y: 16, anchor: 'end' as const },
]

// 한쪽 닫기: 클라이언트의 FIN과 서버의 ACK로 클라이언트 → 서버 방향이 닫힌다.
// 남은 데이터: 아직 열린 서버 → 클라이언트 방향으로만 데이터가 간다.
// 다른 쪽 닫기: 서버의 FIN과 클라이언트의 ACK로 서버 → 클라이언트 방향도 닫힌다.
export const connectionCloseScenarios: DiagramScenario[] = [
  { id: 'first-fin', nodes: ['fin-1', 'ack-1'], paths: ['fin1-out', 'fin1-in', 'ack1-out', 'ack1-in'] },
  { id: 'half-close', nodes: ['data'], paths: ['data-out', 'data-in'] },
  { id: 'second-fin', nodes: ['fin-2', 'ack-2'], paths: ['fin2-out', 'fin2-in', 'ack2-out', 'ack2-in'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ConnectionCloseDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-connection-close-arrow`
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
      scenarios={connectionCloseScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 256' : '0 0 280 256'}>
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

          {layoutNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
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
        </svg>
      </div>
    </DiagramFrame>
  )
}
