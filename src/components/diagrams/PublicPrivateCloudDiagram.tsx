import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-cloud-models'].diagrams['public-private-cloud']

// 데이터 센터 박스 둘을 위아래로 둔다. 박스마다 라벨 아래 줄에 곁말 자리를 두고 그 아래에 하드웨어가 있다.
const groups = [
  { id: 'provider', x: 6, y: 4, width: 268, height: 76 },
  { id: 'dedicated', x: 6, y: 160, width: 268, height: 76 },
]

// 하드웨어를 쓰는 회사는 데이터 센터 박스 아래 줄에 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'provider-hardware', x: 16, y: 40, width: 248 },
  { id: 'company-a', x: 16, y: 96, width: 72 },
  { id: 'company-b', x: 104, y: 96, width: 72 },
  { id: 'company-c', x: 192, y: 96, width: 72 },
  { id: 'dedicated-hardware', x: 16, y: 196, width: 248 },
  { id: 'company-d', x: 104, y: 252, width: 72 },
]

// 회사의 위 변에서 곧게 올라가 하드웨어의 아래 변으로 들어간다. 박스 아래쪽으로 들어가므로 그룹 라벨과 만나지 않는다.
const paths: Record<string, string> = {
  'a-to-provider': 'M52 96 V72',
  'b-to-provider': 'M140 96 V72',
  'c-to-provider': 'M228 96 V72',
  'd-to-dedicated': 'M140 252 V228',
}

// 누가 갖추고 관리하는지는 그룹 라벨 아래 줄에, 누가 쓰는지는 회사 줄 아래에 둔다.
const notes = [
  { id: 'provider-note', x: 16, y: 32, textAnchor: 'start' as const, scenarios: ['public'] },
  { id: 'shared-note', x: 140, y: 144, textAnchor: 'middle' as const, scenarios: ['public'] },
  { id: 'dedicated-note', x: 16, y: 188, textAnchor: 'start' as const, scenarios: ['private'] },
  { id: 'only-note', x: 140, y: 300, textAnchor: 'middle' as const, scenarios: ['private'] },
]

// 가로형은 두 데이터 센터를 나란히 둔다. 회사 셋이 들어가는 공급자 쪽을 넓게 잡는다.
const wideGroups = [
  { id: 'provider', x: 8, y: 4, width: 264, height: 76 },
  { id: 'dedicated', x: 288, y: 4, width: 144, height: 76 },
]

const wideNodes = [
  { id: 'provider-hardware', x: 18, y: 40, width: 244 },
  { id: 'company-a', x: 18, y: 96, width: 72 },
  { id: 'company-b', x: 104, y: 96, width: 72 },
  { id: 'company-c', x: 190, y: 96, width: 72 },
  { id: 'dedicated-hardware', x: 298, y: 40, width: 124 },
  { id: 'company-d', x: 324, y: 96, width: 72 },
]

const widePaths: Record<string, string> = {
  'a-to-provider': 'M54 96 V72',
  'b-to-provider': 'M140 96 V72',
  'c-to-provider': 'M226 96 V72',
  'd-to-dedicated': 'M360 96 V72',
}

// 곁말은 자리가 배치마다 다르다. 정렬과 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'provider-note', x: 18, y: 32 },
  { id: 'shared-note', x: 140, y: 144 },
  { id: 'dedicated-note', x: 298, y: 32 },
  { id: 'only-note', x: 360, y: 144 },
]

export const publicPrivateCloudScenarios: DiagramScenario[] = [
  {
    id: 'public',
    nodes: ['provider-hardware', 'company-a', 'company-b', 'company-c'],
    paths: ['a-to-provider', 'b-to-provider', 'c-to-provider'],
  },
  { id: 'private', nodes: ['dedicated-hardware', 'company-d'], paths: ['d-to-dedicated'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PublicPrivateCloudDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-public-private-cloud-arrow`
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
      scenarios={publicPrivateCloudScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 152' : '0 0 280 308'}>
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
