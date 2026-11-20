import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-devices'].diagrams['proxy-direction']

// 세로형은 왼쪽 위에 사내 네트워크 박스(PC01 위·PROXY01 아래), 오른쪽 위에 www.example.com, 가운데에 인터넷,
// 왼쪽 아래에 인터넷 사용자, 오른쪽 아래에 서버 쪽 네트워크 박스(역방향 프록시 위·웹 서버 아래)를 둔다.
// 정방향 프록시는 PC01 → PROXY01 → 인터넷 → www.example.com, 역방향 프록시는 인터넷 사용자 → 인터넷 → 역방향 프록시 → 웹 서버로
// 요청이 가는 길을 잇는다. 노드는 모두 회색이다.
const nodes = [
  { id: 'pc01', x: 28, y: 32, width: 72 },
  { id: 'proxy01', x: 28, y: 80, width: 72 },
  { id: 'example', x: 160, y: 32, width: 112 },
  { id: 'internet', x: 108, y: 136, width: 64 },
  { id: 'user', x: 16, y: 208, width: 96 },
  { id: 'rproxy', x: 164, y: 206, width: 96 },
  { id: 'web', x: 180, y: 254, width: 64 },
]

const groups = [
  { id: 'internal', x: 8, y: 8, width: 112, height: 114, labelX: 16, labelY: 21 },
  { id: 'server', x: 148, y: 184, width: 124, height: 112, labelX: 156, labelY: 197 },
]

const paths: Record<string, string> = {
  'pc01-proxy': 'M64 64 V80',
  'proxy-internet': 'M100 96 H140 V136',
  'internet-example': 'M172 152 H216 V64',
  'user-internet': 'M64 208 V152 H108',
  'internet-rproxy': 'M140 168 V222 H164',
  'rproxy-web': 'M212 238 V254',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다. 정방향의 곁말은 사내 네트워크 박스 오른쪽, 역방향의 곁말은 서버 쪽 네트워크 박스 바로 위에 둔다.
const noteScenarios: Record<string, string> = {
  'forward-note': 'forward',
  'reverse-note': 'reverse',
}

const notes: Note[] = [
  { id: 'forward-note', x: 126, y: 88, anchor: 'start' },
  { id: 'reverse-note', x: 148, y: 180, anchor: 'start' },
]

// 가로형은 위 줄에 사내 네트워크 박스(PC01 → PROXY01)와 www.example.com, 아래 줄에 인터넷 사용자와 서버 쪽 네트워크 박스
// (역방향 프록시 → 웹 서버)를 두고, 두 줄 사이 가운데에 인터넷을 둔다.
const wideNodes = [
  { id: 'pc01', x: 20, y: 30, width: 64 },
  { id: 'proxy01', x: 108, y: 30, width: 64 },
  { id: 'example', x: 312, y: 30, width: 112 },
  { id: 'internet', x: 188, y: 76, width: 64 },
  { id: 'user', x: 20, y: 136, width: 96 },
  { id: 'rproxy', x: 256, y: 138, width: 96 },
  { id: 'web', x: 364, y: 138, width: 56 },
]

const wideGroups = [
  { id: 'internal', x: 8, y: 8, width: 176, height: 64, labelX: 16, labelY: 21 },
  { id: 'server', x: 244, y: 116, width: 188, height: 64, labelX: 252, labelY: 129 },
]

const widePaths: Record<string, string> = {
  'pc01-proxy': 'M84 46 H108',
  'proxy-internet': 'M172 46 H220 V76',
  'internet-example': 'M252 92 H368 V62',
  'user-internet': 'M116 152 H200 V108',
  'internet-rproxy': 'M236 108 V154 H256',
  'rproxy-web': 'M352 154 H364',
}

const wideNotes: Note[] = [
  { id: 'forward-note', x: 140, y: 92, anchor: 'middle' },
  { id: 'reverse-note', x: 338, y: 196, anchor: 'middle' },
]

// 정방향 프록시: PC01·PROXY01·www.example.com·인터넷이 선명하다. 역방향 프록시: 인터넷·인터넷 사용자·역방향 프록시·웹 서버가 선명하다.
export const proxyDirectionScenarios: DiagramScenario[] = [
  {
    id: 'forward',
    nodes: ['pc01', 'proxy01', 'example', 'internet'],
    paths: ['pc01-proxy', 'proxy-internet', 'internet-example'],
  },
  {
    id: 'reverse',
    nodes: ['internet', 'user', 'rproxy', 'web'],
    paths: ['user-internet', 'internet-rproxy', 'rproxy-web'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ProxyDirectionDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-proxy-direction-arrow`
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
      scenarios={proxyDirectionScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 204' : '0 0 280 304'}>
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
