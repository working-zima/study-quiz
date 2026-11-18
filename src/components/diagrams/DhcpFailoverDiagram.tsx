import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-server-roles'].diagrams['dhcp-failover']

// 세로형은 위쪽 줄에 SRV01과 SRV02를 양 끝에 두고, 그 사이에 임대 정보를 나눠 갖는 두 화살표를 놓는다.
// 가운데 아래에 PC01을, 맨 아래에 SRV02가 내준 임시 임대 칸을 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'srv01', x: 16, y: 28, width: 64 },
  { id: 'srv02', x: 200, y: 28, width: 64 },
  { id: 'pc01', x: 116, y: 100, width: 48 },
  { id: 'result', x: 112, y: 164, width: 152 },
]

// sync-a·sync-b는 두 서버가 임대 정보를 서로 나눠 갖는 것이고, lease-01은 SRV01이 PC01에게 주소를 빌려주는 방향이다.
// request는 PC01의 갱신 요청이 SRV02로 가는 것이고, srv02-result는 SRV02가 내준 임시 임대다.
const paths: Record<string, string> = {
  'sync-a': 'M80 40 H200',
  'sync-b': 'M200 52 H80',
  'lease-01': 'M48 60 V116 H116',
  'request': 'M164 116 H216 V60',
  'srv02-result': 'M232 60 V164',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다.
const noteScenarios: Record<string, string> = {
  'sync-note': 'normal',
  'down-note': 'partner-down',
  'request-note': 'partner-down',
}

const notes: Note[] = [
  { id: 'sync-note', x: 140, y: 80, anchor: 'middle' },
  { id: 'down-note', x: 48, y: 20, anchor: 'middle' },
  { id: 'request-note', x: 196, y: 132, anchor: 'middle' },
]

// 가로형은 왼쪽 열에 SRV01과 SRV02를 위아래로 쌓고, 가운데에 PC01을, 오른쪽 아래에 임시 임대 칸을 둔다.
const wideNodes = [
  { id: 'srv01', x: 16, y: 20, width: 64 },
  { id: 'srv02', x: 16, y: 100, width: 64 },
  { id: 'pc01', x: 232, y: 60, width: 48 },
  { id: 'result', x: 280, y: 140, width: 152 },
]

const widePaths: Record<string, string> = {
  'sync-a': 'M40 52 V100',
  'sync-b': 'M56 100 V52',
  'lease-01': 'M80 36 H256 V60',
  'request': 'M256 92 V116 H80',
  'srv02-result': 'M48 132 V156 H280',
}

const wideNotes: Note[] = [
  { id: 'sync-note', x: 88, y: 80, anchor: 'start' },
  { id: 'down-note', x: 48, y: 13, anchor: 'middle' },
  { id: 'request-note', x: 168, y: 108, anchor: 'middle' },
]

// 평소: 두 서버와 PC01, 두 서버 사이 화살표와 SRV01에서 PC01로 가는 화살표. 한 대가 멈춤: SRV01은 흐리고, PC01의 요청이 SRV02로 가서 임시 임대가 나온다.
export const dhcpFailoverScenarios: DiagramScenario[] = [
  { id: 'normal', nodes: ['srv01', 'srv02', 'pc01'], paths: ['sync-a', 'sync-b', 'lease-01'] },
  { id: 'partner-down', nodes: ['srv02', 'pc01', 'result'], paths: ['request', 'srv02-result'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function DhcpFailoverDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-dhcp-failover-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={dhcpFailoverScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 184' : '0 0 280 208'}>
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
