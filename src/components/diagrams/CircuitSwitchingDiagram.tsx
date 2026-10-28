import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['protocols-encapsulation'].diagrams['circuit-switching']

// 패킷 교환 도식(PacketSwitchingDiagram)과 같은 자리에 장치를 둔다. 두 도식을 견주어 읽게 하려는 것이다.
// 호스트 A와 B가 잡아 둔 회선은 오른쪽 길(첫 네트워크 장비 → 오른쪽 네트워크 장비)이다. 노드는 모두 회색이다.
const nodes = [
  { id: 'host-a', x: 8, y: 16, width: 64 },
  { id: 'equipment-1', x: 100, y: 16, width: 80 },
  { id: 'host-c', x: 208, y: 16, width: 64 },
  { id: 'equipment-3', x: 16, y: 112, width: 80 },
  { id: 'equipment-2', x: 184, y: 112, width: 80 },
  { id: 'host-b', x: 100, y: 192, width: 80 },
]

// 링크 여섯은 늘 보인다. 화살표는 회선이 지나는 링크 위에 겹쳐 그리고, 노드 하나에서 다음 노드까지만 간다.
// 호스트 C에서 회선으로 가는 화살표는 없다 — 끼어들 수 없기 때문이다.
const paths: Record<string, string> = {
  'host-a-equipment-1': 'M72 32 H100',
  'host-c-equipment-1': 'M208 32 H180',
  'equipment-1-equipment-2': 'M160 48 V128 H184',
  'equipment-1-equipment-3': 'M120 48 V128 H96',
  'equipment-2-host-b': 'M224 144 V208 H180',
  'equipment-3-host-b': 'M56 144 V208 H100',
  'send-1': 'M72 32 H100',
  'send-2': 'M160 48 V128 H184',
  'send-3': 'M224 144 V208 H180',
}

const linkIds = ['host-a-equipment-1', 'host-c-equipment-1', 'equipment-1-equipment-2', 'equipment-1-equipment-3', 'equipment-2-host-b', 'equipment-3-host-b']
const circuitNodes = ['host-a', 'equipment-1', 'equipment-2', 'host-b', 'host-a-equipment-1', 'equipment-1-equipment-2', 'equipment-2-host-b']

// 회선 곁말은 첫 네트워크 장비에서 내려가는 회선 링크 바로 옆에 둔다. 두 시나리오는 같은 자리에 다른 글이 나온다.
// 끼어들 수 없음은 호스트 C 아래에 둔다.
const notes = [
  { id: 'circuit-only', x: 168, y: 92, textAnchor: 'start' as const, scenarios: ['in-use'] },
  { id: 'circuit-unused', x: 168, y: 92, textAnchor: 'start' as const, scenarios: ['idle'] },
  { id: 'c-blocked', x: 240, y: 62, textAnchor: 'middle' as const, scenarios: ['in-use', 'idle'] },
]

const wideNodes = [
  { id: 'host-a', x: 8, y: 8, width: 56 },
  { id: 'equipment-1', x: 88, y: 48, width: 80 },
  { id: 'host-c', x: 8, y: 88, width: 56 },
  { id: 'equipment-3', x: 256, y: 120, width: 80 },
  { id: 'equipment-2', x: 256, y: 48, width: 80 },
  { id: 'host-b', x: 376, y: 48, width: 56 },
]

const widePaths: Record<string, string> = {
  'host-a-equipment-1': 'M64 24 H112 V48',
  'host-c-equipment-1': 'M64 104 H112 V80',
  'equipment-1-equipment-2': 'M168 64 H256',
  'equipment-1-equipment-3': 'M144 80 V136 H256',
  'equipment-2-host-b': 'M336 64 H376',
  'equipment-3-host-b': 'M336 136 H404 V80',
  'send-1': 'M64 24 H112 V48',
  'send-2': 'M168 64 H256',
  'send-3': 'M336 64 H376',
}

// 곁말은 자리와 정렬이 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'circuit-only', x: 212, y: 58, textAnchor: 'middle' as const },
  { id: 'circuit-unused', x: 212, y: 58, textAnchor: 'middle' as const },
  { id: 'c-blocked', x: 8, y: 134, textAnchor: 'start' as const },
]

// nodes에는 선명하게 둘 노드와 링크를 함께 적는다. 두 시나리오 모두 회선만 선명하고, 화살표와 곁말로 갈린다.
export const circuitSwitchingScenarios: DiagramScenario[] = [
  { id: 'in-use', nodes: circuitNodes, paths: ['send-1', 'send-2', 'send-3'] },
  { id: 'idle', nodes: circuitNodes, paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function CircuitSwitchingDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-circuit-switching-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={circuitSwitchingScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 160' : '0 0 280 248'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {linkIds.map((id) => (
            <path key={id} data-link={id} d={layoutPaths[id]} className="fill-none stroke-muted" strokeWidth="1.5" opacity={opacityOf(id)} />
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.textAnchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
