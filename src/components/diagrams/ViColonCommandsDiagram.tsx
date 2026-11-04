import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-shell'].diagrams['vi-colon-commands']

// 세로형은 맨 위에 고친 뒤 아직 저장하지 않은 memo.txt를 두고, 그 아래로 명령마다 명령 노드와 그 명령의 결과 노드를 차례로 쌓는다.
// 명령마다 노드 id와 자리가 따로다. 노드는 모두 회색이다.
const nodes = [
  { id: 'before', x: 24, y: 8, width: 72 },
  { id: 'cmd-write', x: 24, y: 64, width: 40 },
  { id: 'after-write', x: 80, y: 64, width: 128 },
  { id: 'cmd-quit', x: 24, y: 112, width: 40 },
  { id: 'after-quit', x: 80, y: 112, width: 128 },
  { id: 'cmd-force-quit', x: 24, y: 160, width: 40 },
  { id: 'after-force-quit', x: 80, y: 160, width: 128 },
  { id: 'cmd-write-quit', x: 24, y: 208, width: 40 },
  { id: 'after-write-quit', x: 80, y: 208, width: 128 },
]

// 파일에서 명령으로 가는 화살표는 왼쪽 통로(x 12)로 내려가고, 명령에서 결과로는 곧게 오른쪽으로 간다.
const paths: Record<string, string> = {
  'in-write': 'M24 24 H12 V80 H24',
  'out-write': 'M64 80 H80',
  'in-quit': 'M24 24 H12 V128 H24',
  'out-quit': 'M64 128 H80',
  'in-force-quit': 'M24 24 H12 V176 H24',
  'out-force-quit': 'M64 176 H80',
  'in-write-quit': 'M24 24 H12 V224 H24',
  'out-write-quit': 'M64 224 H80',
}

// 아직 저장하지 않았다는 것은 늘 보인다. :q가 끝나지 않는 까닭은 :q를 고를 때만 곁말로 보인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] | null }[] = [
  { id: 'unsaved', x: 104, y: 28, anchor: 'start', scenarios: null },
  { id: 'error', x: 214, y: 132, anchor: 'start', scenarios: ['quit'] },
]

// 가로형은 왼쪽에 파일, 가운데 열에 명령, 오른쪽 열에 결과를 둔다. 늘 보이는 곁말은 파일 아래, 통로(x 168) 왼쪽에 둔다.
const wideNodes = [
  { id: 'before', x: 8, y: 72, width: 72 },
  { id: 'cmd-write', x: 184, y: 8, width: 40 },
  { id: 'after-write', x: 240, y: 8, width: 128 },
  { id: 'cmd-quit', x: 184, y: 56, width: 40 },
  { id: 'after-quit', x: 240, y: 56, width: 128 },
  { id: 'cmd-force-quit', x: 184, y: 104, width: 40 },
  { id: 'after-force-quit', x: 240, y: 104, width: 128 },
  { id: 'cmd-write-quit', x: 184, y: 152, width: 40 },
  { id: 'after-write-quit', x: 240, y: 152, width: 128 },
]

const widePaths: Record<string, string> = {
  'in-write': 'M80 88 H168 V24 H184',
  'out-write': 'M224 24 H240',
  'in-quit': 'M80 88 H168 V72 H184',
  'out-quit': 'M224 72 H240',
  'in-force-quit': 'M80 88 H168 V120 H184',
  'out-force-quit': 'M224 120 H240',
  'in-write-quit': 'M80 88 H168 V168 H184',
  'out-write-quit': 'M224 168 H240',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'unsaved', x: 8, y: 124, anchor: 'start' },
  { id: 'error', x: 374, y: 76, anchor: 'start' },
]

// :w는 저장만, :q는 끝나지 않음, :q!는 바뀜을 버리고 끝남, :wq는 저장하고 끝남.
export const viColonCommandsScenarios: DiagramScenario[] = [
  { id: 'write', nodes: ['before', 'cmd-write', 'after-write'], paths: ['in-write', 'out-write'] },
  { id: 'quit', nodes: ['before', 'cmd-quit', 'after-quit'], paths: ['in-quit', 'out-quit'] },
  { id: 'force-quit', nodes: ['before', 'cmd-force-quit', 'after-force-quit'], paths: ['in-force-quit', 'out-force-quit'] },
  { id: 'write-quit', nodes: ['before', 'cmd-write-quit', 'after-write-quit'], paths: ['in-write-quit', 'out-write-quit'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ViColonCommandsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-vi-colon-commands-arrow`
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
      scenarios={viColonCommandsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 192' : '0 0 280 248'}>
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
