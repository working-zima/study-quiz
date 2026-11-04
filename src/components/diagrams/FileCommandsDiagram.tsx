import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-shell'].diagrams['file-commands']

// 세로형은 맨 위에 바꾸기 전의 파일(notes.txt, mv -i의 예에서만 이미 있는 memo.txt)을 두고, 그 아래로 명령마다
// 명령 노드와 그 명령 뒤에 남는 파일 노드를 차례로 쌓는다. 명령마다 노드 id와 자리가 따로다. 노드는 모두 회색이다.
const nodes = [
  { id: 'notes', x: 32, y: 8, width: 84 },
  { id: 'memo-old', x: 132, y: 8, width: 84 },
  { id: 'cmd-copy', x: 32, y: 64, width: 156 },
  { id: 'after-copy', x: 64, y: 112, width: 140 },
  { id: 'cmd-move', x: 32, y: 160, width: 156 },
  { id: 'after-move', x: 64, y: 208, width: 84 },
  { id: 'cmd-remove', x: 32, y: 256, width: 96 },
  { id: 'cmd-interactive', x: 32, y: 304, width: 170 },
]

// notes.txt에서 명령으로 가는 화살표는 왼쪽 통로(x 16)로 내려가고, 명령에서 남는 파일로는 곧게 내려간다.
const paths: Record<string, string> = {
  'in-copy': 'M32 24 H16 V80 H32',
  'out-copy': 'M120 96 V112',
  'in-move': 'M32 24 H16 V176 H32',
  'out-move': 'M120 192 V208',
  'in-remove': 'M32 24 H16 V272 H32',
  'in-interactive': 'M32 24 H16 V320 H32',
}

const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'removed', x: 136, y: 276, anchor: 'start', scenarios: ['remove'] },
  { id: 'ask', x: 48, y: 352, anchor: 'start', scenarios: ['interactive'] },
]

// 가로형은 왼쪽 열에 바꾸기 전의 파일, 가운데 열에 명령, 오른쪽 열에 명령 뒤에 남는 파일을 둔다.
const wideNodes = [
  { id: 'notes', x: 8, y: 96, width: 84 },
  { id: 'memo-old', x: 8, y: 152, width: 84 },
  { id: 'cmd-copy', x: 112, y: 8, width: 156 },
  { id: 'after-copy', x: 296, y: 8, width: 140 },
  { id: 'cmd-move', x: 112, y: 56, width: 156 },
  { id: 'after-move', x: 296, y: 56, width: 84 },
  { id: 'cmd-remove', x: 112, y: 104, width: 96 },
  { id: 'cmd-interactive', x: 112, y: 152, width: 170 },
]

const widePaths: Record<string, string> = {
  'in-copy': 'M92 112 H102 V24 H112',
  'out-copy': 'M268 24 H296',
  'in-move': 'M92 112 H102 V72 H112',
  'out-move': 'M268 72 H296',
  'in-remove': 'M92 112 H102 V120 H112',
  'in-interactive': 'M92 112 H102 V168 H112',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'removed', x: 216, y: 124, anchor: 'start' },
  { id: 'ask', x: 290, y: 172, anchor: 'start' },
]

// cp 뒤에는 두 파일이, mv 뒤에는 memo.txt만 남는다. rm과 mv -i에는 남는 파일 노드가 없고 곁말이 결과를 말한다.
export const fileCommandsScenarios: DiagramScenario[] = [
  { id: 'copy', nodes: ['notes', 'cmd-copy', 'after-copy'], paths: ['in-copy', 'out-copy'] },
  { id: 'move', nodes: ['notes', 'cmd-move', 'after-move'], paths: ['in-move', 'out-move'] },
  { id: 'remove', nodes: ['notes', 'cmd-remove'], paths: ['in-remove'] },
  { id: 'interactive', nodes: ['notes', 'memo-old', 'cmd-interactive'], paths: ['in-interactive'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function FileCommandsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-file-commands-arrow`
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
      scenarios={fileCommandsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 192' : '0 0 280 360'}>
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
