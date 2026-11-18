import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-hyperv'].diagrams['checkpoint-apply']

// 세로형은 왼쪽 열에 한 가상 컴퓨터의 때마다 다른 상태를 위에서 아래로 둔다 — 업데이트 전, 업데이트 뒤, 적용 뒤.
// 검사점은 업데이트 전 상태의 오른쪽에 두고, 적용 화살표는 검사점에서 내려와 적용 뒤 상태의 오른쪽 변으로 들어간다.
// 적용 뒤 상태는 업데이트 전 상태와 다른 노드를 다른 자리에 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'before', x: 16, y: 32, width: 120 },
  { id: 'checkpoint', x: 176, y: 32, width: 88 },
  { id: 'after', x: 16, y: 112, width: 120 },
  { id: 'restored', x: 16, y: 192, width: 120 },
]

const paths: Record<string, string> = {
  'before-checkpoint': 'M136 48 H176',
  'before-after': 'M76 64 V112',
  'checkpoint-restored': 'M220 64 V208 H136',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다. 만들기는 검사점 위, 업데이트는 업데이트 뒤 상태의 오른쪽,
// 적용은 적용 화살표의 꺾이는 자리 위와 적용 뒤 상태 아래에 둔다.
const noteScenarios: Record<string, string> = {
  'create-note': 'create',
  'update-note': 'update',
  'apply-note': 'apply',
  'restored-note': 'apply',
}

const notes: Note[] = [
  { id: 'create-note', x: 264, y: 21, anchor: 'end' },
  { id: 'update-note', x: 144, y: 132, anchor: 'start' },
  { id: 'apply-note', x: 212, y: 184, anchor: 'end' },
  { id: 'restored-note', x: 16, y: 240, anchor: 'start' },
]

// 가로형은 세 상태를 한 줄에 왼쪽에서 오른쪽으로 두고, 검사점을 업데이트 전 상태 아래에 둔다.
// 적용 화살표는 검사점의 오른쪽 변에서 나와 업데이트 뒤 상태 아래를 지나 적용 뒤 상태의 아래 변으로 올라간다.
const wideNodes = [
  { id: 'before', x: 16, y: 48, width: 120 },
  { id: 'checkpoint', x: 16, y: 128, width: 120 },
  { id: 'after', x: 160, y: 48, width: 120 },
  { id: 'restored', x: 304, y: 48, width: 120 },
]

const widePaths: Record<string, string> = {
  'before-checkpoint': 'M76 80 V128',
  'before-after': 'M136 64 H160',
  'checkpoint-restored': 'M136 144 H364 V80',
}

const wideNotes: Note[] = [
  { id: 'create-note', x: 16, y: 180, anchor: 'start' },
  { id: 'update-note', x: 220, y: 37, anchor: 'middle' },
  { id: 'apply-note', x: 160, y: 136, anchor: 'start' },
  { id: 'restored-note', x: 424, y: 37, anchor: 'end' },
]

// 만들기: 업데이트 전 상태를 검사점에 저장한다. 업데이트: 업데이트 전 상태가 업데이트 뒤 상태가 된다.
// 적용: 업데이트 뒤 상태에서 검사점을 적용하면 검사점이 저장한 상태가 적용 뒤 상태가 된다.
export const checkpointApplyScenarios: DiagramScenario[] = [
  { id: 'create', nodes: ['before', 'checkpoint'], paths: ['before-checkpoint'] },
  { id: 'update', nodes: ['before', 'after'], paths: ['before-after'] },
  { id: 'apply', nodes: ['checkpoint', 'after', 'restored'], paths: ['checkpoint-restored'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function CheckpointApplyDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-checkpoint-apply-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={checkpointApplyScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 192' : '0 0 280 248'}>
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
