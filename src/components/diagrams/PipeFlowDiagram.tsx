import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-shell'].diagrams['pipe-flow']

// 세로형은 맨 위 줄에 앞 명령(cat notes.txt·ls -l), 가운데 줄에 결과가 가는 곳(파일 more·명령 more·grep report),
// 맨 아래에 화면을 둔다. 명령 more와 파일 more는 따로 된 노드다. 노드는 모두 회색이다.
const nodes = [
  { id: 'cat', x: 16, y: 8, width: 104 },
  { id: 'ls', x: 168, y: 8, width: 72 },
  { id: 'more-file', x: 8, y: 88, width: 72 },
  { id: 'more', x: 92, y: 88, width: 76 },
  { id: 'grep', x: 180, y: 88, width: 88 },
  { id: 'screen', x: 104, y: 168, width: 72 },
]

// grep에서 화면으로 가는 화살표는 두 줄 사이의 빈자리(y 144)로 돌아 내려간다.
const paths: Record<string, string> = {
  'cat-file': 'M44 40 V88',
  'cat-more': 'M100 40 V64 H130 V88',
  'more-screen': 'M130 120 V168',
  'ls-grep': 'M224 40 V88',
  'grep-screen': 'M224 120 V144 H160 V168',
}

const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'page-op', x: 136, y: 76, anchor: 'start', scenarios: ['page'] },
  { id: 'filter-op', x: 230, y: 68, anchor: 'start', scenarios: ['filter'] },
  { id: 'file-op', x: 50, y: 68, anchor: 'start', scenarios: ['file'] },
  { id: 'no-screen', x: 98, y: 188, anchor: 'end', scenarios: ['file'] },
]

// 가로형은 왼쪽 열에 앞 명령, 가운데 열에 결과가 가는 곳, 오른쪽 열에 화면을 둔다.
const wideNodes = [
  { id: 'cat', x: 16, y: 24, width: 104 },
  { id: 'ls', x: 16, y: 120, width: 72 },
  { id: 'more-file', x: 192, y: 8, width: 72 },
  { id: 'more', x: 192, y: 64, width: 76 },
  { id: 'grep', x: 192, y: 120, width: 88 },
  { id: 'screen', x: 352, y: 64, width: 72 },
]

const widePaths: Record<string, string> = {
  'cat-file': 'M120 32 H192',
  'cat-more': 'M120 48 H156 V80 H192',
  'more-screen': 'M268 80 H352',
  'ls-grep': 'M88 136 H192',
  'grep-screen': 'M280 136 H388 V96',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'page-op', x: 124, y: 42, anchor: 'start' },
  { id: 'filter-op', x: 96, y: 130, anchor: 'start' },
  { id: 'file-op', x: 124, y: 26, anchor: 'start' },
  { id: 'no-screen', x: 388, y: 56, anchor: 'middle' },
]

// 파이프는 결과를 다른 명령(more·grep)을 거쳐 화면으로 보내고, >는 결과를 파일 more로 보내 화면에 아무것도 나오지 않는다.
export const pipeFlowScenarios: DiagramScenario[] = [
  { id: 'page', nodes: ['cat', 'more', 'screen'], paths: ['cat-more', 'more-screen'] },
  { id: 'filter', nodes: ['ls', 'grep', 'screen'], paths: ['ls-grep', 'grep-screen'] },
  { id: 'file', nodes: ['cat', 'more-file'], paths: ['cat-file'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PipeFlowDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-pipe-flow-arrow`
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
      scenarios={pipeFlowScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 160' : '0 0 280 208'}>
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
