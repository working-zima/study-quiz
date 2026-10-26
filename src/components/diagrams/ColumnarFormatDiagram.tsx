import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['emr-glue-athena'].diagrams.columnar

// 같은 표를 행 기준과 열 기준으로 담은 두 박스를 나란히 둔다. 그룹 경계는 시나리오와 무관하게 남긴다.
// 두 박스 사이(x 136~144)는 쿼리 화살표가 내려가는 통로다.
const groups = [
  { id: 'row-based', x: 4, y: 56, width: 132, height: 144 },
  { id: 'columnar', x: 144, y: 56, width: 132, height: 144 },
]

// 쿼리는 두 박스 위 밖에 둔다.
const nodes = [
  { id: 'query', x: 82, y: 8, width: 116, color: 'stroke-disabled' },
  { id: 'row-1', x: 12, y: 80, width: 116, color: 'stroke-diagram-managed' },
  { id: 'row-2', x: 12, y: 120, width: 116, color: 'stroke-diagram-managed' },
  { id: 'row-3', x: 12, y: 160, width: 116, color: 'stroke-diagram-managed' },
  { id: 'col-a', x: 152, y: 80, width: 116, color: 'stroke-diagram-managed' },
  { id: 'col-b', x: 152, y: 120, width: 116, color: 'stroke-diagram-managed' },
  { id: 'col-c', x: 152, y: 160, width: 116, color: 'stroke-diagram-managed' },
]

// 행 기준 장면에는 화살표가 없다. 본문은 행 기준에서 무엇을 읽는지 말하지 않는다(ADR-037 phase 62).
const paths: Record<string, string> = {
  'query-col-b': 'M140 40 V136 H152',
}

const notes = [
  { id: 'scattered', x: 70, y: 216, textAnchor: 'middle' as const, scenarios: ['row-based'] },
  { id: 'only-b', x: 210, y: 216, textAnchor: 'middle' as const, scenarios: ['columnar'] },
]

// 가로형은 쿼리 → 열 기준 → 행 기준을 왼쪽에서 오른쪽으로 둔다. 쿼리에서 열 B의 값으로 가는 화살표가 곧게 간다.
const wideGroups = [
  { id: 'columnar', x: 136, y: 8, width: 144, height: 144 },
  { id: 'row-based', x: 292, y: 8, width: 144, height: 144 },
]

// 라벨과 색은 세로형 nodes에서 id로 가져온다.
const wideNodes = [
  { id: 'query', x: 8, y: 72, width: 112 },
  { id: 'col-a', x: 144, y: 32, width: 128 },
  { id: 'col-b', x: 144, y: 72, width: 128 },
  { id: 'col-c', x: 144, y: 112, width: 128 },
  { id: 'row-1', x: 300, y: 32, width: 128 },
  { id: 'row-2', x: 300, y: 72, width: 128 },
  { id: 'row-3', x: 300, y: 112, width: 128 },
]

const widePaths: Record<string, string> = {
  'query-col-b': 'M120 88 H144',
}

// 곁말은 자리가 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'scattered', x: 364, y: 168, textAnchor: 'middle' as const },
  { id: 'only-b', x: 208, y: 168, textAnchor: 'middle' as const },
]

export const columnarScenarios: DiagramScenario[] = [
  { id: 'row-based', nodes: ['query', 'row-1', 'row-2', 'row-3'], paths: [] },
  { id: 'columnar', nodes: ['query', 'col-b'], paths: ['query-col-b'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ColumnarFormatDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-columnar-arrow`
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes.map((node) => ({ ...nodes.find(({ id }) => id === node.id)!, ...node })) : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={columnarScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 176' : '0 0 280 224'}>
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
              <rect className={`fill-panel ${node.color}`} x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
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
