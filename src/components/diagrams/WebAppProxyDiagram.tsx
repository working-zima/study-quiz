import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-server-roles'].diagrams['web-app-proxy']

// 세로형은 회사 네트워크 밖의 인터넷 사용자를 위에, 그 아래 회사 네트워크 상자의 가장자리에 웹 응용 프로그램 프록시를,
// 맨 아래에 SRV03의 웹 응용 프로그램과 SRV01을 둔다. 요청과 응답은 같은 세로줄을 반대 방향으로 지난다.
// 바깥에서 들어오는 화살표가 상자 위 변을 지나므로 그룹 라벨은 상자 안 왼쪽 아래에 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'user', x: 16, y: 8, width: 96 },
  { id: 'proxy', x: 16, y: 96, width: 152 },
  { id: 'srv03', x: 16, y: 168, width: 160 },
  { id: 'srv01', x: 192, y: 168, width: 64 },
]

const groups = [
  { id: 'company', x: 8, y: 72, width: 264, height: 156, labelX: 16, labelY: 220 },
]

// 요청은 인터넷 사용자 → 프록시 → SRV03, 응답은 같은 선을 거꾸로 SRV03 → 프록시 → 인터넷 사용자로 간다. SRV01로 가는 선은 없다.
const paths: Record<string, string> = {
  'req-in': 'M64 40 V96',
  'req-fwd': 'M64 128 V168',
  'res-back': 'M64 168 V128',
  'res-out': 'M64 96 V40',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다. 게시한 주소 곁말은 요청과 응답이 함께 쓴다.
const noteScenarios: Record<string, string[]> = {
  'url-key': ['request', 'response'],
  'fwd-key': ['request'],
  'back-key': ['response'],
  'none-key': ['boundary'],
}

const notes: Note[] = [
  { id: 'url-key', x: 120, y: 28, anchor: 'start' },
  { id: 'fwd-key', x: 72, y: 152, anchor: 'start' },
  { id: 'back-key', x: 72, y: 64, anchor: 'start' },
  { id: 'none-key', x: 264, y: 160, anchor: 'end' },
]

// 가로형은 인터넷 사용자를 왼쪽에, 오른쪽 회사 네트워크 상자의 위 줄에 프록시를, 아래 줄에 SRV03의 웹 응용 프로그램과 SRV01을 둔다.
const wideNodes = [
  { id: 'user', x: 16, y: 40, width: 96 },
  { id: 'proxy', x: 184, y: 40, width: 152 },
  { id: 'srv03', x: 184, y: 120, width: 160 },
  { id: 'srv01', x: 360, y: 120, width: 64 },
]

const wideGroups = [
  { id: 'company', x: 160, y: 8, width: 272, height: 160, labelX: 168, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'req-in': 'M112 56 H184',
  'req-fwd': 'M260 72 V120',
  'res-back': 'M260 120 V72',
  'res-out': 'M184 56 H112',
}

const wideNotes: Note[] = [
  { id: 'url-key', x: 16, y: 92, anchor: 'start' },
  { id: 'fwd-key', x: 252, y: 100, anchor: 'end' },
  { id: 'back-key', x: 268, y: 100, anchor: 'start' },
  { id: 'none-key', x: 424, y: 112, anchor: 'end' },
]

// 요청: 인터넷 사용자·프록시·SRV03. 응답: 같은 노드에 거꾸로 가는 선. 닿지 않는 곳: 인터넷 사용자·SRV01, 선 없음.
export const webAppProxyScenarios: DiagramScenario[] = [
  { id: 'request', nodes: ['user', 'proxy', 'srv03'], paths: ['req-in', 'req-fwd'] },
  { id: 'response', nodes: ['user', 'proxy', 'srv03'], paths: ['res-back', 'res-out'] },
  { id: 'boundary', nodes: ['user', 'srv01'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function WebAppProxyDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-web-app-proxy-arrow`
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
      scenarios={webAppProxyScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 176' : '0 0 280 236'}>
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

          {active && layoutNotes.filter((note) => noteScenarios[note.id].includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
