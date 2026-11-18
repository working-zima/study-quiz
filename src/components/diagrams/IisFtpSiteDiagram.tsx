import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-server-roles'].diagrams['iis-ftp-site']

// 세로형은 위에 SRV01의 웹 서버(IIS) 역할 상자를 두고, 그 안에 FTP 서버 역할 서비스와 FTP 사이트 상자(포트·실제 경로 칸)를 쌓는다.
// 역할 상자 밖 오른쪽에 OpenSSH를, 맨 아래에 FTP 클라이언트(왼쪽)와 SFTP 클라이언트(오른쪽)를 두어 각자 접속하는 곳 바로 아래에 세운다.
// 노드는 모두 회색이다.
const nodes = [
  { id: 'ftp-service', x: 16, y: 32, width: 144 },
  { id: 'port', x: 24, y: 108, width: 72 },
  { id: 'dir', x: 112, y: 108, width: 136 },
  { id: 'openssh', x: 168, y: 168, width: 96 },
  { id: 'client', x: 16, y: 232, width: 112 },
  { id: 'sftp-client', x: 152, y: 232, width: 112 },
]

const groups = [
  { id: 'iis-role', x: 8, y: 8, width: 264, height: 144, labelX: 16, labelY: 21 },
  { id: 'ftp-site', x: 16, y: 88, width: 248, height: 56, labelX: 24, labelY: 101 },
]

// 화살표는 클라이언트의 위 변에서 나와 접속하는 노드의 아래 변에 닿는다.
const paths: Record<string, string> = {
  ftps: 'M60 232 V140',
  sftp: 'M216 232 V200',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다.
const noteScenarios: Record<string, string> = {
  'install-key': 'install',
  'ftps-key': 'secure',
  'sftp-key': 'sftp',
}

const notes: Note[] = [
  { id: 'install-key', x: 16, y: 80, anchor: 'start' },
  { id: 'ftps-key', x: 68, y: 188, anchor: 'start' },
  { id: 'sftp-key', x: 208, y: 220, anchor: 'end' },
]

// 가로형은 역할 상자를 왼쪽에 두고, OpenSSH를 그 오른쪽 바깥에 FTP 사이트의 칸과 같은 높이로 둔다. 두 클라이언트는 맨 아래 줄에 둔다.
const wideNodes = [
  { id: 'ftp-service', x: 16, y: 32, width: 144 },
  { id: 'port', x: 24, y: 100, width: 72 },
  { id: 'dir', x: 112, y: 100, width: 152 },
  { id: 'openssh', x: 320, y: 100, width: 104 },
  { id: 'client', x: 16, y: 176, width: 112 },
  { id: 'sftp-client', x: 320, y: 176, width: 104 },
]

const wideGroups = [
  { id: 'iis-role', x: 8, y: 8, width: 296, height: 144, labelX: 16, labelY: 21 },
  { id: 'ftp-site', x: 16, y: 80, width: 280, height: 56, labelX: 24, labelY: 93 },
]

const widePaths: Record<string, string> = {
  ftps: 'M60 176 V132',
  sftp: 'M372 176 V132',
}

const wideNotes: Note[] = [
  { id: 'install-key', x: 168, y: 52, anchor: 'start' },
  { id: 'ftps-key', x: 68, y: 164, anchor: 'start' },
  { id: 'sftp-key', x: 364, y: 164, anchor: 'end' },
]

// 설치 자리: FTP 서버 역할 서비스와 FTP 사이트의 칸. 보안 연결: FTP 사이트의 칸과 FTP 클라이언트. SFTP: OpenSSH와 SFTP 클라이언트.
export const iisFtpSiteScenarios: DiagramScenario[] = [
  { id: 'install', nodes: ['ftp-service', 'port', 'dir'], paths: [] },
  { id: 'secure', nodes: ['port', 'dir', 'client'], paths: ['ftps'] },
  { id: 'sftp', nodes: ['openssh', 'sftp-client'], paths: ['sftp'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function IisFtpSiteDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-iis-ftp-site-arrow`
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
      scenarios={iisFtpSiteScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 216' : '0 0 280 272'}>
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
