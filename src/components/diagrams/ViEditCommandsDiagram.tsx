import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-shell'].diagrams['vi-edit-commands']

// 세로형은 맨 위에 지우기 전의 줄 red green blue를 두고, 그 아래로 명령마다 명령 노드와 그 명령 뒤의 줄 노드를 차례로 쌓는다.
// 명령마다 노드 id와 자리가 따로다. 노드는 모두 회색이다.
const nodes = [
  { id: 'before', x: 32, y: 8, width: 120 },
  { id: 'cmd-char', x: 32, y: 64, width: 40 },
  { id: 'after-char', x: 88, y: 64, width: 104 },
  { id: 'cmd-word', x: 32, y: 112, width: 40 },
  { id: 'after-word', x: 88, y: 112, width: 104 },
  { id: 'cmd-end', x: 32, y: 160, width: 40 },
  { id: 'after-end', x: 88, y: 160, width: 104 },
  { id: 'cmd-line', x: 32, y: 208, width: 40 },
  { id: 'after-line', x: 88, y: 208, width: 104 },
]

// 지우기 전의 줄에서 명령으로 가는 화살표는 왼쪽 통로(x 16)로 내려가고, 명령에서 뒤 줄로는 곧게 오른쪽으로 간다.
const paths: Record<string, string> = {
  'in-char': 'M32 24 H16 V80 H32',
  'out-char': 'M72 80 H88',
  'in-word': 'M32 24 H16 V128 H32',
  'out-word': 'M72 128 H88',
  'in-end': 'M32 24 H16 V176 H32',
  'out-end': 'M72 176 H88',
  'in-line': 'M32 24 H16 V224 H32',
  'out-line': 'M72 224 H88',
}

// 커서가 어디 놓였는지는 늘 보인다. D 뒤에 남는 것을 짚는 곁말은 D를 고를 때만 보인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] | null }[] = [
  { id: 'cursor', x: 160, y: 28, anchor: 'start', scenarios: null },
  { id: 'front', x: 200, y: 180, anchor: 'start', scenarios: ['end'] },
]

// 가로형은 왼쪽에 지우기 전의 줄, 가운데 열에 명령, 오른쪽 열에 명령 뒤의 줄을 둔다.
const wideNodes = [
  { id: 'before', x: 8, y: 72, width: 120 },
  { id: 'cmd-char', x: 160, y: 8, width: 40 },
  { id: 'after-char', x: 232, y: 8, width: 104 },
  { id: 'cmd-word', x: 160, y: 56, width: 40 },
  { id: 'after-word', x: 232, y: 56, width: 104 },
  { id: 'cmd-end', x: 160, y: 104, width: 40 },
  { id: 'after-end', x: 232, y: 104, width: 104 },
  { id: 'cmd-line', x: 160, y: 152, width: 40 },
  { id: 'after-line', x: 232, y: 152, width: 104 },
]

const widePaths: Record<string, string> = {
  'in-char': 'M128 88 H144 V24 H160',
  'out-char': 'M200 24 H232',
  'in-word': 'M128 88 H144 V72 H160',
  'out-word': 'M200 72 H232',
  'in-end': 'M128 88 H144 V120 H160',
  'out-end': 'M200 120 H232',
  'in-line': 'M128 88 H144 V168 H160',
  'out-line': 'M200 168 H232',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'cursor', x: 68, y: 124, anchor: 'middle' },
  { id: 'front', x: 340, y: 124, anchor: 'start' },
]

// x는 g 한 글자만, dw는 green과 뒤 빈칸을, D는 커서부터 줄 끝을 지운다. dd 뒤에는 줄이 사라진다.
export const viEditCommandsScenarios: DiagramScenario[] = [
  { id: 'char', nodes: ['before', 'cmd-char', 'after-char'], paths: ['in-char', 'out-char'] },
  { id: 'word', nodes: ['before', 'cmd-word', 'after-word'], paths: ['in-word', 'out-word'] },
  { id: 'end', nodes: ['before', 'cmd-end', 'after-end'], paths: ['in-end', 'out-end'] },
  { id: 'line', nodes: ['before', 'cmd-line', 'after-line'], paths: ['in-line', 'out-line'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ViEditCommandsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-vi-edit-commands-arrow`
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
      scenarios={viEditCommandsScenarios}
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
