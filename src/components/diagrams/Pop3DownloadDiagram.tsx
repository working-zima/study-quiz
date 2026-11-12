import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['app-protocols-mail-file'].diagrams['pop3-download']

// 세로형은 왼쪽 열에 mail.example.net의 user2 메일함을, 오른쪽 열에 user2의 기기를 둔다.
// 위 줄은 노트북이 내려받는 때(처음의 메일함 → 노트북), 아래 줄은 QUIT 뒤(지운 뒤의 메일함 ← 휴대폰)다.
// 메일 한 통이 노드 하나다. 서버 쪽 메일과 노트북 쪽 메일은 서로 다른 노드를 다른 자리에 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'mail1-server', x: 22, y: 28, width: 88 },
  { id: 'mail2-server', x: 22, y: 72, width: 88 },
  { id: 'mail1-laptop', x: 174, y: 28, width: 88 },
  { id: 'mail2-laptop', x: 174, y: 72, width: 88 },
  { id: 'mailbox-after', x: 8, y: 168, width: 116 },
  { id: 'phone', x: 164, y: 168, width: 108 },
]

const groups = [
  { id: 'server-before', x: 8, y: 8, width: 116, height: 112, labelX: 16, labelY: 20 },
  { id: 'laptop', x: 164, y: 8, width: 108, height: 112, labelX: 172, labelY: 20 },
]

// 화살표는 시나리오마다 보인다. 내려받기는 메일함에서 노트북으로, 지우기는 처음의 메일함에서 QUIT 뒤의 메일함으로, 다른 기기는 휴대폰에서 메일함으로 간다.
const paths: Record<string, string> = {
  'download': 'M124 64 H164',
  'delete': 'M66 120 V168',
  'open': 'M164 184 H124',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 그 시나리오를 골랐을 때만 보인다.
const noteScenarios: Record<string, string> = {
  'retr-note': 'download',
  'quit-note': 'delete',
  'empty-note': 'other-device',
}

const notes: Note[] = [
  { id: 'retr-note', x: 144, y: 58, anchor: 'middle' },
  { id: 'quit-note', x: 74, y: 148, anchor: 'start' },
  { id: 'empty-note', x: 66, y: 216, anchor: 'middle' },
]

// 가로형은 위 줄에 처음의 메일함(메일 두 통을 나란히)과 노트북을 두고, 아래 줄에 QUIT 뒤의 메일함과 휴대폰을 둔다.
const wideNodes = [
  { id: 'mail1-server', x: 20, y: 28, width: 72 },
  { id: 'mail2-server', x: 100, y: 28, width: 72 },
  { id: 'mail1-laptop', x: 268, y: 28, width: 72 },
  { id: 'mail2-laptop', x: 348, y: 28, width: 72 },
  { id: 'mailbox-after', x: 40, y: 120, width: 112 },
  { id: 'phone', x: 288, y: 120, width: 112 },
]

const wideGroups = [
  { id: 'server-before', x: 8, y: 8, width: 176, height: 64, labelX: 16, labelY: 20 },
  { id: 'laptop', x: 256, y: 8, width: 176, height: 64, labelX: 264, labelY: 20 },
]

const widePaths: Record<string, string> = {
  'download': 'M184 40 H256',
  'delete': 'M96 72 V120',
  'open': 'M288 136 H152',
}

const wideNotes: Note[] = [
  { id: 'retr-note', x: 220, y: 34, anchor: 'middle' },
  { id: 'quit-note', x: 104, y: 100, anchor: 'start' },
  { id: 'empty-note', x: 96, y: 168, anchor: 'middle' },
]

// ① 내려받기 — 서버의 두 통을 노트북으로 가져온다(RETR). ② 지우기 — QUIT 뒤 서버가 지운다. 서버 쪽 메일 노드는 흐리다.
// ③ 다른 기기 — 휴대폰이 같은 메일함에 접속해도 비어 있다. 노트북 쪽 메일 노드는 흐리다.
export const pop3DownloadScenarios: DiagramScenario[] = [
  { id: 'download', nodes: ['mail1-server', 'mail2-server', 'mail1-laptop', 'mail2-laptop'], paths: ['download'] },
  { id: 'delete', nodes: ['mailbox-after', 'mail1-laptop', 'mail2-laptop'], paths: ['delete'] },
  { id: 'other-device', nodes: ['mailbox-after', 'phone'], paths: ['open'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function Pop3DownloadDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-pop3-download-arrow`
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
      scenarios={pop3DownloadScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 176' : '0 0 280 224'}>
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
