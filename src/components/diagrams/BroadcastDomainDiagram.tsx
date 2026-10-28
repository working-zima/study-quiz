import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['hub-switch-vlan'].diagrams['broadcast-domain']

// 위 장면은 호스트 A~D를 스위치 한 대에 하나씩 이은 모습이고, 아래 장면은 호스트 A·B를 이은 스위치 1과
// 호스트 C·D를 이은 스위치 2를 라우터로 이은 모습이다. 세로형은 라우터를 두 스위치 위 가운데에 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'switch', x: 10, y: 8, width: 260 },
  { id: 'host-a', x: 10, y: 72, width: 56 },
  { id: 'host-b', x: 78, y: 72, width: 56 },
  { id: 'host-c', x: 146, y: 72, width: 56 },
  { id: 'host-d', x: 214, y: 72, width: 56 },
  { id: 'switch-1', x: 10, y: 196, width: 124 },
  { id: 'router', x: 110, y: 140, width: 60 },
  { id: 'switch-2', x: 146, y: 196, width: 124 },
  { id: 'r-host-a', x: 10, y: 256, width: 56 },
  { id: 'r-host-b', x: 78, y: 256, width: 56 },
  { id: 'r-host-c', x: 146, y: 256, width: 56 },
  { id: 'r-host-d', x: 214, y: 256, width: 56 },
]

// 케이블과 링크는 늘 보인다. 화살표는 그 위에 겹쳐 그린다 — 호스트 A에서 스위치로 올라가고, 스위치에서 내보낸 쪽으로 간다.
const paths: Record<string, string> = {
  'cable-a': 'M38 40 V72',
  'cable-b': 'M106 40 V72',
  'cable-c': 'M174 40 V72',
  'cable-d': 'M242 40 V72',
  'link-1': 'M122 172 V196',
  'link-2': 'M158 172 V196',
  'r-cable-a': 'M38 228 V256',
  'r-cable-b': 'M106 228 V256',
  'r-cable-c': 'M174 228 V256',
  'r-cable-d': 'M242 228 V256',
  'from-a': 'M38 72 V40',
  'to-b': 'M106 40 V72',
  'to-c': 'M174 40 V72',
  'to-d': 'M242 40 V72',
  'r-from-a': 'M38 256 V228',
  'r-to-b': 'M106 228 V256',
  'r-to-router': 'M122 196 V172',
}

const topLinkIds = ['cable-a', 'cable-b', 'cable-c', 'cable-d']
const bottomLinkIds = ['link-1', 'link-2', 'r-cable-a', 'r-cable-b', 'r-cable-c', 'r-cable-d']
const linkIds = [...topLinkIds, ...bottomLinkIds]

// 도메인 박스는 자기 시나리오에서만 그린다. 박스 하나가 도메인 하나다.
// 브로드캐스트 도메인은 스위치와 호스트 전체를, 충돌 도메인은 케이블과 호스트 하나씩을, 라우터 양쪽 도메인은 스위치와 그 호스트들을 두른다.
const groups = [
  { id: 'bc-one', x: 4, y: 2, width: 272, height: 108, scenarios: ['switch'] },
  { id: 'cd-a', x: 6, y: 46, width: 64, height: 62, scenarios: ['collision'] },
  { id: 'cd-b', x: 74, y: 46, width: 64, height: 62, scenarios: ['collision'] },
  { id: 'cd-c', x: 142, y: 46, width: 64, height: 62, scenarios: ['collision'] },
  { id: 'cd-d', x: 210, y: 46, width: 64, height: 62, scenarios: ['collision'] },
  { id: 'domain-1', x: 4, y: 188, width: 134, height: 106, scenarios: ['router'] },
  { id: 'domain-2', x: 142, y: 188, width: 134, height: 106, scenarios: ['router'] },
]

// 개수 곁말은 각 장면 아래 가운데에, 「넘기지 않음」은 라우터 바로 오른쪽에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle', scenarios: string[] }[] = [
  { id: 'one-domain', x: 140, y: 124, anchor: 'middle', scenarios: ['switch'] },
  { id: 'four-collision', x: 140, y: 124, anchor: 'middle', scenarios: ['collision'] },
  { id: 'stop', x: 176, y: 160, anchor: 'start', scenarios: ['router'] },
  { id: 'two-domains', x: 140, y: 310, anchor: 'middle', scenarios: ['router'] },
]

// 가로형은 아래 장면의 스위치 1·라우터·스위치 2를 한 줄로 늘어놓는다. 위 장면은 세로형과 같은 모양이다.
const wideNodes = [
  { id: 'switch', x: 14, y: 8, width: 412 },
  { id: 'host-a', x: 14, y: 64, width: 88 },
  { id: 'host-b', x: 122, y: 64, width: 88 },
  { id: 'host-c', x: 230, y: 64, width: 88 },
  { id: 'host-d', x: 338, y: 64, width: 88 },
  { id: 'switch-1', x: 14, y: 132, width: 148 },
  { id: 'router', x: 190, y: 132, width: 60 },
  { id: 'switch-2', x: 278, y: 132, width: 148 },
  { id: 'r-host-a', x: 14, y: 196, width: 68 },
  { id: 'r-host-b', x: 94, y: 196, width: 68 },
  { id: 'r-host-c', x: 278, y: 196, width: 68 },
  { id: 'r-host-d', x: 358, y: 196, width: 68 },
]

const widePaths: Record<string, string> = {
  'cable-a': 'M58 40 V64',
  'cable-b': 'M166 40 V64',
  'cable-c': 'M274 40 V64',
  'cable-d': 'M382 40 V64',
  'link-1': 'M190 148 H162',
  'link-2': 'M250 148 H278',
  'r-cable-a': 'M48 164 V196',
  'r-cable-b': 'M128 164 V196',
  'r-cable-c': 'M312 164 V196',
  'r-cable-d': 'M392 164 V196',
  'from-a': 'M58 64 V40',
  'to-b': 'M166 40 V64',
  'to-c': 'M274 40 V64',
  'to-d': 'M382 40 V64',
  'r-from-a': 'M48 196 V164',
  'r-to-b': 'M128 164 V196',
  'r-to-router': 'M162 148 H190',
}

// 박스와 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형 groups·notes에서 id로 가져온다.
const wideGroups = [
  { id: 'bc-one', x: 6, y: 2, width: 428, height: 100 },
  { id: 'cd-a', x: 8, y: 44, width: 100, height: 56 },
  { id: 'cd-b', x: 116, y: 44, width: 100, height: 56 },
  { id: 'cd-c', x: 224, y: 44, width: 100, height: 56 },
  { id: 'cd-d', x: 332, y: 44, width: 100, height: 56 },
  { id: 'domain-1', x: 8, y: 126, width: 160, height: 108 },
  { id: 'domain-2', x: 272, y: 126, width: 160, height: 108 },
]

const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' }[] = [
  { id: 'one-domain', x: 220, y: 116, anchor: 'middle' },
  { id: 'four-collision', x: 220, y: 116, anchor: 'middle' },
  { id: 'stop', x: 220, y: 182, anchor: 'middle' },
  { id: 'two-domains', x: 220, y: 252, anchor: 'middle' },
]

// nodes에는 선명하게 둘 노드와 케이블·링크를 함께 적는다. 고른 장면 밖과, 라우터 너머로 프레임이 가지 않는 쪽은 흐려진다.
export const broadcastDomainScenarios: DiagramScenario[] = [
  { id: 'switch', nodes: ['switch', 'host-a', 'host-b', 'host-c', 'host-d', ...topLinkIds], paths: ['from-a', 'to-b', 'to-c', 'to-d'] },
  { id: 'collision', nodes: ['switch', 'host-a', 'host-b', 'host-c', 'host-d', ...topLinkIds], paths: [] },
  { id: 'router', nodes: ['switch-1', 'router', 'r-host-a', 'r-host-b', 'link-1', 'r-cable-a', 'r-cable-b'], paths: ['r-from-a', 'r-to-b', 'r-to-router'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function BroadcastDomainDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-broadcast-domain-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutGroups = wide ? wideGroups.map((group) => ({ ...groups.find(({ id }) => id === group.id)!, ...group })) : groups
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={broadcastDomainScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 260' : '0 0 280 316'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {active && layoutGroups.filter((group) => group.scenarios.includes(active.id)).map((group) => (
            <rect
              key={group.id}
              data-group={group.id}
              x={group.x}
              y={group.y}
              width={group.width}
              height={group.height}
              rx="4"
              className="fill-none stroke-disabled"
              strokeWidth="1"
            />
          ))}

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
