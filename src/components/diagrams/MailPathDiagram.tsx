import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['app-protocols-mail-file'].diagrams['mail-path']

// 메일이 지나는 길을 차례대로 잇는다 — 보내는 사람의 메일 클라이언트 → mail.example.com → mail.example.net(박스)의 메일함 → 받는 사람의 메일 클라이언트.
// 받는 쪽 메일 서버는 박스로 그리고 그 안에 받는 사람의 메일함을 둔다. 구간마다 하는 일과 프로토콜은 선 옆 곁말이 늘 보인다. 노드는 모두 회색이다.
const nodes = [
  { id: 'sender-client', x: 48, y: 8, width: 184 },
  { id: 'sender-server', x: 82, y: 72, width: 116 },
  { id: 'mailbox', x: 90, y: 156, width: 100 },
  { id: 'receiver-client', x: 48, y: 232, width: 184 },
]

const groups = [
  { id: 'receiver-host', x: 40, y: 136, width: 200, height: 64, labelX: 48, labelY: 148 },
]

// 연결선 셋은 늘 보이고, 고른 구간의 화살표를 그 위에 겹쳐 그린다.
const paths: Record<string, string> = {
  'link-submit': 'M140 40 V72',
  'link-relay': 'M140 104 V136',
  'link-fetch': 'M140 188 V232',
  'submit': 'M140 40 V72',
  'relay': 'M140 104 V136',
  'fetch': 'M140 188 V232',
}

const linkIds = ['link-submit', 'link-relay', 'link-fetch']

// 구간의 곁말은 시나리오와 상관없이 늘 보인다.
type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

const notes: Note[] = [
  { id: 'proto-submit', x: 148, y: 60, anchor: 'start' },
  { id: 'proto-relay', x: 148, y: 124, anchor: 'start' },
  { id: 'proto-fetch', x: 148, y: 220, anchor: 'start' },
]

// 가로형은 위 줄에 보내는 쪽 둘을 왼쪽에서 오른쪽으로 두고, 오른쪽 끝에서 아래로 받는 쪽 메일 서버와 받는 사람으로 내려간다.
const wideNodes = [
  { id: 'sender-client', x: 8, y: 8, width: 184 },
  { id: 'sender-server', x: 316, y: 8, width: 116 },
  { id: 'mailbox', x: 324, y: 92, width: 100 },
  { id: 'receiver-client', x: 248, y: 168, width: 184 },
]

const wideGroups = [
  { id: 'receiver-host', x: 300, y: 72, width: 132, height: 64, labelX: 308, labelY: 84 },
]

const widePaths: Record<string, string> = {
  'link-submit': 'M192 24 H316',
  'link-relay': 'M374 40 V72',
  'link-fetch': 'M374 124 V168',
  'submit': 'M192 24 H316',
  'relay': 'M374 40 V72',
  'fetch': 'M374 124 V168',
}

const wideNotes: Note[] = [
  { id: 'proto-submit', x: 254, y: 16, anchor: 'middle' },
  { id: 'proto-relay', x: 366, y: 60, anchor: 'end' },
  { id: 'proto-fetch', x: 366, y: 156, anchor: 'end' },
]

// nodes에는 선명하게 둘 노드와 연결선을 함께 적는다.
// ① 보내기 — 메일을 가진 쪽이 SMTP로 두 번 넘긴다. ② 메일함 — 받는 쪽 서버의 메일함에 머문다. ③ 가져오기 — 받는 사람이 POP3나 IMAP으로 가져온다.
export const mailPathScenarios: DiagramScenario[] = [
  { id: 'send', nodes: ['sender-client', 'sender-server', 'link-submit', 'link-relay'], paths: ['submit', 'relay'] },
  { id: 'store', nodes: ['mailbox'], paths: [] },
  { id: 'fetch', nodes: ['mailbox', 'receiver-client', 'link-fetch'], paths: ['fetch'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function MailPathDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-mail-path-arrow`
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
      scenarios={mailPathScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 208' : '0 0 280 272'}>
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

          {layoutNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
