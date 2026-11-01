import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-storage'].diagrams['file-share']

// 세로형은 온-프레미스를 위에, Azure를 아래에 쌓는다. 스토리지 계정은 Azure 안의 그룹이고 VM 1은 그 아래에 둔다.
const groups = [
  { id: 'on-premises', x: 8, y: 8, width: 264, height: 68 },
  { id: 'azure', x: 8, y: 96, width: 264, height: 160 },
  { id: 'account', x: 20, y: 124, width: 240, height: 76 },
]
const nodes = [
  { id: 'pc-1', x: 28, y: 32, width: 92 },
  { id: 'pc-2', x: 160, y: 32, width: 92 },
  { id: 'share', x: 90, y: 148, width: 100 },
  { id: 'vm-1', x: 60, y: 212, width: 84 },
]
// 경로는 그룹 라벨 자리(x 98까지)보다 오른쪽을 지나 파일 공유의 위아래 변에 닿는다.
const paths: Record<string, string> = {
  'mount-1': 'M100 64 V148',
  'mount-2': 'M180 64 V148',
  'mount-vm': 'M120 212 V180',
}
const notes = [
  { id: 'share-note', x: 140, y: 194, textAnchor: 'middle' as const, scenario: 'office' },
  { id: 'pc-note', x: 108, y: 90, textAnchor: 'start' as const, scenario: 'hybrid' },
  { id: 'vm-note', x: 150, y: 232, textAnchor: 'start' as const, scenario: 'hybrid' },
]

// 가로형은 온-프레미스를 왼쪽에, Azure를 오른쪽에 둔다. VM 1은 스토리지 계정 오른쪽에서 파일 공유로 간다.
const wideGroups = [
  { id: 'on-premises', x: 8, y: 8, width: 128, height: 116 },
  { id: 'azure', x: 160, y: 8, width: 272, height: 116 },
  { id: 'account', x: 172, y: 30, width: 156, height: 80 },
]
const wideNodes = [
  { id: 'pc-1', x: 20, y: 32, width: 100 },
  { id: 'pc-2', x: 20, y: 80, width: 100 },
  { id: 'share', x: 184, y: 56, width: 90 },
  { id: 'vm-1', x: 344, y: 56, width: 76 },
]
const widePaths: Record<string, string> = {
  'mount-1': 'M120 60 H184',
  'mount-2': 'M120 84 H184',
  'mount-vm': 'M344 72 H274',
}
const wideNotes = [
  { id: 'share-note', x: 229, y: 102, textAnchor: 'middle' as const, scenario: 'office' },
  { id: 'pc-note', x: 20, y: 75, textAnchor: 'start' as const, scenario: 'hybrid' },
  { id: 'vm-note', x: 382, y: 102, textAnchor: 'middle' as const, scenario: 'hybrid' },
]

export const fileShareScenarios: DiagramScenario[] = [
  { id: 'office', nodes: ['pc-1', 'pc-2', 'share'], paths: ['mount-1', 'mount-2'] },
  { id: 'hybrid', nodes: ['pc-1', 'vm-1', 'share'], paths: ['mount-1', 'mount-vm'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function FileShareDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-file-share-arrow`
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
      scenarios={fileShareScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 132' : '0 0 280 264'}>
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
