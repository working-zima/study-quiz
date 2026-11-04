import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-process-boot'].diagrams['systemctl-actions']

// 세로형은 맨 위 테두리에 입력하기 전 crond의 두 상태(지금 · 부팅 때)를 두고, 그 아래에 명령마다 한 덩어리씩 쌓는다.
// 덩어리마다 명령을 가운데 두고 그 아래에 그 명령을 입력한 뒤의 두 상태를 둔다. 명령과 뒤 상태는 명령마다 다른 노드다.
const nodes = [
  { id: 'before-now', x: 8, y: 24, width: 128 },
  { id: 'before-boot', x: 144, y: 24, width: 128 },
  { id: 'cmd-start', x: 64, y: 80, width: 152 },
  { id: 'start-now', x: 8, y: 136, width: 128 },
  { id: 'start-boot', x: 144, y: 136, width: 128 },
  { id: 'cmd-enable', x: 64, y: 192, width: 152 },
  { id: 'enable-now', x: 8, y: 248, width: 128 },
  { id: 'enable-boot', x: 144, y: 248, width: 128 },
  { id: 'cmd-status', x: 64, y: 304, width: 152 },
  { id: 'status-now', x: 8, y: 360, width: 128 },
  { id: 'status-boot', x: 144, y: 360, width: 128 },
]

const groups = [
  { id: 'before', x: 4, y: 4, width: 272, height: 60, labelX: 12, labelY: 17 },
]

// 화살표는 명령의 아래 변에서 그 명령을 입력한 뒤의 두 상태로 곧게 내려간다.
const paths: Record<string, string> = {
  'start-to-now': 'M72 112 V136',
  'start-to-boot': 'M208 112 V136',
  'enable-to-now': 'M72 224 V248',
  'enable-to-boot': 'M208 224 V248',
  'status-to-now': 'M72 336 V360',
  'status-to-boot': 'M208 336 V360',
}

// 곁말은 시나리오마다 하나이고, 명령과 뒤 상태 사이의 두 화살표 가운데에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'start', x: 140, y: 128, anchor: 'middle', scenarios: ['start'] },
  { id: 'enable', x: 140, y: 240, anchor: 'middle', scenarios: ['enable'] },
  { id: 'status', x: 140, y: 352, anchor: 'middle', scenarios: ['status'] },
]

// 가로형은 왼쪽 열에 명령을, 오른쪽 두 열에 지금 상태와 부팅 때 설정을 두어 표처럼 한 줄에 한 명령을 놓는다.
// 맨 위 줄은 입력하기 전 두 상태다. 부팅 때 설정으로 가는 화살표는 명령 위쪽으로 돌아 지금 상태를 넘어간다.
const wideNodes = [
  { id: 'before-now', x: 184, y: 24, width: 112 },
  { id: 'before-boot', x: 304, y: 24, width: 128 },
  { id: 'cmd-start', x: 8, y: 88, width: 152 },
  { id: 'start-now', x: 184, y: 88, width: 112 },
  { id: 'start-boot', x: 304, y: 88, width: 128 },
  { id: 'cmd-enable', x: 8, y: 160, width: 152 },
  { id: 'enable-now', x: 184, y: 160, width: 112 },
  { id: 'enable-boot', x: 304, y: 160, width: 128 },
  { id: 'cmd-status', x: 8, y: 232, width: 152 },
  { id: 'status-now', x: 184, y: 232, width: 112 },
  { id: 'status-boot', x: 304, y: 232, width: 128 },
]

const wideGroups = [
  { id: 'before', x: 176, y: 4, width: 260, height: 60, labelX: 184, labelY: 17 },
]

const widePaths: Record<string, string> = {
  'start-to-now': 'M160 104 H184',
  'start-to-boot': 'M120 88 V76 H368 V88',
  'enable-to-now': 'M160 176 H184',
  'enable-to-boot': 'M120 160 V148 H368 V160',
  'status-to-now': 'M160 248 H184',
  'status-to-boot': 'M120 232 V220 H368 V232',
}

// 곁말의 자리만 배치마다 다르다. 가로형에서는 명령 바로 아래에 둔다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'start', x: 84, y: 134, anchor: 'middle' },
  { id: 'enable', x: 84, y: 206, anchor: 'middle' },
  { id: 'status', x: 84, y: 278, anchor: 'middle' },
]

export const systemctlActionsScenarios: DiagramScenario[] = [
  { id: 'start', nodes: ['before-now', 'before-boot', 'cmd-start', 'start-now', 'start-boot'], paths: ['start-to-now', 'start-to-boot'] },
  { id: 'enable', nodes: ['before-now', 'before-boot', 'cmd-enable', 'enable-now', 'enable-boot'], paths: ['enable-to-now', 'enable-to-boot'] },
  { id: 'status', nodes: ['before-now', 'before-boot', 'cmd-status', 'status-now', 'status-boot'], paths: ['status-to-now', 'status-to-boot'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function SystemctlActionsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-systemctl-actions-arrow`
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
      scenarios={systemctlActionsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 288' : '0 0 280 400'}>
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
