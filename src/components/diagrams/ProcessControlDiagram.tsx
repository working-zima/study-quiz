import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-process-boot'].diagrams['process-control']

// 세로형은 왼쪽 열에 입력한 명령 넷을 위에서 아래로, 오른쪽 열에 PID 1·bash·backup.sh를 부모에서 자식으로 쌓는다.
// 명령에서 프로세스로 가는 화살표는 두 열 사이 통로(x 140)를 지난다. 노드는 모두 회색이다.
const nodes = [
  { id: 'c-term', x: 8, y: 8, width: 120 },
  { id: 'c-kill9', x: 8, y: 48, width: 120 },
  { id: 'c-renice', x: 8, y: 88, width: 120 },
  { id: 'c-pstree', x: 8, y: 128, width: 120 },
  { id: 'pid1', x: 152, y: 8, width: 120 },
  { id: 'bash', x: 152, y: 72, width: 120 },
  { id: 'run', x: 152, y: 136, width: 120 },
]

// 부모와 자식을 잇는 가지는 늘 보인다. PID 1과 bash 사이는 그 사이의 프로세스를 그리지 않았으므로 점선이다.
const paths: Record<string, string> = {
  'b-bash': 'M212 40 V72',
  'b-run': 'M212 104 V136',
  'term-arrow': 'M128 24 H140 V152 H152',
  'kill9-arrow': 'M128 64 H140 V152 H152',
  'renice-arrow': 'M128 104 H140 V152 H152',
  'pstree-arrow': 'M128 144 H140 V24 H152',
}

const linkIds = ['b-bash', 'b-run']
const dashedLinkIds = ['b-bash']

// 곁말은 시나리오마다 하나이고, 모두 backup.sh 칸 아래 가운데에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'term', x: 212, y: 184, anchor: 'middle', scenarios: ['term'] },
  { id: 'kill9', x: 212, y: 184, anchor: 'middle', scenarios: ['kill9'] },
  { id: 'nice', x: 212, y: 184, anchor: 'middle', scenarios: ['nice'] },
  { id: 'tree', x: 212, y: 184, anchor: 'middle', scenarios: ['pstree'] },
]

// 가로형도 두 열이지만 열 사이를 넓히고, 곁말을 backup.sh 칸 오른쪽에 둔다.
const wideNodes = [
  { id: 'c-term', x: 16, y: 8, width: 120 },
  { id: 'c-kill9', x: 16, y: 48, width: 120 },
  { id: 'c-renice', x: 16, y: 88, width: 120 },
  { id: 'c-pstree', x: 16, y: 128, width: 120 },
  { id: 'pid1', x: 184, y: 8, width: 120 },
  { id: 'bash', x: 184, y: 72, width: 120 },
  { id: 'run', x: 184, y: 136, width: 120 },
]

const widePaths: Record<string, string> = {
  'b-bash': 'M244 40 V72',
  'b-run': 'M244 104 V136',
  'term-arrow': 'M136 24 H160 V152 H184',
  'kill9-arrow': 'M136 64 H160 V152 H184',
  'renice-arrow': 'M136 104 H160 V152 H184',
  'pstree-arrow': 'M136 144 H160 V24 H184',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'term', x: 312, y: 156, anchor: 'start' },
  { id: 'kill9', x: 312, y: 156, anchor: 'start' },
  { id: 'nice', x: 312, y: 156, anchor: 'start' },
  { id: 'tree', x: 312, y: 156, anchor: 'start' },
]

// nodes에는 선명하게 둘 노드와 가지를 함께 적는다. kill·kill -9·renice는 명령과 backup.sh만, pstree는 명령과 나무 전체가 선명하다.
export const processControlScenarios: DiagramScenario[] = [
  { id: 'term', nodes: ['c-term', 'run'], paths: ['term-arrow'] },
  { id: 'kill9', nodes: ['c-kill9', 'run'], paths: ['kill9-arrow'] },
  { id: 'nice', nodes: ['c-renice', 'run'], paths: ['renice-arrow'] },
  { id: 'pstree', nodes: ['c-pstree', 'pid1', 'bash', 'run', 'b-bash', 'b-run'], paths: ['pstree-arrow'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ProcessControlDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-process-control-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={processControlScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 176' : '0 0 280 192'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {linkIds.map((id) => (
            <path
              key={id}
              data-link={id}
              d={layoutPaths[id]}
              className="fill-none stroke-muted"
              strokeWidth="1.5"
              strokeDasharray={dashedLinkIds.includes(id) ? '4 3' : undefined}
              opacity={opacityOf(id)}
            />
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

          {active && layoutNotes.filter((note) => note.scenarios.includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
