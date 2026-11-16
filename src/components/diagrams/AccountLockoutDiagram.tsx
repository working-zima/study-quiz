import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-ad'].diagrams['account-lockout']

// 세로형은 맨 위 박스에 틀린 횟수 1회~5회를 한 줄로 놓고, 5회 아래에 계정 잠김을, 그 아래에 다시 로그온을 둔다.
// 칸의 수는 본문 예의 계정 잠금 임계값(5회)과 같다.
const nodes = [
  { id: 'fail-1', x: 16, y: 24, width: 40 },
  { id: 'fail-2', x: 68, y: 24, width: 40 },
  { id: 'fail-3', x: 120, y: 24, width: 40 },
  { id: 'fail-4', x: 172, y: 24, width: 40 },
  { id: 'fail-5', x: 224, y: 24, width: 40 },
  { id: 'locked', x: 188, y: 100, width: 80 },
  { id: 'relogon', x: 188, y: 172, width: 80 },
]

const groups = [
  { id: 'failures', x: 4, y: 4, width: 272, height: 64, labelX: 12, labelY: 17 },
]

// 5회에서 잠김으로 가는 화살표는 잠기는 때를, 잠김에서 다시 로그온으로 가는 화살표는 잠금이 풀리는 때를 가리킨다.
const paths: Record<string, string> = {
  'fail-locked': 'M244 56 V100',
  'locked-relogon': 'M228 132 V172',
}

// 「아직 다시 시도할 수 있다」는 박스 아래 왼쪽에, 잠김의 두 곁말은 잠김 노드 왼쪽에, 「30분이 지나면」은 풀리는 화살표 왼쪽에 놓인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'retry-note', x: 16, y: 84, anchor: 'start', scenarios: ['before'] },
  { id: 'duration-note', x: 180, y: 113, anchor: 'end', scenarios: ['locked'] },
  { id: 'reject-note', x: 180, y: 127, anchor: 'end', scenarios: ['locked'] },
  { id: 'unlock-note', x: 220, y: 156, anchor: 'end', scenarios: ['after'] },
]

// 가로형은 틀린 횟수 박스, 계정 잠김, 다시 로그온을 왼쪽에서 오른쪽으로 한 줄에 놓는다.
const wideNodes = [
  { id: 'fail-1', x: 20, y: 44, width: 36 },
  { id: 'fail-2', x: 64, y: 44, width: 36 },
  { id: 'fail-3', x: 108, y: 44, width: 36 },
  { id: 'fail-4', x: 152, y: 44, width: 36 },
  { id: 'fail-5', x: 196, y: 44, width: 36 },
  { id: 'locked', x: 268, y: 44, width: 68 },
  { id: 'relogon', x: 356, y: 44, width: 80 },
]

const wideGroups = [
  { id: 'failures', x: 8, y: 24, width: 228, height: 60, labelX: 16, labelY: 37 },
]

const widePaths: Record<string, string> = {
  'fail-locked': 'M232 60 H268',
  'locked-relogon': 'M336 60 H356',
}

// 곁말의 자리만 배치마다 다르다. 잠김의 두 곁말은 잠김 노드 아래에, 「30분이 지나면」은 풀리는 화살표 위에 놓인다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'retry-note', x: 16, y: 100, anchor: 'start' },
  { id: 'duration-note', x: 302, y: 88, anchor: 'middle' },
  { id: 'reject-note', x: 302, y: 100, anchor: 'middle' },
  { id: 'unlock-note', x: 346, y: 36, anchor: 'middle' },
]

// 임계값 전: 1회~4회. 잠김: 5회와 계정 잠김. 기간 뒤: 계정 잠김과 다시 로그온.
export const accountLockoutScenarios: DiagramScenario[] = [
  { id: 'before', nodes: ['fail-1', 'fail-2', 'fail-3', 'fail-4'], paths: [] },
  { id: 'locked', nodes: ['fail-5', 'locked'], paths: ['fail-locked'] },
  { id: 'after', nodes: ['locked', 'relogon'], paths: ['locked-relogon'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function AccountLockoutDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-account-lockout-arrow`
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
      scenarios={accountLockoutScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 108' : '0 0 280 212'}>
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
