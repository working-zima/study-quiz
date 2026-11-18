import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-server-roles'].diagrams['dhcp-scope-range']

// 세로형은 위쪽 SRV01의 범위 박스 안에 제외 범위 칸과 나머지 칸을 위아래로 두고, 칸마다 오른쪽에 그 칸의 주소 수 곁말을 둔다.
// 박스 아래의 PC01에는 나머지 칸에서만 화살표가 간다. 노드는 모두 회색이다.
const nodes = [
  { id: 'excluded', x: 16, y: 28, width: 160 },
  { id: 'leasable', x: 16, y: 72, width: 160 },
  { id: 'pc01', x: 64, y: 144, width: 48 },
]

const groups = [
  { id: 'scope', x: 8, y: 8, width: 264, height: 104, labelX: 16, labelY: 21 },
]

// lease-pc는 SRV01이 나머지 칸의 주소 하나를 PC01에게 빌려주는 방향이다.
const paths: Record<string, string> = {
  'lease-pc': 'M88 104 V144',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다.
const noteScenarios: Record<string, string> = {
  'range-note': 'range',
  'excl-note': 'exclude',
  'lease-note': 'lease',
  'term-note': 'lease',
}

const notes: Note[] = [
  { id: 'range-note', x: 264, y: 21, anchor: 'end' },
  { id: 'excl-note', x: 184, y: 48, anchor: 'start' },
  { id: 'lease-note', x: 184, y: 92, anchor: 'start' },
  { id: 'term-note', x: 96, y: 131, anchor: 'start' },
]

// 가로형은 범위 박스 안에 두 칸을 한 줄로 이어 두어, 범위가 제외 범위와 나머지로 나뉘는 것을 가로로 보인다. PC01은 박스 오른쪽에 둔다.
const wideNodes = [
  { id: 'excluded', x: 16, y: 32, width: 160 },
  { id: 'leasable', x: 192, y: 32, width: 160 },
  { id: 'pc01', x: 384, y: 32, width: 48 },
]

const wideGroups = [
  { id: 'scope', x: 8, y: 8, width: 352, height: 68, labelX: 16, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'lease-pc': 'M352 48 H384',
}

const wideNotes: Note[] = [
  { id: 'range-note', x: 352, y: 21, anchor: 'end' },
  { id: 'excl-note', x: 96, y: 92, anchor: 'middle' },
  { id: 'lease-note', x: 272, y: 92, anchor: 'middle' },
  { id: 'term-note', x: 432, y: 92, anchor: 'end' },
]

// 범위: 두 칸 모두. 제외 범위: 제외 범위 칸. 나눠 주는 주소: 나머지 칸과 PC01, 그리고 PC01로 가는 화살표.
export const dhcpScopeRangeScenarios: DiagramScenario[] = [
  { id: 'range', nodes: ['excluded', 'leasable'], paths: [] },
  { id: 'exclude', nodes: ['excluded'], paths: [] },
  { id: 'lease', nodes: ['leasable', 'pc01'], paths: ['lease-pc'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function DhcpScopeRangeDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-dhcp-scope-range-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={dhcpScopeRangeScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 104' : '0 0 280 184'}>
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
