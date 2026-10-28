import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-basics'].diagrams.internetwork

// 네트워크 박스 셋을 위에서 아래로 쌓는다. 이웃한 두 박스 사이는 16만 띄워, 라우터가 두 박스의 경계에 걸치게 한다.
const groups = [
  { id: 'net-1', x: 4, y: 8, width: 272, height: 88 },
  { id: 'net-2', x: 4, y: 112, width: 272, height: 104 },
  { id: 'net-3', x: 4, y: 232, width: 272, height: 80 },
]

// 박스마다 호스트 둘을 나란히 둔다. 라우터는 위 박스의 아래 변과 아래 박스의 위 변에 함께 걸친다. 노드는 모두 회색이다.
const nodes = [
  { id: 'host-a', x: 16, y: 32, width: 96 },
  { id: 'host-b', x: 168, y: 32, width: 96 },
  { id: 'router-1', x: 92, y: 88, width: 96 },
  { id: 'host-c', x: 16, y: 144, width: 96 },
  { id: 'host-d', x: 168, y: 144, width: 96 },
  { id: 'router-2', x: 92, y: 208, width: 96 },
  { id: 'host-e', x: 16, y: 264, width: 96 },
  { id: 'host-f', x: 168, y: 264, width: 96 },
]

// 다른 네트워크로 가는 메시지는 라우터에서 끊어 그린다. 라우터로 들어가는 화살표는 네트워크 1 안에, 나오는 화살표는 네트워크 2 안에 있다.
const paths: Record<string, string> = {
  'inside': 'M112 48 H168',
  'across-1': 'M104 64 V88',
  'across-2': 'M104 120 V144',
}

// 가로형은 네트워크 박스 셋을 왼쪽에서 오른쪽으로 나란히 두고, 라우터를 두 박스 사이의 경계에 걸친다.
const wideGroups = [
  { id: 'net-1', x: 4, y: 8, width: 120, height: 136 },
  { id: 'net-2', x: 156, y: 8, width: 128, height: 136 },
  { id: 'net-3', x: 316, y: 8, width: 120, height: 136 },
]

// 박스마다 호스트 둘을 위아래로 둔다. 라우터는 윗줄 호스트와 같은 높이에 둬서 다른 네트워크로 가는 화살표가 곧게 간다.
const wideNodes = [
  { id: 'host-a', x: 28, y: 32, width: 64 },
  { id: 'host-b', x: 28, y: 96, width: 64 },
  { id: 'router-1', x: 112, y: 32, width: 56 },
  { id: 'host-c', x: 188, y: 32, width: 64 },
  { id: 'host-d', x: 188, y: 96, width: 64 },
  { id: 'router-2', x: 272, y: 32, width: 56 },
  { id: 'host-e', x: 348, y: 32, width: 64 },
  { id: 'host-f', x: 348, y: 96, width: 64 },
]

const widePaths: Record<string, string> = {
  'inside': 'M60 64 V96',
  'across-1': 'M92 48 H112',
  'across-2': 'M168 48 H188',
}

export const internetworkScenarios: DiagramScenario[] = [
  { id: 'inside', nodes: ['host-a', 'host-b'], paths: ['inside'] },
  { id: 'across', nodes: ['host-a', 'router-1', 'host-c'], paths: ['across-1', 'across-2'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function InternetworkDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-internetwork-arrow`
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={internetworkScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 152' : '0 0 280 320'}>
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
