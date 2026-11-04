import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-shell'].diagrams['path-resolve']

// 세로형은 디렉터리 나무를 위에서 아래로 그린다. 루트 디렉터리 / 아래로 home, user1을 잇고,
// user1 아래에 docs 디렉터리와 report.txt 파일을 나란히 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'slash', x: 110, y: 8, width: 60 },
  { id: 'home', x: 110, y: 72, width: 60 },
  { id: 'user1', x: 110, y: 136, width: 60 },
  { id: 'docs', x: 40, y: 200, width: 60 },
  { id: 'report', x: 156, y: 200, width: 84 },
]

// 가지는 늘 보인다. 경로를 따라가는 화살표는 가지와 겹치지 않게 나무 곁으로 따로 긋는다 —
// 절대 경로는 / 오른쪽에서 내려가 report.txt로, 상대 경로는 docs 왼쪽으로 나와 user1로 올라간 뒤 report.txt로 간다.
const paths: Record<string, string> = {
  'b-home': 'M140 40 V72',
  'b-user1': 'M140 104 V136',
  'b-docs': 'M140 168 V184 H70 V200',
  'b-report': 'M140 168 V184 H198 V200',
  'from-root': 'M170 24 H256 V216 H240',
  'to-parent': 'M40 216 H24 V152 H110',
  'to-report': 'M170 152 H224 V200',
}

const linkIds = ['b-home', 'b-user1', 'b-docs', 'b-report']

// 「작업 디렉터리」는 늘 docs 아래에 보이고, 시나리오의 경로는 나무 아래 같은 자리에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] | null }[] = [
  { id: 'cwd', x: 70, y: 246, anchor: 'middle', scenarios: null },
  { id: 'absolute', x: 140, y: 262, anchor: 'middle', scenarios: ['absolute'] },
  { id: 'relative', x: 140, y: 262, anchor: 'middle', scenarios: ['relative'] },
  { id: 'home', x: 140, y: 262, anchor: 'middle', scenarios: ['home'] },
]

// 가로형은 나무를 왼쪽에서 오른쪽으로 그린다. / → home → user1을 한 줄에 두고, user1 오른쪽 위에 docs, 아래에 report.txt를 둔다.
const wideNodes = [
  { id: 'slash', x: 8, y: 56, width: 48 },
  { id: 'home', x: 96, y: 56, width: 60 },
  { id: 'user1', x: 196, y: 56, width: 60 },
  { id: 'docs', x: 296, y: 16, width: 60 },
  { id: 'report', x: 296, y: 96, width: 84 },
]

const widePaths: Record<string, string> = {
  'b-home': 'M56 72 H96',
  'b-user1': 'M156 72 H196',
  'b-docs': 'M256 72 H276 V32 H296',
  'b-report': 'M256 72 H276 V112 H296',
  'from-root': 'M32 88 V152 H338 V128',
  'to-parent': 'M326 16 V6 H226 V56',
  'to-report': 'M240 88 V140 H310 V128',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'cwd', x: 364, y: 36, anchor: 'start' },
  { id: 'absolute', x: 220, y: 172, anchor: 'middle' },
  { id: 'relative', x: 220, y: 172, anchor: 'middle' },
  { id: 'home', x: 220, y: 172, anchor: 'middle' },
]

// 절대 경로는 /에서, 상대 경로는 작업 디렉터리 docs에서 출발해 둘 다 report.txt에 닿는다. ~는 user1의 경로로 바뀐다.
export const pathResolveScenarios: DiagramScenario[] = [
  { id: 'absolute', nodes: ['slash', 'home', 'user1', 'report'], paths: ['from-root'] },
  { id: 'relative', nodes: ['docs', 'user1', 'report'], paths: ['to-parent', 'to-report'] },
  { id: 'home', nodes: ['user1'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PathResolveDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-path-resolve-arrow`
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
      scenarios={pathResolveScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 184' : '0 0 280 272'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {linkIds.map((id) => (
            <path key={id} data-link={id} d={layoutPaths[id]} className="fill-none stroke-muted" strokeWidth="1.5" opacity={opacityOf(id)} />
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

          {layoutNotes.filter((note) => note.scenarios === null || (active !== null && note.scenarios.includes(active.id))).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
