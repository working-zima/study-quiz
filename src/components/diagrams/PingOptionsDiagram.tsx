import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['diagnostic-commands'].diagrams['ping-options']

// 세로형은 명령 줄 셋을 박스 셋으로 위아래에 둔다. 박스마다 왼쪽에 명령 줄, 오른쪽에 그 줄이 보내는 에코 요청을 위에서 아래로 쌓는다.
// 옵션 없이는 요청 넷, /n 2는 요청 둘, /t는 요청 셋 뒤에 「계속 보냄」 칸을 두어 멈추지 않고 이어진다는 것을 보인다. 노드는 모두 회색이다.
const nodes = [
  { id: 'cmd-default', x: 16, y: 28, width: 160 },
  { id: 'default-1', x: 188, y: 28, width: 76 },
  { id: 'default-2', x: 188, y: 72, width: 76 },
  { id: 'default-3', x: 188, y: 116, width: 76 },
  { id: 'default-4', x: 188, y: 160, width: 76 },
  { id: 'cmd-count', x: 16, y: 232, width: 160 },
  { id: 'count-1', x: 188, y: 232, width: 76 },
  { id: 'count-2', x: 188, y: 276, width: 76 },
  { id: 'cmd-continuous', x: 16, y: 348, width: 160 },
  { id: 'continuous-1', x: 188, y: 348, width: 76 },
  { id: 'continuous-2', x: 188, y: 392, width: 76 },
  { id: 'continuous-3', x: 188, y: 436, width: 76 },
  { id: 'continuous-more', x: 188, y: 480, width: 76 },
]

const groups = [
  { id: 'default', x: 8, y: 8, width: 264, height: 192, labelX: 16, labelY: 21 },
  { id: 'count', x: 8, y: 212, width: 264, height: 104, labelX: 16, labelY: 225 },
  { id: 'continuous', x: 8, y: 328, width: 264, height: 192, labelX: 16, labelY: 341 },
]

// 명령 줄에서 첫 요청으로, 그리고 요청에서 다음 요청으로 가는 화살표.
const paths: Record<string, string> = {
  'default-send': 'M176 44 H188',
  'default-next-2': 'M226 60 V72',
  'default-next-3': 'M226 104 V116',
  'default-next-4': 'M226 148 V160',
  'count-send': 'M176 248 H188',
  'count-next-2': 'M226 264 V276',
  'continuous-send': 'M176 364 H188',
  'continuous-next-2': 'M226 380 V392',
  'continuous-next-3': 'M226 424 V436',
  'continuous-next-more': 'M226 468 V480',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다.
const noteScenarios: Record<string, string> = {
  'default-stop': 'default',
  'count-stop': 'count',
  'continuous-stop': 'continuous',
}

// 세로형은 명령 줄 아래 빈자리, 마지막 요청의 높이에 곁말을 둔다.
const notes: Note[] = [
  { id: 'default-stop', x: 16, y: 180, anchor: 'start' },
  { id: 'count-stop', x: 16, y: 296, anchor: 'start' },
  { id: 'continuous-stop', x: 16, y: 500, anchor: 'start' },
]

// 가로형은 박스마다 명령 줄을 위에, 요청을 그 아래 한 줄에 왼쪽에서 오른쪽으로 둔다. 곁말은 마지막 요청의 오른쪽에 둔다.
const wideNodes = [
  { id: 'cmd-default', x: 16, y: 28, width: 160 },
  { id: 'default-1', x: 16, y: 72, width: 60 },
  { id: 'default-2', x: 96, y: 72, width: 60 },
  { id: 'default-3', x: 176, y: 72, width: 60 },
  { id: 'default-4', x: 256, y: 72, width: 60 },
  { id: 'cmd-count', x: 16, y: 144, width: 160 },
  { id: 'count-1', x: 16, y: 188, width: 60 },
  { id: 'count-2', x: 96, y: 188, width: 60 },
  { id: 'cmd-continuous', x: 16, y: 260, width: 160 },
  { id: 'continuous-1', x: 16, y: 304, width: 60 },
  { id: 'continuous-2', x: 96, y: 304, width: 60 },
  { id: 'continuous-3', x: 176, y: 304, width: 60 },
  { id: 'continuous-more', x: 256, y: 304, width: 72 },
]

const wideGroups = [
  { id: 'default', x: 8, y: 8, width: 424, height: 104, labelX: 16, labelY: 21 },
  { id: 'count', x: 8, y: 124, width: 424, height: 104, labelX: 16, labelY: 137 },
  { id: 'continuous', x: 8, y: 240, width: 424, height: 104, labelX: 16, labelY: 253 },
]

const widePaths: Record<string, string> = {
  'default-send': 'M46 60 V72',
  'default-next-2': 'M76 88 H96',
  'default-next-3': 'M156 88 H176',
  'default-next-4': 'M236 88 H256',
  'count-send': 'M46 176 V188',
  'count-next-2': 'M76 204 H96',
  'continuous-send': 'M46 292 V304',
  'continuous-next-2': 'M76 320 H96',
  'continuous-next-3': 'M156 320 H176',
  'continuous-next-more': 'M236 320 H256',
}

const wideNotes: Note[] = [
  { id: 'default-stop', x: 328, y: 92, anchor: 'start' },
  { id: 'count-stop', x: 168, y: 208, anchor: 'start' },
  { id: 'continuous-stop', x: 340, y: 324, anchor: 'start' },
]

export const pingOptionsScenarios: DiagramScenario[] = [
  {
    id: 'default',
    nodes: ['cmd-default', 'default-1', 'default-2', 'default-3', 'default-4'],
    paths: ['default-send', 'default-next-2', 'default-next-3', 'default-next-4'],
  },
  { id: 'count', nodes: ['cmd-count', 'count-1', 'count-2'], paths: ['count-send', 'count-next-2'] },
  {
    id: 'continuous',
    nodes: ['cmd-continuous', 'continuous-1', 'continuous-2', 'continuous-3', 'continuous-more'],
    paths: ['continuous-send', 'continuous-next-2', 'continuous-next-3', 'continuous-next-more'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PingOptionsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-ping-options-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={pingOptionsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 352' : '0 0 280 528'}>
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

          {active && layoutNotes.filter((note) => noteScenarios[note.id] === active.id).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
