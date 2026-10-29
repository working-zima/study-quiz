import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['routing'].diagrams['autonomous-systems']

// 세로형은 AS 1 상자(라우터 1 위, 라우터 2 아래)와 AS 2 상자(라우터 4 위, 라우터 3 아래)를 나란히 둔다.
// 두 AS가 맞닿는 라우터 2와 라우터 3을 같은 높이에 두어 그 사이의 연결이 두 상자를 가로지르게 한다. 노드는 모두 회색이다.
const nodes = [
  { id: 'router-1', x: 32, y: 32, width: 80 },
  { id: 'router-2', x: 32, y: 112, width: 80 },
  { id: 'router-3', x: 168, y: 112, width: 80 },
  { id: 'router-4', x: 168, y: 32, width: 80 },
]

const groups = [
  { id: 'as-1', x: 8, y: 8, width: 128, height: 152, labelX: 16, labelY: 22 },
  { id: 'as-2', x: 144, y: 8, width: 128, height: 152, labelX: 152, labelY: 22 },
]

// 연결 셋은 늘 보인다. 경로 정보는 두 라우터 사이를 양쪽으로 오가므로, 고른 시나리오의 화살표를 연결 양옆에 한 쌍씩 그린다.
const paths: Record<string, string> = {
  'link-1-2': 'M72 64 V112',
  'link-2-3': 'M112 128 H168',
  'link-3-4': 'M208 112 V64',
  'igp-1-2': 'M64 64 V112',
  'igp-2-1': 'M80 112 V64',
  'igp-3-4': 'M200 112 V64',
  'igp-4-3': 'M216 64 V112',
  'egp-2-3': 'M112 122 H168',
  'egp-3-2': 'M168 134 H112',
}

const linkIds = ['link-1-2', 'link-2-3', 'link-3-4']

// AS 안의 곁말은 그 AS 상자의 아래쪽에, AS 사이의 곁말은 두 상자 밖 아래에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'igp-as-1', x: 72, y: 156, anchor: 'middle', scenarios: ['igp'] },
  { id: 'igp-as-2', x: 208, y: 156, anchor: 'middle', scenarios: ['igp'] },
  { id: 'egp', x: 140, y: 178, anchor: 'middle', scenarios: ['egp'] },
]

// 가로형은 왼쪽에서 오른쪽으로 라우터 1·라우터 2(AS 1)와 라우터 3·라우터 4(AS 2)를 한 줄에 둔다.
const wideNodes = [
  { id: 'router-1', x: 20, y: 36, width: 72 },
  { id: 'router-2', x: 124, y: 36, width: 72 },
  { id: 'router-3', x: 244, y: 36, width: 72 },
  { id: 'router-4', x: 348, y: 36, width: 72 },
]

const wideGroups = [
  { id: 'as-1', x: 8, y: 8, width: 200, height: 96, labelX: 16, labelY: 22 },
  { id: 'as-2', x: 232, y: 8, width: 200, height: 96, labelX: 240, labelY: 22 },
]

const widePaths: Record<string, string> = {
  'link-1-2': 'M92 52 H124',
  'link-2-3': 'M196 52 H244',
  'link-3-4': 'M316 52 H348',
  'igp-1-2': 'M92 46 H124',
  'igp-2-1': 'M124 58 H92',
  'igp-3-4': 'M316 46 H348',
  'igp-4-3': 'M348 58 H316',
  'egp-2-3': 'M196 46 H244',
  'egp-3-2': 'M244 58 H196',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'igp-as-1', x: 108, y: 92, anchor: 'middle' },
  { id: 'igp-as-2', x: 332, y: 92, anchor: 'middle' },
  { id: 'egp', x: 220, y: 120, anchor: 'middle' },
]

// nodes에는 선명하게 둘 노드와 연결을 함께 적는다. 「AS 안」은 네 라우터와 AS 안의 연결 둘, 「AS 사이」는 맞닿은 두 라우터와 그 연결이다.
export const autonomousSystemsScenarios: DiagramScenario[] = [
  { id: 'igp', nodes: ['router-1', 'router-2', 'router-3', 'router-4', 'link-1-2', 'link-3-4'], paths: ['igp-1-2', 'igp-2-1', 'igp-3-4', 'igp-4-3'] },
  { id: 'egp', nodes: ['router-2', 'router-3', 'link-2-3'], paths: ['egp-2-3', 'egp-3-2'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function AutonomousSystemsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-autonomous-systems-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={autonomousSystemsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 128' : '0 0 280 184'}>
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
