import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['diagnostic-commands'].diagrams['netstat-windows-options']

// 맨 위에 입력한 명령 netstat -ano를 두고, 그 아래 왼쪽 박스에 옵션 -a·-n·-o를 위에서부터 차례로 둔다.
// 오른쪽에는 결과의 기다리는 줄과 맺은 연결의 줄을 「칸 이름: 값」 칸으로 쌓고, 옵션마다 그 옵션이 바꾸는 칸과 같은 높이에 두어
// 옵션 칸에서 그 칸으로 곧게 화살표를 긋는다. -n은 주소 칸 둘을 함께 바꾸므로 두 박스 사이의 통로로 외부 주소 칸까지 내려간다.
const nodes = [
  { id: 'command', x: 16, y: 8, width: 248 },
  { id: 'opt-a', x: 16, y: 76, width: 40 },
  { id: 'opt-n', x: 16, y: 184, width: 40 },
  { id: 'opt-o', x: 16, y: 304, width: 40 },
  { id: 'listen-state', x: 80, y: 76, width: 188 },
  { id: 'est-proto', x: 80, y: 144, width: 188 },
  { id: 'est-local', x: 80, y: 184, width: 188 },
  { id: 'est-foreign', x: 80, y: 224, width: 188 },
  { id: 'est-state', x: 80, y: 264, width: 188 },
  { id: 'est-pid', x: 80, y: 304, width: 188 },
]

const groups = [
  { id: 'options', x: 8, y: 56, width: 56, height: 288, labelX: 16, labelY: 69 },
  { id: 'listen', x: 72, y: 56, width: 200, height: 60, labelX: 80, labelY: 69 },
  { id: 'established', x: 72, y: 124, width: 200, height: 220, labelX: 80, labelY: 137 },
]

const paths: Record<string, string> = {
  'a-listen': 'M56 92 H80',
  'n-local': 'M56 200 H80',
  'n-foreign': 'M56 200 H68 V240 H80',
  'o-pid': 'M56 320 H80',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만, 명령 칸과 박스들 사이에 보인다.
const noteScenarios: Record<string, string> = {
  'all-note': 'all',
  'numeric-note': 'numeric',
  'pid-note': 'pid',
}

const notes: Note[] = [
  { id: 'all-note', x: 16, y: 50, anchor: 'start' },
  { id: 'numeric-note', x: 16, y: 50, anchor: 'start' },
  { id: 'pid-note', x: 16, y: 50, anchor: 'start' },
]

const wideNodes = [
  { id: 'command', x: 16, y: 8, width: 408 },
  { id: 'opt-a', x: 24, y: 76, width: 56 },
  { id: 'opt-n', x: 24, y: 184, width: 56 },
  { id: 'opt-o', x: 24, y: 304, width: 56 },
  { id: 'listen-state', x: 112, y: 76, width: 312 },
  { id: 'est-proto', x: 112, y: 144, width: 312 },
  { id: 'est-local', x: 112, y: 184, width: 312 },
  { id: 'est-foreign', x: 112, y: 224, width: 312 },
  { id: 'est-state', x: 112, y: 264, width: 312 },
  { id: 'est-pid', x: 112, y: 304, width: 312 },
]

const wideGroups = [
  { id: 'options', x: 8, y: 56, width: 88, height: 288, labelX: 16, labelY: 69 },
  { id: 'listen', x: 104, y: 56, width: 328, height: 60, labelX: 112, labelY: 69 },
  { id: 'established', x: 104, y: 124, width: 328, height: 220, labelX: 112, labelY: 137 },
]

const widePaths: Record<string, string> = {
  'a-listen': 'M80 92 H112',
  'n-local': 'M80 200 H112',
  'n-foreign': 'M80 200 H100 V240 H112',
  'o-pid': 'M80 320 H112',
}

const wideNotes: Note[] = [
  { id: 'all-note', x: 16, y: 50, anchor: 'start' },
  { id: 'numeric-note', x: 16, y: 50, anchor: 'start' },
  { id: 'pid-note', x: 16, y: 50, anchor: 'start' },
]

export const netstatWindowsOptionsScenarios: DiagramScenario[] = [
  { id: 'all', nodes: ['command', 'opt-a', 'listen-state', 'est-state'], paths: ['a-listen'] },
  { id: 'numeric', nodes: ['command', 'opt-n', 'est-local', 'est-foreign'], paths: ['n-local', 'n-foreign'] },
  { id: 'pid', nodes: ['command', 'opt-o', 'est-state', 'est-pid'], paths: ['o-pid'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function NetstatWindowsOptionsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-netstat-windows-options-arrow`
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
      scenarios={netstatWindowsOptionsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 352' : '0 0 280 352'}>
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
