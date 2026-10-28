import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['protocols-encapsulation'].diagrams['packet-switching']

// 위 줄에 호스트 A·첫 패킷 스위치·호스트 C를 두고, 그 아래에서 길이 두 패킷 스위치로 갈라졌다가 호스트 B에서 만난다.
// 회선 교환 도식(CircuitSwitchingDiagram)이 같은 자리를 쓴다. 노드는 모두 회색이다.
const nodes = [
  { id: 'host-a', x: 8, y: 16, width: 64 },
  { id: 'switch-1', x: 100, y: 16, width: 80 },
  { id: 'host-c', x: 208, y: 16, width: 64 },
  { id: 'switch-3', x: 16, y: 112, width: 80 },
  { id: 'switch-2', x: 184, y: 112, width: 80 },
  { id: 'host-b', x: 100, y: 192, width: 80 },
]

// 통신 링크 여섯은 늘 보인다. 화살표는 패킷이 지나는 링크 위에 겹쳐 그리고, 노드 하나에서 다음 노드까지만 간다.
// 나눠 보내기는 첫 패킷 스위치에서 두 길로 갈라지고, 링크 나눠 쓰기는 두 호스트의 화살표가 첫 패킷 스위치에서 만나 같은 링크를 지난다.
const paths: Record<string, string> = {
  'host-a-switch-1': 'M72 32 H100',
  'host-c-switch-1': 'M208 32 H180',
  'switch-1-switch-2': 'M160 48 V128 H184',
  'switch-1-switch-3': 'M120 48 V128 H96',
  'switch-2-host-b': 'M224 144 V208 H180',
  'switch-3-host-b': 'M56 144 V208 H100',
  'split-1': 'M72 32 H100',
  'split-2': 'M160 48 V128 H184',
  'split-3': 'M224 144 V208 H180',
  'split-4': 'M120 48 V128 H96',
  'split-5': 'M56 144 V208 H100',
  'share-1': 'M72 32 H100',
  'share-2': 'M208 32 H180',
  'share-3': 'M160 48 V128 H184',
  'share-4': 'M224 144 V208 H180',
}

const linkIds = ['host-a-switch-1', 'host-c-switch-1', 'switch-1-switch-2', 'switch-1-switch-3', 'switch-2-host-b', 'switch-3-host-b']

// 나눠 보냄은 호스트 A 아래에, 다시 합침은 호스트 B 아래에 둔다. 패킷 번호와 함께 지나감은 첫 패킷 스위치에서 내려가는 선 바로 옆에 둔다.
const notes = [
  { id: 'split-out', x: 40, y: 62, textAnchor: 'middle' as const, scenarios: ['split'] },
  { id: 'split-in', x: 140, y: 238, textAnchor: 'middle' as const, scenarios: ['split'] },
  { id: 'via-2', x: 168, y: 92, textAnchor: 'start' as const, scenarios: ['split'] },
  { id: 'via-3', x: 112, y: 92, textAnchor: 'end' as const, scenarios: ['split'] },
  { id: 'shared', x: 168, y: 92, textAnchor: 'start' as const, scenarios: ['share'] },
]

// 가로형은 호스트 A와 C를 왼쪽에 쌓고, 첫 패킷 스위치·패킷 스위치·호스트 B를 가운데 줄에 둔다. 남은 패킷 스위치는 그 아래에 둔다.
const wideNodes = [
  { id: 'host-a', x: 8, y: 8, width: 56 },
  { id: 'switch-1', x: 88, y: 48, width: 80 },
  { id: 'host-c', x: 8, y: 88, width: 56 },
  { id: 'switch-3', x: 256, y: 120, width: 80 },
  { id: 'switch-2', x: 256, y: 48, width: 80 },
  { id: 'host-b', x: 376, y: 48, width: 56 },
]

const widePaths: Record<string, string> = {
  'host-a-switch-1': 'M64 24 H112 V48',
  'host-c-switch-1': 'M64 104 H112 V80',
  'switch-1-switch-2': 'M168 64 H256',
  'switch-1-switch-3': 'M144 80 V136 H256',
  'switch-2-host-b': 'M336 64 H376',
  'switch-3-host-b': 'M336 136 H404 V80',
  'split-1': 'M64 24 H112 V48',
  'split-2': 'M168 64 H256',
  'split-3': 'M336 64 H376',
  'split-4': 'M144 80 V136 H256',
  'split-5': 'M336 136 H404 V80',
  'share-1': 'M64 24 H112 V48',
  'share-2': 'M64 104 H112 V80',
  'share-3': 'M168 64 H256',
  'share-4': 'M336 64 H376',
}

// 곁말은 자리와 정렬이 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'split-out', x: 36, y: 54, textAnchor: 'middle' as const },
  { id: 'split-in', x: 404, y: 40, textAnchor: 'middle' as const },
  { id: 'via-2', x: 212, y: 58, textAnchor: 'middle' as const },
  { id: 'via-3', x: 152, y: 112, textAnchor: 'start' as const },
  { id: 'shared', x: 212, y: 58, textAnchor: 'middle' as const },
]

// nodes에는 선명하게 둘 노드와 통신 링크를 함께 적는다.
export const packetSwitchingScenarios: DiagramScenario[] = [
  {
    id: 'split',
    nodes: ['host-a', 'switch-1', 'switch-2', 'switch-3', 'host-b', 'host-a-switch-1', 'switch-1-switch-2', 'switch-2-host-b', 'switch-1-switch-3', 'switch-3-host-b'],
    paths: ['split-1', 'split-2', 'split-3', 'split-4', 'split-5'],
  },
  {
    id: 'share',
    nodes: ['host-a', 'host-c', 'switch-1', 'switch-2', 'host-b', 'host-a-switch-1', 'host-c-switch-1', 'switch-1-switch-2', 'switch-2-host-b'],
    paths: ['share-1', 'share-2', 'share-3', 'share-4'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PacketSwitchingDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-packet-switching-arrow`
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
      scenarios={packetSwitchingScenarios}
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
