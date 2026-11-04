import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-shell'].diagrams['shell-layer']

// 세로형은 왼쪽 세로줄에 위에서 아래로 사용자·셸·커널·하드웨어를 쌓고, 커널 오른쪽에 ls 프로그램을 둔다.
// 곁말이 들어갈 자리를 남기려고 세로줄을 왼쪽에 붙였다. 사용자와 커널은 늘 셸을 사이에 두고 떨어져 있다.
const nodes = [
  { id: 'user', x: 24, y: 8, width: 80 },
  { id: 'shell', x: 24, y: 72, width: 80 },
  { id: 'kernel', x: 24, y: 136, width: 80 },
  { id: 'hardware', x: 24, y: 200, width: 80 },
  { id: 'ls', x: 160, y: 136, width: 60 },
]

const paths: Record<string, string> = {
  'user-shell': 'M64 40 V72',
  'shell-kernel': 'M64 104 V136',
  'kernel-ls': 'M104 152 H160',
}

// 「명령 읽기」의 두 곁말은 사용자와 셸 사이 오른쪽에, 「실행 요청」의 곁말은 셸과 커널 사이 오른쪽에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'line', x: 76, y: 54, anchor: 'start', scenarios: ['read'] },
  { id: 'parts', x: 76, y: 66, anchor: 'start', scenarios: ['read'] },
  { id: 'request', x: 76, y: 124, anchor: 'start', scenarios: ['run'] },
]

// 가로형은 사용자·셸·커널·ls를 왼쪽에서 오른쪽으로 한 줄에 두고, 하드웨어를 커널 아래에 둔다.
const wideNodes = [
  { id: 'user', x: 16, y: 24, width: 80 },
  { id: 'shell', x: 136, y: 24, width: 80 },
  { id: 'kernel', x: 256, y: 24, width: 80 },
  { id: 'hardware', x: 256, y: 96, width: 80 },
  { id: 'ls', x: 372, y: 24, width: 60 },
]

const widePaths: Record<string, string> = {
  'user-shell': 'M96 40 H136',
  'shell-kernel': 'M216 40 H256',
  'kernel-ls': 'M336 40 H372',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'line', x: 16, y: 76, anchor: 'start' },
  { id: 'parts', x: 16, y: 90, anchor: 'start' },
  { id: 'request', x: 136, y: 76, anchor: 'start' },
]

export const shellLayerScenarios: DiagramScenario[] = [
  { id: 'read', nodes: ['user', 'shell'], paths: ['user-shell'] },
  { id: 'run', nodes: ['shell', 'kernel', 'ls'], paths: ['shell-kernel', 'kernel-ls'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ShellLayerDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-shell-layer-arrow`
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
      scenarios={shellLayerScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 136' : '0 0 280 240'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

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
