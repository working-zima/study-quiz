import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-shell'].diagrams['find-search']

// 세로형은 디렉터리 나무를 위에서 아래로 그린다. 시작 디렉터리 user1 아래에 app.log·report.txt·docs를 나란히,
// docs 아래에 old.log를 둔다. 찾은 파일의 경로를 받는 ls -l은 나무 아래에 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'user1', x: 110, y: 8, width: 60 },
  { id: 'app', x: 16, y: 72, width: 64 },
  { id: 'report', x: 98, y: 72, width: 84 },
  { id: 'docs', x: 200, y: 72, width: 60 },
  { id: 'old', x: 198, y: 136, width: 64 },
  { id: 'ls', x: 110, y: 200, width: 60 },
]

// 가지는 늘 보인다. -exec의 화살표는 찾은 파일에서 ls -l로 간다.
const paths: Record<string, string> = {
  'b-app': 'M140 40 V56 H48 V72',
  'b-report': 'M140 40 V72',
  'b-docs': 'M140 40 V56 H230 V72',
  'b-old': 'M230 104 V136',
  'app-ls': 'M48 104 V216 H110',
  'old-ls': 'M230 168 V216 H170',
}

const linkIds = ['b-app', 'b-report', 'b-docs', 'b-old']

// 시작 디렉터리의 경로는 늘 보이고, 나머지 곁말은 시나리오마다 보인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] | null }[] = [
  { id: 'start', x: 178, y: 28, anchor: 'start', scenarios: null },
  { id: 'descend', x: 192, y: 156, anchor: 'end', scenarios: ['name'] },
  { id: 'each', x: 140, y: 250, anchor: 'middle', scenarios: ['exec'] },
]

// 가로형은 나무를 왼쪽에서 오른쪽으로 그린다. user1 오른쪽 열에 app.log·report.txt·docs를 쌓고, docs 오른쪽에 old.log, 맨 오른쪽에 ls -l을 둔다.
const wideNodes = [
  { id: 'user1', x: 8, y: 64, width: 60 },
  { id: 'app', x: 112, y: 8, width: 64 },
  { id: 'report', x: 112, y: 64, width: 84 },
  { id: 'docs', x: 112, y: 120, width: 60 },
  { id: 'old', x: 216, y: 120, width: 64 },
  { id: 'ls', x: 340, y: 64, width: 60 },
]

const widePaths: Record<string, string> = {
  'b-app': 'M68 80 H90 V24 H112',
  'b-report': 'M68 80 H112',
  'b-docs': 'M68 80 H90 V136 H112',
  'b-old': 'M172 136 H216',
  'app-ls': 'M176 24 H320 V72 H340',
  'old-ls': 'M280 136 H320 V88 H340',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'start', x: 38, y: 112, anchor: 'middle' },
  { id: 'descend', x: 248, y: 172, anchor: 'middle' },
  { id: 'each', x: 370, y: 116, anchor: 'middle' },
]

// -name은 docs 안까지 내려가 .log 파일 둘을, -type d는 시작 디렉터리와 docs를 고른다. -exec는 찾은 파일마다 ls -l로 경로를 넘긴다.
export const findSearchScenarios: DiagramScenario[] = [
  { id: 'name', nodes: ['app', 'old'], paths: [] },
  { id: 'type', nodes: ['user1', 'docs'], paths: [] },
  { id: 'exec', nodes: ['app', 'old', 'ls'], paths: ['app-ls', 'old-ls'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function FindSearchDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-find-search-arrow`
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
      scenarios={findSearchScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 184' : '0 0 280 256'}>
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
