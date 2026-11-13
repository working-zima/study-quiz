import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-servers'].diagrams['iptables-chains']

// 세로형은 맨 위에 다른 컴퓨터를 한 줄 전체 폭으로 두고, 그 아래 이 컴퓨터 박스 안에 filter 테이블의 세 체인 INPUT·OUTPUT·FORWARD를
// 한 줄로, 그 아래에 웹 서버를 둔다. 박스 아래 오른쪽에 거쳐 가는 패킷이 닿는 또 다른 컴퓨터를 둔다.
// 패킷의 길은 모두 곧은 세로 화살표 둘이다 — 들어오는 길은 다른 컴퓨터 → INPUT → 웹 서버, 나가는 길은 웹 서버 → OUTPUT → 다른 컴퓨터,
// 거쳐 가는 길은 다른 컴퓨터 → FORWARD → 또 다른 컴퓨터. 맨 아래 박스에는 규칙 한 줄을 뜻이 갈리는 조각 넷으로 나눠 위에서 아래로 쌓고, 뜻은 조각 오른쪽의 곁말로 단다.
const nodes = [
  { id: 'outside', x: 8, y: 8, width: 264 },
  { id: 'input', x: 16, y: 84, width: 72 },
  { id: 'output', x: 104, y: 84, width: 72 },
  { id: 'forward', x: 192, y: 84, width: 76 },
  { id: 'program', x: 16, y: 156, width: 160 },
  { id: 'beyond', x: 168, y: 220, width: 104 },
  { id: 'frag-a', x: 16, y: 292, width: 96 },
  { id: 'frag-p', x: 16, y: 332, width: 96 },
  { id: 'frag-d', x: 16, y: 372, width: 96 },
  { id: 'frag-j', x: 16, y: 412, width: 96 },
]

const groups = [
  { id: 'this', x: 4, y: 56, width: 272, height: 148, labelX: 12, labelY: 69 },
  { id: 'rule', x: 4, y: 268, width: 272, height: 184, labelX: 12, labelY: 281 },
]

const paths: Record<string, string> = {
  'in-1': 'M72 40 V84',
  'in-2': 'M24 116 V156',
  'out-1': 'M152 156 V116',
  'out-2': 'M120 84 V40',
  'fwd-1': 'M232 40 V84',
  'fwd-2': 'M232 116 V220',
}

// 곁말은 자기 시나리오에서만 보인다. 길의 곁말은 체인 줄과 웹 서버 사이에, 조각의 곁말은 그 조각의 오른쪽에 놓인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'in-note', x: 32, y: 140, anchor: 'start', scenarios: ['input'] },
  { id: 'out-note', x: 144, y: 140, anchor: 'end', scenarios: ['output'] },
  { id: 'fwd-note', x: 228, y: 140, anchor: 'end', scenarios: ['forward'] },
  { id: 'a-note', x: 120, y: 312, anchor: 'start', scenarios: ['rule'] },
  { id: 'p-note', x: 120, y: 352, anchor: 'start', scenarios: ['rule'] },
  { id: 'd-note', x: 120, y: 392, anchor: 'start', scenarios: ['rule'] },
  { id: 'j-note', x: 120, y: 432, anchor: 'start', scenarios: ['rule'] },
]

// 가로형도 같은 차례로 쌓되 폭을 넓힌다. 규칙의 조각 넷은 한 줄에 왼쪽부터 놓고, 뜻은 조각 바로 아래의 곁말로 단다.
const wideNodes = [
  { id: 'outside', x: 16, y: 8, width: 408 },
  { id: 'input', x: 24, y: 84, width: 96 },
  { id: 'output', x: 160, y: 84, width: 96 },
  { id: 'forward', x: 312, y: 84, width: 104 },
  { id: 'program', x: 24, y: 156, width: 232 },
  { id: 'beyond', x: 296, y: 220, width: 136 },
  { id: 'frag-a', x: 16, y: 292, width: 96 },
  { id: 'frag-p', x: 128, y: 292, width: 80 },
  { id: 'frag-d', x: 224, y: 292, width: 112 },
  { id: 'frag-j', x: 352, y: 292, width: 80 },
]

const wideGroups = [
  { id: 'this', x: 8, y: 56, width: 424, height: 148, labelX: 16, labelY: 69 },
  { id: 'rule', x: 8, y: 268, width: 424, height: 88, labelX: 16, labelY: 281 },
]

const widePaths: Record<string, string> = {
  'in-1': 'M88 40 V84',
  'in-2': 'M40 116 V156',
  'out-1': 'M224 156 V116',
  'out-2': 'M192 84 V40',
  'fwd-1': 'M364 40 V84',
  'fwd-2': 'M364 116 V220',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'in-note', x: 48, y: 140, anchor: 'start' },
  { id: 'out-note', x: 216, y: 140, anchor: 'end' },
  { id: 'fwd-note', x: 356, y: 140, anchor: 'end' },
  { id: 'a-note', x: 64, y: 344, anchor: 'middle' },
  { id: 'p-note', x: 168, y: 344, anchor: 'middle' },
  { id: 'd-note', x: 280, y: 344, anchor: 'middle' },
  { id: 'j-note', x: 392, y: 344, anchor: 'middle' },
]

// 들어오는 패킷은 INPUT을, 내보내는 패킷은 OUTPUT을, 거쳐 가는 패킷은 FORWARD를 지난다.
// 규칙 읽기: iptables -A INPUT -p tcp --dport 8080 -j DROP을 조각마다 읽는다.
export const iptablesChainsScenarios: DiagramScenario[] = [
  { id: 'input', nodes: ['outside', 'input', 'program'], paths: ['in-1', 'in-2'] },
  { id: 'output', nodes: ['program', 'output', 'outside'], paths: ['out-1', 'out-2'] },
  { id: 'forward', nodes: ['outside', 'forward', 'beyond'], paths: ['fwd-1', 'fwd-2'] },
  { id: 'rule', nodes: ['frag-a', 'frag-p', 'frag-d', 'frag-j'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function IptablesChainsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-iptables-chains-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenarios.includes(active.id))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={iptablesChainsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 364' : '0 0 280 460'}>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
