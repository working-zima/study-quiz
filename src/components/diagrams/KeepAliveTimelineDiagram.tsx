import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-servers'].diagrams['keepalive-timeline']

// 왼쪽에 웹 브라우저, 오른쪽에 웹 서버 기둥(그룹 박스)을 세우고, 두 기둥 사이 위 박스(KeepAliveTimeout 15)와 아래 박스(KeepAlive Off)에
// 오가는 것 하나를 노드 하나로 위에서 아래로 차례대로 놓는다. 방향은 노드 양옆의 짧은 화살표가 보인다 — 시작한 쪽에서 상대 쪽으로.
// 아래 박스의 노드는 위 박스와 이름이 같아도 다른 id로 다른 줄에 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'on-connect', x: 88, y: 28, width: 104 },
  { id: 'req-1', x: 88, y: 68, width: 104 },
  { id: 'res-1', x: 88, y: 108, width: 104 },
  { id: 'req-2', x: 88, y: 164, width: 104 },
  { id: 'res-2', x: 88, y: 204, width: 104 },
  { id: 'close', x: 88, y: 260, width: 104 },
  { id: 'off-connect-1', x: 88, y: 332, width: 104 },
  { id: 'off-req-1', x: 88, y: 372, width: 104 },
  { id: 'off-res-1', x: 88, y: 412, width: 104 },
  { id: 'off-close-1', x: 88, y: 452, width: 104 },
  { id: 'off-connect-2', x: 88, y: 508, width: 104 },
  { id: 'off-req-2', x: 88, y: 548, width: 104 },
]

const groups = [
  { id: 'browser', x: 8, y: 8, width: 64, height: 584, labelX: 12, labelY: 21 },
  { id: 'server', x: 208, y: 8, width: 64, height: 584, labelX: 212, labelY: 21 },
  { id: 'on', x: 80, y: 8, width: 120, height: 292, labelX: 84, labelY: 21 },
  { id: 'off', x: 80, y: 312, width: 120, height: 280, labelX: 84, labelY: 325 },
]

// 웹 브라우저가 시작하는 것(연결 맺기·요청)은 왼쪽 기둥에서 오른쪽 기둥으로, 웹 서버가 시작하는 것(응답·연결 닫기)은 그 반대로 간다.
const paths: Record<string, string> = {
  'on-connect-out': 'M72 44 H88',
  'on-connect-in': 'M192 44 H208',
  'req-1-out': 'M72 84 H88',
  'req-1-in': 'M192 84 H208',
  'res-1-out': 'M208 124 H192',
  'res-1-in': 'M88 124 H72',
  'req-2-out': 'M72 180 H88',
  'req-2-in': 'M192 180 H208',
  'res-2-out': 'M208 220 H192',
  'res-2-in': 'M88 220 H72',
  'close-out': 'M208 276 H192',
  'close-in': 'M88 276 H72',
  'off-connect-1-out': 'M72 348 H88',
  'off-connect-1-in': 'M192 348 H208',
  'off-req-1-out': 'M72 388 H88',
  'off-req-1-in': 'M192 388 H208',
  'off-res-1-out': 'M208 428 H192',
  'off-res-1-in': 'M88 428 H72',
  'off-close-1-out': 'M208 468 H192',
  'off-close-1-in': 'M88 468 H72',
  'off-connect-2-out': 'M72 524 H88',
  'off-connect-2-in': 'M192 524 H208',
  'off-req-2-out': 'M72 564 H88',
  'off-req-2-in': 'M192 564 H208',
}

// 곁말은 자기 시나리오에서만 보이고, 두 노드 사이 빈 줄의 가운데에 놓인다.
const notes = [
  { id: 'reuse-wait', x: 140, y: 156, scenarios: ['reuse'] },
  { id: 'timeout-wait', x: 140, y: 252, scenarios: ['timeout'] },
  { id: 'off-note', x: 140, y: 500, scenarios: ['off'] },
]

// 가로형도 같은 꼴로 폭만 넓힌다. 기둥과 노드가 넓어지고 화살표가 길어진다.
const wideNodes = [
  { id: 'on-connect', x: 140, y: 28, width: 160 },
  { id: 'req-1', x: 140, y: 68, width: 160 },
  { id: 'res-1', x: 140, y: 108, width: 160 },
  { id: 'req-2', x: 140, y: 164, width: 160 },
  { id: 'res-2', x: 140, y: 204, width: 160 },
  { id: 'close', x: 140, y: 260, width: 160 },
  { id: 'off-connect-1', x: 140, y: 332, width: 160 },
  { id: 'off-req-1', x: 140, y: 372, width: 160 },
  { id: 'off-res-1', x: 140, y: 412, width: 160 },
  { id: 'off-close-1', x: 140, y: 452, width: 160 },
  { id: 'off-connect-2', x: 140, y: 508, width: 160 },
  { id: 'off-req-2', x: 140, y: 548, width: 160 },
]

const wideGroups = [
  { id: 'browser', x: 8, y: 8, width: 88, height: 584, labelX: 16, labelY: 21 },
  { id: 'server', x: 344, y: 8, width: 88, height: 584, labelX: 352, labelY: 21 },
  { id: 'on', x: 112, y: 8, width: 216, height: 292, labelX: 116, labelY: 21 },
  { id: 'off', x: 112, y: 312, width: 216, height: 280, labelX: 116, labelY: 325 },
]

const widePaths: Record<string, string> = {
  'on-connect-out': 'M96 44 H140',
  'on-connect-in': 'M300 44 H344',
  'req-1-out': 'M96 84 H140',
  'req-1-in': 'M300 84 H344',
  'res-1-out': 'M344 124 H300',
  'res-1-in': 'M140 124 H96',
  'req-2-out': 'M96 180 H140',
  'req-2-in': 'M300 180 H344',
  'res-2-out': 'M344 220 H300',
  'res-2-in': 'M140 220 H96',
  'close-out': 'M344 276 H300',
  'close-in': 'M140 276 H96',
  'off-connect-1-out': 'M96 348 H140',
  'off-connect-1-in': 'M300 348 H344',
  'off-req-1-out': 'M96 388 H140',
  'off-req-1-in': 'M300 388 H344',
  'off-res-1-out': 'M344 428 H300',
  'off-res-1-in': 'M140 428 H96',
  'off-close-1-out': 'M344 468 H300',
  'off-close-1-in': 'M140 468 H96',
  'off-connect-2-out': 'M96 524 H140',
  'off-connect-2-in': 'M300 524 H344',
  'off-req-2-out': 'M96 564 H140',
  'off-req-2-in': 'M300 564 H344',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes = [
  { id: 'reuse-wait', x: 220, y: 156 },
  { id: 'timeout-wait', x: 220, y: 252 },
  { id: 'off-note', x: 220, y: 500 },
]

const arrowsOf = (ids: string[]) => ids.flatMap((id) => [`${id}-out`, `${id}-in`])
const offIds = ['off-connect-1', 'off-req-1', 'off-res-1', 'off-close-1', 'off-connect-2', 'off-req-2']

// 같은 연결: 연결을 한 번 맺고 요청 1·응답 1·요청 2·응답 2를 그 연결로 주고받는다. 시간 초과: 응답 2 뒤 요청이 없어 서버가 연결을 닫는다.
// 끄기: 응답마다 서버가 연결을 닫고, 요청 2 앞에 연결을 새로 맺는다.
export const keepAliveTimelineScenarios: DiagramScenario[] = [
  { id: 'reuse', nodes: ['on-connect', 'req-1', 'res-1', 'req-2', 'res-2'], paths: arrowsOf(['on-connect', 'req-1', 'res-1', 'req-2', 'res-2']) },
  { id: 'timeout', nodes: ['res-2', 'close'], paths: arrowsOf(['res-2', 'close']) },
  { id: 'off', nodes: offIds, paths: arrowsOf(offIds) },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function KeepAliveTimelineDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-keepalive-timeline-arrow`
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
      scenarios={keepAliveTimelineScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 600' : '0 0 280 600'}>
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
