import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['app-protocols-mgmt-security'].diagrams['sntp-client']

// 세로형은 윗줄에 「시각 서버 1」·「시각 서버 2」·「시각 서버 3」을, 아랫줄에 NTP 클라이언트 「PC 1」과 SNTP 클라이언트 「작은 기기」를 둔다.
// 「작은 기기」는 「시각 서버 3」 바로 아래에 두어 그 요청이 곧게 올라가게 한다. 노드는 모두 회색이다.
const nodes = [
  { id: 's1', x: 8, y: 8, width: 84 },
  { id: 's2', x: 98, y: 8, width: 84 },
  { id: 's3', x: 188, y: 8, width: 84 },
  { id: 'pc1', x: 8, y: 136, width: 104 },
  { id: 'device', x: 168, y: 136, width: 104 },
]

// 요청은 클라이언트의 위 변에서 나가 시각 서버의 아래 변으로 들어간다. 「PC 1」의 세 요청은 꺾이는 줄(y 88, y 104)을 달리해 서로 엇갈리지 않는다.
const paths: Record<string, string> = {
  'ask-1': 'M40 136 V40',
  'ask-2': 'M80 136 V88 H140 V40',
  'ask-3': 'M96 136 V104 H216 V40',
  'sntp-ask': 'M232 136 V40',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 그 시나리오를 골랐을 때만 보인다.
const noteScenarios: Record<string, string> = {
  'compare-note': 'ntp-client',
  'ntp-udp': 'ntp-client',
  'single-note': 'sntp-client',
  'sntp-udp': 'sntp-client',
}

const notes: Note[] = [
  { id: 'compare-note', x: 8, y: 188, anchor: 'start' },
  { id: 'ntp-udp', x: 148, y: 72, anchor: 'start' },
  { id: 'single-note', x: 272, y: 188, anchor: 'end' },
  { id: 'sntp-udp', x: 224, y: 124, anchor: 'end' },
]

// 가로형은 같은 배치를 넓힌다. 시각 서버 셋을 윗줄에 고르게 벌리고, 「PC 1」은 「시각 서버 1」 아래, 「작은 기기」는 「시각 서버 3」 아래에 둔다.
const wideNodes = [
  { id: 's1', x: 24, y: 8, width: 104 },
  { id: 's2', x: 168, y: 8, width: 104 },
  { id: 's3', x: 312, y: 8, width: 104 },
  { id: 'pc1', x: 24, y: 136, width: 104 },
  { id: 'device', x: 312, y: 136, width: 104 },
]

const widePaths: Record<string, string> = {
  'ask-1': 'M56 136 V40',
  'ask-2': 'M96 136 V88 H220 V40',
  'ask-3': 'M112 136 V104 H344 V40',
  'sntp-ask': 'M376 136 V40',
}

const wideNotes: Note[] = [
  { id: 'compare-note', x: 24, y: 188, anchor: 'start' },
  { id: 'ntp-udp', x: 232, y: 72, anchor: 'start' },
  { id: 'single-note', x: 416, y: 188, anchor: 'end' },
  { id: 'sntp-udp', x: 368, y: 124, anchor: 'end' },
]

// NTP — 「PC 1」이 시각 서버 세 곳에 묻는다. SNTP — 「작은 기기」가 「시각 서버 3」 한 곳에만 묻는다.
export const sntpClientScenarios: DiagramScenario[] = [
  { id: 'ntp-client', nodes: ['pc1', 's1', 's2', 's3'], paths: ['ask-1', 'ask-2', 'ask-3'] },
  { id: 'sntp-client', nodes: ['device', 's3'], paths: ['sntp-ask'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function SntpClientDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-sntp-client-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={sntpClientScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 196' : '0 0 280 196'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

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
