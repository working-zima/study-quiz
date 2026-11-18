import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-server-roles'].diagrams['site-bindings']

// 세로형은 사이트 박스 둘을 위아래로 쌓고, 두 박스 사이에 요청 노드 둘을 둔다. 박스마다 위 줄에 형식·IP 주소·포트 칸을,
// 아래 줄에 호스트 이름 칸을 「칸 이름: 값」으로 적는다. 위 요청은 위 박스로, 아래 요청은 아래 박스로 화살표가 간다. 노드는 모두 회색이다.
const nodes = [
  { id: 'www-type', x: 16, y: 28, width: 80 },
  { id: 'www-ip', x: 104, y: 28, width: 80 },
  { id: 'www-port', x: 192, y: 28, width: 72 },
  { id: 'www-host', x: 16, y: 68, width: 200 },
  { id: 'req-www', x: 8, y: 128, width: 152 },
  { id: 'req-shop', x: 112, y: 168, width: 160 },
  { id: 'shop-type', x: 16, y: 240, width: 80 },
  { id: 'shop-ip', x: 104, y: 240, width: 80 },
  { id: 'shop-port', x: 192, y: 240, width: 72 },
  { id: 'shop-host', x: 16, y: 280, width: 200 },
]

const groups = [
  { id: 'www-site', x: 8, y: 8, width: 264, height: 100, labelX: 16, labelY: 21 },
  { id: 'shop-site', x: 8, y: 220, width: 264, height: 100, labelX: 16, labelY: 233 },
]

// 화살표는 요청 노드의 변에서 나와 그 요청을 받는 사이트 박스의 변에 닿는다.
const paths: Record<string, string> = {
  'www-req': 'M40 128 V108',
  'shop-req': 'M240 200 V220',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보이고, 요청을 받는 사이트의 호스트 이름 칸 곁에 붙는다.
const noteScenarios: Record<string, string> = {
  'www-key': 'www',
  'shop-key': 'shop',
}

const notes: Note[] = [
  { id: 'www-key', x: 224, y: 87, anchor: 'start' },
  { id: 'shop-key', x: 224, y: 299, anchor: 'start' },
]

// 가로형은 위에 요청 노드 둘을 나란히 두고, 그 아래 사이트 박스 둘을 좌우로 둔다. 박스마다 형식·IP 주소 줄, 포트 줄, 호스트 이름 줄을 쌓는다.
const wideNodes = [
  { id: 'www-type', x: 16, y: 88, width: 80 },
  { id: 'www-ip', x: 104, y: 88, width: 80 },
  { id: 'www-port', x: 16, y: 128, width: 72 },
  { id: 'www-host', x: 16, y: 168, width: 192 },
  { id: 'req-www', x: 24, y: 8, width: 152 },
  { id: 'req-shop', x: 248, y: 8, width: 160 },
  { id: 'shop-type', x: 232, y: 88, width: 80 },
  { id: 'shop-ip', x: 320, y: 88, width: 80 },
  { id: 'shop-port', x: 232, y: 128, width: 72 },
  { id: 'shop-host', x: 232, y: 168, width: 192 },
]

const wideGroups = [
  { id: 'www-site', x: 8, y: 64, width: 208, height: 160, labelX: 16, labelY: 77 },
  { id: 'shop-site', x: 224, y: 64, width: 208, height: 160, labelX: 232, labelY: 77 },
]

const widePaths: Record<string, string> = {
  'www-req': 'M100 40 V64',
  'shop-req': 'M328 40 V64',
}

const wideNotes: Note[] = [
  { id: 'www-key', x: 16, y: 216, anchor: 'start' },
  { id: 'shop-key', x: 232, y: 216, anchor: 'start' },
]

// www 요청: Host: www.example.com 요청과 www.example.com 사이트의 네 칸. shop 요청: Host: shop.example.com 요청과 shop.example.com 사이트의 네 칸.
export const siteBindingsScenarios: DiagramScenario[] = [
  { id: 'www', nodes: ['req-www', 'www-type', 'www-ip', 'www-port', 'www-host'], paths: ['www-req'] },
  { id: 'shop', nodes: ['req-shop', 'shop-type', 'shop-ip', 'shop-port', 'shop-host'], paths: ['shop-req'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function SiteBindingsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-site-bindings-arrow`
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
      scenarios={siteBindingsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 232' : '0 0 280 328'}>
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
