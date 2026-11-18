import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-hyperv'].diagrams['virtual-hard-disk']

// 세로형은 바깥 HV01 박스 안 위쪽에 VM01 박스를 두고, 그 안에 가상 장치 넷을 두 줄(가상 프로세서·가상 네트워크 어댑터 / 메모리·가상 하드 디스크)로 둔다.
// VM01 박스 아래, HV01 박스 안에 파일 D:\VMs\VM01.vhdx를 가상 하드 디스크 바로 아래 열에 둔다.
// 「디스크 파일」의 화살표는 가상 하드 디스크의 아래 변에서 파일의 위 변으로 곧게 내려간다. 노드는 모두 회색이다.
const nodes = [
  { id: 'vcpu', x: 20, y: 44, width: 100 },
  { id: 'vnic', x: 128, y: 44, width: 132 },
  { id: 'memory', x: 20, y: 84, width: 100 },
  { id: 'vdisk', x: 128, y: 84, width: 132 },
  { id: 'file', x: 134, y: 148, width: 120 },
]

const groups = [
  { id: 'host', x: 4, y: 4, width: 272, height: 184, labelX: 12, labelY: 17 },
  { id: 'vm', x: 12, y: 24, width: 256, height: 104, labelX: 20, labelY: 37 },
]

const paths: Record<string, string> = {
  'vdisk-file': 'M194 116 V148',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다. 장치 곁말은 VM01 박스의 라벨 줄 오른쪽, 파일 곁말은 VM01 박스와 파일 사이에 둔다.
const noteScenarios: Record<string, string> = {
  'devices-note': 'devices',
  'file-note': 'file',
}

const notes: Note[] = [
  { id: 'devices-note', x: 260, y: 37, anchor: 'end' },
  { id: 'file-note', x: 20, y: 140, anchor: 'start' },
]

// 가로형은 VM01 박스를 왼쪽에, 파일을 그 오른쪽 HV01 박스 안에 두고, 화살표는 가상 하드 디스크의 오른쪽 변에서 파일의 왼쪽 변으로 간다.
const wideNodes = [
  { id: 'vcpu', x: 24, y: 48, width: 100 },
  { id: 'vnic', x: 132, y: 48, width: 132 },
  { id: 'memory', x: 24, y: 88, width: 100 },
  { id: 'vdisk', x: 132, y: 88, width: 132 },
  { id: 'file', x: 304, y: 88, width: 120 },
]

const wideGroups = [
  { id: 'host', x: 8, y: 8, width: 424, height: 128, labelX: 16, labelY: 21 },
  { id: 'vm', x: 16, y: 28, width: 256, height: 100, labelX: 24, labelY: 41 },
]

const widePaths: Record<string, string> = {
  'vdisk-file': 'M264 104 H304',
}

const wideNotes: Note[] = [
  { id: 'devices-note', x: 264, y: 41, anchor: 'end' },
  { id: 'file-note', x: 424, y: 80, anchor: 'end' },
]

// 가상 장치: VM01 안의 가상 장치 넷. 디스크 파일: 가상 하드 디스크와 HV01의 파일, 그리고 둘을 잇는 화살표.
export const virtualHardDiskScenarios: DiagramScenario[] = [
  { id: 'devices', nodes: ['vcpu', 'vnic', 'memory', 'vdisk'], paths: [] },
  { id: 'file', nodes: ['vdisk', 'file'], paths: ['vdisk-file'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function VirtualHardDiskDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-virtual-hard-disk-arrow`
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
      scenarios={virtualHardDiskScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 144' : '0 0 280 196'}>
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
