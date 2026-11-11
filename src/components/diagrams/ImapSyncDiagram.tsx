import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['app-protocols-mail-file'].diagrams['imap-sync']

// 위에 메일 서버 mail.example.net 박스를 두고, 그 안에 user2의 메일함 INBOX(왼쪽)와 여행(오른쪽)을 박스로 나란히 둔다.
// INBOX 안의 메일은 처음 상태(읽지 않은 메일), 여행 안의 메일은 노트북이 읽고 옮긴 뒤의 상태(읽은 메일)다.
// 아래에는 user2의 노트북과 휴대폰을 두고, 둘 다 서버 박스에 접속선으로 잇는다. 노드는 모두 회색이다.
const nodes = [
  { id: 'mail-new', x: 24, y: 48, width: 104 },
  { id: 'mail-moved', x: 152, y: 48, width: 104 },
  { id: 'laptop', x: 24, y: 168, width: 104 },
  { id: 'phone', x: 152, y: 168, width: 104 },
]

const groups = [
  { id: 'server', x: 8, y: 8, width: 264, height: 96, labelX: 16, labelY: 20 },
  { id: 'inbox', x: 16, y: 28, width: 120, height: 64, labelX: 24, labelY: 40 },
  { id: 'trip', x: 144, y: 28, width: 120, height: 64, labelX: 152, labelY: 40 },
]

// 접속선 둘은 늘 보이고, 고른 시나리오의 화살표를 그 위에 겹쳐 그린다.
// 노트북에서 한 일은 노트북에서 서버로 가고(change), 서버 안에서 메일이 INBOX에서 여행으로 옮겨 가며(move), 휴대폰은 서버의 상태를 받아 본다(sync).
const paths: Record<string, string> = {
  'link-laptop': 'M76 168 V104',
  'link-phone': 'M204 104 V168',
  'change': 'M76 168 V104',
  'move': 'M128 64 H152',
  'sync': 'M204 104 V168',
}

const linkIds = ['link-laptop', 'link-phone']

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 그 시나리오를 골랐을 때만 보인다.
const noteScenarios: Record<string, string> = {
  'keep-note': 'keep',
  'move-note': 'change',
  'same-note': 'sync',
}

const notes: Note[] = [
  { id: 'keep-note', x: 140, y: 124, anchor: 'middle' },
  { id: 'move-note', x: 84, y: 140, anchor: 'start' },
  { id: 'same-note', x: 212, y: 156, anchor: 'start' },
]

// 가로형은 같은 배치를 넓힌다. 서버 박스가 위 줄 전체를 차지하고, 두 기기는 각자 접속하는 메일함 아래에 선다.
const wideNodes = [
  { id: 'mail-new', x: 62, y: 44, width: 104 },
  { id: 'mail-moved', x: 274, y: 44, width: 104 },
  { id: 'laptop', x: 62, y: 144, width: 104 },
  { id: 'phone', x: 274, y: 144, width: 104 },
]

const wideGroups = [
  { id: 'server', x: 8, y: 8, width: 424, height: 88, labelX: 16, labelY: 20 },
  { id: 'inbox', x: 24, y: 28, width: 180, height: 56, labelX: 32, labelY: 40 },
  { id: 'trip', x: 236, y: 28, width: 180, height: 56, labelX: 244, labelY: 40 },
]

const widePaths: Record<string, string> = {
  'link-laptop': 'M114 144 V96',
  'link-phone': 'M326 96 V144',
  'change': 'M114 144 V96',
  'move': 'M166 60 H274',
  'sync': 'M326 96 V144',
}

const wideNotes: Note[] = [
  { id: 'keep-note', x: 220, y: 112, anchor: 'middle' },
  { id: 'move-note', x: 122, y: 128, anchor: 'start' },
  { id: 'same-note', x: 334, y: 128, anchor: 'start' },
]

// nodes에는 선명하게 둘 노드와 접속선을 함께 적는다.
// ① 서버에 둔다 — 처음 메일은 서버의 INBOX에 있다. ② 한 기기에서 — 노트북이 읽고 옮긴 일이 서버의 메일함을 바꾼다.
// ③ 다른 기기에서 — 휴대폰도 서버의 메일함을 보므로 여행에 든 읽은 메일을 본다.
export const imapSyncScenarios: DiagramScenario[] = [
  { id: 'keep', nodes: ['mail-new'], paths: [] },
  { id: 'change', nodes: ['laptop', 'mail-moved', 'link-laptop'], paths: ['change', 'move'] },
  { id: 'sync', nodes: ['phone', 'mail-moved', 'link-phone'], paths: ['sync'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ImapSyncDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-imap-sync-arrow`
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
      scenarios={imapSyncScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 184' : '0 0 280 208'}>
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

          {linkIds.map((id) => (
            <path key={id} data-link={id} d={layoutPaths[id]} className="fill-none stroke-muted" strokeWidth="1.5" opacity={opacityOf(id)} />
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
