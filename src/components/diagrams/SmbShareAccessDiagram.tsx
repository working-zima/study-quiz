import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-server-roles'].diagrams['smb-share-access']

// 세로형은 맨 위에 PC01을, 그 아래 가운데에 SMB 칸과 TCP/IP 칸을 위아래로 쌓고, 맨 아래 SRV01 박스 안에 공유한 두 자원을 둔다.
// SMB 칸이 TCP/IP 칸 바로 위에 있는 것이 SMB가 TCP/IP 위에서 동작한다는 뜻이다. 노드는 모두 회색이다.
const nodes = [
  { id: 'pc01', x: 108, y: 8, width: 64 },
  { id: 'smb', x: 100, y: 64, width: 80 },
  { id: 'tcpip', x: 100, y: 108, width: 80 },
  { id: 'share-data', x: 24, y: 188, width: 112 },
  { id: 'printer', x: 160, y: 188, width: 96 },
]

const groups = [
  { id: 'server', x: 8, y: 168, width: 264, height: 60, labelX: 16, labelY: 181 },
]

// PC01의 요청은 SMB 칸에서 TCP/IP 칸으로 내려간 뒤, 공유 폴더 쪽(tcp-data)이나 공유 프린터 쪽(tcp-printer)으로 갈린다.
const paths: Record<string, string> = {
  'pc-smb': 'M140 40 V64',
  'smb-tcp': 'M140 96 V108',
  'tcp-data': 'M120 140 V156 H80 V188',
  'tcp-printer': 'M160 140 V156 H208 V188',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다. 포트 곁말은 두 시나리오가 함께 쓴다 — 공유 폴더도 공유 프린터도 SMB로 TCP 445번에 닿는다.
const noteScenarios: Record<string, string[]> = {
  'unc-note': ['file'],
  'port-note': ['file', 'print'],
  'print-note': ['print'],
}

const notes: Note[] = [
  { id: 'unc-note', x: 100, y: 27, anchor: 'end' },
  { id: 'port-note', x: 188, y: 128, anchor: 'start' },
  { id: 'print-note', x: 180, y: 27, anchor: 'start' },
]

// 가로형은 PC01을 왼쪽에, SMB·TCP/IP 칸을 가운데에 위아래로 쌓고, 오른쪽 SRV01 박스 안에 공유한 두 자원을 위아래로 둔다.
const wideNodes = [
  { id: 'pc01', x: 8, y: 56, width: 64 },
  { id: 'smb', x: 136, y: 56, width: 80 },
  { id: 'tcpip', x: 136, y: 100, width: 80 },
  { id: 'share-data', x: 288, y: 48, width: 128 },
  { id: 'printer', x: 288, y: 112, width: 128 },
]

const wideGroups = [
  { id: 'server', x: 272, y: 24, width: 160, height: 136, labelX: 280, labelY: 37 },
]

const widePaths: Record<string, string> = {
  'pc-smb': 'M72 72 H136',
  'smb-tcp': 'M176 88 V100',
  'tcp-data': 'M216 108 H248 V64 H288',
  'tcp-printer': 'M216 128 H288',
}

const wideNotes: Note[] = [
  { id: 'unc-note', x: 8, y: 47, anchor: 'start' },
  { id: 'port-note', x: 176, y: 150, anchor: 'middle' },
  { id: 'print-note', x: 8, y: 106, anchor: 'start' },
]

// 공유 폴더: PC01·SMB·TCP/IP와 공유 폴더 Data. 공유 프린터: PC01·SMB·TCP/IP와 공유 프린터.
export const smbShareAccessScenarios: DiagramScenario[] = [
  { id: 'file', nodes: ['pc01', 'smb', 'tcpip', 'share-data'], paths: ['pc-smb', 'smb-tcp', 'tcp-data'] },
  { id: 'print', nodes: ['pc01', 'smb', 'tcpip', 'printer'], paths: ['pc-smb', 'smb-tcp', 'tcp-printer'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function SmbShareAccessDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-smb-share-access-arrow`
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
      scenarios={smbShareAccessScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 168' : '0 0 280 236'}>
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
