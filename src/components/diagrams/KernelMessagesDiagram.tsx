import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-process-boot'].diagrams['kernel-messages']

// 세로형은 위에 커널, 가운데 테두리 링 버퍼 안에 메시지 셋을 나란히, 아래에 dmesg와 터미널을 둔다.
// 커널에서 메시지로 가는 선은 위에서, 메시지에서 dmesg로 가는 선은 아래에서 나간다. 그룹 라벨은 위쪽 선 사이에 둔다.
const nodes = [
  { id: 'kernel', x: 92, y: 8, width: 96 },
  { id: 'info', x: 16, y: 88, width: 76 },
  { id: 'warn', x: 102, y: 88, width: 76 },
  { id: 'err', x: 188, y: 88, width: 76 },
  { id: 'dmesg', x: 104, y: 152, width: 72 },
  { id: 'terminal', x: 104, y: 216, width: 72 },
]

const groups = [
  { id: 'buffer', x: 8, y: 64, width: 264, height: 68, labelX: 40, labelY: 79 },
]

const paths: Record<string, string> = {
  'write-info': 'M104 40 V56 H28 V88',
  'write-warn': 'M140 40 V88',
  'write-err': 'M176 40 V56 H252 V88',
  'read-info': 'M54 120 V140 H116 V152',
  'read-warn': 'M140 120 V152',
  'read-err': 'M226 120 V140 H164 V152',
  'show': 'M140 184 V216',
}

// 곁말은 오류·경고만 고를 때 dmesg 오른쪽에 붙는 옵션 하나다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'level', x: 184, y: 172, anchor: 'start', scenarios: ['level'] },
]

// 가로형은 왼쪽에서 오른쪽으로 커널 → 링 버퍼(메시지 셋을 세로로) → dmesg → 터미널을 한 줄에 둔다.
const wideNodes = [
  { id: 'kernel', x: 8, y: 84, width: 64 },
  { id: 'info', x: 112, y: 40, width: 104 },
  { id: 'warn', x: 112, y: 84, width: 104 },
  { id: 'err', x: 112, y: 128, width: 104 },
  { id: 'dmesg', x: 264, y: 84, width: 64 },
  { id: 'terminal', x: 352, y: 84, width: 80 },
]

const wideGroups = [
  { id: 'buffer', x: 96, y: 8, width: 136, height: 164, labelX: 108, labelY: 23 },
]

const widePaths: Record<string, string> = {
  'write-info': 'M72 92 H88 V56 H112',
  'write-warn': 'M72 100 H112',
  'write-err': 'M72 108 H88 V144 H112',
  'read-info': 'M216 56 H240 V92 H264',
  'read-warn': 'M216 100 H264',
  'read-err': 'M216 144 H240 V108 H264',
  'show': 'M328 100 H352',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'level', x: 296, y: 140, anchor: 'middle' },
]

export const kernelMessagesScenarios: DiagramScenario[] = [
  { id: 'write', nodes: ['kernel', 'info', 'warn', 'err'], paths: ['write-info', 'write-warn', 'write-err'] },
  { id: 'read', nodes: ['info', 'warn', 'err', 'dmesg', 'terminal'], paths: ['read-info', 'read-warn', 'read-err', 'show'] },
  { id: 'level', nodes: ['warn', 'err', 'dmesg', 'terminal'], paths: ['read-warn', 'read-err', 'show'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function KernelMessagesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-kernel-messages-arrow`
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
      scenarios={kernelMessagesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 180' : '0 0 280 256'}>
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
