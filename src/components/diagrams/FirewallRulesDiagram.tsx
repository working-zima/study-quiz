import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-security'].diagrams['firewall-rules']

// 세로형은 맨 위에 인터넷 박스(TCP 443 연결 왼쪽·TCP 8080 연결 오른쪽), 그 아래 가운데에 FW01, 왼쪽 아래에 FW01의 규칙 박스
// (허용 규칙 위·거부 규칙 아래), 맨 아래에 사내 네트워크 박스(웹 서버 위, PC01·PC02 아래 줄)를 둔다.
// 두 연결은 FW01의 왼쪽·오른쪽 변으로 들어오고, FW01에서 웹 서버로 가는 길은 규칙 박스 오른쪽으로 돈다. 노드는 모두 회색이다.
const nodes = [
  { id: 'req443', x: 20, y: 32, width: 96 },
  { id: 'req8080', x: 164, y: 32, width: 100 },
  { id: 'fw01', x: 100, y: 104, width: 80 },
  { id: 'rule-allow', x: 20, y: 176, width: 176 },
  { id: 'rule-deny', x: 20, y: 216, width: 80 },
  { id: 'web', x: 136, y: 292, width: 128 },
  { id: 'pc01', x: 24, y: 344, width: 56 },
  { id: 'pc02', x: 184, y: 344, width: 56 },
]

const groups = [
  { id: 'internet', x: 8, y: 8, width: 264, height: 64, labelX: 16, labelY: 21 },
  { id: 'rules', x: 8, y: 156, width: 200, height: 96, labelX: 16, labelY: 169 },
  { id: 'internal', x: 8, y: 268, width: 264, height: 132, labelX: 16, labelY: 281 },
]

const paths: Record<string, string> = {
  'req443-fw': 'M68 64 V120 H100',
  'req8080-fw': 'M214 64 V120 H180',
  'fw-web': 'M180 128 H232 V292',
  'pc01-pc02': 'M80 360 H184',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다. 허용과 거부의 곁말은 FW01 바로 위 같은 자리를 함께 쓰고(함께 보이지 않는다),
// 거치지 않는 트래픽의 곁말은 PC01과 PC02 사이 선 아래에 둔다.
const noteScenarios: Record<string, string> = {
  'allow-note': 'allow',
  'deny-note': 'deny',
  'bypass-note': 'bypass',
}

const notes: Note[] = [
  { id: 'allow-note', x: 140, y: 94, anchor: 'middle' },
  { id: 'deny-note', x: 140, y: 94, anchor: 'middle' },
  { id: 'bypass-note', x: 132, y: 392, anchor: 'middle' },
]

// 가로형은 왼쪽 위에 인터넷 박스(두 연결을 위아래로), 가운데 위에 FW01, 오른쪽에 사내 네트워크 박스(웹 서버 위, PC01·PC02 아래 줄),
// 왼쪽 아래에 FW01의 규칙 박스를 둔다. 연결은 왼쪽에서 FW01로, FW01에서 웹 서버로는 오른쪽으로 간다.
const wideNodes = [
  { id: 'req443', x: 16, y: 36, width: 96 },
  { id: 'req8080', x: 16, y: 84, width: 100 },
  { id: 'fw01', x: 156, y: 48, width: 64 },
  { id: 'rule-allow', x: 16, y: 168, width: 176 },
  { id: 'rule-deny', x: 16, y: 208, width: 80 },
  { id: 'web', x: 268, y: 48, width: 128 },
  { id: 'pc01', x: 268, y: 116, width: 56 },
  { id: 'pc02', x: 372, y: 116, width: 56 },
]

const wideGroups = [
  { id: 'internet', x: 8, y: 8, width: 116, height: 124, labelX: 16, labelY: 21 },
  { id: 'rules', x: 8, y: 148, width: 200, height: 100, labelX: 16, labelY: 161 },
  { id: 'internal', x: 256, y: 8, width: 180, height: 176, labelX: 264, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'req443-fw': 'M112 52 H156',
  'req8080-fw': 'M116 100 H188 V80',
  'fw-web': 'M220 64 H268',
  'pc01-pc02': 'M324 132 H372',
}

const wideNotes: Note[] = [
  { id: 'allow-note', x: 188, y: 36, anchor: 'middle' },
  { id: 'deny-note', x: 188, y: 36, anchor: 'middle' },
  { id: 'bypass-note', x: 348, y: 172, anchor: 'middle' },
]

// 허용: TCP 443 연결이 허용 규칙에 맞아 FW01을 지나 웹 서버에 닿는다. 거부: TCP 8080 연결이 거부 규칙에 걸려 FW01에서 멈춘다.
// 거치지 않는 트래픽: PC01에서 PC02로 가는 트래픽은 FW01을 지나지 않는다.
export const firewallRulesScenarios: DiagramScenario[] = [
  {
    id: 'allow',
    nodes: ['req443', 'fw01', 'rule-allow', 'web'],
    paths: ['req443-fw', 'fw-web'],
  },
  {
    id: 'deny',
    nodes: ['req8080', 'fw01', 'rule-deny'],
    paths: ['req8080-fw'],
  },
  {
    id: 'bypass',
    nodes: ['pc01', 'pc02'],
    paths: ['pc01-pc02'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function FirewallRulesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-firewall-rules-arrow`
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
      scenarios={firewallRulesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 256' : '0 0 280 408'}>
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
