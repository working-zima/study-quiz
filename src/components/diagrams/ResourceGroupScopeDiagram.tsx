import { useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-resource-hierarchy'].diagrams['resource-group']

// 리소스 그룹 둘을 위아래로 쌓는다. 「개발 환경」에는 리소스 셋을 두 줄로, 「운영」에는 VM 2 하나를 둔다.
// 노드는 자기 그룹 박스의 라벨 자리 아래에 있고, 리소스는 그룹 박스 하나에만 든다.
const groups = [
  { id: 'rg-dev', x: 6, y: 4, width: 268, height: 108 },
  { id: 'rg-prod', x: 6, y: 120, width: 268, height: 68 },
]

// 노드는 모두 회색이다. 그룹에 한 일이 어디까지 미치는지는 흐림과 곁말로만 보인다.
const nodes = [
  { id: 'vm-1', x: 20, y: 32, width: 112 },
  { id: 'vnet', x: 148, y: 32, width: 112 },
  { id: 'db', x: 84, y: 72, width: 112 },
  { id: 'vm-2', x: 20, y: 148, width: 112 },
]

// 곁말은 「개발 환경」 라벨 오른쪽, 라벨과 같은 줄에 두고 그 시나리오에서만 보인다.
const notes = [
  { id: 'delete-note', x: 136, y: 18, textAnchor: 'start' as const, scenarios: ['delete'] },
  { id: 'access-note', x: 136, y: 18, textAnchor: 'start' as const, scenarios: ['access'] },
]

// 가로형은 리소스 그룹 둘을 나란히 두고, 「개발 환경」의 리소스 셋을 한 줄에 늘어놓는다.
const wideGroups = [
  { id: 'rg-dev', x: 8, y: 4, width: 304, height: 76 },
  { id: 'rg-prod', x: 320, y: 4, width: 112, height: 76 },
]

const wideNodes = [
  { id: 'vm-1', x: 20, y: 36, width: 84 },
  { id: 'vnet', x: 114, y: 36, width: 96 },
  { id: 'db', x: 220, y: 36, width: 84 },
  { id: 'vm-2', x: 334, y: 36, width: 84 },
]

// 곁말은 자리가 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'delete-note', x: 138, y: 18, textAnchor: 'start' as const },
  { id: 'access-note', x: 138, y: 18, textAnchor: 'start' as const },
]

// 그룹을 지우면 다른 그룹의 VM 2만 남고, 그룹에 권한을 주면 그 그룹 안의 리소스 셋에만 미친다. 그릴 경로는 없다.
export const resourceGroupScopeScenarios: DiagramScenario[] = [
  { id: 'delete', nodes: ['vm-2'], paths: [] },
  { id: 'access', nodes: ['vm-1', 'vnet', 'db'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ResourceGroupScopeDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenarios.includes(active.id))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={resourceGroupScopeScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 88' : '0 0 280 196'}>
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

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={active && !active.nodes.includes(node.id) ? 0.25 : 1}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {shownNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.textAnchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
