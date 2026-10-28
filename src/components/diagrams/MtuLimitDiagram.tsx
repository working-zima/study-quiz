import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ip-protocol'].diagrams['mtu-limit']

// 세로형은 출발지 호스트가 보내려는 패킷 둘을 맨 위에 나란히 두고, 그 아래 출발지 호스트와 라우터를 MTU 1500바이트인 링크 하나로 잇는다.
// 노드는 모두 회색이다.
const nodes = [
  { id: 'packet-ok', x: 16, y: 8, width: 120 },
  { id: 'packet-big', x: 144, y: 8, width: 120 },
  { id: 'host', x: 16, y: 64, width: 248 },
  { id: 'router', x: 84, y: 176, width: 112 },
]

// 링크는 늘 보인다. 화살표는 패킷이 출발지 호스트에게 실리는 길과, 링크를 지나 라우터로 가는 길이다.
const paths: Record<string, string> = {
  'link': 'M140 96 V176',
  'load-ok': 'M76 40 V64',
  'load-big': 'M204 40 V64',
  'pass': 'M140 96 V176',
}

const linkIds = ['link']

// MTU 곁말은 링크 바로 오른쪽에 늘 보이고 링크와 같은 흐림을 따른다.
const linkNotes = [
  { id: 'mtu', link: 'link', x: 148, y: 140, anchor: 'start' as const },
]

// 시나리오 곁말은 링크 왼쪽에 둔다 — 지나가는지, 나누어야 하는지.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'pass-note', x: 132, y: 140, anchor: 'end', scenarios: ['fits'] },
  { id: 'split-note', x: 132, y: 140, anchor: 'end', scenarios: ['too-big'] },
]

// 가로형은 패킷 둘을 왼쪽 열에 세로로 쌓고, 출발지 호스트와 라우터를 오른쪽으로 이어 한 줄에 둔다.
const wideNodes = [
  { id: 'packet-ok', x: 8, y: 16, width: 120 },
  { id: 'packet-big', x: 8, y: 72, width: 120 },
  { id: 'host', x: 160, y: 44, width: 112 },
  { id: 'router', x: 360, y: 44, width: 72 },
]

const widePaths: Record<string, string> = {
  'link': 'M272 60 H360',
  'load-ok': 'M128 32 H144 V60 H160',
  'load-big': 'M128 88 H144 V60 H160',
  'pass': 'M272 60 H360',
}

// 곁말의 자리만 배치마다 다르다. 이어진 링크와 보이는 시나리오는 세로형에서 id로 가져온다.
const wideLinkNotes = [
  { id: 'mtu', x: 316, y: 52, anchor: 'middle' as const },
]

const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'pass-note', x: 316, y: 96, anchor: 'middle' },
  { id: 'split-note', x: 316, y: 96, anchor: 'middle' },
]

// nodes에는 선명하게 둘 노드와 링크를 함께 적는다. MTU를 넘는 패킷은 라우터에 닿지 못하므로 그 시나리오에서는 라우터가 흐려진다.
export const mtuLimitScenarios: DiagramScenario[] = [
  { id: 'fits', nodes: ['packet-ok', 'host', 'router', ...linkIds], paths: ['load-ok', 'pass'] },
  { id: 'too-big', nodes: ['packet-big', 'host', ...linkIds], paths: ['load-big'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function MtuLimitDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-mtu-limit-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutLinkNotes = wide ? wideLinkNotes.map((note) => ({ ...linkNotes.find(({ id }) => id === note.id)!, ...note })) : linkNotes
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={mtuLimitScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 120' : '0 0 280 216'}>
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

          {layoutLinkNotes.map((note) => (
            <text key={note.id} data-link-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9" opacity={opacityOf(note.link)}>
              {text.notes![note.id]}
            </text>
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
