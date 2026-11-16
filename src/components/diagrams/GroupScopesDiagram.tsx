import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-ad'].diagrams['group-scopes']

// 세로형은 위 박스에 도메인 example.com, 아래 박스에 자식 도메인 sales.example.com을 둔다. 그룹 셋은 모두 example.com에 있어
// 가운데 열에 위에서부터 도메인 로컬·글로벌·유니버설 차례로 쌓고, 왼쪽 열에 계정, 오른쪽 열에 공유 폴더를 둔다.
// sales.example.com의 계정에서 올라가는 선은 그룹 라벨을 피해 왼쪽 가장자리의 통로(x 8)로 지나고,
// 글로벌 그룹에서 sales.example.com의 공유 폴더로 가는 선은 그룹 열과 공유 폴더 열 사이의 통로(x 198)로 내려간다.
const nodes = [
  { id: 'com-account', x: 12, y: 64, width: 48 },
  { id: 'domain-local', x: 76, y: 24, width: 114 },
  { id: 'global', x: 76, y: 64, width: 114 },
  { id: 'universal', x: 76, y: 104, width: 114 },
  { id: 'com-share', x: 206, y: 64, width: 66 },
  { id: 'sales-account', x: 12, y: 168, width: 48 },
  { id: 'sales-share', x: 206, y: 168, width: 66 },
]

const groups = [
  { id: 'com', x: 4, y: 4, width: 272, height: 140, labelX: 12, labelY: 17 },
  { id: 'sales', x: 4, y: 148, width: 272, height: 72, labelX: 12, labelY: 161 },
]

const paths: Record<string, string> = {
  'dl-from-com': 'M60 72 H68 V48 H76',
  'dl-from-sales': 'M12 184 H8 V32 H76',
  'dl-to-com-share': 'M190 40 H239 V64',
  'global-from-com': 'M60 80 H76',
  'global-to-com-share': 'M190 80 H206',
  'global-to-sales-share': 'M190 88 H198 V184 H206',
  'universal-from-com': 'M36 96 V120 H76',
  'universal-from-sales': 'M12 184 H8 V128 H76',
  'universal-to-com-share': 'M190 112 H239 V96',
  'universal-to-sales-share': 'M190 128 H239 V168',
}

// 곁말은 자기 시나리오에서만, 자기가 말하는 노드 바로 아래에 보인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'domain-local-note', x: 272, y: 212, anchor: 'end', scenarios: ['domain-local'] },
  { id: 'global-note', x: 12, y: 212, anchor: 'start', scenarios: ['global'] },
]

// 가로형은 같은 짜임을 넓게 펼친다. 열 사이가 넓어져 선이 길어질 뿐 통로와 차례는 세로형과 같다.
const wideNodes = [
  { id: 'com-account', x: 24, y: 64, width: 64 },
  { id: 'domain-local', x: 148, y: 24, width: 144 },
  { id: 'global', x: 148, y: 64, width: 144 },
  { id: 'universal', x: 148, y: 104, width: 144 },
  { id: 'com-share', x: 352, y: 64, width: 72 },
  { id: 'sales-account', x: 24, y: 168, width: 64 },
  { id: 'sales-share', x: 352, y: 168, width: 72 },
]

const wideGroups = [
  { id: 'com', x: 4, y: 4, width: 432, height: 140, labelX: 12, labelY: 17 },
  { id: 'sales', x: 4, y: 148, width: 432, height: 72, labelX: 12, labelY: 161 },
]

const widePaths: Record<string, string> = {
  'dl-from-com': 'M88 72 H118 V48 H148',
  'dl-from-sales': 'M24 184 H8 V32 H148',
  'dl-to-com-share': 'M292 40 H388 V64',
  'global-from-com': 'M88 80 H148',
  'global-to-com-share': 'M292 80 H352',
  'global-to-sales-share': 'M292 88 H322 V184 H352',
  'universal-from-com': 'M56 96 V120 H148',
  'universal-from-sales': 'M24 184 H8 V128 H148',
  'universal-to-com-share': 'M292 112 H388 V96',
  'universal-to-sales-share': 'M292 128 H388 V168',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'domain-local-note', x: 424, y: 212, anchor: 'end' },
  { id: 'global-note', x: 24, y: 212, anchor: 'start' },
]

// 도메인 로컬: 두 도메인의 계정을 넣지만 사용 권한은 example.com의 공유 폴더에만. 글로벌: example.com의 계정만 넣고 두 도메인의 공유 폴더에.
// 유니버설: 두 도메인의 계정을 넣고 두 도메인의 공유 폴더에.
export const groupScopesScenarios: DiagramScenario[] = [
  {
    id: 'domain-local',
    nodes: ['com-account', 'domain-local', 'com-share', 'sales-account'],
    paths: ['dl-from-com', 'dl-from-sales', 'dl-to-com-share'],
  },
  {
    id: 'global',
    nodes: ['com-account', 'global', 'com-share', 'sales-share'],
    paths: ['global-from-com', 'global-to-com-share', 'global-to-sales-share'],
  },
  {
    id: 'universal',
    nodes: ['com-account', 'universal', 'com-share', 'sales-account', 'sales-share'],
    paths: ['universal-from-com', 'universal-from-sales', 'universal-to-com-share', 'universal-to-sales-share'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function GroupScopesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-group-scopes-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenarios.includes(active.id))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={groupScopesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 224' : '0 0 280 224'}>
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

          {shownNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
