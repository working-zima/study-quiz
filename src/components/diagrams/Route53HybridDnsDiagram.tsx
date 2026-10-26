import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId.route53.diagrams['hybrid-dns']

// 왼쪽 열은 나가는 방향(아웃바운드), 오른쪽 열은 들어오는 방향(인바운드)이다.
// 엔드포인트는 어느 VPC에 놓이는지 데이터에 없으므로 VPC 밖 Resolver 그룹에 둔다.
const groups = [
  { id: 'onprem', x: 8, y: 8, width: 264, height: 64, color: 'stroke-disabled' },
  { id: 'resolver', x: 8, y: 96, width: 264, height: 64, color: 'stroke-diagram-managed' },
  { id: 'vpc-a', x: 8, y: 196, width: 124, height: 64, color: 'stroke-diagram-resource' },
  { id: 'vpc-b', x: 148, y: 196, width: 124, height: 64, color: 'stroke-diagram-resource' },
]

const nodes = [
  { id: 'onprem-dns', x: 24, y: 30, width: 104, color: 'stroke-disabled' },
  { id: 'onprem-server', x: 152, y: 30, width: 104, color: 'stroke-disabled' },
  { id: 'outbound', x: 16, y: 118, width: 120, color: 'stroke-diagram-managed' },
  { id: 'inbound', x: 144, y: 118, width: 120, color: 'stroke-diagram-managed' },
  { id: 'ec2-a', x: 44, y: 220, width: 64, color: 'stroke-diagram-resource' },
  { id: 'ec2-b', x: 172, y: 220, width: 64, color: 'stroke-diagram-resource' },
  { id: 'phz', x: 70, y: 284, width: 140, color: 'stroke-diagram-managed' },
]

// VPC B의 EC2는 Resolver와 VPC 줄 사이 통로(y 184)로 왼쪽 열까지 건너간다.
// 인바운드 엔드포인트에서 내려가는 경로는 두 VPC 사이 가운데 통로(x 140)를 쓴다.
export const paths: Record<string, string> = {
  'ec2-a-outbound': 'M76 220 V150',
  'ec2-b-outbound': 'M204 220 V184 H76 V150',
  'outbound-onprem-dns': 'M76 118 V62',
  'onprem-server-inbound': 'M204 62 V118',
  'inbound-phz': 'M152 150 V176 H140 V284',
}

const notes = [
  { id: 'rule', x: 112, y: 174, scenarios: ['outbound', 'forward-rule'] },
  { id: 'rule-vpc-a', x: 96, y: 210, scenarios: ['forward-rule'] },
  { id: 'rule-vpc-b', x: 236, y: 210, scenarios: ['forward-rule'] },
  { id: 'vpc-only', x: 140, y: 346, scenarios: ['phz'] },
]

// 본문의 예시 이름은 시나리오와 상관없이 늘 보이고, 붙은 노드의 opacity를 따른다.
const exampleNotes = [
  { id: 'corp-domain', x: 120, y: 88, node: 'onprem-dns' },
  { id: 'aws-domain', x: 140, y: 332, node: 'phz' },
]

// 프라이빗 호스팅 영역을 두 VPC에 잇는 연결선의 자리다.
const attachments = [
  { id: 'phz-vpc-a', x1: 100, y1: 260, x2: 100, y2: 284 },
  { id: 'phz-vpc-b', x1: 180, y1: 260, x2: 180, y2: 284 },
]

// 가로형은 왼쪽에서 오른쪽으로 온프레미스 · Route 53 Resolver · VPC를 둔다.
// 윗줄이 나가는 방향(아웃바운드), 아랫줄이 들어오는 방향(인바운드)이다. 선 색은 세로형 groups에서 id로 가져온다.
const wideGroups = [
  { id: 'onprem', x: 4, y: 24, width: 108, height: 144 },
  { id: 'resolver', x: 124, y: 24, width: 140, height: 144 },
  { id: 'vpc-a', x: 276, y: 24, width: 76, height: 76 },
  { id: 'vpc-b', x: 360, y: 24, width: 76, height: 76 },
]

// 라벨과 색은 세로형 nodes에서 id로 가져온다. 프라이빗 호스팅 영역은 두 VPC 아래 어느 그룹에도 들지 않는 자리다.
const wideNodes = [
  { id: 'onprem-dns', x: 12, y: 46, width: 92 },
  { id: 'onprem-server', x: 12, y: 124, width: 92 },
  { id: 'outbound', x: 132, y: 46, width: 124 },
  { id: 'inbound', x: 132, y: 124, width: 124 },
  { id: 'ec2-a', x: 282, y: 46, width: 64 },
  { id: 'ec2-b', x: 366, y: 46, width: 64 },
  { id: 'phz', x: 284, y: 124, width: 140 },
]

// VPC B의 EC2는 VPC 박스 위 통로(y 16)로 VPC A를 넘고, Resolver와 VPC A 사이(x 270)로 내려와 VPC A의 경로와 합류한다.
const widePaths: Record<string, string> = {
  'ec2-a-outbound': 'M282 62 H256',
  'ec2-b-outbound': 'M414 46 V16 H270 V62 H256',
  'outbound-onprem-dns': 'M132 62 H104',
  'onprem-server-inbound': 'M104 140 H132',
  'inbound-phz': 'M256 140 H284',
}

// 곁말은 자리만 배치마다 다르다. 보이는 시나리오와 붙은 노드는 세로형 notes·exampleNotes에서 id로 가져온다.
const wideNotes = [
  { id: 'rule', x: 194, y: 96 },
  { id: 'rule-vpc-a', x: 314, y: 94 },
  { id: 'rule-vpc-b', x: 398, y: 94 },
  { id: 'vpc-only', x: 354, y: 186 },
]

const wideExampleNotes = [
  { id: 'corp-domain', x: 58, y: 96 },
  { id: 'aws-domain', x: 354, y: 172 },
]

const wideAttachments = [
  { id: 'phz-vpc-a', x1: 314, y1: 100, x2: 314, y2: 124 },
  { id: 'phz-vpc-b', x1: 398, y1: 100, x2: 398, y2: 124 },
]

// 가로형 항목에 세로형 항목의 나머지 필드(색·시나리오·붙은 노드)를 id로 덧붙인다.
function withTallFields<T extends { id: string }, W extends { id: string }>(wide: W[], tall: T[]): (T & W)[] {
  return wide.map((item) => ({ ...tall.find(({ id }) => id === item.id)!, ...item }))
}

export const route53HybridDnsScenarios: DiagramScenario[] = [
  { id: 'outbound', nodes: ['ec2-a', 'outbound', 'onprem-dns'], paths: ['ec2-a-outbound', 'outbound-onprem-dns'] },
  { id: 'inbound', nodes: ['onprem-server', 'inbound', 'phz'], paths: ['onprem-server-inbound', 'inbound-phz'] },
  {
    id: 'forward-rule',
    nodes: ['ec2-a', 'ec2-b', 'outbound', 'onprem-dns'],
    paths: ['ec2-a-outbound', 'ec2-b-outbound', 'outbound-onprem-dns'],
  },
  { id: 'phz', nodes: ['phz', 'ec2-a', 'ec2-b'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function Route53HybridDnsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-route53-hybrid-dns-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutGroups = wide ? withTallFields(wideGroups, groups) : groups
  const layoutNodes = wide ? withTallFields(wideNodes, nodes) : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? withTallFields(wideNotes, notes) : notes
  const layoutExampleNotes = wide ? withTallFields(wideExampleNotes, exampleNotes) : exampleNotes
  const layoutAttachments = wide ? wideAttachments : attachments

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={route53HybridDnsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 192' : '0 0 280 352'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {layoutGroups.map((group) => (
            <g key={group.id}>
              <rect data-group={group.id} className={`fill-none ${group.color}`} x={group.x} y={group.y} width={group.width} height={group.height} rx="6" strokeWidth="1" />
              <text data-group-label={group.id} x={group.x + 8} y={group.y + 14} className="fill-muted" fontSize="9">{text.groups![group.id]}</text>
            </g>
          ))}

          {/* 요청 경로가 아니라 "이 VPC에 연결됨" 표시라 화살표 없이 정적으로 그린다. */}
          {layoutAttachments.map((link) => (
            <line key={link.id} data-attachment={link.id} x1={link.x1} y1={link.y1} x2={link.x2} y2={link.y2} className="stroke-disabled" strokeWidth="1" opacity={opacityOf('phz')} />
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
              <rect className={`fill-panel ${node.color}`} x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {active && layoutNotes.filter((note) => note.scenarios.includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
          {layoutExampleNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9" opacity={opacityOf(note.node)}>
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
