import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-process-boot'].diagrams['cron-schedule']

// 세로형은 위에 user1, 가운데 테두리 user1의 crontab 안에 예약 줄 하나, 아래에 crond와 그 오른쪽의 backup.sh를 둔다.
// user1은 줄을 적어 두고(아래로), crond는 줄을 살피며(위로), 때가 되면 backup.sh를 실행한다(오른쪽으로).
const nodes = [
  { id: 'user', x: 28, y: 16, width: 88 },
  { id: 'line', x: 28, y: 88, width: 224 },
  { id: 'crond', x: 28, y: 168, width: 88 },
  { id: 'backup', x: 164, y: 168, width: 88 },
]

// 테두리의 라벨은 오른쪽 위에 두어, user1에서 줄로 내려가는 화살표가 지나지 않게 한다.
const groups = [
  { id: 'crontab', x: 20, y: 68, width: 240, height: 64, labelX: 152, labelY: 81 },
]

const paths: Record<string, string> = {
  'register-path': 'M72 48 V88',
  'check-path': 'M72 168 V120',
  'run-path': 'M116 184 H164',
}

// 곁말은 시나리오마다 하나다. 적어 두기는 user1 오른쪽, 살피기는 crond의 화살표 옆, 실행하기는 맨 아래에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'register', x: 128, y: 36, anchor: 'start', scenarios: ['register'] },
  { id: 'check', x: 80, y: 148, anchor: 'start', scenarios: ['check'] },
  { id: 'run', x: 140, y: 216, anchor: 'middle', scenarios: ['run'] },
]

// 가로형은 user1 → crontab의 줄 ← crond를 한 줄에 두고, backup.sh를 crond 바로 아래에 둔다.
const wideNodes = [
  { id: 'user', x: 8, y: 48, width: 72 },
  { id: 'line', x: 112, y: 48, width: 224 },
  { id: 'crond', x: 368, y: 48, width: 64 },
  { id: 'backup', x: 352, y: 120, width: 80 },
]

const wideGroups = [
  { id: 'crontab', x: 104, y: 24, width: 240, height: 72, labelX: 112, labelY: 37 },
]

const widePaths: Record<string, string> = {
  'register-path': 'M80 64 H112',
  'check-path': 'M368 64 H336',
  'run-path': 'M400 80 V120',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'register', x: 8, y: 108, anchor: 'start' },
  { id: 'check', x: 400, y: 36, anchor: 'middle' },
  { id: 'run', x: 344, y: 140, anchor: 'end' },
]

export const cronScheduleScenarios: DiagramScenario[] = [
  { id: 'register', nodes: ['user', 'line'], paths: ['register-path'] },
  { id: 'check', nodes: ['crond', 'line'], paths: ['check-path'] },
  { id: 'run', nodes: ['crond', 'backup'], paths: ['run-path'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function CronScheduleDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-cron-schedule-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
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
      scenarios={cronScheduleScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 160' : '0 0 280 224'}>
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

          {active && layoutNotes.filter((note) => note.scenarios.includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
