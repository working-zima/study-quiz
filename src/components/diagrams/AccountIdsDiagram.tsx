import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-accounts'].diagrams['account-ids']

// 세로형은 위 테두리에 사용자 이름과 UID의 짝 둘(root, 그 아래 user1)을, 아래 테두리에 그룹 이름과 GID의 짝 둘(dev, 그 아래 ops)을 둔다.
// 짝마다 이름 칸 바로 오른쪽에 번호 칸이 맞닿는다. user1의 아래 변에서 선 둘이 내려가 dev와 ops의 왼쪽 변에 닿는다.
const nodes = [
  { id: 'root', x: 16, y: 30, width: 72 },
  { id: 'root-uid', x: 88, y: 30, width: 56 },
  { id: 'user1', x: 16, y: 70, width: 72 },
  { id: 'user1-uid', x: 88, y: 70, width: 56 },
  { id: 'dev', x: 96, y: 152, width: 72 },
  { id: 'dev-gid', x: 168, y: 152, width: 56 },
  { id: 'ops', x: 96, y: 196, width: 72 },
  { id: 'ops-gid', x: 168, y: 196, width: 56 },
]

// 아래 테두리의 라벨은 오른쪽 위에 두어, 왼쪽으로 내려가는 선이 지나지 않게 한다.
const groups = [
  { id: 'users', x: 8, y: 8, width: 264, height: 104, labelX: 16, labelY: 22 },
  { id: 'groups', x: 8, y: 128, width: 264, height: 108, labelX: 152, labelY: 142 },
]

const paths: Record<string, string> = {
  'primary-path': 'M56 102 V168 H96',
  'secondary-path': 'M32 102 V212 H96',
}

// 곁말은 선의 꺾인 자리 옆에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'primary', x: 62, y: 162, anchor: 'start', scenarios: ['groups'] },
  { id: 'secondary', x: 40, y: 206, anchor: 'start', scenarios: ['groups'] },
]

// 가로형은 위 테두리 한 줄에 root와 user1의 짝을, 아래 테두리 한 줄에 dev와 ops의 짝을 둔다.
// user1의 아래 변에서 ops로는 곧게 내려가고, dev로는 두 테두리 사이를 지나 내려간다.
const wideNodes = [
  { id: 'root', x: 16, y: 32, width: 72 },
  { id: 'root-uid', x: 88, y: 32, width: 56 },
  { id: 'user1', x: 232, y: 32, width: 72 },
  { id: 'user1-uid', x: 304, y: 32, width: 56 },
  { id: 'dev', x: 136, y: 128, width: 72 },
  { id: 'dev-gid', x: 208, y: 128, width: 56 },
  { id: 'ops', x: 296, y: 128, width: 72 },
  { id: 'ops-gid', x: 368, y: 128, width: 56 },
]

const wideGroups = [
  { id: 'users', x: 8, y: 8, width: 424, height: 72, labelX: 16, labelY: 22 },
  { id: 'groups', x: 8, y: 104, width: 424, height: 72, labelX: 16, labelY: 118 },
]

const widePaths: Record<string, string> = {
  'primary-path': 'M248 64 V92 H172 V128',
  'secondary-path': 'M300 64 V128',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'primary', x: 180, y: 116, anchor: 'start' },
  { id: 'secondary', x: 308, y: 116, anchor: 'start' },
]

export const accountIdsScenarios: DiagramScenario[] = [
  { id: 'uid', nodes: ['user1', 'user1-uid'], paths: [] },
  { id: 'groups', nodes: ['user1', 'dev', 'dev-gid', 'ops', 'ops-gid'], paths: ['primary-path', 'secondary-path'] },
  { id: 'root', nodes: ['root', 'root-uid'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function AccountIdsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-account-ids-arrow`
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
      scenarios={accountIdsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 184' : '0 0 280 244'}>
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
