import { useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-compute'].diagrams['vm-containers']

// 호스트 둘을 위아래로 쌓는다. VM 호스트 안에는 VM 박스 둘을 나란히 두고, VM마다 앱 위에 운영 체제를 둔다.
// 컨테이너 호스트에는 컨테이너 셋을 한 줄로 두고 그 아래 호스트의 운영 체제 하나를 둔다. 노드는 모두 회색이다.
const groups = [
  { id: 'vm-host', x: 4, y: 4, width: 272, height: 170 },
  { id: 'vm-1', x: 12, y: 26, width: 124, height: 120 },
  { id: 'vm-2', x: 144, y: 26, width: 124, height: 120 },
  { id: 'container-host', x: 4, y: 186, width: 272, height: 144 },
]
const nodes = [
  { id: 'vm-1-app', x: 24, y: 50, width: 100 },
  { id: 'vm-1-os', x: 24, y: 106, width: 100 },
  { id: 'vm-2-app', x: 156, y: 50, width: 100 },
  { id: 'vm-2-os', x: 156, y: 106, width: 100 },
  { id: 'ctr-1', x: 18, y: 214, width: 76 },
  { id: 'ctr-2', x: 102, y: 214, width: 76 },
  { id: 'ctr-3', x: 186, y: 214, width: 76 },
  { id: 'host-os', x: 18, y: 270, width: 244 },
]

// 통신 경로가 아니라 무엇이 어느 운영 체제를 쓰는지의 관계다. 화살표 없이 모든 시나리오에서 유지하고, 선은 자기 호스트 박스 밖으로 나가지 않는다.
const paths: Record<string, string> = {
  'link-vm-1': 'M74 82 V106',
  'link-vm-2': 'M206 82 V106',
  'link-ctr-1': 'M56 246 V270',
  'link-ctr-2': 'M140 246 V270',
  'link-ctr-3': 'M224 246 V270',
}
// 곁말은 자기 호스트 박스의 맨 아래에 둔다.
const notes = [
  { id: 'vm-os-note', x: 140, y: 164, scenario: 'vm' },
  { id: 'container-note', x: 140, y: 320, scenario: 'container' },
]

// 가로형은 두 호스트를 나란히 둔다. 컨테이너 셋이 한 줄에 들도록 컨테이너 호스트를 더 넓게 잡는다.
const wideGroups = [
  { id: 'vm-host', x: 4, y: 4, width: 178, height: 170 },
  { id: 'vm-1', x: 12, y: 26, width: 78, height: 120 },
  { id: 'vm-2', x: 96, y: 26, width: 78, height: 120 },
  { id: 'container-host', x: 190, y: 4, width: 246, height: 170 },
]
const wideNodes = [
  { id: 'vm-1-app', x: 18, y: 50, width: 66 },
  { id: 'vm-1-os', x: 18, y: 106, width: 66 },
  { id: 'vm-2-app', x: 102, y: 50, width: 66 },
  { id: 'vm-2-os', x: 102, y: 106, width: 66 },
  { id: 'ctr-1', x: 198, y: 50, width: 72 },
  { id: 'ctr-2', x: 278, y: 50, width: 72 },
  { id: 'ctr-3', x: 358, y: 50, width: 72 },
  { id: 'host-os', x: 198, y: 106, width: 232 },
]
const widePaths: Record<string, string> = {
  'link-vm-1': 'M51 82 V106',
  'link-vm-2': 'M135 82 V106',
  'link-ctr-1': 'M234 82 V106',
  'link-ctr-2': 'M314 82 V106',
  'link-ctr-3': 'M394 82 V106',
}
// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes = [
  { id: 'vm-os-note', x: 93, y: 164 },
  { id: 'container-note', x: 313, y: 164 },
]

// 두 시나리오는 한 호스트 안의 노드만 선명하게 둔다. 선명한 노드가 겹치지 않아야 두 방식이 갈린다.
export const vmContainerScenarios: DiagramScenario[] = [
  { id: 'vm', nodes: ['vm-1-app', 'vm-1-os', 'vm-2-app', 'vm-2-os'], paths: [] },
  { id: 'container', nodes: ['ctr-1', 'ctr-2', 'ctr-3', 'host-os'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function VmContainerDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = layoutNotes.filter((note) => note.scenario === active?.id)

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={vmContainerScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 180' : '0 0 280 336'}>
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
          <g className="fill-none stroke-disabled" strokeWidth="1.5">
            {Object.entries(layoutPaths).map(([id, d]) => <path key={id} data-link={id} d={d} />)}
          </g>
          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={active && !active.nodes.includes(node.id) ? 0.25 : 1}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}
          {shownNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
