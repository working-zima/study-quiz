import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-security'].diagrams['ids-ips-placement']

// 세로형은 맨 위에 알려진 공격 모양이 든 요청, 그 아래에 FW01, 맨 아래에 사내 네트워크 박스를 둔다.
// 박스 안에는 왼쪽에 길 위의 IPS01, 오른쪽에 사본을 받는 IDS, 그 아래 가운데에 웹 서버를 둔다.
// FW01에서 웹 서버로 곧장 내려가는 길은 IDS를 둔 경우이고, IPS01로 가는 길은 IPS01을 길 위에 둔 경우다. 노드는 모두 회색이다.
const nodes = [
  { id: 'request', x: 58, y: 16, width: 164 },
  { id: 'fw01', x: 100, y: 72, width: 80 },
  { id: 'ips01', x: 48, y: 156, width: 80 },
  { id: 'ids', x: 176, y: 156, width: 80 },
  { id: 'web', x: 100, y: 224, width: 80 },
]

const groups = [
  { id: 'internal', x: 8, y: 128, width: 264, height: 144, labelX: 16, labelY: 141 },
]

const paths: Record<string, string> = {
  'request-fw': 'M140 48 V72',
  'fw-web': 'M140 104 V224',
  'fw-ids': 'M180 88 H216 V156',
  'fw-ips': 'M100 88 H88 V156',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보이고, 각각 IDS와 IPS01 바로 아래에 둔다.
const noteScenarios: Record<string, string> = {
  'ids-note': 'ids',
  'ips-note': 'ips',
}

const notes: Note[] = [
  { id: 'ids-note', x: 216, y: 206, anchor: 'middle' },
  { id: 'ips-note', x: 88, y: 206, anchor: 'middle' },
]

// 가로형은 왼쪽에 요청, 가운데에 FW01, 오른쪽에 사내 네트워크 박스를 둔다. 박스 안에는 위에 IPS01, 아래에 IDS, 오른쪽 가운데에 웹 서버를 두고,
// 곁말은 IPS01·IDS의 오른쪽에 둔다.
const wideNodes = [
  { id: 'request', x: 8, y: 68, width: 164 },
  { id: 'fw01', x: 188, y: 68, width: 64 },
  { id: 'ips01', x: 276, y: 28, width: 56 },
  { id: 'ids', x: 276, y: 108, width: 56 },
  { id: 'web', x: 356, y: 68, width: 72 },
]

const wideGroups = [
  { id: 'internal', x: 268, y: 8, width: 168, height: 148, labelX: 276, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'request-fw': 'M172 84 H188',
  'fw-web': 'M252 84 H356',
  'fw-ids': 'M220 100 V124 H276',
  'fw-ips': 'M220 68 V44 H276',
}

const wideNotes: Note[] = [
  { id: 'ids-note', x: 340, y: 128, anchor: 'start' },
  { id: 'ips-note', x: 340, y: 48, anchor: 'start' },
]

// IDS: 요청은 FW01을 지나 그대로 웹 서버에 닿고, IDS에는 그 사본이 간다. IPS: 요청이 FW01을 지나 IPS01에서 멈춘다.
export const idsIpsPlacementScenarios: DiagramScenario[] = [
  {
    id: 'ids',
    nodes: ['request', 'fw01', 'ids', 'web'],
    paths: ['request-fw', 'fw-web', 'fw-ids'],
  },
  {
    id: 'ips',
    nodes: ['request', 'fw01', 'ips01'],
    paths: ['request-fw', 'fw-ips'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function IdsIpsPlacementDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-ids-ips-placement-arrow`
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
      scenarios={idsIpsPlacementScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 164' : '0 0 280 280'}>
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
