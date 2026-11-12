import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['app-protocols-mail-file'].diagrams['ftp-connections']

// 맨 위에 클라이언트와 서버의 주소를 머리 노드로 두고, 그 아래 왼쪽에 클라이언트, 오른쪽에 서버 기둥(그룹 박스)을 세운다.
// 두 기둥 사이에는 접속부터 끝까지의 차례를 위에서 아래로 놓는다. 맨 위가 클라이언트가 여는 제어 연결이고,
// 박스 밖의 다른 노드는 그 제어 연결로 보내는 명령이다. 파일 내용은 「데이터 연결」 박스 안의 노드로, 파일마다 다른 박스·노드에 둔다.
// 노드는 모두 회색이다.
const nodes = [
  { id: 'client', x: 8, y: 8, width: 124 },
  { id: 'server', x: 148, y: 8, width: 124 },
  { id: 'control', x: 76, y: 64, width: 128 },
  { id: 'user-pass', x: 76, y: 108, width: 128 },
  { id: 'retr1', x: 76, y: 152, width: 128 },
  { id: 'data1', x: 76, y: 216, width: 128 },
  { id: 'retr2', x: 76, y: 280, width: 128 },
  { id: 'data2', x: 76, y: 344, width: 128 },
  { id: 'quit', x: 76, y: 408, width: 128 },
]

const groups = [
  { id: 'client-side', x: 8, y: 48, width: 56, height: 400, labelX: 10, labelY: 60 },
  { id: 'server-side', x: 216, y: 48, width: 56, height: 400, labelX: 220, labelY: 60 },
  { id: 'data1-box', x: 68, y: 196, width: 144, height: 72, labelX: 72, labelY: 209 },
  { id: 'data2-box', x: 68, y: 324, width: 144, height: 72, labelX: 72, labelY: 337 },
]

// 노드마다 화살표 둘 — 보내는 쪽 기둥에서 노드로(-out), 노드에서 받는 쪽 기둥으로(-in).
// 명령은 클라이언트 → 서버, 파일 내용은 서버 → 클라이언트로 간다.
const paths: Record<string, string> = {
  'control-out': 'M64 80 H76',
  'control-in': 'M204 80 H216',
  'user-pass-out': 'M64 124 H76',
  'user-pass-in': 'M204 124 H216',
  'retr1-out': 'M64 168 H76',
  'retr1-in': 'M204 168 H216',
  'data1-out': 'M216 232 H204',
  'data1-in': 'M76 232 H64',
  'retr2-out': 'M64 296 H76',
  'retr2-in': 'M204 296 H216',
  'data2-out': 'M216 360 H204',
  'data2-in': 'M76 360 H64',
  'quit-out': 'M64 424 H76',
  'quit-in': 'M204 424 H216',
}

type Note = { id: string, x: number, y: number }

// 곁말은 자기 시나리오를 골랐을 때만 데이터 연결 박스 안, 파일 내용 노드 아래에 보인다.
const noteScenarios: Record<string, string> = {
  'data1-note': 'data',
  'data2-note': 'next-file',
}

const notes: Note[] = [
  { id: 'data1-note', x: 140, y: 262 },
  { id: 'data2-note', x: 140, y: 390 },
]

// 가로형은 기둥과 노드를 넓힐 뿐 차례와 높이는 세로형과 같다.
const wideNodes = [
  { id: 'client', x: 8, y: 8, width: 124 },
  { id: 'server', x: 308, y: 8, width: 124 },
  { id: 'control', x: 120, y: 64, width: 200 },
  { id: 'user-pass', x: 120, y: 108, width: 200 },
  { id: 'retr1', x: 120, y: 152, width: 200 },
  { id: 'data1', x: 120, y: 216, width: 200 },
  { id: 'retr2', x: 120, y: 280, width: 200 },
  { id: 'data2', x: 120, y: 344, width: 200 },
  { id: 'quit', x: 120, y: 408, width: 200 },
]

const wideGroups = [
  { id: 'client-side', x: 8, y: 48, width: 88, height: 400, labelX: 12, labelY: 60 },
  { id: 'server-side', x: 344, y: 48, width: 88, height: 400, labelX: 348, labelY: 60 },
  { id: 'data1-box', x: 104, y: 196, width: 232, height: 72, labelX: 112, labelY: 209 },
  { id: 'data2-box', x: 104, y: 324, width: 232, height: 72, labelX: 112, labelY: 337 },
]

const widePaths: Record<string, string> = {
  'control-out': 'M96 80 H120',
  'control-in': 'M320 80 H344',
  'user-pass-out': 'M96 124 H120',
  'user-pass-in': 'M320 124 H344',
  'retr1-out': 'M96 168 H120',
  'retr1-in': 'M320 168 H344',
  'data1-out': 'M344 232 H320',
  'data1-in': 'M120 232 H96',
  'retr2-out': 'M96 296 H120',
  'retr2-in': 'M320 296 H344',
  'data2-out': 'M344 360 H320',
  'data2-in': 'M120 360 H96',
  'quit-out': 'M96 424 H120',
  'quit-in': 'M320 424 H344',
}

const wideNotes: Note[] = [
  { id: 'data1-note', x: 220, y: 262 },
  { id: 'data2-note', x: 220, y: 390 },
]

// ① 제어 연결 — 제어 연결과 그 위로 보내는 명령 모두. ② 데이터 연결 — RETR report.txt와 그때 맺은 데이터 연결.
// ③ 다음 파일 — RETR notes.txt와 새로 맺은 데이터 연결. 제어 연결 노드는 세 시나리오 모두 선명하다(접속하는 동안 이어진다).
export const ftpConnectionsScenarios: DiagramScenario[] = [
  {
    id: 'control',
    nodes: ['client', 'server', 'control', 'user-pass', 'retr1', 'retr2', 'quit'],
    paths: ['control-out', 'control-in', 'user-pass-out', 'user-pass-in', 'retr1-out', 'retr1-in', 'retr2-out', 'retr2-in', 'quit-out', 'quit-in'],
  },
  {
    id: 'data',
    nodes: ['client', 'server', 'control', 'retr1', 'data1'],
    paths: ['retr1-out', 'retr1-in', 'data1-out', 'data1-in'],
  },
  {
    id: 'next-file',
    nodes: ['client', 'server', 'control', 'retr2', 'data2'],
    paths: ['retr2-out', 'retr2-in', 'data2-out', 'data2-in'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function FtpConnectionsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-ftp-connections-arrow`
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
      scenarios={ftpConnectionsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 456' : '0 0 280 456'}>
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
