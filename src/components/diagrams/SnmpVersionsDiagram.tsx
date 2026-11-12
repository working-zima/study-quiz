import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['app-protocols-mgmt-security'].diagrams['snmp-versions']

// 맨 위에 관리 시스템과 「라우터 1」을 머리 노드로 두고, 그 아래 왼쪽에 매니저, 오른쪽에 에이전트 기둥(그룹 박스)을 세운다.
// 두 기둥 사이에 같은 요청을 두 박스로 나눠 놓는다 — 위는 SNMPv2c, 아래는 인증과 암호화를 함께 쓰는 SNMPv3다.
// 박스마다 요청 아래에 「엿보는 사람」을 두어, 중간에서 그 요청을 엿볼 때 무엇이 보이는지를 곁말로 가른다. 노드는 모두 회색이다.
const nodes = [
  { id: 'nms', x: 8, y: 8, width: 124 },
  { id: 'router', x: 148, y: 8, width: 124 },
  { id: 'v2c-req', x: 76, y: 80, width: 128 },
  { id: 'v2c-peek', x: 76, y: 136, width: 128 },
  { id: 'v3-req', x: 76, y: 220, width: 128 },
  { id: 'v3-peek', x: 76, y: 276, width: 128 },
]

const groups = [
  { id: 'manager-side', x: 8, y: 48, width: 56, height: 292, labelX: 10, labelY: 60 },
  { id: 'agent-side', x: 216, y: 48, width: 56, height: 292, labelX: 220, labelY: 60 },
  { id: 'v2c-box', x: 68, y: 60, width: 144, height: 128, labelX: 72, labelY: 73 },
  { id: 'v3-box', x: 68, y: 200, width: 144, height: 128, labelX: 72, labelY: 213 },
]

// 판마다 화살표 셋 — 매니저 기둥에서 요청으로(-send), 요청에서 에이전트 기둥으로(-deliver),
// 요청의 아래 변에서 엿보는 사람의 위 변으로(-peek).
const paths: Record<string, string> = {
  'v2c-send': 'M64 96 H76',
  'v2c-deliver': 'M204 96 H216',
  'v2c-peek': 'M140 112 V136',
  'v3-send': 'M64 236 H76',
  'v3-deliver': 'M204 236 H216',
  'v3-peek': 'M140 252 V276',
}

type Note = { id: string, x: number, y: number }

// 곁말은 자기 시나리오를 골랐을 때만 자기 박스 안, 엿보는 사람 아래에 보인다.
const noteScenarios: Record<string, string> = {
  'v2c-note': 'v2c',
  'v3-note': 'v3',
}

const notes: Note[] = [
  { id: 'v2c-note', x: 140, y: 180 },
  { id: 'v3-note', x: 140, y: 320 },
]

// 가로형은 기둥과 노드를 넓힐 뿐 차례와 높이는 세로형과 같다. 엿보는 사람은 요청 가운데 아래에 둔다.
const wideNodes = [
  { id: 'nms', x: 8, y: 8, width: 124 },
  { id: 'router', x: 308, y: 8, width: 124 },
  { id: 'v2c-req', x: 120, y: 80, width: 200 },
  { id: 'v2c-peek', x: 160, y: 136, width: 120 },
  { id: 'v3-req', x: 120, y: 220, width: 200 },
  { id: 'v3-peek', x: 160, y: 276, width: 120 },
]

const wideGroups = [
  { id: 'manager-side', x: 8, y: 48, width: 88, height: 292, labelX: 12, labelY: 60 },
  { id: 'agent-side', x: 344, y: 48, width: 88, height: 292, labelX: 348, labelY: 60 },
  { id: 'v2c-box', x: 104, y: 60, width: 232, height: 128, labelX: 112, labelY: 73 },
  { id: 'v3-box', x: 104, y: 200, width: 232, height: 128, labelX: 112, labelY: 213 },
]

const widePaths: Record<string, string> = {
  'v2c-send': 'M96 96 H120',
  'v2c-deliver': 'M320 96 H344',
  'v2c-peek': 'M220 112 V136',
  'v3-send': 'M96 236 H120',
  'v3-deliver': 'M320 236 H344',
  'v3-peek': 'M220 252 V276',
}

const wideNotes: Note[] = [
  { id: 'v2c-note', x: 220, y: 180 },
  { id: 'v3-note', x: 220, y: 320 },
]

// SNMPv2c — 커뮤니티 문자열 netops가 그대로 실려 엿보면 읽힌다. SNMPv3 — 인증과 암호화로 엿봐도 알아볼 수 없다.
export const snmpVersionsScenarios: DiagramScenario[] = [
  {
    id: 'v2c',
    nodes: ['nms', 'router', 'v2c-req', 'v2c-peek'],
    paths: ['v2c-send', 'v2c-deliver', 'v2c-peek'],
  },
  {
    id: 'v3',
    nodes: ['nms', 'router', 'v3-req', 'v3-peek'],
    paths: ['v3-send', 'v3-deliver', 'v3-peek'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function SnmpVersionsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-snmp-versions-arrow`
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
      scenarios={snmpVersionsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 348' : '0 0 280 348'}>
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
