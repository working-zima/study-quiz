import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['arp'].diagrams['arp-exchange']

// 스위치를 맨 위에 두고 호스트 A~D를 그 아래 한 줄로 이었다. 호스트 아래에는 그 호스트의 IP 주소를 늘 적어 둔다.
// 노드는 모두 회색이다.
const nodes = [
  { id: 'switch', x: 10, y: 8, width: 260 },
  { id: 'host-a', x: 10, y: 72, width: 56 },
  { id: 'host-b', x: 78, y: 72, width: 56 },
  { id: 'host-c', x: 146, y: 72, width: 56 },
  { id: 'host-d', x: 214, y: 72, width: 56 },
]

// 케이블 넷은 늘 보인다. 화살표는 케이블 위에 겹쳐 그린다 — 요청은 A에서 스위치로 올라가 B·C·D로 내려가고,
// 응답은 B에서 스위치로 올라가 A로만 내려간다.
const paths: Record<string, string> = {
  'cable-a': 'M38 40 V72',
  'cable-b': 'M106 40 V72',
  'cable-c': 'M174 40 V72',
  'cable-d': 'M242 40 V72',
  'req-from-a': 'M38 72 V40',
  'req-to-b': 'M106 40 V72',
  'req-to-c': 'M174 40 V72',
  'req-to-d': 'M242 40 V72',
  'rep-from-b': 'M106 72 V40',
  'rep-to-a': 'M38 40 V72',
}

const linkIds = ['cable-a', 'cable-b', 'cable-c', 'cable-d']

// IP 주소 곁말은 늘 보이고 자기 호스트 바로 아래 가운데에 놓여 그 호스트의 흐림을 따른다.
const hostNotes = [
  { id: 'ip-a', host: 'host-a', x: 38, y: 118 },
  { id: 'ip-b', host: 'host-b', x: 106, y: 118 },
  { id: 'ip-c', host: 'host-c', x: 174, y: 118 },
  { id: 'ip-d', host: 'host-d', x: 242, y: 118 },
]

// 시나리오 곁말 — 확인 결과는 자기 호스트 아래에, 요청과 응답의 내용은 맨 아래 가운데에 두 줄로 둔다.
const notes = [
  { id: 'request-ip', x: 140, y: 140, scenarios: ['request'] },
  { id: 'request-mac', x: 140, y: 156, scenarios: ['request'] },
  { id: 'check-b', x: 106, y: 134, scenarios: ['check'] },
  { id: 'check-c', x: 174, y: 134, scenarios: ['check'] },
  { id: 'check-d', x: 242, y: 134, scenarios: ['check'] },
  { id: 'reply-mac', x: 140, y: 140, scenarios: ['reply'] },
  { id: 'reply-dst', x: 140, y: 156, scenarios: ['reply'] },
]

// 가로형도 같은 짜임이다. 폭이 넓어진 만큼 호스트를 넓히고 케이블을 줄인다.
const wideNodes = [
  { id: 'switch', x: 14, y: 8, width: 412 },
  { id: 'host-a', x: 14, y: 64, width: 88 },
  { id: 'host-b', x: 122, y: 64, width: 88 },
  { id: 'host-c', x: 230, y: 64, width: 88 },
  { id: 'host-d', x: 338, y: 64, width: 88 },
]

const widePaths: Record<string, string> = {
  'cable-a': 'M58 40 V64',
  'cable-b': 'M166 40 V64',
  'cable-c': 'M274 40 V64',
  'cable-d': 'M382 40 V64',
  'req-from-a': 'M58 64 V40',
  'req-to-b': 'M166 40 V64',
  'req-to-c': 'M274 40 V64',
  'req-to-d': 'M382 40 V64',
  'rep-from-b': 'M166 64 V40',
  'rep-to-a': 'M58 40 V64',
}

// 곁말의 자리만 배치마다 다르다. 붙는 호스트와 보이는 시나리오는 세로형에서 id로 가져온다.
const wideHostNotes = [
  { id: 'ip-a', x: 58, y: 112 },
  { id: 'ip-b', x: 166, y: 112 },
  { id: 'ip-c', x: 274, y: 112 },
  { id: 'ip-d', x: 382, y: 112 },
]

const wideNotes = [
  { id: 'request-ip', x: 220, y: 132 },
  { id: 'request-mac', x: 220, y: 146 },
  { id: 'check-b', x: 166, y: 128 },
  { id: 'check-c', x: 274, y: 128 },
  { id: 'check-d', x: 382, y: 128 },
  { id: 'reply-mac', x: 220, y: 132 },
  { id: 'reply-dst', x: 220, y: 146 },
]

// nodes에는 선명하게 둘 노드와 케이블을 함께 적는다. 확인 단계에서는 요청을 받은 B·C·D만, 응답에서는 응답이 지나는 B·스위치·A만 선명하다.
export const arpExchangeScenarios: DiagramScenario[] = [
  { id: 'request', nodes: ['switch', 'host-a', 'host-b', 'host-c', 'host-d', ...linkIds], paths: ['req-from-a', 'req-to-b', 'req-to-c', 'req-to-d'] },
  { id: 'check', nodes: ['host-b', 'host-c', 'host-d'], paths: [] },
  { id: 'reply', nodes: ['switch', 'host-a', 'host-b', 'cable-a', 'cable-b'], paths: ['rep-from-b', 'rep-to-a'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ArpExchangeDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-arp-exchange-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutHostNotes = wide ? wideHostNotes.map((note) => ({ ...hostNotes.find(({ id }) => id === note.id)!, ...note })) : hostNotes
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={arpExchangeScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 156' : '0 0 280 168'}>
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

          {layoutHostNotes.map((note) => (
            <text key={note.id} data-host-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9" opacity={opacityOf(note.host)}>
              {text.notes![note.id]}
            </text>
          ))}

          {active && layoutNotes.filter((note) => note.scenarios.includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
