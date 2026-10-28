import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId.ethernet.diagrams['ethertype-length']

// 필드가 가질 수 있는 수를 작은 값부터 세 칸으로 나눠 위에서 아래로 빈틈없이 쌓는다. 칸 크기는 범위에 비례하지 않는다.
// 길이로 읽는 예시 값은 띠 위에, 이더타입으로 읽는 예시 값 둘은 띠 아래에 두어 자기가 드는 칸으로 곧게 들어가게 한다.
const nodes = [
  { id: 'length-range', x: 16, y: 64, width: 104 },
  { id: 'gap', x: 16, y: 96, width: 104 },
  { id: 'type-range', x: 16, y: 128, width: 104 },
  { id: 'value-0064', x: 40, y: 8, width: 56 },
  { id: 'value-0800', x: 16, y: 184, width: 56 },
  { id: 'value-0806', x: 88, y: 184, width: 56 },
]

// 화살표는 예시 값에서 그 값이 드는 칸으로 간다.
const paths: Record<string, string> = {
  'to-length': 'M68 40 V64',
  'to-type-0800': 'M44 184 V160',
  'to-type-0806': 'M116 184 V160',
}

// 칸의 곁말은 칸 오른쪽에, 예시 값의 곁말은 값 옆이나 아래에 둔다. 곁말 id는 자기 노드 id와 같고 그 노드의 흐림을 따른다.
const notes = [
  { id: 'length-range', x: 128, y: 84, textAnchor: 'start' as const },
  { id: 'gap', x: 128, y: 116, textAnchor: 'start' as const },
  { id: 'type-range', x: 128, y: 148, textAnchor: 'start' as const },
  { id: 'value-0064', x: 104, y: 28, textAnchor: 'start' as const },
  { id: 'value-0800', x: 44, y: 230, textAnchor: 'middle' as const },
  { id: 'value-0806', x: 116, y: 230, textAnchor: 'middle' as const },
]

// 가로형은 세 칸을 왼쪽에서 오른쪽으로 잇고, 예시 값 셋을 띠 위에 두어 아래로 들어가게 한다.
const wideNodes = [
  { id: 'length-range', x: 8, y: 80, width: 140 },
  { id: 'gap', x: 148, y: 80, width: 144 },
  { id: 'type-range', x: 292, y: 80, width: 140 },
  { id: 'value-0064', x: 50, y: 24, width: 56 },
  { id: 'value-0800', x: 300, y: 24, width: 56 },
  { id: 'value-0806', x: 372, y: 24, width: 56 },
]

const widePaths: Record<string, string> = {
  'to-length': 'M78 56 V80',
  'to-type-0800': 'M328 56 V80',
  'to-type-0806': 'M400 56 V80',
}

// 칸의 곁말은 칸 아래 가운데에, 예시 값의 곁말은 값 위 가운데에 둔다.
const wideNotes = [
  { id: 'length-range', x: 78, y: 128, textAnchor: 'middle' as const },
  { id: 'gap', x: 220, y: 128, textAnchor: 'middle' as const },
  { id: 'type-range', x: 362, y: 128, textAnchor: 'middle' as const },
  { id: 'value-0064', x: 78, y: 16, textAnchor: 'middle' as const },
  { id: 'value-0800', x: 328, y: 16, textAnchor: 'middle' as const },
  { id: 'value-0806', x: 400, y: 16, textAnchor: 'middle' as const },
]

const bandIds = ['length-range', 'gap', 'type-range']

export const etherTypeLengthScenarios: DiagramScenario[] = [
  { id: 'ipv4', nodes: ['value-0800', 'type-range'], paths: ['to-type-0800'] },
  { id: 'arp', nodes: ['value-0806', 'type-range'], paths: ['to-type-0806'] },
  { id: 'length', nodes: ['value-0064', 'length-range'], paths: ['to-length'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function EtherTypeLengthDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-ethertype-length-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={etherTypeLengthScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 136' : '0 0 280 240'}>
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
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx={bandIds.includes(node.id) ? '0' : '4'} strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {layoutNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.textAnchor} className="fill-muted" fontSize="9" opacity={opacityOf(note.id)}>
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
