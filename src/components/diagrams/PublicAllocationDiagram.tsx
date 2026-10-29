import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ip-address-types'].diagrams['public-allocation']

// 세로형은 주소를 나눠 주는 차례대로 IANA·APNIC·ISP를 위에서 아래로 쌓고, ISP 아래에 주소를 받는 회사와 가정을 나란히 둔다.
// 기관의 역할 곁말은 자기 상자 오른쪽에 두고 그 상자의 흐림을 따른다. 노드는 모두 회색이다.
const nodes = [
  { id: 'iana', x: 48, y: 8, width: 96 },
  { id: 'rir', x: 48, y: 56, width: 96 },
  { id: 'isp', x: 48, y: 104, width: 96 },
  { id: 'company', x: 8, y: 152, width: 88 },
  { id: 'home', x: 136, y: 152, width: 88 },
]

// 화살표는 주소가 나눠지는 방향이다. ISP에서 두 사용자로 가는 화살표는 ISP 아래 변의 다른 자리에서 나와 서로 만나지 않는다.
const paths: Record<string, string> = {
  'iana-rir': 'M96 40 V56',
  'rir-isp': 'M96 88 V104',
  'isp-company': 'M72 136 V144 H52 V152',
  'isp-home': 'M120 136 V144 H180 V152',
}

const notes = [
  { id: 'iana-role', owner: 'iana', x: 152, y: 27, anchor: 'start' as const },
  { id: 'rir-role', owner: 'rir', x: 152, y: 75, anchor: 'start' as const },
  { id: 'isp-role', owner: 'isp', x: 152, y: 123, anchor: 'start' as const },
]

// 가로형은 IANA·APNIC·ISP를 왼쪽에서 오른쪽으로 놓고, 맨 오른쪽에 회사와 가정을 위아래로 둔다.
// 역할 곁말은 그림 아래 한 줄에 자기 상자의 왼쪽 끝부터 적는다.
const wideNodes = [
  { id: 'iana', x: 8, y: 40, width: 80 },
  { id: 'rir', x: 128, y: 40, width: 80 },
  { id: 'isp', x: 248, y: 40, width: 80 },
  { id: 'company', x: 352, y: 8, width: 80 },
  { id: 'home', x: 352, y: 72, width: 80 },
]

const widePaths: Record<string, string> = {
  'iana-rir': 'M88 56 H128',
  'rir-isp': 'M208 56 H248',
  'isp-company': 'M328 48 H340 V24 H352',
  'isp-home': 'M328 64 H340 V88 H352',
}

// 곁말의 자리만 배치마다 다르다. 흐림을 따르는 노드는 세로형에서 id로 가져온다.
const wideNotes = [
  { id: 'iana-role', x: 8, y: 116, anchor: 'start' as const },
  { id: 'rir-role', x: 128, y: 116, anchor: 'start' as const },
  { id: 'isp-role', x: 248, y: 116, anchor: 'start' as const },
]

// 나눠 주는 차례: 모든 상자와 화살표 넷. ISP에서 사용자로: ISP와 두 사용자, ISP에서 나가는 화살표 둘.
export const publicAllocationScenarios: DiagramScenario[] = [
  { id: 'chain', nodes: ['iana', 'rir', 'isp', 'company', 'home'], paths: ['iana-rir', 'rir-isp', 'isp-company', 'isp-home'] },
  { id: 'isp', nodes: ['isp', 'company', 'home'], paths: ['isp-company', 'isp-home'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PublicAllocationDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-public-allocation-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={publicAllocationScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 124' : '0 0 280 192'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

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
