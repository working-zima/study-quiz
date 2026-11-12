import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['app-protocols-mail-file'].diagrams['ftp-modes']

// 맨 위에 클라이언트와 서버의 주소를 머리 노드로 두고, 그 아래 왼쪽에 클라이언트, 오른쪽에 서버 기둥(그룹 박스)을 세운다.
// 두 기둥 사이 위쪽 박스가 능동 모드, 아래쪽 박스가 수동 모드다. 박스마다 제어 연결로 오가는 포트 알림과 데이터 연결을
// 다른 노드로 위에서 아래로 놓는다. 화살표는 메시지가 가는 방향, 데이터 연결은 연결을 여는 쪽에서 시작한다. 노드는 모두 회색이다.
const nodes = [
  { id: 'client', x: 8, y: 8, width: 124 },
  { id: 'server', x: 148, y: 8, width: 124 },
  { id: 'port-cmd', x: 72, y: 76, width: 136 },
  { id: 'active-data', x: 72, y: 116, width: 136 },
  { id: 'pasv-cmd', x: 72, y: 208, width: 136 },
  { id: 'pasv-reply', x: 72, y: 248, width: 136 },
  { id: 'passive-data', x: 72, y: 288, width: 136 },
]

const groups = [
  { id: 'client-side', x: 8, y: 48, width: 56, height: 308, labelX: 10, labelY: 60 },
  { id: 'server-side', x: 216, y: 48, width: 56, height: 308, labelX: 220, labelY: 60 },
  { id: 'active', x: 68, y: 56, width: 144, height: 120, labelX: 72, labelY: 69 },
  { id: 'passive', x: 68, y: 188, width: 144, height: 160, labelX: 72, labelY: 201 },
]

// 노드마다 화살표 둘 — 보내는(여는) 쪽 기둥에서 노드로(-out), 노드에서 받는 쪽 기둥으로(-in).
const paths: Record<string, string> = {
  'port-cmd-out': 'M64 92 H72',
  'port-cmd-in': 'M208 92 H216',
  'active-data-out': 'M216 132 H208',
  'active-data-in': 'M72 132 H64',
  'pasv-cmd-out': 'M64 224 H72',
  'pasv-cmd-in': 'M208 224 H216',
  'pasv-reply-out': 'M216 264 H208',
  'pasv-reply-in': 'M72 264 H64',
  'passive-data-out': 'M64 304 H72',
  'passive-data-in': 'M208 304 H216',
}

type Note = { id: string, x: number, y: number }

// 곁말은 자기 시나리오를 골랐을 때만 모드 박스 안, 데이터 연결 노드 아래에 보인다.
const noteScenarios: Record<string, string> = {
  'active-note': 'active',
  'passive-note': 'passive',
}

const notes: Note[] = [
  { id: 'active-note', x: 140, y: 162 },
  { id: 'passive-note', x: 140, y: 334 },
]

// 가로형은 기둥과 노드를 넓힐 뿐 차례와 높이는 세로형과 같다.
const wideNodes = [
  { id: 'client', x: 8, y: 8, width: 124 },
  { id: 'server', x: 308, y: 8, width: 124 },
  { id: 'port-cmd', x: 120, y: 76, width: 200 },
  { id: 'active-data', x: 120, y: 116, width: 200 },
  { id: 'pasv-cmd', x: 120, y: 208, width: 200 },
  { id: 'pasv-reply', x: 120, y: 248, width: 200 },
  { id: 'passive-data', x: 120, y: 288, width: 200 },
]

const wideGroups = [
  { id: 'client-side', x: 8, y: 48, width: 88, height: 308, labelX: 12, labelY: 60 },
  { id: 'server-side', x: 344, y: 48, width: 88, height: 308, labelX: 348, labelY: 60 },
  { id: 'active', x: 104, y: 56, width: 232, height: 120, labelX: 112, labelY: 69 },
  { id: 'passive', x: 104, y: 188, width: 232, height: 160, labelX: 112, labelY: 201 },
]

const widePaths: Record<string, string> = {
  'port-cmd-out': 'M96 92 H120',
  'port-cmd-in': 'M320 92 H344',
  'active-data-out': 'M344 132 H320',
  'active-data-in': 'M120 132 H96',
  'pasv-cmd-out': 'M96 224 H120',
  'pasv-cmd-in': 'M320 224 H344',
  'pasv-reply-out': 'M344 264 H320',
  'pasv-reply-in': 'M120 264 H96',
  'passive-data-out': 'M96 304 H120',
  'passive-data-in': 'M320 304 H344',
}

const wideNotes: Note[] = [
  { id: 'active-note', x: 220, y: 162 },
  { id: 'passive-note', x: 220, y: 334 },
]

// 능동 모드 — 클라이언트가 PORT로 50002번을 알리고, 서버가 20번에서 그 포트로 데이터 연결을 연다(서버 → 클라이언트).
// 수동 모드 — 클라이언트가 PASV를 보내고 서버가 227로 50200번을 알리면, 클라이언트가 그 포트로 데이터 연결을 연다(클라이언트 → 서버).
export const ftpModesScenarios: DiagramScenario[] = [
  {
    id: 'active',
    nodes: ['client', 'server', 'port-cmd', 'active-data'],
    paths: ['port-cmd-out', 'port-cmd-in', 'active-data-out', 'active-data-in'],
  },
  {
    id: 'passive',
    nodes: ['client', 'server', 'pasv-cmd', 'pasv-reply', 'passive-data'],
    paths: ['pasv-cmd-out', 'pasv-cmd-in', 'pasv-reply-out', 'pasv-reply-in', 'passive-data-out', 'passive-data-in'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function FtpModesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-ftp-modes-arrow`
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
      scenarios={ftpModesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 364' : '0 0 280 364'}>
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
