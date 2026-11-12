import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['app-protocols-mgmt-security'].diagrams['sip-call']

// 맨 위에 거는 쪽과 받는 쪽의 SIP 주소를 머리 노드로 두고, 그 아래 왼쪽에 거는 쪽, 오른쪽에 받는 쪽 기둥(그룹 박스)을 세운다.
// SIP 주소 둘이 280 폭 한 줄에 들지 않아, 세로형에서는 거는 쪽 주소를 왼쪽 위에, 받는 쪽 주소를 그 아래 오른쪽에 엇갈려 둔다.
// 두 기둥 사이에 위에서 아래로 통화 맺기(INVITE·180 Ringing·200 OK·ACK), 통화 중(RTP로 오가는 음성과 영상), 통화 끝내기(BYE·200 OK) 박스를 놓는다.
// 본문의 예에서는 받는 쪽(user2)이 먼저 끊어 BYE를 보내고, 거는 쪽(user1)이 200 OK로 답한다. 노드는 모두 회색이고, 방향은 화살표로 가른다.
const nodes = [
  { id: 'caller', x: 8, y: 8, width: 152 },
  { id: 'callee', x: 120, y: 48, width: 152 },
  { id: 'invite', x: 76, y: 120, width: 128 },
  { id: 'ringing', x: 76, y: 164, width: 128 },
  { id: 'ok-setup', x: 76, y: 208, width: 128 },
  { id: 'ack', x: 76, y: 252, width: 128 },
  { id: 'media', x: 76, y: 344, width: 128 },
  { id: 'bye', x: 76, y: 436, width: 128 },
  { id: 'ok-bye', x: 76, y: 480, width: 128 },
]

const groups = [
  { id: 'caller-side', x: 8, y: 88, width: 56, height: 464, labelX: 10, labelY: 100 },
  { id: 'callee-side', x: 216, y: 88, width: 56, height: 464, labelX: 220, labelY: 100 },
  { id: 'setup-box', x: 68, y: 100, width: 144, height: 212, labelX: 72, labelY: 113 },
  { id: 'media-box', x: 68, y: 324, width: 144, height: 80, labelX: 72, labelY: 337 },
  { id: 'teardown-box', x: 68, y: 416, width: 144, height: 124, labelX: 72, labelY: 429 },
]

// SIP 메시지 노드마다 화살표 둘 — 보내는 쪽 기둥에서 노드로(-out), 노드에서 받는 쪽 기둥으로(-in).
// INVITE·ACK·끝의 200 OK는 거는 쪽 → 받는 쪽, 180 Ringing·첫 200 OK·BYE는 받는 쪽 → 거는 쪽으로 간다.
// 음성과 영상은 양쪽이 서로에게 보내므로, RTP 노드의 위쪽 줄은 거는 쪽 → 받는 쪽, 아래쪽 줄은 받는 쪽 → 거는 쪽 화살표다.
const paths: Record<string, string> = {
  'invite-out': 'M64 136 H76',
  'invite-in': 'M204 136 H216',
  'ringing-out': 'M216 180 H204',
  'ringing-in': 'M76 180 H64',
  'ok-setup-out': 'M216 224 H204',
  'ok-setup-in': 'M76 224 H64',
  'ack-out': 'M64 268 H76',
  'ack-in': 'M204 268 H216',
  'media-to-callee-out': 'M64 354 H76',
  'media-to-callee-in': 'M204 354 H216',
  'media-to-caller-out': 'M216 366 H204',
  'media-to-caller-in': 'M76 366 H64',
  'bye-out': 'M216 452 H204',
  'bye-in': 'M76 452 H64',
  'ok-bye-out': 'M64 496 H76',
  'ok-bye-in': 'M204 496 H216',
}

type Note = { id: string, x: number, y: number }

// 곁말은 자기 시나리오를 골랐을 때만, 그 시나리오의 마지막 노드 아래 빈자리에 보인다.
const noteScenarios: Record<string, string> = {
  'setup-note': 'setup',
  'media-note': 'media',
  'teardown-note': 'teardown',
}

const notes: Note[] = [
  { id: 'setup-note', x: 140, y: 304 },
  { id: 'media-note', x: 140, y: 396 },
  { id: 'teardown-note', x: 140, y: 532 },
]

// 가로형은 두 SIP 주소를 한 줄에 나란히 두므로 그 아래 모든 것이 40씩 올라간다. 차례와 간격은 세로형과 같다.
const wideNodes = [
  { id: 'caller', x: 8, y: 8, width: 172 },
  { id: 'callee', x: 260, y: 8, width: 172 },
  { id: 'invite', x: 120, y: 80, width: 200 },
  { id: 'ringing', x: 120, y: 124, width: 200 },
  { id: 'ok-setup', x: 120, y: 168, width: 200 },
  { id: 'ack', x: 120, y: 212, width: 200 },
  { id: 'media', x: 120, y: 304, width: 200 },
  { id: 'bye', x: 120, y: 396, width: 200 },
  { id: 'ok-bye', x: 120, y: 440, width: 200 },
]

const wideGroups = [
  { id: 'caller-side', x: 8, y: 48, width: 88, height: 464, labelX: 12, labelY: 60 },
  { id: 'callee-side', x: 344, y: 48, width: 88, height: 464, labelX: 348, labelY: 60 },
  { id: 'setup-box', x: 104, y: 60, width: 232, height: 212, labelX: 112, labelY: 73 },
  { id: 'media-box', x: 104, y: 284, width: 232, height: 80, labelX: 112, labelY: 297 },
  { id: 'teardown-box', x: 104, y: 376, width: 232, height: 124, labelX: 112, labelY: 389 },
]

const widePaths: Record<string, string> = {
  'invite-out': 'M96 96 H120',
  'invite-in': 'M320 96 H344',
  'ringing-out': 'M344 140 H320',
  'ringing-in': 'M120 140 H96',
  'ok-setup-out': 'M344 184 H320',
  'ok-setup-in': 'M120 184 H96',
  'ack-out': 'M96 228 H120',
  'ack-in': 'M320 228 H344',
  'media-to-callee-out': 'M96 314 H120',
  'media-to-callee-in': 'M320 314 H344',
  'media-to-caller-out': 'M344 326 H320',
  'media-to-caller-in': 'M120 326 H96',
  'bye-out': 'M344 412 H320',
  'bye-in': 'M120 412 H96',
  'ok-bye-out': 'M96 456 H120',
  'ok-bye-in': 'M320 456 H344',
}

const wideNotes: Note[] = [
  { id: 'setup-note', x: 220, y: 264 },
  { id: 'media-note', x: 220, y: 356 },
  { id: 'teardown-note', x: 220, y: 492 },
]

// 맺기 — INVITE로 부르고, 180 Ringing·200 OK로 답하고, ACK로 확인해 통화를 맺는다. 통화 — 음성과 영상은 SIP가 아니라 RTP로 양쪽이 서로에게 보낸다.
// 끝내기 — 한쪽이 BYE를 보내고 상대가 200 OK로 답해 통화를 끝낸다.
export const sipCallScenarios: DiagramScenario[] = [
  {
    id: 'setup',
    nodes: ['caller', 'callee', 'invite', 'ringing', 'ok-setup', 'ack'],
    paths: ['invite-out', 'invite-in', 'ringing-out', 'ringing-in', 'ok-setup-out', 'ok-setup-in', 'ack-out', 'ack-in'],
  },
  {
    id: 'media',
    nodes: ['caller', 'callee', 'media'],
    paths: ['media-to-callee-out', 'media-to-callee-in', 'media-to-caller-out', 'media-to-caller-in'],
  },
  {
    id: 'teardown',
    nodes: ['caller', 'callee', 'bye', 'ok-bye'],
    paths: ['bye-out', 'bye-in', 'ok-bye-out', 'ok-bye-in'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function SipCallDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-sip-call-arrow`
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
      scenarios={sipCallScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 520' : '0 0 280 560'}>
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
