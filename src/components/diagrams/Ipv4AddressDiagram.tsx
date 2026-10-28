import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ip-protocol'].diagrams['ipv4-address']

// 세로형은 위쪽 그룹 박스 안에 32비트를 8비트씩 끊은 네 칸을 빈틈없이 이어 붙이고, 칸마다 바로 아래에 그 값을 십진수로 바꾼 수를 둔다.
// 십진수 사이에는 점을 곁말로 두고, 맨 아래에 네 수를 점으로 이어 적은 주소를 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'bits-1', x: 12, y: 40, width: 64 },
  { id: 'bits-2', x: 76, y: 40, width: 64 },
  { id: 'bits-3', x: 140, y: 40, width: 64 },
  { id: 'bits-4', x: 204, y: 40, width: 64 },
  { id: 'dec-1', x: 20, y: 112, width: 48 },
  { id: 'dec-2', x: 84, y: 112, width: 48 },
  { id: 'dec-3', x: 148, y: 112, width: 48 },
  { id: 'dec-4', x: 212, y: 112, width: 48 },
  { id: 'address', x: 84, y: 164, width: 112 },
]

const groups = [
  { id: 'bits', x: 4, y: 4, width: 272, height: 76 },
]

// 화살표는 칸 아래 변에서 바로 아래 십진수 위 변으로 간다. 십진수 단계에서만 보인다.
const paths: Record<string, string> = {
  'conv-1': 'M44 72 V112',
  'conv-2': 'M108 72 V112',
  'conv-3': 'M172 72 V112',
  'conv-4': 'M236 72 V112',
}

// 「8비트」는 자기 칸 바로 위에, 점은 십진수 사이에 늘 보인다. 「8비트」는 자기 칸의 흐림을, 점은 이어 적은 주소의 흐림을 따른다.
const notes = [
  { id: 'octet-1', owner: 'bits-1', x: 44, y: 34 },
  { id: 'octet-2', owner: 'bits-2', x: 108, y: 34 },
  { id: 'octet-3', owner: 'bits-3', x: 172, y: 34 },
  { id: 'octet-4', owner: 'bits-4', x: 236, y: 34 },
  { id: 'dot-1', owner: 'address', x: 76, y: 132 },
  { id: 'dot-2', owner: 'address', x: 140, y: 132 },
  { id: 'dot-3', owner: 'address', x: 204, y: 132 },
]

// 가로형은 같은 짜임에서 칸과 수를 넓힌다.
const wideNodes = [
  { id: 'bits-1', x: 28, y: 40, width: 96 },
  { id: 'bits-2', x: 124, y: 40, width: 96 },
  { id: 'bits-3', x: 220, y: 40, width: 96 },
  { id: 'bits-4', x: 316, y: 40, width: 96 },
  { id: 'dec-1', x: 44, y: 112, width: 64 },
  { id: 'dec-2', x: 140, y: 112, width: 64 },
  { id: 'dec-3', x: 236, y: 112, width: 64 },
  { id: 'dec-4', x: 332, y: 112, width: 64 },
  { id: 'address', x: 164, y: 164, width: 112 },
]

const wideGroups = [
  { id: 'bits', x: 4, y: 4, width: 432, height: 76 },
]

const widePaths: Record<string, string> = {
  'conv-1': 'M76 72 V112',
  'conv-2': 'M172 72 V112',
  'conv-3': 'M268 72 V112',
  'conv-4': 'M364 72 V112',
}

const wideNotes = [
  { id: 'octet-1', x: 76, y: 34 },
  { id: 'octet-2', x: 172, y: 34 },
  { id: 'octet-3', x: 268, y: 34 },
  { id: 'octet-4', x: 364, y: 34 },
  { id: 'dot-1', x: 124, y: 132 },
  { id: 'dot-2', x: 220, y: 132 },
  { id: 'dot-3', x: 316, y: 132 },
]

// 8비트씩: 네 칸만 선명하다. 십진수: 네 수와 이어 적은 주소가 선명하고, 칸에서 수로 가는 화살표가 보인다.
export const ipv4AddressScenarios: DiagramScenario[] = [
  { id: 'bits', nodes: ['bits-1', 'bits-2', 'bits-3', 'bits-4'], paths: [] },
  { id: 'decimal', nodes: ['dec-1', 'dec-2', 'dec-3', 'dec-4', 'address'], paths: ['conv-1', 'conv-2', 'conv-3', 'conv-4'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function Ipv4AddressDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-ipv4-address-arrow`
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
      scenarios={ipv4AddressScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 204' : '0 0 280 204'}>
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
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {layoutNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9" opacity={opacityOf(note.owner)}>
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
