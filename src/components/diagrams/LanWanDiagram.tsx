import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-basics'].diagrams['lan-wan']

// 집의 LAN을 위에, 다른 LAN을 아래에 두고 그 사이에 WAN을 둔다. WAN은 어느 LAN 박스에도 걸치지 않는다.
const groups = [
  { id: 'lan-1', x: 4, y: 8, width: 272, height: 104 },
  { id: 'lan-2', x: 4, y: 200, width: 272, height: 104 },
]

// LAN마다 공유기 하나에 장치 둘이 이어진다. 노드는 모두 회색이다.
const nodes = [
  { id: 'laptop', x: 16, y: 32, width: 96 },
  { id: 'phone', x: 168, y: 32, width: 96 },
  { id: 'home-router', x: 92, y: 72, width: 96 },
  { id: 'wan', x: 92, y: 136, width: 96 },
  { id: 'far-router', x: 92, y: 216, width: 96 },
  { id: 'desktop', x: 16, y: 264, width: 96 },
  { id: 'server', x: 168, y: 264, width: 96 },
]

// 연결선 여섯은 늘 보인다. 화살표는 메시지가 지나는 연결선 위에 겹쳐 그리고, 노드 하나에서 다음 노드까지만 간다.
const paths: Record<string, string> = {
  'laptop-home-router': 'M64 64 V88 H92',
  'phone-home-router': 'M216 64 V88 H188',
  'home-router-wan': 'M140 104 V136',
  'wan-far-router': 'M140 168 V216',
  'far-router-desktop': 'M92 232 H64 V264',
  'far-router-server': 'M188 232 H216 V264',
  'lan-1': 'M64 64 V88 H92',
  'lan-2': 'M188 88 H216 V64',
  'wan-1': 'M64 64 V88 H92',
  'wan-2': 'M140 104 V136',
  'wan-3': 'M140 168 V216',
  'wan-4': 'M92 232 H64 V264',
}

const linkIds = ['laptop-home-router', 'phone-home-router', 'home-router-wan', 'wan-far-router', 'far-router-desktop', 'far-router-server']

// 가까운 거리는 집의 LAN 박스 안 오른쪽 위에, 먼 거리와 ISP가 구축은 WAN의 양옆에 둔다.
const notes = [
  { id: 'near', x: 266, y: 22, textAnchor: 'end' as const, scenarios: ['lan'] },
  { id: 'far', x: 80, y: 156, textAnchor: 'end' as const, scenarios: ['wan'] },
  { id: 'isp', x: 200, y: 156, textAnchor: 'start' as const, scenarios: ['wan'] },
]

// 가로형은 집의 LAN을 왼쪽에, 다른 LAN을 오른쪽에 두고 그 사이에 WAN을 둔다.
const wideGroups = [
  { id: 'lan-1', x: 4, y: 8, width: 152, height: 128 },
  { id: 'lan-2', x: 284, y: 8, width: 152, height: 128 },
]

// LAN마다 장치 둘을 바깥쪽에 위아래로 쌓고, 공유기를 WAN 쪽에 둔다. 공유기와 WAN은 한 줄에 서서 연결선이 곧게 간다.
const wideNodes = [
  { id: 'laptop', x: 16, y: 32, width: 64 },
  { id: 'phone', x: 16, y: 96, width: 64 },
  { id: 'home-router', x: 96, y: 64, width: 52 },
  { id: 'wan', x: 188, y: 64, width: 64 },
  { id: 'far-router', x: 292, y: 64, width: 52 },
  { id: 'desktop', x: 360, y: 32, width: 64 },
  { id: 'server', x: 360, y: 96, width: 64 },
]

const widePaths: Record<string, string> = {
  'laptop-home-router': 'M80 48 H122 V64',
  'phone-home-router': 'M80 112 H122 V96',
  'home-router-wan': 'M148 80 H188',
  'wan-far-router': 'M252 80 H292',
  'far-router-desktop': 'M318 64 V48 H360',
  'far-router-server': 'M318 96 V112 H360',
  'lan-1': 'M80 48 H122 V64',
  'lan-2': 'M122 96 V112 H80',
  'wan-1': 'M80 48 H122 V64',
  'wan-2': 'M148 80 H188',
  'wan-3': 'M252 80 H292',
  'wan-4': 'M318 64 V48 H360',
}

// 곁말은 자리와 정렬이 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'near', x: 146, y: 22, textAnchor: 'end' as const },
  { id: 'far', x: 220, y: 56, textAnchor: 'middle' as const },
  { id: 'isp', x: 220, y: 110, textAnchor: 'middle' as const },
]

// nodes에는 선명하게 둘 노드와 연결선을 함께 적는다.
export const lanWanScenarios: DiagramScenario[] = [
  {
    id: 'lan',
    nodes: ['laptop', 'phone', 'home-router', 'laptop-home-router', 'phone-home-router'],
    paths: ['lan-1', 'lan-2'],
  },
  {
    id: 'wan',
    nodes: ['laptop', 'home-router', 'wan', 'far-router', 'desktop', 'laptop-home-router', 'home-router-wan', 'wan-far-router', 'far-router-desktop'],
    paths: ['wan-1', 'wan-2', 'wan-3', 'wan-4'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function LanWanDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-lan-wan-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={lanWanScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 144' : '0 0 280 312'}>
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

          {linkIds.map((id) => (
            <path key={id} data-link={id} d={layoutPaths[id]} className="fill-none stroke-muted" strokeWidth="1.5" opacity={opacityOf(id)} />
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
