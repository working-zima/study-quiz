import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-permissions'].diagrams['symbolic-mode']

// 세로형은 맨 위 왼쪽에 바꾸기 전 권한을 두고, 그 아래로 세 줄을 쌓는다. 줄마다 왼쪽이 명령, 오른쪽이 그 명령을 입력한 뒤의 권한이다.
// 바꾸기 전 권한에서 명령으로 가는 화살표는 왼쪽 세로 통로(x 20)를 함께 쓴다. 세 명령과 그 뒤 권한은 서로 다른 자리에 따로 있다. 노드는 모두 회색이다.
const nodes = [
  { id: 'before', x: 8, y: 16, width: 88 },
  { id: 'cmd-plus', x: 32, y: 72, width: 144 },
  { id: 'after-plus', x: 192, y: 72, width: 80 },
  { id: 'cmd-equals', x: 32, y: 128, width: 144 },
  { id: 'after-equals', x: 192, y: 128, width: 80 },
  { id: 'cmd-minus', x: 32, y: 184, width: 144 },
  { id: 'after-minus', x: 192, y: 184, width: 80 },
]

// 화살표는 시나리오마다 보인다. 바꾸기 전 권한 → 명령 → 뒤 권한이다.
const paths: Record<string, string> = {
  'to-plus': 'M20 48 V88 H32',
  'out-plus': 'M176 88 H192',
  'to-equals': 'M20 48 V144 H32',
  'out-equals': 'M176 144 H192',
  'to-minus': 'M20 48 V200 H32',
  'out-minus': 'M176 200 H192',
}

// 바꾸기 전 곁말은 세 시나리오에 모두 보이고, 나머지는 자기 줄 바로 아래 오른쪽에 붙는다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'before-note', x: 104, y: 36, anchor: 'start', scenarios: ['plus', 'equals', 'minus'] },
  { id: 'plus-note', x: 272, y: 124, anchor: 'end', scenarios: ['plus'] },
  { id: 'equals-note', x: 272, y: 180, anchor: 'end', scenarios: ['equals'] },
  { id: 'minus-note', x: 272, y: 236, anchor: 'end', scenarios: ['minus'] },
]

// 가로형은 바꾸기 전 권한을 왼쪽 가운데에, 세 명령을 가운데 열에, 뒤 권한을 오른쪽 열에 한 줄씩 둔다.
const wideNodes = [
  { id: 'before', x: 8, y: 72, width: 88 },
  { id: 'cmd-plus', x: 128, y: 16, width: 160 },
  { id: 'after-plus', x: 320, y: 16, width: 96 },
  { id: 'cmd-equals', x: 128, y: 72, width: 160 },
  { id: 'after-equals', x: 320, y: 72, width: 96 },
  { id: 'cmd-minus', x: 128, y: 128, width: 160 },
  { id: 'after-minus', x: 320, y: 128, width: 96 },
]

const widePaths: Record<string, string> = {
  'to-plus': 'M96 88 H112 V32 H128',
  'out-plus': 'M288 32 H320',
  'to-equals': 'M96 88 H128',
  'out-equals': 'M288 88 H320',
  'to-minus': 'M96 88 H112 V144 H128',
  'out-minus': 'M288 144 H320',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'before-note', x: 52, y: 64, anchor: 'middle' },
  { id: 'plus-note', x: 416, y: 62, anchor: 'end' },
  { id: 'equals-note', x: 416, y: 118, anchor: 'end' },
  { id: 'minus-note', x: 416, y: 174, anchor: 'end' },
]

// 세 시나리오는 바꾸기 전 권한만 함께 쓰고, 명령과 뒤 권한은 저마다 다르다.
export const symbolicModeScenarios: DiagramScenario[] = [
  { id: 'plus', nodes: ['before', 'cmd-plus', 'after-plus'], paths: ['to-plus', 'out-plus'] },
  { id: 'equals', nodes: ['before', 'cmd-equals', 'after-equals'], paths: ['to-equals', 'out-equals'] },
  { id: 'minus', nodes: ['before', 'cmd-minus', 'after-minus'], paths: ['to-minus', 'out-minus'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function SymbolicModeDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-symbolic-mode-arrow`
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
      scenarios={symbolicModeScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 184' : '0 0 280 248'}>
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
