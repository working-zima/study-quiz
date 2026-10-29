import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ip-addressing'].diagrams.subnetting

// 세로형은 나누기 전 네트워크를 왼쪽 위에 두고, 나눈 서브넷 넷을 그 오른쪽 아래에 주소 차례로 쌓는다.
// 화살표는 원래 네트워크의 아래 변에서 저마다 다른 자리로 내려가 계단처럼 서로 엇갈리지 않게 서브넷으로 들어간다.
const nodes = [
  { id: 'net', x: 8, y: 8, width: 96 },
  { id: 's0', x: 64, y: 56, width: 104 },
  { id: 's64', x: 64, y: 100, width: 104 },
  { id: 's128', x: 64, y: 144, width: 104 },
  { id: 's192', x: 64, y: 188, width: 104 },
]

const paths: Record<string, string> = {
  'to-0': 'M40 40 V72 H64',
  'to-64': 'M32 40 V116 H64',
  'to-128': 'M24 40 V160 H64',
  'to-192': 'M16 40 V204 H64',
}

// 곁말은 시나리오에서만 보인다. 넷째 옥텟의 2진수는 자기 서브넷 오른쪽에, 서브넷 하나의 네 주소는 그림 아래에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'bits-0', x: 176, y: 75, anchor: 'start', scenarios: ['split'] },
  { id: 'bits-64', x: 176, y: 119, anchor: 'start', scenarios: ['split'] },
  { id: 'bits-128', x: 176, y: 163, anchor: 'start', scenarios: ['split'] },
  { id: 'bits-192', x: 176, y: 207, anchor: 'start', scenarios: ['split'] },
  { id: 'range-net', x: 8, y: 242, anchor: 'start', scenarios: ['range'] },
  { id: 'range-first', x: 8, y: 256, anchor: 'start', scenarios: ['range'] },
  { id: 'range-last', x: 8, y: 270, anchor: 'start', scenarios: ['range'] },
  { id: 'range-broadcast', x: 8, y: 284, anchor: 'start', scenarios: ['range'] },
]

// 가로형은 원래 네트워크를 왼쪽 가운데에 두고, 서브넷 넷을 오른쪽에 세로로 놓는다. 화살표는 원래 네트워크의 오른쪽 변에서
// 나와 바깥 둘은 안쪽 통로(x 124), 가운데 둘은 바깥 통로(x 132)로 꺾여 서로 겹치지 않는다. 곁말은 서브넷 오른쪽에 둔다.
const wideNodes = [
  { id: 'net', x: 8, y: 80, width: 96 },
  { id: 's0', x: 144, y: 8, width: 104 },
  { id: 's64', x: 144, y: 56, width: 104 },
  { id: 's128', x: 144, y: 104, width: 104 },
  { id: 's192', x: 144, y: 152, width: 104 },
]

const widePaths: Record<string, string> = {
  'to-0': 'M104 84 H124 V24 H144',
  'to-64': 'M104 92 H132 V72 H144',
  'to-128': 'M104 100 H132 V120 H144',
  'to-192': 'M104 108 H124 V168 H144',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'bits-0', x: 256, y: 27, anchor: 'start' },
  { id: 'bits-64', x: 256, y: 75, anchor: 'start' },
  { id: 'bits-128', x: 256, y: 123, anchor: 'start' },
  { id: 'bits-192', x: 256, y: 171, anchor: 'start' },
  { id: 'range-net', x: 256, y: 57, anchor: 'start' },
  { id: 'range-first', x: 256, y: 70, anchor: 'start' },
  { id: 'range-last', x: 256, y: 83, anchor: 'start' },
  { id: 'range-broadcast', x: 256, y: 96, anchor: 'start' },
]

// 넷으로 나누기: 원래 네트워크와 서브넷 넷이 선명하고 화살표 넷이 보인다. 서브넷 하나의 범위: 192.0.2.64/26만 선명하다.
export const subnettingScenarios: DiagramScenario[] = [
  { id: 'split', nodes: ['net', 's0', 's64', 's128', 's192'], paths: ['to-0', 'to-64', 'to-128', 'to-192'] },
  { id: 'range', nodes: ['s64'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function SubnettingDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-subnetting-arrow`
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
      scenarios={subnettingScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 192' : '0 0 280 290'}>
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
