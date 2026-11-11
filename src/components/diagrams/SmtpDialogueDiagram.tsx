import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['app-protocols-mail-file'].diagrams['smtp-dialogue']

// 맨 위에 클라이언트와 서버의 이름을 머리 노드로 두고, 그 아래 왼쪽에 클라이언트, 오른쪽에 서버 기둥(그룹 박스)을 세운다.
// 두 기둥 사이에는 대화의 단계마다 박스를 두고, 그 안에 메시지 하나를 노드 하나로 오가는 차례대로 위에서 아래로 놓는다.
// 클라이언트의 명령은 왼쪽, 서버의 응답 코드는 오른쪽에 한 칸씩 어긋나게 두어 화살표가 다른 노드를 지나지 않게 한다. 노드는 모두 회색이다.
const nodes = [
  { id: 'client', x: 8, y: 8, width: 124 },
  { id: 'server', x: 136, y: 8, width: 136 },
  { id: 'r220', x: 172, y: 76, width: 32 },
  { id: 'ehlo', x: 76, y: 116, width: 88 },
  { id: 'r250-ehlo', x: 172, y: 140, width: 32 },
  { id: 'mail-from', x: 76, y: 212, width: 88 },
  { id: 'r250-mail', x: 172, y: 236, width: 32 },
  { id: 'rcpt-to', x: 76, y: 276, width: 88 },
  { id: 'r250-rcpt', x: 172, y: 300, width: 32 },
  { id: 'data-cmd', x: 76, y: 372, width: 88 },
  { id: 'r354', x: 172, y: 396, width: 32 },
  { id: 'content', x: 76, y: 436, width: 88 },
  { id: 'dot', x: 76, y: 476, width: 88 },
  { id: 'r250-data', x: 172, y: 500, width: 32 },
  { id: 'quit-cmd', x: 76, y: 572, width: 88 },
  { id: 'r221', x: 172, y: 596, width: 32 },
]

const groups = [
  { id: 'client-side', x: 8, y: 48, width: 56, height: 596, labelX: 10, labelY: 60 },
  { id: 'server-side', x: 216, y: 48, width: 56, height: 596, labelX: 220, labelY: 60 },
  { id: 'greet', x: 68, y: 56, width: 144, height: 124, labelX: 72, labelY: 69 },
  { id: 'envelope', x: 68, y: 192, width: 144, height: 148, labelX: 72, labelY: 205 },
  { id: 'data', x: 68, y: 352, width: 144, height: 188, labelX: 72, labelY: 365 },
  { id: 'quit', x: 68, y: 552, width: 144, height: 84, labelX: 72, labelY: 565 },
]

// 메시지마다 화살표 둘 — 보내는 쪽 기둥에서 노드로(-out), 노드에서 받는 쪽 기둥으로(-in).
const paths: Record<string, string> = {
  'r220-out': 'M216 92 H204',
  'r220-in': 'M172 92 H64',
  'ehlo-out': 'M64 132 H76',
  'ehlo-in': 'M164 132 H216',
  'r250-ehlo-out': 'M216 156 H204',
  'r250-ehlo-in': 'M172 156 H64',
  'mail-from-out': 'M64 228 H76',
  'mail-from-in': 'M164 228 H216',
  'r250-mail-out': 'M216 252 H204',
  'r250-mail-in': 'M172 252 H64',
  'rcpt-to-out': 'M64 292 H76',
  'rcpt-to-in': 'M164 292 H216',
  'r250-rcpt-out': 'M216 316 H204',
  'r250-rcpt-in': 'M172 316 H64',
  'data-cmd-out': 'M64 388 H76',
  'data-cmd-in': 'M164 388 H216',
  'r354-out': 'M216 412 H204',
  'r354-in': 'M172 412 H64',
  'content-out': 'M64 452 H76',
  'content-in': 'M164 452 H216',
  'dot-out': 'M64 492 H76',
  'dot-in': 'M164 492 H216',
  'r250-data-out': 'M216 516 H204',
  'r250-data-in': 'M172 516 H64',
  'quit-cmd-out': 'M64 588 H76',
  'quit-cmd-in': 'M164 588 H216',
  'r221-out': 'M216 612 H204',
  'r221-in': 'M172 612 H64',
}

// 가로형은 기둥과 노드를 넓힐 뿐 차례와 높이는 세로형과 같다.
const wideNodes = [
  { id: 'client', x: 8, y: 8, width: 124 },
  { id: 'server', x: 296, y: 8, width: 136 },
  { id: 'r220', x: 272, y: 76, width: 48 },
  { id: 'ehlo', x: 120, y: 116, width: 120 },
  { id: 'r250-ehlo', x: 272, y: 140, width: 48 },
  { id: 'mail-from', x: 120, y: 212, width: 120 },
  { id: 'r250-mail', x: 272, y: 236, width: 48 },
  { id: 'rcpt-to', x: 120, y: 276, width: 120 },
  { id: 'r250-rcpt', x: 272, y: 300, width: 48 },
  { id: 'data-cmd', x: 120, y: 372, width: 120 },
  { id: 'r354', x: 272, y: 396, width: 48 },
  { id: 'content', x: 120, y: 436, width: 120 },
  { id: 'dot', x: 120, y: 476, width: 120 },
  { id: 'r250-data', x: 272, y: 500, width: 48 },
  { id: 'quit-cmd', x: 120, y: 572, width: 120 },
  { id: 'r221', x: 272, y: 596, width: 48 },
]

const wideGroups = [
  { id: 'client-side', x: 8, y: 48, width: 88, height: 596, labelX: 12, labelY: 60 },
  { id: 'server-side', x: 344, y: 48, width: 88, height: 596, labelX: 348, labelY: 60 },
  { id: 'greet', x: 104, y: 56, width: 232, height: 124, labelX: 112, labelY: 69 },
  { id: 'envelope', x: 104, y: 192, width: 232, height: 148, labelX: 112, labelY: 205 },
  { id: 'data', x: 104, y: 352, width: 232, height: 188, labelX: 112, labelY: 365 },
  { id: 'quit', x: 104, y: 552, width: 232, height: 84, labelX: 112, labelY: 565 },
]

const widePaths: Record<string, string> = {
  'r220-out': 'M344 92 H320',
  'r220-in': 'M272 92 H96',
  'ehlo-out': 'M96 132 H120',
  'ehlo-in': 'M240 132 H344',
  'r250-ehlo-out': 'M344 156 H320',
  'r250-ehlo-in': 'M272 156 H96',
  'mail-from-out': 'M96 228 H120',
  'mail-from-in': 'M240 228 H344',
  'r250-mail-out': 'M344 252 H320',
  'r250-mail-in': 'M272 252 H96',
  'rcpt-to-out': 'M96 292 H120',
  'rcpt-to-in': 'M240 292 H344',
  'r250-rcpt-out': 'M344 316 H320',
  'r250-rcpt-in': 'M272 316 H96',
  'data-cmd-out': 'M96 388 H120',
  'data-cmd-in': 'M240 388 H344',
  'r354-out': 'M344 412 H320',
  'r354-in': 'M272 412 H96',
  'content-out': 'M96 452 H120',
  'content-in': 'M240 452 H344',
  'dot-out': 'M96 492 H120',
  'dot-in': 'M240 492 H344',
  'r250-data-out': 'M344 516 H320',
  'r250-data-in': 'M272 516 H96',
  'quit-cmd-out': 'M96 588 H120',
  'quit-cmd-in': 'M240 588 H344',
  'r221-out': 'M344 612 H320',
  'r221-in': 'M272 612 H96',
}

// ① 인사 — 220·EHLO·250. ② 주고받을 사람 — MAIL FROM·RCPT TO와 각 250. ③ 메일 내용 — DATA·354·메일 내용·마침표 한 줄·250. ④ 끝 — QUIT·221.
// 머리 노드 둘은 네 시나리오 모두 선명하다.
export const smtpDialogueScenarios: DiagramScenario[] = [
  {
    id: 'greet',
    nodes: ['client', 'server', 'r220', 'ehlo', 'r250-ehlo'],
    paths: ['r220-out', 'r220-in', 'ehlo-out', 'ehlo-in', 'r250-ehlo-out', 'r250-ehlo-in'],
  },
  {
    id: 'envelope',
    nodes: ['client', 'server', 'mail-from', 'r250-mail', 'rcpt-to', 'r250-rcpt'],
    paths: ['mail-from-out', 'mail-from-in', 'r250-mail-out', 'r250-mail-in', 'rcpt-to-out', 'rcpt-to-in', 'r250-rcpt-out', 'r250-rcpt-in'],
  },
  {
    id: 'data',
    nodes: ['client', 'server', 'data-cmd', 'r354', 'content', 'dot', 'r250-data'],
    paths: ['data-cmd-out', 'data-cmd-in', 'r354-out', 'r354-in', 'content-out', 'content-in', 'dot-out', 'dot-in', 'r250-data-out', 'r250-data-in'],
  },
  {
    id: 'quit',
    nodes: ['client', 'server', 'quit-cmd', 'r221'],
    paths: ['quit-cmd-out', 'quit-cmd-in', 'r221-out', 'r221-in'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function SmtpDialogueDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-smtp-dialogue-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={smtpDialogueScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 652' : '0 0 280 652'}>
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
        </svg>
      </div>
    </DiagramFrame>
  )
}
