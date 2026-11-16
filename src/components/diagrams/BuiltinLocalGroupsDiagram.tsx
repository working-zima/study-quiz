import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-ad'].diagrams['builtin-local-groups']

// 맨 위 왼쪽에 계정 user01을 두고, 그 아래 왼쪽 박스에 기본 로컬 그룹 셋(Users·Backup Operators·Administrators)을 위에서 아래로,
// 오른쪽 박스에 그룹마다 할 수 있게 되는 일을 같은 줄에 둔다. 그룹과 그 일을 잇는 가로선은 늘 보인다.
// user01에서 나가는 화살표는 왼쪽 끝의 세로 통로를 내려가 고른 그룹의 왼쪽 변에 닿는다. 곁말은 user01의 오른쪽에 놓인다.
const nodes = [
  { id: 'account', x: 4, y: 8, width: 72 },
  { id: 'users', x: 28, y: 72, width: 116 },
  { id: 'backup', x: 28, y: 120, width: 116 },
  { id: 'admins', x: 28, y: 168, width: 116 },
  { id: 'do-daily', x: 164, y: 72, width: 108 },
  { id: 'do-backup', x: 164, y: 120, width: 108 },
  { id: 'do-all', x: 164, y: 168, width: 108 },
]

const groups = [
  { id: 'groups', x: 20, y: 52, width: 132, height: 156, labelX: 28, labelY: 65 },
  { id: 'abilities', x: 160, y: 52, width: 116, height: 156, labelX: 168, labelY: 65 },
]

// -do는 그룹과 그 그룹이 할 수 있게 하는 일을 잇는 늘 보이는 선이다. 나머지는 시나리오에서만 보이는 화살표다.
const paths: Record<string, string> = {
  'to-users': 'M12 40 V88 H28',
  'to-backup': 'M12 40 V136 H28',
  'to-admins': 'M12 40 V184 H28',
  'users-do': 'M144 88 H164',
  'backup-do': 'M144 136 H164',
  'admins-do': 'M144 184 H164',
}

const linkIds = ['users-do', 'backup-do', 'admins-do']

// 곁말은 자기 시나리오에서만 보인다. 셋 다 user01의 오른쪽 같은 자리에 놓인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'users-note', x: 84, y: 28, anchor: 'start', scenarios: ['users'] },
  { id: 'backup-note', x: 84, y: 28, anchor: 'start', scenarios: ['backup'] },
  { id: 'admins-note', x: 84, y: 28, anchor: 'start', scenarios: ['admins'] },
]

// 가로형도 같은 차례로 두되 폭을 넓힌다. 그룹 박스를 가운데로 옮겨, user01에서 내려간 화살표가 그룹까지 가로로 길게 간다.
const wideNodes = [
  { id: 'account', x: 8, y: 8, width: 72 },
  { id: 'users', x: 128, y: 72, width: 128 },
  { id: 'backup', x: 128, y: 120, width: 128 },
  { id: 'admins', x: 128, y: 168, width: 128 },
  { id: 'do-daily', x: 296, y: 72, width: 120 },
  { id: 'do-backup', x: 296, y: 120, width: 120 },
  { id: 'do-all', x: 296, y: 168, width: 120 },
]

const wideGroups = [
  { id: 'groups', x: 112, y: 52, width: 160, height: 156, labelX: 120, labelY: 65 },
  { id: 'abilities', x: 284, y: 52, width: 148, height: 156, labelX: 292, labelY: 65 },
]

const widePaths: Record<string, string> = {
  'to-users': 'M44 40 V88 H128',
  'to-backup': 'M44 40 V136 H128',
  'to-admins': 'M44 40 V184 H128',
  'users-do': 'M256 88 H296',
  'backup-do': 'M256 136 H296',
  'admins-do': 'M256 184 H296',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'users-note', x: 88, y: 28, anchor: 'start' },
  { id: 'backup-note', x: 88, y: 28, anchor: 'start' },
  { id: 'admins-note', x: 88, y: 28, anchor: 'start' },
]

// Users: 따로 넣지 않아도 로그온하면 Users의 권한으로 일상 작업. Backup Operators: 파일 백업과 복원. Administrators: 컴퓨터 전체 제어.
export const builtinLocalGroupsScenarios: DiagramScenario[] = [
  { id: 'users', nodes: ['account', 'users', 'do-daily'], paths: ['to-users'] },
  { id: 'backup', nodes: ['account', 'backup', 'do-backup'], paths: ['to-backup'] },
  { id: 'admins', nodes: ['account', 'admins', 'do-all'], paths: ['to-admins'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function BuiltinLocalGroupsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-builtin-local-groups-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenarios.includes(active.id))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={builtinLocalGroupsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 216' : '0 0 280 216'}>
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

          {linkIds.map((id) => (
            <path key={id} data-link={id} d={layoutPaths[id]} className="fill-none stroke-muted" strokeWidth="1.5" />
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

          {shownNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
