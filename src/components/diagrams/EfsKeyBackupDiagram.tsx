import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-admin-tools'].diagrams['efs-key-backup']

// 맨 위 지금 쓰는 Windows 박스 안에 user01과 그 개인 키를 나란히, 그 아래에 다른 사용자를 둔다. 박스 밖 가운데에 암호화한 파일을,
// 아래 왼쪽에 백업 파일 user01.pfx를, 오른쪽 다시 설치한 Windows 박스 안에 새 user01을 둔다. 다시 설치한 뒤의 화살표는 user01.pfx를 거쳐 파일로 간다.
const nodes = [
  { id: 'user01', x: 20, y: 32, width: 72 },
  { id: 'key', x: 108, y: 32, width: 112 },
  { id: 'other', x: 20, y: 76, width: 84 },
  { id: 'file', x: 52, y: 148, width: 160 },
  { id: 'pfx', x: 20, y: 232, width: 88 },
  { id: 'new-user01', x: 144, y: 232, width: 96 },
]

const groups = [
  { id: 'current', x: 8, y: 8, width: 264, height: 112, labelX: 16, labelY: 21 },
  { id: 'reinstalled', x: 128, y: 204, width: 144, height: 92, labelX: 136, labelY: 217 },
]

const paths: Record<string, string> = {
  'user01-key': 'M92 48 H108',
  'key-file': 'M196 64 V148',
  'new-pfx': 'M144 248 H108',
  'pfx-file': 'M64 232 V180',
}

// 「열 수 없음」은 그 계정 곁에, 「가져온다」는 user01.pfx 아래 두 박스 밖에 놓인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'other-note', x: 112, y: 96, anchor: 'start', scenarios: ['other-user'] },
  { id: 'no-backup-note', x: 192, y: 284, anchor: 'middle', scenarios: ['no-backup'] },
  { id: 'import-note', x: 64, y: 280, anchor: 'middle', scenarios: ['reinstall'] },
]

// 가로형은 두 Windows 박스를 왼쪽에 위아래로 두고, 오른쪽에 암호화한 파일과 그 아래 user01.pfx를 둔다.
// 새 user01의 화살표는 오른쪽 user01.pfx로 가고, user01.pfx의 화살표가 위로 올라가 파일에 닿는다.
const wideNodes = [
  { id: 'user01', x: 20, y: 32, width: 72 },
  { id: 'key', x: 108, y: 32, width: 112 },
  { id: 'other', x: 20, y: 76, width: 84 },
  { id: 'file', x: 248, y: 32, width: 168 },
  { id: 'pfx', x: 248, y: 168, width: 88 },
  { id: 'new-user01', x: 120, y: 168, width: 96 },
]

const wideGroups = [
  { id: 'current', x: 8, y: 8, width: 216, height: 112, labelX: 16, labelY: 21 },
  { id: 'reinstalled', x: 8, y: 144, width: 216, height: 72, labelX: 16, labelY: 157 },
]

const widePaths: Record<string, string> = {
  'user01-key': 'M92 48 H108',
  'key-file': 'M220 48 H248',
  'new-pfx': 'M216 184 H248',
  'pfx-file': 'M292 168 V64',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'other-note', x: 112, y: 96, anchor: 'start' },
  { id: 'no-backup-note', x: 168, y: 211, anchor: 'middle' },
  { id: 'import-note', x: 292, y: 214, anchor: 'middle' },
]

// 주인: user01이 자기 개인 키로 연다. 다른 사용자: 같은 컴퓨터의 다른 계정은 열지 못한다.
// 백업 없이 다시 설치: 같은 이름의 새 계정도 열지 못한다. 백업을 가져오면: user01.pfx의 개인 키로 다시 연다.
export const efsKeyBackupScenarios: DiagramScenario[] = [
  { id: 'owner', nodes: ['user01', 'key', 'file'], paths: ['user01-key', 'key-file'] },
  { id: 'other-user', nodes: ['other', 'file'], paths: [] },
  { id: 'no-backup', nodes: ['new-user01', 'file'], paths: [] },
  { id: 'reinstall', nodes: ['new-user01', 'pfx', 'file'], paths: ['new-pfx', 'pfx-file'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function EfsKeyBackupDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-efs-key-backup-arrow`
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
      scenarios={efsKeyBackupScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 224' : '0 0 280 304'}>
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
