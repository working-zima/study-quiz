import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-shell'].diagrams['redirection-flow']

// 세로형은 맨 위 줄에 입력이 들어오는 곳(키보드·notes.txt), 가운데 줄에 명령(ls -l·sort), 맨 아래 줄에 결과가 나가는 곳
// (list.txt·화면)을 둔다. 왼쪽 열은 ls -l, 오른쪽 열은 sort의 줄이다. 노드는 모두 회색이다.
const nodes = [
  { id: 'keyboard', x: 24, y: 8, width: 72 },
  { id: 'notes-in', x: 166, y: 8, width: 84 },
  { id: 'ls', x: 24, y: 96, width: 72 },
  { id: 'sort', x: 172, y: 96, width: 72 },
  { id: 'list', x: 18, y: 184, width: 84 },
  { id: 'screen', x: 172, y: 184, width: 72 },
]

// ls -l에서 화면으로 가는 화살표는 두 줄 사이의 빈자리(y 156)로 돌아 내려간다.
const paths: Record<string, string> = {
  'to-screen': 'M60 128 V156 H208 V184',
  'to-list': 'M60 128 V184',
  'from-notes': 'M208 40 V96',
  'sort-screen': 'M208 128 V184',
}

const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'overwrite', x: 18, y: 232, anchor: 'start', scenarios: ['overwrite'] },
  { id: 'append', x: 18, y: 232, anchor: 'start', scenarios: ['append'] },
  { id: 'unchanged', x: 202, y: 72, anchor: 'end', scenarios: ['input'] },
]

// 가로형은 왼쪽 열에 입력이 들어오는 곳, 가운데 열에 명령, 오른쪽 열에 결과가 나가는 곳을 둔다. 위 줄이 ls -l, 아래 줄이 sort다.
const wideNodes = [
  { id: 'keyboard', x: 16, y: 16, width: 72 },
  { id: 'notes-in', x: 16, y: 96, width: 84 },
  { id: 'ls', x: 184, y: 16, width: 72 },
  { id: 'sort', x: 184, y: 96, width: 72 },
  { id: 'list', x: 344, y: 16, width: 84 },
  { id: 'screen', x: 344, y: 96, width: 72 },
]

const widePaths: Record<string, string> = {
  'to-screen': 'M220 48 V72 H380 V96',
  'to-list': 'M256 32 H344',
  'from-notes': 'M100 112 H184',
  'sort-screen': 'M256 112 H344',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'overwrite', x: 428, y: 64, anchor: 'end' },
  { id: 'append', x: 428, y: 64, anchor: 'end' },
  { id: 'unchanged', x: 16, y: 146, anchor: 'start' },
]

// >와 >>는 같은 경로(ls -l → list.txt)를 쓰고 곁말만 다르다. <는 notes.txt에서 sort를 거쳐 화면으로 간다.
export const redirectionFlowScenarios: DiagramScenario[] = [
  { id: 'default', nodes: ['ls', 'screen'], paths: ['to-screen'] },
  { id: 'overwrite', nodes: ['ls', 'list'], paths: ['to-list'] },
  { id: 'append', nodes: ['ls', 'list'], paths: ['to-list'] },
  { id: 'input', nodes: ['notes-in', 'sort', 'screen'], paths: ['from-notes', 'sort-screen'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function RedirectionFlowDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-redirection-flow-arrow`
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
      scenarios={redirectionFlowScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 152' : '0 0 280 240'}>
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
