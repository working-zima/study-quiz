import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['dns'].diagrams['dns-transport']

// 맨 위에 두 장치를 머리 노드로 두고, 그 아래 왼쪽에 클라이언트, 오른쪽에 로컬 DNS 서버 기둥(그룹 박스 — 라벨은 IP 주소)을 세운다.
// 두 기둥 사이에는 메시지 하나를 노드 하나로 오가는 차례대로 위에서 아래로 놓는다. 방향은 노드 양옆의 짧은 화살표가 보인다.
// 보통의 응답과 잘린 응답은 시나리오마다 다른 노드로 다른 줄에 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'client', x: 8, y: 8, width: 128 },
  { id: 'server', x: 144, y: 8, width: 128 },
  { id: 'query', x: 84, y: 64, width: 112 },
  { id: 'answer', x: 84, y: 112, width: 112 },
  { id: 'truncated', x: 84, y: 176, width: 112 },
  { id: 'tcp-query', x: 84, y: 240, width: 112 },
  { id: 'tcp-answer', x: 84, y: 304, width: 112 },
]

const groups = [
  { id: 'client-side', x: 8, y: 48, width: 64, height: 316, labelX: 12, labelY: 60 },
  { id: 'server-side', x: 208, y: 48, width: 64, height: 316, labelX: 212, labelY: 60 },
]

// 질의는 클라이언트 기둥에서 서버 기둥으로, 응답은 서버 기둥에서 클라이언트 기둥으로 간다.
const paths: Record<string, string> = {
  'query-out': 'M72 80 H84',
  'query-in': 'M196 80 H208',
  'answer-out': 'M208 128 H196',
  'answer-in': 'M84 128 H72',
  'truncated-out': 'M208 192 H196',
  'truncated-in': 'M84 192 H72',
  'tcp-query-out': 'M72 256 H84',
  'tcp-query-in': 'M196 256 H208',
  'tcp-answer-out': 'M208 320 H196',
  'tcp-answer-in': 'M84 320 H72',
}

// 곁말은 자기 시나리오에서만 보이고, 자기 메시지 노드 바로 아래 두 기둥 사이에 놓인다.
const notes = [
  { id: 'answer-note', x: 140, y: 160, scenarios: ['udp'] },
  { id: 'truncated-note', x: 140, y: 224, scenarios: ['truncated'] },
  { id: 'tcp-query-note', x: 140, y: 288, scenarios: ['truncated'] },
  { id: 'tcp-answer-note', x: 140, y: 352, scenarios: ['truncated'] },
]

// 가로형도 같은 꼴로 폭만 넓힌다. 기둥과 메시지 노드가 넓어지고 화살표가 길어진다.
const wideNodes = [
  { id: 'client', x: 8, y: 8, width: 160 },
  { id: 'server', x: 272, y: 8, width: 160 },
  { id: 'query', x: 140, y: 64, width: 160 },
  { id: 'answer', x: 140, y: 112, width: 160 },
  { id: 'truncated', x: 140, y: 176, width: 160 },
  { id: 'tcp-query', x: 140, y: 240, width: 160 },
  { id: 'tcp-answer', x: 140, y: 304, width: 160 },
]

const wideGroups = [
  { id: 'client-side', x: 8, y: 48, width: 88, height: 316, labelX: 16, labelY: 60 },
  { id: 'server-side', x: 344, y: 48, width: 88, height: 316, labelX: 352, labelY: 60 },
]

const widePaths: Record<string, string> = {
  'query-out': 'M96 80 H140',
  'query-in': 'M300 80 H344',
  'answer-out': 'M344 128 H300',
  'answer-in': 'M140 128 H96',
  'truncated-out': 'M344 192 H300',
  'truncated-in': 'M140 192 H96',
  'tcp-query-out': 'M96 256 H140',
  'tcp-query-in': 'M300 256 H344',
  'tcp-answer-out': 'M344 320 H300',
  'tcp-answer-in': 'M140 320 H96',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes = [
  { id: 'answer-note', x: 220, y: 160 },
  { id: 'truncated-note', x: 220, y: 224 },
  { id: 'tcp-query-note', x: 220, y: 288 },
  { id: 'tcp-answer-note', x: 220, y: 352 },
]

// 보통 질의: UDP 53으로 질의 하나를 보내고 응답 하나를 받는다.
// 큰 응답: 같은 UDP 질의에 잘린 응답이 오고, 클라이언트가 TCP 53으로 같은 질의를 다시 보내 잘리지 않은 응답을 받는다. 머리 노드 둘은 두 시나리오 모두 선명하다.
export const dnsTransportScenarios: DiagramScenario[] = [
  { id: 'udp', nodes: ['client', 'server', 'query', 'answer'], paths: ['query-out', 'query-in', 'answer-out', 'answer-in'] },
  {
    id: 'truncated',
    nodes: ['client', 'server', 'query', 'truncated', 'tcp-query', 'tcp-answer'],
    paths: ['query-out', 'query-in', 'truncated-out', 'truncated-in', 'tcp-query-out', 'tcp-query-in', 'tcp-answer-out', 'tcp-answer-in'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function DnsTransportDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-dns-transport-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = active ? layoutNotes.filter((note) => note.scenarios.includes(active.id)) : []

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={dnsTransportScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 372' : '0 0 280 372'}>
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

          {shownNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
