import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-devices'].diagrams['device-layers']

// 세로형은 왼쪽 열에 계층 칸 다섯을 아래에서 위로(물리 → 데이터 링크 → 네트워크 → 전송 → 응용) 쌓고,
// 오른쪽 열에 장비를 그 장비가 읽는 가장 높은 계층의 높이에 둔다. 게이트웨이는 한 계층에 묶이지 않아 계층 칸 아래에 따로 둔다.
// 화살표는 장비에서 그 장비가 읽는 가장 높은 계층 칸으로 간다(부하 분산 장치는 전송·응용 둘). 노드는 모두 회색이다.
const nodes = [
  { id: 'application', x: 8, y: 16, width: 112 },
  { id: 'transport', x: 8, y: 56, width: 112 },
  { id: 'network', x: 8, y: 96, width: 112 },
  { id: 'datalink', x: 8, y: 136, width: 112 },
  { id: 'physical', x: 8, y: 176, width: 112 },
  { id: 'load-balancer', x: 160, y: 16, width: 112 },
  { id: 'router', x: 160, y: 96, width: 112 },
  { id: 'bridge-switch', x: 160, y: 136, width: 112 },
  { id: 'repeater-hub', x: 160, y: 176, width: 112 },
  { id: 'gateway', x: 160, y: 224, width: 112 },
]

const paths: Record<string, string> = {
  'repeater-physical': 'M160 192 H120',
  'switch-datalink': 'M160 152 H120',
  'router-network': 'M160 112 H120',
  'lb-application': 'M160 32 H120',
  'lb-transport': 'M168 48 V72 H120',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 시나리오 곁말은 자기 시나리오를 골랐을 때만 보인다. 한 번에 하나만 보이므로 세로형은 맨 아래 같은 자리를 함께 쓴다.
const noteScenarios: Record<string, string> = {
  'physical-note': 'physical',
  'datalink-note': 'datalink',
  'network-note': 'network',
  'upper-note': 'upper',
}

const notes: Note[] = [
  { id: 'physical-note', x: 140, y: 284, anchor: 'middle' },
  { id: 'datalink-note', x: 140, y: 284, anchor: 'middle' },
  { id: 'network-note', x: 140, y: 284, anchor: 'middle' },
  { id: 'upper-note', x: 140, y: 284, anchor: 'middle' },
]

// 게이트웨이의 곁말은 늘 보이고 게이트웨이 노드와 함께 흐려진다.
const gatewayNote: Note = { id: 'gateway-note', x: 152, y: 244, anchor: 'end' }

// 가로형은 같은 두 열을 넓게 벌리고, 시나리오 곁말을 그 장비의 오른쪽에 둔다.
const wideNodes = [
  { id: 'application', x: 16, y: 16, width: 120 },
  { id: 'transport', x: 16, y: 56, width: 120 },
  { id: 'network', x: 16, y: 96, width: 120 },
  { id: 'datalink', x: 16, y: 136, width: 120 },
  { id: 'physical', x: 16, y: 176, width: 120 },
  { id: 'load-balancer', x: 184, y: 16, width: 112 },
  { id: 'router', x: 184, y: 96, width: 112 },
  { id: 'bridge-switch', x: 184, y: 136, width: 112 },
  { id: 'repeater-hub', x: 184, y: 176, width: 112 },
  { id: 'gateway', x: 184, y: 224, width: 112 },
]

const widePaths: Record<string, string> = {
  'repeater-physical': 'M184 192 H136',
  'switch-datalink': 'M184 152 H136',
  'router-network': 'M184 112 H136',
  'lb-application': 'M184 32 H136',
  'lb-transport': 'M192 48 V72 H136',
}

const wideNotes: Note[] = [
  { id: 'physical-note', x: 304, y: 196, anchor: 'start' },
  { id: 'datalink-note', x: 304, y: 156, anchor: 'start' },
  { id: 'network-note', x: 304, y: 116, anchor: 'start' },
  { id: 'upper-note', x: 304, y: 36, anchor: 'start' },
]

const wideGatewayNote: Note = { id: 'gateway-note', x: 304, y: 244, anchor: 'start' }

// 장비마다 그 장비와, 받은 데이터를 풀어 보는 계층 칸(물리 계층부터 읽는 가장 높은 계층까지)이 선명하다.
export const deviceLayersScenarios: DiagramScenario[] = [
  {
    id: 'physical',
    nodes: ['repeater-hub', 'physical'],
    paths: ['repeater-physical'],
  },
  {
    id: 'datalink',
    nodes: ['bridge-switch', 'physical', 'datalink'],
    paths: ['switch-datalink'],
  },
  {
    id: 'network',
    nodes: ['router', 'physical', 'datalink', 'network'],
    paths: ['router-network'],
  },
  {
    id: 'upper',
    nodes: ['load-balancer', 'physical', 'datalink', 'network', 'transport', 'application'],
    paths: ['lb-application', 'lb-transport'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function DeviceLayersDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-device-layers-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes
  const fixedNote = wide ? wideGatewayNote : gatewayNote

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={deviceLayersScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 264' : '0 0 280 296'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

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

          <text
            data-static-note={fixedNote.id}
            x={fixedNote.x}
            y={fixedNote.y}
            textAnchor={fixedNote.anchor}
            className="fill-muted"
            fontSize="9"
            opacity={opacityOf('gateway')}
          >
            {text.notes![fixedNote.id]}
          </text>

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
