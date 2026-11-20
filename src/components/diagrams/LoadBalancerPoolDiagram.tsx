import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-devices'].diagrams['load-balancer-pool']

// 세로형은 맨 위에 클라이언트, 그 아래에 LB01, 맨 아래 서버 풀 박스 안에 WEB01·WEB02·WEB03을 나란히 둔다.
// 화살표는 요청이 가는 길이다 — 클라이언트에서 LB01로, LB01에서 고른 서버로 간다. 노드는 모두 회색이다.
const nodes = [
  { id: 'client', x: 96, y: 8, width: 88 },
  { id: 'lb01', x: 96, y: 80, width: 88 },
  { id: 'web01', x: 24, y: 160, width: 64 },
  { id: 'web02', x: 108, y: 160, width: 64 },
  { id: 'web03', x: 192, y: 160, width: 64 },
]

const groups = [
  { id: 'pool', x: 8, y: 136, width: 264, height: 64, labelX: 16, labelY: 149 },
]

const paths: Record<string, string> = {
  'client-lb': 'M140 40 V80',
  'lb-web01': 'M116 112 V124 H56 V160',
  'lb-web02': 'M140 112 V160',
  'lb-web03': 'M164 112 V124 H224 V160',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 가상 주소 곁말은 예시 곁말이라 늘 보이고 LB01의 opacity를 따른다(ADR-038). 클라이언트에서 LB01로 가는 화살표 왼쪽에 둔다.
const addressNote: Note = { id: 'address-note', x: 132, y: 64, anchor: 'end' }

// 시나리오 곁말은 자기 시나리오를 골랐을 때만 보이고, 서버 풀 박스 바로 아래 가운데에 둔다.
const noteScenarios: Record<string, string> = {
  'spread-note': 'spread',
  'health-note': 'health',
}

const notes: Note[] = [
  { id: 'spread-note', x: 140, y: 218, anchor: 'middle' },
  { id: 'health-note', x: 140, y: 218, anchor: 'middle' },
]

// 가로형은 왼쪽에 클라이언트, 가운데에 LB01, 오른쪽 서버 풀 박스 안에 WEB01·WEB02·WEB03을 위에서 아래로 쌓는다.
const wideNodes = [
  { id: 'client', x: 16, y: 80, width: 80 },
  { id: 'lb01', x: 152, y: 80, width: 72 },
  { id: 'web01', x: 304, y: 32, width: 88 },
  { id: 'web02', x: 304, y: 80, width: 88 },
  { id: 'web03', x: 304, y: 128, width: 88 },
]

const wideGroups = [
  { id: 'pool', x: 272, y: 8, width: 152, height: 160, labelX: 280, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'client-lb': 'M96 96 H152',
  'lb-web01': 'M224 88 H248 V48 H304',
  'lb-web02': 'M224 96 H304',
  'lb-web03': 'M224 104 H256 V144 H304',
}

const wideAddressNote: Note = { id: 'address-note', x: 188, y: 72, anchor: 'middle' }

const wideNotes: Note[] = [
  { id: 'spread-note', x: 140, y: 152, anchor: 'middle' },
  { id: 'health-note', x: 140, y: 152, anchor: 'middle' },
]

// 나눠 보내기: 노드가 모두 선명하고 LB01에서 서버 셋으로 화살표가 간다. 서버가 멈췄을 때: WEB02가 흐리고 WEB02로 가는 화살표가 없다.
export const loadBalancerPoolScenarios: DiagramScenario[] = [
  {
    id: 'spread',
    nodes: ['client', 'lb01', 'web01', 'web02', 'web03'],
    paths: ['client-lb', 'lb-web01', 'lb-web02', 'lb-web03'],
  },
  {
    id: 'health',
    nodes: ['client', 'lb01', 'web01', 'web03'],
    paths: ['client-lb', 'lb-web01', 'lb-web03'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function LoadBalancerPoolDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-load-balancer-pool-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes
  const layoutAddressNote = wide ? wideAddressNote : addressNote

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={loadBalancerPoolScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 176' : '0 0 280 228'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          <g className="fill-none stroke-disabled" strokeWidth="1">
            {layoutGroups.map((group) => (
              <rect key={group.id} data-group={group.id} x={group.x} y={group.y} width={group.width} height={group.height} rx="4" />
            ))}
          </g>
          {layoutGroups.map((group) => (
            <text key={group.id} data-group-label={group.id} x={group.labelX} y={group.labelY} className="fill-muted" fontSize="9">
              {text.groups?.[group.id]}
            </text>
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
              {node.id === 'lb01' && (
                <text data-example-note={layoutAddressNote.id} x={layoutAddressNote.x} y={layoutAddressNote.y} textAnchor={layoutAddressNote.anchor} className="fill-muted" fontSize="9">
                  {text.notes![layoutAddressNote.id]}
                </text>
              )}
            </g>
          ))}

          {active && layoutNotes.filter((note) => noteScenarios[note.id] === active.id).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
