import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ports'].diagrams['well-known-ports']

// 세로형은 표 하나다 — 서비스 하나가 한 줄이고, 왼쪽부터 이름·기본 포트 번호·전송 계층 프로토콜 칸을 빈틈없이 잇는다.
// 줄은 본문 목록과 같은 차례로 위에서 아래로 맞붙고, 열 이름은 표 위의 곁말이다. 노드는 모두 회색이고 경로는 없다.
const nodes = [
  { id: 'ftp-name', x: 8, y: 28, width: 80 },
  { id: 'ftp-port', x: 88, y: 28, width: 96 },
  { id: 'ftp-transport', x: 184, y: 28, width: 88 },
  { id: 'ssh-name', x: 8, y: 60, width: 80 },
  { id: 'ssh-port', x: 88, y: 60, width: 96 },
  { id: 'ssh-transport', x: 184, y: 60, width: 88 },
  { id: 'telnet-name', x: 8, y: 92, width: 80 },
  { id: 'telnet-port', x: 88, y: 92, width: 96 },
  { id: 'telnet-transport', x: 184, y: 92, width: 88 },
  { id: 'smtp-name', x: 8, y: 124, width: 80 },
  { id: 'smtp-port', x: 88, y: 124, width: 96 },
  { id: 'smtp-transport', x: 184, y: 124, width: 88 },
  { id: 'dns-name', x: 8, y: 156, width: 80 },
  { id: 'dns-port', x: 88, y: 156, width: 96 },
  { id: 'dns-transport', x: 184, y: 156, width: 88 },
  { id: 'dhcp-name', x: 8, y: 188, width: 80 },
  { id: 'dhcp-port', x: 88, y: 188, width: 96 },
  { id: 'dhcp-transport', x: 184, y: 188, width: 88 },
  { id: 'http-name', x: 8, y: 220, width: 80 },
  { id: 'http-port', x: 88, y: 220, width: 96 },
  { id: 'http-transport', x: 184, y: 220, width: 88 },
  { id: 'https-name', x: 8, y: 252, width: 80 },
  { id: 'https-port', x: 88, y: 252, width: 96 },
  { id: 'https-transport', x: 184, y: 252, width: 88 },
]

// 열 이름은 늘 보이고 선명하다. 글은 JSON의 같은 key에서 읽는다.
type Note = { id: string, key: string, column: string, x: number, y: number }
const notes: Note[] = [
  { id: 'col-name', key: 'col-name', column: 'name', x: 48, y: 20 },
  { id: 'col-port', key: 'col-port', column: 'port', x: 136, y: 20 },
  { id: 'col-transport', key: 'col-transport', column: 'transport', x: 228, y: 20 },
]

// 가로형은 표를 둘로 나눠 나란히 둔다 — 왼쪽 표에 FTP·SSH·Telnet·SMTP, 오른쪽 표에 DNS·DHCP·HTTP·HTTPS. 표마다 위에 열 이름이 있다.
const wideNodes = [
  { id: 'ftp-name', x: 8, y: 28, width: 64 },
  { id: 'ftp-port', x: 72, y: 28, width: 64 },
  { id: 'ftp-transport', x: 136, y: 28, width: 80 },
  { id: 'ssh-name', x: 8, y: 60, width: 64 },
  { id: 'ssh-port', x: 72, y: 60, width: 64 },
  { id: 'ssh-transport', x: 136, y: 60, width: 80 },
  { id: 'telnet-name', x: 8, y: 92, width: 64 },
  { id: 'telnet-port', x: 72, y: 92, width: 64 },
  { id: 'telnet-transport', x: 136, y: 92, width: 80 },
  { id: 'smtp-name', x: 8, y: 124, width: 64 },
  { id: 'smtp-port', x: 72, y: 124, width: 64 },
  { id: 'smtp-transport', x: 136, y: 124, width: 80 },
  { id: 'dns-name', x: 224, y: 28, width: 56 },
  { id: 'dns-port', x: 280, y: 28, width: 64 },
  { id: 'dns-transport', x: 344, y: 28, width: 88 },
  { id: 'dhcp-name', x: 224, y: 60, width: 56 },
  { id: 'dhcp-port', x: 280, y: 60, width: 64 },
  { id: 'dhcp-transport', x: 344, y: 60, width: 88 },
  { id: 'http-name', x: 224, y: 92, width: 56 },
  { id: 'http-port', x: 280, y: 92, width: 64 },
  { id: 'http-transport', x: 344, y: 92, width: 88 },
  { id: 'https-name', x: 224, y: 124, width: 56 },
  { id: 'https-port', x: 280, y: 124, width: 64 },
  { id: 'https-transport', x: 344, y: 124, width: 88 },
]

const wideNotes: Note[] = [
  { id: 'col-name', key: 'col-name', column: 'name', x: 40, y: 20 },
  { id: 'col-port', key: 'col-port', column: 'port', x: 104, y: 20 },
  { id: 'col-transport', key: 'col-transport', column: 'transport', x: 176, y: 20 },
  { id: 'col-name-2', key: 'col-name', column: 'name', x: 252, y: 20 },
  { id: 'col-port-2', key: 'col-port', column: 'port', x: 312, y: 20 },
  { id: 'col-transport-2', key: 'col-transport', column: 'transport', x: 388, y: 20 },
]

// 묶음을 고르면 그 서비스들의 줄만 선명하다 — 웹(HTTP·HTTPS), 원격 접속과 파일(FTP·SSH·Telnet), 메일·이름·주소(SMTP·DNS·DHCP).
export const wellKnownPortsScenarios: DiagramScenario[] = [
  { id: 'web', nodes: ['http-name', 'http-port', 'http-transport', 'https-name', 'https-port', 'https-transport'], paths: [] },
  { id: 'remote-file', nodes: ['ftp-name', 'ftp-port', 'ftp-transport', 'ssh-name', 'ssh-port', 'ssh-transport', 'telnet-name', 'telnet-port', 'telnet-transport'], paths: [] },
  { id: 'mail-name-address', nodes: ['smtp-name', 'smtp-port', 'smtp-transport', 'dns-name', 'dns-port', 'dns-transport', 'dhcp-name', 'dhcp-port', 'dhcp-transport'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function WellKnownPortsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={wellKnownPortsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 164' : '0 0 280 292'}>
          {layoutNotes.map((note) => (
            <text key={note.id} data-note={note.id} data-column={note.column} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9" opacity="1">
              {text.notes![note.key]}
            </text>
          ))}

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
