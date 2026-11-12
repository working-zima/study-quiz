import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['app-protocols-mail-file'].diagrams['ssh-session']

// 맨 위에 사용자의 컴퓨터와 서버의 주소를 머리 노드로 두고, 그 아래 왼쪽에 클라이언트, 오른쪽에 서버 기둥(그룹 박스)을 세운다.
// 두 기둥 사이에는 SSH 접속의 차례를 위에서 아래로 놓는다 — TCP 연결, 서버의 호스트 키, 그리고 「암호화한 통로」 박스 안의
// 사용자 인증·명령·결과. 맨 아래 「Telnet으로 접속하면」 박스는 같은 서버에 Telnet으로 접속할 때의 견줄 거리다.
// 노드는 모두 회색이고, 암호화된 것과 아닌 것은 색이 아니라 곁말로 가른다.
const nodes = [
  { id: 'client', x: 8, y: 8, width: 124 },
  { id: 'server', x: 148, y: 8, width: 124 },
  { id: 'tcp', x: 76, y: 64, width: 128 },
  { id: 'hostkey', x: 76, y: 108, width: 128 },
  { id: 'userauth', x: 76, y: 168, width: 128 },
  { id: 'cmd', x: 76, y: 212, width: 128 },
  { id: 'res', x: 76, y: 256, width: 128 },
  { id: 'telnet', x: 76, y: 348, width: 128 },
  { id: 'tpw', x: 76, y: 392, width: 128 },
]

const groups = [
  { id: 'client-side', x: 8, y: 48, width: 56, height: 408, labelX: 10, labelY: 60 },
  { id: 'server-side', x: 216, y: 48, width: 56, height: 408, labelX: 220, labelY: 60 },
  { id: 'channel-box', x: 68, y: 148, width: 144, height: 164, labelX: 72, labelY: 161 },
  { id: 'telnet-box', x: 68, y: 328, width: 144, height: 120, labelX: 72, labelY: 341 },
]

// 노드마다 화살표 둘 — 보내는 쪽 기둥에서 노드로(-out), 노드에서 받는 쪽 기둥으로(-in).
// 호스트 키와 결과는 서버 → 클라이언트, 나머지는 클라이언트 → 서버로 간다.
const paths: Record<string, string> = {
  'tcp-out': 'M64 80 H76',
  'tcp-in': 'M204 80 H216',
  'hostkey-out': 'M216 124 H204',
  'hostkey-in': 'M76 124 H64',
  'userauth-out': 'M64 184 H76',
  'userauth-in': 'M204 184 H216',
  'cmd-out': 'M64 228 H76',
  'cmd-in': 'M204 228 H216',
  'res-out': 'M216 272 H204',
  'res-in': 'M76 272 H64',
  'telnet-out': 'M64 364 H76',
  'telnet-in': 'M204 364 H216',
  'tpw-out': 'M64 408 H76',
  'tpw-in': 'M204 408 H216',
}

type Note = { id: string, x: number, y: number }

// 곁말은 자기 시나리오를 골랐을 때만 자기 박스 안, 마지막 노드 아래에 보인다.
const noteScenarios: Record<string, string> = {
  'channel-note': 'channel',
  'telnet-note': 'telnet',
}

const notes: Note[] = [
  { id: 'channel-note', x: 140, y: 302 },
  { id: 'telnet-note', x: 140, y: 438 },
]

// 가로형은 기둥과 노드를 넓힐 뿐 차례와 높이는 세로형과 같다.
const wideNodes = [
  { id: 'client', x: 8, y: 8, width: 124 },
  { id: 'server', x: 308, y: 8, width: 124 },
  { id: 'tcp', x: 120, y: 64, width: 200 },
  { id: 'hostkey', x: 120, y: 108, width: 200 },
  { id: 'userauth', x: 120, y: 168, width: 200 },
  { id: 'cmd', x: 120, y: 212, width: 200 },
  { id: 'res', x: 120, y: 256, width: 200 },
  { id: 'telnet', x: 120, y: 348, width: 200 },
  { id: 'tpw', x: 120, y: 392, width: 200 },
]

const wideGroups = [
  { id: 'client-side', x: 8, y: 48, width: 88, height: 408, labelX: 12, labelY: 60 },
  { id: 'server-side', x: 344, y: 48, width: 88, height: 408, labelX: 348, labelY: 60 },
  { id: 'channel-box', x: 104, y: 148, width: 232, height: 164, labelX: 112, labelY: 161 },
  { id: 'telnet-box', x: 104, y: 328, width: 232, height: 120, labelX: 112, labelY: 341 },
]

const widePaths: Record<string, string> = {
  'tcp-out': 'M96 80 H120',
  'tcp-in': 'M320 80 H344',
  'hostkey-out': 'M344 124 H320',
  'hostkey-in': 'M120 124 H96',
  'userauth-out': 'M96 184 H120',
  'userauth-in': 'M320 184 H344',
  'cmd-out': 'M96 228 H120',
  'cmd-in': 'M320 228 H344',
  'res-out': 'M344 272 H320',
  'res-in': 'M120 272 H96',
  'telnet-out': 'M96 364 H120',
  'telnet-in': 'M320 364 H344',
  'tpw-out': 'M96 408 H120',
  'tpw-in': 'M320 408 H344',
}

const wideNotes: Note[] = [
  { id: 'channel-note', x: 220, y: 302 },
  { id: 'telnet-note', x: 220, y: 438 },
]

// ① 서버 확인 — TCP 연결과 서버의 호스트 키. ② 사용자 확인 — 통로 안의 사용자 인증. ③ 암호화한 통로 — 명령과 결과.
// ④ Telnet과 견주기 — Telnet 연결과 그대로 지나가는 로그인 암호.
export const sshSessionScenarios: DiagramScenario[] = [
  {
    id: 'server-auth',
    nodes: ['client', 'server', 'tcp', 'hostkey'],
    paths: ['tcp-out', 'tcp-in', 'hostkey-out', 'hostkey-in'],
  },
  {
    id: 'user-auth',
    nodes: ['client', 'server', 'userauth'],
    paths: ['userauth-out', 'userauth-in'],
  },
  {
    id: 'channel',
    nodes: ['client', 'server', 'cmd', 'res'],
    paths: ['cmd-out', 'cmd-in', 'res-out', 'res-in'],
  },
  {
    id: 'telnet',
    nodes: ['client', 'server', 'telnet', 'tpw'],
    paths: ['telnet-out', 'telnet-in', 'tpw-out', 'tpw-in'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function SshSessionDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-ssh-session-arrow`
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
      scenarios={sshSessionScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 464' : '0 0 280 464'}>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
