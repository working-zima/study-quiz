import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-permissions'].diagrams['chmod-change']

// 세로형은 위에 숫자로 바꾸는 명령을, 아래에 -R로 바꾸는 명령을 둔다. 위에서는 바꾸기 전 권한(왼쪽)과 바꾼 뒤 권한(오른쪽)을 나란히 두고
// 그 사이 아래에 명령을 둔다. 아래에서는 명령 밑에 project와 그 안의 것 테두리를 두고, 그 안에 project에서 readme.txt와 src로 가지를 낸다.
// 두 명령의 노드는 서로 다른 자리에 따로 있다. 노드는 모두 회색이다.
const nodes = [
  { id: 'before', x: 8, y: 24, width: 96 },
  { id: 'cmd-numeric', x: 68, y: 72, width: 144 },
  { id: 'after', x: 176, y: 24, width: 96 },
  { id: 'cmd-recursive', x: 8, y: 128, width: 152 },
  { id: 'dir-project', x: 24, y: 212, width: 72 },
  { id: 'file-readme', x: 136, y: 196, width: 88 },
  { id: 'dir-src', x: 136, y: 240, width: 88 },
]

// 테두리의 라벨은 오른쪽 위에 두어, 명령에서 project로 내려가는 화살표가 지나지 않게 한다.
const groups = [
  { id: 'project', x: 8, y: 176, width: 264, height: 104, labelX: 136, labelY: 190 },
]

// 화살표는 시나리오마다 보인다. 숫자로 바꿀 때는 바꾸기 전 → 명령 → 바꾼 뒤, -R일 때는 명령 → project다.
const paths: Record<string, string> = {
  'to-command': 'M56 56 V88 H68',
  'to-after': 'M212 88 H224 V56',
  'to-project': 'M60 160 V212',
  'b-readme': 'M96 228 H116 V212 H136',
  'b-src': 'M96 228 H116 V256 H136',
}

// project에서 그 안의 것으로 가는 가지는 늘 보인다.
const linkIds = ['b-readme', 'b-src']

const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'before-note', x: 56, y: 18, anchor: 'middle', scenarios: ['numeric'] },
  { id: 'after-note', x: 224, y: 18, anchor: 'middle', scenarios: ['numeric'] },
  { id: 'all-note', x: 168, y: 148, anchor: 'start', scenarios: ['recursive'] },
]

// 가로형은 위 줄에 바꾸기 전 → 명령 → 바꾼 뒤를 한 줄로 두고, 아래 줄에 명령과 그 오른쪽의 project 테두리를 둔다.
const wideNodes = [
  { id: 'before', x: 8, y: 24, width: 96 },
  { id: 'cmd-numeric', x: 128, y: 24, width: 160 },
  { id: 'after', x: 312, y: 24, width: 96 },
  { id: 'cmd-recursive', x: 8, y: 120, width: 152 },
  { id: 'dir-project', x: 200, y: 120, width: 80 },
  { id: 'file-readme', x: 320, y: 100, width: 96 },
  { id: 'dir-src', x: 320, y: 148, width: 96 },
]

const wideGroups = [
  { id: 'project', x: 184, y: 76, width: 248, height: 112, labelX: 192, labelY: 90 },
]

const widePaths: Record<string, string> = {
  'to-command': 'M104 40 H128',
  'to-after': 'M288 40 H312',
  'to-project': 'M160 136 H200',
  'b-readme': 'M280 136 H300 V116 H320',
  'b-src': 'M280 136 H300 V164 H320',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'before-note', x: 56, y: 18, anchor: 'middle' },
  { id: 'after-note', x: 360, y: 18, anchor: 'middle' },
  { id: 'all-note', x: 84, y: 172, anchor: 'middle' },
]

// nodes에는 선명하게 둘 노드와 가지를 함께 적는다. 두 시나리오는 서로 다른 노드를 쓴다.
export const chmodChangeScenarios: DiagramScenario[] = [
  { id: 'numeric', nodes: ['before', 'cmd-numeric', 'after'], paths: ['to-command', 'to-after'] },
  { id: 'recursive', nodes: ['cmd-recursive', 'dir-project', 'file-readme', 'dir-src', 'b-readme', 'b-src'], paths: ['to-project'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ChmodChangeDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-chmod-change-arrow`
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
      scenarios={chmodChangeScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 196' : '0 0 280 288'}>
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
            <path key={id} data-link={id} d={layoutPaths[id]} className="fill-none stroke-muted" strokeWidth="1.5" opacity={opacityOf(id)} />
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
