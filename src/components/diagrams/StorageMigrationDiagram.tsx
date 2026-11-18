import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-hyperv'].diagrams['storage-migration']

// 세로형은 바깥 HV01 박스 안 위쪽에 VM01을 두고, 그 아래에 저장 위치 D:\VMs 박스와 E:\VMs 박스를 위아래로 쌓는다. 박스마다 VM01.vhdx 파일이 하나씩 있다.
// VM01은 어느 시나리오에서나 같은 노드, 같은 자리다 — 호스트가 바뀌지 않는다. D:\VMs의 파일로는 곧게 내려가고, E:\VMs의 파일로는 오른쪽으로 돌아 들어간다.
// 옮기는 화살표는 원래 파일에서 새 파일로 곧게 내려간다. 노드는 모두 회색이다.
const nodes = [
  { id: 'vm', x: 116, y: 32, width: 80 },
  { id: 'file-d', x: 92, y: 96, width: 128 },
  { id: 'file-e', x: 92, y: 176, width: 128 },
]

const groups = [
  { id: 'host', x: 8, y: 8, width: 264, height: 232, labelX: 16, labelY: 21 },
  { id: 'd-store', x: 64, y: 80, width: 184, height: 56, labelX: 72, labelY: 93 },
  { id: 'e-store', x: 64, y: 160, width: 184, height: 56, labelX: 72, labelY: 173 },
]

const paths: Record<string, string> = {
  'vm-file-d': 'M156 64 V96',
  'vm-file-e': 'M196 48 H260 V192 H220',
  'file-move': 'M156 128 V176',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다. 「HV01에서 계속 실행」은 VM01 왼쪽, 옮기기 전의 「디스크로 쓴다」는 D:\VMs로 가는 화살표 왼쪽,
// 옮긴 뒤의 「디스크로 쓴다」는 E:\VMs로 가는 화살표 위, 복사 곁말은 옮기는 화살표 왼쪽에 둔다.
const noteScenarios: Record<string, string[]> = {
  'stay-note': ['after'],
  'before-note': ['before'],
  'copy-note': ['moving'],
  'after-note': ['after'],
}

const notes: Note[] = [
  { id: 'stay-note', x: 108, y: 52, anchor: 'end' },
  { id: 'before-note', x: 148, y: 78, anchor: 'end' },
  { id: 'copy-note', x: 148, y: 152, anchor: 'end' },
  { id: 'after-note', x: 200, y: 40, anchor: 'start' },
]

// 가로형은 VM01을 HV01 박스 왼쪽에, 두 저장 위치 박스를 그 오른쪽에 나란히 둔다. D:\VMs의 파일로는 곧게 가고,
// E:\VMs의 파일로는 두 박스 아래를 지나 아래 변으로 올라간다. 옮기는 화살표는 원래 파일에서 새 파일로 곧게 간다.
const wideNodes = [
  { id: 'vm', x: 32, y: 52, width: 80 },
  { id: 'file-d', x: 140, y: 52, width: 128 },
  { id: 'file-e', x: 292, y: 52, width: 128 },
]

const wideGroups = [
  { id: 'host', x: 8, y: 8, width: 424, height: 148, labelX: 16, labelY: 21 },
  { id: 'd-store', x: 136, y: 32, width: 136, height: 64, labelX: 144, labelY: 45 },
  { id: 'e-store', x: 288, y: 32, width: 136, height: 64, labelX: 296, labelY: 45 },
]

const widePaths: Record<string, string> = {
  'vm-file-d': 'M112 68 H140',
  'vm-file-e': 'M72 84 V128 H356 V84',
  'file-move': 'M268 68 H292',
}

const wideNotes: Note[] = [
  { id: 'stay-note', x: 24, y: 44, anchor: 'start' },
  { id: 'before-note', x: 126, y: 110, anchor: 'middle' },
  { id: 'copy-note', x: 280, y: 112, anchor: 'middle' },
  { id: 'after-note', x: 300, y: 144, anchor: 'middle' },
]

// 옮기기 전: VM01이 D:\VMs의 파일을 디스크로 쓴다. 옮기는 중: VM01이 그 파일을 계속 쓰는 동안 내용이 E:\VMs의 새 파일로 옮겨 간다.
// 옮긴 뒤: VM01이 같은 자리에서 E:\VMs의 파일을 디스크로 쓴다.
export const storageMigrationScenarios: DiagramScenario[] = [
  { id: 'before', nodes: ['vm', 'file-d'], paths: ['vm-file-d'] },
  { id: 'moving', nodes: ['vm', 'file-d', 'file-e'], paths: ['vm-file-d', 'file-move'] },
  { id: 'after', nodes: ['vm', 'file-e'], paths: ['vm-file-e'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function StorageMigrationDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-storage-migration-arrow`
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
      scenarios={storageMigrationScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 164' : '0 0 280 248'}>
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

          {active && layoutNotes.filter((note) => noteScenarios[note.id].includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
