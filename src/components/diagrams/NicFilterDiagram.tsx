import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ethernet'].diagrams['nic-filter']

// 내 컴퓨터 박스 안에 NIC를 아래에, 위 계층을 위에 두고, 케이블은 박스 밖 맨 아래에 둔다.
const groups = [
  { id: 'computer', x: 4, y: 8, width: 272, height: 128 },
]

// 세 노드는 한 열에 선다. 오른쪽 빈자리에 곁말을 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'upper', x: 48, y: 32, width: 112 },
  { id: 'nic', x: 48, y: 96, width: 112 },
  { id: 'cable', x: 48, y: 176, width: 112 },
]

// 연결선 둘은 늘 보인다. 화살표는 그 위에 겹쳐 그리고, 프레임이 케이블에서 NIC로, NIC에서 위 계층으로 올라간다.
const paths: Record<string, string> = {
  'cable-nic': 'M104 176 V128',
  'nic-upper': 'M104 96 V64',
  'arrive': 'M104 176 V128',
  'deliver': 'M104 96 V64',
}

const linkIds = ['cable-nic', 'nic-upper']

// 목적지 곁말은 들어오는 화살표 오른쪽에, 버림 곁말은 NIC 오른쪽에 둔다. 시나리오마다 보이는 곁말이 다르다.
const notes = [
  { id: 'dest-mine', x: 112, y: 156, textAnchor: 'start' as const, scenarios: ['mine'] },
  { id: 'dest-other', x: 112, y: 156, textAnchor: 'start' as const, scenarios: ['other'] },
  { id: 'dest-broadcast', x: 112, y: 156, textAnchor: 'start' as const, scenarios: ['broadcast'] },
  { id: 'discard', x: 168, y: 115, textAnchor: 'start' as const, scenarios: ['other'] },
]

// 가로형은 케이블을 왼쪽 박스 밖에 두고, 내 컴퓨터 박스 안에 NIC와 위 계층을 왼쪽에서 오른쪽으로 둔다.
const wideGroups = [
  { id: 'computer', x: 168, y: 8, width: 264, height: 92 },
]

const wideNodes = [
  { id: 'upper', x: 320, y: 40, width: 96 },
  { id: 'nic', x: 184, y: 40, width: 96 },
  { id: 'cable', x: 8, y: 40, width: 96 },
]

const widePaths: Record<string, string> = {
  'cable-nic': 'M104 56 H184',
  'nic-upper': 'M280 56 H320',
  'arrive': 'M104 56 H184',
  'deliver': 'M280 56 H320',
}

// 곁말은 자리와 정렬이 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
// 목적지 곁말은 케이블 아래에, 버림 곁말은 NIC 아래 가운데에 둔다.
const wideNotes = [
  { id: 'dest-mine', x: 8, y: 92, textAnchor: 'start' as const },
  { id: 'dest-other', x: 8, y: 92, textAnchor: 'start' as const },
  { id: 'dest-broadcast', x: 8, y: 92, textAnchor: 'start' as const },
  { id: 'discard', x: 232, y: 88, textAnchor: 'middle' as const },
]

// nodes에는 선명하게 둘 노드와 연결선을 함께 적는다.
export const nicFilterScenarios: DiagramScenario[] = [
  { id: 'mine', nodes: ['cable', 'nic', 'upper', 'cable-nic', 'nic-upper'], paths: ['arrive', 'deliver'] },
  { id: 'other', nodes: ['cable', 'nic', 'cable-nic'], paths: ['arrive'] },
  { id: 'broadcast', nodes: ['cable', 'nic', 'upper', 'cable-nic', 'nic-upper'], paths: ['arrive', 'deliver'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function NicFilterDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-nic-filter-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={nicFilterScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 108' : '0 0 280 216'}>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.textAnchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
