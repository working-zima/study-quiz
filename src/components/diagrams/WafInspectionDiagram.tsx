import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-security'].diagrams['waf-inspection']

// 세로형은 맨 위의 「TCP 443으로 온 요청」 박스에 여느 로그인 요청(왼쪽)과 SQL 문장을 섞은 요청(오른쪽)을 나란히 두고,
// 그 아래 가운데에 WAF01, 맨 아래에 웹 서버를 둔다. 두 요청은 같은 포트로 오지만 WAF01이 내용을 보고 가른다. 노드는 모두 회색이다.
const nodes = [
  { id: 'normal', x: 16, y: 28, width: 112 },
  { id: 'attack', x: 136, y: 28, width: 136 },
  { id: 'waf01', x: 100, y: 108, width: 80 },
  { id: 'web', x: 60, y: 188, width: 160 },
]

const groups = [
  { id: 'tcp443', x: 8, y: 8, width: 268, height: 60, labelX: 16, labelY: 21 },
]

const paths: Record<string, string> = {
  'normal-waf': 'M72 60 V84 H120 V108',
  'attack-waf': 'M204 60 V84 H160 V108',
  'waf-web': 'M140 140 V188',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보이고, 시나리오마다 하나라 맨 아래 가운데 한 자리를 함께 쓴다.
const noteScenarios: Record<string, string> = {
  'normal-note': 'normal',
  'attack-note': 'attack',
}

const notes: Note[] = [
  { id: 'normal-note', x: 140, y: 240, anchor: 'middle' },
  { id: 'attack-note', x: 140, y: 240, anchor: 'middle' },
]

// 가로형은 왼쪽의 「TCP 443으로 온 요청」 박스에 두 요청을 위아래로 두고, 가운데에 WAF01, 오른쪽에 웹 서버를 둔다.
// 곁말은 WAF01과 웹 서버 아래에 둔다.
const wideNodes = [
  { id: 'normal', x: 16, y: 32, width: 136 },
  { id: 'attack', x: 16, y: 88, width: 136 },
  { id: 'waf01', x: 192, y: 56, width: 64 },
  { id: 'web', x: 276, y: 56, width: 156 },
]

const wideGroups = [
  { id: 'tcp443', x: 8, y: 8, width: 152, height: 120, labelX: 16, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'normal-waf': 'M152 48 H172 V64 H192',
  'attack-waf': 'M152 104 H172 V80 H192',
  'waf-web': 'M256 72 H276',
}

const wideNotes: Note[] = [
  { id: 'normal-note', x: 316, y: 116, anchor: 'middle' },
  { id: 'attack-note', x: 316, y: 116, anchor: 'middle' },
]

// 여느 요청: 여느 로그인 요청이 WAF01을 지나 웹 서버에 닿는다. 공격 요청: SQL 문장을 섞은 요청이 WAF01에서 멈추고 웹 서버는 흐려진다.
export const wafInspectionScenarios: DiagramScenario[] = [
  {
    id: 'normal',
    nodes: ['normal', 'waf01', 'web'],
    paths: ['normal-waf', 'waf-web'],
  },
  {
    id: 'attack',
    nodes: ['attack', 'waf01'],
    paths: ['attack-waf'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function WafInspectionDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-waf-inspection-arrow`
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
      scenarios={wafInspectionScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 144' : '0 0 280 252'}>
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
