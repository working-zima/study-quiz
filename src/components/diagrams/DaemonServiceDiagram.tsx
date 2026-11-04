import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-process-boot'].diagrams['daemon-service']

// 세로형은 왼쪽 열에 관리자와 그 아래 PID 1 systemd를, 오른쪽 열에 다른 컴퓨터와 그 아래 sshd를 둔다.
// sshd를 켜는 화살표는 늘 systemd에서 나온다. 관리자의 화살표는 systemd에서 끝나고 sshd로 바로 가지 않는다.
const nodes = [
  { id: 'admin', x: 8, y: 8, width: 120 },
  { id: 'pid1', x: 8, y: 80, width: 120 },
  { id: 'sshd', x: 152, y: 80, width: 120 },
  { id: 'remote', x: 152, y: 8, width: 120 },
]

const paths: Record<string, string> = {
  'start-path': 'M128 96 H152',
  'request-path': 'M68 40 V80',
  'connect-path': 'M212 40 V80',
}

// 곁말은 시나리오마다 하나다. 부팅 때와 요청 기다리기는 아래에, systemctl 요청은 관리자의 화살표 옆에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'boot', x: 140, y: 136, anchor: 'middle', scenarios: ['boot'] },
  { id: 'manual', x: 76, y: 64, anchor: 'start', scenarios: ['manual'] },
  { id: 'waiting', x: 140, y: 136, anchor: 'middle', scenarios: ['waiting'] },
]

// 가로형은 systemd에서 sshd로 가는 화살표를 가로로 길게 두고, 다른 컴퓨터를 sshd 오른쪽에 둔다.
const wideNodes = [
  { id: 'admin', x: 16, y: 8, width: 120 },
  { id: 'pid1', x: 16, y: 72, width: 120 },
  { id: 'sshd', x: 200, y: 72, width: 120 },
  { id: 'remote', x: 336, y: 72, width: 96 },
]

const widePaths: Record<string, string> = {
  'start-path': 'M136 88 H200',
  'request-path': 'M76 40 V72',
  'connect-path': 'M336 88 H320',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'boot', x: 168, y: 128, anchor: 'middle' },
  { id: 'manual', x: 84, y: 60, anchor: 'start' },
  { id: 'waiting', x: 328, y: 128, anchor: 'middle' },
]

export const daemonServiceScenarios: DiagramScenario[] = [
  { id: 'boot', nodes: ['pid1', 'sshd'], paths: ['start-path'] },
  { id: 'manual', nodes: ['admin', 'pid1', 'sshd'], paths: ['request-path', 'start-path'] },
  { id: 'waiting', nodes: ['remote', 'sshd'], paths: ['connect-path'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function DaemonServiceDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-daemon-service-arrow`
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
      scenarios={daemonServiceScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 140' : '0 0 280 148'}>
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
