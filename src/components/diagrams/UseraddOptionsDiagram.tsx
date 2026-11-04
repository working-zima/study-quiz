import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-accounts'].diagrams['useradd-options']

// 세로형은 왼쪽 테두리 「입력한 명령」 안에 명령 덩어리 여섯을 위에서 아래로 차례대로 쌓는다.
// 오른쪽에는 위부터 새 홈 디렉터리, 테두리 「/etc/passwd에 생긴 줄」 안의 세 칸, 테두리 「/etc/group」 안의 ops 줄을 둔다.
// 선은 덩어리의 오른쪽 변에서 나와 두 열 사이의 통로(x 120)를 지나 결과 노드의 왼쪽 변에 닿는다.
const nodes = [
  { id: 'useradd', x: 16, y: 30, width: 88 },
  { id: 'opt-m', x: 16, y: 62, width: 88 },
  { id: 'opt-g', x: 16, y: 94, width: 88 },
  { id: 'opt-supp', x: 16, y: 126, width: 88 },
  { id: 'opt-s', x: 16, y: 158, width: 88 },
  { id: 'name', x: 16, y: 190, width: 88 },
  { id: 'passwd-name', x: 140, y: 122, width: 128 },
  { id: 'passwd-gid', x: 140, y: 154, width: 128 },
  { id: 'passwd-shell', x: 140, y: 186, width: 128 },
  { id: 'home', x: 140, y: 62, width: 96 },
  { id: 'group-ops', x: 140, y: 256, width: 128 },
]

const groups = [
  { id: 'command', x: 8, y: 8, width: 104, height: 214, labelX: 16, labelY: 22 },
  { id: 'passwd', x: 132, y: 100, width: 144, height: 126, labelX: 140, labelY: 114 },
  { id: 'group-file', x: 132, y: 234, width: 144, height: 62, labelX: 140, labelY: 248 },
]

const paths: Record<string, string> = {
  'name-path': 'M104 206 H120 V138 H140',
  'primary-path': 'M104 110 H120 V170 H140',
  'supplementary-path': 'M104 142 H120 V272 H140',
  'home-path': 'M104 78 H140',
  'shell-path': 'M104 174 H120 V202 H140',
}

// 가로형은 위쪽 테두리 「입력한 명령」 안에 명령 덩어리 여섯을 한 줄로 잇는다.
// 가운데 줄에 새 홈 디렉터리와 테두리 「/etc/group」을, 아래 줄에 테두리 「/etc/passwd에 생긴 줄」의 세 칸을 둔다.
// 선은 덩어리의 아래 변에서 곧게 내려간다. user4의 선만 가운데 줄 아래의 통로(y 154)로 왼쪽까지 간다.
const wideNodes = [
  { id: 'useradd', x: 16, y: 30, width: 64 },
  { id: 'opt-m', x: 80, y: 30, width: 40 },
  { id: 'opt-g', x: 120, y: 30, width: 64 },
  { id: 'opt-supp', x: 184, y: 30, width: 64 },
  { id: 'opt-s', x: 248, y: 30, width: 96 },
  { id: 'name', x: 344, y: 30, width: 64 },
  { id: 'passwd-name', x: 16, y: 168, width: 120 },
  { id: 'passwd-gid', x: 136, y: 168, width: 80 },
  { id: 'passwd-shell', x: 216, y: 168, width: 128 },
  { id: 'home', x: 52, y: 96, width: 96 },
  { id: 'group-ops', x: 168, y: 96, width: 112 },
]

const wideGroups = [
  { id: 'command', x: 8, y: 8, width: 424, height: 62, labelX: 16, labelY: 22 },
  { id: 'group-file', x: 160, y: 88, width: 128, height: 62, labelX: 168, labelY: 142 },
  { id: 'passwd', x: 8, y: 160, width: 344, height: 62, labelX: 16, labelY: 214 },
]

const widePaths: Record<string, string> = {
  'name-path': 'M376 62 V154 H76 V168',
  'primary-path': 'M152 62 V168',
  'supplementary-path': 'M216 62 V96',
  'home-path': 'M100 62 V96',
  'shell-path': 'M296 62 V168',
}

export const useraddOptionsScenarios: DiagramScenario[] = [
  { id: 'name', nodes: ['name', 'passwd-name'], paths: ['name-path'] },
  { id: 'primary', nodes: ['opt-g', 'passwd-gid'], paths: ['primary-path'] },
  { id: 'supplementary', nodes: ['opt-supp', 'group-ops'], paths: ['supplementary-path'] },
  { id: 'home-shell', nodes: ['opt-m', 'opt-s', 'home', 'passwd-shell'], paths: ['home-path', 'shell-path'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function UseraddOptionsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-useradd-options-arrow`
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
      scenarios={useraddOptionsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 230' : '0 0 280 304'}>
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
