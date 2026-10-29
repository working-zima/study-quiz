import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ip-address-types'].diagrams['napt-ports']

// 세로형은 맨 위 사설 네트워크 박스에 호스트 A·B를 나란히 두고, 그 아래에 NAT 라우터와 서버를, 맨 아래에 NAT 라우터의 표를 둔다.
// 표는 사설 주소:포트 칸과 공인 주소:포트 칸을 빈틈없이 이은 두 줄이다. 노드는 모두 회색이다.
const nodes = [
  { id: 'host-a', x: 16, y: 28, width: 120 },
  { id: 'host-b', x: 144, y: 28, width: 120 },
  { id: 'router', x: 92, y: 108, width: 96 },
  { id: 'server', x: 208, y: 108, width: 56 },
  { id: 'private-1', x: 16, y: 192, width: 128 },
  { id: 'public-1', x: 144, y: 192, width: 120 },
  { id: 'private-2', x: 16, y: 224, width: 128 },
  { id: 'public-2', x: 144, y: 224, width: 120 },
]

const groups = [
  { id: 'private', x: 8, y: 8, width: 264, height: 76, labelX: 16, labelY: 20 },
  { id: 'table', x: 8, y: 156, width: 264, height: 108, labelX: 16, labelY: 168 },
]

// 화살표는 서버의 응답이 돌아가는 방향이다. 서버에서 NAT 라우터로 온 응답이 표의 한 줄을 따라 호스트 하나에게 간다.
const paths: Record<string, string> = {
  'from-server': 'M208 124 H188',
  'to-host-a': 'M128 108 V60',
  'to-host-b': 'M152 108 V60',
}

// 장치의 주소는 그 장치의 흐림을 따르고, 표의 열 이름은 늘 선명하다.
const notes = [
  { id: 'host-a-address', owner: 'host-a', x: 76, y: 74, anchor: 'middle' as const },
  { id: 'host-b-address', owner: 'host-b', x: 204, y: 74, anchor: 'middle' as const },
  { id: 'router-address', owner: 'router', x: 84, y: 128, anchor: 'end' as const },
  { id: 'private-header', owner: null, x: 80, y: 184, anchor: 'middle' as const },
  { id: 'public-header', owner: null, x: 204, y: 184, anchor: 'middle' as const },
]

// 가로형은 왼쪽 사설 네트워크 박스에 호스트 A·B를 위아래로 두고, 가운데에 NAT 라우터, 오른쪽에 서버를 놓는다.
// NAT 라우터의 표는 NAT 라우터와 서버 아래에 둔다.
const wideNodes = [
  { id: 'host-a', x: 16, y: 28, width: 112 },
  { id: 'host-b', x: 16, y: 92, width: 112 },
  { id: 'router', x: 192, y: 60, width: 96 },
  { id: 'server', x: 352, y: 60, width: 72 },
  { id: 'private-1', x: 168, y: 152, width: 136 },
  { id: 'public-1', x: 304, y: 152, width: 120 },
  { id: 'private-2', x: 168, y: 184, width: 136 },
  { id: 'public-2', x: 304, y: 184, width: 120 },
]

const wideGroups = [
  { id: 'private', x: 8, y: 8, width: 128, height: 136, labelX: 16, labelY: 20 },
  { id: 'table', x: 160, y: 116, width: 272, height: 108, labelX: 168, labelY: 128 },
]

const widePaths: Record<string, string> = {
  'from-server': 'M352 76 H288',
  'to-host-a': 'M192 68 H160 V44 H128',
  'to-host-b': 'M192 84 H160 V108 H128',
}

// 곁말의 자리만 배치마다 다르다. 흐림을 따르는 노드는 세로형에서 id로 가져온다.
const wideNotes = [
  { id: 'host-a-address', x: 72, y: 74, anchor: 'middle' as const },
  { id: 'host-b-address', x: 72, y: 138, anchor: 'middle' as const },
  { id: 'router-address', x: 240, y: 106, anchor: 'middle' as const },
  { id: 'private-header', x: 236, y: 146, anchor: 'middle' as const },
  { id: 'public-header', x: 364, y: 146, anchor: 'middle' as const },
]

// 호스트 A의 통신: 표 첫 줄, 응답은 호스트 A에게. 호스트 B의 통신: 표 둘째 줄, 응답은 호스트 B에게. NAT 라우터와 서버는 둘 다 같다.
export const naptPortsScenarios: DiagramScenario[] = [
  { id: 'host-1', nodes: ['host-a', 'router', 'server', 'private-1', 'public-1'], paths: ['from-server', 'to-host-a'] },
  { id: 'host-2', nodes: ['host-b', 'router', 'server', 'private-2', 'public-2'], paths: ['from-server', 'to-host-b'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function NaptPortsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-napt-ports-arrow`
  const opacityOf = (id: string | null) => (active && id !== null && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={naptPortsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 232' : '0 0 280 272'}>
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

          {layoutNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9" opacity={opacityOf(note.owner)}>
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
