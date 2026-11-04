import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-permissions'].diagrams['permission-classes']

// 세로형은 맨 위에 파일 report.txt와 그 곁말(소유자와 그룹)을 두고, 아래 왼쪽 열에 사용자 셋, 오른쪽 열에 권한 셋을 같은 줄에 맞춰 둔다.
// user1·user2는 dev 그룹 테두리 안에, user3는 그 밖에 있다. 화살표는 사용자에서 같은 줄의 권한으로 곧게 간다. 노드는 모두 회색이다.
const nodes = [
  { id: 'file', x: 16, y: 8, width: 88 },
  { id: 'user1', x: 24, y: 76, width: 56 },
  { id: 'user2', x: 24, y: 116, width: 56 },
  { id: 'user3', x: 24, y: 172, width: 56 },
  { id: 'owner', x: 152, y: 76, width: 104 },
  { id: 'group', x: 152, y: 116, width: 104 },
  { id: 'others', x: 152, y: 172, width: 104 },
]

const groups = [
  { id: 'dev', x: 8, y: 56, width: 88, height: 100, labelX: 16, labelY: 70 },
  { id: 'perms', x: 136, y: 56, width: 136, height: 156, labelX: 144, labelY: 70 },
]

// 화살표는 그 사람이 report.txt에 접근할 때 적용되는 권한을 가리킨다. 시나리오마다 하나만 보인다.
const paths: Record<string, string> = {
  'to-owner': 'M80 92 H152',
  'to-group': 'M80 132 H152',
  'to-others': 'M80 188 H152',
}

// 파일의 곁말은 시나리오와 상관없이 늘 보인다.
const note = { id: 'file-note', x: 112, y: 28, anchor: 'start' as const }

// 가로형은 위에서부터 파일, 사용자 줄, 권한 줄을 쌓는다. 사용자는 자기 권한 바로 위에 세워 화살표가 곧게 내려가고,
// 권한 테두리의 라벨은 왼쪽 빈자리에 두어 화살표가 지나지 않게 한다.
const wideNodes = [
  { id: 'file', x: 16, y: 8, width: 88 },
  { id: 'user1', x: 140, y: 68, width: 56 },
  { id: 'user2', x: 244, y: 68, width: 56 },
  { id: 'user3', x: 348, y: 68, width: 56 },
  { id: 'owner', x: 120, y: 132, width: 96 },
  { id: 'group', x: 224, y: 132, width: 96 },
  { id: 'others', x: 328, y: 132, width: 96 },
]

const wideGroups = [
  { id: 'dev', x: 128, y: 48, width: 184, height: 60, labelX: 136, labelY: 62 },
  { id: 'perms', x: 8, y: 124, width: 424, height: 48, labelX: 16, labelY: 152 },
]

const widePaths: Record<string, string> = {
  'to-owner': 'M168 100 V132',
  'to-group': 'M272 100 V132',
  'to-others': 'M376 100 V132',
}

const wideNote = { id: 'file-note', x: 112, y: 28, anchor: 'start' as const }

// 시나리오마다 그 사람과 그 사람에게 적용되는 권한, 그리고 파일이 선명하다. user1은 dev 그룹에도 들지만 소유자 권한으로 간다.
export const permissionClassesScenarios: DiagramScenario[] = [
  { id: 'owner', nodes: ['file', 'user1', 'owner'], paths: ['to-owner'] },
  { id: 'group', nodes: ['file', 'user2', 'group'], paths: ['to-group'] },
  { id: 'others', nodes: ['file', 'user3', 'others'], paths: ['to-others'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PermissionClassesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-permission-classes-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNote = wide ? wideNote : note

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={permissionClassesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 180' : '0 0 280 220'}>
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

          <text data-note={layoutNote.id} x={layoutNote.x} y={layoutNote.y} textAnchor={layoutNote.anchor} className="fill-muted" fontSize="9">
            {text.notes![layoutNote.id]}
          </text>
        </svg>
      </div>
    </DiagramFrame>
  )
}
