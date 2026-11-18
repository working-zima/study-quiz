import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-hyperv'].diagrams['virtual-switch-types']

// 세로형은 HV01 박스 안 맨 위 줄에 Windows Server(호스트의 운영 체제)와 VM01·VM02를 두고, 그 아래에 가상 스위치를 한 줄 전체 폭으로,
// 그 아래 오른쪽에 물리 네트워크 어댑터를 둔다. 물리 네트워크는 HV01 박스 밖, 어댑터 바로 아래에 둔다.
// 화살표는 가상 컴퓨터가 보낸 데이터가 닿는 곳으로 간다 — 두 가상 컴퓨터에서 스위치로, 스위치에서 호스트와 어댑터로, 어댑터에서 물리 네트워크로. 노드는 모두 회색이다.
const nodes = [
  { id: 'host-os', x: 16, y: 32, width: 104 },
  { id: 'vm01', x: 128, y: 32, width: 64 },
  { id: 'vm02', x: 200, y: 32, width: 64 },
  { id: 'switch', x: 16, y: 88, width: 248 },
  { id: 'adapter', x: 128, y: 144, width: 136 },
  { id: 'network', x: 128, y: 208, width: 136 },
]

const groups = [
  { id: 'host', x: 8, y: 8, width: 264, height: 176, labelX: 16, labelY: 21 },
]

const paths: Record<string, string> = {
  'vm01-switch': 'M160 64 V88',
  'vm02-switch': 'M232 64 V88',
  'switch-host': 'M68 88 V64',
  'switch-adapter': 'M196 120 V144',
  'adapter-network': 'M196 176 V208',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다. 외부는 물리 네트워크 옆, 내부는 스위치에서 호스트로 가는 화살표 옆, 프라이빗은 두 가상 컴퓨터 위에 둔다.
const noteScenarios: Record<string, string> = {
  'external-note': 'external',
  'internal-note': 'internal',
  'private-note': 'private',
}

const notes: Note[] = [
  { id: 'external-note', x: 120, y: 228, anchor: 'end' },
  { id: 'internal-note', x: 74, y: 80, anchor: 'start' },
  { id: 'private-note', x: 196, y: 21, anchor: 'middle' },
]

// 가로형은 HV01 박스를 왼쪽에 두고 물리 네트워크를 박스 오른쪽 밖에 둔다. 어댑터에서 물리 네트워크로 가는 화살표는 오른쪽으로 곧게 간다.
const wideNodes = [
  { id: 'host-os', x: 16, y: 32, width: 104 },
  { id: 'vm01', x: 144, y: 32, width: 72 },
  { id: 'vm02', x: 232, y: 32, width: 72 },
  { id: 'switch', x: 16, y: 88, width: 288 },
  { id: 'adapter', x: 168, y: 144, width: 136 },
  { id: 'network', x: 336, y: 144, width: 96 },
]

const wideGroups = [
  { id: 'host', x: 8, y: 8, width: 312, height: 176, labelX: 16, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'vm01-switch': 'M180 64 V88',
  'vm02-switch': 'M268 64 V88',
  'switch-host': 'M68 88 V64',
  'switch-adapter': 'M236 120 V144',
  'adapter-network': 'M304 160 H336',
}

const wideNotes: Note[] = [
  { id: 'external-note', x: 384, y: 136, anchor: 'middle' },
  { id: 'internal-note', x: 74, y: 80, anchor: 'start' },
  { id: 'private-note', x: 224, y: 21, anchor: 'middle' },
]

// 외부: 두 가상 컴퓨터가 스위치를 거쳐 호스트와 물리 네트워크까지(호스트는 어댑터를 함께 쓰도록 허용했을 때). 내부: 가상 컴퓨터끼리와 호스트까지.
// 프라이빗: 가상 컴퓨터끼리만 — 스위치로 들어가는 화살표만 보인다.
export const virtualSwitchTypesScenarios: DiagramScenario[] = [
  {
    id: 'external',
    nodes: ['host-os', 'vm01', 'vm02', 'switch', 'adapter', 'network'],
    paths: ['vm01-switch', 'vm02-switch', 'switch-host', 'switch-adapter', 'adapter-network'],
  },
  {
    id: 'internal',
    nodes: ['host-os', 'vm01', 'vm02', 'switch'],
    paths: ['vm01-switch', 'vm02-switch', 'switch-host'],
  },
  {
    id: 'private',
    nodes: ['vm01', 'vm02', 'switch'],
    paths: ['vm01-switch', 'vm02-switch'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function VirtualSwitchTypesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-virtual-switch-types-arrow`
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
      scenarios={virtualSwitchTypesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 192' : '0 0 280 248'}>
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
