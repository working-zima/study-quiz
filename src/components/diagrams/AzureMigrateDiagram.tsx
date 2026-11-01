import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-data-movement'].diagrams['azure-migrate']

// 세로형은 온-프레미스 데이터 센터, 허브, Azure를 위에서 아래로 쌓는다.
// 허브의 그룹 라벨이 박스 왼쪽 위에 있어서, 서버에서 내려오는 선은 두 박스 사이에서 꺾어 라벨 오른쪽(x 110)으로 들어간다.
const groups = [
  { id: 'on-premises', x: 8, y: 8, width: 264, height: 68 },
  { id: 'hub', x: 8, y: 104, width: 264, height: 80 },
]
const nodes = [
  { id: 'servers', x: 20, y: 32, width: 64 },
  { id: 'databases', x: 92, y: 32, width: 96 },
  { id: 'web-apps', x: 196, y: 32, width: 64 },
  { id: 'assess', x: 40, y: 128, width: 88 },
  { id: 'migrate', x: 168, y: 128, width: 88 },
  { id: 'azure', x: 184, y: 200, width: 56 },
]
const paths: Record<string, string> = {
  'assess-flow': 'M52 64 V90 H110 V128',
  'migrate-next': 'M128 144 H168',
  'to-azure': 'M212 160 V200',
}
const notes = [
  { id: 'assess-note', x: 40, y: 174, textAnchor: 'start' as const, scenario: 'assess' },
  { id: 'hub-note', x: 40, y: 174, textAnchor: 'start' as const, scenario: 'migrate' },
]

// 가로형은 왼쪽에서 오른쪽으로 잇는다. 온-프레미스 데이터 센터의 세 노드는 세로로 쌓고, 서버와 두 단계와 Azure를 한 줄(y 48)에 세워 화살표를 곧게 둔다.
const wideGroups = [
  { id: 'on-premises', x: 8, y: 8, width: 132, height: 144 },
  { id: 'hub', x: 152, y: 8, width: 218, height: 84 },
]
const wideNodes = [
  { id: 'servers', x: 20, y: 32, width: 108 },
  { id: 'databases', x: 20, y: 72, width: 108 },
  { id: 'web-apps', x: 20, y: 112, width: 108 },
  { id: 'assess', x: 162, y: 32, width: 88 },
  { id: 'migrate', x: 272, y: 32, width: 88 },
  { id: 'azure', x: 386, y: 32, width: 46 },
]
const widePaths: Record<string, string> = {
  'assess-flow': 'M128 48 H162',
  'migrate-next': 'M250 48 H272',
  'to-azure': 'M360 48 H386',
}
const wideNotes = [
  { id: 'assess-note', x: 162, y: 78, textAnchor: 'start' as const, scenario: 'assess' },
  { id: 'hub-note', x: 162, y: 78, textAnchor: 'start' as const, scenario: 'migrate' },
]

export const azureMigrateScenarios: DiagramScenario[] = [
  { id: 'assess', nodes: ['servers', 'databases', 'web-apps', 'assess'], paths: ['assess-flow'] },
  { id: 'migrate', nodes: ['assess', 'migrate', 'azure'], paths: ['migrate-next', 'to-azure'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function AzureMigrateDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-azure-migrate-arrow`
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes
  const visiblePaths = active ? active.paths : []
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenario === active.id)

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={azureMigrateScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 160' : '0 0 280 240'}>
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
              {text.groups![group.id]}
            </text>
          ))}

          {visiblePaths.map((id) => (
            <path key={id} data-path={id} d={layoutPaths[id]} className="fill-none stroke-title" strokeWidth="1.5" strokeLinejoin="round" markerEnd={`url(#${arrowId})`} />
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
