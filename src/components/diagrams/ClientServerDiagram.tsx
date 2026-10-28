import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-basics'].diagrams['client-server']

// 노트북을 위에, 네트워크 장비를 가운데에, 웹 사이트의 서버와 다른 서버를 아래에 나란히 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'laptop', x: 92, y: 16, width: 96 },
  { id: 'equipment', x: 92, y: 112, width: 96 },
  { id: 'web-server', x: 16, y: 208, width: 112 },
  { id: 'other-server', x: 152, y: 208, width: 112 },
]

// 호스트와 호스트 사이의 요청과 응답은 네트워크 장비를 거친다. 그래서 화살표 하나는 노드 하나에서 다음 노드까지만 간다.
// 같은 두 노드 사이를 오가는 요청과 응답은 통로를 나눈다 — 아래로 가는 화살표와 위로 가는 화살표가 다른 x를 쓴다.
const paths: Record<string, string> = {
  'web-request-1': 'M124 48 V112',
  'web-request-2': 'M100 144 V208',
  'web-response-1': 'M120 208 V144',
  'web-response-2': 'M156 112 V48',
  'servers-request-1': 'M120 208 V144',
  'servers-request-2': 'M164 144 V208',
  'servers-response-1': 'M180 208 V144',
  'servers-response-2': 'M100 144 V208',
}

// 역할 곁말은 노드 오른쪽이나 아래에, 요청·응답 곁말은 그 화살표 바로 옆에 둔다.
// 웹 사이트의 서버의 두 역할 곁말은 같은 자리에 나온다. 시나리오마다 글만 바뀐다.
const notes = [
  { id: 'laptop-client', x: 200, y: 35, textAnchor: 'start' as const, scenarios: ['web'] },
  { id: 'request-web', x: 118, y: 84, textAnchor: 'end' as const, scenarios: ['web'] },
  { id: 'response-web', x: 162, y: 84, textAnchor: 'start' as const, scenarios: ['web'] },
  { id: 'web-server-role', x: 72, y: 254, textAnchor: 'middle' as const, scenarios: ['web'] },
  { id: 'web-client-role', x: 72, y: 254, textAnchor: 'middle' as const, scenarios: ['between-servers'] },
  { id: 'request-servers', x: 158, y: 180, textAnchor: 'end' as const, scenarios: ['between-servers'] },
  { id: 'response-servers', x: 186, y: 180, textAnchor: 'start' as const, scenarios: ['between-servers'] },
  { id: 'other-server-role', x: 208, y: 254, textAnchor: 'middle' as const, scenarios: ['between-servers'] },
]

// 가로형은 노트북·네트워크 장비·웹 사이트의 서버를 한 줄에 두고, 다른 서버를 네트워크 장비 아래에 둔다.
const wideNodes = [
  { id: 'laptop', x: 8, y: 24, width: 88 },
  { id: 'equipment', x: 160, y: 24, width: 96 },
  { id: 'web-server', x: 320, y: 24, width: 112 },
  { id: 'other-server', x: 152, y: 120, width: 112 },
]

// 오른쪽으로 가는 화살표는 y 32, 왼쪽으로 가는 화살표는 y 48을 쓴다. 다른 서버로 내려가는 화살표는 x 192, 올라오는 화살표는 x 224다.
const widePaths: Record<string, string> = {
  'web-request-1': 'M96 32 H160',
  'web-request-2': 'M256 32 H320',
  'web-response-1': 'M320 48 H256',
  'web-response-2': 'M160 48 H96',
  'servers-request-1': 'M320 48 H256',
  'servers-request-2': 'M192 56 V120',
  'servers-response-1': 'M224 120 V56',
  'servers-response-2': 'M256 32 H320',
}

// 곁말은 자리와 정렬이 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'laptop-client', x: 52, y: 70, textAnchor: 'middle' as const },
  { id: 'request-web', x: 128, y: 26, textAnchor: 'middle' as const },
  { id: 'response-web', x: 128, y: 62, textAnchor: 'middle' as const },
  { id: 'web-server-role', x: 376, y: 70, textAnchor: 'middle' as const },
  { id: 'web-client-role', x: 376, y: 70, textAnchor: 'middle' as const },
  { id: 'request-servers', x: 186, y: 92, textAnchor: 'end' as const },
  { id: 'response-servers', x: 230, y: 92, textAnchor: 'start' as const },
  { id: 'other-server-role', x: 276, y: 139, textAnchor: 'start' as const },
]

export const clientServerScenarios: DiagramScenario[] = [
  {
    id: 'web',
    nodes: ['laptop', 'equipment', 'web-server'],
    paths: ['web-request-1', 'web-request-2', 'web-response-1', 'web-response-2'],
  },
  {
    id: 'between-servers',
    nodes: ['equipment', 'web-server', 'other-server'],
    paths: ['servers-request-1', 'servers-request-2', 'servers-response-1', 'servers-response-2'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ClientServerDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-client-server-arrow`
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={clientServerScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 168' : '0 0 280 264'}>
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
            <g key={node.id} data-node={node.id} opacity={active && !active.nodes.includes(node.id) ? 0.25 : 1}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {active && layoutNotes.filter((note) => note.scenarios.includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.textAnchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
