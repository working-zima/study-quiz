import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ip-protocol'].diagrams['ipv6-header']

// 세로형은 기본 헤더의 칸 여덟을 표준의 순서대로 네 줄에 빈틈없이 이어 붙이고, 헤더 박스 밖 아래에 페이로드를 둔다.
// 칸의 너비는 비트 수가 아니라 라벨이 들어가는 폭으로 정했다. 노드는 모두 회색이다.
const nodes = [
  { id: 'version', x: 8, y: 24, width: 56 },
  { id: 'traffic-class', x: 64, y: 24, width: 104 },
  { id: 'flow-label', x: 168, y: 24, width: 104 },
  { id: 'payload-length', x: 8, y: 56, width: 104 },
  { id: 'next-header', x: 112, y: 56, width: 80 },
  { id: 'hop-limit', x: 192, y: 56, width: 80 },
  { id: 'source', x: 8, y: 88, width: 264 },
  { id: 'destination', x: 8, y: 120, width: 264 },
  { id: 'payload', x: 8, y: 172, width: 264 },
]

const groups = [
  { id: 'header', x: 4, y: 4, width: 272, height: 156 },
]

// 헤더 크기 곁말은 그룹 라벨과 같은 줄 오른쪽 끝에 늘 보인다.
const sizeNote = { x: 268, y: 18 }

// 가로형은 넓어진 폭으로 칸을 넓히고, 출발지·목적지 주소를 한 줄에 나란히 둔다.
const wideNodes = [
  { id: 'version', x: 8, y: 24, width: 72 },
  { id: 'traffic-class', x: 80, y: 24, width: 176 },
  { id: 'flow-label', x: 256, y: 24, width: 176 },
  { id: 'payload-length', x: 8, y: 56, width: 176 },
  { id: 'next-header', x: 184, y: 56, width: 128 },
  { id: 'hop-limit', x: 312, y: 56, width: 120 },
  { id: 'source', x: 8, y: 88, width: 212 },
  { id: 'destination', x: 220, y: 88, width: 212 },
  { id: 'payload', x: 8, y: 140, width: 424 },
]

const wideGroups = [
  { id: 'header', x: 4, y: 4, width: 432, height: 124 },
]

const wideSizeNote = { x: 428, y: 18 }

// 칸이 하는 일을 하나씩 본다. 다음 헤더는 바로 뒤에 오는 것을 가리키므로 페이로드도 함께 밝힌다. 칸 그림이라 화살표가 없다.
export const ipv6HeaderScenarios: DiagramScenario[] = [
  { id: 'hop-limit', nodes: ['hop-limit'], paths: [] },
  { id: 'next-header', nodes: ['next-header', 'payload'], paths: [] },
  { id: 'addresses', nodes: ['source', 'destination'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function Ipv6HeaderDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutSizeNote = wide ? wideSizeNote : sizeNote

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={ipv6HeaderScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 180' : '0 0 280 212'}>
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

          <text data-note="size" x={layoutSizeNote.x} y={layoutSizeNote.y} textAnchor="end" className="fill-muted" fontSize="9">
            {text.notes!.size}
          </text>

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
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
