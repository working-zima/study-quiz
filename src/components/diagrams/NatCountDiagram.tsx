import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { estimateTextWidth } from '../../lib/svg-bounds'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['vpc-networking'].diagrams['nat-count']

// 가용 영역 셋을 세 열로 두면 NAT 라벨이 들어가지 않으므로 위아래 세 행으로 쌓는다.
// 각 행은 퍼블릭 | 프라이빗 두 열이고, 서브넷은 박스 대신 곁말로 가른다.
const groups = [
  { id: 'vpc', x: 4, y: 56, width: 272, height: 360 },
  { id: 'az-a', x: 30, y: 128, width: 240, height: 88 },
  { id: 'az-b', x: 30, y: 224, width: 240, height: 88 },
  { id: 'az-c', x: 30, y: 320, width: 240, height: 88 },
]

const nodes = [
  { id: 'internet', x: 86, y: 8, width: 108, color: 'stroke-disabled' },
  { id: 'igw', x: 86, y: 78, width: 108, color: 'stroke-disabled' },
  { id: 'nat-a', x: 38, y: 164, width: 100, color: 'stroke-diagram-resource' },
  { id: 'ec2-a', x: 164, y: 164, width: 98, color: 'stroke-diagram-resource' },
  { id: 'nat-b', x: 38, y: 260, width: 100, color: 'stroke-diagram-resource' },
  { id: 'ec2-b', x: 164, y: 260, width: 98, color: 'stroke-diagram-resource' },
  { id: 'nat-c', x: 38, y: 356, width: 100, color: 'stroke-diagram-resource' },
  { id: 'ec2-c', x: 164, y: 356, width: 98, color: 'stroke-diagram-resource' },
]

// 아래 행의 NAT는 가용 영역 바깥 왼쪽 통로 둘(x 12·21)로 올라간다.
// 개발 환경에서 NAT A로 모이는 두 경로는 NAT와 EC2 사이 통로 둘(x 145·157)을 따로 쓰고,
// EC2 B는 NAT A의 오른쪽 면, EC2 C는 아래 면으로 들어가 서로 겹치지 않는다.
const paths: Record<string, string> = {
  'ec2-a-nat-a': 'M164 180 H138',
  'ec2-b-nat-b': 'M164 276 H138',
  'ec2-c-nat-c': 'M164 372 H138',
  'ec2-b-nat-a': 'M164 276 H157 V188 H138',
  'ec2-c-nat-a': 'M164 372 H145 V208 H88 V196',
  'nat-a-igw': 'M128 164 V110',
  'nat-b-igw': 'M38 276 H21 V100 H86',
  'nat-c-igw': 'M38 372 H12 V90 H86',
  'igw-internet': 'M140 78 V40',
}

type Group = (typeof groups)[number]

// 서브넷 곁말 자리는 가용 영역 박스에서 잰다. 세로형은 한 줄 두 열이다.
const subnetNotes = {
  public: (az: Group) => ({ x: 40, y: az.y + 28 }),
  private: (az: Group) => ({ x: 166, y: az.y + 28 }),
}

// 가로형은 가용 영역 셋을 세 열로 나란히 둔다. 열 안에서 퍼블릭(NAT)이 위, 프라이빗(EC2)이 아래다.
const wideGroups = [
  { id: 'vpc', x: 4, y: 56, width: 432, height: 220 },
  { id: 'az-a', x: 18, y: 128, width: 124, height: 132 },
  { id: 'az-b', x: 158, y: 128, width: 124, height: 132 },
  { id: 'az-c', x: 298, y: 128, width: 124, height: 132 },
]

// 색은 세로형 nodes에서 id로 가져온다.
const wideNodes = [
  { id: 'internet', x: 204, y: 8, width: 108 },
  { id: 'igw', x: 204, y: 78, width: 108 },
  { id: 'nat-a', x: 30, y: 164, width: 100 },
  { id: 'ec2-a', x: 30, y: 220, width: 100 },
  { id: 'nat-b', x: 170, y: 164, width: 100 },
  { id: 'ec2-b', x: 170, y: 220, width: 100 },
  { id: 'nat-c', x: 310, y: 164, width: 100 },
  { id: 'ec2-c', x: 310, y: 220, width: 100 },
]

// 가용 영역 라벨·곁말이 왼쪽에 있으므로 경로는 노드의 오른쪽 부분(가용 영역 x + 100)으로 드나든다.
// 개발 환경에서 EC2 B는 가용 영역 A·B 사이 통로(x 150)로 NAT A의 오른쪽 면에, EC2 C는 가용 영역 아래 통로(y 268)와
// 가용 영역 왼쪽 통로(x 11)를 돌아 NAT A의 왼쪽 면에 들어가 서로 겹치지 않는다.
const widePaths: Record<string, string> = {
  'ec2-a-nat-a': 'M118 220 V196',
  'ec2-b-nat-b': 'M258 220 V196',
  'ec2-c-nat-c': 'M398 220 V196',
  'ec2-b-nat-a': 'M170 236 H150 V180 H130',
  'ec2-c-nat-a': 'M360 252 V268 H11 V180 H30',
  'nat-a-igw': 'M118 164 V94 H204',
  'nat-b-igw': 'M258 164 V110',
  'nat-c-igw': 'M398 164 V94 H312',
  'igw-internet': 'M258 78 V40',
}

// 가로형 서브넷 곁말은 가용 영역 왼쪽에 위아래 두 줄로, 각자 NAT·EC2 바로 위에 선다.
const wideSubnetNotes = {
  public: (az: Group) => ({ x: az.x + 10, y: az.y + 28 }),
  private: (az: Group) => ({ x: az.x + 10, y: az.y + 84 }),
}

const everyNode = nodes.map(({ id }) => id)
const without = (...ids: string[]) => everyNode.filter((id) => !ids.includes(id))

// failedGroup이 있으면 그 가용 영역 라벨 옆에 장애 곁말을 붙인다.
const scenarioShapes: (Omit<DiagramScenario, 'label' | 'caption'> & { failedGroup?: string })[] = [
  {
    id: 'n1',
    nodes: everyNode,
    paths: ['ec2-a-nat-a', 'ec2-b-nat-b', 'ec2-c-nat-c', 'nat-a-igw', 'nat-b-igw', 'nat-c-igw', 'igw-internet'],
  },
  {
    id: 'n2',
    nodes: without('nat-b', 'nat-c'),
    paths: ['ec2-a-nat-a', 'ec2-b-nat-a', 'ec2-c-nat-a', 'nat-a-igw', 'igw-internet'],
  },
  {
    id: 'n3',
    nodes: without('nat-a', 'ec2-a'),
    paths: ['ec2-b-nat-b', 'ec2-c-nat-c', 'nat-b-igw', 'nat-c-igw', 'igw-internet'],
    failedGroup: 'az-a',
  },
  {
    // EC2 B·C는 살아 있지만 나갈 길이 없다. 경로가 없는 것이 이 장면이다.
    id: 'n4',
    nodes: without('nat-a', 'ec2-a', 'nat-b', 'nat-c'),
    paths: [],
    failedGroup: 'az-a',
  },
]

export const natCountScenarios = scenarioShapes.map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

type NatCountScenario = (typeof natCountScenarios)[number]

export function NatCountDiagram() {
  const [active, setActive] = useState<NatCountScenario | null>(null)
  const arrowId = `${useId()}-nat-arrow`
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes.map((node) => ({ ...nodes.find(({ id }) => id === node.id)!, ...node })) : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutSubnetNotes = wide ? wideSubnetNotes : subnetNotes
  const failedGroup = layoutGroups.find(({ id }) => id === active?.failedGroup)

  return (
    <DiagramFrame
      label={text.label}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={natCountScenarios}
      active={active}
      onSelect={(scenario) => setActive(natCountScenarios.find(({ id }) => id === scenario?.id) ?? null)}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 284' : '0 0 280 424'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          <g className="fill-none stroke-disabled" strokeWidth="1">
            {layoutGroups.map((group) => (
              <rect key={group.id} data-group={group.id} x={group.x} y={group.y} width={group.width} height={group.height} rx="4" strokeDasharray={group.id === 'vpc' ? '6 4' : undefined} />
            ))}
          </g>
          <g className="fill-muted" fontSize="9">
            {layoutGroups.map((group) => (
              <text key={group.id} data-group-label={group.id} x={group.x + 10} y={group.y + 14}>{text.groups?.[group.id]}</text>
            ))}
            {layoutGroups.filter(({ id }) => id.startsWith('az-')).flatMap((group) => [
              <text key={`${group.id}-public`} data-subnet-note="public" data-az={group.id.slice(3)} {...layoutSubnetNotes.public(group)}>{text.notes?.public}</text>,
              <text key={`${group.id}-private`} data-subnet-note="private" data-az={group.id.slice(3)} {...layoutSubnetNotes.private(group)}>{text.notes?.private}</text>,
            ])}
            {failedGroup && (
              <text
                data-failure={failedGroup.id}
                x={failedGroup.x + 10 + estimateTextWidth(text.groups?.[failedGroup.id] ?? '', 9) + 6}
                y={failedGroup.y + 14}
              >
                {text.notes?.failure}
              </text>
            )}
          </g>

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
