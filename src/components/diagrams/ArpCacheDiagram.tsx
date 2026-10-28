import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['arp'].diagrams['arp-cache']

// 호스트 A를 왼쪽 위에, 보낼 상대인 호스트 B·D를 오른쪽 위아래에 둔다. 그 아래 상자가 호스트 A의 ARP 캐시이고,
// 캐시의 한 줄은 IP 주소 칸과 MAC 주소 칸을 맞붙여 그린다. 상자와 그 라벨은 늘 보이고 흐려지지 않는다. 노드는 모두 회색이다.
const groups = [
  { id: 'cache', x: 10, y: 104, width: 260, height: 100 },
]

const nodes = [
  { id: 'host-a', x: 10, y: 8, width: 80 },
  { id: 'host-b', x: 190, y: 8, width: 80 },
  { id: 'host-d', x: 190, y: 56, width: 80 },
  { id: 'row-b-ip', x: 18, y: 124, width: 84 },
  { id: 'row-b-mac', x: 102, y: 124, width: 160 },
  { id: 'row-c-ip', x: 18, y: 164, width: 84 },
  { id: 'row-c-mac', x: 102, y: 164, width: 160 },
]

// 캐시에 있으면 B에게 바로 보낸다. 캐시에 없으면 ARP 요청을 브로드캐스트하므로 B와 D에게 모두 간다 — B에게 가는 요청은
// 바로 보내는 프레임과 같은 길로 그린다.
const paths: Record<string, string> = {
  'send-b': 'M90 24 H190',
  'request-b': 'M90 24 H190',
  'request-d': 'M50 40 V72 H190',
}

// 곁말은 시나리오에서만 보인다. 바로 보냄은 화살표 아래, 요청은 D로 가는 길 아래, 더한 줄과 지워짐은 캐시 상자 아래에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle', scenarios: string[] }[] = [
  { id: 'hit-note', x: 140, y: 52, anchor: 'middle', scenarios: ['hit'] },
  { id: 'request-note', x: 56, y: 98, anchor: 'start', scenarios: ['miss'] },
  { id: 'add-note', x: 140, y: 222, anchor: 'middle', scenarios: ['miss'] },
  { id: 'expire-note', x: 140, y: 222, anchor: 'middle', scenarios: ['expire'] },
]

// 가로형도 같은 짜임이다. 폭이 넓어진 만큼 호스트와 캐시 칸을 넓힌다.
const wideGroups = [
  { id: 'cache', x: 14, y: 104, width: 412, height: 100 },
]

const wideNodes = [
  { id: 'host-a', x: 14, y: 8, width: 100 },
  { id: 'host-b', x: 326, y: 8, width: 100 },
  { id: 'host-d', x: 326, y: 56, width: 100 },
  { id: 'row-b-ip', x: 22, y: 124, width: 140 },
  { id: 'row-b-mac', x: 162, y: 124, width: 256 },
  { id: 'row-c-ip', x: 22, y: 164, width: 140 },
  { id: 'row-c-mac', x: 162, y: 164, width: 256 },
]

const widePaths: Record<string, string> = {
  'send-b': 'M114 24 H326',
  'request-b': 'M114 24 H326',
  'request-d': 'M64 40 V72 H326',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오와 글 정렬은 세로형에서 id로 가져온다.
const wideNotes = [
  { id: 'hit-note', x: 220, y: 52 },
  { id: 'request-note', x: 70, y: 98 },
  { id: 'add-note', x: 220, y: 222 },
  { id: 'expire-note', x: 220, y: 222 },
]

const rowIds = ['row-b-ip', 'row-b-mac', 'row-c-ip', 'row-c-mac']

// 시간이 지남에서는 지워지는 C의 줄만 흐려진다.
export const arpCacheScenarios: DiagramScenario[] = [
  { id: 'hit', nodes: ['host-a', 'host-b', 'row-b-ip', 'row-b-mac'], paths: ['send-b'] },
  { id: 'miss', nodes: ['host-a', 'host-b', 'host-d', ...rowIds], paths: ['request-b', 'request-d'] },
  { id: 'expire', nodes: ['host-a', 'host-b', 'host-d', 'row-b-ip', 'row-b-mac'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ArpCacheDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-arp-cache-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={arpCacheScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 232' : '0 0 280 232'}>
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
            <text key={group.id} data-group-label={group.id} x={group.x + 10} y={group.y + 14} className="fill-muted" fontSize="9">
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
