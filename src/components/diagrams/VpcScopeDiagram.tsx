import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame } from './DiagramFrame'

const text = visualsByTopicId['vpc-networking'].diagrams['vpc-scope']

// 바깥에서 안으로 그린다. 가용 영역 둘은 VPC 안에서 위아래로 쌓고, 서브넷은 두 열로 둔다.
const groups = [
  { id: 'region', x: 4, y: 4, width: 272, height: 364, dash: '6 4' },
  { id: 'vpc', x: 12, y: 72, width: 256, height: 284, dash: '6 4' },
  { id: 'az-a', x: 18, y: 140, width: 244, height: 96 },
  { id: 'az-b', x: 18, y: 248, width: 244, height: 96 },
  { id: 'public-a', x: 24, y: 162, width: 112, height: 64, dash: '2 3' },
  { id: 'public-b', x: 24, y: 270, width: 112, height: 64, dash: '2 3' },
  { id: 'private-a', x: 144, y: 162, width: 112, height: 64, dash: '2 3' },
  { id: 'private-b', x: 144, y: 270, width: 112, height: 64, dash: '2 3' },
]

// 존재 단위는 위치로 말한다. S3는 VPC 밖, 인터넷 게이트웨이는 가용 영역 밖, NAT는 가용 영역마다 안.
const nodes = [
  { id: 's3', x: 24, y: 26, width: 108, color: 'stroke-diagram-managed' },
  { id: 'igw', x: 24, y: 96, width: 108, color: 'stroke-disabled' },
  { id: 'nat-a', x: 30, y: 184, width: 100, color: 'stroke-diagram-resource' },
  { id: 'nat-b', x: 30, y: 292, width: 100, color: 'stroke-diagram-resource' },
  { id: 'ec2-a', x: 150, y: 184, width: 100, color: 'stroke-diagram-resource' },
  { id: 'ec2-b', x: 150, y: 292, width: 100, color: 'stroke-diagram-resource' },
]

// 가로형은 바깥에서 안으로를 왼쪽에서 오른쪽으로 편다. S3는 리전의 왼쪽 열, 인터넷 게이트웨이는 VPC의 왼쪽 열에 선다.
const wideGroups = [
  { id: 'region', x: 4, y: 4, width: 432, height: 232, dash: '6 4' },
  { id: 'vpc', x: 76, y: 12, width: 354, height: 216, dash: '6 4' },
  { id: 'az-a', x: 192, y: 20, width: 228, height: 96 },
  { id: 'az-b', x: 192, y: 124, width: 228, height: 96 },
  { id: 'public-a', x: 198, y: 42, width: 104, height: 64, dash: '2 3' },
  { id: 'public-b', x: 198, y: 146, width: 104, height: 64, dash: '2 3' },
  { id: 'private-a', x: 310, y: 42, width: 104, height: 64, dash: '2 3' },
  { id: 'private-b', x: 310, y: 146, width: 104, height: 64, dash: '2 3' },
]

// 색은 세로형 nodes에서 id로 가져온다.
const wideNodes = [
  { id: 's3', x: 12, y: 104, width: 56 },
  { id: 'igw', x: 84, y: 104, width: 100 },
  { id: 'nat-a', x: 204, y: 64, width: 92 },
  { id: 'nat-b', x: 204, y: 168, width: 92 },
  { id: 'ec2-a', x: 316, y: 64, width: 92 },
  { id: 'ec2-b', x: 316, y: 168, width: 92 },
]

const noop = () => {}

export function VpcScopeDiagram() {
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes.map((node) => ({ ...nodes.find(({ id }) => id === node.id)!, ...node })) : nodes

  return (
    <DiagramFrame label={text.label} idleCaption={text.idleCaption} legend={text.legend} active={null} onSelect={noop}>
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 240' : '0 0 280 372'}>
          <g className="fill-none stroke-disabled" strokeWidth="1">
            {layoutGroups.map((group) => (
              <rect key={group.id} data-group={group.id} x={group.x} y={group.y} width={group.width} height={group.height} rx="4" strokeDasharray={group.dash} />
            ))}
          </g>
          <g className="fill-muted" fontSize="9">
            {layoutGroups.map((group) => (
              <text key={group.id} data-group-label={group.id} x={group.x + 10} y={group.y + 14}>{text.groups?.[group.id]}</text>
            ))}
          </g>

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={1}>
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
