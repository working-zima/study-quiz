import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['app-protocols-mgmt-security'].diagrams['ntp-stratum']

// 세로형은 기준 시계, 주 서버, 회사의 시각 서버를 가운데 열에 위에서 아래로 쌓고, 맨 아래 줄에 「PC 1」과 「PC 2」를 나란히 둔다.
// 서버 오른쪽에 stratum 번호를 곁말로 단다. 노드는 모두 회색이다.
const nodes = [
  { id: 'clock', x: 80, y: 8, width: 120 },
  { id: 'primary', x: 80, y: 72, width: 120 },
  { id: 'company', x: 64, y: 136, width: 152 },
  { id: 'pc1', x: 16, y: 232, width: 104 },
  { id: 'pc2', x: 160, y: 232, width: 104 },
]

// 선은 시각이 전해지는 길이고 늘 보인다. 답의 화살표는 그 선 위에 겹쳐 시각을 주는 쪽에서 받는 쪽으로 가고,
// 요청의 화살표는 그 곁에서 받는 쪽에서 주는 쪽으로 거꾸로 간다.
const paths: Record<string, string> = {
  'l-clock': 'M140 40 V72',
  'l-s1': 'M140 104 V136',
  'l-pc1': 'M96 168 V232',
  'l-pc2': 'M200 168 V232',
  'from-clock': 'M140 40 V72',
  'ask-s1': 'M124 136 V104',
  'answer-s1': 'M140 104 V136',
  'ask-pc1': 'M80 232 V168',
  'answer-pc1': 'M96 168 V232',
  'ask-pc2': 'M184 232 V168',
  'answer-pc2': 'M200 168 V232',
}

const linkIds = ['l-clock', 'l-s1', 'l-pc1', 'l-pc2']

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// stratum 번호는 늘 보이고, 나머지 곁말은 그 시나리오를 골랐을 때만 보인다.
const layerNoteIds = ['stratum-1', 'stratum-2']
const noteScenarios: Record<string, string> = {
  'source-note': 'source',
  'chain-note': 'chain',
  'udp-note': 'client',
}

const notes: Note[] = [
  { id: 'stratum-1', x: 208, y: 92, anchor: 'start' },
  { id: 'stratum-2', x: 224, y: 156, anchor: 'start' },
  { id: 'source-note', x: 148, y: 60, anchor: 'start' },
  { id: 'chain-note', x: 148, y: 124, anchor: 'start' },
  { id: 'udp-note', x: 140, y: 204, anchor: 'middle' },
]

// 가로형은 기준 시계, 주 서버, 회사의 시각 서버를 윗줄에 왼쪽에서 오른쪽으로 두고, 회사의 시각 서버 아래에 「PC 1」과 「PC 2」를 둔다.
// stratum 번호는 서버 위에 단다.
const wideNodes = [
  { id: 'clock', x: 8, y: 24, width: 88 },
  { id: 'primary', x: 128, y: 24, width: 88 },
  { id: 'company', x: 248, y: 24, width: 160 },
  { id: 'pc1', x: 232, y: 120, width: 80 },
  { id: 'pc2', x: 344, y: 120, width: 80 },
]

const widePaths: Record<string, string> = {
  'l-clock': 'M96 40 H128',
  'l-s1': 'M216 32 H248',
  'l-pc1': 'M272 56 V120',
  'l-pc2': 'M384 56 V120',
  'from-clock': 'M96 40 H128',
  'ask-s1': 'M248 48 H216',
  'answer-s1': 'M216 32 H248',
  'ask-pc1': 'M256 120 V56',
  'answer-pc1': 'M272 56 V120',
  'ask-pc2': 'M368 120 V56',
  'answer-pc2': 'M384 56 V120',
}

const wideNotes: Note[] = [
  { id: 'stratum-1', x: 172, y: 16, anchor: 'middle' },
  { id: 'stratum-2', x: 328, y: 16, anchor: 'middle' },
  { id: 'source-note', x: 8, y: 76, anchor: 'start' },
  { id: 'chain-note', x: 136, y: 76, anchor: 'start' },
  { id: 'udp-note', x: 320, y: 92, anchor: 'middle' },
]

// nodes에는 선명하게 둘 노드와 선을 함께 적는다.
// 기준 시계 — 기준 시계에서 주 서버로. 이어 받기 — 회사의 시각 서버가 주 서버에 묻고 답을 받는다. 클라이언트 — 두 PC가 회사의 시각 서버에 묻고 답을 받는다.
export const ntpStratumScenarios: DiagramScenario[] = [
  { id: 'source', nodes: ['clock', 'primary', 'l-clock'], paths: ['from-clock'] },
  { id: 'chain', nodes: ['primary', 'company', 'l-s1'], paths: ['ask-s1', 'answer-s1'] },
  { id: 'client', nodes: ['company', 'pc1', 'pc2', 'l-pc1', 'l-pc2'], paths: ['ask-pc1', 'answer-pc1', 'ask-pc2', 'answer-pc2'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function NtpStratumDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-ntp-stratum-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes
  const shownNotes = layoutNotes.filter((note) => layerNoteIds.includes(note.id) || (active !== null && noteScenarios[note.id] === active.id))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={ntpStratumScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 160' : '0 0 280 272'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

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
