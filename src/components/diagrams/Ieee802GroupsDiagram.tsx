import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-topology'].diagrams['ieee802-groups']

// 세로형은 위 「활동 중인 작업 그룹」 박스에 802.1·802.3·802.11·802.15를, 아래 「해산한 작업 그룹」 박스에 802.2·802.4·802.5를
// 위에서부터 쌓고, 같은 줄 오른쪽 박스 밖에 그 작업 그룹이 맡은 기술을 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'g1', x: 24, y: 32, width: 88 },
  { id: 'g3', x: 24, y: 76, width: 88 },
  { id: 'g11', x: 24, y: 120, width: 88 },
  { id: 'g15', x: 24, y: 164, width: 88 },
  { id: 'g2', x: 24, y: 248, width: 88 },
  { id: 'g4', x: 24, y: 292, width: 88 },
  { id: 'g5', x: 24, y: 336, width: 88 },
  { id: 't1', x: 152, y: 32, width: 120 },
  { id: 't3', x: 152, y: 76, width: 120 },
  { id: 't11', x: 152, y: 120, width: 120 },
  { id: 't15', x: 152, y: 164, width: 120 },
  { id: 't2', x: 152, y: 248, width: 120 },
  { id: 't4', x: 152, y: 292, width: 120 },
  { id: 't5', x: 152, y: 336, width: 120 },
]

const groups = [
  { id: 'active', x: 8, y: 8, width: 120, height: 200, labelX: 16, labelY: 21 },
  { id: 'disbanded', x: 8, y: 224, width: 120, height: 152, labelX: 16, labelY: 237 },
]

// 연결선 일곱은 늘 보이고, 번호에서 그 작업 그룹이 맡은 기술로 가는 가는 회색 화살표다.
const paths: Record<string, string> = {
  'g1-t1': 'M112 48 H152',
  'g3-t3': 'M112 92 H152',
  'g11-t11': 'M112 136 H152',
  'g15-t15': 'M112 180 H152',
  'g2-t2': 'M112 264 H152',
  'g4-t4': 'M112 308 H152',
  'g5-t5': 'M112 352 H152',
}

const linkIds = ['g1-t1', 'g3-t3', 'g11-t11', 'g15-t15', 'g2-t2', 'g4-t4', 'g5-t5']

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다.
const noteScenarios: Record<string, string> = {
  'active-note': 'active',
  'disbanded-note': 'disbanded',
}

const notes: Note[] = [
  { id: 'active-note', x: 140, y: 396, anchor: 'middle' },
  { id: 'disbanded-note', x: 140, y: 396, anchor: 'middle' },
]

// 가로형은 왼쪽에 활동 중인 작업 그룹 박스와 그 기술을, 오른쪽에 해산한 작업 그룹 박스와 그 기술을 나란히 둔다.
const wideNodes = [
  { id: 'g1', x: 24, y: 32, width: 80 },
  { id: 'g3', x: 24, y: 76, width: 80 },
  { id: 'g11', x: 24, y: 120, width: 80 },
  { id: 'g15', x: 24, y: 164, width: 80 },
  { id: 'g2', x: 248, y: 32, width: 80 },
  { id: 'g4', x: 248, y: 76, width: 80 },
  { id: 'g5', x: 248, y: 120, width: 80 },
  { id: 't1', x: 136, y: 32, width: 88 },
  { id: 't3', x: 136, y: 76, width: 88 },
  { id: 't11', x: 136, y: 120, width: 88 },
  { id: 't15', x: 136, y: 164, width: 88 },
  { id: 't2', x: 352, y: 32, width: 80 },
  { id: 't4', x: 352, y: 76, width: 80 },
  { id: 't5', x: 352, y: 120, width: 80 },
]

const wideGroups = [
  { id: 'active', x: 8, y: 8, width: 112, height: 196, labelX: 16, labelY: 21 },
  { id: 'disbanded', x: 232, y: 8, width: 112, height: 152, labelX: 240, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'g1-t1': 'M104 48 H136',
  'g3-t3': 'M104 92 H136',
  'g11-t11': 'M104 136 H136',
  'g15-t15': 'M104 180 H136',
  'g2-t2': 'M328 48 H352',
  'g4-t4': 'M328 92 H352',
  'g5-t5': 'M328 136 H352',
}

const wideNotes: Note[] = [
  { id: 'active-note', x: 116, y: 220, anchor: 'middle' },
  { id: 'disbanded-note', x: 332, y: 220, anchor: 'middle' },
]

// 활동 중: 지금도 활동하는 작업 그룹 넷과 그 기술, 그 사이의 연결선이 선명하다.
// 해산: 해산한 작업 그룹 셋과 그 기술, 그 사이의 연결선이 선명하다. paths는 그 장면에서 선명하게 남는 연결선이다.
export const ieee802GroupsScenarios: DiagramScenario[] = [
  {
    id: 'active',
    nodes: ['g1', 'g3', 'g11', 'g15', 't1', 't3', 't11', 't15'],
    paths: ['g1-t1', 'g3-t3', 'g11-t11', 'g15-t15'],
  },
  {
    id: 'disbanded',
    nodes: ['g2', 'g4', 'g5', 't2', 't4', 't5'],
    paths: ['g2-t2', 'g4-t4', 'g5-t5'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function Ieee802GroupsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-ieee802-groups-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const linkOpacityOf = (id: string) => (active && !active.paths.includes(id) ? 0.25 : undefined)
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
      scenarios={ieee802GroupsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 232' : '0 0 280 408'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-muted" d="M0 0 L6 3 L0 6 Z" />
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
            <path
              key={id}
              data-link={id}
              d={layoutPaths[id]}
              className="fill-none stroke-muted"
              strokeWidth="1.5"
              opacity={linkOpacityOf(id)}
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
