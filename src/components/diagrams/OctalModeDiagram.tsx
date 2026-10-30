import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-permissions'].diagrams['octal-mode']

// 세로형은 소유자·그룹·그 밖의 사용자 세 열을 나란히 둔다. 열마다 위에서 아래로 권한 세 글자, 더하는 식, 숫자 한 자리다.
// 세 열의 숫자를 왼쪽부터 읽으면 755가 된다. 노드는 모두 회색이다.
const nodes = [
  { id: 'chunk-owner', x: 12, y: 32, width: 72 },
  { id: 'sum-owner', x: 12, y: 80, width: 72 },
  { id: 'digit-owner', x: 12, y: 128, width: 72 },
  { id: 'chunk-group', x: 104, y: 32, width: 72 },
  { id: 'sum-group', x: 104, y: 80, width: 72 },
  { id: 'digit-group', x: 104, y: 128, width: 72 },
  { id: 'chunk-others', x: 196, y: 32, width: 72 },
  { id: 'sum-others', x: 196, y: 80, width: 72 },
  { id: 'digit-others', x: 196, y: 128, width: 72 },
]

const groups = [
  { id: 'owner', x: 4, y: 8, width: 88, height: 164, labelX: 12, labelY: 22 },
  { id: 'group', x: 96, y: 8, width: 88, height: 164, labelX: 104, labelY: 22 },
  { id: 'others', x: 188, y: 8, width: 88, height: 164, labelX: 196, labelY: 22 },
]

// 한 열 안에서 위 노드와 아래 노드를 잇는 선은 늘 보인다. 시나리오는 노드와 선의 흐림으로만 가른다.
const paths: Record<string, string> = {
  'l-owner-1': 'M48 64 V80',
  'l-owner-2': 'M48 112 V128',
  'l-group-1': 'M140 64 V80',
  'l-group-2': 'M140 112 V128',
  'l-others-1': 'M232 64 V80',
  'l-others-2': 'M232 112 V128',
}

const linkIds = ['l-owner-1', 'l-owner-2', 'l-group-1', 'l-group-2', 'l-others-1', 'l-others-2']

// 가로형도 세 열을 나란히 두고 열과 노드만 넓다.
const wideNodes = [
  { id: 'chunk-owner', x: 24, y: 32, width: 104 },
  { id: 'sum-owner', x: 24, y: 80, width: 104 },
  { id: 'digit-owner', x: 24, y: 128, width: 104 },
  { id: 'chunk-group', x: 168, y: 32, width: 104 },
  { id: 'sum-group', x: 168, y: 80, width: 104 },
  { id: 'digit-group', x: 168, y: 128, width: 104 },
  { id: 'chunk-others', x: 312, y: 32, width: 104 },
  { id: 'sum-others', x: 312, y: 80, width: 104 },
  { id: 'digit-others', x: 312, y: 128, width: 104 },
]

const wideGroups = [
  { id: 'owner', x: 8, y: 8, width: 136, height: 164, labelX: 16, labelY: 22 },
  { id: 'group', x: 152, y: 8, width: 136, height: 164, labelX: 160, labelY: 22 },
  { id: 'others', x: 296, y: 8, width: 136, height: 164, labelX: 304, labelY: 22 },
]

const widePaths: Record<string, string> = {
  'l-owner-1': 'M76 64 V80',
  'l-owner-2': 'M76 112 V128',
  'l-group-1': 'M220 64 V80',
  'l-group-2': 'M220 112 V128',
  'l-others-1': 'M364 64 V80',
  'l-others-2': 'M364 112 V128',
}

// nodes에는 선명하게 둘 노드와 연결선을 함께 적는다. 시나리오마다 한 열이 선명하다.
export const octalModeScenarios: DiagramScenario[] = [
  { id: 'owner', nodes: ['chunk-owner', 'sum-owner', 'digit-owner', 'l-owner-1', 'l-owner-2'], paths: [] },
  { id: 'group', nodes: ['chunk-group', 'sum-group', 'digit-group', 'l-group-1', 'l-group-2'], paths: [] },
  { id: 'others', nodes: ['chunk-others', 'sum-others', 'digit-others', 'l-others-1', 'l-others-2'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function OctalModeDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
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
      scenarios={octalModeScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 180' : '0 0 280 180'}>
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

          {linkIds.map((id) => (
            <path key={id} data-link={id} d={layoutPaths[id]} className="fill-none stroke-muted" strokeWidth="1.5" opacity={opacityOf(id)} />
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
