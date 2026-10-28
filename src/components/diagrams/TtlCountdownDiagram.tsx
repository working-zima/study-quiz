import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ip-protocol'].diagrams['ttl-countdown']

// 세로형은 출발지 호스트·라우터 셋·목적지 호스트를 위에서 아래로 한 줄로 두고 링크 넷으로 잇는다. 노드는 모두 회색이다.
const nodes = [
  { id: 'source-host', x: 16, y: 8, width: 112 },
  { id: 'router-1', x: 16, y: 72, width: 112 },
  { id: 'router-2', x: 16, y: 136, width: 112 },
  { id: 'router-3', x: 16, y: 200, width: 112 },
  { id: 'dest-host', x: 16, y: 264, width: 112 },
]

// 링크 넷은 늘 보인다. 화살표는 그 위에 겹쳐 그린다 — 구간 하나가 화살표 하나다.
const paths: Record<string, string> = {
  'link-1': 'M72 40 V72',
  'link-2': 'M72 104 V136',
  'link-3': 'M72 168 V200',
  'link-4': 'M72 232 V264',
  'hop-1': 'M72 40 V72',
  'hop-2': 'M72 104 V136',
  'hop-3': 'M72 168 V200',
  'hop-4': 'M72 232 V264',
}

const linkIds = ['link-1', 'link-2', 'link-3', 'link-4']

// 시나리오 곁말: TTL 값은 그 구간의 화살표 오른쪽에, 버림은 라우터 2 오른쪽에, 닿지 않음은 목적지 호스트 오른쪽에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'arrive-1', x: 80, y: 60, anchor: 'start', scenarios: ['arrive'] },
  { id: 'arrive-2', x: 80, y: 124, anchor: 'start', scenarios: ['arrive'] },
  { id: 'arrive-3', x: 80, y: 188, anchor: 'start', scenarios: ['arrive'] },
  { id: 'arrive-4', x: 80, y: 252, anchor: 'start', scenarios: ['arrive'] },
  { id: 'expire-1', x: 80, y: 60, anchor: 'start', scenarios: ['expire'] },
  { id: 'expire-2', x: 80, y: 124, anchor: 'start', scenarios: ['expire'] },
  { id: 'drop-note', x: 136, y: 156, anchor: 'start', scenarios: ['expire'] },
  { id: 'miss-note', x: 136, y: 284, anchor: 'start', scenarios: ['expire'] },
]

// 가로형은 다섯 장치를 왼쪽에서 오른쪽으로 한 줄에 두고, TTL 값은 구간 위에, 버림과 닿지 않음은 장치 아래에 둔다.
const wideNodes = [
  { id: 'source-host', x: 8, y: 32, width: 80 },
  { id: 'router-1', x: 112, y: 32, width: 56 },
  { id: 'router-2', x: 192, y: 32, width: 56 },
  { id: 'router-3', x: 272, y: 32, width: 56 },
  { id: 'dest-host', x: 352, y: 32, width: 80 },
]

const widePaths: Record<string, string> = {
  'link-1': 'M88 48 H112',
  'link-2': 'M168 48 H192',
  'link-3': 'M248 48 H272',
  'link-4': 'M328 48 H352',
  'hop-1': 'M88 48 H112',
  'hop-2': 'M168 48 H192',
  'hop-3': 'M248 48 H272',
  'hop-4': 'M328 48 H352',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'arrive-1', x: 100, y: 24, anchor: 'middle' },
  { id: 'arrive-2', x: 180, y: 24, anchor: 'middle' },
  { id: 'arrive-3', x: 260, y: 24, anchor: 'middle' },
  { id: 'arrive-4', x: 340, y: 24, anchor: 'middle' },
  { id: 'expire-1', x: 100, y: 24, anchor: 'middle' },
  { id: 'expire-2', x: 180, y: 24, anchor: 'middle' },
  { id: 'drop-note', x: 220, y: 80, anchor: 'middle' },
  { id: 'miss-note', x: 432, y: 80, anchor: 'end' },
]

// nodes에는 선명하게 둘 장치와 링크를 함께 적는다. 버려짐에서는 패킷이 닿지 않는 라우터 3과 목적지 호스트 쪽이 흐려진다.
export const ttlCountdownScenarios: DiagramScenario[] = [
  { id: 'arrive', nodes: ['source-host', 'router-1', 'router-2', 'router-3', 'dest-host', ...linkIds], paths: ['hop-1', 'hop-2', 'hop-3', 'hop-4'] },
  { id: 'expire', nodes: ['source-host', 'router-1', 'router-2', 'link-1', 'link-2'], paths: ['hop-1', 'hop-2'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function TtlCountdownDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-ttl-countdown-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={ttlCountdownScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 96' : '0 0 280 304'}>
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

          {active && layoutNotes.filter((note) => note.scenarios.includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
