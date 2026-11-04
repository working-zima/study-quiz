import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-process-boot'].diagrams['process-tree']

// 세로형은 프로세스 나무를 위에서 아래로 그린다. 맨 위 PID 1 아래에 sshd와 bash를 한 줄로 두고,
// bash 아래로 backup.sh 프로세스 둘을 나란히 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'pid1', x: 80, y: 8, width: 60 },
  { id: 'sshd', x: 16, y: 72, width: 72 },
  { id: 'bash', x: 130, y: 72, width: 76 },
  { id: 'run1', x: 60, y: 136, width: 104 },
  { id: 'run2', x: 172, y: 136, width: 104 },
]

// 부모와 자식을 잇는 가지는 늘 보이고, 고른 시나리오의 화살표를 그 위에 겹쳐 그린다.
// PID 1과 bash 사이는 그 사이의 프로세스를 그리지 않았으므로 점선이다.
const paths: Record<string, string> = {
  'b-sshd': 'M110 40 V56 H52 V72',
  'b-bash': 'M110 40 V56 H168 V72',
  'b-run1': 'M168 104 V120 H112 V136',
  'b-run2': 'M168 104 V120 H224 V136',
  'to-sshd': 'M110 40 V56 H52 V72',
  'to-run1': 'M168 104 V120 H112 V136',
}

const linkIds = ['b-sshd', 'b-bash', 'b-run1', 'b-run2']
const dashedLinkIds = ['b-bash']

// 「첫 프로세스」 곁말은 PID 1 오른쪽에, PPID 곁말은 2310 아래에, 「같은 프로그램 파일」 곁말은 두 backup.sh 아래 가운데에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'first', x: 148, y: 28, anchor: 'start', scenarios: ['pid1'] },
  { id: 'ppid', x: 112, y: 184, anchor: 'middle', scenarios: ['parent'] },
  { id: 'same', x: 168, y: 184, anchor: 'middle', scenarios: ['program-process'] },
]

// 가로형은 나무를 왼쪽에서 오른쪽으로 그린다. PID 1 오른쪽에 sshd와 bash를 세로로 두고, bash 오른쪽으로 backup.sh 둘을 세로로 둔다.
const wideNodes = [
  { id: 'pid1', x: 8, y: 72, width: 60 },
  { id: 'sshd', x: 108, y: 24, width: 72 },
  { id: 'bash', x: 108, y: 120, width: 76 },
  { id: 'run1', x: 232, y: 88, width: 104 },
  { id: 'run2', x: 232, y: 152, width: 104 },
]

const widePaths: Record<string, string> = {
  'b-sshd': 'M68 88 H88 V40 H108',
  'b-bash': 'M68 88 H88 V136 H108',
  'b-run1': 'M184 136 H208 V104 H232',
  'b-run2': 'M184 136 H208 V168 H232',
  'to-sshd': 'M68 88 H88 V40 H108',
  'to-run1': 'M184 136 H208 V104 H232',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'first', x: 38, y: 124, anchor: 'middle' },
  { id: 'ppid', x: 344, y: 108, anchor: 'start' },
  { id: 'same', x: 284, y: 200, anchor: 'middle' },
]

// nodes에는 선명하게 둘 노드와 가지를 함께 적는다.
export const processTreeScenarios: DiagramScenario[] = [
  { id: 'program-process', nodes: ['run1', 'run2'], paths: [] },
  { id: 'parent', nodes: ['bash', 'run1', 'b-run1'], paths: ['to-run1'] },
  { id: 'pid1', nodes: ['pid1', 'sshd', 'b-sshd'], paths: ['to-sshd'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ProcessTreeDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-process-tree-arrow`
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
      scenarios={processTreeScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 208' : '0 0 280 192'}>
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
