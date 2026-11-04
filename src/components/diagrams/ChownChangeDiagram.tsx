import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-permissions'].diagrams['chown-change']

// 세로형은 맨 위에 바꾸기 전 소유자와 그룹을 두고, 그 아래에 root의 명령과 그 뒤 상태를, 다시 그 아래에 user1의 두 명령과 그 뒤 상태를 쌓는다.
// 입력하는 사람은 왼쪽 열, 명령은 오른쪽 열이고, 바꾼 뒤 상태는 명령 바로 아래에 둔다. 거부되는 명령 아래에는 상태 노드를 두지 않는다. 노드는 모두 회색이다.
const nodes = [
  { id: 'before', x: 8, y: 16, width: 160 },
  { id: 'root', x: 8, y: 80, width: 56 },
  { id: 'cmd-root', x: 80, y: 80, width: 192 },
  { id: 'after-root', x: 112, y: 136, width: 160 },
  { id: 'user1', x: 8, y: 192, width: 56 },
  { id: 'cmd-deny', x: 80, y: 192, width: 192 },
  { id: 'cmd-group', x: 80, y: 248, width: 192 },
  { id: 'after-group', x: 112, y: 304, width: 160 },
]

// 화살표는 시나리오마다 보인다. 입력하는 사람 → 명령 → 바꾼 뒤 상태이고, 거부되는 명령에서는 나가는 화살표가 없다.
const paths: Record<string, string> = {
  'root-cmd': 'M64 96 H80',
  'root-after': 'M192 112 V136',
  'deny-cmd': 'M64 208 H80',
  'group-cmd': 'M36 224 V264 H80',
  'group-after': 'M192 280 V304',
}

// 바꾸기 전 곁말은 세 시나리오에 모두 보인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'before-note', x: 176, y: 36, anchor: 'start', scenarios: ['root-owner', 'owner-denied', 'owner-group'] },
  { id: 'root-after-note', x: 104, y: 156, anchor: 'end', scenarios: ['root-owner'] },
  { id: 'deny-note', x: 88, y: 240, anchor: 'start', scenarios: ['owner-denied'] },
  { id: 'group-after-note', x: 104, y: 324, anchor: 'end', scenarios: ['owner-group'] },
]

// 가로형은 왼쪽 열에 입력하는 사람, 가운데 열에 명령, 오른쪽 열에 소유자와 그룹을 둔다. 바꾸기 전 상태는 오른쪽 열 맨 위다.
const wideNodes = [
  { id: 'before', x: 272, y: 16, width: 160 },
  { id: 'root', x: 8, y: 64, width: 48 },
  { id: 'cmd-root', x: 72, y: 64, width: 184 },
  { id: 'after-root', x: 272, y: 64, width: 160 },
  { id: 'user1', x: 8, y: 120, width: 48 },
  { id: 'cmd-deny', x: 72, y: 120, width: 184 },
  { id: 'cmd-group', x: 72, y: 176, width: 184 },
  { id: 'after-group', x: 272, y: 176, width: 160 },
]

const widePaths: Record<string, string> = {
  'root-cmd': 'M56 80 H72',
  'root-after': 'M256 80 H272',
  'deny-cmd': 'M56 136 H72',
  'group-cmd': 'M32 152 V192 H72',
  'group-after': 'M256 192 H272',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'before-note', x: 264, y: 36, anchor: 'end' },
  { id: 'root-after-note', x: 352, y: 112, anchor: 'middle' },
  { id: 'deny-note', x: 272, y: 140, anchor: 'start' },
  { id: 'group-after-note', x: 352, y: 224, anchor: 'middle' },
]

// 세 시나리오는 바꾸기 전 상태만 함께 쓴다. 거부되는 시나리오에는 바꾼 뒤 상태가 없다.
export const chownChangeScenarios: DiagramScenario[] = [
  { id: 'root-owner', nodes: ['before', 'root', 'cmd-root', 'after-root'], paths: ['root-cmd', 'root-after'] },
  { id: 'owner-denied', nodes: ['before', 'user1', 'cmd-deny'], paths: ['deny-cmd'] },
  { id: 'owner-group', nodes: ['before', 'user1', 'cmd-group', 'after-group'], paths: ['group-cmd', 'group-after'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ChownChangeDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-chown-change-arrow`
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
      scenarios={chownChangeScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 232' : '0 0 280 344'}>
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
