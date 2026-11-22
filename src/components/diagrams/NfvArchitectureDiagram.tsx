import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['cloud-sdn'].diagrams['nfv-architecture']

// 세로형은 아래쪽 「NFVI」 박스 안에 하드웨어(NFVI01)를 맨 아래, 그 위에 가상화 계층을 빈틈없이 쌓는다.
// 그 위 줄에 VNF 셋(가상 방화벽·가상 라우터·가상 방화벽 2)을 나란히 두고, 맨 위 오른쪽에 NFV-MANO를 가상 방화벽 2 바로 위에 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'vfw', x: 8, y: 56, width: 80 },
  { id: 'vrouter', x: 94, y: 56, width: 80 },
  { id: 'vfw2', x: 180, y: 56, width: 92 },
  { id: 'mano', x: 190, y: 8, width: 72 },
  { id: 'virt', x: 16, y: 124, width: 248 },
  { id: 'hw', x: 16, y: 156, width: 248 },
]

const groups = [
  { id: 'nfvi', x: 8, y: 104, width: 264, height: 88, labelX: 16, labelY: 117 },
]

// 늘리기 장면의 화살표는 NFV-MANO의 아래 변에서 나가 가상 방화벽 2의 위 변에서 끝난다.
const paths: Record<string, string> = {
  'scale-mano-vfw2': 'M226 40 V56',
}

// 쌓은 두 칸은 모서리를 둥글리지 않아 맞닿은 변이 한 줄로 보이게 한다.
const tierIds = ['virt', 'hw']

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보이고, 「NFVI」 박스 아래의 빈 줄 가운데에 둔다.
const noteScenarios: Record<string, string> = {
  'vnf-note': 'vnf',
  'nfvi-note': 'nfvi',
  'scale-note': 'scale',
}

const notes: Note[] = [
  { id: 'vnf-note', x: 140, y: 212, anchor: 'middle' },
  { id: 'nfvi-note', x: 140, y: 212, anchor: 'middle' },
  { id: 'scale-note', x: 140, y: 212, anchor: 'middle' },
]

// 가로형은 위 줄에 VNF 셋을 두고 그 아래 「NFVI」 박스에 같은 차례로 두 칸을 쌓는다.
// NFV-MANO는 위 줄의 오른쪽 끝에 두어, 화살표가 가상 방화벽 2의 오른쪽 변으로 들어간다.
const wideNodes = [
  { id: 'vfw', x: 8, y: 8, width: 88 },
  { id: 'vrouter', x: 108, y: 8, width: 88 },
  { id: 'vfw2', x: 208, y: 8, width: 104 },
  { id: 'mano', x: 344, y: 8, width: 88 },
  { id: 'virt', x: 16, y: 76, width: 288 },
  { id: 'hw', x: 16, y: 108, width: 288 },
]

const wideGroups = [
  { id: 'nfvi', x: 8, y: 56, width: 304, height: 88, labelX: 16, labelY: 69 },
]

const widePaths: Record<string, string> = {
  'scale-mano-vfw2': 'M344 24 H312',
}

const wideNotes: Note[] = [
  { id: 'vnf-note', x: 160, y: 168, anchor: 'middle' },
  { id: 'nfvi-note', x: 160, y: 168, anchor: 'middle' },
  { id: 'scale-note', x: 160, y: 168, anchor: 'middle' },
]

// VNF: 네트워크 기능을 소프트웨어로 만든 가상 방화벽과 가상 라우터만 선명하다.
// NFVI: VNF가 실행되는 바탕인 하드웨어와 가상화 계층 두 칸만 선명하다.
// 늘리기: NFV-MANO가 가상 방화벽 2를 실행한다. 가상 방화벽 2는 이 장면에서만 선명하다.
export const nfvArchitectureScenarios: DiagramScenario[] = [
  {
    id: 'vnf',
    nodes: ['vfw', 'vrouter'],
    paths: [],
  },
  {
    id: 'nfvi',
    nodes: ['virt', 'hw'],
    paths: [],
  },
  {
    id: 'scale',
    nodes: ['vfw', 'vrouter', 'vfw2', 'mano'],
    paths: ['scale-mano-vfw2'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function NfvArchitectureDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-nfv-architecture-arrow`
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
      scenarios={nfvArchitectureScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 184' : '0 0 280 224'}>
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
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx={tierIds.includes(node.id) ? 0 : 4} strokeWidth="1.5" />
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
