import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['iam-permissions'].diagrams.abac

// 맨 위에 요청하는 역할, 가운데에 정책 둘, 맨 아래에 키 셋을 나란히 둔다. 감쌀 경계가 없어 그룹 박스는 없다.
const nodes = [
  { id: 'principal', x: 82, y: 8, width: 116, color: 'stroke-disabled' },
  { id: 'tag-policy', x: 12, y: 80, width: 124, color: 'stroke-diagram-managed' },
  { id: 'list-policy', x: 144, y: 80, width: 124, color: 'stroke-diagram-managed' },
  { id: 'key-1', x: 10, y: 160, width: 80, color: 'stroke-diagram-managed' },
  { id: 'key-2', x: 100, y: 160, width: 80, color: 'stroke-diagram-managed' },
  { id: 'key-new', x: 190, y: 160, width: 80, color: 'stroke-diagram-managed' },
]

// 정책에서 키로 가는 경로는 정책 줄 아래 통로(y 128·136)를 지나 키의 위 변으로 들어간다.
const paths: Record<string, string> = {
  'principal-tag': 'M120 40 V60 H74 V80',
  'principal-list': 'M160 40 V60 H206 V80',
  'tag-key-1': 'M50 112 V160',
  'tag-key-new': 'M120 112 V136 H230 V160',
  'list-key-1': 'M170 112 V128 H60 V160',
}

const notes = [
  { id: 'mismatch', x: 140, y: 208, textAnchor: 'middle' as const, scenarios: ['tag-compare'] },
  { id: 'auto', x: 230, y: 208, textAnchor: 'middle' as const, scenarios: ['new-key'] },
  { id: 'manual', x: 230, y: 208, textAnchor: 'middle' as const, scenarios: ['name-list'] },
]

// 가로형은 왼쪽에 역할, 가운데에 정책 둘을 위아래로, 오른쪽에 키 셋을 세로로 둔다.
// 라벨과 색은 세로형 nodes에서 id로 가져온다.
const wideNodes = [
  { id: 'principal', x: 8, y: 72, width: 96 },
  { id: 'tag-policy', x: 136, y: 32, width: 124 },
  { id: 'list-policy', x: 136, y: 112, width: 124 },
  { id: 'key-1', x: 320, y: 8, width: 96 },
  { id: 'key-2', x: 320, y: 72, width: 96 },
  { id: 'key-new', x: 320, y: 136, width: 96 },
]

// 키로 가는 경로는 정책과 키 사이 통로(x 280·288·296)를 지나 키의 왼쪽 변으로 들어간다.
const widePaths: Record<string, string> = {
  'principal-tag': 'M104 80 H120 V48 H136',
  'principal-list': 'M104 96 H120 V128 H136',
  'tag-key-1': 'M260 48 H288 V24 H320',
  'tag-key-new': 'M260 56 H280 V152 H320',
  'list-key-1': 'M260 120 H296 V32 H320',
}

// 곁말은 자리가 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'mismatch', x: 368, y: 120, textAnchor: 'middle' as const },
  { id: 'auto', x: 368, y: 184, textAnchor: 'middle' as const },
  { id: 'manual', x: 368, y: 184, textAnchor: 'middle' as const },
]

export const abacTagScenarios: DiagramScenario[] = [
  { id: 'tag-compare', nodes: ['principal', 'tag-policy', 'key-1', 'key-2'], paths: ['principal-tag', 'tag-key-1'] },
  { id: 'new-key', nodes: ['principal', 'tag-policy', 'key-1', 'key-new'], paths: ['principal-tag', 'tag-key-1', 'tag-key-new'] },
  { id: 'name-list', nodes: ['principal', 'list-policy', 'key-1', 'key-new'], paths: ['principal-list', 'list-key-1'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function AbacTagDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-abac-arrow`
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes.map((node) => ({ ...nodes.find(({ id }) => id === node.id)!, ...node })) : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={abacTagScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 192' : '0 0 280 216'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

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
