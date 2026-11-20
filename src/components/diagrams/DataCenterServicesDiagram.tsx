import { useId } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame } from './DiagramFrame'

const text = visualsByTopicId['cloud-sdn'].diagrams['data-center-services']

// 정지 그림이다. 「인터넷 데이터 센터」 박스 안 왼쪽 열에 전원 설비·냉방 설비·네트워크 장비를 위에서 아래로 쌓고, 오른쪽에 서버 WEB01을 둔다.
// 설비마다 WEB01로 가는 화살표가 설비가 서버를 받치는 쪽을 가리킨다. 박스 밖의 「바깥의 네트워크」는 네트워크 장비와 가는 선으로 이어진다.
// 노드는 모두 회색이다. 본문이 맡기기와 빌리기를 가르지 않으므로 시나리오를 두지 않는다.
const nodes = [
  { id: 'power', x: 24, y: 32, width: 104 },
  { id: 'cooling', x: 24, y: 80, width: 104 },
  { id: 'network', x: 24, y: 128, width: 104 },
  { id: 'web01', x: 168, y: 80, width: 88 },
  { id: 'outside', x: 24, y: 196, width: 104 },
]

const groups = [
  { id: 'idc', x: 8, y: 8, width: 264, height: 168, labelX: 16, labelY: 21 },
]

// 전원 설비의 화살표는 WEB01의 위 변으로, 냉방 설비는 왼쪽 변으로, 네트워크 장비는 아래 변으로 들어간다 — 세 화살표는 서로 가로지르지 않는다.
// network-outside는 화살표가 아니라 가는 선이다(linkIds). 네트워크 장비의 아래 변에서 박스 밖 바깥의 네트워크의 위 변으로 간다.
// 교차 검사기가 늘 보이는 선도 읽도록 같은 경로 선언에 둔다.
const paths: Record<string, string> = {
  'power-web01': 'M128 48 H212 V80',
  'cooling-web01': 'M128 96 H168',
  'network-web01': 'M128 144 H212 V112',
  'network-outside': 'M76 160 V196',
}

const linkIds = ['network-outside']

// 가로형은 박스 안 배치를 넓히고, 바깥의 네트워크를 박스 오른쪽 밖에 둔다. 가는 선은 네트워크 장비의 오른쪽 변에서 WEB01 아래를 지나 나간다.
const wideNodes = [
  { id: 'power', x: 24, y: 32, width: 112 },
  { id: 'cooling', x: 24, y: 80, width: 112 },
  { id: 'network', x: 24, y: 128, width: 112 },
  { id: 'web01', x: 208, y: 80, width: 96 },
  { id: 'outside', x: 332, y: 136, width: 100 },
]

const wideGroups = [
  { id: 'idc', x: 8, y: 8, width: 312, height: 168, labelX: 16, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'power-web01': 'M136 48 H256 V80',
  'cooling-web01': 'M136 96 H208',
  'network-web01': 'M136 144 H256 V112',
  'network-outside': 'M136 152 H332',
}

const noop = () => {}

export function DataCenterServicesDiagram() {
  const arrowId = `${useId()}-data-center-services-arrow`
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths

  return (
    <DiagramFrame label={text.label} question={text.question} idleCaption={text.idleCaption} legend={text.legend} active={null} onSelect={noop}>
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 184' : '0 0 280 236'}>
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

          {Object.entries(layoutPaths).filter(([id]) => linkIds.includes(id)).map(([id, d]) => (
            <path key={id} data-link={id} d={d} className="fill-none stroke-muted" strokeWidth="1.5" />
          ))}

          {Object.entries(layoutPaths).filter(([id]) => !linkIds.includes(id)).map(([id, d]) => (
            <path
              key={id}
              data-path={id}
              d={d}
              className="fill-none stroke-title"
              strokeWidth="2"
              strokeLinejoin="round"
              markerEnd={`url(#${arrowId})`}
            />
          ))}

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id}>
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
