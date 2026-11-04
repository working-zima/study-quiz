import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-shell'].diagrams['working-directory']

// 세로형은 디렉터리 나무를 위에서 아래로 그린다. 맨 위 루트 디렉터리 / 아래에 home과 var를 나란히 두고,
// home 아래로 user1·docs를, var 아래로 log를 세로로 잇는다. 노드는 모두 회색이다.
const nodes = [
  { id: 'slash', x: 110, y: 8, width: 60 },
  { id: 'home', x: 50, y: 72, width: 60 },
  { id: 'var', x: 170, y: 72, width: 60 },
  { id: 'user1', x: 50, y: 136, width: 60 },
  { id: 'log', x: 170, y: 136, width: 60 },
  { id: 'docs', x: 50, y: 200, width: 60 },
]

// 부모와 자식을 잇는 가지는 늘 보이고, 고른 시나리오에서 cd가 따라가는 화살표를 그 위에 겹쳐 그린다.
const paths: Record<string, string> = {
  'b-home': 'M140 40 V56 H80 V72',
  'b-var': 'M140 40 V56 H200 V72',
  'b-user1': 'M80 104 V136',
  'b-log': 'M200 104 V136',
  'b-docs': 'M80 168 V200',
  'to-docs': 'M80 168 V200',
  'to-var': 'M140 40 V56 H200 V72',
  'to-log': 'M200 104 V136',
}

const linkIds = ['b-home', 'b-var', 'b-user1', 'b-log', 'b-docs']

// pwd가 보이는 경로는 시나리오마다 하나이고, 나무 아래 같은 자리에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'login', x: 140, y: 260, anchor: 'middle', scenarios: ['login'] },
  { id: 'relative', x: 140, y: 260, anchor: 'middle', scenarios: ['relative'] },
  { id: 'absolute', x: 140, y: 260, anchor: 'middle', scenarios: ['absolute'] },
]

// 가로형은 나무를 왼쪽에서 오른쪽으로 그린다. / 오른쪽에 home과 var를 세로로 두고, home 오른쪽으로 user1·docs를, var 오른쪽으로 log를 잇는다.
const wideNodes = [
  { id: 'slash', x: 8, y: 48, width: 48 },
  { id: 'home', x: 96, y: 16, width: 60 },
  { id: 'var', x: 96, y: 80, width: 60 },
  { id: 'user1', x: 196, y: 16, width: 60 },
  { id: 'log', x: 196, y: 80, width: 60 },
  { id: 'docs', x: 296, y: 16, width: 60 },
]

const widePaths: Record<string, string> = {
  'b-home': 'M56 64 H76 V32 H96',
  'b-var': 'M56 64 H76 V96 H96',
  'b-user1': 'M156 32 H196',
  'b-log': 'M156 96 H196',
  'b-docs': 'M256 32 H296',
  'to-docs': 'M256 32 H296',
  'to-var': 'M56 64 H76 V96 H96',
  'to-log': 'M156 96 H196',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'login', x: 276, y: 100, anchor: 'start' },
  { id: 'relative', x: 276, y: 100, anchor: 'start' },
  { id: 'absolute', x: 276, y: 100, anchor: 'start' },
]

// nodes에는 그 명령 뒤의 작업 디렉터리 하나만 적는다. cd docs는 로그인 직후의 자리 user1에서, cd /var/log는 루트 디렉터리에서 출발한다.
export const workingDirectoryScenarios: DiagramScenario[] = [
  { id: 'login', nodes: ['user1'], paths: [] },
  { id: 'relative', nodes: ['docs'], paths: ['to-docs'] },
  { id: 'absolute', nodes: ['log'], paths: ['to-var', 'to-log'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function WorkingDirectoryDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-working-directory-arrow`
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
      scenarios={workingDirectoryScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 128' : '0 0 280 272'}>
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
