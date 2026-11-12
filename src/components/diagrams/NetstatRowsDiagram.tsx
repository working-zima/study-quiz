import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['diagnostic-commands'].diagrams['netstat-rows']

// netstat 결과의 한 줄을 박스 하나로, 그 줄의 칸 넷을 「칸 이름: 값」 칸으로 위에서 아래로 쌓는다.
// 세로형은 기다리는 줄과 맺은 연결의 줄을 위아래로, 가로형은 나란히 둔다.
// 맺은 연결의 외부 주소 칸에서 그 주소의 컴퓨터(클라이언트)로 화살표를 긋는다. 노드는 모두 회색이다.
const nodes = [
  { id: 'l-proto', x: 16, y: 28, width: 200 },
  { id: 'l-local', x: 16, y: 68, width: 200 },
  { id: 'l-foreign', x: 16, y: 108, width: 200 },
  { id: 'l-state', x: 16, y: 148, width: 200 },
  { id: 'e-proto', x: 16, y: 236, width: 200 },
  { id: 'e-local', x: 16, y: 276, width: 200 },
  { id: 'e-foreign', x: 16, y: 316, width: 200 },
  { id: 'e-state', x: 16, y: 356, width: 200 },
  { id: 'client', x: 112, y: 432, width: 160 },
]

const groups = [
  { id: 'listen', x: 8, y: 8, width: 216, height: 200, labelX: 16, labelY: 21 },
  { id: 'established', x: 8, y: 216, width: 216, height: 200, labelX: 16, labelY: 229 },
]

// 외부 주소 칸의 오른쪽 변에서 나가 박스 바깥으로 내려와 클라이언트 칸의 위 변에 닿는다.
const paths: Record<string, string> = {
  'to-client': 'M216 332 H244 V432',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만, 자기 줄의 박스 맨 아래에 보인다.
const noteScenarios: Record<string, string> = {
  'listen-note': 'listening',
  'est-note': 'established',
}

const notes: Note[] = [
  { id: 'listen-note', x: 16, y: 200, anchor: 'start' },
  { id: 'est-note', x: 16, y: 408, anchor: 'start' },
]

const wideNodes = [
  { id: 'l-proto', x: 16, y: 28, width: 188 },
  { id: 'l-local', x: 16, y: 68, width: 188 },
  { id: 'l-foreign', x: 16, y: 108, width: 188 },
  { id: 'l-state', x: 16, y: 148, width: 188 },
  { id: 'e-proto', x: 236, y: 28, width: 188 },
  { id: 'e-local', x: 236, y: 68, width: 188 },
  { id: 'e-foreign', x: 236, y: 108, width: 188 },
  { id: 'e-state', x: 236, y: 148, width: 188 },
  { id: 'client', x: 160, y: 232, width: 160 },
]

const wideGroups = [
  { id: 'listen', x: 8, y: 8, width: 204, height: 200, labelX: 16, labelY: 21 },
  { id: 'established', x: 228, y: 8, width: 204, height: 200, labelX: 236, labelY: 21 },
]

// 가로형은 외부 주소 칸의 왼쪽 변에서 나가 두 박스 사이로 내려와 클라이언트 칸의 위 변에 닿는다.
const widePaths: Record<string, string> = {
  'to-client': 'M236 124 H220 V232',
}

const wideNotes: Note[] = [
  { id: 'listen-note', x: 16, y: 200, anchor: 'start' },
  { id: 'est-note', x: 236, y: 200, anchor: 'start' },
]

export const netstatRowsScenarios: DiagramScenario[] = [
  { id: 'listening', nodes: ['l-proto', 'l-local', 'l-foreign', 'l-state'], paths: [] },
  { id: 'established', nodes: ['e-proto', 'e-local', 'e-foreign', 'e-state', 'client'], paths: ['to-client'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function NetstatRowsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-netstat-rows-arrow`
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
      scenarios={netstatRowsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 272' : '0 0 280 472'}>
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
