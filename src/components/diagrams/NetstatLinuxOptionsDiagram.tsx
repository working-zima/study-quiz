import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['diagnostic-commands'].diagrams['netstat-linux-options']

// 맨 위에 입력한 명령 netstat -antp를 두고, 그 아래 박스에 Linux 옵션 -a·-n·-t·-p를 위에서부터 차례로 쌓는다.
// 그 아래 박스에는 같은 글자인 Windows의 -p를 Linux의 -p와 같은 열에 두어 견주고, 맨 아래 박스에 결과의 한 줄을 칸마다 쌓는다.
// 옵션의 뜻은 곁말로 그 옵션 칸의 오른쪽에 둔다. 옵션 칸에서 결과 칸으로 가는 화살표는 왼쪽 가장자리의 통로(x 10)로 내려간다.
const nodes = [
  { id: 'command', x: 16, y: 8, width: 248 },
  { id: 'opt-a', x: 16, y: 76, width: 40 },
  { id: 'opt-n', x: 16, y: 116, width: 40 },
  { id: 'opt-t', x: 16, y: 156, width: 40 },
  { id: 'opt-p', x: 16, y: 196, width: 40 },
  { id: 'win-p', x: 16, y: 264, width: 40 },
  { id: 'r-proto', x: 16, y: 332, width: 248 },
  { id: 'r-local', x: 16, y: 372, width: 248 },
  { id: 'r-state', x: 16, y: 412, width: 248 },
  { id: 'r-prog', x: 16, y: 452, width: 248 },
]

const groups = [
  { id: 'linux', x: 8, y: 56, width: 264, height: 180, labelX: 16, labelY: 69 },
  { id: 'windows', x: 8, y: 244, width: 264, height: 60, labelX: 16, labelY: 257 },
  { id: 'result', x: 8, y: 312, width: 264, height: 180, labelX: 16, labelY: 325 },
]

const paths: Record<string, string> = {
  't-proto': 'M16 172 H10 V348 H16',
  'p-prog': 'M16 212 H10 V468 H16',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만, 자기가 설명하는 옵션 칸의 오른쪽에 보인다.
const noteScenarios: Record<string, string> = {
  'a-note': 'read',
  'n-note': 'read',
  't-note': 'read',
  'p-note': 'read',
  'tcp-note': 'tcp',
  'p-diff-note': 'p-differs',
  'win-p-note': 'p-differs',
}

const notes: Note[] = [
  { id: 'a-note', x: 64, y: 96, anchor: 'start' },
  { id: 'n-note', x: 64, y: 136, anchor: 'start' },
  { id: 't-note', x: 64, y: 176, anchor: 'start' },
  { id: 'p-note', x: 64, y: 216, anchor: 'start' },
  { id: 'tcp-note', x: 64, y: 176, anchor: 'start' },
  { id: 'p-diff-note', x: 64, y: 216, anchor: 'start' },
  { id: 'win-p-note', x: 64, y: 284, anchor: 'start' },
]

const wideNodes = [
  { id: 'command', x: 16, y: 8, width: 408 },
  { id: 'opt-a', x: 16, y: 76, width: 40 },
  { id: 'opt-n', x: 16, y: 116, width: 40 },
  { id: 'opt-t', x: 16, y: 156, width: 40 },
  { id: 'opt-p', x: 16, y: 196, width: 40 },
  { id: 'win-p', x: 16, y: 264, width: 40 },
  { id: 'r-proto', x: 16, y: 332, width: 408 },
  { id: 'r-local', x: 16, y: 372, width: 408 },
  { id: 'r-state', x: 16, y: 412, width: 408 },
  { id: 'r-prog', x: 16, y: 452, width: 408 },
]

const wideGroups = [
  { id: 'linux', x: 8, y: 56, width: 424, height: 180, labelX: 16, labelY: 69 },
  { id: 'windows', x: 8, y: 244, width: 424, height: 60, labelX: 16, labelY: 257 },
  { id: 'result', x: 8, y: 312, width: 424, height: 180, labelX: 16, labelY: 325 },
]

const widePaths: Record<string, string> = {
  't-proto': 'M16 172 H10 V348 H16',
  'p-prog': 'M16 212 H10 V468 H16',
}

const wideNotes: Note[] = [
  { id: 'a-note', x: 64, y: 96, anchor: 'start' },
  { id: 'n-note', x: 64, y: 136, anchor: 'start' },
  { id: 't-note', x: 64, y: 176, anchor: 'start' },
  { id: 'p-note', x: 64, y: 216, anchor: 'start' },
  { id: 'tcp-note', x: 64, y: 176, anchor: 'start' },
  { id: 'p-diff-note', x: 64, y: 216, anchor: 'start' },
  { id: 'win-p-note', x: 64, y: 284, anchor: 'start' },
]

export const netstatLinuxOptionsScenarios: DiagramScenario[] = [
  { id: 'read', nodes: ['command', 'opt-a', 'opt-n', 'opt-t', 'opt-p', 'r-proto', 'r-local', 'r-state', 'r-prog'], paths: ['p-prog'] },
  { id: 'tcp', nodes: ['command', 'opt-t', 'r-proto'], paths: ['t-proto'] },
  { id: 'p-differs', nodes: ['opt-p', 'win-p'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function NetstatLinuxOptionsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-netstat-linux-options-arrow`
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
      scenarios={netstatLinuxOptionsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 500' : '0 0 280 500'}>
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
