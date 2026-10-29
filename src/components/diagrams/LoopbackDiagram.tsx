import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ip-address-types'].diagrams.loopback

// 세로형은 호스트 A 박스 안에 프로그램·네트워크 소프트웨어·네트워크 카드를 위에서 아래로 쌓고, 박스 아래에 네트워크를,
// 그 오른쪽에 호스트 B를 둔다. 목적지 곁말은 프로그램 오른쪽, 호스트 B의 주소는 호스트 B 아래에 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'program', x: 24, y: 28, width: 128 },
  { id: 'software', x: 24, y: 84, width: 128 },
  { id: 'nic', x: 24, y: 140, width: 128 },
  { id: 'network', x: 24, y: 196, width: 128 },
  { id: 'host-b', x: 168, y: 196, width: 88 },
]

const groups = [
  { id: 'host-a', x: 8, y: 8, width: 264, height: 172, labelX: 16, labelY: 20 },
]

// 화살표는 패킷이 가는 방향이다. 루프백에서는 프로그램과 네트워크 소프트웨어 사이를 오가는 두 화살표가 나란히 서고,
// 다른 호스트로 보낼 때는 네트워크 소프트웨어에서 네트워크 카드, 네트워크, 호스트 B로 이어진다.
const paths: Record<string, string> = {
  'send': 'M72 60 V84',
  'return': 'M104 84 V60',
  'to-nic': 'M88 116 V140',
  'nic-out': 'M88 172 V196',
  'to-host-b': 'M152 212 H168',
}

// 호스트 B의 주소는 호스트 B의 흐림을 따른다.
const ownerNotes = [
  { id: 'host-b-address', owner: 'host-b', x: 212, y: 241, anchor: 'middle' as const },
]

// 목적지 곁말은 자기 시나리오에서만 보인다.
const notes = [
  { id: 'to-loopback', x: 160, y: 48, anchor: 'start' as const, scenarios: ['loopback'] },
  { id: 'to-host-b', x: 160, y: 48, anchor: 'start' as const, scenarios: ['other-host'] },
]

// 가로형은 호스트 A 박스 안에 프로그램·네트워크 소프트웨어·네트워크 카드를 왼쪽에서 오른쪽으로 놓고,
// 네트워크 카드 아래 박스 밖에 네트워크를, 그 오른쪽에 호스트 B를 둔다. 목적지 곁말은 프로그램 아래에 둔다.
const wideNodes = [
  { id: 'program', x: 16, y: 28, width: 72 },
  { id: 'software', x: 112, y: 28, width: 128 },
  { id: 'nic', x: 264, y: 28, width: 96 },
  { id: 'network', x: 276, y: 104, width: 72 },
  { id: 'host-b', x: 364, y: 104, width: 72 },
]

const wideGroups = [
  { id: 'host-a', x: 8, y: 8, width: 360, height: 80, labelX: 16, labelY: 20 },
]

const widePaths: Record<string, string> = {
  'send': 'M88 38 H112',
  'return': 'M112 50 H88',
  'to-nic': 'M240 44 H264',
  'nic-out': 'M312 60 V104',
  'to-host-b': 'M348 120 H364',
}

// 곁말의 자리만 배치마다 다르다. 흐림을 따르는 노드와 보이는 시나리오는 세로형에서 id로 가져온다.
const wideOwnerNotes = [
  { id: 'host-b-address', x: 400, y: 149, anchor: 'middle' as const },
]

const wideNotes = [
  { id: 'to-loopback', x: 16, y: 80, anchor: 'start' as const },
  { id: 'to-host-b', x: 16, y: 80, anchor: 'start' as const },
]

// 127.0.0.1로: 프로그램과 네트워크 소프트웨어, 오가는 두 화살표. 다른 호스트로: 모든 노드와 호스트 B까지 이어지는 화살표 넷.
export const loopbackScenarios: DiagramScenario[] = [
  { id: 'loopback', nodes: ['program', 'software'], paths: ['send', 'return'] },
  { id: 'other-host', nodes: ['program', 'software', 'nic', 'network', 'host-b'], paths: ['send', 'to-nic', 'nic-out', 'to-host-b'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function LoopbackDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-loopback-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutOwnerNotes = wide ? wideOwnerNotes.map((note) => ({ ...ownerNotes.find(({ id }) => id === note.id)!, ...note })) : ownerNotes
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={loopbackScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 156' : '0 0 280 248'}>
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

          {layoutOwnerNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9" opacity={opacityOf(note.owner)}>
              {text.notes![note.id]}
            </text>
          ))}

          {active && layoutNotes.filter((note) => note.scenarios.includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
