import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['diagnostic-commands'].diagrams['pathping-stats']

// 왼쪽 박스에 pathping이 먼저 찾는 경로(PC에서 목적지까지)를 위에서 아래로 늘 보이는 선으로 잇고,
// 오른쪽 박스에 홉 2의 라우터에 보낸 요청 → 잃은 요청 → 잃은 비율을 계산의 차례대로 둔다.
// 본문이 수를 든 것은 홉 2 하나뿐이라 다른 홉의 통계는 그리지 않는다. 노드는 모두 회색이다.
const nodes = [
  { id: 'pc', x: 16, y: 28, width: 108 },
  { id: 'hop-1', x: 16, y: 76, width: 108 },
  { id: 'hop-2', x: 16, y: 124, width: 108 },
  { id: 'hop-3', x: 16, y: 172, width: 108 },
  { id: 'hop-4', x: 16, y: 220, width: 108 },
  { id: 'sent', x: 148, y: 124, width: 116 },
  { id: 'lost', x: 148, y: 172, width: 116 },
  { id: 'rate', x: 148, y: 220, width: 116 },
]

const groups = [
  { id: 'path', x: 8, y: 8, width: 124, height: 276, labelX: 16, labelY: 21 },
  { id: 'stats', x: 140, y: 104, width: 132, height: 180, labelX: 148, labelY: 117 },
]

// 늘 보이는 연결선 넷(경로의 앞 장치 → 다음 장치)과, 고른 시나리오의 화살표(요청이 가는 라우터, 계산의 차례).
const paths: Record<string, string> = {
  'link-1': 'M70 60 V76',
  'link-2': 'M70 108 V124',
  'link-3': 'M70 156 V172',
  'link-4': 'M70 204 V220',
  'send': 'M148 140 H124',
  'count': 'M206 156 V172',
  'compute': 'M206 204 V220',
}

const linkIds = ['link-1', 'link-2', 'link-3', 'link-4']

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만, 자기 박스의 맨 아래에 보인다.
const noteScenarios: Record<string, string> = {
  'path-note': 'path',
  'stats-note': 'stats',
  'both-note': 'compare',
  'more-note': 'compare',
}

const notes: Note[] = [
  { id: 'path-note', x: 16, y: 276, anchor: 'start' },
  { id: 'stats-note', x: 148, y: 276, anchor: 'start' },
  { id: 'both-note', x: 16, y: 276, anchor: 'start' },
  { id: 'more-note', x: 148, y: 276, anchor: 'start' },
]

// 가로형은 두 박스를 넓히고 사이를 벌려 놓는다. 위아래 배치는 세로형과 같다.
const wideNodes = [
  { id: 'pc', x: 16, y: 28, width: 132 },
  { id: 'hop-1', x: 16, y: 76, width: 132 },
  { id: 'hop-2', x: 16, y: 124, width: 132 },
  { id: 'hop-3', x: 16, y: 172, width: 132 },
  { id: 'hop-4', x: 16, y: 220, width: 132 },
  { id: 'sent', x: 200, y: 124, width: 140 },
  { id: 'lost', x: 200, y: 172, width: 140 },
  { id: 'rate', x: 200, y: 220, width: 140 },
]

const wideGroups = [
  { id: 'path', x: 8, y: 8, width: 148, height: 276, labelX: 16, labelY: 21 },
  { id: 'stats', x: 184, y: 104, width: 248, height: 180, labelX: 192, labelY: 117 },
]

const widePaths: Record<string, string> = {
  'link-1': 'M82 60 V76',
  'link-2': 'M82 108 V124',
  'link-3': 'M82 156 V172',
  'link-4': 'M82 204 V220',
  'send': 'M200 140 H148',
  'count': 'M270 156 V172',
  'compute': 'M270 204 V220',
}

const wideNotes: Note[] = [
  { id: 'path-note', x: 16, y: 276, anchor: 'start' },
  { id: 'stats-note', x: 200, y: 276, anchor: 'start' },
  { id: 'both-note', x: 16, y: 276, anchor: 'start' },
  { id: 'more-note', x: 200, y: 276, anchor: 'start' },
]

// nodes에는 선명하게 둘 노드와 연결선을 함께 적는다.
export const pathpingStatsScenarios: DiagramScenario[] = [
  {
    id: 'path',
    nodes: ['pc', 'hop-1', 'hop-2', 'hop-3', 'hop-4', 'link-1', 'link-2', 'link-3', 'link-4'],
    paths: [],
  },
  { id: 'stats', nodes: ['hop-2', 'sent', 'lost', 'rate'], paths: ['send', 'count', 'compute'] },
  {
    id: 'compare',
    nodes: ['pc', 'hop-1', 'hop-2', 'hop-3', 'hop-4', 'link-1', 'link-2', 'link-3', 'link-4', 'rate'],
    paths: [],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PathpingStatsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-pathping-stats-arrow`
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
      scenarios={pathpingStatsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 292' : '0 0 280 292'}>
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

          {linkIds.map((id) => (
            <path key={id} data-link={id} d={layoutPaths[id]} className="fill-none stroke-muted" strokeWidth="1.5" opacity={opacityOf(id)} />
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
