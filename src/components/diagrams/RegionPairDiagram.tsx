import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-regions-zones'].diagrams['region-pairs']

// 지리 박스 안에 지역 A를 위에, 지역 B를 아래에 둔다. 노드 오른쪽은 곁말 자리로 비워 둔다.
const groups = [
  { id: 'geography', x: 6, y: 4, width: 268, height: 172 },
]

// 두 지역은 노드다. 모두 회색이고, 멈춘 지역은 흐림과 곁말로만 보인다.
const nodes = [
  { id: 'region-a', x: 20, y: 32, width: 104 },
  { id: 'region-b', x: 20, y: 136, width: 104 },
]

// 'pair'는 두 지역이 짝이라는 연결선으로 늘 보이고 화살표가 아니다. 'failover'는 지역 재해 때만 보이는 장애 조치 화살표다.
// 두 선은 두 지역의 마주 보는 변 사이를 곧게 잇되, 겹쳐 보이지 않게 노드의 왼쪽과 오른쪽으로 떼어 둔다.
const paths: Record<string, string> = {
  'pair': 'M48 64 V136',
  'failover': 'M96 64 V136',
}

// 곁말은 자기 지역 노드 오른쪽에 두고 그 시나리오에서만 보인다.
const notes = [
  { id: 'a-down-note', x: 132, y: 51, textAnchor: 'start' as const, scenarios: ['disaster'] },
  { id: 'b-takeover-note', x: 132, y: 155, textAnchor: 'start' as const, scenarios: ['disaster'] },
  { id: 'a-update-note', x: 132, y: 51, textAnchor: 'start' as const, scenarios: ['update'] },
  { id: 'b-running-note', x: 132, y: 155, textAnchor: 'start' as const, scenarios: ['update'] },
]

// 가로형은 지역 A를 왼쪽에, 지역 B를 오른쪽에 둔다. 짝을 잇는 선은 위쪽, 장애 조치 화살표는 아래쪽으로 지나고 곁말은 노드 아래에 둔다.
const wideGroups = [
  { id: 'geography', x: 8, y: 4, width: 424, height: 88 },
]

const wideNodes = [
  { id: 'region-a', x: 24, y: 32, width: 104 },
  { id: 'region-b', x: 312, y: 32, width: 104 },
]

const widePaths: Record<string, string> = {
  'pair': 'M128 40 H312',
  'failover': 'M128 56 H312',
}

// 곁말은 자리가 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'a-down-note', x: 76, y: 82, textAnchor: 'middle' as const },
  { id: 'b-takeover-note', x: 364, y: 82, textAnchor: 'middle' as const },
  { id: 'a-update-note', x: 76, y: 82, textAnchor: 'middle' as const },
  { id: 'b-running-note', x: 364, y: 82, textAnchor: 'middle' as const },
]

// 지역 재해에서는 지역 A가 흐려지고 장애 조치 화살표가 보인다. 업데이트에서는 두 지역이 모두 선명하고 화살표가 없다.
export const regionPairScenarios: DiagramScenario[] = [
  { id: 'disaster', nodes: ['region-b'], paths: ['failover'] },
  { id: 'update', nodes: ['region-a', 'region-b'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function RegionPairDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-region-pair-arrow`
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenarios.includes(active.id))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={regionPairScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 100' : '0 0 280 184'}>
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
            <text key={group.id} data-group-label={group.id} x={group.x + 10} y={group.y + 14} className="fill-muted" fontSize="9">
              {text.groups?.[group.id]}
            </text>
          ))}

          <path data-link="pair" d={layoutPaths.pair} className="fill-none stroke-muted" strokeWidth="1.5" />

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
            <g key={node.id} data-node={node.id} opacity={active && !active.nodes.includes(node.id) ? 0.25 : 1}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {shownNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.textAnchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
