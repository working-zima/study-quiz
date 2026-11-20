import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['raid-storage'].diagrams['storage-attach']

// 세로형은 갈래 셋을 박스 셋으로 위에서 아래로 쌓는다 — 맨 위 「DAS」, 가운데 「NAS」, 맨 아래 「SAN」.
// 갈래마다 노드 id를 따로 둔다. 화살표는 서버나 컴퓨터가 저장 장치에 데이터를 청하는 쪽이다. 노드는 모두 회색이다.
const nodes = [
  { id: 'das-server', x: 40, y: 28, width: 72 },
  { id: 'das-storage', x: 168, y: 28, width: 80 },
  { id: 'nas-pc', x: 16, y: 108, width: 104 },
  { id: 'nas-lan', x: 140, y: 108, width: 48 },
  { id: 'nas-nas01', x: 208, y: 108, width: 56 },
  { id: 'san-srv01', x: 16, y: 188, width: 72 },
  { id: 'san-srv02', x: 104, y: 188, width: 72 },
  { id: 'san-network', x: 16, y: 244, width: 160 },
  { id: 'san-stor01', x: 200, y: 244, width: 64 },
]

const groups = [
  { id: 'das', x: 8, y: 8, width: 264, height: 64, labelX: 16, labelY: 21 },
  { id: 'nas', x: 8, y: 88, width: 264, height: 64, labelX: 16, labelY: 101 },
  { id: 'san', x: 8, y: 168, width: 264, height: 124, labelX: 16, labelY: 181 },
]

// SAN의 두 서버는 「저장 장치를 잇는 네트워크」 바로 위에 두어 화살표가 곧게 내려가고, 네트워크에서 STOR01로 옆으로 간다.
const paths: Record<string, string> = {
  'das-server-storage': 'M112 44 H168',
  'nas-pc-lan': 'M120 124 H140',
  'nas-lan-nas01': 'M188 124 H208',
  'san-srv01-network': 'M52 220 V244',
  'san-srv02-network': 'M140 220 V244',
  'san-network-stor01': 'M176 260 H200',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보이고, 시나리오마다 하나라 세 박스 아래의 빈 줄 가운데 한 자리를 함께 쓴다.
const noteScenarios: Record<string, string> = {
  'das-note': 'das',
  'nas-note': 'nas',
  'san-note': 'san',
}

const notes: Note[] = [
  { id: 'das-note', x: 140, y: 312, anchor: 'middle' },
  { id: 'nas-note', x: 140, y: 312, anchor: 'middle' },
  { id: 'san-note', x: 140, y: 312, anchor: 'middle' },
]

// 가로형도 갈래 셋을 박스 셋으로 위에서 아래로 쌓되, 박스 안에서는 왼쪽(청하는 쪽) → 가운데(네트워크) → 오른쪽(저장 장치)의 세 열에 둔다.
// SAN의 두 서버는 왼쪽 열에 위아래로 두고, 두 화살표는 서버와 네트워크 사이의 빈 통로에서 꺾여 네트워크의 왼쪽 변으로 들어간다.
const wideNodes = [
  { id: 'das-server', x: 40, y: 28, width: 72 },
  { id: 'das-storage', x: 344, y: 28, width: 80 },
  { id: 'nas-pc', x: 24, y: 108, width: 104 },
  { id: 'nas-lan', x: 208, y: 108, width: 64 },
  { id: 'nas-nas01', x: 344, y: 108, width: 80 },
  { id: 'san-srv01', x: 40, y: 188, width: 72 },
  { id: 'san-srv02', x: 40, y: 236, width: 72 },
  { id: 'san-network', x: 160, y: 212, width: 160 },
  { id: 'san-stor01', x: 344, y: 212, width: 80 },
]

const wideGroups = [
  { id: 'das', x: 8, y: 8, width: 424, height: 64, labelX: 16, labelY: 21 },
  { id: 'nas', x: 8, y: 88, width: 424, height: 64, labelX: 16, labelY: 101 },
  { id: 'san', x: 8, y: 168, width: 424, height: 112, labelX: 16, labelY: 181 },
]

const widePaths: Record<string, string> = {
  'das-server-storage': 'M112 44 H344',
  'nas-pc-lan': 'M128 124 H208',
  'nas-lan-nas01': 'M272 124 H344',
  'san-srv01-network': 'M112 204 H136 V224 H160',
  'san-srv02-network': 'M112 252 H136 V232 H160',
  'san-network-stor01': 'M320 228 H344',
}

const wideNotes: Note[] = [
  { id: 'das-note', x: 220, y: 300, anchor: 'middle' },
  { id: 'nas-note', x: 220, y: 300, anchor: 'middle' },
  { id: 'san-note', x: 220, y: 300, anchor: 'middle' },
]

// DAS: 서버에서 저장 장치로 바로 가는 화살표 하나. NAS: 사무실 컴퓨터들 → LAN → NAS01.
// SAN: SRV01·SRV02 → 저장 장치를 잇는 네트워크 → STOR01. 고른 갈래 밖의 노드는 흐리다.
export const storageAttachScenarios: DiagramScenario[] = [
  {
    id: 'das',
    nodes: ['das-server', 'das-storage'],
    paths: ['das-server-storage'],
  },
  {
    id: 'nas',
    nodes: ['nas-pc', 'nas-lan', 'nas-nas01'],
    paths: ['nas-pc-lan', 'nas-lan-nas01'],
  },
  {
    id: 'san',
    nodes: ['san-srv01', 'san-srv02', 'san-network', 'san-stor01'],
    paths: ['san-srv01-network', 'san-srv02-network', 'san-network-stor01'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function StorageAttachDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-storage-attach-arrow`
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
      scenarios={storageAttachScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 312' : '0 0 280 324'}>
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
