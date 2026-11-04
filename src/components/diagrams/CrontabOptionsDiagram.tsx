import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-process-boot'].diagrams['crontab-options']

// 세로형은 맨 위 테두리에 입력하기 전 user1의 crontab 두 줄을 두고, 그 아래에 옵션마다 한 덩어리씩 쌓는다.
// -l은 명령 아래에 그 뒤의 crontab 두 줄을, -e는 명령 아래에 편집기를 둔다. -r 아래에는 남는 줄이 없어 곁말만 나온다.
const nodes = [
  { id: 'before-backup', x: 28, y: 28, width: 224 },
  { id: 'before-report', x: 28, y: 60, width: 224 },
  { id: 'cmd-list', x: 76, y: 116, width: 128 },
  { id: 'list-backup', x: 28, y: 172, width: 224 },
  { id: 'list-report', x: 28, y: 204, width: 224 },
  { id: 'cmd-edit', x: 76, y: 256, width: 128 },
  { id: 'editor', x: 92, y: 312, width: 96 },
  { id: 'cmd-remove', x: 76, y: 364, width: 128 },
]

const groups = [
  { id: 'before', x: 8, y: 8, width: 264, height: 92, labelX: 16, labelY: 22 },
]

// 화살표는 명령의 아래 변에서 그 명령을 입력한 뒤의 결과로 곧게 내려간다.
const paths: Record<string, string> = {
  'list-path': 'M140 148 V172',
  'edit-path': 'M140 288 V312',
}

// 곁말은 시나리오마다 하나다. -l·-e는 화살표 오른쪽, -r은 명령 바로 아래에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'list', x: 148, y: 162, anchor: 'start', scenarios: ['list'] },
  { id: 'edit', x: 148, y: 302, anchor: 'start', scenarios: ['edit'] },
  { id: 'remove', x: 140, y: 420, anchor: 'middle', scenarios: ['remove'] },
]

// 가로형은 왼쪽 열에 명령을, 오른쪽에 결과를 두어 한 줄에 옵션 하나를 놓는다.
// 입력하기 전 두 줄은 -l 뒤의 두 줄 바로 위에 두어, 같은 줄이 그대로 남는다는 것이 위아래로 비교되게 한다.
const wideNodes = [
  { id: 'before-backup', x: 160, y: 28, width: 224 },
  { id: 'before-report', x: 160, y: 60, width: 224 },
  { id: 'cmd-list', x: 8, y: 120, width: 112 },
  { id: 'list-backup', x: 160, y: 120, width: 224 },
  { id: 'list-report', x: 160, y: 152, width: 224 },
  { id: 'cmd-edit', x: 8, y: 208, width: 112 },
  { id: 'editor', x: 160, y: 208, width: 96 },
  { id: 'cmd-remove', x: 8, y: 264, width: 112 },
]

const wideGroups = [
  { id: 'before', x: 152, y: 8, width: 240, height: 92, labelX: 160, labelY: 22 },
]

const widePaths: Record<string, string> = {
  'list-path': 'M120 136 H160',
  'edit-path': 'M120 224 H160',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'list', x: 64, y: 172, anchor: 'middle' },
  { id: 'edit', x: 264, y: 228, anchor: 'start' },
  { id: 'remove', x: 132, y: 284, anchor: 'start' },
]

export const crontabOptionsScenarios: DiagramScenario[] = [
  { id: 'list', nodes: ['before-backup', 'before-report', 'cmd-list', 'list-backup', 'list-report'], paths: ['list-path'] },
  { id: 'edit', nodes: ['before-backup', 'before-report', 'cmd-edit', 'editor'], paths: ['edit-path'] },
  { id: 'remove', nodes: ['before-backup', 'before-report', 'cmd-remove'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function CrontabOptionsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-crontab-options-arrow`
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
      scenarios={crontabOptionsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 304' : '0 0 280 428'}>
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
