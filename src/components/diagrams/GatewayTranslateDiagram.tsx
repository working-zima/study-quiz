import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-devices'].diagrams['gateway-translate']

// 세로형은 위에 전자 우편 시스템 A·B 박스를 나란히 두고(박스마다 그 형식의 메시지), 두 박스 아래 가운데에 메일 게이트웨이를 둔다.
// 형식 바꾸기는 A 형식의 메시지 → 메일 게이트웨이 → B 형식의 메시지로 잇는다. 맨 아래 줄은 PC01 → R01 → 다른 네트워크다.
// 노드는 모두 회색이다.
const nodes = [
  { id: 'msg-a', x: 20, y: 30, width: 104 },
  { id: 'gateway', x: 88, y: 96, width: 104 },
  { id: 'msg-b', x: 156, y: 30, width: 104 },
  { id: 'pc01', x: 8, y: 168, width: 64 },
  { id: 'r01', x: 100, y: 168, width: 64 },
  { id: 'other-net', x: 180, y: 168, width: 92 },
]

const groups = [
  { id: 'system-a', x: 8, y: 8, width: 128, height: 64, labelX: 16, labelY: 21 },
  { id: 'system-b', x: 144, y: 8, width: 128, height: 64, labelX: 152, labelY: 21 },
]

const paths: Record<string, string> = {
  'a-gateway': 'M72 62 V112 H88',
  'gateway-b': 'M192 112 H208 V62',
  'pc01-r01': 'M72 184 H100',
  'r01-other': 'M164 184 H180',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다. 형식 바꾸기의 곁말은 메일 게이트웨이 아래, 기본 게이트웨이의 곁말은 R01 아래에 둔다.
const noteScenarios: Record<string, string> = {
  'translate-note': 'translate',
  'default-note': 'default-gw',
}

const notes: Note[] = [
  { id: 'translate-note', x: 140, y: 148, anchor: 'middle' },
  { id: 'default-note', x: 132, y: 222, anchor: 'middle' },
]

// 가로형은 위 줄에 A 박스 · 메일 게이트웨이 · B 박스를 나란히 두고, 아래 줄에 PC01 · R01 · 다른 네트워크를 둔다.
const wideNodes = [
  { id: 'msg-a', x: 20, y: 30, width: 104 },
  { id: 'gateway', x: 168, y: 30, width: 104 },
  { id: 'msg-b', x: 316, y: 30, width: 104 },
  { id: 'pc01', x: 92, y: 112, width: 64 },
  { id: 'r01', x: 188, y: 112, width: 64 },
  { id: 'other-net', x: 284, y: 112, width: 92 },
]

const wideGroups = [
  { id: 'system-a', x: 8, y: 8, width: 128, height: 64, labelX: 16, labelY: 21 },
  { id: 'system-b', x: 304, y: 8, width: 128, height: 64, labelX: 312, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'a-gateway': 'M124 46 H168',
  'gateway-b': 'M272 46 H316',
  'pc01-r01': 'M156 128 H188',
  'r01-other': 'M252 128 H284',
}

const wideNotes: Note[] = [
  { id: 'translate-note', x: 220, y: 88, anchor: 'middle' },
  { id: 'default-note', x: 220, y: 166, anchor: 'middle' },
]

// 형식 바꾸기: A 형식의 메시지·메일 게이트웨이·B 형식의 메시지가 선명하다. 기본 게이트웨이: PC01·R01·다른 네트워크가 선명하다.
export const gatewayTranslateScenarios: DiagramScenario[] = [
  {
    id: 'translate',
    nodes: ['msg-a', 'gateway', 'msg-b'],
    paths: ['a-gateway', 'gateway-b'],
  },
  {
    id: 'default-gw',
    nodes: ['pc01', 'r01', 'other-net'],
    paths: ['pc01-r01', 'r01-other'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function GatewayTranslateDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-gateway-translate-arrow`
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
      scenarios={gatewayTranslateScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 176' : '0 0 280 232'}>
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
