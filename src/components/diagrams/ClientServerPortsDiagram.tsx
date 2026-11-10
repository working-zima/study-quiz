import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ports'].diagrams['client-server-ports']

// 세로형은 위에 두 클라이언트의 웹 브라우저 박스를 나란히 두고, 가운데 왼쪽에 요청, 오른쪽에 응답 박스, 맨 아래에 서버의 웹 서버 프로그램 박스를 둔다.
// 프로그램 박스 안 노드는 그 프로그램의 IP 주소:포트이고, 요청·응답 박스 안 노드 둘은 그 데이터에 적힌 출발지 포트와 목적지 포트다.
// 요청은 왼쪽 줄을 따라 내려가고 응답은 오른쪽 줄을 따라 올라온다. 노드는 모두 회색이다.
const nodes = [
  { id: 'client-1', x: 14, y: 24, width: 116 },
  { id: 'client-2', x: 150, y: 24, width: 116 },
  { id: 'server', x: 80, y: 216, width: 120 },
  { id: 'req-src', x: 14, y: 104, width: 116 },
  { id: 'req-dst', x: 14, y: 136, width: 116 },
  { id: 'res-src', x: 150, y: 104, width: 116 },
  { id: 'res-dst', x: 150, y: 136, width: 116 },
]

const groups = [
  { id: 'client-1-host', x: 8, y: 8, width: 128, height: 56, labelX: 16, labelY: 20 },
  { id: 'client-2-host', x: 144, y: 8, width: 128, height: 56, labelX: 152, labelY: 20 },
  { id: 'server-host', x: 8, y: 200, width: 264, height: 56, labelX: 16, labelY: 212 },
  { id: 'request', x: 8, y: 88, width: 128, height: 88, labelX: 16, labelY: 100 },
  { id: 'response', x: 144, y: 88, width: 128, height: 88, labelX: 152, labelY: 100 },
]

// 요청: 웹 브라우저 → 요청 → 웹 서버 프로그램. 응답: 웹 서버 프로그램 → 응답 → 웹 브라우저.
const paths: Record<string, string> = {
  'request-out': 'M72 56 V104',
  'request-in': 'M72 168 V192 H110 V216',
  'response-out': 'M170 216 V192 H208 V168',
  'response-in': 'M208 104 V80 H100 V56',
}

// 가로형은 왼쪽 열에 두 웹 브라우저 박스를 위아래로, 가운데 열에 요청과 응답 박스를 위아래로, 오른쪽에 웹 서버 프로그램 박스를 둔다.
const wideNodes = [
  { id: 'client-1', x: 14, y: 24, width: 116 },
  { id: 'client-2', x: 14, y: 152, width: 116 },
  { id: 'server', x: 310, y: 84, width: 116 },
  { id: 'req-src', x: 166, y: 24, width: 116 },
  { id: 'req-dst', x: 166, y: 56, width: 116 },
  { id: 'res-src', x: 166, y: 120, width: 116 },
  { id: 'res-dst', x: 166, y: 152, width: 116 },
]

const wideGroups = [
  { id: 'client-1-host', x: 8, y: 8, width: 128, height: 56, labelX: 16, labelY: 20 },
  { id: 'client-2-host', x: 8, y: 136, width: 128, height: 56, labelX: 16, labelY: 148 },
  { id: 'server-host', x: 304, y: 64, width: 128, height: 64, labelX: 312, labelY: 76 },
  { id: 'request', x: 160, y: 8, width: 128, height: 88, labelX: 168, labelY: 20 },
  { id: 'response', x: 160, y: 104, width: 128, height: 88, labelX: 168, labelY: 116 },
]

const widePaths: Record<string, string> = {
  'request-out': 'M130 40 H166',
  'request-in': 'M282 72 H296 V92 H310',
  'response-out': 'M310 108 H296 V168 H282',
  'response-in': 'M166 136 H148 V48 H130',
}

// 요청·응답: 첫 클라이언트와 서버, 그 데이터의 두 포트가 선명하다. 두 클라이언트: 두 웹 브라우저와 서버만 선명하고 화살표는 없다.
export const clientServerPortsScenarios: DiagramScenario[] = [
  { id: 'request', nodes: ['client-1', 'server', 'req-src', 'req-dst'], paths: ['request-out', 'request-in'] },
  { id: 'response', nodes: ['client-1', 'server', 'res-src', 'res-dst'], paths: ['response-out', 'response-in'] },
  { id: 'two-clients', nodes: ['client-1', 'client-2', 'server'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ClientServerPortsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-client-server-ports-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={clientServerPortsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 200' : '0 0 280 264'}>
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
        </svg>
      </div>
    </DiagramFrame>
  )
}
