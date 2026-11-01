import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-data-movement'].diagrams['data-box']

// 세로형은 온-프레미스 데이터, 장치, 스토리지 계정을 위에서 아래로 쌓는다. 가져오는 선은 x 120, 내보내는 선은 x 160으로 어긋나게 둔다.
const nodes = [
  { id: 'local-data', x: 70, y: 8, width: 140 },
  { id: 'box', x: 70, y: 96, width: 140 },
  { id: 'azure-storage', x: 70, y: 184, width: 140 },
]
const paths: Record<string, string> = {
  'copy-in': 'M120 40 V96',
  'ship-in': 'M120 128 V184',
  'ship-out': 'M160 184 V128',
  'copy-out': 'M160 96 V40',
}
const notes = [
  { id: 'copy-in-note', x: 128, y: 72, textAnchor: 'start' as const, scenario: 'import' },
  { id: 'ship-in-note', x: 128, y: 160, textAnchor: 'start' as const, scenario: 'import' },
  { id: 'ship-out-note', x: 168, y: 160, textAnchor: 'start' as const, scenario: 'export' },
  { id: 'copy-out-note', x: 168, y: 72, textAnchor: 'start' as const, scenario: 'export' },
]

// 가로형은 왼쪽에서 오른쪽으로 둔다. 곁말은 노드 사이에 들어가지 않아 그 구간의 위 줄에 두고, 가져오는 선은 y 46, 내보내는 선은 y 58로 어긋나게 둔다.
const wideNodes = [
  { id: 'local-data', x: 12, y: 36, width: 120 },
  { id: 'box', x: 168, y: 36, width: 116 },
  { id: 'azure-storage', x: 324, y: 36, width: 100 },
]
const widePaths: Record<string, string> = {
  'copy-in': 'M132 46 H168',
  'ship-in': 'M284 46 H324',
  'ship-out': 'M324 58 H284',
  'copy-out': 'M168 58 H132',
}
const wideNotes = [
  { id: 'copy-in-note', x: 150, y: 26, textAnchor: 'middle' as const, scenario: 'import' },
  { id: 'ship-in-note', x: 304, y: 26, textAnchor: 'middle' as const, scenario: 'import' },
  { id: 'ship-out-note', x: 304, y: 26, textAnchor: 'middle' as const, scenario: 'export' },
  { id: 'copy-out-note', x: 150, y: 26, textAnchor: 'middle' as const, scenario: 'export' },
]

export const dataBoxScenarios: DiagramScenario[] = [
  { id: 'import', nodes: ['local-data', 'box', 'azure-storage'], paths: ['copy-in', 'ship-in'] },
  { id: 'export', nodes: ['local-data', 'box', 'azure-storage'], paths: ['ship-out', 'copy-out'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function DataBoxDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-data-box-arrow`
  const wide = useWideDiagram()
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
      scenarios={dataBoxScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 76' : '0 0 280 224'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

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
