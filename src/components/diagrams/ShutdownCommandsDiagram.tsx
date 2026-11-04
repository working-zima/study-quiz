import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-process-boot'].diagrams['shutdown-commands']

// 세로형은 명령 일곱을 왼쪽에 위에서 아래로 쌓고, 같은 결과를 내는 명령끼리 붙여 둔다. 결과 셋은 오른쪽에서 그 명령들의 가운데 줄에 둔다.
// 명령에서 결과로 가는 가는 화살표는 늘 보이고, 고른 시나리오의 화살표만 같은 자리에 굵게 겹쳐 그린다. 꺾이는 화살표는 두 열 사이 통로(x 136)를 쓴다.
const nodes = [
  { id: 'cmd-shutdown-h', x: 8, y: 8, width: 112 },
  { id: 'cmd-poweroff', x: 8, y: 48, width: 112 },
  { id: 'cmd-init-0', x: 8, y: 88, width: 112 },
  { id: 'cmd-halt', x: 8, y: 136, width: 112 },
  { id: 'cmd-shutdown-r', x: 8, y: 192, width: 112 },
  { id: 'cmd-reboot', x: 8, y: 232, width: 112 },
  { id: 'cmd-init-6', x: 8, y: 272, width: 112 },
  { id: 'result-off', x: 152, y: 48, width: 120 },
  { id: 'result-halt', x: 152, y: 136, width: 120 },
  { id: 'result-reboot', x: 152, y: 232, width: 120 },
]

const paths: Record<string, string> = {
  'l-shutdown-h': 'M120 24 H136 V56 H152',
  'l-poweroff': 'M120 64 H152',
  'l-init-0': 'M120 104 H136 V72 H152',
  'l-halt': 'M120 152 H152',
  'l-shutdown-r': 'M120 208 H136 V240 H152',
  'l-reboot': 'M120 248 H152',
  'l-init-6': 'M120 288 H136 V256 H152',
  'to-shutdown-h': 'M120 24 H136 V56 H152',
  'to-poweroff': 'M120 64 H152',
  'to-init-0': 'M120 104 H136 V72 H152',
  'to-halt': 'M120 152 H152',
  'to-shutdown-r': 'M120 208 H136 V240 H152',
  'to-reboot': 'M120 248 H152',
  'to-init-6': 'M120 288 H136 V256 H152',
}

const linkIds = ['l-shutdown-h', 'l-poweroff', 'l-init-0', 'l-halt', 'l-shutdown-r', 'l-reboot', 'l-init-6']

// 곁말은 시나리오마다 하나까지이고, 그 결과 노드 바로 아래 가운데에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'halt', x: 212, y: 180, anchor: 'middle', scenarios: ['halt'] },
  { id: 'reboot', x: 212, y: 278, anchor: 'middle', scenarios: ['reboot'] },
]

// 가로형은 결과 셋을 가운데 열에 두고, shutdown·init 꼴의 명령은 왼쪽에, 이름 하나뿐인 poweroff·halt·reboot는 오른쪽에 둔다.
const wideNodes = [
  { id: 'cmd-shutdown-h', x: 8, y: 8, width: 112 },
  { id: 'cmd-poweroff', x: 320, y: 28, width: 112 },
  { id: 'cmd-init-0', x: 8, y: 48, width: 112 },
  { id: 'cmd-halt', x: 320, y: 96, width: 112 },
  { id: 'cmd-shutdown-r', x: 8, y: 152, width: 112 },
  { id: 'cmd-reboot', x: 320, y: 172, width: 112 },
  { id: 'cmd-init-6', x: 8, y: 192, width: 112 },
  { id: 'result-off', x: 160, y: 28, width: 120 },
  { id: 'result-halt', x: 160, y: 96, width: 120 },
  { id: 'result-reboot', x: 160, y: 172, width: 120 },
]

const widePaths: Record<string, string> = {
  'l-shutdown-h': 'M120 24 H140 V36 H160',
  'l-poweroff': 'M320 44 H280',
  'l-init-0': 'M120 64 H140 V52 H160',
  'l-halt': 'M320 112 H280',
  'l-shutdown-r': 'M120 168 H140 V180 H160',
  'l-reboot': 'M320 188 H280',
  'l-init-6': 'M120 208 H140 V196 H160',
  'to-shutdown-h': 'M120 24 H140 V36 H160',
  'to-poweroff': 'M320 44 H280',
  'to-init-0': 'M120 64 H140 V52 H160',
  'to-halt': 'M320 112 H280',
  'to-shutdown-r': 'M120 168 H140 V180 H160',
  'to-reboot': 'M320 188 H280',
  'to-init-6': 'M120 208 H140 V196 H160',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'halt', x: 220, y: 140, anchor: 'middle' },
  { id: 'reboot', x: 220, y: 216, anchor: 'middle' },
]

export const shutdownCommandsScenarios: DiagramScenario[] = [
  { id: 'poweroff', nodes: ['cmd-shutdown-h', 'cmd-poweroff', 'cmd-init-0', 'result-off'], paths: ['to-shutdown-h', 'to-poweroff', 'to-init-0'] },
  { id: 'halt', nodes: ['cmd-halt', 'result-halt'], paths: ['to-halt'] },
  { id: 'reboot', nodes: ['cmd-shutdown-r', 'cmd-reboot', 'cmd-init-6', 'result-reboot'], paths: ['to-shutdown-r', 'to-reboot', 'to-init-6'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ShutdownCommandsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const baseId = useId()
  const arrowId = `${baseId}-shutdown-commands-arrow`
  const linkArrowId = `${baseId}-shutdown-commands-link-arrow`
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
      scenarios={shutdownCommandsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 232' : '0 0 280 312'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
            <marker id={linkArrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-muted" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {linkIds.map((id) => (
            <path
              key={id}
              data-link={id}
              d={layoutPaths[id]}
              className="fill-none stroke-muted"
              strokeWidth="1.5"
              strokeLinejoin="round"
              markerEnd={`url(#${linkArrowId})`}
            />
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
