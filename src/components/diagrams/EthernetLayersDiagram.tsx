import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ethernet'].diagrams['ethernet-layers']

// 컴퓨터 A를 위에, 컴퓨터 B를 아래에 두고 그 사이에 IEEE 802.3이 정하는 것을 둔다.
// 세 박스는 같은 두 열을 쓴다 — 왼쪽 열이 데이터 링크 계층, 오른쪽 열이 물리 계층이다.
const groups = [
  { id: 'computer-a', x: 4, y: 8, width: 272, height: 68 },
  { id: 'ethernet', x: 4, y: 100, width: 272, height: 68 },
  { id: 'computer-b', x: 4, y: 192, width: 272, height: 68 },
]

// 계층은 두 컴퓨터에 하나씩 있고, 프레임과 케이블은 가운데 박스에 있다. 노드는 모두 회색이다.
const nodes = [
  { id: 'a-data-link', x: 20, y: 32, width: 112 },
  { id: 'a-physical', x: 148, y: 32, width: 112 },
  { id: 'frame', x: 20, y: 124, width: 112 },
  { id: 'cable', x: 148, y: 124, width: 112 },
  { id: 'b-data-link', x: 20, y: 216, width: 112 },
  { id: 'b-physical', x: 148, y: 216, width: 112 },
]

// 연결선 넷은 늘 보인다. 화살표는 그 위에 겹쳐 그리고, 노드 하나에서 다음 노드까지만 간다.
// 선은 그룹 라벨(박스 왼쪽 위)보다 오른쪽 열을 지난다.
const paths: Record<string, string> = {
  'a-frame': 'M76 64 V124',
  'frame-b': 'M76 156 V216',
  'a-cable': 'M204 64 V124',
  'cable-b': 'M204 156 V216',
  'send-frame': 'M76 64 V124',
  'deliver-frame': 'M76 156 V216',
  'send-signal': 'M204 64 V124',
  'deliver-signal': 'M204 156 V216',
}

const linkIds = ['a-frame', 'frame-b', 'a-cable', 'cable-b']

// 가로형은 컴퓨터 A를 왼쪽에, 컴퓨터 B를 오른쪽에 두고 그 사이에 IEEE 802.3 박스를 둔다.
// 세 박스는 같은 두 줄을 쓴다 — 윗줄이 데이터 링크 계층, 아랫줄이 물리 계층이다.
const wideGroups = [
  { id: 'computer-a', x: 8, y: 8, width: 128, height: 112 },
  { id: 'ethernet', x: 156, y: 8, width: 128, height: 112 },
  { id: 'computer-b', x: 304, y: 8, width: 128, height: 112 },
]

const wideNodes = [
  { id: 'a-data-link', x: 16, y: 32, width: 112 },
  { id: 'a-physical', x: 16, y: 76, width: 112 },
  { id: 'frame', x: 164, y: 32, width: 112 },
  { id: 'cable', x: 164, y: 76, width: 112 },
  { id: 'b-data-link', x: 312, y: 32, width: 112 },
  { id: 'b-physical', x: 312, y: 76, width: 112 },
]

const widePaths: Record<string, string> = {
  'a-frame': 'M128 48 H164',
  'frame-b': 'M276 48 H312',
  'a-cable': 'M128 92 H164',
  'cable-b': 'M276 92 H312',
  'send-frame': 'M128 48 H164',
  'deliver-frame': 'M276 48 H312',
  'send-signal': 'M128 92 H164',
  'deliver-signal': 'M276 92 H312',
}

// nodes에는 선명하게 둘 노드와 연결선을 함께 적는다.
export const ethernetLayersScenarios: DiagramScenario[] = [
  {
    id: 'physical',
    nodes: ['a-physical', 'cable', 'b-physical', 'a-cable', 'cable-b'],
    paths: ['send-signal', 'deliver-signal'],
  },
  {
    id: 'data-link',
    nodes: ['a-data-link', 'frame', 'b-data-link', 'a-frame', 'frame-b'],
    paths: ['send-frame', 'deliver-frame'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function EthernetLayersDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-ethernet-layers-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={ethernetLayersScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 128' : '0 0 280 268'}>
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
        </svg>
      </div>
    </DiagramFrame>
  )
}
