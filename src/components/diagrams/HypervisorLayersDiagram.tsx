import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-hyperv'].diagrams['hypervisor-layers']

// 세로형은 HV01 박스 안에 아래부터 물리 하드웨어, 하이퍼바이저를 한 줄 전체 폭으로 쌓고, 맨 위 줄에 Windows Server와 VM01·VM02를 나란히 둔다.
// 맨 위 줄의 셋은 하이퍼바이저가 내준 칸에서 실행되는 운영 체제다. 화살표 넷은 「하드웨어 나눠 쓰기」에서만 보이고,
// 두 가상 컴퓨터의 아래 변에서 하이퍼바이저로, 같은 x에서 하이퍼바이저의 아래 변으로부터 물리 하드웨어로 곧게 내려간다. 노드는 모두 회색이다.
const nodes = [
  { id: 'host-os', x: 16, y: 32, width: 104 },
  { id: 'vm01', x: 128, y: 32, width: 64 },
  { id: 'vm02', x: 200, y: 32, width: 64 },
  { id: 'hypervisor', x: 16, y: 80, width: 248 },
  { id: 'hardware', x: 16, y: 136, width: 248 },
]

const groups = [
  { id: 'host', x: 8, y: 8, width: 264, height: 184, labelX: 16, labelY: 21 },
]

const paths: Record<string, string> = {
  'vm01-hypervisor': 'M160 64 V80',
  'vm02-hypervisor': 'M232 64 V80',
  'hypervisor-hardware-01': 'M160 112 V136',
  'hypervisor-hardware-02': 'M232 112 V136',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다. 게스트 곁말은 두 가상 컴퓨터 위, 나눠 쓰기 곁말은 하이퍼바이저와 하드웨어 사이, 호스트 곁말은 하드웨어 아래에 둔다.
const noteScenarios: Record<string, string> = {
  'guest-note': 'guest',
  'share-note': 'share',
  'host-note': 'host',
}

const notes: Note[] = [
  { id: 'guest-note', x: 196, y: 21, anchor: 'middle' },
  { id: 'share-note', x: 16, y: 128, anchor: 'start' },
  { id: 'host-note', x: 264, y: 184, anchor: 'end' },
]

// 가로형도 층의 차례는 같고, 맨 위 줄과 두 층을 넓게 편다.
const wideNodes = [
  { id: 'host-os', x: 24, y: 32, width: 136 },
  { id: 'vm01', x: 200, y: 32, width: 96 },
  { id: 'vm02', x: 320, y: 32, width: 96 },
  { id: 'hypervisor', x: 24, y: 80, width: 392 },
  { id: 'hardware', x: 24, y: 136, width: 392 },
]

const wideGroups = [
  { id: 'host', x: 8, y: 8, width: 424, height: 184, labelX: 16, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'vm01-hypervisor': 'M248 64 V80',
  'vm02-hypervisor': 'M368 64 V80',
  'hypervisor-hardware-01': 'M248 112 V136',
  'hypervisor-hardware-02': 'M368 112 V136',
}

const wideNotes: Note[] = [
  { id: 'guest-note', x: 308, y: 21, anchor: 'middle' },
  { id: 'share-note', x: 24, y: 128, anchor: 'start' },
  { id: 'host-note', x: 416, y: 184, anchor: 'end' },
]

// 호스트: 물리 하드웨어와 하이퍼바이저, 그 위에서 실행되는 HV01의 Windows Server. 게스트: VM01·VM02.
// 하드웨어 나눠 쓰기: 두 가상 컴퓨터에서 하이퍼바이저를 거쳐 같은 물리 하드웨어로 가는 화살표 넷.
export const hypervisorLayersScenarios: DiagramScenario[] = [
  { id: 'host', nodes: ['host-os', 'hypervisor', 'hardware'], paths: [] },
  { id: 'guest', nodes: ['vm01', 'vm02'], paths: [] },
  {
    id: 'share',
    nodes: ['vm01', 'vm02', 'hypervisor', 'hardware'],
    paths: ['vm01-hypervisor', 'vm02-hypervisor', 'hypervisor-hardware-01', 'hypervisor-hardware-02'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function HypervisorLayersDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-hypervisor-layers-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={hypervisorLayersScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 200' : '0 0 280 200'}>
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

          {active && layoutNotes.filter((note) => noteScenarios[note.id] === active.id).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
