import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ip-protocol'].diagrams['extension-chain']

// 세로형은 패킷에 담긴 차례대로 기본 헤더, 단편화 확장 헤더, TCP 헤더, 데이터를 위에서 아래로 쌓는다.
// TCP 헤더와 데이터는 맞붙여 둔다 — 다음 헤더 칸이 가리키는 것은 헤더이고, 데이터는 그 헤더 뒤에 그대로 이어진다. 노드는 모두 회색이다.
const nodes = [
  { id: 'base', x: 72, y: 8, width: 136 },
  { id: 'fragment', x: 72, y: 64, width: 136 },
  { id: 'tcp', x: 72, y: 120, width: 136 },
  { id: 'data', x: 72, y: 152, width: 136 },
]

// 화살표는 다음 헤더 칸이 가리키는 바로 뒤의 헤더다. 확장 헤더가 없을 때의 화살표는 단편화 확장 헤더 상자를 왼쪽으로 돌아 TCP 헤더에 닿는다.
const paths: Record<string, string> = {
  'base-tcp': 'M72 24 H48 V136 H72',
  'base-fragment': 'M140 40 V64',
  'fragment-tcp': 'M140 96 V120',
}

// 다음 헤더 번호 곁말은 그 칸을 가진 헤더의 오른쪽에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'base-tcp-note', x: 214, y: 28, anchor: 'start', scenarios: ['none'] },
  { id: 'base-fragment-note', x: 214, y: 28, anchor: 'start', scenarios: ['fragment'] },
  { id: 'fragment-tcp-note', x: 214, y: 84, anchor: 'start', scenarios: ['fragment'] },
]

// 가로형은 같은 차례를 왼쪽에서 오른쪽으로 한 줄에 놓는다. 확장 헤더가 없을 때의 화살표는 위로 돌아 넘어간다.
const wideNodes = [
  { id: 'base', x: 44, y: 40, width: 64 },
  { id: 'fragment', x: 140, y: 40, width: 104 },
  { id: 'tcp', x: 276, y: 40, width: 64 },
  { id: 'data', x: 340, y: 40, width: 56 },
]

const widePaths: Record<string, string> = {
  'base-tcp': 'M76 40 V24 H308 V40',
  'base-fragment': 'M108 56 H140',
  'fragment-tcp': 'M244 56 H276',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다. 가로형은 곁말을 그 헤더 아래에 둔다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'base-tcp-note', x: 76, y: 88, anchor: 'middle' },
  { id: 'base-fragment-note', x: 76, y: 88, anchor: 'middle' },
  { id: 'fragment-tcp-note', x: 192, y: 88, anchor: 'middle' },
]

// 확장 헤더가 없는 패킷에는 단편화 확장 헤더가 없으므로 그 시나리오에서는 흐려진다.
export const extensionChainScenarios: DiagramScenario[] = [
  { id: 'none', nodes: ['base', 'tcp', 'data'], paths: ['base-tcp'] },
  { id: 'fragment', nodes: ['base', 'fragment', 'tcp', 'data'], paths: ['base-fragment', 'fragment-tcp'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ExtensionChainDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-extension-chain-arrow`
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
      scenarios={extensionChainScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 96' : '0 0 280 192'}>
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
