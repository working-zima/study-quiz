import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ecs-eks-fargate'].diagrams['awsvpc']

// VPC 안에 퍼블릭·프라이빗 서브넷이 있고, 프라이빗 서브넷 안의 작은 박스 하나가 태스크 하나다. 바깥부터 그린다.
const groups = [
  { id: 'vpc', x: 4, y: 56, width: 272, height: 272 },
  { id: 'public', x: 12, y: 76, width: 256, height: 68 },
  { id: 'private', x: 12, y: 160, width: 256, height: 160 },
  { id: 'task-a', x: 20, y: 184, width: 240, height: 60 },
  { id: 'task-b', x: 20, y: 252, width: 240, height: 60 },
]

// 인터넷은 VPC 위, NAT 게이트웨이와 로드 밸런서는 퍼블릭 서브넷에, 네트워크 인터페이스는 태스크 박스마다 하나씩 둔다.
// 긴 라벨이 들어가도록 태스크 박스 둘을 위아래로 쌓는다.
const nodes = [
  { id: 'internet', x: 82, y: 8, width: 116, color: 'stroke-disabled' },
  { id: 'nat', x: 24, y: 100, width: 104, color: 'stroke-diagram-resource' },
  { id: 'lb', x: 152, y: 100, width: 104, color: 'stroke-diagram-resource' },
  { id: 'eni-a', x: 28, y: 204, width: 160, color: 'stroke-diagram-resource' },
  { id: 'eni-b', x: 28, y: 272, width: 160, color: 'stroke-diagram-resource' },
]

// 들어오는 길은 로드 밸런서에서만 갈라지고, 나가는 길은 NAT 게이트웨이를 지난다. 인터넷에서 태스크로 바로 가는 경로는 없다.
const paths: Record<string, string> = {
  'internet-lb': 'M190 40 V100',
  'lb-eni-a': 'M170 132 V204',
  'lb-eni-b': 'M230 132 V288 H188',
  'eni-a-nat': 'M100 204 V132',
  'nat-internet': 'M100 100 V40',
}

// 밖에 드러난 것이 무엇인지는 곁말 글자로만 보인다.
const notes = [
  { id: 'exposed', x: 140, y: 70, textAnchor: 'middle' as const, scenarios: ['inbound'] },
]

// 가로형은 인터넷을 왼쪽에, 퍼블릭 서브넷을 가운데에, 프라이빗 서브넷을 오른쪽에 둔다.
const wideGroups = [
  { id: 'vpc', x: 96, y: 8, width: 340, height: 200 },
  { id: 'public', x: 104, y: 32, width: 132, height: 168 },
  { id: 'private', x: 244, y: 32, width: 188, height: 168 },
  { id: 'task-a', x: 252, y: 56, width: 172, height: 60 },
  { id: 'task-b', x: 252, y: 128, width: 172, height: 64 },
]

// 라벨과 색은 세로형 nodes에서 id로 가져온다. 퍼블릭 서브넷 안에서는 로드 밸런서가 위, NAT 게이트웨이가 아래다.
const wideNodes = [
  { id: 'internet', x: 8, y: 64, width: 72 },
  { id: 'lb', x: 114, y: 64, width: 112 },
  { id: 'nat', x: 114, y: 144, width: 112 },
  { id: 'eni-a', x: 258, y: 76, width: 160 },
  { id: 'eni-b', x: 258, y: 152, width: 160 },
]

// 두 서브넷 사이의 통로(x 240)에서 꺾는다. NAT 게이트웨이에서 인터넷으로 가는 길은 VPC 왼쪽 밖(x 44)으로 돈다.
const widePaths: Record<string, string> = {
  'internet-lb': 'M80 80 H114',
  'lb-eni-a': 'M226 80 H258',
  'lb-eni-b': 'M226 88 H240 V168 H258',
  'eni-a-nat': 'M258 100 H240 V160 H226',
  'nat-internet': 'M114 160 H44 V96',
}

// 곁말은 자리가 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'exposed', x: 170, y: 112, textAnchor: 'middle' as const },
]

export const awsvpcScenarios: DiagramScenario[] = [
  { id: 'inbound', nodes: ['internet', 'lb', 'eni-a', 'eni-b'], paths: ['internet-lb', 'lb-eni-a', 'lb-eni-b'] },
  { id: 'outbound', nodes: ['eni-a', 'nat', 'internet'], paths: ['eni-a-nat', 'nat-internet'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function AwsvpcPathDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-awsvpc-arrow`
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes.map((node) => ({ ...nodes.find(({ id }) => id === node.id)!, ...node })) : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={awsvpcScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 216' : '0 0 280 336'}>
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
            <text key={group.id} data-group-label={group.id} x={group.x + 10} y={group.y + 14} className="fill-muted" fontSize="9">
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
            <g key={node.id} data-node={node.id} opacity={active && !active.nodes.includes(node.id) ? 0.25 : 1}>
              <rect className={`fill-panel ${node.color}`} x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
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
