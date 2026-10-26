import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['security-groups-nacl'].diagrams['sg-nacl-layers']

// 왼쪽은 서브넷과 리소스의 층, 오른쪽은 서브넷 밖 WAF와 곁말이다.
const nodes = [
  { id: 'internet', x: 52, y: 8, width: 112, color: 'stroke-disabled' },
  { id: 'nacl-public', x: 52, y: 96, width: 112, color: 'stroke-disabled' },
  { id: 'alb', x: 52, y: 180, width: 112, color: 'stroke-diagram-resource' },
  { id: 'waf', x: 204, y: 180, width: 68, color: 'stroke-diagram-managed' },
  { id: 'nacl-private', x: 52, y: 312, width: 112, color: 'stroke-disabled' },
  { id: 'ec2', x: 52, y: 396, width: 112, color: 'stroke-diagram-resource' },
]

// 요청은 왼쪽 열을 따라 내려간다. WAF 연결은 검사 순서를 뜻하지 않아 이 맵에 넣지 않는다.
export const paths: Record<string, string> = {
  'internet-nacl-public': 'M108 40 V96',
  'nacl-public-alb': 'M108 128 V180',
  'alb-nacl-private': 'M108 212 V312',
  'nacl-private-ec2': 'M108 344 V396',
}

// 그룹의 선 색과 모서리는 두 배치가 함께 쓴다. 서브넷은 회색, 보안 그룹은 청록이다.
const groupLines: Record<string, { color: string, rx: number }> = {
  public: { color: 'stroke-disabled', rx: 6 },
  'alb-sg': { color: 'stroke-diagram-resource', rx: 4 },
  private: { color: 'stroke-disabled', rx: 6 },
  'ec2-sg': { color: 'stroke-diagram-resource', rx: 4 },
}

const groups = [
  { id: 'public', x: 8, y: 64, width: 180, height: 176, labelX: 16, labelY: 80 },
  { id: 'alb-sg', x: 20, y: 148, width: 156, height: 76, labelX: 28, labelY: 162 },
  { id: 'private', x: 8, y: 280, width: 180, height: 176, labelX: 16, labelY: 296 },
  { id: 'ec2-sg', x: 20, y: 364, width: 156, height: 76, labelX: 28, labelY: 378 },
]

// ALB와 WAF를 잇는 부착선과 오른쪽 곁말 둘의 자리다. 글은 두 배치가 같은 JSON에서 읽는다.
const attachment = { x1: 164, y1: 196, x2: 204, y2: 196 }
const notes = { 'waf-attach': { x: 204, y: 228 }, 'sg-source': { x: 200, y: 404 } }

// 가로형도 두 서브넷을 위아래로 두되, 서브넷 안에서 NACL → 보안 그룹을 왼쪽에서 오른쪽으로 지난다.
// WAF와 곁말 둘은 서브넷 밖 오른쪽 열(x 340)에 선다.
const wideGroups = [
  { id: 'public', x: 8, y: 56, width: 304, height: 94, labelX: 16, labelY: 72 },
  { id: 'alb-sg', x: 184, y: 78, width: 116, height: 64, labelX: 194, labelY: 92 },
  { id: 'private', x: 8, y: 172, width: 304, height: 94, labelX: 16, labelY: 188 },
  { id: 'ec2-sg', x: 184, y: 194, width: 116, height: 64, labelX: 194, labelY: 208 },
]

// 라벨과 색은 세로형 nodes에서 id로 가져온다.
const wideNodes = [
  { id: 'internet', x: 88, y: 8, width: 72 },
  { id: 'nacl-public', x: 88, y: 100, width: 72 },
  { id: 'alb', x: 200, y: 100, width: 84 },
  { id: 'waf', x: 340, y: 100, width: 68 },
  { id: 'nacl-private', x: 88, y: 216, width: 72 },
  { id: 'ec2', x: 200, y: 216, width: 84 },
]

// ALB에서 프라이빗 서브넷으로 가는 경로만 두 서브넷 사이 띠(y 160)를 지나 NACL 열로 꺾인다.
const widePaths: Record<string, string> = {
  'internet-nacl-public': 'M124 40 V100',
  'nacl-public-alb': 'M160 116 H200',
  'alb-nacl-private': 'M242 132 V160 H124 V216',
  'nacl-private-ec2': 'M160 232 H200',
}

const wideAttachment = { x1: 284, y1: 116, x2: 340, y2: 116 }
const wideNotes = { 'waf-attach': { x: 340, y: 148 }, 'sg-source': { x: 340, y: 226 } }

export const sgNaclLayersScenarios: DiagramScenario[] = [
  { id: 'flow', nodes: ['internet', 'nacl-public', 'alb', 'waf', 'nacl-private', 'ec2'], paths: ['internet-nacl-public', 'nacl-public-alb', 'alb-nacl-private', 'nacl-private-ec2'] },
  { id: 'waf', nodes: ['internet', 'alb', 'waf'], paths: ['internet-nacl-public', 'nacl-public-alb'] },
  { id: 'nacl', nodes: ['nacl-public', 'nacl-private'], paths: [] },
  { id: 'sg-ref', nodes: ['alb', 'ec2'], paths: ['alb-nacl-private', 'nacl-private-ec2'] },
  { id: 'block-ip', nodes: ['waf', 'nacl-public', 'nacl-private'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function SgNaclLayersDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-sgnacl-layers-arrow`
  const wafOpacity = active && !active.nodes.includes('waf') ? 0.25 : 1
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes.map((node) => ({ ...nodes.find(({ id }) => id === node.id)!, ...node })) : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutAttachment = wide ? wideAttachment : attachment
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={sgNaclLayersScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 272' : '0 0 280 464'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          <g className="fill-none" strokeWidth="1">
            {layoutGroups.map((group) => (
              <rect
                key={group.id}
                className={groupLines[group.id].color}
                data-group={group.id}
                x={group.x}
                y={group.y}
                width={group.width}
                height={group.height}
                rx={groupLines[group.id].rx}
              />
            ))}
          </g>
          <g className="fill-muted" fontSize="9">
            {layoutGroups.map((group) => (
              <text key={group.id} x={group.labelX} y={group.labelY}>{text.groups![group.id]}</text>
            ))}
          </g>

          {/* 화살표 없이 부착 관계만 표시한다. WAF는 요청 경로에 포함하지 않는다. */}
          <line data-attachment="alb-waf" x1={layoutAttachment.x1} y1={layoutAttachment.y1} x2={layoutAttachment.x2} y2={layoutAttachment.y2} className="stroke-disabled" strokeWidth="1" opacity={wafOpacity} />
          <text data-note="waf-attach" x={layoutNotes['waf-attach'].x} y={layoutNotes['waf-attach'].y} className="fill-muted" fontSize="9">{text.notes!['waf-attach']}</text>
          <text data-note="sg-source" x={layoutNotes['sg-source'].x} y={layoutNotes['sg-source'].y} className="fill-muted" fontSize="9">
            {text.notes!['sg-source'].split('\n').map((line, index) => (
              <tspan key={index} x={layoutNotes['sg-source'].x} dy={index === 0 ? 0 : 14}>{line}</tspan>
            ))}
          </text>

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
              <rect className={`fill-panel ${node.color}`} x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
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
