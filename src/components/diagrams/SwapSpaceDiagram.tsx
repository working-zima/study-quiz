import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-filesystem'].diagrams['swap-space']

// 세로형은 위에 메모리(RAM) 테두리, 그 아래에 디스크 테두리를 두고, 디스크 밖 맨 아래에 명령 mkswap·swapon을 둔다.
// 최근에 덜 쓴 내용은 스왑 파티션 바로 위에, 두 명령은 스왑 파일 바로 아래에 세워 화살표가 곧게 간다. 노드는 모두 회색이다.
const nodes = [
  { id: 'recent', x: 16, y: 30, width: 112 },
  { id: 'idle', x: 144, y: 30, width: 112 },
  { id: 'file', x: 16, y: 126, width: 112 },
  { id: 'part', x: 144, y: 126, width: 112 },
  { id: 'mkswap', x: 16, y: 200, width: 64 },
  { id: 'swapon', x: 88, y: 200, width: 64 },
]

const groups = [
  { id: 'memory', x: 8, y: 8, width: 264, height: 62, labelX: 16, labelY: 22 },
  { id: 'disk', x: 8, y: 104, width: 264, height: 62, labelX: 16, labelY: 118 },
]

// 화살표는 시나리오마다 보인다. 메모리와 스왑 파티션 사이는 같은 선을 두 방향으로 쓰고, 명령의 화살표는 스왑 파일로 간다.
const paths: Record<string, string> = {
  'to-swap': 'M204 62 V126',
  'to-memory': 'M204 126 V62',
  'make-file': 'M44 200 V158',
  'on-file': 'M108 200 V158',
}

// 가로형은 왼쪽에 메모리, 가운데에 디스크, 오른쪽에 두 명령을 둔다. 메모리와 디스크의 노드는 같은 높이끼리 마주 본다.
const wideNodes = [
  { id: 'recent', x: 16, y: 30, width: 128 },
  { id: 'idle', x: 16, y: 78, width: 128 },
  { id: 'file', x: 200, y: 30, width: 128 },
  { id: 'part', x: 200, y: 78, width: 128 },
  { id: 'mkswap', x: 368, y: 30, width: 64 },
  { id: 'swapon', x: 368, y: 78, width: 64 },
]

const wideGroups = [
  { id: 'memory', x: 8, y: 8, width: 144, height: 110, labelX: 16, labelY: 22 },
  { id: 'disk', x: 192, y: 8, width: 144, height: 110, labelX: 200, labelY: 22 },
]

const widePaths: Record<string, string> = {
  'to-swap': 'M144 94 H200',
  'to-memory': 'M200 94 H144',
  'make-file': 'M368 46 H328',
  'on-file': 'M368 94 H348 V54 H328',
}

// 「메모리가 모자랄 때」와 「다시 쓸 때」는 같은 두 노드를 밝히고 화살표의 방향만 다르다.
export const swapSpaceScenarios: DiagramScenario[] = [
  { id: 'move', nodes: ['idle', 'part'], paths: ['to-swap'] },
  { id: 'back', nodes: ['part', 'idle'], paths: ['to-memory'] },
  { id: 'add', nodes: ['mkswap', 'swapon', 'file'], paths: ['make-file', 'on-file'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function SwapSpaceDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-swap-space-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={swapSpaceScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 126' : '0 0 280 240'}>
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
        </svg>
      </div>
    </DiagramFrame>
  )
}
