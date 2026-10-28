import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['protocols-encapsulation'].diagrams['layer-mapping']

// 왼쪽 박스에 OSI 모델의 일곱 계층, 오른쪽 박스에 TCP/IP 모델의 네 계층을 맨 위 응용 계층부터 쌓는다.
const groups = [
  { id: 'osi', x: 4, y: 8, width: 112, height: 304 },
  { id: 'tcpip', x: 152, y: 8, width: 124, height: 304 },
]

// TCP/IP 계층은 짝지은 OSI 계층들의 가운데 높이에 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'osi-application', x: 12, y: 32, width: 96 },
  { id: 'osi-presentation', x: 12, y: 72, width: 96 },
  { id: 'osi-session', x: 12, y: 112, width: 96 },
  { id: 'osi-transport', x: 12, y: 152, width: 96 },
  { id: 'osi-network', x: 12, y: 192, width: 96 },
  { id: 'osi-data-link', x: 12, y: 232, width: 96 },
  { id: 'osi-physical', x: 12, y: 272, width: 96 },
  { id: 'tcpip-application', x: 156, y: 72, width: 116 },
  { id: 'tcpip-transport', x: 156, y: 152, width: 116 },
  { id: 'tcpip-internet', x: 156, y: 192, width: 116 },
  { id: 'tcpip-network-access', x: 156, y: 252, width: 116 },
]

// 연결선은 늘 보이고, OSI 계층의 오른쪽 변에서 짝지은 TCP/IP 계층의 왼쪽 변으로 간다.
// 한 TCP/IP 계층에 여럿이 모이면 두 박스 사이에서 꺾어 서로 다른 높이로 들어간다.
const paths: Record<string, string> = {
  'map-application': 'M108 48 H132 V80 H156',
  'map-presentation': 'M108 88 H156',
  'map-session': 'M108 128 H132 V96 H156',
  'map-transport': 'M108 168 H156',
  'map-network': 'M108 208 H156',
  'map-data-link': 'M108 248 H132 V264 H156',
  'map-physical': 'M108 288 H132 V276 H156',
}

const linkIds = ['map-application', 'map-presentation', 'map-session', 'map-transport', 'map-network', 'map-data-link', 'map-physical']

// 세션 계층을 응용 계층 자리에 둔 것은 강의의 정리라 그 선만 점선으로 그린다(tcp-ip-model 마지막 앞 문단).
const lectureLinks = ['map-session']

// 세션 곁말은 응용 계층 시나리오에서만 보인다. 세로형은 TCP/IP 박스 안 세션 계층 높이의 빈자리에 둔다.
const note = { id: 'session-note', x: 160, y: 131, textAnchor: 'start' as const }

// 가로형은 두 박스를 양 끝에 벌리고 계층 간격을 줄인다. 연결선은 두 박스 사이 가운데에서 꺾는다.
const wideGroups = [
  { id: 'osi', x: 8, y: 8, width: 152, height: 280 },
  { id: 'tcpip', x: 280, y: 8, width: 152, height: 280 },
]

const wideNodes = [
  { id: 'osi-application', x: 20, y: 32, width: 128 },
  { id: 'osi-presentation', x: 20, y: 68, width: 128 },
  { id: 'osi-session', x: 20, y: 104, width: 128 },
  { id: 'osi-transport', x: 20, y: 140, width: 128 },
  { id: 'osi-network', x: 20, y: 176, width: 128 },
  { id: 'osi-data-link', x: 20, y: 212, width: 128 },
  { id: 'osi-physical', x: 20, y: 248, width: 128 },
  { id: 'tcpip-application', x: 292, y: 68, width: 128 },
  { id: 'tcpip-transport', x: 292, y: 140, width: 128 },
  { id: 'tcpip-internet', x: 292, y: 176, width: 128 },
  { id: 'tcpip-network-access', x: 292, y: 230, width: 128 },
]

const widePaths: Record<string, string> = {
  'map-application': 'M148 48 H220 V76 H292',
  'map-presentation': 'M148 84 H292',
  'map-session': 'M148 120 H220 V92 H292',
  'map-transport': 'M148 156 H292',
  'map-network': 'M148 192 H292',
  'map-data-link': 'M148 228 H220 V240 H292',
  'map-physical': 'M148 264 H220 V252 H292',
}

// 가로형은 두 박스 사이가 넓어 세션 곁말을 점선 바로 아래에 둔다.
const wideNote = { id: 'session-note', x: 220, y: 136, textAnchor: 'middle' as const }

// nodes에는 선명하게 둘 계층과 연결선을 함께 적는다. 이 도식에는 화살표가 없다.
export const layerMappingScenarios: DiagramScenario[] = [
  {
    id: 'application',
    nodes: ['tcpip-application', 'osi-application', 'osi-presentation', 'osi-session', 'map-application', 'map-presentation', 'map-session'],
    paths: [],
  },
  { id: 'transport', nodes: ['tcpip-transport', 'osi-transport', 'map-transport'], paths: [] },
  { id: 'internet', nodes: ['tcpip-internet', 'osi-network', 'map-network'], paths: [] },
  {
    id: 'network-access',
    nodes: ['tcpip-network-access', 'osi-data-link', 'osi-physical', 'map-data-link', 'map-physical'],
    paths: [],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function LayerMappingDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNote = wide ? wideNote : note

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={layerMappingScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 296' : '0 0 280 320'}>
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
            <path
              key={id}
              data-link={id}
              d={layoutPaths[id]}
              className="fill-none stroke-muted"
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeDasharray={lectureLinks.includes(id) ? '4 3' : undefined}
              opacity={opacityOf(id)}
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

          {active?.id === 'application' && (
            <text data-note={layoutNote.id} x={layoutNote.x} y={layoutNote.y} textAnchor={layoutNote.textAnchor} className="fill-muted" fontSize="9">
              {text.notes![layoutNote.id]}
            </text>
          )}
        </svg>
      </div>
    </DiagramFrame>
  )
}
