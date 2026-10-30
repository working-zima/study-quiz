import { useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-service-types'].diagrams['shared-responsibility']

// 책임 열 가지를 세 그룹 박스로 묶어 위에서부터 늘 고객, 서비스 유형에 따라, 클라우드에서는 늘 공급자 순으로 쌓는다.
// 행은 「Shared responsibility in the cloud」 책임 표의 순서다. 노드는 모두 회색이고 경로는 없다.
const groups = [
  { id: 'customer', x: 6, y: 4, width: 268, height: 140 },
  { id: 'varies', x: 6, y: 152, width: 268, height: 180 },
  { id: 'provider', x: 6, y: 340, width: 268, height: 140 },
]

const nodes = [
  { id: 'data', x: 24, y: 24, width: 196 },
  { id: 'config', x: 24, y: 64, width: 196 },
  { id: 'account', x: 24, y: 104, width: 196 },
  { id: 'device', x: 24, y: 172, width: 196 },
  { id: 'application', x: 24, y: 212, width: 196 },
  { id: 'network', x: 24, y: 252, width: 196 },
  { id: 'os', x: 24, y: 292, width: 196 },
  { id: 'host', x: 24, y: 360, width: 196 },
  { id: 'physical-network', x: 24, y: 400, width: 196 },
  { id: 'datacenter', x: 24, y: 440, width: 196 },
]

// 「함께」는 그 행의 노드 오른쪽, 가운데 그룹 박스 안에 둔다. 책임 표에서 그 칸이 함께인 시나리오에서만 보인다.
const notes = [
  { id: 'device-shared', x: 247, y: 192, scenarios: ['saas'] },
  { id: 'application-shared', x: 247, y: 232, scenarios: ['paas', 'saas'] },
  { id: 'network-shared', x: 247, y: 272, scenarios: ['paas'] },
]

// 가로형은 세 묶음을 왼쪽(고객)에서 오른쪽(공급자)으로 나란히 둔다. 「함께」가 붙는 가운데 묶음만 곁말 자리만큼 넓다.
const wideGroups = [
  { id: 'customer', x: 14, y: 4, width: 116, height: 140 },
  { id: 'varies', x: 138, y: 4, width: 146, height: 180 },
  { id: 'provider', x: 292, y: 4, width: 134, height: 140 },
]

const wideNodes = [
  { id: 'data', x: 24, y: 24, width: 96 },
  { id: 'config', x: 24, y: 64, width: 96 },
  { id: 'account', x: 24, y: 104, width: 96 },
  { id: 'device', x: 148, y: 24, width: 100 },
  { id: 'application', x: 148, y: 64, width: 100 },
  { id: 'network', x: 148, y: 104, width: 100 },
  { id: 'os', x: 148, y: 144, width: 100 },
  { id: 'host', x: 302, y: 24, width: 114 },
  { id: 'physical-network', x: 302, y: 64, width: 114 },
  { id: 'datacenter', x: 302, y: 104, width: 114 },
]

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes = [
  { id: 'device-shared', x: 266, y: 44 },
  { id: 'application-shared', x: 266, y: 84 },
  { id: 'network-shared', x: 266, y: 124 },
]

const customerIds = ['data', 'config', 'account']

export const sharedResponsibilityScenarios: DiagramScenario[] = [
  { id: 'on-premises', nodes: nodes.map(({ id }) => id), paths: [] },
  { id: 'iaas', nodes: [...customerIds, 'device', 'application', 'network', 'os'], paths: [] },
  { id: 'paas', nodes: [...customerIds, 'device', 'application', 'network'], paths: [] },
  { id: 'saas', nodes: [...customerIds, 'device', 'application'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function SharedResponsibilityDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={sharedResponsibilityScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 188' : '0 0 280 484'}>
          {layoutGroups.map((group) => (
            <rect key={group.id} data-group={group.id} x={group.x} y={group.y} width={group.width} height={group.height} rx="4" className="fill-none stroke-disabled" strokeWidth="1" />
          ))}
          {layoutGroups.map((group) => (
            <text key={group.id} data-group-label={group.id} x={group.x + 10} y={group.y + 14} className="fill-muted" fontSize="9">
              {text.groups?.[group.id]}
            </text>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
