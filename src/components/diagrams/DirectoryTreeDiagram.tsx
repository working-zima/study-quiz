import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-filesystem'].diagrams['directory-tree']

// 세로형은 디렉터리 나무를 위에서 아래로 그린다. 맨 위 루트 디렉터리 / 아래에 etc·home·root를 한 줄로 두고,
// home 아래로 user1, 그 아래로 report.txt를 세로로 잇는다. 노드는 모두 회색이다.
const nodes = [
  { id: 'slash', x: 110, y: 8, width: 60 },
  { id: 'etc', x: 14, y: 72, width: 60 },
  { id: 'home', x: 110, y: 72, width: 60 },
  { id: 'root', x: 206, y: 72, width: 60 },
  { id: 'user1', x: 110, y: 136, width: 60 },
  { id: 'report', x: 96, y: 200, width: 88 },
]

// 부모와 자식을 잇는 가지는 늘 보이고, 고른 시나리오의 화살표를 그 위에 겹쳐 그린다.
const paths: Record<string, string> = {
  'b-etc': 'M140 40 V56 H44 V72',
  'b-home': 'M140 40 V72',
  'b-root': 'M140 40 V56 H236 V72',
  'b-user1': 'M140 104 V136',
  'b-report': 'M140 168 V200',
  'to-home': 'M140 40 V72',
  'to-user1': 'M140 104 V136',
  'to-report': 'M140 168 V200',
  'to-root': 'M140 40 V56 H236 V72',
}

const linkIds = ['b-etc', 'b-home', 'b-root', 'b-user1', 'b-report']

// 「루트 디렉터리」 곁말은 / 오른쪽에, 경로 곁말은 report.txt 아래에, /root 곁말은 root 아래에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'root-dir', x: 178, y: 28, anchor: 'start', scenarios: ['root-dir', 'root-home'] },
  { id: 'path', x: 140, y: 250, anchor: 'middle', scenarios: ['path'] },
  { id: 'root-home', x: 276, y: 120, anchor: 'end', scenarios: ['root-home'] },
]

// 가로형은 나무를 왼쪽에서 오른쪽으로 그린다. / 오른쪽에 etc·home·root를 세로로 두고, home 오른쪽으로 user1·report.txt를 잇는다.
const wideNodes = [
  { id: 'slash', x: 8, y: 64, width: 48 },
  { id: 'etc', x: 96, y: 16, width: 60 },
  { id: 'home', x: 96, y: 64, width: 60 },
  { id: 'root', x: 96, y: 112, width: 60 },
  { id: 'user1', x: 196, y: 64, width: 64 },
  { id: 'report', x: 300, y: 64, width: 88 },
]

const widePaths: Record<string, string> = {
  'b-etc': 'M56 80 H76 V32 H96',
  'b-home': 'M56 80 H96',
  'b-root': 'M56 80 H76 V128 H96',
  'b-user1': 'M156 80 H196',
  'b-report': 'M260 80 H300',
  'to-home': 'M56 80 H96',
  'to-user1': 'M156 80 H196',
  'to-report': 'M260 80 H300',
  'to-root': 'M56 80 H76 V128 H96',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'root-dir', x: 6, y: 114, anchor: 'start' },
  { id: 'path', x: 270, y: 120, anchor: 'middle' },
  { id: 'root-home', x: 164, y: 140, anchor: 'start' },
]

// nodes에는 선명하게 둘 노드와 가지를 함께 적는다. 「경로」는 /에서 report.txt까지 거쳐 가는 디렉터리와 가지를, 「/root」는 /와 root를 보인다.
export const directoryTreeScenarios: DiagramScenario[] = [
  { id: 'root-dir', nodes: ['slash'], paths: [] },
  { id: 'path', nodes: ['slash', 'home', 'user1', 'report', 'b-home', 'b-user1', 'b-report'], paths: ['to-home', 'to-user1', 'to-report'] },
  { id: 'root-home', nodes: ['slash', 'root', 'b-root'], paths: ['to-root'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function DirectoryTreeDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-directory-tree-arrow`
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
      scenarios={directoryTreeScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 152' : '0 0 280 256'}>
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
